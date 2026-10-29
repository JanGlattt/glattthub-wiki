/* Aufnahme t4/t5 (30.10.2026): Seite „Bewertungen & Trinkgeld“ — Kopf mit Kennzahlen (Sterne zuerst)
   und die Belegliste der Bewertungen mit Filter. Lokal gegen Beispiel-Bewertungen aufgenommen.
   Aufruf: node scripts/reshoot-trinkgeld.cjs */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/staff/trinkgeld', 4000);
  await L.wait(page, 2500);
  await L.shot(page, 't4-seite-trinkgeld', { marks: [
    { id: 'zeitraum', kind: 'badge', n: 1, sel: '.page-header-glattt-actions .form-glattt-group', at: 'l' },
    { id: 'kpis', kind: 'badge', n: 2, sel: '.kpi-card-featured', at: 'l' },
    { id: 'umschalter', kind: 'badge', n: 3, sel: '.segmented-control-glattt-sm', at: 'l' },
  ]});

  // Belegliste: Karte nach oben holen, Filter „Kritik“ wählen
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.trim() === 'Bewertungen');
    window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 24);
  });
  await L.wait(page, 800);
  const clip = await page.evaluate(() => {
    const card = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.trim() === 'Bewertungen').closest('.card-glattt');
    const b = card.getBoundingClientRect();
    return { x: Math.max(0, b.x - 8), y: Math.max(0, b.y - 8), width: b.width + 16, height: Math.min(b.height + 16, window.innerHeight - Math.max(0, b.y - 8)) };
  });
  await L.shot(page, 't5-bewertungen-liste', { clip, noScroll: true, marks: [
    { id: 'filter', kind: 'badge', n: 1, sel: '.tips-ratings-toolbar .segmented-control-glattt', at: 'l' },
    { id: 'behandlerin', kind: 'badge', n: 2, sel: '.tips-ratings-toolbar .form-glattt-group', at: 'l' },
    { id: 'kundin', kind: 'badge', n: 3, sel: 'a.tips-rating-client', at: 'l' },
    { id: 'sterne', kind: 'badge', n: 4, sel: '.tips-rating-scores', at: 'r' },
  ]});
  await browser.close();
})();
