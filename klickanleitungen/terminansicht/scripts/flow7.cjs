/* Terminansicht 9 — Termin buchen (t1–t4)

   Der Lauf geht die Buchungsseite bis zur Bestätigung durch und **bucht standardmäßig nicht**:
   `t3-buchen` sucht Zeiten für die Testkundin, markiert eine und zeigt die Bestätigungsleiste
   (seit 06.10.2026 statt Browser-Dialog); „Buchen" in der Leiste wird nur markiert.

   Wer ein echtes Beispiel braucht, setzt `KLICK_BOOK=1` — dann wird gebucht. Das ist nur mit
   einer Magdeburg-Testkundin (MD000001–MD000004) erlaubt; der Termin landet im **echten**
   Phorest-Kalender und muss danach von Hand storniert werden.

   Aufruf:  node scripts/flow7.cjs            (alle vier Bilder)
            node scripts/flow7.cjs t2-slots   (einzeln)                                        */
const L = require('./lib.cjs');
const KUNDE = process.env.KLICK_BOOK_CLIENT || 'MD000002';
const BUCHEN = process.env.KLICK_BOOK === '1';
// Phorest-ID und Name der Testkundin für t3 (MD000004 „Test Testererer" in Magdeburg)
const KUNDE_ID = process.env.KLICK_BOOK_CLIENT_ID || '3ruXMxdWALJrFvm-xOVg6w';
const KUNDE_NAME = process.env.KLICK_BOOK_CLIENT_NAME || 'Test Testererer';

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

  // ── t3 Buchen und bestätigen: Zeit markieren → Leiste mit Tag, Uhrzeit, Raum
  if (will('t3-buchen')) {
    await L.goto(page, `/hub/booking?branchId=${L.MD}&clientId=${KUNDE_ID}&clientName=${encodeURIComponent(KUNDE_NAME)}`, 3000);
    // Alle Paket-Leistungen der Kundin wählen, dann Zeiten suchen
    await page.evaluate(async () => {
      const w = Livewire.all().find(c => c.name === 'hub.booking.appointment-booking-form').$wire;
      await w.set('selectedServiceIds', (w.serviceOptions || []).map(o => o.service_id));
      await w.findSlots();
    });
    let n = 0;
    for (let i = 0; i < 60 && !n; i++) {
      await L.wait(page, 500);
      n = await page.evaluate(() => [...document.querySelectorAll('.day-schedule__slot')].filter(b => b.offsetParent).length);
    }
    if (!n) { console.log('KEINE SLOTS — t3 nicht aufgenommen'); }
    else {
      await page.evaluate(() => [...document.querySelectorAll('.day-schedule__slot')].filter(b => b.offsetParent)[1].click());
      await L.wait(page, 800);
      // Markierte Zeit mittig, die Leiste klebt am unteren Rand
      await page.evaluate(() => document.querySelector('.day-schedule__slot.is-selected').scrollIntoView({ block: 'center' }));
      await L.wait(page, 500);
      await L.shot(page, 't3-buchen', { noScroll: true, marks: [
        { id: 'zeit', kind: 'frame', color: 'gold', sel: '.day-schedule__slot.is-selected' },
        { id: 'leiste', kind: 'frame', color: 'teal', sel: '.slot-confirm-bar' },
        { id: 'buchen', kind: 'chip', label: 'Erst jetzt buchen', sel: '.slot-confirm-bar .btn-glattt-primary', at: 'l' },
      ]});
      if (BUCHEN) {
        await page.click('.slot-confirm-bar .btn-glattt-primary').catch(() => {});
        await L.wait(page, 6000);
        console.log('ACHTUNG: Termin wirklich gebucht — in Phorest wieder stornieren!');
      } else {
        console.log('Nicht gebucht (KLICK_BOOK ist nicht 1).');
      }
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
