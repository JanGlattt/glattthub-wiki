/* Klickanleitung bauen: deck.json (Struktur) + meta.json (Markierungen) + shots/*.png → HTML → PDF (A4 quer)
   Aufruf: node build.cjs <deck.json> [--html-only]                                                  */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const deckFile = process.argv[2];
const deck = JSON.parse(fs.readFileSync(deckFile, 'utf8'));
const meta = JSON.parse(fs.readFileSync(path.resolve(path.dirname(deckFile), deck.meta || '../meta.json'), 'utf8'));
const shotsDir = path.resolve(path.dirname(deckFile), deck.shots || '../shots');
const here = __dirname;
const b64 = (f, mime) => `data:${mime};base64,${fs.readFileSync(f).toString('base64')}`;
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/„(.+?)“/g, '„<span class="ui">$1“</span>'.replace('“</span>', '</span>“'));
const logo = b64(path.join(here, 'logo.png'), 'image/png');
const fontR = b64(path.join(here, 'Lato-Regular.woff2'), 'font/woff2');
const fontB = b64(path.join(here, 'Lato-Bold.woff2'), 'font/woff2');

// Screenshot als JPEG einbetten (sips für Kompression, falls vorhanden)
const imgCache = {};
function img(name) {
  if (imgCache[name]) return imgCache[name];
  const png = path.join(shotsDir, name + '.png');
  const jpg = path.join(shotsDir, name + '.jpg');
  if (!fs.existsSync(png)) { imgCache[name] = b64(jpg, 'image/jpeg'); return imgCache[name]; } // Wiki-Ablage: nur JPEG
  try {
    if (!fs.existsSync(jpg) || fs.statSync(jpg).mtimeMs < fs.statSync(png).mtimeMs) {
      require('child_process').execSync(`sips -s format jpeg -s formatOptions 84 "${png}" --out "${jpg}"`, { stdio: 'ignore' });
    }
    imgCache[name] = b64(jpg, 'image/jpeg');
  } catch (e) { imgCache[name] = b64(png, 'image/png'); }
  return imgCache[name];
}

/* Markierungen: meta.json liefert pct-Rechtecke je Screenshot; deck kann sie überschreiben/ergänzen.
   mark = { kind: 'badge'|'chip'|'frame', n, label, pct:{x,y,w,h}, at:'tl'|'tr'|'bl'|'br'|'l'|'r'|'t'|'b', color:'gold'|'teal', dx, dy } */
function shotHtml(name, marks, cls = '') {
  const m = meta[name];
  const list = (marks || (m ? m.marks : []) || []).map(k => {
    if (typeof k === 'string') { const found = (m?.marks || []).find(x => x.id === k); return found; }
    if (k.id && !k.pct) { const found = (m?.marks || []).find(x => x.id === k.id); return found ? { ...found, ...k } : null; }
    return k;
  }).filter(Boolean);
  const ratio = m ? m.ratio : 820 / 1180;
  let inner = `<img src="${img(name)}" alt="">`;
  for (const k of list) {
    const p = k.pct; const dx = k.dx || 0, dy = k.dy || 0;
    if (!p || p.w <= 0 || p.h <= 0 || p.y + p.h < 0 || p.y > 100 || p.x + p.w < 0 || p.x > 100) { console.log('Mark verworfen:', name, k.id || k.n); continue; }
    if (k.kind === 'frame') inner += `<div class="frame ${k.color || 'gold'}" style="left:${p.x - 0.6}%;top:${p.y - 0.8}%;width:${p.w + 1.2}%;height:${p.h + 1.6}%"></div>`;
    if (k.kind === 'badge') {
      const at = k.at || 'l';
      let x = p.x, y = p.y + p.h / 2; if (at === 'r') x = p.x + p.w; if (at === 'tl') { x = p.x; y = p.y; } if (at === 'tr') { x = p.x + p.w; y = p.y; } if (at === 't') { x = p.x + p.w/2; y = p.y; } if (at === 'b') { x = p.x + p.w/2; y = p.y + p.h; }
      inner += `<div class="badge" style="left:${x + dx}%;top:${y + dy}%">${k.n}</div>`;
    }
    if (k.kind === 'chip') {
      const side = k.at || 'l'; // Chip links/rechts/oben/unten vom Ziel, Pfeil zeigt zum Ziel
      let x = p.x, y = p.y + p.h / 2, arrow = 'arrow-r';
      if (side === 'l') { x = p.x - 1.5; arrow = 'arrow-r'; }
      if (side === 'r') { x = p.x + p.w + 1.5; arrow = 'arrow-l'; }
      if (side === 't') { x = p.x + p.w / 2; y = p.y - 2; arrow = 'arrow-d'; }
      if (side === 'b') { x = p.x + p.w / 2; y = p.y + p.h + 2; arrow = 'arrow-u'; }
      inner += `<div class="chip chip-${side} ${arrow}" style="left:${x + dx}%;top:${y + dy}%">${esc(k.label)}</div>`;
    }
  }
  return `<div class="shot ${cls}" style="--ratio:${ratio}">${inner}</div>`;
}

function stepsHtml(steps, cols = 2) {
  return `<div class="steps cols-${cols}">` + steps.map(s => `<div class="step"><div class="num">${s.n}</div><div><div class="t">${rich(s.title)}</div><div class="d">${rich(s.text)}</div></div></div>`).join('') + '</div>';
}
const hintHtml = (h) => h ? `<div class="hint ${h.kind || ''}"><span class="i">i</span><div>${rich(h.text)}</div></div>` : '';

function pageShell(body, n, N, extraCls = '') {
  return `<section class="page ${extraCls}">${body}<footer><span>glattt · Klickanleitung ${esc(deck.footerArea)}</span><span>Screenshots mit Beispieldaten · Stand ${esc(deck.stand)}</span><span>Seite ${n} von ${N}</span></footer></section>`;
}

const N = deck.pages.length + 1;
let html = '';
// Cover
html += pageShell(`
  <div class="cover-bar"></div>
  <div class="cover">
    <img class="cover-logo" src="${logo}" alt="glattt">
    <h1>${deck.title.map(esc).join('<br>')}</h1>
    <p class="sub">${rich(deck.subtitle)}</p>
    <div class="cards">${deck.pages.filter(p => p.card !== false).map((p, i) => `<div class="card"><div class="cnum ${p.accent || ''}">${i + 1}</div><div class="ct">${esc(p.card?.title || p.h1)}</div><div class="cd">${rich(p.card?.text || p.sub || '')}</div></div>`).join('')}</div>
    <div class="notes">${(deck.notes || []).map(n => `<div>▸ ${rich(n)}</div>`).join('')}</div>
  </div>`, 1, N, 'is-cover');

deck.pages.forEach((p, i) => {
  const vorgang = p.vorgang || (i + 1);
  const left = p.left ? shotHtml(p.left.shot, p.left.marks, p.left.cls || '') : '';
  const right = p.right ? shotHtml(p.right.shot, p.right.marks, p.right.cls || '') : '';
  let body = `<header><img class="logo" src="${logo}" alt=""><div class="hd"><div class="eyebrow">${esc(deck.eyebrow)}</div><h1>${esc(p.h1)}</h1><div class="sub">${rich(p.sub || '')}</div></div><div class="vorgang"><div class="vl">Vorgang</div><div class="vn">${vorgang}<span>/ ${p.vorgangOf || deck.pages.filter(x => x.card !== false).length}</span></div></div></header><hr class="gold">`;
  if (p.layout === 'grid') {
    body += `<div class="grid3">${(p.tiles || []).map(t => `<div class="tile">${shotHtml(t.shot, t.marks, 'tile-shot')}<div class="tile-t"><b>${esc(t.title)}</b> — ${rich(t.text)}</div></div>`).join('')}</div>`;
  } else if (p.layout === 'text') {
    body += `<div class="textcols">${p.html || ''}</div>`;
  } else {
    body += `<div class="two"><div class="col">${left}${p.leftCaption ? `<div class="cap">${rich(p.leftCaption)}</div>` : ''}${p.steps ? stepsHtml(p.steps, p.stepCols || 2) : ''}${hintHtml(p.hint)}</div><div class="col">${right}${p.rightCaption ? `<div class="cap">${rich(p.rightCaption)}</div>` : ''}${p.rightSteps ? stepsHtml(p.rightSteps, 1) : ''}${p.rightHint ? hintHtml(p.rightHint) : ''}${p.rightHtml || ''}</div></div>`;
  }
  html += pageShell(body, i + 2, N);
});

const css = fs.readFileSync(path.join(here, 'style.css'), 'utf8').replace('__FONT_R__', fontR).replace('__FONT_B__', fontB);
const doc = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><title>${esc(deck.title.join(' '))}</title><style>${css}</style></head><body>${html}</body></html>`;
const outBase = path.resolve(path.dirname(deckFile), deck.out || 'anleitung');
fs.mkdirSync(path.dirname(outBase), { recursive: true });
fs.writeFileSync(outBase + '.html', doc);
console.log('HTML', outBase + '.html', (doc.length / 1048576).toFixed(1), 'MB');
if (process.argv.includes('--html-only')) process.exit(0);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + outBase + '.html', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.pdf({ path: outBase + '.pdf', format: 'A4', landscape: true, printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 }, preferCSSPageSize: true });
  await browser.close();
  console.log('PDF', outBase + '.pdf');
})();
