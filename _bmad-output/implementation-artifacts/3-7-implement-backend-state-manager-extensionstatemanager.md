# Story 3.7: Implement Backend State Manager (ExtensionStateManager)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a backend state manager that maintains agent states as source of truth,
so that agent state changes are tracked reliably and can be synchronized to the UI.

## Acceptance Criteria

1.  **Given** All agents (Architect, Coder, Reviewer, Context) are implemented
2.  **When** I create `src/state/extension-state-manager.ts`
3.  **Then** ExtensionStateManager class maintains Map<AgentType, IAgentState>
4.  **And** `updateAgentState(agent, status, task)` updates backend state immutably
5.  **And** Backend state is the ONLY source of truth (Dual State Pattern)
6.  **And** State manager provides `getAgentState(agent)` for read access
7.  **And** State manager provides `getAllAgentStates()` for full state snapshot
8.  **And** IAgentState interface includes: status, currentTask, lastUpdate timestamp
9.  **And** State updates are atomic and thread-safe
10. **And** Unit tests verify state updates, immutability, and concurrent access

## Tasks / Subtasks

- [x] Task 1: Implementation (AC: 2, 3, 4, 5, 6, 7, 8, 9)
  - [x] 1.1: Refine `ExtensionStateManager` in `src/state/extension-state-manager.ts` (already partially implemented)
  - [x] 1.2: Ensure immutability in state updates
  - [x] 1.3: Add JSDoc and complete the implementation

- [x] Task 2: Testing (AC: 10)
  - [x] 2.1: Create `src/state/__tests__/extension-state-manager.test.ts`
  - [x] 2.2: Verify state consistency and update logic

## Dev Notes

- **Immutability**: Ensure that `getAllAgentStates()` returns a deep copy or a new object to prevent external mutation.
- **Single Instance**: Use the Singleton pattern.
- **Agent Lifecycle**: State should be initialized to `idle` for all agents.

### Project Structure Notes

- Modified file: `src/state/extension-state-manager.ts`
- New test file: `src/state/__tests__/extension-state-manager.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.7]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
