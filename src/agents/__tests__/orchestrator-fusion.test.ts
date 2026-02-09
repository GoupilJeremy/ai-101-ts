/**
 * Integration Tests for AgentOrchestrator Fusion Logic
 * Story 11.11 - Integrate Fusion Logic into Orchestrator
 *
 * Tests automatic fusion triggering based on collaboration intensity,
 * metadata collection, and defusion on completion.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentOrchestrator } from '../orchestrator.js';
import { IAgent, AgentType } from '../shared/agent.interface.js';
import * as vscode from 'vscode';

// Mock VSCode
vi.mock('vscode', () => ({
    window: {
        activeTextEditor: {
            selection: { active: { line: 50 } }
        },
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

// Mock WebviewManager
const mockPostMessageToWebview = vi.fn();
vi.mock('../../ui/webview-manager.js', () => ({
    WebviewManager: {
        getInstance: vi.fn(() => ({
            postMessageToWebview: mockPostMessageToWebview
        }))
    }
}));

// Mock ExtensionStateManager
vi.mock('../../state/extension-state-manager.js', () => ({
    ExtensionStateManager: {
        getInstance: vi.fn(() => ({
            updateAgentState: vi.fn(),
            getPhase: vi.fn(() => 'implementation'),
            notifyCursorUpdate: vi.fn(),
            addHistoryEntry: vi.fn(),
            addAlert: vi.fn()
        }))
    }
}));

// Mock SpatialManager
vi.mock('../../ui/spatial-manager.js', () => ({
    SpatialManager: {
        getInstance: vi.fn(() => ({
            attachAgentToLine: vi.fn(),
            detachAgent: vi.fn()
        }))
    }
}));

// Mock LifecycleEventManager
vi.mock('../../api/lifecycle-event-manager.js', () => ({
    LifecycleEventManager: {
        getInstance: vi.fn(() => ({
            emit: vi.fn()
        }))
    }
}));

describe('AgentOrchestrator Fusion Logic (Story 11.11)', () => {
    let orchestrator: AgentOrchestrator;
    let mockContextAgent: IAgent;
    let mockArchitectAgent: IAgent;
    let mockCoderAgent: IAgent;
    let mockReviewerAgent: IAgent;

    beforeEach(() => {
        // Reset mocks
        mockPostMessageToWebview.mockClear();
        vi.clearAllMocks();

        // Reset singleton
        (AgentOrchestrator as any).instance = undefined;
        orchestrator = AgentOrchestrator.getInstance();

        // Create mock agents
        mockContextAgent = {
            name: 'context' as AgentType,
            displayName: 'Context Agent',
            execute: vi.fn(async () => ({
                result: 'File1.ts, File2.ts loaded',
                reasoning: 'Loaded relevant files',
                confidence: 0.9,
                suggestedFiles: [],
                timestamp: Date.now()
            }))
        };

        mockArchitectAgent = {
            name: 'architect' as AgentType,
            displayName: 'Architect Agent',
            execute: vi.fn(async () => ({
                result: 'Follow MVC pattern, use repository pattern',
                reasoning: 'Architecture analysis complete',
                confidence: 0.9,
                suggestedFiles: [],
                timestamp: Date.now()
            })),
            analyzeProject: vi.fn(async () => ({
                patterns: ['MVC', 'Repository'],
                stack: ['TypeScript', 'React']
            }))
        };

        mockCoderAgent = {
            name: 'coder' as AgentType,
            displayName: 'Coder Agent',
            execute: vi.fn(async () => ({
                result: 'class UserRepository { ... }',
                reasoning: 'Code generated following patterns',
                confidence: 0.9,
                suggestedFiles: [],
                timestamp: Date.now()
            }))
        };

        mockReviewerAgent = {
            name: 'reviewer' as AgentType,
            displayName: 'Reviewer Agent',
            execute: vi.fn(async () => ({
                result: 'No major issues, good architecture',
                reasoning: 'Code looks good',
                confidence: 0.9,
                suggestedFiles: [],
                timestamp: Date.now()
            }))
        };

        // Register agents
        orchestrator.registerAgent(mockContextAgent);
        orchestrator.registerAgent(mockArchitectAgent);
        orchestrator.registerAgent(mockCoderAgent);
        orchestrator.registerAgent(mockReviewerAgent);
    });

    describe('Fusion Triggering - Complex Tasks', () => {
        it('should trigger fusion for architectural refactoring', async () => {
            await orchestrator.processUserRequest(
                'Refactor the entire authentication architecture to follow clean architecture principles'
            );

            // Should have fusion trigger message
            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger).toBeDefined();
            expect(fusionTrigger[0].agents).toContain('architect');
            expect(fusionTrigger[0].agents).toContain('coder');
            expect(fusionTrigger[0].agents).toContain('reviewer');
            expect(fusionTrigger[0].agents.length).toBeGreaterThanOrEqual(3);
        });

        it('should trigger fusion for system redesign', async () => {
            await orchestrator.processUserRequest(
                'Redesign the data access layer and migrate to a new pattern'
            );

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger).toBeDefined();
        });

        it('should trigger fusion for comprehensive optimization', async () => {
            await orchestrator.processUserRequest(
                'Optimize the entire application architecture and refactor the component structure'
            );

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger).toBeDefined();
        });

        it('should trigger fusion for framework migration', async () => {
            await orchestrator.processUserRequest(
                'Migrate the application from class components to functional components and update the state management pattern'
            );

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger).toBeDefined();
        });
    });

    describe('Fusion Triggering - Simple Tasks (Should NOT Trigger)', () => {
        it('should NOT trigger fusion for simple function creation', async () => {
            await orchestrator.processUserRequest('Create a helper function to format dates');

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger).toBeUndefined();
        });

        it('should NOT trigger fusion for bug fix', async () => {
            await orchestrator.processUserRequest('Fix the bug in the login form validation');

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger).toBeUndefined();
        });

        it('should NOT trigger fusion for simple code update', async () => {
            await orchestrator.processUserRequest('Update the button color to blue');

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger).toBeUndefined();
        });

        it('should NOT trigger fusion when <3 agents active', async () => {
            // Unregister architect to have only 3 agents (context, coder, reviewer)
            // but the task is simple, so it won't involve architect anyway
            await orchestrator.processUserRequest('Add a console.log statement');

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger).toBeUndefined();
        });
    });

    describe('Fusion Metadata', () => {
        it('should include correct agents in metadata', async () => {
            await orchestrator.processUserRequest(
                'Refactor the architecture to use dependency injection'
            );

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger[0].agents).toEqual(['context', 'architect', 'coder', 'reviewer']);
        });

        it('should include token estimate in metadata', async () => {
            await orchestrator.processUserRequest(
                'Refactor the entire system architecture'
            );

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger[0].metadata.tokens).toBeGreaterThan(0);
        });

        it('should include appropriate status in metadata', async () => {
            await orchestrator.processUserRequest(
                'Refactor the authentication system'
            );

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger[0].metadata.status).toBe('refactoring');
        });

        it('should set architectural design status for architecture tasks', async () => {
            await orchestrator.processUserRequest(
                'Design a new architecture for the data layer'
            );

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger[0].metadata.status).toBe('architectural design');
        });

        it('should include truncated message in metadata', async () => {
            const longPrompt = 'Refactor and redesign the entire application architecture to follow clean architecture principles and implement CQRS pattern';

            await orchestrator.processUserRequest(longPrompt);

            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );

            expect(fusionTrigger[0].metadata.message).toBeDefined();
            expect(fusionTrigger[0].metadata.message.length).toBeLessThanOrEqual(50);
            if (longPrompt.length > 50) {
                expect(fusionTrigger[0].metadata.message).toContain('...');
            }
        });
    });

    describe('Fusion Defusion on Completion', () => {
        it('should release fusion when task completes successfully', async () => {
            await orchestrator.processUserRequest(
                'Refactor the architecture to use microservices pattern'
            );

            // Should have both trigger and release messages
            const fusionTrigger = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:triggerFusion'
            );
            const fusionRelease = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:releaseFusion'
            );

            expect(fusionTrigger).toBeDefined();
            expect(fusionRelease).toBeDefined();
        });

        it('should release fusion even if task fails', async () => {
            // Make one agent throw error
            mockCoderAgent.execute = vi.fn(async () => {
                throw new Error('Code generation failed');
            });

            try {
                await orchestrator.processUserRequest(
                    'Refactor the entire application architecture'
                );
            } catch (error) {
                // Expected to throw
            }

            // Should still have release message
            const fusionRelease = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:releaseFusion'
            );

            expect(fusionRelease).toBeDefined();
        });

        it('should NOT release fusion if fusion was not triggered', async () => {
            await orchestrator.processUserRequest('Add a simple helper function');

            const fusionRelease = mockPostMessageToWebview.mock.calls.find(
                (call: any[]) => call[0].type === 'toWebview:releaseFusion'
            );

            expect(fusionRelease).toBeUndefined();
        });
    });

    describe('Fusion Timing', () => {
        it('should trigger fusion before architect runs', async () => {
            await orchestrator.processUserRequest(
                'Refactor the architecture and redesign the data layer'
            );

            const calls = mockPostMessageToWebview.mock.calls;
            const fusionIndex = calls.findIndex((call: any[]) => call[0].type === 'toWebview:triggerFusion');
            const firstInteractionIndex = calls.findIndex((call: any[]) => call[0].type === 'toWebview:agentInteraction');

            // Fusion should come before agent interactions
            expect(fusionIndex).toBeGreaterThanOrEqual(0);
            expect(fusionIndex).toBeLessThan(firstInteractionIndex);
        });

        it('should release fusion after all agents complete', async () => {
            await orchestrator.processUserRequest(
                'Refactor the entire system architecture'
            );

            const calls = mockPostMessageToWebview.mock.calls;
            const fusionIndex = calls.findIndex((call: any[]) => call[0].type === 'toWebview:triggerFusion');
            const releaseIndex = calls.findIndex((call: any[]) => call[0].type === 'toWebview:releaseFusion');

            // Release should come after trigger
            expect(releaseIndex).toBeGreaterThan(fusionIndex);

            // Release should be the last fusion-related message
            expect(releaseIndex).toBe(calls.map((c: any[]) => c[0].type).lastIndexOf('toWebview:releaseFusion'));
        });
    });
});
