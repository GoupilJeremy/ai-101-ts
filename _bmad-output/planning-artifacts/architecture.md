---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
workflowType: 'architecture'
project_name: 'suika'
user_name: 'Jeregoupix'
date: '2026-01-10'
lastStep: 8
status: 'complete'
completedAt: '2026-01-10'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

Le projet comprend **75 Functional Requirements** organisés en **11 capability areas**:

1. **Multi-Agent AI System (FR1-FR8):** 4 agents IA distincts (Architecte, Codeur, Reviewer, Contexte) avec états temps réel, collaboration visible, attribution des suggestions, raisonnement exposé, et fusion visuelle collective

2. **Visualisation & HUD Interface (FR9-FR16):** HUD overlay transparent, positionnement adaptatif, anti-obstruction automatique, Vital Signs Bar, 4 niveaux d'alertes, animations 60fps, code-anchored alerts

3. **Modes & Personnalisation (FR17-FR25):** Mode Focus/DND, 3 niveaux transparence, adaptation automatique, modes Learning/Expert/Team/Performance

4. **Gestion LLM & Providers (FR26-FR33):** Multi-provider simultané (OpenAI, Anthropic), configuration par agent, providers personnalisés via `ILLMProvider`, fallbacks automatiques, cache intelligent (>50% hit rate), rate limiting, support on-premise

5. **Gestion Contexte & Intelligence (FR34-FR41):** Chargement automatique fichiers pertinents, optimisation tokens, analyse architecture projet, validation sécurité temps réel

6. **Interaction & Commandes (FR42-FR48):** Hotkeys, Command Palette, drag-and-drop, navigation keyboard-only

7. **Configuration & Installation (FR49-FR54):** <2min installation Marketplace, SecretStorage pour API keys, cross-platform, templates configuration

8. **Monitoring & Analytics (FR55-FR59):** Métriques utilisation, telemetry opt-in, logging troubleshooting

9. **Extensibilité & API Publique (FR60-FR64):** Interfaces `ILLMProvider` et `IAgentRenderer`, event system, semantic versioning

10. **Documentation & Support (FR65-FR70):** Onboarding intégré, knowledge base searchable, messages d'erreur clairs

11. **Validation & Metrics (FR71-FR75):** Tracking taux acceptation (>60%), surveys compréhension (8/10), NPS, détection "trop distrayant" (0 target)

**Non-Functional Requirements:**

**34 NFRs across 8 catégories** qui vont façonner profondément l'architecture:

**Performance (6 NFRs - CRITIQUES):**
- 60fps animations constant avec GPU acceleration
- <100ms UI response time pour toutes interactions
- <2s startup time extension
- Support 10+ sessions/jour sans dégradation
- CSS `will-change: transform` optimisation
- Async rendering non-blocking

**Accessibility (5 NFRs):**
- Navigation keyboard-only complète
- High contrast mode (60% opacité min)
- Alternatives daltonisme
- Screen reader compatible
- Hotkeys configurables

**Security & Privacy (5 NFRs):**
- VSCode SecretStorage pour API keys (encrypted)
- Zero code logging sans consentement explicite
- Telemetry opt-in par défaut
- HTTPS/TLS pour communications LLM
- Support LLMs on-premise pour compliance entreprise

**Maintainability & Code Quality (6 NFRs):**
- >70% test coverage (unitaires + intégration)
- TypeScript strict mode obligatoire
- Architecture découplée (Agents, Renderers, Providers séparables)
- Documentation API auto-générée
- Patterns cohérents pour contributions open-source
- Semantic versioning pour stabilité API publique

**Cost Management (4 NFRs - CRITIQUES):**
- <$0.10/session coûts LLM moyens
- >50% cache hit rate pour requêtes répétées
- Budgets et rate limiting configurables par utilisateur
- Métriques coûts visibles temps réel

**Reliability & Stability (5 NFRs):**
- 0 tolérance crash au startup (CRITIQUE)
- Cross-platform Mac/Windows/Linux sans dégradation
- Fallbacks LLM providers automatiques et transparents
- Graceful error handling (timeouts réseau, API failures)
- Logs erreurs avec contexte suffisant pour troubleshooting

**Compatibility & Portability (4 NFRs):**
- Node 16+ minimum
- VSCode 1.75+ minimum
- Configurations portables entre machines (export/import)
- Compatible yarn/pnpm pour contributors

**Usability (4 NFRs):**
- <2min installation depuis VSCode Marketplace
- <5min configuration initiale (API keys) avec flow guidé
- Messages d'erreur avec liens documentation/troubleshooting
- Tooltips contextuels pour découvrabilité features

**Scale & Complexity:**

- **Primary Domain:** Developer Tool (VSCode Extension)
- **Complexity Level:** Medium-High
- **Estimated Components:** 15-20 major architectural components

**Justification Complexity Level:**
- **Medium aspects:** Single-platform (VSCode), no distributed backend, no regulatory compliance, established tech stack
- **High aspects:** Multi-agent orchestration complexity, real-time UI updates (60fps), multi-provider LLM integration, performance critiques strictes (<100ms, <$0.10/session), cache optimization, state synchronization across agents

### Technical Constraints & Dependencies

**Platform Constraints:**
- **VSCode Extension API:** Version 1.75+ required
- **Node.js Runtime:** 16+ required
- **Cross-Platform Requirement:** Mac, Windows, Linux - zero degradation acceptable
- **Rendering Context:** VSCode Webview API (browser-like environment avec restrictions sandboxing)

**Language & Runtime:**
- TypeScript 5.x avec strict mode enabled
- ES2020 target pour balance compatibilité/features modernes
- npm comme package manager principal
- Distribution via VSCode Marketplace (.vsix packaging)

**External Dependencies (CRITICAL):**
- **LLM Providers:** OpenAI API, Anthropic Claude API (minimum 2 providers required simultanément)
- **VSCode APIs:** Webview API (HUD rendering), Extension API (lifecycle), Workspace API (file access), SecretStorage API (API keys encryption)
- **Optional Future:** Support LLMs locaux (Ollama) pour offline/enterprise compliance

**Performance Constraints (HARD REQUIREMENTS):**
- <100ms UI response time (non-négociable pour UX)
- 60fps animations constant (GPU-accelerated obligatoire)
- <2s extension startup time
- <$0.10 per session LLM costs (soutenabilité économique modèle gratuit)
- >50% cache hit rate pour LLM requests
- Support 10+ sessions par jour sans memory leaks ou dégradation

**Security Constraints:**
- API keys stockées exclusivement via VSCode SecretStorage (encrypted at rest)
- Aucun code utilisateur loggé sans consentement explicite opt-in
- HTTPS/TLS obligatoire pour toutes communications LLM providers
- Support LLMs on-premise pour enterprises avec compliance stricte

### Cross-Cutting Concerns Identified

**1. Real-Time Performance & Rendering (CRITIQUE #1)**

Impact: Frontend rendering architecture, state management, animation system

- 60fps animations constant pour HUD overlay, agents, transitions états
- <100ms UI response time pour toutes interactions utilisateur
- Async rendering non-blocking - édition code ne doit JAMAIS être bloquée par HUD
- GPU acceleration requise (CSS transforms, will-change properties)
- Web Workers potentiels pour offload calculs lourds?

**Décisions architecturales impactées:**
- Rendering engine design (React? Preact? Vanilla JS optimisé?)
- State management strategy (éviter re-renders inutiles)
- Animation implementation (CSS vs Canvas vs SVG)
- Webview communication protocol (message passing optimisé)

**2. State Management & Multi-Agent Synchronization (CRITIQUE #2)**

Impact: Core architecture, agent communication, context sharing

- 4 agents + 1 orchestrator avec états individuels à synchroniser
- Agent lifecycle management (idle → thinking → working → alert → success)
- Context partagé entre agents (fichiers chargés, tokens consommés, LLM state)
- UI state sync avec backend agent state (temps réel, sans lag)
- Mode changes affectent tous les agents simultanément

**Décisions architecturales impactées:**
- Event-driven architecture vs polling
- Message bus ou pub/sub pattern
- State consistency guarantees
- Conflict resolution si agents état incompatible

**3. Cost Optimization & LLM Management (CRITIQUE #3)**

Impact: Backend architecture, caching strategy, provider abstraction

- Caching layer intelligent (>50% hit rate target)
- Rate limiting et budget controls per-user configurables
- Distribution intelligente LLMs (expensive models seulement où nécessaire)
- Fallback providers pour cost management ET reliability
- Token counting précis avant appels LLM

**Décisions architecturales impactées:**
- Cache storage strategy (file system? in-memory? hybrid?)
- Cache invalidation logic
- Provider abstraction layer design
- Cost tracking et reporting system

**4. Extensibility & Plugin Architecture (LONG-TERME)**

Impact: API design, interface stability, versioning strategy

- Public API pour custom LLM providers (`ILLMProvider` interface)
- Custom agent renderers (`IAgentRenderer` interface)
- Event lifecycle hooks (onAgentActivated, onSuggestionAccepted, etc.)
- Configuration presets system (solo-dev, team, enterprise)
- Semantic versioning avec backward compatibility promises

**Décisions architecturales impactées:**
- Interface design et surface API minimale
- Plugin loading mechanism
- Sandboxing pour security
- Deprecation strategy

**5. Multi-Mode Adaptability (UX-DRIVEN)**

Impact: State management, context detection, UI rendering

- 5+ modes: Learning, Expert, Focus/DND, Team, Performance
- Context-aware auto-switching (détection coding activity, machine performance)
- Transitions fluides sans restart extension
- User override toujours possible (hotkeys)
- Mode state persistence entre sessions

**Décisions architecturales impactées:**
- Mode state machine design
- Context detection algorithms
- Transition animation system
- Preference storage strategy

**6. Observability, Debugging & Telemetry (OPS)**

Impact: Logging architecture, telemetry pipeline, error reporting

- Telemetry opt-in avec transparence totale (pas de code data)
- Error logging avec contexte troubleshooting suffisant
- Performance metrics tracking (CPU, memory, LLM latency)
- Team metrics pour tech leads (adoption, comprehension, quality)
- Local logs vs remote telemetry

**Décisions architecturales impactées:**
- Logging framework selection
- Telemetry pipeline design
- Privacy-preserving analytics
- Error reporting service integration

## Starter Template Evaluation

### Primary Technology Domain

**VSCode Extension Development** (Desktop Developer Tool)

Domain spécialisé distinct des web apps classiques. Architecture hybride: Extension backend (Node.js context) + Webview frontend (browser context) avec communication via message passing.

### Technical Preferences Established

**Platform & Runtime:**
- TypeScript 5.x avec strict mode (non-négociable du PRD)
- Node 16+ minimum
- VSCode Extension API 1.75+
- Cross-platform: Mac, Windows, Linux (zero degradation)

**Build & Development:**
- npm comme package manager standard
- esbuild préféré pour build speed (vs webpack)
- Dual-build configuration: extension (Node.js) + webview (browser)

**UI Framework Decision (CRITIQUE):**
- Vanilla JavaScript choisi pour webview (vs React/Preact)
- Justification: NFRs performance (60fps, <100ms response) non-négociables

### Starter Options Considered

#### Option 1: Generator Officiel Microsoft (Yeoman) ⭐ SÉLECTIONNÉ

**Description:**
L'approche officielle Microsoft utilise Yeoman avec le generator VSCode Extension pour scaffolder un projet TypeScript production-ready.

**Commande d'initialisation:**
```bash
npx --package yo --package generator-code -- yo code
```

**Prompts à sélectionner:**
- Type: New Extension (TypeScript)
- Name: suika
- Identifier: suika
- Description: VSCode AI agents with transparent HUD
- Bundler: esbuild (critical choice)
- Package manager: npm

**Ce que le generator fournit:**
- Structure dossiers standard VSCode Extension
- `src/extension.ts` comme entry point
- `package.json` manifest pré-configuré avec activation events
- Configuration `.vscode/` (tasks.json, launch.json pour debugging)
- TypeScript 5.x avec tsconfig.json optimisé
- esbuild configuration out-of-the-box
- Scripts npm (compile, watch, test, package)
- Extension activation boilerplate

**Forces:**
✅ Approche officielle Microsoft - maintenance active garantie
✅ Best practices VSCode Extension API intégrées
✅ Structure reconnue par communauté open-source
✅ Debugging configuration pre-wired (F5 launch Extension Development Host)
✅ esbuild support natif (builds <1s vs 50s webpack)
✅ Package.json manifest avec fields critiques (activationEvents, contributes)

**Limitations:**
⚠️ Ne configure PAS le webview - setup manuel requis
⚠️ Pas de framework UI - vanilla JS par défaut (parfait pour nous!)
⚠️ Dual-build (extension + webview) à configurer post-init

#### Option 2: Starters Communautaires avec React Webview

**Exemples:** `antfu/starter-vscode`, configs Medium/DEV.to tutorials

**Rejeté car:**
❌ React overhead incompatible avec NFR 60fps (5-10x plus lent que vanilla JS)
❌ Maintenance incertaine (templates communautaires)
❌ Bundle size trop élevé pour performance requirements
❌ Moins flexible pour optimisations custom

#### Option 3: Manual Setup from Scratch

**Rejeté car:**
❌ Temps setup élevé sans valeur ajoutée
❌ Risque manquer best practices VSCode Extension API
❌ Configuration debugging complexe
❌ Contraire à philosophie "boring technology that works"

### Selected Starter: Microsoft Yeoman Generator (yo code)

**Rationale pour Sélection:**

1. **Boring Technology That Works:** Approche officielle stable, maintenue par Microsoft
2. **esbuild Performance:** Builds ultra-rapides critiques pour developer experience
3. **Standard Community:** Structure reconnue facilite contributions open-source
4. **Debugging Ready:** Configuration F5 launch pre-wired (gain productivité)
5. **Flexibilité Webview:** Pas d'opinion framework UI = liberté vanilla JS optimisé

**Initialization Command:**

```bash
# Story 1: Initialize base extension
npx --package yo --package generator-code -- yo code

# Sélections prompts:
# - Type: New Extension (TypeScript)
# - Name: suika
# - Bundler: esbuild (CRITICAL)
# - Package manager: npm
```

### Architectural Decisions Provided by Starter

#### Language & Runtime

**TypeScript Configuration:**
- TypeScript 5.x avec strict mode enabled
- ES2020 target (balance features modernes + compatibilité Node 16+)
- Module resolution: Node
- Source maps generation pour debugging
- Declaration files (.d.ts) pour extensibility future

**tsconfig.json optimisé pour:**
- VSCode Extension API types (@types/vscode)
- Node.js types (@types/node)
- Strict null checks, no implicit any
- ESLint integration

#### Build Tooling

**esbuild Configuration (CRITIQUE POUR PERFORMANCE):**

```javascript
// Dual-build setup (post-init manual config)
// Target 1: Extension (Node.js context)
{
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'], // VSCode API fournie par runtime
  format: 'cjs',        // CommonJS pour Node.js
  platform: 'node',
  sourcemap: true,
  minify: false,        // Dev mode
  target: 'node16'
}

// Target 2: Webview (Browser context)
{
  entryPoints: ['src/webview/main.js'],
  bundle: true,
  outfile: 'dist/webview.js',
  format: 'iife',       // Immediately Invoked Function Expression
  platform: 'browser',
  sourcemap: true,
  minify: true,         // Production optimizations
  target: ['chrome100'] // VSCode uses Chromium
}
```

**Build Scripts npm:**
- `npm run compile` - Single build
- `npm run watch` - Watch mode avec hot reload
- `npm run package` - Production build avec minification
- `npm test` - Extension tests

**Build Performance Expectations:**
- Development builds: <1s (esbuild)
- Watch mode incremental: <200ms
- Production build: <3s avec minification

#### Project Structure (Standard VSCode)

```
suika/
├── .vscode/
│   ├── launch.json          # F5 debug config Extension Development Host
│   ├── tasks.json           # Build tasks (Cmd+Shift+B)
│   └── extensions.json      # Recommended extensions pour contributors
├── src/
│   ├── extension.ts         # Extension entry point (Node.js context)
│   │                        # - activate() function called on startup
│   │                        # - deactivate() cleanup function
│   ├── webview/             # HUD UI code (À CRÉER POST-INIT)
│   │   ├── index.html       # Webview HTML template
│   │   ├── main.js          # Vanilla JS HUD logic
│   │   └── styles/
│   │       └── main.css     # GPU-accelerated animations
│   ├── agents/              # (À CRÉER) 4 AI agents implementation
│   │   ├── architect.ts
│   │   ├── coder.ts
│   │   ├── reviewer.ts
│   │   └── context.ts
│   ├── llm/                 # (À CRÉER) LLM provider abstraction
│   │   ├── provider.interface.ts
│   │   ├── openai.provider.ts
│   │   └── anthropic.provider.ts
│   ├── state/               # (À CRÉER) State management
│   └── utils/
├── dist/                    # Build output (gitignored)
├── package.json             # Extension manifest + dependencies
├── tsconfig.json            # TypeScript configuration
├── esbuild.config.js        # (À CRÉER) Dual-build setup
└── README.md
```

**Séparation Contextes Critique:**
- `src/extension.ts` = Backend (Node.js, accès VSCode API, file system, agents)
- `src/webview/` = Frontend (Browser, DOM, animations, HUD rendering)
- Communication: `postMessage` API (async, serialization required)

#### Styling Solution

**Pour Webview UI:**
- Pure CSS3 (pas de préprocesseur nécessaire initially)
- CSS Variables pour theming (dark/light mode VSCode)
- GPU-accelerated properties:
  - `transform: translate3d()` pour positioning
  - `will-change: transform` pour optimizations
  - `opacity` pour fades
  - `filter` pour effects sumi-e
- CSS Grid + Flexbox pour layout
- @media queries pour responsive (multi-monitor)

**Performance-First CSS Patterns:**
```css
/* Agent animation optimized */
.agent {
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0); /* Force GPU layer */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 60fps smooth animations */
@keyframes breathe {
  0%, 100% { opacity: 0.05; }
  50% { opacity: 0.15; }
}
```

#### Testing Framework

**Extension Tests (Fourni par generator):**
- Mocha test runner
- @vscode/test-electron pour integration tests
- Extension Development Host test environment
- Test scripts: `npm test`

**À Ajouter Post-Init:**
- Unit tests agents (Jest ou Vitest)
- Webview UI tests (jsdom ou playwright)
- E2E tests pour user journeys critiques
- Coverage target: >70% (NFR)

#### Code Organization Patterns

**Extension Backend (Node.js Context):**
```typescript
// src/extension.ts - Entry point pattern
export function activate(context: vscode.ExtensionContext) {
  // Register commands
  // Initialize agents
  // Setup webview provider
  // Load user configuration

  context.subscriptions.push(
    vscode.commands.registerCommand('ai-101.toggleHUD', () => {
      // Command handler
    })
  );
}

export function deactivate() {
  // Cleanup resources
  // Dispose agents
}
```

**Message Passing Pattern (Extension ↔ Webview):**
```typescript
// Extension → Webview
webviewPanel.webview.postMessage({
  type: 'agentStateUpdate',
  agent: 'architect',
  state: 'thinking',
  data: { ... }
});

// Webview → Extension
window.addEventListener('message', event => {
  const message = event.data;
  switch (message.type) {
    case 'suggestionAccepted':
      // Handle in extension backend
      break;
  }
});
```

**Vanilla JS Component Pattern (Webview):**
```javascript
// Lightweight component encapsulation sans framework
class Agent {
  constructor(element, id, name) {
    this.element = element;
    this.id = id;
    this.name = name;
    this.state = 'idle';
  }

  setState(newState) {
    this.state = newState;
    this.render();
  }

  render() {
    // Direct DOM manipulation optimized
    this.element.className = `agent agent--${this.state}`;
    // GPU-accelerated CSS handles animations
  }
}
```

#### Development Experience

**Debugging Workflow (Pre-configured):**
1. Press F5 → Lance Extension Development Host (new VSCode window)
2. Breakpoints dans `src/extension.ts` fonctionnent directly
3. Console.log visible dans Debug Console
4. Hot reload via `npm run watch` en parallèle

**Webview Debugging (Manual setup):**
1. Help → Toggle Developer Tools dans Extension Development Host
2. Console webview accessible
3. Inspect HUD elements
4. Performance profiling disponible

**Developer Productivity Features:**
- IntelliSense VSCode API complet
- Type checking en temps réel
- Auto-imports TypeScript
- Linting ESLint (à configurer)
- Prettier formatting (à configurer)

### Post-Initialization Configuration Required

**Story 2 (Après yo code init):**

1. **Configure Dual-Build esbuild:**
   - Créer `esbuild.config.js` avec deux targets
   - Update package.json scripts (compile:extension, compile:webview)
   - Setup watch mode pour les deux

2. **Setup Webview Boilerplate:**
   - Créer `src/webview/` structure
   - HTML template avec CSP (Content Security Policy)
   - Vanilla JS entry point
   - CSS avec GPU-accelerated animations foundation

3. **Configure Message Passing:**
   - Type definitions pour messages Extension ↔ Webview
   - Event handlers basiques
   - State sync protocol

4. **Add Development Tooling:**
   - ESLint config (airbnb-typescript-base ou standard)
   - Prettier config
   - Git hooks avec husky (pre-commit linting)
   - VSCode workspace settings recommandés

### Sources & References

- [Your First Extension | Visual Studio Code Extension API](https://code.visualstudio.com/api/get-started/your-first-extension)
- [Building VS Code Extensions in 2026: The Complete Guide](https://abdulkadersafi.com/blog/building-vs-code-extensions-in-2026-the-complete-modern-guide)
- [Create advanced VSCode extension w/ React webview, esbuild bundler](https://medium.com/@aga1laoui/create-advanced-vscode-extension-w-react-webview-esbuild-bundler-eslint-airbnb-and-prettier-2ba2e3893667)
- [Using esbuild for your VS Code Extensions](http://datho7561.dev/blog/vscode-webpack-to-esbuild/)
- [Just how much faster is vanilla JS than frameworks?](https://gomakethings.com/just-how-much-faster-is-vanilla-js-than-frameworks/)
- [Bundling Extensions | Visual Studio Code Extension API](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)

**Note:** Project initialization using `yo code` command should be **Story 1** in implementation phase. Configuration webview duale sera **Story 2**.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
Les décisions suivantes sont critiques et doivent être implémentées dès le début car elles façonnent la structure fondamentale du système.

1. **Multi-Agent Architecture** - Définit comment les 4 agents communiquent (bloque toute logique agent)
2. **LLM Provider Abstraction** - Requis pour appels LLM (bloque toute fonctionnalité IA)
3. **State Management** - Synchronisation Extension ↔ Webview (bloque HUD)
4. **Webview Rendering** - Animations 60fps (bloque toute UI)
5. **Configuration Management** - API keys sécurisées (bloque activation)

**Important Decisions (Shape Architecture):**
Ces décisions impactent significativement l'architecture mais peuvent être affinées progressivement.

6. **LLM Cache Strategy** - Performance et coûts (impact fort mais pas blocking)
7. **Error Handling Strategy** - Résilience système (important pour production)

**Supporting Decisions (Enable Operations):**
Décisions qui supportent le développement et les opérations mais n'impactent pas l'architecture core.

8. **Testing Strategy** - Qualité et maintenance
9. **Telemetry & Monitoring** - Observabilité et amélioration continue

### 1. Multi-Agent Architecture & Orchestration

**Décision:** Orchestrator Central avec Direct Calls

**Rationale:**
L'architecture multi-agents avec un orchestrateur central offre le meilleur équilibre entre simplicité (boring technology), performance prévisible, et alignement avec la vision UX "Théâtre d'IA Transparent" où l'orchestrateur joue le rôle de metteur en scène.

**Alternatives Considérées:**
- Event Bus Pattern: Rejeté - overhead pub/sub, debugging plus complexe
- Actor Model: Rejeté - over-engineering pour 4 agents seulement

**Architecture Pattern:**

```typescript
// src/agents/orchestrator.ts
interface AgentRequest {
  type: RequestType;
  context: CodeContext;
  userInput?: string;
}

interface AgentResponse {
  agent: AgentType;
  result: any;
  reasoning: string;
  confidence: number;
  tokensUsed: number;
}

class AgentOrchestrator {
  private architect: ArchitectAgent;
  private coder: CoderAgent;
  private reviewer: ReviewerAgent;
  private context: ContextAgent;

  private stateManager: ExtensionStateManager;
  private llmManager: LLMProviderManager;

  constructor(
    stateManager: ExtensionStateManager,
    llmManager: LLMProviderManager
  ) {
    this.stateManager = stateManager;
    this.llmManager = llmManager;

    // Initialize agents with dependencies
    this.architect = new ArchitectAgent(llmManager, stateManager);
    this.coder = new CoderAgent(llmManager, stateManager);
    this.reviewer = new ReviewerAgent(llmManager, stateManager);
    this.context = new ContextAgent(stateManager);
  }

  async processUserRequest(request: AgentRequest): Promise<Response> {
    // Orchestrator decides execution sequence

    // Step 1: Context Agent loads relevant files
    this.stateManager.updateAgentState('context', 'working');
    const contextData = await this.context.loadRelevantFiles(request.context);
    this.stateManager.updateAgentState('context', 'success');

    // Step 2: Architect analyzes if needed
    if (this.shouldInvolveArchitect(request)) {
      this.stateManager.updateAgentState('architect', 'thinking');
      const architectureAnalysis = await this.architect.analyze(contextData);
      this.stateManager.updateAgentState('architect', 'success');
    }

    // Step 3: Coder generates suggestions
    this.stateManager.updateAgentState('coder', 'working');
    const codeSuggestion = await this.coder.generate(contextData, architectureAnalysis);
    this.stateManager.updateAgentState('coder', 'success');

    // Step 4: Reviewer validates
    this.stateManager.updateAgentState('reviewer', 'thinking');
    const reviewResult = await this.reviewer.validate(codeSuggestion);
    this.stateManager.updateAgentState('reviewer', reviewResult.passed ? 'success' : 'alert');

    // Synthesize final response with all agent contributions
    return this.synthesizeResponse({
      context: contextData,
      architecture: architectureAnalysis,
      code: codeSuggestion,
      review: reviewResult
    });
  }

  private shouldInvolveArchitect(request: AgentRequest): boolean {
    // Logic pour décider si Architecte doit être impliqué
    return request.type === 'newFeature' || request.context.affectsArchitecture;
  }

  private async synthesizeResponse(results: AllAgentResults): Promise<Response> {
    // Combine tous les résultats avec raisonnement visible
    return {
      suggestion: results.code.suggestion,
      reasoning: this.buildReasoningExplanation(results),
      agentContributions: {
        architect: results.architecture?.insights,
        coder: results.code.approach,
        reviewer: results.review.feedback,
        context: results.context.filesUsed
      }
    };
  }
}
```

**Benefits:**
- ✅ Single point of coordination = debugging simplifié
- ✅ Performance prévisible (pas d'overhead message passing)
- ✅ Orchestrator track toute collaboration = parfait pour visualisation HUD
- ✅ Facile ajouter/retirer agents
- ✅ Clear execution flow pour raisonnement transparent

**Trade-offs:**
- ⚠️ Orchestrator = potential bottleneck (mitigé par async/await)
- ⚠️ Agents couplés à orchestrator (acceptable - changement rare)

**Affects:** Tous les FRs liés aux agents (FR1-FR8), State Management, HUD Visualization

### 2. LLM Provider Abstraction Layer

**Décision:** Adapter Pattern avec Interface + Provider Registry Manager

**Rationale:**
L'abstraction via interface `ILLMProvider` + Registry manager offre extensibilité (custom providers), multi-provider simultané, fallbacks automatiques, et contrôle total sur token counting (cost management), sans overhead d'une library externe comme LangChain.

**Alternatives Considérées:**
- LangChain/LlamaIndex: Rejeté - overhead, dépendance lourde, features inutiles pour MVP
- Simple switch/case: Rejeté - pas extensible, pas de fallbacks

**Architecture Pattern:**

```typescript
// src/llm/provider.interface.ts
interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  stream?: boolean;
}

interface LLMResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  latency: number; // ms
}

interface ModelInfo {
  name: string;
  maxContextTokens: number;
  costPer1kTokens: { prompt: number; completion: number };
  capabilities: string[];
}

interface ILLMProvider {
  readonly name: string;

  generateCompletion(
    prompt: string,
    options?: LLMOptions
  ): Promise<LLMResponse>;

  streamCompletion?(
    prompt: string,
    options?: LLMOptions
  ): AsyncIterable<string>;

  estimateTokens(text: string): number;
  getModelInfo(model: string): ModelInfo;
  isAvailable(): Promise<boolean>;
}

// src/llm/openai.provider.ts
class OpenAIProvider implements ILLMProvider {
  readonly name = 'openai';
  private apiKey: string;
  private client: OpenAI;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new OpenAI({ apiKey });
  }

  async generateCompletion(
    prompt: string,
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    const response = await this.client.chat.completions.create({
      model: options?.model || 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens,
      stop: options?.stopSequences
    });

    return {
      content: response.choices[0].message.content,
      finishReason: response.choices[0].finish_reason as any,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      },
      model: response.model,
      latency: Date.now() - startTime
    };
  }

  estimateTokens(text: string): number {
    // Approximation: ~4 chars per token for English
    return Math.ceil(text.length / 4);
  }

  getModelInfo(model: string): ModelInfo {
    // Return model capabilities and costs
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}

// src/llm/provider-manager.ts
interface ProviderConfig {
  primary: string; // Provider name
  fallbacks: string[];
  model: string;
  options?: LLMOptions;
}

class LLMProviderManager {
  private providers = new Map<string, ILLMProvider>();
  private agentConfigs = new Map<AgentType, ProviderConfig>();
  private cache: HybridLLMCache;

  registerProvider(provider: ILLMProvider): void {
    this.providers.set(provider.name, provider);
  }

  configureAgent(agent: AgentType, config: ProviderConfig): void {
    this.agentConfigs.set(agent, config);
  }

  async callLLM(
    agentType: AgentType,
    prompt: string,
    context: CodeContext,
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const config = this.agentConfigs.get(agentType);
    if (!config) {
      throw new Error(`No LLM config for agent ${agentType}`);
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(agentType, prompt, context, config.model);
    const cachedResponse = await this.cache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try primary provider
    const provider = this.providers.get(config.primary);
    if (!provider) {
      throw new Error(`Provider ${config.primary} not registered`);
    }

    try {
      const response = await provider.generateCompletion(prompt, {
        ...config.options,
        ...options,
        model: config.model
      });

      // Cache successful response
      await this.cache.set(cacheKey, response);

      return response;
    } catch (error) {
      // Automatic fallback
      return await this.tryFallbacks(config.fallbacks, prompt, options);
    }
  }

  private async tryFallbacks(
    fallbacks: string[],
    prompt: string,
    options?: LLMOptions
  ): Promise<LLMResponse> {
    for (const fallbackName of fallbacks) {
      const provider = this.providers.get(fallbackName);
      if (provider && await provider.isAvailable()) {
        try {
          return await provider.generateCompletion(prompt, options);
        } catch {
          continue; // Try next fallback
        }
      }
    }
    throw new Error('All LLM providers failed');
  }
}
```

**Benefits:**
- ✅ `ILLMProvider` interface = extensibilité pour custom providers (FR60-FR64)
- ✅ Registry manager = multi-provider + fallbacks automatiques
- ✅ Configuration par agent flexible (Architecte → GPT-4, Codeur → Claude)
- ✅ Token estimation intégré = cost control précis
- ✅ Pas de dépendance lourde = contrôle total, bundle léger

**Trade-offs:**
- ⚠️ Implémentation adapters OpenAI + Anthropic manuelle (mais code simple)
- ⚠️ Pas de features avancées LangChain (chains, memory) - pas nécessaires MVP

**Affects:** FR26-FR33 (LLM Management), NFR-COST (Cost Management), FR60-FR64 (Extensibility)

### 3. State Management & Multi-Agent Synchronization

**Décision:** Dual State Pattern (Backend Source of Truth + Frontend Mirror)

**Rationale:**
Architecture Extension VSCode impose séparation Node.js (backend) vs Browser (webview frontend). Dual state avec backend source of truth + frontend mirror optimisé pour rendering 60fps offre le meilleur compromis performance/simplicité.

**Alternatives Considérées:**
- Event Sourcing: Rejeté - over-engineering, complexité inutile
- Redux-like store partagé: Impossible - deux contextes JS séparés

**Architecture Pattern:**

```typescript
// src/state/extension-state-manager.ts (Backend - Node.js)
interface ExtensionState {
  agents: Map<AgentType, AgentState>;
  sharedContext: SharedContext;
  mode: DisplayMode;
  vitalSigns: VitalSigns;
}

interface AgentState {
  status: 'idle' | 'thinking' | 'working' | 'alert' | 'success';
  currentTask?: string;
  lastUpdate: number;
  tokensUsed: number;
}

class ExtensionStateManager {
  private state: ExtensionState;
  private webviewPanel: vscode.WebviewPanel;

  constructor(webviewPanel: vscode.WebviewPanel) {
    this.webviewPanel = webviewPanel;
    this.state = this.initializeState();
  }

  updateAgentState(agent: AgentType, status: AgentState['status'], task?: string): void {
    const agentState = this.state.agents.get(agent);
    agentState.status = status;
    agentState.currentTask = task;
    agentState.lastUpdate = Date.now();

    // Sync to webview - granular update (only changed agent)
    this.webviewPanel.webview.postMessage({
      type: 'agentStateUpdate',
      agent,
      state: agentState
    });
  }

  changeMode(newMode: DisplayMode): void {
    this.state.mode = newMode;

    // Broadcast to webview
    this.webviewPanel.webview.postMessage({
      type: 'modeChange',
      mode: newMode
    });
  }

  updateVitalSigns(signs: Partial<VitalSigns>): void {
    Object.assign(this.state.vitalSigns, signs);

    // Throttled updates (max 10fps for vital signs)
    if (this.shouldUpdateVitalSigns()) {
      this.webviewPanel.webview.postMessage({
        type: 'vitalSignsUpdate',
        signs: this.state.vitalSigns
      });
    }
  }
}

// src/webview/state-manager.js (Frontend - Browser/Vanilla JS)
class WebviewStateManager {
  constructor() {
    this.state = {
      agents: new Map(),
      mode: 'balanced',
      vitalSigns: {}
    };

    this.listeners = new Map(); // Component subscriptions
    this.setupMessageListener();
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      this.handleBackendMessage(event.data);
    });
  }

  handleBackendMessage(message) {
    switch (message.type) {
      case 'agentStateUpdate':
        this.state.agents.set(message.agent, message.state);
        this.notifyListeners(message.agent); // Selective re-render
        break;

      case 'modeChange':
        this.state.mode = message.mode;
        this.notifyListeners('mode'); // All mode-dependent components
        break;

      case 'vitalSignsUpdate':
        this.state.vitalSigns = message.signs;
        this.notifyListeners('vitalSigns');
        break;
    }
  }

  // Lightweight subscription pattern (no framework)
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key).delete(callback);
    };
  }

  notifyListeners(key) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      // Use requestAnimationFrame for 60fps rendering
      requestAnimationFrame(() => {
        listeners.forEach(callback => callback(this.state));
      });
    }
  }

  // Get current state (read-only)
  getState() {
    return this.state;
  }
}

// Usage in webview components
const stateManager = new WebviewStateManager();

// Agent component subscribes to its own state
class AgentComponent {
  constructor(element, agentType) {
    this.element = element;
    this.agentType = agentType;

    // Subscribe to state changes
    stateManager.subscribe(agentType, (state) => {
      this.render(state.agents.get(agentType));
    });
  }

  render(agentState) {
    // Update DOM based on state (CSS handles animations)
    this.element.setAttribute('data-state', agentState.status);
  }
}
```

**Benefits:**
- ✅ Backend = source of truth (agents logic reste Node.js)
- ✅ Frontend = mirror optimisé pour 60fps rendering
- ✅ Granular updates = re-renders minimaux (performance critique)
- ✅ Vanilla JS subscription pattern léger (pas de Redux overhead)
- ✅ Mode changes efficient (broadcast simultané)
- ✅ requestAnimationFrame sync = 60fps garanti

**Performance Optimizations:**
- Throttling updates (vital signs max 10fps)
- Batching si multiple agents changent simultanément
- Selective notifications (seuls listeners concernés)

**Trade-offs:**
- ⚠️ State dupliqué (nécessaire vu séparation contextes)
- ⚠️ Pas de time-travel debugging Redux-style (pas critique MVP)

**Affects:** Tous les FRs agents (FR1-FR8), HUD UI (FR9-FR16), Performance NFRs (60fps, <100ms)

### 4. LLM Cache Strategy

**Décision:** Hybrid Cache (Memory L1 + File System L2)

**Rationale:**
Pour atteindre >50% hit rate (NFR-COST-2) ET persistence entre sessions, cache hybride offre performance (memory <1ms) + durabilité (file system). Context-aware invalidation garantit cache reste pertinent.

**Architecture Pattern:**

```typescript
// src/cache/llm-cache.ts
interface CacheKey {
  agentType: AgentType;
  promptHash: string;
  contextHash: string;
  modelVersion: string;
}

interface CacheEntry {
  value: LLMResponse;
  timestamp: number;
  tokenCount: number;
  hitCount: number;
}

class HybridLLMCache {
  private memoryCache: LRUCache<string, CacheEntry>; // L1
  private fileCache: FileSystemCache; // L2
  private metrics: CacheMetrics;

  constructor(cacheDir: string, maxMemoryEntries: number = 100) {
    this.memoryCache = new LRUCache({ max: maxMemoryEntries });
    this.fileCache = new FileSystemCache(cacheDir);
    this.metrics = new CacheMetrics();
  }

  async get(key: CacheKey): Promise<LLMResponse | null> {
    const keyStr = this.serializeKey(key);

    // L1: Memory cache (fast <1ms)
    let entry = this.memoryCache.get(keyStr);
    if (entry && !this.isExpired(entry)) {
      entry.hitCount++;
      this.metrics.recordHit('memory');
      return entry.value;
    }

    // L2: File system cache (persistent)
    entry = await this.fileCache.get(keyStr);
    if (entry && !this.isExpired(entry)) {
      // Promote to memory cache (hot data)
      this.memoryCache.set(keyStr, entry);
      this.metrics.recordHit('file');
      return entry.value;
    }

    this.metrics.recordMiss();
    return null;
  }

  async set(key: CacheKey, value: LLMResponse): Promise<void> {
    const keyStr = this.serializeKey(key);
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      tokenCount: value.usage.totalTokens,
      hitCount: 0
    };

    // Write to both caches
    this.memoryCache.set(keyStr, entry);
    await this.fileCache.set(keyStr, entry);
  }

  // Smart invalidation when code changes
  async invalidateContext(fileHashes: string[]): Promise<void> {
    // Invalidate entries with matching context hashes
    for (const [key, entry] of this.memoryCache.entries()) {
      const parsedKey = this.deserializeKey(key);
      if (fileHashes.includes(parsedKey.contextHash)) {
        this.memoryCache.delete(key);
        await this.fileCache.delete(key);
      }
    }
  }

  private serializeKey(key: CacheKey): string {
    return `${key.agentType}:${key.promptHash}:${key.contextHash}:${key.modelVersion}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
    return Date.now() - entry.timestamp > TTL;
  }

  getMetrics(): CacheMetrics {
    return this.metrics;
  }
}

// Cache key generation
function generateCacheKey(
  agentType: AgentType,
  prompt: string,
  context: CodeContext,
  modelVersion: string
): CacheKey {
  // Normalize prompt (remove whitespace variations)
  const normalizedPrompt = prompt.trim().replace(/\s+/g, ' ');

  return {
    agentType,
    promptHash: hash(normalizedPrompt), // SHA-256
    contextHash: hash(context.files.map(f => f.content).join()),
    modelVersion
  };
}

// Metrics tracking
class CacheMetrics {
  private hits = { memory: 0, file: 0 };
  private misses = 0;

  recordHit(source: 'memory' | 'file'): void {
    this.hits[source]++;
  }

  recordMiss(): void {
    this.misses++;
  }

  getHitRate(): number {
    const totalHits = this.hits.memory + this.hits.file;
    const total = totalHits + this.misses;
    return total > 0 ? totalHits / total : 0;
  }

  getStats() {
    return {
      hitRate: this.getHitRate(),
      memoryHits: this.hits.memory,
      fileHits: this.hits.file,
      misses: this.misses
    };
  }
}
```

**Benefits:**
- ✅ Memory L1 = <1ms lookup (performance critique)
- ✅ File L2 = persistence entre sessions (améliore hit rate long-terme)
- ✅ LRU eviction = mémoire contrôlée (pas de leaks)
- ✅ Context-aware invalidation = cache reste pertinent
- ✅ Model version tracking = auto-invalidation si LLM upgrade

**Optimizations Hit Rate:**
- Prompt normalization (whitespace insensitive)
- TTL intelligent (7 jours par défaut)
- Hot data promotion (file → memory)
- Metrics tracking pour monitoring

**Trade-offs:**
- ⚠️ Disk space usage (mitigé par cleanup policy + TTL)
- ⚠️ Cold start première session (normal)

**Affects:** NFR-COST-2 (>50% hit rate), NFR-COST-1 (<$0.10/session), FR27 (Cache intelligent)

### 5. Webview Rendering & Animation Architecture

**Décision:** CSS-Driven Animations + SVG Sumi-e Strokes

**Rationale:**
CSS animations sont GPU-accelerated par défaut, garantissent 60fps, et ne bloquent pas le main thread. SVG paths offrent flexibility pour strokes sumi-e (2-5 traits par agent). Vanilla JS minimal juste pour state updates (data attributes). Aligne parfaitement avec NFR-PERF-1 (60fps) et NFR-PERF-2 (<100ms response).

**Architecture Pattern:**

Voir section "Starter Template Evaluation" → "Post-Initialization Configuration Required" pour structure HTML/CSS détaillée.

**Key Principles:**
- **CSS fait les animations** (GPU-accelerated, 60fps garanti)
- **JS minimal** (juste toggle data attributes)
- **State-driven CSS** (selectors `[data-state]`)
- **SVG paths** pour sumi-e strokes vectoriels
- **requestAnimationFrame** pour rare JS animations (communication lines)
- **CSS Variables** pour positioning dynamique (anti-obstruction)

**Benefits:**
- ✅ 60fps garanti (browser-optimized CSS animations)
- ✅ <100ms response (data attribute change = instantané)
- ✅ GPU acceleration automatique (will-change, translate3d)
- ✅ Non-blocking (animations pas sur main thread)
- ✅ SVG = sharp à toute résolution (sumi-e esthétique)

**Trade-offs:**
- ⚠️ CSS peut devenir verbeux (mais prévisible et performant)
- ⚠️ SVG paths nécessitent design (mais flexibility sumi-e)

**Affects:** NFR-PERF-1 (60fps), NFR-PERF-2 (<100ms), FR9-FR16 (HUD UI), UX animations sumi-e

### 6. Configuration & Settings Management

**Décision:** VSCode Configuration API + SecretStorage Separation

**Rationale:**
Approche standard VSCode: settings.json pour preferences non-sensibles, SecretStorage API pour API keys (encrypted at rest). Templates presets facilitent onboarding. Export/import portable (sans secrets) pour partage équipe.

**Architecture Pattern:**

```typescript
// src/config/config-manager.ts
interface ExtensionConfig {
  defaultMode: DisplayMode;
  agents: {
    architect: { provider: string; model: string };
    coder: { provider: string; model: string };
    reviewer: { provider: string; model: string };
    context: { maxFiles: number };
  };
  cache: {
    enabled: boolean;
    maxMemoryEntries: number;
    ttlDays: number;
  };
  telemetry: {
    enabled: boolean;
  };
}

const TEMPLATES = {
  solo: {
    defaultMode: 'balanced',
    agents: {
      architect: { provider: 'openai', model: 'gpt-4-turbo' },
      coder: { provider: 'anthropic', model: 'claude-3-opus' }
    }
  },
  team: { /* ... */ },
  enterprise: { /* ... */ }
};

class ConfigurationManager {
  constructor(private context: vscode.ExtensionContext) {}

  getConfig(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration('ai-101');
    return {
      defaultMode: config.get('defaultMode', 'balanced'),
      agents: config.get('agents', TEMPLATES.solo.agents),
      cache: config.get('cache', { enabled: true, maxMemoryEntries: 100, ttlDays: 7 }),
      telemetry: config.get('telemetry', { enabled: false })
    };
  }

  async getProviderAPIKey(provider: string): Promise<string | undefined> {
    return await this.context.secrets.get(`ai-101.provider.${provider}`);
  }

  async setProviderAPIKey(provider: string, key: string): Promise<void> {
    await this.context.secrets.store(`ai-101.provider.${provider}`, key);
  }

  async applyTemplate(template: keyof typeof TEMPLATES): Promise<void> {
    const templateConfig = TEMPLATES[template];
    const config = vscode.workspace.getConfiguration('ai-101');

    for (const [key, value] of Object.entries(templateConfig)) {
      await config.update(key, value, vscode.ConfigurationTarget.Global);
    }
  }

  async exportConfig(): Promise<string> {
    const config = this.getConfig();
    return JSON.stringify(config, null, 2);
  }
}
```

**Benefits:**
- ✅ Standard VSCode (boring, éprouvé)
- ✅ SecretStorage encrypted at rest (NFR-SEC-1)
- ✅ Templates presets (FR51 - solo/team/enterprise)
- ✅ Export/import portable (FR54)

**Trade-offs:**
- ⚠️ Secrets pas portables (sécurité by design)

**Affects:** FR29-FR30 (Configuration), FR51 (Templates), FR54 (Export/Import), NFR-SEC-1 (API keys)

### 7. Error Handling Strategy

**Décision:** Centralized Error Handler + Retry Logic + User-Friendly Messages

**Rationale:**
Centralized error handler garantit handling cohérent, retry logic avec exponential backoff améliore résilience, user-friendly messages avec liens troubleshooting facilitent support.

**Architecture Pattern:**

```typescript
// src/errors/error-handler.ts
interface ErrorContext {
  agent?: AgentType;
  operation: string;
  retryable: boolean;
}

class ErrorHandler {
  constructor(
    private logger: Logger,
    private telemetry: TelemetryManager
  ) {}

  async handleLLMError(error: Error, context: ErrorContext): Promise<void> {
    // Log with full context
    this.logger.error('LLM call failed', { error, context });

    // User-friendly notification
    const action = await vscode.window.showErrorMessage(
      `Agent ${context.agent} a rencontré une erreur. [Voir détails](command:ai-101.showError)`,
      'Réessayer',
      'Ignorer',
      'Ouvrir Troubleshooting'
    );

    if (action === 'Réessayer' && context.retryable) {
      // Trigger retry
    } else if (action === 'Ouvrir Troubleshooting') {
      vscode.env.openExternal(vscode.Uri.parse('https://docs.ai-101.dev/troubleshooting'));
    }

    // Telemetry (opt-in)
    if (this.telemetry.enabled) {
      this.telemetry.trackError(error, context);
    }
  }

  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }
}
```

**Benefits:**
- ✅ Centralized handling = cohérence
- ✅ User-friendly messages avec actions (FR67)
- ✅ Retry logic avec exponential backoff (NFR-REL-4)
- ✅ Liens troubleshooting (FR67)

**Affects:** NFR-REL-1 (0 crash), NFR-REL-4 (Graceful errors), FR67 (Messages clairs)

### 8. Testing Strategy

**Décision:** Multi-Layer Testing (Unit + Integration + E2E)

**Rationale:**
Coverage >70% (NFR-MAINT-1) requiert tests multi-niveaux. Mocha (fourni starter) pour unit tests, @vscode/test-electron pour integration, E2E optionnel MVP.

**Test Layers:**

1. **Unit Tests (Mocha + Chai)**
   - Agents logic (mock LLM calls)
   - LLM provider adapters
   - Cache logic
   - State management

2. **Integration Tests (@vscode/test-electron)**
   - Extension activation
   - Extension ↔ Webview communication
   - Command execution
   - Configuration loading

3. **E2E Tests (Optional MVP, Playwright later)**
   - User journeys critiques (7 personas)
   - HUD animations
   - Multi-agent collaboration flows

**Coverage Target:** >70% (NFR-MAINT-1)

**Affects:** NFR-MAINT-1 (>70% coverage), Code quality

### 9. Telemetry & Monitoring

**Décision:** Opt-in, Anonymized, Privacy-first

**Rationale:**
Telemetry opt-in (NFR-SEC-2) avec données anonymisées uniquement (pas de code). Track metrics clés (FR55-FR59): acceptance rate, session duration, mode usage, comprehension surveys.

**Architecture Pattern:**

```typescript
// src/telemetry/telemetry-manager.ts
class TelemetryManager {
  private enabled: boolean = false; // Opt-in by default

  constructor(private context: vscode.ExtensionContext) {
    this.loadSettings();
  }

  trackEvent(event: string, data: Record<string, any>): void {
    if (!this.enabled) return;

    // Anonymize data (no code, no PII)
    const anonymized = this.anonymize(data);

    // Send via VSCode Telemetry API or custom endpoint
    // Track: acceptance rate, session duration, mode usage
  }

  trackAcceptance(accepted: boolean, agent: AgentType): void {
    this.trackEvent('suggestion.acceptance', {
      accepted,
      agent,
      session: this.getSessionId()
    });
  }

  private anonymize(data: any): any {
    // Remove code, file paths, PII
    return data;
  }
}
```

**Benefits:**
- ✅ Opt-in (NFR-SEC-2)
- ✅ Anonymized (privacy-first)
- ✅ Track metrics clés (FR55-FR59)

**Affects:** FR55-FR59 (Metrics), NFR-SEC-2 (Telemetry opt-in)

### Decision Impact Analysis

**Implementation Sequence Recommandée:**

Story priorities basées sur dépendances:

1. **Story 1:** Project initialization (`yo code`)
2. **Story 2:** Dual-build setup (extension + webview)
3. **Story 3:** Configuration Manager + SecretStorage (blocking - need API keys)
4. **Story 4:** LLM Provider abstraction + Registry
5. **Story 5:** State Management (Extension + Webview)
6. **Story 6:** Agent Orchestrator + Base Agents
7. **Story 7:** Webview HUD + CSS Animations
8. **Story 8:** LLM Cache (Hybrid)
9. **Story 9:** Error Handler
10. **Story 10+:** Features implementation basées sur FRs

**Cross-Component Dependencies:**

- **Orchestrator** dépend de: State Manager, LLM Manager
- **Agents** dépendent de: LLM Manager, State Manager
- **Webview** dépend de: State Manager (frontend)
- **Cache** dépend de: LLM Manager
- **Tous** dépendent de: Configuration Manager

## Implementation Patterns & Consistency Rules

### Pattern Categories Overview

**🎯 35 décisions collaboratives définies à travers 7 catégories critiques**

Ces patterns garantissent que tous les agents IA qui travaillent sur ce projet produiront du code compatible, cohérent et maintenable. Chaque pattern résout un point de conflit potentiel identifié dans notre architecture.

**Catégories définies:**
1. **Naming Patterns TypeScript** (5 patterns) - Interfaces, classes, methods, properties, files
2. **Project Structure** (5 patterns) - Organisation dossiers agents, providers, tests, webview, utils
3. **Message Formats** (5 patterns) - Communication Extension ↔ Webview
4. **State Management** (5 patterns) - Mutations, containers, initialization, subscriptions, throttling
5. **Error Handling** (5 patterns) - Classes, messages, retry, logging, display
6. **API & Interfaces** (5 patterns) - Async, parameters, returns, callbacks, naming
7. **CSS & Webview** (5 patterns) - Class naming, variables, animations, data attributes, components

---

## 1. Naming Patterns TypeScript

### 1.1 Interface vs Type Naming: "I" Prefix Convention

**Pattern:** Toutes les interfaces utilisent le préfixe "I" (C#/Java style). Types aliases sans préfixe.

```typescript
// ✅ CORRECT
interface ILLMProvider {
  readonly name: string;
  generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse>;
}

interface IAgentState {
  status: AgentStatus;
  currentTask?: string;
  lastUpdate: number;
}

type AgentType = 'architect' | 'coder' | 'reviewer' | 'context';
type AgentStatus = 'idle' | 'thinking' | 'working' | 'alert' | 'success';

// ❌ INCORRECT
interface LLMProvider { }  // Missing "I" prefix
interface IAgentType { }   // Type alias, should not have "I"
```

**Rationale:** Distinction visuelle claire entre contracts abstraits (interfaces) et types concrets.

---

### 1.2 Class Naming: Descriptive Suffix Pattern

**Pattern:** Classes utilisent noms descriptifs avec suffixes indiquant leur rôle (`Agent`, `Provider`, `Manager`, `Handler`).

```typescript
// ✅ CORRECT
class ArchitectAgent implements IAgent { }
class CoderAgent implements IAgent { }
class OpenAIProvider implements ILLMProvider { }
class AnthropicProvider implements ILLMProvider { }
class ExtensionStateManager { }
class LLMProviderManager { }
class ErrorHandler { }

// ❌ INCORRECT
class Architect { }  // Trop court, confusion avec interface
class OpenAI { }     // Conflit potentiel avec OpenAI SDK
```

**Rationale:** Clarté maximale sur le rôle, évite conflits de noms.

---

### 1.3 Method Naming: camelCase Verb-First

**Pattern:** Méthodes en camelCase commençant par un verbe clair.

```typescript
// ✅ CORRECT
async processUserRequest(request: IAgentRequest): Promise<IResponse> { }
private shouldInvolveArchitect(request: IAgentRequest): boolean { }
async loadRelevantFiles(context: ICodeContext): Promise<IFileData[]> { }

// ❌ INCORRECT
async process_user_request() { }  // snake_case
async userRequestProcessing() { }  // Noun-first
```

**Verbes standards:** get/set, load/save, create/update/delete, generate/synthesize, validate/verify

---

### 1.4 Private Members: TypeScript `private` Keyword Only

**Pattern:** Utiliser uniquement le keyword `private` TypeScript, pas de prefix underscore.

```typescript
// ✅ CORRECT
class LLMProviderManager {
  private providers: Map<string, ILLMProvider>;
  private cache: HybridLLMCache;
  
  private async tryFallbacks(): Promise<ILLMResponse> { }
}

// ❌ INCORRECT
private _providers: Map<string, ILLMProvider>;  // Underscore redondant
#stateManager: ExtensionStateManager;  // ES2022 private fields
```

---

### 1.5 File Naming: kebab-case Convention

**Pattern:** Tous les fichiers TypeScript/JavaScript en kebab-case.

```
✅ CORRECT:
src/agents/architect-agent.ts
src/llm/openai-provider.ts
src/state/extension-state-manager.ts
src/webview/agent-component.js

❌ INCORRECT:
src/agents/ArchitectAgent.ts  // PascalCase
src/agents/architectAgent.ts  // camelCase
```

**Rationale:** Standard Unix/Linux, évite case-sensitivity cross-platform.

---

## 2. Project Structure Patterns

### 2.1 Agent Organization: Folder Per Agent with Barrel Exports

**Pattern:** Chaque agent dans son propre dossier avec `index.ts` barrel export.

```
src/agents/
├── architect/
│   ├── index.ts                    # export { ArchitectAgent }
│   ├── architect-agent.ts
│   ├── architect-prompts.ts
│   └── __tests__/
│       └── architect-agent.test.ts
├── coder/
│   ├── index.ts
│   ├── coder-agent.ts
│   └── __tests__/
├── reviewer/
│   ├── index.ts
│   ├── reviewer-agent.ts
│   └── __tests__/
├── context/
│   ├── index.ts
│   ├── context-agent.ts
│   └── __tests__/
├── orchestrator.ts
├── shared/
│   ├── agent.interface.ts
│   ├── agent-types.ts
│   └── agent-base.ts
└── __tests__/
    └── orchestrator.test.ts
```

**Import:** `import { ArchitectAgent } from './agents/architect';`

---

### 2.2 LLM Provider Location: src/llm/ with providers/ Subdirectory

```
src/llm/
├── provider.interface.ts
├── provider-manager.ts
├── cache.ts
├── types.ts
├── providers/
│   ├── openai-provider.ts
│   ├── anthropic-provider.ts
│   └── custom-provider.ts
├── utils/
│   └── token-counter.ts
└── __tests__/
```

---

### 2.3 Test Location: Co-located __tests__/ Subdirectory

**Pattern:** Tests dans `__tests__/` subdirectory à côté du code source.

```
src/agents/orchestrator.ts
src/agents/__tests__/orchestrator.test.ts

src/llm/provider-manager.ts
src/llm/__tests__/provider-manager.test.ts
```

---

### 2.4 Webview Structure: Component-Based Organization

```
src/webview/
├── index.html
├── main.js
├── components/
│   ├── agent-component.js
│   ├── vital-signs-bar.js
│   ├── alert-component.js
│   └── mode-indicator.js
├── state/
│   ├── state-manager.js
│   └── message-handler.js
├── styles/
│   ├── main.css
│   ├── animations.css
│   ├── components/
│   │   ├── agent.css
│   │   ├── vital-signs.css
│   │   └── alerts.css
│   └── themes/
│       ├── variables.css
│       └── dark-mode.css
└── utils/
    ├── dom-helpers.js
    └── animation-helpers.js
```

---

### 2.5 Utils Organization: Domain-Specific Co-located

**Pattern:** Utils placés près de leur domaine. `src/utils/` pour truly shared.

```
src/llm/utils/token-counter.ts        # LLM-specific
src/state/utils/serialization.ts      # State-specific
src/webview/utils/dom-helpers.js      # Webview-specific

src/utils/                             # Only truly shared
├── logger.ts
├── crypto.ts
└── file-helpers.ts
```

---

## 3. Message Format Patterns (Extension ↔ Webview)

### 3.1 Message Type Naming: camelCase with Direction Prefix

```typescript
// ✅ CORRECT - Extension → Webview
{ type: 'toWebview:agentStateUpdate', agent: 'architect', status: 'thinking' }
{ type: 'toWebview:modeChange', mode: 'focus' }
{ type: 'toWebview:vitalSignsUpdate', signs: {...} }

// ✅ CORRECT - Webview → Extension
{ type: 'toExtension:suggestionAccepted', suggestionId: 'xyz' }
{ type: 'toExtension:userCommand', command: 'toggleHUD' }

// ❌ INCORRECT
{ type: 'AGENT_STATE_UPDATE' }  // No direction, SCREAMING_SNAKE_CASE
{ type: 'agent:state:update' }  // Colons not standard
```

---

### 3.2 Message Payload: Flat Structure

```typescript
// ✅ CORRECT - Flat
interface IAgentStateUpdateMessage {
  type: 'toWebview:agentStateUpdate';
  agent: AgentType;
  status: AgentStatus;
  currentTask?: string;
  lastUpdate: number;
}

// ❌ INCORRECT - Nested payload wrapper
interface IAgentStateUpdateMessage {
  type: 'toWebview:agentStateUpdate';
  payload: {  // Extra nesting
    agent: AgentType;
    status: AgentStatus;
  }
}
```

---

### 3.3 Agent Identifiers: String Literal Type

```typescript
// ✅ CORRECT
type AgentType = 'architect' | 'coder' | 'reviewer' | 'context';
{ agent: 'architect' }

// ❌ INCORRECT - Enum overhead
enum AgentType { Architect = 'architect' }
{ agent: AgentType.Architect }
```

---

### 3.4 Status Values: Lowercase String Literals

```typescript
// ✅ CORRECT
type AgentStatus = 'idle' | 'thinking' | 'working' | 'alert' | 'success';
{ status: 'thinking' }

// ❌ INCORRECT
type AgentStatus = 'Idle' | 'Thinking';  // PascalCase
```

---

### 3.5 Message Direction: Prefix Convention

**Pattern:** Direction explicite via prefix pour debugging.

```typescript
// ✅ CORRECT
'toWebview:agentStateUpdate'
'toExtension:suggestionAccepted'

// ❌ INCORRECT
'agentStateUpdate'  // No direction
```

---

## 4. State Management Patterns

### 4.1 State Mutations: Immutable Updates

```typescript
// ✅ CORRECT - Immutable
updateAgentState(agent: AgentType, status: AgentStatus): void {
  const currentState = this.state.agents.get(agent);
  const newState: IAgentState = {
    ...currentState,
    status,
    lastUpdate: Date.now()
  };
  this.state.agents.set(agent, newState);
}

// ❌ INCORRECT - Direct mutation
const state = this.state.agents.get(agent);
state.status = status;  // Mutation!
```

---

### 4.2 State Container: Map<AgentType, IAgentState>

```typescript
// ✅ CORRECT
interface IExtensionState {
  agents: Map<AgentType, IAgentState>;
  mode: DisplayMode;
}

this.state.agents.get('architect');
this.state.agents.set('architect', newState);

// ❌ INCORRECT - Record less type-safe
agents: Record<AgentType, IAgentState>;
```

---

### 4.3 State Initialization: Factory Function Pattern

```typescript
// ✅ CORRECT
function createInitialState(): IExtensionState {
  return {
    agents: new Map([
      ['architect', createInitialAgentState()],
      ['coder', createInitialAgentState()],
      ['reviewer', createInitialAgentState()],
      ['context', createInitialAgentState()]
    ]),
    mode: 'balanced',
    vitalSigns: createInitialVitalSigns()
  };
}

class ExtensionStateManager {
  constructor() {
    this.state = createInitialState();
  }
}
```

---

### 4.4 Subscription Pattern: Custom Lightweight Observer

```javascript
// ✅ CORRECT - Webview vanilla JS
class WebviewStateManager {
  constructor() {
    this.state = {...};
    this.listeners = new Map(); // key -> Set<callback>
  }
  
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    return () => this.listeners.get(key).delete(callback);
  }
  
  notifyListeners(key) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      requestAnimationFrame(() => {
        listeners.forEach(cb => cb(this.state));
      });
    }
  }
}
```

---

### 4.5 State Sync Throttling: Granular Per Type

```typescript
// ✅ CORRECT - Granular throttling
class ExtensionStateManager {
  private lastVitalSignsUpdate = 0;
  private readonly VITAL_SIGNS_THROTTLE_MS = 100;
  
  // Agent state - INSTANT (no throttle)
  updateAgentState(agent: AgentType, status: AgentStatus): void {
    const newState = {...};
    this.state.agents.set(agent, newState);
    
    // Instant sync
    this.webviewPanel.webview.postMessage({
      type: 'toWebview:agentStateUpdate',
      agent,
      ...newState
    });
  }
  
  // Vital signs - THROTTLED (max 10fps)
  updateVitalSigns(signs: Partial<IVitalSigns>): void {
    Object.assign(this.state.vitalSigns, signs);
    
    const now = Date.now();
    if (now - this.lastVitalSignsUpdate >= this.VITAL_SIGNS_THROTTLE_MS) {
      this.webviewPanel.webview.postMessage({
        type: 'toWebview:vitalSignsUpdate',
        signs: this.state.vitalSigns
      });
      this.lastVitalSignsUpdate = now;
    }
  }
}
```

**Throttling Guidelines:**
- **Instant (0ms):** Agent states, mode changes, alerts
- **Throttled (100ms):** Vital signs, metrics
- **Debounced (500ms):** Config changes

---

## 5. Error Handling Patterns

### 5.1 Error Class Hierarchy: Specialized Subclasses

```typescript
// ✅ CORRECT - Error hierarchy
class AI101Error extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class LLMProviderError extends AI101Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number
  ) {
    super(message, 'LLM_PROVIDER_ERROR');
  }
  
  getUserMessage(): string {
    if (this.statusCode === 429) {
      return 'Rate limit exceeded. Please wait and try again.';
    }
    return `Unable to connect to ${this.provider}.`;
  }
}

class AgentExecutionError extends AI101Error {
  constructor(
    message: string,
    public agent: AgentType,
    public phase: string
  ) {
    super(message, 'AGENT_EXECUTION_ERROR');
  }
}

class ConfigurationError extends AI101Error {
  constructor(message: string, public configKey: string) {
    super(message, 'CONFIGURATION_ERROR');
  }
}
```

---

### 5.2 Error Messages: English + getUserMessage()

```typescript
// ✅ CORRECT - Dual message system
class LLMProviderError extends AI101Error {
  constructor(provider: string, statusCode?: number) {
    // Internal (English, logs)
    super(
      `LLM provider '${provider}' failed with status ${statusCode}`,
      'LLM_PROVIDER_ERROR'
    );
  }
  
  // User-facing (friendly)
  getUserMessage(): string {
    switch (this.statusCode) {
      case 429: return 'Rate limit exceeded.';
      case 401: return `Invalid API key for ${this.provider}.`;
      default: return `Unable to connect to ${this.provider}.`;
    }
  }
}
```

---

### 5.3 Retry Logic: Centralized with Exponential Backoff

```typescript
// ✅ CORRECT - Centralized retry
class ErrorHandler {
  async withRetry<T>(
    fn: () => Promise<T>,
    context: string,
    options: IRetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelayMs = 1000,
      backoffMultiplier = 2,
      maxDelayMs = 10000,
      retryableErrors = ['RATE_LIMIT', 'TIMEOUT']
    } = options;
    
    let delay = initialDelayMs;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (!this.isRetryable(error, retryableErrors) || attempt === maxAttempts) {
          throw error;
        }
        
        await this.sleep(delay);
        delay = Math.min(delay * backoffMultiplier, maxDelayMs);
      }
    }
  }
}

// Usage
await errorHandler.withRetry(
  () => provider.generateCompletion(prompt),
  'LLM call',
  { retryableErrors: ['RATE_LIMIT', 'TIMEOUT'] }
);
```

---

### 5.4 Error Logging: Structured Logger with Levels

```typescript
// ✅ CORRECT - Structured logger
enum LogLevel { Debug = 'debug', Info = 'info', Warn = 'warn', Error = 'error' }

class Logger {
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const logEntry = {
      level: LogLevel.Error,
      context: this.context,
      message,
      timestamp: new Date().toISOString(),
      error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
      metadata
    };
    
    this.outputChannel.appendLine(JSON.stringify(logEntry, null, 2));
    console.error(`[${this.context}]`, message, error, metadata);
  }
}
```

---

### 5.5 User-Facing Errors: Multi-Level Display

```typescript
// ✅ CORRECT - Multi-level display
class ErrorHandler {
  async handleError(error: Error, context: string): Promise<void> {
    this.logger.error('Error occurred', error, { context });
    
    const severity = this.getSeverity(error);
    
    switch (severity) {
      case 'critical':
        // VSCode notification
        await vscode.window.showErrorMessage(
          error.getUserMessage(),
          'View Logs',
          'Report Issue'
        );
        break;
        
      case 'warning':
        // HUD alert (non-blocking)
        this.stateManager.showAlert({
          type: 'warning',
          message: error.getUserMessage(),
          duration: 5000
        });
        break;
        
      case 'info':
        // Silent log only
        break;
    }
  }
}
```

**Severity Guidelines:**
- **Critical:** VSCode notification (blocking config, API keys)
- **Warning:** HUD alert (network issues, retry)
- **Info:** Silent log (cache misses)

---

## 6. API & Interface Patterns

### 6.1 Async Pattern: async/await Everywhere

```typescript
// ✅ CORRECT
async analyze(context: ICodeContext): Promise<IAnalysis> {
  const patterns = await this.loadPatterns(context);
  const issues = await this.detectIssues(context, patterns);
  return this.synthesize({ patterns, issues });
}

// Parallel with Promise.all
const [contextData, analysis] = await Promise.all([
  this.contextAgent.load(request.context),
  this.architectAgent.analyze(request.context)
]);

// ❌ INCORRECT - Promise chains
return this.load(context)
  .then(data => this.process(data))
  .then(result => this.format(result));
```

---

### 6.2 Optional Parameters: options?: IType with Defaults

```typescript
// ✅ CORRECT
interface ILLMProvider {
  generateCompletion(
    prompt: string,
    options?: ILLMOptions
  ): Promise<ILLMResponse>;
}

async generateCompletion(
  prompt: string,
  options: ILLMOptions = {}
): Promise<ILLMResponse> {
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 2000;
  // ...
}
```

---

### 6.3 Return Types: Throw Errors (No Null)

```typescript
// ✅ CORRECT - Throw on failure
async callLLM(agent: AgentType, prompt: string): Promise<ILLMResponse> {
  if (!provider) {
    throw new ConfigurationError('No provider', 'provider.config');
  }
  
  try {
    return await provider.generateCompletion(prompt);
  } catch (error) {
    throw new LLMProviderError(provider.name, error.statusCode);
  }
}

// ❌ INCORRECT - Nullable return
async callLLM(): Promise<ILLMResponse | null> {
  if (!provider) return null;  // Loses error context
}
```

---

### 6.4 Callbacks: Direct Function with Return Unsubscribe

```typescript
// ✅ CORRECT
onAgentStateChange(
  callback: (agent: AgentType, state: IAgentState) => void
): () => void {
  this.stateChangeCallbacks.push(callback);
  
  return () => {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  };
}

// Usage
const unsubscribe = stateManager.onAgentStateChange((agent, state) => {
  console.log(`Agent ${agent} changed`);
});

unsubscribe();  // Cleanup
```

---

### 6.5 Interface Naming: "I" Prefix for Public API

```typescript
// ✅ CORRECT - Public API
export interface ILLMProvider { }
export interface IAgent { }
export interface IAgentRenderer { }

// Internal (optional I prefix)
interface ExtensionState { }  // or IExtensionState
```

---

## 7. CSS & Webview Patterns

### 7.1 CSS Class Naming: BEM Convention

```css
/* ✅ CORRECT - BEM */
.agent { }
.agent__icon { }
.agent__label { }
.agent__status-indicator { }
.agent--idle { }
.agent--thinking { }
.agent__icon--large { }

.vital-signs { }
.vital-signs__item { }
.vital-signs__value { }
.vital-signs--hidden { }

/* ❌ INCORRECT */
.agentIcon { }  /* camelCase */
.agent-thinking-state { }  /* Unclear hierarchy */
```

**HTML:**
```html
<div class="agent agent--thinking">
  <div class="agent__icon agent__icon--large">🏗️</div>
  <div class="agent__label">Architect</div>
</div>
```

---

### 7.2 CSS Variables: Kebab-Case Namespaced

```css
/* ✅ CORRECT - Namespaced */
:root {
  --agent-color-architect: #4A90E2;
  --agent-color-coder: #7ED321;
  --agent-opacity-idle: 0.05;
  --agent-opacity-thinking: 0.15;
  --animation-duration-fast: 150ms;
  --animation-duration-normal: 300ms;
  --stroke-width-medium: 2px;
  --spacing-md: 16px;
  --z-index-agents: 1000;
}

.agent--architect {
  border-color: var(--agent-color-architect);
  opacity: var(--agent-opacity-idle);
}

/* ❌ INCORRECT */
--agentColorArchitect: #4A90E2;  /* camelCase */
--color-blue: #4A90E2;  /* No namespace */
```

---

### 7.3 Animation Naming: Descriptive Kebab-Case

```css
/* ✅ CORRECT - Descriptive with prefix */
@keyframes agent-breathe {
  0%, 100% { opacity: 0.05; }
  50% { opacity: 0.15; }
}

@keyframes agent-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 0.4; transform: translateY(0); }
}

@keyframes stroke-draw {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}

.agent--idle {
  animation: agent-breathe 3s ease-in-out infinite;
}

/* ❌ INCORRECT */
@keyframes breathe { }  /* No prefix */
@keyframes fadeIn { }  /* camelCase */
```

---

### 7.4 Data Attributes: Kebab-Case Convention

```html
<!-- ✅ CORRECT - Kebab-case -->
<div class="agent"
     data-agent-id="architect"
     data-agent-status="thinking"
     data-can-animate="true"
     data-token-count="1250">
</div>

<!-- ❌ INCORRECT -->
<div data-agentId="architect"  <!-- camelCase -->
     data-status="thinking">  <!-- Missing prefix -->
</div>
```

```javascript
// JavaScript access (auto camelCase)
const agentId = element.dataset.agentId;  // "architect"
const status = element.dataset.agentStatus;  // "thinking"
const canAnimate = element.dataset.canAnimate === 'true';
```

---

### 7.5 JavaScript Components: ES6 Class Pattern

```javascript
// ✅ CORRECT - ES6 Class with encapsulation
class AgentComponent {
  constructor(containerId, agentId, agentName, agentIcon) {
    this.containerId = containerId;
    this.agentId = agentId;
    this.agentName = agentName;
    this.agentIcon = agentIcon;
    
    this.element = null;
    this.state = { status: 'idle', opacity: 0.05 };
    this.animationFrameId = null;
  }
  
  render() {
    const container = document.getElementById(this.containerId);
    
    this.element = document.createElement('div');
    this.element.className = `agent agent--idle`;
    this.element.dataset.agentId = this.agentId;
    this.element.innerHTML = `
      <div class="agent__icon">${this.agentIcon}</div>
      <div class="agent__label">${this.agentName}</div>
    `;
    
    container.appendChild(this.element);
    this.attachEventListeners();
  }
  
  updateStatus(newStatus) {
    this.state.status = newStatus;
    this.element.classList.remove('agent--idle', 'agent--thinking', 'agent--working');
    this.element.classList.add(`agent--${newStatus}`);
    this.animateTransition(newStatus);
  }
  
  animateTransition(status) {
    requestAnimationFrame(() => {
      this.element.style.opacity = this.getOpacityForStatus(status);
    });
  }
  
  attachEventListeners() {
    this.element.addEventListener('click', () => {
      window.vscode.postMessage({
        type: 'toExtension:agentClicked',
        agent: this.agentId
      });
    });
  }
  
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.element) {
      this.element.remove();
    }
  }
}

// Usage
const architect = new AgentComponent('container', 'architect', 'Architect', '🏗️');
architect.render();
architect.updateStatus('thinking');
```

---

## Enforcement Guidelines

### All AI Agents MUST:

1. **Read this document first** avant d'écrire code
2. **Follow naming conventions exactly** - Interfaces "I" prefix, files kebab-case, methods camelCase
3. **Use immutable state updates** - Spread operators, jamais mutation directe
4. **Throw errors, never return null** - Type-safe avec exceptions
5. **Use async/await** - Pas de Promise chains
6. **Log structured errors** - Logger class avec levels, metadata
7. **Apply BEM for CSS** - `.agent__icon--large`
8. **GPU-accelerate animations** - `transform: translate3d()`, `will-change`, requestAnimationFrame
9. **Prefix message types** - `toWebview:`, `toExtension:`
10. **Co-locate tests** - `__tests__/` subdirectory

### Pattern Verification Checklist:

```markdown
- [ ] File names are kebab-case
- [ ] Interfaces use "I" prefix
- [ ] Classes have descriptive suffixes
- [ ] Methods are camelCase verb-first
- [ ] State updates are immutable
- [ ] Errors are thrown (not null)
- [ ] async/await used consistently
- [ ] CSS classes follow BEM
- [ ] Data attributes are kebab-case
- [ ] Message types have direction prefix
- [ ] Tests co-located in __tests__/
```

### Process for Updating Patterns:

1. **Propose change** via issue avec rationale
2. **Discuss trade-offs** 
3. **Update this document** si accepté
4. **Create migration guide** si breaking
5. **Update code** progressively

---

## Pattern Examples

### Complete Good Example:

```typescript
// ✅ ALL PATTERNS APPLIED
// src/agents/architect/architect-agent.ts

import { IAgent, IAgentResult, ICodeContext } from '../shared/agent.interface';
import { LLMProviderManager } from '../../llm/provider-manager';
import { ExtensionStateManager } from '../../state/extension-state-manager';
import { Logger } from '../../utils/logger';
import { AgentExecutionError } from '../../errors/agent-execution-error';

class ArchitectAgent implements IAgent {
  readonly id = 'architect';
  readonly name = 'Architect';
  
  private llmManager: LLMProviderManager;
  private stateManager: ExtensionStateManager;
  private logger: Logger;
  
  constructor(
    llmManager: LLMProviderManager,
    stateManager: ExtensionStateManager,
    logger: Logger
  ) {
    this.llmManager = llmManager;
    this.stateManager = stateManager;
    this.logger = logger;
  }
  
  async execute(context: ICodeContext): Promise<IAgentResult> {
    try {
      this.stateManager.updateAgentState(this.id, 'thinking', 'Analyzing architecture');
      
      const analysis = await this.analyze(context);
      
      this.stateManager.updateAgentState(this.id, 'success');
      
      return {
        agent: this.id,
        success: true,
        data: analysis,
        tokensUsed: 1250
      };
    } catch (error) {
      this.logger.error('Architect execution failed', error);
      this.stateManager.updateAgentState(this.id, 'alert', 'Analysis failed');
      
      throw new AgentExecutionError(
        'Architect failed during analysis',
        this.id,
        'analysis',
        error
      );
    }
  }
  
  private async analyze(context: ICodeContext): Promise<IAnalysis> {
    const [patterns, issues] = await Promise.all([
      this.loadPatterns(context),
      this.detectIssues(context)
    ]);
    
    return { patterns, issues };
  }
  
  reset(): void {
    this.stateManager.updateAgentState(this.id, 'idle');
  }
}

export { ArchitectAgent };
```

### Anti-Patterns to Avoid:

```typescript
// ❌ ANTI-PATTERNS - DO NOT DO THIS

// Direct state mutation
this.state.agents[agent].status = status;

// Nullable returns
async callLLM(): Promise<ILLMResponse | null> {
  return null;
}

// Promise chains
return this.load().then(data => this.process(data));

// Non-descriptive naming
class Manager { }
function doStuff() { }

// No error handling
const data = await this.load();  // No try/catch!

// Generic CSS
<div class="box"><div class="icon"></div></div>

// No direction in messages
{ type: 'agentUpdate' }
```

---

**🎉 Implementation Patterns Complete!**

Ces 35 patterns garantissent la cohérence de code entre tous les agents IA travaillant sur ce projet.


## Project Structure & Architectural Boundaries

### Complete Project Directory Structure

```
suika/
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.webview.json
├── esbuild.config.js
├── .gitignore
├── .vscodeignore
├── .eslintrc.json
├── .prettierrc.json
├── .env.example
│
├── .vscode/
│   ├── launch.json
│   ├── tasks.json
│   ├── extensions.json
│   └── settings.json
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   └── pr-checks.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── pattern_violation.md
│   └── pull_request_template.md
│
├── docs/
│   ├── architecture/
│   │   ├── decisions.md
│   │   ├── patterns.md
│   │   └── boundaries.md
│   ├── api/
│   │   ├── llm-provider-interface.md
│   │   ├── agent-interface.md
│   │   └── events.md
│   ├── guides/
│   │   ├── getting-started.md
│   │   ├── custom-llm-provider.md
│   │   ├── troubleshooting.md
│   │   └── contributing.md
│   └── images/
│
├── src/
│   ├── extension.ts
│   │
│   ├── agents/
│   │   ├── architect/
│   │   │   ├── index.ts
│   │   │   ├── architect-agent.ts
│   │   │   ├── architect-prompts.ts
│   │   │   ├── pattern-detector.ts
│   │   │   └── __tests__/
│   │   │       ├── architect-agent.test.ts
│   │   │       └── pattern-detector.test.ts
│   │   │
│   │   ├── coder/
│   │   │   ├── index.ts
│   │   │   ├── coder-agent.ts
│   │   │   ├── coder-prompts.ts
│   │   │   ├── code-formatter.ts
│   │   │   └── __tests__/
│   │   │       └── coder-agent.test.ts
│   │   │
│   │   ├── reviewer/
│   │   │   ├── index.ts
│   │   │   ├── reviewer-agent.ts
│   │   │   ├── reviewer-prompts.ts
│   │   │   ├── quality-checker.ts
│   │   │   └── __tests__/
│   │   │       └── reviewer-agent.test.ts
│   │   │
│   │   ├── context/
│   │   │   ├── index.ts
│   │   │   ├── context-agent.ts
│   │   │   ├── file-loader.ts
│   │   │   ├── token-optimizer.ts
│   │   │   ├── security-validator.ts
│   │   │   └── __tests__/
│   │   │       ├── context-agent.test.ts
│   │   │       └── file-loader.test.ts
│   │   │
│   │   ├── orchestrator.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── agent.interface.ts
│   │   │   ├── agent-types.ts
│   │   │   ├── agent-base.ts
│   │   │   └── agent-result.interface.ts
│   │   │
│   │   └── __tests__/
│   │       ├── orchestrator.test.ts
│   │       └── integration/
│   │           └── multi-agent-workflow.test.ts
│   │
│   ├── llm/
│   │   ├── provider.interface.ts
│   │   ├── provider-manager.ts
│   │   ├── cache.ts
│   │   ├── types.ts
│   │   │
│   │   ├── providers/
│   │   │   ├── openai-provider.ts
│   │   │   ├── anthropic-provider.ts
│   │   │   └── custom-provider.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── token-counter.ts
│   │   │   └── cost-calculator.ts
│   │   │
│   │   └── __tests__/
│   │       ├── provider-manager.test.ts
│   │       ├── cache.test.ts
│   │       └── providers/
│   │           ├── openai-provider.test.ts
│   │           └── anthropic-provider.test.ts
│   │
│   ├── state/
│   │   ├── extension-state-manager.ts
│   │   ├── types.ts
│   │   ├── state-factory.ts
│   │   │
│   │   ├── utils/
│   │   │   └── serialization.ts
│   │   │
│   │   └── __tests__/
│   │       ├── extension-state-manager.test.ts
│   │       └── state-factory.test.ts
│   │
│   ├── webview/
│   │   ├── webview-provider.ts
│   │   ├── webview-html.ts
│   │   │
│   │   └── __tests__/
│   │       └── webview-provider.test.ts
│   │
│   ├── config/
│   │   ├── configuration-manager.ts
│   │   ├── templates.ts
│   │   ├── validation.ts
│   │   │
│   │   └── __tests__/
│   │       ├── configuration-manager.test.ts
│   │       └── validation.test.ts
│   │
│   ├── commands/
│   │   ├── toggle-hud.command.ts
│   │   ├── change-mode.command.ts
│   │   ├── clear-cache.command.ts
│   │   ├── show-metrics.command.ts
│   │   │
│   │   ├── command-registry.ts
│   │   │
│   │   └── __tests__/
│   │       └── commands.test.ts
│   │
│   ├── errors/
│   │   ├── error-handler.ts
│   │   ├── ai101-error.ts
│   │   ├── llm-provider-error.ts
│   │   ├── agent-execution-error.ts
│   │   ├── configuration-error.ts
│   │   ├── cache-error.ts
│   │   │
│   │   └── __tests__/
│   │       ├── error-handler.test.ts
│   │       └── error-classes.test.ts
│   │
│   ├── telemetry/
│   │   ├── telemetry-manager.ts
│   │   ├── metrics-tracker.ts
│   │   ├── analytics-events.ts
│   │   │
│   │   └── __tests__/
│   │       └── telemetry-manager.test.ts
│   │
│   ├── analytics/
│   │   ├── usage-tracker.ts
│   │   ├── nps-survey.ts
│   │   ├── quality-metrics.ts
│   │   │
│   │   └── __tests__/
│   │       └── usage-tracker.test.ts
│   │
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── crypto.ts
│   │   ├── file-helpers.ts
│   │   │
│   │   └── __tests__/
│   │       └── logger.test.ts
│   │
│   └── types/
│       ├── vscode.d.ts
│       ├── global.d.ts
│       └── agent-types.d.ts
│
├── src/webview/
│   ├── index.html
│   ├── main.js
│   │
│   ├── components/
│   │   ├── agent-component.js
│   │   ├── vital-signs-bar.js
│   │   ├── alert-component.js
│   │   ├── mode-indicator.js
│   │   └── collaboration-overlay.js
│   │
│   ├── state/
│   │   ├── state-manager.js
│   │   └── message-handler.js
│   │
│   ├── styles/
│   │   ├── main.css
│   │   ├── animations.css
│   │   │
│   │   ├── components/
│   │   │   ├── agent.css
│   │   │   ├── vital-signs.css
│   │   │   ├── alerts.css
│   │   │   └── mode-indicator.css
│   │   │
│   │   └── themes/
│   │       ├── variables.css
│   │       ├── dark-mode.css
│   │       └── light-mode.css
│   │
│   └── utils/
│       ├── dom-helpers.js
│       └── animation-helpers.js
│
├── dist/
│   ├── extension.js
│   ├── extension.js.map
│   ├── webview.js
│   └── webview.js.map
│
├── test/
│   ├── suite/
│   │   ├── extension.test.ts
│   │   ├── agent-orchestrator.test.ts
│   │   └── llm-integration.test.ts
│   │
│   ├── fixtures/
│   │   ├── sample-code/
│   │   └── mock-responses/
│   │
│   └── runTest.ts
│
├── .cache/
│   └── llm-responses/
│
└── .vscode-test/
```

**Total:** ~150 fichiers et dossiers définis

---

### Architectural Boundaries

#### API Boundaries

**1. VSCode Extension API Boundary**

- **Entry Point:** `src/extension.ts`
  - `activate(context: vscode.ExtensionContext)` - Extension activation
  - `deactivate()` - Cleanup on extension deactivation
- **Commands:** Registered via `vscode.commands.registerCommand()`
- **Webview:** Created via `vscode.window.createWebviewPanel()`
- **Configuration:** `vscode.workspace.getConfiguration('ai-101')`
- **Secrets:** `context.secrets` (SecretStorage API)
- **Boundary Rule:** Only `extension.ts` and `webview-provider.ts` directly import `vscode` module

**2. Extension ↔ Webview Communication Boundary**

- **Protocol:** JSON messages via `postMessage` API
- **Direction:** Bidirectional
- **Extension → Webview:**
  ```typescript
  webviewPanel.webview.postMessage({
    type: 'toWebview:agentStateUpdate',
    agent: 'architect',
    status: 'thinking',
    currentTask: 'Analyzing dependencies'
  });
  ```
- **Webview → Extension:**
  ```javascript
  window.vscode.postMessage({
    type: 'toExtension:suggestionAccepted',
    suggestionId: 'xyz-123'
  });
  ```
- **Message Types:**
  - Agent state updates (instant, no throttle)
  - Mode changes (instant)
  - Vital signs updates (throttled 100ms)
  - User commands (clicks, hotkeys)
- **Serialization:** JSON only (no functions, Map → Array conversion required)

**3. LLM Provider API Boundary**

- **Public Interface:** `ILLMProvider` (extensibility API)
- **Methods:**
  - `generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse>`
  - `estimateTokens(text: string): number`
  - `getModelInfo(model: string): IModelInfo`
  - `isAvailable(): Promise<boolean>`
- **Boundary Rule:** Agents never call providers directly, always via `LLMProviderManager`
- **Extensibility:** Third-party providers implement `ILLMProvider` interface

**4. Agent API Boundary**

- **Public Interface:** `IAgent`
- **Methods:**
  - `execute(context: ICodeContext): Promise<IAgentResult>`
  - `reset(): void`
- **Properties:** `readonly id: AgentType`, `readonly name: string`
- **Boundary Rule:** Orchestrator calls agents, agents don't call each other directly

---

#### Component Boundaries

**1. Orchestrator ↔ Agents (Decision #1: Orchestrator Central)**

- **Pattern:** Direct method calls, synchronous invocation
- **Communication Flow:**
  ```typescript
  Orchestrator.processUserRequest()
    → ContextAgent.loadRelevantFiles()
    → ArchitectAgent.analyze() (if needed)
    → CoderAgent.generate()
    → ReviewerAgent.validate()
  ```
- **State Updates:** Agents call `stateManager.updateAgentState()` to notify UI
- **Data Flow:** Orchestrator → Agent → LLMManager → Provider
- **No Circular Dependencies:** Agents don't know about Orchestrator

**2. State Manager ↔ Webview (Decision #3: Dual State Pattern)**

- **Backend (Node.js):** `ExtensionStateManager` - Source of truth
- **Frontend (Browser):** `WebviewStateManager` - Mirror for rendering
- **Sync Pattern:** Backend pushes updates via postMessage
- **Subscription:** Frontend components subscribe to specific state keys
- **Throttling:** Granular (agents instant, vital signs 100ms)
- **Example:**
  ```typescript
  // Backend
  stateManager.updateAgentState('architect', 'thinking');
  // → postMessage({ type: 'toWebview:agentStateUpdate', ... })
  
  // Frontend
  stateManager.subscribe('architect', (state) => {
    architectComponent.updateStatus(state.agents.get('architect').status);
  });
  ```

**3. LLM Manager ↔ Cache (Decision #4: Hybrid Cache)**

- **Cache Check:** Before every LLM call
- **Cache Key:** `hash(agentType + prompt + contextHash + model)`
- **L1 (Memory):** LRU cache, fast <1ms, limited size
- **L2 (File System):** `.cache/llm-responses/`, persistent, 7-day TTL
- **Invalidation:** Context-aware based on file hashes
- **Boundary:** Cache is private to `LLMProviderManager`

**4. Error Handler ↔ All Components (Decision #7: Centralized Error Handling)**

- **Pattern:** Cross-cutting concern, injected into all components
- **Integration:**
  ```typescript
  class ArchitectAgent {
    constructor(
      llmManager: LLMProviderManager,
      stateManager: ExtensionStateManager,
      errorHandler: ErrorHandler  // Injected
    ) { }
  }
  ```
- **Retry Logic:** `await errorHandler.withRetry(() => operation())`
- **Display:** ErrorHandler decides severity → VSCode notification or HUD alert

---

#### Service Boundaries

**1. Configuration Service**

- **Implementation:** `src/config/configuration-manager.ts`
- **Consumers:** All components needing configuration
- **API:**
  - `getConfig(): IExtensionConfig` - Reads `settings.json`
  - `getProviderAPIKey(provider: string): Promise<string>` - Reads SecretStorage
  - `setProviderAPIKey(provider: string, key: string): Promise<void>`
- **Singleton Pattern:** One instance shared across extension
- **Hot Reload:** Listens to `vscode.workspace.onDidChangeConfiguration()`

**2. Logging Service**

- **Implementation:** `src/utils/logger.ts`
- **Consumers:** All components
- **API:** 
  - `logger.error(message, error?, metadata?)`
  - `logger.warn(message, metadata?)`
  - `logger.info(message, metadata?)`
  - `logger.debug(message, metadata?)`
- **Output:** VSCode Output Channel + console.error/warn/info/debug
- **Context:** Each component creates logger with context name: `new Logger('ArchitectAgent', outputChannel)`

**3. Telemetry Service**

- **Implementation:** `src/telemetry/telemetry-manager.ts`
- **Consumers:** Components tracking usage metrics
- **API:**
  - `trackEvent(name: string, properties?: Record<string, any>)`
  - `trackMetric(name: string, value: number)`
- **Opt-in:** Respects user telemetry setting from configuration
- **Privacy:** Anonymized data only, no code snippets ever sent

---

#### Data Boundaries

**1. File System Cache**

- **Location:** `.cache/llm-responses/` (gitignored)
- **Access:** Only via `HybridLLMCache` class
- **Format:** JSON files with hashed filenames
- **Lifecycle:** TTL 7 days (configurable via settings)
- **Invalidation:** Context-aware when source files change

**2. VSCode Settings**

- **Location:** `settings.json` (user or workspace scope)
- **Access:** Only via `ConfigurationManager.getConfig()`
- **Schema:** Defined in `package.json` under `contributes.configuration`
- **Example Settings:**
  ```json
  {
    "ai-101.defaultMode": "balanced",
    "ai-101.agents.architect.provider": "openai",
    "ai-101.agents.architect.model": "gpt-4-turbo",
    "ai-101.cache.enabled": true,
    "ai-101.telemetry.enabled": false
  }
  ```

**3. VSCode SecretStorage**

- **Location:** VSCode-managed encrypted storage
- **Access:** Only via `ConfigurationManager.getProviderAPIKey()`
- **Data:** API keys for LLM providers (OpenAI, Anthropic, custom)
- **Security:** VSCode handles encryption automatically

---

### Requirements to Structure Mapping

#### FR1-FR8: Multi-Agent AI System

**Components:**
- `src/agents/architect/` - Architecture analysis agent
- `src/agents/coder/` - Code generation agent
- `src/agents/reviewer/` - Code review validation agent
- `src/agents/context/` - Context loading & optimization agent
- `src/agents/orchestrator.ts` - Central coordination
- `src/agents/shared/agent.interface.ts` - Public IAgent interface

**Tests:** Co-located `__tests__/` in each agent folder

**Integration:** Multi-agent workflow test in `src/agents/__tests__/integration/`

---

#### FR9-FR16: HUD Interface & Visualization

**Components:**
- `src/webview/components/agent-component.js` - Agent visualization with sumi-e aesthetic
- `src/webview/components/vital-signs-bar.js` - Tokens, files, cache hit rate, cost display
- `src/webview/components/alert-component.js` - 4 levels alerts (info/warning/error/critical)
- `src/webview/components/collaboration-overlay.js` - Agent convergence/fusion animations

**Styles:**
- `src/webview/styles/components/agent.css` - BEM styles for agents
- `src/webview/styles/animations.css` - 60fps GPU-accelerated animations
- `src/webview/styles/themes/variables.css` - CSS custom properties

**State:** `src/webview/state/state-manager.js` - Lightweight observer pattern

---

#### FR17-FR25: Modes & Personnalisation

**State Management:**
- `src/state/extension-state-manager.ts` - Mode state machine
- Mode types: Learning, Expert, Focus, Team, Performance

**Configuration:**
- `src/config/configuration-manager.ts` - Settings management
- `src/config/templates.ts` - Preset configurations (solo-dev, team, enterprise)

**UI:**
- `src/webview/components/mode-indicator.js` - Current mode display

**Commands:**
- `src/commands/change-mode.command.ts` - Mode switching command

---

#### FR26-FR33: LLM Provider Management

**Core:**
- `src/llm/provider-manager.ts` - Registry + fallback logic
- `src/llm/provider.interface.ts` - ILLMProvider public API
- `src/llm/types.ts` - ILLMOptions, ILLMResponse, IModelInfo

**Providers:**
- `src/llm/providers/openai-provider.ts` - OpenAI implementation
- `src/llm/providers/anthropic-provider.ts` - Anthropic Claude implementation
- `src/llm/providers/custom-provider.ts` - Template for custom providers

**Cache:**
- `src/llm/cache.ts` - Hybrid L1 (memory) + L2 (file system)
- `.cache/llm-responses/` - Persistent cache storage

**Utils:**
- `src/llm/utils/token-counter.ts` - Token estimation
- `src/llm/utils/cost-calculator.ts` - Cost tracking (<$0.10/session target)

**Tests:** `src/llm/__tests__/` with provider-specific tests

---

#### FR34-FR41: Context & Intelligence

**Agent:**
- `src/agents/context/context-agent.ts` - Main context loading logic

**File Management:**
- `src/agents/context/file-loader.ts` - Intelligent file loading
- `src/agents/context/token-optimizer.ts` - Token usage optimization

**Security:**
- `src/agents/context/security-validator.ts` - Real-time security validation

**Tests:** `src/agents/context/__tests__/`

---

#### FR42-FR48: Commands & Interaction

**Commands:**
- `src/commands/toggle-hud.command.ts` - Toggle HUD visibility
- `src/commands/change-mode.command.ts` - Change display mode
- `src/commands/clear-cache.command.ts` - Clear LLM cache
- `src/commands/show-metrics.command.ts` - Show usage metrics

**Registry:**
- `src/commands/command-registry.ts` - Central registration

**Manifest:**
- `package.json` - `contributes.commands` and `contributes.keybindings`

---

#### FR49-FR54: Configuration & Installation

**Configuration:**
- `src/config/configuration-manager.ts` - VSCode settings + SecretStorage
- `src/config/templates.ts` - Preset templates (solo, team, enterprise)
- `src/config/validation.ts` - Config validation logic

**Secrets:**
- VSCode SecretStorage via `ConfigurationManager.getProviderAPIKey()`

**Installation:**
- `package.json` - Extension manifest with activation events
- `.vscodeignore` - Packaging exclusions

---

#### FR55-FR59: Monitoring & Telemetry

**Telemetry:**
- `src/telemetry/telemetry-manager.ts` - Opt-in telemetry
- `src/telemetry/metrics-tracker.ts` - Metrics collection
- `src/telemetry/analytics-events.ts` - Event definitions

**Logging:**
- `src/utils/logger.ts` - Structured logging with levels
- Output to VSCode Output Channel

---

#### FR60-FR64: Extensibility & Public API

**Public Interfaces:**
- `src/llm/provider.interface.ts` - ILLMProvider for custom providers
- `src/agents/shared/agent.interface.ts` - IAgent for custom agents

**Documentation:**
- `docs/api/llm-provider-interface.md` - LLM Provider API docs
- `docs/api/agent-interface.md` - Agent API docs
- `docs/api/events.md` - Event system documentation

**Examples:**
- `src/llm/providers/custom-provider.ts` - Custom provider template

---

#### FR65-FR70: Documentation & Support

**Documentation:**
- `docs/guides/getting-started.md` - Quick start guide
- `docs/guides/custom-llm-provider.md` - How to create custom provider
- `docs/guides/troubleshooting.md` - Common issues and solutions
- `docs/guides/contributing.md` - Contribution guidelines

**Project Docs:**
- `README.md` - Project overview
- `CHANGELOG.md` - Version history
- `LICENSE` - MIT License

---

#### FR71-FR75: Validation & Metrics

**Analytics:**
- `src/analytics/usage-tracker.ts` - Track acceptance rate (>60% target)
- `src/analytics/nps-survey.ts` - NPS survey integration
- `src/analytics/quality-metrics.ts` - Comprehension surveys (8/10 target)

**Tests:**
- Test coverage >70% via co-located `__tests__/` directories
- `test/suite/` - E2E integration tests

---

### Integration Points

#### Internal Communication

**1. Extension Backend Components**

**Pattern:** Dependency Injection

**Example:**
```typescript
// src/extension.ts - Dependency setup
const outputChannel = vscode.window.createOutputChannel('Suika');
const logger = new Logger('Extension', outputChannel, LogLevel.Info);
const errorHandler = new ErrorHandler(logger);

const cache = new HybridLLMCache(logger, context.globalStorageUri.fsPath);
const llmManager = new LLMProviderManager(cache, logger, errorHandler);

const webviewPanel = createWebviewPanel();
const stateManager = new ExtensionStateManager(webviewPanel);

const configManager = new ConfigurationManager(context);

const architectAgent = new ArchitectAgent(llmManager, stateManager, logger);
const coderAgent = new CoderAgent(llmManager, stateManager, logger);
const reviewerAgent = new ReviewerAgent(llmManager, stateManager, logger);
const contextAgent = new ContextAgent(stateManager, logger);

const orchestrator = new AgentOrchestrator(
  stateManager,
  llmManager,
  architectAgent,
  coderAgent,
  reviewerAgent,
  contextAgent,
  logger
);
```

**2. Webview Components**

**Pattern:** Shared state manager + pub/sub

**Example:**
```javascript
// src/webview/main.js
const stateManager = new WebviewStateManager();

// Create agent components
const architectAgent = new AgentComponent('agents-container', 'architect', 'Architect', '🏗️');
const coderAgent = new AgentComponent('agents-container', 'coder', 'Coder', '💻');
const reviewerAgent = new AgentComponent('agents-container', 'reviewer', 'Reviewer', '🔍');
const contextAgent = new AgentComponent('agents-container', 'context', 'Context', '📚');

// Render all
architectAgent.render();
coderAgent.render();
reviewerAgent.render();
contextAgent.render();

// Subscribe to state changes
stateManager.subscribe('architect', (state) => {
  const agentState = state.agents.get('architect');
  architectAgent.updateStatus(agentState.status, agentState.currentTask);
});

stateManager.subscribe('coder', (state) => {
  const agentState = state.agents.get('coder');
  coderAgent.updateStatus(agentState.status, agentState.currentTask);
});

// Subscribe to mode changes
stateManager.subscribe('mode', (state) => {
  modeIndicator.updateMode(state.mode);
});
```

---

#### External Integrations

**1. LLM Provider APIs**

**OpenAI:**
- **Endpoint:** `https://api.openai.com/v1/chat/completions`
- **Protocol:** HTTPS REST, JSON payloads
- **Auth:** `Authorization: Bearer ${apiKey}`
- **Models:** gpt-4-turbo, gpt-4, gpt-3.5-turbo

**Anthropic:**
- **Endpoint:** `https://api.anthropic.com/v1/messages`
- **Protocol:** HTTPS REST, JSON payloads
- **Auth:** `x-api-key: ${apiKey}`
- **Models:** claude-3-opus, claude-3-sonnet, claude-3-haiku

**Custom:**
- User-defined endpoints via `ILLMProvider` implementation
- Flexible authentication via implementation

**2. VSCode Extension Host**

- **Protocol:** VSCode Extension API (JavaScript/TypeScript bindings)
- **Communication:** Direct method calls to `vscode.*` APIs
- **Lifecycle:**
  - VSCode calls `activate(context)` on extension load
  - Extension registers commands, providers, etc.
  - VSCode calls `deactivate()` on unload
- **Threading:** Single-threaded Node.js event loop

**3. File System**

**Cache Storage:**
- **Path:** `.cache/llm-responses/`
- **Format:** JSON files with hashed filenames
- **Example:** `.cache/llm-responses/abc123def456.json`

**Configuration:**
- **Path:** Managed by VSCode (`settings.json`)
- **Access:** Via `vscode.workspace.getConfiguration()`

**Secrets:**
- **Path:** VSCode SecretStorage (encrypted by VSCode)
- **Access:** Via `context.secrets.get()` / `set()`

---

#### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Action (VSCode)                         │
│              (Hotkey, Command Palette, Click)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Command Handler                                │
│            (src/commands/*.command.ts)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              AgentOrchestrator.processUserRequest()              │
│                (src/agents/orchestrator.ts)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌───────────────────┐              ┌──────────────────────┐
│  Context Agent    │              │  State Manager       │
│  loadRelevantFiles│              │  updateAgentState()  │
│                   │              │  ('context', 'working')│
└────────┬──────────┘              └──────────────────────┘
         │                                     │
         │                                     ▼
         │                         ┌──────────────────────┐
         │                         │   postMessage        │
         │                         │   toWebview:         │
         │                         │   agentStateUpdate   │
         │                         └──────────┬───────────┘
         ▼                                    │
┌───────────────────┐                        │
│  Architect Agent  │                        │
│  analyze() if     │                        │
│  needed           │                        │
└────────┬──────────┘                        │
         │                                    │
         ▼                                    │
┌───────────────────┐                        │
│  Coder Agent      │                        │
│  generate()       │◄───────┐               │
└────────┬──────────┘        │               │
         │                   │               │
         ▼                   │               │
┌───────────────────────────────┐           │
│   LLM Provider Manager        │           │
│   callLLM()                   │           │
└────────┬──────────────────────┘           │
         │                                   │
         ▼                                   │
┌───────────────────┐                       │
│  Cache (check)    │──── Hit? ──┐          │
└────────┬──────────┘            │          │
         │ (miss)                │          │
         ▼                       │          │
┌───────────────────┐            │          │
│  LLM Provider     │            │          │
│  (OpenAI/         │            │          │
│   Anthropic)      │            │          │
└────────┬──────────┘            │          │
         │                       │          │
         ▼                       │          │
┌───────────────────┐            │          │
│  LLM Response     │◄───────────┘          │
└────────┬──────────┘                       │
         │                                   │
         ▼                                   │
┌───────────────────┐                       │
│  Cache (set)      │                       │
└────────┬──────────┘                       │
         │                                   │
         └────────────►┌──────────────────┐ │
                       │  Reviewer Agent  │ │
                       │  validate()      │ │
                       └────────┬─────────┘ │
                                │           │
                                ▼           │
                    ┌──────────────────────┐│
                    │  State Manager       ││
                    │  updateAgentState()  ││
                    │  ('coder', 'success')││
                    └────────┬─────────────┘│
                             │              │
                             ▼              │
                    ┌──────────────────────┐│
                    │   postMessage        ││
                    │   toWebview:         ││
                    │   agentStateUpdate   ││
                    └────────┬─────────────┘│
                             │              │
                             └──────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   Webview (Browser Context)  │
              │   window.addEventListener    │
              │   ('message', ...)           │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   WebviewStateManager        │
              │   handleBackendMessage()     │
              │   notifyListeners('coder')   │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   AgentComponent             │
              │   updateStatus('success')    │
              │   requestAnimationFrame()    │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   User Sees Visual Feedback  │
              │   (60fps animations)         │
              └──────────────────────────────┘
```

---

### File Organization Patterns

#### Configuration Files

**Root Configuration:**
- `package.json` - Extension manifest, dependencies, scripts, contributes
- `tsconfig.json` - TypeScript config (extension, Node.js target)
- `tsconfig.webview.json` - Separate config (webview, browser target)
- `esbuild.config.js` - Dual-build setup (extension CJS + webview IIFE)
- `.eslintrc.json` - Linting rules
- `.prettierrc.json` - Formatting rules

**Environment:**
- `.env.example` - Example environment variables (no secrets!)
- `.gitignore` - Git exclusions (node_modules, dist, .cache, .env)
- `.vscodeignore` - Packaging exclusions (tests, src maps in production)

---

#### Source Organization

**By Responsibility:**
- `src/agents/` - Multi-agent system
- `src/llm/` - LLM provider abstraction
- `src/state/` - State management
- `src/webview/` - Webview provider (backend)
- `src/webview/` (separate) - Frontend UI
- `src/config/` - Configuration management
- `src/commands/` - VSCode commands
- `src/errors/` - Error handling
- `src/telemetry/` - Telemetry & monitoring
- `src/analytics/` - User analytics
- `src/utils/` - Shared utilities

**Pattern:** Domain-specific folders with co-located tests

---

#### Test Organization

**Pattern:** Co-located `__tests__/` subdirectories (Decision #2.3)

**Unit Tests:**
```
src/agents/architect/architect-agent.ts
src/agents/architect/__tests__/architect-agent.test.ts
```

**Integration Tests:**
```
src/agents/__tests__/integration/multi-agent-workflow.test.ts
```

**E2E Tests:**
```
test/suite/extension.test.ts
test/suite/agent-orchestrator.test.ts
```

**Test Runner:** `@vscode/test-electron` for VSCode extension tests

---

#### Asset Organization

**Webview Assets:**
- `src/webview/styles/` - CSS (BEM organized)
- `src/webview/styles/components/` - Component-specific styles
- `src/webview/styles/themes/` - Theme variables

**Documentation Assets:**
- `docs/images/` - Screenshots, diagrams
- `docs/architecture/` - Architecture docs
- `docs/api/` - API documentation
- `docs/guides/` - User guides

**Build Output:**
- `dist/` - Production build (minified)
- `out/` - Development build (source maps)

---

### Development Workflow Integration

#### Development Server Structure

**Development Mode:**
```bash
npm run watch
# → esbuild --watch mode
# → Compiles on file change
# → <1s builds
# → Source maps enabled
```

**Extension Development Host:**
- Press F5 in VSCode
- Launches Extension Development Host window
- Hot reload on code changes (via watch)
- Debugging with breakpoints

---

#### Build Process Structure

**Development Build:**
```bash
npm run compile
# → esbuild src/extension.ts → dist/extension.js (CJS, Node.js)
# → esbuild src/webview/main.js → dist/webview.js (IIFE, browser)
# → Source maps included
# → No minification
```

**Production Build:**
```bash
npm run package
# → Same as compile but with minification
# → No source maps
# → Optimized for distribution
```

**Build Configuration (`esbuild.config.js`):**
```javascript
// Extension build (Node.js context)
{
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node16',
  sourcemap: process.env.NODE_ENV === 'development',
  minify: process.env.NODE_ENV === 'production'
}

// Webview build (Browser context)
{
  entryPoints: ['src/webview/main.js'],
  bundle: true,
  outfile: 'dist/webview.js',
  format: 'iife',
  platform: 'browser',
  target: ['chrome100'],
  sourcemap: process.env.NODE_ENV === 'development',
  minify: process.env.NODE_ENV === 'production'
}
```

---

#### Deployment Structure

**VSCode Marketplace Packaging:**
```bash
npx vsce package
# → Creates suika-{version}.vsix
# → Includes: package.json, dist/, README.md, LICENSE, CHANGELOG.md
# → Excludes: src/, tests/, .cache/, node_modules/ (via .vscodeignore)
```

**Installation:**
```bash
# From marketplace
code --install-extension suika

# From VSIX
code --install-extension suika-1.0.0.vsix
```

**Update Strategy:**
- Semantic versioning (MAJOR.MINOR.PATCH)
- CHANGELOG.md updated with each release
- Backward compatibility for public APIs (ILLMProvider, IAgent)

---

**🎉 Project Structure Complete!**

Cette structure complète définit tous les fichiers, dossiers, boundaries, et integration points pour l'implémentation du projet suika.


## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

Les 9 décisions architecturales core fonctionnent ensemble de manière cohérente:

1. **Orchestrator Central + LLM Provider Abstraction** - L'orchestrateur utilise le LLMProviderManager pour tous les appels LLM, créant une séparation claire des responsabilités
2. **State Management Dual Pattern + Webview Rendering** - Le state backend (Node.js) communique avec le state frontend (Browser) via postMessage, supportant parfaitement le vanilla JS avec animations 60fps
3. **LLM Cache Hybrid + Provider Manager** - Le cache est intégré au LLMProviderManager, vérifié avant chaque appel, optimisant les coûts (<$0.10/session)
4. **Configuration Manager + Error Handler** - Configuration centralisée fournit les settings à tous les composants, ErrorHandler injecté partout pour retry logic cohérente
5. **Testing Strategy + All Components** - Tests co-located `__tests__/` fonctionnent avec tous les patterns (agents, LLM, state, webview)

**Versions Compatibility Check:**
- TypeScript 5.3.3 ✅ Compatible Node 16+
- VSCode API 1.75+ ✅ Compatible toutes plateformes (Mac/Windows/Linux)
- esbuild latest ✅ Supporte dual-build (CJS + IIFE)
- React 18.2.0 (OPTED OUT) ✅ Vanilla JS choisi pour performance 60fps
- Node 16+ ✅ Requis pour VSCode Extension API

**Aucun conflit de versions détecté.**

---

**Pattern Consistency:**

Les 35 implementation patterns supportent directement les décisions architecturales:

- **Naming Patterns** → Interfaces "I" prefix cohérent avec public API (ILLMProvider, IAgent)
- **Structure Patterns** → Folder-per-agent supporte encapsulation agents
- **Message Patterns** → Direction prefix (`toWebview:`, `toExtension:`) supporte debugging postMessage
- **State Patterns** → Immutable updates + Map container supportent Dual State Pattern
- **Error Patterns** → Centralized ErrorHandler + specialized subclasses supportent Decision #7
- **API Patterns** → async/await + throw errors supportent consistency
- **CSS Patterns** → BEM + GPU-accelerated animations supportent 60fps NFR

**Aucune incohérence pattern-décision détectée.**

---

**Structure Alignment:**

La structure projet (~150 fichiers/dossiers) supporte toutes les décisions:

- `src/agents/` avec sous-dossiers → Supporte Orchestrator Central pattern
- `src/llm/` avec `providers/` → Supporte ILLMProvider abstraction
- `src/state/` backend + `src/webview/state/` frontend → Supporte Dual State
- `src/llm/cache.ts` + `.cache/` directory → Supporte Hybrid Cache
- `src/webview/` vanilla JS + `styles/` CSS → Supporte 60fps rendering
- `src/config/` → Supporte Configuration Manager pattern
- `src/errors/` → Supporte Error Handler centralisé
- Co-located `__tests__/` → Supporte Testing Strategy

**Structure 100% alignée avec architecture.**

---

### Requirements Coverage Validation ✅

**Functional Requirements Coverage (75 FRs):**

**FR1-FR8 (Multi-Agent System):** ✅ COUVERT
- Architecture: Orchestrator + 4 agents (Architect, Coder, Reviewer, Context)
- Location: `src/agents/` avec orchestrator.ts
- State: Real-time updates via ExtensionStateManager
- UI: Agent components dans `src/webview/components/agent-component.js`

**FR9-FR16 (HUD Interface):** ✅ COUVERT
- Architecture: Webview vanilla JS + CSS animations GPU-accelerated
- Location: `src/webview/components/`, `src/webview/styles/`
- Patterns: BEM CSS, requestAnimationFrame, 60fps target
- Vital Signs: `vital-signs-bar.js` avec throttling 100ms

**FR17-FR25 (Modes & Personnalisation):** ✅ COUVERT
- Architecture: Mode state machine dans ExtensionStateManager
- Location: `src/state/`, `src/config/templates.ts`
- Modes: Learning, Expert, Focus, Team, Performance
- UI: `mode-indicator.js` component

**FR26-FR33 (LLM Management):** ✅ COUVERT
- Architecture: ILLMProvider interface + LLMProviderManager + Registry
- Location: `src/llm/` avec providers OpenAI, Anthropic, Custom
- Cache: Hybrid L1+L2 dans `src/llm/cache.ts`
- Fallbacks: Automatic dans LLMProviderManager

**FR34-FR41 (Context & Intelligence):** ✅ COUVERT
- Architecture: Context Agent avec file-loader, token-optimizer
- Location: `src/agents/context/`
- Security: `security-validator.ts` pour validation temps réel

**FR42-FR48 (Commands & Interaction):** ✅ COUVERT
- Architecture: VSCode commands registration
- Location: `src/commands/` avec command-registry.ts
- Manifest: `package.json` contributes.commands et keybindings

**FR49-FR54 (Configuration):** ✅ COUVERT
- Architecture: ConfigurationManager + VSCode SecretStorage
- Location: `src/config/configuration-manager.ts`
- Templates: `templates.ts` (solo, team, enterprise)

**FR55-FR59 (Monitoring):** ✅ COUVERT
- Architecture: Opt-in telemetry + structured logging
- Location: `src/telemetry/`, `src/utils/logger.ts`

**FR60-FR64 (Extensibility):** ✅ COUVERT
- Architecture: Public interfaces ILLMProvider, IAgent
- Location: `src/llm/provider.interface.ts`, `src/agents/shared/agent.interface.ts`
- Documentation: `docs/api/`

**FR65-FR70 (Documentation):** ✅ COUVERT
- Location: `docs/guides/`, `README.md`, `CHANGELOG.md`

**FR71-FR75 (Validation & Metrics):** ✅ COUVERT
- Architecture: Usage tracking, NPS, quality metrics
- Location: `src/analytics/`
- Tests: >70% coverage via co-located `__tests__/`

**Tous les 75 Functional Requirements sont architecturalement supportés.**

---

**Non-Functional Requirements Coverage (34 NFRs):**

**Performance NFRs (6):** ✅ COUVERT
- **60fps animations:** CSS GPU-accelerated (`transform: translate3d()`, `will-change`), requestAnimationFrame, vanilla JS (pas React overhead)
- **<100ms UI response:** Instant agent state updates (no throttle), optimized postMessage
- **<2s startup:** esbuild ultra-fast builds, lazy loading, no heavy dependencies
- **10+ sessions/jour:** Stateless design, cache persistent, no memory leaks
- **Async rendering:** requestAnimationFrame, non-blocking operations
- Architecture: Décisions #5 (Webview Rendering), patterns CSS/JS

**Accessibility NFRs (5):** ✅ COUVERT
- Keyboard navigation, high contrast, screen reader compatible
- Architecture: Webview HTML semantic, ARIA attributes, hotkeys
- Location: `src/webview/index.html`, `package.json` keybindings

**Security & Privacy NFRs (5):** ✅ COUVERT
- **SecretStorage encrypted:** `ConfigurationManager.getProviderAPIKey()`
- **No code logging:** Telemetry opt-in, anonymized only
- **HTTPS/TLS:** LLM providers via HTTPS
- Architecture: Décision #6 (Configuration), #9 (Telemetry)

**Maintainability NFRs (6):** ✅ COUVERT
- **>70% test coverage:** Co-located `__tests__/`, Mocha + @vscode/test-electron
- **TypeScript strict:** `tsconfig.json` strict mode
- **Decoupled architecture:** Interfaces ILLMProvider, IAgent, dependency injection
- Architecture: Décision #8 (Testing Strategy), patterns organization

**Cost Management NFRs (4):** ✅ COUVERT
- **<$0.10/session:** LLM cache hybrid (>50% hit rate target)
- **Rate limiting:** LLMProviderManager avec budgets configurables
- **Metrics visible:** `src/analytics/usage-tracker.ts`, Vital Signs Bar
- Architecture: Décision #4 (Hybrid Cache), `src/llm/utils/cost-calculator.ts`

**Reliability NFRs (5):** ✅ COUVERT
- **0 crash tolerance startup:** Error handling centralisé, graceful degradation
- **Cross-platform:** Node 16+, VSCode 1.75+, esbuild multi-target
- **Fallbacks automatic:** LLMProviderManager retry + fallbacks
- Architecture: Décision #7 (Error Handler), patterns retry logic

**Compatibility NFRs (4):** ✅ COUVERT
- Node 16+, VSCode 1.75+, yarn/pnpm support
- Architecture: `package.json` engines field, lockfile

**Usability NFRs (4):** ✅ COUVERT
- <2min installation, clear error messages, onboarding
- Architecture: `docs/guides/getting-started.md`, ErrorHandler getUserMessage()

**Tous les 34 Non-Functional Requirements sont architecturalement couverts.**

---

### Implementation Readiness Validation ✅

**Decision Completeness:**

✅ **9 décisions critiques documentées:**
1. Multi-Agent Architecture (Orchestrator Central) - Code examples complets
2. LLM Provider Abstraction (ILLMProvider + Registry) - Interfaces + implementations
3. State Management (Dual State Pattern) - Backend + Frontend code
4. LLM Cache (Hybrid L1+L2) - Cache class complète
5. Webview Rendering (CSS + Vanilla JS) - Animation patterns
6. Configuration (VSCode API + SecretStorage) - ConfigurationManager code
7. Error Handling (Centralized + Retry) - ErrorHandler + subclasses
8. Testing (Multi-layer) - Mocha + @vscode/test-electron
9. Telemetry (Opt-in + Privacy) - TelemetryManager code

✅ **Versions spécifiées:** TypeScript 5.3.3, Node 16+, VSCode 1.75+, esbuild, tous les providers avec models

✅ **Trade-offs documentés:** Chaque décision inclut benefits + trade-offs + rationale

---

**Structure Completeness:**

✅ **~150 fichiers/dossiers définis:** Structure complète de root à leaf files
✅ **Tous les entry points:** `src/extension.ts`, `src/webview/main.js`, `package.json`
✅ **Tous les tests:** Co-located `__tests__/` pour chaque module
✅ **Toutes les configs:** `tsconfig.json`, `esbuild.config.js`, `.eslintrc.json`, etc.
✅ **Tous les docs:** `docs/architecture/`, `docs/api/`, `docs/guides/`
✅ **Build outputs:** `dist/`, `.cache/`, `.vscode-test/`

---

**Pattern Completeness:**

✅ **35 patterns définis** couvrant 7 catégories:
- Naming (5): Interfaces, classes, methods, private members, files
- Structure (5): Agents, LLM, tests, webview, utils
- Messages (5): Type naming, payload, identifiers, status, direction
- State (5): Mutations, containers, initialization, subscriptions, throttling
- Errors (5): Classes, messages, retry, logging, display
- API (5): Async, parameters, returns, callbacks, naming
- CSS/Webview (5): Classes (BEM), variables, animations, data attributes, components

✅ **Examples CORRECT/INCORRECT** pour chaque pattern
✅ **Rationales explicites** pour chaque choix
✅ **Anti-patterns documentés** (ce qu'il ne faut PAS faire)
✅ **Pattern verification checklist** fournie

---

**Integration Points Defined:**

✅ **Internal:** Dependency injection, pub/sub, direct calls
✅ **External:** LLM APIs (OpenAI, Anthropic), VSCode Extension Host, File System
✅ **Data Flow:** Diagramme complet User Action → Orchestrator → Agents → LLM → State → Webview
✅ **Boundaries:** API, Component, Service, Data boundaries tous définis

---

### Gap Analysis Results

**Critical Gaps:** ✅ AUCUN

Tous les éléments bloquants pour l'implémentation sont définis:
- Toutes les décisions architecturales critiques documentées
- Tous les patterns nécessaires pour cohérence définis
- Structure complète avec tous les fichiers principaux
- Boundaries et integration points clairs

---

**Important Gaps:** ⚠️ 2 GAPS NON-BLOQUANTS

**Gap #1: Webview Unit Testing Framework (Important, non-bloquant)**

**Description:** Framework spécifique pour tester les composants webview vanilla JS non encore choisi (jsdom vs playwright vs vitest browser mode).

**Impact:** Tests webview seront écrits plus tard, mais tests extension backend peuvent commencer immédiatement.

**Recommendation:** Décider pendant Story 7 (Webview HUD implementation):
- **Option A:** jsdom - Léger, rapide, suffisant pour vanilla JS
- **Option B:** playwright - Plus lourd mais teste vraiment dans browser
- **Option C:** vitest browser mode - Moderne, performant

**Pas bloquant:** Tests extension backend (Mocha + @vscode/test-electron) sont définis et peuvent commencer. Tests webview peuvent être ajoutés progressivement.

---

**Gap #2: CI/CD Pipeline Configuration Détaillée (Important, non-bloquant)**

**Description:** Fichiers `.github/workflows/*.yml` mentionnés dans structure mais contenu détaillé pas encore défini.

**Impact:** CI/CD sera configuré pendant implementation, pas bloquant pour coder.

**Recommendation:** Créer pendant Story 2 ou 3 (après premiers tests écrits):
- `ci.yml` - Lint, test, build sur chaque push
- `pr-checks.yml` - Validation PR (lint, tests, coverage >70%)
- `release.yml` - Publication VSCode Marketplace automatique

**Pas bloquant:** Développeurs peuvent lint/test localement avec `npm run lint`, `npm test`. CI/CD améliore workflow mais pas requis pour commencer.

---

**Nice-to-Have Gaps:** ℹ️ 3 GAPS OPTIONNELS

**Gap #3: Performance Benchmarking Framework**
- **Description:** Outils pour mesurer 60fps, <100ms response time automatiquement
- **Impact:** Mesures manuelles suffisent pour MVP
- **Recommendation:** Ajouter si performance devient problème

**Gap #4: E2E Test Framework Details**
- **Description:** Playwright E2E tests mentionnés mais pas de examples concrets
- **Impact:** Tests unitaires + integration suffisent pour MVP
- **Recommendation:** Ajouter E2E tests progressivement après Story 10+

**Gap #5: Code Generation Templates**
- **Description:** Templates pour générer rapidement agents, providers, commands
- **Impact:** Code manuel fonctionne, templates juste accélèrent
- **Recommendation:** Créer templates si patterns répétitifs émergent

---

### Validation Issues Addressed

**Aucun issue critique ou important détecté.**

Les 2 gaps importants identifiés (#1 Webview testing, #2 CI/CD) sont **non-bloquants** et peuvent être adressés pendant implementation sans impacter le démarrage.

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed (75 FRs + 34 NFRs)
- [x] Scale and complexity assessed (Medium-High complexity, 4 agents, multi-provider)
- [x] Technical constraints identified (VSCode Extension API, 60fps animations, <$0.10/session)
- [x] Cross-cutting concerns mapped (6 identified: extensibility, multi-mode, telemetry, etc.)

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions (9 core decisions avec TypeScript 5.3.3, Node 16+, VSCode 1.75+)
- [x] Technology stack fully specified (Yeoman generator + esbuild + vanilla JS + Mocha)
- [x] Integration patterns defined (Orchestrator Central, Dual State, postMessage, ILLMProvider)
- [x] Performance considerations addressed (60fps GPU-accelerated, cache >50%, <100ms UI)

**✅ Implementation Patterns**

- [x] Naming conventions established (35 patterns across 7 categories)
- [x] Structure patterns defined (folder-per-agent, co-located tests, domain-specific utils)
- [x] Communication patterns specified (postMessage avec direction prefix, immutable state)
- [x] Process patterns documented (centralized error handler, retry exponential backoff)

**✅ Project Structure**

- [x] Complete directory structure defined (~150 files/folders from root to leafs)
- [x] Component boundaries established (API, Component, Service, Data boundaries)
- [x] Integration points mapped (Internal DI + pub/sub, External LLM APIs + VSCode)
- [x] Requirements to structure mapping complete (75 FRs → specific directories/files)

**✅ Validation & Quality**

- [x] Coherence validation passed (all decisions compatible, patterns consistent, structure aligned)
- [x] Requirements coverage verified (100% FRs + NFRs covered architecturally)
- [x] Implementation readiness confirmed (decisions complete, structure complete, patterns complete)
- [x] Gap analysis performed (0 critical, 2 important non-blocking, 3 optional)

---

### Architecture Readiness Assessment

**Overall Status:** ✅ **READY FOR IMPLEMENTATION**

**Confidence Level:** **HIGH** (95%)

**Justification:**
- Toutes les décisions architecturales critiques sont documentées avec code examples
- Tous les requirements (75 FRs + 34 NFRs) sont couverts architecturalement
- Structure complète définie avec ~150 fichiers/dossiers
- 35 implementation patterns établis pour garantir cohérence
- 0 gaps critiques, 2 gaps non-bloquants identifiés avec plans
- Validation complète passée (coherence, coverage, readiness)

---

**Key Strengths:**

1. **Comprehensive Pattern System** - 35 patterns couvrant naming, structure, messages, state, errors, API, CSS/webview garantissent cohérence entre agents IA
2. **Strong Performance Architecture** - Vanilla JS + GPU-accelerated CSS + cache hybrid + throttling granulaire → 60fps + <100ms + <$0.10/session achievable
3. **Extensibility Built-In** - ILLMProvider et IAgent interfaces publiques permettent custom providers et agents sans modifier core
4. **Clear Boundaries** - API, Component, Service, Data boundaries bien définis préviennent couplage et conflits
5. **Test-First Mindset** - Co-located tests + >70% coverage target + multi-layer strategy (unit/integration/E2E) garantissent qualité
6. **Complete Requirements Mapping** - Chaque FR/NFR mappé à composants spécifiques, pas de "TBD" architecturaux

---

**Areas for Future Enhancement (Post-MVP):**

1. **Performance Monitoring** - Ajouter framework benchmarking automatique pour valider 60fps/100ms continuellement (Gap #3)
2. **E2E Test Suite** - Enrichir E2E tests avec Playwright pour user journeys critiques (Gap #4)
3. **Agent Collaboration Patterns** - Explorer patterns avancés pour collaboration agent-à-agent directe (actuellement via orchestrator seulement)
4. **Multi-Workspace Support** - Architecture supporte, mais patterns pour sync multi-workspace pourraient être affinés
5. **Custom Agent SDK** - Créer SDK simplifié pour third-party developers créant custom agents
6. **Webview Component Library** - Extraire composants vanilla JS réutilisables en micro-library interne

**Aucune de ces enhancements ne bloque l'implémentation MVP.**

---

### Implementation Handoff

**AI Agent Guidelines:**

1. **Follow Architectural Decisions Exactly**
   - Implement Orchestrator Central pattern (Decision #1) - pas d'agent-to-agent calls
   - Use ILLMProvider interface (Decision #2) - jamais appeler providers directement
   - Apply Dual State Pattern (Decision #3) - backend source of truth, frontend mirror
   - Implement Hybrid Cache (Decision #4) - L1 memory + L2 file system avec invalidation

2. **Use Implementation Patterns Consistently**
   - Interfaces: "I" prefix (`ILLMProvider`, `IAgent`, `IAgentState`)
   - Classes: Descriptive suffix (`ArchitectAgent`, `LLMProviderManager`)
   - Files: kebab-case (`architect-agent.ts`, `llm-provider-manager.ts`)
   - Methods: camelCase verb-first (`generateCompletion`, `updateAgentState`)
   - CSS: BEM (`.agent__icon--large`)
   - Messages: Direction prefix (`toWebview:agentStateUpdate`)
   - State: Immutable updates (spread operators)
   - Errors: Throw, never return null
   - Async: async/await everywhere

3. **Respect Project Structure**
   - Agents: `src/agents/{agent-name}/` avec barrel exports `index.ts`
   - Tests: Co-located `__tests__/` subdirectories
   - LLM: `src/llm/` avec `providers/` subdirectory
   - Webview: `src/webview/components/` pour UI, `src/webview/state/` pour state
   - Utils: Domain-specific co-located, `src/utils/` pour truly shared

4. **Respect Boundaries**
   - Orchestrator calls agents, agents don't call each other
   - Agents call LLMManager, never providers directly
   - Backend state is source of truth, sync via postMessage
   - Only `extension.ts` and `webview-provider.ts` import `vscode` module
   - Cache is private to LLMProviderManager

5. **Refer to This Document**
   - All architectural questions → Section "Core Architectural Decisions"
   - Pattern questions → Section "Implementation Patterns & Consistency Rules"
   - Structure questions → Section "Project Structure & Architectural Boundaries"
   - Integration questions → Section "Integration Points" avec data flow diagram

---

**First Implementation Priority:**

**Story 1: Initialize Base Extension avec Yeoman Generator**

```bash
# Command pour démarrer
npx --package yo --package generator-code -- yo code

# Sélections prompts:
# - Type: New Extension (TypeScript)
# - Name: suika
# - Identifier: suika
# - Description: VSCode AI agents with transparent HUD
# - Bundler: esbuild (CRITICAL CHOICE)
# - Package manager: npm
```

**Post-initialization Steps:**

1. Configure dual-build dans `esbuild.config.js` (extension + webview)
2. Créer structure dossiers selon architecture:
   - `src/agents/`, `src/llm/`, `src/state/`, `src/webview/`, `src/config/`, `src/commands/`, `src/errors/`
3. Setup linting: `.eslintrc.json` avec rules TypeScript strict
4. Setup prettier: `.prettierrc.json` pour formatting cohérent
5. Créer `.env.example` avec variables example (API keys templates)
6. Update `package.json` avec contribution points (commands, keybindings, configuration)

**Subsequent Stories Sequence (Recommended):**

1. **Story 1:** Initialize base extension (Yeoman + structure)
2. **Story 2:** Configuration Manager + SecretStorage (blocking - need API keys avant LLM)
3. **Story 3:** LLM Provider abstraction interfaces + OpenAI implementation
4. **Story 4:** State Management (Extension + Webview dual pattern)
5. **Story 5:** Agent Orchestrator + base agent interface
6. **Story 6:** Context Agent implementation (file loading)
7. **Story 7:** Webview HUD + Agent components (vanilla JS + CSS)
8. **Story 8:** Architect Agent implementation
9. **Story 9:** Coder Agent implementation
10. **Story 10:** Reviewer Agent implementation
11. **Story 11:** LLM Cache (Hybrid L1+L2)
12. **Story 12:** Error Handler centralized
13. **Story 13+:** Features implementation (modes, commands, telemetry, etc.)

**See "Implementation Sequence Recommendations" dans Section "Core Architectural Decisions" pour dépendances détaillées.**

---

**🎉 Architecture Document Complete & Validated!**

Cette architecture est prête à guider l'implémentation consistante du projet suika par des agents IA multiples travaillant en parallèle.

---

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-10
**Document Location:** _bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**

- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**

- **9 architectural decisions made** - Orchestrator Central, ILLMProvider abstraction, Dual State, Hybrid Cache, CSS-driven webview, VSCode Config, Centralized errors, Multi-layer testing, Opt-in telemetry
- **35 implementation patterns defined** - Covering naming, structure, messages, state, errors, API, and CSS/webview patterns
- **8 architectural components specified** - agents, llm, state, webview, config, commands, errors, utils
- **109 requirements fully supported** - 75 Functional Requirements + 34 Non-Functional Requirements

**📚 AI Agent Implementation Guide**

- Technology stack with verified versions (TypeScript 5.3.3, Node 16+, VSCode 1.75+, esbuild, Vanilla JS)
- Consistency rules that prevent implementation conflicts (35 patterns)
- Project structure with clear boundaries (~150 files/folders)
- Integration patterns and communication standards (postMessage, ILLMProvider, Dual State)

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing suika. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
```bash
npx --package yo --package generator-code -- yo code

# Prompts selections:
# - Type: New Extension (TypeScript)
# - Name: suika
# - Identifier: suika
# - Description: VSCode AI agents with transparent HUD
# - Bundler: esbuild (CRITICAL)
# - Package manager: npm
```

**Development Sequence:**

1. Initialize project using documented starter template (Yeoman Generator)
2. Set up development environment per architecture (dual-build esbuild config)
3. Implement core architectural foundations (Configuration Manager, LLM abstraction, State Management)
4. Build features following established patterns (Agents, Webview HUD, Cache, Commands)
5. Maintain consistency with documented rules (35 implementation patterns)

### Quality Assurance Checklist

**✅ Architecture Coherence**

- [x] All decisions work together without conflicts
- [x] Technology choices are compatible (TypeScript + Node + VSCode + esbuild + Vanilla JS)
- [x] Patterns support the architectural decisions (Orchestrator Central + ILLMProvider + Dual State)
- [x] Structure aligns with all choices (~150 files organized by domain)

**✅ Requirements Coverage**

- [x] All functional requirements are supported (75/75 FRs mapped to components)
- [x] All non-functional requirements are addressed (34/34 NFRs architecturally covered)
- [x] Cross-cutting concerns are handled (6 concerns: logging, errors, config, auth, performance, telemetry)
- [x] Integration points are defined (postMessage, LLM providers, VSCode API)

**✅ Implementation Readiness**

- [x] Decisions are specific and actionable (9 decisions with code examples)
- [x] Patterns prevent agent conflicts (35 patterns with ✅/❌ examples)
- [x] Structure is complete and unambiguous (~150 files/folders fully specified)
- [x] Examples are provided for clarity (TypeScript, JavaScript, CSS code snippets throughout)

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction. **Key decision: Vanilla JavaScript over React for webview** to achieve 60fps performance requirement.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly. 35 patterns cover all critical areas: naming, structure, messages, state, errors, API, CSS/webview.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation. 100% of 109 requirements (75 FRs + 34 NFRs) are covered with 0 critical gaps.

**🏗️ Solid Foundation**
The chosen starter template (Microsoft Yeoman Generator) and architectural patterns (Orchestrator Central, ILLMProvider, Dual State, Hybrid Cache) provide a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

