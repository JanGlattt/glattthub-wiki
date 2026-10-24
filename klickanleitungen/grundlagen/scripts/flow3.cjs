/* Grundlagen 3 — Mein Profil (v2.0, 25.10.2026: Kopfkarte und Abschnitte)
   ACHTUNG: Es wird NICHTS gespeichert. Der PIN-Dialog wird nur mit zwei Ziffern fotografiert und
   abgebrochen; „Andere Sitzungen beenden" wird NICHT gedrückt. Läuft gegen einen Testzugang mit
   Admin-Recht, damit die Karte „Zugang" Passkey und Passwort zeigt (sonst nur PIN + Face ID). */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch({ viewport: { width: 1180, height: 1100 } });
  await L.login(page, ctx);
  await L.goto(page, '/hub/profile', 2500);

  await L.shot(page, 'i1-profil', { marks: [
    { id: 'foto', kind: 'badge', n: 1, sel: '.profile-hero-glattt-photo', at: 'l' },
    { id: 'status', kind: 'badge', n: 2, sel: '.profile-hero-glattt-badges', at: 'b' },
    { id: 'pin', kind: 'badge', n: 3, sel: '.profile-hero-glattt-actions .btn-glattt-primary', at: 'r' },
  ]});

  const card = async (id, name, marks) => {
    await L.scrollTo(page, `#${id}`);
    await L.wait(page, 500);
    await L.shot(page, name, { clip: await L.clipOf(page, `#${id}`, 16), noScroll: true, marks });
  };
  await card('zugang-section', 'i2-zugang', [
    { id: 'pin', kind: 'badge', n: 1, ...L.byText('#zugang-section .profile-row-glattt-title', 'PIN'), at: 'l' },
    { id: 'passkey', kind: 'badge', n: 2, ...L.byText('#zugang-section .profile-row-glattt-title', 'Passkey'), at: 'l' },
    { id: 'passwort', kind: 'badge', n: 3, ...L.byText('#zugang-section .profile-row-glattt-title', 'Passwort'), at: 'l' },
  ]);
  await card('sicherheit-section', 'i4-sicherheit', [
    { id: 'dieses', kind: 'badge', n: 1, ...L.byText('#sicherheit-section .badge-glattt', 'Dieses Gerät'), at: 'r' },
    { id: 'beenden', kind: 'chip', label: 'Nur im Notfall', ...L.byText('#sicherheit-section button', 'Andere Sitzungen'), at: 'l' },
  ]);
  await card('appearance-section', 'i5-darstellung', [
    { id: 'schema', kind: 'badge', n: 4, sel: '#appearance-section .segmented-control-glattt', at: 'l' },
    { id: 'rundgang', kind: 'chip', label: 'Einführung erneut', ...L.byText('#appearance-section button', 'Rundgang'), at: 'l' },
  ]);

  // PIN-Dialog: Schritt 1 mit zwei Ziffern, dann abbrechen — nichts wird gespeichert
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('.profile-hero-glattt-actions .btn-glattt-primary');
  await L.wait(page, 600);
  await page.keyboard.type('12');
  await L.wait(page, 400);
  await L.shot(page, 'i3-pin', { clip: await L.clipOf(page, '.modal-glattt', 24), noScroll: true, marks: [
    { id: 'schritt', kind: 'badge', n: 1, sel: '.pin-steps-glattt', at: 'l' },
    { id: 'punkte', kind: 'badge', n: 2, sel: '.pin-dots-glattt', at: 'r' },
    { id: 'block', kind: 'badge', n: 3, sel: '.pin-keypad-glattt', at: 'l' },
  ]});
  await page.keyboard.press('Escape');
  console.log('Hinweis: nichts gespeichert, keine Sitzung beendet.');
  await browser.close();
})();
