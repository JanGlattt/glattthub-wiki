/* Aufnahmelauf „Forderungen".
   Der Lauf **verschickt keine Mahnung und bewegt kein Geld**. Fenster werden geöffnet und
   verworfen. NIE gedrückt: „Ausfuehren" am naechsten Prozessschritt (verschickt E-Mail bzw.
   erzeugt den Brief), „Zahlung erfassen", „RZV festhalten", „Plan aendern", „Ruhend stellen",
   „Abschreiben", „Link erzeugen", „Fortsetzen", „Nachtragen", „Erfassen" (Kosten).

   Jede Zeile des Plans ist ein Screenshot: Seite, optionale Vorbereitung (Reiter waehlen,
   Fenster oeffnen) und ob das Fenster danach verworfen wird. Die Markierungen kommen beim
   Nacharbeiten aus meta.json — der Lauf fotografiert die ganze Seite.

   Aufruf:  node scripts/shots.cjs              (alle)
            node scripts/shots.cjs fo1-uebersicht   (einzeln)                                */
const L = require('./lib.cjs');

const PLAN = [
  { name: 'fo1-uebersicht', url: '/hub/receivables' },
  { name: 'fo1-anlegen', url: '/hub/receivables', oeffne: 'ohne Vertrag anlegen', verwerfen: true },
  { name: 'fo1-gerichtlich', url: '/hub/receivables' },
  { name: 'fo2-aufstellung', url: '/hub/receivables/' + L.CASE },
  { name: 'fo2-sidebar', url: '/hub/receivables/' + L.CASE },
  { name: 'fo2-anschrift', url: '/hub/receivables/' + L.CASE, oeffne: 'Anschrift korrigieren', verwerfen: true },
  { name: 'fo2-verlauf', url: '/hub/receivables/' + L.CASE, reiter: 'Verlauf' },
  { name: 'fo2-zahlungen', url: '/hub/receivables/' + L.CASE, reiter: 'Zahlungen' },
  { name: 'fo3-naechster-schritt', url: '/hub/receivables/' + L.CASE },
  { name: 'fo3-faellig', url: '/hub/receivables/' + L.CASE },
  { name: 'fo3-rls-entscheid', url: '/hub/receivables/' + L.CASE },
  { name: 'fo3-extern', url: '/hub/receivables/' + L.CASE, oeffne: 'extern erledigt', verwerfen: true },
  { name: 'fo4-zahlung', url: '/hub/receivables/' + L.CASE, oeffne: 'Zahlungseingang erfassen', verwerfen: true },
  { name: 'fo4-storno', url: '/hub/receivables/' + L.CASE, reiter: 'Zahlungen' },
  { name: 'fo4-bezahllink', url: '/hub/receivables/' + L.CASE, oeffne: 'Sammel-Bezahllink', verwerfen: true },
  { name: 'fo4-sepa', url: '/hub/receivables/' + L.CASE },
  { name: 'fo4-kosten', url: '/hub/receivables/' + L.CASE, oeffne: 'Kostenposition erfassen', verwerfen: true },
  { name: 'fo5-rzv-anlegen', url: '/hub/receivables/' + L.CASE, oeffne: 'Ratenzahlungsvereinbarung', verwerfen: true },
  { name: 'fo5-rzv-aendern', url: L.CASE_RZV ? '/hub/receivables/' + L.CASE_RZV : null, oeffne: 'Zahlungsplan ändern', verwerfen: true },
  { name: 'fo5-rzv-verfolgen', url: L.CASE_RZV ? '/hub/receivables/' + L.CASE_RZV : null, reiter: 'Ratenzahlung' },
  { name: 'fo6-weiche', url: '/hub/receivables/' + L.CASE },
  { name: 'fo6-gerichtlich', url: L.CASE_JUDICIAL ? '/hub/receivables/' + L.CASE_JUDICIAL : null, reiter: 'Gerichtliches Verfahren' },
  { name: 'fo6-ruhend', url: '/hub/receivables/' + L.CASE, oeffne: 'ruhend stellen', verwerfen: true },
  { name: 'fo6-abschluss', url: '/hub/receivables/' + L.CASE, oeffne: 'Abschreiben', verwerfen: true },
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
        const ok = await L.clickText(page, 'button, a', p.oeffne, 2000);
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
