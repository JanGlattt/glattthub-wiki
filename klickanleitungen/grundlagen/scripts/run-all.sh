#!/bin/bash
# Aufnahmelauf der Klickanleitungen „Grundlagen" (Dokumente 1–6).
# Der Lauf veraendert nichts: Das Profil wird nur fotografiert, der Standort nicht umgestellt,
# keine Sitzung beendet. Einzige Ausnahme: glatttBert bekommt in Dokument 5 eine Frage gestellt —
# er kann ohnehin nur lesen.
#
# Vorher:  cp .env.example .env && $EDITOR .env
#          cp mask.example.json mask.json && $EDITOR mask.json
# Aufruf:  bash scripts/run-all.sh [flow1 …]
set -u
cd "$(dirname "$0")/.." || exit 1
[ -f .env ] && set -a && . ./.env && set +a
# Zugang: E-Mail/Passwort — oder KLICK_PIN (Institute-Konto, z. B. Prod nur lesend)
for v in KLICK_BASE; do
  if [ -z "${!v:-}" ]; then echo "!!! $v fehlt — siehe .env.example"; exit 2; fi
done
if [ -z "${KLICK_PIN:-}" ] && { [ -z "${KLICK_USER:-}" ] || [ -z "${KLICK_PW:-}" ]; }; then echo "!!! KLICK_USER/KLICK_PW oder KLICK_PIN fehlen — siehe .env.example"; exit 2; fi
[ -f mask.json ] || { echo "!!! mask.json fehlt — Kopie von mask.example.json anlegen."; exit 2; }

FLOWS=${*:-"flow1 flow2 flow3 flow4 flow5 flow6"}
echo "### Lauf gegen $KLICK_BASE"
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

date '+%d.%m.%Y' > stand.txt
echo "### fertig — Stand $(cat stand.txt)"
echo "### PDFs:  cd .. && for d in grundlagen/decks/*.json; do node shared/build-pdf.cjs \"\$d\"; done"
echo "### Web:   cd .. && node shared/build-web.cjs grundlagen/decks/*.json"
