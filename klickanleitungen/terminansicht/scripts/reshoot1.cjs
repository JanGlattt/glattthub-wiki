/* Nachaufnahmen: Formular teilen (Link erstellen) + Preisabschnitt des Behandlungsvertrags — ohne Absenden */
const C = require('./common.cjs'); const L = C.L;
const scrollToEl = async (page, sel, off = 90) => { await page.evaluate(([s, o]) => { const el = [...document.querySelectorAll(s)].find(e => e.offsetParent !== null); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - o); }, [sel, off]); await L.wait(page, 500); };
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await C.ensureSession(page);
  // Formular teilen
  await C.openForm(page, 'Kundeninformation & Einverständniserklärung');
  console.log('buttons', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => b.textContent.trim().slice(0, 30)).filter(Boolean).slice(0, 12)));
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => e.offsetParent !== null && e.textContent.includes('Formular teilen')); if (b) b.click(); else F().showShareModal = true; });
  await page.waitForFunction(() => F().showShareModal === true); await L.wait(page, 800);
  await L.shot(page, 'e1-teilen-modal', { noScroll: true, marks: [
    { id: 'name', kind: 'badge', n: 1, sel: '#shareRecipientName', at: 'l' }, { id: 'email', kind: 'badge', n: 2, sel: '#shareRecipientEmail', at: 'l' }, { id: 'perm', kind: 'badge', n: 3, sel: '.share-field-permissions-toggle', at: 'l' },
    { id: 'create', kind: 'chip', label: 'Hier tippen', fn: C.rectOfBtn, fnArg: 'Link erstellen', at: 'l' } ]});
  await page.evaluate(() => { F().shareRecipientName = 'Tester Am Testen'; return F().createShareLink(); });
  const ok = await page.waitForFunction(() => F().shareResult && F().shareResult.share_url, null, { timeout: 20000 }).then(() => true).catch(() => false); await L.wait(page, 600);
  console.log('share', ok ? await page.evaluate(() => F().shareResult.share_url) : 'FEHLGESCHLAGEN');
  if (ok) await L.shot(page, 'e2-teilen-link', { noScroll: true, marks: [
    { id: 'url', kind: 'frame', fn: () => { const i = [...document.querySelectorAll('.modal-glattt input[readonly]')].find(e => e.offsetParent !== null && e.value.includes('/shared/form/')); const r = i?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; } },
    { id: 'copy', kind: 'chip', label: 'Kopieren', fn: C.rectOfBtn, fnArg: 'Kopieren', at: 'b' } ]});
  await page.evaluate(() => F().closeShareModal()); await L.wait(page, 400);
  await page.evaluate(() => F().closeEmbeddedForm()); await L.wait(page, 1200);
  // Preisabschnitt Behandlungsvertrag
  await C.openForm(page, 'Behandlungsvertrag');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('body-zones-changed', { detail: { zones: ['achseln', 'bikini', 'unterschenkel_links', 'unterschenkel_rechts'] } }))); await L.wait(page, 600);
  await page.evaluate(() => { F().values['radio_1770673856847'] = 'zahlung_in_monatlichen_raten'; }); await L.wait(page, 1500);
  await page.evaluate(() => { const d = F(); d.values['date_1772986891373'] = '2026-10-15'; d.datePickers?.['date_1772986891373']?.setDate('2026-10-15', false); });
  await page.waitForFunction(() => F().priceLoading === false && F().priceData, null, { timeout: 30000 }).catch(() => {});
  await L.wait(page, 800);
  await scrollToEl(page, '.contract-price-field');
  await L.shot(page, 'f4-vertrag-preisliste', { noScroll: true, marks: [ { id: 'liste', kind: 'badge', n: 1, fn: () => { const s = [...document.querySelectorAll('.contract-price-content select, .contract-price-field select')].find(e => e.offsetParent !== null); const r = s?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' } ]});
  await page.evaluate(() => { const d = F(); const lists = d.priceData?.price_lists || d.priceData?.lists || Object.values(d.priceData || {}); const i = lists.findIndex(l => (l.name || l.price_list_name || '').includes('Magdeburg')); if (i >= 0) { d.selectedPriceListIndex = i; d.updateSelectedPriceList(); } }); await L.wait(page, 800);
  await page.evaluate(() => { const d = F(); const opts = d.getCurrentPriceOptions(); const o = opts.find(x => x.months === 19) || opts[0]; d.selectPriceOption(o, d.getPriceFieldName()); }); await L.wait(page, 800);
  console.log('preisliste gewählt:', await page.evaluate(() => { const d = F(); const lists = d.priceData?.price_lists || d.priceData?.lists || Object.values(d.priceData || {}); return (lists[d.selectedPriceListIndex] || {}).name || (lists[d.selectedPriceListIndex] || {}).price_list_name; }));
  await scrollToEl(page, '.contract-price-field');
  await L.shot(page, 'f5-vertrag-zahlungsoption', { noScroll: true, marks: [ { id: 'opt', kind: 'badge', n: 2, fn: () => { const s = [...document.querySelectorAll('label.contract-price-option')].find(e => e.offsetParent !== null); const r = s?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' }, { id: 'rabatt', kind: 'badge', n: 3, fn: () => { const s = [...document.querySelectorAll('.contract-price-discounts select')].find(e => e.offsetParent !== null); const r = s?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' } ]});
  const zahl = await page.evaluate(() => { const els = [...document.querySelectorAll('span')].filter(e => e.textContent.trim() === 'Zahlung:' && e.offsetParent !== null); const el = els[0]; if (!el) return null; const p = el.parentElement; window.scrollTo(0, p.getBoundingClientRect().top + window.scrollY - 330); return p.textContent.replace(/\s+/g, ' ').trim(); });
  console.log('Zahlung-Zeile:', zahl); await L.wait(page, 500);
  await L.shot(page, 'f6-vertrag-zusammenfassung', { noScroll: true, marks: [ { id: 'zahlung', kind: 'frame', fn: () => { const el = [...document.querySelectorAll('span')].find(e => e.textContent.trim() === 'Zahlung:' && e.offsetParent !== null); const p = el?.parentElement?.getBoundingClientRect(); return p ? { x: p.x, y: p.y, w: p.width, h: p.height } : null; } } ]});
  // Gutschein/Werber-Bereich
  await scrollToEl(page, '.signing-extras-voucher, .contract-price-field', 60);
  await L.shot(page, 'f6b-vertrag-gutschein-werber', { noScroll: true, marks: [ { id: 'gs', kind: 'badge', n: 4, fn: C.rectOfLabel, fnArg: 'Gutscheine verrechnen', at: 'l' }, { id: 'werber', kind: 'badge', n: 5, fn: C.rectOfLabel, fnArg: 'Freunde werben', at: 'l' } ]});
  await page.evaluate(() => F().deleteDraft?.()).catch(() => {});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
