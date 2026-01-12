import '/src/css/styles.css';

import { EndfieldPageController } from './controller.js';
import { gachaConfig, CONSTELLATION_MAP } from './config.js';
import { runEndfieldGachaCalc } from './calculator.js';
import { cashback } from './cashback.js';
import { updateProbabilityTable } from './endfield-initialize-inputs.js';

document.addEventListener('DOMContentLoaded', () => {
    const endfieldParts = {
        gachaConfig,
        CONSTELLATION_MAP,
        runCalcFn: runEndfieldGachaCalc,
        cashbackFn: cashback,
        updateTableFn: updateProbabilityTable
    };

    const pageController = new EndfieldPageController(endfieldParts);

    pageController.initialize();
});