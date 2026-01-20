## Epic 1: Project Foundation & Core Infrastructure

**Goal:** Developers have a working VSCode extension foundation with configuration management, secure API key storage, and error handling infrastructure.

### Story 1.1: Initialize VSCode Extension Project with Yeoman Generator

As a developer,
I want to initialize a new VSCode extension project using the Yeoman Generator with TypeScript and esbuild,
So that I have a production-ready foundation with optimal build performance.

**Acceptance Criteria:**

**Given** I have Node.js 16+ and npm installed
**When** I run `npx --package yo --package generator-code -- yo code`
**And** I select "New Extension (TypeScript)" as the extension type
**And** I select "esbuild" as the bundler (NOT webpack)
**And** I select "npm" as the package manager
**And** I provide "suika" as the extension name
**Then** A complete VSCode extension project structure is generated
**And** The project includes `src/extension.ts` entry point
**And** The project includes `package.json` with VSCode engine >=1.75.0
**And** The project includes `.vscode/launch.json` for F5 debugging
**And** The project includes esbuild configuration for bundling
**And** The project compiles successfully with `npm run compile`
**And** The extension activates in VSCode Extension Development Host

---

### Story 1.2: Configure Dual-Build System for Extension and Webview

As a developer,
I want separate build configurations for the Node.js extension and Browser webview,
So that each context uses optimal bundling settings for performance.

**Acceptance Criteria:**

**Given** The Yeoman-generated project structure exists
**When** I create `esbuild.config.js` with dual-build configuration
**Then** Build 1 targets `src/extension.ts` → `dist/extension.js` (CommonJS for Node.js)
**And** Build 2 targets `src/webview/main.js` → `dist/webview.js` (IIFE for Browser)
**And** Development builds complete in <1 second
**And** Watch mode (`npm run watch`) incremental builds complete in <200ms
**And** Production builds with minification complete in <3 seconds
**And** Source maps are included in development builds
**And** Source maps are excluded from production builds
**And** Both bundles are compatible with their respective runtimes

---

### Story 1.3: Implement Configuration Manager with VSCode Settings Integration

As a developer,
I want a centralized Configuration Manager that reads from VSCode workspace and user settings,
So that users can configure the extension via standard VSCode settings UI.

**Acceptance Criteria:**

**Given** The extension project structure exists
**When** I create `src/config/configuration-manager.ts`
**And** I define configuration schema in `package.json` under `contributes.configuration`
**Then** ConfigurationManager reads settings via `vscode.workspace.getConfiguration('ai101')`
**And** Settings support both workspace and user scope
**And** Configuration includes sections for: LLM providers, UI preferences, performance, telemetry
**And** Default values are provided for all settings
**And** Configuration changes trigger `onDidChangeConfiguration` event
**And** ConfigurationManager validates setting values before use
**And** Invalid configurations throw `ConfigurationError` with helpful messages
**And** Unit tests cover configuration loading and validation (>70% coverage)

---

### Story 1.4: Implement Secure API Key Storage with VSCode SecretStorage

As a developer,
I want API keys stored securely using VSCode SecretStorage API,
So that sensitive credentials are encrypted at rest and never logged.

**Acceptance Criteria:**

**Given** The extension is activated with `ExtensionContext`
**When** I create `src/config/secret-manager.ts`
**And** I implement methods: `storeApiKey()`, `getApiKey()`, `deleteApiKey()`
**Then** API keys are stored via `context.secrets.store('suika.{provider}.apiKey', key)`
**And** API keys are retrieved via `context.secrets.get('suika.{provider}.apiKey')`
**And** SecretStorage encryption is handled by VSCode platform automatically
**And** API keys are NEVER logged to console or files
**And** API keys are NEVER stored in `settings.json` or environment variables
**And** SecretManager supports multiple providers (openai, anthropic, custom)
**And** Missing API keys throw descriptive errors prompting user to configure
**And** Unit tests use mock SecretStorage implementation

---

### Story 1.5: Create Configuration Preset System for Solo/Team/Enterprise

As a developer,
I want predefined configuration presets for different use cases,
So that users can quickly set up optimal defaults for their workflow.

**Acceptance Criteria:**

**Given** ConfigurationManager is implemented
**When** I create `src/config/presets.ts` with preset definitions
**Then** "Solo Developer" preset optimizes for: Learning Mode, single user, detailed explanations
**And** "Team" preset optimizes for: visible labels, team metrics, pair programming
**And** "Enterprise" preset optimizes for: on-premise LLMs, strict security, compliance logging
**And** Users can select preset via Command Palette: "Suika: Apply Configuration Preset"
**And** Preset application updates VSCode settings with template values
**And** Users can customize preset values after application
**And** Preset selection is tracked in telemetry (opt-in)

---

### Story 1.6: Implement Export/Import Configuration Functionality

As a developer,
I want users to export and import their configurations,
So that settings are portable between machines and team members can share configurations.

**Acceptance Criteria:**

**Given** ConfigurationManager is implemented
**When** User invokes "Suika: Export Configuration" command
**Then** All non-secret settings are serialized to JSON file
**And** User selects save location via VSCode file picker
**And** Exported file excludes API keys and secrets
**And** Exported file includes version number for compatibility checking
**When** User invokes "Suika: Import Configuration" command
**Then** User selects configuration JSON file via file picker
**And** Settings are validated before application
**And** Incompatible versions show warning with migration options
**And** User confirms before overwriting existing settings
**And** Import completion shows summary of applied settings

---

### Story 1.7: Implement Centralized Error Handler with Retry Logic

As a developer,
I want a centralized error handler with retry logic and structured logging,
So that transient failures are handled gracefully and errors include debugging context.

**Acceptance Criteria:**

**Given** The extension structure exists
**When** I create `src/errors/error-handler.ts` and custom error classes
**Then** Base class `AI101Error` extends Error with `code` and `context` properties
**And** Specialized classes exist: `ConfigurationError`, `LLMProviderError`, `NetworkError`, `CacheError`
**And** ErrorHandler implements retry logic with exponential backoff (3 retries max)
**And** Retryable errors are classified: RATE_LIMIT, TIMEOUT, NETWORK_ERROR
**And** Non-retryable errors fail immediately: AUTHENTICATION_ERROR, VALIDATION_ERROR
**And** All errors are logged with structured context (timestamp, error code, stack trace)
**And** Errors display user-friendly messages with troubleshooting links
**And** VSCode notifications show errors with appropriate severity (info/warning/error)
**And** Unit tests cover retry scenarios and error classification

---

### Story 1.8: Set Up Testing Framework with Mocha and @vscode/test-electron

As a developer,
I want unit and integration test infrastructure configured,
So that all code meets >70% coverage requirement and tests run in CI/CD.

**Acceptance Criteria:**

**Given** The Yeoman-generated project includes test infrastructure
**When** I configure test framework in `src/test/suite/`
**Then** Unit tests use Mocha + assert for pure logic testing
**And** Integration tests use @vscode/test-electron for VSCode API testing
**And** Tests are co-located in `__tests__/` subdirectories next to source code
**And** Test command `npm test` runs all unit and integration tests
**And** Test coverage report is generated showing line/branch/function coverage
**And** CI/CD pipeline fails if coverage drops below 70%
**And** Test fixtures and mocks are available for common scenarios
**And** Example tests demonstrate testing patterns for future stories
