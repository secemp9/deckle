use std::time::Duration;

use axum::body::Body;
use axum::extract::{Path, State};
use axum::http::{header, header::HeaderName, HeaderValue, Method, Request, StatusCode};
use axum::middleware;
use axum::response::{IntoResponse, Json, Response};
use axum::routing::{patch, post, put};
use axum::Router;
use indexmap::IndexMap;
use tower_http::cors::CorsLayer;

use crate::file_store::FileStore;
use crate::types::{
    ArchiveResourceRequest, ArchiveResourceResponse, CreateFileRequest, CreateFileResponse,
    CreateFolderRequest, CreateFolderResponse, PatchResourceResponse, ResourcesBatchGetRequest,
    ResourcesBatchGetResponse, ALLOWED_ORIGIN,
};

fn cors_layer() -> CorsLayer {
    CorsLayer::new()
        .allow_origin(
            ALLOWED_ORIGIN
                .parse::<HeaderValue>()
                .expect("Invalid CORS origin"),
        )
        .allow_credentials(true)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            "Content-Type".parse::<HeaderName>().unwrap(),
            "If-None-Match".parse::<HeaderName>().unwrap(),
            "X-FileId".parse::<HeaderName>().unwrap(),
            "X-ImageId".parse::<HeaderName>().unwrap(),
            "X-SourcePath".parse::<HeaderName>().unwrap(),
            "X-DestPath".parse::<HeaderName>().unwrap(),
        ])
        .max_age(Duration::from_secs(86400))
}

async fn patch_preflight_status(req: Request<Body>, next: middleware::Next) -> Response {
    let is_preflight = req.method() == Method::OPTIONS
        && req.headers().contains_key(header::ORIGIN)
        && req.headers().contains_key("access-control-request-method");

    let mut res = next.run(req).await;

    if is_preflight && res.status() == StatusCode::OK {
        *res.status_mut() = StatusCode::NO_CONTENT;
    }

    res
}

async fn user_settings() -> StatusCode {
    tracing::info!("[API] PUT /user/settings -> 204");
    StatusCode::NO_CONTENT
}

async fn feedback() -> StatusCode {
    tracing::info!("[API] POST /feedback -> 204");
    StatusCode::NO_CONTENT
}

async fn resources_batch_get(
    State(store): State<FileStore>,
    Json(body): Json<ResourcesBatchGetRequest>,
) -> Json<ResourcesBatchGetResponse> {
    tracing::info!("[API] POST /resources/batch-get -> 200");
    let mut changed = IndexMap::new();
    for resource in &body.resources {
        changed.insert(
            resource.id.clone(),
            store.build_resources_response(&resource.id),
        );
    }
    Json(ResourcesBatchGetResponse { changed })
}

async fn create_file(
    State(store): State<FileStore>,
    Json(body): Json<CreateFileRequest>,
) -> Json<CreateFileResponse> {
    let file_id = uuid::Uuid::new_v4().to_string();
    store.create_file(
        &file_id,
        body.file_name.as_deref(),
        body.folder_id.as_deref(),
        body.resources_id.as_deref(),
    );
    tracing::info!(
        "[API] POST /files -> 200 (id={}, name={:?})",
        file_id,
        body.file_name
    );
    Json(CreateFileResponse { id: file_id })
}

async fn create_folder(
    State(store): State<FileStore>,
    Json(body): Json<CreateFolderRequest>,
) -> Json<CreateFolderResponse> {
    let folder_id = uuid::Uuid::new_v4().to_string();
    let resource = store.create_folder(
        &folder_id,
        body.folder_name.as_deref(),
        body.parent_id.as_deref(),
    );
    tracing::info!(
        "[API] POST /folders -> 200 (id={}, name={:?})",
        folder_id,
        body.folder_name
    );
    Json(CreateFolderResponse {
        id: folder_id,
        resource,
    })
}

async fn resource_update(
    State(store): State<FileStore>,
    Path((resources_id, item_id)): Path<(String, String)>,
    Json(body): Json<serde_json::Value>,
) -> Response {
    tracing::info!(
        "[API] PATCH /resources/{}/items/{} -> ...",
        resources_id,
        item_id
    );

    let updated = store.update_resource(&item_id, |resource_val| {
        if let Some(resource_obj) = resource_val.as_object_mut() {
            if let Some(body_obj) = body.as_object() {
                for (key, value) in body_obj {
                    resource_obj.insert(key.clone(), value.clone());
                }
            }
        }
    });

    match updated {
        Some(resource) => {
            tracing::info!("[API]   -> 200");
            Json(PatchResourceResponse { resource }).into_response()
        }
        None => {
            tracing::info!("[API]   -> 404");
            (
                StatusCode::NOT_FOUND,
                Json(serde_json::json!({"error": "Resource not found"})),
            )
                .into_response()
        }
    }
}

async fn resource_archive(
    State(store): State<FileStore>,
    Path((resources_id, item_id)): Path<(String, String)>,
    Json(body): Json<ArchiveResourceRequest>,
) -> Json<ArchiveResourceResponse> {
    tracing::info!(
        "[API] POST /resources/{}/items/{}/archive -> 200",
        resources_id,
        item_id
    );

    let mut affected = vec![];
    let updated = store.update_resource(&item_id, |resource_val| {
        if let Some(obj) = resource_val.as_object_mut() {
            obj.insert("archived".to_string(), serde_json::json!(body.archived));
        }
    });
    if let Some(val) = updated {
        affected.push(val);
    }

    Json(ArchiveResourceResponse {
        resources: affected,
    })
}

async fn fallback_404(req: axum::extract::Request) -> impl IntoResponse {
    let method = req.method().clone();
    let uri = req.uri().clone();
    tracing::warn!("[API] 404 {} {}", method, uri);
    (
        StatusCode::NOT_FOUND,
        Json(serde_json::json!({"error": "Not found"})),
    )
}

pub fn router(store: FileStore) -> Router {
    Router::new()
        .route("/resources/batch-get", post(resources_batch_get))
        .route(
            "/resources/{resourcesId}/items/{itemId}",
            patch(resource_update),
        )
        .route(
            "/resources/{resourcesId}/items/{itemId}/archive",
            post(resource_archive),
        )
        .route("/files", post(create_file))
        .route("/folders", post(create_folder))
        .route("/user/settings", put(user_settings))
        .route("/feedback", post(feedback))
        .fallback(fallback_404)
        .layer(cors_layer())
        .layer(middleware::from_fn(patch_preflight_status))
        .with_state(store)
}
