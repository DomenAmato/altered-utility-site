// Gestione Pagine
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Funzioni Admin
async function updateServerDB() {
    const status = document.getElementById('adminStatus');
    status.innerText = "Aggiornamento in corso... attendere (potrebbe volerci un minuto)";
    try {
        const response = await fetch('/api/admin/update-db');
        const data = await response.json();
        status.innerText = data.message || data.error;
    } catch (e) { status.innerText = "Errore di connessione."; }
}

function downloadJSON() {
    window.location.href = '/api/admin/download-json';
}

// Funzione per estrarre il deck
async function fetchDeck() {
    const deckUrl = document.getElementById('deckUrl').value;
    const resultTable = document.getElementById('resultTable');
    const cardList = document.getElementById('cardList');

    if (!deckUrl) {
        alert('Inserisci un URL o ID valido.');
        return;
    }

    try {
        const response = await fetch(`/api/deck?url=${encodeURIComponent(deckUrl)}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        cardList.innerHTML = '';
        data.cards.forEach(card => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${card.quantity}</td><td>${card.code}</td>`;
            cardList.appendChild(row);
        });

        resultTable.style.display = 'table';
    } catch (error) {
        alert('Errore durante il recupero dei dati.');
    }
}

// Funzione per copiare nel clipboard
function copyToClipboard() {
    const cardList = document.getElementById('cardList');
    const rows = cardList.querySelectorAll('tr');
    let text = '';

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            text += `${cells[0].textContent} ${cells[1].textContent}\n`;
        }
    });

    navigator.clipboard.writeText(text).then(() => {
        alert('Testo copiato negli appunti!');
    }).catch(err => {
        console.error('Errore nella copia:', err);
    });
}