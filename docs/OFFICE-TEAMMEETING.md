# Office-Teammeeting

Berichtsseite für das wöchentliche Office-Teammeeting: die Kennzahlen aller
Office-Bereiche — Kundenservice, Widerrufe, SEPA, Forderungsmanagement, HR und
Ads — auf einer Seite, immer für das **laufende Jahr**, je Monat der **Stand zum
Monatsende** und für den laufenden Monat der Stand am Tag des Aufrufs
(gebaut 10.09.2026 nach Jans Vorgabe, KPI-Wünsche SEPA/Forderungen von Janine
aus Asana „KPIs Sepas & Forderungen").

**URL:** `/hub/reports/office-meeting` · **Recht:** `view_report_office_meeting`
(bei Einführung an alle Rollen mit `view_receivables` vergeben, also admin und Büro).

---

## Für Endanwender

### Aufbau der Seite

Die Seite hat bewusst **keine Zeitraum-Auswahl**: Sie zeigt immer das laufende
Jahr ab 1. Januar. Der Standortfilter der Sidebar wirkt auf alle Karten, die
Institute kennen (nicht auf die Kundenservice-Tickets — Zendesk kennt keine
Institute). Oben die personalisierbare KPI-Zeile (laufender Monat bis heute,
Vergleich zum Vormonat), darunter sechs Bereiche mit je einer oder mehreren
zweiseitigen Karten (Diagramm ⇄ Tabelle über das Register am Kartenrand).

| Bereich | Karte | Kennzahl | Herkunft |
|---|---|---|---|
| 0 Verkauf | Körperzonen pro Institut | verkaufte KPZ je Institut und Monat, Zoom-Regler ab Jahresbeginn | Verkaufsstatistik |
| 0 Verkauf | Körperzonen pro Tag | KPZ je Tag und Institut mit Beratungen, Zoom-Regler | Verkaufsstatistik |
| 0 Verkauf | Aktueller Buchungsstand | gebuchte Beratungen heute / 3 / 7 / 14 / 28 Tage je Institut | Zukünftige Beratungen |
| 1 Kundenservice | Kundenservice-Tickets | Ø von Kunden eröffnete Tickets pro Woche; Median der ersten Reaktion (Kalenderstunden) — ohne Zahlungsmanagement | neu (Zendesk-Spiegel) |
| 2 Widerrufe | Entwicklung über Zeit (KPZ-Ansicht) | alle widerrufenen KPZ je Vertragseingangsmonat, davon akzeptiert / abgewimmelt / offen; KPZ-Quote und **Abwimmelquote** | Widerruf-Statistik, erweitert |
| 3 SEPA | Rücklastschriften pro Monat | RLS-Quote nach Anzahl und Wert plus **Rückläufer gesamt (Wert)** = Sicht des Kontoauszugs | Verkaufsstatistik, erweitert |
| 3 SEPA | SEPA: innerhalb 30 Tagen gezahlt | Anteil der RLS-Fälle je Eröffnungsmonat, die in der Zahlungserinnerungs-Phase binnen 30 Tagen bezahlt wurden (Anzahl und Wert) | neu |
| 3 SEPA | Lastschriften-Bestand & Einzugsvolumen | aktive Mandate und Einzugsvolumen Soll/Ist (Wachstum im Vergleich) | Verkaufsstatistik |
| 4 Forderungen | Forderungsbestand je Monatsende | Gesamtforderung nach Töpfen: geparkt, gerichtlich, Ratenzahlung, Rest | neu (Snapshots) |
| 5 HR | Fluktuation & Betriebszugehörigkeit | seit Jahresbeginn fortgeschriebene Fluktuationsquote; Ø Zugehörigkeit in Jahren je Monatsende | neu (auf HR-Kennzahlen aufgesetzt) |
| 6 Ads | Monatliche Ads-Entwicklung | Leads (Ads-Buchungen) und Verträge pro Monat | Ads-Analyse |
| 6 Ads | Kostenverlauf & Kosten pro Lead | CPL gesamt und je Plattform | Ads-Analyse |
| 6 Ads | Entwicklung geplanter Beratungsgespräche | Beratungen in den nächsten 28 Tagen je Stichtag, gleitender 7-Tage-Ø | Zukünftige Beratungen |

### Was die Zahlen genau bedeuten

**Kundenservice.** Gezählt werden Tickets, deren Anfragender ein Endkunde ist
und die nicht von einem Agenten angelegt wurden — Mahn-Mails des Hubs und für
Kunden angelegte Tickets fallen heraus, ebenso die Gruppe „Zahlungsmanagement"
(sie steht nur zur Einordnung in Tooltip und Tabelle) und gelöschte Tickets.
Tickets ohne Gruppe zählen zum Kundenservice. „Pro Woche" = Tickets des Monats
÷ Tage des Monats × 7; im laufenden Monat nur die verstrichenen Tage. Der
Median der ersten Reaktion nimmt nur Tickets, die bereits eine Agenten-Antwort
haben — der laufende Monat sinkt also typischerweise noch.

**Widerrufe.** Zuordnung nach dem Monat des Vertragsabschlusses (Vertragseingang).
Der Balkenstapel ist die Summe aller widerrufenen Körperzonen: akzeptierte
(inkl. stornierte Verträge), **abgewimmelte** (Widerruf abgelehnt, Vertrag läuft
unbelastet weiter) und offene bzw. umgewandelte (Upgrade, Downgrade, Korrektur,
Laufzeit). **Abwimmelquote = Anteil der widerrufenen KPZ, der nicht akzeptiert
wurde** (100 % minus akzeptierte ÷ alle widerrufenen KPZ; August 2026: 79 von 96
= 82,3 %) — Präzisierung Jan 10.09.2026 nach dem ersten Blick auf die Karte.
Diese Karte wird bewusst **immer live** gerechnet, weil Widerrufe zu einem
Vertragsmonat später eintreffen können.

**SEPA.** „Rückläufer gesamt (Wert)" zählt endgültig geplatzte **und**
nachgezahlte Raten — das ist die Zahl aus dem Kontoauszug (Janine: „wie bislang").
„Innerhalb 30 Tagen gezahlt" ist eine Kohorte je Eröffnungsmonat des Falls: ein
Fall zählt, wenn er spätestens 30 Tage nach Eröffnung mit Ausgang „Beglichen"
geschlossen wurde und dabei nie über die 2. Zahlungserinnerung hinauskam. Ein
Monat ist erst vollständig, wenn auch sein letzter Fall 30 Tage alt ist („Kohorte
läuft noch").

**Forderungen (Janines Töpfe).**

| Topf | Regel |
|---|---|
| Geparkt | ruhende Fälle (Geparkt / Beim Anwalt / Wartend) **und** Fälle nach PfÜB bzw. in der Vollstreckungs-Überwachung (Jan: „die sollten eigentlich ruhend sein") |
| Ratenzahlung | Stufe RZV oder aktive Ratenzahlungsvereinbarung — auch nach gerichtlichem Verfahren |
| Gerichtlich | Bereich „gerichtlich" vom Antrag Mahnbescheid bis zum PfÜB |
| Rest (akut) | alles Übrige: Zahlungserinnerungen und Mahnungen per Mail und Post |

Bestände lassen sich nicht rückwirkend rekonstruieren. Der nächtliche Snapshot
(23:30) läuft seit 09/2026 — August und frühere Monate bleiben leer (Start mit
September, Entscheidung Jan 10.09.2026). Der laufende Monat wird live gerechnet.

**HR.** Fluktuation seit Jahresbeginn = kumulierte Austritte seit 1. Januar ÷
durchschnittliche Kopfzahl der bisherigen Monate, über alle Mitarbeitenden
inklusive Büro und Geschäftsführung. Ø Betriebszugehörigkeit zum Monatsende in
Jahren mit einer Nachkommastelle; Personen ohne gepflegtes Eintrittsdatum in
askDANTE fallen aus dem Durchschnitt und werden gezählt ausgewiesen.

**Ads.** Leads = Ads-Buchungen aus dem Buchungstracking (Klick-ID oder bezahltes
Medium), nicht die von Meta gemeldeten Leads. CPL = Meta- plus Google-Ausgaben ÷
Ads-Buchungen. Die beiden Ads-Karten starten **erst im April 2026** (davor ist
die Datenlage nicht belastbar — Jan 10.09.2026); technisch hängen sie in einem
eigenen Rahmen mit späterem `date_from` (`adsStatFilters` in `office-meeting.js`). Die Beratungs-Karte zeigt je Stichtag die gebuchten Beratungen
der kommenden 28 Tage, über 7 Tage geglättet; die Historie reicht bis 2023, der
Start-Zoom liegt auf dem laufenden Jahr.

### KPI-Zeile

Vier Kacheln ohne Ausklappen (die Auswahl richtet sich jeder selbst ein).
Laufender Monat bis heute, Vergleich zum Vormonat: Tickets pro Woche, Median
erste Reaktion, Abwimmelquote, Rückläufer-Quote (Wert), binnen 30 Tagen gezahlt,
Gesamtforderung (plus die vier Töpfe), Fluktuation seit Jahresbeginn, Ø
Unternehmenszugehörigkeit, Ads-Buchungen, Kosten pro Lead (gesamt), geplante
Beratungen (28 Tage). Auswahl und Reihenfolge merkt sich der Browser.

### CSV-Export

Im Export-Modal stehen die vier Office-eigenen Quellen (Tickets, 30-Tage-Kohorte,
Forderungsbestand, HR-Jahr) sowie die eingebetteten Karten der anderen Bereiche
(Rücklastschriften, Einzugsvolumen, Widerrufs-Trend, Ads-Monate, Buchungsstand).

---

## Für Entwickler

### Architektur

```
OfficeMeetingController          app/Http/Controllers/OfficeMeetingController.php
OfficeMeetingService             app/Services/Statistics/OfficeMeetingService.php   (4 Statistiken + KPIs)
OfficeKpiSnapshotService         app/Services/Statistics/OfficeKpiSnapshotService.php (Töpfe, Snapshot, Live-Stand)
ZendeskTicketSyncService         app/Services/Zendesk/ZendeskTicketSyncService.php  (Incremental-Export → zendesk_tickets)
office-meeting.blade.php         resources/views/hub/reports/office-meeting.blade.php (+ partials/header)
statistics/office/*.blade.php    vier Partials der office.*-Statistiken
public/js/statistics/office.js   vier Komponenten (GlatttStats.register)
public/js/office-meeting.js      Seiten-App (statFilters = laufendes Jahr + Standort + date_mode)
Commands                         zendesk:sync-tickets (04:45), office-kpis:snapshot (23:30)
```

### Registry-Einträge

- `StatisticRegistry`: Kategorie `office`, Statistiken `office.tickets`,
  `office.paid-within-30`, `office.receivables-stock`, `office.hr-year` —
  damit auch im Eigenen Dashboard wählbar. Die übrigen Karten der Seite sind
  bestehende Statistiken (`widerrufe.trend`, `sales.chargebacks`, `sales.mrr`,
  `ads.monthly-development`, `ads.cost-per-lead`, `termine.booking-outlook`).
- `KpiRegistry`: Quelle `office` (shape `map`, Vorperiode = Vormonat) mit den
  `office.*`-Kennzahlen; neu außerdem `widerrufe.rejection_rate` /
  `widerrufe.rejected_zones` (Quelle `widerrufe`) und `ads.cost_per_booking`
  (Quelle `ads`, kombinierte Kosten pro Lead). Die KPI-Zeile mischt Quellen
  über `KpiValueService::values(OfficeMeetingController::KPI_IDS, …)`.
- `ReportRegistry`: Eintrag `hub.reports.office-meeting` (Karte + Suche).
- `ReportExportService`: Quellen `office-*` (Seite `office-meeting`); eingebettete
  Fremdquellen erscheinen über das neue Feld `also_on` zusätzlich im Modal der
  Office-Seite.

### Voreinstellungen je Einbindung (`presets`)

Neu seit 10.09.2026: `<x-statistic statistic="…" :presets="[…]" />` legt
umschaltbare **Anzeige-Optionen** einer Komponente vor (`trendMetric`,
`horizon`, `movingAvg`, `zoomFrom`). Sie werden in `glattt-stats.js` vor
`setup()` auf die Instanz gelegt und ändern weder Endpoint noch Daten — die
Statistik bleibt einmal definiert. `zoomFrom` (ISO-Datum oder `YYYY-MM`) wird
von `sales.chargebacks`, `sales.mrr` und `termine.booking-outlook` über
`zoomFromPreset(keys)` in ein Start-Zoomfenster übersetzt.

### Zeitlogik

`OfficeMeetingService::monthSeries()` liefert je Monat Monatsanfang und das auf
`date_to` bzw. heute gekappte Monatsende („Stand am Tag des Aufrufs").
Flussgrößen (Tickets, Kohorte, Fluktuation) werden aus den Rohdaten gerechnet;
Bestandsgrößen kommen aus `office_kpi_snapshots` (Spalten `snapshot_date`,
`branch_id`, `metric`, `value`, Unique-Index über alle drei). Gelesen wird je
Monat der **letzte** Snapshot des Monats, der laufende Monat live über
`OfficeKpiSnapshotService::stockFor()`; Summen über die sichtbaren Institute
(`visibleBranch`-Makro, `BranchVisibility`). Snapshots werden für **alle**
Institute geschrieben, auch ausgeblendete — gefiltert wird beim Lesen.

Fallstricke, die beim Bau aufgefallen sind:

- **SQLite schreibt date-Casts als `Y-m-d 00:00:00`** — Vergleiche mit
  `<= 'Y-m-d'` verlieren den letzten Tag. Deshalb exklusive Obergrenzen
  (`< Folgetag`) und ein `upsert()` mit reinem Datums-String statt
  `updateOrCreate` mit dem Model-Cast.
- **`Http::get($url, [])` verwirft die Query der URL** — die `after_url` des
  Zendesk-Cursors muss in Basis-URL und Query zerlegt werden, sonst liefert der
  Export endlos die erste Seite (`ZendeskApiService::incrementalTickets()`).
- `created_at` ist bei `DebtCase::create()` nicht mass-assignable — Tests setzen
  das Eröffnungsdatum per Query-Update.

### Zendesk-Spiegel

Tabelle `zendesk_tickets` (nur Metadaten: Zeiten, Status, Gruppe, Rollen von
Anfragendem und Ersteller, Kanal, Tags, erste Reaktionszeit Kalender/Geschäft,
gelöst). Sync über den Incremental-Export mit Sideloads `metric_sets,users`;
Delta ab jüngstem lokalen `zendesk_updated_at` minus 2 h Überlappung, Erstlauf
`php artisan zendesk:sync-tickets --from=2026-01-01` (≈2.000 Tickets, 3 Seiten).
Rate-Limit des Endpoints 10/min → bei 429 wartet der Sync (`Retry-After`).
Gruppen-IDs in `config/zendesk.php` (`groups.support`, `groups.payment`).

### Cron

| Endpoint | Befehl | Zeit | Cloud-Scheduler-Job |
|---|---|---|---|
| `/api/cron/sync-zendesk-tickets` | `zendesk:sync-tickets` | 04:45 | `sync-zendesk-tickets` (angelegt 10.09.2026, Retries 3) |
| `/api/cron/snapshot-office-kpis` | `office-kpis:snapshot` | 23:30 | `snapshot-office-kpis` (angelegt 10.09.2026, Retries 3) |

Zuordnung in `App\Support\CronSchedule`, Prüfung mit `php artisan cron:audit`.

### Rechte

`view_report_office_meeting` — Migration `2026_09_10_100200`, Katalog
`PermissionCatalog`, Seeder. Die eingebetteten Fremdkarten prüfen zusätzlich
ihre eigene Permission (`view_report_revocation_statistics`,
`view_report_sales_statistics`, `view_report_ads_analysis`,
`view_report_upcoming_consultations`) — fehlt eine davon, fehlt die Karte.

### Tests

```bash
php -d memory_limit=1G vendor/bin/phpunit tests/Feature/OfficeMeeting
```

`OfficeMeetingPageTest` (Skelett, Rechte, Tickets-Median, 30-Tage-Kohorte,
Snapshot-Lesen, HR-Kumulation, KPI-Zeile, Export), `ZendeskTicketSyncTest`
(Cursor-Seiten, Rollen, Metriken, Delta-Start, Command),
`OfficeKpiSnapshotTest` (Töpfe, idempotenter Snapshot, Live-Stand).
