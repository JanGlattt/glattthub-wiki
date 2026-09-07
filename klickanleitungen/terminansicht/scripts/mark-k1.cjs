const C = require('./common.cjs'); const L = C.L; const fs = require('fs');
(async () => {
  const url = fs.readFileSync('treatment-url.txt', 'utf8').trim(); const apt = url.split('/').pop().split('?')[0];
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx); await C.ensureSession(page, apt);
  await page.evaluate(() => S().navigateTo('treatment-settings'));
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="treatmentSettings"]'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 }); await L.wait(page, 1500);
  const r = await page.evaluate(() => { const b = [...document.querySelectorAll('button.body-zone-button')].find(e => e.textContent.trim().startsWith('Bikinizone')); const x = b.getBoundingClientRect(); return { x: x.x / 11.8, y: x.y / 8.2, w: x.width / 11.8, h: x.height / 8.2 }; });
  const m = JSON.parse(fs.readFileSync('meta.json', 'utf8'));
  const marks = m['k1-zettel-uebersicht'].marks.filter(k => k.id !== 'zone' && k.id !== 'chip');
  marks.push({ id: 'zone', kind: 'chip', label: 'Hier tippen', at: 'r', pct: r });
  m['k1-zettel-uebersicht'].marks = marks; fs.writeFileSync('meta.json', JSON.stringify(m, null, 1));
  console.log('k1 zone', JSON.stringify(r));
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
