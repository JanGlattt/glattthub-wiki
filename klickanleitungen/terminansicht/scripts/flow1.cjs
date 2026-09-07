/* Stufe 1: Terminübersicht → Termin öffnen → Termin beginnen → Session-Kacheln → Formularliste */
const L = require('./lib.cjs');
const DATE = '2026-09-08';
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  // ── A1 Terminübersicht (Tag des Termins, ohne Filter)
  await L.goto(page, '/hub/appointments', 2500);
  await page.evaluate(d => { window.aptPage.selectedDate = d; window.aptPage.flatpickrInstance?.setDate(d, false); window.aptPage.loadAppointments(); }, DATE);
  await page.waitForFunction(() => window.aptPage.isLoading === false, null, { timeout: 30000 });
  await L.wait(page, 2500);
  const info = await page.evaluate(() => ({ branch: window.aptPage.selectedBranch, n: window.aptPage.appointments?.length, cards: document.querySelectorAll('#appointments-list .apt-card').length, names: [...document.querySelectorAll('.apt-card__client-name')].map(e => e.textContent).slice(0, 12) }));
  console.log('Liste', JSON.stringify(info));
  await L.shot(page, 'a1-liste', { marks: [
    { id: 'filter', kind: 'badge', n: 1, sel: '#filter-consultation', at: 'tl' },
    { id: 'date', kind: 'badge', n: 2, sel: '#appointment-date + input, #appointment-date', at: 'tr' },
    { id: 'kpis', kind: 'frame', sel: '#appointments-kpis' },
  ]});
  // ── A2 Filter Beratung
  await page.click('#filter-consultation');
  await L.wait(page, 800);
  const cardSel = await page.evaluate(() => { const c = [...document.querySelectorAll('#appointments-list .apt-card')].find(c => c.textContent.includes('Tester Am Testen')); return c ? `#appointments-list .apt-card[data-idx="${c.dataset.idx}"]` : null; });
  console.log('cardSel', cardSel);
  await L.shot(page, 'a2-liste-beratung', { marks: [
    { id: 'filter', kind: 'frame', color: 'teal', sel: '#filter-consultation' },
    { id: 'card', kind: 'frame', sel: cardSel },
    { id: 'badge', kind: 'badge', n: 1, sel: cardSel + ' .apt-card__consultation-badge', at: 'l' },
    { id: 'status', kind: 'badge', n: 2, sel: cardSel + ' .apt-card__badge', at: 'l' },
    { id: 'open', kind: 'chip', label: 'Hier tippen', sel: cardSel + ' .apt-card__btn--primary', at: 'l' },
  ]});
  // Karte aufklappen (Notiz)
  await page.evaluate((s) => document.querySelector(s + ' .apt-card__expand').click(), cardSel);
  await L.wait(page, 1500);
  await L.shot(page, 'a3-liste-aufgeklappt', { marks: [ { id: 'expand', kind: 'badge', n: 3, sel: cardSel + ' .apt-card__expand', at: 'r' }, { id: 'details', kind: 'frame', sel: cardSel + ' .apt-card__details' } ]});
  // ── A4 Termin öffnen
  await page.evaluate((s) => document.querySelector(s + ' .apt-card__btn--primary').click(), cardSel);
  await page.waitForURL(/\/hub\/appointment\//, { timeout: 20000 });
  await L.hideBadge(page);
  await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  await L.wait(page, 2000);
  await L.shot(page, 'b1-detail-uebersicht', { marks: [
    { id: 'status', kind: 'badge', n: 1, sel: '.apt-detail-topbar-right .badge-glattt', at: 'l' },
    { id: 'kunde', kind: 'badge', n: 2, sel: '.apt-detail-sidebar .card-glattt:first-of-type, .apt-detail-sidebar > *:first-child', at: 'tl' },
    { id: 'behandlungen', kind: 'badge', n: 3, fn: () => { const h = [...document.querySelectorAll('h2, h3, .card-glattt-title')].find(e => e.textContent.trim().startsWith('Behandlungen')); const b = h?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
    { id: 'notizen', kind: 'badge', n: 4, fn: () => { const h = [...document.querySelectorAll('h2, h3, .card-glattt-title')].find(e => e.textContent.trim().startsWith('Notizen')); const b = h?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
    { id: 'start', kind: 'chip', label: 'Hier tippen', sel: 'button.apt-detail-action-btn--start', at: 'r' },
  ]});
  const st = await page.evaluate(() => { const d = Alpine.$data(document.querySelector('.apt-detail')); return { state: d.appointment?.state, forms: d.matchingForms?.map(f => f.name), required: d.requiredForms?.map(f => f.name), canStart: d.canStartAppointment }; });
  console.log('Detail', JSON.stringify(st));
  // ── B2 Termin beginnen
  await page.click('button.apt-detail-action-btn--start');
  await page.waitForFunction(() => Alpine.$data(document.querySelector('.apt-detail')).sessionActive === true, null, { timeout: 30000 });
  await L.wait(page, 3000);
  const st2 = await page.evaluate(() => { const d = Alpine.$data(document.querySelector('.apt-detail')); return { view: d.currentView, state: d.appointment?.state, missing: d.missingRequiredForms?.map(f => f.name), locked: d.treatmentLocked }; });
  console.log('nach Start', JSON.stringify(st2));
  await L.shot(page, 'b2-nach-start-' + st2.view, { marks: [ { id: 'running', kind: 'badge', n: 1, sel: '.apt-detail-running', at: 'l' }, { id: 'end', kind: 'frame', sel: '.apt-detail-actions .btn-glattt-danger' } ]});
  if (st2.view !== 'session') { await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('session')); await L.wait(page, 1200); }
  await L.shot(page, 'b3-session-kacheln', { marks: [
    { id: 'formulare', kind: 'chip', label: 'Hier tippen', sel: '.unified-session-grid .session-card:nth-of-type(1)', at: 'b' },
    { id: 'zettel', kind: 'badge', n: 2, sel: '.unified-session-grid .session-card:nth-of-type(2)', at: 'tl' },
  ]});
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('forms'));
  await L.wait(page, 1500);
  const forms = await page.evaluate(() => [...document.querySelectorAll('.session-forms-grid .session-card')].map(c => ({ t: c.querySelector('.session-card-title')?.textContent.trim(), blocked: c.classList.contains('session-form-card--blocked'), reason: c.querySelector('.session-form-blocked-reason')?.textContent.trim(), badge: c.querySelector('.session-card-badge')?.textContent.trim() })));
  console.log('Formulare', JSON.stringify(forms));
  await L.shot(page, 'c1-formulare-liste', { marks: forms.map((f, i) => ({ id: 'f' + i, kind: 'badge', n: i + 1, sel: `.session-forms-grid .session-card:nth-of-type(${i + 1})`, at: 'tl' })) });
  await ctx.storageState({ path: 'state.json' });
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
