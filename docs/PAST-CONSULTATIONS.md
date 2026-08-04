# Vergangene Beratungsgespräche

Historische Analyse aller Beratungstermine aus der Phorest-Terminhistorie: Beratungsgespräche-Analyse (monatliche Entwicklung, No-Shows, Ampel-Tabelle), Wochentag/Uhrzeit-Muster, No-show-Matrix („Analyse Gigi") und Buchungseingänge.

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
| **Beratungsgespräche-Analyse** | Diagramm mit Metrik-Umschalter: **Beratungen** (Balken + No-Show-Quote als Linie) oder **No-Shows** (gestapelt Stattgefunden/Nicht stattgefunden + Quote); **Standorte** = gruppierte Balken je Institut (bei „No-Shows" gestapelt: Stattgefunden voll, No-Show-Anteil schraffiert), Quoten als Linien (rechte %-Achse); Zoom-Leiste | die Ampel-Tabelle Monat × Institut (Anzahl oder No-Show %) mit Wochen-Drilldown und Klick auf jede Zelle → Termine-Liste |
| **Wochentag & Uhrzeit** | Heatmap Wochentag × Stunde (Gesamt oder Mini-Heatmaps je Standort), Filter-Drawer (Status, Buchungstyp, Zeitraum) | dieselben Werte als Zahlen-Tabelle mit Summen |
| **No-show-Matrix** („Analyse Gigi") | Verlaufs-Diagramm der gewählten Kennzahl je Institut | die bekannte Ampel-Matrix (Quote/Gebucht/Erschienen, Färbungs-Vergleichsmodus, „Frühere Zeiträume laden") |
| **Buchungseingänge** | Kalender (Buchungszeitpunkt statt Termindatum); begründete Ausnahme ohne Register | — |

**Zusammenlegung 07/2026:** Die früheren drei Karten „Monatliche
Beratungsgespräche", „Trend-Analyse" und „No Show-Analyse" basierten alle exakt
auf demselben Monats-Datensatz und sind jetzt EINE Karte. Sie teilt sich einen
**Buchungstyp-Umschalter** (Alle/Online/Offline — wirkt auf Diagramm und Tabelle
gemeinsam; die KPI-Zeile zeigt immer alle Buchungen) und eine Zoom-Leiste
(Standard: letzte 12 Monate); Auswahl und Zoom bleiben beim Neuzeichnen erhalten.
Die früheren Quartal/Jahr-Summen-Tabellen entfielen — Aggregate liefert der
CSV-Export (`consultation-noshow-monthly`).

### Datenbasis & Sync

Datenquelle ist die Tabelle `stats_historic_appointments` (aus Phorest
synchronisiert, Termine ab 01.01.2023). Der Sync-Status steht im Seitenkopf;
fehlende Tage lassen sich dort nachladen. Als „nicht erschienen" zählen
vergangene Termine mit Status *NO_SHOW, BOOKED, CONFIRMED, CHECKED_IN* — auch
nie final gepflegte Termine; stornierte/gelöschte Termine zählen nicht.

**Heutige, noch anstehende Termine bleiben komplett außen vor** (Scope
`StatsHistoricAppointment::settled()`): Seit dem 15-Minuten-Sync (08/2026)
enthält die Tabelle auch den laufenden Tag — Termine von heute mit Status
*BOOKED/CONFIRMED/CHECKED_IN* sind aber weder stattgefunden noch No-Show und
zählen deshalb weder im Zähler noch im Nenner der Quoten. Heutige Termine mit
*PAID/COMPLETED* oder explizitem *NO_SHOW* zählen normal. Ohne diese Regel
stünde die No-Show-Quote jeden Morgen bei fast 100 %, weil alle noch
anstehenden Tagestermine als „nicht erschienen" gewertet würden (Bug 08/2026).

### CSV-Export

Über den Export-Button im Seitenkopf (alle Quellen mit Standort-Filter):

| Quelle | Inhalt |
|--------|--------|
| `consultation-noshow-monthly` | No-show-Statistik pro Monat & Institut (deckt die Beratungsgespräche-Analyse und die Matrix auf Monatsebene, inkl. Quartal/Jahr-Aggregation per Tabellenkalkulation) |
| `consultation-weekday-time` | Termine/Erschienen/No-Shows/Quote je Wochentag & Stunde |
| `consultation-booking-days` | Buchungseingänge pro Tag & Institut (beide Quellen, dedupliziert) |

---

## Für Entwickler

### Architektur

```
ReportController (app/Http/Controllers/) — Ausschnitt dieser Seite
├── pastConsultations()             → Blade-View
├── consultationMonthlyStatsFast()  → JSON: DER Monats-Datensatz der Analyse-Karte (KPIs, Chart, Ampel-Tabelle)
│                                     — gecacht (ReportsOverviewCache, Params: booking_type + branch_id)
├── consultationMonthlyStats()      → JSON: Monatsdaten (+ weeks/days) — von dieser Seite seit der
│                                     Zusammenlegung 07/2026 NICHT mehr genutzt (nur Berichte-KPI-Vorschau)
├── consultationWeeklyForMonth()    → JSON: Wochen-Drilldown eines Monats
├── consultationNoShowMatrix()      → JSON: Matrix (Granularität month/week/day, offset-Paging) — gecacht
├── weekdayTimeAnalysis()           → JSON: Heatmap Wochentag × Stunde
├── consultationAppointments()      → JSON: Termine-Liste (Zellen-Modal)
├── consultationBookingCalendar()   → JSON: Buchungseingänge (booking_trackings + Phorest, dedupliziert)
└── consultationBookingDay()        → JSON: Buchungen eines Tages (Modal)
```

**Ein Datensatz für die ganze Analyse-Karte:** Vor der Zusammenlegung hielten
Monatstabelle, Trend- und No-Show-Chart **drei getrennte Buchungstyp-Zustände**
und luden denselben Monats-Datensatz bis zu **dreimal**. Jetzt gibt es einen
gemeinsamen `bookingTypeFilter` (`setBookingType()`), einen Load über
`/consultation-monthly/fast` und ein Chart (`renderAnalysisChart()`), das je
nach Metrik/Ansicht nur andere Serien aus demselben Datensatz zeichnet. Die
KPI-Zeile hängt bewusst am ungefilterten `monthlyStats` („Alle Buchungen").

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
| `resources/views/hub/reports/past-consultations/partials/*.blade.php` | Header/Sync, Beratungsgespräche-Analyse, Wochentag-Heatmap, Matrix, Kalender, 2 Modals |
| `public/js/past-consultation-stats.js` | Haupt-Alpine-App: Loader (sectionError je Karte), KPI-Berechnung, Buchungstyp (`setBookingType`), Sync/Modals |
| `public/js/past-consultation-stats-chart2.js` | ECharts-Renderer der Analyse-Karte (`renderAnalysisChart`, Metrik × Ansicht; acquireChart-Muster, stabile Serien-ids, animierte Übergänge) |
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
