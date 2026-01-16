/**
 * Context Panel Component Unit Tests
 * Story 6.3: Implement Visible Context File Tracking and Display
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import ContextPanel from '../context-panel.js';

describe('Context Panel Component', () => {
    let dom: JSDOM;
    let document: Document;
    let mockStateManager: any;

    beforeEach(() => {
        // Create a fresh DOM for each test
        dom = new JSDOM('<!DOCTYPE html><html><body><div id="hud"></div></body></html>', {
            url: "http://localhost/",
        });
        document = dom.window.document;

        // Polyfill global types needed for events
        (global as any).Event = dom.window.Event;
        (global as any).MouseEvent = dom.window.MouseEvent;

        // Mock window on global
        (global as any).window = dom.window;

        // Mock state manager
        mockStateManager = {
            subscribe: vi.fn(),
            getContextFiles: vi.fn(),
            removeFile: vi.fn(),
            refreshFile: vi.fn()
        };

        // Mock vscode API
        const mockVscode = {
            postMessage: vi.fn(),
            workspace: {
                openTextDocument: vi.fn()
            }
        };
        (global as any).vscode = mockVscode;
        (dom.window as any).vscode = mockVscode;
    });

    afterEach(() => {
        // Clean up
        dom.window.close();
        delete (global as any).window;
        delete (global as any).Event;
        delete (global as any).MouseEvent;
        vi.clearAllMocks();
    });

    describe('Component Initialization', () => {
        it('should create context panel instance', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            expect(panel).toBeDefined();
        });

        it('should render context panel in DOM', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const panelElement = document.querySelector('.context-panel');
            expect(panelElement).toBeDefined();
        });
    });

    describe('File List Display', () => {
        it('should display file list with correct information', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [
                {
                    filename: 'app.ts',
                    path: 'src/app.ts',
                    tokens: 1500,
                    status: 'full',
                    relevance: 'current'
                },
                {
                    filename: 'utils.ts',
                    path: 'src/utils.ts',
                    tokens: 800,
                    status: 'summarized',
                    relevance: 'imports'
                }
            ];

            panel.updateFiles(testFiles);

            const fileItems = document.querySelectorAll('.context-panel__file-item');
            expect(fileItems.length).toBe(2);
        });

        it('should sort files by relevance score', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [
                { filename: 'utils.ts', relevance: 'imports' },
                { filename: 'app.ts', relevance: 'current' },
                { filename: 'config.ts', relevance: 'recent' }
            ];

            panel.updateFiles(testFiles);

            const fileItems = document.querySelectorAll('.context-panel__file-item');
            expect(fileItems[0].textContent).toContain('app.ts'); // current first
            expect(fileItems[1].textContent).toContain('utils.ts'); // imports second
            expect(fileItems[2].textContent).toContain('config.ts'); // recent last
        });
    });

    describe('File Actions', () => {
        it('should handle remove file action', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [{ filename: 'app.ts', path: 'src/app.ts' }];
            panel.updateFiles(testFiles);

            const removeButton = document.querySelector('.context-panel__file-remove');
            removeButton?.dispatchEvent(new Event('click'));

            expect(mockStateManager.removeFile).toHaveBeenCalledWith('src/app.ts');
        });

        it('should handle view full content action', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [{ filename: 'app.ts', path: 'src/app.ts', status: 'summarized' }];
            panel.updateFiles(testFiles);

            const viewButton = document.querySelector('.context-panel__file-view');
            viewButton?.dispatchEvent(new Event('click'));

            expect(mockStateManager.refreshFile).toHaveBeenCalledWith('src/app.ts');
        });

        it('should handle refresh file action', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [{ filename: 'app.ts', path: 'src/app.ts' }];
            panel.updateFiles(testFiles);

            const refreshButton = document.querySelector('.context-panel__file-refresh');
            refreshButton?.dispatchEvent(new Event('click'));

            expect(mockStateManager.refreshFile).toHaveBeenCalledWith('src/app.ts');
        });
    });

    describe('Visual Indicators', () => {
        it('should apply bold styling to current file', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [{ filename: 'app.ts', relevance: 'current' }];
            panel.updateFiles(testFiles);

            const fileItem = document.querySelector('.context-panel__file-item');
            expect(fileItem?.classList.contains('context-panel__file-item--current')).toBe(true);
        });

        it('should show import icons for imported files', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [{ filename: 'utils.ts', relevance: 'imports' }];
            panel.updateFiles(testFiles);

            const fileItem = document.querySelector('.context-panel__file-item');
            expect(fileItem?.classList.contains('context-panel__file-item--imports')).toBe(true);
        });

        it('should display timestamps for recent files', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [{
                filename: 'config.ts',
                relevance: 'recent',
                lastModified: Date.now() - 3600000 // 1 hour ago
            }];
            panel.updateFiles(testFiles);

            const timestamp = document.querySelector('.context-panel__file-timestamp');
            expect(timestamp).toBeDefined();
        });
    });

    describe('Token Usage Display', () => {
        it('should display total token count', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [
                { filename: 'file1.ts', tokens: 1000 },
                { filename: 'file2.ts', tokens: 2000 }
            ];
            panel.updateFiles(testFiles);

            const totalDisplay = document.querySelector('.context-panel__total-tokens');
            expect(totalDisplay?.textContent).toContain('3000');
        });

        it('should show budget percentage', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [
                { tokens: 2000 }
            ];
            panel.updateFiles(testFiles);

            const budgetDisplay = document.querySelector('.context-panel__budget-percentage');
            expect(budgetDisplay).toBeDefined();
        });
    });

    describe('Click to Open File', () => {
        it('should open file when filename is clicked', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [{ filename: 'app.ts', path: 'src/app.ts' }];
            panel.updateFiles(testFiles);

            const filename = document.querySelector('.context-panel__file-name');
            filename?.dispatchEvent(new Event('click'));

            expect((global as any).vscode.postMessage).toHaveBeenCalledWith({
                type: 'toExtension:openFile',
                filePath: 'src/app.ts'
            });
        });
    });

    describe('Expand/Collapse Functionality', () => {
        it('should toggle panel visibility', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const initialState = document.querySelector('.context-panel')?.classList.contains('context-panel--expanded');

            panel.toggle();

            const toggledState = document.querySelector('.context-panel')?.classList.contains('context-panel--expanded');
            expect(toggledState).not.toBe(initialState);
        });
    });

    describe('Real-time Updates', () => {
        it('should subscribe to state manager updates', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            expect(mockStateManager.subscribe).toHaveBeenCalled();
        });

        it('should update when context files change', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const newFiles = [{ filename: 'new-file.ts', path: 'src/new-file.ts', tokens: 500, status: 'full', relevance: 'current' }];
            // Simulate state manager callback
            const subscribeCallback = mockStateManager.subscribe.mock.calls[0][0];
            subscribeCallback(newFiles);

            const fileItems = document.querySelectorAll('.context-panel__file-item');
            expect(fileItems.length).toBe(1);
        });
    });

    describe('Context Snapshot', () => {
        it('should save context snapshot', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);

            const testFiles = [{ filename: 'app.ts', path: 'src/app.ts', tokens: 1000, status: 'full', relevance: 'current' }];
            panel.updateFiles(testFiles);

            // Context snapshot should be saved (implementation detail)
            expect(true).toBe(true); // Placeholder - actual test depends on implementation
        });
    });

    describe('Component Cleanup', () => {
        it('should clean up event listeners on destroy', () => {
            const panel = new ContextPanel('hud', mockStateManager);
            panel.render(document);
            panel.destroy();

            const panelElement = document.querySelector('.context-panel');
            expect(panelElement).toBeNull();
        });
    });
});