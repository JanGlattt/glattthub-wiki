/* Verkauf 4 — Widerrufe
   WICHTIG: Der Assistent wird geöffnet und verworfen — es wird KEIN Widerruf angelegt und
   kein Fall abgeschlossen. Ein angelegter Widerruf zieht Bonus- und SEPA-Folgen nach sich. */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/cancellations', 3500);

  // Assistent Schritt 1 und 2
  await L.clickText(page, '.btn-glattt-primary', 'Neuer Widerruf', 1800);
  const modal = async () => L.clipOf(page, '.modal-glattt', 30);
  await L.shot(page, 'v12-widerruf-vertrag', { clip: await modal(), noScroll: true, marks: [
    { id: 'suche', kind: 'badge', n: 1, sel: '.modal-glattt input', at: 'l' },
    { id: 'warnung', kind: 'chip', label: 'Schon vorhanden?', ...L.byText('.modal-glattt *', 'Bereits widerrufen'), at: 'l' },
  ]});
  await L.clickText(page, '.modal-glattt-footer .btn-glattt-primary', 'Weiter', 1500);
  await L.shot(page, 'v13-widerruf-grund', { clip: await modal(), noScroll: true, marks: [
    { id: 'datum', kind: 'badge', n: 3, ...L.byText('.modal-glattt label', 'Datum Widerruf'), at: 'l' },
    { id: 'grund', kind: 'badge', n: 4, ...L.byText('.modal-glattt label', 'Grund'), at: 'l' },
  ]});
  await L.clickText(page, '.modal-glattt-footer .btn-glattt-secondary', 'Abbrechen', 1200)
    || await page.keyboard.press('Escape');
  console.log('Hinweis: Assistent verworfen — kein Widerruf angelegt.');

  // Fallseite eines bestehenden Widerrufs
  if (L.CANCELLATION) {
    await L.goto(page, '/hub/cancellations/' + L.CANCELLATION, 3500);
    await L.shot(page, 'v14-fall', { marks: [
      { id: 'infos', kind: 'badge', n: 1, ...L.byText('*', 'Fall-Informationen'), at: 'l' },
      { id: 'stand', kind: 'badge', n: 2, ...L.byText('*', 'Behandlungsstand'), at: 'l' },
      { id: 'verknuepfungen', kind: 'badge', n: 3, ...L.byText('*', 'Verknüpfungen'), at: 'l' },
      { id: 'verlauf', kind: 'badge', n: 4, ...L.byText('*', 'Verlauf'), at: 'l' },
    ]});
    await L.scrollTo(page, '.card-glattt-footer, .btn-glattt-danger', 'center');
    await L.shot(page, 'v15-abschliessen', { noScroll: true, marks: [
      { id: 'ra', kind: 'badge', n: 2, ...L.byText('button', 'An Rechtsanwalt'), at: 'l' },
      { id: 'abschluss', kind: 'chip', label: 'Erst ganz zum Schluss', ...L.byText('button', 'Abschließen'), at: 'l' },
    ]});
    console.log('Hinweis: Fall nicht abgeschlossen.');
  } else {
    console.log('KLICK_CANCELLATION fehlt — v14/v15 fehlen (offenen Widerruf angeben).');
  }

  await browser.close();
})();
