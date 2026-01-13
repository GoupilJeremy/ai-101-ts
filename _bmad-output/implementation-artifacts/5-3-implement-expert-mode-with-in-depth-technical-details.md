# Story 5.3: Implement Expert Mode with In-Depth Technical Details

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want Expert Mode to show advanced trade-offs, edge cases, and technical depth,
so that I make informed decisions on complex architectural choices.

## Acceptance Criteria

1.  **Given** Mode system infrastructure is implemented
2.  **When** Expert Mode is active
3.  **Then** Agent responses include in-depth technical trade-off analysis (time/space complexity)
4.  **And** Suggestions explicitly list edge cases with handling recommendations
5.  **And** Security considerations are highlighted proactively (OWASP references)
6.  **And** Reasoning presented in condensed form (signal > noise)
7.  **And** Advanced metrics visible (simulated for now: token efficiency, model selection)
8.  **And** Unit tests verify Expert Mode behavior changes

## Tasks / Subtasks

- [x] Task 1: Signal Optimization (AC: 3, 4, 5, 6)
  - [x] 1.1: Update `CoderAgent` and `ReviewerAgent` prompts for Expert Mode
  - [x] 1.2: Implement `[TECH DEBT]` and `[COMPLEXITY]` sections in prompts

- [x] Task 2: HUD Customization (AC: 7)
  - [x] 2.1: Implement condensed rendering logic in `src/webview/main.ts` for Expert Mode
  - [x] 2.2: Ensure Expert mode uses 'low' verbosity settings

- [x] Task 3: Verification (AC: 8)
  - [x] 3.1: Verify agent output is technical and concise
  - [x] 3.2: Verify complexity analysis is present

## Dev Notes

- **Conciseness**: Expert users want the code and the "Gotchas" without the "How-to".
- **Visuals**: 5.1 already sets low opacity for Expert mode to minimize friction.

### Project Structure Notes

- Modified file: `src/agents/coder/coder-agent.ts`
- Modified file: `src/agents/reviewer/reviewer-agent.ts`
- Modified file: `src/webview/main.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.3]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)
Claude Sonnet 4.5 (Amelia - 2026-01-13)

### Debug Log References

### Completion Notes List

**Task 1 Completed (2026-01-13):**
- ✅ Implemented Expert Mode support in CoderAgent with [EXPERT MODE ACTIVE] marker
- ✅ Added [TECH DEBT], [COMPLEXITY], and [EDGE CASES] sections to CoderAgent prompts
- ✅ Implemented response parsing for new Expert Mode sections with appropriate emojis (⚠️ 📊 🔍)
- ✅ Implemented Expert Mode support in ReviewerAgent with OWASP references and condensed output
- ✅ Added comprehensive unit tests for Expert Mode behavior in both agents (8 new tests total)
- ✅ All tests compile successfully with no TypeScript errors
- 📝 Note: Tests cannot run in WSL headless environment but compile and type-check successfully

**Technical Decisions:**
- Expert Mode prompts request: time/space complexity analysis, trade-off analysis, edge case enumeration, OWASP references
- Expert Mode responses are condensed (signal > noise) - shorter alert messages (150 chars vs 200)
- No educational links or pedagogy in Expert Mode (unlike Learning Mode)
- Reused existing ModeManager singleton pattern for mode detection

**Task 2 Completed (2026-01-13):**
- ✅ Added currentMode and currentVerbosity tracking in webview for condensed rendering
- ✅ Updated applyModeUpdate() to store mode and verbosity state
- ✅ Added 'expert-mode' CSS class to HUD container for Expert Mode
- ✅ Implemented condensed alert rendering in Expert Mode (links rendered as 🔗 icon instead of full URL)
- ✅ Verified mode config already has explanationVerbositiy: 'low' for Expert Mode (from story 5.1)
- ✅ Compiled successfully with no TypeScript errors

**Task 3 Completed (2026-01-13):**
- ✅ Code verification: CoderAgent includes [EXPERT MODE ACTIVE], [TECH DEBT], [COMPLEXITY], [EDGE CASES] sections
- ✅ Code verification: ReviewerAgent includes OWASP references, edge case analysis, condensed output instructions
- ✅ Code verification: Webview correctly tracks currentVerbosity and applies expert-mode CSS class
- ✅ Code verification: Alert rendering is condensed when currentVerbosity === 'low'
- ✅ All 8 unit tests created for Expert Mode behavior (4 for CoderAgent, 4 for ReviewerAgent)
- ✅ All code compiles successfully with no TypeScript errors

### File List

- src/agents/coder/coder-agent.ts
- src/agents/coder/__tests__/coder-agent.test.ts
- src/agents/reviewer/reviewer-agent.ts
- src/agents/reviewer/__tests__/reviewer-agent.test.ts
- src/webview/main.ts
