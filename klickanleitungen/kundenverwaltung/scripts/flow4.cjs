/* Dokument L — Vertrag, Zahlung & offene Forderungen
   Reiter „Vertrag/Zahlungen" und „Forderungsmanagement", dazu die eine Ausnahmeseite:
   der Zahlungsstand liegt NICHT im Kundenprofil, sondern im Vertragsdetail
   /hub/contracts/<id>, Reiter „Zahlungen" (KLICK_CONTRACT in der .env).
   Nur Lesen: keine Rate wird verbucht, kein Widerruf angelegt.                            */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openClient(page, 2500);

  // ── l1 Vertragskarte
  const hasTab = await L.tab(page, 'Vertrag/Zahlungen', 3500);
  if (!hasTab) console.log('Reiter „Vertrag/Zahlungen" fehlt — Recht view_contracts prüfen.');
  await L.shot(page, 'l1-vertrag', { marks: [
    { id: 'status', kind: 'badge', n: 1, sel: '.badge-glattt-dot', at: 'l' },
    { id: 'rate', kind: 'badge', n: 2, ...L.byText('.meta-grid-glattt-label', 'Monatsbetrag'), at: 'l' },
    { id: 'laufzeit', kind: 'badge', n: 3, ...L.byText('.meta-grid-glattt-label', 'Laufzeit'), at: 'l' },
    { id: 'karte', kind: 'frame', color: 'teal', sel: '.card-glattt-nested' },
  ]});

  // ── l2 Mandat und Zonen (untere Hälfte der Vertragskarte)
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.meta-grid-glattt-label')].find(e => e.textContent.trim().startsWith('SEPA-Mandat'));
    h?.scrollIntoView({ block: 'center' });
  });
  await L.wait(page, 600);
  await L.shot(page, 'l2-vertrag-mandat', { noScroll: true, marks: [
    { id: 'mandat', kind: 'badge', n: 1, ...L.byText('.meta-grid-glattt-label', 'SEPA-Mandat'), at: 'l' },
    { id: 'zumvertrag', kind: 'chip', label: 'Zum Vertrag', ...L.byText('.btn-glattt-tertiary', 'Vertrag anzeigen'), at: 'l' },
  ]});

  // ── l3 Forderungsmanagement
  const hasClaims = await L.tab(page, 'Forderungsmanagement', 3000);
  if (hasClaims) {
    const forbidden = await page.evaluate(() => document.body.textContent.includes('Kein Zugriff auf das Forderungsmanagement'));
    if (forbidden) console.log('!!! Forderungsmanagement: „Kein Zugriff" — dem Aufnahme-User fehlt view_receivables.');
    await L.shot(page, 'l3-forderungen', { marks: [
      { id: 'betrag', kind: 'badge', n: 1, ...L.byText('.stat-strip-glattt-label', 'Offener Betrag'), at: 'l' },
      { id: 'stufe', kind: 'badge', n: 2, ...L.byText('.stat-strip-glattt-label', 'Stufe'), at: 'l' },
      { id: 'frist', kind: 'badge', n: 3, ...L.byText('.stat-strip-glattt-label', 'Frist'), at: 'l' },
      { id: 'fall', kind: 'chip', label: 'Büro öffnet den Fall', ...L.byText('.btn-glattt-secondary', 'Zum Fall'), at: 'l' },
    ]});
  }

  // ── l4 Schulden auf einen Blick: Karte „Vertrag & Zahlungen" der Übersicht
  await L.tab(page, 'Übersicht', 2500);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('.client-overview-row-glattt-label')].find(e => e.textContent.trim().startsWith('Offene Forderungen'));
    el?.scrollIntoView({ block: 'center' });
  });
  await L.wait(page, 600);
  await L.shot(page, 'l4-uebersicht-forderungen', { noScroll: true, marks: [
    { id: 'offen', kind: 'chip', label: 'Hier steht es', ...L.byText('.client-overview-row-glattt-label', 'Offene Forderungen'), at: 'r' },
  ]});

  // ── l5 Ausnahmeseite: Zahlungsstand im Vertragsdetail
  if (L.CONTRACT) {
    await L.goto(page, '/hub/contracts/' + L.CONTRACT, 3500);
    await L.clickText(page, '.contract-v2-tab', 'Zahlungen', 2500);
    await L.shot(page, 'l5-vertrag-zahlungen', { marks: [
      { id: 'plan', kind: 'frame', color: 'teal', sel: '.table-glattt' },
      { id: 'bezahlt', kind: 'badge', n: 1, ...L.byText('.badge-glattt', 'Bezahlt'), at: 'l' },
      { id: 'offen', kind: 'badge', n: 2, ...L.byText('.badge-glattt', 'Offen'), at: 'l' },
    ]});
  } else {
    console.log('KLICK_CONTRACT fehlt — l5-vertrag-zahlungen wird nicht aufgenommen (Seite bleibt Platzhalter).');
  }

  await browser.close();
})();
