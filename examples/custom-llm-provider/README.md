# Custom LLM Provider Example

This example demonstrates how to implement and register a custom LLM provider with AI-101.

## What This Example Shows

- ✅ Implementing the `ILLMProvider` interface
- ✅ Handling completion requests
- ✅ Token estimation
- ✅ Model information and capabilities
- ✅ Availability checking
- ✅ Registering the provider with AI-101

## Files

- `example-provider.ts` - Complete ILLMProvider implementation
- `package.json` - Minimal dependencies
- `README.md` - This file

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the example:**
   ```bash
   npm run build
   ```

3. **Use in your extension:**
   ```typescript
   import { ExampleCustomProvider } from './example-provider';
   
   const provider = new ExampleCustomProvider();
   api.registerLLMProvider('my-provider', provider);
   ```

## Implementation Guide

### Step 1: Implement ILLMProvider

```typescript
export class MyProvider implements ILLMProvider {
    readonly name = 'my-provider';
    
    async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
        // Call your LLM API here
    }
    
    estimateTokens(text: string): number {
        // Implement token counting
    }
    
    getModelInfo(model: string): IModelInfo {
        // Return model capabilities
    }
    
    async isAvailable(): Promise<boolean> {
        // Check if provider is ready
    }
}
```

### Step 2: Register with AI-101

```typescript
const ai101 = vscode.extensions.getExtension('GoupilJeremy.ai-101-ts');
const api: IAI101API = ai101.exports;

api.registerLLMProvider('my-provider', new MyProvider());
```

### Step 3: Configure in Settings

Users can then select your provider in AI-101 settings:

```json
{
    "ai101.llm.provider": "my-provider"
}
```

## Real-World Implementation Tips

### API Key Management

```typescript
async isAvailable(): Promise<boolean> {
    const apiKey = await context.secrets.get('my-provider.apiKey');
    return !!apiKey;
}
```

### Error Handling

```typescript
async generateCompletion(prompt: string): Promise<ILLMResponse> {
    try {
        const response = await this.callAPI(prompt);
        return this.parseResponse(response);
    } catch (error) {
        if (error.statusCode === 429) {
            throw new Error('Rate limit exceeded');
        }
        throw error;
    }
}
```

### Token Estimation

For accurate token counting, use your LLM's tokenizer:

```typescript
import { encode } from 'gpt-tokenizer'; // Example

estimateTokens(text: string): number {
    return encode(text).length;
}
```

## Testing Your Provider

```typescript
const provider = new MyProvider();

// Test availability
const available = await provider.isAvailable();
console.log('Provider available:', available);

// Test completion
const response = await provider.generateCompletion('Hello, world!');
console.log('Response:', response.content);

// Test token estimation
const tokens = provider.estimateTokens('Test text');
console.log('Estimated tokens:', tokens);
```

## Common Issues

### "Provider already registered"

Each provider name must be unique. If you see this error, choose a different name or unregister the existing provider first.

### "Invalid provider implementation"

Ensure your class implements all required methods from `ILLMProvider`:
- `generateCompletion()`
- `estimateTokens()`
- `getModelInfo()`
- `isAvailable()`

## Next Steps

- See `../event-subscription/` to listen to when your provider is used
- See `../configuration-api/` to add custom settings for your provider
- Read the [full API documentation](../../docs/api/)
