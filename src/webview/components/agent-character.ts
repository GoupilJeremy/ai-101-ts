/**
 * AgentCharacterComponent - Animated SVG character for agents
 * Story 11.4 - Agent positioning with smooth animations
 *
 * Renders agents as animated SVG characters that anchor to code lines
 * and move smoothly through the editor viewport.
 */

import { AgentType } from '../../agents/shared/agent.interface.js';

/**
 * Position data received from SpatialManager
 */
export interface AgentPosition {
    x: number;
    y: number;
    anchorLine: number;
    relativeY: number;
    isVisible?: boolean;
}

/**
 * Visual states for agent animation (Story 11.9)
 */
export type AgentVisualState = 'idle' | 'thinking' | 'working' | 'success' | 'alert';

/**
 * Agent character state
 */
interface CharacterState {
    position: AgentPosition | null;
    isVisible: boolean;
    isAnimating: boolean;
    visualState: AgentVisualState;  // Story 11.9: Current visual state
}

/**
 * AgentCharacterComponent - Manages a single animated agent character
 *
 * @example
 * ```typescript
 * const architect = new AgentCharacterComponent('architect');
 * architect.render(container);
 *
 * // Update position (called via message from SpatialManager)
 * architect.updatePosition({
 *   x: -120,
 *   y: 400,
 *   anchorLine: 50,
 *   relativeY: 0.5,
 *   isVisible: true
 * });
 * ```
 */
export class AgentCharacterComponent {
    private agentId: AgentType;
    private element: HTMLElement | null = null;
    private svgContainer: HTMLElement | null = null;
    private state: CharacterState;

    /**
     * SVG paths for each agent (loaded from animations/*.svg)
     * These are the sumi-e characters created in Story 11.1
     */
    private static readonly SVG_CONTENT: Record<AgentType, string> = {
        architect: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="agent-character__svg">
                <circle cx="50" cy="15" r="8" fill="var(--ink-black, #2C3E50)"/>
                <path d="M50,23 Q45,50 50,80" stroke="var(--ink-black, #2C3E50)" stroke-width="3" stroke-linecap="round" fill="none"/>
                <path d="M35,45 L65,45" stroke="var(--ink-black, #2C3E50)" stroke-width="2" stroke-linecap="round"/>
                <circle cx="50" cy="15" r="2" fill="var(--vermillion-red, #E74C3C)" opacity="0.6"/>
            </svg>
        `,
        coder: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="agent-character__svg">
                <circle cx="50" cy="15" r="8" fill="var(--ink-black, #2C3E50)"/>
                <path d="M50,23 Q55,50 50,80" stroke="var(--ink-black, #2C3E50)" stroke-width="3" stroke-linecap="round" fill="none"/>
                <path d="M35,50 L45,55 L35,60" stroke="var(--pine-green, #27AE60)" stroke-width="2" stroke-linecap="round" fill="none"/>
                <circle cx="50" cy="15" r="2" fill="var(--pine-green, #27AE60)" opacity="0.6"/>
            </svg>
        `,
        reviewer: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="agent-character__svg">
                <circle cx="50" cy="15" r="8" fill="var(--ink-black, #2C3E50)"/>
                <path d="M50,23 L50,80" stroke="var(--ink-black, #2C3E50)" stroke-width="3" stroke-linecap="round"/>
                <path d="M35,45 Q50,35 65,45 Q65,55 50,65 Q35,55 35,45" stroke="var(--gold-yellow, #F39C12)" stroke-width="2" stroke-linecap="round" fill="none"/>
                <circle cx="50" cy="15" r="2" fill="var(--gold-yellow, #F39C12)" opacity="0.6"/>
            </svg>
        `,
        context: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="agent-character__svg">
                <circle cx="50" cy="15" r="8" fill="var(--ink-black, #2C3E50)"/>
                <path d="M50,23 Q48,50 50,80" stroke="var(--ink-black, #2C3E50)" stroke-width="3" stroke-linecap="round" fill="none"/>
                <circle cx="50" cy="50" r="15" stroke="var(--bamboo-green, #2ECC71)" stroke-width="2" fill="none"/>
                <path d="M60,60 L70,70" stroke="var(--bamboo-green, #2ECC71)" stroke-width="2" stroke-linecap="round"/>
                <circle cx="50" cy="15" r="2" fill="var(--bamboo-green, #2ECC71)" opacity="0.6"/>
            </svg>
        `
    };

    /**
     * Agent display names
     */
    private static readonly AGENT_NAMES: Record<AgentType, string> = {
        architect: 'Architect',
        coder: 'Coder',
        reviewer: 'Reviewer',
        context: 'Context'
    };

    constructor(agentId: AgentType) {
        this.agentId = agentId;
        this.state = {
            position: null,
            isVisible: false,
            isAnimating: false,
            visualState: 'idle'  // Story 11.9: Start in idle state
        };
    }

    /**
     * Render the character to the DOM
     *
     * @param container - Parent container element
     */
    public render(container: HTMLElement): void {
        if (this.element) {
            console.warn(`Agent ${this.agentId} already rendered`);
            return;
        }

        // Create main element
        this.element = document.createElement('div');
        this.element.id = `agent-character-${this.agentId}`;
        this.element.className = 'agent-character agent-character--idle';  // Story 11.9: Start with idle state
        this.element.dataset.agentId = this.agentId;
        this.element.dataset.state = 'idle';  // Story 11.9: Initial state for debugging
        this.element.setAttribute('role', 'img');
        this.element.setAttribute('aria-label', `${AgentCharacterComponent.AGENT_NAMES[this.agentId]} agent`);

        // Create SVG container
        this.svgContainer = document.createElement('div');
        this.svgContainer.className = 'agent-character__container';
        this.svgContainer.innerHTML = AgentCharacterComponent.SVG_CONTENT[this.agentId];

        this.element.appendChild(this.svgContainer);

        // Start hidden
        this.element.style.opacity = '0';
        this.element.style.transform = 'translate3d(0, 0, 0) scale(0.5)';
        this.element.style.pointerEvents = 'none';

        container.appendChild(this.element);
    }

    /**
     * Update agent position (called from message handler)
     *
     * @param position - New position from SpatialManager, or null to detach
     */
    public updatePosition(position: AgentPosition | null): void {
        if (!this.element) {
            console.warn(`Agent ${this.agentId} not rendered yet`);
            return;
        }

        // Handle detachment
        if (position === null) {
            this.detach();
            return;
        }

        // Update state
        const wasVisible = this.state.isVisible;
        this.state.position = position;
        this.state.isVisible = position.isVisible ?? true;

        // Animate to new position
        if (!wasVisible && this.state.isVisible) {
            // Appearing
            this.animateAppear(position);
        } else if (wasVisible && !this.state.isVisible) {
            // Disappearing (line scrolled out of view)
            this.animateFade();
        } else if (this.state.isVisible) {
            // Moving while visible
            this.animateMove(position);
        }
    }

    /**
     * Animate character appearing at position
     */
    private animateAppear(position: AgentPosition): void {
        if (!this.element) return;

        this.state.isAnimating = true;

        // Set final position immediately
        this.element.style.left = `${position.x}px`;
        this.element.style.top = `${position.y}px`;

        // Trigger reflow
        void this.element.offsetWidth;

        // Animate appearance
        requestAnimationFrame(() => {
            if (!this.element) return;

            this.element.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            this.element.style.opacity = '1';
            this.element.style.transform = 'translate3d(0, 0, 0) scale(1)';
            this.element.style.pointerEvents = 'auto';

            // Clear animation flag after transition
            setTimeout(() => {
                this.state.isAnimating = false;
                if (this.element) {
                    this.element.style.transition = '';
                }
            }, 400);
        });
    }

    /**
     * Animate character moving to new position
     */
    private animateMove(position: AgentPosition): void {
        if (!this.element) return;

        this.state.isAnimating = true;

        // GPU-accelerated movement
        this.element.style.transition = 'left 0.3s ease-out, top 0.3s ease-out';
        this.element.style.left = `${position.x}px`;
        this.element.style.top = `${position.y}px`;

        // Clear animation flag after transition
        setTimeout(() => {
            this.state.isAnimating = false;
            if (this.element) {
                this.element.style.transition = '';
            }
        }, 300);
    }

    /**
     * Animate character fading when line goes out of view
     */
    private animateFade(): void {
        if (!this.element) return;

        this.element.style.transition = 'opacity 0.3s ease-out';
        this.element.style.opacity = '0.3';

        setTimeout(() => {
            if (this.element) {
                this.element.style.transition = '';
            }
        }, 300);
    }

    /**
     * Detach character (animate out and hide)
     */
    private detach(): void {
        if (!this.element) return;

        this.state.position = null;
        this.state.isVisible = false;
        this.state.isAnimating = true;

        // Animate out
        this.element.style.transition = 'opacity 0.3s ease-in, transform 0.3s ease-in';
        this.element.style.opacity = '0';
        this.element.style.transform = 'translate3d(0, -20px, 0) scale(0.5)';
        this.element.style.pointerEvents = 'none';

        setTimeout(() => {
            this.state.isAnimating = false;
            if (this.element) {
                this.element.style.transition = '';
            }
        }, 300);
    }

    /**
     * Get current position
     */
    public getPosition(): AgentPosition | null {
        return this.state.position;
    }

    /**
     * Check if character is visible
     */
    public isVisible(): boolean {
        return this.state.isVisible;
    }

    /**
     * Check if character is currently animating
     */
    public isAnimating(): boolean {
        return this.state.isAnimating;
    }

    /**
     * Set visual state with smooth transitions (Story 11.9)
     *
     * @param newState - The visual state to transition to
     *
     * @example
     * ```typescript
     * character.setState('thinking'); // Apply thinking animation
     * character.setState('success');  // Trigger success flash
     * ```
     */
    public setState(newState: AgentVisualState): void {
        if (!this.element) {
            console.warn(`Agent ${this.agentId} not rendered yet`);
            return;
        }

        // Don't re-apply the same state
        if (this.state.visualState === newState) {
            return;
        }

        // Remove all state classes
        const stateClasses = [
            'agent-character--idle',
            'agent-character--thinking',
            'agent-character--working',
            'agent-character--success',
            'agent-character--alert'
        ];

        stateClasses.forEach(cls => this.element?.classList.remove(cls));

        // Apply new state class
        this.element.classList.add(`agent-character--${newState}`);

        // Update data attribute for debugging
        this.element.dataset.state = newState;

        // Update internal state
        const previousState = this.state.visualState;
        this.state.visualState = newState;

        // Handle one-time animations (success and alert return to idle)
        if (newState === 'success') {
            // Success animation is 2s, then return to idle
            setTimeout(() => {
                if (this.state.visualState === 'success') {
                    this.setState('idle');
                }
            }, 2000);
        } else if (newState === 'alert') {
            // Alert animation is 0.5s, then return to appropriate state
            setTimeout(() => {
                if (this.state.visualState === 'alert') {
                    // Return to thinking if that was the previous state (interruption)
                    // Otherwise go to idle (errors stop the workflow)
                    const returnState = previousState === 'thinking' ? 'thinking' : 'idle';
                    this.setState(returnState);
                }
            }, 500);
        }
    }

    /**
     * Get current visual state (Story 11.9)
     */
    public getVisualState(): AgentVisualState {
        return this.state.visualState;
    }

    /**
     * Convenience method: Set to idle state
     */
    public setIdleState(): void {
        this.setState('idle');
    }

    /**
     * Convenience method: Set to thinking state
     */
    public setThinkingState(): void {
        this.setState('thinking');
    }

    /**
     * Convenience method: Set to working state
     */
    public setWorkingState(): void {
        this.setState('working');
    }

    /**
     * Convenience method: Trigger success animation
     */
    public setSuccessState(): void {
        this.setState('success');
    }

    /**
     * Convenience method: Trigger alert animation
     */
    public setAlertState(): void {
        this.setState('alert');
    }

    /**
     * Dispose and remove from DOM
     */
    public dispose(): void {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.svgContainer = null;
        this.state = {
            position: null,
            isVisible: false,
            isAnimating: false,
            visualState: 'idle'  // Story 11.9: Reset visual state
        };
    }
}

/**
 * AgentCharacterManager - Manages all agent characters
 *
 * Singleton that handles:
 * - Creating agent characters
 * - Routing position updates
 * - Lifecycle management
 */
export class AgentCharacterManager {
    private static instance: AgentCharacterManager | null = null;
    private characters: Map<AgentType, AgentCharacterComponent> = new Map();
    private container: HTMLElement | null = null;

    private constructor() {}

    public static getInstance(): AgentCharacterManager {
        if (!AgentCharacterManager.instance) {
            AgentCharacterManager.instance = new AgentCharacterManager();
        }
        return AgentCharacterManager.instance;
    }

    /**
     * Initialize the manager with a container
     *
     * @param container - DOM element to render characters into
     */
    public initialize(container: HTMLElement): void {
        this.container = container;

        // Create all agent characters
        const agentTypes: AgentType[] = ['architect', 'coder', 'reviewer', 'context'];

        agentTypes.forEach(agentId => {
            const character = new AgentCharacterComponent(agentId);
            character.render(container);
            this.characters.set(agentId, character);
        });

        console.log('AgentCharacterManager initialized with 4 characters');
    }

    /**
     * Handle position update message from SpatialManager
     *
     * @param agentId - Agent to update
     * @param position - New position or null to detach
     */
    public handlePositionUpdate(agentId: AgentType, position: AgentPosition | null): void {
        const character = this.characters.get(agentId);

        if (!character) {
            console.warn(`Character ${agentId} not found`);
            return;
        }

        character.updatePosition(position);
    }

    /**
     * Get character by agent ID
     */
    public getCharacter(agentId: AgentType): AgentCharacterComponent | undefined {
        return this.characters.get(agentId);
    }

    /**
     * Get all characters
     */
    public getAllCharacters(): Map<AgentType, AgentCharacterComponent> {
        return new Map(this.characters);
    }

    /**
     * Dispose all characters
     */
    public dispose(): void {
        this.characters.forEach(character => character.dispose());
        this.characters.clear();
        this.container = null;
    }
}
