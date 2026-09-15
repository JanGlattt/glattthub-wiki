# Klickanleitungen Berichte — Quellen

Quellen der Serie **Berichte** — ein Rahmendokument plus je eine Anleitung für jeden der
16 Berichte. Standard und Deck-Format: `klickanleitungen/README.md` und Wiki
`docs/KLICKANLEITUNGEN.md`.

| Dokument | Bericht | Zielgruppe |
|---|---|---|
| **0 — So funktionieren die Berichte** | Zeitraum und Standort, Kennzahlen-Zeile, Diagramm/Tabelle, Export | Leitung |
| **1 — Verkaufsstatistik** | `/hub/reports/verkaufsstatistik` | Leitung |
| **2 — Zukünftige Beratungsgespräche** | `/hub/reports/zukuenftige-beratungsgespraeche` | Leitung |
| **3 — Vergangene Beratungsgespräche** | `/hub/reports/vergangene-beratungsgespraeche` | Leitung |
| **4 — Stornierte und gelöschte Termine** | `/hub/reports/stornierte-termine` | Leitung |
| **5 — Widerruf-Statistik** | `/hub/reports/widerruf-statistik` | Büro |
| **6 — Terminstatistik** | `/hub/reports/terminstatistik` | Leitung |
| **7 — glattt-KPIs** | `/hub/reports/glattt-kpis` | Leitung |
| **8 — Der glattt-Kunde** | `/hub/reports/kundenstatistik` | Leitung |
| **9 — Mitarbeiterperformance** | `/hub/reports/staff-performance` | Leitung |
| **10 — Schuldenbericht** | `/hub/reports/schulden` | Büro |
| **11 — Office-Teammeeting** | `/hub/reports/office-teammeeting` | Büro |
| **12 — Gutschein-Aktion** | `/hub/reports/gutschein-aktion` | Leitung |
| **13 — HR-Kennzahlen** | `/hub/reports/hr-kennzahlen` | Leitung |
| **14 — Ads-Analyse** | `/hub/reports/ads-analyse` | Leitung |
| **15 — Besucher & Buchungs-Funnel** | `/hub/reports/besucher-funnel` | Leitung |
| **16 — glattt-Pakete Statistik** | `/hub/reports/glattt-pakete` | Leitung |

**Dokument 0 zuerst lesen.** Es erklärt einmal, was auf *jeder* Berichtsseite gleich
funktioniert — Zeitraum, Standortfilter, die Laschen am Kartenrand (Diagramm ⇄ Tabelle), die
personalisierbare Kennzahlen-Zeile und der CSV-Export. Die Dokumente 1–16 setzen das voraus und
erklären nur noch, **was der jeweilige Bericht zeigt und wie er zu lesen ist**.

**Neuer Bericht = neues Dokument.** Ein Bericht steht in der `ReportRegistry`; kommt dort einer
dazu, kommt hier eine Anleitung dazu (und ein Eintrag in
`.github/klickanleitungen-abdeckung.json` im Hauptrepo).

## Bauen

```bash
cd klickanleitungen
for d in berichte/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs berichte/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/berichte
cp .env.example .env            && $EDITOR .env        # Zugang + KLICK_RANGE
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

**`KLICK_RANGE` setzen** (Format `JJJJ-MM`, etwa `2026-08`). Ohne festen Monat fotografiert der
Lauf den laufenden — dann zeigen die Bilder einen angebrochenen Zeitraum mit halben Kurven, und
beim nächsten Lauf sieht alles anders aus. Ein abgeschlossener Monat mit Daten in **allen**
Instituten ist die richtige Wahl.

Der Plan steht oben in `scripts/shots.cjs` — **52 Screenshots**, drei bis vier je Bericht.
Einzeln: `node scripts/shots.cjs r14-kosten`.

### Der Lauf liest nur

Berichte ändern nichts. Der Lauf löst außerdem **keinen CSV-Export** aus (der Export-Dialog
wird nur gezeigt) und ruft keine Endpunkte auf, die einen Cache neu aufbauen.

### Was die Bilder brauchen

- Ein Zeitraum mit **Daten in allen Instituten** — sonst sind halbe Diagramme leer.
- **Ads-Analyse (14)** und **Besucher-Funnel (15)** brauchen Kampagnen- und Tracking-Daten;
  auf Staging fehlen die oft. Notfalls aus der Prod-Ansicht aufnehmen und **sorgfältig maskieren**.
- **Der glattt-Kunde (8)**: Kanaldaten gibt es erst ab 30.03.2026, eine Conversion-Rate vor 2025
  ist ein Artefakt. Einen Zeitraum wählen, der das nicht zeigt.
- **Mitarbeiterperformance (9)** und **HR-Kennzahlen (13)** zeigen Namen von Kolleginnen — hier
  ist die Maskierung besonders wichtig.
- Die Karten laden nach; der Lauf wartet je Seite, trotzdem lohnt eine Sichtprüfung auf leere
  Diagramme, bevor die Bilder ins Deck gehen.

### Maskierung

`mask.json` ist Pflicht. Kritisch in dieser Serie: **Namen von Mitarbeiterinnen** (Berichte 9,
11, 13), **Kundennamen** (5, 8, 10) und **Umsatzzahlen je Institut**. Ob echte Umsatz- und
Bonuszahlen im öffentlichen Wiki-Repo stehen dürfen, ist noch **nicht entschieden** — bis dahin
gehören solche Screenshots nicht in einen Commit.
