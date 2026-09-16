# Klickanleitungen Forderungen — Quellen

Quellen der Serie **Forderungen** (Forderungsmanagement) — von der Arbeitsliste bis zur
Abschreibung. Standard und Deck-Format: `klickanleitungen/README.md` und Wiki
`docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt | Seiten |
|---|---|---|
| **1 — Übersicht und Fall anlegen** | Arbeitsliste, woher die Fälle kommen, Fall ohne Vertrag anlegen, gerichtliche Fälle | 4 |
| **2 — Der Fall im Detail** | Forderungsaufstellung, § 367-Verrechnung, Seitenspalte, Anschrift korrigieren, Verlauf und Zahlungen | 4 |
| **3 — Den Prozess führen** | Die zwölf Stufen, Schreiben erzeugen und versenden, Gesamtsumme fällig stellen, RLS-Entscheid, extern erledigt | 5 |
| **4 — Zahlungen und Bezahllinks** | Zahlungseingang erfassen, stornieren, Sammel-Bezahllink, SEPA pausieren, Kosten erfassen | 5 |
| **5 — Ratenzahlungsvereinbarung** | Wann eine RZV, festhalten, Plan ändern, laufende Vereinbarung verfolgen | 4 |
| **6 — Eskalation und Abschluss** | 250-€-Weiche, gerichtliches Mahnverfahren, ruhend stellen, abschreiben und abschließen | 4 |

Alle sechs richten sich ans **Büro**. Inhaltliche Rückfragen gehen an die Kollegin, die das
Forderungsmanagement betreut — wer das ist, steht im Projektwissen des Haupt-Repos, nicht hier
(öffentliches Repo).

## Bauen

```bash
cd klickanleitungen
for d in forderungen/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs forderungen/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/forderungen
cp .env.example .env            && $EDITOR .env        # Zugang + aktiver Fall
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

Der Plan steht oben in `scripts/shots.cjs` — **24 Screenshots**.

### Der Lauf verschickt keine Mahnung

Das ist hier die schärfste Regel: Ein ausgeführter Prozessschritt **versendet eine echte E-Mail**
an die Kundin oder erzeugt einen Brief und setzt die Frist in Gang. Nie gedrückt werden:

- **„Ausführen“** am nächsten Prozessschritt
- **„Zahlung erfassen“** und **„Erfassen“** (Kosten) — verändern die Forderungsaufstellung
- **„RZV festhalten“** und **„Plan ändern“** — legen echte GoCardless-Einzüge an
- **„Ruhend stellen“**, **„Abschreiben“** — verändern den Zustand des Falls
- **„Link erzeugen“** — erzeugt einen personalisierten Bezahllink
- **„Fortsetzen“** (SEPA) und **„Nachtragen“** — greifen in den Zahlungsplan des Vertrags ein

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `fo2-*`, `fo3-*`, `fo4-*`, `fo6-weiche` | `KLICK_CASE`: einen **aktiven Fall mit Verlauf**, am besten mit erfassten Kosten |
| `fo3-rls-entscheid` | einen Fall mit **offener RLS-Entscheidung** — sonst zeigt die Seite den Normalzustand |
| `fo5-rzv-aendern`, `fo5-rzv-verfolgen` | `KLICK_CASE_RZV`: einen Fall mit **laufender Ratenzahlungsvereinbarung** |
| `fo6-gerichtlich` | `KLICK_CASE_JUDICIAL`: einen Fall im **gerichtlichen Mahnverfahren** |
| `fo1-gerichtlich` | mindestens einen gerichtlichen Fall — sonst ist der Block leer |

**Achtung Datenlage:** Die Staging-Datenbank hat zeitweise **keine** `debt_cases`. Dann kommen
die Bilder nur aus einer frischen Prod-Kopie — und die Maskierung wiegt entsprechend schwerer.

### Maskierung

Diese Serie zeigt **Kundennamen, Anschriften, Kontodaten und Beträge in echter Höhe**, dazu
Mahnschreiben im Volltext. `mask.json` ist Pflicht. Schreiben-Vorschauen (`fo3-naechster-schritt`,
`fo3-faellig`) enthalten die vollständige Anschrift der Kundin — diese Bilder besonders sorgfältig
prüfen, bevor sie ins öffentliche Repo wandern.
