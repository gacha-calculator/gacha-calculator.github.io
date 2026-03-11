import { binomialDistribution, binomialCoefficient } from '../../utils/statistics.js';

export function getCombosSSR(probabilities, threshold, cashbackRoadmap, globalCharCashback, localCharCashback) { // can optimize a lot later
    const probMap = new Map();
    let maxOffRateCount = 0;
    const regularOnlyList = [0];
    const regularOnly = [0];
    for (let i = 0, j = 0; i < cashbackRoadmap.length; i++) {
        if (cashbackRoadmap[i] === 'regular') {
            j++;
            regularOnly.push(i + 1);
        }
        regularOnlyList.push(j);
    }

    normalizeSpark(probabilities.sparkDistr);
    let fullLen = probabilities.bannerCounts.length;
    let curLen = probabilities.cashbackDataSSRAggregate.length;
    let offset = fullLen - curLen; // would be cleaner to add nones to calc cashbackData output
    for (let i = offset; i < fullLen - 1; i++) {
        const regularCount = regularOnlyList[i];

        for (const [key, value] of probabilities.cashbackDataSSRAggregate[i - offset].entries()) {
            const mapKey = `${i},${regularCount},${key}`;
            probMap.set(mapKey, (probMap.get(mapKey) || 0) + value.prob);
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

    for (const [key, value] of probabilities.cashbackDataSSRAggregate[len - offset].entries()) {
        const probToAdd = value.prob;
        const mapKey = `${len - 1},${regularCount},${key}`;
        probMap.set(mapKey, (probMap.get(mapKey) || 0) + probToAdd);
    }

    const combos = [];
    for (const [key, totalProb] of probMap.entries()) {
        if (totalProb > threshold) {
            const [rateUpCount, rateUpCashbackCount, charOffRateCount] = key.split(',').map(Number);
            const { mean, variance } = calculateMeanVariance(rateUpCount, charOffRateCount, probabilities, offset, globalCharCashback, localCharCashback, totalProb); // return charOffRateLocal and charOffRateGlobal, pass them to combos,
            combos.push({
                rateUpCount, rateUpCashbackCount, charOffRateCount,
                charOffRateMean: mean, charOffRateVariance: variance,
                probability: totalProb
            });
            maxOffRateCount = Math.max(maxOffRateCount, charOffRateCount);
        }
    }
    let sumProb = 0;
    for (const combo of combos) {
        sumProb += combo.probability;
    }
    return { combos, maxOffRateCount };
}

function calculateMeanVariance(itemIndex, offrateCount, data, offset, globalCharCashback, localCharCashback, totalProb) {
    const allCombos = new Map();
    const bannerCount = data.bannerCounts[itemIndex];
    if (bannerCount === 0) {
        const globalProb = 5 / 7;
        const globalLocalCombos = binomialDistribution(offrateCount, globalProb);
        for (let i = 0; i < globalLocalCombos.length; i++) {
            const key = `${i},${offrateCount - i}`;
            allCombos.set(key, (allCombos.get(key) || 0) + globalLocalCombos[i]);
        }
    } else if (bannerCount === 1) {
        const perBannerCombos = findPerBannerCombosTwo(offrateCount, data.cashbackDataSSRPerItem[itemIndex - offset]);
        findGlobalLocalCombosTwo(perBannerCombos, allCombos);
    } else {
        const perBannerCombos = findPerBannerCombos(offrateCount, data.cashbackDataSSRPerItem[itemIndex - offset], data.perBannerData);
        findGlobalLocalCombos(perBannerCombos, allCombos);
    }

    let overallMean = 0;
    let weightedVariance = 0;
    let weightedMeanSq = 0;

    for (const [key, value] of allCombos) {
        const offRates = key.split(',').map(Number);
        let prob = value;
        let comboMean = 0;
        let weightedComboVariance = 0;
        let weightedComboMeanSq = 0;

        const globalData = globalCharCashback[offRates[0]];
        const globalMean = globalData.mean;

        comboMean += prob * globalMean;
        weightedComboVariance += prob * globalData.variance;
        weightedComboMeanSq += prob * globalMean * globalMean;

        for (let i = 1; i < offRates.length; i++) {
            const localData = localCharCashback[i - 1][offRates[i]];
            const localMean = localData.mean;

            comboMean += prob * localMean;
            weightedComboVariance += prob * localData.variance;
            weightedComboMeanSq += prob * (localMean * localMean);
        }

        const betweenComboVariance = weightedComboMeanSq - comboMean * comboMean;
        const overallComboVariance = weightedComboVariance + betweenComboVariance;

        overallMean += comboMean;
        weightedVariance += overallComboVariance;
    };

    return { mean: overallMean, variance: weightedVariance };
}

function findGlobalLocalCombos(combos, allCombos) {
    const globalProb = 5 / 7;
    for (const combo of combos) {
        const len = combo.perBannerOffrate.length;
        const combosPerBanner = new Array(len);
        for (let i = 0; i < combosPerBanner.length; i++) {
            combosPerBanner[i] = binomialDistribution(combo.perBannerOffrate[i], globalProb);
        }
        const globalLocalCombos = multiplyBinomialDistr(combosPerBanner);
        for (let i = 0; i < globalLocalCombos.length; i++) {
            let prob = globalLocalCombos[i].prob * combo.prob;
            if (prob > 1e-10) {
                let charOffRateGlobal = 0;
                let charOffRateLocal = [];
                for (let j = 0; j < len; j++) {
                    charOffRateGlobal += globalLocalCombos[i].combo[j];
                    charOffRateLocal.push(combo.perBannerOffrate[j] - globalLocalCombos[i].combo[j]);
                }
                const key = `${charOffRateGlobal},${charOffRateLocal.join(',')}`;
                allCombos.set(key, (allCombos.get(key) || 0) + prob);
            }
        }
    }
}

function findGlobalLocalCombosTwo(combos, allCombos) {
    const globalProb = 5 / 7;
    for (const combo of combos) {
        const combosBannerOne = binomialDistribution(combo.bannerOne, globalProb);
        const combosBannerZero = binomialDistribution(combo.bannerZero, globalProb);
        const globalLocalCombos = multiplyBinomialDistrTwo(combosBannerOne, combosBannerZero);
        for (let i = 0; i < globalLocalCombos.length; i++) {
            const charOffRateLocal = [combo.bannerOne - globalLocalCombos[i].globalOne, combo.bannerZero - globalLocalCombos[i].globalZero];
            const key = `${globalLocalCombos[i].globalOne + globalLocalCombos[i].globalZero},${charOffRateLocal.join(',')}`;
            allCombos.set(key, (allCombos.get(key) || 0) + globalLocalCombos[i].prob * combo.prob);
        }
    }
}

function findPerBannerCombosTwo(offrateCount, cashbackDataSSRPerItem) {
    const perBannerCombos = [];
    let probSum = 0;
    for (let i = 0; i <= offrateCount; i++) {
        if (offrateCount - i <= 22) {
            if (cashbackDataSSRPerItem.has(i)) {
                let prob = cashbackDataSSRPerItem.get(i).prob;
                probSum += prob;
                perBannerCombos.push({ bannerOne: offrateCount - i, bannerZero: i, prob: prob });
            }
        }
    }

    for (const combo of perBannerCombos) {
        combo.prob /= probSum;
    }

    return perBannerCombos;
}

function findPerBannerCombos(offrateCount, cashbackDataSSRPerItem, perBannerData) {
    const perBannerCombos = [];
    let probSum = [0];
    for (let i = 0; i <= offrateCount; i++) {
        if (cashbackDataSSRPerItem.has(i)) {
            let remaining = offrateCount - i;
            generateCombinations(
                i,
                cashbackDataSSRPerItem.get(i).prob,
                perBannerData,
                remaining,
                perBannerCombos,
                probSum
            );
        }
    }

    for (const combo of perBannerCombos) {
        combo.prob /= probSum[0];
    }

    return perBannerCombos;
}

function generateCombinations(i, baseProb, bannersData, remaining, perBannerCombos, probSum) {
    const N = bannersData.length;
    const effectiveMax = bannersData.map(arr => Math.min(remaining, arr.length - 1));

    const suffixMaxSum = new Array(N + 1).fill(0);
    for (let b = N - 1; b >= 0; b--) {
        suffixMaxSum[b] = effectiveMax[b] + suffixMaxSum[b + 1];
    }

    function dfs(depth, indices, currentSum, currentProb) {
        if (depth === N) {
            if (currentSum >= remaining && currentProb > 1e-6) {
                probSum[0] += currentProb;
                perBannerCombos.push({
                    perBannerOffrate: [i, ...indices],
                    prob: currentProb
                });
            }
            return;
        }

        const futureMax = suffixMaxSum[depth + 1] || 0;
        const minX = Math.max(0, remaining - currentSum - futureMax);
        const maxX = effectiveMax[depth];

        if (minX > maxX) return;

        for (let x = minX; x <= maxX; x++) {
            const prob = bannersData[depth][x];
            if (prob < 1e-6) continue;
            dfs(depth + 1, [...indices, x], currentSum + x, currentProb * prob);
        }
    }

    dfs(0, [], 0, baseProb);
}

function multiplyBinomialDistrTwo(combosBannerOne, combosBannerZero) {
    const combinedCombos = [];
    for (let i = 0; i < combosBannerOne.length; i++) {
        for (let j = 0; j < combosBannerZero.length; j++) {
            combinedCombos.push({ globalOne: i, globalZero: j, prob: combosBannerOne[i] * combosBannerZero[j] });
        }
    }
    return combinedCombos;
}

function multiplyBinomialDistr(combosPerBanner) {
    let combined = [{ combo: [], prob: 1 }];
    for (const bannerProbs of combosPerBanner) {
        const newCombined = [];
        for (const prev of combined) {
            for (let i = 0; i < bannerProbs.length; i++) {
                newCombined.push({
                    combo: [...prev.combo, i],
                    prob: prev.prob * bannerProbs[i]
                });
            }
        }
        combined = newCombined;
    }
    return combined;
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

export function calculateComboCashbackSSR(combo, rateUpCashback) {
    let rateUp = rateUpCashback[combo.rateUpCashbackCount];
    const comboCashback = { mean: rateUp + combo.charOffRateMean, variance: combo.charOffRateVariance };
    return comboCashback;
}

export function calculateComboCashbackSSRWeapon(combo, rateUpCashback, offRateCharCashback) {
    let rateUp = rateUpCashback[combo.rateUpCashbackCount];
    let charOff = offRateCharCashback[combo.charOffRateCount];
    const comboCashback = { mean: rateUp + charOff.mean, variance: charOff.variance };
    return comboCashback;
}

export function aggregateCashbackFromSR(distribution, cashbackValues, pull) {
    const data = [];
    const dataWeapon = [];
    const wepCashbackSR = 200 / 1980;
    const wepCashbackR = 20 / 1980;
    for (const [key, value] of distribution) {
        const prob = value.prob;
        data.push({ prob: prob, mean: cashbackValues[key].mean, variance: cashbackValues[key].variance });
        dataWeapon.push({ prob: prob, mean: key * wepCashbackSR + (pull - key) * wepCashbackR }); // ideally take ssr into account, but it's fairly negligible for the amount of work required
    }

    let overallMean = 0;
    let weightedVariance = 0;
    let weightedMeanSq = 0;

    let overallMeanWep = 0;
    let weightedMeanSqWep = 0;

    for (const group of data) {
        overallMean += group.prob * group.mean;
        weightedVariance += group.prob * group.variance;
        weightedMeanSq += group.prob * (group.mean * group.mean);
    }

    for (const group of dataWeapon) {
        overallMeanWep += group.prob * group.mean;
        weightedMeanSqWep += group.prob * (group.mean * group.mean);
    }

    const betweenGroupVariance = weightedMeanSq - overallMean * overallMean;
    const overallVariance = weightedVariance + betweenGroupVariance;

    const betweenGroupVarianceWep = weightedMeanSqWep - overallMeanWep * overallMeanWep;
    const overallVarianceWep = betweenGroupVarianceWep;

    return { charCashback: { mean: overallMean, variance: overallVariance }, wepCashback: { mean: overallMeanWep, variance: overallVarianceWep } };
}