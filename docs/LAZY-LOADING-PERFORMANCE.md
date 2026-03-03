# Lazy Loading & Performance-Optimierungen

**Datum:** 19. Februar 2026  
**Status:** Implementiert

## Übersicht

Diese Dokumentation beschreibt die Performance-Optimierungen für die Reports-Seiten im glattt Hub. Das Hauptprinzip ist **Lazy Loading**: Daten werden erst geladen, wenn sie benötigt werden.

---

## 1. Stornierte und gelöschte Termine

### Endpoints

| Endpoint | Beschreibung | Geschwindigkeit |
|----------|--------------|-----------------|
| `/historic-appointments/cancelled-monthly/fast` | Nur Monatsdaten (ohne Wochen/Tage) | ~1-3s |
| `/historic-appointments/cancelled-weekly` | Wochendaten für einen Monat | ~0.5-1s |
| `/historic-appointments/cancelled-weeks` | Alle Wochen für Charts | ~2-4s |
| `/historic-appointments/cancelled-days` | Alle Tage für Charts | ~3-5s |

### Verhalten

**Tabelle:**
- Initial werden nur Monate geladen (`/cancelled-monthly/fast`)
- Beim Aufklappen eines Monats werden die Wochen on-demand nachgeladen (`/cancelled-weekly?month=YYYY-MM`)
- Caching verhindert erneutes Laden bereits geladener Wochen

**Charts:**
- Bei Granularität "Monate" werden keine zusätzlichen Daten benötigt
- Bei Granularität "Wochen" werden Wochendaten nachgeladen (`/cancelled-weeks`)
- Bei Granularität "Tage" werden Tagesdaten nachgeladen (`/cancelled-days`)

### KPI-Karte (Reports-Übersicht)

Die KPI-Karte auf der Reports-Übersicht verwendet den schnellen Endpoint `/cancelled-monthly/fast` und berechnet die KPIs aus den Monatsdaten.

---

## 2. Vergangene Beratungsgespräche

### Endpoints

| Endpoint | Beschreibung | Geschwindigkeit |
|----------|--------------|-----------------|
| `/historic-appointments/consultation-monthly/fast` | Nur Monatsdaten + day_insights | ~3-5s |
| `/historic-appointments/consultation-weekly` | Wochendaten für einen Monat | ~0.5-1s |
| `/historic-appointments/consultation-weeks` | Alle Wochen für Charts | ~3-5s |
| `/historic-appointments/consultation-days` | Alle Tage für Charts | ~5-8s |

### Verhalten

Identisch zu "Stornierte und gelöschte Termine":
- Tabelle: Monate initial, Wochen on-demand
- Charts: Lazy Loading bei Granularitätswechsel

### Beliebtester/Unbeliebtester Tag (day_insights)

Der `/consultation-monthly/fast` Endpoint liefert zusätzlich berechnet:
- **best_day**: Wochentag mit den meisten Beratungen (letzte 3 Monate)
- **worst_day**: Wochentag mit den wenigsten Beratungen
- **by_branch**: Pro Standort aufgeschlüsselt

Diese Daten werden direkt vom Backend berechnet (nicht auf Client-Seite), wodurch keine separaten Tagesdaten geladen werden müssen.

### KPI-Karte (Reports-Übersicht)

Verwendet `/consultation-monthly/fast` für schnelles Laden.

---

## 3. Zukünftige Beratungsgespräche

### Buchungsstand-Verlauf (Timeline)

| Endpoint | Beschreibung | Geschwindigkeit |
|----------|--------------|-----------------|
| `/historic-booking-timeline/fast` | Nur Monatsdaten | ~2-4s |
| `/historic-booking-timeline/weeks` | Wochendaten für einen Monat | ~1-2s |
| `/historic-booking-timeline/days` | Tagesdaten für eine Woche | ~0.5-1s |

**Verhalten:**
- Initial werden nur Monate geladen
- Beim Aufklappen eines Monats werden Wochen nachgeladen
- Beim Aufklappen einer Woche werden Tage nachgeladen
- Caching auf allen Ebenen

### Historischer Buchungsvergleich

- Lädt automatisch beim Seitenaufruf (parallel zu anderen Daten)
- Kein manueller "Laden"-Button mehr nötig
- Wird bei Branch-Wechsel automatisch neu geladen

### KPI-Karte (Reports-Übersicht)

| Endpoint | Beschreibung |
|----------|--------------|
| `/upcoming-consultations-kpi` | Optimierter Endpoint nur für KPIs |

**Features:**
- Zählt: **Heute**, 7 Tage, 14 Tage, 28 Tage
- Liefert Aufschlüsselung pro Standort
- Keine Slots-Abfrage (schneller als der vollständige Endpoint)
- Keine Auslastungsberechnung
- Keine Termin-Details für Modal

**UI-Änderungen:**
- 4 KPI-Karten statt 3 (inkl. "Heute")
- Standort-Tabelle mit "Heute"-Spalte
- Wechselnde Tabellenzeilen (`table-glattt-striped`)

---

## 4. Paralleles Laden

Alle API-Aufrufe auf den Detailseiten laufen **parallel**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Seitenaufruf                              │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   loadStats()         loadTimelineData()    loadHistoricData()
   (Phorest API)       (Datenbank)           (Datenbank)
   ~5-10s              ~2-4s                 ~2-4s
         │                    │                    │
         ▼                    ▼                    ▼
   Tabellen/Charts     Buchungsstand         Hist. Vergleich
   erscheinen          erscheint             erscheint
```

Jede Komponente zeigt ihren eigenen Loading-Spinner und erscheint, sobald die Daten verfügbar sind - unabhängig von den anderen.

---

## 5. Caching-Strategie

### JavaScript (Frontend)

```javascript
// Beispiel aus consultation-stats.js
this.timelineWeeksCache = {};     // Gecachte Wochendaten pro Monat
this.timelineDaysCache = {};      // Gecachte Tagesdaten pro Woche
this.timelineLoadingMonths = [];  // Monate die gerade laden
this.timelineLoadingWeeks = [];   // Wochen die gerade laden
```

### Vorteile des Cachings

1. **Kein erneutes Laden:** Einmal geladene Wochen/Tage werden nicht erneut angefragt
2. **Sofortiges Aufklappen:** Bereits geladene Daten werden sofort angezeigt
3. **Reduzierte Server-Last:** Weniger API-Aufrufe

---

## 6. UI-Feedback

### Loading-Indikatoren

- **Spinner in Zeilen:** Beim Aufklappen von Monaten/Wochen erscheint ein Spinner
- **Icon-Rotation:** Das Expand-Icon rotiert während des Ladens
- **Loading-Zeilen:** "Lade Wochendaten..." / "Lade Tagesdaten..." als eigene Zeilen

### Fehlerbehandlung

Bei Fehlern werden die Daten nicht gecacht, sodass ein erneuter Versuch möglich ist.

---

## 7. Betroffene Dateien

### Controller
- `app/Http/Controllers/ReportController.php`
  - `cancelledMonthlyStatsFast()`
  - `cancelledWeeklyForMonth()`
  - `cancelledWeeksForChart()`
  - `cancelledDaysForChart()`
  - `consultationMonthlyStatsFast()`
  - `consultationWeeklyForMonth()`
  - `consultationWeeksForChart()`
  - `consultationDaysForChart()`
  - `historicBookingTimelineFast()`
  - `historicBookingTimelineWeeksForMonth()`
  - `historicBookingTimelineDaysForWeek()`
  - `upcomingConsultationsKpi()`

### Routes
- `routes/web.php` - Neue Lazy-Loading Endpoints

### JavaScript
- `public/js/cancelled-appointment-stats.js`
- `public/js/past-consultation-stats.js`
- `public/js/past-consultation-stats-chart2.js`
- `public/js/consultation-stats.js`

### Blade Templates
- `resources/views/hub/reports.blade.php` - Reports-Übersicht
- `resources/views/hub/reports/partials/consultation-booking-timeline.blade.php`
- `resources/views/hub/reports/partials/consultation-historic-comparison.blade.php`

---

## 8. Performance-Vergleich

### Vorher (ohne Lazy Loading)

| Seite | Ladezeit | Problem |
|-------|----------|---------|
| Stornierte Termine | ~15-25s | Alle Monate, Wochen, Tage auf einmal |
| Vergangene Beratungen | ~15-25s | Alle Monate, Wochen, Tage auf einmal |
| Buchungsstand-Verlauf | ~20-30s | Alle Daten inkl. Tage |
| Reports-Übersicht (KPI) | ~8-12s | Vollständiger Data-Endpoint |

### Nachher (mit Lazy Loading)

| Seite | Initiale Ladezeit | On-Demand |
|-------|-------------------|-----------|
| Stornierte Termine | ~1-3s | +0.5-1s pro Monat |
| Vergangene Beratungen | ~3-5s | +0.5-1s pro Monat |
| Buchungsstand-Verlauf | ~2-4s | +1-2s pro Monat/Woche |
| Reports-Übersicht (KPI) | ~3-5s | - |

---

## 9. Nutzungshinweise

### Für Entwickler

1. **Neue Tabellen mit Lazy Loading:** Folge dem Muster aus `getTimelineRows()` in `consultation-stats.js`
2. **Caching:** Verwende separate Caches für verschiedene Datenebenen
3. **Loading-States:** Tracke welche Items gerade laden mit Arrays

### Für Anwender

- Tabellen laden schneller
- Beim Aufklappen von Monaten/Wochen erscheint kurz ein Spinner
- Einmal geladene Daten werden sofort angezeigt

---

## 10. Zukünftige Optimierungen

- [ ] Server-seitiges Caching für häufig abgefragte Daten
- [ ] Prefetching von Wochendaten beim Hover über Monat
- [ ] IndexedDB für längerfristiges Client-Caching
- [ ] Komprimierung der API-Responses
