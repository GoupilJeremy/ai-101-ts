# Story 1.7: Implement Centralized Error Handler with Retry Logic

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a centralized Error Handler with retry logic and exponential backoff,
So that the system can gracefully handle transient failures (network errors, rate limits) without crashing.

## Acceptance Criteria

1.  **Given** The extension is active
2.  **When** An error occurs in any service
3.  **Then** It is caught by a centralized `ErrorHandler`
4.  **And** Transient errors (LLM rate limits, network timeouts) trigger automatic retries
5.  **And** Retries implement exponential backoff (e.g., 1s, 2s, 4s...)
6.  **And** Critical errors (Auth failure, invalid config) are reported to the user immediately via VSCode UI
7.  **And** All errors are logged to a dedicated "AI 101" Output Channel
8.  **And** Error messages include error codes and actionable advice where possible
9.  **And** The max number of retries is configurable

## Tasks / Subtasks

- [ ] Task 1: Create Error Infrastructure (AC: 7, 8)
  - [ ] 1.1: Create `src/errors/error-handler.ts`
  - [ ] 1.2: Create `AI101Logger` or use OutputChannel directly for centralized logging
  - [ ] 1.3: Update base `AI101Error` to support metadata/retry hints

- [ ] Task 2: Implement Retry Logic (AC: 4, 5, 9)
  - [ ] 2.1: Implement `handleWithRetry<T>(task: () => Promise<T>, options: RetryOptions): Promise<T>`
  - [ ] 2.2: Implement Exponential Backoff utility
  - [ ] 2.3: Integrate with `ConfigurationManager` for retry settings

- [ ] Task 3: Implement Error Reporting (AC: 3, 6)
  - [ ] 3.1: Implement logic to distinguish between transient and critical errors
  - [ ] 3.2: Implement `vscode.window.showErrorMessage` with actions (e.g., "Open Settings", "Retry Now")

- [ ] Task 4: Testing
  - [ ] 4.1: Unit test for Retry Logic with mocked failures
  - [ ] 4.2: Verify Output Channel logging

## Dev Notes

### Architecture Patterns & Constraints
- **Centralized Pattern**: All async operations should ideally wrap their calls or pipe errors through this handler.
- **Async/Await**: Ensure proper promise handling to avoid unhandled rejections.
- **Categorization**: Use Error Codes (e.g., `RATE_LIMIT`, `NETWORK_OFFLINE`, `AUTH_FAILED`) to drive handling logic.

### Source Tree Components
- `src/errors/error-handler.ts` (New)
- `src/errors/error-codes.ts` (New - optional, or in error-handler)
- `src/extension.ts` (Register OutputChannel)

### Testing Standards
- Mock timers/delay for fast retry testing.

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
