/* Grundlagen 2 — Ergänzung 09.10.2026: Reiter „Einstellungen“ mit dem dritten Schalter „E-Mail“ (h6).
   Nimmt nur h6 neu auf, damit die übrigen Bilder der Serie unberührt bleiben. Läuft lokal oder auf
   Staging mit einem Konto, das eine E-Mail-Adresse hat (sonst fehlt der Schalter).
   Aufruf aus grundlagen/: KLICK_BASE=… KLICK_USER=… KLICK_PW=… node scripts/flow2c-email-kanal.cjs */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch({ fresh: true });
  await L.login(page, ctx);
  await L.goto(page, '/hub/notifications', 2500);
  await page.waitForFunction(() => {
    const root = document.querySelector('.notif-page-glattt');
    return root && !Alpine.$data(root).loading;
  }, null, { timeout: 15000 }).catch(() => console.log('Hinweis: Posteingang lud nicht'));

  await page.evaluate(() => document.querySelectorAll('input[name=notif-tab]')[1]?.click());
  await page.waitForFunction(() => {
    const card = document.querySelector('#notification-preferences');
    return card && !Alpine.$data(card).loading;
  }, null, { timeout: 15000 }).catch(() => console.log('Hinweis: Karte „Meine Benachrichtigungen“ lud nicht'));
  await L.wait(page, 600);

  // Den Bereich mit einem E-Mail-Schalter aufklappen (Kundenservice), alle anderen zu, Zeile mittig
  const opened = await page.evaluate(() => {
    const groups = [...document.querySelectorAll('#notification-preferences .notif-pref-glattt-group')];
    let target = null;
    for (const g of groups) {
      // x-show lässt versteckte Schalter im DOM (display:none am Wrapper) — nur echte zählen
      const hasMail = [...g.querySelectorAll('.toggle-glattt-label')].some(e => e.textContent.trim() === 'E-Mail' && e.closest('.toggle-glattt-wrapper').style.display !== 'none');
      const open = g.classList.contains('is-open');
      if (hasMail && !target) { target = g; if (!open) g.querySelector('.notif-pref-glattt-group-head').click(); }
      else if (open) g.querySelector('.notif-pref-glattt-group-head').click();
    }
    return target ? target.querySelector('.notif-pref-glattt-group-title')?.textContent.trim() : null;
  });
  console.log(opened ? 'Bereich offen: ' + opened : 'Kein Anlass mit E-Mail-Kanal — Konto ohne Adresse oder Regel ohne E-Mail?');
  await L.wait(page, 500);
  // Offenen Bereich knapp unter den Seitenkopf holen (shot() setzt den Scroll sonst auf 0 zurück → noScroll)
  await page.evaluate(() => {
    const g = document.querySelector('#notification-preferences .notif-pref-glattt-group.is-open');
    if (g) window.scrollTo({ top: Math.max(0, g.getBoundingClientRect().top + window.scrollY - 140), behavior: 'instant' });
  });
  await L.wait(page, 600);

  const toggle = (label) => { const l = [...document.querySelectorAll('#notification-preferences .toggle-glattt-label')].find(e => e.textContent.trim() === label && e.offsetParent !== null); if (!l) return null; const b = l.closest('.toggle-glattt-wrapper').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
  await L.shot(page, 'h6-meine-benachrichtigungen', { noScroll: true, marks: [
    { id: 'reiter', kind: 'badge', n: 1, fn: () => { const l = document.querySelectorAll('.notif-page-glattt .segmented-control-glattt-option')[1]; if (!l) return null; const r = l.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, at: 'b' },
    { id: 'modul', kind: 'badge', n: 2, fn: () => { const g = document.querySelector('#notification-preferences .notif-pref-glattt-group.is-open .notif-pref-glattt-group-head'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, at: 'l' },
    { id: 'hub', kind: 'badge', n: 3, fn: toggle, fnArg: 'Im Hub', at: 'l' },
    { id: 'push', kind: 'badge', n: 4, fn: toggle, fnArg: 'Push', at: 'l' },
    { id: 'email', kind: 'badge', n: 5, fn: toggle, fnArg: 'E-Mail', at: 'r' },
  ] });

  await browser.close();
})();
