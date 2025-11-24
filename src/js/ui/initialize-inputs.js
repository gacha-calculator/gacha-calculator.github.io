export function initializeTables(persistence, gachaConfig, validator, INITIAL_CONFIG, CONSTELLATION_OPTIONS, SELECTORS) {
    initializePityTable(gachaConfig.pity, INITIAL_CONFIG, SELECTORS);
    initializeConstellationTable(gachaConfig, INITIAL_CONFIG, SELECTORS);
    initializeRateUpTable(CONSTELLATION_OPTIONS);

    const savedData = persistence.loadTables();

    if (savedData) {
        restorePityTable(savedData.pity, SELECTORS);
        restoreConstellationTable(savedData.constellation, SELECTORS);
        restoreRateUpTable(savedData.rateUps);

        validator.validateAll();
    }

    persistence.init();
};

export function initializeButtons(persistence) {
    const savedData = persistence.loadButtons();
    if (savedData) {
        if (savedData.isHidden) {
            restoreButtonsState(savedData)
        }
    }
}

function initializePityTable(pityConfig, INITIAL_CONFIG, SELECTORS) {
    const pityTemplate = document.getElementById('pity-row-template');
    const pityTbody = document.querySelector(`${SELECTORS.PITY_TABLE} tbody`);

    Object.entries(INITIAL_CONFIG.pitySettings).forEach(([bannerType, config]) => {
        const row = pityTemplate.content.cloneNode(true).querySelector('tr');
        const specialMechanicCell = row.querySelector('.special-mechanic');

        row.dataset.validationType = 'individual'; // Tell the validator what to do

        const pity4Input = row.querySelector('[data-control="pity-4"]');
        const pity5Input = row.querySelector('[data-control="pity-5"]');

        if (pity4Input) {
            pity4Input.min = 0;
            pity4Input.max = bannerType.includes('weapon') ? pityConfig.pitySRWep - 1 : pityConfig.pitySRChar - 1;
        }
        if (pity5Input) {
            pity5Input.min = 0;
            pity5Input.max = bannerType.includes('weapon') ? pityConfig.pitySSRWep - 1 : pityConfig.pitySSRChar - 1;
        }

        row.dataset.banner = bannerType;
        row.querySelector('.banner-name').textContent = bannerType;
        row.querySelector('[data-control="pity-4"]').value = config.pity4;
        row.querySelector('[data-control="pity-5"]').value = config.pity5;

        if (specialMechanicCell) {
            let mechanicInputHtml = '';
            ;
            if (bannerType === 'character') {
                mechanicInputHtml = `<div class="button-container">
            <input type="number" data-control="capRad" class="custom-input" min="0" max="3" 
                   value="${config.caprad ?? 0}">
                            <button class="help-btn" data-help-key="caprad-help"
                                aria-label="Help for Importing Pity Data">
                                ?
                            </button>
                        </div>`;
            } else if (bannerType === 'weapon') {
                mechanicInputHtml = `<div class="button-container">
            <input type="number" data-control="epPath" class="custom-input" min="0" max="1" 
                   value="${config.epPath ?? 0}">
                            <button class="help-btn" data-help-key="eppath-help"
                                aria-label="Help for Importing Pity Data">
                                ?
                            </button>
                        </div>`;
            }

            specialMechanicCell.innerHTML = mechanicInputHtml;
        }

        pityTbody.appendChild(row);

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
                } else if (numValue < input.min) {
                    this.value = input.min;
                    errorAnimation(this);
                }
            })
        );
    });
};

function initializeConstellationTable(config, INITIAL_CONFIG, SELECTORS) {
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

            if (i === 0) {
                const defaultValue = rarity === '5' ? StandardSSRDefault : LimitedSRDefault;
                input.value = defaultValue;
            }

            input.addEventListener('input', () => updateRowProgress(row));
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
        addProgressBarToRow(row);
        updateRowProgress(row);
    });
}

function addProgressBarToRow(row) {
    const progressBar = document.createElement('div');
    progressBar.className = 'row-progress-bar';

    row.appendChild(progressBar);
}

function updateRowProgress(row) {
    const inputs = row.querySelectorAll('input');
    const targetSum = parseInt(row.dataset.targetSum);
    let currentSum = 0;

    inputs.forEach(input => {
        currentSum += parseInt(input.value) || 0;
    });

    const progressBar = row.querySelector('.row-progress-bar');
    const percentage = Math.min((currentSum / targetSum) * 100, 100);
    progressBar.style.width = percentage + '%';

    if (percentage < 60 || currentSum > targetSum) {
        progressBar.style.background = 'rgba(244, 67, 54, 0.3)';
    } else if (percentage < 80) {
        progressBar.style.background = 'rgba(241, 244, 54, 0.3)';
    } else {
        progressBar.style.background = 'rgba(54, 244, 79, 0.3)';
    }
}

function initializeRateUpTable(CONSTELLATION_OPTIONS) {
    const rateUpSelects = document.querySelectorAll('#rate-up-table select');

    if (rateUpSelects.length === 0) {
        return;
    }
    const optionsHTML = CONSTELLATION_OPTIONS.map(opt =>
        `<option value="${opt.value}">${opt.text}</option>`
    ).join('');

    rateUpSelects.forEach(select => {
        select.innerHTML = optionsHTML;
        select.value = 'unknown';
    });
}

export function initializeTarget(DEFAULTS, savedSettings = null) {
    const probabilityInput = document.querySelector('[data-control="probability"]');
    const pullsInput = document.querySelector('[data-control="pulls"]');

    if (savedSettings) {
        probabilityInput.value = savedSettings.targetProb || DEFAULTS.probability;
        pullsInput.value = savedSettings.targetPull || DEFAULTS.pulls;
    } else {
        probabilityInput.value = DEFAULTS.probability;
        pullsInput.value = DEFAULTS.pulls;
    }

    probabilityInput.addEventListener('input', function () {
        let value = this.value;

        if (value.length > 1 && value.startsWith('0')) {
            this.value = value.replace(/^0+/, '');
            if (this.value === '') this.value = '0';
        }

        let numValue = parseInt(this.value) || 0;
        if (numValue > 100) {
            this.value = '100';
            errorAnimation(this);
        } else if (numValue === 0) {
            this.value = '0';
        }
    });

    pullsInput.addEventListener('input', function () {
        let value = this.value;

        if (value.length > 1 && value.startsWith('0')) {
            this.value = value.replace(/^0+/, '');
            if (this.value === '') this.value = '0';
        }

        let numValue = parseInt(this.value) || 0;
        if (numValue > 9999) {
            this.value = '9999';
        } else if (numValue < 1) {
            this.value = '1';
        }
    });
}

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

export function restorePityTable(savedPity, SELECTORS) {
    savedPity.forEach(savedRow => {
        const row = document.querySelector(`${SELECTORS.PITY_TABLE} tr[data-banner="${savedRow.banner}"]`);
        if (row) {
            row.querySelector('[data-control="pity-4"]').value = savedRow.pity4;
            row.querySelector('[data-control="pity-5"]').value = savedRow.pity5;
            row.querySelector('.guarantee-4').checked = savedRow.guarantee4;
            row.querySelector('.guarantee-5').checked = savedRow.guarantee5;

            if (savedRow.caprad && row.querySelector('[data-control="capRad"]')) {
                row.querySelector('[data-control="capRad"]').value = savedRow.caprad;
            }

            if (savedRow.epPath && row.querySelector('[data-control="epPath"]')) {
                row.querySelector('[data-control="epPath"]').value = savedRow.epPath;
            }
        }
    });
}

export function restoreConstellationTable(savedConstellation, SELECTORS) {
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

export function restoreRateUpTable(savedRateUps) {
    if (!savedRateUps || !Array.isArray(savedRateUps)) {
        return; // Do nothing if there's no saved data
    }

    const rateUpSelects = document.querySelectorAll('#rate-up-table select.custom-select');

    rateUpSelects.forEach((select, index) => {
        // Check if there's a saved value for this specific dropdown
        if (savedRateUps[index] !== undefined) {
            select.value = savedRateUps[index];
        }
    });
}

function restoreButtonsState() {
    const elements = document.querySelectorAll('.help-btn');

    elements.forEach(element => {
        element.classList.toggle('hidden');
    });
}