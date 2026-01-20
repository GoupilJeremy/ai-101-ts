# Build System

## Overview

Suika uses a dual-build system with esbuild for both extension and webview bundles.

## npm Scripts

### Development

```bash
npm run compile        # Build extension + webview
npm run watch          # Watch mode (auto-rebuild)
```

### Production

```bash
npm run package        # Create .vsix package
```

### Cleaning

```bash
npm run clean          # Remove build artifacts
```

## Build Configuration

### Extension Build

**Input**: `src/extension.ts`  
**Output**: `out/extension.js`  
**Target**: Node.js (CommonJS)

### Webview Build

**Input**: `src/webview/main.js`  
**Output**: `out/webview.js`  
**Target**: Browser (ES2020)

## Watch Mode

For development, use watch mode:

```bash
npm run watch
```

This rebuilds automatically on file changes.

## Build Performance

- **Initial build**: ~500ms
- **Incremental rebuild**: ~50ms
- **Production build**: ~1s (with minification)

## Troubleshooting

### Build Fails

```bash
npm run clean
npm install
npm run compile
```

### Out of Memory

Increase Node.js memory:

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run compile
```

## Related Documentation

- [Development Setup](../contributing/setup.md)
- [Debugging](./debug.md)
- [ADR-003: esbuild Bundler](../adr/003-esbuild-bundler.md)
