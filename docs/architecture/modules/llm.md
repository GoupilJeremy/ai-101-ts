# LLM Module

## Overview

The **LLM Module** (`src/llm/`) provides abstraction over LLM providers with caching, fallbacks, and extensibility.

## Module Structure

```
src/llm/
├── provider.interface.ts      # ILLMProvider interface
├── provider-manager.ts        # Registry and routing
├── openai/
│   ├── openai-provider.ts
│   └── __tests__/
├── anthropic/
│   ├── anthropic-provider.ts
│   └── __tests__/
└── cache/
    ├── hybrid-cache.ts
    ├── memory-cache.ts
    ├── file-cache.ts
    └── __tests__/
```

## ILLMProvider Interface

```typescript
export interface ILLMProvider {
  name: string;
  complete(request: LLMRequest): Promise<LLMResponse>;
  validateConfig(config: ProviderConfig): boolean;
}
```

## Components

### LLMProviderManager

**Purpose**: Manage provider registration, selection, and fallbacks.

**Key Methods**:
- `registerProvider(name: string, provider: ILLMProvider): void`
- `complete(request: LLMRequest): Promise<LLMResponse>`
- `setActiveProvider(name: string): void`

### OpenAIProvider

**Purpose**: Adapter for OpenAI API (GPT-4, GPT-3.5-turbo).

**Configuration**: API key from SecretStorage

### AnthropicProvider

**Purpose**: Adapter for Anthropic API (Claude 3).

**Configuration**: API key from SecretStorage

### HybridCache

**Purpose**: Two-tier caching (L1 memory + L2 file system).

**Target**: >50% cache hit rate

See [Hybrid Cache Strategy](../patterns/hybrid-cache.md) for details.

## Related Documentation

- [Hybrid Cache Strategy](../patterns/hybrid-cache.md)
- [Modules Overview](./overview.md)
