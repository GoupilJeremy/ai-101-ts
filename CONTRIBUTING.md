# Contributing to AI-101-ts

## Debugging Tools

### Force Agent State Command
The extension provides a powerful debugging command to force agents into specific states. This is useful for testing visual transitions, animations, and state synchronization without requiring real LLM calls.

**Command ID**: `ai-101-ts.forceAgentState`
**Hotkey**: `Ctrl+Shift+Alt+S` (`Cmd+Shift+Alt+S` on macOS)

#### Usage

1. **Interactive Mode**:
   Run the command and select the agent and target state from the list.
   - Agents: Architect, Coder, Reviewer, Context
   - States: Idle, Thinking, Working, Alert, Success

2. **Programmatic Mode**:
   You can call this command programmatically via the VSCode API or custom keybindings with arguments:
   ```typescript
   vscode.commands.executeCommand('ai-101-ts.forceAgentState', 'architect', 'thinking', 'Analyzing project structure');
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
