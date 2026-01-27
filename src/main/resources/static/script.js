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
const btnVisitaMain = document.querySelector('#main-content #btn-visita-main') || document.querySelector('#main-content .mode-btn.active');
const btnAggiungiMain = document.querySelector('#main-content #btn-aggiungi-main') || document.querySelector('#main-content .mode-btn:not(.active)');
const filteredContainer = document.getElementById('filtered-container')

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
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
});

document.getElementById('btn-filtri-main').addEventListener('click', () => {
    switchMode(document.getElementById('btn-filtri-main'), document.getElementById('section-cerca'));
    applicaFiltri();
});

function switchMode(activeBtn, activeSection) {
    console.log("switchMode chiamata per sezione:", activeSection.id, "pulsante:", activeBtn?.id || activeBtn?.textContent);

    document.querySelectorAll('.mode-btn, .home-btn, .torna-home-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (activeBtn) {
        activeBtn.classList.add('active');
        console.log("Active aggiunto a:", activeBtn.id || activeBtn.textContent);
    }
    document.querySelectorAll('.mode-section').forEach(sec => {
        sec.style.display = 'none';
    });

    activeSection.style.display = 'block';

    if (btnTornaHome) {
        btnTornaHome.style.display = 'inline-block';
    }

    // Refresh se visita
    if (activeSection.id === 'section-visita') {
        aggiornaCards();
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim() || '';
    if (!nome) {
        alert("Inserisci almeno il nome del prodotto!");
        return;
    }

    const fotoBase64 = imgPreview?.src && imgPreview.style.display !== 'none'
        ? imgPreview.src
        : null;

    const prodottoData = {
        nome: nome,
        quantita: parseInt(document.getElementById('quantita')?.value) || 0,
        prezzo: parseFloat(document.getElementById('prezzo')?.value) || 0,
        categoria: document.getElementById('categoria')?.value?.trim() || '-',
        descrizione: document.getElementById('descrizione')?.value?.trim() || '-',
        posizione: document.getElementById('posizione')?.value?.trim() || '-',
        linkFornitore: document.getElementById('linkFornitore')?.value?.trim() || '',
        fotoBase64: fotoBase64
    };

    if (prodottoData.quantita < 0) prodottoData.quantita = 0;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvataggio...';

    try {
        let url = 'http://localhost:8080/api/prodotti';
        let method = 'POST';

        const editId = submitBtn.dataset.editId;
        if (editId) {
            url += `/${editId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prodottoData)
        });

        if (response.ok) {
            if (document.getElementById('section-cerca').style.display === 'block') {
                await applicaFiltri();  // ricarica filtri
            } else {
                await aggiornaCards();
            }
            form.reset();
            imgPreview.src = '';
            imgPreview.style.display = 'none';
            if (previewP) previewP.style.display = 'block';

            submitBtn.textContent = 'Aggiungi al Magazzino';
            submitBtn.disabled = false;
            submitBtn.removeAttribute('data-edit-id');
            delete submitBtn.dataset.editId;

            switchMode(btnVisitaMain, sectionVisita);
            await aggiornaCards();
        } else {
            const errorText = await response.text();
            alert("Errore salvataggio: " + errorText);
            submitBtn.textContent = editId ? 'Salva Modifiche' : 'Aggiungi al Magazzino';
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error("Errore:", error);
        alert("Errore connessione al server");
        submitBtn.textContent = 'Aggiungi al Magazzino';
        submitBtn.disabled = false;
    }
});

const fotoInput = document.getElementById('foto');
fotoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const statusText = document.getElementById('file-status');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            imgPreview.src = ev.target.result;
            imgPreview.style.display = 'block';
            if (previewP) previewP.style.display = 'none';
        };
        reader.readAsDataURL(file);

        statusText.textContent = `File selezionato: ${file.name}`;
        statusText.style.color = '#27ae60'; // verde per indicare successo
    } else {
        imgPreview.style.display = 'none';
        if (previewP) previewP.style.display = 'block';
        statusText.textContent = 'Nessuna foto selezionata';
        statusText.style.color = '#555';
    }
});

async function aggiornaCards() {
    if (!productsContainer) {
        console.error("Container non trovato");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/prodotti');
        if (!response.ok) throw new Error("Errore caricamento");
        const data = await response.json();

        productsContainer.innerHTML = '';

        data.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                ${prod.fotoBase64
                ? `<img src="${prod.fotoBase64}" alt="${prod.nome}" class="card-img">`
                : `<div class="card-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;color:#ccc;">🖼️</div>`}
                <div class="card-content">
                    <h3 class="card-title">${prod.nome}</h3>
                    <div class="card-info">
                        Quantità: <strong>${prod.quantita}</strong>
                        <button class="qty-btn" data-id="${prod.id}" data-delta="-1">-</button>
                        <button class="qty-btn" data-id="${prod.id}" data-delta="1">+</button>
                    </div>
                    <div class="card-info">Prezzo: <span class="card-price">${prod.prezzo.toFixed(2)} €</span></div>
                    <div class="card-info">Categoria: ${prod.categoria}</div>
                    <div class="card-info">Posizione: ${prod.posizione}</div>
                    ${prod.descrizione ? `<div class="card-info">Descrizione: ${prod.descrizione.substring(0, 100)}${prod.descrizione.length > 100 ? '...' : ''}</div>` : ''}
                    ${prod.linkFornitore && prod.linkFornitore !== '-' ? `<a href="${prod.linkFornitore}" target="_blank" rel="noopener noreferrer" class="card-link">🔗 Vai al fornitore / Amazon</a>` : ''}
                </div>

                <div class="card-actions">
                    <button class="card-btn edit-btn" data-id="${prod.id}">Modifica</button>
                    <button class="card-btn delete-btn" data-id="${prod.id}">Rimuovi</button>
                </div>
            `;
            productsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Errore fetch prodotti:", error);
        productsContainer.innerHTML = '<p style="color:red; text-align:center;">Errore caricamento prodotti</p>';
    }
}

productsContainer.addEventListener('click', async function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;  // o data-id
    if (!id) {
        console.warn("Nessun data-id sul pulsante:", btn);
        return;
    }

    if (btn.classList.contains('edit-btn')) {
        console.log("Modifica cliccato per ID:", id);
        await modificaProdotto(id);
    }

    if (btn.classList.contains('delete-btn')) {
        console.log("Rimuovi cliccato per ID:", id);
        await rimuoviProdotto(id);
    }

    if (btn.classList.contains('qty-btn')) {
        const delta = parseInt(btn.dataset.delta);
        if (!isNaN(delta)) {
            console.log("Quantità cambiata:", delta, "per ID:", id);
            await cambiaQuantita(id, delta);
        }
    }
});

async function cambiaQuantita(id, delta) {
    try {
        const getResp = await fetch(`http://localhost:8080/api/prodotti/${id}`);
        if (!getResp.ok) throw new Error("Prodotto non trovato");
        const prod = await getResp.json();

        const nuovaQuantita = Math.max(0, prod.quantita + delta);

        const updated = { ...prod, quantita: nuovaQuantita };

        const putResp = await fetch(`http://localhost:8080/api/prodotti/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });

        if (putResp.ok) {
            if (document.getElementById('section-cerca').style.display === 'block') {
                await applicaFiltri();  // ricarica filtri
            } else {
                await aggiornaCards();
            }
        }
    } catch (error) {
        console.error("Errore quantità:", error);
        alert("Impossibile aggiornare quantità");
    }
}

async function rimuoviProdotto(id) {
    if (!confirm("Vuoi rimuovere questo prodotto?")) return;

    try {
        const response = await fetch(`http://localhost:8080/api/prodotti/${id}`, {
            method: 'DELETE'
        });

        if (putResp.ok) {
            if (document.getElementById('section-cerca').style.display === 'block') {
                await applicaFiltri();  // ricarica filtri
            } else {
                await aggiornaCards();
            }
        }
    } catch (error) {
        console.error("Errore DELETE:", error);
        alert("Errore connessione al server");
    }
}

async function modificaProdotto(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/prodotti/${id}`);
        if (!response.ok) throw new Error("Prodotto non trovato");
        const prod = await response.json();

        switchMode(btnAggiungiMain, sectionAggiungi);

        document.getElementById('nome').value = prod.nome || '';
        document.getElementById('quantita').value = prod.quantita || 0;
        document.getElementById('prezzo').value = prod.prezzo || 0;
        document.getElementById('categoria').value = prod.categoria || '';
        document.getElementById('descrizione').value = prod.descrizione || '';
        document.getElementById('posizione').value = prod.posizione || '';
        document.getElementById('linkFornitore').value = prod.linkFornitore || '';

        // Anteprima foto dal backend (base64)
        if (prod.fotoBase64) {
            imgPreview.src = prod.fotoBase64;
            imgPreview.style.display = 'block';
            if (previewP) previewP.style.display = 'none';
        } else {
            imgPreview.src = '';
            imgPreview.style.display = 'none';
            if (previewP) previewP.style.display = 'block';
        }

        submitBtn.textContent = 'Salva Modifiche';
        submitBtn.dataset.editId = id;
    } catch (error) {
        console.error("Errore caricamento modifica:", error);
        alert("Impossibile caricare il prodotto per la modifica");
    }
}

async function applicaFiltri() {
    const testoInput = document.getElementById('filtro-testo');
    const categoriaSelect = document.getElementById('filtro-categoria');

    const testo = testoInput.value.toLowerCase().trim() || '';
    const categoria = categoriaSelect.value.trim() || '';  // trim anche qui

    try {
        const response = await fetch('http://localhost:8080/api/prodotti');
        if (!response.ok) throw new Error(`Errore server: ${response.status}`);
        const allProdotti = await response.json();

        console.log("Prodotti totali dal backend:", allProdotti.length);
        console.log("Esempi categorie nel DB:", allProdotti.map(p => p.categoria));

        const filtrate = allProdotti.filter(prod => {
            const matchTesto = !testo ||
                (prod.nome && prod.nome.toLowerCase().includes(testo)) ||
                (prod.categoria && prod.categoria.toLowerCase().includes(testo)) ||
                (prod.posizione && prod.posizione.toLowerCase().includes(testo)) ||
                (prod.descrizione && prod.descrizione.toLowerCase().includes(testo));

            const matchCategoria = !categoria ||
                (prod.categoria && prod.categoria.trim().toLowerCase() === categoria.toLowerCase());

            return matchTesto && matchCategoria;
        });

        if (!filteredContainer) {
            console.error("#filtered-container non trovato!");
            return;
        }

        filteredContainer.innerHTML = '';

        if (filtrate.length === 0) {
            filteredContainer.innerHTML = '<p style="text-align:center; padding:40px; color:#777; font-size:1.2rem;">Nessun prodotto corrisponde ai filtri.</p>';
            return;
        }

        filtrate.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                ${prod.fotoBase64
                            ? `<img src="${prod.fotoBase64}" alt="${prod.nome}" class="card-img">`
                            : `<div class="card-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;color:#ccc;">🖼️</div>`}
                <div class="card-content">
                    <h3 class="card-title">${prod.nome}</h3>
                    <div class="card-info">
                        Quantità: <strong>${prod.quantita}</strong>
                        <button class="qty-btn" data-id="${prod.id}" data-delta="-1">-</button>
                        <button class="qty-btn" data-id="${prod.id}" data-delta="1">+</button>
                    </div>
                    <div class="card-info">Prezzo: <span class="card-price">${prod.prezzo.toFixed(2)} €</span></div>
                    <div class="card-info">Categoria: ${prod.categoria}</div>
                    <div class="card-info">Posizione: ${prod.posizione}</div>
                    ${prod.descrizione ? `<div class="card-info">Descrizione: ${prod.descrizione.substring(0, 100)}${prod.descrizione.length > 100 ? '...' : ''}</div>` : ''}
                    ${prod.linkFornitore && prod.linkFornitore !== '-' ? `<a href="${prod.linkFornitore}" target="_blank" rel="noopener noreferrer" class="card-link">🔗 Vai al fornitore / Amazon</a>` : ''}
                </div>
                <div class="card-actions">
                    <button class="card-btn edit-btn" data-id="${prod.id}">Modifica</button>
                    <button class="card-btn delete-btn" data-id="${prod.id}">Rimuovi</button>
                </div>
            `;
            filteredContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Errore in applicaFiltri:", error);
        document.getElementById('filtered-container').innerHTML = '<p style="color:red; text-align:center; padding:40px;">Errore durante la ricerca</p>';
    }
}
document.getElementById('btn-applica-filtro').addEventListener('click', async (e) => {
    e.preventDefault();
    await applicaFiltri();
});

document.getElementById('btn-reset-filtro').addEventListener('click', () => {
    document.getElementById('filtro-testo').value = '';
    document.getElementById('filtro-categoria').value = '';

    if (filteredContainer) {
        filteredContainer.innerHTML = '';
        aggiornaCards();
    }
    console.log("Reset eseguito - campi svuotati");
});

filteredContainer.addEventListener('click', async function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;
    if (!id) {
        console.warn("Nessun data-id sul pulsante:", btn);
        return;
    }

    if (btn.classList.contains('qty-btn')) {
        const delta = parseInt(btn.dataset.delta);
        if (!isNaN(delta)) {
            await cambiaQuantita(id, delta);
        }
    }

    if (btn.classList.contains('edit-btn')) {
        await modificaProdotto(id);
    }

    if (btn.classList.contains('delete-btn')) {
        await rimuoviProdotto(id);
    }
});

homeScreen.style.display = 'flex';
mainContent.style.display = 'none';
if (btnTornaHome) btnTornaHome.style.display = 'none';
aggiornaCards();