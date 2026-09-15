/* Aufnahmelauf „System".
   Die Tabelle unten ist die Quelle: je Screenshot eine Seite, optional eine Vorbereitung
   (scrollen, Reiter wählen, Fenster öffnen) und die Markierungen.

   Der Lauf **liest nur**. Wo ein Fenster geöffnet wird, wird es danach verworfen —
   in dieser Serie wird nichts gespeichert, nichts verschickt und nichts ausgelöst.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs sy1-report-mails      (einzelner Screenshot)                        */
const L = require('./lib.cjs');

const PLAN = [
  { name: 'sy1-report-mails', url: '/hub/report-mails', marks: ['.card-glattt'] },
  { name: 'sy2-empfaenger', url: '/hub/report-mails' },
  { name: 'sy3-zustellungen', url: '/hub/report-mails' },
  { name: 'sy4-audit', url: '/hub/audit', marks: ['.card-glattt'] },
  { name: 'sy5-audit-bereich', url: '/hub/audit' },
];

(async () => {
  const nur = process.argv.slice(2);
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);

  for (const p of PLAN) {
    if (nur.length && !nur.includes(p.name)) continue;
    try {
      await L.goto(page, p.url, p.wait || 3000);
      if (p.vor) await p.vor(page, L);
      const clip = p.clip ? await L.clipOf(page, p.clip, 20) : null;
      await L.shot(page, p.name, { clip, noScroll: !!p.clip, marks: (p.marks || []).map(m =>
        typeof m === 'string' ? { kind: 'frame', color: 'teal', sel: m } : m) });
    } catch (e) {
      console.log('FEHLER bei', p.name, '—', e.message.split('\n')[0]);
    }
  }
  await browser.close();
})();
