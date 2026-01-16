# Story 6.1: implement-intelligent-file-discovery-and-context-loading

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the Context Agent to automatically load relevant project files,
so that AI suggestions have appropriate context without manual file selection.

## Acceptance Criteria

1. Context Agent analyzes current file for import statements
2. Related files loaded automatically: imported modules, dependency files
3. Recent files visited in current session included in context
4. Files with similar names or paths considered relevant and loaded
5. Context loading prioritizes: current file > imports > recent > related
6. File discovery uses VSCode workspace file search API
7. Discovery algorithm completes in <500ms for typical projects
8. User can manually add/remove files from context via command
9. Context loading status visible in Vital Signs Bar ("Loading 5 files...")
10. Unit tests verify file discovery heuristics and loading behavior

## Tasks / Subtasks

- [x] Implement file discovery algorithm using VSCode workspace API (AC: 1,2,3,4,5,6,7)
  - [x] Create file-loader.ts in src/agents/context/
  - [x] Implement import statement analysis for current file
  - [x] Add dependency file discovery logic
  - [x] Implement recent files tracking
  - [x] Add similar file name/path matching
  - [x] Integrate VSCode workspace.findFiles API
  - [x] Add performance timing (<500ms target)
- [x] Implement token optimization within LLM limits (AC: 5)
  - [x] Create token-optimizer.ts in src/agents/context/
  - [x] Add token estimation for loaded files
  - [x] Implement file prioritization when over limit
  - [x] Add file truncation for large files (keep signatures)
- [x] Add manual context management commands (AC: 8)
  - [x] Create add/remove context commands in src/commands/
  - [x] Implement context state management
  - [x] Add command registration in package.json
- [x] Integrate context loading status in Vital Signs Bar (AC: 9)
  - [x] Update vital-signs-bar.js to show loading status
  - [x] Add file count display in Vital Signs Bar
  - [x] Implement real-time status updates during loading
- [x] Write comprehensive unit tests (AC: 10)
  - [x] Create __tests__/ in src/agents/context/
  - [x] Test file discovery heuristics with mock workspace
  - [x] Test token optimization logic
  - [x] Test performance requirements (<500ms)

## Dev Notes

- Context Agent is part of the multi-agent orchestration system (Orchestrator Central Pattern)
- File discovery must be fast (<500ms) to not impact user experience
- Token optimization critical for cost control (<$0.10/session target)
- Context loading status visible in Vital Signs Bar for transparency
- Manual context management allows user override of automatic discovery

### Project Structure Notes

- Implementation in src/agents/context/ following agent folder pattern
- File-loader.ts and token-optimizer.ts as separate modules for separation of concerns
- Commands in src/commands/ following command organization pattern
- Webview updates in src/webview/components/vital-signs-bar.js
- Tests co-located in __tests__/ subdirectories per testing pattern

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Context Intelligence & File Management] - Epic 6 requirements
- [Source: _bmad-output/planning-artifacts/architecture.md#Context Agent] - Agent implementation details
- [Source: _bmad-output/planning-artifacts/architecture.md#File System Cache] - Context loading patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Performance Constraints] - <500ms requirement
- [Source: _bmad-output/planning-artifacts/architecture.md#Cost Management] - Token optimization for cost control

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List