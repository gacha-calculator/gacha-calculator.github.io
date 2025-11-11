import { gachaConfig, CONSTELLATION_MAP, CHARS_5_STAR_STANDARD, CHARS_4_STAR, WEAPONS_5_STAR_STANDARD, WEAPONS_4_STAR, WEAPONS_3_STAR } from "/src/js/games/genshin/config.js";

export function adaptFromPaimonMoe(importedData) {
    // --- Format Validation ---
    // Check for the presence of keys that are unique to this format.
    if (!importedData || !importedData.characters || !importedData['wish-counter-character-event']) {
        console.error("Imported data is missing key Paimon.moe properties.");
        return null; // Not the right format
    }
    console.log("Paimon.moe data format detected. Running adapter...");

    // --- 1. Process Pity Data ---
    const charPulls = importedData['wish-counter-character-event']?.pulls || [];
    const wepPulls = importedData['wish-counter-weapon-event']?.pulls || [];

    const charPity = calculatePityFromPulls(charPulls, 'character');
    const wepPity = calculatePityFromPulls(wepPulls, 'weapon');

    const finalPityData = [
        { banner: 'character', ...charPity, caprad: '0', epPath: '0' },
        { banner: 'weapon', ...wepPity, caprad: '0', epPath: '0' }
    ];

    // --- 2. Process Constellation Data ---
    const finalConstellationData = aggregateConstellationCounts(importedData.characters);

    // --- 3. Assemble and Return Final Object ---
    return {
        pity: finalPityData,
        constellation: finalConstellationData
    };
}

function calculatePityFromPulls(pulls, bannerType) {
    let pity5 = 0, pity4 = 0;
    let guarantee5 = false, guarantee4 = false;
    let found5Star = false, found4Star = false;

    const getPullInfo = (id) => {
        if (CHARS_4_STAR.has(id)) return { type: 'character', rarity: 4 };
        if (WEAPONS_4_STAR.has(id)) return { type: 'weapon', rarity: 4 };
        if (WEAPONS_3_STAR.has(id)) return { type: 'weapon', rarity: 3 };
        if (CHARS_5_STAR_STANDARD.has(id)) return { type: 'character', rarity: 5, standard: true };
        if (WEAPONS_5_STAR_STANDARD.has(id)) return { type: 'weapon', rarity: 5, standard: true };
        return { type: 'unknown', rarity: 5, standard: false }; // Assumed limited 5-star
    };

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
            // If it's NOT a 5-star, and we haven't found one yet, increment the counter.
            if (!found5Star) {
                pity5++;
            }
        }

        // Now, do the same for the 4-star.
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
    }
    return {
        pity4: String(pity4),
        pity5: String(pity5),
        guarantee4: guarantee4,
        guarantee5: guarantee5
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