/**
 * Tests for AgentPositioning
 * Story 11.2 - Test Suite
 */

import { describe, it, expect } from 'vitest';
import { AgentPositioning, EditorBounds, VisibleRange } from '../agent-positioning.js';
import { AgentType } from '../../agents/shared/agent.interface.js';

describe('AgentPositioning', () => {
    const mockEditorBounds: EditorBounds = {
        top: 0,
        left: 0,
        width: 1200,
        height: 800
    };

    describe('getAgentPosition', () => {
        it('should position architect at left margin (-120px)', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                50,
                100,
                mockEditorBounds
            );

            expect(position.x).toBe(-120);
            expect(position.anchorLine).toBe(50);
        });

        it('should position context at left margin (-60px)', () => {
            const position = AgentPositioning.getAgentPosition(
                'context',
                50,
                100,
                mockEditorBounds
            );

            expect(position.x).toBe(-60);
            expect(position.anchorLine).toBe(50);
        });

        it('should position coder at right margin (+20px from edge)', () => {
            const position = AgentPositioning.getAgentPosition(
                'coder',
                50,
                100,
                mockEditorBounds
            );

            expect(position.x).toBe(1220); // 1200 + 20
            expect(position.anchorLine).toBe(50);
        });

        it('should position reviewer at right margin (+80px from edge)', () => {
            const position = AgentPositioning.getAgentPosition(
                'reviewer',
                50,
                100,
                mockEditorBounds
            );

            expect(position.x).toBe(1280); // 1200 + 80
            expect(position.anchorLine).toBe(50);
        });

        it('should calculate Y position for line in middle of file (50%)', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                50,
                100,
                mockEditorBounds
            );

            expect(position.y).toBe(400); // 800 * 0.5
            expect(position.relativeY).toBe(0.5);
        });

        it('should handle edge case: line 0 (top)', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                0,
                100,
                mockEditorBounds
            );

            expect(position.y).toBe(0);
            expect(position.relativeY).toBe(0);
            expect(position.anchorLine).toBe(0);
        });

        it('should handle edge case: last line (bottom)', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                99,
                100,
                mockEditorBounds
            );

            expect(position.y).toBe(792); // 800 * 0.99
            expect(position.relativeY).toBe(0.99);
            expect(position.anchorLine).toBe(99);
        });

        it('should clamp line number to valid range (negative)', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                -10,
                100,
                mockEditorBounds
            );

            expect(position.anchorLine).toBe(0);
            expect(position.relativeY).toBe(0);
        });

        it('should clamp line number to valid range (too large)', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                150,
                100,
                mockEditorBounds
            );

            expect(position.anchorLine).toBe(99);
            expect(position.relativeY).toBe(0.99);
        });

        it('should handle edge case: empty file (0 lines)', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                0,
                0,
                mockEditorBounds
            );

            expect(position.y).toBe(0);
            expect(position.relativeY).toBe(0);
            expect(position.anchorLine).toBe(0);
        });

        it('should respect editor bounds offset (non-zero top/left)', () => {
            const offsetBounds: EditorBounds = {
                top: 100,
                left: 200,
                width: 1200,
                height: 800
            };

            const position = AgentPositioning.getAgentPosition(
                'context',
                50,
                100,
                offsetBounds
            );

            expect(position.y).toBe(500); // 100 + (800 * 0.5)
            expect(position.x).toBe(140); // 200 + (-60)
        });
    });

    describe('isLineVisible', () => {
        const visibleRanges: VisibleRange[] = [
            { start: 40, end: 60 },
            { start: 80, end: 100 }
        ];

        it('should return true for line in first visible range', () => {
            expect(AgentPositioning.isLineVisible(50, visibleRanges)).toBe(true);
        });

        it('should return true for line in second visible range', () => {
            expect(AgentPositioning.isLineVisible(90, visibleRanges)).toBe(true);
        });

        it('should return true for line at range boundary (start)', () => {
            expect(AgentPositioning.isLineVisible(40, visibleRanges)).toBe(true);
        });

        it('should return true for line at range boundary (end)', () => {
            expect(AgentPositioning.isLineVisible(60, visibleRanges)).toBe(true);
        });

        it('should return false for line before all ranges', () => {
            expect(AgentPositioning.isLineVisible(30, visibleRanges)).toBe(false);
        });

        it('should return false for line between ranges', () => {
            expect(AgentPositioning.isLineVisible(70, visibleRanges)).toBe(false);
        });

        it('should return false for line after all ranges', () => {
            expect(AgentPositioning.isLineVisible(110, visibleRanges)).toBe(false);
        });

        it('should handle empty visible ranges', () => {
            expect(AgentPositioning.isLineVisible(50, [])).toBe(false);
        });
    });

    describe('findNearestVisibleLine', () => {
        const visibleRanges: VisibleRange[] = [
            { start: 40, end: 60 },
            { start: 80, end: 100 }
        ];

        it('should return target line if already visible', () => {
            const nearest = AgentPositioning.findNearestVisibleLine(50, visibleRanges);
            expect(nearest).toBe(50);
        });

        it('should find nearest visible line when target is above first range', () => {
            const nearest = AgentPositioning.findNearestVisibleLine(30, visibleRanges);
            expect(nearest).toBe(40); // Closest is start of first range
        });

        it('should find nearest visible line when target is between ranges', () => {
            const nearest = AgentPositioning.findNearestVisibleLine(70, visibleRanges);
            // 70 is equidistant from 60 and 80, should return one of them
            expect([60, 80]).toContain(nearest);
        });

        it('should find nearest visible line when target is after last range', () => {
            const nearest = AgentPositioning.findNearestVisibleLine(110, visibleRanges);
            expect(nearest).toBe(100); // Closest is end of last range
        });

        it('should prefer closer boundary when target is between ranges', () => {
            const nearest = AgentPositioning.findNearestVisibleLine(65, visibleRanges);
            expect(nearest).toBe(60); // 65 is closer to 60 than to 80
        });

        it('should handle single visible range', () => {
            const singleRange: VisibleRange[] = [{ start: 50, end: 60 }];
            const nearest = AgentPositioning.findNearestVisibleLine(30, singleRange);
            expect(nearest).toBe(50);
        });
    });

    describe('getMultipleAgentPositions', () => {
        it('should calculate positions for multiple agents without collision', () => {
            const requests = [
                { agentType: 'architect' as AgentType, lineNumber: 10 },
                { agentType: 'coder' as AgentType, lineNumber: 90 }
            ];

            const positions = AgentPositioning.getMultipleAgentPositions(
                requests,
                100,
                mockEditorBounds
            );

            expect(positions.size).toBe(2);
            expect(positions.get('architect')?.anchorLine).toBe(10);
            expect(positions.get('coder')?.anchorLine).toBe(90);
        });

        it('should adjust Y positions when agents are too close (collision)', () => {
            const requests = [
                { agentType: 'context' as AgentType, lineNumber: 50 },
                { agentType: 'architect' as AgentType, lineNumber: 52 } // Very close
            ];

            const positions = AgentPositioning.getMultipleAgentPositions(
                requests,
                100,
                mockEditorBounds
            );

            const contextY = positions.get('context')!.y;
            const architectY = positions.get('architect')!.y;

            // Architect should be pushed down to maintain minimum distance
            const distance = architectY - contextY;
            expect(distance).toBeGreaterThanOrEqual(100); // MIN_AGENT_DISTANCE
        });

        it('should not affect agents on different sides', () => {
            const requests = [
                { agentType: 'context' as AgentType, lineNumber: 50 },  // Left side
                { agentType: 'coder' as AgentType, lineNumber: 50 }     // Right side
            ];

            const positions = AgentPositioning.getMultipleAgentPositions(
                requests,
                100,
                mockEditorBounds
            );

            // Both should have same Y (no collision since different sides)
            expect(positions.get('context')!.y).toBe(positions.get('coder')!.y);
        });

        it('should handle three agents on same side with cascading collision', () => {
            const requests = [
                { agentType: 'context' as AgentType, lineNumber: 50 },
                { agentType: 'architect' as AgentType, lineNumber: 51 }
            ];

            const positions = AgentPositioning.getMultipleAgentPositions(
                requests,
                100,
                mockEditorBounds
            );

            const contextY = positions.get('context')!.y;
            const architectY = positions.get('architect')!.y;

            expect(architectY).toBeGreaterThan(contextY);
        });
    });

    describe('getAgentCenterPoint', () => {
        it('should calculate center point of agent', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                50,
                100,
                mockEditorBounds
            );

            const center = AgentPositioning.getAgentCenterPoint(position);

            expect(center.x).toBe(position.x);
            expect(center.y).toBe(position.y + 40); // AGENT_SIZE / 2 = 80 / 2 = 40
        });
    });

    describe('estimateEditorBounds', () => {
        it('should estimate editor bounds from viewport size', () => {
            const bounds = AgentPositioning.estimateEditorBounds(1920, 1080);

            expect(bounds.top).toBe(40);
            expect(bounds.left).toBe(60);
            expect(bounds.width).toBe(1440); // 1920 * 0.75
            expect(bounds.height).toBe(1000); // 1080 - 80
        });

        it('should handle small viewport', () => {
            const bounds = AgentPositioning.estimateEditorBounds(800, 600);

            expect(bounds.width).toBe(600); // 800 * 0.75
            expect(bounds.height).toBe(520); // 600 - 80
        });
    });

    describe('isPositionValid', () => {
        it('should validate correct position', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                50,
                100,
                mockEditorBounds
            );

            expect(AgentPositioning.isPositionValid(position, mockEditorBounds)).toBe(true);
        });

        it('should reject position with NaN coordinates', () => {
            const invalidPosition = {
                x: NaN,
                y: 100,
                anchorLine: 50,
                relativeY: 0.5
            };

            expect(AgentPositioning.isPositionValid(invalidPosition, mockEditorBounds)).toBe(false);
        });

        it('should reject position with Infinity coordinates', () => {
            const invalidPosition = {
                x: 100,
                y: Infinity,
                anchorLine: 50,
                relativeY: 0.5
            };

            expect(AgentPositioning.isPositionValid(invalidPosition, mockEditorBounds)).toBe(false);
        });

        it('should reject position with invalid relativeY (<0)', () => {
            const invalidPosition = {
                x: 100,
                y: 100,
                anchorLine: 50,
                relativeY: -0.5
            };

            expect(AgentPositioning.isPositionValid(invalidPosition, mockEditorBounds)).toBe(false);
        });

        it('should reject position with invalid relativeY (>1)', () => {
            const invalidPosition = {
                x: 100,
                y: 100,
                anchorLine: 50,
                relativeY: 1.5
            };

            expect(AgentPositioning.isPositionValid(invalidPosition, mockEditorBounds)).toBe(false);
        });

        it('should reject position far outside editor bounds', () => {
            const invalidPosition = {
                x: 100,
                y: 2000, // Way beyond editor height + margin
                anchorLine: 50,
                relativeY: 0.5
            };

            expect(AgentPositioning.isPositionValid(invalidPosition, mockEditorBounds)).toBe(false);
        });

        it('should accept position slightly outside bounds (margin)', () => {
            const position = {
                x: 100,
                y: 850, // Within 100px margin of (800 + 100)
                anchorLine: 50,
                relativeY: 0.5
            };

            expect(AgentPositioning.isPositionValid(position, mockEditorBounds)).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large document (10000 lines)', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                5000,
                10000,
                mockEditorBounds
            );

            expect(position.relativeY).toBe(0.5);
            expect(position.y).toBe(400); // Still centered in viewport
        });

        it('should handle very small viewport', () => {
            const tinyBounds: EditorBounds = {
                top: 0,
                left: 0,
                width: 400,
                height: 300
            };

            const position = AgentPositioning.getAgentPosition(
                'architect',
                50,
                100,
                tinyBounds
            );

            expect(position.y).toBe(150); // 300 * 0.5
        });

        it('should handle single line document', () => {
            const position = AgentPositioning.getAgentPosition(
                'architect',
                0,
                1,
                mockEditorBounds
            );

            expect(position.anchorLine).toBe(0);
            expect(position.relativeY).toBe(0);
        });
    });
});
