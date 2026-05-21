# Widerrufsstatistik

Interner Bericht zur Analyse eingehender Widerrufe in den glattt-Instituten.

---

## Für Endanwender

### Was zeigt die Widerrufsstatistik?

Die Widerrufsstatistik zeigt eine detaillierte Übersicht über alle Widerrufe von Verträgen. Im Mittelpunkt steht die Frage: **Wie viele Kund:innen haben ihren Vertrag widerrufen, aus welchen Gründen, und wie wurde damit umgegangen?**

### Datumsbasis: Vertragsabschluss vs. Widerruf-Datum

Standardmäßig werden Widerrufe dem Monat des **Vertragsabschlusses** zugeordnet — also: "Wann wurde der Vertrag geschlossen, der später widerrufen wurde?" Das erlaubt eine Bewertung der Vertragsqualität je Monat.

Mit der Umschaltung auf **Widerruf-Datum** werden Widerrufe dem Monat zugeordnet, in dem sie eingegangen sind.

### Sektionen im Bericht

| Sektion | Beschreibung |
|---|---|
| **KPI-Kacheln** | Gesamtanzahl, Widerrufsquote, Ø Tage, Akzeptierungsquote, Statusverteilung |
| **Entwicklung über Zeit** | Monatliche Widerrufe und Quote als Trend-Chart (Diagramm oder Tabelle) |
| **Nach Widerrufsgrund** | Aufschlüsselung nach dem Grund des Widerrufs (z.B. Preis, Unzufriedenheit) |
| **Ergebnisse (Reaktions-Matrix)** | Wie wurden Widerrufe abgeschlossen? (akzeptiert, abgelehnt, Upgrade, ...) |
| **Zeitraum bis Widerruf** | Histogramm: Wie viele Tage lagen zwischen Vertragsabschluss und Widerruf? |
| **Erste-Sitzung-Effekt** | Vergleich: Erst-Kund:innen vs. Bestandskund:innen |
| **Vertragswert-Analyse** | Werden eher günstige oder teure Verträge widerrufen? |
| **Nach Standort** | Widerrufsquote pro Institut |
| **Nach Verkäufer:in** | Widerrufsquote je Verkäufer:in |

### Filter

- **Von / Bis**: Zeitraum einschränken
- **Datumsbasis**: Vertragsabschluss (Standard) oder Widerruf-Datum
- **Verkäufer:in**: Nur Widerrufe einer bestimmten Person
- **Standort**: Wird über die globale Standort-Auswahl (oben im Hub) gesteuert

---

## Für Entwickler

### Architektur

```
RevocationStatisticsService     app/Services/RevocationStatisticsService.php
RevocationStatisticsController  app/Http/Controllers/RevocationStatisticsController.php
ContractCancellationObserver    app/Observers/ContractCancellationObserver.php
revocation-statistics.js        public/js/revocation-statistics.js
revocation-statistics.blade.php resources/views/hub/reports/revocation-statistics.blade.php
partials/                       resources/views/hub/reports/revocation-statistics/partials/
widerrufsstatistik-card.blade   resources/views/hub/reports/partials/overview-cards/widerrufsstatistik-card.blade.php
```

### Datenmodell

- **`contract_cancellations`**: Haupttabelle — ein Eintrag pro Widerruf
  - `contract_id`: Verknüpfung mit `contracts`
  - `cancellation_date`: Datum des Widerrufs
  - `reason`: Widerrufsgrund (Enum: `ContractCancellation::REASON_*`)
  - `reaction`: Ergebnis (Enum: `ContractCancellation::REACTION_*`)
  - `status`: Bearbeitungsstatus (`offen`, `in_verhandlung`, `abgeschlossen`)
  - `first_session_completed`: Boolean — hatte die Kund:in schon eine Behandlung?
  - `deleted_at`: SoftDelete

- **`contracts`**: Verträge
  - `signed_at`: Vertragsabschluss-Datum (Basis für Datums-Filterung)
  - `branch_id`: Phorest-Standort-ID (String)
  - `seller_id`: FK → `users`
  - `total_value_cents`, `monthly_amount_cents`: Werte in Cent

### Service-Schicht

**`RevocationStatisticsService`** berechnet alle Kennzahlen. Zentrale Methoden:

| Methode | Beschreibung |
|---|---|
| `getKpis(filters)` | Gesamtzahlen, Quoten, Status-Zähler |
| `getTrend(filters)` | Monatlicher Verlauf (Widerrufe + Verträge) |
| `getByReason(filters)` | Aufschlüsselung nach Grund |
| `getByReaction(filters)` | Reaktions-Matrix |
| `getByBranch(filters, branchNames)` | Pro Standort |
| `getBySeller(filters)` | Pro Verkäufer:in |
| `getDaysBetween(filters)` | Histogramm + Statistiken |
| `getFirstSessionEffect(filters)` | Erst-Kund:innen-Vergleich |
| `getContractValueComparison(filters)` | Vertragswert-Analyse |
| `getSellers(filters)` | Verkäufer-Liste für Filter-Dropdown |
| `static flushCache()` | Cache invalidieren (via Version-Counter) |

**Wichtig**: `buildBaseQuery()` JOINt `contract_cancellations` mit `contracts` und filtert `deleted_at` für beide Tabellen manuell (da Raw-Queries, kein Eloquent SoftDeletes).

### Cache

- Treiber: `database`
- TTL: 3600 Sekunden
- Version-Counter: `revocation-stats:version` — wird bei `flushCache()` inkrementiert
- Cache-Key-Schema: `revocation-stats:v{version}:{methode}:{filter-hash}`
- Invalidierung: `ContractCancellationObserver` ruft `flushCache()` bei `created`, `updated`, `deleted`, `restored` auf

### Datumsbasis-Logik

Der `date_mode`-Parameter (`signed_at` oder `cancellation_date`) steuert, welches Datum für die Zeitraum-Filterung verwendet wird:
- `signed_at` (Standard): Filter auf `contracts.signed_at` — bewertet Vertragsqualität
- `cancellation_date`: Filter auf `contract_cancellations.cancellation_date` — bewertet eingehende Widerrufe

### Permission

| Permission | Bezeichnung |
|---|---|
| `view_report_revocation_statistics` | Bericht: Widerrufsstatistik |

Wird in `PermissionSeeder` definiert und für `admin`/`super_admin` automatisch vergeben.

### Routen

Alle Routen unter `hub.` prefix mit `check.hub` Middleware und `can:view_report_revocation_statistics` Gate:

```
GET /hub/reports/revocation-statistics            hub.reports.revocation-statistics
GET /hub/reports/revocation-statistics/kpis       hub.reports.revocation-statistics.kpis
GET /hub/reports/revocation-statistics/trend      hub.reports.revocation-statistics.trend
GET /hub/reports/revocation-statistics/by-reason  hub.reports.revocation-statistics.by-reason
GET /hub/reports/revocation-statistics/by-reaction
GET /hub/reports/revocation-statistics/by-branch
GET /hub/reports/revocation-statistics/by-seller
GET /hub/reports/revocation-statistics/days-between
GET /hub/reports/revocation-statistics/first-session
GET /hub/reports/revocation-statistics/contract-value
```

### Frontend

**`revocation-statistics.js`** enthält `revocationStatisticsApp()` als Alpine.js-Funktion.

**Wichtig**: Chart-Instanzen werden in Closure-Scope-Variablen (`let trendChartInstance`, ...) gespeichert, **nicht** als Alpine-Properties. Das verhindert den Chart.js-Proxy-Bug (Alpine reaktiviert Chart-Objekte, was zu Fehlern führt).

Charts:
- Trend: Bar+Line Combo (Chart.js)
- Widerrufsgrund: Horizontaler Balken
- Reaktion: Doughnut
- Histogramm (Tage): Balken

### SQLite-Kompatibilität

Die Queries verwenden `DATEDIFF(date1, date2)` — eine MySQL-spezifische Funktion. Tests die diese Queries auslösen werden in der SQLite-Test-Datenbank übersprungen (`markTestSkipped`). Auf dem Produktiv-System (MySQL) laufen alle Endpunkte fehlerfrei.

### Tests

```
tests/Feature/RevocationStatisticsTest.php   — Auth, Permission, HTTP-Endpunkte
tests/Unit/RevocationStatisticsServiceTest.php — Cache, Median, Histogramm
```
