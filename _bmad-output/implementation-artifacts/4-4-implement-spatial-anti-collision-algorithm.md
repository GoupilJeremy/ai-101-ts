# Story 4.4: Implement Spatial Anti-Collision Algorithm

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the HUD to automatically move away from my cursor and active editing areas,
so that AI visualizations never obstruct my code writing flow.

## Acceptance Criteria

1.  **Given** Webview overlay with Vital Signs Bar is implemented
2.  **When** I implement cursor tracking in the backend and collision logic in the frontend
3.  **Then** Backend tracks cursor position via `onDidChangeTextEditorSelection`
4.  **And** Extension sends cursor updates (line, character, and viewport info) to Webview
5.  **And** Webview algorithm defines exclusion zones: cursor proximity
6.  **And** Agent HUD elements reposition automatically when entering exclusion zone
7.  **And** Repositioning animation is smooth (300ms)
8.  **And** Typing activity triggers immediate collision check
9.  **And** Unit tests verify collision detection and safe position calculation

## Tasks / Subtasks

- [x] Task 1: Backend Tracking (AC: 3, 4, 8)
  - [x] 1.1: Add selection listener in `SpatialManager`
  - [x] 1.2: Send `toWebview:cursorUpdate` messages with line/char data

- [x] Task 2: Frontend Algorithm (AC: 5, 6, 7)
  - [x] 2.1: Implement `CollisionSystem` in `src/webview/main.ts`
  - [x] 2.2: Map line numbers to vertical percentages (rough estimation for now)
  - [x] 2.3: Animate agent repositioning using CSS transforms

- [x] Task 3: Performance & Verification (AC: 9)
  - [x] 3.1: Ensure checks are throttled but responsive
  - [x] 3.2: Verify anti-collision behavior with manual cursor movement

## Dev Notes

- **Positioning Estimate**: Since we don't have exact pixels, we use the active line number relative to total lines/visible range to estimate 'Y' position.
- **Exclusion Zone**: Typically ±3 lines from the cursor.

### Project Structure Notes

- New file: `src/ui/spatial-manager.ts`
- Modified file: `src/webview/main.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.4]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
