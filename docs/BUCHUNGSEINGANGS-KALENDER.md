# Buchungseingangs-Kalender

## Übersicht

Der **Buchungseingangs-Kalender** ist ein interaktiver Monatskalender auf der Seite „Vergangene Beratungsgespräche" (`/hub/reports/past-consultations`). Er zeigt, **wann Buchungen eingegangen sind** — also den Buchungszeitpunkt, nicht das Termindatum.

> ⚠️ **Wichtiger Hinweis für Endanwender:** Das Datum im Kalender ist der **Buchungseingang** (wann der Kunde gebucht hat), nicht der Termin selbst. Ein Kalenderklick auf „15. April" zeigt alle Buchungen, die am 15. April eingegangen sind — die Termine selbst können an anderen Tagen liegen.

---

## Endbenutzer-Dokumentation

### Wo finde ich den Kalender?

Hub → Berichte → Vergangene Beratungsgespräche → Abschnitt „Buchungseingangs-Kalender"

### Kalender-Ansicht

Jeder Tag zeigt:
- **Gesamtanzahl** Buchungen (große Zahl)
- **Farbige Badges** mit Aufschlüsselung:
  - ✓ Grün = stattgefundene Termine
  - ◦ Neutral = ausstehend / noch nicht synchronisiert
  - ✗ Rot = gelöschte Termine
  - ⚠ Orange = No-Shows / No-Show-Rate (je nach Ansichtsmodus)

Rechts neben dem Kalender erscheint eine **KW-Zusammenfassung** mit der Buchungsanzahl pro Standort.

### Tagesdetail-Modal

Klick auf einen Kalendertag öffnet ein Modal mit der **vollständigen Buchungsliste** für diesen Tag als Tabelle:

| Spalte | Inhalt |
|--------|--------|
| **Kunde** | Vor- und Nachname (aus Phorest) |
| **Termin** | Termindatum + Uhrzeit |
| **Standort** | Institutsname (ohne Präfix „glattt ") |
| **Status** | Buchungsstatus (siehe unten) |
| **Herkunft** | Wie die Buchung zustande kam |
| **Vertrag** | KPZ-Anzahl und Vertragsnummer, falls vorhanden |

#### Status-Werte

| Status | Farbe | Bedeutung |
|--------|-------|-----------|
| Stattgefunden | Grün | Termin wurde abgehalten |
| No Show | Orange | Kunde nicht erschienen |
| Geplant | Blau | Termin liegt in der Zukunft |
| Ausstehend | Grau | Termin noch nicht mit Phorest synchronisiert |
| Gelöscht | Rot | Termin wurde gelöscht |

#### Herkunft-Werte

| Herkunft | Bedeutung |
|----------|-----------|
| Google Ads | Über Google Ads Kampagne gebucht (gclid vorhanden) |
| Meta Ads | Über Meta/Facebook Kampagne gebucht (fbclid vorhanden) |
| Organisch | Online gebucht, ohne bezahlte Kampagne |
| Offline / Institut | Im Institut oder telefonisch gebucht |

#### Vertragsspalte

- **Grünes Badge** mit KPZ-Anzahl + Vertragsnummer und Abschlussdatum, wenn ein aktiver oder abgeschlossener Vertrag vorliegt
- **„–"** wenn kein Vertrag vorhanden

### Zwei Ansichtsmodi

Der Kalender hat einen Toggle für zwei Darstellungsmodi:

1. **Anzahl-Modus** (Standard): Zeigt die absolute Buchungsanzahl pro Tag
2. **No-Show-Rate-Modus**: Zeigt die No-Show-Quote in % pro Tag (Farbe spiegelt Intensität wider)

---

## Entwickler-Dokumentation

### Architektur

Das Feature besteht aus drei Schichten:

```
Frontend (Alpine.js)
    └── openBookingDayModal(dateStr)         # In past-consultation-stats.js
         └── GET /phorest/reports/consultation-booking-day?date=YYYY-MM-DD
              └── ReportController::consultationBookingDay()
                   ├── Query A: booking_trackings (Online-Buchungen)
                   ├── Query B: stats_historic_appointments (Offline/Historisch)
                   ├── Client-Namen-Lookup (DB + API Fallback)
                   └── JSON Response → Modal-Tabelle
```

### Backend: ReportController

**Methode:** `consultationBookingDay(Request $request): JsonResponse`  
**Route:** `GET /phorest/reports/consultation-booking-day`  
**Parameter:** `date` (YYYY-MM-DD), optional `branch_id`

#### Query A — Online-Buchungen (booking_trackings)

Buchungen aus dem Online-Buchungsformular, die über `booking_trackings` nachverfolgt werden. Inklusive UTM-Parameter, gclid, fbclid.

```php
$trackingRows = DB::table('booking_trackings as bt')
    ->leftJoin('stats_historic_appointments as sha',
        DB::raw('bt.appointment_id COLLATE utf8mb4_unicode_ci'), '=', 'sha.appointment_id')
    ->whereIn('bt.service_id', $consultationServiceIds)
    ->whereNotNull('bt.booked_at')
    ->where(DB::raw('DATE(bt.booked_at)'), $date)
    ->select([...])
    ->get();
```

> **Kollationshinweis:** `booking_trackings.appointment_id` hat Kollation `utf8mb4_0900_ai_ci`, `stats_historic_appointments.appointment_id` hat `utf8mb4_unicode_ci`. Der JOIN erfordert daher `COLLATE utf8mb4_unicode_ci` am `bt.appointment_id`.

#### Query B — Offline/Historische Buchungen (stats_historic_appointments)

Buchungen die direkt im Phorest-System angelegt wurden (Telefon, Walk-in, etc.). Gefiltert auf Buchungen die **nicht** in `booking_trackings` vorhanden sind.

```php
$historicRows = DB::table('stats_historic_appointments as sha')
    ->whereIn('sha.service_id', $consultationServiceIds)
    ->where('sha.activation_state', 'ACTIVE')
    ->whereNotNull('sha.created_at_phorest')
    ->where(DB::raw('DATE(sha.created_at_phorest)'), $date)
    ->whereNotIn('sha.appointment_id', function ($sub) {
        $sub->select(DB::raw('appointment_id COLLATE utf8mb4_unicode_ci'))
            ->from('booking_trackings')
            ->whereNotNull('booked_at')
            ->whereNotNull('appointment_id');
    })
    ->get();
```

#### Client-Namen-Lookup (zweistufig)

Namen werden in zwei Stufen ermittelt:

1. **Schritt 1 — DB-Lookup:** Schnell, aus `client_statistics` via `phorest_client_id`
2. **Schritt 2 — API-Fallback:** Für IDs die nicht in `client_statistics` sind (neue Kunden, noch nicht gesynced), werden diese parallel via Phorest API abgefragt (`PhorestApiService::getClientsParallel()`)

```php
// Schritt 1: client_statistics (lokal, schnell)
$clientNames = [];
DB::table('client_statistics')
    ->whereIn('phorest_client_id', $clientIds)
    ->get()
    ->each(fn($c) => $clientNames[$c->phorest_client_id] = trim("$c->first_name $c->last_name") ?: null);

// Schritt 2: Phorest API für fehlende IDs
$missingIds = array_diff($clientIds, array_keys($clientNames));
if (!empty($missingIds)) {
    $apiResults = $this->phorest->getClientsParallel($missingIds);
    foreach ($apiResults as $id => $data) {
        $clientNames[$id] = trim("$data[firstName] $data[lastName]") ?: null;
    }
}
```

> **Warum fehlen manche IDs in `client_statistics`?** Die Tabelle enthält nur Kunden mit mindestens einer abgeschlossenen Beratungskonsultation. Neue Kunden (Erstbuchung) sind dort noch nicht vorhanden — daher der API-Fallback.

#### Status-Kategorien

Die `status_category` wird pro Termin berechnet:

```php
if ($row->deleted)                          → 'deleted'
if ($row->appointment_date === null && $row->has_tracking)  → 'pending'  // SHA noch nicht gesynced
if ($row->state in [COMPLETED, PAID])       → 'past'
if ($row->state in [NO_SHOW, ...] && date < today)  → 'no_show'
if ($row->appointment_date >= today)        → 'future'
else                                        → 'past'
```

> **`pending`-Status:** Wenn ein Online-Termin noch nicht von Phorest in `stats_historic_appointments` synchronisiert wurde, ist `appointment_date` NULL. Diese Termine werden als „Ausstehend" markiert, statt fälschlicherweise als „Stattgefunden".

### Frontend: Alpine.js

**Datei:** `public/js/past-consultation-stats.js`

Relevante State-Eigenschaften:
```js
bookingDayModal: {
    open: false,
    date: null,
    label: '',
    loading: false,
    appointments: [],
}
```

Relevante Methoden:
```js
openBookingDayModal(dateStr)   // Öffnet Modal, ruft API auf
closeBookingDayModal()          // Schließt Modal
bookingStatusClass(category)    // CSS-Klasse für Status-Badge
bookingStatusLabel(category)    // Anzeigetext für Status
bookingSourceClass(source)      // CSS-Klasse für Herkunfts-Badge
```

### Blade-Template

**Datei:** `resources/views/hub/reports/partials/consultation-booking-day-modal.blade.php`

Das Modal verwendet:
- `<template x-teleport="body">` — wird ans Ende des `<body>` gerendert
- `x-show="bookingDayModal.open"` + `x-cloak` — verhindert Flash beim Laden
- `table-glattt` + `table-glattt-container` — Standard-Tabellenklassen
- `badge-glattt-*` Klassen für Status und Herkunft

> ⚠️ **Bekannte Falle:** Das Modal-Partial darf keinen HTML-Content **außerhalb** des `<template x-teleport>` Tags haben. Sonst wird dieser Content direkt im DOM gerendert und ist immer sichtbar, unabhängig von `x-show`.

### Relevante Dateien

```
app/Http/Controllers/ReportController.php
    └── consultationBookingDay()             # API-Endpunkt

app/Services/PhorestApiService.php
    └── getClientsParallel(array $clientIds) # Parallele Kunden-Abfrage

public/js/past-consultation-stats.js
    ├── bookingDayModal (State)
    ├── openBookingDayModal()
    ├── closeBookingDayModal()
    ├── bookingStatusClass()
    ├── bookingStatusLabel()
    └── bookingSourceClass()

resources/views/hub/reports/partials/
    └── consultation-booking-day-modal.blade.php  # Modal-Template
```

### API-Response-Format

```json
{
    "success": true,
    "date": "2026-04-24",
    "total": 15,
    "appointments": [
        {
            "appointment_id": "abc123",
            "appointment_date": "2026-04-28",
            "appointment_date_formatted": "28.04.2026",
            "start_time": "14:30",
            "state": "COMPLETED",
            "status_category": "past",
            "branch_id": "xyz",
            "branch_name": "glattt Hannover",
            "client_name": "Max Mustermann",
            "source": "google_ads",
            "source_label": "Google Ads",
            "utm_campaign": "GoogleAds_PMax_HAN",
            "contract": {
                "contract_number": "K-001234",
                "body_zone_count": 3,
                "signed_at": "15.01.2026"
            }
        }
    ]
}
```

### Datenquellen

| Datenquelle | Tabelle / API | Zweck |
|-------------|---------------|-------|
| Online-Buchungen | `booking_trackings` | UTM/gclid/fbclid-Tracking |
| Historische Buchungen | `stats_historic_appointments` | Phorest-Datenspiegel |
| Kundennamen (Primär) | `client_statistics` | Lokale DB, schnell |
| Kundennamen (Fallback) | Phorest REST API | Neue Kunden ohne CS-Eintrag |
| Verträge | `contracts` | Vertragsstatus je Kunde |
| Standortnamen | `branches` (gecacht) | Branch-ID → Name |

### Bekannte Einschränkungen

1. **SHA-Sync-Verzögerung:** `stats_historic_appointments` wird nicht in Echtzeit befüllt. Online-Buchungen der letzten Tage haben oft `appointment_date = NULL` → Status „Ausstehend". Nach dem nächsten Sync erscheint der korrekte Status.

2. **Kollationskonflikt:** `booking_trackings` verwendet `utf8mb4_0900_ai_ci`, `stats_historic_appointments` und `client_statistics` verwenden `utf8mb4_unicode_ci`. PHP-seitige Lookups (`whereIn`) sind unproblematisch; SQL-JOINs zwischen diesen Tabellen benötigen explizites `COLLATE`.

3. **Neue Kunden ohne `client_statistics`-Eintrag:** Erst nach vollständigem Phorest-Sync verfügbar. Der API-Fallback kompensiert dies, verursacht aber ~1–2s Ladezeit zusätzlich wenn viele fehlende IDs vorhanden sind.
