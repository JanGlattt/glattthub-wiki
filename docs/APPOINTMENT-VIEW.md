# 📅 Terminansicht (Appointment View)

Die Terminansicht ist eine Fullscreen-Ansicht für individuelle Termine. Sie zeigt alle relevanten Informationen zu einem Termin auf einen Blick und ermöglicht Aktionen wie Check-In und Formulare ausfüllen.

## 📋 Übersicht

Die Terminansicht ist für den Einsatz auf **iPads** während eines Kundentermins konzipiert:

- **Fullscreen-Modus** - Keine Ablenkung durch Navigation, kein Seiten-Scroll
- **Alle Infos auf einen Blick** - Kunde, Termin, Behandlungen, Notizen
- **Paket-Einheiten** - Zeigt verbleibende Abo-Einheiten direkt bei den Behandlungen
- **Geburtstags-Hervorhebung** - Visueller Hinweis bei Geburtstag heute oder in den letzten 7 Tagen
- **Inline-Formulare** - Formulare direkt in der Ansicht ausfüllen
- **Schnellaktionen** - Kundenprofil öffnen, Formular starten
- **URL-basiert** - Direkt über URL erreichbar

---

## 🔗 URL-Struktur

```
/hub/appointment/{branchId}/{appointmentId}
```

### Beispiel:
```
https://glattthub.de/hub/appointment/abc123/def456
```

| Parameter | Beschreibung |
|-----------|--------------|
| `branchId` | Phorest Branch-ID (Filiale) |
| `appointmentId` | Phorest Appointment-ID |

---

## 📁 Dateistruktur

```
resources/views/
├── layouts/
│   └── fullscreen.blade.php          # Fullscreen Layout (ohne Navigation)
└── hub/
    └── appointment-view/
        ├── index.blade.php            # Hauptansicht
        └── partials/
            ├── client-header.blade.php    # Kunden-Header mit Avatar, Status & Geburtstag
            ├── appointment-details.blade.php  # Datum, Zeit, Dauer, Filiale
            ├── services.blade.php         # Behandlungsliste mit Paket-Einheiten
            ├── notes.blade.php            # Notizen-Timeline (scrollbar)
            └── form-fill-inline.blade.php # Inline-Formular

app/Http/Controllers/
└── AppointmentViewController.php      # Controller für View & Daten-API

public/
├── css/
│   └── appointment-view.css           # Styles für die Terminansicht (kein Seiten-Scroll)
└── js/
    └── appointment-view.js            # Alpine.js Komponente

routes/
└── web.php                            # Routes unter /hub/appointment/...
```

---

## 🚀 Verwendung

### 1. Über die Termine-Seite

Auf der Termine-Seite (`/hub/appointments`) hat jede Termin-Karte einen **"Termin öffnen"** Button im ausgeklappten Bereich.

### 2. Direkt per URL

```
/hub/appointment/{branchId}/{appointmentId}
```

Die IDs können aus der Phorest API oder aus anderen Ansichten entnommen werden.

---

## 🎨 Komponenten

### Fullscreen Layout (`layouts/fullscreen.blade.php`)

Ein schlankes Layout ohne Sidebar und Top-Navigation:

```blade
@extends('layouts.fullscreen')

@section('title', 'Mein Titel')

@section('header')
    {{-- Optional: Custom Header --}}
@endsection

@section('content')
    {{-- Hauptinhalt --}}
@endsection
```

**Features:**
- Kein Menü, keine Navigation
- Safe Area Support (iOS)
- Dark Mode Support
- Responsive

### Client Header

Zeigt Kundeninformationen prominent an:
- Avatar mit Initialen
- Vollständiger Name (klickbar → Kundenprofil)
- Externes Link-Icon zeigt Navigation an
- Geburtstag mit Hervorhebung:
  - 🎂 **Grüner Badge** bei Geburtstag heute (mit Pulse-Animation)
  - 🎂 **Gelber Badge** bei Geburtstag in den letzten 7 Tagen
  - Normale Anzeige sonst
- Kunden-ID
- Termin-Status (Badge)
- Quick-Actions (Telefon, E-Mail, Formular-Buttons)

### Appointment Details

Grid mit Termindetails:
- Datum (ausgeschrieben)
- Uhrzeit (Start - Ende)
- Dauer
- Filiale

### Services

Liste aller gebuchten Behandlungen mit Paket-Infos:
- Behandlungsname
- **Verbleibende Einheiten** (z.B. "5/9") wenn die Behandlung Teil eines Abo-Pakets ist

### Notes

Scrollbare Notizen-Timeline:
- Kundennotizen
- Heutiger Termin
- Vergangene Termine (chronologisch)
- Intern scrollbar, wenn viele Notizen vorhanden

### Navigation

- **X-Button** (oben rechts): Schließt die Terminansicht komplett
- **Zurück-Button** (oben links): Nur sichtbar bei geöffnetem Formular, kehrt zur Terminansicht zurück

---

## 🔧 Technische Details

### Controller

```php
// app/Http/Controllers/AppointmentViewController.php

// View anzeigen
public function show(string $branchId, string $appointmentId): View

// Daten per AJAX laden
public function getData(Request $request, string $branchId, string $appointmentId): JsonResponse
```

### Routes

```php
// routes/web.php (innerhalb hub Prefix)

Route::get('/appointment/{branchId}/{appointmentId}', 
    [AppointmentViewController::class, 'show']
)->name('appointment.view');

Route::get('/appointment/{branchId}/{appointmentId}/data', 
    [AppointmentViewController::class, 'getData']
)->name('appointment.view.data');
```

### Alpine.js Komponente

```javascript
// public/js/appointment-view.js

function appointmentView() {
    return {
        // State
        loading: true,
        error: false,
        appointment: null,
        client: null,
        staff: null,
        branch: null,
        
        // Computed Properties
        get clientName() { ... },
        get appointmentDate() { ... },
        get services() { ... },
        
        // Methods
        async loadAppointment() { ... },
        async checkIn() { ... }
    };
}
```

---

## 🎯 Status-Badges

| Status | Anzeige | CSS-Klasse |
|--------|---------|------------|
| `BOOKED` | 📅 Gebucht | `status-booked` |
| `CONFIRMED` | ✅ Bestätigt | `status-confirmed` |
| `CHECKED_IN` | 🟢 Eingecheckt | `status-checked-in` |
| `PAID` | ✓ Bezahlt | `status-paid` |
| `COMPLETED` | ✓ Abgeschlossen | `status-completed` |
| `CANCELLED` | ❌ Storniert | `status-cancelled` |

---

## 📱 Layout & Responsive Design

Die Ansicht ist für **iPads** optimiert mit einem **No-Scroll-Layout**:

| Feature | Beschreibung |
|---------|--------------|
| **Kein Seiten-Scroll** | Alle Inhalte passen auf den Bildschirm |
| **Interne Scroll-Bereiche** | Nur Notizen-Karte scrollt bei Bedarf |
| **Dynamische Höhen** | Karten wachsen nur bei Bedarf |

| Breakpoint | Anpassung |
|------------|-----------|
| Desktop/Tablet (>768px) | 2-Spalten-Grid, kein Scroll |
| Mobile (≤768px) | 1-Spalte, normales Scroll-Verhalten |

---

## 🔮 Geplante Erweiterungen

- [ ] Beratungsprotokoll direkt erstellen
- [ ] Termin verschieben
- [ ] Termin stornieren
- [x] ~~Behandlungshistorie des Kunden anzeigen~~ → Über Kundenprofil
- [x] ~~Körperzonen-Auswahl integrieren~~ → In Formularen verfügbar
- [x] ~~Paket-Einheiten anzeigen~~ → Bei Behandlungen sichtbar
- [x] ~~Behandlungseinstellungen erfassen~~ → [Treatment Settings](TREATMENT-SETTINGS.md)

---

## 🔗 Verwandte Dokumentation

- [TREATMENT-SETTINGS.md](TREATMENT-SETTINGS.md) - Laser-Behandlungseinstellungen
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) - GLATTT Design System
- [PHOREST-API.md](PHOREST-API.md) - Phorest API Integration
- [BODY-ZONE-SELECTOR.md](BODY-ZONE-SELECTOR.md) - Körperzonen-Komponente
