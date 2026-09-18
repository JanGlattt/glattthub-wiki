/* Aufnahmelauf „Team" — Personal, Reisekosten, Freigabe.
   Der Lauf **liest nur**: Fenster (Konto-Assistent, Archivieren) werden geöffnet und verworfen,
   keine Abrechnung wird eingereicht, keine freigegeben.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs p2-person       (einzeln)                                         */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const uebersicht = ['click', 'a, button, .card-glattt', 'Personalübersicht', 3500];
const erstePerson = ['fn', async (page, L) => {
  const ok = await page.evaluate(() => {
    const el = [...document.querySelectorAll('tbody tr a[href], tbody tr, .staff-card-glattt a, a[href*="/hub/staff/"]')].find(e => e.offsetParent !== null && !/reisekosten/.test(e.getAttribute('href') || ''));
    if (!el) return false; el.click(); return true;
  });
  if (!ok) console.log('PERSON FEHLT');
  await L.wait(page, 3500); await L.waitLoaded(page);
}];
const mitarbeiterWaehlen = ['fn', async (page, L) => {
  // Natives Select im Seitenkopf (nicht das versteckte in der Seitenleiste): zweite Option wählen
  const ok = await page.evaluate(() => {
    const sel = [...document.querySelectorAll('main select, .page-header-glattt select, .page-header-glattt-actions select, select')].find(s => s.offsetParent !== null && s.options.length > 1);
    if (!sel) return false;
    sel.value = sel.options[1].value;
    sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  });
  if (ok) { await L.wait(page, 3500); await L.waitLoaded(page); return; }
  await L.clickText(page, '.dropdown-glattt-trigger', 'Mitarbeiter', 800);
  await page.evaluate(() => { const o = [...document.querySelectorAll('.dropdown-glattt-item, [role=option]')].find(e => e.offsetParent !== null); if (o) o.click(); });
  await L.wait(page, 3500); await L.waitLoaded(page);
}];

const PLAN = [
  // ── Team 1: Personal
  { name: 'p1-personal', url: '/hub/staff', steps: [['loaded'], uebersicht, ['loaded']], marks: [
    { id: 'suche', kind: 'badge', n: 1, sel: '.search-glattt, input[type=search]', at: 'l' },
    { id: 'tabelle', kind: 'frame', color: 'teal', sel: '.table-glattt' },
  ] },
  { name: 'p2-person', url: '/hub/staff', steps: [['loaded'], uebersicht, ['loaded'], erstePerson] },
  { name: 'p3-konto-wizard', url: '/hub/staff', steps: [['loaded'], uebersicht, ['loaded'], ['click', 'button, a', 'Konto', 2000]], clip: '.modal-glattt' },
  { name: 'p4-archivieren', url: '/hub/staff', steps: [['loaded'], uebersicht, ['loaded'], erstePerson, ['click', 'button', 'Archivieren', 1800]], clip: '.modal-glattt' },
  // ── Team 2: Reisekosten
  { name: 'p5-reisekosten', url: '/hub/staff/reisekosten', steps: [['loaded'], mitarbeiterWaehlen, ['wait', 1500]] },
  { name: 'p6-fahrt', url: '/hub/staff/reisekosten', steps: [['loaded'], mitarbeiterWaehlen, ['wait', 1500],
    ['fn', async (page, L) => { await page.evaluate(() => { const b = [...document.querySelectorAll('button, a, tbody tr')].find(e => e.offsetParent !== null && /Erfassen|Abrechnen|Bearbeiten|Beginnen/.test(e.textContent)); if (b) b.click(); }); await L.wait(page, 2500); }],
    ['scroll', 'h2, h3, h4, label, .card-glattt-title, .form-glattt-label', 'Fahrt', 160]] },
  { name: 'p7-verpflegung', url: '/hub/staff/reisekosten', steps: [['loaded'], mitarbeiterWaehlen, ['wait', 1500],
    ['fn', async (page, L) => { await page.evaluate(() => { const b = [...document.querySelectorAll('button, a, tbody tr')].find(e => e.offsetParent !== null && /Erfassen|Abrechnen|Bearbeiten|Beginnen/.test(e.textContent)); if (b) b.click(); }); await L.wait(page, 2500); }],
    ['scroll', 'h2, h3, h4, label, .card-glattt-title, .form-glattt-label', 'Verpflegung', 160]] },
  { name: 'p8-einreichen', url: '/hub/staff/reisekosten', steps: [['loaded'], mitarbeiterWaehlen, ['wait', 1500],
    ['scroll', 'h2, h3, h4, .card-glattt-title', 'Abrechnungen', 120]] },
  // ── Team 3: Freigabe
  { name: 'p9-freigabe', url: '/hub/staff/reisekosten', steps: [['loaded'], ['click', 'a.btn-glattt-primary, a', 'Freigabe', 3500], ['loaded']] },
  { name: 'p10-pruefen', url: '/hub/staff/reisekosten', steps: [['loaded'], ['click', 'a.btn-glattt-primary, a', 'Freigabe', 3500], ['loaded'],
    ['fn', async (page, L) => { await page.evaluate(() => { const b = [...document.querySelectorAll('button, a, tbody tr')].find(e => e.offsetParent !== null && /Prüfen|Öffnen|Details|Ansehen/.test(e.textContent)); if (b) b.click(); }); await L.wait(page, 3000); }]] },
  { name: 'p11-entscheiden', url: '/hub/staff/reisekosten', steps: [['loaded'], ['click', 'a.btn-glattt-primary, a', 'Freigabe', 3500], ['loaded'],
    ['fn', async (page, L) => { await page.evaluate(() => { const b = [...document.querySelectorAll('button, a, tbody tr')].find(e => e.offsetParent !== null && /Prüfen|Öffnen|Details|Ansehen/.test(e.textContent)); if (b) b.click(); }); await L.wait(page, 3000); }],
    ['scroll', 'button, h3, h4', 'Ablehnen', 300]] },
];

P.run(PLAN, L, { nur: process.argv.slice(2) });
