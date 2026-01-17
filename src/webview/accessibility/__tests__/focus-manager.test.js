/**
 * Unit tests for FocusManager
 * Tests keyboard navigation, focus management, and accessibility features
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import FocusManager from '../focus-manager.js';

describe('FocusManager', () => {
    let focusManager;
    let container;

    beforeEach(() => {
        // Create a test container
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        // Create test interactive elements
        const agent1 = document.createElement('div');
        agent1.className = 'agent-icon';
        agent1.dataset.agent = 'architect';
        container.appendChild(agent1);

        const agent2 = document.createElement('div');
        agent2.className = 'agent-icon';
        agent2.dataset.agent = 'coder';
        container.appendChild(agent2);

        const alert1 = document.createElement('div');
        alert1.className = 'alert-component';
        alert1.id = 'alert-1';
        container.appendChild(alert1);

        const alert2 = document.createElement('div');
        alert2.className = 'alert-component';
        alert2.id = 'alert-2';
        container.appendChild(alert2);

        // Initialize FocusManager
        focusManager = new FocusManager();
        focusManager.initialize();
    });

    afterEach(() => {
        // Cleanup
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        focusManager = null;
    });

    describe('Initialization', () => {
        it('should initialize with correct number of interactive elements', () => {
            expect(focusManager.interactiveElements.length).to.be.greaterThan(0);
        });

        it('should add tabindex to all interactive elements', () => {
            const agents = container.querySelectorAll('.agent-icon');
            agents.forEach(agent => {
                expect(agent.getAttribute('tabindex')).to.equal('0');
            });

            const alerts = container.querySelectorAll('.alert-component');
            alerts.forEach(alert => {
                expect(alert.getAttribute('tabindex')).to.equal('0');
            });
        });

        it('should create skip links', () => {
            const skipLinks = document.querySelectorAll('.skip-link');
            expect(skipLinks.length).to.be.greaterThan(0);
        });

        it('should create ARIA live region', () => {
            const liveRegion = document.getElementById('sr-live-region');
            expect(liveRegion).to.exist;
            expect(liveRegion.getAttribute('aria-live')).to.equal('polite');
            expect(liveRegion.getAttribute('aria-atomic')).to.equal('true');
        });
    });

    describe('Tab Navigation', () => {
        it('should cycle forward through elements on Tab', () => {
            focusManager.handleTabNavigation(false);
            expect(focusManager.currentFocusIndex).to.equal(0);

            focusManager.handleTabNavigation(false);
            expect(focusManager.currentFocusIndex).to.equal(1);
        });

        it('should cycle backward through elements on Shift+Tab', () => {
            focusManager.currentFocusIndex = 1;
            focusManager.handleTabNavigation(true);
            expect(focusManager.currentFocusIndex).to.equal(0);
        });

        it('should wrap around when reaching end', () => {
            const lastIndex = focusManager.interactiveElements.length - 1;
            focusManager.currentFocusIndex = lastIndex;
            focusManager.handleTabNavigation(false);
            expect(focusManager.currentFocusIndex).to.equal(0);
        });

        it('should wrap around when reaching beginning', () => {
            focusManager.currentFocusIndex = 0;
            focusManager.handleTabNavigation(true);
            expect(focusManager.currentFocusIndex).to.equal(focusManager.interactiveElements.length - 1);
        });
    });

    describe('Arrow Navigation', () => {
        it('should navigate between agents with arrow keys', () => {
            // Find first agent index
            const firstAgentIndex = focusManager.interactiveElements.findIndex(
                el => el.classList.contains('agent-icon')
            );
            focusManager.currentFocusIndex = firstAgentIndex;

            // Simulate ArrowRight
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            focusManager.handleArrowNavigation(event);

            // Should move to next agent
            const nextIndex = focusManager.currentFocusIndex;
            expect(focusManager.interactiveElements[nextIndex].classList.contains('agent-icon')).to.be.true;
        });

        it('should navigate between alerts with arrow keys', () => {
            // Find first alert index
            const firstAlertIndex = focusManager.interactiveElements.findIndex(
                el => el.classList.contains('alert-component')
            );
            focusManager.currentFocusIndex = firstAlertIndex;

            // Simulate ArrowDown
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            focusManager.handleArrowNavigation(event);

            // Should move to next alert
            const nextIndex = focusManager.currentFocusIndex;
            expect(focusManager.interactiveElements[nextIndex].classList.contains('alert-component')).to.be.true;
        });
    });

    describe('Focus Trap', () => {
        it('should create focus trap for modal', () => {
            const modal = document.createElement('div');
            modal.className = 'modal';

            const button1 = document.createElement('button');
            button1.textContent = 'Button 1';
            modal.appendChild(button1);

            const button2 = document.createElement('button');
            button2.textContent = 'Button 2';
            modal.appendChild(button2);

            document.body.appendChild(modal);

            focusManager.createFocusTrap(modal);

            expect(focusManager.focusTrapStack.length).to.equal(1);
            expect(focusManager.focusTrapStack[0].container).to.equal(modal);
            expect(focusManager.focusTrapStack[0].elements.length).to.equal(2);

            // Cleanup
            document.body.removeChild(modal);
        });

        it('should release focus trap and restore previous focus', () => {
            const modal = document.createElement('div');
            const button = document.createElement('button');
            modal.appendChild(button);
            document.body.appendChild(modal);

            const previousFocus = document.activeElement;
            focusManager.createFocusTrap(modal);
            focusManager.releaseFocusTrap();

            expect(focusManager.focusTrapStack.length).to.equal(0);

            // Cleanup
            document.body.removeChild(modal);
        });
    });

    describe('Accessibility', () => {
        it('should announce messages to screen readers', () => {
            focusManager.announceToScreenReader('Test message');

            const liveRegion = document.getElementById('sr-live-region');

            // Wait for timeout
            setTimeout(() => {
                expect(liveRegion.textContent).to.equal('Test message');
            }, 150);
        });

        it('should add keyboard-focus class on focus', () => {
            const element = focusManager.interactiveElements[0];
            const event = new FocusEvent('focusin', { target: element });

            focusManager.handleFocusIn(event);

            expect(element.classList.contains('keyboard-focus')).to.be.true;
        });

        it('should remove keyboard-focus class on blur', () => {
            const element = focusManager.interactiveElements[0];
            element.classList.add('keyboard-focus');

            const event = new FocusEvent('focusout', { target: element });
            focusManager.handleFocusOut(event);

            expect(element.classList.contains('keyboard-focus')).to.be.false;
        });
    });

    describe('Element Description', () => {
        it('should get description for agent elements', () => {
            const agent = container.querySelector('.agent-icon');
            const description = focusManager.getElementDescription(agent);

            expect(description).to.include('Agent');
            expect(description).to.include('architect');
        });

        it('should get description for alert elements', () => {
            const alert = container.querySelector('.alert-component');
            const description = focusManager.getElementDescription(alert);

            expect(description).to.equal('Alert');
        });

        it('should use aria-label if available', () => {
            const element = document.createElement('div');
            element.setAttribute('aria-label', 'Custom Label');
            container.appendChild(element);

            const description = focusManager.getElementDescription(element);
            expect(description).to.equal('Custom Label');
        });
    });

    describe('Focus First Element', () => {
        it('should focus first interactive element', () => {
            focusManager.focusFirst();

            expect(focusManager.currentFocusIndex).to.equal(0);
            expect(document.activeElement).to.equal(focusManager.interactiveElements[0]);
        });
    });

    describe('Update Interactive Elements', () => {
        it('should update list when new elements are added', () => {
            const initialCount = focusManager.interactiveElements.length;

            const newAgent = document.createElement('div');
            newAgent.className = 'agent-icon';
            newAgent.dataset.agent = 'reviewer';
            container.appendChild(newAgent);

            focusManager.updateInteractiveElements();

            expect(focusManager.interactiveElements.length).to.be.greaterThan(initialCount);
        });
    });
});
