export const ODDS_CHARACTER_SSR = [0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.066, 0.126, 0.186, 0.246, 0.306, 0.366, 0.426, 0.486, 0.546, 0.606, 0.666, 0.726, 0.786, 0.846, 0.906, 0.966, 1];
export const ODDS_WEAPON_SSR = [0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.077, 0.147, 0.217, 0.287, 0.357, 0.427, 0.497, 0.567, 0.637, 0.707, 0.777, 0.847, 0.917, 0.987, 1];
export const ODDS_SR = [0.051, 0.051, 0.051, 0.051, 0.051, 0.051, 0.051, 0.051, 0.561, 1];

export const gachaConfig = {
    maxCharacterConstelation: 6,
    rateUpCharacterSR: 3,           // 4* characters on banner are not included in the general pool
    rateUpWeaponSR: 3,              // 4* weapon on banner
    poolStandardCharSSR: 7,         // Standard 5* character pool size
    poolCharSR: 23,                 // Limited 4* character pool size
    configSR: {
        maxType: 7,
        regularPoints: 0.4,
        specialPoints: 1
    },
    configSSR: {
        maxType: 7,
        regularPoints: 2,
        specialPoints: 5
    },
    configWep: {
        pointsSR: 0.4,
        pointsSSR: 2
    },
    paths: {
        char: ['None', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6'],
        wep: ['None', 's1', 's2', 's3', 's4', 's5']
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
    { value: 'e0', text: 'E0' },
    { value: 'e1', text: 'E1' },
    { value: 'e2', text: 'E2' },
    { value: 'e3', text: 'E3' },
    { value: 'e4', text: 'E4' },
    { value: 'e5', text: 'E5' },
    { value: 'e6', text: 'E6' },
    { value: 'new', text: 'New Character' }
];

export const CONSTELLATION_MAP = {
    'none': 0,
    'e0': 1,
    'e1': 2,
    'e2': 3,
    'e3': 4,
    'e4': 5,
    'e5': 6,
    'e6': 7
};

export const CHARS_5_STAR_STANDARD = new Set(['1003', '1004', '1101', '1104', '1107', '1209', '1211']);