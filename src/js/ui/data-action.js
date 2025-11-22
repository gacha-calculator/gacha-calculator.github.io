import { restorePityTable, restoreConstellationTable } from './initialize-inputs.js';
import { restorePityTable as R1999restorePityTable, restoreConstellationTable as R1999restoreConstellationTable } from '../games/R1999/R1999-initialize-inputs.js';

export function initializeImporter(persistence, adapterFn, validator, SELECTORS, chibi) {
    const fileInput = document.getElementById('import-file-input');
    if (!fileInput) {
        console.error("Import file input not found!");
        return;
    }
    const handleFile = (event) => handleFileSelect(event, persistence, adapterFn, validator, SELECTORS, chibi);

    fileInput.removeEventListener('change', fileInput.__handleFile);
    fileInput.addEventListener('change', handleFile);
    fileInput.__handleFile = handleFile;
}

async function handleFileSelect(event, persistence, adapterFN, validator, SELECTORS, chibi) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    try {
        let parsedData;
        let standardData = null;
        const fileContent = await file.text();
        if (file.type === 'application/json') {
            parsedData = JSON.parse(fileContent);
            if (parsedData.exportFormat === 'GachaCalculatorData') {
                standardData = parsedData;
            } else if (adapterFN) {
                standardData = adapterFN(parsedData);
            }
        } else if (file.type === 'text/csv') { // only hsr so far
            standardData = adapterFN(fileContent, persistence);
        } else {
            alert('Error: Invalid or unsupported file format.');
        }

        if (standardData) {
            applyImportedData(standardData, SELECTORS);
            validator.validateAll();

            persistence.saveTables();
        }
    } catch (error) {
        chibi.showError('Something\'s wrong with the file you tried to use');
        console.error('File import error:', error);
    } finally {
        event.  target.value = '';
    }
}

function applyImportedData(data, SELECTORS) {
    if (data.game === 'reverse') {
        if (data.pity) {
            R1999restorePityTable(data.pity, SELECTORS);
        }
        if (data.constellation) {
            R1999restoreConstellationTable(data.constellation, SELECTORS);
        }
    } else {
        if (data.pity) {
            restorePityTable(data.pity, SELECTORS);
        }
        if (data.constellation) {
            restoreConstellationTable(data.constellation, SELECTORS);
        }
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