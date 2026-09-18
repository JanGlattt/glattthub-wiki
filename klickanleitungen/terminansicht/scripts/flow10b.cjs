/* Terminansicht 11 — Link der zweiten Person (v7, v8), Handy hochkant.
   KLICK_COSIGN_URL = der Mitunterzeichner-Link aus der E-Mail (bzw. aus form_share_tokens auf Staging).
   Der Lauf füllt den Teil der zweiten Person aus und **sendet ab** — die Einreichung ist danach vollständig. */
const L = require('./lib.cjs');
const URL_ = process.env.KLICK_COSIGN_URL || '';
if (!URL_) { console.error('KLICK_COSIGN_URL fehlt.'); process.exit(2); }
(async () => {
  const { browser, page } = await L.launch({ fresh: true, viewport: { width: 430, height: 932 } });
  // Die Seite lädt zwei Alpine-Instanzen (CDN + Vite) — Komponente direkt vom Element lesen
  await page.addInitScript(() => { window.F = () => { const el = document.querySelector('.shared-form-content'); return el && el._x_dataStack ? el._x_dataStack[0] : Alpine.$data(el); }; });
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  await L.wait(page, 4000);
  console.log(await page.evaluate(() => document.body.innerText.slice(0, 200).replace(/\n+/g, ' | ')));
  await L.shot(page, 'v7-link-elternteil', { noScroll: true, marks: [
    { id: 'hinweis', kind: 'badge', n: 1, sel: '[data-cosigner-banner]', at: 'l' },
  ]});
  // eigenen Teil füllen
  const namen = await page.evaluate(() => { const d = F(); const by = (re) => d.form.fields.filter(f => re.test(f.field_name)); return {
    verh2: by(/^radio_1789766317814_copy/)[0]?.field_name, vor2: by(/^text_1789766500068_copy/)[0]?.field_name, nach2: by(/^text_1789766500970_copy/)[0]?.field_name, geb2: by(/^date_1789766591406_copy/)[0]?.field_name,
  }; });
  await page.evaluate((n) => { const d = F(); d.values[n.verh2] = 'vater'; d.values[n.vor2] = 'Thomas'; d.values[n.nach2] = 'Musterfrau'; d.values[n.geb2] = '1982-07-03'; }, namen);
  await L.wait(page, 600);
  await page.evaluate(() => { const c = [...document.querySelectorAll('canvas.signature-pad-canvas')].find(e => e.offsetParent !== null); c?.scrollIntoView({ block: 'center' }); }); await L.wait(page, 500);
  await page.evaluate(() => { const pad = Alpine.$data([...document.querySelectorAll('.signature-pad-container')].find(e => e.offsetParent !== null)); pad.strokes = [{ points: [{x:20,y:60},{x:50,y:25},{x:80,y:65},{x:110,y:30},{x:150,y:60},{x:190,y:35},{x:240,y:55}] }]; pad.redrawFromStrokes(); pad.saveSignature(); });
  await L.wait(page, 500);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button[type=submit]')].find(e => e.offsetParent !== null); b.scrollIntoView({ block: 'center' }); }); await L.wait(page, 400);
  await page.click('form button[type=submit]');
  await page.waitForFunction(() => { const d = F(); return d.submitted === true || Object.keys(d.errors || {}).length > 0; }, null, { timeout: 60000 });
  const st = await page.evaluate(() => { const d = F(); return { submitted: d.submitted, errors: d.errors }; });
  console.log('Ergebnis:', JSON.stringify(st));
  if (!st.submitted) { await browser.close(); process.exit(3); }
  await L.wait(page, 1200);
  await L.shot(page, 'v8-link-fertig', { noScroll: true });
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
