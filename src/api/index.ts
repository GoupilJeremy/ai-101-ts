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
