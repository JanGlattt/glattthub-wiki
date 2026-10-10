/* Serien-Bausteine „Chat" — Allgemeines aus ../../shared/lib/shoot.cjs.
   Der Lauf liest und sendet nur Beispielnachrichten in einer lokalen Datenbank mit fiktiven Personen. */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv();

module.exports = { ...S };
