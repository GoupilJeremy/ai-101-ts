Status: done

# Story 7.3: Implement Drag-and-Drop Alerts to TODO List

**Epic:** 7 - User Interactions & Commands  
**Story ID:** 7.3  
**Created:** 2026-01-17  

## Story

**As a** developer,  
**I want** to drag critical alerts to my TODO list for later action,  
**So that** I don't lose track of important issues while maintaining flow.

## Acceptance Criteria

- [x] **Given** Alert system with code-anchored alerts exists from Epic 4
- [x] **When** I drag a critical or warning alert
- [x] **Then** Alert becomes draggable with visual drag affordance (cursor change, opacity)
- [x] **And** Drag target overlays appear: TODO list area, dismiss area
- [x] **And** Dropping on TODO list creates automatic TODO entry with alert details
- [x] **And** TODO entry includes: alert message, code location (file:line), timestamp, severity
- [x] **And** TODO entry clickable to jump back to code location
- [x] **And** Dropping on dismiss area removes alert from view
- [x] **And** Drag animation smooth with 60fps performance (GPU-accelerated)
- [x] **And** Drag operation works with mouse and trackpad
- [x] **And** Keyboard alternative: press 'T' to send focused alert to TODO
- [x] **And** TODO list integrates with VSCode TODO extensions if available (via code comments)
- [x] **And** Unit tests verify drag-and-drop mechanics and TODO creation

## Tasks / Subtasks

- [x] **Task 1: Webview: Drop Zone UI**
  - [x] Create `src/webview/components/drop-zone-manager.js`
  - [x] Implement "Add to TODO" zone (bottom-right or side)
  - [x] Implement "Dismiss" zone (bottom-center trash icon)
  - [x] Styles: Hidden by default, fade in on global drag start (using `index.css`)
- [x] **Task 2: Webview: Draggable Alerts**
  - [x] Update `src/webview/components/alert-component.js`
  - [x] Bind drag events (`dragstart`, `dragend`, etc.)
  - [x] Visual feedback (opacity reduction on source, `transform: scale(0.95)`)
- [x] **Task 3: Extension: Message Handling**
  - [x] Update `src/webview/webview-provider.ts` to listen for new messages
  - [x] Listen for `toExtension:createTodo`
  - [x] Listen for `toExtension:dismissAlert`
- [x] **Task 4: Extension: TODO Creation Logic**
  - [x] Implement `createTodoFromAlert` in `src/commands/alert-commands.ts`
  - [x] Use `vscode.WorkspaceEdit` to insert `// TODO: [AI-Review] {alert.message} ({alert.severity})`
  - [x] Ensure insertion is at the correct line above the alert's anchor
- [x] **Task 5: Extension: Dismiss Logic**
  - [x] Update `ExtensionStateManager.removeAlert(alertId)`
  - [x] Sync state to webview to remove the alert component
- [x] **Task 6: Keyboard & Shortcuts**
  - [x] Map 'T' key on focused alert component to trigger `createTodo`
  - [x] Map 'Delete'/'Backspace' to trigger `dismissAlert`
- [x] **Task 7: Testing**
  - [x] Create unit tests for TODO insertion logic
  - [x] Verify message passing between webview and extension

## Dev Notes

### Technical Requirements
- **Tech Stack:** Vanilla JS (Webview), TypeScript (Extension).
- **Communication:** `postMessage` for syncing drag events/actions.
- **Drag & Drop API:** Use native HTML5 Drag and Drop API.
- **TODO Integrations:** Standard formatted comment `// TODO: [Severity] Message`.
- **GPU Acceleration:** Use `transform: translate3d` and `opacity` for animations.

### Architecture Compliance
- **Webview UI:** Use `AgentComponent` / `AlertComponent` pattern.
- **State Management:** `ExtensionStateManager` is source of truth.
- **Security:** Ensure inserted comments are safe for TypeScript files.

## Dev Agent Record

### Agent Model Used
Antigravity (Gemini 2.0 Flash Thinking)

### Debug Log References
- (None yet)

### Completion Notes List
- 2026-01-17: Implemented all components and logic. Verified with unit tests.

## File List
- `src/webview/components/drop-zone-manager.js`
- `src/webview/components/alert-component.js`
- `src/webview/index.css`
- `src/webview/main.ts`
- `src/webview/webview-provider.ts`
- `src/commands/alert-commands.ts`
- `src/state/extension-state-manager.ts`
- `src/test/alert.test.ts`
- `src/webview/components/__tests__/drop-zone-manager.test.ts`
- `src/extension.ts`
- `package.json`

## Change Log
- 2026-01-17: Initial story file creation.
- 2026-01-17: Implemented drag-and-drop alerts to TODO list.
- 2026-01-17: Integrated AlertComponent and DropZoneManager.
- 2026-01-17: Added unit tests for webview and extension logic.
