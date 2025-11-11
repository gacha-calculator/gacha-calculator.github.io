const PRUNE_LEVEL = 1e-10;

export function rankUpSSR(distributionSSR, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, pityChar, pityWep, pities) {
    const { charPullsSum, wepPullsSum } = pullsPerBannerType(distributionSSR);
    const rankUps = { characters: 0, weapons: 0 };
    const pullsPerBanner = {};
    const lastActive = distributionSSR.length - 2;

    for (let wins = lastActive; wins >= 0; wins--) {
        const winState = pities[wins + 1];
        const winIndex = winState.pity;
        let special = null;
        if (winState.type === 'firstChar') {
            special = winState.special;
        }
        if (!distributionSSR[wins].isEmpty) {
            for (let capRad = 0; capRad < 4; capRad++) {
                const currentArray = distributionSSR[wins][capRad];
                if (!currentArray.isEmpty) {
                    if (currentArray.type === 'Character') {
                        handleSSRChar(ODDS_CHARACTER_SSR, wins, distributionSSR, pityChar, rankUps, winIndex, capRad);
                    } else if (currentArray.type === 'Weapon') {
                        handleSSRWep(ODDS_WEAPON_SSR, wins, distributionSSR, pityWep, rankUps, winIndex, capRad, special);
                    } else {
                        throw new Error(`Unknown SSR array type: ${currentArray.type}`);
                    }
                }
            }
        }
    }

    const { charRankUps, wepRankUps } = lossPerBannerType(charPullsSum, wepPullsSum, rankUps);
    pullsPerBanner.charRankUps = charRankUps;
    pullsPerBanner.wepRankUps = wepRankUps;
    return pullsPerBanner;

    function pullsPerBannerType(distribution) {
        const result = { charPullsSum: 0, wepPullsSum: 0 };
        if (distribution.length <= 1) return result;
        const len = distribution.length - 1;
        const capRadLen = distribution[0].length;

        for (let i = 0; i < len; i++) {
            let sum = 0;
            const type = distribution[i][0].type;
            for (let j = 0; j < capRadLen; j++) {
                const { states } = distribution[i][j];
                for (const pityState of states) {
                    for (const { prob } of pityState.values()) {
                        sum += prob;
                    }
                }
            }
            switch (type) {
                case 'Character':
                    result.charPullsSum += sum;
                    break;
                case 'Weapon':
                    result.wepPullsSum += sum;
                    break;
            }
        }
        return result;
    }
    function lossPerBannerType(charPullsSum, wepPullsSum, rankUps) {
        let charRankUps = rankUps.characters;
        let wepRankUps = rankUps.weapons;
        return { charRankUps: { pullsSum: charPullsSum, rankUps: charRankUps }, wepRankUps: { pullsSum: wepPullsSum, rankUps: wepRankUps } };
    }
}

export function rankUpSR(distributionSR, pullsCoef, ODDS_SR, gachaPities) {
    const last = distributionSR.length - 1;
    for (let wins = last; wins >= 0; wins--) {
        const currentArray = distributionSR[wins];
        if (!currentArray.isEmpty) {
            handleSR(ODDS_SR, wins, distributionSR, gachaPities, pullsCoef);
        }
    }
}

export function rankUpSSRCheap(distributionSSR, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, pityChar, pityWep, pities) {
    const lastActive = distributionSSR.length - 2;
    for (let wins = lastActive; wins >= 0; wins--) {
        const winState = pities[wins + 1];
        const winIndex = winState.pity;
        let special = null;
        if (winState.type === 'firstChar') {
            special = winState.special;
        }
        if (!distributionSSR[wins].isEmpty) {
            for (let capRad = 0; capRad < 4; capRad++) {
                const currentArray = distributionSSR[wins][capRad];
                if (!currentArray.isEmpty) {
                    if (currentArray.type === 'Character') {
                        handleSSRCharCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, pityChar, winIndex, capRad);
                    } else if (currentArray.type === 'Weapon') {
                        handleSSRWepCheap(ODDS_WEAPON_SSR, wins, distributionSSR, pityWep, winIndex, capRad, special);
                    } else {
                        throw new Error(`Unknown SSR array type: ${currentArray.type}`);
                    }
                }
            }
        }
    }
}

function handleSSRChar(odds, inputIndex, array, pity, rankUps, winIndex, capRad) {
    const capRadReduction = Math.floor(capRad / 2);
    const currentStates = array[inputIndex][capRad].states;
    if (capRad != 3) {
        const size = array[inputIndex][capRad].states.length;
        let rateUpOdds = 0.5;
        if (capRad === 2) {
            rateUpOdds = 0.55;
        }
        const nextStatesWon = array[inputIndex + 1][capRadReduction].states;
        const nextStatesLost = array[inputIndex + 1][capRad + 1].states;
        for (let j = size - 2; j >= 0; j--) {
            const currentState = currentStates[j];
            const isGuaranteed = j >= pity;
            const currentOdds = odds[j - pity * isGuaranteed];

            for (const [currentKey, currentMap] of currentState) {
                const winProb = currentMap.prob * currentOdds;
                const lossProb = currentMap.prob - winProb;

                let probabilityWin = winProb;
                if (probabilityWin > PRUNE_LEVEL) {
                    let nextStates = nextStatesLost;
                    if (!isGuaranteed) {
                        probabilityWin *= rateUpOdds;
                        nextStates = nextStatesWon;
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
                    rankUps.characters += probabilityWin;
                }
                if (!isGuaranteed) {
                    let probabilityLossRateUp = winProb * (1 - rateUpOdds);

                    if (probabilityLossRateUp > PRUNE_LEVEL) {
                        let nextKey = currentKey + 100;
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
                    const targetMap = currentStates[j + 1];
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
    } else {
        const nextStates = array[inputIndex + 1][capRadReduction].states;
        const size = array[inputIndex][capRad].states.length;

        for (let j = size - 2; j >= 0; j--) {
            const currentState = currentStates[j];
            const currentOdds = odds[j];

            for (const [currentKey, currentMap] of currentState) {
                const winProb = currentMap.prob * currentOdds;
                const lossProb = currentMap.prob - winProb;

                let probabilityWin = winProb;
                if (probabilityWin > PRUNE_LEVEL) {
                    const targetMap = nextStates[winIndex];
                    const existing = targetMap.get(currentKey);
                    if (existing) {
                        existing.prob += probabilityWin;
                    } else {
                        targetMap.set(currentKey, {
                            prob: probabilityWin
                        });
                    }
                    rankUps.characters += probabilityWin;
                }
                let probabilityLossSSR = lossProb;
                if (probabilityLossSSR > PRUNE_LEVEL) {
                    const targetMap = currentStates[j + 1];
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
    }
}

function handleSSRWep(odds, inputIndex, array, pity, rankUps, winIndex, capRad, special) {
    let nextCapRad = capRad;
    if (special != null) {
        nextCapRad = special;
    }
    const size = array[inputIndex][capRad].states.length;
    const rateUpOdds = 0.375;
    const rateUpGuaranteeOdds = 0.625;
    const currentStates = array[inputIndex][capRad].states;
    const nextStates = array[inputIndex + 1][nextCapRad].states;
    for (let i = size - 2; i >= 0; i--) {
        const currentState = currentStates[i];
        const isEpPath = i >= 2 * pity;
        let isGuaranteed = false;
        if (!isEpPath) {
            isGuaranteed = i >= pity;
        }
        const currentOdds = odds[i - pity * isGuaranteed - pity * isEpPath * 2];

        for (const [currentKey, currentMap] of currentState) {
            const winProb = currentMap.prob * currentOdds;
            const lossProb = currentMap.prob - winProb;

            let probabilityWin = winProb;
            if (probabilityWin > PRUNE_LEVEL) {
                if (!isEpPath) {
                    if (isGuaranteed) {
                        probabilityWin *= rateUpGuaranteeOdds;
                    } else {
                        probabilityWin *= rateUpOdds;
                    }
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
                rankUps.weapons += probabilityWin;
            }
            if (!isEpPath) {
                let probabilityLossRateUp = winProb * (1 - rateUpOdds);
                if (isGuaranteed) {
                    probabilityLossRateUp = winProb * (1 - rateUpGuaranteeOdds);
                }
                if (probabilityLossRateUp > PRUNE_LEVEL) {
                    let nextKey = currentKey + 1;
                    const targetMap = currentStates[pity * 2];
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
}

function handleSR(odds, inputIndex, array, pity, pullsCoef) {
    const size = array[inputIndex].states.length;
    const currentStates = array[inputIndex].states;
    pullsCoef.rankUpFail = pullsCoef.pullsSum - pullsCoef.rankUps;

    for (let i = size - 1; i >= 0; i--) {
        const currentState = currentStates[i];
        const isGuaranteed = i >= pity;
        const currentOdds = odds[i - pity * isGuaranteed];
        const rateUpOdds = 0.5;
        for (const [currentKey, currentMap] of currentState) {
            const totalProb = currentMap.prob;
            const activeProb = totalProb * pullsCoef.pullsSum;
            currentMap.prob = totalProb * (1 - pullsCoef.pullsSum);
            if (activeProb > PRUNE_LEVEL) {
                const winProb = totalProb * currentOdds * pullsCoef.rankUpFail;
                const lossProb = activeProb * (1 - currentOdds) + totalProb * currentOdds * pullsCoef.rankUps;
                let probabilityWin = winProb;
                if (probabilityWin > PRUNE_LEVEL) {
                    if (!isGuaranteed) {
                        probabilityWin *= rateUpOdds;
                    }
                    if (array[inputIndex + 1] === undefined) {
                        array[inputIndex + 1] = { states: Array.from({ length: array[inputIndex].states.length }, () => new Map()) };
                    }
                    const targetMap = array[inputIndex + 1].states[0];
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
                    let probabilityLossRateUp = winProb * (1 - rateUpOdds);
                    if (probabilityLossRateUp > PRUNE_LEVEL) {
                        let nextKey = currentKey;
                        nextKey++;
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
                if (lossProb > PRUNE_LEVEL) {
                    if (i - pity * isGuaranteed === pity - 1) {
                        currentMap.prob += activeProb * currentOdds * pullsCoef.rankUps;
                    } else {
                        const targetMap = currentStates[i + 1];
                        const existing = targetMap.get(currentKey);
                        if (existing) {
                            existing.prob += lossProb;
                        } else {
                            targetMap.set(currentKey, {
                                prob: lossProb
                            });
                        }
                    }
                }
            }
        }
    }
}

function handleSSRCharCheap(odds, inputIndex, array, pity, winIndex, capRad) {
    const capRadReduction = Math.floor(capRad / 2);
    const currentStates = array[inputIndex][capRad].states;
    if (capRad != 3) {
        const size = array[inputIndex][capRad].states.length;
        let rateUpOdds = 0.5;
        if (capRad === 2) {
            rateUpOdds = 0.55;
        }
        const nextStatesWon = array[inputIndex + 1][capRadReduction].states;
        const nextStatesLost = array[inputIndex + 1][capRad + 1].states;
        for (let i = size - 2; i >= 0; i--) {
            const currentState = currentStates[i];
            const isGuaranteed = i >= pity;
            const currentOdds = odds[i - pity * isGuaranteed];

            const winProb = currentState * currentOdds;
            const lossProb = currentState - winProb;

            let probabilityWin = winProb;
            if (probabilityWin > PRUNE_LEVEL) {
                let nextStates = nextStatesLost;
                if (!isGuaranteed) {
                    probabilityWin *= rateUpOdds;
                    nextStates = nextStatesWon;
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
    } else {
        const nextStates = array[inputIndex + 1][capRadReduction].states;
        const size = array[inputIndex][capRad].states.length;

        for (let i = size - 2; i >= 0; i--) {
            const currentState = currentStates[i];
            const currentOdds = odds[i];

            const winProb = currentState * currentOdds;
            const lossProb = currentState - winProb;

            let probabilityWin = winProb;
            if (probabilityWin > PRUNE_LEVEL) {
                nextStates[winIndex] += probabilityWin;
            }
            let probabilityLossSSR = lossProb;
            if (probabilityLossSSR > PRUNE_LEVEL) {
                currentStates[i + 1] += probabilityLossSSR;
            }
            currentStates[i] = 0;
        }
    }
}

function handleSSRWepCheap(odds, inputIndex, array, pity, winIndex, capRad, special) {
    let nextCapRad = capRad;
    if (special != null) {
        nextCapRad = special;
    }
    const size = array[inputIndex][capRad].states.length;
    const rateUpOdds = 0.375;
    const rateUpGuaranteeOdds = 0.625;
    const currentStates = array[inputIndex][capRad].states;
    const nextStates = array[inputIndex + 1][nextCapRad].states;
    for (let i = size - 2; i >= 0; i--) {
        const currentState = currentStates[i];
        const isEpPath = i >= 2 * pity;
        let isGuaranteed = false;
        if (!isEpPath) {
            isGuaranteed = i >= pity;
        }
        const currentOdds = odds[i - pity * isGuaranteed - pity * isEpPath * 2];

        const winProb = currentState * currentOdds;
        const lossProb = currentState - winProb;

        let probabilityWin = winProb;
        if (probabilityWin > PRUNE_LEVEL) {
            if (!isEpPath) {
                if (isGuaranteed) {
                    probabilityWin *= rateUpGuaranteeOdds;
                } else {
                    probabilityWin *= rateUpOdds;
                }
            }
            nextStates[winIndex] += probabilityWin;
        }
        if (!isEpPath) {
            let probabilityLossRateUp = winProb * (1 - rateUpOdds);
            if (isGuaranteed) {
                probabilityLossRateUp = winProb * (1 - rateUpGuaranteeOdds);
            }
            if (probabilityLossRateUp > PRUNE_LEVEL) {
                currentStates[pity * 2] += probabilityLossRateUp;
            }
        }
        let probabilityLossSSR = lossProb;
        if (probabilityLossSSR > PRUNE_LEVEL) {
            currentStates[i + 1] += probabilityLossSSR;
        }
        currentStates[i] = 0;
    }
}