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

## Geplant (weitere Etappen)

Verkaufs-Historie (Transaktions-CSV je Filiale/Monat, unverändert abgelegt + zerlegt), Gutscheine,
Dienstleistungen/Kurse/Zahlarten/Steuersätze als kleine Spiegel mit Verlauf, Änderungsverlauf der
Termine (Status).
