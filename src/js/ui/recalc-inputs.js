export function recalcInputs(distribution) {
    const persistentState = document.querySelector('.mode-label.active').getAttribute('data-target');

    if (persistentState === 'probability') {
        document.querySelector('.input-lock-container input[data-control="pulls"]').value = findTargetPull(distribution, parseInt(document.querySelector('[data-control="probability"]').value));
    } else {
        document.querySelector('.input-lock-container input[data-control="probability"]').value = findTargetProb(distribution, parseInt(document.querySelector('[data-control="pulls"]').value));
    }
}

function findTargetPull(distribution, prob) {
    if (prob === 100) {
        prob = 99.9;
    }
    let lastElement = distribution.length - 1;
    let pullNotFound = true;
    let pull = 0;
    let y = 0;
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