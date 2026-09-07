/* Nachaufnahmen der gescrollten Formular-Abschnitte (Kundeninformation, Behandlungsvertrag, SEPA) — ohne Absenden */
const C = require('./common.cjs'); const L = C.L;
const rb = (n, text, at = 'l') => ({ id: 'b' + n, kind: 'badge', n, fn: C.rectOfLabel, fnArg: text, at });
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await C.ensureSession(page);
  // ── Kundeninformation
  await C.openForm(page, 'Kundeninformation & Einverständniserklärung');
  await page.evaluate(() => { const d = F(); if (!d.values['gender_1788789142944']) d.values['gender_1788789142944'] = 'FEMALE'; let first = true; for (const f of d.form.fields) { if (f.type !== 'yes_no' || !d.isFieldVisibleInLayout(f)) continue; d.values[f.field_name] = first ? { answer: 'yes', details: 'Neurodermitis (leicht)' } : { answer: 'no', details: '' }; first = false; } });
  await L.wait(page, 400);
  await page.evaluate(() => { const d = F(); for (const f of d.form.fields) { if (f.type !== 'yes_no' || !d.isFieldVisibleInLayout(f)) continue; if (!d.values[f.field_name]?.answer) d.values[f.field_name] = { answer: 'no', details: '' }; } const cb = d.form.fields.find(x => x.field_name === 'checkbox_1788789359101'); d.values[cb.field_name] = [cb.options[0].value]; });
  await L.wait(page, 400);
  await C.scrollTo(page, 'Medizinische Vorgeschichte', 24);
  await L.shot(page, 'd2-kundeninfo-medizin', { noScroll: true, marks: [ { id: 'q1', kind: 'badge', n: 1, fn: () => { const e = [...document.querySelectorAll('.yes-no-glattt-options')].find(x => x.offsetParent !== null); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' }, { id: 'details', kind: 'badge', n: 2, fn: () => { const e = [...document.querySelectorAll('.yes-no-glattt-details')].find(x => x.offsetParent !== null); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' } ]});
  await C.scrollTo(page, 'Behandlungsinformationen', 24);
  await L.shot(page, 'd3-kundeninfo-behandlung', { noScroll: true, marks: [ rb(3, 'Was sind die Hauptgründe') ]});
  await C.scrollTo(page, 'Dürfen wir in Kontakt bleiben', 24);
  await L.shot(page, 'd4-kundeninfo-kontakt', { noScroll: true, marks: [ rb(4, 'Neueste Angebote'), rb(5, 'Terminerinnerungen') ]});
  await page.evaluate(() => F().deleteDraft?.()).catch(() => {});
  await page.evaluate(() => F().closeEmbeddedForm()); await L.wait(page, 1200);
  // ── Behandlungsvertrag
  await C.openForm(page, 'Behandlungsvertrag');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('body-zones-changed', { detail: { zones: ['achseln', 'bikini', 'unterschenkel_links', 'unterschenkel_rechts'] } }))); await L.wait(page, 600);
  await C.scrollTo(page, 'Zu behandelnde Körperzonen', 24);
  await L.shot(page, 'f2-vertrag-koerperzonen', { noScroll: true, marks: [ { id: 'figur', kind: 'badge', n: 1, fn: () => { const e = [...document.querySelectorAll('.body-zone-selector svg')].find(x => x.offsetParent !== null) || document.querySelector('.body-zone-selector'); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'tl', dx: 1, dy: 1 }, { id: 'liste', kind: 'badge', n: 2, fn: () => { const e = [...document.querySelectorAll('.body-zone-item')].find(x => x.offsetParent !== null); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' } ]});
  await page.evaluate(() => { F().values['radio_1770673856847'] = 'zahlung_in_monatlichen_raten'; }); await L.wait(page, 1500);
  await page.evaluate(() => { const d = F(); d.values['date_1772986891373'] = '2026-10-15'; d.datePickers?.['date_1772986891373']?.setDate('2026-10-15', false); }); await L.wait(page, 400);
  await C.scrollTo(page, 'Bezahlung', 24);
  await L.shot(page, 'f3-vertrag-bezahlung', { noScroll: true, marks: [ rb(1, 'Gewünschte Zahlungsmethode'), rb(2, 'Startdatum Abbuchung') ]});
  await page.waitForFunction(() => F().priceLoading === false && F().priceData, null, { timeout: 30000 }).catch(() => {}); await L.wait(page, 600);
  await C.scrollToSel(page, '.contract-price-field', 24);
  await L.shot(page, 'f4-vertrag-preisliste', { noScroll: true, marks: [ { id: 'liste', kind: 'badge', n: 3, fn: () => { const s = [...document.querySelectorAll('.contract-price-field select')].find(e => e.offsetParent !== null); const r = s?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' } ]});
  await page.evaluate(() => { const d = F(); const lists = d.priceData?.price_lists || d.priceData?.lists || Object.values(d.priceData || {}); const i = lists.findIndex(l => (l.name || l.price_list_name || '').includes('Magdeburg')); if (i >= 0) { d.selectedPriceListIndex = i; d.updateSelectedPriceList(); } }); await L.wait(page, 800);
  await page.evaluate(() => { const d = F(); const opts = d.getCurrentPriceOptions(); const o = opts.find(x => x.months === 19) || opts[0]; d.selectPriceOption(o, d.getPriceFieldName()); }); await L.wait(page, 800);
  await C.scrollToSel(page, '.contract-price-field', 24);
  await L.shot(page, 'f5-vertrag-zahlungsoption', { noScroll: true, marks: [ { id: 'opt', kind: 'badge', n: 4, fn: () => { const s = [...document.querySelectorAll('label.contract-price-option')].find(e => e.offsetParent !== null); const r = s?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' }, { id: 'rabatt', kind: 'badge', n: 5, fn: () => { const s = [...document.querySelectorAll('.contract-price-discounts select')].find(e => e.offsetParent !== null); const r = s?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' } ]});
  await C.scrollTo(page, 'Gutscheine verrechnen', 24);
  await L.shot(page, 'f6b-vertrag-gutschein-werber', { noScroll: true, marks: [ rb(6, 'Gutscheine verrechnen'), rb(7, 'Freunde werben') ]});
  await C.scrollTo(page, 'Kundenunterschrift', 24);
  await L.shot(page, 'f7b-vertrag-einwilligung', { noScroll: true, marks: [ { id: 'consent', kind: 'badge', n: 1, fn: () => { const e = [...document.querySelectorAll('.consent-glattt')].find(x => x.offsetParent !== null); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' } ]});
  await page.evaluate(() => F().deleteDraft?.()).catch(() => {});
  await page.evaluate(() => F().closeEmbeddedForm()); await L.wait(page, 1200);
  // ── SEPA
  await C.openForm(page, 'SEPA Mandat');
  await page.evaluate(() => { F().values['radio_1770725285096'] = 'vertragsnehmer_ist_kontoinhaber'; }); await L.wait(page, 600);
  await L.shot(page, 'g1-sepa-oben', { marks: [ { id: 'ref', kind: 'frame', fn: C.rectOfLabel, fnArg: 'Mandatsreferenz' }, rb(1, 'Wer ist Kontoinhaber') ]});
  await page.evaluate(() => { const d = F(); d.values['email_1770745965851'] = d.values['email_1770745965851'] || 'kundin@beispiel.de'; d.values['text_1773127624237'] = d.values['text_1773127624237'] || '0151 23456789'; d.values['text_1770725413464'] = d.values['text_1770725413464'] || 'Musterstraße 12'; d.values['text_1770725456007'] = d.values['text_1770725456007'] || '39104'; d.values['text_1770725471563'] = d.values['text_1770725471563'] || 'Magdeburg'; });
  await page.evaluate(() => { const i = [...document.querySelectorAll('input.input-glattt-iban')].find(e => e.offsetParent !== null); i.scrollIntoView({ block: 'center' }); }); await L.wait(page, 300);
  await page.click('input.input-glattt-iban:visible'); await page.keyboard.type('DE02120300000000202051', { delay: 20 });
  await page.waitForFunction(() => !!F().values['sepa_bic_1770723110464'], null, { timeout: 15000 }).catch(() => console.log('BIC nicht automatisch')); await L.wait(page, 800);
  await C.scrollTo(page, 'IBAN', 200);
  await L.shot(page, 'g2-sepa-iban', { noScroll: true, marks: [ rb(2, 'Kontoinhaber'), { id: 'iban', kind: 'badge', n: 3, fn: () => { const e = [...document.querySelectorAll('input.input-glattt-iban')].find(x => x.offsetParent !== null); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' }, rb(4, 'BIC') ]});
  await page.evaluate(() => F().deleteDraft?.()).catch(() => {});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
