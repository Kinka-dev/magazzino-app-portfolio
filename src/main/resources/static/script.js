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
const API_BASE_URL = 'http://192.168.0.170:8080';

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

    const submitter = e.submitter || e.target.querySelector('#submit-btn');
    const isSaveAndNew = submitter && submitter.id === 'save-and-new-btn';

    // Pulsante da modificare (quello cliccato)
    const activeBtn = submitter || submitBtn;

    // RACCOLTA DATI (rimane uguale)
    const nome = document.getElementById('nome')?.value?.trim() || '';
    if (!nome) {
        alert("Inserisci almeno il nome del prodotto!");
        return;
    }

    const prodottoData = {
        nome: nome,
        quantita: parseInt(document.getElementById('quantita')?.value) || 0,
        prezzo: parseFloat(document.getElementById('prezzo')?.value) || 0,
        categoria: document.getElementById('categoria')?.value?.trim() || '-',
        descrizione: document.getElementById('descrizione')?.value?.trim() || '-',
        posizione: document.getElementById('posizione')?.value?.trim() || '-',
        linkFornitore: document.getElementById('linkFornitore')?.value?.trim() || '',
        fotoBase64: imgPreview?.src && imgPreview.style.display !== 'none'
            ? imgPreview.src
            : null
    };

    if (prodottoData.quantita < 0) prodottoData.quantita = 0;

    activeBtn.disabled = true;
    const originalText = activeBtn.textContent;
    activeBtn.textContent = 'Salvataggio...';

    try {
        let url = 'http://192.168.0.170:8080/api/prodotti';
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
            form.reset();
            imgPreview.src = '';
            imgPreview.style.display = 'none';
            if (previewP) previewP.style.display = 'block';

            activeBtn.textContent = originalText;
            activeBtn.disabled = false;

            submitBtn.removeAttribute('data-edit-id');
            delete submitBtn.dataset.editId;

            showSuccessToast("Prodotto salvato correttamente!");

            if (isSaveAndNew) {
                // Rimaniamo in Aggiungi
            } else {
                switchMode(btnVisitaMain, sectionVisita);
                await aggiornaCards();
            }
        } else {
            const errorText = await response.text();
            showErrorToast("Errore salvataggio: " + (errorText || "Controlla i dati inseriti"));
            activeBtn.textContent = originalText;
            activeBtn.disabled = false;
        }
    } catch (error) {
        console.error("Errore:", error);
        showErrorToast("Errore connessione al server");
        activeBtn.textContent = originalText;
        activeBtn.disabled = false;
    }
});

document.getElementById('save-and-new-btn')?.addEventListener('click', () => {
    const submitEvent = new SubmitEvent('submit', {
        bubbles: true,
        cancelable: true,
        submitter: document.getElementById('save-and-new-btn')
    });
    form.dispatchEvent(submitEvent);
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

// Variabile globale per la vista (default cards)
let viewVisita = 'cards';

async function aggiornaCards() {
    const cardsDiv = document.getElementById('cards-container-visita');
    const tableDiv = document.getElementById('table-container-visita');

    if (!cardsDiv || !tableDiv) {
        console.error("Contenitori non trovati in aggiornaCards()");
        console.log("cards-container-visita esiste?", !!document.getElementById('cards-container-visita'));
        console.log("table-container-visita esiste?", !!document.getElementById('table-container-visita'));
        return;
    }

    // Pulisci entrambi
    cardsDiv.innerHTML = '';
    tableDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/api/prodotti`);
        if (!response.ok) throw new Error("Errore caricamento");
        const data = await response.json();

        if (viewVisita === 'cards') {
            cardsDiv.style.display = 'grid';
            tableDiv.style.display = 'none';

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
                        <button class="card-btn green-btn edit-btn" data-id="${prod.id}">Modifica</button>
                        <button class="card-btn red-btn delete-btn" data-id="${prod.id}">Rimuovi</button>
                    </div>
                `;
                cardsDiv.appendChild(card);
            });
        } else {
            cardsDiv.style.display = 'none';
            tableDiv.style.display = 'block';

            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.innerHTML = `
                <thead>
                    <tr style="background: #f0f0f0; text-align: left;">
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Foto</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Nome</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Quantità</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Prezzo</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Categoria</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Posizione</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Descrizione</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Azioni</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector('tbody');

            data.forEach(prod => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                        ${prod.fotoBase64
                    ? `<img src="${prod.fotoBase64}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">`
                    : 'No foto'}
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${prod.nome}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${prod.quantita}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${prod.prezzo.toFixed(2)} €</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${prod.categoria}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${prod.posizione}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${prod.descrizione || '-'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; display: flex; flex-direction: row; gap: 5px;">
                        <button title="Modifica" class="card-btn green-btn edit-btn" style="margin-top: 0;" data-id="${prod.id}">✏️</button>
                        <button title="Elimina" class="card-btn red-btn delete-btn" style="margin-top: 0;" data-id="${prod.id}">❌</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            tableDiv.appendChild(table);
        }
    } catch (error) {
        console.error("Errore in aggiornaCards:", error);
        if (cardsDiv) cardsDiv.innerHTML = '<p style="color:red; text-align:center;">Errore caricamento</p>';
        if (tableDiv) tableDiv.innerHTML = '<p style="color:red; text-align:center;">Errore caricamento</p>';
    }
}

async function cambiaQuantita(id, delta) {
    console.log("[DEBUG] cambiaQuantita chiamata - ID:", id, "delta:", delta);
    try {
        const getResp = await fetch(`${API_BASE_URL}/api/prodotti/${id}`);
        if (!getResp.ok) throw new Error("Prodotto non trovato");
        const prod = await getResp.json();
        const nuovaQuantita = Math.max(0, prod.quantita + delta);
        const updated = { ...prod, quantita: nuovaQuantita };
        const putResp = await fetch(`${API_BASE_URL}/api/prodotti/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        if (putResp.ok) {
            console.log("[DEBUG] Quantità aggiornata con successo per ID:", id);
            if (document.getElementById('section-cerca').style.display === 'block') {
                await applicaFiltri();
            } else {
                await aggiornaCards();
            }
        } else {
            console.error("[DEBUG] Errore PUT quantità:", await putResp.text());
        }
    } catch (error) {
        console.error("[DEBUG] Errore in cambiaQuantita:", error);
        alert("Impossibile aggiornare quantità");
    }
}

async function rimuoviProdotto(id) {
    console.log("[DEBUG] rimuoviProdotto chiamata - ID:", id);
    if (!confirm("Vuoi rimuovere questo prodotto?")) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/prodotti/${id}`, { method: 'DELETE' });
        if (response.ok) {
            console.log("[DEBUG] Prodotto rimosso con successo ID:", id);
            showSuccessToast("Prodotto rimosso correttamente!");
            if (document.getElementById('section-cerca').style.display === 'block') {
                await applicaFiltri();
            } else {
                await aggiornaCards();
            }
        } else {
            console.error("[DEBUG] Errore DELETE:", await response.text());
            showErrorToast("Errore rimozione");
        }
    } catch (error) {
        console.error("[DEBUG] Errore in rimuoviProdotto:", error);
        showErrorToast("Errore connessione durante la rimozione");
    }
}

async function modificaProdotto(id) {
    console.log("[DEBUG] modificaProdotto chiamata - ID:", id);
    try {
        const response = await fetch(`${API_BASE_URL}/api/prodotti/${id}`);
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
        console.log("[DEBUG] Form modifica caricato per ID:", id);
    } catch (error) {
        console.error("[DEBUG] Errore in modificaProdotto:", error);
        alert("Impossibile caricare il prodotto per la modifica");
    }
}

// Vista corrente per la sezione Cerca
let viewCerca = 'cards';

// Funzione aggiornata per applicare i filtri
async function applicaFiltri() {
    const testoInput = document.getElementById('filtro-testo');
    const categoriaSelect = document.getElementById('filtro-categoria');
    const testo = testoInput?.value?.toLowerCase().trim() || '';
    const categoria = categoriaSelect?.value?.trim() || '';

    const cardsContainer = document.getElementById('cards-container-cerca');
    const tableContainer = document.getElementById('table-container-cerca');
    const placeholder = document.getElementById('cerca-placeholder'); // da aggiungere nell'HTML

    if (!cardsContainer || !tableContainer) {
        console.error("Contenitori per la vista non trovati");
        return;
    }

    // Se NON ci sono filtri attivi → mostra placeholder e nasconde risultati
    if (!testo && !categoria) {
        if (placeholder) placeholder.style.display = 'flex';
        cardsContainer.style.display = 'none';
        tableContainer.style.display = 'none';
        cardsContainer.innerHTML = '';
        tableContainer.innerHTML = '';
        return;
    }

    // Nascondi placeholder quando applichi filtri
    if (placeholder) placeholder.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/api/prodotti`);
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

        // Pulisci i risultati
        cardsContainer.innerHTML = '';
        tableContainer.innerHTML = '';

        if (filtrate.length === 0) {
            if (placeholder) {
                placeholder.innerHTML = "Nessun prodotto corrisponde ai filtri";
                placeholder.style.display = 'flex';
            } else {
                showErrorToast("Nessun prodotto corrisponde ai filtri");
            }
            return;
        }

        if (viewCerca === 'cards') {
            cardsContainer.style.display = 'grid';
            tableContainer.style.display = 'none';

            filtrate.forEach(prod => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    ${prod.fotoBase64 ? `<img src="${prod.fotoBase64}" alt="${prod.nome}" class="card-img">` : `<div class="card-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;color:#ccc;">🖼️</div>`}
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
                        <button class="card-btn green-btn edit-btn" data-id="${prod.id}">Modifica</button>
                        <button class="card-btn red-btn delete-btn" data-id="${prod.id}">Rimuovi</button>
                    </div>
                `;
                cardsContainer.appendChild(card);
            });
        } else {
            cardsContainer.style.display = 'none';
            tableContainer.style.display = 'block';

            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.innerHTML = `
                <thead>
                    <tr style="background: #f0f0f0; text-align: left;">
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Foto</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Nome</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Quantità</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Prezzo</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Categoria</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Posizione</th>
                        <th style="padding: 12px; border-bottom: 2px solid #ddd;">Azioni</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector('tbody');

            filtrate.forEach(prod => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                        ${prod.fotoBase64 ? `<img src="${prod.fotoBase64}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">` : 'No foto'}
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${prod.nome}</td>${prod.quantita}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${prod.prezzo.toFixed(2)} €</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${prod.categoria}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${prod.posizione}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; display: flex; flex-direction: row; gap: 5px;">
                        <button title="Modifica" class="card-btn green-btn edit-btn" style="margin-top: 0;" data-id="${prod.id}">✏️</button>
                        <button title="Elimina" class="card-btn red-btn delete-btn" style="margin-top: 0;" data-id="${prod.id}">❌</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            tableContainer.appendChild(table);
        }
    } catch (error) {
        console.error("Errore in applicaFiltri:", error);
        if (placeholder) {
            placeholder.innerHTML = "Errore durante la ricerca";
            placeholder.style.display = 'flex';
        }
    }
}

// Toggle vista per sezione Cerca
document.getElementById('toggle-view-cerca')?.addEventListener('click', () => {
    viewCerca = viewCerca === 'cards' ? 'table' : 'cards';
    applicaFiltri();
});

// Event listener click su cards-container-cerca e table-container-cerca (unico listener per entrambi)
document.querySelectorAll('#cards-container-cerca, #table-container-cerca').forEach(container => {
    container.addEventListener('click', async function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = btn.dataset.id;
        if (!id) {
            console.warn("Nessun data-id sul pulsante:", btn);
            return;
        }

        if (btn.classList.contains('qty-btn')) {
            const delta = parseInt(btn.dataset.delta);
            if (!isNaN(delta)) await cambiaQuantita(id, delta);
        }
        if (btn.classList.contains('edit-btn')) await modificaProdotto(id);
        if (btn.classList.contains('delete-btn')) await rimuoviProdotto(id);
    });
});

// Listener pulsanti filtri (come prima)
document.getElementById('btn-applica-filtro')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await applicaFiltri();
});

document.getElementById('btn-reset-filtro')?.addEventListener('click', () => {
    document.getElementById('filtro-testo').value = '';
    document.getElementById('filtro-categoria').value = '';
    applicaFiltri(); // ricarica con filtri vuoti
    console.log("Reset eseguito - campi svuotati");
});

homeScreen.style.display = 'flex';
mainContent.style.display = 'none';
if (btnTornaHome) btnTornaHome.style.display = 'none';
aggiornaCards();

function startDictation(inputId) {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Dettatura vocale non supportata dal tuo browser");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const micBtn = document.getElementById(`mic-${inputId}`);
    micBtn.classList.add('listening');

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        document.getElementById(inputId).value = transcript;
        micBtn.classList.remove('listening');
    };

    recognition.onerror = (event) => {
        console.error("Errore dettatura:", event.error);
        micBtn.classList.remove('listening');
    };

    recognition.onend = () => micBtn.classList.remove('listening');

    recognition.start();
}

document.getElementById('mic-nome').addEventListener('click', () => startDictation('nome'));
document.getElementById('mic-quantita').addEventListener('click', () => startDictation('quantita'));
document.getElementById('mic-prezzo').addEventListener('click', () => startDictation('prezzo'));
document.getElementById('mic-categoria').addEventListener('click', () => startDictation('categoria'));
document.getElementById('mic-descrizione').addEventListener('click', () => startDictation('descrizione'));
document.getElementById('mic-posizione').addEventListener('click', () => startDictation('posizione'));
document.getElementById('mic-linkFornitore').addEventListener('click', () => startDictation('linkFornitore'));



// Funzione per aggiungere https:// se manca
function addHttpsPrefix(input) {
    let val = input.value.trim();

    if (!val) return; // vuoto → non fare nulla

    // Già ha protocollo → esci
    if (val.startsWith('http://') || val.startsWith('https://')) return;

    // Inizia con www. → aggiungi https://
    if (val.startsWith('www.')) {
        input.value = 'https://' + val;
        return;
    }

    // Contiene un dominio (ha un punto e non è solo testo) → aggiungi https://
    if (val.includes('.') && !val.includes(' ')) {
        input.value = 'https://' + val;
    }
}

// Applica su input manuale + dettatura
const linkInput = document.getElementById('linkFornitore');
if (linkInput) {
    // Su input manuale (digita)
    linkInput.addEventListener('input', () => addHttpsPrefix(linkInput));

    // Su dettatura vocale (quando finisce riconoscimento)
    linkInput.addEventListener('change', () => addHttpsPrefix(linkInput));

    // Polling leggero solo mentre microfono attivo (opzionale, ma sicuro)
    let checkInterval;
    document.getElementById('mic-linkFornitore').addEventListener('click', () => {
        // Avvia controllo ogni 500ms mentre ascolta
        checkInterval = setInterval(() => {
            if (linkInput.value.trim()) {
                addHttpsPrefix(linkInput);
            }
        }, 500);
    });

    // Ferma polling quando dettatura finisce
    document.querySelectorAll('.mic-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.classList.contains('listening')) {
                clearInterval(checkInterval);
            }
        });
    });
}

// Toast di successo
function showSuccessToast(message = "Prodotto aggiunto correttamente!") {
    const toast = document.getElementById('toast-success');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Toast di errore
function showErrorToast(message = "Errore durante l'operazione!") {
    const toast = document.getElementById('toast-error');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000); // errore visibile un po' più a lungo
}

// Token Hugging Face (crealo su huggingface.co/settings/tokens se non funziona)
const HF_TOKEN = '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';  // ← METTI IL TUO TOKEN REALE QUI

// Modelli con INFERENCE API ATTIVA (testati oggi)
const MODEL_PCB = 'foduucom/electronic-components-detection';  // Elettronica, componenti
const MODEL_TOOL = 'keremberke/yolov8n-tool-detection';  // Tool/meccanica (attivo)

// Pulsante "Riconosci componenti"
document.getElementById('btn-vision')?.addEventListener('click', async () => {
    const base64 = imgPreview?.src;
    if (!base64 || imgPreview.style.display === 'none') {
        showErrorToast("Carica prima una foto!");
        return;
    }

    await detectWithHuggingFace(base64);
});

// Funzione principale
async function detectWithHuggingFace(base64Image) {
    try {
        showSuccessToast("Riconoscimento in corso...");

        const imageData = base64Image.split(',')[1];

        const [pcbResponse, toolResponse] = await Promise.all([
            fetch('http://localhost:8080/api/prodotti/proxy-hf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: MODEL_PCB, inputs: imageData })
            }),
            fetch('http://localhost:8080/api/prodotti/proxy-hf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: MODEL_TOOL, inputs: imageData })
            })
        ]);

        if (!pcbResponse.ok || !toolResponse.ok) {
            const pcbError = await pcbResponse.text();
            const toolError = await toolResponse.text();
            console.error(`PCB error: ${pcbError}, Tool error: ${toolError}`);
            showErrorToast("Errore in uno dei modelli (controlla console)");
            return;
        }

        const pcbData = await pcbResponse.json();
        const toolData = await toolResponse.json();

        console.log("Risposta PCB:", pcbData);
        console.log("Risposta Tool:", toolData);

        const allDetections = [...(Array.isArray(pcbData) ? pcbData : []), ...(Array.isArray(toolData) ? toolData : [])];

        if (allDetections.length > 0) {
            drawBoundingBoxes(allDetections);

            let labels = allDetections.map(d => d.label || 'Sconosciuto').join(', ');
            let topLabel = allDetections[0]?.label || 'Componenti rilevati';

            document.getElementById('nome').value = topLabel;
            document.getElementById('categoria').value = 'Elettronica / Meccanica / Ferramenta';
            document.getElementById('descrizione').value = `Rilevati: ${labels} (totale: ${allDetections.length})`;

            showSuccessToast(`Rilevati ${allDetections.length} componenti!`);
        } else {
            showErrorToast("Nessun componente riconosciuto");
        }
    } catch (error) {
        console.error("Errore:", error);
        showErrorToast("Errore riconoscimento");
    }
}

document.getElementById('btn-show-cards-visita')?.addEventListener('click', () => {
    viewVisita = 'cards';
    aggiornaCards();
});

document.getElementById('btn-show-table-visita')?.addEventListener('click', () => {
    viewVisita = 'table';
    aggiornaCards();
});

document.getElementById('btn-show-cards-cerca')?.addEventListener('click', () => {
    viewCerca = 'cards';
    applicaFiltri();
});

document.getElementById('btn-show-table-cerca')?.addEventListener('click', () => {
    viewCerca = 'table';
    applicaFiltri();
});

document.getElementById('btn-view-cards-visita')?.addEventListener('click', () => {
    viewVisita = 'cards';
    aggiornaCards();
    highlightViewButton('visita', 'cards');
});

document.getElementById('btn-view-table-visita')?.addEventListener('click', () => {
    viewVisita = 'table';
    aggiornaCards();
    highlightViewButton('visita', 'table');
});

// Pulsanti vista CERCA
document.getElementById('btn-view-cards-cerca')?.addEventListener('click', () => {
    viewCerca = 'cards';
    applicaFiltri();
    highlightViewButton('cerca', 'cards');
});

document.getElementById('btn-view-table-cerca')?.addEventListener('click', () => {
    viewCerca = 'table';
    applicaFiltri();
    highlightViewButton('cerca', 'table');
});

// Funzione helper per evidenziare pulsante attivo
function highlightViewButton(section, view) {
    const prefix = section === 'visita' ? 'visita' : 'cerca';
    document.getElementById(`btn-view-cards-${prefix}`)?.classList.remove('active');
    document.getElementById(`btn-view-table-${prefix}`)?.classList.remove('active');

    document.getElementById(`btn-view-${view}-${prefix}`)?.classList.add('active');
}

// Forza stato iniziale corretto all’avvio
window.addEventListener('load', () => {
    highlightViewButton('visita', viewVisita || 'cards');
    highlightViewButton('cerca', viewCerca || 'cards');
});


// Listener per pulsanti in MAGAZZINO (Visita) – cards + tabella
const visitaContainers = [
    document.getElementById('cards-container-visita'),
    document.getElementById('table-container-visita')
];

visitaContainers.forEach(container => {
    if (container) {
        container.addEventListener('click', async function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;

            const id = btn.dataset.id;
            if (!id) {
                console.warn("Nessun data-id in MAGAZZINO:", btn);
                return;
            }

            console.log("CLICK in MAGAZZINO:", btn.className, "ID:", id); // debug

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
    }
});

// Listener per pulsanti in CERCA – cards + tabella
const cercaContainers = [
    document.getElementById('cards-container-cerca'),
    document.getElementById('table-container-cerca')
];

cercaContainers.forEach(container => {
    if (container) {
        container.addEventListener('click', async function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;

            const id = btn.dataset.id;
            if (!id) return;

            console.log("CLICK in CERCA:", btn.className, "ID:", id); // debug

            if (btn.classList.contains('qty-btn')) {
                const delta = parseInt(btn.dataset.delta);
                if (!isNaN(delta)) await cambiaQuantita(id, delta);
            }

            if (btn.classList.contains('edit-btn')) await modificaProdotto(id);
            if (btn.classList.contains('delete-btn')) await rimuoviProdotto(id);
        });
    }
});

