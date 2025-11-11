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
    const { planConfigs, pity4, guarantee4 } = generateArrays(paths);

    const pity5 = {};
    const guarantee5 = {};
    const special = {};

    if (INITIAL_CONFIG.isCharacter) {
        pity5.char = getSafeValue(rowChar.querySelector('[data-control="pity-5"]'));
        guarantee5.char = getSafeValue(rowChar.querySelector('.guarantee-5'), true);
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
    const pity4 = [];
    const guarantee4 = [];

    // Skip first row (rarity picker)
    const rowsToProcess = Array.from(rows).slice(1);


    rowsToProcess.forEach(row => {
        const group = row.dataset.group;
        const pity = getSafeValue(row.querySelector('[data-control="pity-4"]'));
        const guarantee = getSafeValue(row.querySelector('.guarantee-4'), true);
        const type = row.querySelector('.type-selector')?.value || 'char';
        const from = row.querySelector('.first-select')?.value || 'None';
        const to = row.querySelector('.second-select')?.value || 'None';
        pity4.push(pity);
        guarantee4.push(guarantee);
        pullPlan.push({ group: group, type: type, from: from, to: to });
    });
    return { pullPlan, pity4, guarantee4 };
};

function generateArrays(paths) {
    const rows = document.querySelectorAll('.row');
    const planConfigs = {};
    const typeArray = [];
    const cashbackArray = [];
    const pity4 = [];
    const guarantee4 = [];
    const rowsToProcess = Array.from(rows).slice(1); // Skip first row (rarity picker)
    let bannerCount = 0;

    rowsToProcess.forEach(row => {
        const pity = getSafeValue(row.querySelector('[data-control="pity-4"]'));
        const guarantee = getSafeValue(row.querySelector('.guarantee-4'), true);

        pity4.push(pity);
        guarantee4.push(guarantee);

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

    planConfigs.typeArray = typeArray;
    planConfigs.cashbackArray = cashbackArray;

    return {
        planConfigs, pity4, guarantee4
    };
}

function getRateUps() {
    const rateUpSelects = document.querySelectorAll('#rate-up-table select.custom-select');
    let rateUps = [];

    if (rateUpSelects.length === 0) {
        console.error("Could not find any rate-up select elements.");
        return [];
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