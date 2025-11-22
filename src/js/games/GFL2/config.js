export const ODDS_CHARACTER_SSR = [0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.056, 0.106, 0.156, 0.206, 0.256, 0.306, 0.356, 0.406, 0.456, 0.506, 0.556, 0.606, 0.656, 0.706, 0.756, 0.806, 0.856, 0.906, 0.956, 1.000];
export const ODDS_WEAPON_SSR = [0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.057, 0.107, 0.157, 0.207, 0.257, 0.307, 0.357, 0.407, 0.457, 0.507, 0.557, 0.607, 0.657, 0.707, 0.757, 0.807, 0.857, 0.907, 0.957, 1.000];
export const ODDS_SR = [0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 1];

export const gachaConfig = {
    maxCharacterConstelation: 6,
    rateUpCharacterSR: 2,           // 4* characters on banner are not included in the general pool
    rateUpWeaponSR: 3,              // 4* weapon on banner
    poolStandardCharSSR: 6,         // Standard 5* character pool size
    poolCharSR: 9,                 // Limited 4* character pool size
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
        pointsSR: 1,
        pointsSSR: 2
    },
    paths: {
        char: ['None', 'v0', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6'],
        wep: ['None', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6']
    },
    pity: {
        pitySSRChar: ODDS_CHARACTER_SSR.length,
        pitySSRWep: ODDS_WEAPON_SSR.length,
        pitySRChar: ODDS_SR.length,
        pitySRWep: ODDS_SR.length
    },
    default: 0
};

export const RATE_UP_ODDS = {
    rateUpOddsChar: 0.5,
    rateUpOddsWep: 0.75
};

export const CONSTELLATION_OPTIONS = [
    { value: 'unknown', text: 'Unknown' },
    { value: 'none', text: 'Not Owned' },
    { value: 'v0', text: 'V0' },
    { value: 'v1', text: 'V1' },
    { value: 'v2', text: 'V2' },
    { value: 'v3', text: 'V3' },
    { value: 'v4', text: 'V4' },
    { value: 'v5', text: 'V5' },
    { value: 'v6', text: 'V6' },
    { value: 'new', text: 'New Character' }
];

export const CONSTELLATION_MAP = {
    'none': 0,
    'v0': 1,
    'v1': 2,
    'v2': 3,
    'v3': 4,
    'v4': 5,
    'v5': 6,
    'v6': 7
};