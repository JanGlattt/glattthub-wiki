# 📅 Terminübersicht (Appointments Overview)

Die Terminübersicht unter `/hub/appointments` zeigt alle Termine eines Tages in einer übersichtlichen Karten-Ansicht. Sie ist die zentrale Anlaufstelle für die tägliche Terminplanung.

---

## 📋 Überblick

### Funktionen

| Feature | Beschreibung |
|---------|--------------|
| **Datum-Navigation** | Flatpickr-Kalender mit Tag/Woche vor/zurück Buttons |
| **Filialfilter** | Termine nach Filiale filtern (Sidebar) |
| **Beratungs-Filter** | Button um nur Beratungsgespräche anzuzeigen |
| **Ansichts-Wechsel** | Toggle zwischen Listen- und Kalenderansicht |
| **Tageskalender** | Spalten pro Mitarbeiter mit Zeitachse (bei ausgewählter Filiale) |
| **Status-Indikator** | Farbcodierte linke Kante zeigt Terminstatus |
| **Beratungs-Badge** | Goldenes Badge kennzeichnet Beratungsgespräche |
| **"Jetzt"-Linie** | Rote Linie zeigt aktuelle Uhrzeit im Kalender |
| **Kontaktdaten** | E-Mail und Telefon direkt in Karten-Header |
| **Ausklappbare Services** | Behandlungsliste bei Bedarf einblenden |

### URL

```
/hub/appointments
```

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

---

## 📁 Dateistruktur

```
public/
├── css/
│   └── theme_glattt.css       # apt-card Styles & CSS-Variablen
└── js/
    └── appointments.js         # Alpine.js Komponente

resources/views/hub/
└── appointments/
    └── index.blade.php        # Blade-Template

app/Http/Controllers/
└── PhorestController.php      # API-Endpoints für Termine
```

---

## 🔧 Technische Details

### API-Endpoints

| Endpoint | Beschreibung |
|----------|--------------|
| `GET /phorest/appointments` | Termine für Datum + Filiale |
| `GET /phorest/clients/batch` | Kundendaten (max 50 IDs pro Anfrage) |
| `GET /phorest/staff/batch` | Mitarbeiterdaten (max 50 IDs pro Anfrage) |
| `GET /phorest/consultation-services` | Liste der Beratungs-Service-IDs |

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

### Datum navigieren

Die Datums-Auswahl befindet sich oben rechts mit praktischen Schnell-Buttons:

| Button | Aktion |
|--------|--------|
| `««` (Doppelpfeil links) | Eine Woche zurück |
| `‹` (Pfeil links) | Einen Tag zurück |
| **Datumsfeld** | Klick öffnet Kalender-Popup |
| `›` (Pfeil rechts) | Einen Tag vor |
| `»»` (Doppelpfeil rechts) | Eine Woche vor |

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

- Klicke auf das **ⓘ Info-Icon** rechts in der Karte
- Öffnet die Fullscreen-Terminansicht mit allen Details

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
