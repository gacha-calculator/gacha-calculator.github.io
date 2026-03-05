export function updateProbDistr(probDistr, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, sparkDistr) {
    let rankUps = 0;
    let last = probDistr.length - 1;
    for (let i = 0, j = 0; i < last; i++) {
        if (!probDistrRankUps[i].isFirst) {
            j++;
        }
        if (probDistr !== null) {
            const rankUpscurrent = probDistrRankUps[i];
            const rankUpsDouble = probDistrRankUpsDouble[i];
            const rankUpsSpark = probDistrRankUpsSpark[i];
            probDistr[i] -= rankUpscurrent + rankUpsDouble + rankUpsSpark;
            probDistr[i + 1] += rankUpscurrent + rankUpsSpark;

            const curSparkDistr = sparkDistr[j];
            if (curSparkDistr != null) {
                curSparkDistr.rUps += rankUpscurrent + rankUpsDouble;
                curSparkDistr.sparks += rankUpsSpark;
                const nextSparkDistr = sparkDistr[j + 1];
                if (nextSparkDistr != null) {
                    nextSparkDistr.sparks += rankUpsDouble;
                }
            }
            if (i + 1 === last) {
                probDistr[i + 1] += rankUpsDouble;
            } else {
                probDistr[i + 2] += rankUpsDouble;
            }

            rankUps += rankUpscurrent + rankUpsDouble;
            probDistrRankUps[i] = 0;
            probDistrRankUpsDouble[i] = 0;
            probDistrRankUpsSpark[i] = 0;
        }
    }
}

export function updateProbDistrCheap(probDistr, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, pullsCoef) {
    let rankUps = 0;
    let last = probDistr.length - 1;
    for (let i = 0; i < last; i++) {
        if (probDistr !== null) {
            const rankUpscurrent = probDistrRankUps[i];
            const rankUpsDouble = probDistrRankUpsDouble[i];
            const rankUpsSpark = probDistrRankUpsSpark[i];
            probDistr[i] -= rankUpscurrent + rankUpsDouble + rankUpsSpark;
            probDistr[i + 1] += rankUpscurrent + rankUpsSpark;

            if (i + 1 === last) {
                probDistr[i + 1] += rankUpsDouble;
            } else {
                probDistr[i + 2] += rankUpsDouble;
            }

            rankUps += rankUpscurrent + rankUpsDouble;
            probDistrRankUps[i] = 0;
            probDistrRankUpsDouble[i] = 0;
            probDistrRankUpsSpark[i] = 0;
        }
    }
    pullsCoef.rankUps = rankUps;
    pullsCoef.pullsSum = 1 - probDistr[last];
}

export function checkIsTarget(distribution, target, allPulls) {
    if (target.type === 'probability') {
        let probabilitySum = 0;
        probabilitySum += distribution[distribution.length - 1];

        if (probabilitySum > target.value) {
            return true;
        } else {
            return false;
        }

    } else if (target.type === 'pulls') {
        if (allPulls === target.value) {
            return true;
        } else {
            return false;
        }
    }
}

export function consolidateSSRDistributionForCashback(distribution, distributionData, boundsIndices) {
    const result = [];
    const PITY_STATES = 80;

    for (let i = boundsIndices.minItem; i < distribution.length - 2; i++) {
        if (distribution[i] === null) {
            continue;
        }
        let SPARKS;
        let currentStates = distribution[i];
        if (distribution[i].length === 864000 || distribution[i].length === 422400) {
            SPARKS = 240;
        } else {
            SPARKS = 120;
        }
        const STATES_PER_KEY = PITY_STATES * SPARKS;
        let currentItemData = distributionData[i];
        let consolidatedDistibution = new Map();
        let startingIndex = currentItemData.minIndex;
        let finalIndex = currentItemData.maxIndex;

        let withinKey = startingIndex % STATES_PER_KEY;
        let key = (startingIndex - withinKey) / STATES_PER_KEY;
        let keySum = 0;
        let j = startingIndex;

        while (j <= finalIndex) {
            keySum += currentStates[j];
            j++;
            withinKey++;
            if (withinKey === STATES_PER_KEY) {
                if (keySum !== 0) {
                    consolidatedDistibution.set(key, {
                        prob: keySum
                    });
                    keySum = 0;
                }
                key++;
                withinKey = 0;
            }
        }
        if (keySum !== 0) {
            consolidatedDistibution.set(key, {
                prob: keySum
            });
        }
        result.push(consolidatedDistibution);
    }

    for (let i = distribution.length - 2; i < distribution.length; i++) {
        let consolidatedDistibution = new Map();
        const SPARKS = 240;
        let currentStates = distribution[i];
        const STATES_PER_KEY = PITY_STATES * SPARKS;
        let withinKey = 0;
        let key = 0;
        let keySum = 0;
        for (let j = 0; j < currentStates.length; j++) {
            keySum += currentStates[j];
            withinKey++;
            if (withinKey === STATES_PER_KEY) {
                if (keySum !== 0) {
                    const existing = consolidatedDistibution.get(key);
                    if (existing) {
                        existing.prob += keySum;
                    } else {
                        consolidatedDistibution.set(key, {
                            prob: keySum
                        });
                    }
                    keySum = 0;
                }
                key++;
                withinKey = 0;
            }
        }
        if (keySum !== 0) {
            const existing = consolidatedDistibution.get(key);
            if (existing) {
                existing.prob += keySum;
            } else {
                consolidatedDistibution.set(key, {
                    prob: keySum
                });
            }
        }

        result.push(consolidatedDistibution);
    }

    return result;
}

export function consolidateSRDistributionForCashback(distribution) {
    let consolidatedDistibution = new Map();

    for (let pityStates of distribution[0].states) {
        for (const [key, value] of pityStates) {
            if (value.prob !== 0) {
                const existing = consolidatedDistibution.get(key);
                if (existing) {
                    existing.prob += value.prob;
                } else {
                    consolidatedDistibution.set(key, {
                        prob: value.prob
                    });
                }
            }
        }
    }

    return consolidatedDistibution;
}

export function simplifyDistribution(distribution, distributionData, boundsIndices) { // get rid of keys
    const result = [];
    const PITY_STATES = 80;

    for (let i = 0; i < boundsIndices.minItem; i++) {
        result.push(null);
    }

    for (let i = boundsIndices.minItem; i < distribution.length; i++) {
        let SPARKS;
        let currentStates = distribution[i];
        if (distribution[i].length === 864000) {
            SPARKS = 240;
        } else {
            SPARKS = 120;
        }
        const STATES_PER_KEY = PITY_STATES * SPARKS;
        let currentItemData = distributionData[i];
        let consolidatedDistibution = new Float64Array(STATES_PER_KEY);
        let startingIndex = currentItemData.minIndex;
        let finalIndex = currentItemData.maxIndex;

        let withinKey = startingIndex % STATES_PER_KEY;
        let j = startingIndex;

        while (j <= finalIndex) {
            consolidatedDistibution[withinKey] += currentStates[j];
            j++;
            withinKey++;
            if (withinKey === STATES_PER_KEY) {
                withinKey = 0;
            }
        }
        result.push(consolidatedDistibution);
        currentItemData.minIndex = 0;
        currentItemData.maxIndex = STATES_PER_KEY - 1;
    }
    return result;
}

export function findBounds(distribution, distributionSSRData, boundsIndices, probDistr) {
    const minItem = boundsIndices.minItem;
    if (boundsIndices.maxItem + 3 !== distributionSSRData.length) {
        if (boundsIndices.maxItem + 4 === distributionSSRData.length) {
            boundsIndices.maxItem += 1;
        } else {
            boundsIndices.maxItem += 2;
        }
    }
    const maxItem = boundsIndices.maxItem;
    const oldData = distributionSSRData;
    let minItemNotFound = true;
    let i = minItem;
    const Prune = 1e-8;
    const SPARKS = 240;
    const STATES_PER_KEY = 80 * SPARKS;
    const iteration = STATES_PER_KEY + 241;

    while (minItemNotFound && i <= maxItem) {
        let maxIndex;
        const maxIndexFromCurrent = oldData[i].maxIndex + iteration;
        if (oldData[i - 1] != undefined) { // intentional, compares with null and undefined
            const maxIndexFromLast = oldData[i - 1].maxIndex + 241; // if new banner no spark either, win so pity should reset, can account for
            if (maxIndexFromLast > maxIndexFromCurrent) { // if from last is undefined(i is 0) it would still work, but make it proper later
                maxIndex = maxIndexFromLast;
            } else {
                maxIndex = maxIndexFromCurrent;
            }
        } else {
            maxIndex = maxIndexFromCurrent;
        }
        let minIndex;
        const minIndexFromCurrent = oldData[i].minIndex - oldData[i].minIndex % STATES_PER_KEY; // just go down to key breakpoint
        if (oldData[i - 1] != undefined) {
            const minIndexFromLast = oldData[i - 1].minIndex - oldData[i - 1].minIndex % STATES_PER_KEY;
            if (minIndexFromLast < minIndexFromCurrent) {
                minIndex = minIndexFromLast;
            } else {
                minIndex = minIndexFromCurrent;
            }
        } else {
            minIndex = minIndexFromCurrent;
        }

        const distr = distribution[i];
        const data = distributionSSRData[i];
        for (let j = minIndex; j <= maxIndex; j++) {
            const probJ = distr[j];
            if (probJ > Prune) {
                boundsIndices.minItem = i;
                data.minIndex = j;
                minItemNotFound = false;
                for (let k = maxIndex; k >= j; k--) {
                    const probK = distr[k];
                    if (probK > Prune) {
                        data.maxIndex = k;
                        break;
                    } else if (probK > 0) {
                        distr[k] = 0;
                    }
                }
                break;
            } else if (probJ > 0) {
                distr[j] = 0;
            }
        }
        if (minItemNotFound) {
            if (distribution[i - 1] == undefined) { // == will count undefined (-1 index) and nulls 
                distribution[i] = null;
                distributionSSRData[i] = null;
                probDistr[i] = null;
                if (i === distribution.length - 3) {
                    return true;
                }
            } else {
                distributionSSRData[i].minIndex = 0;
                distributionSSRData[i].maxIndex = 0;
            }
            distributionSSRData[i + 1].minIndex = 0;
        }
        i++;
    }

    while (i <= maxItem) {
        let maxIndex;
        const maxIndexFromCurrent = oldData[i].maxIndex + iteration;
        if (oldData[i - 1] != undefined) { // + 1 bad, should be sparks
            const maxIndexFromLast = oldData[i - 1].maxIndex + 241; // if new banner no spark either, win so pity should reset, can account for
            if (maxIndexFromLast > maxIndexFromCurrent) { // if from last is undefined(i is 0) it would still work, but make it proper later
                maxIndex = maxIndexFromLast;
            } else {
                maxIndex = maxIndexFromCurrent;
            }
        } else {
            maxIndex = maxIndexFromCurrent;
        }
        let minIndex;
        const minIndexFromCurrent = oldData[i].minIndex - oldData[i].minIndex % STATES_PER_KEY; // just go down to key breakpoint
        if (oldData[i - 1] != undefined) {
            const minIndexFromLast = oldData[i - 1].minIndex - oldData[i - 1].minIndex % STATES_PER_KEY;
            if (minIndexFromLast < minIndexFromCurrent) {
                minIndex = minIndexFromLast;
            } else {
                minIndex = minIndexFromCurrent;
            }
        } else {
            minIndex = minIndexFromCurrent;
        }

        const distr = distribution[i];
        const data = distributionSSRData[i];
        for (let j = minIndex; j <= maxIndex; j++) {
            const probJ = distr[j];
            if (probJ > Prune) {
                data.minIndex = j;
                for (let k = maxIndex; k >= j; k--) {
                    const probK = distr[k];
                    if (probK > Prune) {
                        data.maxIndex = k;
                        break;
                    } else if (probK > 0) {
                        distr[k] = 0;
                    }
                }
                break;
            } else if (probJ > 0) {
                distr[j] = 0;
            }
        }
        i++;
    }
    return false;
}

export function findBoundsCheap(distribution, distributionSSRData, boundsIndices, probDistr) {
    const minItem = boundsIndices.minItem;
    if (boundsIndices.maxItem + 3 !== distributionSSRData.length) {
        if (boundsIndices.maxItem + 4 === distributionSSRData.length) {
            boundsIndices.maxItem += 1;
        } else {
            boundsIndices.maxItem += 2;
        }
    }
    const maxItem = boundsIndices.maxItem;
    const oldData = distributionSSRData;
    let minItemNotFound = true;
    let i = minItem;
    const Prune = 1e-8;
    const iteration = 241;

    while (minItemNotFound && i <= maxItem) {
        let maxIndex;
        const maxIndexFromCurrent = oldData[i].maxIndex + iteration;
        if (oldData[i - 1] != undefined) { // intentional, compares with null and undefined
            const maxIndexFromLast = oldData[i - 1].maxIndex + iteration; // if new banner no spark either, win so pity should reset, can account for
            if (maxIndexFromLast > maxIndexFromCurrent) { // if from last is undefined(i is 0) it would still work, but make it proper later
                maxIndex = maxIndexFromLast;
            } else {
                maxIndex = maxIndexFromCurrent;
            }
        } else {
            maxIndex = maxIndexFromCurrent;
        }
        let minIndex = 0;

        const distr = distribution[i];
        const data = distributionSSRData[i];
        for (let j = minIndex; j <= maxIndex; j++) {
            const probJ = distr[j];
            if (probJ > Prune) {
                boundsIndices.minItem = i;
                data.minIndex = j;
                minItemNotFound = false;
                for (let k = maxIndex; k >= j; k--) {
                    const probK = distr[k];
                    if (probK > Prune) {
                        data.maxIndex = k;
                        break;
                    } else if (probK > 0) {
                        distr[k] = 0;
                    }
                }
                break;
            } else if (probJ > 0) {
                distr[j] = 0;
            }
        }
        if (minItemNotFound) {
            if (distribution[i - 1] == undefined) { // == will count undefined (-1 index) and nulls 
                distribution[i] = null;
                distributionSSRData[i] = null;
                probDistr[i] = null;
                if (i === distribution.length - 3) {
                    return true;
                }
            } else {
                distributionSSRData[i].minIndex = 0;
                distributionSSRData[i].maxIndex = 0;
            }
            distributionSSRData[i + 1].minIndex = 0;
        }
        i++;
    }

    while (i <= maxItem) {
        let maxIndex;
        const maxIndexFromCurrent = oldData[i].maxIndex + iteration;
        if (oldData[i - 1] != undefined) { // intentional, compares with null and undefined
            const maxIndexFromLast = oldData[i - 1].maxIndex + iteration; // if new banner no spark either, win so pity should reset, can account for
            if (maxIndexFromLast > maxIndexFromCurrent) { // if from last is undefined(i is 0) it would still work, but make it proper later
                maxIndex = maxIndexFromLast;
            } else {
                maxIndex = maxIndexFromCurrent;
            }
        } else {
            maxIndex = maxIndexFromCurrent;
        }
        let minIndex = 0;

        const distr = distribution[i];
        const data = distributionSSRData[i];
        for (let j = minIndex; j <= maxIndex; j++) {
            if (distr === undefined) {
                debugger;
            }
            const probJ = distr[j];
            if (probJ > Prune) {
                data.minIndex = j;
                for (let k = maxIndex; k >= j; k--) {
                    const probK = distr[k];
                    if (probK > Prune) {
                        data.maxIndex = k;
                        break;
                    } else if (probK > 0) {
                        distr[k] = 0;
                    }
                }
                break;
            } else if (probJ > 0) {
                distr[j] = 0;
            }
        }
        i++;
    }
    return false;
}

export function normalizePullsCoef(pullsCoef) {
    const NORMALIZATION_THRESHOLD = 1e-5;
    let pullsSum = pullsCoef.pullsSum;
    const diff = 1 - pullsSum;
    if (diff > NORMALIZATION_THRESHOLD) {
        pullsCoef.pullsSum /= pullsSum;
        pullsCoef.rankUps /= pullsSum;
    }
}