---
project_name: 'suika'
user_name: 'Jeregoupix'
date: '2026-01-10'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'critical_rules']
status: 'complete'
rule_count: 95
optimized_for_llm: true
architecture_source: '_bmad-output/planning-artifacts/architecture.md'
---

# Project Context for AI Agents: suika

_This file contains critical rules and patterns that AI agents MUST follow when implementing the suika VSCode extension. Focus on unobvious details and architectural decisions that prevent implementation conflicts._

**⚠️ MANDATORY READING:** All AI agents must read the complete architecture document at `_bmad-output/planning-artifacts/architecture.md` before implementing any code.

---

## Technology Stack & Versions

### Core Technologies

**Runtime & Platform:**
- **TypeScript:** 5.3.3 (strict mode REQUIRED)
- **Node.js:** 16+ minimum
- **VSCode Extension API:** 1.75+ minimum
- **Build Tool:** esbuild (NOT webpack) - for ultra-fast compilation (<1s)

**Key Decision:** The project uses **Vanilla JavaScript for webview UI** (NOT React) to achieve 60fps performance requirements with <100ms response time.

### Dependencies (To Be Installed After Yeoman)

**VSCode Extension:**
```json
{
  "dependencies": {
    "@types/node": "16.x",
    "@types/vscode": "^1.75.0",
    "vscode-languageserver": "^9.0.0"
  },
  "devDependencies": {
    "esbuild": "latest",
    "typescript": "5.3.3",
    "@vscode/test-electron": "latest",
    "mocha": "latest"
  }
}
```

### Configuration Files

**tsconfig.json (CRITICAL):**
- `strict: true` - MANDATORY, no exceptions
- `target: "ES2020"`
- `module: "commonjs"` for Node.js compatibility
- `esModuleInterop: true`
- `forceConsistentCasingInFileNames: true`
- `skipLibCheck: true` for faster builds

**esbuild config:**
- Dual-build setup (extension + webview as separate bundles)
- Watch mode for development
- Source maps enabled

---

## Architecture Decisions (From architecture.md)

### Decision #1: Orchestrator Central Pattern

**CRITICAL RULE:** The `AgentOrchestrator` is the ONLY component that calls agents. Agents NEVER call each other directly.

```typescript
// ✅ CORRECT
class AgentOrchestrator {
  async processRequest(request: IAgentRequest) {
    const context = await this.contextAgent.loadFiles(request);
    const analysis = await this.architectAgent.analyze(context);
    const code = await this.coderAgent.generate(analysis);
    const review = await this.reviewerAgent.validate(code);
    return this.synthesize(review);
  }
}

// ❌ INCORRECT - Agent calling another agent directly
class CoderAgent {
  async generate() {
    const context = await this.contextAgent.loadFiles(); // FORBIDDEN!
  }
}
```

### Decision #2: ILLMProvider Abstraction

**CRITICAL RULE:** NEVER call LLM providers (OpenAI, Anthropic) directly. Always use `ILLMProvider` interface through `LLMProviderManager`.

```typescript
// ✅ CORRECT
class ArchitectAgent {
  constructor(private llmManager: LLMProviderManager) {}

  async analyze(context: string): Promise<string> {
    return await this.llmManager.callLLM('architect', prompt, context);
  }
}

// ❌ INCORRECT - Direct provider call
import OpenAI from 'openai';
const openai = new OpenAI(); // FORBIDDEN in agents!
```

### Decision #3: Dual State Pattern

**CRITICAL RULE:** Backend (Node.js) is the ONLY source of truth for state. Frontend (Browser/Webview) is a read-only mirror that receives updates via `postMessage`.

```typescript
// ✅ CORRECT - Backend updates state and syncs
class ExtensionStateManager {
  updateAgentState(agent: AgentType, status: AgentStatus) {
    this.state.agents.set(agent, { status, lastUpdate: Date.now() });

    // Sync to webview instantly (no throttle for agents)
    this.webviewPanel.webview.postMessage({
      type: 'toWebview:agentStateUpdate',
      agent,
      status
    });
  }
}

// ❌ INCORRECT - Webview trying to be source of truth
class WebviewStateManager {
  updateAgent(agent, status) {
    this.state.agents[agent] = status; // FORBIDDEN! Frontend is read-only
  }
}
```

### Decision #4: Hybrid Cache Strategy

**CRITICAL RULE:** All LLM calls MUST go through the cache layer. Cache is L1 (memory LRU) + L2 (file system).

```typescript
// ✅ CORRECT - Cache is private to LLMProviderManager
class LLMProviderManager {
  private cache: HybridLLMCache;

  async callLLM(agentType, prompt, context) {
    const cacheKey = this.generateCacheKey(agentType, prompt, context);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const response = await provider.generateCompletion(prompt);
    await this.cache.set(cacheKey, response);
    return response;
  }
}

// ❌ INCORRECT - Agent bypassing cache
class CoderAgent {
  async generate() {
    const response = await this.llmProvider.generateCompletion(); // No cache!
  }
}
```

---

## Implementation Patterns (35 Patterns - MUST FOLLOW EXACTLY)

### Category 1: Naming Conventions

#### 1.1 Interface Naming
```typescript
// ✅ CORRECT - "I" prefix for ALL interfaces
interface ILLMProvider { }
interface IAgent { }
interface IAgentState { }
interface ILLMResponse { }

// ❌ INCORRECT
interface LLMProvider { }  // Missing "I"
interface Agent { }        // Missing "I"
```

#### 1.2 Class Naming
```typescript
// ✅ CORRECT - Descriptive suffix
class ArchitectAgent { }
class CoderAgent { }
class LLMProviderManager { }
class ExtensionStateManager { }

// ❌ INCORRECT
class Architect { }      // No suffix
class Coder { }          // No suffix
class LLMManager { }     // Not descriptive enough
```

#### 1.3 Method Naming
```typescript
// ✅ CORRECT - camelCase, verb-first, descriptive
async generateCompletion(prompt: string): Promise<ILLMResponse> { }
async updateAgentState(agent: AgentType, status: AgentStatus): void { }
getModelInfo(model: string): IModelInfo { }

// ❌ INCORRECT
async completion(prompt: string) { }        // No verb
async update_agent_state() { }              // snake_case forbidden
async GetModelInfo() { }                    // PascalCase forbidden
```

#### 1.4 Private Members
```typescript
// ✅ CORRECT - Use 'private' keyword only, NO underscore
class LLMProviderManager {
  private cache: HybridLLMCache;
  private providers: Map<string, ILLMProvider>;
}

// ❌ INCORRECT
class LLMProviderManager {
  private _cache: HybridLLMCache;      // Underscore forbidden
  #providers: Map<>;                    // # syntax not used
}
```

#### 1.5 File Naming
```typescript
// ✅ CORRECT - kebab-case for ALL files
architect-agent.ts
llm-provider-manager.ts
extension-state-manager.ts
hybrid-llm-cache.ts

// ❌ INCORRECT
ArchitectAgent.ts         // PascalCase forbidden
llm_provider_manager.ts   // snake_case forbidden
LLMProviderManager.ts     // PascalCase forbidden
```

### Category 2: Project Structure

#### 2.1 Agent Organization
```
✅ CORRECT - Folder per agent with barrel exports
src/agents/
  architect/
    index.ts              # Barrel export: export * from './architect-agent'
    architect-agent.ts    # Main agent class
    architect-prompts.ts  # Prompts
    __tests__/            # Co-located tests
      architect-agent.test.ts
  coder/
    index.ts
    coder-agent.ts
    ...

❌ INCORRECT - Flat structure
src/agents/
  architect-agent.ts
  coder-agent.ts
  reviewer-agent.ts
```

#### 2.2 LLM Provider Organization
```
✅ CORRECT - All LLM code in src/llm/
src/llm/
  provider.interface.ts      # ILLMProvider
  provider-manager.ts        # LLMProviderManager
  cache.ts                   # HybridLLMCache
  providers/
    openai-provider.ts
    anthropic-provider.ts
  __tests__/

❌ INCORRECT - Scattered across project
src/
  providers/              # Wrong location
  llm-manager.ts         # Should be in llm/
```

#### 2.3 Test Organization
```
✅ CORRECT - Co-located __tests__/ subdirectories
src/agents/architect/__tests__/architect-agent.test.ts
src/llm/__tests__/provider-manager.test.ts
src/state/__tests__/extension-state-manager.test.ts

❌ INCORRECT - Separate test/ directory
test/
  agents/
    architect-agent.test.ts
```

#### 2.4 Webview Organization
```
✅ CORRECT - Component-based structure
src/webview/
  components/
    agent-component.js        # Vanilla JS class
    vital-signs-bar.js
    alert-component.js
  state/
    state-manager.js          # Frontend state (read-only)
  styles/
    main.css
    animations.css
    components/
      agent.css

❌ INCORRECT - Monolithic structure
src/webview/
  index.html
  script.js               # All logic in one file
  style.css
```

#### 2.5 Utils Organization
```
✅ CORRECT - Domain-specific co-located, truly shared in src/utils/
src/llm/llm-utils.ts           # LLM-specific utils
src/agents/agent-utils.ts      # Agent-specific utils
src/utils/
  logger.ts                     # Truly shared
  error-handler.ts              # Truly shared

❌ INCORRECT - Everything in src/utils/
src/utils/
  llm-cache-utils.ts      # Should be in src/llm/
  agent-helpers.ts        # Should be in src/agents/
```

### Category 3: Message Format Patterns

#### 3.1 Direction Prefix
```typescript
// ✅ CORRECT - Direction prefix (toWebview: or toExtension:)
{ type: 'toWebview:agentStateUpdate', agent: 'architect', status: 'thinking' }
{ type: 'toWebview:vitalSignsUpdate', tokens: 1500, files: 3 }
{ type: 'toExtension:suggestionAccepted', suggestionId: 'xyz' }

// ❌ INCORRECT - No direction prefix
{ type: 'agentStateUpdate' }      // Ambiguous direction
{ type: 'update' }                // Not descriptive
```

#### 3.2 Agent Messages
```typescript
// ✅ CORRECT - Include agent identifier and full state
{
  type: 'toWebview:agentStateUpdate',
  agent: 'architect' | 'coder' | 'reviewer' | 'context',
  status: 'idle' | 'thinking' | 'working' | 'success' | 'error',
  currentTask?: string,
  lastUpdate: number
}

// ❌ INCORRECT - Missing critical fields
{
  type: 'toWebview:agentStateUpdate',
  agent: 'architect',
  status: 'working'
  // Missing lastUpdate timestamp
}
```

### Category 4: State Management Patterns

#### 4.1 Immutable State Updates
```typescript
// ✅ CORRECT - Always use spread operators for immutability
updateAgentState(agent: AgentType, status: AgentStatus) {
  const currentState = this.state.agents.get(agent);
  const newState: IAgentState = {
    ...currentState,    // Spread existing
    status,             // Update specific fields
    lastUpdate: Date.now()
  };
  this.state.agents.set(agent, newState);
}

// ❌ INCORRECT - Mutating state directly
updateAgentState(agent: AgentType, status: AgentStatus) {
  this.state.agents.get(agent).status = status;  // FORBIDDEN mutation!
}
```

#### 4.2 State Access
```typescript
// ✅ CORRECT - Private state, public getters
class ExtensionStateManager {
  private state: IExtensionState;

  getAgentState(agent: AgentType): IAgentState | undefined {
    return this.state.agents.get(agent);
  }
}

// ❌ INCORRECT - Public state
class ExtensionStateManager {
  public state: IExtensionState;  // Direct access forbidden!
}
```

### Category 5: Error Handling Patterns

#### 5.1 Specialized Error Classes
```typescript
// ✅ CORRECT - Extend base AI101Error
class LLMProviderError extends AI101Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message, 'LLM_PROVIDER_ERROR');
  }
}

// ❌ INCORRECT - Generic Error
throw new Error('LLM failed');  // Not specific enough
```

#### 5.2 Error Throwing (Never Return Null)
```typescript
// ✅ CORRECT - Throw errors
async generateCompletion(prompt: string): Promise<ILLMResponse> {
  if (!prompt) {
    throw new ValidationError('Prompt cannot be empty');
  }
  // ... implementation
}

// ❌ INCORRECT - Return null/undefined
async generateCompletion(prompt: string): Promise<ILLMResponse | null> {
  if (!prompt) return null;  // FORBIDDEN!
}
```

#### 5.3 Structured Logging
```typescript
// ✅ CORRECT - Structured logging with context
this.logger.error('LLM provider call failed', {
  provider: 'openai',
  model: 'gpt-4',
  error: error.message,
  statusCode: error.statusCode,
  timestamp: Date.now()
});

// ❌ INCORRECT - Unstructured logging
console.error('Error:', error);  // Missing context
```

### Category 6: API Patterns

#### 6.1 Async/Await Everywhere
```typescript
// ✅ CORRECT - async/await
async processRequest(request: IAgentRequest): Promise<IResponse> {
  const context = await this.contextAgent.loadFiles(request);
  const result = await this.coderAgent.generate(context);
  return result;
}

// ❌ INCORRECT - Promises with .then()
processRequest(request: IAgentRequest): Promise<IResponse> {
  return this.contextAgent.loadFiles(request)
    .then(context => this.coderAgent.generate(context));  // Avoid .then()
}
```

#### 6.2 Interface-First Design
```typescript
// ✅ CORRECT - Define interface first
interface ILLMProvider {
  readonly name: string;
  generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse>;
  estimateTokens(text: string): number;
}

class OpenAIProvider implements ILLMProvider {
  readonly name = 'openai';
  async generateCompletion(prompt: string, options?: ILLMOptions) { }
  estimateTokens(text: string): number { }
}

// ❌ INCORRECT - Implementation without interface
class OpenAIProvider {  // No interface
  async generateCompletion() { }
}
```

### Category 7: CSS/Webview Patterns

#### 7.1 BEM Naming Convention
```css
/* ✅ CORRECT - BEM (Block__Element--Modifier) */
.agent { }
.agent__icon { }
.agent__label { }
.agent--thinking { }
.agent__icon--large { }

/* ❌ INCORRECT */
.agent-icon { }         /* Not BEM */
.agentThinking { }      /* camelCase forbidden */
```

#### 7.2 CSS Variables for Theme
```css
/* ✅ CORRECT - CSS variables for all theme values */
:root {
  --agent-color-architect: #4A90E2;
  --agent-color-coder: #50C878;
  --agent-color-reviewer: #FF6B6B;
  --agent-color-context: #9B59B6;

  --agent-opacity-idle: 0.05;
  --agent-opacity-thinking: 0.15;
  --agent-opacity-working: 0.30;
  --agent-opacity-active: 0.40;

  --animation-duration-normal: 300ms;
  --animation-duration-fast: 150ms;
}

/* ❌ INCORRECT - Hard-coded values */
.agent {
  color: #4A90E2;     /* Should use var() */
  opacity: 0.3;       /* Should use var() */
}
```

#### 7.3 GPU-Accelerated Animations
```css
/* ✅ CORRECT - transform: translate3d() for GPU acceleration */
.agent--thinking {
  animation: agent-breathe 2s ease-in-out infinite;
  will-change: transform, opacity;  /* CRITICAL for 60fps */
}

@keyframes agent-breathe {
  0%, 100% {
    transform: translate3d(0, 0, 0);  /* Force GPU layer */
    opacity: 0.05;
  }
  50% {
    transform: translate3d(0, -2px, 0);
    opacity: 0.15;
  }
}

/* ❌ INCORRECT - top/left mutations (triggers layout) */
@keyframes agent-breathe {
  0%, 100% { top: 0; }      /* SLOW! Triggers layout recalc */
  50% { top: -2px; }
}
```

#### 7.4 Vanilla JavaScript Components
```javascript
// ✅ CORRECT - ES6 class-based components
class AgentComponent {
  constructor(containerId, agentId, agentName, agentIcon) {
    this.element = null;
    this.state = { status: 'idle', opacity: 0.05 };
    this.animationFrameId = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'agent agent--idle';
    this.element.dataset.agentId = this.agentId;
    // ... BEM structure
    this.attachEventListeners();
  }

  updateStatus(newStatus) {
    requestAnimationFrame(() => {  // CRITICAL for 60fps
      this.element.classList.remove('agent--idle', 'agent--thinking');
      this.element.classList.add(`agent--${newStatus}`);
    });
  }

  destroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.element) this.element.remove();
  }
}

// ❌ INCORRECT - Direct DOM manipulation without RAF
updateStatus(newStatus) {
  this.element.style.opacity = '0.4';  // Sync DOM mutation = janky
}
```

---

## Critical Rules for AI Agents

### 🚫 FORBIDDEN PATTERNS

1. **NEVER mutate state directly** - Always use immutable patterns (spread operators, map, filter)
2. **NEVER call LLM providers directly** - Always through ILLMProvider interface
3. **NEVER let agents call other agents** - Only orchestrator coordinates agents
4. **NEVER use underscore prefix** for private members - Use `private` keyword only
5. **NEVER return null/undefined** for errors - Always throw specialized error classes
6. **NEVER use .then()** for promises - Always use async/await
7. **NEVER hard-code values** in CSS - Always use CSS variables
8. **NEVER use top/left** for animations - Always use transform: translate3d()
9. **NEVER use React** in webview - Use Vanilla JavaScript with ES6 classes
10. **NEVER import 'vscode' module** outside extension.ts and webview-provider.ts

### ✅ ALWAYS DO

1. **ALWAYS read architecture.md** before implementing any code
2. **ALWAYS use interface-first design** - Define IInterface before implementation
3. **ALWAYS use TypeScript strict mode** - No `any` types without explicit justification
4. **ALWAYS co-locate tests** in `__tests__/` subdirectories
5. **ALWAYS use requestAnimationFrame** for DOM updates in webview
6. **ALWAYS use will-change: transform** for animated elements (60fps requirement)
7. **ALWAYS use direction prefix** in postMessage types (toWebview:/toExtension:)
8. **ALWAYS log errors** with structured context (provider, model, timestamp, etc.)
9. **ALWAYS use kebab-case** for file names
10. **ALWAYS use BEM** for CSS class names

### 🎯 Performance Critical Rules

**60fps Animation Requirement:**
- Use `transform: translate3d()` for all position changes (GPU-accelerated)
- Use `will-change: transform, opacity` on animated elements
- Use `requestAnimationFrame()` for all DOM mutations
- Throttle Vital Signs updates to 100ms (but agent state updates are instant 0ms)

**<100ms Response Time Requirement:**
- LLM cache MUST have >50% hit rate (L1 memory + L2 file system)
- Backend state sync to webview is instant (no throttle for agent state)
- Use esbuild (NOT webpack) for <1s builds

**<$0.10/Session Cost Requirement:**
- All LLM calls MUST go through HybridLLMCache
- Rate limiting configured per user
- Token estimation before every call

### 🔒 Security Critical Rules

1. **API Keys:** ALWAYS use VSCode `SecretStorage`, NEVER environment variables or config files
2. **Code Logging:** NEVER log user code without explicit consent (zero code logging default)
3. **HTTPS/TLS:** ALWAYS use encrypted connections for LLM providers
4. **Telemetry:** ALWAYS opt-in by default (not opt-out)

### 🧪 Testing Critical Rules

1. **Coverage:** Target >70% test coverage (unit + integration)
2. **Co-location:** Tests in `__tests__/` subdirectories next to code
3. **Framework:** Mocha + @vscode/test-electron for VSCode extensions
4. **Mocking:** Mock LLM providers, never call real APIs in tests

---

## VSCode Extension Specific Rules

### Extension Context vs Webview Context

**Extension Context (Node.js):**
- Backend logic, state management, agent orchestration
- Only `extension.ts` and `webview-provider.ts` can import `vscode` module
- Source of truth for all state

**Webview Context (Browser):**
- UI rendering, animations, user interactions
- Vanilla JavaScript (ES6 classes), NO React
- Read-only mirror of backend state
- Communicates via `postMessage` API

### postMessage Communication

```typescript
// Backend → Webview
webviewPanel.webview.postMessage({
  type: 'toWebview:agentStateUpdate',
  agent: 'architect',
  status: 'thinking',
  currentTask: 'Analyzing project structure'
});

// Webview → Backend
vscode.postMessage({
  type: 'toExtension:suggestionAccepted',
  suggestionId: 'xyz',
  timestamp: Date.now()
});
```

### Configuration Management

```typescript
// ✅ CORRECT - VSCode Configuration API
const config = vscode.workspace.getConfiguration('ai101');
const llmProvider = config.get<string>('llm.defaultProvider', 'openai');

// ✅ CORRECT - VSCode SecretStorage for API keys
await context.secrets.store('suika.openai.apiKey', apiKey);
const apiKey = await context.secrets.get('suika.openai.apiKey');

// ❌ INCORRECT - Environment variables for secrets
const apiKey = process.env.OPENAI_API_KEY;  // FORBIDDEN!
```

---

## Project Initialization Sequence

When starting implementation, follow this exact sequence:

### 1. Initialize Base Extension (Story 1)

```bash
npx --package yo --package generator-code -- yo code

# Selections:
# - Type: New Extension (TypeScript)
# - Name: suika
# - Identifier: suika
# - Description: VSCode AI agents with transparent HUD
# - Bundler: esbuild (CRITICAL - NOT webpack)
# - Package manager: npm
```

### 2. Configure Dual-Build (esbuild)

Create `esbuild.config.js` with TWO builds:
- Extension build (Node.js target, entry: `src/extension.ts`)
- Webview build (Browser target, entry: `src/webview/main.js`)

### 3. Create Directory Structure

```bash
mkdir -p src/{agents/{architect,coder,reviewer,context,shared},llm/{providers,__tests__},state,webview/{components,state,styles/components},config,commands,errors,utils}
```

### 4. Install Dependencies

```bash
npm install @types/node@16.x @types/vscode@^1.75.0
npm install -D esbuild typescript@5.3.3 @vscode/test-electron mocha
```

### 5. Configure TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 6. Follow Implementation Sequence

Refer to architecture.md "Implementation Handoff" section for the recommended story sequence (Configuration Manager → LLM abstraction → State Management → Agents → Webview → Cache → Features).

---

## Usage Guidelines

### For AI Agents:

**Before implementing any code:**
1. **Read architecture.md first** - Understand the complete architectural decisions
2. **Read this file (project-context.md)** - Understand implementation-level rules
3. **Follow ALL rules exactly** as documented - No exceptions
4. **When in doubt**, prefer the more restrictive option
5. **Update this file** if new patterns emerge during implementation

**During implementation:**
- Reference specific sections as needed (e.g., "Language-Specific Rules" for TypeScript patterns)
- Check "Critical Don't-Miss Rules" before committing code
- Validate against "Performance Critical Rules" for UI components
- Consult "Testing Rules" before writing tests

### For Humans:

**Maintaining this file:**
- Keep this file **lean and focused** on agent needs only
- **Update immediately** when technology stack changes
- **Review quarterly** for outdated or obvious rules
- **Remove rules** that become common knowledge over time
- **Add new rules** when agents make repeated mistakes

**Best practices:**
- Each rule should be **specific and actionable** (not generic advice)
- Focus on **unobvious patterns** that agents might miss
- Include **✅ CORRECT / ❌ INCORRECT examples** for clarity
- Keep total file length under 1000 lines for LLM efficiency

---

## Questions or Conflicts?

If you encounter any ambiguity or conflict between this document and architecture.md:

1. **Architecture.md is the source of truth** for all architectural decisions
2. **This file (project-context.md) complements** with implementation-level rules
3. **Ask user for clarification** if both documents are unclear

---

**Last Updated:** 2026-01-10
**Document Maintenance:** Update this file when new patterns emerge during implementation or when architectural decisions change.
