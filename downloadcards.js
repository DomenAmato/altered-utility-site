const axios = require('axios');
const fs = require('fs');
const path = require('path');

const EXPANSIONS = [
    { name: "Beyond the gates", code: "CORE" },
    { name: "Trial by the frost", code: "ALIZE" },
    { name: "Whispers from the maze", code: "BISE" },
    { name: "Skybound odissey", code: "CYCLONE" },
    { name: "Seeds of Unity", code: "DUSTER" },
    { name: "Roots of Corruption", code: "EOLE" }
];

async function downloadAllExpansions() {
    console.log("Inizio aggiornamento database per espansioni...");
    let report = [];

    for (const exp of EXPANSIONS) {
        let expCards = [];
        let nextPage = `https://api.altered.gg/cards?itemsPerPage=100&page=1&cardSet[]=${exp.code}`;
        
        console.log(`--- Scaricando espansione: ${exp.name} (${exp.code}) ---`);

        try {
            while (nextPage) {
                const response = await axios.get(nextPage, {
                    headers: { 'Accept-Language': 'it-IT', 'User-Agent': 'AlteredUtility/1.0' }
                });

                expCards = expCards.concat(response.data['hydra:member']);
                const nextRelativeUrl = response.data['hydra:view']?.['hydra:next'];
                nextPage = nextRelativeUrl ? `https://api.altered.gg${nextRelativeUrl}` : null;
            }

            const fileName = `db_${exp.code.toLowerCase()}.json`;
            fs.writeFileSync(path.join(__dirname, fileName), JSON.stringify(expCards, null, 2));
            report.push(`${exp.name}: ${expCards.length} carte`);
            
        } catch (error) {
            console.error(`Errore su ${exp.code}:`, error.message);
            report.push(`${exp.name}: ERRORE`);
        }
    }
    return report.join('\n');
}

module.exports = downloadAllExpansions;