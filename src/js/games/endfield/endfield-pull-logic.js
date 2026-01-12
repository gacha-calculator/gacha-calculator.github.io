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
    const size = array[inputIndex].states.length;
    let rateUpOdds = type === 'Weapon' ? 0.25 : 0.5;

    const isLast = inputIndex + 2 === array.length;
    let currentStates = array[inputIndex].states;
    const nextStates = array[inputIndex + 1].states;
    const areNextStatesNewBanner = array[inputIndex + 1].bannerCount !== array[inputIndex].bannerCount;
    let doubleNextStates;
    let areDoubleNextStatesNewBanner;
    if (!isLast) {
        doubleNextStates = array[inputIndex + 2].states;
        areDoubleNextStatesNewBanner = array[inputIndex + 2].bannerCount !== array[inputIndex].bannerCount;
    }
    let buffer = new Map();
    for (let i = size - 1; i >= 0; i--) {
        const currentState = currentStates[i];
        for (const [currentKey, currentMap] of currentState) {
            let sparkCounter = currentKey % 10000;
            let isSpark, isExtra;

            if (type === 'Character') {
                isSpark = sparkCounter === 120;
                if (sparkCounter > 1120) isExtra = (sparkCounter - 1120) % 240 === 0;
            } else {
                isSpark = sparkCounter === 80;
                if (sparkCounter > 1120) isExtra = (sparkCounter - 1120) % 160 === 0;
            }

            let currentOdds = odds[i];
            if (isSpark) {
                currentOdds = 1;
                rateUpOdds = 1;
            }
            const winProb = currentMap.prob * currentOdds;
            const lossProb = currentMap.prob - winProb;

            let probabilityWin = winProb * rateUpOdds;
            if (probabilityWin > PRUNE_LEVEL) {
                let nextKey = currentKey + 1;
                let targetMap = nextStates[winIndex];
                if (areNextStatesNewBanner) {
                    nextKey = Math.trunc(nextKey / 10000) * 10000;
                } else if (isSpark) {
                    nextKey += 1000;
                }
                if (isExtra && !isLast) {
                    targetMap = doubleNextStates[winIndex];
                    if (!areNextStatesNewBanner) {
                        if (areDoubleNextStatesNewBanner) {
                            nextKey = Math.trunc(nextKey / 10000) * 10000;
                        } else {
                            nextKey = Math.trunc(nextKey / 1000) * 1000 + 120;
                        }
                    }
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
                let nextKey = currentKey + 1;
                if (type === 'Character') {
                    nextKey += 10000;
                }

                let targetMap = buffer;
                if (isExtra) {
                    targetMap = nextStates[0];
                    if (areNextStatesNewBanner) {
                        nextKey = Math.trunc(nextKey / 10000) * 10000;
                    } else {
                        nextKey = Math.trunc(nextKey / 1000) * 1000 + 120;
                    }
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
                let targetMap = currentStates[i + 1];
                let nextKey = currentKey + 1;
                if (isExtra) {
                    if (areNextStatesNewBanner) {
                        nextKey = Math.trunc(nextKey / 10000) * 10000;
                    } else {
                        nextKey = Math.trunc(nextKey / 1000) * 1000 + 120;
                    }
                    if (!isLast) {
                        targetMap = nextStates[i + 1];
                    } else {
                        targetMap = nextStates[0];
                    }
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
            currentMap.prob = 0;
        }
        if (i === 0) {
            currentStates[0] = buffer;
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
    const size = array[inputIndex].states.length;
    let rateUpOdds = type === 'Weapon' ? 0.25 : 0.5;

    const isLast = inputIndex + 2 === array.length;
    let currentStates = array[inputIndex].states;
    const nextStates = array[inputIndex + 1].states;
    const areNextStatesNewBanner = array[inputIndex + 1].bannerCount !== array[inputIndex].bannerCount;
    let doubleNextStates;
    let areDoubleNextStatesNewBanner;
    if (!isLast) {
        doubleNextStates = array[inputIndex + 2].states;
        areDoubleNextStatesNewBanner = array[inputIndex + 2].bannerCount !== array[inputIndex].bannerCount;
    }
    let buffer = new Map();
    for (let i = size - 1; i >= 0; i--) {
        const currentState = currentStates[i];
        for (const [currentKey, currentMap] of currentState) {
            let sparkCounter = currentKey;
            let isSpark, isExtra;
            if (type === 'Character') {
                isSpark = sparkCounter === 120;
                if (sparkCounter > 1120) isExtra = (sparkCounter - 1120) % 240 === 0;
            } else {
                isSpark = sparkCounter === 80;
                if (sparkCounter > 1120) isExtra = (sparkCounter - 1120) % 160 === 0;
            }

            let currentOdds = odds[i];
            if (isSpark) {
                currentOdds = 1;
                rateUpOdds = 1;
            }
            const winProb = currentMap.prob * currentOdds;
            const lossProb = currentMap.prob - winProb;

            let probabilityWin = winProb * rateUpOdds;
            if (probabilityWin > PRUNE_LEVEL) {
                let nextKey = currentKey + 1;
                let targetMap = nextStates[winIndex];
                if (areNextStatesNewBanner) {
                    nextKey = 0;
                } else if (isSpark) {
                    nextKey += 1000;
                }
                if (isExtra && !isLast) {
                    targetMap = doubleNextStates[winIndex];
                    if (!areNextStatesNewBanner) {
                        if (areDoubleNextStatesNewBanner) {
                            nextKey = 0;
                        } else {
                            nextKey = 1120;
                        }
                    }
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
                let nextKey = currentKey + 1;

                let targetMap = buffer;
                if (isExtra) {
                    targetMap = nextStates[0];
                    if (areNextStatesNewBanner) {
                        nextKey = 0;
                    } else {
                        nextKey = 1120;
                    }
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
                let targetMap = currentStates[i + 1];
                let nextKey = currentKey + 1;
                if (isExtra) {
                    if (areNextStatesNewBanner) {
                        nextKey = 0;
                    } else {
                        nextKey = 1120;
                    }
                    if (!isLast) {
                        targetMap = nextStates[i + 1];
                    } else {
                        targetMap = nextStates[0];
                    }
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
            currentMap.prob = 0;
        }
        if (i === 0) {
            currentStates[0] = buffer;
        }
    }
}