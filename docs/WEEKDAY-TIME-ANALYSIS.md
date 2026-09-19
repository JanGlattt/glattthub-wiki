# Wochentag & Uhrzeit Analyse

Heatmap-Karte auf der Berichtsseite [Vergangene Beratungsgespräche](PAST-CONSULTATIONS.md):
**wann** die meisten Beratungsgespräche stattfinden, je Wochentag und Uhrzeit. Diese Seite beschreibt
**Endpunkt, Parameter, Response-Format, Dateien und Farbskala**; die Bedienung Schritt für Schritt
steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Berichte 3 – Vergangene Beratungsgespräche"
    [hilfe.hub.glattt.com/berichte/3/](https://hilfe.hub.glattt.com/berichte/3/) — die Seite, auf der
    diese Karte sitzt. Rahmen aller Berichtsseiten (Zeitraum und Standort, Kennzahlen-Zeile, Diagramm
    oder Tabelle, Export): [Berichte 0](https://hilfe.hub.glattt.com/berichte/0/).

    **Für diese Einzelkarte gibt es noch keine eigene Klickanleitung — Anleitung folgt.** Bis dahin:
    Serien-Übersicht [hilfe.hub.glattt.com/berichte/](https://hilfe.hub.glattt.com/berichte/).

---

## Für Anwender — Überblick

**Was die Karte beantwortet.** Zu welchen Zeiten laufen die Beratungsgespräche — die „Sweetspots".
Die Heatmap zeigt je Wochentag (Mo–So) und Stunde (7–20 Uhr), wie viele Termine dort stattgefunden
haben; je dunkler die Zelle, desto mehr. Filterbar nach Zeitraum (3 / 6 / 12 Monate oder alle Daten,
Standard: 6 Monate), der globale Standortfilter wirkt mit. Seit 07/2026 liegt hinter dem
Karten-Register zusätzlich die Zahlen-Tabelle, und die Werte sind über den CSV-Export abrufbar.

Automatisch abgeleitet werden vier Befunde: beliebtester Tag, beliebteste Uhrzeit, bester Slot
(Tag + Uhrzeit) und ruhigster Tag.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Die Seite öffnen, auf der die Karte sitzt | Berichte 3 |
| Zeitraum und Standort, Diagramm/Tabelle, Export | Berichte 0 |
| Diese Einzelkarte Schritt für Schritt | Anleitung folgt (Serie Berichte) |

---

## Für Entwickler

### Aufbau der Karte

- **Y-Achse**: Wochentage (Montag – Sonntag)
- **X-Achse**: Uhrzeiten (7:00 – 20:00)
- **Farbintensität**: Je dunkler die Zelle, desto mehr Termine
- **Zeitraum-Filter**: Letzte 3 / 6 / 12 Monate, Alle Daten (Standard: 6 Monate)
- **Sweetspot-Erkennung**: beliebtester Tag, beliebteste Uhrzeit, bester Slot, ruhigster Tag
- Reagiert auf die globale Branch-Auswahl im Header

Seit dem Statistik-Bauplan-Umbau 07/2026 hat die Karte ein **Karten-Register** (Heatmap ⇄
Zahlen-Tabelle), ein **Info-Panel**, **Skeleton statt Spinner** und einen **Fehlerzustand** mit
„Erneut laden"; die Werte sind zusätzlich als CSV-Quelle `consultation-weekday-time` exportierbar.
Gesamtübersicht der Seite: [PAST-CONSULTATIONS.md](PAST-CONSULTATIONS.md).

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


### Dateien

- `app/Http/Controllers/ReportController.php` - Backend-Logik (Methode: `weekdayTimeAnalysis`)
- `routes/web.php` - Route-Definition
- `public/js/weekday-time-analysis.js` - Alpine.js Frontend-Komponente
- `resources/views/hub/reports/past-consultations.blade.php` - Blade-Integration

### Design

Die Heatmap verwendet die CSS-Variable `--color-primary-rgb` für die Farbskala, wodurch sie automatisch mit dem Theme (Light/Dark Mode) kompatibel ist.

---

## Verwandte Analysen

- **Freie Slots Analyse** - Zeigt verfügbare Beratungsslots (upcoming-consultations)
- **Buchungsvorlauf-Analyse** - Zeigt wie weit im Voraus Termine gebucht werden (upcoming-consultations)
- **Historischer Buchungsvergleich** - Vergleicht Buchungsstand mit Vergangenheitsdaten (upcoming-consultations)
