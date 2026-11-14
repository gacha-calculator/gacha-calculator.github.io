export function recalcInputs(distribution) { // legacy name, actually calcs output now, not recalc
    const activeTab = document.querySelector('.mode-tab.is-active');
    const persistentState = activeTab?.dataset.target ?? 'pulls';

    if (persistentState === 'probability') {
        const probInput = parseFloat(document.querySelector('[data-control="probability"]')?.value) || 0;
        const result = findTargetPull(distribution, probInput);
        const output = document.querySelector('[data-control="probability-result"]');

        if (output) {
            output.textContent = `${result} Pulls`;
        }
    } else {
        const pullsEl = document.querySelector('.currency-grid:not([hidden]) [data-control^="pulls"]');
        const pullsInput = parseInt(pullsEl?.value, 10) || 0;
        const result = findTargetProb(distribution, pullsInput);
        const output = document.querySelector('[data-control="pulls-result"]');

        if (output) {
            output.textContent = `${result}%`;
        }
    }
}

function findTargetPull(distribution, prob) {
    if (prob === 100) {
        prob = 99.9;
    }
    let lastElement = distribution.length - 1;
    let pullNotFound = true;
    let y = 0;
    let pull = 0;

    while (pullNotFound) {
        if (distribution[lastElement][y] > (prob / 100)) {
            pull = y;
            pullNotFound = false;
        }
        y++;
    }
    return pull;
}

function findTargetProb(distribution, pull) {
    let lastElement = distribution.length - 1;
    if (distribution[lastElement].length <= pull) {
        return 100;
    }
    return Math.round(distribution[lastElement][pull] * 100);
}