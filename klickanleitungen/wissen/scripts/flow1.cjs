/* Wissen 1 — Nachschlagen & suchen: Start, Flyout, Seite, Suche, Was ist neu, Pflichtseite. Nur Lesen (plus eine Daumen-Stimme). */
const L = require('./lib.cjs');
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/wissen', 2500);
  await L.scrollTo(page, '.wissen-serien', 'start'); await page.evaluate(() => window.scrollBy(0, -150)); await L.wait(page, 500);
  await L.shot(page, 'w1-start', { noScroll: true, marks: [
    { id: 'band', kind: 'badge', n: 1, sel: '.wissen-tabs-inner', at: 'l' },
    { id: 'karten', kind: 'badge', n: 2, sel: '.wissen-serien .wissen-serie-card', at: 'tl' },
    { id: 'switch', kind: 'badge', n: 3, sel: '.wissen-switch', at: 'r' },
  ]});
  await L.hoverTab(page, 'glattt Akademie');
  await L.shot(page, 'w2-flyout', { marks: [
    { id: 'reiter', kind: 'badge', n: 1, ...L.byText('.wissen-tabs-inner .wissen-tab', 'glattt Akademie'), at: 'r' },
    { id: 'flyout', kind: 'frame', color: 'teal', sel: '.wissen-tab-wrap:hover > .wissen-flyout' },
  ]});
  await L.goto(page, '/hub/wissen/institut-alltag/urlaub', 2500);
  await L.shot(page, 'w3-seite', { marks: [
    { id: 'pfad', kind: 'badge', n: 1, sel: '.wissen-eyebrow', at: 'l' },
    { id: 'toc', kind: 'badge', n: 2, sel: '.wissen-toc', at: 'r' },
    { id: 'facts', kind: 'badge', n: 3, sel: '.wissen-facts', at: 'r' },
  ]});
  await page.click('#wissen-top-search'); await page.keyboard.type('Urlaub'); await L.wait(page, 1500);
  await L.shot(page, 'w4-suche', { marks: [
    { id: 'feld', kind: 'badge', n: 1, sel: '.wissen-top-search', at: 'l' },
    { id: 'treffer', kind: 'badge', n: 3, sel: '.wissen-top-search .wissen-search-results li', at: 'l' },
  ]});
  await page.keyboard.press('Escape');
  await L.goto(page, '/hub/wissen/neu', 2500);
  await L.shot(page, 'w5-neu', { marks: [
    { id: 'link', kind: 'badge', n: 1, ...L.byText('.wissen-side-tools a', 'Was ist neu'), at: 'r' },
    { id: 'eintrag', kind: 'badge', n: 2, sel: '.wissen-feed-day .wissen-serie-list li', at: 'l' },
  ]});
  await L.goto(page, '/hub/wissen/institut-alltag/urlaub', 2500);
  await L.scrollTo(page, '.wissen-ack', 'center'); await L.wait(page, 500);
  await L.shot(page, 'w6-pflicht', { noScroll: true, marks: [
    { id: 'ack', kind: 'badge', n: 1, sel: '.wissen-ack .wissen-btn-primary, .wissen-ack', at: 'r' },
    { id: 'daumen', kind: 'badge', n: 2, sel: '.wissen-feedback-btn', at: 'l' },
    { id: 'veraltet', kind: 'badge', n: 3, sel: '.wissen-feedback-report', at: 'r' },
  ]});
  await browser.close();
})();
