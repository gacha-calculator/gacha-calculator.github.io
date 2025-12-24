import { updateRowProgress } from "./initialize-inputs";

export class DataValidator {
    constructor(constellationMap) {
        this.constellationMap = constellationMap;
        this.availableConstellationCounts = [];
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;

        const allInputs = document.querySelectorAll('input[type="number"]');

        allInputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.select();
            });
        });

        allInputs.forEach(input => {
            input.addEventListener('keydown', (event) => {
                if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
                    return;
                }
                if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
                    return;
                }
                if (!/^\d$/.test(event.key)) {
                    event.preventDefault();
                }
            });
        });

        allInputs.forEach(input => {
            input.addEventListener('input', (event) => {
                const target = event.target;

                const parentTable = target.closest('table');
                if (!parentTable) return;

                switch (parentTable.id) {
                    case 'constellation-table': {
                        this.updateAvailableCountsCache();
                        this.validateRateUpEligibility();
                        break;
                    }
                    case 'rate-up-table': {
                        this.validateRateUpEligibility();
                        break;
                    }
                    case 'pity-table': {
                        break;
                    }
                }
            });
        });

        this.isInitialized = true;
    }

    validateAll() {
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        this.updateAvailableCountsCache();

        const constellationTable = document.querySelector('#constellation-table');
        if (constellationTable) constellationTable.querySelectorAll('tbody tr').forEach(row => this.validateRowSum(row));

        this.validateRateUpEligibility();
    }

    updateAvailableCountsCache() {
        const counts = new Array(Object.keys(this.constellationMap).length).fill(0);
        const fourStarRows = document.querySelectorAll('#constellation-table tbody tr[data-rarity="4"]');
        fourStarRows.forEach(row => {
            row.querySelectorAll('input[type="number"]').forEach((input, index) => {
                counts[index] += parseInt(input.value, 10) || 0;
            });
        });
        this.availableConstellationCounts = counts;
    }

    validateRateUpEligibility() {
        const usage = this.getRateUpUsage();
        const isOverBudget = this.availableConstellationCounts.map((avail, i) => usage[i] > avail);

        document.querySelectorAll('#rate-up-table select.custom-select').forEach(select => {
            const index = this.constellationMap[select.value];
            const isInvalid = index !== undefined && isOverBudget[index];
            if (isInvalid) {
                select.value = 'unknown';
            }
        });
    }

    getRateUpUsage() {
        const counts = new Array(Object.keys(this.constellationMap).length).fill(0);
        document.querySelectorAll('#rate-up-table select.custom-select').forEach(select => {
            const index = this.constellationMap[select.value];
            if (index !== undefined) counts[index]++;
        });
        return counts;
    }

    validateRowSum(row) {
        if (!row.dataset.targetSum) return;
        const targetSum = parseFloat(row.dataset.targetSum);
        const inputs = row.querySelectorAll('input[type="number"]');
        let currentSum = 0;
        inputs.forEach(input => currentSum += parseFloat(input.value) || 0);
        if (targetSum != currentSum) {
            let difference = targetSum - currentSum;
            const currentValue = parseFloat(inputs[0].value) || 0;
            if (difference > 0) {
                inputs[0].value = currentValue + difference; // instead of validation I am now correcting because people read bad
            } else {
                for (let j = inputs.length - 1; j >= 0; j--) {
                    difference = Math.abs(difference);
                    let inputValue = parseFloat(inputs[j].value);
                    if (inputValue > difference) {
                        inputs[j].value = inputValue - difference;
                        break;
                    } else {
                        inputs[j].value = 0;
                        difference = difference - inputValue;
                    }
                }
            }
        }
    }

    isDataValid() {
        const pityInputs = document.querySelectorAll('#pity-table input[type="number"]');
        for (const input of pityInputs) {
            if (!this.isIndividualInputValid(input)) return false;
        }

        const constRows = document.querySelectorAll('#constellation-table tbody tr');
        for (const row of constRows) {
            this.validateRowSum(row);
            updateRowProgress(row);
        }

        this.validateRateUpEligibility();

        return true;
    }

    isIndividualInputValid(input) {
        if (input.value === '' || /^\d+$/.test(input.value)) {
            const value = parseInt(input.value, 10);
            const min = parseInt(input.min, 10);
            const max = parseInt(input.max, 10);
            return (!input.hasAttribute('min') || value >= min) && (!input.hasAttribute('max') || value <= max);
        }
        return false;
    }
}