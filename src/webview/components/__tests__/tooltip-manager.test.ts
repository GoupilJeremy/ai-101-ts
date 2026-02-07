import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import TooltipManager from '../tooltip-manager.js';

describe('TooltipManager', () => {
    let dom;
    let document;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body><div id="target">Hover Me</div></body></html>', {
            url: "http://localhost/",
        });
        document = dom.window.document;
        (global as any).window = dom.window;
        (global as any).document = document;
        (global as any).navigator = dom.window.navigator;
        (global as any).requestAnimationFrame = (callback) => callback();
        (global as any).DOMRect = class {
            constructor(x = 0, y = 0, width = 0, height = 0) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.top = y;
                this.left = x;
                this.right = x + width;
                this.bottom = y + height;
            }
        };

        // Reset Singleton Instance for each test
        TooltipManager.instance = null;
    });

    afterEach(() => {
        dom.window.close();
        delete (global as any).window;
        delete (global as any).document;
        delete (global as any).navigator;
        delete (global as any).requestAnimationFrame;
        delete (global as any).DOMRect;
        vi.clearAllMocks();
    });

    it('should be a singleton', () => {
        const instance1 = TooltipManager.getInstance();
        const instance2 = TooltipManager.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should create a tooltip element on init', () => {
        TooltipManager.getInstance();
        const tooltip = document.getElementById('hud-tooltip');
        expect(tooltip).toBeDefined();
        expect(tooltip.getAttribute('role')).toBe('tooltip');
    });

    it('should show tooltip after delay', () => {
        const manager = TooltipManager.getInstance();
        const target = document.getElementById('target');
        const content = 'Test Content';

        vi.useFakeTimers();
        manager.show(target, content);

        // Ensure showTimeout is set
        expect(manager.showTimeout).toBeDefined();

        vi.advanceTimersByTime(510);

        const tooltip = document.getElementById('hud-tooltip');
        expect(tooltip.innerHTML).toBe(content);
        expect(tooltip.style.opacity).toBe('1');
        vi.useRealTimers();
    });

    it('should hide tooltip after delay', () => {
        const manager = TooltipManager.getInstance();
        const target = document.getElementById('target');

        vi.useFakeTimers();
        manager.show(target, 'content');
        vi.advanceTimersByTime(510);

        manager.hide();
        // Ensure hideTimeout is set
        expect(manager.hideTimeout).toBeDefined();

        vi.advanceTimersByTime(210);
        const tooltip = document.getElementById('hud-tooltip');
        expect(tooltip.style.opacity).toBe('0');
        vi.useRealTimers();
    });

    it('should position tooltip correctly', () => {
        const manager = TooltipManager.getInstance();
        const target = document.getElementById('target');

        // Mock getBoundingClientRect
        target.getBoundingClientRect = () => new (global as any).DOMRect(100, 100, 50, 50);

        vi.useFakeTimers();
        manager.show(target, 'content');
        vi.advanceTimersByTime(510);

        const tooltip = document.getElementById('hud-tooltip');
        // Default position is target.right + padding
        // left = 100 + 50 + 12 = 162
        // top = 100 + 25 - (tooltipHeight/2)
        expect(tooltip.style.transform).toContain('translate3d(162px');
        vi.useRealTimers();
    });
});
