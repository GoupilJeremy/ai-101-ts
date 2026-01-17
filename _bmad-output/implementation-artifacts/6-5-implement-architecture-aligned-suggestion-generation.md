# Story 6.5: Implement Architecture-Aligned Suggestion Generation

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want code suggestions that follow my project's architectural patterns automatically,
so that AI-generated code integrates seamlessly without refactoring.

## Acceptance Criteria

1. **Given** Architect Agent has detected project architecture patterns
   **When** Coder Agent generates code suggestions
   **Then** Suggestions follow detected component structure conventions
2. **And** Suggestions use detected state management approach consistently
3. **And** Suggestions match API calling patterns found in existing code
4. **And** Suggestions follow detected naming conventions (camelCase, snake_case, etc.)
5. **And** Suggestions use same import/export style as existing code
6. **And** Suggestions respect detected file organization (co-located tests, separate dirs, etc.)
7. **And** Architectural alignment explained in suggestion reasoning
8. **And** If pattern unclear, Coder Agent asks Orchestrator to clarify via Architect
9. **And** Alignment confidence score shown: "Architecture match: 95%"
10. **And** User can request alternative approaches: "Show solution using different pattern"
11. **And** Unit tests verify suggestion alignment with various architectural patterns

## Tasks / Subtasks

- [x] 1. Update `AgentOrchestrator` to coordinate Architecture context (AC: 1, 8)
    - [x] 1.1 Retrieve cached architecture from `ArchitectAgent` (using `analyzeProject` or getter)
    - [x] 1.2 Pass architecture to `CoderAgent.generate`
- [x] 2. Update `CoderAgent` to accept `IProjectArchitecture` (AC: 1)
    - [x] 2.1 Update `ICoderOptions` or generation configuration interface
    - [x] 2.2 Update `generate` method signature to accept architecture context
- [x] 3. Create `ArchitecturePromptBuilder` in `src/agents/coder/libs/` (AC: 1, 2, 3, 4, 5, 6)
    - [x] 3.1 Implement formatters for Tech Stack, File Structure, State, API
    - [x] 3.2 Construct prompt sections based on detected patterns
- [x] 4. Integrate Prompt Builder into `CoderAgent` (AC: 7, 9)
    - [x] 4.1 Inject architecture rules into LLM system prompt
    - [x] 4.2 Parse reasoning to include architectural alignment notes
    - [x] 4.3 Implement confidence score calculation (heuristic or LLM-provided)
- [x] 5. Implement "Alternative Approach" mechanism (AC: 10)
    - [x] 5.1 Add flag to bypass architecture prompts when requested
- [x] 6. Add Unit Tests (AC: 11)
    - [x] 6.1 Test `ArchitecturePromptBuilder` output for different defined architectures
    - [x] 6.2 Verify `AgentOrchestrator` correctly wires Architect output to Coder input
    - [x] 6.3 Verify `CoderAgent` prompt inclusion

## Dev Notes

- **Architecture/Orchestration Pattern:**
  - `AgentOrchestrator` (src/agents/agent-orchestrator.ts) is the central coordinator.
  - `ArchitectAgent` (src/agents/architect/architect-agent.ts) holds the `IProjectArchitecture` (from Story 6.4).
  - `CoderAgent` (src/agents/coder/coder-agent.ts) consumes this data.
  - **Rule:** Agents MUST NOT call each other. Orchestrator must fetch from Architect and pass to Coder.

- **Prompt Engineering:**
  - Structure the prompt to clearly separate "Project Rules" from "User Request".
  - Should include key components like: "Detected Framework: React", "State Management: Redux", "Style: kebab-case files".
  - Use `src/agents/architect/interfaces/project-architecture.interface.ts` as the source of truth for types.

- **Dependencies:**
  - Relies on completion of Story 6.4 (`ProjectPatternDetector`).
  - `ArchitecturePromptBuilder` should be a pure class/function for easy testing.

### Project Structure Notes

- **New File:** `src/agents/coder/libs/architecture-prompt-builder.ts`
- **Naming:** standard kebab-case.
- **Location:** `src/agents/coder/libs/` is appropriate for helper logic specific to Coder.

### References

- `_bmad-output/planning-artifacts/epics.md` - Story 6.5
- `_bmad-output/implementation-artifacts/6-4-implement-project-architecture-pattern-detection.md` - Pre-requisite
- `_bmad-output/project-context.md` - Core project rules

## Dev Agent Record

### Agent Model Used
{{agent_model_name_version}}

### Debug Log References

### Completion Notes List
- Implemented `ArchitecturePromptBuilder` to format `IProjectArchitecture` into system prompts
- Updated `AgentOrchestrator` to retrieve architecture from `ArchitectAgent` and pass it to `CoderAgent` via new `data` field in `IAgentRequest`
- Updated `CoderAgent` to inject architecture prompt info when available
- Implemented confidence score parsing from LLM response
- Added comprehensive unit tests for builder and integration

### File List
- src/agents/shared/agent.interface.ts
- src/agents/orchestrator.ts
- src/agents/coder/coder-agent.ts
- src/agents/coder/libs/architecture-prompt-builder.ts
- src/agents/__tests__/orchestrator-architecture.test.ts
- src/agents/coder/libs/__tests__/architecture-prompt-builder.test.ts
- src/agents/coder/__tests__/coder-agent.test.ts
