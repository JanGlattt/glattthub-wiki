/* Serien-Bausteine „Grundlagen" — Allgemeines kommt aus ../../shared/lib/shoot.cjs.
   Besonderheit: Diese Serie nimmt in ZWEI Grössen auf — iPad quer für die Dokumente 1–3 und 5,
   Telefon (390 px) für Dokument 4. Deshalb gibt es hier `phone()` neben dem normalen launch(). */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv();

/** iPad quer, wie alle anderen Serien. */
const launch = (opts = {}) => S.launch(opts);

/** Telefon: 390 × 844 wie das Prüfmass des mobilen Seiten-Musters. */
const phone = (opts = {}) => S.launch({ ...opts, viewport: { width: 390, height: 844 } });

/** Seitenleiste ein- oder ausklappen (nur am grossen Bildschirm vorhanden). */
async function sidebar(page, open = true) {
  await page.evaluate((o) => {
    const el = document.getElementById('sidebar') || document.querySelector('.sidebar');
    if (!el) return;
    el.classList.toggle('sidebar-collapsed', !o);
  }, open);
  await S.wait(page, 400);
}

/** Eines der drei Werkzeuge am Kopf der Seitenleiste öffnen: Institute, Suche, Mitteilungen. */
async function tool(page, label, ms = 1200) {
  const ok = await S.clickText(page, '.sidebar-action, .sidebar-action-text', label, ms);
  if (!ok) console.log('WERKZEUG FEHLT:', label);
  return ok;
}

module.exports = { ...S, launch, phone, sidebar, tool };
