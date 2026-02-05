export function consolidateProbabilities(array, boundsIndices) {
    const result = new Array(array.length - 1);

    for (let i = 0; i < array.length; i++) {
        let probabilitySum = 0;
        if (array[i].distribution !== null) {
            for (let j = 0; j < array[i].distribution.length; j++) {
                probabilitySum += array[i].distribution[j];
            }
            if (array[i].type !== 'Double Target') {
                result[i] = probabilitySum;
            } else {
                result[i - 1] += probabilitySum;
            }
        }
    }
    const KEYS = 20;

    for (let i = 0; i < KEYS; i++) {
        let probabilitySum = 0;
        for (let j = i; j < array[array.length - 2].distribution.length; j += KEYS) {
            probabilitySum += array[array.length - 2].distribution[j];
            array[array.length - 2].distribution[j] = 0;
        }
        array[array.length - 2].distribution[i] = probabilitySum;
    }

    return result;
}

export function consolidateProbabilitiesCheap(distribution) {
    const result = new Array(distribution.length);

    for (let i = 0; i < distribution.length; i++) {
        let probabilitySum = 0;
        if (distribution[i] && !distribution[i].isEmpty) {
            const winStates = distribution[i].spark;
            for (const sparkStates of winStates) {
                if (sparkStates && !sparkStates.isEmpty) {
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

export function normalize(array, normalizeSum) {
    const NORMALIZATION_THRESHOLD = 1e-5;
    let totalSum = 0;

    if (array[0] && array[0].spark !== undefined) {
        for (let i = 0; i < array.length - 1; i++) {
            if (array && !array[i].isEmpty) {
                for (const sparkState of array[i].spark) {
                    if (sparkState && !sparkState.isEmpty) {
                        for (const pityState of sparkState.pity) {
                            for (const [key, value] of pityState) {
                                totalSum += value.prob;
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
            if (array[i] && !array[i].isEmpty) {
                for (const sparkState of array[i].spark) {
                    if (sparkState && !sparkState.isEmpty) {
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
    normalizeSum[0] = 0;
}

export function normalizeCheap(array) {
    const PRUNE_LEVEL = 1e-10;
    const NORMALIZATION_THRESHOLD = 1e-5;
    let totalSum = 0;

    for (let i = 0; i < array.length - 1; i++) {
        if (array[i] && !array[i].isEmpty) {
            for (const sparkState of array[i].spark) {
                if (sparkState && !sparkState.isEmpty) {
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
            if (array[i] && !array[i].isEmpty) {
                for (const sparkState of array[i].spark) {
                    if (sparkState && !sparkState.isEmpty) {
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

export function checkIsEmpty(distribution) {
    let globalIsEmpty = true;

    // Iterate through all banners except the last one (Target bucket)
    for (let i = 0; i < distribution.length - 1; i++) {
        const banner = distribution[i];
        if (!banner) continue;

        banner.isEmpty = true;

        for (const sparkState of banner.spark) {
            if (!sparkState) continue;

            sparkState.isEmpty = true;
            const pityArray = sparkState.pity;

            // Check each pity level's TypedArray
            for (let p = 0; p < pityArray.length; p++) {
                const typedArray = pityArray[p];

                for (let k = 0; k < 200; k++) {
                    if (typedArray[k] > 0) {
                        sparkState.isEmpty = false;
                        banner.isEmpty = false;
                        globalIsEmpty = false;
                        break; // Exit k loop
                    }
                }
                if (!sparkState.isEmpty) break; // Exit p loop
            }
        }
    }

    return globalIsEmpty;
}

export function checkIsTarget(distribution, target, allPulls) {
    if (target.type === 'probability') {
        const lastIndex = distribution.length - 1;
        let probabilitySum = 0;
        const winArray = distribution[lastIndex].spark[0];
        if (!winArray.isEmpty) {
            for (let key = 0; key < winArray.length; key++) {
                probabilitySum += winArray[key];
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

export function clearMaps(distribution) {
    let clearingDone = false;
    for (let i = 0; i < distribution.length; i++) {
        if (!distribution[i]) continue;
        for (let j = 0; j < distribution[i].spark.length; j++) {
            if (!clearingDone) {
                if (!distribution[i].spark[j]) continue;
                if (distribution[i].spark[j].isEmpty) {
                    distribution[i].spark[j] = null;
                } else {
                    clearingDone = true;
                    continue;
                }
            }
        }
        if (!clearingDone) {
            distribution[i] = null;
        }
    }
}

export function consolidateDistributionForCashback(distribution) {
    const result = [];

    for (let i = 0; i < distribution.length - 1; i++) {
        if (distribution[i]) {
            for (const pityStates of distribution[i].spark) {
                if (pityStates) {
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
        }
    }

    return result;
}

export function simplifyDistribution(distribution) {
    for (const winStates of distribution) {
        if (winStates) {
            for (let sparkStates of winStates.spark) {
                if (sparkStates) {

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
    }
}