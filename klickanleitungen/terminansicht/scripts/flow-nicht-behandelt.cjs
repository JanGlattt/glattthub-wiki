/* Aufnahme 21.10.2026: Einstellungszettel — Kundennummer im Kopf, „2 Kleine Zonen“ unter „Sonstiges“,
   Schalter „Nicht behandelt“. Liest nur (nichts wird gespeichert). Der Lauf arbeitet lokal mit einem
   vorhandenen Termin der Testkundin; Sperre und Kassen-Banner der Seite sind für das Bild unerheblich,
   deshalb zeigen die Bilder nur den Arbeitsbereich (Clip), nie die Kopfzeile. */
const C = require('./common.cjs'); const L = C.L;
const T = () => Alpine.$data(document.querySelector('[x-data^="treatmentSettings"]'));
const visModal = () => [...document.querySelectorAll('.treatment-form-container')].find(e => e.offsetParent !== null);
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, `/hub/appointment/${L.MD}/${process.env.KLICK_TREAT}`, 3000);
  await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 40000 });
  await page.evaluate(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); Object.defineProperty(s, 'missingRequiredForms', { get: () => [], configurable: true }); s.currentView = 'treatment-settings'; });
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="treatmentSettings"]'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  await L.wait(page, 2500);
  const vp = page.viewportSize();
  const area = { x: 368, y: 132, width: vp.width - 368 - 8, height: vp.height - 132 };
  await L.shot(page, 'k1-zettel-uebersicht', { clip: area, marks: [
    { id: 'nr', kind: 'badge', n: 2, sel: '.apt-client-number-chip', at: 'l', dx: -1.5 },
    { id: 'figur', kind: 'badge', n: 1, sel: '.treatment-body-selector', at: 'tl', dx: 1.5, dy: 1.5 },
  ]});
  // Zonen-Liste unter der Figur: Kategorie „Sonstiges“ mit „2 Kleine Zonen“
  const sc = await page.evaluate(() => { const b = [...document.querySelectorAll('button.body-zone-button')].find(e => e.textContent.trim().startsWith('2 Kleine Zonen')); if (!b) return false; const p = b.closest('.apt-detail-panel'); b.scrollIntoView({ block: 'center' }); return true; });
  console.log('2 Kleine Zonen gefunden', sc); await L.wait(page, 800);
  await L.shot(page, 'k1b-zonen-sonstiges', { clip: area, noScroll: true, marks: [
    { id: 'zkz', kind: 'chip', label: 'Hier tippen', fn: () => { const b = [...document.querySelectorAll('button.body-zone-button')].find(e => e.textContent.trim().startsWith('2 Kleine Zonen')); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'r' },
  ]});
  await page.evaluate(() => T().openFormByKey('achseln')); await page.waitForFunction(() => T().showForm === true, null, { timeout: 10000 }); await L.wait(page, 1000);
  const mclip = async () => page.evaluate(() => { const m = [...document.querySelectorAll('.treatment-form-container')].find(e => e.offsetParent !== null); const b = m.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; });
  await L.shot(page, 'k2-zettel-formular-laserkopf', { clip: await mclip(), noScroll: true, marks: [
    { id: 'groups', kind: 'badge', n: 4, sel: '.treatment-group', at: 'tl', dx: 1, dy: 1 }, { id: 'next', kind: 'chip', label: 'Weiter', sel: 'button.treatment-group-next', at: 'l' } ]});
  await page.evaluate(() => { T().formData.not_treated = true; }); await L.wait(page, 800);
  await L.shot(page, 'k11-nicht-behandelt', { clip: await mclip(), noScroll: true, marks: [
    { id: 'nt', kind: 'badge', n: 1, sel: '.treatment-not-treated', at: 'l', dx: -1 },
    { id: 'save', kind: 'chip', label: 'Hier tippen', sel: '.treatment-form-footer button.btn-glattt-primary', at: 'l' } ]});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
