/* Serien-Bausteine „Berichte" — Allgemeines aus ../../shared/lib/shoot.cjs.
   Alle Berichtsseiten sind gleich gebaut, deshalb genügt ein Aufnahmeskript für alle 17 Dokumente. */
const S = require('../../shared/lib/shoot.cjs');
S.requireEnv();
module.exports = { ...S };
