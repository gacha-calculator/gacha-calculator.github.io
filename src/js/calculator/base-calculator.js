export class gachaCalculator {
    constructor(config, adapters = {}) {
        this.config = config;
        this.adapters = {
            statesLimits: null,
            distributionArrays: {
                makeSSR: () => { throw new Error('makeSSR not implemented'); },
                makeSR: () => { throw new Error('makeSR not implemented'); },
                sortPity: () => { throw new Error('sortPity not implemented'); }
            },
            pullLogic: {
                rankUpSSRCheap: () => { throw new Error('rankUpSSRCheap not implemented'); }
            },
            workers: {
                ssrWorker: () => { throw new Error('ssrWorker not implemented'); },
                srWorker: () => { throw new Error('srWorker not implemented'); }
            },
            contexts: {
                contextSSR: () => { throw new Error('contextSSR not implemented'); },
                contextSR: () => { throw new Error('contextSR not implemented'); }
            },
            helpers: {
                consolidateDistributionForCashback: () => { throw new Error('consolidateDistributionForCashback not implemented'); },
                consolidateProbabilitiesCheap: () => { throw new Error('consolidateProbabilitiesCheap not implemented'); },
                simplifyDistribution: () => { throw new Error('simplifyDistribution not implemented'); },
                normalizeCheap: () => { throw new Error('normalizeCheap not implemented'); },
                checkIsEmpty: () => { throw new Error('checkIsEmpty not implemented'); }
            },
            ...adapters
        };
    }

    async runGachaCalculation(inputConfig, target) {
        this.adapters.contexts.contextSSR.target = target;
        let allPullsDistributionSSR = [];
        let pastLossPerBannerType = {};
        let isTarget = false;
        let isEmpty = false;

        const { ssrWorker, srWorker } = this.adapters.workerManager.getWorkers();

        const pity = this.adapters.distributionArrays.sortPity(inputConfig);
        this.adapters.contexts.contextSSR.pities = pity;
        let { distributionSSR } = this.adapters.distributionArrays.makeSSR(inputConfig, pity);
        let { distributionCharSR, distributionWepSR } = this.adapters.distributionArrays.makeSR(inputConfig);

        try {
            await initializeWorkers(ssrWorker, srWorker, this.adapters.contexts, distributionSSR, { distributionCharSR, distributionWepSR }, pity);
        } catch (error) {
            console.error('Failed to initialize workers:', error);
        }

        let ssrData = await runSSRIteration(ssrWorker);
        if (ssrData.type === 'IterationComplete') {
            pastLossPerBannerType = ssrData.lossData;
        } else {
            pastLossPerBannerType = ssrData.lossData;
            isTarget = ssrData.isTarget;
            isEmpty = ssrData.isEmpty;
            allPullsDistributionSSR = ssrData.allPullsDistributionSSR;
            distributionSSR = ssrData.distributionSSR;
        }

        while (!isEmpty && !isTarget) {
            normalizePullsPerBanner(pastLossPerBannerType);
            [ssrData] = await Promise.all([
                runSSRIteration(ssrWorker),
                runSRIteration(srWorker, pastLossPerBannerType)
            ]);
            if (ssrData.type === 'IterationComplete') {
                pastLossPerBannerType = ssrData.lossData;
            } else {
                pastLossPerBannerType = ssrData.lossData;
                isTarget = ssrData.isTarget;
                isEmpty = ssrData.isEmpty;
                allPullsDistributionSSR = ssrData.allPullsDistributionSSR;
                distributionSSR = ssrData.distributionSSR;
            }
        }
        normalizePullsPerBanner(pastLossPerBannerType);
        let srData = await runFinalSRIteration(srWorker, pastLossPerBannerType);
        this.adapters.workerManager.terminateWorkers();

        distributionCharSR = srData.distributionCharSR;
        distributionWepSR = srData.distributionWepSR;

        const cashbackData = {
            SSR: this.adapters.helpers.consolidateDistributionForCashback(distributionSSR),
            CharSR: this.adapters.helpers.consolidateDistributionForCashback(distributionCharSR),
            WepSR: this.adapters.helpers.consolidateDistributionForCashback(distributionWepSR)
        }
        this.adapters.helpers.simplifyDistribution(distributionSSR);
        distributionCharSR = null;
        distributionWepSR = null;

        let iterationCount = 0;
        const PRUNE_EVERY_N = 10;
        while (!isEmpty) {
            if (isTarget) {
                iterationCount++;
                this.adapters.pullLogic.rankUpSSRCheap(distributionSSR, pity);
                if (iterationCount === PRUNE_EVERY_N) {
                    this.adapters.helpers.normalizeCheap(distributionSSR);
                }
                allPullsDistributionSSR.push(this.adapters.helpers.consolidateProbabilitiesCheap(distributionSSR));
                isEmpty = this.adapters.helpers.checkIsEmpty(distributionSSR, isTarget);
            }
        }
        const chartData = allPullsDistributionSSR;

        return {
            chartData,
            cashbackData
        };

        async function initializeWorkers(ssrWorker, srWorker, context, distributionSSR, { distributionCharSR, distributionWepSR }) {
            return new Promise((resolve, reject) => {
                let ssrInitialized = false;
                let srInitialized = false;
                let errorOccurred = false;

                function checkCompletion() {
                    if (!errorOccurred && ssrInitialized && srInitialized) {
                        resolve();
                    }
                }

                function handleError(error) {
                    if (!errorOccurred) {
                        errorOccurred = true;
                        reject(error);
                    }
                }

                ssrWorker.onerror = (error) => {
                    console.error('Worker error:', error);
                    handleError(error);
                };

                srWorker.onerror = (error) => {
                    handleError(error);
                };

                ssrWorker.onmessage = function (e) {
                    switch (e.data.type) {
                        case 'InitComplete':
                            ssrInitialized = true;
                            checkCompletion();
                            break;
                        default:
                            console.warn('Unknown message type');
                    }
                };

                srWorker.onmessage = function (e) {
                    switch (e.data.type) {
                        case 'InitComplete':
                            srInitialized = true;
                            checkCompletion();
                            break;
                        default:
                            console.warn('Unknown message type');
                    }
                };

                ssrWorker.postMessage({
                    type: 'Initiate',
                    distribution: distributionSSR,
                    context: context
                });

                srWorker.postMessage({
                    type: 'Initiate',
                    distribution: { distributionCharSR, distributionWepSR },
                    context: context
                });
            });
        }

        function runSSRIteration(worker) {
            return new Promise((resolve, reject) => {
                worker.onmessage = (e) => {
                    switch (e.data.type) {
                        case 'IterationComplete':
                            resolve(e.data);
                            break;
                        case 'LastIteration':
                            resolve(e.data);
                            break;
                    };
                }
                worker.onerror = reject;
                worker.postMessage({ type: 'Iterate' });
            });
        }

        function runSRIteration(worker, pastLossPerBannerType) {
            return new Promise((resolve, reject) => {
                worker.onmessage = (e) => {
                    resolve();
                }
                worker.onerror = reject;
                worker.postMessage({ type: 'Iterate', lossData: pastLossPerBannerType });
            });
        }

        function runFinalSRIteration(worker, pastLossPerBannerType) {
            return new Promise((resolve, reject) => {
                worker.onmessage = (e) => {
                    resolve(e.data);
                }
                worker.onerror = reject;
                worker.postMessage({ type: 'IterateLast', lossData: pastLossPerBannerType });
            });
        }

        function normalizePullsPerBanner(pullsPerBanner) {
            const totalPullsSum = pullsPerBanner.charRankUps.pullsSum + pullsPerBanner.wepRankUps.pullsSum;
            const NORMALIZATION_THRESHOLD = 1e-5;
            const diff = Math.abs(totalPullsSum - 1);
            if (diff > NORMALIZATION_THRESHOLD) {
                pullsPerBanner.charRankUps.pullsSum /= totalPullsSum;
                pullsPerBanner.charRankUps.rankUps /= totalPullsSum;
                pullsPerBanner.wepRankUps.pullsSum /= totalPullsSum;
                pullsPerBanner.wepRankUps.rankUps /= totalPullsSum;
            }
        }
    }
}