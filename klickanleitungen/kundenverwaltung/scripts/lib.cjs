/* Gemeinsame Bausteine der Aufnahmeskripte „Kundenverwaltung".
   Zugang, Kunde und Maskierung kommen aus der Umgebung bzw. aus mask.json — in dieser Datei
   stehen NIE Zugangsdaten oder echte Kundendaten, das Wiki-Repo ist oeffentlich.
   Vorlagen: ../.env.example und ../mask.example.json, Aufruf ueber run-all.sh.            */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.KLICK_BASE || '';
const CLIENT = process.env.KLICK_CLIENT || '';      // Phorest-Client-ID der aufgenommenen Kundin
const CONTRACT = process.env.KLICK_CONTRACT || '';  // Vertrags-ID fuer die Zahlungsstand-Seite (Dok L)
const CREDS = [process.env.KLICK_USER || '', process.env.KLICK_PW || ''];

if (!BASE) { console.error('KLICK_BASE fehlt — Adresse der Umgebung setzen (siehe ../.env.example).'); process.exit(2); }
if (!CREDS[0] || !CREDS[1]) { console.error('KLICK_USER/KLICK_PW fehlen — Zugang als Umgebungsvariable setzen (siehe ../.env.example).'); process.exit(2); }
if (!CLIENT) { console.error('KLICK_CLIENT fehlt — Phorest-Client-ID aus der URL /hub/clients/<ID> setzen.'); process.exit(2); }

const HIDE_CSS = '.env-badge{display:none!important}';

/* ── Maskierung ──────────────────────────────────────────────────────────────────────────
   Aufgenommen wird eine ECHTE Kundin (Entscheidung Jan 15.09.2026) — Struktur und Fuellstand
   der Karten sind sonst nicht darstellbar. Alles Personenbezogene wird deshalb VOR jedem
   Screenshot im DOM ersetzt: Name, Kontakt, Adresse, Geburtsdatum, IBAN, Mandatsreferenz,
   Vertrags- und Kundennummer sowie die Texte der WhatsApp- und Ticket-Verlaeufe.
   Die Zuordnung echt → Beispiel steht in mask.json (gitignored) und bleibt lokal.       */
const MASK_FILE = 'mask.json';
if (!fs.existsSync(MASK_FILE)) {
  console.error('mask.json fehlt — Kopie von mask.example.json anlegen und mit den echten Werten der aufgenommenen Kundin fuellen.');
  console.error('Ohne Maskierung wird NICHT aufgenommen: Die Screenshots landen im oeffentlichen Wiki-Repo.');
  process.exit(2);
}
const MASKCFG = JSON.parse(fs.readFileSync(MASK_FILE, 'utf8'));
const RULES = (MASKCFG.replace || []).map(([from, to]) => [from, to]);
/* Ganze Nachrichtenbloecke ersetzen: WhatsApp-Blasen und Ticket-Kommentare enthalten
   Freitext, der sich nicht mit einer Wortliste faengt. Die Selektoren stehen in mask.json
   unter "blankText"; ihr Inhalt wird durch Beispielsaetze aus "sampleTexts" ersetzt.    */
const BLANK = MASKCFG.blankText || [];
const SAMPLES = MASKCFG.sampleTexts || [];

async function mask(page) {
  await page.evaluate(({ rules, blank, samples }) => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode())) {
      for (const [from, to] of rules) if (n.nodeValue.includes(from)) n.nodeValue = n.nodeValue.split(from).join(to);
    }
    document.querySelectorAll('input, textarea').forEach(el => {
      for (const [from, to] of rules) if (String(el.value).includes(from)) el.value = String(el.value).split(from).join(to);
    });
    document.querySelectorAll('[title], [alt], [aria-label]').forEach(el => {
      for (const [from, to] of rules) {
        if (el.title?.includes(from)) el.title = el.title.split(from).join(to);
        if (el.alt?.includes(from)) el.alt = el.alt.split(from).join(to);
      }
    });
    // Freitext-Blöcke durch Beispielsätze ersetzen (reihum, damit es nach Gespräch aussieht)
    let i = 0;
    for (const sel of blank) {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.textContent.trim()) return;
        el.textContent = samples.length ? samples[i++ % samples.length] : '…';
      });
    }
  }, { rules: RULES, blank: BLANK, samples: SAMPLES });
}

/* ── Browser & Anmeldung ─────────────────────────────────────────────────────────────── */
async function launch(opts = {}) {
  const browser = await chromium.launch({
    headless: opts.headless !== false,
    // Ohne diese Flags verhungert requestAnimationFrame headless (siehe Wiki KLICKANLEITUNGEN.md)
    args: ['--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  });
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 1180, height: 820 },   // iPad quer, wie Dokumente A–H
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
  await page.addInitScript(() => {
    // Alpine-Wurzel der Kundendetailseite: window.C() liefert den Komponenten-Scope
    window.C = () => Alpine.$data(document.querySelector('[x-data^="clientDetailPage"]'));
  });
  page.on('pageerror', e => console.log('JS-FEHLER:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text().slice(0, 200)); });
  return { browser, ctx, page };
}

async function hideBadge(page) { try { await page.addStyleTag({ content: HIDE_CSS }); } catch (e) {} }

async function login(page, ctx) {
  await page.goto(BASE + '/hub', { waitUntil: 'domcontentloaded' });
  if (page.url().includes('/login')) {
    // Die Login-Seite hat ZWEI Formulare (#form-pin zuerst) — immer ueber das E-Mail-Feld greifen
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

/** Kundenprofil oeffnen und auf geladene Seite warten. */
async function openClient(page, ms = 2500) {
  await goto(page, '/hub/clients/' + CLIENT, 1000);
  await page.waitForFunction(() => window.C && window.C() && window.C().loading === false, null, { timeout: 30000 });
  await wait(page, ms);
}

/** Reiter der Kundendetailseite ueber die Beschriftung waehlen (wie die Mitarbeiterin auch). */
async function tab(page, name, ms = 2500) {
  const ok = await page.evaluate((n) => {
    const b = [...document.querySelectorAll('.tabs-glattt-sidebar .tab-glattt-sidebar')]
      .filter(e => e.offsetParent !== null)
      .find(e => e.textContent.trim() === n);
    if (!b) return false;
    b.click();
    return true;
  }, name);
  if (!ok) { console.log('REITER FEHLT:', name, '— Recht fehlt oder Beschriftung geaendert?'); return false; }
  await wait(page, ms);
  return true;
}

/** Sichtbares Element per Beschriftung finden (Knoepfe, Ueberschriften) — liefert einen Selektor-Ersatz
    fuer shot(): { fn } misst das Element direkt im Browser. */
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

/** Sichtbares Element per Beschriftung anklicken. */
async function clickText(page, sel, text, ms = 1200) {
  const ok = await page.evaluate((arg) => {
    const el = [...document.querySelectorAll(arg.sel)]
      .filter(e => e.offsetParent !== null)
      .find(e => e.textContent.trim().startsWith(arg.text));
    if (!el) return false;
    el.click();          // bei „element not stable" immer ueber evaluate klicken
    return true;
  }, { sel, text });
  if (!ok) { console.log('KNOPF FEHLT:', sel, text); return false; }
  await wait(page, ms);
  return true;
}

/* ── Screenshot + Markierungen ───────────────────────────────────────────────────────────
   Jede Markierung wird im Browser vermessen und als Prozentwert relativ zum Bildausschnitt
   in meta.json geschrieben; build.cjs legt Badges/Chips/Rahmen spaeter als HTML darueber.  */
const META = fs.existsSync('meta.json') ? JSON.parse(fs.readFileSync('meta.json', 'utf8')) : {};

async function shot(page, name, { clip = null, marks = [], noScroll = false } = {}) {
  fs.mkdirSync('shots', { recursive: true });
  await hideBadge(page);
  await mask(page);
  if (!noScroll) {
    await page.evaluate(() => { window.scrollTo(0, 0); });
    await page.waitForTimeout(150);
  }
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

/** Bildausschnitt eines Elements (mit Rand) — fuer Modale und einzelne Karten. */
async function clipOf(page, sel, pad = 0) {
  return page.evaluate(([s, p]) => {
    const el = [...document.querySelectorAll(s)].find(e => e.offsetParent !== null);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.max(0, b.x - p), y: Math.max(0, b.y - p), width: b.width + 2 * p, height: b.height + 2 * p };
  }, [sel, pad]);
}

/** Innerhalb der Reiter-Inhaltsspalte scrollen (die Seite selbst scrollt im Fenster). */
async function scrollTo(page, sel, block = 'center') {
  await page.evaluate(([s, b]) => {
    const el = [...document.querySelectorAll(s)].find(e => e.offsetParent !== null);
    if (el) el.scrollIntoView({ block: b });
  }, [sel, block]);
  await wait(page, 500);
}

module.exports = { launch, login, goto, openClient, tab, clickText, byText, wait, shot, clipOf, scrollTo, hideBadge, mask, BASE, CLIENT, CONTRACT };
