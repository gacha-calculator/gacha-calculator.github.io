import { gachaConfig, CONSTELLATION_MAP, CHARS_5_STAR_STANDARD, BANNER_HISTORY } from "./config.js";

export function adaptFromWuwaTracker(importedData) {
    const timeZoneMap = {
        '9': 'asia',
        '8': 'asia',
        '7': 'asia',
        '6': 'europe',
        '5': 'america'
    };

    if (!importedData.playerId || !importedData.pulls) {
        throw new Error("Imported data is missing key wuwatracker.com properties.");
    }
    
    const playerId = importedData.playerId;
    const timeZone = timeZoneMap[playerId[0]];
    const BANNER_HISTORY_COPY = BANNER_HISTORY;
    addTimeZone(BANNER_HISTORY_COPY, timeZone);

    const charPity = calculatePityFromPulls(importedData.pulls, 'character', BANNER_HISTORY_COPY);
    const wepPity = calculatePityFromPulls(importedData.pulls, 'weapon', BANNER_HISTORY_COPY);

    const finalPityData = [
        { banner: 'character', ...charPity },
        { banner: 'weapon', ...wepPity }
    ];

    const finalConstellationData = aggregateConstellationCounts(importedData.pulls);

    return {
        pity: finalPityData,
        constellation: finalConstellationData
    };
}

function calculatePityFromPulls(pulls, bannerType, BANNER_HISTORY) {
    let pity5 = 0, pity4 = 0;
    let guarantee5 = false, guarantee4 = false;
    let found5Star = false, found4Star = false;

    for (let i = 0; i < pulls.length; i++) {
        const pull = pulls[i];

        const itemName = pull.name;
        const rarity = pull.qualityLevel;
        const time = pull.time;
        const bannerTypeId = pull.cardPoolType; // cardpooltype 1 - chars, cardpooltype2 - weps
        let targetBanner;

        if (bannerType === 'character') {
            targetBanner = 1;
        } else {
            targetBanner = 2;
        }

        if (bannerTypeId === targetBanner) {
            if (rarity === 5) {
                if (!found5Star) {
                    guarantee5 = isGuarantee(itemName, rarity, bannerType, time, BANNER_HISTORY);
                }
                if (!found4Star) {
                    pity4++;
                }
                found5Star = true;
                found4Star = true;
            } else if (rarity === 4) {
                if (!found5Star) {
                    pity5++;
                }
                if (!found4Star) {
                    guarantee4 = isGuarantee(itemName, rarity, bannerType, time, BANNER_HISTORY);
                }
                found4Star = true;
            } else if (rarity === 3) {
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

function isGuarantee(itemName, rarity, bannerType, time, BANNER_HISTORY) {
    let isGuarantee = false;
    if (rarity === 5) {
        if (bannerType === 'character') {
            isGuarantee = CHARS_5_STAR_STANDARD.has(itemName); // if last 5* is standard then it's guaranteed
        }
    } else {
        let targetBanner = findTargetBanner(BANNER_HISTORY, time, bannerType);
        isGuarantee = !targetBanner.has(itemName);
    }

    return isGuarantee;
}

// Maintenance time:
// Wednesday,       08 October 2025 20:00 to 09 October 2025 03:00 
// PHASE 1
// ASIA/ SEA / HMT: 09 October 2025 03:00 to 30 October 2025 01:59
// EU:              09 October 2025 03:00 to 30 October 2025 08:59
// NA:              09 October 2025 03:00 to 30 October 2025 14:59
// PHASE 2
// ASIA/ SEA / HMT: 30 October 2025 02:00 to 19 November 2025 03:59
// EU:              30 October 2025 09:00 to 19 November 2025 10:59
// NA:              30 October 2025 15:00 to 19 November 2025 16:59

function addTimeZone(BANNER_HISTORY, timeZone) {
    let timeAdd;
    if (timeZone === 'asia') {
        timeAdd = 'T02:00:00+00:00';
    } else if (timeZone === 'europe') {
        timeAdd = 'T09:00:00+00:00';
    } else if (timeZone === 'america') {
        timeAdd = 'T15:00:00+00:00';
    } else {
        throw new Error(`Unknown timezone: ${timeZone}`);
    }

    for (let banner of BANNER_HISTORY) {
        if (banner.type === 'phase2') {
            banner.startDate += timeAdd;
        }
    }
}

function findTargetBanner(BANNER_HISTORY, time, bannerType) {
    for (let i = BANNER_HISTORY.length - 1; i >= 0; i--) {
        if (time > BANNER_HISTORY[i].startDate) {
            if (bannerType === 'character') {
                return BANNER_HISTORY[i].rateUpChars;
            } else {
                return BANNER_HISTORY[i].rateUpWeps;
            }
        }
    }

}

function aggregateConstellationCounts(pulls) {
    const fourStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);
    const fiveStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);

    const fourStarMap = new Map();
    const fiveStarMap = new Map();

    for (let pull of pulls) {
        const isCharacter = pull.resourceId.toString().length === 4;
        const rarity = pull.qualityLevel;
        const name = pull.name;

        if (isCharacter) {
            if (rarity === 5 && CHARS_5_STAR_STANDARD.has(name)) {
                fiveStarMap.set(name, (fiveStarMap.get(name) || 0) + 1);
            } else if (rarity === 4) {
                fourStarMap.set(name, (fourStarMap.get(name) || 0) + 1);
            }
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