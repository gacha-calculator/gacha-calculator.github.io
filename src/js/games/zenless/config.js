export const ODDS_CHARACTER_SSR = [0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.066, 0.126, 0.186, 0.246, 0.306, 0.366, 0.426, 0.486, 0.546, 0.606, 0.666, 0.726, 0.786, 0.846, 0.906, 0.966, 1];
export const ODDS_WEAPON_SSR = [0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.077, 0.147, 0.217, 0.287, 0.357, 0.427, 0.497, 0.567, 0.637, 0.707, 0.777, 0.847, 0.917, 0.987, 1];
export const ODDS_SR = [0.051, 0.051, 0.051, 0.051, 0.051, 0.051, 0.051, 0.051, 0.561, 1];

export const gachaConfig = {
    maxCharacterConstelation: 6,
    rateUpCharacterSR: 2,           // 4* characters on banner are not included in the general pool
    rateUpWeaponSR: 2,              // 4* weapon on banner
    poolStandardCharSSR: 6,         // Standard 5* character pool size
    poolCharSR: 13,                 // Limited 4* character pool size
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
        char: ['None', 'm0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'],
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
    { value: 'none',    text: 'Not Owned' },
    { value: 'm0',      text: 'M0' },
    { value: 'm1',      text: 'M1' },
    { value: 'm2',      text: 'M2' },
    { value: 'm3',      text: 'M3' },
    { value: 'm4',      text: 'M4' },
    { value: 'm5',      text: 'M5' },
    { value: 'm6',      text: 'M6' },
    { value: 'new', text: 'New Character' }
];

export const CONSTELLATION_MAP = {
    'none': 0,
    'm0': 1,
    'm1': 2,
    'm2': 3,
    'm3': 4,
    'm4': 5,
    'm5': 6,
    'm6': 7
};

export const CHARS_5_STAR_STANDARD = new Set([1021, 1041, 1101, 1141, 1181, 1211]);