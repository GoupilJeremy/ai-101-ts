# ADR-002: Vanilla JS Webview

## Status
accepted

## Context
The HUD webview needed to achieve 60fps performance with GPU-accelerated animations. Options considered:

1. **React/Preact**: Popular frameworks with virtual DOM
2. **Vue**: Lightweight reactive framework
3. **Vanilla JS**: Direct DOM manipulation with CSS animations

## Decision
Use Vanilla JavaScript with CSS transforms for GPU-accelerated animations.

## Consequences

### Positive
- **60fps performance**: Direct DOM manipulation, no virtual DOM overhead
- **GPU acceleration**: CSS transforms use GPU, not CPU
- **Small bundle size**: No framework overhead (~10KB vs 40-100KB)
- **Full control**: Direct control over rendering pipeline

### Negative
- **More code**: Manual DOM manipulation vs declarative templates
- **No reactivity**: Manual state synchronization
- **Learning curve**: Team familiarity with React

## Related
- [Webview Module](../modules/webview.md)
- [ADR-003: esbuild Bundler](./003-esbuild-bundler.md)
