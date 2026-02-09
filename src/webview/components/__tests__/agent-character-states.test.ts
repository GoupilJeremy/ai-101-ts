/**
 * Unit Tests for AgentCharacterComponent Visual States
 * Story 11.9 - Enhanced Visual States
 *
 * Tests all 5 visual states and state transition logic:
 * - idle, thinking, working (continuous)
 * - success, alert (one-time with auto-reset)
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentCharacterComponent, AgentVisualState } from '../agent-character.js';

describe('AgentCharacterComponent - Visual States (Story 11.9)', () => {
    let container: HTMLElement;
    let character: AgentCharacterComponent;

    beforeEach(() => {
        // Use fake timers for auto-reset testing (must be before character creation)
        vi.useFakeTimers();

        // Create a container for rendering
        container = document.createElement('div');
        document.body.appendChild(container);

        // Create character
        character = new AgentCharacterComponent('coder');
        character.render(container);
    });

    afterEach(() => {
        character.dispose();
        document.body.removeChild(container);
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('Initial State', () => {
        it('should start in idle state', () => {
            expect(character.getVisualState()).toBe('idle');
        });

        it('should have idle CSS class on render', () => {
            const element = container.querySelector('.agent-character');
            expect(element?.classList.contains('agent-character--idle')).toBe(true);
        });

        it('should set data-state attribute to idle', () => {
            const element = container.querySelector('.agent-character') as HTMLElement;
            expect(element?.dataset.state).toBe('idle');
        });
    });

    describe('setState() - Core Method', () => {
        it('should apply correct CSS class for each state', () => {
            const element = container.querySelector('.agent-character') as HTMLElement;
            const states: AgentVisualState[] = ['thinking', 'working', 'success', 'alert'];

            states.forEach(state => {
                character.setState(state);
                expect(element.classList.contains(`agent-character--${state}`)).toBe(true);
            });
        });

        it('should remove old state class when changing states', () => {
            const element = container.querySelector('.agent-character') as HTMLElement;

            character.setState('thinking');
            expect(element.classList.contains('agent-character--thinking')).toBe(true);
            expect(element.classList.contains('agent-character--idle')).toBe(false);

            character.setState('working');
            expect(element.classList.contains('agent-character--working')).toBe(true);
            expect(element.classList.contains('agent-character--thinking')).toBe(false);
        });

        it('should update data-state attribute', () => {
            const element = container.querySelector('.agent-character') as HTMLElement;

            character.setState('thinking');
            expect(element.dataset.state).toBe('thinking');

            character.setState('working');
            expect(element.dataset.state).toBe('working');
        });

        it('should update internal state', () => {
            character.setState('thinking');
            expect(character.getVisualState()).toBe('thinking');

            character.setState('working');
            expect(character.getVisualState()).toBe('working');
        });

        it('should not re-apply the same state', () => {
            const element = container.querySelector('.agent-character') as HTMLElement;

            character.setState('thinking');
            const classListBefore = Array.from(element.classList);

            character.setState('thinking'); // Same state
            const classListAfter = Array.from(element.classList);

            expect(classListBefore).toEqual(classListAfter);
        });

        it('should handle setState before render gracefully', () => {
            const unrenderedChar = new AgentCharacterComponent('architect');

            // Should not throw
            expect(() => unrenderedChar.setState('thinking')).not.toThrow();
        });
    });

    describe('Continuous States (idle, thinking, working)', () => {
        it('should stay in idle state until changed', () => {
            character.setState('idle');

            vi.advanceTimersByTime(5000); // 5 seconds
            expect(character.getVisualState()).toBe('idle');
        });

        it('should stay in thinking state until changed', () => {
            character.setState('thinking');

            vi.advanceTimersByTime(5000); // 5 seconds
            expect(character.getVisualState()).toBe('thinking');
        });

        it('should stay in working state until changed', () => {
            character.setState('working');

            vi.advanceTimersByTime(5000); // 5 seconds
            expect(character.getVisualState()).toBe('working');
        });

        it('should transition between continuous states smoothly', () => {
            character.setState('idle');
            expect(character.getVisualState()).toBe('idle');

            character.setState('thinking');
            expect(character.getVisualState()).toBe('thinking');

            character.setState('working');
            expect(character.getVisualState()).toBe('working');

            character.setState('idle');
            expect(character.getVisualState()).toBe('idle');
        });
    });

    describe('One-Time States (success, alert)', () => {
        describe('Success State', () => {
            it('should apply success CSS class immediately', () => {
                const element = container.querySelector('.agent-character') as HTMLElement;

                character.setState('success');
                expect(element.classList.contains('agent-character--success')).toBe(true);
                expect(character.getVisualState()).toBe('success');
            });

            it('should auto-reset to idle after 2 seconds', () => {
                character.setState('success');
                expect(character.getVisualState()).toBe('success');

                vi.advanceTimersByTime(2000); // 2 seconds
                expect(character.getVisualState()).toBe('idle');
            });

            it('should not reset if state was manually changed during animation', () => {
                character.setState('success');
                expect(character.getVisualState()).toBe('success');

                vi.advanceTimersByTime(1000); // 1 second (halfway)
                character.setState('thinking'); // Manual change

                vi.advanceTimersByTime(1000); // Complete the 2s timer
                expect(character.getVisualState()).toBe('thinking'); // Should stay thinking
            });
        });

        describe('Alert State', () => {
            it('should apply alert CSS class immediately', () => {
                const element = container.querySelector('.agent-character') as HTMLElement;

                character.setState('alert');
                expect(element.classList.contains('agent-character--alert')).toBe(true);
                expect(character.getVisualState()).toBe('alert');
            });

            it('should auto-reset to idle after 0.5 seconds (from idle)', () => {
                character.setState('idle');
                character.setState('alert');

                expect(character.getVisualState()).toBe('alert');

                vi.advanceTimersByTime(500); // 0.5 seconds
                expect(character.getVisualState()).toBe('idle');
            });

            it('should auto-reset to previous continuous state after 0.5 seconds', () => {
                character.setState('thinking');
                character.setState('alert');

                expect(character.getVisualState()).toBe('alert');

                vi.advanceTimersByTime(500); // 0.5 seconds
                expect(character.getVisualState()).toBe('thinking');
            });

            it('should reset to idle if previous state was success', () => {
                character.setState('success');
                character.setState('alert');

                expect(character.getVisualState()).toBe('alert');

                vi.advanceTimersByTime(500); // 0.5 seconds
                expect(character.getVisualState()).toBe('idle');
            });

            it('should not reset if state was manually changed during animation', () => {
                character.setState('alert');
                expect(character.getVisualState()).toBe('alert');

                vi.advanceTimersByTime(250); // 0.25 seconds (halfway)
                character.setState('working'); // Manual change

                vi.advanceTimersByTime(250); // Complete the 0.5s timer
                expect(character.getVisualState()).toBe('working'); // Should stay working
            });
        });
    });

    describe('Convenience Methods', () => {
        it('setIdleState() should set to idle', () => {
            character.setThinkingState();
            character.setIdleState();

            expect(character.getVisualState()).toBe('idle');
        });

        it('setThinkingState() should set to thinking', () => {
            character.setThinkingState();
            expect(character.getVisualState()).toBe('thinking');
        });

        it('setWorkingState() should set to working', () => {
            character.setWorkingState();
            expect(character.getVisualState()).toBe('working');
        });

        it('setSuccessState() should trigger success animation', () => {
            character.setSuccessState();
            expect(character.getVisualState()).toBe('success');

            vi.advanceTimersByTime(2000);
            expect(character.getVisualState()).toBe('idle');
        });

        it('setAlertState() should trigger alert animation', () => {
            character.setAlertState();
            expect(character.getVisualState()).toBe('alert');

            vi.advanceTimersByTime(500);
            expect(character.getVisualState()).toBe('idle');
        });
    });

    describe('CSS Class Management', () => {
        it('should never have multiple state classes simultaneously', () => {
            const element = container.querySelector('.agent-character') as HTMLElement;
            const states: AgentVisualState[] = ['idle', 'thinking', 'working', 'success', 'alert'];

            states.forEach(state => {
                character.setState(state);

                const stateClasses = states.filter(s =>
                    element.classList.contains(`agent-character--${s}`)
                );

                expect(stateClasses.length).toBe(1);
                expect(element.classList.contains(`agent-character--${state}`)).toBe(true);
            });
        });

        it('should preserve non-state classes during transitions', () => {
            const element = container.querySelector('.agent-character') as HTMLElement;

            // Base class should always be present
            character.setState('thinking');
            expect(element.classList.contains('agent-character')).toBe(true);

            character.setState('working');
            expect(element.classList.contains('agent-character')).toBe(true);
        });
    });

    describe('Real-World Workflow Scenarios', () => {
        it('should handle typical agent workflow: idle → thinking → working → success', () => {
            // Start idle
            expect(character.getVisualState()).toBe('idle');

            // Agent starts thinking
            character.setState('thinking');
            expect(character.getVisualState()).toBe('thinking');

            // Agent starts working
            vi.advanceTimersByTime(2000);
            character.setState('working');
            expect(character.getVisualState()).toBe('working');

            // Task completes successfully
            vi.advanceTimersByTime(3000);
            character.setState('success');
            expect(character.getVisualState()).toBe('success');

            // Auto-reset to idle
            vi.advanceTimersByTime(2000);
            expect(character.getVisualState()).toBe('idle');
        });

        it('should handle error scenario: working → alert → idle', () => {
            character.setState('working');
            expect(character.getVisualState()).toBe('working');

            // Error occurs
            character.setState('alert');
            expect(character.getVisualState()).toBe('alert');

            // Auto-reset to idle (not back to working)
            vi.advanceTimersByTime(500);
            expect(character.getVisualState()).toBe('idle');
        });

        it('should handle interruption: thinking → alert → thinking', () => {
            character.setState('thinking');
            character.setState('alert');

            expect(character.getVisualState()).toBe('alert');

            // Returns to thinking after alert
            vi.advanceTimersByTime(500);
            expect(character.getVisualState()).toBe('thinking');
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid state changes', () => {
            character.setState('thinking');
            character.setState('working');
            character.setState('idle');
            character.setState('alert');

            expect(character.getVisualState()).toBe('alert');
        });

        it('should handle dispose during auto-reset timer', () => {
            character.setState('success');

            // Dispose before auto-reset
            character.dispose();

            // Should not throw when timer fires
            expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
        });

        it('should reset visualState on dispose', () => {
            character.setState('working');
            character.dispose();

            expect(character.getVisualState()).toBe('idle');
        });
    });

    describe('Integration with Position Updates', () => {
        it('should maintain visual state during position updates', () => {
            character.setState('thinking');

            // Position update (agent moves)
            character.updatePosition({
                x: 100,
                y: 200,
                anchorLine: 50,
                relativeY: 0.5,
                isVisible: true
            });

            // Visual state should be preserved
            expect(character.getVisualState()).toBe('thinking');
        });

        it('should maintain visual state when detached', () => {
            character.setState('working');

            // Detach
            character.updatePosition(null);

            // Visual state should be preserved (even if not visible)
            expect(character.getVisualState()).toBe('working');
        });
    });
});
