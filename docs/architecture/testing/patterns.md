# Testing Patterns

## Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
it('should update agent state', () => {
  // Arrange
  const stateManager = new ExtensionStateManager();
  const newState = { status: 'active' };
  
  // Act
  stateManager.updateAgentState('coder', newState);
  
  // Assert
  expect(stateManager.getAgentState('coder')).toEqual(newState);
});
```

### 2. Mock External Dependencies

```typescript
const mockLLM = {
  complete: vi.fn().mockResolvedValue({ text: 'response' })
};

const agent = new CoderAgent(mockLLM);
```

### 3. Test Error Paths

```typescript
it('should handle API errors', async () => {
  mockLLM.complete.mockRejectedValue(new Error('API Error'));
  
  await expect(agent.execute(context)).rejects.toThrow('API Error');
});
```

## Mocking Patterns

### Mock LLM Providers

```typescript
const createMockLLMProvider = (): ILLMProvider => ({
  name: 'mock',
  async complete(request) {
    return { text: `Mock response for: ${request.prompt}` };
  },
  validateConfig: () => true
});
```

### Mock VSCode APIs

```typescript
vi.mock('vscode', () => ({
  window: {
    showInformationMessage: vi.fn(),
    createWebviewPanel: vi.fn()
  }
}));
```

### Mock Webview Interactions

```typescript
const mockWebview = {
  postMessage: vi.fn(),
  onDidReceiveMessage: vi.fn()
};
```

## Related Documentation

- [Testing Strategy](./strategy.md)
