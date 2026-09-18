/* Dokument S — Monatsabschluss (Widerrufe, Korrekturen, Einfrieren, Google-Bewertungen)
   Braucht das Verwaltungs-Recht. WICHTIG: Es wird NICHTS entschieden, NICHTS korrigiert und
   NICHTS eingefroren — alle Knöpfe werden nur markiert bzw. Fenster geöffnet und verworfen.
   Ein versehentlicher Klick auf „Final einfrieren" wäre nicht rückgängig zu machen.        */
const L = require('./lib.cjs');

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
  let clip = await cardClip(page, 'Offene Widerrufe', 'wid');
  if (clip) {
    await L.shot(page, 's1-widerrufe-entscheiden', { clip, noScroll: true, marks: [
      { id: 'zaehlt', kind: 'badge', n: 1, ...L.byText('[data-klick="wid"] .btn-glattt-secondary', 'zählt'), at: 't' },
      { id: 'nicht', kind: 'badge', n: 2, ...L.byText('[data-klick="wid"] .btn-glattt-danger', 'zählt nicht'), at: 't' },
      { id: 'parken', kind: 'badge', n: 3, ...L.byText('[data-klick="wid"] .btn-glattt-secondary', 'parken'), at: 't' },
      { id: 'spalten', kind: 'badge', n: 4, ...L.byText('[data-klick="wid"] th', 'Team-Bonus'), at: 't' },
    ]});
  } else { console.log('Keine offenen Widerrufe — s1 fehlt. Monat mit offenen Fällen wählen.'); }

  // ── s2 Wert-Korrekturen
  clip = await cardClip(page, 'Wert-Korrekturen', 'korr');
  if (clip) {
    await L.shot(page, 's2-korrektur', { clip, noScroll: true, marks: [
      { id: 'neu', kind: 'chip', label: 'Hier tippen', ...L.byText('[data-klick="korr"] .btn-glattt-primary', 'Neue Korrektur'), at: 'l' },
    ]});
  }

  // ── s3 Monatsabschluss (NICHT klicken)
  clip = await cardClip(page, 'Monatsabschluss', 'freeze');
  if (clip) {
    await L.shot(page, 's3-einfrieren', { clip, noScroll: true, marks: [
      { id: 'notiz', kind: 'badge', n: 1, ...L.byText('[data-klick="freeze"] .input-glattt-floating-label', 'Notiz'), at: 'l' },
      { id: 'final', kind: 'badge', n: 2, ...L.byText('[data-klick="freeze"] .checkbox-glattt-label', 'Final einfrieren'), at: 'l' },
      { id: 'knopf', kind: 'frame', color: 'teal', ...L.byText('[data-klick="freeze"] .btn-glattt-primary', 'Stand jetzt einfrieren') },
    ]});
    console.log('Hinweis: Monatsabschluss nur fotografiert — nicht eingefroren.');
  }

  // ── s4 Google-Bewertungen
  await L.goto(page, '/hub/bonus/google-bewertungen', 3000);
  await L.shot(page, 's4-google', { marks: [
    { id: 'erfassen', kind: 'chip', label: 'Hier erfassen', ...L.byText('.btn-glattt-primary', 'Bewertung'), at: 'l' },
    { id: 'liste', kind: 'frame', color: 'teal', sel: '.table-glattt' },
  ]});

  await browser.close();
})();
