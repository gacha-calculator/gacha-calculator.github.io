import '/src/css/styles.css';

import { zenlessPageController } from './controller.js';
import { gachaConfig, CONSTELLATION_MAP } from './config.js';
import { runZZZGachaCalc } from './calculator.js';
import { cashback } from '../../calculator/common/cashback/cashback.js';
import { updateProbabilityTable } from '../../ui/initialize-inputs.js';

document.addEventListener('DOMContentLoaded', () => {
    const zenlessParts = {
        gachaConfig,
        CONSTELLATION_MAP,
        runCalcFn: runZZZGachaCalc,
        cashbackFn: cashback,
        updateTableFn: updateProbabilityTable
    };

    const pageController = new zenlessPageController(zenlessParts);

    pageController.initialize();
});