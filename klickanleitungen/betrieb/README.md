# Klickanleitungen Betrieb — Quellen

Quellen der Serie **Betrieb** (Institute, Formulare, Services). Der Laser hat seit 18.09.2026 eine eigene Serie (`../laser`). Standard und
Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt | Zielgruppe | Stand |
|---|---|---|---|
| **1 — Institute im Überblick** | Kachelübersicht, Steckbrief-Spalte, Kennzahlen, Team | Leitung | v1.0, Screenshots offen |
| **2 — Ein Institut pflegen** | Infos und Bilder, Bankdaten, Sichtbarkeit und Zugang | Büro | v1.0, Screenshots offen |
| **3 — Formulare erstellen** | Editor, Feldtypen, Bedingungen, Einstellungen | Büro | v1.0, Screenshots offen |
| **4 — Formulare teilen & Einreichungen** | Link erzeugen, ausfüllen lassen, Eingänge lesen | Institute | v1.0, Screenshots offen |
| **5 — Services und Körperzonen** | Servicekatalog, Beratungs-Flag, Zuordnung zu Körperzonen | Büro | v1.0, Screenshots offen |

Dokument 4 ist das einzige der Serie, das im Institut gebraucht wird — dort wird ein Formular
geteilt und der Eingang gelesen, aber keines gebaut.

## Bauen

```bash
cd klickanleitungen
for d in betrieb/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs betrieb/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/betrieb
cp .env.example .env            && $EDITOR .env        # Zugang
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

Der Plan steht als Tabelle oben in `scripts/shots.cjs` — 21 Screenshots. Einzeln geht auch:
`node scripts/shots.cjs b9-editor`.

### Der Lauf ändert nichts

Er **liest nur**. Wo ein Fenster geöffnet wird, wird es danach verworfen. Ausdrücklich nicht
gedrückt werden:

- **„Speichern“** im Formular-Editor — ein verändertes Formular wirkt sofort auf alle offenen Links.
- **„Formular teilen“** — ein erzeugter Link geht an echte Kundinnen und lässt sich nicht zurückholen.
- Alles im Laser-Modul, was einen **Wartungs- oder Reparatureintrag** anlegt.
- Bankdaten und Sichtbarkeit eines Instituts — das Ausblenden eines Instituts verändert
  sämtliche Auswertungen („Alle Standorte“ zählt es dann nicht mehr mit).

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `b2`–`b7` | ein **vollständig gepflegtes Institut** (Bild, Farbe, Team, Bankdaten) |
| `b9`–`b11` | ein **Formular mit mehreren Feldtypen und mindestens einer Bedingung** |
| `b13`, `b14` | ein **geteiltes Formular mit mindestens einer Einreichung** |
| `b17` | gepflegte **Zuordnung Service → Körperzone** |
| `b19`, `b20` | ein **Gerät mit Historie** (Wartung oder Reparatur) |

Fehlt etwas, meldet der Ablauf es und die Seite bleibt ein Platzhalter.

### Maskierung

`mask.json` ist Pflicht. In dieser Serie sind es weniger Kundendaten als **Namen aus dem Team**
(Institutsseite, Formular-Einreichungen) und **Bankdaten des Instituts** — beides gehört
maskiert, bevor ein Bild ins öffentliche Wiki-Repo wandert.
