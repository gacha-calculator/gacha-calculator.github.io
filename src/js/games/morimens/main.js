import '/src/css/styles.css';

import { morimensPageController } from './controller.js';
import { gachaConfig } from './config.js';
import { runMorimensGachaCalc } from './calculator.js';
import { updateProbabilityTable } from './morimens-initialize-inputs.js';

document.addEventListener('DOMContentLoaded', () => {
    const R1999Parts = {
        gachaConfig,
        runCalcFn: runMorimensGachaCalc,
        updateTableFn: updateProbabilityTable
    };

    const pageController = new morimensPageController(R1999Parts);

    pageController.initialize();
});