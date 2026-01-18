# Story 9.2: Implement LLM Provider Registration API

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an extension developer,
I want a programmatic API to register custom LLM providers during my extension's activation,
so that I can integrate my company's internal LLM or other third-party models into AI-101 without forking the codebase.

## Acceptance Criteria

1.  **Extension activation returns a public API object**.
2.  **API exposes `registerLLMProvider(name: string, provider: ILLMProvider): void` method**.
3.  **Registration method accepts valid `ILLMProvider` implementations**.
4.  **Registration validates provider name uniqueness** (throws error if name already exists, unless `overwrite` option is provided - TBD, likely error by default).
5.  **Registered providers are immediately available** to the `LLMProviderManager`.
6.  **API is typed** and exports necessary interfaces (`ILLMProvider`, `ExtensionAPI`) for consumers.
7.  **Unit tests verify API surface** and successful registration flow.
8.  **Integration test demonstrates** a second extension activating `ai-101-ts` and registering a provider.
9.  **Error handling** for invalid providers (null, missing methods) is implemented.

## Tasks / Subtasks

- [x] **Task 1: Define Public Extension API Interface**
    - [x] Create `src/api/extension-api.ts`.
    - [x] Define `IAI101API` interface with `registerLLMProvider`.
    - [x] Export `ILLMProvider` and relevant types from top-level `src/api/index.ts`.
- [x] **Task 2: Implement API in Extension Activation**
    - [x] Modify `src/extension.ts` `activate` function to return an object implementing the interface.
    - [x] Implement `registerLLMProvider` to delegate to `LLMProviderManager.getInstance().registerProvider()`.
    - [x] Ensure `LLMProviderManager` is initialized before Returning API.
- [x] **Task 3: Add Validation Logic**
    - [x] In API implementation, add validation:
        - [x] Name must be non-empty string.
        - [x] Provider must implement all required methods.
        - [x] Validation against reserved names (openai, anthropic).
        - [x] Check for duplicate provider names.
- [x] **Task 4: Update Exports for Extension Consumers**
    - [x] Created barrel export in `src/api/index.ts` with all necessary types.
- [x] **Task 5: Write Tests**
    - [x] Unit tests for API interface contract.
    - [x] Unit tests for API implementation.
    - [x] Integration test demonstrating external extension usage.

## Developer Context

### Technical Requirements

-   **Public API Pattern**: VSCode extensions expose APIs by returning them from `activate()`.
-   **Strict Typing**: All API methods must be strictly typed.
-   **Singleton Access**: The API implementation will likely need to access the `LLMProviderManager` singleton.
-   **Validation**: Do not allow registering a provider with the same name as an existing one to prevent accidental overrides, unless a specific override mechanism is designed (for MVP, throw error).

### Architecture Compliance

-   **Layering**: The API surface (`src/api/`) should decouple consumers from internal implementation details where possible, but `ILLMProvider` is the contract.
-   **LLMProviderManager**: Continue using the singleton pattern as defined in architecture.
-   **Error Handling**: Use `LLMProviderError` or a specific `APIError` when registration fails.

### Library / Framework Requirements

-   **VSCode API**: Use `vscode.Extension<T>` type concepts for testing.
-   **No New Dependencies**: Should not require new runtime dependencies.

### File Structure Requirements

```
src/
  api/
    index.ts                  # Barrel for public types
    extension-api.ts          # Interface definition
  extension.ts                # Update activate signature
```

### Testing Requirements

-   **Unit Tests**: `src/api/__tests__/api-implementation.test.ts`.
-   **Integration**: Use `vscode.extensions.getExtension` in tests to verify exports (if possible in unit test env, otherwise mock).

## Previous Story Intelligence

-   **Story 9.1** established the `ILLMProvider` interface. You will rely heavily on this.
-   `src/llm/provider.interface.ts` is the source of truth for the provider contract.
-   `docs/extension-dev/llm-providers.md` (created in 9.1) should be updated to reference the new Registration API in a future story or as a minor task here if time permits (but strict scope is implementation).

## Latest Tech Information

-   **VSCode Extension API**: The pattern `export function activate(context) { return api; }` is the standard way to expose functionality to other extensions.

## Dev Agent Record

### Implementation Plan

1. **API Interface Design**: Created `IAI101API` interface with comprehensive JSDoc documentation following semantic versioning principles.
2. **Validation Strategy**: Implemented multi-layered validation (name, provider structure, reserved names, duplicates) in `createAPI` factory function.
3. **Integration Pattern**: Modified `extension.ts` to return API from `activate()` function, ensuring LLMProviderManager is initialized first.
4. **Testing Approach**: TDD with 16 tests covering interface contracts, implementation logic, and real-world integration scenarios.

### Completion Notes

✅ **All Acceptance Criteria Met**:
- AC1: Extension activation returns IAI101API object ✓
- AC2: API exposes registerLLMProvider method with correct signature ✓
- AC3: Registration accepts valid ILLMProvider implementations ✓
- AC4: Validation prevents duplicate provider names ✓
- AC5: Registered providers immediately available to LLMProviderManager ✓
- AC6: API is fully typed with exported interfaces ✓
- AC7: Unit tests verify API surface (16 tests passing) ✓
- AC8: Integration tests demonstrate external extension usage ✓
- AC9: Error handling for invalid providers implemented ✓

**Implementation Highlights**:
- Created factory pattern (`createAPI`) for clean dependency injection
- Comprehensive validation: empty names, null providers, missing methods, reserved names, duplicates
- Full JSDoc documentation with @public, @since, @remarks tags
- Integration tests simulate real-world multi-extension scenarios
- Followed project patterns: interface-first design, kebab-case files, co-located tests

**Test Results**: 16/16 tests passing
- 4 tests: Interface contract validation
- 6 tests: Implementation logic and validation
- 6 tests: Integration scenarios (external extensions, error handling)

## File List

### New Files
- `src/api/extension-api.ts` - Public API interface definition
- `src/api/api-implementation.ts` - API factory with validation logic
- `src/api/index.ts` - Barrel export for public types
- `src/api/__tests__/extension-api.test.ts` - Interface contract tests
- `src/api/__tests__/api-implementation.test.ts` - Implementation tests
- `src/api/__tests__/integration.test.ts` - Integration tests

### Modified Files
- `src/extension.ts` - Updated activate() to return IAI101API

## Change Log

- **2026-01-18**: Story 9.2 completed - Implemented LLM Provider Registration API with comprehensive validation and testing (16 tests passing)
