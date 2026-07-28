import { gachaConfig, CONSTELLATION_MAP, CHARS_5_STAR_STANDARD, CUSTOM_CHARS_5_STAR_STANDARD, CHARS_4_STAR } from "./config.js";

export function adaptFromRngMoe(importedData, persistence) {
    if (!importedData.data || !importedData.data.profiles) {
        throw new Error("Imported data is missing key rng.moe properties.");
    }
    const data = importedData.data.profiles[1].stores[0];
    const pities = data.gachaTypes;
    const pulls = data.items;

    let standardData = persistence._load('zzz-constellations');
    if (standardData === null) { // pretty stupid that I do it here and don't just ensure this happens on fresh page
        standardData = {};
        standardData.constValues = {};
        for (let i = 0; i < CUSTOM_CHARS_5_STAR_STANDARD.length; i++) {
            let char = CUSTOM_CHARS_5_STAR_STANDARD[i].value;
            standardData.constValues[char] = 'none';
        }
        standardData.selectedChars = [];
        for (let i = 0; i < 6; i++) {
            let char = CUSTOM_CHARS_5_STAR_STANDARD[i].value;
            standardData.selectedChars.push(char);
        }
    }

    const charPity = calculatePityFromPulls(pulls, 'character', pities);
    const wepPity = calculatePityFromPulls(pulls, 'weapon', pities);

    const finalPityData = [
        { banner: 'character', ...charPity },
        { banner: 'weapon', ...wepPity }
    ];

    const finalConstellationData = aggregateConstellationCounts(pulls, data.itemAppend, standardData, persistence);

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

function aggregateConstellationCounts(pulls, extraCons, standardData, persistence) {
    const fourStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);
    const fiveStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);

    const fourStarMap = new Map();
    const fiveStarMap = new Map();

    let activeStandard = CHARS_5_STAR_STANDARD;
    if (standardData != null && standardData != undefined) {
        activeStandard = new Set(standardData.selectedChars); // all CUSTOM_CHARS_5_STAR_STANDARD
    }

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
        if (CHARS_4_STAR.has(numId)) {
            fourStarMap.set(numId, (fourStarMap.get(numId) || 0) + amount);
        } else if (CHARS_5_STAR_STANDARD.has(numId)) {
            fiveStarMap.set(numId, (fiveStarMap.get(numId) || 0) + amount);
        }
    }

    for (const value of fourStarMap.values()) {
        const maxCons = fourStarCounts.length - 1;
        if (value >= maxCons) {
            fourStarCounts[maxCons]++;
        } else {
            fourStarCounts[value]++;
        }
    }

    updateStandardCons(fiveStarMap, standardData, persistence);

    for (const [key, value] of fiveStarMap) {
        if (activeStandard.has(key)) {
            const maxCons = fiveStarCounts.length - 1;
            if (value >= maxCons) {
                fiveStarCounts[maxCons]++;
                activeStandard[key] = maxCons;
            } else {
                fiveStarCounts[value]++;
                activeStandard[key] = value;
            }
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

function getKeyByValue(value) {
    return Object.keys(CONSTELLATION_MAP).find(key => CONSTELLATION_MAP[key] === value);
}

function updateStandardCons(fiveStarMap, standardData, persistence) {
    Object.keys(standardData.constValues).forEach(key => {
        standardData.constValues[key] = 'none';
    });

    for (const [key, value] of fiveStarMap) {
        if (key in standardData.constValues) {
            standardData.constValues[key] = getKeyByValue(value);
        }
    }
    const standardsSelects = document.querySelectorAll('select[data-control^="standard-slot-"]');
    const standardTable = document.getElementById('custom-standards-panel');
    const constSelects = standardTable.querySelectorAll('select[data-control^="rate-up-slot-"]');
    updateDisplayedConst(standardData, constSelects);
    updateConstValues(standardsSelects, constSelects, standardData.constValues);

    persistence._save('zzz-constellations', standardData);
}

function updateDisplayedConst(standardData, constSelects) {
    for (let i = 0; i < constSelects.length; i++) {
        constSelects[i].value = standardData.constValues[standardData.selectedChars[i]];
    }
}

function updateConstValues(standardsSelects, constSelects, constValues) {
    for (let i = 0; i < standardsSelects.length; i++) {
        let currentStandard = standardsSelects[i].value;
        constValues[currentStandard] = constSelects[i].value
    }
}