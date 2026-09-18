/* Terminansicht 10 — Sitzungsbestätigung, das Pflichtformular vor der Behandlung (u1–u6)

   Braucht einen **gebuchten Behandlungstermin** einer Magdeburg-Testkundin (KLICK_TREAT = Phorest-
   Termin-ID) und auf Staging das veröffentlichte Formular „Sitzungsbestätigung" mit
   „Pflicht vor Behandlung · bei jedem Termin neu", zugeordnet zu den gebuchten Services.

   Der Lauf **startet den Termin und reicht das Formular wirklich ein** (Staging, Testkundin) —
   wie die anderen Stufen der Terminansicht. Der Termin wird NICHT beendet.

   Aufruf:  node scripts/flow8.cjs            (alle sechs Bilder)
            node scripts/flow8.cjs u3-formular-oben u4-formular-unten                              */
const C = require('./common.cjs'); const L = C.L;
const TREAT = process.env.KLICK_TREAT || '';
const FORM = process.env.KLICK_PFLICHTFORMULAR || 'Sitzungsbestätigung';
if (!TREAT) { console.error('KLICK_TREAT fehlt — Phorest-ID des gebuchten Behandlungstermins setzen.'); process.exit(2); }

(async () => {
  const nur = process.argv.slice(2);
  const will = (n) => !nur.length || nur.includes(n);
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await C.ensureSession(page, TREAT);
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('session')); await L.wait(page, 1500);
  const st = await page.evaluate(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); return { locked: s.treatmentLocked, missing: s.missingRequiredForms.map(f => f.name), forms: s.displayedForms.map(f => f.name) }; });
  console.log('Session:', JSON.stringify(st));
  if (!st.locked) console.log('WARNUNG: Einstellungszettel nicht gesperrt — Pflichtformular fehlt oder ist schon eingereicht');

  // ── u1 Session-Ansicht mit Sperre
  if (will('u1-session-gesperrt')) await L.shot(page, 'u1-session-gesperrt', { noScroll: true, marks: [
    { id: 'offen', kind: 'badge', n: 1, sel: '.unified-session-grid .session-card-required-badge', at: 'l' },
    { id: 'schloss', kind: 'badge', n: 2, sel: '.session-card-lock', at: 'l' },
    { id: 'formulare', kind: 'badge', n: 3, fn: C.rectOfLabel, fnArg: 'Formulare', at: 'l' },
  ]});

  // ── u2 Formularliste mit „Pflicht"
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('forms')); await L.wait(page, 1500);
  if (will('u2-formulare-pflicht')) await L.shot(page, 'u2-formulare-pflicht', { noScroll: true, marks: [
    { id: 'pflicht', kind: 'badge', n: 1, sel: '.session-forms-grid .session-card-required-badge', at: 'l' },
    { id: 'kachel', kind: 'badge', n: 2, fn: C.rectOfLabel, fnArg: FORM, at: 'l' },
  ]});

  // ── u3 Formular oben (Kundendetails, Einwilligungen)
  await C.openForm(page, FORM);
  if (will('u3-formular-oben')) await L.shot(page, 'u3-formular-oben', { noScroll: true, marks: [
    { id: 'details', kind: 'badge', n: 1, fn: C.rectOfLabel, fnArg: 'Kundendetails', at: 'l' },
    { id: 'einwilligung', kind: 'badge', n: 2, fn: C.rectOfLabel, fnArg: 'Einwilligung Terminerinnerung', at: 'l' },
    { id: 'adresse', kind: 'badge', n: 3, fn: C.rectOfLabel, fnArg: 'Ist ', at: 'l' },
  ]});

  // Pflichtfelder füllen (über die Formular-Daten, wie in flow2/flow3): Adresse aktuell → Ja,
  // Einwilligung, Ort, Datum, Unterschrift — die AGB bestätigt submitForm() im Rechtsdokument-Fenster
  await page.evaluate(() => {
    const d = Alpine.$data(document.querySelector('[x-data^="formFill"]'));
    for (const f of d.form.fields) {
      if (f.type === 'yes_no') d.values[f.field_name] = { answer: 'yes', details: '' };
      if (f.type === 'consent' || f.type === 'legal_document') d.values[f.field_name] = true;
      if (f.type === 'text' && /^Ort$/.test(f.label || '')) d.values[f.field_name] = 'Magdeburg';
      if (f.type === 'date' && !d.values[f.field_name]) d.values[f.field_name] = new Date().toISOString().slice(0, 10);
    }
  });
  await L.wait(page, 800);
  await C.sign(page);
  await L.wait(page, 500);

  // ── u4 Formular unten (AGB, Einwilligung, Unterschrift, Absenden)
  await C.scrollToSel(page, '.consent-glattt', 110);
  if (will('u4-formular-unten')) await L.shot(page, 'u4-formular-unten', { noScroll: true, marks: [
    { id: 'einwilligung', kind: 'badge', n: 1, sel: '.consent-glattt', at: 'l' },
    { id: 'agb', kind: 'badge', n: 2, sel: '.legal-document-glattt-title', at: 'l' },
    { id: 'unterschrift', kind: 'badge', n: 3, sel: 'canvas.signature-pad-canvas', at: 'tl', dx: 1, dy: 1 },
    { id: 'absenden', kind: 'badge', n: 4, sel: 'form button[type=submit].btn-glattt-primary', at: 'r' },
  ]});

  // ── u5 Absenden (Rechtsdokument-Modal und Phorest-Abgleich werden bestätigt)
  const res = await C.submitForm(page, {});
  if (res === 'errors' || res === 'stuck') { console.log('ABSENDEN FEHLGESCHLAGEN — u5/u6 fehlen'); await browser.close(); process.exit(3); }
  if (will('u5-eingereicht')) await L.shot(page, 'u5-eingereicht', { noScroll: true, marks: [
    { id: 'ok', kind: 'badge', n: 1, sel: '.modal-glattt .modal-glattt-header-title, .modal-glattt h3', at: 'l' },
  ]});

  // ── u6 Session danach: Haken, kein Schloss
  await C.backToForms(page);
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('session')); await L.wait(page, 1500);
  const nach = await page.evaluate(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); return { locked: s.treatmentLocked, allDone: s.allFormsDone }; });
  console.log('Danach:', JSON.stringify(nach));
  if (will('u6-session-frei')) await L.shot(page, 'u6-session-frei', { noScroll: true, marks: [
    { id: 'haken', kind: 'badge', n: 2, sel: '.unified-session-grid .session-card-badge', at: 'l' },
    { id: 'zettel', kind: 'badge', n: 3, fn: C.rectOfLabel, fnArg: 'Einstellungszettel', at: 'l' },
  ]});
  console.log('Hinweis: Termin läuft weiter (nicht beendet) — für Terminansicht 8 nutzbar.');
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
