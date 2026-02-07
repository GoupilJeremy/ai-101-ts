/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { IAgentRenderer, AgentRenderContext, IAgentState } from '../renderer.interface.js';

describe('IAgentRenderer Interface Contract', () => {
    /**
     * A mock implementation to verify the interface contract
     */
    class MockRenderer implements IAgentRenderer {
        render = vi.fn();
        getSize = vi.fn().mockReturnValue({ width: 50, height: 50 });
        animate = vi.fn();
        destroy = vi.fn();
        onStateUpdate = vi.fn().mockReturnValue({ dispose: vi.fn() });
    }

    it('should allow implementing the IAgentRenderer interface', () => {
        const renderer: IAgentRenderer = new MockRenderer();
        expect(renderer).toBeDefined();
        expect(renderer.render).toBeDefined();
        expect(renderer.getSize).toBeDefined();
        expect(renderer.animate).toBeDefined();
        expect(renderer.destroy).toBeDefined();
        expect(renderer.onStateUpdate).toBeDefined();
    });

    it('should follow the expected execution flow', () => {
        const renderer = new MockRenderer();
        const container = document.createElement('div');
        const context: AgentRenderContext = {
            type: 'coder',
            displayName: 'Coder Agent',
            icon: '💻',
            state: { status: 'idle', lastUpdate: Date.now() }
        };

        renderer.render(context, container);
        expect(renderer.render).toHaveBeenCalledWith(context, container);

        const size = renderer.getSize();
        expect(size).toEqual({ width: 50, height: 50 });

        renderer.animate('idle-to-thinking');
        expect(renderer.animate).toHaveBeenCalledWith('idle-to-thinking');

        renderer.destroy();
        expect(renderer.destroy).toHaveBeenCalled();
    });
});
