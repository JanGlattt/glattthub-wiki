# Klickanleitungen Terminansicht — Quellen

Quellen der Klickanleitungen A–H (Beratungsgespräch und Behandlungstermin in der Terminansicht),
Standard siehe Wiki `docs/KLICKANLEITUNGEN.md`.

- `decks/*.json` — Inhalt je Dokument (Cover, Seiten, Schritte, Hinweise, welche Screenshots mit welchen Markierungen)
- `meta.json` — Markierungen (Prozentkoordinaten) je Screenshot, beim Aufnehmen erzeugt
- `shots/*.jpg` — Screenshots (Staging, Testkundin „Tester Am Testen“ MD000002, Kontaktdaten maskiert)
- `scripts/` — Playwright-Aufnahmeskripte: `lib.cjs`/`common.cjs` (Login, Screenshot+Marks, Formular-Helfer),
  `flow1..6.cjs` (Ablauf Terminübersicht → Formulare → SEPA → Direkt behandeln → Einstellungszettel),
  `reshoot*.cjs` (Nachaufnahmen), `shot-shared.cjs`, `contact.cjs` (Kontaktbogen)
- `.env.example` — Vorlage für `.env` mit Zugang und Termin des Laufs (`.env` ist gitignored)

## Stand

**v1.1 (14.09.2026):** Texte und Skripte auf die **neue Terminansicht** vom 08.09.2026 abends
umgestellt (siehe unten). **Die Screenshots stammen noch vom Stand davor** — alle Bilder mit
laufendem Termin zeigen die alte linke Spalte. Vor der Ausgabe an die Institute muss der
Aufnahmelauf einmal komplett durchlaufen.

## Screenshots neu aufnehmen

Voraussetzungen: Staging-Testuser (Rolle Institute MA, Magdeburg), ein **gebuchter Beratungstermin**
für eine Magdeburg-Testkundin (MD000001–MD000004) in Kabine MD 1, Staging über die `*.run.app`-Adresse
(umgeht IAP; `gcloud run services describe glattthub-web-staging --region=europe-west3 --format='value(status.url)'`).

```bash
cd klickanleitungen/terminansicht
cp .env.example .env && $EDITOR .env     # Passwort, KLICK_APT (Termin-ID aus der URL), KLICK_DATE
npm init -y && npm install playwright && npx playwright install chromium   # einmalig
bash scripts/run-all.sh                  # flow1 … flow6, Fehlerbilder, geteiltes Formular, Kontaktbogen
cd .. && for d in terminansicht/decks/*.json; do node shared/build-pdf.cjs "$d"; done   # PDFs nach terminansicht/pdf/
```

Der Lauf **verändert Staging und Phorest wirklich** (Vertrag, Mandat, Buchung, Einstellungszettel) —
Reihenfolge `flow1` → … → `flow6` einhalten, jeder Schritt baut auf dem Zustand des vorherigen auf.
Am Ende prüft `run-all.sh`, ob jeder von den Decks genutzte Screenshot in `shots/` liegt, und schreibt
das Aufnahmedatum in `stand.txt` — `build-pdf.cjs` setzt es als „Stand“ in die Fußzeile aller PDFs
(überschreibbar mit `STAND=…`, Version mit `VERSION=…`).

### Zugangsdaten des Testusers

Das Passwort des Staging-Testusers steht **nirgends im Repo** — bis 14.09.2026 lag es im Klartext in
`scripts/lib.cjs`, und dieses Repo ist öffentlich. Es gehört ausschließlich in die lokale `.env`
(gitignored) und wird vor einem Lauf ohnehin frisch vergeben, weil es driftet. Vergeben wird es lokal
gegen die Staging-Datenbank (Cloud-SQL-Proxy mit ADC-Token, dann Laravel-Konsole); Runner, Env-Variablen
und Fallstricke stehen im Projektwissen des Haupt-Repos unter
`.github/knowledge/sepa-testmail-aus-staging.md` und `artisan-command-auf-prod-ausfuehren.md`.

### Fallstricke

- **Termin allein an seinem Tag:** Phorest liefert alle Tagestermine einer Kundin mit derselben
  `bookingId` — die Terminübersicht zeigt sie dann als **eine Sammelkarte**. Den Beratungstermin des
  Laufs also auf einen Tag legen, an dem die Testkundin sonst nichts hat.
- **Scroll-Container** der Detailseite ist die sichtbare `.apt-detail-panel`, nicht das Fenster.
- **Selektoren auf `offsetParent !== null` filtern** — es gibt mehrere versteckte, teleportierte Modale.
- **Marks außerhalb des Bildausschnitts** verwirft `build-pdf.cjs` mit „Mark verworfen“ — Meldungen des
  Baus durchsehen, sie zeigen fehlende oder verrutschte Markierungen.
- **`m2-fehler-iban`** entsteht nur in `reshoot3.cjs`. Läuft es am Ende nicht mehr (SEPA-Formular
  bereits eingereicht), den Schritt einmal vor `flow4` fahren — im Satz vom 08.09.2026 fehlte das Bild
  genau deshalb.
- **`n1-geteiltes-formular`** braucht den Teilen-Link aus `flow2` (`shared-url.txt`, nur 48 h gültig) —
  deshalb immer im selben Lauf aufnehmen.
- **Headless:** Chromium mit `--disable-renderer-backgrounding --disable-backgrounding-occluded-windows
  --disable-features=CalculateNativeWinOcclusion` (steckt in `lib.cjs`), `waitUntil: 'domcontentloaded'`,
  nie `networkidle`.
- **Gebaut wird mit den Buildern aus `klickanleitungen/shared/`** (seit 15.09.2026, vorher lag
  eine eigene Kopie unter `template/`). Dieselben Decks bauen mit `shared/build-web.cjs` auch
  die Seiten fürs Endbenutzer-Wiki — Format siehe `klickanleitungen/README.md`.
- **PDF-Bau in fremder Umgebung:** `CHROME_PATH=/pfad/zu/chromium` setzen, wenn Playwright seinen
  eigenen Browser nicht findet. `sips` (JPEG-Kompression) gibt es nur auf macOS; sonst landen die
  PNGs unkomprimiert im PDF.

## Was sich mit der neuen Terminansicht geändert hat (08.09.2026)

Fünf Commits am Abend des 08.09.2026 — also **nach** dem letzten Screenshot-Lauf:

| Commit | Wirkung |
|---|---|
| `8b3fd3c` | Terminübersicht: Kundenname ist ein Link ins Kundenprofil (Symbol ↗) |
| `afab84c` | Aktionsleiste („Termin beginnen/beenden“) klebt unten und bleibt beim Scrollen sichtbar |
| `c7c39df` | **Läuft der Termin, zeigt die linke Spalte nur noch die Sitzungs-Karte** — Kunden-Karte, Termin-Infos und Navigation sind ausgeblendet (`x-show="!sessionActive"`) |
| `ef4d18c` | Gebuchte Behandlungen als Chips, grün sobald die Zone im Einstellungszettel steht (`/treated-zones`) |
| `bf8bad8` | Sitzungs-Karte mit Restzeit, „Jetzt“, Fortschrittsbalken, Zähler „n / m“ |

Folgen für die Anleitungen: **jeder Screenshot mit laufendem Termin ist veraltet** (Dokumente B–H fast
vollständig). Neu in den Decks: Dokument A, Seite „Die Spalte während des Termins“ (`b4-sitzungskarte`)
und Dokument H, Seite „Fortschritt im Blick“ (`k7-sitzungskarte-behandelt`). Während des Termins wird
**nur im Arbeitsbereich rechts** navigiert (Kacheln, „Zurück zur Session“); die Einträge „Formulare“ und
„Einstellungszettel“ in der linken Spalte (Historie) gibt es nur vor dem Start und nach dem Beenden.
