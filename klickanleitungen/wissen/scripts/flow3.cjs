/* Wissen 3 — Prozesse: Schritte-Block im Editor, BPMN-Modeler (nicht übernommen), Leseansicht Diagramm und Text. */
const L = require('./lib.cjs');
const DEMO = process.env.KLICK_WISSEN_DEMO || '313';
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/wissen/bearbeiten/' + DEMO, 4000);
  await L.scrollTo(page, '.wissen-ed-proc', 'center'); await L.wait(page, 500);
  await L.shot(page, 'w11-schritte', { marks: [
    { id: 'wer', kind: 'badge', n: 2, sel: '.wissen-ed-proc-step [data-f="actor"]', at: 'l' },
    { id: 'entscheidung', kind: 'badge', n: 3, sel: '.wissen-ed-proc-step:nth-child(2) [data-f="decision"]', at: 'l' },
    { id: 'bpmn', kind: 'chip', label: 'Umwandeln', sel: '.wissen-ed-proc-bpmn', at: 'r' },
  ]});
  await page.evaluate(() => document.querySelector('.wissen-ed-proc-bpmn').click());
  await L.wait(page, 3500);
  await L.shot(page, 'w12-bpmn-studio', { noScroll: true, marks: [
    { id: 'palette', kind: 'badge', n: 2, sel: '.wissen-bpmn-studio .djs-palette', at: 'r' },
    { id: 'uebernehmen', kind: 'chip', label: 'Übernehmen', sel: '.wissen-bpmn-studio [data-act="save"]', at: 'l' },
  ]});
  await page.evaluate(() => document.querySelector('.wissen-bpmn-studio [data-act="cancel"]').click());
  await L.wait(page, 500);
  // Leseansicht: Beispielseite hat ein veröffentlichtes BPMN? Falls nicht, Probeseite 279 nutzen
  await L.goto(page, '/hub/wissen/buero-prozesse/claude-css-probe?entwurf=1', 2500);
  await L.scrollTo(page, '.wissen-bpmn', 'center'); await L.wait(page, 600);
  await L.shot(page, 'w13-bpmn-lesen', { marks: [
    { id: 'zoom', kind: 'badge', n: 1, sel: '.wissen-bpmn-zoom', at: 'r' },
    { id: 'text', kind: 'badge', n: 2, sel: '.wissen-bpmn .wissen-proc-switch', at: 'l' },
  ]});
  await page.evaluate(() => document.querySelectorAll('.wissen-bpmn .wissen-proc-switch input')[1].click());
  await L.wait(page, 500);
  await L.shot(page, 'w14-bpmn-text', { marks: [
    { id: 'beteiligte', kind: 'badge', n: 1, sel: '.wissen-bpmn-lanes', at: 'l' },
    { id: 'zweig', kind: 'badge', n: 3, sel: '.wissen-bpmn-lines li.is-branch', at: 'l' },
  ]});
  await browser.close();
})();
