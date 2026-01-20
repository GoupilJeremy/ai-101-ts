# Story 2.6: Integrate Cache with Provider Manager

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want all LLM calls to go through the cache layer automatically,
so that cost optimization is transparent and requires no explicit caching logic in agents.

## Acceptance Criteria

1.  **Given** HybridLLMCache and LLMProviderManager are implemented
2.  **When** I modify `provider-manager.ts` to integrate cache
3.  **Then** `callLLM()` method checks cache before calling provider
4.  **And** Cache key generation includes all relevant context (agent, prompt, model, options)
5.  **And** On cache hit: response returned immediately with <10ms latency
6.  **And** On cache miss: provider called, response cached, then returned
7.  **And** Cache statistics are updated on every hit/miss
8.  **And** Token estimation happens before provider call for budget checking
9.  **And** Cache layer is transparent to calling agents (no code changes needed)
10. **And** Unit tests verify cache integration with provider calls

## Tasks / Subtasks

- [x] Task 1: Initialization (AC: 1, 2, 9)
  - [x] 1.1: Create `src/llm/provider-manager.ts` update to initialize `HybridLLMCache`
  - [x] 1.2: Ensure `LLMProviderManager` receives storage path for cache initialization

- [x] Task 2: Cache Integration in callLLM (AC: 3, 4, 5, 6, 7)
  - [x] 2.1: Implement cache check at the beginning of `callLLM()`
  - [x] 2.2: Implement cache storage after successful provider response
  - [x] 2.3: Ensure cache statistics are updated

- [x] Task 3: Token Estimation & Transparency (AC: 8, 9)
  - [x] 3.1: Verify token estimation occurs appropriately
  - [x] 3.2: Verify no changes needed in Orchestrator/Agents

- [x] Task 4: Testing (AC: 10)
  - [x] 4.1: Update `src/llm/__tests__/provider-manager.test.ts` with cache integration tests
  - [x] 4.2: Verify hit/miss scenarios and statistics

## Dev Notes

- **Cache Initialization**: `LLMProviderManager.initialize(storagePath)` should be called by the extension.
- **Key Generation**: Use `this.cache.generateKey(agent, prompt, JSON.stringify(options))`.
- **Transparency**: The interface of `callLLM` remains the same.

### Project Structure Notes

- Modified file: `src/llm/provider-manager.ts`
- Modified file: `src/llm/__tests__/provider-manager.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.6]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
