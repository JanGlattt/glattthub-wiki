/* Aufnahmeplan ausführen — für Serien, deren Screenshots sich als Tabelle beschreiben lassen.
   Jede Zeile ist ein Screenshot: Seite, Vorbereitungsschritte, Bildausschnitt, Markierungen.

     { name: 'r1-personen', url: '/hub/reports/sales-statistics',
       steps: [['scroll', '.card-glattt-title', 'Verkäufe je Mitarbeiterin']],
       clip: 'card:Verkäufe je Mitarbeiterin',          // oder ein Selektor, oder weglassen (ganzer Bildschirm)
       marks: [{ id: 'tabelle', kind: 'frame', color: 'teal', sel: '.table-glattt' }] }

   Schritte (steps):
     ['click', sel, text]        sichtbares Element mit Beschriftung anklicken (Reiter, Knopf, Menüpunkt)
     ['tab', text]               Reiter der Seitenleisten-Tabs (.tab-glattt-sidebar) oder [role=tab]
     ['scroll', sel, text]       zum Abschnitt mit dieser Überschrift scrollen (Kopf bleibt sichtbar)
     ['scrollSel', sel]          Element in die Mitte scrollen
     ['fill', sel, value]        Eingabefeld füllen (Livewire/Alpine-tauglich)
     ['type', sel, value]        Zeichen für Zeichen tippen (Suchfelder mit Verzögerung)
     ['press', key]              Taste (Escape, Enter …)
     ['wait', ms]                Pause
     ['loaded']                  auf Lade-Platzhalter warten
     ['fn', async (page, L) => {}]   beliebiger Schritt

   Der Plan verändert nichts, solange kein Schritt einen speichernden Knopf drückt —
   Fenster werden geöffnet, fotografiert und mit Escape wieder geschlossen.                         */
async function step(page, L, s) {
  const [op, a, b] = s;
  switch (op) {
    case 'click': return L.clickText(page, a, b, s[3] ?? 1500);
    case 'tab': return L.clickText(page, '.tab-glattt-sidebar, [role=tab], .tabs-glattt button, .tab-band-glattt button, .tab-band-glattt a', a, s[2] ?? 2500);
    case 'scroll': return L.scrollToText(page, a, b, s[3] ?? 96);
    case 'scrollSel': return L.scrollTo(page, a, b || 'center');
    case 'fill':
      await page.evaluate(([sel, v]) => {
        const el = [...document.querySelectorAll(sel)].find(e => e.offsetParent !== null);
        if (!el) return;
        Object.getOwnPropertyDescriptor(el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, [a, b]);
      return L.wait(page, s[3] ?? 1200);
    case 'type': {
      const loc = page.locator(a).first();
      await loc.click({ timeout: 5000 }).catch(() => {});
      await loc.fill('');
      await loc.type(b, { delay: 40 });
      return L.wait(page, s[3] ?? 1800);
    }
    case 'press': await page.keyboard.press(a); return L.wait(page, b ?? 600);
    case 'wait': return L.wait(page, a);
    case 'loaded': return L.waitLoaded(page);
    case 'fn': return a(page, L);
    default: console.log('Unbekannter Schritt', op);
  }
}

async function resolveClip(page, L, clip) {
  if (!clip) return null;
  if (typeof clip === 'object') return clip;
  // „?…" = optional: fehlt das Element, wird der ganze Bildschirm genommen (ohne Warnung)
  const optional = clip.startsWith('?');
  if (optional) clip = clip.slice(1);
  const box = clip.startsWith('card:') ? await L.cardClip(page, clip.slice(5)) : await L.clipOf(page, clip, 16);
  return box || (optional ? undefined : null);
}

/** Plan ausführen. `nur` = Namen aus der Kommandozeile, leer = alle. */
async function run(PLAN, L, { nur = [], launch = null, before = null } = {}) {
  const { browser, ctx, page } = await (launch || L.launch)();
  await L.login(page, ctx);
  if (before) await before(page, L);
  let letzte = null, fehler = 0;
  for (const p of PLAN) {
    if (nur.length && !nur.includes(p.name)) continue;
    try {
      // Fenster/Menüs der vorigen Zeile schließen; Seite neu laden, wenn die vorige Zeile
      // weiternavigiert hat (Detailseite, Reiter mit eigener Adresse) oder ein Fenster offen blieb
      await page.keyboard.press('Escape').catch(() => {});
      await L.wait(page, 300);
      const hier = (() => { try { return new URL(page.url()).pathname; } catch (e) { return ''; } })();
      const offen = await page.evaluate(() => !![...document.querySelectorAll('.modal-glattt, .modal-glattt-backdrop')].find(e => e.offsetParent !== null)).catch(() => false);
      if (p.url !== letzte || p.reload || hier !== p.url || offen) {
        await L.goto(page, p.url, p.wait || 3000);
        await L.waitLoaded(page);
        letzte = p.url;
      }
      for (const s of (p.steps || [])) await step(page, L, s);
      const clip = await resolveClip(page, L, p.clip);
      if (p.clip && clip === null) console.log('AUSSCHNITT FEHLT:', p.name, p.clip);
      await L.shot(page, p.name, {
        clip,
        noScroll: !!(p.clip || p.noScroll || (p.steps || []).some(s => s[0] === 'scroll' || s[0] === 'scrollSel')),
        marks: (p.marks || []).map(m => (typeof m === 'string' ? { kind: 'frame', color: 'teal', sel: m } : m)),
      });
      if (p.after) await p.after(page, L);
    } catch (e) {
      fehler++;
      console.log('FEHLER bei', p.name, '—', e.message.split('\n')[0]);
      letzte = null;
    }
  }
  await browser.close();
  console.log(fehler ? `!!! ${fehler} Fehler` : '### Plan ohne Fehler durchgelaufen');
}

module.exports = { run, step };
