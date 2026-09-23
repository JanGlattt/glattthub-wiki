/* Aufnahme-Bausteine für ALLE Klickanleitungen-Serien: Browser starten, anmelden, maskieren,
   Screenshot mit Markierungen ablegen. Serien-Eigenheiten (welche Seite, welcher Reiter)
   gehören in `scripts/lib.cjs` der jeweiligen Serie, nicht hierher.

   In dieser Datei stehen NIE Zugangsdaten oder echte Personendaten — das Wiki-Repo ist
   öffentlich. Zugang kommt aus der Umgebung (`.env`), die Maskierung aus `mask.json`.
   Beide sind gitignored; Vorlagen liegen je Serie als `.env.example` / `mask.example.json`. */
const { chromium } = require('playwright');
const fs = require('fs');
const iap = require('./iap.cjs');   // Google IAP vor den Hub-Domains passieren (Dienstkonto-Token)

const BASE = process.env.KLICK_BASE || '';
const CREDS = [process.env.KLICK_USER || '', process.env.KLICK_PW || ''];
// Anmeldung per PIN (Institute-Konto, z. B. auf Prod nur lesend) statt E-Mail/Passwort
const PIN = process.env.KLICK_PIN || '';
// Aufnahmeformat: Laptop 1440 × 900 (seit 18.09.2026; vorher iPad quer 1180 × 820).
// Die Terminansicht bleibt bewusst im iPad-Format — sie hat ihre eigene lib.
const VIEWPORT = (() => {
  const m = /^(\d+)x(\d+)$/.exec(process.env.KLICK_VIEWPORT || '');
  return m ? { width: +m[1], height: +m[2] } : { width: 1440, height: 900 };
})();
// Sitzung je Umgebung zwischenspeichern — Staging und Prod nebeneinander ohne Verwechslung
const STATE = 'state.' + (BASE.replace(/^https?:\/\//, '').split(/[./]/)[0] || 'lokal') + '.json';

function requireEnv(extra = []) {
  if (!BASE) fail('KLICK_BASE fehlt — Adresse der Umgebung setzen (siehe ../.env.example).');
  if (!PIN && (!CREDS[0] || !CREDS[1])) fail('KLICK_USER/KLICK_PW (oder KLICK_PIN) fehlen — Zugang als Umgebungsvariable setzen (siehe ../.env.example).');
  for (const [name, hint] of extra) if (!process.env[name]) fail(name + ' fehlt — ' + hint);
}
function fail(msg) { console.error(msg); process.exit(2); }

// Umgebungs-Plakette und den Auto-Logout-Balken ausblenden: beides lenkt in einer Anleitung ab
// Auch den Rundgang (driver.js) ausblenden: Auf Prod hat das Institute-Konto die Touren noch nicht
// gesehen, sonst läge „Die Kundenakte, Schritt 1 von 4" über jedem Bild.
const HIDE_CSS = '.env-badge{display:none!important}#auto-logout-progress,.countdown-bar-container{display:none!important}.driver-popover,.driver-overlay{display:none!important}.driver-active-element{box-shadow:none!important}';

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
    // Nur ganze Wörter treffen: die Regel „Gül" (ein Vorname) machte sonst aus „Gültigkeit" ein „Wagnertigkeit"
    for (let i = 0; i < froms.length; i += 4000) chunks.push(new RegExp('(?<![\\p{L}\\p{N}])(?:' + froms.slice(i, i + 4000).map(esc).join('|') + ')(?![\\p{L}\\p{N}])', 'gu'));
    const apply = (s) => { let out = String(s); for (const re of chunks) out = out.replace(re, (m) => map.get(m) ?? m); return out; };
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode())) {
      // Leerraum zusammenziehen: Templates verbinden Vor- und Nachname gern mit Umbruch/Einzug —
      // der Text „Nadin\n   Muster" träfe die Regel „Nadin Muster" sonst nie. Sichtbar ändert
      // sich nichts, HTML fasst Leerraum ohnehin zusammen (außer in pre/textarea, dort lassen).
      const pre = n.parentElement && /^(PRE|TEXTAREA|CODE)$/.test(n.parentElement.tagName);
      const base = pre ? n.nodeValue : n.nodeValue.replace(/[ \t\r\n ]{2,}/g, ' ');
      const v = apply(base); if (v !== base) n.nodeValue = v;
    }
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
    viewport: opts.viewport || VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: 'light',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    storageState: fs.existsSync(STATE) && !opts.fresh ? STATE : undefined,
    // IAP-Token für hub.glattt.com / staging.hub.glattt.com (lokal leer) — siehe iap.cjs
    extraHTTPHeaders: iap.headers(BASE),
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
    if (PIN) {
      // PIN-Anmeldung (#form-pin): Wert setzen und das Formular abschicken — onsubmit zeigt
      // den Lade-Schleier und ruft form.submit() selbst.
      await page.evaluate((pin) => {
        const set = (el, v) => {
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        const p = document.querySelector('#form-pin input[name="pin"]');
        set(p, pin);
        p.closest('form').requestSubmit();
      }, PIN);
    } else {
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
    }
    await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 20000 });
    await ctx.storageState({ path: STATE });
  }
}

/** Warten, bis Lade-Platzhalter und Spinner verschwunden sind (Kennzahlen-Zeile, Karten). */
async function waitLoaded(page, ms = 20000) {
  await page.waitForFunction(() => {
    const sichtbar = (el) => el.offsetParent !== null;
    return ![...document.querySelectorAll('.skeleton-glattt, .card-skeleton-glattt-plot, .stat-skeleton-glattt, .notifications-loading-spinner, .spinner-glattt, .loading-glattt')].some(sichtbar);
  }, null, { timeout: ms }).catch(() => console.log('Hinweis: Lade-Platzhalter blieben sichtbar'));
  await wait(page, 600);
}

/** Zum Element mit dieser Beschriftung scrollen, so dass es knapp unter dem Seitenkopf steht.
    `sel` grenzt ein (z. B. '.card-glattt-title, h2'); ohne Treffer bleibt die Seite, wo sie ist. */
async function scrollToText(page, sel, text, offset = 96) {
  const ok = await page.evaluate(({ sel, text, offset }) => {
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    const els = [...document.querySelectorAll(sel)].filter(e => e.offsetParent !== null);
    const el = els.find(e => norm(e.textContent).startsWith(text)) || els.find(e => norm(e.textContent).includes(text));
    if (!el) return false;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    return true;
  }, { sel, text, offset });
  if (!ok) console.log('ABSCHNITT FEHLT:', text);
  await wait(page, 700);
  return ok;
}

/** Bildausschnitt der Karte, die eine Beschriftung enthält (Kartenkopf → .card-glattt). */
async function cardClip(page, text, pad = 12) {
  return page.evaluate(({ text, pad }) => {
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    const els = [...document.querySelectorAll('.card-glattt-title, .card-glattt-header, h2, h3')].filter(e => e.offsetParent !== null);
    const el = els.find(e => norm(e.textContent).startsWith(text)) || els.find(e => norm(e.textContent).includes(text));
    const card = el && (el.closest('.card-glattt, .card-glattt-compact, .statistic-card-glattt, section') || el.parentElement);
    if (!card) return null;
    card.scrollIntoView({ block: 'center', behavior: 'instant' });
    const b = card.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    return { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(vw, b.width + 2 * pad), height: Math.min(vh - Math.max(0, b.y - pad), b.height + 2 * pad) };
  }, { text, pad });
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

module.exports = { requireEnv, fail, launch, login, goto, wait, waitLoaded, shot, clipOf, cardClip, scrollTo, scrollToText, byText, clickText, hideBadge, mask, BASE, VIEWPORT, STATE };
