#!/bin/bash
# Aufnahmelauf „Team". Der Lauf liest nur — nichts wird gespeichert oder ausgelöst.
# Vorher:  cp .env.example .env && $EDITOR .env
#          cp mask.example.json mask.json && $EDITOR mask.json
set -u
cd "$(dirname "$0")/.." || exit 1
[ -f .env ] && set -a && . ./.env && set +a
for v in KLICK_BASE KLICK_USER KLICK_PW; do
  if [ -z "${!v:-}" ]; then echo "!!! $v fehlt — siehe .env.example"; exit 2; fi
done
[ -f mask.json ] || { echo "!!! mask.json fehlt"; exit 2; }

node scripts/shots.cjs "$@" 2>&1 | grep -v "^CONSOLE\|^    at " | tail -40

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
