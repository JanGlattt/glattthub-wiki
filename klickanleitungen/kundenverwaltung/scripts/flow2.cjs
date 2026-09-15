/* Dokument J — Kundendaten bearbeiten (Reiter „Kundeninfos")
   ACHTUNG: Der Ablauf öffnet das Bestätigungs-Modal, drückt aber NIE „In Phorest übernehmen".
   `saveClientInfo()` zeigt nur das Modal, erst `confirmSave()` schreibt nach Phorest — die
   aufgenommene Kundin bleibt dadurch unverändert. Die Änderung am Adresszusatz ist reine
   Anzeige und wird am Ende verworfen.                                                       */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openClient(page, 2500);
  await L.tab(page, 'Kundeninfos', 2500);

  // ── j1 Alles gesperrt: Schlösser an den Feldern, „Alle Felder entsperren" oben rechts
  await L.shot(page, 'j1-info-gesperrt', { marks: [
    { id: 'entsperren', kind: 'chip', label: 'Hier tippen', ...L.byText('.btn-glattt-primary', 'Alle Felder entsperren'), at: 'l' },
    { id: 'schloss', kind: 'badge', n: 1, sel: '.field-lock-glattt', at: 'r' },
    { id: 'notizen', kind: 'badge', n: 2, ...L.byText('.form-glattt-section-title', 'Notizen'), at: 'l' },
  ]});

  // Ein einzelnes Feld über sein Schloss entsperren (Halten) — zeigt den Zwischenzustand
  await page.evaluate(() => {
    const lock = [...document.querySelectorAll('.field-lock-glattt')].find(e => e.offsetParent !== null);
    if (!lock) return;
    lock.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  });
  await L.wait(page, 600);
  await L.shot(page, 'j2-schloss-halten', { marks: [
    { id: 'schloss', kind: 'chip', label: 'Gedrückt halten', sel: '.field-lock-glattt', at: 'r' },
  ]});
  await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));

  // ── j3 Alles entsperrt: Persönliche Daten und Kontakt
  await L.clickText(page, '.btn-glattt-primary', 'Alle Felder entsperren', 1200);
  await L.shot(page, 'j3-info-entsperrt', { marks: [
    { id: 'person', kind: 'badge', n: 1, ...L.byText('.form-glattt-section-title', 'Persönliche Daten'), at: 'l' },
    { id: 'kontakt', kind: 'badge', n: 2, ...L.byText('.form-glattt-section-title', 'Kontaktdaten'), at: 'l' },
    { id: 'speichern', kind: 'chip', label: 'Zum Schluss', ...L.byText('.btn-glattt-primary', 'Änderungen speichern'), at: 'l' },
  ]});

  // ── j4 Adresse
  await L.scrollTo(page, '.form-glattt-section-title:nth-of-type(1)', 'center');
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.form-glattt-section-title')].find(e => e.textContent.trim().startsWith('Adresse'));
    h?.scrollIntoView({ block: 'start' });
  });
  await L.wait(page, 600);
  await L.shot(page, 'j4-adresse', { noScroll: true, marks: [
    { id: 'adresse', kind: 'badge', n: 1, ...L.byText('.form-glattt-section-title', 'Adresse'), at: 'l' },
  ]});

  // ── j5 Marketing & Einwilligungen
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.form-glattt-section-title')].find(e => e.textContent.trim().startsWith('Marketing'));
    h?.scrollIntoView({ block: 'start' });
  });
  await L.wait(page, 600);
  await L.shot(page, 'j5-einwilligungen', { noScroll: true, marks: [
    { id: 'marketing', kind: 'badge', n: 1, ...L.byText('.form-glattt-section-title', 'Marketing'), at: 'l' },
    { id: 'schalter', kind: 'frame', sel: '.toggle-glattt-wrapper' },
  ]});

  // ── j6 Bestätigungs-Modal (ohne zu speichern!)
  await page.evaluate(() => {
    // Harmlose Anzeige-Änderung, damit das Modal etwas aufzählen kann
    const c = window.C();
    c.editableClient.address.streetAddress2 = (c.editableClient.address.streetAddress2 || '') + ' ';
  });
  await L.clickText(page, '.btn-glattt-primary', 'Änderungen speichern', 1500);
  const clip = await L.clipOf(page, '.modal-glattt', 40);
  await L.shot(page, 'j6-bestaetigen', { clip, noScroll: true, marks: [
    { id: 'liste', kind: 'frame', color: 'teal', sel: '.modal-glattt-section' },
    { id: 'uebernehmen', kind: 'chip', label: 'Hier tippen', ...L.byText('.modal-glattt-footer .btn-glattt-primary', 'In Phorest'), at: 'l' },
  ]});
  // Modal schliessen — es wird NICHT gespeichert
  await page.evaluate(() => { window.C().showConfirmModal = false; });
  console.log('Hinweis: nicht gespeichert — confirmSave() wurde bewusst nicht ausgelöst.');

  await browser.close();
})();
