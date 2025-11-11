const getSafeValue = (element, isCheckbox = false) => {
    if (!element) {
        return null;
    }
    return isCheckbox ? element.checked : parseInt(element.value) || 0;
};

export function getPageConfiguration(CONSTELLATION_MAP, gachaConfig, SELECTORS, INITIAL_CONFIG) {
    const pityPanel = document.getElementById('pity-panel');
    const constellationPanel = document.getElementById('constellation-panel');
    const paths = gachaConfig.paths;

    if (!pityPanel || !constellationPanel) {
        console.error("Required tab panels not found. Cannot get page configuration.");
        return null;
    }

    const getConstellationConfiguration = (rarity, panel) => {
        if (!panel) return [];

        const table = panel.querySelector('#constellation-table');
        if (!table) {
            console.warn("Could not find the constellation table inside the panel:", panel);
            return [];
        }

        const inputs = table.querySelectorAll(
            `tr[data-rarity="${rarity}"] .custom-input`
        );

        return Array.from(inputs).map(input => parseInt(input.value) || 0);
    };
    const rowChar = pityPanel.querySelector(`${SELECTORS.PITY_ROW}[data-banner="character"]`);
    const rowWep = pityPanel.querySelector(`${SELECTORS.PITY_ROW}[data-banner="weapon"]`);
    const planConfigs = generateArrays(paths);

    const pity5 = {};
    const pity4 = {};
    const guarantee5 = {};
    const guarantee4 = {};
    const special = {};

    if (INITIAL_CONFIG.isCharacter) {
        pity5.char = getSafeValue(rowChar.querySelector('[data-control="pity-5"]'));
        pity4.char = getSafeValue(rowChar.querySelector('[data-control="pity-4"]'));
        guarantee5.char = getSafeValue(rowChar.querySelector('.guarantee-5'), true);
        guarantee4.char = getSafeValue(rowChar.querySelector('.guarantee-4'), true);
        if (INITIAL_CONFIG.isCapRad) {
            special.capRad = getSafeValue(rowChar.querySelector('[data-control="capRad"]'));
        }
    }

    if (INITIAL_CONFIG.isWeapon) {
        pity5.wep = getSafeValue(rowWep.querySelector('[data-control="pity-5"]'));
        pity4.wep = getSafeValue(rowWep.querySelector('[data-control="pity-4"]'));
        guarantee5.wep = getSafeValue(rowWep.querySelector('.guarantee-5'), true);
        guarantee4.wep = getSafeValue(rowWep.querySelector('.guarantee-4'), true);
        if (INITIAL_CONFIG.isEpitPath) {
            special.epitPath = getSafeValue(rowWep.querySelector('[data-control="epPath"]'));
        }
    }

    return {
        SSR: {
            pity: pity5,
            guarantee: guarantee5,
            special: special,
            consCountStandard: getConstellationConfiguration(5, constellationPanel),
            pullPlan: planConfigs.typeArray,
            cashbackRoadmap: planConfigs.cashbackArray
        },
        SR: {
            pity: pity4,
            guarantee: guarantee4,
            rateUps: getRateUps(CONSTELLATION_MAP),
            consCount: getConstellationConfiguration(4, constellationPanel)
        }
    };
};

export function getPullPlan() {
    const rows = document.querySelectorAll('.row');
    const pullPlan = [];
    const rowsToProcess = Array.from(rows).slice(1); // Skip first row (rarity picker)

    rowsToProcess.forEach(row => {
        const group = row.dataset.group;
        const type = row.querySelector('.type-selector')?.value || 'char';
        const from = row.querySelector('.first-select')?.value || 'None';
        const to = row.querySelector('.second-select')?.value || 'None';
        pullPlan.push({ group: group, type: type, from: from, to: to });
    });
    return { pullPlan };
};

function generateArrays(paths) {
    const rows = document.querySelectorAll('.row');
    const typeArray = [];
    const cashbackArray = [];
    const rowsToProcess = Array.from(rows).slice(1); // Skip first row (rarity picker)
    let bannerCount = 0;

    rowsToProcess.forEach(row => {
        const type = row.querySelector('.type-selector')?.value || 'char';
        const from = row.querySelector('.first-select')?.value || 'None';
        const to = row.querySelector('.second-select')?.value || 'None';

        const order = (type === 'char') ? paths.char : paths.wep;

        const fromIndex = order.indexOf(from);
        const toIndex = order.indexOf(to);

        if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
            return; // Invalid range, skip this row
        }
        const rangeLength = toIndex - fromIndex;
        let currentIndex = fromIndex;
        let cashbackValue = 0;

        for (let i = 0; i < rangeLength; i++) {
            if (type === 'char') {
                if (currentIndex === 0) {
                    cashbackValue = 'none';
                } else {
                    cashbackValue = 'regular';
                }
            } else { // weapon
                cashbackValue = 'regular';
            }
            typeArray.push({ type: type, bannerCount: bannerCount });
            cashbackArray.push(cashbackValue);
            currentIndex++;
        }
        bannerCount++;
    });

    return {
        typeArray,
        cashbackArray  // Contains [fromIndex, toIndex] pairs for each character row
    };
}

export function getLabels(paths) {
    const rows = document.querySelectorAll('.row');
    const rowsToProcess = Array.from(rows).slice(1);
    let labels = ['None'];

    // Define the order of character and weapon labels
    const charOrder = paths.char;
    const weaponOrder = paths.wep;

    rowsToProcess.forEach(row => {
        const type = row.querySelector('.type-selector')?.value || 'char';
        const from = row.querySelector('.first-select')?.value || 'None';
        const to = row.querySelector('.second-select')?.value || 'None';

        const order = type === 'char' ? charOrder : weaponOrder;
        const fromIndex = order.indexOf(from);
        const toIndex = order.indexOf(to);

        if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
            return; // Invalid range, skip or handle error
        }

        // Get the labels in the range (excluding the first value)
        const rangeLabels = order.slice(fromIndex + 1, toIndex + 1);
        labels.push(...rangeLabels);
    });

    return labels;
}

function getRateUps() {
    const rateUpSelects = document.querySelectorAll('#rate-up-table select.custom-select');
    let rateUps = [];

    if (rateUpSelects.length === 0) {
        console.error("Could not find any rate-up select elements.");
        return []; // Return an empty array to indicate failure
    }

    rateUpSelects.forEach(selectElement => {
        const selectedValue = selectElement.value;
        if (selectedValue === 'unknown') {
            return; // 'return' inside a forEach acts like 'continue'
        } else if (selectedValue !== undefined) {
            rateUps.push(selectedValue);
        } else {
            console.warn(`Invalid or unhandled rate-up value found: "${selectedValue}"`);
        }
    });

    return rateUps;
}

export function getTarget() {
    const targetType = document.querySelector('.mode-label.active').getAttribute('data-target');
    if (targetType === 'probability') {
        return { type: targetType, value: parseInt(document.querySelector('[data-control="probability"]').value) / 100 };
    } else if (targetType === 'pulls') {
        return { type: targetType, value: parseInt(document.querySelector('[data-control="pulls"]').value) };
    }
}