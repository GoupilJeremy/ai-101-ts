import {
    IAgentRenderer,
    AgentRenderContext,
    RenderTransition,
    RenderOptions,
    IDisposable,
    IAgentState,
    StateUpdateCallback
} from '../../src/api/index.js';

/**
 * Example of a custom SVG-based agent renderer.
 * 
 * This example demonstrates:
 * 1. DOM integration using SVG
 * 2. GPU-accelerated animations using CSS transforms
 * 3. State update handling via subscriptions
 * 4. Proper cleanup in the destroy lifecycle method
 * 5. Opting out of default styling
 * 
 * @public
 */
export class CustomSVGRenderer implements IAgentRenderer {
    private container?: HTMLElement;
    private svgElement?: SVGSVGElement;
    private circleElement?: SVGCircleElement;
    private textElement?: SVGTextElement;
    private subscription?: IDisposable;
    private state: IAgentState;

    constructor() {
        // Initial dummy state
        this.state = {
            status: 'idle',
            lastUpdate: Date.now()
        };
    }

    /**
     * Initializes the renderer and creates the SVG structure.
     */
    render(context: AgentRenderContext, container: HTMLElement, options?: RenderOptions): void {
        this.container = container;
        this.state = context.state;

        // Create SVG element
        this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svgElement.setAttribute('viewBox', '0 0 100 100');
        this.svgElement.style.width = '100%';
        this.svgElement.style.height = '100%';
        this.svgElement.style.willChange = 'transform'; // GPU acceleration hint

        // Apply custom styling if requested
        if (options?.optOutDefaultStyling) {
            this.svgElement.style.filter = 'drop-shadow(0 0 5px rgba(0,0,0,0.5))';
        }

        // Create a central circle that represents the agent
        this.circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.circleElement.setAttribute('cx', '50');
        this.circleElement.setAttribute('cy', '50');
        this.circleElement.setAttribute('r', '40');
        this.circleElement.setAttribute('fill', this.getAgentColor(context.type));
        this.circleElement.style.transition = 'all 0.3s ease-in-out';

        // Create text for status
        this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.textElement.setAttribute('x', '50');
        this.textElement.setAttribute('y', '55');
        this.textElement.setAttribute('text-anchor', 'middle');
        this.textElement.setAttribute('fill', 'white');
        this.textElement.setAttribute('font-size', '10');
        this.textElement.textContent = context.icon;

        this.svgElement.appendChild(this.circleElement);
        this.svgElement.appendChild(this.textElement);
        container.appendChild(this.svgElement);

        // Subscribe to further state updates
        this.subscription = this.onStateUpdate((newState) => this.handleStateUpdate(newState));
    }

    /**
     * Returns the size of the agent for the layout system.
     */
    getSize(): { width: number; height: number } {
        return { width: 80, height: 80 };
    }

    /**
     * Handles specific animation transitions.
     */
    animate(transition: RenderTransition): void {
        if (!this.circleElement) return;

        switch (transition) {
            case 'idle-to-thinking':
                this.pulseAnimation();
                break;
            case 'thinking-to-working':
                this.spinAnimation();
                break;
            case 'working-to-success':
                this.successFlash();
                break;
            case 'appear':
                this.svgElement!.style.transform = 'scale(0)';
                requestAnimationFrame(() => {
                    this.svgElement!.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    this.svgElement!.style.transform = 'scale(1)';
                });
                break;
        }
    }

    /**
     * Cleans up resources to prevent memory leaks.
     */
    destroy(): void {
        if (this.subscription) {
            this.subscription.dispose();
        }
        if (this.svgElement && this.container) {
            this.container.removeChild(this.svgElement);
        }
    }

    /**
     * Implementation of the state subscription mechanism.
     * In a real extension, this would connect to the agent's event emitter.
     */
    onStateUpdate(callback: StateUpdateCallback): IDisposable {
        // Mock implementation of a subscription
        console.log('Registered for state updates');
        return {
            dispose: () => console.log('Unsubscribed from state updates')
        };
    }

    private handleStateUpdate(newState: IAgentState): void {
        this.state = newState;
        if (this.circleElement) {
            this.circleElement.style.opacity = newState.status === 'idle' ? '0.5' : '1';
        }
    }

    private getAgentColor(type: string): string {
        switch (type) {
            case 'architect': return '#4A90E2';
            case 'coder': return '#50C878';
            case 'reviewer': return '#FF6B6B';
            case 'context': return '#9B59B6';
            default: return '#808080';
        }
    }

    private pulseAnimation(): void {
        if (!this.circleElement) return;
        this.circleElement.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.1)', opacity: 0.8 },
            { transform: 'scale(1)', opacity: 1 }
        ], {
            duration: 1000,
            iterations: Infinity
        });
    }

    private spinAnimation(): void {
        if (!this.svgElement) return;
        this.svgElement.style.animation = 'spin 2s linear infinite';
        // Note: spin keyframes would be defined in a CSS file or injected
    }

    private successFlash(): void {
        if (!this.circleElement) return;
        const originalFill = this.circleElement.getAttribute('fill');
        this.circleElement.setAttribute('fill', '#FFD700'); // Gold
        setTimeout(() => {
            this.circleElement?.setAttribute('fill', originalFill || '#808080');
        }, 500);
    }
}
