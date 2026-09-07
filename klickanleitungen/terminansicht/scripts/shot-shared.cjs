const L = require('./lib.cjs');
(async () => {
  const { browser, page } = await L.launch({ fresh: true, viewport: { width: 820, height: 1180 } }); // Tablet hochkant, wie die Kundin es hält
  await page.goto(L.BASE + '/shared/form/5PlxaUY6RJbievwvsfzt9QVl5xYNWLeSWMfq4wIFV6B1rW9nQZFDR5GoRbHI7hob', { waitUntil: 'domcontentloaded' });
  await L.wait(page, 4000);
  console.log(await page.evaluate(() => document.body.innerText.slice(0, 300).replace(/\n+/g, ' | ')));
  await L.shot(page, 'n1-geteiltes-formular', {});
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
