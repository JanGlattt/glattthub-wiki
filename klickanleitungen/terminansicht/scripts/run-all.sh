#!/bin/bash
# Kompletter Aufnahmelauf (verändert Staging + Phorest!): flow1 … flow6, dann Nachaufnahmen und Kontaktbogen
cd "$(dirname "$0")" || exit 1
for f in flow1 flow2 flow3 flow4 flow5 flow6; do
  echo "### $f"; node $f.cjs 2>&1 | grep -v "^CONSOLE\|^    at " | tail -12 || { echo "!!! $f fehlgeschlagen"; exit 1; }
done
echo "### reshoot3 (Fehlerbilder)"; node reshoot4.cjs 2>&1 | grep -v "^CONSOLE\|^    at " | tail -3
node contact.cjs
