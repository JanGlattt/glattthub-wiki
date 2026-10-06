/* Grundlagen 2 — Standort, Suche & Mitteilungen (+ Meine Benachrichtigungen)
   Nur Lesen: Der Standort wird zwar geöffnet, aber nicht umgestellt (er bliebe sonst
   für die nächste Person gesetzt — die Wahl überlebt das Abmelden). Die Kanal-Schalter
   der Karte „Meine Benachrichtigungen“ werden nur fotografiert, nicht umgelegt.          */
const L = require('./lib.cjs');
const SEARCH = process.env.KLICK_SEARCH || 'Verträge';

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub', 2500);

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

  // ── h8 Posteingang (Mitteilungsseite, Reiter „Posteingang“ — seit 06.10.2026)
  await L.goto(page, '/hub/notifications', 2500);
  await page.waitForFunction(() => {
    const root = document.querySelector('.notif-page-glattt');
    return root && !Alpine.$data(root).loading;
  }, null, { timeout: 15000 }).catch(() => console.log('Hinweis: Posteingang lud nicht'));
  await L.shot(page, 'h8-posteingang', { marks: [
    { id: 'reiter', kind: 'badge', n: 1, sel: '.notif-page-glattt .segmented-control-glattt', at: 'l' },
    { id: 'filter', kind: 'badge', n: 2, sel: '.notif-inbox-filters', at: 'l' },
    { id: 'zeile', kind: 'badge', n: 3, sel: '.notif-inbox-row', at: 'l' },
    { id: 'alle', kind: 'badge', n: 4, fn: () => { const b = [...document.querySelectorAll('.notif-page-glattt .page-header-glattt-actions button')].find(e => e.textContent.includes('Alle als gelesen')); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, at: 'b' },
  ] });

  // ── h6 Meine Benachrichtigungen (Reiter „Einstellungen“ der Mitteilungsseite)
  await page.evaluate(() => document.querySelectorAll('input[name=notif-tab]')[1]?.click());
  await page.waitForFunction(() => {
    const card = document.querySelector('#notification-preferences');
    return card && !Alpine.$data(card).loading;
  }, null, { timeout: 15000 }).catch(() => console.log('Hinweis: Karte „Meine Benachrichtigungen“ lud nicht'));
  await L.wait(page, 600);
  const toggle = (label) => { const l = [...document.querySelectorAll('#notification-preferences .toggle-glattt-label')].find(e => e.textContent.trim() === label && e.offsetParent !== null); if (!l) return null; const b = l.closest('.toggle-glattt-wrapper').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
  await L.shot(page, 'h6-meine-benachrichtigungen', { marks: [
    { id: 'reiter', kind: 'badge', n: 1, fn: () => { const l = document.querySelectorAll('.notif-page-glattt .segmented-control-glattt-option')[1]; if (!l) return null; const r = l.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, at: 'b' },
    { id: 'modul', kind: 'badge', n: 2, sel: '#notification-preferences .notif-pref-glattt-group-head', at: 'l' },
    { id: 'hub', kind: 'badge', n: 3, fn: toggle, fnArg: 'Im Hub', at: 'l' },
    { id: 'push', kind: 'badge', n: 4, fn: toggle, fnArg: 'Push', at: 'r' },
  ] });

  await browser.close();
})();
