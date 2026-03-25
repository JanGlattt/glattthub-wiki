# Stornierte und gelöschte Termine - Dokumentation

## Übersicht

Die **Stornierte und gelöschte Termine Analyse** bietet eine umfassende Übersicht über Terminausfälle im System. Sie unterscheidet zwischen zwei Arten von abgesagten Terminen:

1. **Stornierte Termine** (orange): Termine mit `activation_state=CANCELED` - vom Kunden oder Mitarbeiter storniert
2. **Gelöschte Termine** (rot): Termine mit `deleted=true` - komplett aus dem System entfernt

## KPI-Dashboard ⭐ NEU

Das KPI-Dashboard zeigt die wichtigsten Kennzahlen auf einen Blick:

### KPIs (10 Stück)

| # | KPI | Format | Vergleiche |
|---|-----|--------|------------|
| 1 | Gelöschte Termine | Anzahl | % vs. Vormonat, % vs. Vorjahr |
| 2 | Löschquote | % | PP vs. Vormonat, PP vs. Vorjahr |
| 3 | Stornierte Termine | Anzahl | % vs. Vormonat, % vs. Vorjahr |
| 4 | Stornoquote | % | PP vs. Vormonat, PP vs. Vorjahr |
| 5 | Prognose Ausfälle | Anzahl | Hochrechnung auf Monatsende |
| 6 | Trend vs. Vormonat | % | Veränderung Gesamtausfälle |
| 7 | Trend vs. Vorjahr | % | Veränderung Gesamtausfälle |
| 8 | Gesamt-Ausfallquote | % | PP vs. Vormonat, PP vs. Vorjahr |
| 9 | Gesamt ausgefallen | Anzahl | Storniert + Gelöscht |
| 10 | Höchste Stornoquote* | % | PP vs. andere Standorte |

\* Nur bei "Alle Institute" sichtbar - zeigt den Standort mit der höchsten Stornoquote

### Vergleichslogik

- **Prozentpunkte (PP)**: Für Raten (Stornoquote, Löschquote)
  - Beispiel: 24,2% → 19,6% = -4,6 PP
- **Prozent (%)**: Für absolute Zahlen
  - Beispiel: 616 → 433 = -29,7%

### Fallback-Logik

Wenn für den aktuellen Monat noch keine Daten vorliegen (z.B. am 1. Februar), werden automatisch die Daten des Vormonats verwendet. Das Monatslabel im KPI zeigt den tatsächlich verwendeten Monat an.

## Features

### Zwei Analyse-Karten

#### 1. Stornierte Termine (Orange)
- Zeigt Termine die in Phorest als "storniert" markiert wurden
- Toggle zwischen **Absolute Anzahl** und **Stornoquote %**
- Expandierbare Monate mit Wochen-Aufschlüsselung
- Heatmap-Farbcodierung basierend auf Intensität

#### 2. Gelöschte Termine (Rot)
- Zeigt Termine die komplett aus dem System gelöscht wurden
- Monatliche Übersicht mit Standort-Breakdown
- Trend-Anzeige gegenüber Vormonat

### Gemeinsame Features

#### Heatmap-Visualisierung (Tabellenansicht)
- **Zeilen**: Monate (neueste zuerst)
- **Spalten**: Standorte (Institute)
- **Farbintensität**: Je dunkler, desto mehr Stornierungen
- **Gesamt-Spalte**: Aggregiert alle Standorte (bei mehreren)

#### Chart-Ansicht
- Gestapeltes Balkendiagramm nach Standorten
- Zeitlicher Verlauf (älteste links, neueste rechts)
- Legende mit Standort-Farben

#### Wochen-Expansion (nur Stornierte Termine)
- Klick auf einen Monat öffnet die Wochen-Details
- Zeigt Stornoquote pro Kalenderwoche
- Datumsbereich der Woche angezeigt (z.B. "06.01. - 12.01.")

#### Detail-Modal
- Klick auf eine Zelle öffnet Modal mit Terminliste
- Zeigt alle einzelnen stornierten/gelöschten Termine
- **Stornierte Termine**: Card-Layout mit Kunde, Services, Vorlaufzeit
- **Gelöschte Termine**: Tabellen-Layout mit Datum, Services, Wert
- Statistik-Karten: Anzahl, Stornoquote, Änderung vs. Vormonat/Vorjahr

### Intelligente Termin-Zählung

Ein "Termin" wird definiert als alle aufeinanderfolgenden Einträge eines Kunden am selben Tag beim selben Institut:
- Gruppierung: `client_id + appointment_date + branch_id = 1 Termin`
- **Teilstornierungen werden ausgeschlossen**: Nur Termine bei denen der Kunde KEINEN aktiven Termin mehr am selben Tag hat

### Integration mit Branch-Auswahl
- Reagiert auf die globale Branch-Auswahl im Header
- Zeigt Daten für alle Standorte oder einzelne Standorte
- Automatischer Reload bei Standort-Wechsel

## Technische Details

### Backend-Routes

| Route | Controller-Methode | Beschreibung |
|-------|-------------------|--------------|
| `GET /hub/reports/rescheduled-cancelled` | `rescheduledCancelled()` | Blade-View anzeigen |
| `GET /phorest/reports/cancelled-appointments/monthly` | `cancelledAppointmentsMonthly()` | Monatliche Aggregation (einzelner Typ) |
| `GET /phorest/reports/cancelled-appointments/monthly/combined` | `cancelledAppointmentsMonthlyCombined()` | **Kombinierter API-Call** für beide Typen |
| `GET /phorest/reports/cancelled-appointments/details` | `cancelledAppointmentsDetails()` | Einzelne Termine eines Monats |
| `POST /phorest/reports/cancelled-appointments/notes` | `cancelledAppointmentsNotes()` | Notizen für Termine laden |

### Lazy Loading Endpoints ⚡ NEU

| Route | Controller-Methode | Beschreibung |
|-------|-------------------|--------------|
| `GET /historic-appointments/cancelled-monthly/fast` | `cancelledMonthlyStatsFast()` | Nur Monatsdaten (schnell) |
| `GET /historic-appointments/cancelled-weekly` | `cancelledWeeklyForMonth()` | Wochendaten für einen Monat |
| `GET /historic-appointments/cancelled-weeks` | `cancelledWeeksForChart()` | Alle Wochen für Charts |
| `GET /historic-appointments/cancelled-days` | `cancelledDaysForChart()` | Alle Tage für Charts |

**Dokumentation:** [LAZY-LOADING-PERFORMANCE.md](LAZY-LOADING-PERFORMANCE.md)

### API-Parameter

#### `/cancelled-appointments/monthly/combined` ⭐ NEU
**Performance-optimierter Endpunkt** - lädt beide Datensätze in einem Aufruf.

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `branch_id` | string | - | Filter nach Standort |

**Response:**
```json
{
    "success": true,
    "data": {
        "deleted": { "months": [...], "type": "deleted" },
        "cancelled": { "months": [...], "type": "cancelled" },
        "branches": [...],
        "filter_branch_id": null
    }
}
```

#### `/cancelled-appointments/monthly`
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `type` | string | `deleted` | Art: `deleted` oder `cancelled` |
| `branch_id` | string | - | Filter nach Standort |

#### `/cancelled-appointments/details`
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `month` | string | required | Monat im Format `YYYY-MM` |
| `type` | string | `deleted` | Art: `deleted` oder `cancelled` |
| `branch_id` | string | - | Filter nach Standort |
| `week` | string | - | Optional: Kalenderwoche (YYYYWW) |

### Response-Format (monthly)
```json
{
    "success": true,
    "data": {
        "months": [
            {
                "month": "2026-01",
                "is_current": true,
                "cancelled_appointments": 45,
                "total_appointments": 850,
                "by_branch": {
                    "branch_id_1": {
                        "branch_id": "...",
                        "branch_name": "glattt Zürich",
                        "cancelled_appointments": 25,
                        "total_appointments": 450
                    }
                },
                "weeks": [
                    {
                        "week": 202604,
                        "week_number": 4,
                        "date_range": "20.01. - 26.01.",
                        "cancelled_appointments": 12,
                        "total_appointments": 210,
                        "by_branch": {...}
                    }
                ]
            }
        ],
        "branches": [
            {"branch_id": "...", "branch_name": "glattt Zürich"}
        ],
        "filter_branch_id": null,
        "type": "cancelled"
    }
}
```

### Response-Format (details)
```json
{
    "success": true,
    "data": {
        "total_count": 25,
        "cancellation_rate": 5.5,
        "change_vs_last_month": -12,
        "change_vs_last_year": 8,
        "appointments": [
            {
                "appointment_date": "2026-01-15",
                "start_time": "10:00",
                "branch_id": "...",
                "branch_name": "glattt Zürich",
                "client_id": "...",
                "cancelled_at": "2026-01-14T15:30:00Z",
                "lead_time_minutes": 1110,
                "services": [
                    {"name": "Beratungsgespräch", "duration": 30}
                ],
                "total_price": 0.00
            }
        ]
    }
}
```

### Frontend-Komponenten

#### Alpine.js Components
- `cancelledAppointmentsAnalysis()` - Für gelöschte Termine (deleted=true)
- `cancelledAppointmentsByCancelStateAnalysis()` - Für stornierte Termine (activation_state=CANCELED)

#### JavaScript-Datei
- `/public/js/cancelled-appointments-analysis.js` - Beide Komponenten

### Blade-Views

| Datei | Beschreibung |
|-------|--------------|
| `resources/views/hub/reports/rescheduled-cancelled.blade.php` | Haupt-View |
| `resources/views/hub/reports/partials/cancelled-appointments-by-state.blade.php` | Stornierte Termine Card |
| `resources/views/hub/reports/partials/cancelled-appointments-monthly.blade.php` | Gelöschte Termine Card |
| `resources/views/hub/reports/partials/cancelled-appointments-modal.blade.php` | Detail-Modal |

## Datenquelle

- **Tabelle**: `stats_historic_appointments`
- **Filter**: Nur Termine ab 01.01.2024 (davor war Einrichtungsphase)
- **Storniert**: `deleted = false AND activation_state = 'CANCELED'`
- **Gelöscht**: `deleted = true`

## Verwendung

### Navigation
1. Hub → Reports → "Stornierte und gelöschte Termine"
2. Oder direkt: `/hub/reports/rescheduled-cancelled`

### Interaktion

#### Ansicht wechseln
- **Tabelle/Chart**: Toggle-Buttons oben rechts in der Card
- **Anzahl/Stornoquote**: Toggle-Buttons in der Stornierten-Termine-Card

#### Details anzeigen
- Klick auf eine Heatmap-Zelle öffnet das Detail-Modal
- Modal zeigt alle Termine des Monats/der Woche für den gewählten Standort

#### Wochen expandieren (Stornierte Termine)
- Klick auf eine Monatszeile expandiert die Wochen-Details
- Erneuter Klick klappt sie wieder zu

## Design

### Farbschema
- **Stornierte Termine**: Orange (`#f97316`) - Warnung/Aufmerksamkeit
- **Gelöschte Termine**: Rot (`#ef4444`) - Kritisch/Danger
- **Heatmap**: Transparenz-basierte Intensität (0.15 - 0.85)

### Dark Mode
- Vollständig kompatibel mit Light/Dark Mode
- Verwendet CSS-Variablen für adaptive Farben

## Performance-Optimierung ⚡

### Problem (vor v1.3.0)
Die Seite machte **zwei separate API-Calls** für gelöschte und stornierte Termine:
1. `/cancelled-appointments/monthly?type=deleted` 
2. `/cancelled-appointments/monthly?type=cancelled`

Jeder Call führte 4 teure SQL-Queries aus:
- Query 1: Gesamtzahl aller Termine
- Query 2: Stornierte/Gelöschte Termine pro Monat
- Query 3: Wochen-Daten
- Query 4: Wochen-Totals mit `COUNT(DISTINCT CONCAT(...))` - **teuerste Query!**

**Ergebnis in Production:** 28-48 Sekunden Ladezeit (Cloud Run + Cloud SQL Latenz)

### Lösung: Kombinierter API-Endpunkt

Der neue `/cancelled-appointments/monthly/combined` Endpunkt:
1. **Lädt Branch-Namen nur einmal** (statt 2x Phorest API-Call)
2. **Führt Query 1 & 4 nur einmal aus** (statt 2x)
3. **Berechnet beide Datensätze in einem Durchgang**

```javascript
// VORHER: 2 API-Calls
fetch('/cancelled-appointments/monthly?type=deleted');
fetch('/cancelled-appointments/monthly?type=cancelled');

// NACHHER: 1 kombinierter API-Call
fetch('/cancelled-appointments/monthly/combined');
// → Returns: { deleted: {...}, cancelled: {...} }
```

### Erwartete Verbesserung
- **Lokal (MAMP):** ~1.5s → ~0.8s (-50%)
- **Production (Cloud Run):** ~28-48s → ~14-24s (-50%)

### Architektur

```
┌─────────────────────────────────────────────────────────────┐
│  cancelledAppointmentsPageApp (KPI Dashboard)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ loadCombinedData()                                      │ │
│  │   → fetch('/cancelled-appointments/monthly/combined')   │ │
│  │   → dispatch 'deletedAppointmentsLoaded' Event          │ │
│  │   → dispatch 'cancelledAppointmentsLoaded' Event        │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────┬───────────────────┘
                     │ Event              │ Event
                     ▼                    ▼
┌────────────────────────────┐  ┌──────────────────────────────┐
│ cancelledAppointmentsAnalysis │  │ cancelledAppointmentsByState │
│ (Gelöschte Termine)         │  │ (Stornierte Termine)         │
│ - Kein eigener API-Call     │  │ - Kein eigener API-Call      │
│ - Empfängt Daten via Event  │  │ - Empfängt Daten via Event   │
└────────────────────────────┘  └──────────────────────────────┘
```

## Verwandte Analysen

- **Buchungsvorlauf-Analyse** - Wie weit im Voraus werden Termine gebucht
- **Wochentag & Uhrzeit Analyse** - Beliebteste Buchungszeiten
- **Freie Slots Analyse** - Verfügbare Beratungsslots

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `app/Http/Controllers/ReportController.php` | Backend-Logik |
| `routes/web.php` | Route-Definitionen |
| `public/js/cancelled-appointments-page.js` | KPI-Dashboard Alpine.js |
| `public/js/cancelled-appointments-analysis.js` | Analyse-Komponenten Alpine.js |
| `public/css/theme_glattt.css` | Alle Styles (inkl. KPI-Dashboard) |
| `resources/views/hub/reports/rescheduled-cancelled.blade.php` | Haupt-View |
| `resources/views/hub/reports/partials/cancelled-appointments-*.blade.php` | Partial Views |
| `resources/views/components/kpi-dashboard.blade.php` | Wiederverwendbare KPI-Component |

## Changelog

### v1.4.0 (Februar 2026) - Lazy Loading
- ⚡ **Lazy Loading Endpoints** für Tabellen und Charts
- ⚡ Monate initial, Wochen/Tage on-demand
- ⚡ **~80% schnellere initiale Ladezeit** (1-3s statt 15-25s)
- ⚡ Frontend-Caching für bereits geladene Daten
- 📚 Siehe [LAZY-LOADING-PERFORMANCE.md](LAZY-LOADING-PERFORMANCE.md)

### v1.3.0 (Februar 2026) - Performance-Optimierung
- ⚡ **Kombinierter API-Endpunkt** `/cancelled-appointments/monthly/combined`
- ⚡ **~50% schnellere Ladezeit** durch gemeinsamen Server-Call
- ⚡ Teure Queries (Branch-Namen, Wochen-Totals) nur einmal ausgeführt
- ⚡ Besonders effektiv in Production (Cloud Run + Cloud SQL)
- ✅ Abwärtskompatibel - einzelne Endpunkte bleiben verfügbar

### v1.2.0 (Februar 2026)
- ✅ KPI-Dashboard mit 10 Kennzahlen
- ✅ Separate JS-Datei für Dashboard-Logik
- ✅ Standortvergleich (höchste Stornoquote)
- ✅ Prognose für Monatsende
- ✅ Prozentpunkte (PP) für Raten-Vergleiche
- ✅ Fallback auf Vormonat wenn keine aktuellen Daten
- ✅ Integration in Reports-Übersichtsseite

### v1.1.0 (Januar 2026)
- ✅ Detail-Modal mit Notizen-Funktion
- ✅ Wochen-Expansion

### v1.0.0 (Januar 2026)
- ✅ Initiale Implementierung
- ✅ Heatmap und Chart-Visualisierung
- ✅ Branch-Filterung
