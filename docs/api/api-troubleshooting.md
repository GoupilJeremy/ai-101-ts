# API Troubleshooting Guide

This guide helps you resolve common issues when integrating with the Suika API.

## Common Errors

### "Suika extension not found"

**Symptom:** Your extension cannot find or activate Suika.

**Causes:**
- Suika extension not installed
- Extension ID mismatch
- Suika not yet activated

**Solutions:**

```typescript
// Check if Suika is available
const suika = vscode.extensions.getExtension('GoupilJeremy.suika');

if (!suika) {
  vscode.window.showErrorMessage(
    'Suika extension not found. Please install it from the marketplace.',
    'Install Suika'
  ).then(selection => {
    if (selection === 'Install Suika') {
      vscode.commands.executeCommand(
        'workbench.extensions.installExtension',
        'GoupilJeremy.suika'
      );
    }
  });
  return;
}

// Ensure Suika is activated
if (!suika.isActive) {
  await suika.activate();
}

const api = suika.exports as IAI101API;
```

**Prevention:**
- Declare dependency in `package.json`:
  ```json
  {
    "extensionDependencies": ["GoupilJeremy.suika"]
  }
  ```

---

### "API version incompatible"

**Symptom:** `checkCompatibility()` returns false or throws.

**Causes:**
- Your extension requires a newer API version than installed
- Breaking changes in API between versions

**Solutions:**

```typescript
const api = suika.exports as IAI101API;

// Check compatibility before using
if (!api.checkCompatibility('1.2.0')) {
  vscode.window.showWarningMessage(
    `Suika ${api.apiVersion} detected, but version 1.2.0+ required.`,
    'Update Suika'
  ).then(selection => {
    if (selection === 'Update Suika') {
      vscode.commands.executeCommand(
        'workbench.extensions.installExtension',
        'GoupilJeremy.suika'
      );
    }
  });
  
  // Gracefully degrade or disable features
  return;
}
```

**Prevention:**
- Always check compatibility on activation
- Follow semver for your own extension
- Document minimum required Suika version

---

### "Provider already registered"

**Symptom:** Error when calling `registerLLMProvider()`.

**Causes:**
- Provider with same name already exists
- Extension activated multiple times

**Solutions:**

```typescript
// Safe registration pattern
function safeRegisterProvider(api: IAI101API, name: string, provider: ILLMProvider) {
  try {
    api.registerLLMProvider(name, provider);
    console.log(`Provider '${name}' registered successfully`);
  } catch (error) {
    if (error.message.includes('already registered')) {
      console.log(`Provider '${name}' already exists, skipping registration`);
    } else {
      throw error;
    }
  }
}
```

**Prevention:**
- Use unique provider names (include your extension ID)
- Check if already registered before registering
- Handle deactivation properly to unregister

---

### "Invalid provider implementation"

**Symptom:** Error during provider registration or first use.

**Causes:**
- Missing required interface methods
- Methods return wrong types
- Async methods not returning Promises

**Solutions:**

```typescript
// Ensure all required methods are implemented
class MyProvider implements ILLMProvider {
  readonly name = 'my-provider'; // Required
  
  async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    // Must return Promise<ILLMResponse>
    return {
      content: '...',
      model: 'model-name',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      finishReason: 'stop'
    };
  }
  
  async estimateTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }
  
  getModelInfo(model: string): IModelInfo {
    // Must return IModelInfo, not Promise
    return {
      id: model,
      name: model,
      maxTokens: 4096,
      costPer1kTokens: 0.002
    };
  }
  
  async isAvailable(): Promise<boolean> {
    return true;
  }
}
```

**Validation Checklist:**
- [ ] `name` is a readonly string property
- [ ] `generateCompletion` returns `Promise<ILLMResponse>`
- [ ] `estimateTokens` returns `Promise<number>`
- [ ] `getModelInfo` returns `IModelInfo` (not Promise)
- [ ] `isAvailable` returns `Promise<boolean>`

---

### "Event callback throws error"

**Symptom:** Your event handler causes errors.

**Causes:**
- Unhandled exceptions in callback
- Accessing disposed resources
- Async errors not caught

**Solutions:**

```typescript
// Always wrap handlers in try-catch
api.on('agent:activated', (payload) => {
  try {
    handleAgentActivated(payload);
  } catch (error) {
    console.error('Error in agent:activated handler:', error);
    // Log to your telemetry if applicable
  }
});

// For async handlers
api.on('suggestion:created', async (payload) => {
  try {
    await processNewSuggestion(payload);
  } catch (error) {
    console.error('Error processing suggestion:', error);
  }
});

// Check for disposed state
api.on('agent:stateChanged', (payload) => {
  if (myComponent.isDisposed) {
    return; // Skip if component is disposed
  }
  myComponent.update(payload);
});
```

**Prevention:**
- Always use try-catch in handlers
- Check resource validity before use
- Dispose subscriptions when extension deactivates

---

### Configuration API Errors

#### "Invalid configuration key"

```typescript
// Wrong
api.getConfig('invalid.key'); // Throws

// Correct
api.getConfig('ui.mode'); // Returns value
```

#### "Invalid configuration value"

```typescript
// Wrong
await api.setConfig('ui.transparency.level', 'ultra'); // Throws

// Correct  
await api.setConfig('ui.transparency.level', 'full'); // Works
```

## Debugging Tips

### Using Output Channel

Suika logs to its own output channel. View it for debugging:

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Output: Show Output Channels"
3. Select "Suika" from dropdown

### Enable Debug Mode

```typescript
// Enable detailed logging
await api.setConfig('advanced.debugMode', true);
```

### Console Logging in Extension Host

```typescript
// Log to Extension Development Host console
console.log('[MyExtension]', 'Debug info:', data);
```

### Inspect Suika State

```typescript
// Log current configuration
console.log('Current mode:', api.getConfig('ui.mode'));
console.log('Default provider:', api.getConfig('llm.defaultProvider'));
console.log('API version:', api.apiVersion);
```

## Common Mistakes

### 1. Not Waiting for Activation

```typescript
// Wrong
const suika = vscode.extensions.getExtension('GoupilJeremy.suika');
const api = suika.exports; // May be undefined!

// Correct
const suika = vscode.extensions.getExtension('GoupilJeremy.suika');
if (suika && !suika.isActive) {
  await suika.activate();
}
const api = suika?.exports as IAI101API;
```

### 2. Forgetting to Dispose Subscriptions

```typescript
// Wrong - memory leak
export function activate(context: vscode.ExtensionContext) {
  api.on('agent:activated', handler); // Never disposed
}

// Correct
export function activate(context: vscode.ExtensionContext) {
  const unsubscribe = api.on('agent:activated', handler);
  context.subscriptions.push({ dispose: unsubscribe });
}
```

### 3. Blocking the Event Loop

```typescript
// Wrong - blocks all events
api.on('suggestion:created', async (payload) => {
  await heavyComputation(); // Takes 5 seconds
});

// Correct - defer heavy work
api.on('suggestion:created', (payload) => {
  setImmediate(() => {
    heavyComputation().catch(console.error);
  });
});
```

### 4. Not Handling Errors in Async Code

```typescript
// Wrong - unhandled rejection
api.on('config:changed', async (payload) => {
  await updateExternalService(payload); // May throw
});

// Correct
api.on('config:changed', async (payload) => {
  try {
    await updateExternalService(payload);
  } catch (error) {
    console.error('Failed to update external service:', error);
  }
});
```

### 5. Hardcoding Provider Names

```typescript
// Wrong - conflicts with other extensions
api.registerLLMProvider('custom', myProvider);

// Correct - unique name
api.registerLLMProvider('mycompany.myextension.custom', myProvider);
```

## Getting Help

If you're still having issues:

1. **Check the documentation**: Start with [Getting Started](./getting-started.md)
2. **Search existing issues**: [GitHub Issues](https://github.com/GoupilJeremy/suika/issues)
3. **Ask the community**: [Discussions](https://github.com/GoupilJeremy/suika/discussions)
4. **Report a bug**: [New Issue](https://github.com/GoupilJeremy/suika/issues/new)

When reporting issues, include:
- Suika version (`api.apiVersion`)
- Your extension's code (relevant parts)
- Error message and stack trace
- Steps to reproduce

## Related Documentation

- [Getting Started](./getting-started.md)
- [LLM Providers](./llm-providers.md)
- [Events API](./events.md)
- [Configuration API](./configuration.md)
