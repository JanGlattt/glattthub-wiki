/* Aufnahmelauf „Team".
   Die Tabelle unten ist die Quelle: je Screenshot eine Seite, optional eine Vorbereitung
   (scrollen, Reiter wählen, Fenster öffnen) und die Markierungen.

   Der Lauf **liest nur**. Wo ein Fenster geöffnet wird, wird es danach verworfen —
   in dieser Serie wird nichts gespeichert, nichts verschickt und nichts ausgelöst.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs p1-personal      (einzelner Screenshot)                        */
const L = require('./lib.cjs');

const PLAN = [
  { name: 'p1-personal', url: '/hub/staff', marks: ['.card-glattt'] },
  { name: 'p2-person', url: '/hub/staff' },
  { name: 'p3-konto-wizard', url: '/hub/staff' },
  { name: 'p4-archivieren', url: '/hub/staff' },
  { name: 'p5-reisekosten', url: '/hub/staff/reisekosten', marks: ['.card-glattt'] },
  { name: 'p6-fahrt', url: '/hub/staff/reisekosten' },
  { name: 'p7-verpflegung', url: '/hub/staff/reisekosten' },
  { name: 'p8-einreichen', url: '/hub/staff/reisekosten' },
  { name: 'p9-freigabe', url: '/hub/staff/reisekosten-freigabe', marks: ['.card-glattt'] },
  { name: 'p10-pruefen', url: '/hub/staff/reisekosten-freigabe' },
  { name: 'p11-entscheiden', url: '/hub/staff/reisekosten-freigabe' },
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
