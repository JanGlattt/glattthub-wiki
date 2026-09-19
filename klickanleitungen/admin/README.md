# Klickanleitungen Admin — Quellen

Quellen der Serie **Admin** — das Filament-Verwaltungspanel unter `/admin`, thematisch in acht
Dokumente gebündelt. Standard und Deck-Format: `klickanleitungen/README.md` und Wiki
`docs/KLICKANLEITUNGEN.md`.

| Dokument | Deckt ab | Stand |
|---|---|---|
| **1 — Benutzer und Rollen** | Panel-Aufbau, Benutzerliste, Rollen und Rechte | v1.1 (19.09.2026, Hub-Look) |
| **2 — Inhalte und Dokumente** | News, Wissensartikel, Rechtstexte | v1.0, Screenshots 19.09.2026 |
| **3 — Gutschein-Verkauf** | Produkte, Bestellungen, Sonderfälle und Erstattungen | v1.0, Screenshots 19.09.2026 |
| **4 — Erinnerungen und WhatsApp** | Terminerinnerungen, Beratungs-WhatsApp, Bewertungsanfragen | v1.2 (19.09.2026, Pfad System → Benachrichtigungen) |
| **5 — Stammdaten** | Körperzonen, Beratungsservices, Abwesenheitsarten und weitere Listen | v1.0, Screenshots 19.09.2026 |
| **6 — Gamification und Abzeichen** | Abzeichen, Anlässe, Institutsziele | v1.0, **noch nicht freigeschaltet** |
| **7 — Personal und Vergütung** | Gehälter, Bonuszahlungen, Phorest-Zuordnung | v1.0, Screenshots 19.09.2026 |
| **8 — Protokolle und Einstellungen** | E-Mail-Protokoll, PDF- und Schrifteinstellungen, Cache | v1.0, Screenshots 19.09.2026 |

> **Screenshots: Stand 19.09.2026 (Hub-Look).** Aufgenommen gegen Staging nach dem Deploy des
> Hub-Looks (Glas-Seitenleiste mit den Hub-Gruppen, Türkis, 50 Zeilen je Tabelle, kein Kopfbalken);
> Bucket synchronisiert. Gehälter und Boni (Admin 7) sind auf Staging leer — die Bilder zeigen den
> Leerzustand, solange dort keine Daten liegen. Wiki: `docs/ADMIN-BACKEND.md`.

Alle acht richten sich an die **Administration**. Das Panel ist kein Ort für den Institutsalltag
— wer dort etwas ändert, verändert es für alle.

**Dokument 6** trägt eine rote Plakette auf dem Cover: Gamification liegt zwar auf Prod, ist aber
noch nicht freigeschaltet. Die Anleitung gilt ab dem Start; am Text ist dann nichts zu ändern,
nur der Hinweis fällt weg (Feld `hinweis` im Deck).

## Bauen

```bash
cd klickanleitungen
for d in admin/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs admin/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/admin
cp .env.example .env            && $EDITOR .env        # Zugang MIT Admin-Recht
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

Der Zugang braucht **Admin-Rechte** — sonst landet der Lauf auf der Anmeldeseite oder bekommt
403. Der Ablauf erkennt das, schreibt **„KEIN ZUGANG“** ins Protokoll und überspringt die Seite,
statt ein Anmeldeformular zu fotografieren. Der Plan steht oben in `scripts/shots.cjs` —
26 Screenshots.

### Der Lauf ändert nichts — und das ist hier besonders wichtig

Filament speichert mit einem Klick, ohne Rückfrage. Der Lauf ruft deshalb **ausschließlich
Listenansichten** auf und öffnet keine Bearbeitungsmasken mit anschließendem Speichern.
Ausdrücklich nicht gedrückt werden:

- **„Erstellen“** und **„Speichern“** in jeder Resource.
- **„Erstatten“** bei Gutschein-Bestellungen — das löst eine echte Mollie-Rückzahlung aus.
- Alles unter **Erinnerungen und WhatsApp** — aktive Regeln verschicken Nachrichten an echte
  Kundinnen, **auch von Staging aus** (Superchat kennt keine Sandbox).
- **„Cache leeren“** — auf Prod ein spürbarer Eingriff.
- Alles unter **Gamification**, solange das Modul nicht freigeschaltet ist.

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `a1-rollen` | die **echten Prod-Rollen** (admin, Büro, Institute MA, Leitung) — die Seeder-Rollen weichen ab |
| `a3-bestellungen` | mindestens eine **bezahlte Bestellung**, gern eine mit Sonderfall |
| `a4-*` | eingerichtete Regeln; ohne sie sind die Listen leer |
| `a7-*` | Gehalts- und Bonusdaten — **siehe Maskierung** |
| `a8-protokolle` | ein E-Mail-Protokoll mit einigen Einträgen |

### Maskierung

`mask.json` ist Pflicht. Kritisch sind hier drei Dinge:

1. **E-Mail-Adressen und Namen** der Hub-Benutzerinnen (Dokument 1, 8).
2. **Gehälter und Bonuszahlungen** (Dokument 7). Ob diese Zahlen — auch maskiert — überhaupt in
   ein öffentliches Repo dürfen, ist **noch nicht entschieden**. Bis dahin: Ausschnitt so wählen,
   dass keine Beträge im Bild sind, oder die Seite als Platzhalter stehen lassen.
3. **Kundendaten** in Gutschein-Bestellungen (Dokument 3).

Das Wiki-Repo ist öffentlich — jeder Screenshot dieser Serie gehört vor dem Committen einzeln
durchgesehen.
