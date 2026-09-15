/* Aufnahmelauf „Betrieb".
   Die Tabelle unten ist die Quelle: je Screenshot eine Seite, optional eine Vorbereitung
   (scrollen, Reiter wählen, Fenster öffnen) und die Markierungen.

   Der Lauf **liest nur**. Wo ein Fenster geöffnet wird, wird es danach verworfen —
   in dieser Serie wird nichts gespeichert, nichts verschickt und nichts ausgelöst.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs b1-institute      (einzelner Screenshot)                        */
const L = require('./lib.cjs');

const PLAN = [
  { name: 'b1-institute', url: '/hub/branches', marks: ['.card-glattt'] },
  { name: 'b2-steckbrief', url: '/hub/branches' },
  { name: 'b3-kennzahlen', url: '/hub/branches' },
  { name: 'b4-team', url: '/hub/branches' },
  { name: 'b5-infos', url: '/hub/branches' },
  { name: 'b6-bank', url: '/hub/branches' },
  { name: 'b7-zugang', url: '/hub/branches' },
  { name: 'b8-formulare', url: '/hub/forms', marks: ['.card-glattt'] },
  { name: 'b9-editor', url: '/hub/forms' },
  { name: 'b10-bedingungen', url: '/hub/forms' },
  { name: 'b11-einstellungen', url: '/hub/forms' },
  { name: 'b12-teilen', url: '/hub/forms' },
  { name: 'b13-geteiltes-formular', url: '/hub/forms' },
  { name: 'b14-einreichung', url: '/hub/forms' },
  { name: 'b15-services', url: '/hub/services', marks: ['.card-glattt'] },
  { name: 'b16-beratungsservices', url: '/hub/services' },
  { name: 'b17-zuordnung', url: '/hub/contracts/body-zone-mapping', marks: ['.card-glattt'] },
  { name: 'b18-laser', url: '/hub/laser', marks: ['.card-glattt'] },
  { name: 'b19-geraet', url: '/hub/laser/devices' },
  { name: 'b20-reparatur', url: '/hub/laser/devices' },
  { name: 'b21-material', url: '/hub/laser/consumables', marks: ['.card-glattt'] },
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
