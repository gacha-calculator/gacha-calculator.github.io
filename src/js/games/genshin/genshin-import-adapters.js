import { gachaConfig, CONSTELLATION_MAP, CHARS_5_STAR_STANDARD, CHARS_4_STAR, WEAPONS_5_STAR_STANDARD, WEAPONS_4_STAR, WEAPONS_3_STAR } from "./config.js";

export function adaptFromPaimonMoe(importedData) {
    if (!importedData || !importedData.characters || !importedData['wish-counter-character-event']) {
        throw new Error("Imported data is missing key Paimon.moe properties.");
    }

    const charPulls = importedData['wish-counter-character-event']?.pulls || [];
    const wepPulls = importedData['wish-counter-weapon-event']?.pulls || [];

    const charPity = calculatePityFromPulls(charPulls, 'character');
    const wepPity = calculatePityFromPulls(wepPulls, 'weapon');

    const caprad = calculateCapRad(charPity.rateUpHistory);

    const finalPityData = [
        { banner: 'character', ...charPity, caprad: caprad },
        { banner: 'weapon', ...wepPity, epPath: '0' }
    ];

    const finalConstellationData = aggregateConstellationCounts(importedData.characters);

    return {
        pity: finalPityData,
        constellation: finalConstellationData
    };
}

function calculateCapRad(rateUpHistory) {
    let capRad = 1;
    for (let i = rateUpHistory.length - 1; i >= 0; i--) {
        let rateUp = rateUpHistory[i]; // 0 won, 1 standard, 2 rateupLost

        if (rateUp === undefined) {
            return ' ';
        } else if (rateUp === 0) {
            if (capRad === 3) {
                capRad = 1;
            } else {
                capRad--;
            }
        } else if (rateUp === 2) {
            capRad++;
        }
    }
    return capRad;
}

function calculatePityFromPulls(pulls, bannerType) {
    let pity5 = 0, pity4 = 0;
    let guarantee5 = false, guarantee4 = false;
    let found5Star = false, found4Star = false;
    let capRadEraPulls = false;
    if (bannerType === 'character') {
        capRadEraPulls = true;
    }
    let rateUpHistory = [];

    const getPullInfo = (id) => {
        if (CHARS_4_STAR.has(id)) return { type: 'character', rarity: 4 };
        if (WEAPONS_4_STAR.has(id)) return { type: 'weapon', rarity: 4 };
        if (WEAPONS_3_STAR.has(id) || id === 'unknown_3_star') return { type: 'weapon', rarity: 3 };
        if (CHARS_5_STAR_STANDARD.has(id)) return { type: 'character', rarity: 5, standard: true };
        if (WEAPONS_5_STAR_STANDARD.has(id)) return { type: 'weapon', rarity: 5, standard: true };
        return { type: 'unknown', rarity: 5, standard: false }; // Assumed limited 5-star
    };

    for (let i = pulls.length - 1; i >= 0; i--) {
        const pull = pulls[i];
        const pullInfo = getPullInfo(pull.id);
        if (pull.time < "2024-08-28 03:00:00") {
            capRadEraPulls = false;
        }

        if (pullInfo.rarity === 5) {
            if (!found5Star) {
                guarantee5 = (pull.rate === 0);
                found5Star = true;
            }
            if (capRadEraPulls) {
                if (pull.rate === 'undefined') {
                    capRadEraPulls = false;
                }
                rateUpHistory.push(pull.rate);
            }
        } else {
            if (!found5Star) {
                pity5++;
            }
        }

        if (pullInfo.rarity === 4) {
            if (!found4Star) {
                guarantee4 = (pull.rate === 0);
                found4Star = true;
            }
        } else {
            if (!found4Star) {
                pity4++;
            }
        }
        if (found5Star && found4Star && !capRadEraPulls) {
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

    const notOwnedFourStars = totalPossibleFourStars - totalOwnedFourStars;
    const notOwnedFiveStars = totalPossibleFiveStars - totalOwnedFiveStars;

    fourStarCounts[0] = Math.max(0, notOwnedFourStars);
    fiveStarCounts[0] = Math.max(0, notOwnedFiveStars);

    return {
        0: fiveStarCounts.map(String),
        1: fourStarCounts.map(String)
    };
}