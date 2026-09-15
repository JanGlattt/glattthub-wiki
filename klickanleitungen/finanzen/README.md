# Klickanleitungen Finanzen — Quellen

Quellen der Serie **Finanzen** (Forderungsmanagement, Schulden, Unternehmensverträge).
Standard und Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt | Zielgruppe | Stand |
|---|---|---|---|
| **1 — Forderungsmanagement** | Fallliste, Fall im Detail, Prozessschritte, Fall anlegen | Büro | v1.0, Screenshots offen |
| **2 — Schulden im Überblick** | Kennzahlen, Liste der Schuldnerinnen, Herkunft der Zahlen | Büro | v1.0, Screenshots offen |
| **3 — Unternehmensverträge** | Vertrag erfassen, Fristen und Kündigung, Übersicht | Büro | v1.0, Screenshots offen |

Die ganze Serie ist Büro-Arbeit. Im Institut genügt „Kundenverwaltung 4“ — offene Forderungen
erkennen, nicht bearbeiten.

**Ansprechpartnerin fürs Forderungsmanagement ist Janine Tasto** — inhaltliche Rückfragen zu
Dokument 1 gehen an sie.

## Bauen

```bash
cd klickanleitungen
for d in finanzen/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs finanzen/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/finanzen
cp .env.example .env            && $EDITOR .env        # Zugang + KLICK_CASE
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

`KLICK_CASE` ist die ID eines **offenen Forderungsfalls** (aus der Adresszeile von
`/hub/receivables/<ID>`). Der Plan steht oben in `scripts/shots.cjs` — 9 Screenshots; die
Detailbilder `f2`–`f4` werden auf diesen Fall gerichtet.

### Der Lauf bewegt kein Geld

Er **liest nur**. Ausdrücklich nicht gedrückt werden:

- **Prozessschritte** eines Forderungsfalls (Mahnung, Inkasso, Ruhend) — jeder Schritt schreibt
  Historie und löst Schreiben aus.
- **„Fall anlegen“** — der Dialog wird geöffnet und verworfen.
- Alles im Schulden-Bericht, was eine **Zahlung nachträgt oder einen Einzug startet**.
- **„Kündigen“** bei Unternehmensverträgen.

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `f2`, `f3` | einen **offenen Fall mit Verlauf** — ohne Historie bleibt der Verlauf leer |
| `f5`, `f6` | einen Zeitraum mit **echten Rücklastschriften**; auf Staging ist die Liste oft leer |
| `f8`, `f9` | mindestens einen **Unternehmensvertrag mit Frist** in den nächsten Monaten |

Hinweis: Die Staging-Datenbank hat zeitweise **keine** `debt_cases` — dann kommen die
Forderungs-Bilder nur aus einer frischen Prod-Kopie.

### Maskierung

Diese Serie zeigt **Kundennamen, Vertragsnummern, IBANs und Beträge in echter Höhe**.
`mask.json` ist Pflicht, und jeder Screenshot gehört vor dem Committen einzeln durchgesehen —
das Wiki-Repo ist öffentlich.
