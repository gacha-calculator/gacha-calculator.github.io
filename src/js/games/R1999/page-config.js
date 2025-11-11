export const BANNER_TYPES = {
    CHARACTER: 'character'
};

export const SELECTORS = {
    PITY_ROW: '[data-banner]',
    CONSTELLATION_ROW: '[data-rarity]',
    PITY_TABLE: '#pity-table',
    CONSTELLATION_TABLE: '#constellation-table'
};

export const INITIAL_CONFIG = {
    pitySettings: {
        [BANNER_TYPES.CHARACTER]: { pity4: 0, pity5: 0 }
    },
    isCharacter: true,
    isWeapon: false,
    isSpecial: false,
    constellationColumns: 7
};

export const DEFAULTS = {
    probability: 70,
    pulls: 76
}