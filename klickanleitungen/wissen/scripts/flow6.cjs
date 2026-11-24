/* Wissen 6 — Anleitungen und Tool-Seiten: lesen (Themenseite, Tool-Seite, Reiter Tools) und pflegen
   (Liste, Formular, Block im Editor, Tool-Angaben). Nur Lesen: das Formular wird geöffnet und wieder geschlossen. */
const L = require('./lib.cjs');
const TOPIC = process.env.KLICK_WISSEN_TOPIC || '/hub/wissen/institut-alltag/urlaub';
const TOOL = process.env.KLICK_WISSEN_TOOL || '/hub/wissen/institut-alltag/askdante-zeiterfassung';
const TOOLS = process.env.KLICK_WISSEN_TOOLS || '/hub/wissen/institut-alltag/tools';
const TOPIC_ID = process.env.KLICK_WISSEN_TOPIC_ID || '50';
const TOOL_ID = process.env.KLICK_WISSEN_TOOL_ID || '28';
(async () => {
  const { browser, ctx, page } = await L.launch();
  // Lokal ohne Passwort-Anmeldung: fertige Sitzung als Cookie (KLICK_COOKIE="name=wert"), sonst normale Anmeldung
  if (process.env.KLICK_COOKIE) {
    const [name, ...rest] = process.env.KLICK_COOKIE.split('=');
    await ctx.addCookies([{ name, value: rest.join('='), url: process.env.KLICK_BASE }]);
  }
  await L.login(page, ctx);

  await L.goto(page, TOPIC, 2500);
  await L.scrollTo(page, '.wissen-guide', 'start'); await page.evaluate(() => window.scrollBy(0, -150)); await L.wait(page, 500);
  await L.shot(page, 'w22-anleitung', { noScroll: true, marks: [
    { id: 'frage', kind: 'badge', n: 1, sel: '.wissen-guide .wissen-guide-q', at: 'l' },
    { id: 'tool', kind: 'badge', n: 2, sel: '.wissen-guide .wissen-toolbox-head', at: 'l' },
    { id: 'schritte', kind: 'badge', n: 3, sel: '.wissen-guide .wissen-steps', at: 'l' },
    { id: 'knopf', kind: 'chip', label: 'Direkt ins Tool', sel: '.wissen-guide .wissen-guide-foot .wissen-btn', at: 'r' },
  ]});

  await L.goto(page, TOOL, 2500);
  await page.evaluate(() => { try { localStorage.setItem('wissen-anleitungen-filter', '{}'); } catch (e) {} });
  await L.goto(page, TOOL, 2500);
  await L.scrollTo(page, '.wissen-toolguides', 'start'); await page.evaluate(() => window.scrollBy(0, -260)); await L.wait(page, 500);
  await L.shot(page, 'w23-tool', { noScroll: true, marks: [
    { id: 'filter', kind: 'badge', n: 1, sel: '.wissen-toolguides-filter', at: 'l' },
    { id: 'thema', kind: 'badge', n: 2, sel: '.wissen-toolguides-topic', at: 'r' },
    { id: 'anleitung', kind: 'badge', n: 3, sel: '.wissen-toolguides-group:nth-of-type(2) .wissen-toolguides-item, .wissen-toolguides-group + .wissen-toolguides-group .wissen-toolguides-item', at: 'r' },
  ]});

  await L.goto(page, TOOLS, 2500);
  await L.shot(page, 'w24-tools', { marks: [
    { id: 'kategorie', kind: 'badge', n: 1, sel: '.wissen-tooldir .wissen-heading', at: 'l' },
    { id: 'karte', kind: 'badge', n: 2, sel: '.wissen-tooldir-card', at: 'tl' },
  ]});

  await L.goto(page, '/hub/wissen/anleitungen', 2500);
  await L.shot(page, 'w25-anleitungen', { marks: [
    { id: 'neu', kind: 'chip', label: 'Neue Anleitung', ...L.byText('.wissen-head-actions button', 'Neue Anleitung'), at: 'l' },
    { id: 'filter', kind: 'badge', n: 1, sel: '.wissen-guides-filter', at: 'l' },
    { id: 'steht', kind: 'badge', n: 2, sel: 'tbody tr .wissen-guides-meta', at: 'l' },
    { id: 'bearbeiten', kind: 'badge', n: 3, sel: 'tbody tr .wissen-guides-actions .wissen-btn', at: 'l' },
  ]});
  await page.locator('tbody tr .wissen-guides-actions .wissen-btn').first().click();
  await L.wait(page, 1500);
  await L.shot(page, 'w26-formular', { noScroll: true, marks: [
    { id: 'kopf', kind: 'badge', n: 1, sel: '.modal-glattt .wissen-guideform-fields', at: 'l' },
    { id: 'schritt', kind: 'badge', n: 2, sel: '.modal-glattt .wissen-guideform-step', at: 'l' },
    { id: 'zielgruppe', kind: 'frame', color: 'teal', sel: '.modal-glattt .wissen-guideform-step .wissen-guideform-stepaud' },
  ]});
  await page.keyboard.press('Escape'); await L.wait(page, 500);

  await L.goto(page, '/hub/wissen/bearbeiten/' + TOPIC_ID, 4000);
  await L.scrollTo(page, '.wissen-ed-guide', 'start'); await page.evaluate(() => window.scrollBy(0, -200)); await L.wait(page, 500);
  await L.shot(page, 'w27-block', { noScroll: true, marks: [
    { id: 'block', kind: 'badge', n: 1, sel: '.wissen-ed-guide .wissen-ed-guide-head', at: 'l' },
    { id: 'steht', kind: 'frame', color: 'teal', sel: '.wissen-ed-guide .wissen-ed-guide-used' },
    { id: 'aktionen', kind: 'badge', n: 2, sel: '.wissen-ed-guide .wissen-ed-guide-actions', at: 'l' },
  ]});

  await L.goto(page, '/hub/wissen/bearbeiten/' + TOOL_ID, 4000);
  await L.scrollTo(page, '.wissen-editor-toolfields', 'center'); await L.wait(page, 500);
  await L.shot(page, 'w28-toolseite', { noScroll: true, marks: [
    { id: 'felder', kind: 'badge', n: 1, sel: '.wissen-editor-toolfields', at: 'l' },
  ]});
  await browser.close();
})();
