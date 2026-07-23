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

#### Vertragslaufzeiten

Balkendiagramm: **Wie viele Verträge zahlen in wie vielen Raten?** Jeder Balken steht für eine Laufzeit (Anzahl der Raten ≙ Monate), die Höhe ist die Anzahl der Verträge. 1 Rate = Einmalzahlung (Direktzahler).

Die Checkbox **„Nur aktive Verträge"** (standardmäßig aktiviert) beschränkt die Auswertung auf aktuell laufende Verträge; abgewählt zählen auch bereits abgeschlossene mit.

Der **Laufzeit-Modus-Schalter** wechselt zwischen drei Sichten:

- **Festgesetzt** (Standard) — die im Vertrag vereinbarte Ratenanzahl (`installment_count`); enthält alle Verträge inkl. Altbestand
- **Reale Raten** — die tatsächliche Anzahl nicht stornierter Raten im Zahlungsplan (weicht z.B. nach Gutschein-Verrechnung ab)
- **Monate** — Kalendermonate von der ersten bis zur letzten Rate (inkl. Pausen/Verschiebungen)

„Reale Raten" und „Monate" basieren auf dem Hub-Zahlungsplan: Verträge **ohne** Zahlungsplan (v.a. Legacy-Altbestand) werden dort ausgeblendet — die Anzahl steht als Hinweis unter dem Diagramm. Bei migrierten Altverträgen kann der Plan zudem erst ab der Migration beginnen (zeigt dann nur die Rest-Laufzeit). Generell gilt: Detaildaten auf Raten-Ebene gibt es erst seit Einführung von **GoCardless** — davor ist nur die festgesetzte Ratenanzahl bekannt.

**Ausreißer-Laufzeiten:** Angeboten werden nur 18/19/24 Monate; andere Werte im „Festgesetzt"-Modus stammen ausnahmslos aus dem Legacy-Altbestand (Analyse Juli 2026, 66 aktive GK-Fälle): (1) individuell verlängerte Ratenzahlung (Alt-System „länger", häufigster Fall), (2) beim Import übernommene *Rest*-Laufzeit teilbezahlter Verträge, (3) Import-Artefakt „25 statt 24" (v1-Formel `sepa_months + 1`), (4) alte Angebote (12-Monats-Pakete, 9er-Karten). Dokumentiert auch im Info-Panel der Card.

Über den **Körperzonen-Filter** im Card-Header lässt sich die Auswertung einschränken:

- **Alle Verträge** (Standard)
- **Nur Ganzkörper** — nutzt das Ganzkörper-Kennzeichen des Vertrags (`is_full_body`). Das ist genauer als eine feste KPZ-Zahl, weil Ganzkörper je nach Preisliste als 6 *oder* 7 Körperzonen definiert war
- **1–7 KPZ** — exakte Anzahl Körperzonen im Vertrag

Damit lässt sich z.B. direkt ablesen, wie viele Ganzkörper-Kunden in 24 bzw. 19 Monatsraten zahlen. Ungewöhnliche Laufzeiten (13, 17, 23 Raten …) stammen meist aus Vertragsänderungen oder Legacy-Importen.

#### Zahlungsausfälle nach Ratenfortschritt

Beantwortet die Frage: **Platzen Lastschriften häufiger, je weiter der Vertrag fortgeschritten ist** (z.B. wenn die Behandlung bereits abgeschlossen ist)?

Zwei Ansichten (Segmented-Control „Viertel / Ratenmonat"):

- **Viertel** — die Laufzeit jedes Ratenvertrags wird in vier gleiche Viertel geteilt; jede verarbeitete Rate wird ihrem Viertel zugeordnet (bei 24 Raten: Rate 1–6 → 1. Viertel, Rate 19–24 → 4. Viertel). Balkendiagramm + Detailtabelle
- **Ratenmonat** — Liniendiagramm mit der Ausfallquote **je einzelner Ratennummer** (Rate 1, 2, 3 …) zur **Kipppunkt-Suche**: gibt es einen Monat, ab dem die Quote sprunghaft steigt? Am besten mit dem Laufzeit-Filter kombinieren, damit „Rate N" überall denselben Fortschritt bedeutet

Je Ansicht zwei Quoten:

- **Geplatzt (offen)** — Raten, die aktuell auf `failed`/`chargedback` stehen
- **Jemals geplatzt** — zusätzlich Raten, die nach einer Rücklastschrift im Wiederholungsversuch doch noch bezahlt wurden (`retry_count > 0`)

**Filter:** Körperzonen (z.B. „Nur Ganzkörper") **und Laufzeit** (18 / 19 / 18,19 / 24 festgesetzte Raten) — damit lässt sich z.B. gezielt „Ganzkörper · 24 Raten" auswerten. Der Schalter **„% / Anzahl"** wechselt das Diagramm zwischen Ausfallquote und absoluter Anzahl geplatzter Raten (reine Anzeige-Umschaltung, kein Server-Request).

**Vergleichsmodus:** Die Checkbox „Vergleichen" blendet eine zweite Filter-Kombination als Serie B ein (eigene KPZ-/Laufzeit-Dropdowns, Farben blau/gold). Typische Vergleiche: „3 KPZ" vs. „Ganzkörper · 18/19 Raten", oder „Ganzkörper · 24 Raten" vs. Gesamtmenge (Serie B auf „Alle" lassen). In der Viertel-Ansicht erscheint eine Vergleichstabelle mit beiden Serien.

**Zu beachten:** Späte Viertel bzw. hohe Ratennummern haben weniger Raten (viele Verträge sind noch nicht so weit) — kleine Grundmengen machen die Quote empfindlicher für Ausreißer.

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
├── index()            → Blade-View rendern
├── kpis()             → JSON: 8 KPI-Metriken
├── monthly()          → JSON: Monatliche Übersicht + Hochrechnung
├── branches()         → JSON: Institut-Ranking
├── sellers()          → JSON: Mitarbeiter-Ranking
├── projection()       → JSON: Detail-Hochrechnung
├── contractTerms()    → JSON: Vertragslaufzeiten (Verteilung nach Raten)
└── paymentFailures()  → JSON: Ausfallquote nach Ratenfortschritt

SalesStatisticsService (app/Services/)
├── getKpis()                      → KPI-Berechnung mit Vergleichswerten
├── getMonthlyOverview()           → Monatsdaten mit Δ-Werten
├── getBranchRanking()             → Institut-Ranking + Projektionen
├── getSellerRanking()             → Mitarbeiter-Ranking + Projektionen
├── getProjection()                → Gesamt-Hochrechnung (Detail)
├── getContractTermsChart()        → Verteilung nach installment_count
└── getPaymentFailuresByProgress() → Raten-Ausfälle in Laufzeit-Vierteln
```

**Filter:** Alle Endpoints akzeptieren `branch_id`, `date_from`, `date_to`, `seller_id` sowie `body_zones` (`full` = Ganzkörper via `is_full_body`, numerisch = exakte KPZ-Anzahl). Der KPZ-Filter wird von den Sektionen „Vertragslaufzeiten" und „Zahlungsausfälle" genutzt. `contract-terms` kennt zusätzlich `only_active=1` (nur Status `active`) und `term_mode` (`actual` = reale Raten aus `contract_payments`, `months` = Kalendermonate erste↔letzte Rate + 1, berechnet in PHP via Carbon — portabel für SQLite-Tests; ohne Parameter: festgesetzte Ratenanzahl). Bei `actual`/`months` liefert die Antwort `excluded_without_plan` (Verträge ohne Zahlungsplan, die ausgeblendet wurden). `payment-failures` kennt zusätzlich `installments` (kommaseparierte Laufzeiten, z.B. `18,19`) und `group=installment` (Buckets je Ratennummer statt Viertel; Antwort-Feld `group`). Der Vergleichsmodus ist rein clientseitig: das Frontend ruft den Endpoint zweimal mit unterschiedlichen Filtern auf.

**Charts:** Die neueren Sektionen (Vertragslaufzeiten, Zahlungsausfälle) nutzen **Apache ECharts**, die älteren noch Chart.js (Migration bei Gelegenheit, siehe `charts.instructions.md`).

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
| `resources/views/hub/reports/sales-statistics/partials/contract-terms.blade.php` | Vertragslaufzeiten (ECharts + KPZ-Filter) |
| `resources/views/hub/reports/sales-statistics/partials/payment-failures.blade.php` | Zahlungsausfälle nach Ratenfortschritt |
| `public/js/sales-statistics.js` | Alpine.js App + Chart.js/ECharts Integration |
| `resources/views/hub/reports.blade.php` | Berichte-Übersicht (Report-Card) |

### Datengrundlage

- **Tabelle:** `contracts`
- **Relevante Status:** `active`, `completed` (über `SALE_STATUSES` Konstante)
- **Verkaufsdatum:** `signed_at` (Unterschriftsdatum)
- **Umsatz-Metriken:** `total_value_cents` (Gesamtwert) + `monthly_amount_cents` (SEPA-Rate)
- **Geldbeträge:** In Cents gespeichert, Frontend rechnet `/100` für Anzeige
- **Vertragslaufzeiten:** `contracts.installment_count` (1 = Einmalzahlung); Verträge ohne Wert fließen nicht ein
- **Zahlungsausfälle:** `contract_payments` (nur Verträge mit >1 Rate); verarbeitete Raten = Status `paid`/`confirmed`/`failed`/`chargedback`. Die Viertel-Zuordnung erfolgt per portablem `CASE WHEN` über `(installment_number − 1) × 4` vs. `installment_count` (kein `FLOOR`/`LEAST`, damit die SQLite-Tests identisch rechnen)

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
