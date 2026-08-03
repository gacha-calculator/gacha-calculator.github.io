import '/src/css/styles.css';

import { SilverPalacePageController } from './controller.js';
import { gachaConfig, CONSTELLATION_MAP } from './config.js';
import { runSilverPalaceGachaCalc } from './calculator.js';
import { cashback } from './cashback.js';
import { updateProbabilityTable } from './silver-palace-initialize-inputs.js';

document.addEventListener('DOMContentLoaded', () => {
    const silverPalaceParts = {
        gachaConfig,
        CONSTELLATION_MAP,
        runCalcFn: runSilverPalaceGachaCalc,
        cashbackFn: cashback,
        updateTableFn: updateProbabilityTable
    };

    const pageController = new SilverPalacePageController(silverPalaceParts);

    pageController.initialize();
});