export function initializePullPlanManager(pathsConfig, savedData = null) {
    const manager = new PullPlanManager(pathsConfig, savedData);
    manager.initialize();
    return manager;
}

export function initializePullPlanManagerWithPity(pathsConfig, savedData = null) {
    const manager = new PullPlanManagerWithPity(pathsConfig, savedData);
    return manager.initialize();
}

class PullPlanManager {
    constructor(pathsConfig, savedData = null) {
        this.pathsConfig = pathsConfig;
        this.savedData = savedData;
        this.groupColorMap = new Map();
        this.rowsContainer = document.querySelector('.rows-container');
        this.addButton = document.getElementById('add-btn');

        this.COLORS = {
            UNIQUE_GROUP: '#f0f0f0',
            PRESET_HUES: [0, 120, 240, 60, 180, 300]
        };
    }

    initialize() {
        this.rowsContainer.innerHTML = '';

        if (this.savedData && this.savedData.pullPlan) {
            this.savedData.pullPlan.forEach(rowData => {
                this.rowsContainer.appendChild(this.createRow(null, rowData));
            });
        } else {
            this.rowsContainer.appendChild(this.createRow());
        }

        this.addButton.addEventListener('click', () => {
            this.rowsContainer.appendChild(this.createRow());
        });
    }

    createRow(inheritFrom = null, savedData = null) {
        const row = this.createRowElement();
        this.setupRowEvents(row);
        this.initializeRowData(row, inheritFrom, savedData);
        return row;
    }

    createRowElement() {
        const template = document.getElementById('row-template');
        const clone = template.content.cloneNode(true);
        return clone.querySelector('.row');
    }

    setupRowEvents(row) {
        const dropdown = row.querySelector('.dropdown');
        const typeSelector = row.querySelector('.type-selector');

        // Single dropdown handler
        this.setupDropdownHandler(row, dropdown, typeSelector);
        this.setupTypeChangeHandler(row, typeSelector);
        this.setupGoalChangeChecker(row);
        this.setupButtonHandlers(row);
    }

    setupDropdownHandler(row, dropdown, typeSelector) {
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('dropdown--open');
        });

        // Single item click handler
        row.querySelectorAll('.dropdown__item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                typeSelector.value = item.dataset.value;
                typeSelector.dispatchEvent(new Event('change'));
                dropdown.classList.remove('dropdown--open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('dropdown--open');
            }
        });
    }

    setupTypeChangeHandler(row, typeSelector) {
        typeSelector.addEventListener('change', () => {
            const selectedOption = typeSelector.options[typeSelector.selectedIndex];
            const typeIcon = row.querySelector('.type-icon');
            const typeText = row.querySelector('.type-text');

            typeIcon.src = selectedOption.dataset.icon;
            typeText.textContent = selectedOption.textContent;

            this.updatePathSelector(row, typeSelector.value);
            this.handleTypeChangeGroupUpdate(row, typeSelector.value);
        });
    }

    setupGoalChangeChecker(row) {
        const firstSelect = row.querySelector('.first-select');
        const secondSelect = row.querySelector('.second-select');

        firstSelect.addEventListener('change', () => {
            const allOptions = [];
            for (let option of firstSelect) {
                allOptions.push(option.value);
            }
            allOptions.push(secondSelect[secondSelect.length - 1].value);

            const firstSelectValue = firstSelect.value;
            const secondSelectValue = secondSelect.value;
            const firstSelectValueIndex = allOptions.indexOf(firstSelectValue);
            const secondSelectValueIndex = allOptions.indexOf(secondSelectValue);

            if (firstSelectValueIndex >= secondSelectValueIndex) {
                secondSelect.value = allOptions[firstSelectValueIndex + 1];
            }
        });

        secondSelect.addEventListener('change', () => {
            const allOptions = [];
            for (let option of firstSelect) {
                allOptions.push(option.value);
            }
            allOptions.push(secondSelect[secondSelect.length - 1].value);

            const firstSelectValue = firstSelect.value;
            const secondSelectValue = secondSelect.value;
            const firstSelectValueIndex = allOptions.indexOf(firstSelectValue);
            const secondSelectValueIndex = allOptions.indexOf(secondSelectValue);

            if (firstSelectValueIndex >= secondSelectValueIndex) {
                firstSelect.value = allOptions[secondSelectValueIndex - 1];
            }
        });
    }

    handleTypeChangeGroupUpdate(row, newType) {
        // Only convert to unique group if currently in a numbered group
        const currentGroup = row.dataset.group;
        if (currentGroup && !currentGroup.startsWith('unique')) {
            row.dataset.group = `unique${newType.charAt(0).toUpperCase() + newType.slice(1)}`;
            row.style.setProperty('--group-color', this.COLORS.UNIQUE_GROUP);
        }
    }

    setupButtonHandlers(row) {
        row.querySelector('.btn--chainAdd').addEventListener('click', () => {
            this.rowsContainer.appendChild(this.createRow(row));
        });

        row.querySelector('.btn--delete').addEventListener('click', () => {
            this.handleRowDeletion(row);
        });
    }

    handleRowDeletion(row) {
        const currentGroup = row.dataset.group;
        if (currentGroup && !currentGroup.startsWith('unique')) {
            const sameGroupRows = Array.from(this.rowsContainer.querySelectorAll('.row'))
                .filter(r => r.dataset.group === currentGroup);

            if (sameGroupRows.length === 1) {
                this.groupColorMap.delete(currentGroup);
            }
        }
        row.remove();
    }

    initializeRowData(row, inheritFrom, savedData) {
        if (savedData) {
            this.initializeFromSavedData(row, savedData);
        } else if (inheritFrom) {
            this.initializeFromParent(row, inheritFrom);
        } else {
            this.initializeNewRow(row);
        }
    }

    initializeFromSavedData(row, savedData) {
        const typeSelector = row.querySelector('.type-selector');
        typeSelector.value = savedData.type || 'char';
        this.updateVisualType(row, typeSelector.value);

        this.setGroupAndColor(row, savedData.group);
        this.updatePathSelector(row, typeSelector.value, savedData.from, savedData.to);
    }

    initializeFromParent(row, parentRow) {
        const parentGroup = parentRow.dataset.group;
        const parentType = parentRow.querySelector('.type-selector').value;
        const parentToValue = parentRow.querySelector('.second-select').value;
        const typeSelector = row.querySelector('.type-selector');

        typeSelector.value = parentType;
        this.updateVisualType(row, parentType);

        if (parentGroup.startsWith('unique')) {
            this.convertToNewGroup(parentRow, row);
        } else {
            this.inheritExistingGroup(row, parentGroup);
        }

        this.updatePathSelector(row, parentType, parentToValue);
    }

    convertToNewGroup(parentRow, childRow) {
        const newGroupId = this.generateNewGroupId();
        const hue = this.getHueForGroup(newGroupId);

        [parentRow, childRow].forEach(r => {
            r.dataset.group = newGroupId;
            r.style.setProperty('--group-color', `hsl(${hue}, 80%, 70%)`);
        });

        this.groupColorMap.set(newGroupId, hue);
    }

    inheritExistingGroup(row, parentGroup) {
        row.dataset.group = parentGroup;
        const hue = this.groupColorMap.get(parentGroup);
        if (hue !== undefined) {
            row.style.setProperty('--group-color', `hsl(${hue}, 80%, 70%)`);
        }
    }

    initializeNewRow(row) {
        const typeSelector = row.querySelector('.type-selector');
        const initialType = typeSelector.value;
        row.dataset.group = `unique${initialType.charAt(0).toUpperCase() + initialType.slice(1)}`;
        row.style.setProperty('--group-color', this.COLORS.UNIQUE_GROUP);
        this.updatePathSelector(row, initialType);
    }

    updateVisualType(row, type) {
        const typeSelector = row.querySelector('.type-selector');
        const selectedOption = typeSelector.options[typeSelector.selectedIndex];
        const typeIcon = row.querySelector('.type-icon');
        const typeText = row.querySelector('.type-text');

        typeIcon.src = selectedOption.dataset.icon;
        typeText.textContent = selectedOption.textContent;
    }

    updatePathSelector(row, type, fromValue = null, toValue = null) {
        const firstSelect = row.querySelector('.first-select');
        const secondSelect = row.querySelector('.second-select');
        const paths = this.pathsConfig[type] || this.pathsConfig.char;

        this.populateSelect(firstSelect, paths.slice(0, -1));
        this.populateSelect(secondSelect, paths.slice(1));

        this.setInitialPathValues(firstSelect, secondSelect, paths, fromValue, toValue);
    }

    populateSelect(select, options) {
        select.innerHTML = '';
        options.forEach(path => {
            const option = document.createElement('option');
            option.value = path;
            option.textContent = path;
            select.appendChild(option);
        });
    }

    setInitialPathValues(firstSelect, secondSelect, paths, fromValue, toValue) {
        if (fromValue && paths.includes(fromValue)) {
            firstSelect.value = fromValue;
            const fromIndex = paths.indexOf(fromValue);
            secondSelect.value = toValue && paths.includes(toValue) && paths.indexOf(toValue) > fromIndex
                ? toValue
                : paths[Math.min(fromIndex + 1, paths.length - 1)];
        } else {
            firstSelect.value = paths[0];
            secondSelect.value = paths[1];
        }
    }

    generateNewGroupId() {
        const usedNumbers = Array.from(this.groupColorMap.keys())
            .map(groupId => parseInt(groupId.replace(/\D/g, '')))
            .filter(num => !isNaN(num))
            .sort((a, b) => a - b);

        for (let i = 1; i <= usedNumbers.length + 1; i++) {
            if (!usedNumbers.includes(i)) {
                return `group${i}`;
            }
        }
        return `group${usedNumbers.length + 1}`;
    }

    getHueForGroup(groupId) {
        const num = parseInt(groupId.replace(/\D/g, ''));
        if (num <= this.COLORS.PRESET_HUES.length) {
            return this.COLORS.PRESET_HUES[num - 1];
        }
        return (num * 137.5) % 360;
    }

    setGroupAndColor(row, groupId) {
        row.dataset.group = groupId;

        if (groupId.startsWith('unique')) {
            row.style.setProperty('--group-color', this.COLORS.UNIQUE_GROUP);
        } else {
            let hue = this.groupColorMap.get(groupId);
            if (hue === undefined) {
                const num = parseInt(groupId.replace(/\D/g, ''));
                hue = this.getHueForGroup(groupId);
                this.groupColorMap.set(groupId, hue);
            }
            row.style.setProperty('--group-color', `hsl(${hue}, 80%, 70%)`);
        }
    }

    // Add method to get current state for saving
    getState() {
        const rows = Array.from(this.rowsContainer.querySelectorAll('.row'));
        return rows.map(row => ({
            type: row.querySelector('.type-selector').value,
            from: row.querySelector('.first-select').value,
            to: row.querySelector('.second-select').value,
            group: row.dataset.group
        }));
    }
}

class PullPlanManagerWithPity extends PullPlanManager {
    constructor(pathsConfig, savedData = null) {
        super(pathsConfig, savedData || null);
    }

    initialize() {
        this.rowsContainer.innerHTML = '';

        if (this.savedData && this.savedData.pullPlan) {
            this.savedData.pullPlan.forEach((rowData, index) => {
                const extendedRowData = {
                    ...rowData,
                    pity: this.savedData.pity4?.[index] || 0,
                    guarantee: this.savedData.guarantee4?.[index] || false
                };
                this.rowsContainer.appendChild(this.createRow(null, extendedRowData));
            });
        } else {
            this.rowsContainer.appendChild(this.createRow());
        }

        this.addButton.addEventListener('click', () => {
            this.rowsContainer.appendChild(this.createRow());
        });

        return this;
    }

    createRow(inheritFrom = null, savedData = null) {
        const row = super.createRow(inheritFrom, savedData);
        this.addPityGuaranteeToRow(row, savedData);
        return row;
    }

    addPityGuaranteeToRow(row, savedData) {
        const pityInput = row.querySelector('[data-control="pity-4"]');
        const guaranteeInput = row.querySelector('.guarantee-4');

        if (savedData) {
            if (pityInput && savedData.pity !== undefined) pityInput.value = savedData.pity;
            if (guaranteeInput && savedData.guarantee !== undefined) guaranteeInput.checked = savedData.guarantee;
        }
        pityInput.addEventListener('input', function () {
            let value = this.value;

            if (value.length > 1 && value.startsWith('0')) {
                this.value = value.replace(/^0+/, '');
                if (this.value === '') this.value = '0';
            }

            let numValue = parseInt(this.value) || 0;
            if (numValue > 10) {
                this.value = 10;
                errorAnimation(this);
            } else if (numValue < 0) {
                this.value = 0;
                errorAnimation(this);
            }
        })
    }
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