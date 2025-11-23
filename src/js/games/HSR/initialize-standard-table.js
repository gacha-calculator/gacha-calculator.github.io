export function initializeStandardTable(CUSTOM_CHARS_5_STAR_STANDARD, CONSTELLATION_OPTIONS, persistence) {
    const standardsSelects = document.querySelectorAll('select[data-control^="standard-slot-"]');
    const standardTable = document.getElementById('custom-standards-panel');
    const constSelects = standardTable.querySelectorAll('select[data-control^="rate-up-slot-"]');
    if (standardsSelects.length === 0) return;

    let standardData = persistence._load('hsr-constellations');
    if (standardData === null) {
        standardData = {};
        standardData.constValues = {};
        for (let i = 0; i < CUSTOM_CHARS_5_STAR_STANDARD.length; i++) {
            let char = CUSTOM_CHARS_5_STAR_STANDARD[i].value;
            standardData.constValues[char] = 'none';
        }
        standardData.selectedChars = [];
        for (let i = 0; i < 7; i++) {
            let char = CUSTOM_CHARS_5_STAR_STANDARD[i].value;
            standardData.selectedChars.push(char);
        }
    }

    const ALL_OPTIONS = [...CUSTOM_CHARS_5_STAR_STANDARD];
    let currentSelections = findCurrentSelection(ALL_OPTIONS, standardData);

    function updateAllSelects() {
        const takenValues = new Set(currentSelections.map(c => c.value));
        standardsSelects.forEach((select, i) => {
            const currentValue = standardData.selectedChars[i];
            const optionsHTML = ALL_OPTIONS
                .filter(opt => !takenValues.has(opt.value) || opt.value === currentValue)
                .map(opt => `<option value="${opt.value}">${opt.text}</option>`)
                .join('');
            select.innerHTML = optionsHTML;
            select.value = currentValue;
        });
    }

    updateAllSelects();

    standardsSelects.forEach((select, i) => {
        select.addEventListener('change', () => {
            const newValue = select.value;
            const newOption = ALL_OPTIONS.find(opt => opt.value === newValue);
            if (newOption) {
                currentSelections[i] = { ...newOption }; // clone to avoid reference issues
                updateSelectedChars(standardsSelects, standardData.selectedChars);
                persistence._save('hsr-constellations', standardData);
                updateAllSelects();
                updateDisplayedConst(constSelects, standardData);
                updateConstellationTable(standardsSelects, standardData.constValues);
            }
        });
    });

    if (constSelects.length === 0) {
        return;
    }

    const optionsWithoutUnknown = CONSTELLATION_OPTIONS.slice(1, -1);
    const optionsHTML = optionsWithoutUnknown.map(opt =>
        `<option value="${opt.value}">${opt.text}</option>`
    ).join('');

    constSelects.forEach(select => {
        select.innerHTML = optionsHTML;
        select.value = 'none';

        select.addEventListener('change', () => {
            updateConstValues(standardsSelects, constSelects, standardData.constValues);
            updateSelectedChars(standardsSelects, standardData.selectedChars);
            persistence._save('hsr-constellations', standardData);
            updateConstellationTable(standardsSelects, standardData.constValues);
        });
    });
    updateDisplayedConst(constSelects, standardData);
}

function findCurrentSelection(ALL_OPTIONS, standardData) {
    const currentSelections = [];
    for (const option of ALL_OPTIONS) {
        if(standardData.selectedChars.includes(option.value)) {
            currentSelections.push(option);
        }
    }
    return currentSelections;
}

function updateDisplayedConst(constSelects, standardData) {
    for (let i = 0; i < constSelects.length; i++) {
        constSelects[i].value = standardData.constValues[standardData.selectedChars[i]];
    }
}

function updateSelectedChars(standardsSelects, selectedChars) {
    for (let i = 0; i < standardsSelects.length; i++) {
        selectedChars[i] = standardsSelects[i].value
    }
}

function updateConstValues(standardsSelects, constSelects, constValues) {
    for (let i = 0; i < standardsSelects.length; i++) {
        let currentStandard = standardsSelects[i].value;
        constValues[currentStandard] = constSelects[i].value
    }
}

function updateConstellationTable(standardsSelects, constValues) {
    const constTable = document.querySelector('[data-validation-type="row-sum"]');
    const inputCells = constTable.querySelectorAll('input.custom-input');
    const newConsValues = new Array(8).fill(0);
    const constMap = {
        'none': 0,
        'e0': 1,
        'e1': 2,
        'e2': 3,
        'e3': 4,
        'e4': 5,
        'e5': 6,
        'e6': 7
    }

    for (let i = 0; i < standardsSelects.length; i++) {
        let activeStandard = standardsSelects[i].value;
        let constValue = constValues[activeStandard];
        let constIndex = constMap[constValue];
        newConsValues[constIndex]++;
    }

    for (let i = 0; i < inputCells.length; i++) { // skip first because it's just a 5* string
        inputCells[i].value = newConsValues[i];
    }
}