import { gachaCalculator } from '../../calculator/base-calculator.js';
import { gachaConfig } from './config.js';
import { HSR_ADAPTERS } from './adapters.js';

export function runHSRGachaCalc(inputConfig, target, isCashback, signal) {
    const calculator = new gachaCalculator(gachaConfig, HSR_ADAPTERS);
    return calculator.runGachaCalculation(inputConfig, target, isCashback, signal);
}