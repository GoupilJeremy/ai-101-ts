# Data Flow Diagrams

## Key Data Flows

This document illustrates how data flows through the Suika system for critical operations.

## 1. LLM Request → Cache Check → Response Flow

Shows the complete data flow for an LLM request with caching.

```mermaid
flowchart TD
    A[Agent needs LLM completion] --> B[Build LLMRequest object]
    B --> C{Request Parameters}
    C --> D[provider: 'openai']
    C --> E[model: 'gpt-4']
    C --> F[prompt: string]
    C --> G[temperature: 0.7]
    C --> H[maxTokens: 2000]
    
    D & E & F & G & H --> I[Generate Cache Key]
    I --> J[SHA-256 hash of params]
    
    J --> K{Check L1 Memory Cache}
    K -->|Hit| L[Return cached response <1ms]
    K -->|Miss| M{Check L2 File Cache}
    
    M -->|Hit| N[Read from disk ~10ms]
    N --> O[Promote to L1]
    O --> L
    
    M -->|Miss| P[Call LLM Provider API]
    P --> Q{Provider Type}
    Q -->|OpenAI| R[OpenAI API]
    Q -->|Anthropic| S[Anthropic API]
    Q -->|Custom| T[Custom Provider]
    
    R & S & T --> U[HTTP Request]
    U --> V[LLM Processing 500-2000ms]
    V --> W[HTTP Response]
    
    W --> X[Parse Response]
    X --> Y[Store in L1 Cache]
    Y --> Z[Store in L2 Cache]
    Z --> L
    
    L --> AA[Return to Agent]
    
    style K fill:#4CAF50,color:#fff
    style M fill:#2196F3,color:#fff
    style P fill:#FF9800,color:#fff
```

## 2. State Update Propagation Flow

Shows how state changes propagate from backend to frontend UI.

```mermaid
flowchart TD
    A[State Change Trigger] --> B{Source}
    B -->|Agent Action| C[AgentOrchestrator]
    B -->|Config Change| D[ConfigurationManager]
    B -->|User Action| E[Command Handler]
    B -->|Telemetry| F[TelemetryService]
    
    C & D & E & F --> G[ExtensionStateManager]
    
    G --> H[Update Backend State]
    H --> I{State Type}
    
    I -->|Agent State| J[state.agents[id] = newState]
    I -->|Config| K[state.config = newConfig]
    I -->|Suggestion| L[state.suggestions.push]
    I -->|Telemetry| M[state.telemetry = metrics]
    
    J & K & L & M --> N[Prepare postMessage]
    
    N --> O{Message Type}
    O --> P[type: 'agent:stateChanged']
    O --> Q[type: 'config:changed']
    O --> R[type: 'suggestion:generated']
    O --> S[type: 'telemetry:updated']
    
    P & Q & R & S --> T[Add payload + timestamp]
    T --> U[JSON.stringify]
    U --> V[webview.postMessage]
    
    V --> W[Browser Context]
    W --> X[window.addEventListener message]
    X --> Y[WebviewStateManager.onMessage]
    
    Y --> Z{Parse Message Type}
    Z --> AA[Update Frontend State]
    
    AA --> AB{Notify Listeners}
    AB --> AC[HUD Components]
    AB --> AD[Agent Visualizations]
    AB --> AE[Vital Signs Bar]
    AB --> AF[Alert System]
    
    AC & AD & AE & AF --> AG[Re-render UI]
    AG --> AH[GPU-accelerated Animation]
    AH --> AI[Display to User]
    
    style G fill:#9C27B0,color:#fff
    style V fill:#FF5722,color:#fff
    style Y fill:#00BCD4,color:#fff
```

## 3. Telemetry Data Flow (Opt-in)

Shows how telemetry data is collected, aggregated, and optionally sent to backend.

```mermaid
flowchart TD
    A[User Action / Event] --> B{Telemetry Enabled?}
    B -->|No| C[Skip]
    B -->|Yes| D[TelemetryService]
    
    D --> E{Event Type}
    E -->|Suggestion| F[trackSuggestionEvent]
    E -->|Agent| G[trackAgentEvent]
    E -->|Config| H[trackConfigEvent]
    E -->|Error| I[trackErrorEvent]
    
    F & G & H & I --> J[Create Event Object]
    J --> K{Event Data}
    K --> L[timestamp]
    K --> M[eventType]
    K --> N[anonymizedData]
    K --> O[sessionId]
    
    L & M & N & O --> P[Store in Local Buffer]
    P --> Q[ExtensionStateManager.telemetry]
    
    Q --> R{Buffer Size}
    R -->|< 100 events| S[Wait]
    R -->|>= 100 events| T[Batch Events]
    
    T --> U{Send to Backend?}
    U -->|Enabled| V[Anonymize PII]
    U -->|Disabled| W[Local Only]
    
    V --> X[Aggregate Metrics]
    X --> Y[HTTP POST to telemetry backend]
    Y --> Z[Clear Buffer]
    
    W --> AA[Update Local Metrics]
    AA --> AB[Display in UI]
    
    S --> AC[Periodic Flush every 5 min]
    AC --> T
    
    style D fill:#FF9800,color:#fff
    style V fill:#F44336,color:#fff
    style AB fill:#4CAF50,color:#fff
```

## 4. Configuration Loading and Validation Flow

Shows how configuration is loaded, validated, and applied on extension activation.

```mermaid
flowchart TD
    A[Extension Activation] --> B[ConfigurationManager.initialize]
    
    B --> C[Load VSCode Settings]
    C --> D[workspace.getConfiguration 'ai101']
    
    D --> E{Load Settings}
    E --> F[provider: string]
    E --> G[model: string]
    E --> H[mode: string]
    E --> I[cache.enabled: boolean]
    E --> J[telemetry.enabled: boolean]
    
    F & G & H & I & J --> K[Load API Keys]
    K --> L[context.secrets.get 'openai-api-key']
    K --> M[context.secrets.get 'anthropic-api-key']
    
    L & M --> N{Validate Configuration}
    
    N --> O{Check Provider}
    O -->|Valid| P[Provider exists]
    O -->|Invalid| Q[Use default 'openai']
    
    N --> R{Check API Key}
    R -->|Present| S[API key valid]
    R -->|Missing| T[Show warning]
    
    N --> U{Check Mode}
    U -->|Valid| V[Mode in allowed list]
    U -->|Invalid| W[Use default 'learning']
    
    P & Q & S & T & V & W --> X[Merge with Defaults]
    
    X --> Y{Apply Preset?}
    Y -->|Solo| Z[Apply solo preset]
    Y -->|Team| AA[Apply team preset]
    Y -->|Enterprise| AB[Apply enterprise preset]
    Y -->|Custom| AC[Use custom config]
    
    Z & AA & AB & AC --> AD[Final Configuration]
    
    AD --> AE[Store in ExtensionStateManager]
    AE --> AF[Sync to Webview]
    AF --> AG[Apply to Services]
    
    AG --> AH[LLMProviderManager.configure]
    AG --> AI[AgentOrchestrator.configure]
    AG --> AJ[TelemetryService.configure]
    
    AH & AI & AJ --> AK[Extension Ready]
    
    style N fill:#FF9800,color:#fff
    style AD fill:#4CAF50,color:#fff
    style AK fill:#2196F3,color:#fff
```

## 5. Suggestion Generation and Display Flow

Complete flow from user request to suggestion display in HUD.

```mermaid
flowchart TD
    A[User triggers suggestion] --> B[Command: suika.getSuggestion]
    
    B --> C[Collect Context]
    C --> D[Active file path]
    C --> E[Cursor position]
    C --> F[Selected text]
    C --> G[Open files]
    
    D & E & F & G --> H[ContextAgent.execute]
    H --> I[Load file contents]
    I --> J[Parse syntax tree]
    J --> K[Identify symbols]
    K --> L[Context Object]
    
    L --> M[ArchitectAgent.execute]
    M --> N[Detect patterns]
    N --> O[Identify constraints]
    O --> P[Architecture Analysis]
    
    P --> Q[CoderAgent.execute]
    Q --> R[Build prompt]
    R --> S[LLMProviderManager.complete]
    S --> T[Cache check]
    T -->|Hit| U[Cached response]
    T -->|Miss| V[API call]
    V --> W[Parse LLM response]
    U --> W
    W --> X[Code Suggestion]
    
    X --> Y[ReviewerAgent.execute]
    Y --> Z[Validate syntax]
    Z --> AA[Check security]
    AA --> AB[Identify risks]
    AB --> AC[Calculate confidence]
    AC --> AD[Review Results]
    
    AD --> AE{Approved?}
    AE -->|Yes| AF[Create Suggestion Object]
    AE -->|No| AG[Reject with reason]
    
    AF --> AH{Suggestion Data}
    AH --> AI[id: UUID]
    AH --> AJ[code: string]
    AH --> AK[explanation: string]
    AH --> AL[confidence: number]
    AH --> AM[review: ReviewResults]
    
    AI & AJ & AK & AL & AM --> AN[Store in State]
    AN --> AO[ExtensionStateManager.addSuggestion]
    AO --> AP[postMessage to Webview]
    
    AP --> AQ[WebviewStateManager receives]
    AQ --> AR[Update suggestions array]
    AR --> AS[Notify HUD Components]
    
    AS --> AT[SuggestionCard.render]
    AT --> AU[Display code]
    AT --> AV[Display explanation]
    AT --> AW[Display confidence badge]
    AT --> AX[Show Accept/Reject buttons]
    
    AU & AV & AW & AX --> AY[Animate into view]
    AY --> AZ[User sees suggestion]
    
    AG --> BA[Show error message]
    
    style S fill:#FF9800,color:#fff
    style AO fill:#9C27B0,color:#fff
    style AY fill:#4CAF50,color:#fff
```

## 6. Error Recovery Flow

Shows how errors are detected, logged, and recovered from.

```mermaid
flowchart TD
    A[Operation Fails] --> B{Error Type}
    
    B -->|Network| C[NetworkError]
    B -->|API| D[APIError]
    B -->|Validation| E[ValidationError]
    B -->|Internal| F[InternalError]
    
    C & D & E & F --> G[ErrorHandler.handle]
    
    G --> H{Is Retryable?}
    H -->|Yes| I[RetryLogic.retry]
    H -->|No| J[Log and Report]
    
    I --> K{Retry Attempt}
    K --> L[Attempt 1: 1s delay]
    K --> M[Attempt 2: 2s delay]
    K --> N[Attempt 3: 4s delay]
    
    L & M & N --> O{Success?}
    O -->|Yes| P[Return Result]
    O -->|No| Q{Max Retries?}
    
    Q -->|Not Yet| R[Exponential Backoff]
    R --> K
    Q -->|Exceeded| J
    
    J --> S[Log to Output Channel]
    S --> T[Update Agent State to 'error']
    T --> U[ExtensionStateManager.updateAgentState]
    U --> V[postMessage to Webview]
    
    V --> W[Display Error in HUD]
    W --> X{Error Severity}
    X -->|High| Y[Show modal error]
    X -->|Medium| Z[Show notification]
    X -->|Low| AA[Show in status bar]
    
    Y & Z & AA --> AB{User Action}
    AB -->|Retry| AC[Retry Operation]
    AB -->|Configure| AD[Open Settings]
    AB -->|Dismiss| AE[Reset Agent]
    
    AC --> A
    AD --> AF[ConfigurationManager]
    AE --> AG[AgentOrchestrator.reset]
    
    style G fill:#F44336,color:#fff
    style I fill:#FF9800,color:#fff
    style P fill:#4CAF50,color:#fff
```

## Data Structures

### LLMRequest
```typescript
{
  provider: 'openai' | 'anthropic' | string,
  model: string,
  prompt: string,
  systemPrompt?: string,
  temperature: number,
  maxTokens: number,
  metadata: {
    agentId: string,
    requestId: string,
    timestamp: number
  }
}
```

### AgentState
```typescript
{
  status: 'idle' | 'active' | 'error',
  lastActivity: number,
  currentTask?: string,
  error?: Error
}
```

### Suggestion
```typescript
{
  id: string,
  code: string,
  explanation: string,
  confidence: number,
  review: ReviewResults,
  timestamp: number,
  status: 'pending' | 'accepted' | 'rejected'
}
```

### TelemetryEvent
```typescript
{
  type: string,
  timestamp: number,
  sessionId: string,
  data: Record<string, any>,
  anonymized: boolean
}
```

## Related Documentation

- [System Overview](./system-overview.md)
- [Sequence Diagrams](./sequence-diagrams.md)
- [Hybrid Cache Strategy](../patterns/hybrid-cache.md)
- [Dual State Pattern](../patterns/dual-state.md)
- [Error Handling](../modules/errors.md)
