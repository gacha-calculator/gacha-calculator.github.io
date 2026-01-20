// ver Luna IV

export const ODDS_CHARACTER_SSR = [0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.006, 0.066, 0.126, 0.186, 0.246, 0.306, 0.366, 0.426, 0.486, 0.546, 0.606, 0.666, 0.726, 0.786, 0.846, 0.906, 0.966, 1];
export const ODDS_WEAPON_SSR = [0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.077, 0.147, 0.217, 0.287, 0.357, 0.427, 0.497, 0.567, 0.637, 0.707, 0.777, 0.847, 0.917, 0.987, 1];
export const ODDS_SR = [0.051, 0.051, 0.051, 0.051, 0.051, 0.051, 0.051, 0.051, 0.561, 1];

export const gachaConfig = {
    maxCharacterConstelation: 6,
    rateUpCharacterSR: 3,           // 4* characters on banner are not included in the general pool
    rateUpWeaponSR: 5,              // 4* weapon on banner
    poolStandardCharSSR: 8,         // Standard 5* character pool size
    poolCharSR: 45,                 // Limited 4* character pool size
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
        char: ['None', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
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
    { value: 'c0', text: 'C0' },
    { value: 'c1', text: 'C1' },
    { value: 'c2', text: 'C2' },
    { value: 'c3', text: 'C3' },
    { value: 'c4', text: 'C4' },
    { value: 'c5', text: 'C5' },
    { value: 'c6', text: 'C6' },
    { value: 'new', text: 'New Character' }
];

export const CONSTELLATION_MAP = {
    'none': 0,
    'c0': 1,
    'c1': 2,
    'c2': 3,
    'c3': 4,
    'c4': 5,
    'c5': 6,
    'c6': 7
};

// --- Characters ---

// Standard 5-Star Characters (the ones you can lose a 50/50 to)
export const CHARS_5_STAR_STANDARD = new Set([
    'dehya', 'diluc', 'jean', 'keqing', 'mona', 'qiqi', 'tighnari', 'yumemizuki_mizuki'
]);

// Gacha 4-Star Characters (all non-starter 4-stars)
export const CHARS_4_STAR = new Set([
    'aino', 'barbara', 'beidou', 'bennett', 'candace', 'charlotte', 'chevreuse',
    'chongyun', 'collei', 'dahlia', 'diona', 'dori', 'faruzan', 'fischl',
    'freminet', 'gaming', 'gorou', 'iansan', 'ifa', 'kachina', 'kaveh', 'kirara',
    'kujou_sara', 'kuki_shinobu', 'lan_yan', 'layla', 'lynette', 'jahoda', 'mika', 'ningguang', 'noelle',
    'ororon', 'razor', 'rosaria', 'sayu', 'sethos', 'shikanoin_heizou', 'sucrose',
    'thoma', 'xiangling', 'xingqiu', 'xinyan', 'yanfei', 'yaoyao', 'yun_jin', 'illuga'
]);

// --- Weapons ---

export const WEAPONS_5_STAR_STANDARD = new Set([
    'amos_bow', 'aquila_favonia', 'lost_prayer_to_the_sacred_winds', 'primordial_jade_winged-spear',
    'skyward_atlas', 'skyward_blade', 'skyward_harp', 'skyward_pride', 'skyward_spine', 'wolfs_gravestone'
]);

// A comprehensive list of all gacha-obtainable 4-star weapons.
export const WEAPONS_4_STAR = new Set([
    'dragons_bane', 'eye_of_perception', 'favonius_codex', 'favonius_greatsword',
    'favonius_lance', 'favonius_sword', 'favonius_warbow', 'lions_roar',
    'rainslasher', 'rust', 'sacrificial_bow', 'sacrificial_fragments',
    'sacrificial_greatsword', 'sacrificial_sword', 'the_bell', 'the_flute',
    'the_stringless', 'the_widsith', 'akuoumaru', 'alley_hunter', 'flower-wreathed_feathers', 'fruitful_hook', 'lithic_blade',
    'lithic_spear', 'makhaira_aquamarine', 'mitternachts_waltz', 'mountain-bracing_bolt', 'mouuns_moon',
    'portable_power_saw', 'prospectors_drill', 'range_gauge', 'sturdy_bone', 'the_alley_flash', 'the_dockhands_assistant',
    'wandering_evenstar', 'wavebreakers_fin', 'waveriding_whirl', 'wine_and_song', 'xiphos_moonlight'
]);

export const WEAPONS_3_STAR = new Set([
    'black_tassel', 'bloodtainted_greatsword', 'cool_steel', 'debate_club',
    'emerald_orb', 'ferrous_shadow', 'harbinger_of_dawn',
    'magic_guide', 'raven_bow', 'sharpshooters_oath', 'skyrider_sword',
    'slingshot', 'thrilling_tales_of_dragon_slayers', 'white_tassel'
]);