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

    async runCalculation(isCashback, signal) {
        const target = this.getTarget();
        const inputConfig = this.getPageConfiguration(
            this.calculatorConfig.CONSTELLATION_MAP,
            this.calculatorConfig.gachaConfig,
            this.pageConfig.SELECTORS,
            this.pageConfig.INITIAL_CONFIG
        );
        const chartLabels = this.getLabels(this.calculatorConfig.gachaConfig.paths);
        if (chartLabels.length > 99) {
            this.chibi.showError('Too many items! Even I can\'t calculate so quickly! Maximum 99 items allowed.');
            return;
        }
        const results = await this.calculatorFunction(inputConfig, target, isCashback, signal);
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
        const resPull = parseInt(document.querySelector('[data-control="pulls-result"]').value);
        const resProb = parseInt(document.querySelector('[data-control="probability-result"]').value);
        const wishes = parseInt(document.querySelector('[data-control="wishes"]').value);
        const currency = parseInt(document.querySelector('[data-control="currency"]').value);
        const premiumCurrency = parseInt(document.querySelector('[data-control="premium_currency"]').value);
        const cashbackCurrency = parseInt(document.querySelector('[data-control="cashback_currency"]').value);
        const row = document.querySelector('.row');
        let pageType = row.querySelector('.dropdown .dropdown__header .type-text');

        const calculationData = {
            input: this.getPullPlan(),
            wishes: wishes,
            currency: currency,
            cashbackCurrency: cashbackCurrency,
            premiumCurrency: premiumCurrency,
            targetPull: pull,
            resultProb: resProb,
            targetProb: prob,
            resultPull: resPull,
            persistInput: document.querySelector('.mode-tab.is-active')?.dataset.target ?? 'pulls'
        };

        let storageKey;
        if (pageType) { // ie if endfield, so I'm gonna do a naughty thing here...
            pageType = pageType.textContent;
            storageKey = pageType.trim().toLowerCase().replace(/\s+/g, '_');

            const issuesInput = parseInt(document.querySelector('[data-control="pulls_weapon"]').value);
            const currencyWeapon = parseInt(document.querySelector('[data-control="arsenal_ticket"]').value);
            const premiumCurrencyWeapon = parseInt(document.querySelector('[data-control="premium_currency_weapon"]').value);
            calculationData.issuesInput = issuesInput;
            calculationData.currencyWeapon = currencyWeapon;
            calculationData.premiumCurrencyWeapon = premiumCurrencyWeapon;
            this.persistence.savePageType(pageType);
        }

        this.persistence.saveCalculation(calculationData, storageKey);
        this.persistence.saveButtons();
    }
}