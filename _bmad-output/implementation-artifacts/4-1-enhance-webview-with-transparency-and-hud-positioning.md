# Story 4.1: Enhance Webview with Transparency and HUD Positioning

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the webview scaffold enhanced with transparency, overlay positioning, and HUD-specific features,
so that the HUD displays over code without blocking editor interactions.

## Acceptance Criteria

1.  **Given** Webview scaffold exists (view-type: ai101.webview)
2.  **When** I create `src/ui/webview-manager.ts` and update `src/webview/main.ts`
3.  **Then** WebviewManager configures `retainContextWhenHidden: true` to preserve state
4.  **And** Webview panel has transparent background via CSS and configuration
5.  **And** Webview positioning is set to HUD-compatible mode (Side or Overlay)
6.  **And** Webview receives state updates via `postMessage` from ExtensionStateManager
7.  **And** Frontend container structure in `src/webview/index.html` is ready for HUD elements
8.  **And** Base CSS in `src/webview/index.css` implements transparency (opacity 5%-40%)
9.  **And** Unit tests verify postMessage connection and transparency configuration

## Tasks / Subtasks

- [x] Task 1: Webview Manager (AC: 2, 3, 5)
  - [x] 1.1: Create `src/ui/webview-manager.ts` to coordinate webview lifecycle
  - [x] 1.2: Set `retainContextWhenHidden: true`
  - [x] 1.3: Update `extension.ts` to use `WebviewManager`

- [x] Task 2: Transparency & Structure (AC: 4, 7, 8)
  - [x] 2.1: Add `src/webview/index.css` with transparent HUD styles
  - [x] 2.2: Update `src/webview/index.html` with HUD layout containers
  - [x] 2.3: Configure `enableCommandUris` and `localResourceRoots` safely

- [x] Task 3: Signal Verification (AC: 6, 9)
  - [x] 3.1: Verify `PostMessage` flow from `ExtensionStateManager` to Webview
  - [x] 3.2: Create unit tests for positioning and message passing

## Dev Notes

- **Transparency**: VSCode webviews can have transparent backgrounds if `WebviewOptions.enableScripts` is true and the CSS `background-color` is set to `transparent`.
- **HUD Layout**: Create a container for the Vital Signs Bar and for Agent Icons.
- **Pointer Events**: Use `pointer-events: none` on the main container but `pointer-events: auto` on buttons/widgets.

### Project Structure Notes

- New file: `src/ui/webview-manager.ts`
- New file: `src/webview/index.css`
- Modified file: `src/webview/index.html`
- Modified file: `src/extension.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
