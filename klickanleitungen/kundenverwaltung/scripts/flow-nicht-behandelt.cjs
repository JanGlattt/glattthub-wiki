/* Kundenverwaltung 6, Nachtrag 21.10.2026: Verlauf mit dem Etikett „nicht behandelt“.
   Nur Lesen — der Eintrag wird im Browser markiert (nichts gespeichert), weil lokal kein echter
   „nicht behandelt“-Eintrag der Beispiel-Kundin existiert.                                    */
const L = require('./lib.cjs');
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openClient(page, 2500);
  await L.tab(page, 'Behandlungseinstellungen', 4000);
  const zone = await page.evaluate(() => { const el = document.querySelector('[x-data*="historyRows"]'); const d = Alpine.$data(el); const k = Object.keys(d.treatmentsByZone || {}).find(k => (d.treatmentsByZone[k] || []).length >= 2 && k !== 'gesicht') || Object.keys(d.treatmentsByZone || {})[0]; return k; });
  console.log('Zone', zone);
  await page.evaluate((k) => window.dispatchEvent(new CustomEvent('treatment-zone-clicked', { detail: { zoneKey: k, zoneName: k } })), zone);
  await L.wait(page, 1500);
  await page.evaluate((k) => { const d = Alpine.$data(document.querySelector('[x-data*="historyRows"]')); const e = d.treatmentsByZone[k][0]; e.not_treated = true; e.machine_head = null; e.used_ms = null; e.used_jules = null; d.zoneHistory = d.treatmentsByZone[k]; }, zone);
  await L.wait(page, 1000);
  await L.shot(page, 'n8-verlauf-nicht-behandelt', { marks: [
    { id: 'etikett', kind: 'badge', n: 1, sel: '.client-treatment-row .badge-glattt-danger', at: 'r' },
    { id: 'eintrag', kind: 'frame', color: 'teal', sel: '.table-glattt' },
  ]});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
