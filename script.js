/* URL ka tvom Google Apps Script API-u */
const SCRIPT_URL = const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyp3buzp-dD8hXMTk70EEsqzpA4_sInP5vKsDgKUvLFK8UgkBXJCJcgXoQf6w56T-fM/exec";

/* Primeri podataka (struktura tabele) */
let objekti = [];
let items = [];
let transactions = [];

/* Statusna poruka */
function showSyncStatus(msg, type = 'info') {
  const el = document.getElementById('syncStatus');
  el.textContent = msg;
  el.className = `status ${type}`;
}

/* ✅ Učitavanje iz Google Sheets-a */
async function loadFromGoogleSheets() {
  try {
    showSyncStatus('🔄 Učitavam podatke iz Google Sheet-a...', 'info');

    const [objektiRes, itemsRes, transRes] = await Promise.all([
      fetch(`${SCRIPT_URL}?sheet=Objekti`),
      fetch(`${SCRIPT_URL}?sheet=Artikli`),
      fetch(`${SCRIPT_URL}?sheet=Transakcije`)
    ]);

    objekti = await objektiRes.json();
    items = await itemsRes.json();
    transactions = await transRes.json();

    localStorage.setItem('objekti', JSON.stringify(objekti));
    localStorage.setItem('items', JSON.stringify(items));
    localStorage.setItem('transactions', JSON.stringify(transactions));

    showSyncStatus('✅ Podaci uspešno učitani iz Google Sheet-a', 'success');
  } catch (err) {
    console.error(err);
    showSyncStatus('⚠️ Greška pri učitavanju iz Google Sheet-a', 'error');
    loadFromLocalStorage();
  }
}

/* 💾 Snimanje u Google Sheets */
async function saveToSheets() {
  try {
    showSyncStatus('💾 Snimam podatke u Google Sheet...', 'info');

    await Promise.all([
      fetch(`${SCRIPT_URL}?sheet=Objekti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objekti)
      }),
      fetch(`${SCRIPT_URL}?sheet=Artikli`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      }),
      fetch(`${SCRIPT_URL}?sheet=Transakcije`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactions)
      })
    ]);

    showSyncStatus('✅ Podaci uspešno snimljeni u Google Sheet', 'success');
  } catch (err) {
    console.error(err);
    showSyncStatus('❌ Greška pri snimanju u Google Sheet', 'error');
  }
}

/* Lokalna kopija (ako Sheets nije dostupan) */
function loadFromLocalStorage() {
  try {
    objekti = JSON.parse(localStorage.getItem('objekti')) || [];
    items = JSON.parse(localStorage.getItem('items')) || [];
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    showSyncStatus('📦 Podaci učitani iz lokalne memorije', 'info');
  } catch {
    showSyncStatus('⚠️ Nema lokalnih podataka', 'error');
  }
}

/* 🔁 Automatsko učitavanje pri otvaranju */
window.addEventListener('load', () => {
  loadFromGoogleSheets();
});

/* 💾 Automatsko snimanje pri zatvaranju */
window.addEventListener('beforeunload', () => {
  saveToSheets();
});
