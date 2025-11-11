export function calculateProbability(rateUpGroups, constellationCounts) {
    for (const rateUpGroup of rateUpGroups) {
        // Extract required constellation counts for this rate-up group
        const requiredConstellations = getRequiredConstellations(rateUpGroup.rateUps);

        // Check if this combination is possible
        if (!isCombinationPossible(requiredConstellations, constellationCounts)) {
            rateUpGroup.probability = 0;
            continue;
        }

        // Calculate probability components
        const validCombinations = calculateValidCombinations(requiredConstellations, constellationCounts);
        const totalPossibleCombinations = calculateTotalCombinations(rateUpGroups, constellationCounts);

        rateUpGroup.probability = totalPossibleCombinations === 0
            ? 0
            : validCombinations / totalPossibleCombinations;
    }
}

function getRequiredConstellations(rateUpRequirements) {
    const requirements = {};
    for (let constellationIndex = 0; constellationIndex < rateUpRequirements.length; constellationIndex++) {
        const requiredCount = rateUpRequirements[constellationIndex];
        if (requiredCount > 0) {
            requirements[constellationIndex] = requiredCount;
        }
    }
    return requirements;
}

function isCombinationPossible(requiredConstellations, availableConstellations) {
    return Object.entries(requiredConstellations).every(([constellationIndex, requiredCount]) => {
        return availableConstellations[constellationIndex] >= requiredCount;
    });
}

function calculateValidCombinations(requiredConstellations, availableConstellations) {
    return Object.entries(requiredConstellations).reduce((total, [constellationIndex, requiredCount]) => {
        return total * binomialCoefficient(availableConstellations[constellationIndex], requiredCount);
    }, 1);
}

function calculateTotalCombinations(rateUpGroups, availableConstellations) {
    return rateUpGroups.reduce((total, group) => {
        const groupRequirements = getRequiredConstellations(group.rateUps);
        const groupCombinations = calculateValidCombinations(groupRequirements, availableConstellations);
        return total + groupCombinations;
    }, 0);
}

function binomialCoefficient(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    k = Math.min(k, n - k); // Symmetrical so can do less
    let result = 1;
    for (let i = 1; i <= k; i++) {
        result *= (n - k + i) / i;
    }
    return result;
}

export function binomialDistribution(n, probability) {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error("Number of trials (n) must be a non-negative integer.");
    }
    if (typeof probability !== "number" || probability < 0 || probability > 1) {
        throw new Error("Probability of success (probability) must be a number between 0 and 1 inclusive.");
    }

    let successCount = 0;
    let probabilityOfSuccess = 0;
    let distribution = [];
    let binomialCoefficient = 1;

    while (successCount <= n) {
        probabilityOfSuccess = binomialCoefficient * Math.pow(probability, successCount) * Math.pow(1 - probability, n - successCount);
        distribution.push(probabilityOfSuccess);
        successCount++;
        binomialCoefficient = binomialCoefficient * (n + 1 - successCount) / successCount;
    }

    return distribution;
}