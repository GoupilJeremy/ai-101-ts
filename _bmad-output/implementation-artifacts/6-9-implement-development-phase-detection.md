# Story 6.9: Implement Development Phase Detection

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the system to automatically detect my current development phase (Prototype, Production, Debug) and adapt its suggestions,
so that I get relevant assistance without manual configuration (e.g., stricter checks in production, speed in prototype).

## Acceptance Criteria

1. **Given** various project states
   **When** the extension activates or conditions change
   **Then** the `PhaseDetector` correctly identifies the phase:
   - **Debug**: Active VSCode debug session is running.
   - **Production**: `package.json` version >= 1.0.0 OR presence of `Dockerfile`/`.github/workflows`.
   - **Prototype**: Default state if not Debug or Production.

2. **When** the phase changes
   **Then** the `ExtensionStateManager` updates the `currentPhase` state
   **And** triggers a broadcast to the Webview.

3. **Given** the Vital Signs Bar
   **Then** it displays a visual indicator of the current phase (e.g., distinct icon or color accent).

4. **Given** I am in **Debug Phase**
   **When** I ask for code suggestions
   **Then** agents prioritize logging, error catching, and diagnostic output.

5. **Given** I am in **Production Phase**
   **When** I ask for code suggestions
   **Then** agents prioritize security, performance, strict typing, and documentation.

6. **Given** I am in **Prototype Phase**
   **When** I ask for code suggestions
   **Then** agents prioritize speed, conciseness, and scaffolding.

7. **Given** the intelligent detection
   **When** I want to override
   **Then** I can explicitly set the phase via Command Palette (`AI 101: Set Development Phase`).

## Tasks / Subtasks

- [x] 1. Define Phase Data Structures
  - [x] 1.1 Create `DevelopmentPhase` type ('prototype' | 'production' | 'debug') in `src/shared/types.ts` (or `src/state/types.ts`).
  - [x] 1.2 Update `IExtensionState` to include `currentPhase: DevelopmentPhase`.

- [x] 2. Implement Phase Detector Service
  - [x] 2.1 Create `src/services/phase-detector.ts`.
  - [x] 2.2 Implement `detectPhase()` logic leveraging `vscode.debug.activeDebugSession` and workspace file analysis.
  - [x] 2.3 Implement event listeners for `onDidChangeActiveDebugSession` and file system watchers (optional/lightweight for `package.json`).

- [x] 3. Update State Management
  - [x] 3.1 Update `ExtensionStateManager` to handle phase updates.
  - [x] 3.2 Ensure phase is synced to Webview via `toWebview:phaseUpdate` (or logical extension of `vitalSignsUpdate`).

- [x] 4. Agent Adaptation
  - [x] 4.1 Update `AgentOrchestrator` to inject `currentPhase` into agent prompts.
  - [x] 4.2 Update system prompts (or `AgentUtils.generateSystemPrompt`) to include phase-specific instructions.

- [x] 5. UI Updates
  - [x] 5.1 Update `VitalSignsBar` component (`src/webview/components/vital-signs-bar.js`) to display phase.
  - [x] 5.2 Add specific icons/styles for each phase.

- [x] 6. User Override
  - [x] 6.1 Register command `ai101.setPhase`.
  - [x] 6.2 Allow manual override to persist (session only or workspace settings?). Session only for now is fine, or workspace state.

- [x] 7. Testing
  - [x] 7.1 Unit test `PhaseDetector` logic (mocking VSCode API).
  - [x] 7.2 Verify Prompt injection includes phase context.

## Dev Notes

- **Phase Detection Logic**:
  - Check `vscode.debug.activeDebugSession` first (Highest priority).
  - If no debug, check Workspace.
  - `fs.search` for `Dockerfile`, `k8s`, `.github` -> Production.
  - `package.json` version check.
- **Location**: `src/services/` is a new folder concept. Ensure it's added to `esbuild` or compatible with `src/utils/` if preferred. Architecture pattern mentioned `src/utils` or `src/agents/shared`. Let's use `src/services` and treat it as a Core Service like `ExtensionStateManager`.

### References

- **PRD FR41**: "The system must detect and adapt to development phases (prototype, production, debug)"
- **VSCode API**: `vscode.debug` namespace.

## Dev Agent Record

### Agent Model Used
Antigravity 1.0

### Debug Log References
- Analysis of PRD FR41 and Architecture decisions.
- Designed `PhaseDetector` service pattern.
- Integrated with Agent Orchestrator prompt strategy.

### Completion Notes List
- Ready for implementation.

### File List
- `src/services/phase-detector.ts` (New)
- `src/state/types.ts` (New)
- `src/state/extension-state-manager.ts`
- `src/agents/orchestrator.ts`
- `src/agents/shared/phase-prompt-builder.ts` (New)
- `src/agents/coder/coder-agent.ts`
- `src/agents/reviewer/reviewer-agent.ts`
- `src/agents/architect/architect-agent.ts`
- `src/webview/components/vital-signs-bar.js`
- `src/webview/main.ts`
- `src/webview/index.css`
- `src/commands/set-phase.ts` (New)
- `src/extension.ts`
- `package.json`
- `src/services/__tests__/phase-detector.test.ts` (New)
- `src/agents/coder/__tests__/coder-agent.test.ts` (Updated)
