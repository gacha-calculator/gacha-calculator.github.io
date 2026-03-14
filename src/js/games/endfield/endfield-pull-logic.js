//Copyright (C) 2025 bubartem
//
//This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
//
//This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.

const PRUNE_LEVEL = 1e-8;


export function rankUpSSR(distributionSSR, distributionSSRData, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, rateUpOdds = 0.5, boundsIndices, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark) {
    let isCharacter;
    let isWeapon;
    for (const distribution of distributionSSRData) {
        if (distribution !== null) {
            isCharacter = distribution.type === 'Character';
            isWeapon = distribution.type === 'Weapon';
            break;
        }
    }
    const maxActive = boundsIndices.maxItem;
    const minActive = boundsIndices.minItem;
    const PITY_STATES = ODDS_CHARACTER_SSR.length

    for (let wins = maxActive; wins >= minActive; wins--) {
        const currentArray = distributionSSR[wins];
        if (isCharacter) {
            if (distributionSSRData[wins].isFirst) {
                if (distributionSSRData[wins].bannerCount === distributionSSRData[wins + 1].bannerCount) {
                    handleSSRFirst(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble);
                } else {
                    handleSSRFirstNextNew(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps);
                }
            } else {
                if (distributionSSRData[wins].bannerCount === distributionSSRData[wins + 1].bannerCount) {
                    handleSSR(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark);
                } else {
                    handleSSRNextNew(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, probDistrRankUpsSpark);
                }
            }
        } else if (isWeapon) {
            continue;
        } else {
            throw new Error(`Unknown SSR array type: ${currentArray.type}`);
        }
    }
}

export function rankUpSSRPerItem(distributionSSR, distributionSSRData, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, rateUpOdds = 0.5, boundsIndices, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, perBannerData) {
    let isCharacter;
    let isWeapon;
    for (const distribution of distributionSSRData) {
        if (distribution !== null) {
            isCharacter = distribution.type === 'Character';
            isWeapon = distribution.type === 'Weapon';
            break;
        }
    }
    const maxActive = boundsIndices.maxItem;
    const minActive = boundsIndices.minItem;
    const PITY_STATES = ODDS_CHARACTER_SSR.length

    for (let wins = maxActive; wins >= minActive; wins--) {
        const currentArray = distributionSSR[wins];
        if (isCharacter) {
            if (distributionSSRData[wins].isFirst) {
                if (distributionSSRData[wins].bannerCount === distributionSSRData[wins + 1].bannerCount) {
                    handleSSRFirst(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble); // next isn't new so it writes normally and no spark so no double
                } else {
                    handleSSRFirstNextNewPerItem(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, perBannerData);
                }
            } else {
                if (distributionSSRData[wins].bannerCount === distributionSSRData[wins + 1].bannerCount) {
                    handleSSRPerItem(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, perBannerData);
                } else {
                    handleSSRNextNewPerItem(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, probDistrRankUpsSpark, perBannerData);
                }
            }
        } else if (isWeapon) {
            handleSSR(ODDS_WEAPON_SSR, wins, distributionSSR, distributionSSRData, rankUps, currentArray.type);
        } else {
            throw new Error(`Unknown SSR array type: ${currentArray.type}`);
        }
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

export function rankUpSSRCheap(distributionSSR, distributionSSRData, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, rateUpOdds = 0.5, boundsIndices, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, probDistrRankUpsPast, probDistrRankUpsDoublePast, urgentPullDistr, buffer, bufferSmall) {
    let isCharacter;
    let isWeapon;
    for (const distribution of distributionSSRData) {
        if (distribution !== null) {
            isCharacter = distribution.type === 'Character';
            isWeapon = distribution.type === 'Weapon';
            break;
        }
    }

    const maxActive = boundsIndices.maxItem;
    const minActive = boundsIndices.minItem;

    for (let wins = maxActive; wins >= minActive; wins--) {
        const currentArray = distributionSSR[wins];
        if (isCharacter) {
            if (distributionSSRData[wins].isFirst) {
                if (distributionSSRData[wins].bannerCount === distributionSSRData[wins + 1].bannerCount) {
                    handleSSRFirstCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsPast, probDistrRankUpsDoublePast, urgentPullDistr, bufferSmall);
                } else {
                    handleSSRFirstNextNewCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, probDistrRankUps, probDistrRankUpsPast, urgentPullDistr, bufferSmall);
                }
            } else {
                if (distributionSSRData[wins].bannerCount === distributionSSRData[wins + 1].bannerCount) {
                    handleSSRCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, buffer);
                } else {
                    handleSSRNextNewCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, probDistrRankUps, probDistrRankUpsSpark, buffer);
                }
            }
        } else if (isWeapon) {
            handleSSRWeapon(ODDS_WEAPON_SSR, wins, distributionSSR, distributionSSRData, probDistrRankUps);
        } else {
            throw new Error(`Unknown SSR array type: ${currentArray.type}`);
        }
    }
}

function handleSSRWeapon(odds, inputIndex, array, arrayData, probDistrRankUps) {
    let currentOdds = odds[0];
    let rankUps = probDistrRankUps[inputIndex];
    const guarantees = [180, 340, 500, 660];

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    if (startingIndex < finalIndex) return;

    let i = startingIndex;
    if (currentStates.length === 160) {
        while (i >= finalIndex) {
            let wOdds;
            let lOdds;
            let ssrLOdds;
            if (i + 1 === 40) {
                wOdds = 0.25;
                lOdds = 0.75;
                ssrLOdds = 0;
            } else if ((i + 1) % 80 === 0) {
                wOdds = 1;
                lOdds = 0;
                ssrLOdds = 0;
            } else {
                wOdds = currentOdds * 0.25;
                lOdds = currentOdds - wOdds;
                ssrLOdds = 1 - currentOdds;
            }
            const prob = currentStates[i];
            const winProb = prob * wOdds;

            if (i < 80) {
                if (winProb > 0) {
                    rankUps[i + 1].set(1, (rankUps[i + 1].get(1) || 0) + winProb);
                    const keys = [...rankUps[i].keys()].sort((a, b) => b - a);
                    for (const key of keys) {
                        const value = rankUps[i].get(key);
                        const move = value * wOdds;

                        const nextStay = rankUps[i + 1].get(key) || 0;
                        rankUps[i + 1].set(key, value - move + nextStay);

                        const nextKey = key + 1;
                        const currentNext = rankUps[i + 1].get(nextKey) || 0;
                        rankUps[i + 1].set(nextKey, currentNext + move);
                        rankUps[i].delete(key);
                    }
                }
                currentStates[i + 80 + 1] += prob * lOdds;
            } else {
                if (winProb > 0) {
                    rankUps[i - 80 + 1].set(1, (rankUps[i - 80 + 1].get(1) || 0) + winProb);
                    const keys = [...rankUps[i - 80].keys()].sort((a, b) => b - a);
                    for (const key of keys) {
                        const value = rankUps[i - 80].get(key);
                        const move = value * wOdds;

                        const nextStay = rankUps[i - 80 + 1].get(key) || 0;
                        rankUps[i - 80 + 1].set(key, value - move + nextStay);

                        const nextKey = key + 1;
                        const currentNext = rankUps[i - 80 + 1].get(nextKey) || 0;
                        rankUps[i - 80 + 1].set(nextKey, currentNext + move);
                        rankUps[i - 80].delete(key);
                    }
                }
                currentStates[i + 1] += prob * lOdds;
            }
            currentStates[i + 1] += prob * ssrLOdds;
            currentStates[i] = 0;
            i--;
        }
    } else {
        while (i >= finalIndex) {
            let wOdds;
            let lOdds;
            let ssrLOdds;
            if (guarantees.includes(i + 1)) {
                wOdds = 1;
                lOdds = 0;
                ssrLOdds = 0;
            } else {
                wOdds = currentOdds * 0.25;
                lOdds = currentOdds - wOdds;
                ssrLOdds = 1 - currentOdds;
            }
            const prob = currentStates[i];
            const winProb = prob * wOdds;
            if (winProb > 0) {
                rankUps[i + 1].set(1, (rankUps[i + 1].get(1) || 0) + winProb);
                const keys = [...rankUps[i].keys()].sort((a, b) => b - a);
                for (const key of keys) {
                    const value = rankUps[i].get(key);
                    const move = value * wOdds;

                    const nextStay = rankUps[i + 1].get(key) || 0;
                    rankUps[i + 1].set(key, value - move + nextStay);

                    const nextKey = key + 1;
                    const currentNext = rankUps[i + 1].get(nextKey) || 0;
                    rankUps[i + 1].set(nextKey, currentNext + move);
                    rankUps[i].delete(key);
                }
            }
            currentStates[i + 1] += prob * (ssrLOdds + lOdds);
            currentStates[i] = 0;
            i--;
        }
    }
}

function handleSSR(odds, inputIndex, array, arrayData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark) {
    const SPARKS = 240;
    const STATES_PER_KEY = PITY_STATES * SPARKS;
    const STATES_PER_KEY_NEW = STATES_PER_KEY * 0.5;
    let rankUps = 0;
    let rankUpsDouble = 0;
    let rankUpsSparks = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];

    const doubleNextStates = array[inputIndex + 2];
    const doubleNextItemData = arrayData[inputIndex + 2];
    const areDoubleNextStatesNewBanner = doubleNextItemData.isFirst;

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    if (startingIndex < finalIndex) return;

    let withinKey = startingIndex % STATES_PER_KEY;
    let keyIndex = startingIndex - withinKey;
    let pity = (withinKey / SPARKS) | 0;
    let spark = withinKey % SPARKS;
    let pityIndex = withinKey - spark;
    let i = startingIndex;
    let newBannerKeyIndex = keyIndex * 0.5;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    let currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
    let targetDoubleNextIdx = areDoubleNextStatesNewBanner ? newBannerKeyIndex : keyIndex;
    let nextStateSparkWinIdx = keyIndex + STATES_PER_KEY;
    let nextStateSparkLossIdx = keyIndex + pityIndex + SPARKS;

    while (i >= finalIndex) {
        const prob = currentStates[i];
        if (prob !== 0) {
            const probSSRWinLoss = prob * wlOdds;
            const probLoss = prob * lOdds;

            if (spark === 239) {
                doubleNextStates[targetDoubleNextIdx] += probSSRWinLoss;
                nextStates[nextStateSparkWinIdx] += probSSRWinLoss;
                nextStates[nextStateSparkLossIdx] += probLoss;
                rankUpsDouble += probSSRWinLoss;
                rankUpsSparks += probSSRWinLoss + probLoss;
            } else {
                nextStates[keyIndex + spark + 1] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 241] += probLoss;
                rankUps += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            if (pity === 0) {
                pity = PITY_STATES - 1;
                pityIndex = pity * SPARKS;
                keyIndex -= STATES_PER_KEY;
                newBannerKeyIndex -= STATES_PER_KEY_NEW;
            } else {
                pity -= 1;
                pityIndex -= SPARKS;
            }

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
            targetDoubleNextIdx = areDoubleNextStatesNewBanner ? newBannerKeyIndex : keyIndex;
            nextStateSparkWinIdx = keyIndex + STATES_PER_KEY;
            nextStateSparkLossIdx = keyIndex + pityIndex + SPARKS;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                const probSSRWinLoss = probSpark * wlOdds;
                const probLoss = probSpark * lOdds;
                doubleNextStates[targetDoubleNextIdx] += probSSRWinLoss;
                nextStates[nextStateSparkWinIdx] += probSSRWinLoss;
                nextStates[nextStateSparkLossIdx] += probLoss;
                rankUpsDouble += probSSRWinLoss;
                rankUpsSparks += probSSRWinLoss + probLoss;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 238; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[keyIndex + s + 1] += probSSRWinLoss;
                    currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                    currentStates[i + 241] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 239;

        if (pity === 0) {
            pity = PITY_STATES - 1;
            pityIndex = pity * SPARKS;
            keyIndex -= STATES_PER_KEY;
            newBannerKeyIndex -= STATES_PER_KEY_NEW;
        } else {
            pity -= 1;
            pityIndex -= SPARKS;
        }
        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
        targetDoubleNextIdx = areDoubleNextStatesNewBanner ? newBannerKeyIndex : keyIndex;
        nextStateSparkWinIdx = keyIndex + STATES_PER_KEY;
        nextStateSparkLossIdx = keyIndex + pityIndex + SPARKS;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            const probSSRWinLoss = probSpark * wlOdds;
            const probLoss = probSpark * lOdds;
            doubleNextStates[targetDoubleNextIdx] += probSSRWinLoss;
            nextStates[nextStateSparkWinIdx] += probSSRWinLoss;
            nextStates[nextStateSparkLossIdx] += probLoss;
            rankUpsDouble += probSSRWinLoss;
            rankUpsSparks += probSSRWinLoss + probLoss;
            currentStates[i] = 0;
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            const prob = currentStates[i];
            if (prob !== 0) {
                const probSSRWinLoss = prob * wlOdds;
                nextStates[keyIndex + spark + 1] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 241] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    probDistrRankUps[inputIndex] += rankUps;
    probDistrRankUpsDouble[inputIndex] += rankUpsDouble;
    probDistrRankUpsSpark[inputIndex] += rankUpsSparks;
}

function handleSSRNextNew(odds, inputIndex, array, arrayData, PITY_STATES, probDistrRankUps, probDistrRankUpsSpark) {
    const SPARKS = 240;
    const NEW_SPARKS = 120;
    const STATES_PER_KEY = PITY_STATES * SPARKS;
    const STATES_PER_KEY_NEW = STATES_PER_KEY * 0.5;
    let rankUps = 0;
    let rankUpsSparks = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    let withinKey = startingIndex % STATES_PER_KEY;
    let keyIndex = startingIndex - withinKey;
    let newBannerKeyIndex = keyIndex * 0.5;
    let pity = (withinKey / SPARKS) | 0;
    let spark = withinKey % SPARKS;
    let pityIndex = withinKey - spark;
    let newPityIndex = pityIndex * 0.5;
    let i = startingIndex;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    let currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
    let nextStateSparkWinIdx = newBannerKeyIndex + STATES_PER_KEY_NEW;
    let nextStateSparkLossIdx = newBannerKeyIndex + newPityIndex + NEW_SPARKS;

    while (i >= finalIndex) {
        const prob = currentStates[i];
        if (prob !== 0) {
            const probSSRWinLoss = prob * wlOdds;
            const probLoss = prob * lOdds;

            if (spark === 239) {
                nextStates[newBannerKeyIndex] += probSSRWinLoss;
                nextStates[nextStateSparkWinIdx] += probSSRWinLoss;
                nextStates[nextStateSparkLossIdx] += probLoss;
                rankUpsSparks += probSSRWinLoss + probSSRWinLoss + probLoss;
            } else {
                nextStates[newBannerKeyIndex] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 241] += probLoss;
                rankUps += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            if (pity === 0) {
                pity = PITY_STATES - 1;
                pityIndex = pity * SPARKS;
                newPityIndex = pityIndex * 0.5;
                newBannerKeyIndex -= STATES_PER_KEY_NEW;
            } else {
                pity -= 1;
                pityIndex -= SPARKS;
                newPityIndex -= NEW_SPARKS;
            }

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
            nextStateSparkWinIdx = newBannerKeyIndex + STATES_PER_KEY_NEW;
            nextStateSparkLossIdx = newBannerKeyIndex + newPityIndex + NEW_SPARKS;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                const probSSRWinLoss = probSpark * wlOdds;
                const probLoss = probSpark * lOdds;
                nextStates[newBannerKeyIndex] += probSSRWinLoss;
                nextStates[nextStateSparkWinIdx] += probSSRWinLoss;
                nextStates[nextStateSparkLossIdx] += probLoss;
                rankUpsSparks += probSSRWinLoss + probSSRWinLoss + probLoss;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 238; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[newBannerKeyIndex] += probSSRWinLoss;
                    currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                    currentStates[i + 241] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 239;
        if (pity === 0) {
            pity = PITY_STATES - 1;
            pityIndex = pity * SPARKS;
            newPityIndex = pityIndex * 0.5;
            newBannerKeyIndex -= STATES_PER_KEY_NEW;
        } else {
            pity -= 1;
            pityIndex -= SPARKS;
            newPityIndex -= NEW_SPARKS;
        }

        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
        nextStateSparkWinIdx = newBannerKeyIndex + STATES_PER_KEY_NEW;
        nextStateSparkLossIdx = newBannerKeyIndex + newPityIndex + NEW_SPARKS;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            const probSSRWinLoss = probSpark * wlOdds;
            const probLoss = probSpark * lOdds;
            nextStates[newBannerKeyIndex] += probSSRWinLoss;
            nextStates[nextStateSparkWinIdx] += probSSRWinLoss;
            nextStates[nextStateSparkLossIdx] += probLoss;
            rankUpsSparks += probSSRWinLoss + probSSRWinLoss + probLoss;
            currentStates[i] = 0;
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            const prob = currentStates[i];
            if (prob !== 0) {
                const probSSRWinLoss = prob * wlOdds;
                nextStates[newBannerKeyIndex] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 241] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    probDistrRankUps[inputIndex] += rankUps;
    probDistrRankUpsSpark[inputIndex] += rankUpsSparks;
}

function handleSSRFirst(odds, inputIndex, array, arrayData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble) {
    const SPARKS = 120;
    const STATES_PER_KEY = PITY_STATES * SPARKS;
    const STATES_PER_KEY_NORMAL = STATES_PER_KEY * 2;
    let rankUps = 0;
    let rankUpsDouble = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];

    let doubleNext;
    const doubleNextData = arrayData[inputIndex + 2];
    const areDoubleNextStatesNewBanner = doubleNextData.bannerCount !== currentItemData.bannerCount;
    if (areDoubleNextStatesNewBanner) {
        doubleNext = array[inputIndex + 1];
    } else {
        doubleNext = array[inputIndex + 2];
    }

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    if (startingIndex < finalIndex) return;

    let withinKey = startingIndex % STATES_PER_KEY;
    let keyIndex = startingIndex - withinKey;
    let pity = (withinKey / SPARKS) | 0;
    let spark = withinKey % SPARKS;
    let pityIndex = withinKey - spark;
    let i = startingIndex;
    let keyIndexNormal = keyIndex * 2;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    let currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
    let guaranteeIndex = keyIndexNormal + SPARKS;
    let nextStateBaseIdx = keyIndexNormal + 1;

    while (i >= finalIndex) {
        let prob = currentStates[i];
        if (prob !== 0) {
            if (spark === 119) {
                nextStates[guaranteeIndex] += prob;
                rankUps += prob;
            } else {
                if (spark === 30) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                    const baseOdds = odds[0];
                    const firstCalc = prob * baseOdds;
                    let buffer = firstCalc;
                    let doubleBuffer = 0;
                    prob -= firstCalc;
                    for (let j = 0; j < 9; j++) {
                        const doubleCalc = buffer * baseOdds;
                        const nextCalc = prob * baseOdds;
                        doubleBuffer += doubleCalc;
                        buffer += nextCalc - doubleCalc;
                        prob -= nextCalc;
                    }
                    const bufferWL = buffer * 0.5;
                    const doubleWL = doubleBuffer * 0.25;

                    const bufferWLWinLossProb = bufferWL * baseOdds * 0.5;
                    const bufferWLLossProb = bufferWL * (1 - baseOdds);

                    // nextStates[i] += bufferWL;
                    doubleNext[nextStateBaseIdx + 30] += bufferWLWinLossProb;
                    nextStates[i + currentStateWinOffset] += bufferWLWinLossProb;
                    nextStates[i + 121] += bufferWLLossProb;
                    rankUpsDouble += bufferWLWinLossProb;
                    rankUps += bufferWLWinLossProb + bufferWLLossProb;

                    // nextStates[i + STATES_PER_KEY] += doubleWL + doubleWL;
                    const SomeThing = doubleWL + doubleWL;
                    const secondWLProb = SomeThing * baseOdds * 0.5;
                    const secondLossProb = SomeThing * (1 - baseOdds);
                    doubleNext[nextStateBaseIdx + 30 + STATES_PER_KEY] += secondWLProb;
                    nextStates[i + currentStateWinOffset + STATES_PER_KEY] += secondWLProb;
                    nextStates[i + 121 + STATES_PER_KEY] += secondLossProb;
                    rankUpsDouble += secondWLProb;
                    rankUps += secondWLProb + secondLossProb;

                    // currentStates[i + STATES_PER_KEY] += bufferWL;
                    nextStates[nextStateBaseIdx + 30 + STATES_PER_KEY] += bufferWLWinLossProb;
                    currentStates[i + currentStateWinOffset + STATES_PER_KEY] += bufferWLWinLossProb;
                    currentStates[i + 121 + STATES_PER_KEY] += bufferWLLossProb;
                    rankUps += bufferWLWinLossProb;

                    const doubleWLWinLossProb = doubleWL * baseOdds * 0.5;
                    const doubleWLLossProb = doubleWL * (1 - baseOdds);

                    // currentStates[i + STATES_PER_KEY + STATES_PER_KEY] += doubleWL;
                    nextStates[nextStateBaseIdx + 30 + STATES_PER_KEY + STATES_PER_KEY] += doubleWLWinLossProb;
                    currentStates[i + currentStateWinOffset + STATES_PER_KEY + STATES_PER_KEY] += doubleWLWinLossProb;
                    currentStates[i + 121 + STATES_PER_KEY + STATES_PER_KEY] += doubleWLLossProb;
                    rankUps += doubleWLWinLossProb;

                    // doubleNext[i] += doubleWL;
                    doubleNext[nextStateBaseIdx + 30] += doubleWLWinLossProb;
                    doubleNext[i + currentStateWinOffset] += doubleWLWinLossProb;
                    doubleNext[i + 121] += doubleWLLossProb;
                    rankUpsDouble += doubleWLWinLossProb + doubleWLWinLossProb + doubleWLLossProb;
                }
                const probSSRWinLoss = prob * wlOdds;
                nextStates[nextStateBaseIdx + spark] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            if (pity === 0) {
                pity = PITY_STATES - 1;
                pityIndex = pity * SPARKS;
                keyIndexNormal -= STATES_PER_KEY_NORMAL;
            } else {
                pity -= 1;
                pityIndex -= SPARKS;
            }

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
            guaranteeIndex = keyIndexNormal + SPARKS;
            nextStateBaseIdx = keyIndexNormal + 1;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                nextStates[guaranteeIndex] += probSpark;
                rankUps += probSpark;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 118; s >= 31; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[nextStateBaseIdx + s] += probSSRWinLoss;
                    currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                    currentStates[i + 121] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }

            let prob = currentStates[i];
            if (prob !== 0) {
                const baseOdds = odds[0];
                const firstCalc = prob * baseOdds;
                let buffer = firstCalc;
                let doubleBuffer = 0;
                prob -= firstCalc;
                for (let j = 0; j < 9; j++) {
                    const doubleCalc = buffer * baseOdds;
                    const nextCalc = prob * baseOdds;
                    doubleBuffer += doubleCalc;
                    buffer += nextCalc - doubleCalc;
                    prob -= nextCalc;
                }
                const bufferWL = buffer * 0.5;
                const doubleWL = doubleBuffer * 0.25;

                const bufferWLWinLossProb = bufferWL * baseOdds * 0.5;
                const bufferWLLossProb = bufferWL * (1 - baseOdds);

                // nextStates[i] += bufferWL;
                doubleNext[nextStateBaseIdx + 30] += bufferWLWinLossProb;
                nextStates[i + currentStateWinOffset] += bufferWLWinLossProb;
                nextStates[i + 121] += bufferWLLossProb;
                rankUpsDouble += bufferWLWinLossProb;
                rankUps += bufferWLWinLossProb + bufferWLLossProb;

                // nextStates[i + STATES_PER_KEY] += doubleWL + doubleWL;
                const SomeThing = doubleWL + doubleWL;
                const secondWLProb = SomeThing * baseOdds * 0.5;
                const secondLossProb = SomeThing * (1 - baseOdds);
                doubleNext[nextStateBaseIdx + 30 + STATES_PER_KEY] += secondWLProb;
                nextStates[i + currentStateWinOffset + STATES_PER_KEY] += secondWLProb;
                nextStates[i + 121 + STATES_PER_KEY] += secondLossProb;
                rankUpsDouble += secondWLProb;
                rankUps += secondWLProb + secondLossProb;

                // currentStates[i + STATES_PER_KEY] += bufferWL;
                nextStates[nextStateBaseIdx + 30 + STATES_PER_KEY] += bufferWLWinLossProb;
                currentStates[i + currentStateWinOffset + STATES_PER_KEY] += bufferWLWinLossProb;
                currentStates[i + 121 + STATES_PER_KEY] += bufferWLLossProb;
                rankUps += bufferWLWinLossProb;

                const doubleWLWinLossProb = doubleWL * baseOdds * 0.5;
                const doubleWLLossProb = doubleWL * (1 - baseOdds);

                // currentStates[i + STATES_PER_KEY + STATES_PER_KEY] += doubleWL;
                nextStates[nextStateBaseIdx + 30 + STATES_PER_KEY + STATES_PER_KEY] += doubleWLWinLossProb;
                currentStates[i + currentStateWinOffset + STATES_PER_KEY + STATES_PER_KEY] += doubleWLWinLossProb;
                currentStates[i + 121 + STATES_PER_KEY + STATES_PER_KEY] += doubleWLLossProb;
                rankUps += doubleWLWinLossProb;

                // doubleNext[i] += doubleWL;
                doubleNext[nextStateBaseIdx + 30] += doubleWLWinLossProb;
                doubleNext[i + currentStateWinOffset] += doubleWLWinLossProb;
                doubleNext[i + 121] += doubleWLLossProb;
                rankUpsDouble += doubleWLWinLossProb + doubleWLWinLossProb + doubleWLLossProb;

                let s = 30;
                const probSSRWinLoss = prob * wlOdds;
                nextStates[nextStateBaseIdx + s] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 29; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[nextStateBaseIdx + s] += probSSRWinLoss;
                    currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                    currentStates[i + 121] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 119;
        if (pity === 0) {
            pity = PITY_STATES - 1;
            pityIndex = pity * SPARKS;
            keyIndexNormal -= STATES_PER_KEY_NORMAL;
        } else {
            pity -= 1;
            pityIndex -= SPARKS;
        }

        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
        guaranteeIndex = keyIndexNormal + SPARKS;
        nextStateBaseIdx = keyIndexNormal + 1;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            nextStates[guaranteeIndex] += probSpark;
            rankUps += probSpark;
            currentStates[i] = 0;
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            let prob = currentStates[i];
            if (prob !== 0) {
                if (spark === 30) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                    const baseOdds = odds[0];
                    const firstCalc = prob * baseOdds;
                    let buffer = firstCalc;
                    let doubleBuffer = 0;
                    prob -= firstCalc;
                    for (let j = 0; j < 9; j++) {
                        const doubleCalc = buffer * baseOdds;
                        const nextCalc = prob * baseOdds;
                        doubleBuffer += doubleCalc;
                        buffer += nextCalc - doubleCalc;
                        prob -= nextCalc;
                    }
                    const bufferWL = buffer * 0.5;
                    const doubleWL = doubleBuffer * 0.25;

                    const bufferWLWinLossProb = bufferWL * baseOdds * 0.5;
                    const bufferWLLossProb = bufferWL * (1 - baseOdds);

                    // nextStates[i] += bufferWL;
                    doubleNext[nextStateBaseIdx + 30] += bufferWLWinLossProb;
                    nextStates[i + currentStateWinOffset] += bufferWLWinLossProb;
                    nextStates[i + 121] += bufferWLLossProb;
                    rankUpsDouble += bufferWLWinLossProb;
                    rankUps += bufferWLWinLossProb + bufferWLLossProb;

                    // nextStates[i + STATES_PER_KEY] += doubleWL + doubleWL;
                    const SomeThing = doubleWL + doubleWL;
                    const secondWLProb = SomeThing * baseOdds * 0.5;
                    const secondLossProb = SomeThing * (1 - baseOdds);
                    doubleNext[nextStateBaseIdx + 30 + STATES_PER_KEY] += secondWLProb;
                    nextStates[i + currentStateWinOffset + STATES_PER_KEY] += secondWLProb;
                    nextStates[i + 121 + STATES_PER_KEY] += secondLossProb;
                    rankUpsDouble += secondWLProb;
                    rankUps += secondWLProb + secondLossProb;

                    // currentStates[i + STATES_PER_KEY] += bufferWL;
                    nextStates[nextStateBaseIdx + 30 + STATES_PER_KEY] += bufferWLWinLossProb;
                    currentStates[i + currentStateWinOffset + STATES_PER_KEY] += bufferWLWinLossProb;
                    currentStates[i + 121 + STATES_PER_KEY] += bufferWLLossProb;
                    rankUps += bufferWLWinLossProb;

                    const doubleWLWinLossProb = doubleWL * baseOdds * 0.5;
                    const doubleWLLossProb = doubleWL * (1 - baseOdds);

                    // currentStates[i + STATES_PER_KEY + STATES_PER_KEY] += doubleWL;
                    nextStates[nextStateBaseIdx + 30 + STATES_PER_KEY + STATES_PER_KEY] += doubleWLWinLossProb;
                    currentStates[i + currentStateWinOffset + STATES_PER_KEY + STATES_PER_KEY] += doubleWLWinLossProb;
                    currentStates[i + 121 + STATES_PER_KEY + STATES_PER_KEY] += doubleWLLossProb;
                    rankUps += doubleWLWinLossProb;

                    // doubleNext[i] += doubleWL;
                    doubleNext[nextStateBaseIdx + 30] += doubleWLWinLossProb;
                    doubleNext[i + currentStateWinOffset] += doubleWLWinLossProb;
                    doubleNext[i + 121] += doubleWLLossProb;
                    rankUpsDouble += doubleWLWinLossProb + doubleWLWinLossProb + doubleWLLossProb;
                }
                const probSSRWinLoss = prob * wlOdds;
                nextStates[nextStateBaseIdx + spark] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    probDistrRankUps[inputIndex] += rankUps;
    if (areDoubleNextStatesNewBanner) {
        probDistrRankUpsDouble[inputIndex] += rankUpsDouble;
    } else {
        probDistrRankUps[inputIndex] += rankUpsDouble;
    }
}

function handleSSRFirstNextNew(odds, inputIndex, array, arrayData, PITY_STATES, probDistrRankUps) {
    const SPARKS = 120;
    const STATES_PER_KEY = PITY_STATES * SPARKS;
    let rankUps = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    if (startingIndex < finalIndex) return;

    let withinKey = startingIndex % STATES_PER_KEY;
    let keyIndex = startingIndex - withinKey;
    let pity = (withinKey / SPARKS) | 0;
    let spark = withinKey % SPARKS;
    let pityIndex = withinKey - spark;
    let i = startingIndex;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    let currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;

    while (i >= finalIndex) {
        let prob = currentStates[i];
        if (prob !== 0) {
            if (spark === 119) {
                nextStates[keyIndex] += prob;
                rankUps += prob;
            } else {
                if (spark === 30) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                    const baseOdds = odds[0];
                    const firstCalc = prob * baseOdds;
                    let buffer = firstCalc;
                    prob -= firstCalc;
                    for (let j = 0; j < 9; j++) {
                        const nextCalc = prob * baseOdds;
                        buffer += nextCalc;
                        prob -= nextCalc;
                    }
                    const bufferWL = buffer * 0.5;
                    const bufferWLWinLossProb = bufferWL * baseOdds * 0.5;
                    const bufferWLLossProb = bufferWL * (1 - baseOdds);

                    // nextStates[i] += bufferWL;
                    nextStates[keyIndex] += bufferWLWinLossProb;
                    nextStates[keyIndex + STATES_PER_KEY + 1] += bufferWLWinLossProb;
                    nextStates[i + 91] += bufferWLLossProb;
                    rankUps += bufferWLWinLossProb + bufferWLWinLossProb + bufferWLLossProb;

                    // currentStates[i + STATES_PER_KEY] += bufferWL;
                    nextStates[keyIndex] += bufferWLWinLossProb;
                    currentStates[i + currentStateWinOffset + STATES_PER_KEY] += bufferWLWinLossProb;
                    currentStates[i + 121 + STATES_PER_KEY] += bufferWLLossProb;
                    rankUps += bufferWLWinLossProb;
                }
                const probSSRWinLoss = prob * wlOdds;
                nextStates[keyIndex] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            if (pity === 0) {
                pity = PITY_STATES - 1;
                pityIndex = pity * SPARKS;
                keyIndex -= STATES_PER_KEY;
            } else {
                pity -= 1;
                pityIndex -= SPARKS;
            }

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                nextStates[keyIndex] += probSpark;
                rankUps += probSpark;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 118; s >= 31; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[keyIndex] += probSSRWinLoss;
                    currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                    currentStates[i + 121] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }

            let prob = currentStates[i];
            if (prob !== 0) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                const baseOdds = odds[0];
                const firstCalc = prob * baseOdds;
                let buffer = firstCalc;
                prob -= firstCalc;
                for (let j = 0; j < 9; j++) {
                    const nextCalc = prob * baseOdds;
                    buffer += nextCalc;
                    prob -= nextCalc;
                }
                const bufferWL = buffer * 0.5;
                const bufferWLWinLossProb = bufferWL * baseOdds * 0.5;
                const bufferWLLossProb = bufferWL * (1 - baseOdds);

                // nextStates[i] += bufferWL;
                nextStates[keyIndex] += bufferWLWinLossProb;
                nextStates[keyIndex + STATES_PER_KEY + 1] += bufferWLWinLossProb;
                nextStates[i + 91] += bufferWLLossProb;
                rankUps += bufferWLWinLossProb + bufferWLWinLossProb + bufferWLLossProb;

                // currentStates[i + STATES_PER_KEY] += bufferWL;
                nextStates[keyIndex] += bufferWLWinLossProb;
                currentStates[i + currentStateWinOffset + STATES_PER_KEY] += bufferWLWinLossProb;
                currentStates[i + 121 + STATES_PER_KEY] += bufferWLLossProb;
                rankUps += bufferWLWinLossProb;

                const probSSRWinLoss = prob * wlOdds;
                nextStates[keyIndex] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 29; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[keyIndex] += probSSRWinLoss;
                    currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                    currentStates[i + 121] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 119;
        if (pity === 0) {
            pity = PITY_STATES - 1;
            pityIndex = pity * SPARKS;
            keyIndex -= STATES_PER_KEY;
        } else {
            pity -= 1;
            pityIndex -= SPARKS;
        }

        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            nextStates[keyIndex] += probSpark;
            rankUps += probSpark;
            currentStates[i] = 0;
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            let prob = currentStates[i];
            if (prob !== 0) {
                if (spark === 30) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                    const baseOdds = odds[0];
                    const firstCalc = prob * baseOdds;
                    let buffer = firstCalc;
                    prob -= firstCalc;
                    for (let j = 0; j < 9; j++) {
                        const nextCalc = prob * baseOdds;
                        buffer += nextCalc;
                        prob -= nextCalc;
                    }
                    const bufferWL = buffer * 0.5;
                    const bufferWLWinLossProb = bufferWL * baseOdds * 0.5;
                    const bufferWLLossProb = bufferWL * (1 - baseOdds);

                    // nextStates[i] += bufferWL;
                    nextStates[keyIndex] += bufferWLWinLossProb;
                    nextStates[keyIndex + STATES_PER_KEY + 1] += bufferWLWinLossProb;
                    nextStates[i + 91] += bufferWLLossProb;
                    rankUps += bufferWLWinLossProb + bufferWLWinLossProb + bufferWLLossProb;

                    // currentStates[i + STATES_PER_KEY] += bufferWL;
                    nextStates[keyIndex] += bufferWLWinLossProb;
                    currentStates[i + currentStateWinOffset + STATES_PER_KEY] += bufferWLWinLossProb;
                    currentStates[i + 121 + STATES_PER_KEY] += bufferWLLossProb;
                    rankUps += bufferWLWinLossProb;
                }
                const probSSRWinLoss = prob * wlOdds;
                nextStates[keyIndex] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    probDistrRankUps[inputIndex] += rankUps;
}

function handleSSRPerItem(odds, inputIndex, array, arrayData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, perBannerData) {
    const SPARKS = 240;
    const STATES_PER_KEY = PITY_STATES * SPARKS;
    let rankUps = 0;
    let rankUpsDouble = 0;
    let rankUpsSparks = 0;
    let rankUpsDoublePerKey = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];
    const currentBanner = arrayData[inputIndex].bannerCount;

    const doubleNextStates = array[inputIndex + 2];
    const doubleNextItemData = arrayData[inputIndex + 2];
    const areDoubleNextStatesNewBanner = doubleNextItemData.isFirst;

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    if (startingIndex < finalIndex) return;

    let withinKey = startingIndex % STATES_PER_KEY;
    let keyIndex = startingIndex - withinKey;
    let key = keyIndex / STATES_PER_KEY;
    let pity = (withinKey / SPARKS) | 0;
    let spark = withinKey % SPARKS;
    let pityIndex = withinKey - spark;
    let i = startingIndex;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    let currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
    let targetDoubleNextIdx = areDoubleNextStatesNewBanner ? 0 : keyIndex;
    let nextStateSparkWinIdx = keyIndex + STATES_PER_KEY;
    let nextStateSparkLossIdx = keyIndex + pityIndex + SPARKS;

    while (i >= finalIndex) {
        const prob = currentStates[i];
        if (prob !== 0) {
            const probSSRWinLoss = prob * wlOdds;
            const probLoss = prob * lOdds;

            if (spark === 239) {
                doubleNextStates[targetDoubleNextIdx] += probSSRWinLoss;
                nextStates[nextStateSparkWinIdx] += probSSRWinLoss;
                nextStates[nextStateSparkLossIdx] += probLoss;
                rankUpsDouble += probSSRWinLoss;
                rankUpsSparks += probSSRWinLoss + probLoss;
                if (areDoubleNextStatesNewBanner) {
                    rankUpsDoublePerKey += probSSRWinLoss;
                }
            } else {
                nextStates[keyIndex + spark + 1] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 241] += probLoss;
                rankUps += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            if (pity === 0) {
                if (areDoubleNextStatesNewBanner) {
                    perBannerData[currentBanner][key] += rankUpsDoublePerKey;
                    rankUpsDoublePerKey = 0;
                }
                pity = PITY_STATES - 1;
                pityIndex = pity * SPARKS;
                keyIndex -= STATES_PER_KEY;
                key--;
            } else {
                pity -= 1;
                pityIndex -= SPARKS;
            }

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
            targetDoubleNextIdx = areDoubleNextStatesNewBanner ? 0 : keyIndex;
            nextStateSparkWinIdx = keyIndex + STATES_PER_KEY;
            nextStateSparkLossIdx = keyIndex + pityIndex + SPARKS;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                const probSSRWinLoss = probSpark * wlOdds;
                const probLoss = probSpark * lOdds;
                doubleNextStates[targetDoubleNextIdx] += probSSRWinLoss;
                nextStates[nextStateSparkWinIdx] += probSSRWinLoss;
                nextStates[nextStateSparkLossIdx] += probLoss;
                rankUpsDouble += probSSRWinLoss;
                rankUpsSparks += probSSRWinLoss + probLoss;
                currentStates[i] = 0;
                if (areDoubleNextStatesNewBanner) {
                    rankUpsDoublePerKey += probSSRWinLoss;
                }
            }
            i -= 1;

            for (let s = 238; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[keyIndex + s + 1] += probSSRWinLoss;
                    currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                    currentStates[i + 241] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 239;
        if (pity === 0) {
            if (areDoubleNextStatesNewBanner) {
                perBannerData[currentBanner][key] += rankUpsDoublePerKey;
                rankUpsDoublePerKey = 0;
            }
            pity = PITY_STATES - 1;
            pityIndex = pity * SPARKS;
            keyIndex -= STATES_PER_KEY;
            key--;
        } else {
            pity -= 1;
            pityIndex -= SPARKS;
        }
        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;
        targetDoubleNextIdx = areDoubleNextStatesNewBanner ? 0 : keyIndex;
        nextStateSparkWinIdx = keyIndex + STATES_PER_KEY;
        nextStateSparkLossIdx = keyIndex + pityIndex + SPARKS;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            const probSSRWinLoss = probSpark * wlOdds;
            const probLoss = probSpark * lOdds;
            doubleNextStates[targetDoubleNextIdx] += probSSRWinLoss;
            nextStates[nextStateSparkWinIdx] += probSSRWinLoss;
            nextStates[nextStateSparkLossIdx] += probLoss;
            rankUpsDouble += probSSRWinLoss;
            rankUpsSparks += probSSRWinLoss + probLoss;
            currentStates[i] = 0;
            if (areDoubleNextStatesNewBanner) {
                rankUpsDoublePerKey += probSSRWinLoss;
            }
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            const prob = currentStates[i];
            if (prob !== 0) {
                const probSSRWinLoss = prob * wlOdds;
                nextStates[keyIndex + spark + 1] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 241] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    if (areDoubleNextStatesNewBanner) {
        perBannerData[currentBanner][key] += rankUpsDoublePerKey;
    }
    probDistrRankUps[inputIndex] += rankUps;
    probDistrRankUpsDouble[inputIndex] += rankUpsDouble;
    probDistrRankUpsSpark[inputIndex] += rankUpsSparks;
}

function handleSSRNextNewPerItem(odds, inputIndex, array, arrayData, PITY_STATES, probDistrRankUps, probDistrRankUpsSpark, perBannerData) {
    const SPARKS = 240;
    const NEW_SPARKS = 120;
    const STATES_PER_KEY = PITY_STATES * SPARKS;
    let rankUps = 0;
    let rankUpsSparks = 0;
    let rankUpsPerKey = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];
    const currentBanner = currentItemData.bannerCount;

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    let withinKey = startingIndex % STATES_PER_KEY;
    let key = (startingIndex - withinKey) / STATES_PER_KEY;
    let pity = (withinKey / SPARKS) | 0;
    let spark = withinKey % SPARKS;
    let pityIndex = withinKey - spark;
    let newPityIndex = pityIndex * 0.5;
    let i = startingIndex;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    let currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;

    while (i >= finalIndex) {
        const prob = currentStates[i];
        if (prob !== 0) {
            const probSSRWinLoss = prob * wlOdds;
            const probLoss = prob * lOdds;

            if (spark === 239) {
                nextStates[0] += probSSRWinLoss + probSSRWinLoss;
                nextStates[newPityIndex + NEW_SPARKS] += probLoss;
                let temp = probSSRWinLoss + probSSRWinLoss + probLoss;
                rankUpsSparks += temp;
                rankUpsPerKey += temp;
            } else {
                nextStates[0] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 241] += probLoss;
                rankUps += probSSRWinLoss;
                rankUpsPerKey += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            if (pity === 0) {
                perBannerData[currentBanner][key] += rankUpsPerKey;
                rankUpsPerKey = 0;
                pity = PITY_STATES - 1;
                pityIndex = pity * SPARKS;
                newPityIndex = pityIndex * 0.5;
                key--;
            } else {
                pity -= 1;
                pityIndex -= SPARKS;
                newPityIndex -= NEW_SPARKS;
            }

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                const probSSRWinLoss = probSpark * wlOdds;
                const probLoss = probSpark * lOdds;
                nextStates[0] += probSSRWinLoss + probSSRWinLoss;
                nextStates[newPityIndex + NEW_SPARKS] += probLoss;
                let temp = probSSRWinLoss + probSSRWinLoss + probLoss;
                rankUpsSparks += temp;
                rankUpsPerKey += temp;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 238; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[0] += probSSRWinLoss;
                    currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                    currentStates[i + 241] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    rankUpsPerKey += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 239;
        if (pity === 0) {
            perBannerData[currentBanner][key] += rankUpsPerKey;
            rankUpsPerKey = 0;
            pity = PITY_STATES - 1;
            pityIndex = pity * SPARKS;
            newPityIndex = pityIndex * 0.5;
            key--;
        } else {
            pity -= 1;
            pityIndex -= SPARKS;
            newPityIndex -= NEW_SPARKS;
        }

        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            const probSSRWinLoss = probSpark * wlOdds;
            const probLoss = probSpark * lOdds;
            nextStates[0] += probSSRWinLoss + probSSRWinLoss;
            nextStates[newPityIndex + NEW_SPARKS] += probLoss;
            let temp = probSSRWinLoss + probSSRWinLoss + probLoss;
            rankUpsSparks += temp;
            rankUpsPerKey += temp;
            currentStates[i] = 0;
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            const prob = currentStates[i];
            if (prob !== 0) {
                const probSSRWinLoss = prob * wlOdds;
                nextStates[0] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 241] += prob * lOdds;
                rankUps += probSSRWinLoss;
                rankUpsPerKey += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    perBannerData[currentBanner][key] += rankUpsPerKey;
    probDistrRankUps[inputIndex] += rankUps;
    probDistrRankUpsSpark[inputIndex] += rankUpsSparks;
}

function handleSSRFirstNextNewPerItem(odds, inputIndex, array, arrayData, PITY_STATES, probDistrRankUps, perBannerData) {
    const SPARKS = 120;
    const STATES_PER_KEY = PITY_STATES * SPARKS;
    let rankUps = 0;
    let rankUpsPerKey = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];
    const currentBanner = currentItemData.bannerCount;

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    if (startingIndex < finalIndex) return;

    let withinKey = startingIndex % STATES_PER_KEY;
    let key = (startingIndex - withinKey) / STATES_PER_KEY;
    let pity = (withinKey / SPARKS) | 0;
    let spark = withinKey % SPARKS;
    let pityIndex = withinKey - spark;
    let i = startingIndex;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    let currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;

    while (i >= finalIndex) {
        let prob = currentStates[i];
        if (prob !== 0) {
            if (spark === 119) {
                nextStates[0] += prob;
                rankUps += prob;
                rankUpsPerKey += prob;
            } else {
                if (spark === 30) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                    const baseOdds = odds[0];
                    const firstCalc = prob * baseOdds;
                    let buffer = firstCalc;
                    prob -= firstCalc;
                    for (let j = 0; j < 9; j++) {
                        const nextCalc = prob * baseOdds;
                        buffer += nextCalc;
                        prob -= nextCalc;
                    }
                    const bufferWL = buffer * 0.5;
                    const bufferWLWinLossProb = bufferWL * baseOdds * 0.5;
                    const bufferWLLossProb = bufferWL * (1 - baseOdds);

                    // nextStates[pityIndex] += bufferWL;
                    nextStates[pityIndex] += bufferWLWinLossProb;
                    nextStates[STATES_PER_KEY + 1] += bufferWLWinLossProb;
                    nextStates[121 + pityIndex] += bufferWLLossProb;
                    rankUps += bufferWLWinLossProb + bufferWLWinLossProb + bufferWLLossProb;

                    // currentStates[i + STATES_PER_KEY] += bufferWL;
                    nextStates[pityIndex] += bufferWLWinLossProb;
                    currentStates[i + currentStateWinOffset + STATES_PER_KEY] += bufferWLWinLossProb;
                    currentStates[i + 121 + STATES_PER_KEY] += bufferWLLossProb;
                    rankUps += bufferWLWinLossProb;
                }
                const probSSRWinLoss = prob * wlOdds;
                nextStates[0] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                rankUpsPerKey += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            if (pity === 0) {
                perBannerData[currentBanner][key] += rankUpsPerKey;
                rankUpsPerKey = 0;
                pity = PITY_STATES - 1;
                pityIndex = pity * SPARKS;
                key--;
            } else {
                pity -= 1;
                pityIndex -= SPARKS;
            }

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                nextStates[0] += probSpark;
                rankUps += probSpark;
                rankUpsPerKey += probSpark;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 118; s >= 31; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[0] += probSSRWinLoss;
                    currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                    currentStates[i + 121] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    rankUpsPerKey += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }

            let prob = currentStates[i];
            if (prob !== 0) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                const baseOdds = odds[0];
                const firstCalc = prob * baseOdds;
                let buffer = firstCalc;
                prob -= firstCalc;
                for (let j = 0; j < 9; j++) {
                    const nextCalc = prob * baseOdds;
                    buffer += nextCalc;
                    prob -= nextCalc;
                }
                const bufferWL = buffer * 0.5;
                const bufferWLWinLossProb = bufferWL * baseOdds * 0.5;
                const bufferWLLossProb = bufferWL * (1 - baseOdds);

                // nextStates[pityIndex] += bufferWL;
                nextStates[pityIndex] += bufferWLWinLossProb;
                nextStates[STATES_PER_KEY + 1] += bufferWLWinLossProb;
                nextStates[121 + pityIndex] += bufferWLLossProb;
                rankUps += bufferWLWinLossProb + bufferWLWinLossProb + bufferWLLossProb;

                // currentStates[i + STATES_PER_KEY] += bufferWL;
                nextStates[pityIndex] += bufferWLWinLossProb;
                currentStates[i + currentStateWinOffset + STATES_PER_KEY] += bufferWLWinLossProb;
                currentStates[i + 121 + STATES_PER_KEY] += bufferWLLossProb;
                rankUps += bufferWLWinLossProb;

                const probSSRWinLoss = prob * wlOdds;
                nextStates[0] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                rankUpsPerKey += probSSRWinLoss;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 29; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[0] += probSSRWinLoss;
                    currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                    currentStates[i + 121] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    rankUpsPerKey += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 119;
        if (pity === 0) {
            perBannerData[currentBanner][key] += rankUpsPerKey;
            rankUpsPerKey = 0;
            pity = PITY_STATES - 1;
            pityIndex = pity * SPARKS;
            key--;
        } else {
            pity -= 1;
            pityIndex -= SPARKS;
        }

        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        currentStateWinOffset = STATES_PER_KEY - pityIndex + 1;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            nextStates[0] += probSpark;
            rankUps += probSpark;
            rankUpsPerKey += probSpark;
            currentStates[i] = 0;
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            let prob = currentStates[i];
            if (prob !== 0) {
                if (spark === 30) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                    const baseOdds = odds[0];
                    const firstCalc = prob * baseOdds;
                    let buffer = firstCalc;
                    prob -= firstCalc;
                    for (let j = 0; j < 9; j++) {
                        const nextCalc = prob * baseOdds;
                        buffer += nextCalc;
                        prob -= nextCalc;
                    }
                    const bufferWL = buffer * 0.5;
                    const bufferWLWinLossProb = bufferWL * baseOdds * 0.5;
                    const bufferWLLossProb = bufferWL * (1 - baseOdds);

                    // nextStates[pityIndex] += bufferWL;
                    nextStates[pityIndex] += bufferWLWinLossProb;
                    nextStates[STATES_PER_KEY + 1] += bufferWLWinLossProb;
                    nextStates[121 + pityIndex] += bufferWLLossProb;
                    rankUps += bufferWLWinLossProb + bufferWLWinLossProb + bufferWLLossProb;

                    // currentStates[i + STATES_PER_KEY] += bufferWL;
                    nextStates[pityIndex] += bufferWLWinLossProb;
                    currentStates[i + currentStateWinOffset + STATES_PER_KEY] += bufferWLWinLossProb;
                    currentStates[i + 121 + STATES_PER_KEY] += bufferWLLossProb;
                    rankUps += bufferWLWinLossProb;
                }
                const probSSRWinLoss = prob * wlOdds;
                nextStates[0] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                rankUpsPerKey += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    perBannerData[currentBanner][key] += rankUpsPerKey;
    probDistrRankUps[inputIndex] += rankUps;
}

function handleSR(odds, inputIndex, array, pullsCoef) { // dif is no rate ups at all, means just count how much, it's already a map, so key means amount of success
    const size = array[0].states.length;
    const currentStates = array[inputIndex].states;
    pullsCoef.rankUpFail = pullsCoef.pullsSum - pullsCoef.rankUps;

    if (pullsCoef.urgentPulls > 0) {
        const urgentPulls = Array.from({ length: 10 }, () => new Map());
        urgentPulls[0].set(0, { prob: 1.0 });
        for (let iteration = 0; iteration < 10; iteration++) {
            pullsCoef.urgentPulls *= 0.992;
            let buffer = new Map();
            for (let i = size - 1; i >= 0; i--) {
                const currentOdds = odds[i];
                for (const [currentKey, currentMap] of urgentPulls[i]) {
                    const totalProb = currentMap.prob;
                    if (totalProb > PRUNE_LEVEL) {
                        currentMap.prob = 0;
                        const winProb = totalProb * currentOdds * 0.992; // formulas simplified a lot so somewhat nonsensical unless you derive them
                        const lossProb = totalProb * (1 - currentOdds) * 0.992;
                        const pityResetProb = totalProb * 0.008;

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
                            const targetMap = urgentPulls[i + 1];
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
            urgentPulls[0] = buffer;
        }
        const summedKeys = new Array(9).fill(0);
        for (let i = size - 1; i >= 0; i--) {
            for (const [currentKey, currentMap] of urgentPulls[i]) {
                const totalProb = currentMap.prob;
                if (totalProb > PRUNE_LEVEL) {
                    summedKeys[currentKey] += totalProb;
                }
            }
        }
        for (let i = 0; i < summedKeys.length; i++) {
            summedKeys[i] *= pullsCoef.urgentPulls;
        }
        for (let i = 0; i < size; i++) {
            let buffer = new Map();
            for (const [currentKey, currentMap] of currentStates[i]) {
                const totalProb = currentMap.prob;
                if (totalProb > PRUNE_LEVEL) {
                    const existing = buffer.get(currentKey);
                    if (existing) {
                        existing.prob += totalProb * (1 - pullsCoef.urgentPulls);
                    } else {
                        buffer.set(currentKey, {
                            prob: totalProb * (1 - pullsCoef.urgentPulls)
                        });
                    }
                    for (let j = 0; j < summedKeys.length; j++) {
                        const prob = summedKeys[j] * totalProb;
                        if (prob > PRUNE_LEVEL) {
                            const nextKey = currentKey + j;
                            const existing = buffer.get(nextKey);
                            if (existing) {
                                existing.prob += prob;
                            } else {
                                buffer.set(nextKey, {
                                    prob: prob
                                });
                            }
                        }
                    }
                }
            }
            currentStates[i] = buffer;
        }
    }
    let buffer = new Map();
    for (let i = size - 1; i >= 0; i--) {
        const currentState = currentStates[i];
        const currentOdds = odds[i];
        for (const [currentKey, currentMap] of currentState) {
            const totalProb = currentMap.prob;
            if (totalProb > PRUNE_LEVEL) {
                currentMap.prob = 0;
                const winProb = totalProb * currentOdds * pullsCoef.rankUpFail; // formulas simplified a lot so somewhat nonsensical unless you derive them
                const lossProb = totalProb * (1 - currentOdds) * pullsCoef.rankUpFail;
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

function handleSSRCheap(odds, inputIndex, array, arrayData, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, buffer) {
    const SPARKS = 240;
    let rankUps = 0;
    let rankUpsDouble = 0;
    let rankUpsSparks = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];

    const doubleNextStates = array[inputIndex + 2];

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    if (startingIndex < finalIndex) return;

    let pity = (startingIndex / SPARKS) | 0;
    let spark = startingIndex % SPARKS;
    let pityIndex = startingIndex - spark;
    let i = startingIndex;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    while (i >= finalIndex) {
        const prob = currentStates[i];
        if (prob !== 0) {
            const probSSRWinLoss = prob * wlOdds;
            const probLoss = prob * lOdds;

            if (spark === 239) {
                doubleNextStates[0] += probSSRWinLoss;
                nextStates[0] += probSSRWinLoss;
                nextStates[pityIndex + SPARKS] += probLoss;
                rankUpsSparks += probSSRWinLoss + probLoss;
                rankUpsDouble += probSSRWinLoss;
            } else {
                nextStates[spark + 1] += probSSRWinLoss;
                buffer[spark + 1] += probSSRWinLoss;
                currentStates[i + 241] += probLoss;
                rankUps += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            pity -= 1;
            pityIndex -= SPARKS;

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                const probSSRWinLoss = probSpark * wlOdds;
                const probLoss = probSpark * lOdds;
                doubleNextStates[0] += probSSRWinLoss;
                nextStates[0] += probSSRWinLoss;
                nextStates[pityIndex + SPARKS] += probLoss;
                rankUpsSparks += probSSRWinLoss + probLoss;
                rankUpsDouble += probSSRWinLoss;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 238; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[s + 1] += probSSRWinLoss;
                    buffer[s + 1] += probSSRWinLoss;
                    currentStates[i + 241] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 239;
        pity -= 1;
        pityIndex -= SPARKS;

        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            const probSSRWinLoss = probSpark * wlOdds;
            const probLoss = probSpark * lOdds;
            doubleNextStates[0] += probSSRWinLoss;
            nextStates[0] += probSSRWinLoss;
            nextStates[pityIndex + SPARKS] += probLoss;
            rankUpsSparks += probSSRWinLoss + probLoss;
            rankUpsDouble += probSSRWinLoss;
            currentStates[i] = 0;
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            const prob = currentStates[i];
            if (prob !== 0) {
                const probSSRWinLoss = prob * wlOdds;
                nextStates[spark + 1] += probSSRWinLoss;
                buffer[spark + 1] += probSSRWinLoss;
                currentStates[i + 241] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    for (let i = 0; i < SPARKS; i++) {
        currentStates[i] += buffer[i];
    }
    buffer.fill(0);

    probDistrRankUps[inputIndex] += rankUps;
    probDistrRankUpsDouble[inputIndex] += rankUpsDouble;
    probDistrRankUpsSpark[inputIndex] += rankUpsSparks;
}

function handleSSRNextNewCheap(odds, inputIndex, array, arrayData, probDistrRankUps, probDistrRankUpsSpark, buffer) {
    const SPARKS = 240;
    const NEW_SPARKS = 120;
    let rankUps = 0;
    let rankUpsSparks = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    let pity = (startingIndex / SPARKS) | 0;
    let spark = startingIndex % SPARKS;
    let pityIndex = startingIndex - spark;
    let newPityIndex = pityIndex * 0.5;
    let i = startingIndex;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    while (i >= finalIndex) {
        const prob = currentStates[i];
        if (prob !== 0) {
            const probSSRWinLoss = prob * wlOdds;
            const probLoss = prob * lOdds;

            if (spark === 239) {
                nextStates[0] += probSSRWinLoss + probSSRWinLoss;
                nextStates[newPityIndex + NEW_SPARKS] += probLoss; // how is this handled normally...
                rankUpsSparks += probSSRWinLoss + probSSRWinLoss + probLoss;
            } else {
                nextStates[0] += probSSRWinLoss;
                buffer[spark + 1] += probSSRWinLoss;
                currentStates[i + 241] += probLoss;
                rankUps += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            pity -= 1;
            pityIndex -= SPARKS;
            newPityIndex -= NEW_SPARKS;

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                const probSSRWinLoss = probSpark * wlOdds;
                const probLoss = probSpark * lOdds;
                nextStates[0] += probSSRWinLoss + probSSRWinLoss;
                nextStates[newPityIndex + NEW_SPARKS] += probLoss;
                rankUpsSparks += probSSRWinLoss + probSSRWinLoss + probLoss;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 238; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[0] += probSSRWinLoss;
                    buffer[s + 1] += probSSRWinLoss;
                    currentStates[i + 241] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 239;
        pity -= 1;
        pityIndex -= SPARKS;
        newPityIndex -= NEW_SPARKS;

        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            const probSSRWinLoss = probSpark * wlOdds;
            const probLoss = probSpark * lOdds;
            nextStates[0] += probSSRWinLoss + probSSRWinLoss;
            nextStates[newPityIndex + NEW_SPARKS] += probLoss;
            rankUpsSparks += probSSRWinLoss + probSSRWinLoss + probLoss;
            currentStates[i] = 0;
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            const prob = currentStates[i];
            if (prob !== 0) {
                const probSSRWinLoss = prob * wlOdds;
                nextStates[0] += probSSRWinLoss;
                buffer[spark + 1] += probSSRWinLoss;
                currentStates[i + 241] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    for (let i = 0; i < SPARKS; i++) {
        currentStates[i] += buffer[i];
    }
    buffer.fill(0);

    probDistrRankUps[inputIndex] += rankUps;
    probDistrRankUpsSpark[inputIndex] += rankUpsSparks;
}

function handleSSRFirstCheap(odds, inputIndex, array, arrayData, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsPast, probDistrRankUpsDoublePast, urgentPullDistr, buffer) {
    const SPARKS = 120;
    let rankUps = 0;
    let rankUpsDouble = 0;
    let rankUpsPast = 0;
    let rankUpsDoublePast = 0;
    let urgentPulls = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];

    let doubleNext;
    const doubleNextData = arrayData[inputIndex + 2];
    const areDoubleNextStatesNewBanner = doubleNextData.bannerCount !== currentItemData.bannerCount;
    if (areDoubleNextStatesNewBanner) {
        doubleNext = array[inputIndex + 1];
    } else {
        doubleNext = array[inputIndex + 2];
    }

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    if (startingIndex < finalIndex) return;

    let pity = (startingIndex / SPARKS) | 0;
    let spark = startingIndex % SPARKS;
    let i = startingIndex;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    while (i >= finalIndex) {
        let prob = currentStates[i];
        if (prob !== 0) {
            if (spark === 119) {
                nextStates[SPARKS] += prob;
                rankUps += prob;
            } else {
                if (spark === 30) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                    const baseOdds = odds[0];
                    const firstCalc = prob * baseOdds;
                    let bufferUrgent = firstCalc;
                    let doubleBuffer = 0;
                    urgentPulls += prob;
                    prob -= firstCalc;
                    for (let j = 0; j < 9; j++) {
                        const doubleCalc = bufferUrgent * baseOdds;
                        const nextCalc = prob * baseOdds;
                        doubleBuffer += doubleCalc;
                        bufferUrgent += nextCalc - doubleCalc;
                        prob -= nextCalc;
                    }
                    const bufferWL = bufferUrgent * 0.5;
                    const doubleWL = doubleBuffer * 0.25;

                    // nextStates[i] += bufferWL + doubleWL + doubleWL;
                    const nextWinLossProb = (bufferWL + doubleWL + doubleWL) * baseOdds * 0.5;
                    const nextLossProb = (bufferWL + doubleWL + doubleWL) * (1 - baseOdds);
                    doubleNext[spark + 1] += nextWinLossProb;
                    nextStates[spark + 1] += nextWinLossProb;
                    nextStates[i + 121] += nextLossProb;
                    rankUps += nextWinLossProb + nextLossProb;
                    rankUpsPast += bufferWL + doubleWL + doubleWL;

                    // doubleNext[i] += doubleWL;
                    const doubleNextWinLossProb = doubleWL * baseOdds * 0.5;
                    const doubleNextLossProb = doubleWL * (1 - baseOdds);
                    doubleNext[spark + 1] += doubleNextWinLossProb + doubleNextWinLossProb;
                    doubleNext[i + 121] += doubleNextLossProb;
                    rankUpsDouble += doubleWL + nextWinLossProb;
                    rankUpsDoublePast += doubleWL;

                    prob += bufferWL + doubleWL;
                }
                const probSSRWinLoss = prob * wlOdds;
                nextStates[spark + 1] += probSSRWinLoss;
                buffer[spark + 1] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            pity -= 1;

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                nextStates[SPARKS] += probSpark;
                rankUps += probSpark;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 118; s >= 31; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[s + 1] += probSSRWinLoss;
                    buffer[s + 1] += probSSRWinLoss;
                    currentStates[i + 121] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }

            let prob = currentStates[i];
            if (prob !== 0) {
                const baseOdds = odds[0];
                const firstCalc = prob * baseOdds;
                let bufferUrgent = firstCalc;
                let doubleBuffer = 0;
                urgentPulls += prob;
                prob -= firstCalc;
                for (let j = 0; j < 9; j++) {
                    const doubleCalc = bufferUrgent * baseOdds;
                    const nextCalc = prob * baseOdds;
                    doubleBuffer += doubleCalc;
                    bufferUrgent += nextCalc - doubleCalc;
                    prob -= nextCalc;
                }
                const bufferWL = bufferUrgent * 0.5;
                const doubleWL = doubleBuffer * 0.25;

                // nextStates[i] += bufferWL + doubleWL + doubleWL;
                const nextWinLossProb = (bufferWL + doubleWL + doubleWL) * baseOdds * 0.5;
                const nextLossProb = (bufferWL + doubleWL + doubleWL) * (1 - baseOdds);
                doubleNext[spark + 1] += nextWinLossProb;
                nextStates[spark + 1] += nextWinLossProb;
                nextStates[i + 121] += nextLossProb;
                rankUps += nextWinLossProb + nextLossProb;
                rankUpsPast += bufferWL + doubleWL + doubleWL;

                // doubleNext[i] += doubleWL;
                const doubleNextWinLossProb = doubleWL * baseOdds * 0.5;
                const doubleNextLossProb = doubleWL * (1 - baseOdds);
                doubleNext[spark + 1] += doubleNextWinLossProb + doubleNextWinLossProb;
                doubleNext[i + 121] += doubleNextLossProb;
                rankUpsDouble += doubleWL + nextWinLossProb;
                rankUpsDoublePast += doubleWL;

                prob += bufferWL + doubleWL;

                let s = 30;
                const probSSRWinLoss = prob * wlOdds;
                nextStates[s + 1] += probSSRWinLoss;
                buffer[s + 1] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 29; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[s + 1] += probSSRWinLoss;
                    buffer[s + 1] += probSSRWinLoss;
                    currentStates[i + 121] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 119;
        pity -= 1;

        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            nextStates[SPARKS] += probSpark;
            rankUps += probSpark;
            currentStates[i] = 0;
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            let prob = currentStates[i];
            if (prob !== 0) {
                if (spark === 30) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                    const baseOdds = odds[0];
                    const firstCalc = prob * baseOdds;
                    let bufferUrgent = firstCalc;
                    let doubleBuffer = 0;
                    urgentPulls += prob;
                    prob -= firstCalc;
                    for (let j = 0; j < 9; j++) {
                        const doubleCalc = bufferUrgent * baseOdds;
                        const nextCalc = prob * baseOdds;
                        doubleBuffer += doubleCalc;
                        bufferUrgent += nextCalc - doubleCalc;
                        prob -= nextCalc;
                    }
                    const bufferWL = bufferUrgent * 0.5;
                    const doubleWL = doubleBuffer * 0.25;

                    // nextStates[i] += bufferWL + doubleWL + doubleWL;
                    const nextWinLossProb = (bufferWL + doubleWL + doubleWL) * baseOdds * 0.5;
                    const nextLossProb = (bufferWL + doubleWL + doubleWL) * (1 - baseOdds);
                    doubleNext[spark + 1] += nextWinLossProb;
                    nextStates[spark + 1] += nextWinLossProb;
                    nextStates[i + 121] += nextLossProb;
                    rankUps += nextWinLossProb + nextLossProb;
                    rankUpsPast += bufferWL + doubleWL + doubleWL;

                    // doubleNext[i] += doubleWL;
                    const doubleNextWinLossProb = doubleWL * baseOdds * 0.5;
                    const doubleNextLossProb = doubleWL * (1 - baseOdds);
                    doubleNext[spark + 1] += doubleNextWinLossProb + doubleNextWinLossProb;
                    doubleNext[i + 121] += doubleNextLossProb;
                    rankUpsDouble += doubleWL + nextWinLossProb;
                    rankUpsDoublePast += doubleWL;

                    prob += bufferWL + doubleWL;
                }
                const probSSRWinLoss = prob * wlOdds;
                nextStates[spark + 1] += probSSRWinLoss;
                buffer[spark + 1] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    for (let i = 0; i < SPARKS; i++) {
        currentStates[i] += buffer[i];
    }
    buffer.fill(0);

    probDistrRankUps[inputIndex] += rankUps;
    probDistrRankUpsPast[inputIndex] += rankUpsPast;
    urgentPullDistr[0] += urgentPulls;
    if (areDoubleNextStatesNewBanner) {
        probDistrRankUpsDouble[inputIndex] += rankUpsDouble;
        probDistrRankUpsDoublePast[inputIndex] += rankUpsDoublePast;
    } else {
        probDistrRankUps[inputIndex] += rankUpsDouble;
        probDistrRankUpsPast[inputIndex] += rankUpsDoublePast;
    }
}

function handleSSRFirstNextNewCheap(odds, inputIndex, array, arrayData, probDistrRankUps, probDistrRankUpsPast, urgentPullDistr, buffer) {
    const SPARKS = 120;
    let rankUps = 0;
    let rankUpsPast = 0;
    let urgentPulls = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];

    let startingIndex = currentItemData.maxIndex;
    let finalIndex = currentItemData.minIndex;

    if (startingIndex < finalIndex) return;

    let pity = (startingIndex / SPARKS) | 0;
    let spark = startingIndex % SPARKS;
    let i = startingIndex;

    let final_spark_chunk = (((finalIndex / SPARKS) | 0) + 1) * SPARKS;
    let starting_pity_bind = startingIndex - spark;
    let have_pity_chunk = starting_pity_bind > final_spark_chunk;

    let currentOdd = odds[pity];
    let wlOdds = currentOdd * 0.5;
    let lOdds = 1 - currentOdd;

    while (i >= finalIndex) {
        let prob = currentStates[i];
        if (prob !== 0) {
            if (spark === 119) {
                nextStates[0] += prob;
                rankUps += prob;
            } else {
                if (spark === 30) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                    const baseOdds = odds[0];
                    const firstCalc = prob * baseOdds;
                    urgentPulls += prob;
                    prob -= firstCalc;
                    for (let j = 0; j < 9; j++) {
                        const nextCalc = prob * baseOdds;
                        bufferUrgent += nextCalc;
                        prob -= nextCalc;
                    }
                    const bufferWL = bufferUrgent * 0.5;
                    // nextStates[i] += bufferWL;
                    const winLossProb = bufferWL * baseOdds * 0.5;
                    const lossProb = bufferWL * (1 - baseOdds);
                    nextStates[1] += winLossProb + winLossProb;
                    nextStates[i + 91] += lossProb;
                    rankUps += bufferWL;
                    rankUpsPast += bufferWL;

                    prob += bufferWL;
                }
                const probSSRWinLoss = prob * wlOdds;
                nextStates[0] += probSSRWinLoss;
                buffer[spark + 1] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
            }
            currentStates[i] = 0;
        }
        if (spark === 0 || i === finalIndex) break;
        i -= 1;
        spark -= 1;
    }

    if (spark === 0 && i > finalIndex) i -= 1;

    if (have_pity_chunk) {
        while (i > final_spark_chunk) {
            pity -= 1;

            currentOdd = odds[pity];
            wlOdds = currentOdd * 0.5;
            lOdds = 1 - currentOdd;

            const probSpark = currentStates[i];
            if (probSpark !== 0) {
                nextStates[0] += probSpark;
                rankUps += probSpark;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 118; s >= 31; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[0] += probSSRWinLoss;
                    buffer[s + 1] += probSSRWinLoss;
                    currentStates[i + 121] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }

            let prob = currentStates[i];
            if (prob !== 0) {
                const baseOdds = odds[0];
                const firstCalc = prob * baseOdds;
                urgentPulls += prob;
                prob -= firstCalc;
                for (let j = 0; j < 9; j++) {
                    const nextCalc = prob * baseOdds;
                    bufferUrgent += nextCalc;
                    prob -= nextCalc;
                }
                const bufferWL = bufferUrgent * 0.5;
                // nextStates[i] += bufferWL;
                const winLossProb = bufferWL * baseOdds * 0.5;
                const lossProb = bufferWL * (1 - baseOdds);
                nextStates[1] += winLossProb + winLossProb;
                nextStates[i + 91] += lossProb;
                rankUps += bufferWL;
                rankUpsPast += bufferWL;

                prob += bufferWL;

                let s = 30;
                const probSSRWinLoss = prob * wlOdds;
                nextStates[0] += probSSRWinLoss;
                buffer[s + 1] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            i -= 1;

            for (let s = 29; s >= 0; s--) {
                const prob = currentStates[i];
                if (prob !== 0) {
                    const probSSRWinLoss = prob * wlOdds;
                    nextStates[0] += probSSRWinLoss;
                    buffer[s + 1] += probSSRWinLoss;
                    currentStates[i + 121] += prob * lOdds;
                    rankUps += probSSRWinLoss;
                    currentStates[i] = 0;
                }
                i -= 1;
            }
        }
    }

    if (i >= finalIndex) {
        spark = 119;
        pity -= 1;

        currentOdd = odds[pity];
        wlOdds = currentOdd * 0.5;
        lOdds = 1 - currentOdd;

        const probSpark = currentStates[i];
        if (probSpark !== 0) {
            nextStates[0] += probSpark;
            rankUps += probSpark;
            currentStates[i] = 0;
        }
        spark -= 1;
        i -= 1;

        while (i >= finalIndex) {
            let prob = currentStates[i];
            if (prob !== 0) {
                if (spark === 30) { // actual spark 31, ie before spark 31 we do urgent recruitment, which is the correct way, then we manually do the current pull for these states which they missed, avoids double counting, while preserving efficiency
                    const baseOdds = odds[0];
                    const firstCalc = prob * baseOdds;
                    urgentPulls += prob;
                    prob -= firstCalc;
                    for (let j = 0; j < 9; j++) {
                        const nextCalc = prob * baseOdds;
                        bufferUrgent += nextCalc;
                        prob -= nextCalc;
                    }
                    const bufferWL = bufferUrgent * 0.5;
                    // nextStates[i] += bufferWL;
                    const winLossProb = bufferWL * baseOdds * 0.5;
                    const lossProb = bufferWL * (1 - baseOdds);
                    nextStates[1] += winLossProb + winLossProb;
                    nextStates[i + 91] += lossProb;
                    rankUps += bufferWL;
                    rankUpsPast += bufferWL;

                    prob += bufferWL;
                }
                const probSSRWinLoss = prob * wlOdds;
                nextStates[0] += probSSRWinLoss;
                buffer[spark + 1] += probSSRWinLoss;
                currentStates[i + 121] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    for (let i = 0; i < SPARKS; i++) {
        currentStates[i] += buffer[i];
    }
    buffer.fill(0);

    probDistrRankUps[inputIndex] += rankUps;
    probDistrRankUpsPast[inputIndex] += rankUpsPast;
    urgentPullDistr[0] += urgentPulls;
}