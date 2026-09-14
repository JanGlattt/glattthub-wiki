#!/bin/bash
# Kompletter Aufnahmelauf der Klickanleitungen Terminansicht.
# ACHTUNG: Der Lauf veraendert Staging UND Phorest wirklich (Vertrag, Mandat, Buchung, Einstellungszettel).
#
# Vorher: Beratungstermin fuer eine Magdeburg-Testkundin buchen und die Zugangsdaten setzen —
#   cp .env.example .env && $EDITOR .env      (Vorlage liegt in diesem Verzeichnis, .env ist gitignored)
# Aufruf:  bash scripts/run-all.sh            (aus dem Verzeichnis klickanleitungen/terminansicht)
set -u
cd "$(dirname "$0")/.." || exit 1

[ -f .env ] && set -a && . ./.env && set +a

for v in KLICK_PW KLICK_APT KLICK_DATE; do
  if [ -z "${!v:-}" ]; then echo "!!! $v fehlt — siehe .env.example"; exit 2; fi
done

echo "### Lauf gegen ${KLICK_BASE:-Staging} · Termin $KLICK_APT ($KLICK_DATE)"
for f in flow1 flow2 flow3 flow4 flow5 flow6; do
  echo "### $f"
  node scripts/$f.cjs 2>&1 | grep -v "^CONSOLE\|^    at " | tail -12 || { echo "!!! $f fehlgeschlagen"; exit 1; }
done
# Fehlerbilder: reshoot3 macht m1 (Pflichtfelder) UND m2 (ungueltige IBAN), reshoot4 wiederholt m1
# mit robusteren Selektoren. Schlaegt reshoot3 fehl, weil das SEPA-Formular nicht mehr oeffnet, den
# Lauf einmal vor flow4 wiederholen — sonst fehlt m2 (genau so fehlte es im Satz vom 08.09.2026).
echo "### reshoot3 (Fehlerbilder m1 + m2)"; node scripts/reshoot3.cjs 2>&1 | grep -v "^CONSOLE\|^    at " | tail -4 || echo "!!! reshoot3 fehlgeschlagen — m2-fehler-iban pruefen"
echo "### reshoot4 (m1 nachschaerfen)"; node scripts/reshoot4.cjs 2>&1 | grep -v "^CONSOLE\|^    at " | tail -3
echo "### shot-shared (Kundenansicht des geteilten Formulars)"; node scripts/shot-shared.cjs 2>&1 | tail -3 || echo "!!! shot-shared fehlgeschlagen — Link aus flow2 abgelaufen?"
node scripts/contact.cjs

# Vollstaendigkeit pruefen: jeder von den Decks genutzte Screenshot muss jetzt in shots/ liegen
node - <<'NODE'
const fs = require('fs'), path = require('path');
const used = new Set();
const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (typeof o.shot === 'string') used.add(o.shot); Object.values(o).forEach(walk); } };
for (const f of fs.readdirSync('decks')) walk(JSON.parse(fs.readFileSync(path.join('decks', f), 'utf8')));
const missing = [...used].filter(s => !fs.existsSync(`shots/${s}.png`) && !fs.existsSync(`shots/${s}.jpg`)).sort();
console.log(missing.length ? '!!! FEHLENDE SCREENSHOTS: ' + missing.join(', ') : '### alle von den Decks genutzten Screenshots sind da');
NODE

# Aufnahmedatum festhalten — build.cjs setzt es als „Stand" in die Fusszeile aller PDFs
date '+%d.%m.%Y' > stand.txt
echo "### fertig — Stand $(cat stand.txt); PDFs bauen: cd template && for d in ../decks/*.json; do node build.cjs \$d; done"
