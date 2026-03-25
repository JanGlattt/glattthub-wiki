# 📅 Terminansicht (Unified Appointment View)

Die Terminansicht ist eine **einheitliche Single-Page-Architektur**, die Termindetails und Session-Durchführung in einer Fullscreen-Ansicht vereint. Ein persistenter Header zeigt durchgehend den Kundennamen und die Terminzeit an, während der Content-Bereich je nach Kontext zwischen verschiedenen Views wechselt.

## 📋 Übersicht

Die Terminansicht ist für den Einsatz auf **iPads** während eines Kundentermins konzipiert:

- **Single-Page-Architektur** - Terminansicht und Session-Durchführung in einer View
- **Persistenter Header** - glattt Icon, Kundenname und Uhrzeit immer sichtbar
- **View-Navigation** - Wechsel zwischen Details, Session-Grid, Formulare, Behandlungseinstellungen ohne Seitenladung
- **View-History-Stack** - Zurück-Navigation über History-Stack
- **Fullscreen-Modus** - Keine Ablenkung durch Navigation
- **Alle Infos auf einen Blick** - Kunde, Termin, Behandlungen, Notizen
- **Paket-Einheiten** - Zeigt verbleibende Abo-Einheiten direkt bei den Behandlungen
- **Geburtstags-Hervorhebung** - Visueller Hinweis bei Geburtstag heute oder in den letzten 7 Tagen
- **Inline-Formulare** - Formulare direkt in der Ansicht ausfüllen
- **No-Show-Erkennung** - Automatische Erkennung wenn Termin >30 Min. überfällig
- **Modal- und Standalone-Modus** - Funktioniert als eigenständige Seite und als iframe in der Appointments-Übersicht

---

## 🔗 URL-Struktur

```
/hub/appointment/{branchId}/{appointmentId}
```

| Parameter | Beschreibung |
|-----------|--------------|
| `branchId` | Phorest Branch-ID (Filiale) |
| `appointmentId` | Phorest Appointment-ID |

### Query-Parameter

| Parameter | Beschreibung | Default |
|-----------|--------------|---------|
| `view` | Initiale View (`details`, `session`, `forms`, `treatment-settings`) | `details` |
| `embed` | `1` = Header ausblenden (für iframe-Einbettung in Modal) | - |

### Beispiele:
```
/hub/appointment/abc123/def456              # Termindetails
/hub/appointment/abc123/def456?view=session  # Direkt in Session-Grid
/hub/appointment/abc123/def456?embed=1       # Im Modal (ohne eigenen Header)
```

---

## 🏗 Architektur

### Vorher (veraltet, entfernt)
```
appointment-view/   → Terminansicht (eigene Seite)
appointment-session/ → Session-Durchführung (eigene Seite)
    ├── forms.blade.php
    └── treatment-settings.blade.php
```

### Jetzt (Unified)
```
appointment-unified/ → Alles in einer Single-Page-View
    ├── index.blade.php (mit View-Switching via Alpine.js)
    └── partials/ (alle Inhalte modular)
```

**Vorteile:**
- Kein Seitenwechsel zwischen Terminansicht und Session
- Kundendaten werden nur einmal geladen
- Zurück-Navigation ohne Page-Reload
- Persistenter Header mit Kundeninfo

### View-Navigation

```
┌──────────────────────────────────────────────────┐
│  [glattt]  Julienne Wolff · 14:00 - 14:45    [X]│  ← Persistenter Header
├──────────────────────────────────────────────────┤
│                                                  │
│   details ──→ session ──→ forms                  │
│                      └──→ treatment-settings     │
│                                                  │
│   navigateTo(view) pusht auf viewHistory[]       │
│   goBack() poppt vom Stack                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

| View | Beschreibung | Einstieg |
|------|-------------|----------|
| `details` | Kundenheader, Termindetails, Behandlungen, Notizen | Start-View |
| `session` | 2×2 Grid: Formulare, Behandlungseinstellungen, Upselling, Termin beenden | Button "Termin beginnen" |
| `forms` | Formular-Auswahl und Inline-Ausfüllung | Session-Grid → Formulare |
| `treatment-settings` | Körperzonen, Behandlungseinstellungen, Fotos | Session-Grid → Behandlungseinstellungen |

---

## 📁 Dateistruktur

```
resources/views/
├── layouts/
│   └── fullscreen.blade.php              # Fullscreen Layout (ohne Navigation)
└── hub/
    └── appointment-unified/
        ├── index.blade.php                # Hauptansicht mit View-Switching
        └── partials/
            ├── client-header.blade.php        # Kunden-Header mit Avatar, Status, Aktionen
            ├── appointment-details.blade.php  # Datum, Zeit, Dauer, Filiale
            ├── services.blade.php             # Behandlungsliste mit Paket-Einheiten
            ├── notes.blade.php                # Notizen-Timeline (scrollbar)
            ├── form-fill-inline.blade.php     # Inline-Formular
            ├── session-grid.blade.php         # 2×2 Session-Menü
            ├── session-forms.blade.php        # Formular-Auswahl innerhalb Session
            ├── treatment-content.blade.php    # Behandlungseinstellungen-Content
            └── end-session-modal.blade.php    # Modal zum Termin beenden

app/Http/Controllers/
└── AppointmentViewController.php          # Controller für View & Daten-APIs

public/
├── css/
│   └── theme_glattt.css                   # Alle Styles (inkl. Appointment View, Session, Treatment Settings)
└── js/
    ├── appointment-unified.js             # Alpine.js Hauptkomponente
    └── treatment-settings.js              # Alpine.js Behandlungseinstellungen

routes/
└── web.php                                # Routes unter /hub/appointment/...
```

---

## 🚀 Verwendung

### 1. Über die Termine-Seite

Auf der Termine-Seite (`/hub/appointments`) öffnet ein Klick auf einen Termin die Ansicht als **Fullscreen-Modal** (iframe mit `?embed=1`). Der Header des Modals wird per `postMessage` mit Kundennamen und Terminzeit aktualisiert.

### 2. Direkt per URL

```
/hub/appointment/{branchId}/{appointmentId}
```

Im Standalone-Modus zeigt der eigene persistente Header das glattt Icon, den Kundennamen und die Terminzeit.

---

## 🎨 Komponenten

### Persistenter Header

Im Standalone-Modus (ohne `?embed=1`) zeigt der Header:
- **Links:** Zurück-Button (kontextabhängig, nur sichtbar wenn nicht in `details`)
- **Mitte:** glattt Icon + Kundenname + Uhrzeit mit Filiale
- **Rechts:** Schließen-Button (→ `/hub/appointments`)

Der Header ist **außerhalb** der Alpine-Komponente und bindet an `$store.appointmentUnified`:

```blade
<img src="{{ asset('images/glattt-icon.png') }}" alt="glattt">
<div x-text="$store.appointmentUnified.clientName"></div>
<div x-text="$store.appointmentUnified.appointmentHeaderMeta"></div>
```

Der Alpine Store wird per `alpine:init` Event im `<head>` registriert, damit er vor dem Komponenten-Init verfügbar ist.

### Modal-Modus (iframe in Appointments-Übersicht)

Wenn die View als iframe in `hub.blade.php` eingebettet ist:
- Der eigene Header wird per CSS ausgeblendet (`?embed=1`)
- Die Komponente sendet per `postMessage` die Kundendaten an das Eltern-Fenster
- Der Modal-Header der Elternseite wird automatisch aktualisiert

```javascript
// In appointment-unified.js → syncStore()
if (window.parent !== window) {
    window.parent.postMessage({
        type: 'appointmentHeaderUpdate',
        clientName: this.clientName,
        meta: this.appointmentHeaderMeta,
    }, '*');
}
```

### Client Header

Zeigt Kundeninformationen prominent an:
- Avatar mit Initialen (großer türkiser Kreis)
- Vollständiger Name (klickbar → Kundenprofil)
- Geburtstag mit Hervorhebung:
  - 🎂 **Grüner Badge** bei Geburtstag heute (mit Pulse-Animation)
  - 🎂 **Gelber Badge** bei Geburtstag in den letzten 7 Tagen
- Kunden-ID
- Quick-Actions (Telefon, E-Mail, Formular-Buttons)
- **"Termin beginnen"** Button → `navigateTo('session')`

### Session-Grid

2×2 Grid mit großen Kacheln:
- **Formulare** → `navigateTo('forms')`
- **Behandlungseinstellungen** → `navigateTo('treatment-settings')`
- **Upselling** (Platzhalter)
- **Termin beenden** → End-Session-Modal

### End-Session-Modal

Teleportiertes Modal mit Pflicht-Notiz:
- Textarea für Terminnotiz (required)
- POST an `/phorest/appointment/{b}/{a}/note`
- Bei Erfolg: Zurück zu Details-View

---

## 🔧 Technische Details

### Controller

```php
// app/Http/Controllers/AppointmentViewController.php

// Unified View anzeigen
public function showUnified(string $branchId, string $appointmentId, Request $request): View

// Session-Start loggen (AJAX)
public function logSessionStart(Request $request, string $branchId, string $appointmentId): JsonResponse

// Daten-APIs (AJAX, lazy loaded)
public function getData(...)           // Termin + Kunde + Staff + Branch
public function getNotes(...)          // Notizen-Timeline
public function getPackages(...)       // Client-Pakete (Kurse)
public function getMergedServices(...) // Zusammengeführte Services bei Multi-Bookings
```

### Routes

```php
// routes/web.php (innerhalb hub Prefix)

// Hauptroute (zeigt die Unified View)
Route::get('/appointment/{branchId}/{appointmentId}',
    [AppointmentViewController::class, 'showUnified']
)->name('appointment.view');

// Daten-APIs
Route::get('/appointment/{branchId}/{appointmentId}/data', ...)->name('appointment.view.data');
Route::get('/appointment/{branchId}/{appointmentId}/notes', ...)->name('appointment.view.notes');
Route::get('/appointment/{branchId}/{appointmentId}/packages', ...)->name('appointment.view.packages');
Route::get('/appointment/{branchId}/{appointmentId}/merged-services', ...)->name('appointment.view.merged-services');

// Session
Route::post('/appointment/{branchId}/{appointmentId}/session/log-start', ...)->name('appointment.session.log-start');

// Behandlungseinstellungen
Route::get('/appointment/{branchId}/{appointmentId}/session/treatment-settings/data', ...);
Route::post('/appointment/{branchId}/{appointmentId}/session/treatment-settings', ...);
```

### Alpine.js Komponente

```javascript
// public/js/appointment-unified.js

function appointmentUnified() {
    return {
        // Navigation
        currentView: 'details',  // details | session | forms | treatment-settings
        viewHistory: [],

        // Core data
        appointment: null,
        client: null,
        staff: null,
        branch: null,

        // Computed
        get effectiveState() { ... },   // No-Show-Erkennung
        get clientName() { ... },
        get appointmentTime() { ... },
        get appointmentHeaderMeta() { ... },
        get canStartAppointment() { ... },

        // Navigation
        navigateTo(view) { ... },       // Pusht auf viewHistory
        goBack() { ... },               // Poppt von viewHistory
        syncStore() { ... },            // Synct Alpine Store + postMessage

        // Data Loading
        async loadAppointment() { ... },
        async loadMatchingForms() { ... },
        async loadNotes() { ... },      // Lazy
        async loadPackages() { ... },   // Lazy
        async loadMergedServices() { ... }, // Lazy

        // Actions
        async checkIn() { ... },
        async endSession() { ... },
        async logSessionStart() { ... },
    };
}
```

### Alpine Store

Der Store wird im `<head>` per `alpine:init` registriert und von der Komponente per `syncStore()` aktualisiert:

```javascript
document.addEventListener('alpine:init', () => {
    Alpine.store('appointmentUnified', {
        clientName: 'Lädt...',
        appointmentHeaderMeta: '',
        currentView: 'details',
        // ... wird von init() der Komponente befüllt
    });
});
```

---

## 🎯 Status-Erkennung

### Phorest-Status

| Status | Anzeige | Badge |
|--------|---------|-------|
| `BOOKED` | Gebucht | `badge-glattt-primary` |
| `CONFIRMED` | Bestätigt | `badge-glattt-info` |
| `CHECKED_IN` | Eingecheckt | `badge-glattt-success` |
| `PAID` | Bezahlt | `badge-glattt-success` |
| `COMPLETED` | Abgeschlossen | `badge-glattt-success` |
| `CANCELLED` | Storniert | `badge-glattt-danger` |

### Abgeleiteter Status: No Show

Ein Termin wird als **No Show** erkannt, wenn:
- Phorest-Status ist `BOOKED` oder `CONFIRMED`
- **UND** die Endzeit des Termins liegt mehr als 30 Minuten in der Vergangenheit
- **ODER** der Termintag ist bereits vergangen

| Status | Anzeige | Badge |
|--------|---------|-------|
| `NO_SHOW` | No Show | `badge-glattt-danger` |

### "Termin beginnen"-Button

Der Button ist **immer sichtbar**, außer bei:
- Status `PAID`
- Status `NO_SHOW`

---

## 📱 Layout & Responsive Design

Die Ansicht ist für **iPads** optimiert:

| Feature | Beschreibung |
|---------|--------------|
| **Kein Seiten-Scroll** | Details-View passt auf den Bildschirm |
| **Interne Scroll-Bereiche** | Nur Notizen-Karte scrollt bei Bedarf |
| **View-Transitions** | Fade-In Animation beim View-Wechsel |

| Breakpoint | Anpassung |
|------------|-----------|
| Desktop/Tablet (>768px) | 2-Spalten-Grid, kein Scroll |
| Mobile (≤768px) | 1-Spalte, normales Scroll-Verhalten |

---

## 🔮 Geplante Erweiterungen

- [ ] Beratungsprotokoll direkt erstellen
- [ ] Termin verschieben
- [ ] Termin stornieren
- [ ] Upselling-Kachel im Session-Grid
- [x] ~~Behandlungshistorie des Kunden anzeigen~~ → Über Kundenprofil
- [x] ~~Körperzonen-Auswahl integrieren~~ → In Behandlungseinstellungen
- [x] ~~Paket-Einheiten anzeigen~~ → Bei Behandlungen sichtbar
- [x] ~~Behandlungseinstellungen erfassen~~ → [Treatment Settings](TREATMENT-SETTINGS.md)
- [x] ~~Getrennte Views für Ansicht/Session~~ → Unified Single-Page-Architektur

---

## 🔗 Verwandte Dokumentation

- [TREATMENT-SETTINGS.md](TREATMENT-SETTINGS.md) - Laser-Behandlungseinstellungen
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) - GLATTT Design System
- [PHOREST-API.md](PHOREST-API.md) - Phorest API Integration
- [BODY-ZONE-SELECTOR.md](BODY-ZONE-SELECTOR.md) - Körperzonen-Komponente
