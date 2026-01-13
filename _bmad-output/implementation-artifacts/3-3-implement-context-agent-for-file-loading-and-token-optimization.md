# Story 3.3: Implement Context Agent for File Loading and Token Optimization

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a Context Agent that intelligently loads relevant files,
so that AI suggestions are contextually aware while staying within token limits.

## Acceptance Criteria

1.  **Given** IAgent interface and AgentOrchestrator are implemented
2.  **When** I create `src/agents/context/context-agent.ts`
3.  **Then** ContextAgent implements IAgent interface
4.  **And** `execute()` method loads relevant project files based on request
5.  **And** File selection uses heuristics: current file, imports, recent files, related files
6.  **And** Token estimation prevents context from exceeding LLM limits (FR35)
7.  **And** Visible files are tracked and exposed via `getLoadedFiles()` (FR36)
8.  **And** Agent state updates to "working" during file loading
9.  **And** Agent state updates to "success" after context loaded
10. **And** File content is returned in IAgentResponse
11. **And** Unit tests verify file loading and token optimization logic

## Tasks / Subtasks

- [x] Task 1: Basic Structure (AC: 2, 3)
  - [x] 1.1: Create `src/agents/context/context-agent.ts`
  - [x] 1.2: Implement basic `IAgent` methods

- [x] Task 2: File Discovery (AC: 4, 5, 7)
  - [x] 2.1: Implement logic to find relevant files (current, imports, etc.) using VSCode API
  - [x] 2.2: Implement `getLoadedFiles()` to track context

- [x] Task 3: Token Optimization (AC: 6)
  - [x] 3.1: Integrate `js-tiktoken` for accurate token count
  - [x] 3.2: Implement truncation/summarization logic to stay within budget

- [x] Task 4: Integration & States (AC: 8, 9, 10)
  - [x] 4.1: Update agent states during processing
  - [x] 4.2: Ensure `execute()` returns consolidated file content

- [x] Task 5: Testing (AC: 11)
  - [x] 5.1: Create `src/agents/context/__tests__/context-agent.test.ts`
  - [x] 5.2: Verify discovery and optimization logic

## Dev Notes

- **VSCode API**: Use `vscode.workspace.findFiles` and `vscode.workspace.openTextDocument`.
- **Token Budget**: Respect `tokenBudget` from `ConfigurationManager`.
- **Heuristics**: Start with simple import parsing (regex) and recent file tracking.

### Project Structure Notes

- New file: `src/agents/context/context-agent.ts`
- New test file: `src/agents/context/__tests__/context-agent.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
