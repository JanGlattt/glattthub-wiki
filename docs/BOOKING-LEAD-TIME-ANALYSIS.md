# Buchungsvorlauf-Analyse

Heatmap-Karte auf der Berichtsseite [Zukünftige Beratungsgespräche](UPCOMING-CONSULTATIONS.md):
**wie viele Tage im Voraus** Beratungstermine gebucht werden, je Wochentag und Uhrzeit. Diese Seite
beschreibt **Berechnung, Endpunkt, Parameter, Response-Format, Dateien und Farbskalen**; die
Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Berichte 2 – Zukünftige Beratungsgespräche"
    [hilfe.hub.glattt.com/berichte/2/](https://hilfe.hub.glattt.com/berichte/2/) — die Seite, auf der
    diese Karte sitzt. Rahmen aller Berichtsseiten (Zeitraum und Standort, Kennzahlen-Zeile, Diagramm
    oder Tabelle, Export): [Berichte 0](https://hilfe.hub.glattt.com/berichte/0/).

    **Für diese Einzelkarte gibt es noch keine eigene Klickanleitung — Anleitung folgt.** Bis dahin:
    Serien-Übersicht [hilfe.hub.glattt.com/berichte/](https://hilfe.hub.glattt.com/berichte/).

---

## Für Anwender — Überblick

**Was die Karte beantwortet.** Buchen die Kundinnen spontan oder langfristig? Die Heatmap zeigt je
Wochentag (Mo–Sa) und Uhrzeit (8–20 Uhr), wie viele Tage im Voraus die Termine dieses Slots gebucht
wurden — wahlweise als Durchschnitt oder als Median (robuster gegen Ausreißer), für alle Standorte
gemeinsam oder je Standort als eigene Mini-Heatmap. Filter gibt es für den Zeitraum (Standard:
letzte 6 Monate) und den Buchungstyp (online, offline, beides); der globale Standortfilter wirkt mit.

Dazu kommen automatisch abgeleitete Befunde: Ø Vorlauf insgesamt, Wochentag mit dem längsten und mit
dem kürzesten Vorlauf sowie der Slot mit dem längsten Vorlauf.

**Wie man die Farben liest** — siehe [Beispiel-Interpretation](#beispiel-interpretation) unten.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Die Seite öffnen, auf der die Karte sitzt | Berichte 2 |
| Zeitraum und Standort, Diagramm/Tabelle, Export | Berichte 0 |
| Diese Einzelkarte Schritt für Schritt | Anleitung folgt (Serie Berichte) |

---

## Für Entwickler

### Aufbau der Karte

- **Y-Achse**: Wochentage (Montag – Samstag)
- **X-Achse**: Uhrzeiten (8:00 – 20:00)
- **Farbintensität**: Je dunkler die Zelle, desto länger der Vorlauf in Tagen
- **Werte**: Durchschnittlicher bzw. Median-Vorlauf in Tagen pro Slot

**Filter und Modi:** Zeitraum (3 / 6 / 12 Monate, Alle Daten, benutzerdefiniert — Standard 6 Monate),
Buchungstyp (Beides / Online / Offline), Aggregation (Durchschnitt / Median), Ansicht (Gesamt /
Standorte als Mini-Heatmaps). Die Karte reagiert auf die globale Branch-Auswahl im Header und lädt
bei Standort-Wechsel automatisch nach.

**Automatische Insights:** Ø Vorlauf, „Längster Vorlauf Tag", „Kürzester Vorlauf Tag" (spontane
Buchungen) und „Früheste Buchungen" (Slot mit dem längsten Vorlauf).

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


### Dateien

#### Backend
- `app/Http/Controllers/ReportController.php`
  - `bookingLeadTimeAnalysis()` - Hauptendpoint
  - `calculateLeadTimeInsights()` - Insight-Berechnung
  - `calculateLeadTimeByBranch()` - Standort-spezifische Daten

#### Frontend
- `public/js/booking-lead-time.js` - Alpine.js Komponente
- `resources/views/hub/reports/partials/consultation-booking-lead-time.blade.php` - Blade-Template

#### Routes
- `routes/web.php` - Route-Definition unter `/phorest/reports/booking-lead-time-analysis`

### Design

#### Farbskala (Gesamt-Ansicht)
Verwendet die CSS-Variablen `--color-heatmap-1` bis `--color-heatmap-max` für eine grüne Farbskala.

#### Standort-Farben
Jeder Standort hat eine eigene Farbe:
| Index | Farbe | Hex |
|-------|-------|-----|
| 0 | Türkis | #14B8A6 |
| 1 | Lila | #A78BFA |
| 2 | Orange | #FF9F1C |
| 3 | Pink | #E91E63 |
| 4 | Blau | #0EA5E9 |

### Beispiel-Interpretation

- **Hoher Vorlauf (>10 Tage)**: Diese Slots werden langfristig geplant - gut für feste Terminserien
- **Niedriger Vorlauf (<3 Tage)**: Spontane Buchungen - hier sollte immer Kapazität frei sein
- **Samstag mit längstem Vorlauf**: Wochenend-Termine werden weit im Voraus gebucht
- **Donnerstag mit kürzestem Vorlauf**: Donnerstag-Termine werden spontaner gebucht

---

## Changelog

### v1.0.0 (Januar 2026)
- Initiale Implementierung
- Heatmap mit Durchschnitt/Median
- Gesamt- und Standort-Ansicht
- Filter für Zeitraum und Buchungstyp
- Integration mit globalem Branch-Header
