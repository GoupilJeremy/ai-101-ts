# Suika Extension API Examples

This directory contains runnable examples demonstrating how to integrate with the Suika VSCode extension API.

## Prerequisites

- VSCode 1.75 or higher
- Node.js 16 or higher
- Suika extension installed in VSCode

## Available Examples

### 1. Custom LLM Provider (`custom-llm-provider/`)

Learn how to implement and register a custom LLM provider with Suika.

**What you'll learn:**
- Implementing the `ILLMProvider` interface
- Registering your provider with the Suika API
- Handling completion requests and token estimation
- Error handling and availability checks

**Run it:**
```bash
cd custom-llm-provider
npm install
npm run build
# Then load the extension in VSCode Extension Development Host
```

### 2. Custom Agent Renderer (`custom-agent-renderer/`)

Learn how to create custom visual renderers for AI agents.

**What you'll learn:**
- Implementing the `IAgentRenderer` interface
- GPU-accelerated animations for 60fps performance
- State update handling and lifecycle management
- Custom visual styles and transitions

**Run it:**
```bash
cd custom-agent-renderer
npm install
npm run build
```

### 3. Event Subscription (`event-subscription/`)

Learn how to subscribe to Suika lifecycle events.

**What you'll learn:**
- Subscribing to agent activation events
- Listening to suggestion lifecycle events
- Handling event payloads
- Unsubscribing and cleanup

**Run it:**
```bash
cd event-subscription
npm install
npm run build
```

### 4. Configuration API (`configuration-api/`)

Learn how to read and write Suika configuration settings.

**What you'll learn:**
- Reading configuration values
- Setting individual configuration values
- Batch updating multiple settings
- Handling different configuration scopes (user vs workspace)

**Run it:**
```bash
cd configuration-api
npm install
npm run build
```

### 5. Full Extension Integration (`extension-integration/`)

A complete example of another VSCode extension using the Suika API.

**What you'll learn:**
- Declaring Suika as an extension dependency
- Accessing the API in your extension's `activate()` function
- Version compatibility checking
- Graceful degradation when Suika is not installed

**Run it:**
```bash
cd extension-integration
npm install
npm run build
# Press F5 to launch Extension Development Host
```

## General Integration Pattern

All examples follow this general pattern:

```typescript
import * as vscode from 'vscode';
import { IAI101API } from 'suika'; // Type definitions

export function activate(context: vscode.ExtensionContext) {
    // 1. Get the Suika extension
    const ai101Extension = vscode.extensions.getExtension('GoupilJeremy.suika');
    
    if (!ai101Extension) {
        vscode.window.showWarningMessage('Suika extension is not installed');
        return;
    }

    // 2. Get the API
    const api: IAI101API = ai101Extension.exports;

    // 3. Check version compatibility
    if (!api.checkCompatibility('^0.0.1')) {
        vscode.window.showErrorMessage('Suika version incompatible');
        return;
    }

    // 4. Use the API
    // ... your integration code here
}
```

## API Documentation

For complete API documentation, visit:
- [Online Documentation](https://goupiljeremy.github.io/suika/api/)
- [Local Documentation](../docs/api/)

## Troubleshooting

### "Suika extension not found"
Make sure the Suika extension is installed in your VSCode instance.

### "API version incompatible"
Update either Suika or your extension to compatible versions.

### "Provider already registered"
Each provider name must be unique. Choose a different name for your provider.

## Contributing

Found an issue with an example? Want to add a new example? Please open an issue or PR on the [Suika repository](https://github.com/GoupilJeremy/suika).

## License

These examples are provided under the same license as the Suika extension.
