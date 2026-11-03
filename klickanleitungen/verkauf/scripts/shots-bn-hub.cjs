/* Black November im Institut (03.11.2026): Umschlag oben in der Kundeninformation für
   Neukundinnen ohne Online-Code — vor dem Öffnen (bn7) und mit Gewinn (bn8).
   Lokal: Die Antworten von /api/forms/promo-envelope werden im Browser vorgegeben (die Ziehung
   läuft im WordPress-Plugin und würde lokal einen echten Aufruf an glattt.com auslösen), die Kundin
   wird ohne Phorest-Abruf gesetzt. Formular 6 braucht den Schalter „Umschlag-Aktion oben anzeigen“.
   Liest nur, reicht nichts ein. */
const L = require('./lib.cjs');

const CAMPAIGN = {
  name: 'Black November',
  title: 'Drei goldene Umschläge. Einer gehört dir.',
  text: 'In jedem steckt ein Vorteil für dein glattt-Paket – vom Startbonus bis zur ersten Sitzung gratis. Tippe auf einen Umschlag.',
  hint: '*Alle Preise gelten für dein glattt-Paket und werden mit der ersten Zahlung verrechnet.',
  deadline: '30. November 2026',
};
const DRAW = {
  code: 'BN26-150E-K7PQ', label: '150 € Startbonus*',
  note: '*Der Startbonus gilt für dein glattt-Paket: Wir ziehen 150 € von deiner ersten Zahlung ab.',
  top: false, others: [{ label: '75 € Startbonus*' }, { label: '50 € Startbonus*' }], deadline: '30. November 2026',
};

(async () => {
  const { browser, ctx, page } = await L.launch();
  await page.route('**/api/forms/promo-envelope/draw', r => r.fulfill({ json: { success: true, data: { state: 'has_code', draw: DRAW, promo: { code: DRAW.code, label: '150 € Startbonus', tier: 'BN26-150E' } } } }));
  await page.route('**/api/forms/promo-envelope?*', r => r.fulfill({ json: { success: true, data: { state: 'eligible', promo: null, campaign: CAMPAIGN } } }));
  await L.login(page, ctx);
  await L.goto(page, '/hub/forms/fill/6?branchId=magdeburg&appointmentId=beratung', 2500);
  await page.evaluate(() => {
    const d = Alpine.$data(document.querySelector('.form-fill-container'));
    d.contextData = Object.assign({}, d.contextData || {}, { client: { clientId: 'neukundin', firstName: 'Lena', lastName: 'Muster' } });
  });
  await page.waitForSelector('[data-promo-envelope]', { timeout: 10000 });
  await L.wait(page, 800);

  const clip = async () => page.evaluate(() => {
    const r = document.querySelector('[data-promo-envelope]').getBoundingClientRect();
    return { x: Math.max(0, r.x - 16), y: Math.max(0, r.y - 16), width: r.width + 32, height: r.height + 32 };
  });
  await page.evaluate(() => window.scrollTo(0, 0));

  await L.shot(page, 'bn7-hub-umschlaege', { clip: await clip(), noScroll: true, marks: [
    { id: 'umschlag', kind: 'badge', n: 1, sel: '.promo-envelope-glattt-item:nth-child(2) .promo-envelope-glattt-shape', at: 'tr' },
    { id: 'tippen', kind: 'chip', label: 'Kundin tippt', sel: '.promo-envelope-glattt-item:nth-child(2) .promo-envelope-glattt-shape', at: 'b' },
  ]});

  await page.evaluate(() => document.querySelectorAll('.promo-envelope-glattt-item')[1].click());
  await page.waitForSelector('[data-promo-envelope-result]', { timeout: 10000 });
  await L.wait(page, 1500);

  await L.shot(page, 'bn8-hub-gewinn', { clip: await clip(), noScroll: true, marks: [
    { id: 'gewinn', kind: 'badge', n: 2, sel: '.promo-envelope-glattt-prize', at: 'l' },
    { id: 'code', kind: 'badge', n: 3, sel: '.promo-envelope-glattt-meta', at: 'l' },
    { id: 'vertrag', kind: 'badge', n: 4, sel: '.promo-envelope-glattt-staff', at: 'l' },
  ]});
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
