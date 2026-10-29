/* Nachaufnahme Black November (29.10.2026): Abzeichen im Kopf der Terminansicht (b1-detail-uebersicht,
   Terminansicht 1) und vorausgewählter Aktionsrabatt im Behandlungsvertrag (f4/f5, Terminansicht 3).
   Voraussetzung lokal: booking_trackings-Zeile mit signiertem Code für KLICK_APT, Aktionsrabatte der
   Preisliste (php artisan promo:discounts), PROMO_CODE_SECRET in der Hub-.env. Liest nur, reicht nichts ein. */
const C = require('./common.cjs'); const L = C.L;
const S = () => Alpine.$data(document.querySelector('.apt-detail'));
const F = () => Alpine.$data(document.querySelector('[x-data^="formFill"]'));
const rectOfLabel = (text) => { const el = [...document.querySelectorAll('label, h3, h2, h4, legend, .form-glattt-label, p, span, button')].find(e => e.textContent.trim().startsWith(text) && e.offsetParent !== null); if (!el) return null; const box = el.closest('.form-glattt-group, .form-field-wrapper, .contract-price-field, .form-glattt-section, .radio-glattt-group') || el; const b = box.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
const headline = (t) => { const h = [...document.querySelectorAll('h2, h3, .card-glattt-title')].find(e => e.textContent.trim().startsWith(t)); const b = h?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; };

(async () => {
  const { browser, ctx, page } = await L.launch();
  page.on('response', r => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url().slice(0, 110)); });
  await L.login(page, ctx);

  // ── Terminansicht 1: Kopf mit Abzeichen (vor dem Start, wie im Original)
  await L.goto(page, `/hub/appointment/${L.MD}/${L.APT}`, 1500);
  await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  await L.wait(page, 2000);
  console.log('promo im JSON:', await page.evaluate(() => JSON.stringify(S().promo)));
  await L.shot(page, 'b1-detail-uebersicht', { marks: [
    { id: 'status', kind: 'badge', n: 1, sel: '.apt-detail-topbar-right .badge-glattt', at: 'l' },
    { id: 'kunde', kind: 'badge', n: 2, sel: '.apt-detail-client-card', at: 'tl' },
    { id: 'behandlungen', kind: 'badge', n: 3, fn: headline, fnArg: 'Behandlungen', at: 'l' },
    { id: 'notizen', kind: 'badge', n: 4, fn: headline, fnArg: 'Notizen', at: 'l' },
    { id: 'promo', kind: 'badge', n: 5, sel: '.apt-detail-promo-badge', at: 'r' },
    { id: 'start', kind: 'chip', label: 'Hier tippen', sel: 'button.apt-detail-action-btn--start', at: 'r' },
  ]});

  // ── Terminansicht 3: Behandlungsvertrag bis zum Preis-Modul (nicht absenden)
  await C.ensureSession(page);
  await C.openForm(page, 'Behandlungsvertrag');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('body-zones-changed', { detail: { zones: ['achseln', 'bikini', 'unterschenkel_links', 'unterschenkel_rechts'] } })));
  await L.wait(page, 800);
  await page.evaluate(() => { F().values['radio_1770673856847'] = 'zahlung_in_monatlichen_raten'; });
  await L.wait(page, 1500);
  await page.waitForFunction(() => F().priceLoading === false && F().priceData, null, { timeout: 30000 }).catch(() => {});
  await page.waitForFunction(() => F().promoSuggestion !== null, null, { timeout: 8000 }).catch(async () => {
    console.log('kein promoSuggestion – lade direkt mit der Kundin des Termins');
    await page.evaluate(async () => { await F().loadPromoSuggestion(S().appointment?.clientId); });
    await page.waitForFunction(() => F().promoSuggestion !== null, null, { timeout: 8000 }).catch(() => console.log('weiterhin kein promoSuggestion'));
  });
  await L.wait(page, 800);
  await page.evaluate(() => { const d = F(); const opts = d.getCurrentPriceOptions(); const o = opts.find(x => x.months === 19) || opts[0]; if (o) d.selectPriceOption(o, d.getPriceFieldName()); });
  await L.wait(page, 800);
  console.log('vorgewählt:', await page.evaluate(() => JSON.stringify({ suggestion: F().promoSuggestion?.label, selected: F().selectedDiscount?.name, selectable: F().getSelectableDiscounts().map(d => d.name) })));
  await C.scrollToSel(page, '.contract-price-field', 24);
  await L.shot(page, 'f4-vertrag-preisliste', { noScroll: true, marks: [ { id: 'liste', kind: 'badge', n: 1, sel: '.contract-price-content select', at: 'l' } ]});
  await C.scrollToSel(page, '.contract-price-discounts', 160);
  await L.shot(page, 'f5-vertrag-zahlungsoption', { noScroll: true, marks: [
    { id: 'opt', kind: 'badge', n: 2, sel: 'label.contract-price-option', at: 'l' },
    { id: 'rabatt', kind: 'badge', n: 3, sel: '.contract-price-discounts select', at: 'l' },
    { id: 'promo', kind: 'badge', n: 4, sel: '.contract-price-promo-hint', at: 'l' },
  ]});
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
