# Story 5.2: Implement Learning Mode with Pedagogical Explanations

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want Learning Mode to provide detailed explanations, pattern names, and documentation links,
so that I understand not just what the AI suggests, but why and how it works.

## Acceptance Criteria

1.  **Given** Mode system infrastructure is implemented
2.  **When** Learning Mode is active
3.  **Then** All agent responses include pedagogical explanations section
4.  **And** Code suggestions annotated with pattern names (e.g., "Singleton Pattern", "Factory")
5.  **And** Explanations include: what the code does, why this approach, alternatives considered
6.  **And** Inline documentation links to relevant resources
7.  **And** Reasoning steps shown in expanded form in the HUD
8.  **And** Alerts include "Learn More" buttons linking to educational content
9.  **And** Unit tests verify Learning Mode behavior changes

## Tasks / Subtasks

- [x] Task 1: Agent Logic (AC: 3, 4, 5, 6)
  - [x] 1.1: Update `CoderAgent` and `ArchitectAgent` to check `ModeManager.getCurrentMode()`
  - [x] 1.2: Enhance LLM prompts in Learning Mode to request pedagogical depth

- [x] Task 2: HUD Rendering (AC: 7, 8)
  - [x] 2.1: Update `src/webview/main.ts` to render expanded reasoning for Learning Mode
  - [x] 2.2: Add "Learn More" link support in the HUD alert component

- [x] Task 3: Verification (AC: 9)
  - [x] 3.1: Verify agent responses contain educational content when mode is active
  - [x] 3.2: Verify links are clickable and open in browser

## Dev Notes

- **Prompting**: We need to inject a "Learning Instruction" block into the system prompt when `AgentMode.Learning` is active.
- **Pattern Detection**: The LLM should be asked to identify design patterns used in the code.

### Project Structure Notes

- Modified file: `src/agents/coder/coder-agent.ts`
- Modified file: `src/agents/architect/architect-agent.ts`
- Modified file: `src/webview/main.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
