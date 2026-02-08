/**
 * AgentPositioning - Calculates agent positions for code anchoring
 *
 * This module provides utilities to position agents relative to code lines,
 * enabling them to "anchor" to specific lines they are analyzing.
 *
 * @module ui/agent-positioning
 * @since Story 11.2
 */

import { AgentType } from '../agents/shared/agent.interface.js';

/**
 * Represents the calculated position of an agent
 */
export interface AgentPosition {
    /** Absolute X coordinate in pixels */
    x: number;
    /** Absolute Y coordinate in pixels */
    y: number;
    /** Line number the agent is anchored to (0-based) */
    anchorLine: number;
    /** Relative Y position (0-1) within the document */
    relativeY: number;
}

/**
 * Represents the bounds of the editor viewport
 */
export interface EditorBounds {
    /** Top offset in pixels */
    top: number;
    /** Left offset in pixels */
    left: number;
    /** Width in pixels */
    width: number;
    /** Height in pixels */
    height: number;
}

/**
 * Represents a visible range of lines in the editor
 */
export interface VisibleRange {
    /** First visible line (0-based) */
    start: number;
    /** Last visible line (0-based) */
    end: number;
}

/**
 * AgentPositioning - Static utility class for agent positioning calculations
 *
 * Provides methods to:
 * - Calculate agent positions based on code lines
 * - Determine visibility of lines
 * - Find nearest visible lines
 *
 * @example
 * ```typescript
 * const position = AgentPositioning.getAgentPosition(
 *   'architect',
 *   50,  // line 50
 *   100, // total 100 lines
 *   { top: 0, left: 0, width: 1200, height: 800 }
 * );
 * // Returns: { x: -120, y: 400, anchorLine: 50, relativeY: 0.5 }
 * ```
 */
export class AgentPositioning {
    /**
     * Default X offset positions for each agent type
     *
     * Left-side agents (Context, Architect): negative values
     * Right-side agents (Coder, Reviewer): calculated from editor width
     */
    private static readonly MARGIN_OFFSETS: Record<AgentType, number | ((bounds: EditorBounds) => number)> = {
        context: -60,      // Marge gauche
        architect: -120,   // Marge gauche étendue
        coder: (bounds: EditorBounds) => bounds.width + 20,   // Marge droite
        reviewer: (bounds: EditorBounds) => bounds.width + 80  // Marge droite étendue
    };

    /**
     * Default agent size for collision calculations
     */
    private static readonly AGENT_SIZE = 80; // pixels

    /**
     * Minimum distance between agents to avoid collision
     */
    private static readonly MIN_AGENT_DISTANCE = 100; // pixels

    /**
     * Calculates the absolute position for an agent to anchor to a specific line
     *
     * @param agentType - Type of agent (context, architect, coder, reviewer)
     * @param lineNumber - Target line number (0-based)
     * @param totalLines - Total number of lines in the document
     * @param editorBounds - Current bounds of the editor viewport
     * @returns Calculated agent position with absolute and relative coordinates
     *
     * @example
     * ```typescript
     * const pos = AgentPositioning.getAgentPosition(
     *   'coder',
     *   75,
     *   150,
     *   { top: 0, left: 0, width: 1000, height: 600 }
     * );
     * // pos.y will be at 50% of viewport (line 75 of 150)
     * // pos.x will be 1020 (1000 + 20)
     * ```
     */
    public static getAgentPosition(
        agentType: AgentType,
        lineNumber: number,
        totalLines: number,
        editorBounds: EditorBounds
    ): AgentPosition {
        // Clamp line number to valid range [0, totalLines-1]
        const clampedLine = Math.max(0, Math.min(lineNumber, totalLines - 1));

        // Calculate relative Y position (0 to 1)
        // Handle edge case: if totalLines is 0, default to 0
        const relativeY = totalLines > 0 ? clampedLine / totalLines : 0;

        // Calculate absolute Y position within editor bounds
        const y = editorBounds.top + (editorBounds.height * relativeY);

        // Calculate X position based on agent type
        const offsetFn = this.MARGIN_OFFSETS[agentType];
        const x = typeof offsetFn === 'function'
            ? offsetFn(editorBounds)
            : editorBounds.left + offsetFn;

        return {
            x,
            y,
            anchorLine: clampedLine,
            relativeY
        };
    }

    /**
     * Checks if a specific line is currently visible in the viewport
     *
     * @param lineNumber - Line number to check (0-based)
     * @param visibleRanges - Array of currently visible line ranges
     * @returns True if the line is visible, false otherwise
     *
     * @example
     * ```typescript
     * const visible = AgentPositioning.isLineVisible(
     *   50,
     *   [{ start: 40, end: 60 }, { start: 80, end: 100 }]
     * );
     * // Returns: true (line 50 is in range 40-60)
     * ```
     */
    public static isLineVisible(
        lineNumber: number,
        visibleRanges: VisibleRange[]
    ): boolean {
        return visibleRanges.some(
            range => lineNumber >= range.start && lineNumber <= range.end
        );
    }

    /**
     * Finds the nearest visible line to a target line
     *
     * If the target line is already visible, returns it unchanged.
     * Otherwise, finds the closest visible line from available ranges.
     *
     * @param targetLine - Target line number (0-based)
     * @param visibleRanges - Array of currently visible line ranges
     * @returns Nearest visible line number
     *
     * @example
     * ```typescript
     * const nearest = AgentPositioning.findNearestVisibleLine(
     *   75,  // Target line (not visible)
     *   [{ start: 40, end: 60 }, { start: 80, end: 100 }]
     * );
     * // Returns: 80 (closest visible line to 75)
     * ```
     */
    public static findNearestVisibleLine(
        targetLine: number,
        visibleRanges: VisibleRange[]
    ): number {
        // If target is already visible, return it
        if (this.isLineVisible(targetLine, visibleRanges)) {
            return targetLine;
        }

        // Find the closest line from all visible ranges
        let nearestLine = targetLine;
        let minDistance = Infinity;

        visibleRanges.forEach(range => {
            // Check distance to start of range
            const distanceToStart = Math.abs(targetLine - range.start);
            if (distanceToStart < minDistance) {
                minDistance = distanceToStart;
                nearestLine = range.start;
            }

            // Check distance to end of range
            const distanceToEnd = Math.abs(targetLine - range.end);
            if (distanceToEnd < minDistance) {
                minDistance = distanceToEnd;
                nearestLine = range.end;
            }
        });

        return nearestLine;
    }

    /**
     * Calculates positions for multiple agents, avoiding collisions
     *
     * When multiple agents target the same or nearby lines, this method
     * adjusts their Y positions to prevent visual overlap.
     *
     * @param requests - Array of positioning requests (agentType + line)
     * @param totalLines - Total lines in document
     * @param editorBounds - Editor viewport bounds
     * @returns Map of agent positions, adjusted for collision avoidance
     *
     * @example
     * ```typescript
     * const positions = AgentPositioning.getMultipleAgentPositions(
     *   [
     *     { agentType: 'context', lineNumber: 50 },
     *     { agentType: 'architect', lineNumber: 52 }  // Close to context
     *   ],
     *   100,
     *   { top: 0, left: 0, width: 1200, height: 800 }
     * );
     * // Architect will be slightly offset to avoid collision with context
     * ```
     */
    public static getMultipleAgentPositions(
        requests: Array<{ agentType: AgentType; lineNumber: number }>,
        totalLines: number,
        editorBounds: EditorBounds
    ): Map<AgentType, AgentPosition> {
        const positions = new Map<AgentType, AgentPosition>();

        // Calculate initial positions for all agents
        requests.forEach(req => {
            const position = this.getAgentPosition(
                req.agentType,
                req.lineNumber,
                totalLines,
                editorBounds
            );
            positions.set(req.agentType, position);
        });

        // Detect and resolve collisions
        // Group agents by side (left vs right)
        const leftAgents: AgentType[] = ['context', 'architect'];
        const rightAgents: AgentType[] = ['coder', 'reviewer'];

        // Check collisions within each side
        this.resolveCollisions(leftAgents, positions);
        this.resolveCollisions(rightAgents, positions);

        return positions;
    }

    /**
     * Resolves collisions between agents on the same side
     * Adjusts Y positions to maintain minimum distance
     *
     * @private
     */
    private static resolveCollisions(
        agentGroup: AgentType[],
        positions: Map<AgentType, AgentPosition>
    ): void {
        // Get positions for agents in this group
        const groupPositions = agentGroup
            .map(type => ({ type, pos: positions.get(type) }))
            .filter(item => item.pos !== undefined) as Array<{ type: AgentType; pos: AgentPosition }>;

        // Sort by Y position
        groupPositions.sort((a, b) => a.pos.y - b.pos.y);

        // Adjust positions if too close
        for (let i = 1; i < groupPositions.length; i++) {
            const prev = groupPositions[i - 1];
            const curr = groupPositions[i];

            const distance = curr.pos.y - prev.pos.y;
            if (distance < this.MIN_AGENT_DISTANCE) {
                // Push current agent down to maintain minimum distance
                const adjustment = this.MIN_AGENT_DISTANCE - distance;
                curr.pos.y += adjustment;

                // Update in map
                positions.set(curr.type, curr.pos);
            }
        }
    }

    /**
     * Calculates the center point position for an agent at a given line
     * Useful for animations that need the agent's center point
     *
     * @param position - Base agent position
     * @returns Center point coordinates
     */
    public static getAgentCenterPoint(position: AgentPosition): { x: number; y: number } {
        return {
            x: position.x,
            y: position.y + (this.AGENT_SIZE / 2)
        };
    }

    /**
     * Estimates editor bounds when VSCode API doesn't provide them
     *
     * This is a fallback for when precise measurements aren't available.
     * In production, these should be refined based on actual measurements.
     *
     * @param viewportWidth - Browser viewport width
     * @param viewportHeight - Browser viewport height
     * @returns Estimated editor bounds
     */
    public static estimateEditorBounds(
        viewportWidth: number,
        viewportHeight: number
    ): EditorBounds {
        // Estimate editor takes ~80% of viewport (sidebars, panels, etc.)
        // These are conservative estimates
        return {
            top: 40,  // Account for tabs/toolbar
            left: 60, // Account for sidebar
            width: viewportWidth * 0.75,
            height: viewportHeight - 80  // Account for top/bottom bars
        };
    }

    /**
     * Validates that a position is within reasonable bounds
     * Useful for debugging and edge case handling
     *
     * @param position - Position to validate
     * @param editorBounds - Editor bounds for validation
     * @returns True if position is reasonable
     */
    public static isPositionValid(
        position: AgentPosition,
        editorBounds: EditorBounds
    ): boolean {
        // Check if position is not NaN or Infinity
        if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
            return false;
        }

        // Check if relativeY is in valid range [0, 1]
        if (position.relativeY < 0 || position.relativeY > 1) {
            return false;
        }

        // Y should be within editor height (with some margin for overflow)
        const maxY = editorBounds.top + editorBounds.height + 100; // 100px margin
        if (position.y < 0 || position.y > maxY) {
            return false;
        }

        return true;
    }
}
