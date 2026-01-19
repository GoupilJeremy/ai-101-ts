# ADR-004: Hybrid Cache Strategy

## Status
accepted

## Context
LLM API calls are expensive (time and cost). Need caching to optimize performance and reduce costs. Options:

1. **Memory-only cache**: Fast but not persistent
2. **File-only cache**: Persistent but slower
3. **Hybrid cache**: L1 memory + L2 file system

## Decision
Implement hybrid two-tier cache with L1 in-memory (LRU) and L2 file system.

## Consequences

### Positive
- **Performance**: <1ms L1 hits, ~10ms L2 hits vs 500-2000ms API calls
- **Cost savings**: >50% cache hit rate target reduces API costs
- **Persistence**: L2 survives extension reloads
- **Offline support**: Cached responses available without network

### Negative
- **Complexity**: Two-tier system more complex than single cache
- **Disk space**: L2 cache consumes disk storage
- **Memory**: L1 cache uses heap memory

## Related
- [Hybrid Cache Strategy](../patterns/hybrid-cache.md)
- [LLM Module](../modules/llm.md)
