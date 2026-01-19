# Testing Workflow

## Running Tests

### Unit Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

### Integration Tests

```bash
npm run test:integration
```

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle

1. **Red**: Write failing test

```typescript
it('should generate code suggestion', async () => {
  const agent = new CoderAgent(mockLLM);
  const result = await agent.execute(context);
  expect(result.code).toBeDefined();
});
```

2. **Green**: Implement minimal code to pass

```typescript
async execute(context: AgentContext): Promise<AgentResult> {
  return { code: 'implementation' };
}
```

3. **Refactor**: Improve code while keeping tests green

## Coverage Report

Generate coverage report:

```bash
npm run test:coverage
```

View report: `coverage/index.html`

**Target**: >70% coverage (NFR17)

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { CoderAgent } from '../coder-agent';

describe('CoderAgent', () => {
  it('should call LLM provider', async () => {
    const mockLLM = vi.fn().mockResolvedValue({ text: 'code' });
    const agent = new CoderAgent(mockLLM);
    
    await agent.execute(mockContext);
    
    expect(mockLLM).toHaveBeenCalledOnce();
  });
});
```

### Integration Test Example

```typescript
import * as vscode from 'vscode';
import { AgentOrchestrator } from '../agents/orchestrator';

suite('Agent Integration Tests', () => {
  test('should process user request', async () => {
    const orchestrator = new AgentOrchestrator();
    await orchestrator.processUserRequest(mockRequest);
    // Assert state changes
  });
});
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch

CI checks:
- ✅ All tests pass
- ✅ Coverage >70%
- ✅ Linting passes

## Related Documentation

- [Testing Strategy](../testing/strategy.md)
- [Testing Patterns](../testing/patterns.md)
- [Build System](./build.md)
