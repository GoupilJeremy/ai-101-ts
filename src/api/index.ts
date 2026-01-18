/**
 * Public API module for AI-101 extension.
 * 
 * @packageDocumentation
 * @module api
 * 
 * @remarks
 * This module exports all public types and interfaces that external extensions
 * can use to integrate with AI-101.
 * 
 * **Semantic Versioning:**
 * All exports follow semantic versioning (semver). Breaking changes require
 * a major version bump.
 * 
 * @since 0.0.1
 */

// Export the main API interface
export { IAI101API } from './extension-api.js';

// Re-export LLM provider types for consumer convenience
export {
    ILLMProvider,
    ILLMOptions,
    ILLMResponse,
    IModelInfo
} from '../llm/provider.interface.js';

// Export Agent Renderer types
export {
    IAgentRenderer,
    AgentRenderContext,
    RenderTransition,
    RenderOptions,
    StateUpdateCallback,
    IDisposable,
    AgentType,
    IAgentState
} from '../ui/renderer.interface.js';
// Export event types
export {
    AI101Events,
    IAgentLifecycleEvent,
    IAgentStateChangedEvent,
    ISuggestionLifecycleEvent,
    Unsubscribe,
    EventCallback
} from './events.js';
// Export configuration types
export {
    IAI101Config,
    ConfigurationScope,
    LLMProvider,
    UITransparency,
    UIMode,
    ColorblindType,
    IColorblindSettings,
    IKeyboardShortcuts
} from './configuration-types.js';
