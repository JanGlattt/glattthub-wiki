# Wochentag & Uhrzeit Analyse - Dokumentation

## Übersicht

Die **Wochentag & Uhrzeit Analyse** ist eine Heatmap-Visualisierung, die zeigt, wann die meisten Beratungsgespräche stattfinden. Sie hilft dabei, "Sweetspots" zu identifizieren - die beliebtesten Tage und Uhrzeiten für Beratungen.

## Features

### Heatmap-Visualisierung
- **Y-Achse**: Wochentage (Montag - Sonntag)
- **X-Achse**: Uhrzeiten (7:00 - 20:00)
- **Farbintensität**: Je dunkler die Zelle, desto mehr Termine

### Zeitraum-Filter
- Letzte 3 Monate
- Letzte 6 Monate (Standard)
- Letzte 12 Monate
- Alle Daten

### Automatische Sweetspot-Erkennung
Das System analysiert automatisch:
- **Beliebtester Tag**: Der Wochentag mit den meisten Terminen
- **Beliebteste Uhrzeit**: Die Stunde mit den meisten Terminen
- **Bester Slot**: Die Kombination aus Tag + Uhrzeit mit den meisten Terminen
- **Ruhigster Tag**: Der Wochentag mit den wenigsten Terminen

### Integration mit Branch-Auswahl
- Reagiert auf die globale Branch-Auswahl im Header
- Zeigt Daten für alle Standorte oder einzelne Standorte

## Technische Details

### Backend
- **Route**: `GET /phorest/reports/historic-appointments/weekday-time-analysis`
- **Controller**: `ReportController::weekdayTimeAnalysis()`
- **Datenquelle**: `stats_historic_appointments` Tabelle

### Parameter
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `period` | string | `6m` | Zeitraum: `3m`, `6m`, `12m`, `all` |
| `start_date` | date | - | Benutzerdefinierter Start (YYYY-MM-DD) |
| `end_date` | date | - | Benutzerdefiniertes Ende (YYYY-MM-DD) |
| `branch_id` | string | - | Filter nach Standort |

### Response-Format
```json
{
    "heatmap": [
        {
            "day": 2,
            "day_name": "Montag",
            "hours": [
                {"hour": 7, "count": 5, "branches": {...}},
                ...
            ],
            "total": 150
        },
        ...
    ],
    "max_count": 25,
    "total_count": 1500,
    "period": {"start": "2024-01-01", "end": "2024-06-30", "label": "6m"},
    "insights": {
        "best_day": "Dienstag",
        "best_day_count": 300,
        "worst_day": "Sonntag",
        "worst_day_count": 50,
        "best_slot": {"day": "Dienstag", "hour": "10:00 - 11:00", "count": 25},
        "best_hour": "10:00 - 11:00",
        "best_hour_count": 200
    }
}
```

### Frontend
- **Alpine.js Component**: `weekdayTimeAnalysis()`
- **JavaScript-Datei**: `/public/js/weekday-time-analysis.js`
- **Integration**: Eingebettet in `past-consultations.blade.php`

## Verwendung

Die Komponente wird automatisch auf der Seite "Vergangene Beratungsgespräche" angezeigt, sobald monatliche Statistiken geladen sind.

### Interaktion
1. **Zeitraum ändern**: Dropdown oben rechts
2. **Slot-Details**: Klick auf eine Heatmap-Zelle (zeigt Details im Console-Log)
3. **Standort filtern**: Über globales Header-Dropdown

## Dateien

- `app/Http/Controllers/ReportController.php` - Backend-Logik (Methode: `weekdayTimeAnalysis`)
- `routes/web.php` - Route-Definition
- `public/js/weekday-time-analysis.js` - Alpine.js Frontend-Komponente
- `resources/views/hub/reports/past-consultations.blade.php` - Blade-Integration

## Design

Die Heatmap verwendet die CSS-Variable `--color-primary-rgb` für die Farbskala, wodurch sie automatisch mit dem Theme (Light/Dark Mode) kompatibel ist.

## Verwandte Analysen

- **Freie Slots Analyse** - Zeigt verfügbare Beratungsslots (upcoming-consultations)
- **Buchungsvorlauf-Analyse** - Zeigt wie weit im Voraus Termine gebucht werden (upcoming-consultations)
- **Historischer Buchungsvergleich** - Vergleicht Buchungsstand mit Vergangenheitsdaten (upcoming-consultations)
