# Report-Mails — Berichte & Kennzahlen automatisch per E-Mail

Berichte einmal einrichten und danach automatisch per Mail erhalten, ohne sich im Hub anzumelden.
Jedes Abo hat einen frei wählbaren Zeitplan, einen Berichtszeitraum, einen optionalen Standortfilter
und kombinierbare Ausgabeformate. Diese Seite beschreibt **Rechte-Regeln, Bausteine, Rendering-Kette,
Zeitplanung, Tabellen und bewusste Annahmen**; die Bedienung Schritt für Schritt steht im
Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: System 1 – Report-Mails einrichten"
    [hilfe.hub.glattt.com/system/1/](https://hilfe.hub.glattt.com/system/1/) — eine Report-Mail
    anlegen, Empfänger und Formate, Zustellung prüfen.

    Angrenzend: [Berichte 0 – So funktionieren die Berichte](https://hilfe.hub.glattt.com/berichte/0/)
    (woher die Inhalte stammen), [Admin 8 – Protokolle und Einstellungen](https://hilfe.hub.glattt.com/admin/8/),
    [Admin 1 – Benutzer und Rollen](https://hilfe.hub.glattt.com/admin/1/).

---

## Für Anwender — Überblick

**Wozu das Modul da ist.** Wer regelmäßig dieselben Zahlen braucht, soll sie bekommen, ohne sie sich
zu holen. Ein Abo bündelt vier Entscheidungen: **was** drinsteht (einzelne Statistiken und Tabellen
aus allen Berichten, in eigener Reihenfolge, dazu optional eine Kennzahlen-Zeile), **wann** es
kommt (täglich, wöchentlich, monatlich, zu einer festen Uhrzeit), **für welchen Zeitraum** gerechnet
wird (wird bei jedem Versand neu aufgelöst) und **in welcher Form** (Kernzahlen im Mailtext, PDF mit
Diagrammen, Excel/CSV im Anhang, Link in den passenden Hub-Bericht mit vorbelegtem Zeitraum —
kombinierbar).

**Zwei Wege, ein Modul.** Im Hub richtet sich jede Nutzerin unter **Report-Mails** eigene Abos ein;
Empfängerin ist dabei immer die eigene Hub-Adresse (Recht `manage_own_report_mails`). Abos für andere
Personen, für Empfängerlisten oder für **externe** Adressen (etwa die Steuerberatung) gibt es nur im
Admin-Backend (Recht `manage_report_mails`), zusammen mit der Liste freigegebener externer Adressen
und dem Versandprotokoll.

**Die Rechte-Regeln sind der Kern des Moduls** und gelten ohne Ausnahme: Niemand versendet, was er
selbst im Hub nicht sehen dürfte; zusätzlich zählen die Rechte der Empfängerin; personenbezogene
Mitarbeiterdaten gehen **nie** nach extern. Die vollständigen Regeln stehen unten unter
[Rechte-Regeln](#rechte-regeln) — sie sind auch für die Entwicklung
verbindlich. Jede Mail trägt im Fuß einen Abmelde-Link mit Bestätigungsschritt (damit
Mail-Scanner nicht versehentlich abmelden); ein gelöschtes Abo versendet nichts mehr, das Protokoll
bleibt erhalten.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Report-Mail anlegen, Empfänger und Formate, Zustellung prüfen | System 1 |
| Verstehen, woher die Inhalte kommen (Berichte, Kennzahlen, Export) | Berichte 0 |
| Rechte und Rollen der Empfänger | Admin 1 |
| Protokolle und E-Mail-Einstellungen | Admin 8 |

---

## Für Entwickler

### Rechte-Regeln

Entscheidung Jan, 11.08. und 16.08.2026:

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

**Rechte-Zuschnitt:** `manage_own_report_mails` (Selfservice, an `view_reports`-Rollen vergeben),
`manage_report_mails` (Admin-Verwaltung, an `manage_settings`-Rollen vergeben). Im Admin-Backend
(Filament-Gruppe „Report-Mails") liegen drei Bereiche: **Report-Mail-Abos** (beliebige Besitzer und
Empfängerlisten, inkl. „Jetzt senden"), **Externe Empfänger** (einzeln freigegebene Adressen —
regelmäßig überprüfen, Kennzahlen liegen nach dem Versand dauerhaft in fremden Postfächern) und das
**Versandprotokoll** (Status, Zeitraum, Inhalt, Fehlergrund; fehlgeschlagene Zustellungen lassen sich
erneut anstoßen).

### Umfang des Selfservice

Mehrstufiger Wizard nach dem Muster des Dashboard-Wizards: einzelne Statistiken/Tabellen aus allen
Berichten frei zusammenstellen, per Drag & Drop ordnen, **je Position ein eigener Datenhorizont**
(leer = Standard-Zeitraum des Abos), dazu optional eine Kennzahlen-Zeile aus dem KPI-Katalog.
Wählbar ist nur, was die Nutzerin auch im Hub sehen darf. Zeitplan: täglich, wöchentlich (Wochentag)
oder monatlich (1.–28.), Uhrzeit in 30-Minuten-Schritten. Berichtszeitraum frei je Abo (gestern,
letzte Woche, letzter Monat, letztes Quartal, laufender Monat, …). Der **Testversand** schickt das
Abo sofort an die eigene Adresse; das Ergebnis landet im Versandprotokoll derselben Seite.

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
