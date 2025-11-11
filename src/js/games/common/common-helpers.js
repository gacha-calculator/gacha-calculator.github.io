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
            probabilitySum += states[j];
        }

        result[i] = probabilitySum;
    }

    return result;
}

export function pruneAndNormalize(array) {
    const PRUNE_LEVEL = 1e-10;
    const NORMALIZATION_THRESHOLD = 1e-5;
    let totalSum = 0;

    for (let i = 0, len = array.length; i < len; i++) {
        const states = array[i].states;
        for (let j = 0, statesLen = states.length; j < statesLen; j++) {
            if (Array.isArray(states[j])) {
                for (let map of states[j]) {
                    for (const [key, value] of map) {
                        totalSum += value.prob;
                        if (value.prob <= PRUNE_LEVEL) {
                            totalSum += value.prob;
                            map.delete(key);
                        }
                    }
                }
            } else {
                const map = states[j];
                for (const [key, value] of map) {
                    totalSum += value.prob;
                    if (value.prob <= PRUNE_LEVEL) {
                        totalSum += value.prob;
                        map.delete(key);
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
    let prunedSum = 0;

    for (let i = 0, len = array.length; i < len; i++) {
        const states = array[i].states;
        for (let j = 0, statesLen = states.length; j < statesLen; j++) {
            if (states[j] > 0 && states[j] <= PRUNE_LEVEL) {
                prunedSum += states[j];
                states[j] = 0;
            }
        }
    }

    if (prunedSum > 0) {
        const factor = 1 / (1 - prunedSum);
        for (let i = 0, len = array.length; i < len; i++) {
            const states = array[i].states;
            for (let j = 0, statesLen = states.length; j < statesLen; j++) {
                if (states[j] != 0) {
                    states[j] *= factor;
                }
            }
        }
    }
}

export function checkIsEmpty(distribution, isTarget) {
    let distrIsEmpty = true;
    if (!isTarget) {
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
    } else {
        for (let i = 0; i < distribution.length - 1; i++) {
            let isEmpty = true;
            for (const pityState of distribution[i].states) {
                if (pityState > 0) {
                    isEmpty = false;
                    distrIsEmpty = false;
                }
            }
            distribution[i].isEmpty = isEmpty;
        }
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
            if (map.size > 0) {
                addMap(consolidatedDistibution.offRates, map);
            }
        }

        result.push(consolidatedDistibution);
    }
    return result;

    function addMap(targetMap, currentMap) {
        for (const [key, value] of currentMap) {

            if (targetMap.has(key)) {
                targetMap.get(key).prob += value.prob;
            } else {
                targetMap.set(key, { ...value });
            }
        }
    }
}

export function simplifyDistribution(distribution) {
    for (let i = 0; i < distribution.length; i++) {
        const states = distribution[i].states;

        for (let j = 0; j < states.length; j++) {
            const map = states[j];
            let probabilitySum = 0;
            for (const value of map.values()) {
                probabilitySum += value.prob;
            }
            states[j] = probabilitySum;
        }
    }
}