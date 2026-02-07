# postMessage Protocol

## Overview

The postMessage protocol enables communication between the VSCode extension (Node.js context) and the webview (browser context).

## Message Format

All messages follow this structure:

```typescript
interface Message {
  type: string;           // Message type identifier
  payload: any;           // Message data
  timestamp: number;      // Unix timestamp
}
```

## Message Types

### Extension → Webview

| Type | Payload | Purpose |
|------|---------|---------|
| `state:snapshot` | `{ state: ExtensionState }` | Initial state load |
| `agent:stateChanged` | `{ agentId: string, state: AgentState }` | Agent state update |
| `config:changed` | `{ config: Config }` | Configuration update |
| `suggestion:generated` | `{ suggestion: Suggestion }` | New suggestion |
| `telemetry:updated` | `{ metrics: TelemetryMetrics }` | Telemetry update |

### Webview → Extension

| Type | Payload | Purpose |
|------|---------|---------|
| `request:stateSnapshot` | `{}` | Request initial state |
| `user:action` | `{ action: string, data: any }` | User interaction |
| `suggestion:accept` | `{ id: string }` | Accept suggestion |
| `suggestion:reject` | `{ id: string, reason: string }` | Reject suggestion |

## Implementation

### Sending from Extension

```typescript
webviewPanel.webview.postMessage({
  type: 'agent:stateChanged',
  payload: { agentId: 'coder', state: { status: 'active' } },
  timestamp: Date.now()
});
```

### Receiving in Webview

```typescript
window.addEventListener('message', (event) => {
  const { type, payload, timestamp } = event.data;
  
  switch (type) {
    case 'agent:stateChanged':
      handleAgentStateChange(payload);
      break;
    // ...
  }
});
```

## Performance

- **Target Latency**: <16ms (sub-frame for 60fps)
- **Message Size**: Keep <1MB for performance
- **Serialization**: JSON only (no functions, circular refs)

## Related Documentation

- [Dual State Pattern](../patterns/dual-state.md)
- [State Module](../modules/state.md)
