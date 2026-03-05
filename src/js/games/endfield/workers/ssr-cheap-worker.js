import { findBoundsCheap, updateProbDistrCheap, checkIsTarget, consolidateSRDistributionForCashback, normalizePullsCoef } from "../endfield-helpers";
import { makeDistributionArraysSSRCheap, makeDistributionArraysSR } from '../endfield-make-distribution-arrays.js';
import { rankUpSSRCheap, rankUpSR } from "../endfield-pull-logic";

let inputConfig;
let STATES_LIMITS;
let ODDS_CHARACTER_SSR;
let ODDS_WEAPON_SSR;
let ODDS_SR;
let target;

let isTarget = false;
let isEmpty = false;
let chartData = [];
let boundsIndices = { maxItem: 0, minItem: 0 };
let pullsCoef = { rankUpFail: 0, pullsSum: 1, rankUps: 0 };

self.onmessage = function (e) {
    switch (e.data?.type) {
        case 'Launch':
            ({
                inputConfig,
                STATES_LIMITS,
                ODDS_CHARACTER_SSR,
                ODDS_WEAPON_SSR,
                ODDS_SR,
                target
            } = e.data);
            const RATE_UP_ODDS = 0.5;
            let { distributionSSR, distributionSSRData, sparkDistr } = makeDistributionArraysSSRCheap(inputConfig, STATES_LIMITS);
            let distributionSR = makeDistributionArraysSR(inputConfig, STATES_LIMITS);

            const probDistr = new Float64Array(distributionSSR.length - 1);
            const probDistrRankUps = new Float64Array(distributionSSR.length - 1);
            const probDistrRankUpsDouble = new Float64Array(distributionSSR.length - 1);
            const probDistrRankUpsSpark = new Float64Array(distributionSSR.length - 1);
            probDistr[0] = 1;

            const buffer = new Float64Array(240);
            const smallBuffer = new Float64Array(120);
            
            const bannerCounts = [];
            for (const element of distributionSSRData) {
                if (element !== null) {
                    bannerCounts.push(element.bannerCount);
                }
            }
            while (!isEmpty) {
                rankUpSSRCheap(distributionSSR, distributionSSRData, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, RATE_UP_ODDS, boundsIndices, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, buffer, smallBuffer);
                updateProbDistrCheap(probDistr, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, pullsCoef);
                normalizePullsCoef(pullsCoef);
                isEmpty = findBoundsCheap(distributionSSR, distributionSSRData, boundsIndices, probDistr);
                if (!isTarget) {
                    rankUpSR(distributionSR, pullsCoef, ODDS_SR);
                    isTarget = checkIsTarget(probDistr, target, chartData.length);
                }
                chartData.push([...probDistr]);
            }

            const cashbackDataSR = consolidateSRDistributionForCashback(distributionSR);
            self.postMessage({ type: 'Finished', cashbackDataSR: cashbackDataSR, chartData: chartData, bannerCounts: bannerCounts });
            break;
        default:
            console.warn('Unknown type:', e.data?.type);
    }
};
self.onerror = function (error) {
    console.error('Worker error:', error);
};