/* Stufe 4: SEPA-Mandat ausfüllen und absenden */
const C = require('./common.cjs'); const L = C.L;
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await C.ensureSession(page);
  await C.openForm(page, 'SEPA Mandat');
  const pre = await page.evaluate(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); return { ref: d.values['text_1770726001322'], glaeubiger: d.values['text_1770726025230'], holder: d.values['sepa_account_holder_1770723113200'], radio: d.values['radio_1770725285096'] }; });
  console.log('prefill', JSON.stringify(pre));
  await page.evaluate(() => { Alpine.$data(document.querySelector('[x-data^="formFill"]')).values['radio_1770725285096'] = 'vertragsnehmer_ist_kontoinhaber'; }); await L.wait(page, 600);
  await L.shot(page, 'g1-sepa-oben', { marks: [ { id: 'ref', kind: 'frame', fn: C.rectOfLabel, fnArg: 'Mandatsreferenz' }, { id: 'radio', kind: 'badge', n: 1, fn: C.rectOfLabel, fnArg: 'Wer ist Kontoinhaber', at: 'l' } ]});
  // IBAN tippen (löst Prüfung + BIC-Lookup aus)
  await page.evaluate(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); d.values['email_1770745965851'] = d.values['email_1770745965851'] || 'kundin@beispiel.de'; d.values['text_1773127624237'] = d.values['text_1773127624237'] || '0151 23456789'; d.values['text_1770725413464'] = d.values['text_1770725413464'] || 'Musterstraße 12'; d.values['text_1770725456007'] = d.values['text_1770725456007'] || '39104'; d.values['text_1770725471563'] = d.values['text_1770725471563'] || 'Magdeburg'; });
  await page.click('input.input-glattt-iban'); await page.keyboard.type('DE02120300000000202051', { delay: 20 });
  await page.waitForFunction(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); return !!d.values['sepa_bic_1770723110464']; }, null, { timeout: 15000 }).catch(() => console.log('BIC nicht automatisch'));
  await L.wait(page, 800);
  console.log('iban/bic', JSON.stringify(await page.evaluate(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); return [d.values['sepa_iban_1770723107422'], d.values['sepa_bic_1770723110464'], d.errors]; })));
  await C.scrollTo(page, 'IBAN', 200);
  await L.shot(page, 'g2-sepa-iban', { noScroll: true, marks: [ { id: 'holder', kind: 'badge', n: 2, fn: C.rectOfLabel, fnArg: 'Kontoinhaber', at: 'l' }, { id: 'iban', kind: 'badge', n: 3, sel: 'input.input-glattt-iban', at: 'l' }, { id: 'bic', kind: 'badge', n: 4, fn: C.rectOfLabel, fnArg: 'BIC', at: 'l' } ]});
  await C.sign(page);
  await C.scrollToSubmit(page);
  await L.shot(page, 'g3-sepa-unterschrift', { noScroll: true, marks: [ { id: 'sig', kind: 'badge', n: 5, sel: 'canvas.signature-pad-canvas', at: 'tl', dx: 1, dy: 1 }, { id: 'submit', kind: 'chip', label: 'Hier tippen', sel: 'form button[type=submit].btn-glattt-primary', at: 'l' } ]});
  const res = await C.submitForm(page, { legal: 'g4-sepa-rechtsdokument', phorest: 'g5-sepa-phorest' });
  if (res === 'errors') { await browser.close(); process.exit(3); }
  await L.shot(page, 'g6-sepa-erfolg', { noScroll: true, marks: [ { id: 'pdf', kind: 'badge', n: 1, sel: 'a.btn-glattt-secondary[download]', at: 'l' }, { id: 'back', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer button.btn-glattt-primary', at: 'l' } ]});
  const after = await C.backToForms(page);
  console.log('danach', JSON.stringify(after));
  await L.shot(page, 'c4-formulare-alle-fertig', {});
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('session')); await L.wait(page, 1200);
  await L.shot(page, 'h1-session-direkt-behandeln', { marks: [ { id: 'direct', kind: 'chip', label: 'Hier tippen', sel: '.unified-session-grid .session-card:nth-of-type(3)', at: 'b' } ]});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
