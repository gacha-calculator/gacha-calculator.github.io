import { consolidateDistributionForCashback, consolidateProbabilitiesCheap, consolidateProbabilities, simplifyDistribution, normalizeCheap, checkIsEmpty } from './genshin-helpers.js';
import { makeDistributionArraysSSR, makeDistributionArraysSR, sortPitySSR } from './genshin-distribution-arrays.js';
import { ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, ODDS_SR, gachaConfig } from './config.js';
import { WorkerManager } from '../../calculator/common/workers/worker-manager.js';
import { rankUpSSRCheap } from './genshin-pull-logic.js';

const moduleType = 'genshin';

const SSR_CHAR_PITY = gachaConfig.pity.pitySSRChar;
const SSR_WEP_PITY = gachaConfig.pity.pitySSRWep;
const SR_PITY = gachaConfig.pity.pitySRChar;

const STATES_LIMITS = {
    CHARACTER_SSR_5050: gachaConfig.pity.pitySSRChar * 2 + 1,
    CHARACTER_SSR_GUARANTEED: gachaConfig.pity.pitySSRChar + 1,
    WEAPON_SSR: gachaConfig.pity.pitySSRWep * 3 + 1,
    SR: gachaConfig.pity.pitySRChar * 2 + 1
};

export const GENSHIN_ADAPTERS = {
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