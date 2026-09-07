/* Stufe 3: Behandlungsvertrag ausfüllen (Körperzonen, Ratenzahlung, Preisliste „alle Raten SEPA", Rechtsdokument, Unterschrift) */
const C = require('./common.cjs'); const L = C.L;
const S = () => Alpine.$data(document.querySelector('.apt-detail'));
const F = () => Alpine.$data(document.querySelector('[x-data^="formFill"]'));
const rectOfLabel = (text) => { const el = [...document.querySelectorAll('label, h3, h2, h4, legend, .form-glattt-label, p, span, button')].find(e => e.textContent.trim().startsWith(text) && e.offsetParent !== null); if (!el) return null; const box = el.closest('.form-glattt-group, .form-field-wrapper, .contract-price-field, .form-glattt-section, .radio-glattt-group') || el; const b = box.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
const rectOfBtn = (t) => { const b = [...document.querySelectorAll('button, a')].find(e => e.textContent.trim().startsWith(t) && e.offsetParent !== null); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; };
async function ensureSession(page) {
  await L.goto(page, `/hub/appointment/${L.MD}/${L.APT}`, 1500);
  await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  if (!(await page.evaluate(() => S().sessionActive))) { await page.click('button.apt-detail-action-btn--start'); await page.waitForFunction(() => S().sessionActive === true, null, { timeout: 30000 }); await L.wait(page, 4500); }
}
async function openForm(page, name) {
  await page.evaluate(() => S().navigateTo('forms')); await L.wait(page, 1200);
  await page.evaluate((n) => S().openSessionForm(S().displayedForms.find(f => f.name === n)), name);
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="formFill"]'); return el && Alpine.$data(el)?.form?.fields?.length > 0; }, null, { timeout: 30000 });
  await L.wait(page, 1500);
}
const scrollTo = (page, text, off = 24) => C.scrollTo(page, text, off);
const sign = async (page) => { await page.evaluate(() => { const pad = Alpine.$data([...document.querySelectorAll('.signature-pad-container')].find(e => e.offsetParent !== null)); pad.strokes = [{ points: [{x:30,y:70},{x:60,y:30},{x:90,y:75},{x:120,y:35},{x:160,y:70},{x:200,y:40},{x:260,y:60},{x:330,y:45}] }, { points: [{x:340,y:40},{x:380,y:70},{x:420,y:35},{x:470,y:65}] }]; pad.redrawFromStrokes(); pad.saveSignature(); }); await L.wait(page, 400); };

(async () => {
  const { browser, ctx, page } = await L.launch();
  page.on('response', r => { const u = r.url(); if (u.includes('/api/forms/4/submit') || u.includes('/phorest/client') || u.includes('calculate-price') || r.status() >= 400) console.log('HTTP', r.status(), r.request().method(), u.slice(0, 110)); });
  await L.login(page, ctx);
  await ensureSession(page);
  await openForm(page, 'Behandlungsvertrag');
  await L.shot(page, 'f1-vertrag-oben', { marks: [ { id: 'nehmer', kind: 'frame', fn: rectOfLabel, fnArg: 'Vertragsnehmer' } ]});
  // Körperzonen
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('body-zones-changed', { detail: { zones: ['achseln', 'bikini', 'unterschenkel_links', 'unterschenkel_rechts'] } })));
  await L.wait(page, 800);
  console.log('zones', await page.evaluate(() => JSON.stringify(F().values['body_zones_1770673557417'])));
  await scrollTo(page, 'Zu behandelnde Körperzonen');
  await L.shot(page, 'f2-vertrag-koerperzonen', { noScroll: true, marks: [ { id: 'figur', kind: 'badge', n: 1, sel: '.body-zone-selector svg, .body-zone-selector', at: 'tl', dx: 1, dy: 1 }, { id: 'liste', kind: 'badge', n: 2, sel: '.body-zone-item', at: 'l' } ]});
  // Zahlungsmethode Raten + Startdatum
  await page.evaluate(() => { F().values['radio_1770673856847'] = 'zahlung_in_monatlichen_raten'; });
  await L.wait(page, 1500);
  await page.evaluate(() => { const d = F(); d.values['date_1772986891373'] = '2026-10-15'; d.datePickers?.['date_1772986891373']?.setDate('2026-10-15', false); });
  await L.wait(page, 400);
  await scrollTo(page, 'Bezahlung');
  await L.shot(page, 'f3-vertrag-bezahlung', { noScroll: true, marks: [ { id: 'radio', kind: 'badge', n: 1, fn: rectOfLabel, fnArg: 'Gewünschte Zahlungsmethode', at: 'l' }, { id: 'start', kind: 'badge', n: 2, fn: rectOfLabel, fnArg: 'Startdatum Abbuchung', at: 'l' } ]});
  // Preisfeld
  await page.waitForFunction(() => F().priceLoading === false && F().priceData, null, { timeout: 30000 }).catch(() => {});
  const pinfo = await page.evaluate(() => { const d = F(); return { multiple: d.multiplePriceLists, idx: d.selectedPriceListIndex, keys: Object.keys(d.priceData || {}), lists: (d.priceData?.price_lists || d.priceData?.lists || []).map(l => l.name || l.price_list_name), opts: (d.getCurrentPriceOptions?.() || []).map(o => `${o.months}M ${o.monthly_amount_cents}`), field: d.getPriceFieldName?.(), err: d.priceError }; });
  console.log('preis', JSON.stringify(pinfo));
  await C.scrollToSel(page, '.contract-price-field', 24);
  await L.shot(page, 'f4-vertrag-preisliste', { noScroll: true, marks: [ { id: 'liste', kind: 'badge', n: 1, sel: '.contract-price-content select', at: 'l' } ]});
  await page.evaluate(() => { const d = F(); const lists = d.priceData?.price_lists || d.priceData?.lists || []; const i = lists.findIndex(l => (l.name || l.price_list_name || '').includes('Magdeburg')); if (i >= 0) { d.selectedPriceListIndex = i; d.updateSelectedPriceList(); } });
  await L.wait(page, 800);
  await page.evaluate(() => { const d = F(); const opts = d.getCurrentPriceOptions(); const o = opts.find(x => x.months === 19) || opts[0]; d.selectPriceOption(o, d.getPriceFieldName()); });
  await L.wait(page, 800);
  const summary = await page.evaluate(() => { const el = document.querySelector('.contract-price-summary, .contract-price-field'); return el ? el.innerText.replace(/\n+/g, ' | ').slice(0, 700) : null; });
  console.log('summary', summary);
  console.log('zahlung-span', await page.evaluate(() => { const el = [...document.querySelectorAll('span')].find(e => e.textContent.trim() === 'Zahlung:'); return el ? (el.offsetParent !== null) + ' ' + el.parentElement.textContent.trim().slice(0, 80) : 'FEHLT'; }));
  await C.scrollToSel(page, '.contract-price-field', 24);
  await L.shot(page, 'f5-vertrag-zahlungsoption', { noScroll: true, marks: [ { id: 'opt', kind: 'badge', n: 2, sel: 'label.contract-price-option', at: 'l' }, { id: 'rabatt', kind: 'badge', n: 3, sel: '.contract-price-discounts select', at: 'l' } ]});
  await scrollTo(page, 'Gutscheine verrechnen');
  await L.shot(page, 'f6b-vertrag-gutschein-werber', { noScroll: true, marks: [ { id: 'b6', kind: 'badge', n: 6, fn: C.rectOfLabel, fnArg: 'Gutscheine verrechnen', at: 'l' }, { id: 'b7', kind: 'badge', n: 7, fn: C.rectOfLabel, fnArg: 'Freunde werben', at: 'l' } ]});
  // Einwilligungen + Unterschrift
  await page.evaluate(() => { const d = F(); d.values['consent_1787658048286'] = true; d.values['consent_1787658048286_copy_1787658104715'] = true; });
  await L.wait(page, 300);
  await scrollTo(page, 'Kundenunterschrift', 24);
  await L.shot(page, 'f7b-vertrag-einwilligung', { noScroll: true, marks: [ { id: 'consent', kind: 'badge', n: 1, fn: () => { const e = [...document.querySelectorAll('.consent-glattt')].find(x => x.offsetParent !== null); const r = e?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' } ]});
  await sign(page);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button[type=submit]')].find(e => e.offsetParent !== null); b.scrollIntoView({ block: 'end' }); }); await L.wait(page, 500);
  await L.shot(page, 'f7-vertrag-unterschrift', { noScroll: true, marks: [ { id: 'consent', kind: 'badge', n: 1, sel: '.consent-glattt', at: 'l' }, { id: 'sig', kind: 'badge', n: 2, sel: 'canvas.signature-pad-canvas', at: 'tl', dx: 1, dy: 1 }, { id: 'submit', kind: 'chip', label: 'Hier tippen', sel: 'form button[type=submit].btn-glattt-primary', at: 'l' } ]});
  // Pflichtfelder prüfen (Telefon kommt aus client.phone und ist beim Testkunden leer)
  await page.evaluate(() => { const d = F(); if (!d.values['text_1772526144179']) d.values['text_1772526144179'] = '0151 23456789'; if (!d.values['text_1770672917814']) { d.values['text_1770672917814'] = 'Musterstraße 12'; d.values['text_1770673163809'] = '39104'; d.values['text_1770673195598'] = 'Magdeburg'; } });
  console.log('validate', JSON.stringify(await page.evaluate(() => { const d = F(); const ok = d.validate(); const errors = { ...d.errors }; d.errors = {}; return { ok, errors }; })).slice(0, 500));
  const res = await C.submitForm(page, { legal: 'f8-vertrag-rechtsdokument', phorest: 'f9-phorest-aenderungen' });
  if (res === 'errors' || res === 'stuck') { await L.wait(page, 20000); console.log('spät:', JSON.stringify(await page.evaluate(() => { const d = F(); return { subModal: d.showSubmissionModal, st: d.submissionStatus, ph: d.phorestUpdateStatus, submitting: d.submitting }; }))); await browser.close(); process.exit(3); }
  await L.shot(page, 'f10-vertrag-erfolg', { noScroll: true, marks: [ { id: 'pdf', kind: 'badge', n: 1, sel: 'a.btn-glattt-secondary[download]', at: 'l' }, { id: 'back', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer button.btn-glattt-primary', at: 'l' } ]});
  await page.evaluate(() => F().closeEmbeddedForm()); await L.wait(page, 1500);
  await page.evaluate(() => S().navigateTo('forms')); await L.wait(page, 1200);
  console.log('Formulare danach', JSON.stringify(await page.evaluate(() => ({ sepaStep: S().sepaStepRequired, cards: [...document.querySelectorAll('.session-forms-grid .session-card')].map(c => ({ t: c.querySelector('.session-card-title')?.textContent.trim(), blocked: c.classList.contains('session-form-card--blocked'), done: c.classList.contains('session-card-success') })) }))));
  await L.shot(page, 'c3-formulare-nach-vertrag', { marks: [ { id: 'banner', kind: 'frame', fn: (t) => { const el = [...document.querySelectorAll('.apt-detail-panel *')].find(e => e.textContent.trim().startsWith(t) && e.offsetParent !== null && e.children.length <= 3); const r = el?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, fnArg: 'Nächster Pflicht-Schritt' }, { id: 'next', kind: 'chip', label: 'Weiter hier', sel: '.session-forms-grid .session-card:nth-of-type(3)', at: 'b' } ]});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
