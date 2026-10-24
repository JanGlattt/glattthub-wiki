/* Serien-Bausteine „Kundenservice" — Allgemeines aus ../../shared/lib/shoot.cjs.
   Der Lauf liest nur; geöffnet werden Ticket, Menüs und Fenster über den Alpine-Zustand der Seite.
   Aufgenommen wird lokal mit fiktiven Kundinnen (Beispieldaten, siehe README). */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv();

module.exports = { ...S };
