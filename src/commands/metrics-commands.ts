import * as vscode from 'vscode';
import { MetricsService } from '../telemetry/metrics-service';
import { WebviewManager } from '../ui/webview-manager';

/**
 * Commands related to usage metrics.
 */
export function registerMetricsCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('ai-101-ts.viewMetrics', async () => {
            await showMetricsDashboard(context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ai-101-ts.exportMetrics', async () => {
            const metricsService = MetricsService.getInstance();
            await metricsService.exportMetrics();
        })
    );
}

async function showMetricsDashboard(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'ai101Metrics',
        'AI-101 Usage Metrics',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(context.extensionUri, 'media'),
                vscode.Uri.joinPath(context.extensionUri, 'dist')
            ]
        }
    );

    const metricsService = MetricsService.getInstance();
    const metrics = await metricsService.getMetrics();
    const acceptanceRate = await metricsService.getAcceptanceRate();
    const agentBreakdown = await metricsService.getDimensionalBreakdown('agent');
    const modeBreakdown = await metricsService.getDimensionalBreakdown('mode');
    const typeBreakdown = await metricsService.getDimensionalBreakdown('type');

    panel.webview.html = getDashboardHtml(panel.webview, context.extensionUri, {
        ...metrics,
        acceptanceRate,
        agentBreakdown,
        modeBreakdown,
        typeBreakdown
    });

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'export':
                    await metricsService.exportMetrics();
                    break;
                case 'refresh':
                    const updatedMetrics = await metricsService.getMetrics();
                    const updatedRate = await metricsService.getAcceptanceRate();
                    const updatedAgentBreakdown = await metricsService.getDimensionalBreakdown('agent');
                    const updatedModeBreakdown = await metricsService.getDimensionalBreakdown('mode');
                    const updatedTypeBreakdown = await metricsService.getDimensionalBreakdown('type');

                    panel.webview.postMessage({
                        type: 'updateMetrics',
                        data: {
                            ...updatedMetrics,
                            acceptanceRate: updatedRate,
                            agentBreakdown: updatedAgentBreakdown,
                            modeBreakdown: updatedModeBreakdown,
                            typeBreakdown: updatedTypeBreakdown
                        }
                    });
                    break;
            }
        },
        undefined,
        context.subscriptions
    );
}

function getDashboardHtml(webview: vscode.Webview, extensionUri: vscode.Uri, metrics: any): string {
    // Basic Sumi-e styled HTML for the dashboard
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI-101 Usage Metrics</title>
    <style>
        :root {
            --bg-color: #f4f1ea;
            --text-color: #2c2c2c;
            --accent-color: #8b0000;
            --card-bg: rgba(255, 255, 255, 0.7);
            --ink-color: #1a1a1a;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg-color: #1a1a1b;
                --text-color: #e0e0e0;
                --accent-color: #ff4d4d;
                --card-bg: rgba(30, 30, 30, 0.7);
                --ink-color: #f0f0f0;
            }
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
            background-image: radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0);
            background-size: 24px 24px;
        }

        h1 {
            font-weight: 300;
            letter-spacing: 2px;
            border-bottom: 1px solid var(--text-color);
            padding-bottom: 10px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .metric-card {
            background: var(--card-bg);
            border: 1px solid rgba(0,0,0,0.1);
            padding: 20px;
            border-radius: 4px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transition: transform 0.2s;
            position: relative;
            overflow: hidden;
        }

        .metric-card:hover {
            transform: translateY(-5px);
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--accent-color);
            opacity: 0.3;
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 10px 0;
            color: var(--ink-color);
        }

        .metric-label {
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.7;
        }

        .charts {
            margin-top: 50px;
        }

        .chart-container {
            background: var(--card-bg);
            padding: 30px;
            border-radius: 4px;
            margin-bottom: 30px;
        }

        .simple-bar-chart {
            display: flex;
            align-items: flex-end;
            height: 200px;
            gap: 10px;
            padding-top: 20px;
        }

        .bar {
            flex: 1;
            background: var(--accent-color);
            opacity: 0.6;
            transition: opacity 0.2s;
            position: relative;
            border-radius: 2px 2px 0 0;
        }

        .bar:hover {
            opacity: 0.9;
        }

        .bar-label {
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.7rem;
            white-space: nowrap;
        }

        .actions {
            margin-top: 40px;
            display: flex;
            gap: 10px;
        }

        button {
            background: var(--ink-color);
            color: var(--bg-color);
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 2px;
            font-size: 0.9rem;
            letter-spacing: 1px;
        }

        button:hover {
            opacity: 0.8;
        }

        .ink-splash {
            position: fixed;
            bottom: -50px;
            right: -50px;
            width: 300px;
            height: 300px;
            background: var(--ink-color);
            opacity: 0.03;
            border-radius: 50%;
            filter: blur(50px);
            z-index: -1;
        }
    </style>
</head>
<body>
    <h1>
        Usage Metrics Dashboard
        <span style="font-size: 0.5em; opacity: 0.5;">Local Only</span>
    </h1>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-label">Suggestions Accepted</div>
            <div class="metric-value">${metrics.suggestionsAccepted}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Time Saved</div>
            <div class="metric-value">${(metrics.timeSavedMs / 3600000).toFixed(1)}h</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Lines Accepted</div>
            <div class="metric-value">${metrics.linesAccepted}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Acceptance Rate</div>
            <div class="metric-value">${metrics.acceptanceRate.toFixed(1)}%</div>
        </div>
    </div>

    <div class="charts">
        <div class="chart-container">
            <div class="metric-label" style="margin-bottom: 20px;">Acceptance Rate by Agent</div>
            <div id="agentBreakdown">
                ${Object.entries(metrics.agentBreakdown || {}).map(([agent, stats]: [string, any]) => `
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="text-transform: capitalize;">${agent}</span>
                            <span style="font-weight: bold;">${stats.acceptanceRate.toFixed(1)}%</span>
                        </div>
                        <div style="background: rgba(0,0,0,0.1); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: var(--accent-color); height: 100%; width: ${stats.acceptanceRate}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="font-size: 0.8rem; opacity: 0.6; margin-top: 3px;">
                            ${stats.accepted} accepted / ${stats.rejected} rejected
                        </div>
                    </div>
                `).join('')}
                ${Object.keys(metrics.agentBreakdown || {}).length === 0 ? '<div style="opacity: 0.5; text-align: center;">No agent data yet</div>' : ''}
            </div>
        </div>

        <div class="chart-container">
            <div class="metric-label" style="margin-bottom: 20px;">Recent Activity (Last 7 Days)</div>
            <div class="simple-bar-chart" id="activityChart">
                <!-- Bars will be injected here -->
            </div>
        </div>
    </div>

    <div class="actions">
        <button onclick="exportData()">Export to JSON</button>
        <button onclick="refreshData()">Refresh</button>
    </div>

    <div class="ink-splash"></div>

    <script>
        const vscode = acquireVsCodeApi();
        const dailyStats = ${JSON.stringify(metrics.dailyStats)};

        function renderChart() {
            const chart = document.getElementById('activityChart');
            const dates = Object.keys(dailyStats).sort().slice(-7);
            
            if (dates.length === 0) {
                chart.innerHTML = '<div style="width: 100%; text-align: center; opacity: 0.5;">No activity recorded yet for the last 7 days.</div>';
                return;
            }

            const max = Math.max(...dates.map(d => dailyStats[d].suggestionsAccepted || 1));

            chart.innerHTML = dates.map(date => {
                const val = dailyStats[date].suggestionsAccepted || 0;
                const height = (val / max) * 100;
                return \`
                    <div class="bar" style="height: \${height}%">
                        <div class="bar-label">\${date.split('-').slice(1).join('/')}</div>
                    </div>
                \`;
            }).join('');
        }

        function exportData() {
            vscode.postMessage({ command: 'export' });
        }

        function refreshData() {
            vscode.postMessage({ command: 'refresh' });
        }

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'updateMetrics') {
                location.reload(); // Quickest way to update for this simple dashboard
            }
        });

        renderChart();
    </script>
</body>
</html>`;
}
