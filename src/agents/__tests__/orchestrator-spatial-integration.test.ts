/**
 * Integration Tests for AgentOrchestrator + SpatialManager
 * Story 11.5 - End-to-End Agent Character Integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentOrchestrator } from '../orchestrator.js';
import { SpatialManager } from '../../ui/spatial-manager.js';
import { ExtensionStateManager } from '../../state/extension-state-manager.js';
import { IAgent, AgentType } from '../shared/agent.interface.js';
import * as vscode from 'vscode';

// Mock VSCode with event emitters
vi.mock('vscode', () => ({
    window: {
        activeTextEditor: undefined,
        onDidChangeTextEditorSelection: vi.fn(() => ({ dispose: vi.fn() })),
        onDidChangeTextEditorVisibleRanges: vi.fn(() => ({ dispose: vi.fn() })),
        onDidChangeActiveTextEditor: vi.fn(() => ({ dispose: vi.fn() }))
    },
    EventEmitter: class {
        private callbacks: any[] = [];
        event = (callback: any) => {
            this.callbacks.push(callback);
            return { dispose: () => {} };
        };
        fire(data: any) {
            this.callbacks.forEach(cb => cb(data));
        }
    }
}));

// Mock ExtensionStateManager
vi.mock('../../state/extension-state-manager.js', () => ({
    ExtensionStateManager: {
        getInstance: vi.fn(() => ({
            updateAgentState: vi.fn(),
            getPhase: vi.fn(() => 'implementation'),
            postMessageToWebview: vi.fn(),
            notifyCursorUpdate: vi.fn()
        }))
    }
}));

describe('AgentOrchestrator + SpatialManager Integration (Story 11.5)', () => {
    let orchestrator: AgentOrchestrator;
    let spatialManager: SpatialManager;
    let mockAgent: IAgent;

    beforeEach(() => {
        // Reset singletons
        (AgentOrchestrator as any).instance = undefined;
        (SpatialManager as any).instance = undefined;

        orchestrator = AgentOrchestrator.getInstance();
        spatialManager = SpatialManager.getInstance();

        // Create mock agent
        mockAgent = {
            name: 'coder' as AgentType,
            displayName: 'Coder',
            description: 'Test agent',
            execute: vi.fn().mockResolvedValue({
                result: 'Test result',
                reasoning: 'Test reasoning',
                confidence: 0.9
            })
        };

        // Mock active editor
        (vscode.window as any).activeTextEditor = {
            selection: {
                active: { line: 50, character: 10 }
            },
            document: {
                lineCount: 100
            },
            visibleRanges: [
                { start: { line: 40 }, end: { line: 60 } }
            ]
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Agent Anchoring on Activation', () => {
        it('should anchor agent to line when processing starts', async () => {
            orchestrator.registerAgent(mockAgent);

            const attachSpy = vi.spyOn(spatialManager, 'attachAgentToLine');

            // Execute agent (this should trigger anchoring)
            await (orchestrator as any).runAgent('coder', {
                prompt: 'Test prompt'
            });

            // Verify agent was anchored to line 50 (current cursor line)
            expect(attachSpy).toHaveBeenCalledWith('coder', 50);
        });

        it('should anchor all agents during processUserRequest flow', async () => {
            // Create and register all agents
            const agents: IAgent[] = [
                {
                    name: 'context' as AgentType,
                    displayName: 'Context',
                    description: 'Context agent',
                    execute: vi.fn().mockResolvedValue({
                        result: 'Context loaded',
                        reasoning: 'Files loaded',
                        confidence: 1.0
                    })
                },
                {
                    name: 'architect' as AgentType,
                    displayName: 'Architect',
                    description: 'Architect agent',
                    execute: vi.fn().mockResolvedValue({
                        result: 'Architecture planned',
                        reasoning: 'Structure analyzed',
                        confidence: 0.9
                    })
                },
                {
                    name: 'coder' as AgentType,
                    displayName: 'Coder',
                    description: 'Coder agent',
                    execute: vi.fn().mockResolvedValue({
                        result: 'Code generated',
                        reasoning: 'Implementation complete',
                        confidence: 0.85
                    })
                },
                {
                    name: 'reviewer' as AgentType,
                    displayName: 'Reviewer',
                    description: 'Reviewer agent',
                    execute: vi.fn().mockResolvedValue({
                        result: 'Code reviewed',
                        reasoning: 'No issues found',
                        confidence: 0.95
                    })
                }
            ];

            agents.forEach(agent => orchestrator.registerAgent(agent));

            const attachSpy = vi.spyOn(spatialManager, 'attachAgentToLine');

            // Process a full request (should involve multiple agents)
            try {
                await orchestrator.processUserRequest('Implement feature X');
            } catch (error) {
                // Ignore errors for this test
            }

            // Verify at least context and coder were anchored
            expect(attachSpy).toHaveBeenCalled();
            expect(attachSpy.mock.calls.some(call => call[0] === 'context')).toBe(true);
            expect(attachSpy.mock.calls.some(call => call[0] === 'coder')).toBe(true);
        });

        it('should not anchor if no active editor', async () => {
            orchestrator.registerAgent(mockAgent);

            // Remove active editor
            (vscode.window as any).activeTextEditor = undefined;

            const attachSpy = vi.spyOn(spatialManager, 'attachAgentToLine');

            await (orchestrator as any).runAgent('coder', {
                prompt: 'Test prompt'
            });

            // Should not call attach since anchorLine is undefined
            expect(attachSpy).not.toHaveBeenCalled();
        });
    });

    describe('Agent Detachment on Completion', () => {
        it('should detach agent after successful completion', async () => {
            vi.useFakeTimers();

            orchestrator.registerAgent(mockAgent);

            const detachSpy = vi.spyOn(spatialManager, 'detachAgent');

            await (orchestrator as any).runAgent('coder', {
                prompt: 'Test prompt'
            });

            // Should not be detached immediately
            expect(detachSpy).not.toHaveBeenCalled();

            // Fast-forward 2 seconds
            vi.advanceTimersByTime(2000);

            // Should now be detached
            expect(detachSpy).toHaveBeenCalledWith('coder');

            vi.useRealTimers();
        });

        it('should detach agent after error with longer delay', async () => {
            vi.useFakeTimers();

            // Make agent throw error
            mockAgent.execute = vi.fn().mockRejectedValue(new Error('Test error'));

            orchestrator.registerAgent(mockAgent);

            const detachSpy = vi.spyOn(spatialManager, 'detachAgent');

            try {
                await (orchestrator as any).runAgent('coder', {
                    prompt: 'Test prompt'
                });
            } catch (error) {
                // Expected error
            }

            // Should not be detached immediately
            expect(detachSpy).not.toHaveBeenCalled();

            // Fast-forward 3 seconds (error delay)
            vi.advanceTimersByTime(3000);

            // Should now be detached
            expect(detachSpy).toHaveBeenCalledWith('coder');

            vi.useRealTimers();
        });
    });

    describe('Integration Verification', () => {
        it('should successfully anchor and detach agent in full cycle', async () => {
            vi.useFakeTimers();

            orchestrator.registerAgent(mockAgent);

            const attachSpy = vi.spyOn(spatialManager, 'attachAgentToLine');
            const detachSpy = vi.spyOn(spatialManager, 'detachAgent');

            // Run agent
            await (orchestrator as any).runAgent('coder', {
                prompt: 'Test prompt'
            });

            // Verify anchored
            expect(attachSpy).toHaveBeenCalledWith('coder', 50);

            // Fast-forward to detachment
            vi.advanceTimersByTime(2000);

            // Verify detached
            expect(detachSpy).toHaveBeenCalledWith('coder');

            vi.useRealTimers();
        });
    });

    describe('Multiple Agents Anchoring', () => {
        it('should handle multiple agents being anchored', async () => {
            const contextAgent: IAgent = {
                name: 'context' as AgentType,
                displayName: 'Context',
                description: 'Context agent',
                execute: vi.fn().mockResolvedValue({
                    result: 'Context loaded',
                    reasoning: 'Files loaded',
                    confidence: 1.0
                })
            };

            const coderAgent: IAgent = {
                name: 'coder' as AgentType,
                displayName: 'Coder',
                description: 'Coder agent',
                execute: vi.fn().mockResolvedValue({
                    result: 'Code generated',
                    reasoning: 'Implementation complete',
                    confidence: 0.85
                })
            };

            orchestrator.registerAgent(contextAgent);
            orchestrator.registerAgent(coderAgent);

            const attachSpy = vi.spyOn(spatialManager, 'attachAgentToLine');

            // Run agents sequentially
            await (orchestrator as any).runAgent('context', { prompt: 'Load context' });
            await (orchestrator as any).runAgent('coder', { prompt: 'Generate code' });

            // Verify both agents were anchored
            expect(attachSpy).toHaveBeenCalledWith('context', 50);
            expect(attachSpy).toHaveBeenCalledWith('coder', 50);
        });

        it('should track anchored agents correctly', async () => {
            orchestrator.registerAgent(mockAgent);

            const attachSpy = vi.spyOn(spatialManager, 'attachAgentToLine');

            expect(spatialManager.isAgentAnchored('coder')).toBe(false);

            await (orchestrator as any).runAgent('coder', {
                prompt: 'Test prompt'
            });

            // Verify agent was anchored during execution
            expect(attachSpy).toHaveBeenCalledWith('coder', 50);
        });
    });

    describe('Error Handling', () => {
        it('should handle SpatialManager errors gracefully', async () => {
            orchestrator.registerAgent(mockAgent);

            // Make SpatialManager throw
            vi.spyOn(spatialManager, 'attachAgentToLine').mockImplementation(() => {
                throw new Error('SpatialManager error');
            });

            // Should not crash the orchestrator
            await expect((orchestrator as any).runAgent('coder', {
                prompt: 'Test prompt'
            })).resolves.toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle agent with undefined anchor line', async () => {
            orchestrator.registerAgent(mockAgent);

            // Set anchorLine to undefined
            (vscode.window as any).activeTextEditor = {
                selection: {
                    active: { line: undefined, character: 0 }
                }
            };

            const attachSpy = vi.spyOn(spatialManager, 'attachAgentToLine');

            await (orchestrator as any).runAgent('coder', {
                prompt: 'Test prompt'
            });

            // Should not attach
            expect(attachSpy).not.toHaveBeenCalled();
        });

        it('should handle rapid agent start/stop cycles', async () => {
            vi.useFakeTimers();

            orchestrator.registerAgent(mockAgent);

            // Start agent
            const promise1 = (orchestrator as any).runAgent('coder', {
                prompt: 'Test prompt 1'
            });

            await promise1;

            // Immediately start again (before detachment timer)
            const promise2 = (orchestrator as any).runAgent('coder', {
                prompt: 'Test prompt 2'
            });

            await promise2;

            // Fast-forward all timers
            vi.advanceTimersByTime(5000);

            // Should still work correctly (last detach wins)
            expect(spatialManager.isAgentAnchored('coder')).toBe(false);

            vi.useRealTimers();
        });
    });
});
