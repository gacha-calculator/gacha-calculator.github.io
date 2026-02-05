export function makeDistributionArraysSSR(inputConfig, STATES_LIMITS) {
    if (!Array.isArray(inputConfig.SSR.pullPlan)) throw new Error("Invalid pull plan");

    const { pullPlan: bannerPlan } = inputConfig.SSR;
    const distributionSSR = [];
    let pity;
    const sum = 360 * 80 * 20;

    for (let i = 0; i < bannerPlan.length; i++) {
        const isCharacterBanner = bannerPlan[i].type === 'char';

        if (isCharacterBanner) {
            pity = inputConfig.SSR.pity.char;
            distributionSSR.push(
                {
                    distribution: new Float64Array(sum),
                    type: 'Character', bannerCount: bannerPlan[i].bannerCount, minIndex: 0, maxIndex: 0
                });
        } else {
            pity = inputConfig.pity.wep;
            distributionSSR.push(
                { states: Array.from({ length: STATES_LIMITS.WEAPON }, () => new Float64Array(20)), type: 'Weapon', bannerCount: bannerPlan[i].bannerCount }
            );
        }
    }
    distributionSSR.push({
        distribution: new Float64Array(sum),
        type: 'Target'
    });
    distributionSSR.push({
        distribution: new Float64Array(sum),
        type: 'Double Target'
    });
    initializeStartingState(pity);

    return { distributionSSR };

    function initializeStartingState(startingPity) {
        distributionSSR[0].distribution[startingPity] = 1;
    }
}

export function makeDistributionArraysSR(inputConfig, STATES_LIMITS) {
    const distributionCharSR = [{ states: Array.from({ length: STATES_LIMITS.SR }, () => new Map()) }];

    const pityCharSR = inputConfig.SR.pity.char;
    if (Number.isInteger(pityCharSR)) {
        initializeStartingState(distributionCharSR[0].states[pityCharSR]);
    } else {
        initializeStartingState(distributionCharSR[0].states[0]);
    }

    function initializeStartingState(currentMap) {
        currentMap.set(0, {
            prob: 1.0
        });
    }

    return { distributionCharSR };
}