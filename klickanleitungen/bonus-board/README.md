# Klickanleitungen Bonus-Board — Quellen

Quellen der Klickanleitungen **O–S** (Bonus-Board im glatttHub). Standard und Deck-Format:
`klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Für wen | Inhalt |
|---|---|---|
| **O — Mein Bonus** | Mitarbeiterin | Board öffnen, Monatszahlen (gesichert / Stand / Hochrechnung / Abwesenheit), Ziel-Karten, Team-Karte |
| **P — Challenges verstehen** | Mitarbeiterin | Monats-Challenge, Ranking, Blind-Challenge, Serien |
| **Q — Bonus-Board für die Leitung** | Leitung | Management-Sicht, Institute vs. Minimalziele, Boni je Mitarbeiterin, offene Widerrufe, Export |
| **R — Regeln & Challenges anlegen** | Büro | Verwaltung, vierstufiger Assistent, Challenge je Monat, Minimalziele, Sichtbarkeit |
| **S — Monatsabschluss** | Büro | Widerrufe entscheiden, Wert-Korrekturen, einfrieren, Google-Bewertungen |

## Stand

**v1.0 (15.09.2026):** Texte, Decks und Aufnahmeskripte fertig, **Screenshots stehen aus**.
PDFs und Web-Seiten bauen schon jetzt — fehlende Bilder erscheinen als Platzhalter.

Fachliche Grundlage ist der Stand des Moduls nach Runde 8 (15.09.2026); die Feinheiten
(Vorbehalt, Abwesenheitsregel, Parken von Widerrufen, Basis der Prozent-Aufschläge,
Blind-Challenges, ratio-Kennzahlen ohne lineare Hochrechnung) stehen im Projektwissen des
Haupt-Repos unter `.github/knowledge/bonus-board-modul.md`.

## Bauen

```bash
cd klickanleitungen
for d in bonus-board/decks/*.json; do node shared/build-pdf.cjs "$d"; done   # PDFs
node shared/build-web.cjs bonus-board/decks/*.json                           # Endbenutzer-Wiki
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/bonus-board
cp .env.example .env            && $EDITOR .env         # Zugang, Monat
cp mask.example.json mask.json  && $EDITOR mask.json    # Namen der Kolleginnen
bash scripts/run-all.sh flow1 flow2        # Zugang OHNE Management-Recht  → O, P
bash scripts/run-all.sh flow3 flow4 flow5  # Zugang MIT Verwaltungs-Recht  → Q, R, S
```

**Zwei Läufe, zwei Zugänge.** Die Dokumente O und P sollen zeigen, was eine Mitarbeiterin
sieht — mit einem Verwaltungs-Zugang stünden dort Umschalter und Werkzeuge, die sie nie hat.
Q, R und S brauchen umgekehrt die vollen Rechte.

**Zwei Monate.** `KLICK_MONTH` ist ein **abgeschlossener** Monat (Endstände, Ranking mit
Endstand, Freeze-Historie), `KLICK_MONTH_OPEN` der **laufende** (Hochrechnung, Zwischenstand,
Blind-Challenge verdeckt). Ohne den zweiten Wert nimmt der Lauf beides aus `KLICK_MONTH` —
dann fehlen die Bilder, die nur im laufenden Monat entstehen.

### Der Lauf verändert nichts

Ausdrücklich abgesichert in den Abläufen:

- `flow4` öffnet den Regel-Assistenten und **verwirft** ihn — keine Regel wird gespeichert,
  kein Minimalziel geändert.
- `flow5` fotografiert die Entscheidungs-Knöpfe der Widerrufe und den Monatsabschluss,
  **klickt sie aber nicht**. Ein „Final einfrieren“ wäre nicht rückgängig zu machen.
- `flow3` markiert die Export-Knöpfe, ohne sie auszulösen.

### Maskierung ist Pflicht

Das Bonus-Board zeigt **echte Kolleginnen mit echten Beträgen** — auf Staging genauso, weil
die Datenbank eine Kopie der Produktivdaten ist. Ohne `mask.json` startet kein Ablauf. In die
Datei gehören **alle Personennamen** der Institute (auch Kurzformen und die Schreibweise
„Nachname, Vorname“), dazu Kundennamen und Vertragsnummern aus der Widerrufs-Liste.
`run-all.sh` prüft am Ende, dass keiner der echten Werte in `meta.json` steht — die
Screenshots trotzdem vor dem Committen durchsehen, das Wiki-Repo ist öffentlich.

**Offen:** Ob die **Beträge** sichtbar bleiben dürfen, ist mit Jan noch nicht geklärt. Ohne
Beträge verliert die Anleitung viel, mit Beträgen stehen Gehaltsbestandteile in einem
öffentlichen Repo. Bis zur Klärung: Aufnahme machen, aber **nicht committen**, oder in
`mask.json` Beispielbeträge ergänzen.

## Was die Bilder zeigen sollen

| Screenshot | Braucht |
|---|---|
| `o2-monat-ueberblick` | Person mit Zielen im **laufenden** Monat, idealerweise mit Abwesenheitstagen |
| `o3-zielkarte` | Ziel-Karte mit **beiden** Balken-Teilen (gesichert + Vorbehalt) |
| `p2-ranking` | Ranking-Challenge in einem **abgeschlossenen** Monat (Endstand) |
| `p3-blind` | Blind-Challenge im **laufenden** Monat (sonst ist nichts verdeckt) |
| `p4-serie` | Ziel mit Serie — braucht **eingefrorene** Vormonate |
| `q4-widerrufe` / `s1-widerrufe-entscheiden` | Monat mit **offenen** Widerrufen |
| `s3-einfrieren` | Monat mit Freeze-Historie (mindestens ein Zwischenstand) |

Fehlt eines davon, meldet der Ablauf es im Protokoll und die Seite bleibt ein Platzhalter —
dann einen passenderen Monat wählen und nur den betroffenen Ablauf wiederholen.
