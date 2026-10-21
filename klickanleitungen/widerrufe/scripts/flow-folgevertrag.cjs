/* Widerrufe 2, Nachtrag 21.10.2026: Hinweiskarte „Folgevertrag fehlt“ im Überblick des Falls.
   Nur Lesen. Der Beispielfall (Upgrade, abgeschlossen) wird dafür lokal kurz ohne Folgevertrag geführt
   (Datenbank-Zustand vor dem Lauf, danach wieder hergestellt) — gedrückt wird nichts.            */
const L = require('./lib.cjs');
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/cancellations/' + process.env.KLICK_CASE_FV, 3500);
  const info = await page.evaluate(() => { const a = document.querySelector('[data-successor-hint]'); return a ? a.innerText : null; });
  console.log('Hinweis:', JSON.stringify(info));
  // Nur die Hinweiskarte aufnehmen (Kundenname und Vertragsnummer der Kopie bleiben außerhalb des Bildes, Nummer im Knopf wird ersetzt)
  await page.evaluate(() => { const a = document.querySelector('[data-successor-hint]'); a.scrollIntoView({ block: 'center' }); a.querySelectorAll('button').forEach(b => { b.textContent = b.textContent.replace(/\d{4}\.\d{2}\.\d{2}-[\w-]+/, '2026.09.30-MD000123'); }); });
  await L.wait(page, 600);
  const clip = await L.clipOf(page, '[data-successor-hint]', 14);
  await L.shot(page, 'wd2-folgevertrag-fehlt', { clip, noScroll: true, marks: [ { id: 'knopf', kind: 'chip', label: 'Hier tippen', sel: '[data-successor-hint] button', at: 'r' } ] });
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
