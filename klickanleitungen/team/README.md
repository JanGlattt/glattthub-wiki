# Klickanleitungen Team — Quellen

Quellen der Serie **Team** (Personalübersicht, Hub-Konten, Reisekosten). Standard und
Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt | Zielgruppe | Stand |
|---|---|---|---|
| **1 — Personalübersicht und Hub-Konten** | Liste, Person im Detail, Konto-Assistent, Archivieren | Büro | v1.0, Screenshots offen |
| **2 — Reisekosten erfassen** | Anspruchstage, Fahrt, Verpflegung, Einreichen | Institute | v1.0, Screenshots offen |
| **3 — Reisekosten freigeben** | Eingänge prüfen, Belege ansehen, entscheiden | Büro | v1.0, Screenshots offen |

Dokument 2 richtet sich an die Institute — jede reicht ihre eigenen Reisekosten ein. 1 und 3
sind Büro-Arbeit.

## Bauen

```bash
cd klickanleitungen
for d in team/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs team/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/team
cp .env.example .env            && $EDITOR .env        # Zugang
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

Der Plan steht oben in `scripts/shots.cjs` — 11 Screenshots.

### Der Lauf legt kein Konto an und gibt nichts frei

Er **liest nur**. Ausdrücklich nicht gedrückt werden:

- **„Einladen“** im Konto-Assistenten — die Einladung ginge als echte E-Mail an die Person.
  Der Assistent wird geöffnet, bebildert und abgebrochen.
- **„Archivieren“** — sperrt die Anmeldung zum 1. des Folgemonats.
- **„Freigeben“** und **„Ablehnen“** in der Reisekosten-Freigabe — eine Freigabe löst die
  Auszahlung aus.
- **„Einreichen“** in der Erfassung — das Formular wird ausgefüllt gezeigt, aber nicht abgeschickt.

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `p2` | eine **vollständig gepflegte Person** (Vertrag, Institut, Phorest-Zuordnung) |
| `p3` | eine Person **ohne Hub-Konto** — nur dann zeigt der Assistent seinen ersten Schritt |
| `p5`–`p8` | ein **Monat mit Anspruchstagen aus askDANTE** und mindestens einer erfassten Fahrt |
| `p9`–`p11` | mindestens **eine eingereichte, noch offene Abrechnung** |

### Maskierung

`mask.json` ist Pflicht und muss hier **alle Namen der Kolleginnen** erfassen — die
Personalübersicht zeigt sie zusammen mit Institut, Eintritt und Vertragsdaten. Gehälter und
Bonuszahlen gehören **nicht** in diese Bilder; wo die Seite sie zeigt, wird der Ausschnitt
enger gewählt. Das Wiki-Repo ist öffentlich.
