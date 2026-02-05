import { consolidateDistributionForCashback, consolidateProbabilitiesCheap, consolidateProbabilities, simplifyDistribution, normalizeCheap, checkIsEmpty, clearMaps, normalize, checkIsTarget } from './endfield-helpers.js';
import { makeDistributionArraysSSR, makeDistributionArraysSR } from './endfield-make-distribution-arrays.js';
import { ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, ODDS_SR, gachaConfig } from './config.js';
import { rankUpSSR, rankUpSR, rankUpSSRCheap } from './endfield-pull-logic.js';

const STATES_LIMITS = {
    CHARACTER: gachaConfig.pity.pitySSRChar,
    WEAPON: gachaConfig.pity.pitySSRWep,
    SR: gachaConfig.pity.pitySRChar
};
const NORMALIZATION_THRESHOLD = 1e-5;

const boundsIndices = {
    maxItem: 0,
    minItem: 0
}

export function runEndfieldGachaCalc(inputConfig, target) {
    const RATE_UP_ODDS = 0.5;
    let chartData = [];
    let isTarget = false;
    let isEmpty = false;
    console.profile();
    let { distributionSSR } = makeDistributionArraysSSR(inputConfig, STATES_LIMITS);
    let { distributionCharSR } = makeDistributionArraysSR(inputConfig, STATES_LIMITS);
    let normalizeSum = [0];
    let currentPull = 1;
    let iteration = 0;

    while (!isEmpty && !isTarget) {
        const currentLossData = rankUpSSR(distributionSSR, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, RATE_UP_ODDS, normalizeSum, boundsIndices);
        //if (normalizeSum[0] >= NORMALIZATION_THRESHOLD) {
        //    normalize(distributionSSR, normalizeSum);
        //}
        //isTarget = checkIsTarget(distributionSSR, target, currentPull);
        if (iteration === 20) {
            chartData.push(consolidateProbabilities(distributionSSR, boundsIndices));
            iteration = 0;
        }

        if (currentPull === 800) {
            console.profileEnd();
            debugger;
        }

        iteration++;
        currentPull++;

        //normalizePullsPerBanner(currentLossData);

        //let charRankUps = currentLossData.charRankUps; // can just do char

        //if (charRankUps.pullsSum > 0) {
        //    rankUpSR(distributionCharSR, charRankUps, ODDS_SR);
        //    normalize(distributionCharSR);
        //}
    }

    const cashbackData = {
        SSR: consolidateDistributionForCashback(distributionSSR),
        CharSR: consolidateDistributionForCashback(distributionCharSR)
    }

    simplifyDistribution(distributionSSR);
    distributionCharSR = null;

    while (!isEmpty) {
        if (isTarget) {
            rankUpSSRCheap(distributionSSR, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, RATE_UP_ODDS);
            normalizeCheap(distributionSSR, ODDS_SR);
            chartData.push(consolidateProbabilitiesCheap(distributionSSR));
            isEmpty = checkIsEmpty(distributionSSR, isTarget);
        }
    }
    distributionSSR = null;
    return {
        chartData,
        cashbackData
    };

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