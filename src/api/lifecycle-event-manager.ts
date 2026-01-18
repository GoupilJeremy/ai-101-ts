import { AI101Events, Unsubscribe, EventCallback } from './events.js';
import { ErrorHandler } from '../errors/error-handler.js';

/**
 * Manages subscription and emission of lifecycle events.
 * 
 * @internal
 */
export class LifecycleEventManager {
    private static instance: LifecycleEventManager;
    private listeners: Map<keyof AI101Events, Set<EventCallback<any>>> = new Map();

    private constructor() { }

    public static getInstance(): LifecycleEventManager {
        if (!LifecycleEventManager.instance) {
            LifecycleEventManager.instance = new LifecycleEventManager();
        }
        return LifecycleEventManager.instance;
    }

    /**
     * Subscribes a callback to an event.
     */
    public on<K extends keyof AI101Events>(event: K, callback: EventCallback<AI101Events[K]>): Unsubscribe {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        const callbacks = this.listeners.get(event)!;
        callbacks.add(callback);

        return () => {
            callbacks.delete(callback);
        };
    }

    /**
     * Emits an event with the given payload.
     * Execution is asynchronous and isolated to prevent subscriber errors from affecting the core.
     */
    public emit<K extends keyof AI101Events>(event: K, payload: AI101Events[K]): void {
        const callbacks = this.listeners.get(event);
        if (!callbacks || callbacks.size === 0) {
            return;
        }

        // Use setTimeout to ensure emission is truly non-blocking for the emitter
        setTimeout(() => {
            callbacks.forEach(async (callback) => {
                try {
                    await callback(payload);
                } catch (error: any) {
                    ErrorHandler.log(`Error in subscriber callback for event '${event}': ${error.message}`, 'ERROR');
                    // We don't rethrow to avoid crashing the emission loop
                }
            });
        }, 0);
    }
}
