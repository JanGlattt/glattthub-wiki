/* Seitenstruktur einer Hub-Seite ausgeben — Hilfswerkzeug beim Schreiben eines Aufnahmeplans.
   Zeigt Überschriften, Karten-Titel, Reiter, Knöpfe und Menüpunkte mit ihren Selektoren,
   damit ein Screenshot gezielt zu einem Abschnitt scrollen oder ein Fenster öffnen kann.

   Aufruf (im Serien-Ordner, .env geladen):
     node ../shared/lib/explore.cjs /hub/reports/sales-statistics [--click "Zahlungen & SEPA"] [--tab Verlauf]
   Ausgabe: Zeilen der Form  <typ>  <selektor>  „Text"  (y-Position)                                  */
const S = require('./shoot.cjs');

const args = process.argv.slice(2);
const urls = args.filter(a => a.startsWith('/'));
const clicks = [];
const finds = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--click' || args[i] === '--tab') clicks.push(args[++i]);
  if (args[i] === '--find') finds.push(args[++i]);
}
if (!urls.length) { console.error('Aufruf: node explore.cjs /hub/pfad [/weitere/pfade …] [--click "Beschriftung"]'); process.exit(2); }

async function dump(page) {
  const rows = await page.evaluate(() => {
    const out = [];
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    const sel = 'h1, h2, h3, h4, .card-glattt-title, .card-glattt-header, .tab-glattt-sidebar, [role=tab], button, a.btn-glattt-primary, a.btn-glattt-secondary, .btn-glattt-primary, .btn-glattt-secondary, .btn-glattt-tertiary, .dropdown-glattt-item, summary, .stat-strip-glattt-item, .kpi-dashboard-item, .page-header-glattt-actions > *, .modal-glattt-title, .modal-glattt-header';
    const seen = new Set();
    document.querySelectorAll(sel).forEach(el => {
      if (el.offsetParent === null) return;
      // Seitenleiste, mobile Leiste und deren Schubladen weglassen — sie stehen auf jeder Seite
      if (el.closest('#sidebar, .sidebar, .mobile-bottom-nav, .mobile-more-sheet, nav[aria-label="Navigation"]')) return;
      const t = norm(el.textContent).slice(0, 70);
      if (!t) return;
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) return;
      const key = el.tagName + t + Math.round(b.y + window.scrollY);
      if (seen.has(key)) return; seen.add(key);
      const cls = [...el.classList].slice(0, 3).join('.');
      out.push({ tag: el.tagName.toLowerCase(), cls, t, y: Math.round(b.y + window.scrollY), h: Math.round(b.height) });
    });
    return { title: document.title, h: document.documentElement.scrollHeight, out };
  });
  console.log(`# ${rows.title} · Seitenhöhe ${rows.h}px`);
  for (const r of rows.out) console.log(`${String(r.y).padStart(5)}  ${r.tag}${r.cls ? '.' + r.cls : ''}  „${r.t}"`);
}

(async () => {
  const { browser, ctx, page } = await S.launch();
  page.removeAllListeners('console'); page.removeAllListeners('pageerror');
  await S.login(page, ctx);
  for (const url of urls) {
    console.log('\n=== ' + url);
    try {
      await S.goto(page, url, 4000);
      await S.waitLoaded(page);
      for (const c of clicks) { await S.clickText(page, 'button, a, .tab-glattt-sidebar, [role=tab], summary, label', c, 1500); await S.waitLoaded(page); }
      await dump(page);
      // --find „Text": die kleinsten sichtbaren Elemente mit diesem Text samt Tag, Klassen und href
      for (const f of finds) {
        const hits = await page.evaluate((t) => [...document.querySelectorAll('body *')]
          .filter(e => e.offsetParent !== null && e.textContent.includes(t) && ![...e.children].some(c => c.textContent.includes(t)))
          .slice(0, 6).map(e => { const a = e.closest('a, button'); return `${e.tagName.toLowerCase()}.${[...e.classList].join('.')}  „${e.textContent.trim().slice(0, 60)}"` + (a ? `  ← ${a.tagName.toLowerCase()}.${[...a.classList].join('.')} ${a.getAttribute('href') || ''}` : ''); }), f);
        console.log('--find ' + f + ':'); hits.forEach(h => console.log('   ' + h));
      }
    } catch (e) { console.log('FEHLER', e.message.split('\n')[0]); }
  }
  await browser.close();
})();
