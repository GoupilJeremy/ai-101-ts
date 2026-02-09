/**
 * Unit Tests for AgentFusionManager
 * Story 11.10 - Collective Enso Fusion
 *
 * Tests fusion triggering, Enso rendering, mini-dashboard,
 * defusion, state management, and animations.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentFusionManager, FusionMetadata } from '../agent-fusion-manager.js';
import { AgentCharacterComponent } from '../agent-character.js';
import { AgentType } from '../../../agents/shared/agent.interface.js';

describe('AgentFusionManager (Story 11.10)', () => {
    let fusionManager: AgentFusionManager;
    let container: HTMLElement;
    let mockAgents: AgentCharacterComponent[];

    beforeEach(() => {
        // Use fake timers for animation testing
        vi.useFakeTimers();

        // Create container
        container = document.createElement('div');
        document.body.appendChild(container);

        // Get fusion manager instance
        fusionManager = AgentFusionManager.getInstance();

        // Create mock agents
        const agentTypes: AgentType[] = ['architect', 'coder', 'reviewer'];
        mockAgents = agentTypes.map(type => {
            const agent = new AgentCharacterComponent(type);
            agent.render(container);
            // Give them initial positions
            agent.updatePosition({
                x: 100,
                y: 200,
                anchorLine: 10,
                relativeY: 0.5,
                isVisible: true
            });
            return agent;
        });
    });

    afterEach(() => {
        // Clean up
        fusionManager.dispose();
        mockAgents.forEach(agent => agent.dispose());
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = AgentFusionManager.getInstance();
            const instance2 = AgentFusionManager.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe('Initial State', () => {
        it('should start unfused', () => {
            expect(fusionManager.getIsFused()).toBe(false);
        });

        it('should have no fused agents', () => {
            expect(fusionManager.getFusedAgents()).toHaveLength(0);
        });
    });

    describe('triggerFusion()', () => {
        it('should mark manager as fused', () => {
            fusionManager.triggerFusion(mockAgents);

            expect(fusionManager.getIsFused()).toBe(true);
        });

        it('should store fused agents', () => {
            fusionManager.triggerFusion(mockAgents);

            const fusedAgents = fusionManager.getFusedAgents();
            expect(fusedAgents).toHaveLength(3);
            expect(fusedAgents).toEqual(mockAgents);
        });

        it('should not fuse if already fused', () => {
            fusionManager.triggerFusion(mockAgents);
            const firstFused = fusionManager.getFusedAgents();

            // Try to fuse again with different agents
            const newAgent = new AgentCharacterComponent('context');
            newAgent.render(container);
            fusionManager.triggerFusion([newAgent]);

            // Should still have original agents
            expect(fusionManager.getFusedAgents()).toEqual(firstFused);

            newAgent.dispose();
        });

        it('should handle empty agent array gracefully', () => {
            fusionManager.triggerFusion([]);

            expect(fusionManager.getIsFused()).toBe(false);
        });

        it('should add fused class to agents', () => {
            fusionManager.triggerFusion(mockAgents);

            mockAgents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.classList.contains('fused')).toBe(true);
            });
        });

        it('should apply scale and opacity transforms', () => {
            fusionManager.triggerFusion(mockAgents);

            mockAgents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.style.transform).toContain('scale(0.7)');
                expect(element?.style.opacity).toBe('0.6');
            });
        });

        it('should render Enso after 500ms', () => {
            fusionManager.triggerFusion(mockAgents, {
                tokens: 1500,
                status: 'collaborating'
            });

            // No Enso yet
            let enso = document.querySelector('.fusion-enso');
            expect(enso).toBeNull();

            // Fast forward 500ms
            vi.advanceTimersByTime(500);

            // Enso should be rendered
            enso = document.querySelector('.fusion-enso');
            expect(enso).not.toBeNull();
        });
    });

    describe('Enso Rendering', () => {
        beforeEach(() => {
            fusionManager.triggerFusion(mockAgents, {
                tokens: 2000,
                status: 'deep analysis',
                agents: ['architect', 'coder', 'reviewer'],
                message: 'Complex refactoring...'
            });
            vi.advanceTimersByTime(500); // Render Enso
        });

        it('should create Enso element', () => {
            const enso = document.querySelector('.fusion-enso');
            expect(enso).not.toBeNull();
        });

        it('should position Enso at screen center', () => {
            const enso = document.querySelector('.fusion-enso') as HTMLElement;
            const expectedX = window.innerWidth / 2;
            const expectedY = window.innerHeight / 2;

            expect(enso.style.left).toBe(`${expectedX}px`);
            expect(enso.style.top).toBe(`${expectedY}px`);
        });

        it('should render SVG circle', () => {
            const circle = document.querySelector('.enso-path');
            expect(circle).not.toBeNull();
        });

        it('should display token count', () => {
            const tokens = document.querySelector('.enso-tokens');
            expect(tokens?.textContent).toContain('2000');
        });

        it('should display status', () => {
            const status = document.querySelector('.enso-status');
            expect(status?.textContent).toContain('deep analysis');
        });

        it('should display tooltip message', () => {
            const message = document.querySelector('.enso-message');
            expect(message?.textContent).toBe('Complex refactoring...');
        });

        it('should render agent icons', () => {
            const icons = document.querySelectorAll('.enso-agents circle');
            expect(icons.length).toBe(3); // architect, coder, reviewer
        });

        it('should apply breathing animation', () => {
            const path = document.querySelector('.enso-path') as SVGCircleElement;
            expect(path.style.animation).toContain('enso-breathe');
        });

        it('should have rotation animation', () => {
            const animateTransform = document.querySelector('animateTransform');
            expect(animateTransform).not.toBeNull();
            expect(animateTransform?.getAttribute('dur')).toBe('60s');
        });
    });

    describe('releaseFusion()', () => {
        beforeEach(() => {
            fusionManager.triggerFusion(mockAgents);
            vi.advanceTimersByTime(500); // Wait for Enso
        });

        it('should mark manager as unfused', () => {
            fusionManager.releaseFusion();

            expect(fusionManager.getIsFused()).toBe(false);
        });

        it('should clear fused agents list', () => {
            fusionManager.releaseFusion();

            expect(fusionManager.getFusedAgents()).toHaveLength(0);
        });

        it('should remove fused class from agents', () => {
            fusionManager.releaseFusion();

            mockAgents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.classList.contains('fused')).toBe(false);
            });
        });

        it('should restore agent opacity to 1', () => {
            fusionManager.releaseFusion();

            mockAgents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.style.opacity).toBe('1');
            });
        });

        it('should restore agent scale to 1', () => {
            fusionManager.releaseFusion();

            mockAgents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.style.transform).toContain('scale(1)');
            });
        });

        it('should fade out Enso', () => {
            fusionManager.releaseFusion();

            const enso = document.querySelector('.fusion-enso') as HTMLElement;
            expect(enso.style.opacity).toBe('0');
            expect(enso.style.transform).toContain('scale(0.8)');
        });

        it('should remove Enso after fade out (400ms)', () => {
            fusionManager.releaseFusion();

            // Still present during fade
            let enso = document.querySelector('.fusion-enso');
            expect(enso).not.toBeNull();

            // Gone after fade completes
            vi.advanceTimersByTime(400);
            enso = document.querySelector('.fusion-enso');
            expect(enso).toBeNull();
        });

        it('should not error if called when not fused', () => {
            fusionManager.releaseFusion();
            fusionManager.releaseFusion(); // Second call

            // Should not throw
            expect(() => fusionManager.releaseFusion()).not.toThrow();
        });
    });

    describe('State Management', () => {
        it('should save and restore original positions', () => {
            // Save initial positions
            const initialPositions = mockAgents.map(agent => ({
                agent,
                position: agent.getPosition()
            }));

            // Trigger fusion (agents move)
            fusionManager.triggerFusion(mockAgents);
            vi.advanceTimersByTime(500);

            // Agent positions should have changed
            mockAgents.forEach((agent, index) => {
                const currentPos = agent.getPosition();
                const initialPos = initialPositions[index].position;
                // Positions should be different (agents moved to center)
                const element = agent.getElement();
                expect(element?.style.left).not.toBe(`${initialPos?.x}px`);
            });

            // Release fusion (agents return)
            fusionManager.releaseFusion();

            // Positions should be restored
            mockAgents.forEach((agent, index) => {
                const element = agent.getElement();
                const initialPos = initialPositions[index].position;
                expect(element?.style.left).toBe(`${initialPos?.x}px`);
                expect(element?.style.top).toBe(`${initialPos?.y}px`);
            });
        });
    });

    describe('Click to Defuse', () => {
        it('should defuse when Enso is clicked', () => {
            fusionManager.triggerFusion(mockAgents);
            vi.advanceTimersByTime(500);

            const enso = document.querySelector('.fusion-enso') as HTMLElement;
            expect(fusionManager.getIsFused()).toBe(true);

            // Click Enso
            enso.click();

            expect(fusionManager.getIsFused()).toBe(false);
        });
    });

    describe('Agent Icon Rendering', () => {
        it('should render correct number of icons', () => {
            fusionManager.triggerFusion(mockAgents, {
                agents: ['architect', 'coder', 'reviewer', 'context']
            });
            vi.advanceTimersByTime(500);

            const icons = document.querySelectorAll('.enso-agents circle');
            expect(icons.length).toBe(4);
        });

        it('should use correct colors for agents', () => {
            fusionManager.triggerFusion(mockAgents, {
                agents: ['architect', 'coder', 'reviewer']
            });
            vi.advanceTimersByTime(500);

            const icons = document.querySelectorAll('.enso-agents circle');

            // Architect should have vermillion red
            expect(icons[0].getAttribute('fill')).toContain('vermillion-red');

            // Coder should have pine green
            expect(icons[1].getAttribute('fill')).toContain('pine-green');

            // Reviewer should have gold yellow
            expect(icons[2].getAttribute('fill')).toContain('gold-yellow');
        });
    });

    describe('Metadata Handling', () => {
        it('should use default metadata if none provided', () => {
            fusionManager.triggerFusion(mockAgents);
            vi.advanceTimersByTime(500);

            const tokens = document.querySelector('.enso-tokens');
            const status = document.querySelector('.enso-status');
            const message = document.querySelector('.enso-message');

            expect(tokens?.textContent).toContain('0'); // Default tokens
            expect(status?.textContent).toContain('collaborating'); // Default status
            expect(message?.textContent).toBe('Deep collaboration...'); // Default message
        });

        it('should use custom metadata when provided', () => {
            fusionManager.triggerFusion(mockAgents, {
                tokens: 3500,
                status: 'architectural redesign',
                message: 'Refactoring entire module...'
            });
            vi.advanceTimersByTime(500);

            const tokens = document.querySelector('.enso-tokens');
            const status = document.querySelector('.enso-status');
            const message = document.querySelector('.enso-message');

            expect(tokens?.textContent).toContain('3500');
            expect(status?.textContent).toContain('architectural redesign');
            expect(message?.textContent).toBe('Refactoring entire module...');
        });
    });

    describe('Edge Cases', () => {
        it('should handle fusion with single agent', () => {
            fusionManager.triggerFusion([mockAgents[0]]);

            expect(fusionManager.getIsFused()).toBe(true);
            expect(fusionManager.getFusedAgents()).toHaveLength(1);
        });

        it('should handle dispose during fusion', () => {
            fusionManager.triggerFusion(mockAgents);
            vi.advanceTimersByTime(500);

            // Should not throw
            expect(() => fusionManager.dispose()).not.toThrow();

            // Should be unfused
            expect(fusionManager.getIsFused()).toBe(false);

            // Enso should be removed
            const enso = document.querySelector('.fusion-enso');
            expect(enso).toBeNull();
        });

        it('should handle multiple fusion/defusion cycles', () => {
            // First cycle
            fusionManager.triggerFusion(mockAgents);
            vi.advanceTimersByTime(500);
            expect(fusionManager.getIsFused()).toBe(true);

            fusionManager.releaseFusion();
            vi.advanceTimersByTime(400);
            expect(fusionManager.getIsFused()).toBe(false);

            // Second cycle
            fusionManager.triggerFusion(mockAgents);
            vi.advanceTimersByTime(500);
            expect(fusionManager.getIsFused()).toBe(true);

            fusionManager.releaseFusion();
            vi.advanceTimersByTime(400);
            expect(fusionManager.getIsFused()).toBe(false);
        });
    });
});
