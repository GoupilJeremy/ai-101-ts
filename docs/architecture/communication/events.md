# Event System

## Overview

The LifecycleEventManager provides a pub/sub event system for agent and suggestion lifecycle events, enabling extensibility.

## Event Types

### Agent Lifecycle Events

| Event | Payload | When Emitted |
|-------|---------|--------------|
| `agent:stateChanged` | `{ agent: string, state: AgentState }` | Agent state changes |
| `agent:error` | `{ agent: string, error: Error }` | Agent encounters error |
| `agent:completed` | `{ agent: string, result: any }` | Agent completes task |

### Suggestion Lifecycle Events

| Event | Payload | When Emitted |
|-------|---------|--------------|
| `suggestion:generated` | `{ suggestion: Suggestion }` | New suggestion created |
| `suggestion:accepted` | `{ suggestion: Suggestion }` | User accepts suggestion |
| `suggestion:rejected` | `{ suggestion: Suggestion, reason: string }` | User rejects suggestion |

## Usage

### Subscribing to Events

```typescript
const api = vscode.extensions.getExtension('ai-101').exports;

const disposable = api.on('agent:stateChanged', (event) => {
  console.log(`Agent ${event.agent} is now ${event.state.status}`);
});

// Unsubscribe
disposable.dispose();
```

### Emitting Events (Internal)

```typescript
lifecycleEventManager.emit('suggestion:generated', {
  suggestion: { id: '...', code: '...', ... }
});
```

## Error Isolation

Event handlers are isolated - errors in one handler don't affect others:

```typescript
try {
  callback(event);
} catch (error) {
  console.error('Event handler error:', error);
  // Continue with other handlers
}
```

## Related Documentation

- [API Module](../modules/api.md)
- [Orchestrator Central Pattern](../patterns/orchestrator-central.md)
