# Project Overview

This is a TypeScript and React implementation of the TodoMVC application with an added priority system for task management. The project demonstrates modern React 18 patterns with TypeScript and uses webpack for bundling.

## Purpose

This project is part of the Kilo 101 Video Series on AI-assisted Coding. It serves as a practical example for learning TypeScript, React, and AI-assisted development workflows.

## Technology Stack

- **React 18.2.0** - UI framework
- **TypeScript 5.3.3** - Type safety and modern JavaScript features
- **Webpack 5** - Module bundling
- **TodoMVC CSS** - Standard TodoMVC styling

## Project Structure

```
source/
├── app.tsx           - Main application component
├── todoItem.tsx      - Individual todo item component
├── footer.tsx        - Application footer component
├── todoModel.ts      - Todo data model and business logic
├── interfaces.d.ts   - TypeScript interface definitions
├── constants.ts      - Application constants
└── utils.ts          - Utility functions
```

## Key Features

### Todo Management
- Add, edit, and delete todos
- Mark todos as complete/incomplete
- Filter todos by status (All, Active, Completed)
- Clear all completed todos
- Toggle all todos at once

### Priority System
Each todo has a priority level:
- **Low** - Less urgent tasks
- **Medium** - Standard priority
- **High** - Critical tasks

The priority can be updated for any todo through the UI.

## Data Model

### ITodo Interface
```typescript
interface ITodo {
  id: string,
  title: string,
  completed: boolean,
  priority: 'low' | 'medium' | 'high'
}
```

### TodoModel Class
The `TodoModel` class (source/todoModel.ts) implements:
- `addTodo(title, priority)` - Add new todo with priority
- `toggle(todo)` - Toggle completion status
- `toggleAll(checked)` - Toggle all todos
- `destroy(todo)` - Delete a todo
- `save(todo, text)` - Update todo text
- `updatePriority(todo, priority)` - Change todo priority
- `clearCompleted()` - Remove completed todos
- `subscribe(onChange)` - Listen for model changes

Data is persisted to localStorage and uses immutable patterns for state updates.

## Build & Development

### Available Scripts

```bash
# Build for production
npm run build

# Development mode with watch
npm run dev

# Start local server
npm start
```

### Development Workflow

1. Run `npm install` to install dependencies
2. Use `npm run dev` for development with hot reloading
3. Use `npm start` to serve the built application
4. Build production bundle with `npm run build`

## Architecture Patterns

### State Management
- Uses React component state for UI state
- TodoModel manages application data
- Observer pattern for model updates (subscribe/inform)
- localStorage for data persistence

### Immutability
The codebase uses immutable data patterns:
- `map()`, `filter()`, `reduce()` instead of mutations
- Object spreading for updates
- Pure functions where possible

### TypeScript
- Strict typing with interfaces
- Separation of props and state interfaces
- Type-safe model methods

## Recent Changes

The most recent commit added the priority system:
- Added `priority` field to ITodo interface
- Implemented `updatePriority()` method in TodoModel
- Added `onPriorityChange` to component props
- Updated UI to support priority selection

## Learning Resources

This project is featured in the [Kilo 101 Video Series](https://www.youtube.com/playlist?list=PLT--VxJTR64Mlx7vrLUMai5gz2vov-ifr) which provides tutorials on AI-assisted coding with Kilo Code.

## Branches

- **main** - Initial project state
- **episode-7** - Project after Episode 7 with added priorities

## Notes for Development

- The project uses webpack instead of create-react-app for more control over the build process
- TypeScript is configured with esModuleInterop for better module compatibility
- The codebase follows TodoMVC conventions for consistency with other implementations
- All data is stored locally in the browser's localStorage
