/* Gemeinsame Grundlage aller Klickanleitungen: ein Deck laden, normalisieren und die
   Bausteine erzeugen, die BEIDE Ausgabewege brauchen — PDF (A4 quer) und Web (Endbenutzer-Wiki).

   Der Inhalt steht ausschliesslich im Deck (decks/*.json). Alles, was nur eine Ausgabe
   betrifft (Seitenformat, Spalten, Fusszeile), gehoert in den jeweiligen Builder, nie ins Deck —
   sonst muss jede Anleitung fuer jedes Ziel neu geschrieben werden.

   Strukturierte Felder (bevorzugt):
     page.steps       [{ n, title, text }]                 nummerierte Schritte
     page.notes       [{ title, text }]                    Erlaeuterungen ohne Nummer („i")
     page.hint        { text, kind: 'warn'|'info' }        Hinweisbox
     page.table       { head: [...], rows: [[...]] }       Tabellenseite (Nachschlagewerk)
     page.sections    [{ h2, text }]                       Fliesstext-Abschnitte
   Legacy-Felder (A–H, funktionieren weiter):
     page.rightHtml / page.html + layout:'text'            rohes HTML                            */
const fs = require('fs');
const path = require('path');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** **fett** und „UI-Beschriftung" auszeichnen. Die Anfuehrungszeichen bleiben stehen,
    der Text dazwischen bekommt die Klasse `ui` — in beiden Ausgaben gleich. */
const rich = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/„(.+?)“/g, '„<span class="ui">$1</span>“');

/** Zielgruppe → Beschriftung auf dem Cover und Gruppe im Wiki. */
const AUDIENCE = {
  institut: 'Für die Institute',
  leitung: 'Für die Leitung',
  buero: 'Fürs Büro',
  admin: 'Für die Administration',
};

const slugify = (s) => String(s).toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function load(deckFile) {
  const dir = path.dirname(deckFile);
  const deck = JSON.parse(fs.readFileSync(deckFile, 'utf8'));
  const metaFile = path.resolve(dir, deck.meta || '../meta.json');
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
  const shotsDir = path.resolve(dir, deck.shots || '../shots');

  deck.slug = deck.slug || slugify(path.basename(deckFile, '.json'));
  // Benennung „Bereich + Nummer" (seit 15.09.2026): Die Serie und die Nummer stehen im Deck,
  // die Builder setzen daraus Kicker, Eyebrow-Zusatz und Gruppierung im Web zusammen.
  deck.of = deck.of || null;
  deck.kicker = deck.series && deck.nr
    ? deck.series + ' ' + deck.nr + (deck.of ? ' von ' + deck.of : '')
    : '';
  deck.eyebrowFull = [deck.eyebrow, deck.series && deck.nr ? 'Teil ' + deck.nr + (deck.of ? ' von ' + deck.of : '') : '']
    .filter(Boolean).join(' · ');
  deck.audienceLabel = AUDIENCE[deck.audience] || '';
  /* `hinweis` markiert Anleitungen zu Funktionen, die es gibt, die aber noch nicht scharf
     geschaltet sind (Gamification, Fernabsatz-Änderung …). Steht als roter Vermerk auf dem
     Cover und als Badge im Wiki — beim Go-Live nur die Zeile entfernen. */
  deck.hinweis = deck.hinweis || '';
  deck.pages.forEach((p, i) => {
    p.slug = p.slug || slugify(p.h1);
    p.vorgang = p.vorgang || (i + 1);
  });
  // Stand/Version: stand.txt (schreibt run-all.sh) schlaegt STAND, das schlaegt das Deck
  const standFile = path.resolve(dir, '../stand.txt');
  deck.stand = (fs.existsSync(standFile) ? fs.readFileSync(standFile, 'utf8').trim() : '')
    || process.env.STAND || deck.stand;
  deck.version = process.env.VERSION || deck.version || '';
  return { deck, meta, shotsDir, dir };
}

/** Die Markierungen eines Screenshots aufloesen: meta.json liefert die Rechtecke,
    das Deck darf sie ergaenzen oder verschieben (dx/dy). */
function marksOf(meta, name, marks) {
  const m = meta[name];
  return (marks || (m ? m.marks : []) || []).map(k => {
    if (typeof k === 'string') return (m?.marks || []).find(x => x.id === k);
    if (k.id && !k.pct) {
      const found = (m?.marks || []).find(x => x.id === k.id);
      return found ? { ...found, ...k } : null;
    }
    return k;
  }).filter(Boolean);
}

/** Screenshot mit Overlays. Die Technik ist in beiden Ausgaben dieselbe: ein Bild in einem
    `position:relative`-Rahmen, darueber absolut positionierte Badges/Chips/Rahmen in Prozent.
    Deshalb liegt sie hier und nicht im Builder. `img` liefert die Bildquelle (Base64 fuers
    PDF, Dateiname fuers Web). */
function shotHtml(meta, name, marks, img, cls = '', warn = () => {}) {
  const list = marksOf(meta, name, marks);
  const ratio = meta[name] ? meta[name].ratio : 820 / 1180;
  let inner = `<img src="${img(name)}" alt="${esc(name)}" loading="lazy">`;
  for (const k of list) {
    const p = k.pct, dx = k.dx || 0, dy = k.dy || 0;
    if (!p || p.w <= 0 || p.h <= 0 || p.y + p.h < 0 || p.y > 100 || p.x + p.w < 0 || p.x > 100) {
      warn('Mark verworfen: ' + name + ' ' + (k.id || k.n));
      continue;
    }
    if (k.kind === 'frame') {
      inner += `<div class="frame ${k.color || 'gold'}" style="left:${p.x - 0.6}%;top:${p.y - 0.8}%;width:${p.w + 1.2}%;height:${p.h + 1.6}%"></div>`;
    }
    if (k.kind === 'badge') {
      const at = k.at || 'l';
      let x = p.x, y = p.y + p.h / 2;
      if (at === 'r') x = p.x + p.w;
      if (at === 'tl') { x = p.x; y = p.y; }
      if (at === 'tr') { x = p.x + p.w; y = p.y; }
      if (at === 't') { x = p.x + p.w / 2; y = p.y; }
      if (at === 'b') { x = p.x + p.w / 2; y = p.y + p.h; }
      inner += `<div class="badge" style="left:${x + dx}%;top:${y + dy}%">${k.n}</div>`;
    }
    if (k.kind === 'chip') {
      const side = k.at || 'l';
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

const stepsHtml = (steps, cols = 2) => `<div class="steps cols-${cols}">` + steps.map(s =>
  `<div class="step"><div class="num">${s.n}</div><div><div class="t">${rich(s.title)}</div><div class="d">${rich(s.text)}</div></div></div>`
).join('') + '</div>';

/** Erlaeuterungen ohne Nummer — dieselbe Optik wie Schritte, aber mit „i" statt Ziffer.
    Ersetzt das frueher haendisch ins Deck geschriebene `rightHtml`. */
const notesHtml = (notes, cols = 1) => `<div class="steps cols-${cols}">` + notes.map(n =>
  `<div class="step"><div class="num">i</div><div><div class="t">${rich(n.title)}</div><div class="d">${rich(n.text)}</div></div></div>`
).join('') + '</div>';

const hintHtml = (h) => h
  ? `<div class="hint ${h.kind || ''}"><span class="i">i</span><div>${rich(h.text)}</div></div>`
  : '';

const tableHtml = (t) => `<table class="tbl"><thead><tr>${t.head.map(h => `<th>${rich(h)}</th>`).join('')}</tr></thead>`
  + `<tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

const sectionsHtml = (secs) => secs.map(s =>
  `<h2>${rich(s.h2)}</h2><p>${rich(s.text)}</p>`
).join('');

/** Der „Textkoerper" einer Seite ohne Screenshots — in beiden Ausgaben identisch,
    nur unterschiedlich angeordnet. */
function bodyBlocks(p) {
  const out = [];
  if (p.sections) out.push(sectionsHtml(p.sections));
  if (p.table) out.push(tableHtml(p.table));
  if (p.html) out.push(p.html);                       // Legacy-Escape (A–H)
  return out;
}

module.exports = { load, AUDIENCE, esc, rich, slugify, marksOf, shotHtml, stepsHtml, notesHtml, hintHtml, tableHtml, sectionsHtml, bodyBlocks };
