/* Serien-Bausteine „Admin-Panel" — Allgemeines aus ../../shared/lib/shoot.cjs.
   Der Zugang braucht das Admin-Recht; mit einem Büro-Konto bleiben die Seiten leer. */
const S = require('../../shared/lib/shoot.cjs');
S.requireEnv();
module.exports = { ...S };
