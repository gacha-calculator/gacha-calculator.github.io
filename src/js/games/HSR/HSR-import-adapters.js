import { gachaConfig, CONSTELLATION_MAP, CHARS_5_STAR_STANDARD } from "./config.js";

export function adaptFromStarRailStation(importedData) {
    // Split into lines
    const lines = importedData.trim().split('\n');
    const charPulls = [];
    const wepPulls = [];
    const consCount5star = new Map();
    const consCount4star = new Map();

    const result = lines.slice(1).map(line => { // 1 id, 2 rarity, 5 bannner type(11 char, 12 wep)
        const parts = line.split(',');
        if (parts[5] === '11') {
            charPulls.push({ id: parts[1], rarity: parts[2] });
            if (parts[2] === '4') {
                consCount4star.set(parts[1], (consCount4star.get(parts[1]) || 0) + 1);
            } else if (CHARS_5_STAR_STANDARD.has(parts[1])) {
                consCount5star.set(parts[1], (consCount5star.get(parts[1]) || 0) + 1);
            }
        } else if (parts[5] === '12') {
            wepPulls.push([parts[1], parts[2]]);
        } else {
            console.error("Nani the fuck(HSR tracker banner type).");
        }
    });

    const charPity = calculatePityFromPulls(charPulls, 'character');
    const wepPity = calculatePityFromPulls(wepPulls, 'weapon');

    const finalPityData = [
        { banner: 'character', ...charPity },
        { banner: 'weapon', ...wepPity }
    ];

    const finalConstellationData = aggregateConstellationCounts(consCount5star, consCount4star);

    return {
        pity: finalPityData,
        constellation: finalConstellationData
    };
}

function calculatePityFromPulls(pulls, bannerType) {
    let pity5 = 0, pity4 = 0;
    let guarantee5 = false, guarantee4 = false;
    let found5Star = false, found4Star = false;
    let rateUpHistory = [];

    for (let i = pulls.length - 1; i >= 0; i--) {
        const pull = pulls[i];
        const pullInfo = getPullInfo(pull.id);

        if (pullInfo.rarity === 5) {
            if (!found5Star) {
                // This is the most recent 5-star. Set the guarantee and stop counting.
                guarantee5 = (pull.rate === 0);
                found5Star = true;
            }
        } else {
            if (!found5Star) {
                pity5++;
            }
        }

        if (pullInfo.rarity === 4) {
            if (!found4Star) {
                if (bannerType === 'character') {
                    guarantee4 = (pullInfo.type === 'weapon');
                }
                found4Star = true;
            }
        } else {
            if (!found4Star) {
                pity4++;
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
        guarantee5: guarantee5,
        rateUpHistory: rateUpHistory
    };
}

function aggregateConstellationCounts(characters) {
    const fourStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);
    const fiveStarCounts = new Array(Object.keys(CONSTELLATION_MAP).length).fill(0);

    let totalOwnedFourStars = 0;
    let totalOwnedFiveStars = 0;

    for (const charId in characters) {
        let rarity = 0;
        if (CHARS_4_STAR.has(charId)) rarity = 4;
        else if (CHARS_5_STAR_STANDARD.has(charId)) rarity = 5;

        if (rarity === 0) continue;

        const charData = characters[charId];
        const totalCopies = (charData.default || 0) + (charData.wish || 0) + (charData.manual || 0);

        // We only count them as "owned" if they have at least one copy.
        if (totalCopies > 0) {
            if (rarity === 4) totalOwnedFourStars++;
            else if (rarity === 5) totalOwnedFiveStars++;

            const constellationLevel = Math.min(totalCopies - 1, 6);
            const targetIndex = CONSTELLATION_MAP[`c${constellationLevel}`];

            if (targetIndex !== undefined) {
                if (rarity === 4) fourStarCounts[targetIndex]++;
                else if (rarity === 5) fiveStarCounts[targetIndex]++;
            }
        }
    }

    const totalPossibleFourStars = gachaConfig.poolCharSR;
    const totalPossibleFiveStars = gachaConfig.poolStandardCharSSR;

    // Calculate the difference and place it at index 0 ('none').
    const notOwnedFourStars = totalPossibleFourStars - totalOwnedFourStars;
    const notOwnedFiveStars = totalPossibleFiveStars - totalOwnedFiveStars;

    // Ensure the count is not negative, just in case the config is out of sync.
    fourStarCounts[0] = Math.max(0, notOwnedFourStars);
    fiveStarCounts[0] = Math.max(0, notOwnedFiveStars);

    // Convert the final count arrays to arrays of strings for consistency.
    return {
        0: fiveStarCounts.map(String),
        1: fourStarCounts.map(String)
    };
}