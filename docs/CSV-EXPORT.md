# CSV-Export der Berichts-Datenquellen

Wiederverwendbares Export-System: Auf jeder Berichtsseite gibt es im Seiten-Header
einen **Export-Button**, der ein Modal öffnet. Dort wählt man eine Datenquelle und
optional einen Zeitraum — der Download startet direkt als CSV-Datei.

---

## Für Endanwender

### Bedienung

1. Auf einer Berichtsseite (z.B. Verkaufsstatistik) oben rechts auf **Export** klicken.
2. Im Modal die **Datenquelle** wählen — angeboten werden nur die Auswertungen der
   jeweiligen Seite, für die man berechtigt ist.
3. Optional **Von/Bis** setzen. Ohne Angabe wird der Standard-Zeitraum der
   Datenquelle exportiert (z.B. letzte 12 Monate).
4. **CSV herunterladen** — eine Pack-Animation bestätigt den Start, danach schließt
   sich das Modal automatisch.

Ist auf der Seite ein **Standort-Filter** aktiv, wird er für Quellen mit
Standort-Bezug automatisch übernommen.

### Dateiformat

Die CSVs sind für **Excel (deutsch)** optimiert und lassen sich per Doppelklick öffnen:

- UTF-8 mit BOM (Umlaute korrekt)
- **Semikolon** als Spaltentrenner
- **Dezimal-Komma** (z.B. `1234,56`)
- Datumswerte als `TT.MM.JJJJ`
- Geldbeträge in Euro (nicht Cents), Spalten mit `(€)` gekennzeichnet

### Datenschutz

Es werden **ausschließlich Aggregate** exportiert (Monats-/Tages-/Standort-Summen,
Quoten, Rankings) — **keine personenbezogenen Daten** wie Kundennamen oder einzelne
Termine.

### Verfügbare Datenquellen je Seite

| Seite | Datenquellen |
|---|---|
| Verkaufsstatistik | Monatliche Übersicht, Körperzonen pro Tag & Institut, Ranking nach Institut, Ranking nach Mitarbeiter, Standort-Vergleich seit Eröffnung |
| Vergangene Beratungsgespräche | No-show-Statistik pro Monat & Institut |
| Zukünftige Beratungsgespräche | Geplante Beratungsgespräche pro Tag & Institut |
| Terminstatistik | Termine pro Monat & Institut, Behandelte Körperzonen pro Monat & Institut |
| Stornierte & gelöschte Termine | Stornierte & gelöschte Termine pro Monat & Institut |
| glattt-Pakete | Verkaufte Pakete pro Monat |
| Ads-Analyse | Monats-Trend (Kosten, Buchungen, Verträge), Kampagnen-Übersicht, Buchungsquellen pro Monat |
| Besucher-Funnel | Funnel-Schritte, Funnel nach Standort, Besucher-Quellen |
| Staff-Performance | Standort-Vergleich, Monats-Trend Beratungen & Conversion |
| Kundenstatistik | Conversion-Funnel, Demografie, Kundensegmente (Personas) |

---

## Für Entwickler

### Architektur

| Baustein | Datei | Zweck |
|---|---|---|
| Registry + Resolver | `app/Services/ReportExportService.php` | `SOURCES`-Konstante (Key → Label/Seite/Permission/Filter) und pro Quelle ein Resolver, der `['columns' => [key => Label], 'rows' => iterable]` liefert |
| Controller | `app/Http/Controllers/ExportController.php` | `GET /hub/exports/{key}` (`hub.exports.download`): 404 bei unbekanntem Key, 403 ohne Permission, streamt das CSV (BOM, Semikolon, Dezimal-Komma, `Y-m-d` → `d.m.Y`) |
| Modal-Komponente | `resources/views/components/export-modal.blade.php` | `<x-export-modal page="…" />` — filtert Quellen der Seite auf User-Permissions, flatpickr-Datumsfelder, Pack-&-Send-Animation, Button-Klasse `.btn-glattt-export` |
| Styles | `public/css/theme_glattt.css` | `.btn-glattt-export`, `.export-modal-glattt-*`, `.export-glattt-*` (Overlay-Animation) |
| Tests | `tests/Feature/ReportExportTest.php` | Format (BOM/Semikolon), Permissions, 404, Registry-Vollständigkeit, SQLite-sichere Resolver-Beispiele |

### Neue Export-Quelle anlegen

1. **Registry-Eintrag** in `ReportExportService::SOURCES`:
   ```php
   'mein-key' => [
       'label' => 'Anzeigename im Modal',
       'page' => 'seiten-slug',            // muss zum <x-export-modal page="…"> passen
       'permission' => 'view_report_x',    // exakt die Permission des Routen-Gates der Seite
       'filters' => ['range', 'branch'],   // welche Eingaben das Modal anbietet
   ],
   ```
2. **Resolver-Methode** schreiben und im `match` von `resolve()` verdrahten.
   Konventionen:
   - Nur **Aggregate**, keine personenbezogenen Daten.
   - Zahlen müssen exakt den UI-Werten entsprechen — wo möglich bestehende
     Service-Methoden aufrufen (`SalesStatisticsService`, `AdsAnalysisService`,
     `MatomoAnalysisService`, `StaffPerformanceService`, `ClientStatisticsService`).
     Wo die Seite ihre Aggregation im Controller hat (Terminstatistik, Stornos,
     Pakete), wird die Query im Export-Service gespiegelt — dann mit
     `monthExpr()` (DATE_FORMAT/strftime-Guard) für SQLite-Testbarkeit.
   - Cents → Euro über `euro()`; Spalten-Label mit `(€)` kennzeichnen.
   - Prozentwerte als Float liefern (der Controller macht das Dezimal-Komma).
3. **Seite einbinden** (falls neue Seite): `<x-export-modal page="seiten-slug" />` in
   die rechte Flex-Gruppe der Header-Card.
4. **Test** ergänzen (SQLite-sicher; MySQL-only-Service-Methoden nur via
   Permission-/Registry-Tests abdecken) und **Such-Registry**: Keyword `csv-export`
   am Seiten-Eintrag in `GlobalSearchService::PAGES`.

### Filter-Verhalten

- `date_from`/`date_to` (`Y-m-d`) kommen aus den flatpickr-Feldern des Modals;
  `branch_id` wird aus `localStorage.selectedBranch` der Seite übernommen —
  jeweils nur, wenn die Quelle den Filter in `filters` deklariert.
- Alle angebundenen Services verwenden dieselben Filter-Keys
  (`date_from`, `date_to`, `branch_id`).
- Der Besucher-Funnel filtert Standorte über Matomo-Slugs (`standort`), nicht über
  Phorest-Branch-IDs — die Funnel-Quellen deklarieren deshalb bewusst **kein**
  `branch`-Filter.

### Besonderheiten

- **Ads-Quellen** (`ads-monthly-trend`, `ads-campaigns`) nutzen
  `AdsAnalysisService` mit 1h-Cache; bei kaltem Cache können Meta/Google/Phorest
  live angefragt werden (wie beim Seitenaufruf selbst). `ads-sources-monthly`
  liest nur `booking_trackings`.
- **Streaming**: `response()->streamDownload()` + `fputcsv` — auch große Exporte
  laufen speicherschonend.
- Dateiname: `{key}_{date_from}_{date_to}.csv` bzw. `{key}_{heute}.csv`.
