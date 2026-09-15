/* Grundlagen 3 — Mein Profil
   ACHTUNG: Es wird NICHTS gespeichert. Passwort und PIN werden nur fotografiert;
   „Andere Sitzungen abmelden" wird NICHT gedrückt — das würde laufende Sitzungen beenden. */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/user/profile', 3000);

  await L.shot(page, 'i1-profil', { marks: [
    { id: 'angaben', kind: 'badge', n: 1, ...L.byText('h2, h3, .card-glattt-title', 'Profil'), at: 'l' },
    { id: 'bild', kind: 'badge', n: 2, sel: '[data-user-avatar], .profile-photo', at: 'r' },
  ]});

  const section = async (start, key, name, marks) => {
    const ok = await page.evaluate(([s, k]) => {
      const h = [...document.querySelectorAll('h2, h3, .card-glattt-title')]
        .find(e => e.textContent.trim().startsWith(s));
      const c = h?.closest('.card-glattt, section, div.mt-10, div');
      if (!c) return false;
      c.dataset.klick = k; c.scrollIntoView({ block: 'center' });
      return true;
    }, [start, key]);
    await L.wait(page, 600);
    if (!ok) { console.log('ABSCHNITT FEHLT:', start); return; }
    await L.shot(page, name, { clip: await L.clipOf(page, `[data-klick="${key}"]`, 16), noScroll: true, marks });
  };

  await section('Passwort', 'pw', 'i2-passwort', [
    { id: 'speichern', kind: 'chip', label: 'Zum Schluss', ...L.byText('[data-klick="pw"] button', 'Speichern'), at: 'l' },
  ]);
  await section('PIN', 'pin', 'i3-pin', [
    { id: 'neu', kind: 'badge', n: 1, sel: '[data-klick="pin"] input', at: 'l' },
  ]);
  await section('Browser', 'sessions', 'i4-sitzungen', [
    { id: 'abmelden', kind: 'chip', label: 'Nur im Notfall', ...L.byText('[data-klick="sessions"] button', 'Andere'), at: 'l' },
  ]);
  await section('Einführung', 'tour', 'i5-rundgang', [
    { id: 'zuruecksetzen', kind: 'chip', label: 'Rundgänge neu', ...L.byText('[data-klick="tour"] button', 'Zurücksetzen'), at: 'l' },
  ]);
  console.log('Hinweis: nichts gespeichert, keine Sitzung beendet.');

  await browser.close();
})();
