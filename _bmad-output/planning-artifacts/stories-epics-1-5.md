# User Stories - Epics 1-5
## suika Project

This document contains detailed user stories with acceptance criteria for Epics 1-5 of the suika VSCode extension project.

---

## Epic 1: Project Foundation & Core Infrastructure

**Goal:** Developers have a working VSCode extension foundation with configuration management, secure API key storage, and error handling infrastructure.

**FRs Covered:** FR49, FR50, FR51, FR52, FR53, FR54, FR58

---

### Story 1.1: Initialize Extension Project with Yeoman Generator

As a developer,
I want to initialize the VSCode extension project using the official Yeoman generator with TypeScript and esbuild,
So that I have a production-ready foundation that follows VSCode extension best practices.

**Acceptance Criteria:**

**Given** I have Node.js 16+ and npm installed
**When** I run `npx --package yo --package generator-code -- yo code`
**And** I select "New Extension (TypeScript)" as extension type
**And** I provide "suika" as the extension name
**And** I select "esbuild" as the bundler (NOT webpack)
**And** I select "npm" as the package manager
**Then** A complete VSCode extension project structure is generated
**And** The project includes `package.json` with VSCode engine version 1.75+
**And** The project includes `tsconfig.json` with strict mode enabled
**And** The project includes `.vscode/launch.json` for debugging
**And** The project includes `.vscode/tasks.json` for build tasks
**And** The project includes `esbuild` configuration (not webpack)
**And** The project includes a sample `extension.ts` activation entry point
**And** Running `npm run compile` successfully builds the extension
**And** The extension can be launched in VSCode Extension Development Host

---

### Story 1.2: Configure Dual-Build System for Extension and Webview

As a developer,
I want separate build configurations for the extension (Node.js) and webview (Browser),
So that both the backend extension and frontend HUD can run in their appropriate environments.

**Acceptance Criteria:**

**Given** The Yeoman-generated project is initialized
**When** I configure the build system in `esbuild.config.js` or package.json scripts
**Then** There is a build target for "extension" with platform: "node" and format: "cjs"
**And** There is a build target for "webview" with platform: "browser" and format: "iife"
**And** The extension build outputs to `dist/extension.js`
**And** The webview build outputs to `dist/webview.js`
**And** Running `npm run compile` builds both targets successfully
**And** Development build completes in <1 second
**And** Watch mode rebuild completes in <200ms
**And** Production build completes in <3 seconds
**And** Source maps are generated in development mode
**And** The extension activates without errors in Extension Development Host

---

### Story 1.3: Implement Secure API Key Storage with VSCode SecretStorage

As a developer,
I want to securely store and retrieve LLM provider API keys using VSCode SecretStorage,
So that my API keys are encrypted and never exposed in plain text configuration files.

**Acceptance Criteria:**

**Given** The extension is activated in VSCode
**When** I implement a `SecretStorageService` class that wraps `ExtensionContext.secrets`
**Then** The service provides `storeApiKey(provider: string, apiKey: string): Promise<void>` method
**And** The service provides `getApiKey(provider: string): Promise<string | undefined>` method
**And** The service provides `deleteApiKey(provider: string): Promise<void>` method
**And** API keys are stored using keys like "suika.apiKey.openai" and "suika.apiKey.anthropic"
**And** Stored keys persist across VSCode sessions
**And** Stored keys are encrypted by VSCode's SecretStorage API
**And** No API keys appear in workspace settings or user settings JSON files
**And** Unit tests verify storage, retrieval, and deletion operations
**And** The service handles errors gracefully when SecretStorage is unavailable

---

### Story 1.4: Create Configuration Manager with Workspace and User Settings

As a developer,
I want a configuration management system that reads VSCode settings at both workspace and user levels,
So that I can customize extension behavior globally or per-project with proper defaults.

**Acceptance Criteria:**

**Given** The extension is activated
**When** I implement a `ConfigurationManager` class
**Then** The manager reads settings from `vscode.workspace.getConfiguration('suika')`
**And** Configuration includes settings for:
  - `llmProvider.default`: Default LLM provider (openai | anthropic)
  - `llmProvider.openai.model`: OpenAI model name (default: "gpt-4")
  - `llmProvider.anthropic.model`: Anthropic model name (default: "claude-3-5-sonnet-20241022")
  - `cache.enabled`: Enable hybrid caching (default: true)
  - `cache.ttlSeconds`: Cache TTL in seconds (default: 3600)
  - `ui.transparency`: Transparency level (minimal | medium | full, default: medium)
  - `ui.vitalSignsPosition`: Bar position (top | bottom, default: top)
  - `mode.default`: Default mode (learning | expert | focus | team | performance, default: expert)
**And** Workspace settings override user settings
**And** The manager provides `get<T>(key: string): T` method with type safety
**And** The manager provides `update(key: string, value: any): Promise<void>` method
**And** Configuration changes trigger `vscode.workspace.onDidChangeConfiguration` listener
**And** Unit tests verify configuration reading with workspace and user precedence

---

### Story 1.5: Implement Configuration Presets for Solo-Dev, Team, and Enterprise

As a developer,
I want predefined configuration presets for common workflows (solo-dev, team, enterprise),
So that I can quickly apply optimal settings without manual configuration.

**Acceptance Criteria:**

**Given** The ConfigurationManager is implemented
**When** I create configuration preset files in `src/config/presets/`
**Then** There is a `solo-dev-config.json` preset with:
  - mode.default: "learning"
  - ui.transparency: "full"
  - cache.enabled: true
  - telemetry.enabled: false
**And** There is a `team-config.json` preset with:
  - mode.default: "team"
  - ui.transparency: "medium"
  - ui.showTeamLabels: true
  - telemetry.enabled: true (for team metrics)
**And** There is an `enterprise-config.json` preset with:
  - llmProvider.allowOnPremise: true
  - security.strictMode: true
  - cache.ttlSeconds: 7200 (longer cache for cost optimization)
  - telemetry.enabled: true (with privacy compliance)
**And** A command `suika.applyPreset` allows users to select and apply a preset
**And** Applying a preset updates workspace configuration
**And** A confirmation prompt appears before applying preset
**And** The command is registered in `package.json` contributes.commands
**And** Unit tests verify preset application updates correct configuration keys

---

### Story 1.6: Implement Configuration Export and Import

As a developer,
I want to export my current configuration to a JSON file and import configurations from files,
So that I can share configurations across machines or with team members.

**Acceptance Criteria:**

**Given** The ConfigurationManager is implemented
**When** I implement export/import functionality
**Then** A command `suika.exportConfiguration` allows users to save configuration to a JSON file
**And** The export includes all suika settings from workspace configuration
**And** The export excludes sensitive data (API keys stored in SecretStorage)
**And** The exported JSON has a version field for compatibility tracking
**And** A command `suika.importConfiguration` allows users to load configuration from a JSON file
**And** Import validates JSON structure and version compatibility
**And** Import prompts for confirmation before overwriting existing settings
**And** Import applies settings to workspace configuration level
**And** Both commands are registered in `package.json` contributes.commands
**And** Export uses VSCode file picker for save location selection
**And** Import uses VSCode file picker for file selection
**And** Unit tests verify export produces valid JSON and import applies settings correctly

---

### Story 1.7: Create Centralized Error Handler with Retry Logic

As a developer,
I want a centralized error handling system with retry logic, exponential backoff, and structured logging,
So that transient failures are handled gracefully and errors are consistently logged for troubleshooting.

**Acceptance Criteria:**

**Given** The extension encounters errors during operation
**When** I implement an `ErrorHandler` class in `src/errors/errorHandler.ts`
**Then** The handler provides `handleError(error: Error, context: string): void` method
**And** The handler provides `handleErrorWithRetry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T>` method
**And** RetryOptions includes: maxRetries (default: 3), initialDelayMs (default: 1000), maxDelayMs (default: 30000), exponentialBackoff (default: true)
**And** Retry logic implements exponential backoff: delay = min(initialDelay * 2^attempt, maxDelay)
**And** Errors are logged to VSCode Output Channel named "suika"
**And** Error logs include: timestamp, error message, stack trace, context information
**And** Logged errors follow structured format: `[TIMESTAMP] [LEVEL] [CONTEXT] Message`
**And** The handler differentiates error types: NetworkError, RateLimitError, AuthenticationError, ConfigurationError
**And** Network errors trigger retry with backoff
**And** Rate limit errors wait for retry-after duration if provided
**And** Authentication errors do not retry (prompt user for API key)
**And** Configuration errors do not retry (prompt user to fix config)
**And** Unit tests verify retry logic executes correct number of attempts
**And** Unit tests verify exponential backoff timing
**And** Integration tests verify errors are logged to Output Channel

---

### Story 1.8: Set Up Testing Framework with Mocha and VSCode Test Electron

As a developer,
I want a complete testing framework with unit and integration test capabilities,
So that I can verify extension behavior and maintain >70% code coverage.

**Acceptance Criteria:**

**Given** The Yeoman-generated project includes basic test setup
**When** I configure the testing framework
**Then** Mocha and Chai are installed as dev dependencies
**And** `@vscode/test-electron` is installed for integration tests
**And** Test scripts are defined in package.json:
  - `npm test`: Run all tests
  - `npm run test:unit`: Run unit tests only
  - `npm run test:integration`: Run integration tests only
  - `npm run test:coverage`: Run tests with coverage report
**And** Test files follow pattern `**/__tests__/**/*.test.ts`
**And** Unit tests run in Node.js environment without VSCode APIs
**And** Integration tests run in VSCode Extension Development Host
**And** A sample unit test exists for ConfigurationManager
**And** A sample integration test exists that activates the extension
**And** Running `npm test` executes all tests successfully
**And** Test coverage reporting is configured (using c8 or nyc)
**And** Coverage reports are generated in `coverage/` directory
**And** `.gitignore` excludes `coverage/` directory
**And** CI-friendly test output format is configured

---

## Epic 2: LLM Provider Integration & Caching

**Goal:** Developers can connect to multiple LLM providers (OpenAI, Anthropic) with intelligent caching that reduces costs (<$0.10/session) and improves performance (>50% cache hit rate).

**FRs Covered:** FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33

**NFRs Addressed:** NFR23 (<$0.10/session), NFR24 (>50% cache hit), NFR25 (budget config), NFR26 (real-time cost metrics)

---

### Story 2.1: Define ILLMProvider Interface with Adapter Pattern

As an extension developer,
I want a standardized ILLMProvider interface that all LLM providers must implement,
So that I can add new providers without changing core agent logic.

**Acceptance Criteria:**

**Given** I need to support multiple LLM providers interchangeably
**When** I create `src/llm/interfaces/ILLMProvider.ts`
**Then** The interface defines the following methods:
  - `generateCompletion(prompt: string, options?: CompletionOptions): Promise<CompletionResponse>`
  - `generateStream(prompt: string, options?: CompletionOptions): AsyncIterable<CompletionChunk>`
  - `estimateTokenCount(text: string): number`
  - `getModelInfo(): ModelInfo`
  - `isAvailable(): Promise<boolean>`
**And** CompletionOptions includes: model, temperature, maxTokens, stopSequences, topP
**And** CompletionResponse includes: content, finishReason, tokensUsed (prompt + completion), modelUsed, cached (boolean)
**And** CompletionChunk includes: delta (string), finishReason (optional)
**And** ModelInfo includes: provider, model, contextWindow, costPer1kTokens
**And** The interface is fully typed with TypeScript strict mode
**And** JSDoc comments document each method's purpose and parameters
**And** A mock provider implementation exists for testing: `MockLLMProvider`
**And** Unit tests verify MockLLMProvider satisfies ILLMProvider interface

---

### Story 2.2: Implement OpenAI Provider with Token Estimation

As a developer,
I want an OpenAI provider implementation that generates completions and accurately estimates token counts,
So that I can use GPT-4 models with cost tracking.

**Acceptance Criteria:**

**Given** The ILLMProvider interface is defined
**When** I implement `OpenAIProvider` in `src/llm/providers/openaiProvider.ts`
**Then** The provider implements all ILLMProvider methods
**And** The constructor accepts `apiKey: string` and optional `baseURL: string`
**And** `generateCompletion()` calls OpenAI Chat Completions API
**And** API requests use HTTPS/TLS for secure communication
**And** The provider maps CompletionOptions to OpenAI API parameters
**And** The provider parses OpenAI responses into CompletionResponse format
**And** `tokensUsed` is extracted from OpenAI response `usage` field
**And** `estimateTokenCount()` uses tiktoken library for GPT-4 tokenization
**And** `getModelInfo()` returns correct context window for selected model (GPT-4: 8192, GPT-4-32k: 32768)
**And** Cost calculation uses $0.03/1k prompt tokens, $0.06/1k completion tokens for GPT-4
**And** `isAvailable()` validates API key by making a minimal test request
**And** Network errors are caught and wrapped in custom OpenAIError type
**And** Rate limit errors (429) include retry-after information
**And** Authentication errors (401) provide clear error messages
**And** Unit tests verify token estimation accuracy within 5% margin
**And** Integration tests verify successful completion generation with valid API key

---

### Story 2.3: Implement Anthropic Provider with Token Estimation

As a developer,
I want an Anthropic provider implementation that generates completions using Claude models,
So that I can use Claude 3.5 Sonnet with cost tracking.

**Acceptance Criteria:**

**Given** The ILLMProvider interface is defined
**When** I implement `AnthropicProvider` in `src/llm/providers/anthropicProvider.ts`
**Then** The provider implements all ILLMProvider methods
**And** The constructor accepts `apiKey: string` and optional `baseURL: string`
**And** `generateCompletion()` calls Anthropic Messages API
**And** API requests use HTTPS/TLS with anthropic-version header
**And** The provider maps CompletionOptions to Anthropic API parameters
**And** The provider parses Anthropic responses into CompletionResponse format
**And** `tokensUsed` is extracted from Anthropic response `usage` field
**And** `estimateTokenCount()` uses Anthropic's token counting approach (approximation: text.length / 4)
**And** `getModelInfo()` returns correct context window for Claude models (Claude 3.5 Sonnet: 200000)
**And** Cost calculation uses $3.00/1M input tokens, $15.00/1M output tokens for Claude 3.5 Sonnet
**And** `isAvailable()` validates API key by making a minimal test request
**And** Network errors are caught and wrapped in custom AnthropicError type
**And** Rate limit errors (429) include retry-after information
**And** Authentication errors (401) provide clear error messages
**And** Unit tests verify token estimation accuracy within 10% margin
**And** Integration tests verify successful completion generation with valid API key

---

### Story 2.4: Create LLM Provider Manager with Registry and Fallbacks

As a developer,
I want a provider manager that registers multiple providers and handles automatic fallbacks,
So that the system remains operational even if one provider is unavailable.

**Acceptance Criteria:**

**Given** Multiple ILLMProvider implementations exist (OpenAI, Anthropic)
**When** I implement `LLMProviderManager` in `src/llm/providerManager.ts`
**Then** The manager provides `registerProvider(name: string, provider: ILLMProvider): void` method
**And** The manager provides `getProvider(name: string): ILLMProvider | undefined` method
**And** The manager provides `setPrimaryProvider(name: string): void` method
**And** The manager provides `setFallbackProviders(names: string[]): void` method
**And** The manager provides `generateCompletion(prompt: string, options?: CompletionOptions): Promise<CompletionResponse>` method
**And** `generateCompletion()` first attempts primary provider
**And** If primary provider fails with availability error, manager tries first fallback provider
**And** Fallback chain continues through all fallback providers until success
**And** If all providers fail, manager throws AggregateError with all failure reasons
**And** Provider failures are logged to ErrorHandler with context
**And** The manager initializes providers from ConfigurationManager settings
**And** The manager loads API keys from SecretStorageService
**And** Provider selection per agent is supported via configuration
**And** Unit tests verify fallback logic with mock providers
**And** Unit tests verify all providers failing throws AggregateError
**And** Integration tests verify fallback from OpenAI to Anthropic on simulated failure

---

### Story 2.5: Implement Hybrid L1 (Memory) + L2 (File System) Cache

As a developer,
I want a two-tier cache with in-memory L1 (fast) and file system L2 (persistent),
So that I can achieve >50% cache hit rate and reduce LLM costs.

**Acceptance Criteria:**

**Given** LLM completions are expensive and often repetitive
**When** I implement `HybridCache` in `src/llm/cache/hybridCache.ts`
**Then** L1 cache uses LRU (Least Recently Used) strategy with configurable max size (default: 100 entries)
**And** L1 cache stores in-memory with <1ms access time
**And** L2 cache stores in file system at `{workspaceStoragePath}/llm-cache/`
**And** L2 cache uses SHA-256 hash of (prompt + options) as filename
**And** Cache key includes: prompt, model, temperature, maxTokens (excluding non-deterministic options)
**And** The cache provides `get(key: CacheKey): Promise<CompletionResponse | undefined>` method
**And** The cache provides `set(key: CacheKey, response: CompletionResponse, ttlSeconds?: number): Promise<void>` method
**And** `get()` checks L1 first, then L2 if L1 miss
**And** L2 hits are promoted to L1 for faster future access
**And** Cache entries include timestamp for TTL expiration
**And** Expired entries are not returned from cache
**And** The cache provides `clear(): Promise<void>` method to purge all entries
**And** L1 eviction happens when size limit reached (removes oldest entry)
**And** L2 files are JSON format: `{ response: CompletionResponse, timestamp: number, ttlSeconds: number }`
**And** Cache operations never block LLM calls (async/non-blocking)
**And** Cache errors are logged but do not crash the extension
**And** Unit tests verify L1 and L2 hit/miss scenarios
**And** Unit tests verify TTL expiration logic
**And** Integration tests verify cache persistence across extension reloads

---

### Story 2.6: Integrate Cache with LLM Provider Manager

As a developer,
I want the LLM Provider Manager to automatically use the Hybrid Cache for all completions,
So that repetitive prompts are served from cache without making expensive API calls.

**Acceptance Criteria:**

**Given** The HybridCache and LLMProviderManager are implemented
**When** I integrate caching into LLMProviderManager
**Then** Before calling provider.generateCompletion(), manager checks cache with computed CacheKey
**And** If cache hit, manager returns cached CompletionResponse with `cached: true` flag
**And** If cache miss, manager calls provider and stores response in cache
**And** Cache TTL is configurable via ConfigurationManager (default: 3600 seconds)
**And** Caching can be disabled via configuration `cache.enabled: false`
**And** Cache hits are logged at DEBUG level: "Cache hit for prompt hash: {hash}"
**And** Cache misses are logged at DEBUG level: "Cache miss for prompt hash: {hash}"
**And** Cache operations do not increase completion latency (asynchronous)
**And** Non-deterministic completions (temperature > 0.5) are cached but with shorter TTL
**And** Streaming completions (`generateStream`) bypass cache
**And** Unit tests verify cache integration using mock provider
**And** Unit tests verify cached responses have `cached: true` flag
**And** Integration tests verify cache hit rate >50% with repeated prompts

---

### Story 2.7: Implement Real-Time Cost Tracking and Display

As a developer,
I want to see real-time LLM cost tracking per session,
So that I can monitor my spending and stay within budget.

**Acceptance Criteria:**

**Given** LLM providers return token usage in CompletionResponse
**When** I implement `CostTracker` in `src/llm/costTracker.ts`
**Then** The tracker provides `trackCompletion(response: CompletionResponse, provider: ILLMProvider): void` method
**And** The tracker calculates cost using ModelInfo.costPer1kTokens and tokensUsed
**And** The tracker accumulates costs per session in memory
**And** The tracker provides `getCurrentSessionCost(): number` method (returns cost in USD)
**And** The tracker provides `getProviderBreakdown(): Map<string, number>` method (cost per provider)
**And** The tracker provides `resetSession(): void` method
**And** Session cost is displayed in Vital Signs Bar (Epic 4 integration point)
**And** Cost updates happen in real-time after each completion
**And** The tracker persists session history to workspace storage
**And** The tracker provides `getSessionHistory(): SessionCostSummary[]` method
**And** SessionCostSummary includes: date, totalCost, completionCount, providerBreakdown
**And** A command `suika.showCostReport` displays cost history in webview
**And** Cost is formatted with 2 decimal places: "$0.05"
**And** Unit tests verify cost calculation accuracy
**And** Unit tests verify session accumulation and reset

---

### Story 2.8: Implement Rate Limiting and Budget Enforcement

As a developer,
I want configurable rate limiting and budget caps to control LLM costs,
So that I don't accidentally exceed my spending limits.

**Acceptance Criteria:**

**Given** LLM API calls can be expensive and rapid
**When** I implement rate limiting and budget enforcement in LLMProviderManager
**Then** Configuration includes `budget.maxCostPerDay`: Maximum spend per day in USD (default: 5.00)
**And** Configuration includes `budget.maxCostPerSession`: Maximum spend per session in USD (default: 1.00)
**And** Configuration includes `rateLimit.maxRequestsPerMinute`: Max requests per minute per provider (default: 60)
**And** Before each completion, manager checks if session budget exceeded
**And** If session budget exceeded, manager throws BudgetExceededError with current cost
**And** Before each completion, manager checks if daily budget exceeded
**And** If daily budget exceeded, manager throws BudgetExceededError with daily total
**And** Daily budget resets at midnight local time
**And** Rate limiting uses token bucket algorithm per provider
**And** If rate limit exceeded, manager waits until tokens available (up to 10s max)
**And** If wait time >10s, manager throws RateLimitExceededError
**And** Budget exceeded errors show user notification with cost details
**And** User can temporarily override budget via command `suika.overrideBudget`
**And** Override requires confirmation dialog showing risk
**And** Budget status is visible in Vital Signs Bar (Epic 4 integration point)
**And** Unit tests verify budget enforcement with mock completions
**And** Unit tests verify rate limiting delays requests appropriately

---

## Epic 3: AI Agent System & Orchestration

**Goal:** Developers see 4 distinct AI agents (Architect, Coder, Reviewer, Context) collaborating intelligently with visible states and complete reasoning transparency.

**FRs Covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8

---

### Story 3.1: Define IAgent Interface and Agent State Machine

As an extension developer,
I want a standardized IAgent interface with a state machine for agent lifecycle,
So that all agents behave consistently and state transitions are predictable.

**Acceptance Criteria:**

**Given** I need 4 distinct agents with consistent behavior
**When** I create `src/agents/interfaces/IAgent.ts`
**Then** The interface defines the following properties:
  - `id: string` (unique identifier: "architect" | "coder" | "reviewer" | "context")
  - `name: string` (display name)
  - `state: AgentState` (current state)
  - `visualIdentity: AgentVisualIdentity` (icon, color, position anchor)
**And** The interface defines the following methods:
  - `activate(context: AgentContext): Promise<void>`
  - `process(input: AgentInput): Promise<AgentOutput>`
  - `deactivate(): Promise<void>`
  - `getState(): AgentState`
  - `setState(state: AgentState): void`
**And** AgentState is an enum: IDLE, THINKING, WORKING, ALERT, SUCCESS
**And** AgentVisualIdentity includes: icon (emoji or SVG path), accentColor (hex), positionAnchor (code section hint)
**And** AgentContext includes: workspaceFolder, activeDocument, llmProvider, configurationManager
**And** AgentInput includes: prompt, files (relevant context), previousOutputs (from other agents)
**And** AgentOutput includes: result (string), reasoning (string), alternatives (string[]), filesAnalyzed (string[]), tokensUsed (number)
**And** State transitions follow valid paths:
  - IDLE → THINKING → WORKING → SUCCESS → IDLE
  - IDLE → THINKING → WORKING → ALERT → IDLE
  - Any state → IDLE (abort)
**And** Invalid state transitions throw InvalidStateTransitionError
**And** The interface is fully typed with TypeScript strict mode
**And** JSDoc comments document each method and property
**And** A mock agent implementation exists for testing: `MockAgent`

---

### Story 3.2: Implement Orchestrator Central Pattern

As a developer,
I want a central orchestrator that coordinates all agent activities without agents calling each other,
So that agent collaboration is controlled and predictable.

**Acceptance Criteria:**

**Given** The IAgent interface is defined
**When** I implement `Orchestrator` in `src/agents/orchestrator.ts`
**Then** The orchestrator is a singleton instance
**And** The orchestrator provides `registerAgent(agent: IAgent): void` method
**And** The orchestrator provides `orchestrate(task: OrchestratorTask): Promise<OrchestratorResult>` method
**And** OrchestratorTask includes: type (suggestion | analysis | review), triggerContext (document, cursor position)
**And** OrchestratorResult includes: outputs (map of agent ID to AgentOutput), coordination (CollaborationMetadata)
**And** `orchestrate()` determines which agents to activate based on task type
**And** For "suggestion" task: Orchestrator activates Context → Architect → Coder → Reviewer (sequential pipeline)
**And** For "analysis" task: Orchestrator activates Context and Architect (parallel)
**And** For "review" task: Orchestrator activates Reviewer with Coder's output
**And** Agents NEVER call each other directly (orchestrator coordinates all interaction)
**And** The orchestrator passes agent outputs as input to subsequent agents in pipeline
**And** The orchestrator updates agent states (IDLE → THINKING → WORKING → SUCCESS)
**And** State updates trigger webview synchronization via Dual State Pattern (Epic 4 integration)
**And** If an agent fails, orchestrator sets agent to ALERT state and logs error
**And** Orchestrator implements retry logic for transient agent failures (max 2 retries)
**And** CollaborationMetadata includes: agentsInvolved, sequenceOrder, totalDuration, tokenTotal
**And** Unit tests verify agent coordination sequences
**And** Unit tests verify agents never call each other directly

---

### Story 3.3: Implement Architect Agent with Architecture Analysis

As a developer,
I want an Architect agent that analyzes project structure and suggests architectural patterns,
So that code suggestions align with existing architecture.

**Acceptance Criteria:**

**Given** The IAgent interface and Orchestrator are implemented
**When** I implement `ArchitectAgent` in `src/agents/architectAgent.ts`
**Then** The agent implements all IAgent interface methods
**And** Agent ID is "architect"
**And** Agent name is "Architect"
**And** Visual identity has icon "🏗️" (or SVG building/blueprint icon)
**And** Visual identity accent color is "#4A90E2" (blue)
**And** Position anchor is "imports" (agent appears near import statements)
**And** `process()` accepts input with files from Context agent
**And** The agent analyzes project structure: directories, file naming conventions, module organization
**And** The agent identifies architectural patterns: MVC, layered, hexagonal, microservices, etc.
**And** The agent extracts existing patterns from code: dependency injection, factory, observer, etc.
**And** The agent generates architectural recommendations in AgentOutput.result
**And** AgentOutput.reasoning explains why specific patterns were identified
**And** AgentOutput.alternatives suggests alternative architectural approaches
**And** AgentOutput.filesAnalyzed lists files used for analysis
**And** The agent uses LLM provider for pattern analysis with prompt: "Analyze the following project structure and identify architectural patterns..."
**And** State transitions: IDLE → THINKING (0.5s) → WORKING (LLM call) → SUCCESS
**And** If LLM call fails, state transitions to ALERT
**And** Unit tests verify architectural pattern detection with mock file structures
**And** Integration tests verify agent processes real project structure

---

### Story 3.4: Implement Coder Agent with Code Generation

As a developer,
I want a Coder agent that generates code suggestions aligned with architectural guidance,
So that I receive implementation-ready code that fits the project.

**Acceptance Criteria:**

**Given** The Architect agent provides architectural context
**When** I implement `CoderAgent` in `src/agents/coderAgent.ts`
**Then** The agent implements all IAgent interface methods
**And** Agent ID is "coder"
**And** Agent name is "Coder"
**And** Visual identity has icon "⚙️" (or SVG code/gear icon)
**And** Visual identity accent color is "#50C878" (green)
**And** Position anchor is "functions" (agent appears near function definitions)
**And** `process()` accepts input including Architect's output and Context's files
**And** The agent generates code implementations based on architectural patterns
**And** The agent follows existing code style and conventions from context files
**And** The agent generates TypeScript code with strict mode compliance
**And** AgentOutput.result contains the generated code with syntax highlighting
**And** AgentOutput.reasoning explains implementation choices and trade-offs
**And** AgentOutput.alternatives suggests alternative implementations
**And** The agent uses LLM provider with prompt: "Generate code following {architecturalPattern} pattern..."
**And** State transitions: IDLE → THINKING (0.5s) → WORKING (LLM call) → SUCCESS
**And** If code generation produces syntax errors, state transitions to ALERT
**And** Unit tests verify code generation with mock architectural context
**And** Integration tests verify generated code is syntactically valid TypeScript

---

### Story 3.5: Implement Reviewer Agent with Risk and Edge Case Detection

As a developer,
I want a Reviewer agent that proactively identifies edge cases, risks, and code quality issues,
So that I catch problems before accepting suggestions.

**Acceptance Criteria:**

**Given** The Coder agent generates code suggestions
**When** I implement `ReviewerAgent` in `src/agents/reviewerAgent.ts`
**Then** The agent implements all IAgent interface methods
**And** Agent ID is "reviewer"
**And** Agent name is "Reviewer"
**And** Visual identity has icon "🔍" (or SVG magnifying glass icon)
**And** Visual identity accent color is "#E74C3C" (red)
**And** Position anchor is "problems" (agent appears near error/warning areas)
**And** `process()` accepts input including Coder's generated code
**And** The agent analyzes code for edge cases: null checks, boundary conditions, error handling
**And** The agent identifies security risks: SQL injection, XSS, insecure dependencies
**And** The agent checks code quality: complexity, duplication, naming conventions
**And** The agent validates TypeScript strict mode compliance
**And** AgentOutput.result contains list of identified issues with severity levels
**And** Severity levels: INFO, WARNING, CRITICAL, URGENT
**And** AgentOutput.reasoning explains why each issue is problematic
**And** AgentOutput.alternatives suggests fixes for each issue
**And** The agent uses LLM provider with prompt: "Review the following code for edge cases, security risks, and quality issues..."
**And** If CRITICAL or URGENT issues found, agent state transitions to ALERT
**And** If no issues found, agent state transitions to SUCCESS
**And** Unit tests verify edge case detection with vulnerable code samples
**And** Integration tests verify reviewer identifies common vulnerabilities (e.g., hardcoded secrets)

---

### Story 3.6: Implement Context Agent with File Selection and Token Optimization

As a developer,
I want a Context agent that intelligently selects relevant files and optimizes token usage,
So that agents have the right context without exceeding token limits.

**Acceptance Criteria:**

**Given** Projects can have thousands of files exceeding LLM token limits
**When** I implement `ContextAgent` in `src/agents/contextAgent.ts`
**Then** The agent implements all IAgent interface methods
**And** Agent ID is "context"
**And** Agent name is "Context"
**And** Visual identity has icon "📚" (or SVG book/files icon)
**And** Visual identity accent color is "#9B59B6" (purple)
**And** Position anchor is "global" (agent appears at global scope level)
**And** `process()` accepts input with active document path and cursor position
**And** The agent analyzes workspace structure to find relevant files
**And** Relevance ranking considers: imports, file proximity, recent edits, naming similarity
**And** The agent estimates tokens for each file using LLM provider's `estimateTokenCount()`
**And** The agent selects files until reaching token budget (configurable, default: 50% of model's context window)
**And** The agent prioritizes: current file (100%), direct imports (80%), transitive imports (40%), related files (20%)
**And** AgentOutput.result contains list of selected files with paths
**And** AgentOutput.reasoning explains why each file was included
**And** AgentOutput.filesAnalyzed lists all considered files with inclusion decision
**And** The agent reads file contents and includes in output for other agents
**And** If token budget cannot fit current file, agent transitions to ALERT state
**And** State transitions: IDLE → THINKING (0.3s) → WORKING (file analysis) → SUCCESS
**And** Unit tests verify file selection with mock workspace structure
**And** Unit tests verify token budget enforcement
**And** Integration tests verify agent stays within configured token limits

---

### Story 3.7: Implement Dual State Pattern for Backend-Frontend Synchronization

As a developer,
I want agent states synchronized instantly between extension backend and webview frontend,
So that UI always reflects current agent states without lag.

**Acceptance Criteria:**

**Given** Agents run in extension backend (Node.js) and UI displays in webview (Browser)
**When** I implement state synchronization using Dual State Pattern
**Then** Backend maintains source-of-truth state in `AgentStateManager` class
**And** AgentStateManager stores: `Map<AgentId, AgentState>` with current states
**And** When agent state changes, AgentStateManager calls `syncToWebview(agentId: string, state: AgentState)`
**And** `syncToWebview()` uses `webview.postMessage({ type: 'agentStateUpdate', agentId, state })`
**And** Frontend maintains mirrored state in webview JavaScript/TypeScript
**And** Webview listens to messages via `window.addEventListener('message', handleMessage)`
**And** On receiving 'agentStateUpdate', webview updates local agent state map
**And** State updates trigger UI re-render (0ms throttle for instant feedback)
**And** If webview receives state update for unknown agent, it logs warning but doesn't crash
**And** On webview reload, backend sends full state snapshot via 'fullStateSync' message
**And** Full state sync includes all agents' current states
**And** Webview reconciles state on 'fullStateSync' message
**And** State synchronization is unidirectional: backend → webview (webview never updates backend state directly)
**And** Unit tests verify postMessage calls on state changes
**And** Integration tests verify webview receives and applies state updates
**And** Load tests verify 0ms throttle maintains 60fps with rapid state changes

---

### Story 3.8: Implement Agent Query Interface for User Questions

As a developer,
I want to query a specific agent about its reasoning or decisions,
So that I can understand why an agent made a particular suggestion.

**Acceptance Criteria:**

**Given** An agent has produced output with reasoning
**When** I implement agent query functionality
**Then** Each agent provides `query(question: string): Promise<string>` method in IAgent interface
**And** The query method accepts natural language questions about agent's decisions
**And** The query uses LLM provider with context: previous AgentOutput + user question
**And** LLM prompt: "Based on your previous analysis: {reasoning}, answer this question: {question}"
**And** Query responses are concise (max 500 tokens)
**And** Agent state transitions to THINKING during query, returns to previous state after
**And** A command `suika.queryAgent` prompts user to select agent and enter question
**And** Query interface appears in webview as clickable "Ask {AgentName}" button
**And** Query results display in webview dialog with agent's visual identity
**And** Query history is maintained per agent (last 5 queries)
**And** AgentOutput includes queryHistory field for persistence
**And** Unit tests verify query method with mock agent outputs
**And** Integration tests verify user can query Architect about pattern choices

---

## Epic 4: Transparent HUD & Visual System

**Goal:** Developers have a beautiful, transparent sumi-e aesthetic HUD overlay that displays agents and vital signs without obstructing code editing, maintaining 60fps animations.

**FRs Covered:** FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16

**NFRs Addressed:** NFR1 (60fps), NFR2 (<100ms response), NFR5 (GPU optimization), NFR6 (async rendering)

---

### Story 4.1: Create Webview Provider with Transparent Overlay

As a developer,
I want a transparent webview overlay superimposed over the code editor,
So that I can see agent visualizations without switching views.

**Acceptance Criteria:**

**Given** VSCode supports webview panels and custom editors
**When** I implement `HUDWebviewProvider` in `src/webview/hudWebviewProvider.ts`
**Then** The provider extends `vscode.WebviewViewProvider`
**And** The provider registers a webview view with ID "suika.hudView"
**And** The webview is configured as a transparent overlay (position: fixed in CSS)
**And** The webview has CSP (Content Security Policy): `script-src 'nonce-{random}'; style-src 'unsafe-inline'`
**And** The HTML template includes viewport meta tag for proper scaling
**And** The webview loads JavaScript bundle from `dist/webview.js`
**And** The webview uses postMessage API for backend communication
**And** Webview z-index is high enough to appear above editor but below dialogs
**And** Webview pointer-events: none by default (allowing editor interaction)
**And** Interactive elements (agents, alerts) have pointer-events: auto
**And** The webview supports multi-monitor setups by detecting screen boundaries
**And** The provider disposes webview properly on deactivation
**And** Unit tests verify webview provider registration
**And** Integration tests verify webview appears and accepts messages

---

### Story 4.2: Implement Sumi-e Aesthetic with SVG Agent Representations

As a developer,
I want agents rendered in sumi-e (ink wash painting) aesthetic with 2-5 brush strokes each,
So that the HUD is beautiful, minimalist, and recognizable.

**Acceptance Criteria:**

**Given** The webview overlay is implemented
**When** I design and implement SVG agent visualizations
**Then** Each agent is represented by a unique SVG icon with 2-5 brush strokes
**And** Architect agent: Blueprint/building icon with geometric brush strokes
**And** Coder agent: Gear/code icon with mechanical brush strokes
**And** Reviewer agent: Magnifying glass icon with circular brush strokes
**And** Context agent: Book/scroll icon with flowing brush strokes
**And** All SVGs use monochrome palette (black/gray) + single accent color per agent
**And** Accent colors: Architect (blue #4A90E2), Coder (green #50C878), Reviewer (red #E74C3C), Context (purple #9B59B6)
**And** SVGs include intentional Ma (間) negative space for minimalism
**And** SVG strokes use `stroke-linecap: round` for brush-like appearance
**And** Each agent SVG is <5KB in size for performance
**And** Agent icons scale responsively from 32px to 64px based on state
**And** IDLE state: 32px, 20% opacity, subtle pulse animation
**And** THINKING state: 48px, 40% opacity, breathing animation
**And** WORKING state: 56px, 60% opacity, active glow effect
**And** ALERT state: 64px, 80% opacity, attention-grabbing pulse
**And** SUCCESS state: 48px, 40% opacity, brief glow then fade to IDLE
**And** SVGs are embedded in webview HTML (not external files) for CSP compliance
**And** Visual regression tests verify agent rendering matches design

---

### Story 4.3: Implement Vital Signs Bar with Token, File, and State Display

As a developer,
I want a persistent Vital Signs Bar showing tokens consumed, files in context, and system state,
So that I have constant awareness of resource usage.

**Acceptance Criteria:**

**Given** The webview overlay is implemented
**When** I implement Vital Signs Bar component in webview
**Then** The bar is positioned at top or bottom of viewport (configurable via settings)
**And** Maximum height is 24px for non-intrusive display
**And** The bar is always visible (not hidden in Focus mode)
**And** The bar displays three sections: Tokens | Files | State
**And** Tokens section shows: "🪙 {promptTokens} + {completionTokens} = {totalTokens} tokens"
**And** Files section shows: "📁 {fileCount} files in context"
**And** State section shows: "💚 {sessionCost}" (current session cost from CostTracker)
**And** Token counts update in real-time after each LLM completion
**And** File count updates when Context agent selects files
**And** Session cost updates after each LLM call with cumulative total
**And** The bar uses monochrome background with 40% opacity
**And** Text is white with subtle drop shadow for readability on any background
**And** The bar has subtle fade-in animation on appearance (200ms)
**And** Clicking token section expands to show token breakdown by agent
**And** Clicking file section expands to show list of files in context
**And** Clicking state section expands to show cost breakdown by provider
**And** Expanded panels use smooth slide-down animation (300ms)
**And** The bar responds to configuration changes without webview reload
**And** Unit tests verify bar updates on state changes
**And** Visual regression tests verify bar appearance and animations

---

### Story 4.4: Implement Spatial Anti-Collision Algorithm for Cursor Avoidance

As a developer,
I want the HUD to automatically avoid obstructing my cursor and active editing area,
So that I can code without visual interference.

**Acceptance Criteria:**

**Given** The user is actively typing or moving cursor in the editor
**When** I implement anti-collision algorithm in webview
**Then** The algorithm detects cursor position via VSCode API: `vscode.window.activeTextEditor.selection`
**And** Backend sends cursor position to webview via postMessage: `{ type: 'cursorUpdate', line, character }`
**And** Webview converts cursor position to screen coordinates
**And** Active editing area is defined as rectangle: cursor ± 5 lines, ± 50 characters
**And** Agent positions are calculated to avoid intersecting active editing area
**And** If agent would intersect, it moves to nearest non-obstructed position
**And** Priority positions for collision avoidance: top-right → bottom-right → top-left → bottom-left
**And** Movement uses smooth CSS transition: `transform 300ms ease-out`
**And** Agents return to anchor position when cursor moves away (>5 lines)
**And** The algorithm throttles cursor updates to 100ms intervals for performance
**And** Vital Signs Bar is exempt from collision avoidance (always fixed position)
**And** Code-anchored alerts (Epic 4 Story 4.7) move with code lines but avoid cursor
**And** Unit tests verify collision detection with mock cursor positions
**And** Integration tests verify agents move away from cursor in real editor

---

### Story 4.5: Implement Adaptive Agent Positioning Based on Code Context

As a developer,
I want agents to position themselves adaptively based on code sections they're analyzing,
So that I understand which part of code each agent is focused on.

**Acceptance Criteria:**

**Given** Agents have position anchors defined in visual identity
**When** I implement adaptive positioning in webview
**Then** Architect agent anchors near import statements (top of file)
**And** Coder agent anchors near function definitions (mid-file)
**And** Reviewer agent anchors near problem areas (diagnostics, linting errors)
**And** Context agent anchors at global scope (bottom-right corner)
**And** Backend sends code structure analysis via postMessage: `{ type: 'codeStructure', imports, functions, problems }`
**And** Webview converts code positions (line numbers) to screen coordinates
**And** Agents position themselves at calculated anchor points
**And** If multiple agents target same area, they arrange in horizontal row with 80px spacing
**And** Agent positions update when scrolling to keep aligned with code sections
**And** Scroll synchronization throttles to 60fps using requestAnimationFrame
**And** Position updates use GPU-accelerated CSS: `transform: translate3d(x, y, 0)`
**And** Agents fade out (opacity: 0) when their anchor section scrolls off-screen
**And** Agents fade in (opacity: 1) when anchor section scrolls into view
**And** Fade transitions use 200ms duration
**And** In Focus mode, agents are invisible but positions still calculated (for mode toggle)
**And** Unit tests verify position calculation for different code structures
**And** Integration tests verify agents track code sections during scroll

---

### Story 4.6: Implement 60fps GPU-Accelerated Animations

As a developer,
I want all HUD animations to maintain constant 60fps with GPU acceleration,
So that the interface feels fluid and professional.

**Acceptance Criteria:**

**Given** Smooth animations are critical for user experience
**When** I implement animations in webview CSS and JavaScript
**Then** All animations use GPU-accelerated CSS properties only: `transform`, `opacity`
**And** All animated elements have `will-change: transform` CSS property
**And** Respiration pulse animation (idle/thinking states):
  - Scale oscillates: 1.0 → 1.05 → 1.0 over 2 seconds
  - Opacity oscillates: 0.6 → 0.8 → 0.6 over 2 seconds
  - Implemented with CSS keyframes animation
**And** State transition animations:
  - IDLE → THINKING: Scale up 1.0 → 1.2 over 300ms with ease-out
  - THINKING → WORKING: Opacity increase 40% → 60% over 200ms
  - WORKING → SUCCESS: Brief glow effect (box-shadow) over 400ms
  - WORKING → ALERT: Rapid pulse (scale 1.0 → 1.1 → 1.0) 3 times over 600ms
  - SUCCESS → IDLE: Scale down 1.2 → 1.0 over 500ms with ease-in
**And** Traveling brush stroke animation (agent collaboration):
  - SVG path animates from source agent to target agent
  - Uses stroke-dashoffset animation over 1 second
  - Path fades in (opacity 0 → 0.6) and out (0.6 → 0) during travel
**And** Convergence/fusion animation (intense collaboration):
  - 4 agents scale down and move toward center over 800ms
  - Merge into Enso circle (円相) or Lotus symbol at center
  - Merged form pulses and glows for duration of collaboration
  - Agents separate and return to positions over 800ms when done
**And** All animations use `requestAnimationFrame` for JavaScript-driven animations
**And** Animation frame rate monitored with performance.now() in development
**And** If frame rate drops below 50fps, warning logged to console
**And** Animations can be reduced or disabled via Performance mode (Epic 5 integration)
**And** Performance tests verify sustained 60fps during animations on target hardware

---

### Story 4.7: Implement Code-Anchored Alerts Next to Relevant Lines

As a developer,
I want alerts and issues displayed directly next to the relevant code lines,
So that I immediately see where problems are without searching.

**Acceptance Criteria:**

**Given** Reviewer agent identifies issues in code
**When** I implement code-anchored alert rendering in webview
**Then** Alerts are positioned adjacent to the relevant line of code in the editor
**And** Backend sends alert data via postMessage: `{ type: 'alert', line, column, severity, message, fix }`
**And** Severity levels: INFO (ℹ️), WARNING (⚠️), CRITICAL (🔴), URGENT (🚨)
**And** Alert appears as a small ideogram icon (16x16px) in editor gutter area
**And** Alert position synchronized with editor scroll using same algorithm as agent positioning
**And** Clicking alert expands inline panel showing:
  - Full message
  - Severity level with color coding
  - Proposed fix (if available)
  - "Apply Fix" button (if fix available)
**And** Inline panel uses smooth slide-in animation (200ms) from right
**And** Panel background has 90% opacity for clarity
**And** Multiple alerts on same line stack vertically with 4px spacing
**And** Alerts automatically reposition on editor resize or font size change
**And** Alerts fade out and remove when issue is resolved (diagnostic cleared)
**And** Alert icons use monochrome design consistent with sumi-e aesthetic
**And** Color coding: INFO (blue), WARNING (yellow), CRITICAL (orange), URGENT (red)
**And** Alerts avoid cursor using same anti-collision algorithm as agents
**And** Unit tests verify alert positioning calculation
**And** Integration tests verify alerts appear at correct line numbers

---

### Story 4.8: Implement Animated Brush Strokes for Agent Communication

As a developer,
I want to see animated brush strokes visualizing communication between agents,
So that I understand agent collaboration flow.

**Acceptance Criteria:**

**Given** Agents collaborate in a pipeline (Context → Architect → Coder → Reviewer)
**When** I implement brush stroke animations in webview
**Then** When Orchestrator passes data from one agent to another, webview receives postMessage: `{ type: 'agentCommunication', from, to }`
**And** A curved SVG path is drawn from source agent to target agent
**And** Path uses quadratic Bézier curve for organic brush-like appearance
**And** Path stroke is animated using stroke-dasharray and stroke-dashoffset
**And** Animation duration: 1 second from source to target
**And** Path opacity: 0 → 0.6 (fade in over 200ms) → 0.6 (hold for 600ms) → 0 (fade out over 200ms)
**And** Path color matches source agent's accent color
**And** Path stroke-width: 2px with round line caps
**And** Multiple simultaneous paths supported (Context → Architect and Context → Reviewer in parallel)
**And** Paths clear after animation completes (no accumulation)
**And** During intense collaboration (>3 communications in 2 seconds), all paths converge to center for fusion animation
**And** Brush stroke animation is GPU-accelerated using CSS transforms where possible
**And** Animation frame rate maintains 60fps with multiple concurrent paths
**And** Brush strokes can be toggled off via configuration for minimal distraction
**And** Unit tests verify path calculation between agent positions
**And** Visual regression tests verify brush stroke appearance

---

## Epic 5: User Modes & Customization

**Goal:** Developers customize their experience with Learning, Expert, Focus, Team, and Performance modes, plus accessibility features (High Contrast, colorblind alternatives, keyboard-only navigation).

**FRs Covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25

**NFRs Addressed:** NFR7 (keyboard-only), NFR8 (High Contrast 60%), NFR9 (colorblind alternatives), NFR10 (screen readers), NFR11 (configurable hotkeys)

---

### Story 5.1: Implement Mode System with Learning, Expert, Focus, Team, Performance

As a developer,
I want to switch between different operational modes that adjust UI and behavior,
So that the extension adapts to my current workflow and skill level.

**Acceptance Criteria:**

**Given** Different workflows require different levels of detail and distraction
**When** I implement mode management in ConfigurationManager and webview
**Then** Configuration includes `mode.current`: learning | expert | focus | team | performance
**And** A command `suika.setMode` allows mode selection via Quick Pick menu
**And** Mode changes are applied immediately without reloading extension
**And** Mode transitions use smooth animation (500ms) for UI changes
**And** **Learning Mode** behavior:
  - All reasoning and explanations expanded by default
  - Pedagogical annotations shown inline with code suggestions
  - Design pattern names linked to documentation
  - Agent tooltips include educational content
  - Slower state transitions (500ms) for clarity
**And** **Expert Mode** behavior:
  - Reasoning collapsed by default (click to expand)
  - Technical trade-offs, edge cases, and architecture justifications prioritized
  - Faster state transitions (200ms) for efficiency
  - Advanced metrics displayed (cache hit rate, token efficiency)
**And** **Focus/DND Mode** behavior:
  - Agents become invisible (opacity: 0, pointer-events: none)
  - Vital Signs Bar remains visible but minimized to 16px height
  - Code suggestions still appear but without agent visualization
  - Hotkey: Cmd+Shift+F (Mac) / Ctrl+Shift+F (Win/Linux) toggles Focus mode
**And** **Team Mode** behavior:
  - Agent labels include team member names (configurable)
  - Reasoning formatted for sharing in code reviews
  - Collaboration metrics visible (suggestions per developer)
  - Team cost tracking visible to all team members
**And** **Performance Mode** behavior:
  - Animations reduced: no pulse, no breathing, simple fades only
  - Agent icons use simpler SVG with fewer strokes
  - Update throttling increased to 200ms
  - GPU acceleration disabled for compatibility with low-end hardware
**And** Current mode displayed in Vital Signs Bar
**And** Mode persists across VSCode sessions
**And** Unit tests verify mode configuration changes apply correctly
**And** Integration tests verify UI changes reflect selected mode

---

### Story 5.2: Implement Three Transparency Levels (Minimal, Medium, Full)

As a developer,
I want to adjust HUD transparency to balance visibility and distraction,
So that I can customize the overlay intensity.

**Acceptance Criteria:**

**Given** Users have different preferences for UI opacity
**When** I implement transparency level controls
**Then** Configuration includes `ui.transparency`: minimal | medium | full
**And** A command `suika.setTransparency` allows selection via Quick Pick
**And** **Minimal transparency** (default: 20%):
  - Agents: 20% opacity when idle, 40% when active
  - Vital Signs Bar: 30% opacity
  - Alerts: 50% opacity
  - Designed for maximum focus on code, minimal distraction
**And** **Medium transparency** (default: 40%):
  - Agents: 40% opacity when idle, 60% when active
  - Vital Signs Bar: 50% opacity
  - Alerts: 70% opacity
  - Balanced visibility and distraction
**And** **Full transparency** (default: 60%):
  - Agents: 60% opacity when idle, 80% when active
  - Vital Signs Bar: 70% opacity
  - Alerts: 90% opacity
  - Maximum visibility for learning and collaboration
**And** Transparency changes apply immediately with smooth transition (300ms)
**And** Transparency settings persist across sessions
**And** In High Contrast mode (Story 5.5), minimum opacity is 60% regardless of transparency setting
**And** Unit tests verify opacity CSS values match transparency level
**And** Visual regression tests verify transparency appearance

---

### Story 5.3: Implement Auto-Adapt Opacity Based on User Activity Detection

As a developer,
I want HUD opacity to automatically increase when I'm reading code and decrease when I'm typing,
So that the overlay adapts to my current activity.

**Acceptance Criteria:**

**Given** User alternates between reading/reviewing code and active typing
**When** I implement activity detection in extension backend
**Then** Extension monitors `vscode.workspace.onDidChangeTextDocument` for typing activity
**And** Extension monitors cursor movement via `vscode.window.onDidChangeTextEditorSelection`
**And** Activity states: TYPING (active editing), READING (cursor moving but no edits), IDLE (no activity for 5 seconds)
**And** Activity state sent to webview via postMessage: `{ type: 'activityUpdate', state }`
**And** **TYPING state** opacity adjustments:
  - Agent base opacity reduced by 50% (e.g., 40% → 20%)
  - Agents move away from cursor more aggressively (10 lines instead of 5)
  - Transition: 200ms for quick response
**And** **READING state** opacity adjustments:
  - Agent base opacity increased by 25% (e.g., 40% → 50%)
  - Agents position closer to code sections (normal collision avoidance)
  - Transition: 500ms for smooth change
**And** **IDLE state** opacity adjustments:
  - Agent opacity returns to configured transparency level
  - Agents perform respiration pulse animations
  - Transition: 1000ms for gradual change
**And** Activity detection respects Focus mode (if Focus mode enabled, agents remain invisible)
**And** User can disable auto-adapt via configuration: `ui.autoAdaptOpacity`: boolean (default: true)
**And** Activity state debounced to prevent rapid flickering (minimum 500ms between state changes)
**And** Unit tests verify activity state detection logic
**And** Integration tests verify opacity changes match activity states

---

### Story 5.4: Implement Appearance Customization (Colors, Size, Position)

As a developer,
I want to customize agent colors, sizes, and Vital Signs Bar position,
So that the HUD matches my personal aesthetic preferences.

**Acceptance Criteria:**

**Given** Users have diverse visual preferences
**When** I implement appearance customization options
**Then** Configuration includes:
  - `ui.agentColors.architect`: Hex color (default: #4A90E2)
  - `ui.agentColors.coder`: Hex color (default: #50C878)
  - `ui.agentColors.reviewer`: Hex color (default: #E74C3C)
  - `ui.agentColors.context`: Hex color (default: #9B59B6)
  - `ui.agentSizeMultiplier`: Number 0.5-2.0 (default: 1.0)
  - `ui.vitalSignsPosition`: top | bottom (default: top)
**And** Color changes apply immediately to agent accent colors and communication paths
**And** Color validation ensures contrast ratio >4.5:1 with background for accessibility
**And** Size multiplier scales agent icons proportionally (32px base × multiplier)
**And** Vital Signs Bar position change includes smooth slide transition (400ms)
**And** A command `suika.customizeAppearance` opens webview customization panel
**And** Customization panel includes live preview of changes before applying
**And** Customization panel has "Reset to Defaults" button
**And** Custom colors are validated for sumi-e aesthetic consistency (optional warning if colors too vibrant)
**And** Appearance settings persist across sessions
**And** Unit tests verify color validation and size scaling
**And** Visual regression tests verify custom appearance rendering

---

### Story 5.5: Implement High Contrast Mode for Accessibility

As a developer with visual impairment,
I want a High Contrast mode with increased opacity and stronger visual differentiation,
So that I can easily see and distinguish UI elements.

**Acceptance Criteria:**

**Given** Some users require higher contrast for accessibility
**When** I implement High Contrast mode
**Then** Configuration includes `accessibility.highContrast`: boolean (default: false)
**And** A command `suika.toggleHighContrast` enables/disables High Contrast mode
**And** **High Contrast mode** adjustments:
  - All elements minimum 60% opacity (overrides transparency settings)
  - Agent icons have 2px black stroke outline for definition
  - Vital Signs Bar has solid background (80% opacity) instead of transparent
  - Alert icons increase from 16x16px to 24x24px
  - Text sizes increase by 20% (e.g., 14px → 16.8px)
  - Agent accent colors adjusted to WCAG AAA contrast ratio (>7:1)
**And** High Contrast mode is automatically enabled if VSCode theme is High Contrast
**And** Detection: `vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.HighContrast`
**And** High Contrast toggle confirmed with notification: "High Contrast mode enabled"
**And** Mode persists across sessions independently of VSCode theme changes
**And** High Contrast compatible with all other modes (Learning, Expert, etc.)
**And** Unit tests verify opacity and size adjustments in High Contrast mode
**And** Visual regression tests verify High Contrast appearance
**And** Accessibility audit verifies WCAG 2.1 Level AA compliance

---

### Story 5.6: Implement Colorblind Alternatives with Patterns and Adapted Colors

As a developer with color vision deficiency,
I want colorblind-friendly alternatives using patterns and adjusted colors,
So that I can distinguish agents and alerts by more than color alone.

**Acceptance Criteria:**

**Given** Color-only differentiation excludes users with color vision deficiency
**When** I implement colorblind accessibility features
**Then** Configuration includes `accessibility.colorblindMode`: none | deuteranopia | protanopia | tritanopia (default: none)
**And** A command `suika.setColorblindMode` allows mode selection via Quick Pick
**And** In colorblind mode, agents include pattern overlays in addition to colors:
  - Architect: Diagonal stripe pattern
  - Coder: Dotted pattern
  - Reviewer: Cross-hatch pattern
  - Context: Horizontal lines pattern
**And** Patterns are SVG-based and scale with agent size
**And** Patterns have 30% opacity to remain subtle
**And** Alert severity levels include shapes in addition to colors:
  - INFO: Circle ⭕
  - WARNING: Triangle △
  - CRITICAL: Square ■
  - URGENT: Hexagon ⬡
**And** Color palettes adjusted per colorblind mode:
  - **Deuteranopia** (red-green): Blues and yellows emphasized, reds → purples
  - **Protanopia** (red-green): Blues and yellows, similar to deuteranopia
  - **Tritanopia** (blue-yellow): Reds and greens emphasized, blues → grays
**And** Colorblind palette generated using Coblis or similar simulation tool
**And** All UI elements rely on shape, pattern, or text in addition to color (never color alone)
**And** Colorblind mode persists across sessions
**And** Unit tests verify pattern rendering for each agent
**And** Visual regression tests verify colorblind mode appearance with simulated CVD
**And** Accessibility audit verifies compliance with WCAG 2.1 Success Criterion 1.4.1 (Use of Color)

---

### Story 5.7: Implement Complete Keyboard-Only Navigation

As a developer who prefers keyboard navigation,
I want to navigate and control all HUD features using only keyboard,
So that I never need to use a mouse.

**Acceptance Criteria:**

**Given** Some users prefer or require keyboard-only interaction
**When** I implement keyboard navigation
**Then** All interactive elements are focusable with Tab key
**And** Focus order follows logical sequence: Vital Signs Bar → Agents (left to right) → Alerts (top to bottom)
**And** Focused elements have visible focus indicator: 2px dashed outline with 2px offset
**And** Focus indicator color contrasts with background (WCAG 2.1 Level AA)
**And** Arrow keys navigate between agents: Left/Right cycles through agents, Up/Down changes focused element type
**And** Enter key activates focused element:
  - Vital Signs Bar section: Expand panel
  - Agent: Open query dialog
  - Alert: Expand inline panel showing details
**And** Space key on alert with fix available: Apply fix
**And** Escape key: Close expanded panels, dialogs, or tooltips
**And** Hotkeys for common actions:
  - Cmd/Ctrl+Shift+F: Toggle Focus mode
  - Cmd/Ctrl+Shift+M: Cycle through modes
  - Cmd/Ctrl+Shift+T: Toggle High Contrast mode
  - Cmd/Ctrl+Shift+A: Focus first agent (enter agent navigation)
**And** Hotkeys are configurable via VSCode keybindings.json
**And** All hotkeys registered in package.json contributes.keybindings
**And** Screen reader announces focus changes: "Architect agent, thinking state"
**And** Screen reader announces state changes: "Reviewer agent transitioned to alert state"
**And** Keyboard navigation does not conflict with VSCode editor keybindings
**And** Unit tests verify focus order and hotkey handlers
**And** Integration tests verify keyboard navigation with simulated key events
**And** Accessibility audit verifies WCAG 2.1 Level AA keyboard accessibility compliance

---

### Story 5.8: Implement Screen Reader Support for Agent States and Alerts

As a developer using a screen reader,
I want audible announcements of agent states, alerts, and reasoning,
So that I can understand AI activity without visual feedback.

**Acceptance Criteria:**

**Given** Blind or low-vision developers use screen readers
**When** I implement screen reader support
**Then** All interactive elements have ARIA labels:
  - Agents: `aria-label="Architect agent, currently thinking"`
  - Vital Signs Bar sections: `aria-label="Token usage: 1250 prompt, 340 completion"`
  - Alerts: `aria-label="Critical alert on line 42: Potential null pointer exception"`
**And** Agent state changes trigger ARIA live regions: `<div role="status" aria-live="polite">`
**And** State change announcements: "Architect agent is now working"
**And** Alert creation triggers assertive live region: `<div role="alert" aria-live="assertive">`
**And** Alert announcements: "New critical alert on line 42: Potential null pointer exception"
**And** Agent reasoning and alternatives are accessible via aria-describedby
**And** Expanded panels (token breakdown, file list, cost breakdown) have semantic HTML:
  - Use `<ul>` for lists
  - Use `<details>` and `<summary>` for expandable content where appropriate
**And** All icons have text alternatives via aria-label or sr-only spans
**And** Focus management ensures screen reader cursor follows keyboard focus
**And** Long content (reasoning, alternatives) is wrapped in semantic sections with headings
**And** ARIA roles used appropriately: dialog, alertdialog, menu, menuitem, etc.
**And** Screen reader testing performed with NVDA (Windows), JAWS (Windows), VoiceOver (Mac)
**And** Unit tests verify ARIA attributes present and correct
**And** Accessibility audit verifies WCAG 2.1 Level AA screen reader compatibility

---

## Summary

This document contains **40 detailed user stories** across **Epics 1-5**:

- **Epic 1 (Project Foundation):** 8 stories covering Yeoman setup, dual-build, SecretStorage, ConfigurationManager, presets, export/import, ErrorHandler, and testing framework
- **Epic 2 (LLM Provider Integration):** 8 stories covering ILLMProvider interface, OpenAI/Anthropic providers, provider manager with fallbacks, hybrid L1+L2 cache, cache integration, cost tracking, and rate limiting/budgets
- **Epic 3 (AI Agent System):** 8 stories covering IAgent interface, Orchestrator Central Pattern, 4 specialized agents (Architect, Coder, Reviewer, Context), Dual State Pattern synchronization, and agent query interface
- **Epic 4 (Transparent HUD):** 8 stories covering webview overlay, sumi-e aesthetic SVG agents, Vital Signs Bar, spatial anti-collision, adaptive positioning, 60fps GPU-accelerated animations, code-anchored alerts, and animated brush strokes
- **Epic 5 (User Modes & Customization):** 8 stories covering 5 operational modes (Learning, Expert, Focus, Team, Performance), 3 transparency levels, auto-adapt opacity, appearance customization, High Contrast mode, colorblind alternatives, keyboard-only navigation, and screen reader support

Each story includes:
- User persona and value proposition (As a... I want... So that...)
- Detailed acceptance criteria in Given/When/Then/And format
- Technical specifications referencing architecture requirements
- Cross-references to related epics and stories
- Testability considerations (unit, integration, visual regression, accessibility)

All stories are:
- ✅ Independent (no forward dependencies)
- ✅ Completable by single dev agent
- ✅ Testable with specific acceptance criteria
- ✅ Aligned with PRD, Architecture, and UX Design specifications
- ✅ Covering all FRs and NFRs assigned to each epic
