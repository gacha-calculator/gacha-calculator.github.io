const PRUNE_LEVEL = 1e-10;

export function rankUpSSR(distributionSSR, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, pityChar, pityWep, pities) {
    const { charPullsSum, wepPullsSum } = pullsPerBannerType(distributionSSR);
    const rankUps = { characters: 0, weapons: 0 };
    const pullsPerBanner = {};
    const lastActive = distributionSSR.length - 2;

    for (let wins = lastActive; wins >= 0; wins--) {
        const currentArray = distributionSSR[wins];
        const winIndex = pities[wins + 1];
        if (!currentArray.isEmpty) {
            if (currentArray.type === 'Character') {
                handleSSR(ODDS_CHARACTER_SSR, wins, distributionSSR, pityChar, rankUps, currentArray.type, winIndex);
            } else if (currentArray.type === 'Weapon') {
                handleSSR(ODDS_WEAPON_SSR, wins, distributionSSR, pityWep, rankUps, currentArray.type, winIndex);
            } else {
                throw new Error(`Unknown SSR array type: ${currentArray.type}`);
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

        for (let i = 0; i < len; i++) {
            const { type, states } = distribution[i];
            let sum = 0;
            for (const pityState of states) {
                for (const { prob } of pityState.values()) {
                    sum += prob;
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
        const currentArray = distributionSSR[wins];
        const winIndex = pities[wins + 1];
        if (!currentArray.isEmpty) {
            if (currentArray.type === 'Character') {
                handleSSRCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, pityChar, currentArray.type, winIndex);
            } else if (currentArray.type === 'Weapon') {
                handleSSRCheap(ODDS_WEAPON_SSR, wins, distributionSSR, pityWep, currentArray.type, winIndex);
            } else {
                throw new Error(`Unknown SSR array type: ${currentArray.type}`);
            }
        }
    }
}

function handleSSR(odds, inputIndex, array, pity, rankUps, type, winIndex) {
    const size = array[inputIndex].states.length;
    const rateUpOddsChar = 0.5;
    const rateUpOddsWep = 0.75;
    let rateUpOdds = 0.5;

    if (type === 'Character') {
        rateUpOdds = rateUpOddsChar;
    } else if (type === 'Weapon') {
        rateUpOdds = rateUpOddsWep;
    }
    const currentStates = array[inputIndex].states;
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
                if (type === 'Character') {
                    rankUps.characters += probabilityWin;
                } else if (type === 'Weapon') {
                    rankUps.weapons += probabilityWin;
                }
            }
            if (!isGuaranteed) {
                let probabilityLossRateUp = winProb * (1 - rateUpOdds);

                if (probabilityLossRateUp > PRUNE_LEVEL) {
                    let nextKey = currentKey;
                    if (type === 'Character') {
                        nextKey += 100;
                    } else if (type === 'Weapon') {
                        nextKey++;
                    }
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

            if (activeProb > PRUNE_LEVEL) {
                currentMap.prob = totalProb * (1 - pullsCoef.pullsSum);
                const winProb = totalProb * currentOdds * pullsCoef.rankUpFail; // formulas simplified a lot so somewhat nonsensical unless you derive them
                const lossProb = activeProb * (1 - currentOdds) + totalProb * currentOdds * pullsCoef.rankUps;

                if (winProb > PRUNE_LEVEL) {
                    let probabilityWin = winProb;
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

function handleSSRCheap(odds, inputIndex, array, pity, type, winIndex) {
    const size = array[inputIndex].states.length;
    const rateUpOddsChar = 0.5;
    const rateUpOddsWep = 0.75;
    let rateUpOdds = 0.5;

    if (type === 'Character') {
        rateUpOdds = rateUpOddsChar;
    } else if (type === 'Weapon') {
        rateUpOdds = rateUpOddsWep;
    }
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