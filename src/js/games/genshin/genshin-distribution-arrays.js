export function makeDistributionArraysSSR(inputConfig, pity, STATES_LIMITS) {
    if (!Array.isArray(inputConfig.SSR.pullPlan)) throw new Error("Invalid pull plan");

    const { pullPlan: bannerPlan } = inputConfig.SSR;
    const distributionSSR = [];

    for (const [bannerIndex, bannerType] of bannerPlan.entries()) {
        const isCharacterBanner = bannerType.type === 'char';

        if (isCharacterBanner) {
            distributionSSR.push(
                Array.from({ length: 3 }, () => ({
                    states: Array.from({ length: STATES_LIMITS.CHARACTER_SSR_5050 }, () => new Map()),
                    type: 'Character',
                    isEmpty: true
                }))
            );
            distributionSSR[bannerIndex].push(
                { states: Array.from({ length: STATES_LIMITS.CHARACTER_SSR_GUARANTEED }, () => new Map()), type: 'Character', isEmpty: true }
            );
        } else {
            distributionSSR.push(
                Array.from({ length: 4 }, () => ({
                    states: Array.from({ length: STATES_LIMITS.WEAPON_SSR }, () => new Map()),
                    type: 'Weapon',
                    isEmpty: true
                }))
            );
        }
    }
    distributionSSR.push(
        Array.from({ length: 4 }, () => ({
            states: Array.from({ length: 1 }, () => new Map())
        }))
    );
    initializeStartingState(pity, STATES_LIMITS);

    return { distributionSSR };

    function initializeStartingState(pityData, STATES_LIMITS) {
        let special = 0;
        if (pityData[0].type === 'firstChar') {
            special = pityData[0].special;
        }
        if (special > 0 && pityData[0].pity >= STATES_LIMITS.CHARACTER_SSR_GUARANTEED) {
            special--;
        }
        distributionSSR[0][special].states[pityData[0].pity].set(0, {
            prob: 1.0
        });
        distributionSSR[0][special].isEmpty = false;
    }
}

export function sortPitySSR(inputConfig, gachaPities) {
    let foundFirstChar = false;
    let foundFirstWep = false;
    let charPity = 0;
    let wepPity = 0;
    const pity = [];

    charPity += inputConfig.SSR.pity.char;
    charPity += inputConfig.SSR.guarantee.char * gachaPities.pitySSRChar;

    wepPity += inputConfig.SSR.pity.wep;
    wepPity += inputConfig.SSR.special.epitPath === 0 ? inputConfig.SSR.guarantee.wep * gachaPities.pitySSRWep : 2 * gachaPities.pitySSRWep;

    for (const element of inputConfig.SSR.pullPlan) {
        if (element.type === 'char' && !foundFirstChar) {
            foundFirstChar = true;
            pity.push({ type: 'firstChar', pity: charPity, special: inputConfig.SSR.special.capRad });
        } else if (element.type === 'wep' && !foundFirstWep) {
            foundFirstWep = true;
            pity.push({ pity: wepPity });
        } else {
            pity.push({ pity: 0 });
        }
    }

    pity.push({ pity: 0 });
    return pity;
}

export function makeDistributionArraysSR(inputConfig, STATES_LIMITS) {
    const STATES = STATES_LIMITS.SR;
    const PITY = STATES / 2;
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