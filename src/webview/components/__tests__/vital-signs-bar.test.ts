/**
 * Vital Signs Bar Component Unit Tests
 * Story 6.3 Task 2: Integrate with Vital Signs Bar
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import VitalSignsBar from '../vital-signs-bar.js';

describe('Vital Signs Bar Component', () => {
    let dom;
    let document;
    let mockStateManager;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body><div id="hud-container"><div id="vital-signs-bar"><span id="metrics"></span></div></div></body></html>', {
            url: "http://localhost/",
        });
        document = dom.window.document;
        (global as any).window = dom.window;
        (global as any).document = document;
        (global as any).Event = dom.window.Event;
        (global as any).MouseEvent = dom.window.MouseEvent;

        mockStateManager = {
            subscribe: vi.fn(),
        };
    });

    afterEach(() => {
        dom.window.close();
        delete (global as any).window;
        delete (global as any).document;
        delete (global as any).Event;
        delete (global as any).MouseEvent;
        vi.clearAllMocks();
    });

    it('should initialize correctly', () => {
        const bar = new VitalSignsBar('vital-signs-bar', mockStateManager);
        expect(bar).toBeDefined();
    });

    it('should update metrics display', () => {
        const bar = new VitalSignsBar('vital-signs-bar', mockStateManager);
        const metrics = { tokens: 100, cost: 0.05, files: 3 };

        bar.updateMetrics(metrics);

        const metricsEl = document.getElementById('metrics');
        expect(metricsEl.textContent).toContain('Tokens: 100');
        expect(metricsEl.textContent).toContain('Cost: $0.05');
        expect(metricsEl.textContent).toContain('Files: 3');
    });

    it('should make files count clickable', () => {
        const bar = new VitalSignsBar('vital-signs-bar', mockStateManager, { onFilesClick: vi.fn() });
        const metrics = { tokens: 100, cost: 0.05, files: 3 };
        bar.updateMetrics(metrics);

        const filesEl = document.querySelector('.vital-signs__files');
        expect(filesEl).toBeDefined();
        expect(filesEl.style.cursor).toBe('pointer');
    });

    it('should trigger onFilesClick callback when files count is clicked', () => {
        const onFilesClick = vi.fn();
        const bar = new VitalSignsBar('vital-signs-bar', mockStateManager, { onFilesClick });
        const metrics = { tokens: 100, cost: 0.05, files: 3 };
        bar.updateMetrics(metrics);

        const filesEl = document.querySelector('.vital-signs__files');
        filesEl.dispatchEvent(new Event('click'));

        expect(onFilesClick).toHaveBeenCalled();
    });
});
