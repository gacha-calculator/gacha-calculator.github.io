export function makeDistributionArraysSSR(inputConfig, pity, STATES_LIMITS) {
    if (!Array.isArray(inputConfig.SSR.pullPlan)) throw new Error("Invalid pull plan");

    const { pullPlan: bannerPlan } = inputConfig.SSR;
    const distributionSSR = [];

    for (const [bannerIndex, bannerType] of bannerPlan.entries()) {
        const isCharacterBanner = bannerType.type === 'char';

        if (isCharacterBanner) {
            distributionSSR.push(
                { states: Array.from({ length: STATES_LIMITS.CHARACTER }, () => new Map()), type: 'Character', isEmpty: true }
            );
        } else {
            distributionSSR.push(
                { states: Array.from({ length: STATES_LIMITS.WEAPON }, () => new Map()), type: 'Weapon', isEmpty: true }
            );
        }
    }
    distributionSSR.push({ states: Array.from({ length: 1 }, () => new Map()) });
    initializeStartingState(pity);

    return { distributionSSR };

    function initializeStartingState(pityData) {
        distributionSSR[0].states[pityData[0]].set(0, {
            prob: 1.0
        });
        distributionSSR[0].isEmpty = false;
    }
}

export function sortPitySSR(inputConfig, gachaPities) {
    const CHAR_PITY = gachaPities.pitySSRChar;
    let foundFirstChar = false;
    let foundFirstWep = false;
    let charPity = 0;
    let wepPity = 0;
    const pity = [];

    // Determine pity on char and wep respectively
    charPity += inputConfig.SSR.pity.char;
    charPity += inputConfig.SSR.guarantee.char * CHAR_PITY;

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
    const STATES = STATES_LIMITS.SR;
    const PITY = (STATES - 1) / 2;
    const distributionCharSR = [{ states: Array.from({ length: STATES_LIMITS.SR }, () => new Map()) }];
    const distributionWepSR = [{ states: Array.from({ length: STATES_LIMITS.SR }, () => new Map()) }];
    const pityCharSR = inputConfig.SR.guarantee.char * PITY + inputConfig.SR.pity.char;
    const pityWepSR = inputConfig.SR.guarantee.wep * PITY + inputConfig.SR.pity.wep;
    initializeStartingState(distributionCharSR[0].states[pityCharSR]);
    initializeStartingState(distributionWepSR[0].states[pityWepSR]);

    function initializeStartingState(currentMap) {
        currentMap.set(0, {
            prob: 1.0
        });
    }
    return { distributionCharSR, distributionWepSR };
}