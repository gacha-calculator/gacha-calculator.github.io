import { CalculationHandler } from '../../core/calculation-constructor.js';
import { exportDataAsJson } from "../../ui/data-action.js";
import { PullPlanManager } from "../../ui/pull-plan.js";
import { initializeTables, restorePityTable } from "./endfield-initialize-inputs.js";
import { initializeTarget, initializeButtons } from "../../ui/initialize-inputs.js";
import { setUpInputPersist } from "../../ui/input-persist.js";
import { createPersistence } from "../../core/save-input.js";
import { DataValidator } from './endfield-data-validator.js';
import { createCashbackHook } from '../../core/hooks.js';
import { initializeTabs } from "../../ui/tabs.js";
import { manageHeader } from "../../ui/header.js";
import { ChibiTutorial } from '../../ui/chibi-tutorial.js';
import { chibiHtmlFragment, endfieldTourSteps, helpContentMap } from './tutorial-config.js';
import { getLabels, getTarget } from "../../core/get-input.js";
import { getPageConfiguration, getPullPlan } from "./endfield-get-input.js";
import { updateChart, convertToChartData } from "../../ui/chart-configs.js";
import { recalcInputs } from "../../ui/recalc-inputs.js";
import { SELECTORS, INITIAL_CONFIG, DEFAULTS } from './page-config.js';

export class EndfieldPageController {
    constructor(parts) {
        this.parts = parts;
        this.persistence = createPersistence('endfield', SELECTORS);
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
                gachaConfig: this.parts.gachaConfig
            },
            pageConfig: {
                SELECTORS,
                INITIAL_CONFIG
            },
            postCalculationHooks: [cashbackHook],
            persistence: this.persistence,
            chibi: this.tutorial
        };

        this.validator = new DataValidator();
        this.calculationHandler = new CalculationHandler(config);

        this.calculateBtn = document.getElementById('calculate-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.startTourBtn = document.getElementById('start-tour-btn');
        this.toggleButtonsBtn = document.getElementById('toggle-buttons-btn');
    }

    initialize() {
        const type = this.persistence.loadPageType().type;
        const header = document.querySelector('.dropdown__header');
        const typeText = header.querySelector('.type-text');
        const typeIcon = header.querySelector('.type-icon');
        if (type) {
            typeText.textContent = type;
            if (type === 'Character') {
                typeIcon.src = `/images/Icon_${type}.png`;
            } else {
                typeIcon.src = `/images/Icon_Claymore.jpg`;
            }
        }

        initializeTables(this.persistence, this.parts.gachaConfig, this.validator, type);
        initializeTabs();
        initializeButtons(this.persistence);

        this.validator.initialize();
        this.#setupEventListeners();
        this.#loadStateAndRunInitialCalculation(type);
        this.#setupPageTypeChanger();
        this.tutorial.showTutorialIfNeeded(endfieldTourSteps);
    }

    #setupEventListeners() {
        manageHeader();
        this.isCalculating = false;

        if (this.calculateBtn) {
            this.calculateBtn.addEventListener('click', async () => {
                if (this.isCalculating || !this.#runValidation()) {
                    return;
                }

                if (window.goatcounter) {
                    window.goatcounter.count({
                        path: '/endfield-calculation-initiated',
                        title: 'Endfield Calculation Initiated'
                    });
                }

                this.isCalculating = true;
                this.calculateBtn.disabled = true;

                try {
                    await this.calculationHandler.runCalculation();
                } finally {
                    this.isCalculating = false;
                    this.calculateBtn.disabled = false;
                }
            });
        }
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => exportDataAsJson(this.persistence));
        }
        if (this.startTourBtn) {
            this.startTourBtn.addEventListener('click', () => {
                this.tutorial.startTour(endfieldTourSteps);
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
                if (tabButton) {
                    invalidTabButtons.add(tabButton);
                }
            }
            element.classList.add('flicker');
            element.addEventListener('animationend', () => element.classList.remove('flicker'), { once: true });
        });
        invalidTabButtons.forEach(tabButton => {
            tabButton.classList.add('is-invalid', 'flicker');
            tabButton.addEventListener('animationend', () => tabButton.classList.remove('flicker'), { once: true });
        });
        const firstInvalidTab = Array.from(invalidTabButtons)[0];
        if (firstInvalidTab) {
            firstInvalidTab.click();
        }
        setTimeout(() => {
            invalidElements[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return false;
    }

    #setupPageTypeChanger() {
        const row = document.querySelector('.row');
        const dropdown = row.querySelector('.dropdown');
        const typeSelector = row.querySelector('.type-selector');

        // Single dropdown handler
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('dropdown--open');
        });

        // Single item click handler
        row.querySelectorAll('.dropdown__item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                typeSelector.value = item.dataset.value;
                typeSelector.dispatchEvent(new Event('change'));
                dropdown.classList.remove('dropdown--open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('dropdown--open');
            }
        });
        typeSelector.addEventListener('change', () => {
            const selectedOption = typeSelector.options[typeSelector.selectedIndex];
            const typeIcon = row.querySelector('.type-icon');
            const typeText = row.querySelector('.type-text');

            typeIcon.src = selectedOption.dataset.icon;
            typeText.textContent = selectedOption.textContent;

            this.#pageTypeSwitch(typeText.textContent);
        });
    }

    #pageTypeSwitch(type) { // load char/wep table(change values including name)
        document.querySelector('.banner-name').textContent = type;
        document.querySelector('[data-banner]').dataset.banner = type;

        const savedTables = this.persistence.loadTables(type);
        restorePityTable(savedTables.pity);
        this.persistence.init(type);
        this.#loadStateAndRunInitialCalculation(type);
    }

    #loadStateAndRunInitialCalculation(type) {
        let storageKey;
        if (type) {
            storageKey = type.trim().toLowerCase().replace(/\s+/g, '_');
        }
        const savedInput = this.persistence.loadCalculation(storageKey);
        const pullPlanData = savedInput ? savedInput.input : null;
        if (savedInput) {
            initializePullPlanManagerEndfield(this.parts.gachaConfig.paths, pullPlanData);
            initializeTarget(DEFAULTS, savedInput);
            setUpInputPersist(savedInput.persistInput);
        } else {
            initializePullPlanManagerEndfield(this.parts.gachaConfig.paths);
            initializeTarget(DEFAULTS);
            setUpInputPersist();
        }
        this.calculationHandler.runCalculation();
    }
}

export function initializePullPlanManagerEndfield(pathsConfig, savedData = null) {
    const manager = new PullPlanManagerEndfield(pathsConfig, savedData);
    return manager.initialize();
}

class PullPlanManagerEndfield extends PullPlanManager {
    constructor(pathsConfig, savedData = null) {
        super(pathsConfig, savedData || null);
    }

    createRow(inheritFrom = null, savedData = null) {
        const row = super.createRow(inheritFrom, savedData);
        this.initializeCounterToRow(row, savedData);
        return row;
    }

    initializeCounterToRow(row, savedData) {
        const standardLimitedCharCounter = row.querySelector('[data-control="standard-limited-counter"]');
        if (standardLimitedCharCounter === null) {
            return;
        }

        if (savedData) {
            if (standardLimitedCharCounter && savedData.standardLimitedCharCounter !== undefined) standardLimitedCharCounter.value = savedData.standardLimitedCharCounter;
        }
        standardLimitedCharCounter.addEventListener('input', function () {
            let value = this.value;

            if (value.length > 1 && value.startsWith('0')) {
                this.value = value.replace(/^0+/, '');
            }
            if (this.value === '') this.value = '0';

            let numValue = parseInt(this.value) || 0;
            if (numValue > standardLimitedCharCounter.max) {
                this.value = standardLimitedCharCounter.max;
                errorAnimation(this);
            } else if (numValue < standardLimitedCharCounter.min) {
                this.value = standardLimitedCharCounter.min;
                errorAnimation(this);
            }
        });

        standardLimitedCharCounter.addEventListener('focus', () => {
            standardLimitedCharCounter.select();
        });

        standardLimitedCharCounter.addEventListener('keydown', (event) => {
            if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                return;
            }

            if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
                return;
            }

            if (!/^\d$/.test(event.key)) {
                event.preventDefault();
            }
        });

        standardLimitedCharCounter.addEventListener('paste', (event) => {
            const pasteData = (event.clipboardData || window.clipboardData).getData('text');

            if (!/^\d+$/.test(pasteData)) {
                event.preventDefault();
            }
        });

        standardLimitedCharCounter.addEventListener('drop', (event) => {
            event.preventDefault();
        });
    }

    initializeFromSavedData(row, savedData) {
        const standardLimitedCharCounter = row.querySelector('[data-control="standard-limited-counter"]');
        const typeSelector = row.querySelector('.type-selector');
        standardLimitedCharCounter.value = savedData.counter || 0;
        typeSelector.value = savedData.type || 'char';
        this.updateVisualType(row, typeSelector.value);

        this.setGroupAndColor(row, savedData.group);
        this.updatePathSelector(row, typeSelector.value, savedData.from, savedData.to);
    }

    initializeNewRow(row) {
        const initialType = document.querySelector('.type-text').textContent === 'Character' ? 'char' : 'wep';
        row.dataset.group = `unique${initialType.charAt(0).toUpperCase() + initialType.slice(1)}`;
        row.style.setProperty('--group-color', this.COLORS.UNIQUE_GROUP);
        this.updatePathSelector(row, initialType);
    }
}

function errorAnimation(inputElement) {
    inputElement.style.borderColor = '#a71919';
    inputElement.style.outline = '1px solid #a71919';

    inputElement.classList.add('flicker');
    setTimeout(() => {
        inputElement.classList.remove('flicker');
        inputElement.style.borderColor = '';
        inputElement.style.outline = '';
    }, 500);
}