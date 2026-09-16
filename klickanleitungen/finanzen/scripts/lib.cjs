/* Serien-Bausteine „Finanzen" — Allgemeines aus ../../shared/lib/shoot.cjs.
   Der Lauf liest nur: keine Zahlung wird nachgetragen, kein Unternehmensvertrag gekuendigt. */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv();

module.exports = { ...S };
