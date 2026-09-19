# Widerruf-Statistik

Interner Bericht zur Analyse eingehender Widerrufe: absolut, als Quote der Verkäufe, in Euro und im
Zeitverlauf (implementiert 07/2026 nach dem Statistik-Bauplan; Asana „Widerrufe im Berichtswesen").
Diese Seite beschreibt **Definitionen, Fallermittlung, Service, Cache, Routen und Frontend**; die
Bedienung Schritt für Schritt steht im Nutzerhandbuch.

**Zugang:** Hub → Berichte → Widerruf-Statistik
**URL:** `/hub/reports/revocation-statistics`
**Berechtigung:** `view_report_revocation_statistics` (eigene Permission; Standard-Vergabe an admin/super_admin, weitere Rollen im Hub freischaltbar)

!!! nutzerhandbuch "Bedienung: Berichte 5 – Widerruf-Statistik"
    [hilfe.hub.glattt.com/berichte/5/](https://hilfe.hub.glattt.com/berichte/5/) — den Bericht
    öffnen, Quote und Volumen, Gründe verstehen, Verbindung zu anderen Zahlen.

    Angrenzend: [Berichte 0 – So funktionieren die Berichte](https://hilfe.hub.glattt.com/berichte/0/)
    (Zeitraum, Standort, Kennzahlen-Zeile, Diagramm/Tabelle, Export) und die Serie
    [Widerrufe](https://hilfe.hub.glattt.com/widerrufe/) (Widerruf erfassen, Fall, Abwicklung).

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Definitionen](#definitionen)
    - [Sektionen der Seite](#sektionen-der-seite)
    - [Filter](#filter)
    - [Architektur](#architektur)
    - [Datenmodell & Fallermittlung](#datenmodell-fallermittlung)
    - [Service-Methoden](#service-methoden)
    - [Cache](#cache)
    - [Routen & Permission](#routen-permission)
    - [Frontend](#frontend)
    - [Registries](#registries)
    - [Tests](#tests)

---

## Für Anwender — Überblick

**Was der Bericht leistet.** Wie viele Verträge werden widerrufen, aus welchen Gründen, was kostet
das in Euro — und wo (Institut/Verkäufer:in) fallen Ausreißer auf? Die Widerrufsquote ist ein
Frühindikator für Beratungsqualität und Verkaufsdruck. Der Bericht zeigt die Entwicklung über
die Zeit (auch als Körperzonen), die Struktur der Widerrufe (Grund, Ergebnis, Erste-Sitzung-Effekt),
den Zeitraum bis zum Widerruf und die Quote im Vergleich nach Standort, Verkäufer:in, Vertragswert
und Paket-Umfang.

**Grundsätze:** Gezählt wird **ein Fall je Vertrag**. „Echte Widerrufe" sind akzeptierte Widerrufe
plus stornierte Verträge (Legacy-Widerrufe existieren teils nur als Storno); die Quote bezieht sich
auf **alle** Verträge inkl. Legacy-Import (Entscheidung Jan, 31.07.2026). Standardmäßig zählt ein
Widerruf im Monat des **Vertragsabschlusses** („Wie gut waren die Verträge dieses Monats?") —
junge Monate wirken dabei systematisch besser, weil Widerrufe noch eintreffen können; umschaltbar
auf das Widerruf-Datum. Die vollständigen Begriffe stehen unten unter [Definitionen](#definitionen).

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Bericht öffnen, Kennzahlen-Zeile lesen | Berichte 5 |
| Quote und Volumen, Gründe verstehen, Verbindung zu anderen Zahlen | Berichte 5 |
| Zeitraum, Datumsbasis, Verkäufer:in und Standort setzen; Diagramm/Tabelle; CSV-Export | Berichte 0 |
| Widerruf erfassen, Fall bearbeiten, Abwicklung, RA-Vorgang | Serie Widerrufe |
| Verkaufszahlen, auf die sich die Quote bezieht | Berichte 1 |

---

## Für Entwickler

### Definitionen

| Begriff | Bedeutung |
|---|---|
| **Widerrufs-Eingänge** | alle erfassten Widerrufe (ein Fall je Vertrag), unabhängig vom Ausgang |
| **Echte Widerrufe** | akzeptierte Widerrufe **plus** stornierte Verträge (Legacy-Widerrufe existieren teils nur als Storno ohne Widerrufs-Datensatz) |
| **Widerrufsquote** | echte Widerrufe ÷ **alle** Verträge inkl. Legacy-Import (Entscheidung Jan, 31.07.2026) |
| **Gefährdetes Volumen** | Gesamtvertragswert aller Eingänge |
| **Verlorenes Volumen** | Gesamtvertragswert der echten Widerrufe |

**Datumsbasis: Vertragsabschluss vs. Widerruf-Datum.** Standardmäßig zählt ein Widerruf im Monat des **Vertragsabschlusses** („Wie gut waren die Verträge dieses Monats?"). Umschaltbar auf **Widerruf-Datum** (Eingangsmonat). Die Vertrags-Basis der Quote bleibt immer dem Abschlussmonat zugeordnet. Achtung: Bei Datumsbasis „Vertragsabschluss" wirken junge Monate systematisch besser — Widerrufe können noch eintreffen.

### Sektionen der Seite

Alle Karten sind zweiseitig (Diagramm ⇄ Tabelle über das Karten-Register). Strukturgleiche
Auswertungen sind zu Karten mit **Dimensions-Umschalter** zusammengelegt (Jan, 31.07.2026); die
**Körperzonen** der widerrufenen Verträge laufen überall mit (KPIs, Trend-Tooltip/-Tabelle,
Vergleichs-Tabellen, Exporte).

| Sektion | Inhalt |
|---|---|
| **KPI-Zeile** | personalisierbar (kpi-dashboard): echte Widerrufe, Quote, verlorenes/gefährdetes Volumen, **widerrufene/gefährdete Körperzonen (KPZ)**, Eingänge, Ø Tage, Akzeptierungsquote, offene Fälle … — mit Vorperioden-Vergleich (Quoten in PP) |
| **Entwicklung über Zeit** | Metrik-Umschalter **Widerrufe ⇄ Körperzonen**: gestapelte Balken (echte Widerrufe + weitere Eingänge bzw. verlorene + weitere gefährdete KPZ) + Quote-Linie (Widerrufsquote bzw. **KPZ-Quote** = verlorene ÷ verkaufte KPZ); Tabelle nach Jahr/Quartal aufklappbar mit beiden Sichten |
| **Struktur der Widerrufe** | Dimensions-Umschalter: **Nach Grund** (Balken; „Keine Angabe" durch Legacy-Importe überzeichnet) · **Nach Ergebnis** (Donut: akzeptiert/abgelehnt/Upgrade/…) · **Erste Sitzung** (Widerrufe mit/ohne erste Behandlung, Akzeptierungsquote + Ø Tage) |
| **Zeitraum bis Widerruf** | Histogramm (0–7 … über 90 Tage) + Ø/Median im Kartenkopf |
| **Widerrufsquote im Vergleich** | Dimensions-Umschalter: **Standorte** (Institutsfarben + Quote-Linie, konfigurierte Reihenfolge) · **Verkäufer:innen** (Quote-Ranking, n am Balken, „Ohne Zuordnung" am Ende) · **Vertragswert**-Klassen · **Körperzonen**-Klassen (1–2 … ab 6 KPZ/GK) — identische Tabellen-Spalten inkl. verlorener KPZ |

### Filter

- **Zeitraum** (Standard: letzte 12 Monate) und **Datumsbasis** im Seitenkopf
- **Verkäufer:in**-Dropdown
- **Standort** über die globale Sidebar-Auswahl — wirkt serverseitig auf jede Karte
- **CSV-Export** im Seitenkopf: 9 Quellen (`revocation-*`, inkl. `revocation-zones`), alle mit Zeitraum- und Standort-Filter und KPZ-Spalten, Datumsbasis der Exporte = Vertragsabschluss

### Architektur

```
RevocationStatisticsService      app/Services/RevocationStatisticsService.php
RevocationStatisticsController   app/Http/Controllers/RevocationStatisticsController.php
ContractCancellationObserver     app/Observers/ContractCancellationObserver.php (via #[ObservedBy] am Model)
revocation-statistics.js         public/js/revocation-statistics.js
revocation-statistics.blade.php  resources/views/hub/reports/revocation-statistics.blade.php
partials/                        resources/views/hub/reports/revocation-statistics/partials/ (Header + 4 Register-Karten: trend, structure, days-between, compare)
widerrufsstatistik-card          resources/views/hub/reports/partials/overview-cards/widerrufsstatistik-card.blade.php
```

### Datenmodell & Fallermittlung

Zwei Widerrufsquellen, dedupliziert auf **einen Fall je Vertrag** (`cancellationCases()`):

1. `contract_cancellations` JOIN `contracts` (bei mehreren Sätzen zählt der neueste; `contracts.deleted_at` wird gefiltert — **`contract_cancellations` hat KEINE SoftDeletes**, anders als eine frühere Version dieser Doku behauptete)
2. **Synthetische Legacy-Fälle**: `contracts.status = 'cancelled'` ohne Cancellation-Satz → Grund `keine_angabe`, Reaktion `widerruf_akzeptiert`, Widerruf-Datum = `cancelled_at ?? signed_at`

„Echt" = `reaction = widerruf_akzeptiert` ODER `contracts.status = 'cancelled'`. Vertrags-Basis = alle Verträge mit `status != draft` (inkl. Legacy), zeitlich immer über `signed_at`. Tage-Berechnung und Histogramm laufen in PHP (kein `DATEDIFF` — SQLite-testbar); Monats-Gruppierung über den `monthExpr()`-Guard (DATE_FORMAT/strftime).

### Service-Methoden

`getKpis` (inkl. `lost_zones`/`at_risk_zones`/`sold_zones`), `getTrend` (lückenlose Monatsachse inkl. KPZ), `getByReason`, `getByReaction`, `getByBranch(filters, branchNames)` (SortsBranchIds!), `getBySeller` (Quote-Ranking, „Ohne Zuordnung" letzte Zeile), `getByZoneCount` (KPZ-Klassen), `getDaysBetween`, `getFirstSessionEffect`, `getContractValueComparison`, `getSellers`, `previousPeriodFilters`, `static flushCache()`.

Gemeinsame Filter: `date_from`, `date_to`, `date_mode` (`signed_at`|`cancellation_date`), `branch_id`, `seller_id` — **`branch_id` wirkt in jeder Teilabfrage**.

### Cache

`Cache::remember` mit Version-Counter `revocation-stats:version`, TTL 3600, Key `revocation-stats:s{schema}:v{v}:{methode}:{md5(filter)}`. `CACHE_SCHEMA` bei Änderungen am Antwort-Format hochzählen — sonst serviert der Cache nach dem Deploy bis zu 1h alte Strukturen. Invalidierung: `ContractCancellationObserver` (created/updated/deleted) **und** `ContractObserver` (Vertragsänderungen beeinflussen Basis und Storni).

### Routen & Permission

11 Routen unter `can:view_report_revocation_statistics` (`routes/web.php`): `index, kpis, trend, by-reason, by-reaction, by-branch, by-seller, by-zones, days-between, first-session, contract-value`. Permission via Migration `2026_07_31_100000_add_revocation_statistics_report_permission.php` (+ `PermissionSeeder`), Label „Bericht: Widerruf-Statistik", `group_key = berichte`.

### Frontend

`revocationStatisticsApp()` (eine Alpine-App) nach Bauplan: acquireChart-Muster mit animierten Übergängen (**ECharts**, nicht mehr Chart.js wie in der Ur-Spez), stabile Serien-ids, `sectionError` je Karte, deklarierte `_seq`-Guards, `dataVersion` in allen `x-for`-Keys, Trend-Tabelle via `chart-table.js`, Standort-Balken über `BranchColorService`.

### Registries

- `GlobalSearchService::PAGES` — Eintrag mit allen Sektionstiteln als Keywords
- `ReportExportService::SOURCES` — 9 Quellen `revocation-*` (filters `['range','branch']`, inkl. `revocation-zones`) + Resolver
- Berichte-Übersichtskachel mit KPI-Vorschau (per-id-Lookup auf das KPI-Array)

### Tests

```bash
php artisan test --filter=RevocationStatisticsPageTest
```

9 Tests (SQLite): Seiten-Skelett (inkl. Dimensions-/Metrik-Umschalter), Permission, Legacy-Union + beide Volumen + KPZ, KPZ-Klassen-Buckets, Datumsbasis-Umschaltung, Branch-Filter, Verkäufer-Ranking, Export-Quellen-Deklaration, Trend-CSV (inkl. KPZ-Spalten).
