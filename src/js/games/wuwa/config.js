export const ODDS_CHARACTER_SSR = [0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.068, 0.128, 0.188, 0.248, 0.308, 0.368, 0.428, 0.488, 0.548, 0.608, 0.668, 0.728, 0.788, 0.848, 1.000];
export const ODDS_WEAPON_SSR = [0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.068, 0.128, 0.188, 0.248, 0.308, 0.368, 0.428, 0.488, 0.548, 0.608, 0.668, 0.728, 0.788, 0.848, 1.000];
export const ODDS_SR = [0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 1];

export const gachaConfig = {
    maxCharacterConstelation: 6,
    rateUpCharacterSR: 3,           // 4* characters on banner are not included in the general pool
    rateUpWeaponSR: 3,              // 4* weapon on banner
    poolStandardCharSSR: 5,         // Standard 5* character pool size
    poolCharSR: 11,                 // Limited 4* character pool size
    configSR: {
        maxType: 7,
        regularPoints: 0.375,
        specialPoints: 1
    },
    configSSR: {
        maxType: 7,
        regularStandardPoints: 5.625,
        regularPoints: 1.875,
        specialStandardPoints: 8.75,
        specialPoints: 5
    },
    configWep: {
        pointsSR: 0.375,
        pointsSSR: 1.875
    },
    paths: {
        char: ['None', 's0', 's1', 's2', 's3', 's4', 's5', 's6'],
        wep: ['None', 'r1', 'r2', 'r3', 'r4', 'r5']
    },
    pity: {
        pitySSRChar: ODDS_CHARACTER_SSR.length,
        pitySSRWep: ODDS_WEAPON_SSR.length,
        pitySRChar: ODDS_SR.length,
        pitySRWep: ODDS_SR.length
    },
    default: 0
};

export const CONSTELLATION_OPTIONS = [
    { value: 'unknown', text: 'Unknown' },
    { value: 'none', text: 'Not Owned' },
    { value: 's0', text: 'S0' },
    { value: 's1', text: 'S1' },
    { value: 's2', text: 'S2' },
    { value: 's3', text: 'S3' },
    { value: 's4', text: 'S4' },
    { value: 's5', text: 'S5' },
    { value: 's6', text: 'S6' },
    { value: 'new', text: 'New Character' }
];

export const CONSTELLATION_MAP = {
    'none': 0,
    's0': 1,
    's1': 2,
    's2': 3,
    's3': 4,
    's4': 5,
    's5': 6,
    's6': 7
};
