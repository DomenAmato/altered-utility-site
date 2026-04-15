const express = require('express');
const axios = require('axios');
const cors = require('cors');
const downloadAllExpansions = require('./downloadCards'); // Importiamo lo script sopra


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Permette al frontend di comunicare con il backend
app.use(express.json());

app.use(express.static(__dirname));

// Endpoint per estrarre i dati del deck
app.get('/api/deck', async (req, res) => {
    let input = req.query.url;

    if (!input) {
        return res.status(400).json({ error: 'Input mancante' });
    }

    try {
        // Logica per estrarre l'ID:
        // Se l'input contiene "/", prendiamo l'ultima parte, altrimenti usiamo l'input così com'è.
        console.log(input)
        const deckId = input.includes('/') ? input.split('/').filter(Boolean).pop() : input;
        
        const apiUrl = `https://api.altered.gg/deck_user_lists/${deckId}`;
        console.log(apiUrl)
        const response = await axios.get(apiUrl, {
            headers: { 
                'Accept-Language': 'it-IT',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        const data = response.data;
        const allCards = [];
        const types = ['character', 'spell', 'permanent'];

        if (data.deckCardsByType) {
            types.forEach(type => {
                const typeData = data.deckCardsByType[type];
                if (typeData && Array.isArray(typeData.deckUserListCard)) {
                    typeData.deckUserListCard.forEach(item => {
                        allCards.push({
                            quantity: item.quantity,
                            code: item.card.reference
                            // Nome e immagine rimossi come richiesto
                        });
                    });
                }
            });
        }

        res.json({
            name: data.name,
            cards: allCards
        });

    } catch (error) {
        res.status(500).json({ error: 'ID o URL non valido' });
    }
});


// Rotta per avviare l'aggiornamento totale
app.get('/api/admin/update-db', async (req, res) => {
    try {
        const report = await downloadAllExpansions();
        res.json({ message: "Aggiornamento completato", detail: report });
    } catch (error) {
        res.status(500).json({ error: "Errore durante l'aggiornamento" });
    }
});

// Rotta dinamica per scaricare il file di un'espansione specifica
app.get('/api/admin/download-json/:set', (req, res) => {
    const setCode = req.params.set.toLowerCase();
    const fileName = `db_${setCode}.json`;
    const filePath = path.join(__dirname, fileName);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: "File non trovato. Esegui prima l'aggiornamento." });
    }
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});