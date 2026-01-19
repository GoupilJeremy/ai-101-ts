# Code Style Guide

## TypeScript

### Strict Mode Compliance

All code must pass TypeScript strict mode checks.

### Type Annotations

Prefer explicit types for public APIs:

```typescript
// ✅ Good
function processRequest(request: UserRequest): Promise<Result> {
  // ...
}

// ❌ Avoid
function processRequest(request) {
  // ...
}
```

### Interfaces vs Types

- Use `interface` for object shapes
- Use `type` for unions, intersections, primitives

```typescript
// ✅ Good
interface AgentState {
  status: 'idle' | 'active' | 'error';
}

type AgentStatus = 'idle' | 'active' | 'error';
```

## ESLint Configuration

Key rules enforced:

- `no-unused-vars`: No unused variables
- `no-console`: Use logger instead of console
- `@typescript-eslint/explicit-function-return-type`: Explicit return types

## File Structure

```typescript
// 1. Imports
import * as vscode from 'vscode';
import { IAgent } from './agent.interface';

// 2. Interfaces/Types
export interface AgentConfig {
  // ...
}

// 3. Constants
const DEFAULT_TIMEOUT = 5000;

// 4. Class/Function Implementations
export class CoderAgent implements IAgent {
  // ...
}

// 5. Exports
export { CoderAgent };
```

## Import Ordering

1. External dependencies
2. VSCode imports
3. Internal modules (alphabetical)

## Documentation

### JSDoc for Public APIs

```typescript
/**
 * Execute the agent with given context
 * @param context - Agent execution context
 * @returns Promise resolving to agent result
 * @throws {Error} If execution fails
 */
async execute(context: AgentContext): Promise<AgentResult> {
  // ...
}
```

## Related Documentation

- [Development Workflow](./development.md)
- [Pull Request Process](./pull-requests.md)
