import { gachaConfig, CONSTELLATION_MAP, CHARS_5_STAR_STANDARD, CUSTOM_CHARS_5_STAR_STANDARD, WEP_5_STAR_STANDARD, charRateUpsPerBanner, wepRateUpsPerBanner } from "./config.js";

export function adaptFromStarRailStation(importedData, persistence) {
    // Split into lines
    const lines = importedData.trim().split('\n');

    if (lines[0] != 'uid,id,rarity,time,banner,type,manual') {
        throw new Error("Imported data is missing key starrailstation.com properties.");
    }

    const standardData = persistence._load('hsr-constellations');

    const charPity = calculatePityFromPulls(lines, 'character', standardData);
    const wepPity = calculatePityFromPulls(lines, 'weapon');

    const finalPityData = [
        { banner: 'character', ...charPity },
        { banner: 'weapon', ...wepPity }
    ];

    const finalConstellationData = aggregateConstellationCounts(lines, standardData);

    return {
        pity: finalPityData,
        constellation: finalConstellationData
    };
}

function calculatePityFromPulls(lines, bannerType, standardData) {
    let pity5 = 0, pity4 = 0;
    let guarantee5 = false, guarantee4 = false;
    let found5Star = false, found4Star = false;

    const dataLines = lines.slice(1);
    for (let i = dataLines.length - 1; i >= 0; i--) { // 1 id, 2 rarity, 4 bannerId, 5 bannner type(11 char, 12 wep)
        const line = dataLines[i];
        const parts = line.split(',');

        const itemId = parts[1];
        const rarity = parts[2];
        const bannerId = parts[4];
        const bannerTypeId = parts[5];
        let targetBanner;

        if (bannerType === 'character') {
            targetBanner = '11';
        } else {
            targetBanner = '12';
        }

        if (bannerTypeId === targetBanner) {
            if (rarity === '5') {
                if (!found5Star) {
                    guarantee5 = isGuarantee(itemId, rarity, bannerType, bannerId, standardData);
                }
                if (!found4Star) {
                    pity4++;
                }
                found5Star = true;
            } else if (rarity === '4') {
                if (!found5Star) {
                    pity5++;
                }
                if (!found4Star) {
                    guarantee4 = isGuarantee(itemId, rarity, bannerType, bannerId);
                }
                found4Star = true;
            } else if (rarity === '3') {
                if (!found5Star) {
                    pity5++;
                }
                if (!found4Star) {
                    pity4++;
                }
            } else {
                console.error("Unknown rarity");
            }

            if (found5Star && found4Star) {
                break;
            }
        }
    }

    return {
        pity4: String(pity4),
        pity5: String(pity5),
        guarantee4: guarantee4,
        guarantee5: guarantee5
    };
}

function isGuarantee(itemId, rarity, bannerType, bannerId, standardData) {
    let isGuarantee = false;
    if (rarity === '5') {
        if (bannerType === 'character') {
            let activeStandard = CHARS_5_STAR_STANDARD;
            if (standardData != null && standardData != undefined) {
                activeStandard = new Set(standardData.selectedChars); // all CUSTOM_CHARS_5_STAR_STANDARD
            }
            isGuarantee = activeStandard.has(itemId); // if last 5* is standard then it's guaranteed
        } else {
            isGuarantee = WEP_5_STAR_STANDARD.has(itemId);
        }
    } else {
        if (bannerType === 'character') {
            isGuarantee = !charRateUpsPerBanner[bannerId].has(itemId);
        } else {
            isGuarantee = !wepRateUpsPerBanner[bannerId].has(itemId);
        }
    }

    return isGuarantee;
}

function aggregateConstellationCounts(lines, standardData) {
    const fourStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);
    const fiveStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);

    const fourStarMap = new Map();
    const fiveStarMap = new Map();

    let activeStandard = CHARS_5_STAR_STANDARD;
    if (standardData != null && standardData != undefined) {
        activeStandard = new Set(standardData.selectedChars); // all CUSTOM_CHARS_5_STAR_STANDARD
    }

    lines.slice(1).map(line => {
        const parts = line.split(',');
        const isCharacter = parts[1].length === 4;
        const rarity = parts[2];
        const id = parts[1];

        if (isCharacter) {
            const isStandard = CUSTOM_CHARS_5_STAR_STANDARD.some(char => char.value === id);
            if (rarity === '5' && isStandard) {
                fiveStarMap.set(id, (fiveStarMap.get(id) || 0) + 1);
            } else if (rarity === '4') {
                fourStarMap.set(id, (fourStarMap.get(id) || 0) + 1);
            }
        }
    });

    for (const value of fourStarMap.values()) {
        const maxCons = fourStarCounts.length - 1;
        if (value >= maxCons) {
            fourStarCounts[maxCons]++;
        } else {
            fourStarCounts[value]++;
        }
    }

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
    
    // Calculate the difference and place it at index 0 ('none').
    const notOwnedFourStars = totalPossibleFourStars - fourStarMap.size;
    const notOwnedFiveStars = totalPossibleFiveStars - fiveStarMap.size;

    // Ensure the count is not negative, just in case the config is out of sync.
    fourStarCounts[0] = Math.max(0, notOwnedFourStars);
    fiveStarCounts[0] = Math.max(0, notOwnedFiveStars);

    // Convert the final count arrays to arrays of strings for consistency.
    return {
        0: fiveStarCounts.map(String),
        1: fourStarCounts.map(String)
    };
}