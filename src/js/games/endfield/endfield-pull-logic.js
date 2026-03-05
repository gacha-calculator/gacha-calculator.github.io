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
                    handleSSRFirst(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps);
                } else {
                    handleSSRFirstNextNew(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps);
                }
            } else {
                if (distributionSSRData[wins].bannerCount === distributionSSRData[wins + 1].bannerCount) {
                    handleSSR(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark);
                } else {
                    handleSSRNextNew(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark);
                }
            }
        } else if (isWeapon) {
            handleSSR(ODDS_WEAPON_SSR, wins, distributionSSR, distributionSSRData, rankUps, currentArray.type);
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
                    handleSSRFirst(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps); // next isn't new so it writes normally and no spark so no double
                } else {
                    handleSSRFirstNextNewPerItem(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, perBannerData);
                }
            } else {
                if (distributionSSRData[wins].bannerCount === distributionSSRData[wins + 1].bannerCount) {
                    handleSSRPerItem(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, perBannerData);
                } else {
                    handleSSRNextNewPerItem(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, perBannerData);
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

export function rankUpSSRCheap(distributionSSR, distributionSSRData, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, rateUpOdds = 0.5, boundsIndices, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, buffer, bufferSmall) {
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
                    handleSSRFirstCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, probDistrRankUps, bufferSmall);
                } else {
                    handleSSRFirstNextNewCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, probDistrRankUps, bufferSmall);
                }
            } else {
                if (distributionSSRData[wins].bannerCount === distributionSSRData[wins + 1].bannerCount) {
                    handleSSRCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, buffer);
                } else {
                    handleSSRNextNewCheap(ODDS_CHARACTER_SSR, wins, distributionSSR, distributionSSRData, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, buffer);
                }
            }
        } else if (isWeapon) {
            handleSSR(ODDS_WEAPON_SSR, wins, distributionSSR, distributionSSRData, rankUps, currentArray.type);
        } else {
            throw new Error(`Unknown SSR array type: ${currentArray.type}`);
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

    if (i > finalIndex) {
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

function handleSSRNextNew(odds, inputIndex, array, arrayData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark) {
    const SPARKS = 240;
    const NEW_SPARKS = 120;
    const STATES_PER_KEY = PITY_STATES * SPARKS;
    const STATES_PER_KEY_NEW = STATES_PER_KEY * 0.5;
    let rankUps = 0;
    let rankUpsDouble = 0;
    let rankUpsSparks = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];

    const doubleNextStates = array[inputIndex + 2];
    const areDoubleNextStatesNewBanner = arrayData[inputIndex + 2].isFirst;

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
    let targetDoubleNextIdx = areDoubleNextStatesNewBanner ? newBannerKeyIndex : keyIndex;
    let nextStateSparkWinIdx = newBannerKeyIndex + STATES_PER_KEY_NEW;
    let nextStateSparkLossIdx = newBannerKeyIndex + newPityIndex + NEW_SPARKS;

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
                keyIndex -= STATES_PER_KEY;
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
            targetDoubleNextIdx = areDoubleNextStatesNewBanner ? newBannerKeyIndex : keyIndex;
            nextStateSparkWinIdx = newBannerKeyIndex + STATES_PER_KEY_NEW;
            nextStateSparkLossIdx = newBannerKeyIndex + newPityIndex + NEW_SPARKS;

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

    if (i > finalIndex) {
        spark = 239;

        if (pity === 0) {
            pity = PITY_STATES - 1;
            pityIndex = pity * SPARKS;
            newPityIndex = pityIndex * 0.5;
            keyIndex -= STATES_PER_KEY;
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
        targetDoubleNextIdx = areDoubleNextStatesNewBanner ? newBannerKeyIndex : keyIndex;
        nextStateSparkWinIdx = newBannerKeyIndex + STATES_PER_KEY_NEW;
        nextStateSparkLossIdx = newBannerKeyIndex + newPityIndex + NEW_SPARKS;

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
    probDistrRankUpsDouble[inputIndex] += rankUpsDouble;
    probDistrRankUpsSpark[inputIndex] += rankUpsSparks;
}

function handleSSRFirst(odds, inputIndex, array, arrayData, PITY_STATES, probDistrRankUps) {
    const SPARKS = 120;
    const STATES_PER_KEY = PITY_STATES * SPARKS;
    const STATES_PER_KEY_NORMAL = STATES_PER_KEY * 2;
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
        const prob = currentStates[i];
        if (prob !== 0) {
            if (spark === 119) {
                nextStates[guaranteeIndex] += prob;
                rankUps += prob;
            } else {
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

            for (let s = 118; s >= 0; s--) {
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

    if (i > finalIndex) {
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
            const prob = currentStates[i];
            if (prob !== 0) {
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
        const prob = currentStates[i];
        if (prob !== 0) {
            if (spark === 119) {
                nextStates[keyIndex] += prob;
                rankUps += prob;
            } else {
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

            for (let s = 118; s >= 0; s--) {
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

    if (i > finalIndex) {
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
            const prob = currentStates[i];
            if (prob !== 0) {
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

    if (i > finalIndex) {
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

function handleSSRNextNewPerItem(odds, inputIndex, array, arrayData, PITY_STATES, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, perBannerData) {
    const SPARKS = 240;
    const NEW_SPARKS = 120;
    const STATES_PER_KEY = PITY_STATES * SPARKS;
    let rankUps = 0;
    let rankUpsDouble = 0;
    let rankUpsSparks = 0;
    let rankUpsPerKey = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];
    const currentBanner = currentItemData.bannerCount;

    const doubleNextStates = array[inputIndex + 2];

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
                doubleNextStates[0] += probSSRWinLoss;
                nextStates[0] += probSSRWinLoss;
                nextStates[newPityIndex + NEW_SPARKS] += probLoss;
                rankUpsDouble += probSSRWinLoss;
                rankUpsSparks += probSSRWinLoss + probLoss;
                perBannerData[currentBanner][key] += rankUpsDouble + rankUpsSparks;
                rankUpsPerKey += probSSRWinLoss + probSSRWinLoss + probLoss;
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
                doubleNextStates[0] += probSSRWinLoss;
                nextStates[0] += probSSRWinLoss;
                nextStates[newPityIndex + NEW_SPARKS] += probLoss;
                rankUpsDouble += probSSRWinLoss;
                rankUpsSparks += probSSRWinLoss + probLoss;
                rankUpsPerKey += probSSRWinLoss + probSSRWinLoss + probLoss;
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

    if (i > finalIndex) {
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
            doubleNextStates[0] += probSSRWinLoss;
            nextStates[0] += probSSRWinLoss;
            nextStates[newPityIndex + NEW_SPARKS] += probLoss;
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
                nextStates[0] += probSSRWinLoss;
                currentStates[i + currentStateWinOffset] += probSSRWinLoss;
                currentStates[i + 241] += prob * lOdds;
                rankUps += probSSRWinLoss;
                currentStates[i] = 0;
            }
            spark -= 1;
            i -= 1;
        }
    }

    perBannerData[currentBanner][key] += rankUpsPerKey;
    probDistrRankUps[inputIndex] += rankUps;
    probDistrRankUpsDouble[inputIndex] += rankUpsDouble;
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
        const prob = currentStates[i];
        if (prob !== 0) {
            if (spark === 119) {
                nextStates[0] += prob;
                rankUps += prob;
                rankUpsPerKey += prob;
            } else {
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

            for (let s = 118; s >= 0; s--) {
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

    if (i > finalIndex) {
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
    if (buffer.length === 0) {
        debugger;
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

    if (i > finalIndex) {
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

function handleSSRNextNewCheap(odds, inputIndex, array, arrayData, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, buffer) {
    const SPARKS = 240;
    const NEW_SPARKS = 120;
    let rankUps = 0;
    let rankUpsDouble = 0;
    let rankUpsSparks = 0;

    const currentStates = array[inputIndex];
    const currentItemData = arrayData[inputIndex];
    const nextStates = array[inputIndex + 1];

    const doubleNextStates = array[inputIndex + 2];

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
                doubleNextStates[0] += probSSRWinLoss;
                nextStates[0] += probSSRWinLoss;
                nextStates[newPityIndex + NEW_SPARKS] += probLoss; // how is this handled normally...
                rankUpsSparks += probSSRWinLoss + probLoss;
                rankUpsDouble += probSSRWinLoss;
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
                doubleNextStates[0] += probSSRWinLoss;
                nextStates[0] += probSSRWinLoss;
                nextStates[newPityIndex + NEW_SPARKS] += probLoss;
                rankUpsSparks += probSSRWinLoss + probLoss;
                rankUpsDouble += probSSRWinLoss;
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

    if (i > finalIndex) {
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
            doubleNextStates[0] += probSSRWinLoss;
            nextStates[0] += probSSRWinLoss;
            nextStates[newPityIndex + NEW_SPARKS] += probLoss;
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
    probDistrRankUpsDouble[inputIndex] += rankUpsDouble;
    probDistrRankUpsSpark[inputIndex] += rankUpsSparks;
}

function handleSSRFirstCheap(odds, inputIndex, array, arrayData, probDistrRankUps, buffer) {
    const SPARKS = 120;
    let rankUps = 0;

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
        const prob = currentStates[i];
        if (prob !== 0) {
            if (spark === 119) {
                nextStates[SPARKS] += prob;
                rankUps += prob;
            } else {
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

            for (let s = 118; s >= 0; s--) {
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

    if (i > finalIndex) {
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
            const prob = currentStates[i];
            if (prob !== 0) {
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
}

function handleSSRFirstNextNewCheap(odds, inputIndex, array, arrayData, probDistrRankUps, buffer) {
    const SPARKS = 120;
    let rankUps = 0;

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
        const prob = currentStates[i];
        if (prob !== 0) {
            if (spark === 119) {
                nextStates[0] += prob;
                rankUps += prob;
            } else {
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

            for (let s = 118; s >= 0; s--) {
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

    if (i > finalIndex) {
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
            const prob = currentStates[i];
            if (prob !== 0) {
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
}