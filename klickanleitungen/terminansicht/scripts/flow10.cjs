/* Terminansicht 11 — Erlaubnis Minderjährige (v0–v6, Hub-Seite)

   Braucht einen **gebuchten Termin** (KLICK_MINOR_APT, Phorest-ID) einer Magdeburg-Testkundin, die in
   Phorest **noch kein Geburtsdatum** hat (für v0), und auf Staging das veröffentlichte Formular
   „Erlaubnis Minderjährige" mit „Nur bei minderjährigen Kundinnen" + Mitunterzeichner.

   Der Lauf **schreibt wirklich**: Er trägt der Testkundin das Geburtsdatum KLICK_MINOR_DOB in Phorest
   ein (Kundin wird 16), startet den Termin und reicht den Hauptteil der Erlaubnis ein — die zweite
   Person bekommt den Link an KLICK_PARENT_MAIL. Danach flow10b.cjs (Link der zweiten Person) und
   flow10c.cjs (Abschluss) laufen lassen.

   Aufruf:  node scripts/flow10.cjs            (alle Bilder v0–v6)
            node scripts/flow10.cjs v3-sorge-wahl v4-beide-anwesend                                   */
const C = require('./common.cjs'); const L = C.L;
const APT = process.env.KLICK_MINOR_APT || '';
const DOB = process.env.KLICK_MINOR_DOB || '';
const MAIL = process.env.KLICK_PARENT_MAIL || '';
const FORM = process.env.KLICK_MINOR_FORM || 'Erlaubnis Minderjährige';
const CLIENT = process.env.KLICK_MINOR_CLIENT || '';
if (!APT || !DOB || !MAIL || !CLIENT) { console.error('KLICK_MINOR_APT, KLICK_MINOR_CLIENT (Phorest-Client-ID), KLICK_MINOR_DOB (JJJJ-MM-TT) und KLICK_PARENT_MAIL setzen.'); process.exit(2); }

const S = () => Alpine.$data(document.querySelector('.apt-detail'));
const F = () => Alpine.$data(document.querySelector('[x-data^="formFill"]'));
const feld = (re) => `(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); return d.form.fields.find(f => ${re}); })()`;

(async () => {
  const nur = process.argv.slice(2);
  const will = (n) => !nur.length || nur.includes(n);
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);

  // ── v0 Termin ohne Geburtsdatum: „Geburtsdatum fehlt" (Kundenkarte, ohne Session)
  await L.goto(page, `/hub/appointment/${L.MD}/${APT}`, 1500);
  await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  await L.wait(page, 1500);
  const vorher = await page.evaluate(() => ({ dob: S().client?.birthDate, unknown: S().clientAgeUnknown, minor: S().clientIsMinor }));
  console.log('vorher:', JSON.stringify(vorher));
  if (will('v0-geburtsdatum-fehlt')) {
    if (!vorher.unknown) console.log('WARNUNG: Kundin hat schon ein Geburtsdatum — v0 zeigt kein „Geburtsdatum fehlt"');
    await L.shot(page, 'v0-geburtsdatum-fehlt', { noScroll: true, clip: await L.clipOf(page, '.apt-detail-client-card', 8), marks: [
      { id: 'fehlt', kind: 'badge', n: 3, sel: '.apt-detail-client-badges .badge-glattt-neutral', at: 'l' },
    ]});
  }

  // Geburtsdatum in Phorest nachtragen (wie es die Kundeninformation täte) → Kundin ist minderjährig
  // (Phorest verlangt clientId, version, Vor- und Nachname im Update — Kundin erst laden)
  const upd = await page.evaluate(async ([id, dob]) => {
    const h = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' };
    const cur = (await (await fetch('/phorest/client/' + id, { headers: h })).json()).data || {};
    const body = { clientId: cur.clientId || id, version: cur.version, firstName: cur.firstName, lastName: cur.lastName, birthDate: dob };
    const r = await fetch('/phorest/client/' + id, { method: 'PUT', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    return { status: r.status, ok: j.success, errors: j.errors || j.message };
  }, [CLIENT, DOB]);
  console.log('Geburtsdatum gesetzt:', JSON.stringify(upd));
  await L.goto(page, `/hub/appointment/${L.MD}/${APT}`, 1500);
  await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  await L.wait(page, 1500);
  const nachher = await page.evaluate(() => ({ age: S().clientAgeAtAppointment, minor: S().clientIsMinor, forms: S().displayedForms.map(f => f.name), required: S().missingRequiredForms.map(f => f.name) }));
  console.log('nachher:', JSON.stringify(nachher));
  if (!nachher.minor) { console.log('ABBRUCH: Kundin gilt nicht als minderjährig'); await browser.close(); process.exit(3); }

  // ── v1 Formularliste mit Abzeichen + Pflicht-Kachel (ohne Session, damit die Kundenkarte sichtbar bleibt)
  await page.evaluate(() => S().navigateTo('forms')); await L.wait(page, 1500);
  if (will('v1-kundin-minderjaehrig')) await L.shot(page, 'v1-kundin-minderjaehrig', { noScroll: true, marks: [
    { id: 'minor', kind: 'badge', n: 1, sel: '.apt-detail-client-badges .badge-glattt-warning', at: 'l' },
    { id: 'kachel', kind: 'badge', n: 2, fn: C.rectOfLabel, fnArg: FORM, at: 'l' },
  ]});

  // ── Session starten, Formular öffnen
  await C.ensureSession(page, APT);
  await C.openForm(page, FORM);
  if (will('v2-formular-oben')) await L.shot(page, 'v2-formular-oben', { noScroll: true, marks: [
    { id: 'abschnitt1', kind: 'badge', n: 1, fn: C.rectOfLabel, fnArg: '1. Angaben', at: 'l' },
  ]});

  // Erste Person: Verhältnis, Sorge gemeinsam → Wahl erscheint
  const namen = await page.evaluate(() => { const d = F(); const by = (re) => d.form.fields.filter(f => re.test(f.field_name)); return {
    verh: by(/^radio_1789766317814$/)[0]?.field_name, sorge: by(/^radio_1789766664276$/)[0]?.field_name,
    vor1: by(/^text_1789766500068$/)[0]?.field_name, nach1: by(/^text_1789766500970$/)[0]?.field_name, geb1: by(/^date_1789766591406$/)[0]?.field_name,
    mail1: by(/^email_1789766595307$/)[0]?.field_name, mail2: by(/^email_1789766595307_copy/)[0]?.field_name, phone2: by(/^phone_2nd_person$/)[0]?.field_name,
    sig1: by(/^signature_1789767695708$/)[0]?.field_name,
  }; });
  console.log('Felder:', JSON.stringify(namen));
  await page.evaluate((n) => { const d = F(); d.values[n.verh] = 'mutter'; d.values[n.sorge] = 'beiden_elternteilen_gemeinsam'; d.setCosignerChannel('whatsapp'); }, namen);
  await L.wait(page, 800);
  await C.scrollToSel(page, '[data-cosigner-choice]', 200);
  if (will('v3-sorge-wahl')) await L.shot(page, 'v3-sorge-wahl', { noScroll: true, marks: [
    { id: 'sorge', kind: 'badge', n: 3, fn: C.rectOfLabel, fnArg: 'Die elterliche Sorge', at: 'l' },
    { id: 'wahl', kind: 'badge', n: 4, sel: '[data-cosigner-choice] .segmented-control-glattt', at: 'l' },
    { id: 'kanal', kind: 'badge', n: 4, sel: '[data-cosigner-channel]', at: 'l', dy: 8 },
    { id: 'mail', kind: 'badge', n: 5, fn: C.rectOfLabel, fnArg: 'E-Mail-Adresse', at: 'l' },
  ]});
  // Versand wirklich per E-Mail (Staging: WhatsApp ohne Vorlage würde ausweichen)
  await page.evaluate(() => F().setCosignerChannel('email'));

  // ── v4 Beide anwesend: Block der zweiten Person + zwei Unterschriften
  await page.evaluate(() => F().setCosignerMode('now')); await L.wait(page, 800);
  await C.scrollTo(page, 'Information der 2.', 90);
  if (will('v4-beide-anwesend')) await L.shot(page, 'v4-beide-anwesend', { noScroll: true, marks: [
    { id: 'block', kind: 'badge', n: 1, fn: C.rectOfLabel, fnArg: 'Information der 2.', at: 'l' },
    { id: 'wahl', kind: 'chip', label: 'ist anwesend', sel: '[data-cosigner-choice] .segmented-control-glattt-option:first-child', at: 'l' },
  ]});
  // zurück auf „Link" und Hauptteil füllen
  await page.evaluate(() => F().setCosignerMode('link')); await L.wait(page, 500);
  await page.evaluate(([n, mail]) => { const d = F(); d.values[n.vor1] = 'Maria'; d.values[n.nach1] = 'Musterfrau'; d.values[n.geb1] = '1984-03-12'; d.values[n.mail1] = 'mutter@beispiel.de'; d.values[n.mail2] = mail; if (n.phone2) d.values[n.phone2] = '0151 23456789'; }, [namen, MAIL]);
  await L.wait(page, 500);
  await C.scrollToSel(page, 'canvas.signature-pad-canvas', 200);
  await C.sign(page);
  await L.wait(page, 500);

  // Nur Bilder bis hierher (z.B. v3 nachschärfen) — KLICK_NO_SUBMIT=1 reicht nichts ein
  if (process.env.KLICK_NO_SUBMIT === '1') { console.log('KLICK_NO_SUBMIT: Ende vor dem Absenden.'); await browser.close(); return; }

  // ── v5 Absenden → Meldung mit Link-Empfängerin
  const res = await C.submitForm(page, {});
  if (res === 'errors' || res === 'stuck') { console.log('ABSENDEN FEHLGESCHLAGEN'); await browser.close(); process.exit(3); }
  if (will('v5-eingereicht')) await L.shot(page, 'v5-eingereicht', { noScroll: true, marks: [
    { id: 'meldung', kind: 'badge', n: 2, sel: '.modal-glattt h3', at: 'l' },
  ]});

  // ── v6 Kachel „1 von 2 Unterschriften" + Modal „Link erneut senden"
  const st = await C.backToForms(page);
  console.log('Kacheln:', JSON.stringify(st.cards));
  await page.evaluate(() => S().loadSubmissions()); await L.wait(page, 2500);
  await page.evaluate((n) => { const s = S(); s.openCosignerModal(s.displayedForms.find(f => f.name === n)); }, FORM); await L.wait(page, 1200);
  if (will('v6-kachel-wartet')) await L.shot(page, 'v6-kachel-wartet', { noScroll: true, marks: [
    { id: 'kachel', kind: 'badge', n: 3, sel: '.session-forms-grid .session-card-required-badge', at: 'l' },
    { id: 'senden', kind: 'badge', n: 4, sel: '[data-cosigner-remind]', at: 'l' },
  ]});
  const subId = await page.evaluate((n) => { const s = S(); return s.pendingCosignerSubmission(s.displayedForms.find(f => f.name === n))?.id; }, FORM);
  console.log('Einreichung wartet, id', subId, '— Link der zweiten Person aus form_share_tokens (target_submission_id) holen und flow10b.cjs starten.');
  require('fs').writeFileSync('minor-submission.txt', String(subId || ''));
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
