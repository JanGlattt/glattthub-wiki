# Report-Mails — Berichte & Kennzahlen automatisch per E-Mail

Berichte einmal einrichten und danach automatisch per Mail erhalten, ohne sich
im Hub anzumelden. Jedes Abo hat einen frei wählbaren Zeitplan, einen
Berichtszeitraum, einen optionalen Standortfilter und kombinierbare
Ausgabeformate.

## Für Endanwender

### Eigene Report-Mails (Selfservice im Hub)

Unter **Report-Mails** in der Sidebar (Recht `manage_own_report_mails`, an
`view_reports`-Rollen vergeben) richtet sich jede Nutzerin eigene Report-Mails
ein — Empfänger ist dabei immer die eigene Hub-Adresse:

- **Inhalt**: Ein mehrstufiger Wizard (Muster des Dashboard-Wizards) stellt
  einzelne Statistiken/Tabellen aus allen Berichten frei zusammen, bringt sie
  per Drag & Drop in eine persönliche Reihenfolge und gibt **je Position einen
  eigenen Datenhorizont** (leer = Standard-Zeitraum des Abos). Dazu optional
  eine Kennzahlen-Zeile aus dem KPI-Katalog. Wählbar ist nur, was die Nutzerin
  auch im Hub sehen darf.
- **Zeitplan**: täglich, wöchentlich (Wochentag) oder monatlich (1.–28.),
  Uhrzeit in 30-Minuten-Schritten.
- **Berichtszeitraum**: frei je Abo (gestern, letzte Woche, letzter Monat,
  letztes Quartal, laufender Monat, …) — wird bei jedem Versand neu aufgelöst.
- **Formate** (kombinierbar): Kernzahlen im Mailtext, PDF im Anhang (mit
  Charts), Excel/CSV im Anhang (ab 4 Dateien automatisch als ZIP), Link in den
  passenden Hub-Bericht mit vorbelegtem Zeitraum.
- **Testversand** schickt das Abo sofort an die eigene Adresse; das Ergebnis
  landet im Versandprotokoll auf derselben Seite.

Jede Mail trägt im Fuß einen **Abmelde-Link** (mit Bestätigungs-Schritt, damit
Mail-Scanner nicht versehentlich abmelden). Ein gelöschtes Abo versendet nichts
mehr, das Protokoll bleibt erhalten.

### Admin-Verwaltung (Filament, Gruppe „Report-Mails")

Mit dem Recht `manage_report_mails` (an `manage_settings`-Rollen vergeben)
stehen im Admin-Backend drei Bereiche bereit:

- **Report-Mail-Abos**: Abos für beliebige Besitzer und Empfängerlisten
  (mehrere Hub-Nutzer, externe Adressen), inkl. „Jetzt senden".
- **Externe Empfänger**: einzeln freigegebene Adressen (z.B. Steuerberatung) —
  regelmäßig überprüfen, Kennzahlen liegen nach dem Versand dauerhaft in
  fremden Postfächern.
- **Versandprotokoll**: jede Zustellung mit Status, Zeitraum, Inhalt und
  Fehlergrund; fehlgeschlagene Zustellungen lassen sich erneut anstoßen.

### Rechte-Regeln (Entscheidung 11.08./16.08.2026)

1. Der Inhalt ist **immer durch die Rechte des Abo-Besitzers begrenzt** —
   niemand versendet, was er selbst im Hub nicht sehen dürfte.
2. Zusätzlich gelten die Rechte des **Empfängers**. Versand darüber hinaus ist
   **nur Administratoren** erlaubt (Schalter „Rechte-Überschreitung" am Abo im
   Filament) und wird **in jedem Fall im Protokoll markiert**.
3. **Externe Empfänger** haben keine Hub-Rechte — sie erhalten Inhalte nur über
   die protokollierte Überschreitung, und **personenbezogene Mitarbeiterdaten
   (HR-Kennzahlen, Mitarbeiterperformance) nie** — ohne Ausnahme.
4. Die **Datensichtbarkeit** (`data_scope`) greift je Empfänger: Branch-Scope
   erhält höchstens den eigenen Standort (bei genau einem erlaubten Standort
   wird er erzwungen); passt der Abo-Standortfilter nicht, entfällt der Inhalt.
   Inhalte, die deshalb oder wegen fehlender Rechte entfallen, werden in der
   Mail unter „Nicht enthalten" ausgewiesen.

## Für Entwickler

### Bausteine

| Baustein | Ort |
|---|---|
| Katalog Bericht → Export-Seite/KPI-Quelle | `app/Services/ReportMail/ReportMailCatalog.php` |
| Inhalts-Zusammenstellung + Rechte | `app/Services/ReportMail/ReportMailContentService.php` |
| Rendering (Mail/PDF/CSV/Link) | `app/Services/ReportMail/ReportMailRenderer.php` |
| Chart-Ableitung aus Export-Tabellen | `app/Services/ReportMail/ChartOptionBuilder.php` |
| ECharts-SSR + Rasterung | `app/Services/ReportMail/ChartImageRenderer.php` + `resources/node/render-chart.mjs` |
| Fälligkeit + Dispatch | `app/Services/ReportMail/ReportMailDispatchService.php`, Command `report-mails:dispatch` |
| Versand-Job (tries=1, Protokoll) | `app/Jobs/SendReportMailJob.php` |
| Zeitraum-Presets | `app/Support/ReportMailPeriod.php` |
| Models | `ReportMailSubscription`, `ReportMailRecipient`, `ReportMailExternalRecipient`, `ReportMailDelivery` |
| Selfservice | `ReportMailController`, `resources/views/hub/report-mails/`, `public/js/report-mails.js` |
| Abmelden (öffentlich) | `ReportMailUnsubscribeController`, `/shared/report-mail/abmelden/{token}` |
| Filament | `app/Filament/Resources/ReportMail*` (Gruppe „Report-Mails") |

### Inhalt: keine Doppel-Implementierung

Die Inhalte kommen vollständig aus den bestehenden Registries:

- **Positionen (`content_items`)** = geordnete Liste einzelner CSV-Export-
  Quellen (`ReportExportService::resolve(key, filters)`), je Position mit
  optional eigenem Zeitraum-Preset; gerendert als Tabelle (gekappt auf 200
  Zeilen, Hinweis im PDF) plus generisch abgeleiteter Chart. Die Berechtigung
  kommt je Quelle direkt aus `SOURCES[key]['permission']`.
- **Freie Kennzahlen** = `KpiValueService::values()` mit den IDs aus der
  `KpiRegistry`.
- Die Zuordnung Bericht → Export-Seite/KPI-Quelle ist nicht ableitbar
  (`hub.reports.debts` → `schulden` …) und liegt in `ReportMailCatalog::REPORTS`.
  **`ReportMailCatalogTest` bricht, sobald ein neuer Bericht in der
  ReportRegistry auftaucht, der dort nicht zugeordnet ist** — neue Berichte
  also immer mitpflegen (`page`, `kpi_source`, `external_blocked`).

### Serverseitige Charts (ECharts-SSR)

`ChartOptionBuilder` leitet aus jeder Export-Tabelle eine ECharts-Option ab
(erste Spalte = Rubriken, numerische Spalten = Serien, Balken ≤ 12 Rubriken,
sonst Linien; Legende `roundRect`, Lato, feste helle PDF-Palette, deutsche
Achsen-Zahlen via injiziertem Formatter im Node-Script). Rendering-Kette:

```
Option (PHP) → node resources/node/render-chart.mjs (echarts SSR → SVG)
            → rsvg-convert (2x PNG; Fallback ImageMagick) → data-URI im dompdf-PDF
```

- `echarts` ist echte npm-`dependency`; das Docker-Runtime-Image erhält
  `nodejs`, `rsvg-convert`, `fontconfig` (apk) und kopiert
  `node_modules/{echarts,zrender,tslib}` aus dem Frontend-Stage; Lato wird für
  librsvg über `fc-cache` registriert (Dockerfile).
- Scheitert ein Schritt, liefert `renderDataUri()` **null** und das PDF zeigt
  nur die Tabelle — **eine Report-Mail scheitert nie am Chart**.
- Lokal braucht es `node` (Homebrew) und idealerweise `librsvg`
  (`brew install librsvg`); Binary-Override via `REPORT_MAIL_NODE_BINARY`
  (`config/services.php` → `report_mail.node_binary`).

### Zeitplan & Versand

- `next_due_at` wird beim Speichern (saving-Hook) und nach jedem Versand
  vorberechnet — der Dispatcher (`report-mails:dispatch`, alle 15 Minuten,
  Minute 9/24/39/54) fragt nur diese Spalte ab und schreibt sie **vor** dem
  Job-Dispatch fort (kein Doppel-Versand bei hängenden Jobs).
- Prod: Cloud Scheduler → `POST /api/cron/dispatch-report-mails`
  (X-Cron-Token; **Job beim Deploy anlegen, mit `--max-retry-attempts=3`** —
  siehe CLOUD-SCHEDULER-SETUP.md).
- Der Versand-Job hat bewusst `tries = 1`: jeder Ausgang steht als Zeile im
  Protokoll (`report_mail_deliveries`) und wird von dort erneut angestoßen
  (Muster Terminerinnerungen). E-Mails laufen über `MailSettingsService::apply()`
  und landen damit automatisch im zentralen E-Mail-Protokoll (`EmailLog`,
  Label in `MAILABLE_LABELS`).

### Tabellen

`report_mail_subscriptions` (Zeitplan, `content_items` als geordnete
Positions-Liste mit Zeitraum je Position, Formate, SoftDeletes),
`report_mail_recipients` (User ODER externe Adresse, `unsubscribe_token`),
`report_mail_external_recipients` (freigegebene Adressen, SoftDeletes),
`report_mail_deliveries` (Protokoll mit Snapshot des versendeten Inhalts,
`exceeded_permissions`-Flag, bewusst ohne FK-Cascade).

### Tests

`tests/Feature/ReportMailTest.php` (Rechte, CRUD, Dispatcher, Rechte-Logik im
Inhalt inkl. Extern-Sperre, Versand-Job mit Protokoll, Abmelde-Flow),
`tests/Unit/ReportMailPeriodTest.php`, `ReportMailScheduleTest.php`,
`ReportMailCatalogTest.php` (Registry-Abgleich), `ReportMailChartOptionBuilderTest.php`.

### Bewusste Annahmen (v1)

- Selfservice versendet nur an die eigene Adresse; Abos für andere/externe nur
  im Filament (`manage_report_mails`).
- Mitarbeiterperformance zählt neben HR als personenbezogen → extern gesperrt.
- Empfänger mit `data_scope` „own" erhalten aggregierte Berichte nur über die
  protokollierte Admin-Überschreitung.
- Wechselt die Hausschrift im Admin, nutzen PDF-Texte die neue Schrift; die
  Chart-Bilder fallen auf eine registrierte Systemschrift zurück, bis die neue
  Schrift im Image registriert ist.
