/* Nachaufnahme m1-auto-nachrichten (24.10.2026): Karte „Automatisch versendete Nachrichten“ mit dem
   neuen Knopf „Gutschein-Link per E-Mail“ (Mail statt WhatsApp). Öffnet nur den Reiter, verschickt
   nichts. Aufruf wie flow5 (KLICK_CLIENT, Zugang per KLICK_PIN).                                    */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openClient(page, 2500);
  await L.tab(page, 'Nachrichten', 4000);
  console.log('Knopf Gutschein-Link:', await page.evaluate(() => !![...document.querySelectorAll('button')].find(b => b.offsetParent !== null && b.textContent.includes('Gutschein-Link per E-Mail'))));
  await L.shot(page, 'm1-auto-nachrichten', { marks: [
    { id: 'karte', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Automatisch versendete'), at: 'l' },
    { id: 'status', kind: 'badge', n: 2, ...L.byText('th', 'Status'), at: 't' },
    { id: 'zustellung', kind: 'badge', n: 3, ...L.byText('th', 'Zustellung'), at: 't' },
    { id: 'knopf', kind: 'badge', n: 4, ...L.byText('button', 'Gutschein-Link per E-Mail'), at: 'l' },
  ]});
  await browser.close();
})();
