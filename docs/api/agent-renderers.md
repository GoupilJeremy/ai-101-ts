# Agent Renderers API Reference

This guide covers the `IAgentRenderer` interface for creating custom agent visualizations in Suika.

## Overview

The `IAgentRenderer` interface allows you to customize how AI agents are displayed in the HUD. You can create unique visual representations while maintaining 60fps performance.

## Interface Definition

```typescript
interface IAgentRenderer {
  /** Render the agent in the given container */
  render(context: AgentRenderContext, container: HTMLElement, options?: RenderOptions): void;
  
  /** Get the size requirements for this renderer */
  getSize(): { width: number; height: number };
  
  /** Animate a state transition */
  animate(transition: RenderTransition): void;
  
  /** Clean up resources when renderer is destroyed */
  destroy(): void;
  
  /** Subscribe to state updates */
  onStateUpdate(callback: StateUpdateCallback): IDisposable;
}
```

## Method Reference

### `render(context, container, options?)`

Renders the agent visualization in the provided container.

**Parameters:**
- `context: AgentRenderContext` - Current agent state and metadata
- `container: HTMLElement` - DOM element to render into
- `options?: RenderOptions` - Optional rendering configuration

**Example:**
```typescript
render(context: AgentRenderContext, container: HTMLElement): void {
  container.innerHTML = `
    <div class="my-agent ${context.state}">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" class="agent-body"/>
      </svg>
      <span class="agent-label">${context.agentType}</span>
    </div>
  `;
}
```

### `getSize()`

Returns the dimensions required by this renderer.

**Returns:** `{ width: number; height: number }`

**Example:**
```typescript
getSize(): { width: number; height: number } {
  return { width: 80, height: 80 };
}
```

### `animate(transition)`

Performs an animated transition between states.

**Parameters:**
- `transition: RenderTransition` - Describes the animation to perform

**Example:**
```typescript
animate(transition: RenderTransition): void {
  const element = this.container.querySelector('.agent-body');
  if (!element) return;
  
  element.animate([
    { transform: 'scale(1)', opacity: 0.5 },
    { transform: 'scale(1.2)', opacity: 1 },
    { transform: 'scale(1)', opacity: 0.5 }
  ], {
    duration: transition.duration,
    easing: 'ease-in-out'
  });
}
```

### `destroy()`

Cleans up all resources when the renderer is being removed.

**Example:**
```typescript
destroy(): void {
  // Cancel animations
  this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
  
  // Remove event listeners
  this.disposables.forEach(d => d.dispose());
  
  // Clear container
  this.container.innerHTML = '';
}
```

### `onStateUpdate(callback)`

Subscribes to state updates for reactive rendering.

**Parameters:**
- `callback: StateUpdateCallback` - Function called when state changes

**Returns:** `IDisposable` - Subscription that can be disposed

**Example:**
```typescript
onStateUpdate(callback: StateUpdateCallback): IDisposable {
  this.stateCallbacks.push(callback);
  
  return {
    dispose: () => {
      const index = this.stateCallbacks.indexOf(callback);
      if (index >= 0) this.stateCallbacks.splice(index, 1);
    }
  };
}
```

## Complete Implementation Example

```typescript
import { 
  IAgentRenderer, 
  AgentRenderContext, 
  RenderOptions, 
  RenderTransition,
  StateUpdateCallback,
  IDisposable 
} from 'suika';

export class MinimalistAgentRenderer implements IAgentRenderer {
  private container: HTMLElement | null = null;
  private stateCallbacks: StateUpdateCallback[] = [];
  private animationFrameId: number | null = null;
  private currentState: string = 'idle';
  
  render(
    context: AgentRenderContext, 
    container: HTMLElement, 
    options?: RenderOptions
  ): void {
    this.container = container;
    this.currentState = context.state;
    
    // Create minimalist SVG representation
    container.innerHTML = `
      <div class="minimalist-agent" data-state="${context.state}">
        <svg viewBox="0 0 100 100" class="agent-icon">
          ${this.getSvgForAgent(context.agentType)}
        </svg>
        ${options?.showLabel ? `<span class="label">${context.agentType}</span>` : ''}
      </div>
    `;
    
    // Apply GPU-accelerated styles
    this.applyStyles(container);
    
    // Start breathing animation if idle
    if (context.state === 'idle') {
      this.startBreathingAnimation();
    }
  }
  
  private getSvgForAgent(type: string): string {
    const icons: Record<string, string> = {
      architect: '<path d="M20,80 L50,20 L80,80 Z" fill="currentColor"/>',
      coder: '<rect x="25" y="25" width="50" height="50" fill="currentColor"/>',
      reviewer: '<circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="4"/>',
      context: '<ellipse cx="50" cy="50" rx="40" ry="25" fill="currentColor"/>'
    };
    return icons[type] ?? icons.coder;
  }
  
  private applyStyles(container: HTMLElement): void {
    const style = document.createElement('style');
    style.textContent = `
      .minimalist-agent {
        will-change: transform, opacity;
        transform: translateZ(0);
        transition: opacity 0.3s ease;
      }
      
      .minimalist-agent[data-state="idle"] { opacity: 0.4; }
      .minimalist-agent[data-state="thinking"] { opacity: 0.7; }
      .minimalist-agent[data-state="active"] { opacity: 1; }
      .minimalist-agent[data-state="alert"] { 
        opacity: 1;
        animation: pulse 1s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      @keyframes breathe {
        0%, 100% { transform: scale(1); opacity: 0.4; }
        50% { transform: scale(1.05); opacity: 0.6; }
      }
      
      .agent-icon {
        width: 60px;
        height: 60px;
        color: var(--vscode-foreground, #333);
      }
      
      .label {
        font-size: 10px;
        text-transform: uppercase;
        opacity: 0.7;
      }
    `;
    container.appendChild(style);
  }
  
  private startBreathingAnimation(): void {
    const element = this.container?.querySelector('.minimalist-agent');
    if (!element) return;
    
    (element as HTMLElement).style.animation = 'breathe 3s ease-in-out infinite';
  }
  
  getSize(): { width: number; height: number } {
    return { width: 80, height: 100 };
  }
  
  animate(transition: RenderTransition): void {
    const element = this.container?.querySelector('.minimalist-agent');
    if (!element) return;
    
    // Stop current animation
    (element as HTMLElement).style.animation = 'none';
    
    // Perform transition animation
    element.animate([
      { 
        transform: `scale(1) rotate(0deg)`,
        opacity: this.getOpacityForState(transition.fromState)
      },
      { 
        transform: `scale(1.15) rotate(5deg)`,
        opacity: 0.9
      },
      { 
        transform: `scale(1) rotate(0deg)`,
        opacity: this.getOpacityForState(transition.toState)
      }
    ], {
      duration: transition.duration,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    });
    
    // Update data attribute
    element.setAttribute('data-state', transition.toState);
    this.currentState = transition.toState;
    
    // Restart breathing if returning to idle
    if (transition.toState === 'idle') {
      setTimeout(() => this.startBreathingAnimation(), transition.duration);
    }
  }
  
  private getOpacityForState(state: string): number {
    const opacities: Record<string, number> = {
      idle: 0.4,
      thinking: 0.7,
      active: 1,
      alert: 1,
      success: 1
    };
    return opacities[state] ?? 0.5;
  }
  
  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.stateCallbacks = [];
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
  
  onStateUpdate(callback: StateUpdateCallback): IDisposable {
    this.stateCallbacks.push(callback);
    
    return {
      dispose: () => {
        const index = this.stateCallbacks.indexOf(callback);
        if (index >= 0) {
          this.stateCallbacks.splice(index, 1);
        }
      }
    };
  }
  
  // Call this when state changes externally
  notifyStateChange(newState: string): void {
    const oldState = this.currentState;
    this.currentState = newState;
    
    this.stateCallbacks.forEach(cb => {
      cb({ previousState: oldState, currentState: newState });
    });
  }
}
```

## Performance Requirements

### 60fps Animation Target

To maintain smooth animations at 60fps:

1. **Use GPU Acceleration**
   ```css
   .agent-element {
     will-change: transform, opacity;
     transform: translateZ(0); /* Force GPU layer */
   }
   ```

2. **Avoid Layout Thrashing**
   ```typescript
   // Bad: causes reflow on each iteration
   elements.forEach(el => {
     el.style.width = el.offsetWidth + 10 + 'px';
   });
   
   // Good: batch reads, then writes
   const widths = elements.map(el => el.offsetWidth);
   elements.forEach((el, i) => {
     el.style.width = widths[i] + 10 + 'px';
   });
   ```

3. **Use requestAnimationFrame**
   ```typescript
   private animationLoop(): void {
     // Update animations
     this.updateBreathingAnimation();
     
     // Schedule next frame
     this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
   }
   ```

4. **Prefer CSS Animations**
   ```typescript
   // Prefer CSS animations over JavaScript for simple transitions
   element.classList.add('state-transition');
   ```

### GPU-Accelerated CSS Patterns

```css
/* Only animate transform and opacity for best performance */
.agent-transition {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Use 3D transforms for GPU acceleration */
.agent-move {
  transform: translate3d(var(--x), var(--y), 0);
}

/* Prepare browser for upcoming changes */
.agent-will-animate {
  will-change: transform;
}
```

## Lifecycle Management

### Initialization Flow

```
1. render() called with initial context
   ↓
2. Create DOM structure
   ↓
3. Apply styles and start idle animation
   ↓
4. onStateUpdate() subscriptions set up
   ↓
5. Ready for state transitions
```

### State Update Flow

```
1. State change detected
   ↓
2. onStateUpdate callbacks triggered
   ↓
3. animate() called with transition details
   ↓
4. Visual transition performed
   ↓
5. Data attributes updated
```

### Destruction Flow

```
1. destroy() called
   ↓
2. Cancel all animations
   ↓
3. Dispose all subscriptions
   ↓
4. Clear DOM contents
   ↓
5. Null references (GC cleanup)
```

## Related Documentation

- [Getting Started](./getting-started.md)
- [LLM Providers](./llm-providers.md)
- [Events API](./events.md)
- [Architecture Documentation](/docs/architecture/index.md)
