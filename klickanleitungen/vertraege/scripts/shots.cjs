/* Aufnahmelauf „Verträge".
   Diese Serie fotografiert Geld. Der Lauf **liest nur**: Fenster werden geöffnet und mit Escape
   verworfen. Ausdrücklich NIE gedrückt: „Betrag per SEPA einziehen" (holt sofort Geld), „Rate
   anhängen", „Änderungen an GoCardless senden", „Pausieren", „Fortsetzen", „Rate nachtragen",
   „Änderungen speichern", „Importieren", „Verwerfen".

   Jede Zeile des Plans ist ein Screenshot: Seite, optionale Vorbereitung (Reiter waehlen,
   Fenster oeffnen) und ob das Fenster danach verworfen wird. Die Markierungen kommen beim
   Nacharbeiten aus meta.json — der Lauf fotografiert die ganze Seite.

   Aufruf:  node scripts/shots.cjs              (alle)
            node scripts/shots.cjs vt1-liste   (einzeln)                                */
const L = require('./lib.cjs');

const PLAN = [
  { name: 'vt1-liste', url: '/hub/contracts' },
  { name: 'vt1-filter', url: '/hub/contracts', filter: true },
  { name: 'vt1-zeile', url: '/hub/contracts' },
  { name: 'vt2-kopf', url: '/hub/contracts/' + L.CONTRACT },
  { name: 'vt2-banner', url: '/hub/contracts/' + L.CONTRACT },
  { name: 'vt2-uebersicht', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Übersicht' },
  { name: 'vt2-bestaetigen', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Speichern', verwerfen: true },
  { name: 'vt2-kundin', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Übersicht' },
  { name: 'vt2-zusammenfassung', url: '/hub/contracts/' + L.CONTRACT },
  { name: 'vt2-verlauf', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Verlauf' },
  { name: 'vt2-emails', url: '/hub/contracts/' + L.CONTRACT, reiter: 'E-Mail-Historie' },
  { name: 'vt3-aufbau', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
  { name: 'vt3-ratenzeile', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
  { name: 'vt3-summen', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
  { name: 'vt4-aktionen', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
  { name: 'vt4-nachtragen', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Rate nachtragen', verwerfen: true },
  { name: 'vt4-verbuchen', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Zahlung verbuchen', verwerfen: true },
  { name: 'vt4-erste-rate', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
  { name: 'vt4-rls-ausgleich', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
  { name: 'vt5-vorpruefung', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
  { name: 'vt5-einziehen', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Betrag per SEPA einziehen', verwerfen: true },
  { name: 'vt5-anhaengen', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Rücklastschrift anhängen', verwerfen: true },
  { name: 'vt5-abgleich', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
  { name: 'vt5-legacy', url: L.CONTRACT_LEGACY ? '/hub/contracts/' + L.CONTRACT_LEGACY : null, reiter: 'Zahlungen & SEPA' },
  { name: 'vt6-raten-anpassen', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Offene Raten anpassen', verwerfen: true },
  { name: 'vt6-laufzeit', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Offene Raten anpassen', verwerfen: true },
  { name: 'vt6-pausieren', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Ratenzahlung pausieren', verwerfen: true },
  { name: 'vt6-fortsetzen', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Zahlungen fortsetzen', verwerfen: true },
  { name: 'vt6-gutschein', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
  { name: 'vt7-sepa-bereich', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
  { name: 'vt7-mandat-anlegen', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Mandat manuell anlegen', verwerfen: true },
  { name: 'vt7-bankverbindung', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Bankverbindung ändern', verwerfen: true },
  { name: 'vt7-mandat-info', url: '/hub/contracts/' + L.CONTRACT, oeffne: 'Mandat-Informationen ändern', verwerfen: true },
  { name: 'vt8-imports', url: '/hub/contracts', oeffne: 'Fehlgeschlagene Imports', verwerfen: true },
  { name: 'vt8-import-korrigieren', url: '/hub/contracts', oeffne: 'Daten ergänzen', verwerfen: true },
  { name: 'vt8-zuordnen', url: '/hub/contracts', oeffne: 'Vertrag zuordnen', verwerfen: true },
  { name: 'vt8-verwerfen', url: '/hub/contracts', oeffne: 'Verwerfen', verwerfen: true },
  { name: 'vt8-werber', url: '/hub/contracts/' + L.CONTRACT, reiter: 'Zahlungen & SEPA' },
];

(async () => {
  const nur = process.argv.slice(2);
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  let letzte = null;

  for (const p of PLAN) {
    if (nur.length && !nur.includes(p.name)) continue;
    if (!p.url) { console.log('UEBERSPRUNGEN', p.name, '— zugehoerige ID fehlt in der .env'); continue; }
    try {
      if (p.url !== letzte) { await L.goto(page, p.url, 3500); letzte = p.url; }
      if (p.reiter) { await L.clickText(page, 'button, a', p.reiter, 1500); }
      if (p.filter) { await L.clickText(page, '.table-filter-btn', '', 1200); }
      if (p.oeffne) {
        // Die Zahlungs-Aktionen stecken im Reiter „Zahlungen & SEPA" hinter dem Menü „Aktionen"
        let ok = await L.clickText(page, 'button, a', p.oeffne, 2000);
        if (!ok) {
          if (!p.reiter) await L.clickText(page, 'button, a', 'Zahlungen & SEPA', 1500);
          await L.clickText(page, 'button', 'Aktionen', 800);
          ok = await L.clickText(page, 'button, a', p.oeffne, 2000);
        }
        if (!ok) { console.log('NICHT GEFUNDEN:', p.oeffne, '— Beschriftung geaendert oder Recht fehlt'); }
        await L.wait(page, 1200);
      }
      await L.wait(page, 800);
      await L.shot(page, p.name, {});
      if (p.verwerfen) { await page.keyboard.press('Escape'); await L.wait(page, 600); letzte = null; }
    } catch (e) {
      console.log('FEHLER bei', p.name, '—', e.message.split('\n')[0]);
    }
  }
  console.log('Hinweis: Nichts gespeichert, nichts versendet, kein Einzug ausgeloest.');
  await browser.close();
})();
