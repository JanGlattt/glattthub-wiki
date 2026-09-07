/* Stufe 2: Formularliste → Kundeninformation öffnen → Formular teilen → ausfüllen → absenden */
const L = require('./lib.cjs');
const S = () => Alpine.$data(document.querySelector('.apt-detail'));
// Hilfsfunktion im Browser: Rechteck des Feld-Containers zu einem Label-Text
const rectOfLabel = (text) => { const els = [...document.querySelectorAll('label, h3, h2, h4, legend, .form-glattt-label, p, span, button')].filter(e => e.textContent.trim().startsWith(text) && e.offsetParent !== null); const el = els[0]; if (!el) return null; const box = el.closest('.form-glattt-group, .form-field-wrapper, .yes-no-glattt, .signature-pad-container, .form-glattt-section') || el; const b = box.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
const rectOf = (sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };

async function ensureSession(page) {
  await L.goto(page, `/hub/appointment/${L.MD}/${L.APT}`, 1500);
  await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  const active = await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).sessionActive);
  if (!active) { await page.click('button.apt-detail-action-btn--start'); await page.waitForFunction(() => Alpine.$data(document.querySelector('.apt-detail')).sessionActive === true, null, { timeout: 30000 }); await L.wait(page, 4500); }
}
async function openForm(page, name) {
  await page.evaluate(() => S().navigateTo('forms'));
  await L.wait(page, 1200);
  await page.evaluate((n) => { const f = S().displayedForms.find(f => f.name === n); return S().openSessionForm(f); }, name);
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="formFill"]'); return el && Alpine.$data(el)?.form?.fields?.length > 0; }, null, { timeout: 30000 });
  await L.wait(page, 1500);
}
const F = () => Alpine.$data(document.querySelector('[x-data^="formFill"]'));
async function scrollTo(page, text) { await page.evaluate((t) => { const el = [...document.querySelectorAll('h3,h2,h4,label,legend,.form-glattt-label,p')].find(e => e.textContent.trim().startsWith(t) && e.offsetParent !== null); if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 110; window.scrollTo(0, y); } }, text); await L.wait(page, 500); }

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await ensureSession(page);
  // ── C1 Formularliste
  await page.evaluate(() => S().navigateTo('forms')); await L.wait(page, 1500);
  const forms = await page.evaluate(() => [...document.querySelectorAll('.session-forms-grid .session-card')].map(c => ({ t: c.querySelector('.session-card-title')?.textContent.trim(), blocked: c.classList.contains('session-form-card--blocked'), reason: c.querySelector('.session-form-blocked-reason')?.textContent.trim(), badge: c.querySelector('.session-card-badge')?.textContent.trim(), sub: c.querySelector('.session-card-subtitle, p')?.textContent.trim() })));
  console.log('Formulare', JSON.stringify(forms));
  if (forms.length < 3) { console.log('Formulare fehlen noch (Deploy?)'); await browser.close(); process.exit(2); }
  await L.shot(page, 'c1-formulare-liste', { marks: forms.slice(0, 3).map((f, i) => ({ id: 'f' + i, kind: 'badge', n: i + 1, sel: `.session-forms-grid .session-card:nth-of-type(${i + 1})`, at: 'tl', dx: 1.5, dy: 1.5 })).concat([{ id: 'open', kind: 'chip', label: 'Hier tippen', sel: '.session-forms-grid .session-card:nth-of-type(1)', at: 'b' }]) });
  // ── D1 Kundeninformation öffnen
  await openForm(page, 'Kundeninformation & Einverständniserklärung');
  const vals = await page.evaluate(() => { const d = F(); const out = {}; for (const f of d.form.fields) if (['text','email','gender','date'].includes(f.type)) out[f.label] = d.values[f.field_name]; return out; });
  console.log('Prefill', JSON.stringify(vals));
  await L.shot(page, 'd1-kundeninfo-oben', { marks: [
    { id: 'share', kind: 'badge', n: 1, sel: 'button[title="Formular teilen"]', at: 'l' },
    { id: 'back', kind: 'badge', n: 2, fn: (t) => { const b = [...document.querySelectorAll('button, a')].find(e => e.textContent.trim() === t); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, fnArg: 'Zur Terminansicht', at: 'r' },
    { id: 'kontakt', kind: 'frame', fn: rectOfLabel, fnArg: 'Kontaktdetails' },
  ]});
  // ── E1 Formular teilen
  await page.click('button[title="Formular teilen"]');
  await page.waitForFunction(() => F().showShareModal === true); await L.wait(page, 800);
  const modalClip = await L.clipOf(page, '.modal-glattt:not([style*="display: none"]) .modal-glattt-content, .modal-glattt-content', 12);
  console.log('share modal clip', JSON.stringify(modalClip));
  await L.shot(page, 'e1-teilen-modal', { noScroll: true, marks: [
    { id: 'name', kind: 'badge', n: 1, sel: '#shareRecipientName', at: 'l' },
    { id: 'email', kind: 'badge', n: 2, sel: '#shareRecipientEmail', at: 'l' },
    { id: 'perm', kind: 'badge', n: 3, sel: '.share-field-permissions-toggle', at: 'l' },
    { id: 'create', kind: 'chip', label: 'Hier tippen', fn: (t) => { const b = [...document.querySelectorAll('.modal-glattt-footer button')].find(e => e.textContent.trim().startsWith(t) && e.offsetParent !== null); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, fnArg: 'Link erstellen', at: 'l' },
  ]});
  await page.evaluate(() => { F().shareRecipientName = 'Tester Am Testen'; });
  await page.evaluate(() => F().createShareLink());
  const shareOk = await page.waitForFunction(() => F().shareResult && F().shareResult.share_url, null, { timeout: 15000 }).then(() => true).catch(() => false); await L.wait(page, 600);
  console.log('share', shareOk ? await page.evaluate(() => F().shareResult.share_url) : 'FEHLGESCHLAGEN (Recht?)');
  if (shareOk) await L.shot(page, 'e2-teilen-link', { noScroll: true, marks: [
    { id: 'url', kind: 'frame', fn: () => { const i = [...document.querySelectorAll('.modal-glattt input[readonly]')].find(e => e.offsetParent !== null && e.value.includes('/shared/form/')); const r = i?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; } },
    { id: 'copy', kind: 'chip', label: 'Kopieren', fn: (t) => { const b = [...document.querySelectorAll('.modal-glattt button')].find(e => e.textContent.trim() === t && e.offsetParent !== null); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, fnArg: 'Kopieren', at: 'b' },
  ]});
  await page.evaluate(() => F().closeShareModal()); await L.wait(page, 500);
  // Adresse ergänzen (Testkunde hat in Phorest keine Adresse) → löst später den Phorest-Abgleich aus
  await page.evaluate(() => { const d = F(); if (!d.values['text_1787663605012']) { d.values['text_1787663605012'] = 'Musterstraße 12'; d.values['text_1787663607304'] = '39104'; d.values['text_1787663608070'] = 'Magdeburg'; } });
  // ── D2 Ausfüllen: Ja/Nein-Block (Frage 1 = Ja mit Zusatz, Rest Nein), Hauptgründe, Unterschrift
  await page.evaluate(() => { const d = F(); if (!d.values['gender_1788789142944']) d.values['gender_1788789142944'] = 'FEMALE'; });
  await L.wait(page, 300);
  await page.evaluate(() => { const d = F(); let first = true; for (const f of d.form.fields) { if (f.type !== 'yes_no') continue; if (!d.isFieldVisibleInLayout(f)) continue; d.values[f.field_name] = first ? { answer: 'yes', details: 'Neurodermitis (leicht)' } : { answer: 'no', details: '' }; first = false; } });
  await L.wait(page, 400);
  // erneut über alle (bedingte Felder erscheinen nach Antwort 1)
  await page.evaluate(() => { const d = F(); for (const f of d.form.fields) { if (f.type !== 'yes_no' || !d.isFieldVisibleInLayout(f)) continue; if (!d.values[f.field_name] || !d.values[f.field_name].answer) d.values[f.field_name] = { answer: 'no', details: '' }; } });
  await scrollTo(page, 'Medizinische Vorgeschichte');
  await L.shot(page, 'd2-kundeninfo-medizin', { noScroll: true, marks: [
    { id: 'q1', kind: 'badge', n: 1, sel: '.yes-no-glattt-options', at: 'l' },
    { id: 'details', kind: 'badge', n: 2, sel: '.yes-no-glattt-details', at: 'l' },
  ]});
  await page.evaluate(() => { const d = F(); const f = d.form.fields.find(x => x.field_name === 'checkbox_1788789359101'); d.values[f.field_name] = [f.options[0].value]; d.values['textarea_1788789071125'] = ''; });
  await scrollTo(page, 'Behandlungsinformationen');
  await L.shot(page, 'd3-kundeninfo-behandlung', { noScroll: true, marks: [ { id: 'gruende', kind: 'badge', n: 3, fn: rectOfLabel, fnArg: 'Was sind die Hauptgründe', at: 'l' } ]});
  await scrollTo(page, 'Dürfen wir in Kontakt bleiben');
  await L.shot(page, 'd4-kundeninfo-kontakt', { noScroll: true, marks: [ { id: 'news', kind: 'badge', n: 4, fn: rectOfLabel, fnArg: 'Neueste Angebote', at: 'l' }, { id: 'remind', kind: 'badge', n: 5, fn: rectOfLabel, fnArg: 'Terminerinnerungen', at: 'l' } ]});
  // Unterschrift
  await page.evaluate(() => { const pad = Alpine.$data(document.querySelector('.signature-pad-container')); pad.strokes = [{ points: [{x:30,y:70},{x:60,y:30},{x:90,y:75},{x:120,y:35},{x:160,y:70},{x:200,y:40},{x:260,y:60},{x:330,y:45}] }, { points: [{x:340,y:40},{x:380,y:70},{x:420,y:35},{x:470,y:65}] }]; pad.redrawFromStrokes(); pad.saveSignature(); });
  await L.wait(page, 400);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button[type=submit]')].find(e => e.offsetParent !== null); b.scrollIntoView({ block: 'end' }); window.scrollBy(0, 40); }); await L.wait(page, 500);
  await L.shot(page, 'd5-kundeninfo-unterschrift', { noScroll: true, marks: [
    { id: 'sig', kind: 'badge', n: 6, sel: 'canvas.signature-pad-canvas', at: 'tl', dx: 1, dy: 1 },
    { id: 'submit', kind: 'chip', label: 'Hier tippen', sel: 'form button[type=submit].btn-glattt-primary', at: 'l' },
  ]});
  // ── D6 Absenden
  const missing = await page.evaluate(() => { const d = F(); const ok = d.validate ? d.validate() : true; return { ok, errors: d.errors }; });
  console.log('validate', JSON.stringify(missing).slice(0, 400));
  await page.click('form button[type=submit].btn-glattt-primary');
  await page.waitForFunction(() => { const d = F(); return d.showPhorestChangesModal === true || (d.showSubmissionModal === true && d.submissionStatus); }, null, { timeout: 60000 });
  const ph = await page.evaluate(() => F().showPhorestChangesModal);
  if (ph) {
    await L.wait(page, 600);
    await L.shot(page, 'd6-phorest-aenderungen', { noScroll: true, marks: [ { id: 'ok', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer button.btn-glattt-primary', at: 'l' } ]});
    await page.evaluate(() => F().submitWithPhorestUpdate());
    await page.waitForFunction(() => F().showSubmissionModal === true && F().submissionStatus, null, { timeout: 60000 });
  }
  await page.waitForFunction(() => F().pdfReady === true || F().submissionStatus === 'error', null, { timeout: 60000 }).catch(() => {});
  await L.wait(page, 800);
  console.log('submission', await page.evaluate(() => ({ st: F().submissionStatus, id: F().lastSubmissionId, pdf: F().pdfReady })));
  await L.shot(page, 'd7-kundeninfo-erfolg', { noScroll: true, marks: [
    { id: 'pdf', kind: 'badge', n: 1, sel: 'a.btn-glattt-secondary[download]', at: 'l' },
    { id: 'mail', kind: 'badge', n: 2, sel: '.modal-glattt input[type=email]', at: 'l' },
    { id: 'back', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer button.btn-glattt-primary', at: 'l' },
  ]});
  await page.evaluate(() => F().closeEmbeddedForm());
  await L.wait(page, 1500);
  await page.evaluate(() => S().navigateTo('forms')); await L.wait(page, 1200);
  const forms2 = await page.evaluate(() => [...document.querySelectorAll('.session-forms-grid .session-card')].map(c => ({ t: c.querySelector('.session-card-title')?.textContent.trim(), blocked: c.classList.contains('session-form-card--blocked'), done: c.classList.contains('session-card-success') })));
  console.log('Formulare danach', JSON.stringify(forms2));
  await L.shot(page, 'c2-formulare-nach-kundeninfo', { marks: [ { id: 'done', kind: 'badge', n: 1, sel: '.session-forms-grid .session-card:nth-of-type(1) .session-card-badge', at: 'l' }, { id: 'next', kind: 'chip', label: 'Weiter hier', sel: '.session-forms-grid .session-card:nth-of-type(2)', at: 'b' } ]});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
