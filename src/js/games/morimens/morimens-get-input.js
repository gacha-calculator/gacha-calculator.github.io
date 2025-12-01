const getSafeValue = (element, isCheckbox = false) => {
    if (!element) {
        return null;
    }
    return isCheckbox ? element.checked : parseInt(element.value) || 0;
};

export function getPageConfiguration(gachaConfig, SELECTORS, INITIAL_CONFIG) {
    const pityPanel = document.getElementById('pity-panel');
    const paths = gachaConfig.paths;

    if (!pityPanel) {
        console.error("Required tab panels not found. Cannot get page configuration.");
        return null;
    }

    const rowChar = pityPanel.querySelector(`${SELECTORS.PITY_ROW}[data-banner="character"]`);
    const rowWep = pityPanel.querySelector(`${SELECTORS.PITY_ROW}[data-banner="weapon"]`);
    const { planConfigs } = generateArrays(paths);

    const pity5 = {};
    const guarantee5 = {};

    if (INITIAL_CONFIG.isCharacter) {
        pity5.char = getSafeValue(rowChar.querySelector('[data-control="pity-5"]'));
        guarantee5.char = Number(rowChar.querySelector('[data-control="guarantee-5"]').value);
        pity5.wep = getSafeValue(rowWep.querySelector('[data-control="pity-5"]'));
        guarantee5.wep = Number(rowWep.querySelector('[data-control="guarantee-5"]').value);
    }

     return {
        SSR: {
            pity: pity5,
            guarantee: guarantee5,
            pullPlan: planConfigs.typeArray,
            cashbackRoadmap: planConfigs.cashbackArray
        }
    };
};

export function getPullPlan() {
    const rows = document.querySelectorAll('.row');
    const pullPlan = [];

    // Skip first row (rarity picker)
    const rowsToProcess = Array.from(rows).slice(1);

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