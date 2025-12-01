export const BANNER_TYPES = {
    CHARACTER: 'character',
    WEAPON: 'weapon'
};

export const SELECTORS = {
    PITY_ROW: '[data-banner]',
    PITY_TABLE: '#pity-table'
};

export const INITIAL_CONFIG = {
    pitySettings: {
        [BANNER_TYPES.CHARACTER]: { pity5: 0 },
        [BANNER_TYPES.WEAPON]: { pity5: 0 }
    },
    isCharacter: true,
    isWeapon: true,
    isSpecial: false
};

export const DEFAULTS = {
    probability: 70,
    pulls: 57
}