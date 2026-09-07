const L = require('./lib.cjs');
const S = () => Alpine.$data(document.querySelector('.apt-detail'));
async function ensureSession(page, apt = L.APT) {
  await L.goto(page, `/hub/appointment/${L.MD}/${apt}`, 1500);
  await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  const canStart = await page.evaluate(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); return !s.sessionActive && s.canStartAppointment; });
  if (!canStart) { console.log('Session nicht startbar (Status ' + await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).appointment?.state) + ') — arbeite ohne Session weiter'); return; }
  if (!(await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).sessionActive))) { await page.click('button.apt-detail-action-btn--start'); await page.waitForFunction(() => Alpine.$data(document.querySelector('.apt-detail')).sessionActive === true, null, { timeout: 30000 }); await L.wait(page, 4500); }
}
async function openForm(page, name) {
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('forms')); await L.wait(page, 1200);
  await page.evaluate((n) => { const s = Alpine.$data(document.querySelector('.apt-detail')); return s.openSessionForm(s.displayedForms.find(f => f.name === n)); }, name);
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="formFill"]'); return el && Alpine.$data(el)?.form?.fields?.length > 0; }, null, { timeout: 30000 });
  await L.wait(page, 1500);
}
// Scroll-Container der Detailseite ist .apt-detail-panel (nicht window)
async function scrollTo(page, text, off = 110) { await page.evaluate(([t, o]) => { const el = [...document.querySelectorAll('h3,h2,h4,label,legend,.form-glattt-label,p,span')].find(e => e.textContent.trim().startsWith(t) && e.offsetParent !== null); const panel = el ? el.closest('.apt-detail-panel') : null; if (el && panel) { panel.scrollTop += el.getBoundingClientRect().top - panel.getBoundingClientRect().top - o; } }, [text, off]); await L.wait(page, 500); }
async function scrollToSel(page, sel, off = 90) { await page.evaluate(([s, o]) => { const el = [...document.querySelectorAll(s)].find(e => e.offsetParent !== null); const panel = el ? el.closest('.apt-detail-panel') : null; if (el && panel) { panel.scrollTop += el.getBoundingClientRect().top - panel.getBoundingClientRect().top - o; } }, [sel, off]); await L.wait(page, 500); }
async function sign(page) { await page.evaluate(() => { const pad = Alpine.$data([...document.querySelectorAll('.signature-pad-container')].find(e => e.offsetParent !== null)); pad.strokes = [{ points: [{x:30,y:70},{x:60,y:30},{x:90,y:75},{x:120,y:35},{x:160,y:70},{x:200,y:40},{x:260,y:60},{x:330,y:45}] }, { points: [{x:340,y:40},{x:380,y:70},{x:420,y:35},{x:470,y:65}] }]; pad.redrawFromStrokes(); pad.saveSignature(); }); await L.wait(page, 400); }
async function scrollToSubmit(page) { await page.evaluate(() => { const b = [...document.querySelectorAll('button[type=submit]')].find(e => e.offsetParent !== null); b.scrollIntoView({ block: 'end' }); window.scrollBy(0, 40); }); await L.wait(page, 500); }
// Absenden inkl. Rechtsdokument- und Phorest-Modal; liefert Status
async function submitForm(page, shots = {}) {
  const F = () => Alpine.$data(document.querySelector('[x-data^="formFill"]'));
  await page.click('form button[type=submit].btn-glattt-primary');
  await page.waitForFunction(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); return !!d.activeLegalModal || d.showPhorestChangesModal || (d.showSubmissionModal && d.submissionStatus) || Object.keys(d.errors || {}).length > 0; }, null, { timeout: 30000 });
  const errs = await page.evaluate(() => Alpine.$data(document.querySelector('[x-data^="formFill"]')).errors);
  if (errs && Object.keys(errs).length) { console.log('VALIDIERUNGSFEHLER', JSON.stringify(errs)); return 'errors'; }
  while (await page.evaluate(() => !!Alpine.$data(document.querySelector('[x-data^="formFill"]')).activeLegalModal)) {
    if (shots.legal) { await L.wait(page, 800); await L.shot(page, shots.legal, { noScroll: true, marks: [ { id: 'scroll', kind: 'badge', n: 1, sel: '.legal-document-glattt-modal-body', at: 'r', dx: -2 }, { id: 'check', kind: 'badge', n: 2, sel: '.legal-document-glattt-confirm-modal', at: 'l' }, { id: 'ok', kind: 'chip', label: 'Hier tippen', sel: '.legal-document-glattt-modal-actions .btn-glattt-primary', at: 'l' } ]}); shots.legal = null; }
    await page.evaluate(() => { const b = document.querySelector('.legal-document-glattt-modal-body'); if (b) { b.scrollTop = b.scrollHeight; b.dispatchEvent(new Event('scroll')); } }); await L.wait(page, 300);
    await page.evaluate(() => { const c = document.querySelector('.legal-document-glattt-confirm-modal input[type=checkbox]'); if (c && !c.checked) c.click(); }); await L.wait(page, 200);
    await page.click('.legal-document-glattt-modal-actions .btn-glattt-primary'); await L.wait(page, 800);
  }
  const dump = () => page.evaluate(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); return { submitting: d.submitting, phorestModal: d.showPhorestChangesModal, phorestStatus: d.phorestUpdateStatus, subModal: d.showSubmissionModal, subStatus: d.submissionStatus, errors: d.errors, legal: d.activeLegalModal, toasts: [...document.querySelectorAll('[class*=toast]')].map(e => e.textContent.trim()).filter(Boolean).slice(0, 3) }; });
  const ok1 = await page.waitForFunction(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); return d.showPhorestChangesModal === true || (d.showSubmissionModal === true && d.submissionStatus); }, null, { timeout: 90000 }).then(() => true).catch(() => false);
  if (!ok1) { console.log('KEIN MODAL nach Absenden:', JSON.stringify(await dump())); return 'stuck'; }
  if (await page.evaluate(() => Alpine.$data(document.querySelector('[x-data^="formFill"]')).showPhorestChangesModal)) {
    await L.wait(page, 600);
    if (shots.phorest) await L.shot(page, shots.phorest, { noScroll: true, marks: [ { id: 'ok', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer button.btn-glattt-primary', at: 'l' } ]});
    await page.evaluate(() => Alpine.$data(document.querySelector('[x-data^="formFill"]')).submitWithPhorestUpdate());
    const ok2 = await page.waitForFunction(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); return d.showSubmissionModal === true && d.submissionStatus; }, null, { timeout: 90000 }).then(() => true).catch(() => false);
    if (!ok2) { console.log('HÄNGT nach Phorest-Update:', JSON.stringify(await dump())); return 'stuck'; }
  }
  await page.waitForFunction(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); return d.pdfReady === true || d.submissionStatus === 'error'; }, null, { timeout: 60000 }).catch(() => {});
  await L.wait(page, 800);
  const res = await page.evaluate(() => { const d = Alpine.$data(document.querySelector('[x-data^="formFill"]')); return { st: d.submissionStatus, id: d.lastSubmissionId, pdf: d.pdfReady, msg: [...document.querySelectorAll('.modal-glattt h3, .modal-glattt h2, .modal-glattt p')].filter(e => e.offsetParent !== null).map(e => e.textContent.trim()).slice(0, 4) }; });
  console.log('submission', JSON.stringify(res));
  return res;
}
async function backToForms(page) {
  await page.evaluate(() => Alpine.$data(document.querySelector('[x-data^="formFill"]')).closeEmbeddedForm()); await L.wait(page, 1500);
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('forms')); await L.wait(page, 1200);
  return page.evaluate(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); return { sepaStep: s.sepaStepRequired, direct: s.directTreatmentAvailable, cards: [...document.querySelectorAll('.session-forms-grid .session-card')].map(c => ({ t: c.querySelector('.session-card-title')?.textContent.trim(), blocked: c.classList.contains('session-form-card--blocked'), done: c.classList.contains('session-card-success') })) }; });
}
const rectOfLabel = (text) => { const el = [...document.querySelectorAll('label, h3, h2, h4, legend, .form-glattt-label, p, span, button')].find(e => e.textContent.trim().startsWith(text) && e.offsetParent !== null); if (!el) return null; const box = el.closest('.form-glattt-group, .form-field-wrapper, .contract-price-field, .form-glattt-section, .radio-glattt-group') || el; const b = box.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
const rectOfBtn = (t) => { const b = [...document.querySelectorAll('button, a')].find(e => e.textContent.trim().startsWith(t) && e.offsetParent !== null); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; };
module.exports = { L, ensureSession, openForm, scrollTo, scrollToSel, sign, scrollToSubmit, submitForm, backToForms, rectOfLabel, rectOfBtn };
