/* Verkauf 3 — Zahlungen & SEPA
   WICHTIG: Kein Einzug, kein Nachtragen, kein Pausieren. Die Fenster werden geöffnet und
   sofort verworfen; ein ausgelöster Einzug wäre bei der Kundin sichtbar und nicht folgenlos. */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openContract(page);
  await L.tab(page, 'Zahlungen', 3500);

  await L.shot(page, 'v9-ratenplan', { marks: [
    { id: 'faellig', kind: 'badge', n: 1, ...L.byText('th', 'Fällig'), at: 't' },
    { id: 'summen', kind: 'badge', n: 3, ...L.byText('*', 'Bereits bezahlt'), at: 'l' },
    { id: 'tabelle', kind: 'frame', color: 'teal', sel: '.table-glattt' },
  ]});

  // Fenster „Gezahlte Rate nachtragen" nur öffnen
  const opened = await L.clickText(page, 'button', 'Nachtragen', 1500)
    || await L.clickText(page, 'button', 'Gezahlte Rate', 1500);
  if (opened) {
    const clip = await L.clipOf(page, '.modal-glattt', 30);
    await L.shot(page, 'v10-rate-nachtragen', { clip, noScroll: true, marks: [
      { id: 'betrag', kind: 'badge', n: 2, ...L.byText('.modal-glattt label', 'Eingegangener Betrag'), at: 'l' },
      { id: 'kommentar', kind: 'badge', n: 3, ...L.byText('.modal-glattt label', 'Kommentar'), at: 'l' },
    ]});
    await L.clickText(page, '.modal-glattt-footer .btn-glattt-secondary', 'Abbrechen', 1000)
      || await page.keyboard.press('Escape');
    console.log('Hinweis: Fenster verworfen — nichts nachgetragen.');
  } else { console.log('Knopf „Nachtragen" nicht gefunden — v10 fehlt.'); }

  // SEPA-Bereich
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /SEPA|Mandat/.test(e.textContent));
    h?.scrollIntoView({ block: 'center' });
  });
  await L.wait(page, 800);
  await L.shot(page, 'v11-sepa', { noScroll: true, marks: [
    { id: 'mandat', kind: 'badge', n: 1, ...L.byText('*', 'Mandats-PDF'), at: 'l' },
    { id: 'einziehen', kind: 'chip', label: 'Löst eine Abbuchung aus', ...L.byText('button', 'Betrag per SEPA einziehen'), at: 'l' },
    { id: 'rls', kind: 'badge', n: 3, ...L.byText('button', 'RLS anhängen'), at: 'l' },
    { id: 'abgleich', kind: 'badge', n: 4, ...L.byText('button', 'Mit GoCardless abgleichen'), at: 'l' },
  ]});
  console.log('Hinweis: kein Einzug ausgelöst.');

  await browser.close();
})();
