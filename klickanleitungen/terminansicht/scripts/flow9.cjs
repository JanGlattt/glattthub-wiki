/* Terminansicht 8 — Nachaufnahme: Joule-Warnung im Einstellungszettel (k4a Hinweis im Formular, k4b Popup vor dem Speichern)
   Braucht einen laufenden Behandlungstermin (KLICK_TREAT) und eine Zone mit Historie („achseln"):
   genutzte Joule unter dem Wert der letzten Sitzung → Hinweis, „Speichern" → Popup „Joule-Werte prüfen".
   Danach wird korrigiert (Wert über der letzten Sitzung) und gespeichert.                                */
const C = require('./common.cjs'); const L = C.L;
const TREAT = process.env.KLICK_TREAT || '';
const ZONE = process.env.KLICK_ZONE || 'achseln';
if (!TREAT) { console.error('KLICK_TREAT fehlt'); process.exit(2); }
const T = () => Alpine.$data(document.querySelector('[x-data^="treatmentSettings"]'));
(async () => {
  const { browser, ctx, page } = await L.launch();
  page.on('dialog', d => { console.log('DIALOG', d.message()); d.accept(); });
  await L.login(page, ctx);
  await C.ensureSession(page, TREAT);
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('treatment-settings'));
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="treatmentSettings"]'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  await L.wait(page, 1500);
  await page.evaluate((z) => T().openFormByKey(z), ZONE);
  await page.waitForFunction(() => T().showForm === true, null, { timeout: 10000 }); await L.wait(page, 800);
  const last = await page.evaluate(() => T().lastUsedJoules);
  console.log('letzte Sitzung Joule:', last);
  if (last === null || last === undefined) { console.log('KEINE HISTORIE für Zone', ZONE, '— andere Zone (KLICK_ZONE) wählen'); await browser.close(); process.exit(3); }
  const niedriger = Math.max(1, Number(last) - 2);
  await page.evaluate((used) => { const t = T(); Object.assign(t.formData, { machine_head: 'large', skin_type: 2, skintel: null, hair_color: 'd', hair_thickness: 'm', hair_density: 'm', recommended_ms: 25, recommended_jules_min: 10, recommended_jules_max: 16, used_ms: 25, used_jules: used, notes: 'Vierte Sitzung.' }); t.activeGroup = 5; }, niedriger);
  await L.wait(page, 900);
  console.log('Warnungen:', JSON.stringify(await page.evaluate(() => T().joulesWarnings)));
  await L.shot(page, 'k4a-zettel-warnung', { noScroll: true, marks: [
    { id: 'wert', kind: 'badge', n: 1, sel: '.treatment-input-warning', at: 'l' },
    { id: 'hinweis', kind: 'badge', n: 2, sel: '.treatment-warning-banner', at: 'l' },
    { id: 'speichern', kind: 'chip', label: 'Speichern', sel: '.treatment-form-footer button.btn-glattt-primary', at: 'l' },
  ]});
  await page.evaluate(async () => { await T().saveSettings(); });
  await page.waitForFunction(() => T().showJoulesWarningModal === true, null, { timeout: 10000 }); await L.wait(page, 800);
  await L.shot(page, 'k4b-zettel-warnung-popup', { noScroll: true, marks: [
    { id: 'titel', kind: 'badge', n: 3, sel: '.treatment-warning-modal-container h3', at: 'l' },
    { id: 'korrigieren', kind: 'badge', n: 4, sel: '.treatment-warning-modal-actions .btn-glattt-secondary', at: 'l' },
    { id: 'trotzdem', kind: 'badge', n: 5, sel: '.treatment-warning-modal-actions .btn-glattt-danger', at: 'r' },
  ]});
  // Korrigieren: über den Wert der letzten Sitzung, dann speichern
  await page.evaluate(() => { T().showJoulesWarningModal = false; }); await L.wait(page, 400);
  await page.evaluate((v) => { T().formData.used_jules = v; }, Number(last) + 1); await L.wait(page, 600);
  console.log('nach Korrektur Warnungen:', JSON.stringify(await page.evaluate(() => T().joulesWarnings)));
  await page.evaluate(async () => { await T().saveSettings(); });
  await page.waitForFunction(() => T().saveStatus === 'saved', null, { timeout: 20000 }).catch(() => console.log('nicht gespeichert'));
  console.log('gespeichert:', await page.evaluate(() => T().saveStatus));
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
