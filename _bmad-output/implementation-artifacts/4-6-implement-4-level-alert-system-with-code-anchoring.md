# Story 4.6: Implement 4-Level Alert System with Code Anchoring

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want proactive alerts (info, warning, critical, urgent) anchored to code lines,
so that I see risks and recommendations in context with visual severity indicators.

## Acceptance Criteria

1.  **Given** Agent positioning system is implemented
2.  **When** I implement the Alert system in the backend and webview
3.  **Then** Alert system supports 4 severity levels: `info`, `warning`, `critical`, `urgent`
4.  **And** Alerts are stored in `ExtensionStateManager` and synchronized to Webview
5.  **And** Each alert has a target `anchorLine` for spatial positioning
6.  **And** Alerts appear as small ideogram icons in the HUD or editor margin (simulated in HUD)
7.  **And** Hovering an alert in the HUD shows the full diagnostic message
8.  **And** Visual style (color, intensity) matches severity (e.g., Urgent = Vermillon)
9.  **And** Unit tests verify alert generation and severity-based rendering

## Tasks / Subtasks

- [x] Task 1: Alert Backend (AC: 3, 4, 5)
  - [x] 1.1: Define `IAlert` interface and levels in `agent.interface.ts`
  - [x] 1.2: Add alert collection and sync to `ExtensionStateManager`
  - [x] 1.3: Update `ReviewerAgent` to generate `IAlert` objects

- [x] Task 2: Alert HUD (AC: 6, 7, 8)
  - [x] 2.1: Implement `AlertComponent` and `renderAlert` in `src/webview/main.ts`
  - [x] 2.2: Add specific Sumi-e styles for alert levels in `src/webview/sumi-e.css`

- [x] Task 3: Integration (AC: 9)
  - [x] 3.1: Verify alert positioning and tooltip display
  - [x] 3.2: Create unit tests for `ReviewerAgent` alert generation

## Dev Notes

- **Urgent Alert**: Should probably have a "brush bleed" effect or more intense animation.
- **Tooltips**: Use simple title attributes or a custom CSS-based tooltip for minimalism.

### Project Structure Notes

- Modified file: `src/agents/shared/agent.interface.ts`
- Modified file: `src/state/extension-state-manager.ts`
- Modified file: `src/webview/main.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.6]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
