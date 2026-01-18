/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomSVGRenderer } from '../custom-renderer-example.js';
import { AgentRenderContext } from '../../../src/api/index.js';

describe('CustomSVGRenderer', () => {
    let renderer: CustomSVGRenderer;
    let container: HTMLElement;
    let mockContext: AgentRenderContext;

    beforeEach(() => {
        renderer = new CustomSVGRenderer();
        container = document.createElement('div');
        mockContext = {
            type: 'coder',
            displayName: 'Coder Agent',
            icon: '💻',
            state: {
                status: 'idle',
                lastUpdate: Date.now()
            }
        };
    });

    it('should create an SVG element on render', () => {
        renderer.render(mockContext, container);
        const svg = container.querySelector('svg');
        expect(svg).toBeDefined();
        expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
    });

    it('should have a circle with the correct agent color', () => {
        renderer.render(mockContext, container);
        const circle = container.querySelector('circle');
        expect(circle).toBeDefined();
        // Coder color is #50C878 in the example
        expect(circle?.getAttribute('fill')).toBe('#50C878');
    });

    it('should display the agent icon', () => {
        renderer.render(mockContext, container);
        const text = container.querySelector('text');
        expect(text?.textContent).toBe('💻');
    });

    it('should handle state updates', () => {
        renderer.render(mockContext, container);
        const circle = container.querySelector('circle');

        // Mock the callback trigger (in real life we would trigger it via the mocked subscription)
        // For testing the handler:
        (renderer as any).handleStateUpdate({ status: 'working', lastUpdate: Date.now() });
        expect(circle?.style.opacity).toBe('1');

        (renderer as any).handleStateUpdate({ status: 'idle', lastUpdate: Date.now() });
        expect(circle?.style.opacity).toBe('0.5');
    });

    it('should return fixed size', () => {
        const size = renderer.getSize();
        expect(size).toEqual({ width: 80, height: 80 });
    });

    it('should clean up on destroy', () => {
        renderer.render(mockContext, container);
        expect(container.children.length).toBe(1);

        renderer.destroy();
        expect(container.children.length).toBe(0);
    });

    it('should apply optOutDefaultStyling when requested', () => {
        renderer.render(mockContext, container, { optOutDefaultStyling: true });
        const svg = container.querySelector('svg');
        expect(svg?.style.filter).toContain('drop-shadow');
    });
});
