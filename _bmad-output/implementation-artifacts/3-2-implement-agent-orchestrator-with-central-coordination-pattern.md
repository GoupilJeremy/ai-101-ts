# Story 3.2: Implement Agent Orchestrator with Central Coordination Pattern

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a central orchestrator that coordinates all agents,
so that agents never call each other directly (Orchestrator Central Pattern from architecture).

## Acceptance Criteria

1.  **Given** IAgent interface is defined
2.  **When** I create `src/agents/orchestrator.ts`
3.  **Then** AgentOrchestrator class manages references to all 4 agents
4.  **And** Orchestrator initializes with: LLMProviderManager, ExtensionStateManager, Logger
5.  **And** `processUserRequest(request)` method coordinates agent execution sequence
6.  **And** Typical flow: Context → Architect (if needed) → Coder → Reviewer
7.  **And** Orchestrator updates agent states via ExtensionStateManager during coordination
8.  **And** Agents NEVER call each other directly (only orchestrator coordinates)
9.  **And** Orchestrator implements `shouldInvolveArchitect()` logic for smart routing
10. **And** Orchestrator implements `synthesizeResponse()` to combine agent outputs
11. **And** Orchestrator handles agent failures gracefully (try/catch with fallbacks)
12. **And** Unit tests verify orchestration flow and agent coordination

## Tasks / Subtasks

- [x] Task 1: Foundation (AC: 2, 3, 4)
  - [x] 1.1: Create `src/agents/orchestrator.ts`
  - [x] 1.2: Implement Singleton pattern and initialization

- [x] Task 2: Core Orchestration (AC: 5, 6, 8, 9, 10, 11)
  - [x] 2.1: Implement `processUserRequest()` with the defined sequence
  - [x] 2.2: Implement `shouldInvolveArchitect()` logic
  - [x] 2.3: Implement `synthesizeResponse()` for combining results
  - [x] 2.4: Implement error handling and graceful failures

- [x] Task 3: State Integration (AC: 7)
  - [x] 3.1: Integrate with `ExtensionStateManager` (Story 3.7 dependency)
  - [x] 3.2: Update agent states during the orchestration flow

- [x] Task 4: Testing (AC: 12)
  - [x] 4.1: Create `src/agents/__tests__/orchestrator.test.ts`
  - [x] 4.2: Verify coordination flow and error handling

## Dev Notes

- **ExtensionStateManager**: If not yet implemented, I will create a base class or interface to avoid blocking.
- **Agent Registry**: Orchestrator should hold instances of all agents.
- **Smart Routing**: Use prompt analysis or simple heuristics for `shouldInvolveArchitect()`.

### Project Structure Notes

- New file: `src/agents/orchestrator.ts`
- New test file: `src/agents/__tests__/orchestrator.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
