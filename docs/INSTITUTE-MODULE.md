# Institut-Modul

## Übersicht
Das Institut-Modul zeigt alle Phorest Branches als "Institute" an und bietet detaillierte Ansichten für jedes Institut.

## Features

### Übersichtsseite (`/hub/branches`)
- **Anzeige wenn "Alle Institute" ausgewählt**
- Grid-Layout mit Institut-Karten
- Jede Karte zeigt:
  - Institut-Name
  - Adresse
  - Kontaktdaten (Telefon, E-Mail)
  - Placeholder für Institut-Bild (später hinzufügbar)
- Klickbare Karten führen zur Detail-Ansicht

### Detail-Seite (`/hub/branches/{branchId}`) — seit 15.09.2026 „Steckbrief-Spalte"

Die Seite folgt seit dem 15.09.2026 dem Layout der Vertragsseite V2 (Abnahme
per Mockup, Variante B): **Kopfzeile** mit Zurück-Pfeil, Name, Adresse und drei
**Schnellaktionen** aus den Kontakt-Stammdaten („Anrufen" = Festnetz,
„Anrufen mobil" = WhatsApp-Nummer als `tel:`-Link, „WhatsApp schreiben" =
`wa.me`-Link), darunter das **Menüband** (`.tab-band-glattt`, dieselbe Optik wie
die Vertragsseite: aktiver Reiter im Teal-Gradient, Heroicons, Team-Zähler) und
der **Zweispalter**: Reiter-Inhalt links, rechts der feststehende **Steckbrief**.

**Mobil:** Titel mittig ohne Untertitel, Schnellaktionen über die volle Breite
(Muster vom 15.09.2026), fünf Reiter als Symbol-Segmente mit Kurzbeschriftung
(nichts scrollt), Steckbrief als zugeklappte Karte über dem Menüband. Auf dem
iPad (unter 1280 px) steht der Steckbrief aufgeklappt über dem Menüband — das
regelt allein das CSS-Grid (`grid-template-areas`), das Markup bleibt gleich.

#### Steckbrief (auf jedem Reiter sichtbar)
- Standort-Icon, Stadt
- **Farbe, Reihenfolge, Sichtbarkeit** mit Badges und — bei `manage_branch_images` —
  direkt bearbeitbar (12 Schnellfarben, nativer Farbwähler, Hex-Feld, Reihenfolge
  0–999, Schalter „Aus Übersichten ausblenden", ein Speichern)
- Branch-ID und Account-ID mit Kopier-Knopf, Zeitzone · Währung, Koordinaten
  mit Google-Maps-Link, Team-Größe mit Sprung zum Reiter „Team"

#### 1. Infos
- Kontaktdaten: Name, Adresse, Website aus Phorest; darunter die **Kontakt-
  Stammdaten** Telefon, WhatsApp-Nummer, E-Mail (Tabelle `institute_contacts`,
  Endpoints `GET/POST /phorest/institute/{branchId}/contact`, Schreibrecht
  `manage_branch_images`; ohne Recht Leseansicht). Sie speisen die
  Schnellaktionen der Kopfzeile und die **Terminerinnerungs-Mails** (Footer,
  Buttons, Platzhalter `{{institut_telefon}}`/`{{institut_whatsapp}}`/
  `{{institut_mail}}`, siehe `TERMINERINNERUNGEN.md`).
- Standort-Icon (PNG/SVG, max. 2 MB) und Institut-Bild (max. 5 MB) — je eine
  Karte; ein neues Icon erscheint sofort im Steckbrief
- Standort auf der Karte (Google-Maps-Einbettung über die Phorest-Koordinaten)

#### 2. Team
- glatttHub-Konten mit diesem Institut als Stamminstitut: Avatar, Name,
  NiSV-Status (grün/gelb/orange/rot), „im Hub seit"; Klick öffnet das Profil.
- Wird beim Seitenaufruf geladen (Zähler im Reiter).

#### 3. Kennzahlen (seit 15.09.2026 mit echten Zahlen)
- **KPI-Zeile** (`components/kpi-dashboard`, Speicher-Schlüssel `institute-kpis`,
  sechs sichtbar, Reihenfolge personalisierbar) — nur dieses Institut,
  laufender Monat: Durchgeführte BGs (Monat, nur PAID-Termine) · Beratungen
  heute · Beratungen morgen · Geplant (7 Tage) · Geplant bis Monatsende ·
  Verträge · Verkaufte Körperzonen · Ø Körperzonen. Endpoint
  `GET /phorest/institute/{branchId}/kpis` → `KpiValueService::values()` mit
  den IDs aus `InstituteController::KPI_IDS`; welche Kacheln erscheinen,
  entscheidet die Berechtigung je Kennzahl (`view_report_glattt_kpis`,
  `view_report_upcoming_consultations`, `view_report_sales_statistics`).
- Darunter zwei **Registry-Statistiken** mit festem Standort über das
  `statFilters`-Objekt der Seiten-App (Standort = Institut, Zeitraum = Monat):
  „Aktueller Buchungsstand" (`termine.booking-status`) und „Körperzonen pro
  Tag" (`sales.body-zones-daily`). Nichts ist doppelt gebaut.
- Neu in der KpiRegistry dafür: `termine.upcoming_tomorrow`,
  `termine.upcoming_month_end` (Eimer `tomorrow`/`month_end` aus
  `ReportController::buildUpcomingConsultationsKpi`) und
  `sales.total_body_zones` (Summe `body_zone_count` der Abschlüsse).

#### 4. Bank (nur `manage_branch_bank_details`)
- Bankverbindung je Standort für Zahlungserinnerungen und Mahnungen des
  Forderungsmanagements (Kontoinhaber, IBAN, BIC, Bank, Schalter „Aktiv").

#### 5. Extern (nur `manage_institute_access_tokens`)
- Zugangs-Link der Institutsseite (Tageserfassung Beratungsgespräche):
  erstellen, kopieren, erneuern, widerrufen.

## Technische Implementierung

### Backend
- **Controller:** `InstituteController`
  - `index()` - Zeigt Übersicht oder Detail je nach Parameter
  - `show()` - Detail-Ansicht
  - `getInstituteDetails()` - API für Institut-Daten
  - `getInstituteStaff()` - API für Mitarbeiter

### Routes
```php
// Views
GET /hub/branches            -> InstituteController@index
GET /hub/branches/{branchId} -> InstituteController@show

// API
GET /phorest/institute/{branchId}       -> InstituteController@getInstituteDetails
GET /phorest/institute/{branchId}/staff -> InstituteController@getInstituteStaff
GET /phorest/institute/{branchId}/kpis  -> InstituteController@kpis (Kennzahlen-Zeile, seit 15.09.2026)

// Standort-Farben API
GET  /phorest/institute/colors/all      -> InstituteController@getAllInstituteColors
GET  /phorest/institute/{branchId}/color -> InstituteController@getInstituteColor
POST /phorest/institute/{branchId}/color -> InstituteController@saveInstituteColor
```

### Frontend
- **Views:**
  - `resources/views/hub/institutes/index.blade.php` - Übersicht
  - `resources/views/hub/institutes/show.blade.php` - Kopfzeile, Menüband, Zweispalter
  - `resources/views/hub/institutes/partials/steckbrief.blade.php` - Steckbrief-Spalte
  - `resources/views/hub/institutes/tabs/info.blade.php`
  - `resources/views/hub/institutes/tabs/staff.blade.php`
  - `resources/views/hub/institutes/tabs/metrics.blade.php` (KPI-Zeile + `<x-statistic>`)
  - `resources/views/hub/institutes/tabs/bank.blade.php`
  - `resources/views/hub/institutes/tabs/access.blade.php`

- **Alpine.js-Komponenten** (`public/js/institute-detail.js`, geladen per `@assets`
  zusammen mit der Statistik-Laufzeit echarts → echarts-glattt → chart-table →
  glattt-stats → `statistics/termine.js` + `statistics/sales.js`):
  - `instituteDetail(branchId)` - Seiten-App: Stammdaten, Kontakt, Team,
    Kennzahlen-Zeile, Reiter-Zustand, `statFilters`-Getter für die eingebetteten Karten
  - `instituteColorPicker(branchId)` - Farbe/Reihenfolge/Sichtbarkeit im Steckbrief
  - `instituteIconUploader(branchId)`, `instituteImageCard(branchId)`,
    `instituteAccessToken(branchId)`

- **Theme** (`theme_glattt.css`): `.tab-band-glattt` / `.tab-band-glattt-tab` sind
  Aliasse des Vertrags-Menübands (`.contract-v2-tabs`, gleiche Regeln), mobil
  `.tab-band-glattt-mobile-icons`; Zweispalter `.institute-detail-layout` mit
  den Areas `band` / `main` / `steckbrief`; Steckbrief-Klassen `.institute-steckbrief-*`.
  Abgesichert durch `tests/Feature/InstituteDetailPageTest.php`.

### Standort-Farben System

#### Für Endanwender
Jedes Institut kann eine individuelle Farbe und eine benutzerdefinierte Sortierreihenfolge erhalten:

**Farbe:**
1. Institut-Detailseite öffnen → Info-Tab
2. Im Bereich „Standort-Farbe" eine der 12 vordefinierten Farben wählen oder über den Farbpicker eine beliebige Farbe auswählen
3. „Farbe speichern" klicken
4. Die Farbe wird sofort auf allen Statistik-Seiten aktiv (Terminstatistiken, Buchungsvorlauf, Freie-Slots, Stornierungen, Auslastung, Wochentag-/Uhrzeitanalyse)

**Standort-Reihenfolge:**
1. Institut-Detailseite öffnen → Info-Tab
2. Im Feld „Reihenfolge" neben dem Farbpicker eine Zahl eingeben (0–999)
3. Niedrigere Zahlen erscheinen weiter oben in der Liste
4. Institute ohne Reihenfolge werden alphabetisch am Ende einsortiert
5. Die Reihenfolge gilt überall: Sidebar, Übersichtsseite, alle Statistik-Tabellen und Diagramme

#### Für Entwickler

**Architektur:**

| Komponente | Datei | Beschreibung |
|---|---|---|
| Model | `app/Models/InstituteColor.php` | Eloquent-Model mit Cache-Logik (5 Min.), `DEFAULT_COLORS` als Rückfallebene |
| Controller | `app/Http/Controllers/InstituteController.php` | 3 API-Methoden (getAll, get, save) |
| Migration | `database/migrations/2026_03_23_...` | `institute_colors` Tabelle |
| JS-Service | `public/js/branch-color-service.js` | Zentraler Client-Service |
| Color Picker UI | `resources/views/hub/institutes/tabs/info.blade.php` | Alpine.js Farbpicker |
| Auslieferung | `resources/views/layouts/hub.blade.php` | `window.__branchColors` vor dem Service |
| CSS | `public/css/theme_glattt.css` | `.institute-color-*` Klassen |

**Woher die Farben kommen (Reihenfolge, Stand 08/2026):**

1. **Mit der Seite ausgeliefert** — das Hub-Layout schreibt die Farbkarte als
   `window.__branchColors` ins Dokument, direkt vor `branch-color-service.js`.
   Der Service übernimmt sie **synchron**, bevor die erste Komponente rendert.
2. `localStorage`-Puffer (5 Minuten) für Seiten ohne ausgelieferte Farben
3. `DEFAULT_BRANCH_COLORS` — die hinterlegte Farbe des Instituts
4. Erst für ein unbekanntes, noch nicht gepflegtes Institut die Ersatzpalette

> **Nicht auf Nachladen umbauen.** Vorher holte der Service die Farben per
> `fetch()`, ohne dass jemand darauf wartete: Rendert eine Karte schneller als
> die Antwort eintrifft, greift sie zur Ersatzpalette **nach Index** und
> korrigiert sich nie mehr — das dafür gedachte Event `branchColorsLoaded`
> hatte keinen einzigen Listener. Nach Ablauf des localStorage-Puffers war das
> Zeitfenster bei jedem ersten Seitenaufruf wieder offen; sichtbar als
> Standortfarben, die „manchmal" falsch waren. Abgesichert durch
> `tests/Feature/BranchColorDeliveryTest.php`.

**Standardfarben als zweite Sicherung:**
`InstituteColor::DEFAULT_COLORS` hält die Farbe je Institut fest (Quelle der
Wahrheit, abgeglichen mit dem Produktivstand); `getColorMap()` legt sie unter
die Datenbankwerte, die **immer** Vorrang haben. Gespiegelt als
`DEFAULT_BRANCH_COLORS` in `branch-color-service.js`, damit auch eine Seite
ohne Server-Farben die gewohnte Farbe zeigt. Laufen die beiden Listen
auseinander, bricht der Test.

**Achtung bei eigenen Aufrufen der Standort-Endpunkte:** `fetch()` **immer** mit
`Accept: application/json` und `X-Requested-With: XMLHttpRequest` aufrufen. Ein
nackter `fetch()` schickt `Accept: */*`; `RedirectDirectApiAccess` hält das für
eine Browser-Navigation und antwortet mit **302 auf hub.start**. Genau daran
scheiterte bis 08/2026 das Laden von Farbe, Icon und Bild auf der Standort-Seite
— die Farbauswahl stand dauerhaft auf ihrem Startwert, und wer dort speicherte,
überschrieb damit die echte Farbe.

**BranchColorService (JavaScript):**
Wird global im Hub-Layout geladen und bietet eine einheitliche API für alle Statistik-Seiten:

```javascript
// Farbe für einen Branch abrufen
BranchColorService.getColor(branchId, fallbackIndex)

// RGBA-Variante
BranchColorService.getRgba(branchId, opacity, fallbackIndex)

// HSL-Variante (für Abstufungen)
BranchColorService.getHSL(branchId, fallbackIndex)

// Heatmap-Farbe (Intensitäts-basiert)
BranchColorService.getHeatmapColor(branchId, value, max, fallbackIndex)

// Chart.js-Farben (background, border, bgLight)
BranchColorService.getChartColors(branchId, fallbackIndex)

// Karten-Gradient (für Übersichtsseite)
BranchColorService.getCardGradient(branchId, fallbackIndex)
```

**Datenbank-Tabelle `institute_colors`:**

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | bigint | Auto-Increment |
| `branch_id` | string (unique) | Phorest Branch-ID |
| `hex_color` | string(7) | Hex-Farbe z.B. `#14b8a6` |
| `sort_order` | unsigned int (nullable) | Sortierreihenfolge (0–999), NULL = Ende |
| `updated_by` | FK → users | Letzter Bearbeiter |
| `timestamps` | | created_at, updated_at |

**Refaktorierte JS-Dateien:**
Die folgenden Statistik-JS-Dateien verwenden nun `BranchColorService` statt lokaler Farbpaletten:
- `public/js/past-consultation-stats.js`
- `public/js/booking-lead-time.js`
- `public/js/free-slots-analysis.js`
- `public/js/cancelled-appointments-analysis.js`
- `public/js/consultation-stats.js`
- `public/js/utilization-stats.js`
- `public/js/weekday-time-analysis.js`

**Produktiv-SQL:** `database/data/production-sql-institute-colors.sql`, `database/data/production-sql-institute-sort-order.sql`

### Standort-Reihenfolge (Sort Order)

#### Für Endanwender
Die Reihenfolge, in der Standorte überall im System angezeigt werden, kann pro Institut individuell festgelegt werden. Ohne konfigurierte Reihenfolge werden Institute alphabetisch sortiert.

#### Für Entwickler

**Zentrale Sortierung in `PhorestApiService::getBranches()`:**
Die Sortierung ist direkt in der API-Service-Methode implementiert, sodass **alle Aufrufer** automatisch sortierte Branches erhalten — ohne Anpassung an jeder einzelnen Stelle.

**Sortierlogik (3-stufig):**
1. Branches mit `sort_order` → aufsteigend nach Zahl
2. Nur ein Branch hat `sort_order` → dieser kommt zuerst
3. Beide ohne `sort_order` → alphabetisch nach Name

**Betroffene Stellen:**

| Bereich | Datei | Beschreibung |
|---|---|---|
| API-Service | `app/Services/PhorestApiService.php` | Zentrale Sortierung in `getBranches()` |
| Model | `app/Models/InstituteColor.php` | `getSortOrderMap()` mit 5-Min-Cache |
| Controller | `app/Http/Controllers/InstituteController.php` | Speichern/Laden der Reihenfolge |
| Controller | `app/Http/Controllers/PhorestController.php` | `/phorest/branches` Endpoint |
| Controller | `app/Http/Controllers/ReportController.php` | Booking-Lead-Time und Wochentag-Analyse |
| UI | `resources/views/hub/institutes/tabs/info.blade.php` | Zahlenfeld im Info-Tab |
| UI | `resources/views/hub/institutes/show.blade.php` | Alpine.js `sortOrder`-Property |
| JS | `public/js/consultation-stats.js` | Sort-Order-basierte Reihenfolge |
| Migration | `database/migrations/2026_03_24_120000_...` | `sort_order` Spalte |

**API:**
```php
// Sort-Order-Map abrufen (cached)
$sortOrders = InstituteColor::getSortOrderMap();
// Ergebnis: ['branchId1' => 1, 'branchId2' => 2, ...]

// Reihenfolge speichern
POST /phorest/institute/{branchId}/color
// Body: { hex_color: '#14b8a6', sort_order: 3 }
// sort_order ist optional (nullable|integer|min:0|max:999)
```

**Cache:**
Die Sort-Order-Map wird 5 Minuten gecacht (`institute_sort_order_map`). Der Cache wird automatisch geleert, wenn eine Farbe oder Reihenfolge gespeichert wird (`InstituteColor::clearColorCache()`).

### Institute aus Übersichten ausblenden (seit 09/2026)

#### Für Endanwender

Auf der Detailseite eines Instituts (Info-Tab, Karte „Standort-Farbe, Reihenfolge &
Sichtbarkeit") gibt es den Schalter **„Aus Übersichten ausblenden"**. Ist er gesetzt,
zählen Termine und Zahlen dieses Instituts **nicht mehr in „Alle Standorte"** — in
Berichten, der Terminübersicht, auf der Startseite und im CSV-Export. Das Institut
bleibt in der Standortliste der Seitenleiste (und im Standort-Sheet auf dem Handy)
wählbar und ist dort mit dem Badge **„Ausgeblendet"** gekennzeichnet; wählt man es
ausdrücklich, erscheinen seine Daten wie gewohnt.

Typischer Anwendungsfall: ein noch nicht eröffnetes Institut (z.B. Magdeburg vor der
Eröffnung), in dem Testbuchungen laufen, die sonst Beratungszahlen und No-Show-Quoten
aller Gesamtansichten verfälschen. Das Speichern des Schalters braucht das Recht
`manage_branch_images` (wie Farbe und Reihenfolge) und leert den Application-Cache,
damit die Gesamtansichten sofort den neuen Stand zeigen.

**Bewusst nicht betroffen:** Report-Mails, Bonus-Board/Gamification, Mitteilungen und
der glatttbert-Assistent (Entscheidung 07.09.2026) sowie Verwaltungslisten
(Verträge, Widerrufe, Forderungen).

#### Für Entwickler

Regelwerk in **`app/Support/BranchVisibility`** — die einzige Stelle, an der
„gewählter Standort" bzw. „Alle Standorte" in einen Filter übersetzt wird:

- Standort gewählt (`branch_id` gesetzt) → exakt dieser, auch wenn ausgeblendet.
- Kein Standort → alle außer `institute_colors.hidden_from_overview = 1`;
  `NULL`-Werte in der Spalte bleiben erhalten (`col IS NULL OR col NOT IN (…)`).

| Zweck | Aufruf |
|---|---|
| Eloquent-/Query-Builder (Makro, auch Relations) | `->visibleBranch($branchId, 'c.branch_id')` |
| Raw-SQL | `[$where, $bindings] = BranchVisibility::sql($branchId, 'sha.branch_id')` |
| Phorest-Schleifen | `BranchVisibility::visibleBranches($branchId)`, `filterBranches($arr, $branchId)`, `filterIds($ids, $branchId)` |
| Instituts-Vergleiche (immer alle nebeneinander) | `BranchVisibility::filterIdsForComparison($ids, $branchId)` — alle sichtbaren plus das gewählte |
| Legenden/Branch-Listen | `BranchVisibility::visibleBranchNames($branchId)` |
| Reine ID→Name-Lookups gefilterter Zeilen | `BranchVisibility::allBranchNames()` / `allBranches()` |
| In-Memory | `BranchVisibility::isHidden($id)`, `hiddenIds()` |

`tests/Unit/BranchVisibilityConventionTest.php` verbietet in allen Statistik-Services,
Report-Controllern und Export-Quellen nackte `where('…branch_id', …)`, Raw-`branch_id = ?`,
`when($branchId, …)`, `forBranch()` sowie `getCachedBranches()`/`getCachedBranchNames()`
(Zeilen mit `BranchVisibility` sind erlaubt). Eine neue Statistik nimmt den Helfer von
Anfang an; die Antwort auf einen roten Lauf ist nie, die Datei aus der Liste zu nehmen.

Weitere Bausteine:

| Bereich | Datei |
|---|---|
| Migration | `database/migrations/2026_09_07_210000_add_hidden_from_overview_to_institute_colors_table.php` |
| Model | `InstituteColor::getHiddenBranchIds()` (5-Min-Cache `institute_hidden_branch_ids`, geleert über `clearColorCache()`) |
| Makro | `AppServiceProvider::boot()` registriert `visibleBranch` auf `Illuminate\Database\Query\Builder` |
| Speichern/Laden | `InstituteController::saveInstituteColor()` / `getInstituteColor()` (`hidden_from_overview`, `Cache::flush()` bei Änderung) |
| Standortliste | `PhorestController::branches()` liefert `hidden_from_overview` je Institut; Badge in `sidebar.blade.php`, `bottom-nav.blade.php`, `hub/institutes/index.blade.php` |
| Phorest „alle Institute" | `PhorestApiService::getAllBranchesAppointments()` (Terminübersicht + Startseite), `ConsultationStatsService` |
| Tests | `tests/Unit/BranchVisibilityTest.php`, `tests/Feature/HiddenBranchOverviewTest.php`, `tests/Feature/InstituteColorApiTest.php` |

## Terminologie
- **Phorest:** "Branch"
- **glatttHub UI:** "Institut"
- **Code intern:** Beide Begriffe werden verwendet, aber User-facing ist "Institut"

## Zukünftige Erweiterungen
1. ~~**Institut-Bilder:** Upload und Anzeige von Institut-Fotos~~ ✅ Implementiert
2. ~~**Google Maps Integration:** Standort-Karte im Info-Tab~~ ✅ Implementiert
3. **Laser-Verwaltung:** Geräte-Datenbank mit Wartungsplan
4. ~~**Kennzahlen:** Echte Daten aus Phorest API~~ ✅ Implementiert (15.09.2026, KPI-Zeile + Registry-Karten)
5. **Berichte:** Institut-spezifische Reports
6. **Öffnungszeiten:** Anzeige und Verwaltung der Geschäftszeiten
7. ~~**Standort-Farben:** Konfigurierbare Farben pro Institut~~ ✅ Implementiert
8. ~~**Standort-Reihenfolge:** Konfigurierbare Sortierung pro Institut~~ ✅ Implementiert
