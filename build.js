const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "webapp");
const OUT = path.join(__dirname, "dist");

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function build() {
  console.log("Building Deckle webapp...");

  // Clean dist
  if (fs.existsSync(OUT)) {
    fs.rmSync(OUT, { recursive: true });
  }
  fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });

  const assetsDir = path.join(SRC, "assets");
  const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
  const cssFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".css"));
  const otherFiles = fs
    .readdirSync(assetsDir)
    .filter((f) => !f.endsWith(".js") && !f.endsWith(".css"));

  // Minify JS files
  for (const file of jsFiles) {
    const srcPath = path.join(assetsDir, file);
    const outPath = path.join(OUT, "assets", file);
    const srcSize = fs.statSync(srcPath).size;
    await esbuild.build({
      entryPoints: [srcPath],
      bundle: false,
      minify: true,
      outfile: outPath,
    });
    const outSize = fs.statSync(outPath).size;
    console.log(
      `  JS  ${file}: ${formatSize(srcSize)} -> ${formatSize(outSize)}`
    );
  }

  // Minify CSS files
  for (const file of cssFiles) {
    const srcPath = path.join(assetsDir, file);
    const outPath = path.join(OUT, "assets", file);
    const srcSize = fs.statSync(srcPath).size;
    await esbuild.build({
      entryPoints: [srcPath],
      bundle: false,
      minify: true,
      outfile: outPath,
    });
    const outSize = fs.statSync(outPath).size;
    console.log(
      `  CSS ${file}: ${formatSize(srcSize)} -> ${formatSize(outSize)}`
    );
  }

  // Copy other assets (images etc)
  for (const file of otherFiles) {
    fs.copyFileSync(
      path.join(assetsDir, file),
      path.join(OUT, "assets", file)
    );
    console.log(`  CPY ${file}`);
  }

  // Copy index.html
  fs.copyFileSync(path.join(SRC, "index.html"), path.join(OUT, "index.html"));
  console.log("  CPY index.html");

  // Copy static/ directory (fonts, shaders, images)
  const staticDir = path.join(SRC, "static");
  if (fs.existsSync(staticDir)) {
    copyRecursive(staticDir, path.join(OUT, "static"));
    const count = fs.readdirSync(path.join(OUT, "static"), {
      recursive: true,
    }).length;
    console.log(`  CPY static/ (${count} entries)`);
  }

  console.log("Build complete -> dist/");
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
