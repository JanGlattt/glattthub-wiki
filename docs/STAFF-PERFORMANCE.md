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
└── preview()          → JSON: 4 Preview-KPIs für Reports-Hauptseite

StaffPerformanceService (app/Services/)
├── getKpis()                  → KPI-Berechnung mit Vormonat/Vorjahr-Vergleich
├── getStaffRanking()          → Ranking nach Conversion-Rate
├── getBranchComparison()      → Vergleich aller Standorte
├── getMonthlyTrend()          → 12-Monats-Trend (gesamt + pro Branch)
├── getBodyZoneDistribution()  → Meistverkaufte Körperzonen
├── getStaffDetail()           → Einzelne Beratungen eines Mitarbeiters
├── getPreviewKpis()           → 4 Werte für Reports-Übersicht
└── flushCache()               → Cache-Invalidierung (statisch)
```

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `app/Http/Controllers/StaffPerformanceController.php` | Controller mit Filter-Extraktion |
| `app/Services/StaffPerformanceService.php` | Core-Logik: CTEs, Aggregation, Caching |
| `resources/views/hub/reports/staff-performance.blade.php` | Haupt-View |
| `resources/views/hub/reports/staff-performance/partials/header.blade.php` | Seitenkopf + Zurück-Button |
| `resources/views/hub/reports/staff-performance/partials/staff-ranking.blade.php` | Mitarbeiter-Tabelle |
| `resources/views/hub/reports/staff-performance/partials/branch-comparison.blade.php` | Standort-Vergleich + Chart |
| `resources/views/hub/reports/staff-performance/partials/monthly-trend.blade.php` | Monatstrend + Chart |
| `resources/views/hub/reports/staff-performance/partials/body-zones.blade.php` | Körperzonen-Verteilung |
| `resources/views/hub/reports/staff-performance/partials/staff-detail-modal.blade.php` | Detail-Modal |
| `public/js/staff-performance.js` | Alpine.js App + Chart.js Integration |
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

### Caching

- **TTL:** 3600 Sekunden (1 Stunde)
- **Versionierung:** `staff-perf:v{N}:{method}:{filter_hash}`
- **Invalidierung:** Automatisch über `ContractObserver` bei Vertrags-Erstellen/Ändern/Löschen

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
