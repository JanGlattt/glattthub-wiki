#!/bin/bash
# Aufnahmelauf der Klickanleitungen „Bonus-Board" (Dokumente O–S).
#
# Der Lauf veraendert NICHTS: Es wird gelesen, Fenster werden geoeffnet und wieder verworfen.
# Weder eine Regel gespeichert, noch ein Widerruf entschieden, noch ein Monat eingefroren.
#
# Zwei Laeufe noetig, weil die Bilder verschiedene Rechte zeigen sollen:
#   1) Zugang OHNE Management-Recht  → flow1 flow2        (Dokumente O, P)
#   2) Zugang MIT Verwaltungs-Recht  → flow3 flow4 flow5  (Dokumente Q, R, S)
# Aufruf:  bash scripts/run-all.sh [flow1 flow2 …]   (ohne Angabe: alle)
set -u
cd "$(dirname "$0")/.." || exit 1

[ -f .env ] && set -a && . ./.env && set +a

# Zugang: E-Mail/Passwort — oder KLICK_PIN (Institute-Konto, z. B. Prod nur lesend)
if [ -z "${KLICK_PIN:-}" ] && { [ -z "${KLICK_USER:-}" ] || [ -z "${KLICK_PW:-}" ]; }; then echo "!!! KLICK_USER/KLICK_PW oder KLICK_PIN fehlen — siehe .env.example"; exit 2; fi
for v in KLICK_BASE KLICK_MONTH; do
  if [ -z "${!v:-}" ]; then echo "!!! $v fehlt — siehe .env.example"; exit 2; fi
done
if [ ! -f mask.json ]; then
  echo "!!! mask.json fehlt — das Board zeigt echte Kolleginnen. Kopie von mask.example.json anlegen."; exit 2
fi

FLOWS=${*:-"flow1 flow2 flow3 flow4 flow5"}
echo "### Lauf gegen $KLICK_BASE · Monat $KLICK_MONTH (laufend: ${KLICK_MONTH_OPEN:-—})"
for f in $FLOWS; do
  echo "### $f"
  node scripts/$f.cjs 2>&1 | grep -v "^CONSOLE\|^    at " | tail -14 || { echo "!!! $f fehlgeschlagen"; exit 1; }
done

node - <<'NODE'
const fs = require('fs'), path = require('path');
const used = new Set();
const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (typeof o.shot === 'string') used.add(o.shot); Object.values(o).forEach(walk); } };
for (const f of fs.readdirSync('decks')) walk(JSON.parse(fs.readFileSync(path.join('decks', f), 'utf8')));
const missing = [...used].filter(s => !fs.existsSync(`shots/${s}.png`) && !fs.existsSync(`shots/${s}.jpg`)).sort();
console.log(missing.length ? '!!! FEHLENDE SCREENSHOTS: ' + missing.join(', ') : '### alle von den Decks genutzten Screenshots sind da');
NODE

node - <<'NODE'
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('mask.json', 'utf8'));
const meta = fs.readFileSync('meta.json', 'utf8');
const leaks = (cfg.replace || []).map(([from]) => from).filter(v => v && meta.includes(v));
console.log(leaks.length ? '!!! ECHTE WERTE IN meta.json: ' + leaks.join(', ') + ' — nicht committen!' : '### meta.json ist frei von den maskierten Werten');
NODE

date '+%d.%m.%Y' > stand.txt
echo "### fertig — Stand $(cat stand.txt)"
echo "### PDFs bauen:  cd .. && for d in bonus-board/decks/*.json; do node shared/build-pdf.cjs \"\$d\"; done"
echo "### Web bauen:   cd .. && node shared/build-web.cjs bonus-board/decks/*.json"
echo "### Screenshots vor dem Committen durchsehen — sie zeigen echte Kolleginnen."
