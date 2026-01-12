const getSafeValue = (element, isCheckbox = false) => {
    if (!element) {
        return null;
    }
    return isCheckbox ? element.checked : parseInt(element.value) || 0;
};

export function getPageConfiguration(CONSTELLATION_MAP = null, gachaConfig, SELECTORS, INITIAL_CONFIG = null) {
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

        const input = table.querySelector(
            `tr[data-rarity="${rarity}"] .custom-input`
        );

        const value = parseInt(input.value) || 0;
        const values = [];
        if (rarity === 5) {
            values.push(gachaConfig.poolStandardCharSSR + gachaConfig.poolStandardLimitedCharSSR - value); // add row thingy
        } else {
            values.push(gachaConfig.poolCharSR - value);
        }
        values.push(value);

        return values;
    };
    const row = pityPanel.querySelector(`${SELECTORS.PITY_ROW}`);
    const planConfigs = generateArrays(paths);

    const pity5 = {};
    const pity4 = {};
    const type = row.querySelector('.banner-name').textContent;
    if (type === 'Character') {
        pity5.char = getSafeValue(row.querySelector('[data-control="pity-5"]'));
        pity4.char = getSafeValue(row.querySelector('[data-control="pity-4"]'));
    } else {
        pity5.wep = getSafeValue(row.querySelector('[data-control="pity-5"]'));
        pity4.wep = getSafeValue(row.querySelector('[data-control="pity-4"]'));
    }
    const pull = parseInt(document.querySelector('[data-control="pulls"]').value);

    return {
        SSR: {
            pity: pity5,
            consCountStandard: getConstellationConfiguration(5, constellationPanel),
            consCountLimitedStandard: planConfigs.limitedStandard,
            pullPlan: planConfigs.typeArray,
            cashbackRoadmap: planConfigs.cashbackArray
        },
        SR: {
            pity: pity4,
            consCount: getConstellationConfiguration(4, constellationPanel)
        },
        pull: pull
    };
};

export function getPullPlan() {
    const rows = document.querySelectorAll('.row');
    const pullPlan = [];
    const rowsToProcess = Array.from(rows).slice(1); // Skip first row (type picker)

    rowsToProcess.forEach(row => {
        const counter = row.querySelector('[data-control="standard-limited-counter"]').value;
        const group = row.dataset.group;
        const type = row.querySelector('.type-selector')?.value || 'char';
        const from = row.querySelector('.first-select')?.value || 'None';
        const to = row.querySelector('.second-select')?.value || 'None';
        pullPlan.push({ counter: counter, group: group, type: type, from: from, to: to });
    });
    return { pullPlan };
};

function generateArrays(paths) {
    const rows = document.querySelectorAll('.row');
    const typeArray = [];
    const cashbackArray = [];
    const limitedStandard = [];
    const rowsToProcess = Array.from(rows).slice(1); // Skip first row (rarity picker)
    let bannerCount = 0;

    rowsToProcess.forEach(row => {
        const type = document.querySelector('.type-text').textContent === 'Character' ? 'char' : 'wep';
        const from = row.querySelector('.first-select')?.value || 'None';
        const to = row.querySelector('.second-select')?.value || 'None';
        const currentLimitedStandard = parseInt(row.querySelector('[data-control="standard-limited-counter"]').value);
        limitedStandard.push(currentLimitedStandard);

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
        limitedStandard,
        typeArray,
        cashbackArray  // Contains [fromIndex, toIndex] pairs for each character row
    };
}