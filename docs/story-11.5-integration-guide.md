# Story 11.5 - Agent Character Integration

**End-to-End Integration of Animated Agent Characters**

## Overview

Story 11.5 completes the integration of animated agent characters into the Suika extension by connecting the backend AgentOrchestrator with the frontend AgentCharacterComponent through SpatialManager.

## Architecture

```
┌────────────────────────────────────────────────────┐
│                  Backend (Extension)                │
│  ┌──────────────────────────────────────────────┐  │
│  │         AgentOrchestrator                    │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │  runAgent(type, request)                │  │  │
│  │  │  1. Get cursor line                     │  │  │
│  │  │  2. SpatialManager.attachAgentToLine()  │  │  │
│  │  │  3. Execute agent                       │  │  │
│  │  │  4. setTimeout -> detachAgent()         │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
│                        ↓                            │
│  ┌──────────────────────────────────────────────┐  │
│  │         SpatialManager                        │  │
│  │  - agentAnchors: Map<AgentType, number>      │  │
│  │  - attachAgentToLine(agent, line)            │  │
│  │  - detachAgent(agent)                        │  │
│  │  - calculatePosition()                       │  │
│  │  - postMessageToWebview()                    │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
                        ↓ postMessage
┌────────────────────────────────────────────────────┐
│                  Frontend (Webview)                 │
│  ┌──────────────────────────────────────────────┐  │
│  │         main.ts (message handler)             │  │
│  │  case 'toWebview:agentPositionUpdate':       │  │
│  │    agentCharacterManager.handlePositionUpdate│  │
│  └──────────────────────────────────────────────┘  │
│                        ↓                            │
│  ┌──────────────────────────────────────────────┐  │
│  │      AgentCharacterManager                    │  │
│  │  - characters: Map<AgentType, Component>     │  │
│  │  - handlePositionUpdate(agent, position)     │  │
│  └──────────────────────────────────────────────┘  │
│                        ↓                            │
│  ┌──────────────────────────────────────────────┐  │
│  │      AgentCharacterComponent                  │  │
│  │  - updatePosition(position)                   │  │
│  │  - Animate SVG character                      │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

## Changes Made

### 1. AgentOrchestrator Integration

**File:** `src/agents/orchestrator.ts`

**Added:**
- Import `SpatialManager`
- Anchor agent when starting (line 266-271)
- Detach agent after completion with 2s delay (line 285-292)
- Detach agent after error with 3s delay (line 300-307)
- Error handling with try-catch blocks

**Code:**
```typescript
import { SpatialManager } from '../ui/spatial-manager.js';

private async runAgent(type: AgentType, request: IAgentRequest): Promise<IAgentResponse> {
    const activeEditor = vscode.window.activeTextEditor;
    const anchorLine = activeEditor?.selection.active.line;

    // Update state
    this.stateManager.updateAgentState(type, 'thinking', `Processing request...`, anchorLine);

    // Story 11.5: Anchor agent character to current line
    if (anchorLine !== undefined) {
        try {
            SpatialManager.getInstance().attachAgentToLine(type, anchorLine);
        } catch (error) {
            ErrorHandler.log(`Failed to anchor agent ${type}: ${error}`, 'WARNING');
        }
    }

    try {
        const response = await agent.execute(request);
        this.stateManager.updateAgentState(type, 'success', `Task complete.`, anchorLine);

        // Story 11.5: Detach after 2s to show success state
        setTimeout(() => {
            try {
                SpatialManager.getInstance().detachAgent(type);
            } catch (error) {
                ErrorHandler.log(`Failed to detach agent ${type}: ${error}`, 'WARNING');
            }
        }, 2000);

        return response;
    } catch (error: any) {
        this.stateManager.updateAgentState(type, 'alert', `Error: ${error.message}`);

        // Story 11.5: Detach after 3s to show error state
        setTimeout(() => {
            try {
                SpatialManager.getInstance().detachAgent(type);
            } catch (error) {
                ErrorHandler.log(`Failed to detach agent ${type}: ${error}`, 'WARNING');
            }
        }, 3000);

        throw error;
    }
}
```

### 2. Integration Tests

**File:** `src/agents/__tests__/orchestrator-spatial-integration.test.ts`

**Coverage:** 11 tests covering:
- ✅ Agent anchoring on activation
- ✅ No anchoring without active editor
- ✅ Agent detachment after success (2s delay)
- ✅ Agent detachment after error (3s delay)
- ✅ Multiple agents anchoring
- ✅ Error handling (graceful degradation)
- ✅ Edge cases (undefined line, rapid cycles)

## User Flow

### 1. User Triggers Agent

```typescript
// User invokes command or types in editor
// VSCode cursor is at line 50
```

### 2. Backend Processing

```typescript
// AgentOrchestrator.processUserRequest() called
// → runAgent('context', { prompt })
//   → anchorLine = 50
//   → SpatialManager.attachAgentToLine('context', 50)
//     → Calculate position { x: -60, y: 400, ... }
//     → postMessageToWebview({ type: 'agentPositionUpdate', ... })
```

### 3. Webview Animation

```typescript
// main.ts receives message
// → AgentCharacterManager.handlePositionUpdate('context', position)
//   → AgentCharacterComponent.updatePosition(position)
//     → CSS animation: fade in, scale up, position at line 50
//     → Character appears on screen! 🎨
```

### 4. Agent Completes Work

```typescript
// Agent finishes execution
// → Success state shown for 2 seconds
// → setTimeout 2000ms
// → SpatialManager.detachAgent('context')
//   → postMessageToWebview({ position: null })
//   → Character animates out (scale down, fade)
```

## Timing Details

### Success Flow
```
t=0ms     Agent starts, anchors to line
t=0-100ms Agent executes (varies)
t=100ms   Agent completes, updates to 'success'
t=2100ms  Agent detaches, character fades out
```

### Error Flow
```
t=0ms     Agent starts, anchors to line
t=0-100ms Agent executes
t=100ms   Error occurs, updates to 'alert'
t=3100ms  Agent detaches (longer delay for error visibility)
```

## Error Handling

All SpatialManager calls are wrapped in try-catch blocks:

```typescript
try {
    SpatialManager.getInstance().attachAgentToLine(type, anchorLine);
} catch (error) {
    // Log warning but don't fail
    // Spatial positioning is non-critical UI feature
    ErrorHandler.log(`Failed to anchor agent ${type}: ${error}`, 'WARNING');
}
```

**Rationale:**
- Character positioning is a visual enhancement
- Should never break core agent functionality
- Graceful degradation if SpatialManager fails

## Testing

**Run Tests:**
```bash
npm run test:unit -- orchestrator-spatial-integration
```

**Results:**
```
✓ 11 tests passed in 21ms
```

**Test Scenarios:**
1. **Basic Anchoring:** Verify agent anchors on start
2. **No Editor:** Handle missing activeTextEditor gracefully
3. **Success Detachment:** Verify 2s delay before detach
4. **Error Detachment:** Verify 3s delay on error
5. **Multiple Agents:** Multiple agents can anchor simultaneously
6. **Error Recovery:** SpatialManager errors don't crash orchestrator
7. **Undefined Line:** Handle undefined anchorLine
8. **Rapid Cycles:** Handle rapid start/stop without issues

## Message Protocol

### Anchor Message

**Sent when:** Agent starts working

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

### Detach Message

**Sent when:** Agent completes/errors (after delay)

```typescript
{
    type: 'toWebview:agentPositionUpdate',
    agentId: 'architect',
    position: null
}
```

## Demo Scenarios

### Scenario 1: Simple Request

```
1. User: "Add a comment to this function" (cursor at line 50)
2. Context agent appears at line 50 (left side, -60px)
3. Context loads files (2s)
4. Context fades out
5. Coder appears at line 50 (right side, +20px)
6. Coder generates comment (3s)
7. Coder fades out
8. Suggestion appears
```

### Scenario 2: Multi-Agent Collaboration

```
1. User: "Refactor this class" (cursor at line 100)
2. Context agent appears (-60px from line 100)
3. Architect agent appears (-120px from line 100)
4. Both analyze simultaneously
5. Context fades out
6. Coder appears (+20px from line 100)
7. Coder implements refactoring
8. Reviewer appears (+80px from line 100)
9. Reviewer validates code
10. All fade out sequentially
```

### Scenario 3: User Scrolls During Execution

```
1. Agent anchored to line 50
2. Character visible at line 50
3. User scrolls down to line 150
4. SpatialManager detects scroll (onDidChangeTextEditorVisibleRanges)
5. Character position updates (still at line 50, now off-screen)
6. Character opacity fades to 0.3 (isVisible: false)
7. User scrolls back to line 50
8. Character fades back in (opacity: 1.0)
```

## Performance

- **Minimal overhead:** SpatialManager position calculation is O(1)
- **Non-blocking:** Animations run on GPU via transform3d
- **Graceful degradation:** Errors don't impact agent execution
- **Event-driven:** Updates only on agent start/stop, scroll, resize

## Known Limitations

1. **Editor bounds estimation:** Currently uses estimated viewport size (1200x800). Could be improved with actual measurements.

2. **Multiple rapid executions:** If agent executes very quickly (<2s), detachment timer may overlap with next execution. This is handled gracefully but creates visual flicker.

3. **No character persistence:** Characters detach after completion. Future stories (11.7+) will add inter-agent interactions where characters persist longer.

## Future Enhancements

### Story 11.6 - End-to-End Tests
- Visual regression tests
- E2E webview integration tests
- Performance benchmarks

### Story 11.7 - Inter-Agent Interactions
- Ink strokes between agents
- Visual communication
- Persistent characters during collaboration

### Story 11.10 - Collective Enso Fusion
- All agents merge into single circle
- Collaborative mode visualization

## Troubleshooting

### Characters Don't Appear

**Check:**
1. Is webview loaded? (Check DevTools console for "AgentCharacterManager initialized")
2. Is agent actually executing? (Check backend logs for "Agent registered")
3. Is SpatialManager initialized? (Check for errors in extension host)

**Debug:**
```typescript
// In orchestrator.ts
console.log('Anchoring agent:', type, 'to line:', anchorLine);

// In spatial-manager.ts
console.log('SpatialManager.attachAgentToLine called:', agentId, lineNumber);

// In agent-character.ts (webview)
console.log('Position update received:', agentId, position);
```

### Characters Appear But Don't Move

**Check:**
1. CSS animations enabled? (Not in performance mode)
2. Position messages being sent? (Check webview console)
3. Transform3d supported? (Check browser compatibility)

### Characters Flicker

**Cause:** Rapid agent start/stop cycles

**Solution:** Adjust detachment delays in orchestrator.ts or debounce rapid executions

## Acceptance Criteria ✅

- [x] AgentOrchestrator imports and uses SpatialManager
- [x] Agents anchor to cursor line when starting
- [x] Agents detach after completion (2s delay)
- [x] Agents detach after error (3s delay)
- [x] Error handling prevents crashes
- [x] Integration tests cover all scenarios
- [x] 11 integration tests passing
- [x] Documentation complete

**Story 11.5: COMPLETE** ✅

---

Made with 墨 (ink) and ❤️ for Suika 🍉
