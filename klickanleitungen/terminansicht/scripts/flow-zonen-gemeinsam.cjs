/* Terminansicht 8, Seite „Zwei Einstellungen & gemeinsame Zonen“ (seit 13.10.2026):
   zweite Einstellung je Zone, Unterzeile „b“ im Verlauf, Fenster „Heute zusammen behandelt?“.
   Arbeitet auf dem Behandlungstermin aus KLICK_TREAT (Magdeburg-Testkundin, geplant: Linker Arm,
   Unterschenkel links/rechts) — ohne „Termin beginnen“, Phorest bleibt unberührt.
   SCHREIBT in die Hub-DB (treatment_settings): einen Papier-Nachtrag als Vorsitzung und die Zettel
   Oberschenkel + Linker Unterschenkel des Termins. Danach aufräumen (siehe README, Abschnitt „Zonen gemeinsam“). */
const C = require('./common.cjs'); const L = C.L;
const APT = process.env.KLICK_TREAT;
if (!APT) { console.error('KLICK_TREAT fehlt'); process.exit(2); }
// Headless verhungert rAF: x-show mit Übergang schaltet nicht um — Zustand aus Alpine lesen und direkt setzen
// (die Terminansicht springt nach dem Laden der Formulare selbst auf „forms“ — Ansicht jedes Mal zurücksetzen)
const fixShow = (page) => page.evaluate(() => { const a = document.querySelector('.apt-detail'); if (a) Alpine.$data(a).currentView = 'treatment-settings'; document.querySelectorAll('[x-show]').forEach(el => { try { const v = Alpine.evaluate(el, el.getAttribute('x-show')); el.style.display = v ? '' : 'none'; } catch (e) {} }); });
const NO_ANIM = '*,*::before,*::after{transition:none!important;animation:none!important} [class*="toast"]{display:none!important}';

(async () => {
  const { browser, ctx, page } = await L.launch();
  page.on('dialog', d => d.accept());
  await L.login(page, ctx);
  const open = async () => {
    await L.goto(page, `/hub/appointment/${L.MD}/${APT}`, 1500);
    await page.addStyleTag({ content: NO_ANIM });
    await page.waitForFunction(() => { const el = document.querySelector('.apt-detail'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
    await page.evaluate(() => { S().currentView = 'treatment-settings'; });  // direkt: die Sperre durch die offene Sitzungsbestätigung umgehen (nur Bild)
    await page.waitForFunction(() => { const el = document.querySelector('[x-data^="treatmentSettings"]'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
    await L.wait(page, 1200);
  };
  await open();
  const clientId = await page.evaluate(() => S().appointment?.clientId || S().client?.clientId || S().client?.id);
  console.log('Kundin', clientId ? 'ok' : 'FEHLT');

  // Vorsitzung als Papier-Nachtrag mit zweiter Einstellung — damit der Verlauf „1b“ zeigt und
  // „+ Zweite Einstellung“ eine Vorlage hat
  const pre = await page.evaluate(async (cid) => {
    const id = T().zoneKeyToId['unterschenkel_links'];
    const res = await fetch('/hub/treatment-settings/client/' + encodeURIComponent(cid) + '/backfill', { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
      body: JSON.stringify({ treated_at: '2026-08-14', branch_id: S().appointment?.branchId || 'KrzIg1nVrQ3kpKzkTgQlzA', appointment_id: null, staff_id: null, entries: [{ body_zone_id: id, custom_zone_name: null, machine_head: 'large', skin_type: 3, hair_color: 'd', hair_thickness: 'd', hair_density: 'd', recommended_ms: 30, recommended_jules_min: 12, recommended_jules_max: 18, used_ms: 30, used_jules: 14, area_label: 'Schienbein', notes: 'Gut vertragen.',
        second: { area_label: 'Knie', machine_head: 'small', skin_type: 3, hair_color: 'hb', hair_thickness: 'f', hair_density: 'm', recommended_ms: 20, recommended_jules_min: 10, recommended_jules_max: 14, used_ms: 20, used_jules: 11 } }] }) });
    return res.status + ' ' + (await res.text()).slice(0, 200);
  }, clientId);
  console.log('Vorsitzung', pre);
  await open();

  const formClip = () => page.evaluate(() => { const p = [...document.querySelectorAll('.treatment-form-container')].find(e => e.offsetParent !== null); const b = p.getBoundingClientRect(); return { x: b.x, y: Math.max(0, b.y), width: b.width, height: b.height }; });
  // k2/k3 (Seite „Zettel ausfüllen“) nachgeholt: Zone Achseln, Gruppe Laserkopf leer und Gruppe Genutzt
  // ausgefüllt — danach „Abbrechen“, gespeichert wird nichts (der Satz vom 09.10.2026 zeigte statt
  // des Zettels die Session-Kacheln)
  await page.evaluate(() => T().openFormByKey('achseln'));
  await page.waitForFunction(() => T().showForm === true, null, { timeout: 10000 });
  await fixShow(page); await L.wait(page, 600);
  await L.shot(page, 'k2-zettel-formular-laserkopf', { clip: await formClip(), noScroll: true, marks: [ { id: 'groups', kind: 'badge', n: 1, sel: '.treatment-group', at: 'tl', dx: 1, dy: 1 }, { id: 'next', kind: 'chip', label: 'Weiter', fn: () => { const b = [...document.querySelectorAll('button.treatment-group-next')].find(e => e.offsetParent !== null); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' } ]});
  await page.evaluate(() => { const t = T(); Object.assign(t.formData, { machine_head: 'large', skin_type: 2, skintel: null, hair_color: 'd', hair_thickness: 'm', hair_density: 'm', recommended_ms: 25, recommended_jules_min: 10, recommended_jules_max: 16, used_ms: 25, used_jules: 14, notes: 'Erste Sitzung, gut vertragen.' }); t.activeGroup = 4; });
  await fixShow(page); await L.wait(page, 600);
  await L.shot(page, 'k3-zettel-genutzt', { clip: await formClip(), noScroll: true, marks: [ { id: 'used', kind: 'badge', n: 2, fn: () => { const g = [...document.querySelectorAll('.treatment-group-active')].find(e => e.offsetParent !== null); const r = g?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' }, { id: 'save', kind: 'chip', label: 'Hier tippen', sel: '.treatment-form-footer button.btn-glattt-primary', at: 'l' } ]});
  await page.evaluate(() => { T().closeForm(); }); await L.wait(page, 500);

  // Oberschenkel zuerst speichern — im Fenster steht er dann als „bereits erfasst“
  await page.evaluate(() => T().openFormByKey('oberschenkel'));
  await page.waitForFunction(() => T().showForm === true, null, { timeout: 10000 });
  await page.evaluate(async () => { const t = T(); Object.assign(t.formData, { machine_head: 'large', skin_type: 3, skintel: null, hair_color: 'd', hair_thickness: 'd', hair_density: 'd', recommended_ms: 30, recommended_jules_min: 12, recommended_jules_max: 18, used_ms: 30, used_jules: 15 }); await t.saveSettings(); });
  await page.waitForFunction(() => T().showForm === false, null, { timeout: 20000 });
  await page.evaluate(() => T().dismissSuggestion()); await L.wait(page, 600);

  // Linker Unterschenkel: Formular mit Verlauf (1 + 1b) und „+ Zweite Einstellung“
  await page.evaluate(() => T().openFormByKey('unterschenkel_links'));
  await page.waitForFunction(() => T().showForm === true, null, { timeout: 10000 }); await L.wait(page, 600);
  await page.evaluate(() => { const t = T(); Object.assign(t.formData, { machine_head: 'large', skin_type: 3, skintel: null, hair_color: 'd', hair_thickness: 'd', hair_density: 'd', recommended_ms: 30, recommended_jules_min: 12, recommended_jules_max: 18, used_ms: 30, used_jules: 15, notes: 'Knie mit kleinem Kopf.' }); t.activeGroup = 5; });
  await L.wait(page, 800);
  const panelClip = async () => { await fixShow(page); await L.wait(page, 300); return page.evaluate(() => { const p = [...document.querySelectorAll('.treatment-form-container')].find(e => e.offsetParent !== null); const b = p.getBoundingClientRect(); return { x: b.x, y: Math.max(0, b.y), width: b.width, height: Math.min(b.height, window.innerHeight - Math.max(0, b.y)) }; }); };
  // Scroll-Container des Zonen-Formulars ist .treatment-form-body
  const scrollPanel = async (sel, off) => { await fixShow(page); await L.wait(page, 300); await page.evaluate(([s, o]) => { const el = [...document.querySelectorAll(s)].find(e => e.offsetParent !== null); let body = el?.parentElement; while (body && !(body.scrollHeight > body.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(body).overflowY))) body = body.parentElement; if (el && body) body.scrollTop += el.getBoundingClientRect().top - body.getBoundingClientRect().top - o; }, [sel, off]); await L.wait(page, 500); };
  const rect = (sel) => page.evaluate((s) => { const el = [...document.querySelectorAll(s)].find(e => e.offsetParent !== null); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }, sel);

  console.log('dbg', JSON.stringify(await page.evaluate(() => { const ts = document.querySelector('[x-data^="treatmentSettings"]'); const panels = [...document.querySelectorAll('.apt-detail-panel')].map(p => ({ vis: p.offsetParent !== null, disp: getComputedStyle(p).display, ts: p.contains(ts), h: p.getBoundingClientRect().height })); return { panels, add: [...document.querySelectorAll('.treatment-second-add')].map(e => getComputedStyle(e).display + '/' + (e.offsetParent !== null)), sub: document.querySelectorAll('.treatment-row-history--second').length, form: !!document.querySelector('.treatment-current-form')?.offsetParent }; })));
  await scrollPanel('.treatment-table-wrapper', 8);
  let clip = await panelClip();
  await L.shot(page, 'k8-zweite-einstellung-knopf', { clip, noScroll: true, marks: [
    { id: 'verlauf', kind: 'badge', n: 5, fn: () => { const r = [...document.querySelectorAll('.treatment-row-history--second')].find(e => e.offsetParent !== null); const b = r?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
    { id: 'add', kind: 'chip', label: 'Hier tippen', fn: () => { const r = [...document.querySelectorAll('.treatment-second-add button')].find(e => e.offsetParent !== null); const b = r?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'r' },
  ]});

  // Zweite Einstellung anlegen (Vorlage aus der letzten Sitzung), Bereiche eintragen
  await page.evaluate(() => { const t = T(); t.addSecond(); });
  await L.wait(page, 600);
  await page.evaluate(() => { const t = T(); t.formData.area_label = 'Schienbein'; t.second.area_label = 'Knie'; t.second.used_jules = 12; });
  await L.wait(page, 800);
  // Einstellung 1 mit Bereich UND der ganze Block „Einstellung 2“ passen nur in ein hohes Bild
  await page.setViewportSize({ width: 1180, height: 1560 }); await L.wait(page, 800);
  await scrollPanel('.treatment-current-form', 12);
  clip = await panelClip();
  await L.shot(page, 'k9-zweite-einstellung', { clip, noScroll: true, marks: [
    { id: 'bereich1', kind: 'badge', n: 2, fn: () => { const r = [...document.querySelectorAll('.treatment-second-area')].find(e => e.offsetParent !== null); const b = r?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
    { id: 'block2', kind: 'frame', color: 'gold', fn: () => { const r = [...document.querySelectorAll('.treatment-second')].find(e => e.offsetParent !== null); const b = r?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; } },
    { id: 'entfernen', kind: 'badge', n: 4, fn: () => { const r = [...document.querySelectorAll('.treatment-second-head button')].find(e => e.offsetParent !== null); const b = r?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
  ]});
  console.log('block', JSON.stringify(await rect('.treatment-second')), JSON.stringify(clip));

  await page.setViewportSize({ width: 1180, height: 820 }); await L.wait(page, 800);
  // Speichern → „Heute zusammen behandelt?“
  await page.evaluate(async () => { await T().saveSettings(); });
  await page.waitForFunction(() => !!T().suggest, null, { timeout: 20000 }).catch(() => console.log('KEIN VORSCHLAG'));
  await L.wait(page, 1000);
  console.log('suggest', JSON.stringify(await page.evaluate(() => T().suggest?.items)));
  await fixShow(page); await L.wait(page, 300);
  const mClip = await page.evaluate(() => { const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null && e.textContent.includes('zusammen behandelt')); const b = m?.getBoundingClientRect(); return b ? { x: Math.max(0, b.x - 170), y: Math.max(0, b.y - 30), width: b.width + 340, height: b.height + 60 } : null; });
  if (mClip) {
    await L.shot(page, 'k10-zusammen-behandelt', { clip: mClip, noScroll: true, marks: [
      { id: 'liste', kind: 'badge', n: 1, sel: '.treatment-suggest-list', at: 'l' },
      { id: 'nur', kind: 'badge', n: 3, fn: () => { const b = [...document.querySelectorAll('.modal-glattt-footer .btn-glattt-secondary')].find(e => e.offsetParent !== null && e.textContent.trim().startsWith('Nur')); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'l' },
      { id: 'ok', kind: 'chip', label: 'Hier tippen', fn: () => { const b = [...document.querySelectorAll('.modal-glattt-footer .btn-glattt-primary')].find(e => e.offsetParent !== null && /übernehmen/.test(e.textContent)); const r = b?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; }, at: 'b' },
    ]});
  } else console.log('MODAL FEHLT');
  // Übernehmen → Rechter Unterschenkel bekommt die Werte
  await page.evaluate(async () => { await T().applySuggestion(); });
  await L.wait(page, 1500);
  console.log('existing', JSON.stringify(await page.evaluate(() => Object.keys(T().existingSettings))));
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
