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
**And** Architecture summary accessible via command: "AI-101: View Detected Architecture"
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
**When** I open the History Timeline (Command: "AI-101: Show Decision History")
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
**When** I open hotkey configuration (Command: "AI-101: Configure Hotkeys")
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

**Given** Alert system is implemented (Story 4.6)
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

**Given** Alerts are anchored to code lines (Story 4.6)
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
**Then** All extension commands listed with "AI-101:" prefix for discoverability
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
