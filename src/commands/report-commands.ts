import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TeamMetricsService } from '../telemetry/team-metrics-service';
import { ReportGeneratorService } from '../telemetry/report-generator-service';
import { TelemetryService } from '../telemetry/telemetry-service';

/**
 * Register all report-related commands
 */
export function registerReportCommands(
    context: vscode.ExtensionContext,
    teamMetricsService: TeamMetricsService,
    reportGenerator: ReportGeneratorService,
    telemetryService?: TelemetryService
): void {
    // Command: Generate Team Report
    const generateReportCommand = vscode.commands.registerCommand(
        'ai-101.generateTeamReport',
        async () => {
            try {
                // Get team metrics
                const metrics = await teamMetricsService.getTeamMetrics();

                // Ask user for report format
                const format = await vscode.window.showQuickPick(
                    [
                        {
                            label: '📄 Markdown Report',
                            description: 'Human-readable report with charts and analysis',
                            value: 'markdown'
                        },
                        {
                            label: '📊 JSON Report',
                            description: 'Portable format for aggregation by tech leads',
                            value: 'json'
                        },
                        {
                            label: '📦 Both Formats',
                            description: 'Generate both Markdown and JSON reports',
                            value: 'both'
                        }
                    ],
                    {
                        placeHolder: 'Select report format'
                    }
                );

                if (!format) {
                    return; // User cancelled
                }

                // Ask for time period
                const period = await vscode.window.showQuickPick(
                    [
                        { label: 'Last 7 Days', value: 7 },
                        { label: 'Last 30 Days', value: 30 },
                        { label: 'All Time', value: -1 }
                    ],
                    {
                        placeHolder: 'Select time period'
                    }
                );

                if (!period) {
                    return; // User cancelled
                }

                // Generate reports
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const reports: Array<{ filename: string; content: string }> = [];

                if (format.value === 'markdown' || format.value === 'both') {
                    const markdown = reportGenerator.generateMarkdownReport(metrics);
                    reports.push({
                        filename: `team-report-${timestamp}.md`,
                        content: markdown
                    });
                }

                if (format.value === 'json' || format.value === 'both') {
                    const json = reportGenerator.generateJSONReport(metrics);
                    reports.push({
                        filename: `team-report-${timestamp}.json`,
                        content: json
                    });
                }

                // Ask where to save
                const saveLocation = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(
                        path.join(
                            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
                            reports[0].filename
                        )
                    ),
                    filters: format.value === 'markdown'
                        ? { 'Markdown': ['md'] }
                        : format.value === 'json'
                            ? { 'JSON': ['json'] }
                            : { 'All Files': ['*'] }
                });

                if (!saveLocation) {
                    return; // User cancelled
                }

                // Save report(s)
                for (const report of reports) {
                    let filePath = saveLocation.fsPath;

                    // If saving both formats, adjust filename
                    if (reports.length > 1) {
                        const ext = path.extname(report.filename);
                        const base = path.basename(saveLocation.fsPath, path.extname(saveLocation.fsPath));
                        const dir = path.dirname(saveLocation.fsPath);
                        filePath = path.join(dir, `${base}${ext}`);
                    }

                    fs.writeFileSync(filePath, report.content, 'utf-8');

                    // Show success message with option to open
                    const action = await vscode.window.showInformationMessage(
                        `Report saved: ${path.basename(filePath)}`,
                        'Open Report',
                        'Open Folder'
                    );

                    if (action === 'Open Report') {
                        const doc = await vscode.workspace.openTextDocument(filePath);
                        await vscode.window.showTextDocument(doc);
                    } else if (action === 'Open Folder') {
                        vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(filePath));
                    }
                }

                // Send telemetry (if enabled)
                if (telemetryService) {
                    telemetryService.sendEvent('report.generated', {
                        report_type: 'team_adoption',
                        period_days: period.value.toString(),
                        format: format.value
                    });
                }

            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }
    );

    context.subscriptions.push(generateReportCommand);
}
