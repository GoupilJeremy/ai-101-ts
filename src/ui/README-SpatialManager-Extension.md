# SpatialManager Extension - Line Anchoring

**Story 11.3** - Agent Line Anchoring Integration

## Overview

This document describes the extension made to `SpatialManager` in Story 11.3 to enable agents to anchor themselves to specific lines of code and automatically synchronize their positions during viewport changes (scroll, resize, active editor changes).

## What Was Added

### New Properties

```typescript
private agentAnchors: Map<AgentType, number> = new Map();
```

Tracks which line each agent is anchored to. Maps agent ID to line number (0-based).

### New Public Methods

#### `attachAgentToLine(agentId, lineNumber)`

Anchors an agent to a specific line of code. The agent will be positioned at this line and follow it during scroll.

```typescript
public attachAgentToLine(agentId: AgentType, lineNumber: number): void
```

**Parameters:**
- `agentId` - The agent to anchor ('context', 'architect', 'coder', 'reviewer')
- `lineNumber` - Target line number (0-based)

**Example:**
```typescript
const spatialManager = SpatialManager.getInstance();

// Position architect at line 50
spatialManager.attachAgentToLine('architect', 50);

// Position coder at line 75
spatialManager.attachAgentToLine('coder', 75);
```

**Behavior:**
- Stores the anchor mapping internally
- Immediately calculates position using `AgentPositioning.getAgentPosition()`
- Sends position update to webview via `postMessageToWebview()`
- Includes `isVisible` flag to indicate if line is currently in viewport

#### `detachAgent(agentId)`

Detaches an agent from its anchored line. Agent returns to default/neutral position.

```typescript
public detachAgent(agentId: AgentType): void
```

**Parameters:**
- `agentId` - The agent to detach

**Example:**
```typescript
spatialManager.detachAgent('architect');
// Agent is now detached, webview receives null position
```

**Behavior:**
- Removes agent from anchor map
- Sends null position to webview (signals detachment)

#### `getAnchoredAgents()`

Returns all currently anchored agents (immutable copy).

```typescript
public getAnchoredAgents(): Map<AgentType, number>
```

**Returns:** Map of agent ID to line number

**Example:**
```typescript
const anchors = spatialManager.getAnchoredAgents();
console.log('Architect anchored to:', anchors.get('architect')); // 50
console.log('Total anchored:', anchors.size); // 2
```

#### `isAgentAnchored(agentId)`

Checks if a specific agent is currently anchored.

```typescript
public isAgentAnchored(agentId: AgentType): boolean
```

**Example:**
```typescript
if (spatialManager.isAgentAnchored('architect')) {
    console.log('Architect is anchored');
}
```

### New Private Methods

#### `updateAgentPosition(agentId)`

Calculates and sends the position for an anchored agent.

**Called by:**
- `attachAgentToLine()` - initial positioning
- `resyncAllAnchors()` - viewport changes

**Logic:**
1. Gets anchor line from `agentAnchors` map
2. Gets editor bounds and visible ranges
3. Calls `AgentPositioning.getAgentPosition()` to calculate position
4. Checks if line is visible using `AgentPositioning.isLineVisible()`
5. Sends position (with `isVisible` flag) to webview

#### `resyncAllAnchors()`

Re-synchronizes all anchored agents. Called when viewport changes.

**Triggers:**
- Scroll events (`onDidChangeTextEditorVisibleRanges`)
- Active editor change (`onDidChangeActiveTextEditor`)

**Logic:**
Iterates through all anchored agents and calls `updateAgentPosition()` for each.

#### `getEditorBounds(editor)`

Gets the current editor bounds (position and size).

```typescript
private getEditorBounds(editor: vscode.TextEditor): EditorBounds
```

**Current Implementation:**
Returns estimated bounds (1200x800). Could be enhanced with actual measurements from webview.

#### `getVisibleRanges(editor)`

Gets the current visible ranges from the editor.

```typescript
private getVisibleRanges(editor: vscode.TextEditor): VisibleRange[]
```

Converts VSCode ranges to our `VisibleRange` format.

#### `notifyWebview(agentId, position)`

Sends position update to webview via `ExtensionStateManager`.

```typescript
private notifyWebview(
    agentId: AgentType,
    position: (AgentPosition & { isVisible?: boolean }) | null
): void
```

**Message Format:**
```typescript
{
    type: 'toWebview:agentPositionUpdate',
    agentId: 'architect',
    position: {
        x: -120,
        y: 400,
        anchorLine: 50,
        relativeY: 0.5,
        isVisible: true
    }
}
```

Or when detaching:
```typescript
{
    type: 'toWebview:agentPositionUpdate',
    agentId: 'architect',
    position: null
}
```

### Modified Methods

#### `initializeListeners()`

**Extended to:**
- Call `resyncAllAnchors()` when visible ranges change (scroll)
- Call `resyncAllAnchors()` when active editor changes

```typescript
vscode.window.onDidChangeTextEditorVisibleRanges(e => {
    this.syncCursorPosition(e.textEditor);
    this.resyncAllAnchors(); // NEW
});

vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
        this.syncCursorPosition(editor);
        this.resyncAllAnchors(); // NEW
    }
});
```

## Integration with AgentPositioning

SpatialManager now uses the `AgentPositioning` utility (Story 11.2) for all position calculations:

```typescript
import { AgentPositioning, EditorBounds, VisibleRange } from './agent-positioning.js';

// Calculate position
const position = AgentPositioning.getAgentPosition(
    agentId,
    anchorLine,
    totalLines,
    bounds
);

// Check visibility
const isVisible = AgentPositioning.isLineVisible(
    anchorLine,
    visibleRanges
);
```

This ensures:
- Consistent positioning logic
- Side-based positioning (left: context/architect, right: coder/reviewer)
- Collision avoidance (when using multi-agent positioning)
- Edge case handling (line clamping, empty docs, etc.)

## Usage Workflow

### 1. Attach Agent to Code Line

```typescript
// Example: Architect analyzes function at line 50
const spatialManager = SpatialManager.getInstance();
spatialManager.attachAgentToLine('architect', 50);

// Webview receives:
// { type: 'toWebview:agentPositionUpdate', agentId: 'architect', position: {...} }
```

### 2. User Scrolls Editor

```typescript
// VSCode fires: onDidChangeTextEditorVisibleRanges
// SpatialManager automatically:
// 1. Detects new visible range (e.g., lines 60-90)
// 2. Calls resyncAllAnchors()
// 3. Recalculates position for architect (still at line 50)
// 4. Updates isVisible flag to false (line 50 no longer visible)
// 5. Sends update to webview
```

### 3. Detach When Analysis Complete

```typescript
spatialManager.detachAgent('architect');

// Webview receives:
// { type: 'toWebview:agentPositionUpdate', agentId: 'architect', position: null }
```

## Testing

**Test Suite:** `src/ui/__tests__/spatial-manager.test.ts`

**Coverage:** 30 tests covering:
- ✅ Attaching agents to lines
- ✅ Detaching agents
- ✅ Getting anchored agents
- ✅ Checking anchor status
- ✅ Position update notifications
- ✅ Webview messaging
- ✅ Viewport synchronization
- ✅ Active editor changes
- ✅ Edge cases (negative lines, large docs, empty docs)
- ✅ Singleton pattern
- ✅ Dispose behavior

**Run Tests:**
```bash
npm run test:unit -- spatial-manager
```

**Results:**
```
✓ 30 passed in 13ms
```

## Message Protocol

### Webview Messages

#### Position Update

**Type:** `toWebview:agentPositionUpdate`

**When Sent:**
- Agent attached to line
- Viewport changes (scroll/resize)
- Active editor changes

**Payload:**
```typescript
{
    type: 'toWebview:agentPositionUpdate',
    agentId: AgentType,
    position: {
        x: number,           // Absolute X (e.g., -120 for architect)
        y: number,           // Absolute Y (relative to viewport)
        anchorLine: number,  // Target line (0-based)
        relativeY: number,   // 0-1 position in document
        isVisible: boolean   // Is line currently visible?
    } | null  // null = detach
}
```

**Webview Handling:**
```typescript
// In webview (Story 11.4+)
if (message.position === null) {
    // Agent detached - hide or return to neutral position
} else if (message.position.isVisible) {
    // Animate agent to position.x, position.y
} else {
    // Line is off-screen - optionally fade or hide agent
}
```

## Edge Cases Handled

### No Active Editor
```typescript
attachAgentToLine('architect', 50);
// Gracefully does nothing if no editor
```

### Empty Document
```typescript
// Document with 0 lines
attachAgentToLine('architect', 0);
// AgentPositioning handles gracefully
```

### Line Out of Range
```typescript
// Negative line
attachAgentToLine('architect', -10);
// AgentPositioning clamps to 0

// Line beyond document end
attachAgentToLine('architect', 9999);
// AgentPositioning clamps to last line
```

### Multiple Agents on Same Line
```typescript
attachAgentToLine('context', 50);
attachAgentToLine('architect', 50);
// Both positioned at line 50, different X offsets
// Context: -60px, Architect: -120px (no collision)
```

### Rapid Anchor Updates
```typescript
attachAgentToLine('architect', 50);
attachAgentToLine('architect', 75); // Replaces previous
// Only one anchor per agent
```

## Performance Considerations

- **O(1)** anchor lookup (Map-based)
- **O(n)** resync where n = number of anchored agents (typically 1-4)
- **Lazy calculation** - only calculates positions when needed
- **No polling** - event-driven updates only
- **Estimated bounds** - could be optimized with actual measurements

## Next Steps (Story 11.4+)

The webview will need to:

1. **Listen for messages** (`toWebview:agentPositionUpdate`)
2. **Update agent components** with new positions
3. **Animate transitions** when position changes
4. **Handle visibility** (fade when `isVisible: false`)
5. **React to detachment** (`position: null`)

Example webview handler:
```typescript
window.addEventListener('message', event => {
    const message = event.data;

    if (message.type === 'toWebview:agentPositionUpdate') {
        const { agentId, position } = message;

        if (position === null) {
            detachAgentVisual(agentId);
        } else {
            updateAgentPosition(agentId, position);
        }
    }
});
```

## Acceptance Criteria ✅

- [x] Method `attachAgentToLine(agentId, lineNumber)` implemented
- [x] Method `detachAgent(agentId)` implemented
- [x] Method `getAnchoredAgents()` returns map
- [x] Method `isAgentAnchored(agentId)` checks status
- [x] Internal `agentAnchors` Map tracks anchors
- [x] `updateAgentPosition()` calculates and sends position
- [x] `resyncAllAnchors()` updates all on viewport change
- [x] `initializeListeners()` hooks scroll/resize events
- [x] Messages sent via `ExtensionStateManager.postMessageToWebview()`
- [x] Integration with `AgentPositioning` utility
- [x] 30 unit tests passing
- [x] Documentation complete

**Story 11.3: COMPLETE** ✅

---

Made with 墨 (ink) and ❤️ for Suika 🍉
