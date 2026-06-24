// Shared types for the Deckle Desktop Rust port.
//
// Every struct, enum, and constant below is derived from the Node.js source
// (api-server.js, sync-server.js) and the CONTRACTS.md specification.

use std::collections::HashMap;

use indexmap::IndexMap;
use serde::{Deserialize, Deserializer, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use std::time::{SystemTime, UNIX_EPOCH};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Deserializes a field that may be `null` by returning `Default::default()`.
/// Combined with `#[serde(default)]`, this handles both missing AND null fields.
fn deserialize_null_default<'de, D, T>(deserializer: D) -> Result<T, D::Error>
where
    D: Deserializer<'de>,
    T: Default + Deserialize<'de>,
{
    let opt = Option::deserialize(deserializer)?;
    Ok(opt.unwrap_or_default())
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

pub const USER_ID: &str = "user-00000000-0000-0000-0000-000000000000";
pub const TEAM_ID: &str = "team-00000000-0000-0000-0000-000000000000";
pub const ROOT_FOLDER_ID: &str = "folder-00000000-0000-0000-0000-000000000000";
pub const SCHEMA_VERSION: u64 = 20260529;
#[cfg(target_os = "linux")]
pub const ALLOWED_ORIGIN: &str = "tauri://localhost";
#[cfg(not(target_os = "linux"))]
pub const ALLOWED_ORIGIN: &str = "http://tauri.localhost";

// ---------------------------------------------------------------------------
// CORS configuration
// ---------------------------------------------------------------------------

pub const CORS_METHODS: &str = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
pub const CORS_HEADERS: &str =
    "Content-Type, If-None-Match, X-FileId, X-ImageId, X-SourcePath, X-DestPath";
pub const CORS_MAX_AGE: &str = "86400";

// ---------------------------------------------------------------------------
// WebSocket close codes
// ---------------------------------------------------------------------------

pub const WS_CLOSE_EXPECTED: u16 = 4403;
pub const WS_CLOSE_FILE_NOT_FOUND: u16 = 4404;

// ---------------------------------------------------------------------------
// Section 1: Core Data Structs
// ---------------------------------------------------------------------------

// 1.1 User

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub _id: String,
    pub id: String,
    pub email: String,
    #[serde(rename = "firstName")]
    pub first_name: Option<String>,
    #[serde(rename = "lastName")]
    pub last_name: Option<String>,
    #[serde(rename = "profilePictureUrl")]
    pub profile_picture_url: Option<String>,
    #[serde(rename = "recentFiles")]
    pub recent_files: Vec<String>,
    #[serde(rename = "teamIds")]
    pub team_ids: Vec<String>,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    #[serde(rename = "updatedAt")]
    pub updated_at: u64,
    #[serde(default)]
    pub settings: serde_json::Value,
}

// 1.2 ResourceType Enum

#[derive(Debug, Clone, Copy, Serialize_repr, Deserialize_repr, PartialEq)]
#[repr(u8)]
pub enum ResourceType {
    Folder = 0,
    File = 1,
}

// 1.13 Resource

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Resource {
    pub id: String,
    #[serde(rename = "type")]
    pub resource_type: u8, // 0=Folder, 1=File
    pub name: String,
    #[serde(rename = "parentId")]
    pub parent_id: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    #[serde(rename = "updatedAt")]
    pub updated_at: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub access: Option<HashMap<String, u8>>,
    #[serde(rename = "urlAccess", skip_serializing_if = "Option::is_none")]
    pub url_access: Option<u8>,
    #[serde(rename = "clonedFromFileId", skip_serializing_if = "Option::is_none")]
    pub cloned_from_file_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub archived: Option<bool>,
    #[serde(rename = "createdByUserId", skip_serializing_if = "Option::is_none")]
    pub created_by_user_id: Option<String>,
}

// 1.14 ResourceContainer

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceContainer {
    pub _id: String,
    pub id: String,
    /// Resources stored as loose JSON Values, matching Node.js dynamic object behavior.
    /// Use `resource_to_typed()` to convert to the `Resource` struct when typed access is needed.
    pub resources: HashMap<String, serde_json::Value>,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    #[serde(rename = "updatedAt")]
    pub updated_at: u64,
}

/// Convert a `serde_json::Value` to a typed `Resource`, returning `None` if the
/// value does not conform to the expected schema (e.g. wrong types for fields).
/// This is lossy: unknown fields in the Value are silently dropped.
pub fn resource_to_typed(value: &serde_json::Value) -> Option<Resource> {
    serde_json::from_value(value.clone()).ok()
}

// 1.5 ResourcesBatchGetRequest / Response

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourcesBatchGetRequestItem {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub etag: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourcesBatchGetRequest {
    #[serde(default, deserialize_with = "deserialize_null_default")]
    pub resources: Vec<ResourcesBatchGetRequestItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourcesBatchGetResponse {
    pub changed: IndexMap<String, ResourceContainer>,
}

// 1.7 CreateFileRequest / Response

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateFileRequest {
    #[serde(rename = "resourcesId", skip_serializing_if = "Option::is_none")]
    pub resources_id: Option<String>,
    #[serde(rename = "folderId", skip_serializing_if = "Option::is_none")]
    pub folder_id: Option<String>,
    #[serde(rename = "cloneFileId", skip_serializing_if = "Option::is_none")]
    pub clone_file_id: Option<String>,
    #[serde(rename = "fileName", skip_serializing_if = "Option::is_none")]
    pub file_name: Option<String>,
    #[serde(rename = "fileData", skip_serializing_if = "Option::is_none")]
    pub file_data: Option<String>,
    #[serde(rename = "addToRecentFiles", skip_serializing_if = "Option::is_none")]
    pub add_to_recent_files: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateFileResponse {
    pub id: String,
}

// 1.20 CreateFolderRequest / Response

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateFolderRequest {
    #[serde(rename = "resourcesId", skip_serializing_if = "Option::is_none")]
    pub resources_id: Option<String>,
    #[serde(rename = "folderName", skip_serializing_if = "Option::is_none")]
    pub folder_name: Option<String>,
    #[serde(rename = "parentId", skip_serializing_if = "Option::is_none")]
    pub parent_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateFolderResponse {
    pub id: String,
    pub resource: Resource,
}

// 1.21 PatchResourceResponse

/// Response for PATCH /resources/:resourcesId/items/:itemId.
/// The `resource` field is a loose JSON Value (not typed Resource) to match
/// Node.js Object.assign behavior, where arbitrary body fields are accepted
/// and persisted even if they don't conform to the Resource schema.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatchResourceResponse {
    pub resource: serde_json::Value,
}

// 1.22 ArchiveResourceRequest / Response

fn default_true() -> bool {
    true
}

/// Deserializes a bool that may be `null` by treating null as `true`,
/// matching Node.js behavior: `body.archived !== false` where
/// `undefined`, `null`, and `true` all produce `true`.
fn deserialize_null_is_true<'de, D>(deserializer: D) -> Result<bool, D::Error>
where
    D: Deserializer<'de>,
{
    let opt = Option::<bool>::deserialize(deserializer)?;
    Ok(opt.unwrap_or(true))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchiveResourceRequest {
    #[serde(
        default = "default_true",
        deserialize_with = "deserialize_null_is_true"
    )]
    pub archived: bool,
    #[serde(rename = "parentId", skip_serializing_if = "Option::is_none")]
    pub parent_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchiveResourceResponse {
    pub resources: Vec<serde_json::Value>,
}

// ---------------------------------------------------------------------------
// Section 1.12: File Data Model
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Page {
    pub id: String,
    pub label: String,
    #[serde(rename = "createdDate")]
    pub created_date: u64,
    #[serde(rename = "lastModifiedDate")]
    pub last_modified_date: u64,
    #[serde(rename = "canvasColor", skip_serializing_if = "Option::is_none")]
    pub canvas_color: Option<String>,
    #[serde(rename = "totalBounds", skip_serializing_if = "Option::is_none")]
    pub total_bounds: Option<serde_json::Value>,
    /// Soft-delete flag. When true, this page is considered deleted.
    #[serde(rename = "~")]
    pub soft_deleted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    #[serde(default, deserialize_with = "deserialize_null_default")]
    pub label: String,
    #[serde(rename = "labelIsModified", skip_serializing_if = "Option::is_none")]
    pub label_is_modified: Option<bool>,
    #[serde(default, deserialize_with = "deserialize_null_default")]
    pub component: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tag: Option<String>,
    #[serde(rename = "isVisible", skip_serializing_if = "Option::is_none")]
    pub is_visible: Option<bool>,
    #[serde(rename = "isLocked", skip_serializing_if = "Option::is_none")]
    pub is_locked: Option<bool>,
    pub styles: serde_json::Value,
    #[serde(rename = "disabledStyles", skip_serializing_if = "Option::is_none")]
    pub disabled_styles: Option<serde_json::Value>,
    #[serde(rename = "styleMeta", skip_serializing_if = "Option::is_none")]
    pub style_meta: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<serde_json::Value>,
    #[serde(rename = "propMeta", skip_serializing_if = "Option::is_none")]
    pub prop_meta: Option<serde_json::Value>,
    #[serde(rename = "textValue", skip_serializing_if = "Option::is_none")]
    pub text_value: Option<serde_json::Value>,
    #[serde(rename = "svgPrompt", skip_serializing_if = "Option::is_none")]
    pub svg_prompt: Option<String>,
    #[serde(rename = "pinnedWidth", skip_serializing_if = "Option::is_none")]
    pub pinned_width: Option<serde_json::Value>,
    #[serde(rename = "pinnedHeight", skip_serializing_if = "Option::is_none")]
    pub pinned_height: Option<serde_json::Value>,
    #[serde(rename = "placeholderId", skip_serializing_if = "Option::is_none")]
    pub placeholder_id: Option<String>,
    /// Soft-delete flag. When true, this node is considered deleted.
    #[serde(rename = "~")]
    pub soft_deleted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileCounter {
    pub pages: u64,
}

/// Complete file document. This is what gets persisted to disk and sent
/// over WebSocket as the FilePayload's `file` field.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileData {
    pub _id: String,
    pub id: String,
    #[serde(rename = "resourcesId")]
    pub resources_id: String,
    #[serde(rename = "userId")]
    pub user_id: String,
    #[serde(rename = "clonedFrom", default)]
    pub cloned_from: String,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    #[serde(rename = "updatedAt")]
    pub updated_at: u64,
    pub schema: u64,
    pub pages: Vec<Page>,
    /// Keyed by node ID (e.g. "root_node_1-0").
    pub nodes: HashMap<String, Node>,
    pub counter: FileCounter,
    #[serde(rename = "labelCounter", default)]
    pub label_counter: HashMap<String, serde_json::Value>,
    /// Maps child node ID -> parent node ID.
    #[serde(rename = "nodeRelationships", default)]
    pub node_relationships: HashMap<String, String>,
    #[serde(rename = "isTutorial", default)]
    pub is_tutorial: bool,
}

// ---------------------------------------------------------------------------
// Section 1.27: File template function
// ---------------------------------------------------------------------------

/// Returns the current time in milliseconds since the UNIX epoch.
pub fn now_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

/// Creates an empty file with one page and one root node, matching
/// the exact shape produced by the Node.js `createEmptyFile` function
/// in both api-server.js and sync-server.js.
pub fn create_empty_file(file_id: &str, resources_id: &str, user_id: &str) -> FileData {
    let now = now_millis();
    let page_id = "1-0";
    let root_node_id = format!("root_node_{}", page_id);

    let mut nodes = HashMap::new();
    nodes.insert(
        root_node_id.clone(),
        Node {
            id: root_node_id,
            label: String::new(),
            label_is_modified: None,
            component: String::new(),
            tag: None,
            is_visible: None,
            is_locked: None,
            styles: serde_json::json!({ "display": "*" }),
            disabled_styles: None,
            style_meta: None,
            props: None,
            prop_meta: None,
            text_value: None,
            svg_prompt: None,
            pinned_width: None,
            pinned_height: None,
            placeholder_id: None,
            soft_deleted: false,
        },
    );

    FileData {
        _id: file_id.to_string(),
        id: file_id.to_string(),
        resources_id: resources_id.to_string(),
        user_id: user_id.to_string(),
        cloned_from: String::new(),
        created_at: now,
        updated_at: now,
        schema: SCHEMA_VERSION,
        pages: vec![Page {
            id: page_id.to_string(),
            label: "Page 1".to_string(),
            created_date: now,
            last_modified_date: now,
            canvas_color: None,
            total_bounds: None,
            soft_deleted: false,
        }],
        nodes,
        counter: FileCounter { pages: 1 },
        label_counter: HashMap::new(),
        node_relationships: HashMap::new(),
        is_tutorial: false,
    }
}

// ---------------------------------------------------------------------------
// Section 2: WebSocket Message Types
// ---------------------------------------------------------------------------

/// Message type discriminator values.
/// Wire format: { "$t": <integer>, ... }
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[repr(u8)]
pub enum WsMessageType {
    CursorMove = 0,
    UserJoinedFile = 1,
    UserLeftFile = 2,
    UsersAlreadyInFile = 3,
    FilePayload = 4,
    FileLoadFailed = 5,
    FileEdit = 6,
    UserSelectNode = 7,
    UserFocusChange = 8,
    UserPageChange = 9,
    Ping = 10,
    Pong = 11,
    TeamSwitchRequired = 12,
    UserCameraChange = 13,
    CursorChat = 14,
    FileEditBatch = 15,
    FileSizeStatus = 16,
}

// 2.2 Individual message structs

/// Server -> Client: initial file payload (type 4)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilePayloadMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 4
    pub file: FileData,
    #[serde(rename = "clientIndex")]
    pub client_index: u64,
    #[serde(rename = "accessLevel")]
    pub access_level: u8, // 0=None, 1=Read, 2=Edit, 3=Admin
    #[serde(rename = "syncMachineId")]
    pub sync_machine_id: String,
    #[serde(rename = "fileSizeStatus")]
    pub file_size_status: Option<String>, // "below_limit" | "near_limit" | null
}

/// Server -> Client: users already in file (type 3)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsersAlreadyInFileMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 3
    pub users: Vec<UserInFile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserInFile {
    #[serde(rename = "clientId")]
    pub client_id: String,
    #[serde(rename = "cursorPos")]
    pub cursor_pos: CursorPos,
    #[serde(rename = "pageId")]
    pub page_id: String,
    pub focus: u8,
    #[serde(rename = "selectedNodes")]
    pub selected_nodes: Vec<String>,
    #[serde(rename = "cameraView")]
    pub camera_view: CameraView,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorPos {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraView {
    #[serde(rename = "minX")]
    pub min_x: f64,
    #[serde(rename = "minY")]
    pub min_y: f64,
    #[serde(rename = "maxX")]
    pub max_x: f64,
    #[serde(rename = "maxY")]
    pub max_y: f64,
}

/// Server -> Client: another user joined (type 1)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserJoinedFileMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 1
    pub user: UserInFile,
}

/// Server -> Client: user left (type 2)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserLeftFileMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 2
    #[serde(rename = "clientId")]
    pub client_id: String,
}

/// Bidirectional: single edit (type 6)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEditMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 6
    #[serde(rename = "fileId", skip_serializing_if = "Option::is_none")]
    pub file_id: Option<String>,
    pub edit: EditOp,
}

/// Bidirectional: batch of edits (type 15)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEditBatchMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 15
    #[serde(rename = "fileId", skip_serializing_if = "Option::is_none")]
    pub file_id: Option<String>,
    pub edits: Vec<EditOp>,
}

/// Client -> Server: ping (type 10)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PingMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 10
}

/// Server -> Client: pong (type 11)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PongMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 11
    #[serde(rename = "minClient", skip_serializing_if = "Option::is_none")]
    pub min_client: Option<u64>,
}

/// Client -> Server: cursor move (type 0)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorMoveMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 0
    pub x: f64,
    pub y: f64,
}

/// Client -> Server: node selection (type 7)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserSelectNodeMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 7
    #[serde(rename = "nodeIds")]
    pub node_ids: Vec<String>,
}

/// Client -> Server: focus change (type 8)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserFocusChangeMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 8
    pub focus: u8, // 0=Canvas, 1=Interface, 2=Blurred
}

/// Client -> Server: page change (type 9)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPageChangeMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 9
    #[serde(rename = "pageId")]
    pub page_id: String,
}

/// Client -> Server: camera change (type 13)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserCameraChangeMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 13
    pub view: CameraView,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<CursorPos>,
}

/// Client -> Server: cursor chat (type 14)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorChatMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 14
    pub text: String,
}

/// Server -> Client: file size status update (type 16)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileSizeStatusMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 16
    pub status: String, // "below_limit" | "near_limit"
}

/// Server -> Client: team switch required (type 12)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamSwitchRequiredMsg {
    #[serde(rename = "$t")]
    pub t: u8, // always 12
    #[serde(rename = "teamId")]
    pub team_id: String,
    #[serde(rename = "teamName")]
    pub team_name: String,
}

// 2.3 Edit Operation Types

/// A single edit operation applied to file data.
/// The `type` field determines the semantics.
///
/// Wire format uses `"type"` as a string discriminator.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum EditOp {
    /// Add a new value at a JSON-pointer-like path.
    /// Creates intermediate objects/arrays as needed.
    #[serde(rename = "add")]
    Add {
        path: String,
        value: serde_json::Value,
    },
    /// Update an existing value at a path.
    /// Skips silently if an intermediate path segment is missing.
    #[serde(rename = "update")]
    Update {
        path: String,
        value: serde_json::Value,
    },
    /// Remove a value at a path.
    /// If the target object has a "~" field, sets it to true (soft-delete).
    /// Otherwise, deletes the key entirely.
    #[serde(rename = "remove")]
    Remove { path: String },
    /// Splice an array at the given path index.
    /// Path's last segment is the numeric index.
    #[serde(rename = "splice")]
    Splice {
        path: String,
        #[serde(rename = "removedCount")]
        removed_count: usize,
        #[serde(default, deserialize_with = "deserialize_null_default")]
        added: Vec<serde_json::Value>,
    },
}

// 2.5 Access Level Enum

#[derive(Debug, Clone, Copy, PartialEq)]
#[repr(u8)]
pub enum AccessLevel {
    None = 0,
    Read = 1,
    Edit = 2,
    Admin = 3,
}

// 2.6 Focus Enum

#[derive(Debug, Clone, Copy, PartialEq)]
#[repr(u8)]
pub enum Focus {
    Canvas = 0,
    Interface = 1,
    Blurred = 2,
}

// ---------------------------------------------------------------------------
// Section 4.2: MIME type map
// ---------------------------------------------------------------------------

pub fn mime_type_for_ext(ext: &str) -> &'static str {
    match ext {
        "js" => "application/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "html" => "text/html; charset=utf-8",
        "json" => "application/json; charset=utf-8",
        "woff2" => "font/woff2",
        "webp" => "image/webp",
        "avif" => "image/avif",
        "png" => "image/png",
        "svg" => "image/svg+xml",
        "ico" => "image/x-icon",
        "map" => "application/json",
        _ => "application/octet-stream",
    }
}

// ---------------------------------------------------------------------------
// Section 5.6: MCP Tool Result Format
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpContent {
    #[serde(rename = "type")]
    pub content_type: String, // "text"
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpToolResult {
    pub content: Vec<McpContent>,
    #[serde(rename = "isError", skip_serializing_if = "Option::is_none")]
    pub is_error: Option<bool>,
}

// ---------------------------------------------------------------------------
// Section 6.3: Resource seed data
// ---------------------------------------------------------------------------

/// Creates the default ResourceContainer with a root "Projects" folder,
/// used when resources.json does not exist on first run.
pub fn seed_resources(team_id: &str, root_folder_id: &str, user_id: &str) -> ResourceContainer {
    let now = now_millis();
    let mut resources = HashMap::new();
    resources.insert(
        root_folder_id.to_string(),
        serde_json::json!({
            "id": root_folder_id,
            "type": 0, // Folder
            "name": "Projects",
            "parentId": null,
            "createdAt": now,
            "updatedAt": now,
            "archived": false,
            "createdByUserId": user_id,
        }),
    );
    ResourceContainer {
        _id: team_id.to_string(),
        id: team_id.to_string(),
        resources,
        created_at: now,
        updated_at: now,
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_empty_file_shape() {
        let file = create_empty_file("test-id", TEAM_ID, USER_ID);

        assert_eq!(file._id, "test-id");
        assert_eq!(file.id, "test-id");
        assert_eq!(file.resources_id, TEAM_ID);
        assert_eq!(file.user_id, USER_ID);
        assert_eq!(file.cloned_from, "");
        assert_eq!(file.schema, SCHEMA_VERSION);
        assert_eq!(file.pages.len(), 1);
        assert_eq!(file.pages[0].id, "1-0");
        assert_eq!(file.pages[0].label, "Page 1");
        assert!(!file.pages[0].soft_deleted);
        assert!(file.nodes.contains_key("root_node_1-0"));
        let root = &file.nodes["root_node_1-0"];
        assert_eq!(root.id, "root_node_1-0");
        assert_eq!(root.styles, serde_json::json!({"display": "*"}));
        assert!(!root.soft_deleted);
        assert_eq!(file.counter.pages, 1);
        assert!(file.label_counter.is_empty());
        assert!(file.node_relationships.is_empty());
        assert!(!file.is_tutorial);
    }

    #[test]
    fn test_create_empty_file_serializes() {
        let file = create_empty_file("test-id", TEAM_ID, USER_ID);
        let json = serde_json::to_string_pretty(&file).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed["_id"], "test-id");
        assert_eq!(parsed["id"], "test-id");
        assert!(parsed["pages"].is_array());
        assert!(parsed["nodes"].is_object());
        assert_eq!(parsed["clonedFrom"], "");
        assert_eq!(parsed["schema"], SCHEMA_VERSION);
        assert_eq!(parsed["isTutorial"], false);
        // Check soft-delete key is serialized as "~"
        assert_eq!(parsed["pages"][0]["~"], false);
        assert_eq!(parsed["nodes"]["root_node_1-0"]["~"], false);
    }

    #[test]
    fn test_create_empty_file_roundtrip() {
        let file = create_empty_file("roundtrip-id", TEAM_ID, USER_ID);
        let json = serde_json::to_string(&file).unwrap();
        let deserialized: FileData = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized._id, "roundtrip-id");
        assert_eq!(deserialized.pages.len(), 1);
        assert_eq!(deserialized.nodes.len(), 1);
    }

    #[test]
    fn test_edit_op_add_serialize() {
        let op = EditOp::Add {
            path: "/nodes/abc/styles/width".to_string(),
            value: serde_json::json!(100),
        };
        let json = serde_json::to_string(&op).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed["type"], "add");
        assert_eq!(parsed["path"], "/nodes/abc/styles/width");
        assert_eq!(parsed["value"], 100);
    }

    #[test]
    fn test_edit_op_remove_deserialize() {
        let json = r#"{"type":"remove","path":"/nodes/abc"}"#;
        let op: EditOp = serde_json::from_str(json).unwrap();
        match op {
            EditOp::Remove { path } => assert_eq!(path, "/nodes/abc"),
            _ => panic!("Expected Remove variant"),
        }
    }

    #[test]
    fn test_edit_op_splice_roundtrip() {
        let op = EditOp::Splice {
            path: "/pages/0".to_string(),
            removed_count: 1,
            added: vec![serde_json::json!({"id": "new-page"})],
        };
        let json = serde_json::to_string(&op).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed["type"], "splice");
        assert_eq!(parsed["removedCount"], 1);
        assert!(parsed["added"].is_array());
    }

    #[test]
    fn test_ws_message_serialization() {
        let pong = PongMsg {
            t: 11,
            min_client: Some(0),
        };
        let json = serde_json::to_string(&pong).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed["$t"], 11);
        assert_eq!(parsed["minClient"], 0);
    }

    #[test]
    fn test_seed_resources_shape() {
        let rc = seed_resources(TEAM_ID, ROOT_FOLDER_ID, USER_ID);
        assert_eq!(rc._id, TEAM_ID);
        assert_eq!(rc.id, TEAM_ID);
        assert!(rc.resources.contains_key(ROOT_FOLDER_ID));
        let folder = &rc.resources[ROOT_FOLDER_ID];
        assert_eq!(folder["type"], serde_json::json!(0));
        assert_eq!(folder["name"], serde_json::json!("Projects"));
        assert_eq!(folder["parentId"], serde_json::Value::Null);
        assert_eq!(folder["archived"], serde_json::json!(false));
        assert_eq!(folder["createdByUserId"], serde_json::json!(USER_ID));
    }

    #[test]
    fn test_resource_type_repr() {
        let rt = ResourceType::File;
        let json = serde_json::to_string(&rt).unwrap();
        assert_eq!(json, "1");

        let rt: ResourceType = serde_json::from_str("0").unwrap();
        assert_eq!(rt, ResourceType::Folder);
    }
}
