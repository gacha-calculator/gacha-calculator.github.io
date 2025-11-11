import { restorePityTable, restoreConstellationTable } from './initialize-inputs.js';

export function initializeImporter(persistence, adapterFn, validator, SELECTORS) {
    const fileInput = document.getElementById('import-file-input');
    if (!fileInput) {
        console.error("Import file input not found!");
        return;
    }
    const handleFile = (event) => handleFileSelect(event, persistence, adapterFn, validator, SELECTORS);
    
    fileInput.removeEventListener('change', fileInput.__handleFile);
    fileInput.addEventListener('change', handleFile);
    fileInput.__handleFile = handleFile;
}

async function handleFileSelect(event, persistence, adapterFN, validator, SELECTORS) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    try {
        const fileContent = await file.text();
        const parsedData = JSON.parse(fileContent);
        let standardData = null;

        if (parsedData.exportFormat === 'GachaCalculatorData') {
            standardData = parsedData;
        } else if (adapterFN) {
            standardData = adapterFN(parsedData);
        }

        if (standardData) {
            applyImportedData(standardData, SELECTORS);
            validator.validateAll();

            persistence.saveTables();
        } else {
            alert('Error: Invalid or unsupported file format.');
        }
    } catch (error) {
        console.error('File import error:', error);
    } finally {
        event.target.value = '';
    }
}

function applyImportedData(data, SELECTORS) {
    if (data.pity) {
        restorePityTable(data.pity, SELECTORS);
    }
    if (data.constellation) {
        restoreConstellationTable(data.constellation, SELECTORS);
    }
}

export function exportDataAsJson(persistence) {
    const dataToExport = {
        exportFormat: 'GachaCalculatorData',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        pity: persistence.getPityData(),
        constellation: persistence.getConstellationData()
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const timestamp = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    a.download = `gachaCalc-data-${timestamp}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Data exported successfully.');
}