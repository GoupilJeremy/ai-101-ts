# Story 8.8: Implement Team Adoption and Comprehension Tracking for Tech Leads

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Tech Lead (Priya),
I want to track my team's adoption of the AI tool and their comprehension progress,
so that I can measure the ROI of the tool, ensure code quality is improving, and identify areas where my team needs coaching.

## Acceptance Criteria

1. **Given** The extension is active and collecting metrics (Story 8.2, 8.4, 8.5)
2. **When** The user accesses the "Team / ROI Metrics" view
3. **Then** The system displays an "Adoption Score" based on consistency of usage (Daily Active Sessions).
4. **And** The system displays a "Comprehension Trend" graph aggregating data from Learning Surveys (8.5) and Session Surveys (8.4).
    - *Note: In this MVP/local-only architecture, this reflects the local user's data, formatted for reporting.*
5. **And** The system displays a "Quality Impact" metric showing Suggestion Acceptance Rate and "Why" (Reasoning) view frequency.
6. **When** The user selects "Generate Team Report"
7. **Then** A detailed Markdown/HTML report is generated containing:
    - Executive Summary of AI Usage
    - Learning Progress & Comprehension Scores
    - Usage Frequency & Mode Distribution (e.g., % time in Team Mode vs Solo)
    - Code Quality Impact (Acceptance Rate)
8. **And** The report explicitly warns that it contains local data only (privacy first).
9. **And** The system tracks "Team Mode" specific interactions (e.g., duration in Team Mode) separately from Solo modes.
10. **And** Unit tests verify metric aggregation and report generation logic.

## Tasks / Subtasks

- [x] Task 1: Implement Team Metrics Aggregation Logic
  - [x] Create `TeamMetricsService` (or extend `MetricsService`).
  - [x] Implement `calculateAdoptionScore()`: Logic based on frequency of sessions (sessions/week) and feature utilization breadth.
  - [x] Implement `calculateComprehensionTrend()`: Moving average of survey scores (from `SurveyService`).
  - [x] Implement `calculateQualityImpact()`: Composite of Acceptance Rate and Reasoning View count.
  - [x] Implement `trackTeamModeSession(duration)`: Specific tracking for Team Mode usage.

- [x] Task 2: Implement Report Generator
  - [x] Create `ReportGeneratorService`.
  - [x] Implement `generateMarkdownReport(metrics)`: meaningful text summary + tables.
  - [x] Implement `generateJSONReport(metrics)`: portability for aggregation by leads.

- [x] Task 3: Dashboard / UI Integration
  - [x] Update Metrics Dashboard (from Story 8.2) or create new "Reports" view.
  - [x] Add "Team & Analytics" section/tab.
  - [x] Add "Generate Report" button/command (`ai-101.generateTeamReport`).
  - [x] Visualize "Comprehension Trend" (simple chart or ASCII bar in text report).

- [x] Task 4: Telemetry & privacy
  - [x] Define event `report.generated`.
  - [x] Payload: `report_type` ("team_adoption"), `period_days` (7, 30).
  - [x] Ensure NO specific code or personal identifiers in telemetry event (just "report generated").

## Dev Notes

### Architecture & Patterns
- **Service Pattern**: `TeamMetricsService` should consume data from `MetricsService` and `SurveyService` (or persisted state).
- **Data Source**: Since we have no central backend, "Team" data is effectively "My Contribution to the Team" or "My Personal Growth" formatted for a Lead.
  - If the user IS the Tech Lead, they might import JSON reports from others? *Out of scope for this strict story unless specified, assume "Local Report Generation" is the MVP step.*
  - PRD FR59 "Users can generate usage and learning reports" supports this.
- **Privacy**: Emphasize that reports are generated LOCALLY. User must manually share them. This aligns with "Privacy First" NFR.

### Project Structure
- `src/telemetry/team-metrics-service.ts`
- `src/telemetry/report-generator-service.ts`
- `src/telemetry/__tests__/team-metrics.test.ts`
- `src/commands/report-commands.ts` (for the generation command)

### Previous Story Intelligence (Story 8.7, 8.6, 8.5)
- **State Persistence**: reuse `context.globalState` patterns used in 8.7 (Distraction) and 8.6 (NPS) for storing historical trend data if `MetricsService` doesn't keep enough history.
- **Survey Data**: Need access to stored survey results. Check if `SurveyService` exposes a history getter. If not, might need to refactor `SurveyService` to allow access (Task 1 dependency).

### References
- [Story 8.2: Metrics Dashboard](_bmad-output/implementation-artifacts/8-2-implement-usage-metrics-collection-and-display.md)
- [Story 8.5: Weekly Surveys](_bmad-output/implementation-artifacts/8-5-implement-weekly-learning-progress-surveys.md)

## Dev Agent Record

### Agent Model Used
Claude 3.5 Sonnet (via Antigravity)

### Debug Log References
N/A

### Completion Notes List
- ✅ Implemented TeamMetricsService with adoption score calculation (sessions/week + feature breadth)
- ✅ Implemented comprehension trend calculation with weekly moving averages
- ✅ Implemented quality impact scoring (70% acceptance rate + 30% reasoning views)
- ✅ Implemented team mode session tracking with duration and count
- ✅ Created ReportGeneratorService with Markdown and JSON report generation
- ✅ Added privacy warnings and interpretive guidance in reports
- ✅ Integrated report commands into extension.ts with telemetry
- ✅ All tests passing (11/11 for ReportGeneratorService)

### File List
- src/telemetry/team-metrics-service.ts (new)
- src/telemetry/report-generator-service.ts (new)
- src/commands/report-commands.ts (new)
- src/telemetry/__tests__/team-metrics.test.ts (new)
- src/telemetry/__tests__/report-generator.test.ts (new)
- src/extension.ts (modified - added TeamMetricsService and ReportGeneratorService initialization)
