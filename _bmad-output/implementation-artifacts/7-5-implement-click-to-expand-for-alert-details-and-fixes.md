# Story 7.5: Implement Click-to-Expand for Alert Details and Fixes

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** developer,
**I want** to click code-anchored alerts to see full details and proposed fixes,
**So that** I can understand and resolve issues without leaving my editor.

## Acceptance Criteria

1. **Given** Code-anchored alert system exists from Epic 4 (and Story 7.3)
2. **When** I click an alert icon in editor gutter (or HUD overlay)
3. **Then** Alert expands inline showing full explanation panel
4. **And** Panel includes: severity indicator, message, detailed reasoning, affected code snippet
5. **And** Panel shows proposed fix(es) with before/after code diff
6. **And** "Apply Fix" button applies suggested fix with undo support
7. **And** "Explain More" button requests deeper explanation from Reviewer Agent
8. **And** Panel dismisses on: click outside, Escape key, or explicit close button
9. **And** Multiple alerts on same line show selection menu first
10. **And** Panel positioning respects anti-collision rules (doesn't cover code)
11. **And** Panel animations smooth and performant (GPU-accelerated, 60fps)
12. **And** Keyboard navigation: Tab through panel elements, Enter to apply fix
13. **And** Unit tests verify panel expansion, fix application, and interaction handling

## Tasks / Subtasks

- [x] **Task 1: Webview: AlertDetailPanel Component**
    - [x] Create `src/webview/components/alert-detail-panel.js`
    - [x] Implement `show(alertData, targetElement)` and `hide()` methods
    - [x] Render panel content: Severity Icon, Message, Code Diff (simplified view), Reasoning, Buttons
    - [x] Implement event listeners for "Apply Fix" and "Explain More" buttons
    - [x] Implement "Close" button and click-outside dismissal
- [x] **Task 2: Webview: Alert Component Updates**
    - [x] Update `src/webview/components/alert-component.js` (from Story 7.3)
    - [x] Add `click` event listener to toggle `AlertDetailPanel`
    - [x] Handle keyboard activation (Enter/Space) when alert is focused
    - [x] Ensure `alertData` typically contains `fix` and `reasoning` fields (verify mock/real data mapping)
- [x] **Task 3: Visual System: Panel Styling & Animation**
    - [x] Add to `src/webview/index.css`: `.alert-panel`, `.alert-panel__header`, `.alert-panel__diff`, `.alert-panel__actions`
    - [x] Apply Sumi-e aesthetic: Minimalist, clear typography, ink-like borders for panel
    - [x] Implement GPU-accelerated enter/exit animations (`will-change: transform, opacity`)
    - [x] Ensure distinct styles for severity levels (Info, Warning, Critical, Urgent)
- [x] **Task 4: Integration: PostMessage Actions**
    - [x] In `AlertDetailPanel`, sending `applyFix` message to extension with `alertId`
    - [x] In `AlertDetailPanel`, sending `explainAlert` message to extension with `alertId`
    - [x] Update `src/webview/main.ts` to forward these messages if necessary (or handle in `AlertManager`?)
- [x] **Task 5: Extension: Message Handling**
    - [x] Update `ExtensionStateManager` or `CommandController` to handle `applyFix`:
        - Apply `WorkspaceEdit` provided by the alert fix
    - [x] Update to handle `explainAlert`:
        - Trigger `ReviewerAgent` to generate more detailed explanation (if not already cached)
        - Send back `alertExplanation` update to Webview
- [x] **Task 6: Visual System: Smart Positioning**
    - [x] Implement positioning logic: Place panel near the alert icon but ensure it doesn't clip offscreen
    - [x] Use `TooltipManager` logic as reference or reuse if applicable (Panel is larger, might need `auto-placement` library logic or custom bounds check)
- [x] **Task 7: Accessibility & Keyboard Nav**
    - [x] Ensure `AlertDetailPanel` traps focus when open (or manages focus logically)
    - [x] Tab cycle within panel buttons
    - [x] Esc key closes panel and returns focus to Alert Icon
    - [x] ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [x] **Task 8: Testing**
    - [x] Create `src/webview/components/__tests__/alert-detail-panel.test.ts`
    - [x] Test render logic, event emissions, and close behaviors

## Dev Notes

### Technical Requirements
- **Tech Stack:** Vanilla JavaScript (ES6 Classes) for Webview Components.
- **Styling:** CSS Variables for theming. Use `transform: translate3d` for performance.
- **Diff View:** For the "before/after" code diff, use a simple visual representation (e.g., Red strikethrough for removal, Green text for addition) since a full Monaco Diff Editor inside the webview might be too heavy. Keep it lightweight using simple HTML/CSS.
- **State:** `AlertData` should be passed into `show()`. Do not fetch data asynchronously during render if possible; rely on passed state.

### Architecture Compliance
- **Component Pattern:** Continue using the `Component` class pattern established in Story 7.4/7.3.
- **Separation of Concerns:** `AlertDetailPanel` handles UI; `main.js` or `AlertManager` handles orchestration and message passing.
- **Performance:** Ensure the panel opening doesn't cause layout thrashing.

### Previous Story Intelligence (Story 7.4)
- **TooltipManager:** We successfully implemented a singleton `TooltipManager`. `AlertDetailPanel` should likely also be a Singleton (only one detail panel open at a time) to avoid clutter.
- **Positioning:** The anti-collision logic from `TooltipManager` can be adapted for the larger `AlertDetailPanel`.

### Project Structure Notes
- New file: `src/webview/components/alert-detail-panel.js`
- Tests: `src/webview/components/__tests__/alert-detail-panel.test.ts`
- CSS: Update `src/webview/index.css`

### References
- [Epic 7 Details](_bmad-output/planning-artifacts/epics.md#epic-7-user-interactions--commands)
- [Architecture: Visual System](_bmad-output/planning-artifacts/architecture.md#4-transparent-hud--visual-system-critique-1)

## Dev Agent Record

### Agent Model Used
Antigravity (Gemini 2.0 Flash Thinking)

### Debug Log References
- (None)

### Completion Notes List
- ✅ Created AlertDetailPanel component as singleton following TooltipManager pattern
- ✅ Implemented comprehensive panel rendering with severity indicators, message, reasoning, code diffs, and action buttons
- ✅ Added GPU-accelerated animations using transform: translate3d() for 60fps performance
- ✅ Implemented smart positioning logic adapted from TooltipManager with anti-collision and viewport boundary respect
- ✅ Added full accessibility support: ARIA attributes (role="dialog", aria-modal="true", aria-labelledby), focus trap, keyboard navigation
- ✅ Integrated click and keyboard (Enter/Space) event listeners in AlertComponent to toggle panel
- ✅ Implemented postMessage communication for applyFix and explainAlert actions
- ✅ Added backend message handlers in webview-provider.ts for applying fixes via WorkspaceEdit and generating explanations
- ✅ Created comprehensive test suite with 30+ test cases covering singleton pattern, rendering, events, accessibility, and positioning
- ✅ Applied Sumi-e aesthetic with minimalist design, clear typography, and ink-like borders
- ✅ Implemented click-outside and Escape key dismissal with proper focus management
- ✅ Added severity-specific styling for Info, Warning, Critical, and Urgent alerts
- ✅ Code diff display uses simple visual representation (red strikethrough for removal, green for addition) to keep it lightweight

### File List
- `src/webview/components/alert-detail-panel.js` (NEW - 360 lines)
- `src/webview/components/alert-component.js` (MODIFIED - added click and keyboard event listeners)
- `src/webview/index.css` (MODIFIED - added 307 lines of AlertDetailPanel styling)
- `src/webview/main.ts` (MODIFIED - imported AlertDetailPanel, initialized singleton, added onAlertClick handler)
- `src/webview/webview-provider.ts` (MODIFIED - added handleApplyFix and handleExplainAlert methods)
- `src/webview/components/__tests__/alert-detail-panel.test.ts` (NEW - 329 lines, 30+ test cases)
