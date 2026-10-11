/* Dokument O — Kundenportal: Zugang geben (Reiter „Kundenportal", seit 11.10.2026)
   ACHTUNG — dieser Ablauf SCHREIBT: Für die Ergebnis-Seiten (o3, o4, o5) legt er ein Konto mit
   Einladung an, stellt einen Passwort-Link aus und sperrt/entsperrt das Konto. Deshalb läuft er
   nur mit KLICK_WRITE=1 und nur gegen den lokalen Hub; sonst entstehen nur o1 und o2.
   Weg ist immer „Link kopieren" — nie E-Mail oder WhatsApp, es geht nichts an die Kundin.       */
const L = require('./lib.cjs');

const WRITE = process.env.KLICK_WRITE === '1' && /localhost|glattthub\.local|127\.0\.0\.1/.test(process.env.KLICK_BASE || '');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openClient(page, 2500);

  // ── o1 Reiter Kundenportal
  const hasTab = await L.tab(page, 'Kundenportal', 3500);
  if (!hasTab) { console.log('Reiter „Kundenportal" fehlt — Recht manage_customer_access prüfen.'); await browser.close(); return; }
  await page.waitForFunction(() => document.querySelector('[data-portal-status]')?.offsetParent !== null, null, { timeout: 20000 }).catch(() => console.log('STAND NICHT GELADEN'));
  await L.wait(page, 800);
  await L.shot(page, 'o1-kundenportal', { marks: [
    { id: 'stand', kind: 'badge', n: 1, sel: '[data-portal-status]', at: 'l' },
    { id: 'kontakt', kind: 'badge', n: 2, ...L.byText('.client-overview-row-glattt-label', 'Handy (Phorest)'), at: 'l' },
    { id: 'knoepfe', kind: 'badge', n: 3, sel: '[data-portal-invite], [data-portal-password]', at: 'l' },
    { id: 'verlauf', kind: 'badge', n: 4, ...L.byText('.card-glattt-title', 'Verlauf'), at: 'l' },
  ]});

  // ── o2 Einladen: Fenster mit Wegwahl
  const canInvite = await page.evaluate(() => {
    const b = document.querySelector('[data-portal-invite]');
    if (!b || b.offsetParent === null) return false;
    b.click();
    return true;
  });
  if (!canInvite) { console.log('Kein Einladen-Knopf (Konto aktiv?) — o2/o3 fehlen, dafür o4.'); }
  await L.wait(page, 1200);
  let clip = canInvite ? await L.clipOf(page, '.modal-glattt', 40) : null;
  if (clip) {
    await L.shot(page, 'o2-einladen', { clip, noScroll: true, marks: [
      { id: 'weg', kind: 'badge', n: 1, sel: '.modal-glattt .dropdown-glattt, .modal-glattt .form-glattt-group', at: 'l' },
      { id: 'hinweis', kind: 'badge', n: 2, sel: '.modal-glattt .form-glattt-hint', at: 'l' },
      { id: 'senden', kind: 'chip', label: 'Zum Schluss', sel: '[data-portal-submit]', at: 'l' },
    ]});

    if (WRITE) {
      // Weg „Link kopieren" — nichts geht an die Kundin
      await page.evaluate(() => { const c = Alpine.$data(document.querySelector('[data-client-portal-card]')); c.form.channel = 'copy'; });
      await page.evaluate(() => document.querySelector('[data-portal-submit]')?.click());
      await page.waitForFunction(() => document.querySelector('[data-portal-link]')?.offsetParent !== null, null, { timeout: 20000 }).catch(() => console.log('ERGEBNIS FEHLT'));
      await L.wait(page, 1000);
      clip = await L.clipOf(page, '.modal-glattt', 40);
      await L.shot(page, 'o3-link-ergebnis', { clip, noScroll: true, marks: [
        { id: 'link', kind: 'badge', n: 1, sel: '[data-portal-link]', at: 'l' },
        { id: 'whatsapp', kind: 'badge', n: 2, ...L.byText('.modal-glattt button', 'QR-Code groß zeigen'), at: 'l' },
        { id: 'text', kind: 'badge', n: 4, sel: '.modal-glattt textarea', at: 'l' },
      ]});
    }
    await page.keyboard.press('Escape');
    await L.wait(page, 800);
  }

  if (WRITE) {
    // o4 Passwort zurücksetzen braucht ein aktives Konto — das Skript simuliert das nicht,
    // sondern nimmt den Zustand, der da ist: aktiv → Knopf da, sonst Hinweis.
    const hasReset = await page.evaluate(() => { const b = document.querySelector('[data-portal-password]'); return !!b && b.offsetParent !== null; });
    if (hasReset) {
      await page.evaluate(() => document.querySelector('[data-portal-password]')?.click());
      await L.wait(page, 1200);
      clip = await L.clipOf(page, '.modal-glattt', 40);
      await L.shot(page, 'o4-passwort', { clip, noScroll: true, marks: [
        { id: 'weg', kind: 'badge', n: 2, sel: '.modal-glattt .form-glattt-group', at: 'l' },
      ]});
      await page.keyboard.press('Escape');
      await L.wait(page, 800);
    } else {
      console.log('Konto nicht aktiv — o4-passwort fehlt (Kundin muss ihr Passwort gesetzt haben).');
    }

    // o5 Sperren: Rückfrage zeigen, dann abbrechen (nichts ändern)
    const hasLock = await page.evaluate(() => { const b = document.querySelector('[data-portal-lock]'); if (!b || b.offsetParent === null) return false; b.click(); return true; });
    if (hasLock) {
      await L.wait(page, 1000);
      clip = await L.clipOf(page, '.modal-glattt', 40);
      await L.shot(page, 'o5-sperren', { clip, noScroll: true, marks: [
        { id: 'sperren', kind: 'chip', label: 'Mit Rückfrage', ...L.byText('.modal-glattt-footer button', 'Sperren'), at: 'l' },
      ]});
      await page.keyboard.press('Escape');
    }
  }

  await browser.close();
})();
