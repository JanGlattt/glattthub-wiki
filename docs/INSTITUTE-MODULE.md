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

### Detail-Seite (`/hub/branches?branch={branchId}`)
- **Tab-Navigation mit 4 Bereichen:**

#### 1. Infos Tab
- Kontaktdaten (Name, Adresse aus Phorest)
- **Kontakt-Stammdaten (seit 29.08.2026):** Telefon, WhatsApp-Nummer und
  E-Mail je Institut werden direkt in der Kontaktdaten-Karte gepflegt
  (Tabelle `institute_contacts`, Endpoints `GET/POST
  /phorest/institute/{branchId}/contact`, Schreibrecht wie Farbe/Icon/Bild:
  `manage_branch_images`; ohne Recht Leseansicht). Phorest liefert je Branch
  keine Kontaktdaten. Genutzt von den **Terminerinnerungs-Mails**:
  Instituts-Footer, „Anrufen"-/„WhatsApp schreiben"-Buttons und die
  Platzhalter `{{institut_telefon}}`/`{{institut_whatsapp}}`/`{{institut_mail}}`
  (siehe `TERMINERINNERUNGEN.md`).
- **Standort-Farbe:** Konfigurierbarer Farbpicker mit:
  - 12 vordefinierten Farben als Schnellauswahl
  - Freier Farbwähler (nativer Color-Picker)
  - Hex-Code Eingabefeld
  - Sofortige Vorschau der gewählten Farbe
  - Die Farbe wird in allen Statistik-Seiten und auf der Übersichtsseite konsistent verwendet
- **Reihenfolge:** Konfigurierbares Zahlenfeld (0–999) zur Steuerung der Sortierreihenfolge der Standorte in allen Listen, Tabellen und Statistik-Seiten
- Weitere Informationen (Branch ID, Zeitzone, Währung)
- Standort-Karte (Placeholder für zukünftige Integration)

#### 2. Mitarbeiter Tab
- Liste aller glatttHub-User mit diesem Institut als Stamminstitut
- Zeigt pro Mitarbeiter:
  - Profilfoto
  - Name und E-Mail
  - Rollen/Berechtigungen
  - Mitglied seit
- Dynamisches Laden beim Tab-Wechsel

#### 3. Laser Tab
- Placeholder für zukünftige Laser-Geräte Informationen
- Geplant: Gerätetypen, Wartungsdaten, Nutzungsstatistik

#### 4. Kennzahlen Tab
- Placeholder für zukünftige Statistiken und KPIs
- Geplant: Termine, Umsatz, Neue Kunden, Auslastung
- Charts für Umsatzentwicklung und Terminauslastung

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
GET /hub/branches -> InstituteController@index

// API
GET /phorest/institute/{branchId} -> InstituteController@getInstituteDetails
GET /phorest/institute/{branchId}/staff -> InstituteController@getInstituteStaff

// Standort-Farben API
GET  /phorest/institute/colors/all      -> InstituteController@getAllInstituteColors
GET  /phorest/institute/{branchId}/color -> InstituteController@getInstituteColor
POST /phorest/institute/{branchId}/color -> InstituteController@saveInstituteColor
```

### Frontend
- **Views:**
  - `resources/views/hub/institutes/index.blade.php` - Übersicht
  - `resources/views/hub/institutes/show.blade.php` - Detail mit Tabs
  - `resources/views/hub/institutes/tabs/info.blade.php`
  - `resources/views/hub/institutes/tabs/staff.blade.php`
  - `resources/views/hub/institutes/tabs/lasers.blade.php`
  - `resources/views/hub/institutes/tabs/metrics.blade.php`

- **Alpine.js Components:**
  - `instituteDetail()` - Hauptkomponente für Detail-Seite
  - `instituteColorPicker()` - Farbpicker-Komponente im Info-Tab
  - Lädt Daten dynamisch
  - Tab-Switching
  - Staff-Daten lazy loading

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

## Terminologie
- **Phorest:** "Branch"
- **glatttHub UI:** "Institut"
- **Code intern:** Beide Begriffe werden verwendet, aber User-facing ist "Institut"

## Zukünftige Erweiterungen
1. ~~**Institut-Bilder:** Upload und Anzeige von Institut-Fotos~~ ✅ Implementiert
2. **Google Maps Integration:** Standort-Karte im Info-Tab
3. **Laser-Verwaltung:** Geräte-Datenbank mit Wartungsplan
4. **Kennzahlen:** Echte Daten aus Phorest API
5. **Berichte:** Institut-spezifische Reports
6. **Öffnungszeiten:** Anzeige und Verwaltung der Geschäftszeiten
7. ~~**Standort-Farben:** Konfigurierbare Farben pro Institut~~ ✅ Implementiert
8. ~~**Standort-Reihenfolge:** Konfigurierbare Sortierung pro Institut~~ ✅ Implementiert
