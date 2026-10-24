/* Nachaufnahme b1-detail-uebersicht (24.10.2026): Detailseite des Beratungstermins vor dem Start —
   seit dem Knopf „Gutschein-Link per E-Mail“ in der Seitenspalte. Öffnet nur die Seite, startet
   nichts. Aufruf mit KLICK_APT (Phorest-ID eines GEBUCHTEN Beratungstermins) und KLICK_DATE.   */
const L = require('./lib.cjs');
(async () => {
  // Höheres Fenster statt Scrollen: Kundenkarte, Termin-Infos und der neue Knopf passen so zusammen ins Bild
  const { browser, ctx, page } = await L.launch({ viewport: { width: 1180, height: 1260 } });
  await L.login(page, ctx);
  await L.goto(page, `/hub/appointment/${L.MD}/${L.APT}`, 1500);
  await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  await L.wait(page, 3000);
  console.log('Knopf Gutschein-Link:', await page.evaluate(() => !![...document.querySelectorAll('button')].find(b => b.offsetParent !== null && b.textContent.includes('Gutschein-Link per E-Mail'))));
  await L.shot(page, 'b1-detail-uebersicht', { marks: [
    { id: 'status', kind: 'badge', n: 1, sel: '.apt-detail-topbar-right .badge-glattt', at: 'l' },
    { id: 'kunde', kind: 'badge', n: 2, sel: '.apt-detail-client-card', at: 'tl' },
    { id: 'behandlungen', kind: 'badge', n: 3, fn: () => { const h = [...document.querySelectorAll('h2, h3, .card-glattt-title')].find(e => e.textContent.trim().startsWith('Behandlungen')); const b = h?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
    { id: 'notizen', kind: 'badge', n: 4, fn: () => { const h = [...document.querySelectorAll('h2, h3, .card-glattt-title')].find(e => e.textContent.trim().startsWith('Notizen')); const b = h?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
    { id: 'start', kind: 'chip', label: 'Hier tippen', sel: 'button.apt-detail-action-btn--start', at: 'r' },
    { id: 'mail', kind: 'badge', n: 5, fn: () => { const b = [...document.querySelectorAll('button')].find(b => b.offsetParent !== null && b.textContent.includes('Gutschein-Link per E-Mail')); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'r' },
  ]});
  await browser.close();
})();
