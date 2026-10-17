/* Portal-Suche — im Browser, ohne Suchserver.
   Drei Schichten, die sich ergänzen:
   1. Wörter (MiniSearch): Präfix, Tippfehler-Toleranz (1–2 Buchstaben je nach Wortlänge), Umlaute
      gefaltet, Komposita zerlegt („Ratenplan" trifft „Raten anpassen"), Beschriftungen in „…" hoch
      gewichtet. Anfrage-Wörter werden UND-verknüpft; ohne Treffer noch einmal mit ODER.
   2. Synonyme (shared/synonyme.json): jedes Anfrage-Wort wird um seine Gruppe erweitert.
   3. Bedeutung (Embeddings): die Anfrage wird vom Portal-Server eingebettet (POST /api/embed) und
      per Kosinus mit den Vektoren aller Einträge verglichen — findet Umschreibungen wie
      „Kundin will nicht mehr zahlen". Ergebnisse werden per Reciprocal Rank Fusion gemischt.
   Der Index entsteht beim ersten Öffnen aus search/docs.json (~700 Einträge, Millisekunden).      */
(function () {
  'use strict';
  const K = window.SucheKern;
  const dlg = document.querySelector('[data-search]');
  if (!dlg || !K) return;
  const input = dlg.querySelector('[data-search-input]');
  const list = dlg.querySelector('[data-search-results]');
  const meta = dlg.querySelector('[data-search-meta]');
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privates Fenster */ } },
  };
  const VORSCHLAEGE = ['Kundin finden', 'Rate pausieren', 'Widerruf erfassen', 'Termin abschließen', 'Passwort ändern', 'Standort wechseln', 'Bonus-Board', 'Dunkler Modus'];
  const ART = { serie: 'Themengebiet', anleitung: 'Anleitung', vorgang: 'Vorgang', schritt: 'Schritt', hinweis: 'Hinweis', tabelle: 'Nachschlagen', abschnitt: 'Erklärung' };

  let ms = null, docs = null, vocab = null, syn = null, vek = null, vekMeta = null, ladePromise = null;
  let hits = [], active = 0, lastQ = '', seq = 0, semantikAus = false;
  const embedCache = new Map();

  /* ---------- Laden und indizieren ---------- */
  function laden() {
    if (ladePromise) return ladePromise;
    ladePromise = fetch('/search/docs.json').then(r => r.json()).then(j => {
      docs = j.eintraege;
      vocab = new Set(j.vocab);
      syn = K.synonymTabelle(j.synonyme);
      vekMeta = j.vektoren;
      if (typeof MiniSearch === 'undefined') return;
      ms = new MiniSearch({
        idField: 'id',
        fields: ['titel', 'ui', 'seite', 'text', 'anleitung'],
        storeFields: ['art'],
        processTerm: (term) => {
          const t = K.fold(term);
          if (t.length < 2 || K.STOPP.has(t)) return null;
          const parts = K.split(t, vocab);
          return parts.length ? [t, ...parts] : t;
        },
        searchOptions: {
          processTerm: (term) => { const t = K.fold(term); return t.length < 2 || K.STOPP.has(t) ? null : t; },
          prefix: (term) => term.length >= 3,
          fuzzy: (term) => (term.length <= 3 ? false : term.length <= 6 ? 1 : 2),
          boost: { titel: 3, ui: 4, seite: 2, anleitung: 1.5 },
          combineWith: 'AND',
        },
      });
      ms.addAll(docs);
    }).catch(() => { meta.textContent = 'Die Suche konnte nicht geladen werden.'; });
    return ladePromise;
  }

  /* ---------- Anfrage aufbauen: Wörter + Zerlegung + Synonyme ---------- */
  function anfrage(q, combine) {
    const toks = K.tokens(q);
    if (!toks.length) return null;
    const einheiten = [];
    for (let i = 0; i < toks.length; i++) {
      const bi = toks[i + 1] ? toks[i] + ' ' + toks[i + 1] : null;
      if (bi && syn.has(bi)) { einheiten.push([bi, ...syn.get(bi)]); i++; continue; }
      const alts = new Set([toks[i]]);
      for (const p of K.split(toks[i], vocab)) alts.add(p);
      for (const s of (syn.get(toks[i]) || [])) alts.add(s);
      einheiten.push([...alts]);
    }
    const teil = (alts) => {
      const qs = alts.map(a => (a.includes(' ') ? { combineWith: 'AND', queries: a.split(' ') } : a));
      return qs.length === 1 ? qs[0] : { combineWith: 'OR', queries: qs };
    };
    const qs = einheiten.map(teil);
    return qs.length === 1 ? qs[0] : { combineWith: combine, queries: qs };
  }
  function woerter(q) {
    if (!ms) return { ids: [], notlauf: false };
    const aud = (() => { try { return localStorage.getItem('portal-aud') || ''; } catch (e) { return ''; } })();
    const opts = { boostDocument: (id, term, doc) => (aud && doc && doc.audience === aud ? 1.25 : 1) };
    const qAnd = anfrage(q, 'AND');
    if (!qAnd) return { ids: [], notlauf: false };
    let r = ms.search(qAnd, opts), notlauf = false;
    // Nicht alle Wörter gefunden: mit ODER weitersuchen — diese Treffer zählen aber weniger als
    // die Bedeutungssuche, sonst gewinnt eine Seite, die zufällig zwei der Wörter enthält.
    if (!r.length) { r = ms.search(anfrage(q, 'OR'), { ...opts, combineWith: 'OR' }); notlauf = true; }
    return { ids: r.slice(0, 40).map(x => x.id), notlauf };
  }

  /* ---------- Bedeutung ---------- */
  async function bedeutung(q) {
    if (!vekMeta || semantikAus) return [];
    let v = embedCache.get(q);
    if (!v) {
      const r = await fetch('/api/embed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q }) });
      if (!r.ok) { if (r.status === 503 || r.status === 404) semantikAus = true; return []; }
      v = (await r.json()).v;
      if (!Array.isArray(v)) return [];
      embedCache.set(q, v);
    }
    if (!vek) vek = new Int8Array(await (await fetch('/search/vektoren.bin')).arrayBuffer());
    const d = vekMeta.dims, n = vekMeta.n, sk = vekMeta.skalen;
    const out = [];
    for (let i = 0; i < n; i++) {
      let s = 0;
      const off = i * d;
      for (let j = 0; j < d; j++) s += v[j] * vek[off + j];
      s = s * sk[i] / 127;
      if (s > 0.3) out.push([i, s]);
    }
    out.sort((a, b) => b[1] - a[1]);
    return out.slice(0, 25).map(([i]) => docs[i].id);
  }

  /* ---------- Mischen und gruppieren ---------- */
  function mischen(wort, sinn) {
    const score = new Map(), quelle = new Map();
    const add = (ids, w, q) => ids.forEach((id, r) => {
      score.set(id, (score.get(id) || 0) + w / (20 + r));
      quelle.set(id, (quelle.get(id) || new Set()).add(q));
    });
    add(wort.ids, wort.notlauf ? 0.55 : 1, 'w');
    add(sinn, wort.notlauf ? 1 : 0.9, 's');
    const ids = [...score].sort((a, b) => b[1] - a[1]).map(([id]) => id);
    // Je Vorgang nur der beste Eintrag — sonst füllen fünf Schritte derselben Seite die Liste
    const seen = new Set(), out = [];
    for (const id of ids) {
      const e = docs[id];
      const key = e.url.split('?')[0];
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ e, nurSinn: !quelle.get(id).has('w') });
      if (out.length >= 12) break;
    }
    return out;
  }

  /* ---------- Darstellung ---------- */
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function markieren(text, q) {
    const toks = K.tokens(q).filter(t => t.length >= 2);
    if (!toks.length) return esc(text);
    return esc(text).replace(/[A-Za-zÄÖÜäöüß0-9-]+/g, (w) => {
      const f = K.fold(w);
      return toks.some(t => f.startsWith(t) || (t.length >= 5 && f.includes(t))) ? '<mark>' + w + '</mark>' : w;
    });
  }
  function kurz(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).replace(/\s\S*$/, '') + '…' : s; }
  function zeichnen(q) {
    list.innerHTML = hits.map(({ e, nurSinn }, i) => {
      const titel = e.art === 'schritt' ? `Schritt ${e.n}: ${e.titel}` : e.titel;
      const pfad = e.art === 'serie'
        ? `<b>Serie</b> › ${e.anzahl || ''} Anleitungen`
        : [`<b>${esc(e.serie)} ${esc(e.nr)}</b>`, esc(e.anleitung), e.seite && e.seite !== e.titel ? esc(e.seite) : ''].filter(Boolean).join(' › ');
      return `<li class="${i === active ? 'is-active' : ''}"><a href="${esc(e.url)}" data-i="${i}">
  <div class="hit-eyebrow">${pfad}<span class="hit-art${nurSinn ? ' semantisch' : ''}">${nurSinn ? 'ähnliches Thema' : ART[e.art] || e.art}</span></div>
  <div class="hit-titel">${markieren(titel, q)}</div>
  ${e.text ? `<div class="hit-text">${markieren(kurz(e.text, 170), q)}</div>` : ''}
</a></li>`;
    }).join('');
    const a = list.querySelector('li.is-active');
    if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest' });
  }
  function leerZeigen() {
    const zuletzt = store.get('portal-recent') || [];
    const vorschlag = (arr, label) => arr.length ? `<div class="search-sugg">${label}</div><ol class="search-results">`
      + arr.map(q => `<li><a href="#" data-q="${esc(q)}"><div class="hit-titel">${esc(q)}</div></a></li>`).join('') + '</ol>' : '';
    list.innerHTML = vorschlag(zuletzt, 'Zuletzt gesucht') + vorschlag(VORSCHLAEGE.filter(v => !zuletzt.includes(v)).slice(0, 6), 'Zum Beispiel');
    meta.textContent = docs ? `${docs.length} Einträge aus ${new Set(docs.map(d => d.anleitung)).size} Anleitungen durchsuchbar` : '';
    hits = []; active = 0;
  }

  /* ---------- Suchen (entprellt) ---------- */
  let timer = null;
  function suchen() {
    const q = input.value.trim();
    if (q === lastQ) return;
    lastQ = q;
    const my = ++seq;
    if (!q) { leerZeigen(); return; }
    laden().then(async () => {
      if (my !== seq) return;
      const wort = woerter(q);
      hits = mischen(wort, []);
      active = 0;
      meta.textContent = hits.length ? `${hits.length} Treffer` + (vekMeta && !semantikAus ? ' · ähnliche Themen werden gesucht …' : '') : 'Nichts gefunden — ' + (vekMeta && !semantikAus ? 'ähnliche Themen werden gesucht …' : 'andere Wörter versuchen?');
      zeichnen(q);
      if (!vekMeta || semantikAus) return;
      let sinn = [];
      try { sinn = await bedeutung(q); } catch (e) { sinn = []; }
      if (my !== seq) return;
      hits = mischen(wort, sinn);
      meta.textContent = hits.length ? `${hits.length} Treffer` + (sinn.length ? ' · inklusive ähnlicher Themen' : '') : 'Nichts gefunden — andere Wörter versuchen?';
      zeichnen(q);
    });
  }
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(suchen, 130); });

  /* ---------- Öffnen, Schließen, Tastatur ---------- */
  function oeffnen(text) {
    dlg.hidden = false;
    document.body.classList.add('search-open');
    if (typeof text === 'string') input.value = text;
    input.focus();
    input.select();
    laden().then(() => { if (!input.value.trim()) leerZeigen(); });
    if (input.value.trim()) { lastQ = ''; suchen(); } else leerZeigen();
  }
  function schliessen() {
    dlg.hidden = true;
    document.body.classList.remove('search-open');
  }
  function merken(q) {
    const arr = (store.get('portal-recent') || []).filter(x => x !== q);
    arr.unshift(q);
    store.set('portal-recent', arr.slice(0, 5));
  }
  function gehen(i) {
    const h = hits[i];
    if (!h) return;
    merken(input.value.trim());
    location.href = h.e.url;
  }
  document.querySelectorAll('[data-search-open]').forEach(b => b.addEventListener('click', () => oeffnen()));
  dlg.querySelectorAll('[data-search-close]').forEach(b => b.addEventListener('click', schliessen));
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) schliessen();
    const sugg = e.target.closest('a[data-q]');
    if (sugg) { e.preventDefault(); input.value = sugg.dataset.q; lastQ = ''; suchen(); input.focus(); return; }
    const a = e.target.closest('a[data-i]');
    if (a) { e.preventDefault(); gehen(parseInt(a.dataset.i, 10)); }
  });
  document.addEventListener('keydown', (e) => {
    const offen = !dlg.hidden;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); offen ? schliessen() : oeffnen(); return; }
    const tag = (e.target.tagName || '').toLowerCase();
    if (!offen && e.key === '/' && tag !== 'input' && tag !== 'textarea') { e.preventDefault(); oeffnen(); return; }
    if (!offen) return;
    if (e.key === 'Escape') { e.preventDefault(); schliessen(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (hits.length) { active = (active + 1) % hits.length; zeichnen(input.value.trim()); } }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hits.length) { active = (active - 1 + hits.length) % hits.length; zeichnen(input.value.trim()); } }
    if (e.key === 'Enter') { e.preventDefault(); gehen(active); }
  });
  // Startseite: Suchbegriff aus der Adresse (?q=…) — der Hub verlinkt so aus seinem Suchfeld
  const q0 = new URLSearchParams(location.search).get('q');
  if (q0) oeffnen(q0);
})();
