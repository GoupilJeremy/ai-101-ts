# Story 7.8: Implement Force Agent State Commands for Development and Debug

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** developer and contributor debugging the extension,
**I want** to force specific agents into specific states via VSCode commands,
**So that** I can verify visual transitions, animations, and state synchronization logic without needing to trigger complex real LLM workflows.

## Acceptance Criteria

1. **Given** The extension is active
2. **When** I run the command `AI 101: Force Agent State` (ID: `ai-101.forceAgentState`)
3. **And** I select an agent (Architect, Coder, Reviewer, Context)
4. **And** I select a target state (Idle, Thinking, Working, Alert, Success)
5. **Then** The backend `ExtensionStateManager` updates the agent's state immediately
6. **And** The state update is synchronized to the Webview via `postMessage`
7. **And** The Webview agent component immediately transitions visually to the new state
8. **And** The transition plays the correct animation (e.g., pulse for thinking, stroke for working)
9. **And** The command is exposed in the Command Palette
10. **And** The command accepts arguments programmatically for keybinding integration: `executeCommand('ai-101.forceAgentState', 'architect', 'thinking')`

## Tasks / Subtasks

- [x] **Task 1: Implement Command Handler**
  - [x] Create `src/commands/force-agent-state.command.ts`
  - [x] Implement handler function that accepts `agentId` and `state` args
  - [x] Add logic to prompt user (`vscode.window.showQuickPick`) if args are missing
  - [x] Integrate with `ExtensionStateManager` to apply state updates
- [x] **Task 2: Command Registration & Configuration**
  - [x] Register command in `package.json` under `contributes.commands`
  - [x] Add category "AI 101 Debug" for better organization
  - [x] Register command implementation in `src/extension.ts`
  - [x] Support programmatic arguments in registration
- [x] **Task 3: Integration & Validation**
  - [x] Verify state updates propagate to Webview correctly
  - [x] Verify visual transitions in Webview (manual test prepared via command)
  - [x] Ensure command handles invalid agent IDs or states gracefully
- [x] **Task 4: Documentation & Testing**
  - [x] Add unit tests for command handler in `src/commands/__tests__/force-agent-state.command.test.ts`
  - [x] Document command usage in `CONTRIBUTING.md` (Debugging section)
  - [x] Add "Debug" section to `README.md` listing these tools

## Dev Notes

### Technical Requirements
- **Command ID**: `ai-101.forceAgentState`
- **Arguments**:
  - `agentId`: `'architect' | 'coder' | 'reviewer' | 'context'`
  - `state`: `'idle' | 'thinking' | 'working' | 'alert' | 'success'`
- **State Source of Truth**: Remember `ExtensionStateManager` (Backend) is the ONLY source of truth. Do not try to hack the Webview directly. Update the backend, let the sync system handle the rest.

### Architecture Compliance
- **Pattern**: Command Pattern. Separate command logic into its own file in `src/commands/`, do not inline in `extension.ts`.
- **Dependencies**: Command handler will need dependency injection of `ExtensionStateManager`.
- **User Interface**: Use `vscode.window.showQuickPick` for interactive selection when arguments are not provided.

### Project Structure Notes
- New file: `src/commands/force-agent-state.command.ts`
- Test file: `src/commands/__tests__/force-agent-state.command.test.ts`

### References
- [Project Context - Architecture Decisions](_bmad-output/project-context.md#architecture-decisions-from-architecturemd)
- [Epic 7 Details](_bmad-output/planning-artifacts/epics.md#epic-7-user-interactions--commands)

## Dev Agent Record

### Agent Model Used

PLACEHOLDER_M18

### Debug Log References

### Completion Notes List

- Enhanced `forceAgentState` command to support both interactive and programmatic modes.
- Renamed command file to `force-agent-state.command.ts` for architectural consistency.
- Updated `CONTRIBUTING.md` and `README.md` with debugging tool documentation.
- Added unit tests for the command handler.
- Improved command categorization in Command Palette under "AI 101 Debug".

### File List

- `src/commands/force-agent-state.command.ts` (New/Renamed)
- `src/extension.ts` (Modified)
- `package.json` (Modified)
- `src/commands/__tests__/force-agent-state.command.test.ts` (New)
- `CONTRIBUTING.md` (New)
- `README.md` (Modified)
