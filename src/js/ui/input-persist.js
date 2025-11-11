export function setUpInputPersist(savedPersistInput = null) {
    const probInput = document.querySelector('[data-control="probability"]');
    const pullsInput = document.querySelector('[data-control="pulls"]');
    const labels = document.querySelectorAll('.mode-label');

    let persistentMode;
    if (savedPersistInput) {
        persistentMode = savedPersistInput;
    } else {
        persistentMode = 'probability';
    }
    updateActiveLabel();

    labels.forEach(label => {
        label.addEventListener('click', function () {
            persistentMode = this.getAttribute('data-target');
            updateActiveLabel();
        });
    });

    probInput.addEventListener('input', function () {
        persistentMode = 'probability';
        updateActiveLabel();
    });

    pullsInput.addEventListener('input', function () {
        persistentMode = 'pulls';
        updateActiveLabel();
    });

    function updateActiveLabel() {
        labels.forEach(label => {
            const isActive = label.getAttribute('data-target') === persistentMode;
            label.classList.toggle('active', isActive);
        });
    }
}
