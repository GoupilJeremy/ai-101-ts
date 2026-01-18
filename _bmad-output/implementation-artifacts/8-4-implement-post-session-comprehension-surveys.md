# Story 8.4: Implement Post-Session Comprehension Surveys

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a product manager,
I want optional post-session surveys measuring comprehension,
so that I can validate the transparency goal with real user feedback.

## Acceptance Criteria

1. **Given** Session ends (extension deactivates or VSCode closes) - *Implementation Note: Trigger on next activation referencing previous session to avoid blocking shutdown*
2. **When** User has used AI features during session
3. **Then** 20% of sessions trigger post-session survey prompt (random sampling)
4. **And** Survey asks: "How well did you understand the AI's suggestions today?" (1-10 scale)
5. **And** Survey asks: "What was unclear or confusing?" (optional freeform text)
6. **And** Target comprehension score documented: 8/10 average (NFR28)
7. **And** Survey is non-blocking and dismissible (does not interrupt workflow)
8. **And** Survey responses stored with session metadata (mode, agent usage, context size)
9. **And** Low comprehension scores flag specific sessions for UX research
10. **And** Survey opt-out available in telemetry settings
11. **And** Anonymized responses aggregated for product insights
12. **And** Unit tests verify survey triggering logic and response storage

## Tasks / Subtasks

- [x] Task 1: Implement Survey Service & State Management (AC: 1, 3, 7)
  - [x] Create `src/telemetry/survey-service.ts` with `SurveyService` class
  - [x] Implement session tracking: start time, interaction count, feature usage
  - [x] Implement sampling logic: `return Math.random() < 0.2` (20% probability)
  - [x] Implement persistence using `ExtensionContext.globalState`:
    - `survey.lastShownDate`: Timestamp
    - `survey.pendingSurvey`: Boolean (if decided to prompt on next launch)
    - `session.stats`: Metadata from previous session for context
  - [x] Implement `checkAndPrompt()` method to be called on extension activation

- [x] Task 2: Implement Survey UI Flow (AC: 4, 5, 7)
  - [x] Create `showComprehensionSurvey()` method using VSCode Native UI:
    - [x] `window.showInformationMessage("Would you mind answering...", "Yes", "No")` (Non-blocking)
    - [x] `window.showQuickPick(["1 (Poor)", "10 (Excellent)"])` for rating
    - [x] `window.showInputBox` for optional feedback
  - [x] Ensure "No" or dismissal respects user choice and clears pending state

- [x] Task 3: Integrate Telemetry & Metadata (AC: 8, 9, 11)
  - [x] Define telemetry event `survey.comprehension` in `telemetry-events.ts`
  - [x] Collect session metadata:
    - Active Mode (Learning, Expert, etc.)
    - Agent Usage (e.g., "Architect used: true")
    - Context Size (tokens)
  - [x] Sanitize freeform text (check for obvious PII/Code if possible, or warn user)
  - [x] Send event via `TelemetryService.trackEvent(eventName, properties, measurements)`

- [x] Task 4: Opt-Out & privacy (AC: 10)
  - [x] Check `telemetryService.isTelemetryEnabled()` before showing/sending
  - [x] Respect `ai101.telemetry.enabled` setting
  - [x] Add "Don't show again" option in survey prompt if needed? (Not explicitly in AC, but good UX)

- [x] Task 5: Testing (AC: 12)
  - [x] Unit tests for sampling logic (mock `Math.random`)
  - [x] Unit tests for state persistence (mock `globalState`)
  - [x] Unit tests for telemetry payload construction

## Dev Notes

- **Implementation Strategy for "Post-Session"**:
  - Detecting the *exact* moment a session ends (VSCode close) and showing UI is impossible in VSCode API as the window destroys itself.
  - **Selected Approach**: "Next Launch" Survey.
    - During usage, track if session meets criteria (e.g., >5 min, >3 suggestions).
    - On `deactivate()`, set `pendingSurvey = true` (based on 20% roll).
    - On `activate()`, check `pendingSurvey`. If true, show notification: "How was your last session?".
    - This ensures non-blocking behavior and accurate data capture without racing against shutdown.

- **Architecture**:
  - `SurveyService` depends on `TelemetryService` and `ExtensionStateManager`.
  - `ExtensionContext` passed to `SurveyService` for `globalState` access.
  - Keep UI native (Message/QuickPick) to avoid "distraction" of opening a full Webview just for a survey.

- **Data Privacy**:
  - Freeform text is risky. Add placeholder: "Please do not include personal data or code snippets."

### Project Structure Notes

- `src/telemetry/survey-service.ts` (New Service)
- `src/telemetry/telemetry-events.ts` (Update)
- `src/extension.ts` (Update `activate` to call `surveyService.checkAndPrompt()`, `deactivate` to call `surveyService.endSession()`)

### References

- [Story 8.1 - Telemetry Foundation](_bmad-output/implementation-artifacts/8-1-implement-opt-in-telemetry-system-with-privacy-controls.md)
- [Architecture - Telemetry Section](_bmad-output/planning-artifacts/architecture.md)
- [VSCode API - GlobalState](https://code.visualstudio.com/api/references/vscode-api#Memento)

## Dev Agent Record

### Agent Model Used

Antigravity (Google Deepmind)

### Debug Log References

### Completion Notes List

- ✅ Created `SurveyService` class with session tracking (start time, interaction count, feature usage)
- ✅ Implemented 20% sampling logic using `Math.random() < 0.2`
- ✅ Implemented state persistence using `ExtensionContext.globalState` for pending surveys and session stats
- ✅ Implemented minimum session criteria (3+ interactions, 5+ minutes duration)
- ✅ Created `checkAndPrompt()` method for activation-time survey display
- ✅ Implemented non-blocking VSCode native UI flow (showInformationMessage → showQuickPick → showInputBox)
- ✅ Integrated with `TelemetryService` for event tracking
- ✅ Implemented PII sanitization for freeform feedback (emails, API keys, file paths)
- ✅ Added `isEnabled()` and `trackEvent()` methods to `TelemetryService`
- ✅ Integrated `SurveyService` into extension lifecycle (activate/deactivate)
- ✅ Created comprehensive unit tests (11 tests, all passing)
- ✅ Tests cover sampling logic, session tracking, state persistence, and telemetry payload construction
- ✅ Configured vitest with proper VSCode mocking to avoid module loading issues

### File List

- `src/telemetry/survey-service.ts` (new - SurveyService implementation)
- `src/telemetry/__tests__/survey-service.test.ts` (new - comprehensive unit tests)
- `src/telemetry/telemetry-service.ts` (modified - added isEnabled() and trackEvent() methods)
- `src/extension.ts` (modified - integrated SurveyService in activate/deactivate)
- `vitest.config.mts` (modified - added VSCode alias for mocking)
