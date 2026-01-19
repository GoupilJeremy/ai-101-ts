# Story 10.6: Create Detailed Changelog with Contributor Recognition

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user or contributor,
I want a detailed changelog showing what changed in each version,
So that I know what's new, what's fixed, and who contributed.

## Acceptance Criteria
1. [x] **Given** Extension versions are released
2. [x] **When** I view CHANGELOG.md
3. [x] **Then** Changelog follows Keep a Changelog format (Added, Changed, Fixed, Removed, Deprecated, Security)
4. [x] **And** Each version entry includes: version number, release date, summary
5. [x] **And** Breaking changes highlighted prominently with migration guidance
6. [x] **And** Each change entry includes contributor attribution: "(@username)"
7. [x] **And** Changelog includes links to relevant PRs and issues
8. [x] **And** Changelog includes "Thank you" section recognizing all contributors
9. [x] **And** Changelog auto-generated from conventional commit messages via tooling
10. [x] **And** Manual changelog editing supported for clarity and organization
11. [x] **And** Changelog accessible via "AI-101: View Changelog" command
12. [x] **And** Changelog displayed automatically after extension updates (highlights new features)
13. [x] **And** Changelog maintained in repository root (`CHANGELOG.md`)

## Tasks / Subtasks
- [x] **Task 1: Setup Changelog Generation Tooling** (AC: #9, #3, #6, #7)
  - [x] Install `conventional-changelog-cli` or `standard-version` as dev dependency.
  - [x] Configure strict Conventional Commits enforcement (husky commit-msg hook).
  - [x] Create custom configuration to include contributor attribution (@username) from git comits.
  - [x] Create `scripts/generate-changelog.ts` (or similar) to handle custom "Thank You" section generation.
  - [x] Add `npm run changelog` script to `package.json`.

- [x] **Task 2: Create Initial CHANGELOG.md** (AC: #13, #3, #4)
  - [x] Generate initial changelog for current version (0.0.1 or similar) from existing git history.
  - [x] Ensure "Keep a Changelog" formatting structure.
  - [x] Verify links to PRs/Issues (if GitHub repo connected).

- [x] **Task 3: Implement "View Changelog" Command** (AC: #11)
  - [x] Register command `ai-101.viewChangelog`.
  - [x] Implement handler to open `CHANGELOG.md` using VSCode's Markdown Preview (`markdown.showPreview`).

- [x] **Task 4: Implement Update Notification Logic** (AC: #12)
  - [x] In `ExtensionStateManager` or similar, track `lastKnownVersion` in `globalState`.
  - [x] On activation, compare `currentVersion` (package.json) with `lastKnownVersion`.
  - [x] If `currentVersion > lastKnownVersion`, trigger "What's New" notification.
  - [x] Notification action "View Changelog" triggers `ai-101-ts.viewChangelog`.
  - [x] Update `lastKnownVersion` after check.

- [x] **Task 5: Documentation & Contributor Guide** (AC: #10)
  - [x] Update `CONTRIBUTING.md` to explain commit message conventions (Angular/Conventional).
  - [x] Add instructions on how to run changelog generation locally.

## Dev Notes

### Tooling Recommendation
- **Standard Version** or **Semantic Release** could work, but since we want custom "Contributor Recognition" formatting, a custom script wrapping `conventional-changelog-core` might be best.
- Alternatively, search for a preset that supports author attribution.
- **Git Context:** Use `git log --format` to extract author names for the "Thank You" section.

### VSCode Markdown Preview
- Use `vscode.commands.executeCommand('markdown.showPreview', uri)` where `uri` points to `CHANGELOG.md`.

### Version Tracking
- Use `context.globalState` to persist the version number between sessions. `extension.packageJSON.version` gives the current version.

### Project Structure
- Place generation scripts in `scripts/` folder.
- `CHANGELOG.md` goes in root.

## Dev Agent Record

### Agent Model Used
- Claude 3.5 Sonnet (Simulated)

### Completion Notes
- Set up `standard-version`, `husky`, and `commitlint` for automated versioning and changelog generation following Conventional Commits.
- Created `scripts/generate-changelog.ts` and `.versionrc.js` to customize the changelog with contributor recognition.
- Implemented `ai-101-ts.viewChangelog` command to display `CHANGELOG.md` using VSCode's Markdown Preview.
- Implemented `VersionManager` to track extension updates and show a "What's New" notification to users.
- Updated `CONTRIBUTING.md` with commit conventions and development instructions.
- Added unit tests for `VersionManager` and `viewChangelogCommand`.
- Fixed `vscode` mock to support `EventEmitter` and `debug` properties needed for tests.

### File List
- `package.json` (scripts, deps)
- `scripts/generate-changelog.ts` (new)
- `.versionrc.js` (new)
- `commitlint.config.js` (new)
- `src/commands/view-changelog.ts` (new)
- `src/state/version-manager.ts` (new)
- `CHANGELOG.md` (updated/generated)
- `CONTRIBUTING.md` (updated)
- `src/__mocks__/vscode.ts` (updated for tests)
- `src/state/__tests__/version-manager.test.ts` (new test)
- `src/commands/__tests__/view-changelog.test.ts` (new test)
