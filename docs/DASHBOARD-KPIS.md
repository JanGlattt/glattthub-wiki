# 📊 Dashboard KPIs

**Version:** 1.0  
**Letzte Aktualisierung:** März 2026

Das Dashboard (Startseite) zeigt drei Live-KPI-Karten mit Daten aus der Phorest API, eine News-Sektion und einen Quick Actions Bereich.

---

## 📁 Dateien

| Datei | Beschreibung |
|-------|--------------|
| `app/Http/Controllers/DashboardKpisController.php` | Aggregierter API-Endpoint für alle Dashboard-KPIs |
| `resources/views/hub/dashboard.blade.php` | Blade Template mit KPI-Cards, News & Quick Actions |
| `public/js/dashboard.js` | Client-seitige KPI-Lade- und Anzeigefunktionen (IIFE) |
| `public/css/theme_glattt.css` | Icon-Klassen (`.icon-glattt`-System) |
| `public/css/hub.css` | Dashboard-spezifische Styles |

---

## 🏗️ Architektur

### Übersicht

```
Browser                          Server
┌──────────────────┐     ┌─────────────────────────────┐
│ dashboard.blade   │────▶│ DashboardKpisController      │
│ + dashboard.js    │◀────│   ├─ branches (1h Cache)     │
│                   │     │   ├─ consultationServiceIds   │
│ Inline <script>   │     │   ├─ news (DB)               │
│ → initializeDash  │     │   └─ Phorest KPIs (2min)     │
│ → fetch /phorest/ │     │       └─ getAppointments      │
│   dashboard-kpis  │     │           Parallel()          │
└──────────────────┘     └─────────────────────────────┘
```

### Datenfluss

1. **Blade Template** wird geladen (Livewire SPA oder voller Page Load)
2. **Inline `<script>`** in `@push('scripts')` ruft `initializeDashboard()` auf
3. **dashboard.js** fetcht `GET /phorest/dashboard-kpis?branch_id=...`
4. **DashboardKpisController** aggregiert:
    - Branches + Institute-Bilder (1h Cache)
    - Consultation Service IDs (1h Cache)
    - Phorest Appointment KPIs (2min Cache, parallel)
    - News (direkt aus DB)
5. **Client** rendert Daten in die DOM-Elemente

---

## 📡 API-Endpoint

### `GET /phorest/dashboard-kpis`

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `branch_id` | string (optional) | Phorest Branch-ID. Leer = alle Institute |

**Response:**

```json
{
  "success": true,
  "data": {
    "branches": [...],
    "consultationServiceIds": ["sid_1", "sid_2"],
    "news": [...],
    "consultationsToday": 18,
    "consultationsNext28Days": 94,
    "consultationsRestOfWeek": 42,
    "noShowRate": {
      "rate": 26,
      "noShows": 9,
      "total": 35
    },
    "timestamp": "2026-03-03T18:00:00+01:00"
  }
}
```

---

## 📈 KPI-Karten

### 1. Beratungsgespräche Heute

| Eigenschaft | Wert |
|-------------|------|
| **DOM-ID** | `dashboard-consultations-today` |
| **Label-ID** | `dashboard-consultations-label` |
| **Trend-ID** | `dashboard-consultations-trend` |
| **Berechnung** | Alle Appointments mit `appointmentDate === heute` |
| **Trend** | „X weitere diese Woche" (morgen → Sonntag) |
| **Gradient** | Teal → Green |

### 2. Beratungen nächste 28 Tage

| Eigenschaft | Wert |
|-------------|------|
| **DOM-ID** | `dashboard-next28-count` |
| **Label-ID** | `dashboard-next28-label` |
| **Info-ID** | `dashboard-next28-info` |
| **Berechnung** | Heute → heute+27 Tage (28 Tage inkl. heute) |
| **Info** | „⌀ X pro Woche" (Gesamtzahl ÷ 4) |
| **Gradient** | Green → Turquoise |

### 3. No Show Rate

| Eigenschaft | Wert |
|-------------|------|
| **DOM-ID** | `dashboard-noshow-rate` |
| **Label-ID** | `dashboard-noshow-label` |
| **Info-ID** | `dashboard-noshow-info` |
| **Berechnung** | Monatsanfang → heute, nur Beratungsgespräche |
| **Info** | „X von Y Beratungsgesprächen" |
| **Gradient** | Turquoise → Teal (light) |

---

## 🔢 Berechnungslogik

!!! important "Identisch mit Reports-Seite"
    Die KPI-Berechnung im Dashboard verwendet **exakt die gleiche Logik** wie `ReportController::upcomingConsultationsKpi`, um konsistente Zahlen zu gewährleisten.

### Appointment-Filter

```php
// Nur auf serviceId prüfen (kein allServiceIds)
if (!isset($apt['serviceId']) || !in_array($apt['serviceId'], $consultationServiceIds)) {
    continue;
}

// CANCELLED rausfiltern
if (isset($apt['state']) && $apt['state'] === 'CANCELLED') {
    continue;
}
```

### 28-Tage-Grenze

```php
$day28End = $now->copy()->addDays(27)->endOfDay(); // 28 Tage inkl. heute

if ($appointmentDate->lte($day28End)) {
    $consultationsNext28Days++;
}
```

### No-Show-Erkennung

| Status | Bedingung | Ergebnis |
|--------|-----------|----------|
| `PAID` | – | Show ✅ |
| `BOOKED` / `CONFIRMED` | Termin in der Vergangenheit | No-Show ❌ |
| `BOOKED` / `CONFIRMED` | Termin heute, > 30 Min nach Ende | No-Show ❌ |
| `BOOKED` / `CONFIRMED` | Termin heute, < 30 Min nach Ende | Noch nicht bewertbar |
| `CANCELLED` | – | Ignoriert |

---

## 🚀 Quick Actions

Fünf Schnellzugriff-Links unter den KPI-Karten:

| Aktion | Icon-Klasse | Ziel |
|--------|-------------|------|
| Beratungen | `icon-chat-bubble` | `/beratungen` |
| Kunden | `icon-users` | `/kunden` |
| Reports | `icon-chart-bar` | `/reports` |
| Gutscheine | `icon-ticket` | `/gutscheine` |
| Institute | `icon-storefront` | `/institute` |

Alle Icons verwenden das `.icon-glattt`-System aus `theme_glattt.css`:

```html
<span class="icon-glattt icon-glattt-sm icon-chat-bubble"></span>
```

---

## 🔄 Caching-Strategie

### Server-Cache (Laravel)

| Cache-Key | TTL | Inhalt |
|-----------|-----|--------|
| `phorest_branches` | 1 Stunde | Branches mit Institute-Bildern |
| `consultation_service_ids` | 1 Stunde | Aktive Beratungs-Service-IDs |
| `dashboard_phorest_kpis_{branchId}` | 2 Minuten | Alle KPI-Werte pro Branch |

### Client-Cache (localStorage)

| Key | TTL | Inhalt |
|-----|-----|--------|
| `dashboard_kpis_cache` | 2 Minuten | Letzte KPI-Response inkl. `branchId` |

**Verhalten:** Gecachte Daten werden sofort angezeigt, während im Hintergrund frische Daten geladen werden. Nach Laden werden die UI-Elemente aktualisiert.

---

## 🔌 Livewire SPA-Kompatibilität

!!! note "Architektur-Entscheidung"
    Da Livewire bei SPA-Navigation (`wire:navigate`) externe `<script src="...">` nur einmal lädt (nicht bei jedem Seitenwechsel), wurde eine spezielle Initialisierungsarchitektur gewählt.

### Aufbau

1. **`dashboard.js`** = reine Funktionsdefinitionen (IIFE)
    - Definiert alle Funktionen innerhalb einer IIFE
    - Exponiert sie auf `window.*` am Ende
    - **Kein** `DOMContentLoaded`, kein Self-Init, keine Event-Listener

2. **Inline `<script>` in Blade** = Initialisierung
    - Steht in `@push('scripts')`
    - Wird von Livewire bei **jedem** SPA-Navigationsvorgang neu ausgeführt
    - Ruft `window.initializeDashboard()` mit Retry-Schleife auf
    - Verwaltet `branchChanged` Event-Listener (entfernt alten, fügt neuen hinzu)
    - Registriert `resize` Listener nur einmal

### Exponierte Funktionen

```javascript
window.initializeDashboard         // Haupt-Initialisierung
window.loadDashboardKpis           // KPI-Daten laden
window.showDashboardLoadingState   // Lade-Spinner anzeigen
window.showDashboardErrorState     // Fehlerzustand anzeigen
window.updateDashboardLocationName // Standort-Name + Hero-Bild aktualisieren
window.equalizeKPIHeaderHeights    // KPI-Header-Höhen angleichen
window.onDashboardBranchChanged    // Branch-Wechsel-Handler
```

---

## 🏪 Branch/Standort-Auswahl

Die Standort-Auswahl erfolgt über die Sidebar. Der ausgewählte Branch wird in `localStorage` gespeichert.

| localStorage-Key | Wert |
|------------------|------|
| `selectedBranch` | Phorest Branch-ID oder leer (= alle) |

Bei Branch-Wechsel wird das Custom Event `branchChanged` auf `window` dispatched, worauf das Dashboard:

1. Den Standort-Namen im Hero aktualisiert
2. Das Hero-Bild des Instituts setzt (falls vorhanden)
3. Lade-Spinner anzeigt
4. Frische KPIs für den neuen Branch lädt

---

## 🗞️ News-Sektion

News werden über Alpine.js (`x-data`) verwaltet:

- Werden beim KPI-Laden mitgeliefert (Event `dashboardNewsLoaded`)
- Maximal 3 News pro Branch (oder global wenn kein Branch gewählt)
- Modal-Ansicht für vollständige News (mit `x-teleport` zum Body)
- Filterung: Branch-spezifisch oder `institute_ids = null / []` (global)

---

## 📐 DOM-Struktur

```
#dashboard-hero
├── #dashboard-hero-overlay
├── #dashboard-background-image
├── .card-glattt-body (Greeting + Date)
└── #dashboard-location-badge

.dashboard-featured-kpis
├── .stats-card-featured (Beratungen Heute)
│   ├── #dashboard-consultations-label
│   ├── #dashboard-consultations-today
│   └── #dashboard-consultations-trend
├── .stats-card-featured (28 Tage)
│   ├── #dashboard-next28-label
│   ├── #dashboard-next28-count
│   └── #dashboard-next28-info
└── .stats-card-featured (No Show Rate)
    ├── #dashboard-noshow-label
    ├── #dashboard-noshow-rate
    └── #dashboard-noshow-info

.quick-actions-grid
└── 5x .action-pill (Beratungen, Kunden, Reports, Gutscheine, Institute)

.news-section (Alpine.js x-data)
└── News-Cards + Modal
```
