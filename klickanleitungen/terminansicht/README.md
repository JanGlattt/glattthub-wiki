# Klickanleitungen Terminansicht — Quellen

Quellen der Klickanleitungen A–G (Beratungsgespräch in der Terminansicht), Standard siehe Wiki
`docs/KLICKANLEITUNGEN.md`.

- `decks/*.json` — Inhalt je Dokument (Cover, Seiten, Schritte, Hinweise, welche Screenshots mit welchen Markierungen)
- `meta.json` — Markierungen (Prozentkoordinaten) je Screenshot, beim Aufnehmen erzeugt
- `shots/*.jpg` — Screenshots (Staging, Testkundin „Tester Am Testen“ MD000002, Kontaktdaten maskiert)
- `template/` — `build.cjs` (HTML → PDF), `style.css`, Logo, Lato
- `scripts/` — Playwright-Aufnahmeskripte: `lib.cjs`/`common.cjs` (Login, Screenshot+Marks, Formular-Helfer),
  `flow1..6.cjs` (Ablauf Terminübersicht → Formulare → SEPA → Direkt behandeln → Einstellungszettel),
  `reshoot*.cjs` (Nachaufnahmen), `shot-shared.cjs`, `contact.cjs` (Kontaktbogen)

## Neu bauen

```bash
cd template && npm init -y && npm install playwright && npx playwright install chromium
node build.cjs ../decks/A-beratungstermin-starten.json      # → ../pdf/A-….pdf
```

## Screenshots neu aufnehmen

Voraussetzungen: Staging-Testuser `claude-dev@example.com` (Rolle Institute MA, Magdeburg), ein **gebuchter
Beratungstermin** für die Testkundin in Kabine MD 1 (`APT` in `lib.cjs` anpassen), Staging über die
`*.run.app`-Adresse (umgeht IAP). Reihenfolge: `flow1` → `flow2` → `flow3` → `flow4` → `flow5` → `flow6`
(jeder Lauf verändert den Zustand — Vertrag, Mandat, Buchung landen wirklich in Staging/Phorest).
