/* Grundlagen 4 — Auf dem Handy und Tablet
   Nimmt mit Telefon-Viewport (390 × 844) auf, dem Prüfmass des mobilen Seiten-Musters.   */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.phone();
  await L.login(page, ctx);

  // ── j1 Menüleiste unten
  await L.goto(page, '/hub', 3000);
  await L.shot(page, 'j1-bottom-nav', { marks: [
    { id: 'leiste', kind: 'frame', color: 'teal', sel: '.mobile-bottom-nav' },
    { id: 'mehr', kind: 'chip', label: 'Alles Weitere', ...L.byText('.mobile-bottom-nav *', 'Mehr'), at: 't' },
  ]});

  // ── j2 Mehr-Menü
  await L.clickText(page, '.mobile-bottom-nav button, .mobile-bottom-nav a', 'Mehr', 1500);
  await L.shot(page, 'j2-mehr-sheet', { marks: [
    { id: 'menue', kind: 'badge', n: 1, ...L.byText('.more-sheet *, button, div', 'Menü'), at: 'r' },
    { id: 'standort', kind: 'badge', n: 2, ...L.byText('.more-sheet *, button, div', 'Standort'), at: 'r' },
    { id: 'rundgang', kind: 'badge', n: 4, ...L.byText('.more-sheet *, button, div', 'Rundgang'), at: 'r' },
  ]});
  await page.keyboard.press('Escape');
  await L.wait(page, 800);

  // ── j3 Zustandszeile mit Werkzeugen (Terminseite hat sie)
  await L.goto(page, '/hub/appointments', 4000);
  await L.shot(page, 'j3-zustandszeile', { marks: [
    { id: 'zeile', kind: 'chip', label: 'Antippen', sel: '.page-header-glattt-state', at: 'r' },
  ]});

  // ── j4 Tabelle auf dem Handy
  await L.goto(page, '/hub/clients', 4000);
  await L.shot(page, 'j4-tabelle-mobil', { marks: [
    { id: 'tabelle', kind: 'frame', color: 'teal', sel: '.table-glattt' },
  ]});

  await browser.close();
})();
