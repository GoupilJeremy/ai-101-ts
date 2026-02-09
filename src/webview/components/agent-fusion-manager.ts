/**
 * AgentFusionManager - Collective Enso Fusion
 * Story 11.10 - Manages fusion of agents into unified Enso form
 *
 * Handles:
 * - Fusion animation (agents converge to center)
 * - Enso circle rendering with mini-dashboard
 * - Defusion (agents return to original positions)
 * - State management for fused/unfused states
 */

import { AgentType } from '../../agents/shared/agent.interface.js';
import { AgentCharacterComponent } from './agent-character.js';

/**
 * Metadata for fusion visualization
 */
export interface FusionMetadata {
    tokens?: number;
    status?: string;
    agents?: AgentType[];
    message?: string;
}

/**
 * Position data for agent restoration
 */
interface AgentPosition {
    x: number;
    y: number;
}

/**
 * AgentFusionManager - Manages collective agent fusion into Enso form
 *
 * Singleton that handles:
 * - Triggering fusion animation
 * - Rendering Enso circle with mini-dashboard
 * - Managing fused state
 * - Releasing fusion (defusion)
 *
 * @example
 * ```typescript
 * const fusionManager = AgentFusionManager.getInstance();
 *
 * // Trigger fusion
 * fusionManager.triggerFusion(
 *     [architectChar, coderChar, reviewerChar],
 *     { tokens: 1500, status: 'collaborating', message: 'Deep analysis...' }
 * );
 *
 * // Release fusion
 * fusionManager.releaseFusion();
 * ```
 */
export class AgentFusionManager {
    private static instance: AgentFusionManager | null = null;

    private isFused: boolean = false;
    private fusedAgents: AgentCharacterComponent[] = [];
    private ensoElement: HTMLElement | null = null;
    private originalPositions: Map<AgentType, AgentPosition> = new Map();
    private breathingAnimationId: number | null = null;

    /**
     * Private constructor for singleton pattern
     */
    private constructor() {}

    /**
     * Get singleton instance
     */
    public static getInstance(): AgentFusionManager {
        if (!AgentFusionManager.instance) {
            AgentFusionManager.instance = new AgentFusionManager();
        }
        return AgentFusionManager.instance;
    }

    /**
     * Check if agents are currently fused
     */
    public getIsFused(): boolean {
        return this.isFused;
    }

    /**
     * Get list of currently fused agents
     */
    public getFusedAgents(): AgentCharacterComponent[] {
        return [...this.fusedAgents];
    }

    /**
     * Dispose the manager (for testing)
     */
    public dispose(): void {
        if (this.isFused) {
            this.releaseFusion();
        }
        this.fusedAgents = [];
        this.originalPositions.clear();
        if (this.ensoElement) {
            this.ensoElement.remove();
            this.ensoElement = null;
        }
        if (this.breathingAnimationId !== null) {
            cancelAnimationFrame(this.breathingAnimationId);
            this.breathingAnimationId = null;
        }
    }

    /**
     * Calculate screen center point
     */
    private calculateScreenCenter(): { x: number; y: number } {
        return {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };
    }

    /**
     * Trigger fusion - converge agents to center and display Enso
     * Story 11.10
     *
     * @param agents - Array of agent character components to fuse
     * @param metadata - Optional metadata for mini-dashboard
     */
    public triggerFusion(
        agents: AgentCharacterComponent[],
        metadata: FusionMetadata = {}
    ): void {
        if (this.isFused) {
            console.warn('Agents already fused');
            return;
        }

        if (agents.length === 0) {
            console.warn('No agents provided for fusion');
            return;
        }

        this.fusedAgents = agents;
        this.isFused = true;

        // Save original positions
        agents.forEach(agent => {
            const position = agent.getPosition();
            const element = agent.getElement();
            if (position && element) {
                this.originalPositions.set(agent.getAgentId(), {
                    x: position.x,
                    y: position.y
                });
            }
        });

        // Calculate center point
        const centerPoint = this.calculateScreenCenter();

        // Animate agents to orbit around center
        const orbitRadius = 50; // Distance from center
        agents.forEach((agent, index) => {
            const element = agent.getElement();
            if (!element) return;

            // Calculate position on orbit circle
            const angleOffset = (Math.PI * 2 / agents.length) * index;
            const targetX = centerPoint.x + Math.cos(angleOffset) * orbitRadius;
            const targetY = centerPoint.y + Math.sin(angleOffset) * orbitRadius;

            // Apply convergence animation
            element.style.transition = 'all 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)';
            element.style.left = `${targetX}px`;
            element.style.top = `${targetY}px`;
            element.style.transform = 'translate(-50%, -50%) scale(0.7)';
            element.style.opacity = '0.6';
            element.classList.add('fused');
        });

        // Render Enso after agents are en route (500ms)
        setTimeout(() => {
            this.renderEnsoForm(centerPoint, metadata);
        }, 500);
    }

    /**
     * Render Enso form at center with mini-dashboard
     * Story 11.10
     *
     * @param center - Center point for Enso
     * @param metadata - Dashboard data (tokens, status, agents, message)
     */
    private renderEnsoForm(
        center: { x: number; y: number },
        metadata: FusionMetadata
    ): void {
        const {
            tokens = 0,
            status = 'collaborating',
            agents = [],
            message = 'Deep collaboration...'
        } = metadata;

        // Create Enso container
        this.ensoElement = document.createElement('div');
        this.ensoElement.className = 'fusion-enso';
        this.ensoElement.style.cssText = `
            position: fixed;
            left: ${center.x}px;
            top: ${center.y}px;
            transform: translate(-50%, -50%) scale(0);
            pointer-events: all;
            cursor: pointer;
            z-index: 9997;
        `;

        // Create SVG Enso with dashboard
        this.ensoElement.innerHTML = `
            <svg class="enso-circle" viewBox="0 0 200 200" width="200" height="200">
                <!-- Enso circle (incomplete for wabi-sabi) -->
                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="var(--ink-black, #2C3E50)"
                    stroke-width="4"
                    stroke-dasharray="480 20"
                    fill="none"
                    class="enso-path"
                />

                <!-- Mini-dashboard in center -->
                <g class="enso-dashboard">
                    <!-- Tokens -->
                    <text x="100" y="85" text-anchor="middle" class="enso-tokens">
                        ${tokens} tokens
                    </text>

                    <!-- Status -->
                    <text x="100" y="105" text-anchor="middle" class="enso-status">
                        ${status}
                    </text>

                    <!-- Agent icons -->
                    <g class="enso-agents" transform="translate(100, 125)">
                        ${this.renderAgentIcons(agents)}
                    </g>
                </g>

                <!-- Slow rotation animation -->
                <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from="0 100 100"
                    to="360 100 100"
                    dur="60s"
                    repeatCount="indefinite"
                />
            </svg>

            <!-- Tooltip message -->
            <div class="enso-message">${message}</div>
        `;

        // Add to DOM
        document.body.appendChild(this.ensoElement);

        // Animate appearance
        requestAnimationFrame(() => {
            if (!this.ensoElement) return;
            this.ensoElement.style.transition = 'transform 800ms cubic-bezier(0.4, 0.0, 0.2, 1)';
            this.ensoElement.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // Start breathing animation
        this.startEnsoBreathing();

        // Click to defuse
        this.ensoElement.addEventListener('click', () => {
            this.releaseFusion();
        });
    }

    /**
     * Release fusion - return agents to original positions
     * Story 11.10
     */
    public releaseFusion(): void {
        if (!this.isFused) {
            console.warn('No fusion to release');
            return;
        }

        this.isFused = false;

        // Fade out and remove Enso
        if (this.ensoElement) {
            this.ensoElement.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
            this.ensoElement.style.opacity = '0';
            this.ensoElement.style.transform = 'translate(-50%, -50%) scale(0.8)';

            setTimeout(() => {
                if (this.ensoElement) {
                    this.ensoElement.remove();
                    this.ensoElement = null;
                }
            }, 400);
        }

        // Return agents to original positions
        this.fusedAgents.forEach(agent => {
            const element = agent.getElement();
            const agentId = agent.getAgentId();
            const original = this.originalPositions.get(agentId);

            if (element && original) {
                element.style.transition = 'all 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                element.style.left = `${original.x}px`;
                element.style.top = `${original.y}px`;
                element.style.transform = 'translate(-50%, -50%) scale(1)';
                element.style.opacity = '1';
                element.classList.remove('fused');
            }
        });

        // Clear state
        this.fusedAgents = [];
        this.originalPositions.clear();

        // Stop breathing animation if active
        if (this.breathingAnimationId !== null) {
            cancelAnimationFrame(this.breathingAnimationId);
            this.breathingAnimationId = null;
        }
    }

    /**
     * Render agent icons for mini-dashboard
     * Story 11.10
     *
     * @param agents - Array of agent IDs
     * @returns SVG markup for agent icons
     */
    private renderAgentIcons(agents: AgentType[]): string {
        // Color mapping for each agent (matches their accent colors)
        const colorMap: Record<AgentType, string> = {
            architect: 'var(--vermillion-red, #E74C3C)',
            coder: 'var(--pine-green, #27AE60)',
            reviewer: 'var(--gold-yellow, #F39C12)',
            context: 'var(--bamboo-green, #2ECC71)'
        };

        // Generate small circles for each agent
        return agents
            .map((agentId, index) => {
                const x = (index - agents.length / 2) * 20 + 10; // Spread horizontally
                const color = colorMap[agentId] || 'var(--ink-black, #2C3E50)';

                return `
                    <circle
                        cx="${x}"
                        cy="0"
                        r="4"
                        fill="${color}"
                        opacity="0.8"
                    >
                        <title>${agentId}</title>
                    </circle>
                `;
            })
            .join('');
    }

    /**
     * Start breathing animation for Enso
     * Story 11.10
     */
    private startEnsoBreathing(): void {
        if (!this.ensoElement) return;

        const circle = this.ensoElement.querySelector('.enso-path') as SVGCircleElement;
        if (!circle) return;

        // Apply breathing animation
        circle.style.animation = 'enso-breathe 4s ease-in-out infinite';
    }
}
