/* Aufnahme-Bausteine für ALLE Klickanleitungen-Serien: Browser starten, anmelden, maskieren,
   Screenshot mit Markierungen ablegen. Serien-Eigenheiten (welche Seite, welcher Reiter)
   gehören in `scripts/lib.cjs` der jeweiligen Serie, nicht hierher.

   In dieser Datei stehen NIE Zugangsdaten oder echte Personendaten — das Wiki-Repo ist
   öffentlich. Zugang kommt aus der Umgebung (`.env`), die Maskierung aus `mask.json`.
   Beide sind gitignored; Vorlagen liegen je Serie als `.env.example` / `mask.example.json`. */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.KLICK_BASE || '';
const CREDS = [process.env.KLICK_USER || '', process.env.KLICK_PW || ''];

function requireEnv(extra = []) {
  if (!BASE) fail('KLICK_BASE fehlt — Adresse der Umgebung setzen (siehe ../.env.example).');
  if (!CREDS[0] || !CREDS[1]) fail('KLICK_USER/KLICK_PW fehlen — Zugang als Umgebungsvariable setzen (siehe ../.env.example).');
  for (const [name, hint] of extra) if (!process.env[name]) fail(name + ' fehlt — ' + hint);
}
function fail(msg) { console.error(msg); process.exit(2); }

const HIDE_CSS = '.env-badge{display:none!important}';

/* ── Maskierung ──────────────────────────────────────────────────────────────────────────
   Aufgenommen wird auf einer Kopie der Produktivdaten: echte Kundinnen, echte Kolleginnen.
   Alles Personenbezogene wird deshalb VOR jedem Screenshot im DOM ersetzt — Namen, Kontakt,
   Adresse, Nummern, IBAN — und Freitexte (Nachrichten, Kommentare) durch Beispielsätze.
   Ohne mask.json wird nicht aufgenommen.                                                  */
let MASKCFG = null;
function loadMask() {
  if (MASKCFG) return MASKCFG;
  if (!fs.existsSync('mask.json')) {
    console.error('mask.json fehlt — Kopie von mask.example.json anlegen und mit den echten Werten füllen.');
    console.error('Ohne Maskierung wird NICHT aufgenommen: Die Screenshots landen im öffentlichen Wiki-Repo.');
    process.exit(2);
  }
  MASKCFG = JSON.parse(fs.readFileSync('mask.json', 'utf8'));
  return MASKCFG;
}

async function mask(page) {
  const cfg = loadMask();
  await page.evaluate(({ rules, blank, samples }) => {
    // Alle Regeln zu EINEM Ausdruck kompilieren (längste zuerst, damit „Anna Musterfrau-Meier"
    // vor „Anna Musterfrau" greift) — mit zehntausenden Regeln aus einer Datenbank-Kopie wäre
    // die Wortliste je Textknoten sonst um Größenordnungen zu langsam.
    const map = new Map(rules.filter(([from]) => from !== null && from !== undefined && String(from) !== '').map(([from, to]) => [String(from), String(to ?? '')]));
    const froms = [...map.keys()].sort((a, b) => b.length - a.length);
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const chunks = [];
    for (let i = 0; i < froms.length; i += 4000) chunks.push(new RegExp(froms.slice(i, i + 4000).map(esc).join('|'), 'g'));
    const apply = (s) => { let out = String(s); for (const re of chunks) out = out.replace(re, (m) => map.get(m) ?? m); return out; };
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode())) { const v = apply(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    document.querySelectorAll('input, textarea').forEach(el => { const v = apply(el.value); if (v !== el.value) el.value = v; });
    document.querySelectorAll('[title], [alt], [aria-label]').forEach(el => {
      if (el.title) { const v = apply(el.title); if (v !== el.title) el.title = v; }
      if (el.alt) { const v = apply(el.alt); if (v !== el.alt) el.alt = v; }
    });
    let i = 0;
    for (const sel of blank) {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.textContent.trim()) return;
        el.textContent = samples.length ? samples[i++ % samples.length] : '…';
      });
    }
  }, { rules: cfg.replace || [], blank: cfg.blankText || [], samples: cfg.sampleTexts || [] });
}

/* ── Browser & Anmeldung ─────────────────────────────────────────────────────────────── */
async function launch(opts = {}) {
  const browser = await chromium.launch({
    headless: opts.headless !== false,
    // Ohne diese Flags verhungert requestAnimationFrame headless (siehe Wiki KLICKANLEITUNGEN.md)
    args: ['--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  });
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 1180, height: 820 },   // iPad quer
    deviceScaleFactor: 2,
    colorScheme: 'light',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    storageState: fs.existsSync('state.json') && !opts.fresh ? 'state.json' : undefined,
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    try {
      localStorage.setItem('glattthub-theme', 'light');
      localStorage.setItem('bertGreetingShown', new Date().toISOString().slice(0, 10));
    } catch (e) {}
  });
  if (opts.init) await page.addInitScript(opts.init);
  page.on('pageerror', e => console.log('JS-FEHLER:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text().slice(0, 200)); });
  return { browser, ctx, page };
}

async function hideBadge(page) { try { await page.addStyleTag({ content: HIDE_CSS }); } catch (e) {} }

async function login(page, ctx) {
  await page.goto(BASE + '/hub', { waitUntil: 'domcontentloaded' });
  if (page.url().includes('/login')) {
    // Die Login-Seite hat ZWEI Formulare (#form-pin zuerst) — immer über das E-Mail-Feld greifen
    await page.evaluate(([email, pw]) => {
      const set = (el, v) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const e = document.querySelector('input[name="email"]');
      set(e, email);
      set(e.closest('form').querySelector('input[name="password"]'), pw);
      e.closest('form').requestSubmit();
    }, CREDS);
    await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 20000 });
    await ctx.storageState({ path: 'state.json' });
  }
}

const wait = (page, ms) => page.waitForTimeout(ms);

async function goto(page, path, ms = 2500) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });   // nie networkidle
  await hideBadge(page);
  await wait(page, ms);
}

/** Sichtbares Element per Beschriftung messen — als `marks`-Eintrag für shot(). */
const byText = (sel, text) => ({
  fn: (arg) => {
    const el = [...document.querySelectorAll(arg.sel)]
      .filter(e => e.offsetParent !== null)
      .find(e => e.textContent.trim().startsWith(arg.text));
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  },
  fnArg: { sel, text },
});

/** Sichtbares Element per Beschriftung anklicken (bei „element not stable" immer über evaluate). */
async function clickText(page, sel, text, ms = 1200) {
  const ok = await page.evaluate((arg) => {
    // Erst exakter Anfang, dann „enthält" — Knöpfe tragen oft ein Symbol oder einen Zusatz vor dem
    // Text („Gezahlte Rate nachtragen"), und Livewire hängt gern Leerzeichen an.
    const sichtbar = [...document.querySelectorAll(arg.sel)].filter(e => e.offsetParent !== null);
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    const el = sichtbar.find(e => norm(e.textContent).startsWith(arg.text))
      || sichtbar.find(e => norm(e.textContent).includes(arg.text));
    if (!el) return false;
    el.click();
    return true;
  }, { sel, text });
  if (!ok) { console.log('KNOPF FEHLT:', sel, text); return false; }
  await wait(page, ms);
  return true;
}

/** Element in den sichtbaren Bereich scrollen. */
async function scrollTo(page, sel, block = 'center') {
  await page.evaluate(([s, b]) => {
    const el = [...document.querySelectorAll(s)].find(e => e.offsetParent !== null);
    if (el) el.scrollIntoView({ block: b });
  }, [sel, block]);
  await wait(page, 500);
}

/** Bildausschnitt eines Elements (mit Rand) — für Modale und einzelne Karten. */
async function clipOf(page, sel, pad = 0) {
  return page.evaluate(([s, p]) => {
    const el = [...document.querySelectorAll(s)].find(e => e.offsetParent !== null);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.max(0, b.x - p), y: Math.max(0, b.y - p), width: b.width + 2 * p, height: b.height + 2 * p };
  }, [sel, pad]);
}

/* ── Screenshot + Markierungen ───────────────────────────────────────────────────────────
   Jede Markierung wird im Browser vermessen und als Prozentwert relativ zum Bildausschnitt
   in meta.json geschrieben; die Builder legen Badges/Chips/Rahmen später als HTML darüber. */
const META = fs.existsSync('meta.json') ? JSON.parse(fs.readFileSync('meta.json', 'utf8')) : {};

async function shot(page, name, { clip = null, marks = [], noScroll = false } = {}) {
  fs.mkdirSync('shots', { recursive: true });
  await hideBadge(page);
  await mask(page);
  if (!noScroll) { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(150); }
  // Zweiter Durchlauf: Zellen, die nach dem ersten Maskieren noch nachgeladen wurden
  // (Kundennamen aus Phorest, Livewire-Nachrender), sonst stehen sie unmaskiert im Bild.
  await page.waitForTimeout(400);
  await mask(page);
  const vp = page.viewportSize();
  const box = clip || { x: 0, y: 0, width: vp.width, height: vp.height };
  const resolved = [];
  for (const m of marks) {
    let r = m.rect;
    if (m.sel) r = await page.evaluate((sel) => {
      const el = [...document.querySelectorAll(sel)].find(e => e.offsetParent !== null);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    }, m.sel);
    if (m.fn) r = await page.evaluate(m.fn, m.fnArg ?? null);
    if (!r) { console.log('MARK FEHLT:', name, m.id || m.sel || m.n); continue; }
    resolved.push({ ...m, fn: undefined, fnArg: undefined, sel: undefined, pct: {
      x: (r.x - box.x) / box.width * 100,
      y: (r.y - box.y) / box.height * 100,
      w: r.w / box.width * 100,
      h: r.h / box.height * 100,
    }});
  }
  await page.screenshot({ path: `shots/${name}.png`, clip: box });
  META[name] = { box, marks: resolved, ratio: box.height / box.width };
  fs.writeFileSync('meta.json', JSON.stringify(META, null, 1));
  console.log('shot', name, JSON.stringify(box));
}

module.exports = { requireEnv, fail, launch, login, goto, wait, shot, clipOf, scrollTo, byText, clickText, hideBadge, mask, BASE };
