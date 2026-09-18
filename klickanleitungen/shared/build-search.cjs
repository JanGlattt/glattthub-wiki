/* Suchindex fürs Portal aus manifest.json (schreibt build-web.cjs).
   Aufruf:  node shared/build-search.cjs <dist>        (dist = WEB_OUT des Web-Builds)
   Ausgabe: <dist>/search/docs.json      Einträge (Anleitung, Vorgang, Schritt, Hinweis, Tabellenzeile,
                                         Abschnitt), Wortschatz für die Komposita-Zerlegung, Synonyme
            <dist>/search/vektoren.bin   Embeddings (Int8, je Eintrag `dims` Werte) über Vertex AI
                                         (gemini-embedding-001, Dienstkonto, kein Schlüssel);
                                         PORTAL_EMBEDDINGS=0 überspringt sie (lokal, ohne gcloud)

   Der Index selbst entsteht im Browser (MiniSearch, ~2.700 Einträge in wenigen Millisekunden);
   hier werden nur die Einträge vorbereitet. Die Bedeutungssuche vergleicht die Anfrage per
   Kosinus mit den Vektoren; die Anfrage bettet der Portal-Server ein (POST /api/embed).           */
const fs = require('fs');
const path = require('path');
const K = require('./assets/suche-kern.js');
const V = require('../portal/vertex.cjs');

const dist = path.resolve(process.argv[2] || 'portal/dist');
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.json'), 'utf8'));
const synonyme = JSON.parse(fs.readFileSync(path.join(__dirname, 'synonyme.json'), 'utf8')).gruppen;
const outDir = path.join(dist, 'search');
fs.mkdirSync(outDir, { recursive: true });

const MODELL = V.MODEL;
const DIMS = V.DIMS;

const strip = (s) => String(s ?? '').replace(/\*\*/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const uiOf = (...texte) => [...new Set(texte.flatMap(t => [...String(t ?? '').matchAll(/„(.+?)“/g)].map(m => m[1])))];
const kurz = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s\S*$/, '') + '…' : s);

const eintraege = [];
let id = 0;
const add = (e) => eintraege.push({ id: id++, ...e });

for (const g of manifest.guides) {
  const base = { serie: g.series, nr: g.nr, anleitung: g.title, audience: g.audience || '' };
  add({ ...base, art: 'anleitung', url: g.url, seite: '', titel: g.title,
    text: strip([g.subtitle, ...(g.notes || [])].join(' ')), ui: uiOf(g.subtitle, ...(g.notes || [])) });
  for (const p of g.pages) {
    const purl = g.url + '#v' + p.nr;
    const teile = [p.sub,
      ...p.steps.map(s => `${s.title}. ${s.text}`),
      ...p.notes.map(n => `${n.title}. ${n.text}`),
      ...p.hints.map(h => h.text),
      ...(p.sections || []).map(s => `${s.h2}. ${s.text}`),
      ...(p.table ? p.table.rows.map(r => r.join(' · ')) : []),
      ...p.shots.map(s => s.caption)];
    add({ ...base, art: 'vorgang', url: purl, seite: p.h1, titel: p.h1, vorgang: p.nr,
      text: kurz(strip(teile.join(' ')), 700), ui: uiOf(...teile) });
    for (const s of p.steps) add({ ...base, art: 'schritt', n: s.n, url: purl + '?s=' + s.n, seite: p.h1, vorgang: p.nr,
      titel: strip(s.title), text: strip(s.text), ui: uiOf(s.title, s.text) });
    for (const n of p.notes) add({ ...base, art: 'hinweis', url: purl, seite: p.h1, vorgang: p.nr,
      titel: strip(n.title), text: strip(n.text), ui: uiOf(n.title, n.text) });
    for (const h of p.hints) add({ ...base, art: 'hinweis', url: purl, seite: p.h1, vorgang: p.nr,
      titel: 'Hinweis', text: strip(h.text), ui: uiOf(h.text) });
    for (const s of (p.sections || [])) add({ ...base, art: 'abschnitt', url: purl, seite: p.h1, vorgang: p.nr,
      titel: strip(s.h2), text: strip(s.text), ui: uiOf(s.h2, s.text) });
    if (p.table) for (const r of p.table.rows) add({ ...base, art: 'tabelle', url: purl, seite: p.h1, vorgang: p.nr,
      titel: strip(r[0]), text: strip(r.slice(1).join(' · ')), ui: uiOf(...r) });
  }
}

// Wortschatz: Wörter ab vier Buchstaben, die mindestens zweimal vorkommen, plus alle Synonyme.
// Grundlage der Komposita-Zerlegung („ratenplan" → raten + plan) im Browser und beim Indizieren.
const freq = new Map();
for (const e of eintraege) for (const t of K.tokens([e.titel, e.seite, e.text, e.anleitung, ...(e.ui || [])].join(' '))) {
  if (t.length >= 4) freq.set(t, (freq.get(t) || 0) + 1);
}
const vocab = new Set([...freq].filter(([, n]) => n >= 2).map(([t]) => t));
for (const g of synonyme) for (const w of g) for (const t of K.tokens(w)) if (t.length >= 4) vocab.add(t);

const docs = { generiert: new Date().toISOString().slice(0, 10), modell: null, vocab: [...vocab].sort(), synonyme, eintraege, vektoren: null };

(async () => {
  if (process.env.PORTAL_EMBEDDINGS === '0') {
    console.log('Hinweis: PORTAL_EMBEDDINGS=0 — Suche ohne Bedeutungsvergleich (nur Wörter, Tippfehler, Synonyme).');
  } else {
    // Ein Aufruf je Eintrag (gemini-embedding-001 nimmt keinen Stapel), parallel; scheitert die
    // Anmeldung, bricht der Bau laut ab — ein Portal ohne Bedeutungssuche soll nicht still entstehen.
    const texte = eintraege.map(e => kurz(`${e.serie} ${e.nr} – ${e.anleitung}${e.seite ? ' › ' + e.seite : ''}: ${e.titel}. ${e.text}`, 1500));
    const vektoren = await V.embedAll(texte, 'RETRIEVAL_DOCUMENT', {
      parallel: 8, onProgress: (d, n) => { if (d % 100 === 0 || d === n) process.stdout.write(`Embeddings ${d}/${n}\r`); },
    });
    const vecs = new Int8Array(texte.length * DIMS);
    const skalen = new Array(texte.length).fill(0);
    vektoren.forEach((v, idx) => {
      let max = 0;
      for (const x of v) max = Math.max(max, Math.abs(x));
      skalen[idx] = max;
      for (let j = 0; j < DIMS; j++) vecs[idx * DIMS + j] = Math.round(v[j] / max * 127);
    });
    fs.writeFileSync(path.join(outDir, 'vektoren.bin'), Buffer.from(vecs.buffer));
    docs.modell = MODELL;
    docs.vektoren = { dims: DIMS, n: texte.length, skalen: skalen.map(s => Number(s.toFixed(5))) };
    console.log(`\nEmbeddings (${MODELL}, ${V.LOCATION}): ${texte.length} × ${DIMS} (Int8, ${(vecs.byteLength / 1024).toFixed(0)} KB)`);
  }
  fs.writeFileSync(path.join(outDir, 'docs.json'), JSON.stringify(docs));
  const arten = {};
  for (const e of eintraege) arten[e.art] = (arten[e.art] || 0) + 1;
  console.log('SUCHE', path.join(outDir, 'docs.json'), '·', eintraege.length, 'Einträge', JSON.stringify(arten), '· Wortschatz', vocab.size);
})().catch(e => { console.error(e); process.exit(1); });
