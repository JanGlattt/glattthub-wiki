# Phorest-Spiegel mit Verlauf

Technische Dokumentation des vollständigen Phorest-Spiegels (seit 24.10.2026). Er ergänzt die
Analyse-Tabellen (`client_statistics`, `stats_*`) um eine **lückenlose Kopie der Phorest-Daten mit
Verlauf**, damit der Hub bei einem Phorest-Ausfall oder -Datenverlust nichts verliert.

## Warum

Nach dem Vorfall vom 22.10.2026 zeigte sich: `client_statistics` enthielt nur 9.723 der 23.541
Phorest-Kunden (nur Kunden mit Vertrag oder Beratung, erster Besuch ab 2024), Notizen,
Einwilligungen, Adressen und Verkäufe gab es gar nicht. Und jeder Abgleich überschrieb den
Vorher-Stand. Der Spiegel schließt beides.

## Aufbau (Kunden — Etappe 1)

| Tabelle | Inhalt |
|---|---|
| `phorest_clients` | aktueller Stand je Kunde (alle Felder als Spalten, dazu `payload` = Rohdaten, `payload_hash`) |
| `phorest_client_versions` | jede beobachtete Fassung: `version_no`, `payload`, `changed_fields`, `valid_from`/`valid_to` |
| `phorest_mirror_runs` | Protokoll jedes Laufs (Modus, gelesen/neu/geändert/verschwunden, Fehler) |

Das Muster ist generisch: `App\Services\Phorest\Mirror\VersionedMirror` schreibt in eine
„aktuelle" Tabelle plus Versions-Tabelle; weitere Datenarten (Gutscheine, Kataloge, Verkäufe)
hängen sich mit denselben Spalten ein.

**Regeln**

- **Nichts wird gelöscht.** Ändert sich der Fingerabdruck (SHA-1 über die normalisierten Rohdaten,
  Schlüsselreihenfolge egal), wird die alte Fassung per `valid_to` geschlossen und eine neue
  angelegt. `changed_fields` nennt die geänderten Felder der obersten Ebene.
- **Verschwundene Kunden** (nur nach einem *vollständigen*, lückenlos gelaufenen Lauf) bekommen
  `missing_since`; kehren sie zurück, wird die Markierung entfernt. Ein fehlgeschlagener Lauf
  markiert nie.
- `valid_from`/`valid_to` sind **unsere Beobachtungszeitpunkte**, nicht die Änderungszeit in
  Phorest (die steht in `phorest_updated_at`). Phorest-Zeitstempel sind UTC.
- Geld in Cents (`credit_outstanding_cents`, `credit_limit_cents`).

## Lauf

`php artisan phorest:mirror-clients [--full|--incremental]` — Cloud Scheduler `mirror-phorest-clients`
→ `/api/cron/mirror-phorest-clients`, täglich 02:50 (`CronSchedule`, Scheduler-Job anlegen mit
`--max-retry-attempts=3` und `attemptDeadline` 1800 s). Ohne Option wählt der Befehl selbst:
**vollständig**, wenn der letzte erfolgreiche Volllauf älter als 7 Tage ist, sonst
**inkrementell** (`updatedAfter` = letzter erfolgreicher Lauf minus 30 Minuten).
Ein Volllauf liest 23.541 Kunden in rund 118 Abrufen à 200 (`includeArchived`, `includeDeleted`).

## Fallstricke

- `photo_url` ist bis ~1.600 Zeichen lang → `text`, nicht `varchar(1000)` (an echten Daten gefunden).
- Notizen reichen über 1.200 Zeichen. Die Spalten enthalten **personenbezogene Daten** (Adresse,
  Notizen, Einwilligungen); die Tabellen gehören nicht in den Nur-Lese-Zugang `claude_readonly`
  (dort sind sie ohne erneuten Lauf des Skripts nicht lesbar — das ist gewollt).
- Eine **Löschung auf Kundenwunsch (DSGVO)** muss alle Fassungen in `phorest_client_versions`
  erfassen, nicht nur `phorest_clients`.
- **Nie zwei Läufe gleichzeitig:** Zwei parallele Volläufe verklemmen sich in der Datenbank (Deadlock beim ersten Prod-Lauf am
  24.10.2026, weil der Job doppelt ausgelöst wurde). Der Befehl hält deshalb eine Sperre (`Cache::lock`, 1 h) — ein zweiter
  Aufruf meldet »bereits aktiv« und beendet sich ohne Fehler; die Schreibblöcke wiederholen sich bei Deadlock bis zu dreimal.
- Die Phorest-Kundenkategorien (2.912) sind größtenteils Straßenadressen — nur die IDs werden
  gespeichert (`client_category_ids`), die Kategorien selbst nicht gespiegelt.
- Im Test ersetzt ein zweiter `Http::fake()` den ersten nicht (der zuerst registrierte gewinnt);
  `PhorestClientMirrorTest` liest deshalb die Seiten aus einer Eigenschaft.

## Was Phorest nicht herausgibt

Verkäufe/Käufe haben **keinen Listen-Endpunkt**; nur der **CSV-Export-Auftrag** (`TRANSACTIONS_CSV`,
`DATEV_CSV`, `SUNDRIES_CSV`, `CLIENT_COURSES_CSV`, `POST …/branch/{id}/csvexportjob`) liefert sie. Ein
Probeauftrag am 24.10.2026 (Bielefeld, 20.10.) lieferte 12 Transaktionen / 35 Positionen mit
Kunde, Mitarbeiterin, Leistung, Netto/Brutto/Steuer, Trinkgeld, Zahlart. Kreditkonto-Verlauf und
Kundennotizen als eigene Liste gibt es nicht (Notiz steht im Kundendatensatz). Räume, Maschinen,
Produkte, Pakete, Bewertungen, Leads sind bei uns leer.

Doku der Schnittstelle: `https://developer.phorest.com/llms.txt` (Seiten als `.md` abrufbar).

## Weitere Spiegel (Etappe 2, 24.10.2026)

Alle mit demselben Muster (Fingerabdruck, Versionen, nichts wird gelöscht), jeweils mit Sperre gegen
parallele Läufe und Protokoll in `phorest_mirror_runs`.

| Spiegel | Befehl / Cron-Endpoint / Zeit | Tabellen |
|---|---|---|
| Kunden | `phorest:mirror-clients` / `mirror-phorest-clients` / 02:50 | `phorest_clients`, `phorest_client_versions` |
| Katalog | `phorest:mirror-catalog` / `mirror-phorest-catalog` / 03:10 | `phorest_records`, `phorest_record_versions` |
| Verkäufe | `phorest:mirror-transactions` / `mirror-phorest-transactions` / 03:20 | `phorest_transaction_days`, `phorest_transaction_items` |
| Termin-Änderungen | Beobachter `StatsHistoricAppointmentObserver` (bei jedem Abgleich) | `stats_historic_appointment_changes` |

**Katalog** (`phorest_records`, Art in `entity`): Filialen, Zahlarten, Gutscheine; je Filiale Dienstleistungen
(**mit archivierten: 812 statt 179**), Kurse, Kategorien, Steuersätze, Mitarbeiter. `record_key` =
`<art>:<filiale>:<id>`. Nicht mehr gelieferte Datensätze bekommen `missing_since`.

**Verkäufe** kommen über den CSV-Export-Auftrag `TRANSACTIONS_CSV` (`POST …/branch/{id}/csvexportjob`, Status per
`GET …/csvexportjob/{jobId}`, dann die befristete CSV-Adresse laden). Je Filiale und Tag eine **Fassung**:
`phorest_transaction_days` (Hash der Zeilen, `rows_gz` = Rohzeilen gzip, `is_current`, `superseded_at`) mit den
Positionen in `phorest_transaction_items` (Beträge in Cents, Trinkgeld, Zahlart, vollständige Zeile in `raw`).
Weicht ein erneuter Abruf ab (Storno, Nachbuchung), wird die alte Fassung abgelöst und bleibt samt Positionen
erhalten. Tage ohne Verkäufe bekommen eine leere Fassung (so ist „geprüft" von „fehlt" unterscheidbar). Phorest
meldet einen Zeitraum ohne Verkäufe als `FAILED` mit »No records found« — das ist kein Fehler.
Rollierend: tägliche letzte 7 Tage (sonntags 90) bis gestern; heute ist noch nicht abgeschlossen.
**Nachladung der Historie** (einmalig): Cron-Endpoint `backfill-phorest-transactions` (ab 2023-01-01, Monat für
Monat je Filiale, vollständige Monate werden übersprungen, Zeitbudget 1500 s) — als Scheduler-Job alle 30 Minuten
laufen lassen, bis das Protokoll keinen Hinweis »Zeitbudget erschöpft« mehr trägt, dann Job löschen.

**Termin-Änderungsverlauf**: `stats_historic_appointments` zeigt nur den letzten Stand. Der Beobachter schreibt bei
jeder Änderung `{feld: [alt, neu]}` (Status, Zeit, Mitarbeiterin, Service, Notiz …); Anlegen zählt nicht. Greift nur
über Eloquent (`updateOrCreate`), nicht bei Massen-Updates ohne Modell.

## Noch offen

DSGVO-Löschung eines Kunden über alle Fassungen (Kunden-Versionen, Verkaufspositionen mit Kundenbezug), Rechte/Oberfläche
zum Einsehen der Spiegel (bisher nur Datenbank), Produkt-/Lagerdaten (bei glattt leer).
