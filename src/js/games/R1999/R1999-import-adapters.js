import { gachaConfig, CONSTELLATION_MAP, BANNER_HISTORY, UPDATE_HISTORY } from "./config.js";

export function adaptFromKornblume(importedData) {
    if (!importedData.pulls) {
        console.error("Imported data is missing key Kornblume properties.");
        return null;
    }

    const pulls = JSON.parse(importedData.pulls);
    const charPity = calculatePityFromPulls(pulls.data, BANNER_HISTORY);

    if (!pulls || !pulls.data) {
        console.error("Imported data is missing key Kornblume properties.");
        return null;
    }

    const finalPityData = [
        { banner: 'character', ...charPity }
    ];

    const STANDARD_CHARS = findStandards();
    const finalConstellationData = aggregateConstellationCounts(pulls.data, STANDARD_CHARS);

    return {
        pity: finalPityData,
        constellation: finalConstellationData,
        game: 'reverse'
    };
}

function calculatePityFromPulls(pulls, BANNER_HISTORY) {
    let pity6 = 0;
    let guarantee6 = false;
    let found6Star = false;

    for (let i = 0; i < pulls.length; i++) {
        const pull = pulls[i];

        const itemName = pull.ArcanistName;
        const rarity = pull.Rarity;
        const bannerName = pull.BannerType;
        const rateUp = BANNER_HISTORY[bannerName].char;

        if (Object.hasOwn(BANNER_HISTORY, bannerName)) { // check if it's a normal banner, not water/limited etc
            if (rarity === 6) {
                if (!found6Star) {
                    guarantee6 = itemName != rateUp;
                }
                found6Star = true;
            } else {
                if (!found6Star) {
                    pity6++;
                }
            }
            if (found6Star) {
                break;
            }
        }
    }
    return {
        pity5: String(pity6),
        guarantee5: guarantee6
    };
}

function findStandards() {
    const STANDARD_CHARS = new Set([]);
    const LATEST_STANDARD_INDEX = UPDATE_HISTORY.length - 4;
    for (const [bannerName, bannerData] of Object.entries(BANNER_HISTORY)) {
        const BANNER_INDEX = UPDATE_HISTORY.indexOf(bannerData.release);
        if (LATEST_STANDARD_INDEX >= BANNER_INDEX) {
            STANDARD_CHARS.add(bannerData.char);
        }
    }
    return STANDARD_CHARS;
}

function aggregateConstellationCounts(pulls, STANDARD_CHARS) {
    const fiveStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);
    const sixStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);

    const fiveStarMap = new Map();
    const sixStarMap = new Map();

    for (let pull of pulls) {
        const rarity = pull.Rarity;
        const name = pull.ArcanistName;

        if (rarity === 6 && STANDARD_CHARS.has(name)) {
            sixStarMap.set(name, (sixStarMap.get(name) || 0) + 1);
        } else if (rarity === 5) {
            fiveStarMap.set(name, (fiveStarMap.get(name) || 0) + 1);
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

    for (const value of sixStarMap.values()) {
        const maxCons = sixStarCounts.length - 1;
        if (value >= maxCons) {
            sixStarCounts[maxCons]++;
        } else {
            sixStarCounts[value]++;
        }
    }
    const totalPossibleFiveStars = gachaConfig.poolCharSR;
    const totalPossibleSixStars = gachaConfig.poolStandardCharSSR;

    // Calculate the difference and place it at index 0 ('none').
    const notOwnedFiveStars = totalPossibleFiveStars - fiveStarMap.size;
    const notOwnedSixStars = totalPossibleSixStars - sixStarMap.size;

    // Ensure the count is not negative, just in case the config is out of sync.
    fiveStarCounts[0] = Math.max(0, notOwnedFiveStars);
    sixStarCounts[0] = Math.max(0, notOwnedSixStars);

    // Convert the final count arrays to arrays of strings for consistency.
    return {
        0: sixStarCounts.map(String),
        1: fiveStarCounts.map(String)
    };
}