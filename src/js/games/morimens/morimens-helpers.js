export function checkIsEmpty(distribution) {
    let distrIsEmpty = true;
    for (let i = 0; i < distribution.length - 1; i++) {
        let isEmpty = true;
        for (const pityState of distribution[i].states) {
            if (pityState > 0) {
                isEmpty = false;
                distrIsEmpty = false;
            }
        }
        distribution[i].isEmpty = isEmpty;
    }
    
    return distrIsEmpty;
}