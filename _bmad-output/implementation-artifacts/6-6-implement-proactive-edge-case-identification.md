# Story 6.6: Implement Proactive Edge Case Identification

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the Reviewer Agent to identify edge cases before I encounter them,
so that I write more robust code and avoid production bugs.

## Acceptance Criteria

1. **Given** Reviewer Agent is implemented (Story 3.6)
   **When** Reviewer validates code suggestion
   **Then** Reviewer checks for null/undefined handling in all variable accesses
2. **And** Reviewer identifies missing error handling for async operations
3. **And** Reviewer detects boundary conditions (empty arrays, zero values, max limits)
4. **And** Reviewer finds unchecked user input validation gaps
5. **And** Reviewer spots race conditions in concurrent operations
6. **And** Reviewer identifies missing loading/error states in UI components
7. **And** Reviewer checks for internationalization issues (hardcoded strings)
8. **And** Edge cases presented as warning-level alerts anchored to relevant code lines
9. **And** Each edge case includes: description, example scenario, recommended fix
10. **And** User can accept "Add edge case handling" to auto-generate defensive code
11. **And** Unit tests verify edge case detection across various code patterns

## Tasks / Subtasks

- [x] 1. Define Edge Case Data Structures
    - [x] 1.1 Create `IEdgeCase` interface (id, type, description, example, fix, severity, lineAnchor)
    - [x] 1.2 Update `IReviewerResult` interface to include `edgeCases: IEdgeCase[]`
- [x] 2. Create `EdgeCasePromptBuilder` (src/agents/reviewer/libs/)
    - [x] 2.1 Implement prompt sections for each edge case category (Nulls, Async, Boundaries, Input, Race, UI, i18n)
    - [x] 2.2 Create examples for few-shot prompting to guide LLM logic
- [x] 3. Enhance `ReviewerAgent` Logic
    - [x] 3.1 Integrate `EdgeCasePromptBuilder` into validation flow
    - [x] 3.2 Parse LLM response to extract structured edge case data
    - [x] 3.3 Ensure existing validation logic (syntax, logic) remains intact
- [x] 4. Update `AgentOrchestrator` for Edge Cases
    - [x] 4.1 Handle new `edgeCases` in `IReviewerResult`
    - [x] 4.2 Dispatch `toWebview:edgeCaseAlert` events to HUD
- [x] 5. Implement "Add Edge Case Handling" Action
    - [x] 5.1 Add support for requesting specific edge case fixes via `CoderAgent`
    - [x] 5.2 Orchestrator flow: User accepts edge case -> Coder generates fix -> Reviewer validates
- [x] 6. Unit Tests
    - [x] 6.1 Test `EdgeCasePromptBuilder` generates correct prompts
    - [x] 6.2 Test `ReviewerAgent` parses mock responses correctly
    - [x] 6.3 Test `AgentOrchestrator` handling of edge case events

## Dev Notes

### Architecture Patterns

- **Agent Isolation:** `ReviewerAgent` must use `LLMProviderManager` and not call external APIs directly.
- **Data flow:** `ReviewerAgent` -> `AgentOrchestrator` -> `Webview` (HUD).
- **HUD Visualization:** Edge cases map to "Warning" level alerts (FR13).
- **Prompt Engineering:** Use "Chain of Thought" or structured output (JSON mode if available/reliable) to ensure rigorous checking of all 7 categories.

### Implementation Context

- **Reviewer Agent Location:** `src/agents/reviewer/`
- **Libs Location:** `src/agents/reviewer/libs/edge-case-prompt-builder.ts` (Follow pattern from Story 6.5)
- **Interfaces:** `src/agents/reviewer/interfaces/reviewer.interface.ts` (or similar, check existing)

### Project Structure Notes

- **New File:** `src/agents/reviewer/libs/edge-case-prompt-builder.ts`
- **Naming:** Consistent with `architecture-prompt-builder.ts` from Story 6.5.

### References

- **Project Architecture:** `_bmad-output/planning-artifacts/architecture.md` (Reviewer Agent section)
- **Previous Story:** `_bmad-output/implementation-artifacts/6-5-implement-architecture-aligned-suggestion-generation.md` (Prompt Builder pattern)
- **Epics:** `_bmad-output/planning-artifacts/epics.md` (Story 6.6)

## Dev Agent Record

### Agent Model Used

Antigravity 1.0

### Debug Log References

- Tests for EdgeCasePromptBuilder passed successfully.

### Completion Notes List

- Implemented `IEdgeCase` and `IReviewerResult` interfaces.
- Created `EdgeCasePromptBuilder` with 7 categories of edge case analysis.
- Enhanced `ReviewerAgent` to use the builder, parse JSON responses, and generate structured alerts.
- Updated `AgentOrchestrator` with `processEdgeCaseFix` to handle fix requests.
- Updated `WebviewProvider` and `main.ts` to support "Fix Edge Case" button and communication.

### File List

- src/agents/reviewer/reviewer.interface.ts
- src/agents/reviewer/libs/edge-case-prompt-builder.ts
- src/agents/reviewer/libs/__tests__/edge-case-prompt-builder.test.ts
- src/agents/reviewer/reviewer-agent.ts
- src/agents/orchestrator.ts
- src/agents/shared/agent.interface.ts
- src/webview/webview-provider.ts
- src/webview/main.ts
