# Story 1.1: Initialize VSCode Extension Project with Yeoman Generator

Status: ready-for-dev

## Story

As a developer,
I want to initialize a new VSCode extension project using the Yeoman Generator with TypeScript and esbuild,
So that I have a production-ready foundation with optimal build performance.

## Acceptance Criteria

1. **AC1:** Run `npx --package yo --package generator-code -- yo code` successfully
2. **AC2:** Select "New Extension (TypeScript)" as the extension type
3. **AC3:** Select "esbuild" as the bundler (NOT webpack - CRITICAL)
4. **AC4:** Select "npm" as the package manager
5. **AC5:** Provide "ai-101-ts" as the extension name and identifier
6. **AC6:** A complete VSCode extension project structure is generated with:
   - `src/extension.ts` entry point
   - `package.json` with VSCode engine >=1.75.0
   - `.vscode/launch.json` for F5 debugging
   - esbuild configuration for bundling
7. **AC7:** The project compiles successfully with `npm run compile`
8. **AC8:** The extension activates in VSCode Extension Development Host (F5)

## Tasks / Subtasks

- [ ] Task 1: Initialize project with Yeoman Generator (AC: 1-5)
  - [ ] 1.1: Ensure Node.js 16+ and npm are installed (`node -v`, `npm -v`)
  - [ ] 1.2: Run the Yeoman generator command
  - [ ] 1.3: Respond to prompts with exact values specified
  - [ ] 1.4: Verify project structure is created

- [ ] Task 2: Verify generated project structure (AC: 6)
  - [ ] 2.1: Confirm `src/extension.ts` exists with proper boilerplate
  - [ ] 2.2: Confirm `package.json` contains VSCode engine requirement
  - [ ] 2.3: Confirm `.vscode/launch.json` exists for debugging
  - [ ] 2.4: Confirm esbuild configuration exists

- [ ] Task 3: Verify build and activation (AC: 7-8)
  - [ ] 3.1: Run `npm install` to install dependencies
  - [ ] 3.2: Run `npm run compile` and verify successful build
  - [ ] 3.3: Press F5 in VSCode to launch Extension Development Host
  - [ ] 3.4: Verify extension activates without errors in Output panel

- [ ] Task 4: Post-initialization cleanup and documentation
  - [ ] 4.1: Update extension description in package.json
  - [ ] 4.2: Verify .gitignore is properly configured
  - [ ] 4.3: Verify README.md is generated

## Dev Notes

### CRITICAL: Exact Command to Execute

```bash
npx --package yo --package generator-code -- yo code
```

### CRITICAL: Exact Prompt Responses

| Prompt | Required Response |
|--------|-------------------|
| What type of extension? | **New Extension (TypeScript)** |
| What's the name? | **ai-101-ts** |
| What's the identifier? | **ai-101-ts** |
| What's the description? | **VSCode AI agents with transparent HUD** |
| Which bundler? | **esbuild** (CRITICAL - NOT webpack!) |
| Which package manager? | **npm** |

### Latest Technical Information (January 2026)

- **generator-code version:** 1.11.15 (latest)
- **Recommended VSCode target:** 1.105.0+ (latest stable minus 2-3 months)
- **esbuild support:** Native in generator, provides <1s builds
- **TypeScript version:** 5.3.3+ (generator default)

### What the Generator Creates

```
ai-101-ts/
├── .vscode/
│   ├── extensions.json
│   ├── launch.json      # F5 debugging configured
│   ├── settings.json
│   └── tasks.json
├── src/
│   └── extension.ts     # Entry point
├── package.json         # Extension manifest + dependencies
├── tsconfig.json        # TypeScript configuration
├── esbuild.js           # Build configuration (esbuild)
├── .gitignore
├── .vscodeignore
└── README.md
```

### Build Performance Expectations

| Build Type | Expected Time |
|------------|---------------|
| Development compile | <1 second |
| Watch mode incremental | <200ms |
| Production build | <3 seconds |

### Project Structure Notes

- This story creates the **foundation** for all subsequent stories
- Story 1.2 will configure **dual-build** (extension Node.js + webview Browser)
- Story 1.2 will create the **webview scaffold** directory structure
- The generated `esbuild.js` will be replaced/enhanced in Story 1.2

### Alignment with Architecture

- **[Source: architecture.md#Starter Template Evaluation]** - Yeoman Generator is the SELECTED starter
- **[Source: architecture.md#Post-Initialization Configuration Required]** - Dual-build config is Story 1.2
- **[Source: architecture.md#Build Performance Expectations]** - <1s dev builds, <200ms watch

### Common Pitfalls to Avoid

1. **DO NOT select webpack** - esbuild is mandatory per architecture
2. **DO NOT modify esbuild config yet** - That's Story 1.2
3. **DO NOT create webview folder yet** - That's Story 1.2
4. **DO NOT add custom dependencies yet** - Keep generator defaults for this story

### Verification Checklist

- [ ] `npm run compile` exits with code 0
- [ ] Extension activates in Extension Development Host
- [ ] No errors in Output panel > "Extension Host"
- [ ] "Hello World" command works (Ctrl+Shift+P > "Hello World")

### References

- [Source: architecture.md#Starter Template Evaluation] - Yeoman selection rationale
- [Source: architecture.md#Post-Initialization Configuration Required] - Story sequencing
- [Source: epics.md#Epic 1] - Epic context and FRs covered
- [Microsoft Yeoman Generator GitHub](https://github.com/microsoft/vscode-generator-code)
- [VSCode Extension API - Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
- [Building VS Code Extensions in 2026 Guide](https://abdulkadersafi.com/blog/building-vs-code-extensions-in-2026-the-complete-modern-guide)

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

(To be filled during development)

### Completion Notes List

(To be filled during development)

### File List

(To be filled during development - list all files created/modified)
