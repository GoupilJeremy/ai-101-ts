# Configuration API Reference

This guide covers the configuration API for programmatically reading and writing Suika settings.

## Overview

The Configuration API allows extensions to:
- Read current configuration values
- Update configuration programmatically
- Listen for configuration changes
- Manage user vs workspace scope settings

## API Methods

### `getConfig<K>(key)`

Retrieves a configuration value.

**Type Signature:**
```typescript
getConfig<K extends keyof IAI101Config>(key: K): IAI101Config[K]
```

**Parameters:**
- `key: K` - Configuration key (type-safe)

**Returns:** The configuration value with correct type

**Example:**
```typescript
// Get current transparency level
const transparency = api.getConfig('ui.transparency.level');
console.log(`Current transparency: ${transparency}`); // 'minimal' | 'medium' | 'full'

// Get LLM provider settings
const provider = api.getConfig('llm.defaultProvider');
console.log(`Default provider: ${provider}`); // 'openai' | 'anthropic' | 'custom'

// Get budget settings
const budget = api.getConfig('llm.budget.maxPerSession');
console.log(`Max budget per session: $${budget}`);
```

### `setConfig<K>(key, value, scope?)`

Sets a single configuration value.

**Type Signature:**
```typescript
setConfig<K extends keyof IAI101Config>(
  key: K, 
  value: IAI101Config[K], 
  scope?: ConfigurationScope
): Promise<void>
```

**Parameters:**
- `key: K` - Configuration key
- `value: IAI101Config[K]` - New value (type-safe)
- `scope?: ConfigurationScope` - 'user' | 'workspace' (default: 'user')

**Example:**
```typescript
// Set transparency for current user
await api.setConfig('ui.transparency.level', 'full', 'user');

// Set workspace-specific provider
await api.setConfig('llm.defaultProvider', 'anthropic', 'workspace');

// Enable learning mode
await api.setConfig('ui.mode', 'learning');
```

### `updateConfig(config, scope?)`

Updates multiple configuration values at once.

**Type Signature:**
```typescript
updateConfig(
  config: Partial<IAI101Config>, 
  scope?: ConfigurationScope
): Promise<void>
```

**Parameters:**
- `config: Partial<IAI101Config>` - Object with values to update
- `scope?: ConfigurationScope` - 'user' | 'workspace' (default: 'user')

**Example:**
```typescript
// Update multiple settings at once
await api.updateConfig({
  'ui.transparency.level': 'medium',
  'ui.mode': 'expert',
  'llm.budget.maxPerSession': 0.50,
  'llm.cache.enabled': true
});

// Apply workspace-specific settings
await api.updateConfig({
  'llm.defaultProvider': 'anthropic',
  'ui.showVitalSigns': true
}, 'workspace');
```

## Configuration Schema

### IAI101Config Interface

```typescript
interface IAI101Config {
  // UI Settings
  'ui.transparency.level': 'minimal' | 'medium' | 'full';
  'ui.mode': 'learning' | 'expert' | 'focus' | 'team' | 'performance';
  'ui.showVitalSigns': boolean;
  'ui.agentSize': 'small' | 'medium' | 'large';
  'ui.vitalSignsPosition': 'top' | 'bottom';
  'ui.highContrast': boolean;
  'ui.colorblindMode': 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // LLM Settings
  'llm.defaultProvider': string;
  'llm.fallbackProviders': string[];
  'llm.budget.maxPerSession': number;
  'llm.budget.warningThreshold': number;
  'llm.cache.enabled': boolean;
  'llm.cache.ttlMinutes': number;
  
  // Agent Settings
  'agents.architect.enabled': boolean;
  'agents.coder.enabled': boolean;
  'agents.reviewer.enabled': boolean;
  'agents.context.enabled': boolean;
  'agents.autoActivate': boolean;
  
  // Telemetry Settings
  'telemetry.enabled': boolean;
  'telemetry.shareAnonymousData': boolean;
  
  // Accessibility Settings
  'accessibility.keyboardNavigation': boolean;
  'accessibility.screenReaderOptimized': boolean;
  'accessibility.reducedMotion': boolean;
  
  // Advanced Settings
  'advanced.debugMode': boolean;
  'advanced.experimentalFeatures': boolean;
}
```

## Scope Handling

### User vs Workspace

```typescript
// User scope: applies to all workspaces for this user
await api.setConfig('ui.mode', 'learning', 'user');

// Workspace scope: applies only to current workspace
await api.setConfig('llm.defaultProvider', 'anthropic', 'workspace');
```

### Scope Priority

Workspace settings override user settings:

```
User Settings → Workspace Settings → Effective Value
'expert'     →  'learning'        → 'learning'
'openai'     →  (not set)         → 'openai'
```

### Reading Effective Value

`getConfig()` always returns the effective value (workspace overrides user):

```typescript
// If workspace has 'llm.defaultProvider' = 'anthropic'
// but user has 'llm.defaultProvider' = 'openai'
const provider = api.getConfig('llm.defaultProvider');
// Returns 'anthropic' (workspace wins)
```

## Listening to Changes

### Using Events API

```typescript
api.on('config:changed', (payload) => {
  console.log(`Config changed: ${payload.key}`);
  console.log(`Old value: ${payload.oldValue}`);
  console.log(`New value: ${payload.newValue}`);
  console.log(`Scope: ${payload.scope}`);
  
  // React to specific changes
  if (payload.key === 'ui.mode') {
    updateUIForMode(payload.newValue as string);
  }
});
```

### Reactive Pattern

```typescript
class ConfigWatcher {
  private currentMode: string;
  private unsubscribe: () => void;
  
  constructor(private api: IAI101API) {
    this.currentMode = api.getConfig('ui.mode');
    
    this.unsubscribe = api.on('config:changed', (payload) => {
      if (payload.key === 'ui.mode') {
        this.onModeChanged(payload.oldValue, payload.newValue);
      }
    });
  }
  
  private onModeChanged(oldMode: unknown, newMode: unknown): void {
    this.currentMode = newMode as string;
    // Update UI, reconfigure behaviors, etc.
  }
  
  dispose(): void {
    this.unsubscribe();
  }
}
```

## Validation

Configuration values are validated before being saved:

```typescript
try {
  // This will throw - invalid transparency value
  await api.setConfig('ui.transparency.level', 'invalid' as any);
} catch (error) {
  // Error: Invalid value for 'ui.transparency.level'. 
  // Expected one of: minimal, medium, full
}

try {
  // This will throw - budget must be positive
  await api.setConfig('llm.budget.maxPerSession', -1);
} catch (error) {
  // Error: 'llm.budget.maxPerSession' must be a positive number
}
```

## Presets

Apply predefined configuration presets:

```typescript
// Apply solo developer preset
await api.updateConfig({
  'ui.mode': 'learning',
  'ui.transparency.level': 'full',
  'ui.showVitalSigns': true,
  'agents.autoActivate': true,
  'llm.budget.maxPerSession': 0.10
});

// Apply team preset
await api.updateConfig({
  'ui.mode': 'team',
  'ui.transparency.level': 'medium',
  'ui.showVitalSigns': true,
  'telemetry.shareAnonymousData': true
});

// Apply enterprise preset
await api.updateConfig({
  'ui.mode': 'expert',
  'llm.defaultProvider': 'custom-onprem',
  'telemetry.enabled': false,
  'advanced.debugMode': false
});
```

## Complete Example

```typescript
import * as vscode from 'vscode';
import { IAI101API } from 'suika';

class ConfigurationManager {
  private disposables: vscode.Disposable[] = [];
  
  constructor(private api: IAI101API) {
    this.setupConfigWatcher();
    this.registerCommands();
  }
  
  private setupConfigWatcher(): void {
    const unsubscribe = this.api.on('config:changed', (payload) => {
      this.handleConfigChange(payload);
    });
    
    this.disposables.push({ dispose: unsubscribe });
  }
  
  private registerCommands(): void {
    this.disposables.push(
      vscode.commands.registerCommand('myext.setLearningMode', async () => {
        await this.api.setConfig('ui.mode', 'learning');
        vscode.window.showInformationMessage('Learning mode enabled');
      }),
      
      vscode.commands.registerCommand('myext.setExpertMode', async () => {
        await this.api.setConfig('ui.mode', 'expert');
        vscode.window.showInformationMessage('Expert mode enabled');
      }),
      
      vscode.commands.registerCommand('myext.showCurrentConfig', () => {
        const mode = this.api.getConfig('ui.mode');
        const provider = this.api.getConfig('llm.defaultProvider');
        const budget = this.api.getConfig('llm.budget.maxPerSession');
        
        vscode.window.showInformationMessage(
          `Mode: ${mode}, Provider: ${provider}, Budget: $${budget}`
        );
      })
    );
  }
  
  private handleConfigChange(payload: any): void {
    // Log configuration changes
    console.log(`[Config] ${payload.key}: ${payload.oldValue} → ${payload.newValue}`);
    
    // Handle specific changes
    switch (payload.key) {
      case 'ui.mode':
        this.onModeChange(payload.newValue);
        break;
      case 'llm.defaultProvider':
        this.onProviderChange(payload.newValue);
        break;
    }
  }
  
  private onModeChange(newMode: string): void {
    // Update custom UI elements for new mode
    vscode.commands.executeCommand('setContext', 'suika.mode', newMode);
  }
  
  private onProviderChange(newProvider: string): void {
    // Re-initialize provider-specific features
    vscode.window.showInformationMessage(`Now using ${newProvider} provider`);
  }
  
  async applyPreset(preset: 'solo' | 'team' | 'enterprise'): Promise<void> {
    const presets = {
      solo: {
        'ui.mode': 'learning',
        'ui.transparency.level': 'full',
        'llm.budget.maxPerSession': 0.10
      },
      team: {
        'ui.mode': 'team',
        'ui.transparency.level': 'medium',
        'telemetry.shareAnonymousData': true
      },
      enterprise: {
        'ui.mode': 'expert',
        'telemetry.enabled': false,
        'advanced.debugMode': false
      }
    };
    
    await this.api.updateConfig(presets[preset] as any);
    vscode.window.showInformationMessage(`Applied ${preset} preset`);
  }
  
  dispose(): void {
    this.disposables.forEach(d => d.dispose());
  }
}
```

## Related Documentation

- [Getting Started](./getting-started.md)
- [LLM Providers](./llm-providers.md)
- [Events API](./events.md)
- [Troubleshooting](./troubleshooting.md)
