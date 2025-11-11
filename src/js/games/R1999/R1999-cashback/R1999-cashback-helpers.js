import { calculateProbability } from "../../../utils/statistics.js";

class ArrayProb {
    constructor(array1, array2, prob) {
        this.rateUps = array1;
        this.offRates = array2;
        this.probability = prob;
    }
}

function getAllValidCombinations(constellations, maxRateUpCount, numberOfConstellations) {
    const validCombinations = [];
    const constellationCounts = new Array(numberOfConstellations).fill(0);

    function generateCombinations(currentConstellation, totalSelected) {
        if (currentConstellation === numberOfConstellations) {
            if (totalSelected === maxRateUpCount) {
                const offRateCons = calculateOffRateConstellations(constellationCounts, constellations);
                validCombinations.push(new ArrayProb([...constellationCounts], offRateCons));
            }
            return;
        }

        const maxForCurrent = Math.min(
            constellations[currentConstellation],
            maxRateUpCount - totalSelected
        );

        for (let count = 0; count <= maxForCurrent; count++) {
            constellationCounts[currentConstellation] = count;
            generateCombinations(currentConstellation + 1, totalSelected + count);
            constellationCounts[currentConstellation] = 0;
        }
    }

    generateCombinations(0, 0);
    return validCombinations;
}

function calculateOffRateConstellations(selectedCounts, totalCounts) {
    const remaining = [...totalCounts];
    for (let i = 0; i < selectedCounts.length; i++) {
        remaining[i] -= selectedCounts[i];
    }
    return remaining;
}

export function processKnownPicks(originalConstellations, knownPicks, CONSTELLATION_MAP) {
    const knownPicksPerCons = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);

    for (const pick of knownPicks) {
        if (pick === 'new') {
            originalConstellations[0]++;
            knownPicksPerCons[0]++;
        } else {
            const index = CONSTELLATION_MAP[pick];
            if (index !== undefined) {
                knownPicksPerCons[index]++;
            } else {
                console.warn(`Invalid or unhandled rate-up value found: "${selectedValue}"`);
            }
        }
    }

    return knownPicksPerCons;
}

export function getCombinationsWithKnownValues(originalConstellations, totalRateUpCount, knownPicks) {
    const numberOfConstellations = originalConstellations.length;
    const totalKnown = knownPicks.reduce((sum, current) => sum + current, 0);
    const remainingRateUpCount = totalRateUpCount - totalKnown;

    if (remainingRateUpCount < 0) {
        console.error("Error: More items are known than the total required.");
        return [];
    }

    const availableSlots = new Array(numberOfConstellations);
    for (let i = 0; i < numberOfConstellations; i++) {
        availableSlots[i] = originalConstellations[i] - knownPicks[i];
        if (availableSlots[i] < 0) {
            console.error(`Error: Known picks for constellation ${i} exceed its capacity.`);
            return [];
        }
    }
    const partialCombinations = getAllValidCombinations(
        availableSlots,
        remainingRateUpCount,
        numberOfConstellations
    );
    const finalCombinations = partialCombinations.map(partial => {
        const finalRateUps = partial.rateUps.map((remainingCount, i) => remainingCount + knownPicks[i]);
        const finalOffRates = calculateOffRateConstellations(finalRateUps, originalConstellations);

        return new ArrayProb(finalRateUps, finalOffRates);
    });

    return finalCombinations;
}

export function calculateProbabilityWithKnownValues(allPossibleOutcomes, originalConstellationCounts, knownPicks) {
    const remainingConstellationCounts = originalConstellationCounts.map((count, i) => count - knownPicks[i]);
    const remainingOutcomesMap = new Map();

    for (const originalOutcome of allPossibleOutcomes) {
        const remainingRateUps = originalOutcome.rateUps.map((count, i) => count - knownPicks[i]);
        if (remainingRateUps.some(count => count < 0)) {
            originalOutcome.probability = 0;
            continue;
        }
        const remainingOutcome = new ArrayProb(remainingRateUps, []);
        remainingOutcomesMap.set(remainingOutcome, originalOutcome);
    }

    const possibleRemainingOutcomes = Array.from(remainingOutcomesMap.keys());
    if (possibleRemainingOutcomes.length > 0) {
        calculateProbability(possibleRemainingOutcomes, remainingConstellationCounts);
    }
    for (const [remaining, original] of remainingOutcomesMap.entries()) {
        original.probability = remaining.probability;
    }
}

export function calculateOffRateCashback(max, data) {
    return Array.from({ length: max + 1 }, (_, i) => {
        let mean = 0;
        let secondMoment = 0;

        for (let j = 0; j <= i; j++) {
            const charData = data[j];
            const totalMean = charData.mean;
            const totalSecondMoment = charData.variance + Math.pow(totalMean, 2);

            mean += totalMean;
            secondMoment += totalSecondMoment;
        }

        return {
            mean,
            variance: Math.max(0, secondMoment - Math.pow(mean, 2))
        };
    });
}

export function calculateComboCashbackSSR(combo, rateUpCashback, offRateCharCashback) {
    let rateUp = rateUpCashback[combo.rateUpCount];
    let charOff = offRateCharCashback[combo.charOffRateCount];
    const comboCashback = { mean: rateUp + charOff.mean, variance: charOff.variance };
    return comboCashback;
}

export function chebyshevInequiality(cashback) {
    const OUTSIDE_PERCENTEGE = 0.2; // Make it an advanced conifg
    const STANDARD_DEVIATION = Math.sqrt(cashback.variance);
    const k = 1 / Math.sqrt(OUTSIDE_PERCENTEGE);
    let LOWER_BOUND = cashback.mean - STANDARD_DEVIATION * k;
    if (LOWER_BOUND < 0) {
        LOWER_BOUND = 0;
    }
    const UPPER_BOUND = cashback.mean + STANDARD_DEVIATION * k;
    const MEAN = cashback.mean;

    return { LOWER_BOUND, MEAN, UPPER_BOUND }
}

export function getCombosSSR(probabilities, threshold) {
    const combos = [];
    let maxOffRateCount = 0;

    for (let i = 0; i < probabilities.length; i++) {
        for (const [key, value] of probabilities[i].offRates.entries()) {
            const charOffRateCount = key;
            if (value.prob > threshold) {
                combos.push({ rateUpCount: i, charOffRateCount: charOffRateCount, probability: value.prob });
                maxOffRateCount = Math.max(maxOffRateCount, charOffRateCount);
            }
        }
    }

    return { combos, maxOffRateCount };
}

export function getCombosSR(probabilities, threshold) {
    const combos = [];
    let maxOffRateCount = 0;

    for (let i = 0; i < probabilities.length; i++) {
        for (const [key, value] of probabilities[i].offRates.entries()) {
            if (value.prob > threshold) {
                combos.push({ rateUpCount: i, offRateCount: key, probability: value.prob });
                maxOffRateCount = Math.max(maxOffRateCount, key);
            }
        }
    }

    return { combos, maxOffRateCount };
}

export function combineCashbackFromItemCombos(jointDistribution, rateUpData, offRateData) {
    let totalMean = 0;
    let totalSecondMoment = 0;

    for (const { rateUpCount, offRateCount, probability } of jointDistribution) {
        const ru = rateUpData[rateUpCount];
        const off = offRateData[offRateCount];
        const combinedMean = ru.mean + off.mean;
        const combinedSecondMoment = ru.variance + off.variance + Math.pow(combinedMean, 2);

        totalMean += probability * combinedMean;
        totalSecondMoment += probability * combinedSecondMoment;
    }

    return {
        mean: totalMean,
        variance: Math.max(0, totalSecondMoment - Math.pow(totalMean, 2))
    };
}

export function aggregateCashbackFromRateUpCombos(combinations) {
    let totalMean = 0;
    let totalSecondMoment = 0;

    for (const { probability, cashback } of combinations) {
        totalMean += probability * cashback.mean;
    }

    for (const { probability, cashback } of combinations) {
        const secondMoment = cashback.variance + Math.pow(cashback.mean, 2);
        totalSecondMoment += probability * secondMoment;
    }

    return {
        mean: totalMean,
        variance: Math.max(0, totalSecondMoment - Math.pow(totalMean, 2))
    };
}

export function combineIndependentCashback(...statsArray) {
    return statsArray.reduce((total, current) => ({
        mean: total.mean + current.mean,
        variance: total.variance + current.variance
    }), { mean: 0, variance: 0 });
}