/* Wissen 5 — Kiosk am Institut-iPad: Knopf auf der Institutsseite, Kiosk-Start. Ohne Anmeldung (Token). */
const L = require('./lib.cjs');
const TOKEN = process.env.KLICK_WISSEN_TOKEN;
if (!TOKEN) L.fail('KLICK_WISSEN_TOKEN fehlt — Zugangsschlüssel einer Institutsseite in .env setzen.');
(async () => {
  const anon = await L.launch({ fresh: true });
  await L.goto(anon.page, '/shared/institut/' + TOKEN, 3000);
  const clip = await L.clipOf(anon.page, '.ipd-header', 24);
  await L.shot(anon.page, 'w20-institutsseite', { clip, noScroll: true, marks: [
    { id: 'knopf', kind: 'chip', label: 'Hier tippen', sel: '.ipd-wissen-link', at: 'l' },
  ]});
  await L.goto(anon.page, '/shared/wissen/' + TOKEN, 2500);
  await L.shot(anon.page, 'w21-kiosk', { marks: [
    { id: 'band', kind: 'badge', n: 1, sel: '.wissen-tabs-inner', at: 'l' },
    { id: 'suche', kind: 'badge', n: 2, sel: '.wissen-top-search', at: 'l' },
    { id: 'zurueck', kind: 'chip', label: 'Zurück', sel: '.wissen-top-hub', at: 'l' },
  ]});
  await anon.browser.close();
})();
