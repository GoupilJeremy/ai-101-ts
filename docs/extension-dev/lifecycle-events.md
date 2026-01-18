# Lifecycle Event Subscription Guide

This guide explains how to subscribe to lifecycle events in the AI-101-TS extension to build custom integrations, analytics, or UI enhancements.

## Table of Contents

- [Overview](#overview)
- [Available Events](#available-events)
- [Subscribing to Events](#subscribing-to-events)
- [Event Payloads](#event-payloads)
- [Unsubscribing](#unsubscribing)
- [Best Practices](#best-practices)

## Overview

The AI-101-TS extension exposes a public event system through its API. Other extensions can subscribe to events related to agents and suggestions. The event system is:

- **Type-safe**: Generic `on()` method provides strict typing for event names and payloads.
- **Asynchronous**: Event emission is non-blocking.
- **Isolated**: Errors in subscriber callbacks catch/log and do NOT affect the core extension.

## Available Events

| Event Name | Description |
|------------|-------------|
| `agentActivated` | Triggered when an agent starts working or thinking. |
| `agentStateChanged` | Triggered when an agent transitions between states (idle, thinking, success, etc.). |
| `suggestionGenerated` | Triggered when a new suggestion is created and ready for user review. |
| `suggestionAccepted` | Triggered when the user clicks 'Accept' on a suggestion. |
| `suggestionRejected` | Triggered when the user clicks 'Reject' or dismisses a suggestion. |

## Subscribing to Events

To subscribe to events, get the AI-101-TS API instance and use the `on()` method:

```typescript
import * as vscode from 'vscode';
import { IAI101API } from 'your-publisher.ai-101-ts';

export async function activate(context: vscode.ExtensionContext) {
    const ai101Extension = vscode.extensions.getExtension('your-publisher.ai-101-ts');
    if (ai101Extension) {
        const api = ai101Extension.exports as IAI101API;

        // Subscribe to agent activation
        api.on('agentActivated', (event) => {
            console.log(`Agent ${event.agent} activated at ${new Date(event.timestamp).toLocaleTimeString()}`);
        });

        // Subscribe to suggestion acceptance
        api.on('suggestionAccepted', (event) => {
            console.log(`User accepted suggestion ${event.id} from ${event.agent}`);
            // Your custom logic here (e.g., track in external analytics)
        });
    }
}
```

## Event Payloads

### Agent Events (`agentActivated`, `agentStateChanged`)

```typescript
interface IAgentLifecycleEvent {
    timestamp: number;
    agent: 'architect' | 'coder' | 'reviewer' | 'context';
    data?: any;
}

interface IAgentStateChangedEvent extends IAgentLifecycleEvent {
    state: {
        status: 'idle' | 'thinking' | 'working' | 'success' | 'alert' | 'error';
        currentTask?: string;
        lastUpdate: number;
        // ... other state fields
    };
}
```

### Suggestion Events (`suggestionGenerated`, `suggestionAccepted`, `suggestionRejected`)

```typescript
interface ISuggestionLifecycleEvent {
    timestamp: number;
    id: string;      // Unique identifier for the suggestion
    agent: string;   // The agent that generated it
    code?: string;   // The suggested code (for generated/accepted events)
    data?: any;      // Additional metadata
}
```

## Unsubscribing

The `on()` method returns an `Unsubscribe` function. Call this function to stop receiving events.

```typescript
const unsubscribe = api.on('agentStateChanged', (event) => {
    // ...
});

// Later, when you no longer need the updates:
unsubscribe();
```

## Best Practices

### 1. Error Isolation
While AI-101-TS wraps your callbacks in a `try-catch` block, you should still implement your own error handling to ensure your extension remains stable.

### 2. Performance
Keep your callbacks lightweight. If you need to perform heavy processing (e.g., network requests, complex analysis), do it asynchronously and avoid blocking the event loop.

### 3. Lifecycle Management
Always unsubscribe from events when your extension is deactivated or when the specific functionality is no longer needed to prevent memory leaks.

### 4. Semantic Versioning
The event system follows semantic versioning. Event names and payload structures will remain stable within a major version.

---

**Last Updated**: 2026-01-18  
**API Version**: 0.0.1
