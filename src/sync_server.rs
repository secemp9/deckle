// WebSocket sync server with merged localhost HTTP routes on port 8080.
//
// Replaces: local-server/sync-server.js (~489 lines)
//
// Provides a WebSocket endpoint at `/sync/{fileId}?tabId={tabId}` plus the
// shared localhost HTTP surface that the current desktop bundle calls.
// In single-user offline mode this applies edits to the in-memory file state
// and persists to disk with a 500ms debounce.

use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Duration;

use axum::extract::ws::{Message, WebSocket};
use axum::extract::{Path, Query, State, WebSocketUpgrade};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{Json, Router};
use serde::Deserialize;
use tokio::sync::RwLock;

use crate::file_store::{FileStore, SCRATCHPAD_FILE_ID};
use crate::types::{
    create_empty_file, now_millis, PongMsg, UsersAlreadyInFileMsg, ALLOWED_ORIGIN, TEAM_ID, USER_ID,
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEBOUNCE_MS: u64 = 500;

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------

/// In-memory file cache shared across all WebSocket connections.
/// Maps file_id -> serde_json::Value of the full file document.
type FileCache = Arc<RwLock<HashMap<String, serde_json::Value>>>;

/// Per-file debounce state for timer-based flush scheduling (matches Node.js
/// behavior where each file has its own setTimeout).
#[derive(Clone, Default)]
struct DirtyEntry {
    dirty: bool,
    timer_active: bool,
}

/// Tracks per-file debounce state for debounced persistence.
/// Maps file_id -> DirtyEntry.
type DirtyTracker = Arc<RwLock<HashMap<String, DirtyEntry>>>;

/// Tracks the number of active WebSocket connections per file_id.
/// When the count drops to zero the cached file data can be evicted.
type ConnectionCounter = Arc<RwLock<HashMap<String, usize>>>;

/// Sequential client index counter (shared across all connections).
static NEXT_CLIENT_INDEX: AtomicU64 = AtomicU64::new(1);

/// Combined server state passed to each handler.
#[derive(Clone)]
struct SyncState {
    store: FileStore,
    cache: FileCache,
    dirty: DirtyTracker,
    /// Number of active WebSocket connections per file.
    connections: ConnectionCounter,
}

// ---------------------------------------------------------------------------
// Query parameters
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
struct SyncQuery {
    #[serde(rename = "tabId")]
    #[allow(dead_code)]
    tab_id: Option<String>,
}

// ---------------------------------------------------------------------------
// Path helpers (JSON Pointer-like)
// ---------------------------------------------------------------------------

/// Parse a slash-separated path string into segments.
/// Strips leading "/" if present.
fn parse_path(path: &str) -> Vec<&str> {
    let path = path.strip_prefix('/').unwrap_or(path);
    if path.is_empty() {
        return vec![];
    }
    path.split('/').collect()
}

// ---------------------------------------------------------------------------
// Edit engine — operates on serde_json::Value trees
// ---------------------------------------------------------------------------

/// "add" or "update": navigate to path[0..n-1], set path[n] = value.
/// For "add": creates intermediate objects (or arrays if next segment is numeric).
/// For "update": bails silently if any intermediate is missing.
fn deep_set_value(obj: &mut serde_json::Value, path: &str, value: serde_json::Value, is_add: bool) {
    let segments = parse_path(path);
    if segments.is_empty() {
        return;
    }

    let mut current = obj;

    // Navigate to the parent of the target
    for i in 0..segments.len() - 1 {
        let seg = segments[i];
        let next_seg = segments.get(i + 1).copied().unwrap_or("");

        let is_array = current.is_array();
        let is_object = current.is_object();

        if is_array {
            let arr = current.as_array_mut().unwrap();
            if let Ok(idx) = seg.parse::<usize>() {
                if idx < arr.len() {
                    current = &mut arr[idx];
                    continue;
                }
            }
            return;
        } else if is_object {
            let map = current.as_object_mut().unwrap();
            if !map.contains_key(seg) {
                if is_add {
                    let intermediate = if next_seg.parse::<usize>().is_ok() {
                        serde_json::Value::Array(vec![])
                    } else {
                        serde_json::Value::Object(serde_json::Map::new())
                    };
                    map.insert(seg.to_string(), intermediate);
                } else {
                    return;
                }
            }
            current = map.get_mut(seg).unwrap();
        } else {
            return;
        }
    }

    let last_seg = segments[segments.len() - 1];

    // Handle "-" on array (push)
    if last_seg == "-" && current.is_array() {
        current.as_array_mut().unwrap().push(value);
        return;
    }

    if current.is_array() {
        let arr = current.as_array_mut().unwrap();
        if let Ok(idx) = last_seg.parse::<usize>() {
            if idx < arr.len() {
                arr[idx] = value;
            }
        }
    } else if current.is_object() {
        current
            .as_object_mut()
            .unwrap()
            .insert(last_seg.to_string(), value);
    }
}

/// "remove": navigate to path[0..n-1], then soft-delete or hard-delete path[n].
/// If the target has a "~" field, sets it to true (soft delete).
/// Otherwise, removes the key entirely.
fn deep_delete(obj: &mut serde_json::Value, path: &str) {
    let segments = parse_path(path);
    if segments.is_empty() {
        return;
    }

    let mut current = obj;

    // Navigate to the parent of the target
    for i in 0..segments.len() - 1 {
        let seg = segments[i];

        let is_array = current.is_array();
        let is_object = current.is_object();

        if is_array {
            let arr = current.as_array_mut().unwrap();
            if let Ok(idx) = seg.parse::<usize>() {
                if idx < arr.len() {
                    current = &mut arr[idx];
                    continue;
                }
            }
            return;
        } else if is_object {
            let map = current.as_object_mut().unwrap();
            if !map.contains_key(seg) {
                return;
            }
            current = map.get_mut(seg).unwrap();
        } else {
            return;
        }
    }

    let last_seg = segments[segments.len() - 1];

    // Get the target value to check for soft-delete marker.
    // Works for both object keys and array indices.
    let target_ref: Option<&serde_json::Value> = if current.is_object() {
        current.as_object().unwrap().get(last_seg)
    } else if current.is_array() {
        last_seg
            .parse::<usize>()
            .ok()
            .and_then(|idx| current.as_array().unwrap().get(idx))
    } else {
        None
    };

    let should_soft_delete = target_ref
        .map(|v| v.is_object() && v.as_object().unwrap().contains_key("~"))
        .unwrap_or(false);

    if should_soft_delete {
        // Soft delete: set "~" to true on the target object
        let target = if current.is_object() {
            current.as_object_mut().unwrap().get_mut(last_seg)
        } else if current.is_array() {
            last_seg
                .parse::<usize>()
                .ok()
                .and_then(|idx| current.as_array_mut().unwrap().get_mut(idx))
        } else {
            None
        };
        if let Some(target) = target {
            if let Some(target_map) = target.as_object_mut() {
                target_map.insert("~".to_string(), serde_json::Value::Bool(true));
            }
        }
    } else if current.is_object() {
        // Hard delete: remove the key entirely
        current.as_object_mut().unwrap().remove(last_seg);
    }
    // Note: for arrays without soft-delete, the JS uses `delete` which sets
    // the element to undefined. In our case we don't handle that since Deckle
    // files always use soft-delete for array items (pages).
}

/// "splice": navigate to path[0..n-1], then treat path[n] as a numeric index
/// into an array. Splice at that position: remove `removed_count` elements
/// and insert `added` elements.
fn deep_splice(
    obj: &mut serde_json::Value,
    path: &str,
    removed_count: usize,
    added: Vec<serde_json::Value>,
) {
    let segments = parse_path(path);
    if segments.is_empty() {
        return;
    }

    let mut current = obj;

    // Navigate to the parent (all segments except the last)
    for i in 0..segments.len() - 1 {
        let seg = segments[i];

        let is_array = current.is_array();
        let is_object = current.is_object();

        if is_array {
            let arr = current.as_array_mut().unwrap();
            if let Ok(idx) = seg.parse::<usize>() {
                if idx < arr.len() {
                    current = &mut arr[idx];
                    continue;
                }
            }
            return;
        } else if is_object {
            let map = current.as_object_mut().unwrap();
            if !map.contains_key(seg) {
                return;
            }
            current = map.get_mut(seg).unwrap();
        } else {
            return;
        }
    }

    let last_seg = segments[segments.len() - 1];

    // The last segment is the numeric index into the array `current`.
    // JS Array.splice clamps the start index to [0, arr.length], so we
    // must do the same to avoid panics on out-of-bounds indices.
    if let Some(arr) = current.as_array_mut() {
        if let Ok(raw_index) = last_seg.parse::<usize>() {
            // Clamp start index to array length (matches JS splice behavior)
            let index = std::cmp::min(raw_index, arr.len());
            // Clamp the remove range to array bounds
            let end = std::cmp::min(index + removed_count, arr.len());
            let drain_range = index..end;

            // Remove elements
            arr.drain(drain_range);

            // Insert added elements at the index
            for (offset, item) in added.into_iter().enumerate() {
                let insert_pos = std::cmp::min(index + offset, arr.len());
                arr.insert(insert_pos, item);
            }
        }
    }
}

/// Apply a single edit operation to the file data.
fn apply_edit(file_data: &mut serde_json::Value, edit: &serde_json::Value) {
    let edit_type = match edit.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return,
    };

    let path = match edit.get("path").and_then(|p| p.as_str()) {
        Some(p) => p,
        None => return,
    };

    match edit_type {
        "add" => {
            if let Some(value) = edit.get("value") {
                deep_set_value(file_data, path, value.clone(), true);
            }
        }
        "update" => {
            if let Some(value) = edit.get("value") {
                deep_set_value(file_data, path, value.clone(), false);
            }
        }
        "remove" => {
            deep_delete(file_data, path);
        }
        "splice" => {
            let removed_count = edit
                .get("removedCount")
                .and_then(|v| v.as_u64())
                .unwrap_or(0) as usize;
            let added = edit
                .get("added")
                .and_then(|v| v.as_array())
                .cloned()
                .unwrap_or_default();
            deep_splice(file_data, path, removed_count, added);
        }
        other => {
            tracing::debug!("Unknown edit type: {}", other);
        }
    }
}

// ---------------------------------------------------------------------------
// File cache management
// ---------------------------------------------------------------------------

/// Load a file into the cache (from disk or create empty), return a clone.
async fn get_file_data(state: &SyncState, file_id: &str) -> serde_json::Value {
    // Check cache first
    {
        let cache = state.cache.read().await;
        if let Some(data) = cache.get(file_id) {
            return data.clone();
        }
    }

    // Not in cache — load from disk or create new
    let data = if file_id == SCRATCHPAD_FILE_ID {
        let data = state.store.load_user_scratchpad_file();
        tracing::info!("[file] Loaded personal Scratchpad: {}", file_id);
        data
    } else {
        match state.store.load_file(file_id) {
            Some(data) => {
                tracing::info!("[file] Loaded from disk: {}", file_id);
                data
            }
            None => {
                // Create new empty file
                let file = create_empty_file(file_id, TEAM_ID, USER_ID);
                // FileData always serializes to a valid Value — cannot fail.
                let value = serde_json::to_value(&file)
                    .expect("BUG: FileData failed to serialize to Value");
                state.store.save_file(file_id, &value);
                tracing::info!("[file] Created new file: {}", file_id);
                value
            }
        }
    };

    // Insert into cache
    {
        let mut cache = state.cache.write().await;
        cache.insert(file_id.to_string(), data.clone());
    }

    data
}

/// Mark a file as dirty and schedule a debounced flush.
///
/// Matches Node.js `markDirty` exactly:
/// - Sets `dirty = true` on the per-file entry.
/// - Only spawns a timer task if one is NOT already running (same as
///   Node.js `if (!entry.timer)` check). Subsequent edits while a timer
///   is pending do NOT reset the timer.
async fn mark_dirty(state: &SyncState, file_id: &str) {
    let should_spawn = {
        let mut dirty = state.dirty.write().await;
        let entry = dirty.entry(file_id.to_string()).or_default();
        entry.dirty = true;
        if !entry.timer_active {
            entry.timer_active = true;
            true
        } else {
            false
        }
    };

    if should_spawn {
        let state = state.clone();
        let file_id = file_id.to_string();
        tokio::spawn(async move {
            tokio::time::sleep(Duration::from_millis(DEBOUNCE_MS)).await;
            flush_file(&state, &file_id).await;
        });
    }
}

/// Flush a single file to disk if it is dirty.
/// Always clears the timer-active flag (matching Node.js `flushFile` which
/// always calls `clearTimeout` and sets `timer = null`). Only saves to disk
/// if the dirty flag was set.
async fn flush_file(state: &SyncState, file_id: &str) {
    // Clear the timer-active flag and check if the file is dirty.
    // This matches Node.js `flushFile` which always clears the timer,
    // then checks `entry.dirty` before saving.
    let should_save = {
        let mut dirty = state.dirty.write().await;
        if let Some(entry) = dirty.get_mut(file_id) {
            entry.timer_active = false;
            let was_dirty = entry.dirty;
            entry.dirty = false;
            was_dirty
        } else {
            return;
        }
    };

    if !should_save {
        return;
    }

    // Acquire a write lock so we can atomically update updatedAt and snapshot
    // the data for persistence. This prevents a race where edits applied
    // between a read-lock snapshot and a write-lock reinsert get overwritten.
    let data_to_save = {
        let mut cache = state.cache.write().await;
        if let Some(file_data) = cache.get_mut(file_id) {
            // Update updatedAt in place on the cached value
            if let Some(obj) = file_data.as_object_mut() {
                obj.insert(
                    "updatedAt".to_string(),
                    serde_json::Value::Number(serde_json::Number::from(now_millis())),
                );
            }
            // Clone the data for disk write while still holding the lock
            Some(file_data.clone())
        } else {
            None
        }
        // Write lock is dropped here
    };

    // Persist to disk outside the lock to avoid holding it during I/O
    if let Some(data) = data_to_save {
        state.store.save_file(file_id, &data);
        tracing::info!("[file] Persisted: {}", file_id);
    }
}

/// Flush ALL dirty files to disk immediately.
async fn flush_all(state: &SyncState) {
    let file_ids: Vec<String> = {
        let dirty = state.dirty.read().await;
        dirty.keys().cloned().collect()
    };

    for file_id in file_ids {
        flush_file(state, &file_id).await;
    }
}

/// Decrement the connection count for a file. When the count reaches zero,
/// evict the file from the in-memory cache to prevent unbounded growth.
async fn release_connection(state: &SyncState, file_id: &str) {
    let should_evict = {
        let mut conns = state.connections.write().await;
        if let Some(count) = conns.get_mut(file_id) {
            *count = count.saturating_sub(1);
            if *count == 0 {
                conns.remove(file_id);
                true
            } else {
                false
            }
        } else {
            false
        }
    };

    if should_evict {
        let mut cache = state.cache.write().await;
        cache.remove(file_id);
        tracing::info!("[cache] Evicted file {} (no active connections)", file_id);
    }
}

// ---------------------------------------------------------------------------
// WebSocket handler
// ---------------------------------------------------------------------------

/// axum handler for WebSocket upgrade at /sync/:fileId
async fn ws_handler(
    Path(file_id): Path<String>,
    Query(query): Query<SyncQuery>,
    ws: WebSocketUpgrade,
    State(state): State<SyncState>,
) -> impl IntoResponse {
    let tab_id = query.tab_id.unwrap_or_else(|| "unknown".to_string());
    let client_index = NEXT_CLIENT_INDEX.fetch_add(1, Ordering::SeqCst);

    tracing::info!(
        "[connect] Client #{} connected - file: {}, tab: {}",
        client_index,
        file_id,
        tab_id
    );

    ws.on_upgrade(move |socket| handle_connection(socket, file_id, client_index, state))
}

/// Handle a single WebSocket connection.
async fn handle_connection(
    mut socket: WebSocket,
    file_id: String,
    client_index: u64,
    state: SyncState,
) {
    // Track this connection for cache eviction.
    {
        let mut conns = state.connections.write().await;
        *conns.entry(file_id.clone()).or_insert(0) += 1;
    }

    // 1) Load file data (creates if missing)
    let file_data = get_file_data(&state, &file_id).await;

    // 2) Send FilePayload immediately
    // Build this as raw serde_json::Value so the file field is the exact JSON
    let file_payload = serde_json::json!({
        "$t": 4,
        "file": file_data,
        "clientIndex": client_index,
        "accessLevel": 3,
        "syncMachineId": "local-mock",
        "fileSizeStatus": "below_limit"
    });

    // serde_json::to_string on a serde_json::Value cannot fail.
    if let Err(e) = socket
        .send(Message::Text(
            serde_json::to_string(&file_payload).unwrap().into(),
        ))
        .await
    {
        tracing::error!(
            "[send] Failed to send FilePayload to client #{}: {}",
            client_index,
            e
        );
        release_connection(&state, &file_id).await;
        return;
    }
    tracing::info!("[send] FilePayload to client #{}", client_index);

    // 3) Send UsersAlreadyInFile (empty for single-user)
    let users_msg = UsersAlreadyInFileMsg {
        t: 3,
        users: vec![],
    };
    // serde_json::to_string on a simple struct cannot fail.
    if let Err(e) = socket
        .send(Message::Text(
            serde_json::to_string(&users_msg).unwrap().into(),
        ))
        .await
    {
        tracing::error!(
            "[send] Failed to send UsersAlreadyInFile to client #{}: {}",
            client_index,
            e
        );
        release_connection(&state, &file_id).await;
        return;
    }

    // 4) Message handling loop
    while let Some(msg_result) = socket.recv().await {
        let msg = match msg_result {
            Ok(msg) => msg,
            Err(e) => {
                tracing::error!("[error] Client #{}: {}", client_index, e);
                break;
            }
        };

        match msg {
            Message::Text(text) => {
                handle_text_message(&mut socket, &state, &file_id, client_index, &text).await;
            }
            Message::Binary(data) => {
                // Try to parse binary as text (some clients send binary frames)
                if let Ok(text) = String::from_utf8(data.to_vec()) {
                    handle_text_message(&mut socket, &state, &file_id, client_index, &text).await;
                }
            }
            Message::Close(_) => {
                tracing::info!("[close] Client #{} disconnected", client_index);
                break;
            }
            _ => {}
        }
    }

    // On disconnect, flush pending writes for this file
    flush_file(&state, &file_id).await;

    // Release connection and evict from cache if no more connections.
    release_connection(&state, &file_id).await;
    tracing::info!("[close] Client #{} connection ended", client_index);
}

/// Handle a single text message from a client.
async fn handle_text_message(
    socket: &mut WebSocket,
    state: &SyncState,
    file_id: &str,
    client_index: u64,
    text: &str,
) {
    let msg: serde_json::Value = match serde_json::from_str(text) {
        Ok(v) => v,
        Err(e) => {
            tracing::error!(
                "[error] Failed to parse message from client #{}: {}",
                client_index,
                e
            );
            return;
        }
    };

    let msg_type = match msg.get("$t").and_then(|t| t.as_u64()) {
        Some(t) => t,
        None => {
            tracing::warn!("[msg] Missing $t field from client #{}", client_index);
            return;
        }
    };

    match msg_type {
        // Ping -> Pong
        10 => {
            let pong = PongMsg {
                t: 11,
                min_client: Some(0),
            };
            if let Err(e) = socket
                .send(Message::Text(serde_json::to_string(&pong).unwrap().into()))
                .await
            {
                tracing::error!(
                    "[send] Failed to send Pong to client #{}: {}",
                    client_index,
                    e
                );
            }
        }

        // FileEdit (single edit)
        6 => {
            tracing::debug!("[edit] FileEdit from client #{}", client_index);
            if let Some(edit) = msg.get("edit") {
                let mut cache = state.cache.write().await;
                if let Some(file_data) = cache.get_mut(file_id) {
                    apply_edit(file_data, edit);
                }
                drop(cache);
                mark_dirty(state, file_id).await;
            }
        }

        // FileEditBatch
        15 => {
            if let Some(edits) = msg.get("edits").and_then(|e| e.as_array()) {
                tracing::debug!(
                    "[edit] FileEditBatch from client #{}: {} edits",
                    client_index,
                    edits.len()
                );
                let mut cache = state.cache.write().await;
                if let Some(file_data) = cache.get_mut(file_id) {
                    for edit in edits {
                        apply_edit(file_data, edit);
                    }
                }
                drop(cache);
                mark_dirty(state, file_id).await;
            }
        }

        // Cursor, page, focus, select, camera, chat — silently ignore for single-user
        0 | 7 | 8 | 9 | 13 | 14 => {}

        // Unknown
        other => {
            tracing::warn!(
                "[msg] Unhandled message type {} from client #{}",
                other,
                client_index
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Server startup
// ---------------------------------------------------------------------------

/// Handler for POST /debug/error — logs client-side errors/warnings via tracing.
///
/// This route lives outside the `api_routes` sub-router (which has its own
/// CorsLayer), so we return explicit CORS headers here to allow the webview
/// (origin http://tauri.localhost) to POST errors cross-origin.
async fn debug_error(Json(body): Json<serde_json::Value>) -> impl IntoResponse {
    let level = body.get("level").and_then(|v| v.as_str()).unwrap_or("error");
    let msg = body.get("msg").and_then(|v| v.as_str()).unwrap_or("(no message)");
    match level {
        "warn" => tracing::warn!("[webview] {}", msg),
        _ => tracing::error!("[webview] {}", msg),
    }
    (
        StatusCode::OK,
        [
            ("Access-Control-Allow-Origin", ALLOWED_ORIGIN),
            ("Access-Control-Allow-Methods", "POST, OPTIONS"),
            ("Access-Control-Allow-Headers", "Content-Type"),
        ],
    )
}

/// OPTIONS preflight handler for /debug/error — required for CORS.
async fn debug_error_preflight() -> impl IntoResponse {
    (
        StatusCode::NO_CONTENT,
        [
            ("Access-Control-Allow-Origin", ALLOWED_ORIGIN),
            ("Access-Control-Allow-Methods", "POST, OPTIONS"),
            ("Access-Control-Allow-Headers", "Content-Type"),
        ],
    )
}

/// Fallback handler for non-WebSocket/non-matching requests.
///
/// The current desktop runtime only needs `/sync/{fileId}` plus the merged
/// localhost HTTP routes on 8080. We keep `GET /` as a plain-text liveness
/// response, but return a normal 404 JSON error for other unknown paths so
/// removed API routes fail clearly instead of masquerading as sync success.
async fn fallback_handler(req: axum::extract::Request) -> impl IntoResponse {
    if req.uri().path() == "/" {
        return (
            StatusCode::OK,
            [("Content-Type", "text/plain")],
            "Deckle Sync Server — WebSocket only",
        )
            .into_response();
    }

    (
        StatusCode::NOT_FOUND,
        [
            ("access-control-allow-origin", ALLOWED_ORIGIN),
            ("access-control-allow-credentials", "true"),
        ],
        Json(serde_json::json!({"error": "Not found"})),
    )
        .into_response()
}

/// Start the WebSocket sync server on the given port.
///
/// Routes:
///   GET /sync/:fileId  (WebSocket upgrade)
///   GET /              200 OK text/plain liveness response
///   any other path     404 JSON
///
/// The server shares file state across connections and debounces writes
/// to disk at 500ms intervals. On shutdown (SIGINT), all dirty files
/// are flushed.
pub async fn start(port: u16, store: FileStore, shutdown: tokio_util::sync::CancellationToken) -> Result<(), Box<dyn std::error::Error>> {
    let state = SyncState {
        store: store.clone(),
        cache: Arc::new(RwLock::new(HashMap::new())),
        dirty: Arc::new(RwLock::new(HashMap::new())),
        connections: Arc::new(RwLock::new(HashMap::new())),
    };

    // Merge the shared localhost HTTP routes onto the sync port. The current
    // desktop bundle points API, SYNC, and WORKERS at localhost:8080.
    let api_routes = crate::api_server::router(store);

    let app = Router::new()
        .route("/sync/{fileId}", axum::routing::get(ws_handler))
        .with_state(state.clone())
        .merge(api_routes)
        .route("/debug/error", axum::routing::post(debug_error).options(debug_error_preflight))
        .fallback(fallback_handler);

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    tracing::info!("===================================");
    tracing::info!("  Deckle Local Sync/HTTP Server");
    tracing::info!("  Listening on port {}", port);
    tracing::info!("  WebSocket: ws://localhost:{}/sync/{{fileId}}", port);
    tracing::info!("  HTTP API:  http://localhost:{}", port);
    tracing::info!(
        "  Data dir: {}",
        crate::file_store::get_data_dir().display()
    );
    tracing::info!("===================================");

    // Graceful shutdown: the caller (main.rs) cancels the token when the
    // Tauri window closes. axum drains in-flight connections, then we flush
    // every dirty file to disk so no edits are lost.
    axum::serve(listener, app)
        .with_graceful_shutdown(async move { shutdown.cancelled().await })
        .await?;

    tracing::info!("Sync server shutting down — flushing dirty files...");
    flush_all(&state).await;
    tracing::info!("Sync server shutdown complete.");

    Ok(())
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_sync_state() -> (SyncState, tempfile::TempDir) {
        let dir = tempfile::tempdir().expect("Failed to create temp dir");
        let store = FileStore::with_data_dir(dir.path().join(".deckle-local"));
        let state = SyncState {
            store,
            cache: Arc::new(RwLock::new(HashMap::new())),
            dirty: Arc::new(RwLock::new(HashMap::new())),
            connections: Arc::new(RwLock::new(HashMap::new())),
        };
        (state, dir)
    }

    // Helper to create a test file JSON value
    fn test_file() -> serde_json::Value {
        serde_json::json!({
            "_id": "test-file",
            "id": "test-file",
            "nodes": {
                "root_node_1-0": {
                    "id": "root_node_1-0",
                    "label": "",
                    "component": "",
                    "styles": {
                        "display": "*"
                    },
                    "~": false
                }
            },
            "pages": [
                {
                    "id": "1-0",
                    "label": "Page 1",
                    "createdDate": 1718700000000_u64,
                    "lastModifiedDate": 1718700000000_u64,
                    "~": false
                }
            ],
            "counter": {
                "pages": 1
            },
            "nodeRelationships": {},
            "labelCounter": {}
        })
    }

    #[tokio::test]
    async fn test_get_file_data_creates_user_scoped_scratchpad() {
        let (state, _dir) = temp_sync_state();

        let scratchpad = get_file_data(&state, SCRATCHPAD_FILE_ID).await;
        assert_eq!(scratchpad["_id"], serde_json::json!(SCRATCHPAD_FILE_ID));
        assert_eq!(scratchpad["id"], serde_json::json!(SCRATCHPAD_FILE_ID));
        assert_eq!(scratchpad["resourcesId"], serde_json::json!(USER_ID));
        assert_eq!(scratchpad["pages"][0]["id"], serde_json::json!("1-0"));
        assert_eq!(
            scratchpad["nodes"]["root_node_1-0"]["styles"]["display"],
            serde_json::json!("*")
        );

        let persisted = state
            .store
            .load_file(SCRATCHPAD_FILE_ID)
            .expect("scratchpad should persist as a user-scoped file");
        assert_eq!(persisted["resourcesId"], serde_json::json!(USER_ID));
    }

    #[test]
    fn test_parse_path_with_leading_slash() {
        let segments = parse_path("/nodes/abc/styles/width");
        assert_eq!(segments, vec!["nodes", "abc", "styles", "width"]);
    }

    #[test]
    fn test_parse_path_without_leading_slash() {
        let segments = parse_path("nodes/abc/styles/width");
        assert_eq!(segments, vec!["nodes", "abc", "styles", "width"]);
    }

    #[test]
    fn test_parse_path_empty() {
        let segments = parse_path("");
        assert!(segments.is_empty());
    }

    #[test]
    fn test_deep_set_value_update_existing() {
        let mut file = test_file();
        deep_set_value(
            &mut file,
            "/nodes/root_node_1-0/styles/width",
            serde_json::json!("200px"),
            false,
        );
        assert_eq!(file["nodes"]["root_node_1-0"]["styles"]["width"], "200px");
    }

    #[test]
    fn test_deep_set_value_update_missing_intermediate_bails() {
        let mut file = test_file();
        deep_set_value(
            &mut file,
            "/nodes/nonexistent/styles/width",
            serde_json::json!("200px"),
            false, // update mode
        );
        // Should not create "nonexistent" node
        assert!(file["nodes"].get("nonexistent").is_none());
    }

    #[test]
    fn test_deep_set_value_add_creates_intermediates() {
        let mut file = test_file();
        deep_set_value(
            &mut file,
            "/nodes/new_node/styles/width",
            serde_json::json!("100px"),
            true, // add mode
        );
        assert_eq!(file["nodes"]["new_node"]["styles"]["width"], "100px");
    }

    #[test]
    fn test_deep_set_value_add_node() {
        let mut file = test_file();
        let node_value = serde_json::json!({
            "id": "new-node-123",
            "label": "Button",
            "styles": {"display": "flex"},
            "~": false
        });
        deep_set_value(&mut file, "/nodes/new-node-123", node_value.clone(), true);
        assert_eq!(file["nodes"]["new-node-123"], node_value);
    }

    #[test]
    fn test_deep_set_value_array_push() {
        let mut file = test_file();
        let new_page = serde_json::json!({
            "id": "2-0",
            "label": "Page 2",
            "~": false
        });
        deep_set_value(&mut file, "/pages/-", new_page.clone(), true);
        assert_eq!(file["pages"].as_array().unwrap().len(), 2);
        assert_eq!(file["pages"][1]["id"], "2-0");
    }

    #[test]
    fn test_deep_delete_hard_delete() {
        let mut file = test_file();
        // Add a node without soft-delete marker
        file["nodes"].as_object_mut().unwrap().insert(
            "temp-node".to_string(),
            serde_json::json!({"id": "temp-node", "label": "temp"}),
        );
        deep_delete(&mut file, "/nodes/temp-node");
        assert!(file["nodes"].get("temp-node").is_none());
    }

    #[test]
    fn test_deep_delete_soft_delete() {
        let mut file = test_file();
        // root_node_1-0 has "~": false, so it should be soft-deleted
        deep_delete(&mut file, "/nodes/root_node_1-0");
        assert_eq!(file["nodes"]["root_node_1-0"]["~"], true);
    }

    #[test]
    fn test_deep_delete_soft_delete_page() {
        let mut file = test_file();
        // pages[0] has "~": false, so it should be soft-deleted
        deep_delete(&mut file, "/pages/0");
        assert_eq!(file["pages"][0]["~"], true);
    }

    #[test]
    fn test_deep_delete_missing_path_noop() {
        let mut file = test_file();
        let before = file.clone();
        deep_delete(&mut file, "/nodes/nonexistent/styles/width");
        assert_eq!(file, before);
    }

    #[test]
    fn test_deep_splice_insert() {
        let mut file = test_file();
        let new_page = serde_json::json!({
            "id": "2-0",
            "label": "Page 2",
            "~": false
        });
        deep_splice(&mut file, "/pages/1", 0, vec![new_page]);
        assert_eq!(file["pages"].as_array().unwrap().len(), 2);
        assert_eq!(file["pages"][1]["id"], "2-0");
    }

    #[test]
    fn test_deep_splice_remove() {
        let mut file = test_file();
        // Add a second page first
        file["pages"]
            .as_array_mut()
            .unwrap()
            .push(serde_json::json!({
                "id": "2-0",
                "label": "Page 2",
                "~": false
            }));
        assert_eq!(file["pages"].as_array().unwrap().len(), 2);

        deep_splice(&mut file, "/pages/0", 1, vec![]);
        assert_eq!(file["pages"].as_array().unwrap().len(), 1);
        assert_eq!(file["pages"][0]["id"], "2-0");
    }

    #[test]
    fn test_deep_splice_replace() {
        let mut file = test_file();
        let replacement = serde_json::json!({
            "id": "1-0",
            "label": "Renamed Page",
            "~": false
        });
        deep_splice(&mut file, "/pages/0", 1, vec![replacement]);
        assert_eq!(file["pages"].as_array().unwrap().len(), 1);
        assert_eq!(file["pages"][0]["label"], "Renamed Page");
    }

    #[test]
    fn test_apply_edit_add() {
        let mut file = test_file();
        let edit = serde_json::json!({
            "type": "add",
            "path": "/nodes/new-node",
            "value": {"id": "new-node", "label": "New", "~": false}
        });
        apply_edit(&mut file, &edit);
        assert_eq!(file["nodes"]["new-node"]["label"], "New");
    }

    #[test]
    fn test_apply_edit_update() {
        let mut file = test_file();
        let edit = serde_json::json!({
            "type": "update",
            "path": "/nodes/root_node_1-0/label",
            "value": "Updated Label"
        });
        apply_edit(&mut file, &edit);
        assert_eq!(file["nodes"]["root_node_1-0"]["label"], "Updated Label");
    }

    #[test]
    fn test_apply_edit_remove() {
        let mut file = test_file();
        let edit = serde_json::json!({
            "type": "remove",
            "path": "/nodes/root_node_1-0"
        });
        apply_edit(&mut file, &edit);
        // Should soft-delete (has "~" field)
        assert_eq!(file["nodes"]["root_node_1-0"]["~"], true);
    }

    #[test]
    fn test_apply_edit_splice() {
        let mut file = test_file();
        let edit = serde_json::json!({
            "type": "splice",
            "path": "/pages/0",
            "removedCount": 0,
            "added": [{"id": "inserted", "label": "Inserted", "~": false}]
        });
        apply_edit(&mut file, &edit);
        assert_eq!(file["pages"].as_array().unwrap().len(), 2);
        assert_eq!(file["pages"][0]["id"], "inserted");
    }

    #[test]
    fn test_apply_edit_unknown_type_noop() {
        let mut file = test_file();
        let before = file.clone();
        let edit = serde_json::json!({
            "type": "unknown",
            "path": "/nodes/x"
        });
        apply_edit(&mut file, &edit);
        assert_eq!(file, before);
    }

    #[test]
    fn test_apply_edit_no_type_noop() {
        let mut file = test_file();
        let before = file.clone();
        let edit = serde_json::json!({"path": "/nodes/x"});
        apply_edit(&mut file, &edit);
        assert_eq!(file, before);
    }

    #[test]
    fn test_update_nested_style() {
        let mut file = test_file();
        deep_set_value(
            &mut file,
            "/nodes/root_node_1-0/styles/left",
            serde_json::json!("50px"),
            false,
        );
        deep_set_value(
            &mut file,
            "/nodes/root_node_1-0/styles/top",
            serde_json::json!("100px"),
            false,
        );
        assert_eq!(file["nodes"]["root_node_1-0"]["styles"]["left"], "50px");
        assert_eq!(file["nodes"]["root_node_1-0"]["styles"]["top"], "100px");
        // Existing style should still be there
        assert_eq!(file["nodes"]["root_node_1-0"]["styles"]["display"], "*");
    }

    #[test]
    fn test_update_page_label() {
        let mut file = test_file();
        deep_set_value(
            &mut file,
            "/pages/0/label",
            serde_json::json!("Renamed Page"),
            false,
        );
        assert_eq!(file["pages"][0]["label"], "Renamed Page");
    }

    #[test]
    fn test_update_counter() {
        let mut file = test_file();
        deep_set_value(&mut file, "/counter/pages", serde_json::json!(5), false);
        assert_eq!(file["counter"]["pages"], 5);
    }

    #[test]
    fn test_deep_splice_out_of_bounds_index() {
        // JS Array.splice with index > length clamps to length (appends).
        // This must not panic in Rust.
        let mut file = test_file();
        assert_eq!(file["pages"].as_array().unwrap().len(), 1);

        let new_page = serde_json::json!({
            "id": "appended",
            "label": "Appended Page",
            "~": false
        });
        // Index 999 is way beyond array length (1), should clamp to end
        deep_splice(&mut file, "/pages/999", 0, vec![new_page]);
        assert_eq!(file["pages"].as_array().unwrap().len(), 2);
        assert_eq!(file["pages"][1]["id"], "appended");
    }

    #[test]
    fn test_deep_splice_out_of_bounds_remove() {
        // JS Array.splice with index > length and remove > 0 removes nothing
        // and appends added items.
        let mut file = test_file();
        assert_eq!(file["pages"].as_array().unwrap().len(), 1);

        // Index 5, remove 3 — should clamp index to 1 (array len), remove 0
        deep_splice(&mut file, "/pages/5", 3, vec![]);
        // Nothing removed since index clamped to end
        assert_eq!(file["pages"].as_array().unwrap().len(), 1);
    }
}
