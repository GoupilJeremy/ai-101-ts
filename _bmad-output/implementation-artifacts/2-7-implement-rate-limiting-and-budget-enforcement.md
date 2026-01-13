# Story 2.7: Implement Rate Limiting and Budget Enforcement

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want per-user rate limiting and budget configuration,
so that users can control LLM costs and prevent unexpected charges.

## Acceptance Criteria

1.  **Given** LLM provider integration is complete
2.  **When** I create `src/llm/rate-limiter.ts`
3.  **Then** Rate limiter tracks tokens consumed per session
4.  **And** Budget limits are configurable in settings (tokens/session, cost/session)
5.  **And** Default budget is set to prevent >$0.10/session (NFR23)
6.  **And** `checkBudget()` method throws `BudgetExceededError` when limit reached
7.  **And** Budget checks occur before every LLM call (after cache miss)
8.  **And** Remaining budget is visible to users in Vital Signs Bar (linked to FR30)
9.  **And** Budget resets at session start (extension activation)
10. **And** Users receive warning notification at 80% budget consumption
11. **And** Unit tests verify budget enforcement logic

## Tasks / Subtasks

- [x] Task 1: Setup Infrastructure (AC: 2, 4, 9)
  - [x] 1.1: Create `src/llm/rate-limiter.ts`
  - [x] 1.2: Define `BudgetExceededError` in `src/errors/budget-exceeded-error.ts`

- [x] Task 2: Core Logic (AC: 3, 6, 10)
  - [x] 2.1: Implement token tracking per session
  - [x] 2.2: Implement `checkBudget()` logic
  - [x] 2.3: Implement 80% warning notification using `vscode.window.showWarningMessage`

- [x] Task 3: Integration (AC: 7, 8)
  - [x] 3.1: Integrate `RateLimiter` with `LLMProviderManager`
  - [x] 3.2: Ensure budget check happens before LLM calls (after cache miss)
  - [x] 3.3: Expose budget status for UI/Vital Signs Bar

- [x] Task 4: Testing (AC: 11)
  - [x] 4.1: Create `src/llm/__tests__/rate-limiter.test.ts`
  - [x] 4.2: Verify budget enforcement and warning logic

## Dev Notes

- **Settings**: Read `ai101.performance.maxTokens` and potentially new budget settings.
- **VSCode API**: Use `vscode.window.showWarningMessage` for the 80% notification.
- **Error**: `BudgetExceededError` should extend `AI101Error`.

### Project Structure Notes

- New file: `src/llm/rate-limiter.ts`
- New file: `src/errors/budget-exceeded-error.ts`
- New test file: `src/llm/__tests__/rate-limiter.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.7]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
