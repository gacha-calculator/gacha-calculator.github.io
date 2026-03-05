import { binomialDistribution, binomialCoefficient } from '../../utils/statistics.js';

export function getCombosSSR(probabilities, threshold, cashbackRoadmap) { // can optimize a lot later
    const probMap = new Map();

    let maxOffRateCount = 0;
    const regularOnlyList = [0];
    const regularOnly = [0];
    for (let i = 0, j = 0; i < cashbackRoadmap.length; i++) {
        if (cashbackRoadmap[i] === 'regular') {
            j++;
            regularOnly.push(i);
        }
        regularOnlyList.push(j);
    }

    normalizeSpark(probabilities.sparkDistr);
    let fullLen = probabilities.bannerCounts.length;
    let curLen = probabilities.cashbackDataSSRAggregate.length;
    let offset = fullLen - curLen;
    for (let i = offset; i < fullLen - 2; i++) {
        const regularCount = regularOnlyList[i];
        let rateUpCombos = [];
        if (regularCount !== regularOnlyList[i - 1]) {
            for (let j = 1; j <= regularCount; j++) {
                rateUpCombos.push(combinations(regularOnly, regularCount, j));
            }
        }

        if (rateUpCombos.length === 0) {
            for (const [key, value] of probabilities.cashbackDataSSRAggregate[i - offset].entries()) {
                const probToAdd = value.prob;
                const mapKey = `${i},${regularCount},${key}`;
                probMap.set(mapKey, (probMap.get(mapKey) || 0) + probToAdd);
            }
        } else {
            for (const [key, value] of probabilities.cashbackDataSSRAggregate[i - offset].entries()) {
                for (let j = 0; j < rateUpCombos.length; j++) {
                    let rateUpCountProbSum = 0;
                    for (let k = 0; k < rateUpCombos[j].length; k++) {
                        rateUpCountProbSum += findProb(rateUpCombos[j][k], probabilities.sparkDistr, rateUpCombos[rateUpCombos.length - 1][0].length, regularOnly) * value.prob;
                    }
                    const probToAdd = rateUpCountProbSum;
                    const mapKey = `${i},${j + 1},${key}`;
                    probMap.set(mapKey, (probMap.get(mapKey) || 0) + probToAdd);
                }
            }
        }
    }

    const len = fullLen - 1;
    const regularCount = regularOnlyList[len - 1];
    let rateUpCombos = [];
    if (regularCount !== regularOnlyList[len - 2]) {
        for (let j = 1; j <= regularCount; j++) {
            rateUpCombos.push(combinations(regularOnly, regularCount, j));
        }
    }

    if (rateUpCombos.length === 0) {
        for (const [key, value] of probabilities.cashbackDataSSRAggregate[len - offset].entries()) {
            const probToAdd = value.prob;
            const mapKey = `${len - 1},${regularCount},${key}`;
            probMap.set(mapKey, (probMap.get(mapKey) || 0) + probToAdd);
        }
    } else {
        for (const [key, value] of probabilities.cashbackDataSSRAggregate[len - offset].entries()) {
            for (let j = 0; j < rateUpCombos.length; j++) {
                let rateUpCountProbSum = 0;
                for (let k = 0; k < rateUpCombos[j].length; k++) {
                    rateUpCountProbSum += findProb(rateUpCombos[j][k], probabilities.sparkDistr, rateUpCombos[rateUpCombos.length - 1][0].length, regularOnly) * value.prob;
                }
                const probToAdd = rateUpCountProbSum;
                const mapKey = `${len - 1},${j + 1},${key}`;
                probMap.set(mapKey, (probMap.get(mapKey) || 0) + probToAdd);
            }
        }
    }

    const combos = [];
    for (const [key, totalProb] of probMap.entries()) {
        if (totalProb > threshold) {
            const [rateUpCount, rateUpCashbackCount, charOffRateCount] = key.split(',').map(Number);
            const combosOffRateCount = findAllLocalGlobalCombos(rateUpCount, charOffRateCount, threshold, probabilities, offset); // return charOffRateLocal and charOffRateGlobal, pass them to combos,
            for (const combo of combosOffRateCount) {
                combos.push({
                    rateUpCount, rateUpCashbackCount, charOffRateCount,
                    charOffRateLocal: combo.charOffRateLocal, charOffRateGlobal: combo.charOffRateGlobal,
                    probability: totalProb * combo.prob
                });
            }
            maxOffRateCount = Math.max(maxOffRateCount, charOffRateCount);
        }
    }

    return { combos, maxOffRateCount };
}

function findAllLocalGlobalCombos(itemIndex, offrateCount, threshold, data, offset) {
    const allCombos = [];
    const globalProb = 5 / 7;
    const globalLocalCombos = binomialDistribution(maxCount, globalProb); // assume probs are like in the end?
    for (let i = 0; i < globalLocalCombos.length; i++) {
        if (combo > threshold) {
            const test = (binomialCoefficient(8, 4) * binomialCoefficient(6, 2) * binomialCoefficient(5, 1)) / binomialCoefficient(19, 7);
        }
    }
    const test = (binomialCoefficient(8, 4) * binomialCoefficient(6, 2) * binomialCoefficient(5, 1)) / binomialCoefficient(19, 7);
    allCombos.push({ charOffRateGlobal: 19, charOffRateLocal: [4, 2, 1], prob: test });

    return allCombos;
}

function findProb(combo, distr, max, regularOnly) { // if number in combo, * rUp, else * spark
    let prob = 1;
    let active = new Map();
    for (let i = 0; i < max; i++) {
        active.set(regularOnly[i]);
    }
    for (let element of combo) {
        for (let [key, value] of active) {
            if (element === key) {
                prob *= distr[element].rUps;
                active.delete(key);
                break;
            }
        }
    }
    for (let [key, value] of active) {
        prob *= distr[key].sparks;
    }
    return prob;
}

function normalizeSpark(distr) {
    for (let i = 0; i < distr.length - 1; i++) {
        let sum = 0;
        let element = distr[i];
        sum += element.rUps;
        sum += element.sparks;
        if (sum !== 0) {
            element.rUps /= sum;
            element.sparks /= sum;
        }
    }
}

function combinations(items, max, x) {
    const result = [];
    function backtrack(start, currentCombination) {
        if (currentCombination.length === x) {
            result.push([...currentCombination]);
            return;
        }
        for (let i = start; i < max; i++) {
            currentCombination.push(items[i]);
            backtrack(i + 1, currentCombination);
            currentCombination.pop();
        }
    }
    backtrack(0, []);
    return result;
}

export function calculateComboCashbackSSR(combo, rateUpCashback, offRateCharCashback) {
    let rateUp = rateUpCashback[combo.rateUpCashbackCount];
    if (!Number.isFinite(rateUp)) {
        debugger;
    }
    let charOff = offRateCharCashback[combo.charOffRateCount];
    const comboCashback = { mean: rateUp + charOff.mean, variance: charOff.variance };
    let test = comboCashback.mean;
    if (!Number.isFinite(test)) {
        debugger;
    }
    return comboCashback;
}

export function aggregateCashbackFromSR(distribution, cashbackValues) {
    const data = [];
    for (const [key, value] of distribution) {
        data.push({ prob: value.prob, mean: cashbackValues[key].mean, variance: cashbackValues[key].variance })
    }

    let overallMean = 0;
    for (const group of data) {
        overallMean += group.prob * group.mean;
    }

    let weightedVariance = 0;
    let weightedMeanSq = 0;

    for (const group of data) {
        weightedVariance += group.prob * group.variance;
        weightedMeanSq += group.prob * (group.mean * group.mean);
    }

    const betweenGroupVariance = weightedMeanSq - overallMean * overallMean;
    const overallVariance = weightedVariance + betweenGroupVariance;

    return { mean: overallMean, variance: overallVariance };
}