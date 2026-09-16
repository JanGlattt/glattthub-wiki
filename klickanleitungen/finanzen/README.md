# Klickanleitungen Finanzen — Quellen

Quellen der Serie **Finanzen** (Schulden, Unternehmensverträge). Das Forderungsmanagement ist
seit 16.09.2026 eine **eigene Serie** — siehe `klickanleitungen/forderungen/`. Standard und
Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt | Zielgruppe | Stand |
|---|---|---|---|
| **1 — Schulden im Überblick** | Kennzahlen, Liste der Schuldnerinnen, Herkunft der Zahlen | Büro | v1.0, Screenshots offen |
| **2 — Unternehmensverträge** | Vertrag erfassen, Fristen und Kündigung, Übersicht | Büro | v1.0, Screenshots offen |

Beide richten sich ans **Büro**. Im Institut genügt „Kundenverwaltung 4“ — offene Forderungen
erkennen, nicht bearbeiten.

## Bauen

```bash
cd klickanleitungen
for d in finanzen/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs finanzen/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/finanzen
cp .env.example .env            && $EDITOR .env        # Zugang
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

Der Plan steht oben in `scripts/shots.cjs` — 5 Screenshots.

### Der Lauf bewegt kein Geld

Er **liest nur**. Ausdrücklich nicht gedrückt werden:

- Alles im Schulden-Bericht, was eine **Zahlung nachträgt oder einen Einzug startet**.
- **„Kündigen“** und **„Speichern“** bei Unternehmensverträgen.

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `f5`, `f6` | einen Zeitraum mit **echten Rücklastschriften**; auf Staging ist die Liste oft leer |
| `f8`, `f9` | mindestens einen **Unternehmensvertrag mit Frist** in den nächsten Monaten |

### Maskierung

Der Schuldenbericht zeigt **Kundennamen und Beträge in echter Höhe**, die Unternehmensverträge
Vertragspartner und Konditionen.
`mask.json` ist Pflicht, und jeder Screenshot gehört vor dem Committen einzeln durchgesehen —
das Wiki-Repo ist öffentlich.
