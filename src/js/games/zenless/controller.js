import { CalculationHandler } from '../../core/calculation-constructor.js';
import { exportDataAsJson, initializeImporter } from "../../ui/data-action.js";
import { initializePullPlanManager } from "../../ui/pull-plan.js";
import { initializeTables, initializeTarget } from "../../ui/initialize-inputs.js";
import { setUpInputPersist } from "../../ui/input-persist.js";
import { createPersistence } from "../../core/save-input.js";
import { DataValidator } from '../../ui/data-validator.js';
import { createCashbackHook } from '../../core/hooks.js';
import { initializeTabs } from "../../ui/tabs.js";
import { getPageConfiguration, getLabels, getPullPlan, getTarget } from "../../core/get-input.js";
import { updateChart, convertToChartData } from "../../ui/chart-configs.js";
import { recalcInputs } from "../../ui/recalc-inputs.js";
import { SELECTORS, INITIAL_CONFIG, DEFAULTS } from './page-config.js';
import { CONSTELLATION_OPTIONS } from './config.js';
import { ChibiTutorial } from '../../ui/chibi-tutorial.js';
import { chibiHtmlFragment, zenlessTourSteps, helpContentMap } from './tutorial-config.js';

export class zenlessPageController {
    constructor(parts) {
        this.parts = parts;
        this.persistence = createPersistence('zzz', SELECTORS);

        const cashbackHook = createCashbackHook({
            cashbackCalculator: this.parts.cashbackFn,
            uiUpdater: this.parts.updateTableFn
        });
        this.tutorial = new ChibiTutorial(chibiHtmlFragment);
        const config = {
            getPageConfiguration,
            getLabels,
            getPullPlan,
            getTarget,
            updateChart,
            convertToChartData,
            recalcInputs,
            calculatorFunction: this.parts.runCalcFn,
            calculatorConfig: {
                gachaConfig: this.parts.gachaConfig,
                CONSTELLATION_MAP: this.parts.CONSTELLATION_MAP
            },
            pageConfig: {
                SELECTORS,
                INITIAL_CONFIG
            },
            postCalculationHooks: [cashbackHook],
            persistence: this.persistence,
            chibi: this.tutorial
        };

        this.validator = new DataValidator(this.parts.CONSTELLATION_MAP);
        this.calculationHandler = new CalculationHandler(config);

        this.expandBtn = document.getElementById('expand-button');
        this.expandedMenu = document.getElementById('expandedMenu');
        this.calculateBtn = document.getElementById('calculate-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.startTourBtn = document.getElementById('start-tour-btn');
        this.toggleButtonsBtn = document.getElementById('toggle-buttons-btn');
    }

    initialize() {
        this.validator.initialize();
        initializeTables(this.persistence, this.parts.gachaConfig, this.validator, INITIAL_CONFIG, CONSTELLATION_OPTIONS, SELECTORS);
        initializeTabs();
        this.#setupEventListeners();
        this.#loadStateAndRunInitialCalculation();
    }

    #setupEventListeners() {
        let draggedItem = null;

        if (this.expandBtn) {
            this.expandBtn.addEventListener('click', () => {
                this.expandBtn.classList.toggle('dropdown--open');
                this.expandedMenu.classList.toggle('active');
            });
        }

        const buttons = document.querySelectorAll('.nav-button');

        // Drag and drop functionality
        buttons.forEach(button => {
            button.addEventListener('dragstart', function (e) {
                draggedItem = this;
                setTimeout(() => {
                    this.classList.add('dragging');
                }, 0);
            });

            button.addEventListener('dragend', function () {
                this.classList.remove('dragging');
                draggedItem = null;

                buttons.forEach(btn => {
                    btn.classList.remove('drop-zone');
                });
            });

            button.addEventListener('dragover', function (e) {
                e.preventDefault();
                if (draggedItem && draggedItem !== this) {
                    this.classList.add('drop-zone');
                }
            });

            button.addEventListener('dragleave', function () {
                this.classList.remove('drop-zone');
            });

            button.addEventListener('drop', function (e) {
                e.preventDefault();
                this.classList.remove('drop-zone');

                if (draggedItem && draggedItem !== this) {
                    const draggedParent = draggedItem.parentNode;
                    const targetParent = this.parentNode;

                    const temp1 = document.createElement('div');
                    const temp2 = document.createElement('div');

                    draggedParent.insertBefore(temp1, draggedItem);
                    targetParent.insertBefore(temp2, this);

                    draggedParent.insertBefore(this, temp1);
                    targetParent.insertBefore(draggedItem, temp2);

                    draggedParent.removeChild(temp1);
                    targetParent.removeChild(temp2);

                    saveNavOrder();
                }
            });
        });

        function saveNavOrder() {
            const mainNav = document.querySelector('.nav-list');
            const expandedNav = document.querySelector('.nav-container--expanded .nav-list');

            const order = {
                main: Array.from(mainNav.children).slice(0, -1).map(li => li.querySelector('.nav-button').getAttribute('href')),
                expanded: Array.from(expandedNav.children).map(li => li.querySelector('.nav-button').getAttribute('href'))
            };

            localStorage.setItem('navOrder', JSON.stringify(order));
        }

        function loadNavOrder() {
            const saved = JSON.parse(localStorage.getItem('navOrder'));
            if (!saved) return;

            const mainNav = document.querySelector('.nav-list');
            const expandedNav = document.querySelector('.nav-container--expanded .nav-list');
            const homeButton = mainNav.lastElementChild;

            const allItems = new Map();
            document.querySelectorAll('li').forEach(li => {
                const button = li.querySelector('.nav-button');
                if (button) {
                    allItems.set(button.getAttribute('href'), li);
                }
            });

            const mainItems = Array.from(mainNav.children).slice(0, -1);
            mainItems.forEach(li => li.remove());
            expandedNav.innerHTML = '';

            saved.main.forEach(href => {
                const li = allItems.get(href);
                if (li) mainNav.insertBefore(li, homeButton);
            });

            saved.expanded.forEach(href => {
                const li = allItems.get(href);
                if (li) expandedNav.appendChild(li);
            });
        }
        loadNavOrder();
        const navContainer = document.querySelector('.nav-container');
        navContainer.style.opacity = '1';
        
        if (this.calculateBtn) {
            this.calculateBtn.addEventListener('click', async () => {
                if (this.#runValidation()) {
                    await this.calculationHandler.runCalculation();
                }
            });
        }
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => exportDataAsJson(this.persistence));
        }
        if (this.startTourBtn) {
            this.startTourBtn.addEventListener('click', () => {
                this.tutorial.startTour(zenlessTourSteps);
            });
        }
        const helpButtons = document.querySelectorAll('.help-btn');

        helpButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const helpKey = button.getAttribute('data-help-key') || button.getAttribute('data-tour-step-id');

                if (helpKey && helpContentMap[helpKey]) {
                    const helpConfig = helpContentMap[helpKey];
                    this.tutorial.showHelp(helpConfig, button);
                } else {
                    console.warn(`ChibiTutorial: No help configuration found for key '${helpKey}'.`, button);
                }
            });
        });

        if (this.toggleButtonsBtn) {
            this.toggleButtonsBtn.addEventListener('click', () => {
                const elements = document.querySelectorAll('.help-btn');

                elements.forEach(element => {
                    element.classList.toggle('hidden');
                });

                this.persistence.saveButtons();
            });
        }
    }

    #runValidation() {
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        if (this.validator.isDataValid()) {
            return true;
        }

        console.warn('Validation failed. Calculation blocked.');
        this.validator.validateAll();

        const invalidElements = document.querySelectorAll('.is-invalid');
        const invalidTabButtons = new Set();
        invalidElements.forEach(element => {
            const parentPane = element.closest('.tab-pane');
            if (parentPane) {
                const tabButton = document.querySelector(`.tab-link[data-tab-target="#${parentPane.id}"]`);
                if (tabButton) invalidTabButtons.add(tabButton);
            }
            element.classList.add('flicker');
            element.addEventListener('animationend', () => element.classList.remove('flicker'), { once: true });
        });
        invalidTabButtons.forEach(tabButton => {
            tabButton.classList.add('is-invalid', 'flicker');
            tabButton.addEventListener('animationend', () => tabButton.classList.remove('flicker'), { once: true });
        });

        const firstInvalidTab = Array.from(invalidTabButtons)[0];
        if (firstInvalidTab) firstInvalidTab.click();
        setTimeout(() => {
            invalidElements[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        return false;
    }

    #loadStateAndRunInitialCalculation() {
        const savedInput = this.persistence.loadCalculation();
        const pullPlanData = savedInput ? savedInput.input : null;

        if (savedInput) {
            initializePullPlanManager(this.parts.gachaConfig.paths, pullPlanData);
            initializeTarget(DEFAULTS, savedInput);
            setUpInputPersist(savedInput.persistInput);
        } else {
            initializePullPlanManager(this.parts.gachaConfig.paths);
            initializeTarget(DEFAULTS);
            setUpInputPersist();
        }
        this.calculationHandler.runCalculation();
    }
}