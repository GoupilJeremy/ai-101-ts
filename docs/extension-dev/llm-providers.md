# LLM Provider Extension Guide

This guide explains how to create and register custom LLM providers for the AI-101-TS extension.

## Table of Contents

- [Overview](#overview)
- [ILLMProvider Interface](#illmprovider-interface)
- [Implementing a Custom Provider](#implementing-a-custom-provider)
- [Provider Registration](#provider-registration)
- [Provider Lifecycle](#provider-lifecycle)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Semantic Versioning and Deprecation Policy](#semantic-versioning-and-deprecation-policy)

## Overview

The AI-101-TS extension uses the **Adapter Pattern** to support multiple LLM providers. This allows you to integrate:

- Custom LLM APIs
- On-premise LLM deployments
- Alternative cloud providers
- Local models

All providers must implement the `ILLMProvider` interface, which is part of the extension's **public API** and follows semantic versioning guarantees.

## ILLMProvider Interface

The `ILLMProvider` interface defines the contract that all LLM providers must follow:

```typescript
export interface ILLMProvider {
    readonly name: string;
    generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse>;
    estimateTokens(text: string): Promise<number>;
    getModelInfo(model: string): IModelInfo;
    isAvailable(): Promise<boolean>;
}
```

### Key Methods

| Method | Purpose | Required |
|--------|---------|----------|
| `name` | Unique identifier for the provider | ✅ Yes |
| `generateCompletion()` | Generate text completions | ✅ Yes |
| `estimateTokens()` | Estimate token count for text | ✅ Yes |
| `getModelInfo()` | Get model information | ✅ Yes |
| `isAvailable()` | Check provider availability | ✅ Yes |

## Implementing a Custom Provider

### Step 1: Create Your Provider Class

Create a new TypeScript file for your provider:

```typescript
// src/llm/providers/my-custom-provider.ts
import { ILLMProvider, ILLMOptions, ILLMResponse, IModelInfo } from '../provider.interface';

export class MyCustomLLMProvider implements ILLMProvider {
    readonly name = 'my-custom-provider';

    constructor(private apiKey: string) {
        // Initialize your provider
    }

    async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
        // Implement completion logic
    }

    async estimateTokens(text: string): Promise<number> {
        // Implement token estimation
    }

    getModelInfo(model: string): IModelInfo {
        // Return model information
    }

    async isAvailable(): Promise<boolean> {
        // Check if provider is ready
    }
}
```

### Step 2: Handle API Keys Securely

**DO:**
- Use VSCode's `SecretStorage` API for API keys
- Validate API keys in the constructor
- Never log or expose API keys

**DON'T:**
- Store API keys in plain text
- Include API keys in error messages
- Commit API keys to version control

```typescript
constructor(private apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('API key is required');
    }
    this.apiKey = apiKey;
}
```

### Step 3: Implement Request/Response Handling

Use proper error handling and timeouts:

```typescript
async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    const timeout = options?.timeout ?? 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch('https://api.example.com/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                prompt,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 1000,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
            text: data.text,
            tokens: {
                prompt: data.usage.prompt_tokens,
                completion: data.usage.completion_tokens,
                total: data.usage.total_tokens,
            },
            model: data.model,
            finishReason: data.finish_reason,
            cost: this.calculateCost(data.usage.total_tokens),
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeout}ms`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
```

### Step 4: Implement Token Estimation

For accurate cost tracking, implement proper token estimation:

```typescript
async estimateTokens(text: string): Promise<number> {
    // Option 1: Use provider's tokenization API
    const response = await fetch('https://api.example.com/tokenize', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return data.token_count;

    // Option 2: Use a tokenizer library (e.g., tiktoken)
    // const tokens = encode(text);
    // return tokens.length;

    // Option 3: Simple approximation (least accurate)
    // return Math.ceil(text.split(/\s+/).length * 1.3);
}
```

## Provider Registration

> **Note:** The provider registration API is being developed in Story 9.2. This section describes the planned API.

### Current Registration (Temporary)

Currently, providers are registered manually in the extension's initialization code:

```typescript
// src/extension.ts
import { MyCustomLLMProvider } from './llm/providers/my-custom-provider';

export async function activate(context: vscode.ExtensionContext) {
    const apiKey = await context.secrets.get('my-custom-llm.apiKey');
    const provider = new MyCustomLLMProvider(apiKey);
    
    // Register with provider manager
    providerManager.registerProvider(provider);
}
```

### Future Registration API (Story 9.2)

The upcoming registration API will provide a cleaner interface:

```typescript
// Future API (coming in Story 9.2)
import * as ai101 from 'ai-101-ts';

export function activate(context: vscode.ExtensionContext) {
    ai101.providers.register({
        name: 'my-custom-provider',
        factory: async () => {
            const apiKey = await context.secrets.get('my-custom-llm.apiKey');
            return new MyCustomLLMProvider(apiKey);
        },
    });
}
```

## Provider Lifecycle

### Initialization

Providers are initialized when:
1. The extension activates
2. A user selects the provider in settings
3. The provider is explicitly requested

### Cleanup

Implement proper cleanup in your provider:

```typescript
export class MyCustomLLMProvider implements ILLMProvider {
    private abortController?: AbortController;

    dispose() {
        // Cancel any pending requests
        this.abortController?.abort();
        
        // Clean up resources
        // Close connections, clear caches, etc.
    }
}
```

### Availability Checks

The `isAvailable()` method is called to verify the provider is ready:

```typescript
async isAvailable(): Promise<boolean> {
    // Check 1: API key configured
    if (!this.apiKey) {
        return false;
    }

    // Check 2: Network connectivity
    try {
        const response = await fetch('https://api.example.com/health', {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000),
        });
        return response.ok;
    } catch {
        return false;
    }
}
```

## Error Handling

### Custom Error Types

Define provider-specific errors:

```typescript
export class LLMProviderError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode?: number
    ) {
        super(message);
        this.name = 'LLMProviderError';
    }
}
```

### Error Categories

Handle different error types appropriately:

| Error Type | Code | Action |
|------------|------|--------|
| Authentication | `AUTH_FAILED` | Prompt for API key |
| Rate Limit | `RATE_LIMIT` | Retry with backoff |
| Timeout | `TIMEOUT` | Retry or fail |
| Invalid Model | `INVALID_MODEL` | Show error to user |
| Network | `NETWORK_ERROR` | Retry with backoff |

### Example Error Handling

```typescript
async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    try {
        // Make API request
        const response = await this.makeRequest(prompt, options);
        return response;
    } catch (error) {
        if (error.statusCode === 401) {
            throw new LLMProviderError('Invalid API key', 'AUTH_FAILED', 401);
        }
        if (error.statusCode === 429) {
            throw new LLMProviderError('Rate limit exceeded', 'RATE_LIMIT', 429);
        }
        if (error.name === 'AbortError') {
            throw new LLMProviderError('Request timeout', 'TIMEOUT');
        }
        throw new LLMProviderError(
            `Request failed: ${error.message}`,
            'REQUEST_FAILED'
        );
    }
}
```

## Best Practices

### 1. Use Proper TypeScript Types

```typescript
// ✅ Good
async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    // Implementation
}

// ❌ Bad
async generateCompletion(prompt: any, options?: any): Promise<any> {
    // Implementation
}
```

### 2. Validate Inputs

```typescript
async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    if (!prompt || prompt.trim() === '') {
        throw new LLMProviderError('Prompt cannot be empty', 'INVALID_PROMPT');
    }
    
    if (options?.temperature !== undefined && (options.temperature < 0 || options.temperature > 2)) {
        throw new LLMProviderError('Temperature must be between 0 and 2', 'INVALID_TEMPERATURE');
    }
    
    // Continue with request
}
```

### 3. Implement Retries for Transient Failures

```typescript
async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await this.makeRequest(prompt, options);
        } catch (error) {
            lastError = error;
            
            // Don't retry on auth errors
            if (error.code === 'AUTH_FAILED') {
                throw error;
            }
            
            // Exponential backoff
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    throw lastError!;
}
```

### 4. Track Costs Accurately

```typescript
private calculateCost(tokens: number, model: string): number {
    const pricing = {
        'model-small': { prompt: 0.0001, completion: 0.0002 },
        'model-large': { prompt: 0.001, completion: 0.002 },
    };

    const rates = pricing[model] || pricing['model-small'];
    return (tokens / 1000) * rates.completion;
}
```

### 5. Log Appropriately

```typescript
async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
    console.log(`[${this.name}] Generating completion for ${prompt.length} character prompt`);
    
    try {
        const response = await this.makeRequest(prompt, options);
        console.log(`[${this.name}] Completion generated: ${response.tokens.total} tokens, $${response.cost.toFixed(4)}`);
        return response;
    } catch (error) {
        console.error(`[${this.name}] Completion failed:`, error.message);
        throw error;
    }
}
```

## Semantic Versioning and Deprecation Policy

### Semantic Versioning Guarantee

The `ILLMProvider` interface follows **semantic versioning (semver)**:

- **Major version (X.0.0)**: Breaking changes to the interface
  - Removing methods
  - Changing method signatures
  - Changing return types
  
- **Minor version (0.X.0)**: Backward-compatible additions
  - Adding new optional methods
  - Adding new optional properties
  
- **Patch version (0.0.X)**: Bug fixes and documentation
  - No API changes

### Deprecation Policy

When methods or properties are deprecated:

1. **Announcement**: Deprecated items are marked with `@deprecated` JSDoc tag
2. **Grace Period**: Deprecated items remain functional for **at least 2 minor versions**
3. **Migration Guide**: Deprecation notices include migration instructions
4. **Removal**: Deprecated items are removed in the next major version

### Example Deprecation

```typescript
/**
 * @deprecated Use generateCompletion() instead. Will be removed in v2.0.0.
 * 
 * Migration:
 * ```typescript
 * // Old
 * const result = await provider.generate(prompt);
 * 
 * // New
 * const result = await provider.generateCompletion(prompt);
 * ```
 */
async generate(prompt: string): Promise<string> {
    const response = await this.generateCompletion(prompt);
    return response.text;
}
```

### Staying Up to Date

- Check the [CHANGELOG](../../CHANGELOG.md) for API changes
- Subscribe to release notifications
- Review deprecation warnings in your code
- Test your provider with new versions before upgrading

## Example Implementation

See [custom-provider-example.ts](../examples/custom-provider-example.ts) for a complete, working example of a custom LLM provider implementation.

## Support

For questions or issues:
- Open an issue on [GitHub](https://github.com/GoupilJeremy/ai-101-ts)
- Check the [API documentation](../api/index.html)
- Review existing provider implementations in `src/llm/providers/`

---

**Last Updated**: 2026-01-18  
**API Version**: 0.0.1
