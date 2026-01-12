import { consolidateDistributionForCashback, consolidateProbabilitiesCheap, consolidateProbabilities, simplifyDistribution, normalizeCheap, checkIsEmpty } from './endfield-helpers.js';
import { makeDistributionArraysSSR, makeDistributionArraysSR, sortPitySSR } from './endfield-make-distribution-arrays.js';
import { ODDS_CHARACTER_SSR, ODDS_WEAPON_SSR, ODDS_SR, gachaConfig } from './config.js';
import { WorkerManager } from '../../calculator/common/workers/worker-manager.js';
import { rankUpSSRCheap } from './endfield-pull-logic.js';

const moduleType = {pullLogic: 'endfield', helpers: 'endfield'};

const SSR_CHAR_PITY = gachaConfig.pity.pitySSRChar;
const SSR_WEP_PITY = gachaConfig.pity.pitySSRWep;
const SR_PITY = gachaConfig.pity.pitySRChar;

const STATES_LIMITS = {
    CHARACTER: gachaConfig.pity.pitySSRChar,
    WEAPON: gachaConfig.pity.pitySSRWep,
    SR: gachaConfig.pity.pitySRChar
};

export const ENDFIELD_ADAPTERS = {
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