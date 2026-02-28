# Builder Report

## Scope
- Add `.ai` import support in existing single-file app with minimal invasive changes.
- Preserve existing `.svg` and image import behavior.
- Ensure non-compatible `.ai` fails safely with user-facing status.

## Files Changed
- `index.html`

## Change Summary
1. Extended file input accept types:
   - `openFileInput` and `importFileInput` now accept `.ai` in addition to `.svg`.
2. Extended file-picker open path:
   - `openSvgFile()` now allows `SVG/AI` types and routes selected file to a new shared handler `handlePickedImportFile(...)`.
3. Added new helper functions:
   - `isSvgFile(file)`
   - `isAiFile(file)`
   - `ensurePdfJsLib()` (lazy-loads `pdfjs-dist` from CDN and sets worker path)
   - `aiFileToSvgText(file)` (reads AI as ArrayBuffer and tries PDF.js SVG conversion)
   - `importAiFile(file, options)` (imports converted SVG via existing `importSvgTextFitted`)
   - `handlePickedImportFile(file, options)` (shared routing for SVG/AI from open/import UI)
4. Updated open/import input change handlers to use shared handler and return SVG/AI-specific messages.
5. Updated drag-and-drop support:
   - broadened detection from image-only to image/SVG/AI
   - AI and SVG are imported via vector flow; image flow remains unchanged.

## Compatibility Notes
- Existing SVG import path is preserved and reused (still uses `loadSvgText` for open, `importSvgTextFitted` for import).
- Existing image drag/drop behavior is preserved.
- Existing undo/redo integration for SVG import remains through existing `importSvgTextFitted` push-history behavior.
- Non-compatible AI now fails gracefully with clear message and error capture (`captureError("import-ai-file", ...)`).

## Risks / Unknowns
- AI conversion depends on runtime availability/behavior of `pdfjs-dist` SVG renderer (`SVGGraphics`) and external CDN access.
- Some AI files may contain constructs that do not fully map to clean SVG.
- Browser/device differences may affect PDF.js conversion reliability/performance on very large files.

## Suggested Tests
1. Open/import valid `.svg` file (regression check).
2. Import PNG/JPG via drag-drop (regression check).
3. Open/import AI file saved with PDF compatibility enabled (expected success).
4. Open/import AI file without PDF compatibility (expected graceful failure message, no crash).
5. Drop mixed files (image + svg + ai) and confirm app remains stable.
