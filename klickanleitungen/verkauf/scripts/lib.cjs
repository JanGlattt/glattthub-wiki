/* Serien-Bausteine „Verkauf" — Allgemeines aus ../../shared/lib/shoot.cjs.
   ACHTUNG: Diese Serie fotografiert Geld. Kein Ablauf löst einen Einzug aus, trägt eine
   Zahlung nach oder legt einen Widerruf an — Fenster werden geöffnet und verworfen.        */
const S = require('../../shared/lib/shoot.cjs');

S.requireEnv([
  ['KLICK_CONTRACT', 'Vertrags-ID aus der URL /hub/contracts/<ID> setzen (Ratenzahler mit Mandat).'],
]);

const CONTRACT = process.env.KLICK_CONTRACT;
const CANCELLATION = process.env.KLICK_CANCELLATION;   // offener Widerruf für Dokument 4

const launch = (opts = {}) => S.launch(opts);

/** Vertragsseite öffnen. */
async function openContract(page, id = CONTRACT, ms = 3000) {
  await S.goto(page, '/hub/contracts/' + id, ms);
}

/** Reiter der Vertragsseite wählen: Übersicht, Zahlungen & SEPA, Verlauf, E-Mail-Historie. */
async function tab(page, name, ms = 2500) {
  const ok = await S.clickText(page, '.contract-v2-tab', name, ms);
  if (!ok) console.log('REITER FEHLT:', name, '— Recht fehlt oder Beschriftung geändert?');
  return ok;
}

module.exports = { ...S, launch, openContract, tab, CONTRACT, CANCELLATION };
