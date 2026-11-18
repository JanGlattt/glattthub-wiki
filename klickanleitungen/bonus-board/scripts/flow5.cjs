/* Dokument S — Monatsabschluss (Widerrufe, Korrekturen, Einfrieren, Google-Bewertungen)
   Braucht das Verwaltungs-Recht. WICHTIG: Es wird NICHTS entschieden, NICHTS korrigiert und
   NICHTS eingefroren — alle Knöpfe werden nur markiert bzw. Fenster geöffnet und verworfen.
   Ein versehentlicher Klick auf „Final einfrieren" wäre nicht rückgängig zu machen.        */
const L = require('./lib.cjs');

// KLICK_ONLY=s5-springertage nimmt nur einzelne Bilder neu auf (Komma-Liste), leer = alle
const ONLY = (process.env.KLICK_ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
const want = id => !ONLY.length || ONLY.includes(id);

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openAdmin(page, 3000);

  const cardClip = async (page, start, key) => {
    const ok = await page.evaluate(([s, k]) => {
      const h = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.startsWith(s));
      const c = h?.closest('.card-glattt'); if (!c) return false;
      c.dataset.klick = k; c.scrollIntoView({ block: 'start' });
      return true;
    }, [start, key]);
    await L.wait(page, 600);
    return ok ? L.clipOf(page, `[data-klick="${key}"]`, 16) : null;
  };

  // ── s1 Widerrufe entscheiden (Knöpfe nur markieren!)
  let clip = want('s1-widerrufe-entscheiden') ? await cardClip(page, 'Offene Widerrufe', 'wid') : null;
  if (clip) {
    await L.shot(page, 's1-widerrufe-entscheiden', { clip, noScroll: true, marks: [
      { id: 'zaehlt', kind: 'badge', n: 1, ...L.byText('[data-klick="wid"] .btn-glattt-secondary', 'zählt'), at: 't' },
      { id: 'nicht', kind: 'badge', n: 2, ...L.byText('[data-klick="wid"] .btn-glattt-danger', 'zählt nicht'), at: 't' },
      { id: 'parken', kind: 'badge', n: 3, ...L.byText('[data-klick="wid"] .btn-glattt-secondary', 'parken'), at: 't' },
      { id: 'spalten', kind: 'badge', n: 4, ...L.byText('[data-klick="wid"] th', 'Team-Bonus'), at: 't' },
    ]});
  } else if (want('s1-widerrufe-entscheiden')) { console.log('Keine offenen Widerrufe — s1 fehlt. Monat mit offenen Fällen wählen.'); }

  // ── s2 Wert-Korrekturen
  clip = want('s2-korrektur') ? await cardClip(page, 'Wert-Korrekturen', 'korr') : null;
  if (clip) {
    await L.shot(page, 's2-korrektur', { clip, noScroll: true, marks: [
      { id: 'neu', kind: 'chip', label: 'Hier tippen', ...L.byText('[data-klick="korr"] .btn-glattt-primary', 'Neue Korrektur'), at: 'l' },
    ]});
  }

  // ── s5 Springertage (seit 18.11.2026; nur markieren, nichts speichern)
  if (want('s5-springertage')) {
    await page.waitForFunction(() => window.A().springerLoaded, null, { timeout: 60000 });
    clip = await cardClip(page, 'Springertage', 'spring');
    if (clip) {
      await L.shot(page, 's5-springertage', { clip, noScroll: true, marks: [
        { id: 'saldo', kind: 'badge', n: 1, sel: '[data-klick="spring"] .stat-strip-glattt', at: 'l' },
        { id: 'fehlt', kind: 'badge', n: 2, ...L.byText('[data-klick="spring"] .badge-glattt-warning', 'Institut fehlt'), at: 'l' },
        { id: 'quelle', kind: 'badge', n: 3, ...L.byText('[data-klick="spring"] .badge-glattt', 'askDANTE'), at: 't' },
        { id: 'neu', kind: 'chip', label: 'Hier ergänzen', ...L.byText('[data-klick="spring"] .btn-glattt-primary', 'Springertag ergänzen'), at: 'r' },
      ]});
    }
    // Fenster „Springertag ergänzen" öffnen, fotografieren, verwerfen
    await page.evaluate(() => window.A().openSpringerModal());
    await L.wait(page, 800);
    const modal = await page.evaluate(() => {
      const m = [...document.querySelectorAll('.modal-glattt')].find(x => x.offsetParent && x.textContent.includes('Springertag ergänzen'));
      if (!m) return false; m.dataset.klick = 'spmodal'; return true;
    });
    if (modal) {
      await L.shot(page, 's6-springertag-ergaenzen', { clip: await L.clipOf(page, '[data-klick="spmodal"]', 16), noScroll: true, marks: [
        { id: 'tag', kind: 'badge', n: 1, ...L.byText('[data-klick="spmodal"] .input-glattt-floating-label', 'Tag'), at: 'r' },
        { id: 'person', kind: 'badge', n: 2, ...L.byText('[data-klick="spmodal"] label', 'Person'), at: 'r' },
        { id: 'stamm', kind: 'badge', n: 3, ...L.byText('[data-klick="spmodal"] label', 'Stamminstitut'), at: 'r' },
        { id: 'ziel', kind: 'badge', n: 4, ...L.byText('[data-klick="spmodal"] label', 'Ausgeholfen in'), at: 'r' },
      ]});
    }
    await page.evaluate(() => { window.A().showSpringerModal = false; });
    await L.wait(page, 400);
  }

  // ── s3 Monatsabschluss (NICHT klicken)
  clip = want('s3-einfrieren') ? await cardClip(page, 'Monatsabschluss', 'freeze') : null;
  if (clip) {
    await L.shot(page, 's3-einfrieren', { clip, noScroll: true, marks: [
      { id: 'notiz', kind: 'badge', n: 1, ...L.byText('[data-klick="freeze"] .input-glattt-floating-label', 'Notiz'), at: 'l' },
      { id: 'final', kind: 'badge', n: 2, ...L.byText('[data-klick="freeze"] .checkbox-glattt-label', 'Final einfrieren'), at: 'l' },
      { id: 'knopf', kind: 'frame', color: 'teal', ...L.byText('[data-klick="freeze"] .btn-glattt-primary', 'Stand jetzt einfrieren') },
    ]});
    console.log('Hinweis: Monatsabschluss nur fotografiert — nicht eingefroren.');
  }

  // ── s4 Google-Bewertungen
  if (!want('s4-google')) { await browser.close(); return; }
  await L.goto(page, '/hub/bonus/google-bewertungen', 3000);
  await L.shot(page, 's4-google', { marks: [
    { id: 'erfassen', kind: 'chip', label: 'Hier erfassen', ...L.byText('.btn-glattt-primary', 'Bewertung'), at: 'l' },
    { id: 'liste', kind: 'frame', color: 'teal', sel: '.table-glattt' },
  ]});

  await browser.close();
})();
