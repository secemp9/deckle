// MCP (Model Context Protocol) server — exposes Deckle tools to AI agents on port 29979.
//
// Replaces: extracted_app/src/mcp/server.ts
//
// Architecture: This is a PROXY server. It receives MCP tool calls from AI clients
// (Claude Code, Cursor, etc.) and forwards them to the Deckle web app running in a
// webview. When no webview is connected, it returns static tool definitions and an
// error message for tool calls.
//
// Uses the rmcp crate's StreamableHttpService as a Tower service mounted on axum,
// with a custom ServerHandler implementation that dynamically proxies tool calls
// through the McpBridge trait.

use std::collections::HashMap;
use std::convert::Infallible;
use std::future::Future;
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll};

use async_trait::async_trait;
use axum::{
    extract::{Request, State as AxumState},
    http,
    middleware::{self, Next},
    response::{IntoResponse, Response},
    Router,
};
use http::StatusCode;
use rmcp::{
    model::{
        CallToolRequestParams, CallToolResult, ClientCapabilities, Content, Implementation,
        InitializeRequestParams, ListToolsResult, PaginatedRequestParams, ServerCapabilities,
        ServerInfo, Tool, ToolAnnotations,
    },
    service::{RequestContext, RoleServer},
    transport::streamable_http_server::{
        session::{
            local::LocalSessionManager,
            store::{SessionState, SessionStore, SessionStoreError},
        },
        StreamableHttpServerConfig, StreamableHttpService,
    },
    ServerHandler,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Manager};
use tokio::sync::oneshot;
use tokio::time::{timeout, Duration};
use tokio_util::sync::CancellationToken;
use tower::Service;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Bridge trait — the seam between the MCP server and the webview
// ---------------------------------------------------------------------------

/// Result of a tool call forwarded through the bridge.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpToolResult {
    /// Content items to return to the MCP client.
    pub content: Vec<Content>,
    /// Whether the result represents an error condition.
    #[serde(default)]
    pub is_error: bool,
}

/// Contract for communicating with the Deckle editor.
///
/// In standalone mode, `StandaloneBridge` returns static tool definitions and
/// an error for all tool calls. When a Tauri webview is available, a
/// `WebviewBridge` implementation will forward calls via IPC.
pub trait McpBridge: Send + Sync + 'static {
    /// Return the MCP server configuration: instructions text and tool definitions.
    fn get_server_config(
        &self,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = McpServerConfig> + Send>>;

    /// Forward a tool call to the editor. `session_id` identifies the MCP
    /// session (one per agent conversation). `name` is the tool name,
    /// `args` is the JSON arguments object.
    fn call_tool(
        &self,
        session_id: &str,
        name: &str,
        args: Value,
    ) -> Pin<Box<dyn Future<Output = Result<McpToolResult, String>> + Send>>;

    /// Notify the editor that an agent session has ended, so it can clean up
    /// any session-scoped state (selections, highlights, undo groups).
    fn remove_agent(&self, session_id: &str) -> Pin<Box<dyn Future<Output = ()> + Send>>;

    /// Send a log message to the editor's developer console (visible in
    /// webview devtools). The `level` parameter is optional and defaults to
    /// "log" — valid values are "log", "warn", "error".
    fn mcp_log(
        &self,
        message: &str,
        level: Option<&str>,
    ) -> Pin<Box<dyn Future<Output = ()> + Send>>;
}

/// Server configuration returned by the bridge (mirrors MCPServerConfig in TS).
pub struct McpServerConfig {
    pub instructions: Option<String>,
    pub tools: Vec<Tool>,
}

// ---------------------------------------------------------------------------
// StandaloneBridge — works without a webview
// ---------------------------------------------------------------------------

/// Bridge implementation for standalone mode. Returns static tool definitions
/// and a "no editor" error for all tool calls.
pub struct StandaloneBridge {
    config: McpServerConfig,
}

impl StandaloneBridge {
    pub fn new() -> Self {
        Self {
            config: McpServerConfig {
                instructions: Some(INSTRUCTIONS.to_string()),
                tools: build_static_tools(),
            },
        }
    }
}

impl McpBridge for StandaloneBridge {
    fn get_server_config(&self) -> Pin<Box<dyn Future<Output = McpServerConfig> + Send>> {
        let instructions = self.config.instructions.clone();
        let tools = self.config.tools.clone();
        Box::pin(async move {
            McpServerConfig {
                instructions,
                tools,
            }
        })
    }

    fn call_tool(
        &self,
        _session_id: &str,
        _name: &str,
        _args: Value,
    ) -> Pin<Box<dyn Future<Output = Result<McpToolResult, String>> + Send>> {
        Box::pin(async move {
            Err("No editor window is open. Please open Deckle Desktop and try again.".to_string())
        })
    }

    fn remove_agent(&self, _session_id: &str) -> Pin<Box<dyn Future<Output = ()> + Send>> {
        Box::pin(async {})
    }

    fn mcp_log(
        &self,
        _message: &str,
        _level: Option<&str>,
    ) -> Pin<Box<dyn Future<Output = ()> + Send>> {
        Box::pin(async {})
    }
}

// ---------------------------------------------------------------------------
// ProxyBridge — forwards tool calls to the GUI's HTTP MCP server
// ---------------------------------------------------------------------------

/// Request/response types for the internal REST proxy endpoints.
#[derive(Serialize, Deserialize)]
struct InternalCallToolRequest {
    session_id: String,
    name: String,
    args: Value,
}

#[derive(Serialize, Deserialize)]
struct InternalRemoveAgentRequest {
    session_id: String,
}

#[derive(Serialize, Deserialize)]
struct InternalLogRequest {
    message: String,
    level: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct InternalServerConfigResponse {
    instructions: Option<String>,
    tools: Vec<Tool>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct InternalCallToolResponse {
    content: Vec<Content>,
    #[serde(default)]
    is_error: bool,
}

/// Bridge implementation that proxies all calls to the GUI process's internal
/// REST endpoints on the MCP server port. Used by `--mcp` stdio mode so
/// Claude Code can spawn a lightweight stdio process while the actual tool
/// execution happens in the running GUI process with its webview.
pub struct ProxyBridge {
    base_url: String,
    client: reqwest::Client,
}

impl ProxyBridge {
    /// Create a proxy bridge that forwards to the given port.
    pub fn new(port: u16) -> Self {
        Self {
            base_url: format!("http://127.0.0.1:{}", port),
            client: reqwest::Client::builder()
                .timeout(Duration::from_secs(60))
                .build()
                .expect("Failed to create HTTP client"),
        }
    }

    /// Wait for the GUI's internal endpoint to be reachable. Polls every 500ms
    /// for up to `max_wait` seconds. Returns true if the server responded.
    pub async fn wait_for_gui(&self, max_wait_secs: u32) -> bool {
        let url = format!("{}/internal/server-config", self.base_url);
        let deadline = tokio::time::Instant::now() + Duration::from_secs(max_wait_secs as u64);

        loop {
            match self.client.get(&url).send().await {
                Ok(resp) if resp.status().is_success() => {
                    tracing::info!(
                        "[mcp-proxy] GUI MCP server at {} is reachable",
                        self.base_url
                    );
                    return true;
                }
                Ok(resp) => {
                    tracing::debug!(
                        "[mcp-proxy] GUI responded with status {} — retrying",
                        resp.status()
                    );
                }
                Err(e) => {
                    tracing::debug!("[mcp-proxy] GUI not reachable yet: {}", e);
                }
            }

            if tokio::time::Instant::now() >= deadline {
                tracing::warn!(
                    "[mcp-proxy] Timed out after {}s waiting for GUI MCP server at {}",
                    max_wait_secs,
                    self.base_url
                );
                return false;
            }

            tokio::time::sleep(Duration::from_millis(500)).await;
        }
    }
}

impl McpBridge for ProxyBridge {
    fn get_server_config(&self) -> Pin<Box<dyn Future<Output = McpServerConfig> + Send>> {
        let url = format!("{}/internal/server-config", self.base_url);
        let client = self.client.clone();
        Box::pin(async move {
            match client.get(&url).send().await {
                Ok(resp) if resp.status().is_success() => {
                    match resp.json::<InternalServerConfigResponse>().await {
                        Ok(config) => McpServerConfig {
                            instructions: config.instructions,
                            tools: config.tools,
                        },
                        Err(e) => {
                            tracing::warn!(
                                "[mcp-proxy] Failed to parse server config response: {}; using static config",
                                e
                            );
                            McpServerConfig {
                                instructions: Some(INSTRUCTIONS.to_string()),
                                tools: build_static_tools(),
                            }
                        }
                    }
                }
                Ok(resp) => {
                    tracing::warn!(
                        "[mcp-proxy] Server config returned status {}; using static config",
                        resp.status()
                    );
                    McpServerConfig {
                        instructions: Some(INSTRUCTIONS.to_string()),
                        tools: build_static_tools(),
                    }
                }
                Err(e) => {
                    tracing::warn!(
                        "[mcp-proxy] Failed to reach GUI for server config: {}; using static config",
                        e
                    );
                    McpServerConfig {
                        instructions: Some(INSTRUCTIONS.to_string()),
                        tools: build_static_tools(),
                    }
                }
            }
        })
    }

    fn call_tool(
        &self,
        session_id: &str,
        name: &str,
        args: Value,
    ) -> Pin<Box<dyn Future<Output = Result<McpToolResult, String>> + Send>> {
        let url = format!("{}/internal/call-tool", self.base_url);
        let client = self.client.clone();
        let body = InternalCallToolRequest {
            session_id: session_id.to_string(),
            name: name.to_string(),
            args,
        };
        Box::pin(async move {
            let resp = client
                .post(&url)
                .json(&body)
                .send()
                .await
                .map_err(|e| {
                    format!(
                        "Cannot reach Deckle Desktop GUI. Make sure the Deckle Desktop app is \
                         running, then try again. ({})",
                        e
                    )
                })?;

            if !resp.status().is_success() {
                let status = resp.status();
                let text = resp.text().await.unwrap_or_default();
                return Err(format!(
                    "Deckle GUI returned error (HTTP {}): {}",
                    status, text
                ));
            }

            let result: InternalCallToolResponse = resp.json().await.map_err(|e| {
                format!("Failed to parse tool call response from Deckle GUI: {}", e)
            })?;
            Ok(McpToolResult {
                content: result.content,
                is_error: result.is_error,
            })
        })
    }

    fn remove_agent(&self, session_id: &str) -> Pin<Box<dyn Future<Output = ()> + Send>> {
        let url = format!("{}/internal/remove-agent", self.base_url);
        let client = self.client.clone();
        let body = InternalRemoveAgentRequest {
            session_id: session_id.to_string(),
        };
        Box::pin(async move {
            let _ = client.post(&url).json(&body).send().await;
        })
    }

    fn mcp_log(
        &self,
        message: &str,
        level: Option<&str>,
    ) -> Pin<Box<dyn Future<Output = ()> + Send>> {
        let url = format!("{}/internal/log", self.base_url);
        let client = self.client.clone();
        let body = InternalLogRequest {
            message: message.to_string(),
            level: level.map(|s| s.to_string()),
        };
        Box::pin(async move {
            let _ = client.post(&url).json(&body).send().await;
        })
    }
}

// ---------------------------------------------------------------------------
// Shared state for WebviewBridge IPC callbacks
// ---------------------------------------------------------------------------

/// State shared between `WebviewBridge` and the Tauri `__mcp_callback` command.
/// Maps unique call IDs to oneshot senders so eval'd JS can send results back.
pub struct McpBridgeState {
    pending_calls: Mutex<HashMap<String, oneshot::Sender<Result<Value, String>>>>,
}

impl McpBridgeState {
    /// Create a new state (wrapped in `Arc` for sharing).
    pub fn new_arc() -> Arc<Self> {
        Arc::new(Self {
            pending_calls: Mutex::new(HashMap::new()),
        })
    }

    /// Register a pending call. The sender will be notified when the webview
    /// sends back a result via `__mcp_callback`.
    pub fn register(&self, id: String, sender: oneshot::Sender<Result<Value, String>>) {
        let mut map = self.pending_calls.lock().unwrap();
        map.insert(id, sender);
    }

    /// Resolve a pending call by its ID. This is called from the Tauri command
    /// handler when the webview sends back a result.
    pub fn resolve(&self, id: &str, result: Result<Value, String>) {
        let sender = {
            let mut map = self.pending_calls.lock().unwrap();
            map.remove(id)
        };
        if let Some(sender) = sender {
            let _ = sender.send(result);
        }
    }
}

// ---------------------------------------------------------------------------
// WebviewBridge — proxies MCP calls into the Tauri webview via IPC
// ---------------------------------------------------------------------------

/// Bridge implementation that forwards MCP calls to the Deckle editor running
/// in a Tauri webview. Uses `eval()` to call methods on
/// `window.resolveMCPHandlers` and `__TAURI_INTERNALS__.invoke()` to receive
/// the results back.
pub struct WebviewBridge {
    app_handle: AppHandle,
    state: Arc<McpBridgeState>,
}

impl WebviewBridge {
    pub fn new(app_handle: AppHandle, state: Arc<McpBridgeState>) -> Self {
        Self { app_handle, state }
    }

    /// Evaluate JavaScript in the main webview and wait for a result via the
    /// IPC callback channel. The `js_await_expr` should be a JS expression that
    /// can be `await`ed — it will be placed inside `await ({js_await_expr})`.
    async fn eval_with_callback(&self, js_await_expr: &str) -> Result<Value, String> {
        let id = Uuid::new_v4().to_string();
        let (tx, rx) = oneshot::channel();

        self.state.register(id.clone(), tx);

        // Build the JS that will be evaluated in the webview.
        // It polls for resolveMCPHandlers, runs the expression, and sends the
        // result back via Tauri IPC.
        let js = format!(
            "(async () => {{
                const deadline = Date.now() + 10000;
                while (typeof window.resolveMCPHandlers === 'undefined') {{
                    if (Date.now() > deadline) {{
                        throw new Error('MCP handlers not loaded after 10s');
                    }}
                    await new Promise(r => setTimeout(r, 50));
                }}
                try {{
                    const h = await window.resolveMCPHandlers;
                    const result = await ({js_await_expr});
                    await window.__TAURI_INTERNALS__.invoke('__mcp_callback', {{
                        id: '{id}',
                        result: JSON.stringify(result)
                    }});
                }} catch(e) {{
                    await window.__TAURI_INTERNALS__.invoke('__mcp_callback', {{
                        id: '{id}',
                        error: (e && e.message) ? e.message : String(e)
                    }});
                }}
            }})()",
            js_await_expr = js_await_expr,
            id = id,
        );

        let webview = self
            .app_handle
            .get_webview_window("main")
            .ok_or_else(|| "Deckle window is not open".to_string())?;
        webview
            .eval(&js)
            .map_err(|e| format!("Failed to evaluate JS in webview: {}", e))?;

        match timeout(Duration::from_secs(30), rx).await {
            Ok(Ok(result)) => result,
            Ok(Err(_)) => Err("Bridge callback channel closed unexpectedly".to_string()),
            Err(_) => Err("Timeout waiting for Deckle webview to respond".to_string()),
        }
    }

    /// Fire-and-forget JS evaluation. No result is expected back.
    async fn eval_ff(&self, js_await_expr: &str) {
        let js = format!(
            "(async () => {{
                const deadline = Date.now() + 5000;
                while (typeof window.resolveMCPHandlers === 'undefined') {{
                    if (Date.now() > deadline) return;
                    await new Promise(r => setTimeout(r, 50));
                }}
                try {{
                    const h = await window.resolveMCPHandlers;
                    await ({js_await_expr});
                }} catch(e) {{
                    console.error('[MCP Bridge]', String(e));
                }}
            }})()",
            js_await_expr = js_await_expr,
        );
        if let Some(webview) = self.app_handle.get_webview_window("main") {
            let _ = webview.eval(&js);
        }
    }
}

impl McpBridge for WebviewBridge {
    fn get_server_config(&self) -> Pin<Box<dyn Future<Output = McpServerConfig> + Send>> {
        let app_handle = self.app_handle.clone();
        let state = self.state.clone();
        Box::pin(async move {
            let bridge = WebviewBridge { app_handle, state };
            match bridge.eval_with_callback("h.getMCPServerConfig()").await {
                Ok(val) => {
                    let tools = val
                        .get("tools")
                        .and_then(|t| serde_json::from_value(t.clone()).ok())
                        .unwrap_or_default();
                    let instructions = val
                        .get("instructions")
                        .and_then(|i| i.as_str().map(|s| s.to_string()));
                    McpServerConfig {
                        instructions,
                        tools,
                    }
                }
                Err(e) => {
                    tracing::warn!(
                        "[mcp-server] get_server_config failed: {}; using static config",
                        e
                    );
                    McpServerConfig {
                        instructions: Some(INSTRUCTIONS.to_string()),
                        tools: build_static_tools(),
                    }
                }
            }
        })
    }

    fn call_tool(
        &self,
        session_id: &str,
        name: &str,
        args: Value,
    ) -> Pin<Box<dyn Future<Output = Result<McpToolResult, String>> + Send>> {
        let app_handle = self.app_handle.clone();
        let state = self.state.clone();
        let session_id = session_id.to_string();
        let name = name.to_string();
        Box::pin(async move {
            let bridge = WebviewBridge { app_handle, state };
            let args_json = serde_json::to_string(&args).unwrap_or_else(|_| "{}".to_string());
            let js = format!(
                "h.handleToolCall({}, {}, {})",
                serde_json::Value::String(session_id),
                serde_json::Value::String(name),
                args_json,
            );
            let val = bridge.eval_with_callback(&js).await?;
            serde_json::from_value(val).map_err(|e| format!("Failed to parse tool result: {}", e))
        })
    }

    fn remove_agent(&self, session_id: &str) -> Pin<Box<dyn Future<Output = ()> + Send>> {
        let app_handle = self.app_handle.clone();
        let state = self.state.clone();
        let session_id = session_id.to_string();
        Box::pin(async move {
            let bridge = WebviewBridge { app_handle, state };
            let js = format!("h.removeAgent({})", serde_json::Value::String(session_id),);
            bridge.eval_ff(&js).await;
        })
    }

    fn mcp_log(
        &self,
        message: &str,
        level: Option<&str>,
    ) -> Pin<Box<dyn Future<Output = ()> + Send>> {
        let app_handle = self.app_handle.clone();
        let state = self.state.clone();
        let message = message.to_string();
        let level = level.map(|s| s.to_string());
        Box::pin(async move {
            let bridge = WebviewBridge { app_handle, state };
            if let Some(lvl) = level {
                let js = format!(
                    "h.mcpLog({}, {})",
                    serde_json::Value::String(message),
                    serde_json::Value::String(lvl),
                );
                bridge.eval_ff(&js).await;
            } else {
                let js = format!("h.mcpLog({})", serde_json::Value::String(message),);
                bridge.eval_ff(&js).await;
            }
        })
    }
}

// ---------------------------------------------------------------------------
// DeckleMcpHandler — implements rmcp::ServerHandler
// ---------------------------------------------------------------------------

/// The MCP server handler. Each session gets its own instance (created by the
/// service factory closure), but they all share the same bridge.
pub struct DeckleMcpHandler {
    bridge: Arc<dyn McpBridge>,
    /// Fallback tool definitions, used only if a dynamic fetch fails.
    /// When the bridge can reach the webapp, `list_tools()` fetches fresh
    /// schemas directly from the JS so they always match the Zod definitions.
    fallback_tools: Vec<Tool>,
    /// Cached instructions text.
    instructions: Option<String>,
    /// The session ID, recorded from the first request so it can be used in
    /// `Drop` to notify the editor that this session ended.
    session_id: Mutex<Option<String>>,
}

impl DeckleMcpHandler {
    async fn new(bridge: Arc<dyn McpBridge>) -> Self {
        let config = bridge.get_server_config().await;
        Self {
            bridge,
            fallback_tools: config.tools,
            instructions: config.instructions,
            session_id: Mutex::new(None),
        }
    }
}

impl Drop for DeckleMcpHandler {
    fn drop(&mut self) {
        let sid = self.session_id.lock().unwrap().take();
        if let Some(sid) = sid {
            let bridge = self.bridge.clone();
            tokio::spawn(async move {
                bridge.remove_agent(&sid).await;
            });
        }
    }
}

impl ServerHandler for DeckleMcpHandler {
    fn get_info(&self) -> ServerInfo {
        let mut info = ServerInfo::new(ServerCapabilities::builder().enable_tools().build())
            .with_server_info(Implementation::new("deckle-desktop", "0.4.2"));
        if let Some(ref instructions) = self.instructions {
            info = info.with_instructions(instructions.clone());
        }
        info
    }

    fn list_tools(
        &self,
        _request: Option<PaginatedRequestParams>,
        _context: RequestContext<RoleServer>,
    ) -> impl std::future::Future<Output = Result<ListToolsResult, rmcp::ErrorData>> + Send + '_
    {
        let bridge = self.bridge.clone();
        let fallback = self.fallback_tools.clone();
        async move {
            // Always fetch fresh tool schemas from the bridge so they match
            // the webapp's Zod definitions. The bridge calls through to the
            // GUI's getMCPServerConfig() which returns the real schemas. If
            // the bridge can't reach the webapp it falls back to static defs.
            let config = bridge.get_server_config().await;
            let tools = if config.tools.is_empty() {
                tracing::debug!(
                    "[mcp-server] Dynamic tool fetch returned empty; using fallback tools"
                );
                fallback
            } else {
                config.tools
            };
            Ok(ListToolsResult::with_all_items(tools))
        }
    }

    fn call_tool(
        &self,
        request: CallToolRequestParams,
        context: RequestContext<RoleServer>,
    ) -> impl std::future::Future<Output = Result<CallToolResult, rmcp::ErrorData>> + Send + '_
    {
        // Extract all owned data from self before the async block so the
        // future is 'static (only captures owned values, not &self refs).
        let bridge = self.bridge.clone();
        let tool_name = request.name.to_string();
        let args = match request.arguments {
            Some(map) => Value::Object(map),
            None => Value::Object(serde_json::Map::new()),
        };

        // Extract session ID from the HTTP request parts if available.
        let session_id = context
            .extensions
            .get::<http::request::Parts>()
            .and_then(|parts: &http::request::Parts| {
                parts
                    .headers
                    .get("mcp-session-id")
                    .and_then(|v: &http::HeaderValue| v.to_str().ok())
                    .map(|s: &str| s.to_string())
            })
            .unwrap_or_else(|| Uuid::new_v4().to_string());

        // Record session ID so Drop can notify the editor on cleanup.
        *self.session_id.lock().unwrap() = Some(session_id.clone());

        async move {
            // Log the tool call to the editor console (mirrors Electron).
            bridge
                .mcp_log(
                    &format!(
                        "[mcp-server] Tool call: {} (session: {})",
                        tool_name, session_id
                    ),
                    Some("info"),
                )
                .await;

            // Tool schemas are now fetched dynamically from the webapp, so
            // args arrive with the correct camelCase keys matching the JS Zod
            // schemas. No snake_to_camel conversion needed.

            match bridge.call_tool(&session_id, &tool_name, args).await {
                Ok(result) => {
                    if result.is_error {
                        bridge
                            .mcp_log(
                                &format!(
                                    "[mcp-server] Tool error: {} (session: {})",
                                    tool_name, session_id
                                ),
                                Some("warn"),
                            )
                            .await;
                        Ok(CallToolResult::error(result.content))
                    } else {
                        Ok(CallToolResult::success(result.content))
                    }
                }
                Err(e) => {
                    bridge
                        .mcp_log(
                            &format!(
                                "[mcp-server] Tool call failed: {} — {} (session: {})",
                                tool_name, e, session_id
                            ),
                            Some("error"),
                        )
                        .await;
                    Ok(CallToolResult::error(vec![Content::text(e)]))
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------

/// Middleware that ensures the Accept header contains both `application/json`
/// and `text/event-stream` as required by the Streamable HTTP spec.
///
/// Some MCP clients (e.g. Claude Code) omit the Accept header or send an
/// incomplete value, causing rmcp's `StreamableHttpService` to return 406
/// which the client then misinterprets as an auth failure.
/// See: https://github.com/anthropics/claude-code/issues/42470
///
/// Mirrors the fix in `extracted_app/src/mcp/server.ts` (lines 180-195).
async fn accept_header_middleware(mut request: Request, next: Next) -> Response {
    let accept = request
        .headers()
        .get(http::header::ACCEPT)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    if !accept.contains("application/json") || !accept.contains("text/event-stream") {
        request.headers_mut().insert(
            http::header::ACCEPT,
            http::HeaderValue::from_static("application/json, text/event-stream"),
        );
    }

    next.run(request).await
}

/// Middleware that blocks browser requests (Origin header) and validates
/// the Host header for DNS rebinding protection. This mirrors the security
/// checks in the original TypeScript server.
async fn security_middleware(request: Request, next: Next) -> Response {
    let headers = request.headers();
    let method = request.method().clone();

    // Block CORS preflight requests.
    if method == http::Method::OPTIONS {
        tracing::warn!("[mcp-server] Blocked CORS preflight request");
        return StatusCode::FORBIDDEN.into_response();
    }

    // Block requests with Origin header — browsers send this, MCP clients do not.
    if headers.contains_key(http::header::ORIGIN) {
        let origin = headers
            .get(http::header::ORIGIN)
            .and_then(|v| v.to_str().ok())
            .unwrap_or("unknown");
        tracing::warn!(
            "[mcp-server] Blocked browser request from origin: {}",
            origin
        );
        return (
            StatusCode::FORBIDDEN,
            axum::Json(json!({
                "status": "forbidden",
                "message": "Browser requests not allowed"
            })),
        )
            .into_response();
    }

    // Validate Host header to prevent DNS rebinding attacks.
    // Mirrors the TypeScript server's allowedHosts check.
    if let Some(host) = headers.get(http::header::HOST) {
        if let Ok(host_str) = host.to_str() {
            let allowed_hosts = ["127.0.0.1:29979", "localhost:29979"];
            if !allowed_hosts.contains(&host_str) {
                tracing::warn!(
                    "[mcp-server] Blocked DNS rebinding attempt with host: {}",
                    host_str
                );
                return (
                    StatusCode::FORBIDDEN,
                    axum::Json(json!({
                        "status": "forbidden",
                        "message": "Invalid host"
                    })),
                )
                    .into_response();
            }
        }
    }

    next.run(request).await
}

// ---------------------------------------------------------------------------
// TokenStore — bearer token auth for headless mode
// ---------------------------------------------------------------------------

/// Result of setting a token for the first time vs. refreshing.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum TokenState {
    /// The first token was set — this locks the process to a user.
    Initial,
    /// The token was updated (e.g. refreshed by the auth server).
    Refresh,
}

/// Stores a bearer token and provides constant-time comparison of SHA-256
/// hashes. Mirrors the Electron `createTokenStore()` in auth-through-mcp.ts.
///
/// In this mock/local server there is no real API to validate against, so any
/// bearer token is accepted as the first token. Subsequent requests must
/// present a token whose SHA-256 hash matches the stored one (constant-time).
struct TokenStore {
    current_token: Option<String>,
}

impl TokenStore {
    fn new() -> Self {
        Self {
            current_token: None,
        }
    }

    fn read(&self) -> Option<&str> {
        self.current_token.as_deref()
    }

    /// Set the token. If a token is already stored, this treats the new token
    /// as a refresh (matching the Electron behavior where the store trusts the
    /// caller has already validated the token).
    fn set(&mut self, token: &str) -> Result<TokenState, String> {
        if self.current_token.is_some() {
            // Already set — treat as a refresh (mirrors Electron TokenStore.set)
            self.current_token = Some(token.to_string());
            return Ok(TokenState::Refresh);
        }
        // First token — accept unconditionally (mock server, no remote
        // validation needed).
        self.current_token = Some(token.to_string());
        Ok(TokenState::Initial)
    }

    /// Returns true if `plaintext` has the same SHA-256 hash as the stored
    /// token. Comparison is constant-time to prevent timing side-channels.
    /// Returns false when no token is stored.
    fn matches(&self, plaintext: &str) -> bool {
        let current = match &self.current_token {
            Some(t) => t,
            None => return false,
        };
        let incoming_hash = sha256(plaintext);
        let current_hash = sha256(current);
        constant_time_eq_32(&incoming_hash, &current_hash)
    }
}

/// SHA-256 hash of a string, returned as a 32-byte array.
fn sha256(input: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    let mut out = [0u8; 32];
    out.copy_from_slice(&result);
    out
}

/// Constant-time comparison of two 32-byte arrays. Every byte is compared and
/// the result is ORed together, so no early-exit branch is taken. Mirrors
/// Node.js `crypto.timingSafeEqual`.
fn constant_time_eq_32(a: &[u8; 32], b: &[u8; 32]) -> bool {
    let mut result: u8 = 0;
    for i in 0..32 {
        result |= a[i] ^ b[i];
    }
    result == 0
}

/// Global token store for bearer token auth in headless mode.
/// Mirrors the Electron `TokenStore` singleton from `createTokenStore()`.
static TOKEN_STORE: std::sync::OnceLock<Mutex<TokenStore>> = std::sync::OnceLock::new();

/// One-shot callback fired when the first token is received.
static FIRST_TOKEN_ONCE: std::sync::Once = std::sync::Once::new();

fn get_token_store() -> &'static Mutex<TokenStore> {
    TOKEN_STORE.get_or_init(|| Mutex::new(TokenStore::new()))
}

/// Bearer token wrapper service for headless mode.
///
/// Wraps an inner Tower service and checks the Authorization header against the
/// global [`TOKEN_STORE`]. Only active when `DECKLE_HEADLESS_MCP=true`.
///
/// Mirrors the Electron middleware in server.ts.
#[derive(Clone)]
struct BearerTokenService<S> {
    inner: S,
}

impl<S> BearerTokenService<S> {
    /// Forward the request to the inner service, converting the response to
    /// axum's [`Response`] type via `IntoResponse`.
    fn forward(
        &mut self,
        req: Request,
    ) -> Pin<Box<dyn Future<Output = Result<Response, Infallible>> + Send>>
    where
        S: Service<Request, Error = Infallible> + Clone + Send + 'static,
        S::Response: IntoResponse + 'static,
        S::Future: Send + 'static,
    {
        let mut inner = self.inner.clone();
        Box::pin(async move { inner.call(req).await.map(IntoResponse::into_response) })
    }
}

impl<S> Service<Request> for BearerTokenService<S>
where
    S: Service<Request, Error = Infallible> + Clone + Send + 'static,
    S::Response: IntoResponse + 'static,
    S::Future: Send + 'static,
{
    type Response = Response;
    type Error = Infallible;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: Request) -> Self::Future {
        let headless = std::env::var("DECKLE_HEADLESS_MCP").as_deref() == Ok("true");
        let is_delete = req.method() == http::Method::DELETE;

        // Early exit: not headless or DELETE — pass through without auth.
        if !headless || is_delete {
            return self.forward(req);
        }

        // Read the Authorization header without consuming the request.
        let auth_value = req
            .headers()
            .get(http::header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .unwrap_or("")
            .to_string();

        // Validate the header format.
        if !auth_value.starts_with("Bearer ") {
            return Box::pin(
                async move { Ok(bearer_unauthorized_response("Missing bearer token")) },
            );
        }

        let auth_token = auth_value["Bearer ".len()..].trim().to_string();
        if auth_token.is_empty() {
            return Box::pin(async move { Ok(bearer_unauthorized_response("Empty bearer token")) });
        }

        // Check against the token store.
        let mut store = get_token_store().lock().unwrap();

        if store.matches(&auth_token) {
            // Already authenticated — forward the request.
            drop(store);
            return self.forward(req);
        }

        match store.set(&auth_token) {
            Ok(TokenState::Initial) => {
                drop(store);
                FIRST_TOKEN_ONCE.call_once(|| {
                    tracing::info!("[mcp-server] First token received in headless mode");
                });
                self.forward(req)
            }
            Ok(TokenState::Refresh) => {
                drop(store);
                self.forward(req)
            }
            Err(reason) => {
                drop(store);
                tracing::warn!("[mcp-server] Token auth failed: {}", reason);
                Box::pin(async move { Ok(bearer_unauthorized_response(&reason)) })
            }
        }
    }
}

/// Build a 401 JSON response with the given message.
///
/// NOTE: does NOT use `error` / `error_description` field names — Claude
/// Code's MCP SDK interprets that shape as an OAuth challenge.
fn bearer_unauthorized_response(message: &str) -> Response {
    let body = serde_json::to_vec(&json!({
        "status": "unauthorized",
        "message": message,
    }))
    .unwrap_or_default();
    Response::builder()
        .status(StatusCode::UNAUTHORIZED)
        .header("content-type", "application/json")
        .body(axum::body::Body::from(body))
        .unwrap()
}

/// A session store that enables transparent session resurrection after server
/// restart.
///
/// When the server restarts, clients may send requests with session IDs from
/// before the restart. This store returns a default [`SessionState`] for any
/// session ID, allowing rmcp's `try_restore_from_store` to recreate the session
/// transparently by replaying a synthetic `initialize` handshake. The handler
/// ([`DeckleMcpHandler`]) does not depend on the client's initialize params, so
/// using defaults is safe.
///
/// The Electron reference implementation achieves the same effect by omitting
/// the `sessionIdGenerator` option, which allows the transport to process any
/// request (not just `initialize`) on a new session. rmcp lacks equivalent API
/// control, so the same outcome is achieved through this store + rmcp's
/// cross-instance restore mechanism.
struct ResurrectionStore;

#[async_trait]
impl SessionStore for ResurrectionStore {
    async fn load(&self, _session_id: &str) -> Result<Option<SessionState>, SessionStoreError> {
        Ok(Some(SessionState::new(InitializeRequestParams::new(
            ClientCapabilities::default(),
            Implementation::default(),
        ))))
    }

    async fn store(
        &self,
        _session_id: &str,
        _state: &SessionState,
    ) -> Result<(), SessionStoreError> {
        // The synthetic initialize params are not meaningful to persist.
        Ok(())
    }

    async fn delete(&self, _session_id: &str) -> Result<(), SessionStoreError> {
        // Nothing to delete — our store is stateless.
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Internal REST endpoints — used by ProxyBridge in --mcp stdio mode
// ---------------------------------------------------------------------------

/// Handler for `GET /internal/server-config` — returns tool definitions and
/// instructions from the bridge.
async fn internal_server_config(
    AxumState(bridge): AxumState<Arc<dyn McpBridge>>,
) -> axum::Json<Value> {
    let config = bridge.get_server_config().await;
    // Serialize tools via serde_json since Tool implements Serialize.
    let tools_val = serde_json::to_value(&config.tools).unwrap_or(json!([]));
    axum::Json(json!({
        "instructions": config.instructions,
        "tools": tools_val,
    }))
}

/// Handler for `POST /internal/call-tool` — forwards a tool call through
/// the bridge to the webview.
async fn internal_call_tool(
    AxumState(bridge): AxumState<Arc<dyn McpBridge>>,
    axum::Json(body): axum::Json<InternalCallToolRequest>,
) -> Response {
    match bridge.call_tool(&body.session_id, &body.name, body.args).await {
        Ok(result) => axum::Json(json!({
            "content": result.content,
            "isError": result.is_error,
        }))
        .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            axum::Json(json!({ "error": e })),
        )
            .into_response(),
    }
}

/// Handler for `POST /internal/remove-agent` — notifies the editor that
/// a session has ended.
async fn internal_remove_agent(
    AxumState(bridge): AxumState<Arc<dyn McpBridge>>,
    axum::Json(body): axum::Json<InternalRemoveAgentRequest>,
) -> StatusCode {
    bridge.remove_agent(&body.session_id).await;
    StatusCode::NO_CONTENT
}

/// Handler for `POST /internal/log` — forwards a log message to the editor
/// console.
async fn internal_log(
    AxumState(bridge): AxumState<Arc<dyn McpBridge>>,
    axum::Json(body): axum::Json<InternalLogRequest>,
) -> StatusCode {
    bridge
        .mcp_log(&body.message, body.level.as_deref())
        .await;
    StatusCode::NO_CONTENT
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/// Start the MCP server on the given port.
///
/// The server exposes Deckle's design tools over the MCP Streamable HTTP
/// protocol. AI clients connect to `http://127.0.0.1:{port}/mcp`.
pub async fn start(
    port: u16,
    bridge: Arc<dyn McpBridge>,
    shutdown: CancellationToken,
) -> Result<(), Box<dyn std::error::Error>> {
    let ct = shutdown;

    // Fetch an initial config to use as fallback for the factory closure.
    // The factory is synchronous (FnMut -> Result<Handler>), so it can't
    // call async get_server_config(). Instead, each handler's list_tools()
    // fetches fresh schemas dynamically from the bridge. The fallback is
    // only used if that dynamic fetch fails.
    let initial_config = bridge.get_server_config().await;
    let shared_fallback_tools = Arc::new(initial_config.tools);
    let shared_instructions = Arc::new(initial_config.instructions);

    let bridge_for_factory = bridge.clone();
    let fallback_tools_for_factory = shared_fallback_tools.clone();
    let instructions_for_factory = shared_instructions.clone();

    // Build the config using the builder, then set session_store directly
    // (the struct is #[non_exhaustive], so we cannot use struct literal syntax).
    let mut config = StreamableHttpServerConfig::default()
        .with_stateful_mode(true)
        // rmcp handles host validation for us — allow localhost and
        // 127.0.0.1 with our port.
        .with_allowed_hosts([
            format!("127.0.0.1:{port}"),
            format!("localhost:{port}"),
            "127.0.0.1".to_string(),
            "localhost".to_string(),
        ])
        // Empty = skip origin check (our middleware blocks ALL origins).
        .disable_allowed_origins()
        .with_cancellation_token(ct.child_token());
    // Enable session resurrection via a store that returns a default
    // SessionState for ANY session ID. When rmcp's handle_post sees
    // an unknown session ID, it calls try_restore_from_store, which
    // loads this state, creates a new session worker, and replays a
    // synthetic initialize handshake — transparently resurrecting the
    // session without requiring the client to re-initialize.
    config.session_store = Some(Arc::new(ResurrectionStore));

    let service: StreamableHttpService<DeckleMcpHandler, LocalSessionManager> =
        StreamableHttpService::new(
            move || {
                let handler = DeckleMcpHandler {
                    bridge: bridge_for_factory.clone(),
                    fallback_tools: (*fallback_tools_for_factory).clone(),
                    instructions: (*instructions_for_factory).clone(),
                    session_id: Mutex::new(None),
                };
                Ok(handler)
            },
            Default::default(),
            config,
        );

    // Wrap the MCP service with bearer token auth (only active when
    // DECKLE_HEADLESS_MCP=true). Uses a custom Tower Service wrapper
    // instead of axum middleware to avoid type compatibility issues
    // between StreamableHttpService and axum's FromFn extractor macro.
    let auth_service = BearerTokenService { inner: service };

    // Internal REST routes for the ProxyBridge (--mcp stdio mode).
    // These bypass the MCP protocol and call the bridge directly.
    // They are only accessible from localhost and are NOT exposed to
    // external MCP clients (separate route prefix, no /mcp path).
    let internal_routes = Router::new()
        .route(
            "/internal/server-config",
            axum::routing::get(internal_server_config),
        )
        .route(
            "/internal/call-tool",
            axum::routing::post(internal_call_tool),
        )
        .route(
            "/internal/remove-agent",
            axum::routing::post(internal_remove_agent),
        )
        .route("/internal/log", axum::routing::post(internal_log))
        .with_state(bridge.clone());

    // Build the axum router.
    let app = Router::new()
        // Mount the MCP service at /mcp.
        .nest_service("/mcp", auth_service)
        // Internal REST endpoints for stdio proxy mode.
        .merge(internal_routes)
        // OAuth/OIDC discovery endpoints — return bare 404 to prevent
        // Claude Code from misclassifying this server as an OAuth provider.
        .route(
            "/.well-known/oauth-authorization-server",
            axum::routing::get(|| async { StatusCode::NOT_FOUND }),
        )
        .route(
            "/.well-known/openid-configuration",
            axum::routing::get(|| async { StatusCode::NOT_FOUND }),
        )
        .route(
            "/.well-known/oauth-protected-resource",
            axum::routing::get(|| async { StatusCode::NOT_FOUND }),
        )
        // Catch-all fallback — avoid OAuth-shaped field names.
        .fallback(|| async {
            (
                StatusCode::NOT_FOUND,
                axum::Json(json!({
                    "status": "not_found",
                    "message": "Route not found. The MCP endpoint is /mcp. Try restarting your agent and Deckle."
                })),
            )
        })
        // Accept header middleware runs first (outermost) to patch missing
        // Accept headers before they reach any handler or the security layer.
        .layer(middleware::from_fn(accept_header_middleware))
        // Security middleware runs on all routes.
        .layer(middleware::from_fn(security_middleware));

    // Bind to localhost only (security).
    let listener = tokio::net::TcpListener::bind(format!("127.0.0.1:{port}")).await?;
    tracing::info!("[mcp-server] Deckle MCP server listening on http://127.0.0.1:{port}/mcp");
    tracing::info!(
        "[mcp-server]   POST /mcp - JSON-RPC; GET /mcp - SSE stream; DELETE /mcp - session cleanup"
    );
    tracing::info!(
        "[mcp-server]   Internal proxy endpoints available at /internal/*"
    );

    axum::serve(listener, app)
        .with_graceful_shutdown(async move { ct.cancelled().await })
        .await?;

    Ok(())
}

/// Create a standalone `DeckleMcpHandler` ready for stdio serving.
///
/// This builds a handler backed by [`StandaloneBridge`] (static tool
/// definitions, no webview required). The returned handler implements
/// [`rmcp::ServiceExt`] so you can serve it over any transport:
///
/// ```rust,no_run
/// use rmcp::ServiceExt as _;
///
/// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
/// let handler = deckle::mcp_server::create_standalone_handler().await;
/// let service = handler.serve(rmcp::transport::io::stdio()).await?;
/// service.waiting().await?;
/// # Ok(())
/// # }
/// ```
pub async fn create_standalone_handler() -> DeckleMcpHandler {
    let bridge: Arc<dyn McpBridge> = Arc::new(StandaloneBridge::new());
    DeckleMcpHandler::new(bridge).await
}

/// Create a proxy `DeckleMcpHandler` that forwards tool calls to the
/// running GUI process's HTTP MCP server.
///
/// The proxy connects to `http://127.0.0.1:{port}/internal/*` endpoints
/// exposed by the GUI process. If the GUI is not yet running, this will
/// wait up to `wait_secs` seconds for it to become available.
///
/// If the GUI cannot be reached within the timeout, the handler falls back
/// to using static tool definitions (so `list_tools` still works) but tool
/// calls will return an error asking the user to start Deckle Desktop.
pub async fn create_proxy_handler(port: u16, _wait_secs: u32) -> DeckleMcpHandler {
    let proxy = ProxyBridge::new(port);

    tracing::info!(
        "[mcp-proxy] Deckle MCP proxy targeting GUI at http://127.0.0.1:{}",
        port
    );

    // Start serving stdio immediately — don't block waiting for the GUI.
    // The proxy bridge handles GUI-not-running gracefully: get_server_config()
    // falls back to static tool definitions, and call_tool() returns a clear
    // error asking the user to start Deckle Desktop.
    let bridge: Arc<dyn McpBridge> = Arc::new(proxy);
    DeckleMcpHandler::new(bridge).await
}

// ---------------------------------------------------------------------------
// Static tool definitions
// ---------------------------------------------------------------------------

/// Instructions text returned to MCP clients.
const INSTRUCTIONS: &str = r#"Deckle is a professional design tool for creating user interfaces. The Deckle MCP server gives you tools to be a talented designer for web and mobile apps and websites. You can read designs from the user's file, understand what the user is currently doing, and write HTML back into the design as new nodes.

You MUST load the full guide before other Deckle tools: get_guide({ topic: "deckle-mcp-instructions" }). Do this once per session; call again if a long thread may have compressed or dropped guide text.

- Context: call get_basic_info first to understand artboards and dimensions; use get_selection to see user focus.
- Typography: you MUST call get_font_family_info before your first typographic styling in a session. Prefer font families already listed in get_basic_info unless the user specifies otherwise. Use px for font sizes, em for letter-spacing, px for line-height.
- New designs: before writing HTML, generate a brief (palette, type scale, spacing, direction) unless the user provides a design system.
- Creating/editing: each write_html call should add roughly one visual group; prefer duplicate_nodes with update_styles and set_text_content when it is faster than rewriting HTML.
- Quality: use get_screenshot to review after meaningful changes. Artboard height is a starting point — when content clips switch the artboard to height: "fit-content" via update_styles rather than guessing fixed heights.
- Repeated rows (lists, nav): use fixed-width slots for icons and trailing actions (flexShrink: 0); do not rely on gap alone to align columns across rows.
- When done creating or editing, you MUST call finish_working_on_nodes.
- User-facing output: do not include raw node IDs.
- Export to the user's codebase: use get_jsx, get_computed_styles, get_fill_image, etc. for exact values — do not read sizes or colors from screenshots alone."#;

/// Build static tool definitions that approximate the Deckle webapp's MCP handler.
///
/// These are used as FALLBACK when the webapp is not reachable (e.g. the GUI
/// hasn't started yet). When the webapp IS reachable, `list_tools()` fetches
/// the real Zod-derived schemas dynamically and these are never used.
///
/// IMPORTANT: Parameter names use camelCase to match the webapp's Zod schemas.
/// Do NOT use snake_case here — Claude Code sends args matching the schema keys,
/// and the webapp validates them as-is.
fn build_static_tools() -> Vec<Tool> {
    // Helper to create a tool with a JSON Schema input.
    fn tool(name: &str, description: &str, schema: Value) -> Tool {
        let mut input_schema: serde_json::Map<String, Value> = match schema {
            Value::Object(map) => map,
            _ => {
                let mut m = serde_json::Map::new();
                m.insert("type".to_string(), json!("object"));
                m
            }
        };
        input_schema
            .entry("$schema".to_string())
            .or_insert_with(|| json!("https://json-schema.org/draft/2020-12/schema"));
        input_schema
            .entry("additionalProperties".to_string())
            .or_insert_with(|| json!(false));
        Tool::new(
            name.to_string(),
            description.to_string(),
            Arc::new(input_schema),
        )
    }

    let read_only = || ToolAnnotations::new().read_only(true);
    let destructive = || ToolAnnotations::new().destructive(true);

    vec![
        tool(
            "get_guide",
            "Load the Deckle MCP guide. You MUST call this before using any other Deckle tools. Pass topic: \"deckle-mcp-instructions\" for the full guide.",
            json!({
                "type": "object",
                "properties": {
                    "topic": { "type": "string", "description": "The guide topic to load, e.g. \"deckle-mcp-instructions\"" }
                },
                "required": ["topic"]
            }),
        ),
        tool(
            "get_basic_info",
            "Get basic information about the current file: pages, artboards, fonts, tokens, and active page.",
            json!({ "type": "object", "properties": {} }),
        ).with_annotations(read_only()),
        tool(
            "get_selection",
            "Get information about the current user selection in the editor.",
            json!({ "type": "object", "properties": {} }),
        ).with_annotations(read_only()),
        tool(
            "get_node_info",
            "Get detailed information about a specific node by ID.",
            json!({
                "type": "object",
                "properties": {
                    "nodeId": { "type": "string", "description": "The ID of the node to inspect" }
                },
                "required": ["nodeId"]
            }),
        ).with_annotations(read_only()),
        tool(
            "get_children",
            "Get the children of a node.",
            json!({
                "type": "object",
                "properties": {
                    "nodeId": { "type": "string", "description": "The ID of the parent node" }
                },
                "required": ["nodeId"]
            }),
        ).with_annotations(read_only()),
        tool(
            "get_screenshot",
            "Capture a screenshot of a node as a PNG or JPEG image.",
            json!({
                "type": "object",
                "properties": {
                    "nodeId": { "type": "string", "description": "The ID of the node to capture" },
                    "transparent": { "type": "boolean", "description": "Whether to use a transparent background" },
                    "scale": { "type": "number", "description": "Scale factor for the screenshot (default 1)" }
                },
                "required": ["nodeId"]
            }),
        ).with_annotations(read_only()),
        tool(
            "get_jsx",
            "Get the JSX representation of a node, useful for exporting to code.",
            json!({
                "type": "object",
                "properties": {
                    "nodeId": { "type": "string", "description": "The ID of the node to export" },
                    "format": { "type": "string", "enum": ["tailwind", "inline-styles"], "description": "Output format" }
                },
                "required": ["nodeId"]
            }),
        ).with_annotations(read_only()),
        tool(
            "get_tree_summary",
            "Get a summary of the node tree structure from a given root.",
            json!({
                "type": "object",
                "properties": {
                    "nodeId": { "type": "string", "description": "The root node ID" },
                    "depth": { "type": "number", "description": "Maximum depth to traverse" }
                },
                "required": ["nodeId"]
            }),
        ).with_annotations(read_only()),
        tool(
            "get_computed_styles",
            "Get the computed CSS styles for one or more nodes.",
            json!({
                "type": "object",
                "properties": {
                    "nodeIds": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "Array of node IDs to get styles for"
                    }
                },
                "required": ["nodeIds"]
            }),
        ).with_annotations(read_only()),
        tool(
            "get_fill_image",
            "Get the fill image data for a node (base64-encoded).",
            json!({
                "type": "object",
                "properties": {
                    "nodeId": { "type": "string", "description": "The ID of the node with an image fill" }
                },
                "required": ["nodeId"]
            }),
        ).with_annotations(read_only()),
        tool(
            "get_font_family_info",
            "Get detailed information about font families, including available weights and styles. You MUST call this before your first typographic styling in a session.",
            json!({
                "type": "object",
                "properties": {
                    "familyNames": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "Names of the font families to look up."
                    }
                },
                "required": ["familyNames"]
            }),
        ).with_annotations(read_only()),
        tool(
            "open_file",
            "Open a Deckle file by ID or URL.",
            json!({
                "type": "object",
                "properties": {
                    "fileId": {
                        "type": "string",
                        "minLength": 1,
                        "description": "The Paper file ID to open. Accepts a bare ID, a /file/<id> route path, or a full https URL pointing at the file."
                    }
                },
                "required": ["fileId"]
            }),
        ).with_annotations(read_only()),
        tool(
            "list_files",
            "List files in the user's team workspace.",
            json!({
                "type": "object",
                "properties": {
                    "limit": { "type": "integer", "minimum": 1, "maximum": 200, "description": "Maximum number of files to return (default 50)" }
                }
            }),
        ).with_annotations(read_only()),
        tool(
            "create_file",
            "Create a new Deckle file.",
            json!({
                "type": "object",
                "properties": {
                    "cloneFileId": { "type": "string", "description": "Optional file ID to clone from" },
                    "name": { "type": "string", "description": "Name for the new file" }
                }
            }),
        ).with_annotations(destructive()),
        tool(
            "open_page",
            "Navigate to a specific page in the current file.",
            json!({
                "type": "object",
                "properties": {
                    "pageId": { "type": "string", "minLength": 1, "description": "The ID of the page to open" }
                },
                "required": ["pageId"]
            }),
        ).with_annotations(read_only()),
        tool(
            "create_page",
            "Create a new page in the current file.",
            json!({
                "type": "object",
                "properties": {
                    "name": { "type": "string", "description": "Name for the new page" }
                }
            }),
        ).with_annotations(destructive()),
        tool(
            "write_html",
            "Write HTML content into the design as new nodes. Each call should add roughly one visual group.",
            json!({
                "type": "object",
                "properties": {
                    "html": { "type": "string", "description": "The HTML to write into the design" },
                    "targetNodeId": { "type": "string", "description": "The target node ID to insert into" },
                    "mode": { "type": "string", "enum": ["insert-children", "replace"], "description": "Insert mode" }
                },
                "required": ["html", "targetNodeId", "mode"]
            }),
        ).with_annotations(destructive()),
        tool(
            "create_artboard",
            "Create a new artboard on the current page.",
            json!({
                "type": "object",
                "properties": {
                    "name": { "type": "string", "description": "Name for the artboard (shown in the layer tree)." },
                    "styles": {
                        "type": "object",
                        "properties": {
                            "width": { "type": "string", "description": "Width of the artboard as a whole pixel value (e.g. \"1440px\")." },
                            "height": { "type": "string", "description": "Height of the artboard as a whole pixel value (e.g. \"900px\")." }
                        },
                        "required": ["width", "height"],
                        "description": "CSS styles for the artboard as a JSON object. Must include width and height as whole-pixel values."
                    }
                },
                "required": ["name", "styles"]
            }),
        ).with_annotations(destructive()),
        tool(
            "delete_nodes",
            "Delete one or more nodes from the design.",
            json!({
                "type": "object",
                "properties": {
                    "nodeIds": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "Array of node IDs to delete"
                    }
                },
                "required": ["nodeIds"]
            }),
        ).with_annotations(destructive()),
        tool(
            "set_text_content",
            "Set the text content of one or more text nodes.",
            json!({
                "type": "object",
                "properties": {
                    "updates": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "nodeId": { "type": "string" },
                                "textContent": { "type": "string" }
                            },
                            "required": ["nodeId", "textContent"]
                        },
                        "description": "Array of {nodeId, textContent} pairs"
                    }
                },
                "required": ["updates"]
            }),
        ).with_annotations(destructive()),
        tool(
            "rename_nodes",
            "Rename one or more nodes in the design tree.",
            json!({
                "type": "object",
                "properties": {
                    "updates": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "nodeId": { "type": "string" },
                                "name": { "type": "string" }
                            },
                            "required": ["nodeId", "name"]
                        },
                        "description": "Array of {nodeId, name} pairs"
                    }
                },
                "required": ["updates"]
            }),
        ).with_annotations(destructive()),
        tool(
            "update_styles",
            "Update CSS styles on one or more nodes.",
            json!({
                "type": "object",
                "properties": {
                    "updates": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "nodeIds": {
                                    "type": "array",
                                    "items": { "type": "string" }
                                },
                                "styles": { "type": "object" }
                            },
                            "required": ["nodeIds", "styles"]
                        },
                        "description": "Array of {nodeIds, styles} pairs"
                    }
                },
                "required": ["updates"]
            }),
        ).with_annotations(destructive()),
        tool(
            "duplicate_nodes",
            "Duplicate one or more nodes.",
            json!({
                "type": "object",
                "properties": {
                    "nodes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": { "type": "string" },
                                "parentId": { "type": "string" }
                            },
                            "required": ["id"]
                        },
                        "description": "Array of {id, parentId?} objects"
                    }
                },
                "required": ["nodes"]
            }),
        ).with_annotations(destructive()),
        tool(
            "move_nodes",
            "Move nodes to a new parent or position.",
            json!({
                "type": "object",
                "properties": {
                    "moves": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "nodeId": { "type": "string" },
                                "parentId": { "type": "string" },
                                "before": { "type": "string" },
                                "after": { "type": "string" },
                                "index": { "type": "number" }
                            },
                            "required": ["nodeId"]
                        },
                        "description": "Array of move operations. Each has nodeId plus a placement: {parentId, index?}, {before}, or {after}."
                    }
                },
                "required": ["moves"]
            }),
        ).with_annotations(destructive()),
        tool(
            "finish_working_on_nodes",
            "Signal that you are done creating or editing nodes. You MUST call this after creating or editing operations.",
            json!({
                "type": "object",
                "properties": {
                    "nodeIds": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "Array of node IDs you were working on"
                    }
                }
            }),
        ).with_annotations(read_only()),
        tool(
            "export",
            "Export one or more nodes as images (PNG, JPEG, SVG, PDF, WebP).",
            json!({
                "type": "object",
                "properties": {
                    "type": { "type": "string", "enum": ["image", "video"], "description": "Export type" },
                    "nodes": { "description": "Either \"nodes-with-exports-only\" or a record of node IDs to export configs." }
                }
            }),
        ).with_annotations(read_only()),
        tool(
            "export_combined_pdf",
            "Export multiple nodes as a single combined PDF document.",
            json!({
                "type": "object",
                "properties": {
                    "nodeIds": {
                        "type": "array",
                        "items": { "type": "string" },
                        "minItems": 1,
                        "description": "Array of node IDs to include in the PDF"
                    }
                },
                "required": ["nodeIds"]
            }),
        ).with_annotations(read_only()),
        tool(
            "get_tokens",
            "Get design tokens defined in the current file.",
            json!({
                "type": "object",
                "properties": {
                    "types": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "Optional filter by token types"
                    },
                    "namePattern": { "type": "string", "description": "Optional name pattern to filter tokens" },
                    "format": { "type": "string", "enum": ["json", "css", "tailwind"], "description": "Output format" }
                }
            }),
        ).with_annotations(read_only()),
        tool(
            "create_tokens",
            "Create new design tokens in the current file.",
            json!({
                "type": "object",
                "properties": {
                    "tokens": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "type": { "type": "string" },
                                "name": { "type": "string" },
                                "value": { "type": "string" },
                                "description": { "type": "string" }
                            },
                            "required": ["type", "name", "value"]
                        },
                        "description": "Array of tokens to create"
                    }
                },
                "required": ["tokens"]
            }),
        ).with_annotations(destructive()),
        tool(
            "set_tokens",
            "Update existing design tokens.",
            json!({
                "type": "object",
                "properties": {
                    "tokens": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": { "type": "string" },
                                "newName": { "type": "string" },
                                "value": { "type": "string" },
                                "description": { "type": "string" },
                                "delete": { "type": "boolean" }
                            },
                            "required": ["name"]
                        },
                        "description": "Array of token updates"
                    }
                },
                "required": ["tokens"]
            }),
        ).with_annotations(destructive()),
    ]
}
