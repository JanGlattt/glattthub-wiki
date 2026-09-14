/* Kundenansicht eines geteilten Formulars (Tablet hochkant). Der Link stammt aus flow2
   (shared-url.txt) oder aus KLICK_SHARE_URL — er ist nur 48 h gueltig, also im selben Lauf fotografieren. */
const L = require('./lib.cjs');
const fs = require('fs');
const SHARE = process.env.KLICK_SHARE_URL || (fs.existsSync('shared-url.txt') ? fs.readFileSync('shared-url.txt', 'utf8').trim() : '');
if (!SHARE) { console.error('Kein Teilen-Link — erst flow2 laufen lassen (schreibt shared-url.txt) oder KLICK_SHARE_URL setzen.'); process.exit(2); }
(async () => {
  const { browser, page } = await L.launch({ fresh: true, viewport: { width: 820, height: 1180 } }); // Tablet hochkant, wie die Kundin es hält
  await page.goto(SHARE, { waitUntil: 'domcontentloaded' });
  await L.wait(page, 4000);
  console.log(await page.evaluate(() => document.body.innerText.slice(0, 300).replace(/\n+/g, ' | ')));
  await L.shot(page, 'n1-geteiltes-formular', {});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
