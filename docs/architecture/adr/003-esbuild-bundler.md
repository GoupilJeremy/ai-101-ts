# ADR-003: esbuild Bundler

## Status
accepted

## Context
Need fast build times for dual-build system (extension + webview). Options:

1. **webpack**: Industry standard, feature-rich
2. **esbuild**: Extremely fast, written in Go
3. **rollup**: Good for libraries

## Decision
Use esbuild for both extension and webview bundling.

## Consequences

### Positive
- **Build speed**: 10-100x faster than webpack
- **Watch mode**: Instant rebuilds during development
- **Simple config**: Minimal configuration needed
- **TypeScript**: Native TypeScript support

### Negative
- **Less mature**: Fewer plugins than webpack
- **Limited features**: Some advanced webpack features unavailable

## Related
- [Build Workflow](../workflow/build.md)
