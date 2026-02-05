//Copyright (C) 2025 bubartem
//
//This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
//
//This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.

const PRUNE_LEVEL = 1e-10;

export function rankUpSSR(distributionSSR, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, rateUpOdds = 0.5, normalizeSum, boundsIndices) {
    let isCharacter;
    let isWeapon;
    for (const distribution of distributionSSR) {
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
            handleSSR(ODDS_CHARACTER_SSR, wins, distributionSSR, rankUps, currentArray.type, normalizeSum, boundsIndices);
        } else if (isWeapon) {
            handleSSR(ODDS_WEAPON_SSR, wins, distributionSSR, rankUps, currentArray.type);
        } else {
            throw new Error(`Unknown SSR array type: ${currentArray.type}`);
        }
    }

    findBounds(distributionSSR, normalizeSum, boundsIndices);

    return lossPerBannerType(charPullsSum, wepPullsSum, rankUps);;

    function findBounds(distribution, normalizeSum, boundsIndices) {
        const minItem = boundsIndices.minItem;
        const maxItem = boundsIndices.maxItem;
        let minItemNotFound = true;
        let i = minItem;
        let sum = 0;
        const Prune = PRUNE_LEVEL;

        while (minItemNotFound && i <= maxItem) {
            const arr = distribution[i];
            const distr = arr.distribution;
            const distrLength = distr.length;
            for (let j = arr.minIndex; j < distrLength; j++) {
                const probJ = distr[j];
                if (probJ > Prune) {
                    boundsIndices.minItem = i;
                    arr.minIndex = j;
                    minItemNotFound = false;
                    for (let k = distrLength - 1; k >= j; k--) {
                        const probK = distr[k];
                        if (probK > Prune) {
                            arr.maxIndex = k;
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
                if (distribution[i - 1] == undefined) { // will count undefined (-1 index) and nulls 
                    distribution[i].distribution = null;
                } else {
                    distribution[i].minIndex = 0;
                    distribution[i].maxIndex = 0;
                }
                distribution[i + 1].minIndex = 0;
                distribution[i + 1].maxIndex = 0;
            }
            i++;
        }

        while (i <= maxItem) {
            const arr = distribution[i];
            const distr = arr.distribution;
            const distrLength = distr.length;
            for (let j = 0; j < distrLength; j++) {
                const probJ = distr[j];
                if (probJ > Prune) {
                    arr.minIndex = j;
                    for (let k = distrLength - 1; k >= j; k--) {
                        const probK = distr[k];
                        if (probK > Prune) {
                            arr.maxIndex = k;
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

function handleSSR(odds, inputIndex, array, rankUps, type, normalizeSum, boundsIndices) {
    const SPARKS = 360;
    const SPARKS_PAST_GUARANTEE = 120;
    const PITY_STATES = 80;
    const KEYS = 20;
    const STATES_PER_SPARK = PITY_STATES * KEYS; // 800

    const currentItem = array[inputIndex];
    const currentStates = currentItem.distribution;
    const currentBannerCount = currentItem.bannerCount;

    const nextItem = array[inputIndex + 1];
    const nextStates = nextItem.distribution;
    const areNextStatesNewBanner = nextItem.bannerCount !== currentBannerCount;
    const isLast = inputIndex + 3 === array.length;

    const doubleNextItem = array[inputIndex + 2];
    const doubleNextStates = doubleNextItem.distribution;
    const areDoubleNextStatesNewBanner = doubleNextItem.bannerCount !== currentBannerCount;
    const isDoubleLast = inputIndex + 4 === array.length;

    const BASE_RATE_UP = 0.5;
    let maxNotFound = false;
    let nextMaxNotFound = false;
    let doubleNextNotFound = false;
    if (!isLast) {
        if (isDoubleLast) {
            doubleNextNotFound = true; // only looks for next since double next is results
        } else {
            if (inputIndex === boundsIndices.maxItem) {
                maxNotFound = true;
                nextMaxNotFound = true;
            } else if (inputIndex === boundsIndices.maxItem - 1) {
                maxNotFound = true; // triggers only if previous item got no next item even, only looks for doubleNext
            }
        }
    }
    let startingIndex = currentItem.maxIndex;
    let finalIndex = currentItem.minIndex;

    let spark = Math.floor(startingIndex / STATES_PER_SPARK);
    let withinSpark = startingIndex % STATES_PER_SPARK;
    let pity = Math.floor(withinSpark / KEYS);
    let key = withinSpark % KEYS;
    let i = startingIndex;

    if (areNextStatesNewBanner) {
        while (doubleNextNotFound && i >= finalIndex) {
            const prob = currentStates[i];
            if (prob < PRUNE_LEVEL) {
                if (prob > 0) normalizeSum[0] += prob;
                currentStates[i] = 0;
                key--;
                if (key === -1) {
                    key = KEYS - 1;
                    pity--;
                    if (pity === -1) {
                        pity = PITY_STATES - 1;
                        spark--; // if spark goes negative index is negative as well and it ends anyways
                    }
                }
                i--;
                continue;
            }

            const isSpark = (spark === 359);
            const isGuarantee = (spark === 119);
            const guaranteeActive = (spark < 120);
            const currentOdds = odds[pity];

            if (guaranteeActive) {
                if (isGuarantee) {
                    rankUps[0] += prob;
                    nextStates[key] += prob;
                    doubleNextNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                } else {
                    const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                    const probNoSSR = prob * (1 - currentOdds);
                    rankUps[0] += probSSRWinLoss;

                    nextStates[key] += probSSRWinLoss
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                    doubleNextNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                }
            } else {
                const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                const probNoSSR = prob * (1 - currentOdds);
                rankUps[0] += probSSRWinLoss;

                if (isSpark) {
                    doubleNextStates[key] += probSSRWinLoss;
                    nextStates[key + 1] += probSSRWinLoss; // key iterates, pity reset, spark reset
                    nextStates[key + (pity + 1) * KEYS] += probNoSSR; // pity iterates, spark reset

                    doubleNextNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                } else {
                    nextStates[key] += probSSRWinLoss;
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; //  + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                    doubleNextNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                }
            }

            currentStates[i] = 0;
            key--;
            if (key === -1) {
                key = KEYS - 1;
                pity--;
                if (pity === -1) {
                    pity = PITY_STATES - 1;
                    spark--; // if spark goes negative index is negative as well and it ends anyways
                }
            }
            i--;
        }
        while (nextMaxNotFound && i >= finalIndex) {
            const prob = currentStates[i];
            if (prob < PRUNE_LEVEL) {
                if (prob > 0) normalizeSum[0] += prob;
                currentStates[i] = 0;
                key--;
                if (key === -1) {
                    key = KEYS - 1;
                    pity--;
                    if (pity === -1) {
                        pity = PITY_STATES - 1;
                        spark--; // if spark goes negative index is negative as well and it ends anyways
                    }
                }
                i--;
                continue;
            }

            const isSpark = (spark === 359);
            const isGuarantee = (spark === 119);
            const guaranteeActive = (spark < 120);
            const currentOdds = odds[pity];

            if (guaranteeActive) {
                if (isGuarantee) {
                    rankUps[0] += prob;
                    nextStates[key] += prob;
                    nextMaxNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                } else {
                    const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                    const probNoSSR = prob * (1 - currentOdds);
                    rankUps[0] += probSSRWinLoss;

                    nextStates[key] += probSSRWinLoss
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                    nextMaxNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                }
            } else {
                const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                const probNoSSR = prob * (1 - currentOdds);
                rankUps[0] += probSSRWinLoss;

                if (isSpark) {
                    doubleNextStates[key] += probSSRWinLoss;
                    nextStates[key + 1] += probSSRWinLoss; // key iterates, pity reset, spark reset
                    nextStates[key + (pity + 1) * KEYS] += probNoSSR; // pity iterates, spark reset

                    if (isDoubleLast) {
                        nextMaxNotFound = false;
                        boundsIndices.maxItem = inputIndex + 1;
                    } else {
                        nextMaxNotFound = false;
                        maxNotFound = false;
                        boundsIndices.maxItem = inputIndex + 2;
                    }
                } else {
                    nextStates[key] += probSSRWinLoss
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; //  + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                    nextMaxNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                }
            }

            currentStates[i] = 0;
            key--;
            if (key === -1) {
                key = KEYS - 1;
                pity--;
                if (pity === -1) {
                    pity = PITY_STATES - 1;
                    spark--; // if spark goes negative index is negative as well and it ends anyways
                }
            }
            i--;
        }
        while (maxNotFound && i >= finalIndex) {
            const prob = currentStates[i];
            if (prob < PRUNE_LEVEL) {
                if (prob > 0) normalizeSum[0] += prob;
                currentStates[i] = 0;
                key--;
                if (key === -1) {
                    key = KEYS - 1;
                    pity--;
                    if (pity === -1) {
                        pity = PITY_STATES - 1;
                        spark--; // if spark goes negative index is negative as well and it ends anyways
                    }
                }
                i--;
                continue;
            }

            const isSpark = (spark === 359);
            const isGuarantee = (spark === 119);
            const guaranteeActive = (spark < 120);
            const currentOdds = odds[pity];

            if (guaranteeActive) {
                if (isGuarantee) {
                    rankUps[0] += prob;
                    nextStates[key] += prob;
                } else {
                    const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                    const probNoSSR = prob * (1 - currentOdds);
                    rankUps[0] += probSSRWinLoss;

                    nextStates[key] += probSSRWinLoss
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                }
            } else {
                const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                const probNoSSR = prob * (1 - currentOdds);
                rankUps[0] += probSSRWinLoss;

                if (isSpark) {
                    doubleNextStates[key] += probSSRWinLoss;
                    nextStates[key + 1] += probSSRWinLoss; // key iterates, pity reset, spark reset
                    nextStates[key + (pity + 1) * KEYS] += probNoSSR; // pity iterates, spark reset

                    maxNotFound = false;
                    boundsIndices.maxItem = inputIndex + 2;
                } else {
                    nextStates[key] += probSSRWinLoss
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; //  + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                }
            }

            currentStates[i] = 0;
            key--;
            if (key === -1) {
                key = KEYS - 1;
                pity--;
                if (pity === -1) {
                    pity = PITY_STATES - 1;
                    spark--; // if spark goes negative index is negative as well and it ends anyways
                }
            }
            i--;
        }
        while (i >= finalIndex) {
            const prob = currentStates[i];
            if (prob < PRUNE_LEVEL) {
                if (prob > 0) normalizeSum[0] += prob;
                currentStates[i] = 0;
                key--;
                if (key === -1) {
                    key = KEYS - 1;
                    pity--;
                    if (pity === -1) {
                        pity = PITY_STATES - 1;
                        spark--; // if spark goes negative index is negative as well and it ends anyways
                    }
                }
                i--;
                continue;
            }

            const isSpark = (spark === 359);
            const isGuarantee = (spark === 119);
            const guaranteeActive = (spark < 120);
            const currentOdds = odds[pity];

            if (guaranteeActive) {
                if (isGuarantee) {
                    rankUps[0] += prob;
                    nextStates[key] += prob;
                } else {
                    const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                    const probNoSSR = prob * (1 - currentOdds);
                    rankUps[0] += probSSRWinLoss;

                    nextStates[key] += probSSRWinLoss
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                }
            } else {
                const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                const probNoSSR = prob * (1 - currentOdds);
                rankUps[0] += probSSRWinLoss;

                if (isSpark) {
                    doubleNextStates[key] += probSSRWinLoss;
                    nextStates[key + 1] += probSSRWinLoss; // key iterates, pity reset, spark reset
                    nextStates[key + (pity + 1) * KEYS] += probNoSSR; // pity iterates, spark reset
                } else {
                    nextStates[key] += probSSRWinLoss;
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; //  + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                }
            }

            currentStates[i] = 0;
            key--;
            if (key === -1) {
                key = KEYS - 1;
                pity--;
                if (pity === -1) {
                    pity = PITY_STATES - 1;
                    spark--; // if spark goes negative index is negative as well and it ends anyways
                }
            }
            i--;
        }
    } else {
        while (doubleNextNotFound && i >= finalIndex) {
            const prob = currentStates[i];
            if (prob < PRUNE_LEVEL) {
                if (prob > 0) normalizeSum[0] += prob;
                currentStates[i] = 0;
                key--;
                if (key === -1) {
                    key = KEYS - 1;
                    pity--;
                    if (pity === -1) {
                        pity = PITY_STATES - 1;
                        spark--; // if spark goes negative index is negative as well and it ends anyways
                    }
                }
                i--;
                continue;
            }

            const isSpark = (spark === 359);
            const isGuarantee = (spark === 119);
            const guaranteeActive = (spark < 120);
            const currentOdds = odds[pity];

            if (guaranteeActive) {
                if (isGuarantee) {
                    rankUps[0] += prob;
                    nextStates[key + (spark + SPARKS_PAST_GUARANTEE + 1) * STATES_PER_SPARK] += prob;
                    doubleNextNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                } else {
                    const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                    const probNoSSR = prob * (1 - currentOdds);
                    rankUps[0] += probSSRWinLoss;

                    nextStates[key + (spark + 1) * STATES_PER_SPARK] += probSSRWinLoss
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                    doubleNextNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                }
            } else {
                const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                const probNoSSR = prob * (1 - currentOdds);
                rankUps[0] += probSSRWinLoss;

                if (isSpark) {
                    if (areDoubleNextStatesNewBanner) {
                        doubleNextStates[key] += probSSRWinLoss
                    } else {
                        doubleNextStates[key + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probSSRWinLoss;
                    }
                    nextStates[key + 1 + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probSSRWinLoss; // iterates key, resets pity, saves guarantee inactivity
                    nextStates[key + (pity + 1) * KEYS + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probNoSSR; // pity iterates, saves guarantee inactivity

                    doubleNextNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                } else {
                    nextStates[key + (spark + 1) * STATES_PER_SPARK] += probSSRWinLoss;
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; //  + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                    doubleNextNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                }
            }

            currentStates[i] = 0;
            key--;
            if (key === -1) {
                key = KEYS - 1;
                pity--;
                if (pity === -1) {
                    pity = PITY_STATES - 1;
                    spark--; // if spark goes negative index is negative as well and it ends anyways
                }
            }
            i--;
        }
        while (nextMaxNotFound && i >= finalIndex) {
            const prob = currentStates[i];
            if (prob < PRUNE_LEVEL) {
                if (prob > 0) normalizeSum[0] += prob;
                currentStates[i] = 0;
                key--;
                if (key === -1) {
                    key = KEYS - 1;
                    pity--;
                    if (pity === -1) {
                        pity = PITY_STATES - 1;
                        spark--; // if spark goes negative index is negative as well and it ends anyways
                    }
                }
                i--;
                continue;
            }

            const isSpark = (spark === 359);
            const isGuarantee = (spark === 119);
            const guaranteeActive = (spark < 120);
            const currentOdds = odds[pity];

            if (guaranteeActive) {
                if (isGuarantee) {
                    rankUps[0] += prob;
                    nextStates[key + (spark + SPARKS_PAST_GUARANTEE + 1) * STATES_PER_SPARK] += prob;
                    nextMaxNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                } else {
                    const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                    const probNoSSR = prob * (1 - currentOdds);
                    rankUps[0] += probSSRWinLoss;

                    nextStates[key + (spark + 1) * STATES_PER_SPARK] += probSSRWinLoss
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                    nextMaxNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                }
            } else {
                const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                const probNoSSR = prob * (1 - currentOdds);
                rankUps[0] += probSSRWinLoss;

                if (isSpark) {
                    if (areDoubleNextStatesNewBanner) {
                        doubleNextStates[key] += probSSRWinLoss
                    } else {
                        doubleNextStates[key + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probSSRWinLoss;
                    }
                    nextStates[key + 1 + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probSSRWinLoss; // iterates key, resets pity, saves guarantee inactivity
                    nextStates[key + (pity + 1) * KEYS + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probNoSSR; // pity iterates, saves guarantee inactivity

                    if (isDoubleLast) {
                        nextMaxNotFound = false;
                        boundsIndices.maxItem = inputIndex + 1;
                    } else {
                        nextMaxNotFound = false;
                        maxNotFound = false;
                        boundsIndices.maxItem = inputIndex + 2;
                    }
                } else {
                    nextStates[key + (spark + 1) * STATES_PER_SPARK] += probSSRWinLoss;
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; //  + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                    nextMaxNotFound = false;
                    boundsIndices.maxItem = inputIndex + 1;
                }
            }

            currentStates[i] = 0;
            key--;
            if (key === -1) {
                key = KEYS - 1;
                pity--;
                if (pity === -1) {
                    pity = PITY_STATES - 1;
                    spark--; // if spark goes negative index is negative as well and it ends anyways
                }
            }
            i--;
        }
        while (maxNotFound && i >= finalIndex) {
            const prob = currentStates[i];
            if (prob < PRUNE_LEVEL) {
                if (prob > 0) normalizeSum[0] += prob;
                currentStates[i] = 0;
                key--;
                if (key === -1) {
                    key = KEYS - 1;
                    pity--;
                    if (pity === -1) {
                        pity = PITY_STATES - 1;
                        spark--; // if spark goes negative index is negative as well and it ends anyways
                    }
                }
                i--;
                continue;
            }

            const isSpark = (spark === 359);
            const isGuarantee = (spark === 119);
            const guaranteeActive = (spark < 120);
            const currentOdds = odds[pity];

            if (guaranteeActive) {
                if (isGuarantee) {
                    rankUps[0] += prob;
                    nextStates[key + (spark + SPARKS_PAST_GUARANTEE + 1) * STATES_PER_SPARK] += prob;
                } else {
                    const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                    const probNoSSR = prob * (1 - currentOdds);
                    rankUps[0] += probSSRWinLoss;

                    nextStates[key + (spark + 1) * STATES_PER_SPARK] += probSSRWinLoss
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                }
            } else {
                const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                const probNoSSR = prob * (1 - currentOdds);
                rankUps[0] += probSSRWinLoss;

                if (isSpark) {
                    if (areDoubleNextStatesNewBanner) {
                        doubleNextStates[key] += probSSRWinLoss
                    } else {
                        doubleNextStates[key + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probSSRWinLoss;
                    }

                    maxNotFound = false;
                    boundsIndices.maxItem = inputIndex + 2;

                    nextStates[key + 1 + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probSSRWinLoss; // iterates key, resets pity, saves guarantee inactivity
                    nextStates[key + (pity + 1) * KEYS + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probNoSSR; // pity iterates, saves guarantee inactivity
                } else {
                    nextStates[key + (spark + 1) * STATES_PER_SPARK] += probSSRWinLoss;
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                }
            }

            currentStates[i] = 0;
            key--;
            if (key === -1) {
                key = KEYS - 1;
                pity--;
                if (pity === -1) {
                    pity = PITY_STATES - 1;
                    spark--; // if spark goes negative index is negative as well and it ends anyways
                }
            }
            i--;
        }
        while (i >= finalIndex) {
            const prob = currentStates[i];
            if (prob < PRUNE_LEVEL) {
                if (prob > 0) normalizeSum[0] += prob;
                currentStates[i] = 0;
                key--;
                if (key === -1) {
                    key = KEYS - 1;
                    pity--;
                    if (pity === -1) {
                        pity = PITY_STATES - 1;
                        spark--; // if spark goes negative index is negative as well and it ends anyways
                    }
                }
                i--;
                continue;
            }

            const isSpark = (spark === 359);
            const isGuarantee = (spark === 119);
            const guaranteeActive = (spark < 120);
            const currentOdds = odds[pity];

            if (guaranteeActive) {
                if (isGuarantee) {
                    rankUps[0] += prob;
                    nextStates[key + (spark + SPARKS_PAST_GUARANTEE + 1) * STATES_PER_SPARK] += prob;
                } else {
                    const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                    const probNoSSR = prob * (1 - currentOdds);
                    rankUps[0] += probSSRWinLoss;

                    nextStates[key + (spark + 1) * STATES_PER_SPARK] += probSSRWinLoss;
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; // + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                }
            } else {
                const probSSRWinLoss = prob * currentOdds * BASE_RATE_UP;
                const probNoSSR = prob * (1 - currentOdds);
                rankUps[0] += probSSRWinLoss;

                if (isSpark) {
                    if (areDoubleNextStatesNewBanner) {
                        doubleNextStates[key] += probSSRWinLoss
                    } else {
                        doubleNextStates[key + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probSSRWinLoss;
                    }
                    nextStates[key + 1 + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probSSRWinLoss; // iterates key, resets pity, saves guarantee inactivity
                    nextStates[key + (pity + 1) * KEYS + SPARKS_PAST_GUARANTEE * STATES_PER_SPARK] += probNoSSR; // pity iterates, saves guarantee inactivity
                } else {
                    nextStates[key + (spark + 1) * STATES_PER_SPARK] += probSSRWinLoss;
                    currentStates[i + 1 - pity * KEYS + STATES_PER_SPARK] += probSSRWinLoss; //  + 1 iterates key, - pity * KEYS means to reset pity, + STATES_PER_SPARK iterates spark
                    currentStates[i + KEYS + STATES_PER_SPARK] += probNoSSR; // iterates pity and spark
                }
            }

            currentStates[i] = 0;
            key--;
            if (key === -1) {
                key = KEYS - 1;
                pity--;
                if (pity === -1) {
                    pity = PITY_STATES - 1;
                    spark--; // if spark goes negative index is negative as well and it ends anyways
                }
            }
            i--;
        }
    }
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