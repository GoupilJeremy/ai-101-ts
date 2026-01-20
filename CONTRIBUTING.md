# Contributing to Suika-ts

## Debugging Tools

### Force Agent State Command
The extension provides a powerful debugging command to force agents into specific states. This is useful for testing visual transitions, animations, and state synchronization without requiring real LLM calls.

**Command ID**: `suika.forceAgentState`
**Hotkey**: `Ctrl+Shift+Alt+S` (`Cmd+Shift+Alt+S` on macOS)

#### Usage

1. **Interactive Mode**:
   Run the command and select the agent and target state from the list.
   - Agents: Architect, Coder, Reviewer, Context
   - States: Idle, Thinking, Working, Alert, Success

2. **Programmatic Mode**:
   You can call this command programmatically via the VSCode API or custom keybindings with arguments:
   ```typescript
   vscode.commands.executeCommand('suika.forceAgentState', 'architect', 'thinking', 'Analyzing project structure');
   ```

**Arguments**:
1. `agentId` (string): `'architect' | 'coder' | 'reviewer' | 'context'`
2. `state` (string): `'idle' | 'thinking' | 'working' | 'success' | 'error'`
3. `task` (string, optional): A text description of the current task.

---

## Architectural Principles
- **Backend as Source of Truth**: The `ExtensionStateManager` in the Node.js context is the only source of truth.
- **PostMessage Sync**: State updates are automatically synchronized to the Webview via `postMessage`.
- **Vanilla JavaScript Webview**: The Webview uses Vanilla JS (ES6 classes) for high-performance 60fps animations.
- **Conventional Commits**: We use [Conventional Commits](https://www.conventionalcommits.org/) to automate versioning and changelog generation.

---

## Commit Message Conventions

We follow the Angular commit convention. Commits must be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Tools:
The project uses `commitlint` and `husky` to enforce these conventions. If your commit message is invalid, the commit will be rejected.

---

## Changelog Generation

The `CHANGELOG.md` is automatically maintained using `standard-version` and a custom script for contributor recognition.

### How to generate/update:
1. Ensure all your changes are committed using conventional commits.
2. Run the following command to bump the version and update the changelog:
   ```bash
   npm run changelog
   ```
3. To generate the first release changelog:
   ```bash
   npm run changelog -- --first-release
   ```
   
### Contributor Recognition:
The changelog includes a "Thank You" section that automatically lists all contributors based on the git history. Attribution is also added to individual change entries if the commit message includes it.
