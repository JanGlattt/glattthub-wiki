# 📅 Terminübersicht (Appointments Overview)

Die Terminübersicht unter `/hub/appointments` zeigt alle Termine eines Tages in einer übersichtlichen Karten-Ansicht. Sie ist die zentrale Anlaufstelle für die tägliche Terminplanung.

---

## 📋 Überblick

### Funktionen

| Feature | Beschreibung |
|---------|--------------|
| **KPI-Karten** | Drei Kennzahlen-Karten zu den Beratungen des gewählten Tages (Anzahl mit Aufschlüsselung, verkaufte Körperzonen, No-Shows mit Quote) |
| **Datum-Navigation** | Flatpickr-Kalender mit Tag/Woche vor/zurück Buttons |
| **"Heute"-Button** | Schneller Rücksprung zum heutigen Tag (nur sichtbar, wenn ein anderer Tag gewählt ist) |
| **Filialfilter** | Termine nach Filiale filtern (Sidebar) — gilt auch für die KPI-Karten |
| **Beratungs-Filter** | Button um nur Beratungsgespräche anzuzeigen |
| **Ansichts-Wechsel** | Toggle zwischen Listen- und Kalenderansicht |
| **Tageskalender** | Spalten pro Mitarbeiter mit Zeitachse (bei ausgewählter Filiale) |
| **Status-Indikator** | Farbcodierte linke Kante zeigt Terminstatus |
| **No-Show-Erkennung** | Erweiterte Logik inkl. überfälliger Termine und "Absage"-Pseudo-Mitarbeitern |
| **Beratungs-Badge** | Goldenes Badge kennzeichnet Beratungsgespräche; bei Abschluss inkl. Anzahl der verkauften Körperzonen (z.B. "Beratung · 4 Zonen") |
| **"Jetzt"-Linie** | Rote Linie zeigt aktuelle Uhrzeit im Kalender |
| **Kontaktdaten** | E-Mail und Telefon direkt in Karten-Header |
| **Ausklappbare Services** | Behandlungsliste bei Bedarf einblenden |
| **Responsive Layout** | Terminkarten und Header brechen auf schmalen Bildschirmen kontrolliert um |

### URL

```
/hub/appointments
```

---

## 📊 KPI-Karten (Beratungen des Tages)

Über der Terminliste zeigen drei Karten die wichtigsten Beratungs-Kennzahlen des **ausgewählten Tages** (Standard: heute). Sie reagieren auf den Filialfilter der Sidebar und aktualisieren sich bei jedem Tages- oder Filialwechsel.

| Karte | Wert | Unterzeile |
|-------|------|------------|
| **Beratungen** | Anzahl aller Beratungsgespräche des Tages | Aufschlüsselung: **X** stattgefunden · **X** im Gange · **X** geplant |
| **Verkaufte Körperzonen** | Summe der in Beratungen verkauften Körperzonen | aus **X** Abschlüssen |
| **No-Shows** | Anzahl nicht erschienener Beratungskunden | Quote: **X %** (No-Shows ÷ alle Beratungen des Tages) |

### Definitionen

| Begriff | Bedeutung |
|---------|-----------|
| **Beratung** | Termin mit mindestens einem Service aus `consultation_services` (`is_consultation = true`); stornierte Termine zählen nicht |
| **stattgefunden** | Status `COMPLETED` oder `PAID` (entspricht dem "Erledigt"-Badge) |
| **im Gange** | Status `CHECKED_IN` |
| **geplant** | `BOOKED`/`CONFIRMED`, sofern nicht als No-Show umklassifiziert |
| **No-Show** | Siehe Abschnitt **No-Show-Logik** weiter unten |
| **Verkaufte Körperzonen** | Summe `body_zone_count` aus der `contracts`-Tabelle: Verträge mit `signed_at` am Stichtag, Status `active`/`completed`, nicht gelöscht — gleiche Zähllogik wie der Staff-Performance-Report. (Die Beratungsprotokolle wären die naheliegende Quelle, werden in der Praxis aber nicht gepflegt — Abschlüsse landen direkt als Vertrag.) |

Die drei Werte der Aufschlüsselung plus die No-Shows ergeben zusammen immer die Gesamtzahl. An vergangenen Tagen stehen "im Gange" und "geplant" auf 0.

### Ladeverhalten (Skeleton)

- Beim Laden (initial, Tages- oder Filialwechsel) zeigen die Karten Shimmer-Platzhalter (`skeleton-glattt`) für Wert und Unterzeile; Label und Icon bleiben stehen.
- Das Blade-Template rendert dieselben Skeleton-Karten statisch, damit vor dem ersten JS-Lauf nichts springt.
- Die Werte erscheinen erst, wenn **auch die Mitarbeiterdaten** (`staffDataLoaded`, für die "Absage"-No-Show-Regel) **und die Vertragsdaten** (`contractStats`, für die Körperzonen-Karte) geladen sind — sonst würden die Zahlen nachträglich aufspringen.

### Technik

- Beratungs-/No-Show-Zahlen client-seitig in `getConsultationKpis()` (`public/js/appointments.js`) aus den bereits geladenen Termindaten; die Körperzonen-Karte lädt parallel `GET /phorest/daily-contract-stats?date=…&branch_id=…` (`PhorestController::dailyContractStats`, aggregiert aus `contracts`).
- Die Termin-Endpoints reichern jeden Termin zusätzlich server-seitig mit den Beratungsprotokoll-Feldern an (`hasConsultationRecord`, `consultationOutcome`, `consultationBodyZonesCount`) — diese werden aktuell nur an anderen Stellen genutzt, nicht für die KPI-Karten.
- Rendering über `renderKpis()` / `renderKpiCard()` mit den bestehenden `.kpi-card`-Klassen aus `theme_glattt.css`; die Unterzeile nutzt die neue, wiederverwendbare Klasse `.kpi-card-breakdown` (größere Schrift, Zahlen fett in Primärtextfarbe via `<b>`).
- Kartendefinitionen (Label, Icon, Farbe) zentral in `kpiCardDefs()`, damit Skeleton- und Normalzustand aus derselben Quelle rendern.
- Grid: `#appointments-kpis`, 3-spaltig, unter 900px einspaltig.

---

## 🚫 No-Show-Logik

Der effektive Terminstatus wird zentral in `getState(apt)` (`appointments.js`) bestimmt und gilt **überall auf dieser Seite**: Badge, farbige Statuslinie links an der Karte, Kalenderansicht und KPI-Karten. Ein Termin gilt als **No-Show**, wenn eine der Regeln zutrifft:

1. **Expliziter Status** `NO_SHOW` aus Phorest.
2. **Überfällig:** Status `BOOKED`/`CONFIRMED`, aber die Endzeit liegt in der Vergangenheit (vergangener Tag, oder heute mehr als 30 Minuten vorbei).
3. **"Absage"-Pseudo-Mitarbeiter:** Der zugeordnete Mitarbeitername enthält "Absage" (Groß-/Kleinschreibung egal), z.B. `BS. Absage weniger als 24 st/ Nicht gekommen`. Diese Regel überschreibt auch `COMPLETED`/`PAID` — solche Termine zählen also **nicht** als stattgefunden.

**Ausnahme:** Stornierte Termine (`CANCELLED`) bleiben storniert und werden nicht umklassifiziert.

> **Hinweis:** Die Mitarbeiternamen kommen per Batch-API nach dem ersten Rendern der Liste. Ein Absage-Termin kann daher kurz sein ursprüngliches Badge zeigen und springt dann auf "No Show" um (gleiche Progressive-Loading-Mechanik wie bei den Kundennamen).

---

## 🔄 Ansichten

### Listenansicht (Standard)

Die Standard-Ansicht zeigt Termine als Karten untereinander. Verfügbar bei allen Filialen oder "Alle Filialen".

### Kalenderansicht (Tageskalender)

Bei Auswahl einer **einzelnen Filiale** erscheint ein View-Toggle. Der Kalender zeigt:

- **Eine Spalte pro Mitarbeiter** mit Avatar und Name
- **Zeitachse links** (volle und halbe Stunden)
- **Termine als Blöcke** positioniert nach Uhrzeit
- **Höhe = Dauer** des Termins (1 Stunde = 60px)
- **Rote "Jetzt"-Linie** bei heutigem Datum
- **Klick auf Termin** → öffnet Fullscreen-Ansicht

```
┌─────────────────────────────────────────────────────────────┐
│ Zeit  │  👤 Anna Meyer   │  👤 Max Schmidt  │  👤 Lisa Krug │
├───────┼──────────────────┼──────────────────┼───────────────┤
│ 09:00 │ ████████████████ │                  │               │
│ 09:30 │ ████████████████ │ ███████████████  │               │
│ 10:00 │                  │ ███████████████  │ ████████████  │
│ 10:30 │ ████████████████ │                  │ ████████████  │
│─────────── JETZT ─────────────────────────────────────────  │
│ 11:00 │ ████████████████ │ ███████████████★ │               │
│ 11:30 │                  │                  │               │
└─────────────────────────────────────────────────────────────┘
  ★ = Beratungsgespräch (gold)
```

---

## 🔍 Filter

### Beratungs-Filter

Der goldene "Beratung"-Button links von der Datumsauswahl filtert auf Beratungsgespräche:

- **Inaktiv:** Alle Termine werden angezeigt
- **Aktiv (gold):** Nur Termine mit Beratungs-Services
- Funktioniert in beiden Ansichten (Liste und Kalender)

---

## 🗓️ Datum-Navigation

Die Datumsauswahl verwendet **Flatpickr** mit deutscher Lokalisierung und bietet schnelle Navigation:

```
┌────────────────────────────────────────────────────────────┐
│  [««]  [‹]  │  Mo, 23. Feb 2026  │  [›]  [»»]              │
│   -7    -1          Datum           +1    +7               │
└────────────────────────────────────────────────────────────┘
```

### Navigation-Buttons

| Button | Aktion | Tastenkürzel |
|--------|--------|-------------|
| `««` | 1 Woche zurück | - |
| `‹` | 1 Tag zurück | - |
| `›` | 1 Tag vor | - |
| `»»` | 1 Woche vor | - |
| `Heute` | Zurück zum heutigen Tag | - |

### "Heute"-Button

Rechts neben den Pfeilen erscheint ein **"Heute"**-Button (`#date-today`, Klasse `.date-nav__today`) — aber nur, wenn ein anderer Tag als heute ausgewählt ist. Ein Klick springt zurück zu heute (`goToToday()`), aktualisiert den Datepicker und lädt Termine + KPIs neu. Die Sichtbarkeit steuert `updateTodayButton()`, zentral aufgerufen in `loadAppointments()`, sodass jeder Navigationsweg (Pfeile, Wochensprung, Datepicker) abgedeckt ist.

### Flatpickr Konfiguration

```javascript
flatpickr(dateInput, {
    dateFormat: 'Y-m-d',           // Internes Format
    altInput: true,
    altFormat: 'D, d. M Y',        // Anzeige: "Mo, 23. Feb 2026"
    defaultDate: this.selectedDate,
    disableMobile: true,            // Native Picker deaktiviert
    locale: 'de'                    // Deutsche Lokalisierung
});
```

### Styling

Der Kalender-Popup wird mit glattt-Theme-Variablen gestylt:
- Hintergrund: `--card-bg-glattt`
- Ausgewähltes Datum: `--glattt-gold`
- Heute: Gold-Umrandung
- Dark Mode kompatibel

---

## 🎨 Design-System: apt-card

Die Terminkarten verwenden das neue **apt-card** Design-System mit CSS-Variablen aus `theme_glattt.css`.

### Aufbau einer Karte

```
┌──────────────────────────────────────────────────────────┐
│▌ 14:30 · Max Mustermann                    📧 📞  ⓘ    │ ← Header mit Status-Rand
│▌ Filiale XY · Mitarbeiter Name          [Beratung ★]    │ ← Meta-Info + Badge
├──────────────────────────────────────────────────────────┤
│▌ ▼ 3 Behandlungen anzeigen                              │ ← Details Toggle
│▌   • Laserhaarentfernung Oberlippe                      │
│▌   • Laserhaarentfernung Kinn                           │
│▌   • Laserhaarentfernung Wangen                         │
└──────────────────────────────────────────────────────────┘
```

### Status-Farben

Die linke Kante der Karte zeigt den Terminstatus:

| Status | Farbe | CSS-Klasse | Bedeutung |
|--------|-------|------------|-----------|
| **Confirmed** | 🟢 Grün | `--color-success` | Bestätigter Termin |
| **Pending** | 🟡 Gelb | `--color-warning` | Ausstehend |
| **Checked-in** | 🔵 Blau | `--color-primary` | Eingecheckt |
| **Completed** | ⚫ Grau | `--color-muted` | Abgeschlossen |
| **Cancelled** | 🔴 Rot | `--color-danger` | Storniert |
| **No Show** | 🔴 Rot | `--color-danger` | Nicht erschienen |

### Beratungs-Badge

Termine mit **Beratungsgesprächen** werden mit einem goldenen Badge hervorgehoben:

```css
.apt-card__consultation-badge {
    background: linear-gradient(135deg, var(--glattt-gold), #d4a853);
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
}
```

**Aktivierung:** Wenn eine der gebuchten Leistungen in der `consultation_services`-Tabelle als Beratungsleistung markiert ist (`is_consultation = true`).

**Zonen-Angabe:** Hat der Kunde am selben Tag in derselben Filiale einen Vertrag abgeschlossen (`contracts`, Status `active`/`completed`), zeigt das Badge zusätzlich die verkauften Körperzonen, z.B. "Beratung · 4 Zonen". Zuordnung über die `byClient`-Daten des `daily-contract-stats`-Endpoints (`getContractZones()` in `appointments.js`).

**Varianten (Abschluss gewinnt immer, sonst effektiver Status):**

| Variante | Zustand | Optik |
|----------|---------|-------|
| Standard | **Abschluss** (verkaufte Zonen, egal welcher Status) sowie Im Gange und Storniert | Gold gefüllt, weiße Schrift |
| `--completed` | Stattgefunden (`COMPLETED`/`PAID`) ohne Abschluss | Ausgegraut (wie das "Erledigt"-Pill) |
| `--upcoming` | Steht noch aus (`BOOKED`/`CONFIRMED`) | Invertiert: heller Hintergrund, goldene Schrift, goldener Rahmen |
| `--noshow` | No-Show (inkl. Überfällig- und Absage-Regel) | Rot (wie das "No Show"-Pill) |

---

## 📱 Responsive Verhalten

### Terminkarten (apt-card)

Die Terminkarten haben vier Layout-Stufen (Breakpoints in `theme_glattt.css`):

| Breite | Layout |
|--------|--------|
| **> 1440px** | Einzeilig: Zeit · Kunde · Mitarbeiter/Filiale nebeneinander · Badge · Aktionen |
| **1141–1440px** | Mitarbeiter und Filiale **gestapelt** (Spalte, max. 13rem, lange Namen brechen um), damit der Kundenname nicht abgeschnitten wird |
| **641–1140px** | Zweizeilig: Mitarbeiter/Filiale in eigener Zeile **linksbündig unter dem Kundennamen**; Zeit-Pille, Status-Badge und Aktionen **vertikal zentriert** über die volle Kartenhöhe |
| **≤ 640px** | Mobile: alles gestapelt, Button volle Breite |

Zusätzlich darf die **Kundenzeile umbrechen** (`flex-wrap` auf `.apt-card__client-row`): Bei Platzmangel rutschen ID-Chip und Beratungs-Badge unter den Namen, statt ihn auf wenige Zeichen zusammenzudrücken.

### Seiten-Header

Der Header (Titel + Beratung-Button + Datumsauswahl) nutzt die Wrapper-Klasse `.appointments-page` als **CSS-Container** (`container-type: inline-size`), gescoped in `theme_glattt.css`:

- **Breit:** Alles in einer Zeile rechts vom Titel.
- **Zu schmal für eine Zeile:** Die Actions bleiben rechts neben dem Titel und brechen **intern** um — Beratung-Button oben, Datumsauswahl geschlossen darunter (der äußere Umbruch ist per `flex-wrap: nowrap` unterbunden).
- **Sehr schmal (< 660px Inhaltsbreite, Container-Query):** Titel oben, darunter linksbündig gestapelt Button / Datumsauswahl / View-Toggle.

Die Container-Query reagiert auf die tatsächliche Inhaltsbreite neben der Sidebar — Media-Queries können den Sidebar-Zustand (ausgeklappt/eingeklappt/Overlay) nicht kennen. Browser-Support: Chrome 105+, Safari 16+, Firefox 110+; ältere Browser verlieren nur den Mobile-Sonderfall.

Global wurde `.page-header-glattt-actions` (alle Hub-Seiten) auf `flex-wrap: wrap` umgestellt und `flex-shrink: 0` entfernt: Bei Platzmangel brechen die Actions als ganze Blöcke um, statt rechts abgeschnitten zu werden.

---

## 📁 Dateistruktur

```
public/
├── css/
│   └── theme_glattt.css       # apt-card Styles, KPI-Karten, Header-/Responsive-Regeln
└── js/
    └── appointments.js         # Vanilla-JS-Klasse AppointmentsPage (window.aptPage)

resources/views/hub/
└── appointments.blade.php     # Blade-Template (Header, KPI-Skeletons, Container)

app/Http/Controllers/
└── PhorestController.php      # API-Endpoints für Termine (inkl. Beratungsprotokoll-Anreicherung)
```

---

## 🔧 Technische Details

### API-Endpoints

| Endpoint | Beschreibung |
|----------|--------------|
| `GET /phorest/branch/{branchId}/appointment` | Termine für Datum + Filiale |
| `GET /phorest/appointment/all` | Termine für Datum über alle Filialen |
| `POST /phorest/clients/batch` | Kundendaten (50er-Batches, parallel) |
| `POST /phorest/staff/batch` | Mitarbeiterdaten (50er-Batches, parallel) |
| `GET /phorest/consultation-services` | Liste der Beratungs-Service-IDs |
| `GET /phorest/daily-contract-stats` | Abschlüsse + verkaufte Körperzonen eines Tages aus `contracts` (Parameter: `date`, optional `branch_id`); zusätzlich `byClient`-Liste pro Kunde/Filiale für die Zonen-Angabe im Beratungs-Badge |

Beide Termin-Endpoints reichern die Antwort server-seitig mit Beratungsprotokoll-Daten an (`ConsultationRecord`, nur `is_completed = true`): `hasConsultationRecord`, `consultationOutcome`, `consultationOutcomeLabel`, `consultationBodyZonesCount` sowie Follow-Up-Termindaten. Die KPI-Karten konsumieren diese Felder direkt.

### Batch-Fetching (Performance-Optimierung)

Da Phorest limitiert, werden Kunden und Mitarbeiter in **50er-Batches parallel** geladen:

```javascript
// appointments.js
async loadClientsBatch(clientIds) {
    const BATCH_SIZE = 50;
    const batches = [];
    
    for (let i = 0; i < clientIds.length; i += BATCH_SIZE) {
        batches.push(clientIds.slice(i, i + BATCH_SIZE));
    }
    
    // Parallel ausführen
    const results = await Promise.all(
        batches.map(batch => 
            fetch(`/phorest/clients/batch?clientIds=${batch.join(',')}`)
        )
    );
    
    // Ergebnisse zusammenführen
    // ...
}
```

### Beratungs-Service Erkennung

Beim Laden der Seite werden alle Beratungs-Service-IDs aus der DB geladen:

```javascript
async loadConsultationServices() {
    const response = await fetch('/phorest/consultation-services');
    const data = await response.json();
    this.consultationServiceIds = data;
}
```

In `renderCard()` wird geprüft, ob einer der gebuchten Services eine Beratung ist:

```javascript
const isConsultation = appointment.services?.some(
    service => this.consultationServiceIds.includes(service.serviceId)
);
```

---

## 👩‍💻 Entwickler-Guide

### Neue Status-Farbe hinzufügen

1. **CSS-Variable definieren** (falls nicht vorhanden) in `theme_glattt.css`:
   ```css
   :root {
       --color-new-status: #abc123;
   }
   ```

2. **apt-card Variante erstellen**:
   ```css
   .apt-card--new-status {
       --apt-status-color: var(--color-new-status);
   }
   ```

3. **JavaScript-Mapping erweitern** in `appointments.js`:
   ```javascript
   const statusClasses = {
       // ...
       'new_status': 'apt-card--new-status',
   };
   ```

### Beratungs-Services verwalten

Beratungs-Services werden in der Datenbank (`consultation_services`) verwaltet:

```sql
SELECT * FROM consultation_services WHERE is_consultation = 1 AND is_active = 1;
```

**Neuen Beratungs-Service hinzufügen:**
1. Service-ID aus Phorest ermitteln
2. In der DB eintragen (Filament Admin oder direkt SQL)

### CSS-Klassen Übersicht

| Klasse | Beschreibung |
|--------|--------------|
| `.apt-card` | Basis-Karte |
| `.apt-card--{status}` | Status-Variante (confirmed, cancelled, etc.) |
| `.apt-card__header` | Kartenheader mit Uhrzeit, Name, Icons |
| `.apt-card__meta` | Filiale, Mitarbeiter |
| `.apt-card__contact-icon` | E-Mail/Telefon Icons |
| `.apt-card__consultation-badge` | Goldenes Beratungs-Badge |
| `.apt-card__details` | Ausklappbarer Bereich |
| `.apt-card__toggle` | Details ein-/ausklappen |
| `.apt-card__services` | Behandlungsliste |

**View-Toggle & Filter:**

| Klasse | Beschreibung |
|--------|--------------|
| `.view-toggle` | Container für Ansicht-Wechsel |
| `.view-toggle__btn` | Einzelner Toggle-Button |
| `.view-toggle__btn--active` | Aktiver Toggle-Button |
| `.filter-toggle` | Beratungs-Filter Button |
| `.filter-toggle--active` | Aktiver Filter-Zustand |

**KPI-Karten & Header:**

| Klasse / ID | Beschreibung |
|--------|--------------|
| `#appointments-kpis` | Grid-Container der drei KPI-Karten (3-spaltig, < 900px einspaltig) |
| `.kpi-card` | KPI-Karte (geteiltes Karten-Design aus `theme_glattt.css`, auch von den Report-Seiten genutzt) |
| `.kpi-card-breakdown` | Auffälligere Unterzeile mit hervorgehobenen Zahlen (`<b>`) |
| `.skeleton-glattt` | Shimmer-Platzhalter beim Laden |
| `.appointments-page` | Seiten-Wrapper, CSS-Container für Header-Container-Query |
| `.date-nav__today` | "Heute"-Button in der Datums-Navigation |

**Kalender-Ansicht (Day Schedule):**

| Klasse | Beschreibung |
|--------|--------------|
| `.day-schedule` | Hauptcontainer für Tageskalender |
| `.day-schedule__header` | Kopfzeile mit Mitarbeiter-Namen |
| `.day-schedule__staff-header` | Einzelne Mitarbeiter-Spalte im Header |
| `.day-schedule__staff-header--highlight` | Hervorgehobene Spalte |
| `.day-schedule__body` | Scrollbarer Körper mit Zeitachse |
| `.day-schedule__time-gutter` | Zeitachse links (08:00 - 20:00) |
| `.day-schedule__time-slot` | Einzelne Zeitmarkierung |
| `.day-schedule__staff-column` | Spalte für Termin-Events |
| `.day-schedule__event` | Einzelner Termin-Block |
| `.day-schedule__event--{status}` | Status-Variante (confirmed, cancelled, etc.) |
| `.day-schedule__event--consultation` | Beratungstermin (Gold) |
| `.day-schedule__now-line` | Rote "Jetzt"-Linie für aktuellen Zeitpunkt |
| `.day-schedule__empty` | Platzhalter wenn keine Termine |

---

## 👤 Benutzer-Guide

### Terminübersicht aufrufen

1. **Navigation:** Klicke auf "Termine" im Hauptmenü oder gehe zu `/hub/appointments`
2. **Filiale wählen:** Dropdown für Filiale nutzen (falls mehrere)

### KPI-Karten lesen

Oben auf der Seite zeigen drei Karten die Beratungs-Kennzahlen des angezeigten Tages:

1. **Beratungen** — Wie viele Beratungsgespräche heute anstehen, darunter wie viele schon stattgefunden haben, gerade laufen und noch geplant sind.
2. **Verkaufte Körperzonen** — Wie viele Körperzonen heute in Beratungen verkauft wurden und aus wie vielen Vertragsabschlüssen.
3. **No-Shows** — Wie viele Beratungskunden nicht erschienen sind, mit Quote.

Die Karten folgen dem gewählten Tag (blätterst du auf ein anderes Datum, zeigen sie dessen Zahlen) und dem Filialfilter der Sidebar. Während des Ladens erscheinen animierte Platzhalter.

### Datum navigieren

Die Datums-Auswahl befindet sich oben rechts mit praktischen Schnell-Buttons:

| Button | Aktion |
|--------|--------|
| `««` (Doppelpfeil links) | Eine Woche zurück |
| `‹` (Pfeil links) | Einen Tag zurück |
| **Datumsfeld** | Klick öffnet Kalender-Popup |
| `›` (Pfeil rechts) | Einen Tag vor |
| `»»` (Doppelpfeil rechts) | Eine Woche vor |
| **Heute** | Zurück zum heutigen Tag (erscheint nur, wenn ein anderer Tag gewählt ist) |

**Tipps:**
- Das Datum wird im Format "Mo, 23. Feb 2026" angezeigt
- Bei Klick auf das Datumsfeld öffnet sich ein Kalender
- Im Kalender: Heute ist gold umrandet, ausgewählter Tag gold ausgefüllt

### Terminkarten verstehen

**Farben der linken Kante:**
- 🟢 **Grün** = Bestätigt
- 🔵 **Blau** = Eingecheckt  
- 🟡 **Gelb** = Ausstehend
- 🔴 **Rot** = Storniert oder nicht erschienen
- ⚫ **Grau** = Abgeschlossen

**Goldenes "Beratung"-Badge:**
- Zeigt an, dass es sich um ein Beratungsgespräch handelt
- Diese Termine sind besonders wichtig für Neukundenakquise

### Kontaktdaten nutzen

- 📧 **E-Mail-Icon:** Klicken öffnet E-Mail-Programm
- 📞 **Telefon-Icon:** Klicken startet Anruf (auf Mobilgeräten)

### Behandlungen anzeigen

1. Klicke auf "X Behandlungen anzeigen" 
2. Die Liste klappt auf und zeigt alle gebuchten Services
3. Erneutes Klicken klappt die Liste wieder ein

### Beratungen filtern

Der **"Beratung"**-Button oben links filtert die Ansicht:

1. **Button anklicken** → Nur Beratungsgespräche werden angezeigt
2. **Erneut klicken** → Filter wird aufgehoben, alle Termine sind sichtbar

Der Button ist **gold** wenn aktiv.

### Zwischen Ansichten wechseln

Bei Auswahl einer **einzelnen Filiale** erscheint ein Ansicht-Wechsler:

| Button | Ansicht |
|--------|---------|
| **Liste** | Standard-Kartenansicht (vertikal scrollbar) |
| **Kalender** | Tagesplan mit Mitarbeiter-Spalten |

**Hinweis:** Der Ansicht-Wechsler ist nur sichtbar, wenn eine Filiale ausgewählt ist (nicht bei "Alle Filialen").

### Kalender-Ansicht nutzen

Die Kalender-Ansicht zeigt einen **Tagesplan** mit:

- **Linke Spalte:** Zeitachse von 08:00 - 20:00 Uhr
- **Spalten pro Mitarbeiter:** Jeder Mitarbeiter mit Terminen hat eine Spalte
- **Termin-Blöcke:** Positioniert nach Startzeit, Höhe entspricht Dauer
- **Rote "Jetzt"-Linie:** Zeigt die aktuelle Uhrzeit (nur für heute)

**Farben der Termin-Blöcke:**
- 🟢 **Grün** = Bestätigt
- 🔵 **Blau** = Eingecheckt  
- 🟡 **Gelb** = Ausstehend
- 🔴 **Rot** = Storniert oder nicht erschienen
- ⚫ **Grau** = Abgeschlossen
- 🟡 **Gold mit Rahmen** = Beratungstermin

**Interaktion:**
- Bei Klick auf einen Termin-Block öffnet sich die Detail-Ansicht

### Termin-Details öffnen

- Klicke auf **„Termin öffnen"** rechts in der Karte (oder auf einen Termin-Block im Kalender)
- Beide navigieren einheitlich auf die eigenständige **Split-View-Terminansicht** (`/hub/appointment/{branchId}/{appointmentId}`) — kein Overlay/iframe-Modal mehr; der Zurück-Button der Detailseite führt zur Terminübersicht zurück (Details: [APPOINTMENT-VIEW.md](APPOINTMENT-VIEW.md))

---

## 🐛 Troubleshooting

### Kunden/Mitarbeiter werden nicht angezeigt

**Mögliche Ursachen:**
- API-Rate-Limit erreicht
- Ungültige IDs in der Antwort

**Lösung:** 
- Seite neu laden
- Browser-Konsole auf Fehler prüfen

### Beratungs-Badge erscheint nicht

**Mögliche Ursachen:**
- Service ist nicht als Beratung markiert in DB
- Service-ID stimmt nicht mit Phorest überein

**Lösung:**
```sql
-- Prüfen ob Service existiert
SELECT * FROM consultation_services 
WHERE phorest_service_id = 'xyz'
AND is_consultation = 1
AND is_active = 1;
```

### Termine laden langsam

**Mögliche Ursachen:**
- Viele Termine mit vielen verschiedenen Kunden
- Phorest API langsam

**Hinweis:** Das Batch-Fetching optimiert bereits die Ladezeit. Bei sehr vielen Terminen (>100) kann es einige Sekunden dauern.

### Kalender-Ansicht zeigt keine Spalten

**Mögliche Ursachen:**
- Keine Filiale ausgewählt (View-Toggle nicht sichtbar)
- Keine Termine für das gewählte Datum
- Mitarbeiter-Daten fehlen in der API-Antwort

**Lösung:**
- Wähle eine spezifische Filiale (nicht "Alle Filialen")
- Prüfe ob Termine für den Tag existieren
- Browser-Konsole auf `staffMap` prüfen

### "Jetzt"-Linie nicht sichtbar

**Ursache:** Die rote Linie erscheint nur, wenn:
- Das ausgewählte Datum **heute** ist
- Die aktuelle Uhrzeit zwischen 08:00 und 20:00 liegt

---

## 📝 Changelog

### Juli 2026

- ✨ **Neu:** Beratungs-Badge zeigt bei Abschluss die Anzahl der verkauften Körperzonen ("Beratung · 4 Zonen"), zugeordnet über Kunde + Filiale + Tag
- ✨ **Neu:** Beratungs-Badge-Varianten: Abschluss immer gold, stattgefunden ohne Abschluss ausgegraut, noch ausstehend invertiert (goldene Schrift + Rahmen), No-Show rot
- 🐛 **Fix:** "Verkaufte Körperzonen" zählt jetzt aus der `contracts`-Tabelle (neuer Endpoint `daily-contract-stats`) statt aus den Beratungsprotokollen — die werden in der Praxis nicht gepflegt, wodurch die Karte immer 0 zeigte
- ✨ **Neu:** Drei KPI-Karten über der Terminliste (Beratungen mit Aufschlüsselung stattgefunden/im Gange/geplant, verkaufte Körperzonen, No-Shows mit Quote) — folgen Tag und Filialfilter, ohne zusätzliche API-Aufrufe
- ✨ **Neu:** Skeleton-Loading für die KPI-Karten (wartet auf Mitarbeiterdaten, um Wertesprünge zu vermeiden)
- ✨ **Neu:** "Heute"-Button in der Datums-Navigation (nur sichtbar bei anderem Tag)
- ✨ **Neu:** No-Show-Regel für "Absage"-Pseudo-Mitarbeiter — seitenweit (Badges, Statuslinien, Kalender, KPIs); storniert bleibt storniert
- ✨ **Neu:** CSS-Klasse `.kpi-card-breakdown` für auffälligere KPI-Unterzeilen mit hervorgehobenen Zahlen
- 🎨 **Responsive:** Terminkarten mit neuer Zwischenstufe (1141–1440px: Mitarbeiter/Filiale gestapelt); zweizeiliges Layout ab 1140px mit Meta linksbündig unter dem Namen und vertikal zentrierten Badges/Buttons; Kundenzeile bricht um statt Namen abzuschneiden
- 🎨 **Responsive:** Header-Actions brechen blockweise um (Beratung-Button | Datumsauswahl), Container-Query für schmale Inhaltsbreiten (`.appointments-page`)
- 🐛 **Fix:** `getState()` nimmt jetzt das ganze Termin-Objekt (Signaturänderung für die Absage-Regel)

### Februar 2026

- ✨ **Neu:** Tageskalender-Ansicht mit Mitarbeiter-Spalten
- ✨ **Neu:** View-Toggle (Liste/Kalender) bei ausgewählter Filiale
- ✨ **Neu:** Beratungs-Filter Button zum Filtern auf Beratungsgespräche
- ✨ **Neu:** "Jetzt"-Linie im Kalender bei heutigem Datum
- ✨ **Neu:** Flatpickr Datum-Navigation mit Tag/Woche vor/zurück Buttons
- ✨ **Neu:** Beratungs-Badge für Consultation Services
- ✨ **Neu:** apt-card Design-System mit Status-Farben
- ✨ **Neu:** Kontaktdaten (E-Mail, Telefon) im Header
- ✨ **Neu:** Ausklappbare Behandlungsliste
- 🗑️ **Entfernt:** "Aktualisieren"-Button (nicht mehr benötigt)
- 🐛 **Fix:** Staff Batch Endpoint URL (fehlender `/branch/` Segment)
- 🐛 **Fix:** Client Batch Limit von 50 durch Parallel-Batches aufgehoben
- 🐛 **Fix:** No Show Status verwendet jetzt danger-Farbe (rot statt orange)
- 🐛 **Fix:** Collapsed Services mit display:none statt grid-template-rows

---

## 🔗 Verwandte Dokumentation

- [APPOINTMENT-VIEW.md](APPOINTMENT-VIEW.md) - Fullscreen-Einzelterminansicht
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) - CSS-Variablen und Farben
- [PHOREST-API.md](PHOREST-API.md) - Phorest API Integration
- [FLATPICKR.md](FLATPICKR.md) - Flatpickr Konfiguration
