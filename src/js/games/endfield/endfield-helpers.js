export function consolidateProbabilities(distribution) {
    const result = new Array(distribution.length);

    for (let i = 0; i < distribution.length; i++) {
        let probabilitySum = 0;
        const states = distribution[i].states;

        for (let j = 0; j < states.length; j++) {
            const map = states[j];
            for (const value of map.values()) {
                probabilitySum += value.prob;
            }
        }

        result[i] = probabilitySum;
    }

    return result;
}

export function consolidateProbabilitiesCheap(distribution) {
    const result = new Array(distribution.length);

    for (let i = 0; i < distribution.length; i++) {
        let probabilitySum = 0;
        const states = distribution[i].states;

        for (let j = 0; j < states.length; j++) {
            const map = states[j];
            for (const value of map.values()) {
                probabilitySum += value.prob;
            }
        }

        result[i] = probabilitySum;
    }

    return result;
}

export function pruneAndNormalize(array) {
    const PRUNE_LEVEL = 1e-10;
    const PRUNE_LEVEL_HIGH = 1e-10;
    const PRUNE_LEVEL_HIGHEST = 1e-10;
    const NORMALIZATION_THRESHOLD = 1e-5;
    let totalSum = 0;

    for (let i = 0, len = array.length; i < len; i++) {
        const states = array[i].states;
        for (let j = 0, statesLen = states.length; j < statesLen; j++) {
            if (Array.isArray(states[j])) {
                for (let map of states[j]) {
                    for (const [key, value] of map) {
                        let pruneLevel = PRUNE_LEVEL;
                        if (map.size >= 1000) {
                            pruneLevel = PRUNE_LEVEL_HIGHEST;
                        } else if (map.size >= 100) {
                            pruneLevel = PRUNE_LEVEL_HIGH;
                        }
                        if (value.prob <= pruneLevel) {
                            map.delete(key);
                        } else {
                            totalSum += value.prob;
                        }
                    }
                }
            } else {
                const map = states[j];
                for (const [key, value] of map) {
                    let pruneLevel = PRUNE_LEVEL;
                    if (map.size >= 1000) {
                        pruneLevel = PRUNE_LEVEL_HIGHEST;
                    } else if (map.size >= 100) {
                        pruneLevel = PRUNE_LEVEL_HIGH;
                    }
                    if (value.prob <= pruneLevel) {
                        map.delete(key);
                    } else {
                        totalSum += value.prob;
                    }
                }
            }
        }
    }

    const diff = Math.abs(totalSum - 1);
    if (diff > NORMALIZATION_THRESHOLD) {
        const factor = 1 / totalSum;
        for (let i = 0, len = array.length; i < len; i++) {
            const states = array[i].states;
            for (let j = 0, statesLen = states.length; j < statesLen; j++) {
                const map = states[j];
                for (const value of map.values()) {
                    value.prob *= factor;
                }
            }
        }
    }
}

export function normalizeCheap(array) {
    const PRUNE_LEVEL = 1e-10;
    const PRUNE_LEVEL_HIGH = 1e-10;
    const PRUNE_LEVEL_HIGHEST = 1e-10;
    const NORMALIZATION_THRESHOLD = 1e-5;
    let totalSum = 0;

    for (let i = 0, len = array.length; i < len; i++) {
        const states = array[i].states;
        for (let j = 0, statesLen = states.length; j < statesLen; j++) {
            if (Array.isArray(states[j])) {
                for (let map of states[j]) {
                    for (const [key, value] of map) {
                        let pruneLevel = PRUNE_LEVEL;
                        if (map.size >= 1000) {
                            pruneLevel = PRUNE_LEVEL_HIGHEST;
                        } else if (map.size >= 100) {
                            pruneLevel = PRUNE_LEVEL_HIGH;
                        }
                        if (value.prob <= pruneLevel) {
                            map.delete(key);
                        } else {
                            totalSum += value.prob;
                        }
                    }
                }
            } else {
                const map = states[j];
                for (const [key, value] of map) {
                    let pruneLevel = PRUNE_LEVEL;
                    if (map.size >= 1000) {
                        pruneLevel = PRUNE_LEVEL_HIGHEST;
                    } else if (map.size >= 100) {
                        pruneLevel = PRUNE_LEVEL_HIGH;
                    }
                    if (value.prob <= pruneLevel) {
                        map.delete(key);
                    } else {
                        totalSum += value.prob;
                    }
                }
            }
        }
    }

    const diff = Math.abs(totalSum - 1);
    if (diff > NORMALIZATION_THRESHOLD) {
        const factor = 1 / totalSum;
        for (let i = 0, len = array.length; i < len; i++) {
            const states = array[i].states;
            for (let j = 0, statesLen = states.length; j < statesLen; j++) {
                const map = states[j];
                for (const value of map.values()) {
                    value.prob *= factor;
                }
            }
        }
    }
}

export function checkIsEmpty(distribution, isTarget) {
    let distrIsEmpty = true;

    for (let i = 0; i < distribution.length - 1; i++) {
        let isEmpty = true;
        for (const pityState of distribution[i].states) {
            if (pityState.size > 0) {
                isEmpty = false;
                distrIsEmpty = false;
            }
        }
        distribution[i].isEmpty = isEmpty;
    }

    return distrIsEmpty;
}

export function checkIsTarget(distribution, target, allPulls) {
    if (target.type === 'probability') {
        const lastIndex = distribution.length - 1;
        let probabilitySum = 0;
        for (const map of distribution[lastIndex].states) {
            for (const [key, value] of map) {
                probabilitySum += value.prob;
            }
        }
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

export function consolidateDistributionForCashback(distribution) {
    const result = [];

    for (let i = 0; i < distribution.length; i++) {
        const maps = distribution[i].states;
        let type = 'None';
        if (i > 0 && i <= distribution.length && distribution[i - 1]) {
            type = distribution[i - 1].type || 'None';
        }

        let consolidatedDistibution = { offRates: new Map(), type: type };

        for (const map of maps) {
            for (const [key, value] of map) {
                let nextKey;
                if (distribution[i].states.length === 10) {
                    nextKey = key;
                } else {
                    nextKey = Math.trunc(key / 10000);
                }
                const existing = consolidatedDistibution.offRates.get(nextKey);
                if (existing) {
                    existing.prob += value.prob;
                } else {
                    consolidatedDistibution.offRates.set(nextKey, {
                        prob: value.prob
                    });
                }
            }
        }
        result.push(consolidatedDistibution);
    }

    return result;
}

export function simplifyDistribution(distribution) {
    for (let i = 0; i < distribution.length; i++) {
        const states = distribution[i].states;

        for (let j = 0; j < states.length; j++) {
            const oldMap = states[j];
            const clampedMap = new Map();

            for (const [currentKey, data] of oldMap) {
                const clampedKey = currentKey % 10000;

                const existing = clampedMap.get(clampedKey);
                if (existing) {
                    existing.prob += data.prob;
                } else {
                    clampedMap.set(clampedKey, { ...data });
                }
            }

            states[j] = clampedMap;
        }
    }
}