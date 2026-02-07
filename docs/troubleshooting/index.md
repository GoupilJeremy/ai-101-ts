# Troubleshooting Knowledge Base Index

This directory contains troubleshooting articles for the AI-101 VSCode extension.

## Article Structure

Each article follows this YAML frontmatter format:

```yaml
---
id: article-id
title: Article Title
category: Performance | Connectivity | DisplayIssues | APIKeyProblems | Configuration | Agents | LLMProviders
symptoms:
  - keyword1
  - keyword2
errorCodes:
  - AI101-XXX-001
relatedDocs:
  - docs/path/to/doc.md
---
```

## Available Articles

### Performance Issues
- [performance-slow-ui.md](./en/performance-slow-ui.md) - UI lag and 60fps issues
- [performance-high-memory.md](./en/performance-high-memory.md) - Memory usage problems

### Connectivity Issues
- [connectivity-llm-timeout.md](./en/connectivity-llm-timeout.md) - LLM API timeouts
- [connectivity-network-errors.md](./en/connectivity-network-errors.md) - General network issues

### Display Issues
- [display-hud-not-showing.md](./en/display-hud-not-showing.md) - HUD visibility problems
- [display-blank-webview.md](./en/display-blank-webview.md) - Blank screen issues

### API Key Problems
- [api-key-invalid.md](./en/api-key-invalid.md) - API key configuration errors
- [api-key-not-found.md](./en/api-key-not-found.md) - Missing API key setup

### Configuration Issues
- [config-preset-issues.md](./en/config-preset-issues.md) - Configuration preset problems

### Agent Issues
- [agents-not-responding.md](./en/agents-not-responding.md) - Agent state issues

## Localization

- `en/` - English articles (default)
- `fr/` - French articles (fallback to English if not available)
