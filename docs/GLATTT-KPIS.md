# glattt-KPIs (Bericht)

Eigene Berichtsseite mit den zentralen glattt-Kennzahlen auf **einer gemeinsamen Zahlenbasis** — für Vertriebssteuerung, Marketing, Personalplanung und GF-Reporting. Erreichbar über Berichte → „glattt-KPIs" (Permission `view_report_glattt_kpis`).

## Für Endanwender

### Aufbau der Seite

1. **KPI-Zeile** (personalisierbar per „Anpassen", Drag & Drop): Kennzahlen des laufenden Monats mit Vergleichen zum Vormonat und Vorjahresmonat (jeweils anteilig bis zum selben Tag).
2. **Zeitraum-Übersicht**: alle Kennzahlen über die festen Zeiträume *Letzte 7 Tage*, *Dieser Monat*, *Letzte 3 Monate*, *Dieses Jahr* und *Vorjahr (gleicher Zeitraum)*.
3. **Institut-Vergleich**: dieselben Kennzahlen je Institut inkl. Summenzeile „glattt gesamt", Zeitraum wählbar; Institute in der konfigurierten Reihenfolge (Frontend „Institute").

Beide Auswertungs-Karten sind seit 07/2026 **zweiseitig** (Statistik-Bauplan): Das
**Diagramm ist die Standard-Ansicht** — BGs und Abschlüsse als Balken, „Abschluss
pro BG" als Linie auf der rechten Prozent-Achse — die vollständige **Tabelle**
(inkl. Ø Wert, Abschlusswert und beim Institut-Vergleich der Bestandsgrößen)
liegt als Lasche hinter dem Karten-Register am rechten Kartenrand. Geladen wird
mit Skeleton-Platzhaltern in Endhöhe; Fehler erscheinen je Karte mit
„Erneut laden".

Der **Institut-Filter** im Seitenkopf wirkt auf KPI-Zeile und Zeitraum-Übersicht (der Institut-Vergleich zeigt immer alle Institute). Der **Netto/Brutto-Schalter** wechselt Abschlüsse und Wert-Spalten ohne Neuladen — die Diagramme blenden animiert über. **CSV-Export** über den Export-Button im Seitenkopf (Quellen: Zeitraum-Übersicht, Institut-Vergleich über alle Zeiträume).

### Kennzahlen-Definitionen (fachlich festgelegt 25.07.2026)

| Kennzahl | Definition |
|---|---|
| Durchgeführte BGs | Bezahlte Beratungstermine aus Phorest, dedupliziert auf Kunde × Tag × Institut |
| Abschluss pro BG | Verträge, die **am Tag des BGs** vom selben Kunden im selben Institut unterschrieben wurden, ÷ BGs. Nachverkäufe zählen nicht; Flex-Behandlungen erzeugen keine Verträge und zählen daher nie |
| Wert eines Neukunden | Ø Vertragswert (`total_value_cents`) der Abschlüsse — brutto und netto |
| Abschlusswert Σ | Summe der Vertragswerte der Abschlüsse — brutto und netto |
| Aktive Pakete | Gekaufte, noch nicht vollständig abgearbeitete Pakete (Resteinheiten > 0, nicht abgelaufen, in Phorest vorhanden) — **ohne Kaufdatum-Grenze** |
| Ausstehende Behandlungen (Stück) | Summe der Resteinheiten aktiver Pakete |
| Ausstehende Behandlungen (KPZ) | Resteinheiten × Körperzonen des jeweiligen Services |

**Brutto vs. Netto:** Brutto zählt alle Abschlüsse (auch später widerrufene). Netto zieht ab: (1) widerrufene Verträge — Status „widerrufen" oder akzeptierter Widerruf im Widerrufs-Modul — und (2) Verträge mit **aktuell geplatzten Raten** (Rücklastschrift/Chargeback, noch nicht beglichen). Wird eine geplatzte Rate beglichen, zählt der Vertrag wieder netto. Keine Zielwerte, keine Ampel — reine Wertanzeige.

## Für Entwickler

### Architektur

- **Service** `App\Services\GlatttKpiService`: alle Aggregationen, Cache 60 Min (versionierter Key, `flushCache()` via `?flush=1`).
    - `getKpis()` → KPI-Dashboard-Format (dieser Monat + anteilige Vergleiche)
    - `getPeriodOverview()` → Zeilen je Zeitraum (`periods()`)
    - `getBranchComparison(['period' => key])` → je Institut + `total`
- **Kern-Query** (`runConsultationQuery`): bewusst **SQLite-kompatibel** — BG-Deduplizierung über `GROUP BY client_id, DATE(appointment_date), branch_id` statt CTE/ROW_NUMBER; Direktabschluss über Join auf `contracts` gruppiert nach Kunde × `DATE(signed_at)` × Institut. Netto-Flags über LEFT JOINs: akzeptierte Widerrufe (`contract_cancellations.reaction = 'widerruf_akzeptiert'`) und geplatzte Raten (`contract_payments.status IN ('failed','chargedback')`). `DATE()`-Normalisierung, weil SQLite Datums-Casts als `Y-m-d H:i:s` speichert.
- **Basis brutto** = Verträge mit `signed_at`, Status `active/completed/cancelled` (wie `CANCELLATION_STATUSES` der Verkaufsstatistik; `modified` bleibt außen vor, da durch Folgevertrag ersetzt).
- **Paket-Bestand**: `StatsClientCourse::active()` + Ablauf-Check (Stichtag heute); KPZ über `stats_client_course_items.remaining_units × consultation_services.body_zones` (`service_id` ist unique).
- **Controller/Routen**: `GlatttKpiController`, Gruppe `can:view_report_glattt_kpis` (`/hub/reports/glattt-kpis` + `/kpis`, `/periods`, `/branches`). Permission-Migration `2026_07_25_140000_add_glattt_kpis_report_permission.php`.
- **Frontend**: `resources/views/hub/reports/glattt-kpis.blade.php` + Partials (`header`, `period-overview`, `branch-comparison`), Alpine-App `public/js/glattt-kpis.js` (stale-while-revalidate mit `refreshable-glattt`, Race-Guards, `dataVersion` in allen `x-for`-Keys). Netto/Brutto ist rein clientseitig — beide Ausprägungen kommen in einer Antwort.
- **Charts** (seit 07/2026): beide Karten zweiseitig über `<x-chart-view-toggle>` (Keys `periods`/`branches`, Standard Diagramm) — gemeinsamer Renderer `_renderKpiChart()` in `glattt-kpis.js` mit den Pflicht-Helfern aus `echarts-glattt.js` (`acquireChart`, `chartAnimation`, stabile Serien-ids `bgs`/`contracts`/`rate`, `notMerge`, `legendGridTop`, `enableSeriesIsolation`); Skeletons/`x-card-state` je Karte statt Spinner, `sectionError` je Sektion. Der Institut-Vergleich sortiert die Zeilen serverseitig über den Trait `SortsBranchIds` (`InstituteColor.sort_order`).
- **Export**: `ReportExportService::SOURCES` → `glattt-kpis-periods` (Filter: Institut) und `glattt-kpis-branches` (alle Zeiträume × Institute, ohne Filter).
- **Registry/Übersicht**: Eintrag in `GlobalSearchService::PAGES`; Übersichtskarte `hub/reports/partials/overview-cards/glattt-kpis-card.blade.php` (Stat-Strip-Vorschau).
- **Tests**: `tests/Feature/GlatttKpiTest.php` (BG-Dedup, Direktabschluss, brutto/netto inkl. Widerruf/RLS-Fällen, Branch-Filter, Paket-Bestand, Endpoints, Export) — komplett SQLite-lauffähig.

### Anmerkungen

- Die KPI-Zeile nutzt vier neue Icons (`document-text`, `banknotes`, `cube`, `squares-2x2`) in `components/kpi-dashboard-icons.blade.php`.
- Die Netto-Definition ist bewusst **zeitpunktbezogen**: ein heute geplatzter Vertrag reduziert rückwirkend das Netto des Abschlusszeitraums — gewollt, da die Frage „was war der Zeitraum wirklich wert?" beantwortet wird.
