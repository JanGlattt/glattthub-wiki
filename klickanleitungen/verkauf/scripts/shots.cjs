/* Aufnahmelauf „Verkauf" — Preislisten, Freunde werben, Gutscheine, Zufriedenheit.
   Der Lauf **liest nur**: Fenster werden geöffnet und verworfen, es wird nichts gesendet,
   kein Gutschein erstellt, keine Prämie ausgezahlt.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs v17-preise      (einzeln)                                         */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const ersteZeile = ['fn', async (page, L) => {
  await page.evaluate(() => { const r = [...document.querySelectorAll('tbody tr')].find(e => e.offsetParent !== null); if (r) (r.querySelector('a, button') || r).click(); });
  await L.wait(page, 2500);
}];

const PLAN = [
  // ── Verkauf 1: Preislisten
  { name: 'v16-preislisten', url: '/hub/contracts/prices', steps: [['loaded']], marks: [
    { id: 'aktuell', kind: 'frame', color: 'teal', sel: '.card-glattt' },
    { id: 'neu', kind: 'badge', n: 1, sel: '.btn-glattt-primary', at: 'l' },
  ] },
  { name: 'v17-preise', url: '/hub/contracts/prices', steps: [['loaded'], ['click', '.card-glattt-header', 'glattt-Preise', 2500],
    ['scroll', 'h4, h5, th, .card-glattt-title, label', 'Preis', 140]] },
  { name: 'v18-rabatte', url: '/hub/contracts/prices', steps: [['loaded'], ['click', '.card-glattt-header', 'glattt-Preise', 2500],
    ['scroll', 'h4, h5, th, .card-glattt-title, label, span', 'Rabatt', 140]] },
  // ── Verkauf 2: Freunde werben
  { name: 'v19-referrals', url: '/hub/contracts/referrals', steps: [['loaded'], ['scroll', '.card-glattt-title, th', 'Geworbener', 200]] },
  { name: 'v20-referral-pruefen', url: '/hub/contracts/referrals', steps: [['loaded'], ['click', 'button.btn-glattt-secondary', 'Details', 2000]], clip: '.modal-glattt' },
  { name: 'v21-auszahlung', url: '/hub/contracts/referrals', steps: [['loaded'], ['click', 'button.btn-glattt-secondary', 'Details', 2000],
    ['fn', async (page, L) => { await page.evaluate(() => { const box = document.querySelector('.modal-glattt-body, .modal-glattt'); const el = box && [...box.querySelectorAll('h3, h4, label, legend, span')].find(e => /Bank|Auszahlung/.test(e.textContent)); if (el) el.scrollIntoView({ block: 'start' }); }); await L.wait(page, 800); }]], clip: '.modal-glattt' },
  // ── Verkauf 3: Gutscheine
  { name: 'v22-gutscheine', url: '/hub/vouchers', steps: [['loaded'], ['wait', 1500]], marks: [
    { id: 'suche', kind: 'badge', n: 1, sel: '.search-glattt, input[type=search], input[placeholder*="Serien"]', at: 'l' },
  ] },
  { name: 'v23-gutschein-detail', url: '/hub/vouchers', steps: [['loaded'], ['wait', 1500], ersteZeile], clip: '?.modal-glattt' },
  { name: 'v24-gutschein-anlegen', url: '/hub/vouchers', steps: [['loaded'], ['click', 'button', 'Neuer Gutschein', 2000]], clip: '.modal-glattt' },
  // ── Verkauf 4: Zufriedenheit
  { name: 'v25-zufriedenheit', url: '/hub/zufriedenheit', steps: [['loaded'], ['wait', 2500]], marks: [
    { id: 'auffrischen', kind: 'badge', n: 1, ...L.byText('button', 'Liste auffrischen'), at: 'l' },
    { id: 'kandidatinnen', kind: 'frame', color: 'teal', ...L.byText('.card-glattt-title', 'Kandidatinnen') },
  ] },
  { name: 'v26-versenden', url: '/hub/zufriedenheit', steps: [['loaded'], ['wait', 2500], ['scroll', '.card-glattt-title', 'Kandidatinnen', 120]], marks: [
    { id: 'senden', kind: 'badge', n: 1, ...L.byText('button.btn-glattt-primary', 'Senden'), at: 'l' },
    { id: 'ueberspringen', kind: 'badge', n: 2, ...L.byText('button.btn-glattt-secondary', 'Überspringen'), at: 'r' },
  ] },
  { name: 'v27-folgeaufgaben', url: '/hub/zufriedenheit', steps: [['loaded'], ['wait', 2500], ['scroll', '.card-glattt-title', 'Verlauf', 120]], clip: 'card:Verlauf' },
];

P.run(PLAN, L, { nur: process.argv.slice(2) });
