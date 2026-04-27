# Stornierte Beratungstermine — Dokumentation

## Übersicht (Endanwender)

Die Sektion **Stornierte Beratungstermine** erscheint auf der „Stornierte und gelöschte Termine"-Seite, sobald der Filter **Beratungsservices** aktiviert wird. Sie zeigt alle stornierten oder gelöschten Beratungstermine der nächsten 14 Tage sowie die letzten 3 Monate aus der Datenbank.

Ziel: Erkennen, welche Kunden einen Beratungstermin abgesagt haben und ob bereits ein Folgetermin gebucht wurde.

### Wo zu finden

Hub → Reports → **Stornierte und gelöschte Termine** → Filter „Beratungsservices" aktivieren

### Tabellenspalten

| Spalte | Bedeutung |
|--------|-----------|
| **Termin** | Datum und Uhrzeit des stornierten Beratungstermins |
| **Kunde** | Name des Kunden (wird lazy nachgeladen, zeigt `…` bis fertig) |
| **Folgetermin** | Frühester bekannter Folgetermin des Kunden (`…` = wird geprüft, `—` = keiner gefunden, Datum + Standort = gefunden) |
| **Standort** | Institut / Branch |
| **Typ** | `Storniert` (orange) oder `Gelöscht` (rot) |
| **Aktion am** | Zeitpunkt der Stornierung/Löschung (Berliner Zeit) |

### Termin-Detail-Modal

Ein Klick auf eine Tabellenzeile öffnet ein Modal mit drei Sektionen:

1. **Termin** — Datum/Uhrzeit, Standort, Status-Badge, Aktion am, Notizen aus Phorest (werden separat nachgeladen)
2. **Kunde** — Name als Link zum Kundenprofil, E-Mail und Telefonnummer (werden separat nachgeladen)
3. **Folgetermin** — Zeigt den bereits ermittelten Folgetermin (oder Ladeindikator / „kein Folgetermin")

Die Termindetails und Kundendaten werden nach dem Öffnen des Modals parallel im Hintergrund geladen, um die initiale Antwortzeit zu minimieren.

---

## Technische Details (Entwickler)

### Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────┐
│  cancelledAppointmentsPageApp (Alpine.js)                    │
│  - consultationFilter: true → Tabelle sichtbar              │
│  - upcomingConsultations[]  → Tabellendaten                  │
│  - consultationModal{}      → Modal-State                   │
└──────┬───────────────┬──────────────────┬───────────────────┘
       │               │                  │
       ▼               ▼                  ▼
  loadUpcoming    loadClientNames    loadFollowUps
  Consultations()  (lazy, parallel)   (lazy, POST)
       │
       ▼
  GET /reports/cancelled-appointments/upcoming-consultations
  (DB letzte 3 Monate + Live-API heute + 14 Tage)
```

### Backend-Routes

| Methode | Route | Controller-Methode | Beschreibung |
|---------|-------|-------------------|--------------|
| `GET` | `/phorest/reports/cancelled-appointments/upcoming-consultations` | `ReportController::cancelledConsultationsUpcoming()` | Hauptdaten |
| `GET` | `/phorest/reports/cancelled-appointments/client-names` | `ReportController::cancelledConsultationsClientNames()` | Kundennamen lazy |
| `POST` | `/phorest/reports/cancelled-appointments/follow-ups` | `ReportController::cancelledConsultationsFollowUps()` | Folgetermine prüfen |
| `GET` | `/phorest/appointment/{branchId}/{appointmentId}/details` | `PhorestController::getAppointmentDetails()` | Termindetails + Notizen (Modal) |
| `GET` | `/phorest/client/{clientId}` | `PhorestController::getClientData()` | Kundendaten (Modal) |

### Datenfluss

#### 1. Hauptdaten (`cancelledConsultationsUpcoming`)

Zwei Datenquellen werden kombiniert:

**Historisch (DB):** `stats_historic_appointments`
- Filter: `service_name LIKE '%Beratung%'` (oder konfigurierbar)
- Zeitraum: letzte 3 Monate
- JOIN mit `client_statistics` für Kundennamen
- Liefert: `appointment_id, branch_id, client_id, client_name, datetime, type, actioned_at, appointment_date_raw`

**Aktuell (Phorest Live-API):**
- Pro Branch: `GET /appointment?from_date=today&to_date=today+14&fetch_canceled=true`
- `activationState` bestimmt Typ: `ACTIVE` = gelöscht, sonst = storniert
- Zeiten: `appointmentDate + substr(startTime, 0, 8)` → Carbon parse (Vorsicht: `startTime` allein gibt UTC-Today)
- `updatedAt` → Berliner Zeit für „Aktion am"

Beide Listen werden nach Datum absteigend sortiert und zusammengeführt.

**Wichtig — Date-Bug-Fix:** `startTime` aus der Phorest-API ist im Format `HH:mm:ss.SSS` (Zeit-only). Wird es direkt in Carbon::parse() übergeben, setzt Carbon das Datum auf heute. Deshalb immer `$appt['appointmentDate'] . ' ' . substr($appt['startTime'], 0, 8)` kombinieren.

#### 2. Kundennamen lazy (`cancelledConsultationsClientNames`)

- GET mit `?ids[]=clientId1&ids[]=clientId2`
- `PhorestApiService::getClientsParallel()` — Http::pool
- Response: `{ names: { "clientId": "Vorname Nachname" } }`
- Frontend patcht `upcomingConsultations` reaktiv

#### 3. Folgetermine lazy (`cancelledConsultationsFollowUps`)

POST mit `{ items: [{ appointment_id, client_id, appointment_date_raw }] }`

Zwei Quellen werden geprüft, die früheste gewinnt:
- **DB:** `stats_historic_appointments` WHERE `client_id = ? AND appointment_date > storniertDatum AND deleted = false AND activation_state != 'CANCELED'`
- **Phorest API:** `PhorestApiService::getClientServiceHistoriesParallel()` — Http::pool, `/business/{id}/client/{clientId}/service-history?size=200&page=0`

Response: `{ follow_ups: { "appointmentId": false | { date: "d.m.Y", branch_name: "..." } } }`

#### 4. Modal — Termindetails (`getAppointmentDetails`)

`GET /phorest/appointment/{branchId}/{appointmentId}/details` — ruft intern `PhorestApiService::getAppointment($branchId, $appointmentId, ['includeNotes' => 'true'])` auf.

Phorest-Felder für Notizen im Response:
- `notes` — primäres Notizfeld
- `serviceNote` — service-spezifische Notiz
- `note` — alternativer Schlüssel

Das Modal prüft alle drei in dieser Reihenfolge: `notes || serviceNote || note`.

### JavaScript-Komponente

**Datei:** `public/js/cancelled-appointments-page.js`

#### State

```javascript
// Tabellen-Daten
consultationFilter: false,          // Filter-Toggle
upcomingConsultations: [],          // Array mit Terminobjekten
upcomingConsultationsLoading: false,
upcomingConsultationsError: null,
upcomingConsultationsDateRange: null,

// Modal-State
consultationModal: {
    show: false,
    appt: null,           // Termin aus der Tabelle (sofort verfügbar)
    detailsLoading: false,
    details: null,        // Phorest-Appointment-Response
    detailsError: null,
    clientLoading: false,
    clientDetails: null,  // Phorest-Client-Response
},
```

#### Methoden

| Methode | Beschreibung |
|---------|--------------|
| `loadUpcomingConsultations()` | Lädt Hauptdaten, triggert dann lazy Kundennamen + Folgetermine |
| `loadConsultationClientNames(missingIds)` | GET Client-Namen, patcht Array reaktiv |
| `loadConsultationFollowUps()` | POST Folgetermine, patcht Array reaktiv |
| `openConsultationDetail(appt)` | Öffnet Modal, feuert parallel Detail + Client Fetch |
| `closeConsultationModal()` | Schließt Modal, nullt `appt` nach 200ms (Transition) |
| `loadConsultationModalDetails(branchId, appointmentId)` | Termindetails + Notizen |
| `loadConsultationModalClient(clientId)` | Kundendaten (E-Mail, Telefon) |

### Blade-Views

| Datei | Beschreibung |
|-------|--------------|
| `resources/views/hub/reports/partials/consultation-cancellations-upcoming.blade.php` | Tabelle + Detail-Modal (per `x-teleport`) |
| `resources/views/hub/reports/rescheduled-cancelled.blade.php` | Haupt-View (includet das Partial) |

### Sync-Command

**Klasse:** `App\Console\Commands\SyncUpcomingConsultations`

Synchronisiert Beratungstermine der nächsten 14 Tage in die Tabelle `upcoming_consultations`.  
**Hinweis:** Der Controller liest für künftige Termine direkt die Phorest Live-API (nicht die DB-Tabelle), da die Tabelle nach Truncation leer sein kann.

### PhorestApiService

**Neu:** `getClientServiceHistoriesParallel(array $clientIds): array`
- Ruft für jeden `clientId` parallel `/business/{id}/client/{clientId}/service-history?size=200&page=0` ab
- Verwendet `Http::pool`
- Gibt `[clientId => [history entries]]` zurück

### Timezone-Handling

Alle `updatedAt`-Werte aus der Phorest-API kommen in UTC. Für die Anzeige als „Aktion am" wird immer `->setTimezone('Europe/Berlin')` angewendet.

---

## Changelog

### v1.0.0 (April 2026) — Erstveröffentlichung
- ✅ Tabelle: Stornierte Beratungstermine (DB + Live-API)
- ✅ Lazy Loading: Kundennamen (parallel, Http::pool)
- ✅ Lazy Loading: Folgetermine (DB + Phorest Service History, parallel)
- ✅ Detail-Modal: Termindetails + Notizen (lazy, `includeNotes=true`)
- ✅ Detail-Modal: Kundendaten mit Link zum Kundenprofil (lazy)
- ✅ Detail-Modal: Folgetermin-Status aus bereits geladenem State
- ✅ Timezone-Fix: `updatedAt` → Europe/Berlin
- ✅ Date-Bug-Fix: `appointmentDate + startTime` kombinieren (nicht `startTime` allein)
