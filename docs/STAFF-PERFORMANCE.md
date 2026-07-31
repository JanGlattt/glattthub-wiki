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

### Aufbau der Seite (Statistik-Bauplan, seit 07/2026)

Die Seite folgt dem verbindlichen Statistikseiten-Bauplan: Jede Analyse-Karte ist
**zweiseitig** — Diagramm als Standard-Ansicht, die Tabelle dahinter über das
**Register am rechten Kartenrand** (mobil als Segmented Control). Beim Laden
zeigen die Karten **Skeletons in Endhöhe** (nichts springt), Filterwechsel dimmen
die alte Ansicht, bis die neue Antwort da ist. Fällt ein Endpoint aus, zeigt
**nur diese Karte** einen Fehlerhinweis mit „Erneut laden" — die übrigen Analysen
laden unabhängig weiter. Jede Karte hat ein Info-Panel (ℹ️) mit Erklärung,
Spalten, Anomalien und Datenquelle.

Einzige Karte ohne Register ist die **Tagesmessung** (dichte Ampel-Matrix über
Tagesspalten, Monate und aufklappbare Wochen — als begründete Ausnahme rein
tabellarisch: für 40+ Wertspalten gibt es keine sinnvolle Diagrammform).

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

Quoten-KPIs (Conversion-Rate, Ganzkörper-Anteil) vergleichen in
**Prozentpunkten (PP)** statt als Prozent-Veränderung der Quote.

#### Mitarbeiter-Ranking

**Diagramm (Standard):** horizontale Balken der Top 15 — Conversion-Rate
(untere Achse) und Ø Körperzonen (obere Achse); die Reihenfolge folgt der
Sortierung der Tabelle. **Tabellen-Lasche:** sortierbare Tabelle aller
Mitarbeiter mit:

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

Diagramm (Doppelachse: Conversion-Rate + Ø Körperzonen, Balken in den
Standort-Farben und der konfigurierten Instituts-Reihenfolge); die
Tabellen-Lasche zeigt alle Kennzahlen inkl. Gesamtzeile — Quote, Ø KPZ und
Ganzkörper-Anteil werden dort aus den Summen berechnet, nicht gemittelt.

#### Monatlicher Zeitverlauf

Liniendiagramm der Conversion-Rate über die letzten 12 Monate — Gesamt-Trend
plus gestrichelte Standort-Linien. Die Tabellen-Lasche fasst die Monate zu
Quartalen/Jahren zusammen (aufklappbar, laufender Monat markiert).

#### Körperzonen-Verteilung

Balkendiagramm der meistverkauften Körperzonen bei Conversion-Verträgen. Die
Tabellen-Lasche schlüsselt jede Zone zusätzlich **je Standort** auf (ersetzt
das frühere Karten-Raster „Top 8 je Standort").

#### Mitarbeiter-Detailansicht (Modal)

Öffnet sich per Klick auf einen Mitarbeiter. Zeigt:

- **Übersicht**: Beratungen, Abschlüsse, Quote, Ø KPZ
- **Beratungsliste**: Alle Beratungen mit Datum, Uhrzeit, Standort, Typ, Ergebnis (Abschluss/Ganzkörper/Kein Abschluss), Körperzonen, Vertragswert

#### Tagesmessung (Ampel-Matrix)

Dichte Matrix ganz oben auf der Seite — der Nachbau der bisher extern gepflegten
„Tagesmessung" (Google-Sheet). Eine Zeile pro Mitarbeiter, Zeilenhöhe ~26 px,
damit mehrere Institute gleichzeitig ins Bild passen.

**Spaltenaufbau:**

| Block | Inhalt |
|---|---|
| **Heute** (fixiert) | BG und CR des laufenden Tages |
| **Diese Woche** (fixiert) | BG und CR seit Montag |
| **Monatsblöcke** | die letzten 4, 6 oder 12 Kalendermonate — je BG, CR, KpZ |

**Leserichtung: neu → alt.** Der laufende Monat steht direkt neben den Tagesspalten,
nach rechts geht es in die Vergangenheit. Innerhalb eines aufgeklappten Monats gilt
dasselbe: zuerst die Monatssumme („Σ 26.07"), dann die Kalenderwochen absteigend
(KW31, KW30, …). Der CSV-Export bleibt davon unberührt und sortiert chronologisch.

Die beiden Tagesblöcke und die Mitarbeiterspalte bleiben beim seitlichen Scrollen
stehen (`position: sticky`), damit die Zuordnung beim Blick nach rechts erhalten bleibt.

**Monat aufklappen:** Ein Klick auf den Monatskopf („26.07 ▸") fächert den Monat in
seine **Kalenderwochen** auf, gefolgt von der Monatssumme („Σ 26.07"). Mehrere
Monate lassen sich gleichzeitig öffnen.

> **Wochen sind auf die Monatsgrenzen beschnitten.** Eine Kalenderwoche, die über
> den Monatswechsel läuft, erscheint in **beiden** Monaten mit ihrem jeweiligen
> Anteil (dieselbe KW-Nummer taucht dann zweimal auf). Nur so ergibt die Summe der
> Wochen exakt den Monatswert — im Test abgesichert.

Metriken je Block:

- **BG** — Beratungsgespräche (neutral, keine Farbkodierung)
- **CR** — Conversion-Rate in % (flächig farbcodiert)
- **KpZ** — Ø Körperzonen **pro Beratungsgespräch** (flächig farbcodiert; Nenner
  sind alle BG des Zeitraums, nicht nur die Abschlüsse)

**Farbkodierung** basiert auf konfigurierbaren Schwellenwerten (global oder pro Standort):

| Farbe | CR Standard | KpZ Standard |
|-------|------------|-------------|
| 🟢 Grün | ≥ 60% | ≥ 3,0 |
| 🟡 Gelb | ≥ 40% | ≥ 2,0 |
| 🔴 Rot | < 40% | < 2,0 |

**Gruppierung nach Institut** (Toggle „Nach Institut", Standard: aktiviert):
Kopfzeile je Standort, darunter dessen Mitarbeiter, abgeschlossen mit einer
Zwischensumme; die Summe der Institute ergibt die Gesamtzeile im Fuß.

> **Wichtig:** In der gruppierten Ansicht erscheint ein Mitarbeiter mit Einsätzen an
> zwei Standorten **in beiden Gruppen** mit seinen dortigen Zahlen — sonst würden die
> Instituts-Zwischensummen nicht aufgehen. Schaltet man die Gruppierung aus, wird er zu
> einer Zeile zusammengeführt und seine BG-Zahl ist die Summe beider Standorte. Beide
> Sichten sind korrekt, sie beantworten nur unterschiedliche Fragen.

**Weitere Features:**
- Quoten aus **weniger als 5 Beratungen** sind in den Tages- und Monatsspalten
  blass und kursiv (eingeschränkte Aussagekraft); der Grund steht im Tooltip der
  Zelle. **In den Wochenspalten nicht** — dort sind kleine Fallzahlen der
  Regelfall, die Dämpfung träfe fast jede Zelle und wäre damit wertlos
- Zeilen ohne eine einzige Beratung im gesamten Zeitfenster werden ausgeblendet
- Toggle **„Nur Hub-Nutzer"** (Standard: aktiviert) filtert auf glatttHub-Accounts —
  blendet zugleich Phorest-Platzhalter (Kabinen-, Absage-Spalten) und Profile aus,
  die im Stammdaten-Abgleich fehlen und sonst als „Unbekannt" erscheinen
- Sortierung innerhalb der Gruppe nach Beratungsvolumen der Monatsblöcke
- Mobil bricht der Kartenkopf um, die fixierten Spalten schrumpfen mit

**Multi-StaffId-Zusammenführung:** Ein Hub-Nutzer kann mehrere Phorest-StaffIds haben (eine pro Standort). Diese werden automatisch zusammengeführt:

1. Über `user_id` aus der `users`-Tabelle (Hub-Account)
2. Über identischen Namen aus der `phorest_staff`-Tabelle (Fallback für Staff ohne Hub-Account)

In der Instituts-Gruppierung greift dasselbe Merging, aber **nur innerhalb eines Standorts**.

##### Abgleich mit der bisherigen Tagesmessung (Google-Sheet, 31.07.2026)

Die BG-Zahlen decken sich (Monatssummen April–Juni: 284/315/272 im Hub gegen
285/321/275 im Sheet); auf Mitarbeiterebene waren im Juni sieben Personen in allen
drei Kennzahlen identisch. **CR und KpZ liegen im Hub systematisch 4–8 Punkte
niedriger**, weil der Hub einen Abschluss nur zählt, wenn der Vertrag **am selben Tag
im selben Institut** unterschrieben wurde (Definition Jan, 25.07.2026: „nur Verkäufe,
die direkt im BG stattfinden"). Von 520 Verträgen aus April–Juni traf das auf 463 zu;
bei den übrigen 57 lag das letzte BG 1–7 Tage (15), 8–30 Tage (14) oder über 30 Tage
(25) zurück, 8 hatten gar kein BG. Das Sheet zählt diese mit.

##### Umsetzungshinweise

- Die Tabelle nutzt **nicht** `.table-glattt`: dessen `padding: 1rem 1.25rem !important`
  ergibt 60-px-Zeilen. Stattdessen `.matrix-glattt` (eigene Sektion in
  `theme_glattt.css`) mit `table-layout: fixed`.
- **`table-layout: fixed` ist Pflicht**, nicht Kosmetik: Ohne feste Spaltenbreiten
  dehnen breite Blocklabels („Diese Woche") ihre Spalten, während die `left`-Offsets
  der fixierten Spalten aus CSS-Variablen kommen — Kopf und Werte laufen dann
  sichtbar gegeneinander. Breiten stehen in `--mx-name/-bg/-cr/-kpz`, die aus dem
  Spaltenmodell berechnete Summe wird zur **`min-width`**.
- Die Tabelle läuft auf `width: 100%` und nutzt damit die Kartenbreite aus; der
  Browser dehnt die Spalten dabei proportional. Deshalb werden die sticky-Offsets
  **nach dem Rendern gemessen** (`_syncMatrixOffsets()` schreibt `--mx-off-1…4`) —
  feste `calc()`-Werte aus den Variablen säßen bei gedehnten Spalten daneben. Der
  Verifikationslauf prüft das über den Versatz zwischen Kopf- und Datenzellen.
- **Die Institutszeile ist eine `colspan`-Zelle über die volle Tabellenbreite.**
  `position: sticky` auf der Zelle hält nur die Zelle — der Text am Zellenanfang
  scrollt trotzdem aus dem Bild. Sticky gehört auf den Inhalt
  (`.matrix-glattt-group-label`), und sein `left` muss dem horizontalen
  Zellenpolster entsprechen, sonst springt der Name beim ersten Scrollschritt.
- Auch die Kopfzeilen brauchen jede ein eigenes `top` — ohne wirkt `sticky`
  nicht. Bei aufgeklapptem Monat sind es drei Zeilen; die Offsets kommen aus
  `_syncMatrixOffsets()` (gemessene Zeilenhöhen, `--mx-top-2/-3`).
- Wochenspalten haben eigene, schmalere Breiten (`--mx-wbg/-wcr/-wkpz`), damit
  ein aufgeklappter Monat in den freien Bereich neben den fixierten Spalten
  passt und `_centerMonth()` ihn tatsächlich mittig setzen kann.
- `thead`, `tbody`, `tfoot` und `colgroup` werden als HTML-Strings gebaut
  (`x-html`) — bei ~3.000 Zellen wäre ein Alpine-Scope je Zelle spürbar träge.
  Der Klick auf die Monatsköpfe läuft deshalb über Event-Delegation am Container
  (`[data-month]`).
- Leere Perioden werden **nicht** ausgeliefert: Bei 4 Monaten × ~5 Wochen wären
  sonst gut 25 leere Objekte je Mitarbeiter im Payload. Frontend und Export
  behandeln fehlende Keys als „keine Daten" (Antwort aktuell ~110 KB).

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

### CSV-Export

Über den Export-Button im Seitenkopf stehen alle Auswertungen der Seite als
CSV bereit (Quellen in `ReportExportService::SOURCES`, alle mit Standort-Filter):

| Quelle | Inhalt |
|--------|--------|
| `staff-overview` | Tagesmessung: BG, CR & KpZ je Zeitraum (eine Zeile pro Mitarbeiter × Zeitraum) |
| `staff-overview-branches` | Tagesmessung je Institut: Mitarbeiter-Zeilen standortweise **plus** Instituts-Zwischensummen (Spalte „Zeilenart“) |
| `staff-ranking` | Mitarbeiter-Ranking mit allen Kennzahlen |
| `staff-branch-comparison` | Standort-Vergleich |
| `staff-monthly-trend` | Monats-Trend (gesamt + je Institut) |
| `staff-body-zones` | Körperzonen-Verteilung (gesamt + je Institut) |
| `staff-treatments` | Durchgeführte Behandlungen pro Mitarbeiter |

### Durchgeführte Behandlungen pro Mitarbeiter

Eigene Sektion (seit 07/2026, Asana „Anzahl Behandlungen"): Diagramm (Top 15
nach Behandlungs-Terminen) als Standard, Tabelle mit allen Mitarbeitern und
Top-Behandlungen als Lasche. Zählt je Mitarbeiter die **Behandlungs-Termine** (Kunde × Tag × Institut mit mindestens einem Behandlungs-Service des Mitarbeiters) und die **Service-Positionen** (einzelne Behandlungs-Leistungen), plus die drei häufigsten Behandlungsarten. Beratungsgespräche und Desinfektion zählen nicht; gezählt werden nur durchgeführte Termine (abgeschlossen/bezahlt). Zeitraum wählbar (dieser/letzter Monat, 3 Monate, Jahr, gesamt); Standort-Filter und die [Datensichtbarkeit](DATA-VISIBILITY.md) (eigene Daten / Team / alle) greifen auch hier. Export über die CSV-Quelle „Durchgeführte Behandlungen pro Mitarbeiter".

Hinweis zur Abgrenzung: Behandlungen je **Institut** und je **Behandlungsart** (ohne Mitarbeiter-Bezug) zeigt weiterhin die Terminstatistik („Monatliche Übersicht", „Top Services"). Diese Sektion ergänzt die dort fehlende Mitarbeiter-Achse — und liefert die Datenbasis für die späteren HR-KPIs (KPZ pro Arbeitsstunde).

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
├── overview()         → JSON: Tagesmessung (Tagesspalten + Monate + Wochen, Instituts-Gruppen)
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
| `resources/views/hub/reports/staff-performance/partials/overview-table.blade.php` | Tagesmessung: Ansichts-/Monats-Umschalter, Instituts- und Hub-only-Toggle |
| `resources/views/hub/reports/staff-performance/partials/targets-modal.blade.php` | Zielwerte-Modal (Pill-Buttons, pro Standort) |
| `resources/views/hub/reports/staff-performance/partials/staff-ranking.blade.php` | Mitarbeiter-Tabelle |
| `resources/views/hub/reports/staff-performance/partials/branch-comparison.blade.php` | Standort-Vergleich + Chart |
| `resources/views/hub/reports/staff-performance/partials/monthly-trend.blade.php` | Monatstrend + Chart |
| `resources/views/hub/reports/staff-performance/partials/body-zones.blade.php` | Körperzonen-Verteilung |
| `resources/views/hub/reports/staff-performance/partials/staff-detail-modal.blade.php` | Detail-Modal (Stat-Strip + Beratungsliste) |
| `resources/views/hub/reports/staff-performance/partials/treatments.blade.php` | Durchgeführte Behandlungen |
| `public/js/staff-performance.js` | Alpine.js App: Loader je Karte (sectionError), ECharts-Renderer (acquireChart-Muster), chart-table-Modelle, Targets, Staff-Merging |
| `public/js/chart-table.js` | Gemeinsame Tabellen-Lasche der Chart-Karten |
| `app/Services/ReportExportService.php` | CSV-Export-Quellen `staff-*` |
| `resources/views/components/statistics/widgets/partials/staff-*.blade.php` | **Eingefrorene Kopien** der alten Partials für die Custom-Dashboard-Widgets (siehe unten) |
| `resources/views/hub/reports/partials/overview-cards/mitarbeiterperformance-card.blade.php` | Preview-Card auf Berichte-Übersicht |
| `tests/Feature/StaffPerformanceTest.php` | Feature-Tests (Kernlogik, benötigt MySQL) |
| `tests/Feature/StaffPerformancePageTest.php` | Seiten-Skelett (Register, Skeletons, Info-Panels) + Export-Quellen |
| `tests/Feature/StaffPerformanceScopeTest.php` / `StaffTreatmentsTest.php` | Datensichtbarkeit / Behandlungs-Zählung |

**Custom-Dashboard-Widgets entkoppelt (07/2026):** Die 5 Staff-Widgets des
Custom-Dashboards (`components/statistics/widgets/staff-*.blade.php`) teilten
sich die Partials mit der Berichtsseite. Seit dem Bauplan-Umbau binden sie
eingefrorene Kopien des alten Stands ein (`widgets/partials/staff-*.blade.php`)
— ihre Modernisierung gehört zur separaten Aufgabe „Custom Dashboard
überarbeiten".

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
| GET | `/hub/reports/staff-performance/overview` | Tagesmessung (`months`, 1–12, Standard 4) |
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
| `getStaffOverview()` | 8 Queries (1 pro Zeitraum) | 1 Query | Alle Zeiträume in einer CTE; die Zeilen werden in PHP auf die Perioden verteilt (`buildPeriodMatrix()`). Cache-Key enthält Monatstiefe, `MATRIX_SCHEMA` und das Tagesdatum (Perioden-Grenzen aus `Carbon::today()`) |
| `calculateKpiComparisons()` | 3 Queries | 1 Query | Vorperiode + Vergleich in einer Query (gruppiert nach Monat); übernimmt Branch-Filter **und** Datensichtbarkeits-Scope |
| `getMonthlyTrend()` | 2 Queries | 1 Query | Ein `GROUP BY Monat, branch_id`, Gesamt wird in PHP aufaddiert |
| `getStaffMap()` | Jeder Aufruf neu | Instance-Cache | Einmal laden, danach aus `$this->staffMapCache` |

**Instituts-Reihenfolge:** `getBranchComparison()`, `getMonthlyTrend()` und
`getBodyZoneDistribution()` sortieren ihre Institute serverseitig über den
`SortsBranchIds`-Trait (`InstituteColor.sort_order`) — Charts, Tabellen und
Exporte zeigen dieselbe konfigurierte Reihenfolge.

### Frontend (Alpine.js)

| Optimierung | Beschreibung |
|-------------|-------------|
| **`x-html` statt Template-Loops** | Übersichtstabelle (`_overviewBodyHtml`, `_overviewTfootHtml`) und Ranking-Tabelle (`_rankingBodyHtml`) werden als HTML-Strings vorgebaut und via `x-html` gerendert. Eliminiert tausende Alpine-Bindings und `x-for`-Loops. |
| **`deepFreeze()`** | Alle API-Responses werden mit `Object.freeze()` (rekursiv) eingefroren. Verhindert, dass Alpine.js Proxies um die Datenobjekte wickelt — spart erheblich Memory und Reaktivitäts-Overhead. |
| **Loader je Karte + `sectionError`** | Jede Karte hat einen eigenen Loader mit deklariertem Race-Guard (`_seq…`), Fehler-Flag und Retry — ein ausgefallener Endpoint betrifft nur seine Karte. |
| **ECharts nach Bauplan-Muster** | Alle 5 Renderer nutzen `acquireChart()` (Instanz-Reuse statt dispose/init), stabile Serien-`id`s, `chartAnimation(isUpdate)`, `setOption(…, { notMerge: true })` und `bindChartEvent()` — Filterwechsel blenden animiert über. |
| **CSS-Variable-Cache** | `getCssVars()` cached Chart-Farben aus CSS-Variablen. Ein `MutationObserver` auf `<html>` invalidiert den Cache bei Dark-Mode-Wechsel (`.dark`-Klasse). |
| **`_monthlyReversed`** | Vorberechnetes umgekehrtes Array für die Monatstrend-Tabelle — kein `.slice().reverse()` bei jedem Render. |
| **`x-if` statt `x-show` im Targets-Modal** | Tabs im Zielwerte-Modal nutzen `x-if` statt `x-show`. Nur der aktive Tab existiert im DOM (~350 DOM-Nodes eingespart). |
| **Ranking-Buttons via CustomEvent** | Buttons in `x-html`-gerendertem HTML können keine Alpine-Direktiven nutzen. Stattdessen: `onclick="window.dispatchEvent(new CustomEvent('show-staff-detail', {detail: staffId}))"` mit Listener in `init()`. |

Die früheren `content-visibility: auto`-Wrapper wurden mit dem Bauplan-Umbau
entfernt — sie hielten die Chart-Container beim Erstrender auf 0 px Breite
(ECharts-Breitenmessung), das Skeleton-System reserviert die Höhen jetzt ohnehin.

**Bugfix 07/2026 (Zeitzone):** Die Zeitraum-Berechnung der Behandlungs-Karte
(`treatmentsRange()`) formatierte lokale Daten mit `toISOString()` — in
Europe/Berlin kippte das Datum dadurch auf den Vortag, „Dieser Monat" enthielt
immer den letzten Tag des Vormonats. Jetzt lokale Formatierung.

### CSS (Globaler `backdrop-filter`-Bann)

**Problem:** Die CSS-Eigenschaft `backdrop-filter: blur()` erzeugt pro Element eine GPU-Compositing-Layer. Bei hunderten gleichzeitig sichtbaren Badges (`.badge-glattt`) und der Seiten-Wrapper-Klasse `.dashboard-surface` führte das zu massiven Render-Kosten und spürbarem Ruckeln.

**Lösung:** Alle 67 `backdrop-filter`-Deklarationen wurden global aus `theme_glattt.css` entfernt. Stattdessen werden halbtransparente Hintergründe über CSS-Variablen (`--card-glass-bg`, `--glass-bg`) verwendet — visuell kaum unterscheidbar, aber ohne GPU-Compositing-Overhead.

**Regel:** `backdrop-filter` darf in keiner CSS-Klasse verwendet werden. Diese Regel ist in den Coding-Instructions und im Design-System-Agent verankert.
