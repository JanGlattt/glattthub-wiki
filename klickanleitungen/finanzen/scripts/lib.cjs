/* Serien-Bausteine „Finanzen" — Allgemeines aus ../../shared/lib/shoot.cjs. */
const S = require('../../shared/lib/shoot.cjs');
S.requireEnv();

/* Offener Forderungsfall fuer die Detailbilder — ohne ihn bleiben f2/f3 bei der Liste. */
const CASE = process.env.KLICK_CASE || null;
if (!CASE) console.log('HINWEIS: KLICK_CASE fehlt — f2/f3 zeigen nur die Liste.');
module.exports = { ...S, CASE };
