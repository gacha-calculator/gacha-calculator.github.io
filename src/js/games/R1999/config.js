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

export const UPDATE_HISTORY = ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2.0', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6',
    '2.7', 'AC', '2.8', '3.0'
]

export const BANNER_HISTORY = {
    'One Gram of Curiosity': {char: 'Sotheby', release: '1.0'},
    'Clang of Sword & Armor': {char: 'A Knight', release: '1.0'},
    'Pop is Everything': {char: 'Melania', release: '1.1'},
    'Thus Spoke The Border Collie': {char: 'Pickles', release: '1.1'},
    'The Fairies Shining at Night': {char: 'Tooth Fairy', release: '1.2'},
    'The Changeling Awaits': {char: 'Jessica', release: '1.2'},
    'That Steady Evening Star': {char: 'Kaalaa Baunaa', release: '1.3'},
    'Another Spring Thaw': {char: 'Shamane', release: '1.3'},
    'Beyond the World of Matters': {char: '37', release: '1.4'},
    'Seeker in the Cave': {char: '6', release: '1.4'},
    'The Chirps of Flame': {char: 'Spathodea', release: '1.5'},
    'The Spores of Peace': {char: 'Ezra Theodore', release: '1.5'},
    'Over the New Leaf': {char: 'Getian', release: '1.6'},
    'Vissi D\'arte, Vissi D\'amore': {char: 'Isolde', release: '1.7'},
    'Reading in Sea Breeze': {char: 'Marcus', release: '1.7'},
    'Ode to the Utopia': {char: 'Vila', release: '1.8'},
    'The Intersecting Lines': {char: 'Windsong', release: '1.8'},
    'Into the Mirrors': {char: 'Kakania', release: '1.9'},
    'Calming Hues in Frenzied Nights': {char: 'Mercuria', release: '2.0'},
    'Clash n\' Slash': {char: 'J', release: '2.0'},
    'Blue Lullaby': {char: 'Tuesday', release: '2.1'},
    'Shooting in the Dark': {char: 'Argus', release: '2.1'},
    'Fledgling\'s First Flight': {char: 'Lopera', release: '2.2'},
    'When the Swan Dances': {char: 'Willow', release: '2.3'},
    'The Book of Whys': {char: 'Flutterpage', release: '2.3'},
    'Playing in Rainbow Clef': {char: 'Barcarola', release: '2.4'},
    'A Shell on the Waves': {char: 'Fatutu', release: '2.4'},
    'A Life in Montage': {char: 'Noire', release: '2.5'},
    'A Writing Writer Written': {char: 'Recoleta', release: '2.6'},
    'The Shattered Product': {char: 'Aleph', release: '2.6'},
    'Serpentine Century': {char: 'Hissabeth', release: '2.7'},
    'Wirewalking in Zero Gravity': {char: 'Kiperina', release: '2.7'},
    'From the Ruin of the Past': {char: 'Moldir', release: '2.8'},
    'A Beating Heart Beneath the Stone': {char: 'Sentinel', release: '3.0'},
    'The Mourner\'s Eulogy': {char: 'Charon', release: '3.0'},
    //'The Midnight Flutist': {char: 'Rubuska', release: '3.1'},
    //'The Land\'s Iron Stitch': {char: 'Corvus', release: '3.1'}
}