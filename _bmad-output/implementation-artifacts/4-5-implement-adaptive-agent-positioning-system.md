# Story 4.5: Implement Adaptive Agent Positioning System

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want agents to position near relevant code context automatically,
so that I see which code the AI is analyzing or modifying.

## Acceptance Criteria

1.  **Given** Spatial anti-collision is implemented
2.  **When** I implement code-anchored positioning for agents
3.  **Then** Agents can be anchored to specific line numbers in the active editor
4.  **And** ContextAgent appears near the top (imports) or current selection
5.  **And** ArchitectAgent appears near class/function definitions being analyzed
6.  **And** CoderAgent appears near the target insertion/modification line
7.  **And** Agents move smoothly to new positions (500ms transition)
8.  **And** If code context is out of viewport, agents dock to screen edge with indicator
9.  **And** Unit tests verify positioning logic for different line anchors

## Tasks / Subtasks

- [x] Task 1: Anchor Metadata (AC: 3, 4, 5, 6)
  - [x] 1.1: Update `IAgentState` to include `anchorLine` optional field
  - [x] 1.2: Update `AgentOrchestrator` to set `anchorLine` during execution

- [x] Task 2: Positioning Engine (AC: 7, 8)
  - [x] 2.1: Update `src/webview/main.ts` to support line-to-viewport coordinate mapping
  - [x] 2.2: Implement docking logic for off-screen anchors

- [x] Task 3: Verification (AC: 9)
  - [x] 3.1: Test positioning with various file lengths and scroll positions
  - [x] 3.2: Verify that anti-collision still works in conjunction with anchoring

## Dev Notes

- **Line Mapping**: Use the `relativeY` from `SpatialManager` as a base, or send more detailed visible range info.
- **Docking**: If `anchorLine` < `visibleRange.start`, dock to top. If > `visibleRange.end`, dock to bottom.

### Project Structure Notes

- Modified file: `src/agents/shared/agent.interface.ts`
- Modified file: `src/webview/main.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.5]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
