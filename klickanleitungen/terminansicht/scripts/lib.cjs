const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'https://glattthub-web-staging-cvznpz7gha-ey.a.run.app';
const MD = 'KrzIg1nVrQ3kpKzkTgQlzA';
const APT = 'xgvLJ8ZPztgA7kAVNEQZ9fnYVQwcfZ9GOXqyGMxZkNM'; // BG 09.09. 09:00
const CREDS = ['claude-dev@example.com', 'klick-anleitung-2026'];
const HIDE_CSS = '.env-badge{display:none!important}';

async function launch(opts = {}) {
  const browser = await chromium.launch({ headless: opts.headless !== false, args: ['--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--disable-features=CalculateNativeWinOcclusion'] });
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1180, height: 820 }, deviceScaleFactor: 2, colorScheme: 'light', locale: 'de-DE', timezoneId: 'Europe/Berlin', storageState: fs.existsSync('state.json') && !opts.fresh ? 'state.json' : undefined });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem('glattthub-theme','light'); localStorage.setItem('bertGreetingShown', new Date().toISOString().slice(0,10)); } catch(e){} });
  await page.addInitScript(() => { window.S = () => Alpine.$data(document.querySelector('.apt-detail')); window.F = () => Alpine.$data(document.querySelector('[x-data^="formFill"]')); window.T = () => Alpine.$data(document.querySelector('[x-data^="treatmentSettings"]')); });
  page.on('pageerror', e => console.log('JS-FEHLER:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text().slice(0, 200)); });
  return { browser, ctx, page };
}
async function hideBadge(page) { try { await page.addStyleTag({ content: HIDE_CSS }); } catch (e) {} }
async function login(page, ctx) {
  await page.goto(BASE + '/hub', { waitUntil: 'domcontentloaded' });
  if (page.url().includes('/login')) {
    await page.evaluate(([email, pw]) => {
      const set = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el, v); el.dispatchEvent(new Event('input',{bubbles:true})); };
      const e = document.querySelector('input[name="email"]'); set(e, email);
      set(e.closest('form').querySelector('input[name="password"]'), pw);
      e.closest('form').requestSubmit();
    }, CREDS);
    await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 20000 });
    await ctx.storageState({ path: 'state.json' });
  }
}
const wait = (page, ms) => page.waitForTimeout(ms);
async function goto(page, path, ms = 2500) { await page.goto(BASE + path, { waitUntil: 'domcontentloaded' }); await hideBadge(page); await wait(page, ms); }
// Screenshot + Markierungen (Prozentkoordinaten relativ zum Bildausschnitt) in meta.json sammeln
const META = fs.existsSync('meta.json') ? JSON.parse(fs.readFileSync('meta.json','utf8')) : {};
// Kontaktdaten des Testkunden maskieren (Text-Knoten + Input-Werte), Seite nach oben scrollen
const MASK = [[/lescules@hotmail\.de/gi, 'kundin@beispiel.de'], [/4945154615315641|\+?49\s?4515\s?4615\s?3156\s?41/g, '0151 23456789']];
async function mask(page) {
  await page.evaluate((rules) => {
    const rx = rules.map(([r, v]) => [new RegExp(r[0], r[1]), v]);
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = walk.nextNode())) { for (const [r, v] of rx) if (r.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(r, v); }
    document.querySelectorAll('input, textarea').forEach(el => { for (const [r, v] of rx) if (r.test(el.value)) { el.value = el.value.replace(r, v); } });
    document.querySelectorAll('a[href^="mailto:"],a[href^="tel:"],[title]').forEach(el => { for (const [r, v] of rx) { if (el.title) el.title = el.title.replace(r, v); } });
  }, MASK.map(([r, v]) => [[r.source, r.flags], v]));
}
async function shot(page, name, { clip = null, marks = [], noScroll = false } = {}) {
  fs.mkdirSync('shots', { recursive: true });
  await hideBadge(page);
  await mask(page);
  if (!noScroll) { await page.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('.apt-detail-panel').forEach(p => { p.scrollTop = 0; }); }); await page.waitForTimeout(150); }
  const vp = page.viewportSize();
  const box = clip || { x: 0, y: 0, width: vp.width, height: vp.height };
  const resolved = [];
  for (const m of marks) {
    let r = m.rect;
    if (m.sel) r = await page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }, m.sel);
    if (m.fn) r = await page.evaluate(m.fn, m.fnArg ?? null);
    if (!r) { console.log('MARK FEHLT:', name, m.sel || m.n); continue; }
    resolved.push({ ...m, fn: undefined, fnArg: undefined, pct: { x: (r.x - box.x) / box.width * 100, y: (r.y - box.y) / box.height * 100, w: r.w / box.width * 100, h: r.h / box.height * 100 } });
  }
  await page.screenshot({ path: `shots/${name}.png`, clip: box });
  META[name] = { box, marks: resolved, ratio: box.height / box.width };
  fs.writeFileSync('meta.json', JSON.stringify(META, null, 1));
  console.log('shot', name, JSON.stringify(box));
}
async function clipOf(page, sel, pad = 0) { return page.evaluate(([s, p]) => { const el = document.querySelector(s); if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.max(0, b.x - p), y: Math.max(0, b.y - p), width: b.width + 2*p, height: b.height + 2*p }; }, [sel, pad]); }
async function unified(page, fn) { return page.evaluate(fn, null); }
module.exports = { launch, login, goto, wait, shot, clipOf, hideBadge, mask, BASE, MD, APT };
