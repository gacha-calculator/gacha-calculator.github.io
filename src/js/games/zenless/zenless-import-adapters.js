import { gachaConfig, CONSTELLATION_MAP, CHARS_5_STAR_STANDARD } from "./config.js";

export function adaptFromRngMoe(importedData) {
    if (!importedData.data || !importedData.data.profiles) {
        console.error("Imported data is missing key wuwatracker.com properties.");
        return null;
    }
    const data = importedData.data.profiles[1].stores[0];
    const pities = data.gachaTypes;
    const pulls = data.items;

    const charPity = calculatePityFromPulls(pulls, 'character', pities);
    const wepPity = calculatePityFromPulls(pulls, 'weapon', pities);

    const finalPityData = [
        { banner: 'character', ...charPity },
        { banner: 'weapon', ...wepPity }
    ];

    const finalConstellationData = aggregateConstellationCounts(pulls, data.itemAppend);

    return {
        pity: finalPityData,
        constellation: finalConstellationData
    };
}

function calculatePityFromPulls(pulls, bannerType, pities) {
    let bannerId;
    if (bannerType === 'character') {
        bannerId = 2001;
    } else {
        bannerId = 3001;
    }
    let pity5 = pities[bannerId].pity.pityS, pity4 = pities[bannerId].pity.pityA;
    let guarantee5 = false, guarantee4 = false;
    let found5Star = false, found4Star = false;

    for (let i = pulls[bannerId].length - 1; i >= 0; i--) {
        const pull = pulls[bannerId][i];

        if (pull.rarity === 4) {
            if (!found5Star) {
                guarantee5 = (pull.result === 2);
                found5Star = true;
                found4Star = true;
            }
        }

        if (pull.rarity === 3) {
            if (!found4Star) {
                guarantee5 = (pull.result === 2);
                found4Star = true;
            }
        }
        if (found5Star && found4Star) {
            break;
        }
    }
    return {
        pity4: String(pity4),
        pity5: String(pity5),
        guarantee4: guarantee4,
        guarantee5: guarantee5
    };
}

function aggregateConstellationCounts(pulls, extraCons) {
    const fourStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);
    const fiveStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);

    const fourStarMap = new Map();
    const fiveStarMap = new Map();

    for (const pull of Object.values(pulls)) {
        for (const data of pull) {
            let rarity = data.rarity; // 3 is A and 4 is S because why not
            if (rarity === 2) continue;

            const id = data.id;
            const isCharacter = id.toString().length === 4;

            if (isCharacter) {
                if (rarity === 4 && CHARS_5_STAR_STANDARD.has(id)) {
                    fiveStarMap.set(id, (fiveStarMap.get(id) || 0) + 1);
                } else if (rarity === 3) {
                    fourStarMap.set(id, (fourStarMap.get(id) || 0) + 1);
                }
            }

        }
    }

    for (const [id, amount] of Object.entries(extraCons)) {
        const numId = Number(id);
        fourStarMap.set(numId, (fourStarMap.get(numId) || 0) + amount);
    }

    for (const value of fourStarMap.values()) {
        const maxCons = fourStarCounts.length - 1;
        if (value >= maxCons) {
            fourStarCounts[maxCons]++;
        } else {
            fourStarCounts[value]++;
        }
    }

    for (const value of fiveStarMap.values()) {
        const maxCons = fiveStarCounts.length - 1;
        if (value >= maxCons) {
            fiveStarCounts[maxCons]++;
        } else {
            fiveStarCounts[value]++;
        }
    }

    const totalPossibleFourStars = gachaConfig.poolCharSR;
    const totalPossibleFiveStars = gachaConfig.poolStandardCharSSR;

    const notOwnedFourStars = totalPossibleFourStars - fourStarMap.size;
    const notOwnedFiveStars = totalPossibleFiveStars - fiveStarMap.size;

    fourStarCounts[0] = Math.max(0, notOwnedFourStars);
    fiveStarCounts[0] = Math.max(0, notOwnedFiveStars);

    return {
        0: fiveStarCounts.map(String),
        1: fourStarCounts.map(String)
    };
}