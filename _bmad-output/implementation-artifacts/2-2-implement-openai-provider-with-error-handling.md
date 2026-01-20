# Story 2.2: Implement OpenAI Provider with Error Handling

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want an OpenAI provider implementation,
So that users can connect to OpenAI GPT models for AI suggestions.

## Acceptance Criteria

1.  **Given** ILLMProvider interface is defined
2.  **When** I create `src/llm/providers/openai-provider.ts`
3.  **Then** OpenAIProvider implements ILLMProvider interface
4.  **And** Provider uses official OpenAI SDK for API calls
5.  **And** API key is retrieved from SecretStorage (never hardcoded)
6.  **And** `generateCompletion()` calls OpenAI Chat Completions API
7.  **And** Supported models include: gpt-4, gpt-4-turbo, gpt-3.5-turbo
8.  **And** Token estimation is implemented (e.g. using character count approximation or specific library)
9.  **And** API errors are caught and wrapped in `LLMProviderError` with context
10. **And** Rate limit errors (429) are retryable (marked as transient)
11. **And** Network timeouts default to 30 seconds (configurable)
12. **And** All requests use HTTPS/TLS
13. **And** Unit tests mock OpenAI API responses

## Tasks / Subtasks

- [x] Task 1: Setup Dependencies (AC: 4)
  - [x] 1.1: Add `openai` to `package.json`
  - [x] 1.2: Add token counting dependency if needed (e.g., `js-tiktoken`)

- [x] Task 2: Error Handling (AC: 9, 10)
  - [x] 2.1: Create `src/errors/llm-provider-error.ts`
  - [x] 2.2: Mark rate limit errors as transient for `ErrorHandler` retry logic

- [x] Task 3: Implement OpenAIProvider (AC: 3, 5, 6, 7, 8, 11, 12)
  - [x] 3.1: Create `src/llm/providers/openai-provider.ts`
  - [x] 3.2: Implement `generateCompletion()` with OpenAI SDK
  - [x] 3.3: Implement `estimateTokens()`
  - [x] 3.4: Integrate with `SecretManager` for API keys

- [x] Task 4: Testing (AC: 13)
  - [x] 4.1: Create `src/llm/providers/__tests__/openai-provider.test.ts`
  - [x] 4.2: Mock OpenAI SDK and verify behavior
  - [x] 4.3: Verify error mapping to `LLMProviderError`

## Dev Notes

### Architecture Patterns & Constraints
- **SecretStorage**: Must use `SecretManager.getInstance().getApiKey('openai')`.
- **ErrorHandler Integration**: Use `ErrorHandler.handleWithRetry` if appropriate or ensure error flags are set correctly.

### Source Tree Components
- `src/llm/providers/openai-provider.ts` (New)
- `src/errors/llm-provider-error.ts` (New)

### Testing Standards
- Mock the `openai` module to avoid real network calls.

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
