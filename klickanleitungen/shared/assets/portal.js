/* Portal hilfe.hub.glattt.com — Viewer und Bedienung (ohne Abhängigkeiten).
   - Navigation (Seitenleiste als Schublade auf dem Telefon), Hell/Dunkel
   - Zielgruppen-Filter auf der Startseite (merkt sich die Wahl im Browser)
   - Stepper: eine Anleitung Vorgang für Vorgang — Zurück/Weiter, Pfeiltasten, Wischen,
     Adresse #v3 bleibt teilbar; „Alle Vorgänge untereinander" als zweiter Modus
   - Schritt ↔ Markierung: Maus/Fokus auf Schritt 3 hebt Plakette 3 im Bild hervor, Klick pinnt
   - Lightbox: Klick aufs Bild zeigt es bildschirmfüllend, Markierungen inklusive                   */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* privates Fenster */ } },
  };

  /* ---------- Hell / Dunkel ---------- */
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark'
      || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    store.set('portal-theme', next);
  }));

  /* ---------- Seitenleiste (Telefon) ---------- */
  const navBtn = $('[data-nav-toggle]');
  const setNav = (open) => {
    document.body.classList.toggle('nav-open', open);
    if (navBtn) navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  if (navBtn) navBtn.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  $$('[data-nav-close]').forEach(el => el.addEventListener('click', () => setNav(false)));
  // Aktuellen Eintrag in der Seitenleiste ins Bild holen
  const cur = $('.side a[aria-current]');
  if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'center' });

  /* ---------- Zielgruppen-Filter ---------- */
  const filter = $('[data-audience-filter]');
  function applyAudience(aud) {
    const root = document.body;
    root.classList.toggle('is-filtered', !!aud);
    $$('[data-aud]').forEach(el => {
      const auds = (el.dataset.aud || '').split(',').filter(Boolean);
      el.classList.toggle('is-match', !aud || auds.includes(aud));
    });
    if (filter) $$('.chip-btn', filter).forEach(b => b.classList.toggle('is-on', (b.dataset.aud || '') === (aud || '')));
    const cards = $$('.serie-card');
    const leer = $('[data-filter-leer]');
    if (leer) leer.hidden = !aud || cards.some(c => !aud || c.classList.contains('is-match'));
  }
  if (filter) {
    filter.addEventListener('click', (e) => {
      const b = e.target.closest('.chip-btn');
      if (!b) return;
      store.set('portal-aud', b.dataset.aud || '');
      applyAudience(b.dataset.aud || '');
    });
    applyAudience(store.get('portal-aud') || '');
  }

  /* ---------- Stepper ---------- */
  const guide = $('article.guide');
  if (guide) {
    const sections = $$('section.vorgang', guide);
    const N = sections.length;
    const params = new URLSearchParams(location.search);
    let mode = store.get('portal-mode') === 'alles' ? 'alles' : 'schritt';
    if (N < 2) mode = 'alles';
    let index = 0;

    const fromHash = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (!h) return 0;
      const m = /^v(\d+)$/.exec(h);
      if (m) return Math.min(N - 1, Math.max(0, parseInt(m[1], 10) - 1));
      const i = sections.findIndex(s => s.dataset.slug === h || $('#' + CSS.escape(h), s));
      return i === -1 ? 0 : i;
    };
    const titleOf = (i) => sections[i]?.dataset.titel || '';

    function render(scroll) {
      document.body.classList.toggle('mode-schritt', mode === 'schritt');
      document.body.classList.toggle('mode-alles', mode === 'alles');
      sections.forEach((s, i) => s.classList.toggle('is-current', i === index));
      $$('[data-toc]', guide).forEach(a => a.classList.toggle('is-current', parseInt(a.dataset.toc, 10) === index + 1));
      $$('[data-pos]', guide).forEach(el => { el.innerHTML = `Vorgang <b>${index + 1}</b> von ${N} · <b>${esc(titleOf(index))}</b>`; });
      const first = index === 0, last = index === N - 1;
      $$('[data-prev]', guide).forEach(b => { b.disabled = first; });
      $$('[data-prev-label]', guide).forEach(el => { el.textContent = first ? 'Zurück' : 'Zurück: ' + titleOf(index - 1); });
      $$('[data-next]', guide).forEach(b => {
        b.disabled = false;
        if (last) { b.classList.remove('btn-primary'); } else { b.classList.add('btn-primary'); }
      });
      $$('[data-next-label]', guide).forEach(el => { el.textContent = last ? 'Fertig · zur Übersicht' : 'Weiter: ' + titleOf(index + 1); });
      const toggle = $('[data-mode-toggle]', guide);
      if (toggle) {
        toggle.setAttribute('aria-pressed', mode === 'alles' ? 'true' : 'false');
        $('[data-mode-label]', toggle).textContent = mode === 'alles' ? 'Vorgang für Vorgang' : 'Alle Vorgänge untereinander';
      }
      if (scroll) {
        const target = mode === 'schritt' ? $('.vorgang-nav', guide) || sections[index] : sections[index];
        const top = target.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
    function go(i, scroll = true) {
      if (i < 0) return;
      if (i >= N) { location.href = '/'; return; }
      index = i;
      history.replaceState(null, '', location.pathname + location.search + '#v' + (i + 1));
      render(scroll);
      // Beim Wechsel die gepinnte Markierung lösen
      $$('.step.is-pinned', guide).forEach(s => s.classList.remove('is-pinned'));
      $$('.badge.is-on', guide).forEach(b => b.classList.remove('is-on'));
      $$('.shot.has-focus', guide).forEach(s => s.classList.remove('has-focus'));
    }
    $$('[data-prev]', guide).forEach(b => b.addEventListener('click', () => go(index - 1)));
    $$('[data-next]', guide).forEach(b => b.addEventListener('click', () => go(index + 1)));
    $$('[data-toc]', guide).forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); go(parseInt(a.dataset.toc, 10) - 1); }));
    const modeBtn = $('[data-mode-toggle]', guide);
    if (modeBtn) modeBtn.addEventListener('click', () => {
      mode = mode === 'alles' ? 'schritt' : 'alles';
      store.set('portal-mode', mode);
      render(true);
    });
    window.addEventListener('hashchange', () => { const i = fromHash(); if (i !== index) go(i); });
    document.addEventListener('keydown', (e) => {
      if (document.body.classList.contains('search-open') || document.body.classList.contains('nav-open')) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (mode !== 'schritt') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    });
    // Wischen auf dem Telefon
    let tx = null, ty = null;
    guide.addEventListener('touchstart', (e) => { const t = e.changedTouches[0]; tx = t.clientX; ty = t.clientY; }, { passive: true });
    guide.addEventListener('touchend', (e) => {
      if (tx === null || mode !== 'schritt') return;
      const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
      tx = ty = null;
      if (Math.abs(dx) > 70 && Math.abs(dy) < 50) go(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });

    index = fromHash();
    render(false);
    // Aus der Suche kommend: Schritt hervorheben (?s=3)
    const s = parseInt(params.get('s') || '', 10);
    if (s) {
      const step = $(`.step[data-n="${s}"]`, sections[index]);
      if (step) { setTimeout(() => { pin(step, true); step.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 150); }
    }
  }

  /* ---------- Schritt ↔ Markierung ---------- */
  function badgesFor(step) {
    const sec = step.closest('section.vorgang') || document;
    return $$(`.badge[data-n="${step.dataset.n}"]`, sec);
  }
  function light(step, on) {
    const badges = badgesFor(step);
    badges.forEach(b => {
      b.classList.toggle('is-on', on);
      const shot = b.closest('.shot');
      if (shot) shot.classList.toggle('has-focus', on || !!$('.badge.is-on', shot));
    });
    step.classList.toggle('is-on', on);
  }
  function pin(step, on) {
    const sec = step.closest('section.vorgang') || document;
    $$('.step.is-pinned', sec).forEach(s => { if (s !== step) { s.classList.remove('is-pinned'); light(s, false); } });
    step.classList.toggle('is-pinned', on);
    light(step, on);
  }
  $$('.step[data-n]').forEach(step => {
    step.tabIndex = 0;
    step.addEventListener('mouseenter', () => { if (!step.classList.contains('is-pinned')) light(step, true); });
    step.addEventListener('mouseleave', () => { if (!step.classList.contains('is-pinned')) light(step, false); });
    step.addEventListener('focus', () => light(step, true));
    step.addEventListener('blur', () => { if (!step.classList.contains('is-pinned')) light(step, false); });
    step.addEventListener('click', () => pin(step, !step.classList.contains('is-pinned')));
    step.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pin(step, !step.classList.contains('is-pinned')); } });
  });
  document.addEventListener('click', (e) => {
    const badge = e.target.closest('.badge[data-n]');
    if (!badge || badge.closest('.lightbox')) return;
    e.stopPropagation();
    const sec = badge.closest('section.vorgang') || document;
    const step = $(`.step[data-n="${badge.dataset.n}"]`, sec);
    if (step) { pin(step, true); step.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }, true);

  /* ---------- Lightbox ---------- */
  document.addEventListener('click', (e) => {
    const shot = e.target.closest('.shot');
    if (!shot || shot.closest('.lightbox') || e.target.closest('.badge')) return;
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Bild vergrößert');
    const clone = shot.cloneNode(true);
    clone.classList.remove('has-focus');
    box.appendChild(clone);
    const close = () => { box.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (ev) => { if (ev.key === 'Escape') close(); };
    box.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(box);
  });

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
})();
