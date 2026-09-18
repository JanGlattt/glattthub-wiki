#!/bin/bash
# Kompletter Aufnahmelauf der Klickanleitungen „Kundenverwaltung" (Dokumente I–N).
#
# Im Unterschied zum Lauf der Terminansicht veraendert dieser Lauf NICHTS:
# Es wird nur gelesen, Modale werden geoeffnet und wieder geschlossen. Gespeichert
# („In Phorest uebernehmen") und verschickt (WhatsApp) wird bewusst nie.
#
# Vorher:
#   cp .env.example .env            && $EDITOR .env          # Zugang, Kundin, Vertrag
#   cp mask.example.json mask.json  && $EDITOR mask.json     # echte Werte -> Beispielwerte
#   npm init -y && npm install playwright && npx playwright install chromium   # einmalig
# Aufruf:  bash scripts/run-all.sh  (aus dem Verzeichnis klickanleitungen/kundenverwaltung)
set -u
cd "$(dirname "$0")/.." || exit 1

[ -f .env ] && set -a && . ./.env && set +a

# Zugang: E-Mail/Passwort — oder KLICK_PIN (Institute-Konto, z. B. Prod nur lesend)
if [ -z "${KLICK_PIN:-}" ] && { [ -z "${KLICK_USER:-}" ] || [ -z "${KLICK_PW:-}" ]; }; then echo "!!! KLICK_USER/KLICK_PW oder KLICK_PIN fehlen — siehe .env.example"; exit 2; fi
for v in KLICK_BASE KLICK_CLIENT; do
  if [ -z "${!v:-}" ]; then echo "!!! $v fehlt — siehe .env.example"; exit 2; fi
done
if [ ! -f mask.json ]; then
  echo "!!! mask.json fehlt — ohne Maskierung wird nicht aufgenommen (Kopie von mask.example.json)."; exit 2
fi

echo "### Lauf gegen $KLICK_BASE · Kundin $KLICK_CLIENT"
for f in flow1 flow2 flow3 flow4 flow5 flow6; do
  echo "### $f"
  node scripts/$f.cjs 2>&1 | grep -v "^CONSOLE\|^    at " | tail -14 || { echo "!!! $f fehlgeschlagen"; exit 1; }
done

# Vollstaendigkeit pruefen: jeder von den Decks genutzte Screenshot muss jetzt in shots/ liegen
node - <<'NODE'
const fs = require('fs'), path = require('path');
const used = new Set();
const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (typeof o.shot === 'string') used.add(o.shot); Object.values(o).forEach(walk); } };
for (const f of fs.readdirSync('decks')) walk(JSON.parse(fs.readFileSync(path.join('decks', f), 'utf8')));
const missing = [...used].filter(s => !fs.existsSync(`shots/${s}.png`) && !fs.existsSync(`shots/${s}.jpg`)).sort();
console.log(missing.length ? '!!! FEHLENDE SCREENSHOTS: ' + missing.join(', ') : '### alle von den Decks genutzten Screenshots sind da');
NODE

# Letzte Sicherung gegen echte Daten im oeffentlichen Repo: die in mask.json hinterlegten
# Originalwerte duerfen in meta.json (Markierungs-Beschriftungen) nicht mehr auftauchen.
node - <<'NODE'
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('mask.json', 'utf8'));
const meta = fs.readFileSync('meta.json', 'utf8');
const leaks = (cfg.replace || []).map(([from]) => from).filter(v => v && meta.includes(v));
console.log(leaks.length ? '!!! ECHTE WERTE IN meta.json: ' + leaks.join(', ') + ' — nicht committen!' : '### meta.json ist frei von den maskierten Werten');
NODE

date '+%d.%m.%Y' > stand.txt
echo "### fertig — Stand $(cat stand.txt)"
echo "### PDFs bauen:  cd template && for d in ../decks/*.json; do node build.cjs \"\$d\"; done"
echo "### Screenshots vor dem Committen durchsehen — es sind Bilder einer echten Kundin."
