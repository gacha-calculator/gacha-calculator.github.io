export const ODDS_CHARACTER_SSR = [0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.058, 0.108, 0.158, 0.208, 0.258, 0.308, 0.358, 0.408, 0.458, 0.508, 0.558, 0.608, 0.658, 0.708, 1];
export const ODDS_WEAPON_SSR = [0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 1];
export const ODDS_SR = [0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 1];

export const gachaConfig = {
    maxCharacterConstelation: 1,
    poolStandardCharSSR: 5,         // Standard 5* character pool size
    poolStandardLimitedCharSSR: 2,
    poolCharSR: 9,                 // Limited 4* character pool size
    configSR: {
        maxType: 1,
        regularPoints: 0.4,
        specialPoints: 0.4
    },
    configSSR: {
        maxType: 1,
        regularPoints: 2
    },
    paths: {
        char: ['None', 'p0', 'p1', 'p2', 'p3', 'p4', 'p5'],
        wep: ['None', 'p1', 'p2', 'p3', 'p4', 'p5']
    },
    pity: {
        pitySSRChar: ODDS_CHARACTER_SSR.length,
        pitySSRWep: ODDS_WEAPON_SSR.length,
        pitySRChar: ODDS_SR.length
    },
    default: 0
};

export const CONSTELLATION_MAP = {
    'none': 0,
    'p0': 1,
    'p1': 2,
    'p2': 3,
    'p3': 4,
    'p4': 5,
    'p5': 6
};