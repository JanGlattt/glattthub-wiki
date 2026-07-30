# Vergangene Beratungsgespräche

Historische Analyse aller Beratungstermine aus der Phorest-Terminhistorie: monatliche Entwicklung, No-Show-Verhalten, Wochentag/Uhrzeit-Muster, No-show-Matrix („Analyse Gigi") und Buchungseingänge.

**Zugang:** Hub → Berichte → Vergangene Beratungsgespräche
**URL:** `/hub/reports/past-consultations`
**Berechtigung:** `view_report_past_consultations`

---

## Für Endanwender

### Aufbau der Seite (Statistik-Bauplan, seit 07/2026)

Die Seite folgt dem verbindlichen Statistikseiten-Bauplan: Analyse-Karten sind
**zweiseitig** — Diagramm als Standard-Ansicht, die Tabelle dahinter über das
**Register am rechten Kartenrand** (mobil als Segmented Control). Beim Laden
zeigen die Karten **Skeletons in Endhöhe**, Filterwechsel dimmen die alte
Ansicht, bis die neue Antwort da ist. Fällt ein Endpoint aus, zeigt **nur diese
Karte** einen Fehlerhinweis mit „Erneut laden". Jede Karte hat ein Info-Panel (ℹ️).

**Wichtig seit 07/2026:** Der **Standort-Filter der Sidebar wirkt jetzt
lückenlos serverseitig** auf alle Karten der Seite. Vorher zeigten
Trend-Analyse, No Show-Analyse und No-show-Matrix bei gewähltem Standort
weiterhin konzernweite Zahlen — direkt neben korrekt gefilterten KPIs.

### Sektionen

| Karte | Standard-Ansicht | Tabellen-Lasche |
|---|---|---|
| **KPI-Zeile** | personalisierbare Kennzahlen (kpi-dashboard, Drag & Drop) | — |
| **Monatliche Beratungsgespräche** | Ampel-Tabelle Monat × Institut (Anzahl oder No-Show %) mit Wochen-Drilldown und Klick auf jede Zelle → Termine-Liste; begründete Ausnahme ohne Register | — |
| **Trend-Analyse** | Balken (Beratungen) + No-Show-Quote als Linie; umschaltbar auf Linien je Standort; Zoom-Leiste | Monate → Quartal/Jahr aufklappbar, bei „Alle Institute" mit Standort-Spalten |
| **No Show-Analyse** | gestapelte Balken Stattgefunden/Nicht stattgefunden + Quote; umschaltbar auf Quoten je Standort | Monate → Quartal/Jahr aufklappbar |
| **Wochentag & Uhrzeit** | Heatmap Wochentag × Stunde (Gesamt oder Mini-Heatmaps je Standort), Filter-Drawer (Status, Buchungstyp, Zeitraum) | dieselben Werte als Zahlen-Tabelle mit Summen |
| **No-show-Matrix** („Analyse Gigi") | **neu:** Verlaufs-Diagramm der gewählten Kennzahl je Institut | die bekannte Ampel-Matrix (Quote/Gebucht/Erschienen, Färbungs-Vergleichsmodus, „Frühere Zeiträume laden") |
| **Buchungseingänge** | Kalender (Buchungszeitpunkt statt Termindatum); begründete Ausnahme ohne Register | — |

Beide Chart-Karten haben Buchungstyp-Umschalter (Alle/Online/Offline) und eine
Zoom-Leiste (Standard: letzte 12 Monate); die Auswahl bleibt beim Neuzeichnen erhalten.

### Datenbasis & Sync

Datenquelle ist die Tabelle `stats_historic_appointments` (aus Phorest
synchronisiert, Termine ab 01.01.2023). Der Sync-Status steht im Seitenkopf;
fehlende Tage lassen sich dort nachladen. Als „nicht erschienen" zählen
vergangene Termine mit Status *NO_SHOW, BOOKED, CONFIRMED, CHECKED_IN* — auch
nie final gepflegte Termine; stornierte/gelöschte Termine zählen nicht.

### CSV-Export

Über den Export-Button im Seitenkopf (alle Quellen mit Standort-Filter):

| Quelle | Inhalt |
|--------|--------|
| `consultation-noshow-monthly` | No-show-Statistik pro Monat & Institut (deckt Monatstabelle, beide Charts und die Matrix auf Monatsebene) |
| `consultation-weekday-time` | Termine/Erschienen/No-Shows/Quote je Wochentag & Stunde |
| `consultation-booking-days` | Buchungseingänge pro Tag & Institut (beide Quellen, dedupliziert) |

---

## Für Entwickler

### Architektur

```
ReportController (app/Http/Controllers/) — Ausschnitt dieser Seite
├── pastConsultations()             → Blade-View
├── consultationMonthlyStatsFast()  → JSON: Monatsdaten (KPIs, Tabelle, Charts) — gecacht (ReportsOverviewCache)
├── consultationMonthlyStats()      → JSON: Monatsdaten mit Buchungstyp-Filter (+ weeks/days)
├── consultationWeeklyForMonth()    → JSON: Wochen-Drilldown eines Monats
├── consultationNoShowMatrix()      → JSON: Matrix (Granularität month/week/day, offset-Paging) — gecacht
├── weekdayTimeAnalysis()           → JSON: Heatmap Wochentag × Stunde
├── consultationAppointments()      → JSON: Termine-Liste (Zellen-Modal)
├── consultationBookingCalendar()   → JSON: Buchungseingänge (booking_trackings + Phorest, dedupliziert)
└── consultationBookingDay()        → JSON: Buchungen eines Tages (Modal)
```

**Alle Endpoints wenden `branch_id` an** (seit 07/2026 — vorher ignorierten
`consultation-monthly`, `…/fast`, `consultation-weekly` und `no-show-matrix`
den Filter komplett); bei den beiden gecachten Endpoints steckt `branch_id`
in den Cache-Params (sonst Cross-Branch-Cache-Poisoning). Die Instituts-
Reihenfolge kommt aus dem `SortsBranchIds`-Trait (`InstituteColor.sort_order`).

Die früheren Endpoints `consultation-weeks`/`consultation-days` (Chart.js-Ära)
waren tot (kein Aufrufer) und wurden mitsamt Routen entfernt.

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `resources/views/hub/reports/past-consultations.blade.php` | Seiten-Skelett (aus Partials komponiert; vorher 98-KB-Monolith) |
| `resources/views/hub/reports/past-consultations/partials/*.blade.php` | Header/Sync, Monatstabelle, Trend, No-Show, Wochentag-Heatmap, Matrix, Kalender, 2 Modals |
| `public/js/past-consultation-stats.js` | Haupt-Alpine-App: Loader (sectionError je Karte), KPI-Berechnung, chart-table-Modelle, Sync/Modals (~600 Zeilen toter Chart.js-Code entfernt) |
| `public/js/past-consultation-stats-chart2.js` | ECharts-Renderer Trend + No-Show (acquireChart-Muster, stabile Serien-ids, animierte Übergänge) |
| `public/js/weekday-time-analysis.js` | Heatmap-Karte (eigene App, Register Heatmap ⇄ Tabelle) |
| `public/js/no-show-matrix.js` | Matrix-Karte (eigene App, neu mit Verlaufs-Diagramm + Branch-Filter) |
| `app/Services/ReportExportService.php` | CSV-Quellen `consultation-*` |
| `tests/Feature/PastConsultationsPageTest.php` | Seiten-Skelett, Branch-Filter (inkl. Cache), Export-Quellen |
| `tests/Feature/NoShowMatrixTest.php` | Matrix-Zähllogik |

**Drei Alpine-Apps** unter einer Seiten-Wurzel: `pastConsultationStatsApp`
(Root, gemergt mit `window.chart2Extensions`), `weekdayTimeAnalysis` und
`noShowMatrixCard` (verschachtelt). Race-Guards (`_seq…`) sind in allen Apps
**deklariert** — undeklarierte Properties leaken über die Alpine-Scope-Kette
zwischen verschachtelten Apps (bekanntes Muster, siehe CLAUDE.md).

### Behobene Bugs (07/2026)

- **Branch-Filter-Lücken** in 4 Endpoints + fehlende Cache-Params (s.o.); die
  Matrix hörte zusätzlich gar nicht auf `branchChanged`.
- **`formatDate()`/Custom-Zeitraum kippten via `toISOString()` auf den Vortag**
  (Europe/Berlin) — betraf u.a. die Chunk-Grenzen des Daten-Syncs (`fillGaps`).
- **Alle Karten-Loader scheiterten lautlos** (`console.error` ohne UI-Zustand);
  der globale Fehlerblock hing an einem nie gesetzten `error`-State.
- Termine-Modal nutzte noch das alte `kpi-mini-glattt-grid` → Stat-Strip.

### Caching

`consultation-monthly-fast` und `no-show-matrix` laufen über
`ReportsOverviewCache::remember(endpoint, params, TTL, …)` — `branch_id` ist
Teil der `params`. Invalidierung über `ReportsOverviewCache::flush()`.

### Tests

```bash
php artisan test --filter=PastConsultationsPageTest
php artisan test --filter=NoShowMatrixTest
```

Beide Suiten laufen unter SQLite (die Matrix berechnet Perioden in PHP; die
Export-Quellen gruppieren in PHP statt mit MySQL-Datumsfunktionen). Die
Monats-Endpoints selbst nutzen `DATE_FORMAT`/`YEARWEEK` und sind nur gegen
MySQL testbar.
