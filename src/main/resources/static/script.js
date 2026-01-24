let prodotti = [];

// Elementi DOM globali (definirli subito evita errori "not defined")
const form = document.getElementById('form-prodotto');
const submitBtn = form.querySelector('button[type="submit"]');
const imgPreview = document.getElementById('img-preview');
const previewP = document.querySelector('#preview-foto p');
const productsContainer = document.getElementById('products-container');
const btnVisita = document.getElementById('btn-visita');
const btnAggiungi = document.getElementById('btn-aggiungi');
const sectionVisita = document.getElementById('section-visita');
const sectionAggiungi = document.getElementById('section-aggiungi');

// Listener unico per il submit (aggiunta + modifica)
form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Submit attivato");

    const editIndexStr = submitBtn.dataset.editIndex;
    const isEdit = editIndexStr !== undefined && editIndexStr !== '';
    const editIndex = isEdit ? parseInt(editIndexStr) : -1;

    const prodottoData = {
        nome: document.getElementById('nome').value.trim(),
        quantita: parseInt(document.getElementById('quantita').value) || 0,
        prezzo: parseFloat(document.getElementById('prezzo').value) || 0,
        categoria: document.getElementById('categoria').value.trim() || '-',
        descrizione: document.getElementById('descrizione').value.trim() || '-',
        posizione: document.getElementById('posizione').value.trim() || '-',
        linkFornitore: document.getElementById('linkFornitore').value.trim() || '-',
        fotoPreview: imgPreview.src && imgPreview.style.display !== 'none' ? imgPreview.src : null
    };

    if (!prodottoData.nome) {
        alert("Inserisci almeno il nome del prodotto!");
        return;
    }

    if (prodottoData.quantita < 0) prodottoData.quantita = 0;

    if (isEdit && editIndex >= 0 && editIndex < prodotti.length) {
        prodotti[editIndex] = prodottoData;
        console.log(`Aggiornato prodotto all'indice ${editIndex}`);
    } else {
        prodotti.push(prodottoData);
        console.log("Aggiunto nuovo prodotto");
    }

    // Reset form e anteprima
    form.reset();
    imgPreview.src = '';
    imgPreview.style.display = 'none';
    if (previewP) previewP.style.display = 'block';

    // Reset bottone e flag
    submitBtn.textContent = 'Aggiungi al Magazzino';
    submitBtn.removeAttribute('data-edit-index');
    delete submitBtn.dataset.editIndex;

    // Switch alla vista magazzino e refresh cards
    btnVisita.click();
    aggiornaCards();
});

// Switch modalità Visita / Aggiungi
btnVisita.addEventListener('click', () => {
    sectionVisita.style.display = 'block';
    sectionAggiungi.style.display = 'none';
    btnVisita.classList.add('active');
    btnAggiungi.classList.remove('active');
    // Reset filtri e refresh completo
    document.getElementById('filtro-testo').value = '';
    document.getElementById('filtro-categoria').value = '';
    aggiornaCards();
});

btnAggiungi.addEventListener('click', () => {
    sectionVisita.style.display = 'none';
    sectionAggiungi.style.display = 'block';
    btnAggiungi.classList.add('active');
    btnVisita.classList.remove('active');
});

// Anteprima foto
const fotoInput = document.getElementById('foto');
if (fotoInput) {
    fotoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                imgPreview.src = ev.target.result;
                imgPreview.style.display = 'block';
                if (previewP) previewP.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            imgPreview.style.display = 'none';
            if (previewP) previewP.style.display = 'block';
        }
    });
}

// Aggiorna cards (con pulsanti qty e modifica)
function aggiornaCards() {
    if (!productsContainer) {
        console.error("Container cards non trovato!");
        return;
    }

    productsContainer.innerHTML = '';
    console.log("Aggiornamento cards - totale prodotti:", prodotti.length);

    prodotti.forEach((prod, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${prod.fotoPreview
            ? `<img src="${prod.fotoPreview}" alt="${prod.nome}" class="card-img">`
            : `<div class="card-img" style="display:flex; align-items:center; justify-content:center; font-size:3rem; color:#ccc;">🖼️</div>`}
            
            <div class="card-content">
                <h3 class="card-title">${prod.nome}</h3>
                <div class="card-info">
                    Quantità: <strong>${prod.quantita}</strong>
                    <button class="qty-btn" onclick="cambiaQuantita(${index}, -1)">-</button>
                    <button class="qty-btn" onclick="cambiaQuantita(${index}, 1)">+</button>
                </div>
                <div class="card-info">Prezzo: <span class="card-price">${prod.prezzo.toFixed(2)} €</span></div>
                <div class="card-info">Categoria: ${prod.categoria}</div>
                <div class="card-info">Posizione: ${prod.posizione}</div>
                ${prod.descrizione ? `<div class="card-info">Descrizione: ${prod.descrizione.substring(0, 100)}${prod.descrizione.length > 100 ? '...' : ''}</div>` : ''}
                ${prod.linkFornitore && prod.linkFornitore !== '-'
            ? `<a href="${prod.linkFornitore}" target="_blank" rel="noopener noreferrer" class="card-link">🔗 Vai al fornitore / Amazon</a>`
            : ''}
            </div>
            
            <div class="card-actions">
                <button onclick="modificaProdotto(${index})">Modifica</button>
                <button onclick="rimuoviProdotto(${index})">Rimuovi</button>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

// Cambia quantità rapida
function cambiaQuantita(index, delta) {
    if (prodotti[index]) {
        let nuovaQty = prodotti[index].quantita + delta;
        if (nuovaQty < 0) nuovaQty = 0;
        prodotti[index].quantita = nuovaQty;
        aggiornaCards();
    }
}

// Rimuovi prodotto
function rimuoviProdotto(index) {
    if (confirm("Vuoi rimuovere questo prodotto?")) {
        prodotti.splice(index, 1);
        aggiornaCards();
    }
}

// Modifica prodotto
function modificaProdotto(index) {
    const prod = prodotti[index];
    if (!prod) return;

    btnAggiungi.click();

    document.getElementById('nome').value = prod.nome || '';
    document.getElementById('quantita').value = prod.quantita || 0;
    document.getElementById('prezzo').value = prod.prezzo || 0;
    document.getElementById('categoria').value = prod.categoria || '';
    document.getElementById('descrizione').value = prod.descrizione || '';
    document.getElementById('posizione').value = prod.posizione || '';
    document.getElementById('linkFornitore').value = prod.linkFornitore || '';

    if (prod.fotoPreview) {
        imgPreview.src = prod.fotoPreview;
        imgPreview.style.display = 'block';
        if (previewP) previewP.style.display = 'none';
    }

    submitBtn.textContent = 'Salva Modifiche';
    submitBtn.dataset.editIndex = index.toString();

    console.log("Modifica avviata per indice:", index);
}

// Filtri
function applicaFiltri() {
    const testo = document.getElementById('filtro-testo').value.toLowerCase().trim() || '';
    const categoria = document.getElementById('filtro-categoria').value || '';

    const filtrate = prodotti.filter(prod => {
        const matchTesto = !testo ||
            prod.nome.toLowerCase().includes(testo) ||
            (prod.categoria && prod.categoria.toLowerCase().includes(testo)) ||
            (prod.posizione && prod.posizione.toLowerCase().includes(testo)) ||
            (prod.descrizione && prod.descrizione.toLowerCase().includes(testo));

        const matchCategoria = !categoria || prod.categoria === categoria;

        return matchTesto && matchCategoria;
    });

    productsContainer.innerHTML = '';

    filtrate.forEach((prod) => {
        const originalIndex = prodotti.indexOf(prod);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${prod.fotoPreview
            ? `<img src="${prod.fotoPreview}" alt="${prod.nome}" class="card-img">`
            : `<div class="card-img" style="display:flex; align-items:center; justify-content:center; font-size:3rem; color:#ccc;">🖼️</div>`}
            <!-- resto card come in aggiornaCards -->
            <!-- ... copia la struttura card da aggiornaCards() qui ... -->
            <div class="card-actions">
                <button onclick="modificaProdotto(${originalIndex})">Modifica</button>
                <button onclick="rimuoviProdotto(${originalIndex})">Rimuovi</button>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

document.getElementById('btn-applica-filtro').addEventListener('click', applicaFiltri);
document.getElementById('btn-reset-filtro').addEventListener('click', () => {
    document.getElementById('filtro-testo').value = '';
    document.getElementById('filtro-categoria').value = '';
    aggiornaCards();
});

// Avvio iniziale
sectionVisita.style.display = 'block';
sectionAggiungi.style.display = 'none';
btnVisita.classList.add('active');
btnAggiungi.classList.remove('active');
aggiornaCards();