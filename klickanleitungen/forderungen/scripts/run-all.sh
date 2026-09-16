#!/bin/bash
# Aufnahmelauf „Forderungen".
# Der Lauf **verschickt keine Mahnung und bewegt kein Geld**. Fenster werden geöffnet und verworfen. NIE gedrückt: „Ausfuehren" am naechsten Prozessschr
#
# Vorher:  cp .env.example .env && $EDITOR .env
#          cp mask.example.json mask.json && $EDITOR mask.json
# Aufruf:  bash scripts/run-all.sh [name …]
set -u
cd "$(dirname "$0")/.." || exit 1
[ -f .env ] && set -a && . ./.env && set +a
for v in KLICK_BASE KLICK_USER KLICK_PW KLICK_CASE; do
  if [ -z "${!v:-}" ]; then echo "!!! $v fehlt — siehe .env.example"; exit 2; fi
done
[ -f mask.json ] || { echo "!!! mask.json fehlt — die Bilder zeigen Kundennamen und Betraege."; exit 2; }

echo "### Lauf gegen $KLICK_BASE"
node scripts/shots.cjs "$@" 2>&1 | grep -v "^CONSOLE\|^    at "

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

echo "### Screenshots vor dem Committen durchsehen — Namen, IBANs, Betraege."
