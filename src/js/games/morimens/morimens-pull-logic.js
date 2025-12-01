const PRUNE_LEVEL = 1e-10;

export function rankUpSSRCheap(distributionSSR, ODDS_SSR, pityChar) {
    const lastActive = distributionSSR.length - 2;

    for (let wins = lastActive; wins >= 0; wins--) {
        const currentArray = distributionSSR[wins];
        const winIndex = 0;
        if (!currentArray.isEmpty) {
            handleSSRCheap(ODDS_SSR, wins, distributionSSR, pityChar, currentArray.type, winIndex);
        }
    }
}

export function handleSSRCheap(odds, inputIndex, array, pity, type, winIndex) {
    const size = array[inputIndex].states.length;
    let rateUpOdds = 1/3;
    if (type === 'char') {
        const currentStates = array[inputIndex].states;
        const nextStates = array[inputIndex + 1].states;
        for (let i = size - 1; i >= 0; i--) {
            const currentState = currentStates[i];
            let guaranteeLevel = 0;
            if (i >= pity * 2) {
                guaranteeLevel = 2;
            } else if (i >= pity) {
                guaranteeLevel = 1;
            }
            const currentOdds = odds[i - pity * guaranteeLevel];

            const winProb = currentState * currentOdds;
            const lossProb = currentState - winProb;

            let probabilityWin = winProb;
            if (probabilityWin > PRUNE_LEVEL) {
                if (guaranteeLevel != 2) {
                    probabilityWin *= rateUpOdds;
                }
                nextStates[winIndex] += probabilityWin;
            }
            if (guaranteeLevel === 0) {
                let probabilityLossRateUp = winProb * (1 - rateUpOdds);
                if (probabilityLossRateUp > PRUNE_LEVEL) {
                    currentStates[pity] += probabilityLossRateUp;
                }
            } else if (guaranteeLevel === 1) {
                let probabilityLossRateUp = winProb * (1 - rateUpOdds);
                if (probabilityLossRateUp > PRUNE_LEVEL) {
                    currentStates[pity * 2] += probabilityLossRateUp;
                }
            }
            let probabilityLossSSR = lossProb;
            if (probabilityLossSSR > PRUNE_LEVEL) {
                currentStates[i + 1] += probabilityLossSSR;
            }
            currentStates[i] = 0;
        }
    } else if (type === 'wep') {
        const currentStates = array[inputIndex].states;
        const nextStates = array[inputIndex + 1].states;
        for (let i = size - 1; i >= 0; i--) {
            const currentState = currentStates[i];
            const isGuaranteed = i >= pity;
            const currentOdds = odds[i - pity * isGuaranteed];

            const winProb = currentState * currentOdds;
            const lossProb = currentState - winProb;

            let probabilityWin = winProb;
            if (probabilityWin > PRUNE_LEVEL) {
                if (!isGuaranteed) {
                    probabilityWin *= rateUpOdds;
                }
                nextStates[winIndex] += probabilityWin;
            }
            if (!isGuaranteed) {
                let probabilityLossRateUp = winProb * (1 - rateUpOdds);
                if (probabilityLossRateUp > PRUNE_LEVEL) {
                    currentStates[pity] += probabilityLossRateUp;
                }
            }
            let probabilityLossSSR = lossProb;
            if (probabilityLossSSR > PRUNE_LEVEL) {
                currentStates[i + 1] += probabilityLossSSR;
            }
            currentStates[i] = 0;
        }
    }
}   