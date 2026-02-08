/**
 * Tests for AgentCharacterComponent
 * Story 11.4 - Test Suite
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentCharacterComponent, AgentCharacterManager, AgentPosition } from '../agent-character.js';
import { AgentType } from '../../../agents/shared/agent.interface.js';

describe('AgentCharacterComponent', () => {
    let container: HTMLElement;

    beforeEach(() => {
        // Create a fresh container for each test
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        // Mock requestAnimationFrame for tests
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => {
            cb(0);
            return 0;
        });
    });

    afterEach(() => {
        // Clean up DOM
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }

        vi.restoreAllMocks();
    });

    describe('Rendering', () => {
        it('should render an agent character', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const element = container.querySelector('#agent-character-architect');
            expect(element).toBeTruthy();
            expect(element?.classList.contains('agent-character')).toBe(true);
        });

        it('should render all four agent types', () => {
            const types: AgentType[] = ['architect', 'coder', 'reviewer', 'context'];

            types.forEach(agentType => {
                const character = new AgentCharacterComponent(agentType);
                character.render(container);
                const element = container.querySelector(`#agent-character-${agentType}`);
                expect(element).toBeTruthy();
            });
        });

        it('should contain SVG content', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const svg = container.querySelector('.agent-character__svg');
            expect(svg).toBeTruthy();
        });

        it('should have correct accessibility attributes', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const element = container.querySelector('#agent-character-architect');
            expect(element?.getAttribute('role')).toBe('img');
            expect(element?.getAttribute('aria-label')).toContain('Architect');
        });

        it('should start hidden (opacity 0)', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const element = container.querySelector('#agent-character-architect') as HTMLElement;
            expect(element.style.opacity).toBe('0');
        });

        it('should warn if rendered twice', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const architect = new AgentCharacterComponent('architect');
            architect.render(container);
            architect.render(container); // Second render

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already rendered'));
        });
    });

    describe('Position Updates', () => {
        it('should update to a visible position', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const position: AgentPosition = {
                x: -120,
                y: 400,
                anchorLine: 50,
                relativeY: 0.5,
                isVisible: true
            };

            architect.updatePosition(position);

            expect(architect.getPosition()).toEqual(position);
            expect(architect.isVisible()).toBe(true);
        });

        it('should animate to new position when visible', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const position1: AgentPosition = {
                x: -120,
                y: 200,
                anchorLine: 25,
                relativeY: 0.25,
                isVisible: true
            };

            const position2: AgentPosition = {
                x: -120,
                y: 600,
                anchorLine: 75,
                relativeY: 0.75,
                isVisible: true
            };

            architect.updatePosition(position1);
            architect.updatePosition(position2);

            expect(architect.getPosition()).toEqual(position2);
        });

        it('should handle detachment (null position)', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const position: AgentPosition = {
                x: -120,
                y: 400,
                anchorLine: 50,
                relativeY: 0.5,
                isVisible: true
            };

            architect.updatePosition(position);
            expect(architect.isVisible()).toBe(true);

            architect.updatePosition(null);
            expect(architect.isVisible()).toBe(false);
            expect(architect.getPosition()).toBe(null);
        });

        it('should fade when line goes out of view', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const visiblePosition: AgentPosition = {
                x: -120,
                y: 400,
                anchorLine: 50,
                relativeY: 0.5,
                isVisible: true
            };

            const hiddenPosition: AgentPosition = {
                x: -120,
                y: 400,
                anchorLine: 50,
                relativeY: 0.5,
                isVisible: false
            };

            architect.updatePosition(visiblePosition);
            architect.updatePosition(hiddenPosition);

            expect(architect.isVisible()).toBe(false);
        });

        it('should warn if updating before render', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const architect = new AgentCharacterComponent('architect');
            architect.updatePosition({ x: 0, y: 0, anchorLine: 0, relativeY: 0 });

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not rendered'));
        });
    });

    describe('Animation States', () => {
        it('should set animating flag during transitions', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const position: AgentPosition = {
                x: -120,
                y: 400,
                anchorLine: 50,
                relativeY: 0.5,
                isVisible: true
            };

            architect.updatePosition(position);

            // Should be animating right after update
            expect(architect.isAnimating()).toBe(true);
        });

        it('should clear animating flag after delay', (done) => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const position: AgentPosition = {
                x: -120,
                y: 400,
                anchorLine: 50,
                relativeY: 0.5,
                isVisible: true
            };

            architect.updatePosition(position);

            // After 500ms, animation should be complete
            setTimeout(() => {
                expect(architect.isAnimating()).toBe(false);
                done();
            }, 500);
        });
    });

    describe('Disposal', () => {
        it('should remove element from DOM on dispose', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            expect(container.querySelector('#agent-character-architect')).toBeTruthy();

            architect.dispose();

            expect(container.querySelector('#agent-character-architect')).toBeFalsy();
        });

        it('should reset state on dispose', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            const position: AgentPosition = {
                x: -120,
                y: 400,
                anchorLine: 50,
                relativeY: 0.5,
                isVisible: true
            };

            architect.updatePosition(position);
            architect.dispose();

            expect(architect.getPosition()).toBe(null);
            expect(architect.isVisible()).toBe(false);
            expect(architect.isAnimating()).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid position updates', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            // Rapid updates
            for (let i = 0; i < 10; i++) {
                architect.updatePosition({
                    x: -120,
                    y: i * 100,
                    anchorLine: i * 10,
                    relativeY: i * 0.1,
                    isVisible: true
                });
            }

            // Should have latest position
            const finalPosition = architect.getPosition();
            expect(finalPosition?.y).toBe(900);
        });

        it('should handle position at viewport edges', () => {
            const architect = new AgentCharacterComponent('architect');
            architect.render(container);

            // Top edge
            architect.updatePosition({ x: -120, y: 0, anchorLine: 0, relativeY: 0, isVisible: true });
            expect(architect.getPosition()?.y).toBe(0);

            // Bottom edge (large Y)
            architect.updatePosition({ x: -120, y: 5000, anchorLine: 500, relativeY: 1, isVisible: true });
            expect(architect.getPosition()?.y).toBe(5000);
        });

        it('should handle negative coordinates', () => {
            const context = new AgentCharacterComponent('context');
            context.render(container);

            context.updatePosition({ x: -200, y: -50, anchorLine: 0, relativeY: 0, isVisible: true });

            expect(context.getPosition()?.x).toBe(-200);
            expect(context.getPosition()?.y).toBe(-50);
        });
    });
});

describe('AgentCharacterManager', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'manager-test-container';
        document.body.appendChild(container);

        // Mock requestAnimationFrame
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => {
            cb(0);
            return 0;
        });
    });

    afterEach(() => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }

        // Reset singleton
        (AgentCharacterManager as any).instance = null;

        vi.restoreAllMocks();
    });

    describe('Singleton Pattern', () => {
        it('should return same instance', () => {
            const manager1 = AgentCharacterManager.getInstance();
            const manager2 = AgentCharacterManager.getInstance();

            expect(manager1).toBe(manager2);
        });
    });

    describe('Initialization', () => {
        it('should create all 4 agent characters', () => {
            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            const characters = manager.getAllCharacters();
            expect(characters.size).toBe(4);

            expect(characters.has('architect')).toBe(true);
            expect(characters.has('coder')).toBe(true);
            expect(characters.has('reviewer')).toBe(true);
            expect(characters.has('context')).toBe(true);
        });

        it('should render all characters to container', () => {
            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            expect(container.querySelectorAll('.agent-character').length).toBe(4);
        });

        it('should log initialization', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('AgentCharacterManager initialized')
            );
        });
    });

    describe('Position Update Handling', () => {
        it('should route position update to correct character', () => {
            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            const position: AgentPosition = {
                x: -120,
                y: 400,
                anchorLine: 50,
                relativeY: 0.5,
                isVisible: true
            };

            manager.handlePositionUpdate('architect', position);

            const architect = manager.getCharacter('architect');
            expect(architect?.getPosition()).toEqual(position);
        });

        it('should handle updates for all characters', () => {
            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            const positions: Record<AgentType, AgentPosition> = {
                architect: { x: -120, y: 200, anchorLine: 25, relativeY: 0.25, isVisible: true },
                coder: { x: 1220, y: 400, anchorLine: 50, relativeY: 0.5, isVisible: true },
                reviewer: { x: 1280, y: 600, anchorLine: 75, relativeY: 0.75, isVisible: true },
                context: { x: -60, y: 800, anchorLine: 100, relativeY: 1, isVisible: true }
            };

            Object.entries(positions).forEach(([agentId, position]) => {
                manager.handlePositionUpdate(agentId as AgentType, position);
            });

            Object.entries(positions).forEach(([agentId, position]) => {
                const character = manager.getCharacter(agentId as AgentType);
                expect(character?.getPosition()).toEqual(position);
            });
        });

        it('should warn for unknown character', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            manager.handlePositionUpdate('unknown' as AgentType, null);

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
        });

        it('should handle null position (detachment)', () => {
            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            manager.handlePositionUpdate('architect', {
                x: -120,
                y: 400,
                anchorLine: 50,
                relativeY: 0.5,
                isVisible: true
            });

            manager.handlePositionUpdate('architect', null);

            const architect = manager.getCharacter('architect');
            expect(architect?.isVisible()).toBe(false);
        });
    });

    describe('Character Retrieval', () => {
        it('should get character by ID', () => {
            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            const architect = manager.getCharacter('architect');
            expect(architect).toBeTruthy();
            expect(architect).toBeInstanceOf(AgentCharacterComponent);
        });

        it('should return undefined for unknown ID', () => {
            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            const unknown = manager.getCharacter('unknown' as AgentType);
            expect(unknown).toBeUndefined();
        });

        it('should return immutable copy of all characters', () => {
            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            const characters1 = manager.getAllCharacters();
            const characters2 = manager.getAllCharacters();

            // Different instances
            expect(characters1).not.toBe(characters2);

            // But same content
            expect(characters1.size).toBe(characters2.size);
        });
    });

    describe('Disposal', () => {
        it('should dispose all characters', () => {
            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            expect(container.querySelectorAll('.agent-character').length).toBe(4);

            manager.dispose();

            expect(container.querySelectorAll('.agent-character').length).toBe(0);
        });

        it('should clear characters map', () => {
            const manager = AgentCharacterManager.getInstance();
            manager.initialize(container);

            manager.dispose();

            expect(manager.getAllCharacters().size).toBe(0);
        });
    });
});
