/* Dokument I — Kundin finden & Profil verstehen
   Kundenübersicht → Suche → Trefferliste → Profil öffnen → Reiter „Übersicht".
   Nur Lesen: Dieser Ablauf verändert nichts.                                              */
const L = require('./lib.cjs');
const SEARCH = process.env.KLICK_SEARCH || '';   // Suchbegriff (Nachname der Kundin), aus .env

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);

  // ── i1 Kundenübersicht ohne Suche
  await L.goto(page, '/hub/clients', 3000);
  await L.shot(page, 'i1-kundenliste', { marks: [
    { id: 'suche', kind: 'badge', n: 1, sel: '.search-glattt', at: 'l' },
    { id: 'archiv', kind: 'badge', n: 2, sel: '.toggle-glattt-wrapper', at: 'l' },
    { id: 'tabelle', kind: 'frame', color: 'teal', sel: '.table-glattt' },
  ]});

  // ── i2 Suche + Trefferliste
  if (!SEARCH) { console.log('KLICK_SEARCH fehlt — Suchbegriff (Nachname) setzen, sonst bleibt i2 leer.'); }
  await page.fill('.search-glattt', SEARCH);
  await page.waitForTimeout(1500);                       // Eingabe ist um 500 ms verzögert
  await page.waitForFunction(() => !document.querySelector('.spinner-glattt'), null, { timeout: 20000 }).catch(() => {});
  await L.wait(page, 1500);
  const rowSel = 'tbody tr';
  await L.shot(page, 'i2-suche-treffer', { marks: [
    { id: 'suche', kind: 'frame', color: 'teal', sel: '.search-glattt-wrapper' },
    { id: 'treffer', kind: 'badge', n: 1, sel: '.site-second-line', at: 'r' },
    { id: 'nummer', kind: 'badge', n: 2, sel: rowSel + ' .badge-glattt', at: 'l' },
    { id: 'zeile', kind: 'chip', label: 'Hier tippen', sel: rowSel + ' td:nth-child(2)', at: 'r' },
  ]});

  // ── i3 Profil öffnen: Kopf und Reiter-Leiste
  await L.openClient(page, 3000);
  await L.shot(page, 'i3-profil-kopf', { marks: [
    { id: 'name', kind: 'badge', n: 1, sel: '.site-title', at: 'l' },
    { id: 'nummer', kind: 'badge', n: 2, sel: '.card-info-glattt-subtitle', at: 'l' },
    { id: 'reiter', kind: 'frame', color: 'teal', sel: '.tabs-glattt-sidebar' },
    { id: 'uebersicht', kind: 'chip', label: 'Hier starten', ...L.byText('.tab-glattt-sidebar', 'Übersicht'), at: 'r' },
  ]});

  // ── i4 Übersicht: die Karten und ihre „Alle ansehen"-Knöpfe
  await L.tab(page, 'Übersicht', 2500);
  await L.shot(page, 'i4-uebersicht-oben', { marks: [
    { id: 'kontakt', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Kontakt'), at: 'l' },
    { id: 'termine', kind: 'badge', n: 2, ...L.byText('.card-glattt-title', 'Termine'), at: 'l' },
    { id: 'alle', kind: 'chip', label: 'Öffnet den Reiter', sel: '.btn-glattt-tertiary', at: 'l' },
  ]});

  // Zweite Bildschirmhälfte der Übersicht (Vertrag/Forderungen, Behandlung, Dokumente)
  await L.scrollTo(page, '.client-overview-grid-glattt', 'end');
  await L.shot(page, 'i5-uebersicht-unten', { noScroll: true, marks: [
    { id: 'vertrag', kind: 'badge', n: 3, ...L.byText('.card-glattt-title', 'Vertrag'), at: 'l' },
    { id: 'forderungen', kind: 'frame', sel: '.client-overview-claims-row-glattt' },
  ]});

  await browser.close();
})();
