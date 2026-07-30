# Zukünftige Beratungsgespräche

Berichtsseite `/hub/reports/upcoming-consultations` — Übersicht über die geplanten Beratungsgespräche der nächsten 7/14/28 Tage inkl. Auslastung, historischen Vergleichen, freien Slots und Buchungsvorlauf.

> **Stand 30.07.2026:** Die Seite wurde vollständig auf den verbindlichen Statistik-Bauplan (Schema Verkaufsstatistik) umgebaut — Details im Abschnitt „Bauplan-Umbau".

## Für Endanwender

### KPI-Zeile

Oben auf der Seite steht die personalisierbare KPI-Zeile (Drag & Drop, Zahnrad-Symbol): Heute, Nächste 7/14/28 Tage, Bis Monatsende, Ø Auslastung (28 Tage) und Freie Slots (28 Tage). Die Auswahl wird pro Nutzer im Browser gespeichert.

### Karten der Seite

Alle Analyse-Karten sind zweiseitig: **Diagramm als Standard-Ansicht, Tabelle als Lasche** hinter dem Register am rechten Kartenrand (mobil: Segmented Control oben rechts).

| Karte | Diagramm | Tabelle |
|---|---|---|
| **Aktueller Buchungsstand** | Balken je Institut × Zeitfenster (Heute/7/14/28 Tage/Monatsende), Kennzahlen-Zeile darüber | Standort-Tabelle mit denselben Zeitfenstern |
| **Kalenderübersicht** | Kalender der nächsten 28 Tage (Termine, freie Slots, Auslastungs-Ampel; Ansicht „pro Standort" mit Mini-Balken; „+2 Wochen laden") — bewusste Ausnahme ohne Register: Der Kalender ist bereits die tabellarische Darstellung | — |
| **Entwicklung geplanter Beratungsgespräche** | Stichtags-Zeitreihe seit Juni 2023 (Zeitfenster 1/3/7/28 Tage, gleitender Ø, Gesamt/Standorte) | Stichtage gruppiert Jahr → Quartal → Monat; Gruppenzeilen zeigen den letzten Stichtag der Periode (Bestandsgröße, keine Summe) |
| **Historischer Buchungsvergleich** | Balken „Stand <Vergleichsdatum>" vs. „Aktuell" je Zeitfenster; Vergleichsdatum frei wählbar (flatpickr) | Standort-Aufschlüsselung mit Trend-Badges (aktuell mehr/weniger gebucht) |
| **Buchungsstand-Verlauf** | Linien 7/14/28 Tage über die Monats-Stichtage seit Juni 2023 | Heatmap-Tabelle mit aufklappbaren Wochen/Tagen (Lazy Loading) |
| **Freie Slots Analyse** | Heatmap Wochentag × Uhrzeit oder Wochentags-Balken (interner Umschalter), Gesamt/Standorte, Zeitraum-Filter | Freie Slots je Wochentag × Uhrzeit mit Summenspalte |
| **Buchungsvorlauf-Analyse** | Heatmap Wochentag × Uhrzeit oder Verteilungs-Histogramm, Durchschnitt/Median, Buchungstyp-Filter | Vorlauf (Tage) je Wochentag × Uhrzeit |

Jede Karte hat ein Info-Panel (ℹ️) mit Erklärung, Spaltenbeschreibung, Auffälligkeiten und Datenquelle. Der globale Standortfilter in der Sidebar wirkt auf alle Karten; bei einem einzelnen Institut zeigt die Seite die Instituts-Variante (Kennzahlen + Kalender statt Standort-Vergleich).

### CSV-Export

Über das Export-Modal im Seitenkopf (alle Quellen respektieren den Standortfilter):

- Geplante Beratungsgespräche pro Tag & Institut
- Buchungsstand je Institut (7/14/28 Tage & Monatsende)
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

### Fachliche Hinweise

- `getCurrentComparisonData()` liefert im Einzel-Standort-Modus jetzt die Zahlen aus `branch_stats` (vorher `null` → keine „aktuell"-Vergleiche im Branch-Modus).
- Buchungsstand-Zahlen sind **Bestandsgrößen** — in Tabellen-Gruppenzeilen niemals summieren (chart-table `agg: 'last'`).
