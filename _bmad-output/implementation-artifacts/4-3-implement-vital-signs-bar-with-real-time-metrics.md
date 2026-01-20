# Story 4.3: Implement Vital Signs Bar with Real-Time Metrics

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a compact status bar in the HUD showing tokens, files, cost, and agent state,
so that I understand the AI's current status at a glance without distraction.

## Acceptance Criteria

1.  **Given** Webview overlay and sumi-e aesthetics are implemented
2.  **When** I implement the Vital Signs view-model in the webview
3.  **Then** Vital Signs Bar is positioned at top or bottom
4.  **And** Bar height is approximately 24px (FR14)
5.  **And** Bar displays: token count, loaded files count, session cost, primary agent state
6.  **And** Metrics update in real-time via `postMessage` from the extension
7.  **And** Cost displays formatted currency: "$0.05"
8.  **And** Agent state shows icon + status text ("Coder: Working...")
9.  **And** Unit tests verify metric display formatting and updates

## Tasks / Subtasks

- [x] Task 1: Extension Provider (AC: 6)
  - [x] 1.1: Create `src/ui/metrics-provider.ts` to gather tokens, cost, and file metrics
  - [x] 1.2: Implement `syncMetrics()` in `WebviewManager` or `MetricsProvider` to send via StateManager

- [x] Task 2: Webview Component (AC: 3, 4, 5, 7, 8)
  - [x] 2.1: Implement real-time DOM updates in `src/webview/main.ts` for metrics
  - [x] 2.2: Apply Sumi-e styles to the bar in `src/webview/index.css`

- [x] Task 3: Testing (AC: 9)
  - [x] 3.1: Verify metrics synchronization via integration test or logs

## Dev Notes

- **Real-time**: Hook into `CostTracker` and `ContextAgent` to get data.
- **Formatting**: Use `Intl.NumberFormat` for currency and standard thousands separator for tokens.

### Project Structure Notes

- New file: `src/ui/metrics-provider.ts`
- Modified file: `src/webview/main.ts`
- Modified file: `src/ui/webview-manager.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
