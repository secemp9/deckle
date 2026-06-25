# Deckle Desktop

Open-source UI design tool with a built-in MCP server for AI agents (Claude Code, Cursor, etc.).

## Install

```bash
cargo install deckle-desktop
```

Requires Rust 1.70+. On Linux, install the build dependencies first:

**Ubuntu / Debian:**
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf
```

**Fedora:**
```bash
sudo dnf install webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel patchelf
```

**Arch Linux:**
```bash
sudo pacman -S webkit2gtk-4.1 gtk3 libappindicator-gtk3 librsvg patchelf
```

## Claude Code MCP Setup

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "deckle": {
      "command": "deckle-desktop",
      "args": ["--mcp"]
    }
  }
}
```

Or use the CLI:

```bash
claude mcp add deckle -s user -- deckle-desktop --mcp
```

## How It Works

The `--mcp` flag runs a lightweight stdio proxy that Claude Code manages as a child process. It forwards MCP tool calls to the running Deckle Desktop GUI via internal HTTP endpoints. The connection is automatic -- no hardcoded URLs or ports needed.

When the GUI is not running, tools are still listed but calls return a clear error asking you to start Deckle Desktop.

## Usage

1. Launch Deckle Desktop: `deckle-desktop`
2. Open or create a design file
3. Use Claude Code -- deckle tools are available automatically
4. AI can create designs, inspect elements, export code and images

## Tools

Deckle exposes 30 MCP tools covering:

- **File management** -- open, list, create files and pages
- **Artboard creation** -- create artboards with custom dimensions
- **HTML writing** -- write HTML into design nodes
- **Screenshots** -- capture node screenshots at configurable scale
- **JSX export** -- export nodes as Tailwind or inline-style JSX
- **Style inspection** -- read computed styles, font info, image fills
- **Design tokens** -- get, create, and set design tokens (JSON/CSS/Tailwind)
- **Node operations** -- duplicate, delete, move, rename, restyle nodes
- **PDF export** -- export selected nodes to PDF

## Links

- [Repository](https://github.com/secemp9/deckle)
- [Crates.io](https://crates.io/crates/deckle-desktop)

## License

MIT
