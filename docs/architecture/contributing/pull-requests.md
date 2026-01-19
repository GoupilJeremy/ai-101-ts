# Pull Request Process

## Branch Naming

Use descriptive branch names:

```
feature/agent-caching
fix/state-sync-bug
docs/architecture-update
```

## Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat(agents): add caching to coder agent
fix(state): resolve postMessage race condition
docs(architecture): update ADR for cache strategy
```

## PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows TypeScript strict mode
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] Tests added/updated (`npm test`)
- [ ] Test coverage >70% maintained
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow Conventional Commits
- [ ] PR description explains changes

## PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Related Issues
Closes #123
```

## Review Process

1. **Automated Checks**: CI runs tests, linting, coverage
2. **Code Review**: At least one approval required
3. **Merge**: Squash and merge to main

## Related Documentation

- [Development Workflow](./development.md)
- [Code Style Guide](./code-style.md)
