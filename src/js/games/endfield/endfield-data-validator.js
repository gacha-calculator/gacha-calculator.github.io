export class DataValidator {
    constructor() {
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

            input.addEventListener('keydown', (event) => {
                if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                    return;
                }

                if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
                    return;
                }

                if (!/^\d$/.test(event.key)) {
                    event.preventDefault();
                }
            });

            input.addEventListener('paste', (event) => {
                const pasteData = (event.clipboardData || window.clipboardData).getData('text');

                if (!/^\d+$/.test(pasteData)) {
                    event.preventDefault();
                }
            });

            input.addEventListener('drop', (event) => {
                event.preventDefault();
            });
        });


        this.isInitialized = true;
    }

    validateAll() {
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        const constellationTable = document.querySelector('#constellation-table');
        if (constellationTable) constellationTable.querySelectorAll('tbody tr').forEach(row => this.validateRowSum(row));
    }

    validateRowSum(row) {
        if (!row.dataset.targetSum) return;
        const targetSum = parseFloat(row.dataset.targetSum);
        const input = row.querySelector('input[type="number"]');
        let currentSum = parseFloat(input.value) || 0;
        if (targetSum < currentSum) {
            input.value = targetSum; // instead of validation I am now correcting because people read bad
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
        }

        return true;
    }

    isIndividualInputValid(input) {
        if (input.value === '' || /^\d+$/.test(input.value)) {
            const value = parseInt(input.value, 10);
            if (value === NaN) {
                input.value = 0;
            }
            const min = parseInt(input.min, 10);
            const max = parseInt(input.max, 10);
            return (!input.hasAttribute('min') || value >= min) && (!input.hasAttribute('max') || value <= max);
        }
        return false;
    }
}