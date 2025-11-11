import '/src/css/styles.css';

import { HSRPageController } from './controller.js';
import { gachaConfig, CONSTELLATION_MAP } from './config.js';
import { runHSRGachaCalc } from './calculator.js';
import { cashback } from '../../calculator/common/cashback/cashback.js';
import { updateProbabilityTable } from '../../ui/initialize-inputs.js';

document.addEventListener('DOMContentLoaded', () => {
    const hsrParts = {
        gachaConfig,
        CONSTELLATION_MAP,
        runCalcFn: runHSRGachaCalc,
        cashbackFn: cashback,
        updateTableFn: updateProbabilityTable
    };

    const pageController = new HSRPageController(hsrParts);

    pageController.initialize();
});