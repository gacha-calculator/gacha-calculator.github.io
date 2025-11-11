import { consolidateDistributionForCashback, consolidateProbabilitiesCheap, consolidateProbabilities, simplifyDistribution, normalizeCheap, checkIsEmpty } from '../common/common-helpers.js';
import { makeDistributionArraysSSR, makeDistributionArraysSR, sortPitySSR } from '../common/make-distribution-arrays.js';
import { ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, ODDS_SR, gachaConfig } from './config.js';
import { WorkerManager } from '../../calculator/common/workers/worker-manager.js';
import { rankUpSSRCheap } from '../common/common-pull-logic.js';

const moduleType = 'common';

const SSR_CHAR_PITY = gachaConfig.pity.pitySSRChar;
const SSR_WEP_PITY = gachaConfig.pity.pitySSRWep;
const SR_PITY = gachaConfig.pity.pitySRChar;

const STATES_LIMITS = {
    CHARACTER: SSR_CHAR_PITY * 2 + 1,
    WEAPON: SSR_WEP_PITY * 2 + 1,
    SR: SR_PITY * 2 + 1
};

export const GFL2_ADAPTERS = {
    distributionArrays: {
        makeSSR: (inputConfig, pity) => {
            return makeDistributionArraysSSR(inputConfig, pity, STATES_LIMITS);
        },
        makeSR: (inputConfig) => {
            return makeDistributionArraysSR(inputConfig, STATES_LIMITS);
        },
        sortPity: (inputConfig) => {
            return sortPitySSR(inputConfig, gachaConfig.pity);
        }
    },
    pullLogic: {
        rankUpSSRCheap: (distributionSSR, pities) => {
            return rankUpSSRCheap(
                distributionSSR,
                ODDS_CHARACTER_SSR,
                ODDS_WEAPON_SSR,
                SSR_CHAR_PITY,
                SSR_WEP_PITY,
                pities
            );
        }
    },
    workerManager: new WorkerManager(),
    contexts: {
        contextSSR: { ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, SSR_CHAR_PITY, SSR_WEP_PITY },
        contextSR: { ODDS_SR, SR_PITY },
        moduleType: moduleType
    },
    helpers: {
        consolidateDistributionForCashback: consolidateDistributionForCashback,
        consolidateProbabilitiesCheap: consolidateProbabilitiesCheap,
        consolidateProbabilities: consolidateProbabilities,
        simplifyDistribution: simplifyDistribution,
        normalizeCheap: normalizeCheap,
        checkIsEmpty: checkIsEmpty
    }
};