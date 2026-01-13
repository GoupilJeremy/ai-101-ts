# Story 2.3: Implement Anthropic Claude Provider with Error Handling

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want an Anthropic Claude provider implementation,
so that users can connect to Claude models as an alternative to OpenAI.

## Acceptance Criteria

1.  **Given** ILLMProvider interface is defined
2.  **When** I create `src/llm/providers/anthropic-provider.ts`
3.  **Then** AnthropicProvider implements ILLMProvider interface
4.  **And** Provider uses official Anthropic SDK for API calls
5.  **And** API key is retrieved from SecretStorage (never hardcoded)
6.  **And** `generateCompletion()` calls Anthropic Messages API
7.  **And** Supported models include: claude-3-opus, claude-3-sonnet, claude-3-haiku
8.  **And** Token estimation approximates using character count / 4
9.  **And** API errors are caught and wrapped in `LLMProviderError` with context
10. **And** Rate limit errors (429) are retryable with exponential backoff
11. **And** Network timeouts default to 30 seconds (configurable)
12. **And** All requests use HTTPS/TLS (NFR15 - secure communications)
13. **And** Unit tests mock Anthropic API responses

## Tasks / Subtasks

- [x] Task 1: Setup Library (AC: 4)
  - [x] 1.1: Add `@anthropic-ai/sdk` to `package.json`

- [x] Task 2: Implement AnthropicProvider (AC: 3, 5, 6, 7, 8, 11, 12)
  - [x] 2.1: Create `src/llm/providers/anthropic-provider.ts`
  - [x] 2.2: Implement `generateCompletion()` using `@anthropic-ai/sdk`
  - [x] 2.3: Implement `estimateTokens()` (char count / 4)
  - [x] 2.4: Integrate with `SecretManager` for Anthropic keys

- [x] Task 3: Error Handling & Security (AC: 9, 10, 12, 13)
  - [x] 3.1: Map Anthropic API errors to `LLMProviderError`
  - [x] 3.2: Configure retry flags for transient errors (429, 5xx)

- [x] Task 4: Testing (AC: 13)
  - [x] 4.1: Create `src/llm/providers/__tests__/anthropic-provider.test.ts`
  - [x] 4.2: Mock SDK responses and verify error mapping

## Dev Notes

- **ILLMProvider**: Implementation must match `src/llm/provider.interface.ts`.
- **SecretManager**: Use `SecretManager.getInstance().getApiKey('anthropic')`.
- **Error Mapping**: Map Anthropic status codes (429, 5xx) to `isTransient: true` in `LLMProviderError`.
- **Testing**: Use Mocha and assert. Mock `@anthropic-ai/sdk`.

### Project Structure Notes

- New file: `src/llm/providers/anthropic-provider.ts`
- New test file: `src/llm/providers/__tests__/anthropic-provider.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Source: src/llm/providers/openai-provider.ts] (as reference implementation)

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
