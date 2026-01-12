import { processKnownPicks, getCombinationsWithKnownValues, calculateProbabilityWithKnownValues, calculateOffRateCashback, calculateComboCashbackSSR, chebyshevInequiality, getCombosSSR, getCombosSR, combineCashbackFromItemCombos, aggregateCashbackFromRateUpCombos, combineIndependentCashback } from "./cashback-helpers.js";
import { IterativeSolver } from "./solvers.js";

const CHAR_WEAPON_SPLIT_PROBABILITY = 0.5;
const PROBABILITY_THRESHOLD = 1e-8;

export function cashback(inputConfig, gachaConfig, probabilitiesSSR, probabilitiesCharSR, probabilitiesWepSR, knownCharSRCombos, CONSTELLATION_MAP) {
    probabilitiesSSR = normalizeDistribution(probabilitiesSSR);
    knownCharSRCombos = processKnownPicks(inputConfig.SR.consCount, knownCharSRCombos, CONSTELLATION_MAP);
    const charSRCombos = getCombinationsWithKnownValues(inputConfig.SR.consCount, gachaConfig.rateUpCharacterSR, knownCharSRCombos);
    calculateProbabilityWithKnownValues(charSRCombos, inputConfig.SR.consCount, knownCharSRCombos);
    const SSRCashback = cashbackSSR(probabilitiesSSR, gachaConfig.poolStandardCharSSR, inputConfig.SSR.consCountStandard, inputConfig.SSR.cashbackRoadmap, gachaConfig);
    const SRCashback = cashbackSR(charSRCombos, probabilitiesCharSR, probabilitiesWepSR, gachaConfig, inputConfig);

    const finalCashback = SSRCashback;
    for (let i = 0; i < finalCashback.length; i++) {
        finalCashback[i].mean += SRCashback.mean;
        finalCashback[i].variance += SRCashback.variance;
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

function cashbackSSR(probabilitiesSSR, standardPool, standardCons, cashbackRoadmap, gachaConfig) {
    const { combos: offRateCharCombos, maxOffRateCount: maxOffRateCharCount } = getCombosSSR(probabilitiesSSR, PROBABILITY_THRESHOLD);
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
        const currentRateUp = combo.rateUpCount;
        const probability = combo.probability;

        const offRateSolver = new IterativeSolver(standardCons, standardPool, gachaConfig.configSSR);
        const offRateCharCashback = offRateSolver.runSteps(maxOffRateCharCount);
        const comboCashback = calculateComboCashbackSSR(combo, rateUpCashback, offRateCharCashback, gachaConfig.configWep.pointsSSR); // calcs absolute mean, can do rate ups detemenisticly
        allCombos[currentRateUp].push({ cashback: comboCashback, probability });
    }

    for (let i = 0; i < allCombos.length; i++) {
        const normalizedCombo = normalizeCashbackCombo(allCombos[i])
        allCombos[i] = aggregateCashbackFromRateUpCombos(normalizedCombo);
    }

    return allCombos;
}

function cashbackSR(charSRCombos, probabilitiesCharSR, probabilitiesWepSR, gachaConfig, inputConfig) {
    const { combos: offRateCharCombos, maxOffRateCount: maxOffRateCharCount } = getCombosSR(probabilitiesCharSR, PROBABILITY_THRESHOLD);
    const { combos: offRateWepCombos, maxOffRateCount: maxOffRateWepCount } = getCombosSR(probabilitiesWepSR, PROBABILITY_THRESHOLD);

    const charCashback = processCharacterBannerSR(charSRCombos, offRateCharCombos, maxOffRateCharCount, gachaConfig);
    const wepCashback = processWeaponBannerSR(offRateWepCombos, maxOffRateWepCount, gachaConfig, inputConfig);

    return combineIndependentCashback(charCashback, wepCashback);
}

function processCharacterBannerSR(charSRCombos, offRateCharCombos, maxOffRateCount, gachaConfig) {
    const maxRateUpCount = Math.max(...offRateCharCombos.map(c => c.rateUpCount));
    const allCombos = [];

    for (const { rateUps, offRates, probability } of charSRCombos) {
        const rateUpSolver = new IterativeSolver(rateUps, gachaConfig.rateUpCharacterSR, gachaConfig.configSR);
        const rateUpCashback = rateUpSolver.runSteps(maxRateUpCount);

        const offRateSolver = new IterativeSolver(offRates, gachaConfig.poolCharSR - gachaConfig.rateUpCharacterSR, gachaConfig.configSR);
        const offRateCharCashback = offRateSolver.runSteps(maxOffRateCount);
        const offRateCashback = calculateOffRateCashback(maxOffRateCount, offRateCharCashback, gachaConfig.configWep.pointsSR, CHAR_WEAPON_SPLIT_PROBABILITY);

        const SRComboCashback = combineCashbackFromItemCombos(offRateCharCombos, rateUpCashback, offRateCashback);
        allCombos.push({ probability, cashback: SRComboCashback });
    }

    return aggregateCashbackFromRateUpCombos(allCombos);
}

function processWeaponBannerSR(offRateWepCombos, maxOffRateCount, gachaConfig, inputConfig) {
    const maxRateUpCount = Math.max(...offRateWepCombos.map(c => c.rateUpCount));

    const rateUpCashback = calculateWepCashback(maxRateUpCount, gachaConfig.configWep.pointsSR);

    const offRateSolver = new IterativeSolver(inputConfig.SR.consCount, gachaConfig.poolCharSR, gachaConfig.configSR);
    const offRateCharCashback = offRateSolver.runSteps(maxOffRateCount);
    const offRateCashback = calculateOffRateCashback(maxOffRateCount, offRateCharCashback, gachaConfig.configWep.pointsSR, CHAR_WEAPON_SPLIT_PROBABILITY);

    return combineCashbackFromItemCombos(offRateWepCombos, rateUpCashback, offRateCashback);

    function calculateWepCashback(max, weaponPoints) {
        return Array.from({ length: max + 1 }, (_, i) => ({
            mean: i * weaponPoints,
            variance: 0
        }));
    }
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