/**
 * Suggestion Card Component
 * Handles AI suggestions with accept/reject buttons
 * Story 7.1: Implement Suggestion Accept/Reject with Visual Feedback
 */
class SuggestionCard {
    constructor(parentContainer, suggestion, options = {}) {
        this.container = typeof parentContainer === 'string' ? document.getElementById(parentContainer) : parentContainer;
        this.suggestion = suggestion;
        this.options = options;
        this.element = null;
    }

    /**
     * Render the suggestion card
     */
    render() {
        if (!this.container) {return;}

        this.element = document.createElement('div');
        this.element.id = `alert-${this.suggestion.id}`;
        this.element.className = 'suggestion-card alert-component alert-info';
        this.element.dataset.anchorLine = this.suggestion.anchorLine?.toString() || '';
        this.element.setAttribute('role', 'alert');
        this.element.setAttribute('aria-live', 'polite');
        this.element.setAttribute('tabindex', '0');

        const content = document.createElement('div');
        content.className = 'suggestion-card__content';

        const header = document.createElement('div');
        header.className = 'suggestion-card__header';
        header.innerHTML = `<span class="suggestion-card__icon-ideogram">💻</span> <span class="suggestion-card__title">Suggestion</span>`;
        content.appendChild(header);

        const message = document.createElement('div');
        message.className = 'suggestion-card__message';

        // Simple markdown-like link conversion
        let formattedMessage = this.suggestion.message
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
            .replace(/\n/g, '<br/>');

        message.innerHTML = formattedMessage;
        content.appendChild(message);

        // Accept/Reject Buttons
        const actions = document.createElement('div');
        actions.className = 'suggestion-card__actions';

        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'suggestion-card__btn suggestion-card__btn--accept';
        acceptBtn.innerHTML = '✓ Accept';
        acceptBtn.setAttribute('title', 'Accept Suggestion (Ctrl+Enter)');
        acceptBtn.setAttribute('aria-label', 'Accept Suggestion');
        acceptBtn.onclick = (e) => {
            e.stopPropagation();
            this.handleAccept();
        };

        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'suggestion-card__btn suggestion-card__btn--reject';
        rejectBtn.innerHTML = '✗ Reject';
        rejectBtn.setAttribute('title', 'Reject Suggestion (Ctrl+Backspace)');
        rejectBtn.setAttribute('aria-label', 'Reject Suggestion');
        rejectBtn.onclick = (e) => {
            e.stopPropagation();
            this.handleReject();
        };

        actions.appendChild(acceptBtn);
        actions.appendChild(rejectBtn);
        content.appendChild(actions);

        this.element.appendChild(content);
        this.container.appendChild(this.element);

        return this.element;
    }

    /**
     * Handle accept action
     */
    handleAccept() {
        // Visual confirmation: Green checkmark animation (Optimistic UI)
        this.element.classList.add('suggestion-card--accepted');

        if (this.options.onAccept) {
            this.options.onAccept(this.suggestion);
        }

        // The extension will likely clear the alert after applying it, 
        // but we show the animation first.
    }

    /**
     * Handle reject action
     */
    handleReject() {
        // Visual confirmation: Red X fade out (Optimistic UI)
        this.element.classList.add('suggestion-card--rejected');

        if (this.options.onReject) {
            this.options.onReject(this.suggestion);
        }

        // Remove after animation
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.remove();
            }
        }, 300);
    }
}

export default SuggestionCard;
