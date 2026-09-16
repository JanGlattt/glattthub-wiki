/* Grundlagen 1 — Anmelden & zurechtfinden
   Die beiden Anmeldebilder entstehen OHNE Sitzung (fresh), damit die Anmeldeseite erscheint.
   Danach normal anmelden für Seitenleiste und Nutzerkarte. Nur Lesen.                      */
const L = require('./lib.cjs');

(async () => {
  // ── g1/g2 Anmeldeseite (ohne gespeicherte Sitzung)
  const anon = await L.launch({ fresh: true });
  await L.goto(anon.page, '/login', 2000);
  await L.shot(anon.page, 'g1-login-pin', { marks: [
    { id: 'pin', kind: 'badge', n: 1, sel: '#pin', at: 'l' },
    { id: 'senden', kind: 'chip', label: 'Hier tippen', ...L.byText('button', 'Mit PIN anmelden'), at: 'l' },
    { id: 'wechsel', kind: 'badge', n: 3, sel: '.login-method-switch, [x-model="loginMethod"]', at: 'r' },
  ]});
  await anon.page.evaluate(() => {
    const r = document.querySelector('#method-email');
    if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await L.wait(anon.page, 800);
  await L.shot(anon.page, 'g2-login-email', { marks: [
    { id: 'email', kind: 'badge', n: 2, sel: '#email', at: 'l' },
    { id: 'vergessen', kind: 'chip', label: 'Passwort neu setzen', ...L.byText('a', 'Passwort vergessen'), at: 'r' },
  ]});
  await anon.browser.close();

  // ── g3/g4/g5 Seitenleiste (angemeldet)
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub', 2500);
  await L.shot(page, 'g3-sidebar', { marks: [
    { id: 'schnell', kind: 'frame', color: 'teal', ...L.byText('.menu-title', 'Start') },
    { id: 'gruppen', kind: 'badge', n: 2, ...L.byText('.sidebar-group-label, .menu-title', 'Verkauf'), at: 'l' },
    { id: 'werkzeuge', kind: 'badge', n: 4, sel: '.sidebar-action', at: 'r' },
  ]});

  // Eine Gruppe aufklappen
  await L.clickText(page, '.sidebar-group-head, .sidebar-group, button', 'Verkauf', 1200);
  await L.shot(page, 'g4-gruppe-offen', { marks: [
    { id: 'offen', kind: 'frame', color: 'teal', sel: '.sidebar-group.expanded, .sidebar-group' },
  ]});

  // Fuss der Seitenleiste
  await L.scrollTo(page, '.sidebar-user-card', 'end');
  const clip = await L.clipOf(page, '.sidebar-user-card', 28);
  await L.shot(page, 'g5-nutzerkarte', { clip, noScroll: true, marks: [
    { id: 'karte', kind: 'badge', n: 1, sel: '.sidebar-user-card', at: 'tl' },
    { id: 'theme', kind: 'badge', n: 3, sel: '#theme-toggle', at: 'l' },
    { id: 'logout', kind: 'chip', label: 'Abmelden', sel: '.sidebar-logout', at: 'l' },
  ]});

  await browser.close();
})();
