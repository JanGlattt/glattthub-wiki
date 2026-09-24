# CSV-Export der Berichts-Datenquellen

Wiederverwendbares Export-System: Auf jeder Berichtsseite gibt es im Seiten-Header einen
**Export-Button**, der ein Modal öffnet. Dort wählt man eine Datenquelle und optional einen
Zeitraum — der Download startet direkt als CSV-Datei. Diese Seite beschreibt **Grundsätze,
Dateiformat, Registry, Resolver und Filter-Verhalten** des Exports; die Bedienung Schritt für
Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Berichte 0 – So funktionieren die Berichte"
    [hilfe.hub.glattt.com/berichte/0/](https://hilfe.hub.glattt.com/berichte/0/) — Vorgang
    „Export und Verlässlichkeit": Export-Modal, Datenquelle und Zeitraum wählen, CSV in Excel öffnen.

    Angrenzend: die Anleitung des jeweiligen Berichts in der Serie
    [Berichte](https://hilfe.hub.glattt.com/berichte/) (Berichte 1–16) nennt die Export-Quellen der Seite.

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Grundsätze](#grundsatze)
    - [Dateiformat](#dateiformat)
    - [Verfügbare Datenquellen je Seite](#verfugbare-datenquellen-je-seite)
    - [Architektur](#architektur)
    - [Neue Export-Quelle anlegen](#neue-export-quelle-anlegen)
    - [Filter-Verhalten](#filter-verhalten)
    - [Besonderheiten](#besonderheiten)

---

## Für Anwender — Überblick

**Was der Export leistet.** Jede Auswertung einer Berichtsseite lässt sich als CSV mitnehmen —
mit genau den Zahlen, die die Seite zeigt, für Excel (deutsch) aufbereitet und per Doppelklick zu
öffnen. Angeboten werden je Seite nur die Datenquellen, für die man berechtigt ist; ein aktiver
Standort-Filter wird für Quellen mit Standort-Bezug übernommen, ein Zeitraum kann gesetzt werden
(sonst gilt der Standard-Zeitraum der Quelle, z.B. letzte 12 Monate).

**Grundsatz Datenschutz:** Exportiert werden **ausschließlich Aggregate** (Monats-/Tages-/
Standort-Summen, Quoten, Rankings) — nie personenbezogene Daten wie Kundennamen oder einzelne
Termine. Zahlen im Export entsprechen exakt den Werten im UI.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Export öffnen, Datenquelle und Zeitraum wählen, Datei in Excel öffnen | Berichte 0 („Export und Verlässlichkeit") |
| Welche Quellen ein bestimmter Bericht anbietet | Anleitung des Berichts (Berichte 1–16) |
| Zeitraum und Standort der Seite setzen | Berichte 0 |

---

## Für Entwickler

### Grundsätze

- **Nur Aggregate**, keine personenbezogenen Daten (Kundennamen, einzelne Termine).
- **Zahlen exakt wie im UI** — wo möglich dieselben Service-Methoden wie die Seite.
- Angeboten werden nur Quellen der jeweiligen Seite, für die der Nutzer die Permission des
  Routen-Gates besitzt; ohne Zeitraum gilt der Standard-Zeitraum der Quelle; der Standort-Filter
  der Seite (`localStorage.selectedBranch`) wird für Quellen mit `branch`-Filter übernommen.

### Dateiformat

Die CSVs sind für **Excel (deutsch)** optimiert und lassen sich per Doppelklick öffnen:

- UTF-8 mit BOM (Umlaute korrekt)
- **Semikolon** als Spaltentrenner
- **Dezimal-Komma** (z.B. `1234,56`)
- Datumswerte als `TT.MM.JJJJ`
- Geldbeträge in Euro (nicht Cents), Spalten mit `(€)` gekennzeichnet

### Verfügbare Datenquellen je Seite

| Seite | Datenquellen |
|---|---|
| Verkaufsstatistik | Monatliche Übersicht, Körperzonen pro Tag & Institut, Standort-Vergleich seit Eröffnung, Sales Mix (verkauft & Portfolio), Neukunden pro Monat & Institut, Lastschriften-Bestand & Einzugsvolumen (brutto & netto), Rücklastschriften pro Monat, Direktzahler-Segment (brutto & netto), **Verträge einzeln** (siehe unten) |
| Vergangene Beratungsgespräche | No-show-Statistik pro Monat & Institut |
| Zukünftige Beratungsgespräche | Geplante Beratungsgespräche pro Tag & Institut, Buchungsstand je Institut (7/14/28 Tage & Monatsende), Entwicklung geplanter Beratungsgespräche (Stichtags-Zeitreihe), Buchungsstand-Verlauf pro Monat (7/14/28 Tage), Freie Beratungsslots je Institut/Wochentag/Uhrzeit, Buchungsvorlauf-Verteilung |
| Terminstatistik | Termine pro Monat & Institut, Behandelte Körperzonen pro Monat & Institut, Termindauer pro Monat & Institut (Minuten), Top Services pro Monat (Ranking), Service-Kombinationen pro Monat (Ranking) |
| Stornierte & gelöschte Termine | Stornierte & gelöschte Termine pro Monat & Institut, Stornierte & gelöschte Termine pro Kalenderwoche & Institut |
| glattt-Pakete | Verkaufte Pakete pro Monat |
| Ads-Analyse | Monats-Trend (Kosten, Buchungen, Verträge), Kampagnen-Übersicht, Buchungsquellen pro Monat, Buchungen pro Tag, Herkunfts-Analyse (Letzte Seite vs. Einstieg), Suchbegriffe, Coupon-Code-Auswertung, Ads vs. Organisch |
| Besucher-Funnel | Funnel-Schritte, Funnel nach Standort, Besucher-Quellen |
| Staff-Performance | Standort-Vergleich, Durchgeführte Behandlungen pro Mitarbeiter, Monats-Trend Beratungen & Conversion |
| Kundenstatistik | Conversion-Funnel, Demografie, Kundensegmente (Personas), Herkunftsverteilung, Entfernungsverteilung, Körperzonen-Verteilung (inkl. Details), Widerrufs-Analyse, Einzugsgebiet: Kunden pro Postleitzahl |

---

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
  und `ads-sources-daily` (Langformat Tag × Quelle × Art) lesen nur
  `booking_trackings`; `ads-daily-bookings` enthält zusätzlich die
  plattform-gemeldeten Leads je Tag (Meta Klick-Leads, Google Conversions).
- **Streaming**: `response()->streamDownload()` + `fputcsv` — auch große Exporte
  laufen speicherschonend.
- Dateiname: `{key}_{date_from}_{date_to}.csv` bzw. `{key}_{heute}.csv`.

## Die eine Quelle mit Personenbezug

Seit 24.09.2026 gibt es auf der Verkaufsstatistik **`sales-contract-details`** —
„Verträge einzeln: Kunde, Institut, Körperzonen, Verkäuferin, Widerruf". Sie fällt aus
dem Rahmen, denn alle übrigen Quellen liefern ausschließlich Aggregate. Angefordert von
Jan am 24.09.2026, ausdrücklich **namensscharf**.

| Spalte | Herkunft |
|---|---|
| Vertragsnummer, Unterschrieben am, Körperzonen, Ganzkörper, Vertragsstatus | `contracts` |
| Institut | `BranchVisibility::allBranchNames()` |
| Kunde, Kundennummer | `client_statistics` über `phorest_client_id` |
| Verkäuferin | `users` — Vor- **und** Nachname, `users.name` ist nur ein Accessor |
| Widerrufseingang | frühestes `cancellation_date` des Vertrags |
| Widerrufsbestätigung | Reaktion steht auf „Widerruf akzeptiert" (Entscheidung Jan) |
| Reaktion auf den Widerruf | Klartext der Reaktion |

### Drei Dinge, die hier leicht still falsch werden

**Der Name steht nicht am Vertrag.** `contracts.client_id` ist eine Phorest-Kennung; Name
und Kundennummer kommen aus `client_statistics`. Fehlt dort ein Eintrag, bleibt die Zeile
im Export und sagt es offen („nicht in der Kundenstatistik: …"). Eine leere Namenszelle
wäre in einer namensscharfen Liste die gefährlichste Antwort.

**Ein Widerruf darf die Zeile nicht vervielfachen.** Zwei Widerrufsvorgänge an einem
Vertrag hätten bei einem Join zwei Zeilen ergeben und jede Auszählung verfälscht — daher
Unterabfragen.

**Die Standort-Bindung gilt hier wirklich.** Berichte übergehen `allowed_branch_ids`
bisher (offener Punkt in Asana); diese Quelle tut es nicht. Ein auf ein Institut
begrenztes Konto bekommt ausschließlich dessen Verträge — sonst ließe sich über den
Export der gesamte Kundenbestand ziehen, obwohl im Hub nur ein Institut offensteht.

Abgesichert durch `tests/Feature/SalesContractDetailsExportTest.php` (11 Tests).

!!! warning "Berechtigung"
    Die Quelle hängt wie alle anderen an `view_report_sales_statistics` (Entscheidung Jan,
    24.09.2026). Wer die Verkaufsstatistik sehen darf, kann also die Vertragsliste mit
    Namen ziehen — begrenzt auf die eigenen Institute.
