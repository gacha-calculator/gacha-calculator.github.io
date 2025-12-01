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
                        const row = target.closest('tr');
                        if (row) {
                            this.validateRowSum(row);
                        }
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
        const constellationTable = document.querySelector('#constellation-table');
        if (constellationTable) constellationTable.querySelectorAll('tbody tr').forEach(row => this.validateRowSum(row));
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
        inputs.forEach(input => input.classList.toggle('is-invalid', currentSum !== targetSum));
    }

    isDataValid() {
        const pityInputs = document.querySelectorAll('#pity-table input[type="number"]');
        for (const input of pityInputs) {
            if (!this.isIndividualInputValid(input)) return false;
        }

        const constRows = document.querySelectorAll('#constellation-table tbody tr');
        for (const row of constRows) {
            if (!this.isRowSumValid(row)) return false;
        }

        if (this.isRateUpOverBudget()) return false;

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

    isRowSumValid(row) {
        if (!row.dataset.targetSum) return true;
        const targetSum = parseFloat(row.dataset.targetSum);
        const inputs = row.querySelectorAll('input[type="number"]');
        let currentSum = 0;
        inputs.forEach(input => currentSum += parseFloat(input.value) || 0);
        return currentSum === targetSum;
    }

    isRateUpOverBudget() {
        const usage = this.getRateUpUsage();
        return this.availableConstellationCounts.some((avail, i) => usage[i] > avail);
    }
}