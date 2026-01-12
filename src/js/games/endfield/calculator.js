import { gachaCalculator } from '../../calculator/base-calculator.js';
import { gachaConfig } from './config.js';
import { ENDFIELD_ADAPTERS } from './adapters.js';

export function runEndfieldGachaCalc(inputConfig, target) {
    const calculator = new gachaCalculator(gachaConfig, ENDFIELD_ADAPTERS);
    return calculator.runGachaCalculation(inputConfig, target);
}