export function consolidateProbabilities(distribution) {
    const result = new Array(distribution.length);

    for (let i = 0; i < distribution.length; i++) {
        let probabilitySum = 0;
        if (!distribution[i].isEmpty) {
            const winStates = distribution[i].spark;

            for (const sparkStates of winStates) {
                if (!sparkStates.isEmpty) {
                    if (sparkStates.pity !== undefined) {
                        for (const pityStates of sparkStates.pity) {
                            for (const value of pityStates.values()) {
                                probabilitySum += value.prob;
                            }
                        }
                    } else {
                        for (const value of sparkStates.values()) {
                            probabilitySum += value.prob;
                        }
                    }
                }
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
        if (!distribution[i].isEmpty) {
            const winStates = distribution[i].spark;
            for (const sparkStates of winStates) {
                if (!sparkStates.isEmpty) {
                    if (sparkStates.pity !== undefined) {
                        for (const pityStates of sparkStates.pity) {
                            for (const value of pityStates.values()) {
                                probabilitySum += value.prob;
                            }
                        }
                    } else {
                        for (const value of sparkStates.values()) {
                            probabilitySum += value.prob;
                        }
                    }
                }
            }
        }
        result[i] = probabilitySum;
    }

    return result;
}

export function pruneAndNormalize(array) {
    const PRUNE_LEVEL = 1e-10;
    const NORMALIZATION_THRESHOLD = 1e-5;
    let totalSum = 0;

    if (array[0].spark !== undefined) {
        for (let i = 0; i < array.length - 1; i++) {
            if (!array[i].isEmpty) {
                for (const sparkState of array[i].spark) {
                    if (!sparkState.isEmpty) {
                        for (const pityState of sparkState.pity) {
                            for (const [key, value] of pityState) {
                                if (value.prob <= PRUNE_LEVEL) {
                                    pityState.delete(key);
                                } else {
                                    totalSum += value.prob;
                                }
                            }
                        }
                    }
                }
            }
        }
        for (const sparkState of array[array.length - 1].spark) {
            for (const [key, value] of sparkState) {
                totalSum += value.prob;
            }
        }
    }

    const diff = Math.abs(totalSum - 1);
    if (diff > NORMALIZATION_THRESHOLD) {
        const factor = 1 / totalSum;
        for (let i = 0; i < array.length - 1; i++) {
            if (!array[i].isEmpty) {
                for (const sparkState of array[i].spark) {
                    if (!sparkState.isEmpty) {
                        for (const pityState of sparkState.pity) {
                            for (const [key, value] of pityState) {
                                value.prob *= factor;
                            }
                        }
                    }
                }
            }
        }
    }
}

export function normalizeCheap(array) {
    const PRUNE_LEVEL = 1e-10;
    const NORMALIZATION_THRESHOLD = 1e-5;
    let totalSum = 0;

    for (let i = 0; i < array.length - 1; i++) {
        if (!array[i].isEmpty) {
            for (const sparkState of array[i].spark) {
                if (!sparkState.isEmpty) {
                    for (const pityState of sparkState.pity) {
                        for (const [key, value] of pityState) {
                            if (value.prob <= PRUNE_LEVEL) {
                                pityState.delete(key);
                            } else {
                                totalSum += value.prob;
                            }
                        }
                    }
                }
            }
        }
    }
    for (const sparkState of array[array.length - 1].spark) {
        for (const [key, value] of sparkState) {
            totalSum += value.prob;
        }
    }

    const diff = Math.abs(totalSum - 1);
    if (diff > NORMALIZATION_THRESHOLD) {
        const factor = 1 / totalSum;
        for (let i = 0; i < array.length - 1; i++) {
            if (!array[i].isEmpty) {
                for (const sparkState of array[i].spark) {
                    if (!sparkState.isEmpty) {
                        for (const pityState of sparkState.pity) {
                            for (const [key, value] of pityState) {
                                value.prob *= factor;
                            }
                        }
                    }
                }
            }
        }
    }
}

export function checkIsEmpty(distribution, isTarget = null) {
    for (let i = 0; i < distribution.length - 1; i++) {
        if (!distribution[i].isEmpty) {
            return false;
        }
    }

    return true;
}

export function checkIsTarget(distribution, target, allPulls) {
    if (target.type === 'probability') {
        const lastIndex = distribution.length - 1;
        let probabilitySum = 0;
        for (const map of distribution[lastIndex].spark) {
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

    if (distribution[0].spark !== undefined) {
        for (let i = 0; i < distribution.length; i++) {
            for (const pityStates of distribution[i].spark) {
                let type = 'None';
                if (i > 0 && i <= distribution.length && distribution[i - 1]) {
                    type = distribution[i - 1].type || 'None';
                }

                let consolidatedDistibution = { offRates: new Map(), type: type };

                if (pityStates.pity !== undefined) {
                    for (const map of pityStates.pity) {
                        for (const [key, value] of map) {
                            let nextKey = Math.trunc(key / 10);
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
                } else {
                    for (const [key, value] of pityStates) {
                        let nextKey = Math.trunc(key / 10);
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
                if (consolidatedDistibution.offRates.size > 0) {
                    result.push(consolidatedDistibution);
                }
            }
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
                for (const [key, value] of map) {
                    let nextKey = key;
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
            if (consolidatedDistibution.offRates.size > 0) {
                result.push(consolidatedDistibution);
            }
        }
    }

    return result;
}

export function simplifyDistribution(distribution) {
    for (const winStates of distribution) {
        for (let sparkStates of winStates.spark) {
            const pityStates = sparkStates.pity;
            if (pityStates !== undefined) {
                for (let j = 0; j < pityStates.length; j++) {
                    const oldMap = pityStates[j];
                    const clampedMap = new Map();

                    for (const [currentKey, data] of oldMap) {
                        const clampedKey = currentKey % 10;

                        const existing = clampedMap.get(clampedKey);
                        if (existing) {
                            existing.prob += data.prob;
                        } else {
                            clampedMap.set(clampedKey, { ...data });
                        }
                    }

                    pityStates[j] = clampedMap;
                }
            } else {
                const oldMap = sparkStates;
                const clampedMap = new Map();

                for (const [currentKey, data] of oldMap) {
                    const clampedKey = ((currentKey / 1000) * 1000) % 10;

                    const existing = clampedMap.get(clampedKey);
                    if (existing) {
                        existing.prob += data.prob;
                    } else {
                        clampedMap.set(clampedKey, { ...data });
                    }
                }

                sparkStates = clampedMap;
            }
        }
    }
}