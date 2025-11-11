import '/src/css/styles.css';

import { GFL2PageController } from './controller.js';
import { gachaConfig, CONSTELLATION_MAP } from './config.js';
import { runGFL2GachaCalc } from './calculator.js';
import { cashback } from '../../calculator/common/cashback/cashback.js';
import { updateProbabilityTable } from '../../ui/initialize-inputs.js';

document.addEventListener('DOMContentLoaded', () => {
    const gfl2Parts = {
        gachaConfig,
        CONSTELLATION_MAP,
        runCalcFn: runGFL2GachaCalc,
        cashbackFn: cashback,
        updateTableFn: updateProbabilityTable
    };

    const pageController = new GFL2PageController(gfl2Parts);

    pageController.initialize();
});