/* Grundlagen 7 — Die Desktop-App: Tabs & Rechtsklick-Menü
 *
 * Anders als die übrigen Abläufe fotografiert dieser Lauf NICHT den Browser,
 * sondern die laufende Desktop-App (Electron) über das Chrome-DevTools-Protokoll:
 *
 *   cd /Applications/MAMP/htdocs/glattthub
 *   env -u ELECTRON_RUN_AS_NODE npx electron --remote-debugging-port=9333 electron/main.cjs
 *   (angemeldet lassen) → dann hier:  node scripts/flow7-desktop-app.cjs
 *
 * Die App besteht aus zwei Dokumenten — der Tab-Leiste (Fensterinhalt, 38 px) und
 * der Seite im aktiven Tab (WebContentsView darunter). Beide werden getrennt
 * aufgenommen (1440 × 38 bzw. 1440 × 862, Retina) und mit sharp zu einem
 * 1440 × 900-Bild zusammengesetzt; die macOS-Fensterknöpfe zeichnet der Lauf
 * selbst, weil sie nicht zum Web-Inhalt gehören. Markierungen werden wie bei
 * shared/lib/shoot.cjs als Prozent des Gesamtbilds in meta.json geschrieben.
 *
 * Der Lauf verändert nichts: Er öffnet Tabs in der App, maskiert Kundendaten nur
 * im DOM (Beispielnamen, MD-Nummern) und schließt seine Tabs am Ende wieder.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CDP = process.env.KLICK_CDP || 'http://localhost:9333';
const W = 1440, STRIP = 38, H = 900, PAGE_H = H - STRIP, DPR = 2;
const ROOT = path.join(__dirname, '..');
const META_FILE = path.join(ROOT, 'meta.json');
const META = fs.existsSync(META_FILE) ? JSON.parse(fs.readFileSync(META_FILE, 'utf8')) : {};

const NAMES = ['Anna Musterfrau', 'Lena Beispiel', 'Marie Schneider', 'Sophie Fischer', 'Laura Weber', 'Julia Becker', 'Sarah Wagner', 'Lisa Hoffmann', 'Nina Schulz', 'Emma Koch', 'Mia Richter', 'Hanna Klein'];

// ─── CDP-Client (Node ≥ 22 bringt WebSocket mit) ────────────────────────────

async function targets() {
  return (await fetch(`${CDP}/json`)).json();
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
    ws.onerror = reject;
    ws.onopen = () => resolve({
      send: (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); }),
      close: () => ws.close(),
    });
  });
}

async function evaluate(conn, expression) {
  const r = await conn.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text + ' ' + (r.result.exceptionDetails.exception?.description || ''));
  return r.result?.result?.value;
}

async function capture(conn, width, height) {
  await conn.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: DPR, mobile: false });
  await sleep(350);
  const r = await conn.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 }, captureBeyondViewport: false });
  return Buffer.from(r.result.data, 'base64');
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function rightClick(conn, x, y) {
  await conn.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'right', clickCount: 1 });
  await conn.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'right', clickCount: 1 });
  await sleep(450);
}

// ─── Bild zusammensetzen ────────────────────────────────────────────────────

const TRAFFIC_LIGHTS = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * DPR}" height="${STRIP * DPR}">
  <circle cx="${22 * DPR}" cy="${19 * DPR}" r="${6 * DPR}" fill="#ff5f57"/>
  <circle cx="${42 * DPR}" cy="${19 * DPR}" r="${6 * DPR}" fill="#febc2e"/>
  <circle cx="${62 * DPR}" cy="${19 * DPR}" r="${6 * DPR}" fill="#28c840"/>
</svg>`;

/** Leiste + Seite zu einem Bild; `cropHeight` schneidet auf den oberen Bereich zu (CSS-px). */
const FULL = { x: 0, y: 0, w: W, h: H };

async function compose(stripPng, pagePng, file, crop = FULL) {
  const strip = await sharp(stripPng).composite([{ input: Buffer.from(TRAFFIC_LIGHTS), top: 0, left: 0 }]).png().toBuffer();
  let img = sharp({ create: { width: W * DPR, height: H * DPR, channels: 4, background: '#111827' } })
    .composite([{ input: strip, top: 0, left: 0 }, { input: pagePng, top: STRIP * DPR, left: 0 }]).png();
  if (crop !== FULL) {
    const buf = await img.toBuffer();
    img = sharp(buf).extract({ left: crop.x * DPR, top: crop.y * DPR, width: crop.w * DPR, height: crop.h * DPR }).png();
  }
  await img.toFile(file);
}

/** Markierung aus einem DOM-Rechteck (Leiste: yOffset 0, Seite: yOffset 38), relativ zum Ausschnitt. */
function mark(m, rect, yOffset, crop = FULL) {
  if (!rect) { console.log('MARK FEHLT:', m.id); return null; }
  return { ...m, pct: { x: (rect.x - crop.x) / crop.w * 100, y: (rect.y + yOffset - crop.y) / crop.h * 100, w: rect.w / crop.w * 100, h: rect.h / crop.h * 100 } };
}

/** Vereinigung mehrerer Rechtecke (für einen Rahmen um einen ganzen Block). */
function union(...rects) {
  const r = rects.filter(Boolean);
  if (!r.length) return null;
  const x1 = Math.min(...r.map(a => a.x)), y1 = Math.min(...r.map(a => a.y));
  const x2 = Math.max(...r.map(a => a.x + a.w)), y2 = Math.max(...r.map(a => a.y + a.h));
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

const RECT = (sel, index = 0) => `(() => { const els = [...document.querySelectorAll(${JSON.stringify(sel)})].filter(e => e.offsetParent !== null || e.closest('.glattt-ctx')); const el = els[${index}]; if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; })()`;
const RECT_TEXT = (sel, text) => `(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find(e => e.textContent.trim().startsWith(${JSON.stringify(text)})); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; })()`;

function saveMeta(name, marks, crop = FULL) {
  META[name] = { box: { x: 0, y: 0, width: crop.w, height: crop.h }, marks: marks.filter(Boolean), ratio: crop.h / crop.w };
  fs.writeFileSync(META_FILE, JSON.stringify(META, null, 1));
  console.log('shot', name);
}

// ─── Maskierung der Kundenliste (nur im DOM) ────────────────────────────────

const MASK_CLIENTS = `(() => {
  const names = ${JSON.stringify(NAMES)};
  const rows = [...document.querySelectorAll('tbody tr')];
  rows.forEach((tr, i) => {
    const name = names[i % names.length];
    const primary = tr.querySelector('.table-glattt-cell-primary > :first-child');
    if (primary) primary.textContent = name;
    tr.querySelectorAll('.badge-glattt').forEach(b => { if (/^[A-Z]{2}\\d{6}$/.test(b.textContent.trim())) b.textContent = 'MD' + String(i + 1).padStart(6, '0'); });
    tr.setAttribute('data-ctx-label', name);
    tr.setAttribute('data-ctx-number', 'MD' + String(i + 1).padStart(6, '0'));
    const walker = document.createTreeWalker(tr, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const t = node.nodeValue;
      if (!t || !t.trim()) continue;
      if (/@/.test(t)) node.nodeValue = name.toLowerCase().replace(' ', '.') + '@beispiel.de';
      else if (/\\d[\\d\\s]{7,}\\d/.test(t)) node.nodeValue = '0170 000 00 ' + String(10 + i);
      else if (/\\b\\d{2}\\.\\d{2}\\.(19|20)\\d{2}\\b/.test(t) && node.parentElement.closest('.table-glattt-cell-primary')) node.nodeValue = t.replace(/\\d{2}\\.\\d{2}\\.(19|20)\\d{2}/, '12.05.1990');
    }
  });
  document.querySelectorAll('.sidebar-user-name, .user-card-name, [data-user-name]').forEach(e => { e.textContent = 'Anna'; });
  // Profilbild der angemeldeten Person ausblenden (Logo bleibt)
  document.querySelectorAll('#sidebar img, aside img, nav img').forEach(i => { if (!/logo/i.test(i.src + ' ' + i.alt + ' ' + i.className)) i.style.visibility = 'hidden'; });
  return rows.length;
})()`;

// ─── Lauf ───────────────────────────────────────────────────────────────────

(async () => {
  const nur = process.argv.slice(2);
  const will = (n) => !nur.length || nur.includes(n);
  fs.mkdirSync(path.join(ROOT, 'shots'), { recursive: true });

  let ts = await targets();
  const stripT = ts.find(t => t.type === 'page' && t.url.includes('tabbar'));
  if (!stripT) throw new Error('Desktop-App nicht gefunden — läuft sie mit --remote-debugging-port=9333?');
  const strip = await connect(stripT.webSocketDebuggerUrl);
  const stripState = async () => JSON.parse(await evaluate(strip, `JSON.stringify([...document.querySelectorAll('.tab')].map(t => ({ title: t.querySelector('.tab-title').textContent, active: t.classList.contains('is-active') })))`));

  // Ausgangslage: ein Tab „Start" (die App wurde gerade gestartet)
  const before = await stripState();
  const opened = [];
  const openTab = async (url, title) => {
    const known = new Set((await targets()).map(t => t.id));
    await evaluate(strip, 'window.tabStrip.create()');
    let target = null;
    for (let i = 0; i < 40 && !target; i++) { await sleep(250); target = (await targets()).find(t => t.type === 'page' && !known.has(t.id) && /^https?:/.test(t.url)); }
    if (!target) throw new Error('Neuer Tab nicht gefunden');
    const conn = await connect(target.webSocketDebuggerUrl);
    const absolute = new URL(url, target.url).href; // frühe Ziele melden noch about:blank
    await sleep(800);
    await evaluate(conn, `location.assign(${JSON.stringify(absolute)})`);
    for (let i = 0; i < 60; i++) { await sleep(500); if (await evaluate(conn, `document.readyState === 'complete' && !!document.querySelector('tbody tr, .page-header-glattt')`).catch(() => false)) break; }
    await sleep(1500);
    // Push-Erlaubnis-Fenster (erscheint im Dev-Modus in jedem neuen Tab) mit „Später" schließen
    await evaluate(conn, `(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Später'); if (b) b.click(); return !!b; })()`).catch(() => {});
    await sleep(600);
    if (title) await evaluate(conn, `document.title = 'glatttHub - ' + ${JSON.stringify(title)}`);
    opened.push({ conn, target });
    return conn;
  };

  const kunden = await openTab('/hub/clients', 'Kundenübersicht');
  const kundin = await openTab('/hub/clients', 'Anna Musterfrau (MD000001)');
  // Reihenfolge: Start | Kundenübersicht (aktiv) | Anna Musterfrau
  const activateByTitle = async (title) => {
    await evaluate(strip, `(() => { const t = [...document.querySelectorAll('.tab')].find(t => t.querySelector('.tab-title').textContent === ${JSON.stringify(title)}); if (!t) return false; t.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true, pointerId: 1 })); t.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true, pointerId: 1 })); return true; })()`);
    await sleep(700);
  };
  await activateByTitle('Kundenübersicht');
  console.log('Tabs:', JSON.stringify(await stripState()));
  console.log('maskiert:', await evaluate(kunden, MASK_CLIENTS), 'Zeilen');
  await sleep(300);

  // ── d1 Die Tab-Leiste
  if (will('d1-tabs')) {
    const s = await capture(strip, W, STRIP);
    const p = await capture(kunden, W, PAGE_H);
    // Nur der obere Bereich (Leiste + Seitenkopf), damit die Knöpfe im Druck lesbar sind
    const CROP = { x: 0, y: 0, w: W, h: 360 };
    await compose(s, p, path.join(ROOT, 'shots/d1-tabs.png'), CROP);
    saveMeta('d1-tabs', [
      mark({ id: 'nav', kind: 'badge', n: 1, at: 'l' }, await evaluate(strip, RECT('.nav')), 0, CROP),
      mark({ id: 'tabs', kind: 'badge', n: 2, at: 'l' }, await evaluate(strip, RECT('.tab', 1)), 0, CROP),
      mark({ id: 'neu', kind: 'badge', n: 3, at: 'r' }, await evaluate(strip, RECT('.tab-new')), 0, CROP),
      mark({ id: 'schliessen', kind: 'badge', n: 4, at: 'r' }, await evaluate(strip, RECT('.tab.is-active .tab-close')), 0, CROP),
    ], CROP);
  }

  // ── d2 Rechtsklick auf eine Kundenzeile
  if (will('d2-kontextmenu-kunde')) {
    const row = await evaluate(kunden, RECT('tbody tr .table-glattt-cell-primary', 2));
    await rightClick(kunden, row.x + 60, row.y + row.h / 2);
    const s = await capture(strip, W, STRIP);
    const p = await capture(kunden, W, PAGE_H);
    const CROP = { x: 0, y: 0, w: 1040, h: 620 }; // Leiste, Seitenleiste, Zeilen und das Menü
    await compose(s, p, path.join(ROOT, 'shots/d2-kontextmenu-kunde.png'), CROP);
    saveMeta('d2-kontextmenu-kunde', [
      mark({ id: 'kopf', kind: 'badge', n: 1, at: 'l' }, await evaluate(kunden, RECT('.glattt-ctx-head')), STRIP, CROP),
      mark({ id: 'neuertab', kind: 'badge', n: 2, at: 'l' }, await evaluate(kunden, RECT_TEXT('.glattt-ctx-item', 'In neuem Tab öffnen')), STRIP, CROP),
      mark({ id: 'direkt', kind: 'badge', n: 3, at: 'l' }, await evaluate(kunden, RECT_TEXT('.glattt-ctx-item', 'Termine')), STRIP, CROP),
      mark({ id: 'kopieren', kind: 'badge', n: 4, at: 'l' }, await evaluate(kunden, RECT_TEXT('.glattt-ctx-item', 'Kunden-Nr. kopieren')), STRIP, CROP),
      mark({ id: 'seite', kind: 'frame', color: 'teal' }, union(await evaluate(kunden, RECT_TEXT('.glattt-ctx-item', 'Zurück')), await evaluate(kunden, RECT_TEXT('.glattt-ctx-item', 'Seite in neuem Tab'))), STRIP, CROP),
    ], CROP);
    await kunden.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
    await sleep(300);
  }

  // ── d3 Rechtsklick auf einen Tab
  if (will('d3-tab-menu')) {
    const tab = await evaluate(strip, RECT('.tab', 2));
    await rightClick(strip, tab.x + 40, tab.y + tab.h / 2);
    await sleep(300);
    const s = await capture(strip, W, STRIP);
    const p = await capture(kunden, W, PAGE_H);
    const CROP = { x: 0, y: 0, w: 1040, h: 420 }; // Leiste mit Tabs und das Tab-Menü
    await compose(s, p, path.join(ROOT, 'shots/d3-tab-menu.png'), CROP);
    saveMeta('d3-tab-menu', [
      mark({ id: 'tab', kind: 'chip', label: 'Rechtsklick · Ziehen zum Sortieren', at: 'r' }, tab, 0, CROP),
      mark({ id: 'kopf', kind: 'badge', n: 1, at: 'l' }, await evaluate(kunden, RECT('.glattt-ctx-head')), STRIP, CROP),
      mark({ id: 'duplizieren', kind: 'badge', n: 2, at: 'l' }, await evaluate(kunden, RECT_TEXT('.glattt-ctx-item', 'Duplizieren')), STRIP, CROP),
      mark({ id: 'schliessen', kind: 'badge', n: 3, at: 'l' }, await evaluate(kunden, RECT_TEXT('.glattt-ctx-item', 'Tab schließen')), STRIP, CROP),
      mark({ id: 'andere', kind: 'badge', n: 4, at: 'l' }, await evaluate(kunden, RECT_TEXT('.glattt-ctx-item', 'Andere Tabs')), STRIP, CROP),
    ], CROP);
    await kunden.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  }

  // Aufräumen: Emulation zurück, eigene Tabs schließen
  for (const { conn } of opened) { await conn.send('Emulation.clearDeviceMetricsOverride').catch(() => {}); }
  await strip.send('Emulation.clearDeviceMetricsOverride').catch(() => {});
  for (const title of ['Anna Musterfrau (MD000001)', 'Kundenübersicht']) {
    await evaluate(strip, `(() => { const t = [...document.querySelectorAll('.tab')].find(t => t.querySelector('.tab-title').textContent === ${JSON.stringify(title)}); if (t) t.querySelector('.tab-close').click(); })()`).catch(() => {});
    await sleep(900);
  }
  console.log('Tabs danach:', JSON.stringify(await stripState()), '(vorher', before.length + ')');
  opened.forEach(o => o.conn.close()); strip.close();
})().catch((e) => { console.error(e); process.exit(1); });
