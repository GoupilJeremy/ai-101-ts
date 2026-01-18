import { describe, it, expect, beforeEach } from 'vitest';
import { ReportGeneratorService } from '../report-generator-service';
import { ITeamMetrics } from '../team-metrics-service';

describe('ReportGeneratorService', () => {
    let reportGenerator: ReportGeneratorService;
    let mockMetrics: ITeamMetrics;

    beforeEach(() => {
        reportGenerator = new ReportGeneratorService();

        // Create mock metrics
        mockMetrics = {
            adoptionScore: 75,
            comprehensionTrend: [
                { timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000, average: 3.5, count: 2 },
                { timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, average: 4.0, count: 3 },
                { timestamp: Date.now(), average: 4.5, count: 2 }
            ],
            qualityImpact: 68,
            teamModeUsage: {
                sessionCount: 15,
                totalDuration: 54000000, // 15 hours
                averageDuration: 3600000, // 1 hour
                lastUsed: Date.now()
            },
            usageFrequency: {
                sessionsPerWeek: 4.5,
                totalSessions: 45
            },
            modeDistribution: {
                'learning': 40,
                'expert': 35,
                'team': 25
            }
        };
    });

    describe('generateMarkdownReport', () => {
        it('should generate valid markdown report', () => {
            const report = reportGenerator.generateMarkdownReport(mockMetrics);

            expect(report).toContain('# AI-101 Team Adoption Report');
            expect(report).toContain('## Executive Summary');
            expect(report).toContain('## Learning Progress');
            expect(report).toContain('## Usage Frequency');
            expect(report).toContain('## Code Quality Impact');
        });

        it('should include adoption score', () => {
            const report = reportGenerator.generateMarkdownReport(mockMetrics);
            expect(report).toContain('75');
        });

        it('should include privacy warning', () => {
            const report = reportGenerator.generateMarkdownReport(mockMetrics);
            expect(report).toContain('local data only');
            expect(report.toLowerCase()).toContain('privacy');
        });

        it('should format comprehension trend as table', () => {
            const report = reportGenerator.generateMarkdownReport(mockMetrics);
            expect(report).toContain('|');
            expect(report).toContain('Average Score');
        });

        it('should include mode distribution', () => {
            const report = reportGenerator.generateMarkdownReport(mockMetrics);
            expect(report).toContain('Learning');
            expect(report).toContain('Expert');
            expect(report).toContain('Team');
        });

        it('should handle empty comprehension trend', () => {
            const emptyMetrics = { ...mockMetrics, comprehensionTrend: [] };
            const report = reportGenerator.generateMarkdownReport(emptyMetrics);
            expect(report).toContain('No survey data');
        });

        it('should include team mode statistics', () => {
            const report = reportGenerator.generateMarkdownReport(mockMetrics);
            expect(report).toContain('15');
            expect(report).toContain('Team Mode');
        });
    });

    describe('generateJSONReport', () => {
        it('should generate valid JSON', () => {
            const json = reportGenerator.generateJSONReport(mockMetrics);

            expect(() => {
                JSON.parse(json);
            }).not.toThrow();
        });

        it('should include all metrics', () => {
            const json = reportGenerator.generateJSONReport(mockMetrics);
            const parsed = JSON.parse(json);

            expect(parsed.adoptionScore).toBe(75);
            expect(parsed.qualityImpact).toBe(68);
            expect(parsed.comprehensionTrend).toBeDefined();
            expect(parsed.teamModeUsage).toBeDefined();
            expect(parsed.usageFrequency).toBeDefined();
            expect(parsed.modeDistribution).toBeDefined();
        });

        it('should include metadata', () => {
            const json = reportGenerator.generateJSONReport(mockMetrics);
            const parsed = JSON.parse(json);

            expect(parsed.metadata).toBeDefined();
            expect(parsed.metadata.generatedAt).toBeDefined();
            expect(parsed.metadata.version).toBeDefined();
            expect(parsed.metadata.privacyNotice).toBeDefined();
        });

        it('should be portable for aggregation', () => {
            const json = reportGenerator.generateJSONReport(mockMetrics);
            const parsed = JSON.parse(json);

            // Verify structure is suitable for aggregation
            expect(typeof parsed.adoptionScore).toBe('number');
            expect(Array.isArray(parsed.comprehensionTrend)).toBe(true);
            expect(typeof parsed.qualityImpact).toBe('number');
        });
    });
});
