/* Klickanleitungen fürs Portal hilfe.hub.glattt.com: dasselbe Deck wie im PDF, andere Ausgabe.
   Aufruf:  WEB_OUT=portal/dist node shared/build-web.cjs <deck.json> [<deck.json> …]
   Ausgabe (WEB_OUT, sonst `web/` neben den Decks der ersten Serie):

     index.html                 Startseite: Suche, Zielgruppen-Filter, alle Serien
     <serie>/index.html         Übersicht einer Serie
     <serie>/<nr>/index.html    eine Anleitung — Viewer: Vorgang für Vorgang, Schritte ↔ Markierungen
     shots/<name>.webp          Screenshots, per sharp verkleinert und nach WebP gewandelt
     assets/                    portal.css, portal.js, suche.js, suche-kern.js, minisearch.js, Logo, Lato
     manifest.json              alles strukturiert — Grundlage für build-search.cjs (Suchindex)
     404.html                   Fehlerseite des Portal-Servers
     md/<slug>.md               nur mit WEB_MD=1: Markdown mit HTML-Blöcken (MkDocs-Ziel)

   Adressen folgen der Benennung „Serie + Nummer": /grundlagen/6/ ist „Grundlagen 6". So kann der
   Hub aus seiner Abdeckungsliste (.github/klickanleitungen-abdeckung.json) direkt verlinken.
   Ins Deck gehört nie Layout — nur Inhalt. Alles Sichtbare hier entsteht aus den Feldern.        */
const fs = require('fs');
const path = require('path');
const D = require('./lib/deck.cjs');
let sharp = null;
try { sharp = require('sharp'); } catch (e) { console.log('Hinweis: sharp fehlt (npm install) — Screenshots werden unverändert kopiert.'); }

const deckFiles = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!deckFiles.length) { console.error('Aufruf: WEB_OUT=<ordner> node build-web.cjs <deck.json> [...]'); process.exit(2); }

const outRoot = process.env.WEB_OUT
  ? path.resolve(process.env.WEB_OUT)
  : path.resolve(path.dirname(deckFiles[0]), '../web');
const assetsOut = path.join(outRoot, 'assets');
const shotsOut = path.join(outRoot, 'shots');
fs.mkdirSync(assetsOut, { recursive: true });
fs.mkdirSync(shotsOut, { recursive: true });

// Gestaltung und Skripte des Portals — eine Kopie je Build, keine Abhängigkeit zur Laufzeit
for (const f of ['portal.css', 'portal.js', 'suche.js', 'suche-kern.js', 'logo.png', 'icon.png', 'Lato-Regular.woff2', 'Lato-Bold.woff2']) {
  fs.copyFileSync(path.join(__dirname, 'assets', f), path.join(assetsOut, f));
}
const miniSearch = path.join(__dirname, '..', 'node_modules', 'minisearch', 'dist', 'umd', 'index.js');
if (fs.existsSync(miniSearch)) fs.copyFileSync(miniSearch, path.join(assetsOut, 'minisearch.js'));
else console.log('Hinweis: minisearch fehlt (npm install) — die Suche im Portal bleibt stumm.');

/* Lesereihenfolge der Serien — erst die tägliche Arbeit, dann Büro, dann Verwaltung.
   Was hier nicht steht, hängt alphabetisch hinten dran. */
const SERIEN = ['Grundlagen', 'Terminansicht', 'Kundenverwaltung', 'Bonus-Board', 'Verkauf',
  'Verträge', 'Widerrufe', 'Forderungen', 'Betrieb', 'Laser', 'Team', 'Finanzen', 'System', 'Berichte', 'Admin'];
const rang = (n) => { const i = SERIEN.indexOf(n); return i === -1 ? SERIEN.length : i; };
const serieSlug = (s) => D.slugify(s || 'weitere');
// Erklärtexte und Suchbegriffe je Serie (shared/serien.json) — Übersichtsseite, Startseite, Manifest, Suche
const SERIEN_INFO = JSON.parse(fs.readFileSync(path.join(__dirname, 'serien.json'), 'utf8')).serien || {};
const serieInfo = (name) => SERIEN_INFO[name] || {};
const AUDIENCES = [['institut', 'Institut'], ['buero', 'Büro'], ['leitung', 'Leitung'], ['admin', 'Admin']];

const ICON = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  sun: '<svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M12 12v6M9 15l3 3 3-3"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
};

/* ---------- Screenshots: WebP mit Maßen ---------- */
const imgInfo = new Map();
async function prepareShot(shotsDir, name) {
  if (imgInfo.has(name)) return imgInfo.get(name);
  const png = path.join(shotsDir, name + '.png');
  const jpg = path.join(shotsDir, name + '.jpg');
  const src = fs.existsSync(png) ? png : fs.existsSync(jpg) ? jpg : null;
  if (!src) { imgInfo.set(name, null); return null; }
  let info;
  if (sharp) {
    const out = path.join(shotsOut, name + '.webp');
    if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < fs.statSync(src).mtimeMs) {
      await sharp(src).resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
    }
    const m = await sharp(out).metadata();
    info = { src: '/shots/' + name + '.webp', w: m.width, h: m.height };
  } else {
    const ext = path.extname(src);
    fs.copyFileSync(src, path.join(shotsOut, name + ext));
    info = { src: '/shots/' + name + ext, w: 1180, h: 820 };
  }
  imgInfo.set(name, info);
  return info;
}
const shotNames = (deck) => {
  const names = new Set();
  for (const p of deck.pages) {
    if (p.left) names.add(p.left.shot);
    if (p.right) names.add(p.right.shot);
    for (const t of (p.tiles || [])) names.add(t.shot);
  }
  return [...names];
};

/* ---------- Gemeinsamer Rahmen ---------- */
function shell({ title, body, nav, bodyClass = '' }) {
  return `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${D.esc(title)} · glatttHub Nutzerhandbuch</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" href="/assets/icon.png">
<link rel="stylesheet" href="/assets/portal.css">
<script>try{var t=localStorage.getItem('portal-theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;}}catch(e){}</script>
</head><body class="portal ${bodyClass}">
<a class="skip" href="#inhalt">Zum Inhalt springen</a>
<header class="top">
  <button type="button" class="top-btn top-menu" data-nav-toggle aria-label="Navigation öffnen" aria-controls="nav" aria-expanded="false">${ICON.menu}</button>
  <a class="brand" href="/" aria-label="glatttHub Nutzerhandbuch — Startseite"><img src="/assets/icon.png" alt="" width="32" height="32"><span>glatttHub</span></a>
  <button type="button" class="top-search" data-search-open>${ICON.search}<span>Wonach suchst du?</span><kbd>⌘K</kbd></button>
  <button type="button" class="top-btn" data-theme-toggle aria-label="Hell oder dunkel" title="Hell oder dunkel">${ICON.sun}${ICON.moon}</button>
</header>
<div class="layout">
  <nav class="side" id="nav" aria-label="Alle Anleitungen">${nav}</nav>
  <div class="side-backdrop" data-nav-close></div>
  <main class="content" id="inhalt">${body}</main>
</div>
<div class="search" data-search hidden role="dialog" aria-modal="true" aria-label="Suche">
  <div class="search-box">
    <div class="search-head">${ICON.search}<input type="search" data-search-input placeholder="Aufgabe, Beschriftung oder Fenster — z. B. Rate pausieren" autocomplete="off" spellcheck="false" aria-label="Suchbegriff"><button type="button" class="search-close" data-search-close aria-label="Schließen">${ICON.x}</button></div>
    <div class="search-meta" data-search-meta aria-live="polite"></div>
    <ol class="search-results" data-search-results></ol>
    <div class="search-foot"><span><kbd>↑</kbd><kbd>↓</kbd> wählen</span><span><kbd>↵</kbd> öffnen</span><span><kbd>Esc</kbd> schließen</span></div>
  </div>
</div>
<script src="/assets/minisearch.js"></script>
<script src="/assets/suche-kern.js"></script>
<script src="/assets/suche.js"></script>
<script src="/assets/portal.js"></script>
</body></html>`;
}

const audienceChip = (g) => (g.audienceLabel ? `<em class="audience" data-aud="${D.esc(g.audience)}">${D.esc(g.audienceLabel)}</em>` : '')
  + (g.hinweis ? `<em class="audience warn">${D.esc(g.hinweis)}</em>` : '');

/* ---------- Navigation (links) ---------- */
function navHtml(guides, current) {
  const groups = groupBySeries(guides);
  return `<a class="side-home${current === '/' ? ' is-current' : ''}" href="/">${ICON.home}<span>Alle Anleitungen</span></a>`
    + groups.map(([name, list]) => {
      const open = list.some(g => g.url === current) || current === '/' + serieSlug(name) + '/';
      return `<details class="side-group"${open ? ' open' : ''}>
  <summary><span>${D.esc(name)}</span><small>${list.length}</small></summary>
  <ul>${list.map(g => `<li data-aud="${D.esc(g.audience || '')}"><a href="${g.url}"${g.url === current ? ' aria-current="page"' : ''}><b>${g.nr}</b><span>${D.esc(g.title)}</span></a></li>`).join('')}</ul>
</details>`;
    }).join('');
}
function groupBySeries(guides) {
  const groups = new Map();
  for (const g of [...guides].sort((a, b) => (a.nr || 0) - (b.nr || 0))) {
    const key = g.series || g.area || 'Weitere';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(g);
  }
  return [...groups].sort((a, b) => rang(a[0]) - rang(b[0]) || a[0].localeCompare(b[0], 'de'));
}

/* ---------- Eine Anleitung ---------- */
function vorgangHtml(p, i, N, meta, img) {
  const blocks = [];
  blocks.push(`<div class="vorgang-kicker">Vorgang ${i + 1} von ${N}</div>`);
  blocks.push(`<h2 id="${D.esc(p.slug)}">${D.esc(p.h1)}</h2>`);
  if (p.sub) blocks.push(`<p class="lead">${D.rich(p.sub)}</p>`);
  const warn = (m) => console.log(m);
  // Bilder untereinander statt zweispaltig — Telefon und Tablet lesen so besser
  if (p.left) blocks.push(D.shotHtml(meta, p.left.shot, p.left.marks, img, '', warn)
    + (p.leftCaption ? `<div class="cap">${D.rich(p.leftCaption)}</div>` : ''));
  if (p.steps) blocks.push(D.stepsHtml(p.steps, 1));
  if (p.right) blocks.push(D.shotHtml(meta, p.right.shot, p.right.marks, img, '', warn)
    + (p.rightCaption ? `<div class="cap">${D.rich(p.rightCaption)}</div>` : ''));
  if (p.rightSteps) blocks.push(D.stepsHtml(p.rightSteps, 1));
  if (p.layout === 'grid') {
    blocks.push('<div class="tiles">' + (p.tiles || []).map(t =>
      `<figure class="tile">${D.shotHtml(meta, t.shot, t.marks, img, 'tile-shot', warn)}<figcaption><b>${D.esc(t.title)}</b> ${D.rich(t.text)}</figcaption></figure>`).join('') + '</div>');
  }
  blocks.push(...D.bodyBlocks(p));
  if (p.notes) blocks.push(D.notesHtml(p.notes));
  if (p.rightHtml) blocks.push(p.rightHtml);
  if (p.hint) blocks.push(D.hintHtml(p.hint));
  if (p.rightHint) blocks.push(D.hintHtml(p.rightHint));
  return `<section class="vorgang" id="v${i + 1}" data-nr="${i + 1}" data-slug="${D.esc(p.slug)}" data-titel="${D.esc(p.h1)}">${blocks.join('\n')}</section>`;
}

function guideBody(g, meta, img) {
  const deck = g.deck;
  const N = deck.pages.length;
  const kicker = [deck.series && deck.nr ? `${deck.series} ${deck.nr}${deck.of ? ' von ' + deck.of : ''}` : deck.eyebrow].filter(Boolean).join(' · ');
  const head = `<header class="guide-head">
  <div class="eyebrow"><a href="/${serieSlug(deck.series)}/">${D.esc(kicker)}</a></div>
  <h1>${deck.title.map(D.esc).join(' ')}</h1>
  <p class="sub">${D.rich(deck.subtitle)}</p>
  <div class="guide-tags">${audienceChip(g)}</div>
  ${(deck.notes || []).length ? `<ul class="guide-notes">${deck.notes.map(n => `<li>${D.rich(n)}</li>`).join('')}</ul>` : ''}
  <div class="guide-tools">
    ${g.pdf ? `<a class="btn btn-secondary" href="${g.pdf}" download>${ICON.pdf}<span>Als PDF</span></a>` : ''}
    <button type="button" class="btn btn-secondary" data-mode-toggle aria-pressed="false">${ICON.list}<span data-mode-label>Alle Vorgänge untereinander</span></button>
  </div>
  ${N > 1 ? `<nav class="toc" aria-label="Vorgänge dieser Anleitung"><b>Vorgänge in dieser Anleitung</b><ol>${deck.pages.map((p, i) => `<li><a href="#v${i + 1}" data-toc="${i + 1}">${D.esc(p.h1)}</a></li>`).join('')}</ol></nav>` : ''}
</header>`;
  const stepper = N > 1 ? `<nav class="vorgang-nav" data-stepper aria-label="Vorgang wechseln">
  <button type="button" class="btn btn-nav" data-prev>${ICON.left}<span>Zurück</span></button>
  <div class="vorgang-pos" data-pos aria-live="polite"></div>
  <button type="button" class="btn btn-nav btn-primary" data-next><span>Weiter</span>${ICON.right}</button>
</nav>` : '';
  const sections = deck.pages.map((p, i) => vorgangHtml(p, i, N, meta, img)).join('\n');
  const foot = `<nav class="vorgang-foot" data-stepper-foot aria-label="Vorgang wechseln">
  <button type="button" class="btn btn-nav" data-prev>${ICON.left}<span data-prev-label>Zurück</span></button>
  <button type="button" class="btn btn-nav btn-primary" data-next><span data-next-label>Weiter</span>${ICON.right}</button>
</nav>
<footer class="guide-foot"><span>Screenshots mit Beispieldaten · Stand ${D.esc(deck.stand)}${deck.version ? ' · v' + D.esc(deck.version) : ''}</span><a href="/${serieSlug(deck.series)}/">Alle Anleitungen „${D.esc(deck.series)}"</a></footer>`;
  const nextAttr = g.next ? ` data-next-url="${D.esc(g.next.url)}" data-next-title="${D.esc(g.next.series + ' ' + g.next.nr + ' · ' + g.next.title)}"` : '';
  return `<article class="guide" data-guide="${D.esc(deck.series)} ${deck.nr}" data-vorgaenge="${N}"${nextAttr}>${head}${stepper}${sections}${foot}</article>`;
}

/* ---------- Übersichten ---------- */
function seriesCards(guides) {
  return groupBySeries(guides).map(([name, list]) => {
    const auds = [...new Set(list.map(g => g.audience).filter(Boolean))].join(',');
    const info = serieInfo(name);
    return `<section class="card serie-card" data-aud="${D.esc(auds)}">
  <h2><a href="/${serieSlug(name)}/">${D.esc(name)}</a><small>${list.length} ${list.length === 1 ? 'Anleitung' : 'Anleitungen'}</small></h2>
  ${info.beschreibung ? `<p class="serie-desc">${D.esc(info.beschreibung)}</p>` : ''}
  <ol class="serie-list">${list.map(g => `<li data-aud="${D.esc(g.audience || '')}"><a href="${g.url}"><b>${g.nr}</b><span>${D.esc(g.title)}</span></a></li>`).join('')}</ol>
</section>`;
  }).join('');
}
function indexBody(guides) {
  return `<section class="hero">
  <h1>glatttHub Nutzerhandbuch</h1>
  <p>Das Handbuch für den glatttHub: alle Abläufe von der Anmeldung bis zur Laser-Wartung, nach Themengebieten sortiert und durchsuchbar.</p>
  <button type="button" class="hero-search" data-search-open>${ICON.search}<span>Zum Beispiel „Rate pausieren", „Kundin finden" oder „Termin abschließen"</span></button>
  <div class="chips" data-audience-filter role="group" aria-label="Für wen">
    <button type="button" class="chip-btn" data-aud="">Alle</button>
    ${AUDIENCES.map(([k, l]) => `<button type="button" class="chip-btn" data-aud="${k}">${l}</button>`).join('')}
  </div>
</section>
<div class="serien">${seriesCards(guides)}</div>
<p class="serien-leer" data-filter-leer hidden>Für diese Auswahl gibt es noch keine Anleitung.</p>`;
}
function seriesBody(name, list) {
  const info = serieInfo(name);
  if (!info.beschreibung) console.log('SERIEN-TEXT FEHLT:', name, '— shared/serien.json ergänzen');
  return `<header class="guide-head">
  <div class="eyebrow"><a href="/">Alle Anleitungen</a></div>
  <h1>${D.esc(name)}</h1>
  ${info.beschreibung ? `<p class="sub serie-intro">${D.esc(info.beschreibung)}</p>` : ''}
  <p class="sub serie-meta">${info.fuer ? D.esc(info.fuer) + ' · ' : ''}${list.length} ${list.length === 1 ? 'Anleitung' : 'Anleitungen'} in dieser Serie.</p>
</header>
<ol class="guide-list">${list.map(g => `<li data-aud="${D.esc(g.audience || '')}"><a href="${g.url}">
  <b>${g.nr}. ${D.esc(g.title)}</b><span>${D.rich(g.subtitle)}</span>${audienceChip(g)}
  <small>${g.pages.length} ${g.pages.length === 1 ? 'Vorgang' : 'Vorgänge'}</small></a></li>`).join('')}</ol>`;
}

/* ---------- Hauptlauf ---------- */
(async () => {
  const loaded = [];
  const belegt = new Map();
  for (const deckFile of deckFiles) {
    const { deck, meta, shotsDir } = D.load(deckFile);
    const key = `${serieSlug(deck.series)}/${deck.nr}`;
    // Zwei Decks mit derselben Serie+Nummer ergäben dieselbe Adresse — lieber laut abbrechen
    if (belegt.has(key)) { console.error(`FEHLER: „${deck.series} ${deck.nr}" doppelt — ${belegt.get(key)} und ${deckFile}.`); process.exit(1); }
    belegt.set(key, deckFile);
    for (const name of shotNames(deck)) await prepareShot(shotsDir, name);
    const pdfBase = deck.out ? path.basename(deck.out) : null;
    loaded.push({
      deck, meta, deckFile,
      url: `/${key}/`,
      pdf: pdfBase ? '/pdf/' + encodeURIComponent(pdfBase + '.pdf') : null,
      // Kurzform für Navigation und Übersichten
      series: deck.series, nr: deck.nr, of: deck.of, area: deck.footerArea,
      title: deck.title.join(' '), subtitle: deck.subtitle,
      audience: deck.audience || null, audienceLabel: deck.audienceLabel || null, hinweis: deck.hinweis || null,
      pages: deck.pages,
    });
  }

  const img = (name) => {
    const info = imgInfo.get(name);
    if (!info) { console.log('SCREENSHOT FEHLT:', name, '— Platzhalter eingesetzt'); return '/assets/fehlt.svg'; }
    return info;
  };

  // Nächste Anleitung derselben Serie (nach Nummer): Ziel des letzten „Weiter" statt der Startseite
  for (const g of loaded) {
    const folgende = loaded.filter(o => o.series === g.series && o.nr > g.nr).sort((a, b) => a.nr - b.nr)[0];
    g.next = folgende ? { url: folgende.url, series: folgende.series, nr: folgende.nr, title: folgende.title } : null;
  }

  const manifest = { generated: new Date().toISOString().slice(0, 10), guides: [], serien: [] };
  for (const [name, list] of groupBySeries(loaded)) {
    const info = serieInfo(name);
    manifest.serien.push({ name, slug: serieSlug(name), url: `/${serieSlug(name)}/`, anzahl: list.length,
      beschreibung: info.beschreibung || '', fuer: info.fuer || '', stichworte: info.stichworte || [],
      anleitungen: list.map(g => ({ nr: g.nr, title: g.title, url: g.url })) });
  }
  for (const g of loaded) {
    const dir = path.join(outRoot, g.url);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), shell({
      title: `${g.series} ${g.nr} · ${g.title}`, bodyClass: 'is-guide',
      nav: navHtml(loaded, g.url), body: guideBody(g, g.meta, img),
    }));
    if (process.env.WEB_MD) {
      const mdDir = path.join(outRoot, 'md');
      fs.mkdirSync(mdDir, { recursive: true });
      fs.writeFileSync(path.join(mdDir, g.deck.slug + '.md'),
        `---\ntitle: ${g.title}\ndescription: ${g.subtitle}\n---\n\n<div class="guide">\n${guideBody(g, g.meta, img)}\n</div>\n`);
    }
    manifest.guides.push({
      slug: g.deck.slug, url: g.url, pdf: g.pdf, next: g.next ? g.next.url : null,
      title: g.title, subtitle: g.subtitle, eyebrow: g.deck.eyebrow, area: g.area,
      series: g.series || null, seriesSlug: serieSlug(g.series), nr: g.nr || null, of: g.of || null,
      audience: g.audience, audienceLabel: g.audienceLabel, hinweis: g.hinweis,
      stand: g.deck.stand, version: g.deck.version, notes: g.deck.notes || [],
      pages: g.pages.map((p, i) => ({
        slug: p.slug, nr: i + 1, url: g.url + '#v' + (i + 1), h1: p.h1, sub: p.sub || '',
        shots: [p.left, p.right, ...(p.tiles || [])].filter(Boolean).map(s => ({
          name: s.shot,
          caption: (s === p.left ? p.leftCaption : s === p.right ? p.rightCaption : s.text) || '',
          ratio: g.meta[s.shot]?.ratio ?? null,
          marks: D.marksOf(g.meta, s.shot, s.marks),
        })),
        steps: [...(p.steps || []), ...(p.rightSteps || [])],
        notes: p.notes || [], table: p.table || null, sections: p.sections || null,
        hints: [p.hint, p.rightHint].filter(Boolean),
      })),
    });
    console.log('WEB', g.url);
  }

  // Serien-Übersichten
  for (const [name, list] of groupBySeries(loaded)) {
    const url = `/${serieSlug(name)}/`;
    fs.mkdirSync(path.join(outRoot, url), { recursive: true });
    fs.writeFileSync(path.join(outRoot, url, 'index.html'), shell({
      title: name, nav: navHtml(loaded, url), body: seriesBody(name, list),
    }));
  }

  // Platzhalterbild für fehlende Screenshots
  fs.writeFileSync(path.join(assetsOut, 'fehlt.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1180 820"><rect width="1180" height="820" fill="#f3f4f6"/>`
    + `<text x="590" y="410" text-anchor="middle" font-family="Helvetica" font-size="34" fill="#9ca3af">Screenshot folgt</text></svg>`);

  // Startseite, Fehlerseite, Manifest
  fs.writeFileSync(path.join(outRoot, 'index.html'), shell({
    title: 'Alle Anleitungen', bodyClass: 'is-home', nav: navHtml(loaded, '/'), body: indexBody(loaded),
  }));
  fs.writeFileSync(path.join(outRoot, '404.html'), shell({
    title: 'Nicht gefunden', nav: navHtml(loaded, ''),
    body: `<header class="guide-head"><h1>Diese Seite gibt es nicht</h1><p class="sub">Vielleicht wurde die Anleitung umbenannt. Die Suche findet sie trotzdem.</p></header>
<p><button type="button" class="btn btn-primary" data-search-open>${ICON.search}<span>Suchen</span></button> <a class="btn btn-secondary" href="/">Zur Übersicht</a></p>`,
  }));
  fs.writeFileSync(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 1));
  console.log('WEB', outRoot, '·', manifest.guides.length, 'Anleitungen ·', imgInfo.size, 'Screenshots');
})().catch(e => { console.error(e); process.exit(1); });
