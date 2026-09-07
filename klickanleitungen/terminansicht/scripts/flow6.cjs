/* Stufe 6: Behandlungstermin — Einstellungszettel pflegen (Zone wählen, Werte erfassen, speichern), Termin beenden */
const C = require('./common.cjs'); const L = C.L;
const fs = require('fs');
const T = () => Alpine.$data(document.querySelector('[x-data^="treatmentSettings"]'));
(async () => {
  const url = fs.readFileSync('treatment-url.txt', 'utf8').trim();
  const apt = url.split('/').pop().split('?')[0];
  const { browser, ctx, page } = await L.launch();
  page.on('dialog', d => { console.log('DIALOG', d.message()); d.accept(); });
  await L.login(page, ctx);
  await C.ensureSession(page, apt);
  const st = await page.evaluate(() => { const s = Alpine.$data(document.querySelector('.apt-detail')); return { state: s.appointment?.state, locked: s.treatmentLocked, missing: s.missingRequiredForms?.map(f => f.name), forms: s.displayedForms?.map(f => f.name) }; });
  console.log('Behandlungstermin', JSON.stringify(st));
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('session')); await L.wait(page, 1000);
  await L.shot(page, 'j2-behandlung-session', { marks: [ { id: 'zettel', kind: 'chip', label: 'Hier tippen', sel: '.unified-session-grid .session-card:nth-of-type(2)', at: 'b' } ]});
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('treatment-settings'));
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="treatmentSettings"]'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  await L.wait(page, 1500);
  console.log('zettel', JSON.stringify(await page.evaluate(() => { const t = T(); return { zones: Object.keys(t.zoneDefinitions || {}).length, existing: Object.keys(t.existingSettings || {}), prev: t.previouslyTreatedZones, buttons: [...document.querySelectorAll('button.body-zone-button')].map(b => b.textContent.trim()).slice(0, 20) }; })));
  await L.shot(page, 'k1-zettel-uebersicht', { marks: [ { id: 'figur', kind: 'badge', n: 1, sel: '.treatment-body-selector', at: 'tl', dx: 1.5, dy: 1.5 }, { id: 'zone', kind: 'chip', label: 'Hier tippen', fn: (t) => { const b = [...document.querySelectorAll('button.body-zone-button')].find(e => e.textContent.trim() === t); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, fnArg: 'Achseln', at: 'r' } ]});
  await page.evaluate(() => T().openFormByKey('achseln'));
  await page.waitForFunction(() => T().showForm === true, null, { timeout: 10000 }); await L.wait(page, 800);
  await L.shot(page, 'k2-zettel-formular-laserkopf', { noScroll: true, marks: [ { id: 'groups', kind: 'badge', n: 2, sel: '.treatment-group', at: 'tl', dx: 1, dy: 1 }, { id: 'next', kind: 'chip', label: 'Weiter', sel: 'button.treatment-group-next', at: 'l' } ]});
  await page.evaluate(() => { const t = T(); Object.assign(t.formData, { machine_head: 'large', skin_type: 2, skintel: null, hair_color: 'd', hair_thickness: 'm', hair_density: 'm', recommended_ms: 25, recommended_jules_min: 10, recommended_jules_max: 16, used_ms: 25, used_jules: 14, notes: 'Erste Sitzung, gut vertragen.' }); t.activeGroup = 4; });
  await L.wait(page, 800);
  await L.shot(page, 'k3-zettel-genutzt', { noScroll: true, marks: [ { id: 'used', kind: 'badge', n: 3, sel: '.treatment-input-highlight', at: 'l' }, { id: 'save', kind: 'chip', label: 'Hier tippen', sel: '.treatment-form-footer button.btn-glattt-primary', at: 'l' } ]});
  await page.evaluate(async () => { await T().saveSettings(); });
  await L.wait(page, 800);
  const warn = await page.evaluate(() => ({ warn: T().showJoulesWarningModal, w: T().joulesWarnings, st: T().saveStatus }));
  console.log('save', JSON.stringify(warn));
  if (warn.warn) { await L.shot(page, 'k4-zettel-warnung', { noScroll: true }); await page.evaluate(async () => { await T().saveSettings(); }); }
  await page.waitForFunction(() => T().saveStatus === 'saved', null, { timeout: 20000 }).catch(() => console.log('nicht gespeichert:', 'x'));
  await L.wait(page, 1200);
  await L.shot(page, 'k5-zettel-gespeichert', { marks: [ { id: 'chip', kind: 'badge', n: 4, sel: '.configured-zones-summary .configured-zone-chip', at: 'l' } ]});
  // Historie-Ansicht
  await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).navigateTo('settings-history')); await L.wait(page, 2000);
  await L.shot(page, 'k6-zettel-historie', {});
  // Termin beenden (Folgetermin-Modal ist Livewire und braucht einen Moment)
  await page.evaluate(() => S().beginEndSessionFlow());
  await L.wait(page, 6000);
  const flow = await page.evaluate(() => { const s = S(); return { bal: s.showBalanceScreen, end: s.showEndSessionModal, modals: [...document.querySelectorAll('.modal-glattt')].filter(e => e.offsetParent !== null).map(e => e.innerText.replace(/\n+/g, ' | ').slice(0, 120)) }; });
  console.log('endflow', JSON.stringify(flow));
  if (flow.modals.some(m => m.includes('Folgetermin'))) {
    await L.shot(page, 'l1-folgetermin', { noScroll: true });
    await page.evaluate(() => { const c = [...document.querySelectorAll('.modal-glattt-header-close')].find(e => e.offsetParent !== null); c?.click(); });
    await page.waitForFunction(() => S().showEndSessionModal, null, { timeout: 30000 }).catch(() => {}); await L.wait(page, 800);
  }
  if (await page.evaluate(() => S().showEndSessionModal)) {
    await page.fill('.modal-glattt textarea.input-glattt', 'Erste Behandlung Achseln und Bikinizone durchgeführt, gut vertragen.');
    await L.shot(page, 'l2-behandlung-terminnotiz', { noScroll: true, marks: [ { id: 'end', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer button.btn-glattt-danger', at: 'l' } ]});
    await page.click('.modal-glattt-footer button.btn-glattt-danger');
    await page.waitForFunction(() => S().endSessionStatus === 'success', null, { timeout: 60000 }); await L.wait(page, 3000);
    await L.shot(page, 'l3-behandlung-beendet', {});
  }
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
