import { consolidateDistributionForCashback, consolidateProbabilitiesCheap, consolidateProbabilities, simplifyDistribution, normalizeCheap, checkIsEmpty, clearMaps, normalize, checkIsTarget } from './endfield-helpers.js';
import { makeDistributionArraysSSR, makeDistributionArraysSR } from './endfield-make-distribution-arrays.js';
import { ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, ODDS_SR, gachaConfig } from './config.js';
import init, { HandleSsrPulls } from '../../../rust/calculators/pkg/calculators.js';

const STATES_LIMITS = {
    CHARACTER: gachaConfig.pity.pitySSRChar,
    WEAPON: gachaConfig.pity.pitySSRWep,
    SR: gachaConfig.pity.pitySRChar
};
const NORMALIZATION_THRESHOLD = 1e-5;

export async function runEndfieldGachaCalc(inputConfig, target) {
    const RATE_UP_ODDS = 0.5;
    let isTarget = false;
    let isEmpty = false;
    let { distributionSSR, distributionSSRData } = makeDistributionArraysSSR(inputConfig, STATES_LIMITS);
    let normalizeSum = [0];
    let currentPull = 1;
    let iteration = 0;

    await init();

    const EndfieldPulls = new HandleSsrPulls(inputConfig.SSR.pullPlan, inputConfig.SSR.pity, STATES_LIMITS, ODDS_CHARACTER_SSR);
    console.profile();
    const result = EndfieldPulls.run_pulls();
    console.profileEnd();
    //const { chartData, distributionSSRFinal } = result;
    debugger;

    while (!isEmpty && !isTarget) {
        const currentLossData = rankUpSSR(distributionSSR, distributionSSRData, ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, RATE_UP_ODDS, normalizeSum, boundsIndices);
        if (iteration === 20) {
            chartData.push(consolidateProbabilities(distributionSSR, distributionSSRData, boundsIndices));
            iteration = 0;
        }

        if (currentPull === 800) {
            debugger;
        }

        iteration++;
        currentPull++;
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