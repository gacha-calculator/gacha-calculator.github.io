export function makeDistributionArraysSSR(inputConfig, STATES_LIMITS) {
    if (!Array.isArray(inputConfig.SSR.pullPlan)) throw new Error("Invalid pull plan");
    const { pullPlan: bannerPlan } = inputConfig.SSR;

    const distributionSSR = [];
    const distributionSSRData = [];
    let pity;
    const sum = 360 * 80 * 45;

    for (let i = 0; i < bannerPlan.length; i++) {
        pity = inputConfig.SSR.pity.char;
        distributionSSR.push(new Float64Array(sum));
        distributionSSRData.push({
            type: 'Character', bannerCount: bannerPlan[i].bannerCount, minIndex: 0, maxIndex: 0
        });
    }
    distributionSSR.push(new Float64Array(sum));
    distributionSSR.push(new Float64Array(sum));

    distributionSSRData.push({
        type: 'Target', bannerCount: 0, minIndex: 0, maxIndex: 0
    });
    distributionSSRData.push({
        type: 'Double Target', bannerCount: 0, minIndex: 0, maxIndex: 0
    });

    initializeStartingState(pity);

    return { distributionSSR, distributionSSRData };

    function initializeStartingState(startingPity) {
        distributionSSR[0][startingPity] = 1;
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