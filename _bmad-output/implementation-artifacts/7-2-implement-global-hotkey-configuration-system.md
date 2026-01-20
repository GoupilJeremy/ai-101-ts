# Story 7.2: Implement Global Hotkey Configuration System

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to configure hotkeys for common actions without conflicts,
so that I can integrate the extension into my existing keyboard workflow.

## Acceptance Criteria

1. **Configurable Hotkeys Listed**: Support hotkeys for:
    - Toggle HUD Visibility
    - Toggle Focus/Do-Not-Disturb Mode
    - Force Agent States (for debugging/override)
    - Accept Suggestion
    - Reject Suggestion
2. **Standard VSCode Integration**: Hotkeys are registered via VSCode keybindings API and visible/editable in the standard VSCode Keyboard Shortcuts editor.
3. **Platform Conventions**: Default keybindings respect platform conventions (Cmd on Mac, Ctrl on Windows/Linux).
4. **Conflict Avoidance**: Default hotkeys avoid common VSCode built-in conflicts.
5. **Assistive Tech Friendly**: Hotkeys are configurable to avoid conflicts with screen readers.
6. **Immediate Application**: Hotkey changes apply immediately without reload.
7. **Command Palette Integration**: All hotkey actions are also available via Command Palette ("Suika: ...").

## Tasks / Subtasks

- [x] Task 1: Define Commands and Keybindings in `package.json` (AC: 1, 2, 3, 4)
  - [x] Define `ai-101.toggleHUD`
  - [x] Define `ai-101.toggleFocusMode`
  - [x] Define `ai-101.acceptSuggestion`
  - [x] Define `ai-101.rejectSuggestion`
  - [x] Define `ai-101.forceAgentState` (with arguments if possible, or sub-commands)
  - [x] Configure `keybindings` section with `mac`, `win`, `linux` specifics.
  - [x] Add `when` clauses if context-specific (e.g., only when suggestion is active).

- [x] Task 2: Implement Command Handlers (AC: 6, 7)
  - [x] Create `src/commands` registry/manager pattern if not exists, or add to `extension.ts`.
  - [x] Implement handler for `toggleHUD`: Updates state, sends message to webview.
  - [x] Implement handler for `toggleFocusMode`: Updates state, sends message to webview.
  - [x] Implement handler for `accept/reject`: Triggers `AgentOrchestrator` action and/or Webview update. *Note: Acceptance logic interacts with current active suggestion.*

- [x] Task 3: Integrate with AgentOrchestrator/State (AC: 1)
  - [x] Ensure Command Handlers call appropriate methods on `ExtensionStateManager` or `AgentOrchestrator`.
  - [x] Verify `forceAgentState` updates the state machine correctly.

- [x] Task 4: Documentation (AC: 2)
  - [x] Update `README.md` or `docs/usage.md` with default hotkey list.

- [x] Task 5: Unit Tests (AC: 2)
  - [x] Verify commands are registered in `extension.ts`.
  - [x] Verify command execution triggers expected service methods (mocked).

## Dev Notes

- **Architecture Compliance**:
    - Use `vscode.commands.registerCommand`.
    - Do NOT hardcode listeners for keys; use `package.json` contributions.
    - Handlers should delegate to `ExtensionStateManager` or `AgentOrchestrator`.
    - Webview actions (Accept/Reject) initiated from Extension (Command) -> PostMessage to Webview -> Webview simulates click or executes logic. *Alternative*: Extension acts as source of truth, updates logical state, Webview just renders result. Follow established **Dual State Pattern** (Backend is source of truth).

- **Project Structure**:
    - Place command registrations in `src/commands/` if creating modules, or keep clean in `extension.ts` delegating to controllers.
    - **Decision**: Recommendation to use a `CommandManager` or `registerCommands.ts` helper if list grows, to keep `extension.ts` `activate` function clean.

- **Testing**:
    - Test `subscription` additions.
    - Test context/when clause logic if applicable (manual verification often needed for keybinding contexts).

### Project Structure Notes

- Alignment with unified project structure.
- `src/commands/` directory might need creation if not present.

### References

- [VSCode Keybindings Contribution Point](https://code.visualstudio.com/api/references/contribution-points#contributes.keybindings)
- [VSCode Commands API](https://code.visualstudio.com/api/references/vscode-api#commands)
- `_bmad-output/planning-artifacts/epics.md` (Story 7.2)
- `_bmad-output/project-context.md` (Architecture Rules)

## Dev Agent Record

### Agent Model Used

Antigravity (simulated)

### Debug Log References

None

### Completion Notes List

- Implemented global hotkey system with configurable keybindings in `package.json`.
- Added `toggleHUD` command to show/hide the HUD from the extension side and sync with webview.
- Added `forceAgentState` debug command for manual state overrides.
- Integrated `acceptSuggestion` and `rejectSuggestion` with existing suggestion logic.
- Updated `ExtensionStateManager` to track `hudVisible` state.
- Documentation added to `README.md`.
- Unit tests implemented in `src/test/hotkey-commands.test.ts`.
- All default hotkeys tested for conflict avoidance (Focus mode changed to Avoid Global Search conflict).
- Status updated to `review`.
- Aligned with VSCode native patterns.

### File List

- `package.json`
- `src/extension.ts`
- `src/state/extension-state-manager.ts`
- `src/commands/toggle-hud.ts`
- `src/commands/force-agent-state.ts`
- `src/test/hotkey-commands.test.ts`
- `src/webview/index.css`
- `src/webview/main.ts`
- `README.md`
