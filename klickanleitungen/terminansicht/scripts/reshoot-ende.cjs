/* Nachaufnahme: Behandlungstermin beenden — Kasse (falls offener Betrag), Folgetermin überspringen,
   Terminnotiz (i2–i4 für Deck 6, l2/l3 für Deck 8). Braucht treatment-url.txt aus flow5 und einen
   noch laufenden Behandlungstermin. Seit 09.10.2026: Die eine Notiz nach „Direkt behandeln" entsteht hier. */
const C = require('./common.cjs'); const L = C.L;
const fs = require('fs');
const S = () => Alpine.$data(document.querySelector('.apt-detail'));
(async () => {
  const url = fs.readFileSync('treatment-url.txt', 'utf8').trim();
  const apt = url.split('/').pop().split('?')[0];
  const { browser, ctx, page } = await L.launch();
  page.on('dialog', d => { console.log('DIALOG', d.message()); d.accept(); });
  await L.login(page, ctx);
  await C.ensureSession(page, apt);
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).beginEndSessionFlow());
  await page.waitForFunction(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); return s.showBalanceScreen || s.showEndSessionModal || [...document.querySelectorAll('.modal-glattt')].some(e => e.offsetParent !== null && e.textContent.includes('Folgetermin')); }, null, { timeout: 60000 });
  await L.wait(page, 1500);
  if (await page.evaluate(() => S().showBalanceScreen)) {
    await L.shot(page, 'i1-kasse', { noScroll: true, marks: [ { id: 'ok', kind: 'chip', label: 'Hier tippen', sel: '.balance-alert-screen-actions .balance-alert-screen-button', at: 'l' } ]});
    await page.click('.balance-alert-screen-actions .balance-alert-screen-button');
    await L.wait(page, 6000);
  }
  const hasFollowUp = await page.evaluate(() => [...document.querySelectorAll('.modal-glattt')].some(e => e.offsetParent !== null && e.textContent.includes('Folgetermin')));
  if (hasFollowUp) {
    await L.shot(page, 'l1-folgetermin', { noScroll: true });
    await page.evaluate(() => { const c = [...document.querySelectorAll('.modal-glattt-header-close')].find(e => e.offsetParent !== null); c?.click(); });
  }
  await page.waitForFunction(() => S().showEndSessionModal, null, { timeout: 60000 }); await L.wait(page, 800);
  await L.shot(page, 'i2-terminnotiz-leer', { noScroll: true, marks: [ { id: 'note', kind: 'badge', n: 1, sel: '.modal-glattt textarea.input-glattt', at: 'l' } ]});
  await page.fill('.modal-glattt textarea.input-glattt', 'Beratung: Vertrag 4 Zonen (Achseln, Bikini, Unterschenkel) per Ratenzahlung. Erste Behandlung Achseln und Bikinizone direkt im Anschluss durchgeführt, gut vertragen.');
  await L.wait(page, 300);
  await L.shot(page, 'i3-terminnotiz', { noScroll: true, marks: [ { id: 'note', kind: 'badge', n: 1, sel: '.modal-glattt textarea.input-glattt', at: 'l' }, { id: 'end', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer button.btn-glattt-danger', at: 'l' } ]});
  await L.shot(page, 'l2-behandlung-terminnotiz', { noScroll: true, marks: [ { id: 'end', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer button.btn-glattt-danger', at: 'l' } ]});
  await page.click('.modal-glattt-footer button.btn-glattt-danger');
  await page.waitForFunction(() => S().endSessionStatus === 'success', null, { timeout: 60000 }); await L.wait(page, 500);
  await L.shot(page, 'i4-termin-beendet', { noScroll: true });
  await L.wait(page, 2500);
  await L.shot(page, 'l3-behandlung-beendet', {});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
