import { ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, ODDS_SR, gachaConfig } from './config.js';
import { WorkerManager } from './workers/worker-manager.js';

const STATES_LIMITS = {
    CHARACTER: gachaConfig.pity.pitySSRChar,
    WEAPON: gachaConfig.pity.pitySSRWep,
    SR: gachaConfig.pity.pitySRChar
};

export async function runEndfieldGachaCalc(inputConfig, target, isCashback, signal) {
    const workerManager = new WorkerManager();
    const { ssrAggregateWorker, ssrPerItemWorker, ssrCheapWorker } = workerManager.getWorkers();
    const workers = [ssrAggregateWorker, ssrPerItemWorker, ssrCheapWorker];

    let abortHandler;
    const abortPromise = new Promise((_, reject) => {
        if (signal?.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
        }
        abortHandler = () => {
            reject(new DOMException('Aborted', 'AbortError'));
        };
        signal?.addEventListener('abort', abortHandler);
    });

    const launchData = {
        type: 'Launch',
        inputConfig,
        STATES_LIMITS,
        ODDS_CHARACTER_SSR,
        ODDS_WEAPON_SSR,
        ODDS_SR,
        target,
        isCashback
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

    try {
        const results = await Promise.race([
            Promise.all([getAggregateWorkerResult, getPerItemWorkerResult, getCheapWorkerResult]),
            abortPromise
        ]);

        const [
            { cashbackDataSSRAggregate },
            { cashbackDataSSRPerItem, sparkDistr, perBannerData },
            { chartData, cashbackDataSR: CharSR, bannerCounts, probDistr, pulls }
        ] = results;

        const SSR = { cashbackDataSSRAggregate, cashbackDataSSRPerItem, sparkDistr, perBannerData, bannerCounts, isCashback, probDistr, pulls };
        const cashbackData = { SSR, CharSR };

        return { chartData, cashbackData };
    } catch (error) {
        if (error.name === 'AbortError') {
            workers.forEach(w => w.terminate());
        }
        throw error;
    } finally {
        signal?.removeEventListener('abort', abortHandler);
        workers.forEach(w => w.terminate());
    }
}