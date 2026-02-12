//Copyright (C) 2025 bubartem
//
//This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
//
//This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.

const PRUNE_LEVEL = 1e-10;

export function rankUpSSR(distributionSSR, distributionSSRData, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, rateUpOdds = 0.5, normalizeSum, boundsIndices) {
    let isCharacter;
    let isWeapon;
    for (const distribution of distributionSSRData) {
        if (distribution !== null) {
            isCharacter = distribution.type === 'Character';
            isWeapon = distribution.type === 'Weapon';
            break;
        }
    }
    let charPullsSum, wepPullsSum;

    if (isCharacter) {
        charPullsSum = 1;
        wepPullsSum = 0;
    } else if (isWeapon) {
        charPullsSum = 0;
        wepPullsSum = 1;
    }

    const rankUps = [];
    const pullsPerBanner = {};
    const maxActive = boundsIndices.maxItem;
    const minActive = boundsIndices.minItem;

    for (let wins = maxActive; wins >= minActive; wins--) {
        const currentArray = distributionSSR[wins];
        if (isCharacter) {
            handleSSR(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, rankUps, normalizeSum);
        } else if (isWeapon) {
            handleSSR(ODDS_WEAPON_SSR, wins, distributionSSR, distributionSSRData, rankUps, currentArray.type);
        } else {
            throw new Error(`Unknown SSR array type: ${currentArray.type}`);
        }
    }
    let isEmpty = false;
    isEmpty = findBounds(distributionSSR, distributionSSRData, normalizeSum, boundsIndices);

    return isEmpty;

    function findBounds(distribution, distributionSSRData, normalizeSum, boundsIndices) {
        const minItem = boundsIndices.minItem;
        if (boundsIndices.maxItem + 3 !== distributionSSRData.length) {
            if (boundsIndices.maxItem + 4 === distributionSSRData.length) {
                boundsIndices.maxItem += 1;
            } else {
                boundsIndices.maxItem += 2;
            }
        }
        const maxItem = boundsIndices.maxItem;
        const oldData = distributionSSRData;
        let minItemNotFound = true;
        let i = minItem;
        let sum = 0;
        const Prune = PRUNE_LEVEL;
        const SPARKS = 360;
        const PITY_STATES = 80;
        const STATES_PER_KEY = PITY_STATES * SPARKS;
        const iteration = STATES_PER_KEY + 361;

        while (minItemNotFound && i <= maxItem) {
            let maxIndex;
            const maxIndexFromCurrent = oldData[i].maxIndex + iteration;
            if (i - 1 !== -1) { // should look for -2 too?
                const maxIndexFromLast = oldData[i - 1].maxIndex + 1; // if new banner no spark either, win so pity should reset, can account for
                if (maxIndexFromLast > maxIndexFromCurrent) { // if from last is undefined(i is 0) it would still work, but make it proper later
                    maxIndex = maxIndexFromLast;
                } else {
                    maxIndex = maxIndexFromCurrent;
                }
            } else {
                maxIndex = maxIndexFromCurrent;
            }

            const distr = distribution[i];
            const data = distributionSSRData[i];
            for (let j = data.minIndex; j <= maxIndex; j++) {
                const probJ = distr[j];
                if (probJ > Prune) {
                    boundsIndices.minItem = i;
                    data.minIndex = j;
                    minItemNotFound = false;
                    for (let k = maxIndex; k >= j; k--) {
                        const probK = distr[k];
                        if (probK > Prune) {
                            data.maxIndex = k;
                            break;
                        } else if (probK > 0) {
                            sum += probK;
                            distr[k] = 0;
                        }
                    }
                    break;
                } else if (probJ > 0) {
                    sum += probJ;
                    distr[j] = 0;
                }
            }
            if (minItemNotFound) {
                if (distribution[i - 1] == undefined) { // == will count undefined (-1 index) and nulls 
                    distribution[i] = null;
                    if (i === distribution.length - 3) {
                        return true;
                    }
                } else {
                    distributionSSRData[i].minIndex = 0;
                    distributionSSRData[i].maxIndex = 0;
                }
                distributionSSRData[i + 1].minIndex = 0;
                distributionSSRData[i + 1].maxIndex = 0;
            }
            i++;
        }

        while (i <= maxItem) {
            let maxIndex;
            const maxIndexFromCurrent = oldData[i].maxIndex + iteration;
            if (i - 1 !== -1) {
                const maxIndexFromLast = oldData[i - 1].maxIndex + 1; // if new banner no spark either, win so pity should reset, can account for
                if (maxIndexFromLast > maxIndexFromCurrent) { // if from last is undefined(i is 0) it would still work, but make it proper later
                    maxIndex = maxIndexFromLast;
                } else {
                    maxIndex = maxIndexFromCurrent;
                }
            } else {
                maxIndex = maxIndexFromCurrent;
            }

            const distr = distribution[i];
            const data = distributionSSRData[i];
            for (let j = 0; j <= maxIndex; j++) {
                const probJ = distr[j];
                if (probJ > Prune) {
                    data.minIndex = j;
                    for (let k = maxIndex; k >= j; k--) {
                        const probK = distr[k];
                        if (probK > Prune) {
                            data.maxIndex = k;
                            break;
                        } else if (probK > 0) {
                            sum += probK;
                            distr[k] = 0;
                        }
                    }
                    break;
                } else if (probJ > 0) {
                    sum += probJ;
                    distr[j] = 0;
                }
            }
            i++;
        }
        normalizeSum[0] += sum;
    }

    function lossPerBannerType(charPullsSum, wepPullsSum, rankUps) {
        return;
    }
}

export function rankUpSR(distributionSR, pullsCoef, ODDS_SR) {
    if (distributionSR[0].states.length === 0) {
        return;
    }
    const last = distributionSR.length - 1;
    for (let wins = last; wins >= 0; wins--) {
        const currentArray = distributionSR[wins];
        if (!currentArray.isEmpty) {
            handleSR(ODDS_SR, wins, distributionSR, pullsCoef);
        }
    }
}

export function rankUpSSRCheap(distributionSSR, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, rateUpOdds = 0.5) {
    const lastActive = distributionSSR.length - 2;
    for (let wins = lastActive; wins >= 0; wins--) {
        const currentArray = distributionSSR[wins];
        if (currentArray && !currentArray.isEmpty) {
            if (currentArray.type === 'Character') {
                handleSSRCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, currentArray.type);
            } else if (currentArray.type === 'Weapon') {
                handleSSRCheap(ODDS_WEAPON_SSR, wins, distributionSSR, currentArray.type);
            } else {
                throw new Error(`Unknown SSR array type: ${currentArray.type}`);
            }
        }
    }
}

function handleSSR(odds, inputIndex, array, arrayData, rankUps, normalizeSum) {
    const SPARKS = 360;
    const SPARKS_PAST_GUARANTEE = 120;
    const PITY_STATES = 80;
    const STATES_PER_KEY = PITY_STATES * SPARKS;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const currentBannerCount = currentItemData.bannerCount;

    const nextStates = array[inputIndex + 1];
    const nextItemData = arrayData[inputIndex + 1];
    const areNextStatesNewBanner = nextItemData.bannerCount !== currentBannerCount;

    const doubleNextStates = array[inputIndex + 2];
    const doubleNextItemData = arrayData[inputIndex + 2];
    const areDoubleNextStatesNewBanner = doubleNextItemData.bannerCount !== currentBannerCount;

    let rankUpsSum = 0;
    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    let withinKey = startingIndex % STATES_PER_KEY;
    let keyIndex = startingIndex - withinKey;
    let pity = (withinKey / SPARKS) | 0;
    let spark = withinKey % SPARKS;
    let pityIndex = withinKey - spark;
    let i = startingIndex;

    let winLossOdds = odds[pity] * 0.5;
    let SSRLossOdds = 1 - odds[pity];

    if (areNextStatesNewBanner) {
        while (i >= finalIndex) {
            const prob = currentStates[i];
            if (prob < PRUNE_LEVEL) {
                if (prob > 0) normalizeSum[0] += prob;
                currentStates[i] = 0;
                spark--;
                if (spark === -1) {
                    spark = SPARKS - 1;
                    pity--;
                    if (pity === -1) {
                        pity = PITY_STATES - 1;
                        pityIndex = (PITY_STATES - 1) * SPARKS;
                        keyIndex -= STATES_PER_KEY;
                    } else {
                        pityIndex -= SPARKS;
                    }

                    winLossOdds = odds[pity] * 0.5;
                    SSRLossOdds = 1 - odds[pity];
                }
                i--;
                continue;
            }

            const guaranteeActive = (spark < 120);

            if (guaranteeActive) {
                const isGuarantee = (spark === 119);
                if (isGuarantee) {
                    rankUpsSum += prob;
                    nextStates[keyIndex] += prob;
                } else {
                    const probSSRWinLoss = prob * winLossOdds;
                    const probNoSSR = prob * SSRLossOdds;
                    rankUpsSum += probSSRWinLoss;

                    nextStates[keyIndex] += probSSRWinLoss
                    currentStates[i + STATES_PER_KEY - pityIndex + 1] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + 1 iterates spark
                    currentStates[i + 361] += probNoSSR; // iterates pity and spark
                }
            } else {
                const isSpark = (spark === 359);
                const probSSRWinLoss = prob * winLossOdds;
                const probNoSSR = prob * SSRLossOdds;
                rankUpsSum += probSSRWinLoss;

                if (isSpark) {
                    doubleNextStates[keyIndex] += probSSRWinLoss;
                    nextStates[keyIndex + STATES_PER_KEY] += probSSRWinLoss; // key iterates, pity reset, spark reset
                    nextStates[keyIndex + pityIndex + SPARKS] += probNoSSR; // pity iterates, spark reset
                } else {
                    nextStates[keyIndex] += probSSRWinLoss;
                    currentStates[i + STATES_PER_KEY - pityIndex + 1] += probSSRWinLoss; //  + 1 iterates key, - pity * KEYS means to reset pity, + 1 iterates spark
                    currentStates[i + 361] += probNoSSR; // iterates pity and spark
                }
            }

            currentStates[i] = 0;
            spark--;
            if (spark === -1) {
                spark = SPARKS - 1;
                pity--;
                if (pity === -1) {
                    pity = PITY_STATES - 1;
                    pityIndex = (PITY_STATES - 1) * SPARKS;
                    keyIndex -= STATES_PER_KEY;
                } else {
                    pityIndex -= SPARKS;
                }

                winLossOdds = odds[pity] * 0.5;
                SSRLossOdds = 1 - odds[pity];
            }
            i--;
        }
    } else {
        while (i >= finalIndex) {
            const prob = currentStates[i];
            if (prob < PRUNE_LEVEL) {
                if (prob > 0) normalizeSum[0] += prob;
                currentStates[i] = 0;
                spark--;
                if (spark === -1) {
                    spark = SPARKS - 1;
                    pity--;
                    if (pity === -1) {
                        pity = PITY_STATES - 1;
                        pityIndex = (PITY_STATES - 1) * SPARKS;
                        keyIndex -= STATES_PER_KEY;
                    } else {
                        pityIndex -= SPARKS;
                    }

                    winLossOdds = odds[pity] * 0.5;
                    SSRLossOdds = 1 - odds[pity];
                }
                i--;
                continue;
            }

            const guaranteeActive = (spark < 120);

            if (guaranteeActive) {
                const isGuarantee = (spark === 119);
                if (isGuarantee) {
                    rankUpsSum += prob;
                    nextStates[keyIndex + spark + SPARKS_PAST_GUARANTEE + 1] += prob;
                } else {
                    const probSSRWinLoss = prob * winLossOdds;
                    const probNoSSR = prob * SSRLossOdds;
                    rankUpsSum += probSSRWinLoss;

                    nextStates[keyIndex + spark + SPARKS_PAST_GUARANTEE + 1] += probSSRWinLoss;
                    currentStates[i + STATES_PER_KEY - pityIndex + 1] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + 1 iterates spark
                    currentStates[i + 361] += probNoSSR; // iterates pity and spark
                }
            } else {
                const isSpark = (spark === 359);
                const probSSRWinLoss = prob * winLossOdds;
                const probNoSSR = prob * SSRLossOdds;
                rankUpsSum += probSSRWinLoss;

                if (isSpark) {
                    if (areDoubleNextStatesNewBanner) {
                        doubleNextStates[keyIndex] += probSSRWinLoss
                    } else {
                        doubleNextStates[keyIndex + SPARKS_PAST_GUARANTEE] += probSSRWinLoss;
                    }
                    nextStates[keyIndex + STATES_PER_KEY + SPARKS_PAST_GUARANTEE] += probSSRWinLoss; // iterates key, resets pity, saves guarantee inactivity
                    nextStates[keyIndex + pityIndex + SPARKS + SPARKS_PAST_GUARANTEE] += probNoSSR; // pity iterates, saves guarantee inactivity
                } else {
                    nextStates[keyIndex + spark + 1] += probSSRWinLoss;
                    currentStates[i + STATES_PER_KEY - pityIndex + 1] += probSSRWinLoss; //  + 1 iterates key, - pity * KEYS means to reset pity, + 1 iterates spark
                    currentStates[i + 361] += probNoSSR; // iterates pity and spark
                }
            }

            currentStates[i] = 0;
            spark--;
            if (spark === -1) {
                spark = SPARKS - 1;
                pity--;
                if (pity === -1) {
                    pity = PITY_STATES - 1;
                    pityIndex = (PITY_STATES - 1) * SPARKS;
                    keyIndex -= STATES_PER_KEY;
                } else {
                    pityIndex -= SPARKS;
                }

                winLossOdds = odds[pity] * 0.5;
                SSRLossOdds = 1 - odds[pity];
            }
            i--;
        }
    }

    rankUps[0] += rankUpsSum;
}

function handleSR(odds, inputIndex, array, pullsCoef) { // dif is no rate ups at all, means just count how much, it's already a map, so key means amount of success
    const size = array[0].states.length;
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

function handleSSRCheap(odds, inputIndex, array, type) {
    array[inputIndex].isEmpty = true;
    for (let i = array[inputIndex].spark.length - 1; i >= 0; i--) {
        const isLast = inputIndex + 2 === array.length;
        const sparkState = array[inputIndex].spark[i];

        if (sparkState && !sparkState.isEmpty) {
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
                    let isGuarantee, isSpark;

                    if (type === 'Character') {
                        if (i === 119 && currentKey === 0) {
                            isGuarantee = true;
                        } else {
                            isGuarantee = false;
                        }
                        if (i === 239) {
                            isSpark = true;
                        } else {
                            isSpark = false;
                        }
                    } else {
                        isGuarantee = sparkCounter === 80;
                        if (sparkCounter > 1120) isSpark = (sparkCounter - 1120) % 160 === 0;
                    }

                    let currentOdds = odds[j];
                    if (isGuarantee) {
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
                        } else if (isGuarantee) {
                            nextKey = 1;
                        }
                        if (isLast) {
                            targetMap = nextStates[0];
                        } else if (isSpark) {
                            if (isDoubleLast) {
                                targetMap = doubleNextStates[0];
                            } else {
                                targetMap = doubleNextStates[0].pity[0];
                                doubleNextStates[0].isEmpty = false;
                                array[inputIndex + 2].isEmpty = false;
                            }
                            if (!areNextStatesNewBanner && areDoubleNextStatesNewBanner) {
                                nextKey = 0;
                            }
                        } else {
                            targetMap = nextStates[i + 1].pity[0];
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
                        if (isSpark) {
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
                        if (isSpark) {
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
                    currentMap.prob = 0;
                }
            }
        }
    }
}