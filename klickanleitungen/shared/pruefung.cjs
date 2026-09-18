/* Prüfdateien: alle Texte einer Serie als eine Markdown-Datei — zum Lesen und Korrigieren — und
   zurück in die Decks.

     node shared/pruefung.cjs export            → pruefung/<serie>.md je Serie + pruefung/ALLE.md
     node shared/pruefung.cjs import pruefung/laser.md [weitere.md …]
                                                → schreibt die geänderten Texte in die Deck-JSONs
     node shared/pruefung.cjs import --alle     → alle pruefung/*.md (ohne ALLE.md)

   Aufbau der Datei (bitte beibehalten — der Import liest die Beschriftungen am Zeilenanfang):

     # Laser 3 · Wartung 1: Flow Maintenance          ← Überschrift je Anleitung (nicht ändern)
     <!-- deck: laser/decks/3-….json -->               ← Zuordnung (nicht ändern)
     Titel: Wartung 1: | Flow Maintenance              ← „|" trennt die Zeilen des Deckblatt-Titels
     Untertitel: …
     Zielgruppe: institut                              ← institut · buero · leitung · admin
     Deckblatt-Hinweise:
     - …
     ## 1. Der Wartungs-Reiter                         ← Vorgang: Nummer + Überschrift
     Karte: …                                          ← Kurztext auf dem Deckblatt
     Einleitung: …
     Bild links: …                                     ← Bildunterschrift
     Bild rechts: …
     Schritte:
     1. **Titel** — Text                               ← eine Zeile je Schritt, Reihenfolge = Nummer
     Rechts-Schritte:                                  ← nur bei zwei Bildern mit eigenen Schritten
     Hinweis (warn): …                                 ← oder „Hinweis: …" für den neutralen Kasten
     Notizen:
     - **Titel** — Text
     Abschnitte:
     ### Überschrift
     Text
     Tabelle:
     | Kopf | Kopf |
     | Zelle | Zelle |

   Jeder Wert steht auf EINER Zeile (Zeilenumbrüche werden beim Export zu Leerzeichen).
   **fett** bleibt Markdown wie im Deck. Zeilen, die mit „HTML:" beginnen, sind nur zur Ansicht.   */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'pruefung');
const ORDER = ['Grundlagen', 'Terminansicht', 'Kundenverwaltung', 'Bonus-Board', 'Verkauf', 'Verträge', 'Widerrufe',
  'Forderungen', 'Betrieb', 'Laser', 'Team', 'Finanzen', 'System', 'Berichte', 'Admin'];
const AUD = { institut: 'institut', buero: 'buero', leitung: 'leitung', admin: 'admin' };

const eine = (s) => String(s ?? '').replace(/\s*\n\s*/g, ' ').trim();
const slug = (s) => String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function alleDecks() {
  const decks = [];
  for (const s of fs.readdirSync(ROOT)) {
    const d = path.join(ROOT, s, 'decks');
    if (!fs.existsSync(d) || !fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d).filter(f => f.endsWith('.json'))) {
      const rel = path.join(s, 'decks', f);
      decks.push({ rel, deck: JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')) });
    }
  }
  const rang = (n) => { const i = ORDER.indexOf(n); return i === -1 ? ORDER.length : i; };
  decks.sort((a, b) => rang(a.deck.series) - rang(b.deck.series) || (a.deck.nr || 0) - (b.deck.nr || 0));
  return decks;
}

/* ---------- Export ---------- */
function deckMd({ rel, deck }) {
  const L = [];
  L.push(`# ${deck.series} ${deck.nr} · ${deck.title.join(' ')}`);
  L.push(`<!-- deck: ${rel} -->`);
  L.push(`Titel: ${deck.title.map(eine).join(' | ')}`);
  L.push(`Untertitel: ${eine(deck.subtitle)}`);
  L.push(`Zielgruppe: ${deck.audience || ''}`);
  if ((deck.notes || []).length) { L.push('Deckblatt-Hinweise:'); for (const n of deck.notes) L.push(`- ${eine(n)}`); }
  deck.pages.forEach((p, i) => {
    L.push('');
    L.push(`## ${i + 1}. ${eine(p.h1)}`);
    if (p.card && p.card !== false && p.card.text) L.push(`Karte: ${eine(p.card.text)}`);
    if (p.sub) L.push(`Einleitung: ${eine(p.sub)}`);
    if (p.leftCaption) L.push(`Bild links: ${eine(p.leftCaption)}`);
    if (p.rightCaption) L.push(`Bild rechts: ${eine(p.rightCaption)}`);
    if ((p.steps || []).length) { L.push('Schritte:'); for (const s of p.steps) L.push(`${s.n}. **${eine(s.title)}** — ${eine(s.text)}`); }
    if ((p.rightSteps || []).length) { L.push('Rechts-Schritte:'); for (const s of p.rightSteps) L.push(`${s.n}. **${eine(s.title)}** — ${eine(s.text)}`); }
    if (p.hint && p.hint.text) L.push(`Hinweis${p.hint.kind ? ' (' + p.hint.kind + ')' : ''}: ${eine(p.hint.text)}`);
    if ((p.notes || []).length) { L.push('Notizen:'); for (const n of p.notes) L.push(`- **${eine(n.title)}** — ${eine(n.text)}`); }
    if ((p.sections || []).length) { L.push('Abschnitte:'); for (const s of p.sections) { L.push(`### ${eine(s.h2)}`); L.push(eine(s.text)); } }
    if (p.table) {
      L.push('Tabelle:');
      if (p.table.head) L.push('| ' + p.table.head.map(eine).join(' | ') + ' |');
      for (const r of p.table.rows) L.push('| ' + r.map(c => eine(c).replace(/\|/g, '\\|')).join(' | ') + ' |');
    }
    if (p.html) L.push(`HTML: (feste Tabelle, nur im Deck änderbar) ${eine(p.html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 200)}…`);
    if (p.rightHtml) L.push(`HTML rechts: (fester Block, nur im Deck änderbar) ${eine(p.rightHtml).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 200)}…`);
  });
  return L.join('\n');
}

function exportieren() {
  fs.mkdirSync(OUT, { recursive: true });
  const decks = alleDecks();
  const kopf = (serie, n) => `<!-- PRÜFDATEI „${serie}" · ${n} Anleitungen · erzeugt ${new Date().toISOString().slice(0, 10)} aus klickanleitungen/*/decks.
     Texte direkt ändern, Beschriftungen und Reihenfolge lassen. Zurückspielen:
     node shared/pruefung.cjs import pruefung/${slug(serie)}.md   (Format: Kopf von shared/pruefung.cjs) -->\n`;
  const serien = new Map();
  for (const d of decks) { if (!serien.has(d.deck.series)) serien.set(d.deck.series, []); serien.get(d.deck.series).push(d); }
  const alle = [];
  for (const [serie, list] of serien) {
    const md = kopf(serie, list.length) + '\n' + list.map(deckMd).join('\n\n\n') + '\n';
    fs.writeFileSync(path.join(OUT, slug(serie) + '.md'), md);
    alle.push(md);
    console.log('pruefung/' + slug(serie) + '.md', list.length, 'Anleitungen', md.length.toLocaleString('de-DE'), 'Zeichen');
  }
  fs.writeFileSync(path.join(OUT, 'ALLE.md'), alle.join('\n\n\n'));
  console.log('pruefung/ALLE.md', decks.length, 'Anleitungen');
}

/* ---------- Import ---------- */
function parse(md) {
  const decks = [];
  let deck = null, page = null, block = null, pendingH2 = null;
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.replace(/\s+$/, '');
    let m;
    if ((m = /^<!-- deck: (.+?) -->$/.exec(line))) { deck = { rel: m[1].trim(), pages: [] }; decks.push(deck); page = null; block = null; continue; }
    if (/^<!--/.test(line) || /^# /.test(line)) continue;
    if (!deck) continue;
    if ((m = /^## (\d+)\. (.*)$/.exec(line))) { page = { nr: +m[1], h1: m[2].trim() }; deck.pages.push(page); block = null; pendingH2 = null; continue; }
    if (line === '') { continue; }
    const feld = (label) => line.startsWith(label + ':') ? line.slice(label.length + 1).trim() : null;
    let v;
    if (!page) {
      if ((v = feld('Titel')) !== null) { deck.title = v.split('|').map(s => s.trim()).filter(Boolean); block = null; continue; }
      if ((v = feld('Untertitel')) !== null) { deck.subtitle = v; block = null; continue; }
      if ((v = feld('Zielgruppe')) !== null) { deck.audience = v; block = null; continue; }
      if (line === 'Deckblatt-Hinweise:') { deck.notes = []; block = 'decknotes'; continue; }
      if (block === 'decknotes' && (m = /^- (.*)$/.exec(line))) { deck.notes.push(m[1].trim()); continue; }
      throw new Error(`Zeile ${i + 1}: unerwartet vor dem ersten Vorgang: „${line.slice(0, 60)}"`);
    }
    if ((v = feld('Karte')) !== null) { page.cardText = v; block = null; continue; }
    if ((v = feld('Einleitung')) !== null) { page.sub = v; block = null; continue; }
    if ((v = feld('Bild links')) !== null) { page.leftCaption = v; block = null; continue; }
    if ((v = feld('Bild rechts')) !== null) { page.rightCaption = v; block = null; continue; }
    if ((m = /^Hinweis(?: \((\w+)\))?: (.*)$/.exec(line))) { page.hint = { kind: m[1] || null, text: m[2].trim() }; block = null; continue; }
    if (line.startsWith('HTML')) { block = null; continue; }
    if (line === 'Schritte:') { page.steps = []; block = 'steps'; continue; }
    if (line === 'Rechts-Schritte:') { page.rightSteps = []; block = 'rightSteps'; continue; }
    if (line === 'Notizen:') { page.notes = []; block = 'notes'; continue; }
    if (line === 'Abschnitte:') { page.sections = []; block = 'sections'; pendingH2 = null; continue; }
    if (line === 'Tabelle:') { page.table = []; block = 'table'; continue; }
    if ((block === 'steps' || block === 'rightSteps') && (m = /^(\d+)\. \*\*(.*?)\*\* — (.*)$/.exec(line))) { page[block].push({ n: +m[1], title: m[2].trim(), text: m[3].trim() }); continue; }
    if (block === 'notes' && (m = /^- \*\*(.*?)\*\* — (.*)$/.exec(line))) { page.notes.push({ title: m[1].trim(), text: m[2].trim() }); continue; }
    if (block === 'sections') {
      if ((m = /^### (.*)$/.exec(line))) { pendingH2 = m[1].trim(); continue; }
      if (pendingH2 !== null) { page.sections.push({ h2: pendingH2, text: line.trim() }); pendingH2 = null; continue; }
    }
    if (block === 'table' && /^\|.*\|$/.test(line)) { page.table.push(line.slice(1, -1).split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'))); continue; }
    throw new Error(`Zeile ${i + 1}: unbekannte Zeile im Vorgang ${page.nr}: „${line.slice(0, 60)}"`);
  }
  return decks;
}

function importieren(files) {
  let geaendert = 0;
  for (const f of files) {
    const decks = parse(fs.readFileSync(f, 'utf8'));
    for (const d of decks) {
      const file = path.join(ROOT, d.rel);
      if (!fs.existsSync(file)) { console.error('FEHLT:', d.rel); continue; }
      const vorher = fs.readFileSync(file, 'utf8');
      const deck = JSON.parse(vorher);
      const stand = JSON.stringify(deck);   // Vergleich über den Inhalt, nicht über die Formatierung
      if (d.title) deck.title = d.title;
      if (d.subtitle !== undefined) deck.subtitle = d.subtitle;
      if (d.audience !== undefined && d.audience !== '') { if (!AUD[d.audience]) throw new Error(`${d.rel}: Zielgruppe „${d.audience}" unbekannt`); deck.audience = d.audience; }
      if (d.notes) deck.notes = d.notes;
      if (d.pages.length !== deck.pages.length) throw new Error(`${d.rel}: ${d.pages.length} Vorgänge in der Prüfdatei, ${deck.pages.length} im Deck — Vorgänge nicht löschen oder hinzufügen`);
      d.pages.forEach((q, i) => {
        const p = deck.pages[i];
        if (p.card && p.card !== false && p.card.title === p.h1) p.card.title = q.h1;
        p.h1 = q.h1;
        if (q.cardText !== undefined && p.card && p.card !== false) p.card.text = q.cardText;
        if (q.sub !== undefined) p.sub = q.sub;
        if (q.leftCaption !== undefined) p.leftCaption = q.leftCaption;
        if (q.rightCaption !== undefined) p.rightCaption = q.rightCaption;
        for (const key of ['steps', 'rightSteps']) if (q[key]) {
          const alt = p[key] || [];
          p[key] = q[key].map((s, k) => ({ ...(alt[k] || {}), n: s.n, title: s.title, text: s.text }));
        }
        if (q.hint) p.hint = { ...(p.hint || {}), ...(q.hint.kind ? { kind: q.hint.kind } : {}), text: q.hint.text };
        if (q.notes) p.notes = q.notes;
        if (q.sections) p.sections = q.sections.map((s, k) => ({ ...((p.sections || [])[k] || {}), h2: s.h2, text: s.text }));
        if (q.table && p.table) {
          const rows = q.table.slice();
          if (p.table.head) p.table.head = rows.shift();
          p.table.rows = rows;
        }
      });
      if (JSON.stringify(deck) !== stand) { fs.writeFileSync(file, JSON.stringify(deck, null, 1) + '\n'); geaendert++; console.log('geändert:', d.rel); }
    }
  }
  console.log(geaendert ? `${geaendert} Decks aktualisiert — danach bauen (PDF + Web) und Portal pushen.` : 'Keine Änderungen.');
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'export') exportieren();
else if (cmd === 'import') {
  const files = args.includes('--alle')
    ? fs.readdirSync(OUT).filter(f => f.endsWith('.md') && f !== 'ALLE.md').map(f => path.join(OUT, f))
    : args.map(f => path.resolve(f));
  if (!files.length) { console.error('Welche Datei? node shared/pruefung.cjs import pruefung/laser.md'); process.exit(2); }
  importieren(files);
} else { console.error('Aufruf: node shared/pruefung.cjs export | import <datei.md …> | import --alle'); process.exit(2); }
