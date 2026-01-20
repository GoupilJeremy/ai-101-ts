---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
totalEpics: 10
totalStories: 82
lastModified: '2026-01-12'
modificationType: 'critical-fixes-applied'
---

# suika - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for suika, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**FR1:** The system must display 4 distinct AI agents (Architect, Coder, Reviewer, Context) with unique visual identities

**FR2:** Users can see the current state of each agent (idle, thinking, working, alert, success) in real-time

**FR3:** Users can observe collaboration between agents (visual communication, coordination)

**FR4:** The system must show which agent is responsible for each code suggestion

**FR5:** Users can see the complete reasoning behind each AI suggestion (why this approach, what alternatives were considered)

**FR6:** Users can see which files/context each agent is currently analyzing

**FR7:** The system must allow agents to merge visually into a collective form during intense collaboration

**FR8:** Users can query a specific agent about its reasoning or decision

**FR9:** The system must display a transparent HUD (overlay) superimposed over the code

**FR10:** Users can see agents positioned adaptively based on context (rest, thinking, active, alert)

**FR11:** The HUD must automatically avoid obstructing the cursor or active editing area

**FR12:** Users can see a "Vital Signs Bar" displaying tokens consumed, files in context, global state

**FR13:** The system must display 4 distinct visual alert levels (info, warning, critical, urgent) with ideograms

**FR14:** Users can see smooth animations (state transitions, breathing, movements) at 60fps minimum

**FR15:** The system must display detected issues directly next to the relevant code lines (code-anchored alerts)

**FR16:** Users can see animated brush strokes representing communication between agents

**FR17:** Users can toggle to Focus/DND Mode where agents become invisible while keeping AI suggestions

**FR18:** Users can choose between 3 transparency levels (Minimal, Medium, Full)

**FR19:** The system must automatically adapt opacity/visibility based on user activity (active coding vs idle)

**FR20:** Users can activate a Learning Mode with detailed pedagogical explanations

**FR21:** Users can activate an Expert Mode with in-depth technical details

**FR22:** Users can activate a Team/Collaboration Mode with visible labels for pair programming

**FR23:** Users can customize appearance (color palette, agent size, bar position)

**FR24:** Users can enable High Contrast Mode for accessibility

**FR25:** Users can configure colorblind alternatives (patterns, adapted colors)

**FR26:** The system must support multiple LLM providers simultaneously (OpenAI, Anthropic Claude minimum)

**FR27:** Users can configure which LLM provider to use for which agent

**FR28:** Users can add custom LLM providers via the `ILLMProvider` interface

**FR29:** The system must automatically handle fallbacks if a provider is unavailable

**FR30:** Users can see estimated LLM costs per session in real-time

**FR31:** The system must implement intelligent caching to reduce repetitive LLM calls (>50% hit rate)

**FR32:** Users can configure rate limiting and budgets to control costs

**FR33:** The system must support on-premise/internal LLMs for enterprise compliance

**FR34:** The system must automatically load relevant project files as context

**FR35:** The Context agent must optimize file selection to stay within token limits

**FR36:** Users can see which files are currently in the AI's context

**FR37:** The system must analyze existing project architecture to align suggestions with current patterns

**FR38:** The Reviewer agent must proactively identify edge cases and risks before suggestion acceptance

**FR39:** The system must validate suggested code security in real-time (for production apps)

**FR40:** Users can see the history of decisions and reasoning for future reference

**FR41:** The system must detect and adapt to development phases (prototype, production, debug)

**FR42:** Users can accept or reject AI suggestions with immediate visual feedback

**FR43:** Users can use hotkeys to toggle HUD, change modes, force agent states

**FR44:** Users can drag-and-drop alerts to TODO list for automatic entry creation

**FR45:** Users can hover over agents to see tooltips with contextual details

**FR46:** Users can click on code-anchored alerts to see proposed fix

**FR47:** The system must expose all functions via VSCode Command Palette

**FR48:** Users can navigate keyboard-only (Tab, arrows, Enter, Space) for accessibility

**FR49:** Users can install the plugin via VSCode Marketplace in less than 2 minutes

**FR50:** Users can securely configure their API keys (VSCode SecretStorage)

**FR51:** The system must work on Mac, Windows, Linux without functional degradation

**FR52:** Users can configure preferences at workspace or user settings level

**FR53:** The system must provide configuration templates for different use cases (solo dev, team, enterprise)

**FR54:** Users can export/import their custom configurations

**FR55:** Users can see usage metrics (sessions, suggestions accepted/rejected, time saved)

**FR56:** The system must track adoption and comprehension for tech leads (team mode)

**FR57:** Users can opt-in for diagnostic telemetry (without sensitive code data)

**FR58:** The system must log errors and performance for troubleshooting

**FR59:** Users can generate usage and learning reports

**FR60:** Developers can create custom LLM providers via `ILLMProvider` interface

**FR61:** Developers can customize agent rendering via `IAgentRenderer` interface

**FR62:** Developers can subscribe to agent lifecycle events (onAgentActivated, onSuggestionAccepted)

**FR63:** The system must expose a typed API for programmatic configuration access

**FR64:** The system must maintain API compatibility according to semantic versioning

**FR65:** Users can access integrated getting-started documentation within the plugin

**FR66:** Users can search a troubleshooting knowledge base by symptoms

**FR67:** Contributors can access complete architecture documentation

**FR68:** Extension developers can access API docs with code examples

**FR69:** The system must provide clear error messages with links to relevant documentation

**FR70:** Users can access detailed changelog with contributor recognition

**FR71:** The system must track and display suggestion acceptance rate (target >60%)

**FR72:** The system must enable post-session surveys to measure comprehension (target 8/10)

**FR73:** The system must track user learning via weekly surveys (target 7/10)

**FR74:** The system must calculate and display NPS (Net Promoter Score)

**FR75:** The system must detect and report if design is "too distracting" (target 0 reports)

### Non-Functional Requirements

**NFR1 (PERF):** HUD animations (agents, transitions, breathing) must maintain constant 60fps

**NFR2 (PERF):** UI response time must be <100ms for all user interactions

**NFR3 (PERF):** Extension startup time must be <2 seconds

**NFR4 (PERF):** Plugin must support 10+ sessions per day without performance degradation

**NFR5 (PERF):** SVG and CSS transitions must use `will-change: transform` for GPU optimization

**NFR6 (PERF):** HUD rendering must not block code editing (async rendering)

**NFR7 (ACCESS):** System must support complete keyboard-only navigation (Tab, arrows, Enter, Space)

**NFR8 (ACCESS):** System must provide High Contrast mode with minimum 60% opacity

**NFR9 (ACCESS):** System must provide colorblind alternatives (patterns, adapted colors)

**NFR10 (ACCESS):** System must be compatible with screen readers for textual content

**NFR11 (ACCESS):** Hotkeys must be configurable to avoid conflicts with assistive tools

**NFR12 (SEC):** API keys must be stored via VSCode SecretStorage API (encrypted)

**NFR13 (SEC):** No user code data must be logged or transmitted without explicit consent

**NFR14 (SEC):** Telemetry must be opt-in by default with complete transparency on collected data

**NFR15 (SEC):** Communications with LLM providers must use HTTPS/TLS

**NFR16 (SEC):** System must allow on-premise LLM usage for enterprise compliance

**NFR17 (MAINT):** Test coverage must be >70% (unit + integration)

**NFR18 (MAINT):** Code must respect TypeScript strict mode and linting standards (ESLint)

**NFR19 (MAINT):** Architecture must be decoupled (Agents, Renderers, Providers separable)

**NFR20 (MAINT):** API documentation must be auto-generated (JSDoc + TypeDoc)

**NFR21 (MAINT):** Code must follow cohesive patterns facilitating open-source contributions

**NFR22 (MAINT):** Public APIs must maintain compatibility per semantic versioning

**NFR23 (COST):** Average LLM cost per session must be <$0.10

**NFR24 (COST):** Cache hit rate must be >50% to reduce repetitive LLM calls

**NFR25 (COST):** System must allow budget and rate limiting configuration per user

**NFR26 (COST):** Cost metrics must be visible in real-time to users

**NFR27 (REL):** Extension must start without crash (0 tolerance for startup failures)

**NFR28 (REL):** System must work on Mac, Windows, Linux without degradation

**NFR29 (REL):** LLM provider fallbacks must be automatic and transparent

**NFR30 (REL):** System must gracefully handle network errors or API timeouts

**NFR31 (REL):** Error logs must include sufficient context for troubleshooting

**NFR32 (COMPAT):** System must support Node 16+ (VSCode minimum requirement)

**NFR33 (COMPAT):** System must be compatible with VSCode versions 1.75+

**NFR34 (COMPAT):** Configurations must be portable between machines (export/import)

**NFR35 (COMPAT):** System must work with yarn/pnpm for contributors

**NFR36 (USAB):** Installation from VSCode Marketplace must take <2 minutes total

**NFR37 (USAB):** Initial configuration (API keys) must have guided flow <5 minutes

**NFR38 (USAB):** Error messages must include links to documentation/troubleshooting

**NFR39 (USAB):** System must provide contextual tooltips for feature discoverability

### Additional Requirements

**Technical Requirements from Architecture:**

- **CRITICAL: Starter Template** - Use Microsoft Yeoman Generator (`yo code`) with prompts: Extension type (New Extension TypeScript), Name (suika), Bundler (esbuild - NOT webpack), Package manager (npm)
- Build tool: esbuild (latest) with dual-build configuration (extension CJS + webview IIFE)
- Build performance: Development <1s, Watch mode <200ms, Production <3s
- Runtime: Node.js 16+, TypeScript 5.3.3 (strict mode), VSCode API 1.75+
- Testing: Mocha + Chai for unit tests, @vscode/test-electron for integration tests, >70% coverage target
- Security: VSCode SecretStorage API for encrypted API key storage, no code logging without consent
- Configuration: Settings via vscode.workspace.getConfiguration(), presets for solo-dev/team/enterprise
- LLM Integration: OpenAI + Anthropic minimum, custom providers via ILLMProvider interface, automatic fallbacks
- Caching: Hybrid L1 (memory, <1ms) + L2 (file system, persistent) with >50% hit rate target
- Error Handling: Centralized ErrorHandler with retry logic, exponential backoff, structured logging
- Telemetry: Opt-in only, privacy-preserving, structured logger with VSCode Output Channel
- Webview Communication: postMessage API, Dual State Pattern (backend source of truth + frontend mirror)
- Content Security Policy (CSP) configuration required in HTML template
- Linting: ESLint + Prettier configuration with TypeScript strict rules
- Debug Configuration: .vscode/launch.json and tasks.json (pre-configured by Yeoman)
- Package Structure: VSCode Marketplace compatible with .vscodeignore
- Dependency Management: npm with package-lock.json, yarn/pnpm support for contributors
- Interface Extensions: ILLMProvider and IAgentRenderer for extensibility, semantic versioning for API compatibility
- Performance: <100ms UI response, <2s startup, 10+ sessions/day support, 60fps animations (GPU-accelerated CSS)
- Project Structure: src/agents/, src/llm/, src/state/, src/webview/, src/config/, src/commands/, src/errors/, with co-located __tests__/

**UX/UI Requirements:**

- Overlay HUD with multi-monitor support and intelligent screen detection with positioning preferences
- Vital Signs Bar maximum 24px height for non-intrusive display
- Spatial anti-collision algorithm preventing cursor and active editor obstruction
- Drag-to-reposition with persistent memory of user positioning preferences
- Progressive disclosure: 4 layers (Vital Signs always-visible → Contextual agents → On-demand details → Focus mode)
- Auto-detection of intensive typing reducing overlay opacity during active coding
- Hotkey Cmd+Shift+F for Focus/DND mode toggle
- Five configurable modes: Learning, Expert, Focus/DND, Team, Performance with intelligent defaults
- Smooth mode transitions without application restart
- Preset configurations: solo-dev-config, team-config, enterprise-config
- Hover tooltips on agent states with contextual activation explanations
- Constant 60fps animations with GPU acceleration (CSS will-change: transform)
- Async rendering never blocking main thread
- Reduced animation mode for low-end machines
- <100ms response time for all interactions
- **Respiration pulse animations** for idle/thinking states
- **Traveling brush stroke animations** visualizing agent collaboration
- **Convergence/fusion animations** (4 agents → Enso/Lotus) during intense collaboration
- **Adaptive opacity transitions** (5% idle → 40% active)
- **State machine visual transitions**: idle → thinking → active → alert → success
- Vital Signs Bar: Token count, file status, system state at 24px max height
- **Agent spatial anchoring**: Architect to imports, Developer to functions, Reviewer to problems, Context to global scope
- **Contextual agent appearance**: Agents appear based on activity (Architect during imports, Developer during functions)
- Click-to-expand suggestions with full reasoning, alternatives, approach justification
- Click-to-fix alerts with pedagogical problem explanations
- Timeline/history view with decision reasoning "learning trail"
- **Sumi-e aesthetic** (墨絵): 2-5 brush stroke design, monochrome + single accent, Ma (間) intentional negative space
- Ultra-clear iconography immediately recognizable despite minimalism
- Spatial positioning storytelling (position = meaning)
- Parallax scroll following (agents track code sections)
- Alert positioning to code problem areas with visual indicators
- Suggestion rejection feedback with explanation
- Edge case disclosure in Expert Mode
- Risk warning system for senior developers
- Cross-platform: Mac, Windows, Linux desktop/laptop optimization
- **Learning Mode annotations**: Pedagogical real-time explanations
- **Pattern naming**: Design pattern references with documentation links
- **Reasoning visibility**: Complete AI chain via click
- **Junior-specific**: Detailed explanations, foundational patterns
- **Senior-specific**: Technical trade-offs, edge cases, architecture justification
- **Team-shareable reasoning**: Formatted for code review and knowledge sharing
- **Idle/reading detection**: Increases visibility when reviewing (not typing)
- **Hotfix context detection**: Branch names + commits suggest Focus Mode
- **User override**: Hotkeys always allow manual override
- **Contextual agent activation**: Based on code section (imports, functions, declarations)

### FR Coverage Map

**Epic 1 - Project Foundation & Core Infrastructure:**
- FR49: Installation <2min via VSCode Marketplace
- FR50: Secure API key configuration (SecretStorage)
- FR51: Cross-platform Mac/Windows/Linux support
- FR52: Workspace/user settings configuration
- FR53: Configuration templates (solo-dev, team, enterprise)
- FR54: Export/import configurations
- FR58: Error logging for troubleshooting

**Epic 2 - LLM Provider Integration & Caching:**
- FR26: Multi-provider simultaneous support (OpenAI, Anthropic minimum)
- FR27: Configure provider per agent
- FR28: Custom providers via ILLMProvider interface
- FR29: Automatic fallbacks if provider unavailable
- FR30: Real-time LLM cost estimation per session
- FR31: Intelligent caching >50% hit rate
- FR32: Rate limiting and budget configuration
- FR33: On-premise/internal LLM support

**Epic 3 - AI Agent System & Orchestration:**
- FR1: Display 4 distinct AI agents with unique visual identities
- FR2: Real-time agent state visibility (idle, thinking, working, alert, success)
- FR3: Observable agent collaboration (visual communication, coordination)
- FR4: Suggestion attribution showing responsible agent
- FR5: Complete reasoning visibility (why, alternatives considered)
- FR6: Visible files/context being analyzed by agents
- FR7: Visual agent merge into collective form during intense collaboration
- FR8: Query specific agent about reasoning/decision

**Epic 4 - Transparent HUD & Visual System:**
- FR9: Transparent HUD overlay superimposed over code
- FR10: Adaptive agent positioning (rest, thinking, active, alert)
- FR11: Auto-avoid cursor and active editing area obstruction
- FR12: Vital Signs Bar (tokens, files in context, global state)
- FR13: 4 distinct alert levels (info, warning, critical, urgent) with ideograms
- FR14: 60fps smooth animations (state transitions, breathing, movements)
- FR15: Code-anchored alerts next to relevant code lines
- FR16: Animated brush strokes showing agent communication

**Epic 5 - User Modes & Customization:**
- FR17: Focus/DND Mode toggle (agents invisible, suggestions active)
- FR18: 3 transparency levels (Minimal, Medium, Full)
- FR19: Auto-adapt opacity based on user activity (coding vs idle)
- FR20: Learning Mode with detailed pedagogical explanations
- FR21: Expert Mode with in-depth technical details
- FR22: Team/Collaboration Mode with visible labels for pair programming
- FR23: Appearance customization (color palette, agent size, bar position)
- FR24: High Contrast Mode for accessibility
- FR25: Colorblind alternatives (patterns, adapted colors)

**Epic 6 - Context Intelligence & File Management:**
- FR34: Auto-load relevant project files as context
- FR35: Optimize file selection within token limits
- FR36: Visible files currently in AI's context
- FR37: Analyze existing project architecture for aligned suggestions
- FR38: Proactive edge case and risk identification (Reviewer agent)
- FR39: Real-time security validation of suggested code
- FR40: Decision and reasoning history for future reference
- FR41: Phase detection and adaptation (prototype, production, debug)

**Epic 7 - User Interactions & Commands:**
- FR42: Accept/reject suggestions with immediate visual feedback
- FR43: Hotkeys for HUD toggle, mode changes, force agent states
- FR44: Drag-and-drop alerts to TODO list
- FR45: Hover tooltips on agents with contextual details
- FR46: Click code-anchored alerts to see proposed fix
- FR47: VSCode Command Palette exposure for all functions
- FR48: Keyboard-only navigation (Tab, arrows, Enter, Space)

**Epic 8 - Analytics, Telemetry & Metrics:**
- FR55: Usage metrics (sessions, suggestions accepted/rejected, time saved)
- FR56: Adoption and comprehension tracking for tech leads (team mode)
- FR57: Opt-in diagnostic telemetry (no sensitive code data)
- FR59: Usage and learning report generation
- FR71: Track and display suggestion acceptance rate (target >60%)
- FR72: Post-session comprehension surveys (target 8/10)
- FR73: Weekly learning progress tracking (target 7/10)
- FR74: NPS (Net Promoter Score) calculation and display
- FR75: "Too distracting" detection and reporting (target 0 reports)

**Epic 9 - Extensibility & Public API:**
- FR60: Custom LLM providers via ILLMProvider interface
- FR61: Custom agent rendering via IAgentRenderer interface
- FR62: Lifecycle event subscriptions (onAgentActivated, onSuggestionAccepted)
- FR63: Typed API for programmatic configuration access
- FR64: API compatibility per semantic versioning

**Epic 10 - Documentation & Developer Support:**
- FR65: Integrated getting-started documentation within plugin
- FR66: Searchable troubleshooting knowledge base by symptoms
- FR67: Complete architecture documentation for contributors
- FR68: API documentation with code examples for extension developers
- FR69: Clear error messages with links to relevant documentation
- FR70: Detailed changelog with contributor recognition

## Epic List

### Epic 1: Project Foundation & Core Infrastructure

**Goal:** Developers have a working VSCode extension foundation with configuration management, secure API key storage, and error handling infrastructure.

**User Value:** This epic provides the foundational project setup that enables all subsequent epics. Developers can install the extension, configure their API keys securely, and have a solid error handling foundation.

**FRs Covered:** FR49, FR50, FR51, FR52, FR53, FR54, FR58

**Technical Foundation:**
- Microsoft Yeoman Generator starter template (`yo code`) with TypeScript + esbuild
- VSCode SecretStorage API for encrypted API key management
- Configuration Manager with workspace/user settings support
- Centralized Error Handler with retry logic and structured logging
- Testing framework setup (Mocha + @vscode/test-electron)
- Cross-platform compatibility (Mac, Windows, Linux)

**Implementation Notes:**
- **Story 1.1** must use Yeoman Generator (`npx --package yo --package generator-code -- yo code`) with esbuild bundler selection
- Dual-build configuration (extension Node.js + webview Browser)
- Configuration presets for solo-dev, team, and enterprise workflows
- Export/import functionality for portable configurations

---

### Epic 2: LLM Provider Integration & Caching

**Goal:** Developers can connect to multiple LLM providers (OpenAI, Anthropic) with intelligent caching that reduces costs (<$0.10/session) and improves performance (>50% cache hit rate).

**User Value:** Enables AI functionality with cost-effective, performant LLM integration. Developers can choose providers, see real-time costs, and benefit from smart caching.

**FRs Covered:** FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33

**NFRs Addressed:** NFR23 (<$0.10/session), NFR24 (>50% cache hit), NFR25 (budget config), NFR26 (real-time cost metrics)

**Technical Components:**
- ILLMProvider interface with adapter pattern
- LLMProviderManager with registry and fallbacks
- Hybrid Cache (L1 memory LRU + L2 file system persistent)
- OpenAIProvider and AnthropicProvider implementations
- Rate limiting and budget enforcement
- Real-time cost tracking and display

**Implementation Notes:**
- Cache must achieve >50% hit rate for cost optimization
- Automatic fallback to secondary providers on primary failure
- Support on-premise LLMs for enterprise compliance
- Token estimation before every LLM call

---

### Epic 3: AI Agent System & Orchestration

**Goal:** Developers see 4 distinct AI agents (Architect, Coder, Reviewer, Context) collaborating intelligently with visible states and complete reasoning transparency.

**User Value:** Core AI value proposition - developers observe how AI thinks, collaborate with specialized agents, and understand suggestion reasoning completely.

**FRs Covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8

**Technical Architecture:**
- Orchestrator Central Pattern (single orchestrator coordinates agents)
- IAgent interface with shared agent behaviors
- ArchitectAgent, CoderAgent, ReviewerAgent, ContextAgent implementations
- Dual State Pattern (backend Node.js source of truth + frontend Browser mirror)
- Agent state machine (idle → thinking → working → alert → success)
- postMessage communication between extension and webview

**Implementation Notes:**
- Agents NEVER call each other directly (only orchestrator coordinates)
- All agent states sync instantly to webview (0ms throttle)
- Reasoning visibility via click-to-expand interactions
- Visual merge/collective form during intense collaboration

---

### Epic 4: Transparent HUD & Visual System

**Goal:** Developers have a beautiful, transparent sumi-e aesthetic HUD overlay that displays agents and vital signs without obstructing code editing, maintaining 60fps animations.

**User Value:** Makes AI reasoning tangible and understandable through elegant visual interface that respects developer flow state.

**FRs Covered:** FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16

**NFRs Addressed:** NFR1 (60fps), NFR2 (<100ms response), NFR5 (GPU optimization), NFR6 (async rendering)

**UX Components:**
- Transparent webview overlay with sumi-e aesthetic (2-5 brush strokes)
- Vital Signs Bar (24px max height) showing tokens, files, state
- Spatial anti-collision algorithm (auto-avoid cursor and active editor)
- Adaptive agent positioning (anchored to code context)
- 4 alert levels (info, warning, critical, urgent) with ideograms
- GPU-accelerated animations (CSS transform: translate3d(), will-change)
- Respiration pulse, traveling brush strokes, convergence/fusion animations

**Implementation Notes:**
- 60fps constant requirement via requestAnimationFrame
- <100ms UI response time for all interactions
- Async rendering never blocks code editing
- Monochrome palette + single accent color, Ma (間) intentional negative space

---

### Epic 5: User Modes & Customization

**Goal:** Developers customize their experience with Learning, Expert, Focus, Team, and Performance modes, plus accessibility features (High Contrast, colorblind alternatives, keyboard-only navigation).

**User Value:** Personalization and accessibility - adapts to different developer needs, skill levels, and physical abilities.

**FRs Covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25

**NFRs Addressed:** NFR7 (keyboard-only), NFR8 (High Contrast 60%), NFR9 (colorblind alternatives), NFR10 (screen readers), NFR11 (configurable hotkeys)

**Modes:**
- **Learning Mode:** Detailed pedagogical explanations, pattern naming, documentation links
- **Expert Mode:** In-depth technical details, trade-offs, edge cases
- **Focus/DND Mode:** Agents invisible, suggestions active (Cmd+Shift+F hotkey)
- **Team Mode:** Visible labels for pair programming, team metrics
- **Performance Mode:** Reduced animations for low-end machines

**Customization:**
- Appearance (color palette, agent size, bar position)
- 3 transparency levels (Minimal, Medium, Full)
- Auto-adapt opacity based on typing activity detection
- High Contrast mode (60% minimum opacity)
- Colorblind alternatives (patterns, adapted colors)

**Implementation Notes:**
- Smooth mode transitions without application restart
- Intelligent defaults based on user detection
- Complete keyboard-only navigation support

---

### Epic 6: Context Intelligence & File Management

**Goal:** Developers benefit from intelligent context loading that automatically finds relevant files, optimizes token usage, and makes architecturally-aligned suggestions with proactive risk identification.

**User Value:** AI suggestions are contextually aware, architecturally aligned, and security-validated - developers trust suggestions more because context intelligence is visible.

**FRs Covered:** FR34, FR35, FR36, FR37, FR38, FR39, FR40, FR41

**Intelligence Components:**
- Auto-load relevant project files as context
- Token optimization (stay within LLM limits)
- Visible files currently in AI's context
- Project architecture analysis for pattern alignment
- Proactive edge case identification (Reviewer agent)
- Real-time security validation of suggested code
- Decision and reasoning history timeline
- Phase detection (prototype, production, debug)

**Implementation Notes:**
- Context Agent coordinates file loading
- Token estimation before context expansion
- Architecture patterns extracted from existing codebase
- Security validator runs before suggestion display

---

### Epic 7: User Interactions & Commands

**Goal:** Developers interact naturally with the system via hotkeys, drag-drop, clicks, hover, and Command Palette integration with complete keyboard-only accessibility.

**User Value:** Efficient, accessible daily interactions - developers can use the tool without leaving keyboard or disrupting flow state.

**FRs Covered:** FR42, FR43, FR44, FR45, FR46, FR47, FR48

**Interaction Patterns:**
- Accept/reject suggestions with immediate visual feedback
- Hotkeys for HUD toggle, mode changes, force agent states
- Drag-and-drop alerts to TODO list (automatic entry creation)
- Hover tooltips on agents with contextual activation explanations
- Click code-anchored alerts to see proposed fixes
- VSCode Command Palette exposure for all functions
- Complete keyboard-only navigation (Tab, arrows, Enter, Space)

**Implementation Notes:**
- Hotkeys configurable to avoid conflicts with assistive tools
- Command registration in extension.ts
- Keyboard navigation tested with screen readers

---

### Epic 8: Analytics, Telemetry & Metrics

**Goal:** Developers and tech leads track usage, learning progress, and team adoption with opt-in privacy-preserving telemetry and comprehensive metrics.

**User Value:** Measurement enables improvement - developers see their learning progress, tech leads see team adoption, and product gets feedback for iteration.

**FRs Covered:** FR55, FR56, FR57, FR59, FR71, FR72, FR73, FR74, FR75

**NFRs Addressed:** NFR13 (no code logging without consent), NFR14 (opt-in telemetry)

**Metrics:**
- Usage metrics (sessions, suggestions accepted/rejected, time saved)
- Suggestion acceptance rate tracking (target >60%)
- Post-session comprehension surveys (target 8/10)
- Weekly learning progress surveys (target 7/10)
- NPS (Net Promoter Score) calculation
- "Too distracting" detection (target 0 reports)
- Team adoption and comprehension tracking (tech lead view)

**Implementation Notes:**
- Opt-in by default (not opt-out)
- No user code data logged without explicit consent
- Privacy-preserving analytics
- Structured logger with VSCode Output Channel

---

### Epic 9: Extensibility & Public API

**Goal:** Extension developers create custom LLM providers, agent renderers, and subscribe to lifecycle events via stable, versioned public APIs.

**User Value:** Ecosystem growth - developers extend the tool for custom LLMs, private agents, or specialized workflows without forking.

**FRs Covered:** FR60, FR61, FR62, FR63, FR64

**NFRs Addressed:** NFR19 (decoupled architecture), NFR21 (contribution patterns), NFR22 (semver API compatibility)

**Public APIs:**
- ILLMProvider interface for custom LLM provider implementations
- IAgentRenderer interface for custom agent visualizations
- Lifecycle event system (onAgentActivated, onSuggestionAccepted, etc.)
- Typed configuration API for programmatic access
- Semantic versioning for backward compatibility

**Implementation Notes:**
- API documentation auto-generated (JSDoc + TypeDoc)
- Example implementations in documentation
- Deprecation policy per semver rules

---

### Epic 10: Documentation & Developer Support

**Goal:** Users, contributors, and extension developers have comprehensive, searchable documentation, troubleshooting resources, and clear error messages.

**User Value:** Self-service support - developers find answers quickly, contributors understand architecture, extension developers have API references.

**FRs Covered:** FR65, FR66, FR67, FR68, FR69, FR70

**NFRs Addressed:** NFR20 (auto-generated API docs), NFR38 (error messages with doc links), NFR39 (contextual tooltips)

**Documentation Components:**
- Integrated getting-started documentation within plugin
- Searchable troubleshooting knowledge base by symptoms
- Complete architecture documentation for contributors
- API documentation with code examples for extension developers
- Clear error messages with links to relevant documentation sections
- Detailed changelog with contributor recognition

**Implementation Notes:**
- Documentation co-located with code where appropriate
- KB indexed for symptom-based search
- Error messages include specific doc URLs
- Changelog auto-generated from commits with contributor attribution
## Epic 1: Project Foundation & Core Infrastructure

**Goal:** Developers have a working VSCode extension foundation with configuration management, secure API key storage, and error handling infrastructure.

### Story 1.1: Initialize VSCode Extension Project with Yeoman Generator

As a developer,
I want to initialize a new VSCode extension project using the Yeoman Generator with TypeScript and esbuild,
So that I have a production-ready foundation with optimal build performance.

**Acceptance Criteria:**

**Given** I have Node.js 16+ and npm installed
**When** I run `npx --package yo --package generator-code -- yo code`
**And** I select "New Extension (TypeScript)" as the extension type
**And** I select "esbuild" as the bundler (NOT webpack)
**And** I select "npm" as the package manager
**And** I provide "suika" as the extension name
**Then** A complete VSCode extension project structure is generated
**And** The project includes `src/extension.ts` entry point
**And** The project includes `package.json` with VSCode engine >=1.75.0
**And** The project includes `.vscode/launch.json` for F5 debugging
**And** The project includes esbuild configuration for bundling
**And** The project compiles successfully with `npm run compile`
**And** The extension activates in VSCode Extension Development Host

---

### Story 1.2: Configure Dual-Build System and Create Webview Scaffold

As a developer,
I want separate build configurations for the Node.js extension and Browser webview with a minimal webview scaffold,
So that each context uses optimal bundling settings and Epic 4 can start visual development immediately.

**Acceptance Criteria:**

**Given** The Yeoman-generated project structure exists
**When** I create `esbuild.config.js` with dual-build configuration
**Then** Build 1 targets `src/extension.ts` → `dist/extension.js` (CommonJS for Node.js)
**And** Build 2 targets `src/webview/main.js` → `dist/webview.js` (IIFE for Browser)
**And** Development builds complete in <1 second
**And** Watch mode (`npm run watch`) incremental builds complete in <200ms
**And** Production builds with minification complete in <3 seconds
**And** Source maps are included in development builds
**And** Source maps are excluded from production builds
**And** Both bundles are compatible with their respective runtimes
**And** Minimal webview scaffold created: `src/ui/webview-manager.ts` (basic panel creation)
**And** Basic HTML template created: `src/webview/index.html` with CSP configuration
**And** Basic entry point created: `src/webview/main.js` (placeholder for Epic 4 visual work)
**And** WebviewManager can create and show basic webview panel (no HUD features yet)
**And** Webview scaffold allows Epic 4 visual development to start in parallel

---

### Story 1.3: Implement Configuration Manager with VSCode Settings Integration

As a developer,
I want a centralized Configuration Manager that reads from VSCode workspace and user settings,
So that users can configure the extension via standard VSCode settings UI.

**Acceptance Criteria:**

**Given** The extension project structure exists
**When** I create `src/config/configuration-manager.ts`
**And** I define configuration schema in `package.json` under `contributes.configuration`
**Then** ConfigurationManager reads settings via `vscode.workspace.getConfiguration('ai101')`
**And** Settings support both workspace and user scope
**And** Configuration includes sections for: LLM providers, UI preferences, performance, telemetry
**And** Default values are provided for all settings
**And** Configuration changes trigger `onDidChangeConfiguration` event
**And** ConfigurationManager validates setting values before use
**And** Invalid configurations throw `ConfigurationError` with helpful messages
**And** Unit tests cover configuration loading and validation (>70% coverage)

---

### Story 1.4: Implement Secure API Key Storage with VSCode SecretStorage

As a developer,
I want API keys stored securely using VSCode SecretStorage API,
So that sensitive credentials are encrypted at rest and never logged.

**Acceptance Criteria:**

**Given** The extension is activated with `ExtensionContext`
**When** I create `src/config/secret-manager.ts`
**And** I implement methods: `storeApiKey()`, `getApiKey()`, `deleteApiKey()`
**Then** API keys are stored via `context.secrets.store('suika.{provider}.apiKey', key)`
**And** API keys are retrieved via `context.secrets.get('suika.{provider}.apiKey')`
**And** SecretStorage encryption is handled by VSCode platform automatically
**And** API keys are NEVER logged to console or files
**And** API keys are NEVER stored in `settings.json` or environment variables
**And** SecretManager supports multiple providers (openai, anthropic, custom)
**And** Missing API keys throw descriptive errors prompting user to configure
**And** Unit tests use mock SecretStorage implementation

---

### Story 1.5: Create Configuration Preset System for Solo/Team/Enterprise

As a developer,
I want predefined configuration presets for different use cases,
So that users can quickly set up optimal defaults for their workflow.

**Acceptance Criteria:**

**Given** ConfigurationManager is implemented
**When** I create `src/config/presets.ts` with preset definitions
**Then** "Solo Developer" preset optimizes for: Learning Mode, single user, detailed explanations
**And** "Team" preset optimizes for: visible labels, team metrics, pair programming
**And** "Enterprise" preset optimizes for: on-premise LLMs, strict security, compliance logging
**And** Users can select preset via Command Palette: "Suika: Apply Configuration Preset"
**And** Preset application updates VSCode settings with template values
**And** Users can customize preset values after application
**And** Preset selection is tracked in telemetry (opt-in)

---

### Story 1.6: Implement Export/Import Configuration Functionality

As a developer,
I want users to export and import their configurations,
So that settings are portable between machines and team members can share configurations.

**Acceptance Criteria:**

**Given** ConfigurationManager is implemented
**When** User invokes "Suika: Export Configuration" command
**Then** All non-secret settings are serialized to JSON file
**And** User selects save location via VSCode file picker
**And** Exported file excludes API keys and secrets
**And** Exported file includes version number for compatibility checking
**When** User invokes "Suika: Import Configuration" command
**Then** User selects configuration JSON file via file picker
**And** Settings are validated before application
**And** Incompatible versions show warning with migration options
**And** User confirms before overwriting existing settings
**And** Import completion shows summary of applied settings

---

### Story 1.7: Implement Centralized Error Handler with Retry Logic

As a developer,
I want a centralized error handler with retry logic and structured logging,
So that transient failures are handled gracefully and errors include debugging context.

**Acceptance Criteria:**

**Given** The extension structure exists
**When** I create `src/errors/error-handler.ts` and custom error classes
**Then** Base class `AI101Error` extends Error with `code` and `context` properties
**And** Specialized classes exist: `ConfigurationError`, `LLMProviderError`, `NetworkError`, `CacheError`
**And** ErrorHandler implements retry logic with exponential backoff (3 retries max)
**And** Retryable errors are classified: RATE_LIMIT, TIMEOUT, NETWORK_ERROR
**And** Non-retryable errors fail immediately: AUTHENTICATION_ERROR, VALIDATION_ERROR
**And** All errors are logged with structured context (timestamp, error code, stack trace)
**And** Errors display user-friendly messages with troubleshooting links
**And** VSCode notifications show errors with appropriate severity (info/warning/error)
**And** Unit tests cover retry scenarios and error classification

---

### Story 1.8: Set Up Testing Framework with Mocha and @vscode/test-electron

As a developer,
I want unit and integration test infrastructure configured,
So that all code meets >70% coverage requirement and tests run in CI/CD.

**Acceptance Criteria:**

**Given** The Yeoman-generated project includes test infrastructure
**When** I configure test framework in `src/test/suite/`
**Then** Unit tests use Mocha + assert for pure logic testing
**And** Integration tests use @vscode/test-electron for VSCode API testing
**And** Tests are co-located in `__tests__/` subdirectories next to source code
**And** Test command `npm test` runs all unit and integration tests
**And** Test coverage report is generated showing line/branch/function coverage
**And** CI/CD pipeline fails if coverage drops below 70%
**And** Test fixtures and mocks are available for common scenarios
**And** Example tests demonstrate testing patterns for future stories
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

### Story 3.7: Implement Backend State Manager (ExtensionStateManager)

As a developer,
I want a backend state manager that maintains agent states as source of truth,
So that agent state changes are tracked reliably and can be synchronized to the UI.

**Acceptance Criteria:**

**Given** All agents (Architect, Coder, Reviewer, Context) are implemented
**When** I create `src/state/extension-state-manager.ts` (backend Node.js)
**Then** ExtensionStateManager class maintains Map<AgentType, IAgentState>
**And** `updateAgentState(agent, status, task)` updates backend state immutably
**And** Backend state is the ONLY source of truth (Dual State Pattern from architecture)
**And** State manager provides `getAgentState(agent)` for read access
**And** State manager provides `getAllAgentStates()` for full state snapshot
**And** IAgentState interface includes: status, currentTask, lastUpdate timestamp
**And** State updates are atomic and thread-safe (no race conditions)
**And** Unit tests verify state updates, immutability, and concurrent access

---

### Story 3.8: Implement postMessage State Synchronization to Webview

As a developer,
I want backend state changes synchronized to the webview frontend instantly,
So that UI displays real-time agent states with <100ms latency (NFR2).

**Acceptance Criteria:**

**Given** ExtensionStateManager is implemented (Story 3.7)
**And** Webview scaffold exists from Epic 1 Story 1.2
**When** I enhance ExtensionStateManager with webview synchronization
**Then** State updates are synced to webview via `postMessage` instantly (0ms throttle)
**And** postMessage payload structure: `{type: 'toWebview:agentStateUpdate', agent, status, currentTask, lastUpdate}`
**And** Synchronization happens on every state update (no batching for real-time requirement)
**And** Frontend receives state updates and stores in mirror state (handled by webview code)
**And** postMessage communication is bidirectional (webview can request full state sync)
**And** State sync latency measured and logged (must be <100ms per NFR2)
**And** Unit tests verify postMessage synchronization with mock webview

---

### Story 3.9: Verify Multi-Agent State Synchronization

As a developer,
I want to verify that all 4 agents' states synchronize correctly to the webview,
So that the UI accurately reflects backend agent activity in real-time.

**Acceptance Criteria:**

**Given** Backend ExtensionStateManager is implemented (Story 3.7)
**And** postMessage synchronization is implemented (Story 3.8)
**When** I create integration tests for multi-agent state sync
**Then** Integration tests verify Architect agent state updates sync to webview
**And** Integration tests verify Coder agent state updates sync to webview
**And** Integration tests verify Reviewer agent state updates sync to webview
**And** Integration tests verify Context agent state updates sync to webview
**And** Concurrent state updates (multiple agents changing simultaneously) handled correctly
**And** State sync works across all agent status transitions: idle → thinking → working → alert → success
**And** Frontend state mirrors backend state exactly (snapshot comparison)
**And** Latency metrics confirm <100ms sync time for all 4 agents
**And** Integration tests use @vscode/test-electron with real webview

---

### Story 3.10: Implement Agent Lifecycle Events for Extensibility

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
## Epic 4: Transparent HUD & Visual System

**Goal:** Developers have a beautiful, transparent sumi-e aesthetic HUD overlay that displays agents and vital signs without obstructing code editing, maintaining 60fps animations.

### Story 4.1: Enhance Webview with Transparency and HUD Positioning

As a developer,
I want the webview scaffold enhanced with transparency, overlay positioning, and HUD-specific features,
So that the HUD displays over code without blocking editor interactions.

**Acceptance Criteria:**

**Given** Webview scaffold exists from Epic 1 Story 1.2
**When** I enhance `src/ui/webview-manager.ts` and `src/webview/main.js`
**Then** WebviewManager configures `retainContextWhenHidden: true` to preserve state
**And** Webview panel has transparent background via CSS: `background: transparent`
**And** Webview overlays editor via `vscode.ViewColumn.Beside` positioning
**And** Webview receives state updates via `postMessage` from extension (HUD state protocol)
**And** Clicking through webview to code works (pointer-events: none on transparent areas)
**And** Webview HTML includes HUD container structure for agents and vital signs bar
**And** Webview CSS includes base transparency styles (adaptive opacity 5%-40%)
**And** postMessage API established for HUD state synchronization (agents, alerts, metrics)
**And** Unit tests verify transparency, overlay positioning, and HUD message passing

---

### Story 4.2: Implement Sumi-e Aesthetic Visual Language

As a developer,
I want the HUD to use minimalist Japanese sumi-e brush aesthetics,
So that the interface is beautiful, calming, and philosophically aligned with transparency.

**Acceptance Criteria:**

**Given** Webview overlay is implemented
**When** I create `src/webview/styles/sumi-e.css` and SVG brush assets
**Then** Visual design uses 2-5 brush strokes maximum per element (FR10)
**And** Color palette is monochrome (black/gray/white) + single accent color
**And** Ma (間) intentional negative space is prominent in layout
**And** Agent icons are rendered as simple brush stroke ideograms
**And** SVG brush textures have organic, hand-drawn imperfection
**And** Typography uses elegant sans-serif optimized for readability
**And** No gradients, shadows, or visual clutter (strict minimalism)
**And** Design system documented with visual guidelines
**And** High Contrast mode maintains aesthetic while meeting NFR8 (60% opacity)
**And** Colorblind alternatives use stroke patterns instead of colors (NFR9)

---

### Story 4.3: Implement Vital Signs Bar with Real-Time Metrics

As a developer,
I want a compact status bar showing tokens, files, cost, and agent state,
So that I understand the AI's current status at a glance without distraction.

**Acceptance Criteria:**

**Given** Webview overlay and sumi-e aesthetics are implemented
**When** I create `src/webview/components/vital-signs-bar.js`
**Then** Vital Signs Bar is positioned at top or bottom (user configurable)
**And** Bar height is maximum 24px (strict height limit - FR14)
**And** Bar displays: token count, loaded files count, session cost, primary agent state
**And** Token count updates in real-time as context changes
**And** Files count shows number of files in current context (click to expand list)
**And** Cost displays formatted currency: "$0.05" with 2 decimal precision
**And** Agent state shows icon + status text ("Coder: Working...")
**And** Bar has subtle transparency (matches overall HUD transparency)
**And** Bar auto-hides after 3s of inactivity (configurable, linked to Focus Mode)
**And** Hover on any metric shows detailed tooltip with breakdown
**And** Unit tests verify metric display formatting and updates

---

### Story 4.4: Implement Spatial Anti-Collision Algorithm

As a developer,
I want the HUD to automatically move away from my cursor and active editing areas,
So that AI visualizations never obstruct my code writing flow.

**Acceptance Criteria:**

**Given** Webview overlay with Vital Signs Bar is implemented
**When** I create `src/webview/positioning/anti-collision.js`
**Then** Anti-collision algorithm tracks cursor position via VSCode selection API
**And** Algorithm defines exclusion zones: cursor ±50px, active line ±2 lines
**And** Agent HUD elements reposition automatically when entering exclusion zone
**And** Repositioning animation uses smooth easing (300ms duration)
**And** Algorithm prevents HUD from covering: minimap, scrollbars, gutter
**And** If no safe position exists, HUD becomes semi-transparent (20% opacity)
**And** Typing activity triggers immediate collision check (no delay)
**And** Performance: collision detection completes in <5ms per check
**And** User can disable anti-collision via settings (anchor to fixed position)
**And** Unit tests verify collision detection and safe position calculation

---

### Story 4.5: Implement Adaptive Agent Positioning System

As a developer,
I want agents to position near relevant code context automatically,
So that I see which code the AI is analyzing or modifying.

**Acceptance Criteria:**

**Given** Spatial anti-collision is implemented
**When** I create `src/webview/positioning/agent-positioner.js`
**Then** Agent positioning is anchored to code locations (line numbers)
**And** ContextAgent appears near imports/dependencies when loading files
**And** ArchitectAgent appears near class/function definitions during analysis
**And** CoderAgent appears at cursor position during suggestion generation
**And** ReviewerAgent appears near generated code during validation
**And** Agents move smoothly to new positions (500ms transition)
**And** Multiple agents avoid overlapping via automatic spacing algorithm
**And** Position anchors persist during scroll (agents scroll with code)
**And** If code context out of viewport, agents dock to screen edge with indicator
**And** User can manually drag agents to preferred positions (position lock mode)
**And** Unit tests verify positioning logic for different scenarios

---

### Story 4.6: Implement 4-Level Alert System with Code Anchoring

As a developer,
I want proactive alerts (info, warning, critical, urgent) anchored to code lines,
So that I see risks and recommendations in context with visual severity indicators.

**Acceptance Criteria:**

**Given** Agent positioning system is implemented
**When** I create `src/webview/components/alert.js`
**Then** Alert component supports 4 severity levels: info, warning, critical, urgent
**And** Each level has distinct visual style (color, icon, animation intensity)
**And** Alerts are anchored to specific line numbers in code editor
**And** Alert appears as small ideogram icon in editor margin (gutter decoration)
**And** Clicking alert expands full explanation with proposed fixes
**And** Critical/urgent alerts include pulsing animation to draw attention (NFR1 - 60fps)
**And** Alert content includes: message, reasoning, code snippet, fix suggestions
**And** Alerts can be dismissed (fade out animation) or dragged to TODO list (FR44)
**And** Multiple alerts on same line stack vertically without overlap
**And** Alerts persist across sessions (stored in workspace state)
**And** Unit tests verify alert rendering and interaction handling

---

### Story 4.7: Implement GPU-Accelerated Animations for 60fps Performance

As a developer,
I want all HUD animations to maintain 60fps without affecting code editor performance,
So that the visual experience is fluid and never impacts my development workflow.

**Acceptance Criteria:**

**Given** All visual components are implemented
**When** I optimize animations in `src/webview/styles/animations.css`
**Then** All animations use GPU-accelerated properties (transform: translate3d(), opacity)
**And** No animations use CPU-expensive properties (left, top, width, height, box-shadow)
**And** Elements with animations have `will-change` CSS property declared
**And** Animations use requestAnimationFrame for frame synchronization
**And** Frame timing monitored via Performance API, warning logged if <60fps
**And** Respiration pulse animation (agent idle state) runs at 60fps constant
**And** Traveling brush stroke animation (agent thinking) runs at 60fps constant
**And** Convergence/fusion animation (multi-agent collaboration) runs at 60fps constant
**And** Performance Mode (FR24) reduces animation complexity for low-end machines
**And** Animations pause when webview not visible (performance optimization)
**And** Performance tests verify 60fps maintained on reference hardware (NFR1)

---

### Story 4.8: Implement Async Rendering Pipeline with Non-Blocking Updates

As a developer,
I want the HUD rendering to be completely asynchronous,
So that visual updates never block code editing or typing responsiveness.

**Acceptance Criteria:**

**Given** GPU-accelerated animations are implemented
**When** I create `src/webview/rendering/async-renderer.js`
**Then** Renderer uses Web Workers for heavy computation (collision detection, layout)
**And** Main thread only handles DOM updates and user input events
**And** State updates batched and debounced (max 60 updates/second for 60fps)
**And** Typing latency unaffected by HUD rendering (<100ms guaranteed - NFR2)
**And** Large context updates (many files) processed incrementally in chunks
**And** Progress indicator shown during async rendering operations
**And** Rendering priority queue: user interactions > agent states > metrics
**And** Web Worker fallback to main thread if unavailable (graceful degradation)
**And** Performance monitoring logs render times to detect regression
**And** Unit tests verify async rendering behavior and batching logic

---

## Epic 5: User Modes & Customization

**Goal:** Developers customize their experience with Learning, Expert, Focus, Team, and Performance modes, plus accessibility features (High Contrast, colorblind alternatives, keyboard-only navigation).

### Story 5.1: Implement Mode System Infrastructure

As a developer,
I want a mode management system that applies mode-specific behaviors consistently,
So that users can switch between Learning, Expert, Focus, Team, and Performance modes seamlessly.

**Acceptance Criteria:**

**Given** The extension foundation is implemented
**When** I create `src/modes/mode-manager.ts`
**Then** ModeManager class maintains current active mode state
**And** Mode enum defines: 'learning', 'expert', 'focus', 'team', 'performance'
**And** Each mode has associated configuration: ILearningModeConfig, IExpertModeConfig, etc.
**And** `setMode(mode)` applies mode-specific settings across all systems
**And** Mode changes trigger event: `onModeChanged(previousMode, newMode)`
**And** Mode setting persists to workspace configuration
**And** Mode changes apply instantly without extension reload (smooth transition)
**And** Mode stack supports temporary mode activation (e.g., focus mode for 1 hour)
**And** Default mode is 'learning' for new users, remembers last mode for returning users
**And** Unit tests verify mode switching and configuration application

---

### Story 5.2: Implement Learning Mode with Pedagogical Explanations

As a developer,
I want Learning Mode to provide detailed explanations, pattern names, and documentation links,
So that I understand not just what the AI suggests, but why and how it works.

**Acceptance Criteria:**

**Given** Mode system infrastructure is implemented
**When** Learning Mode is active
**Then** All agent responses include pedagogical explanations section
**And** Code suggestions annotated with pattern names (e.g., "Singleton Pattern", "Factory")
**And** Explanations include: what the code does, why this approach, alternatives considered
**And** Inline documentation links to relevant resources (MDN, official docs, tutorials)
**And** Reasoning steps shown in expanded form (not collapsed by default)
**And** Alerts include "Learn More" buttons linking to educational content
**And** Vocabulary assistance: technical terms have hover tooltips with definitions
**And** Learning progress tracked: new concepts introduced, patterns learned
**And** Agent animations slower and more deliberate to aid comprehension
**And** Unit tests verify Learning Mode behavior changes

---

### Story 5.3: Implement Expert Mode with In-Depth Technical Details

As a developer,
I want Expert Mode to show advanced trade-offs, edge cases, and technical depth,
So that I make informed decisions on complex architectural choices.

**Acceptance Criteria:**

**Given** Mode system infrastructure is implemented
**When** Expert Mode is active
**Then** Agent responses include in-depth technical trade-off analysis
**And** Suggestions show performance implications (time/space complexity)
**And** Edge cases explicitly listed with handling recommendations
**And** Security considerations highlighted proactively (OWASP, CVEs)
**And** Alternatives section expanded with detailed pros/cons comparison
**And** API version compatibility warnings shown when relevant
**And** Technical debt indicators visible for quick-fix suggestions
**And** Reasoning presented in condensed form (experts want signal, not noise)
**And** Advanced metrics visible: token efficiency, cache hit rate, model selection rationale
**And** Unit tests verify Expert Mode behavior changes

---

### Story 5.4: Implement Focus/DND Mode with Hidden Agents

As a developer,
I want Focus Mode to hide agent visualizations while keeping suggestions active,
So that I can concentrate deeply without visual distraction when needed.

**Acceptance Criteria:**

**Given** Mode system infrastructure is implemented
**When** I activate Focus Mode (Cmd+Shift+F hotkey on Mac, Ctrl+Shift+F on Windows/Linux)
**Then** All agent visualizations fade out and hide (500ms transition)
**And** Vital Signs Bar auto-hides completely (user can pin to keep visible)
**And** Agents still run in background (suggestions remain active)
**And** Notifications for critical alerts shown via unobtrusive toast (bottom-right)
**And** Hotkey Cmd+Shift+F toggles Focus Mode on/off
**And** Focus Mode visual state indicator in status bar (small icon)
**And** Timer option: activate Focus Mode for N minutes then auto-return to previous mode
**And** Typing activity detection: Focus Mode auto-activates after 30s continuous typing (optional)
**And** Exiting Focus Mode restores previous agent positions and visibility state
**And** Unit tests verify Focus Mode activation, deactivation, and auto-hide behavior

---

### Story 5.5: Implement Team Mode with Visible Labels and Metrics

As a developer,
I want Team Mode to show visible labels for pair programming and team metrics,
So that my pairing partner or team members understand what the AI is doing.

**Acceptance Criteria:**

**Given** Mode system infrastructure is implemented
**When** Team Mode is active
**Then** All agents display visible text labels (not just icons)
**And** Labels show agent names: "Architect", "Coder", "Reviewer", "Context"
**And** Agent states include descriptive text: "Analyzing project structure..."
**And** Vital Signs Bar shows expanded metrics (tokens, files, cost, time)
**And** Suggestion acceptance/rejection actions logged for team visibility
**And** Team comprehension survey appears after collaborative sessions (opt-in)
**And** Metrics include: suggestions accepted by role, time saved per developer
**And** Large text mode option for screen sharing visibility (125% scale)
**And** Collaborative annotations: team members can comment on suggestions
**And** Unit tests verify Team Mode label visibility and metrics tracking

---

### Story 5.6: Implement Performance Mode for Low-End Machines

As a developer,
I want Performance Mode to reduce visual complexity on low-end hardware,
So that the extension remains usable on older machines or in resource-constrained environments.

**Acceptance Criteria:**

**Given** Mode system infrastructure is implemented
**When** Performance Mode is active
**Then** All animations reduced to minimal essential movements only
**And** Respiration pulse animation disabled (static agent icons)
**And** Traveling brush strokes replaced with simple progress spinner
**And** Convergence/fusion animation simplified to fade transition
**And** GPU acceleration disabled if causing performance issues (fallback to simple CSS)
**And** Anti-collision checks throttled to every 500ms (instead of real-time)
**And** Web Worker usage reduced (more computation on main thread for compatibility)
**And** Vital Signs Bar updates throttled to 1 update/second (instead of real-time)
**And** Agent positioning simplified (fewer position updates)
**And** Performance Mode auto-activates on machines with <4GB RAM (user can override)
**And** Unit tests verify Performance Mode behavior and reduced resource usage

---

### Story 5.7: Implement High Contrast Mode for Accessibility

As a developer with visual impairments,
I want High Contrast Mode that maintains 60% minimum opacity and strong colors,
So that I can clearly see the HUD elements without straining.

**Acceptance Criteria:**

**Given** Visual system is implemented (Epic 4)
**When** High Contrast Mode is enabled (via VSCode accessibility settings integration)
**Then** All HUD elements use minimum 60% opacity (NFR8 requirement)
**And** Sumi-e aesthetic maintained with stronger, bolder brush strokes
**And** Color contrast ratios meet WCAG AAA standards (7:1 minimum)
**And** Accent color adjusted to high-contrast alternative
**And** Text readability enhanced: larger font sizes, stronger weights
**And** Agent state indicators use both color AND shape (redundant coding)
**And** Alert severity visible without color dependence (icons, borders, patterns)
**And** High Contrast Mode activates automatically when VSCode High Contrast theme detected
**And** User can manually toggle High Contrast Mode independent of VSCode theme
**And** Unit tests verify contrast ratios and opacity values

---

### Story 5.8: Implement Colorblind Accessibility Alternatives

As a colorblind developer,
I want alternative visual encodings using patterns and shapes,
So that I can distinguish alert levels and agent states without relying on color.

**Acceptance Criteria:**

**Given** Alert system and agent visualizations are implemented
**When** Colorblind mode is enabled
**Then** Alert severity levels use distinct stroke patterns (solid, dashed, dotted, double)
**And** Agent states use distinct shape variations (circle, square, triangle, diamond)
**And** Icon ideograms include texture patterns in addition to color
**And** Vital Signs Bar metrics use pattern fills instead of color coding
**And** Color palette adjusted to colorblind-safe alternatives (tested with simulators)
**And** Supports deuteranopia, protanopia, and tritanopia color blindness types
**And** User selects colorblind type in settings for optimized palette
**And** Colorblind mode combines with High Contrast mode gracefully
**And** Documentation includes colorblind-safe screenshots and descriptions
**And** Unit tests verify pattern rendering and alternative visual encodings

---

### Story 5.9: Implement Complete Keyboard-Only Navigation

As a developer who relies on keyboard navigation,
I want full HUD control without requiring a mouse,
So that I can use the extension with assistive technologies and personal preference.

**Acceptance Criteria:**

**Given** All UI components are implemented
**When** I navigate using keyboard only
**Then** Tab key cycles through all interactive HUD elements in logical order
**And** Arrow keys navigate between agents and alerts (spatial navigation)
**And** Enter/Space keys activate selected element (expand, accept, dismiss)
**And** Escape key closes expanded content or dismisses alerts
**And** Keyboard shortcuts configurable to avoid conflicts with assistive tools (NFR11)
**And** Focus indicators clearly visible on all keyboard-accessible elements
**And** Screen reader announcements for agent state changes (NFR10 - ARIA live regions)
**And** Keyboard navigation documented in integrated help system
**And** Navigation order makes logical sense (top-to-bottom, left-to-right)
**And** Keyboard shortcuts listed in VSCode Keyboard Shortcuts UI
**And** Unit tests verify keyboard navigation and screen reader compatibility

---

### Story 5.10: Implement Appearance Customization Settings

As a developer,
I want to customize HUD appearance (color palette, transparency, size, position),
So that the interface matches my personal preferences and workflow.

**Acceptance Criteria:**

**Given** Visual system and mode system are implemented
**When** User opens customization settings (Command: "Suika: Customize Appearance")
**Then** Settings UI allows color palette selection (8 predefined palettes + custom)
**And** Transparency level slider with 3 presets: Minimal (80%), Medium (50%), Full (20%)
**And** Agent size slider: Small (16px), Medium (24px), Large (32px)
**And** Vital Signs Bar position: Top, Bottom, Hidden
**And** Auto-adapt opacity toggle (reduces opacity during active typing)
**And** Animation speed slider: Slow, Normal, Fast, Disabled
**And** Accent color picker for single accent color in monochrome palette
**And** Preview shows live changes before applying
**And** Settings export/import works with appearance customizations (Story 1.6)
**And** Unit tests verify customization application and persistence
## Epic 6: Context Intelligence & File Management

**Goal:** Developers benefit from intelligent context loading that automatically finds relevant files, optimizes token usage, and makes architecturally-aligned suggestions with proactive risk identification.

### Story 6.1: Implement Intelligent File Discovery and Context Loading

As a developer,
I want the Context Agent to automatically load relevant project files based on my current work,
So that AI suggestions have appropriate context without manual file selection.

**Acceptance Criteria:**

**Given** Context Agent is implemented (Story 3.3)
**When** I trigger AI suggestion generation
**Then** Context Agent analyzes current file for import statements
**And** Related files loaded automatically: imported modules, dependency files
**And** Recent files visited in current session included in context
**And** Files with similar names or paths considered relevant and loaded
**And** Context loading prioritizes: current file > imports > recent > related
**And** File discovery uses VSCode workspace file search API
**And** Discovery algorithm completes in <500ms for typical projects
**And** User can manually add/remove files from context via command
**And** Context loading status visible in Vital Signs Bar ("Loading 5 files...")
**And** Unit tests verify file discovery heuristics and loading behavior

---

### Story 6.2: Implement Token Budget Management and Optimization

As a developer,
I want context loading to respect LLM token limits intelligently,
So that suggestions work reliably without exceeding provider limits.

**Acceptance Criteria:**

**Given** Context Agent loads relevant files
**When** Total token count approaches LLM model limit
**Then** Context Agent estimates tokens using provider-specific estimation (tiktoken for OpenAI)
**And** Token budget reserved: 40% for context, 40% for completion, 20% buffer
**And** If context exceeds budget, files prioritized by relevance (current > imports > recent)
**And** Large files truncated intelligently (function signatures kept, implementations summarized)
**And** Token optimization strategies: remove comments, collapse whitespace, extract key definitions
**And** User notified if context truncated: "Context optimized: 8 files loaded, 2 summarized"
**And** Token budget configurable per provider and model in settings
**And** Current token usage displayed in Vital Signs Bar: "2.5K / 8K tokens"
**And** Architect recommendations prioritized over raw code when budget limited
**And** Unit tests verify token estimation accuracy and optimization strategies

---

### Story 6.3: Implement Visible Context File Tracking and Display

As a developer,
I want to see exactly which files are in the AI's current context,
So that I understand the basis for suggestions and can adjust context if needed.

**Acceptance Criteria:**

**Given** Context Agent loads files with token optimization
**When** I click on "Files" count in Vital Signs Bar
**Then** Context panel expands showing list of all loaded files
**And** Each file entry shows: filename, relative path, token count, status (full/summarized)
**And** Files sorted by relevance score (same as loading priority)
**And** File entries have actions: Remove from context, View full content, Refresh
**And** Panel shows total token count and percentage of budget used
**And** Visual indicator distinguishes: current file (bold), imports (icon), recent (timestamp)
**And** Click file name in context panel opens file in editor
**And** Context panel updates in real-time as files added/removed
**And** Context snapshot saved with each suggestion for reproducibility
**And** Unit tests verify context display and file action handling

---

### Story 6.4: Implement Project Architecture Pattern Detection

As a developer,
I want the Architect Agent to analyze my project and identify architectural patterns,
So that AI suggestions align with existing codebase conventions.

**Acceptance Criteria:**

**Given** Architect Agent is implemented (Story 3.4)
**When** Architect analyzes project for first time (or on command)
**Then** Architect detects component structure patterns (React, Vue, Angular conventions)
**And** Architect identifies state management approach (Redux, MobX, Context API, etc.)
**And** Architect recognizes API conventions (REST, GraphQL, tRPC)
**And** Architect detects testing framework and patterns (Jest, Mocha, test structure)
**And** Architect identifies build tools and configuration (webpack, vite, esbuild)
**And** Architect recognizes code style conventions (naming, file organization, module patterns)
**And** Architecture analysis results cached for current workspace session
**And** Architecture summary accessible via command: "Suika: View Detected Architecture"
**And** User can override detected patterns via settings if detection incorrect
**And** Architecture analysis completes in <5 seconds for typical projects
**And** Unit tests verify pattern detection accuracy with sample projects

---

### Story 6.5: Implement Architecture-Aligned Suggestion Generation

As a developer,
I want code suggestions that follow my project's architectural patterns automatically,
So that AI-generated code integrates seamlessly without refactoring.

**Acceptance Criteria:**

**Given** Architect Agent has detected project architecture patterns
**When** Coder Agent generates code suggestions
**Then** Suggestions follow detected component structure conventions
**And** Suggestions use detected state management approach consistently
**And** Suggestions match API calling patterns found in existing code
**And** Suggestions follow detected naming conventions (camelCase, snake_case, etc.)
**And** Suggestions use same import/export style as existing code
**And** Suggestions respect detected file organization (co-located tests, separate dirs, etc.)
**And** Architectural alignment explained in suggestion reasoning
**And** If pattern unclear, Coder Agent asks Orchestrator to clarify via Architect
**And** Alignment confidence score shown: "Architecture match: 95%"
**And** User can request alternative approaches: "Show solution using different pattern"
**And** Unit tests verify suggestion alignment with various architectural patterns

---

### Story 6.6: Implement Proactive Edge Case Identification

As a developer,
I want the Reviewer Agent to identify edge cases before I encounter them,
So that I write more robust code and avoid production bugs.

**Acceptance Criteria:**

**Given** Reviewer Agent is implemented (Story 3.6)
**When** Reviewer validates code suggestion
**Then** Reviewer checks for null/undefined handling in all variable accesses
**And** Reviewer identifies missing error handling for async operations
**And** Reviewer detects boundary conditions (empty arrays, zero values, max limits)
**And** Reviewer finds unchecked user input validation gaps
**And** Reviewer spots race conditions in concurrent operations
**And** Reviewer identifies missing loading/error states in UI components
**And** Reviewer checks for internationalization issues (hardcoded strings)
**And** Edge cases presented as warning-level alerts anchored to relevant code lines
**And** Each edge case includes: description, example scenario, recommended fix
**And** User can accept "Add edge case handling" to auto-generate defensive code
**And** Unit tests verify edge case detection across various code patterns

---

### Story 6.7: Implement Real-Time Security Validation

As a developer,
I want code suggestions validated for security vulnerabilities automatically,
So that I don't inadvertently introduce exploitable code.

**Acceptance Criteria:**

**Given** Reviewer Agent is implemented
**When** Reviewer validates code suggestion
**Then** Reviewer scans for SQL injection vulnerabilities (unsanitized queries)
**And** Reviewer detects XSS risks (unescaped user input in HTML/DOM)
**And** Reviewer identifies command injection risks (shell execution with user input)
**And** Reviewer finds hardcoded secrets (API keys, passwords, tokens in code)
**And** Reviewer checks for insecure cryptography (weak algorithms, hardcoded keys)
**And** Reviewer detects CSRF vulnerabilities (missing token validation)
**And** Reviewer identifies authentication/authorization bypasses
**And** Security issues presented as critical or urgent alerts (highest severity)
**And** Each security alert includes: vulnerability type, exploit scenario, secure alternative
**And** Security validation uses OWASP Top 10 as baseline reference
**And** Unit tests verify security vulnerability detection with vulnerable code samples

---

### Story 6.8: Implement Decision and Reasoning History Timeline

As a developer,
I want to review past AI decisions and reasoning in a timeline view,
So that I understand how suggestions evolved and learn from the decision process.

**Acceptance Criteria:**

**Given** Multiple agent interactions have occurred
**When** I open the History Timeline (Command: "Suika: Show Decision History")
**Then** Timeline displays chronological list of all AI interactions in current session
**And** Each entry shows: timestamp, agent(s) involved, action taken, user decision (accept/reject)
**And** Click entry expands full reasoning and alternatives considered
**And** Timeline includes context snapshot: files loaded, token count, mode active
**And** Timeline searchable by keywords, agent type, date range
**And** Timeline filterable: accepted suggestions only, rejected only, by agent
**And** Timeline exportable to markdown file for documentation/review
**And** Timeline persists across sessions (stored in workspace state)
**And** Timeline entries linked to code changes (jump to affected lines)
**And** Privacy option: clear history on session end or keep for learning
**And** Unit tests verify timeline data capture and query functionality

---

### Story 6.9: Implement Development Phase Detection

As a developer,
I want the system to detect development phase (prototype, production, debug),
So that AI suggestions adapt to current workflow needs automatically.

**Acceptance Criteria:**

**Given** Context intelligence is implemented
**When** System analyzes current development activity
**Then** Prototype phase detected by: rapid file creation, loose typing, TODO comments
**And** Production phase detected by: comprehensive tests, strict types, documentation
**And** Debug phase detected by: console.log statements, debugging tools active, error investigation
**And** Refactoring phase detected by: large-scale renames, structure changes, test rewrites
**And** Suggestion behavior adapts to phase: prototype = speed, production = rigor, debug = diagnostics
**And** Learning Mode explanations tailored to detected phase
**And** Phase detection influences Architect recommendations (prototype = flexibility, production = maintainability)
**And** Current phase shown in context panel with confidence percentage
**And** User can manually override phase detection via command
**And** Unit tests verify phase detection heuristics and suggestion adaptation

---

## Epic 7: User Interactions & Commands

**Goal:** Developers interact naturally with the system via hotkeys, drag-drop, clicks, hover, and Command Palette integration with complete keyboard-only accessibility.

### Story 7.1: Implement Suggestion Accept/Reject with Visual Feedback

As a developer,
I want to accept or reject AI suggestions with immediate visual feedback,
So that my decision is clear and the action feels responsive.

**Acceptance Criteria:**

**Given** Coder Agent has generated a code suggestion
**When** Suggestion is displayed in editor
**Then** Suggestion presented as inline diff or separate panel (user configurable)
**And** Accept button (✓) and Reject button (✗) clearly visible
**And** Hotkeys: Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux) to accept
**And** Hotkeys: Cmd+Backspace (Mac) / Ctrl+Backspace (Windows/Linux) to reject
**And** Accept action applies code changes immediately with undo support
**And** Accept triggers visual confirmation: green checkmark animation (300ms)
**And** Reject triggers visual confirmation: red X fade out (300ms)
**And** Action logged to decision history timeline with reasoning snapshot
**And** Acceptance/rejection counts tracked for metrics (suggestion acceptance rate)
**And** Partial accept option: select lines to apply, reject rest
**And** Unit tests verify accept/reject actions and visual feedback rendering

---

### Story 7.2: Implement Global Hotkey Configuration System

As a developer,
I want to configure hotkeys for common actions without conflicts,
So that I can integrate the extension into my existing keyboard workflow.

**Acceptance Criteria:**

**Given** Extension is activated
**When** I open hotkey configuration (Command: "Suika: Configure Hotkeys")
**Then** Configurable hotkeys listed: HUD toggle, Focus Mode, Force agent states, Accept/Reject
**And** Hotkey editor shows current binding and allows custom key combination input
**And** Conflict detection warns if hotkey already bound to VSCode or other extension
**And** Default hotkeys documented and avoid common conflicts
**And** Hotkeys respect platform conventions (Cmd on Mac, Ctrl on Windows/Linux)
**And** Hotkeys configurable to avoid conflicts with assistive technologies (NFR11)
**And** Hotkey changes apply immediately without extension reload
**And** Hotkeys registered via VSCode keybindings API for standard integration
**And** Hotkeys visible in VSCode Keyboard Shortcuts editor
**And** Unit tests verify hotkey registration and conflict detection

---

### Story 7.3: Implement Drag-and-Drop Alerts to TODO List

As a developer,
I want to drag critical alerts to my TODO list for later action,
So that I don't lose track of important issues while maintaining flow.

**Acceptance Criteria:**

**Given** Alert system with code-anchored alerts exists from Epic 4
**When** I drag a critical or warning alert
**Then** Alert becomes draggable with visual drag affordance (cursor change, opacity)
**And** Drag target overlays appear: TODO list area, dismiss area
**And** Dropping on TODO list creates automatic TODO entry with alert details
**And** TODO entry includes: alert message, code location (file:line), timestamp, severity
**And** TODO entry clickable to jump back to code location
**And** Dropping on dismiss area removes alert from view
**And** Drag animation smooth with 60fps performance (GPU-accelerated)
**And** Drag operation works with mouse and trackpad
**And** Keyboard alternative: press 'T' to send focused alert to TODO
**And** TODO list integrates with VSCode TODO extensions if available
**And** Unit tests verify drag-and-drop mechanics and TODO creation

---

### Story 7.4: Implement Contextual Hover Tooltips on Agents

As a developer,
I want hover tooltips on agents explaining their current activity,
So that I understand what each agent is doing at a glance.

**Acceptance Criteria:**

**Given** All agents are visible in HUD
**When** I hover over an agent icon
**Then** Tooltip appears within 500ms of hover start
**And** Tooltip shows: agent name, current state, current task description
**And** Tooltip explains why agent was activated for this specific context
**And** Tooltip includes last update timestamp
**And** Tooltip shows estimated completion time for long-running tasks
**And** Tooltip styled with sumi-e aesthetic consistency
**And** Tooltip positioned to avoid covering agent or code (anti-collision)
**And** Tooltip dismisses on mouse leave after 200ms delay
**And** Keyboard users can trigger tooltip with Shift+F10 or context menu key
**And** Screen readers announce tooltip content via ARIA (NFR10)
**And** Unit tests verify tooltip content generation and positioning

---

### Story 7.5: Implement Click-to-Expand for Alert Details and Fixes

As a developer,
I want to click code-anchored alerts to see full details and proposed fixes,
So that I can understand and resolve issues without leaving my editor.

**Acceptance Criteria:**

**Given** Code-anchored alert system exists from Epic 4
**When** I click an alert icon in editor gutter
**Then** Alert expands inline showing full explanation panel
**And** Panel includes: severity indicator, message, detailed reasoning, affected code snippet
**And** Panel shows proposed fix(es) with before/after code diff
**And** "Apply Fix" button applies suggested fix with undo support
**And** "Explain More" button requests deeper explanation from Reviewer Agent
**And** Panel dismisses on: click outside, Escape key, or explicit close button
**And** Multiple alerts on same line show selection menu first
**And** Panel positioning respects anti-collision rules (doesn't cover code)
**And** Panel animations smooth and performant (GPU-accelerated, 60fps)
**And** Keyboard navigation: Tab through panel elements, Enter to apply fix
**And** Unit tests verify panel expansion, fix application, and interaction handling

---

### Story 7.6: Implement VSCode Command Palette Integration

As a developer,
I want all extension functions accessible via Command Palette,
So that I can discover and trigger actions using VSCode's standard interface.

**Acceptance Criteria:**

**Given** Extension is activated
**When** I open VSCode Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
**Then** All extension commands listed with "Suika:" prefix for discoverability
**And** Commands include: Toggle HUD, Change Mode, Configure Hotkeys, Show History, etc.
**And** Commands have descriptive text explaining what they do
**And** Commands organized logically: View, Mode, Configure, Debug, Help categories
**And** Commands register via `vscode.commands.registerCommand()` in extension.ts
**And** Commands respect current context (some disabled when not applicable)
**And** Command execution provides feedback via status bar or notifications
**And** Command shortcuts shown in Command Palette (e.g., "Toggle HUD (Cmd+Shift+H)")
**And** Commands documented in integrated help system
**And** Unit tests verify command registration and execution

---

### Story 7.7: Implement Keyboard-Only Navigation for All Interactive Elements

As a developer who prefers keyboard navigation,
I want comprehensive keyboard control over all HUD interactions,
So that I can use the extension efficiently without touching the mouse.

**Acceptance Criteria:**

**Given** All UI components are implemented
**When** I use keyboard exclusively
**Then** Tab key cycles focus through: agents, alerts, suggestions, Vital Signs Bar, panels
**And** Shift+Tab cycles focus in reverse direction
**And** Arrow keys navigate spatially between agents (up/down/left/right)
**And** Enter key activates focused element (expand agent, accept suggestion, etc.)
**And** Space key toggles focused element state (expand/collapse, select/deselect)
**And** Escape key closes expanded panels or dismisses focused alert
**And** Focus indicator clearly visible with distinct styling (border, glow, outline)
**And** Focus trap in modal panels (Tab cycles within panel, Escape to close)
**And** Skip links for rapid navigation ("Skip to suggestions", "Skip to alerts")
**And** Keyboard shortcuts documented and accessible via Shift+? help overlay
**And** Screen reader announces focus changes and element states (ARIA live regions - NFR10)
**And** Unit tests verify complete keyboard navigation flow

---

### Story 7.8: Implement Force Agent State Commands for Development and Debug

As a developer or tester,
I want to manually trigger agent states for testing and demonstrations,
So that I can debug agent behavior and showcase features reliably.

**Acceptance Criteria:**

**Given** Agent system is implemented
**When** I invoke force agent state commands (via Command Palette)
**Then** Commands available: "Force Agent State: Idle", "...Thinking", "...Working", "...Alert", "...Success"
**And** Command parameter prompts for agent selection: Architect, Coder, Reviewer, Context
**And** Forced state overrides natural agent state temporarily (5 minute timeout)
**And** Forced state clearly indicated in debug mode (status bar icon)
**And** Force state includes simulated task description for realism
**And** Commands only available in development mode or when debug mode enabled
**And** Force multi-agent collaboration state for visual testing
**And** "Reset All Agent States" command returns to natural state management
**And** Forced states logged to debug channel for troubleshooting
**And** Unit tests verify force state commands and timeout behavior
## Epic 8: Analytics, Telemetry & Metrics

**Goal:** Developers and tech leads track usage, learning progress, and team adoption with opt-in privacy-preserving telemetry and comprehensive metrics.

### Story 8.1: Implement Opt-In Telemetry System with Privacy Controls

As a developer,
I want telemetry to be opt-in with clear privacy controls,
So that I can share usage data to improve the product without compromising sensitive information.

**Acceptance Criteria:**

**Given** Extension is activated for first time
**When** First-run experience begins
**Then** Telemetry consent dialog explains data collection clearly
**And** Dialog details: what data is collected, how it's used, who has access
**And** Consent is opt-in (default is NO collection until user explicitly agrees)
**And** User can change consent anytime via "Suika: Telemetry Settings" command
**And** No user code is logged without explicit consent (NFR13 compliance)
**And** No API keys, secrets, or sensitive data ever transmitted (strict filtering)
**And** Telemetry data encrypted in transit (HTTPS/TLS)
**And** Data retention policy communicated (e.g., 90 days, then anonymized aggregation)
**And** User can export or delete their telemetry data on request
**And** Privacy policy linked and accessible from telemetry settings
**And** Unit tests verify consent handling and data filtering

---

### Story 8.2: Implement Usage Metrics Collection and Display

As a developer,
I want to see my usage metrics (sessions, suggestions, time saved),
So that I understand how I'm using the tool and the value it provides.

**Acceptance Criteria:**

**Given** Telemetry is enabled
**When** I use the extension over time
**Then** Metrics tracked include: total sessions, session duration, suggestions requested
**And** Metrics include: suggestions accepted, suggestions rejected, acceptance rate
**And** Metrics include: estimated time saved (based on accepted suggestions)
**And** Time saved calculation: average typing speed × code lines generated
**And** User can view metrics dashboard: "Suika: View My Metrics"
**And** Dashboard shows: daily/weekly/monthly trends, totals, acceptance rate graph
**And** Dashboard respects user privacy (local display, not shared unless consented)
**And** Metrics persist across extension updates (migration strategy)
**And** Metrics exportable to CSV or JSON for personal analysis
**And** Unit tests verify metric collection accuracy and calculation logic

---

### Story 8.3: Implement Suggestion Acceptance Rate Tracking

As a product manager,
I want to track suggestion acceptance rates across users,
So that I can measure AI suggestion quality and identify improvement areas.

**Acceptance Criteria:**

**Given** Telemetry is enabled and user has consented to product improvement data
**When** Users accept or reject suggestions
**Then** Acceptance rate calculated: accepted / (accepted + rejected) × 100
**And** Target acceptance rate documented: >60% (NFR27)
**And** Acceptance rate tracked per agent type (Coder, Architect, etc.)
**And** Acceptance rate tracked per mode (Learning, Expert, etc.)
**And** Acceptance rate tracked per suggestion type (completion, refactor, fix)
**And** Anonymized aggregate data sent to telemetry backend (user_id hashed)
**And** Low acceptance rate triggers investigation workflow for product team
**And** Tech leads can view team acceptance rates (if team telemetry enabled)
**And** Individual user acceptance rate visible in personal metrics dashboard
**And** Unit tests verify acceptance rate calculation and aggregation

---

### Story 8.4: Implement Post-Session Comprehension Surveys

As a product manager,
I want optional post-session surveys measuring comprehension,
So that I can validate the transparency goal with real user feedback.

**Acceptance Criteria:**

**Given** Session ends (extension deactivates or VSCode closes)
**When** User has used AI features during session
**Then** 20% of sessions trigger post-session survey prompt (random sampling)
**And** Survey asks: "How well did you understand the AI's suggestions today?" (1-10 scale)
**And** Survey asks: "What was unclear or confusing?" (optional freeform text)
**And** Target comprehension score documented: 8/10 average (NFR28)
**And** Survey is non-blocking and dismissible (does not interrupt workflow)
**And** Survey responses stored with session metadata (mode, agent usage, context size)
**And** Low comprehension scores flag specific sessions for UX research
**And** Survey opt-out available in telemetry settings
**And** Anonymized responses aggregated for product insights
**And** Unit tests verify survey triggering logic and response storage

---

### Story 8.5: Implement Weekly Learning Progress Surveys

As a developer,
I want periodic surveys measuring my learning progress,
So that I track whether the tool is improving my understanding of AI and coding patterns.

**Acceptance Criteria:**

**Given** User has used extension for at least 7 days
**When** One week has passed since last learning survey
**Then** Survey prompt appears at convenient time (low activity detection)
**And** Survey asks: "This week, how much did Suika improve your understanding?" (1-10 scale)
**And** Survey asks: "What patterns or concepts did you learn?" (optional freeform)
**And** Target learning impact score documented: 7/10 average (NFR29)
**And** Survey reminds user of features they haven't tried yet
**And** Survey is dismissible and can be snoozed for 24 hours
**And** Learning progress visible in personal metrics dashboard over time
**And** Product team sees aggregate learning impact trends
**And** Survey opt-out available in telemetry settings
**And** Unit tests verify survey scheduling and response tracking

---

### Story 8.6: Implement NPS (Net Promoter Score) Collection

As a product manager,
I want to measure Net Promoter Score periodically,
So that I understand user satisfaction and likelihood to recommend the tool.

**Acceptance Criteria:**

**Given** User has used extension for at least 30 days
**When** 30 days have passed since installation or last NPS survey
**Then** NPS survey prompt appears with standard question: "How likely are you to recommend Suika to a colleague?" (0-10 scale)
**And** Follow-up question: "What is the primary reason for your score?" (freeform text)
**And** NPS calculation: % Promoters (9-10) - % Detractors (0-6) = NPS
**And** Target NPS documented for product goals
**And** NPS scores tracked over time to measure improvement
**And** Detractor responses flagged for immediate product team review
**And** Promoter responses used for testimonials (with consent)
**And** Survey is respectful of user time (short, optional)
**And** NPS opt-out available in telemetry settings
**And** Unit tests verify NPS calculation and response categorization

---

### Story 8.7: Implement "Too Distracting" Detection and Mitigation

As a product manager,
I want to detect when users find the HUD distracting,
So that I can proactively adjust defaults or offer solutions.

**Acceptance Criteria:**

**Given** Telemetry is enabled
**When** User behaviors indicate distraction
**Then** Distraction signals detected: HUD hidden within 5s of activation (3+ times)
**And** Distraction signals: Focus Mode activated frequently (>50% of sessions)
**And** Distraction signals: Transparency increased to maximum
**And** Distraction signals: Animations disabled or Performance Mode active
**And** Target metric: 0 "too distracting" reports (NFR30)
**And** When distraction detected, offer help: "Seems like HUD might be distracting. Want tips?"
**And** Tips include: customization options, Focus Mode shortcuts, transparency settings
**And** Product team tracks distraction rate across user segments
**And** High distraction rates trigger UX review of default settings
**And** Unit tests verify distraction signal detection logic

---

### Story 8.8: Implement Team Adoption and Comprehension Tracking for Tech Leads

As a tech lead,
I want to see my team's adoption rates and comprehension scores,
So that I can identify who needs support and measure team-wide value.

**Acceptance Criteria:**

**Given** Team telemetry mode is enabled (organization setting)
**When** Tech lead opens team dashboard: "Suika: View Team Metrics"
**Then** Dashboard shows aggregate metrics: team adoption rate, active users, suggestion usage
**And** Dashboard shows team average comprehension score (from post-session surveys)
**And** Dashboard shows team average acceptance rate (anonymous, no individual attribution)
**And** Dashboard identifies trends: increasing/decreasing usage over time
**And** Dashboard highlights outliers: users with very low usage (may need training)
**And** Dashboard respects individual privacy (no code or detailed activity visible)
**And** Team metrics require organization admin consent (not default)
**And** Tech leads can export team reports for executive summaries
**And** Individual users can opt out of team metrics while keeping personal telemetry
**And** Unit tests verify team metric aggregation and privacy controls

---

## Epic 9: Extensibility & Public API

**Goal:** Extension developers create custom LLM providers, agent renderers, and subscribe to lifecycle events via stable, versioned public APIs.

### Story 9.1: Define and Document ILLMProvider Extension Interface

As an extension developer,
I want a stable ILLMProvider interface with documentation and examples,
So that I can integrate custom or on-premise LLM providers.

**Acceptance Criteria:**

**Given** ILLMProvider interface exists (Story 2.1)
**When** I read API documentation
**Then** ILLMProvider interface marked as public API with semver guarantees (NFR22)
**And** Interface documentation includes: purpose, method signatures, return types, error handling
**And** Documentation includes example implementation (custom provider tutorial)
**And** Example shows: API key management, request/response handling, error wrapping
**And** Extension point documented for provider registration
**And** Documentation explains provider lifecycle: registration, initialization, cleanup
**And** Breaking changes to interface require major version bump (semver compliance)
**And** Deprecation policy documented: 2 minor versions warning before removal
**And** API documentation auto-generated from JSDoc comments via TypeDoc (NFR20)
**And** Published API docs hosted on extension website or repository wiki
**And** Unit tests for example implementation included in documentation

---

### Story 9.2: Implement LLM Provider Registration API

As an extension developer,
I want to register my custom LLM provider programmatically,
So that my on-premise or specialized LLM integrates seamlessly.

**Acceptance Criteria:**

**Given** ILLMProvider interface is documented (Story 9.1)
**When** I create a custom provider extension
**Then** Registration API available: `AI101.registerLLMProvider(name, provider)`
**And** Registration validates provider implements ILLMProvider completely
**And** Registration fails gracefully with clear error if interface incomplete
**And** Registered providers appear in provider selection UI automatically
**And** Registered providers accessible via LLMProviderManager (Story 2.4)
**And** Multiple custom providers can be registered simultaneously
**And** Registration supports provider metadata: display name, icon, capabilities
**And** Provider unregistration supported: `AI101.unregisterLLMProvider(name)`
**And** Extension activation/deactivation properly manages provider lifecycle
**And** Example extension demonstrating registration included in documentation
**And** Unit tests verify registration API and validation logic

---

### Story 9.3: Define and Document IAgentRenderer Extension Interface

As an extension developer,
I want to customize agent visualization rendering,
So that I can create specialized agent representations for custom workflows.

**Acceptance Criteria:**

**Given** Agent system is implemented (Epic 3)
**When** I read IAgentRenderer API documentation
**Then** IAgentRenderer interface defined with methods: `render(agent, state, container)`
**And** Interface includes: `getSize()`, `animate(transition)`, `destroy()` lifecycle methods
**And** Interface marked as public API with semver guarantees
**And** Documentation explains rendering lifecycle and state updates
**And** Documentation includes example: custom 3D agent renderer using Three.js
**And** Example shows: DOM integration, animation coordination, cleanup
**And** Renderer receives agent state updates via callback mechanism
**And** Custom renderers can opt out of default sumi-e styling
**And** Performance guidelines documented (must maintain 60fps)
**And** API documentation auto-generated via TypeDoc
**And** Unit tests for example renderer included

---

### Story 9.4: Implement Lifecycle Event Subscription API

As an extension developer,
I want to subscribe to agent and suggestion lifecycle events,
So that I can build custom analytics, notifications, or integrations.

**Acceptance Criteria:**

**Given** Agent lifecycle events are implemented (Story 3.8)
**When** I create a custom extension
**Then** Event subscription API available: `AI101.on(eventName, callback)`
**And** Events include: `agentActivated`, `agentStateChanged`, `suggestionGenerated`, `suggestionAccepted`, `suggestionRejected`
**And** Event payloads documented with TypeScript types
**And** Callbacks receive structured event data (agent, state, context, timestamp)
**And** Subscription returns unsubscribe handle: `const unsub = AI101.on(...); unsub()`
**And** Multiple subscribers supported for same event (fan-out pattern)
**And** Event firing does not block main extension execution (async)
**And** Errors in subscriber callbacks caught and logged (don't crash extension)
**And** Event documentation includes use cases: logging, notifications, metrics
**And** Example extension demonstrating event subscriptions included
**And** Unit tests verify event emission, subscription, and unsubscription

---

### Story 9.5: Implement Typed Configuration API for Programmatic Access

As an extension developer,
I want programmatic access to Suika configuration,
So that I can read/write settings from my custom extension.

**Acceptance Criteria:**

**Given** Configuration Manager is implemented (Story 1.3)
**When** I use the configuration API
**Then** Read API available: `AI101.getConfig(key)` with typed return values
**And** Write API available: `AI101.setConfig(key, value)` with validation
**And** Configuration keys documented with types, defaults, and validation rules
**And** Configuration changes via API trigger `onDidChangeConfiguration` event
**And** API respects configuration scopes (user, workspace)
**And** API validates values before writing (same validation as UI)
**And** Invalid configuration writes throw descriptive errors
**And** Configuration API supports nested keys: `'ui.transparency.level'`
**And** Bulk configuration update supported: `AI101.updateConfig({ ... })`
**And** API documentation includes examples for common use cases
**And** Unit tests verify configuration read/write and validation

---

### Story 9.6: Implement Semantic Versioning for API Compatibility

As an extension developer,
I want API changes to follow semantic versioning strictly,
So that my extensions don't break unexpectedly on updates.

**Acceptance Criteria:**

**Given** Public APIs are defined (ILLMProvider, IAgentRenderer, events, config)
**When** Extension version updates
**Then** MAJOR version increment for breaking API changes (interface signature changes)
**And** MINOR version increment for backward-compatible additions (new optional methods)
**And** PATCH version increment for bug fixes (no API changes)
**And** Deprecation warnings logged for 2 minor versions before removal
**And** Deprecated APIs marked with `@deprecated` JSDoc tag and alternative documented
**And** API compatibility documented in CHANGELOG.md with migration guides
**And** Automated tests verify backward compatibility on version updates
**And** Extension marketplace listing shows minimum API version required
**And** Runtime API version check available: `AI101.getApiVersion()`
**And** Extension declares required API version in manifest: `"ai101ApiVersion": ">=1.2.0"`
**And** Unit tests verify version checking and compatibility enforcement

---

## Epic 10: Documentation & Developer Support

**Goal:** Users, contributors, and extension developers have comprehensive, searchable documentation, troubleshooting resources, and clear error messages.

### Story 10.1: Implement Integrated Getting-Started Documentation

As a new user,
I want getting-started documentation accessible within the extension,
So that I can learn how to use Suika without leaving VSCode.

**Acceptance Criteria:**

**Given** Extension is installed
**When** I activate the extension for first time
**Then** Welcome screen appears with getting-started guide
**And** Guide includes: quick tour, first suggestion walkthrough, mode explanations
**And** Guide is interactive with "Try it now" buttons that trigger real features
**And** Guide uses screenshots and animations to demonstrate concepts
**And** Guide accessible anytime via "Suika: Show Getting Started" command
**And** Guide tracks completion progress (which sections viewed)
**And** Guide includes video tutorials (linked, not embedded for size)
**And** Guide supports search within content
**And** Guide content maintained in markdown for easy updates
**And** Guide translated to multiple languages (i18n support)
**And** Unit tests verify guide rendering and navigation

---

### Story 10.2: Implement Searchable Troubleshooting Knowledge Base

As a user experiencing issues,
I want a searchable knowledge base organized by symptoms,
So that I can self-diagnose and resolve problems quickly.

**Acceptance Criteria:**

**Given** Extension is installed
**When** I open troubleshooting: "Suika: Troubleshooting"
**Then** Knowledge base opens with search input and symptom categories
**And** Categories include: Performance, Connectivity, Display Issues, API Key Problems
**And** Search finds articles by symptom keywords (e.g., "slow", "doesn't work", "blank screen")
**And** Each article includes: symptom description, diagnosis steps, solutions, prevention
**And** Articles link to relevant documentation sections for deeper understanding
**And** Common error codes documented with specific resolution steps
**And** Knowledge base updated regularly based on support tickets and user reports
**And** Articles include user-contributed solutions (community moderated)
**And** Troubleshooting accessible from error notifications (direct link)
**And** Knowledge base content maintained in markdown (version controlled)
**And** Unit tests verify search functionality and article retrieval

---

### Story 10.3: Create Comprehensive Architecture Documentation for Contributors

As a potential contributor,
I want detailed architecture documentation explaining system design,
So that I can understand the codebase and contribute effectively.

**Acceptance Criteria:**

**Given** Codebase is developed
**When** I read architecture documentation
**Then** Documentation explains: Orchestrator Central Pattern, Dual State Pattern, Hybrid Cache
**And** Documentation includes architecture diagrams (system, sequence, component)
**And** Documentation explains module boundaries and responsibilities
**And** Documentation details communication patterns (postMessage, events)
**And** Documentation includes data flow diagrams for key operations
**And** Documentation explains testing strategy and required coverage (>70%)
**And** Documentation lists key architectural decisions and rationale (ADRs)
**And** Documentation includes contribution guidelines (setup, PR process, code style)
**And** Documentation explains development workflow (build, debug, test)
**And** Architecture docs maintained in `/docs/architecture/` directory
**And** Architecture docs versioned with code (updated on structural changes)
**And** Unit tests not required for documentation (manual review process)

---

### Story 10.4: Generate API Documentation with Code Examples

As an extension developer,
I want comprehensive API documentation with runnable examples,
So that I can integrate with Suika quickly and correctly.

**Acceptance Criteria:**

**Given** Public APIs are implemented (Epic 9)
**When** I access API documentation
**Then** Documentation auto-generated from JSDoc comments via TypeDoc (NFR20)
**And** Documentation includes: interface definitions, method signatures, parameter types, return types
**And** Each API method includes usage example (code snippet)
**And** Examples are runnable (included in repository with instructions)
**And** Documentation organized by API surface: LLM Providers, Agent Renderers, Events, Configuration
**And** Documentation includes getting-started tutorial for extension developers
**And** Documentation explains extension activation and dependency declaration
**And** Documentation includes troubleshooting section for integration issues
**And** API docs published to extension website or GitHub Pages
**And** API docs versioned (docs for each major/minor version accessible)
**And** Generated docs reviewed for quality before publishing

---

### Story 10.5: Implement Clear Error Messages with Documentation Links

As a user encountering an error,
I want error messages that explain the problem and link to solutions,
So that I can resolve issues without external support.

**Acceptance Criteria:**

**Given** Extension encounters an error condition
**When** Error is displayed to user
**Then** Error message is clear and user-friendly (not technical jargon)
**And** Error includes: what happened, why it happened, what to do next
**And** Error includes error code for reference (e.g., "Error AI101-LLM-001")
**And** Error includes direct link to relevant documentation section (NFR38)
**And** Link opens in VSCode Simple Browser or external browser (user preference)
**And** Error severity indicated visually (info, warning, error icons)
**And** Error messages avoid blame language ("API key not found" not "You forgot API key")
**And** Error messages actionable (suggest fix, not just describe problem)
**And** Common errors have "Fix it now" buttons that trigger resolution command
**And** Error message templates maintained in centralized location for consistency
**And** Unit tests verify error message content and documentation link validity

---

### Story 10.6: Create Detailed Changelog with Contributor Recognition

As a user or contributor,
I want a detailed changelog showing what changed in each version,
So that I know what's new, what's fixed, and who contributed.

**Acceptance Criteria:**

**Given** Extension versions are released
**When** I view CHANGELOG.md
**Then** Changelog follows Keep a Changelog format (Added, Changed, Fixed, Removed, Deprecated, Security)
**And** Each version entry includes: version number, release date, summary
**And** Breaking changes highlighted prominently with migration guidance
**And** Each change entry includes contributor attribution: "(@username)"
**And** Changelog includes links to relevant PRs and issues
**And** Changelog includes "Thank you" section recognizing all contributors
**And** Changelog auto-generated from conventional commit messages (tooling)
**And** Manual changelog editing supported for clarity and organization
**And** Changelog accessible via "Suika: View Changelog" command
**And** Changelog displayed after extension updates (highlights new features)
**And** Changelog maintained in repository root for GitHub visibility

---

### Story 10.7: Implement Contextual Tooltips Throughout UI

As a user exploring the extension,
I want contextual tooltips explaining unfamiliar terms and controls,
So that I can learn the interface without consulting external documentation.

**Acceptance Criteria:**

**Given** UI components are implemented
**When** I hover over UI elements
**Then** Tooltips appear for: settings options, agent icons, metrics, modes, alerts
**And** Tooltips explain: what the element is, what it does, when to use it
**And** Tooltips include keyboard shortcuts where applicable
**And** Technical terms in tooltips link to glossary (click to learn more)
**And** Tooltip verbosity adapts to user mode (Learning = detailed, Expert = concise)
**And** Tooltips respect accessibility settings (screen readers announce content via ARIA - NFR39)
**And** Tooltip appearance delay configurable (default 500ms)
**And** Tooltips positioned to avoid covering relevant content (anti-collision)
**And** Tooltips dismissible with mouse move away or Escape key
**And** Tooltip content maintained in localization files (i18n support)
**And** Unit tests verify tooltip content presence and accuracy
