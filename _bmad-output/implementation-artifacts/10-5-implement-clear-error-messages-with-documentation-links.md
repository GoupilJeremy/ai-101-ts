# Story 10.5: Implement Clear Error Messages with Documentation Links

Status: completed

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user encountering an error,
I want error messages that explain the problem and link to solutions,
So that I can resolve issues without external support.

## Acceptance Criteria

1. [x] **Given** Extension encounters an error condition
2. [x] **When** Error is displayed to user
3. [x] **Then** Error message is clear and user-friendly (not technical jargon)
4. [x] **And** Error includes: what happened, why it happened, what to do next
5. [x] **And** Error includes error code for reference (e.g., "Error AI101-LLM-001")
6. [x] **And** Error includes direct link to relevant documentation section (NFR38)
7. [x] **And** Link opens in VSCode Simple Browser or external browser (user preference)
8. [x] **And** Error severity indicated visually (info, warning, error icons)
9. [x] **And** Error messages avoid blame language ("API key not found" not "You forgot API key")
10. [x] **And** Error messages actionable (suggest fix, not just describe problem)
11. [x] **And** Common errors have "Fix it now" buttons that trigger resolution command
12. [x] **And** Error message templates maintained in centralized location for consistency
13. [x] **And** Unit tests verify error message content and documentation link validity

## Tasks / Subtasks

- [x] **Task 1: Design and Implement Centralized Error Registry** (AC: #12, #4, #5)
  - [x] Create `src/errors/error-registry.ts` to define all application errors.
  - [x] Define `IErrorDefinition` interface.
  - [x] Migrate existing error codes from `error-handler.ts` to the new registry.
  - [x] Define standardized templates for all categories (Auth, Network, LLM, Config, UI).

- [x] **Task 2: Refactor ErrorHandler to Use Registry** (AC: #1, #2, #3, #8)
  - [x] Update `ErrorHandler.handleError` to accept `error` object and standardized `code`.
  - [x] Implement logic to look up error details from `error-registry` using the code.
  - [x] formatting logic to combine `title`, `message`, `reason`, `suggestion` into a clear User Interface message.
  - [x] Ensure `AI101Error` class supports new registry structure or is adapted to look it up.
  - [x] Maintain backward compatibility for raw `Error` objects (fallback generic error).

- [x] **Task 3: Implement Documentation Link Opening Logic** (AC: #6, #7)
  - [x] Add configuration setting: `ai101.errors.openLinksIn` (enum: 'SimpleBrowser', 'ExternalBrowser').
  - [x] Implement `openHelpLink(url)` helper in `ErrorHandler`.
  - [x] Use `vscode.env.openExternal` for external browser.
  - [x] Use `vscode.commands.executeCommand('simpleBrowser.show', url)` for internal browser.
  - [x] Update error notification buttons to include "Read Documentation" which triggers this helper.

- [x] **Task 4: Implement "Fix it now" Action Buttons** (AC: #11)
  - [x] Extend `IErrorDefinition` to include optional `actionCommand` and `actionLabel`.
  - [x] Update `ErrorHandler` notification to check for `actionCommand`.
  - [x] If present, add specific button (e.g., "Configure API Key") alongside "Read Documentation".
  - [x] Wire up "Configure API Key" to `ai-101.configureApiKey` (ensure command exists or create wrapper).

- [x] **Task 5: Refactor Existing Errors to New Standard** (AC: #9, #10)
  - [x] Audit `src/errors/` files (`authentication-error.ts`, `llm-provider-error.ts`, etc.).
  - [x] Update their distinct error codes to match the official registry list.
  - [x] Rewrite error messages in registry to be blame-free and actionable.

- [x] **Task 6: Unit Testing** (AC: #13)
  - [x] Create `src/errors/__tests__/error-registry.test.ts`.
  - [x] Verify all registered errors have unique codes.
  - [x] Verify all documentation links are valid URLs (regex check).
  - [x] Test `ErrorHandler` message formatting logic.
  - [x] Test action button generation logic.

## Dev Notes

### Error Registry Structure (Implemented)

Application uses `src/errors/error-registry.ts` which provides a type-safe `ErrorRegistry` and a collection of `IErrorDefinition`s.

### Documentation Links
- Links point to established GitHub Wiki patterns.
- User can configure preferring internal `SimpleBrowser` or default external browser.

### VSCode Notification API
- Utilizes `window.showErrorMessage`, `window.showWarningMessage`, and `window.showInformationMessage` based on severity.
- Buttons dynamically generated based on `actionLabel` and documentation requirement.

## Dev Agent Guardrails

### Technical Requirements
- Messages are objective and follow the blame-free pattern.
- Error codes are standardized and centralized.

### Architecture Compliance
- Logic resides in `src/errors/`.
- Circular dependencies avoided by moving `AI101Error` to `src/errors/base-error.ts`.

### Library Framework Requirements
- Full compliance with VSCode API for UI notifications.

### Testing Requirements
- Vitest used for all unit tests.
- High coverage for error registry and formatting logic.
