import { SELECTORS, INITIAL_CONFIG } from "./page-config.js";

export function initializeTables(persistence, gachaConfig, validator, pageType) {
    initializePityTable(gachaConfig.pity, pageType);
    initializeConstellationTable(gachaConfig);

    const savedData = persistence.loadTables(pageType);

    if (savedData) {
        restorePityTable(savedData.pity);
        restoreConstellationTable(savedData.constellation);

        validator.validateAll();
    }

    persistence.init(pageType);
};

function initializePityTable(pityConfig, bannerType = 'Character') {
    const pityTemplate = document.getElementById('pity-row-template');
    const pityTbody = document.querySelector(`${SELECTORS.PITY_TABLE} tbody`);
    let config;
    if (bannerType === 'Character') {
        config = INITIAL_CONFIG.pitySettings.character;
    } else {
        config = INITIAL_CONFIG.pitySettings.weapon;
    }

    const row = pityTemplate.content.cloneNode(true).querySelector('tr');

    row.dataset.validationType = 'individual'; // Tell the validator what to do

    const pity4Input = row.querySelector('[data-control="pity-4"]');
    const pity5Input = row.querySelector('[data-control="pity-5"]');

    if (pity4Input) {
        pity4Input.min = 0;
        pity4Input.max = pityConfig.pitySRChar - 1;
    }
    if (pity5Input) {
        pity5Input.min = 0;
        pity5Input.max = pityConfig.pitySSRChar - 1;
    }

    row.dataset.banner = bannerType;
    row.querySelector('.banner-name').textContent = bannerType;
    row.querySelector('[data-control="pity-4"]').value = config.pity4;
    row.querySelector('[data-control="pity-5"]').value = config.pity5;

    pityTbody.appendChild(row);

    const pityTable = document.querySelector('#pity-table');
    if (pityTable) pityTable.querySelectorAll('tbody tr input[type="number"]').forEach(input =>
        input.addEventListener('input', function () {
            let value = this.value;

            if (value.length > 1 && value.startsWith('0')) {
                this.value = value.replace(/^0+/, '');
            }
            if (this.value === '') this.value = '0';

            let numValue = parseInt(this.value) || 0;
            if (numValue > input.max) {
                this.value = input.max;
                errorAnimation(this);
            } else if (numValue < input.min) {
                this.value = input.min;
                errorAnimation(this);
            }
        })
    );
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

function initializeConstellationTable(config) {
    const constTemplate = document.getElementById('const-column-template');
    const tableRows = document.querySelectorAll(`${SELECTORS.CONSTELLATION_TABLE} tbody tr`);
    const StandardSSRDefault = config.poolStandardCharSSR;
    const LimitedSRDefault = config.poolCharSR;

    tableRows.forEach(row => {
        const fragment = document.createDocumentFragment();
        const rarity = row.dataset.rarity;

        row.dataset.validationType = 'row-sum';
        row.dataset.targetSum = rarity === '5' ? StandardSSRDefault : LimitedSRDefault;
        // Add the data columns
        for (let i = 0; i < INITIAL_CONFIG.constellationColumns; i++) {
            const clone = constTemplate.content.cloneNode(true);
            const input = clone.querySelector('input');
            const td = clone.querySelector('td');

            if (i === 0) {
                input.value = 0;
            }

            const separator = document.createTextNode(` / ${row.dataset.targetSum}`);
            td.appendChild(separator);

            input.addEventListener('input', function () {
                if (input.value.length > 1 && input.value.startsWith('0')) {
                    input.value = input.value.replace(/^0+/, '');
                }

                if (input.value === '') {
                    input.value = '0';
                }
            })

            fragment.appendChild(clone);
        }

        row.appendChild(fragment);
    });
}

export function updateProbabilityTable(distribution, names, cashback) {
    const probabilityData = [];
    for (let i = 0; i < distribution.length; i++) {
        let currentProb = 0;
        for (const [key, value] of distribution[i].offRates) {
            currentProb += value.prob;
        }
        currentProb = (currentProb * 100).toFixed(2);
        if (currentProb > 0) {
            probabilityData.push({ name: names[i], probability: currentProb, p10: cashback[i].LOWER_BOUND, mean: cashback[i].MEAN, p90: cashback[i].UPPER_BOUND, color: "#3498db" });
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
      <td class="cashback-value">${item.p10.toFixed(1)}</td>
      <td class="cashback-value highlight">${item.mean.toFixed(1)}</td>
      <td class="cashback-value">${item.p90.toFixed(1)}</td>
    `;

        tableBody.appendChild(row);
    });
}

export function restorePityTable(savedPity) {
    if (savedPity[0].banner === 'Character') {
        toggleScroll(false);
    } else if (savedPity[0].banner === 'Weapon') {
        toggleScroll(true);
    }

    savedPity.forEach(savedRow => {
        const row = document.querySelector(`${SELECTORS.PITY_TABLE} tr[data-banner="${savedRow.banner}"]`);
        if (row) {
            row.querySelector('[data-control="pity-4"]').value = savedRow.pity4;
            row.querySelector('[data-control="pity-5"]').value = savedRow.pity5;
        }
    });
}

function toggleScroll(enable) {
    const SSR = document.querySelector('[data-control="pity-5"]');
    const SR = document.querySelector('[data-control="pity-4"]');

    if (!SSR._scrollHandler) {
        SSR._scrollHandler = function (e) {
            const options = [0, 10, 20, 30];
            if (e.type === 'wheel') e.preventDefault();

            let i = options.indexOf(parseInt(this.value));
            if (i === -1) i = 0;

            if (e.type === 'wheel') {
                e.deltaY > 0 ? i++ : i--;
            } else {
                i++;
            }

            if (i >= options.length) i = (e.type === 'wheel') ? options.length - 1 : 0;
            if (i < 0) i = 0;

            this.value = options[i];
            this.dispatchEvent(new Event('change', { bubbles: true }));
        };
    }

    if (enable) {
        SSR.readOnly = true;
        SSR.addEventListener('wheel', SSR._scrollHandler, { passive: false });
        SSR.addEventListener('click', SSR._scrollHandler);
        SR.value = '0';
        SR.readOnly = true;
    } else {
        SSR.readOnly = false;
        SSR.removeEventListener('wheel', SSR._scrollHandler);
        SSR.removeEventListener('click', SSR._scrollHandler);
        SR.readOnly = false;
    }
}

export function restoreConstellationTable(savedConstellation) {
    const rows = document.querySelectorAll(`${SELECTORS.CONSTELLATION_TABLE} tbody tr`);

    rows.forEach((row, rowIndex) => {
        const savedRow = savedConstellation[rowIndex];
        if (savedRow) {
            const inputs = row.querySelectorAll('td:nth-child(n+2) input');
            inputs.forEach((input, colIndex) => {
                if (savedRow[colIndex] !== undefined) {
                    input.value = savedRow[colIndex];
                }
            });
        }
    });
}