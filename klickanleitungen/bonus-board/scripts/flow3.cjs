/* Dokument Q — Bonus-Board für die Leitung (Management-Sicht)
   Braucht einen Zugang MIT dem Management-Recht. Nur Lesen; der Export wird nicht ausgelöst,
   die Knöpfe werden lediglich markiert.                                                    */
const L = require('./lib.cjs');
const OPEN = process.env.KLICK_MONTH_OPEN || L.MONTH;

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openBoard(page, { view: 'management', month: OPEN }, 3500);

  // ── q1 Kopf in der Management-Sicht
  await L.shot(page, 'q1-management-kopf', { marks: [
    { id: 'umschalter', kind: 'chip', label: 'Hier umschalten', sel: '.segmented-control-glattt', at: 'l' },
    { id: 'monat', kind: 'badge', n: 1, sel: '.dropdown-glattt', at: 'l' },
    { id: 'verwaltung', kind: 'badge', n: 2, ...L.byText('.btn-glattt-secondary', 'Verwaltung'), at: 'l' },
  ]});

  // ── q2 Institute vs. Minimalziele
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.startsWith('Institute vs.'));
    const c = h?.closest('.card-glattt'); if (!c) return;
    c.dataset.klick = 'inst'; c.scrollIntoView({ block: 'start' });
  });
  await L.wait(page, 600);
  const inst = await L.clipOf(page, '[data-klick="inst"]', 16);
  await L.shot(page, 'q2-institute-ziele', { clip: inst, noScroll: true, marks: [
    { id: 'ist', kind: 'badge', n: 1, ...L.byText('[data-klick="inst"] th', 'KPZ Ist'), at: 't' },
    { id: 'gesichert', kind: 'badge', n: 2, ...L.byText('[data-klick="inst"] th', 'Gesichert'), at: 't' },
    { id: 'ziel', kind: 'badge', n: 3, ...L.byText('[data-klick="inst"] th', 'Minimalziel'), at: 't' },
    { id: 'hoch', kind: 'badge', n: 4, ...L.byText('[data-klick="inst"] th', 'Hochrechnung'), at: 't' },
    { id: 'status', kind: 'frame', sel: '[data-klick="inst"] tbody tr' },
  ]});

  // ── q3 Boni je Mitarbeiterin
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.startsWith('Boni je'));
    const c = h?.closest('.card-glattt'); if (!c) return;
    c.dataset.klick = 'pers'; c.scrollIntoView({ block: 'start' });
  });
  await L.wait(page, 600);
  const pers = await L.clipOf(page, '[data-klick="pers"]', 16);
  await L.shot(page, 'q3-personen', { clip: pers, noScroll: true, marks: [
    { id: 'gruppe', kind: 'badge', n: 1, sel: '[data-klick="pers"] tbody tr', at: 'l' },
    { id: 'klasse', kind: 'badge', n: 2, ...L.byText('[data-klick="pers"] th', 'Klasse'), at: 't' },
    { id: 'abwesenheit', kind: 'badge', n: 3, ...L.byText('[data-klick="pers"] th', 'Abwesenheit'), at: 't' },
    { id: 'ziele', kind: 'badge', n: 4, ...L.byText('[data-klick="pers"] th', 'Erreichte Ziele'), at: 't' },
  ]});

  // ── q4 Offene Widerrufe mit Bonus-Relevanz
  const hasRevocations = await page.evaluate(() => {
    const h = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.startsWith('Offene Widerrufe'));
    const c = h?.closest('.card-glattt'); if (!c) return false;
    c.dataset.klick = 'wid'; c.scrollIntoView({ block: 'start' });
    return true;
  });
  await L.wait(page, 600);
  if (hasRevocations) {
    const wid = await L.clipOf(page, '[data-klick="wid"]', 16);
    await L.shot(page, 'q4-widerrufe', { clip: wid, noScroll: true, marks: [
      { id: 'vertrag', kind: 'badge', n: 1, ...L.byText('[data-klick="wid"] th', 'Vertrag'), at: 't' },
      { id: 'kpz', kind: 'badge', n: 2, ...L.byText('[data-klick="wid"] th', 'KPZ'), at: 't' },
      { id: 'link', kind: 'chip', label: 'Zur Verwaltung', sel: '[data-klick="wid"] .alert-glattt-link', at: 'l' },
    ]});
  } else {
    console.log('Keine offenen Widerrufe im Monat — q4 fehlt. Anderen Monat wählen.');
  }

  // ── q5 Export-Knöpfe (nur markieren, nicht auslösen)
  // Die Knöpfe sitzen im Kopf der Karte „Boni je Mitarbeiterin" — dorthin scrollen, sonst zeigt das Bild nur die Ranking-Tabelle
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.startsWith('Boni je'));
    h?.closest('.card-glattt')?.scrollIntoView({ block: 'start' });
  });
  await L.wait(page, 600);
  await L.shot(page, 'q5-export', { noScroll: true, marks: [
    { id: 'csv', kind: 'badge', n: 1, ...L.byText('a, button', 'CSV'), at: 'l' },
    { id: 'pdf', kind: 'badge', n: 2, ...L.byText('a, button', 'PDF'), at: 'l' },
  ]});

  await browser.close();
})();
