export class IterativeSolver {
    constructor(initialState, totalItems, problemConfig) {
        this.initialState = [...initialState];
        this.totalItems = totalItems;
        this.config = problemConfig;
        this.maxType = problemConfig.maxType;
        this.nTypes = initialState.length;

        // Points array for quick lookup
        this.points = Array(this.nTypes).fill(0);
        for (let i = 1; i < this.maxType; i++) {
            this.points[i] = problemConfig.regularPoints;
        }
        this.points[this.maxType] = problemConfig.specialPoints;

        // Initialize state
        this.reset();
    }

    reset() {
        this.expected = [...this.initialState];
        this.mean = 0;
        this.secondMoment = 0;
        this.variance = 0;

        // State second moments matrix
        this.stateSecondMoments = Array(this.nTypes).fill(0).map(
            () => Array(this.nTypes).fill(0)
        );
        for (let i = 0; i < this.nTypes; i++) {
            for (let j = 0; j < this.nTypes; j++) {
                this.stateSecondMoments[i][j] = this.initialState[i] * this.initialState[j];
            }
        }

        // Point-state cross moments
        this.pointStateCrossMoments = Array(this.nTypes).fill(0);

        // Store results as objects in an array
        this.results = [{ mean: 0, variance: 0 }]; // Step 0
        this.step = 0;
    }

    computeStep() {
        const n = this.totalItems;
        this.step++;

        // Calculate step moments
        let stepMean = 0;
        let stepSecondMoment = 0;
        for (let type = 0; type < this.nTypes; type++) {
            const prob = this.expected[type] / n;
            stepMean += this.points[type] * prob;
            stepSecondMoment += this.points[type] ** 2 * prob;
        }

        // Covariance between total points and current step
        let cov_T_X = 0;
        for (let type = 0; type < this.nTypes; type++) {
            cov_T_X += this.points[type] * this.pointStateCrossMoments[type];
        }
        cov_T_X /= n;

        // Update total moments
        const newSecondMoment = this.secondMoment + 2 * cov_T_X + stepSecondMoment;
        const newMean = this.mean + stepMean;
        const newVariance = newSecondMoment - newMean ** 2;

        // Store results as an object
        this.results.push({ mean: newMean, variance: newVariance });

        // Update state for next iteration
        this.updateState();

        // Update current moments
        this.secondMoment = newSecondMoment;
        this.mean = newMean;
        this.variance = newVariance;

        return {
            mean: newMean,
            variance: newVariance,
            step: this.step
        };
    }

    updateState() {
        const n = this.totalItems;
        const newExpected = Array(this.nTypes).fill(0);

        // Update expected counts
        for (let i = 0; i < this.maxType; i++) {
            newExpected[i] = this.expected[i] * (n - 1) / n;
        }
        newExpected[this.maxType] = this.expected[this.maxType];
        for (let i = 0; i < this.maxType; i++) {
            newExpected[i + 1] += this.expected[i] / n;
        }

        // Update state second moments
        const newStateSecondMoments = Array(this.nTypes).fill(0).map(
            () => Array(this.nTypes).fill(0)
        );

        // Copy current moments
        for (let i = 0; i < this.nTypes; i++) {
            for (let j = 0; j < this.nTypes; j++) {
                newStateSecondMoments[i][j] = this.stateSecondMoments[i][j];
            }
        }

        // Apply transitions
        for (let k = 0; k < this.maxType; k++) {
            const delta = Array(this.nTypes).fill(0);
            delta[k] = -1;
            delta[k + 1] = 1;

            for (let i = 0; i < this.nTypes; i++) {
                for (let j = 0; j < this.nTypes; j++) {
                    newStateSecondMoments[i][j] += (1 / n) * (
                        delta[i] * this.stateSecondMoments[k][j] +
                        delta[j] * this.stateSecondMoments[i][k] +
                        delta[i] * delta[j] * this.expected[k]
                    );
                }
            }
        }

        // Update point-state cross moments
        const newPointStateCrossMoments = Array(this.nTypes).fill(0);
        for (let i = 0; i < this.nTypes; i++) {
            let term = this.pointStateCrossMoments[i];

            // Terms from T_old interactions
            if (i < this.maxType) term -= this.pointStateCrossMoments[i] / n;
            if (i >= 1) term += this.pointStateCrossMoments[i - 1] / n;

            // Terms from current step interactions
            let currentStepTerm = 0;
            for (let k = 0; k < this.nTypes; k++) {
                currentStepTerm += this.points[k] * this.stateSecondMoments[i][k];
            }
            term += currentStepTerm / n;

            // Correction terms
            if (i < this.maxType) term -= this.points[i] * this.expected[i] / n;
            if (i >= 1) term += this.points[i - 1] * this.expected[i - 1] / n;

            newPointStateCrossMoments[i] = term;
        }

        // Update state for next iteration
        this.expected = newExpected;
        this.stateSecondMoments = newStateSecondMoments;
        this.pointStateCrossMoments = newPointStateCrossMoments;
    }

    runSteps(n) {
        this.reset();
        for (let i = 0; i < n; i++) {
            this.computeStep();
        }
        return this.results; // Array of { mean, variance } objects
    }
}