export function getCombosSSR(probabilities, threshold, extras) {
    const combos = [];
    let maxOffRateCount = 0;

    for (let i = 0; i < probabilities.length; i++) {
        for (const [key, value] of probabilities[i].offRates.entries()) {
            if (value.prob > threshold) {
                combos.push({ rateUpCount: i - extras, charOffRateCount: key, probability: value.prob });
                maxOffRateCount = Math.max(maxOffRateCount, key);
            }
        }
    }

    return { combos, maxOffRateCount };
}

export function calculateComboCashbackSSR(combo, rateUpCashback, offRateCharCashback) {
    let rateUp = rateUpCashback[combo.rateUpCount];
    let charOff = offRateCharCashback[combo.charOffRateCount];
    const comboCashback = { mean: rateUp + charOff.mean, variance: charOff.variance };
    return comboCashback;
}

export function aggregateCashbackFromSR(distribution, cashbackValues) {
    const data = [];
    for (const [key, value] of distribution[0].offRates) {
        data.push({prob: value.prob, mean: cashbackValues[key].mean, variance: cashbackValues[key].variance})
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