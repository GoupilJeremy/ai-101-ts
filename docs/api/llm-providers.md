# LLM Providers API Reference

This guide covers the `ILLMProvider` interface for creating custom LLM providers in Suika.

## Overview

The `ILLMProvider` interface allows you to integrate any Large Language Model (LLM) into Suika. Whether you're using a custom API, an on-premise model, or a new cloud provider, this interface provides everything you need.

## Interface Definition

```typescript
interface ILLMProvider {
  /** Unique identifier for this provider */
  readonly name: string;
  
  /** Generate a completion from the LLM */
  generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse>;
  
  /** Estimate token count for given text */
  estimateTokens(text: string): Promise<number>;
  
  /** Get information about a specific model */
  getModelInfo(model: string): IModelInfo;
  
  /** Check if the provider is currently available */
  isAvailable(): Promise<boolean>;
}
```

## Method Reference

### `generateCompletion(prompt, options?)`

Generates a completion from the LLM.

**Parameters:**
- `prompt: string` - The input prompt to send to the model
- `options?: ILLMOptions` - Optional configuration for the request

**Returns:** `Promise<ILLMResponse>`

**Example:**
```typescript
const response = await provider.generateCompletion(
  "Explain the benefits of TypeScript",
  {
    model: "gpt-4",
    maxTokens: 500,
    temperature: 0.7
  }
);
console.log(response.content);
```

### `estimateTokens(text)`

Estimates the number of tokens in the given text.

**Parameters:**
- `text: string` - The text to tokenize

**Returns:** `Promise<number>` - Estimated token count

**Example:**
```typescript
const tokens = await provider.estimateTokens("Hello, world!");
console.log(`Estimated tokens: ${tokens}`);
```

### `getModelInfo(model)`

Returns information about a specific model.

**Parameters:**
- `model: string` - Model identifier

**Returns:** `IModelInfo`

**Example:**
```typescript
const info = provider.getModelInfo("gpt-4");
console.log(`Max tokens: ${info.maxTokens}`);
console.log(`Cost per 1K tokens: $${info.costPer1kTokens}`);
```

### `isAvailable()`

Checks if the provider is currently available.

**Returns:** `Promise<boolean>`

**Example:**
```typescript
if (await provider.isAvailable()) {
  // Provider is ready to use
}
```

## Complete Implementation Example

Here's a complete example of a custom LLM provider:

```typescript
import { ILLMProvider, ILLMOptions, ILLMResponse, IModelInfo } from 'suika';

export class MyCustomProvider implements ILLMProvider {
  readonly name = 'my-custom-provider';
  
  private apiKey: string;
  private baseUrl: string;
  
  constructor(apiKey: string, baseUrl = 'https://api.myservice.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }
  
  async generateCompletion(
    prompt: string, 
    options?: ILLMOptions
  ): Promise<ILLMResponse> {
    const response = await fetch(`${this.baseUrl}/v1/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model: options?.model ?? 'default',
        max_tokens: options?.maxTokens ?? 1000,
        temperature: options?.temperature ?? 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.choices[0].text,
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      finishReason: data.choices[0].finish_reason
    };
  }
  
  async estimateTokens(text: string): Promise<number> {
    // Simple estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
  
  getModelInfo(model: string): IModelInfo {
    const models: Record<string, IModelInfo> = {
      'default': {
        id: 'default',
        name: 'Default Model',
        maxTokens: 4096,
        costPer1kTokens: 0.002
      },
      'fast': {
        id: 'fast',
        name: 'Fast Model',
        maxTokens: 2048,
        costPer1kTokens: 0.001
      }
    };
    
    return models[model] ?? models['default'];
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

## Registering Your Provider

Once you've implemented `ILLMProvider`, register it with Suika:

```typescript
import * as vscode from 'vscode';
import { IAI101API } from 'suika';
import { MyCustomProvider } from './my-custom-provider';

export async function activate(context: vscode.ExtensionContext) {
  // Get Suika API
  const suika = vscode.extensions.getExtension('GoupilJeremy.suika');
  if (!suika) {
    vscode.window.showErrorMessage('Suika extension not found');
    return;
  }
  
  const api = suika.exports as IAI101API;
  
  // Create and register provider
  const apiKey = await context.secrets.get('myProvider.apiKey');
  if (apiKey) {
    const provider = new MyCustomProvider(apiKey);
    api.registerLLMProvider('my-custom-provider', provider);
    
    vscode.window.showInformationMessage('Custom LLM provider registered!');
  }
}
```

## Integration with LLMProviderManager

Your provider integrates seamlessly with Suika's provider management:

- **Automatic fallback**: If your provider fails, Suika falls back to other registered providers
- **Cost tracking**: Token usage is tracked for budget enforcement
- **Caching**: Responses are cached automatically (L1 memory + L2 file system)
- **Rate limiting**: Respects configured rate limits

## Testing Your Provider

### Unit Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { MyCustomProvider } from './my-custom-provider';

describe('MyCustomProvider', () => {
  it('should generate completions', async () => {
    const provider = new MyCustomProvider('test-key');
    
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ text: 'Hello!', finish_reason: 'stop' }],
        model: 'default',
        usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 }
      })
    });
    
    const response = await provider.generateCompletion('Say hello');
    
    expect(response.content).toBe('Hello!');
    expect(response.usage.totalTokens).toBe(7);
  });
  
  it('should estimate tokens', async () => {
    const provider = new MyCustomProvider('test-key');
    const tokens = await provider.estimateTokens('Hello, world!');
    
    expect(tokens).toBeGreaterThan(0);
  });
  
  it('should check availability', async () => {
    const provider = new MyCustomProvider('test-key');
    
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    
    const available = await provider.isAvailable();
    expect(available).toBe(true);
  });
});
```

## Best Practices

1. **Error Handling**: Always handle network errors and API failures gracefully
2. **Token Estimation**: Implement accurate token estimation for your model
3. **Rate Limiting**: Respect API rate limits in your implementation
4. **Secrets Management**: Never hardcode API keys; use VSCode SecretStorage
5. **Timeout Handling**: Implement request timeouts for reliability

## Related Documentation

- [Getting Started](./getting-started.md)
- [Events API](./events.md)
- [Configuration API](./configuration.md)
- [Troubleshooting](./troubleshooting.md)
