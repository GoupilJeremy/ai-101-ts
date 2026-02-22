
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EditorOverlayManager } from '../editor-overlay-manager.js';
import { SpatialManager } from '../spatial-manager.js';
import * as vscode from 'vscode';

// Mock SpatialManager
vi.mock('../spatial-manager.js', () => {
    let handlers: Function[] = [];
    return {
        SpatialManager: {
            getInstance: vi.fn(() => ({
                onAnchorChanged: vi.fn((callback) => {
                    handlers.push(callback);
                    // Return disposable that removes the handler
                    return {
                        dispose: vi.fn(() => {
                            handlers = handlers.filter(h => h !== callback);
                        })
                    };
                }),
                // Helper to trigger event in tests
                _triggerAnchorChanged: (event: any) => handlers.forEach(h => h(event))
            }))
        }
    };
});

// Mock vscode
vi.mock('vscode', () => {
    return {
        window: {
            createTextEditorDecorationType: vi.fn(() => ({ dispose: vi.fn() })),
            activeTextEditor: undefined,
            onDidChangeActiveTextEditor: vi.fn(() => ({ dispose: vi.fn() })) // Return disposable
        },
        Range: vi.fn(),
        DecorationRangeBehavior: {
            OpenOpen: 0
        },
        OverviewRulerLane: {
            Left: 1
        }
    };
});

describe('EditorOverlayManager', () => {
    beforeEach(() => {
        // Reset singleton (if possible, or just create new instance logic if refactored, but here we test singleton)
        // Since singleton is private, we depend on getInstance.
        // We might need to clear implicit state if tests share the process.
        (EditorOverlayManager as any).instance = undefined;
        vi.clearAllMocks();
    });

    afterEach(() => {
        const instance = EditorOverlayManager.getInstance();
        instance.dispose();
    });

    it('should initialize decorations on creation', () => {
        EditorOverlayManager.getInstance();
        expect(vscode.window.createTextEditorDecorationType).toHaveBeenCalledTimes(4); // 4 agent types
    });

    it('should show decoration when anchor changes', () => {
        const manager = EditorOverlayManager.getInstance();

        // Mock active editor
        const setDecorations = vi.fn();
        (vscode.window as any).activeTextEditor = {
            setDecorations,
            document: { uri: { toString: () => 'file://test' } }
        };

        // Trigger anchor change
        const spatialManager = SpatialManager.getInstance();
        (spatialManager as any)._triggerAnchorChanged({ agent: 'coder', line: 10 });

        expect(setDecorations).toHaveBeenCalled();
    });

    it('should hide decoration when anchor is removed', () => {
        const manager = EditorOverlayManager.getInstance();

        // Mock active editor
        const setDecorations = vi.fn();
        (vscode.window as any).activeTextEditor = {
            setDecorations,
            document: { uri: { toString: () => 'file://test' } }
        };

        // Trigger show
        const spatialManager = SpatialManager.getInstance();
        (spatialManager as any)._triggerAnchorChanged({ agent: 'coder', line: 10 });

        // Trigger hide
        (spatialManager as any)._triggerAnchorChanged({ agent: 'coder', line: undefined });

        expect(setDecorations).toHaveBeenCalledTimes(2);
        // Second call should have empty range list
        expect(setDecorations.mock.calls[1][1]).toEqual([]);
    });
});
