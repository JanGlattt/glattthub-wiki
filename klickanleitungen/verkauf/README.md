# Klickanleitungen Verkauf — Quellen

Quellen der Serie **Verkauf** (Verträge, Widerrufe, Preislisten, Gutscheine). Standard und
Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt | Stand |
|---|---|---|
| **1 — Verträge finden in der Liste** | Suche, Filter, Sortierung, Zeile lesen, Legacy/Institut | v1.0, Screenshots offen |
| **2 — Der Vertrag im Detail** | Kopf und Banner, vier Reiter, Übersicht, Zusammenfassung, Verlauf, E-Mail-Historie | v1.0, Screenshots offen |
| **3 — Zahlungen & SEPA** | Ratenplan, Zahlung nachtragen, Mandat, Einzug, RLS anhängen, pausieren, Gutschein verrechnen | v1.0, Screenshots offen |
| **4 — Widerrufe erfassen & bearbeiten** | Assistent, Fallseite, Fristen, Behandlungsstand, Entscheiden und Abschließen | v1.0, Screenshots offen |
| **5 — Preislisten pflegen** | Pakete und Preise, Rabattstufen ab N KPZ, Zahlungsmodus der Liste | v1.0, Screenshots offen |
| **6 — Freunde werben** | Empfehlung erfassen, Prämie, Auswertung | v1.0, Screenshots offen |
| **7 — Gutscheine** | Phorest-Gutscheine verwalten, Online-Verkauf, Bonus-Guthaben | v1.0, Screenshots offen |
| **8 — Zufriedenheitsbefragung** | Befragung auslösen, Rückläufe lesen, Konsequenzen | v1.0, Screenshots offen |

Alle acht richten sich ans **Büro**. Im Institut wird an Verträgen nicht gearbeitet — dort
genügt „Kundenverwaltung 4“ (Vertrag lesen, offene Forderungen erkennen).

## Bauen

```bash
cd klickanleitungen
for d in verkauf/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs verkauf/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/verkauf
cp .env.example .env            && $EDITOR .env        # Zugang, Vertrag, Widerruf
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

### Der Lauf fasst kein Geld an

Ausdrücklich abgesichert in den Abläufen:

- `flow3` öffnet **„Gezahlte Rate nachtragen“** und verwirft es; **„Betrag per SEPA einziehen“**,
  **„RLS anhängen“** und **„Pausieren“** werden nur markiert, nie gedrückt. Ein ausgelöster
  Einzug wäre bei der Kundin sichtbar und nicht folgenlos.
- `flow4` öffnet den Widerrufs-Assistenten und bricht ab — ein angelegter Widerruf zöge
  Bonus- und SEPA-Folgen nach sich. Der Fall wird auch **nicht abgeschlossen**.
- `flow1` und `flow2` lesen nur.

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `v9-ratenplan` | einen **Ratenzahler mit SEPA-Mandat**, einige Raten bezahlt, einige offen |
| `v11-sepa` | dasselbe — ohne Mandat fehlt der halbe Bereich |
| `v4-vertrag-kopf` | idealerweise einen Vertrag **mit Banner** (laufender Widerruf oder Forderungsfall) |
| `v12`–`v15` | einen **offenen Widerruf** (`KLICK_CANCELLATION`) |

Fehlt etwas, meldet der Ablauf es und die Seite bleibt ein Platzhalter.

### Maskierung

Diese Serie zeigt **Kundennamen, Vertragsnummern und IBANs**. `mask.json` ist Pflicht, und die
Screenshots gehören vor dem Committen durchgesehen — das Wiki-Repo ist öffentlich.
