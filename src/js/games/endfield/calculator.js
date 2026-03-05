import { ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, ODDS_SR, gachaConfig } from './config.js';
import { WorkerManager } from './workers/worker-manager.js';

const STATES_LIMITS = {
    CHARACTER: gachaConfig.pity.pitySSRChar,
    WEAPON: gachaConfig.pity.pitySSRWep,
    SR: gachaConfig.pity.pitySRChar
};

export async function runEndfieldGachaCalc(inputConfig, target) {
    const workerManager = new WorkerManager();
    const { ssrAggregateWorker, ssrPerItemWorker, ssrCheapWorker } = workerManager.getWorkers();

    const launchData = {
        type: 'Launch',
        inputConfig,
        STATES_LIMITS,
        ODDS_CHARACTER_SSR,
        ODDS_WEAPON_SSR,
        ODDS_SR,
        target
    };

    const getAggregateWorkerResult = new Promise((resolve) => {
        ssrAggregateWorker.onmessage = function (e) {
            if (e.data.type === 'Finished') {
                resolve(e.data);
            }
        };
        ssrAggregateWorker.postMessage(launchData);
    });

    const getPerItemWorkerResult = new Promise((resolve) => {
        ssrPerItemWorker.onmessage = function (e) {
            if (e.data.type === 'Finished') {
                resolve(e.data);
            }
        };
        ssrPerItemWorker.postMessage(launchData);
    });

    const getCheapWorkerResult = new Promise((resolve) => {
        ssrCheapWorker.onmessage = function (e) {
            if (e.data.type === 'Finished') {
                resolve(e.data);
            }
        };
        ssrCheapWorker.postMessage(launchData);
    });

    const [
        { cashbackDataSSRAggregate },
        { cashbackDataSSRPerItem, sparkDistr, perBannerData },
        { chartData, cashbackDataSR: CharSR, bannerCounts }
    ] = await Promise.all([getAggregateWorkerResult, getPerItemWorkerResult, getCheapWorkerResult]);

    const SSR = { cashbackDataSSRAggregate, cashbackDataSSRPerItem, sparkDistr, perBannerData, bannerCounts };
    const cashbackData = {
        SSR,
        CharSR
    };

    return {
        chartData,
        cashbackData
    };
}