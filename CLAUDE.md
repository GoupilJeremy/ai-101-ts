# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript and React implementation of TodoMVC with an added priority system. Part of the Kilo 101 Video Series on AI-assisted coding, demonstrating React 18 patterns with TypeScript and webpack bundling.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Development with watch mode
npm run dev

# Production build
npm run build

# Start local server (serves built app)
npm start
```

## Technology Stack

- React 18.2.0 with TypeScript 5.3.3
- Webpack 5 for bundling (custom config, not create-react-app)
- TodoMVC CSS for standard styling
- localStorage for data persistence

## Architecture

### Project Structure

```
source/
├── app.tsx           - Main TodoApp component, entry point
├── todoItem.tsx      - Individual todo item component
├── footer.tsx        - Footer with filters and clear completed
├── todoModel.ts      - Data model with observer pattern
├── interfaces.d.ts   - TypeScript interface definitions
├── constants.ts      - App constants and Priority type
└── utils.ts          - Utility functions (uuid, store, extend)
```

### State Management Pattern

- **TodoModel class** manages application data using observer pattern
- Components subscribe to model changes via `subscribe(onChange)` callback
- Model calls `inform()` after mutations to notify subscribers and persist to localStorage
- React component state manages UI-only state (editing, filtering, new todo priority)
- Data flow: User interaction → Component method → Model method → `inform()` → Re-render

### TodoModel API

Core methods in `source/todoModel.ts`:
- `addTodo(title, priority)` - Create new todo
- `toggle(todo)` / `toggleAll(checked)` - Toggle completion
- `destroy(todo)` - Delete todo
- `save(todo, text)` - Update title
- `updatePriority(todo, priority)` - Change priority level
- `clearCompleted()` - Remove completed todos
- `subscribe(onChange)` - Register change listener

All mutations use immutable patterns (map/filter instead of in-place modifications).

### Priority System

Each todo has a priority: `'low' | 'medium' | 'high'` (defined in `constants.ts`)
- Priority defaults to 'medium' for new todos
- Priority selector in both new todo input and individual todo items
- Priority icons: ⬇️ Low, ➡️ Medium, ⬆️ High
- Priority stored in ITodo interface and persisted to localStorage

### Routing

Hash-based routing for filters:
- `#/` or no hash → Show all todos
- `#/active` → Show active todos only
- `#/completed` → Show completed todos only

Handled in `handleHashChange()` method in app.tsx, listening to window 'hashchange' event.

## Key Patterns

### Immutability
All data updates use immutable patterns:
- `map()` for transformations
- `filter()` for deletions
- `concat()` for additions
- Object spreading in `Utils.extend()` for updates

### TypeScript
- Strict typing throughout with interfaces in `interfaces.d.ts`
- Separate Props and State interfaces for React components
- Priority type exported from constants for reuse

### Observer Pattern
TodoModel implements pub/sub:
1. Components subscribe with callbacks
2. Model stores callbacks in `onChanges` array
3. After each mutation, model calls `inform()`
4. `inform()` persists to localStorage and invokes all callbacks
5. Callbacks trigger React re-renders

## Development Notes

- Entry point: `source/app.tsx` (webpack config)
- Output: `dist/bundle.js` with source maps in development
- TypeScript config uses esModuleInterop for better module compatibility
- Follows TodoMVC conventions for consistency with other implementations
- localStorage key: 'react-todos'
