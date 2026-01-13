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
        case 'toWebview:cursorUpdate':
            handleCursorRepulsion(message.cursor);
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
        agentEl.dataset.baseTop = pos.top;
        agentEl.dataset.baseLeft = pos.left;
    }
}

function handleCursorRepulsion(cursor: any) {
    const agents = document.querySelectorAll('.agent-icon');
    const threshold = 0.15; // 15% distance threshold

    agents.forEach((el: any) => {
        const baseTop = parseFloat(el.dataset.baseTop || '20');
        const baseLeft = parseFloat(el.dataset.baseLeft || '10');

        // Simple 1D vertical repulsion for now since we only have line data faithfully
        const dist = Math.abs(baseTop - (cursor.relativeY * 100));

        if (dist < 15) { // If within 15% of cursor
            const offset = (15 - dist) * (baseTop > cursor.relativeY * 100 ? 1 : -1);
            el.style.transform = `translateY(${offset}px)`;
            el.style.opacity = '0.3';
        } else {
            el.style.transform = `translateY(0)`;
            el.style.opacity = '1';
        }
    });
}
