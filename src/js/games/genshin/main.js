import '/src/css/styles.css';

import { GenshinPageController } from './controller.js';
import { gachaConfig, CONSTELLATION_MAP } from './config.js';
import { runGenshinGachaCalc } from './calculator.js';
import { cashback } from '../../calculator/common/cashback/cashback.js';
import { updateProbabilityTable } from '../../ui/initialize-inputs.js';

document.addEventListener('DOMContentLoaded', () => {
    const genshinParts = {
        gachaConfig,
        CONSTELLATION_MAP,
        runCalcFn: runGenshinGachaCalc,
        cashbackFn: cashback,
        updateTableFn: updateProbabilityTable
    };

    const pageController = new GenshinPageController(genshinParts);

    pageController.initialize();
});