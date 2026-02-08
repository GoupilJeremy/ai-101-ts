/**
 * AgentInteractionManager - Visualizes agent-to-agent communication with animated ink strokes
 * Story 11.7 - Inter-Agent Interactions
 *
 * Creates animated SVG paths that travel between agents to visualize their collaboration.
 * Uses sumi-e inspired brush strokes with natural Bézier curves.
 */

import { AgentType } from '../../agents/shared/agent.interface.js';

/**
 * Position of an agent in screen coordinates
 */
export interface AgentPosition {
    x: number;
    y: number;
}

/**
 * Options for drawing an ink stroke
 */
export interface InkStrokeOptions {
    /** Optional message content (shown in tooltip) */
    message?: string;
    /** Whether this is a critical interaction (uses vermillion color) */
    critical?: boolean;
    /** Animation duration in milliseconds (default: 1200) */
    duration?: number;
    /** Callback fired when animation completes */
    onComplete?: () => void;
}

/**
 * Internal tracking for active strokes
 */
interface ActiveStroke {
    id: string;
    svg: SVGElement;
    fromAgent: AgentType;
    toAgent: AgentType;
}

/**
 * AgentInteractionManager - Singleton manager for inter-agent visual communication
 *
 * Draws animated ink strokes between agents to visualize their interactions.
 * Strokes are rendered as SVG paths with quadratic Bézier curves for natural brush-like appearance.
 *
 * Features:
 * - Animated stroke-dashoffset for progressive drawing effect
 * - Vermillion red for critical interactions, black for routine
 * - Optional tooltips for message content
 * - Performance limit: max 3 simultaneous strokes
 * - Auto-cleanup after animation completes
 *
 * @example
 * ```typescript
 * const manager = AgentInteractionManager.getInstance();
 *
 * // Draw a routine interaction
 * manager.drawInkStroke('architect', 'coder', {
 *   message: 'Sending architectural guidelines'
 * });
 *
 * // Draw a critical interaction
 * manager.drawInkStroke('reviewer', 'coder', {
 *   message: 'Security issue found!',
 *   critical: true
 * });
 * ```
 */
export class AgentInteractionManager {
    private static instance: AgentInteractionManager;
    private activeStrokes: Map<string, ActiveStroke> = new Map();
    private readonly maxSimultaneousStrokes = 3;

    private constructor() {
        console.log('AgentInteractionManager initialized');
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): AgentInteractionManager {
        if (!AgentInteractionManager.instance) {
            AgentInteractionManager.instance = new AgentInteractionManager();
        }
        return AgentInteractionManager.instance;
    }

    /**
     * Draws an animated ink stroke between two agents
     *
     * Story 11.7: Core method for visualizing agent interactions
     *
     * @param fromAgent - Source agent
     * @param toAgent - Destination agent
     * @param options - Stroke options (message, critical flag, duration, callback)
     *
     * @example
     * ```typescript
     * manager.drawInkStroke('context', 'architect', {
     *   message: 'Loaded 5 files',
     *   duration: 1000
     * });
     * ```
     */
    public drawInkStroke(
        fromAgent: AgentType,
        toAgent: AgentType,
        options: InkStrokeOptions = {}
    ): void {
        const {
            message = '',
            critical = false,
            duration = 1200,
            onComplete = null
        } = options;

        // Performance limit: max 3 simultaneous strokes
        if (this.activeStrokes.size >= this.maxSimultaneousStrokes) {
            console.warn('AgentInteractionManager: Max ink strokes reached, skipping');
            return;
        }

        // Get current positions of both agents
        const fromPos = this.getAgentPosition(fromAgent);
        const toPos = this.getAgentPosition(toAgent);

        if (!fromPos || !toPos) {
            console.warn(`AgentInteractionManager: Cannot draw stroke - agent positions not found (${fromAgent} -> ${toAgent})`);
            return;
        }

        // Create the SVG overlay with path
        const svg = this.createStrokeSVG(fromPos, toPos, critical);
        const strokeId = `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        svg.id = strokeId;

        // Add to DOM and track
        document.body.appendChild(svg);
        this.activeStrokes.set(strokeId, {
            id: strokeId,
            svg,
            fromAgent,
            toAgent
        });

        // Animate the stroke
        this.animateStroke(svg, duration, () => {
            // Cleanup
            svg.remove();
            this.activeStrokes.delete(strokeId);

            if (onComplete) {
                onComplete();
            }
        });

        // Add tooltip if message provided
        if (message) {
            this.attachMessageTooltip(svg, message);
        }

        console.log(`AgentInteractionManager: Drew ink stroke ${fromAgent} -> ${toAgent}${critical ? ' (CRITICAL)' : ''}`);
    }

    /**
     * Creates the SVG element with path for the ink stroke
     *
     * Story 11.7: Uses quadratic Bézier curve for natural brush-like appearance
     *
     * @param from - Starting position
     * @param to - Ending position
     * @param critical - Whether to use vermillion (critical) or black (routine) color
     * @returns SVG element with animated path
     */
    private createStrokeSVG(from: AgentPosition, to: AgentPosition, critical: boolean): SVGElement {
        // Create SVG container
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('ink-stroke-overlay');
        svg.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
        `;

        // Calculate control point for quadratic Bézier curve
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        // Add perpendicular offset for natural curvature
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Avoid division by zero for same position
        if (distance === 0) {
            console.warn('AgentInteractionManager: Cannot create stroke - agents at same position');
            return svg;
        }

        const perpX = -dy / distance * 30; // 30px curvature
        const perpY = dx / distance * 30;

        const controlX = midX + perpX;
        const controlY = midY + perpY;

        // Create path with quadratic Bézier curve
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`);
        path.setAttribute('stroke', critical ? 'var(--vermillion-red, #E74C3C)' : 'var(--ink-black, #2C3E50)');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.classList.add('ink-path');

        svg.appendChild(path);

        // Setup stroke-dasharray for animation
        // Must be added to DOM first to calculate length
        // Fallback to 250 for testing environments without full SVG support
        const pathLength = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 250;
        path.style.strokeDasharray = `${pathLength}`;
        path.style.strokeDashoffset = `${pathLength}`;

        return svg;
    }

    /**
     * Animates the ink stroke using stroke-dashoffset technique
     *
     * Story 11.7: Progressive drawing effect with fade-out
     *
     * @param svg - SVG element containing the path
     * @param duration - Animation duration in milliseconds
     * @param onComplete - Callback when animation finishes
     */
    private animateStroke(svg: SVGElement, duration: number, onComplete: () => void): void {
        const path = svg.querySelector('.ink-path') as SVGPathElement;
        if (!path) {
            console.warn('AgentInteractionManager: No path found in SVG');
            onComplete();
            return;
        }

        // Fallback for testing environments without full SVG support
        const pathLength = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 250;

        // Setup animation transition
        path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;

        // Start animation on next frame (allows transition to take effect)
        requestAnimationFrame(() => {
            path.style.strokeDashoffset = '0';
        });

        // Fade out at 80% of animation
        const fadeStartTime = duration * 0.8;
        setTimeout(() => {
            svg.style.transition = 'opacity 300ms ease-out';
            svg.style.opacity = '0';
        }, fadeStartTime);

        // Cleanup after fade completes
        const totalDuration = duration + 300;
        setTimeout(() => {
            onComplete();
        }, totalDuration);
    }

    /**
     * Attaches a tooltip to the stroke that displays on hover
     *
     * Story 11.7: Shows message content when hovering over stroke
     *
     * @param svg - SVG element to attach tooltip to
     * @param message - Message text to display
     */
    private attachMessageTooltip(svg: SVGElement, message: string): void {
        // Make SVG interactive for tooltip
        svg.style.pointerEvents = 'all';
        svg.style.cursor = 'help';

        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'ink-stroke-tooltip';
        tooltip.textContent = message;
        tooltip.style.cssText = `
            position: fixed;
            background: var(--tooltip-bg, #1E1E1E);
            color: var(--tooltip-text, #FFFFFF);
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 200ms ease;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            white-space: nowrap;
        `;
        document.body.appendChild(tooltip);

        // Show tooltip on hover
        svg.addEventListener('mouseenter', (e: MouseEvent) => {
            tooltip.style.left = `${e.clientX + 10}px`;
            tooltip.style.top = `${e.clientY + 10}px`;
            tooltip.style.opacity = '1';
        });

        // Follow mouse
        svg.addEventListener('mousemove', (e: MouseEvent) => {
            tooltip.style.left = `${e.clientX + 10}px`;
            tooltip.style.top = `${e.clientY + 10}px`;
        });

        // Hide tooltip on leave
        svg.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });

        // Cleanup tooltip with SVG
        const originalRemove = svg.remove.bind(svg);
        svg.remove = () => {
            tooltip.remove();
            originalRemove();
        };
    }

    /**
     * Gets the current screen position of an agent character
     *
     * Story 11.7: Retrieves position from AgentCharacterComponent elements
     *
     * @param agentId - Agent to locate
     * @returns Position in screen coordinates, or null if not found
     */
    private getAgentPosition(agentId: AgentType): AgentPosition | null {
        const agentElement = document.querySelector(`[data-agent-id="${agentId}"]`) as HTMLElement;
        if (!agentElement) {
            return null;
        }

        const rect = agentElement.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    /**
     * Gets the number of currently active strokes
     *
     * Useful for testing and debugging
     */
    public getActiveStrokeCount(): number {
        return this.activeStrokes.size;
    }

    /**
     * Gets the maximum allowed simultaneous strokes
     *
     * Useful for testing
     */
    public getMaxSimultaneousStrokes(): number {
        return this.maxSimultaneousStrokes;
    }

    /**
     * Clears all active strokes immediately
     *
     * Useful for cleanup and testing
     */
    public clearAllStrokes(): void {
        this.activeStrokes.forEach(stroke => {
            stroke.svg.remove();
        });
        this.activeStrokes.clear();
        console.log('AgentInteractionManager: All strokes cleared');
    }
}

export default AgentInteractionManager;
