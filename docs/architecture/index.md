# Suika Architecture Documentation

**Last Updated:** 2026-01-19  
**Version:** 1.0.0  
**Status:** Living Document

## Table of Contents

### 📐 Core Patterns
- [Orchestrator Central Pattern](./patterns/orchestrator-central.md) - Agent coordination and workflow
- [Dual State Pattern](./patterns/dual-state.md) - Backend/Frontend state synchronization
- [Hybrid Cache Strategy](./patterns/hybrid-cache.md) - Two-tier LLM response caching

### 🏗️ System Architecture
- [System Overview](./diagrams/system-overview.md) - High-level architecture
- [Component Diagram](./diagrams/component-diagram.md) - Module dependencies
- [Sequence Diagrams](./diagrams/sequence-diagrams.md) - Key interaction flows
- [Data Flow Diagrams](./diagrams/data-flow.md) - Information flow patterns

### 📦 Module Documentation
- [Modules Overview](./modules/overview.md) - All modules and dependencies
- [Agents Module](./modules/agents.md) - AI agent implementations
- [LLM Module](./modules/llm.md) - Provider abstraction and caching
- [State Module](./modules/state.md) - State management system
- [Webview Module](./modules/webview.md) - HUD rendering and UI
- [API Module](./modules/api.md) - Public extension API

### 🔌 Communication
- [postMessage Protocol](./communication/postmessage.md) - Extension ↔ Webview messaging
- [Event System](./communication/events.md) - Lifecycle events and subscriptions

### 🧪 Testing
- [Testing Strategy](./testing/strategy.md) - Coverage targets and frameworks
- [Testing Patterns](./testing/patterns.md) - Best practices and mocking

### 📝 Architecture Decision Records (ADRs)
- [ADR Template](./adr/000-template.md)
- [ADR-001: Orchestrator Central Pattern](./adr/001-orchestrator-central-pattern.md)
- [ADR-002: Vanilla JS Webview](./adr/002-vanilla-js-webview.md)
- [ADR-003: esbuild Bundler](./adr/003-esbuild-bundler.md)
- [ADR-004: Hybrid Cache Strategy](./adr/004-hybrid-cache-strategy.md)
- [ADR-005: Dual State Pattern](./adr/005-dual-state-pattern.md)

### 🤝 Contributing
- [Development Setup](./contributing/setup.md) - Getting started
- [Development Workflow](./contributing/development.md) - Standards and conventions
- [Pull Request Process](./contributing/pull-requests.md) - How to contribute
- [Code Style Guide](./contributing/code-style.md) - Coding standards

### 🔧 Development Workflows
- [Build System](./workflow/build.md) - Compilation and bundling
- [Debugging](./workflow/debug.md) - Extension and webview debugging
- [Testing](./workflow/test.md) - Running and writing tests

## Quick Start for Contributors

1. **Understand the Architecture**: Start with [System Overview](./diagrams/system-overview.md)
2. **Learn Core Patterns**: Read the three core patterns (Orchestrator, Dual State, Hybrid Cache)
3. **Setup Development Environment**: Follow [Development Setup](./contributing/setup.md)
4. **Explore Module Structure**: Review [Modules Overview](./modules/overview.md)
5. **Start Contributing**: Check [Pull Request Process](./contributing/pull-requests.md)

## Version Compatibility

| Suika Version | VSCode Version | Node Version | Documentation Version |
|----------------|----------------|--------------|----------------------|
| 1.0.0+         | 1.75.0+        | 16.0.0+      | 1.0.0                |

## Architecture Principles

1. **Separation of Concerns**: Clear module boundaries with single responsibilities
2. **Performance First**: 60fps UI, <100ms response times, >50% cache hit rate
3. **Extensibility**: Public APIs for LLM providers, agent renderers, and events
4. **Type Safety**: TypeScript strict mode throughout
5. **Test Coverage**: >70% coverage target (NFR17)
6. **Developer Experience**: Clear patterns, comprehensive docs, easy debugging

## Key Non-Functional Requirements

- **NFR17**: Test coverage >70%
- **NFR19**: Decoupled architecture (agents, renderers, providers separable)
- **NFR20**: Auto-generated API documentation
- **NFR21**: Cohesive patterns for open-source contributions

## Maintenance

This documentation should be updated when:
- New architectural patterns are introduced
- Module boundaries change
- Public APIs are modified
- Major refactoring occurs
- New ADRs are created

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for documentation update guidelines.

## Resources

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Mermaid Diagram Syntax](https://mermaid.js.org/intro/)
- [MADR Format](https://adr.github.io/madr/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
