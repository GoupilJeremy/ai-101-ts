/**
 * Tests for SpatialManager - Line Anchoring Extension
 * Story 11.3 - Test Suite
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpatialManager } from '../spatial-manager.js';
import { AgentType } from '../../agents/shared/agent.interface.js';
import * as vscode from 'vscode';

// Mock vscode module
vi.mock('vscode', () => ({
    window: {
        activeTextEditor: undefined,
        onDidChangeTextEditorSelection: vi.fn(() => ({ dispose: vi.fn() })),
        onDidChangeTextEditorVisibleRanges: vi.fn(() => ({ dispose: vi.fn() })),
        onDidChangeActiveTextEditor: vi.fn(() => ({ dispose: vi.fn() }))
    },
    Disposable: {
        from: vi.fn()
    }
}));

// Mock ExtensionStateManager
const mockPostMessageToWebview = vi.fn();
const mockNotifyCursorUpdate = vi.fn();

vi.mock('../../state/extension-state-manager.js', () => ({
    ExtensionStateManager: {
        getInstance: vi.fn(() => ({
            notifyCursorUpdate: mockNotifyCursorUpdate
        }))
    }
}));

vi.mock('../webview-manager.js', () => ({
    WebviewManager: {
        getInstance: vi.fn(() => ({
            postMessageToWebview: mockPostMessageToWebview
        }))
    }
}));

describe('SpatialManager - Line Anchoring (Story 11.3)', () => {
    let spatialManager: SpatialManager;
    let mockEditor: any;

    beforeEach(() => {
        // Clear mocks
        mockPostMessageToWebview.mockClear();
        mockNotifyCursorUpdate.mockClear();

        // Reset singleton instance before each test
        // @ts-ignore - accessing private property for testing
        SpatialManager.instance = undefined;

        // Create fresh instance
        spatialManager = SpatialManager.getInstance();

        // Mock editor
        mockEditor = {
            document: {
                lineCount: 100
            },
            selection: {
                active: { line: 10, character: 5 }
            },
            visibleRanges: [
                { start: { line: 0 }, end: { line: 30 } }
            ]
        };

        // Set active editor
        (vscode.window as any).activeTextEditor = mockEditor;
    });

    describe('attachAgentToLine', () => {
        it('should anchor agent to a specific line', () => {
            spatialManager.attachAgentToLine('architect', 50);

            expect(spatialManager.isAgentAnchored('architect')).toBe(true);
            expect(spatialManager.getAnchoredAgents().get('architect')).toBe(50);
        });

        it('should update existing anchor when called again', () => {
            spatialManager.attachAgentToLine('architect', 50);
            spatialManager.attachAgentToLine('architect', 75);

            expect(spatialManager.getAnchoredAgents().get('architect')).toBe(75);
        });

        it('should handle multiple agents anchored to different lines', () => {
            spatialManager.attachAgentToLine('architect', 50);
            spatialManager.attachAgentToLine('coder', 60);
            spatialManager.attachAgentToLine('reviewer', 70);

            const anchors = spatialManager.getAnchoredAgents();
            expect(anchors.size).toBe(3);
            expect(anchors.get('architect')).toBe(50);
            expect(anchors.get('coder')).toBe(60);
            expect(anchors.get('reviewer')).toBe(70);
        });

        it('should anchor to line 0 (first line)', () => {
            spatialManager.attachAgentToLine('context', 0);

            expect(spatialManager.isAgentAnchored('context')).toBe(true);
            expect(spatialManager.getAnchoredAgents().get('context')).toBe(0);
        });

        it('should anchor to last line', () => {
            spatialManager.attachAgentToLine('architect', 99);

            expect(spatialManager.getAnchoredAgents().get('architect')).toBe(99);
        });

        it('should handle all four agent types', () => {
            spatialManager.attachAgentToLine('context', 10);
            spatialManager.attachAgentToLine('architect', 20);
            spatialManager.attachAgentToLine('coder', 30);
            spatialManager.attachAgentToLine('reviewer', 40);

            expect(spatialManager.getAnchoredAgents().size).toBe(4);
        });
    });

    describe('detachAgent', () => {
        it('should detach an anchored agent', () => {
            spatialManager.attachAgentToLine('architect', 50);
            expect(spatialManager.isAgentAnchored('architect')).toBe(true);

            spatialManager.detachAgent('architect');

            expect(spatialManager.isAgentAnchored('architect')).toBe(false);
            expect(spatialManager.getAnchoredAgents().has('architect')).toBe(false);
        });

        it('should handle detaching non-anchored agent (no-op)', () => {
            expect(spatialManager.isAgentAnchored('coder')).toBe(false);

            // Should not throw
            expect(() => spatialManager.detachAgent('coder')).not.toThrow();
        });

        it('should detach only the specified agent', () => {
            spatialManager.attachAgentToLine('architect', 50);
            spatialManager.attachAgentToLine('coder', 60);

            spatialManager.detachAgent('architect');

            expect(spatialManager.isAgentAnchored('architect')).toBe(false);
            expect(spatialManager.isAgentAnchored('coder')).toBe(true);
            expect(spatialManager.getAnchoredAgents().size).toBe(1);
        });
    });

    describe('getAnchoredAgents', () => {
        it('should return empty map when no agents anchored', () => {
            const anchors = spatialManager.getAnchoredAgents();

            expect(anchors.size).toBe(0);
        });

        it('should return all anchored agents', () => {
            spatialManager.attachAgentToLine('architect', 50);
            spatialManager.attachAgentToLine('coder', 60);

            const anchors = spatialManager.getAnchoredAgents();

            expect(anchors.size).toBe(2);
            expect(anchors.get('architect')).toBe(50);
            expect(anchors.get('coder')).toBe(60);
        });

        it('should return a copy of the internal map (immutable)', () => {
            spatialManager.attachAgentToLine('architect', 50);

            const anchors1 = spatialManager.getAnchoredAgents();
            anchors1.set('coder', 99); // Modify returned map

            const anchors2 = spatialManager.getAnchoredAgents();

            // Original should be unchanged
            expect(anchors2.has('coder')).toBe(false);
            expect(anchors2.size).toBe(1);
        });
    });

    describe('isAgentAnchored', () => {
        it('should return true for anchored agent', () => {
            spatialManager.attachAgentToLine('architect', 50);

            expect(spatialManager.isAgentAnchored('architect')).toBe(true);
        });

        it('should return false for non-anchored agent', () => {
            expect(spatialManager.isAgentAnchored('coder')).toBe(false);
        });

        it('should return false after detaching', () => {
            spatialManager.attachAgentToLine('reviewer', 50);
            spatialManager.detachAgent('reviewer');

            expect(spatialManager.isAgentAnchored('reviewer')).toBe(false);
        });
    });

    describe('Position Updates and Synchronization', () => {
        it('should notify webview when agent is attached', () => {
            spatialManager.attachAgentToLine('architect', 50);

            expect(mockPostMessageToWebview).toHaveBeenCalled();
            const lastCall = mockPostMessageToWebview.mock.calls[mockPostMessageToWebview.mock.calls.length - 1][0];
            expect(lastCall.type).toBe('toWebview:agentPositionUpdate');
            expect(lastCall.agentId).toBe('architect');
            expect(lastCall.position).toBeDefined();
        });

        it('should notify webview with null position when agent is detached', () => {
            spatialManager.attachAgentToLine('architect', 50);
            mockPostMessageToWebview.mockClear();

            spatialManager.detachAgent('architect');

            expect(mockPostMessageToWebview).toHaveBeenCalledWith({
                type: 'toWebview:agentPositionUpdate',
                agentId: 'architect',
                position: null
            });
        });

        it('should handle no active editor gracefully', () => {
            (vscode.window as any).activeTextEditor = undefined;

            // Should not throw
            expect(() => spatialManager.attachAgentToLine('architect', 50)).not.toThrow();
        });

        it('should include isVisible flag in position update', () => {
            // Anchor to a visible line (0-30 are visible in mock)
            spatialManager.attachAgentToLine('architect', 20);

            const lastCall = mockPostMessageToWebview.mock.calls[mockPostMessageToWebview.mock.calls.length - 1][0];
            expect(lastCall.position.isVisible).toBeDefined();
        });
    });

    describe('Scroll and Viewport Synchronization', () => {
        it('should resync anchored agents (manual verification)', () => {
            // This test verifies that multiple anchored agents can coexist
            // Full viewport synchronization is tested in integration tests
            spatialManager.attachAgentToLine('architect', 50);
            spatialManager.attachAgentToLine('coder', 60);
            spatialManager.attachAgentToLine('reviewer', 70);

            // Verify all 3 agents are anchored
            expect(spatialManager.getAnchoredAgents().size).toBe(3);
            expect(spatialManager.isAgentAnchored('architect')).toBe(true);
            expect(spatialManager.isAgentAnchored('coder')).toBe(true);
            expect(spatialManager.isAgentAnchored('reviewer')).toBe(true);
        });

        it('should update anchored agents on active editor change', () => {
            spatialManager.attachAgentToLine('architect', 50);

            mockPostMessageToWebview.mockClear();

            // Simulate active editor change
            const editorChangeListener = (vscode.window.onDidChangeActiveTextEditor as any).mock.calls[0][0];
            editorChangeListener(mockEditor);

            // Should have sent update for anchored agent
            expect(mockPostMessageToWebview).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle anchoring to negative line (should clamp to 0)', () => {
            // AgentPositioning should clamp internally
            spatialManager.attachAgentToLine('architect', -10);

            // Should still be anchored (to line -10, but AgentPositioning will clamp)
            expect(spatialManager.isAgentAnchored('architect')).toBe(true);
        });

        it('should handle anchoring to line beyond document end', () => {
            // AgentPositioning should clamp internally
            spatialManager.attachAgentToLine('architect', 500);

            expect(spatialManager.isAgentAnchored('architect')).toBe(true);
        });

        it('should handle empty document (0 lines)', () => {
            mockEditor.document.lineCount = 0;

            // Should not throw
            expect(() => spatialManager.attachAgentToLine('architect', 0)).not.toThrow();
        });

        it('should handle single line document', () => {
            mockEditor.document.lineCount = 1;

            spatialManager.attachAgentToLine('architect', 0);

            expect(spatialManager.isAgentAnchored('architect')).toBe(true);
        });

        it('should handle very large document (10000 lines)', () => {
            mockEditor.document.lineCount = 10000;

            spatialManager.attachAgentToLine('architect', 5000);

            expect(spatialManager.getAnchoredAgents().get('architect')).toBe(5000);
        });
    });

    describe('Singleton Pattern', () => {
        it('should return same instance', () => {
            const instance1 = SpatialManager.getInstance();
            const instance2 = SpatialManager.getInstance();

            expect(instance1).toBe(instance2);
        });

        it('should maintain anchors across getInstance calls', () => {
            const instance1 = SpatialManager.getInstance();
            instance1.attachAgentToLine('architect', 50);

            const instance2 = SpatialManager.getInstance();

            expect(instance2.isAgentAnchored('architect')).toBe(true);
            expect(instance2.getAnchoredAgents().get('architect')).toBe(50);
        });
    });

    describe('Dispose', () => {
        it('should have dispose method', () => {
            expect(typeof spatialManager.dispose).toBe('function');
        });

        it('should not throw when disposing', () => {
            spatialManager.attachAgentToLine('architect', 50);

            expect(() => spatialManager.dispose()).not.toThrow();
        });
    });
});
