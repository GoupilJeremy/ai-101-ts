# Story 1.2: Configure Dual-Build System and Create Webview Scaffold

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want separate build configurations for the Node.js extension and Browser webview with a minimal webview scaffold,
So that each context uses optimal bundling settings and Epic 4 can start visual development immediately.

## Acceptance Criteria

1.  **Given** The Yeoman-generated project structure exists
2.  **When** I create `esbuild.js` with dual-build configuration (replacing the default one)
3.  **Then** Build 1 targets `src/extension.ts` → `dist/extension.js` (CommonJS for Node.js, platform: node)
4.  **And** Build 2 targets `src/webview/main.ts` → `dist/webview.js` (IIFE for Browser, platform: browser)
5.  **And** Development builds complete in <1 second
6.  **And** Watch mode (`npm run watch`) incremental builds complete in <200ms
7.  **And** Production builds with minification complete in <3 seconds
8.  **And** Source maps are included in development builds
9.  **And** Source maps are excluded from production builds
10. **And** Both bundles are compatible with their respective runtimes (no Node APIs in webview, no DOM in extension)
11. **And** Minimal webview scaffold created: `src/webview/main.ts` (entry point)
12. **And** Basic HTML template created: `src/webview/index.html` with CSP configuration
13. **And** WebviewProvider created in extension to serve the HTML
14. **And** Webview scaffold allows Epic 4 visual development to start in parallel

## Tasks / Subtasks

- [x] Task 1: Configure Dual-Build with esbuild (AC: 1-10)
  - [x] 1.1: Install `npm-run-all` as devDependency (already installed in previous step manual, verify)
  - [x] 1.2: Create/Update `esbuild.js` to support two separate build contexts (extension and webview)
  - [x] 1.3: Configure extension build (entry: `src/extension.ts`, outfile: `dist/extension.js`, format: cjs, platform: node)
  - [x] 1.4: Configure webview build (entry: `src/webview/main.ts`, outfile: `dist/webview.js`, format: iife, platform: browser)
  - [x] 1.5: Configure production mode (minify: true, sourcemap: false) vs development mode (minify: false, sourcemap: true)
  - [x] 1.6: Update `package.json` scripts to run both builds (compile, watch, package)

- [x] Task 2: Create Webview Scaffold (AC: 11-13)
  - [x] 2.1: Create directory `src/webview`
  - [x] 2.2: Create `src/webview/main.ts` (Simple entry point `console.log('Webview loaded')`)
  - [x] 2.3: Create `src/webview/index.html` with strict CSP (script-src 'nonce-...' or specific sources)
  - [x] 2.4: Create `src/webview/webview-provider.ts` in extension to create panel and serve `index.html`

- [x] Task 3: Verify Build Performance and Separation (AC: 5-7, 10, 14)
  - [x] 3.1: Run `npm run compile` - measure time (<1s)
  - [x] 3.2: Check `dist/extension.js` (should look like CJS) and `dist/webview.js` (should look like IIFE/browser code)
  - [x] 3.3: Run `npm run watch` and verify incremental builds work for both
  - [x] 3.4: Verify no Node.js built-ins (fs, path) are bundled into webview (should error or mock if tried)

## Dev Notes

### Architecture Patterns & Constraints
- **Dual-Build Pattern**: STRICT separation of concerns. Extension runs in Node (process), Webview runs in Browser (window). They DO NOT share code directly (except pure interfaces/types).
- **esbuild**: Must use `esbuild` programmatic API. Do not use CLI unless necessary for simplicity, but programmatic gives more control over plugins/watch mode.
- **CSP**: Content Security Policy in `index.html` must be strict. Allow scripts only from the extension directory (handled by VSCode resource URIs).
- **Project Structure**:
  - `src/extension.ts` (Extension Host)
  - `src/webview/` (Webview Host)
  - `dist/` (Output)

### Source Tree Components
- `esbuild.js` (Update)
- `package.json` (Scripts)
- `src/webview/` (New directory)
- `src/webview/webview-provider.ts` (New file)

### Testing Standards
- Verify builds succeed.
- Verify files exist in `dist/`.
- No unit tests for build scripts needed, but integration test (manual verify) is crucial.

### Project Structure Notes
- Standard VSCode extension layout.
- `src/webview` is the designated space for frontend code (Epic 4).

### References
- [Source: architecture.md#Decision #6: Build System] - esbuild dual-bundle strategy
- [Source: project-context.md#VSCode Extension Specific Rules] - Extension Context vs Webview Context
- [VSCode WebView Guide](https://code.visualstudio.com/api/extension-guides/webview)

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

- Build passed (<1s).
- Index.html copy verified.

### Completion Notes List

- Configured Dual-Build using esbuild (extension: CJS/Node, webview: IIFE/Browser).
- Created `esbuild.js` with `copy-html` plugin to ensure `index.html` reaches `dist/`.
- Updated `tsconfig.json` to include "DOM" lib for webview development.
- Created Webview Scaffold: `main.ts`, `index.html`, and `webview-provider.ts`.
- Registered `AI101WebviewProvider` in `extension.ts`.
- Validated performance requirements.

### File List

- esbuild.js
- package.json
- tsconfig.json
- src/webview/main.ts
- src/webview/index.html
- src/webview/webview-provider.ts
- src/extension.ts
