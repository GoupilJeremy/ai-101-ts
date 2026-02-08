# Events API Reference

This guide covers the event system in Suika for subscribing to agent lifecycle and suggestion events.

## Overview

Suika exposes a comprehensive event system that allows extensions to react to:
- Agent state changes
- Suggestion lifecycle (created, accepted, rejected)
- Configuration updates
- Error events

## Event Types

### AI101Events Interface

```typescript
interface AI101Events {
  // Agent Lifecycle Events
  'agent:activated': AgentActivatedPayload;
  'agent:deactivated': AgentDeactivatedPayload;
  'agent:stateChanged': AgentStateChangedPayload;
  
  // Suggestion Lifecycle Events  
  'suggestion:created': SuggestionCreatedPayload;
  'suggestion:accepted': SuggestionAcceptedPayload;
  'suggestion:rejected': SuggestionRejectedPayload;
  
  // Configuration Events
  'config:changed': ConfigChangedPayload;
  
  // Error Events
  'error:occurred': ErrorPayload;
}
```

## Subscription Pattern

### Basic Subscription

```typescript
import * as vscode from 'vscode';
import { IAI101API, AI101Events } from 'suika';

export async function activate(context: vscode.ExtensionContext) {
  const suika = vscode.extensions.getExtension('GoupilJeremy.suika');
  const api = suika?.exports as IAI101API;
  
  // Subscribe to agent activation
  const unsubscribe = api.on('agent:activated', (payload) => {
    console.log(`Agent ${payload.agentType} activated`);
    console.log(`Reason: ${payload.reason}`);
  });
  
  // Store for cleanup
  context.subscriptions.push({
    dispose: () => unsubscribe()
  });
}
```

### Multiple Subscriptions

```typescript
function setupEventListeners(api: IAI101API): IDisposable[] {
  const subscriptions: (() => void)[] = [];
  
  // Agent events
  subscriptions.push(
    api.on('agent:activated', handleAgentActivated),
    api.on('agent:deactivated', handleAgentDeactivated),
    api.on('agent:stateChanged', handleStateChanged)
  );
  
  // Suggestion events
  subscriptions.push(
    api.on('suggestion:created', handleSuggestionCreated),
    api.on('suggestion:accepted', handleSuggestionAccepted),
    api.on('suggestion:rejected', handleSuggestionRejected)
  );
  
  return subscriptions.map(unsub => ({ dispose: unsub }));
}
```

## Event Payload Reference

### Agent Lifecycle Events

#### `agent:activated`

Fired when an agent becomes active.

```typescript
interface AgentActivatedPayload {
  /** Type of agent (architect, coder, reviewer, context) */
  agentType: AgentType;
  
  /** Timestamp of activation */
  timestamp: number;
  
  /** What triggered the activation */
  reason: 'user-action' | 'auto-trigger' | 'orchestrator';
  
  /** Context that triggered activation */
  triggerContext?: {
    file?: string;
    selection?: string;
    command?: string;
  };
}
```

**Example Handler:**
```typescript
api.on('agent:activated', (payload) => {
  // Log to analytics (opt-in)
  telemetry.track('agent_activated', {
    agent: payload.agentType,
    trigger: payload.reason
  });
  
  // Update status bar
  statusBar.text = `$(robot) ${payload.agentType} active`;
});
```

#### `agent:deactivated`

Fired when an agent becomes inactive.

```typescript
interface AgentDeactivatedPayload {
  agentType: AgentType;
  timestamp: number;
  reason: 'task-complete' | 'timeout' | 'user-cancelled' | 'error';
  duration: number; // milliseconds active
}
```

#### `agent:stateChanged`

Fired when an agent transitions between states.

```typescript
interface AgentStateChangedPayload {
  agentType: AgentType;
  previousState: AgentState; // 'idle' | 'thinking' | 'active' | 'alert' | 'success'
  currentState: AgentState;
  timestamp: number;
}
```

**Example Handler:**
```typescript
api.on('agent:stateChanged', (payload) => {
  if (payload.currentState === 'alert') {
    // Show notification for alert state
    vscode.window.showWarningMessage(
      `${payload.agentType} requires attention`
    );
  }
});
```

### Suggestion Lifecycle Events

#### `suggestion:created`

Fired when a new suggestion is generated.

```typescript
interface SuggestionCreatedPayload {
  /** Unique identifier for this suggestion */
  suggestionId: string;
  
  /** Agent that created the suggestion */
  sourceAgent: AgentType;
  
  /** Type of suggestion */
  type: 'code' | 'refactor' | 'fix' | 'documentation';
  
  /** Brief description */
  summary: string;
  
  /** Affected file */
  file: string;
  
  /** Line range affected */
  range: { start: number; end: number };
  
  /** Confidence score 0-1 */
  confidence: number;
  
  timestamp: number;
}
```

#### `suggestion:accepted`

Fired when user accepts a suggestion.

```typescript
interface SuggestionAcceptedPayload {
  suggestionId: string;
  sourceAgent: AgentType;
  type: string;
  
  /** Time from creation to acceptance */
  timeToAccept: number;
  
  /** Whether user modified the suggestion */
  wasModified: boolean;
  
  timestamp: number;
}
```

**Example Handler:**
```typescript
api.on('suggestion:accepted', (payload) => {
  // Track acceptance rate
  metricsTracker.recordAcceptance(payload.sourceAgent);
  
  // Show success feedback
  if (payload.type === 'fix') {
    vscode.window.setStatusBarMessage('$(check) Fix applied!', 3000);
  }
});
```

#### `suggestion:rejected`

Fired when user rejects a suggestion.

```typescript
interface SuggestionRejectedPayload {
  suggestionId: string;
  sourceAgent: AgentType;
  type: string;
  
  /** Optional reason from user */
  reason?: 'incorrect' | 'not-needed' | 'prefer-manual' | 'other';
  
  /** Optional feedback text */
  feedback?: string;
  
  timestamp: number;
}
```

### Configuration Events

#### `config:changed`

Fired when configuration is updated.

```typescript
interface ConfigChangedPayload {
  /** Key that changed */
  key: string;
  
  /** Previous value */
  oldValue: unknown;
  
  /** New value */
  newValue: unknown;
  
  /** Where change was made */
  scope: 'user' | 'workspace';
  
  timestamp: number;
}
```

**Example Handler:**
```typescript
api.on('config:changed', (payload) => {
  if (payload.key === 'ui.theme') {
    // Update custom UI to match new theme
    updateCustomTheme(payload.newValue as string);
  }
});
```

### Error Events

#### `error:occurred`

Fired when an error occurs within Suika.

```typescript
interface ErrorPayload {
  /** Error code */
  code: string;
  
  /** Human-readable message */
  message: string;
  
  /** Error severity */
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  /** Which component errored */
  source: 'agent' | 'llm' | 'cache' | 'ui' | 'config';
  
  /** Additional context */
  context?: Record<string, unknown>;
  
  /** Original error if available */
  originalError?: Error;
  
  timestamp: number;
}
```

## Error Isolation

Suika isolates errors in event callbacks to prevent one failing handler from affecting others:

```typescript
// Even if this throws, other handlers still execute
api.on('agent:activated', () => {
  throw new Error('Handler error');
});

// This handler still runs
api.on('agent:activated', (payload) => {
  console.log('Still works:', payload.agentType);
});
```

Errors in callbacks are logged to the Suika output channel but don't crash the extension.

## Best Practices

### 1. Always Dispose Subscriptions

```typescript
export function activate(context: vscode.ExtensionContext) {
  const unsubscribe = api.on('agent:activated', handler);
  
  // Register for cleanup on deactivation
  context.subscriptions.push({ dispose: unsubscribe });
}
```

### 2. Keep Handlers Fast

```typescript
// Good: Quick handler, defer heavy work
api.on('suggestion:created', (payload) => {
  // Quick check
  if (payload.confidence < 0.5) return;
  
  // Defer heavy processing
  setImmediate(() => {
    processInBackground(payload);
  });
});

// Bad: Blocking handler
api.on('suggestion:created', async (payload) => {
  await heavyAsyncOperation(); // Blocks event processing
});
```

### 3. Handle Errors Gracefully

```typescript
api.on('suggestion:accepted', (payload) => {
  try {
    updateMetrics(payload);
  } catch (error) {
    // Log but don't crash
    console.error('Metrics update failed:', error);
  }
});
```

### 4. Use Type Guards for Safety

```typescript
function isValidAgentType(type: string): type is AgentType {
  return ['architect', 'coder', 'reviewer', 'context'].includes(type);
}

api.on('agent:activated', (payload) => {
  if (!isValidAgentType(payload.agentType)) {
    console.warn('Unknown agent type:', payload.agentType);
    return;
  }
  
  // Safe to use payload.agentType
});
```

## Complete Example

```typescript
import * as vscode from 'vscode';
import { IAI101API } from 'suika';

class SuikaEventMonitor {
  private subscriptions: (() => void)[] = [];
  private metrics = {
    accepted: 0,
    rejected: 0,
    agentActivations: new Map<string, number>()
  };
  
  constructor(private api: IAI101API) {}
  
  start(): void {
    // Agent events
    this.subscriptions.push(
      this.api.on('agent:activated', this.handleAgentActivated.bind(this)),
      this.api.on('agent:stateChanged', this.handleStateChanged.bind(this))
    );
    
    // Suggestion events
    this.subscriptions.push(
      this.api.on('suggestion:accepted', this.handleAccepted.bind(this)),
      this.api.on('suggestion:rejected', this.handleRejected.bind(this))
    );
    
    // Error events
    this.subscriptions.push(
      this.api.on('error:occurred', this.handleError.bind(this))
    );
  }
  
  stop(): void {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }
  
  private handleAgentActivated(payload: any): void {
    const count = this.metrics.agentActivations.get(payload.agentType) ?? 0;
    this.metrics.agentActivations.set(payload.agentType, count + 1);
  }
  
  private handleStateChanged(payload: any): void {
    if (payload.currentState === 'alert') {
      this.showAlertNotification(payload.agentType);
    }
  }
  
  private handleAccepted(payload: any): void {
    this.metrics.accepted++;
    this.updateStatusBar();
  }
  
  private handleRejected(payload: any): void {
    this.metrics.rejected++;
    this.updateStatusBar();
  }
  
  private handleError(payload: any): void {
    if (payload.severity === 'critical') {
      vscode.window.showErrorMessage(`Suika Error: ${payload.message}`);
    }
  }
  
  private showAlertNotification(agentType: string): void {
    vscode.window.showWarningMessage(
      `${agentType} agent requires attention`,
      'View Details'
    ).then(selection => {
      if (selection === 'View Details') {
        vscode.commands.executeCommand('suika.showAgentDetails', agentType);
      }
    });
  }
  
  private updateStatusBar(): void {
    const total = this.metrics.accepted + this.metrics.rejected;
    const rate = total > 0 ? Math.round((this.metrics.accepted / total) * 100) : 0;
    // Update status bar with acceptance rate
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}
```

## Related Documentation

- [Getting Started](./getting-started.md)
- [LLM Providers](./llm-providers.md)
- [Configuration API](./configuration.md)
- [Troubleshooting](./troubleshooting.md)
