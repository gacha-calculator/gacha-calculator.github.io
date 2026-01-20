export function makeDistributionArraysSSR(inputConfig, pity, STATES_LIMITS) {
    if (!Array.isArray(inputConfig.SSR.pullPlan)) throw new Error("Invalid pull plan");

    const { pullPlan: bannerPlan } = inputConfig.SSR;
    const distributionSSR = [];

    for (let i = 0; i < bannerPlan.length; i++) {
        const isCharacterBanner = bannerPlan[i].type === 'char';

        if (isCharacterBanner) {
            distributionSSR.push(
                { spark: Array.from({ length: 240 }, () => ({ pity: Array.from({ length: STATES_LIMITS.CHARACTER }, () => new Map()), isEmpty: true })), 
                type: 'Character', isEmpty: true, bannerCount: bannerPlan[i].bannerCount});
        } else {
            distributionSSR.push(
                { states: Array.from({ length: STATES_LIMITS.WEAPON }, () => new Map()), type: 'Weapon', isEmpty: true, bannerCount: bannerPlan[i].bannerCount }
            );
        }
    }
    distributionSSR.push({ spark: Array.from({ length: 1 }, () => new Map()) });
    initializeStartingState(pity);

    return { distributionSSR };

    function initializeStartingState(pityData) {
        distributionSSR[0].spark[0].pity[pityData[0]].set(0, { // key is now xxyyz, yy is this banner's losses, xx global, z is if first guarantee was cleared
            prob: 1.0
        });
        distributionSSR[0].isEmpty = false;
        distributionSSR[0].spark[0].isEmpty = false;
    }
}

export function sortPitySSR(inputConfig) {
    let foundFirstChar = false;
    let foundFirstWep = false;
    let charPity = 0;
    let wepPity = 0;
    const pity = [];

    // Determine pity on char and wep respectively
    charPity += inputConfig.SSR.pity.char;
    wepPity += inputConfig.SSR.pity.wep;

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

export function makeDistributionArraysSR(inputConfig, STATES_LIMITS) {
    const distributionCharSR = [{ states: Array.from({ length: STATES_LIMITS.SR }, () => new Map()) }];
    const distributionWepSR = [{ states: Array.from({ length: 0 }, () => new Map()) }];

    const pityCharSR = inputConfig.SR.pity.char;
    if (pityCharSR) {
        initializeStartingState(distributionCharSR[0].states[pityCharSR]);
    } else {
        initializeStartingState(distributionCharSR[0].states[0]);
    }

    function initializeStartingState(currentMap) {
        currentMap.set(0, {
            prob: 1.0
        });
    }

    return { distributionCharSR, distributionWepSR };
}