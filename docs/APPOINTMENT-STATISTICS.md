# Terminstatistik

Auswertung aller **stattgefundenen** Termine: Anzahl, Dauer, behandelte Körperzonen, beliebteste
Services und häufigste Service-Kombinationen — je Monat, mit Wochen-Drilldown und Standort-Filter.
Diese Seite beschreibt **Kennzahl-Definitionen, Endpunkte, Abfragen, Frontend-Komponenten, Design
und Changelog**; die Bedienung Schritt für Schritt steht im Nutzerhandbuch.

**URL:** `/hub/reports/appointments-body-zones` (Hub → Berichte → Terminstatistik)

!!! nutzerhandbuch "Bedienung: Berichte 6 – Terminstatistik"
    [hilfe.hub.glattt.com/berichte/6/](https://hilfe.hub.glattt.com/berichte/6/) — Bericht öffnen,
    Auslastung, Terminarten im Verhältnis, Grenzen des Berichts.

    Rahmen aller Berichtsseiten (Zeitraum und Standort, Kennzahlen-Zeile, Diagramm oder Tabelle,
    Export): [Berichte 0 – So funktionieren die Berichte](https://hilfe.hub.glattt.com/berichte/0/).
    Angrenzend: [Berichte 2 – Zukünftige Beratungsgespräche](https://hilfe.hub.glattt.com/berichte/2/),
    [Berichte 3 – Vergangene Beratungsgespräche](https://hilfe.hub.glattt.com/berichte/3/),
    [Berichte 4 – Stornierte und gelöschte Termine](https://hilfe.hub.glattt.com/berichte/4/),
    [Betrieb 5 – Services und Körperzonen](https://hilfe.hub.glattt.com/betrieb/5/) (dort wird
    gepflegt, was als Beratung zählt und wie viele Körperzonen ein Service hat).

---

## Für Anwender — Überblick

**Was der Bericht beantwortet.** Wie viele Termine finden statt, wie verteilen sie sich auf die drei
Terminarten, wie viel Zeit binden sie, wie viele Körperzonen werden dabei behandelt und welche
Dienstleistungen (einzeln und in Kombination) werden am häufigsten gebucht. Alles je Monat, mit
Wochen-Aufschlüsselung und Vergleich zu Vormonat und Vorjahr.

**Drei Terminarten** — die Einordnung ergibt sich daraus, ob ein Termin nur Beratungs-Services, nur
Behandlungs-Services oder beides enthält:

1. **Beratungsgespräche** (blau): Termine, die nur Beratungs-Services enthalten
2. **Behandlungen** (grün): Termine, die nur Behandlungs-Services enthalten
3. **Beratung + Behandlung** (türkis): kombinierte Termine mit beiden Service-Arten

**Fünf Analysen:** Termine pro Monat · Termindauer pro Monat · Körperzonen pro Monat · Top Services
pro Monat · Service-Kombinationen pro Monat — jeweils als Diagramm (Standard) und als Tabelle hinter
dem Karten-Register.

**Zwei Dinge, die man wissen muss.** Erstens zählen **nur stattgefundene Termine** (Phorest-Status
*abgeschlossen* bzw. *bezahlt*) — Ausnahme sind die ausdrücklich so benannten No-Show-Kennzahlen.
Zweitens sind alle Monatsvergleiche **zeitpunktgleich**: Am 19. eines Monats wird mit dem 1.–19. des
Vormonats und des Vorjahresmonats verglichen, nie mit einem vollen Monat gegen einen halben. Die
vollständigen Definitionen — auch welche Services ausgeschlossen werden und wie Körperzonen gezählt
werden — stehen unter [Kennzahl-Definitionen](#kennzahl-definitionen).

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Bericht öffnen, Auslastung, Terminarten, Grenzen des Berichts | Berichte 6 |
| Zeitraum und Standort, Kennzahlen-Zeile, Diagramm/Tabelle, Export | Berichte 0 |
| Beratungstermine vorausschauend bzw. rückblickend auswerten | Berichte 2 und 3 |
| Abgesagte und gelöschte Termine | Berichte 4 |
| Festlegen, was Beratung ist und wie viele Körperzonen ein Service hat | Betrieb 5 |

---

## Für Entwickler

### Aufbau der Seite

Seit 07/2026 folgt die Seite dem verbindlichen **Statistik-Bauplan**: Alle fünf
Karten sind zweiseitig — das **Diagramm ist die Standard-Ansicht**, die Tabelle
(inkl. Wochen-Drilldown bzw. Monats-Rankings) liegt als Lasche hinter dem
**Karten-Register** am rechten Kartenrand. Geladen wird mit Skeleton-Platzhaltern
in Endhöhe statt Spinnern; Fehler erscheinen je Karte mit „Erneut laden"; jede
Karte hat ein **Info-Panel** (ⓘ) mit Erklärung, Spalten, Anomalien und
Datenquelle. Alle Daten sind über den **CSV-Export** im Seitenkopf abrufbar.

Der globale Standort-Filter der Seitenleiste wirkt auf alle Karten; „Alle Institute" aggregiert.
Die Wochen-Details einer Monatszeile werden **lazy** nachgeladen.

### Kennzahl-Definitionen

Alle Kennzahlen beziehen sich auf **stattgefundene Termine**, sofern nicht anders angegeben (z.B.
„No Shows"). Die Kennzahlen-Zeile ist über `components/kpi-dashboard` personalisierbar (Drag & Drop,
Auswahl im Browser gespeichert).

#### Anzahl-KPIs (8 Stück)

| # | KPI | Beschreibung | Vergleiche |
|---|-----|--------------|------------|
| 1 | Ø Termine/Tag | Durchschnittliche Termine pro Tag im aktuellen Monat | Ø letzte 3 Monate |
| 2 | Beratungsgespräche | Anzahl reiner Beratungen | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 3 | Behandlungen | Anzahl reiner Behandlungen | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 4 | Beratung + Behandlung | Anzahl kombinierter Termine | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 5 | No Shows Beratungen | Nicht erschienen zu Beratung | - |
| 6 | No Shows Behandlungen | Nicht erschienen zu Behandlung | - |
| 7 | Termine gesamt | Alle Termine zusammen | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 8 | Ø Termine/Tag (3M) | Durchschnitt der letzten 3 Monate | - |

#### Dauer-KPIs (5 Stück) ⭐ NEU

| # | KPI | Format | Vergleiche |
|---|-----|--------|------------|
| 1 | Termindauer gesamt | z.B. "142h 30min" | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 2 | Ø Termindauer | z.B. "52 min" | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 3 | Beratungsdauer | Gesamtdauer Beratungen | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 4 | Behandlungsdauer | Gesamtdauer Behandlungen | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 5 | Beratung+Behandlung Dauer | Gesamtdauer kombiniert | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |

#### Körperzonen-KPIs (2 Stück) ⭐ NEU

| # | KPI | Format | Vergleiche |
|---|-----|--------|------------|
| 1 | Körperzonen gesamt | z.B. "1.250" | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 2 | Ø Körperzonen/Termin | z.B. "3,2" | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |

> ℹ️ **Info:** Körperzonen werden pro Service definiert. Die Summe zeigt wie viele Körperzonen insgesamt in allen Terminen behandelt wurden.

#### Top-Services-KPIs (3 Stück) ⭐ NEU

| # | KPI | Format | Vergleiche |
|---|-----|--------|------------|
| 1 | Top Service (aktueller Monat) | Service-Name + Anzahl | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 2 | Flex-Termine (aktueller Monat) | Anzahl Termine mit "Flex" im Service-Namen | % vs. Vormonat (1.-X.), % vs. Vorjahr (1.-X.) |
| 3 | Top Services (12 Monate) | #1 Service-Name + #2 und #3 in Vergleichen | - |

> ℹ️ **Info:** "Flex"-Termine sind Services die "Flex" im Namen enthalten (z.B. "Flex-Beratung", "Flextermin"). Services mit "Desinfektion" im Namen werden automatisch ausgeschlossen.

#### Same Point in Time (SPIT) Vergleiche

Alle Vergleiche verwenden den **gleichen Zeitpunkt** im Vergleichsmonat:
- Beispiel am 19. Februar: Vergleich mit 1.–19. Januar und 1.–19. Februar Vorjahr
- Dies ermöglicht faire Vergleiche auch mitten im Monat

#### Standort-KPIs

Bei mehreren Standorten werden zusätzlich bis zu 4 Standort-KPIs angezeigt mit Anzahl Termine und Aufschlüsselung nach Kategorien.


### Monatliche Übersicht (Termine pro Monat)

#### Tabellenansicht
- **Zeilen**: Monate (neueste zuerst), expandierbar für Wochen-Details
- **Spalten**: Gesamt, Beratungen, Behandlungen, Beratung + Behandlung
- **Aktueller Monat**: Badge "aktuell" + hervorgehobene Zeile
- **Heatmap**: Farbintensität zeigt relative Aktivität

#### Chart-Ansicht
- Line-Chart mit 4 Linien (Gesamt, Beratungen, Behandlungen, Kombiniert)
- Zeitlicher Verlauf (älteste links, neueste rechts)
- Interaktive Tooltips mit genauen Werten

#### Wochen-Expansion
- Klick auf einen Monat zeigt Wochen-Details
- Lazy Loading: Wochendaten werden erst bei Expansion geladen
- Zeigt Kalenderwoche und Datumsbereich (z.B. "KW 7 (10.02. - 16.02.)")

### Termindauer pro Monat

#### Total / Durchschnitt Toggle
Oben links neben dem Titel können Sie umschalten zwischen:
- **Total**: Gesamtdauer aller Termine (z.B. "356h 45min")
- **Ø pro Termin**: Durchschnittliche Dauer pro Termin (z.B. "48 min")

#### Tabellenansicht
- Gleiche Struktur wie Termine pro Monat
- Werte formatiert als "Xh Ymin" (Total) oder "X min" (Durchschnitt)
- Wochen-Expansion verfügbar

#### Chart-Ansicht
- Line-Chart mit adaptiver Y-Achse:
  - **Total-Modus**: Y-Achse in Stunden (z.B. "120h")
  - **Durchschnitt-Modus**: Y-Achse in Minuten (z.B. "45min")
- Legende passt sich dem Modus an

### Körperzonen pro Monat

Zeigt wie viele Körperzonen pro Monat in allen Behandlungsterminen behandelt wurden.
Gezählt werden nur stattgefundene Termine mit mindestens einer Behandlung —
reine Beratungen fließen nicht ein.

> ℹ️ **Hinweis:** Die Anzahl der Körperzonen wird pro Service definiert (im Admin unter "Beratungsgespräche/Services"). Ganzkörper-Services zählen 6 Körperzonen (Maximum); Services ohne Zuordnung fließen mit 0 ein.

#### Körperzonen / Zeit Toggle
Neben dem Titel kann die Kennzahl der Karte umgeschaltet werden:
- **Körperzonen** (Standard): Balken = Summe der behandelten Körperzonen, Linie = Ø Körperzonen pro Termin (z.B. "3,2")
- **Zeit**: Balken = gebuchte Gesamtdauer derselben Behandlungstermine in Stunden, Linie = Ø Minuten pro Termin — die Zeit kommt aus den gebuchten Start-/Endzeiten der Termine

> 💡 **Unterschied zur Karte „Termindauer pro Monat":** Die Termindauer-Karte zählt alle Termin-Arten inklusive reiner Beratungen; der Zeit-Modus hier zeigt nur die Zeit der Behandlungstermine — also exakt der Terminmenge der Körperzonen-Zahlen.

#### Tabellenansicht
- **Spalten**: Monat, Körperzonen bzw. Gesamtdauer (je Modus), Ø pro Termin, Anzahl Termine
- Wochen-Expansion mit Lazy Loading verfügbar

#### Chart-Ansicht
- Bar-Chart (Summe) mit Ø-Linie auf zweiter Y-Achse
- Achsen und Tooltip passen sich dem Modus an (Körperzonen bzw. Stunden/Minuten)

#### Technik
- Statistik `termine.body-zones` (StatisticRegistry) — Endpoint `/phorest/reports/appointments-body-zones/body-zones` (+ `/weeks`) liefert je Monat/Woche zusätzlich `duration` (gebuchte Minuten)
- JS-Komponente in `public/js/statistics/termine.js` (`zonesMode: 'zones' | 'time'`)
- CSV-Export-Quelle `appointments-zones-monthly` enthält die Spalte „Gebuchte Dauer (Minuten)"

### Top Services pro Monat

Zeigt die beliebtesten Dienstleistungen (Services) pro Monat mit Trend-Vergleichen.

> ℹ️ **Hinweis:** Services mit "Desinfektion" im Namen werden automatisch ausgeschlossen, da diese oft automatisch zu Terminen hinzugefügt werden.

#### Filter-Panel

Das Filter-Panel der Karte (Symbol neben dem Karten-Register) kennt diese Filter:

| Filter | Beschreibung | Standard |
|--------|--------------|----------|
| **Typ** | Checkboxen für Beratungen (blau) und Behandlungen (türkis) | Beide aktiviert |
| **Anzeigen** | Top 5, 10, 15 oder 20 Services | Top 10 |
| **Mind. Termine** | Mindestanzahl Termine für Anzeige | 1 |
| **Suche** | Textsuche im Service-Namen | - |

Die Anzahl aktiver Filter erscheint als Badge am Filter-Knopf.

#### Tabellenansicht
- **Zeilen**: Monate (neueste zuerst), expandierbar für Details
- **Spalten**: Monat, Anzahl Dienstleistungen, Top Services
- **Preview**: Zeigt Top 3 Services als farbige Badges (Blau = Beratung, Türkis = Behandlung)
- **Expansion**: Klick auf Monat zeigt alle Top-N Services mit Ranking und Anzahl

#### Chart-Ansicht
- Horizontaler Bar-Chart mit globalen Top-10 Services der letzten 12 Monate
- Farbcodierung nach Service-Typ
- Interaktive Tooltips mit Anzahl

### Service-Kombinationen pro Monat

Zeigt welche Kombinationen von Services am häufigsten in einem Termin gemeinsam gebucht werden.

> ℹ️ **Was ist ein "Termin"?** Ein Termin umfasst alle Services eines Kunden am selben Tag beim selben Institut. Wenn ein Kunde z.B. "Achseln + Bikinizone + Intimzone" am selben Tag bucht, gilt das als eine Kombination von 3 Services.

> 💡 **Hinweis:** Anders als bei "Top Services" wird hier "Desinfektion" **nicht** ausgeschlossen, da dies für die Kombinationsanalyse relevant sein kann.

#### Filter-Panel

Das Filter-Panel der Karte (Symbol neben dem Karten-Register) kennt diese Filter:

| Filter | Beschreibung | Standard |
|--------|--------------|----------|
| **Anzeigen** | Top 5, 10, 15 oder 20 Kombinationen | Top 10 |
| **Mind. Services** | Mindestanzahl Services in einer Kombination | 2 |
| **Mind. Termine** | Mindestanzahl Termine mit dieser Kombination | 2 |
| **Suche** | Textsuche in Service-Namen der Kombination | - |

Die Anzahl aktiver Filter erscheint als Badge am Filter-Knopf.

#### Tabellenansicht
- **Zeilen**: Monate (neueste zuerst), expandierbar für Details
- **Spalten**: Monat, Termine mit Kombinationen, Top Kombination
- **Preview**: Zeigt nur die **häufigste Kombination** als Badge mit Anzahl
- **Expansion**: Klick auf Monat zeigt alle Top-N Kombinationen mit:
  - Rang-Badge (Gold für #1, Silber für #2, Bronze für #3)
  - Alle Services der Kombination als farbige Tags (Blau = Beratung, Türkis = Behandlung)
  - Anzahl der Termine mit dieser Kombination

#### Chart-Ansicht
- Horizontaler Bar-Chart mit Top-15 Kombinationen der letzten 12 Monate
- Farbcodierung nach Kombinations-Größe:
  - **Türkis**: 2-Service-Kombinationen
  - **Blau**: 3-Service-Kombinationen
  - **Violett**: 4-Service-Kombinationen
  - **Orange**: 5+ Service-Kombinationen
- Interaktive Tooltips zeigen alle Services der Kombination

#### Anwendungsfall
- Identifizieren Sie beliebte "Paket"-Kombinationen für Cross-Selling
- Erkennen Sie Muster in Kundenbuchungen
- Optimieren Sie Terminplanung für häufige Kombinationen


### Backend-Routes

| Route | Controller-Methode | Beschreibung |
|-------|-------------------|--------------|
| `GET /hub/reports/appointments-body-zones` | `appointmentsBodyZones()` | Blade-View anzeigen |
| `GET /phorest/reports/appointments-body-zones/stats` | `appointmentsBodyZonesStats()` | KPI-Statistiken |
| `GET /phorest/reports/appointments-body-zones/detail` | `appointmentsBodyZonesDetail()` | Monatliche Aggregation |
| `GET /phorest/reports/appointments-body-zones/weeks` | `appointmentsBodyZonesWeeks()` | Wochendaten (Lazy Loading) |
| `GET /phorest/reports/appointments-body-zones/duration` | `appointmentsBodyZonesDurationData()` | Monatliche Dauer-Daten + KPI Summary |
| `GET /phorest/reports/appointments-body-zones/duration/weeks` | `appointmentsBodyZonesDurationWeeks()` | Wochen-Dauer (Lazy Loading) |
| `GET /phorest/reports/appointments-body-zones/body-zones` | `appointmentsBodyZonesBodyZonesData()` | Monatliche Körperzonen + KPI Summary |
| `GET /phorest/reports/appointments-body-zones/body-zones/weeks` | `appointmentsBodyZonesBodyZonesWeeks()` | Wochen-Körperzonen (Lazy Loading) |
| `GET /phorest/reports/appointments-body-zones/top-services` | `appointmentsBodyZonesTopServices()` | Top Services pro Monat + KPIs |
| `GET /phorest/reports/appointments-body-zones/service-combinations` | `appointmentsBodyZonesServiceCombinations()` | Service-Kombinationen pro Monat ⭐ NEU |

### API-Parameter

#### `/appointments-body-zones/stats`
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `branch_id` | string | - | Filter nach Standort |

**Response:**
```json
{
    "success": true,
    "data": {
        "appointments": {
            "current": 450,
            "previous": 420,
            "last_year": 380
        },
        "consultations": {
            "current": 120,
            "previous": 110,
            "last_year": 95
        },
        "treatments": {
            "current": 200,
            "previous": 190,
            "last_year": 175
        },
        "consultation_with_treatment": {
            "current": 130,
            "previous": 120,
            "last_year": 110
        },
        "avg_per_day_current_month": 15.5,
        "avg_per_day_last_3_months": 14.2,
        "no_shows_consultations": 8,
        "no_shows_treatments": 5,
        "current_month_name": "Februar",
        "current_day_of_month": 19,
        "by_branch": {...}
    }
}
```

#### `/appointments-body-zones/duration`
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `branch_id` | string | - | Filter nach Standort |

**Response:**
```json
{
    "success": true,
    "data": {
        "months": [
            {
                "month": "2026-02",
                "duration": 21435,
                "appointment_count": 445,
                "consultations": 3600,
                "consultation_count": 120,
                "treatments": 12000,
                "treatment_count": 200,
                "consultation_with_treatment": 5835,
                "combined_count": 125,
                "branches": {...},
                "weeks": null
            }
        ],
        "kpi_summary": {
            "current_month": "2026-02",
            "current_month_name": "Februar 2026",
            "day_of_month": 19,
            "total_duration": {
                "current": 8520,
                "previous": 7890,
                "last_year": 7200
            },
            "total_count": {
                "current": 178,
                "previous": 165,
                "last_year": 150
            },
            "consultation_duration": {...},
            "consultation_count": {...},
            "treatment_duration": {...},
            "treatment_count": {...},
            "combined_duration": {...},
            "combined_count": {...}
        },
        "branches": [...]
    }
}
```

#### `/appointments-body-zones/top-services` ⭐ NEU
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `branch_id` | string | - | Filter nach Standort |
| `limit` | int | 10 | Top N Services pro Monat (5, 10, 15, 20) |
| `min_count` | int | 1 | Mindestanzahl Termine |
| `show_consultations` | bool | true | Beratungs-Services einschließen |
| `show_treatments` | bool | true | Behandlungs-Services einschließen |
| `search` | string | - | Textsuche im Service-Namen |

**Response:**
```json
{
    "success": true,
    "data": {
        "months": [
            {
                "month": "2026-02",
                "total_count": 892,
                "top_services": [
                    {
                        "rank": 1,
                        "service_id": "srv_123",
                        "service_name": "Abo.LS-39 INTIMZONE",
                        "count": 164,
                        "is_consultation": false
                    }
                ]
            }
        ],
        "global_top_services": [
            {
                "service_id": "srv_123",
                "service_name": "Abo.LS-39 INTIMZONE",
                "total_count": 1850,
                "is_consultation": false
            }
        ],
        "kpis": {
            "top_service": {
                "current": { "service_name": "Abo.LS-39 INTIMZONE", "count": 164 },
                "prev_month": { "service_name": "...", "count": 142 },
                "prev_year": { "service_name": "...", "count": 98 }
            },
            "flex_count": {
                "current": 65,
                "prev_month": 58,
                "prev_year": 42
            },
            "top_3_global": [
                { "service_name": "Abo.LS-39 INTIMZONE", "total_count": 1850 },
                { "service_name": "Abo.LS-39 ACHSELN", "total_count": 1620 },
                { "service_name": "Abo.LS-39 BIKINIZONE", "total_count": 1480 }
            ],
            "day_of_month": 20
        }
    }
}
```

#### `/appointments-body-zones/service-combinations` ⭐ NEU
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `branch_id` | string | - | Filter nach Standort |
| `limit` | int | 10 | Top N Kombinationen pro Monat (5, 10, 15, 20) |
| `min_services` | int | 2 | Mindestanzahl Services in einer Kombination |
| `min_count` | int | 2 | Mindestanzahl Termine mit dieser Kombination |
| `search` | string | - | Textsuche in Service-Namen der Kombination |

**Response:**
```json
{
    "success": true,
    "data": {
        "months": [
            {
                "month": "2026-02",
                "total_combinations": 669,
                "top_combinations": [
                    {
                        "rank": 1,
                        "combination_key": "srv_1|srv_2|srv_3",
                        "services": [
                            {
                                "id": "srv_1",
                                "name": "Abo.LS-39 ACHSELN",
                                "is_consultation": false
                            },
                            {
                                "id": "srv_2",
                                "name": "Abo.LS-39 BIKINIZONE",
                                "is_consultation": false
                            },
                            {
                                "id": "srv_3",
                                "name": "Abo.LS-39 INTIMZONE",
                                "is_consultation": false
                            }
                        ],
                        "service_count": 3,
                        "count": 77
                    }
                ]
            }
        ],
        "global_top_combinations": [
            {
                "rank": 1,
                "combination_key": "srv_1|srv_2|srv_3",
                "services": [...],
                "service_count": 3,
                "count": 892
            }
        ]
    }
}
```

### Datenbank-Abfragen

#### Termin-Definition
Ein "Termin" ist definiert als alle Appointments eines Kunden am selben Tag beim selben Institut:
```sql
GROUP BY client_id, appointment_date, branch_id
```

#### Kategorisierung
```sql
-- Hat Beratung?
MAX(CASE WHEN service_id IN (consultation_ids) THEN 1 ELSE 0 END) as has_consultation

-- Hat Behandlung?
MAX(CASE WHEN service_id NOT IN (consultation_ids) THEN 1 ELSE 0 END) as has_treatment
```

#### Dauer-Berechnung
```sql
-- In Minuten
SUM(TIME_TO_SEC(TIMEDIFF(end_time, start_time)) / 60) as duration
```

#### Filter für Dauer-Statistiken
Nur stattgefundene Termine werden gezählt (keine No-Shows):
```sql
WHERE state IN ('COMPLETED', 'PAID')
```

### Frontend-Komponenten

#### Alpine.js App
```javascript
function appointmentsBodyZonesApp() {
    return {
        // State
        loading: false,
        stats: null,
        detailData: null,
        durationData: null,
        bodyZonesData: null,
        topServicesData: null,
        serviceCombinationsData: null,   // ⭐ NEU
        durationMode: 'total',
        bodyZonesMode: 'total',
        dashboardKpis: [],
        
        // Top Services State
        topServicesView: 'table',
        topServicesLimit: 10,
        topServicesMinCount: 1,
        topServicesShowConsultations: true,
        topServicesShowTreatments: true,
        topServicesSearch: '',
        topServicesShowFilters: false,
        loadingTopServices: true,
        
        // Service Combinations State ⭐ NEU
        serviceCombinationsView: 'table',
        serviceCombinationsLimit: 10,
        serviceCombinationsMinServices: 2,
        serviceCombinationsMinCount: 2,
        serviceCombinationsSearch: '',
        serviceCombinationsShowFilters: false,
        loadingServiceCombinations: true,
        expandedServiceCombinationsMonths: {},
        
        // Methoden
        init() {},
        loadStats() {},
        loadDetailData() {},
        loadDurationData() {},
        loadBodyZonesData() {},
        loadTopServicesData(skipKpiUpdate) {},
        loadServiceCombinationsData() {},        // ⭐ NEU
        calculateDashboardKpis() {},
        addTopServicesKpis() {},
        updateTopServicesKpis() {},
        searchTopServices() {},                  // (debounced)
        searchServiceCombinations() {},          // ⭐ NEU (debounced)
        clearServiceCombinationsSearch() {},     // ⭐ NEU
        toggleServiceCombinationsMonth() {},     // ⭐ NEU
        isServiceCombinationsMonthExpanded() {}, // ⭐ NEU
        getServiceCombinationsActiveFilterCount() {}, // ⭐ NEU
        formatCombinationPreview() {},           // ⭐ NEU
        initServiceCombinationsChart() {},       // ⭐ NEU
        // ...
    }
}
```

#### KPI-Berechnung
```javascript
// Dauer-KPIs werden nach Laden der Duration-Daten hinzugefügt
if (this.durationData?.kpi_summary) {
    // Gesamtdauer
    this.dashboardKpis.push({
        id: 'duration_total',
        icon: 'clock',
        label: `Termindauer gesamt (${monthName})`,
        value: this.formatDuration(totalDur.current || 0),
        format: 'text',
        comparisons: this.buildDurationComparisons(...)
    });
    
    // Durchschnittliche Dauer
    const avgCurrent = totalCnt.current > 0 
        ? Math.round(totalDur.current / totalCnt.current) 
        : 0;
    // ...
}
```

#### Duration Value Helper
```javascript
getDurationValue(row, field) {
    if (this.durationMode === 'average') {
        let duration, count;
        if (field === 'duration') {
            duration = row.duration || 0;
            count = row.appointment_count || 0;
        } else if (field === 'consultations') {
            duration = row.consultations || 0;
            count = row.consultation_count || 0;
        }
        // ...
        return count > 0 ? Math.round(duration / count) : 0;
    }
    return row[field] || 0;
}
```

### Blade-Views

| Datei | Beschreibung |
|-------|--------------|
| `resources/views/hub/reports/appointments-body-zones.blade.php` | Haupt-View |
| `resources/views/hub/reports/partials/appointments-count.blade.php` | Termine pro Monat Card |
| `resources/views/hub/reports/partials/appointment-duration.blade.php` | Termindauer pro Monat Card |
| `resources/views/hub/reports/partials/appointment-body-zones.blade.php` | Körperzonen pro Monat Card |
| `resources/views/hub/reports/partials/top-services.blade.php` | Top Services pro Monat Card |
| `resources/views/hub/reports/partials/service-combinations.blade.php` | Service-Kombinationen Card |
| `resources/views/components/kpi-dashboard.blade.php` | Wiederverwendbare KPI-Component |

Alle fünf Cards nutzen `<x-chart-view-toggle>` (Karten-Register, eigener
View-State je Card), `chart-frame-glattt` + `chart-canvas-glattt-{md,lg}`,
`<x-stat-skeleton>` und `<x-card-state>` (Fehler je Sektion via `sectionError`).

### JavaScript-Dateien

| Datei | Beschreibung |
|-------|--------------|
| `public/js/appointments-body-zones.js` | Alpine.js App (~2200 Zeilen) |
| `public/js/components/kpi-dashboard.js` | KPI-Dashboard Logik |

Die fünf ECharts-Renderer folgen seit 07/2026 dem Pflicht-Muster aus
`echarts-glattt.js`: `acquireChart()` (Instanz wiederverwenden),
`...chartAnimation(isUpdate)`, **stabile Serien-ids**, `setOption(…, { notMerge:
true })`, `forceRepaint(chart, isUpdate)` — Filter-/Modus-Wechsel blenden dadurch
animiert über. Ein `dataVersion`-Zähler steckt in allen `x-for`-Keys
(Stale-Scope-Schutz beim Daten-Reload).

### CSV-Export

Export-Quellen in `ReportExportService::SOURCES` (Filter: Zeitraum + Institut):
`appointments-monthly`, `appointments-zones-monthly`,
`appointments-duration-monthly` (Minuten + Zählungen je Kategorie),
`appointments-top-services` (Ranking je Monat, ohne „Desinfektion") und
`appointments-service-combinations` (Ranking je Monat, ab 2 Services / 2
Terminen). Tests: `tests/Feature/ReportExportTest.php`,
`tests/Feature/AppointmentsBodyZonesPageTest.php`.

### CSS

- `public/css/theme_glattt.css` — Alle Styles (KPI-Dashboard, Tabellen, Heatmap etc.)

### Datenquellen

| Tabelle | Beschreibung |
|---------|--------------|
| `stats_historic_appointments` | Historische Termindaten (Phorest-Sync) |
| `consultation_services` | Liste der Beratungs-Service-IDs |

### Caching & Performance

#### Lazy Loading
1. Monatsdaten werden initial geladen
2. Wochendaten werden erst bei Expansion geladen
3. Geladene Wochendaten werden im Frontend gecached

#### Parallele Requests
```javascript
// KPIs werden erst angezeigt wenn BEIDE Datenquellen geladen sind
// Dies stellt sicher, dass alle KPIs in der richtigen Reihenfolge erscheinen
await Promise.all([
    this.loadKpiData(),
    this.loadDurationData()
]);
this.calculateDashboardKpis();
this.loading = false;

// Detail-Daten laden (Tabelle/Chart) separat
this.loadDetailData();
```

### Design

#### Farbschema

| Kategorie | Farbe | CSS Variable |
|-----------|-------|--------------|
| Gesamt | Grau | `var(--text-secondary)` |
| Beratungen | Blau | `var(--color-info)` |
| Behandlungen | Grün | `var(--color-success)` |
| Kombiniert | Türkis | `var(--color-primary)` |

#### Chart-Farben
```javascript
// Gesamt
borderColor: 'rgb(107, 114, 128)',  // Grau

// Beratungen
borderColor: 'rgb(59, 130, 246)',   // Blau

// Behandlungen
borderColor: 'rgb(34, 197, 94)',    // Grün

// Kombiniert
borderColor: 'rgb(59, 155, 159)',   // Türkis
```

#### Tabellen-Styling

Die Tabellen verwenden die `.table-glattt-heatmap` Klasse:
- Sticky Header und erste Spalte
- Heatmap-Farbcodierung für Werte
- Hervorhebung des aktuellen Monats
- Einrückung für Wochen-Zeilen

#### Dark Mode

Vollständig kompatibel mit Light/Dark Mode durch CSS-Variablen.

### Dateien

| Datei | Beschreibung |
|-------|--------------|
| `app/Http/Controllers/ReportController.php` | Backend-Logik (Methoden: `appointmentsBodyZones*`) |
| `routes/web.php` | Route-Definitionen |
| `public/js/appointments-body-zones.js` | Alpine.js App |
| `resources/views/hub/reports/appointments-body-zones.blade.php` | Haupt-View |
| `resources/views/hub/reports/partials/appointments-count.blade.php` | Termine-Card |
| `resources/views/hub/reports/partials/appointment-duration.blade.php` | Dauer-Card |

---

## Verwandte Module

| Modul | Beschreibung |
|-------|--------------|
| [Stornierte Termine](CANCELLED-APPOINTMENTS-ANALYSIS.md) | Analyse von Stornierungen und Löschungen |
| [Buchungsvorlauf](BOOKING-LEAD-TIME-ANALYSIS.md) | Wie weit im Voraus gebucht wird |
| [Wochentag/Uhrzeit](WEEKDAY-TIME-ANALYSIS.md) | Beliebteste Buchungszeiten |

---

## Changelog

### v2.2.0 (Juli 2026) - Statistik-Bauplan
- Alle fünf Cards zweiseitig: **Diagramm als Standard-Ansicht**, Tabelle als Lasche hinter dem Karten-Register
- Skeleton-Platzhalter in Endhöhe statt Spinner; Fehler je Karte mit „Erneut laden"
- Info-Panels für alle fünf Cards (Was zeigt…? / Spalten / Anomalien / Datenquelle)
- ECharts auf `acquireChart`/`chartAnimation` umgestellt — Filter-/Modus-Wechsel animieren
- 3 neue CSV-Export-Quellen: Termindauer, Top Services, Service-Kombinationen
- Bugfix: `subMonths()`-Überlauf am 29.–31. erzeugte doppelte/fehlende Monate in Top Services & Service-Kombinationen (Alpine „Duplicate key")
- Toter Partial `body-zones-distribution.blade.php` + zugehöriger JS-Code entfernt

### v2.1.0 (Februar 2026) - Stattgefundene Termine & UX
- ⭐ **Alle KPIs** zeigen standardmäßig nur **stattgefundene Termine**
- ⭐ **Disclaimer** unter dem KPI-Dashboard ("Alle Kennzahlen beziehen sich auf stattgefundene Termine...")
- ⭐ **Verbesserte KPI-Ladereihenfolge** - Dauer-KPIs werden nicht mehr nachträglich angefügt
- 🔧 Drag & Drop funktioniert jetzt nur noch im Edit-Mode ("Anpassen")
- 🔧 KPI-Personalisierung wird korrekt gespeichert und geladen

### v2.0.0 (Februar 2026) - Termindauer-Modul
- ⭐ **Termindauer pro Monat** - Neue Card mit Tabelle & Chart
- ⭐ **Total/Durchschnitt Toggle** - Umschalten zwischen Gesamtdauer und Ø pro Termin
- ⭐ **5 neue Dauer-KPIs** im Dashboard
- ⭐ **Same Point in Time** Vergleiche für alle Dauer-KPIs
- ⭐ Chart passt Y-Achse an Modus an (Stunden vs. Minuten)
- ⚡ No-Shows werden bei Dauer-Berechnung ausgeschlossen
- 📁 View-Dateien umbenannt (`appointments-count.blade.php`, `appointment-duration.blade.php`)

### v1.2.0 (Februar 2026) - Same Point in Time
- ✅ Alle Trend-Vergleiche nutzen gleichen Zeitpunkt (1.–X. Tag)
- ✅ Fairere Vergleiche mitten im Monat

### v1.1.0 (Januar 2026) - KPI-Dashboard
- ✅ Personalisierbares KPI-Dashboard
- ✅ 8 Kennzahlen für Termine
- ✅ Drag & Drop Anordnung
- ✅ Standort-KPIs bei Multi-Branch

### v1.0.0 (Januar 2026) - Initiale Version
- ✅ Monatliche Terminübersicht
- ✅ Kategorisierung nach Terminart
- ✅ Tabellen- und Chart-Ansicht
- ✅ Wochen-Expansion (Lazy Loading)
- ✅ Branch-Filterung
