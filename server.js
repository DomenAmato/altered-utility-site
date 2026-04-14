const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Permette al frontend di comunicare con il backend
app.use(express.json());

app.use(express.static(__dirname));

// Endpoint per estrarre i dati del deck
app.get('/api/deck', async (req, res) => {
    const deckUrl = req.query.url;

    if (!deckUrl) {
        return res.status(400).json({ error: 'URL mancante' });
    }

    try {
        const deckId = deckUrl.split('/').pop();
        const apiUrl = `https://api.altered.gg/deck_user_lists/${deckId}`;

        const response = await axios.get(apiUrl, {
            headers: { 
                'Accept-Language': 'it-IT',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        const data = response.data;
        const allCards = [];

        // Definiamo i tipi che vogliamo scansionare nel JSON
        const types = ['character', 'spell', 'permanent'];

        if (data.deckCardsByType) {
            types.forEach(type => {
                const typeData = data.deckCardsByType[type];
                
                // Verifichiamo che la categoria esista e contenga l'array di carte
                if (typeData && Array.isArray(typeData.deckUserListCard)) {
                    typeData.deckUserListCard.forEach(item => {
                        allCards.push({
                            quantity: item.quantity,
                            code: item.card.reference,
                            name: item.card.name,
                            type: type, // Aggiungiamo il tipo per utilità
                            image: item.card.imagePath
                        });
                    });
                }
            });
        } else {
            throw new Error("Struttura 'deckCardsByType' non trovata nel JSON");
        }

        res.json({
            name: data.name,
            totalCards: allCards.length,
            cards: allCards
        });

    } catch (error) {
        console.error("Dettaglio Errore:", error.response ? error.response.status : error.message);
        res.status(500).json({ error: 'Errore durante il parsing del deck. Controlla il terminale.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});