/* Dokument O — Mein Bonus (Mitarbeiterinnen-Sicht)
   Nur Lesen. Am besten mit einem Zugang OHNE Management-Recht aufnehmen — dann zeigt der
   Kopf genau das, was die Mitarbeiterin sieht (kein Umschalter, keine Verwaltung).        */
const L = require('./lib.cjs');
const OPEN = process.env.KLICK_MONTH_OPEN || L.MONTH;   // laufender Monat: Hochrechnung sichtbar

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);

  // ── o1 Kopf des Boards (laufender Monat, damit Hochrechnung und Zustandszeile stimmen)
  await L.openBoard(page, { view: 'own', month: OPEN }, 3000);
  // Ohne Leitungs-Recht gibt es weder Monatsauswahl noch Umschalter — das Board zeigt den laufenden Monat.
  await L.shot(page, 'o1-board-kopf', { marks: [
    { id: 'monat', kind: 'badge', n: 1, sel: '.page-header-glattt .site-second-line, .page-header-glattt p', at: 'l' },
    { id: 'info', kind: 'badge', n: 2, sel: '.btn-glattt-info-trigger', at: 'l' },
  ]});

  // ── o2 Kennzahlen-Zeile
  await L.scrollTo(page, '.stat-strip-glattt', 'start');
  const clip = await L.clipOf(page, '.card-glattt', 20);
  await L.shot(page, 'o2-monat-ueberblick', { clip, noScroll: true, marks: [
    { id: 'gesichert', kind: 'badge', n: 1, ...L.byText('.stat-strip-glattt-label', 'Schon gesichert'), at: 'l' },
    { id: 'stand', kind: 'badge', n: 2, ...L.byText('.stat-strip-glattt-label', 'Aktueller Stand'), at: 'l' },
    { id: 'hoch', kind: 'badge', n: 3, ...L.byText('.stat-strip-glattt-label', 'Hochrechnung'), at: 'l' },
    { id: 'abwesenheit', kind: 'badge', n: 4, ...L.byText('.stat-strip-glattt-label', 'Abwesenheitstage'), at: 'l' },
  ]});

  // ── o3 Eine Ziel-Karte (die erste Karte des Rasters, ohne Challenge-Untertitel)
  await L.scrollTo(page, '.bonus-board-grid', 'start');
  const card = await page.evaluate(() => {
    // innerText statt textContent: der Challenge-Untertitel steckt versteckt in jeder Karte
    const c = [...document.querySelectorAll('.bonus-board-grid > .card-glattt')]
      .filter(e => e.offsetParent !== null)
      .find(e => !e.innerText.includes('Monats-Challenge'));
    if (!c) return null;
    c.dataset.klick = 'ziel';
    const b = c.getBoundingClientRect();
    return { x: Math.max(0, b.x - 16), y: Math.max(0, b.y - 16), width: b.width + 32, height: b.height + 32 };
  });
  if (card) {
    await L.shot(page, 'o3-zielkarte', { clip: card, noScroll: true, marks: [
      { id: 'status', kind: 'badge', n: 1, sel: '[data-klick="ziel"] .badge-glattt', at: 'r' },
      { id: 'wert', kind: 'badge', n: 2, sel: '[data-klick="ziel"] .bonus-goal-value', at: 'l' },
      { id: 'balken', kind: 'badge', n: 3, sel: '[data-klick="ziel"] .bonus-bar-glattt', at: 'l' },
      { id: 'praemie', kind: 'badge', n: 4, sel: '[data-klick="ziel"] .bonus-goal-notes', at: 'l' },   // Hinweiszeile: hier steht die Prämie, sobald „Erreicht"
      { id: 'rahmen', kind: 'frame', color: 'teal', sel: '[data-klick="ziel"] .bonus-bar-glattt' },
    ]});
  } else {
    console.log('KARTE FEHLT: keine Ziel-Karte ohne Challenge — anderen Monat oder Zugang wählen.');
  }

  // ── o4 Team-Karte „Dein Institut"
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.startsWith('Dein Institut'));
    h?.closest('.card-glattt')?.scrollIntoView({ block: 'center' });
    h?.closest('.card-glattt')?.setAttribute('data-klick', 'team');
  });
  await L.wait(page, 600);
  const team = await L.clipOf(page, '[data-klick="team"]', 16);
  await L.shot(page, 'o4-dein-institut', { clip: team, noScroll: true, marks: [
    { id: 'kpz', kind: 'badge', n: 1, sel: '[data-klick="team"] .bonus-goal-value', at: 'l' },
    { id: 'ziel', kind: 'badge', n: 2, sel: '[data-klick="team"] .bonus-bar-label-target', at: 'l' },
    { id: 'balken', kind: 'frame', color: 'teal', sel: '[data-klick="team"] .bonus-bar-glattt' },
  ]});

  await browser.close();
})();
