/* Aufnahme t4/t4b/t5 (30.10.2026, erweitert 27.11.2026): Seite „Bewertungen & Trinkgeld“ — Kopf mit
   Kennzahlen (Sterne zuerst), die Karte „Sterne nach Sitzungsnummer“ und die Belegliste der Bewertungen
   mit Filter und Sitzungsnummer. Lokal gegen erfundene Beispiel-Bewertungen aufgenommen (Sitzungsnummern
   brauchen dazu bezahlte Behandlungstage derselben Beispiel-Kundinnen in stats_historic_appointments).
   Aufruf: node scripts/reshoot-trinkgeld.cjs */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/staff/trinkgeld', 4000);
  await L.wait(page, 2500);
  // Frisch rechnen lassen — der Statistik-Cache liefert sonst den Stand vor den Beispieldaten
  await L.clickText(page, '.page-header-glattt-actions button', 'Aktualisieren', 6000);
  await L.waitLoaded(page);
  await L.shot(page, 't4-seite-trinkgeld', { marks: [
    { id: 'zeitraum', kind: 'badge', n: 1, sel: '.page-header-glattt-actions .form-glattt-group', at: 'l' },
    { id: 'kpis', kind: 'badge', n: 2, sel: '.kpi-card-featured', at: 'l' },
    { id: 'umschalter', kind: 'badge', n: 3, sel: '.segmented-control-glattt-sm', at: 'l' },
  ]});

  // Karte „Sterne nach Sitzungsnummer“ (seit 27.11.2026)
  const sessionClip = await L.cardClip(page, 'Sterne nach Sitzungsnummer');
  await L.wait(page, 1500);
  if (sessionClip) await L.shot(page, 't4b-sterne-nach-sitzung', { clip: await L.cardClip(page, 'Sterne nach Sitzungsnummer'), noScroll: true, marks: [
    { id: 'skala', kind: 'badge', n: 4, fn: () => {
      const t = [...document.querySelectorAll('.card-glattt-title, h2, h3')].find(e => e.offsetParent !== null && e.textContent.includes('Sterne nach Sitzungsnummer'));
      const el = t && t.closest('.card-glattt, .statistic-card-glattt, section')?.querySelector('.segmented-control-glattt, .segmented-control-glattt-sm');
      if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height };
    }, at: 'l' },
  ]});
  else console.log('KARTE FEHLT: Sterne nach Sitzungsnummer');

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
    // Zeile „Zonen · n. Sitzung“: am Textende markieren (die Zeile selbst ist so breit wie die Karte)
    { id: 'sitzung', kind: 'badge', n: 4, fn: () => {
      const el = [...document.querySelectorAll('.tips-rating-service')].find(e => e.offsetParent !== null);
      if (!el) return null; const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect();
      return { x: b.x, y: b.y, w: b.width + 28, h: b.height };
    }, at: 'r' },
    { id: 'sterne', kind: 'badge', n: 5, sel: '.tips-rating-scores', at: 'l' },
  ]});
  await browser.close();
})();
