/* Aufnahme Team 6 „glattt Coach“ (01.11.2026): Startseite, Kundentypen, Zuweisung anlegen, Gesprächsraum
   (laufende Einheit per „Fortsetzen“), Ergebnis, Verlauf mit Statistiken, Admin. Lokal gegen Beispieldaten
   (Seed im Scratchpad: Kollegin „Mia Beispiel“, Zuweisung, bewertete Prüfung 78, laufende Übung).
   Der Lauf startet keine KI-Einheit und schickt nichts an Claude/Google/Simli.
   Aufruf: node scripts/coach.cjs */
const L = require('./lib.cjs');
const alpine = (page, fn) => page.evaluate((src) => { const d = Alpine.$data(document.querySelector('.coach-page')); return (new Function('d', src))(d); }, fn);

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/coach', 3500);
  await L.waitLoaded(page);
  await L.wait(page, 1500);

  await L.shot(page, 'c1-coach-start', { marks: [
    { id: 'modus', kind: 'badge', n: 1, sel: '.coach-mode-switch', at: 'l' },
    { id: 'wochenstand', kind: 'badge', n: 2, sel: '.stat-strip-glattt', at: 'l' },
    { id: 'zugewiesen', kind: 'badge', n: 3, sel: '.coach-assignment', at: 'l' },
    { id: 'verlauf', kind: 'badge', n: 4, sel: '.page-header-glattt-actions .btn-glattt-secondary', at: 'l' },
  ]});

  // Kundentypen: Karte nach oben holen
  const typClip = await L.cardClip(page, 'Kundentyp wählen');
  await L.shot(page, 'c2-coach-typen', { clip: typClip, noScroll: true, marks: [
    { id: 'modul', kind: 'badge', n: 1, sel: '.coach-chips .coach-chip.is-active', at: 'l' },
    { id: 'karte', kind: 'badge', n: 2, sel: '.coach-type-card', at: 'r' },
    { id: 'stand', kind: 'badge', n: 3, sel: '.coach-type-card .badge-glattt', at: 'r' },
  ]});

  // Zuweisungen verwalten + Modal
  await page.evaluate(() => window.scrollTo(0, 0));
  await alpine(page, 'd.openAssign()');
  await L.wait(page, 900);
  const modalClip = await L.clipOf(page, '.modal-glattt', 10);
  await L.shot(page, 'c3-coach-zuweisung', { clip: modalClip, noScroll: true, marks: [
    { id: 'fuer', kind: 'badge', n: 1, sel: '.coach-assign-target', at: 'l' },
    { id: 'personen', kind: 'badge', n: 2, sel: '.coach-people', at: 'l' },
    { id: 'modul', kind: 'badge', n: 3, sel: '.modal-glattt .form-glattt-row-2-cols', at: 'l' },
    { id: 'zuweisen', kind: 'badge', n: 4, sel: '.modal-glattt-footer .btn-glattt-primary', at: 'l' },
  ]});
  await alpine(page, 'd.assignOpen = false');
  await L.wait(page, 400);

  // Gesprächsraum über die laufende Einheit (kein KI-Aufruf: resume() lädt nur den Stand)
  await alpine(page, 'd.resume()');
  await L.wait(page, 2500);
  await alpine(page, 'd.stopListening(); d.listening = true; d.partial = "Ich verstehe, du möchtest sicher sein, dass es sich lohnt"; d.stageNotice = ""; d.typedOpen = false; d.customerText = "Ich habe schon mal gelesen, dass Laser nicht bei jedem wirkt. Woher weiß ich, dass es bei mir klappt?"');
  await L.wait(page, 500);
  await L.shot(page, 'c4-coach-gespraech', { noScroll: true, marks: [
    { id: 'kundin', kind: 'badge', n: 1, sel: '.coach-caption', at: 'l' },
    { id: 'souffleur', kind: 'badge', n: 2, sel: '.coach-souffleur', at: 'l' },
    { id: 'zuhoeren', kind: 'badge', n: 3, sel: '.coach-listen-row', at: 'l' },
    { id: 'knoepfe', kind: 'badge', n: 4, sel: '.coach-stage-controls', at: 'l' },
    { id: 'zeit', kind: 'badge', n: 5, sel: '.coach-stage-timer', at: 'l' },
  ]});
  await alpine(page, 'd.teardownStage()');
  await L.wait(page, 500);

  // Ergebnis der bewerteten Prüfung
  const examId = await page.evaluate(async () => {
    const r = await fetch('/hub/coach/verlauf?scope=me', { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }).then(x => x.json());
    return (r.data.find(s => s.mode === 'exam' && s.score) || r.data[0]).id;
  });
  await alpine(page, `d.openResult(${examId})`);
  await L.wait(page, 2500);
  await page.evaluate(() => { try { GlatttCelebrations.hideStage(); } catch (e) {} });
  await L.wait(page, 300);
  await L.shot(page, 'c5-coach-ergebnis', { marks: [
    { id: 'score', kind: 'badge', n: 1, sel: '.coach-score-ring', at: 'l' },
    { id: 'dimensionen', kind: 'badge', n: 2, sel: '.coach-dim', at: 'l' },
    { id: 'phasen', kind: 'badge', n: 3, sel: '.coach-phase-row', at: 'r' },
  ]});
  const stark = await L.cardClip(page, 'Daran arbeiten');
  await L.shot(page, 'c6-coach-verbesserungen', { clip: stark, noScroll: true, marks: [
    { id: 'zitat', kind: 'badge', n: 1, sel: '.coach-feedback-bad blockquote', at: 'l' },
  ]});

  // Verlauf mit Statistiken
  await alpine(page, 'd.showHistory()');
  await L.wait(page, 1500);
  await alpine(page, 'd.historyScope = "team"; d.loadHistory()');
  await L.wait(page, 4500);
  await L.waitLoaded(page);
  await L.shot(page, 'c7-coach-verlauf', { marks: [
    { id: 'umfang', kind: 'badge', n: 1, sel: '.segmented-control-glattt[aria-label="Umfang"]', at: 'l' },
    { id: 'zeile', kind: 'badge', n: 2, sel: '.coach-history-row', at: 'l' },
  ]});
  const statsClip = await L.cardClip(page, 'glattt Coach: Prüfungen und Score im Verlauf');
  await L.shot(page, 'c8-coach-statistik', { clip: { ...statsClip, width: Math.min(statsClip.width * 2 + 24, page.viewportSize().width - statsClip.x) }, noScroll: true, marks: [] });

  // Admin-Seiten (Kundentypen, Einstellungen) gehören in die Serie Admin — hier bewusst nicht aufgenommen.

  await browser.close();
})();
