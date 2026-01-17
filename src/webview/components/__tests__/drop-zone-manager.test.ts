
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
// @ts-ignore
import DropZoneManager from '../drop-zone-manager.js';

describe('DropZoneManager', () => {
    let dom: JSDOM;
    let document: Document;
    let manager: any;
    let mockVscode: any;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body><div id="hud-container"></div></body></html>', {
            url: "http://localhost/",
        });
        document = dom.window.document;
        (global as any).window = dom.window;
        (global as any).document = document;
        (global as any).Event = dom.window.Event;
        (global as any).CustomEvent = dom.window.CustomEvent;

        mockVscode = {
            postMessage: vi.fn()
        };
        (global as any).vscode = mockVscode;
        (global as any).acquireVsCodeApi = () => mockVscode;
        (dom.window as any).acquireVsCodeApi = () => mockVscode;
        (dom.window as any).vscode = mockVscode;

        manager = new DropZoneManager('hud-container');
    });

    afterEach(() => {
        dom.window.close();
        delete (global as any).window;
        delete (global as any).document;
        delete (global as any).Event;
        delete (global as any).CustomEvent;
        vi.clearAllMocks();
    });

    it('should create drop zones in the container', () => {
        manager.render(document);
        const todoZone = document.querySelector('.drop-zone--todo');
        const dismissZone = document.querySelector('.drop-zone--dismiss');

        expect(todoZone).toBeDefined();
        expect(dismissZone).toBeDefined();
    });

    it('should show drop zones on dragenter when dragging content', () => {
        // Mock dragenter with dataTransfer
        manager.render(document);
        const event = new dom.window.Event('dragenter', { bubbles: true }) as any;
        event.dataTransfer = { types: ['text/plain'] };

        document.dispatchEvent(event);

        const todoZone = document.querySelector('.drop-zone--todo') as HTMLElement;
        expect(todoZone.classList.contains('drop-zone--visible')).toBe(true);
    });

    it('should post message when item is dropped on TODO zone', () => {
        manager.render(document);
        const todoZone = document.querySelector('.drop-zone--todo') as HTMLElement;

        const dropEvent = new dom.window.CustomEvent('drop', {
            bubbles: true,
            cancelable: true
        }) as any;
        dropEvent.dataTransfer = {
            getData: () => 'alert-123'
        };

        todoZone.dispatchEvent(dropEvent);

        expect(mockVscode.postMessage).toHaveBeenCalledWith(expect.objectContaining({
            type: 'toExtension:createTodo',
            alertId: '123'
        }));
    });
});
