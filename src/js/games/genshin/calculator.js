import { gachaCalculator } from '../../calculator/base-calculator.js';
import { gachaConfig } from './config.js';
import { GENSHIN_ADAPTERS } from './adapters.js';

export function runGenshinGachaCalc(inputConfig, target) {
    const calculator = new gachaCalculator(gachaConfig, GENSHIN_ADAPTERS);
    return calculator.runGachaCalculation(inputConfig, target);
}