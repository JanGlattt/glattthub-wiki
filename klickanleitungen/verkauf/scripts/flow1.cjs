/* Verkauf 1 — Vertragsliste. Nur Lesen. */
const L = require('./lib.cjs');
const SEARCH = process.env.KLICK_SEARCH || '';

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/contracts', 3500);

  await L.shot(page, 'v1-liste', { marks: [
    { id: 'suche', kind: 'badge', n: 1, sel: '.search-glattt, input[type="search"]', at: 'l' },
    { id: 'sortieren', kind: 'badge', n: 3, ...L.byText('th', 'Vertragsnr'), at: 't' },
    { id: 'preislisten', kind: 'chip', label: 'Eigene Anleitung', ...L.byText('.btn-glattt-primary', 'Preisliste'), at: 'l' },
  ]});

  // Filterpanel
  await L.clickText(page, '.btn-glattt-secondary', 'Filter', 1200);
  await L.shot(page, 'v2-filter', { marks: [
    { id: 'panel', kind: 'frame', color: 'teal', sel: '.filter-panel, .card-glattt' },
    { id: 'mandat', kind: 'badge', n: 2, ...L.byText('label, .form-glattt-label', 'Mandat'), at: 'l' },
  ]});
  await L.clickText(page, '.btn-glattt-secondary', 'Filter', 800);

  // Eine Zeile hervorheben
  if (SEARCH) { await page.fill('.search-glattt, input[type="search"]', SEARCH); await L.wait(page, 1800); }
  const row = await page.evaluate(() => {
    const tr = [...document.querySelectorAll('tbody tr')].find(e => e.offsetParent !== null);
    if (!tr) return null;
    tr.dataset.klick = 'zeile';
    const b = tr.getBoundingClientRect();
    return { x: 0, y: Math.max(0, b.y - 60), width: window.innerWidth, height: b.height + 120 };
  });
  if (row) {
    await L.shot(page, 'v3-zeile', { clip: row, noScroll: true, marks: [
      { id: 'status', kind: 'badge', n: 1, sel: '[data-klick="zeile"] .badge-glattt', at: 'l' },
    ]});
  } else { console.log('Keine Vertragszeile sichtbar — v3 fehlt.'); }

  await browser.close();
})();
