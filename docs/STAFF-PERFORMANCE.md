# Mitarbeiterperformance

Die Mitarbeiterperformance zeigt, welche Berater wie viele Beratungsgespräche hatten und wie oft daraus am selben Tag ein Vertrag abgeschlossen wurde — inklusive Conversion-Rate, Körperzonen-Analyse und Standort-Vergleich.

**Zugang:** Hub → Berichte → Mitarbeiterperformance  
**URL:** `/hub/reports/staff-performance`  
**Berechtigung:** `view_report_sales_statistics`

---

## Für Endanwender

### Was zeigt diese Seite?

Die Mitarbeiterperformance beantwortet Fragen wie:

- Wie viele Beratungsgespräche hatte ein Mitarbeiter?
- In wie vielen davon wurde am selben Tag ein Vertrag abgeschlossen? (Conversion-Rate)
- Wie viele Körperzonen wurden pro Abschluss verkauft?
- Welcher Mitarbeiter hat die beste Conversion-Rate?
- Welches Institut hat die höchste Abschlussquote?
- Welche Körperzonen werden am häufigsten verkauft?

### Verknüpfungslogik

Eine Beratung zählt als **Abschluss**, wenn:

1. Am **exakt gleichen Kalendertag** ein Vertrag unterzeichnet wurde
2. Der Vertrag für den **gleichen Kunden** ist
3. Der Vertrag im **gleichen Standort** abgeschlossen wurde
4. Der Vertrag den Status **aktiv** oder **abgeschlossen** hat

Bei **mehreren Beratungen desselben Kunden am selben Tag** bekommt die **letzte Beratung** (späteste Uhrzeit) die Zuordnung zum Vertrag.

### Sektionen

#### KPI-Dashboard

Oben auf der Seite werden 8 Kennzahlen angezeigt:

| KPI | Beschreibung |
|-----|-------------|
| **Beratungen** | Gesamtanzahl der Beratungsgespräche |
| **Abschlüsse** | Anzahl Beratungen mit Vertragsabschluss am selben Tag |
| **Conversion-Rate** | Prozentsatz Beratung → Vertrag |
| **Ø Körperzonen** | Durchschnittliche Anzahl Körperzonen pro Abschluss |
| **Körperzonen gesamt** | Summe aller bei Abschlüssen verkauften Körperzonen |
| **Ganzkörper-Anteil** | Prozentsatz der Ganzkörper-Verträge bei Abschlüssen |
| **Ø Vertragswert** | Durchschnittlicher Vertragswert bei Abschlüssen |
| **Gesamtumsatz** | Summe aller Vertragswerte bei Abschlüssen |

Jede Kennzahl zeigt Vergleichswerte:
- **vs. Vormonat**: Veränderung zum letzten Monat
- **vs. Vorjahr**: Veränderung zum gleichen Monat im Vorjahr

#### Mitarbeiter-Ranking

Sortierbare Tabelle aller Mitarbeiter mit:

| Spalte | Beschreibung |
|--------|-------------|
| **#** | Rang |
| **Mitarbeiter** | Name des Beraters |
| **Standort** | Zugeordnete(r) Standort(e) |
| **Beratungen** | Anzahl Beratungsgespräche |
| **Abschlüsse** | Davon mit Vertrag am selben Tag |
| **Quote** | Conversion-Rate in % (farbcodiert) |
| **Ø KPZ** | Durchschnittliche Körperzonen pro Abschluss |
| **Σ KPZ** | Summe aller Körperzonen |
| **Ganzkörper** | Anzahl Ganzkörper-Verträge |
| **Σ Umsatz** | Gesamtumsatz aus Abschlüssen |

Die Quote ist farbcodiert:
- 🟢 **≥ 30%** — Grün (gut)
- 🟡 **≥ 15%** — Gelb (mittel)
- 🔴 **< 15%** — Rot (niedrig)

Per Klick auf das Detail-Icon öffnet sich ein Modal mit allen Beratungen des Mitarbeiters.

#### Standort-Vergleich

Diagramm (Doppelachse: Conversion-Rate + Ø Körperzonen) und Vergleichstabelle der Standorte. Zeigt, welches Institut die höchste Abschlussquote hat.

#### Monatlicher Zeitverlauf

Liniendiagramm der Conversion-Rate über die letzten 12 Monate. Umschaltbar zwischen Diagramm und Tabelle. Zeigt sowohl den Gesamt-Trend als auch die Einzeltrends pro Standort.

#### Körperzonen-Verteilung

Balkendiagramm der meistverkauften Körperzonen bei Abschlüssen. Aufgeschlüsselt pro Standort (Top 8 je Standort).

#### Mitarbeiter-Detailansicht (Modal)

Öffnet sich per Klick auf einen Mitarbeiter. Zeigt:

- **Übersicht**: Beratungen, Abschlüsse, Quote, Ø KPZ
- **Beratungsliste**: Alle Beratungen mit Datum, Uhrzeit, Standort, Typ, Ergebnis (Abschluss/Ganzkörper/Kein Abschluss), Körperzonen, Vertragswert

#### Mitarbeiter-Übersichtstabelle (8 Zeiträume)

Breite Tabelle ganz oben auf der Seite mit einer Zeile pro Mitarbeiter und 8 Zeitraum-Spaltengruppen:

| Zeitraum | Beschreibung |
|----------|-------------|
| **Heute** | Nur der heutige Tag |
| **Gestern** | Gestriger Tag |
| **Diese Woche** | Montag bis heute |
| **Letzte Woche** | Komplette Vorwoche (Mo–So) |
| **Dieser Monat** | 1. des Monats bis heute |
| **Letzter Monat** | Kompletter Vormonat |
| **Dieses Jahr** | 1. Januar bis heute |
| **Letztes Jahr** | Komplettes Vorjahr |

Pro Zeitraum werden jeweils drei Metriken angezeigt:

- **BG** — Beratungsgespräche (neutral, keine Farbkodierung)
- **CR** — Conversion-Rate in % (farbcodiert)
- **KpZ** — Ø Körperzonen pro Abschluss (farbcodiert)

**Farbkodierung** basiert auf konfigurierbaren Schwellenwerten (global oder pro Standort):

| Farbe | CR Standard | KpZ Standard |
|-------|------------|-------------|
| 🟢 Grün | ≥ 60% | ≥ 3,0 |
| 🟡 Gelb | ≥ 40% | ≥ 2,0 |
| 🔴 Rot | < 40% | < 2,0 |

**Features:**
- Sticky erste Spalte (Mitarbeitername) beim Horizontalscrollen
- Gesamtsumme in der Footer-Zeile (Conversions/Körperzonen aus Rohdaten berechnet)
- Toggle **„Nur Hub-Nutzer"** (Standard: aktiviert) filtert auf glatttHub-Accounts
- Badge zeigt aktive Mitarbeiter-Anzahl
- Sortierung nach Gesamtberatungen im aktuellen Jahr

**Multi-StaffId-Zusammenführung:** Ein Hub-Nutzer kann mehrere Phorest-StaffIds haben (eine pro Standort). Diese werden automatisch zusammengeführt:

1. Über `user_id` aus der `users`-Tabelle (Hub-Account)
2. Über identischen Namen aus der `phorest_staff`-Tabelle (Fallback für Staff ohne Hub-Account)

Zusammengeführte Mitarbeiter zeigen alle Standorte kommasepariert.

#### Zielwerte konfigurieren (Modal)

Über den Button **„Zielwerte"** im Seitenkopf öffnet sich ein Modal zur Konfiguration der Farbschwellenwerte.

**Features:**
- Pill-Buttons zur Standort-Auswahl: „Standard (Alle)" + ein Button pro Standort
- Pro Standort/Standard jeweils 6 Felder:
  - **KpZ**: Zielwert, Grün-Schwelle, Gelb-Schwelle
  - **CR**: Zielwert (%), Grün-Schwelle (%), Gelb-Schwelle (%)
- Standort-Einträge die identisch zum Standard sind, werden beim Speichern automatisch entfernt
- Änderungen werden sofort in der Tabelle wirksam (ohne Seitenreload)
- Zielwerte auch über Filament-Admin änderbar (`/admin/staff-performance-settings`)

### Standort-Filter

Der Standort-Filter in der Seitenleiste filtert alle Daten auf ein bestimmtes Institut. Bei Wechsel werden alle Sektionen automatisch neu geladen.

### Datums-Filter

Über Datums-Filter (Von/Bis) kann der Auswertungszeitraum eingeschränkt werden.

---

## Für Entwickler

### Architektur

Die Seite folgt dem bewährten Statistik-Muster: **Controller → Service → JSON-API → Alpine.js**.

```
StaffPerformanceController (app/Http/Controllers/)
├── index()            → Blade-View rendern
├── kpis()             → JSON: 8 KPI-Metriken mit Vergleichswerten
├── staffRanking()     → JSON: Mitarbeiter-Ranking
├── branchComparison() → JSON: Standort-Vergleich
├── monthlyTrend()     → JSON: Monatlicher Zeitverlauf
├── bodyZones()        → JSON: Körperzonen-Verteilung
├── staffDetail()      → JSON: Einzelansicht pro Mitarbeiter
├── overview()         → JSON: Übersichtstabelle (8 Zeiträume, Staff-Merging)
├── targets()          → JSON: Zielwerte lesen (GET)
├── saveTargets()      → JSON: Zielwerte speichern (POST)
└── preview()          → JSON: 4 Preview-KPIs für Reports-Hauptseite

StaffPerformanceService (app/Services/)
├── getKpis()                  → KPI-Berechnung mit Vormonat/Vorjahr-Vergleich
├── getStaffRanking()          → Ranking nach Conversion-Rate
├── getBranchComparison()      → Vergleich aller Standorte
├── getMonthlyTrend()          → 12-Monats-Trend (gesamt + pro Branch)
├── getBodyZoneDistribution()  → Meistverkaufte Körperzonen
├── getStaffDetail()           → Einzelne Beratungen eines Mitarbeiters
├── getStaffOverview()         → 8-Zeitraum-Übersicht mit Staff-Merging + Targets
├── getPreviewKpis()           → 4 Werte für Reports-Übersicht
└── flushCache()               → Cache-Invalidierung (statisch)

StaffPerformanceTarget (app/Models/)
├── globalDefaults()    → Standard-Schwellenwerte (branch_id = NULL)
├── forBranch(?string)  → Schwellenwerte für bestimmten Standort (Fallback auf Global)
└── allTargetsMap()     → Map: '_default' + branch_id → Schwellenwerte
```

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `app/Http/Controllers/StaffPerformanceController.php` | Controller mit Filter-Extraktion |
| `app/Services/StaffPerformanceService.php` | Core-Logik: CTEs, Aggregation, Caching, Staff-Merging |
| `app/Models/StaffPerformanceTarget.php` | Zielwerte-Model (global + pro Standort) |
| `app/Filament/Pages/StaffPerformanceSettings.php` | Filament-Admin: Globale Zielwerte |
| `resources/views/hub/reports/staff-performance.blade.php` | Haupt-View |
| `resources/views/hub/reports/staff-performance/partials/header.blade.php` | Seitenkopf + Zurück-Button + Zielwerte-Button |
| `resources/views/hub/reports/staff-performance/partials/overview-table.blade.php` | Übersichtstabelle (8 Zeiträume) + Hub-only Toggle |
| `resources/views/hub/reports/staff-performance/partials/targets-modal.blade.php` | Zielwerte-Modal (Pill-Buttons, pro Standort) |
| `resources/views/hub/reports/staff-performance/partials/staff-ranking.blade.php` | Mitarbeiter-Tabelle |
| `resources/views/hub/reports/staff-performance/partials/branch-comparison.blade.php` | Standort-Vergleich + Chart |
| `resources/views/hub/reports/staff-performance/partials/monthly-trend.blade.php` | Monatstrend + Chart |
| `resources/views/hub/reports/staff-performance/partials/body-zones.blade.php` | Körperzonen-Verteilung |
| `resources/views/hub/reports/staff-performance/partials/staff-detail-modal.blade.php` | Detail-Modal |
| `public/js/staff-performance.js` | Alpine.js App + Chart.js + Targets + Staff-Merging |
| `resources/views/hub/reports.blade.php` | Preview-Card auf Berichte-Übersicht |
| `tests/Feature/StaffPerformanceTest.php` | Feature-Tests |

### SQL-Kernlogik (CTEs)

Die Datenverknüpfung basiert auf zwei Common Table Expressions (CTEs):

```sql
WITH ranked AS (
    -- Alle Beratungsgespräche mit Rang pro Client/Tag/Branch
    SELECT sha.staff_id, sha.client_id, sha.branch_id,
           sha.appointment_date, sha.start_time,
           ROW_NUMBER() OVER (
               PARTITION BY sha.client_id, sha.appointment_date, sha.branch_id
               ORDER BY sha.start_time DESC
           ) as rn
    FROM stats_historic_appointments sha
    WHERE sha.service_id IN (Beratungs-Service-IDs)
      AND sha.activation_state = 'ACTIVE'
      AND sha.state = 'COMPLETED'
      AND sha.deleted IS NULL OR sha.deleted = 0
),
contract_agg AS (
    -- Verträge voraggregiert pro Client/Branch/Tag
    -- Verhindert Row-Multiplikation bei mehreren Verträgen pro Tag
    SELECT c.client_id, c.branch_id, DATE(c.signed_at) as signed_date,
           COUNT(*) as contract_count,
           SUM(c.body_zone_count) as total_body_zones,
           SUM(CASE WHEN c.is_full_body = 1 THEN 1 ELSE 0 END) as full_body_count,
           SUM(c.total_value_cents) as total_revenue_cents
    FROM contracts c
    WHERE c.status IN ('active', 'completed')
      AND c.signed_at IS NOT NULL AND c.deleted_at IS NULL
    GROUP BY c.client_id, c.branch_id, DATE(c.signed_at)
)
SELECT r.staff_id,
       COUNT(*) as total_consultations,
       SUM(CASE WHEN r.rn = 1 AND ca.contract_count > 0 THEN 1 ELSE 0 END) as conversions,
       SUM(CASE WHEN r.rn = 1 AND ca.contract_count > 0 THEN ca.total_body_zones ELSE 0 END) ...
FROM ranked r
LEFT JOIN contract_agg ca
    ON ca.client_id = r.client_id
    AND ca.signed_date = r.appointment_date
    AND ca.branch_id = r.branch_id
    AND r.rn = 1
GROUP BY r.staff_id
```

**Wichtige Details:**
- `ROW_NUMBER()` partitioniert nach (client_id, appointment_date, branch_id) mit `ORDER BY start_time DESC` → `rn=1` = letzte Beratung des Tages
- `contract_agg` CTE voraggregiert Verträge, damit der LEFT JOIN nie Row-Multiplikation verursacht
- Die `AND r.rn = 1` Bedingung im JOIN stellt sicher, dass nur die letzte Beratung den Abschluss zugeordnet bekommt

### Datengrundlagen

| Tabelle | Rolle |
|---------|-------|
| `stats_historic_appointments` | Beratungstermine (aus Phorest synchronisiert) |
| `contracts` | Verträge (im GlattHub erstellt) |
| `contract_body_zones` | Pivot: Welche Körperzonen pro Vertrag |
| `body_zones` | Körperzonen-Stammdaten |
| `phorest_staff` | Staff-Mapping: Phorest-ID → GlattHub-User |
| `staff_performance_targets` | Konfigurierbare Zielwerte (global + pro Standort) |

### Beratungs-Service-IDs (Phorest)

| Service-ID | Name |
|------------|------|
| `rqo_e_VJWl12uqy2YWImSg` | Gratis Online-Beratung |
| `z_mUzNH2LUzr2LqO1I-OTQ` | Beratungstermin |
| `_rlfuXQaRrHoB0r4nklZJw` | Beratung ohne Termin |

### Staff-Mapping

```
stats_historic_appointments.staff_id
    → phorest_staff.phorest_user_id (oder phorest_staff.staff_id)
    → phorest_staff.glatthub_user_id
    → users.id
```

Der Service prüft sowohl `phorest_user_id` als auch `staff_id`, da die Phorest-API unterschiedliche ID-Typen verwendet.

### Staff-Merging (Multi-StaffId-Zusammenführung)

Ein Mitarbeiter kann in Phorest mehrere `staffId`-Einträge haben (einen pro Standort). In der Übersichtstabelle werden diese automatisch zusammengeführt:

**Merge-Key-Strategie (Priorität):**

1. **`user_{userId}`** — Mitarbeiter hat einen GlattHub-Account (`users.phorest_staff_ids` enthält die staffId). Gilt als Hub-User.
2. **`name_{md5(name)}`** — Gleicher Name in `phorest_staff`-Tabelle (Fallback für Mitarbeiter ohne Hub-Account). Gilt NICHT als Hub-User.
3. **Rohe `staffId`** — Kein Mapping gefunden. Nur als Fallback.

**Aggregation bei Zusammenführung:**
- `consultations`, `conversions`, `body_zones` → Summe
- `conversion_rate` → Neuberechnung: `conversions / consultations * 100`
- `avg_zones_per_contract` → Neuberechnung: `body_zones / conversions`
- `branches_list` → Vereinigung aller Standorte (kommasepariert)

### Zielwerte-Tabelle (`staff_performance_targets`)

```sql
CREATE TABLE staff_performance_targets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_id VARCHAR(255) NULL UNIQUE,  -- NULL = globaler Standard
    kpz_target DECIMAL(8,2) DEFAULT 3.00,
    cr_target DECIMAL(8,2) DEFAULT 60.00,
    kpz_green DECIMAL(8,2) DEFAULT 3.00,
    kpz_yellow DECIMAL(8,2) DEFAULT 2.00,
    cr_green DECIMAL(8,2) DEFAULT 60.00,
    cr_yellow DECIMAL(8,2) DEFAULT 40.00,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

- `branch_id = NULL` → Globale Standardwerte
- `branch_id = '{phorest_branch_id}'` → Standort-spezifische Überschreibung
- Nur Standort-Einträge die vom Standard abweichen werden gespeichert

### Caching

- **TTL:** 3600 Sekunden (1 Stunde)
- **Versionierung:** `staff-perf:v{N}:{method}:{filter_hash}`
- **Invalidierung:** Automatisch über `ContractObserver` bei Vertrags-Erstellen/Ändern/Löschen
- **Manuelle Invalidierung:** `StaffPerformanceService::flushCache()` — wird beim Speichern von Zielwerten aufgerufen, damit Farbänderungen sofort wirksam werden

### Datenbank-Indexes

Für optimale Performance existieren dedizierte Composite-Indexes:

| Tabelle | Index | Spalten |
|---------|-------|---------|
| `stats_historic_appointments` | `sha_client_date_branch_idx` | `client_id, appointment_date, branch_id` |
| `contracts` | `contracts_client_branch_signed_idx` | `client_id, branch_id, signed_at` |

Migration: `2026_06_25_100000_add_staff_performance_contract_index.php`

### API-Endpunkte

| Methode | URL | Beschreibung |
|---------|-----|-------------|
| GET | `/hub/reports/staff-performance` | Hauptseite (Blade-View) |
| GET | `/hub/reports/staff-performance/kpis` | 8 KPI-Metriken |
| GET | `/hub/reports/staff-performance/staff-ranking` | Mitarbeiter-Ranking |
| GET | `/hub/reports/staff-performance/branches` | Standort-Vergleich |
| GET | `/hub/reports/staff-performance/monthly` | Monatlicher Zeitverlauf |
| GET | `/hub/reports/staff-performance/body-zones` | Körperzonen-Verteilung |
| GET | `/hub/reports/staff-performance/staff/{staffId}` | Mitarbeiter-Detail |
| GET | `/hub/reports/staff-performance/overview` | Übersichtstabelle (8 Zeiträume) |
| GET | `/hub/reports/staff-performance/targets` | Zielwerte lesen |
| POST | `/hub/reports/staff-performance/targets` | Zielwerte speichern |
| GET | `/hub/reports/staff-performance/preview` | 4 Preview-KPIs |

**Filter-Parameter** (alle optional):
- `branch_id` — Standort-ID
- `date_from` — Datum ab (YYYY-MM-DD)
- `date_to` — Datum bis (YYYY-MM-DD)

### Preview-Card (Reports-Hauptseite)

Die Reports-Übersicht (`/hub/reports`) zeigt eine Vorschau-Karte mit 4 KPIs des aktuellen Monats:

| KPI | Beschreibung |
|-----|-------------|
| **Ø Körperzonen** | Durchschn. KPZ pro Abschluss |
| **Conversion-Rate** | Beratung → Vertrag in % |
| **Top Ø KPZ** | Bester Mitarbeiter nach Ø Körperzonen |
| **Top Conversion** | Bester Mitarbeiter nach Conversion-Rate |

### Permission

- **Permission-Name:** `view_report_sales_statistics`
- **Beschreibung:** Nutzt dieselbe Berechtigung wie die Verkaufsstatistik
- **Standard-Zuweisung:** Admin-Rolle

### Tests

```bash
# Alle StaffPerformance-Tests
php artisan test --filter=StaffPerformance
```

**Hinweis:** Die meisten Tests benötigen MySQL (wegen CTEs + ROW_NUMBER) und werden auf SQLite automatisch übersprungen. 2 Permission-Tests laufen auch auf SQLite.

---

## Performance-Optimierungen

Die Staff-Performance-Seite zeigt hunderte Datenzellen, Badges und Charts gleichzeitig. Folgende Optimierungen wurden implementiert, um Ruckeln (Jank) und hohe Render-Kosten zu vermeiden.

### Backend (Query-Konsolidierung)

| Methode | Vorher | Nachher | Maßnahme |
|---------|--------|---------|----------|
| `getStaffOverview()` | 8 Queries (1 pro Zeitraum) | 1 Query | Alle 8 Zeiträume in einer CTE mit `CASE WHEN`-Aggregation |
| `calculateKpiComparisons()` | 3 Queries | 1 Query | Vorperiode + Vergleich in einer Query |
| `getMonthlyTrend()` | 2 Queries | 1 Query | Overall + per-Staff in einer Query via `WITH ROLLUP` |
| `getStaffMap()` | Jeder Aufruf neu | Instance-Cache | Einmal laden, danach aus `$this->staffMapCache` |

### Frontend (Alpine.js)

| Optimierung | Beschreibung |
|-------------|-------------|
| **`x-html` statt Template-Loops** | Übersichtstabelle (`_overviewBodyHtml`, `_overviewTfootHtml`) und Ranking-Tabelle (`_rankingBodyHtml`) werden als HTML-Strings vorgebaut und via `x-html` gerendert. Eliminiert tausende Alpine-Bindings und `x-for`-Loops. |
| **`deepFreeze()`** | Alle API-Responses werden mit `Object.freeze()` (rekursiv) eingefroren. Verhindert, dass Alpine.js Proxies um die Datenobjekte wickelt — spart erheblich Memory und Reaktivitäts-Overhead. |
| **Batched State Changes** | `Promise.allSettled()` für parallele API-Calls, dann alle State-Updates in einem Batch. Verhindert mehrfache Re-Renders während des Ladens. |
| **CSS-Variable-Cache** | `getCssVars()` cached Chart-Farben aus CSS-Variablen. Ein `MutationObserver` auf `<html>` invalidiert den Cache bei Dark-Mode-Wechsel (`.dark`-Klasse). |
| **`_monthlyReversed`** | Vorberechnetes umgekehrtes Array für die Monatstrend-Tabelle — kein `.slice().reverse()` bei jedem Render. |
| **`x-if` statt `x-show` im Targets-Modal** | Tabs im Zielwerte-Modal nutzen `x-if` statt `x-show`. Nur der aktive Tab existiert im DOM (~350 DOM-Nodes eingespart). |
| **`content-visibility: auto`** | Below-the-fold-Sektionen (Ranking, Standort-Vergleich, Monatstrend, Körperzonen) nutzen `content-visibility: auto` mit `contain-intrinsic-size`. Der Browser rendert diese erst beim Scrollen. |
| **Ranking-Buttons via CustomEvent** | Buttons in `x-html`-gerendertem HTML können keine Alpine-Direktiven nutzen. Stattdessen: `onclick="window.dispatchEvent(new CustomEvent('show-staff-detail', {detail: staffId}))"` mit Listener in `init()`. |

### CSS (Globaler `backdrop-filter`-Bann)

**Problem:** Die CSS-Eigenschaft `backdrop-filter: blur()` erzeugt pro Element eine GPU-Compositing-Layer. Bei hunderten gleichzeitig sichtbaren Badges (`.badge-glattt`) und der Seiten-Wrapper-Klasse `.dashboard-surface` führte das zu massiven Render-Kosten und spürbarem Ruckeln.

**Lösung:** Alle 67 `backdrop-filter`-Deklarationen wurden global aus `theme_glattt.css` entfernt. Stattdessen werden halbtransparente Hintergründe über CSS-Variablen (`--card-glass-bg`, `--glass-bg`) verwendet — visuell kaum unterscheidbar, aber ohne GPU-Compositing-Overhead.

**Regel:** `backdrop-filter` darf in keiner CSS-Klasse verwendet werden. Diese Regel ist in den Coding-Instructions und im Design-System-Agent verankert.
