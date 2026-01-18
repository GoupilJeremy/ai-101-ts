import { AgentType, IAgentState } from '../agents/shared/agent.interface.js';
export { AgentType, IAgentState };

/**
 * Represents a resource that can be disposed/cleaned up.
 * 
 * @public
 * @since 0.0.1
 */
export interface IDisposable {
    /**
     * Dispose of the resource.
     */
    dispose(): void;
}

/**
 * Context provided to the renderer for drawing an agent.
 * 
 * @public
 * @since 0.0.1
 */
export interface AgentRenderContext {
    /** The unique identifier of the agent */
    type: AgentType;
    /** Current state of the agent */
    state: IAgentState;
    /** Human-readable display name */
    displayName: string;
    /** SVG or Emoji icon identifier */
    icon: string;
    /** Current target line in the editor (for spatial tracking) */
    anchorLine?: number;
}

/**
 * Animation transitions for agent state changes.
 * 
 * @public
 * @since 0.0.1
 */
export type RenderTransition =
    | 'idle-to-thinking'
    | 'thinking-to-working'
    | 'working-to-success'
    | 'working-to-error'
    | 'any-to-idle'
    | 'appear'
    | 'disappear';

/**
 * Configuration options for the agent renderer.
 * 
 * @public
 * @since 0.0.1
 */
export interface RenderOptions {
    /** Whether to skip the default Sumi-e aesthetic styling */
    optOutDefaultStyling?: boolean;
    /** Enable performance mode (fewer particles/effects) */
    performanceMode?: boolean;
    /** Scale factor for the agent UI (default: 1.0) */
    scale?: number;
}

/**
 * Callback function for agent state updates.
 * 
 * @public
 * @since 0.0.1
 */
export type StateUpdateCallback = (state: IAgentState) => void;

/**
 * Interface for custom agent visual representations.
 * 
 * @public
 * @remarks
 * This interface is the primary extension point for creating custom agent visuals.
 * Custom renderers must maintain 60fps performance and use GPU-accelerated CSS.
 * 
 * **Semantic Versioning Guarantee:**
 * - This interface follows semantic versioning (semver).
 * - Breaking changes will require a major version bump.
 * 
 * @example
 * ```typescript
 * class MyCustomRenderer implements IAgentRenderer {
 *   render(context: AgentRenderContext, container: HTMLElement) {
 *     const div = document.createElement('div');
 *     div.textContent = `Agent: ${context.displayName}`;
 *     container.appendChild(div);
 *   }
 *   
 *   getSize() { return { width: 100, height: 100 }; }
 *   animate(transition: RenderTransition) { console.log(`Animating ${transition}`); }
 *   destroy() { console.log('Cleaning up'); }
 *   onStateUpdate(callback: StateUpdateCallback) {
 *     // Subscription logic
 *     return { dispose: () => {} };
 *   }
 * }
 * ```
 * 
 * @since 0.0.1
 */
export interface IAgentRenderer {
    /**
     * Renders the agent into the provided DOM container.
     * 
     * @param context - Initial context and state for the agent
     * @param container - The DOM element where the agent should be rendered
     * @param options - Optional configuration for this renderer
     * 
     * @remarks
     * Implementations should create their DOM structure here and append it 
     * to the container. They should NOT modify elements outside the container.
     */
    render(context: AgentRenderContext, container: HTMLElement, options?: RenderOptions): void;

    /**
     * Returns the preferred dimensions of the rendered agent.
     * 
     * @returns Object containing width and height in pixels
     * 
     * @remarks
     * These dimensions are used by the anti-collision and positioning systems.
     */
    getSize(): { width: number; height: number };

    /**
     * Trigger a visual animation for a state transition.
     * 
     * @param transition - The type of transition to animate
     * 
     * @remarks
     * Animations should be GPU-accelerated (using CSS transforms) to 
     * maintain 60fps performance.
     */
    animate(transition: RenderTransition): void;

    /**
     * Lifecycle method called when the agent is being removed from the UI.
     * 
     * @remarks
     * Implementations MUST clean up all DOM elements, event listeners, 
     * and stop any ongoing animations or timers.
     */
    destroy(): void;

    /**
     * Subscribes to agent state updates.
     * 
     * @param callback - Function called whenever the agent state changes
     * @returns A disposable to unsubscribe from updates
     * 
     * @remarks
     * The renderer should use these updates to adjust its visual state
     * without full re-renders when possible.
     */
    onStateUpdate(callback: StateUpdateCallback): IDisposable;
}
