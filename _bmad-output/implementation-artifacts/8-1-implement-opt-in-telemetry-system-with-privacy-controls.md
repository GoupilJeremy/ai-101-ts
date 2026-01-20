# Story 8.1: Implement Opt-In Telemetry System with Privacy Controls

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want telemetry to be opt-in with clear privacy controls,
So that I can share usage data to improve the product without compromising sensitive information.

## Acceptance Criteria

1.  **Given** Extension is activated for first time, **When** First-run experience begins, **Then** Telemetry consent dialog explains data collection clearly.
2.  Dialog details: what data is collected, how it's used, who has access.
3.  Consent is opt-in (default is NO collection until user explicitly agrees).
4.  User can change consent anytime via "Suika: Telemetry Settings" command.
5.  No user code is logged without explicit consent (NFR13 compliance).
6.  No API keys, secrets, or sensitive data ever transmitted (strict filtering).
7.  Telemetry data encrypted in transit (HTTPS/TLS).
8.  Data retention policy communicated (e.g., 90 days, then anonymized aggregation).
9.  User can export or delete their telemetry data on request.
10. Privacy policy linked and accessible from telemetry settings.
11. Unit tests verify consent handling and data filtering.

## Tasks / Subtasks

- [x] Task 1: Design and Implement Telemetry Service (AC: 3, 5, 6, 7)
    - [x] Create `src/telemetry/telemetry-service.ts`.
    - [x] Implement `ITelemetryService` interface following interface-first design.
    - [x] Integrate `@vscode/extension-telemetry` as the underlying reporter.
    - [x] Implement initialization logic that strictly checks for consent before instantiating/sending.
    - [x] Implement `sanitize(data: any)` method to recursively remove PII (file paths, emails, keys) and ensure NO code is sent.

- [x] Task 2: Implement Consent Management (AC: 1, 2, 3)
    - [x] Create `TelemetryConsentManager` to handle storage of user choice using `context.globalState` (persist across sessions).
    - [x] Implement `FirstRun` check logic to trigger consent dialog on first activation.
    - [x] Create the Consent Dialog using `vscode.window.showInformationMessage` with "Accept", "Decline", and "Learn More" options. "Learn More" should show a quick pick or markdown preview with details.

- [x] Task 3: Implement Telemetry Settings & Controls (AC: 4, 9, 10)
    - [x] Create command `ai-101.configureTelemetry` (`src/commands/telemetry-commands.ts`).
    - [x] Implement logic to toggle consent in `TelemetryConsentManager`.
    - [x] Implement "Export Data" functionality (for now, export local buffer or log if applicable, or just placeholder for remote request).
    - [x] Implement "Delete Data" functionality (clear local ID/settings).
    - [x] Add visual link to Privacy Policy in settings or dialog.

- [x] Task 4: Testing (AC: 11)
    - [x] Create `src/telemetry/__tests__/telemetry-service.test.ts`.
    - [x] Write unit tests for `TelemetryService` (mocking the backend reporter).
    - [x] Verify logic for "Opt-In by default NO" - ensure no events sent if state is undefined or false.
    - [x] Verify sanitization removes sensitive keys/values.

## Developer Context

### Technical Requirements
-   **Telemetry Library**: Use `@vscode/extension-telemetry` (latest version) for Azure Monitor/App Insights integration.
-   **Privacy First**: The service must be wrapper-based. If consent is false, the underlying reporter should not even be initialized or should be disabled using its API.
-   **Sanitization**: Strict adherence to "No user code" rule.
-   **Encryption**: Library handles HTTPS, but ensure any custom transmission (if added) uses it.

### Architecture Compliance
-   **Service Pattern**: `TelemetryService` should be a singleton managed by `ExtensionContext` or a dedicated manager in `src/telemetry/`.
-   **State Management**: Use `context.globalState` for persisting "hasSeenConsentDialog" and "telemetryEnabled".
-   **Architecture Decision**: "Observability, Debugging & Telemetry" section in `architecture.md` mandates Opt-in.
-   **Integration**: Respect `vscode.env.isTelemetryEnabled`. If VSCode telemetry is off, ours must be off too. If VSCode is on, ours is STILL off until specific Opt-In.

### File Structure Requirements
-   `src/telemetry/`
    -   `telemetry-service.ts`
    -   `telemetry-manager.ts` (if separating concerns)
    -   `telemetry-events.ts` (Typed interfaces for events)
    -   `__tests__/`
        -   `telemetry-service.test.ts`
-   `src/commands/`
    -   `telemetry-commands.ts`

### Testing Requirements
-   **Unit Tests**: Essential for the sanitization and consent logic.
-   **Mocking**: Mock the `@vscode/extension-telemetry` class to verify calls are NOT made when opted out.

### Latest Tech Information
-   **VSCode Telemetry**: The `@vscode/extension-telemetry` package is the standard. It provides `sendTelemetryEvent` and `sendTelemetryErrorEvent`.
-   **GDPR**: Ensure "Delete Data" capability is at least architected (even if it's a manual request flow for MVP).
-   **Consent**: VSCode API `vscode.env.onDidChangeTelemetryEnabled` helps track global setting changes.

### Project Context Reference
-   [Architecture Document](_bmad-output/planning-artifacts/architecture.md) - Section: Observability
-   [Project Context](_bmad-output/project-context.md) - Section: Security Critical Rules ("Telemetry: ALWAYS opt-in by default")

### Completion Notes List
- [x] Implemented `TelemetryService` using `@vscode/extension-telemetry` with a privacy-first wrapper.
- [x] Implemented `TelemetryManager` for opt-in consent flow and first-run experience.
- [x] Implemented `suika.configureTelemetry` command with export/delete placeholders.
- [x] Added comprehensive sanitization logic to remove PII and code from telemetry data.
- [x] Verified all logic with unit tests using vitest and mocks.

### File List
- src/telemetry/telemetry-service.ts
- src/telemetry/telemetry-manager.ts
- src/commands/telemetry-commands.ts
- src/telemetry/__tests__/telemetry-service.test.ts
