/* Dokument P — Challenges verstehen
   Braucht einen Monat MIT Challenges. Für „p3-blind" eine Blind-Challenge im LAUFENDEN Monat
   (nur dann verbirgt das Board die anderen Werte), für „p2-ranking" am besten einen
   abgeschlossenen Monat mit Endstand.                                                      */
const L = require('./lib.cjs');
const OPEN = process.env.KLICK_MONTH_OPEN || L.MONTH;

const challengeClip = async (page, needle) => page.evaluate((n) => {
  const c = [...document.querySelectorAll('.card-glattt')]
    .filter(e => e.offsetParent !== null)
    .find(e => e.innerText.includes(n));   // innerText: versteckte Untertitel zählen nicht
  if (!c) return null;
  c.dataset.klick = 'ch';
  c.scrollIntoView({ block: 'center' });   // Karte kann unterhalb des Sichtfensters liegen
  const b = c.getBoundingClientRect();
  return { x: Math.max(0, b.x - 16), y: Math.max(0, b.y - 16), width: b.width + 32, height: b.height + 32 };
}, needle).then(async (clip) => { await page.waitForTimeout(500); if (!clip) return clip; return page.evaluate(() => { const b = document.querySelector('[data-klick="ch"]').getBoundingClientRect(); return { x: Math.max(0, b.x - 16), y: Math.max(0, b.y - 16), width: b.width + 32, height: b.height + 32 }; }); });

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);

  // ── p1 Challenge-Karte (laufender Monat)
  await L.openBoard(page, { view: 'own', month: OPEN }, 3000);
  let clip = await challengeClip(page, 'Monats-Challenge');
  if (clip) {
    await L.shot(page, 'p1-challenge-karte', { clip, noScroll: true, marks: [
      { id: 'untertitel', kind: 'badge', n: 1, sel: '[data-klick="ch"] .card-glattt-subtitle', at: 'l' },
      { id: 'bedingung', kind: 'badge', n: 2, sel: '[data-klick="ch"] .bonus-goal-notes', at: 'l' },
      { id: 'praemie', kind: 'badge', n: 3, sel: '[data-klick="ch"] .badge-glattt', at: 'r' },   // Status-Badge, dort erscheint die Prämie/Platzierung
    ]});
  } else { console.log('Keine Challenge im Monat ' + OPEN + ' — p1 fehlt.'); }

  // ── p3 Blind-Challenge (nur im laufenden Monat aussagekräftig)
  clip = await challengeClip(page, 'Blind');
  if (clip) {
    await L.shot(page, 'p3-blind', { clip, noScroll: true, marks: [
      { id: 'badge', kind: 'chip', label: 'Blind', ...L.byText('.badge-glattt', 'Blind'), at: 'l' },
    ]});
  } else { console.log('Keine Blind-Challenge im Monat ' + OPEN + ' — p3 fehlt.'); }

  // ── p4 Serie (Ziel-Karte mit Punktreihe)
  const serie = await page.evaluate(() => {
    const dots = [...document.querySelectorAll('.bonus-streak-dots')].find(e => e.offsetParent !== null);
    const c = dots?.closest('.card-glattt');
    if (!c) return null;
    c.dataset.klick = 'serie';
    c.scrollIntoView({ block: 'center' });
    const b = c.getBoundingClientRect();
    return { x: Math.max(0, b.x - 16), y: Math.max(0, b.y - 16), width: b.width + 32, height: b.height + 32 };
  });
  await L.wait(page, 500);
  if (serie) {
    await L.shot(page, 'p4-serie', { clip: serie, noScroll: true, marks: [
      { id: 'punkte', kind: 'chip', label: 'Monate in Folge', sel: '[data-klick="serie"] .bonus-streak-dots', at: 'l' },
    ]});
  } else { console.log('Keine Serie sichtbar — p4 fehlt.'); }

  // ── p2 Ranking (abgeschlossener Monat: Endstand statt Zwischenstand)
  await L.openBoard(page, { view: 'own', month: L.MONTH }, 3000);
  clip = await challengeClip(page, 'Ranking-Challenge');
  if (clip) {
    await L.shot(page, 'p2-ranking', { clip, noScroll: true, marks: [
      { id: 'platz', kind: 'badge', n: 1, sel: '[data-klick="ch"] .bonus-ranking-rank-col', at: 'r' },
      { id: 'preis', kind: 'badge', n: 2, ...L.byText('[data-klick="ch"] th', 'Preis'), at: 't' },
      { id: 'status', kind: 'badge', n: 3, ...L.byText('[data-klick="ch"] th', 'Status'), at: 't' },
      { id: 'tabelle', kind: 'frame', color: 'teal', sel: '[data-klick="ch"] table' },
    ]});
  } else { console.log('Keine Ranking-Challenge im Monat ' + L.MONTH + ' — p2 fehlt.'); }

  await browser.close();
})();
