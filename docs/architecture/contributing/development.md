# Development Workflow

## Project Structure

```
ai-101-ts/
├── src/                  # Source code
│   ├── agents/          # AI agents
│   ├── llm/             # LLM providers
│   ├── state/           # State management
│   ├── webview/         # HUD UI
│   └── extension.ts     # Entry point
├── docs/                # Documentation
├── package.json         # Extension manifest
└── tsconfig.json        # TypeScript config
```

## Coding Standards

### TypeScript Strict Mode

All code must comply with TypeScript strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### ESLint

Run linting before committing:

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Prettier

Code formatting is enforced:

```bash
npm run format
```

## Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Interfaces**: `IPascalCase` (with I prefix)
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

## Import Ordering

1. External dependencies
2. VSCode imports
3. Internal modules (alphabetical)

```typescript
import * as vscode from 'vscode';
import { IAgent } from './agents/agent.interface';
import { LLMProviderManager } from './llm/provider-manager';
```

## Documentation Requirements

### JSDoc Comments

All public APIs must have JSDoc:

```typescript
/**
 * Execute the agent with given context
 * @param context - Agent execution context
 * @returns Agent execution result
 */
async execute(context: AgentContext): Promise<AgentResult> {
  // ...
}
```

## Related Documentation

- [Code Style Guide](./code-style.md)
- [Pull Request Process](./pull-requests.md)
