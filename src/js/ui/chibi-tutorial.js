export class ChibiTutorial {
    constructor(htmlFragment) {
        this.tourSteps = [];
        this.currentTourStepIndex = 0;
        this.isTourActive = false;
        this.isShowingHelp = false;
        this.pausedTourStepIndex = -1;
        this.currentHighlightedElement = null;
        this.observers = null;
        this.currentDisplayConfig = null;
        this.boundHandleWindowResize = this.handleReposition.bind(this);
        this.boundHandleHighlightUpdate = this.handleHighlightUpdate.bind(this);

        this.container = document.createElement('div');
        this.container.id = 'chibi-container';
        this.container.innerHTML = `
            <div class="chibi-tutorial-overlay-piece" data-overlay="top"></div>
            <div class="chibi-tutorial-overlay-piece" data-overlay="bottom"></div>
            <div class="chibi-tutorial-overlay-piece" data-overlay="left"></div>
            <div class="chibi-tutorial-overlay-piece" data-overlay="right"></div>
        `;
        this.container.innerHTML += htmlFragment;
        document.body.appendChild(this.container);
        this.overlays = {
            top: this.container.querySelector('[data-overlay="top"]'),
            bottom: this.container.querySelector('[data-overlay="bottom"]'),
            left: this.container.querySelector('[data-overlay="left"]'),
            right: this.container.querySelector('[data-overlay="right"]'),
        };
        this.chibiGroup = this.container.querySelector('.chibi-group');
        this.bubbleText = this.container.querySelector('.bubble-text');
        this.nextButton = this.container.querySelector('.btn--tutorial_next');
        this.endButton = this.container.querySelector('.btn--tutorial_end');

        this.handleNext = this.handleNext.bind(this);
        this.hide = this.hide.bind(this);
        this.handleReposition = this.handleReposition.bind(this);

        this.nextButton.addEventListener('click', this.handleNext);
        this.endButton.addEventListener('click', this.hide);
    }

    startTour(steps) {
        localStorage.setItem('tutorialSeen', 'true');
        if (!steps || steps.length === 0) {
            console.error("ChibiTutorial: No steps provided for the tour.");
            return;
        }
        this.tourSteps = steps;
        if (this.pausedTourStepIndex === -1) { // If resuming from a paused state, don't reset the index
            this.currentTourStepIndex = 0;
        } else {
            this.currentTourStepIndex = this.pausedTourStepIndex; // Resuming, so use the paused index and reset the pause state
            this.pausedTourStepIndex = -1; // Reset pause state after using it
        }
        this.isTourActive = true;
        this.isShowingHelp = false; // Reset help flag when starting/resuming tour
        this.nextButton.textContent = ">>";
        this.endButton.style.display = 'inline-block'; // Ensure end button is visible for tour
        this.#initializeObservers();
        this.showTourStep(this.currentTourStepIndex);
    }

    showTourStep(index) {
        if (index >= this.tourSteps.length) {
            this.hide();
            return;
        }
        const step = this.tourSteps[index];
        this.showDisplay(step);
    }

    showTutorialIfNeeded() {
        const hasSeenTutorial = localStorage.getItem('tutorialSeen');


        if (!hasSeenTutorial) {
            const tourBtn = document.getElementById('start-tour-btn');

            if (tourBtn) {
                tourBtn.classList.add('attention-grabber');

                setTimeout(() => {
                    tourBtn.classList.remove('attention-grabber');
                }, 10000);
            }
        }
    }

    showDisplay(displayConfig) {
        this.currentDisplayConfig = displayConfig;
        this.#clearHighlight();
        this.chibiGroup.classList.remove('chibi-on-left');
        if (displayConfig.chibiSide === 'left') {
            this.chibiGroup.classList.add('chibi-on-left');
        }

        const bubbleWrapper = this.container.querySelector('.bubble-wrapper');
        bubbleWrapper.classList.remove('bubble-wrapper--big', 'bubble-wrapper--small');

        const size = displayConfig.size;
        if (size) {
            bubbleWrapper.classList.add(`bubble-wrapper--${size}`);
        }

        this.bubbleText.innerHTML = displayConfig.text;

        this.container.style.display = 'block';
        this.container.style.height = `${document.documentElement.scrollHeight}px`;
        let target = null;
        let needsScrollAndPosition = false;

        if (displayConfig.clickTab) {
            const tabButtonToClick = document.querySelector(displayConfig.clickTab);
            if (tabButtonToClick) {
                tabButtonToClick.dispatchEvent(new Event('click', { bubbles: true }));
                needsScrollAndPosition = true; // Assume content might change
            } else {
                console.warn(`ChibiTutorial: Tab button not found for selector "${displayConfig.clickTab}".`);
            }
        }

        if (displayConfig.action === 'click') {
            const targetElement = document.querySelector(displayConfig.element);
            if (targetElement) {
                targetElement.dispatchEvent(new Event('click', { bubbles: true }));
                needsScrollAndPosition = true; // Assume content might change
            } else {
                console.error(`ChibiTutorial: Element not found for selector "${displayConfig.element}" to perform action "${displayConfig.action}".`);
            }
        }

        if (displayConfig.element) {
            target = document.querySelector(displayConfig.element);
            const chibi = document.querySelector('.tutorial-chibi');
            this.#positionAll(target);
            if (!target) {
                console.error(`ChibiTutorial: Element not found for selector "${displayConfig.element}". Skipping display.`);
                if (this.isTourActive) this.handleNext();
                return;
            }

            if (needsScrollAndPosition) {
                setTimeout(() => {
                    this.currentHighlightedElement = target;
                    this.currentHighlightedElement.classList.add('chibi-tutorial-focused-element');
                    if (this.observers && this.observers.targetObserver) {
                        this.observers.targetObserver.observe(this.currentHighlightedElement);
                    }
                    this.#positionAll(this.currentHighlightedElement);
                }, 50);
            }

            const targetElements = [target, this.chibiGroup, chibi];
            this.#scrollIntoViewElements(targetElements);
        } else {
            this.#positionAll(null);
            this.chibiGroup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        window.addEventListener('resize', this.boundHandleWindowResize);
    }

    #scrollIntoViewElements(elements) {
        if (elements.length === 0) return;

        const combinedRect = this.getCombinedBoundingRect(elements);

        const tempElement = document.createElement('div');
        tempElement.style.cssText = `
        position: absolute;
        top: ${combinedRect.top}px;
        height: ${combinedRect.height}px;
        pointer-events: none;
        visibility: hidden;
    `;

        document.body.appendChild(tempElement);
        tempElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });

        // Remove temporary element after scroll
        setTimeout(() => {
            document.body.removeChild(tempElement);
        }, 1000);
    }

    getCombinedBoundingRect(elements) {
        const rects = elements.map(el => el.getBoundingClientRect());

        const left = Math.min(...rects.map(rect => rect.left));
        const top = Math.min(...rects.map(rect => rect.top));
        const right = Math.max(...rects.map(rect => rect.right));
        const bottom = Math.max(...rects.map(rect => rect.bottom));

        const margin = 10;

        return {
            top: top + window.pageYOffset - margin,
            left: left + window.pageXOffset - margin,
            width: right - left + margin * 2,
            height: bottom - top + margin * 2,
            right: right + window.pageXOffset + margin,
            bottom: bottom + window.pageYOffset + margin
        };
    }

    hide() {
        this.container.style.display = 'none';
        this.chibiGroup.classList.remove('chibi-on-left');
        this.#clearHighlight();
        this.#disconnectObservers();
        this.currentDisplayConfig = null;
        if (!this.isShowingHelp) {
            this.isTourActive = false;
            this.currentTourStepIndex = 0;
            this.pausedTourStepIndex = -1;
        }
        this.isShowingHelp = false;
        this.nextButton.textContent = "Next";
        this.endButton.style.display = 'inline-block';

        window.removeEventListener('resize', this.boundHandleWindowResize);
    }

    #clearHighlight() {
        if (this.currentHighlightedElement) {
            if (this.observers && this.observers.targetObserver) {
                this.observers.targetObserver.unobserve(this.currentHighlightedElement);
            }
            this.currentHighlightedElement.classList.remove('chibi-tutorial-focused-element');
            this.currentHighlightedElement = null;
        }
    }

    handleNext() {
        if (this.isTourActive) {
            this.currentTourStepIndex++;
            this.showTourStep(this.currentTourStepIndex);
        } else if (this.isShowingHelp) {
            this.hide();
            if (this.pausedTourStepIndex !== -1) {
                this.startTour(this.tourSteps);
            }
        } else {
            this.hide();
        }
    }

    showHelp(helpConfig, triggerElement = null) {
        if (!helpConfig) {
            console.warn("ChibiTutorial: No help configuration provided.");
            return;
        }

        let displayConfig = null;

        if (helpConfig.tourStepId) {
            // Find the tour step by its ID
            const stepIndex = this.tourSteps.findIndex(step => step && step.id === helpConfig.tourStepId);
            if (stepIndex !== -1) {
                displayConfig = { ...this.tourSteps[stepIndex] }; // Copy to avoid modifying original
            } else {
                console.warn(`ChibiTutorial: Tour step with ID '${helpConfig.tourStepId}' not found.`);
                if (helpConfig.text) {
                    displayConfig = {
                        text: helpConfig.text,
                        element: helpConfig.element,
                        clickTab: helpConfig.clickTab,
                        position: helpConfig.position || 'bottom',
                        chibiSide: helpConfig.chibiSide || 'right',
                        size: helpConfig.size || ''
                    };
                } else {
                    return;
                }
            }
        } else if (helpConfig.text) {
            // Create a temporary display config from the help text
            displayConfig = {
                text: helpConfig.text,
                element: helpConfig.element,
                clickTab: helpConfig.clickTab,
                position: helpConfig.position || 'bottom',
                chibiSide: helpConfig.chibiSide || 'right',
                size: helpConfig.size || ''
            };
        }

        if (!displayConfig.element && triggerElement) {
            displayConfig.element = triggerElement;
        }

        if (displayConfig) {
            if (this.isTourActive) {
                this.pausedTourStepIndex = this.currentTourStepIndex;
                this.isTourActive = false;
            }

            this.isShowingHelp = true;
            this.nextButton.textContent = "OK";
            this.endButton.style.display = 'none';

            this.showDisplay(displayConfig);
        }
    }

    handleHighlightUpdate() {
        window.requestAnimationFrame(() => {
            // Only proceed if there's a highlighted element and either tour or help is active
            if (!this.currentHighlightedElement || (!this.isTourActive && !this.isShowingHelp)) return;
            this.container.style.height = `${document.documentElement.scrollHeight}px`;
            const viewRect = this.currentHighlightedElement.getBoundingClientRect();
            const docRect = {
                top: viewRect.top + window.scrollY,
                bottom: viewRect.bottom + window.scrollY,
                left: viewRect.left + window.scrollX,
                right: viewRect.right + window.scrollX,
                width: viewRect.width,
                height: viewRect.height,
            };
            this.#positionOverlays(docRect);
        });
    }

    handleReposition() {
        window.requestAnimationFrame(() => {
            if (!this.currentHighlightedElement || (!this.isTourActive && !this.isShowingHelp)) return;
            this.container.style.height = `${document.documentElement.scrollHeight}px`;
            this.#positionAll(this.currentHighlightedElement);
        });
    }

    #positionAll(target) {
        if (target === null) {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;

            const elementRect = this.chibiGroup.getBoundingClientRect();
            const elementWidth = elementRect.width;
            const elementHeight = elementRect.height;

            const left = scrollX + (viewportWidth - elementWidth) / 2;
            const top = scrollY + (viewportHeight - elementHeight) / 2;

            this.chibiGroup.style.left = `${left}px`;
            this.chibiGroup.style.top = `${top}px`;
            this.chibiGroup.style.transform = '';

            this.#positionOverlays(target);
        } else {
            this.container.style.height = `${document.documentElement.scrollHeight}px`;
            const viewRect = target.getBoundingClientRect();
            const docRect = {
                top: viewRect.top + window.scrollY,
                bottom: viewRect.bottom + window.scrollY,
                left: viewRect.left + window.scrollX,
                right: viewRect.right + window.scrollX,
                width: viewRect.width,
                height: viewRect.height,
            };
            this.#positionOverlays(docRect);
            this.#positionChibi(docRect);
        }
    }

    #positionChibi(docRect) {
        const displayConfig = this.currentDisplayConfig || {};

        const chibi = document.querySelector('.tutorial-chibi');
        const bubbleRect = this.chibiGroup.getBoundingClientRect();
        const chibiRect = chibi.getBoundingClientRect();
        const elements = [this.chibiGroup, chibi];
        const combinedRect = this.getCombinedBoundingRect(elements);

        const offset = 10;
        let position;
        if (window.innerWidth < 900 || window.innerWidth < 620) {
            if (displayConfig.position === 'top') {
                position = 'top';
            } else {
                position = 'bottom';
            }
        } else {
            position = displayConfig.position || 'bottom';
        }
        let top, left;

        switch (position) {
            case 'top':
                top = docRect.top - combinedRect.height + offset;
                left = docRect.left + (docRect.width / 2) - (combinedRect.width / 2);
                break;
            case 'right':
                top = docRect.top + (docRect.height / 2) - (combinedRect.height / 2) + offset / 2;
                left = docRect.right + offset;
                break;
            case 'left':
                top = docRect.top + (docRect.height / 2) - (combinedRect.height / 2) + offset / 2;
                left = docRect.left - combinedRect.width + offset;
                break;
            default: // bottom
                top = docRect.bottom + offset;
                left = docRect.left + (docRect.width / 2) - (combinedRect.width / 2);
                break;
        }

        if (chibiRect.left < bubbleRect.left) {
            left = left - (chibiRect.left - bubbleRect.left);
        }
        if (chibiRect.top < bubbleRect.top) {
            top = top - chibiRect.top + bubbleRect.top;
        }

        if (left + combinedRect.width > window.innerWidth || left < offset) {
            left = offset;
        }

        this.chibiGroup.style.left = `${left}px`;
        this.chibiGroup.style.top = `${top}px`;
        this.chibiGroup.style.transform = '';
    }

    #positionOverlays(docRect) {
        if (!docRect) {
            this.overlays.top.style.cssText = 'width: 100%; height: 100%;';
            this.overlays.bottom.style.cssText = 'width: 0; height: 0;';
            this.overlays.left.style.cssText = 'width: 0; height: 0;';
            this.overlays.right.style.cssText = 'width: 0; height: 0;';
            return;
        }
        this.overlays.left.style.cssText = `top: 0; left: 0; width: ${docRect.left}px; height: 100%;`;
        this.overlays.right.style.cssText = `top: 0; left: ${docRect.right}px; width: calc(100% - ${docRect.right}px); height: 100%;`;
        this.overlays.top.style.cssText = `top: 0; left: ${docRect.left}px; width: ${docRect.width}px; height: ${docRect.top}px;`;
        this.overlays.bottom.style.cssText = `top: ${docRect.bottom}px; left: ${docRect.left}px; width: ${docRect.width}px; height: calc(100% - ${docRect.bottom}px);`;
    }

    #initializeObservers() {
        this.observers = {
            targetObserver: new ResizeObserver(this.boundHandleHighlightUpdate),
            bodyObserver: new ResizeObserver(this.boundHandleHighlightUpdate),
            mutationObserver: new MutationObserver(this.boundHandleHighlightUpdate)
        };
        if (this.observers.bodyObserver) {
            this.observers.bodyObserver.observe(document.body);
        }
        if (this.observers.mutationObserver) {
            this.observers.mutationObserver.observe(document.body, { attributes: true, childList: true, subtree: true });
        }
    }

    #disconnectObservers() {
        if (!this.observers) return;
        if (this.observers.targetObserver) {
            this.observers.targetObserver.disconnect();
        }
        if (this.observers.bodyObserver) {
            this.observers.bodyObserver.disconnect();
        }
        if (this.observers.mutationObserver) {
            this.observers.mutationObserver.disconnect();
        }
        this.observers = null;
    }

    showError(errorMessage, targetSelector = '.tab-panel-card') {
        const errorConfig = {
            text: `<p style="color: #ff6b6b;">${errorMessage}</p>`,
            element: targetSelector,
            position: 'right',
            chibiSide: 'right',
            size: 'small'
        };

        this.showHelp(errorConfig);
    }
}