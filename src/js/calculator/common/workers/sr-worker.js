let isInitialized = false;
let distributionChar = null;
let distributionWep = null;
let context = null;
let iterationCount = 0;
let charRankUps;
let wepRankUps;
let shouldPrune;
const PRUNE_EVERY_N = 10;

let pullLogicModule;
let helpersModule;

self.onmessage = function (e) {
    switch (e.data?.type) {
        case 'Iterate':
            if (!isInitialized) {
                self.postMessage({ type: 'Error', message: 'Not initialized' });
                return;
            }
            iterationCount++;
            shouldPrune = iterationCount === PRUNE_EVERY_N;
            charRankUps = e.data.lossData.charRankUps;
            wepRankUps = e.data.lossData.wepRankUps;

            if (charRankUps.pullsSum > 0) {
                pullLogicModule.rankUpSR(distributionChar, charRankUps, context.ODDS_SR, context.SR_PITY);
                if (shouldPrune) {
                    helpersModule.pruneAndNormalize(distributionChar);
                }
            }
            if (wepRankUps.pullsSum > 0) {
                pullLogicModule.rankUpSR(distributionWep, wepRankUps, context.ODDS_SR, context.SR_PITY);
                if (shouldPrune) {
                    helpersModule.pruneAndNormalize(distributionWep);
                }
            }
            if (shouldPrune) {
                iterationCount = 0;
            }
            self.postMessage({ type: 'IterationComplete' });
            break;
        case 'IterateLast':
            if (!isInitialized) {
                self.postMessage({ type: 'Error', message: 'Not initialized' });
                return;
            }
            charRankUps = e.data.lossData.charRankUps;
            wepRankUps = e.data.lossData.wepRankUps;
            if (charRankUps.pullsSum > 0) {
                if (!shouldPrune) {
                    helpersModule.pruneAndNormalize(distributionChar);
                }
                pullLogicModule.rankUpSR(distributionChar, charRankUps, context.ODDS_SR, context.SR_PITY);
            }
            if (wepRankUps.pullsSum > 0) {
                if (!shouldPrune) {
                    helpersModule.pruneAndNormalize(distributionWep);
                }
                pullLogicModule.rankUpSR(distributionWep, wepRankUps, context.ODDS_SR, context.SR_PITY);
            }
            self.postMessage({ type: 'LastIteration', distributionCharSR: distributionChar, distributionWepSR: distributionWep });
            break;
        case 'Initiate':
            Promise.all([
                import(`../../../games/${e.data.context.moduleType.pullLogic}/${e.data.context.moduleType.pullLogic}-pull-logic.js`),
                import(`../../../games/${e.data.context.moduleType.helpers}/${e.data.context.moduleType.helpers}-helpers.js`)
            ]).then(([pullLogic, commonHelpers]) => {
                pullLogicModule = pullLogic;
                helpersModule = commonHelpers;

                distributionChar = e.data.distribution.distributionCharSR;
                distributionWep = e.data.distribution.distributionWepSR;
                context = e.data.context.contextSR;
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