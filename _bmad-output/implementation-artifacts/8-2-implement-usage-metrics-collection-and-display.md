# Story 8.2: Implement Usage Metrics Collection and Display

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to see my usage metrics (sessions, suggestions, time saved),
so that I understand how I'm using the tool and the value it provides.

## Acceptance Criteria

1.  **Given** Telemetry is enabled, **When** I use the extension, **Then** the system tracks: total sessions, session duration, suggestions requested, suggestions accepted/rejected, and calculated "time saved".
2.  **Given** "Time Saved" metric, **Then** it is calculated as (lines of code accepted * average typing speed constant).
3.  **Given** user runs command "AI-101: View My Metrics", **Then** a Dashboard Webview opens displaying these metrics.
4.  **Given** the Dashboard, **Then** it shows trends (daily/weekly) and an acceptance rate graph.
5.  **Given** the Dashboard, **Then** data is rendered locally and explicitly states if data is being shared (based on Telemetry consent).
6.  **Given** metrics data, **Then** it persists locally across sessions (using `globalStorage`) and survives extension updates.
7.  **Given** the Dashboard, **Then** it allows exporting metrics to JSON.
8.  **Given** privacy requirements, **Then** no user code content is stored in metrics, only counts and metadata.
9.  Unit tests verify calculation logic and storage persistence.

## Tasks / Subtasks

- [x] Task 1: Implement Metrics Storage & Service (AC: 1, 2, 6, 8)
  - [x] Create `src/telemetry/metrics-storage.ts` to handle local JSON persistence in `context.globalStorageUri`.
  - [x] Implement `MetricsService` to record events (SessionStart, sessionEnd, SuggestionCreated, SuggestionAccepted, SuggestionRejected).
  - [x] Implement "Time Saved" calculation logic in `MetricsService`.
  - [x] Integrate `MetricsService` with `ExtensionStateManager` or `TelemetryService` to catch relevant events.

- [x] Task 2: Implement Metrics Dashboard Webview (AC: 3, 4, 5)
  - [x] Create `src/webview/dashboard/` structure (or incorporate into main webview if appropriate, but separate panel recommended for full report).
  - [x] Create `src/commands/metrics-commands.ts` with `ai-101.viewMetrics`.
  - [x] Implement `DashboardProvider` (WebviewViewProvider or Panel) to render the HTML.
  - [x] Add Charting library (e.g., Chart.js or lightweight SVG implementation) to webview.
  - [x] Implement messaging to send metrics data from `MetricsService` to Webview.

- [x] Task 3: Implement Export Functionality (AC: 7)
  - [x] Add "Export to JSON" button in Dashboard.
  - [x] Implement handler to write current metrics store to a user-selected file.

- [x] Task 4: Testing & Privacy Verification (AC: 9)
  - [x] Unit tests for `MetricsService` calculations.
  - [x] Unit tests for `MetricsStorage` read/write.
  - [x] Verify that disabling Telemetry stops metrics collection (if desired behavior) or ensure local-only collection is clearly distinguished. (Follow strict AC: "Given Telemetry is enabled").
  - [x] Verify no PII/Code in stored JSON.

## Dev Notes

-   **Architecture**: `MetricsService` should be distinct from `TelemetryService` (which sends data out). `MetricsService` focuses on *local* user benefit. However, they can share event sources.
-   **Storage**: Use `vscode.FileSystem` with `context.globalStorageUri`. Create a `metrics.json` file there.
-   **Privacy**: Even local metrics must NOT store code snippets. Only counts (e.g., "accepted: 10 lines").
-   **Dependencies**: If adding `Chart.js`, ensure it's compatible with VSCode Webview CSP. Alternatively, use simple CSS/SVG bars if dependencies are restricted.

### Project Structure Notes

-   `src/telemetry/metrics-service.ts`
-   `src/telemetry/metrics-storage.ts`
-   `src/webview/dashboard/` (New directory for dashboard specific assets if needed, or share `src/webview/` resources)
-   `src/commands/metrics-commands.ts`

### References

-   [Architecture Document](_bmad-output/planning-artifacts/architecture.md) - Section 9 "Telemetry & Monitoring"
-   [Epics Document](_bmad-output/planning-artifacts/epics.md) - Story 8.2

## Dev Agent Record

### Agent Model Used

Antigravity (Google Deepmind)

### Debug Log References

### Completion Notes List

- Implemented `MetricsService` and `MetricsStorage` for persistent local tracking of extension usage.
- Created Sumi-e styled Dashboard Webview reached via `AI-101: View My Metrics`.
- Implemented "Time Saved" calculation (10s/line accepted).
- Integrated with suggestion lifecycle (requested, accepted, rejected).
- Added JSON export functionality.
- Verified with unit tests (100% pass for core logic).

### File List

- `src/telemetry/metrics.interface.ts`
- `src/telemetry/metrics-storage.ts`
- `src/telemetry/metrics-service.ts`
- `src/commands/metrics-commands.ts`
- `src/extension.ts` (modified)
- `src/agents/orchestrator.ts` (modified)
- `src/commands/suggestion-commands.ts` (modified)
- `package.json` (modified)
- `src/telemetry/__tests__/metrics-service.test.ts` (new)
