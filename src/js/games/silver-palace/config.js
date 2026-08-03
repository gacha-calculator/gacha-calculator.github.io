export const ODDS_CHARACTER_SSR = new Float64Array ([0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.058, 0.108, 0.158, 0.208, 0.258, 0.308, 0.358, 0.408, 0.458, 0.508, 0.558, 0.608, 0.658, 0.708, 1]);
export const ODDS_WEAPON_SSR = [0.04];
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
        char: ['None', 'p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
        wep: ['None', 'r0', 'r1', 'r2', 'r3', 'r4', 'r5']
    },
    pity: {
        pitySSRChar: ODDS_CHARACTER_SSR.length,
        pitySSRWep: 80,
        pitySRChar: ODDS_SR.length
    },
    default: 0
};

export const CONSTELLATION_OPTIONS = [
    { value: 'unknown', text: 'Unknown' },
    { value: 'none', text: 'Not Owned' },
    { value: 'p0', text: 'P0' },
    { value: 'p1', text: 'P1' },
    { value: 'p2', text: 'P2' },
    { value: 'p3', text: 'P3' },
    { value: 'p4', text: 'P4' },
    { value: 'p5', text: 'P5' },
    { value: 'p6', text: 'P6' },
    { value: 'new', text: 'New Character' }
];

export const CONSTELLATION_MAP = {
    'none': 0,
    'p0': 1,
    'p1': 2,
    'p2': 3,
    'p3': 4,
    'p4': 5,
    'p5': 6,
    'p6': 7
};