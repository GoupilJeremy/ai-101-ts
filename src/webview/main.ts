// Webview Entry Point
console.log('Webview loaded');

// Listen for messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'toWebview:agentStateUpdate':
            console.log(`Agent ${message.agent} state update:`, message.state);
            updateAgentHUD(message.agent, message.state);
            break;
        case 'toWebview:metricsUpdate':
            console.log('Metrics update:', message.metrics);
            updateMetricsUI(message.metrics);
            break;
        case 'toWebview:fullStateUpdate':
            console.log('Full agent state snapshot received:', message.states);
            Object.entries(message.states).forEach(([agent, state]: any) => {
                updateAgentHUD(agent, state);
            });
            if (message.metrics) {
                updateMetricsUI(message.metrics);
            }
            break;
    }
});

function updateMetricsUI(metrics: any) {
    const metricsEl = document.getElementById('metrics');
    if (metricsEl) {
        const formattedCost = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(metrics.cost);

        metricsEl.innerText = `Tokens: ${metrics.tokens.toLocaleString()} | Cost: ${formattedCost} | Files: ${metrics.files}`;
    }
}

function updateAgentHUD(agent: string, state: any) {
    const hud = document.getElementById('agent-hud');
    if (!hud) return;

    let agentEl = document.getElementById(`agent-${agent}`);
    if (!agentEl) {
        agentEl = document.createElement('div');
        agentEl.id = `agent-${agent}`;
        agentEl.className = 'agent-icon';
        // Simplified icon map
        const icons: any = { context: '🔍', architect: '🏗️', coder: '💻', reviewer: '🛡️' };
        agentEl.innerText = icons[agent] || '🤖';
        hud.appendChild(agentEl);
    }

    // Apply state classes
    agentEl.className = `agent-icon ${state.status}`;

    // Position agents roughly for now
    const positions: any = {
        context: { top: '20%', left: '10%' },
        architect: { top: '20%', left: '30%' },
        coder: { top: '20%', left: '50%' },
        reviewer: { top: '20%', left: '70%' }
    };
    const pos = positions[agent];
    if (pos) {
        agentEl.style.top = pos.top;
        agentEl.style.left = pos.left;
    }
}
