# Story 8.3: Implement Suggestion Acceptance Rate Tracking

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a product manager,
I want to track suggestion acceptance rates across users,
so that I can measure AI suggestion quality and identify improvement areas.

## Acceptance Criteria

1. **Given** Telemetry is enabled and user has consented to product improvement data
2. **When** Users accept or reject suggestions
3. **Then** Acceptance rate calculated: accepted / (accepted + rejected) × 100
4. **And** Target acceptance rate documented: >60% (NFR27)
5. **And** Acceptance rate tracked per agent type (Coder, Architect, etc.)
6. **And** Acceptance rate tracked per mode (Learning, Expert, etc.)
7. **And** Acceptance rate tracked per suggestion type (completion, refactor, fix)
8. **And** Anonymized aggregate data sent to telemetry backend (user_id hashed)
9. **And** Low acceptance rate triggers investigation workflow for product team
10. **And** Tech leads can view team acceptance rates (if team telemetry enabled)
11. **And** Individual user acceptance rate visible in personal metrics dashboard
12. **And** Unit tests verify acceptance rate calculation and aggregation

## Tasks / Subtasks

- [x] Task 1: Implement Acceptance Rate Calculation Logic (AC: 3, 5, 6, 7)
  - [x] Update `MetricsService` (or create `AnalyticsService` if strictly separating) to track granular counts:
    - By Agent (Coder, Architect, Reviewer)
    - By Mode (Learning, Expert, etc.)
    - By Suggestion Type
  - [x] Implement calculation method `getAcceptanceRate(dimension?)`.

- [x] Task 2: Implement Telemetry Reporting (AC: 1, 2, 8)
  - [x] Update `TelemetryService` (or use existing) to handle `suggestion.feedback` events with dimensions.
  - [x] Ensure `MetricsService` invokes `TelemetryService.trackEvent` when suggestions are accepted/rejected (if opt-in).
  - [x] Verify payload contains NO code, only metadata (AgentID, Mode, boolean accepted).

- [x] Task 3: Update Metrics Dashboard (AC: 11)
  - [x] Update `MetricsCommand` / `DashboardProvider` to pass acceptance rate data to webview.
  - [x] Add visual representation of Acceptance Rate (e.g., circular progress or bar chart) in the Dashboard.
  - [x] Display breakdown by Agent if valid data exists.

- [x] Task 4: Testing & Validation (AC: 12)
  - [x] Unit tests for multi-dimensional rate calculation.
  - [x] Verify Telemetry events are fired correctly (using Mocks).
  - [x] Manual verification of Dashboard display.

## Dev Notes

- **Architecture**:
    - `MetricsService` (local) holds the raw counts/history.
    - `TelemetryService` (remote) receives *events* or *aggregates*. 
    - Suggestion Lifecycle: `SuggestionService` -> `MetricsService.record(...)` -> `TelemetryService.track(...)`.
- **Privacy**:
    - Strict check: `telemetryService.isEnabled()` before sending.
    - Dashboard shows *local* data regardless (user's own data), but *sending* it requires opt-in.
- **Data Structure**:
    - Extend `MetricsStorage` schema to support breakdown keys (e.g., `counts: { total: { accepted: 10, rejected: 2 }, agents: { coder: { ... } } }`).

### Project Structure Notes

- `src/telemetry/metrics-service.ts` (Modify to add dimensions)
- `src/telemetry/analytics-utils.ts` (Optional: Separation for calculation logic)
- `src/webview/dashboard/` (Update UI)
- `src/telemetry/telemetry-events.ts` (Update event definitions)

### References

- [Architecture Document](_bmad-output/planning-artifacts/architecture.md) - Section 9 (Telemetry)
- [Story 8.2](_bmad-output/implementation-artifacts/8-2-implement-usage-metrics-collection-and-display.md) (Metrics Foundation)
- [Story 8.1](_bmad-output/implementation-artifacts/8-1-implement-opt-in-telemetry-system-with-privacy-controls.md) (Telemetry Foundation)

## Dev Agent Record

### Agent Model Used

Antigravity (Google Deepmind)

### Debug Log References

### Completion Notes List

- ✅ Extended `IUsageMetrics` interface to include `dimensionalStats` with breakdowns by agent, mode, and type
- ✅ Implemented `ISuggestionContext` interface for tracking suggestion metadata
- ✅ Updated `MetricsService.recordSuggestionAccepted()` and `recordSuggestionRejected()` to accept optional context parameter
- ✅ Implemented `updateDimensionalStats()` private method to track granular counts across all dimensions
- ✅ Implemented `getAcceptanceRate(filter?)` method with support for overall and dimensional filtering
- ✅ Implemented `getDimensionalBreakdown(dimension)` method to get acceptance rates by agent, mode, or type
- ✅ Integrated `TelemetryService` into `MetricsService` to send `suggestion.accepted` and `suggestion.rejected` events
- ✅ Verified telemetry events contain NO user code - only metadata (agent, mode, type, linesCount, timeSavedMs)
- ✅ Updated metrics dashboard to fetch and display acceptance rate with agent breakdown
- ✅ Added visual progress bars for agent-level acceptance rates in dashboard
- ✅ Created comprehensive unit tests with proper mocking of MetricsStorage and TelemetryService
- ✅ Verified acceptance rate calculation accuracy (50%, 100%, 0%, dimensional breakdowns)
- ✅ Verified telemetry integration and data sanitization (no code in events)

### File List

- `src/telemetry/metrics.interface.ts` (modified - added dimensional interfaces)
- `src/telemetry/metrics-service.ts` (modified - added acceptance rate tracking and telemetry integration)
- `src/commands/metrics-commands.ts` (modified - updated dashboard to show acceptance rate breakdowns)
- `src/telemetry/__tests__/acceptance-rate.test.ts` (new - comprehensive unit tests)
- `vitest.config.ts` (new - vitest configuration)
- `src/__mocks__/vscode.ts` (new - VSCode API mock for testing)
- `package.json` (modified - added test:unit script)

