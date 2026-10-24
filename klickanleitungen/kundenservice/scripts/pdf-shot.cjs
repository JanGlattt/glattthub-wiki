/* Bild für „Verlauf als PDF“: erzeugt den PDF-Verlauf eines Beispieltickets über die angemeldete
   Sitzung und wandelt Seite 1 in ein Bild (pdftoppm). Aufruf: node scripts/pdf-shot.cjs */
const fs = require('fs');
const { execFileSync } = require('child_process');
const L = require('./lib.cjs');
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  const res = await page.request.get(L.BASE + '/hub/kundenservice/tickets/10101/verlauf?notes=1');
  console.log('PDF', res.status(), res.headers()['content-type']);
  fs.mkdirSync('shots', { recursive: true });
  fs.writeFileSync('shots/_verlauf.pdf', await res.body());
  execFileSync('pdftoppm', ['-png', '-r', '110', '-x', '40', '-y', '70', '-W', '830', '-H', '900', '-f', '1', '-l', '1', '-singlefile', 'shots/_verlauf.pdf', 'shots/k16b-pdf']);
  fs.unlinkSync('shots/_verlauf.pdf');
  await browser.close();
})();
