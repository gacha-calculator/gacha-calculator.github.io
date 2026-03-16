import { gachaCalculator } from '../../calculator/base-calculator.js';
import { gachaConfig } from './config.js';
import { ZZZ_ADAPTERS } from './adapters.js';

export function runZZZGachaCalc(inputConfig, target, isCashback, signal) {
    const calculator = new gachaCalculator(gachaConfig, ZZZ_ADAPTERS);
    return calculator.runGachaCalculation(inputConfig, target, isCashback, signal);
}