# Debugging

## Extension Debugging

### Launch Extension Development Host

1. Open project in VSCode
2. Press `F5` (or Run → Start Debugging)
3. Extension Development Host window opens with extension loaded

### Breakpoints

Set breakpoints in TypeScript source files:

```typescript
export class CoderAgent {
  async execute(context: AgentContext) {
    debugger; // Breakpoint here
    // ...
  }
}
```

### Debug Console

Access variables and execute code in Debug Console:

```javascript
> this.state
> await this.llmProvider.complete(request)
```

## Webview Debugging

### Open Developer Tools

1. In Extension Development Host, run command:
   - `Developer: Open Webview Developer Tools`
2. Or right-click webview and select "Inspect"

### Console Logging

```javascript
console.log('Agent state:', state);
```

Logs appear in webview Developer Tools console.

## Output Channel Logging

Extension logs appear in Output panel:

1. View → Output
2. Select "AI-101" from dropdown

```typescript
import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('AI-101');
outputChannel.appendLine('Debug message');
```

## Common Debugging Scenarios

### Agent Not Executing

1. Check agent state in ExtensionStateManager
2. Verify LLM provider configuration
3. Check for errors in Output channel

### Webview Not Updating

1. Check postMessage calls in extension
2. Verify message listener in webview
3. Inspect WebviewStateManager state

### Cache Not Working

1. Check cache directory exists
2. Verify cache key generation
3. Check cache statistics

## Related Documentation

- [Build System](./build.md)
- [Testing](./test.md)
- [Development Setup](../contributing/setup.md)
