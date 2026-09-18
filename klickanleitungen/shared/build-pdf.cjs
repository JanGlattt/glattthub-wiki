/* Klickanleitung als PDF (A4 quer): deck.json + meta.json + shots/*.png → HTML → PDF
   Aufruf:  node shared/build-pdf.cjs <deck.json> [--html-only]
   Ausgabe: der im Deck unter `out` angegebene Pfad (relativ zum Deck).                       */
const fs = require('fs');
const path = require('path');
const D = require('./lib/deck.cjs');

const deckFile = process.argv[2];
if (!deckFile) { console.error('Aufruf: node build-pdf.cjs <deck.json> [--html-only]'); process.exit(2); }
const { deck, meta, shotsDir } = D.load(deckFile);
const here = __dirname;
const assets = path.join(here, 'assets');
const b64 = (f, mime) => `data:${mime};base64,${fs.readFileSync(f).toString('base64')}`;

const logo = b64(path.join(assets, 'logo.png'), 'image/png');
const fontR = b64(path.join(assets, 'Lato-Regular.woff2'), 'font/woff2');
const fontB = b64(path.join(assets, 'Lato-Bold.woff2'), 'font/woff2');

/* Screenshot als JPEG einbetten (sips komprimiert, gibt es nur auf macOS). Fehlt das Bild,
   bricht der Bau nicht ab, sondern zeigt einen Platzhalter — so laesst sich ein Deck auch vor
   dem Aufnahmelauf bauen und der fehlende Shot springt im PDF ins Auge. */
const imgCache = {};
function img(name) {
  if (imgCache[name]) return imgCache[name];
  const png = path.join(shotsDir, name + '.png');
  const jpg = path.join(shotsDir, name + '.jpg');
  if (!fs.existsSync(png) && !fs.existsSync(jpg)) {
    console.log('SCREENSHOT FEHLT:', name, '— Platzhalter eingesetzt (Aufnahmelauf noch nicht gelaufen?)');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1180 820"><rect width="1180" height="820" fill="#f3f4f6"/><text x="590" y="400" text-anchor="middle" font-family="Helvetica" font-size="34" fill="#9ca3af">Screenshot fehlt: ${name}</text><text x="590" y="450" text-anchor="middle" font-family="Helvetica" font-size="22" fill="#b91c1c">Aufnahmelauf noch nicht gelaufen</text></svg>`;
    imgCache[name] = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
    return imgCache[name];
  }
  if (!fs.existsSync(png)) { imgCache[name] = b64(jpg, 'image/jpeg'); return imgCache[name]; }
  // Auf Linux (Cloud Build) gibt es kein sips — dann komprimiert sharp, sonst bliebe das PNG
  // unkomprimiert im HTML (2360 px breit, mehrere MB je Bild).
  const jpgOut = process.env.PDF_JPG_DIR ? path.join(process.env.PDF_JPG_DIR, name + '.jpg') : jpg;
  try {
    if (!fs.existsSync(jpgOut) || fs.statSync(jpgOut).mtimeMs < fs.statSync(png).mtimeMs) {
      fs.mkdirSync(path.dirname(jpgOut), { recursive: true });
      try {
        require('child_process').execSync(`sips -s format jpeg -s formatOptions 84 "${png}" --out "${jpgOut}"`, { stdio: 'ignore' });
      } catch (e) {
        const sharp = require('sharp');
        const buf = require('child_process').execFileSync(process.execPath, ['-e',
          `require('sharp')(process.argv[1]).jpeg({quality:84}).toFile(process.argv[2]).then(()=>{})`, png, jpgOut], { stdio: 'ignore' });
        void sharp; void buf;
      }
    }
    imgCache[name] = b64(jpgOut, 'image/jpeg');
  } catch (e) { imgCache[name] = b64(png, 'image/png'); }
  return imgCache[name];
}

const shot = (name, marks, cls = '') => D.shotHtml(meta, name, marks, img, cls, m => console.log(m));

function pageShell(body, n, N, extraCls = '') {
  return `<section class="page ${extraCls}">${body}<footer>`
    + `<span>glattt · Klickanleitung ${D.esc(deck.footerArea)}</span>`
    + `<span>Screenshots mit Beispieldaten · Stand ${D.esc(deck.stand)}${deck.version ? ' · v' + D.esc(deck.version) : ''}</span>`
    + `<span>Seite ${n} von ${N}</span></footer></section>`;
}

const cardPages = deck.pages.filter(p => p.card !== false);
const N = deck.pages.length + 1;
let html = pageShell(`
  <div class="cover-bar"></div>
  <div class="cover">
    <img class="cover-logo" src="${logo}" alt="glattt">
    ${deck.kicker ? `<div class="cover-kicker">${D.esc(deck.kicker)}</div>` : ''}
    <h1>${deck.title.map(D.esc).join('<br>')}</h1>
    ${deck.audienceLabel ? `<div class="cover-audience">${D.esc(deck.audienceLabel)}</div>` : ''}
    ${deck.hinweis ? `<div class="cover-hinweis">${D.esc(deck.hinweis)}</div>` : ''}
    <p class="sub">${D.rich(deck.subtitle)}</p>
    <div class="cards n${cardPages.length}">${cardPages.map((p, i) =>
      `<div class="card"><div class="cnum ${p.accent || ''}">${i + 1}</div>`
      + `<div class="ct">${D.esc(p.card?.title || p.h1)}</div>`
      + `<div class="cd">${D.rich(p.card?.text || p.sub || '')}</div></div>`).join('')}</div>
    <div class="notes">${(deck.notes || []).map(n => `<div>▸ ${D.rich(n)}</div>`).join('')}</div>
  </div>`, 1, N, 'is-cover');

deck.pages.forEach((p, i) => {
  const header = `<header><img class="logo" src="${logo}" alt="">`
    + `<div class="hd"><div class="eyebrow">${D.esc(deck.eyebrowFull || deck.eyebrow)}</div><h1>${D.esc(p.h1)}</h1>`
    + `<div class="sub">${D.rich(p.sub || '')}</div></div>`
    + `<div class="vorgang"><div class="vl">Vorgang</div><div class="vn">${p.vorgang}`
    + `<span>/ ${p.vorgangOf || cardPages.length}</span></div></div></header><hr class="gold">`;

  let body = header;
  if (p.layout === 'grid') {
    body += `<div class="grid3">${(p.tiles || []).map(t =>
      `<div class="tile">${shot(t.shot, t.marks, 'tile-shot')}<div class="tile-t"><b>${D.esc(t.title)}</b> — ${D.rich(t.text)}</div></div>`).join('')}</div>`;
  } else if (p.layout === 'text' || (!p.left && !p.right)) {
    body += `<div class="textcols">${D.bodyBlocks(p).join('')}${p.steps ? D.stepsHtml(p.steps, p.stepCols || 2) : ''}${D.hintHtml(p.hint)}</div>`;
  } else {
    const left = p.left ? shot(p.left.shot, p.left.marks, p.left.cls || '') : '';
    const right = p.right ? shot(p.right.shot, p.right.marks, p.right.cls || '') : '';
    body += `<div class="two"><div class="col">${left}`
      + `${p.leftCaption ? `<div class="cap">${D.rich(p.leftCaption)}</div>` : ''}`
      + `${p.steps ? D.stepsHtml(p.steps, p.stepCols || 2) : ''}${D.hintHtml(p.hint)}</div>`
      + `<div class="col">${right}`
      + `${p.rightCaption ? `<div class="cap">${D.rich(p.rightCaption)}</div>` : ''}`
      + `${p.rightSteps ? D.stepsHtml(p.rightSteps, 1) : ''}`
      + `${D.bodyBlocks(p).join('')}`
      + `${p.notes ? D.notesHtml(p.notes) : ''}`
      + `${p.rightHint ? D.hintHtml(p.rightHint) : ''}`
      + `${p.rightHtml || ''}</div></div>`;
  }
  html += pageShell(body, i + 2, N);
});

const css = fs.readFileSync(path.join(assets, 'pdf.css'), 'utf8').replace('__FONT_R__', fontR).replace('__FONT_B__', fontB);
const doc = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><title>${D.esc(deck.title.join(' '))}</title><style>${css}</style></head><body>${html}</body></html>`;
const outBase = path.resolve(path.dirname(deckFile), deck.out || 'anleitung');
fs.mkdirSync(path.dirname(outBase), { recursive: true });
fs.writeFileSync(outBase + '.html', doc);
console.log('HTML', outBase + '.html', (doc.length / 1048576).toFixed(1), 'MB');
if (process.argv.includes('--html-only')) process.exit(0);

(async () => {
  // CHROME_PATH: fuer Umgebungen mit vorinstalliertem Chromium, lokal leer lassen
  const { chromium } = require('playwright');
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await browser.newPage();
  await page.goto('file://' + outBase + '.html', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.pdf({ path: outBase + '.pdf', format: 'A4', landscape: true, printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 }, preferCSSPageSize: true });
  await browser.close();
  console.log('PDF', outBase + '.pdf');
})();
