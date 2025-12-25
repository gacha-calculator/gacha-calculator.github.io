export const ODDS_CHARACTER_SSR = [0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.048, 0.088, 0.128, 0.168, 0.208, 0.288, 0.368, 0.448, 0.528, 0.608, 0.708, 0.828, 0.968, 1  ];
export const ODDS_WEAPON_SSR = [0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.008, 0.048, 0.088, 0.128, 0.168, 0.208, 0.288, 0.368, 0.448, 0.528, 0.608, 0.708, 0.828, 0.968, 1];
export const ODDS_SR = [0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 1];

export const gachaConfig = {
    maxCharacterConstelation: 6,
    rateUpCharacterSR: 3,           // 4* characters on banner are not included in the general pool
    rateUpWeaponSR: 3,              // 4* weapon on banner
    poolStandardCharSSR: 5,         // Standard 5* character pool size
    poolCharSR: 12,                 // Limited 4* character pool size
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

export const BANNER_HISTORY = [ // taking maint end time with -2 hours just to be safe (assuming it's 3:00 utc)
    { type: 'phase1', startDate: '2024-05-23T01:00:00+00:00', rateUpChars: new Set(['Chixia', 'Mortefi', 'Danjin']),    rateUpWeps: new Set(['Hollow Mirage', 'Variation', 'Dauntless Evernight'])         },
    { type: 'phase2', startDate: '2024-06-06'               , rateUpChars: new Set(['Aalto', 'Yuanwu', 'Taoqi']),       rateUpWeps: new Set(['Jinzhou Keeper', 'Cadenza', 'Lunar Cutter'])                 },
    { type: 'phase1', startDate: '2024-06-28T01:00:00+00:00', rateUpChars: new Set(['Yangyang', 'Sanhua', 'Danjin']),   rateUpWeps: new Set(['Discord', 'Commando of Conviction', 'Amity Accord'])         },
    { type: 'phase2', startDate: '2024-07-22'               , rateUpChars: new Set(['Mortefi', 'Baizhi', 'Taoqi']),     rateUpWeps: new Set(['Comet Flare', 'Overture', 'Undying Flame'])                  },
    { type: 'phase1', startDate: '2024-08-15T01:00:00+00:00', rateUpChars: new Set(['Chixia', 'Sanhua', 'Baizhi']),     rateUpWeps: new Set(['Jinzhou Keeper', 'Hollow Mirage', 'Dauntless Evernight'])    },
    { type: 'phase2', startDate: '2024-09-07'               , rateUpChars: new Set(['Aalto', 'Yuanwu', 'Danjin']),      rateUpWeps: new Set(['Novaburst', 'Helios Cleaver', 'Marcato'])                    },
    { type: 'phase1', startDate: '2024-09-29T01:00:00+00:00', rateUpChars: new Set(['Yangyang', 'Chixia', 'Taoqi']),    rateUpWeps: new Set(['Endless Collapse', 'Comet Flare', 'Discord'])                },
    { type: 'phase2', startDate: '2024-10-24'               , rateUpChars: new Set(['Mortefi', 'Sanhua', 'Youhu']),     rateUpWeps: new Set(['Variation', 'Helios Cleaver', 'Celestial Spiral'])           },
    { type: 'phase1', startDate: '2024-11-14T01:00:00+00:00', rateUpChars: new Set(['Aalto', 'Yangyan', 'Danjin']),     rateUpWeps: new Set(['Fusion Accretion', 'Novaburst', 'Commando of Conviction'])   },
    { type: 'phase2', startDate: '2024-12-12'               , rateUpChars: new Set(['Yuanwu', 'Baizhi', 'Lumi']),       rateUpWeps: new Set(['Waning Redshift', 'Jinzhou Keeper', 'Hollow Mirage'])        },
    { type: 'phase1', startDate: '2025-01-02T01:00:00+00:00', rateUpChars: new Set(['Chixia', 'Mortefi', 'Sanhua']),    rateUpWeps: new Set(['Relativistic Jet', 'Fusion Accretion', 'Amity Accord'])      },
    { type: 'phase2', startDate: '2025-01-23'               , rateUpChars: new Set(['Yuanwu', 'Danjin', 'Youhu']),      rateUpWeps: new Set(['Celestial Spiral', 'Variation', 'Dauntless Evernight'])      },
    { type: 'phase1', startDate: '2025-02-13T01:00:00+00:00', rateUpChars: new Set(['Aalto', 'Chixia', 'Lumi']),        rateUpWeps: new Set(['Novaburst', 'Discord', 'Jinzhou Keeper'])                    },
    { type: 'phase2', startDate: '2025-03-06'               , rateUpChars: new Set(['Mortefi', 'Taoqi', 'Youhu']),      rateUpWeps: new Set(['Waning Redshift', 'Marcato', 'Comet Flare'])                 },
    { type: 'phase1', startDate: '2025-03-27T01:00:00+00:00', rateUpChars: new Set(['Yuanwu', 'Chixia', 'Danjin']),     rateUpWeps: new Set(['Fusion Accretion', 'Cadenza', 'Lunar Cutter'])               },
    { type: 'phase2', startDate: '2025-04-17'               , rateUpChars: new Set(['Aalto', 'Sanhua', 'Baizhi']),      rateUpWeps: new Set(['Endless Collapse', 'Undying Flame', 'Comet Flare'])          },
    { type: 'phase1', startDate: '2025-04-29T01:00:00+00:00', rateUpChars: new Set(['Yuanwu', 'Taoqi', 'Lumi']),        rateUpWeps: new Set(['Overture', 'Hollow Mirage', 'Dauntless Evernight'])          },
    { type: 'phase2', startDate: '2025-05-22'               , rateUpChars: new Set(['Yangyang', 'Mortefi', 'Danjin']),  rateUpWeps: new Set(['Relativistic Jet', 'Undying Flame', 'Variation'])            },
    { type: 'phase1', startDate: '2025-06-12T01:00:00+00:00', rateUpChars: new Set(['Aalto', 'Baizhi', 'Youhu']),       rateUpWeps: new Set(['Endless Collapse', 'Marcato', 'Amity Accord'])               },
    { type: 'phase2', startDate: '2025-07-03'               , rateUpChars: new Set(['Chixia', 'Sanhua', 'Taoqi']),      rateUpWeps: new Set(['Helios Cleaver', 'Commando of Conviction', 'Jinzhou Keeper'])},
    { type: 'phase1', startDate: '2025-07-24T01:00:00+00:00', rateUpChars: new Set(['Yuanwu', 'Taoqi', 'Lumi']),        rateUpWeps: new Set(['Celestial Spiral', 'Lunar Cutter', 'Jinzhou Keeper'])        },
    { type: 'phase2', startDate: '2025-08-14'               , rateUpChars: new Set(['Yangyang', 'Mortefi', 'Danjin']),  rateUpWeps: new Set(['Novaburst', 'Overture', 'Variation'])                        },
    { type: 'phase1', startDate: '2025-08-28T01:00:00+00:00', rateUpChars: new Set(['Yuanwu', 'Chixia', 'Youhu']),      rateUpWeps: new Set(['Waning Redshift', 'Undying Flame', 'Comet Flare'])           },
    { type: 'phase2', startDate: '2025-09-17'               , rateUpChars: new Set(['Aalto', 'Baizhi', 'Taoqi']),       rateUpWeps: new Set(['Relativistic Jet', 'Fusion Accretion', 'Celestial Spiral'])  },
    { type: 'phase1', startDate: '2025-10-09T01:00:00+00:00', rateUpChars: new Set(['Mortefi', 'Sanhua', 'Lumi']),      rateUpWeps: new Set(['Fusion Accretion', 'Novaburst', 'Helios Cleaver'])           },
    { type: 'phase2', startDate: '2025-10-30'               , rateUpChars: new Set(['Yangyang', 'Danjin', 'Taoqi']),    rateUpWeps: new Set(['Endless Collapse', 'Hollow Mirage', 'Dauntless Evernight'])  },
    { type: 'phase1', startDate: '2025-11-20T01:00:00+00:00', rateUpChars: new Set(['Yuanwu', 'Taoqi', 'Aalto']),       rateUpWeps: new Set(['Fusion Accretion', 'Novaburst', 'Helios Cleaver'])           },
    { type: 'phase2', startDate: '2025-12-11'               , rateUpChars: new Set(['Buling', 'Chixia', 'Danjin']),     rateUpWeps: new Set(['Commando of Conviction', 'Fusion Accretion', 'Helios Cleaver'])},
    { type: 'phase1', startDate: '2025-12-25T01:00:00+00:00', rateUpChars: new Set(['Youhu', 'Baizhi', 'Yangyang']),    rateUpWeps: new Set(['Relativistic Jet', 'Endless Collapse', 'Undying Flame'])     },
    { type: 'phase2', startDate: '2026-01-15'               , rateUpChars: new Set(['Sanhua', 'Chixia', 'Danjin']),     rateUpWeps: new Set(['Waning Redshift', 'Celestial Spiral', 'Discord'])            },
];

export const CHARS_5_STAR_STANDARD = new Set([
    'Jianxin', 'Calcharo', 'Encore', 'Lingyang', 'Verina'
]);