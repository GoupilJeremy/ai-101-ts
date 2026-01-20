# Story 7.4: Implement Contextual Hover Tooltips on Agents

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** developer,
**I want** hover tooltips on agents explaining their current activity,
**So that** I understand what each agent is doing at a glance.

## Acceptance Criteria

1. **Given** All agents are visible in HUD
2. **When** I hover over an agent icon
3. **Then** Tooltip appears within 500ms of hover start
4. **And** Tooltip shows: agent name, current state, current task description
5. **And** Tooltip explains why agent was activated for this specific context
6. **And** Tooltip includes last update timestamp
7. **And** Tooltip shows estimated completion time for long-running tasks
8. **And** Tooltip styled with sumi-e aesthetic consistency
9. **And** Tooltip positioned to avoid covering agent or code (anti-collision)
10. **And** Tooltip dismisses on mouse leave after 200ms delay
11. **And** Keyboard users can trigger tooltip with Shift+F10 or context menu key
12. **And** Screen readers announce tooltip content via ARIA (NFR10)
13. **And** Unit tests verify tooltip content generation and positioning

## Tasks / Subtasks

- [x] **Task 1: Webview: Tooltip Manager Component**
  - [x] Create `src/webview/components/tooltip-manager.js`
  - [x] Implement Singleton pattern for TooltipManager (only one tooltip at a time)
  - [x] Implement `show(targetElement, content)` and `hide()` methods
  - [x] Implement delay logic: 500ms delay before showing, 200ms delay before hiding
  - [x] Handle hover events (`mouseenter`, `mouseleave`) on target elements globally or via delegation
- [x] **Task 2: Webview: Tooltip Rendering & Styling**
  - [x] Implement DOM creation for tooltip element with sumi-e styling (minimalist, high contrast border)
  - [x] Add to `src/webview/index.css`: `.tooltip` class with appropriate z-index and typography
  - [x] Ensure tooltip supports rich HTML content (for formatting Name, State, Task separately)
  - [x] Add ARIA attributes: `role="tooltip"`, `id` referenced by `aria-describedby` on target
- [x] **Task 3: Visual System: Smart Positioning**
  - [x] Implement positioning logic in `TooltipManager`
  - [x] Calculate position relative to target (Code anchoring)
  - [x] Implement collision detection with viewport edges (flip up/down/left/right if needed)
  - [x] Ensure tooltip never obscures the agent icon itself
- [x] **Task 4: Integration: Agent Components**
  - [x] Update `src/webview/components/agent-component.js`
  - [x] Bind `mouseenter`/`mouseleave` to trigger `TooltipManager`
  - [x] Generate tooltip content from current component state:
    - Agent Name (e.g., "Architect Agent")
    - State (e.g., "Thinking")
    - Current Task (from state)
    - "Why Active" (if available in state)
    - Last Update (formatted relative time)
  - [x] Bind keyboard events (`keydown`) for Shift+F10 support
- [x] **Task 5: State Extension (Optional)**
  - [x] Verify `IAgentState` in `src/webview/state/state-manager.js` has all necessary fields
  - [x] If "Why Active" or "Estimated Time" is missing, update `ExtensionStateManager` to include them
- [x] **Task 6: Accessibility Verification**
  - [x] Ensure `aria-live="polite"` is used for screen reader announcements if needed
  - [x] Verify keyboard navigation (Tab to agent -> Shift+F10 -> Tooltip reads)
- [x] **Task 7: Testing**
  - [x] Create `src/webview/components/__tests__/tooltip-manager.test.ts` (or .js test)
  - [x] Test delay timers (mock `setTimeout`)
  - [x] Test positioning logic boundaries

## Dev Notes

### Technical Requirements
- **Tech Stack:** Vanilla JavaScript (ES6 Classes) for Webview.
- **Performance:** `requestAnimationFrame` for any animations (fade in/out).
- **CSS:** Use BEM (`.tooltip`, `.tooltip--visible`, `.tooltip__header`).
- **Timers:** Clean up timeouts on destruction or state change to prevent memory leaks.
- **Positioning:** Use `getBoundingClientRect()` for accurate positioning relative to viewport.

### Architecture Compliance
- **Component Pattern:** `TooltipManager` should be a standalone class, possibly instantiated by `main.js`.
- **State:** Read from `StateManager` mirrors; do not fetch async data during hover (data must be ready).
- **No External Libraries:** Build tooltip logic from scratch (standard for this project).

### Project Structure Notes
- New file: `src/webview/components/tooltip-manager.js`
- Styles: Add to `src/webview/index.css` or new `src/webview/styles/components/tooltip.css` if preferred (keep simple in index.css for now is fine).

### References
- [Epic 7 Details](_bmad-output/planning-artifacts/epics.md#epic-7-user-interactions--commands)
- [Project Context: Webview Patterns](_bmad-output/project-context.md#webview-organization)

## Dev Agent Record

### Agent Model Used
Antigravity (Gemini 2.0 Flash Thinking)

### Debug Log References
- (None)

### Completion Notes List
- ✅ Created TooltipManager singleton component with 500ms show delay and 200ms hide delay
- ✅ Implemented smart positioning with viewport collision detection
- ✅ Added Sumi-e aesthetic styling to tooltip with BEM CSS classes
- ✅ Created AgentComponent class to manage agent rendering and tooltip integration
- ✅ Extended IAgentState interface with activationReason and estimatedCompletion fields
- ✅ Updated ExtensionStateManager to support new tooltip-related state fields
- ✅ Integrated TooltipManager and AgentComponent into main.ts
- ✅ Added keyboard support for Shift+F10 to trigger tooltips
- ✅ Implemented ARIA attributes for screen reader accessibility
- ✅ Created comprehensive unit tests for TooltipManager (delay timers, positioning, singleton pattern)

### File List
- `src/webview/components/tooltip-manager.js`
- `src/webview/components/agent-component.js`
- `src/webview/index.css`
- `src/webview/main.ts` (to initialize manager)
- `src/webview/state/state-manager.js`
- `src/webview/components/__tests__/tooltip-manager.test.ts`
