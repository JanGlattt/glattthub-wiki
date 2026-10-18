/* Wissen 2 — Eine Seite schreiben: Neue Seite (Dialog, nicht angelegt), Editor, Block-Auswahl, Veröffentlichen-Dialog (abgebrochen). */
const L = require('./lib.cjs');
const DEMO = process.env.KLICK_WISSEN_DEMO || '313';
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/wissen/buero-prozesse', 2500);
  await page.click('.wissen-side-add'); await L.wait(page, 800);
  await page.evaluate(() => { const i = document.querySelector('#wissen-new-page-title'); if (i) { i.value = 'Urlaub beantragen'; i.dispatchEvent(new Event('input', { bubbles: true })); } });
  await L.wait(page, 400);
  await L.shot(page, 'w7-neue-seite', { marks: [
    { id: 'titel', kind: 'badge', n: 2, sel: '#wissen-new-page-title', at: 'l' },
    { id: 'anlegen', kind: 'chip', label: 'Anlegen', ...L.byText('.modal-glattt-footer button', 'Anlegen'), at: 'r' },
  ]});
  await page.keyboard.press('Escape'); await L.wait(page, 400);
  await L.goto(page, '/hub/wissen/bearbeiten/' + DEMO, 4000);
  await L.shot(page, 'w8-editor', { marks: [
    { id: 'leiste', kind: 'badge', n: 1, sel: '.wissen-editor-bar', at: 'l' },
    { id: 'schreiben', kind: 'badge', n: 2, sel: '.wissen-title-input', at: 'l' },
    { id: 'panel', kind: 'badge', n: 3, sel: '.wissen-editor-side', at: 'r' },
  ]});
  // Block-Auswahl: Plus am ersten Block
  await page.evaluate(() => { const ed = Alpine.$data(document.querySelector('.wissen-editor')).editor; ed.caret.setToBlock(0, 'end'); setTimeout(() => ed.toolbar.toggleToolbox(true), 300); });
  await L.wait(page, 1200);
  await L.shot(page, 'w9-bloecke', { marks: [
    { id: 'plus', kind: 'badge', n: 1, sel: '#wissen-editorjs .ce-toolbar__plus', at: 'l' },
    { id: 'liste', kind: 'frame', color: 'teal', sel: '#wissen-editorjs .ce-popover--opened .ce-popover__container, .ce-popover--opened' },
  ]});
  await page.keyboard.press('Escape'); await L.wait(page, 400);
  await page.evaluate(() => { const d = Alpine.$data(document.querySelector('.wissen-editor')); d.publishDialog = true; });
  await L.wait(page, 600);
  await L.shot(page, 'w10-veroeffentlichen', { marks: [
    { id: 'zeile', kind: 'badge', n: 2, sel: '#wissen-change-summary', at: 'l' },
    { id: 'jetzt', kind: 'chip', label: 'Veröffentlichen', ...L.byText('.modal-glattt-footer button', 'Jetzt veröffentlichen'), at: 'r' },
  ]});
  await page.evaluate(() => { Alpine.$data(document.querySelector('.wissen-editor')).publishDialog = false; });
  await browser.close();
})();
