/* Serien-Bausteine „Widerrufe" — Allgemeines aus ../../shared/lib/shoot.cjs.
   Der Lauf **legt keinen Widerruf an und schliesst keinen ab**. Der Assistent wird durchgeklickt und abgebrochen. NIE gedrückt: „Widerruf erfassen", „Abschliessen", „Stornieren" (SEPA), „Ausgewaehlte Pakete auf 0 setzen", „Abgeben", „Jetzt wirksam schalten", „Widerruf eintragen". */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv([
  ['KLICK_CANCELLATION', 'Offener Widerrufsfall — ID aus /hub/cancellations/<ID>'],
  ['KLICK_CONTRACT', 'Vertrag fuer den Assistenten (Schritt 1) — wird NICHT widerrufen'],
]);

const CANCELLATION = process.env.KLICK_CANCELLATION || null;   // Offener Widerrufsfall — ID aus /hub/cancellations/<ID>
const CANCELLATION_RA = process.env.KLICK_CANCELLATION_RA || null;   // Optional: Fall mit RA-Vorgang fuer wd5-ra
const CONTRACT = process.env.KLICK_CONTRACT || null;   // Vertrag fuer den Assistenten (Schritt 1) — wird NICHT widerrufen

module.exports = { ...S, CANCELLATION, CANCELLATION_RA, CONTRACT };
