# Statistik-Inventar (AP0 — Bestandsanalyse Custom Dashboard)

Stand: 04.08.2026 · Grundlage für den Neubau des Eigenen Dashboards
(Asana „Custom Dashboard überarbeiten", Subtask AP0) und die Schätzung von AP2.

**Zweck:** Vollständige Inventarliste aller Statistiken der Report-Seiten mit
Endpoint, Partial, Filtern, Permission, Alt-Widget-Abgleich und
Aufwandsklasse — als Faktenbasis für das Registry-Schema (AP1) und den
Portierungs-Umfang (AP2).

**Aufwandsklassen:**

- **(a)** rein deklarativ registrierbar — Endpoint vollständig, Partial (fast) kontextfrei
- **(b)** Partial muss kontextunabhängig gemacht werden (Seiten-State/Helfer kapseln, `x-ref` statt Dokument-IDs, Tabellen-Register auf `chartTableMixin` umstellen)
- **(c)** Endpoint muss Filter ergänzen/umbenennen (Zeitraum fehlt oder heißt anders)
- **(d)** Sonderfall mit größerem Eingriff (mehrere Endpoints je Karte, geteilte Loader, Kalender, KPI-Zeilen, Live-Listen)

---

## Gesamtbild

| Kennzahl | Wert |
|---|---|
| Untersuchte Report-Seiten | 13 |
| Kachelfähige Statistiken (Karten) | ~72 (davon 2 bereits portiert: `sales.branch-ranking`, `sales.body-zones-monthly`) |
| davon Klasse (a) | ~14 |
| davon Klasse (b) (oft kombiniert mit (c)) | ~38 |
| davon Klasse (d) Sonderfälle | ~12 |
| KPI-Zeilen (`components/kpi-dashboard`) | 12 — eigener Mechanismus, **kein** Registry-Statistik-Typ |
| Als Kachel ungeeignet | 6+ (Kalenderansichten, 3-stufige Drilldowns, Live-Phorest-Listen, Modals, Sync-UI) |
| Daten-Endpoints **ohne Permission-Gate** | alle `/phorest/reports/*`-Statistik-Endpoints (4 Seiten betroffen, s. u.) |

**Kernbefund zur ursprünglichen Annahme:** Ja, fast jede Statistik hat bereits
einen eigenen Endpoint — aber die Partials sind überwiegend an den Seiten-State
gekoppelt (eine Alpine-Factory pro Seite), Chart-Container hängen an
Dokument-IDs, und die Tabellen-Register sind größtenteils handgebaut statt über
`chart-table.js`. AP2 ist damit **keine reine Registrierung**, sondern je Karte
eine Entkopplung — der Endpoint-Teil ist dagegen meist klein.

---

## Inventar je Seite

Legende Filter: **R** = Zeitraum (`date_from`/`date_to`), **B** = Standort (`branch_id`), **+** = kartenspezifische Zusatzfilter.

### Verkaufsstatistik (`view_report_sales_statistics`) — 15 Statistiken

Endpoints einheitlich über `extractFilters()`: `branch_id, date_from, date_to, seller_id, body_zones`. `months` wird **nirgends** gelesen. Die Seite selbst hat keinen Zeitraumfilter (nur Sidebar-Standort).

| Statistik | Endpoint | Filter | Klasse | Anmerkung |
|---|---|---|---|---|
| KPI-Zeile (8 KPIs) | `/kpis` | B (+valueMode) | (d) | Vergleiche setzen Zeiträume selbst — R würde Kopfzahl/Vergleich entkoppeln |
| Bestandskunden & Flex | `/existing-customer-flex` | B | (b) | Zeitraum fest lfd. Monat → `fixed_range` |
| Sales Mix | `/sales-mix` | B, + mode | (b)+(c) | `date_*` im Cache-Key, aber nicht in Query |
| Neukunden pro Monat | `/new-customers` | B | (c) | Partial fast eigenständig |
| **Körperzonen pro Institut** | `/body-zones-chart` | R B | **portiert** | Referenz-Implementierung Chart |
| Körperzonen pro Tag | `/body-zones-daily-chart` | R B, + Ø/Toggles | (b) | Alt-Widget hatte abweichendes Feature-Set auf demselben Partial |
| Standort-Vergleich seit Eröffnung | `/branch-opening-comparison` | B | (b) | bewusst ohne R (Tag-0-Vergleich) → `fixed_range`; Cache-Key nur branch! |
| Vertragslaufzeiten | `/contract-terms` | R B, + 3 Serverfilter | (b) | braucht `params()`-Hook (existiert in glattt-stats.js) |
| Zahlungsausfälle | `/payment-failures` | R B, + Gruppe/Raten | (d) | Vergleichsserie B = zweiter paralleler Request |
| MRR / Lastschriften-Bestand | `/mrr` | B | (b)+(c) | `date_*` ignoriert |
| Rücklastschriften | `/chargebacks` | B | (b)+(c) | dito |
| Direktzahler-Segment | `/direct-pay` | R B | (b) | Endpoint fertig |
| Monatliche Übersicht | `/monthly` | R B | (d) | verschachtelte Alpine-Factory `monthlyOverviewTable()`, eigener View-Toggle; half unbrauchbar |
| **Ranking nach Institut** | `/branches` | R B | **portiert** | ⚠ Currency-Bug offen (s. Abweichungen) |
| Ranking nach Mitarbeiter | `/sellers` | R B | (a)/(b) | Partial verwaist (nur Alt-Widget nutzte es) |

### Der glattt-Kunde (`view_report_client_statistics`) — 10 Statistiken

Endpoints einheitlich: `branch_id, date_from, date_to, consultation_only, gender, age_group, min_distance, max_distance`. Cache-Key enthält alle Filter (sicher).

| Statistik | Endpoint | Filter | Klasse | Anmerkung |
|---|---|---|---|---|
| Altersverteilung | `/demographics` | R B + | (d) | teilt Partial+Antwort mit Geschlechterverteilung → aufspalten |
| Geschlechterverteilung | `/demographics` | R B + | (d) | zwei Registry-Keys auf einen Endpoint möglich |
| Herkunftsverteilung | `/name-origins` | R B + | (d) | Admin-Aktionen (KI-Klassifizierung) aus Partial lösen |
| Conversion Funnel | `/funnel` | R B + | (b) | |
| Entfernungsverteilung | `/distance` | R B + | (b) | sauberster Fall |
| Körperzonen-Verteilung | `/body-zones` | R B +, Modus clientseitig | (b) | |
| Widerrufs-Analyse | `/cancellations` | R B +, Modus | (b) | |
| Einzugsgebiet (PLZ-Karte) | `/map` | R B + | (d) | Leaflet statt ECharts, Seiten-Assets; nur full |
| Top-PLZ | `/top-plz` (+`limit`) | R B + | (d) | PLZ-Suche greift auf Karten-Daten der Nachbar-Sektion zu |
| Persona-Segmente | `/segments` | R B + | (b) | |
| KPI-Zeile (8 KPIs, serverseitig) | `/kpis` | R B + | (d) | |

### glattt-Pakete / Client-Courses (Seite: `view_report_client_courses`) — 1 Statistik

**⚠ Daten-Endpoints ohne Permission** (liegen in der `/phorest`-Gruppe).

| Statistik | Endpoint | Filter | Klasse | Anmerkung |
|---|---|---|---|---|
| Monatliche Übersicht | `/phorest/reports/client-courses/monthly` | B (+`months`, nie gesendet) | (c) | reine Tabelle; Endpoint auf `date_from/to` heben |
| KPI-Zeile | `…/kpis` | B | (d)/(c) | KPIs werden **clientseitig** gebaut; Zeitraum fest; Cache-Key ohne Zeitraum |

### Ads-Analyse (`view_report_ads_analysis`) — 9 Statistiken

Endpoints einheitlich: `branch_id, date_from, date_to, platform, campaign`. Kein `months`.

| Statistik | Endpoint | Filter | Klasse | Anmerkung |
|---|---|---|---|---|
| Kampagnen-Übersicht | `/campaigns` | R B + Plattform | (b) | Notiz-Modal-Kopplung lösen; 11 Spalten → full |
| Coupon-Code-Auswertung | `/coupon-codes` | R B + | (a) | |
| Monatliche Entwicklung | `/monthly` | R B + | (d) | teilt Endpoint+Loader+State mit Kostenverlauf |
| Kostenverlauf & Kosten pro Lead | `/monthly` | R B + | (d) | dito |
| Buchungen pro Quelle & Monat | `/monthly-sources` | R B +, Radio | (b) | |
| Buchungen pro Tag | `/daily-bookings` | R B + Kampagne | (a) | Musterfall (einzige Ads-Karte mit `x-chart-table`) |
| Herkunfts-Analyse | `/sources` **+** `/entry-sources` | R B + | (d) | zwei Endpoints in einer Karte |
| Suchbegriffe (Wortwolke) | `/search-terms` | R B + | (d) | Fremd-Library wordcloud2 |
| Ads vs. Organisch | `/ads-vs-organic` | R B + | (a) | kein Chart (Vergleichs-Kacheln) |
| KPI-Zeile (17 KPIs) | `/kpis` | R B + | (d) | |

### Besucher-Funnel (`view_report_visitor_funnel`) — 7 Statistiken

Endpoints: `date_from, date_to, standort, referrer_type` — **kein `branch_id`** (Standort ist Matomo-Dimension; `standort` wird vom JS nie gesendet). Registry: `filters: ['range']`.

| Statistik | Endpoint | Klasse | Anmerkung |
|---|---|---|---|
| Was die Daten zeigen | `/insights` | (a) | Textliste |
| Buchungs-Funnel | `/funnel` | (d) | ECharts-custom-series + Breitenmessung |
| Verlauf | `/timeseries` | (a) | **Referenz „Karte mit eigenem Zeitraum"** (`rangedUrl()`) |
| Funnel-Vergleich | `/segments` + `/segment-timeseries` | (d) | zwei Endpoints, 5 Umschalter |
| Herkunft der Besucher | `/sources` | (a) | |
| Geräte-Vergleich | `/devices` | (a) | half ideal |
| Top-Unterseiten | `/top-pages` | (a)/(c) | Limit 15 fest |
| KPI-Zeile (13 KPIs) | `/kpis` | (d) | |

### Mitarbeiterperformance (Gate: `view_report_sales_statistics` ⚠, mit Datensichtbarkeits-Scope) — 3 Karten, alle (d)

`view_report_staff_performance` **existiert nicht mehr** (07/2026 konsolidiert). DataScope greift serverseitig auf allen Endpoints (Cache-Isolation automatisch).

| Statistik | Endpoint(s) | Klasse | Anmerkung |
|---|---|---|---|
| Tagesmessung (Matrix + Historien-Chart) | `/overview` (2× mit unterschiedlichen Zeiträumen) | (d) | Matrix als HTML-String (~3000 Zellen), Zell-Detail-Modal, Korrekturen |
| Beratungs-Ranking (Chart + Bestenliste) | Chart: **kein eigener Endpoint** (liest Tagesmessungs-Daten); Tabelle: `/staff-ranking` | (d) | Statistik ohne eigene Datenquelle |
| Behandlungs-Ranking (Chart + Tabelle) | `/treatments-timeline` + `/treatments` | (d) | zwei Endpoints in einer Karte |
| KPI-Zeile (lfd. Monat) | `/kpis` | (d) | |

Gestrichene Karten mit lebenden Endpoints: `/branches`, `/monthly`, `/body-zones` — Partials existieren nicht mehr; als Dashboard-Statistik wäre das **Neubau**, kein Port.

### HR-Kennzahlen (`view_report_hr_kpis`) — 10 Statistiken, alle (b)

Endpoints einheitlich `date_from/date_to/branch_id`. **Kein DataScope** (Gehaltsschutz via `view_hr_salaries`). Einzige Seite, die `chart-table.js` bereits lädt — Registry-Muster passt hier direkt.

Kapazität (`/capacity`), Produktivität (`/productivity`), Personalkosten (`/costs`, Permission `view_hr_salaries`!), Abwesenheiten (`/absence`), Fluktuation (`/turnover`), Befristungs-Radar (`/contract-radar`, Zeitraum ohne Wirkung → `fixed_range`), Personalstruktur (`/structure`), Institutsvergleich (`/branches`, Seiteneffekt `branchNames` auflösen), Mitarbeiter im Detail (`/employees`), Datenqualität (`/data-quality`). KPI-Zeile (22 KPIs) = (d).

### glattt-KPIs (`view_report_glattt_kpis`) — 2 Statistiken

| Statistik | Endpoint | Klasse | Anmerkung |
|---|---|---|---|
| Zeitraum-Übersicht | `/periods` | (b) | 5 feste Perioden → `fixed_range`; geteiltes `valueMode` kapseln |
| Institut-Vergleich | `/branches` | (b) | eigenes `period`-Enum via `params()`; `branch_id` wird serverseitig verworfen → `filters: []` |

Besonderheit: einzige Seite mit eigenem Standort-Dropdown statt Sidebar.

### Terminstatistik (Seite: `view_report_appointments_body_zones`) — 5 Statistiken

**⚠ Alle 6 Daten-Endpoints ohne Permission** (`/phorest`-Gruppe). Kein Zeitraum (fix letzte 12 Monate) → (c) durchgängig.

Monatliche Übersicht (`/data`, +Wochen-Drilldown), Termindauer (`/duration` — JS sendet `appointment_filter`, Controller ignoriert ihn!), Körperzonen (`/body-zones`, dito), Top Services (`/top-services` — schreibt in die KPI-Zeile zurück → entkoppeln), Service-Kombinationen (`/service-combinations`, sauberster Kandidat). KPI-Zeile: kein eigener Endpoint — wird im Browser aus vier Antworten gebaut (d).

### Widerrufsstatistik (`view_report_revocation_statistics`) — 4 Statistiken

Vorbildlich: alle Endpoints einheitlich `branch_id, date_from, date_to, date_mode, seller_id`, durchgängig Permission.

| Statistik | Endpoint(s) | Klasse |
|---|---|---|
| Entwicklung über Zeit | `/trend` | (b) — echtes `x-chart-table` vorhanden |
| Struktur der Widerrufe | `/by-reason` + `/by-reaction` + `/first-session` | (d)/(b) — 3-in-1-Karte |
| Zeitraum bis Widerruf | `/days-between` | **(a)** — nächstliegender Kandidat |
| Quote im Vergleich | `/by-branch` + `/by-seller` + `/contract-value` + `/by-zones` | (d)/(b) — 4-in-1-Karte |

### Zukünftige Beratungsgespräche (Seite: `view_report_upcoming_consultations`) — 5 kachelfähige

**⚠ Daten-Endpoints ohne Permission** (`/phorest`). Parameter-Wildwuchs: `from_date/to_date`, `start_date/end_date`, Stichtag `date`.

Kachelfähig: Buchungsstand (`/upcoming-consultations-data`, b+c), Entwicklung geplanter BGs (`/booking-outlook-timeseries`, **a** — eigener x-data, einzige Karte mit echtem `x-chart-table`), Historischer Buchungsvergleich (`/historic-booking-comparison`, b/c — Stichtag statt Range), Freie Slots (`/free-slots-analysis`, a/c), Buchungsvorlauf (`/booking-lead-time-analysis`, **a**).
Ungeeignet als Kachel: Kalenderübersicht (d), Buchungsstand-Verlauf (3-stufiger Drilldown, d), Tages-Modal.

### Vergangene Beratungsgespräche (Seite: `view_report_past_consultations`) — 3 kachelfähige

**⚠ Endpoints ohne Permission.** Beratungsgespräche-Analyse (`/consultation-monthly/fast`, b+d — Chart-Code in separatem `chart2Extensions`), Wochentag & Uhrzeit (`/weekday-time-analysis`, a/c — eigener x-data), No-show-Matrix (`/no-show-matrix`, c — `offset`-Paging statt Range).
Ungeeignet: Buchungseingänge-Kalender (d), Sync-UI, Modals.

### Stornierte und gelöschte Termine (Seite: `view_report_cancelled_appointments`) — 2 kachelfähige

**⚠ Endpoints ohne Permission.** Stornierte Termine pro Monat + Gelöschte Termine pro Monat (`/monthly/fast`, b — eigene x-data, aber Daten kommen per `window`-Events vom Seiten-App → durch Props/eigenes Laden ersetzen).
Ungeeignet: Stornierte Beratungstermine 14 Tage (Live-Phorest-Liste, d).

---

## Liste 1 — Statistiken ohne Zeitraum-Unterstützung (Eingabe für AP3, `fixed_range`-Hinweis)

| Statistik | Tatsächlicher Zeitraum |
|---|---|
| Bestandskunden & Flex | Laufender Monat (Same-Point-Vergleich Vormonat) |
| Standort-Vergleich seit Eröffnung | Gesamte Historie ab Tag 0 je Standort |
| Körperzonen pro Institut (portiert) | Gesamte Historie, Ausschnitt per Zoom |
| Sales Mix, Neukunden, MRR, Rücklastschriften | Gesamte Historie (date im Cache-Key, nicht in Query → (c) nachrüstbar) |
| glattt-KPIs Zeitraum-Übersicht | 5 feste Perioden |
| glattt-KPIs Institut-Vergleich | Perioden-Dropdown der Karte (`period`) |
| HR Befristungs-/Probezeit-Radar | Kommende 90 Tage |
| Terminstatistik (alle 5 Karten) | Letzte 12 Monate fest |
| Buchungsstand (upcoming) | Kommende 28 Tage |
| Historischer Buchungsvergleich | Stichtag-Vergleich (kein Range) |
| Staff-Tagesmessung Historien-Chart / Rankings-Charts | Gesamte Historie, Zoom |
| Alle KPI-Zeilen mit festen Vergleichszeiträumen | lfd. Monat / Vormonat / Vorjahr |

## Liste 2 — Statistik-Endpoints ohne Permission (Registry-Blocker!)

Alle in der `Route::prefix('phorest')`-Gruppe (nur `RedirectDirectApiAccess` + `CheckHubAccess`):

- **Terminstatistik:** alle 6 Endpoints (`/data`, `/duration`, `/body-zones`, `/top-services`, `/service-combinations`, `/kpi` + Weeks-Drilldowns) — Seiten-Gate wäre `view_report_appointments_body_zones`
- **Client-Courses:** `/monthly`, `/kpis`, `/sync-status` — Seiten-Gate `view_report_client_courses`
- **Upcoming Consultations:** alle Statistik-Endpoints (`upcoming-consultations-data`, `booking-outlook-timeseries`, `historic-booking-comparison`, `historic-booking-timeline/*`, `free-slots-analysis`, `booking-lead-time-analysis`, `upcoming-consultations-kpi`) — Gate `view_report_upcoming_consultations`
- **Past Consultations:** `historic-appointments/*` (consultation-monthly/fast, weekly, appointments, weekday-time-analysis, no-show-matrix, consultation-booking-calendar/day) — Gate `view_report_past_consultations`
- **Stornierte Termine:** `cancelled-appointments/*` (Lese-Endpoints) — Gate `view_report_cancelled_appointments`

Da die neue Registry Permission als Pflichtfeld durchsetzt (`StatisticRegistry::all()` wirft), müssen diese Routen **vor** ihrer Registrierung hinter `can:`-Gates — sinnvollerweise als eigenes kleines Vorab-Paket (auch unabhängig vom Dashboard ein Sicherheitsgewinn).

## Liste 3 — Bekannte Abweichungen Alt-Widget ↔ Report-Seite (Beleg der Ursachenanalyse, Abnahme-Testfälle)

1. **`months` wurde überall ignoriert.** Kein einziger Karten-Endpoint liest `months` — alle Alt-Widgets sendeten es. Faktisch zeigten Widgets Server-Defaults (volle Historie bzw. `DEFAULT_MONTHS=4` bei Staff), egal was der Dashboard-Filter sagte.
2. **KPZ-Chart-Widget zeigte die 6 ältesten statt neuesten Monate** (`months.slice(0, 6)` auf aufsteigend sortierter Liste).
3. **Tote Routen im Widget-JS:** `widgetConsultationPastStats` und `widgetAppointmentsBodyZones/TopServices` riefen URLs auf, die nicht existieren (falscher Prefix bzw. nie angelegte Route) → garantierter Fehlerzweig.
4. **State-Vertragsbruch:** Widget-Factories lieferten andere Variablennamen als die eingebetteten Seiten-Partials erwarten (`bodyZonesStats` vs. `bodyZonesData`, fehlende `sectionError`/`set*View`/`dataVersion`) → Alpine-Fehler, Charts konnten nie initialisieren. Zusätzlich Dokument-ID-Kollisionen.
5. **Toggle-Bruch:** KPZ-Widget definierte `toggleBodyZonesShowCancelled`, das Partial ruft `toggleBodyZonesCancelled()` → Klick warf Fehler.
6. **Alte WidgetRegistry-Permission `view_report_staff_performance` existiert nicht** → Mitarbeiter-Widgets waren für alle Nutzer unsichtbar (oder je nach Gate-Verhalten falsch gefiltert).
7. **`widgetPackagesMonthly`** las Felder (`new_sold`, `active_count`), die der Endpoint nicht liefert.
8. **Neu (aus AP1-Pilot):** `GlatttStats.formatCurrency` (immer brutto, 2 Nachkommastellen) weicht von `salesStatisticsApp.formatCurrency` (netto-fähig, 0 Nachkommastellen) ab — vor Portierung weiterer €-Statistiken braucht `glattt-stats.js` einen valueMode-fähigen Formatter, sonst ändern sich angezeigte Beträge still.

## Filter-Harmonisierung (Entscheidung 2)

Heute nebeneinander: `date_from/date_to` (Verkauf, Kunde, Ads, Widerrufe, HR, Funnel) · `from_date/to_date` (upcoming-consultations-data) · `start_date/end_date` (free-slots, lead-time, weekday-time) · `period`-Enums (glattt-KPIs, lead-time) · `month/week/weeks/offset` (Drilldowns/Paging) · Stichtag `date` (historic-comparison).

**Vorschlag:** `date_from`/`date_to` + `branch_id` als verbindliches gemeinsames Schema (deckt sich mit AP1-Registry und `ReportExportService`). Abweichende Endpoints bekommen die Parameter als Alias (Controller liest beide Namen); karteneigene Parameter (`period`, `booking_type`, `date_mode`, `seller_id`, …) laufen über den `params()`-Hook der Statistik-Komponente und bleiben Karten-UI.

## Registry-Schema — Abgleich mit dem AP1-Entwurf

Der AP1-Entwurf (`StatisticRegistry`: key, label, description, category, icon, **permission (Pflicht)**, route, filters `[range|branch]`, fixed_range, view, js, script, default_width) trägt für ~85 % des Bestands. Aus dem Inventar ergeben sich diese Ergänzungen:

1. **Kategorien erweitern:** verkauf, kunden, pakete, ads, besucher, personal, termine, widerrufe (statt nur `verkauf`).
2. **`fixed_range` bewährt sich** — Liste 1 liefert die Texte.
3. **Kein Pflicht-Chart:** Darstellungstyp ist Sache der View (Tabellen/Stat-Strips/Textlisten sind gültige Statistiken) — kein Schemafeld nötig.
4. **Mehrere Endpoints je Statistik (A7, V4, B2, B4, S6):** statt Schema-Erweiterung → Komponente überschreibt `load()` bzw. Basis bekommt optionalen Multi-Fetch-Helfer; die Registry behält **eine** Haupt-`route` (für Permission-/Existenz-Checks) + optionales `extra_routes` für den Konsistenz-Test.
5. **€-Formatter valueMode-fähig machen** (brutto/netto, 0 Nachkommastellen) — Blocker für alle €-Statistiken (Liste 3.8).
6. **KPI-Zeilen bleiben außen vor:** `components/kpi-dashboard` ist ein eigener Rahmen; einzelne KPIs als Dashboard-Kacheln sind Thema der Kurzanzeige (AP5), nicht der Statistik-Registry.
7. **Nicht kachelfähige Ansichten werden bewusst NICHT registriert** (Kalender, mehrstufige Drilldowns, Live-Listen, Modals) — sie bleiben Seiten-exklusiv. Das ist eine bewusste Abgrenzung zum Zielbild „jede Statistik".
8. **`ReportExportService::SOURCES` bleibt eigenständig**, Konsolidierung (Export-Resolver referenziert Registry-Keys) als späteres Paket — Struktur ist kompatibel (label/page/permission/filters).

## AP2 — Schätzgrundlage und empfohlene Reihenfolge

Seitenweise, sortiert nach Aufwand/Nutzen (Klassenprofil in Klammern):

1. **Widerrufsstatistik** (1×a, 1×b, 2×d-light) — sauberste Endpoints, echtes chart-table vorhanden
2. **HR-Kennzahlen** (10×b) — homogen, chart-table.js schon im Einsatz
3. **glattt-KPIs** (2×b) — klein
4. **Besucher-Funnel** (5×a, 2×d) — viele Selbstläufer
5. **Verkaufsstatistik Rest** (5×b, 3×b+c, 1×c, 2×d) — Currency-Formatter zuerst
6. **Der glattt-Kunde** (5×b, 5×d) — Demographics-Split, Karten-Sonderfall
7. **Ads-Analyse** (3×a, 2×b, 3×d)
8. **Termin-Seiten + Terminstatistik + Pakete** (Permission-Vorab-Paket nötig, Parameter-Aliase, viele c)
9. **Mitarbeiterperformance** (3×d) — zum Schluss; ggf. bewusst nur Teilmengen kachelfähig machen

Vorab-Pakete vor/parallel zu AP2: **(P1)** `can:`-Gates auf alle `/phorest`-Statistik-Endpoints (Liste 2), **(P2)** valueMode-fähiger Currency-Formatter in `glattt-stats.js`, **(P3)** Zeitraum-Aliase (`from_date`/`start_date` → `date_from`).

---

## Entscheidungen (04.08.2026, mit Jan abgestimmt)

Die vormals offenen Fragen sind entschieden — AP2 läuft auf dieser Grundlage:

1. **Zuschnitt: Partial-Variante.** Report-Seite und Kachel rendern dasselbe Partial (`<x-statistic>`) — jede Änderung an einer Statistik wirkt automatisch an beiden Stellen. Der AP1-Stand setzt das bereits um.
2. **Umfangs-Abgrenzung: Kalender, mehrstufige Drilldowns und Live-Listen werden vorerst NICHT registriert** — auf später verschoben. Welche Ansichten das sind, wird **genau dokumentiert** (siehe Abschnitt „Nicht registrierte Statistiken" in `CUSTOM-DASHBOARD.md` bzw. Liste im Zuge von AP2).
3. **Permission-Lücke: seitenweise im Zuge von AP2 schließen** — beim Portieren einer Seite werden ihre `/phorest`-Endpoints hinter das jeweilige `can:`-Gate gelegt (Liste 2 als Checkliste).
4. **Filter-Harmonisierung: je Portierung, aber vollständig** — Ziel bleibt, dass am Ende ALLE Statistik-Endpoints das gemeinsame Schema `date_from`/`date_to` + `branch_id` sprechen (abweichende Alt-Namen als Alias weiterhin akzeptiert); karteneigene Parameter über den `params()`-Hook.

---

## Ergebnis AP2 (abgeschlossen 04.08.2026)

Alle 13 Report-Seiten sind portiert. **78 Statistiken** liegen in
`StatisticRegistry` und werden über `<x-statistic>` gerendert — auf der
Report-Seite wie als Dashboard-Kachel:

| Kategorie | Anzahl |
|---|---|
| Termine | 18 |
| Verkauf (inkl. glattt-KPIs) | 16 |
| Personal (HR + Mitarbeiterperformance) | 13 |
| Kunden | 10 |
| Ads | 9 |
| Besucher | 7 |
| Widerrufe | 4 |
| Pakete | 1 |

Über den ursprünglichen Umfang hinaus wurden **entgegen Entscheidung 2 doch
registriert**, weil sie sich sauber kapseln ließen: Kalenderübersicht
(`termine.consultation-calendar`), Buchungsstand-Verlauf mit dreistufigem
Drilldown (`termine.booking-timeline`) und Buchungseingangs-Kalender
(`termine.booking-calendar`). Die zugehörigen Modale (Tagesliste, Buchungs-
details, Termine-Liste der Ampel-Tabelle, Zell-Detail und Korrekturen der
Tagesmessung, Mitarbeiter-Einzelansicht) gehören jeweils zu ihrer Karte und
stehen damit auch im Dashboard zur Verfügung.

### Nicht registriert — und warum

Der Rest der Report-Seiten ist bewusst Rahmen oder Verwaltung, keine Statistik:

| Ansicht | Report | Grund |
|---|---|---|
| Stornierte Beratungstermine (14 Tage) | Stornierte & verschobene Termine | Live-Belegliste aus Phorest: Einzeldatensätze statt Aggregate; erscheint nur bei aktivem Beratungsservice-Filter |
| Termin-Modal der Storno-Liste | Stornierte & verschobene Termine | gehört zur Liste |
| Admin-Aktionen der Herkunfts-Analyse | Der glattt-Kunde | Aktionen (Klassifizierung, KI-Optimierung) mit `trigger_data_sync`; die Kachel `kunden.name-origins` zeigt nur die Auswertung |
| Filterleiste | Der glattt-Kunde | Seiten-Filter, kein Inhalt |
| Zielwerte-Modal | Mitarbeiterperformance | Verwaltung der Ampel-Schwellen |
| Sync-Status & Sync-Aktionen | Vergangene Beratungsgespräche | Betriebs-UI, keine Auswertung |
| Header-Card, Export-Modal | alle Seiten | Rahmen |
| KPI-Zeile (`components/kpi-dashboard`) | alle Seiten | eigener, personalisierbarer Mechanismus — bewusst kein Registry-Typ |

### Offene Punkte

- **CSV-Export:** Für vier Karten fehlt noch eine Quelle in
  `ReportExportService::SOURCES` — `termine.historic-booking-comparison`,
  `termine.no-show-matrix`, `personal.employees`, `personal.data-quality`.
  Alle vier sind Altbestand, nicht durch AP2 entstanden.
- **Alt-System entfernt:** `WidgetRegistry`, `components/statistics/widgets/*`
  und `public/js/statistics-widgets.js` sind mit AP2 ersatzlos entfallen.

*Erstellt im Rahmen von AP0 (04.08.2026) auf Basis von sechs parallelen Code-Analysen über alle 13 Report-Seiten. Entwickler-Doku der neuen Konvention: `.github/instructions/statistic-components.instructions.md`; Nutzer-/Architektur-Doku des Dashboards: `CUSTOM-DASHBOARD.md`.*
