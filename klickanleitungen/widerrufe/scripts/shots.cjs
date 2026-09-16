/* Aufnahmelauf „Widerrufe".
   Der Lauf **legt keinen Widerruf an und schliesst keinen ab**. Der Assistent wird durchgeklickt
   und abgebrochen. NIE gedrückt: „Widerruf erfassen", „Abschliessen", „Stornieren" (SEPA),
   „Ausgewaehlte Pakete auf 0 setzen", „Abgeben", „Jetzt wirksam schalten", „Widerruf eintragen".

   Jede Zeile des Plans ist ein Screenshot: Seite, optionale Vorbereitung (Reiter waehlen,
   Fenster oeffnen) und ob das Fenster danach verworfen wird. Die Markierungen kommen beim
   Nacharbeiten aus meta.json — der Lauf fotografiert die ganze Seite.

   Aufruf:  node scripts/shots.cjs              (alle)
            node scripts/shots.cjs wd1-liste   (einzeln)                                */
const L = require('./lib.cjs');

const PLAN = [
  { name: 'wd1-liste', url: '/hub/cancellations' },
  { name: 'wd1-wizard-1', url: '/hub/cancellations', oeffne: 'Neuer Widerruf', verwerfen: true },
  { name: 'wd1-wizard-2', url: '/hub/cancellations', oeffne: 'Neuer Widerruf', verwerfen: true },
  { name: 'wd1-wizard-3', url: '/hub/cancellations', oeffne: 'Neuer Widerruf', verwerfen: true },
  { name: 'wd2-fallseite', url: '/hub/cancellations/' + L.CASE },
  { name: 'wd2-bearbeiten', url: '/hub/cancellations/' + L.CASE, oeffne: 'Fall bearbeiten', verwerfen: true },
  { name: 'wd2-dokumente', url: '/hub/cancellations/' + L.CASE },
  { name: 'wd2-wiedervorlage', url: '/hub/cancellations/' + L.CASE },
  { name: 'wd3-angebot', url: '/hub/cancellations/' + L.CASE, oeffne: 'Vertragsänderung im Fernabsatz', verwerfen: true },
  { name: 'wd3-versand', url: '/hub/cancellations/' + L.CASE, oeffne: 'Vertragsänderung im Fernabsatz', verwerfen: true },
  { name: 'wd3-schwebend', url: '/hub/cancellations/' + L.CASE },
  { name: 'wd3-folgewiderruf', url: '/hub/cancellations/' + L.CASE, oeffne: 'Widerruf des Folgevertrags', verwerfen: true },
  { name: 'wd4-sepa', url: '/hub/cancellations/' + L.CASE, oeffne: 'SEPA-Mandat stornieren', verwerfen: true },
  { name: 'wd4-phorest', url: '/hub/cancellations/' + L.CASE, oeffne: 'Phorest-Pakete', verwerfen: true },
  { name: 'wd4-downgrade', url: '/hub/cancellations/' + L.CASE, oeffne: 'Downgrade', verwerfen: true },
  { name: 'wd4-abgabe', url: '/hub/cancellations/' + L.CASE, oeffne: 'Forderungsmanagement abgeben', verwerfen: true },
  { name: 'wd5-ra', url: L.CASE_RA ? '/hub/cancellations/' + L.CASE_RA : '/hub/cancellations/' + L.CASE },
  { name: 'wd5-kosten', url: L.CASE_RA ? '/hub/cancellations/' + L.CASE_RA : '/hub/cancellations/' + L.CASE, oeffne: 'Kostenposition erfassen', verwerfen: true },
  { name: 'wd5-schriftwechsel', url: L.CASE_RA ? '/hub/cancellations/' + L.CASE_RA : '/hub/cancellations/' + L.CASE, oeffne: 'Schriftwechsel festhalten', verwerfen: true },
  { name: 'wd5-abschliessen', url: '/hub/cancellations/' + L.CASE, oeffne: 'Widerruf abschließen', verwerfen: true },
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
