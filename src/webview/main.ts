// Webview Entry Point
console.log('Webview loaded');

// Listen for messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'toWebview:agentStateUpdate':
            console.log(`Agent ${message.agent} state update:`, message.state);
            // In Epic 4, this will update the UI state
            break;
        case 'toWebview:fullStateUpdate':
            console.log('Full agent state snapshot received:', message.states);
            break;
    }
});
