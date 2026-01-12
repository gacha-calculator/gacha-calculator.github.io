// Has to seperate weapon and character

export const BANNER_TYPES = {
    CHARACTER: 'character',
    WEAPON: 'weapon'
};

export const SELECTORS = {
    PITY_ROW: '[data-banner]',
    CONSTELLATION_ROW: '[data-rarity]',
    PITY_TABLE: '#pity-table',
    CONSTELLATION_TABLE: '#constellation-table'
};

export const INITIAL_CONFIG = {
    pitySettings: {
        [BANNER_TYPES.CHARACTER]: { pity4: 0, pity5: 0 },
        [BANNER_TYPES.WEAPON]: { pity4: 0, pity5: 0 }
    },
    isCharacter: true,
    isWeapon: false,
    isSpecial: false,
    constellationColumns: 1 // Just owned
};

export const DEFAULTS = {
    probability: 70,
    pulls: 120
}