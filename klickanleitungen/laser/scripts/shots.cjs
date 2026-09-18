/* Aufnahmelauf „Laser" — Dashboard, Geräte, Wartungs-Assistent, Fehler, Reparaturen, STK, Teile,
   Inventar, Stammdaten, Reports.

   Was der Lauf tut und was nicht:
   - Er liest, öffnet Fenster und verwirft sie mit Escape. Kein Fehler, keine STK, keine Anzeige,
     kein Standort, kein Bestand, kein Laser wird gespeichert.
   - Der Wartungs-Assistent wird bis Schritt 4 wirklich durchlaufen (Countdown 5 Minuten, Fotos):
     Die Zwischenstände liegen als **Entwurf** auf dem Server. „Wartung abschließen" wird NIE
     gedrückt; am Ende wird der Entwurf verworfen (Wartung verwerfen).
   - Fotos sind Beispielbilder (neutral, mit Beschriftung), erzeugt in einem Temp-Ordner.
   - Ausnahme (nur Staging): Für die Fenster „Versenden" und „Rückkehr" braucht es einen
     Reparatur-Vorgang. Gibt es keinen, legt der Lauf einen Test-Vorgang für ein Anbauteil des
     Lager-Lasers KLICK_LASER_REP an und versendet ihn (KLICK_REPAIR_WRITE=1, sonst Platzhalter).

   Aufruf:  node scripts/shots.cjs               (alle)
            node scripts/shots.cjs l9-countdown-start l10-countdown-laeuft   (einzeln)               */
const fs = require('fs');
const os = require('os');
const path = require('path');
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const LASER = process.env.KLICK_LASER || '35-1982';          // aktiver Laser mit allen vier Anbauteilen
const TEIL = process.env.KLICK_TEIL || 'MHPM47008';          // ein Handstück dieses Lasers
const LASER_REP = process.env.KLICK_LASER_REP || '35-1908';  // Lager-Laser für den Test-Reparaturvorgang
const GERAET = '/hub/laser/devices/' + LASER;
const ANBAUTEIL = '/hub/laser/attachments/' + TEIL;

// ── Hilfen ────────────────────────────────────────────────────────────────────────────────
const reiter = (name) => ['click', 'button.tab-glattt', name, 1200];

/** Livewire-Ereignis auslösen (so öffnen die Knöpfe der Seite ihre Fenster). */
const ereignis = (name, mitLaserId = true) => ['fn', async (page, L) => {
  await page.evaluate(([e, mit]) => {
    const m = document.body.innerHTML.match(/open-maintenance-wizard'?,\s*\{\s*laserId:\s*(\d+)/);
    const laserId = m ? +m[1] : null;
    Livewire.dispatch(e, mit && laserId ? { laserId } : {});
  }, [name, mitLaserId]);
  // Auf das Fenster warten — mit Entwurf (Fotos, Countdown-Stand) braucht der Assistent länger
  await page.waitForFunction(() => [...document.querySelectorAll('.modal-glattt')].some(e => e.offsetParent !== null), null, { timeout: 30000 })
    .catch(() => console.log('FENSTER NICHT OFFEN:', name));
  await L.wait(page, 1500);
}];

/** Sichtbares Fenster: Abschnitt/Element nach oben scrollen (das Fenster scrollt selbst). */
const imFenster = (sel, text) => ['fn', async (page, L) => {
  const ok = await page.evaluate(([s, t]) => {
    const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null);
    const el = m && [...m.querySelectorAll(s)].find(e => e.offsetParent !== null && e.innerText.replace(/\s+/g, ' ').trim().startsWith(t));
    if (!el) return false;
    const body = el.closest('.modal-glattt-body, .modal-wizard-layout, .modal-wizard-content') || m;
    body.scrollTop += el.getBoundingClientRect().top - body.getBoundingClientRect().top - 16;
    return true;
  }, [sel, text]);
  if (!ok) console.log('ABSCHNITT IM FENSTER FEHLT:', text);
  await L.wait(page, 700);
}];

/** Alpine-Dropdown im Fenster öffnen (Liste bleibt offen für das Bild). */
const dropdownAuf = (label) => ['fn', async (page, L) => {
  const ok = await page.evaluate((t) => {
    const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null);
    const lab = m && [...m.querySelectorAll('.input-glattt-floating-label, label')].find(e => e.offsetParent !== null && e.innerText.trim().startsWith(t));
    const trig = lab?.closest('.input-glattt-floating-wrapper, .form-glattt-group')?.querySelector('.dropdown-glattt-trigger');
    if (!trig) return false; trig.click(); return true;
  }, label);
  if (!ok) console.log('DROPDOWN FEHLT:', label);
  await L.wait(page, 900);
}];

/** Segment der Stammdaten-Seite wählen (Standorte · Dienstleister · Verbrauchsmaterial). */
const segment = (name) => ['fn', async (page, L) => {
  await page.evaluate((t) => { const l = [...document.querySelectorAll('.segmented-control-glattt-option')].find(e => e.innerText.trim().startsWith(t)); l?.querySelector('input')?.click(); l?.click(); }, name);
  await L.wait(page, 1500);
}];

// ── Beispielfotos ──────────────────────────────────────────────────────────────────────────
const FOTO_DIR = path.join(os.tmpdir(), 'klick-laser-fotos');
async function beispielfoto(label) {
  fs.mkdirSync(FOTO_DIR, { recursive: true });
  const f = path.join(FOTO_DIR, label.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.jpg');
  if (fs.existsSync(f)) return f;
  const sharp = require('../../node_modules/sharp');
  const svg = `<svg width="900" height="900" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9dde3"/><stop offset="1" stop-color="#aab2bd"/></linearGradient></defs>
    <rect width="900" height="900" fill="url(#g)"/>
    <circle cx="450" cy="400" r="150" fill="none" stroke="#6b7480" stroke-width="18"/>
    <rect x="300" y="620" width="300" height="34" rx="17" fill="#6b7480"/>
    <text x="450" y="760" font-family="Helvetica, Arial" font-size="44" font-weight="700" text-anchor="middle" fill="#3b424b">${label.replace(/&/g, '&amp;')}</text>
    <text x="450" y="820" font-family="Helvetica, Arial" font-size="30" text-anchor="middle" fill="#3b424b">Beispielfoto</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(f);
  return f;
}

/** Foto-Kacheln des sichtbaren Fensters füllen und auf die grünen Rahmen warten. */
const fotosFuellen = ['fn', async (page, L) => {
  const slots = await page.evaluate(() => {
    const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null);
    return [...(m ? m.querySelectorAll('input[type=file][wire\\:model^="photoUploads."]') : [])]
      .filter(i => i.closest('label')?.offsetParent !== null)
      .map(i => ({ key: i.getAttribute('wire:model').replace('photoUploads.', ''), label: i.closest('label').innerText.trim() }));
  });
  if (!slots.length) { console.log('KEINE FOTO-KACHELN SICHTBAR'); return; }
  for (const s of slots) {
    const f = await beispielfoto(s.label || s.key);
    await page.setInputFiles(`input[type=file][wire\\:model="photoUploads.${s.key}"]`, f);
    await page.waitForTimeout(700);
  }
  // Grüner Rahmen = Upload angekommen und im Entwurf gesichert
  await page.waitForFunction((n) => {
    const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null);
    return m && [...m.querySelectorAll('label[style*="var(--color-success)"]')].filter(l => l.offsetParent !== null).length >= n;
  }, slots.length, { timeout: 120000 }).catch(() => console.log('FOTOS NICHT ALLE GRÜN'));
  await L.wait(page, 1200);
}];

/** Alle Bilder im sichtbaren Fenster fertig geladen (signierte Kachel-Vorschauen). */
const bilderGeladen = ['fn', async (page, L) => {
  await page.waitForFunction(() => { const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null); return m && [...m.querySelectorAll('img')].every(i => i.complete && i.naturalWidth > 0); }, null, { timeout: 20000 }).catch(() => console.log('BILDER NICHT ALLE GELADEN'));
  await L.wait(page, 500);
}];

// ── Wartungs-Assistent ─────────────────────────────────────────────────────────────────────
const wizard = ereignis('open-maintenance-wizard');
/** Vorhandenen Entwurf verwerfen, damit Schritt 1 frisch beginnt (wire:confirm wird bestätigt). */
const entwurfVerwerfen = ['fn', async (page, L) => {
  const hat = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => e.offsetParent !== null && e.innerText.trim() === 'Wartung verwerfen'); if (b) { b.click(); return true; } return false; });
  if (hat) { await L.wait(page, 2500); console.log('Hinweis: alter Entwurf verworfen'); }
}];
const weiter = ['click', '.modal-glattt-footer button', 'Weiter', 2500];
// Das Fenster ist per x-teleport außerhalb der Livewire-Wurzel — die Komponente über ihren Namen holen
const wizardWire = `(Livewire.all().find(c => /maintenance-wizard/i.test(c.name || '')) || Livewire.all().find(c => c.snapshot && c.snapshot.memo && /maintenance-wizard/i.test(c.snapshot.memo.name || '')))`;
const setZustand = (key, wert) => ['fn', async (page, L) => {
  const ok = await page.evaluate(([k, v, expr]) => { const w = eval(expr); if (!w) return false; w.$wire.set('zustaende.' + k, v); return true; }, [key, wert, wizardWire]);
  if (!ok) console.log('WIZARD-KOMPONENTE FEHLT (zustand)');
  await L.wait(page, 1500);
}];
const setWert = (prop, wert) => ['fn', async (page, L) => {
  const ok = await page.evaluate(([p, v, expr]) => { const w = eval(expr); if (!w) return false; w.$wire.set(p, v); return true; }, [prop, wert, wizardWire]);
  if (!ok) console.log('WIZARD-KOMPONENTE FEHLT (' + prop + ')');
  await L.wait(page, 1200);
}];
const naechstesTeil = ['fn', async (page, L) => { await L.clickText(page, '.modal-glattt-footer button', 'Weiter', 3000); }];
const countdownAbwarten = ['fn', async (page, L) => {
  console.log('Countdown: warte bis zu 5 Minuten …');
  // Der Assistent hält die Auto-Abmeldung selbst wach; zur Sicherheit bewegt der Lauf alle 20 s die Maus
  const start = Date.now();
  while (Date.now() - start < 330000) {
    const fertig = await page.evaluate(() => document.body.innerText.includes('Flow Maintenance abgeschlossen')).catch(() => false);
    if (fertig) break;
    await page.mouse.move(700 + Math.round(Math.random() * 40), 300 + Math.round(Math.random() * 40)).catch(() => {});
    await page.waitForTimeout(20000);
  }
  if (!(await page.evaluate(() => document.body.innerText.includes('Flow Maintenance abgeschlossen')).catch(() => false))) console.log('COUNTDOWN NICHT ABGESCHLOSSEN');
  await L.wait(page, 1200);
}];
const fensterSchliessen = ['fn', async (page, L) => {
  await page.evaluate(() => { const c = [...document.querySelectorAll('.modal-glattt-header-close')].find(e => e.offsetParent !== null); c?.click(); });
  await L.wait(page, 1500);
}];

// ── Test-Reparatur (nur Staging, nur wenn erlaubt) ─────────────────────────────────────────
const REP_WRITE = process.env.KLICK_REPAIR_WRITE === '1';
const reparaturVorbereiten = (stufe) => ['fn', async (page, L) => {
  const knopf = stufe === 'ship' ? 'Versenden' : 'Rückkehr';
  const hatKnopf = (k) => page.evaluate((k) => !![...document.querySelectorAll('main table button')].find(b => b.offsetParent !== null && b.innerText.trim() === k), k);
  const neuLaden = async () => { await L.goto(page, page.url().replace(L.BASE, ''), 2500); await L.waitLoaded(page); await L.clickText(page, 'button.tab-glattt', 'Reparaturen', 1200); };
  if (await hatKnopf(knopf)) { await L.clickText(page, 'main table button', knopf, 2200); return; }
  if (!REP_WRITE) { console.log('KEIN REPARATUR-VORGANG — KLICK_REPAIR_WRITE=1 setzen, um einen Test-Vorgang auf Staging anzulegen'); return; }
  const sichtbaresFenster = () => page.evaluate(() => { const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 120) : null; });
  if (!(await hatKnopf('Versenden')) && !(await hatKnopf('Rückkehr'))) {
    // Test-Vorgang für ein Anbauteil anlegen (kein Laser → kein Statuswechsel des Geräts)
    await page.evaluate(() => { const m = document.body.innerHTML.match(/open-repair-modal'?,\s*\{\s*laserId:\s*(\d+)/); Livewire.dispatch('open-repair-modal', { laserId: +m[1] }); });
    await L.wait(page, 2000);
    await page.evaluate(() => { const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null); m.querySelector('.dropdown-glattt-trigger')?.click(); });
    await L.wait(page, 800);
    const gewaehlt = await page.evaluate(() => { const o = [...document.querySelectorAll('.dropdown-glattt-option')].filter(e => e.offsetParent !== null); const w = o.find(e => /Handstück|Skintel|Laserkopf/.test(e.innerText)) || o[1] || o[0]; if (!w) return null; w.click(); return w.innerText.trim(); });
    console.log('Test-Reparatur für:', gewaehlt);
    await L.wait(page, 800);
    await page.evaluate(() => { const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null); const t = m.querySelector('textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, 'Test-Vorgang für die Klickanleitung (Staging) — Gehäuse gerissen, Teil nicht einsatzfähig.'); t.dispatchEvent(new Event('input', { bubbles: true })); });
    await L.wait(page, 600);
    await L.clickText(page, '.modal-glattt button.btn-glattt-primary', 'Speichern', 3000);
    await neuLaden();
  }
  if (stufe === 'ship') { await L.clickText(page, 'main table button', 'Versenden', 2200); return; }
  // Rückkehr braucht einen versendeten Vorgang: Versand-Fenster ausfüllen und speichern (nur Staging)
  if (await hatKnopf('Versenden')) {
    await L.clickText(page, 'main table button', 'Versenden', 2200);
    await page.evaluate(() => { const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null); const d = m.querySelector('input[type=date]'); if (d) { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(d, new Date().toISOString().slice(0, 10)); d.dispatchEvent(new Event('input', { bubbles: true })); d.dispatchEvent(new Event('change', { bubbles: true })); } });
    await L.wait(page, 600);
    // Dienstleister: erste Option, falls es ein Dropdown gibt
    await page.evaluate(() => { const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null); const t = [...m.querySelectorAll('.dropdown-glattt-trigger')].find(e => e.offsetParent !== null); t?.click(); });
    await L.wait(page, 600);
    await page.evaluate(() => { const o = [...document.querySelectorAll('.dropdown-glattt-option')].filter(e => e.offsetParent !== null); (o[0])?.click(); });
    await L.wait(page, 600);
    await L.clickText(page, '.modal-glattt button.btn-glattt-primary', 'Speichern', 3000);
    console.log('Versand-Fenster nach Speichern:', await sichtbaresFenster());
    await neuLaden();
  }
  if (await hatKnopf('Rückkehr')) { await L.clickText(page, 'main table button', 'Rückkehr', 2200); return; }
  console.log('KEIN VERSENDETER VORGANG — Rückkehr-Fenster bleibt Platzhalter');
}];

// ── Plan ───────────────────────────────────────────────────────────────────────────────────
const PLAN = [
  // Laser 1: Dashboard und Geräte
  { name: 'l1-dashboard', url: '/hub/laser', steps: [['loaded'], ['wait', 1500]], marks: [
    { id: 'wartungen', kind: 'badge', n: 1, ...L.byText('.kpi-card div', 'Überfällige Wartungen'), at: 'l' },
    { id: 'stk', kind: 'badge', n: 2, ...L.byText('.kpi-card div', 'Anstehende STKs'), at: 'l' },
    { id: 'reparatur', kind: 'badge', n: 3, ...L.byText('.kpi-card div', 'Geräte in Reparatur'), at: 'l' },
    { id: 'lager', kind: 'badge', n: 4, ...L.byText('.kpi-card div', 'Lager-Unterschreitungen'), at: 'l' },
    { id: 'geraete', kind: 'chip', label: 'Zur Geräteliste', ...L.byText('a.btn-glattt-primary', 'Geräte'), at: 'l' },
  ] },
  { name: 'l2-geraeteliste', url: '/hub/laser/devices', steps: [['loaded'], ['wait', 1200]], marks: [
    { id: 'status', kind: 'badge', n: 1, ...L.byText('th', 'Status'), at: 't' },
    { id: 'standort', kind: 'badge', n: 2, ...L.byText('th', 'Standort'), at: 't' },
    { id: 'anbauteile', kind: 'badge', n: 3, ...L.byText('th', 'Anbauteile'), at: 't' },
    { id: 'details', kind: 'badge', n: 4, sel: 'a.btn-glattt-secondary.btn-glattt-sm', at: 'r' },
  ] },
  { name: 'l3-bauteilansicht', url: '/hub/laser/devices', steps: [['loaded'], ['click', 'button.btn-glattt-sm', 'Handstück', 1800], ['fn', async (page, L) => { await page.evaluate(() => { const b = [...document.querySelectorAll('button.btn-glattt-sm')].find(e => e.offsetParent !== null && e.innerText.trim() === 'Handstück'); b?.scrollIntoView({ block: 'center' }); }); await L.wait(page, 600); }]], noScroll: true, marks: [
    { id: 'legende', kind: 'badge', n: 1, ...L.byText('button.btn-glattt-sm', 'Handstück'), at: 'l' },
    { id: 'tabelle', kind: 'badge', n: 2, ...L.byText('th', 'Seriennummer'), at: 't' },
    { id: 'link', kind: 'badge', n: 3, sel: 'a[href*="/hub/laser/attachments/"]', at: 'l' },
  ] },
  // Laser 2: Gerät im Detail
  { name: 'l4-geraet-uebersicht', url: GERAET, steps: [['loaded']], marks: [
    { id: 'reiter', kind: 'frame', color: 'teal', sel: '.tabs-glattt, .tab-glattt-bar, button.tab-glattt' },
    { id: 'status', kind: 'badge', n: 2, sel: 'h1 .badge-glattt', at: 'r' },
    { id: 'daten', kind: 'badge', n: 3, ...L.byText('.card-glattt-title', 'Gerätedaten'), at: 'l' },
    { id: 'reiter-n', kind: 'badge', n: 1, ...L.byText('button.tab-glattt', 'Übersicht'), at: 'l' },
  ] },
  { name: 'l5-komponenten', url: GERAET, steps: [['loaded'], reiter('Komponenten')], marks: [
    { id: 'komponenten', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Fest verbaute Komponenten'), at: 'l' },
    { id: 'anbauteile', kind: 'badge', n: 2, ...L.byText('.card-glattt-title', 'Montierte Anbauteile'), at: 'l' },
    { id: 'zustand', kind: 'badge', n: 3, sel: 'main table .badge-glattt', at: 'r' },
  ] },
  { name: 'l6-historie', url: GERAET, steps: [['loaded'], reiter('Historie')], marks: [
    { id: 'ereignis', kind: 'badge', n: 1, ...L.byText('th', 'Ereignis'), at: 't' },
    { id: 'details', kind: 'badge', n: 2, ...L.byText('th', 'Details'), at: 't' },
    { id: 'von', kind: 'badge', n: 3, ...L.byText('th', 'Ausgelöst von'), at: 't' },
  ] },
  { name: 'l7-anschaffung', url: GERAET, steps: [['loaded'], reiter('Anschaffung')], marks: [
    { id: 'daten', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Anschaffung'), at: 'l' },
    { id: 'rechnungen', kind: 'badge', n: 2, ...L.byText('.card-glattt-title, h4, th', 'Rechnungen'), at: 'l' },
  ] },
  // Laser 3: Wartung Schritt 1
  { name: 'l8-wartungen', url: GERAET, steps: [['loaded'], reiter('Wartungen')], marks: [
    { id: 'ueberfaellig', kind: 'badge', n: 1, ...L.byText('.badge-glattt-danger', 'Wartung überfällig'), at: 'l' },
    { id: 'start', kind: 'badge', n: 2, ...L.byText('button.btn-glattt-primary', 'Wartung durchführen'), at: 'r' },
    { id: 'liste', kind: 'badge', n: 3, ...L.byText('th', 'Datum'), at: 't' },
  ] },
  { name: 'l9-countdown-start', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, entwurfVerwerfen, wizard], clip: '.modal-glattt', marks: [
    { id: 'schritte', kind: 'badge', n: 1, ...L.byText('.modal-wizard-sidebar-title', 'Schritte'), at: 'l' },
    { id: 'zeit', kind: 'badge', n: 2, ...L.byText('.modal-glattt div', '05:00'), at: 'l' },
    { id: 'start', kind: 'badge', n: 3, ...L.byText('.modal-glattt button', 'Countdown starten'), at: 'r' },
  ] },
  { name: 'l10-countdown-laeuft', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, ['click', '.modal-glattt button', 'Countdown starten', 9000]], clip: '.modal-glattt', marks: [
    { id: 'laeuft', kind: 'badge', n: 1, ...L.byText('.modal-glattt button', 'Läuft'), at: 'l' },
    { id: 'weiter', kind: 'badge', n: 2, ...L.byText('.modal-glattt-footer button', 'Weiter'), at: 'r' },
  ] },
  { name: 'l11-countdown-fertig', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, countdownAbwarten], clip: '.modal-glattt', marks: [
    { id: 'hinweis', kind: 'badge', n: 1, sel: '.modal-glattt .alert-glattt-success', at: 'l' },
    { id: 'weiter', kind: 'badge', n: 2, ...L.byText('.modal-glattt-footer button', 'Weiter'), at: 'r' },
  ] },
  { name: 'l12-entwurf', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, fensterSchliessen, wizard], clip: '.modal-glattt', marks: [
    { id: 'hinweis', kind: 'badge', n: 1, ...L.byText('.modal-glattt .badge-glattt', 'Fortgesetzte Wartung'), at: 'l' },
    { id: 'verwerfen', kind: 'badge', n: 2, ...L.byText('.modal-glattt button', 'Wartung verwerfen'), at: 'l' },
  ] },
  // Laser 4: Wartung Schritt 2
  { name: 'l13-laser-schritt', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, weiter], clip: '.modal-glattt', marks: [
    { id: 'pulses', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Pulses Maschine'), at: 'l' },
    { id: 'flow', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'FLOW (LMP)'), at: 'l' },
    { id: 'kacheln', kind: 'frame', color: 'teal', sel: '.modal-glattt label[wire\\:target^="photoUploads."]' },
  ] },
  { name: 'l14-fotos-fehlen', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, weiter], clip: '.modal-glattt', marks: [
    { id: 'rahmen', kind: 'badge', n: 1, sel: '.modal-glattt label[style*="var(--color-danger)"]', at: 'l' },
    { id: 'hinweis', kind: 'badge', n: 2, ...L.byText('.modal-glattt .form-glattt-error', 'Foto'), at: 'l' },
  ] },
  { name: 'l15-fotos-komplett', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, setWert('pulsesMaschine', '4431200'), setWert('flowLmp', '1,8'), fotosFuellen, bilderGeladen], clip: '.modal-glattt', marks: [
    { id: 'haken', kind: 'badge', n: 1, sel: '.modal-glattt label[style*="var(--color-success)"]', at: 'l' },
    { id: 'weiter', kind: 'badge', n: 2, ...L.byText('.modal-glattt-footer button', 'Weiter'), at: 'r' },
  ], after: async (page, L) => { await L.clickText(page, '.modal-glattt-footer button', 'Weiter', 3000); } },
  // Laser 5: Wartung Schritt 3 — der Entwurf steht jetzt auf Schritt 3, Handstück
  { name: 'l16-handstueck', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, setZustand('handstueck', 'GUT'), setWert('pulsesHandstueck', '1431900'), fotosFuellen, bilderGeladen], clip: '.modal-glattt', marks: [
    { id: 'balken', kind: 'badge', n: 1, ...L.byText('.modal-wizard-step-title', 'Handstück'), at: 'l' },
    { id: 'zustand', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Zustand'), at: 'l' },
    { id: 'pulses', kind: 'badge', n: 3, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Pulses Handstück'), at: 'l' },
    { id: 'fotos', kind: 'badge', n: 4, ...L.byText('.modal-glattt .form-glattt-hint', 'Fotos'), at: 'l' },
  ] },
  { name: 'l17-defekt', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, setZustand('handstueck', 'DEFEKT'), ['wait', 800], bilderGeladen], clip: '.modal-glattt', marks: [
    { id: 'hinweis', kind: 'badge', n: 1, sel: '.modal-glattt .alert-glattt-warning', at: 'l' },
  ], after: async (page, L) => { await setZustand('handstueck', 'GUT')[1](page, L); await L.clickText(page, '.modal-glattt-footer button', 'Weiter', 3000); } },
  { name: 'l18-laserkopf-gross', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, setZustand('laserkopf_gross', 'GUT'), fotosFuellen, bilderGeladen], clip: '.modal-glattt', marks: [
    { id: 'zustand', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Zustand'), at: 'l' },
    { id: 'innen', kind: 'badge', n: 2, sel: '.modal-glattt label[wire\\:target="photoUploads.grosser_kopf_innen"]', at: 'l' },
  ], after: async (page, L) => {
    // Laserkopf groß → klein (Zustand + zwei Fotos) → Skintel
    await L.clickText(page, '.modal-glattt-footer button', 'Weiter', 3000);
    await setZustand('laserkopf_klein', 'GUT')[1](page, L);
    await fotosFuellen[1](page, L);
    await L.clickText(page, '.modal-glattt-footer button', 'Weiter', 3000);
  } },
  { name: 'l19-skintel', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, setZustand('skintel', 'GUT'), setWert('testHandflaecheWert', '18'), setWert('testUnterarmWert', '24'), fotosFuellen, bilderGeladen], clip: '.modal-glattt', marks: [
    { id: 'hand', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Test Handfläche'), at: 'l' },
    { id: 'arm', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Test Unterarm'), at: 'l' },
    { id: 'probleme', kind: 'badge', n: 3, ...L.byText('.modal-glattt .toggle-glattt-label', 'Skintel-Probleme'), at: 'l' },
    { id: 'fotos', kind: 'badge', n: 4, ...L.byText('.modal-glattt .form-glattt-hint', 'Fotos'), at: 'l' },
  ], after: async (page, L) => { await L.clickText(page, '.modal-glattt-footer button', 'Weiter', 3000); } },
  // Laser 6: Wartung Schritt 4 — nur fotografieren, nie abschließen; danach Entwurf verwerfen
  { name: 'l20-lager-check', url: GERAET, steps: [['loaded'], reiter('Wartungen'), wizard, setWert('anzahlFlaschenChillerFluid', 1)], clip: '.modal-glattt', marks: [
    { id: 'fluid', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Anzahl Flaschen'), at: 'l' },
    { id: 'kommentar', kind: 'badge', n: 2, ...L.byText('.modal-glattt .form-glattt-label', 'Kommentare'), at: 'l' },
    { id: 'abschluss', kind: 'badge', n: 3, ...L.byText('.modal-glattt-footer button', 'Wartung abschließen'), at: 'r' },
  ], after: async (page, L) => { await entwurfVerwerfen[1](page, L); console.log('Hinweis: Wartungs-Entwurf verworfen — nichts gespeichert.'); } },
  { name: 'l21-protokolle-teil', url: ANBAUTEIL, steps: [['loaded'], reiter('Wartungen')], marks: [
    { id: 'laser', kind: 'badge', n: 1, ...L.byText('th', 'Laser'), at: 't' },
    { id: 'werte', kind: 'badge', n: 2, ...L.byText('th', 'Zustand'), at: 't' },
  ] },
  // Laser 7: Fehler
  { name: 'l22-fehler-reiter', url: GERAET, steps: [['loaded'], reiter('Fehler')], marks: [
    { id: 'erfassen', kind: 'badge', n: 1, ...L.byText('button.btn-glattt-danger', 'Fehler erfassen'), at: 'r' },
    { id: 'liste', kind: 'badge', n: 2, ...L.byText('.card-glattt-title', 'Fehler'), at: 'l' },
  ] },
  { name: 'l23-fehler-erfassen', url: GERAET, steps: [['loaded'], reiter('Fehler'), ereignis('open-error-modal')], clip: '.modal-glattt', marks: [
    { id: 'code', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Fehlercode'), at: 'l' },
    { id: 'zeit', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Aufgetreten am'), at: 'l' },
    { id: 'text', kind: 'badge', n: 3, ...L.byText('.modal-glattt .form-glattt-label', 'Beschreibung'), at: 'l' },
    { id: 'medien', kind: 'badge', n: 4, ...L.byText('.modal-glattt .form-glattt-label', 'Medien'), at: 'l' },
  ] },
  { name: 'l24-fehlercodes', url: GERAET, steps: [['loaded'], reiter('Fehler'), ereignis('open-error-modal'), dropdownAuf('Fehlercode')], clip: '.modal-glattt', marks: [
    { id: 'liste', kind: 'chip', label: 'Code antippen', sel: '.modal-glattt .dropdown-glattt-option', at: 'l' },
  ] },
  // Laser 8: Reparaturen
  { name: 'l25-reparaturen-reiter', url: GERAET, steps: [['loaded'], reiter('Reparaturen')], marks: [
    { id: 'anlegen', kind: 'badge', n: 1, ...L.byText('button.btn-glattt-primary', 'Reparatur anlegen'), at: 'r' },
    { id: 'status', kind: 'badge', n: 2, ...L.byText('th', 'Status'), at: 't' },
    { id: 'aktion', kind: 'badge', n: 3, ...L.byText('th', 'Aktion'), at: 't' },
  ] },
  { name: 'l26-reparatur-anlegen', url: GERAET, steps: [['loaded'], reiter('Reparaturen'), ereignis('open-repair-modal')], clip: '.modal-glattt', marks: [
    { id: 'asset', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Betroffenes Asset'), at: 'l' },
    { id: 'text', kind: 'badge', n: 2, ...L.byText('.modal-glattt .form-glattt-label', 'Defektbeschreibung'), at: 'l' },
  ] },
  { name: 'l27-versenden', url: '/hub/laser/devices/' + LASER_REP, steps: [['loaded'], reiter('Reparaturen'), reparaturVorbereiten('ship')], clip: '.modal-glattt', marks: [
    { id: 'datum', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Versandt am'), at: 'l' },
    { id: 'dienstleister', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label, .modal-glattt label', 'Dienstleister'), at: 'l' },
    { id: 'kva', kind: 'badge', n: 3, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Kostenvoranschlag'), at: 'l' },
  ] },
  { name: 'l28-rueckkehr', url: '/hub/laser/devices/' + LASER_REP, steps: [['loaded'], reiter('Reparaturen'), reparaturVorbereiten('return')], clip: '.modal-glattt', marks: [
    { id: 'ergebnis', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label, .modal-glattt label', 'Ergebnis'), at: 'l' },
    { id: 'kosten', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Kosten'), at: 'l' },
    { id: 'rechnung', kind: 'badge', n: 3, ...L.byText('.modal-glattt .form-glattt-label', 'Rechnung'), at: 'l' },
  ] },
  // Laser 9: STK & Behörde
  { name: 'l29-stk-reiter', url: GERAET, steps: [['loaded'], reiter('STK')], marks: [
    { id: 'stk', kind: 'badge', n: 1, ...L.byText('button.btn-glattt-primary', 'STK erfassen'), at: 'r' },
    { id: 'faellig', kind: 'badge', n: 2, ...L.byText('th', 'Nächste Fälligkeit'), at: 't' },
    { id: 'anzeige', kind: 'badge', n: 3, ...L.byText('button.btn-glattt-secondary', 'Anzeige erfassen'), at: 'r' },
  ] },
  { name: 'l30-stk-erfassen', url: GERAET, steps: [['loaded'], reiter('STK'), ereignis('open-stk-modal')], clip: '.modal-glattt', marks: [
    { id: 'datum', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Durchgeführt am'), at: 'l' },
    { id: 'faellig', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Nächste Fälligkeit'), at: 'l' },
    { id: 'ergebnis', kind: 'badge', n: 3, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Ergebnis'), at: 'l' },
    { id: 'protokoll', kind: 'badge', n: 4, ...L.byText('.modal-glattt .form-glattt-label', 'Prüfprotokoll'), at: 'l' },
  ] },
  { name: 'l31-behoerde', url: GERAET, steps: [['loaded'], reiter('STK'), ereignis('open-authority-modal')], clip: '.modal-glattt', marks: [
    { id: 'behoerde', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Behörde'), at: 'l' },
    { id: 'az', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Aktenzeichen'), at: 'l' },
    { id: 'nachweis', kind: 'badge', n: 3, ...L.byText('.modal-glattt .form-glattt-label', 'Nachweis'), at: 'l' },
  ] },
  // Laser 10: Teile
  { name: 'l32-anbauteil', url: ANBAUTEIL, steps: [['loaded']], marks: [
    { id: 'reiter', kind: 'badge', n: 1, ...L.byText('button.tab-glattt', 'Übersicht'), at: 'l' },
    { id: 'zustand', kind: 'badge', n: 2, ...L.byText('dt.form-glattt-label', 'Zustand'), at: 'l' },
    { id: 'pulse', kind: 'badge', n: 3, ...L.byText('dt.form-glattt-label', 'Puls-Zähler'), at: 'l' },
  ] },
  { name: 'l33-anbauteil-wartungen', url: ANBAUTEIL, steps: [['loaded'], reiter('Wartungen')], marks: [
    { id: 'laser', kind: 'badge', n: 1, ...L.byText('th', 'Laser'), at: 't' },
    { id: 'werte', kind: 'badge', n: 2, ...L.byText('th', 'Zustand'), at: 't' },
  ] },
  { name: 'l34-anbauteil-verlauf', url: ANBAUTEIL, steps: [['loaded'], reiter('Verlauf')], marks: [
    { id: 'ereignis', kind: 'badge', n: 1, ...L.byText('th, .card-glattt-title', 'Ereignis'), at: 't' },
  ] },
  // Laser 11: Inventarisieren (nur Fenster, nie speichern)
  { name: 'l35-inventar-geraet', url: '/hub/laser/devices', steps: [['loaded'], ereignis('open-laser-inventory', false)], clip: '.modal-glattt', marks: [
    { id: 'sn', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Top-Unit-Seriennummer'), at: 'l' },
    { id: 'status', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Betriebsstatus'), at: 'l' },
    { id: 'standort', kind: 'badge', n: 3, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Standort'), at: 'l' },
    { id: 'komponenten', kind: 'badge', n: 4, ...L.byText('.modal-glattt .modal-wizard-step-desc', 'Fest verbaute Komponenten'), at: 'l' },
  ] },
  { name: 'l36-inventar-anbauteile', url: '/hub/laser/devices', steps: [['loaded'], ereignis('open-laser-inventory', false), ['fill', '.modal-glattt input[type=text]', '35-9999'], ['click', '.modal-glattt-footer button', 'Weiter', 2500]], clip: '.modal-glattt', marks: [
    { id: 'titel', kind: 'badge', n: 1, ...L.byText('.modal-wizard-step-title', 'Anbauteile'), at: 'l' },
    { id: 'zustand', kind: 'badge', n: 2, ...L.byText('.modal-glattt .toggle-glattt-label', 'Neu'), at: 'l' },
  ] },
  { name: 'l37-inventar-anschaffung', url: '/hub/laser/devices', steps: [['loaded'], ereignis('open-laser-inventory', false), ['fill', '.modal-glattt input[type=text]', '35-9999'], ['click', '.modal-glattt-footer button', 'Weiter', 2500], ['click', '.modal-glattt-footer button', 'Weiter', 2500]], clip: '.modal-glattt', marks: [
    { id: 'daten', kind: 'badge', n: 1, ...L.byText('.modal-wizard-step-title', 'Anschaffung'), at: 'l' },
    { id: 'rechnung', kind: 'badge', n: 2, ...L.byText('.modal-glattt .modal-wizard-step-desc', 'Optional. Bei Erfassung'), at: 'l' },
  ] },
  { name: 'l38-ersatzteil', url: '/hub/laser/devices', steps: [['loaded'], ereignis('open-part-inventory', false)], clip: '.modal-glattt', marks: [
    { id: 'typ', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Typ'), at: 'l' },
    { id: 'sn', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Seriennummer'), at: 'l' },
    { id: 'lager', kind: 'badge', n: 3, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Lagerstandort'), at: 'l' },
  ] },
  // Laser 12: Stammdaten & Material
  { name: 'l39-standorte', url: '/hub/laser/master-data', steps: [['loaded'], ['wait', 1000]], marks: [
    { id: 'bereich', kind: 'badge', n: 1, sel: '.segmented-control-glattt', at: 'l' },
    { id: 'neu', kind: 'badge', n: 2, ...L.byText('button.btn-glattt-primary', 'Neuer Standort'), at: 'r' },
    { id: 'typ', kind: 'badge', n: 3, ...L.byText('th', 'Typ'), at: 't' },
  ] },
  { name: 'l40-standort-anlegen', url: '/hub/laser/master-data', steps: [['loaded'], ['click', 'button.btn-glattt-primary', 'Neuer Standort', 2000]], clip: '.modal-glattt', marks: [
    { id: 'code', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Code'), at: 'l' },
    { id: 'typ', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Typ'), at: 'l' },
    { id: 'institut', kind: 'badge', n: 3, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Institut'), at: 'l' },
    { id: 'aktiv', kind: 'badge', n: 4, ...L.byText('.modal-glattt .toggle-glattt-label', 'Aktiv'), at: 'l' },
  ] },
  { name: 'l41-dienstleister', url: '/hub/laser/master-data', steps: [['loaded'], segment('Dienstleister')], marks: [
    { id: 'liste', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Reparaturdienstleister'), at: 'l' },
  ] },
  { name: 'l42-materialtypen', url: '/hub/laser/master-data', steps: [['loaded'], segment('Verbrauchsmaterial')], marks: [
    { id: 'typen', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Verbrauchsmaterial'), at: 'l' },
    { id: 'bestaende', kind: 'badge', n: 2, ...L.byText('a.btn-glattt-secondary', 'Material-Bestände'), at: 'r' },
  ] },
  { name: 'l43-bestand-anlegen', url: '/hub/laser/consumables', steps: [['loaded'], ['click', 'button.btn-glattt-primary', 'Bestand anlegen', 2000]], clip: '.modal-glattt', marks: [
    { id: 'material', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Material'), at: 'l' },
    { id: 'bestand', kind: 'badge', n: 2, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Bestand'), at: 'l' },
    { id: 'minimum', kind: 'badge', n: 3, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Mindestbestand'), at: 'l' },
  ] },
  // Laser 13: Reports
  { name: 'l44-reports', url: '/hub/laser/reports', steps: [['loaded']], marks: [
    { id: 'r1', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Überfällige Wartungen'), at: 'l' },
    { id: 'r2', kind: 'badge', n: 2, ...L.byText('.card-glattt-title', 'Anstehende STKs'), at: 'l' },
    { id: 'r3', kind: 'badge', n: 3, ...L.byText('.card-glattt-title', 'Geräte in Reparatur'), at: 'l' },
    { id: 'r4', kind: 'badge', n: 4, ...L.byText('.card-glattt-title', 'Defekt- & Fehlerquote'), at: 'l' },
    { id: 'r5', kind: 'badge', n: 5, ...L.byText('.card-glattt-title', 'Asset-Wert'), at: 'l' },
    { id: 'r6', kind: 'badge', n: 6, ...L.byText('.card-glattt-title', 'Reparaturhistorie'), at: 'l' },
  ] },
  { name: 'l45-ueberfaellige', url: '/hub/laser/reports/overdue-maintenance', steps: [['loaded']], marks: [
    { id: 'anzahl', kind: 'badge', n: 1, sel: '.card-glattt-header .badge-glattt', at: 'r' },
    { id: 'oeffnen', kind: 'badge', n: 2, sel: 'a.btn-glattt-secondary.btn-glattt-sm', at: 'r' },
  ] },
  { name: 'l46-assetwert', url: '/hub/laser/reports/asset-value', steps: [['loaded']], marks: [
    { id: 'laser', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Wert je Laser'), at: 'l' },
    { id: 'standort', kind: 'badge', n: 2, ...L.byText('.card-glattt-title', 'Gesamtwert je Standort'), at: 'l' },
  ] },
  { name: 'l47-reparaturhistorie', url: '/hub/laser/reports/repair-history', steps: [['loaded']], marks: [
    { id: 'kosten', kind: 'badge', n: 3, ...L.byText('.card-glattt-title', 'Kosten je Dienstleister'), at: 'l' },
  ] },
];

P.run(PLAN, L, {
  nur: process.argv.slice(2),
  // wire:confirm („Wartung wirklich verwerfen?") bestätigen
  before: async (page) => { page.on('dialog', (d) => d.accept().catch(() => {})); },
});
