import { gachaCalculator } from '../../calculator/base-calculator.js';
import { gachaConfig } from './config.js';
import { WUWA_ADAPTERS } from './adapters.js';

export function runWuwaGachaCalc(inputConfig, target, isCashback, signal) {
    const calculator = new gachaCalculator(gachaConfig, WUWA_ADAPTERS);
    return calculator.runGachaCalculation(inputConfig, target, isCashback, signal);
}