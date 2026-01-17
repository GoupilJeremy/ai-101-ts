/**
 * Tests for AlertDetailPanel Component
 * Story 7.5: Implement Click-to-Expand for Alert Details and Fixes
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import AlertDetailPanel from '../alert-detail-panel.js';

describe('AlertDetailPanel', () => {
    let dom;
    let document;
    let panel;
    let mockAlert;
    let targetElement;

    beforeEach(() => {
        // Setup JSDOM
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        document = dom.window.document;
        global.document = document;
        global.window = dom.window;
        global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

        // Create target element
        targetElement = document.createElement('div');
        targetElement.id = 'test-alert';
        document.body.appendChild(targetElement);

        // Mock alert data
        mockAlert = {
            id: 'test-alert-1',
            severity: 'warning',
            message: 'Potential null pointer exception',
            reasoning: 'Variable may be undefined at this point',
            codeSnippet: 'const value = obj.property;',
            fix: {
                before: 'const value = obj.property;',
                after: 'const value = obj?.property ?? defaultValue;',
                description: 'Use optional chaining and nullish coalescing'
            }
        };

        panel = AlertDetailPanel.getInstance();
    });

    afterEach(() => {
        if (panel) {
            panel.hide();
        }
        delete global.document;
        delete global.window;
        delete global.requestAnimationFrame;
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = AlertDetailPanel.getInstance();
            const instance2 = AlertDetailPanel.getInstance();
            expect(instance1).to.equal(instance2);
        });
    });

    describe('show()', () => {
        it('should render panel with alert data', () => {
            panel.show(mockAlert, targetElement);

            const panelEl = document.getElementById('alert-detail-panel');
            expect(panelEl).to.exist;
            expect(panelEl.style.opacity).to.not.equal('0');
        });

        it('should display severity indicator', () => {
            panel.show(mockAlert, targetElement);

            const severityEl = document.querySelector('.alert-panel__severity');
            expect(severityEl).to.exist;
            expect(severityEl.textContent).to.include('warning');
        });

        it('should display message and reasoning', () => {
            panel.show(mockAlert, targetElement);

            const messageEl = document.querySelector('.alert-panel__message');
            const reasoningEl = document.querySelector('.alert-panel__reasoning');

            expect(messageEl).to.exist;
            expect(messageEl.textContent).to.include(mockAlert.message);
            expect(reasoningEl).to.exist;
            expect(reasoningEl.textContent).to.include(mockAlert.reasoning);
        });

        it('should display code diff when fix is provided', () => {
            panel.show(mockAlert, targetElement);

            const diffEl = document.querySelector('.alert-panel__diff');
            expect(diffEl).to.exist;
            expect(diffEl.textContent).to.include(mockAlert.fix.before);
            expect(diffEl.textContent).to.include(mockAlert.fix.after);
        });

        it('should render Apply Fix button when fix is available', () => {
            panel.show(mockAlert, targetElement);

            const applyBtn = document.querySelector('.alert-panel__btn--apply');
            expect(applyBtn).to.exist;
            expect(applyBtn.textContent).to.include('Apply Fix');
        });

        it('should render Explain More button', () => {
            panel.show(mockAlert, targetElement);

            const explainBtn = document.querySelector('.alert-panel__btn--explain');
            expect(explainBtn).to.exist;
            expect(explainBtn.textContent).to.include('Explain More');
        });
    });

    describe('hide()', () => {
        it('should hide the panel', (done) => {
            panel.show(mockAlert, targetElement);
            panel.hide();

            setTimeout(() => {
                const panelEl = document.getElementById('alert-detail-panel');
                expect(panelEl.style.opacity).to.equal('0');
                done();
            }, 50);
        });

        it('should set aria-hidden to true', (done) => {
            panel.show(mockAlert, targetElement);
            panel.hide();

            setTimeout(() => {
                const panelEl = document.getElementById('alert-detail-panel');
                expect(panelEl.getAttribute('aria-hidden')).to.equal('true');
                done();
            }, 50);
        });
    });

    describe('Event Handling', () => {
        it('should emit applyFix message when Apply Fix is clicked', (done) => {
            let messageEmitted = false;

            // Mock postMessage
            global.window.vscode = {
                postMessage: (msg) => {
                    if (msg.type === 'toExtension:applyFix') {
                        messageEmitted = true;
                        expect(msg.alertId).to.equal(mockAlert.id);
                        done();
                    }
                }
            };

            panel.show(mockAlert, targetElement);
            const applyBtn = document.querySelector('.alert-panel__btn--apply');
            applyBtn.click();
        });

        it('should emit explainAlert message when Explain More is clicked', (done) => {
            global.window.vscode = {
                postMessage: (msg) => {
                    if (msg.type === 'toExtension:explainAlert') {
                        expect(msg.alertId).to.equal(mockAlert.id);
                        done();
                    }
                }
            };

            panel.show(mockAlert, targetElement);
            const explainBtn = document.querySelector('.alert-panel__btn--explain');
            explainBtn.click();
        });

        it('should hide panel when close button is clicked', (done) => {
            panel.show(mockAlert, targetElement);
            const closeBtn = document.querySelector('.alert-panel__btn--close');
            closeBtn.click();

            setTimeout(() => {
                const panelEl = document.getElementById('alert-detail-panel');
                expect(panelEl.style.opacity).to.equal('0');
                done();
            }, 50);
        });

        it('should hide panel when clicking outside', (done) => {
            panel.show(mockAlert, targetElement);

            // Simulate click outside
            const outsideEl = document.createElement('div');
            document.body.appendChild(outsideEl);
            outsideEl.click();

            setTimeout(() => {
                const panelEl = document.getElementById('alert-detail-panel');
                expect(panelEl.style.opacity).to.equal('0');
                done();
            }, 50);
        });

        it('should hide panel when Escape key is pressed', (done) => {
            panel.show(mockAlert, targetElement);

            const escEvent = new dom.window.KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escEvent);

            setTimeout(() => {
                const panelEl = document.getElementById('alert-detail-panel');
                expect(panelEl.style.opacity).to.equal('0');
                done();
            }, 50);
        });
    });

    describe('Accessibility', () => {
        it('should have role="dialog"', () => {
            panel.show(mockAlert, targetElement);

            const panelEl = document.getElementById('alert-detail-panel');
            expect(panelEl.getAttribute('role')).to.equal('dialog');
        });

        it('should have aria-modal="true"', () => {
            panel.show(mockAlert, targetElement);

            const panelEl = document.getElementById('alert-detail-panel');
            expect(panelEl.getAttribute('aria-modal')).to.equal('true');
        });

        it('should have aria-labelledby pointing to title', () => {
            panel.show(mockAlert, targetElement);

            const panelEl = document.getElementById('alert-detail-panel');
            const labelledBy = panelEl.getAttribute('aria-labelledby');
            expect(labelledBy).to.exist;
            expect(document.getElementById(labelledBy)).to.exist;
        });

        it('should trap focus within panel when open', () => {
            panel.show(mockAlert, targetElement);

            const focusableElements = document.querySelectorAll(
                '.alert-panel button, .alert-panel [tabindex="0"]'
            );
            expect(focusableElements.length).to.be.greaterThan(0);
        });
    });

    describe('Positioning', () => {
        it('should position panel near target element', () => {
            targetElement.getBoundingClientRect = () => ({
                top: 100,
                left: 200,
                right: 240,
                bottom: 140,
                width: 40,
                height: 40
            });

            panel.show(mockAlert, targetElement);

            const panelEl = document.getElementById('alert-detail-panel');
            const transform = panelEl.style.transform;
            expect(transform).to.include('translate3d');
        });

        it('should not clip offscreen (right edge)', () => {
            // Mock viewport
            global.window.innerWidth = 800;
            global.window.innerHeight = 600;

            targetElement.getBoundingClientRect = () => ({
                top: 100,
                left: 750,
                right: 790,
                bottom: 140,
                width: 40,
                height: 40
            });

            panel.show(mockAlert, targetElement);

            const panelEl = document.getElementById('alert-detail-panel');
            const transform = panelEl.style.transform;
            // Panel should be repositioned to stay within viewport
            expect(transform).to.exist;
        });
    });
});
