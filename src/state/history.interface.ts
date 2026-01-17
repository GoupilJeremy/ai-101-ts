export interface IDecisionRecord {
    id: string;
    timestamp: number;
    type: 'suggestion' | 'alert' | 'decision';
    summary: string;
    agent: 'architect' | 'coder' | 'reviewer' | 'context';
    status: 'pending' | 'accepted' | 'rejected' | 'resolved';
    details: {
        reasoning: string;
        code?: string;
        context?: string[];
        analysis?: any;
        architectReasoning?: string;
        coderApproach?: string;
        reviewerValidation?: string;
    };
}
