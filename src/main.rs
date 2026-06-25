#![allow(dead_code)]

mod api_server;
mod file_store;
mod mcp_server;
mod sync_server;
mod types;

use std::sync::Arc;

use clap::Parser;
use file_store::FileStore;
use mcp_server::{McpBridgeState, WebviewBridge};
use serde_json::Value;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::Emitter;
use tauri::Manager;

#[derive(Parser)]
#[command(name = "deckle-desktop", version, about = "Deckle — open-source UI design tool")]
struct Cli {
    /// Run MCP server over stdin/stdout (for Claude Code, Cursor, etc.)
    #[arg(long)]
    mcp: bool,

    /// Port for the HTTP MCP server
    #[arg(long, default_value_t = 29979)]
    mcp_port: u16,

    /// Run without a visible window (headless mode)
    #[arg(long)]
    headless: bool,
}

fn main() {
    let cli = Cli::parse();
    let mcp_port = cli.mcp_port;

    // Initialize structured logging.
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    tracing::info!("Deckle Desktop v{} starting...", env!("CARGO_PKG_VERSION"));

    // ── stdio MCP mode ─────────────────────────────────────────────────
    // If --mcp is set, run a pure-tokio MCP server over stdin/stdout
    // without ever touching Tauri, GTK, or a webview. We create our own
    // tokio runtime here because Tauri hasn't built one yet (it creates
    // its own when you call .build()/.run()).
    //
    // This process acts as a thin PROXY: it speaks MCP over stdio to the
    // AI client (Claude Code, Cursor, etc.) and forwards tool calls via
    // HTTP to the running Deckle Desktop GUI process's internal REST
    // endpoints at localhost:{mcp_port}/internal/*.
    //
    // tracing output goes to stderr by default, which is correct for
    // stdio MCP (stdout is reserved for JSON-RPC messages).
    if cli.mcp {
        let rt = tokio::runtime::Runtime::new().expect("Failed to create tokio runtime");
        rt.block_on(async {
            use rmcp::ServiceExt;

            // Try to connect to the running GUI's MCP server. Wait up to
            // 10 seconds — the user may have just launched both processes.
            let handler = mcp_server::create_proxy_handler(mcp_port, 10).await;
            tracing::info!(
                "Deckle MCP server running over stdio (proxying to GUI at port {})",
                mcp_port
            );
            match handler.serve(rmcp::transport::io::stdio()).await {
                Ok(service) => {
                    let _ = service.waiting().await;
                }
                Err(e) => {
                    tracing::error!("MCP stdio server error: {}", e);
                    std::process::exit(1);
                }
            }
        });
        return;
    }

    // Read headless mode from CLI flag or env var (mirrors Electron's DECKLE_HEADLESS_MCP support).
    let is_headless_mcp = cli.headless || std::env::var("DECKLE_HEADLESS_MCP").as_deref() == Ok("true");
    if is_headless_mcp {
        tracing::info!(
            "DECKLE_HEADLESS_MCP=true — running in headless MCP mode (no visible window). \
             The sync/HTTP server and MCP server will start and listen."
        );
    } else {
        tracing::info!(
            "DECKLE_HEADLESS_MCP not set — running in headed mode with a visible window."
        );
    }

    // Single-instance guard is handled by the Tauri plugin below
    // (tauri-plugin-single-instance), which mirrors Electron's
    // app.requestSingleInstanceLock + 'second-instance' event.
    //
    // When a second instance is launched the first instance receives a
    // callback that focuses its window (restoring if minimized), and the
    // second instance exits cleanly.

    // Initialize the shared file store (~/.deckle-local/).
    let store = FileStore::new();

    // Build the Tauri application.
    // Tauri runs its own event loop on the main thread.
    // We start all servers inside the setup hook using tauri::async_runtime::spawn,
    // which schedules them on the tokio runtime that Tauri manages internally.
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // This callback fires on the FIRST instance when a SECOND instance
            // is launched. Mirror Electron's second-instance event:
            //   - Reveal the existing/main window
            //   - Restore if minimized
            //   - Focus it
            if let Some(window) = app.get_webview_window("main") {
                if window.is_minimized().unwrap_or(false) {
                    tracing::info!(
                        "Second instance detected — unminimizing and focusing existing window"
                    );
                    let _ = window.unminimize();
                } else {
                    tracing::info!("Second instance detected — focusing existing window");
                }
                let _ = window.set_focus();
            } else {
                // No window exists (likely headless MCP mode). Nothing to focus.
                tracing::debug!("Second instance detected but no window to focus");
            }
        }))
        .invoke_handler(tauri::generate_handler![
            __mcp_callback,
            get_app_icon,
            set_app_icon,
            check_for_updates,
            export_pdf,
            start_download,
            open_figma_oauth,
            get_gpu_info,
            __deckle_console,
            read_clipboard_html,
            read_clipboard,
            write_clipboard,
            paste_from_clipboard,
        ])
        .setup(move |app| {
            // Create a single shared CancellationToken for all background
            // servers. Clones are passed to each server; the original is
            // stored in Tauri's managed state so the RunEvent handler can
            // cancel it on exit.
            let shutdown = tokio_util::sync::CancellationToken::new();
            let sync_shutdown = shutdown.clone();
            let mcp_shutdown = shutdown.clone();
            app.manage(shutdown);

            let sync_store = store.clone();

            // Start the combined WebSocket sync + shared HTTP server on port 8080.
            tauri::async_runtime::spawn(async move {
                if let Err(e) = sync_server::start(8080, sync_store, sync_shutdown).await {
                    tracing::error!("Sync server failed: {}", e);
                    std::process::exit(1);
                }
            });

            // Shared state for WebviewBridge IPC callbacks. Managed by Tauri
            // so the __mcp_callback command can access it.
            let bridge_state = McpBridgeState::new_arc();
            app.manage(bridge_state.clone());

            // Start the MCP server on the configured port with the WebviewBridge.
            // If the webview window hasn't been created yet, the bridge will
            // return static tool definitions and "editor not ready" errors,
            // matching the Electron behavior.
            let app_handle_for_mcp = app.handle().clone();
            let bridge = Arc::new(WebviewBridge::new(app_handle_for_mcp, bridge_state));
            tauri::async_runtime::spawn(async move {
                if let Err(e) = mcp_server::start(mcp_port, bridge, mcp_shutdown).await {
                    tracing::error!("MCP server failed: {}", e);
                    std::process::exit(1);
                }
            });

            // In headless mode we skip the visible window entirely.
            // The sync/HTTP server and MCP server are already running above.
            if is_headless_mcp {
                tracing::info!(
                    "Headless MCP mode: no webview window created. \
                     Servers continue running on their ports."
                );
            } else {
                // ── WebKitGTK behavior notes for omitted Electron features ──────
                //
                // 1. Preconnect (Electron: session.defaultSession.preconnect):
                //    WebKitGTK does not expose a preconnect API, so this
                //    optimization is skipped.  The TCP connection to the local
                //    server is established naturally on first navigation.
                //
                // 2. CanvasDrawElement (Electron:
                //    --enable-blink-features=CanvasDrawElement):  This is a
                //    Chromium/Blink-only feature flag for HTML-in-canvas video
                //    export.  WebKitGTK has no equivalent mechanism.
                //
                // 3. Cookie flush (Electron:
                //    session.defaultSession.cookies.flushStore()):  Not
                //    applicable — the single-user localhost API is stateless
                //    and does not persist auth cookies.
                // ────────────────────────────────────────────────────────────────

                // Wait for the sync server to be ready before creating the
                // window. The desktop bundle expects the sync WebSocket +
                // localhost HTTP API on 8080. If the port is not bound yet,
                // the UI can render in a partially broken state.
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    wait_for_server("127.0.0.1", 8080, 30).await;
                    tracing::info!("Sync server ready — creating window");

                    // Create the main webview window on the main thread.
                    // We need two references: one moved into run_on_main_thread,
                    // one moved into the closure it receives.
                    let handle_for_closure = app_handle.clone();
                    let _ = app_handle.run_on_main_thread(move || {
                        let url = tauri::WebviewUrl::App("index.html".into());

                        // Set a Chrome-compatible UA string.  The browser gate in
                        // the webapp JS is bypassed via PATCH 8, but a proper UA
                        // is still useful for HTTP request headers and any other
                        // server-side UA checks.
                        let user_agent = format!(
                            "Mozilla/5.0 (X11; Linux x86_64) \
                             AppleWebKit/537.36 (KHTML, like Gecko) \
                             Chrome/131.0.0.0 \
                             Safari/537.36 \
                             DeckleDesktop/{}",
                            env!("CARGO_PKG_VERSION")
                        );

                        // Build the application menu.
                        // Mirrors the Edit menu from the Electron app (application-menu.ts)
                        // which sends 'edit-command' IPC events for undo/redo.
                        let menu = {
                            let undo = MenuItemBuilder::with_id("undo", "Undo")
                                .accelerator("CmdOrCtrl+Z")
                                .build(&handle_for_closure)
                                .expect("Failed to create Undo menu item");

                            let redo = MenuItemBuilder::with_id("redo", "Redo")
                                .accelerator("CmdOrCtrl+Shift+Z")
                                .build(&handle_for_closure)
                                .expect("Failed to create Redo menu item");

                            let quit = MenuItemBuilder::with_id("quit", "Quit Deckle")
                                .accelerator("CmdOrCtrl+Q")
                                .build(&handle_for_closure)
                                .expect("Failed to create Quit menu item");

                            let file_submenu = SubmenuBuilder::new(&handle_for_closure, "File")
                                .item(&quit)
                                .build()
                                .expect("Failed to create File submenu");

                            let paste = MenuItemBuilder::with_id("paste", "Paste")
                                .accelerator("CmdOrCtrl+V")
                                .build(&handle_for_closure)
                                .expect("Failed to create Paste menu item");

                            let edit_submenu = SubmenuBuilder::new(&handle_for_closure, "Edit")
                                .item(&undo)
                                .separator()
                                .item(&redo)
                                .separator()
                                .item(&paste)
                                .build()
                                .expect("Failed to create Edit submenu");

                            MenuBuilder::new(&handle_for_closure)
                                .items(&[&file_submenu, &edit_submenu])
                                .build()
                                .expect("Failed to create application menu")
                        };

                        match tauri::WebviewWindowBuilder::new(&handle_for_closure, "main", url)
                            .title("Deckle")
                            .inner_size(1440.0, 900.0)
                            .user_agent(&user_agent)
                            .menu(menu)
                            .initialization_script(&preload_script(is_headless_mcp))
                            .build()
                        {
                            Ok(_win) => {
                                tracing::info!("Deckle window created successfully");
                            }
                            Err(e) => {
                                tracing::error!("Failed to create window: {}", e);
                            }
                        }
                    });
                });
            }

            Ok(())
        })
        .on_menu_event(|app_handle, event| match event.id().as_ref() {
            "undo" => {
                tracing::info!("[undo] Ctrl+Z menu accelerator fired");
                if let Some(window) = app_handle.get_webview_window("main") {
                    handle_undo_redo_from_menu(&window, false);
                }
            }
            "redo" => {
                tracing::info!("[redo] Ctrl+Shift+Z menu accelerator fired");
                if let Some(window) = app_handle.get_webview_window("main") {
                    handle_undo_redo_from_menu(&window, true);
                }
            }
            "paste" => {
                tracing::info!("[paste] Ctrl+V menu accelerator fired");
                if let Some(window) = app_handle.get_webview_window("main") {
                    handle_paste_from_menu(&window);
                }
            }
            "quit" => {
                app_handle.exit(0);
            }
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| match event {
            tauri::RunEvent::ExitRequested { .. } => {
                // The app is about to exit (last window closed or
                // programmatic exit). Cancel the shared shutdown token
                // so both the sync and MCP servers begin graceful
                // shutdown (drain connections, flush dirty files).
                tracing::info!("Exit requested — cancelling background servers...");
                if let Some(token) =
                    app_handle.try_state::<tokio_util::sync::CancellationToken>()
                {
                    token.cancel();
                }
            }
            _ => {}
        });

    // When .run() returns, the event loop has ended and servers have
    // received the cancellation signal. In headed mode the process
    // exits naturally. In headless mode (no windows ever created) the
    // event loop exits immediately, so we keep the main thread alive
    // to let the servers continue serving agent requests.
    if is_headless_mcp {
        tracing::info!("Headless mode — servers continue running. Press Ctrl+C to stop.");
        loop {
            std::thread::park();
        }
    }
    tracing::info!("Clean shutdown complete.");
}

/// Poll a TCP port until it accepts connections, up to `max_seconds`.
async fn wait_for_server(host: &str, port: u16, max_seconds: u32) {
    use tokio::net::TcpStream;
    use tokio::time::{sleep, Duration};

    let addr = format!("{}:{}", host, port);
    for _ in 0..max_seconds * 10 {
        if TcpStream::connect(&addr).await.is_ok() {
            tracing::info!("Server on port {} is ready", port);
            return;
        }
        sleep(Duration::from_millis(100)).await;
    }
    tracing::warn!(
        "Timed out waiting for server on port {} — loading anyway",
        port
    );
}

/// Build the JavaScript that gets injected into every page loaded by the webview.
///
/// Handles Ctrl+V by reading the system clipboard via arboard and injecting a
/// synthetic ClipboardEvent into the webview via eval().  This bypasses IPC
/// entirely (Deckle pushes to JS, not JS pulls from Deckle) which works regardless
/// of Tauri's IPC/ACL configuration for external URLs.
fn handle_paste_from_menu(window: &tauri::WebviewWindow) {
    let (html, plain) = match arboard::Clipboard::new() {
        Ok(mut cb) => {
            let h = cb.get().html().ok().filter(|s| !s.is_empty());
            let t = cb.get_text().ok().filter(|s| !s.is_empty());
            (h, t)
        }
        Err(e) => {
            tracing::warn!("[paste] arboard open failed: {}", e);
            return;
        }
    };

    if html.is_none() && plain.is_none() {
        tracing::info!("[paste] System clipboard empty");
        return;
    }

    fn esc(s: &str) -> String {
        s.replace('\\', "\\\\")
            .replace('\'', "\\'")
            .replace('\n', "\\n")
            .replace('\r', "\\r")
    }

    let mut types = Vec::new();
    let mut get_cases = String::new();

    if let Some(ref h) = html {
        let e = esc(h);
        types.push("'text/html'");
        get_cases.push_str(&format!("if(t==='text/html')return'{}';", e));
    }
    if let Some(ref t) = plain {
        let e = esc(t);
        types.push("'text/plain'");
        get_cases.push_str(&format!("if(t==='text/plain')return'{}';", e));
    }

    let types_str = types.join(",");
    let js = format!(
        r#"(function(){{
var data={{getData:function(t){{{get}return'';}},setData:function(){{}},types:[{types}],items:[],files:[]}};
var evt=new ClipboardEvent('paste',{{bubbles:true,cancelable:true}});
Object.defineProperty(evt,'clipboardData',{{value:data}});
var el=document.activeElement||document;
el.dispatchEvent(evt);
}})()"#,
        get = get_cases,
        types = types_str,
    );

    if let Err(e) = window.eval(&js) {
        tracing::error!("[paste] eval failed: {}", e);
    } else {
        tracing::info!(
            "[paste] Injected via menu accelerator: html={}b, plain={}b",
            html.as_ref().map_or(0, |s| s.len()),
            plain.as_ref().map_or(0, |s| s.len()),
        );
    }
}

/// Handles undo/redo from the Edit menu accelerator (Ctrl+Z / Ctrl+Shift+Z).
///
/// Mirrors the Electron shell: the native menu accelerator triggers in the shell
/// process and forwards an explicit renderer command (`edit-command`) instead of
/// trying to recreate the original keyboard event inside the webview.
fn handle_undo_redo_from_menu(window: &tauri::WebviewWindow, is_redo: bool) {
    let command = if is_redo { "redo" } else { "undo" };

    if let Err(e) = emit_edit_command(window, command) {
        tracing::error!(
            "[undo/redo] Failed to emit edit-command='{}' from menu accelerator: {}",
            command,
            e
        );
    } else {
        tracing::info!(
            "[undo/redo] Emitted edit-command='{}' via menu accelerator",
            command
        );
    }
}

/// This replicates the Electron preload script (`preload.ts`) so the Deckle web
/// app detects `typeof window.paper?.desktop == "object"` and enters desktop
/// mode.  IPC channels are backed by real Tauri commands (or callback registries
/// for push-style events) — the important thing is that the shape matches what
/// the renderer expects.
///
/// Note: the browser gate (which checks for Chrome/Edge in the UA) is bypassed
/// directly in the patched webapp JS (PATCH 8 in index-xWMl0dnQ.js), so we
/// 1:1 match of Electron's preload.ts — exposes window.paper.desktop with
/// the same API surface so the webapp enters desktop mode and behaves
/// identically to the Node.js/Electron version.
fn preload_script(_headless: bool) -> String {
    r#"(function() {
    if (window.__deckle_preload_injected) return;
    window.__deckle_preload_injected = true;

    /* Override console.error/warn to POST to the debug endpoint.
     * This captures React ErrorBoundary errors, uncaught exceptions,
     * and any console.error call — forwarding them to the Rust terminal
     * since WebKitGTK does not pipe console output to stdout. */
    var _origError = console.error;
    var _origWarn = console.warn;
    var _fwdBusy = false;
    function _fwd(level, args) {
        if (_fwdBusy) return;
        _fwdBusy = true;
        try {
            var msg = Array.prototype.slice.call(args).map(function(a) {
                if (a instanceof DOMException) return 'DOMException(' + a.name + '): ' + a.message + '\n' + (a.stack || '');
                if (a instanceof Error) return a.message + '\n' + (a.stack || '');
                if (typeof a === 'object') try { return JSON.stringify(a); } catch(e) { return String(a); }
                return String(a);
            }).join(' ');
            setTimeout(function() {
                fetch('http://localhost:8080/debug/error', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ level: level, msg: msg })
                }).catch(function(){});
                _fwdBusy = false;
            }, 0);
        } catch(e) { _fwdBusy = false; }
    }
    console.error = function() { _origError.apply(console, arguments); _fwd('error', arguments); };
    console.warn = function() { _origWarn.apply(console, arguments); _fwd('warn', arguments); };

    /* Forward unhandled errors to terminal so we can see them without
     * WebKitGTK devtools — Electron has chrome://inspect for this.
     * We use both Tauri invoke AND the HTTP debug endpoint for redundancy. */
    window.addEventListener('error', function(e) {
        var errObj = e.error;
        var detail = (e.message || 'unknown') + ' @ ' + (e.filename||'') + ':' + (e.lineno||'');
        if (errObj instanceof DOMException) {
            detail = 'DOMException(' + errObj.name + '): ' + errObj.message + '\n' + (errObj.stack || '') + ' @ ' + (e.filename||'') + ':' + (e.lineno||'');
        } else if (errObj && errObj.stack) {
            detail = errObj.message + '\n' + errObj.stack;
        }
        if (window.__TAURI_INTERNALS__) {
            window.__TAURI_INTERNALS__.invoke('__deckle_console', { level: 'error', msg: detail }).catch(function(){});
        }
        fetch('http://localhost:8080/debug/error', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ level: 'error', msg: '[addEventListener-error] ' + detail })
        }).catch(function(){});
    });
    window.addEventListener('unhandledrejection', function(e) {
        var reason = e.reason;
        var detail = 'Promise rejection: ';
        if (reason instanceof DOMException) {
            detail += 'DOMException(' + reason.name + '): ' + reason.message + '\n' + (reason.stack || '');
        } else {
            detail += (reason?.message || reason || 'unknown');
            if (reason?.stack) detail += '\n' + reason.stack;
        }
        if (window.__TAURI_INTERNALS__) {
            window.__TAURI_INTERNALS__.invoke('__deckle_console', { level: 'error', msg: detail }).catch(function(){});
        }
        fetch('http://localhost:8080/debug/error', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ level: 'error', msg: '[unhandledrejection] ' + detail })
        }).catch(function(){});
    });

    /* Capture DOM NotFoundError and other low-level errors that bypass
     * console.error. window.onerror fires for script errors that are
     * not caught by try/catch or addEventListener('error'). */
    window.onerror = function(msg, source, lineno, colno, error) {
        var detail = (error ? (error.message + '\n' + (error.stack || '')) : msg) +
            ' @ ' + (source || '') + ':' + (lineno || '') + ':' + (colno || '');
        setTimeout(function() {
            fetch('http://localhost:8080/debug/error', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ level: 'error', msg: '[onerror] ' + detail })
            }).catch(function(){});
        }, 0);
    };

    const _navigationCallbacks = [];
    const _editCommandCallbacks = [];
    const _figmaOAuthCallbacks = [];

    window.paper = {
        desktop: {
            mode: 'default',

            icon: {
                set: function(_icon) {},
                get: function() { return Promise.resolve(null); },
            },

            onNavigationRequest: function(callback) {
                _navigationCallbacks.push(callback);
                return function() {
                    var idx = _navigationCallbacks.indexOf(callback);
                    if (idx !== -1) _navigationCallbacks.splice(idx, 1);
                };
            },

            onEditCommand: function(callback) {
                _editCommandCallbacks.push(callback);
                return function() {
                    var idx = _editCommandCallbacks.indexOf(callback);
                    if (idx !== -1) _editCommandCallbacks.splice(idx, 1);
                };
            },

            exportPdf: function(_opts) {
                return Promise.reject(new Error('PDF export is not yet supported in the Rust desktop build.'));
            },

            startDownload: function(callback) {
                return new Promise(function(resolve, reject) {
                    try { callback(); } catch(e) { return reject(e); }
                    resolve({ filePath: undefined });
                });
            },

            checkForUpdates: function() {
                return Promise.resolve({ status: 'no-update-available' });
            },

            openFigmaOAuth: function(_opts) {
                return Promise.resolve();
            },

            onFigmaOAuthResult: function(callback) {
                _figmaOAuthCallbacks.push(callback);
                return function() {
                    var idx = _figmaOAuthCallbacks.indexOf(callback);
                    if (idx !== -1) _figmaOAuthCallbacks.splice(idx, 1);
                };
            },

            debug: {
                gpu: function() {
                    return Promise.resolve({
                        versions: {
                            runtime: 'tauri-2.x',
                            platform: navigator.platform,
                            arch: 'unknown',
                        },
                        featureStatus: null,
                        gpuInfo: null,
                        renderer: {
                            userAgent: navigator.userAgent,
                            devicePixelRatio: window.devicePixelRatio,
                            screen: { width: screen.width, height: screen.height },
                        },
                    });
                },
            },
        },
    };

    try {
        if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.listen === 'function') {
            window.__TAURI_INTERNALS__.listen('edit-command', function(ev) {
                for (var i = 0; i < _editCommandCallbacks.length; i++) {
                    _editCommandCallbacks[i](ev.payload);
                }
            });
        }
    } catch (e) {
        console.warn('[Deckle Desktop] Failed to set up edit-command listener:', e);
    }
})();"#.to_string()
}

fn preload_script_old(headless: bool) -> String {
    let mode = if headless { "headless_mcp" } else { "default" };
    let diag_enabled = std::env::var("DECKLE_DIAGNOSTICS").as_deref() == Ok("true");

    // Build the script by splitting the JS template at the mode assignment
    // and injecting the dynamic value between the two halves.
    let before_mode = r#"
(function() {
    // Guard against double-injection.
    if (window.__deckle_preload_injected) return;
    window.__deckle_preload_injected = true;

    // Diagnostic flag — substituted at build time from DECKLE_DIAGNOSTICS env var.
    // When DECKLE_DIAGNOSTICS=true, the click/logging/viewport diagnostics run.
    // Otherwise they are dead-code elided (still injected but never execute).
    var __DECKLE_DIAGNOSTICS__ = __DIAG_FLAG__;

    // ── Browser mode: window.paper.desktop intentionally NOT set ──────────
    //
    // In the Tauri/WebKitGTK webview, setting window.paper.desktop causes
    // the webapp to enter "desktop mode" (ci=true). In this mode, link
    // clicks and navigation work differently — the webapp expects the
    // desktop shell to provide IPC for navigation, Figma OAuth, PDF export,
    // etc.  Our Tauri stubs for these IPC channels are no-ops, so clicks
    // silently fail.
    //
    // By NOT setting window.paper.desktop, the webapp falls back to
    // "browser mode" (ci=false) where it uses standard <a> link clicks,
    // fetch(), and WebSocket — all of which work correctly with our Rust
    // mock servers on localhost.  Playwright testing against Chromium
    // confirms browser mode is fully interactive: React hydrates, all
    // links/buttons work, zero console errors.
    //
    // The Electron feature set (PDF export, Figma OAuth, auto-update,
    // dock icon, download interception) is not available in the Deckle
    // build yet.  When those features are implemented, we can re-enable
    // window.paper.desktop with real IPC backing.

    window.paper = {
        desktop: {
            mode: '"#;

    let after_mode = r#"',

            // App icon get/set — stubbed (no dock icon on Linux/Tauri).
            icon: {
                set: function(icon) {
                    window.__TAURI_INTERNALS__.invoke('set_app_icon', { icon: icon });
                },
                get: function() {
                    return window.__TAURI_INTERNALS__.invoke('get_app_icon');
                },
            },

            // Navigation requests from the main process.
            onNavigationRequest: function(callback) {
                _navigationCallbacks.push(callback);
                return function() {
                    var idx = _navigationCallbacks.indexOf(callback);
                    if (idx !== -1) _navigationCallbacks.splice(idx, 1);
                };
            },

            // Edit commands (undo/redo) from the main process menu.
            onEditCommand: function(callback) {
                _editCommandCallbacks.push(callback);
                return function() {
                    var idx = _editCommandCallbacks.indexOf(callback);
                    if (idx !== -1) _editCommandCallbacks.splice(idx, 1);
                };
            },

            // PDF export — stub that returns an error.
            exportPdf: function(opts) {
                return window.__TAURI_INTERNALS__.invoke('export_pdf', { opts: opts });
            },

            // Download handling — stub that invokes the callback and resolves.
            startDownload: function(callback) {
                return new Promise(function(resolve, reject) {
                    try {
                        callback();
                    } catch(e) {
                        return reject(e);
                    }
                    window.__TAURI_INTERNALS__.invoke('start_download').then(function(result) {
                        resolve(result);
                    }).catch(function(err) {
                        reject(new Error(err));
                    });
                });
            },

            // Auto-update — stub (no update mechanism yet).
            checkForUpdates: function() {
                return window.__TAURI_INTERNALS__.invoke('check_for_updates');
            },

            // Figma OAuth — stub.
            openFigmaOAuth: function(opts) {
                return window.__TAURI_INTERNALS__.invoke('open_figma_oauth', {
                    origin: opts.origin,
                    session: opts.session,
                });
            },
            onFigmaOAuthResult: function(callback) {
                _figmaOAuthCallbacks.push(callback);
                return function() {
                    var idx = _figmaOAuthCallbacks.indexOf(callback);
                    if (idx !== -1) _figmaOAuthCallbacks.splice(idx, 1);
                };
            },

            // Debug helpers.
            debug: {
                gpu: function() {
                    return window.__TAURI_INTERNALS__.invoke('get_gpu_info').then(function(info) {
                        info.renderer = {
                            userAgent: navigator.userAgent,
                            devicePixelRatio: window.devicePixelRatio,
                            screen: {
                                width: screen.width,
                                height: screen.height,
                                availWidth: screen.availWidth,
                                availHeight: screen.availHeight,
                                colorDepth: screen.colorDepth,
                                pixelDepth: screen.pixelDepth,
                            },
                            visualViewport: window.visualViewport
                                ? {
                                    width: window.visualViewport.width,
                                    height: window.visualViewport.height,
                                    scale: window.visualViewport.scale,
                                  }
                                : null,
                        };
                        return info;
                    });
                },
            },
        },
    };

    // Immediately clear window.paper so the webapp falls back to browser
    // mode (ci=false).  Desktop mode delegates link-click navigation to
    // the Tauri shell via onNavigationRequest callback, but our stubs are
    // no-ops so clicks silently fail.  Browser mode uses standard <a> link
    // clicks + fetch() + WebSocket, which all work with our mock servers.
    window.paper = undefined;

    // Wire up Tauri push events to the callback registries.
    // This bridges Tauri's main=renderer events to the Electron-style
    // callback API that the Deckle webapp expects (onNavigationRequest,
    // onEditCommand, onFigmaOAuthResult).
    try {
        if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.listen === 'function') {
            window.__TAURI_INTERNALS__.listen('navigate', function(ev) {
                for (var i = 0; i < _navigationCallbacks.length; i++) {
                    _navigationCallbacks[i](ev.payload);
                }
            });
            window.__TAURI_INTERNALS__.listen('edit-command', function(ev) {
                for (var i = 0; i < _editCommandCallbacks.length; i++) {
                    _editCommandCallbacks[i](ev.payload);
                }
            });
            window.__TAURI_INTERNALS__.listen('figma-oauth-result', function(ev) {
                for (var i = 0; i < _figmaOAuthCallbacks.length; i++) {
                    _figmaOAuthCallbacks[i](ev.payload);
                }
            });
        }
    } catch(e) {
        console.warn('[Deckle Desktop] Failed to set up Tauri event listeners:', e);
    }

    // Lock browser zoom to 100% — mirrors Electron's setZoomLevel(0) +
    // zoom-changed reset.

    // Block pinch-to-zoom (Ctrl+wheel).
    document.addEventListener('wheel', function(e) {
        if (e.ctrlKey) e.preventDefault();
    }, { passive: false });

    // Block keyboard zoom shortcuts (Ctrl/Cmd + Plus/Minus/0).
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) &&
            (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '0')) {
            e.preventDefault();
        }
    }, { capture: true });

    // Catch unhandled errors/rejections for diagnostics.
    window.addEventListener('error', function(e) {
        console.error('[Deckle Desktop] Unhandled error:', e.message, e.filename, e.lineno, e.colno);
    });
    window.addEventListener('unhandledrejection', function(e) {
        console.error('[Deckle Desktop] Unhandled promise rejection:', e.reason);
    });

    // After page load, verify React actually rendered.
    window.addEventListener('load', function() {
        setTimeout(function() {
            var root = document.getElementById('root');
            if (!root) return;
            var firstChild = root.firstElementChild;
            if (firstChild) {
                var hasReact = Object.keys(firstChild).some(function(k) {
                    return k.startsWith('__reactFiber$') || k.startsWith('__reactContainer$');
                });
                if (!hasReact) {
                    console.error('[Deckle Desktop] React has NOT mounted after 5s — page may show non-interactive SSR HTML.');
                } else {
                    console.log('[Deckle Desktop] React mounted OK.');
                }
            }
            // Also check if a .Preloader is visible (browser gate blocking).
            var preloaders = document.querySelectorAll('.Preloader');
            if (preloaders.length > 0) {
                console.warn('[Deckle Desktop] Found', preloaders.length, '.Preloader element(s) in the DOM — browser gate may have blocked the app.');
            }
        }, 5000);
    });

    console.log('[Deckle Desktop] Preload script injected (Tauri/Rust build)');

    // =========================================================
    // CLICK DIAGNOSTICS — capture-phase listener sees ALL clicks
    // (only active when __DECKLE_DIAGNOSTICS__ is true)
    // =========================================================
    if (__DECKLE_DIAGNOSTICS__) {
    document.addEventListener('click', function(e) {
      var target = e.target;
      var path = [];
      var el = target;
      while (el && el !== document.body && path.length < 5) {
        var desc = el.tagName;
        if (el.id) desc += '#' + el.id;
        if (el.className && typeof el.className === 'string') desc += '.' + el.className.split(' ').slice(0,2).join('.');
        path.push(desc);
        el = el.parentElement;
      }
      console.log('[CLICK] target:', path.join(' > '), 'coords:', e.clientX, e.clientY);
    }, true); // capture phase!

    // Also listen for mousedown/mouseup to see if those fire even when click doesn't
    document.addEventListener('mousedown', function(e) {
      var desc = e.target.tagName;
      if (e.target.id) desc += '#' + e.target.id;
      if (e.target.className && typeof e.target.className === 'string') desc += '.' + e.target.className.split(' ').slice(0,2).join('.');
      console.log('[MOUSEDOWN] target:', desc, 'button:', e.button, 'coords:', e.clientX, e.clientY);
    }, true);

    document.addEventListener('mouseup', function(e) {
      var desc = e.target.tagName;
      if (e.target.id) desc += '#' + e.target.id;
      if (e.target.className && typeof e.target.className === 'string') desc += '.' + e.target.className.split(' ').slice(0,2).join('.');
      console.log('[MOUSEUP] target:', desc, 'button:', e.button, 'coords:', e.clientX, e.clientY);
    }, true);

    // =========================================================
    // VIEWPORT OVERLAY DIAGNOSTICS — runs 5s after page load
    // =========================================================
    setTimeout(function() {
      // Find ALL elements at center of viewport
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var elements = document.elementsFromPoint(cx, cy);
      console.log('[DIAG] Elements at viewport center (' + cx + ',' + cy + '):');
      elements.forEach(function(el, i) {
        var desc = el.tagName;
        if (el.id) desc += '#' + el.id;
        if (el.className && typeof el.className === 'string') desc += '.' + el.className.split(' ').slice(0,3).join('.');
        var style = window.getComputedStyle(el);
        var info = 'pos:' + style.position + ' z:' + style.zIndex + ' pe:' + style.pointerEvents + ' w:' + el.offsetWidth + ' h:' + el.offsetHeight;
        console.log('[DIAG]   ' + i + ': ' + desc + ' — ' + info);
      });

      // Check for any element with position:fixed/absolute covering the whole viewport
      var all = document.querySelectorAll('*');
      var overlays = [];
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        var style = window.getComputedStyle(el);
        if ((style.position === 'fixed' || style.position === 'absolute') &&
            el.offsetWidth >= window.innerWidth * 0.9 &&
            el.offsetHeight >= window.innerHeight * 0.9 &&
            style.pointerEvents !== 'none') {
          overlays.push(el.tagName + (el.className ? '.' + el.className.split(' ').slice(0,3).join('.') : '') +
            ' z:' + style.zIndex + ' bg:' + style.backgroundColor + ' opacity:' + style.opacity);
        }
      }
      if (overlays.length > 0) {
        console.log('[DIAG] OVERLAYS FOUND:');
        overlays.forEach(function(o) { console.log('[DIAG]   ' + o); });
      } else {
        console.log('[DIAG] No full-viewport overlays found');
      }

      // Check React root
      var root = document.getElementById('root');
      if (root) {
        console.log('[DIAG] React root: children=' + root.children.length + ' innerHTML.length=' + root.innerHTML.length);
        // Check React fiber on root's first child
        var fc = root.firstElementChild;
        if (fc) {
          var keys = Object.keys(fc);
          var fiberKey = keys.find(function(k) { return k.startsWith('__reactFiber$'); });
          var propsKey = keys.find(function(k) { return k.startsWith('__reactProps$'); });
          var containerKey = keys.find(function(k) { return k.startsWith('__reactContainer$'); });
          console.log('[DIAG] React fiber key:', fiberKey || 'NONE');
          console.log('[DIAG] React props key:', propsKey || 'NONE');
          console.log('[DIAG] React container key:', containerKey || 'NONE');
        }
      } else {
        console.log('[DIAG] NO React root found!');
      }

      // Check React event delegation — React 16+ attaches to root, React 17+ to #root
      var rootEl = document.getElementById('root');
      if (rootEl) {
        // Check if React attached event listeners to the root
        // React 17+ uses rootEl, older uses document
        var listeners = typeof getEventListeners === 'function' ? getEventListeners(rootEl) : null;
        if (listeners) {
          console.log('[DIAG] Root event listeners:', JSON.stringify(Object.keys(listeners)));
        } else {
          console.log('[DIAG] getEventListeners not available (only in devtools). Checking __reactEvents...');
          var reactEventsKey = Object.keys(rootEl).find(function(k) { return k.startsWith('__reactEvents$'); });
          console.log('[DIAG] __reactEvents on root:', reactEventsKey || 'NONE');
        }
      }
    }, 5000);

    // =========================================================
    // VISIBLE DIAGNOSTICS — yellow banner so output is visible
    // even if console.log doesn't reach the terminal
    // =========================================================
    var _diagLog = [];
    var _diagPanel = null;
    function _showDiag(msg) {
      _diagLog.push(msg);
      if (_diagLog.length > 12) _diagLog.shift();
      if (!_diagPanel && document.body) {
        _diagPanel = document.createElement('div');
        _diagPanel.id = '__deckle_diag_panel';
        _diagPanel.style.cssText = 'position:fixed;bottom:0;left:0;right:0;max-height:200px;overflow-y:auto;background:rgba(255,255,0,0.95);color:black;font:11px/1.4 monospace;padding:4px 8px;z-index:999999;pointer-events:none;white-space:pre-wrap;';
        document.body.appendChild(_diagPanel);
      }
      if (_diagPanel) {
        _diagPanel.textContent = _diagLog.join('\n');
      }
    }
    var _origLog = console.log;
    console.log = function() {
      _origLog.apply(console, arguments);
      var msg = Array.from(arguments).join(' ');
      if (msg.indexOf('[CLICK]') === 0 || msg.indexOf('[DIAG]') === 0 ||
          msg.indexOf('[MOUSEDOWN]') === 0 || msg.indexOf('[MOUSEUP]') === 0 ||
          msg.indexOf('[Deckle Desktop]') === 0) {
        _showDiag(msg);
      }
    };
    // Also override console.warn/error for diagnostics
    var _origWarn = console.warn;
    console.warn = function() {
      _origWarn.apply(console, arguments);
      var msg = Array.from(arguments).join(' ');
      if (msg.indexOf('[Deckle') === 0) _showDiag('[WARN] ' + msg);
    };
    var _origError = console.error;
    console.error = function() {
      _origError.apply(console, arguments);
      var msg = Array.from(arguments).join(' ');
      if (msg.indexOf('[Deckle') === 0) _showDiag('[ERROR] ' + msg);
    };
    } // end diagnostics conditional
})();
"#;

    let diag_flag = if diag_enabled { "true" } else { "false" };
    let mut script = String::from(before_mode);
    script = script.replace("__DIAG_FLAG__", diag_flag);
    script.push_str(mode);
    script.push_str(after_mode);
    script
}

// ---------------------------------------------------------------------------
// Tauri IPC command for WebviewBridge callbacks
// ---------------------------------------------------------------------------

/// Tauri command invoked by `window.__TAURI_INTERNALS__.invoke()` from the
/// eval'd JS inside `WebviewBridge`. The webview calls this with the result
/// of an MCP handler method, and we route it back to the awaiting oneshot
/// channel via the shared `McpBridgeState`.
#[tauri::command]
fn __mcp_callback(
    state: tauri::State<'_, Arc<McpBridgeState>>,
    id: String,
    result: Option<String>,
    error: Option<String>,
) {
    if let Some(err) = error {
        state.resolve(&id, Err(err));
    } else if let Some(res) = result {
        match serde_json::from_str(&res) {
            Ok(val) => state.resolve(&id, Ok(val)),
            Err(e) => state.resolve(&id, Err(format!("Failed to parse result: {}", e))),
        }
    } else {
        state.resolve(&id, Ok(Value::Null));
    }
}

// ---------------------------------------------------------------------------
// Desktop IPC commands
// ---------------------------------------------------------------------------

/// Reads HTML content from the system clipboard via arboard.
///
/// WebKitGTK doesn't reliably expose `text/html` in paste events, so the
/// preload script calls this Tauri command to read HTML directly from the
/// system clipboard when `clipboardData.getData("text/html")` returns empty.
/// This is critical for copy-paste from the Deckle Chrome extension, which
/// writes `<x-deckle-html>...</x-deckle-html>` to the clipboard.
#[tauri::command]
fn read_clipboard_html() -> Option<String> {
    match arboard::Clipboard::new() {
        Ok(mut clipboard) => clipboard.get().html().ok(),
        Err(e) => {
            tracing::warn!("Failed to open system clipboard: {}", e);
            None
        }
    }
}

/// Reads all clipboard content from the system clipboard via arboard and
/// dispatches a synthetic paste event on the active element — replicating
/// exactly what Chromium does natively but WebKitGTK fails to do for
/// text/html.
#[tauri::command]
async fn paste_from_clipboard(app: tauri::AppHandle) -> Result<(), String> {
    tracing::info!("[paste] paste_from_clipboard CALLED");
    let (html, plain) = match arboard::Clipboard::new() {
        Ok(mut cb) => {
            let h = cb.get().html().ok().filter(|s| !s.is_empty());
            let t = cb.get_text().ok().filter(|s| !s.is_empty());
            (h, t)
        }
        Err(e) => {
            tracing::warn!("[paste] arboard open failed: {}", e);
            return Err(format!("clipboard open failed: {}", e));
        }
    };

    if html.is_none() && plain.is_none() {
        tracing::info!("[paste] System clipboard empty");
        return Ok(());
    }

    let Some(window) = app.get_webview_window("main") else {
        return Err("No webview window".to_string());
    };

    fn esc(s: &str) -> String {
        s.replace('\\', "\\\\")
            .replace('\'', "\\'")
            .replace('\n', "\\n")
            .replace('\r', "\\r")
    }

    let mut set_lines = String::new();
    let mut types = Vec::new();
    let mut get_cases = String::new();

    if let Some(ref h) = html {
        let e = esc(h);
        set_lines.push_str(&format!("dt.setData('text/html','{}');", e));
        types.push("'text/html'");
        get_cases.push_str(&format!("if(t==='text/html')return'{}';", e));
    }
    if let Some(ref t) = plain {
        let e = esc(t);
        set_lines.push_str(&format!("dt.setData('text/plain','{}');", e));
        types.push("'text/plain'");
        get_cases.push_str(&format!("if(t==='text/plain')return'{}';", e));
    }

    let types_str = types.join(",");
    let js = format!(
        r#"(function(){{
window.__deckle_synthetic_paste=true;
var data={{getData:function(t){{{get}return'';}},setData:function(){{}},types:[{types}],items:[],files:[]}};
var evt=new ClipboardEvent('paste',{{bubbles:true,cancelable:true}});
Object.defineProperty(evt,'clipboardData',{{value:data}});
(document.activeElement||document).dispatchEvent(evt);
}})()"#,
        get = get_cases,
        types = types_str,
    );

    window
        .eval(&js)
        .map_err(|e| format!("eval failed: {}", e))?;
    tracing::info!(
        "[paste] Injected on activeElement: html={}b, plain={}b",
        html.as_ref().map_or(0, |s| s.len()),
        plain.as_ref().map_or(0, |s| s.len()),
    );
    Ok(())
}

/// Reads all available MIME types from the system clipboard.
/// Used by the navigator.clipboard.read() polyfill in the preload script.
#[tauri::command]
fn read_clipboard() -> Result<std::collections::HashMap<String, String>, String> {
    let mut result = std::collections::HashMap::new();
    let mut cb = arboard::Clipboard::new().map_err(|e| e.to_string())?;
    if let Ok(html) = cb.get().html() {
        if !html.is_empty() {
            result.insert("text/html".to_string(), html);
        }
    }
    if let Ok(text) = cb.get_text() {
        if !text.is_empty() {
            result.insert("text/plain".to_string(), text);
        }
    }
    Ok(result)
}

/// Writes content to the system clipboard.
/// Used by the navigator.clipboard.write() polyfill in the preload script.
#[tauri::command]
fn write_clipboard(html: Option<String>, text: Option<String>) -> Result<(), String> {
    let mut cb = arboard::Clipboard::new().map_err(|e| e.to_string())?;
    if let Some(ref h) = html {
        cb.set_html(h, text.as_ref()).map_err(|e| e.to_string())?;
    } else if let Some(ref t) = text {
        cb.set_text(t).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Console relay: the preload calls this to forward console.error/warn
/// messages to the Rust terminal, so we can see webapp JS errors without
/// needing WebKitGTK devtools.
#[tauri::command]
fn __deckle_console(level: String, msg: String) {
    match level.as_str() {
        "error" => tracing::error!("[webview] {}", msg),
        "warn" => tracing::warn!("[webview] {}", msg),
        _ => tracing::info!("[webview] {}", msg),
    }
}

/// Returns the current app icon.
/// No-op on Linux/Tauri (no dock icon support like macOS).
#[tauri::command]
async fn get_app_icon() -> Option<String> {
    None
}

/// Sets the app icon.
/// No-op on Linux/Tauri (no dock icon support like macOS).
#[tauri::command]
async fn set_app_icon(#[allow(unused_variables)] icon: String) {
    // No-op
}

/// Checks for updates via the Tauri updater plugin.
/// Currently returns "no-update-available" as the updater plugin is not yet wired.
#[tauri::command]
async fn check_for_updates() -> serde_json::Value {
    serde_json::json!({ "status": "no-update-available" })
}

/// Exports a PDF from the provided page renderings.
/// Not yet implemented in the Rust desktop build.
#[tauri::command]
async fn export_pdf(#[allow(unused_variables)] opts: serde_json::Value) -> Result<(), String> {
    Err("PDF export is not yet supported in the Rust desktop build.".to_string())
}

/// Registers a download and returns a placeholder result.
/// Tauri handles downloads natively; this is a no-op success.
#[tauri::command]
async fn start_download() -> serde_json::Value {
    serde_json::json!({ "filePath": null })
}

/// Opens the Figma OAuth authorization URL in the system browser.
/// Follows the same URL construction as the Electron main process.
#[tauri::command]
async fn open_figma_oauth(origin: String, session: String) -> Result<(), String> {
    let workers_url = std::env::var("DECKLE_ENV")
        .ok()
        .and_then(|env| match env.as_str() {
            s if s == "localhost" => Some("http://localhost:8079"),
            s if s == "staging" => Some("https://workers.paper-staging.dev"),
            _ => None,
        })
        .unwrap_or("https://workers.paper.design");

    let protocol = if cfg!(debug_assertions) {
        "paper-dev"
    } else {
        "paper"
    };

    let url = format!(
        "{}/figma-oauth/authorize?session={}&desktop=1&protocol={}&opener_origin={}",
        workers_url,
        urlencoding::encode(&session),
        protocol,
        urlencoding::encode(&origin),
    );

    tracing::info!("Opening Figma OAuth URL: {}", url);

    open::that(&url).map_err(|e| format!("Failed to open URL in system browser: {}", e))
}

/// Returns GPU/diagnostic info for the desktop-debug-gpu channel.
/// Matches the Electron `desktop-debug-gpu` handler shape.
#[tauri::command]
async fn get_gpu_info() -> serde_json::Value {
    serde_json::json!({
        "versions": {
            "runtime": "tauri-2.x",
            "chrome": "131",
            "node": "22",
            "platform": std::env::consts::OS,
            "arch": std::env::consts::ARCH,
        },
        "featureStatus": null,
        "gpuInfo": null,
    })
}

// ---------------------------------------------------------------------------
// Push-style event emission helpers (main process = renderer)
// ---------------------------------------------------------------------------

/// Emit a 'navigate' event to the webview, mirroring Electron's
/// `win.webContents.send('navigate', path)` used in `redirect()`.
///
/// Call this from anywhere you have access to the app handle whenever
/// the main process needs the webview to navigate to a new route.
pub fn navigate_to(app: &tauri::AppHandle, path: &str) {
    if let Some(window) = app.get_webview_window("main") {
        if let Err(e) = window.emit("navigate", path) {
            tracing::error!("Failed to emit navigate event: {}", e);
        }
    } else {
        tracing::warn!("navigate_to: no main window found");
    }
}

/// Emit an 'edit-command' event (undo/redo from the application menu), mirroring
/// Electron's `webContents.send('edit-command', ...)` renderer bridge.
pub fn emit_edit_command(window: &tauri::WebviewWindow, command: &str) -> Result<(), tauri::Error> {
    window.emit("edit-command", command)
}

/// Emit a 'figma-oauth-result' event when a deep link carries a Figma
/// OAuth result.
///
/// Stub: deep link handling infrastructure is not yet implemented in
/// the Tauri build.  When it is, call this from the deep link handler.
#[allow(dead_code)]
pub fn emit_figma_oauth_result(window: &tauri::WebviewWindow, result: serde_json::Value) {
    if let Err(e) = window.emit("figma-oauth-result", result) {
        tracing::error!("Failed to emit figma-oauth-result event: {}", e);
    }
}
