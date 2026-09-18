#!/usr/bin/env bash
# Portal bauen — lokal und in Cloud Build derselbe Weg.
#   bash portal/build.sh            alles: Web-Seiten, Suchindex, PDFs
#   bash portal/build.sh web        nur Web-Seiten (+ WebP-Screenshots)
#   bash portal/build.sh search     nur Suchindex (braucht dist/manifest.json; OPENAI_API_KEY → Embeddings)
#   bash portal/build.sh pdf        nur PDFs (braucht Playwright + Chromium)
# Umgebung: PORTAL_OUT (Standard portal/dist), OPENAI_API_KEY (optional), PDF_JPG_DIR (optional).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${PORTAL_OUT:-portal/dist}"
STAGE="${1:-all}"

# Alle Decks — Serien sind die Ordner mit decks/
DECKS=()
for d in */decks/*.json; do DECKS+=("$d"); done
[ "${#DECKS[@]}" -gt 0 ] || { echo "Keine Decks gefunden (*/decks/*.json)"; exit 1; }

if [ "$STAGE" = "all" ] || [ "$STAGE" = "web" ]; then
  mkdir -p "$OUT"
  # Alte Seiten weg, WebP-Bilder bleiben (werden nur bei neuerem Screenshot neu gewandelt)
  find "$OUT" -mindepth 1 -maxdepth 1 ! -name shots ! -name pdf -exec rm -rf {} +
  WEB_OUT="$OUT" node shared/build-web.cjs "${DECKS[@]}"
fi

if [ "$STAGE" = "all" ] || [ "$STAGE" = "search" ]; then
  node shared/build-search.cjs "$OUT"
fi

if [ "$STAGE" = "all" ] || [ "$STAGE" = "pdf" ]; then
  for d in "${DECKS[@]}"; do node shared/build-pdf.cjs "$d"; done
  mkdir -p "$OUT/pdf"
  cp */pdf/*.pdf "$OUT/pdf/"
  echo "PDF: $(ls "$OUT/pdf" | wc -l | tr -d ' ') Dateien"
fi

echo "Portal gebaut: $OUT ($STAGE)"
