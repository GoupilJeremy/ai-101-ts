# Configuration API Guide

The AI-101 extension provides a typed API for programmatic access to its configuration. This allows other extensions to read and write AI-101 settings with full type safety and validation.

## Accessing the API

To use the Configuration API, you first need to get the `IAI101API` instance from the AI-101 extension.

```typescript
import * as vscode from 'vscode';
// Note: You should depend on the ai-101-ts npm package or copy the types
import { IAI101API, UIMode } from './api'; 

async function configureAI101() {
    const ai101Extension = vscode.extensions.getExtension('GoupilJeremy.ai-101-ts');
    if (ai101Extension) {
        const api: IAI101API = await ai101Extension.activate();
        
        // Use the API here
    }
}
```

## Reading Configuration

Use `getConfig(key)` to read a specific setting. The return value is strictly typed based on the key.

```typescript
// Read the current operating mode
const mode = api.getConfig('ui.mode'); 
console.log(`Current mode: ${mode}`); // e.g., 'learning'
```

## Writing Configuration

Use `setConfig(key, value, scope?)` to update a specific setting. You can specify the `ConfigurationScope` ('user', 'workspace', or 'workspaceFolder').

```typescript
// Update mode to expert in the workspace scope
await api.setConfig('ui.mode', UIMode.Expert, 'workspace');
```

## Bulk Updates

Use `updateConfig(config, scope?)` to update multiple settings at once.

```typescript
await api.updateConfig({
    'ui.mode': UIMode.Focus,
    'performance.maxTokens': 2048,
    'telemetry.enabled': false
}, 'workspace');
```

## Validation

The API performs runtime validation on all write operations. If you provide an invalid value (e.g., a negative number for tokens or an invalid enum value), the promise will reject with an error.

```typescript
try {
    // This will throw because maxTokens must be positive
    await api.setConfig('performance.maxTokens', -100);
} catch (error) {
    console.error(error.message); // "performance.maxTokens must be a positive number"
}
```

## Configuration Scopes

| Scope | Description |
|-------|-------------|
| `'user'` | (Default) Applies setting globally for the user. |
| `'workspace'` | Applies setting to the current workspace. |
| `'workspaceFolder'` | Applies setting to the current workspace folder. |

## Available Keys

Refer to the `IAI101Config` interface for a full list of available keys and their types. Common keys include:

- `llm.provider`: `'openai' | 'anthropic' | 'custom'`
- `ui.mode`: `'learning' | 'expert' | 'focus' | 'team' | 'performance'`
- `ui.transparency`: `'minimal' | 'medium' | 'full'`
- `performance.maxTokens`: `number`
- `telemetry.enabled`: `boolean`
