/* Serien-Bausteine „Wissen" — Allgemeines kommt aus ../../shared/lib/shoot.cjs.
   Die glatttipedia hat eine eigene Hülle (kein Hub-Menü); aufgenommen wird iPad quer wie überall. */
const S = require('../../shared/lib/shoot.cjs');
S.requireEnv();
const launch = (opts = {}) => S.launch(opts);
/** Hover auf einen Kapitel-Reiter, damit das Flyout steht */
async function hoverTab(page, text) {
  const tab = page.locator('.wissen-tabs-inner .wissen-tab-wrap[data-fit]:not([hidden]) > .wissen-tab', { hasText: text }).first();
  await tab.hover();
  await S.wait(page, 500);
}
module.exports = { ...S, launch, hoverTab };
