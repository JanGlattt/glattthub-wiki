/* Grundlagen 2 — Standort, Suche & Mitteilungen
   Nur Lesen: Der Standort wird zwar geöffnet, aber nicht umgestellt (er bliebe sonst
   für die nächste Person gesetzt — die Wahl überlebt das Abmelden).                       */
const L = require('./lib.cjs');
const SEARCH = process.env.KLICK_SEARCH || 'Verträge';

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/start', 2500);

  // ── h1 Standortwahl (nur öffnen)
  await L.tool(page, 'Institute', 1500);
  await L.shot(page, 'h1-standort', { marks: [
    { id: 'knopf', kind: 'badge', n: 1, ...L.byText('.sidebar-action-text', 'Institute'), at: 'r' },
    { id: 'alle', kind: 'badge', n: 3, ...L.byText('.branch-card-name', 'Alle Standorte'), at: 'r' },
    { id: 'karten', kind: 'frame', color: 'teal', sel: '.branch-cards-container' },
    { id: 'ausgeblendet', kind: 'chip', label: 'Zählt nicht mit', sel: '.branch-card-hidden-badge', at: 'r' },
  ]});
  await L.tool(page, 'Institute', 800);   // wieder zuklappen, nichts umstellen

  // ── h2/h3 Suche
  await L.tool(page, 'Suche', 1200);
  await L.shot(page, 'h2-suche', { marks: [
    { id: 'feld', kind: 'badge', n: 1, sel: '.sidebar-search, input[type="search"]', at: 'l' },
    { id: 'kuerzel', kind: 'chip', label: 'Tastenkürzel', sel: '.global-search-kbd', at: 'r' },
  ]});
  await page.fill('.sidebar-search, input[type="search"]', SEARCH);
  await L.wait(page, 2000);
  await L.shot(page, 'h3-suche-treffer', { marks: [
    { id: 'gruppe', kind: 'badge', n: 3, sel: '.global-search-group-label', at: 'r' },
    { id: 'treffer', kind: 'chip', label: 'Öffnet die Seite', sel: '.global-search-item', at: 'r' },
  ]});

  // ── h4/h5 Mitteilungen
  await L.tool(page, 'Mitteilungen', 2000);
  await L.shot(page, 'h4-mitteilungen', { marks: [
    { id: 'zaehler', kind: 'badge', n: 1, sel: '.sidebar-action-badge', at: 'r' },
    { id: 'alle', kind: 'chip', label: 'Liste aufräumen', sel: '.notifications-mark-all-btn', at: 'l' },
  ]});
  const opened = await page.evaluate(() => {
    const item = [...document.querySelectorAll('.notification-item, .notifications-list > *')]
      .find(e => e.offsetParent !== null);
    if (!item) return false;
    item.click();
    return true;
  });
  await L.wait(page, 1500);
  if (opened) {
    await L.shot(page, 'h5-mitteilung-detail', { marks: [
      { id: 'zurueck', kind: 'badge', n: 2, ...L.byText('button, a', 'Zurück'), at: 'r' },
      { id: 'oeffnen', kind: 'chip', label: 'Zum Vorgang', ...L.byText('a', 'Öffnen'), at: 'l' },
    ]});
  } else {
    console.log('Keine Mitteilung vorhanden — h5 fehlt. Konto mit Mitteilungen wählen.');
  }

  await browser.close();
})();
