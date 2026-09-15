/* Serien-Bausteine „Bonus-Board" — Allgemeines (Anmeldung, Maskierung, Screenshot) kommt aus
   ../../shared/lib/shoot.cjs, hier stehen nur die Eigenheiten des Bonus-Boards.

   Besonderheit dieser Serie: Aufgenommen wird auf einer Kopie der Produktivdaten, die Seiten
   zeigen also **echte Kolleginnen mit echten Bonusbeträgen**. mask.json muss deshalb alle
   Personennamen enthalten — ohne sie startet kein Ablauf.                                  */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv([
  ['KLICK_MONTH', 'Monat des Laufs als JJJJ-MM setzen (ein abgeschlossener Monat mit Daten).'],
]);

const MONTH = process.env.KLICK_MONTH;

/** Browser mit Alpine-Zugriff: window.B() = Board, window.A() = Verwaltung. */
const launch = (opts = {}) => S.launch({
  ...opts,
  init: () => {
    window.B = () => Alpine.$data(document.querySelector('[x-data^="bonusBoard"]'));
    window.A = () => Alpine.$data(document.querySelector('[x-data^="bonusAdmin"]'));
  },
});

/** Bonus-Board öffnen, Monat setzen und auf die geladenen Daten warten. */
async function openBoard(page, { view = 'employee', month = MONTH } = {}, ms = 2500) {
  await S.goto(page, '/hub/bonus', 1200);
  await page.waitForFunction(() => window.B && window.B(), null, { timeout: 30000 });
  await page.evaluate(([m, v]) => { const b = window.B(); b.month = m; b.view = v; }, [month, view]);
  await page.waitForFunction(() => window.B().loading === false, null, { timeout: 30000 });
  await S.wait(page, ms);
}

/** Zwischen „Mein Board" und „Management" umschalten (wie der Schalter im Seitenkopf). */
async function setView(page, view, ms = 2000) {
  await page.evaluate(v => { window.B().view = v; }, view);
  await page.waitForFunction(() => window.B().loading === false, null, { timeout: 30000 });
  await S.wait(page, ms);
}

/** Bonus-Verwaltung öffnen. */
async function openAdmin(page, ms = 2500) {
  await S.goto(page, '/hub/bonus/verwaltung', 1500);
  await page.waitForFunction(() => window.A && window.A(), null, { timeout: 30000 });
  await S.wait(page, ms);
}

module.exports = { ...S, launch, openBoard, setView, openAdmin, MONTH };
