import { CalculationHandler } from './morimens-calculation-constructor.js';
import { initializePullPlanManagerWithPity } from "../../ui/pull-plan.js";
import { initializeTables } from './morimens-initialize-inputs.js';
import { initializeTarget, initializeButtons } from "../../ui/initialize-inputs.js";
import { setUpInputPersist } from "../../ui/input-persist.js";
import { createPersistence } from "../../core/save-input.js";
import { initializeTabs } from "../../ui/tabs.js";
import { manageHeader } from "../../ui/header.js";
import { updateChart, convertToChartData } from "../../ui/chart-configs.js";
import { exportDataAsJson } from "../../ui/data-action.js";
import { getLabels, getTarget } from "../../core/get-input.js";
import { getPageConfiguration, getPullPlan } from "./morimens-get-input.js";
import { recalcInputs } from "../../ui/recalc-inputs.js";
import { SELECTORS, INITIAL_CONFIG, DEFAULTS } from './page-config.js';
import { ChibiTutorial } from '../../ui/chibi-tutorial.js';
import { chibiHtmlFragment, morimensTourSteps, helpContentMap } from './tutorial-config.js';

export class morimensPageController {
    constructor(parts) {
        this.parts = parts;
        this.persistence = createPersistence('morimens', SELECTORS);

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
            persistence: this.persistence,
            chibi: this.tutorial
        };
        this.calculationHandler = new CalculationHandler(config);

        this.calculateBtn = document.getElementById('calculate-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.startTourBtn = document.getElementById('start-tour-btn');
        this.toggleButtonsBtn = document.getElementById('toggle-buttons-btn');
    }

    initialize() {
        initializeTables(this.persistence, this.parts.gachaConfig, this.validator, INITIAL_CONFIG, SELECTORS);
        initializeTabs();
        initializeButtons(this.persistence);

        const allInputs = document.querySelectorAll('input[type="number"]');

        allInputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.select();
            });
        });

        allInputs.forEach(input => {
            input.addEventListener('keydown', (event) => {
                if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
                    return;
                }
                if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
                    return;
                }
                if (!/^\d$/.test(event.key)) {
                    event.preventDefault();
                }
            });
        });

        this.#setupEventListeners();
        this.#loadStateAndRunInitialCalculation();
        this.tutorial.showTutorialIfNeeded(morimensTourSteps);
    }

    #setupEventListeners() {
        manageHeader();
        this.isCalculating = false;

        if (this.calculateBtn) {
            this.calculateBtn.addEventListener('click', async () => {
                if (this.isCalculating) {
                    return;
                }

                if (window.goatcounter) {
                    window.goatcounter.count({
                        path: '/morimens-calculation-initiated',
                        title: 'Morimens Calculation Initiated'
                    });
                }

                this.isCalculating = true;
                this.calculateBtn.disabled = true;

                try {
                    await this.calculationHandler.runCalculation(this.parts.updateTableFn);
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
                this.tutorial.startTour(morimensTourSteps);
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

    #loadStateAndRunInitialCalculation() {
        const savedInput = this.persistence.loadCalculation();
        const pullPlanData = savedInput ? savedInput.input : null;

        if (savedInput) {
            initializePullPlanManagerWithPity(this.parts.gachaConfig.paths, pullPlanData);
            initializeTarget(DEFAULTS, savedInput);
            setUpInputPersist(savedInput.persistInput);
        } else {
            initializePullPlanManagerWithPity(this.parts.gachaConfig.paths);
            initializeTarget(DEFAULTS);
            setUpInputPersist();
        }
        this.calculationHandler.runCalculation(this.parts.updateTableFn);
    }
}