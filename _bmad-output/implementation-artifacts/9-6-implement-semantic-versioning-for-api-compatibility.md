# Story 9.6: Implement Semantic Versioning for API Compatibility

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an extension developer,
I want to verify the AI-101 API version and check compatibility,
so that I can ensure my extension works reliably with the installed version of AI-101.

## Acceptance Criteria

1.  **API Version Exists**: `IAI101API` exposes a read-only `apiVersion` property matching the extension version.
2.  **Compatibility Check**: `IAI101API` exposes `checkCompatibility(requiredVersion: string): boolean` method.
3.  **SemVer Compliance**: `checkCompatibility` strictly follows Semantic Versioning rules (using `semver` library).
4.  **Version Source**: The exposed `apiVersion` matches `package.json` version.
5.  **Documentation**: API documentation strictly defines semantic versioning policy (Major.Minor.Patch).
6.  **Type Safety**: `apiVersion` is typed as a string conforming to semver format.
7.  **Unit Tests**: Verify compatibility checks against various ranges (`^1.0.0`, `~1.2.0`, `>=1.0.0`).
8.  **Deprecation Policy**: Documentation defines how deprecations are handled (minor vs major).

## Tasks / Subtasks

- [x] **Task 1: Add SemVer Dependency**
  - [x] Install `semver` and `@types/semver`.
  - [x] Verify license compatibility (ISC/MIT). (Verified: ISC for semver, MIT for @types/semver)

- [x] **Task 2: Update Public API Interface**
  - [x] Update `src/api/extension-api.ts` -> `IAI101API`.
  - [x] Add `readonly apiVersion: string;`.
  - [x] Add `checkCompatibility(requiredVersion: string): boolean;`.
  - [x] Add JSDoc explaining versioning policy.

- [x] **Task 3: Implement Versioning Logic**
  - [x] Update `src/api/api-implementation.ts`.
  - [x] Implement `apiVersion` (source from constant or package).
  - [x] Implement `checkCompatibility` using `semver.satisfies()`.

- [x] **Task 4: Unit Testing**
  - [x] Create `src/api/__tests__/versioning.test.ts`.
  - [x] Test `apiVersion` format.
  - [x] Test `checkCompatibility` with valid/invalid ranges.
  - [x] Test `checkCompatibility` with major/minor differences.

- [x] **Task 5: Documentation**
  - [x] Create/Update `docs/extension-dev/versioning.md`.
  - [x] Explain how to guard extension code using `checkCompatibility`.

## Dev Notes

- **Library Usage**:
  - Use `semver` package (`npm install semver`) for robust version parsing and range checking. Do not write custom regex parsers.
  
- **Version Source**:
  - Ideally, read the version from `package.json` via `vscode.extensions.getExtension('GoupilJeremy.ai-101-ts').packageJSON.version` if possible, or pass it from `activate` context.
  - Alternatively, define a `const VERSION` that acts as the source of truth for the API, but ensuring it stays in sync with `package.json` is critical (maybe a build script check).
  - **Decision**: Pass `context.extension.packageJSON.version` or similar to `createAPI` factory.

- **Compatibility Logic**:
  - `checkCompatibility('^1.0.0')` should return true if current is `1.1.0`.
  - It should return false if current is `2.0.0` (Breaking).

### Project Structure Notes

- `src/api/extension-api.ts` (Interface)
- `src/api/api-implementation.ts` (Implementation)
- `package.json` (Dependency)

### References

- [Source: planning-artifacts/epics.md#Story 9.6](file:///home/jeregoupix/dev/ai-101-ts/_bmad-output/planning-artifacts/epics.md)
- [Source: implementation-artifacts/9-5-implement-typed-configuration-api-for-programmatic-access.md](file:///home/jeregoupix/dev/ai-101-ts/_bmad-output/implementation-artifacts/9-5-implement-typed-configuration-api-for-programmatic-access.md)
- [NPM: semver](https://www.npmjs.com/package/semver)

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

- Task 1: Installed `semver` and `@types/semver`.
- Task 2: Added `apiVersion` and `checkCompatibility` to `IAI101API`.
- Task 3: Implemented versioning via `createAPI` using `semver.satisfies`.
- Task 4: Created and verified `versioning.test.ts`. Updated existing API tests.
- Task 5: Created `docs/extension-dev/versioning.md`.

### Completion Notes List

- ✅ API Versioning implemented using standard Semantic Versioning.
- ✅ `checkCompatibility` method added for extensions to verify support.
- ✅ Unit tests confirm compatibility range checks (caret, tilde, >=).
- ✅ Documentation provides clear usage examples and deprecation policy.
- ⚠️ Note: Pre-existing failures detected in unrelated test files (`configuration-manager`, `phase-detector`, etc.) were ignored as they are out of scope. All API-specific tests pass.

### File List

- `package.json` (modified)
- `package-lock.json` (modified)
- `src/extension.ts` (modified)
- `src/api/extension-api.ts` (modified)
- `src/api/api-implementation.ts` (modified)
- `src/api/__tests__/versioning.test.ts` (new)
- `src/api/__tests__/api-implementation.test.ts` (modified)
- `src/api/__tests__/integration.test.ts` (modified)
- `docs/extension-dev/versioning.md` (new)
