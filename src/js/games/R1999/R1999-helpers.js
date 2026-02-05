export function consolidateSRBanners(distributionSR) {
    let newDistribution = [];
    for (let banner of distributionSR) {
        for (let i = 0; i < banner.length; i++) {
            for (let j = 0; j < banner[i].states.length; j++) {
                if (Array.isArray(banner[i].states[j])) {
                    for (let k = 0; k < banner[i].states[j].length; k++) {
                        for (let [currentKey, currentMap] of banner[i].states[j][k]) {
                            if (newDistribution[i] === undefined) {
                                while (i >= newDistribution.length) {
                                    newDistribution.push({ states: Array.from({ length: 2 }, () => new Map()) });
                                }
                                newDistribution[i].states[0].set(currentKey, { prob: currentMap.prob });
                            } else {
                                const targetMap = newDistribution[i].states[j];
                                const existing = targetMap.get(currentKey);
                                if (existing) {
                                    existing.prob += currentMap.prob;
                                } else {
                                    targetMap.set(currentKey, {
                                        prob: currentMap.prob
                                    });
                                }
                            }
                        }
                    }
                } else {
                    for (let [currentKey, currentMap] of banner[i].states[j]) {
                        if (newDistribution[i] === undefined) {
                            while (i >= newDistribution.length) {
                                newDistribution.push({ states: Array.from({ length: 2 }, () => new Map()) });
                            }
                            newDistribution[i].states[0].set(currentKey, { prob: currentMap.prob });
                        } else {
                            const targetMap = newDistribution[i].states[j];
                            const existing = targetMap.get(currentKey);
                            if (existing) {
                                existing.prob += currentMap.prob;
                            } else {
                                targetMap.set(currentKey, {
                                    prob: currentMap.prob
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    return newDistribution;
}


export function normalizePullsPerBanner(pullsPerBanner) {
    let totalPullsSum = 0;
    for (let banner of pullsPerBanner) {
        totalPullsSum += banner.pullsSum;
    }
    const NORMALIZATION_THRESHOLD = 1e-5;
    const diff = Math.abs(totalPullsSum - 1);
    if (diff > NORMALIZATION_THRESHOLD) {
        for (let banner of pullsPerBanner) {
            banner.pullsSum /= totalPullsSum;
            banner.rankUps /= totalPullsSum;
        }
    }
}