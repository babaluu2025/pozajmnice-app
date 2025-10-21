const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyp3buzp-dD8hXMTk70EEsqzpA4_sInP5vKsDgKUvLFK8UgkBXJCJcgXoQf6w56T-fM/exec";

let objekti = [];

// --- Učitavanje sa Sheet-a ---
async function loadObjekti() {
    try {
        const response = await fetch(`${SCRIPT_URL}?sheet=Objekti`);
        const data = await response.json();
        objekti = data;
        renderObjekti();
    } catch(e) {
        console.error("Greška pri učitavanju:", e);
        alert("Ne mogu učitati podatke sa Sheet-a");
    }
}

// --- Prikaz u tabeli ---
function renderObjekti() {
    const tbody = document.querySelector("#objektiTable tbody");
    tbody.innerHTML = "";
    objekti.forEach(obj => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${obj.name}</td>
            <td>${obj.contact}</td>
            <td>${obj.note}</td>
            <td>
                <button onclick="deleteObjekat('${obj.id}')">Obriši</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Dodavanje objekta ---
document.getElementById("objekatForm").addEventListener("submit", async function(e){
    e.preventDefault();
    const newObj = {
        id: Date.now().toString(),
        name: document.getElementById("objekatName").value,
        contact: document.getElementById("objekatContact").value,
        note: document.getElementById("objekatNote").value
    };
    objekti.push(newObj);
    renderObjekti();
    await saveObjekti();
    this.reset();
});

// --- Brisanje objekta ---
async function deleteObjekat(id){
    if(confirm("Obrisati objekat?")){
        objekti = objekti.filter(o => o.id !== id);
        renderObjekti();
        await saveObjekti();
    }
}

// --- Čuvanje na Sheet ---
async function saveObjekti(){
    try {
        await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({sheet:"Objekti", data:objekti}),
            headers: {"Content-Type":"application/json"}
        });
    } catch(e){
        console.error("Greška pri spremanju:", e);
    }
}

// --- Spremi kada se zatvori stranica ---
window.addEventListener("beforeunload", saveObjekti);

// --- Pokreni učitavanje na startu ---
loadObjekti();
