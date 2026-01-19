# ADR-001: Orchestrator Central Pattern

## Status
accepted

## Context
We needed a way to coordinate multiple AI agents (Context, Architect, Coder, Reviewer) in a predictable, debuggable manner. Two main approaches were considered:

1. **Event Bus Pattern**: Agents communicate via pub/sub events
2. **Central Orchestrator**: Single coordinator with direct method calls

## Decision
We chose the Central Orchestrator pattern with a single `AgentOrchestrator` class that coordinates all agent interactions through direct method calls.

## Consequences

### Positive
- **Predictable execution order**: Context → Architect → Coder → Reviewer is guaranteed
- **Easy debugging**: Single entry point for breakpoints and logging
- **Centralized error handling**: All errors caught in one place
- **Explicit state transitions**: Clear visibility into agent states
- **Testability**: Easy to mock and test coordination logic

### Negative
- **Coupling**: Orchestrator knows about all agents
- **Scalability**: Adding new agents requires orchestrator changes
- **Less flexible**: Cannot easily run agents in parallel or independently

### Neutral
- Suitable for our sequential agent workflow
- Trade-off between flexibility and predictability

## Related
- [Orchestrator Central Pattern](../patterns/orchestrator-central.md)
- [Agents Module](../modules/agents.md)
