/* Serien-Bausteine „Forderungen" — Allgemeines aus ../../shared/lib/shoot.cjs.
   Der Lauf **verschickt keine Mahnung und bewegt kein Geld**. Fenster werden geöffnet und verworfen. NIE gedrückt: „Ausfuehren" am naechsten Prozessschritt (verschickt E-Mail bzw. erzeugt den Brief), „Zahlung erfassen", „RZV festhalten", „Plan aendern", „Ruhend stellen", „Abschreiben", „Link erzeugen", „Fortsetzen", „Nachtragen", „Erfassen" (Kosten). */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv([
  ['KLICK_CASE', 'Aktiver Forderungsfall — ID aus /hub/receivables/<ID>'],
]);

const CASE = process.env.KLICK_CASE || null;   // Aktiver Forderungsfall — ID aus /hub/receivables/<ID>
const CASE_RZV = process.env.KLICK_CASE_RZV || null;   // Optional: Fall mit laufender Ratenzahlungsvereinbarung
const CASE_JUDICIAL = process.env.KLICK_CASE_JUDICIAL || null;   // Optional: Fall im gerichtlichen Mahnverfahren

module.exports = { ...S, CASE, CASE_RZV, CASE_JUDICIAL };
