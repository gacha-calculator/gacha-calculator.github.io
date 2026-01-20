//Copyright (C) 2025 bubartem
//
//This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
//
//This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.

const PRUNE_LEVEL = 1e-10;

export function rankUpSSR(distributionSSR, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, pityChar, pityWep, pities, rateUpOdds = 0.5) {
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
            const { type, spark } = distribution[i];
            let sum = 0;
            for (const sparkState of spark) {
                for (const pityState of sparkState.pity) {
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
    if (distributionSR[0].states.length === 0) {
        return;
    }
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
    array[inputIndex].isEmpty = true;
    for (let i = array[inputIndex].spark.length - 1; i >= 0; i--) {
        const isLast = inputIndex + 2 === array.length;
        const sparkState = array[inputIndex].spark[i];

        if (!sparkState.isEmpty) {
            sparkState.isEmpty = true;
            const size = sparkState.pity.length;
            let rateUpOdds = type === 'Weapon' ? 0.25 : 0.5;

            let currentStates = array[inputIndex].spark;
            const nextStates = array[inputIndex + 1].spark;
            const areNextStatesNewBanner = array[inputIndex + 1].bannerCount !== array[inputIndex].bannerCount;
            let doubleNextStates;
            let areDoubleNextStatesNewBanner;
            let isDoubleLast;
            if (!isLast) {
                doubleNextStates = array[inputIndex + 2].spark;
                areDoubleNextStatesNewBanner = array[inputIndex + 2].bannerCount !== array[inputIndex].bannerCount;
                isDoubleLast = inputIndex + 3 === array.length;
            }
            for (let j = size - 1; j >= 0; j--) {
                const currentState = currentStates[i].pity[j];
                for (const [currentKey, currentMap] of currentState) {
                    let isNotFirstBatch = currentKey % 10;
                    let isSpark, isExtra;
                    if (type === 'Character') {
                        if (i === 119 && isNotFirstBatch === 0) {
                            isSpark = true;
                        } else {
                            isSpark = false;
                        }
                        if (i === 239) {
                            isExtra = true;
                        } else {
                            isExtra = false;
                        }
                    } else {
                        isSpark = isNotFirstBatch === 80;
                        if (isNotFirstBatch > 1120) isExtra = (isNotFirstBatch - 1120) % 160 === 0;
                    }

                    let currentOdds = odds[j];
                    if (isSpark) {
                        currentOdds = 1;
                        rateUpOdds = 1;
                    }
                    const winProb = currentMap.prob * currentOdds;
                    const lossProb = currentMap.prob - winProb;

                    let probabilityWin = winProb * rateUpOdds;
                    if (probabilityWin > PRUNE_LEVEL) {
                        let nextKey = currentKey;
                        let targetMap;
                        if (areNextStatesNewBanner) {
                            nextKey = Math.trunc(nextKey / 1000) * 1000;
                        } else if (isSpark) {
                            nextKey += 1;
                        }
                        if (isLast) {
                            targetMap = nextStates[0];
                        } else if (isExtra) {
                            if (isDoubleLast) {
                                targetMap = doubleNextStates[0];
                            } else {
                                targetMap = doubleNextStates[0].pity[winIndex];
                                doubleNextStates[0].isEmpty = false;
                                array[inputIndex + 2].isEmpty = false;
                            }
                            if (!areNextStatesNewBanner && areDoubleNextStatesNewBanner) {
                                nextKey = Math.trunc(nextKey / 1000) * 1000;
                            }
                        } else {
                            targetMap = nextStates[i + 1].pity[winIndex];
                            nextStates[i + 1].isEmpty = false;
                            array[inputIndex + 1].isEmpty = false;
                        }
                        const existing = targetMap.get(nextKey);
                        if (existing) {
                            existing.prob += probabilityWin;
                        } else {
                            targetMap.set(nextKey, {
                                prob: probabilityWin
                            });
                        }
                        if (type === 'Character') {
                            rankUps.characters += probabilityWin;
                        } else if (type === 'Weapon') {
                            rankUps.weapons += probabilityWin;
                        }
                    }

                    let probabilityLossRateUp = winProb * (1 - rateUpOdds);
                    if (probabilityLossRateUp > PRUNE_LEVEL) {
                        let nextKeyGlobal = currentKey;
                        let nextKeyLocal = currentKey;
                        if (type === 'Character') {
                            nextKeyGlobal += 10;
                            nextKeyLocal += 1000;
                        }

                        let targetMap;
                        if (isExtra) {
                            if (isLast) {
                                targetMap = nextStates[0];
                            } else {
                                targetMap = nextStates[0].pity[0];
                                nextStates[0].isEmpty = false;
                                array[inputIndex + 1].isEmpty = false;
                            }
                            if (areNextStatesNewBanner) {
                                nextKeyGlobal = Math.trunc(currentKey / 1000) * 1000;
                                nextKeyLocal = Math.trunc(currentKey / 1000) * 1000;
                            }
                        } else {
                            targetMap = currentStates[i + 1].pity[0];
                            currentStates[i + 1].isEmpty = false;
                            array[inputIndex].isEmpty = false;
                        }
                        const existingGlobal = targetMap.get(nextKeyGlobal);

                        if (existingGlobal) {
                            existingGlobal.prob += probabilityLossRateUp * 5 / 7; // do proper instead of hardcoding
                        } else {
                            targetMap.set(nextKeyGlobal, {
                                prob: probabilityLossRateUp * 5 / 7
                            });
                        }

                        const existingLocal = targetMap.get(nextKeyLocal);
                        if (existingLocal) {
                            existingLocal.prob += probabilityLossRateUp * 2 / 7; // do proper instead of hardcoding
                        } else {
                            targetMap.set(nextKeyLocal, {
                                prob: probabilityLossRateUp * 2 / 7
                            });
                        }
                    }
                    let probabilityLossSSR = lossProb;
                    if (probabilityLossSSR > PRUNE_LEVEL) {
                        let targetMap;
                        let nextKey = currentKey;
                        if (isExtra) {
                            if (areNextStatesNewBanner) {
                                nextKey = Math.trunc(nextKey / 1000) * 1000;
                            }
                            if (!isLast) {
                                targetMap = nextStates[0].pity[j + 1];
                                nextStates[0].isEmpty = false;
                                array[inputIndex + 1].isEmpty = false;
                            } else {
                                targetMap = nextStates[0];
                            }
                        } else {
                            targetMap = currentStates[i + 1].pity[j + 1];
                            currentStates[i + 1].isEmpty = false;
                            array[inputIndex].isEmpty = false;
                        }
                        const existing = targetMap.get(nextKey);
                        if (existing) {
                            existing.prob += probabilityLossSSR;
                        } else {
                            targetMap.set(nextKey, {
                                prob: probabilityLossSSR
                            });
                        }
                    }
                    currentState.delete(currentKey);
                }
            }
        }
    }
}

function handleSR(odds, inputIndex, array, pity, pullsCoef) { // dif is no rate ups at all, means just count how much, it's already a map, so key means amount of success
    const size = pity;
    const currentStates = array[inputIndex].states;
    pullsCoef.rankUpFail = pullsCoef.pullsSum - pullsCoef.rankUps;

    let buffer = new Map();
    for (let i = size - 1; i >= 0; i--) {
        const currentState = currentStates[i];
        const currentOdds = odds[i];
        for (const [currentKey, currentMap] of currentState) {
            const totalProb = currentMap.prob;
            const activeProb = totalProb * pullsCoef.pullsSum;

            if (activeProb > PRUNE_LEVEL) {
                currentMap.prob = totalProb * (1 - pullsCoef.pullsSum);
                const winProb = totalProb * currentOdds * pullsCoef.rankUpFail; // formulas simplified a lot so somewhat nonsensical unless you derive them
                const lossProb = activeProb * (1 - currentOdds) * pullsCoef.rankUpFail;
                const pityResetProb = totalProb * pullsCoef.rankUps;

                if (winProb > PRUNE_LEVEL) {
                    const targetMap = buffer;
                    const nextKey = currentKey + 1;
                    const existing = targetMap.get(nextKey);
                    if (existing) {
                        existing.prob += winProb;
                    } else {
                        targetMap.set(nextKey, {
                            prob: winProb
                        });
                    }
                }
                if (lossProb > PRUNE_LEVEL) {
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
                if (pityResetProb > PRUNE_LEVEL) {
                    const targetMap = buffer;
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
    currentStates[0] = buffer;
}

function handleSSRCheap(odds, inputIndex, array, pity, type, winIndex) {
    array[inputIndex].isEmpty = true;
    for (let i = array[inputIndex].spark.length - 1; i >= 0; i--) {
        const isLast = inputIndex + 2 === array.length;
        const sparkState = array[inputIndex].spark[i];

        if (!sparkState.isEmpty) {
            sparkState.isEmpty = true;
            const size = sparkState.pity.length;
            let rateUpOdds = type === 'Weapon' ? 0.25 : 0.5;

            let currentStates = array[inputIndex].spark;
            const nextStates = array[inputIndex + 1].spark;
            const areNextStatesNewBanner = array[inputIndex + 1].bannerCount !== array[inputIndex].bannerCount;
            let doubleNextStates;
            let areDoubleNextStatesNewBanner;
            let isDoubleLast;
            if (!isLast) {
                doubleNextStates = array[inputIndex + 2].spark;
                areDoubleNextStatesNewBanner = array[inputIndex + 2].bannerCount !== array[inputIndex].bannerCount;
                isDoubleLast = inputIndex + 3 === array.length;
            }
            for (let j = size - 1; j >= 0; j--) {
                const currentState = currentStates[i].pity[j];
                for (const [currentKey, currentMap] of currentState) {
                    let sparkCounter = currentKey;
                    let isSpark, isExtra;

                    if (type === 'Character') {
                        if (i === 119 && currentKey === 0) {
                            isSpark = true;
                        } else {
                            isSpark = false;
                        }
                        if (i === 239) {
                            isExtra = true;
                        } else {
                            isExtra = false;
                        }
                    } else {
                        isSpark = sparkCounter === 80;
                        if (sparkCounter > 1120) isExtra = (sparkCounter - 1120) % 160 === 0;
                    }

                    let currentOdds = odds[j];
                    if (isSpark) {
                        currentOdds = 1;
                        rateUpOdds = 1;
                    }
                    const winProb = currentMap.prob * currentOdds;
                    const lossProb = currentMap.prob - winProb;

                    let probabilityWin = winProb * rateUpOdds;
                    if (probabilityWin > PRUNE_LEVEL) {
                        let nextKey = currentKey;
                        let targetMap;
                        if (areNextStatesNewBanner) {
                            nextKey = 0;
                        } else if (isSpark) {
                            nextKey = 1;
                        }
                        if (isLast) {
                            targetMap = nextStates[0];
                        } else if (isExtra) {
                            if (isDoubleLast) {
                                targetMap = doubleNextStates[0];
                            } else {
                                targetMap = doubleNextStates[0].pity[winIndex];
                                doubleNextStates[0].isEmpty = false;
                                array[inputIndex + 2].isEmpty = false;
                            }
                            if (!areNextStatesNewBanner && areDoubleNextStatesNewBanner) {
                                nextKey = 0;
                            }
                        } else {
                            targetMap = nextStates[i + 1].pity[winIndex];
                            nextStates[i + 1].isEmpty = false;
                            array[inputIndex + 1].isEmpty = false;
                        }

                        const existing = targetMap.get(nextKey);
                        if (existing) {
                            existing.prob += probabilityWin;
                        } else {
                            targetMap.set(nextKey, {
                                prob: probabilityWin
                            });
                        }
                    }

                    let probabilityLossRateUp = winProb * (1 - rateUpOdds);
                    if (probabilityLossRateUp > PRUNE_LEVEL) {
                        let nextKey = currentKey;
                        let targetMap;
                        if (isExtra) {
                            if (isLast) {
                                targetMap = nextStates[0];
                            } else {
                                targetMap = nextStates[0].pity[0];
                                nextStates[0].isEmpty = false;
                                array[inputIndex + 1].isEmpty = false;
                            }
                            if (areNextStatesNewBanner) {
                                nextKey = 0;
                            }
                        } else {
                            targetMap = currentStates[i + 1].pity[0];
                            currentStates[i + 1].isEmpty = false;
                            array[inputIndex].isEmpty = false;
                        }
                        const existing = targetMap.get(nextKey);
                        if (existing) {
                            existing.prob += probabilityLossRateUp;
                        } else {
                            targetMap.set(nextKey, {
                                prob: probabilityLossRateUp
                            });
                        }
                    }
                    let probabilityLossSSR = lossProb;
                    if (probabilityLossSSR > PRUNE_LEVEL) {
                        let targetMap;
                        let nextKey = currentKey;
                        if (isExtra) {
                            if (areNextStatesNewBanner) {
                                nextKey = 0;
                            }
                            if (!isLast) {
                                targetMap = nextStates[0].pity[j + 1];
                                nextStates[0].isEmpty = false;
                                array[inputIndex + 1].isEmpty = false;
                            } else {
                                targetMap = nextStates[0];
                            }
                        } else {
                            targetMap = currentStates[i + 1].pity[j + 1];
                            currentStates[i + 1].isEmpty = false;
                            array[inputIndex].isEmpty = false;
                        }
                        const existing = targetMap.get(nextKey);
                        if (existing) {
                            existing.prob += probabilityLossSSR;
                        } else {
                            targetMap.set(nextKey, {
                                prob: probabilityLossSSR
                            });
                        }
                    }
                    currentState.delete(currentKey);
                }
            }
        }
    }
}