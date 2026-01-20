# Story 2.4: Implement LLM Provider Manager with Registry and Fallbacks

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a provider manager that registers providers and handles automatic fallbacks,
so that the system remains available even when primary providers fail.

## Acceptance Criteria

1.  **Given** OpenAI and Anthropic providers are implemented
2.  **When** I create `src/llm/provider-manager.ts`
3.  **Then** LLMProviderManager maintains Map<string, ILLMProvider> registry
4.  **And** `registerProvider(name, provider)` adds provider to registry
5.  **And** `getProvider(name)` retrieves provider by name
6.  **And** `callLLM(agent, prompt, options)` routes calls to configured provider
7.  **And** Provider selection is configurable per agent type (FR27)
8.  **And** If primary provider fails, manager tries fallback providers in order (FR29)
9.  **And** Fallback attempts are logged with structured context
10. **And** If all providers fail, throw comprehensive error with all attempt details
11. **And** Provider availability is checked before calls via `isAvailable()`
12. **And** Unit tests cover provider registration and fallback scenarios

## Tasks / Subtasks

- [x] Task 1: Foundation (AC: 3, 4, 5)
  - [x] 1.1: Create `src/llm/provider-manager.ts`
  - [x] 1.2: Implement basic registry and provider lookup

- [x] Task 2: Core Orchestration (AC: 6, 7, 11)
  - [x] 2.1: Implement `callLLM()` with basic routing
  - [x] 2.2: Integrate with `ConfigurationManager` to get preferred provider per agent

- [x] Task 3: Fallback Logic (AC: 8, 9, 10, 11)
  - [x] 3.1: Implement automatic fallback mechanism if primary fails
  - [x] 3.2: Implement structured logging for fallbacks
  - [x] 3.3: Implement multi-provider failure error handling

- [x] Task 4: Testing (AC: 12)
  - [x] 4.1: Create `src/llm/__tests__/provider-manager.test.ts`
  - [x] 4.2: Verify registration, routing, and fallback scenarios

## Dev Notes

- **Registry**: Use `Map<string, ILLMProvider>`.
- **Configuration**: Use `ConfigurationManager` (from Story 1.3) to get user preferences.
- **Fallbacks**: If `openai` is preferred but fails, try `anthropic`, and vice-versa.
- **Logging**: Use a structured logger if available or simple descriptive logs for now as per project context.

### Project Structure Notes

- New file: `src/llm/provider-manager.ts`
- New test file: `src/llm/__tests__/provider-manager.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4]
- [Source: _bmad-output/project-context.md#Decision #2: ILLMProvider Abstraction]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
