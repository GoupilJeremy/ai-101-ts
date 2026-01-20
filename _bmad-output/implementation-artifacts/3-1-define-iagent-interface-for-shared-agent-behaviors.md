# Story 3.1: Define IAgent Interface for Shared Agent Behaviors

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a common interface for all AI agents,
so that agents have consistent APIs and can be orchestrated uniformly.

## Acceptance Criteria

1.  **Given** The project structure exists
2.  **When** I create `src/agents/shared/agent.interface.ts`
3.  **Then** IAgent interface defines:
    - `readonly name: string` property (agent identifier)
    - `readonly displayName: string` property (user-visible name)
    - `readonly icon: string` property (emoji or icon identifier)
    - `initialize(llmManager: LLMProviderManager): void` method
    - `execute(request: IAgentRequest): Promise<IAgentResponse>` method
    - `getState(): IAgentState` method
4.  **And** IAgentRequest interface includes: prompt, context, options
5.  **And** IAgentResponse interface includes: result, reasoning, alternatives, confidence
6.  **And** IAgentState interface includes: status (idle/thinking/working/alert/success), currentTask, lastUpdate
7.  **And** AgentType enum includes: 'architect', 'coder', 'reviewer', 'context'
8.  **And** All interfaces use TypeScript strict mode
9.  **And** Interfaces are documented with JSDoc

## Tasks / Subtasks

- [x] Task 1: Protocol Definition (AC: 4, 5, 6, 7, 8)
  - [x] 1.1: Define `AgentType` enum/type
  - [x] 1.2: Define `IAgentState`, `IAgentRequest`, and `IAgentResponse` interfaces

- [x] Task 2: Core Interface (AC: 3, 9)
  - [x] 2.1: Define `IAgent` interface in `src/agents/shared/agent.interface.ts`
  - [x] 2.2: Add JSDoc documentation for all properties and methods

## Dev Notes

- **Strict Mode**: Ensure types are exhaustive and non-nullable where appropriate.
- **AgentType**: Use a union type or enum as requested.
- **File Location**: `src/agents/shared/agent.interface.ts`.

### Project Structure Notes

- New file: `src/agents/shared/agent.interface.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
