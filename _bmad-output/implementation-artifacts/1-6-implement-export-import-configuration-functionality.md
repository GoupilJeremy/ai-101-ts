# Story 1.6: Implement Export/Import Configuration Functionality

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to export my custom configuration to a file and import it on another machine,
So that I can share my setup or sync it across environments easily.

## Acceptance Criteria

1.  **Given** I have a customized configuration
2.  **When** I run "AI-101: Export Configuration"
3.  **Then** A file save dialog appears
4.  **And** The configuration is saved as a JSON file
5.  **And** The JSON contains all `ai101.*` settings
6.  **And** Secrets (API Keys) are **EXCLUDED** from the export (Security)
7.  **When** I run "AI-101: Import Configuration"
8.  **Then** A file open dialog appears
9.  **And** I can select a valid JSON configuration file
10. **And** The system validates the JSON against the schema
11. **And** Valid settings are applied to the VSCode configuration
12. **And** Invalid settings are rejected with an error message

## Tasks / Subtasks

- [x] Task 1: Create ConfigurationIO Service (AC: 4, 5, 6, 10)
  - [x] 1.1: Create `src/config/configuration-io.ts`
  - [x] 1.2: Implement `generateExportData()`: Gather all `ai101` settings (omit secrets)
  - [x] 1.3: Implement `validateImportData(data)`: Check basic schema validity

- [x] Task 2: Implement Export Command (AC: 2, 3)
  - [x] 2.1: Register `ai-101-ts.exportConfig`
  - [x] 2.2: Use `vscode.window.showSaveDialog`
  - [x] 2.3: Write JSON to file via `fs`

- [x] Task 3: Implement Import Command (AC: 7, 8, 9, 11, 12)
  - [x] 3.1: Register `ai-101-ts.importConfig`
  - [x] 3.2: Use `vscode.window.showOpenDialog`
  - [x] 3.3: Read file and parse JSON
  - [x] 3.4: Use `PresetManager` or `ConfigurationManager` logic to apply settings line-by-line

- [x] Task 4: UI & Testing
  - [x] 4.1: UI feedback (Information/Error messages)
  - [x] 4.2: Verify no secrets are exported (Verified via manual code inspection and picking specific keys)
  - [x] 4.3: Compilation check (Passed)

## Dev Notes

### Architecture Patterns & Constraints
- **Security**: Explicitly exclude secrets. Our `ConfigurationManager` reads settings, not secrets, so default behavior is safe, but we must verify.
- **IO**: Use `vscode.workspace.fs` or node `fs`. VSCode `fs` is preferred for remote compat, but node `fs` is fine for local files if dialog returns file/file-scheme URI. VSCode API `vscode.workspace.fs.writeFile(uri, buffer)` is best practice.

### Source Tree Components
- `src/config/configuration-io.ts` (New)
- `src/commands/export-config.ts` (New)
- `src/commands/import-config.ts` (New)

### Testing Standards
- Logic test for export generation (does it have keys? does it exclude secrets?).

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

- Build passed.
- No secrets exported by design (manual pick of keys in `ConfigurationIO`).
- Save/Open dialogs integrated via `vscode.window` API.
- File system operations via `vscode.workspace.fs`.

### Completion Notes List

- Implemented `ConfigurationIO` for centralized export/import logic.
- Implemented `exportConfigCommand` and `importConfigCommand`.
- Registered commands in `package.json` and `extension.ts`.
- Ensured security by only exporting non-sensitive settings.
- Validated import JSON against expected schema.

### File List

- src/config/configuration-io.ts
- src/commands/export-config.ts
- src/commands/import-config.ts
- package.json
- src/extension.ts
