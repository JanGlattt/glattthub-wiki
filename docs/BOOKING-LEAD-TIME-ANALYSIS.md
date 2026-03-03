# Buchungsvorlauf-Analyse - Dokumentation

## Übersicht

Die **Buchungsvorlauf-Analyse** ist eine Heatmap-Visualisierung, die zeigt, wie viele Tage im Voraus Beratungstermine gebucht werden. Sie hilft dabei zu verstehen, wann Kunden typischerweise ihre Termine buchen - ob spontan oder langfristig geplant.

## Features

### Heatmap-Visualisierung
- **Y-Achse**: Wochentage (Montag - Samstag)
- **X-Achse**: Uhrzeiten (8:00 - 20:00)
- **Farbintensität**: Je dunkler die Zelle, desto länger der Vorlauf in Tagen
- **Werte**: Durchschnittlicher/Median-Vorlauf in Tagen pro Slot

### Zeitraum-Filter
- Letzte 3 Monate
- Letzte 6 Monate (Standard)
- Letzte 12 Monate
- Alle Daten
- Benutzerdefinierter Zeitraum

### Buchungstyp-Filter
- **Beides**: Online + Offline Buchungen
- **Online**: Nur Online-Buchungen
- **Offline**: Nur Offline-Buchungen (Telefon/vor Ort)

### Aggregations-Modus
- **Durchschnitt**: Mittlerer Vorlauf in Tagen
- **Median**: Median-Vorlauf (robuster gegen Ausreißer)

### Ansichts-Modi
- **Gesamt**: Alle Standorte aggregiert
- **Standorte**: Jeder Standort als eigene Mini-Heatmap (farblich unterschieden)

### Automatische Insights
Das System analysiert automatisch:
- **Ø Vorlauf**: Gesamter Durchschnitt/Median aller Buchungen
- **Längster Vorlauf Tag**: Der Wochentag mit dem längsten Buchungsvorlauf
- **Kürzester Vorlauf Tag**: Der Wochentag mit dem kürzesten Vorlauf (spontane Buchungen)
- **Früheste Buchungen**: Der Slot (Tag + Uhrzeit) mit dem längsten Vorlauf

### Integration mit Branch-Auswahl
- Reagiert auf die globale Branch-Auswahl im Header
- Zeigt Daten für alle Standorte oder einzelne Standorte
- Automatischer Reload bei Standort-Wechsel

## Technische Details

### Backend
- **Route**: `GET /phorest/reports/booking-lead-time-analysis`
- **Controller**: `ReportController::bookingLeadTimeAnalysis()`
- **Datenquelle**: `stats_historic_appointments` Tabelle
- **Filter**: Nur `activation_state = 'ACTIVE'` Termine

### Berechnung des Vorlaufs
```php
$leadTimeDays = $createdAt->startOfDay()->diffInDays($appointmentDateTime->startOfDay(), false);
```
- `created_at_phorest`: Zeitpunkt der Buchung
- `appointment_date + start_time`: Zeitpunkt des Termins
- Nur positive Werte (Buchung vor dem Termin)

### Parameter
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `period` | string | `6m` | Zeitraum: `3m`, `6m`, `12m`, `all`, `custom` |
| `start_date` | date | - | Benutzerdefinierter Start (YYYY-MM-DD) |
| `end_date` | date | - | Benutzerdefiniertes Ende (YYYY-MM-DD) |
| `branch_id` | string | - | Filter nach Standort |
| `booking_type` | string | `all` | Buchungstyp: `all`, `online`, `offline` |
| `aggregation` | string | `avg` | Aggregation: `avg`, `median` |

### Response-Format
```json
{
    "success": true,
    "data": {
        "period_start": "2025-07-31",
        "period_end": "2026-01-31",
        "booking_type": "all",
        "aggregation": "avg",
        "total_appointments": 2165,
        "heatmap": [
            {
                "day": 1,
                "day_name": "Montag",
                "hours": [
                    {"hour": 8, "value": 5.2, "count": 45},
                    {"hour": 9, "value": 6.8, "count": 78},
                    ...
                ],
                "total_avg": 6.5,
                "total_count": 350
            },
            ...
        ],
        "heatmap_hours": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        "heatmap_max_value": 15.5,
        "insights": {
            "overall_avg": 6.7,
            "best_lead_day": "Samstag",
            "best_lead_day_value": 7.4,
            "worst_lead_day": "Donnerstag",
            "worst_lead_day_value": 6.0,
            "longest_lead_slot": {"day": "Montag", "hour": "10:00", "value": 11.6}
        },
        "branch_data": [
            {
                "branch_id": "xxx",
                "name": "glattt Bielefeld",
                "heatmap": [...],
                "max_value": 12.3,
                "total_appointments": 402
            },
            ...
        ]
    }
}
```

### Frontend
- **Alpine.js Component**: `bookingLeadTimeApp()`
- **JavaScript-Datei**: `/public/js/booking-lead-time.js`
- **Blade-Partial**: `resources/views/hub/reports/partials/consultation-booking-lead-time.blade.php`
- **Integration**: Eingebettet in `upcoming-consultations.blade.php`

## Verwendung

Die Komponente wird auf der Seite "Kommende Beratungsgespräche" angezeigt, unterhalb der "Freie Slots Analyse".

### Interaktion
1. **Zeitraum ändern**: Über Filter-Panel (Trichter-Icon)
2. **Buchungstyp wählen**: Radio-Buttons im Filter-Panel
3. **Aggregation umschalten**: Toggle zwischen Durchschnitt/Median
4. **Ansicht wechseln**: Toggle zwischen Gesamt/Standorte
5. **Standort filtern**: Über globales Header-Dropdown

## Dateien

### Backend
- `app/Http/Controllers/ReportController.php`
  - `bookingLeadTimeAnalysis()` - Hauptendpoint
  - `calculateLeadTimeInsights()` - Insight-Berechnung
  - `calculateLeadTimeByBranch()` - Standort-spezifische Daten

### Frontend
- `public/js/booking-lead-time.js` - Alpine.js Komponente
- `resources/views/hub/reports/partials/consultation-booking-lead-time.blade.php` - Blade-Template

### Routes
- `routes/web.php` - Route-Definition unter `/phorest/reports/booking-lead-time-analysis`

## Design

### Farbskala (Gesamt-Ansicht)
Verwendet die CSS-Variablen `--color-heatmap-1` bis `--color-heatmap-max` für eine grüne Farbskala.

### Standort-Farben
Jeder Standort hat eine eigene Farbe:
| Index | Farbe | Hex |
|-------|-------|-----|
| 0 | Türkis | #14B8A6 |
| 1 | Lila | #A78BFA |
| 2 | Orange | #FF9F1C |
| 3 | Pink | #E91E63 |
| 4 | Blau | #0EA5E9 |

## Beispiel-Interpretation

- **Hoher Vorlauf (>10 Tage)**: Diese Slots werden langfristig geplant - gut für feste Terminserien
- **Niedriger Vorlauf (<3 Tage)**: Spontane Buchungen - hier sollte immer Kapazität frei sein
- **Samstag mit längstem Vorlauf**: Wochenend-Termine werden weit im Voraus gebucht
- **Donnerstag mit kürzestem Vorlauf**: Donnerstag-Termine werden spontaner gebucht

## Changelog

### v1.0.0 (Januar 2026)
- Initiale Implementierung
- Heatmap mit Durchschnitt/Median
- Gesamt- und Standort-Ansicht
- Filter für Zeitraum und Buchungstyp
- Integration mit globalem Branch-Header
