/* Terminansicht 9 — Termin buchen (t1–t4)

   Der Lauf geht die Buchungsseite bis zur Bestätigung durch und **bucht standardmäßig nicht**:
   `t3-buchen` sucht Zeiten für die Testkundin, markiert eine und zeigt die Bestätigungsleiste
   (seit 06.10.2026 statt Browser-Dialog); „Buchen" in der Leiste wird nur markiert.

   Wer ein echtes Beispiel braucht, setzt `KLICK_BOOK=1` — dann wird gebucht. Das ist nur mit
   einer Magdeburg-Testkundin (MD000001–MD000004) erlaubt; der Termin landet im **echten**
   Phorest-Kalender und muss danach von Hand storniert werden.

   t5–t7 (seit 07.10.2026): das Seitenblatt „Termin buchen" der Terminübersicht — Neukunde mit
   Institutswahl („Alle Standorte"), Vorschläge mit Buchen-Knopf, Bestandskunde mit Terminart.
   Auch hier wird nie gebucht und kein Kunde angelegt (der Neukunde entsteht erst beim Buchen).

   Aufruf:  node scripts/flow7.cjs            (alle Bilder)
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

  // ── t5–t7 Seitenblatt „Termin buchen" in der Terminübersicht (07.10.2026)
  const P = () => Alpine.$data(document.querySelector('.booking-panel-glattt'));
  const openPanel = async () => {
    await page.evaluate(() => { try { localStorage.setItem('selectedBranch', ''); } catch (e) {} });
    await L.goto(page, '/hub/appointments', 3500);
    await page.evaluate(() => document.querySelector('.appointments-book-btn').click());
    await page.waitForFunction(() => { const el = document.querySelector('.booking-panel-glattt'); return el && Alpine.$data(el).branches.length > 0; }, null, { timeout: 20000 });
    await L.wait(page, 600);
  };
  const waitSlots = async () => {
    await page.waitForFunction(() => { const d = Alpine.$data(document.querySelector('.booking-panel-glattt')); return d.searchedOnce && !d.searching; }, null, { timeout: 60000 }).catch(() => {});
    await L.wait(page, 600);
  };
  const body = '.booking-panel-glattt .info-panel-body:not([style*="none"])';

  if (will('t5-panel-neukunde') || will('t6-panel-zeit')) {
    await openPanel();
    await page.evaluate((md) => {
      const d = Alpine.$data(document.querySelector('.booking-panel-glattt'));
      d.setClientMode('new');
      d.newClient.first_name = 'Test'; d.newClient.last_name = 'Neukundin'; d.newClient.mobile = '0151 23456789';
      d.selectBranch(md);
    }, L.MD);
    await waitSlots();
    // Dublettenhinweis für das Bild ausblenden — er zeigt sonst echte Kundennamen
    await page.evaluate(() => { Alpine.$data(document.querySelector('.booking-panel-glattt')).matches = []; });
    await L.wait(page, 300);
    if (will('t5-panel-neukunde')) {
      // Nur das Blatt: dahinter stünden echte Termine des Tages
      await L.shot(page, 't5-panel-neukunde', { noScroll: true, clip: await L.clipOf(page, '.booking-panel-glattt'), marks: [
        { id: 'art', kind: 'badge', n: 1, sel: '.booking-panel-glattt .segmented-control-glattt', at: 'l' },
        { id: 'name', kind: 'badge', n: 2, sel: '.booking-panel-glattt .booking-panel-glattt-row', at: 'l' },
        { id: 'institut', kind: 'badge', n: 3, fn: () => { const t = [...document.querySelectorAll('.booking-panel-glattt-title')].find(e => e.textContent.trim() === 'Institut'); const b = t?.parentElement.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
      ]});
    }
    if (will('t6-panel-zeit')) {
      await page.evaluate(() => { const d = Alpine.$data(document.querySelector('.booking-panel-glattt')); const s = d.days[0]?.slots[0]; if (s) d.pick(s); });
      await page.evaluate((sel) => { const b = document.querySelector(sel); const t = [...b.querySelectorAll('.booking-panel-glattt-title')].find(e => e.textContent.trim() === 'Terminart'); if (t) b.scrollTop += t.getBoundingClientRect().top - b.getBoundingClientRect().top - 12; }, body);
      await L.wait(page, 500);
      await L.shot(page, 't6-panel-zeit', { noScroll: true, clip: await L.clipOf(page, '.booking-panel-glattt'), marks: [
        { id: 'zeit', kind: 'frame', color: 'gold', sel: '.booking-panel-glattt .slot-pill.is-selected' },
        { id: 'zusammenfassung', kind: 'frame', color: 'teal', sel: '.booking-panel-glattt-summary' },
        { id: 'buchen', kind: 'chip', label: 'Erst jetzt buchen', sel: '.booking-panel-glattt-submit', at: 'l' },
      ]});
    }
  }

  if (will('t7-panel-bestandskunde')) {
    await openPanel();
    await page.evaluate(([md, id, name]) => {
      const d = Alpine.$data(document.querySelector('.booking-panel-glattt'));
      d.selectBranch(md);
      d.selectClient({ client_id: id, name, number: 'MD000004', mobile: null });
    }, [process.env.KLICK_FLEX_BRANCH || 'xcsxL7OJZie5KvhsWdSc8w', KUNDE_ID, KUNDE_NAME]);  // Bremen: Magdeburg hat keine FLEX-Leistungen
    await L.wait(page, 4000);
    // Behandlung zeigt Abo-Leistungen und darunter die FLEX-Einzelsitzungen (seit 07.10.2026)
    await page.evaluate((sel) => {
      const d = Alpine.$data(document.querySelector('.booking-panel-glattt'));
      d.setKind('treatment');
      const f = d.flexOptions[0]; if (f) d.togglePackageService(f.service_id);
    }, body);
    await L.wait(page, 1500);
    await page.evaluate((sel) => { const b = document.querySelector(sel); const t = [...b.querySelectorAll('.booking-panel-glattt-title')].find(e => e.textContent.trim() === 'Terminart'); if (t) b.scrollTop += t.getBoundingClientRect().top - b.getBoundingClientRect().top - 12; }, body);
    await L.wait(page, 500);
    await L.shot(page, 't7-panel-bestandskunde', { noScroll: true, clip: await L.clipOf(page, '.booking-panel-glattt'), marks: [
      { id: 'flex', kind: 'badge', n: 2, fn: () => { const t = [...document.querySelectorAll('.booking-panel-glattt-title')].find(e => e.textContent.trim().startsWith('FLEX')); const b = t?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
      { id: 'art', kind: 'badge', n: 1, fn: () => { const t = [...document.querySelectorAll('.booking-panel-glattt-title')].find(e => e.textContent.trim() === 'Terminart'); const b = t?.parentElement.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
    ]});
  }

  await browser.close();
})();
