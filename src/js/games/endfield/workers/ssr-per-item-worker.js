import { findBounds, checkIsTarget, consolidateSSRDistributionForCashback, updateProbDistr } from "../endfield-helpers";
import { makeDistributionArraysSSRPerItem } from '../endfield-make-distribution-arrays.js';
import { rankUpSSRPerItem } from "../endfield-pull-logic";

let inputConfig;
let STATES_LIMITS;
let ODDS_CHARACTER_SSR;
let ODDS_WEAPON_SSR;
let ODDS_SR;
let target;
let isCashback;

let isTarget = false;
let isEmpty = false;
let chartData = [];
let boundsIndices = { maxItem: 0, minItem: 0 };

self.onmessage = function (e) {
    switch (e.data?.type) {
        case 'Launch':
            ({
                inputConfig,
                STATES_LIMITS,
                ODDS_CHARACTER_SSR,
                ODDS_WEAPON_SSR,
                ODDS_SR,
                target,
                isCashback
            } = e.data);
            const RATE_UP_ODDS = 0.5;
            let { distributionSSR, distributionSSRData, sparkDistr } = makeDistributionArraysSSRPerItem(inputConfig, STATES_LIMITS);

            const probDistr = new Float64Array(distributionSSR.length - 1);
            const probDistrRankUps = new Float64Array(distributionSSR.length - 1);
            const probDistrRankUpsDouble = new Float64Array(distributionSSR.length - 1);
            const probDistrRankUpsSpark = new Float64Array(distributionSSR.length - 1);
            const rowCount = distributionSSRData[distributionSSRData.length - 1].bannerCount;
            const perBannerData = Array.from({ length: rowCount }, () => new Array(22).fill(0));
            probDistr[0] = 1;
            isTarget = !isCashback;

            while (!isEmpty && !isTarget) {
                rankUpSSRPerItem(distributionSSR, distributionSSRData, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, RATE_UP_ODDS, boundsIndices, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, perBannerData);
                updateProbDistr(probDistr, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, sparkDistr); // this doesn't know about pruned, since prunes hit upward tails it's kind of a correction as well, so might leave at that
                isEmpty = findBounds(distributionSSR, distributionSSRData, boundsIndices, probDistr);
                isTarget = checkIsTarget(probDistr, target, chartData.length); // can simplify probDistr for non-cheap(only count target sum), but shouldn't matter too much so later
            }

            const cashbackDataSSRPerItem = consolidateSSRDistributionForCashback(distributionSSR, distributionSSRData, boundsIndices);
            self.postMessage({ type: 'Finished', cashbackDataSSRPerItem: cashbackDataSSRPerItem, sparkDistr: sparkDistr, perBannerData: perBannerData });
            break;
        default:
            console.warn('Unknown type:', e.data?.type);
    }
};
self.onerror = function (error) {
    console.error('Worker error:', error);
};