// Webview Entry Point
console.log('Webview loaded');

// Performance Monitoring
let frameCount = 0;
let lastTime = performance.now();
let fps = 60;
let performanceMode = false;

function monitorFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;
        if (fps < 30 && !performanceMode) {
            console.warn(`Low FPS detected: ${fps}. Recommendation: Enable Performance Mode.`);
        }
    }
    requestAnimationFrame(monitorFPS);
}
monitorFPS();

// Listen for messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'toWebview:agentStateUpdate':
            updateAgentHUD(message.agent, message.state);
            break;
        case 'toWebview:metricsUpdate':
            updateMetricsUI(message.metrics);
            break;
        case 'toWebview:cursorUpdate':
            handleCursorUpdate(message.cursor);
            break;
        case 'toWebview:newAlert':
            renderAlert(message.alert);
            break;
        case 'toWebview:clearAlerts':
            document.querySelectorAll('.alert-component').forEach(el => el.remove());
            break;
        case 'toWebview:fullStateUpdate':
            Object.entries(message.states).forEach(([agent, state]: any) => {
                updateAgentHUD(agent, state);
            });
            if (message.metrics) {
                updateMetricsUI(message.metrics);
            }
            if (message.alerts) {
                message.alerts.forEach((alert: any) => renderAlert(alert));
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
        const icons: any = { context: '🔍', architect: '🏗️', coder: '💻', reviewer: '🛡️' };
        agentEl.innerText = icons[agent] || '🤖';
        hud.appendChild(agentEl);
    }

    agentEl.className = `agent-icon ${state.status} ${performanceMode ? 'low-fx' : ''}`;

    const positions: any = {
        context: { top: 10, left: 10 },
        architect: { top: 10, left: 30 },
        coder: { top: 10, left: 50 },
        reviewer: { top: 10, left: 70 }
    };

    let targetTop = positions[agent]?.top || 20;

    if (state.anchorLine !== undefined && currentViewport) {
        const { start, end } = currentViewport;
        const totalLines = end - start;
        const relativePos = (state.anchorLine - start) / Math.max(1, totalLines);
        targetTop = relativePos * 100;
        if (targetTop < 5) targetTop = 5;
        if (targetTop > 95) targetTop = 95;
    }

    // Apply baseline position via transform for GPU acceleration
    agentEl.style.left = `${positions[agent]?.left || 10}%`;
    agentEl.dataset.baseTop = targetTop.toString();

    // We update the transform in handleCursorRepulsion or repositioning
    applyRepulsionToAgent(agentEl as HTMLElement, lastCursor);
}

let currentViewport: any = null;
let lastCursor: any = null;

function handleCursorUpdate(cursor: any) {
    lastCursor = cursor;
    currentViewport = cursor.visibleRanges[0];
    repositionAgents();
    repositionAlerts();
}

function repositionAgents() {
    const agents = document.querySelectorAll('.agent-icon');
    agents.forEach((el: any) => {
        applyRepulsionToAgent(el, lastCursor);
    });
}

function repositionAlerts() {
    if (!currentViewport) return;
    const alerts = document.querySelectorAll('.alert-component');
    alerts.forEach((el: any) => {
        const anchorLine = parseInt(el.dataset.anchorLine);
        if (!isNaN(anchorLine)) {
            const { start, end } = currentViewport;
            const totalLines = end - start;
            let relativePos = (anchorLine - start) / Math.max(1, totalLines);
            if (relativePos < 0.05) relativePos = 0.05;
            if (relativePos > 0.95) relativePos = 0.95;

            // Use translate3d for smooth vertical positioning
            const targetY = relativePos * window.innerHeight;
            el.style.transform = `translate3d(0, ${targetY}px, 0)`;
        }
    });
}

function renderAlert(alert: any) {
    const hud = document.getElementById('agent-hud');
    if (!hud) return;

    const alertEl = document.createElement('div');
    alertEl.id = `alert-${alert.id}`;
    alertEl.className = `alert-component alert-${alert.severity}`;
    alertEl.dataset.anchorLine = alert.anchorLine?.toString() || '';
    const icons: any = { info: '💡', warning: '⚠️', critical: '🚨', urgent: '🔥' };
    alertEl.innerHTML = `
        <div class="alert-icon-ideogram">${icons[alert.severity] || '❗'}</div>
        <div class="alert-tooltip">${alert.message}</div>
    `;
    hud.appendChild(alertEl);
    repositionAlerts();
}

/**
 * Combined anchoring + repulsion logic using translate3d
 */
function applyRepulsionToAgent(el: HTMLElement, cursor: any) {
    const baseTopPercent = parseFloat(el.dataset.baseTop || '20');
    const baseTopPx = (baseTopPercent / 100) * window.innerHeight;

    let translateY = baseTopPx;
    let opacity = 1.0;

    if (cursor) {
        const cursorYPx = cursor.relativeY * window.innerHeight;
        const dist = Math.abs(baseTopPx - cursorYPx);
        const threshold = window.innerHeight * 0.15; // 15% of viewport height

        if (dist < threshold) {
            const repulsionScale = (threshold - dist) / threshold;
            const offset = threshold * repulsionScale * (baseTopPx > cursorYPx ? 1 : -1);
            translateY += offset;
            opacity = 0.3 + (0.7 * (1 - repulsionScale));
        }
    }

    el.style.transform = `translate3d(0, ${translateY}px, 0)`;
    el.style.opacity = opacity.toString();
}
