# State Module

## Overview

The **State Module** (`src/state/`) implements the Dual State Pattern with backend source of truth and frontend synchronized copy.

## Components

### ExtensionStateManager (Backend)

**Location**: `src/state/extension-state-manager.ts`

**Purpose**: Source of truth for all application state in Node.js context.

**Key Methods**:
- `updateAgentState(agentId: string, state: AgentState): void`
- `updateConfig(config: Partial<Config>): void`
- `addSuggestion(suggestion: Suggestion): void`
- `getStateSnapshot(): ExtensionState`

### WebviewStateManager (Frontend)

**Location**: `src/webview/state/webview-state-manager.ts`

**Purpose**: Synchronized copy of state in browser context.

**Key Methods**:
- `on(event: string, callback: StateListener): Disposable`
- `getState(): Readonly<WebviewState>`

## State Synchronization

State updates flow from backend to frontend via postMessage:

```
ExtensionStateManager → postMessage → WebviewStateManager → UI Components
```

**Target Latency**: <16ms (sub-frame for 60fps)

## Related Documentation

- [Dual State Pattern](../patterns/dual-state.md)
- [postMessage Protocol](../communication/postmessage.md)
