# Klickanleitungen Grundlagen — Quellen

Quellen der Serie **Grundlagen 1–5** (Bedienung des glatttHub überhaupt). Standard und
Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt |
|---|---|
| **1 — Anmelden & zurechtfinden** | PIN- und E-Mail-Anmeldung, erste Einrichtung per Einladung, Seitenleiste mit Schnellzugriff und fünf Gruppen, Nutzerkarte, Hell/Dunkel, Abmelden |
| **2 — Standort, Suche & Mitteilungen** | Institutswahl inkl. „Alle Standorte“ und ausgeblendeter Institute, globale Suche mit Tastenkürzel, Mitteilungen lesen und aufräumen |
| **3 — Mein Profil** | Name und Bild, Passwort, PIN verwalten, angemeldete Geräte, Rundgänge zurücksetzen |
| **4 — Auf dem Handy und Tablet** | Menüleiste unten, Mehr-Menü, Zustandszeile mit aufklappbaren Werkzeugen, Tabellen mit weniger Spalten |
| **5 — glatttBert fragen** | Assistent öffnen, was er beantwortet, was er nicht kann |

Alle fünf richten sich an **die Institute** — sie sind die Voraussetzung für jede weitere Serie.

## Stand

**v1.0 (15.09.2026):** Texte, Decks und Aufnahmeskripte fertig, **Screenshots stehen aus**.
PDFs und Web-Seiten bauen schon jetzt mit Platzhaltern.

## Bauen

```bash
cd klickanleitungen
for d in grundlagen/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs grundlagen/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/grundlagen
cp .env.example .env            && $EDITOR .env
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

**Zwei Bildgrößen.** Die Abläufe 1–3 und 5 nehmen im iPad-Querformat auf, **Ablauf 4 im
Telefon-Format** (390 × 844) — das ist das Prüfmaß des mobilen Seiten-Musters. Beides steckt
in `scripts/lib.cjs` (`launch()` und `phone()`), die Abläufe wählen selbst.

**Zugang ohne Sonderrechte.** Die Bilder sollen zeigen, was eine Mitarbeiterin sieht. Mit einem
Admin-Zugang stünden in der Seitenleiste Gruppen und Menüpunkte, die im Institut niemand hat —
also einen Zugang mit der Rolle **Institute MA** nehmen.

**Die Anmeldeseite braucht keine Sitzung.** `flow1` startet den ersten Browser mit `fresh: true`,
damit die Anmeldung überhaupt erscheint; danach läuft der Rest angemeldet.

### Der Lauf verändert nichts

- `flow2` öffnet die Standortwahl und klappt sie wieder zu, **ohne umzustellen** — die Wahl
  überlebt das Abmelden und würde sonst für die nächste Person gesetzt bleiben.
- `flow3` fotografiert Passwort, PIN und Sitzungen, **speichert nichts** und drückt
  insbesondere **nicht** „Andere Sitzungen abmelden“ — das würde laufende Sitzungen beenden.
- `flow5` stellt glatttBert eine **Zahlen-Frage** (aus `.env`), damit keine Kundendaten ins
  Bild geraten. Er kann ohnehin nur lesen.

### Maskierung

Wenig, aber nicht nichts: der **Name der angemeldeten Person** (Nutzerkarte, Profil) und alles,
was in den **Mitteilungen** steht (Kundennamen, Vertragsnummern). Ohne `mask.json` startet kein
Ablauf.

## Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `g1-login-pin` / `g2-login-email` | abgemeldeten Browser (macht `flow1` selbst) |
| `g4-gruppe-offen` | einen Zugang, der in der Gruppe **Verkauf** mindestens einen Punkt sieht |
| `h1-standort` | mindestens ein **ausgeblendetes** Institut, sonst fehlt das Badge |
| `h4-mitteilungen` / `h5-mitteilung-detail` | ein Konto **mit** Mitteilungen |
| `i5-rundgang` | den Abschnitt „Einführung in den Hub“ im Profil |
| `j3-zustandszeile` | eine Seite mit drei oder mehr Werkzeugen (Termine erfüllt das) |
| `k2-bert-antwort` | eine funktionierende Assistenten-Anbindung auf der Umgebung |
