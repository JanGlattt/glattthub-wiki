/* Grundlagen 5 — glatttBert fragen
   Stellt EINE lesende Beispielfrage. glatttBert kann ohnehin nur lesen — trotzdem keine
   Frage stellen, die Kundendaten in den Screenshot holt: die Beispielfrage bleibt bei Zahlen. */
const L = require('./lib.cjs');
const FRAGE = process.env.KLICK_BERT_FRAGE || 'Wie viele Beratungsgespräche hatten wir letzte Woche?';

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/start', 2500);

  // ── k1 Assistent öffnen
  const opened = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .filter(e => e.offsetParent !== null)
      .find(e => /bert/i.test(e.textContent) || /bert/i.test(e.getAttribute('aria-label') || ''));
    if (!b) return false;
    b.click();
    return true;
  });
  await L.wait(page, 2500);
  if (!opened) { console.log('glatttBert-Knopf nicht gefunden — Selektor prüfen.'); await browser.close(); return; }

  await L.shot(page, 'k1-bert', { marks: [
    { id: 'feld', kind: 'chip', label: 'Hier fragen', sel: 'textarea, input[placeholder*="Frage"]', at: 'r' },
    { id: 'neu', kind: 'badge', n: 4, ...L.byText('button', 'Neue Konversation'), at: 'l' },
  ]});

  // ── k2 Antwort
  await page.fill('textarea, input[placeholder*="Frage"]', FRAGE);
  await page.keyboard.press('Enter');
  await L.wait(page, 12000);   // Antwort kommt über die API, das dauert
  await L.shot(page, 'k2-bert-antwort', { marks: [
    { id: 'antwort', kind: 'frame', color: 'teal', sel: '.ai-message, .chat-message' },
  ]});

  await browser.close();
})();
