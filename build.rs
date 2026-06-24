use std::fs;
use std::path::Path;

fn main() {
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let dist = Path::new(&manifest_dir).join("dist");
    let webapp = Path::new(&manifest_dir).join("webapp");

    // If dist/ doesn't exist (e.g., `cargo install` without the Node.js build
    // step), copy webapp/ into dist/ so tauri::generate_context!() can find the
    // frontend assets.  The files are unminified but fully functional.
    if !dist.exists() && webapp.exists() {
        eprintln!("cargo:warning=dist/ not found, copying webapp/ -> dist/ (unminified fallback)");
        copy_dir(&webapp, &dist).expect("failed to copy webapp/ to dist/");
    }

    println!("cargo:rerun-if-changed=webapp/");
    println!("cargo:rerun-if-changed=dist/");

    tauri_build::build();
}

fn copy_dir(src: &Path, dst: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        if entry.file_type()?.is_dir() {
            copy_dir(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }
    Ok(())
}
