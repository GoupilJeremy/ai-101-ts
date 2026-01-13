# Story 3.6: Implement Reviewer Agent for Proactive Risk Identification

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a Reviewer Agent that validates suggestions before display,
so that developers see risks, edge cases, and security concerns proactively.

## Acceptance Criteria

1.  **Given** IAgent interface, AgentOrchestrator, and CoderAgent are implemented
2.  **When** I create `src/agents/reviewer/reviewer-agent.ts`
3.  **Then** ReviewerAgent implements IAgent interface
4.  **And** `execute()` method receives generated code suggestion
5.  **And** Agent validates: syntax correctness, edge cases, security risks (FR38, FR39)
6.  **And** Security validation checks: SQL injection, XSS, command injection, hardcoded secrets
7.  **And** Edge case identification checks: null/undefined handling, error conditions, boundary conditions
8.  **And** Response includes: validation result, identified risks, recommendations
9.  **And** Agent state updates to "thinking" during review
10. **And** Agent state updates to "alert" if critical issues found
11. **And** Agent state updates to "success" if no issues found
12. **And** Unit tests verify review logic with various code scenarios

## Tasks / Subtasks

- [x] Task 1: Basic Structure (AC: 2, 3)
  - [x] 1.1: Create `src/agents/reviewer/reviewer-agent.ts`
  - [x] 1.2: Implement basic `IAgent` methods

- [x] Task 2: Review Logic (AC: 4, 5, 6, 7, 8)
  - [x] 2.1: Implement `execute()` to call LLM for security and quality review
  - [x] 2.2: Define prompt for security, edge cases, and syntax validation
  - [x] 2.3: Parse LLM output for risks and recommendations

- [x] Task 3: States & Alerts (AC: 9, 10, 11)
  - [x] 3.1: Update agent states during processing (handling 'alert' state)
  - [x] 3.2: Format response with clear risk/recommendation split

- [x] Task 4: Testing (AC: 12)
  - [x] 4.1: Create `src/agents/reviewer/__tests__/reviewer-agent.test.ts`
  - [x] 4.2: Verify review results for various vulnerability patterns

## Dev Notes

- **Prompting**: Reviewer needs a "hostile" yet helpful persona. It should actively try to find bugs or security holes.
- **Alert State**: If critical risks are found (high confidence, high severity), the state should be 'alert'.
- **Structure**: Return a clear list of identified issues.

### Project Structure Notes

- New file: `src/agents/reviewer/reviewer-agent.ts`
- New test file: `src/agents/reviewer/__tests__/reviewer-agent.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.6]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
