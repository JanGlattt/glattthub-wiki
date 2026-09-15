/* Serien-Bausteine „Kundenverwaltung" — alles Allgemeine (Anmeldung, Maskierung, Screenshot)
   kommt aus ../../shared/lib/shoot.cjs, hier stehen nur die Eigenheiten des Kundenprofils.  */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv([
  ['KLICK_CLIENT', 'Phorest-Client-ID aus der URL /hub/clients/<ID> setzen.'],
]);

const CLIENT = process.env.KLICK_CLIENT;      // aufgenommene Kundin
const CONTRACT = process.env.KLICK_CONTRACT;  // Vertrag für die Zahlungsstand-Seite (Dok L)

/** Browser mit dem Alpine-Zugriff der Kundendetailseite: window.C() liefert den Scope. */
const launch = (opts = {}) => S.launch({
  ...opts,
  init: () => { window.C = () => Alpine.$data(document.querySelector('[x-data^="clientDetailPage"]')); },
});

/** Kundenprofil öffnen und auf die geladene Seite warten. */
async function openClient(page, ms = 2500) {
  await S.goto(page, '/hub/clients/' + CLIENT, 1000);
  await page.waitForFunction(() => window.C && window.C() && window.C().loading === false, null, { timeout: 30000 });
  await S.wait(page, ms);
}

/** Reiter über die Beschriftung wählen — wie die Mitarbeiterin auch.
    Fehlt der Reiter, fehlt dem Aufnahme-Zugang das Recht: Meldung, aber kein Abbruch. */
async function tab(page, name, ms = 2500) {
  const ok = await page.evaluate((n) => {
    const b = [...document.querySelectorAll('.tabs-glattt-sidebar .tab-glattt-sidebar')]
      .filter(e => e.offsetParent !== null)
      .find(e => e.textContent.trim() === n);
    if (!b) return false;
    b.click();
    return true;
  }, name);
  if (!ok) { console.log('REITER FEHLT:', name, '— Recht fehlt oder Beschriftung geändert?'); return false; }
  await S.wait(page, ms);
  return true;
}

module.exports = { ...S, launch, openClient, tab, CLIENT, CONTRACT };
