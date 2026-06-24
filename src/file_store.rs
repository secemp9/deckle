// Persistent file store for Deckle design documents.
//
// Manages:
// - Reading/writing JSON file data under ~/.deckle-local/files/
// - The resource index (resources.json)
// - File creation, listing, deletion
//
// Thread-safe via Arc<RwLock<...>>.

use std::collections::HashMap;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};

use crate::types::{
    create_empty_file, now_millis, seed_resources, FileData, Resource, ResourceContainer,
    ROOT_FOLDER_ID, TEAM_ID, USER_ID,
};

pub(crate) const SCRATCHPAD_FILE_ID: &str = "00000000-0000-0000-0000-000000000001";
const SCRATCHPAD_NAME: &str = "Scratchpad";
const SCRATCHPAD_PAGE_ID: &str = "1-0";
const SCRATCHPAD_ROOT_NODE_ID: &str = "root_node_1-0";

fn is_scratchpad_resource(resource: &serde_json::Value) -> bool {
    resource
        .get("isScratchpad")
        .and_then(serde_json::Value::as_bool)
        == Some(true)
}

fn scratchpad_resource_value(created_at: u64, updated_at: u64) -> serde_json::Value {
    serde_json::json!({
        "id": SCRATCHPAD_FILE_ID,
        "type": 1,
        "name": SCRATCHPAD_NAME,
        "parentId": null,
        "createdAt": created_at,
        "updatedAt": updated_at,
        "archived": false,
        "createdByUserId": USER_ID,
        "isScratchpad": true,
    })
}

fn scratchpad_file_path(files_dir: &Path) -> PathBuf {
    files_dir.join(format!("{}.json", SCRATCHPAD_FILE_ID))
}

fn scratchpad_file_value() -> serde_json::Value {
    serde_json::to_value(create_empty_file(SCRATCHPAD_FILE_ID, USER_ID, USER_ID))
        .expect("BUG: scratchpad FileData failed to serialize to Value")
}

fn load_json_from_path(path: &Path) -> Option<serde_json::Value> {
    match fs::read_to_string(path) {
        Ok(contents) => match serde_json::from_str(&contents) {
            Ok(value) => Some(value),
            Err(e) => {
                tracing::warn!("Failed to parse file {}: {}", path.display(), e);
                None
            }
        },
        Err(_) => None,
    }
}

fn scratchpad_requires_blank_reset(file: &FileData) -> bool {
    let Some(page) = file.pages.iter().find(|page| page.id == SCRATCHPAD_PAGE_ID) else {
        return true;
    };
    if page.soft_deleted || file.counter.pages == 0 {
        return true;
    }

    let Some(root_node) = file.nodes.get(SCRATCHPAD_ROOT_NODE_ID) else {
        return true;
    };
    root_node.soft_deleted
}

fn normalize_scratchpad_file_value(
    existing: Option<serde_json::Value>,
) -> (serde_json::Value, bool) {
    let Some(value) = existing else {
        return (scratchpad_file_value(), true);
    };

    match serde_json::from_value::<FileData>(value.clone()) {
        Ok(mut file) => {
            if scratchpad_requires_blank_reset(&file) {
                return (scratchpad_file_value(), true);
            }

            let mut changed = false;
            if file._id != SCRATCHPAD_FILE_ID {
                file._id = SCRATCHPAD_FILE_ID.to_string();
                changed = true;
            }
            if file.id != SCRATCHPAD_FILE_ID {
                file.id = SCRATCHPAD_FILE_ID.to_string();
                changed = true;
            }
            if file.resources_id != USER_ID {
                file.resources_id = USER_ID.to_string();
                changed = true;
            }
            if file.user_id != USER_ID {
                file.user_id = USER_ID.to_string();
                changed = true;
            }

            if changed {
                (
                    serde_json::to_value(&file)
                        .expect("BUG: normalized scratchpad FileData failed to serialize"),
                    true,
                )
            } else {
                (value, false)
            }
        }
        Err(e) => {
            tracing::warn!("Scratchpad file failed schema validation, resetting: {}", e);
            (scratchpad_file_value(), true)
        }
    }
}

/// Returns the root data directory: ~/.deckle-local/
pub fn get_data_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("/tmp"))
        .join(".deckle-local")
}

/// Returns the files directory: ~/.deckle-local/files/
pub fn get_files_dir() -> PathBuf {
    get_data_dir().join("files")
}

/// Returns the resources.json path: ~/.deckle-local/resources.json
pub fn get_resources_path() -> PathBuf {
    get_data_dir().join("resources.json")
}

// ---------------------------------------------------------------------------
// FileStore
// ---------------------------------------------------------------------------

/// Thread-safe file store that persists Deckle design documents and the
/// resource index to disk under ~/.deckle-local/.
#[derive(Debug, Clone)]
pub struct FileStore {
    inner: Arc<RwLock<FileStoreInner>>,
}

#[derive(Debug)]
struct FileStoreInner {
    /// In-memory resource container (mirrors resources.json on disk).
    resources: ResourceContainer,
    /// Root data directory (default: ~/.deckle-local/).
    data_dir: PathBuf,
}

impl FileStoreInner {
    fn files_dir(&self) -> PathBuf {
        self.data_dir.join("files")
    }

    fn resources_path(&self) -> PathBuf {
        self.data_dir.join("resources.json")
    }
}

impl FileStore {
    /// Initialize the file store with the default data directory (~/.deckle-local/).
    /// Creates the directory structure if it does not exist, and loads (or seeds)
    /// resources.json.
    pub fn new() -> Self {
        Self::with_data_dir(get_data_dir())
    }

    /// Initialize the file store with a custom data directory.
    /// Useful for testing.
    pub fn with_data_dir(data_dir: PathBuf) -> Self {
        let files_dir = data_dir.join("files");
        fs::create_dir_all(&files_dir).expect("Failed to create files directory");
        tracing::info!("Data dir: {}", data_dir.display());
        tracing::info!("Files dir: {}", files_dir.display());

        // Load or seed resources
        let resources_path = data_dir.join("resources.json");
        let resources = load_resources_from_path(&resources_path);

        FileStore {
            inner: Arc::new(RwLock::new(FileStoreInner {
                resources,
                data_dir,
            })),
        }
    }

    /// Create an empty file with one page and one root node, matching the
    /// exact shape produced by the Node.js createEmptyFile function.
    pub fn create_empty_file(file_id: &str) -> FileData {
        create_empty_file(file_id, TEAM_ID, USER_ID)
    }

    /// Load a file from disk as a serde_json::Value.
    ///
    /// The dedicated Scratchpad is special-cased to self-heal malformed or
    /// wrongly scoped on-disk state and will always return a normalized value.
    /// Other files return None if the file does not exist or cannot be parsed.
    pub fn load_file(&self, file_id: &str) -> Option<serde_json::Value> {
        if file_id == SCRATCHPAD_FILE_ID {
            return Some(self.load_user_scratchpad_file());
        }

        let path = {
            let inner = self.inner.read().expect("RwLock poisoned");
            inner.files_dir().join(format!("{}.json", file_id))
        };
        load_json_from_path(&path)
    }

    /// Save file data to disk as pretty-printed JSON (2-space indent).
    ///
    /// Uses atomic write-then-rename: writes to a temporary file in the same
    /// directory, calls fsync, then renames over the target path. This ensures
    /// the file is never left in a partially-written state even if the process
    /// is killed mid-write.
    pub fn save_file(&self, file_id: &str, data: &serde_json::Value) {
        let inner = self.inner.read().expect("RwLock poisoned");
        let path = inner.files_dir().join(format!("{}.json", file_id));
        // serde_json::to_string_pretty on a serde_json::Value cannot fail
        // (Value is always valid JSON), so unwrap is safe here.
        let json =
            serde_json::to_string_pretty(data).expect("BUG: serde_json::Value failed to serialize");
        atomic_write(&path, json.as_bytes());
    }

    /// Load the in-memory resource container. Returns a clone.
    pub fn load_resources(&self) -> ResourceContainer {
        let inner = self.inner.read().expect("RwLock poisoned");
        inner.resources.clone()
    }

    /// Save the resource container to disk and update the in-memory copy.
    pub fn save_resources(&self, resources: &ResourceContainer) {
        let inner_ref = self.inner.read().expect("RwLock poisoned");
        save_resources_to_path(&inner_ref.resources_path(), resources);
        drop(inner_ref);

        let mut inner = self.inner.write().expect("RwLock poisoned");
        inner.resources = resources.clone();
    }

    fn ensure_user_scratchpad_resource(&self) -> serde_json::Value {
        let mut inner = self.inner.write().expect("RwLock poisoned");
        let now = now_millis();
        let existing = inner.resources.resources.get(SCRATCHPAD_FILE_ID).cloned();
        let created_at = existing
            .as_ref()
            .and_then(|resource| resource.get("createdAt"))
            .and_then(serde_json::Value::as_u64)
            .unwrap_or(now);
        let mut updated_at = existing
            .as_ref()
            .and_then(|resource| resource.get("updatedAt"))
            .and_then(serde_json::Value::as_u64)
            .unwrap_or(now);
        let expected = scratchpad_resource_value(created_at, updated_at);

        if existing.as_ref() != Some(&expected) {
            updated_at = now;
            let normalized = scratchpad_resource_value(created_at, updated_at);
            inner
                .resources
                .resources
                .insert(SCRATCHPAD_FILE_ID.to_string(), normalized.clone());
            inner.resources.updated_at = updated_at;
            save_resources_to_path(&inner.resources_path(), &inner.resources);
            return normalized;
        }

        inner.resources.resources[SCRATCHPAD_FILE_ID].clone()
    }

    /// Load the dedicated personal Scratchpad file, repairing stale or legacy
    /// on-disk state to a known-good localhost blank-file baseline when needed.
    pub fn load_user_scratchpad_file(&self) -> serde_json::Value {
        let _ = self.ensure_user_scratchpad_resource();
        let scratchpad_path = {
            let inner = self.inner.read().expect("RwLock poisoned");
            scratchpad_file_path(&inner.files_dir())
        };
        let (normalized, changed) =
            normalize_scratchpad_file_value(load_json_from_path(&scratchpad_path));
        if changed {
            self.save_file(SCRATCHPAD_FILE_ID, &normalized);
        }
        normalized
    }

    /// Ensure the dedicated personal Scratchpad file exists on disk and in
    /// resources.json, then return its resource metadata.
    pub fn ensure_user_scratchpad(&self) -> serde_json::Value {
        let scratchpad = self.ensure_user_scratchpad_resource();
        let _ = self.load_user_scratchpad_file();
        scratchpad
    }

    /// Build the API-facing resource container view for the requested container id.
    ///
    /// - User container: a dedicated Scratchpad file only.
    /// - Any non-user container: the shared team resources, with Scratchpad hidden.
    pub fn build_resources_response(&self, resources_id: &str) -> ResourceContainer {
        if resources_id == USER_ID {
            let scratchpad = self.ensure_user_scratchpad();
            let created_at = scratchpad
                .get("createdAt")
                .and_then(serde_json::Value::as_u64)
                .unwrap_or_else(now_millis);
            let updated_at = scratchpad
                .get("updatedAt")
                .and_then(serde_json::Value::as_u64)
                .unwrap_or(created_at);
            let mut resources = HashMap::new();
            resources.insert(SCRATCHPAD_FILE_ID.to_string(), scratchpad);
            return ResourceContainer {
                _id: USER_ID.to_string(),
                id: USER_ID.to_string(),
                resources,
                created_at,
                updated_at,
            };
        }

        let stored = self.load_resources();
        let resources = stored
            .resources
            .into_iter()
            .filter(|(_, resource)| !is_scratchpad_resource(resource))
            .collect();
        ResourceContainer {
            _id: resources_id.to_string(),
            id: resources_id.to_string(),
            resources,
            created_at: stored.created_at,
            updated_at: stored.updated_at,
        }
    }

    /// Create a new file: writes the empty file to disk, adds a resource
    /// entry, and returns the file ID.
    ///
    /// Matches the behavior of `POST /files` in api-server.js.
    pub fn create_file(
        &self,
        file_id: &str,
        file_name: Option<&str>,
        folder_id: Option<&str>,
        resources_id: Option<&str>,
    ) -> String {
        let file_name = file_name.unwrap_or("Untitled");
        let folder_id = folder_id.unwrap_or(ROOT_FOLDER_ID);
        let rid = resources_id.unwrap_or(TEAM_ID);

        // Create the empty file data and save to disk
        let file_data = create_empty_file(file_id, rid, USER_ID);
        // FileData always serializes to a valid Value (no non-finite floats,
        // no non-string map keys), so this cannot fail in practice.
        let file_value =
            serde_json::to_value(&file_data).expect("BUG: FileData failed to serialize to Value");
        self.save_file(file_id, &file_value);

        // Add resource entry
        let now = now_millis();
        let resource_val = serde_json::json!({
            "id": file_id,
            "type": 1, // File
            "name": file_name,
            "parentId": folder_id,
            "createdAt": now,
            "updatedAt": now,
        });

        {
            let mut inner = self.inner.write().expect("RwLock poisoned");
            inner
                .resources
                .resources
                .insert(file_id.to_string(), resource_val);
            inner.resources.updated_at = now;
            save_resources_to_path(&inner.resources_path(), &inner.resources);
        }

        tracing::info!("Created file: {} (\"{}\")", file_id, file_name);
        file_id.to_string()
    }

    /// Create a new folder: adds a resource entry and returns the folder ID
    /// and the Resource.
    ///
    /// Matches the behavior of `POST /folders` in api-server.js.
    pub fn create_folder(
        &self,
        folder_id: &str,
        folder_name: Option<&str>,
        parent_id: Option<&str>,
    ) -> Resource {
        let folder_name = folder_name.unwrap_or("New Folder");
        let parent_id = parent_id.unwrap_or(ROOT_FOLDER_ID);
        let now = now_millis();

        let resource_val = serde_json::json!({
            "id": folder_id,
            "type": 0, // Folder
            "name": folder_name,
            "parentId": parent_id,
            "createdAt": now,
            "updatedAt": now,
        });

        let resource: Resource = serde_json::from_value(resource_val.clone())
            .expect("BUG: folder Value should always convert to Resource");

        {
            let mut inner = self.inner.write().expect("RwLock poisoned");
            inner
                .resources
                .resources
                .insert(folder_id.to_string(), resource_val);
            inner.resources.updated_at = now;
            save_resources_to_path(&inner.resources_path(), &inner.resources);
        }

        tracing::info!("Created folder: {} (\"{}\")", folder_id, folder_name);
        resource
    }

    /// List all resources.
    pub fn list_resources(&self) -> Vec<Resource> {
        let inner = self.inner.read().expect("RwLock poisoned");
        inner
            .resources
            .resources
            .values()
            .filter_map(|v| serde_json::from_value(v.clone()).ok())
            .collect()
    }

    /// Get a specific resource by ID.
    pub fn get_resource(&self, resource_id: &str) -> Option<Resource> {
        let inner = self.inner.read().expect("RwLock poisoned");
        inner
            .resources
            .resources
            .get(resource_id)
            .and_then(|v| serde_json::from_value(v.clone()).ok())
    }

    /// Update a resource in-place. Returns the updated resource value if found.
    /// The closure receives `&mut serde_json::Value` to allow arbitrary field
    /// changes matching Node.js Object.assign behavior.
    pub fn update_resource<F>(&self, resource_id: &str, updater: F) -> Option<serde_json::Value>
    where
        F: FnOnce(&mut serde_json::Value),
    {
        let mut inner = self.inner.write().expect("RwLock poisoned");
        if let Some(resource) = inner.resources.resources.get_mut(resource_id) {
            updater(resource);
            resource["updatedAt"] = serde_json::json!(now_millis());
            let result = resource.clone();
            inner.resources.updated_at = now_millis();
            save_resources_to_path(&inner.resources_path(), &inner.resources);
            Some(result)
        } else {
            None
        }
    }

    /// Reload resources from disk (useful if external changes may have occurred).
    pub fn reload_resources(&self) {
        let inner_ref = self.inner.read().expect("RwLock poisoned");
        let path = inner_ref.resources_path();
        drop(inner_ref);

        let resources = load_resources_from_path(&path);
        let mut inner = self.inner.write().expect("RwLock poisoned");
        inner.resources = resources;
    }
}

// ---------------------------------------------------------------------------
// Disk I/O helpers (private)
// ---------------------------------------------------------------------------

/// Load resources.json from the given path, or seed with defaults if it
/// doesn't exist or cannot be parsed.
fn load_resources_from_path(path: &PathBuf) -> ResourceContainer {
    match fs::read_to_string(path) {
        Ok(contents) => match serde_json::from_str(&contents) {
            Ok(resources) => resources,
            Err(e) => {
                tracing::warn!("Failed to parse resources.json, re-seeding: {}", e);
                let resources = seed_resources(TEAM_ID, ROOT_FOLDER_ID, USER_ID);
                save_resources_to_path(path, &resources);
                resources
            }
        },
        Err(_) => {
            // Seed with default resources container
            tracing::info!("resources.json not found, creating with seed data");
            let resources = seed_resources(TEAM_ID, ROOT_FOLDER_ID, USER_ID);
            save_resources_to_path(path, &resources);
            resources
        }
    }
}

/// Write resources to disk as pretty-printed JSON.
///
/// Uses atomic write-then-rename to prevent corruption on crash.
fn save_resources_to_path(path: &PathBuf, resources: &ResourceContainer) {
    // Serialization of ResourceContainer cannot realistically fail (no
    // non-finite floats, no maps with non-string keys), but we handle
    // it gracefully just in case.
    let json = match serde_json::to_string_pretty(resources) {
        Ok(j) => j,
        Err(e) => {
            tracing::error!("Failed to serialize resources: {}", e);
            return;
        }
    };
    atomic_write(path, json.as_bytes());
}

/// Atomically write `data` to `path` using write-to-temp-then-rename.
///
/// 1. Write to a temporary file in the same directory as `path`.
/// 2. Call `fsync` to ensure bytes are on disk.
/// 3. Rename the temp file over the target path (atomic on POSIX).
///
/// If the process is killed at any point, the original file is either
/// untouched (rename hasn't happened) or fully replaced (rename completed).
///
/// Logs an error and returns early if any I/O step fails, rather than
/// panicking.  The original file is left untouched on failure.
fn atomic_write(path: &std::path::Path, data: &[u8]) {
    let parent = match path.parent() {
        Some(p) => p,
        None => {
            tracing::error!("atomic_write: path {:?} has no parent directory", path);
            return;
        }
    };
    let tmp_path = parent.join(format!(
        ".tmp-{}-{}",
        path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown"),
        std::process::id()
    ));

    // Write to temp file, fsync, then rename.  If any step fails, clean up
    // the temp file (best-effort) and log the error.
    let result: std::io::Result<()> = (|| {
        {
            let mut file = fs::File::create(&tmp_path)?;
            file.write_all(data)?;
            file.sync_all()?;
        }
        fs::rename(&tmp_path, path)?;
        Ok(())
    })();

    if let Err(e) = result {
        // Best-effort cleanup of the temp file.
        let _ = fs::remove_file(&tmp_path);
        tracing::error!("atomic_write: failed to write {:?}: {}", path, e);
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// Create a FileStore backed by a temporary directory.
    fn temp_store() -> (FileStore, tempfile::TempDir) {
        let dir = tempfile::tempdir().expect("Failed to create temp dir");
        let store = FileStore::with_data_dir(dir.path().join(".deckle-local"));
        (store, dir)
    }

    #[test]
    fn test_create_empty_file_serializes() {
        let file = FileStore::create_empty_file("test-id");
        let json = serde_json::to_string_pretty(&file).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed["_id"], "test-id");
        assert_eq!(parsed["id"], "test-id");
        assert!(parsed["pages"].is_array());
        assert!(parsed["nodes"].is_object());
    }

    #[test]
    fn test_file_store_new_seeds_resources() {
        let (store, _dir) = temp_store();
        let resources = store.load_resources();
        assert_eq!(resources._id, TEAM_ID);
        assert!(resources.resources.contains_key(ROOT_FOLDER_ID));
        let folder = &resources.resources[ROOT_FOLDER_ID];
        assert_eq!(folder["name"], serde_json::json!("Projects"));
        assert_eq!(folder["type"], serde_json::json!(0));
    }

    #[test]
    fn test_file_store_create_and_load_file() {
        let (store, _dir) = temp_store();

        let file_id = "test-file-123";
        store.create_file(file_id, Some("My Design"), None, None);

        // Verify file exists on disk
        let loaded = store.load_file(file_id);
        assert!(loaded.is_some());
        let loaded = loaded.unwrap();
        assert_eq!(loaded["_id"], file_id);
        assert_eq!(loaded["id"], file_id);
        assert_eq!(loaded["schema"], 20260529);

        // Verify resource was added
        let resources = store.load_resources();
        assert!(resources.resources.contains_key(file_id));
        let resource = &resources.resources[file_id];
        assert_eq!(resource["name"], serde_json::json!("My Design"));
        assert_eq!(resource["type"], serde_json::json!(1)); // File
        assert_eq!(resource["parentId"].as_str(), Some(ROOT_FOLDER_ID));
    }

    #[test]
    fn test_file_store_create_folder() {
        let (store, _dir) = temp_store();

        let folder_id = "test-folder-456";
        let resource = store.create_folder(folder_id, Some("Design System"), None);
        assert_eq!(resource.id, folder_id);
        assert_eq!(resource.name, "Design System");
        assert_eq!(resource.resource_type, 0); // Folder

        // Verify it's in the resource list
        let all = store.list_resources();
        assert!(all.iter().any(|r| r.id == folder_id));
    }

    #[test]
    fn test_file_store_save_and_load_file() {
        let (store, _dir) = temp_store();

        let data = serde_json::json!({
            "_id": "save-test",
            "id": "save-test",
            "pages": [{"id": "1-0"}],
            "nodes": {}
        });

        store.save_file("save-test", &data);
        let loaded = store.load_file("save-test");
        assert!(loaded.is_some());
        assert_eq!(loaded.unwrap()["_id"], "save-test");
    }

    #[test]
    fn test_file_store_load_nonexistent_file() {
        let (store, _dir) = temp_store();
        assert!(store.load_file("nonexistent-id").is_none());
    }

    #[test]
    fn test_file_store_update_resource() {
        let (store, _dir) = temp_store();

        let file_id = "update-test";
        store.create_file(file_id, Some("Original Name"), None, None);

        let updated = store.update_resource(file_id, |r| {
            if let Some(obj) = r.as_object_mut() {
                obj.insert("name".to_string(), serde_json::json!("Renamed File"));
            }
        });
        assert!(updated.is_some());
        assert_eq!(updated.unwrap()["name"], serde_json::json!("Renamed File"));

        // Verify persistence by reloading from disk
        store.reload_resources();
        let reloaded = store.load_resources();
        assert_eq!(
            reloaded.resources[file_id]["name"],
            serde_json::json!("Renamed File")
        );
    }

    #[test]
    fn test_build_resources_response_returns_user_scratchpad_only() {
        let (store, _dir) = temp_store();

        store.create_file("team-file", Some("Team File"), None, None);

        let user_resources = store.build_resources_response(USER_ID);
        assert_eq!(user_resources.id, USER_ID);
        assert_eq!(user_resources.resources.len(), 1);
        let scratchpad = user_resources.resources.values().next().unwrap();
        assert_eq!(scratchpad["id"], serde_json::json!(SCRATCHPAD_FILE_ID));
        assert_eq!(scratchpad["type"], serde_json::json!(1));
        assert_eq!(scratchpad["name"], serde_json::json!(SCRATCHPAD_NAME));
        assert_eq!(scratchpad["parentId"], serde_json::Value::Null);
        assert_eq!(scratchpad["archived"], serde_json::json!(false));
        assert_eq!(scratchpad["isScratchpad"], serde_json::json!(true));

        let scratchpad_file = store
            .load_file(SCRATCHPAD_FILE_ID)
            .expect("scratchpad file should exist on disk");
        assert_eq!(scratchpad_file["resourcesId"], serde_json::json!(USER_ID));

        let team_resources = store.build_resources_response(TEAM_ID);
        assert!(!team_resources.resources.contains_key(SCRATCHPAD_FILE_ID));
        assert!(team_resources.resources.contains_key(ROOT_FOLDER_ID));
        assert!(team_resources.resources.contains_key("team-file"));
    }

    #[test]
    fn test_load_file_repairs_malformed_scratchpad_to_blank_shape() {
        let (store, dir) = temp_store();
        let scratchpad_path = scratchpad_file_path(&dir.path().join(".deckle-local/files"));
        atomic_write(&scratchpad_path, br#"{"broken":true}"#);

        let scratchpad_file = store
            .load_file(SCRATCHPAD_FILE_ID)
            .expect("scratchpad file should be repaired");
        assert_eq!(
            scratchpad_file["_id"],
            serde_json::json!(SCRATCHPAD_FILE_ID)
        );
        assert_eq!(scratchpad_file["id"], serde_json::json!(SCRATCHPAD_FILE_ID));
        assert_eq!(scratchpad_file["resourcesId"], serde_json::json!(USER_ID));
        assert_eq!(scratchpad_file["userId"], serde_json::json!(USER_ID));
        assert_eq!(
            scratchpad_file["pages"][0]["id"],
            serde_json::json!(SCRATCHPAD_PAGE_ID)
        );
        assert_eq!(
            scratchpad_file["nodes"][SCRATCHPAD_ROOT_NODE_ID]["styles"]["display"],
            serde_json::json!("*")
        );
        assert_eq!(scratchpad_file["counter"]["pages"], serde_json::json!(1));
        assert_eq!(scratchpad_file["labelCounter"], serde_json::json!({}));
        assert_eq!(scratchpad_file["nodeRelationships"], serde_json::json!({}));
        assert_eq!(scratchpad_file["isTutorial"], serde_json::json!(false));
    }

    #[test]
    fn test_load_file_repairs_wrongly_scoped_scratchpad_in_place() {
        let (store, _dir) = temp_store();
        let mut scratchpad =
            serde_json::to_value(create_empty_file(SCRATCHPAD_FILE_ID, TEAM_ID, USER_ID))
                .expect("scratchpad FileData should serialize");
        scratchpad["nodes"][SCRATCHPAD_ROOT_NODE_ID]["label"] = serde_json::json!("Keep me");
        store.save_file(SCRATCHPAD_FILE_ID, &scratchpad);

        let repaired = store
            .load_file(SCRATCHPAD_FILE_ID)
            .expect("scratchpad file should be repaired");
        assert_eq!(repaired["resourcesId"], serde_json::json!(USER_ID));
        assert_eq!(repaired["userId"], serde_json::json!(USER_ID));
        assert_eq!(
            repaired["nodes"][SCRATCHPAD_ROOT_NODE_ID]["label"],
            serde_json::json!("Keep me")
        );
    }

    #[test]
    fn test_file_store_list_resources() {
        let (store, _dir) = temp_store();

        // Should have root folder from seed
        let initial = store.list_resources();
        assert_eq!(initial.len(), 1);

        // Add a file
        store.create_file("list-test-1", Some("File One"), None, None);
        let after = store.list_resources();
        assert_eq!(after.len(), 2);
    }
}
