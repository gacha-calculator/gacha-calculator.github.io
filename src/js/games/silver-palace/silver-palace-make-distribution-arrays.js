export function makeDistributionArraysSSR(inputConfig, STATES_LIMITS) {
    if (!Array.isArray(inputConfig.SSR.pullPlan)) throw new Error("Invalid pull plan");
    const { pullPlan: bannerPlan } = inputConfig.SSR;

    const distributionSSR = [];
    const distributionSSRData = [];
    let pity = inputConfig.SSR.pity.char;
    const sumFirst = 120 * STATES_LIMITS.CHARACTER * 45;
    const sum = 240 * STATES_LIMITS.CHARACTER * 45;
    let currentBanner = -1;
    const sparkDistr = [];

    for (let i = 0; i < bannerPlan.length; i++) {
        if (bannerPlan[i].bannerCount === currentBanner) {
            distributionSSR.push(new Float64Array(sum));
            distributionSSRData.push({
                type: 'Character', bannerCount: bannerPlan[i].bannerCount, minIndex: 0, maxIndex: 0, isFirst: false
            });
        } else {
            distributionSSR.push(new Float64Array(sumFirst));
            distributionSSRData.push({
                type: 'Character', bannerCount: bannerPlan[i].bannerCount, minIndex: 0, maxIndex: 0, isFirst: true
            });
            currentBanner = bannerPlan[i].bannerCount;
        }
        sparkDistr.push({ rUps: 0, sparks: 0 });
    }
    distributionSSR.push(new Float64Array(sum));
    distributionSSR.push(new Float64Array(sum));
    sparkDistr.push({ rUps: 0, sparks: 0 });
    sparkDistr.push({ rUps: 0, sparks: 0 });
    distributionSSRData.push({
        type: 'Target', bannerCount: currentBanner, minIndex: 0, maxIndex: 0 // whichever is faster, same or not, use that
    });
    distributionSSRData.push({
        type: 'Double Target', bannerCount: currentBanner, minIndex: 0, maxIndex: 0
    });

    initializeStartingState(pity);

    return { distributionSSR, distributionSSRData, sparkDistr };

    function initializeStartingState(startingPity) {
        distributionSSR[0][startingPity * 120] = 1;
        distributionSSRData[0].minIndex = startingPity * 120;
        distributionSSRData[0].maxIndex = startingPity * 120;
    }
}

export function makeDistributionArraysSSRPerItem(inputConfig, STATES_LIMITS) {
    if (!Array.isArray(inputConfig.SSR.pullPlan)) throw new Error("Invalid pull plan");
    const { pullPlan: bannerPlan } = inputConfig.SSR;

    const distributionSSR = [];
    const distributionSSRData = [];
    let pity = inputConfig.SSR.pity.char;
    const sumFirst = 120 * STATES_LIMITS.CHARACTER * 22;
    const sum = 240 * STATES_LIMITS.CHARACTER * 22;
    let currentBanner = -1;
    const sparkDistr = [];

    for (let i = 0; i < bannerPlan.length; i++) {
        if (bannerPlan[i].bannerCount === currentBanner) {
            distributionSSR.push(new Float64Array(sum));
            distributionSSRData.push({
                type: 'Character', bannerCount: bannerPlan[i].bannerCount, minIndex: 0, maxIndex: 0, isFirst: false
            });
        } else {
            distributionSSR.push(new Float64Array(sumFirst));
            distributionSSRData.push({
                type: 'Character', bannerCount: bannerPlan[i].bannerCount, minIndex: 0, maxIndex: 0, isFirst: true
            });
            currentBanner = bannerPlan[i].bannerCount;
        }
        sparkDistr.push({ rUps: 0, sparks: 0 });
    }
    distributionSSR.push(new Float64Array(sum));
    distributionSSR.push(new Float64Array(sum));
    sparkDistr.push({ rUps: 0, sparks: 0 });
    sparkDistr.push({ rUps: 0, sparks: 0 });
    distributionSSRData.push({
        type: 'Target', bannerCount: currentBanner, minIndex: 0, maxIndex: 0 // whichever is faster, same or not, use that
    });
    distributionSSRData.push({
        type: 'Double Target', bannerCount: currentBanner, minIndex: 0, maxIndex: 0
    });

    initializeStartingState(pity);

    return { distributionSSR, distributionSSRData, sparkDistr };

    function initializeStartingState(startingPity) {
        distributionSSR[0][startingPity * 120] = 1;
        distributionSSRData[0].minIndex = startingPity * 120;
        distributionSSRData[0].maxIndex = startingPity * 120;
    }
}

export function makeDistributionArraysSSRCheap(inputConfig, STATES_LIMITS) {
    if (!Array.isArray(inputConfig.SSR.pullPlan)) throw new Error("Invalid pull plan");
    const { pullPlan: bannerPlan } = inputConfig.SSR;
    const type = bannerPlan[0].type;

    const distributionSSR = [];
    const distributionSSRData = [];
    const weaponRankUpMap = [];
    if (type === 'char') {
        let pity = inputConfig.SSR.pity.char;
        const sumFirst = 120 * STATES_LIMITS.CHARACTER;
        const sum = 240 * STATES_LIMITS.CHARACTER;
        let currentBanner = -1;

        for (let i = 0; i < bannerPlan.length; i++) {
            if (bannerPlan[i].bannerCount === currentBanner) {
                distributionSSR.push(new Float64Array(sum));
                distributionSSRData.push({
                    type: 'Character', bannerCount: bannerPlan[i].bannerCount, minIndex: 0, maxIndex: 0, isFirst: false
                });
            } else {
                distributionSSR.push(new Float64Array(sumFirst));
                distributionSSRData.push({
                    type: 'Character', bannerCount: bannerPlan[i].bannerCount, minIndex: 0, maxIndex: 0, isFirst: true
                });
                currentBanner = bannerPlan[i].bannerCount;
            }
        }
        distributionSSR.push(new Float64Array(sum));
        distributionSSR.push(new Float64Array(sum));
        distributionSSRData.push({
            type: 'Target', bannerCount: currentBanner, minIndex: 0, maxIndex: 0 // whichever is faster, same or not, use that
        });
        distributionSSRData.push({
            type: 'Double Target', bannerCount: currentBanner, minIndex: 0, maxIndex: 0
        });

        initializeStartingState(pity);
    } else {
        let pity = inputConfig.SSR.pity.wep * 10;
        let sums = [160, 180, 340, 500, 660, 820, 980];
        let breakpoints = [80, 180, 340, 500, 660, 820, 980];
        let withinBanner = 0;
        for (let i = 0; i < breakpoints.length; i++) {
            if (pity > breakpoints[i]) {
                withinBanner = i + 1;
            }
        }
        let currentBanner = 0;
        let lastSum;

        for (let i = 0; i < bannerPlan.length; i++) {
            if (currentBanner !== bannerPlan[i].bannerCount) {
                withinBanner = 0;
            }
            distributionSSR.push(new Float64Array(sums[withinBanner]));
            weaponRankUpMap.push(Array.from({ length: sums[withinBanner] + 1 }, () => new Map()));
            lastSum = sums[withinBanner];
            distributionSSRData.push({
                type: 'Weapon', bannerCount: bannerPlan[i].bannerCount, minIndex: 0, maxIndex: 0
            });
            withinBanner++;
            currentBanner = bannerPlan[i].bannerCount;
        }
        distributionSSR.push(new Float64Array(lastSum));
        distributionSSRData.push({
            type: 'Target', bannerCount: currentBanner, minIndex: 0, maxIndex: 0
        });

        initializeStartingStateWeapon(pity);
    }

    return { distributionSSR, distributionSSRData, weaponRankUpMap };

    function initializeStartingState(startingPity) {
        distributionSSR[0][startingPity * 120] = 1;
        distributionSSRData[0].minIndex = startingPity * 120;
        distributionSSRData[0].maxIndex = startingPity * 120;
    }

    function initializeStartingStateWeapon(startingPity) {
        distributionSSR[0][startingPity] = 1;
        distributionSSRData[0].minIndex = startingPity;
        distributionSSRData[0].maxIndex = startingPity;
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

    return distributionCharSR;
}