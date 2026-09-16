# Klickanleitungen Widerrufe — Quellen

Quellen der Serie **Widerrufe** — vom Eingang über die Vertragsänderung bis zum Abschluss.
Standard und Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt | Seiten |
|---|---|---|
| **1 — Widerruf erfassen** | Liste, Assistent in drei Schritten, Fristprüfung, die neun Gründe | 5 |
| **2 — Der Fall im Detail** | Aufbau der Fallseite, Fall bearbeiten inkl. abweichendem Fristbeginn, Dokumente, Wiedervorlage | 4 |
| **3 — Vertragsänderung im Fernabsatz** | Wozu, Angebot bauen, Formular und Versandweg, schwebender Folgevertrag, Widerruf des Folgevertrags | 5 |
| **4 — Die Abwicklung** | Die vier Schritte, SEPA stornieren, Phorest-Pakete auf 0, Downgrade vor Ort, Abgabe ans Forderungsmanagement | 5 |
| **5 — RA-Vorgang und Abschluss** | Wirtschaftlichkeit, Kosten, Schriftwechsel, die fünf RA-Ergebnisse, Widerruf abschließen | 5 |

Alle fünf richten sich ans **Büro**.

**Die wichtigste Aussage der Serie** steht in Dokument 2 und 4: Die Haken „SEPA storniert“ und
„Phorest aktualisiert“ auf der Fallseite **halten nur fest** — sie stornieren und bereinigen
nichts. Wer sie setzt, ohne die Aktionen ausgeführt zu haben, produziert eine Abbuchung nach
akzeptiertem Widerruf.

## Bauen

```bash
cd klickanleitungen
for d in widerrufe/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs widerrufe/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/widerrufe
cp .env.example .env            && $EDITOR .env        # Zugang + offener Fall
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

Der Plan steht oben in `scripts/shots.cjs` — **20 Screenshots**.

### Der Lauf legt keinen Widerruf an

Der Assistent wird durchgeklickt und abgebrochen. Nie gedrückt werden:

- **„Widerruf erfassen“** — ein angelegter Widerruf zöge Bonus- und SEPA-Folgen nach sich
- **„Abschließen“** — wendet ein Ergebnis auf den Ursprungsvertrag an
- **„Stornieren“** im SEPA-Fenster — beendet ein echtes GoCardless-Mandat
- **„Ausgewählte Pakete auf 0 setzen“** — entfernt Behandlungseinheiten in Phorest
- **„Abgeben“** — erzeugt einen Forderungsfall
- **„Jetzt wirksam schalten“** und **„Widerruf eintragen“** — greifen in den Folgevertrag ein

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `wd2-*`, `wd4-*`, `wd5-abschliessen` | `KLICK_CANCELLATION`: einen **offenen Fall mit Verlauf** |
| `wd3-*` | einen Fall mit **schwebendem Folgevertrag** — sonst fehlen drei der fünf Seiten |
| `wd5-ra`, `wd5-kosten`, `wd5-schriftwechsel` | `KLICK_CANCELLATION_RA`: einen Fall **beim Anwalt** mit Kosten und Schriftwechsel |
| `wd1-wizard-*` | `KLICK_CONTRACT`: einen Vertrag für den Assistenten — er wird **nicht** widerrufen |

### Maskierung

Widerrufsfälle enthalten **Freitext der Kundin**, Zendesk-Tickets und Anwaltsschreiben.
`mask.json` fängt Namen und Nummern, aber **keine Gesprächsinhalte** — dafür sind `blankText`
und `sampleTexts` da. Beschreibungen und Schriftwechsel vor dem Committen gegenlesen; das
Wiki-Repo ist öffentlich.
