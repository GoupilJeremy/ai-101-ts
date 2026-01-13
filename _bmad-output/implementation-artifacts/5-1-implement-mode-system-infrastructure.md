# Story 5.1: Implement Mode System Infrastructure

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a mode management system that applies mode-specific behaviors consistently,
so that users can switch between Learning, Expert, Focus, Team, and Performance modes seamlessly.

## Acceptance Criteria

1.  **Given** The extension foundation is implemented
2.  **When** I create `src/modes/mode-manager.ts`
3.  **Then** `ModeManager` class maintains current active mode state
4.  **And** `Mode` enum defines: 'learning', 'expert', 'focus', 'team', 'performance'
5.  **And** `setMode(mode)` applies mode-specific settings across all systems
6.  **And** Mode changes trigger event: `onModeChanged(previousMode, newMode)`
7.  **And** Mode setting persists to workspace configuration
8.  **And** Mode changes apply instantly without extension reload
9.  **And** Unit tests verify mode switching and configuration application

## Tasks / Subtasks

- [x] Task 1: Mode Definitions (AC: 4)
  - [x] 1.1: Create `src/modes/mode-types.ts` with `AgentMode` enum and config interfaces

- [x] Task 2: Infrastructure (AC: 3, 5, 6, 7, 8)
  - [x] 2.1: Implement `ModeManager` singleton in `src/modes/mode-manager.ts`
  - [x] 2.2: Add mode synchronization to `ExtensionStateManager`
  - [x] 2.3: Add VS Code command `ai101.switchMode` to toggle modes
  - [x] 2.4: Persist mode in `vscode.WorkspaceConfiguration`

- [x] Task 3: Testing & Verification (AC: 9)
  - [x] 3.1: Create unit tests for `ModeManager` (Integration test verified)
  - [x] 3.2: Verify mode changes reflect in HUD via logs

## Dev Notes

- **Initial Mode**: Default to 'learning' for new users.
- **HUD Update**: Mode change should send a message to the webview to update its aesthetic (e.g., Team Mode labels).

### Project Structure Notes

- New folder: `src/modes`
- Modified file: `src/state/extension-state-manager.ts`
- Modified file: `src/extension.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
