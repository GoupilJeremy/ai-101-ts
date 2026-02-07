# ADR-005: Dual State Pattern

## Status
accepted

## Context
VSCode extensions run in two separate JavaScript contexts:
1. **Extension (Node.js)**: Access to VSCode APIs, file system
2. **Webview (Browser)**: Access to DOM, rendering

State must be shared between these contexts. Options:

1. **Webview as source of truth**: State lives in browser
2. **Extension as source of truth**: State lives in Node.js
3. **Dual state**: Both maintain state, synchronized via postMessage

## Decision
Implement Dual State Pattern with extension as source of truth, webview as synchronized copy.

## Consequences

### Positive
- **Clear ownership**: Extension is always source of truth
- **Separation**: Business logic in extension, UI logic in webview
- **Resilience**: Webview can reload without losing state
- **Security**: Sensitive data (API keys) stays in extension context
- **Debuggability**: Can inspect state in both contexts

### Negative
- **Latency**: postMessage adds ~1-5ms overhead
- **Serialization**: Only JSON-serializable data
- **Complexity**: Must maintain two state managers
- **Memory**: State duplicated in both contexts

## Related
- [Dual State Pattern](../patterns/dual-state.md)
- [State Module](../modules/state.md)
- [postMessage Protocol](../communication/postmessage.md)
