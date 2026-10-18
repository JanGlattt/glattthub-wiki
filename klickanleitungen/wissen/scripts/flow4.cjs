/* Wissen 4 — Struktur, Startseite, Redaktion, Versionen, Drive. Nur Lesen: nichts gespeichert. */
const L = require('./lib.cjs');
const DEMO = process.env.KLICK_WISSEN_DEMO || '313';
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/wissen/redaktion', 3000);
  await page.evaluate(() => { const c = document.querySelector('.wissen-struct-tree').closest('[x-data]'); Alpine.$data(c).spaceKey = 'leitung'; });
  await L.wait(page, 1800);
  await L.scrollTo(page, '.wissen-struct-tree', 'start'); await page.evaluate(() => window.scrollBy(0, -140)); await L.wait(page, 400);
  await L.shot(page, 'w15-struktur', { noScroll: true, marks: [
    { id: 'bereich', kind: 'badge', n: 1, sel: '.wissen-struct-space', at: 'l' },
    { id: 'griff', kind: 'badge', n: 2, sel: '.wissen-struct-tree > ul > li:nth-child(2) > .wissen-struct-row .wissen-struct-handle', at: 'l' },
    { id: 'pfeile', kind: 'frame', color: 'teal', sel: '.wissen-struct-tree > ul > li:nth-child(2) > .wissen-struct-row .wissen-struct-tools' },
    { id: 'speichern', kind: 'chip', label: 'Speichern', ...L.byText('.wissen-struct-bar button', 'Struktur speichern'), at: 'l' },
  ]});
  await L.goto(page, '/hub/wissen/leitung', 2500);
  await L.shot(page, 'w16-startseite', { marks: [
    { id: 'bearbeiten', kind: 'badge', n: 1, ...L.byText('.wissen-head-actions a', 'Startseite'), at: 'l' },
    { id: 'inhalt', kind: 'frame', color: 'teal', sel: '.wissen-space-start' },
  ]});
  await L.goto(page, '/hub/wissen/redaktion', 3000);
  await L.scrollTo(page, '#rueckmeldungen', 'start'); await page.evaluate(() => window.scrollBy(0, -140)); await L.wait(page, 400);
  await L.shot(page, 'w17-redaktion', { noScroll: true, marks: [
    { id: 'erledigt', kind: 'badge', n: 1, sel: '#rueckmeldungen tbody tr .wissen-btn', at: 'l' },
    { id: 'drive', kind: 'badge', n: 3, ...L.byText('.wissen-head-actions a', 'Drive-Dokumente'), at: 'l' },
  ]});
  await L.goto(page, '/hub/wissen/bearbeiten/279/versionen', 2500);
  await L.shot(page, 'w18-versionen', { marks: [
    { id: 'von', kind: 'badge', n: 2, sel: '.wissen-diff-pick', at: 'l' },
    { id: 'bilanz', kind: 'badge', n: 2, sel: '.wissen-diff-summary', at: 'r' },
    { id: 'zurueck', kind: 'chip', label: 'Zurückholen', sel: '.wissen-diff-restore button', at: 'r' },
  ]});
  await L.goto(page, '/hub/wissen/drive?q=Checklist', 2500);
  await L.shot(page, 'w19-drive', { marks: [
    { id: 'suche', kind: 'badge', n: 1, sel: '.wissen-drive-search .search-glattt-wrapper-flex', at: 'l' },
    { id: 'bereich', kind: 'badge', n: 2, sel: '.wissen-drive-space', at: 'l' },
    { id: 'uebernehmen', kind: 'chip', label: 'Übernehmen', sel: '.wissen-drive-import .wissen-btn', at: 'l' },
  ]});
  await browser.close();
})();
