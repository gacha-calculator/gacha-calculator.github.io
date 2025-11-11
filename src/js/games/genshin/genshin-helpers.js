export function pruneAndNormalize(array) {
    const PRUNE_LEVEL = 1e-10;
    const NORMALIZATION_THRESHOLD = 1e-5;
    const capRadMax = 4;
    let totalSum = 0;
    if (!Array.isArray(array[0])) {
        for (const element of array) {
            const currentStates = element.states;
            for (const currentMap of currentStates) {
                for (const [key, value] of currentMap) {
                    totalSum += value.prob;
                    if (value.prob <= PRUNE_LEVEL) {
                        currentMap.delete(key);
                    }
                }
            }
        }

        const diff = Math.abs(totalSum - 1);
        if (diff > NORMALIZATION_THRESHOLD) {
            const normalizationFactor = 1 / totalSum;
            for (const element of array) {
                const currentStates = element.states;
                for (const currentMap of currentStates) {
                    for (const [key, value] of currentMap) {
                        value.prob *= normalizationFactor;
                    }
                }
            }
        }
    } else {
        for (const element of array) {
            for (let capRad = 0; capRad < capRadMax; capRad++) {
                const currentStates = element[capRad].states;
                for (const currentMap of currentStates) {
                    for (const [key, value] of currentMap) {
                        totalSum += value.prob;
                        if (value.prob <= PRUNE_LEVEL) {
                            currentMap.delete(key);
                        }
                    }
                }
            }
        }

        const diff = Math.abs(totalSum - 1);
        if (diff > NORMALIZATION_THRESHOLD) {
            const normalizationFactor = 1 / totalSum;
            for (const element of array) {
                for (let capRad = 0; capRad < capRadMax; capRad++) {
                    const currentStates = element[capRad].states;
                    for (const currentMap of currentStates) {
                        for (const [key, value] of currentMap) {
                            value.prob *= normalizationFactor;
                        }
                    }
                }
            }
        }
    }
}

export function checkIsEmpty(distribution, isTarget) {
    let distrIsEmpty = true;
    const capRadMax = 4;

    if (!isTarget) {
        for (let i = 0; i < distribution.length - 1; i++) {
            let isEmpty = true;
            for (let capRad = 0; capRad < capRadMax; capRad++) {
                for (const pityState of distribution[i][capRad].states) {
                    if (pityState.size > 0) {
                        isEmpty = false;
                        distrIsEmpty = false;
                    }
                }
                distribution[i][capRad].isEmpty = isEmpty;
            }
            distribution[i].isEmpty = isEmpty;
        }
    } else {
        for (let i = 0; i < distribution.length - 1; i++) {
            let isEmpty = true;
            for (let capRad = 0; capRad < capRadMax; capRad++) {
                for (const pityState of distribution[i][capRad].states) {
                    if (pityState > 0) {
                        isEmpty = false;
                        distrIsEmpty = false;
                    }
                }
                distribution[i][capRad].isEmpty = isEmpty;
            }
            distribution[i].isEmpty = isEmpty;
        }
    }
    return distrIsEmpty;
}

export function consolidateDistributionForCashback(distribution) {
    const result = [];
    if (Array.isArray(distribution[0])) {
        const capRadMax = 4;
        for (let i = 0; i < distribution.length; i++) {
            let type = 'None';
            if (i > 0 && i <= distribution.length && distribution[i - 1]) {
                type = distribution[i - 1][0].type || 'None';
            }
            let consolidatedDistibution = { offRates: new Map(), type: type };
            for (let capRad = 0; capRad < capRadMax; capRad++) {
                const maps = distribution[i][capRad].states;

                for (const map of maps) {
                    if (map.size > 0) {
                        addMap(consolidatedDistibution.offRates, map);
                    }
                }
            }
            result.push(consolidatedDistibution);
        }
    } else {
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

export function consolidateProbabilitiesCheap(distribution) {
    const result = new Array(distribution.length);
    const capRadMax = 4;

    for (let i = 0; i < distribution.length; i++) {
        let probabilitySum = 0;
        for (let capRad = 0; capRad < capRadMax; capRad++) {
            const states = distribution[i][capRad].states;
            for (let j = 0; j < states.length; j++) {
                probabilitySum += states[j];
            }
        }
        result[i] = probabilitySum;
    }

    return result;
}

export function consolidateProbabilities(distribution) {
    const result = [];
    for (let i = 0; i < distribution.length; i++) {
        const currentWinDistr = distribution[i];
        let probSum = 0;
        for (let capRad = 0; capRad < currentWinDistr.length; capRad++) {
            const currentDistr = currentWinDistr[capRad].states;
            for (let pity = 0; pity < currentDistr.length; pity++) { // issues with sr, most straightforward is seperate them
                for (const [key, value] of currentDistr[pity]) {
                    probSum += value.prob;
                }
            }
        }

        result.push(probSum);
    }

    return result;
}

export function normalizeCheap(array) {
    const PRUNE_LEVEL = 1e-10;
    const capRadMax = 4;
    let prunedSum = 0;

    for (let i = 0, len = array.length; i < len; i++) {
        for (let capRad = 0; capRad < capRadMax; capRad++) {
            const states = array[i][capRad].states;
            for (let j = 0, statesLen = states.length; j < statesLen; j++) {
                if (states[j] > 0 && states[j] <= PRUNE_LEVEL) {
                    prunedSum += states[j];
                    states[j] = 0;
                }
            }
        }
    }

    if (prunedSum > 0) {
        const factor = 1 / (1 - prunedSum);
        for (let i = 0, len = array.length; i < len; i++) {
            for (let capRad = 0; capRad < capRadMax; capRad++) {
                const states = array[i][capRad].states;
                for (let j = 0, statesLen = states.length; j < statesLen; j++) {
                    if (states[j] != 0) {
                        states[j] *= factor;
                    }
                }
            }
        }
    }
}

export function simplifyDistribution(distribution) {
    const capRadMax = 4;
    for (let i = 0; i < distribution.length; i++) {
        for (let capRad = 0; capRad < capRadMax; capRad++) {
            const states = distribution[i][capRad].states;

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
}

export function checkIsTarget(distribution, target, allPulls) {
    if (target.type === 'probability') {
        const lastIndex = distribution.length - 1;
        const winDistr = distribution[lastIndex];
        let probabilitySum = 0;
        for (let i = 0; i < winDistr.length; i++) {
            for (const map of winDistr[i].states) {
                for (const [key, value] of map) {
                    probabilitySum += value.prob;
                }
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