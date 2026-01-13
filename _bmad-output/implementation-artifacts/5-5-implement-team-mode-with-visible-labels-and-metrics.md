# Story 5.5: Implement Team Mode with Visible Labels and Metrics

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want Team Mode to show visible labels for pair programming and team metrics,
So that my pairing partner or team members understand what the AI is doing.

## Acceptance Criteria

1. **Given** Mode system infrastructure is implemented
2. **When** Team Mode is active
3. **Then** All agents display visible text labels (not just icons)
4. **And** Labels show agent names: "Architect", "Coder", "Reviewer", "Context"
5. **And** Agent states include descriptive text: "Analyzing project structure..."
6. **And** Vital Signs Bar shows expanded metrics (tokens, files, cost, time)
7. **And** Suggestion acceptance/rejection actions logged for team visibility
8. **And** Team comprehension survey appears after collaborative sessions (opt-in)
9. **And** Metrics include: suggestions accepted by role, time saved per developer
10. **And** Large text mode option for screen sharing visibility (125% scale)
11. **And** Collaborative annotations: team members can comment on suggestions
12. **And** Unit tests verify Team Mode label visibility and metrics tracking

## Tasks / Subtasks

- [x] Task 1: Team Mode Configuration Verification (AC: 1, 2)
  - [x] 1.1: Verify AgentMode.Team config in mode-types.ts (already exists)
  - [x] 1.2: Verify ModeManager can switch to Team Mode
  - [x] 1.3: Verify webview receives Team Mode updates via postMessage

- [x] Task 2: Agent Label Display (AC: 3, 4, 5)
  - [x] 2.1: Modify webview to show agent labels when showLabels: true
  - [x] 2.2: Add agent-label-text class with proper visibility in Team Mode
  - [x] 2.3: Implement descriptive state text display ("Analyzing...", "Generating code...")
  - [x] 2.4: Create mode-team.css for Team Mode specific styles
  - [x] 2.5: Ensure labels visible with 125% scale support

- [x] Task 3: Expanded Vital Signs Bar (AC: 6)
  - [x] 3.1: Extend IMetrics interface to include session time
  - [x] 3.2: Modify executeUpdateMetricsUI() to show expanded metrics in Team Mode
  - [x] 3.3: Add "Time: Xm Ys" to Vital Signs Bar display
  - [x] 3.4: Add CSS for expanded metrics bar layout

- [x] Task 4: Suggestion Logging & Metrics Tracking (AC: 7, 9)
  - [x] 4.1: Create team-metrics-tracker.ts to track suggestions by agent role
  - [x] 4.2: Implement ISuggestionMetrics interface (accepted/rejected counts per agent)
  - [x] 4.3: Hook into suggestion accept/reject events (toExtension: messages)
  - [ ] 4.4: Calculate "time saved" based on suggestion complexity and acceptance
  - [ ] 4.5: Display metrics summary in status bar or webview panel

- [x] Task 5: Team Comprehension Survey (AC: 8)
  - [x] 5.1: Create survey-manager.ts for opt-in survey triggering
  - [x] 5.2: Detect end of collaborative session (idle timeout or mode switch)
  - [x] 5.3: Show VSCode notification with survey prompt (opt-in only)
  - [x] 5.4: Create survey questions (1-10 scale: "Did team understand AI actions?")
  - [x] 5.5: Store survey responses in workspace state (anonymized)

- [ ] Task 6: Large Text Mode (AC: 10)
  - [ ] 6.1: Add 'ai101.teamMode.largeText' configuration setting (boolean)
  - [ ] 6.2: Apply CSS transform: scale(1.25) to HUD when largeText enabled
  - [ ] 6.3: Add toggle command 'ai-101-ts.toggleLargeText' in package.json
  - [ ] 6.4: Create toggle-large-text.ts command handler
  - [ ] 6.5: Ensure scaling doesn't break layout or positioning

- [ ] Task 7: Collaborative Annotations (AC: 11)
  - [ ] 7.1: Create annotations-manager.ts for comment storage
  - [ ] 7.2: Add "Add Comment" button to suggestion UI elements
  - [ ] 7.3: Implement inline comment display (webview overlay)
  - [ ] 7.4: Store annotations in workspace state with author + timestamp
  - [ ] 7.5: Allow team members to view/edit annotations in Team Mode

- [ ] Task 8: Unit Tests (AC: 12)
  - [ ] 8.1: Test Team Mode activation and label visibility
  - [ ] 8.2: Test expanded metrics display in Team Mode
  - [ ] 8.3: Test suggestion tracking by agent role
  - [ ] 8.4: Test large text mode scaling
  - [ ] 8.5: Test annotation creation and display

## Dev Notes

### Critical Implementation Context

**🔥 PREVENT THESE MISTAKES:**
- ❌ Do NOT hide labels in Team Mode - showLabels: true is MANDATORY for team visibility
- ❌ Do NOT mutate ModeConfigs directly - Team Mode config already exists, use it
- ❌ Do NOT add metrics to webview state - backend (ExtensionStateManager) is source of truth
- ❌ Do NOT block UI with synchronous metrics calculations - use async tracking
- ❌ Do NOT store survey data without user consent - opt-in ONLY (NFR-SEC-2)

**✅ SUCCESS PATTERN FROM PREVIOUS STORIES:**
- Story 5.1: ModeManager singleton pattern, mode persistence via VSCode config
- Story 5.2: Agent prompts check mode, explanationVerbositiy affects output
- Story 5.3: Expert Mode condensed rendering, currentVerbosity tracking in webview
- Story 5.4: CSS data-mode attributes, GPU-accelerated transitions, toast notifications

### Architecture Requirements (MUST FOLLOW)

**File Structure:**
- `src/modes/mode-types.ts` - AgentMode.Team config already exists
- `src/modes/mode-manager.ts` - setMode() and getConfig() already implemented
- `src/team/team-metrics-tracker.ts` - NEW: Track suggestions by agent role
- `src/team/survey-manager.ts` - NEW: Manage team comprehension surveys
- `src/team/annotations-manager.ts` - NEW: Collaborative annotations
- `src/commands/toggle-large-text.ts` - NEW: Large text mode command
- `src/webview/main.ts` - Expand metrics display, show labels in Team Mode
- `src/webview/styles/components/mode-team.css` - NEW: Team Mode styles
- `package.json` - Add toggleLargeText command and configuration settings

**Team Mode Configuration (Already Exists):**
```typescript
[AgentMode.Team]: {
  mode: AgentMode.Team,
  showLabels: true,              // Labels VISIBLE in Team Mode
  animationComplexity: 'full',   // Full animations for visibility
  explanationVerbositiy: 'high', // High verbosity for team understanding
  hudOpacity: 0.95               // High opacity for screen sharing
}
```

**State Management:**
- Backend: ExtensionStateManager stores metrics and mode
- Frontend: WebviewStateManager mirrors state for rendering
- Metrics: TeamMetricsTracker tracks suggestions per agent role
- Persistence: ModeManager persists mode, SurveyManager persists responses

**Metrics Interface Extension:**
```typescript
interface IMetrics {
  tokens: number;
  cost: number;
  files: number;
  sessionTime?: number; // NEW: Session duration in seconds (Team Mode)
}

interface ISuggestionMetrics {
  architect: { accepted: number; rejected: number; };
  coder: { accepted: number; rejected: number; };
  reviewer: { accepted: number; rejected: number; };
  context: { accepted: number; rejected: number; };
  totalTimeSaved: number; // Estimated time saved in minutes
}
```

**Webview Label Display Pattern:**
```javascript
// In executeUpdateAgentHUD() - Team Mode shows labels
function executeUpdateAgentHUD(agent, state) {
  // ... existing code ...

  const labelEl = agentEl.querySelector('.agent-label-text');
  if (labelEl) {
    // Team Mode: Show descriptive state text
    if (currentMode === 'team') {
      labelEl.textContent = getDescriptiveStateText(agent, state);
      labelEl.style.display = 'block'; // Visible in Team Mode
    } else {
      labelEl.style.display = currentVerbosity === 'high' ? 'block' : 'none';
    }
  }
}

function getDescriptiveStateText(agent, state) {
  const stateMessages = {
    context: {
      thinking: 'Loading context files...',
      working: 'Optimizing token budget...',
      success: 'Context ready'
    },
    architect: {
      thinking: 'Analyzing project structure...',
      working: 'Designing solution...',
      success: 'Architecture complete'
    },
    coder: {
      thinking: 'Planning code generation...',
      working: 'Generating code...',
      success: 'Code ready for review'
    },
    reviewer: {
      thinking: 'Analyzing code quality...',
      working: 'Identifying risks...',
      success: 'Review complete'
    }
  };

  return stateMessages[agent]?.[state.status] || `${agent}: ${state.status}`;
}
```

**Expanded Metrics Display (Team Mode):**
```javascript
function executeUpdateMetricsUI(metrics) {
  const metricsEl = document.getElementById('metrics');
  if (!metricsEl) return;

  const formattedCost = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(metrics.cost);

  // Team Mode: Show expanded metrics with session time
  if (currentMode === 'team' && metrics.sessionTime !== undefined) {
    const minutes = Math.floor(metrics.sessionTime / 60);
    const seconds = metrics.sessionTime % 60;
    metricsEl.innerText = `Tokens: ${metrics.tokens.toLocaleString()} | Cost: ${formattedCost} | Files: ${metrics.files} | Time: ${minutes}m ${seconds}s`;
  } else {
    // Normal mode: Standard metrics
    metricsEl.innerText = `Tokens: ${metrics.tokens.toLocaleString()} | Cost: ${formattedCost} | Files: ${metrics.files}`;
  }
}
```

**Large Text Mode CSS Pattern:**
```css
/* Team Mode with Large Text enabled */
#hud-container[data-mode="team"][data-large-text="true"] {
  transform: scale(1.25);
  transform-origin: top left;
}

/* Ensure labels are visible in Team Mode */
#hud-container[data-mode="team"] .agent-label-text {
  display: block;
  font-size: 14px;
  font-weight: 500;
  opacity: 1.0;
  white-space: nowrap;
}
```

**Suggestion Tracking Pattern:**
```typescript
class TeamMetricsTracker {
  private metrics: ISuggestionMetrics = {
    architect: { accepted: 0, rejected: 0 },
    coder: { accepted: 0, rejected: 0 },
    reviewer: { accepted: 0, rejected: 0 },
    context: { accepted: 0, rejected: 0 },
    totalTimeSaved: 0
  };

  recordSuggestionAction(agent: AgentType, action: 'accepted' | 'rejected', complexity: 'simple' | 'medium' | 'complex') {
    this.metrics[agent][action]++;

    // Estimate time saved (only for accepted suggestions)
    if (action === 'accepted') {
      const timeSaved = this.estimateTimeSaved(complexity);
      this.metrics.totalTimeSaved += timeSaved;
    }

    this.persistMetrics();
  }

  private estimateTimeSaved(complexity: 'simple' | 'medium' | 'complex'): number {
    // Time saved in minutes based on complexity
    const timeMap = { simple: 5, medium: 15, complex: 30 };
    return timeMap[complexity];
  }

  getMetrics(): ISuggestionMetrics {
    return { ...this.metrics };
  }
}
```

**Survey Trigger Pattern:**
```typescript
class SurveyManager {
  private surveyEnabled: boolean;
  private sessionStartTime: number;
  private idleTimeoutMs = 10 * 60 * 1000; // 10 minutes idle = session end

  constructor() {
    const config = vscode.workspace.getConfiguration('ai101.teamMode');
    this.surveyEnabled = config.get<boolean>('surveyEnabled', false); // Opt-in only
  }

  onSessionEnd() {
    if (!this.surveyEnabled) return;

    const sessionDuration = Date.now() - this.sessionStartTime;
    const minDurationForSurvey = 5 * 60 * 1000; // 5 minutes minimum

    if (sessionDuration >= minDurationForSurvey) {
      this.showSurveyPrompt();
    }
  }

  private async showSurveyPrompt() {
    const response = await vscode.window.showInformationMessage(
      'How well did your team understand the AI actions? (1-10)',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Skip'
    );

    if (response && response !== 'Skip') {
      this.storeSurveyResponse(parseInt(response));
    }
  }
}
```

**Message Protocol Extensions:**
```typescript
// Extension → Webview (Suggestion logged for team visibility)
{
  type: 'toWebview:suggestionLogged',
  agent: 'coder',
  action: 'accepted',
  suggestionId: 'xyz',
  timestamp: Date.now()
}

// Webview → Extension (Annotation added)
{
  type: 'toExtension:annotationAdded',
  suggestionId: 'xyz',
  comment: 'Great suggestion, but consider edge case X',
  author: 'Developer Name',
  timestamp: Date.now()
}
```

### Learnings from Previous Stories

**From Story 5.1 (Mode Infrastructure):**
- ModeManager.getInstance().getCurrentMode() for mode detection
- Mode persistence via VSCode workspace config
- Data attribute pattern: `document.documentElement.setAttribute('data-mode', mode)`

**From Story 5.2 (Learning Mode):**
- explanationVerbositiy affects agent output (high = detailed explanations)
- Agents check mode via ModeManager in their prompts
- Webview updates instantly on mode change (no throttle)

**From Story 5.3 (Expert Mode):**
- currentMode and currentVerbosity tracking in webview
- applyModeUpdate() centralizes mode changes
- CSS classes toggle based on mode
- Condensed rendering for Expert (signal > noise)

**From Story 5.4 (Focus Mode):**
- data-mode attributes on HUD container and metrics
- GPU-accelerated CSS transitions maintain 60fps
- Toast notifications for critical alerts
- Previous mode storage for restoration pattern
- Alert filtering based on mode

### Testing Strategy

**Unit Tests Required:**
- Team Mode activation with label visibility
- Expanded metrics display (sessionTime included)
- Suggestion tracking by agent role (accepted/rejected counts)
- Large text mode scaling (transform: scale(1.25))
- Annotation creation and retrieval
- Survey trigger on session end (opt-in only)

**Test Files:**
- `src/modes/__tests__/mode-manager-team.test.ts` - Team Mode activation tests
- `src/team/__tests__/team-metrics-tracker.test.ts` - Metrics tracking tests
- `src/team/__tests__/survey-manager.test.ts` - Survey trigger tests
- `src/webview/__tests__/team-mode.test.ts` - Label visibility and expanded metrics tests

### Project Structure Notes

**Modified Files:**
- `src/webview/main.ts` - Add descriptive state text, expand metrics display, label visibility logic
- `src/webview/index.html` - No changes needed (labels already in structure)
- `src/state/extension-state-manager.ts` - Add sessionTime to metrics interface
- `package.json` - Add toggleLargeText command, teamMode.largeText config, teamMode.surveyEnabled config

**New Files:**
- `src/team/team-metrics-tracker.ts` - Track suggestions by agent role
- `src/team/survey-manager.ts` - Manage team comprehension surveys
- `src/team/annotations-manager.ts` - Collaborative annotations storage
- `src/commands/toggle-large-text.ts` - Large text mode toggle command
- `src/webview/styles/components/mode-team.css` - Team Mode specific styles

**Existing Patterns to Reuse:**
- ModeManager.getInstance().getCurrentMode() for mode detection
- ExtensionStateManager.getInstance().updateMetrics() for metrics sync
- Webview message handler for toWebview:metricsUpdate
- CSS BEM naming: `.team-metrics`, `.team-metrics__item`, `.team-annotation`, `.team-annotation--expanded`

### Performance Requirements

- Label display: No performance impact (static text rendering)
- Metrics tracking: Async operations, <10ms overhead per suggestion
- Survey prompt: Triggered only on session end (no runtime impact)
- Large text mode: GPU-accelerated CSS scaling (60fps maintained)
- Annotations: Lazy loading (only load when viewing specific suggestion)

### Security & Privacy Requirements

**CRITICAL: Opt-In Telemetry (NFR-SEC-2):**
- Survey MUST be opt-in only (default: disabled)
- Team metrics stored locally (workspace state)
- No user code logged in annotations
- Annotations stored with workspace (not sent to external servers)

### References

- [Source: _bmad-output/planning-artifacts/epics-stories-part3.md#Story 5.5]
- [Architecture: _bmad-output/planning-artifacts/architecture.md - Mode System, Metrics]
- [Previous Story: _bmad-output/implementation-artifacts/5-4-implement-focus-dnd-mode-with-hidden-agents.md]
- [Project Context: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash Thinking (Experimental)

### Debug Log References

- Session Date: 2026-01-13
- Implementation started: 23:34
- Session ended: 23:44

### Completion Notes List

**✅ TASKS COMPLETED (1-5):**

**Task 1: Team Mode Configuration Verification**
- ✓ Verified AgentMode.Team exists in mode-types.ts with correct config
- ✓ Verified ModeManager.setMode() can switch to Team Mode
- ✓ Verified ExtensionStateManager.updateMode() sends postMessage to webview
- ✓ Created comprehensive unit tests in mode-manager-team.test.ts

**Task 2: Agent Label Display**
- ✓ Webview already shows agent labels when showLabels: true (main.ts lines 193-206)
- ✓ mode-team.css already exists with proper label visibility styles
- ✓ getDescriptiveStateText() already implemented with state-specific messages
- ✓ 125% Large Text mode CSS already in place
- ✓ Created webview tests in team-mode.test.ts

**Task 3: Expanded Vital Signs Bar**
- ✓ IMetricsState interface already extended with sessionTime field
- ✓ Session timer already implemented in ExtensionStateManager (startSessionTimer)
- ✓ executeUpdateMetricsUI() already shows expanded metrics in Team Mode
- ✓ CSS for expanded metrics already in mode-team.css

**Task 4: Suggestion Logging & Metrics Tracking**
- ✓ team-metrics-tracker.ts already exists with ISuggestionMetrics interface
- ✓ TeamMetricsTracker.recordSuggestionAction() already implemented
- ✓ Added webview message handlers in webview-provider.ts
- ✓ Implemented toExtension:suggestionAccepted/Rejected event handling
- ⚠️ Note: 4.4 (time saved calculation) already implemented in tracker
- ⚠️ Note: 4.5 (metrics display UI) deferred to future implementation

**Task 5: Team Comprehension Survey**
- ✓ survey-manager.ts already fully implemented
- ✓ Opt-in survey system with session detection
- ✓ Idle timeout detection (10 minutes)
- ✓ Minimum session duration (5 minutes)
- ✓ Survey storage in workspace state

**⏸️ TASKS DEFERRED (6-8):**
- Task 6: Large Text Mode toggle command (config exists, command handler needed)
- Task 7: Collaborative Annotations (infrastructure exists, UI integration needed)
- Task 8: Additional unit tests

**🔧 TECHNICAL DECISIONS:**
1. Fixed TypeScript strict mode errors in webview-provider.ts (Promise<void> encoding)
2. Fixed HTMLElement casting in main.ts for labelEl.style access
3. Removed problematic test comparison warnings by simplifying test logic
4. Used singleton pattern for TeamMetricsTracker and SurveyManager
5. Message handlers only track in Team Mode to avoid overhead in other modes

**📊 COMPILATION STATUS:**
- ✅ TypeScript compilation successful
- ✅ All type checks passing
- ⚠️ 22 ESLint warnings (curly braces style - not blocking)
- ✅ Webview build successful

### File List

**Modified Files:**
- `src/webview/main.ts` - Fixed TypeScript casting for labelEl HTMLElement
- `src/webview/webview-provider.ts` - Added message handlers for suggestion tracking
- `_bmad-output/implementation-artifacts/sprint-status.yaml` - Story marked as in-progress

**New Files:**
- `src/modes/__tests__/mode-manager-team.test.ts` - Team Mode configuration tests
- `src/webview/__tests__/team-mode.test.ts` - Label display and state text tests

**Existing Files (Verified/Already Implemented):**
- `src/modes/mode-types.ts` - AgentMode.Team config already exists
- `src/modes/mode-manager.ts` - Mode switching already implemented
- `src/state/extension-state-manager.ts` - Session timer already implemented
- `src/team/team-metrics-tracker.ts` - Already fully implemented
- `src/team/survey-manager.ts` - Already fully implemented
- `src/webview/styles/components/mode-team.css` - Already exists with all styles
