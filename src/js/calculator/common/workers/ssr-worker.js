let isInitialized = false;
let distribution = null;
let context = null;
let iterationCount = 0;
const PRUNE_EVERY_N = 10;
let allPullsDistributionSSR = [];

let pullLogicModule;
let helpersModule;

self.onmessage = function (e) {
    switch (e.data?.type) {
        case 'Iterate':
            iterationCount++;
            const currentLossData = pullLogicModule.rankUpSSR(distribution, context.ODDS_CHARACTER_SSR, context.ODDS_WEAPON_SSR, context.SSR_CHAR_PITY, context.SSR_WEP_PITY, context.pities);
            if (iterationCount === PRUNE_EVERY_N) {
                helpersModule.pruneAndNormalize(distribution);
                iterationCount = 0;
            }
            allPullsDistributionSSR.push(helpersModule.consolidateProbabilities(distribution));
            const isTarget = helpersModule.checkIsTarget(distribution, context.target, allPullsDistributionSSR.length);
            let isEmpty = false;
            if (!isTarget) {
                isEmpty = helpersModule.checkIsEmpty(distribution, isTarget);
            }

            if (isEmpty || isTarget) {
                if (iterationCount != PRUNE_EVERY_N) {
                    helpersModule.pruneAndNormalize(distribution);
                }
                self.postMessage({ type: 'LastIteration', lossData: currentLossData, isEmpty: isEmpty, isTarget: isTarget, allPullsDistributionSSR: [...allPullsDistributionSSR], distributionSSR: distribution });
            } else {
                self.postMessage({ type: 'IterationComplete', lossData: currentLossData });
            }
            break;
        case 'Initiate':
            Promise.all([
                import(`../../../games/${e.data.context.moduleType.pullLogic}/${e.data.context.moduleType.pullLogic}-pull-logic.js`),
                import(`../../../games/${e.data.context.moduleType.helpers}/${e.data.context.moduleType.helpers}-helpers.js`)
            ]).then(([pullLogic, commonHelpers]) => {
                pullLogicModule = pullLogic;
                helpersModule = commonHelpers;

                distribution = e.data.distribution;
                context = e.data.context.contextSSR;
                isInitialized = true;
                self.postMessage({ type: 'InitComplete' });
            }).catch(error => {
                console.error('Failed to load modules:', error);
                self.postMessage({ type: 'InitError', error: error.message });
            });
            break;
        default:
            console.warn('Unknown type:', e.data?.type);
    }
};
self.onerror = function (error) {
    console.error('Worker error:', error);
};