import { SELECTORS, INITIAL_CONFIG } from "./page-config.js";

export function updateProbabilityTable(distribution, names) {
    const pull = parseInt(document.querySelector('[data-control="pulls"]').value);
    const probabilityData = [];
    for (let i = 0; i < distribution.chartData[pull - 1].length; i++) {
        let currentProb = distribution.chartData[pull - 1][i];
        currentProb = (currentProb * 100).toFixed(2);
        if (currentProb > 0) {
            probabilityData.push({ name: names[i], probability: currentProb, color: "#3498db" });
        }
    }
    const tableBody = document.querySelector('#probability-table tbody');
    tableBody.innerHTML = '';


    probabilityData.forEach(item => {
        const row = document.createElement('tr');
        const widthPercent = item.probability;
        row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <div class="progress-container">
          <div class="progress-bar" style="width:${widthPercent}%;background:${item.color}">
            <div class="progress-label">${item.probability}%</div>
          </div>
        </div>
      </td>
    `;

        tableBody.appendChild(row);
    });
}

export function initializeTables(persistence, gachaConfig) {
    initializePityTable(gachaConfig.pity);

    const savedData = persistence.loadTables();

    if (savedData) {
        restorePityTable(savedData.pity);
    }
    setupTableListeners(persistence);
    window.addEventListener('beforeunload', () => morimensSaveTables());
    morimensSaveTables(persistence);
};

function setupTableListeners(persistence) {
    const elementsToWatch = [
        `${SELECTORS.PITY_TABLE} input`,
        `${SELECTORS.PITY_TABLE} select`
    ].join(',');

    document.querySelectorAll(elementsToWatch).forEach(element => {
        element.addEventListener('input', () => queueSave(persistence));
        element.addEventListener('change', () => queueSave(persistence));
    });
}

function queueSave(persistence) {
    let saveTimeout = null;
    const DEBOUNCE_TIME = 1500;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => morimensSaveTables(persistence), DEBOUNCE_TIME);
}

function morimensSaveTables(persistence) {
    if (!persistence) return;

    const morimensData = {
        _schema: 1,
        pity: getPityData(),
    };

    persistence._save('gacha_tables_morimens_v1', morimensData);
}

function getPityData() {
    return Array.from(document.querySelectorAll(`${SELECTORS.PITY_TABLE} tbody tr`)).map(row => ({
        banner: row.dataset.banner,
        ...(row.querySelector('[data-control="pity-5"]') && { pity5: row.querySelector('[data-control="pity-5"]').value }),
        ...(row.querySelector('[data-control="guarantee-5"]') && { guarantee5: row.querySelector('[data-control="guarantee-5"]').value })
    }));
}

function initializePityTable(pityConfig) {
    const pityTemplate = document.getElementById('pity-row-template');
    const pityTbody = document.querySelector(`${SELECTORS.PITY_TABLE} tbody`);

    Object.entries(INITIAL_CONFIG.pitySettings).forEach(([bannerType, config]) => {
        const row = pityTemplate.content.cloneNode(true).querySelector('tr');

        row.dataset.validationType = 'individual';

        const pity5Input = row.querySelector('[data-control="pity-5"]');

        if (pity5Input) {
            pity5Input.min = 0;
            pity5Input.max = pityConfig.pitySSR - 1;
        }

        row.dataset.banner = bannerType;
        row.querySelector('.banner-name').textContent = bannerType;
        row.querySelector('[data-control="pity-5"]').value = config.pity5;

        pityTbody.appendChild(row);
    });

    const pityTable = document.querySelector('#pity-table');
    if (pityTable) pityTable.querySelectorAll('tbody tr input[type="number"]').forEach(input =>
        input.addEventListener('input', function () {
            let value = this.value;

            if (value.length > 1 && value.startsWith('0')) {
                this.value = value.replace(/^0+/, '');
                if (this.value === '') this.value = '0';
            }

            let numValue = parseInt(this.value) || 0;
            if (numValue > input.max) {
                this.value = input.max;
                errorAnimation(this);
            } else if (numValue <= input.min) {
                this.value = input.min;
                errorAnimation(this);
            }
        })
    );

    const guarantees = document.querySelectorAll('[data-control="guarantee-5"]');
    const optionsData = {
        0: "0",
        1: "1",
        2: "2"
    };

    guarantees.forEach((selectElement, index) => {
        for (const [key, value] of Object.entries(optionsData)) {
            if (index === 1 && key === "2") {
                continue;
            }

            selectElement.add(new Option(value, key));
        }

        selectElement.value = "0";
    });
};

function errorAnimation(inputElement) {
    inputElement.style.borderColor = '#a71919';
    inputElement.style.outline = '1px solid #a71919';

    inputElement.classList.add('flicker');
    setTimeout(() => {
        inputElement.classList.remove('flicker');
        inputElement.style.borderColor = '';
        inputElement.style.outline = '';
    }, 500);
}

export function restorePityTable(savedPity) {
    savedPity.forEach(savedRow => {
        const row = document.querySelector(`${SELECTORS.PITY_TABLE} tr[data-banner="${savedRow.banner}"]`);
        if (row) {
            row.querySelector('[data-control="pity-5"]').value = savedRow.pity5;
            row.querySelector('[data-control="guarantee-5"]').value = savedRow.guarantee5;
        }
    });
}