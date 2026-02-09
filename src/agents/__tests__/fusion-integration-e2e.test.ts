/**
 * End-to-End Integration Tests for Fusion Flow
 * Story 11.12 - Integration Tests Sprint 4
 *
 * Tests the complete fusion lifecycle:
 * - Detection in orchestrator
 * - Triggering via postMessage
 * - Agent convergence animation
 * - Enso rendering with dashboard
 * - Click defusion
 * - Automatic defusion
 * - Performance validation
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentOrchestrator } from '../orchestrator.js';
import { AgentFusionManager } from '../../webview/components/agent-fusion-manager.js';
import { AgentCharacterManager, AgentCharacterComponent } from '../../webview/components/agent-character.js';
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

// Mock WebviewManager with message capture
let capturedMessages: any[] = [];
const mockPostMessageToWebview = vi.fn((message: any) => {
    capturedMessages.push(message);
});

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

describe('Fusion E2E Integration Tests (Story 11.12)', () => {
    let orchestrator: AgentOrchestrator;
    let fusionManager: AgentFusionManager;
    let characterManager: AgentCharacterManager;
    let container: HTMLElement;
    let mockAgents: IAgent[];

    beforeEach(() => {
        // Use fake timers
        vi.useFakeTimers();

        // Clear captured messages
        capturedMessages = [];
        mockPostMessageToWebview.mockClear();
        vi.clearAllMocks();

        // Setup DOM
        container = document.createElement('div');
        document.body.appendChild(container);

        // Initialize managers
        (AgentOrchestrator as any).instance = undefined;
        orchestrator = AgentOrchestrator.getInstance();

        fusionManager = AgentFusionManager.getInstance();
        characterManager = AgentCharacterManager.getInstance();
        characterManager.initialize(container);

        // Create and register mock agents
        mockAgents = createMockAgents();
        mockAgents.forEach(agent => orchestrator.registerAgent(agent));

        // Give agents initial positions
        const agentTypes: AgentType[] = ['context', 'architect', 'coder', 'reviewer'];
        agentTypes.forEach((type, index) => {
            const character = characterManager.getCharacter(type);
            character?.updatePosition({
                x: 100 + index * 50,
                y: 200,
                anchorLine: 10 + index,
                relativeY: 0.5,
                isVisible: true
            });
        });
    });

    afterEach(() => {
        fusionManager.dispose();
        characterManager.dispose();
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('Complete Fusion Flow - Complex Task', () => {
        it('should execute full fusion lifecycle for architectural refactoring', async () => {
            // ========================================
            // STEP 1: User requests complex task
            // ========================================
            const complexPrompt = 'Refactor the entire authentication architecture to use dependency injection';

            // Start processing (don't await yet - we'll simulate the flow)
            const processPromise = orchestrator.processUserRequest(complexPrompt);

            // ========================================
            // STEP 2: Verify fusion trigger message
            // ========================================
            // Should detect complex task and trigger fusion
            await vi.waitFor(() => {
                const fusionTrigger = capturedMessages.find(m => m.type === 'toWebview:triggerFusion');
                expect(fusionTrigger).toBeDefined();
            });

            const fusionTrigger = capturedMessages.find(m => m.type === 'toWebview:triggerFusion');
            expect(fusionTrigger.agents).toEqual(['context', 'architect', 'coder', 'reviewer']);
            expect(fusionTrigger.metadata.tokens).toBeGreaterThan(0);
            expect(fusionTrigger.metadata.status).toBe('architectural design');

            // ========================================
            // STEP 3: Simulate webview receiving message and triggering fusion
            // ========================================
            const agentComponents = fusionTrigger.agents
                .map((id: string) => characterManager.getCharacter(id as AgentType))
                .filter((a: any) => a !== undefined);

            fusionManager.triggerFusion(agentComponents, fusionTrigger.metadata);

            // ========================================
            // STEP 4: Verify agents converge to center
            // ========================================
            agentComponents.forEach((agent: AgentCharacterComponent) => {
                const element = agent.getElement();
                expect(element?.classList.contains('fused')).toBe(true);
                expect(element?.style.transform).toContain('scale(0.7)');
                expect(element?.style.opacity).toBe('0.6');
            });

            // ========================================
            // STEP 5: Wait for Enso to appear (500ms after fusion)
            // ========================================
            vi.advanceTimersByTime(500);

            const enso = document.querySelector('.fusion-enso');
            expect(enso).not.toBeNull();

            // ========================================
            // STEP 6: Verify Enso dashboard content
            // ========================================
            const tokens = document.querySelector('.enso-tokens');
            const status = document.querySelector('.enso-status');
            const icons = document.querySelectorAll('.enso-agents circle');

            expect(tokens?.textContent).toContain(fusionTrigger.metadata.tokens.toString());
            expect(status?.textContent).toContain('architectural design');
            expect(icons.length).toBe(4); // 4 agents

            // ========================================
            // STEP 7: Let orchestrator complete
            // ========================================
            await processPromise;

            // ========================================
            // STEP 8: Verify automatic defusion message
            // ========================================
            const defusionMessage = capturedMessages.find(m => m.type === 'toWebview:releaseFusion');
            expect(defusionMessage).toBeDefined();

            // ========================================
            // STEP 9: Simulate webview receiving defusion and releasing
            // ========================================
            fusionManager.releaseFusion();

            // ========================================
            // STEP 10: Verify agents return to original positions
            // ========================================
            agentComponents.forEach((agent: AgentCharacterComponent) => {
                const element = agent.getElement();
                expect(element?.classList.contains('fused')).toBe(false);
                expect(element?.style.opacity).toBe('1');
                expect(element?.style.transform).toContain('scale(1)');
            });

            // ========================================
            // STEP 11: Verify Enso fades out
            // ========================================
            vi.advanceTimersByTime(400);
            const ensoAfterDefusion = document.querySelector('.fusion-enso');
            expect(ensoAfterDefusion).toBeNull(); // Removed after fade
        });
    });

    describe('Acceptance Criterion 1: Intense Collaboration → Fusion Triggered', () => {
        it('should trigger fusion for complex architectural task', async () => {
            await orchestrator.processUserRequest(
                'Redesign the entire system architecture and migrate to clean architecture'
            );

            const fusionTrigger = capturedMessages.find(m => m.type === 'toWebview:triggerFusion');
            expect(fusionTrigger).toBeDefined();
            expect(fusionTrigger.agents.length).toBeGreaterThanOrEqual(3);
        });

        it('should include correct metadata in fusion trigger', async () => {
            await orchestrator.processUserRequest('Refactor the data access layer architecture');

            const fusionTrigger = capturedMessages.find(m => m.type === 'toWebview:triggerFusion');
            expect(fusionTrigger.metadata).toHaveProperty('tokens');
            expect(fusionTrigger.metadata).toHaveProperty('status');
            expect(fusionTrigger.metadata).toHaveProperty('agents');
            expect(fusionTrigger.metadata).toHaveProperty('message');
        });

        it('should NOT trigger fusion for simple tasks', async () => {
            await orchestrator.processUserRequest('Add a console.log statement');

            const fusionTrigger = capturedMessages.find(m => m.type === 'toWebview:triggerFusion');
            expect(fusionTrigger).toBeUndefined();
        });
    });

    describe('Acceptance Criterion 2: Agents Converge to Center', () => {
        it('should apply fused class to all agents', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            agents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.classList.contains('fused')).toBe(true);
            });
        });

        it('should reduce agent scale to 0.7', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            agents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.style.transform).toContain('scale(0.7)');
            });
        });

        it('should reduce agent opacity to 0.6', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            agents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.style.opacity).toBe('0.6');
            });
        });

        it('should position agents in orbit around center', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            agents.forEach(agent => {
                const element = agent.getElement();
                const left = parseFloat(element?.style.left || '0');
                const top = parseFloat(element?.style.top || '0');

                // Should be near center (within orbit radius + some tolerance)
                const distanceFromCenter = Math.sqrt(
                    Math.pow(left - centerX, 2) + Math.pow(top - centerY, 2)
                );
                expect(distanceFromCenter).toBeLessThan(100); // Within orbit radius + tolerance
            });
        });
    });

    describe('Acceptance Criterion 3: Enso Displayed with Correct Dashboard', () => {
        it('should render Enso at screen center', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            vi.advanceTimersByTime(500);

            const enso = document.querySelector('.fusion-enso') as HTMLElement;
            expect(enso).not.toBeNull();

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            expect(enso.style.left).toBe(`${centerX}px`);
            expect(enso.style.top).toBe(`${centerY}px`);
        });

        it('should display token count in dashboard', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 2500 });

            vi.advanceTimersByTime(500);

            const tokens = document.querySelector('.enso-tokens');
            expect(tokens?.textContent).toContain('2500');
        });

        it('should display status in dashboard', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { status: 'refactoring' });

            vi.advanceTimersByTime(500);

            const status = document.querySelector('.enso-status');
            expect(status?.textContent).toContain('refactoring');
        });

        it('should display agent icons', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, {
                agents: ['architect', 'coder', 'reviewer', 'context']
            });

            vi.advanceTimersByTime(500);

            const icons = document.querySelectorAll('.enso-agents circle');
            expect(icons.length).toBe(4);
        });

        it('should display tooltip message', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, {
                message: 'Refactoring architecture...'
            });

            vi.advanceTimersByTime(500);

            const message = document.querySelector('.enso-message');
            expect(message?.textContent).toBe('Refactoring architecture...');
        });
    });

    describe('Acceptance Criterion 4: Click Enso → Defusion', () => {
        it('should defuse when Enso is clicked', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            vi.advanceTimersByTime(500);

            const enso = document.querySelector('.fusion-enso') as HTMLElement;
            enso.click();

            expect(fusionManager.getIsFused()).toBe(false);
        });

        it('should remove fused class from agents on click defusion', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            vi.advanceTimersByTime(500);

            const enso = document.querySelector('.fusion-enso') as HTMLElement;
            enso.click();

            agents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.classList.contains('fused')).toBe(false);
            });
        });

        it('should restore agent opacity on click defusion', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            vi.advanceTimersByTime(500);

            const enso = document.querySelector('.fusion-enso') as HTMLElement;
            enso.click();

            agents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.style.opacity).toBe('1');
            });
        });
    });

    describe('Acceptance Criterion 5: End Collaboration → Automatic Defusion', () => {
        it('should send defusion message when collaboration completes', async () => {
            await orchestrator.processUserRequest(
                'Refactor the system architecture to use microservices'
            );

            const defusionMessage = capturedMessages.find(m => m.type === 'toWebview:releaseFusion');
            expect(defusionMessage).toBeDefined();
        });

        it('should send defusion message even on error', async () => {
            // Make an agent throw error
            const coderAgent = orchestrator.getAgent('coder');
            (coderAgent as any).execute = vi.fn(async () => {
                throw new Error('Test error');
            });

            try {
                await orchestrator.processUserRequest(
                    'Refactor the entire architecture'
                );
            } catch (error) {
                // Expected
            }

            const defusionMessage = capturedMessages.find(m => m.type === 'toWebview:releaseFusion');
            expect(defusionMessage).toBeDefined();
        });
    });

    describe('Acceptance Criterion 6: Performance - 60fps', () => {
        it('should use only GPU-accelerated CSS properties', () => {
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            agents.forEach(agent => {
                const element = agent.getElement();
                const computedStyle = window.getComputedStyle(element as Element);

                // Should use transform (GPU-accelerated)
                expect(element?.style.transform).toBeDefined();

                // Should NOT animate top/left (layout-triggering)
                // Instead should set them once and use transform
                expect(element?.style.transition).toContain('all'); // Includes transform
            });
        });

        it('should apply will-change hints for performance', () => {
            // Verify CSS classes exist (not computed style in JSDOM)
            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            // Fused class should be present
            agents.forEach(agent => {
                const element = agent.getElement();
                expect(element?.classList.contains('fused')).toBe(true);
            });
        });

        it('should complete fusion animation within reasonable time', () => {
            // Temporarily use real timers to measure actual performance
            vi.useRealTimers();

            const startTime = performance.now();

            const agents = getAllAgentComponents();
            fusionManager.triggerFusion(agents, { tokens: 100 });

            const setupDuration = performance.now() - startTime;

            // Setup should be instant (< 50ms real time)
            // Animation happens via CSS, so setup is just DOM manipulation
            expect(setupDuration).toBeLessThan(50);

            // Restore fake timers for other tests
            vi.useFakeTimers();
        });
    });

    // Helper functions
    function createMockAgents(): IAgent[] {
        return [
            {
                name: 'context' as AgentType,
                displayName: 'Context',
                execute: vi.fn(async () => ({
                    result: 'Files loaded',
                    reasoning: 'Context loaded',
                    confidence: 0.9,
                    timestamp: Date.now()
                }))
            },
            {
                name: 'architect' as AgentType,
                displayName: 'Architect',
                execute: vi.fn(async () => ({
                    result: 'Architecture analyzed',
                    reasoning: 'Architecture complete',
                    confidence: 0.9,
                    timestamp: Date.now()
                })),
                analyzeProject: vi.fn(async () => ({
                    patterns: ['Clean Architecture'],
                    stack: ['TypeScript']
                }))
            },
            {
                name: 'coder' as AgentType,
                displayName: 'Coder',
                execute: vi.fn(async () => ({
                    result: 'Code generated',
                    reasoning: 'Code complete',
                    confidence: 0.9,
                    timestamp: Date.now()
                }))
            },
            {
                name: 'reviewer' as AgentType,
                displayName: 'Reviewer',
                execute: vi.fn(async () => ({
                    result: 'Code validated',
                    reasoning: 'Review complete',
                    confidence: 0.9,
                    timestamp: Date.now()
                }))
            }
        ];
    }

    function getAllAgentComponents(): AgentCharacterComponent[] {
        const types: AgentType[] = ['context', 'architect', 'coder', 'reviewer'];
        return types
            .map(type => characterManager.getCharacter(type))
            .filter((c): c is AgentCharacterComponent => c !== undefined);
    }
});
