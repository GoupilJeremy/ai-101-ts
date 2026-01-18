import { AgentType, IAgentState } from '../agents/shared/agent.interface.js';

/**
 * Common fields for all lifecycle events.
 * 
 * @public
 * @since 0.0.1
 */
export interface ILifecycleEvent {
    /** Timestamp when the event occurred */
    timestamp: number;
}

/**
 * Payload for agent lifecycle events.
 * 
 * @public
 * @since 0.0.1
 */
export interface IAgentLifecycleEvent extends ILifecycleEvent {
    /** The type of agent that triggered the event */
    agent: AgentType;
    /** Optional data associated with the event */
    data?: any;
}

/**
 * Payload for agent state change events.
 * 
 * @public
 * @since 0.0.1
 */
export interface IAgentStateChangedEvent extends IAgentLifecycleEvent {
    /** The new state of the agent */
    state: IAgentState;
}

/**
 * Payload for suggestion lifecycle events.
 * 
 * @public
 * @since 0.0.1
 */
export interface ISuggestionLifecycleEvent extends ILifecycleEvent {
    /** Unique identifier for the suggestion */
    id: string;
    /** The agent that generated the suggestion */
    agent: AgentType;
    /** Optional code or content of the suggestion */
    code?: string;
    /** Optional data associated with the event */
    data?: any;
}

/**
 * Map of all supported event names to their payload types.
 * 
 * @public
 * @since 0.0.1
 */
export interface AI101Events {
    /** Triggered when an agent starts working or thinking */
    'agentActivated': IAgentLifecycleEvent;
    /** Triggered when an agent transitions states */
    'agentStateChanged': IAgentStateChangedEvent;
    /** Triggered when a new suggestion is generated */
    'suggestionGenerated': ISuggestionLifecycleEvent;
    /** Triggered when the user accepts a suggestion */
    'suggestionAccepted': ISuggestionLifecycleEvent;
    /** Triggered when the user rejects a suggestion */
    'suggestionRejected': ISuggestionLifecycleEvent;
}

/**
 * Callback function type for event subscriptions.
 * 
 * @public
 * @since 0.0.1
 */
export type EventCallback<T> = (payload: T) => void | Promise<void>;

/**
 * Function type returned by subscription methods to unsubscribe.
 * 
 * @public
 * @since 0.0.1
 */
export type Unsubscribe = () => void;
