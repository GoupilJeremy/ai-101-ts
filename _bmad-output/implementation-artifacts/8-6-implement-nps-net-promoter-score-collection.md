# Story 8.6: Implement NPS (Net Promoter Score) Collection

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a product manager,
I want to measure Net Promoter Score periodically,
so that I understand user satisfaction and likelihood to recommend the tool.

## Acceptance Criteria

1. **Given** User has used extension for at least 30 days
2. **When** 30 days have passed since installation or last NPS survey
3. **Then** NPS survey prompt appears with standard question: "How likely are you to recommend Suika to a colleague?" (0-10 scale)
4. **And** Follow-up question: "What is the primary reason for your score?" (freeform text)
5. **And** NPS calculation: % Promoters (9-10) - % Detractors (0-6) = NPS (Backend concern, but frontend must send valid data)
6. **And** Target NPS documented for product goals
7. **And** NPS scores tracked over time to measure improvement
8. **And** Detractor responses flagged for immediate product team review (via telemetry)
9. **And** Promoter responses used for testimonials (with consent)
10. **And** Survey is respectful of user time (short, optional)
11. **And** NPS opt-out available in telemetry settings
12. **And** Unit tests verify NPS calculation (categorization) and response categorization

## Tasks / Subtasks

- [x] Task 1: Extend SurveyService for NPS Scheduling (AC: 1, 2)
  - [x] Reuse `survey.firstUsageDate` (from Story 8.5) as installation date proxy
  - [x] Implement `survey.nps.lastShown` and `survey.nps.snoozedUntil` persistence
  - [x] Implement `checkNPSEligibility()`:
    - `Date.now() - firstUsageDate > 30 days`
    - `Date.now() - lastShown > 30 days`
    - `Date.now() > snoozedUntil` (Standard 24h snooze if dismissed)
  - [x] Integrate into `checkAndPrompt()`: Prioritize Weekly > NPS? Or NPS > Weekly?
    - *Decision*: NPS is rarer (monthly) and high value. Priority: NPS > Weekly > Post-Session.

- [x] Task 2: Implement NPS UI Flow (AC: 3, 4, 10)
  - [x] Create `showNPSSurvey()` method:
    - [x] Initial Prompt: "Quick question: How likely are you to recommend Suika?" (Options: "Answer", "Snooze", "Never")
    - [x] QuickPick (0-10) with labels (0=Not Likely, 10=Very Likely)
    - [x] InputBox: "What is the primary reason for your score?" (Optional)
  - [x] Handle "Never": Set flag to disable NPS permanently (Opt-out for this specific survey type)

- [x] Task 3: Integrate Telemetry (AC: 5, 7, 8, 11)
  - [x] Define event `survey.nps`
  - [x] Payload: `score` (0-10), `reason`, `category` (Promoter/Passive/Detractor), `days_since_install`
  - [x] Helper method `categorizeNPS(score)`: 9-10=Promoter, 7-8=Passive, 0-6=Detractor
  - [x] Ensure `telemetryService.isTelemetryEnabled()` check passes

- [x] Task 4: Testing (AC: 12)
  - [x] Unit tests for 30-day eligibility logic
  - [x] Unit tests for NPS categorization logic
  - [x] Unit tests for priority handling (NPS vs Weekly vs Post-Session)

## Dev Notes

### Architecture & Patterns
- **Service Extension**: Continue extending `SurveyService` patterns from Story 8.4 and 8.5.
- **State Keys**:
  - `survey.nps.lastShown`
  - `survey.nps.snoozedUntil`
  - `survey.nps.optOut` (If user selects "Never" or similar)
- **Telemetry**: Ensure strict PII scrubbing on the "reason" field (although standard implementation usually just sends string, verify no code snippets included).

### Project Structure
- Modify `src/telemetry/survey-service.ts`
- Modify `src/telemetry/__tests__/survey-service.test.ts`
- Modify `src/telemetry/telemetry-events.ts` (if types defined there)

### References
- [Story 8.5: Weekly Surveys](_bmad-output/implementation-artifacts/8-5-implement-weekly-learning-progress-surveys.md)
- [Story 8.4: Post-Session Surveys](_bmad-output/implementation-artifacts/8-4-implement-post-session-comprehension-surveys.md)
- [NPS Definition](https://www.netpromotersystem.com/about/measuring-your-net-promoter-score/)

## Dev Agent Record

### Agent Model Used
Antigravity

### Debug Log References
N/A

### Completion Notes List

#### Task 1: NPS Scheduling Implementation
- ✅ Added NPS constants: `NPS_INTERVAL` (30 days) and `NPS_MIN_USAGE_DAYS` (30 days)
- ✅ Implemented `checkNPSEligibility()` method with comprehensive checks:
  - User must have used extension for at least 30 days
  - At least 30 days must have passed since last NPS survey
  - Survey must not be snoozed
  - User must not have opted out
- ✅ Integrated NPS check into `checkAndPrompt()` with priority: NPS > Weekly > Post-Session
- ✅ Reused existing `survey.firstUsageDate` from Story 8.5

#### Task 2: NPS UI Flow
- ✅ Implemented `showNPSSurvey()` method with VSCode native UI:
  - Initial prompt with "Answer", "Snooze", "Never" options
  - QuickPick for score selection (0-10 scale with labels)
  - InputBox for optional reason (with PII warning)
- ✅ Implemented snooze functionality (24-hour delay)
- ✅ Implemented permanent opt-out via "Never" option

#### Task 3: Telemetry Integration
- ✅ Implemented `categorizeNPS()` helper method:
  - Score 9-10: Promoter
  - Score 7-8: Passive
  - Score 0-6: Detractor
- ✅ Integrated telemetry event `survey.nps` with payload:
  - `score`: User's rating (0-10)
  - `reason`: Sanitized feedback text
  - `category`: Promoter/Passive/Detractor
  - `days_since_install`: Days since first usage
- ✅ Applied PII sanitization to reason field
- ✅ Respects telemetry opt-out settings

#### Task 4: Testing
- ✅ Added 11 new test cases for NPS functionality:
  - 7 tests for eligibility logic (30-day checks, snooze, opt-out)
  - 3 tests for NPS categorization
  - 1 test for survey priority (NPS > Weekly)
- ✅ All 32 tests passing (including existing 21 tests)

### File List

- Modified: `src/telemetry/survey-service.ts`
- Modified: `src/telemetry/__tests__/survey-service.test.ts`
