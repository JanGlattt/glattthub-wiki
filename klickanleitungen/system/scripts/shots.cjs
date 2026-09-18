/* Aufnahmelauf „System" — Report-Mails und Audit.
   Der Lauf **liest nur**: Das Fenster „Neue Report-Mail" wird geöffnet und verworfen.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs sy4-audit       (einzeln)                                         */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const neueMail = ['click', 'button', 'Neue Report-Mail', 2000];
const imFenster = (text) => ['fn', async (page, L) => {
  await page.evaluate((t) => {
    const box = document.querySelector('.modal-glattt-body, .modal-glattt');
    const el = box && [...box.querySelectorAll('label, h3, h4, legend, .form-glattt-label, span')].find(e => e.textContent.trim().startsWith(t));
    if (el) el.scrollIntoView({ block: 'start' });
  }, text);
  await L.wait(page, 800);
}];

const PLAN = [
  { name: 'sy1-report-mails', url: '/hub/report-mails', steps: [['loaded'], neueMail], clip: '.modal-glattt' },
  { name: 'sy2-empfaenger', url: '/hub/report-mails', steps: [['loaded'], neueMail, imFenster('Empfänger')], clip: '.modal-glattt' },
  { name: 'sy3-zustellungen', url: '/hub/report-mails', steps: [['loaded'], ['scroll', '.card-glattt-title', 'Versandprotokoll', 120]], clip: 'card:Versandprotokoll' },
  { name: 'sy4-audit', url: '/hub/audit', steps: [['loaded'], ['wait', 1500]], marks: [
    { id: 'score', kind: 'frame', color: 'teal', sel: '.audit-overall-glattt, .card-glattt' },
  ] },
  { name: 'sy5-audit-bereich', url: '/hub/audit', steps: [['loaded'], ['scroll', 'h2, h3, h4, span, div', 'Vertragsqualität', 120]] },
];

P.run(PLAN, L, { nur: process.argv.slice(2) });
