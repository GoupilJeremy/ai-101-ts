# Story 6.3: implement-visible-context-file-tracking-and-display

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to see exactly which files are in the AI's current context,
So that I understand the basis for suggestions and can adjust context if needed.

## Acceptance Criteria

1. **Given** Context Agent loads files with token optimization
   **When** I click on "Files" count in Vital Signs Bar
   **Then** Context panel expands showing list of all loaded files
   **And** Each file entry shows: filename, relative path, token count, status (full/summarized)
   **And** Files sorted by relevance score (same as loading priority)
   **And** File entries have actions: Remove from context, View full content, Refresh
   **And** Panel shows total token count and percentage of budget used
   **And** Visual indicator distinguishes: current file (bold), imports (icon), recent (timestamp)
   **And** Click file name in context panel opens file in editor
   **And** Context panel updates in real-time as files added/removed
   **And** Context snapshot saved with each suggestion for reproducibility
   **And** Unit tests verify context display and file action handling

## Tasks / Subtasks

- [x] Task 1: Implement context panel UI component (AC: 1, 2, 3, 4, 5, 6, 7, 8, 9)
  - [x] Create context-panel.js component with expand/collapse functionality
  - [x] Implement file list display with filename, path, token count, status
  - [x] Add file sorting by relevance score (current > imports > recent > related)
  - [x] Add file action buttons (Remove, View, Refresh) with event handlers
  - [x] Implement total token count and budget percentage display
  - [x] Add visual indicators for file types (bold current, icon imports, timestamp recent)
  - [x] Add click-to-open file functionality
  - [x] Implement real-time updates via state manager subscription
  - [x] Add context snapshot saving mechanism

- [x] Task 2: Integrate with Vital Signs Bar (AC: 1)
  - [x] Update vital-signs-bar.js to show "Files" count
  - [x] Add click handler to toggle context panel visibility
  - [x] Implement panel positioning logic (anti-collision with HUD)

- [x] Task 3: Add context management actions (AC: 3, 8)
  - [x] Implement remove file from context functionality
  - [x] Add view full content action (expand summarized files)
  - [x] Implement refresh context action (reload file content)
  - [x] Update Context Agent to support dynamic file removal/addition

- [x] Task 4: Add unit tests and validation (AC: 10)
  - [x] Create unit tests for context panel component
  - [x] Add tests for file action handlers
  - [x] Implement integration tests for Vital Signs integration
  - [x] Add tests for real-time updates and state synchronization

## Dev Notes

- Relevant architecture patterns and constraints
  - [Source: _bmad-output/planning-artifacts/architecture.md#Decision #3: Dual State Pattern] - Backend source of truth, frontend mirror via postMessage
  - [Source: _bmad-output/planning-artifacts/architecture.md#Decision #5: Webview Rendering & Animation Architecture] - CSS-driven animations, vanilla JS components, 60fps performance
  - [Source: _bmad-output/planning-artifacts/architecture.md#Context Intelligence & File Management] - Context Agent manages file loading and token optimization
  - [Source: _bmad-output/planning-artifacts/architecture.md#HUD Interface & Visualization] - Vital Signs Bar integration, anti-collision positioning
  - [Source: _bmad-output/planning-artifacts/prd.md#FR34-FR41] - Context loading and display requirements

- Source tree components to touch
  - `src/webview/components/context-panel.js` - New context panel component
  - `src/webview/components/vital-signs-bar.js` - Update to show files count and handle clicks
  - `src/agents/context/context-agent.ts` - Add methods for dynamic file management
  - `src/webview/state/state-manager.js` - Add context state management
  - `src/webview/styles/components/context-panel.css` - New CSS for context panel
  - `src/webview/styles/components/vital-signs.css` - Update for files count display

- Testing standards summary
  - Unit tests for component rendering and interactions (>70% coverage)
  - Integration tests for state synchronization
  - Performance tests for real-time updates (60fps requirement)
  - Accessibility tests for keyboard navigation and screen reader support

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Follows `src/webview/components/` for UI components
  - Uses kebab-case file naming: `context-panel.js`, `context-panel.css`
  - Implements ES6 class pattern for vanilla JS components
  - Co-located CSS in `src/webview/styles/components/`

- Detected conflicts or variances (with rationale)
  - Context panel requires anti-collision positioning - use existing HUD positioning logic
  - Real-time updates need efficient state synchronization - leverage existing postMessage pattern
  - File actions need backend integration - extend Context Agent interface without breaking existing functionality

### References

- Cite all technical details with source paths and sections, e.g. [Source: docs/<file>.md#Section]
  - [Source: _bmad-output/planning-artifacts/epics.md#Epic 6: Context Intelligence & File Management] - Complete story requirements and context
  - [Source: _bmad-output/planning-artifacts/architecture.md#Context Intelligence & File Management] - Context Agent architecture and file management patterns
  - [Source: _bmad-output/planning-artifacts/architecture.md#HUD Interface & Visualization] - Vital Signs Bar and panel positioning requirements
  - [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Vital Signs Bar] - UI design specifications for context display
  - [Source: _bmad-output/planning-artifacts/prd.md#FR34-FR41] - Functional requirements for context intelligence

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Developer Context Section

### Technical Requirements

**Context Panel UI Component:**
- Expandable panel triggered by Vital Signs Bar "Files" count click
- File list with filename, relative path, token count, and status indicators
- Sorting by relevance score (current file first, then imports, recent, related)
- Action buttons for each file: Remove from context, View full content, Refresh
- Total token usage display with budget percentage
- Visual distinctions: bold for current file, icons for imports, timestamps for recent files
- Click-to-open functionality for file navigation
- Real-time updates as context changes
- Context snapshot preservation for suggestion reproducibility

**Integration Requirements:**
- Vital Signs Bar shows current file count with click-to-expand
- Panel positioning avoids HUD collision using anti-collision algorithm
- State synchronization between backend Context Agent and frontend display
- Message passing via postMessage for context updates
- Performance optimized for 60fps animations and real-time updates

**Context Management:**
- Dynamic file removal/addition capabilities
- Content expansion for summarized files
- Context refresh functionality
- State persistence across suggestion generations

### Architecture Compliance

**Webview Component Architecture:**
- [Source: _bmad-output/planning-artifacts/architecture.md#Webview Rendering & Animation Architecture] - Vanilla JS ES6 classes, CSS-driven animations, GPU acceleration
- Follows component pattern: `src/webview/components/context-panel.js`
- Uses state manager subscription for real-time updates
- Implements BEM CSS naming convention
- Leverages requestAnimationFrame for smooth animations

**State Management Integration:**
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision #3: Dual State Pattern] - Backend source of truth, frontend mirror
- Context state managed by ExtensionStateManager
- Frontend subscribes to context updates via WebviewStateManager
- Real-time sync via postMessage with granular updates

**Context Agent Extension:**
- [Source: _bmad-output/planning-artifacts/architecture.md#Context Intelligence & File Management] - Context Agent manages file loading and optimization
- Extends existing Context Agent with dynamic management methods
- Maintains token optimization and relevance scoring
- Preserves existing file loading patterns

### Library Framework Requirements

**Required Dependencies:**
- No additional dependencies - use existing vanilla JS and VSCode APIs
- Leverages existing state management and message passing infrastructure

**VSCode API Integration:**
- Uses `vscode.workspace.openTextDocument()` for file opening
- Integrates with existing postMessage communication
- Follows established webview security policies

### File Structure Requirements

**New Files Required:**
- `src/webview/components/context-panel.js` - Main context panel component
- `src/webview/styles/components/context-panel.css` - Context panel styling
- `src/webview/components/__tests__/context-panel.test.js` - Component unit tests

**Modified Files:**
- `src/webview/components/vital-signs-bar.js` - Add files count and click handler
- `src/agents/context/context-agent.ts` - Add dynamic file management methods
- `src/webview/state/state-manager.js` - Add context state handling
- `src/webview/styles/components/vital-signs.css` - Update for files count display

### Testing Requirements

**Unit Tests:**
- Context panel rendering with various file states
- File action button functionality (remove, view, refresh)
- Sorting and visual indicator logic
- Real-time update handling
- Panel expand/collapse behavior

**Integration Tests:**
- Vital Signs Bar integration and click handling
- State synchronization between backend and frontend
- File opening via VSCode API
- Context snapshot saving and loading

**Performance Tests:**
- Real-time update performance (maintain 60fps)
- Large context list rendering efficiency
- Memory usage with many files

## Previous Story Intelligence

**Previous Story in Epic 6:** 6-2-implement-token-budget-management-and-optimization

**Learnings Applied:**
- Token optimization strategies established in Story 6.2
- File prioritization and truncation patterns implemented
- Context loading infrastructure already in place
- Token budget management provides foundation for display
- User notification patterns for context changes established

**Problems Encountered in Previous Story:**
- Performance impact of token estimation on large files
- Balancing context quality with token limits
- User confusion about truncated content

**Solutions Found:**
- Progressive loading with early budget checking
- Intelligent truncation preserving function signatures
- Clear user notifications for optimization actions
- Real-time token usage display in Vital Signs

## Git Intelligence Summary

**Recent Commits Analysis:**
- Context loading implementation with token optimization
- File prioritization algorithms
- Token estimation and budget management
- User interface updates for context feedback

**Established Patterns:**
- Async file processing with progress indicators
- Token-aware content optimization
- Real-time UI updates for context changes
- Error handling for file access issues

## Latest Tech Information

**Context Display Patterns (2026):**
- Expandable panels with smooth animations
- Real-time data visualization
- Interactive file management interfaces
- Performance-optimized list rendering

**VSCode Webview Best Practices:**
- Efficient DOM manipulation with requestAnimationFrame
- Memory management for large file lists
- Accessibility support with ARIA attributes
- Cross-platform compatibility considerations

## Project Context Reference

**From project-context.md:**
- [Source: _bmad-output/project-context.md#Context Intelligence & File Management] - Context loading and display requirements
- [Source: _bmad-output/project-context.md#HUD Interface & Visualization] - UI component patterns and performance requirements
- [Source: _bmad-output/project-context.md#State Management Patterns] - Real-time synchronization and subscription patterns
- [Source: _bmad-output/project-context.md#Performance Critical Rules] - 60fps animation and <100ms response requirements

**Key Rules Applied:**
- Use vanilla JS with ES6 classes for webview components
- Implement GPU-accelerated animations with CSS transforms
- Follow BEM naming convention for CSS classes
- Use immutable state updates and subscription patterns
- Maintain accessibility with keyboard navigation and screen reader support
- Optimize for performance with requestAnimationFrame and efficient DOM updates

## Story Completion Status

**Ultimate context engine analysis completed - comprehensive developer guide created**

**Story Details:**
- Story ID: 6.3
- Story Key: 6-3-implement-visible-context-file-tracking-and-display
- Status: ready-for-dev
- File: _bmad-output/implementation-artifacts/6-3-implement-visible-context-file-tracking-and-display.md

**Next Steps:**
1. Review the comprehensive story in the file above
2. Run dev agents `dev-story` for optimized implementation
3. Run `code-review` when complete (auto-marks done)
4. Optional: Run TEA `*automate` after `dev-story` to generate guardrail tests

**The developer now has everything needed for flawless implementation!**