export const ODDS_SSR = [0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.04, 0.065, 0.09, 0.115, 0.14, 0.165, 0.19, 0.215, 0.24, 1];
export const ODDS_SR = 0.085;

export const gachaConfig = {
    maxCharacterConstelation: 5,
    rateUpCharacterSR: 2,
    poolStandardCharSSR: 40,
    poolCharSR: 23,
    configSR: {
        maxType: 6,
        regularPoints: 0.3,
        specialPoints: 0.7
    },
    configSSR: {
        maxType: 6,
        regularPoints: 1.2,
        specialPoints: 2.8
    },
    paths: {
        char: ['None', 'p0', 'p1', 'p2', 'p3', 'p4', 'p5']
    },
    pity: {
        pitySSR: ODDS_SSR.length,
        pitySR: 10
    },
    default: 0
};

export const CONSTELLATION_OPTIONS = [
    { value: 'unknown', text: 'Unknown' },
    { value: 'none',    text: 'Not Owned' },
    { value: 'p0',      text: 'P0' },
    { value: 'p1',      text: 'P1' },
    { value: 'p2',      text: 'P2' },
    { value: 'p3',      text: 'P3' },
    { value: 'p4',      text: 'P4' },
    { value: 'p5',      text: 'P5' },
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
};