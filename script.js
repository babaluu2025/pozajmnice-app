const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyp3buzp-dD8hXMTk70EEsqzpA4_sInP5vKsDgKUvLFK8UgkBXJCJcgXoQf6w56T-fM/exec";

let objekti = [];
let items = [];
let transactions = [];

// --- Učitavanje podataka sa Sheet-a ---
async function loadData(sheetName) {
    try {
        const res = await fetch(`${SCRIPT_URL}?sheet=${sheetName}`);
        const data = await res.json();
        return data || [];
    } catch(e){
        console.error("Greška učitavanja:", e);
        return [];
    }
}

// --- Spremanje podataka na Sheet ---
async function saveData(sheetName, data){
    try {
        await fetch(SCRIPT_URL, {
            method:"POST",
            body: JSON.stringify({sheet:sheetName, data:data}),
            headers: {"Content-Type":"application/json"}
        });
    } catch(e){
        console.error("Greška spremanja:", e);
    }
}

// --- Objekti ---
function renderObjekti(){
    const tbody = document.querySelector("#objektiTable tbody");
    tbody.innerHTML = "";
    objekti.forEach(o=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${o.name}</td>
            <td>${o.contact}</td>
            <td>${o.note}</td>
            <td>
                <button onclick="deleteObjekat('${o.id}')">Obriši</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
document.getElementById("objekatForm").addEventListener("submit", async e=>{
    e.preventDefault();
    const newObj = {
        id: Date.now().toString(),
        name: document.getElementById("objekatName").value,
        contact: document.getElementById("objekatContact").value,
        note: document.getElementById("objekatNote").value
    };
    objekti.push(newObj);
    renderObjekti();
    await saveData("Objekti", objekti);
    e.target.reset();
});
async function deleteObjekat(id){
    if(confirm("Obrisati objekat?")){
        objekti = objekti.filter(o=>o.id!==id);
        renderObjekti();
        await saveData("Objekti", objekti);
    }
}

// --- Artikli ---
function renderItems(){
    const tbody = document.querySelector("#itemsTable tbody");
    tbody.innerHTML = "";
    items.forEach(i=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i.name}</td>
            <td>${i.unit}</td>
            <td>
                <button onclick="deleteItem('${i.id}')">Obriši</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
document.getElementById("itemForm").addEventListener("submit", async e=>{
    e.preventDefault();
    const newItem = {
        id: Date.now().toString(),
        name: document.getElementById("itemName").value,
        unit: document.getElementById("itemUnit").value
    };
    items.push(newItem);
    renderItems();
    await saveData("Artikli", items);
    e.target.reset();
});
async function deleteItem(id){
    if(confirm("Obrisati artikal?")){
        items = items.filter(i=>i.id!==id);
        renderItems();
        await saveData("Artikli", items);
    }
}

// --- Transakcije ---
function renderTransactions(){
    const tbody = document.querySelector("#transactionsTable tbody");
    tbody.innerHTML = "";
    transactions.forEach(t=>{
        const obj = objekti.find(o=>o.id===t.objekatId)?.name || "Nepoznato";
        const item = items.find(i=>i.id===t.itemId)?.name || "Nepoznato";
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${t.date}</td>
            <td>${obj}</td>
            <td>${item}</td>
            <td>${t.type}</td>
            <td>${t.quantity}</td>
            <td>${t.note}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Inicijalno učitavanje ---
async function init(){
    objekti = await loadData("Objekti");
    items = await loadData("Artikli");
    transactions = await loadData("Transakcije");

    renderObjekti();
    renderItems();
    renderTransactions();
}

// --- Automatsko spremanje pri zatvaranju ---
window.addEventListener("beforeunload", async ()=>{
    await saveData("Objekti", objekti);
    await saveData("Artikli", items);
    await saveData("Transakcije", transactions);
});

// --- Start ---
init();
