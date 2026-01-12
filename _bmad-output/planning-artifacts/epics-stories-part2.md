## Epic 2: LLM Provider Integration & Caching

**Goal:** Developers can connect to multiple LLM providers (OpenAI, Anthropic) with intelligent caching that reduces costs (<$0.10/session) and improves performance (>50% cache hit rate).

### Story 2.1: Define ILLMProvider Interface with Adapter Pattern

As a developer,
I want a common interface for all LLM providers,
So that the system can work with multiple providers interchangeably without code changes.

**Acceptance Criteria:**

**Given** The project structure exists
**When** I create `src/llm/provider.interface.ts`
**Then** ILLMProvider interface defines:
- `readonly name: string` property
- `generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse>` method
- `estimateTokens(text: string): number` method
- `getModelInfo(model: string): IModelInfo` method
- `isAvailable(): Promise<boolean>` method
**And** ILLMOptions interface includes: model, temperature, maxTokens, timeout
**And** ILLMResponse interface includes: text, tokens, model, finishReason, cost
**And** All interfaces use TypeScript strict mode with no `any` types
**And** JSDoc comments document all interface members with examples
**And** Interfaces are exported for extensibility (FR60 - custom providers)

---

### Story 2.2: Implement OpenAI Provider with Error Handling

As a developer,
I want an OpenAI provider implementation,
So that users can connect to OpenAI GPT models for AI suggestions.

**Acceptance Criteria:**

**Given** ILLMProvider interface is defined
**When** I create `src/llm/providers/openai-provider.ts`
**Then** OpenAIProvider implements ILLMProvider interface
**And** Provider uses official OpenAI SDK for API calls
**And** API key is retrieved from SecretStorage (never hardcoded)
**And** `generateCompletion()` calls OpenAI Chat Completions API
**And** Supported models include: gpt-4, gpt-4-turbo, gpt-3.5-turbo
**And** Token estimation uses tiktoken library for accuracy
**And** API errors are caught and wrapped in `LLMProviderError` with context
**And** Rate limit errors (429) are retryable with exponential backoff
**And** Network timeouts default to 30 seconds (configurable)
**And** All requests use HTTPS/TLS (NFR15 - secure communications)
**And** Unit tests mock OpenAI API responses

---

### Story 2.3: Implement Anthropic Claude Provider with Error Handling

As a developer,
I want an Anthropic Claude provider implementation,
So that users can connect to Claude models as an alternative to OpenAI.

**Acceptance Criteria:**

**Given** ILLMProvider interface is defined
**When** I create `src/llm/providers/anthropic-provider.ts`
**Then** AnthropicProvider implements ILLMProvider interface
**And** Provider uses official Anthropic SDK for API calls
**And** API key is retrieved from SecretStorage (never hardcoded)
**And** `generateCompletion()` calls Anthropic Messages API
**And** Supported models include: claude-3-opus, claude-3-sonnet, claude-3-haiku
**And** Token estimation approximates using character count / 4
**And** API errors are caught and wrapped in `LLMProviderError` with context
**And** Rate limit errors (429) are retryable with exponential backoff
**And** Network timeouts default to 30 seconds (configurable)
**And** All requests use HTTPS/TLS (NFR15 - secure communications)
**And** Unit tests mock Anthropic API responses

---

### Story 2.4: Implement LLM Provider Manager with Registry and Fallbacks

As a developer,
I want a provider manager that registers providers and handles automatic fallbacks,
So that the system remains available even when primary providers fail.

**Acceptance Criteria:**

**Given** OpenAI and Anthropic providers are implemented
**When** I create `src/llm/provider-manager.ts`
**Then** LLMProviderManager maintains Map<string, ILLMProvider> registry
**And** `registerProvider(name, provider)` adds provider to registry
**And** `getProvider(name)` retrieves provider by name
**And** `callLLM(agent, prompt, options)` routes calls to configured provider
**And** Provider selection is configurable per agent type (FR27)
**And** If primary provider fails, manager tries fallback providers in order (FR29)
**And** Fallback attempts are logged with structured context
**And** If all providers fail, throw comprehensive error with all attempt details
**And** Provider availability is checked before calls via `isAvailable()`
**And** Unit tests cover provider registration and fallback scenarios

---

### Story 2.5: Implement Hybrid LLM Cache (L1 Memory + L2 File System)

As a developer,
I want a two-tier cache system for LLM responses,
So that repeated prompts are answered from cache achieving >50% hit rate and <$0.10/session cost.

**Acceptance Criteria:**

**Given** LLM providers are implemented
**When** I create `src/llm/cache.ts` with HybridLLMCache class
**Then** L1 cache uses in-memory LRU with max 100 entries (configurable)
**And** L1 cache provides <1ms response time for hits
**And** L2 cache uses file system in `.cache/` directory for persistence
**And** L2 cache provides <10ms response time for hits
**And** Cache keys include: agent type + prompt hash + context snippet (first 100 chars)
**And** Cache TTL is 7 days by default (configurable per user)
**And** `get(cacheKey)` checks L1 first, then L2, returns null if miss
**And** `set(cacheKey, response)` writes to both L1 and L2
**And** Cache invalidation occurs on configuration changes (model, temperature)
**And** Cache statistics track: hit rate, miss rate, cost saved
**And** Cache hit rate target is >50% (NFR24)
**And** Unit tests verify L1 and L2 cache behavior

---

### Story 2.6: Integrate Cache with Provider Manager

As a developer,
I want all LLM calls to go through the cache layer automatically,
So that cost optimization is transparent and requires no explicit caching logic in agents.

**Acceptance Criteria:**

**Given** HybridLLMCache and LLMProviderManager are implemented
**When** I modify `provider-manager.ts` to integrate cache
**Then** `callLLM()` method checks cache before calling provider
**And** Cache key generation includes all relevant context (agent, prompt, model, options)
**And** On cache hit: response returned immediately with <10ms latency
**And** On cache miss: provider called, response cached, then returned
**And** Cache statistics are updated on every hit/miss
**And** Token estimation happens before provider call for budget checking
**And** Cache layer is transparent to calling agents (no code changes needed)
**And** Unit tests verify cache integration with provider calls

---

### Story 2.7: Implement Rate Limiting and Budget Enforcement

As a developer,
I want per-user rate limiting and budget configuration,
So that users can control LLM costs and prevent unexpected charges.

**Acceptance Criteria:**

**Given** LLM provider integration is complete
**When** I create `src/llm/rate-limiter.ts`
**Then** Rate limiter tracks tokens consumed per session
**And** Budget limits are configurable in settings (tokens/session, cost/session)
**And** Default budget is set to prevent >$0.10/session (NFR23)
**And** `checkBudget()` method throws `BudgetExceededError` when limit reached
**And** Budget checks occur before every LLM call (after cache miss)
**And** Remaining budget is visible to users in Vital Signs Bar (linked to FR30)
**And** Budget resets at session start (extension activation)
**And** Users receive warning notification at 80% budget consumption
**And** Unit tests verify budget enforcement logic

---

### Story 2.8: Implement Real-Time Cost Tracking and Display

As a developer,
I want real-time LLM cost tracking visible to users,
So that users understand the cost impact of their AI usage session.

**Acceptance Criteria:**

**Given** LLM provider integration and rate limiting are complete
**When** I create `src/llm/cost-tracker.ts`
**Then** CostTracker accumulates cost per LLM call based on token count and provider pricing
**And** Pricing data for OpenAI and Anthropic models is configured
**And** Cost calculation includes: prompt tokens × input_price + completion tokens × output_price
**And** Current session cost is accessible via `getCurrentSessionCost()`
**And** Cost is formatted for display: "$0.05" with 2 decimal precision
**And** Cost tracking integrates with Vital Signs Bar for display (FR30)
**And** Cache hits show $0.00 cost (demonstrating cache value)
**And** Unit tests verify cost calculations for different models

---

## Epic 3: AI Agent System & Orchestration

**Goal:** Developers see 4 distinct AI agents (Architect, Coder, Reviewer, Context) collaborating intelligently with visible states and complete reasoning transparency.

### Story 3.1: Define IAgent Interface for Shared Agent Behaviors

As a developer,
I want a common interface for all AI agents,
So that agents have consistent APIs and can be orchestrated uniformly.

**Acceptance Criteria:**

**Given** The project structure exists
**When** I create `src/agents/shared/agent.interface.ts`
**Then** IAgent interface defines:
- `readonly name: string` property (agent identifier)
- `readonly displayName: string` property (user-visible name)
- `readonly icon: string` property (emoji or icon identifier)
- `initialize(llmManager: LLMProviderManager): void` method
- `execute(request: IAgentRequest): Promise<IAgentResponse>` method
- `getState(): IAgentState` method
**And** IAgentRequest interface includes: prompt, context, options
**And** IAgentResponse interface includes: result, reasoning, alternatives, confidence
**And** IAgentState interface includes: status (idle/thinking/working/alert/success), currentTask, lastUpdate
**And** AgentType enum includes: 'architect', 'coder', 'reviewer', 'context'
**And** All interfaces use TypeScript strict mode
**And** Interfaces are documented with JSDoc

---

### Story 3.2: Implement Agent Orchestrator with Central Coordination Pattern

As a developer,
I want a central orchestrator that coordinates all agents,
So that agents never call each other directly (Orchestrator Central Pattern from architecture).

**Acceptance Criteria:**

**Given** IAgent interface is defined
**When** I create `src/agents/orchestrator.ts`
**Then** AgentOrchestrator class manages references to all 4 agents
**And** Orchestrator initializes with: LLMProviderManager, ExtensionStateManager, Logger
**And** `processUserRequest(request)` method coordinates agent execution sequence
**And** Typical flow: Context → Architect (if needed) → Coder → Reviewer
**And** Orchestrator updates agent states via ExtensionStateManager during coordination
**And** Agents NEVER call each other directly (only orchestrator coordinates)
**And** Orchestrator implements `shouldInvolveArchitect()` logic for smart routing
**And** Orchestrator implements `synthesizeResponse()` to combine agent outputs
**And** Orchestrator handles agent failures gracefully (try/catch with fallbacks)
**And** Unit tests verify orchestration flow and agent coordination

---

### Story 3.3: Implement Context Agent for File Loading and Token Optimization

As a developer,
I want a Context Agent that intelligently loads relevant files,
So that AI suggestions are contextually aware while staying within token limits.

**Acceptance Criteria:**

**Given** IAgent interface and AgentOrchestrator are implemented
**When** I create `src/agents/context/context-agent.ts`
**Then** ContextAgent implements IAgent interface
**And** `execute()` method loads relevant project files based on request
**And** File selection uses heuristics: current file, imports, recent files, related files
**And** Token estimation prevents context from exceeding LLM limits (FR35)
**And** Visible files are tracked and exposed via `getLoadedFiles()` (FR36)
**And** Agent state updates to "working" during file loading
**And** Agent state updates to "success" after context loaded
**And** File content is returned in IAgentResponse
**And** Unit tests verify file loading and token optimization logic

---

### Story 3.4: Implement Architect Agent for Project Analysis

As a developer,
I want an Architect Agent that analyzes project structure and provides architectural guidance,
So that AI suggestions align with existing patterns and architecture.

**Acceptance Criteria:**

**Given** IAgent interface, AgentOrchestrator, and ContextAgent are implemented
**When** I create `src/agents/architect/architect-agent.ts`
**Then** ArchitectAgent implements IAgent interface
**And** Agent analyzes project architecture from loaded context (FR37)
**And** Agent identifies patterns: component structure, state management, API conventions
**And** `execute()` method receives context and returns architectural analysis
**And** Response includes: architecture patterns detected, alignment recommendations
**And** Agent state updates to "thinking" during analysis
**And** Agent state updates to "success" after analysis complete
**And** Reasoning is structured and exposed for transparency (FR5)
**And** Unit tests verify architectural analysis logic with mock projects

---

### Story 3.5: Implement Coder Agent for Code Generation

As a developer,
I want a Coder Agent that generates code suggestions,
So that developers receive AI-powered code completions and modifications.

**Acceptance Criteria:**

**Given** IAgent interface, AgentOrchestrator, ContextAgent, and ArchitectAgent are implemented
**When** I create `src/agents/coder/coder-agent.ts`
**Then** CoderAgent implements IAgent interface
**And** `execute()` method receives context and architectural analysis
**And** Agent generates code via LLM using architect guidance for alignment
**And** Generated code follows project patterns identified by architect
**And** Response includes: code suggestion, reasoning (why this approach), alternatives considered
**And** Agent state updates to "working" during code generation
**And** Agent state updates to "success" after suggestion generated
**And** Reasoning visibility enables understanding (FR5)
**And** Unit tests verify code generation with mocked LLM responses

---

### Story 3.6: Implement Reviewer Agent for Proactive Risk Identification

As a developer,
I want a Reviewer Agent that validates suggestions before display,
So that developers see risks, edge cases, and security concerns proactively.

**Acceptance Criteria:**

**Given** IAgent interface, AgentOrchestrator, and CoderAgent are implemented
**When** I create `src/agents/reviewer/reviewer-agent.ts`
**Then** ReviewerAgent implements IAgent interface
**And** `execute()` method receives generated code suggestion
**And** Agent validates: syntax correctness, edge cases, security risks (FR38, FR39)
**And** Security validation checks: SQL injection, XSS, command injection, hardcoded secrets
**And** Edge case identification checks: null/undefined handling, error conditions, boundary conditions
**And** Response includes: validation result, identified risks, recommendations
**And** Agent state updates to "thinking" during review
**And** Agent state updates to "alert" if critical issues found
**And** Agent state updates to "success" if no issues found
**And** Unit tests verify review logic with various code scenarios

---

### Story 3.7: Implement Dual State Pattern (Backend + Frontend State Sync)

As a developer,
I want backend state (Node.js) as source of truth synchronized to frontend (Browser),
So that UI displays real-time agent states with <100ms latency.

**Acceptance Criteria:**

**Given** All agents are implemented
**When** I create `src/state/extension-state-manager.ts` (backend)
**Then** ExtensionStateManager maintains Map<AgentType, IAgentState>
**And** `updateAgentState(agent, status, task)` updates backend state immutably
**And** State updates are synced to webview via `postMessage` instantly (0ms throttle - NFR2)
**And** postMessage payload includes: `type: 'toWebview:agentStateUpdate', agent, status, currentTask, lastUpdate`
**And** Backend state is the ONLY source of truth (Dual State Pattern from architecture)
**And** State manager provides `getAgentState(agent)` for read access
**And** State updates trigger webview UI rendering (handled by frontend in Epic 4)
**And** Unit tests verify state updates and postMessage synchronization

---

### Story 3.8: Implement Agent Lifecycle Events for Extensibility

As a developer,
I want lifecycle event hooks for agents,
So that extension developers can subscribe to agent events for custom behaviors (FR62).

**Acceptance Criteria:**

**Given** All agents and orchestrator are implemented
**When** I create `src/agents/shared/agent-events.ts`
**Then** EventEmitter-based system supports:
- `onAgentActivated(agent: AgentType, callback)` event
- `onAgentStateChanged(agent: AgentType, state: IAgentState, callback)` event
- `onSuggestionGenerated(suggestion: ISuggestion, callback)` event
- `onSuggestionAccepted(suggestion: ISuggestion, callback)` event
- `onSuggestionRejected(suggestion: ISuggestion, callback)` event
**And** Orchestrator emits events at appropriate lifecycle points
**And** Subscribers can register via typed API (FR63)
**And** Events are documented for extension developers (FR62)
**And** Unit tests verify event emission and subscription
