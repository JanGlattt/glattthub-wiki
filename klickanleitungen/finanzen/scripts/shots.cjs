/* Aufnahmelauf „Finanzen" — Schulden und Unternehmensverträge.
   Der Lauf **liest nur**: Das Fenster „Neuen Vertrag anlegen" wird geöffnet und verworfen.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs f8-vertrag-erfassen   (einzeln)                                   */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const PLAN = [
  // ── Finanzen 1: Schulden (Modul, nicht der Bericht)
  { name: 'f5-schulden', url: '/hub/debts', steps: [['loaded'], ['wait', 2000]], marks: [
    { id: 'kennzahlen', kind: 'frame', color: 'teal', sel: '.stat-strip-glattt, .kpi-row-glattt, .card-glattt' },
    { id: 'geplatzt', kind: 'badge', n: 1, ...L.byText('a.btn-glattt-secondary', 'Geplatzte Lastschriften'), at: 'l' },
  ] },
  { name: 'f6-schulden-liste', url: '/hub/debts', steps: [['loaded'], ['wait', 2000], ['scrollSel', '.table-glattt', 'start']], marks: [
    { id: 'tabelle', kind: 'frame', color: 'teal', sel: '.table-glattt' },
  ] },
  // ── Finanzen 2: Unternehmensverträge
  { name: 'f7-unternehmensvertraege', url: '/hub/company-contracts', steps: [['loaded'], ['wait', 1500]], marks: [
    { id: 'kennzahlen', kind: 'frame', color: 'teal', sel: '.card-glattt' },
    { id: 'neu', kind: 'badge', n: 1, sel: '.btn-glattt-primary', at: 'l' },
  ] },
  { name: 'f8-vertrag-erfassen', url: '/hub/company-contracts', steps: [['loaded'], ['click', 'button.btn-glattt-primary', 'Neuen Vertrag anlegen', 2000]], clip: '.modal-glattt' },
  { name: 'f9-fristen', url: '/hub/company-contracts', steps: [['loaded'], ['scroll', '.card-glattt-title', 'Verträge', 120]], clip: 'card:Verträge' },
];

P.run(PLAN, L, { nur: process.argv.slice(2) });
