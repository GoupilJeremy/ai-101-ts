/**
 * Integration Tests for AgentOrchestrator Visualization
 * Story 11.8 - Integrate Visualization into AgentOrchestrator
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

describe('AgentOrchestrator Visualization Integration (Story 11.8)', () => {
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
                result: 'File1.ts loaded',
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
                result: 'Follow MVC pattern',
                reasoning: 'Architecture analysis complete',
                confidence: 0.9,
                suggestedFiles: [],
                timestamp: Date.now()
            })),
            analyzeProject: vi.fn(async () => ({
                patterns: ['MVC'],
                stack: ['TypeScript', 'React']
            }))
        };

        mockCoderAgent = {
            name: 'coder' as AgentType,
            displayName: 'Coder Agent',
            execute: vi.fn(async () => ({
                result: 'function test() { return true; }',
                reasoning: 'Code generated',
                confidence: 0.9,
                suggestedFiles: [],
                timestamp: Date.now()
            }))
        };

        mockReviewerAgent = {
            name: 'reviewer' as AgentType,
            displayName: 'Reviewer Agent',
            execute: vi.fn(async () => ({
                result: 'No issues found',
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

    describe('processUserRequest - Visualization Calls', () => {
        it('should visualize context → architect interaction when architect is involved', async () => {
            await orchestrator.processUserRequest('refactor the architecture');

            // Should have visualization messages
            const visualizationCalls = mockPostMessageToWebview.mock.calls.filter(
                (call: any[]) => call[0].type === 'toWebview:agentInteraction'
            );

            expect(visualizationCalls.length).toBeGreaterThan(0);

            // Check for context → architect interaction
            const contextToArchitect = visualizationCalls.find(
                (call: any[]) => call[0].from === 'context' && call[0].to === 'architect'
            );
            expect(contextToArchitect).toBeDefined();
            expect(contextToArchitect[0].message).toContain('Context loaded');
            expect(contextToArchitect[0].critical).toBe(false);
        });

        it('should visualize architect → coder interaction when architect is involved', async () => {
            await orchestrator.processUserRequest('refactor the architecture');

            const visualizationCalls = mockPostMessageToWebview.mock.calls.filter(
                (call: any[]) => call[0].type === 'toWebview:agentInteraction'
            );

            // Check for architect → coder interaction
            const architectToCoder = visualizationCalls.find(
                (call: any[]) => call[0].from === 'architect' && call[0].to === 'coder'
            );
            expect(architectToCoder).toBeDefined();
            expect(architectToCoder[0].message).toContain('Architecture analysis complete');
            expect(architectToCoder[0].critical).toBe(true); // Architectural decisions are critical
        });

        it('should visualize coder → reviewer interaction', async () => {
            await orchestrator.processUserRequest('create a function');

            const visualizationCalls = mockPostMessageToWebview.mock.calls.filter(
                (call: any[]) => call[0].type === 'toWebview:agentInteraction'
            );

            // Check for coder → reviewer interaction
            const coderToReviewer = visualizationCalls.find(
                (call: any[]) => call[0].from === 'coder' && call[0].to === 'reviewer'
            );
            expect(coderToReviewer).toBeDefined();
            expect(coderToReviewer[0].message).toContain('Code generation complete');
            expect(coderToReviewer[0].critical).toBe(true); // Code generation is critical
        });

        it('should visualize reviewer → context interaction', async () => {
            await orchestrator.processUserRequest('create a function');

            const visualizationCalls = mockPostMessageToWebview.mock.calls.filter(
                (call: any[]) => call[0].type === 'toWebview:agentInteraction'
            );

            // Check for reviewer → context interaction (completing the cycle)
            const reviewerToContext = visualizationCalls.find(
                (call: any[]) => call[0].from === 'reviewer' && call[0].to === 'context'
            );
            expect(reviewerToContext).toBeDefined();
            expect(reviewerToContext[0].message).toContain('Review complete');
            expect(reviewerToContext[0].critical).toBe(false);
        });

        it('should send all visualization messages with timestamp', async () => {
            await orchestrator.processUserRequest('create a function');

            const visualizationCalls = mockPostMessageToWebview.mock.calls.filter(
                (call: any[]) => call[0].type === 'toWebview:agentInteraction'
            );

            visualizationCalls.forEach((call: any[]) => {
                expect(call[0].timestamp).toBeDefined();
                expect(typeof call[0].timestamp).toBe('number');
                expect(call[0].timestamp).toBeGreaterThan(Date.now() - 10000); // Within last 10 seconds
            });
        });

        it('should not break workflow if visualization fails', async () => {
            // Simulate visualization failure
            mockPostMessageToWebview.mockImplementationOnce(() => {
                throw new Error('Webview not ready');
            });

            // Should still complete successfully
            const result = await orchestrator.processUserRequest('create a function');

            expect(result).toBeDefined();
            expect(result.result).toContain('function test()');
        });
    });

    describe('Message Format', () => {
        it('should send messages with correct structure', async () => {
            await orchestrator.processUserRequest('create a function');

            const visualizationCalls = mockPostMessageToWebview.mock.calls.filter(
                (call: any[]) => call[0].type === 'toWebview:agentInteraction'
            );

            visualizationCalls.forEach((call: any[]) => {
                const message = call[0];

                // Check all required fields
                expect(message).toHaveProperty('type', 'toWebview:agentInteraction');
                expect(message).toHaveProperty('from');
                expect(message).toHaveProperty('to');
                expect(message).toHaveProperty('message');
                expect(message).toHaveProperty('critical');
                expect(message).toHaveProperty('timestamp');

                // Validate types
                expect(typeof message.from).toBe('string');
                expect(typeof message.to).toBe('string');
                expect(typeof message.message).toBe('string');
                expect(typeof message.critical).toBe('boolean');
                expect(typeof message.timestamp).toBe('number');
            });
        });

        it('should use correct agent types in messages', async () => {
            await orchestrator.processUserRequest('refactor the architecture');

            const visualizationCalls = mockPostMessageToWebview.mock.calls.filter(
                (call: any[]) => call[0].type === 'toWebview:agentInteraction'
            );

            const validAgentTypes = ['context', 'architect', 'coder', 'reviewer'];

            visualizationCalls.forEach((call: any[]) => {
                expect(validAgentTypes).toContain(call[0].from);
                expect(validAgentTypes).toContain(call[0].to);
            });
        });
    });

    describe('Workflow Scenarios', () => {
        it('should visualize simple workflow (no architect)', async () => {
            await orchestrator.processUserRequest('create a helper function');

            const visualizationCalls = mockPostMessageToWebview.mock.calls.filter(
                (call: any[]) => call[0].type === 'toWebview:agentInteraction'
            );

            // Should have 2 visualizations:
            // 1. coder → reviewer
            // 2. reviewer → context
            expect(visualizationCalls.length).toBe(2);
        });

        it('should visualize complex workflow (with architect)', async () => {
            await orchestrator.processUserRequest('refactor the architecture');

            const visualizationCalls = mockPostMessageToWebview.mock.calls.filter(
                (call: any[]) => call[0].type === 'toWebview:agentInteraction'
            );

            // Should have 4 visualizations:
            // 1. context → architect
            // 2. architect → coder
            // 3. coder → reviewer
            // 4. reviewer → context
            expect(visualizationCalls.length).toBe(4);
        });

        it('should maintain visualization order matching workflow', async () => {
            await orchestrator.processUserRequest('refactor the architecture');

            const visualizationCalls = mockPostMessageToWebview.mock.calls.filter(
                (call: any[]) => call[0].type === 'toWebview:agentInteraction'
            );

            // Extract the flow
            const flow = visualizationCalls.map((call: any[]) =>
                `${call[0].from}->${call[0].to}`
            );

            // Check order
            expect(flow[0]).toBe('context->architect');
            expect(flow[1]).toBe('architect->coder');
            expect(flow[2]).toBe('coder->reviewer');
            expect(flow[3]).toBe('reviewer->context');
        });
    });

    describe('Error Handling', () => {
        it('should handle visualization error gracefully', async () => {
            // Mock console.warn to prevent test output noise
            const originalWarn = console.warn;
            console.warn = vi.fn();

            // Make postMessage throw
            mockPostMessageToWebview.mockImplementation(() => {
                throw new Error('WebviewManager not initialized');
            });

            // Should not throw
            await expect(
                orchestrator.processUserRequest('create a function')
            ).resolves.toBeDefined();

            console.warn = originalWarn;
        });

        it('should not impact agent execution timing', async () => {
            const start = Date.now();
            await orchestrator.processUserRequest('create a function');
            const duration = Date.now() - start;

            // Visualization should be async and not add significant overhead
            // Should complete in reasonable time (< 1 second for mocked agents)
            expect(duration).toBeLessThan(1000);
        });
    });
});
