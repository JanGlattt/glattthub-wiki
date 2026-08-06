# Zukünftige Beratungsgespräche

Berichtsseite `/hub/reports/upcoming-consultations` — Übersicht über die geplanten Beratungsgespräche für heute und die nächsten 3/7/14/28 Tage inkl. Auslastung, historischen Vergleichen, freien Slots und Buchungsvorlauf.

> **Stand 30.07.2026:** Die Seite wurde vollständig auf den verbindlichen Statistik-Bauplan (Schema Verkaufsstatistik) umgebaut — Details im Abschnitt „Bauplan-Umbau".

## Für Endanwender

### KPI-Zeile

Oben auf der Seite steht die personalisierbare KPI-Zeile (Drag & Drop, Zahnrad-Symbol): Heute, Nächste 3/7/14/28 Tage, Bis Monatsende, Ø Auslastung (28 Tage) und Freie Slots (28 Tage). Die Auswahl wird pro Nutzer im Browser gespeichert.

### Karten der Seite

Alle Analyse-Karten sind zweiseitig: **Diagramm als Standard-Ansicht, Tabelle als Lasche** hinter dem Register am rechten Kartenrand (mobil: Segmented Control oben rechts).

| Karte | Diagramm | Tabelle |
|---|---|---|
| **Aktueller Buchungsstand** | Balken je Institut × Zeitfenster (Heute/3/7/14/28 Tage/Monatsende), Kennzahlen-Zeile darüber | Standort-Tabelle mit denselben Zeitfenstern; hinter „Heute" und „3 Tage" steht jeweils direkt die Vergleichsspalte **Ø Heute** bzw. **Ø 3 Tage** |
| **Kalenderübersicht** | Kalender der nächsten 28 Tage (Termine, freie Slots, Auslastungs-Ampel; Ansicht „pro Standort" mit Mini-Balken; „+2 Wochen laden") — bewusste Ausnahme ohne Register: Der Kalender ist bereits die tabellarische Darstellung | — |
| **Entwicklung geplanter Beratungsgespräche** | Stichtags-Zeitreihe seit Juni 2023 (Zeitfenster 1/3/7/28 Tage, gleitender Ø, Gesamt/Standorte) | Stichtage gruppiert Jahr → Quartal → Monat; Gruppenzeilen zeigen den letzten Stichtag der Periode (Bestandsgröße, keine Summe) |
| **Historischer Buchungsvergleich** | Balken „Stand <Vergleichsdatum>" vs. „Aktuell" je Zeitfenster; Vergleichsdatum frei wählbar (flatpickr) | Standort-Aufschlüsselung mit Trend-Badges (aktuell mehr/weniger gebucht) |
| **Buchungsstand-Verlauf** | Linien 7/14/28 Tage über die Monats-Stichtage seit Juni 2023 | Heatmap-Tabelle mit aufklappbaren Wochen/Tagen (Lazy Loading) |
| **Freie Slots Analyse** | Heatmap Wochentag × Uhrzeit oder Wochentags-Balken (interner Umschalter), Gesamt/Standorte, Zeitraum-Filter | Freie Slots je Wochentag × Uhrzeit mit Summenspalte |
| **Buchungsvorlauf-Analyse** | Heatmap Wochentag × Uhrzeit oder Verteilungs-Histogramm, Durchschnitt/Median, Buchungstyp-Filter | Vorlauf (Tage) je Wochentag × Uhrzeit |

In der Standort-Tabelle der Karte „Aktueller Buchungsstand" (und in der Kachel auf der Berichte-Übersicht) folgt auf „Heute" und „3 Tage" **direkt** der zugehörige Vergleichswert **Ø Heute** bzw. **Ø 3 Tage**: der Durchschnitt der gebuchten Beratungen am **gleichen Wochentag** der letzten zwölf Wochen. Liegt der Ist-Wert deutlich darunter, fehlen für den laufenden Tag Buchungen gegenüber den Vorwochen. Der Wochentags-Bezug ist wichtig, weil Montag und Samstag sich stark unterscheiden. Die Ø-Spalten sind blass und kursiv gesetzt (Theme-Klasse `.table-glattt-col-reference`), damit die Ist-Werte die Tabelle führen; der Spaltenkopf trägt die Erklärung als Tooltip.

Jede Karte hat ein Info-Panel (ℹ️) mit Erklärung, Spaltenbeschreibung, Auffälligkeiten und Datenquelle. Der globale Standortfilter in der Sidebar wirkt auf alle Karten; bei einem einzelnen Institut zeigt die Seite die Instituts-Variante (Kennzahlen + Kalender statt Standort-Vergleich).

### CSV-Export

Über das Export-Modal im Seitenkopf (alle Quellen respektieren den Standortfilter):

- Geplante Beratungsgespräche pro Tag & Institut
- Buchungsstand je Institut (Heute, 3/7/14/28 Tage & Monatsende)
- Entwicklung geplanter Beratungsgespräche (Stichtags-Zeitreihe)
- Buchungsstand-Verlauf pro Monat (7/14/28 Tage)
- Freie Beratungsslots je Institut, Wochentag & Uhrzeit
- Buchungsvorlauf-Verteilung

Der frühere CSV-Direktlink an der Verlaufs-Karte wurde entfernt — er ignorierte den Standortfilter (der Endpoint `historic-booking-timeline/export` akzeptiert jetzt zusätzlich `branch_id`).

## Für Entwickler

### Dateien

| Rolle | Datei |
|---|---|
| Seite | `resources/views/hub/reports/upcoming-consultations.blade.php` |
| Partials | `resources/views/hub/reports/partials/consultation-{all-stats, branch-stats, booking-outlook, historic-comparison, booking-timeline, free-slots, booking-lead-time, day-modal}.blade.php` |
| Alpine-Apps | `public/js/consultation-stats.js` (Hauptseite: Buchungsstand, Kalender, Historik, Verlauf, KPIs), `booking-outlook.js`, `free-slots-analysis.js`, `booking-lead-time.js` |
| Controller | `ReportController@upcomingConsultations` + JSON-Endpoints (`upcomingConsultationsData`, `historicBookingComparison`, `historicBookingTimelineFast/Weeks/Days`, `bookingOutlookTimeseries`, `freeSlotsAnalysis`, `bookingLeadTimeAnalysis`) |
| Exporte | `ReportExportService` (Quellen s.o., Resolver DB-basiert bzw. Delegation an `ConsultationBookingOutlookService`) |
| Tests | `tests/Feature/UpcomingConsultationsPageTest.php`, `ReportExportTest`, `ConsultationBookingOutlookTest` |

### Bauplan-Umbau (30.07.2026)

- **KPI-Zeile ergänzt** (`components/kpi-dashboard`, storageKey `upcoming-consultations-kpis`) — clientseitig in `consultationStatsApp.buildDashboardKpis()` aus den geladenen Stats + Tages-Auslastungen gebaut (kein neuer Endpoint; der bestehende `upcoming-consultations-kpi`-Endpoint versorgt weiterhin Startseite/Berichte-Übersicht).
- **Karten-Register** für 6 Karten (`buchungsstandView`/`outlookView`/`historicView`/`timelineView`/`slotsView`/`leadView`); drei neue ECharts-Renderer (Buchungsstand-Balken je Institut, Historik-Vergleichsbalken, Verlaufs-Linien) und Tabellen-Laschen für alle Karten. Booking-Outlook nutzt `chart-table.js` (Jahr → Quartal → Monat, `agg: 'last'` — Bestandsgröße!).
- **Alle ECharts-Renderer** auf das Pflicht-Muster migriert: `acquireChart()` statt dispose/init, `...chartAnimation(isUpdate)`, stabile Serien-`id`s (`branch-<id>`, `outlook-total/-ma`, `historic`/`current`, `days7/14/28`, `slots-total`/`slots-branch-<id>`, `leadtime-dist`), `setOption(…, { notMerge: true })`, globales `forceRepaint`, `bindChartEvent`.
- **Skeletons statt Spinner** überall (`<x-stat-skeleton>`), **Fehler je Karte** mit `<x-card-state type="error" retry>` (der Verlaufs-Loader verschluckte Fehler vorher komplett), Leerzustände via `<x-card-state type="empty">`; Freie-Slots- und Vorlauf-Karten stehen jetzt dauerhaft im DOM (vorher `x-if`-Gates → Layout-Sprünge).
- **`dataVersion`** in allen `x-for`-Keys, Vergleichsdatum auf flatpickr umgestellt, Ausnahme-Kommentare an den Kalender-Karten.
- **Kritischer Alpine-Fix:** Die drei Karten-Apps nutzten `this._seq` als *undeklarierte* Property — innerhalb der gemeinsamen Seiten-Wurzel teilt Alpines Scope-Kette solche Properties zwischen Geschwister-Komponenten. Die Race-Guards verwarfen sich dadurch gegenseitig die Antworten (Karten hingen dauerhaft in „Lädt…"). Fix: `_seq: 0` in jedem App-Datenobjekt deklariert. **Merkregel: Interne Zähler in Alpine-Komponenten immer im Datenobjekt deklarieren.**
- **Migration `create_free_consulting_slots_table`** (idempotent): Die Tabelle existierte in Prod/Staging nur als Alt-Bestand ohne Migration und fehlte daher lokal/in Test-SQLite.

### Zeitfenster „Heute" und „3 Tage" (06.08.2026)

Die Karte „Aktueller Buchungsstand" zeigte „Heute" nur im Stat-Strip und ein 3-Tage-Fenster gar nicht — je Institut fehlten beide, im Standortfilter-Modus auch „Heute". Ursache war ein Sonderweg: Die Heute-Zahl wurde clientseitig aus `total_stats.daily_breakdown` gefischt, statt ein reguläres Zeitfenster zu sein.

- **`ReportController::$periods`** kennt jetzt `today` (heute, ganztägig) und `3_days` (heute + zwei Folgetage) — beide laufen damit durch `calculatePeriodStats()` und liegen für Gesamt **wie je Institut** vor, auch bei gesetztem Standortfilter. Reihenfolge: `today, 3_days, 7_days, 14_days, 28_days, month_end`.
- **`buildUpcomingConsultationsKpi()`** (eigener Zählpfad der Berichte-Übersicht) zählt `days_3` mit; neue Kennzahl `termine.upcoming_3d` in `KpiRegistry` + `KpiValueService`.
- **`termine.js` (`termine.booking-status`)**: `branchPeriodKeys()` filtert nichts mehr heraus — Stat-Strip, Tabelle und Diagramm zeigen dieselben sechs Fenster. „Bis Monatsende" wird nach seiner Länge (`days_remaining`) einsortiert, damit die Reihe aufsteigend bleibt (vorher feste Positionen, die mit dem neuen 3-Tage-Fenster nicht mehr aufgingen). `todayCount()` liest das Fenster `today` und fällt nur noch ersatzweise auf den `daily_breakdown` zurück.
- **Export** `upcoming-consultations-branches` und die Übersichts-Kachel führen dieselben Spalten.
- **Vergleichsspalten Ø Heute / Ø 3 Tage:** `ReportController::consultationWeekdayAverages(?string $branchId)` mittelt die **gebuchten** Beratungen (`StatsHistoricAppointment` mit `active()`) am **gleichen Wochentag** der letzten zwölf Wochen (Konstante `ReportController::WEEKDAY_AVERAGE_WEEKS`) — für „Heute" die zwölf vorangegangenen gleichen Wochentage, für „3 Tage" dieselben Wochentags-Fenster. Bewusst kein flacher Kalenderschnitt: Sonn- und Feiertage würden ihn systematisch drücken. Bewusst „gebucht" statt „stattgefunden" (also inkl. No-Shows), weil die Ist-Werte daneben ebenfalls gebuchte Termine sind. Der Helper versorgt **beide** Endpoints (`upcomingConsultationsData` → `branches_breakdown[].stats.avg_today/avg_3_days` + `total_stats`, `upcomingConsultationsKpi` → `by_branch[].avg_today/avg_3_days` + Gesamt). Institute ohne Historie fallen auf `0` zurück. Die Spaltenreihenfolge entsteht clientseitig (`tableColumnKeys()` in `termine.js` bzw. `getTableColumnKeys()` in `reports.blade.php`) durch Verschränken: jeder Ø-Wert direkt hinter seinem Ist-Wert. Nur in den **Tabellen** — das Diagramm bleibt bei den Zeitfenstern, Ist-Werte und Mittelwerte gehören nicht in dieselbe Balkengruppe.
- **Achtung `x-data`:** Der KPI-Block der Berichte-Übersicht (`resources/views/hub/reports.blade.php`) steht in einem `x-data="…"`-Attribut. Ein **gerades** Anführungszeichen in einem Kommentar dort beendet das Attribut — der restliche JS-Code landet als sichtbarer Text auf der Seite. In diesem Block keine Anführungszeichen in Kommentaren verwenden.

### Fachliche Hinweise

- `getCurrentComparisonData()` liefert im Einzel-Standort-Modus jetzt die Zahlen aus `branch_stats` (vorher `null` → keine „aktuell"-Vergleiche im Branch-Modus).
- Buchungsstand-Zahlen sind **Bestandsgrößen** — in Tabellen-Gruppenzeilen niemals summieren (chart-table `agg: 'last'`).
- **Keine Doppelzählung des laufenden Tages (Fix 08/2026):** `ConsultationBookingOutlookService` und die Live-addierenden Timeline-Endpoints (`historicBookingTimeline`, `…TimelineExport`) zählen aus `stats_historic_appointments` nur noch Termine **vor heute** — seit dem 15-Minuten-Sync enthält die Tabelle auch den laufenden Tag, dessen Termine zusätzlich über die Live-Phorest-Abfrage kamen und dadurch doppelt zählten (alle 1/3/7/28-Tage-Werte des heutigen Stichtags waren um die heutige Terminzahl zu hoch). Ab heute sind die Live-Daten führend. Die Lazy-Varianten (`historicBookingTimelineFast/Weeks/Days`) addieren keine Live-Daten und bleiben unverändert.
