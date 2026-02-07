# Story 6.8: Implement Decision and Reasoning History Timeline

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to view a searchable timeline of past AI decisions, suggestions, and their underlying reasoning,
so that I can understand the evolution of the codebase and recall why specific technical approaches were chosen.

## Acceptance Criteria

1. **Given** the AI has generated suggestions (Architect, Coder, Reviewer)
   **When** a suggestion is presented or acted upon (Accepted/Rejected)
   **Then** a new record is added to the History Timeline.

2. **And** the Timeline is accessible in the HUD (e.g., via a history panel or toggle)
   **Then** it displays a chronological list of recent decisions.

3. **And** each timeline entry displays summary information:
   - Timestamp (e.g., "10:42 AM")
   - Primary Agent (e.g., "Coder")
   - Type/Action (e.g., "Feature Implementation", "Refactoring")
   - Status (Pending, Accepted, Rejected)

4. **And** clicking a timeline entry expands it to show detailed reasoning:
   - Full Reasoning chain (Architect analysis, Coder approach, Reviewer validation)
   - Files affected/context used
   - The specific code suggestion (if applicable)

5. **And** the history persists for the duration of the VSCode session (in-memory state).
   *(Note: Permanent persistence across restarts is a future enhancement)*

6. **And** the UI follows the Project's Sumi-e aesthetic (minimalist, unobtrusive).

7. **And** new history entries trigger a subtle visual indicator if the timeline view is closed.

8. **And** Unit tests verify that `ExtensionStateManager` correctly stores and retrieves history records.

## Tasks / Subtasks

- [x] 1. Define History Data Structures
    - [x] 1.1 Create `IHistoryInterface` (or `IDecisionRecord`) in `src/state/history.interface.ts`.
        - Fields: `id`, `timestamp`, `type` (suggestion, alert, etc.), `summary`, `agent`, `status` (pending, accepted, rejected), `details` (reasoning, code, context).
    - [x] 1.2 Export interfaces in `src/state/index.ts`.

- [x] 2. Update Extension State Management
    - [x] 2.1 Update `ExtensionStateManager` to include `private history: IDecisionRecord[]`.
    - [x] 2.2 Implement `addHistoryEntry(entry: IDecisionRecord): void`.
    - [x] 2.3 Implement `getHistory(): IDecisionRecord[]`.
    - [x] 2.4 Implement `updateHistoryEntryStatus(id: string, status: 'accepted' | 'rejected'): void`.
    - [x] 2.5 Ensure state updates trigger `toWebview:historyUpdate` message.

- [x] 3. Integrate with Agent Orchestrator
    - [x] 3.1 Modify `AgentOrchestrator.synthesizeResponse` (or equivalent final step) to create a history record.
    - [x] 3.2 Ensure the record captures reasoning from Architect, Coder, and Reviewer.
    - [x] 3.3 Call `stateManager.addHistoryEntry()` with the new record.

- [x] 4. Implement Webview Timeline Component
    - [x] 4.1 Create `src/webview/components/timeline-component.js` (Vanilla JS class).
    - [x] 4.2 Implement `render()` method to display list of entries.
    - [x] 4.3 Implement `renderEntry()` for individual items with expand/collapse logic.
    - [x] 4.4 Handle `toWebview:historyUpdate` events in `src/webview/state/state-manager.js` and update the component.

- [x] 5. Implement Functionality & Interactions
    - [x] 5.1 Add UI control (button/hotkey) to toggle Timeline visibility.
    - [x] 5.2 Implement click handlers for expanding/collapsing details.
    - [x] 5.3 (Optional for this story, but good context) Prepare for "Accept/Reject" actions to update history status (if not already handled by another story).

- [x] 6. Styling (Sumi-e Aesthetic)
    - [x] 6.1 Create `src/webview/styles/components/timeline.css`.
    - [x] 6.2 Style entries with Sumi-e principles (minimal borders, negative space).
    - [x] 6.3 Use appropriate icons/colors for agents and status.

- [x] 7. Testing
    - [x] 7.1 Unit test `ExtensionStateManager` history methods.
    - [x] 7.2 Verify `AgentOrchestrator` adds records correctly via integration test or mock.

## Dev Notes

### Architecture Patterns

- **Dual State Pattern:** The backend (`ExtensionStateManager`) is the definitive source of truth for the history. The Webview receives updates (`toWebview:historyUpdate`) and re-renders the list. Do not manage 'master' history state in the Webview.
- **Component Pattern:** Follow the existing Vanilla JS component pattern for `TimelineComponent`. It should be a class with a `render` method and manage its own DOM event listeners.

### Project Structure Notes

- **New Files:**
    - `src/state/history.interface.ts`
    - `src/webview/components/timeline-component.js`
    - `src/webview/styles/components/timeline.css`
- **Modified Files:**
    - `src/state/extension-state-manager.ts`
    - `src/agents/agent-orchestrator.ts`
    - `src/webview/main.js` (to instantiate TimelineComponent)
    - `src/webview/state/state-manager.js`

### References

- **PRD FR40:** "Users can see the history of decisions and reasoning for future reference"
- **UX Spec:** "Timeline/history view with decision reasoning 'learning trail'"
- **Architecture.md:** State Management section (Dual State Pattern)

## Dev Agent Record

### Agent Model Used

Antigravity 1.0

### Debug Log References
- Initialized History Timeline implementation.
- Defined `IDecisionRecord` interface and state management logic.
- Integrated history recording into `AgentOrchestrator`.
- Created and styled `TimelineComponent` with Sumi-e aesthetic.
- Verified functionality with unit tests.

### Completion Notes List
- Successfully implemented `ExtensionStateManager` methods: `addHistoryEntry`, `getHistory`, `updateHistoryEntryStatus`.
- Modified `AgentOrchestrator` to automatically record history for every user request and edge case fix.
- Developed `TimelineComponent` (Vanilla JS) with expandable reasoning details.
- Added "History" toggle to `VitalSignsBar`.
- Implemented Sumi-e aesthetic styling in `timeline.css`.
- All related unit tests pass.

### File List
- `src/state/history.interface.ts` (New)
- `src/state/index.ts` (New/Updated for barrel export)
- `src/state/extension-state-manager.ts` (Updated)
- `src/agents/orchestrator.ts` (Updated)
- `src/webview/components/timeline-component.js` (New)
- `src/webview/components/vital-signs-bar.js` (Updated)
- `src/webview/main.ts` (Updated)
- `src/webview/timeline.css` (New)
- `src/webview/webview-provider.ts` (Updated)
- `src/webview/index.html` (Updated)
- `esbuild.js` (Updated)
- `src/state/__tests__/extension-state-manager.test.ts` (Updated for Vitest compatibility and history tests)
- `src/agents/__tests__/orchestrator.test.ts` (Updated for Vitest compatibility and history tests)
