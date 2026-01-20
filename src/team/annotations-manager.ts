/**
 * Collaborative Annotations Manager
 * Manages team member comments on AI suggestions for collaborative workflows
 */

import * as vscode from 'vscode';

export interface IAnnotation {
    id: string;
    suggestionId: string;
    comment: string;
    author: string;
    timestamp: number;
    resolved: boolean;
}

export class AnnotationsManager {
    private static instance: AnnotationsManager;
    private annotations: IAnnotation[] = [];
    private workspaceState: vscode.Memento;

    private constructor() {
        // Use VSCode's workspace state for persistence
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(''));
        const workspaceUri = workspaceFolder ? workspaceFolder.uri : vscode.Uri.file('');
        const context = vscode.extensions.getExtension('GoupilJeremy.suika')?.exports;
        this.workspaceState = context?.workspaceState || { get: () => [], update: () => { } };
        this.loadAnnotations();
    }

    public static getInstance(): AnnotationsManager {
        if (!AnnotationsManager.instance) {
            AnnotationsManager.instance = new AnnotationsManager();
        }
        return AnnotationsManager.instance;
    }

    /**
     * Load annotations from workspace state
     */
    private loadAnnotations(): void {
        const savedAnnotations = this.workspaceState.get<IAnnotation[]>('suika.teamAnnotations', []);
        this.annotations = savedAnnotations || [];
    }

    /**
     * Save annotations to workspace state
     */
    private saveAnnotations(): void {
        this.workspaceState.update('suika.teamAnnotations', this.annotations);
    }

    /**
     * Add a new annotation to a suggestion
     */
    public addAnnotation(suggestionId: string, comment: string, author: string): IAnnotation {
        const annotation: IAnnotation = {
            id: `anno-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            suggestionId,
            comment,
            author,
            timestamp: Date.now(),
            resolved: false
        };

        this.annotations.push(annotation);
        this.saveAnnotations();

        // Send update to webview
        this.sendAnnotationsUpdate();

        return annotation;
    }

    /**
     * Get all annotations for a specific suggestion
     */
    public getAnnotationsForSuggestion(suggestionId: string): IAnnotation[] {
        return this.annotations.filter(anno => anno.suggestionId === suggestionId);
    }

    /**
     * Get all annotations
     */
    public getAllAnnotations(): IAnnotation[] {
        return [...this.annotations];
    }

    /**
     * Mark annotation as resolved
     */
    public resolveAnnotation(annotationId: string): boolean {
        const annotation = this.annotations.find(anno => anno.id === annotationId);
        if (annotation) {
            annotation.resolved = true;
            this.saveAnnotations();
            this.sendAnnotationsUpdate();
            return true;
        }
        return false;
    }

    /**
     * Delete an annotation
     */
    public deleteAnnotation(annotationId: string): boolean {
        const index = this.annotations.findIndex(anno => anno.id === annotationId);
        if (index !== -1) {
            this.annotations.splice(index, 1);
            this.saveAnnotations();
            this.sendAnnotationsUpdate();
            return true;
        }
        return false;
    }

    /**
     * Send annotations update to webview
     */
    private sendAnnotationsUpdate(): void {
        const vscodeApi = (window as any).acquireVsCodeApi?.();
        if (vscodeApi) {
            vscodeApi.postMessage({
                type: 'toWebview:annotationsUpdate',
                annotations: this.annotations
            });
        }
    }

    /**
     * Clear all annotations (e.g., when switching projects)
     */
    public clearAllAnnotations(): void {
        this.annotations = [];
        this.saveAnnotations();
        this.sendAnnotationsUpdate();
    }
}