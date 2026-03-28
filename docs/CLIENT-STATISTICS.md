# Der glattt-Kunde — Kundenstatistik

> Umfassende Kundenanalyse mit Demografie, Conversion-Funnel, Körperzonen, Widerrufe und geografischer Verteilung

## Übersicht

Das Modul **„Der glattt-Kunde"** bietet eine datenbasierte 360°-Analyse aller Kunden. Die Seite aggregiert Daten aus Phorest (Termine, Kundendaten), internen Verträgen, Beratungsgesprächen und Widerrufen in einer denormalisierten Statistik-Tabelle. Alle Daten werden über einen Sync-Prozess vorbereitet und per API-Endpoints an ein interaktives Frontend mit Chart.js und Leaflet ausgeliefert.

**Route:** `/hub/reports/client-statistics`

---

## Für Anwender

### Zugang

**Hub → Reports → Der glattt-Kunde**

Die Seite ist für alle Hub-Benutzer mit Report-Zugriff verfügbar. Die Daten werden automatisch synchronisiert — beim ersten Aufruf wird geprüft, ob ein Sync stattgefunden hat.

### Seitenbereiche

Die Statistikseite gliedert sich in folgende Bereiche von oben nach unten:

#### 1. KPI-Dashboard (8 Kennzahlen)

| KPI | Beschreibung |
|-----|--------------|
| **Kundenzahl** | Gesamtanzahl aller Kunden (mit Ersttermin ab 2024) |
| **Durchschnittsalter** | Ø Alter basierend auf Geburtsdatum |
| **Frauenanteil** | Anteil weiblicher Kunden in % |
| **Ø Körperzonen** | Durchschnittliche Anzahl Körperzonen bei Vertragskunden |
| **Conversion Rate** | Anteil Beratung → Vertrag in % (hervorgehoben) |
| **Nur Beratung** | Kunden, die nach dem Beratungsgespräch nie wiederkamen |
| **Ø Entfernung** | Durchschnittliche Entfernung zum Standort in km |
| **Anteil mit Vertrag** | Kunden mit mindestens einem aktiven Vertrag in % |

Jede KPI-Karte zeigt einen Trendpfeil (↑/↓) im Vergleich zum Vormonat.

#### 2. Demografie (Alter & Geschlecht)

- **Altersverteilung**: Balkendiagramm mit Gruppen 18-25, 26-35, 36-45, 46-55, 56+ — aufgeschlüsselt nach Geschlecht (gruppierte Balken)
- **Geschlechterverteilung**: Donut-Diagramm mit Weiblich / Männlich / Non-binär

#### 3. Conversion-Funnel & Entfernungsverteilung (nebeneinander)

**Conversion-Funnel:**

- Horizontales Balkendiagramm mit 4 Stufen:
    1. Alle Kunden
    2. Mit Beratungsgespräch
    3. Folgetermin nach Beratung
    4. Mit Vertrag
- Widerrufe werden als gestreifter Balken innerhalb der Vertragsstufe dargestellt
- Conversion-Rate zwischen den Stufen als Prozentangabe

**Entfernungsverteilung:**

- Balkendiagramm mit Entfernungsgruppen (0-5 km, 5-10 km, 10-20 km, 20-50 km, 50+ km)
- Gestapelte Balken: Ohne Vertrag / Mit Vertrag
- Zweite Y-Achse: Conversion-Rate pro Entfernungsgruppe als Linie

#### 4. Körperzonen-Verteilung & Widerrufs-Analyse (nebeneinander)

**Körperzonen-Verteilung:**

- Umschaltbar per Segmented Control: **Gesamt** / **Altersgruppe** / **Entfernung**
- **Gesamt-Modus**: Einzelne Balken für 1-7 Zonen + Geschlechter-Tabelle
- **Altersgruppen-/Entfernungs-Modus**: Hintergrund-Balken (Gesamt, halbtransparent) + gruppierte farbige Balken pro Gruppe davor. Rechte Y-Achse zeigt Prozent. Detailtabelle unterhalb des Charts.

**Widerrufs-Analyse:**

- Umschaltbar: **Geschlecht** / **Altersgruppe** / **Entfernung**
- Dual-Achsen-Chart: Hintergrund-Balken = Anzahl Verträge (linke Y-Achse), Vordergrund-Balken = Widerrufsquote % (rechte Y-Achse)
- Detailtabelle mit Verträge, Widerrufe und Quote pro Gruppe

#### 5. Karte (Geografische Verteilung)

- Interaktive Leaflet-Karte mit OpenStreetMap.DE-Kacheln (deutsche Beschriftung)
- PLZ-Marker mit Clustern und Farb-Kodierung
- GeoJSON-Overlay mit PLZ-Gebieten (Opacity einstellbar per Slider)
- Umschaltbare Karten-Modi: Kundenanzahl / Conversion-Rate / Ø Entfernung

#### 6. Top Postleitzahlen & Kundensegmente (nebeneinander)

**Top 10 Postleitzahlen:**

- Tabelle mit PLZ, Ort und Kundenanzahl
- Integrierte Suche: Filtert über alle PLZ-Daten (nicht nur Top 10), zeigt bis zu 20 Suchergebnisse
- Dynamischer Titel: wechselt zu „PLZ-Suche" bei aktivem Suchbegriff

**Kundensegmente:**

- Persona-Analyse nach Geschlecht × Altersgruppe
- Anzeige: Segment-Name, Anzahl Kunden, Anteil, Conversion-Rate

#### 7. Herkunftsverteilung (Name-Origin-Analyse)

Analyse der vermuteten kulturellen Herkunft der Kunden basierend auf Vor- und Nachnamen.

- **Donut-Diagramm** mit 10 Herkunftskategorien (Deutsch, Türkisch, Arabisch, Persisch/Iranisch, Osteuropäisch, Südeuropäisch, Südasiatisch, Ostasiatisch, Afrikanisch, Sonstige)
- **Detailtabelle** mit Anzahl, Anteil, Verträge, Conversion-Rate und Widerrufsquote pro Herkunft
- **Zweistufige Klassifizierung:**
    1. **Lokaler Klassifizierer** (Wörterbuch mit 3.000+ Vornamen + Nachnamen-Pattern) — läuft automatisch bei jedem Sync
    2. **KI-Optimierung** (Google Gemini AI, Free Tier) — optionaler Button zum Nachklassifizieren der verbleibenden „Sonstige"
- Untertitel zeigt „X von Y Kunden klassifiziert"
- Widerrufsquote ist farbcodiert: grün (≤10%), gelb (10–20%), rot (>20%)

**KI-Optimierung:**

Über den Button „KI-Optimierung" werden die verbleibenden „Sonstige"-Einträge per Google Gemini AI nachklassifiziert. Die Verarbeitung erfolgt Batch für Batch (30 Namen pro Anfrage), um das kostenlose Rate-Limit (15 Anfragen/Minute) einzuhalten. Ein Fortschrittsbalken zeigt den aktuellen Status.

### Filter

Über den ausklappbaren Filter-Bereich können alle Daten eingeschränkt werden:

| Filter | Beschreibung |
|--------|--------------|
| **Nur Beratungskunden** | Toggle — zeigt nur Kunden mit Beratungsgespräch |
| **Zeitraum (Ersttermin)** | Datumsspanne für den ersten Termin des Kunden |
| **Geschlecht** | Weiblich / Männlich / Non-binär |
| **Altersgruppe** | 18-25 / 26-35 / 36-45 / 46-55 / 56+ |
| **Min. Entfernung** | Mindestentfernung zum Standort in km |
| **Max. Entfernung** | Maximalentfernung zum Standort in km |

Die globale **Standort-Auswahl** im Header filtert zusätzlich nach Filiale.

Ein Badge zeigt die Anzahl aktiver Filter an. Über „Filter zurücksetzen" werden alle Filter gleichzeitig entfernt.

### Daten-Synchronisation

Die Statistiken basieren auf einer **vorberechneten Tabelle** (`client_statistics`), die regelmäßig synchronisiert wird. Falls noch kein Sync stattgefunden hat, erscheint ein Warnhinweis.

- **Nightly Delta-Sync:** Cloud Scheduler täglich um 03:30 — holt nur seit dem letzten Sync geänderte/neue Clients via Phorest `updatedAfter`-Filter
- **Full Sync:** Manuell über Setup-Panel oder CLI — lädt alle Clients komplett neu und bereinigt gelöschte Records
- **CLI:** `php artisan stats:sync-client-statistics --force`
- **Datenquelle:** Phorest-Kunden ab Ersttermin 01.01.2024

---

## Für Entwickler

### Architektur

```
┌──────────────────────────────────────────────────────────────────┐
│                     client-statistics.blade.php                   │
│           (Haupt-Layout mit Alpine.js x-data + @includes)        │
├──────────────────────────────────────────────────────────────────┤
│  Partials:                                                       │
│  header │ filter-bar │ demographics │ name-origins │ funnel │     │
│  distance │ body-zones │ cancellations │ map │ top-plz │ segments │
└──────────────────────────┬───────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
   ┌──────────────────┐     ┌────────────────────┐
   │ client-statistics │     │ Chart.js 4.4.1     │
   │ .js (Alpine.js)   │     │ + Leaflet 1.9.4    │
   └────────┬─────────┘     └────────────────────┘
            │
            ▼ fetch()
   ┌──────────────────────────────────────────────┐
   │ ClientStatisticsController (13 API-Endpoints) │
   └────────┬─────────────────────────────────────┘
            │
   ┌────────┴────────────────┐
   ▼                         ▼
┌──────────────────┐  ┌──────────────────────────┐
│ ClientStatistics │  │ ClientStatisticsSyncService│
│ Service (Queries)│  │ (Phorest → DB Sync)       │
└────────┬─────────┘  └──────────────────────────┘
         │
         ▼
┌──────────────────┐
│ client_statistics │ ← Denormalisierte Tabelle
│ (Eloquent Model)  │
└──────────────────┘
```

### Dateien

| Datei | Zweck |
|-------|-------|
| `app/Http/Controllers/ClientStatisticsController.php` | API-Controller mit 13 Endpoints |
| `app/Services/ClientStatisticsService.php` | Abfragen & Aggregation mit Cache |
| `app/Services/NameOriginClassifier.php` | Lokaler Namens-Klassifizierer (Wörterbuch + Muster) |
| `app/Services/GeminiNameClassifier.php` | Google Gemini AI Batch-Klassifizierer |
| `app/Console/Commands/AiClassifyNameOriginsCommand.php` | Artisan-Befehl für KI-Klassifizierung |
| `database/data/name_origins.json` | Kuratiertes Namenswörterbuch (3.000+ Vornamen) |
| `app/Services/ClientStatisticsSyncService.php` | Sync-Logik: Phorest + Verträge → Tabelle |
| `app/Models/ClientStatistic.php` | Eloquent-Model mit Scopes & Constants |
| `app/Models/PostalCodeCoordinate.php` | PLZ → Koordinaten Lookup-Model |
| `app/Console/Commands/SyncClientStatisticsCommand.php` | Artisan-Befehl für Sync |
| `app/Jobs/SyncClientStatistics.php` | Queue-Job für asynchronen Sync |
| `public/js/client-statistics.js` | Alpine.js-Komponente mit Chart-Rendering |
| `resources/views/hub/reports/client-statistics.blade.php` | Haupt-Blade-Layout |
| `resources/views/hub/reports/client-statistics/partials/*.blade.php` | 10 Partial-Views |
| `database/data/plz_coordinates.csv` | PLZ-Koordinaten Quelldatei (8.200+ Einträge) |
| `database/seeders/PostalCodeCoordinateSeeder.php` | Seeder für PLZ-Import |

### Datenbank-Tabellen

#### `client_statistics` (Haupt-Tabelle)

Denormalisierte Kundendaten für schnelle Abfragen. Wird per Sync-Prozess befüllt.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | BIGINT PK | Auto-Increment |
| `phorest_client_id` | VARCHAR UNIQUE | Phorest-Kunden-ID |
| `branch_id` | VARCHAR | Zugeordneter Standort |
| `first_name`, `last_name` | VARCHAR | Kundenname |
| `name_origin` | VARCHAR(20) NULL | Klassifizierte Herkunft (german, turkish, arabic, etc.) |
| `gender` | ENUM | male, female, non_binary, unknown |
| `birth_date` | DATE | Geburtsdatum (für Altersberechnung) |
| `postal_code`, `city` | VARCHAR | Adressdaten |
| `latitude`, `longitude` | DECIMAL(10,7) | Koordinaten (aus PLZ-Lookup) |
| `distance_to_branch_km` | DECIMAL(8,2) | Haversine-Entfernung zum Standort |
| `first_appointment_date` | DATE | Erster Termin (aus Phorest) |
| `last_appointment_date` | DATE | Letzter Termin |
| `total_appointments` | INT | Terminanzahl gesamt |
| `has_consultation` | BOOLEAN | Hat Beratungsgespräch |
| `first_consultation_date` | DATE | Datum des ersten BG |
| `consultation_branch_id` | VARCHAR | Standort des BG |
| `has_followup_after_consultation` | BOOLEAN | Kam nach BG nochmal |
| `has_contract` | BOOLEAN | Hat mindestens einen Vertrag |
| `contract_count` | INT | Anzahl Verträge |
| `contract_body_zone_count` | INT | Anzahl Körperzonen über alle Verträge |
| `is_full_body` | BOOLEAN | Ganzkörper-Behandlung |
| `has_cancellation` | BOOLEAN | Hat Widerruf |
| `only_consultation_no_return` | BOOLEAN | Nur BG, nie zurückgekommen |
| `creating_branch_id` | VARCHAR | In Phorest angelegt durch |
| `last_visited_branch_id` | VARCHAR | Zuletzt besuchter Standort |
| `client_since` | DATE | Kunde seit (Phorest) |
| `synced_at` | TIMESTAMP | Letzter Sync-Zeitpunkt |

**Performance-Indexes:**

| Index | Spalten | Zweck |
|-------|---------|-------|
| `cs_branch_contract_idx` | branch_id, has_contract | Standort + Vertragsstatus |
| `cs_branch_gender_idx` | branch_id, gender | Standort + Geschlecht |
| `cs_branch_consult_contract_idx` | branch_id, has_consultation, has_contract | Funnel-Abfragen |
| `cs_postal_code_idx` | postal_code | PLZ-Gruppierung |
| `cs_birth_date_idx` | birth_date | Altersberechnung |
| `cs_branch_no_return_idx` | branch_id, only_consultation_no_return | Absprung-Analyse |
| `cs_first_appt_idx` | first_appointment_date | Zeitfilter |
| `cs_name_origin_idx` | name_origin | Herkunfts-Gruppierung |

#### `postal_code_coordinates` (Lookup-Tabelle)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `postal_code` | VARCHAR(10) PK | Deutsche PLZ |
| `city` | VARCHAR | Ortsname |
| `state` | VARCHAR | Bundesland |
| `latitude` | DECIMAL(10,7) | Breitengrad |
| `longitude` | DECIMAL(10,7) | Längengrad |

Enthält 8.200+ deutsche Postleitzahlen. Import über `PostalCodeCoordinateSeeder`.

#### Zusätzliche Performance-Indexes

Auf bestehenden Tabellen wurden Composite-Indexes ergänzt:

| Tabelle | Index | Spalten |
|---------|-------|---------|
| `treatment_settings` | `ts_client_zone_idx` | phorest_client_id, body_zone_id |
| `consultation_records` | `cr_branch_date_idx` | branch_id, appointment_date |
| `consultation_appointments` | `ca_branch_date_idx` | branch_id, appointment_date |
| `stats_historic_appointments` | `sha_client_date_branch_idx` | client_id, appointment_date, branch_id |

### API-Endpoints

Alle Endpoints unter `/hub/reports/client-statistics/` — alle unterstützen die gleichen Filter-Parameter.

| Endpoint | Methode | Response-Daten | Beschreibung |
|----------|---------|----------------|--------------|
| `/kpis` | GET | 8 KPI-Objekte mit Label, Wert, Trend | Dashboard-Kennzahlen |
| `/demographics` | GET | age_groups[], gender[], total | Alters- & Geschlechterverteilung |
| `/funnel` | GET | steps[], total_clients, conversion_rate, cancelled_count | Conversion-Funnel |
| `/distance` | GET | groups[], total, avg_distance | Entfernungsverteilung |
| `/body-zones` | GET | groups[], by_gender, by_age_group, by_distance | Körperzonen-Verteilung |
| `/cancellations` | GET | by_gender, by_age_group, by_distance | Widerrufs-Analyse |
| `/map` | GET | markers[], branch, center | Karten-Daten |
| `/top-plz` | GET | top[] (limit per Query-Param) | Top Postleitzahlen |
| `/segments` | GET | segments[] | Kundensegmente |
| `/name-origins` | GET | total, classified, origins[] | Herkunftsverteilung |
| `/classify-origins` | POST | success, message, classified | Lokale Namens-Klassifizierung auslösen |
| `/ai-classify-origins` | POST | success, message, updated, remaining | KI-Batch-Klassifizierung (1 Batch) |
| `/sync-status` | GET | last_synced_at, total_synced, status | Sync-Status |

**Filter-Parameter (alle Endpoints außer sync-status):**

```
?branch_id=ABC123
&date_from=2024-01-01
&date_to=2025-12-31
&consultation_only=1
&gender=female
&age_group=26-35
&min_distance=5
&max_distance=20
```

### Model-Konstanten

```php
// Altersgruppen für Aufschlüsselung
ClientStatistic::AGE_GROUPS = [
    '18-25' => [18, 25],
    '26-35' => [26, 35],
    '36-45' => [36, 45],
    '46-55' => [46, 55],
    '56+'   => [56, 999],
];

// Entfernungsgruppen
ClientStatistic::DISTANCE_GROUPS = [
    '0-5 km'  => [0, 5],
    '5-10 km' => [5, 10],
    '10-20 km' => [10, 20],
    '20-50 km' => [20, 50],
    '50+ km'  => [50, 99999],
];

// Herkunftskategorien (Schlüssel → deutsches Label)
ClientStatistic::ORIGIN_GROUPS = [
    'german'           => 'Deutsch',
    'turkish'          => 'Türkisch',
    'arabic'           => 'Arabisch',
    'persian'          => 'Persisch/Iranisch',
    'eastern_european' => 'Osteuropäisch',
    'southern_european'=> 'Südeuropäisch',
    'south_asian'      => 'Südasiatisch',
    'east_asian'       => 'Ostasiatisch',
    'african'          => 'Afrikanisch',
    'other'            => 'Sonstige',
];
```

### Caching

- **Driver:** Database
- **Prefix:** `client-stats`
- **TTL:** 3600 Sekunden (1 Stunde)
- **Invalidierung:** Versionierte Cache-Keys — `ClientStatisticsService::flushCache()` erhöht die Version, wodurch alle alten Cache-Einträge automatisch ignoriert werden
- Cache wird nach jedem Sync automatisch geleert

### Sync-Prozess

#### Artisan-Befehl

```bash
# Vollständiger Sync aller Standorte
php artisan stats:sync-client-statistics

# Nur einen Standort
php artisan stats:sync-client-statistics --branch=BRANCH_ID

# Erzwingen (auch wenn <20h seit letztem Sync)
php artisan stats:sync-client-statistics --force

# Als Queue-Job (asynchron)
php artisan stats:sync-client-statistics --queue
```

#### Sync-Ablauf

1. **Client-IDs sammeln:** Alle aktiven Phorest-Kunden + Kunden mit Verträgen
2. **Cutoff-Filter:** Nur Kunden mit `firstVisit >= 2024-01-01`
3. **Mega-Chunk-Verarbeitung** (1.000 Kunden pro Batch):
    - Lokale Daten laden (Beratungen, Verträge, Widerrufe, Termine)
    - Phorest-API-Daten in 100er-Batches abrufen (Name, Geschlecht, Geburtsdatum, PLZ)
    - PLZ-Koordinaten per Bulk-Lookup auflösen
    - Haversine-Entfernung zum Standort berechnen
    - `UPSERT` in `client_statistics` Tabelle
4. **Cleanup:** Verwaiste Einträge entfernen (Clients nicht mehr im Sync-Scope)
5. **Cache leeren:** `flushCache()` nach erfolgreichem Sync

#### Datenquellen

| Quelle | Daten |
|--------|-------|
| **Phorest API** | Name, Geschlecht, Geburtsdatum, PLZ, firstVisit, lastVisit, Standorte |
| **consultation_records** | Beratungsgespräche (Datum, Standort, Körperzonen) |
| **stats_historic_appointments** | Terminhistorie (Anzahl, Folgetermine nach BG) |
| **contracts** | Verträge (Anzahl, Körperzonen, Ganzkörper-Flag) |
| **contract_cancellations** | Widerrufe (mit gültiger Reaktion) |
| **postal_code_coordinates** | PLZ → Lat/Lon Lookup |

### JavaScript-Architektur

Die Alpine.js-Komponente `clientStatisticsApp()` steuert die gesamte Seite.

#### Lade-Strategie (Zwei-Wellen-Ansatz)

```
init()
  ├── loadSyncStatus()       → Sync-Status prüfen
  └── loadAllData()
       ├── [parallel] fetchKpis, fetchDemographics, fetchFunnel
       └── nach Rendering → loadSecondary()
            └── [parallel] fetchSegments, fetchMap, fetchDistance,
                           fetchTopPlz, fetchBodyZones, fetchCancellations
```

#### Chart-Instanzen (Closure-Pattern)

!!! warning "Bekannter Bug"
    Chart.js-Instanzen dürfen **nicht** in Alpine.js `data` gespeichert werden, da der Alpine-Proxy `ResizeObserver`- und Animations-Fehler verursacht. Stattdessen werden alle Chart-Instanzen in Closure-Variablen außerhalb des Alpine-Scopes gehalten.

```javascript
// ✅ Richtig: Closure-Variable
let bodyZoneChart = null;

// ❌ Falsch: Alpine-Proxy
this.bodyZoneChart = new Chart(...);
```

#### Chart-Modi

**Körperzonen-Chart (3 Modi):**

| Modus | X-Achse | Balken | Beschreibung |
|-------|---------|--------|--------------|
| Gesamt | Zonen 1-7 | Einzelne Balken | Gesamtverteilung |
| Altersgruppe | Zonen 1-7 | Hintergrund (Gesamt) + gruppierte Balken pro Alter | Aufschlüsselung |
| Entfernung | Zonen 1-7 | Hintergrund (Gesamt) + gruppierte Balken pro Distanz | Aufschlüsselung |

**Widerrufs-Chart (3 Modi):**

| Modus | X-Achse | Balken | Beschreibung |
|-------|---------|--------|--------------|
| Geschlecht | W / M / Non-binär | Hintergrund: Verträge, Vordergrund: Quote % | Standard |
| Altersgruppe | 18-25 bis 56+ | Hintergrund: Verträge, Vordergrund: Quote % | Aufschlüsselung |
| Entfernung | 0-5 km bis 50+ km | Hintergrund: Verträge, Vordergrund: Quote % | Aufschlüsselung |

Die Hintergrund-Balken nutzen eine separate X-Achse (`xBg`, nicht sichtbar) mit hohem `order`-Wert, sodass sie hinter den Vordergrund-Balken gerendert werden.

### Leaflet-Karte

- **Tile-Server:** OpenStreetMap.DE (`tile.openstreetmap.de/tiles/osmde/`)
- **Cluster-Marker:** `Leaflet.markercluster` für Performance bei vielen Markern
- **GeoJSON-PLZ-Layer:** Aus `/public/geo/plz-*.geojson` geladen, Opacity per Slider steuerbar
- **Karten-Modi:** count (Kundenanzahl), conversion_rate, avg_distance — steuern die Farbskala der GeoJSON-Flächen

### Deployment (Produktiv-DB)

Für die Ersteinrichtung auf der Produktiv-Datenbank:

1. **Tabellen anlegen:** SQL-Script ausführen (erstellt `postal_code_coordinates` und `client_statistics` + Indexes)
2. **PLZ-Daten importieren:**
   ```bash
   php artisan db:seed --class=PostalCodeCoordinateSeeder
   ```
3. **Ersten Sync ausführen:**
   ```bash
   php artisan stats:sync-client-statistics --force
   ```

#### Herkunftsanalyse (name_origin)

Zusätzlich zur Ersteinrichtung muss die `name_origin`-Spalte angelegt werden:

```sql
ALTER TABLE `client_statistics`
    ADD COLUMN `name_origin` VARCHAR(20) NULL AFTER `last_name`;

CREATE INDEX `cs_name_origin_idx` ON `client_statistics` (`name_origin`);
```

Die Spalte wird beim nächsten Sync automatisch durch den lokalen Klassifizierer befüllt. Optional kann danach die KI-Optimierung über den Button auf der Statistik-Seite oder per CLI gestartet werden:

```bash
# KI-Klassifizierung per Artisan (alle verbleibenden "Sonstige")
php artisan stats:ai-classify-origins

# Trockenlauf (zeigt was klassifiziert würde, ohne API-Aufrufe)
php artisan stats:ai-classify-origins --dry-run

# Nur N Namen klassifizieren
php artisan stats:ai-classify-origins --limit=100
```

### Herkunftsanalyse — Technische Details

#### Klassifizierungs-Architektur (Zwei-Stufen-System)

```
Sync-Prozess / Button "Herkunft klassifizieren"
         │
         ▼
┌───────────────────────────────┐
│ NameOriginClassifier (lokal)  │ ← 1. Stufe: Wörterbuch
│ • 3.000+ Vornamen-Einträge    │
│ • Nachnamen-Pattern (Suffixe, │
│   Präfixe, häufige Namen)     │
│ • ~75% Trefferquote           │
└──────────┬────────────────────┘
           │ verbleibende → 'other'
           ▼
┌───────────────────────────────┐
│ GeminiNameClassifier (KI)     │ ← 2. Stufe: Optional
│ • Google Gemini 2.0 Flash     │
│ • Free Tier (15 RPM, 1.500/d) │
│ • 30 Namen pro Batch          │
│ • Reduziert 'Sonstige' um     │
│   ca. 30-50% zusätzlich       │
└───────────────────────────────┘
```

#### 10 Herkunftskategorien

| Schlüssel | Deutsches Label | Beispiel-Klassifizierung |
|-----------|----------------|--------------------------|
| `german` | Deutsch | Anna Müller, Michael Schmidt |
| `turkish` | Türkisch | Ayse Yilmaz, Mehmet Kaya |
| `arabic` | Arabisch | Mohammed Al-Hassan |
| `persian` | Persisch/Iranisch | Maryam Hosseini |
| `eastern_european` | Osteuropäisch | Katarina Nowak, Ivan Petrov |
| `southern_european` | Südeuropäisch | Maria Rossi, Carlos García |
| `south_asian` | Südasiatisch | Priya Sharma, Raj Patel |
| `east_asian` | Ostasiatisch | Yuki Tanaka, Wei Zhang |
| `african` | Afrikanisch | Amara Diallo |
| `other` | Sonstige | Nicht zuordenbar |

#### Lokaler Klassifizierer (`NameOriginClassifier`)

**Klassifizierungs-Reihenfolge:**

1. **Vornamen-Lookup**: Vorname wird normalisiert (Kleinbuchstaben, erster Teil bei Doppelnamen) und im Wörterbuch gesucht (`database/data/name_origins.json`)
2. **Nachnamen-Pattern**: Falls kein Treffer, wird der Nachname geprüft:
    - **Präfixe** (z.B. „von", „ab-", „al-", „di")
    - **Suffixe** (z.B. „-ski", „-ovic", „-oğlu", „-enko")
    - **Häufige Namen** pro Kategorie (z.B. „Müller", „Schmidt" → deutsch)
3. **Fallback**: `'other'` wenn keine Zuordnung möglich

**Wörterbuch** (`database/data/name_origins.json`):

- ~3.000+ kuratierte Vornamen über alle 10 Kategorien
- Enthält auch moderne/internationale Namen (Michelle, Kristina, Lara etc.) als deutsch eingestuft
- Nachnamen-Pattern mit Suffixen, Präfixen und häufigen Namen pro Herkunft

#### KI-Klassifizierer (`GeminiNameClassifier`)

**Konfiguration** (`.env` + `config/google.php`):

| Einstellung | Wert | Beschreibung |
|-------------|------|--------------|
| `GEMINI_API_KEY` | `.env` | API-Schlüssel (Google AI Studio) |
| `gemini.model` | `gemini-2.0-flash` | Modell (schnell, kostenlos) |
| `gemini.batch_size` | `30` | Namen pro API-Anfrage |
| `gemini.rpm_limit` | `14` | Max. Anfragen/Minute |
| `gemini.daily_limit` | `1.400` | Max. Anfragen/Tag |
| `gemini.timeout` | `25` | Timeout in Sekunden |

**API-Flow (pro Batch):**

1. 30 „Sonstige"-Kunden als Liste „ID: Vorname Nachname" zusammenstellen
2. Prompt an Gemini mit den 10 gültigen Kategorien + Anweisungen
3. Antwort parsen: Format `ID|kategorie` pro Zeile
4. Nur nicht-„other"-Ergebnisse in DB aktualisieren
5. 4 Sekunden Pause bis zum nächsten Batch (15 RPM einhalten)

**Frontend-Integration:**

Der „KI-Optimierung"-Button ruft den Endpoint iterativ auf (1 Batch pro HTTP-Request). Das Frontend loopt in einer `while`-Schleife bis `remaining === 0` oder ein Fehler auftritt. Zwischen den Requests wird 4 Sekunden gewartet.

### Bekannte Gotchas

!!! warning "Eloquent Accessor vs. SQL Alias"
    Das Model hat einen `getAgeGroupAttribute()` Accessor. Wenn in SQL-Queries ein Alias `age_group` verwendet wird, überschreibt der Accessor den Wert mit `null`. **Lösung:** In SQL-Queries stattdessen den Alias `grp` verwenden (`SELECT ... AS grp`).

!!! info "Sync-Dauer"
    Ein vollständiger Sync dauert ca. 5-10 Minuten bei ~20.000 Kunden (abhängig von Phorest-API-Geschwindigkeit). Memory-Limit ist auf 512 MB gesetzt.
