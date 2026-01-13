# Story 3.10: Implement Agent Lifecycle Events for Extensibility

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the Agent Orchestrator to emit lifecycle events (start, complete, error),
so that other parts of the extension can hook into agent behavior without tight coupling.

## Acceptance Criteria

1.  **Given** AgentOrchestrator is implemented
2.  **When** An agent starts execution
3.  **Then** Orchestrator emits `agentStart` event with agent type and request data
4.  **When** An agent completes execution
5.  **Then** Orchestrator emits `agentComplete` event with agent type and response data
6.  **When** An agent encounters an error
7.  **Then** Orchestrator emits `agentError` event with agent type and error details
8.  **And** Orchestrator provides a way to subscribe to these events (EventEmitter pattern)
9.  **And** Events are documented with JSDoc
10. **And** Unit tests verify that events are emitted with the correct payloads

## Tasks / Subtasks

- [x] Task 1: Event System Setup (AC: 1, 8, 9)
  - [x] 1.1: Integrate `EventEmitter` into `AgentOrchestrator` (using `vscode.EventEmitter` or Node's `events`)
  - [x] 1.2: Define event payload types

- [x] Task 2: Event Emission (AC: 2, 3, 4, 5, 6, 7)
  - [x] 2.1: Emit `agentStart` in `runAgent()` helper
  - [x] 2.2: Emit `agentComplete` after successful execution
  - [x] 2.3: Emit `agentError` in catch block

- [x] Task 3: Testing (AC: 10)
  - [x] 3.1: Create `src/agents/__tests__/lifecycle-events.test.ts`
  - [x] 3.2: Verify emission and payload data

## Dev Notes

- **EventEmitter**: Use `vscode.EventEmitter` for a more "VSCode native" feel, or `NodeJS.EventEmitter` if it needs to be more generic. I'll stick to `vscode.EventEmitter` as it integrates well with VSCode disposables.
- **Payloads**: Include metadata like agent name, timestamp, and relevant data (request/response/error).

### Project Structure Notes

- Modified file: `src/agents/orchestrator.ts`
- New test file: `src/agents/__tests__/lifecycle-events.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.10]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
