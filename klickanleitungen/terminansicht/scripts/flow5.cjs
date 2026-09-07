/* Stufe 5: Direkt behandeln → Termin beenden (Terminnotiz) → Sprung in den Behandlungstermin */
const C = require('./common.cjs'); const L = C.L;
const fs = require('fs');
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await C.ensureSession(page);
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('session')); await L.wait(page, 1200);
  console.log('direct available', await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).directTreatmentAvailable));
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).offerDirectTreatment());
  await page.waitForFunction(() => { const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null && e.textContent.includes('Direkt behandeln')); return m && !m.textContent.includes('Lade Paket-Services'); }, null, { timeout: 60000 });
  await L.wait(page, 1000);
  const modalTxt = await page.evaluate(() => { const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null && e.textContent.includes('Direkt behandeln')); return m.innerText.replace(/\n+/g, ' | ').slice(0, 600); });
  console.log('modal', modalTxt);
  await L.shot(page, 'h2-direkt-modal', { noScroll: true, marks: [ { id: 'list', kind: 'badge', n: 1, sel: '.modal-glattt-section .checkbox-glattt-wrapper', at: 'l' }, { id: 'book', kind: 'chip', label: 'Hier tippen', fn: C.rectOfBtn, fnArg: 'Termin buchen', at: 'l' } ]});
  if (process.argv.includes('--dry')) { await browser.close(); return; }
  const canBook = await page.evaluate(() => { const b = [...document.querySelectorAll('.modal-glattt-footer button')].find(e => e.textContent.includes('Termin buchen')); return b && !b.disabled; });
  if (!canBook) { console.log('Buchen nicht möglich'); await browser.close(); process.exit(4); }
  await page.evaluate(() => { const b = [...document.querySelectorAll('.modal-glattt-footer button')].find(e => e.textContent.includes('Termin buchen')); b.click(); });
  await page.waitForFunction(() => Alpine.$data(document.querySelector('.apt-detail')).directTreatmentBooked === true, null, { timeout: 90000 });
  await L.wait(page, 1000);
  const url = await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail'))._directTreatmentUrl);
  console.log('gebucht →', url); fs.writeFileSync('treatment-url.txt', url || '');
  await L.shot(page, 'h3-direkt-gebucht', { noScroll: true, marks: [ { id: 'weiter', kind: 'chip', label: 'Hier tippen', fn: C.rectOfBtn, fnArg: 'Weiter', at: 'l' } ]});
  await page.evaluate(() => { const b = [...document.querySelectorAll('.modal-glattt button')].find(e => e.textContent.trim() === 'Weiter' && e.offsetParent !== null); b.click(); });
  // Beenden-Ablauf startet automatisch: Kasse? → Terminnotiz
  await page.waitForFunction(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); return s.showBalanceScreen || s.showEndSessionModal; }, null, { timeout: 60000 });
  await L.wait(page, 800);
  if (await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).showBalanceScreen)) {
    await L.shot(page, 'i1-kasse', { noScroll: true, marks: [ { id: 'ok', kind: 'chip', label: 'Hier tippen', sel: '.balance-alert-screen-actions .balance-alert-screen-button', at: 'l' } ]});
    await page.click('.balance-alert-screen-actions .balance-alert-screen-button');
    await page.waitForFunction(() => Alpine.$data(document.querySelector('.apt-detail')).showEndSessionModal, null, { timeout: 60000 });
    await L.wait(page, 800);
  }
  await L.shot(page, 'i2-terminnotiz-leer', { noScroll: true, marks: [ { id: 'note', kind: 'badge', n: 1, sel: '.modal-glattt textarea.input-glattt', at: 'l' } ]});
  await page.fill('.modal-glattt textarea.input-glattt', 'Beratung durchgeführt, Vertrag 4 Zonen (Achseln, Bikini, Unterschenkel) per Ratenzahlung abgeschlossen, Behandlung direkt im Anschluss.');
  await L.wait(page, 300);
  await L.shot(page, 'i3-terminnotiz', { noScroll: true, marks: [ { id: 'note', kind: 'badge', n: 1, sel: '.modal-glattt textarea.input-glattt', at: 'l' }, { id: 'end', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer button.btn-glattt-danger', at: 'l' } ]});
  await page.click('.modal-glattt-footer button.btn-glattt-danger');
  await page.waitForFunction(() => Alpine.$data(document.querySelector('.apt-detail')).endSessionStatus === 'success', null, { timeout: 60000 });
  await L.wait(page, 500);
  await L.shot(page, 'i4-termin-beendet', { noScroll: true });
  await page.waitForURL(u => u.toString().includes('start=1'), { timeout: 30000 }).catch(() => console.log('kein Redirect'));
  await L.hideBadge(page);
  await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  await L.wait(page, 5000);
  console.log('neuer Termin', page.url(), JSON.stringify(await page.evaluate(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); return { view: s.currentView, active: s.sessionActive, state: s.appointment?.state, locked: s.treatmentLocked, forms: s.displayedForms?.map(f => f.name) }; })));
  await L.shot(page, 'j1-behandlungstermin-session', {});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
