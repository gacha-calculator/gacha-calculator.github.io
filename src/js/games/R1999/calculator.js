//Copyright (C) 2025 bubartem
//
//This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
//
//This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.

import { checkIsTarget, checkIsEmpty, pruneAndNormalize, consolidateProbabilities, consolidateDistributionForCashback, consolidateProbabilitiesCheap, simplifyDistribution, normalizeCheap } from '../common/common-helpers.js';
import { rankUpSR, rankUpSSR, rankUpSSRCheap } from './R1999-pull-logic.js';
import { makeDistributionArraysSSR, sortPity, makeDistributionArraysSR } from './R1999-distribution-arrays.js'
import { ODDS_SSR, ODDS_SR, gachaConfig } from './config.js';
import { consolidateSRBanners, normalizePullsPerBanner } from './R1999-helpers.js'

export function runR1999GachaCalc(inputConfig, target) {
    let allPullsDistributionSSR = [];
    let pullsPerBanner = {};
    let isTarget = false;
    let isEmpty = false;
    let SSRStateLimit = gachaConfig.pity.pitySSR * 2;

    const pity = sortPity(inputConfig, gachaConfig.pity);
    let distributionSSR = makeDistributionArraysSSR(inputConfig, pity.SSR, SSRStateLimit);
    let distributionSR = makeDistributionArraysSR(inputConfig);

    let iterationCount = 0;
    const PRUNE_EVERY_N = 10;
    while (!isEmpty && !isTarget) {
        pullsPerBanner = rankUpSSR(distributionSSR, ODDS_SSR, gachaConfig.pity.pitySSR);
        normalizePullsPerBanner(pullsPerBanner)
        rankUpSR(distributionSR, ODDS_SR, pullsPerBanner);
        iterationCount++;
        if (iterationCount === PRUNE_EVERY_N) {
            pruneAndNormalize(distributionSSR);
            for (let banner of distributionSR) {
                pruneAndNormalize(banner);
            }
            iterationCount = 0;
        }
        allPullsDistributionSSR.push(consolidateProbabilities(distributionSSR));
        isTarget = checkIsTarget(distributionSSR, target, allPullsDistributionSSR.length);
        if (!isTarget) {
            isEmpty = checkIsEmpty(distributionSSR, isTarget);
        }
    }

    if (!iterationCount === PRUNE_EVERY_N) {
        pruneAndNormalize(distributionSSR);
        for (let banner of distributionSR) {
            pruneAndNormalize(banner);
        }
    }
    distributionSR = consolidateSRBanners(distributionSR);
    const cashbackData = {
        SSR: consolidateDistributionForCashback(distributionSSR),
        SR: consolidateDistributionForCashback(distributionSR),
    }

    simplifyDistribution(distributionSSR);
    distributionSR = null;

    while (!isEmpty) {
        if (isTarget) {
            iterationCount++;
            rankUpSSRCheap(distributionSSR, ODDS_SSR, gachaConfig.pity.pitySSR);
            if (iterationCount === PRUNE_EVERY_N) {
                normalizeCheap(distributionSSR);
            }
            allPullsDistributionSSR.push(consolidateProbabilitiesCheap(distributionSSR));
            isEmpty = checkIsEmpty(distributionSSR, isTarget);
        }
    }
    const chartData = allPullsDistributionSSR;

    return {
        chartData,
        cashbackData
    };
}