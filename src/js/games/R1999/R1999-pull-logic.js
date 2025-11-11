const PRUNE_LEVEL = 1e-10;

export function rankUpSSR(distributionSSR, ODDS_SSR, pityChar) {
    const lastActive = distributionSSR.length - 2;
    let lastBanner = distributionSSR.length - 1;
    let maxBannerCount = distributionSSR[lastBanner - 1].bannerCount + 1;
    let pullsPerBanner = Array.from({ length: maxBannerCount }, () => ({
        pullsSum: 0,
        rankUpSum: 0
    }));
    let rankUps = Array(maxBannerCount).fill(0);
    findPullsPerBanner(distributionSSR, pullsPerBanner);

    for (let wins = lastActive; wins >= 0; wins--) {
        const currentArray = distributionSSR[wins];
        const winIndex = 0;
        if (!currentArray.isEmpty) {
            handleSSR(ODDS_SSR, wins, distributionSSR, pityChar, winIndex, rankUps);
            subPerBanner(pullsPerBanner, rankUps);
        }
    }

    return pullsPerBanner;
}

function findPullsPerBanner(distributionSSR, pullsPerBanner) {
    for (let i = 0; i < distributionSSR.length - 1; i++) {
        let target = distributionSSR[i].bannerCount;
        let temp = 0;
        for (let j = 0; j < distributionSSR[i].states.length; j++) {
            for (const [key, value] of distributionSSR[i].states[j]) {
                temp += value.prob;
            }
        }
        pullsPerBanner[target].pullsSum += temp;
    }
}

function subPerBanner(pullsPerBanner, rankUps) {
    for (let i = 0; i < pullsPerBanner.length; i++) {
        pullsPerBanner[i].rankUpSum = rankUps[i];
    }
}

export function rankUpSSRCheap(distributionSSR, ODDS_SSR, pityChar) {
    const lastActive = distributionSSR.length - 2;

    for (let wins = lastActive; wins >= 0; wins--) {
        const currentArray = distributionSSR[wins];
        const winIndex = 0;
        if (!currentArray.isEmpty) {
            handleSSRCheap(ODDS_SSR, wins, distributionSSR, pityChar, currentArray.type, winIndex);
        }
    }
}

function handleSSR(odds, inputIndex, array, pity, winIndex, rankUps) {
    const size = array[inputIndex].states.length;
    let rateUpOdds = 0.5;

    const currentStates = array[inputIndex].states;
    const currentBanner = array[inputIndex].bannerCount;
    const nextStates = array[inputIndex + 1].states;
    for (let i = size - 2; i >= 0; i--) {
        const currentState = currentStates[i];
        const isGuaranteed = i >= pity;
        const currentOdds = odds[i - pity * isGuaranteed];

        for (const [currentKey, currentMap] of currentState) {
            const winProb = currentMap.prob * currentOdds;
            const lossProb = currentMap.prob - winProb;

            let probabilityWin = winProb;
            if (probabilityWin > PRUNE_LEVEL) {
                if (!isGuaranteed) {
                    probabilityWin *= rateUpOdds;
                }
                const targetMap = nextStates[winIndex];
                const existing = targetMap.get(currentKey);
                if (existing) {
                    existing.prob += probabilityWin;
                } else {
                    targetMap.set(currentKey, {
                        prob: probabilityWin
                    });
                }
                rankUps[currentBanner] += probabilityWin;
            }
            if (!isGuaranteed) {
                let probabilityLossRateUp = winProb * (1 - rateUpOdds);

                if (probabilityLossRateUp > PRUNE_LEVEL) {
                    let nextKey = currentKey + 1;
                    const targetMap = currentStates[pity];
                    const existing = targetMap.get(nextKey);
                    if (existing) {
                        existing.prob += probabilityLossRateUp;
                    } else {
                        targetMap.set(nextKey, {
                            prob: probabilityLossRateUp
                        });
                    }
                }
            }
            let probabilityLossSSR = lossProb;
            if (probabilityLossSSR > PRUNE_LEVEL) {
                const targetMap = currentStates[i + 1];
                const existing = targetMap.get(currentKey);
                if (existing) {
                    existing.prob += probabilityLossSSR;
                } else {
                    targetMap.set(currentKey, {
                        prob: probabilityLossSSR
                    });
                }
            }
            currentMap.prob = 0;
        }
    }

    return rankUps;
}

export function rankUpSR(distributionSR, odds, rankUps) {
    let isGuaranteed;
    for (let bannerIndex = 0; bannerIndex < distributionSR.length; bannerIndex++) {
        const pullsSum = rankUps[bannerIndex].pullsSum;
        const rankUpsSum = rankUps[bannerIndex].rankUpSum;
        const rankUpsFails = pullsSum - rankUpsSum;

        const lastActive = distributionSR[bannerIndex].length - 1;

        for (let i = lastActive; i >= 0; i--) {
            const currentStates = distributionSR[bannerIndex][i].states;
            for (let j = 1; j >= 0; j--) {
                isGuaranteed = j === 1;
                let currentState = currentStates[j];
                if (currentState.length === 11) {
                    for (let k = 9; k >= 0; k--) {
                        for (const [currentKey, currentMap] of currentState[k]) {
                            const totalProb = currentMap.prob;
                            const activeProb = totalProb * pullsSum;
                            if (activeProb > PRUNE_LEVEL) {
                                currentMap.prob = totalProb * (1 - pullsSum);
                                let isLast = false;
                                if (k === 9) {
                                    isLast = true;
                                }
                                let activeOdds = odds;
                                if (isLast) {
                                    activeOdds = 1;
                                }
                                const winProb = totalProb * activeOdds * rankUpsFails; // formulas simplified a lot so somewhat nonsensical unless you derive them
                                const lossProb = totalProb * (1 - activeOdds) * rankUpsFails;
                                const pityResetProb = totalProb * rankUpsSum;

                                if (winProb > PRUNE_LEVEL) {
                                    let probabilityWin = winProb;
                                    if (!isGuaranteed) {
                                        probabilityWin *= 0.5;
                                    }
                                    if (distributionSR[bannerIndex][i + 1] === undefined) {
                                        distributionSR[bannerIndex].push({ states: Array.from({ length: 2 }, () => new Map()) });
                                        distributionSR[bannerIndex][i + 1].states[0].set(currentKey, { prob: probabilityWin });
                                    } else {
                                        const targetMap = distributionSR[bannerIndex][i + 1].states[0];
                                        const existing = targetMap.get(currentKey);
                                        if (existing) {
                                            existing.prob += probabilityWin;
                                        } else {
                                            targetMap.set(currentKey, {
                                                prob: probabilityWin
                                            });
                                        }
                                    }
                                    if (!isGuaranteed) {
                                        let nextKey = currentKey + 1;
                                        const targetMap = currentStates[1];
                                        const existing = targetMap.get(nextKey);
                                        if (existing) {
                                            existing.prob += probabilityWin;
                                        } else {
                                            targetMap.set(nextKey, {
                                                prob: probabilityWin
                                            });
                                        }
                                    }
                                }
                                if (lossProb > PRUNE_LEVEL) {
                                    const targetMap = currentStates[j][k + 1];
                                    const existing = targetMap.get(currentKey);
                                    if (existing) {
                                        existing.prob += lossProb;
                                    } else {
                                        targetMap.set(currentKey, {
                                            prob: lossProb
                                        });
                                    }
                                }
                                if (pityResetProb > PRUNE_LEVEL) {
                                    const targetMap = currentStates[0][10];
                                    const existing = targetMap.get(currentKey);
                                    if (existing) {
                                        existing.prob += pityResetProb;
                                    } else {
                                        targetMap.set(currentKey, {
                                            prob: pityResetProb
                                        });
                                    }
                                }
                            }
                        }
                    }
                    currentState = currentState[10];
                }
                for (const [currentKey, currentMap] of currentState) {
                    const totalProb = currentMap.prob;
                    const activeProb = totalProb * pullsSum;

                    if (activeProb > PRUNE_LEVEL) {
                        const winProb = totalProb * odds * rankUpsFails; // formulas simplified a lot so somewhat nonsensical unless you derive them
                        const lossProb = totalProb * (1 - odds) * rankUpsFails + totalProb * rankUpsSum;
                        currentMap.prob = totalProb * (1 - pullsSum) + lossProb;

                        if (winProb > PRUNE_LEVEL) {
                            let probabilityWin = winProb;
                            if (!isGuaranteed) {
                                probabilityWin *= 0.5;
                            }
                            if (distributionSR[bannerIndex][i + 1] === undefined) {
                                distributionSR[bannerIndex].push({ states: Array.from({ length: 2 }, () => new Map()) });
                                distributionSR[bannerIndex][i + 1].states[0].set(currentKey, { prob: probabilityWin });
                            } else {
                                const targetMap = distributionSR[bannerIndex][i + 1].states[0];
                                const existing = targetMap.get(currentKey);
                                if (existing) {
                                    existing.prob += probabilityWin;
                                } else {
                                    targetMap.set(currentKey, {
                                        prob: probabilityWin
                                    });
                                }
                            }
                            if (!isGuaranteed) {
                                let nextKey = currentKey + 1;
                                const targetMap = currentStates[1];
                                const existing = targetMap.get(nextKey);
                                if (existing) {
                                    existing.prob += probabilityWin;
                                } else {
                                    targetMap.set(nextKey, {
                                        prob: probabilityWin
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export function handleSSRCheap(odds, inputIndex, array, pity, winIndex) {
    const size = array[inputIndex].states.length;
    let rateUpOdds = 0.5;

    const currentStates = array[inputIndex].states;
    const nextStates = array[inputIndex + 1].states;
    for (let i = size - 2; i >= 0; i--) {
        const currentState = currentStates[i];
        const isGuaranteed = i >= pity;
        const currentOdds = odds[i - pity * isGuaranteed];

        const winProb = currentState * currentOdds;
        const lossProb = currentState - winProb;

        let probabilityWin = winProb;
        if (probabilityWin > PRUNE_LEVEL) {
            if (!isGuaranteed) {
                probabilityWin *= rateUpOdds;
            }
            nextStates[winIndex] += probabilityWin;
        }
        if (!isGuaranteed) {
            let probabilityLossRateUp = winProb * (1 - rateUpOdds);
            if (probabilityLossRateUp > PRUNE_LEVEL) {
                currentStates[pity] += probabilityLossRateUp;
            }
        }
        let probabilityLossSSR = lossProb;
        if (probabilityLossSSR > PRUNE_LEVEL) {
            currentStates[i + 1] += probabilityLossSSR;
        }
        currentStates[i] = 0;
    }
}   