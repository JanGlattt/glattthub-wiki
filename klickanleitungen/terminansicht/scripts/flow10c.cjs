/* Terminansicht 11 — nach der zweiten Unterschrift (v9 Session frei, v10 Kundenprofil). */
const C = require('./common.cjs'); const L = C.L;
const APT = process.env.KLICK_MINOR_APT || '';
const CLIENT = process.env.KLICK_MINOR_CLIENT || '';
if (!APT || !CLIENT) { console.error('KLICK_MINOR_APT und KLICK_MINOR_CLIENT setzen.'); process.exit(2); }
const S = () => Alpine.$data(document.querySelector('.apt-detail'));
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await C.ensureSession(page, APT);
  await page.evaluate(() => S().navigateTo('session')); await L.wait(page, 1500);
  const st = await page.evaluate(() => ({ locked: S().treatmentLocked, missing: S().missingRequiredForms.map(f => f.name) }));
  console.log('Session:', JSON.stringify(st));
  if (st.locked) console.log('WARNUNG: Einstellungszettel noch gesperrt — zweite Unterschrift fehlt?');
  await L.shot(page, 'v9-session-frei', { noScroll: true, marks: [
    { id: 'zettel', kind: 'badge', n: 1, fn: C.rectOfLabel, fnArg: 'Einstellungszettel', at: 'l' },
  ]});
  // Kundenprofil: Übersicht mit Abzeichen und Stand der Erlaubnis
  await L.goto(page, `/hub/clients/${CLIENT}`, 4000);
  await page.waitForFunction(() => document.querySelector('[data-minor-badge]') && document.querySelector('[data-minor-badge]').offsetParent !== null, null, { timeout: 30000 }).catch(() => console.log('Minderjährig-Abzeichen nicht sichtbar'));
  await L.wait(page, 2500);
  await page.evaluate(() => { const el = document.querySelector('[data-minor-badge]'); el?.closest('.card-glattt')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -90); }); await L.wait(page, 600);
  await L.shot(page, 'v10-kundenprofil', { noScroll: true, marks: [
    { id: 'minor', kind: 'badge', n: 2, sel: '[data-minor-badge]', at: 'l' },
    { id: 'stand', kind: 'badge', n: 2, fn: C.rectOfLabel, fnArg: 'Erlaubnis Minderjährige', at: 'l' },
  ]});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
