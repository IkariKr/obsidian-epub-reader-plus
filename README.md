# EPUB Reader Plus for Obsidian

EPUB Reader Plus is a polished EPUB reader for Obsidian. It opens `.epub` files directly in your vault and focuses on comfortable, paginated reading.

## Highlights

- Single, centered paginated reading view with responsive reflow.
- Mouse-wheel page turning in paginated mode.
- Compact table of contents and modern navigation controls.
- Theme-aware reader background, with an optional custom background color.
- Publisher EPUB styles are preserved for headings, emphasis, and relative typography.
- Reading progress is retained by book name; font-size changes anchor the visible text before reflowing.

## Install

After community-plugin review, install **EPUB Reader Plus** from Obsidian's Community plugins browser. For a manual install, download `main.js`, `manifest.json`, and `styles.css` from the matching GitHub Release and copy them to:

```text
<vault>/.obsidian/plugins/epub-reader-plus/
```

## Migrating from ePub Reader

This plugin replaces the unmaintained **ePub Reader** plugin. Disable the original plugin before enabling EPUB Reader Plus; both plugins register the `.epub` extension and should not run together.

Your per-book reading position is preserved because both plugins use the book name as the progress key. Reader settings start with the new plugin defaults.

## Upstream and attribution

EPUB Reader Plus is independently maintained and is based on [caronchen/obsidian-epub-plugin](https://github.com/caronchen/obsidian-epub-plugin), originally created by caronchen. It retains the upstream MIT License and copyright notice.

## Development

```bash
npm install
npm test
npm run build
```

## License

MIT. See [LICENSE](LICENSE).
