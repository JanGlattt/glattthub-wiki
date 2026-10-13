/* Kundenverwaltung 6, Nachtrag seit 13.10.2026 („KpZ die wir zusammen behandeln“):
   im Papierzettel-Assistenten „+ 2. Einstellung“, „Gleiche Werte für …“ und die Behandlerin
   „Nicht mehr im Team …“. Nur Lesen — der Assistent wird gefüllt, aber nie gespeichert.        */
const L = require('./lib.cjs');
const NO_ANIM = '*,*::before,*::after{transition:none!important;animation:none!important} [class*="toast"]{display:none!important}';
// Headless verhungert rAF: x-show mit Übergang schaltet nicht um — Zustand aus Alpine lesen und direkt setzen
const fixShow = (page) => page.evaluate(() => { document.querySelectorAll('[x-show]').forEach(el => { try { el.style.display = Alpine.evaluate(el, el.getAttribute('x-show')) ? '' : 'none'; } catch (e) {} }); });

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openClient(page, 2500);
  await L.tab(page, 'Behandlungseinstellungen', 4000);
  await page.addStyleTag({ content: NO_ANIM });
  await page.evaluate(() => { window.B = () => Alpine.$data(document.querySelector('[x-data^="treatmentBackfill"]')); });
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-treatment-backfill', { detail: { zoneKeys: ['brust', 'bauch'] } })));
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="treatmentBackfill"]'); return el && Alpine.$data(el).open && !Alpine.$data(el).loading; }, null, { timeout: 30000 });
  await L.wait(page, 1200);
  console.log('Sitzungen', await page.evaluate(() => B().sessions.length), 'Gruppen', await page.evaluate(() => B().zoneGroups.length));
  // Hohes Fenster: das Raster samt Hinweis darunter passt sonst nicht ins Bild
  await page.setViewportSize({ width: 1440, height: 1500 }); await L.wait(page, 800);
  await page.evaluate(() => {
    const b = B();
    b.zoneKeys = ['brust', 'bauch'];
    b.staffId = '__other__'; b.staffName = 'Sabine K.';
    b.ensureValues('brust');
    Object.assign(b.values.brust, { machine_head: 'large', skin_type: 3, hair_color: 'd', hair_thickness: 'm', hair_density: 'm', recommended_ms: 30, recommended_jules_min: 12, recommended_jules_max: 18, used_ms: 30, used_jules: 15 });
  });
  await L.wait(page, 800); await fixShow(page); await L.wait(page, 500);
  const modal = () => page.evaluate(() => { const m = [...document.querySelectorAll('.backfill-modal')].find(e => e.offsetParent !== null); const b = m.getBoundingClientRect(); return { x: Math.max(0, b.x), y: Math.max(0, b.y), width: Math.min(b.width, window.innerWidth), height: Math.min(b.height, window.innerHeight - Math.max(0, b.y)) }; });
  const btn = (t) => { const b = [...document.querySelectorAll('.backfill-modal button')].find(e => e.offsetParent !== null && e.textContent.trim().startsWith(t)); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; };
  const sel = (s) => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent !== null); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; };
  // n5: Behandlerin „Nicht mehr im Team …“ + Spaltenkopf mit „+ 2. Einstellung“ und „Gleiche Werte für Bauch“
  await L.shot(page, 'n5-nachtrag-zweite-einstellung', { clip: await modal(), noScroll: true, marks: [
    { id: 'behandlerin', kind: 'badge', n: 1, fn: sel, fnArg: '.backfill-staff-other', at: 'l' },
    { id: 'zweite', kind: 'badge', n: 2, fn: btn, fnArg: '+ 2. Einstellung', at: 'l' },
    { id: 'gleich', kind: 'badge', n: 3, fn: btn, fnArg: 'Gleiche Werte', at: 'l' },
  ]});
  // n6: zweite Einstellung angelegt, Werte auf Bauch übertragen (nur im Raster, nichts gespeichert)
  await page.evaluate(() => {
    const b = B();
    b.addSecond('brust');
    b.values.brust.area_label = 'Brust';
    Object.assign(b.seconds.brust, { area_label: 'Brustwarzen', machine_head: 'small', skin_type: 3, hair_color: 'd', hair_thickness: 'f', hair_density: 'nd', recommended_ms: 20, recommended_jules_min: 10, recommended_jules_max: 14, used_ms: 20, used_jules: 12 });
  });
  await L.wait(page, 500);
  await page.evaluate(() => B().copyToPartners('brust'));
  await L.wait(page, 800); await fixShow(page); await L.wait(page, 500);
  // Raster so weit nach rechts schieben, dass „Brust · Einstellung 2“ ganz zu sehen ist
  await page.evaluate(() => { const w = [...document.querySelectorAll('.backfill-grid-wrap')].find(e => e.offsetParent !== null); const h = [...document.querySelectorAll('.backfill-grid-head.is-second')].find(e => e.offsetParent !== null); if (w && h) w.scrollLeft += h.getBoundingClientRect().left - w.getBoundingClientRect().left - 200; });
  await L.wait(page, 500);
  const formClip = await page.evaluate(() => { const f = [...document.querySelectorAll('.backfill-session-form')].find(e => e.offsetParent !== null); const b = f.getBoundingClientRect(); return { x: b.x - 12, y: b.y - 12, width: b.width + 24, height: Math.min(b.height + 24, window.innerHeight - b.y) }; });
  await L.shot(page, 'n6-nachtrag-gleiche-werte', { clip: formClip, noScroll: true, marks: [
    { id: 'spalte2', kind: 'frame', color: 'gold', fn: sel, fnArg: '.backfill-grid-head.is-second' },
    { id: 'entfernen', kind: 'badge', n: 4, fn: btn, fnArg: 'Entfernen', at: 'r' },
    { id: 'bereich', kind: 'badge', n: 5, fn: (t) => { const e = [...document.querySelectorAll('.backfill-grid-label')].find(x => x.offsetParent !== null && x.textContent.trim() === t); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, fnArg: 'Bereich', at: 'l' },
    { id: 'notice', kind: 'badge', n: 5, fn: (t) => { const e = [...document.querySelectorAll('.backfill-modal p')].find(x => x.offsetParent !== null && x.textContent.trim().startsWith(t)); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, fnArg: 'Werte von', at: 'l' },
  ]});
  console.log('Spalten', JSON.stringify(await page.evaluate(() => B().columns.map(c => c.col))));
  await page.evaluate(() => B().close());
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
