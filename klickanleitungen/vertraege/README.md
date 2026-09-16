# Klickanleitungen Verträge — Quellen

Quellen der Serie **Verträge** — der Vertrag von der Liste bis zum letzten Einzug. Standard und
Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt | Seiten |
|---|---|---|
| **1 — Die Vertragsliste** | Suche, Spaltenfilter, Zeile lesen, Wegweiser durch die Serie | 4 |
| **2 — Der Vertrag im Detail** | Kopf, Banner, vier Reiter, Vertragsdaten ändern, Bestätigung mit Vorher/Nachher, Kundin/Zonen/Notizen, Zusammenfassung, Verlauf und E-Mails | 8 |
| **3 — Den Ratenplan lesen** | Aufbau des Reiters, die Ratenzeile, **alle 15 Zustände**, Auskunft geben | 4 |
| **4 — Zahlungen nachtragen und korrigieren** | Entscheidungshilfe, Rate nachtragen, freie Zahlung verbuchen, erste Rate bestätigen, RLS ausgleichen | 5 |
| **5 — SEPA-Einzug und Rücklastschrift** | Wie der Einzug läuft, Vorprüfung, Betrag einziehen (Ablösung), RLS anhängen, abgleichen, Legacy | 5 |
| **6 — Laufzeit und Raten ändern** | Grenzen, offene Raten anpassen, Laufzeit verlängern in der Praxis, pausieren, fortsetzen, Gutschein verrechnen | 6 |
| **7 — Mandat und Bankverbindung** | Die zehn Mandats-Zustände, SEPA-Bereich, Mandat anlegen, Bankverbindung ändern, Stammdaten korrigieren | 5 |
| **8 — Import-Probleme und Werber** | Warnband, Import korrigieren, zuordnen, verwerfen, Werber hinterlegen | 4 |

Alle acht richten sich ans **Büro**. Im Institut wird an Verträgen nicht gearbeitet — dort
genügt „Kundenverwaltung 4“ (Vertrag lesen, offene Forderungen erkennen).

**Ein Vorgang, eine Seite.** Jedes Fenster des Vertrags hat seine eigene Seite: links der
Screenshot mit den nummerierten Schritten, rechts die Feldtabelle („Was gehört hinein?“) und
darunter die Folgewirkung („Was passiert beim Speichern?“).

## Bauen

```bash
cd klickanleitungen
for d in vertraege/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs vertraege/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/vertraege
cp .env.example .env            && $EDITOR .env        # Zugang + Beispielvertrag
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

Der Plan steht oben in `scripts/shots.cjs` — **38 Screenshots**. Einzeln:
`node scripts/shots.cjs vt6-raten-anpassen`.

### Der Lauf fasst kein Geld an

Er öffnet Fenster und verwirft sie mit Escape. Diese Knöpfe werden **nie** gedrückt:

| Knopf | Warum nicht |
|---|---|
| **Betrag per SEPA einziehen** | holt sofort Geld vom Konto der Kundin, ohne zweite Rückfrage |
| **Rate anhängen** | verlängert den Vertrag um einen Monat |
| **Änderungen an GoCardless senden** | storniert bestehende Einzüge und legt neue an |
| **Pausieren / Fortsetzen** | verschiebt den gesamten Zahlungsplan |
| **Rate nachtragen / Zahlung verbuchen** | schreibt eine Zahlung, die es nicht gab |
| **Änderungen speichern** | ändert Vertragsdaten (das Fenster davor darf gezeigt werden) |
| **Importieren / Verwerfen** | legt einen Vertrag an oder wirft eine Import-Zeile weg |

`vt2-bestaetigen` zeigt die Bestätigung mit Vorher/Nachher — das Fenster öffnet nur, es
speichert erst der Knopf darin. Der Lauf drückt ihn nicht.

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| alle `vt2`–`vt7` | `KLICK_CONTRACT`: **Ratenzahler mit aktivem SEPA-Mandat**, einige Raten bezahlt, einige offen |
| `vt2-banner` | idealerweise einen Vertrag **mit Banner** (laufender Widerruf oder harter Forderungsfall) |
| `vt4-erste-rate` | eine Preisliste **mit Vor-Ort-Rate** — bei „alle Raten per SEPA“ gibt es den Vorgang nicht |
| `vt4-rls-ausgleich`, `vt5-anhaengen` | mindestens eine **geplatzte Lastschrift** im Plan |
| `vt5-legacy` | `KLICK_CONTRACT_LEGACY`: einen **Altvertrag** mit Altsystem-Block |
| `vt8-*` | offene Einträge im Warnband **„Fehlgeschlagene Imports“** |

Fehlt etwas, meldet der Ablauf es und die Seite bleibt ein Platzhalter.

### Maskierung

Diese Serie zeigt **Kundennamen, Vertragsnummern, IBANs, Mandatsreferenzen und Beträge**.
`mask.json` ist Pflicht, und jeder Screenshot gehört vor dem Committen einzeln durchgesehen —
das Wiki-Repo ist öffentlich.
