let prodotti = [];

// Elementi DOM globali
const form = document.getElementById('form-prodotto');
const submitBtn = form.querySelector('button[type="submit"]');
const imgPreview = document.getElementById('img-preview');
const previewP = document.querySelector('#preview-foto p');
const productsContainer = document.getElementById('products-container');
const btnVisitaHome = document.getElementById('btn-visita');
const btnAggiungiHome = document.getElementById('btn-aggiungi');
const btnCercaHome = document.getElementById('btn-cerca');
const btnTornaHome = document.getElementById('btn-torna-home');
const sectionVisita = document.getElementById('section-visita');
const sectionAggiungi = document.getElementById('section-aggiungi');
const sectionCerca = document.getElementById('section-cerca');
const mainContent = document.getElementById('main-content');
const homeScreen = document.getElementById('home-screen');

// Pulsanti del main (se hanno ID diversi)
const btnVisitaMain = document.querySelector('#main-content #btn-visita-main') || document.querySelector('#main-content .mode-btn.active');
const btnAggiungiMain = document.querySelector('#main-content #btn-aggiungi-main') || document.querySelector('#main-content .mode-btn:not(.active)');


// Pulsanti HOME screen (solo una volta)
btnVisitaHome.addEventListener('click', () => {
    homeScreen.style.display = 'none';
    mainContent.style.display = 'block';
    switchMode(btnVisitaMain || btnVisitaHome, sectionVisita);
});

btnAggiungiHome.addEventListener('click', () => {
    homeScreen.style.display = 'none';
    mainContent.style.display = 'block';
    switchMode(btnAggiungiMain || btnAggiungiHome, sectionAggiungi);
});

btnCercaHome.addEventListener('click', () => {
    homeScreen.style.display = 'none';
    mainContent.style.display = 'block';
    switchMode(null, sectionCerca);
    applicaFiltri();
});

btnVisitaMain.addEventListener('click', () => {
    switchMode(btnVisitaMain, sectionVisita);
});

btnAggiungiMain.addEventListener('click', () => {
    switchMode(btnAggiungiMain, sectionAggiungi);
});

btnTornaHome.addEventListener('click', () => {
    mainContent.style.display = 'none';
    homeScreen.style.display = 'flex';
    btnTornaHome.style.display = 'none';
    // Resetta active sui pulsanti principali
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
});
// Funzione switchMode centralizzata
function switchMode(activeBtn, activeSection) {
    console.log("switchMode chiamata per sezione:", activeSection.id, "pulsante:", activeBtn?.id || activeBtn?.textContent);

    // Pulisci TUTTI gli active
    document.querySelectorAll('.mode-btn, .home-btn, .torna-home-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Aggiungi active solo al pulsante corretto
    if (activeBtn) {
        activeBtn.classList.add('active');
        console.log("Active aggiunto a:", activeBtn.id || activeBtn.textContent);
    }

    // Nascondi tutte le sezioni
    document.querySelectorAll('.mode-section').forEach(sec => {
        sec.style.display = 'none';
    });

    // Mostra la sezione
    activeSection.style.display = 'block';

    // Torna alla Home sempre visibile nel main
    if (btnTornaHome) {
        btnTornaHome.style.display = 'inline-block';
    }

    // Refresh se visita
    if (activeSection.id === 'section-visita') {
        aggiornaCards();
    }
}

// Listener submit form (aggiunta + modifica)
form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Submit attivato");

    const editIndexStr = submitBtn?.dataset.editIndex;
    const isEdit = editIndexStr !== undefined && editIndexStr !== '';
    const editIndex = isEdit ? parseInt(editIndexStr) : -1;

    const prodottoData = {
        nome: document.getElementById('nome')?.value.trim() || '',
        quantita: parseInt(document.getElementById('quantita')?.value) || 0,
        prezzo: parseFloat(document.getElementById('prezzo')?.value) || 0,
        categoria: document.getElementById('categoria')?.value.trim() || '',
        descrizione: document.getElementById('descrizione')?.value.trim() || '',
        posizione: document.getElementById('posizione')?.value.trim() || '',
        linkFornitore: document.getElementById('linkFornitore')?.value.trim() || '',
        fotoPreview: imgPreview?.src && imgPreview.style.display !== 'none' ? imgPreview.src : null
    };

    if (!prodottoData.nome) {
        alert("Inserisci almeno il nome del prodotto!");
        return;
    }

    if (prodottoData.quantita < 0) prodottoData.quantita = 0;

    if (isEdit && editIndex >= 0 && editIndex < prodotti.length) {
        prodotti[editIndex] = prodottoData;
        console.log(`Aggiornato indice ${editIndex}`);
    } else {
        prodotti.push(prodottoData);
        console.log("Aggiunto nuovo prodotto");
    }

    // Reset form
    form.reset();
    imgPreview.src = '';
    imgPreview.style.display = 'none';
    if (previewP) previewP.style.display = 'block';
    submitBtn.textContent = 'Aggiungi al Magazzino';
    submitBtn.removeAttribute('data-edit-index');
    delete submitBtn.dataset.editIndex;

    // Torna a Visita Magazzino
    switchMode(btnVisitaMain, sectionVisita);
    aggiornaCards();});

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

// Aggiorna cards
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
            ${prod.fotoPreview ? `<img src="${prod.fotoPreview}" alt="${prod.nome}" class="card-img" style="object-fit: contain;">` : `<div class="card-img" style="display:flex; align-items:center; justify-content:center; font-size:3rem; color:#ccc;">🖼️</div>`}
            <div class="card-content">
                <h3 class="card-title">${prod.nome}</h3>
                <div class="card-info">
                    Quantità: <strong>${prod.quantita}</strong>
                    <button class="qty-btn" data-index="${index}" data-delta="-1">-</button>
                    <button class="qty-btn" data-index="${index}" data-delta="1">+</button>
                </div>
                <div class="card-info">Prezzo: <span class="card-price">${prod.prezzo.toFixed(2)} €</span></div>
                <div class="card-info">Categoria: ${prod.categoria}</div>
                <div class="card-info">Posizione: ${prod.posizione}</div>
                ${prod.descrizione ? `<div class="card-info">Descrizione: ${prod.descrizione.substring(0, 100)}${prod.descrizione.length > 100 ? '...' : ''}</div>` : ''}
                ${prod.linkFornitore && prod.linkFornitore !== '-' ? `<a href="${prod.linkFornitore}" target="_blank" rel="noopener noreferrer" class="card-link">🔗 Vai al fornitore / Amazon</a>` : ''}
            </div>
            <div class="card-actions">
                <button class="card-btn edit-btn" data-index="${index}">Modifica</button>
                <button class="card-btn delete-btn" data-index="${index}">Rimuovi</button>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

// Delega eventi sui pulsanti nelle cards
productsContainer?.addEventListener('click', function(e) {
    const target = e.target.closest('button');
    if (!target) return;

    const index = parseInt(target.dataset.index);
    if (isNaN(index)) return;

    if (target.classList.contains('edit-btn')) {
        modificaProdotto(index);
    }

    if (target.classList.contains('delete-btn')) {
        rimuoviProdotto(index);
    }

    if (target.classList.contains('qty-btn')) {
        const delta = parseInt(target.dataset.delta);
        if (!isNaN(delta)) {
            cambiaQuantita(index, delta);
        }
    }
});

// Funzioni ausiliarie
function cambiaQuantita(index, delta) {
    if (prodotti[index]) {
        let nuovaQty = prodotti[index].quantita + delta;
        if (nuovaQty < 0) nuovaQty = 0;
        prodotti[index].quantita = nuovaQty;
        aggiornaCards();
    }
}

function rimuoviProdotto(index) {
    if (confirm("Vuoi rimuovere questo prodotto?")) {
        prodotti.splice(index, 1);
        aggiornaCards();
    }
}

function modificaProdotto(index) {
    const prod = prodotti[index];
    if (!prod) return;

    switchMode(btnAggiungiMain || btnAggiungiHome, sectionAggiungi);

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
}

// Filtri (assumendo che tu abbia già la funzione applicaFiltri)
function applicaFiltri() {
    // ... la tua funzione esistente ...
}

// Avvio iniziale
homeScreen.style.display = 'flex';
mainContent.style.display = 'none';
if (btnTornaHome) btnTornaHome.style.display = 'none';
aggiornaCards();