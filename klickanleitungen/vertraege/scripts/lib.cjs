/* Serien-Bausteine „Verträge" — Allgemeines aus ../../shared/lib/shoot.cjs.
   Diese Serie fotografiert Geld. Der Lauf **liest nur**: Fenster werden geöffnet und mit Escape verworfen. Ausdrücklich NIE gedrückt: „Betrag per SEPA einziehen" (holt sofort Geld), „Rate anhängen", „Änderungen an GoCardless senden", „Pausieren", „Fortsetzen", „Rate nachtragen", „Änderungen speichern", „Importieren", „Verwerfen". */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv([
  ['KLICK_CONTRACT', 'Ratenzahler MIT SEPA-Mandat, einige Raten bezahlt, einige offen — ID aus /hub/contracts/<ID>'],
  ['KLICK_SEARCH', 'Suchbegriff fuer die Trefferzeile in Dokument 1 (Nachname der Beispielkundin)'],
]);

const CONTRACT = process.env.KLICK_CONTRACT || null;   // Ratenzahler MIT SEPA-Mandat, einige Raten bezahlt, einige offen — ID aus /hub/contracts/<ID>
const CONTRACT_LEGACY = process.env.KLICK_CONTRACT_LEGACY || null;   // Optional: Legacy-Vertrag fuer vt5-legacy (Altsystem-Block)
const CONTRACT_MENU = process.env.KLICK_CONTRACT_MENU || CONTRACT;   // Optional: Vertrag OHNE laufenden Forderungsfall und mit offenem Rest — nur dort zeigt das Aktionen-Menü „Forderungsfall eröffnen“ (vt4-aktionen)
const SEARCH = process.env.KLICK_SEARCH || null;   // Suchbegriff fuer die Trefferzeile in Dokument 1 (Nachname der Beispielkundin)

module.exports = { ...S, CONTRACT, CONTRACT_LEGACY, CONTRACT_MENU, SEARCH };
