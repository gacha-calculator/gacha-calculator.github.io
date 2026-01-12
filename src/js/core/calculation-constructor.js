export class CalculationHandler {
    constructor({
        getPageConfiguration,
        getLabels,
        getPullPlan,
        getTarget,
        updateChart,
        convertToChartData,
        recalcInputs,
        calculatorFunction,
        calculatorConfig,
        pageConfig,
        postCalculationHooks,
        persistence,
        chibi
    }) {
        this.getPageConfiguration = getPageConfiguration;
        this.getLabels = getLabels;
        this.getPullPlan = getPullPlan;
        this.getTarget = getTarget;

        this.updateChart = updateChart;
        this.convertToChartData = convertToChartData;
        this.recalcInputs = recalcInputs;

        this.calculatorFunction = calculatorFunction;
        this.calculatorConfig = calculatorConfig;
        this.pageConfig = pageConfig;
        this.postCalculationHooks = postCalculationHooks || [];
        this.persistence = persistence;
        this.chibi = chibi;
    }

    async runCalculation() {
        const target = this.getTarget();
        const inputConfig = this.getPageConfiguration(
            this.calculatorConfig.CONSTELLATION_MAP,
            this.calculatorConfig.gachaConfig,
            this.pageConfig.SELECTORS,
            this.pageConfig.INITIAL_CONFIG
        );
        const chartLabels = this.getLabels(this.calculatorConfig.gachaConfig.paths);
        if (chartLabels.length > 99) {
            this.chibi.showError('Too many items! Even I can\'t calculate so quickly, maximum 99 items allowed.');
            return;
        }
        const results = await this.calculatorFunction(inputConfig, target);
        const converted = this.convertToChartData(results.chartData);

        this.updateChart(converted.data, converted.labels, chartLabels);
        this.recalcInputs(converted.data);

        const context = {
            results,
            inputConfig,
            chartLabels,
            gachaConfig: this.calculatorConfig.gachaConfig,
            CONSTELLATION_MAP: this.calculatorConfig.CONSTELLATION_MAP
        };

        this.postCalculationHooks.forEach(hook => hook(context));

        if (this.persistence) {
            this.saveData();
        }
    }

    saveData() {
        const pull = parseInt(document.querySelector('[data-control="pulls"]').value);
        const prob = parseInt(document.querySelector('[data-control="probability"]').value);
        const row = document.querySelector('.row');
        let pageType = row.querySelector('.dropdown .dropdown__header .type-text');
        let storageKey;
        if (pageType) {
            pageType = pageType.textContent;
            storageKey = pageType.trim().toLowerCase().replace(/\s+/g, '_');
        }

        const calculationData = {
            input: this.getPullPlan(),
            targetProb: prob,
            targetPull: pull,
            persistInput: document.querySelector('.mode-label.active').getAttribute('data-target')
        };

        this.persistence.saveCalculation(calculationData, storageKey);
        this.persistence.saveButtons();
        this.persistence.savePageType(pageType);
    }
}