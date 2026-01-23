// Array locale per simulare il database
let prodotti = [];

// Anteprima foto quando selezionata
const fotoInput = document.getElementById('foto')
const imgPreview = document.getElementById('img-preview')
const  previewText = document.querySelector('#preview-foto p')

if (fotoInput) {
    fotoInput.addEventListener('change', function(e) {
        console.log("Evento change attivato!")
        const file = e.target.files[0];

        if (file) {
            console.log("File selezionato:", file.name)
            const reader = new FileReader();

            reader.onload = function(ev) {
                console.log("Lettura completata")
                imgPreview.src = ev.target.result
                imgPreview.style.display = 'block'
                previewText.style.display = 'none'
            }
            reader.onerror = function() {
                console.error("Errore nella lettura del file")
                alert("Errore nel caricamento della foto")
            }
            reader.readAsDataURL(file)
        } else {
            console.log("Nessun file selezionato")
            imgPreview.style.display = 'none'
            previewText.style.display = 'block'
        }
    })
} else {
    console.error("Elemento #foto non trovato!")
}

// Aggiungi prodotto
document.getElementById('form-prodotto').addEventListener('submit', function(e) {
    e.preventDefault()

    const nuovoProdotto = {
        nome: document.getElementById('nome').value.trim(),
        quantita: parseInt(document.getElementById('quantita').value) || 0,
        prezzo: parseFloat(document.getElementById('prezzo').value) || 0,
        categoria: document.getElementById('categoria').value.trim() || '-',
        descrizione: document.getElementById('descrizione').value.trim() || '-',
        posizione: document.getElementById('posizione').value.trim() || '-',
        linkFornitore: document.getElementById('linkFornitore').value.trim() || '-',
        fotoPreview: document.getElementById('img-preview').src || null
    }

    if (!nuovoProdotto.nome || !nuovoProdotto.quantita < 0) {
        alert("Controlla i campi obbligatori!");
        return;
    }

    prodotti.push(nuovoProdotto)
    aggiornaCards()
    e.target.reset()
    // Reset anteprima
    document.getElementById('img-preview').style.display = 'none'
    document.querySelector('#preview-foto p').style.display = 'block'
})

// Aggiorna le cards
function aggiornaCards() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    prodotti.forEach((prod, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';

        card.innerHTML = `
            ${prod.fotoPreview
            ? `<img src="${prod.fotoPreview}" alt="${prod.nome}" class="card-img">`
            : `<div class="card-img" style="display:flex; align-items:center; justify-content:center; font-size:3rem; color:#ccc;">🖼️</div>`}
            
            <div class="card-content">
                <h3 class="card-title">${prod.nome}</h3>
                <div class="card-info">Quantità: <strong>${prod.quantita}</strong></div>
                <div class="card-info">Prezzo: <span class="card-price">${prod.prezzo.toFixed(2)} €</span></div>
                <div class="card-info">Categoria: ${prod.categoria}</div>
                <div class="card-info">Posizione: ${prod.posizione}</div>
                ${prod.descrizione ? `<div class="card-info">Descrizione: ${prod.descrizione.substring(0, 100)}${prod.descrizione.length > 100 ? '...' : ''}</div>` : ''}
                
                ${prod.linkFornitore && prod.linkFornitore !== '-'
            ? `<a href="${prod.linkFornitore}" target="_blank" rel="noopener noreferrer" class="card-link">🔗 Vai al fornitore / Amazon</a>`
            : ''}
            </div>
            
            <div class="card-actions">
                <button onclick="rimuoviProdotto(${index})">Rimuovi</button>
            </div>
        `;

        container.appendChild(card);
    });
}

function rimuoviProdotto(index) {
    if (confirm("Vuoi rimuovere questo prodotto?")) {
        prodotti.splice(index, 1)
        aggiornaCards()
    }
}
aggiornaCards()


