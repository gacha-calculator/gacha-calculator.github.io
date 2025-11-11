import '/src/css/styles.css';

import { R1999PageController } from './controller.js';
import { gachaConfig, CONSTELLATION_MAP } from './config.js';
import { runR1999GachaCalc } from './calculator.js';
import { cashback } from './R1999-cashback/R1999-cashback.js';
import { updateProbabilityTable } from '../../ui/initialize-inputs.js';

document.addEventListener('DOMContentLoaded', () => {
    const R1999Parts = {
        gachaConfig,
        CONSTELLATION_MAP,
        runCalcFn: runR1999GachaCalc,
        cashbackFn: cashback,
        updateTableFn: updateProbabilityTable
    };

    const pageController = new R1999PageController(R1999Parts);

    pageController.initialize();
});