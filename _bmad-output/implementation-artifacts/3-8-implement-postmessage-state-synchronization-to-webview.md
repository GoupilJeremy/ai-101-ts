# Story 3.8: Implement PostMessage State Synchronization to Webview

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want agent states to be synchronized to the webview via PostMessage,
so that the UI can display real-time agent activity and status.

## Acceptance Criteria

1.  **Given** ExtensionStateManager maintains backend state
2.  **When** State manager calls `notifyStateUpdate(agent, state)`
3.  **Then** Manager sends `toWebview:agentStateUpdate` message via `webview.postMessage`
4.  **And** UI frontend (webview) receives message and updates local store
5.  **And** State sync is one-directional (Backend -> UI) as per architecture
6.  **And** Manager supports `setWebview(webview)` for reference registration
7.  **And** Snapshot of all states is sent when webview connects
8.  **And** Unit tests verify postMessage calls and payload structure

## Tasks / Subtasks

- [x] Task 1: Synchronization Infrastructure (AC: 2, 3, 6, 7)
  - [x] 1.1: Implement `setWebview()` in `ExtensionStateManager`
  - [x] 1.2: Implement `notifyStateUpdate()` to send messages via `postMessage`
  - [x] 1.3: Update `AI101WebviewProvider` to register the webview with `ExtensionStateManager`
  - [x] 1.4: Send full state snapshot upon webview registration

- [x] Task 2: Frontend Integration (AC: 4, 5)
  - [x] 2.1: Implement message listener in webview frontend (placeholder or actual if webview exists)
  - [x] 2.2: Ensure frontend store is updated upon message receipt

- [x] Task 3: Testing (AC: 8)
  - [x] 3.1: Update `src/state/__tests__/extension-state-manager.test.ts` to mock webview and verify messages

## Dev Notes

- **WebView Reference**: Use an interface for the webview to allow easy mocking in tests.
- **Message Types**: Use consistent naming like `toWebview:agentStateUpdate`.
- **One-Directional**: Only specialized actions should trigger backend changes; state sync itself is backend-driven.

### Project Structure Notes

- Modified file: `src/state/extension-state-manager.ts`
- Modified file: `src/webview/webview-provider.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.8]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
