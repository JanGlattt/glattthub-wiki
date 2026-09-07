const C = require('./common.cjs'); const L = C.L;
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await C.ensureSession(page);
  await C.openForm(page, 'Kundeninformation & Einverständniserklärung');
  await page.evaluate(() => { const d = F(); d.values['text_1787663465145'] = ''; d.values['email_1787663516596'] = ''; });
  await page.evaluate(() => F().submitForm());
  await L.wait(page, 600);
  console.log('errors', await page.evaluate(() => Object.keys(F().errors).length));
  await C.scrollTo(page, 'Kontaktdetails', 24);
  await L.shot(page, 'm1-fehler-pflichtfelder', { noScroll: true, marks: [ { id: 'err', kind: 'badge', n: 1, fn: () => { const e = [...document.querySelectorAll('.form-glattt-error, .text-danger, [class*=error]')].find(x => x.offsetParent !== null && x.textContent.includes('erforderlich')); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' }, { id: 'toast', kind: 'frame', fn: () => { const e = [...document.querySelectorAll('body *')].find(x => x.offsetParent !== null && x.children.length <= 2 && x.textContent.trim().startsWith('Bitte fülle alle Pflichtfelder')); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; } } ]});
  await page.evaluate(() => F().deleteDraft?.()).catch(() => {});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
