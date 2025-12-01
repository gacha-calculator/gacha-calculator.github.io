//Copyright (C) 2025 bubartem
//
//This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
//
//This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.

import { consolidateProbabilitiesCheap, simplifyDistribution, normalizeCheap } from '../common/common-helpers.js';
import { checkIsEmpty } from './morimens-helpers.js';
import { rankUpSSRCheap } from './morimens-pull-logic.js';
import { makeDistributionArraysSSR, sortPity } from './morimens-distribution-arrays.js'
import { ODDS_SSR, gachaConfig } from './config.js';

export function runMorimensGachaCalc(inputConfig) {
    let allPullsDistributionSSR = [];
    let isTarget = false;
    let isEmpty = false;
    let SSRStateLimit = {char: gachaConfig.pity.pitySSR * 3, wep: gachaConfig.pity.pitySSR * 2 };

    const pity = sortPity(inputConfig, gachaConfig.pity);
    let distributionSSR = makeDistributionArraysSSR(inputConfig, pity, SSRStateLimit);

    let iterationCount = 0;
    const PRUNE_EVERY_N = 10;

    simplifyDistribution(distributionSSR); // check what it does normally

    while (!isEmpty) {
        iterationCount++;
        rankUpSSRCheap(distributionSSR, ODDS_SSR, gachaConfig.pity.pitySSR);
        if (iterationCount === PRUNE_EVERY_N) {
            normalizeCheap(distributionSSR);
        }
        allPullsDistributionSSR.push(consolidateProbabilitiesCheap(distributionSSR));
        isEmpty = checkIsEmpty(distributionSSR, isTarget);
    }
    const chartData = allPullsDistributionSSR;

    return {
        chartData
    };
}