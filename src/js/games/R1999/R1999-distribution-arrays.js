export function makeDistributionArraysSSR(inputConfig, pity, STATES_LIMIT) {
    if (!Array.isArray(inputConfig.SSR.pullPlan)) throw new Error("Invalid pull plan");

    const { pullPlan: bannerPlan } = inputConfig.SSR;
    const distributionSSR = [];

    for (let i = 0; i < bannerPlan.length; i++) {
        distributionSSR.push(
            ({
                states: Array.from({ length: STATES_LIMIT }, () => new Map()),
                isEmpty: true,
                bannerCount: bannerPlan[i].bannerCount
            })
        );
    }
    distributionSSR.push(
        ({ states: Array.from({ length: 1 }, () => new Map()) })
    );
    initializeStartingState(pity);

    return distributionSSR;

    function initializeStartingState(pityData) {
        distributionSSR[0].states[pityData].set(0, {
            prob: 1.0
        });
        distributionSSR[0].isEmpty = false;
    }
}

export function sortPity(inputConfig, gachaPities) {
    return { SSR: inputConfig.SSR.pity.char + inputConfig.SSR.guarantee.char * gachaPities.pitySSR };
}

export function makeDistributionArraysSR(inputConfig) {
    const pullPlan = inputConfig.SSR.pullPlan;
    const lastIndex = pullPlan.length - 1;
    const bannerCount = pullPlan[lastIndex].bannerCount;
    let distributionSR = [];
    for (let i = 0; i <= bannerCount; i++) {
        const pity = inputConfig.SR.pity[i];
        let isFirstTen = true;
        if (pity === 10) {
            isFirstTen = false
        }
        let isGuarantee = 0;
        if (inputConfig.SR.guarantee[i]) {
            isGuarantee = 1;
        }
        if (isFirstTen) {
            if (isGuarantee) {
                distributionSR.push([{ states: [new Map(), Array.from({ length: 11 }, () => new Map())] }]);
                distributionSR[i][0].states[isGuarantee][pity].set(0, {
                    prob: 1.0
                });
            } else {
                distributionSR.push([{ states: [Array.from({ length: 11 }, () => new Map()), new Map()] }]);
                distributionSR[i][0].states[isGuarantee][pity].set(0, {
                    prob: 1.0
                });
            }
        } else {
            distributionSR.push([{ states: [new Map(), new Map()] }]);
            distributionSR[i][0].states[isGuarantee].set(0, {
                prob: 1.0
            });
        }

    }
    return distributionSR;
} 