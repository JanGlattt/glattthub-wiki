/* Fehlerbilder: Pflichtfeld-Validierung, ungültige IBAN */
const C = require('./common.cjs'); const L = C.L;
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await C.ensureSession(page);
  await C.openForm(page, 'Kundeninformation & Einverständniserklärung');
  await page.evaluate(() => { const d = F(); d.values['text_1787663465145'] = ''; d.values['email_1787663516596'] = ''; });
  await page.evaluate(() => { const b = [...document.querySelectorAll('button[type=submit]')].find(e => e.offsetParent !== null); b.click(); });
  await L.wait(page, 700);
  console.log('errors', await page.evaluate(() => Object.keys(F().errors).length), 'toast', await page.evaluate(() => [...document.querySelectorAll('[class*=toast]')].filter(e => e.offsetParent !== null).map(e => e.textContent.trim()).slice(0, 2)));
  await C.scrollTo(page, 'Kontaktdetails', 24);
  await L.shot(page, 'm1-fehler-pflichtfelder', { noScroll: true, marks: [ { id: 'err', kind: 'badge', n: 1, fn: () => { const e = [...document.querySelectorAll('.form-glattt-error')].find(x => x.offsetParent !== null); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' }, { id: 'toast', kind: 'frame', fn: () => { const e = [...document.querySelectorAll('[class*=toast]')].find(x => x.offsetParent !== null && x.textContent.includes('Pflichtfelder')); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; } } ]});
  await page.evaluate(() => F().deleteDraft?.()).catch(() => {});
  await page.evaluate(() => F().closeEmbeddedForm()); await L.wait(page, 1200);
  // ungültige IBAN
  await C.openForm(page, 'SEPA Mandat');
  await page.evaluate(() => { F().values['radio_1770725285096'] = 'vertragsnehmer_ist_kontoinhaber'; }); await L.wait(page, 500);
  await page.evaluate(() => { const i = [...document.querySelectorAll('input.input-glattt-iban')].find(e => e.offsetParent !== null); i.scrollIntoView({ block: 'center' }); }); await L.wait(page, 300);
  await page.click('input.input-glattt-iban:visible'); await page.keyboard.type('DE02120300000000202052', { delay: 20 }); await L.wait(page, 1500);
  console.log('iban err', await page.evaluate(() => JSON.stringify(F().errors)));
  await C.scrollTo(page, 'IBAN', 200);
  await L.shot(page, 'm2-fehler-iban', { noScroll: true, marks: [ { id: 'iban', kind: 'badge', n: 1, fn: () => { const e = [...document.querySelectorAll('input.input-glattt-iban')].find(x => x.offsetParent !== null); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' } ]});
  await page.evaluate(() => F().deleteDraft?.()).catch(() => {});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
