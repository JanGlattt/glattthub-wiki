# glattt-Pakete Statistik

> Statistik-Modul für verkaufte Behandlungspakete aus Phorest

## Übersicht

Das **glattt-Pakete Statistik**-Modul zeigt Verkaufszahlen und Nutzung von Behandlungspaketen (Client Courses) aus dem Phorest-System. Es verbindet die Phorest-Daten mit den internen Körperzonen-Definitionen.

## Für Anwender

### Zugang

**Hub → Reports → glattt-Pakete**

### Funktionen

| Bereich | Beschreibung |
|---------|--------------|
| **KPI-Dashboard** | Aktive Pakete, Neue Pakete (Monat), Ø Resteinheiten, Körperzonen |
| **Monatliche Übersicht** | Tabelle mit Paketen, Einheiten und Körperzonen pro Monat |

### KPI-Erklärungen

| KPI | Bedeutung |
|-----|-----------|
| **Aktive Pakete** | Pakete mit verbleibenden Einheiten |
| **Neue Pakete** | Im aktuellen Monat verkauft |
| **Ø Resteinheiten** | Durchschnittliche verbleibende Einheiten pro aktivem Paket |
| **Körperzonen** | Summe der verkauften Körperpunktzonen im Monat |

### Körperzonen-Berechnung

Die Körperzonen werden aus den **Behandlungsservices** jedes Pakets berechnet:

1. Jedes Paket enthält 1-n Services (z.B. "Oberlippe", "Bikini")
2. Jedem Service sind Körperzonen zugeordnet (in `consultation_services`)
3. Die Summe aller Körperzonen pro Paket ergibt den Wert

**Beispiel:**
- Paket "Gesicht Komplett" enthält:
  - Oberlippe (1 KPZ)
  - Kinn (1 KPZ)
  - Wangen (1 KPZ)
- → 3 Körperzonen

### Filtern nach Standort

Über den globalen Branch-Filter in der Navigation können die Daten pro Standort gefiltert werden.

---

## Für Entwickler

### Architektur

```
┌──────────────────────────────────────────────────────────────┐
│                     client-courses.blade.php                  │
│  (Hauptseite mit Alpine.js x-data="clientCoursesStatsApp()") │
└──────────────────────┬───────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐    ┌───────────────────────────────────┐
│ KPI Dashboard    │    │ partials/client-courses-monthly   │
│ (Component)      │    │ (Monatliche Übersicht)            │
└──────────────────┘    └───────────────────────────────────┘
          │                         │
          └────────────┬────────────┘
                       ▼
          ┌────────────────────────┐
          │ client-courses-stats.js │
          │ (Alpine.js Komponente)  │
          └────────────┬───────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│ /client-courses/ │    │ /client-courses/ │
│ kpis (API)       │    │ monthly (API)    │
└──────────────────┘    └──────────────────┘
```

### Dateien

| Datei | Zweck |
|-------|-------|
| `resources/views/hub/reports/client-courses.blade.php` | Hauptseite |
| `resources/views/hub/reports/partials/client-courses-monthly.blade.php` | Monatliche Übersicht Partial |
| `public/js/client-courses-stats.js` | Alpine.js Komponente |
| `app/Http/Controllers/ReportController.php` | API-Methoden |

### API-Endpunkte

#### KPIs

```
GET /phorest/reports/client-courses/kpis
GET /phorest/reports/client-courses/kpis?branch_id=123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "active_packages": 1234,
    "new_this_month": 45,
    "new_month_change": 5,
    "avg_remaining_units": 8.5,
    "body_zones_this_month": 578,
    "current_month_label": "Feb"
  }
}
```

#### Monatliche Daten

```
GET /phorest/reports/client-courses/monthly
GET /phorest/reports/client-courses/monthly?branch_id=123&months=12
```

**Response:**
```json
{
  "success": true,
  "data": {
    "months": [
      {
        "month": "2026-02",
        "label": "Feb 26",
        "count": 310,
        "total_units": 2375,
        "total_body_zones": 578
      }
    ]
  }
}
```

### Datenbank-Schema

```sql
-- Haupttabelle: Pakete aus Phorest
stats_client_courses
├── id
├── phorest_id (Phorest Client Course ID)
├── client_id
├── purchasing_branch_id
├── purchase_date
├── total_initial_units
├── total_remaining_units
├── archived
└── synced_at

-- Items: Services innerhalb eines Pakets
stats_client_course_items
├── id
├── stats_client_course_id (FK)
├── service_id (→ consultation_services.service_id)
├── initial_units
├── remaining_units
└── service_name

-- Körperzonen-Mapping
consultation_services
├── service_id (Phorest Service ID)
├── service_name
├── body_zones (Anzahl KPZ)
└── ...
```

### Körperzonen-Query

Die Berechnung erfolgt über einen Join mit Subquery:

```php
// Body Zones Subquery: Summiere pro Course (nicht × Einheiten!)
$bodyZonesSubquery = DB::table('stats_client_course_items as sci')
    ->leftJoin('consultation_services as cs', 'sci.service_id', '=', 'cs.service_id')
    ->select('sci.stats_client_course_id', 
             DB::raw('COALESCE(SUM(cs.body_zones), 0) as body_zones_total'))
    ->groupBy('sci.stats_client_course_id');

// Hauptquery mit Join
$query = DB::table('stats_client_courses as scc')
    ->leftJoinSub($bodyZonesSubquery, 'bz', 'scc.id', '=', 'bz.stats_client_course_id')
    ->select([
        DB::raw("DATE_FORMAT(scc.purchase_date, '%Y-%m') as month"),
        DB::raw('COUNT(*) as count'),
        DB::raw('SUM(scc.total_initial_units) as total_units'),
        DB::raw('COALESCE(SUM(bz.body_zones_total), 0) as total_body_zones'),
    ])
    ->groupBy('month');
```

**Wichtig:** Die Körperzonen werden **pro Service** summiert, nicht mit den Einheiten multipliziert. Ein Paket mit 10 Einheiten für "Bikini (2 KPZ)" zählt als 2 Körperzonen, nicht 20.

### Alpine.js Komponente

```javascript
// public/js/client-courses-stats.js
function clientCoursesStatsApp() {
    return {
        // Status
        loading: false,
        error: null,
        
        // Daten
        kpis: null,
        monthlyData: null,
        
        // Methoden
        init() { ... },
        loadAllData() { ... },
        buildDashboardKpis() { ... },
        formatNumber(value) { ... }
    };
}
```

### Erweiterung: Neues Partial hinzufügen

1. Partial erstellen unter `resources/views/hub/reports/partials/`
2. In Hauptseite einbinden mit `@include('hub.reports.partials.xxx')`
3. Alpine.js-Daten über Parent-Scope verfügbar

**Beispiel:**
```php
{{-- In client-courses.blade.php --}}
<div x-show="!loading && someData" x-cloak>
    @include('hub.reports.partials.my-new-partial')
</div>
```

### Sync-Prozess

Die Daten werden automatisch synchronisiert:

```bash
# Manueller Sync
php artisan sync:client-courses --include-archived

# Automatisch: Täglich um 04:00 Uhr via Cron
```

---

## Changelog

### v1.0.0 (Februar 2026)

- ✨ Initiale Implementation
- ✨ KPI-Dashboard mit 4 Kennzahlen
- ✨ Monatliche Übersicht mit Körperzonen
- ✨ Branch-Filter Integration
- 📖 Dokumentation erstellt
