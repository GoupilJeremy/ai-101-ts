---
id: performance-high-memory
title: High Memory Usage
category: Performance
symptoms:
  - memory
  - ram
  - crash
  - out of memory
  - slow
errorCodes:
  - AI101-PERF-002
relatedDocs:
  - _bmad-output/planning-artifacts/architecture.md#caching
---

## Symptom Description

VSCode consumes excessive memory (>2GB), becomes slow over time, or crashes with out-of-memory errors. The AI-101 extension may contribute to high memory usage through caching or state management.

## Diagnosis Steps

1. **Check VSCode memory usage**
   - Help > Toggle Developer Tools > Memory tab
   - Look for memory growth over time
   
2. **Check cache size**
   - Cache is stored in `~/.vscode/extensions/ai-101-ts/cache/`
   - Check folder size (should be <100MB typically)
   
3. **Monitor over time**
   - Note memory usage when extension activates
   - Check again after 1 hour of use
   - Memory leak if usage grows continuously

## Solutions

### Solution 1: Clear LLM Cache

The hybrid cache (L1 memory + L2 file system) may grow too large.

```bash
# Clear cache manually
rm -rf ~/.vscode/extensions/ai-101-ts/cache/*
```

Or use the command:
```
1. Open Command Palette
2. Run "AI 101: Clear Cache"
3. Restart VSCode
```

### Solution 2: Reduce Token Budget

Lower the maximum token limit to reduce memory usage.

```json
{
  "ai101.performance.maxTokens": 2048  // Default is 4096
}
```

### Solution 3: Enable Performance Mode

Performance Mode limits memory-intensive features.

```
1. Open Command Palette
2. Run "AI 101: Toggle Performance Mode"
```

### Solution 4: Restart VSCode Regularly

Clears accumulated memory from long-running sessions.

```
1. Save all work
2. Close all VSCode windows
3. Reopen VSCode
```

## Prevention

- **Enable auto-clear cache** - Clear cache on extension deactivation
- **Set token budget limits** - Don't exceed 4096 tokens unless necessary
- **Restart VSCode daily** - Prevents memory accumulation
- **Monitor cache size** - Keep cache folder under 100MB
- **Use Performance Mode on low-RAM systems** - Auto-activates on <4GB RAM

## Related Documentation

- [Architecture: Caching Strategy](_bmad-output/planning-artifacts/architecture.md#caching)
- [Configuration: Performance Settings](docs/configuration.md#performance-settings)
