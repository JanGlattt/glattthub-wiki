/* Wissen 2 — Eine Seite schreiben: Neue Seite (Dialog, nicht angelegt), Editor, Block-Auswahl, Veröffentlichen-Dialog (abgebrochen). */
const L = require('./lib.cjs');
// Seite mit Absatz UND Liste am Anfang (Listen-Knöpfe « » in der Leiste, Ausrichtung im Block-Menü)
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
  // Schreibmarke in die erste Liste: nur dann zeigt die Leiste die Knöpfe « » (aus-/einrücken)
  await page.evaluate(() => {
    const ed = Alpine.$data(document.querySelector('.wissen-editor')).editor;
    for (let i = 0; i < ed.blocks.getBlocksCount(); i++) if (ed.blocks.getBlockByIndex(i).name === 'list') { ed.caret.setToBlock(i, 'end'); break; }
  });
  await L.wait(page, 600);
  await L.shot(page, 'w8-editor', { marks: [
    { id: 'leiste', kind: 'badge', n: 1, sel: '.wissen-editor-bar', at: 'l' },
    { id: 'schreiben', kind: 'badge', n: 2, sel: '.wissen-title-input', at: 'l' },
    { id: 'panel', kind: 'badge', n: 3, sel: '.wissen-editor-side > *', at: 'l' },   // erste Zeile des Panels — das Panel selbst ist höher als das Bild
  ]});
  // Block-Auswahl: Plus am ersten Block
  await page.evaluate(() => { const ed = Alpine.$data(document.querySelector('.wissen-editor')).editor; ed.caret.setToBlock(0, 'end'); setTimeout(() => ed.toolbar.toggleToolbox(true), 300); });
  await L.wait(page, 1200);
  await L.shot(page, 'w9-bloecke', { marks: [
    { id: 'plus', kind: 'badge', n: 1, sel: '#wissen-editorjs .ce-toolbar__plus', at: 'l' },
    { id: 'liste', kind: 'frame', color: 'teal', sel: '#wissen-editorjs .ce-popover--opened .ce-popover__container' },
  ]});
  await page.keyboard.press('Escape'); await L.wait(page, 400);
  // Block-Menü (⋮⋮) des ersten Absatzes: dort steht seit 27.11.2026 die Ausrichtung
  await page.evaluate(async () => {
    const ed = Alpine.$data(document.querySelector('.wissen-editor')).editor;
    let pi = 0; for (let i = 0; i < ed.blocks.getBlocksCount(); i++) if (ed.blocks.getBlockByIndex(i).name === 'paragraph') { pi = i; break; }
    ed.caret.setToBlock(pi, 'end');
    await new Promise(r => setTimeout(r, 400));
    ed.toolbar.toggleBlockSettings(true);
  });
  await L.wait(page, 900);
  // Liste des Menüs eine Zeile weiterrollen, damit „Blocksatz“ ganz im Bild steht
  await page.evaluate(() => { const l = document.querySelector('#wissen-editorjs .ce-popover--opened .ce-popover__items'); if (l) l.scrollTop = 64; });
  await L.wait(page, 300);
  await L.shot(page, 'w9b-block-menue', { noScroll: true, marks: [
    { id: 'griff', kind: 'badge', n: 4, sel: '#wissen-editorjs .ce-toolbar__settings-btn', at: 'l' },
    { id: 'ausrichtung', kind: 'frame', color: 'teal', sel: '#wissen-editorjs .ce-popover--opened .ce-popover__container' },
    { id: 'neue-zeile', kind: 'badge', n: 5, ...L.byText('.wissen-editor-bar button', 'Neue Zeile'), at: 'l' },
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
