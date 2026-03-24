# Reports Modul - Dokumentation

## Übersicht

Das **Reports Modul** bietet umfassende Statistiken und Analysen für das Institut-Management. Alle Reports sind über `/hub/reports` erreichbar und unterstützen die Branch-Filterung über das globale Header-Dropdown.

## 📊 Verfügbare Reports

### 1. Zukünftige Beratungsgespräche
**Route:** `/hub/reports/upcoming-consultations`

Zeigt geplante Beratungstermine in den nächsten 7, 14 und 28 Tagen.

**Features:**
- Terminzählung pro Zeitraum
- Standort-Aufschlüsselung
- Historischer Vergleich mit Vormonat/Vorjahr
- Excel-Export

#### Kalenderübersicht

Interaktiver Monatskalender mit zwei Ansichtsmodi:

- **Auslastungs-Ansicht** (Standard): Zeigt pro Tag die Anzahl Termine, freie Slots und Auslastung in %
- **Pro-Standort-Ansicht**: Farbige Balken pro Standort mit Terminanzahl (ab Tablet-Größe ≥768px)
- **Toggle-Switch**: Umschalten zwischen beiden Ansichten im Kalender-Header
- **Standort-Legende**: Farbige Punkte mit Standort-Namen (nur in pro-Standort-Ansicht)

#### KW-Zusammenfassung

Am rechten Rand jeder Kalenderwoche wird eine KW-Karte angezeigt (nur Desktop >1350px):

- **Kalenderwochen-Nummer** und Gesamtanzahl Termine der Woche
- **Aufschlüsselung pro Standort**: Farbiger Punkt + Standort-Name + Terminanzahl
- Nur Standorte mit mindestens einem Termin werden angezeigt
- Sortierung nach konfigurierter Standort-Reihenfolge (`sort_order`)

#### Responsive Verhalten

| Breakpoint | Verhalten |
|------------|----------|
| >1350px | Volle Ansicht: 7-Tage-Grid + KW-Spalte, beide View-Modi |
| ≤1350px | KW-Spalte ausgeblendet, kompaktere Balken |
| ≤768px | Pro-Standort-Ansicht + Toggle ausgeblendet, nur Auslastung. Automatischer View-Wechsel bei Resize |
| ≤640px | Monatsname ausgeblendet, Auslastungs-Badge versteckt |
| ≤480px | 2-Buchstaben-Wochentage, ultra-kompakt |

---

### 2. Vergangene Beratungsgespräche
**Route:** `/hub/reports/past-consultations`

Historische Analyse vergangener Beratungstermine.

**Features:**
- Monatliche Übersicht mit Chart
- No-Show Rate Tracking
- Beliebtester Wochentag (letzte 3 Monate)
- Prognose für den aktuellen Monat
- Detailansicht mit Wochen-Expansion

---

### 3. Stornierte und gelöschte Termine ⭐ NEU
**Route:** `/hub/reports/rescheduled-cancelled`

Umfassende Analyse von Terminausfällen.

**Features:**
- **Stornierte Termine** (orange): `activation_state=CANCELED`
- **Gelöschte Termine** (rot): `deleted=true`
- Stornoquote und Löschquote in %
- Heatmap-Visualisierung nach Monat/Standort
- Chart-Ansicht mit gestapelten Balken
- Wochen-Expansion mit Detailansicht
- KPI-Dashboard mit 10 Kennzahlen
- Standortvergleich (höchste Stornoquote)
- Prognose für laufenden Monat

**Dokumentation:** [CANCELLED-APPOINTMENTS-ANALYSIS.md](CANCELLED-APPOINTMENTS-ANALYSIS.md)

---

### 4. Auslastung
**Route:** `/hub/reports/utilization`

Terminauslastung und Kapazitätsübersicht.

**Features:**
- Auslastungsquote in %
- Kapazitätsanalyse pro Standort
- Zeitraum-Vergleiche

---

### 5. Freie Slots Analyse
**Route:** `/hub/reports/free-slots-analysis`

Heatmap freier Beratungsslots nach Wochentag und Uhrzeit.

**Features:**
- 7-Tage-Vorschau
- Heatmap-Visualisierung
- Optimale Buchungszeiten

---

### 6. Buchungsvorlauf-Analyse
**Route:** `/hub/reports/booking-lead-time-analysis`

Wie viele Tage im Voraus werden Termine gebucht.

**Features:**
- Durchschnittlicher Vorlauf in Tagen
- Verteilung nach Vorlauf-Kategorien
- Trend-Analyse

**Dokumentation:** [BOOKING-LEAD-TIME-ANALYSIS.md](BOOKING-LEAD-TIME-ANALYSIS.md)

---

### 7. Wochentag & Uhrzeit Analyse
**Route:** `/hub/reports/weekday-time-analysis`

Sweetspot-Erkennung für optimale Buchungszeiten.

**Features:**
- Heatmap nach Wochentag/Uhrzeit
- Beliebteste Kombinationen
- Standort-Vergleich

**Dokumentation:** [WEEKDAY-TIME-ANALYSIS.md](WEEKDAY-TIME-ANALYSIS.md)

---

### 8. Terminstatistik ⭐ AKTUALISIERT
**Route:** `/hub/reports/appointments-body-zones`

Umfassende Analyse aller stattgefundenen Termine nach Kategorien und Dauer.

**Features:**
- **Personalisierbares KPI-Dashboard** mit 13+ Kennzahlen
- **Termine pro Monat**: Beratungen, Behandlungen, kombinierte Termine
- **Termindauer pro Monat**: Gesamtdauer und Ø pro Termin (Toggle)
- **Same Point in Time** Vergleiche (1.-X. Tag des Monats)
- **No-Show Tracking** (separat ausgewiesen)
- Wochen-Expansion mit Lazy Loading
- Tabelle/Chart-Ansichten für alle Module

> ℹ️ Alle Kennzahlen beziehen sich auf **stattgefundene Termine** (keine No-Shows), sofern nicht anders angegeben.

**API-Endpoints:**
- `/reports/appointments-body-zones/kpi` - Schnelle KPI-Daten (nur stattgefunden)
- `/reports/appointments-body-zones/data` - Monatliche Termine
- `/reports/appointments-body-zones/weeks` - Wochen-Details (Lazy Loading)
- `/reports/appointments-body-zones/duration` - Monatliche Dauer + KPI Summary
- `/reports/appointments-body-zones/duration/weeks` - Wochen-Dauer (Lazy Loading)

**Dokumentation:** [APPOINTMENT-STATISTICS.md](APPOINTMENT-STATISTICS.md)

---

## 🎯 Reports-Übersichtsseite

Die Übersichtsseite `/hub/reports` zeigt KPI-Vorschauen für jeden Report:

### Zukünftige Beratungsgespräche
- **Heute**: Termine am aktuellen Tag
- Termine in 7/14/28 Tagen
- Standort-Breakdown mit Heute-Spalte
- ⚡ Optimierter KPI-Endpoint `/upcoming-consultations-kpi`

### Vergangene Beratungsgespräche
- Beratungen diesen Monat
- Prognose
- No-Show Rate
- Beliebtester Tag

### Stornierte und gelöschte Termine
| KPI | Beschreibung |
|-----|--------------|
| Stornoquote | % der stornierten Termine vs. Vormonat/Vorjahr (PP) |
| Löschquote | % der gelöschten Termine vs. Vormonat/Vorjahr (PP) |
| Stornierte Termine | Absolute Anzahl vs. Vormonat/Vorjahr (%) |
| Höchste Stornoquote* | Standort mit höchster Rate + Vergleich zu anderen |
| Gesamt ausgefallen** | Storniert + Gelöscht |

\* Nur bei "Alle Institute"  
\** Nur bei einzelnem Standort

### Terminstatistik
| KPI | Beschreibung |
|-----|-------------|
| Behandlungen | Stattgefundene Behandlungen (ohne Beratung) vs. Vormonat |
| Termindauer gesamt | Gesamte Dauer aller Termine vs. Vormonat |
| Ø Termine/Tag | Durchschnittliche Termine pro Tag vs. Vormonat (gesamt) |
| Ø Termindauer | Durchschnittliche Dauer pro Termin vs. Vormonat (gesamt) |

> ℹ️ Diese KPIs zeigen nur **stattgefundene Termine** (COMPLETED/PAID).

### Fallback-Logik
Wenn für den aktuellen Monat noch keine Daten vorliegen (z.B. am 1. Februar), werden automatisch die Daten des Vormonats angezeigt. Das Monatslabel passt sich entsprechend an (z.B. "Jan '26").

---

## 🔧 Technische Architektur

### Backend

```
app/Http/Controllers/ReportController.php
├── upcomingConsultations()
├── upcomingConsultationsKpi()          # ⚡ Optimierter KPI-Endpoint
├── pastConsultations()
├── rescheduledCancelled()
├── cancelledAppointmentsMonthly()
├── cancelledMonthlyStatsFast()         # ⚡ Lazy Loading - nur Monate
├── appointmentsBodyZones()             # View
├── appointmentsBodyZonesKpi()          # ⚡ Schnelle KPIs (nur stattgefunden)
├── appointmentsBodyZonesData()         # Detaillierte Daten
├── appointmentsBodyZonesDurationData() # ⭐ Termindauer + KPI Summary
├── appointmentsBodyZonesDurationWeeks()# ⭐ Wochen-Dauer (Lazy Loading)
├── reportsOverviewKpis()               # ⭐ Übersichtsseite KPIs
├── cancelledWeeklyForMonth()           # ⚡ Lazy Loading - Wochen on-demand
├── cancelledWeeksForChart()            # ⚡ Lazy Loading - Chart-Wochen
├── cancelledDaysForChart()             # ⚡ Lazy Loading - Chart-Tage
├── cancelledAppointmentsDetails()
├── cancelledAppointmentsNotes()
├── consultationMonthlyStatsFast()      # ⚡ Lazy Loading - nur Monate
├── consultationWeeklyForMonth()        # ⚡ Lazy Loading - Wochen on-demand
├── consultationWeeksForChart()         # ⚡ Lazy Loading - Chart-Wochen
├── consultationDaysForChart()          # ⚡ Lazy Loading - Chart-Tage
├── historicBookingTimelineFast()       # ⚡ Lazy Loading - nur Monate
├── historicBookingTimelineWeeksForMonth() # ⚡ Lazy Loading - Wochen
├── historicBookingTimelineDaysForWeek()   # ⚡ Lazy Loading - Tage
├── utilization()
├── freeSlotsAnalysis()
├── bookingLeadTimeAnalysis()
└── weekdayTimeAnalysis()
```

**Lazy Loading Dokumentation:** [LAZY-LOADING-PERFORMANCE.md](LAZY-LOADING-PERFORMANCE.md)

### Frontend

```
public/js/
├── reports.js                      # Reports-Übersichtsseite
├── consultation-stats.js           # Kalenderübersicht (Alpine.js)
├── cancelled-appointments-page.js  # KPI-Dashboard für Stornierte
└── cancelled-appointments-analysis.js  # Analyse-Komponenten
```

### Views

```
resources/views/hub/reports/
├── index.blade.php                 # Übersichtsseite
├── rescheduled-cancelled.blade.php # Stornierte/Gelöschte
├── past-consultations.blade.php    # Vergangene Beratungen
├── upcoming-consultations.blade.php # Zukünftige Beratungen
└── partials/
    ├── consultation-all-stats.blade.php       # Kalenderübersicht
    ├── cancelled-appointments-by-state.blade.php
    ├── cancelled-appointments-monthly.blade.php
    └── cancelled-appointments-modal.blade.php
```

### Komponenten

```
resources/views/components/
└── kpi-dashboard.blade.php         # Wiederverwendbare KPI-Cards
```

---

## 📈 Datenquellen

| Report | Tabelle | API |
|--------|---------|-----|
| Zukünftige Beratungen | - | Phorest API |
| Vergangene Beratungen | `stats_historic_appointments` | - |
| Storniert/Gelöscht | `stats_historic_appointments` | - |
| Auslastung | `stats_historic_appointments` | Phorest API |

---

## 🔐 Berechtigungen

Alle Reports sind für angemeldete Benutzer zugänglich. Die Branch-Filterung erfolgt über das Header-Dropdown und wird im `localStorage` gespeichert.

---

## 📱 Mobile Unterstützung

- Responsive Tabellen mit horizontalem Scroll
- Charts passen sich der Bildschirmgröße an
- KPI-Cards stapeln sich auf kleinen Bildschirmen
- **Kalenderübersicht**: 4 CSS-Breakpoints (1350px, 768px, 640px, 480px) mit progressiver Vereinfachung
- **Auto-Switch**: Pro-Standort-Ansicht wird ab ≤768px automatisch auf Auslastung umgeschaltet (auch bei Browser-Resize)

---

## 🌓 Dark Mode

Alle Reports unterstützen den systemweiten Dark Mode mit angepassten Farbschemata für Heatmaps und Charts.

---

## Changelog

### v1.9.0 (Februar 2026) - Kalenderübersicht & KW-Zusammenfassung
- ⭐ **Kalenderübersicht**: Interaktiver Monatskalender für Zukünftige Beratungsgespräche
- ⭐ **Zwei Ansichtsmodi**: Auslastungs-Ansicht (Termine/Slots/%) und pro-Standort-Ansicht (farbige Balken)
- ⭐ **KW-Zusammenfassung**: Wochensumme mit Aufschlüsselung pro Standort (Desktop >1350px)
- ⭐ **Standort-Farben**: Konfigurierbare Farben pro Standort im Kalender und allen Legenden
- 📱 **Responsive Design**: 4 Breakpoints (1350px, 768px, 640px, 480px)
- 📱 **Auto-Switch**: Automatischer Wechsel auf Auslastung bei Resize ≤768px
- 🔧 Pro-Standort-Ansicht nur ab Tablet (≥768px) sichtbar

### v1.8.0 (Februar 2026) - Top Services Modul
- ⭐ **Top Services pro Monat**: Neue Analyse-Karte in Terminstatistik
- ⭐ **3 neue KPIs**: Top Service (aktueller Monat), Flex-Termine, Top 3 Services (12 Monate)
- ⭐ **Ausklappbares Filter-Panel**: Typ, Top N, Mind. Termine, Textsuche
- ⭐ **Service-Typ-Filter**: Beratungen/Behandlungen einzeln ein-/ausschaltbar
- ⭐ **Desinfektion-Ausschluss**: Services mit "Desinfektion" werden automatisch ausgeschlossen
- ⭐ **Same Point in Time Trends**: Vergleiche zum gleichen Zeitpunkt im Vormonat/Vorjahr
- 🔧 Performance: KPI-Array wird in einer Operation gesetzt (kein Flackern)
- 🔧 Debounced Suche (300ms) für bessere Performance
- 📝 Filter-Badge zeigt Anzahl aktiver Filter

### v1.7.0 (Februar 2026) - Terminstatistik Relaunch
- ⭐ **Terminstatistik komplett überarbeitet** (vorher "Termine und Körperzonen")
- ⭐ **Nur stattgefundene Termine** werden in allen KPIs gezählt
- ⭐ **4 neue KPIs** auf Übersichtsseite: Behandlungen, Termindauer, Ø/Tag, Ø Dauer
- ⭐ **stats-card-glattt Styling** für einheitliches Design
- ⭐ **Trend-Badges** mit Same Point in Time Vergleichen
- 🔧 KPI-Dashboard wartet auf alle Daten bevor Anzeige
- 🔧 Drag & Drop nur im Edit-Mode
- 📝 Disclaimer "Alle Kennzahlen beziehen sich auf stattgefundene Termine..."

### v1.6.0 (Februar 2026) - Lazy Loading & Performance
- ⚡ **Lazy Loading** für alle Report-Tabellen
- ⚡ **Paralleles Laden** - Komponenten erscheinen unabhängig
- ⚡ **Optimierte KPI-Endpoints** - schnellere Übersichtsseite
- ✅ "Heute" KPI-Karte für Zukünftige Beratungen
- ✅ Standort-Tabelle mit Heute-Spalte
- 📚 [LAZY-LOADING-PERFORMANCE.md](LAZY-LOADING-PERFORMANCE.md) Dokumentation

### v1.5.0 (Februar 2026)
- ✅ KPI-Dashboard für stornierte/gelöschte Termine
- ✅ Standortvergleich (höchste Stornoquote)
- ✅ Prognose für Monatsende
- ✅ Prozentpunkte (PP) für Raten-Vergleiche
- ✅ Reports-Übersichtsseite mit Live-KPIs
- ✅ Fallback auf Vormonat wenn keine aktuellen Daten

### v1.4.0 (Januar 2026)
- ✅ Stornierte und gelöschte Termine Analyse
- ✅ Heatmap-Visualisierung
- ✅ Wochen-Expansion
- ✅ Detail-Modal mit Notizen

### v1.3.0 (Dezember 2025)
- ✅ Buchungsvorlauf-Analyse
- ✅ Wochentag & Uhrzeit Analyse

### v1.2.0 (November 2025)
- ✅ Vergangene Beratungsgespräche
- ✅ No-Show Tracking

### v1.1.0 (Oktober 2025)
- ✅ Zukünftige Beratungsgespräche
- ✅ Auslastung

### v1.0.0 (September 2025)
- ✅ Basis Reports-Struktur
