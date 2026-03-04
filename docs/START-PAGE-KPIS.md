# 📊 Start-Page KPI-System

**Version:** 1.0  
**Letzte Aktualisierung:** März 2026

Das KPI-System der Startseite ermöglicht es Admins, aus einem Portfolio von **19 Kennzahlen** individuell auszuwählen, welche KPIs auf ihrer Startseite angezeigt werden. Die Darstellung verwendet das `stats-card-glattt` Design-System, einheitlich mit den Report-Seiten.

→ Übergeordnete Dokumentation: [Startseite](START-PAGE.md)

---

## 📁 Dateien

| Datei | Beschreibung |
|-------|--------------|
| `app/Http/Controllers/StartPageController.php` | KPI-Portfolio, Aggregation, Speichern |
| `app/Models/StartPageConfig.php` | `selected_kpis` JSON-Feld |
| `resources/views/hub/start/_card-kpis.blade.php` | KPI-Karte mit stats-card-glattt |
| `resources/views/hub/start/_modal-kpi-config.blade.php` | KPI-Auswahl-Modal |
| `public/js/start.js` | Alpine.js Methoden für Laden, Portfolio, Speichern |
| `public/css/theme_glattt.css` | stats-card-glattt + KPI-Config-Modal Styles |

---

## 🏗️ Architektur

### Datenfluss

```
┌──────────────────────┐          ┌──────────────────────────────┐
│  Browser (Alpine.js)  │          │  Server (Laravel)             │
│                       │          │                               │
│  loadKpiData()        │──GET────▶│  StartPageController          │
│  fetch /hub/start-kpis│          │    getKpis($request)          │
│                       │◀─JSON───│      │                        │
│                       │          │      ▼                        │
│                       │          │  ReportController (direkt)    │
│                       │          │    ├─ reportsOverviewKpis()   │
│                       │          │    ├─ upcomingConsultationsKpi│
│                       │          │    ├─ appointmentsBodyZonesKpi│
│                       │          │    └─ clientCoursesKpis()     │
│                       │          │                               │
│  KPI Config Modal     │──GET────▶│  getKpiPortfolio()            │
│  loadKpiPortfolio()   │◀─JSON───│                               │
│                       │          │                               │
│  saveSelectedKpis()   │──POST───▶│  saveSelectedKpis()           │
│                       │◀─JSON───│    → DB: selected_kpis        │
└──────────────────────┘          └──────────────────────────────┘
```

!!! important "Kein HTTP-Loopback"
    Die KPI-Daten werden **nicht** über interne HTTP-Requests geladen, sondern durch **direkten Methodenaufruf** auf dem `ReportController`. Dies verhindert Deadlocks und Session-Konflikte bei Single-Threaded PHP-Servern (z.B. MAMP).

```php
// Statt: Http::get('/phorest/reports/overview-kpis')
// Besser: Direkte Method-Invocation
$reportController = app(ReportController::class);
$response = $reportController->reportsOverviewKpis($request);
$rawData['overview-kpis'] = json_decode($response->getContent(), true);
```

---

## 📡 API-Endpoints

### `GET /hub/start-kpis`

Liefert die KPI-Daten für die vom Benutzer ausgewählten KPIs.

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `branch_id` | string (optional) | Phorest Branch-ID. Leer = alle Institute |

**Response:**

```json
{
    "success": true,
    "data": {
        "kpis": [
            {
                "id": "upcoming_today",
                "label": "Beratungen heute",
                "icon": "calendar",
                "iconColor": "primary",
                "value": "12",
                "comparison": {
                    "value": 15.3,
                    "trend": "up",
                    "label": "vs. Vormonat"
                }
            }
        ],
        "selectedKpis": ["upcoming_today", "avg_per_day", "appointments_current", "treatments"]
    }
}
```

**Optimierung:** Es werden nur die Quell-Endpunkte aufgerufen, die mindestens eine ausgewählte KPI enthalten. Wenn z.B. nur KPIs aus `upcoming-kpi` ausgewählt sind, werden die anderen 3 Endpoints nicht aufgerufen.

---

### `GET /hub/start-kpis/portfolio`

Liefert das vollständige KPI-Portfolio für das Konfigurations-Modal.

**Response:**

```json
{
    "success": true,
    "data": {
        "portfolio": [
            {
                "id": "avg_per_day",
                "label": "Ø Termine/Tag",
                "icon": "calendar",
                "iconColor": "primary",
                "category": "Terminstatistik",
                "selected": false
            }
        ],
        "selectedKpis": ["upcoming_today", "avg_per_day"]
    }
}
```

---

### `POST /hub/start-kpis/save`

Speichert die KPI-Auswahl des Benutzers.

**Request Body:**

```json
{
    "selectedKpis": ["upcoming_today", "avg_per_day", "treatments", "active_packages"]
}
```

**Validierung:**

| Regel | Beschreibung |
|-------|--------------|
| `min:1` | Mindestens 1 KPI muss ausgewählt sein |
| `max:8` | Maximal 8 KPIs erlaubt |
| ID-Check | Alle IDs müssen im `KPI_PORTFOLIO` existieren |

---

## 📊 KPI-Portfolio

### Übersicht aller 19 KPIs

Das Portfolio ist in 4 Kategorien gruppiert, jeweils einer Datenquelle zugeordnet:

#### Terminstatistik

| ID | Label | Icon | Farbe | Quelle |
|----|-------|------|-------|--------|
| `avg_per_day` | Ø Termine/Tag | calendar | primary | `reportsOverviewKpis()` |
| `avg_duration` | Ø Termindauer | clock | info | `reportsOverviewKpis()` |
| `avg_body_zones` | Ø Körperzonen | sparkles | primary | `reportsOverviewKpis()` |
| `flex_services` | Flex-Services | bolt | info | `reportsOverviewKpis()` |

#### Zukünftige Termine

| ID | Label | Icon | Farbe | Quelle |
|----|-------|------|-------|--------|
| `upcoming_today` | Beratungen heute | calendar | primary | `upcomingConsultationsKpi()` |
| `upcoming_7d` | Geplant (7 Tage) | calendar | primary | `upcomingConsultationsKpi()` |
| `upcoming_14d` | Geplant (14 Tage) | calendar | info | `upcomingConsultationsKpi()` |
| `upcoming_28d` | Geplant (28 Tage) | calendar | secondary | `upcomingConsultationsKpi()` |

#### Monatsstatistik

| ID | Label | Icon | Farbe | Quelle |
|----|-------|------|-------|--------|
| `appointments_current` | Termine gesamt (Monat) | chart-bar | primary | `appointmentsBodyZonesKpi()` |
| `consultations` | Beratungsgespräche (Monat) | users | info | `appointmentsBodyZonesKpi()` |
| `treatments` | Behandlungen (Monat) | sparkles | success | `appointmentsBodyZonesKpi()` |
| `consultation_with_treatment` | Beratung + Behandlung (Monat) | check-circle | primary | `appointmentsBodyZonesKpi()` |
| `no_shows_consultations` | No Shows Beratungen (Monat) | x-circle | warning | `appointmentsBodyZonesKpi()` |
| `no_shows_treatments` | No Shows Behandlungen (Monat) | x-circle | danger | `appointmentsBodyZonesKpi()` |

#### glattt-Pakete

| ID | Label | Icon | Farbe | Quelle |
|----|-------|------|-------|--------|
| `active_packages` | Aktive Pakete | star | success | `clientCoursesKpis()` |
| `new_this_month` | Neue Pakete (Monat) | star | primary | `clientCoursesKpis()` |
| `avg_remaining` | Ø Resteinheiten | chart-bar | info | `clientCoursesKpis()` |

---

## 🎨 Darstellung

### stats-card-glattt Design

Jede KPI wird als `stats-card-glattt` Karte dargestellt — identisch zum Design auf den Report-Seiten:

```html
<div class="stats-card-glattt" style="padding: 1rem;">
    <!-- Header: Label + Icon -->
    <div class="stats-card-header" style="margin-bottom: 0.5rem;">
        <span class="stats-card-label">Beratungen heute</span>
        <div class="stats-card-icon">
            <svg style="color: var(--color-primary)">...</svg>
        </div>
    </div>
    
    <!-- Wert -->
    <div class="stats-card-value" style="font-size: 1.5rem;">12</div>
    
    <!-- Footer: Trend + Beschreibung -->
    <div class="stats-card-footer">
        <span class="stats-card-trend stats-card-trend-up">
            <svg>↗</svg> +15.3%
        </span>
        <span class="stats-card-description">vs. Vormonat</span>
    </div>
</div>
```

### Grid-Layout

Die KPIs werden in einem responsiven 4-Spalten-Grid dargestellt:

```html
<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <!-- 1–8 KPI-Karten -->
</div>
```

### Icons

9 verschiedene Heroicons (Outline) werden dynamisch per `x-if` gerendert:

| Icon-Name | Verwendung bei |
|-----------|---------------|
| `calendar` | Termine, Beratungen, Zeiträume |
| `clock` | Dauer |
| `sparkles` | Körperzonen, Behandlungen |
| `bolt` | Flex-Services |
| `chart-bar` | Gesamtstatistiken, Resteinheiten |
| `users` | Beratungsgespräche |
| `check-circle` | Beratung + Behandlung |
| `x-circle` | No Shows |
| `star` | Pakete |

### Icon-Farben

Die Icon-Farbe wird dynamisch über CSS-Variablen gesetzt:

```html
<svg :style="'color: var(--color-' + (kpi.iconColor || 'primary') + ')'">
```

| `iconColor` | CSS-Variable |
|-------------|-------------|
| `primary` | `--color-primary` |
| `secondary` | `--color-secondary` |
| `info` | `--color-info` |
| `success` | `--color-success` |
| `warning` | `--color-warning` |
| `danger` | `--color-danger` |

### Trend-Vergleich

Wenn eine KPI über `comparison`-Daten verfügt, wird ein Trend-Badge angezeigt:

| Trend | Klasse | Farbe |
|-------|--------|-------|
| `up` | `stats-card-trend-up` | Grün |
| `down` | `stats-card-trend-down` | Rot |

Trend-Daten werden aktuell für folgende Quellen berechnet:

- **overview-kpis**: Direkt aus der API-Response
- **body-zones-kpi**: `(current - previous) / previous * 100` (vs. Vormonat)

---

## ⚙️ Konfigurations-Modal

### Aufruf

Der Benutzer öffnet das Modal über den **Zahnrad-Button** in der KPI-Karten-Header-Leiste. Das Portfolio wird beim ersten Öffnen per `$watch('showKpiConfigModal')` automatisch geladen.

### Aufbau

```
┌──────────────────────────────────────────────┐
│  KPIs konfigurieren                          │
│  Wähle bis zu 8 KPIs aus...                  │
│                                              │
│  📊 TERMINSTATISTIK                          │
│  ┌──────────┐┌──────────┐┌──────────┐       │
│  │☑ Ø Ter/Tag││□ Ø Dauer ││□ Ø Körperz│      │
│  └──────────┘└──────────┘└──────────┘       │
│                                              │
│  📅 ZUKÜNFTIGE TERMINE                       │
│  ┌──────────┐┌──────────┐┌──────────┐       │
│  │☑ Heute   ││□ 7 Tage  ││□ 14 Tage │       │
│  └──────────┘└──────────┘└──────────┘       │
│                                              │
│  ... weitere Kategorien ...                  │
│                                              │
│                          3 / 8 ausgewählt    │
│             [Abbrechen]  [Speichern]         │
└──────────────────────────────────────────────┘
```

### Verhalten

| Feature | Beschreibung |
|---------|--------------|
| **Max 8 KPIs** | Ab 8 ausgewählten werden weitere Items deaktiviert (`.start-kpi-config-item-disabled`) |
| **Counter** | Zeigt `X / 8 ausgewählt` an |
| **Kategorien** | Automatisch gruppiert nach `category` aus dem Portfolio |
| **Lazy Loading** | Portfolio wird erst beim ersten Öffnen geladen |
| **Pending State** | Änderungen werden erst bei „Speichern" übernommen (kein Live-Update) |
| **Speichern** | POST → `/hub/start-kpis/save`, danach Reload der KPI-Karte |

### CSS-Klassen

| Klasse | Beschreibung |
|--------|--------------|
| `.start-add-modal-wide` | Breiterer Modal-Container (36rem statt 28rem) |
| `.start-kpi-config-categories` | Scrollbare Kategorie-Liste (max-height: 24rem) |
| `.start-kpi-config-category-title` | Kategorie-Überschrift (uppercase, 0.75rem) |
| `.start-kpi-config-grid` | Responsive Grid (min 12rem, auto-fill) |
| `.start-kpi-config-item-disabled` | Deaktivierter Zustand (opacity: 0.4) |
| `.start-kpi-config-counter` | Auswahl-Zähler |

---

## 🔢 Berechnungslogik

### Quell-Endpunkte (ReportController)

Die KPI-Werte stammen aus 4 bestehenden Report-Endpunkten:

#### 1. `reportsOverviewKpis()` → Terminstatistik

Server-seitige Berechnung mit Phorest-API-Daten:

| KPI | Berechnung |
|-----|------------|
| `avg_per_day` | Alle Termine des Monats ÷ Arbeitstage |
| `avg_duration` | Summe Termindauer ÷ Anzahl Termine |
| `avg_body_zones` | Summe Körperzonen ÷ Anzahl Termine |
| `flex_services` | Anzahl Termine mit Flex-Service-Flag |

Liefert auch `comparison`-Daten (vs. Vormonat).

#### 2. `upcomingConsultationsKpi()` → Zukünftige Termine

Parallele Phorest-Appointment-Abfragen:

| KPI | Berechnung |
|-----|------------|
| `upcoming_today` | Beratungsgespräche mit `appointmentDate === heute` |
| `upcoming_7d` | Beratungsgespräche heute → +6 Tage |
| `upcoming_14d` | Beratungsgespräche heute → +13 Tage |
| `upcoming_28d` | Beratungsgespräche heute → +27 Tage |

#### 3. `appointmentsBodyZonesKpi()` → Monatsstatistik

| KPI | Berechnung |
|-----|------------|
| `appointments_current` | Alle Termine im aktuellen Monat |
| `consultations` | Davon: Beratungsgespräche |
| `treatments` | Davon: Behandlungen |
| `consultation_with_treatment` | Davon: Beratung + Behandlung am gleichen Tag |
| `no_shows_consultations` | No-Shows bei Beratungen |
| `no_shows_treatments` | No-Shows bei Behandlungen |

Liefert `current` und `previous` (Vormonat) für Trend-Berechnung.

#### 4. `clientCoursesKpis()` → glattt-Pakete

| KPI | Berechnung |
|-----|------------|
| `active_packages` | Pakete mit Status = aktiv |
| `new_this_month` | Pakete erstellt im aktuellen Monat |
| `avg_remaining` | Durchschnittliche Resteinheiten aller aktiven Pakete |

### Wert-Extraktion

Der Controller mappt die Rohwerte der Quell-Endpunkte auf die jeweiligen KPI-IDs:

```php
private function extractKpiValue(string $kpiId, string $source, array $rawData): string
{
    switch ($source) {
        case 'overview-kpis':
            // KPI-Array mit 'id' durchsuchen
            foreach ($data['data']['kpis'] as $kpi) {
                if ($kpi['id'] === $kpiId) return (string) $kpi['value'];
            }
            
        case 'upcoming-kpi':
            // Direkte Keys: today, days_7, days_14, days_28
            return match($kpiId) {
                'upcoming_today' => (string) $d['today'],
                'upcoming_7d'    => (string) $d['days_7'],
                // ...
            };
            
        case 'body-zones-kpi':
            // Nested: stats[field][current]
            return match($kpiId) {
                'appointments_current' => (string) $stats['appointments']['current'],
                'treatments'           => (string) $stats['treatments']['current'],
                // ...
            };
    }
}
```

---

## 🔄 Defaults

### Standard-KPIs für neue Benutzer

Wenn kein `selected_kpis` in der DB vorhanden ist, werden diese 4 KPIs angezeigt:

| ID | Label | Kategorie |
|----|-------|-----------|
| `upcoming_today` | Beratungen heute | Zukünftige Termine |
| `avg_per_day` | Ø Termine/Tag | Terminstatistik |
| `appointments_current` | Termine gesamt (Monat) | Monatsstatistik |
| `treatments` | Behandlungen (Monat) | Monatsstatistik |

### Datenquellen-Optimierung

Bei den Standard-KPIs werden 3 von 4 Quell-Endpunkten aufgerufen:

- ✅ `overview-kpis` (für `avg_per_day`)
- ✅ `upcoming-kpi` (für `upcoming_today`)
- ✅ `body-zones-kpi` (für `appointments_current`, `treatments`)
- ❌ `client-courses` (nicht benötigt → wird übersprungen)

---

## 🔗 Verwandte Dokumentation

- [Startseite](START-PAGE.md) — Übergeordnete Start-Page-Dokumentation
- [Reports-Modul](REPORTS-MODULE.md) — Quell-Endpunkte für KPI-Daten
- [Design System](DESIGN-SYSTEM.md) — `stats-card-glattt`, `stats-card-trend-*` Klassen
- [Dashboard KPIs](DASHBOARD-KPIS.md) — Altes Dashboard-KPI-System (Vorgänger)
