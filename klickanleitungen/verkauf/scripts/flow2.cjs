/* Verkauf 2 — Vertrag im Detail (Übersicht, Verlauf, E-Mails). Nur Lesen. */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openContract(page);

  await L.shot(page, 'v4-vertrag-kopf', { marks: [
    { id: 'nummer', kind: 'badge', n: 1, sel: '.contract-v2-page h1, .site-title', at: 'l' },
    { id: 'reiter', kind: 'frame', color: 'teal', sel: '.contract-v2-tabs' },
    { id: 'banner', kind: 'chip', label: 'Zuerst lesen', sel: '.alert-glattt', at: 'l' },
  ]});

  await L.tab(page, 'Übersicht', 2000);
  await L.shot(page, 'v5-uebersicht', { marks: [
    { id: 'paket', kind: 'badge', n: 1, ...L.byText('.contract-v2-main *', 'Paket'), at: 'l' },
    { id: 'preisliste', kind: 'badge', n: 2, ...L.byText('.contract-v2-main *', 'Preisliste'), at: 'l' },
    { id: 'notizen', kind: 'badge', n: 4, ...L.byText('.contract-v2-main *', 'Notizen'), at: 'l' },
  ]});

  const side = await L.clipOf(page, '.contract-v2-sidebar', 20);
  await L.shot(page, 'v6-zusammenfassung', { clip: side, noScroll: true, marks: [
    { id: 'rate', kind: 'badge', n: 3, ...L.byText('.contract-v2-sidebar *', 'Monatsrate'), at: 'l' },
    { id: 'raten', kind: 'frame', color: 'teal', ...L.byText('.contract-v2-sidebar *', 'Raten (bezahlt') },
  ]});

  await L.tab(page, 'Verlauf', 2500);
  await L.shot(page, 'v7-verlauf', { marks: [
    { id: 'eintrag', kind: 'frame', color: 'teal', sel: '.contract-v2-main .table-glattt, .contract-v2-main .card-glattt' },
  ]});

  await L.tab(page, 'E-Mail-Historie', 2500);
  await L.shot(page, 'v8-emails', { marks: [
    { id: 'liste', kind: 'frame', color: 'teal', sel: '.contract-v2-main .table-glattt, .contract-v2-main .card-glattt' },
  ]});

  await browser.close();
})();
