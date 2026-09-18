/* Terminansicht 5 — Nachaufnahme e1-teilen-modal: das Teilen-Modal mit „Link senden per"
   (Nur Link / E-Mail / WhatsApp / SMS). Braucht einen Termin (KLICK_TREAT oder KLICK_APT) und
   das Formular KLICK_SHARE_FORM (Standard: Sitzungsbestätigung — muss zum Termin passen). Es wird kein Link erzeugt.  */
const C = require('./common.cjs'); const L = C.L;
const APT = process.env.KLICK_TREAT || L.APT;
const FORM = process.env.KLICK_SHARE_FORM || 'Sitzungsbestätigung';
const F = () => Alpine.$data(document.querySelector('[x-data^="formFill"]'));
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await C.ensureSession(page, APT);
  await C.openForm(page, FORM);
  await page.click('button[title="Formular teilen"]');
  await page.waitForFunction(() => F().showShareModal === true); await L.wait(page, 900);
  await page.evaluate(() => { F().shareChannel = 'whatsapp'; }); await L.wait(page, 500);
  await L.shot(page, 'e1-teilen-modal', { noScroll: true, marks: [
    { id: 'name', kind: 'badge', n: 1, sel: '#shareRecipientName', at: 'l' },
    { id: 'kanal', kind: 'badge', n: 2, sel: '[data-share-channel] .segmented-control-glattt', at: 'l' },
    { id: 'perm', kind: 'badge', n: 3, sel: '.share-field-permissions-toggle', at: 'l' },
    { id: 'create', kind: 'chip', label: 'Hier tippen', fn: (t) => { const b = [...document.querySelectorAll('.modal-glattt-footer button')].find(e => e.textContent.trim().startsWith(t) && e.offsetParent !== null); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, fnArg: 'Link erstellen', at: 'l' },
  ]});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
