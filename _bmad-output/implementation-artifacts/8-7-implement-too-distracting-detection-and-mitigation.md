# Story 8.7: Implement "Too Distracting" Detection and Mitigation

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a product manager,
I want to detect when users find the HUD distracting,
so that I can proactively adjust defaults or offer solutions.

## Acceptance Criteria

1. **Given** Telemetry is enabled
2. **When** User behaviors indicate distraction
3. **Then** Distraction signals detected:
   - HUD hidden within 5s of activation (3+ times)
   - Focus Mode activated frequently (>50% of sessions)
   - Transparency increased to maximum
   - Animations disabled or Performance Mode active
4. **And** Target metric: 0 "too distracting" reports (NFR30)
5. **And** When distraction detected, offer help: "Seems like HUD might be distracting. Want tips?"
6. **And** Tips include: customization options, Focus Mode shortcuts, transparency settings
7. **And** Product team tracks distraction rate across user segments
8. **And** High distraction rates trigger UX review of default settings
9. **And** Unit tests verify distraction signal detection logic

## Tasks / Subtasks

- [x] Task 1: Implement Distraction Detection Logic
  - [x] Create `DistractionDetectorService` implementing `IDisposable`
  - [x] Implement signal tracking:
    - [x] Track HUD open duration (start time on open, diff on close)
    - [x] Count "quick closes" (< 5s) in `globalState` (`distraction.quickCloseCount`)
    - [x] Track Focus Mode usage per session (`distraction.focusSessions`, `distraction.totalSessions`)
    - [x] Monitor configuration changes for Transparency/Performance Mode
  - [x] Implement `checkForDistraction()` evaluation logic:
    - [x] Trigger on significant events (3rd quick close, session end)
    - [x] Check thresholds (Quick Close >= 3, Focus Ratio > 0.5)

- [x] Task 2: Implement User Mitigation Flow
  - [x] Create `promptDistractionHelp()` method:
    - [x] Show Information Message: "Seems like HUD might be distracting. Want tips?"
    - [x] Options: "See Tips", "No, thanks", "Don't ask again"
  - [x] Handle "See Tips":
    - [x] Show QuickPick with actions: "Turn on Focus Mode", "Adjust Transparency", "Disable Animations", "Configure Hotkeys"
    - [x] Execute selected action or open relevant settings
  - [x] Handle "Don't ask again": Set persistent flag to silence future prompts

- [x] Task 3: Telemetry Integration
  - [x] Define event `distraction.detected`
  - [x] Payload: `signal_type` ("quick_close", "focus_usage", "settings_change"), `trigger_value`, `action_taken`
  - [x] Ensure strict privacy (no code data)

- [x] Task 4: Testing
  - [x] Unit tests for `DistractionDetectorService`:
    - [x] Simulate rapid open/close sequence -> verify counter increment
    - [x] Simulate session start/end with Focus Mode -> verify ratio calc
    - [x] Verify threshold triggers
    - [x] Verify "Don't ask again" suppression

## Dev Notes

### Architecture & Patterns
- **Service Pattern**: New service `DistractionDetectorService`. Should be instantiated in `extension.ts` or managed by a service container.
- **Event Listening**:
  - Needs to subscribe to `ExtensionStateManager` or similar for HUD/Agent state changes.
  - Needs to listen to `vscode.workspace.onDidChangeConfiguration`.
- **State Persistence**:
  - Use `context.globalState` for long-term counters (Quick Close count, Session stats).
  - IMPORTANT: Reset "Quick Close" counter after a successful "long" usage to avoid false positives? Or just cap it? Original AC says "3+ times", implies cumulative or within a window. Be reasonable: maybe reset if user keeps it open for > 1 min? Or just simple counter is fine for MVP.
- **Privacy**:
  - Telemetry events should valid NFR13/14 (Opt-in, no sensitive data). Sending "distraction detected" is generic metadata.

### Project Structure
- Create `src/telemetry/distraction-detector.ts`
- Create `src/telemetry/__tests__/distraction-detector.test.ts`
- Update `src/extension.ts` to register the service.

### References
- [Story 8.6: NPS Collection](_bmad-output/implementation-artifacts/8-6-implement-nps-net-promoter-score-collection.md) (Similar pattern for state/prompting)
- [Story 8.5: Weekly Surveys](_bmad-output/implementation-artifacts/8-5-implement-weekly-learning-progress-surveys.md)

## Dev Agent Record

### Agent Model Used
Antigravity

### Debug Log References
N/A

### Completion Notes List
- Implemented `DistractionDetectorService` to track HUD usage patterns.
- Added event emitters to `ExtensionStateManager` for real-time visibility and mode tracking.
- Implemented distraction signals: "Quick Closes" (<5s) and frequent Focus Mode usage.
- Added user mitigation flow with tips on how to reduce HUD distraction.
- Integrated telemetry event `distraction.detected` with privacy-safe payloads.
- Added comprehensive unit tests in `src/telemetry/__tests__/distraction-detector.test.ts`.

### File List
- `src/state/extension-state-manager.ts` (modified: added EventEmitter and state update events)
- `src/telemetry/distraction-detector.ts` (new)
- `src/telemetry/__tests__/distraction-detector.test.ts` (new)
- `src/extension.ts` (modified: registered DistractionDetectorService)
