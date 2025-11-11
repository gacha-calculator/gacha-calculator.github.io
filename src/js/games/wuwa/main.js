import '/src/css/styles.css';

import { WuwaPageController } from './controller.js';
import { gachaConfig, CONSTELLATION_MAP } from './config.js';
import { runWuwaGachaCalc } from './calculator.js';
import { cashback } from './cashback.js';
import { updateProbabilityTable } from '../../ui/initialize-inputs.js';

document.addEventListener('DOMContentLoaded', () => {
    const wuwaParts = {
        gachaConfig,
        CONSTELLATION_MAP,
        runCalcFn: runWuwaGachaCalc,
        cashbackFn: cashback,
        updateTableFn: updateProbabilityTable
    };

    const pageController = new WuwaPageController(wuwaParts);

    pageController.initialize();
});