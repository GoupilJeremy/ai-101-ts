import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LifecycleEventManager } from '../lifecycle-event-manager.js';

describe('LifecycleEventManager', () => {
    let manager: LifecycleEventManager;

    beforeEach(() => {
        manager = LifecycleEventManager.getInstance();
        // Clear listeners for clean state (since it's a singleton)
        (manager as any).listeners = new Map();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should be a singleton', () => {
        const instance1 = LifecycleEventManager.getInstance();
        const instance2 = LifecycleEventManager.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should allow subscribing to events', () => {
        const callback = vi.fn();
        manager.on('agentActivated', callback);

        const payload = { agent: 'coder' as any, timestamp: Date.now() };
        manager.emit('agentActivated', payload);

        vi.runAllTimers();

        expect(callback).toHaveBeenCalledWith(payload);
    });

    it('should support multiple subscribers for the same event', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        manager.on('suggestionGenerated', callback1);
        manager.on('suggestionGenerated', callback2);

        const payload = { id: '123', agent: 'coder' as any, code: 'const x = 1;', timestamp: Date.now() };
        manager.emit('suggestionGenerated', payload);

        vi.runAllTimers();

        expect(callback1).toHaveBeenCalledWith(payload);
        expect(callback2).toHaveBeenCalledWith(payload);
    });

    it('should allow unsubscribing', () => {
        const callback = vi.fn();
        const unsubscribe = manager.on('agentStateChanged', callback);

        unsubscribe();

        const payload = { agent: 'architect' as any, state: { status: 'thinking' as any, lastUpdate: Date.now() }, timestamp: Date.now() };
        manager.emit('agentStateChanged', payload);

        vi.runAllTimers();

        expect(callback).not.toHaveBeenCalled();
    });

    it('should isolate subscriber errors', async () => {
        const buggyCallback = vi.fn(() => { throw new Error('Boom!'); });
        const safeCallback = vi.fn();

        manager.on('suggestionAccepted', buggyCallback);
        manager.on('suggestionAccepted', safeCallback);

        const payload = { id: '456', agent: 'coder' as any, timestamp: Date.now() };
        manager.emit('suggestionAccepted', payload);

        vi.runAllTimers();

        expect(buggyCallback).toHaveBeenCalled();
        expect(safeCallback).toHaveBeenCalled();
    });

    it('should emit events asynchronously', () => {
        const callback = vi.fn();
        manager.on('suggestionRejected', callback);

        const payload = { id: '789', agent: 'reviewer' as any, timestamp: Date.now() };
        manager.emit('suggestionRejected', payload);

        // Should not be called yet (before timers run)
        expect(callback).not.toHaveBeenCalled();

        vi.runAllTimers();
        expect(callback).toHaveBeenCalledWith(payload);
    });
});
