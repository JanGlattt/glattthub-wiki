/* Terminansicht 9 — Termin buchen (t1–t4)

   Der Lauf geht die Buchungsseite bis zur Bestätigung durch und **bucht standardmäßig nicht**:
   `t3-buchen` zeigt die ausgefüllte Zusammenfassung, der Knopf wird nur markiert.

   Wer ein echtes Beispiel braucht, setzt `KLICK_BOOK=1` — dann wird gebucht. Das ist nur mit
   einer Magdeburg-Testkundin (MD000001–MD000004) erlaubt; der Termin landet im **echten**
   Phorest-Kalender und muss danach von Hand storniert werden.

   Aufruf:  node scripts/flow7.cjs            (alle vier Bilder)
            node scripts/flow7.cjs t2-slots   (einzeln)                                        */
const L = require('./lib.cjs');
const KUNDE = process.env.KLICK_BOOK_CLIENT || 'MD000002';
const BUCHEN = process.env.KLICK_BOOK === '1';

(async () => {
  const nur = process.argv.slice(2);
  const will = (n) => !nur.length || nur.includes(n);
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/booking', 3000);

  // ── t1 Kundin und Institut
  if (will('t1-buchung-kunde')) {
    await page.fill('input[type="search"], input[placeholder*="Kund"]', KUNDE).catch(() => {});
    await L.wait(page, 2500);
    await L.shot(page, 't1-buchung-kunde', { marks: [
      { id: 'suche', kind: 'chip', label: 'Kundin suchen', sel: 'input[type="search"], input[placeholder*="Kund"]', at: 'r' },
      { id: 'treffer', kind: 'frame', color: 'teal', sel: '.search-results, .card-glattt' },
    ]});
  }

  // ── t2 Zeit finden
  if (will('t2-slots')) {
    await L.wait(page, 1500);
    await L.shot(page, 't2-slots', { marks: [
      { id: 'tag', kind: 'badge', n: 1, sel: '.flatpickr-calendar, input.input-glattt', at: 'l' },
      { id: 'slots', kind: 'frame', color: 'gold', sel: '.slot-grid, .btn-glattt-secondary' },
    ]});
  }

  // ── t3 Buchen und bestätigen
  if (will('t3-buchen')) {
    await L.wait(page, 1200);
    await L.shot(page, 't3-buchen', { marks: [
      { id: 'zusammenfassung', kind: 'frame', color: 'teal', sel: '.booking-summary, .card-glattt' },
      { id: 'buchen', kind: 'chip', label: 'Erst jetzt buchen', sel: 'button.btn-glattt-primary', at: 'l' },
    ]});
    if (BUCHEN) {
      await page.click('button.btn-glattt-primary').catch(() => {});
      await L.wait(page, 4000);
      console.log('ACHTUNG: Termin wirklich gebucht — in Phorest wieder stornieren!');
    } else {
      console.log('Nicht gebucht (KLICK_BOOK ist nicht 1).');
    }
  }

  // ── t4 Link zur Selbstbuchung
  if (will('t4-buchungslink')) {
    await L.goto(page, '/hub/booking', 2500);
    await L.shot(page, 't4-buchungslink', { marks: [
      { id: 'link', kind: 'chip', label: 'Link kopieren', sel: 'button', at: 'l' },
    ]});
  }

  await browser.close();
})();
