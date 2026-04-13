# Verkaufsstatistik

Die Verkaufsstatistik zeigt eine umfassende Analyse der Vertragsverkäufe — pro Institut und pro Mitarbeiter, inklusive Hochrechnung bis zum Monatsende.

**Zugang:** Hub → Berichte → Verkaufsstatistik  
**URL:** `/hub/reports/sales-statistics`  
**Berechtigung:** `view_report_sales_statistics`

---

## Für Endanwender

### Was zeigt diese Seite?

Die Verkaufsstatistik gibt einen Überblick über alle abgeschlossenen Verträge (aktiv + abgeschlossen). Sie beantwortet Fragen wie:

- Wie viele Verträge wurden diesen Monat abgeschlossen?
- Wie hoch ist der Gesamtumsatz?
- Welches Institut verkauft am meisten?
- Welche/r Mitarbeiter/in hat die beste Verkaufsleistung?
- Wie wird der Monat voraussichtlich enden? (Hochrechnung)

### Sektionen

#### KPI-Dashboard

Oben auf der Seite werden 8 Kennzahlen angezeigt:

| KPI | Beschreibung |
|-----|-------------|
| **Verträge** | Gesamtanzahl der Verträge im Zeitraum |
| **Gesamtumsatz** | Summe aller Vertragswerte (€) |
| **Ø Vertragswert** | Durchschnittlicher Vertragswert |
| **Monatl. Raten** | Summe der monatlichen SEPA-Raten |
| **Ø Körperzonen** | Durchschnittliche Anzahl Körperzonen pro Vertrag |
| **Ganzkörper-Anteil** | Prozentsatz der Ganzkörper-Verträge |
| **SEPA / Direkt** | Verhältnis der Zahlungsmethoden |
| **Stornoquote** | Anteil stornierter Verträge |

Jede Kennzahl zeigt Vergleichswerte:
- **vs. Vormonat**: Veränderung zum letzten Monat
- **vs. Vorjahr**: Veränderung zum gleichen Monat im Vorjahr

#### Monatliche Übersicht

Zeigt die Verkaufsentwicklung über die letzten 12 Monate als Tabelle oder Diagramm (umschaltbar).

- **Aktueller Monat** ist farblich hervorgehoben und enthält die Hochrechnung (Prognose)
- **Δ VM**: Veränderung zum Vormonat in Prozent
- **Δ VJ**: Veränderung zum gleichen Monat letztes Jahr

#### Ranking nach Institut

Alle Institute, sortiert nach Gesamtumsatz. Die Top 3 sind hervorgehoben:
- 🥇 Gold (Platz 1)
- 🥈 Silber (Platz 2)
- 🥉 Bronze (Platz 3)

Enthält pro Institut: Vertragsanzahl, Umsatz, Ø Vertragswert, monatliche Raten, Körperzonen, Ganzkörper-Anteil, Hochrechnung und Δ-Vergleiche.

#### Ranking nach Mitarbeiter

Wie das Institut-Ranking, aber pro Verkäufer/in. Mitarbeiter, die in mehreren Instituten verkaufen, werden zusammengefasst.

**Hinweis:** Ältere Legacy-Verträge ohne zugeordneten Verkäufer erscheinen hier nicht, fließen aber in die anderen Sektionen ein.

### Standort-Filter

Der Standort-Filter in der Seitenleiste filtert alle Daten auf ein bestimmtes Institut. Bei Wechsel des Standorts werden alle Sektionen automatisch neu geladen.

### Hochrechnung

Die Hochrechnung (Prognose) schätzt die erwartete Vertragsanzahl und den Umsatz bis zum Monatsende. Sie wird mit einem blauen Badge gekennzeichnet.

Die Prognose basiert auf **Verkaufstagen** (Mo–Sa, ohne Sonn- und Feiertage) statt auf Kalendertagen. Dadurch werden Monate mit vielen Feiertagen (z.B. Ostern, Weihnachten) fair mit normalen Monaten verglichen.

Bei einem Standort-Filter werden die **regionalen Feiertage** des jeweiligen Bundeslandes berücksichtigt. Ohne Standort-Filter zählen nur **bundesweite Feiertage**.

Die Prognose wird **exakter, je mehr historische Daten** vorhanden sind:
- **≥ 12 Monate Daten**: Berücksichtigt zusätzlich saisonale Schwankungen (Vorjahresvergleich)
- **≥ 3 Monate Daten**: Gewichteter Durchschnitt historischer Verkaufsmuster pro Verkaufstag
- **< 3 Monate Daten**: Einfache lineare Hochrechnung auf Basis der Verkaufstage

---

## Für Entwickler

### Architektur

Die Seite folgt dem bewährten Statistik-Muster: **Controller → Service → JSON-API → Alpine.js**.

```
SalesStatisticsController (app/Http/Controllers/)
├── index()          → Blade-View rendern
├── kpis()           → JSON: 8 KPI-Metriken
├── monthly()        → JSON: Monatliche Übersicht + Hochrechnung
├── branches()       → JSON: Institut-Ranking
├── sellers()        → JSON: Mitarbeiter-Ranking
└── projection()     → JSON: Detail-Hochrechnung

SalesStatisticsService (app/Services/)
├── getKpis()                → KPI-Berechnung mit Vergleichswerten
├── getMonthlyOverview()     → Monatsdaten mit Δ-Werten
├── getBranchRanking()       → Institut-Ranking + Projektionen
├── getSellerRanking()       → Mitarbeiter-Ranking + Projektionen
└── getProjection()          → Gesamt-Hochrechnung (Detail)
```

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `app/Http/Controllers/SalesStatisticsController.php` | Controller mit Filter-Extraktion |
| `app/Services/SalesStatisticsService.php` | Alle Queries, Caching, Hochrechnungs-Logik |
| `resources/views/hub/reports/sales-statistics.blade.php` | Haupt-View |
| `resources/views/hub/reports/sales-statistics/partials/header.blade.php` | Seitenkopf |
| `resources/views/hub/reports/sales-statistics/partials/monthly-overview.blade.php` | Monatstabelle + Chart |
| `resources/views/hub/reports/sales-statistics/partials/branch-ranking.blade.php` | Institut-Ranking |
| `resources/views/hub/reports/sales-statistics/partials/seller-ranking.blade.php` | Mitarbeiter-Ranking |
| `public/js/sales-statistics.js` | Alpine.js App + Chart.js Integration |
| `resources/views/hub/reports.blade.php` | Berichte-Übersicht (Report-Card) |

### Datengrundlage

- **Tabelle:** `contracts`
- **Relevante Status:** `active`, `completed` (über `SALE_STATUSES` Konstante)
- **Verkaufsdatum:** `signed_at` (Unterschriftsdatum)
- **Umsatz-Metriken:** `total_value_cents` (Gesamtwert) + `monthly_amount_cents` (SEPA-Rate)
- **Geldbeträge:** In Cents gespeichert, Frontend rechnet `/100` für Anzeige

### Caching

- **TTL:** 3600 Sekunden (1 Stunde)
- **Versionierung:** Versionierter Cache-Key (`sales-stats:v{N}:{method}:{filter_hash}`)
- **Invalidierung:** Automatisch durch TTL; manuell über Cache-Version-Bump

### Hochrechnungs-Algorithmus

Der Algorithmus ist 3-stufig und wird auf Vertragsanzahl, Gesamtumsatz und monatliche Rate angewendet.

**Grundlage: Verkaufstage** statt Kalendertage. Verkaufstage = Mo–Sa ohne Feiertage.
Feiertage werden über den `HolidayService` (spatie/holidays, regional pro Bundesland) ermittelt.
Bei Standort-Filter: regionale Feiertage. Ohne Filter: nur bundesweite Feiertage.

Helper-Methoden:
- `countSellingDays(start, end, holidays)` — Zählt Verkaufstage in einem Datumsbereich
- `getNthSellingDay(yearMonth, n, holidays)` — Findet das Kalenderdatum des N-ten Verkaufstags

**Stufe 1 — Historical Weighted** (≥3 historische Monate):
```
Für jeden historischen Monat:
  N = Verkaufstage bis heute im aktuellen Monat
  cutoff = Kalenderdatum des N-ten Verkaufstags im hist. Monat  
  ratio = (Verkäufe bis cutoff) / (Gesamt-Verkäufe des Monats)
  
Gewichtung: Neuere Monate werden stärker gewichtet (exponentiell ansteigende Gewichte)
projection = aktuelle_verkäufe / gewichteter_durchschnitt(ratios)
```

**Stufe 2 — Historical Seasonal** (≥12 historische Monate):
```
Zusätzlich zur gewichteten Ratio:
  YoY-Wachstumsrate = (gleicher_monat_vorjahr − gleicher_monat_vor2jahren) / vor2jahren
  projection = historical_projection × (1 + yoyGrowth × 0.3)
```

**Stufe 3 — Linear Fallback** (<3 historische Monate):
```
projection = (aktuelle_verkäufe / verkaufstage_bisher) × verkaufstage_gesamt
```

Die Hochrechnung wird angewendet auf:
- Gesamt (alle Branches) — `calculateMonthProjection()`
- Pro Branch — `calculateBranchProjections()`
- Pro Seller — `calculateSellerProjections()`

Die Rückgabe enthält zusätzlich `selling_days_passed` und `total_selling_days`.

### Permission

- **Permission-Name:** `view_report_sales_statistics`
- **Beschreibung:** `Bericht: Verkaufsstatistik`
- **Standard-Zuweisung:** Admin-Rolle

### Tests

```bash
# Alle Sales-Statistics-Tests
php artisan test --filter=SalesStatistics

# Nur Feature-Tests
php artisan test --filter=SalesStatisticsTest

# Nur Unit-Tests
php artisan test --filter=SalesStatisticsServiceTest
```

**Hinweis:** 5 Feature-Tests benötigen MySQL (wegen `DATE_FORMAT`) und werden auf SQLite automatisch übersprungen.
