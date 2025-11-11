export function createCashbackHook(dependencies) {
    const { cashbackCalculator, uiUpdater } = dependencies;

    return function cashbackHook(context) {
        const { results, inputConfig, chartLabels, gachaConfig, CONSTELLATION_MAP} = context;

        const CASH_BACK = cashbackCalculator(
            inputConfig,
            gachaConfig,
            results.cashbackData.SSR,
            results.cashbackData.SR,
            inputConfig.SR.rateUps,
            CONSTELLATION_MAP
        );

        uiUpdater(results.cashbackData.SSR, chartLabels, CASH_BACK);
    };
}

export function createSaveCalculationHook(persistence) {
    return function saveCalculationHook(context) {
        const { pullPlan, inputConfig, targetPull, activeMode } = context;

        persistence.saveCalculation({
            input: pullPlan,
            targetProb: inputConfig.targetProb,
            targetPull: targetPull,
            persistInput: activeMode
        });
    };
}