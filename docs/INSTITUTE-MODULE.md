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
- Kontaktdaten (Name, Adresse, Telefon, E-Mail, Website)
- **Standort-Farbe:** Konfigurierbarer Farbpicker mit:
  - 12 vordefinierten Farben als Schnellauswahl
  - Freier Farbwähler (nativer Color-Picker)
  - Hex-Code Eingabefeld
  - Sofortige Vorschau der gewählten Farbe
  - Die Farbe wird in allen Statistik-Seiten und auf der Übersichtsseite konsistent verwendet
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
Jedes Institut kann eine individuelle Farbe erhalten, die in allen Diagrammen und Statistik-Seiten konsistent verwendet wird:

1. Institut-Detailseite öffnen → Info-Tab
2. Im Bereich „Standort-Farbe" eine der 12 vordefinierten Farben wählen oder über den Farbpicker eine beliebige Farbe auswählen
3. „Farbe speichern" klicken
4. Die Farbe wird sofort auf allen Statistik-Seiten aktiv (Terminstatistiken, Buchungsvorlauf, Freie-Slots, Stornierungen, Auslastung, Wochentag-/Uhrzeitanalyse)

#### Für Entwickler

**Architektur:**

| Komponente | Datei | Beschreibung |
|---|---|---|
| Model | `app/Models/InstituteColor.php` | Eloquent-Model mit Cache-Logik (5 Min.) |
| Controller | `app/Http/Controllers/InstituteController.php` | 3 API-Methoden (getAll, get, save) |
| Migration | `database/migrations/2026_03_23_...` | `institute_colors` Tabelle |
| JS-Service | `public/js/branch-color-service.js` | Zentraler Client-Service |
| Color Picker UI | `resources/views/hub/institutes/tabs/info.blade.php` | Alpine.js Farbpicker |
| CSS | `public/css/theme_glattt.css` | `.institute-color-*` Klassen |

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

**Produktiv-SQL:** `database/data/production-sql-institute-colors.sql`

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
