# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Suika** (🍉) is a VSCode extension that provides a transparent AI assistant with a sumi-e inspired HUD. Four specialized AI agents (Architect, Coder, Reviewer, Context) collaborate visibly above your code, making AI reasoning transparent and understandable.

## Build & Development Commands

### Development
```bash
# Install dependencies
npm install

# Development with watch mode (recommended)
npm run watch
# Then press F5 in VSCode to launch Extension Development Host

# Type checking only
npm run check-types

# Linting
npm run lint

# Build for production
npm run package
```

### Testing
```bash
# Run unit tests with Vitest
npm run test:unit

# Run unit tests in watch mode
npm run test:watch

# Run VSCode integration tests
npm test

# Compile tests
npm run compile-tests
```

### Documentation
```bash
# Generate API documentation with TypeDoc
npm run docs:generate

# Serve documentation locally on port 3000
npm run docs:serve

# Watch and regenerate docs on changes
npm run docs:watch

# Validate documentation
npm run docs:validate
```

## Architecture Overview

### Core Architectural Patterns

**CRITICAL:** Read `_bmad-output/planning-artifacts/architecture.md` and `_bmad-output/project-context.md` before making any architectural changes. Key patterns:

1. **Orchestrator Central Pattern**: `AgentOrchestrator` is the ONLY component that coordinates agents. Agents NEVER call each other directly.

2. **ILLMProvider Abstraction**: NEVER call LLM providers (OpenAI, Anthropic) directly. Always use the `ILLMProvider` interface through `LLMProviderManager`.

3. **Dual State Pattern**: Backend (Node.js in `src/extension.ts`) is the ONLY source of truth. Frontend webview is a read-only mirror updated via `postMessage`.

4. **Hybrid Cache Strategy**: All LLM calls MUST go through the cache layer (L1 memory LRU + L2 file system) for performance and cost optimization.

### Directory Structure

```
src/
├── agents/                 # Four AI agents (Architect, Coder, Reviewer, Context)
│   ├── architect/         # Project analysis agent
│   ├── coder/            # Code generation agent
│   ├── reviewer/         # Risk identification agent
│   ├── context/          # File discovery agent
│   ├── shared/           # Agent interfaces
│   └── orchestrator.ts   # Central coordination (ONLY agent caller)
├── llm/                   # LLM provider abstraction
│   ├── providers/        # OpenAI, Anthropic implementations
│   ├── provider-manager.ts
│   ├── cache.ts          # Hybrid cache (L1 + L2)
│   └── rate-limiter.ts
├── state/                 # Backend state management
│   └── extension-state-manager.ts  # Single source of truth
├── webview/              # Frontend UI (Vanilla JS, NO React)
│   ├── components/       # Vanilla JS ES6 classes
│   └── styles/           # BEM naming, CSS variables
├── api/                  # Public extension API
│   └── extension-api.ts  # IAI101API interface
├── commands/             # VSCode command handlers
├── config/               # Configuration management
├── errors/               # Specialized error classes
├── modes/                # Mode system (Learning, Expert, Team, etc.)
├── performance/          # System detection, performance mode
├── telemetry/           # Metrics and analytics
├── troubleshooting/     # Knowledge base system
└── extension.ts         # Main activation entry point
```

### Agent Flow

When processing user requests:
1. **Context Agent**: Loads relevant files and optimizes token usage
2. **Architect Agent**: (Optional) Analyzes architectural concerns
3. **Coder Agent**: Generates code aligned with project patterns
4. **Reviewer Agent**: Validates and identifies edge cases

All coordination flows through `AgentOrchestrator` - agents never communicate directly.

### State Synchronization

Backend state updates flow to webview via postMessage:
- Agent state updates: Instant (0ms throttle) for responsive UI
- Vital signs updates: Throttled to 100ms for 60fps performance
- Message format: `{ type: 'toWebview:eventName', ...data }`

Webview to backend: `{ type: 'toExtension:eventName', ...data }`

## Critical Rules

### Code Style & Naming

- **Files**: Always use `kebab-case.ts` (e.g., `architect-agent.ts`)
- **Interfaces**: Always prefix with `I` (e.g., `ILLMProvider`, `IAgent`)
- **Classes**: Descriptive suffixes (e.g., `ArchitectAgent`, `LLMProviderManager`)
- **Methods**: `camelCase` with verb-first (e.g., `generateCompletion`, `updateAgentState`)
- **Private members**: Use `private` keyword ONLY, NO underscore prefix
- **CSS**: Use BEM naming (`.agent__icon--thinking`)

### Test Organization

Tests are co-located in `__tests__/` subdirectories:
```
src/agents/architect/__tests__/architect-agent.test.ts
src/llm/__tests__/provider-manager.test.ts
```

Use Vitest for unit tests, Mocha + @vscode/test-electron for integration tests.

### TypeScript Configuration

- **Strict mode**: MANDATORY (`strict: true` in tsconfig.json)
- **No `any` types**: Require explicit justification
- **Target**: ES2022
- **Module**: ES2022 with bundler resolution
- **Always use async/await**, never `.then()` chains

### Performance Requirements

**60fps Animation:**
- Use `transform: translate3d()` for GPU acceleration
- Always include `will-change: transform, opacity` on animated elements
- Use `requestAnimationFrame()` for ALL DOM mutations
- Throttle Vital Signs updates to 100ms, but agent state is instant

**<100ms Response Time:**
- LLM cache must maintain >50% hit rate
- Use esbuild (NOT webpack) for <1s builds

**<$0.10/Session Cost:**
- All LLM calls MUST go through `HybridLLMCache`
- Token estimation before every call

### VSCode Extension Specifics

- Only `extension.ts` and webview-provider files can import `vscode` module
- Use `vscode.workspace.getConfiguration('suika')` for settings
- Use `context.secrets` for API keys (NEVER environment variables)
- Webview uses Vanilla JavaScript (ES6 classes), NO React/Vue/framework

### Security

- API keys: ALWAYS use `SecretStorage`, NEVER log or store in files
- User code: NEVER log without explicit consent
- LLM connections: ALWAYS use HTTPS/TLS
- Telemetry: Opt-in by default

### Error Handling

- NEVER return `null` or `undefined` for errors - always throw
- Use specialized error classes extending `AI101Error`
- Structured logging with context (provider, model, timestamp)

### Forbidden Patterns

1. ❌ Direct state mutation - use immutable patterns (spread operators)
2. ❌ Direct LLM provider calls - use `ILLMProvider` interface
3. ❌ Agents calling other agents - only orchestrator coordinates
4. ❌ Underscore prefix for private members - use `private` keyword
5. ❌ Promise `.then()` chains - use async/await
6. ❌ Hard-coded CSS values - use CSS variables
7. ❌ `top`/`left` animations - use `transform: translate3d()`
8. ❌ React in webview - use Vanilla JavaScript
9. ❌ Importing `vscode` outside extension context
10. ❌ Environment variables for secrets - use `SecretStorage`

## Public API

The extension exposes `IAI101API` for other extensions:
- Register custom LLM providers via `registerLLMProvider()`
- Subscribe to lifecycle events via `on()`
- Get/set configuration via `getConfig()` / `setConfig()`
- Check compatibility via `checkCompatibility()`

See `src/api/extension-api.ts` for full API documentation.

## Development Modes

- **Learning Mode**: Pedagogical explanations and pattern annotations
- **Expert Mode**: In-depth technical details and trade-offs
- **Focus Mode**: Minimal UI with agents hidden
- **Team Mode**: Large text and visible labels for screen sharing
- **Performance Mode**: Reduced animations for low-memory systems

## Key Extension Points

- **Custom LLM Providers**: Implement `ILLMProvider` interface
- **Custom Agent Renderers**: (Planned) Implement `IAgentRenderer` interface
- **Lifecycle Events**: Subscribe to `agentActivated`, `suggestionGenerated`, etc.
- **Configuration Presets**: See `src/config/presets.ts`

## Accessibility

- High contrast mode auto-detection from VSCode theme
- Colorblind modes: Deuteranopia, Protanopia, Tritanopia
- Keyboard-only navigation for all interactive elements
- Screen reader support with ARIA annotations
- Reduced motion support

## Related Documentation

- Full architecture: `_bmad-output/planning-artifacts/architecture.md`
- Implementation rules: `_bmad-output/project-context.md`
- PRD: `_bmad-output/planning-artifacts/prd.md`
- Epics & Stories: `_bmad-output/planning-artifacts/epics-stories-part*.md`
- API Documentation: `docs/api/` (generate with `npm run docs:generate`)
