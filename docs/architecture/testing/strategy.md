# Testing Strategy

## Overview

AI-101 uses a comprehensive testing strategy with >70% code coverage target (NFR17).

## Test Frameworks

### Unit Tests: Vitest

**Why Vitest**: Fast, modern, TypeScript-first testing framework.

**Location**: Co-located `__tests__/` directories

**Run**: `npm test`

### Integration Tests: @vscode/test-electron

**Why**: Official VSCode extension testing framework.

**Location**: `src/test/integration/`

**Run**: `npm run test:integration`

## Test Coverage Target

**Target**: >70% code coverage (NFR17)

**Measured**: Lines, branches, functions, statements

**Report**: `npm run test:coverage`

## Testing Patterns

### Unit Testing

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('CoderAgent', () => {
  it('should generate code suggestion', async () => {
    const mockLLM = vi.fn().mockResolvedValue({ text: 'code' });
    const agent = new CoderAgent(mockLLM);
    
    const result = await agent.execute(mockContext);
    
    expect(result.code).toBeDefined();
    expect(mockLLM).toHaveBeenCalledOnce();
  });
});
```

### Mocking VSCode APIs

```typescript
vi.mock('vscode', () => ({
  window: {
    showInformationMessage: vi.fn()
  },
  workspace: {
    getConfiguration: vi.fn().mockReturnValue({
      get: vi.fn()
    })
  }
}));
```

### Mocking LLM Providers

```typescript
const mockProvider: ILLMProvider = {
  name: 'mock',
  async complete(request) {
    return { text: 'mocked response', usage: {...} };
  },
  validateConfig() {
    return true;
  }
};
```

## Test Organization

```
src/
├── agents/
│   ├── coder/
│   │   ├── coder-agent.ts
│   │   └── __tests__/
│   │       └── coder-agent.test.ts
```

## Related Documentation

- [Testing Patterns](./patterns.md)
- [Modules Overview](../modules/overview.md)
