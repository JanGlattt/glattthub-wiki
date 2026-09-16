/* Serien-Bausteine „Verkauf" — Allgemeines aus ../../shared/lib/shoot.cjs.
   Der Lauf liest nur: kein Gutschein wird angelegt, keine Preisliste gespeichert, keine
   Prämie ausgezahlt und keine Zufriedenheitsbefragung versendet. */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv();

module.exports = { ...S };
