import { chebyshevInequiality, aggregateCashbackFromRateUpCombos, combineIndependentCashback } from '../../calculator/common/cashback/cashback-helpers.js';
import { getCombosSSR, calculateComboCashbackSSR, calculateComboCashbackSSRWeapon, aggregateCashbackFromSR } from './cashback-helpers.js';
import { IterativeSolver } from '../../calculator/common/cashback/solvers.js';

const PROBABILITY_THRESHOLD = 1e-8;

export function cashback(inputConfig, gachaConfig, SSRCashbackData, probabilitiesCharSR) {
    const finalCashback = {};
    if (SSRCashbackData.isCashback) {
        SSRCashbackData.cashbackDataSSRAggregate = normalizeDistribution(SSRCashbackData.cashbackDataSSRAggregate);
        SSRCashbackData.cashbackDataSSRPerItem = normalizeDistribution(SSRCashbackData.cashbackDataSSRPerItem);
        const { allCombos: SSRCashback, allCombosWeapon: SSRWeaponCashback } = cashbackSSR(SSRCashbackData, inputConfig.SSR.consCountStandard, inputConfig.SSR.cashbackRoadmap, gachaConfig, inputConfig.SSR.consCountLimitedStandard);
        const { charCashback: SRCashback, wepCashback: SRAndRCashbackWeapon } = cashbackSR(probabilitiesCharSR, gachaConfig, inputConfig);

        finalCashback.char = SSRCashback;
        for (let i = 0; i < finalCashback.char.length; i++) {
            finalCashback.char[i].mean += SRCashback.mean;
            finalCashback.char[i].variance += SRCashback.variance;
            finalCashback.char[i] = chebyshevInequiality(finalCashback.char[i]);
        }

        finalCashback.wep = SSRWeaponCashback;
        for (let i = 0; i < finalCashback.wep.length; i++) {
            finalCashback.wep[i].mean += SRAndRCashbackWeapon.mean;
            finalCashback.wep[i].variance += SRAndRCashbackWeapon.variance;
            finalCashback.wep[i] = chebyshevInequiality(finalCashback.wep[i]);
        }
    } else {
        finalCashback.char = new Array(SSRCashbackData.probDistr.length).fill({});
        finalCashback.wep = new Array(SSRCashbackData.probDistr.length).fill({});
        finalCashback.char[0].MEAN = 'N/A';
        finalCashback.char[0].LOWER_BOUND = 'N/A';
        finalCashback.char[0].UPPER_BOUND = 'N/A';
        finalCashback.wep[0].MEAN = 'N/A';
        finalCashback.wep[0].LOWER_BOUND = 'N/A';
        finalCashback.wep[0].UPPER_BOUND = 'N/A';
    }

    return finalCashback;
}

function normalizeDistribution(distribution) {
    let probSum = 0;
    for (const map of distribution) {
        for (const [key, value] of map) {
            probSum += value.prob;
        }
    }
    for (const map of distribution) {
        for (const [key, value] of map) {
            value.prob /= probSum;
        }
    }
    return distribution;
}

function cashbackSSR(probabilitiesSSR, standardCons, cashbackRoadmap, gachaConfig, consCountLimitedStandard) {
    const lost5050Config = { maxType: gachaConfig.configSSR.maxType, regularPoints: gachaConfig.configSSR.regularPoints, specialPoints: gachaConfig.configSSR.regularPoints }
    const globalSolver = new IterativeSolver(standardCons, gachaConfig.poolStandardCharSSR, lost5050Config);
    const globalCharCashback = globalSolver.runSteps(45);
    const localCharCashback = [];
    for (let i = 0; i < consCountLimitedStandard.length; i++) {
        const currentSolver = new IterativeSolver([2 - consCountLimitedStandard[i], consCountLimitedStandard[i]], gachaConfig.poolStandardLimitedCharSSR, lost5050Config);
        localCharCashback.push(currentSolver.runSteps(22));
    }

    const { combos: offRateCharCombos, maxOffRateCount: maxOffRateCharCount } = getCombosSSR(probabilitiesSSR, PROBABILITY_THRESHOLD, cashbackRoadmap, globalCharCashback, localCharCashback);
    const ssrWeapCashback = 2000 / 1980;
    let sum = 0;
    for (const combo of offRateCharCombos) {
        sum += combo.probability;
    }
    const len = probabilitiesSSR.bannerCounts.length;
    const rateUpCashback = [0];
    const rateUpCashbackWeapon = [0];
    let cashbackSum = 0;
    let cashbackSumWeapon = 0;
    for (let i = 0; i < len; i++) {
        if (cashbackRoadmap[i - 1] === 'regular') {
            cashbackSum += gachaConfig.configSSR.regularPoints;
            cashbackSumWeapon += ssrWeapCashback;
            rateUpCashback.push(cashbackSum);
            rateUpCashbackWeapon.push(cashbackSumWeapon);
        }
    }

    const allCombos = Array.from({ length: len }, () => []);

    for (const combo of offRateCharCombos) {
        const currentRateUp = combo.rateUpCount;
        const probability = combo.probability; // rateUpCashback should have weapon version
        const comboCashback = calculateComboCashbackSSR(combo, rateUpCashback); // calcs absolute mean, can do rate ups detemenisticly
        allCombos[currentRateUp].push({ cashback: comboCashback, probability });
    }

    for (let i = 0; i < allCombos.length; i++) {
        const normalizedCombo = normalizeCashbackCombo(allCombos[i]);
        allCombos[i] = aggregateCashbackFromRateUpCombos(normalizedCombo);
    }

    const allCombosWeapon = Array.from({ length: len }, () => []);
    const weaponCurrencyCashback = [{ mean: 0, variance: 0 }];
    cashbackSumWeapon = 0;
    for (let i = 0; i < maxOffRateCharCount; i++) {
        cashbackSumWeapon += ssrWeapCashback;
        weaponCurrencyCashback.push({ mean: cashbackSumWeapon, variance: 0 })
    }

    for (const combo of offRateCharCombos) {
        const currentRateUp = combo.rateUpCount;
        const probability = combo.probability; // rateUpCashback should have weapon version
        const comboCashback = calculateComboCashbackSSRWeapon(combo, rateUpCashbackWeapon, weaponCurrencyCashback); // calcs absolute mean, can do rate ups detemenisticly
        allCombosWeapon[currentRateUp].push({ cashback: comboCashback, probability });
    }

    for (let i = 0; i < allCombosWeapon.length; i++) {
        const normalizedCombo = normalizeCashbackCombo(allCombosWeapon[i]);
        allCombosWeapon[i] = aggregateCashbackFromRateUpCombos(normalizedCombo);
    }

    return { allCombos, allCombosWeapon };
}

function cashbackSR(probabilitiesCharSR, gachaConfig, inputConfig) {
    let maxCharsSRCount = 0;
    for (const [key, value] of probabilitiesCharSR) {
        maxCharsSRCount = Math.max(maxCharsSRCount, key);
    }
    const { charCashback, wepCashback } = processCharacterBannerSR(probabilitiesCharSR, maxCharsSRCount, gachaConfig, inputConfig);

    return { charCashback, wepCashback };
}

function processCharacterBannerSR(probabilitiesCharSR, maxCharsSRCount, gachaConfig, inputConfig) {
    const charsSRSolver = new IterativeSolver(inputConfig.SR.consCount, gachaConfig.poolCharSR, gachaConfig.configSR);
    const charsSRCharCashback = charsSRSolver.runSteps(maxCharsSRCount);

    return aggregateCashbackFromSR(probabilitiesCharSR, charsSRCharCashback, inputConfig.pull);
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