#!/bin/bash
# Aufnahmelauf „Berichte". Der Lauf liest nur.
set -u
cd "$(dirname "$0")/.." || exit 1
[ -f .env ] && set -a && . ./.env && set +a
for v in KLICK_BASE KLICK_USER KLICK_PW; do
  if [ -z "${!v:-}" ]; then echo "!!! $v fehlt — siehe .env.example"; exit 2; fi
done
[ -f mask.json ] || { echo "!!! mask.json fehlt"; exit 2; }
node scripts/shots.cjs "$@" 2>&1 | grep -v "^CONSOLE\|^    at " | tail -60
date '+%d.%m.%Y' > stand.txt
echo "### fertig — Stand $(cat stand.txt)"
