# Story 2.5: Implement Hybrid LLM Cache (L1 Memory + L2 File System)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a two-tier cache system for LLM responses,
so that repeated prompts are answered from cache achieving >50% hit rate and <$0.10/session cost.

## Acceptance Criteria

1.  **Given** LLM providers are implemented
2.  **When** I create `src/llm/cache.ts` with HybridLLMCache class
3.  **Then** L1 cache uses in-memory LRU with max 100 entries (configurable)
4.  **And** L1 cache provides <1ms response time for hits
5.  **And** L2 cache uses file system in `.cache/` directory for persistence
6.  **And** L2 cache provides <10ms response time for hits
7.  **And** Cache keys include: agent type + prompt hash + context snippet (first 100 chars)
8.  **And** Cache TTL is 7 days by default (configurable per user)
9.  **And** `get(cacheKey)` checks L1 first, then L2, returns null if miss
10. **And** `set(cacheKey, response)` writes to both L1 and L2
11. **And** Cache invalidation occurs on configuration changes (model, temperature)
12. **And** Cache statistics track: hit rate, miss rate, cost saved
13. **And** Cache hit rate target is >50% (NFR24)
14. **And** Unit tests verify L1 and L2 cache behavior

## Tasks / Subtasks

- [x] Task 1: Setup Infrastructure (AC: 1, 2)
  - [x] 1.1: Create `src/llm/cache.ts`
  - [x] 1.2: Add `lru-cache` dependency if needed or implement a simple one

- [x] Task 2: Implement L1 & L2 (AC: 3, 4, 5, 6, 8, 9, 10)
  - [x] 2.1: Implement L1 (In-memory LRU)
  - [x] 2.2: Implement L2 (File system persistence)
  - [x] 2.3: Implement `get`/`set` logic with tiering

- [x] Task 3: Key Generation & Invalidation (AC: 7, 11)
  - [x] 3.1: Implement robust cache key generation
  - [x] 3.2: Implement basic invalidation logic

- [x] Task 4: Stats & Testing (AC: 12, 14)
  - [x] 4.1: Implementation of statistics tracking
  - [x] 4.2: Create `src/llm/__tests__/cache.test.ts`
  - [x] 4.3: Verify L1 and L2 behavior

## Dev Notes

- **LRU**: I'll use a simple Map-based LRU if `lru-cache` isn't already there to keep it lightweight.
- **File System**: Use `vscode.workspace.fs` or Node `fs` (Node `fs` is easier for persistent cache in a fixed dir).
- **TTL**: Check timestamps for entries.
- **Hashing**: Use `crypto` for prompt hashing.

### Project Structure Notes

- New file: `src/llm/cache.ts`
- New test file: `src/llm/__tests__/cache.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
