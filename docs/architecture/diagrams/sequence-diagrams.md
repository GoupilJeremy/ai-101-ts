# Sequence Diagrams

## Key Interaction Flows

This document contains sequence diagrams for the most important interaction flows in AI-101.

## 1. User Request Processing Flow

Shows the complete flow from user request to suggestion display.

```mermaid
sequenceDiagram
    actor User
    participant CMD as Command
    participant ORCH as AgentOrchestrator
    participant CTX as ContextAgent
    participant ARCH as ArchitectAgent
    participant CODE as CoderAgent
    participant REV as ReviewerAgent
    participant LLM as LLMProviderManager
    participant CACHE as HybridCache
    participant STATE as ExtensionStateManager
    participant WV as Webview
    
    User->>CMD: Execute "Get Suggestion"
    CMD->>ORCH: processUserRequest()
    
    Note over ORCH: Phase 1: Context Loading
    ORCH->>STATE: updateAgentState('context', 'active')
    STATE->>WV: postMessage(agent:stateChanged)
    ORCH->>CTX: execute(request)
    CTX->>CTX: Load active file, cursor position
    CTX-->>ORCH: context
    ORCH->>STATE: updateAgentState('context', 'idle')
    
    Note over ORCH: Phase 2: Architecture Analysis
    ORCH->>STATE: updateAgentState('architect', 'active')
    STATE->>WV: postMessage(agent:stateChanged)
    ORCH->>ARCH: execute(context)
    ARCH->>LLM: complete(architectPrompt)
    LLM->>CACHE: get(cacheKey)
    alt Cache Hit
        CACHE-->>LLM: cached response
    else Cache Miss
        LLM->>LLM: Call OpenAI/Anthropic API
        LLM->>CACHE: set(cacheKey, response)
    end
    LLM-->>ARCH: architecture analysis
    ARCH-->>ORCH: architecture
    ORCH->>STATE: updateAgentState('architect', 'idle')
    
    Note over ORCH: Phase 3: Code Generation
    ORCH->>STATE: updateAgentState('coder', 'active')
    STATE->>WV: postMessage(agent:stateChanged)
    ORCH->>CODE: execute({context, architecture})
    CODE->>LLM: complete(codePrompt)
    LLM->>CACHE: get(cacheKey)
    CACHE-->>LLM: response
    LLM-->>CODE: code suggestion
    CODE-->>ORCH: suggestion
    ORCH->>STATE: updateAgentState('coder', 'idle')
    
    Note over ORCH: Phase 4: Code Review
    ORCH->>STATE: updateAgentState('reviewer', 'active')
    STATE->>WV: postMessage(agent:stateChanged)
    ORCH->>REV: execute(suggestion)
    REV->>REV: Validate code, check risks
    REV-->>ORCH: review results
    ORCH->>STATE: updateAgentState('reviewer', 'idle')
    
    Note over ORCH: Finalize
    ORCH->>STATE: addSuggestion(suggestion, review)
    STATE->>WV: postMessage(suggestion:generated)
    WV->>User: Display suggestion in HUD
```

## 2. Agent Collaboration Sequence

Detailed view of how agents collaborate during code generation.

```mermaid
sequenceDiagram
    participant ORCH as AgentOrchestrator
    participant CTX as ContextAgent
    participant ARCH as ArchitectAgent
    participant CODE as CoderAgent
    participant REV as ReviewerAgent
    participant EVENTS as LifecycleEventManager
    
    ORCH->>EVENTS: emit('workflow:started')
    
    Note over CTX: Step 1: Context
    ORCH->>CTX: execute(userRequest)
    CTX->>CTX: loadActiveFile()
    CTX->>CTX: getCursorPosition()
    CTX->>CTX: loadRelatedFiles()
    CTX-->>ORCH: {files, metadata, cursor}
    ORCH->>EVENTS: emit('agent:completed', {agent: 'context'})
    
    Note over ARCH: Step 2: Architecture
    ORCH->>ARCH: execute(context)
    ARCH->>ARCH: detectPatterns(files)
    ARCH->>ARCH: identifyConstraints()
    ARCH->>ARCH: analyzeArchitecture()
    ARCH-->>ORCH: {patterns, constraints, recommendations}
    ORCH->>EVENTS: emit('agent:completed', {agent: 'architect'})
    
    Note over CODE: Step 3: Code Generation
    ORCH->>CODE: execute({context, architecture})
    CODE->>CODE: buildPrompt(context, architecture)
    CODE->>CODE: callLLM(prompt)
    CODE->>CODE: parseResponse()
    CODE-->>ORCH: {code, explanation, confidence}
    ORCH->>EVENTS: emit('agent:completed', {agent: 'coder'})
    
    Note over REV: Step 4: Review
    ORCH->>REV: execute(codeSuggestion)
    REV->>REV: validateSyntax()
    REV->>REV: checkSecurityRisks()
    REV->>REV: identifyEdgeCases()
    REV->>REV: calculateConfidence()
    REV-->>ORCH: {issues, risks, confidence, approved}
    ORCH->>EVENTS: emit('agent:completed', {agent: 'reviewer'})
    
    ORCH->>EVENTS: emit('workflow:completed')
```

## 3. Suggestion Accept/Reject Flow

Shows what happens when user accepts or rejects a suggestion.

```mermaid
sequenceDiagram
    actor User
    participant WV as Webview
    participant EXT as Extension
    participant STATE as ExtensionStateManager
    participant EDITOR as VSCode Editor
    participant TELEM as TelemetryService
    participant EVENTS as LifecycleEventManager
    
    alt User Accepts Suggestion
        User->>WV: Click "Accept"
        WV->>EXT: postMessage({type: 'suggestion:accept', id})
        EXT->>STATE: getSuggestion(id)
        STATE-->>EXT: suggestion
        EXT->>EVENTS: emit('suggestion:accepting', {suggestion})
        EXT->>EDITOR: edit.insert(suggestion.code)
        EDITOR-->>EXT: edit applied
        EXT->>STATE: markSuggestionAccepted(id)
        EXT->>TELEM: trackEvent('suggestion:accepted', {id, confidence})
        EXT->>EVENTS: emit('suggestion:accepted', {suggestion})
        EXT->>WV: postMessage({type: 'suggestion:accepted', id})
        WV->>User: Show success animation
    else User Rejects Suggestion
        User->>WV: Click "Reject"
        WV->>EXT: postMessage({type: 'suggestion:reject', id, reason})
        EXT->>STATE: getSuggestion(id)
        STATE-->>EXT: suggestion
        EXT->>EVENTS: emit('suggestion:rejecting', {suggestion, reason})
        EXT->>STATE: markSuggestionRejected(id, reason)
        EXT->>TELEM: trackEvent('suggestion:rejected', {id, reason})
        EXT->>EVENTS: emit('suggestion:rejected', {suggestion, reason})
        EXT->>WV: postMessage({type: 'suggestion:rejected', id})
        WV->>User: Hide suggestion
    end
```

## 4. Error Handling Flow

Shows how errors are caught, handled, and communicated to the user.

```mermaid
sequenceDiagram
    participant ORCH as AgentOrchestrator
    participant AGENT as Agent
    participant LLM as LLMProviderManager
    participant ERR as ErrorHandler
    participant RETRY as RetryLogic
    participant STATE as ExtensionStateManager
    participant WV as Webview
    participant USER as User
    
    ORCH->>AGENT: execute(context)
    AGENT->>LLM: complete(request)
    
    alt API Error (Retryable)
        LLM->>LLM: API call fails (429 Rate Limit)
        LLM->>ERR: handleError(error)
        ERR->>ERR: isRetryable(error) → true
        ERR->>RETRY: retry(operation)
        RETRY->>RETRY: exponentialBackoff(attempt)
        RETRY->>LLM: retry API call
        alt Retry Succeeds
            LLM-->>AGENT: response
            AGENT-->>ORCH: result
        else Retry Fails
            RETRY->>ERR: maxRetriesExceeded
            ERR->>STATE: updateAgentState('error')
            STATE->>WV: postMessage(agent:error)
            ERR->>USER: showErrorMessage("Rate limit exceeded")
        end
    else API Error (Non-Retryable)
        LLM->>LLM: API call fails (401 Unauthorized)
        LLM->>ERR: handleError(error)
        ERR->>ERR: isRetryable(error) → false
        ERR->>STATE: updateAgentState('error')
        STATE->>WV: postMessage(agent:error)
        ERR->>USER: showErrorMessage("Invalid API key", "Configure")
    else Agent Error
        AGENT->>AGENT: Internal error
        AGENT->>ERR: handleError(error)
        ERR->>STATE: updateAgentState('error')
        STATE->>WV: postMessage(agent:error)
        ERR->>USER: showErrorMessage("Agent failed")
        ERR->>ORCH: resetAgent()
    end
```

## 5. Configuration Change Flow

Shows how configuration changes propagate through the system.

```mermaid
sequenceDiagram
    actor User
    participant VSCODE as VSCode Settings
    participant CONFIG as ConfigurationManager
    participant STATE as ExtensionStateManager
    participant WV as Webview
    participant ORCH as AgentOrchestrator
    participant LLM as LLMProviderManager
    
    User->>VSCODE: Change setting (e.g., provider)
    VSCODE->>CONFIG: onDidChangeConfiguration
    CONFIG->>CONFIG: validateConfig(newConfig)
    
    alt Config Valid
        CONFIG->>STATE: updateConfig(newConfig)
        STATE->>WV: postMessage({type: 'config:changed'})
        WV->>WV: Update UI (e.g., show new provider)
        
        alt Provider Changed
            CONFIG->>LLM: setActiveProvider(newProvider)
            LLM->>LLM: validateProviderConfig()
            LLM-->>CONFIG: provider ready
        end
        
        alt Mode Changed
            CONFIG->>ORCH: setMode(newMode)
            ORCH->>STATE: updateMode(newMode)
            STATE->>WV: postMessage({type: 'mode:changed'})
            WV->>WV: Apply mode (e.g., hide agents in Focus mode)
        end
        
        CONFIG->>User: Configuration updated
    else Config Invalid
        CONFIG->>User: showErrorMessage("Invalid configuration")
    end
```

## 6. Cache Lookup Flow

Detailed view of the hybrid cache lookup process.

```mermaid
sequenceDiagram
    participant AGENT as Agent
    participant LLM as LLMProviderManager
    participant CACHE as HybridCache
    participant L1 as MemoryCache
    participant L2 as FileCache
    participant API as LLM API
    
    AGENT->>LLM: complete(request)
    LLM->>LLM: generateCacheKey(request)
    LLM->>CACHE: get(cacheKey)
    
    CACHE->>L1: get(cacheKey)
    alt L1 Hit
        L1-->>CACHE: cached response
        CACHE->>CACHE: stats.l1Hits++
        CACHE-->>LLM: response
        LLM-->>AGENT: response
    else L1 Miss
        L1-->>CACHE: null
        CACHE->>CACHE: stats.l1Misses++
        CACHE->>L2: get(cacheKey)
        
        alt L2 Hit
            L2-->>CACHE: cached response
            CACHE->>CACHE: stats.l2Hits++
            Note over CACHE: Promote to L1
            CACHE->>L1: set(cacheKey, response)
            CACHE-->>LLM: response
            LLM-->>AGENT: response
        else L2 Miss
            L2-->>CACHE: null
            CACHE->>CACHE: stats.l2Misses++
            CACHE-->>LLM: null
            
            Note over LLM: Call API
            LLM->>API: HTTP request
            API-->>LLM: response
            
            Note over LLM: Store in cache
            LLM->>CACHE: set(cacheKey, response)
            CACHE->>L1: set(cacheKey, response)
            CACHE->>L2: set(cacheKey, response)
            
            LLM-->>AGENT: response
        end
    end
```

## 7. State Synchronization Flow

Shows how state updates flow from backend to frontend.

```mermaid
sequenceDiagram
    participant ACTION as User Action / Event
    participant EXT_STATE as ExtensionStateManager
    participant WEBVIEW as Webview Panel
    participant WV_STATE as WebviewStateManager
    participant COMPONENTS as UI Components
    
    ACTION->>EXT_STATE: updateAgentState('coder', 'active')
    
    Note over EXT_STATE: Update backend state
    EXT_STATE->>EXT_STATE: state.agents.coder = {status: 'active'}
    
    Note over EXT_STATE: Prepare message
    EXT_STATE->>EXT_STATE: message = {type, payload, timestamp}
    
    Note over EXT_STATE: Send to webview
    EXT_STATE->>WEBVIEW: postMessage(message)
    
    Note over WEBVIEW: Receive in browser context
    WEBVIEW->>WV_STATE: onMessage(message)
    
    Note over WV_STATE: Update frontend state
    WV_STATE->>WV_STATE: state.agents.coder = payload.state
    
    Note over WV_STATE: Notify listeners
    WV_STATE->>COMPONENTS: emit('agent:stateChanged', {agent, state})
    
    Note over COMPONENTS: Re-render
    COMPONENTS->>COMPONENTS: updateAgentVisualization('coder')
    COMPONENTS->>COMPONENTS: triggerAnimation('pulse')
```

## Related Documentation

- [System Overview](./system-overview.md)
- [Data Flow Diagrams](./data-flow.md)
- [Orchestrator Central Pattern](../patterns/orchestrator-central.md)
- [Dual State Pattern](../patterns/dual-state.md)
- [Hybrid Cache Strategy](../patterns/hybrid-cache.md)
