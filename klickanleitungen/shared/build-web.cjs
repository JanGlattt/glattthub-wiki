/* Klickanleitung fuers Endbenutzer-Wiki: dasselbe Deck, andere Ausgabe.
   Aufruf:  node shared/build-web.cjs <deck.json> [<deck.json> …]
   Ausgabe (neben den Decks, Ordner `web/`):

     web/<slug>/index.html   fertige Seite, laeuft auf jedem statischen Host
     web/<slug>.md           dieselbe Seite als Markdown mit HTML-Bloecken (MkDocs)
     web/index.html          Uebersicht aller Anleitungen
     web/manifest.json       alles strukturiert (Seiten, Schritte, Hinweise, Bilder,
                             Markierungs-Koordinaten) — Vorlage fuer eine Hub-Seite,
                             die die Anleitungen selbst rendert
     web/assets/             Screenshots + web.css

   Damit steht die Entscheidung, WO das Wiki liegt, erst spaeter an: Alle drei Ziele
   (statisch, MkDocs, Hub) entstehen aus derselben Quelle. Ins Deck gehoert deshalb nie
   Layout — nur Inhalt.                                                                        */
const fs = require('fs');
const path = require('path');
const D = require('./lib/deck.cjs');

const deckFiles = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!deckFiles.length) { console.error('Aufruf: node build-web.cjs <deck.json> [...]'); process.exit(2); }

/* Ausgabeordner: standardmaessig `web/` neben den Decks der ersten Serie. Wer mehrere Serien
   in EIN Wiki baut, setzt WEB_OUT — sonst landet alles im Ordner der ersten Serie.
   Beispiel:  WEB_OUT=../klickanleitungen-web node shared/build-web.cjs */
const outRoot = process.env.WEB_OUT
  ? path.resolve(process.env.WEB_OUT)
  : path.resolve(path.dirname(deckFiles[0]), '../web');
const assetsOut = path.join(outRoot, 'assets');
fs.mkdirSync(assetsOut, { recursive: true });
fs.copyFileSync(path.join(__dirname, 'assets', 'web.css'), path.join(assetsOut, 'web.css'));
fs.copyFileSync(path.join(__dirname, 'assets', 'logo.png'), path.join(assetsOut, 'logo.png'));

const manifest = { generated: new Date().toISOString().slice(0, 10), guides: [] };

for (const deckFile of deckFiles) {
  const { deck, meta, shotsDir } = D.load(deckFile);
  const used = new Set();

  // Bildquelle fuers Web: Dateiname relativ zur Seite; die Datei wird mitkopiert
  const img = (name) => {
    used.add(name);
    const png = path.join(shotsDir, name + '.png');
    const jpg = path.join(shotsDir, name + '.jpg');
    if (!fs.existsSync(png) && !fs.existsSync(jpg)) {
      console.log('SCREENSHOT FEHLT:', deck.slug, name, '— Platzhalter eingesetzt');
      return '../assets/fehlt.svg';
    }
    return '../assets/' + name + (fs.existsSync(jpg) && !fs.existsSync(png) ? '.jpg' : '.png');
  };

  const pagesHtml = deck.pages.map((p, i) => {
    const blocks = [];
    blocks.push(`<h2 id="${p.slug}">${D.esc(p.h1)}</h2>`);
    if (p.sub) blocks.push(`<p class="lead">${D.rich(p.sub)}</p>`);
    // Web: Bilder untereinander statt zweispaltig — Telefon und Tablet lesen so besser
    if (p.left) blocks.push(D.shotHtml(meta, p.left.shot, p.left.marks, img, '', m => console.log(m))
      + (p.leftCaption ? `<div class="cap">${D.rich(p.leftCaption)}</div>` : ''));
    if (p.right) blocks.push(D.shotHtml(meta, p.right.shot, p.right.marks, img, '', m => console.log(m))
      + (p.rightCaption ? `<div class="cap">${D.rich(p.rightCaption)}</div>` : ''));
    if (p.layout === 'grid') for (const t of (p.tiles || [])) {
      blocks.push(D.shotHtml(meta, t.shot, t.marks, img) + `<div class="cap"><b>${D.esc(t.title)}</b> — ${D.rich(t.text)}</div>`);
    }
    if (p.steps) blocks.push(D.stepsHtml(p.steps, 1));
    if (p.rightSteps) blocks.push(D.stepsHtml(p.rightSteps, 1));
    if (p.notes) blocks.push(D.notesHtml(p.notes));
    blocks.push(...D.bodyBlocks(p));
    if (p.rightHtml) blocks.push(p.rightHtml);
    if (p.hint) blocks.push(D.hintHtml(p.hint));
    if (p.rightHint) blocks.push(D.hintHtml(p.rightHint));
    return `<section class="vorgang" id="v${i + 1}">${blocks.join('\n')}</section>`;
  });

  const head = `<header class="guide-head">
  <div class="eyebrow">${D.esc(deck.eyebrowFull || deck.eyebrow)}</div>
  <h1>${deck.title.map(D.esc).join(' ')}</h1>
  ${deck.audienceLabel ? `<div class="audience">${D.esc(deck.audienceLabel)}</div>` : ''}
  ${deck.hinweis ? `<div class="audience warn">${D.esc(deck.hinweis)}</div>` : ''}
  <p class="sub">${D.rich(deck.subtitle)}</p>
  ${(deck.notes || []).length ? `<ul class="guide-notes">${deck.notes.map(n => `<li>${D.rich(n)}</li>`).join('')}</ul>` : ''}
  <nav class="toc"><b>Auf dieser Seite</b><ol>${deck.pages.map((p, i) => `<li><a href="#v${i + 1}">${D.esc(p.h1)}</a></li>`).join('')}</ol></nav>
</header>`;

  const body = head + pagesHtml.join('\n');
  const foot = `<footer class="guide-foot">glattt · Klickanleitung ${D.esc(deck.footerArea)} · Stand ${D.esc(deck.stand)}${deck.version ? ' · v' + D.esc(deck.version) : ''}</footer>`;

  const dir = path.join(outRoot, deck.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'),
    `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<title>${D.esc(deck.title.join(' '))} — glattt</title>`
    + `<link rel="stylesheet" href="../assets/web.css"></head>`
    + `<body><main class="guide">${body}${foot}</main></body></html>`);

  // MkDocs: Markdown mit eingebetteten HTML-Bloecken — die Overlays bleiben erhalten
  fs.writeFileSync(path.join(outRoot, deck.slug + '.md'),
    `---\ntitle: ${deck.title.join(' ')}\ndescription: ${deck.subtitle}\n---\n\n`
    + `<link rel="stylesheet" href="../assets/web.css">\n\n`
    + `<div class="guide">\n${body}\n${foot}\n</div>\n`);

  // Screenshots mitkopieren
  for (const name of used) {
    for (const ext of ['.png', '.jpg']) {
      const src = path.join(shotsDir, name + ext);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(assetsOut, name + ext));
    }
  }

  manifest.guides.push({
    slug: deck.slug,
    title: deck.title.join(' '),
    subtitle: deck.subtitle,
    eyebrow: deck.eyebrow,
    area: deck.footerArea,
    series: deck.series || null,
    nr: deck.nr || null,
    of: deck.of || null,
    audience: deck.audience || null,
    audienceLabel: deck.audienceLabel || null,
    hinweis: deck.hinweis || null,
    stand: deck.stand,
    version: deck.version,
    notes: deck.notes || [],
    pages: deck.pages.map((p, i) => ({
      slug: p.slug,
      nr: i + 1,
      h1: p.h1,
      sub: p.sub || '',
      shots: [p.left, p.right].filter(Boolean).map(s => ({
        name: s.shot,
        caption: (s === p.left ? p.leftCaption : p.rightCaption) || '',
        ratio: meta[s.shot]?.ratio ?? null,
        marks: D.marksOf(meta, s.shot, s.marks),
      })),
      steps: p.steps || [],
      notes: p.notes || [],
      table: p.table || null,
      sections: p.sections || null,
      hints: [p.hint, p.rightHint].filter(Boolean),
    })),
  });
  console.log('WEB', path.join(dir, 'index.html'));
}

/* Lesereihenfolge der Serien — erst die taegliche Arbeit, dann Buero, dann Verwaltung.
   Was hier nicht steht, haengt alphabetisch hinten dran. */
const SERIEN = ['Grundlagen', 'Terminansicht', 'Kundenverwaltung', 'Bonus-Board', 'Verkauf',
  'Betrieb', 'Team', 'Finanzen', 'System', 'Berichte', 'Admin'];

/** Uebersicht nach Serie gruppiert, Zielgruppe als Badge je Eintrag. */
function groupedList(guides) {
  const groups = new Map();
  for (const g of [...guides].sort((a, b) => (a.nr || 0) - (b.nr || 0))) {
    const key = g.series || g.area || 'Weitere';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(g);
  }
  const rang = (n) => { const i = SERIEN.indexOf(n); return i === -1 ? SERIEN.length : i; };
  const sortiert = [...groups].sort((a, b) => rang(a[0]) - rang(b[0]) || a[0].localeCompare(b[0], 'de'));
  return sortiert.map(([name, list]) =>
    `<section class="guide-group"><h2>${D.esc(name)}</h2><ul class="guide-list">`
    + list.map(g => `<li><a href="${g.slug}/">`
      + `<b>${g.nr ? D.esc(g.nr + '. ') : ''}${D.esc(g.title)}</b>`
      + `<span>${D.esc(g.subtitle)}</span>`
      + (g.audienceLabel ? `<em class="audience">${D.esc(g.audienceLabel)}</em>` : '')
      + (g.hinweis ? `<em class="audience warn">${D.esc(g.hinweis)}</em>` : '')
      + `</a></li>`).join('')
    + `</ul></section>`).join('');
}

// Platzhalterbild fuer fehlende Screenshots
fs.writeFileSync(path.join(assetsOut, 'fehlt.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1180 820"><rect width="1180" height="820" fill="#f3f4f6"/>`
  + `<text x="590" y="410" text-anchor="middle" font-family="Helvetica" font-size="34" fill="#9ca3af">Screenshot folgt</text></svg>`);

// Uebersichtsseite
fs.writeFileSync(path.join(outRoot, 'index.html'),
  `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">`
  + `<meta name="viewport" content="width=device-width,initial-scale=1"><title>Klickanleitungen — glattt</title>`
  + `<link rel="stylesheet" href="assets/web.css"></head><body><main class="guide">`
  + `<header class="guide-head"><img class="logo" src="assets/logo.png" alt="glattt" width="120">`
  + `<h1>Klickanleitungen</h1><p class="sub">Schritt für Schritt durch die Abläufe im glatttHub.</p></header>`
  + groupedList(manifest.guides)
  + `</main></body></html>`);

fs.writeFileSync(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log('WEB', path.join(outRoot, 'index.html'), '·', path.join(outRoot, 'manifest.json'), '·', manifest.guides.length, 'Anleitungen');
