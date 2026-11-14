export const ODDS_SSR = [0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 0.0303, 1];

export const gachaConfig = {
    maxCharacterConstelation: 15,
    configSSR: {
        maxType: 16
    },
    paths: {
        char: ['None', 'e0', 'e1', 'e2', 'e3', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10', '+11', '+12'],
        wep: ['None', 'a1', 'a2', 'a3', 'a4', 'a5', 'e6', 'a7', 'a8', 'a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15']
    },
    pity: {
        pitySSR: ODDS_SSR.length
    },
    pullCosts: {
        premiumCurrencyInRegular: 1,
        pullCostInCurrency: 200,
    },
    default: 0
};