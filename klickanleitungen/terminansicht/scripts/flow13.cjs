/* Terminansicht 13 — Qualitätskontrolle (qk1–qk4), seit 02.11.2026

   Läuft gegen den lokalen Hub (`.env`, KLICK_BASE=glattthub.local) mit dem Termin aus KLICK_APT:
   legt einen Beispielbefund „Achseln“ mit Kommentar und Foto an, nimmt die Ansicht, die Kachel,
   den Knopf im Einstellungszettel und den Abschnitt in der Kundenakte auf und **entfernt den
   Befund am Ende wieder**. Das Beispielfoto kommt aus KLICK_QK_PHOTO (JPEG, z. B. eine
   Hautfläche ohne Gesicht) — ohne Angabe bleibt der Fotostreifen leer.

   Aufruf:  set -a; . ./.env; set +a; KLICK_QK_PHOTO=/pfad/foto.jpg node scripts/flow13.cjs   */
const L = require('./lib.cjs');

(async () => {
  const nur = process.argv.slice(2);
  const will = (n) => !nur.length || nur.includes(n);
  const { browser, ctx, page } = await L.launch({ viewport: { width: 1180, height: 1000 } });
  await L.login(page, ctx);
  await L.goto(page, `/hub/appointment/${process.env.KLICK_BRANCH}/${process.env.KLICK_APT}`, 7000);
  await page.addStyleTag({ content: '.driver-popover,.driver-overlay{display:none!important} body.driver-active, body.driver-active *{pointer-events:auto!important}' });
  const view = (v) => page.evaluate((v) => { S().currentView = v; }, v);

  // Beispielbefund anlegen: Zone über den Kanal der Grafik wählen, Kommentar tippen, Foto hochladen
  await view('quality-check');
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="qualityCheck"]'); return el && Alpine.$data(el).qcLoaded; }, null, { timeout: 30000 });
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('quality-check-treatment-zone-clicked', { detail: { zoneKey: 'achseln', zoneName: 'Achseln' } })));
  await page.waitForSelector('[data-qc-zone="achseln"] textarea', { timeout: 15000 });
  await L.wait(page, 800);
  await page.fill('[data-qc-zone="achseln"] textarea', 'Links vereinzelte Stoppeln am Rand, rechts gut. Nachbehandlung links einplanen.');
  await page.locator('[data-qc-zone="achseln"] textarea').blur();
  if (process.env.KLICK_QK_PHOTO) {
    await page.setInputFiles('[data-qc-zone="achseln"] .qc-photo-input', process.env.KLICK_QK_PHOTO);
    await page.waitForSelector('[data-qc-zone="achseln"] .qc-photo img', { timeout: 30000 }).catch(() => console.log('KEIN FOTO'));
  }
  await L.wait(page, 2500);

  // ── qk1 Ansicht: Grafik links, Befund-Karte rechts
  if (will('qk1-qk-ansicht')) {
    const clip = await L.clipOf(page, '.qc-layout', 8);
    clip.height = Math.min(clip.height, 820);
    await L.shot(page, 'qk1-qk-ansicht', { clip, noScroll: true, marks: [
      { id: 'grafik', kind: 'badge', n: 1, sel: '.qc-graphic .body-zone-graphic', at: 'l' },
      { id: 'kommentar', kind: 'badge', n: 2, sel: '[data-qc-zone="achseln"] .input-glattt-floating-wrapper', at: 'l' },
      { id: 'fotos', kind: 'badge', n: 3, sel: '[data-qc-zone="achseln"] .qc-photo-add', at: 'r' },
      { id: 'entfernen', kind: 'chip', label: 'Befund entfernen', sel: '[data-qc-zone="achseln"] .qc-card-head .btn-glattt-icon', at: 'l' },
    ]});
  }

  // ── qk2 Kachel in der Session (grün, sobald Befunde erfasst sind)
  if (will('qk2-qk-kachel')) {
    await view('session');
    await L.wait(page, 800);
    await L.shot(page, 'qk2-qk-kachel', { clip: await L.clipOf(page, '.unified-session-grid', 8), noScroll: true, marks: [
      { id: 'kachel', kind: 'frame', color: 'gold', fn: () => { const el = [...document.querySelectorAll('.unified-session-grid .session-card')].find(c => /Qualitätskontrolle/.test(c.textContent) && c.offsetParent); const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; } },
    ]});
  }

  // ── qk3 Knopf im Einstellungszettel (QK ohne gebuchte QK-Leistung)
  if (will('qk3-qk-knopf-zettel')) {
    await view('treatment-settings');
    await page.waitForFunction(() => T() && !T().loading, null, { timeout: 30000 }).catch(() => console.log('ZETTEL LÄDT NOCH'));
    await L.wait(page, 1200);
    const clip = await page.evaluate(() => { const el = [...document.querySelectorAll('.treatment-backfill-entry')].find(e => e.offsetParent); const b = el.getBoundingClientRect(); return { x: Math.max(0, b.x - 12), y: Math.max(0, b.y - 12), width: Math.min(b.width + 24, 900), height: b.height + 24 }; });
    await L.shot(page, 'qk3-qk-knopf-zettel', { clip, noScroll: true, marks: [
      { id: 'knopf', kind: 'badge', n: 1, fn: () => { const el = [...document.querySelectorAll('.treatment-backfill-entry button')].find(b => /Qualitätskontrolle/.test(b.textContent) && b.offsetParent); const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }, at: 'r' },
    ]});
  }

  // ── qk4 Kundenakte → Behandlung: Abschnitt „Qualitätskontrollen“
  const clientId = await page.evaluate(() => S().clientId);
  if (will('qk4-qk-kundenakte') && clientId) {
    await L.goto(page, `/hub/clients/${clientId}#behandlung`, 6000);
    // Reiter „Behandlungseinstellungen“ öffnen — der Anker allein öffnet ihn headless nicht zuverlässig
    await page.evaluate(() => { const el = [...document.querySelectorAll('[x-data]')].find(e => typeof Alpine.$data(e).selectTab === 'function'); Alpine.$data(el).selectTab('treatment-settings'); });
    await page.waitForFunction(() => [...document.querySelectorAll('.qc-history-item')].some(e => e.offsetParent), null, { timeout: 30000 }).catch(() => console.log('KEIN QK-ABSCHNITT'));
    await L.wait(page, 1500);
    const clip = await page.evaluate(() => { const el = [...document.querySelectorAll('.qc-history')].find(e => e.offsetParent).closest('.card-glattt'); el.scrollIntoView({ block: 'start' }); const b = el.getBoundingClientRect(); return { x: Math.max(0, b.x - 8), y: Math.max(0, b.y - 8), width: b.width + 16, height: b.height + 16 }; });
    await L.shot(page, 'qk4-qk-kundenakte', { clip, noScroll: true, marks: [] });
  }

  // Aufräumen: Beispielbefund samt Foto entfernen
  await L.goto(page, `/hub/appointment/${process.env.KLICK_BRANCH}/${process.env.KLICK_APT}`, 3000);
  const removed = await page.evaluate(async () => {
    const res = await fetch(location.pathname.replace('/hub/appointment/', '/hub/appointment/') + '/quality-check/zones/achseln', {
      method: 'DELETE', headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content, 'X-Requested-With': 'XMLHttpRequest' },
    });
    return res.status;
  });
  console.log('Beispielbefund entfernt:', removed);
  await browser.close();
})();
