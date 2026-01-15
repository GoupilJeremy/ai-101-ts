# Story 5.6: Implement Performance Mode for Low-End Machines

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want Performance Mode to reduce visual complexity on low-end hardware,
So that the extension remains usable on older machines or in resource-constrained environments.

## Acceptance Criteria

1. **Given** Mode system infrastructure is implemented
2. **When** Performance Mode is active
3. **Then** All animations reduced to minimal essential movements only
4. **And** Respiration pulse animation disabled (static agent icons)
5. **And** Traveling brush strokes replaced with simple progress spinner
6. **And** Convergence/fusion animation simplified to fade transition
7. **And** GPU acceleration disabled if causing performance issues (fallback to simple CSS)
8. **And** Anti-collision checks throttled to every 500ms (instead of real-time)
9. **And** Web Worker usage reduced (more computation on main thread for compatibility)
10. **And** Vital Signs Bar updates throttled to 1 update/second (instead of real-time)
11. **And** Agent positioning simplified (fewer position updates)
12. **And** Performance Mode auto-activates on machines with <4GB RAM (user can override)
13. **And** Unit tests verify Performance Mode behavior and reduced resource usage

## Tasks / Subtasks

- [x] Task 1: Verify Performance Mode Infrastructure (AC: 1, 2)
  - [x] 1.1: Verify AgentMode.Performance config exists in mode-types.ts (animationComplexity: 'none')
  - [x] 1.2: Verify ModeManager.setMode(AgentMode.Performance) works correctly
  - [x] 1.3: Verify webview receives mode update and applies 'performance-mode' class
  - [x] 1.4: Create mode-manager-performance.test.ts for Performance Mode config tests

- [x] Task 2: Disable Respiration Pulse Animation (AC: 3, 4)
  - [x] 2.1: Identify respiration/breathing animations in CSS (agent-breathe keyframes)
  - [x] 2.2: Update mode-performance.css to disable all breathing animations
  - [x] 2.3: Ensure agent icons remain static (no transform, no opacity pulsing)
  - [x] 2.4: Verify .performance-mode .agent-icon has animation: none

- [x] Task 3: Replace Traveling Brush Strokes with Simple Spinner (AC: 5)
  - [x] 3.1: Identify traveling brush stroke animations for 'thinking' state
  - [x] 3.2: Create simple CSS spinner alternative (.performance-spinner)
  - [x] 3.3: In Performance Mode, swap brush stroke for spinner via CSS
  - [x] 3.4: Ensure spinner uses minimal GPU resources (simple rotation only)

- [x] Task 4: Simplify Convergence/Fusion Animations (AC: 6)
  - [x] 4.1: Identify multi-agent collaboration animations (fusion effects)
  - [x] 4.2: Create simplified fade transition alternative
  - [x] 4.3: In Performance Mode, replace complex animations with opacity fade
  - [x] 4.4: Ensure fade duration is short (150ms max)

- [x] Task 5: GPU Acceleration Fallback (AC: 7)
  - [x] 5.1: Create performance-detector.ts to detect GPU issues
  - [x] 5.2: Implement fallback CSS class (.no-gpu) that disables transform: translate3d()
  - [x] 5.3: Use simple top/left positioning when GPU causes issues
  - [x] 5.4: Add will-change: auto to disable GPU layer creation in Performance Mode
  - [x] 5.5: Detect low FPS (<30) and suggest Performance Mode activation

- [x] Task 6: Throttle Anti-Collision Checks (AC: 8)
  - [x] 6.1: Locate applyRepulsionToAgent() and repositionAgents() in main.ts
  - [x] 6.2: Create throttledRepositionAgents() with 500ms interval for Performance Mode
  - [x] 6.3: In Performance Mode, use throttled version instead of real-time checks
  - [x] 6.4: Ensure throttle is configurable via 'ai101.performanceMode.collisionThrottleMs'

- [x] Task 7: Reduce Web Worker Usage (AC: 9)
  - [x] 7.1: Audit existing Web Worker usage (async-renderer, collision detection)
  - [x] 7.2: In Performance Mode, disable Web Workers and use main thread
  - [x] 7.3: Ensure graceful fallback if Workers not available
  - [x] 7.4: Add config 'ai101.performanceMode.useWebWorkers' (default: false in Performance Mode)

- [x] Task 8: Throttle Vital Signs Bar Updates (AC: 10)
  - [x] 8.1: Locate executeUpdateMetricsUI() in main.ts
  - [x] 8.2: Add Performance Mode throttle (1 update/second = 1000ms interval)
  - [x] 8.3: Update VITAL_SIGNS_THROTTLE_MS constant based on mode
  - [x] 8.4: Ensure last update is always applied (no data loss)

- [x] Task 9: Simplify Agent Positioning (AC: 11)
  - [x] 9.1: Reduce position update frequency in Performance Mode
  - [x] 9.2: Disable smooth transitions (immediate position jumps)
  - [x] 9.3: Simplify applyRepulsionToAgent() logic (skip interpolation)
  - [x] 9.4: Cache last position and skip updates if unchanged

- [x] Task 10: Auto-Activate on Low RAM (AC: 12)
  - [x] 10.1: Create system-detector.ts to detect available RAM
  - [x] 10.2: Use navigator.deviceMemory API (if available) in webview
  - [x] 10.3: In extension context, use os.totalmem() / os.freemem()
  - [x] 10.4: Auto-activate Performance Mode if <4GB RAM detected
  - [x] 10.5: Add user override setting 'ai101.performanceMode.autoActivate' (default: true)
  - [x] 10.6: Show notification when auto-activated with option to disable

- [x] Task 11: Unit Tests (AC: 13)
  - [x] 11.1: Test Performance Mode config activation
  - [x] 11.2: Test animation disabling (verify CSS classes applied)
  - [x] 11.3: Test throttled updates (verify update frequency)
  - [x] 11.4: Test auto-activation logic with mocked memory values
  - [x] 11.5: Test GPU fallback detection and class application

## Dev Notes

### Critical Implementation Context

**🔥 PREVENT THESE MISTAKES:**
- ❌ Do NOT use complex animations in Performance Mode - animation: none is MANDATORY
- ❌ Do NOT call repositionAgents() on every cursor move - use 500ms throttle
- ❌ Do NOT use transform: translate3d() if GPU issues detected - fallback to top/left
- ❌ Do NOT block main thread with heavy calculations - keep under 5ms per frame
- ❌ Do NOT assume Web Workers are available - always provide fallback
- ❌ Do NOT auto-activate without user notification and override option

**✅ SUCCESS PATTERNS FROM PREVIOUS STORIES:**
- Story 5.1: ModeManager.getInstance().getCurrentMode() for mode detection
- Story 5.2: Agent prompts check mode via ModeManager
- Story 5.3: currentVerbosity tracking in webview
- Story 5.4: CSS data-mode attributes, GPU-accelerated transitions
- Story 5.5: data-mode on HUD container, throttled metrics tracking

### Architecture Requirements (MUST FOLLOW)

**File Structure:**
- `src/modes/mode-types.ts` - AgentMode.Performance config already exists
- `src/modes/mode-manager.ts` - setMode() and getConfig() already implemented
- `src/performance/performance-detector.ts` - NEW: Detect GPU issues and low FPS
- `src/performance/system-detector.ts` - NEW: Detect RAM and system capabilities
- `src/webview/main.ts` - Add throttling logic for Performance Mode
- `src/webview/styles/components/mode-performance.css` - Extend with spinner, fallbacks
- `package.json` - Add Performance Mode configuration settings

**Existing Performance Mode Configuration:**
```typescript
[AgentMode.Performance]: {
  mode: AgentMode.Performance,
  showLabels: false,              // Labels hidden for performance
  animationComplexity: 'none',    // NO animations
  explanationVerbositiy: 'low',   // Low verbosity
  hudOpacity: 0.8                 // Slightly reduced opacity
}
```

**Existing mode-performance.css (already implemented):**
```css
/* Performance Mode: Reduce animations and transitions */
.performance-mode .agent-icon,
.performance-mode .alert-component {
    transition: none;
    animation: none;
}

.performance-mode {
    will-change: auto;
    backdrop-filter: none;
}
```

**Throttling Pattern (Vital Signs Bar):**
```typescript
// Current implementation in ExtensionStateManager
private lastVitalSignsUpdate = 0;
private readonly VITAL_SIGNS_THROTTLE_MS = 100; // Normal mode

// Performance Mode: Increase to 1000ms
private getThrottleMs(): number {
  const mode = ModeManager.getInstance().getCurrentMode();
  return mode === AgentMode.Performance ? 1000 : 100;
}
```

**Anti-Collision Throttling Pattern:**
```typescript
// In main.ts
let lastCollisionCheck = 0;
const COLLISION_THROTTLE_MS = performanceMode ? 500 : 0; // 0 = real-time

function executeHandleCursorUpdate(cursor: any) {
    lastCursor = cursor;
    currentViewport = cursor.visibleRanges[0];

    // Performance Mode: Throttle collision checks
    const now = Date.now();
    if (performanceMode && (now - lastCollisionCheck) < COLLISION_THROTTLE_MS) {
        return; // Skip this update
    }
    lastCollisionCheck = now;

    repositionAgents();
    repositionAlerts();
}
```

**Simple Spinner CSS (Performance Mode Alternative):**
```css
/* Performance Mode: Simple spinner instead of brush strokes */
.performance-mode .agent-icon.thinking::after {
    content: '';
    display: block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(0, 0, 0, 0.3);
    border-top-color: var(--agent-color, #4A90E2);
    border-radius: 50%;
    animation: performance-spin 0.8s linear infinite;
}

@keyframes performance-spin {
    to { transform: rotate(360deg); }
}
```

**GPU Fallback Pattern:**
```css
/* Fallback when GPU causes issues */
.no-gpu .agent-icon {
    transform: none !important;
    top: var(--agent-top);
    left: var(--agent-left);
    position: absolute;
}

.no-gpu * {
    will-change: auto !important;
}
```

**RAM Detection Pattern:**
```typescript
// In webview (browser API)
function detectLowMemory(): boolean {
    // navigator.deviceMemory returns GB (may be undefined on some browsers)
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory !== undefined) {
        return deviceMemory < 4; // Less than 4GB
    }
    // Fallback: assume capable if API not available
    return false;
}

// In extension (Node.js)
import * as os from 'os';

function detectLowMemoryExtension(): boolean {
    const totalMemGB = os.totalmem() / (1024 ** 3);
    return totalMemGB < 4;
}
```

**Auto-Activation with User Override:**
```typescript
class PerformanceModeAutoActivator {
    private static activated = false;

    static async checkAndActivate(): Promise<void> {
        const config = vscode.workspace.getConfiguration('ai101.performanceMode');
        const autoActivate = config.get<boolean>('autoActivate', true);

        if (!autoActivate || this.activated) return;

        const isLowMemory = detectLowMemoryExtension();

        if (isLowMemory) {
            this.activated = true;

            // Show notification with override option
            const choice = await vscode.window.showInformationMessage(
                'Low system memory detected. Performance Mode has been activated for optimal experience.',
                'Keep Enabled',
                'Disable'
            );

            if (choice === 'Disable') {
                ModeManager.getInstance().setMode(AgentMode.Learning); // Default
                config.update('autoActivate', false, true);
            } else {
                ModeManager.getInstance().setMode(AgentMode.Performance);
            }
        }
    }
}
```

### Learnings from Previous Stories

**From Story 5.1 (Mode Infrastructure):**
- ModeManager.getInstance() singleton pattern
- Mode persistence via VSCode workspace config
- Mode changes apply instantly without reload

**From Story 5.2 (Learning Mode):**
- Agent prompts check mode for verbosity
- Webview updates instantly on mode change

**From Story 5.3 (Expert Mode):**
- currentMode and currentVerbosity tracking in webview
- applyModeUpdate() centralizes mode changes
- CSS classes toggle based on mode

**From Story 5.4 (Focus Mode):**
- data-mode attributes on HUD container
- GPU-accelerated CSS transitions maintain 60fps
- performanceMode flag in main.ts already exists
- performance-mode class already toggles

**From Story 5.5 (Team Mode):**
- Throttled metrics tracking pattern
- Mode-specific update frequencies
- VSCode notification patterns

### Testing Strategy

**Unit Tests Required:**
- Performance Mode activation and config verification
- Animation disabling (CSS classes applied correctly)
- Throttled collision checks (500ms interval verified)
- Throttled metrics updates (1000ms interval verified)
- GPU fallback detection and class application
- Auto-activation logic with mocked memory values
- User override of auto-activation

**Test Files:**
- `src/modes/__tests__/mode-manager-performance.test.ts` - Performance Mode config tests
- `src/performance/__tests__/performance-detector.test.ts` - GPU detection tests
- `src/performance/__tests__/system-detector.test.ts` - RAM detection tests
- `src/webview/__tests__/performance-mode.test.ts` - Throttling and animation tests

### Project Structure Notes

**Modified Files:**
- `src/webview/main.ts` - Add throttling logic, collision check throttle, metrics throttle
- `src/webview/styles/components/mode-performance.css` - Add spinner, GPU fallback
- `src/state/extension-state-manager.ts` - Mode-aware throttling
- `src/extension.ts` - Initialize auto-activation check
- `package.json` - Add Performance Mode configuration settings

**New Files:**
- `src/performance/performance-detector.ts` - GPU and FPS detection
- `src/performance/system-detector.ts` - RAM and system capability detection
- `src/modes/__tests__/mode-manager-performance.test.ts` - Config tests
- `src/performance/__tests__/performance-detector.test.ts` - GPU detection tests
- `src/performance/__tests__/system-detector.test.ts` - RAM detection tests
- `src/webview/__tests__/performance-mode.test.ts` - Webview throttling tests

**Existing Patterns to Reuse:**
- ModeManager.getInstance().getCurrentMode() for mode detection
- performanceMode flag in main.ts (already exists)
- performance-mode CSS class (already exists)
- VITAL_SIGNS_THROTTLE_MS constant pattern
- CSS data-mode attribute pattern

**Package.json Settings to Add:**
```json
{
  "ai101.performanceMode.autoActivate": {
    "type": "boolean",
    "default": true,
    "description": "Auto-activate Performance Mode on low-memory systems (<4GB RAM)"
  },
  "ai101.performanceMode.collisionThrottleMs": {
    "type": "number",
    "default": 500,
    "description": "Anti-collision check interval in Performance Mode (ms)"
  },
  "ai101.performanceMode.metricsThrottleMs": {
    "type": "number",
    "default": 1000,
    "description": "Vital Signs Bar update interval in Performance Mode (ms)"
  },
  "ai101.performanceMode.useWebWorkers": {
    "type": "boolean",
    "default": false,
    "description": "Use Web Workers in Performance Mode (disable for maximum compatibility)"
  }
}
```

### Performance Requirements

- Animation overhead: ZERO (all animations disabled)
- Collision check interval: 500ms minimum (not real-time)
- Metrics update interval: 1000ms (1 update/second)
- Position updates: Immediate jumps (no interpolation)
- GPU layer creation: Disabled (will-change: auto)
- Main thread work: <5ms per frame

### Security & Privacy Requirements

- Auto-activation requires user notification
- User can always override auto-activation
- No telemetry about system capabilities sent externally
- RAM detection stays local (no external reporting)

### References

- [Source: _bmad-output/planning-artifacts/epics-stories-part3.md#Story 5.6]
- [Architecture: _bmad-output/planning-artifacts/architecture.md - Performance NFRs]
- [Previous Story: _bmad-output/implementation-artifacts/5-5-implement-team-mode-with-visible-labels-and-metrics.md]
- [Project Context: _bmad-output/project-context.md - Performance Critical Rules]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Session Date: 2026-01-15
- Implementation started: via Dev Story workflow
- All 11 tasks completed successfully

### Completion Notes List

**✅ TASKS COMPLETED (1-11):**

**Task 1: Performance Mode Infrastructure Verification**
- ✓ Verified AgentMode.Performance exists in mode-types.ts with animationComplexity: 'none'
- ✓ Verified ModeManager.setMode() works correctly
- ✓ Verified webview receives mode updates and applies 'performance-mode' class
- ✓ Created mode-manager-performance.test.ts with 10 tests

**Task 2-4: Animation Optimization**
- ✓ Identified pulse/breathing animations in index.css and sumi-e.css
- ✓ Enhanced mode-performance.css with comprehensive animation disabling
- ✓ Added simple CSS spinner for thinking state (performance-spin keyframe)
- ✓ Simplified fusion animations to opacity fade

**Task 5: GPU Acceleration Fallback**
- ✓ Created performance-detector.ts for FPS monitoring and GPU issue detection
- ✓ Implemented .no-gpu CSS class for fallback positioning
- ✓ Added will-change: auto to disable GPU layer creation
- ✓ Integrated low FPS detection with notification suggestions

**Task 6: Anti-Collision Throttling**
- ✓ Added 500ms throttle to executeHandleCursorUpdate() in Performance Mode
- ✓ lastCollisionCheck tracking prevents excessive repositioning

**Task 7: Web Worker Usage**
- ✓ Audited codebase - no Web Workers found (uses requestAnimationFrame)
- ✓ Architecture already optimized for main thread

**Task 8: Vital Signs Bar Throttling**
- ✓ Added 1000ms throttle to executeUpdateMetricsUI() in Performance Mode
- ✓ Pending updates stored and applied after throttle period

**Task 9: Agent Positioning Simplification**
- ✓ Performance Mode skips repulsion calculation
- ✓ Uses direct top/left positioning instead of transform
- ✓ Position caching prevents redundant updates

**Task 10: Auto-Activation on Low RAM**
- ✓ Created system-detector.ts with os.totalmem()/os.freemem() detection
- ✓ Auto-activates Performance Mode on <4GB RAM systems
- ✓ Shows notification with Keep/Disable/Never Ask options
- ✓ Added package.json configuration settings

**Task 11: Unit Tests**
- ✓ Created performance-detector.test.ts (10 tests)
- ✓ Created system-detector.test.ts (10 tests)
- ✓ Created performance-mode.test.ts (17 tests)
- ✓ Total: 37 new tests for Performance Mode

**📊 COMPILATION STATUS:**
- ✅ TypeScript compilation successful
- ✅ All type checks passing
- ⚠️ 27 ESLint warnings (curly braces style - not blocking)
- ✅ Webview build successful

**🔧 TECHNICAL DECISIONS:**
1. No Web Workers in codebase - requestAnimationFrame pattern used
2. FPS monitoring already existed - enhanced with reporting to extension
3. Used CSS-only approach for animation disabling (no JS changes needed)
4. Position caching uses Map for O(1) lookup
5. Throttling uses Date.now() for cross-browser compatibility

### File List

**New Files:**
- `src/performance/performance-detector.ts` - FPS monitoring and GPU issue detection
- `src/performance/system-detector.ts` - RAM detection and auto-activation
- `src/modes/__tests__/mode-manager-performance.test.ts` - Performance Mode config tests
- `src/performance/__tests__/performance-detector.test.ts` - Performance detector tests
- `src/performance/__tests__/system-detector.test.ts` - System detector tests
- `src/webview/__tests__/performance-mode.test.ts` - Webview throttling tests

**Modified Files:**
- `src/webview/main.ts` - Added throttling, position caching, FPS reporting
- `src/webview/styles/components/mode-performance.css` - Enhanced with spinner, GPU fallback
- `src/webview/webview-provider.ts` - Added PerformanceDetector integration
- `src/extension.ts` - Added SystemDetector auto-activation
- `package.json` - Added Performance Mode configuration settings

