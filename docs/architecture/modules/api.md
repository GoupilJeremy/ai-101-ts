# API Module

## Overview

The **API Module** (`src/api/`) exposes the public extension API for other extensions to integrate with AI-101.

## Module Structure

```
src/api/
├── extension-api.interface.ts    # IAI101API interface
├── api-implementation.ts         # Implementation
└── lifecycle-event-manager.ts    # Event system
```

## IAI101API Interface

```typescript
export interface IAI101API {
  // LLM Provider Registration
  registerLLMProvider(name: string, provider: ILLMProvider): void;
  
  // Event Subscriptions
  on(event: string, callback: EventCallback): Disposable;
  
  // Configuration API
  getConfig<T>(key: string): T | undefined;
  setConfig<T>(key: string, value: T): Promise<void>;
  updateConfig<T>(updates: Partial<Config>): Promise<void>;
  onDidChangeConfiguration(callback: ConfigChangeCallback): Disposable;
  
  // API Version
  apiVersion: string;
  checkCompatibility(requiredVersion: string): boolean;
}
```

## Public API Surface

### LLM Provider Registration

Allows extensions to register custom LLM providers:

```typescript
const api = vscode.extensions.getExtension('ai-101').exports;

api.registerLLMProvider('my-provider', {
  name: 'my-provider',
  async complete(request) {
    // Custom implementation
    return { text: '...', usage: {...} };
  },
  validateConfig(config) {
    return config.apiKey !== undefined;
  }
});
```

### Lifecycle Events

Subscribe to agent and suggestion lifecycle events:

```typescript
api.on('agent:stateChanged', (event) => {
  console.log(`Agent ${event.agent} is now ${event.state}`);
});

api.on('suggestion:generated', (event) => {
  console.log('New suggestion:', event.suggestion);
});
```

### Configuration API

Programmatic access to configuration:

```typescript
const provider = api.getConfig('provider');
await api.setConfig('mode', 'expert');
```

## API Versioning

**Current Version**: 1.0.0 (Semantic Versioning)

**Compatibility Check**:
```typescript
if (api.checkCompatibility('1.0.0')) {
  // Safe to use API
}
```

## Related Documentation

- [Modules Overview](./overview.md)
- [Lifecycle Events](../communication/events.md)
