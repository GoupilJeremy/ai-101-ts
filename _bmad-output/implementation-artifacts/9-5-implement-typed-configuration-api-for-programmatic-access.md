# Story 9.5: Implement Typed Configuration API for Programmatic Access

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an extension developer,
I want programmatic access to AI-101 configuration,
so that I can read/write settings from my custom extension.

## Acceptance Criteria

1.  **Read API**: `AI101.getConfig(key)` is available with typed return values. [x]
2.  **Write API**: `AI101.setConfig(key, value)` is available with validation. [x]
3.  **Configuration Scope**: API respects configuration scopes (user vs. workspace). [x]
4.  **Change Events**: Configuration changes via API trigger `onDidChangeConfiguration` event. [x]
5.  **Validation**: Values are validated before writing (matching UI validation constraints). [x]
6.  **Nested Keys**: API supports nested keys (e.g., `'ui.transparency.level'`). [x]
7.  **Bulk Update**: `AI101.updateConfig({ key: value })` is supported. [x]
8.  **Error Handling**: Invalid writes throw descriptive, actionable errors. [x]
9.  **Documentation**: API documentation includes examples for common use cases. [x]
10. **Unit Tests**: Verify read/write operations, validation, and event triggering. [x]

## Tasks / Subtasks

- [x] **Task 1: Define Configuration Types**
  - [x] Create `src/api/configuration-types.ts` to define the configuration schema interface (matching `package.json` contributes).
  - [x] Define accepted values/enums for strict typing.
  - [x] Export types in `src/api/index.ts`.

- [x] **Task 2: Update Public API Interface**
  - [x] Update `src/api/extension-api.ts` -> `IAI101API` to include:
    - `getConfig<K extends keyof AI101Config>(key: K): AI101Config[K]`
    - `setConfig<K extends keyof AI101Config>(key: K, value: AI101Config[K], scope?: ConfigurationScope): Promise<void>`
    - `updateConfig(config: Partial<AI101Config>, scope?: ConfigurationScope): Promise<void>`

- [x] **Task 3: Enhance Configuration Manager**
  - [x] Modify `src/config/configuration-manager.ts` (created in Story 1.3) to support programmatic access.
  - [x] Implement `get` method using `vscode.workspace.getConfiguration('ai101')`.
  - [x] Implement `set` method using `vscode.workspace.getConfiguration('ai101').update(key, value, target)`.
  - [x] Add validation logic (if not already present) to ensure values match expected types/constraints before writing.

- [x] **Task 4: Implement Bulk Updates**
  - [x] Implement `updateConfig` in `ConfigurationManager` to handle multiple keys transactionally (or sequentially).
  - [x] Ensure atomic-like behavior or rollback on failure if possible (or stop on first error).

- [x] **Task 5: Update API Implementation**
  - [x] Update `src/api/api-implementation.ts` to expose the config methods, delegating to `ConfigurationManager`.

- [x] **Task 6: Testing & Documentation**
  - [x] Unit tests for `ConfigurationManager` (read, write, validation, scope).
  - [x] Integration tests verifying `onDidChangeConfiguration` fires when API updates config.
  - [x] Update Developer Guide (`docs/extension-dev/configuration-api.md`) with examples.

## Dev Notes

- **Architecture Compliance**:
  - Leverage the existing `ConfigurationManager` singleton (Story 1.3).
  - Use `vscode.workspace.getConfiguration` as the source of truth for settings.
  - adhere to `ILLMProvider` patterns if applicable (Clean API separation).
  
- **Type Safety**:
  - Use TypeScript mapped types (`keyof AI101Config`) to ensure `getConfig` and `setConfig` are strictly typed.
  - Do not use `any` for configuration values; define a comprehensive `AI101Config` interface matching the `package.json` schema.

- **Validation**:
  - While VSCode handles basic type checking for UI inputs, programmatic access needs explicit validation in `setConfig` to prevent corrupting `settings.json` with invalid values (e.g., setting transparency to 1.5 when max is 1.0).

- **Error Handling**:
  - `setConfig` should return a Promise that rejects with a clear error message if validation fails or if VSCode API fails.

### Project Structure Notes

- `src/api/configuration-types.ts` (New)
- `src/config/configuration-manager.ts` (Modify)
- `src/api/extension-api.ts` (Modify)
- `src/api/api-implementation.ts` (Modify)

### References

- [Source: planning-artifacts/epics.md#Story 9.5](file:///home/jeregoupix/dev/ai-101-ts/_bmad-output/planning-artifacts/epics.md)
- [Source: project-context.md#Category 6: API Patterns](file:///home/jeregoupix/dev/ai-101-ts/_bmad-output/project-context.md)
- [Source: implementation-artifacts/9-4-implement-lifecycle-event-subscription-api.md](file:///home/jeregoupix/dev/ai-101-ts/_bmad-output/implementation-artifacts/9-4-implement-lifecycle-event-subscription-api.md)

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

### Completion Notes List

- Implemented `IAI101Config` interface mapping all `package.json` settings.
- Added `ConfigurationScope` support ('user', 'workspace', 'workspaceFolder').
- Implemented runtime validation for all settings in `ConfigurationManager`.
- Exposed `getConfig`, `setConfig`, and `updateConfig` via public API.
- Added unit tests in `src/config/__tests__/configuration-manager.test.ts`.
- Created developer documentation in `docs/extension-dev/configuration-api.md`.

### File List

- `src/api/configuration-types.ts` (New)
- `src/api/index.ts` (Modified)
- `src/api/extension-api.ts` (Modified)
- `src/api/api-implementation.ts` (Modified)
- `src/config/configuration-manager.ts` (Modified)
- `src/config/__tests__/configuration-manager.test.ts` (Modified)
- `docs/extension-dev/configuration-api.md` (New)
