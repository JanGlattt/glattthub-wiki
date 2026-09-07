/* Behandlungstermin: Zettel-Übersicht mit Marke, Beenden-Ablauf (Folgetermin, Notiz) */
const C = require('./common.cjs'); const L = C.L; const fs = require('fs');
(async () => {
  const url = fs.readFileSync('treatment-url.txt', 'utf8').trim(); const apt = url.split('/').pop().split('?')[0];
  const { browser, ctx, page } = await L.launch();
  page.on('dialog', d => d.accept());
  await L.login(page, ctx);
  await C.ensureSession(page, apt);
  await page.evaluate(() => S().navigateTo('treatment-settings'));
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="treatmentSettings"]'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 }); await L.wait(page, 1500);
  await L.shot(page, 'k1-zettel-uebersicht', { marks: [ { id: 'figur', kind: 'badge', n: 1, sel: '.treatment-body-selector', at: 'tl', dx: 1.5, dy: 1.5 }, { id: 'zone', kind: 'chip', label: 'Hier tippen', fn: (t) => { const b = [...document.querySelectorAll('button.body-zone-button')].find(e => e.textContent.trim().startsWith(t)); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, fnArg: 'Bikinizone', at: 'r' }, { id: 'chip', kind: 'badge', n: 3, sel: '.configured-zones-summary .configured-zone-chip', at: 'l' } ]});
  // Beenden-Ablauf des Behandlungstermins
  await page.evaluate(() => S().beginEndSessionFlow());
  await L.wait(page, 6000);
  const flow = await page.evaluate(() => { const s = S(); return { bal: s.showBalanceScreen, end: s.showEndSessionModal, modals: [...document.querySelectorAll('.modal-glattt')].filter(e => e.offsetParent !== null).map(e => e.innerText.replace(/\n+/g, ' | ').slice(0, 250)) }; });
  console.log('endflow', JSON.stringify(flow));
  if (flow.modals.some(m => m.includes('Folgetermin'))) {
    await L.shot(page, 'l1-folgetermin', { noScroll: true });
    await page.evaluate(() => { const c = [...document.querySelectorAll('.modal-glattt-header-close')].find(e => e.offsetParent !== null); c?.click(); });
    await page.waitForFunction(() => S().showEndSessionModal, null, { timeout: 30000 }).catch(() => {}); await L.wait(page, 800);
  }
  if (await page.evaluate(() => S().showEndSessionModal)) {
    await page.fill('.modal-glattt textarea.input-glattt', 'Erste Behandlung Achseln und Bikinizone durchgeführt, gut vertragen.');
    await L.shot(page, 'l2-behandlung-terminnotiz', { noScroll: true, marks: [ { id: 'end', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer button.btn-glattt-danger', at: 'l' } ]});
    await page.click('.modal-glattt-footer button.btn-glattt-danger');
    await page.waitForFunction(() => S().endSessionStatus === 'success', null, { timeout: 60000 }); await L.wait(page, 3000);
    await L.shot(page, 'l3-behandlung-beendet', {});
    console.log('beendet', await page.evaluate(() => S().appointment?.state));
  }
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
