import { gachaCalculator } from '../../calculator/base-calculator.js';
import { gachaConfig } from './config.js';
import { GFL2_ADAPTERS } from './adapters.js';

export async function runGFL2GachaCalc(inputConfig, target) {
    const calculator = new gachaCalculator(gachaConfig, GFL2_ADAPTERS);
    return calculator.runGachaCalculation(inputConfig, target);
}