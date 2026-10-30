/* „Wie geht es weiter?" und „Doch nicht behandeln" (30.10.2026) — ohne Phorest-Schreibzugriff:
   Das Auswahl-Modal wird in der Beratung direkt geöffnet; für den Rückweg-Hinweis braucht der
   Behandlungstermin KLICK_TREAT einen Eintrag in direct_treatment_bookings (lokal per Tinker
   anlegen). „Behandlungstermin stornieren" wird NIE geklickt. */
const C = require('./common.cjs'); const L = C.L;
const TREAT = process.env.KLICK_TREAT || '';
const S = () => Alpine.$data(document.querySelector('.apt-detail'));
const loaded = (page) => page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
(async () => {
  if (!TREAT) { console.error('KLICK_TREAT fehlt'); process.exit(2); }
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);

  // 1) Beratung: „Wie geht es weiter?" — erst ohne Wahl, dann mit „Ja, heute direkt behandeln"
  await L.goto(page, `/hub/appointment/${L.MD}/${L.APT}`, 1500); await loaded(page); await L.wait(page, 5000);
  await page.evaluate(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); s.directOfferChoice = null; s.showDirectTreatmentOffer = true; }); await L.wait(page, 800);
  await L.shot(page, 'h4-wie-geht-es-weiter', { noScroll: true, marks: [
    { id: 'later', kind: 'badge', n: 1, sel: '.direct-offer-glattt-options label:nth-of-type(1)', at: 'l' },
    { id: 'today', kind: 'badge', n: 2, sel: '.direct-offer-glattt-options label:nth-of-type(2)', at: 'l' },
  ]});
  await page.evaluate(() => { Alpine.$data(document.querySelector('.apt-detail')).directOfferChoice = 'today'; }); await L.wait(page, 500);
  await L.shot(page, 'h4b-wie-geht-es-weiter-gewaehlt', { noScroll: true, marks: [
    { id: 'go', kind: 'chip', label: 'Hier tippen', fn: C.rectOfBtn, fnArg: 'Weiter: Behandlung', at: 'l' },
  ]});
  await page.evaluate(() => { Alpine.$data(document.querySelector('.apt-detail')).closeDirectTreatmentOffer(); });

  // 2) Behandlung: Hinweis „Direkt nach der Beratung gebucht" + Rückweg-Dialog
  await L.goto(page, `/hub/appointment/${L.MD}/${TREAT}`, 1500); await loaded(page); await L.wait(page, 5000);
  // Alter Testtermin steht in Phorest auf „No Show" — fürs Bild wie eine frisch gebuchte Behandlung zeigen
  // (vergangen + gebucht = „No Show"), und der rote Schulden-Hinweis des Testkunden lenkt ab
  await page.evaluate(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); if (s.appointment) s.appointment.state = 'CHECKED_IN'; });
  await page.addStyleTag({ content: '.balance-alert-banner:not(.balance-alert-banner--undo):not(.balance-alert-banner--handover){display:none !important}' });
  await L.wait(page, 500);
  const has = await page.evaluate(() => !!Alpine.$data(document.querySelector('.apt-detail')).canUndoDirectTreatment);
  if (!has) { console.error('Kein Rückweg-Hinweis — Eintrag in direct_treatment_bookings fehlt oder Termin beendet'); await browser.close(); process.exit(3); }
  await L.shot(page, 'h5-rueckweg-hinweis', { noScroll: true, marks: [
    { id: 'undo', kind: 'chip', label: 'Hier tippen', sel: '.balance-alert-banner--undo .balance-alert-banner-action', at: 'l' },
  ]});
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).openUndoDirect()); await L.wait(page, 600);
  await page.click('#direct-undo-note'); await page.keyboard.type('War vor drei Wochen im Urlaub, Behandlung erst in einer Woche.', { delay: 10 });
  await L.wait(page, 400);
  await L.shot(page, 'h6-doch-nicht-behandeln', { noScroll: true, marks: [
    { id: 'note', kind: 'badge', n: 1, sel: '#direct-undo-note', at: 'l' },
    { id: 'go', kind: 'chip', label: 'Hier tippen', fn: C.rectOfBtn, fnArg: 'Behandlungstermin stornieren', at: 'l' },
  ]});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
