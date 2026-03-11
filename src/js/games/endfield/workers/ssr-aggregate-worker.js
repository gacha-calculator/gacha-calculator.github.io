import { findBounds, updateProbDistr, checkIsTarget, consolidateSSRDistributionForCashback } from "../endfield-helpers";
import { makeDistributionArraysSSR } from '../endfield-make-distribution-arrays.js';
import { rankUpSSR } from "../endfield-pull-logic";

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
            let { distributionSSR, distributionSSRData, sparkDistr } = makeDistributionArraysSSR(inputConfig, STATES_LIMITS);
            const probDistr = new Float64Array(distributionSSR.length - 1);
            const probDistrRankUps = new Float64Array(distributionSSR.length - 1);
            const probDistrRankUpsDouble = new Float64Array(distributionSSR.length - 1);
            const probDistrRankUpsSpark = new Float64Array(distributionSSR.length - 1);
            probDistr[0] = 1;
            isTarget = !isCashback;
            
            while (!isEmpty && !isTarget) {
                rankUpSSR(distributionSSR, distributionSSRData, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, RATE_UP_ODDS, boundsIndices, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark);
                updateProbDistr(probDistr, probDistrRankUps, probDistrRankUpsDouble, probDistrRankUpsSpark, sparkDistr); // this doesn't know about pruned, since prunes hit upward tails it's kind of a correction as well, so might leave at that
                isEmpty = findBounds(distributionSSR, distributionSSRData, boundsIndices, probDistr);
                isTarget = checkIsTarget(probDistr, target, chartData.length); // can simplify probDistr for non-cheap(only count target sum), but shouldn't matter too much so later
            }

            const cashbackDataSSRAggregate = consolidateSSRDistributionForCashback(distributionSSR, distributionSSRData, boundsIndices);
            self.postMessage({ type: 'Finished', cashbackDataSSRAggregate: cashbackDataSSRAggregate });
            break;
        default:
            console.warn('Unknown type:', e.data?.type);
    }
};
self.onerror = function (error) {
    console.error('Worker error:', error);
};