export function makeDistributionArraysSSR(inputConfig, pity, STATES_LIMIT) {
    if (!Array.isArray(inputConfig.SSR.pullPlan)) throw new Error("Invalid pull plan");

    const { pullPlan: bannerPlan } = inputConfig.SSR;
    const distributionSSR = [];

    for (let i = 0; i < bannerPlan.length; i++) {
        if (bannerPlan[i].type === 'char') {
            distributionSSR.push(
                ({
                    states: Array.from({ length: STATES_LIMIT.char }, () => new Map()),
                    isEmpty: true,
                    type: bannerPlan[i].type,
                    bannerCount: bannerPlan[i].bannerCount
                })
            );
        } else if (bannerPlan[i].type === 'wep') {
            distributionSSR.push(
                ({
                    states: Array.from({ length: STATES_LIMIT.wep }, () => new Map()),
                    isEmpty: true,
                    type: bannerPlan[i].type,
                    bannerCount: bannerPlan[i].bannerCount
                })
            );
        }
    }
    distributionSSR.push(
        ({ states: Array.from({ length: 1 }, () => new Map()) })
    );
    initializeStartingState(pity);

    return distributionSSR;

    function initializeStartingState(pityData) {
        distributionSSR[0].states[pityData[0]].set(0, {
            prob: 1.0
        });
        distributionSSR[0].isEmpty = false;
    }
}

export function sortPity(inputConfig, gachaPities) {
    let foundFirstChar = false;
    let foundFirstWep = false;
    let charPity = 0;
    let wepPity = 0;
    const pity = [];

    // Determine pity on char and wep respectively
    charPity += inputConfig.SSR.pity.char;
    charPity += inputConfig.SSR.guarantee.char * gachaPities.pitySSR;

    wepPity += inputConfig.SSR.pity.wep;
    wepPity += inputConfig.SSR.guarantee.wep * gachaPities.pitySSR;

    // Assign them to their first occurance
    for (const element of inputConfig.SSR.pullPlan) {
        if (element.type === 'char' && !foundFirstChar) {
            foundFirstChar = true;
            pity.push(charPity);
        } else if (element.type === 'wep' && !foundFirstWep) {
            foundFirstWep = true;
            pity.push(wepPity);
        } else {
            pity.push(0);
        }
    }

    pity.push(0); // For the last win, naturally it can't have pity
    return pity;
}