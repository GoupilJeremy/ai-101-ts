# Story 9.4: Implement Lifecycle Event Subscription API

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an extension developer,
I want to subscribe to agent and suggestion lifecycle events,
so that I can build custom analytics, notifications, or integrations.

## Acceptance Criteria

1.  **Event Subscription API**: `AI101.on(eventName, callback)` is available. [x]
2.  **Supported Events**: [x]
    -   `agentActivated`: When an agent starts working or thinking.
    -   `agentStateChanged`: When an agent transitions states.
    -   `suggestionGenerated`: When a suggestion is created.
    -   `suggestionAccepted`: When user accepts a suggestion.
    -   `suggestionRejected`: When user rejects a suggestion.
3.  **Typed Payloads**: Event payloads are fully documented and typed (TypeScript). [x]
4.  **Unsubscribe Mechanism**: `on()` returns an `Unsubscribe` function (or object with `dispose()`). [x]
5.  **Multi-Subscriber Support**: Multiple listeners can be attached to the same event. [x]
6.  **Non-Blocking**: Event emission is asynchronous and does not block the main extension thread. [x]
7.  **Error Isolation**: Errors in subscriber callbacks catch/log and do NOT crash the extension. [x]
8.  **Example Usage**: Documentation includes an example extension subscribing to events. [x]
9.  **Unit Tests**: Verify subscription, emission, unsubscription, and error handling. [x]

## Tasks / Subtasks

- [x] **Task 1: Define Event Types & Interfaces**
  - [x] Create `src/api/events.ts` to define event interfaces (`IAgentLifecycleEvent`, `ISuggestionLifecycleEvent`).
  - [x] Define the `Unsubscribe` type.
  - [x] Export these types in `src/api/index.ts`.

- [x] **Task 2: Update Public API Interface**
  - [x] Update `src/api/extension-api.ts` to include `on<K extends keyof AI101Events>(event: K, callback: (payload: AI101Events[K]) => void): Unsubscribe`.

- [x] **Task 3: Implement Lifecycle Event Manager**
  - [x] Create `src/api/lifecycle-event-manager.ts`.
  - [x] Implement event registry (Map of event names to Set of callbacks).
  - [x] Implement `emit(event, payload)` method with error handling (try/catch around callbacks).
  - [x] Ensure `emit` is async (or at least callbacks don't block).

- [x] **Task 4: Integrate with Core Systems**
  - [x] Modify `AgentOrchestrator` to emit `agentActivated` and `agentStateChanged`.
  - [x] Modify `AgentOrchestrator` (or wherever suggestions are handled/accepted) to emit `suggestionGenerated`, `suggestionAccepted`, `suggestionRejected`.
  - [x] Ensure `LifecycleEventManager` singleton is accessible where needed.

- [x] **Task 5: Update API Implementation**
  - [x] Update `src/api/api-implementation.ts` to expose the `on` method, delegating to `LifecycleEventManager`.

- [x] **Task 6: Testing & Documentation**
  - [x] Unit tests for `LifecycleEventManager` (subscription, emission, error isolation).
  - [x] Unit tests for API Integration.
  - [x] Update Developer Guide with example usage.

## Dev Notes

- **Architecture Compliance**:
  - Use the Singleton pattern for `LifecycleEventManager` (similar to `LLMProviderManager`).
  - Maintain the "Backend as Source of Truth" pattern. Events originate in Node.js context.
  - Keep `src/api/` decoupled from internal logic. `LifecycleEventManager` acts as the bridge.

- **Type Safety**:
  - Use TypeScript generics for the `on` method to ensure strict typing between event name and payload.
  - Example: `api.on('agentStateChanged', (event) => { /* event is IAgentStateChangedEvent */ })`.

- **Error Handling**:
  - Crucial: Third-party code (callbacks) must effectively run in a sandbox. Wrap callback execution in `try-catch` and log errors to the extension output channel without propagating them.

### Project Structure Notes

- `src/api/events.ts` (New)
- `src/api/lifecycle-event-manager.ts` (New)
- `src/api/extension-api.ts` (Modify)
- `src/agents/orchestrator.ts` (Modify - to emit events)
- `src/state/extension-state-manager.ts` (Modify - to emit state changes)
- `src/commands/suggestion-commands.ts` (Modify - to emit accept/reject events)

### References

- [Source: planning-artifacts/epics.md#Story 9.4](file:///home/jeregoupix/dev/ai-101-ts/_bmad-output/planning-artifacts/epics.md)
- [Source: project-context.md#Category 6: API Patterns](file:///home/jeregoupix/dev/ai-101-ts/_bmad-output/project-context.md)

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

- Reviewed `src/api/extension-api.ts` to align with existing API structure.
- Integrated `LifecycleEventManager` into `AgentOrchestrator`, `ExtensionStateManager`, and `suggestion-commands.ts`.
- Verified all unit tests pass with `vitest`.
- Created comprehensive documentation for the new API.

### Completion Notes List

- Implemented `LifecycleEventManager` singleton for decoupled event handling.
- Defined strictly typed event payloads in `src/api/events.ts`.
- Added `on()` method to `IAI101API` for public consumption.
- Hooked into core systems to emit:
  - `agentActivated` (Orchestrator)
  - `agentStateChanged` (State Manager)
  - `suggestionGenerated` (Orchestrator)
  - `suggestionAccepted` (Commands)
  - `suggestionRejected` (Commands)
- Ensured non-blocking emission using `setTimeout(..., 0)`.
- Implemented error isolation using `try-catch` wrapper around subscriber callbacks.
- Added 6 unit tests for `LifecycleEventManager` and 1 integration test for the API.
- Created `lifecycle-events.md` guide for extension developers.

### File List

- `src/api/events.ts`
- `src/api/lifecycle-event-manager.ts`
- `src/api/extension-api.ts`
- `src/api/api-implementation.ts`
- `src/api/index.ts`
- `src/agents/orchestrator.ts`
- `src/state/extension-state-manager.ts`
- `src/commands/suggestion-commands.ts`
- `src/api/__tests__/lifecycle-event-manager.test.ts`
- `src/api/__tests__/api-implementation.test.ts`
- `docs/extension-dev/lifecycle-events.md`
- `docs/extension-dev/agent-renderers.md`
