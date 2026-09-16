/* Aufnahmelauf „Verkauf" Teil 2 — Dokumente 5–8 (Preislisten, Freunde werben, Gutscheine,
   Zufriedenheit). Anders als flow1–flow4 ist das ein Tabellen-Lauf: je Zeile ein Screenshot
   mit seiner Seite.

   Der Lauf **liest nur**. Ausdrücklich NICHT gedrückt werden: „Speichern" in einer Preisliste
   (sie hängt an laufenden Verträgen), „Prämie auszahlen" bei den Empfehlungen, „Gutschein
   anlegen" (der Gutschein entstünde in Phorest) und „Senden" bei der Zufriedenheitsbefragung
   (die Nachricht ginge an eine echte Kundin).

   Aufruf:  node scripts/flow5.cjs                (alle)
            node scripts/flow5.cjs v22-gutscheine (einzeln)                                   */
const L = require('./lib.cjs');

const PLAN = [
  { name: 'v16-preislisten', url: '/hub/contracts/prices', marks: ['.card-glattt'] },
  { name: 'v17-preise', url: '/hub/contracts/prices' },
  { name: 'v18-rabatte', url: '/hub/contracts/prices' },
  { name: 'v19-referrals', url: '/hub/contracts/referrals', marks: ['.card-glattt'] },
  { name: 'v20-referral-pruefen', url: '/hub/contracts/referrals' },
  { name: 'v21-auszahlung', url: '/hub/contracts/referrals' },
  { name: 'v22-gutscheine', url: '/hub/vouchers', marks: ['.card-glattt'] },
  { name: 'v23-gutschein-detail', url: '/hub/vouchers' },
  { name: 'v24-gutschein-anlegen', url: '/hub/vouchers' },
  { name: 'v25-zufriedenheit', url: '/hub/zufriedenheit', marks: ['.card-glattt'] },
  { name: 'v26-versenden', url: '/hub/zufriedenheit' },
  { name: 'v27-folgeaufgaben', url: '/hub/zufriedenheit' },
];

(async () => {
  const nur = process.argv.slice(2);
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  let letzte = null;

  for (const p of PLAN) {
    if (nur.length && !nur.includes(p.name)) continue;
    try {
      if (p.url !== letzte) { await L.goto(page, p.url, 3500); letzte = p.url; }
      await L.wait(page, 1200);
      await L.shot(page, p.name, { marks: (p.marks || []).map(m =>
        typeof m === 'string' ? { kind: 'frame', color: 'teal', sel: m } : m) });
    } catch (e) {
      console.log('FEHLER bei', p.name, '—', e.message.split('\n')[0]);
    }
  }
  await browser.close();
})();
