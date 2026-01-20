## Epic 4: Transparent HUD & Visual System

**Goal:** Developers have a beautiful, transparent sumi-e aesthetic HUD overlay that displays agents and vital signs without obstructing code editing, maintaining 60fps animations.

### Story 4.1: Create Transparent Webview Overlay with Browser Context

As a developer,
I want a transparent webview overlay that runs in Browser context,
So that the HUD displays over code without blocking editor interactions.

**Acceptance Criteria:**

**Given** The extension foundation is implemented (Epic 1)
**When** I create `src/ui/webview-manager.ts` and `src/webview/main.js`
**Then** WebviewManager creates webview panel via `vscode.window.createWebviewPanel()`
**And** Webview has `retainContextWhenHidden: true` to preserve state
**And** Webview uses local HTML file loaded from `dist/webview.html`
**And** Webview runs in Browser context (NOT Node.js)
**And** Webview panel has transparent background via CSS: `background: transparent`
**And** Webview overlays editor via `vscode.ViewColumn.Beside` positioning
**And** Webview receives state updates via `postMessage` from extension
**And** Webview content is bundled separately by esbuild (dual-build from Story 1.2)
**And** Clicking through webview to code works (pointer-events: none on transparent areas)
**And** Unit tests verify webview creation and message passing

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
