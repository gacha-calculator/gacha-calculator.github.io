import { chebyshevInequiality, aggregateCashbackFromRateUpCombos, combineIndependentCashback } from '../../calculator/common/cashback/cashback-helpers.js';
import { getCombosSSR, calculateComboCashbackSSR, aggregateCashbackFromSR } from './cashback-helpers.js';
import { IterativeSolver } from '../../calculator/common/cashback/solvers.js';

const PROBABILITY_THRESHOLD = 1e-8;

export function cashback(inputConfig, gachaConfig, probabilitiesSSR, probabilitiesCharSR) {
    probabilitiesSSR = normalizeDistribution(probabilitiesSSR);
    const Standards = gachaConfig.poolStandardCharSSR + gachaConfig.poolStandardLimitedCharSSR;
    const SSRCashback = cashbackSSR(probabilitiesSSR, Standards, inputConfig.SSR.consCountStandard, inputConfig.SSR.cashbackRoadmap, gachaConfig, inputConfig.pull, inputConfig.SSR.consCountLimitedStandard);
    //const SRCashback = cashbackSR(probabilitiesCharSR, gachaConfig, inputConfig);

    const finalCashback = SSRCashback;
    for (let i = 0; i < finalCashback.length; i++) {
        //finalCashback[i].mean += SRCashback.mean;
        //finalCashback[i].variance += SRCashback.variance;
        finalCashback[i] = chebyshevInequiality(finalCashback[i]);
    }

    return finalCashback;
}

function normalizeDistribution(distribution) {
    let probSum = 0;
    for (const map of distribution) {
        for (const [key, value] of map.offRates) {
            probSum += value.prob;
        }
    }
    for (const map of distribution) {
        for (const [key, value] of map.offRates) {
            value.prob /= probSum;
        }
    }
    return distribution;
}

function cashbackSSR(probabilitiesSSR, standardPool, standardCons, cashbackRoadmap, gachaConfig, pull, consCountLimitedStandard) {
    const Extras = Math.trunc((pull - 120) / 240)
    const { combos: offRateCharCombos, maxOffRateCount: maxOffRateCharCount } = getCombosSSR(probabilitiesSSR, PROBABILITY_THRESHOLD, Extras);
    const rateUpCashback = [0];
    let cashbackSum = 0;

    for (let i = 0; i < probabilitiesSSR.length; i++) {
        if (cashbackRoadmap[i - 1] === 'none') {
            rateUpCashback.push(cashbackSum);
        } else if (cashbackRoadmap[i - 1] === 'regular') {
            cashbackSum += gachaConfig.configSSR.regularPoints;
            rateUpCashback.push(cashbackSum);
        }
    }

    const allCombos = Array.from({ length: probabilitiesSSR.length }, () => []);

    for (const combo of offRateCharCombos) {
        const currentRateUp = combo.rateUpCount + Extras;
        const probability = combo.probability;
        const lost5050Config = { maxType: gachaConfig.configSSR.maxType, regularPoints: gachaConfig.configSSR.regularPoints, specialPoints: gachaConfig.configSSR.regularPoints }

        const offRateSolver = new IterativeSolver(standardCons, standardPool, lost5050Config);
        const offRateCharCashback = offRateSolver.runSteps(maxOffRateCharCount);
        const comboCashback = calculateComboCashbackSSR(combo, rateUpCashback, offRateCharCashback); // calcs absolute mean, can do rate ups detemenisticly
        allCombos[currentRateUp].push({ cashback: comboCashback, probability });
    }

    for (let i = 0; i < allCombos.length; i++) {
        const normalizedCombo = normalizeCashbackCombo(allCombos[i])
        allCombos[i] = aggregateCashbackFromRateUpCombos(normalizedCombo);
    }

    return allCombos;
}

function cashbackSR(probabilitiesCharSR, gachaConfig, inputConfig) {
    let maxCharsSRCount = 0;
    for (const [key, value] of probabilitiesCharSR[0].offRates) {
        maxCharsSRCount = Math.max(maxCharsSRCount, key);
    }
    const charCashback = processCharacterBannerSR(probabilitiesCharSR, maxCharsSRCount, gachaConfig, inputConfig);

    return charCashback;
}

function processCharacterBannerSR(probabilitiesCharSR, maxCharsSRCount, gachaConfig, inputConfig) {
    const charsSRSolver = new IterativeSolver(inputConfig.SR.consCount, gachaConfig.poolCharSR, gachaConfig.configSR);
    const charsSRCharCashback = charsSRSolver.runSteps(maxCharsSRCount);

    return aggregateCashbackFromSR(probabilitiesCharSR, charsSRCharCashback);
}

function normalizeCashbackCombo(distribution) {
    let probabilitySum = 0;
    for (const element of distribution) {
        probabilitySum += element.probability;
    }
    for (const element of distribution) {
        element.probability /= probabilitySum;
    }
    return distribution;
}