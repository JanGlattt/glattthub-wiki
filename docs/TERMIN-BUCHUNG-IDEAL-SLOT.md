# Termin buchen – Ideale Slot-Findung

Modul im glatttHub, das beim Buchen oder Verlegen eines Termins automatisch den **idealen Slot** vorschlägt. Es setzt die internen Produktivitäts-Regeln um: zuerst einen Raum füllen, keine Lücken, exakte Anschlusszeiten – und bucht immer alle aktiven Paket-Services des Kunden plus die Desinfektion.

---

## Für Endanwender

### Was macht dieses Modul?

Statt zu fragen „gleicher Tag, gleiche Zeit in 8 Wochen?" sucht das Modul im Kalender den **nächsten freien Termin, der direkt an einen bestehenden anschließt** – im richtigen Raum und ohne kleine Lücken. Der angemeldete Mitarbeiter wählt nur Institut und Kunde, das System schlägt mehrere ideale Termine an unterschiedlichen Tagen vor.

### Die Regeln, die das Modul umsetzt

1. **Erst einen Raum füllen** – Termine werden zuerst komplett in **Raum 1** (z.B. `BI 1`) gelegt, bis dieser zu ca. **80 %** ausgelastet ist. Erst dann wird **Raum 2** (`BI 2`) geöffnet. So muss bei Krankheit eines Mitarbeiters niemand verschoben oder abgesagt werden.
2. **Keine Lücken** – der neue Termin schließt direkt an den vorherigen an. 5–10-Minuten-Lücken sind verlorene Zeit.
3. **Exakte Anschlusszeiten** – wenn der nächste freie Termin um **9:55 Uhr** anschließt, wird **9:55 Uhr** gebucht und nicht 10:00 Uhr.
4. **Alle Services + Desinfektion** – es werden immer alle aktiven Paket-Services des Kunden gebucht und automatisch der 10-minütige **Desinfektions**-Service angehängt (Reinigungszeit zwischen Kunden).

### Wo finde ich das Modul?

Das Verlegen ist direkt im **Kundenprofil → Tab „Termine"** über den Button **„Verlegen"** bei jedem zukünftigen, nicht stornierten Termin erreichbar. Bei bereits stornierten oder vergangenen Terminen werden „Verlegen" und „Link" ausgeblendet – ein stornierter Termin kann nicht mehr verlegt werden.

> Die eigenständige Buchungsseite (`Hub → Termin buchen`) existiert noch im Code, ist aber aus der Navigation entfernt. Der primäre Weg ist ausschließlich das Modal auf der Kundenseite.

### Termin verlegen

Es gibt **zwei Wege**, einen Termin zu verlegen:

1. **Direkt im Kundenprofil** (empfohlen): Im Tab **„Termine"** hat jeder zukünftige Termin einen Button **„Verlegen"**. Ein Klick öffnet ein **Modal** mit der vollständigen Slot-Logik:
   - Oben wählt man **Institut** (bestehende Filiale vorausgewählt) und das **erste mögliche Datum**.
   - Die Services des Kunden (alle aktiven Paket-Services + Desinfektion) werden **automatisch übernommen** und als Badges angezeigt.
   - Darunter erscheinen die idealen freien Slots als kompakte Liste, gruppiert pro Tag.
   - Ein Klick auf einen Slot storniert die alten Termine und legt den neuen an. Danach lädt die Terminliste automatisch neu und es erscheint eine Erfolgsmeldung.
2. **Aus der Terminansicht** eines Termins: Button **„Verlegen"** öffnet das Buchungsmodul (`hub.booking`) mit vorausgewähltem Kunden, Institut und den `appointmentIds` des Termins.

> **Wichtig – Stornierung per appointmentId:** Bestehende Phorest-Termine besitzen **keine abrufbare `bookingId`** (diese wird nur beim Erstellen einer Buchung einmalig zurückgegeben und ist später nirgends abrufbar). Das Verlegen storniert daher jeden Service-Termin einzeln über seine `appointmentId` (`appointment/cancel?appointment_id=…`) und legt anschließend eine neue Buchung an. Ein im Profil gruppierter Termin kann aus mehreren `appointmentIds` bestehen (mehrere aufeinanderfolgende Services) – es werden alle storniert.

### Selfservice: Kunde bucht/verlegt selbst per Link

Zusätzlich zur Buchung durch Mitarbeiter kann ein **Self-Service-Link** an den Kunden geschickt werden, über den er sich **ohne Login** selbst einen Termin aussucht.

**Wie erstellt man den Link?**

Im Kundenprofil → Tab **„Termine"**:
- **Neuer Termin**: Button **„Link erstellen"** in der Karte „Selfservice-Terminbuchung" (immer sichtbar).
- **Verlegen**: Button **„Link"** (Kettensymbol) bei jedem zukünftigen, nicht stornierten Termin, direkt neben „Verlegen".

Im sich öffnenden Modal legt der Mitarbeiter fest:
1. **Institut** – bei „Verlegen" das Institut des bestehenden Termins, bei „Neuer Termin" das Institut des letzten bekannten Termins bzw. (falls der Kunde noch keinen Termin hatte) `lastVisitedBranchId`/`creatingBranchId` aus den Phorest-Kundendaten. Immer frei änderbar. Solange kein Institut gewählt ist, zeigt die Service-Liste weiter unten den Hinweis „Bitte zuerst ein Institut auswählen" statt einer irreführenden „nicht gefunden"-Meldung.
2. **Frühestens ab** – Datum, ab dem gesucht wird
3. **Nur Termine ohne Lücke anbieten** (Toggle, standardmäßig an) – steuert den „grün/grau"-Filter (siehe unten)
4. **Services für diesen Termin** – Checkbox-Liste aller aktiven Paket-Services + Extrazeit des Kunden (`BookingService::getServiceOptions()`, identisch zur Auswahl im Buchungsmodul für Mitarbeiter). **Standardmäßig sind alle Positionen ausgewählt** (alle aktiven Abos + ggf. Extrazeit); der Mitarbeiter kann einzelne bewusst **abwählen** oder wieder **zubuchen**, bevor der Link generiert wird. Die Desinfektion wird beim Buchen immer automatisch ergänzt und ist kein Auswahlpunkt. Ohne mindestens einen ausgewählten Service kann kein Link erstellt werden. Ein Instituts-Wechsel lädt die Service-Liste neu (andere Service-IDs/Verfügbarkeiten je Institut).

Nach Klick auf „Link erstellen" wird der Link angezeigt mit **„Kopieren"**-Button und, falls eine Mobilnummer beim Kunden hinterlegt ist, einem **„Per WhatsApp senden"**-Button (öffnet `wa.me` mit vorausgefüllter Nachricht in WhatsApp/WhatsApp Web – keine Superchat-API-Integration, funktioniert immer, unabhängig vom 24h-Antwortfenster).

**„Nur grüne" vs. „auch graue" Termine:**

Im Slot-Kalender sind Slots mit `is_adjacent = true` **grün hervorgehoben** (`slot-pill--adjacent`, `--color-success`) – sie schließen lückenlos an einen bestehenden Termin oder die Arbeitszeit-Grenze an und sind aus Produktivitätssicht **ideal**. Andere freie Slots (`is_adjacent = false`, z.B. gestapelte Füller mitten am Tag) werden **neutral/weiß** dargestellt. Ist der Toggle „Nur ohne Lücke" aktiv, sieht der Kunde **ausschließlich grüne Slots** – so kann er sich nie einen Termin aussuchen, der eine Produktivitäts-Lücke reißt.

**Was sieht der Kunde?**

Eine schlanke, eigenständige Seite (`/shared/booking/{token}`, kein Login, kein Hub-Layout): Datum-Auswahl (nicht vor das festgelegte Mindestdatum), darunter die freien Slots als Liste. Institut und Services (exakt die beim Link-Erstellen ausgewählten Positionen + Desinfektion) sind **fest vorgegeben** und nicht änderbar. Bei einer Verlegung (`mode=reschedule`) wird der zu verlegende Termin oben als **„Zu verlegender Termin"**-Badge angezeigt (statt reinem Fließtext). Nach Klick auf einen Slot wird sofort gebucht bzw. der alte Termin verlegt; der Link ist danach verbraucht. Auf der Erfolgsseite kann der Kunde per **„Zum Kalender hinzufügen"**-Button eine `.ics`-Datei herunterladen (Datum, Uhrzeit, Dauer, Institutsadresse als Ort – bewusst **ohne** die einzelnen Service-Namen, um keine Behandlungsdetails im Kalendereintrag preiszugeben).

**Sicherheit & Gültigkeit:** Identisches Muster wie beim Formular-Teilen – 64-Zeichen-Token, **48 Stunden gültig**, **einmalig nutzbar** (verfällt sofort nach erfolgreicher Buchung). Bei ungültigem/abgelaufenem/bereits genutztem Link sieht der Kunde eine passende Fehlermeldung statt eines Fehlers.

**Benachrichtigung:** Bucht der Kunde selbst einen Termin, wird das zuständige Institut-Team per `NotificationService` benachrichtigt (`forInstitutes([$branchId])`).

---

## Für Entwickler

### Architektur

Das Modul folgt der Hub-Modul-Konvention (Livewire-Komponente → Blade-View → Services). Die Geschäftslogik liegt vollständig in Services; die Slot-Engine ist rein und unit-getestet.

```
app/Services/Booking/
├── Data/
│   ├── RoomSchedule.php      # Raum-Belegung eines Tages (busy, Auslastung, Anschlusspunkt)
│   └── SlotSuggestion.php    # Ein vorgeschlagener Slot (DTO)
├── SlotFinderService.php     # Reine Ranking-Engine (keine API) – unit-testbar
├── BookingCalendarService.php# Lädt Phorest-Daten → RoomSchedule[]
└── BookingService.php        # Orchestriert: findSuggestions(), book(), reschedule()
```

| Schicht | Datei | Zweck |
|---|---|---|
| Livewire | `app/Livewire/Hub/Booking/AppointmentBookingForm.php` | Kundensuche, Slot-Suche, Buchen/Verlegen (Buchungsseite) |
| Livewire | `app/Livewire/Hub/Booking/RescheduleSlotModal.php` | Verlegen-Modal direkt im Kundenprofil (per Event geöffnet) |
| View | `resources/views/livewire/hub/booking/appointment-booking-form.blade.php` | UI (Theme-Klassen, Slot-Karten) |
| View | `resources/views/livewire/hub/booking/reschedule-slot-modal.blade.php` | Modal-UI (Institut + Datum + Slot-Liste) |
| Hub-Seite | `resources/views/hub/booking.blade.php` | Bindet die Buchungs-Komponente ein |
| Profil | `resources/views/hub/clients/partials/appointments.blade.php` | „Verlegen"-Button je zukünftigem Termin |
| Route | `routes/web.php` → `hub.booking` (`can:view_booking`) | Buchungsseite (technisch vorhanden, aus Sidebar entfernt) |
| Route | `routes/web.php` → `shared.booking.show` (öffentlich, kein Auth) | Self-Service-Buchungsseite `/shared/booking/{token}` |
| Config | `config/booking.php` | Schwellen, Geschäftszeiten, Raum-Pattern, Lücken-Regel |

### Das „Raum"-Modell

Ein **Raum ist eine Phorest-Staff-Entität** mit Raum-Namen (`BI 1`, `BI 2`, `BI 3`, `H1`, `BS 1` …) – **nicht** die Person. Online-/Vorausbuchungen liegen in diesen Raum-Spalten; am Tag selbst „ziehen" die Mitarbeiter den Termin in ihre eigene Namensspalte. Für die Buchung sind ausschließlich die Raum-Entitäten relevant.

- Erkennung über `config('booking.room_name_pattern')` (Regex, z.B. `BI 1`).
- Räume müssen für alle gebuchten Services qualifiziert sein (`disqualifiedServices`).
- Gebucht wird unter der `staffId` des Raums, der gerade gefüllt wird.

### Slot-Engine (SlotFinderService)

Pro Tag und Raum wird aus den bereits vorhandenen Terminen die Belegung berechnet:

- **Geschäftszeiten = Arbeitszeiten des Raums**: Das WORKING-Zeitfenster jedes Raums kommt aus der Phorest **Staff-WorkTimeTable** (`getStaffWorkTimeTable`). Arbeitet ein Raum an einem Tag nicht, wird er an dem Tag übersprungen. Diese Fenster sind zugleich der Nenner für die Auslastung und die Grenzen für die Slot-Suche.
- **Auslastung** = belegte Minuten / Arbeitszeit-Minuten des Raums an dem Tag.
- **Anschlusspunkt** = Ende des letzten Termins im Raum (oder Arbeitsbeginn, wenn leer) → erzeugt exakte Zeiten wie 9:55.
- **Raumwahl**: niedrigste Raumnummer mit Auslastung < Schwelle (`room_utilization_threshold`, Standard 0,80), in die der Service-Block lückenlos passt. Erst wenn Raum 1 voll genug ist, wird Raum 2 betrachtet.
- Es wird ein Vorschlag **pro Tag** über das Suchfenster (`scan_days`) erzeugt, bis `max_suggestions` erreicht ist.

### Phorest-Integration

Verifiziert gegen die Live-API (`PhorestApiService`):

- **Termine laden**: `getAllAppointmentsPaginated(branchId, ['from_date','to_date'])` – Felder `appointmentDate`, `startTime`/`endTime` (`HH:MM:SS.000`, lokal), `staffId`, `state`, `deleted`, `bookingId`.
- **Räume**: `getStaff(branchId)` → `_embedded.staffs[]` mit `staffId`, Name, `disqualifiedServices`.
- **Arbeitszeiten der Räume**: `getStaffWorkTimeTable(branchId, ['from_date','to_date','activity_type'=>'WORKING'])` → `_embedded.workTimeTables[]` je `staffId` mit `timeSlots[]` (`date`, `startTime`, `endTime`, `type`). Max. 1 Monat pro Abfrage (im Service in 28-Tage-Blöcke gechunkt).
- **Services/Dauern**: `getCachedServices(branchId)` → `duration` (Minuten); Desinfektion per Namens-Schlüsselwort.
- **Paket-Services**: `getClientCourses(['clientId'])` → aktive `clientCourseItems[].serviceId`.
- **Buchen**: `createBooking(branchId, payload, forceSelectedTime: true)`. Der Parameter `?force_selected_time=true` umgeht `STAFF_NOT_WORKING` und erlaubt exakte Anschlusszeiten. Payload enthält mehrere `serviceSchedules` (alle Services + Desinfektion), die lückenlos hintereinander liegen, alle unter der Raum-`staffId`.
- **Verlegen**: `cancelAppointment(branchId, appointmentId)` je `appointmentId` des alten Termins (POST `appointment/cancel?appointment_id=…`) + erneutes `createBooking`. **Nicht** `cancelBooking`, da bestehende Termine keine abrufbare `bookingId` haben.

### Konfiguration (`config/booking.php`)

| Schlüssel | Bedeutung |
|---|---|
| `default_weeks_ahead` | Standard-Vorlauf (8 Wochen) |
| `scan_days` | Anzahl durchsuchter Werktage |
| `max_suggestions` | Max. Anzahl Vorschläge |
| `room_utilization_threshold` | Auslastungsschwelle (0,80) |
| `min_gap_minutes` | Mindest-Lücke zu Nachbar/Arbeitsgrenze (30); Lücken darunter (außer ~anschließend) sind verboten |
| `gap_tolerance_minutes` | Toleranz (6): Lücken darunter gelten als „praktisch anschließend" und sind erlaubt |
| `working_weekdays` | Vorfilter für buchbare Wochentage (echte Zeiten aus Staff-WorkTimeTable) |
| `room_name_pattern` | Regex zur Raum-Erkennung |
| `disinfection_keyword` | Schlüsselwort für Desinfektions-Service |
| `busy_states` | Termin-States, die als belegt zählen |

#### Lücken-Regel (boundary-aware)

Jeder Kandidaten-Slot wird gegen seine **direkten Nachbarn** geprüft – das sind bestehende Termine, Pausen **und** die Arbeitszeit-Grenzen (Beginn/Ende). Die Lücke zum nächsten Nachbarn auf jeder Seite muss entweder **kleiner als `gap_tolerance_minutes`** (praktisch anschließend) oder **mindestens `min_gap_minutes`** sein. Lücken dazwischen (z.B. 6–29 Min) werden verworfen – auch wenn der Slot exakt am Arbeitsbeginn startet. Beispiel: Arbeitsbeginn 07:00, Termin 08:45, 90-Min-Service → 07:00–08:30 (15 Min Lücke vor 08:45) ist **unzulässig**.

### Verlegen-Modal (`RescheduleSlotModal`)

Die Livewire-Komponente wird über ein Livewire-Event aus dem Alpine-Kundenprofil geöffnet:

```js
// Alpine (detail.blade.php) → Livewire-Event
Livewire.dispatch('open-reschedule-modal', {
    branchId, clientId, clientName,
    appointmentIds: ['appt-id-1', 'appt-id-2'], // alle IDs des gruppierten Termins
    currentLabel: 'Do. 27.08.2026, 16:50 Uhr',
    minDate: '2026-07-01',
});
```

**Ablauf beim Öffnen (zwei Requests):**

1. `open()` setzt Felder + `isOpen = true` + `loading = true` — kein synchroner API-Call, das Modal erscheint sofort mit Spinner.
2. Alpine's `$watch('open', show => { if (show) $wire.loadAndSearch(); })` im View-`x-init` feuert `loadAndSearch()` als zweiten Request.
3. `loadAndSearch()` lädt Services + Slots mit `try/catch/finally` — Phorest-Fehler landen als Flash-Meldung im Modal, das Modal bleibt offen.
4. Nach dem Re-Render: `$nextTick(() => { if (fpInst) fpInst.setDate($wire.startDate) })` setzt das Flatpickr-Datum.

**Teleport-Pattern (KRITISCH):**

```blade
<div>
    <template x-teleport="body">           {{-- immer präsent, kein @if außerhalb --}}
        <div x-data="{ open: @entangle('isOpen'), fpInst: null }"
             x-init="$watch('open', show => { if (show) $wire.loadAndSearch(); ... })">
            <div x-show="open" x-cloak     {{-- Sichtbarkeit via Alpine --}}
                 @click.self="$wire.close()"
                 @keydown.escape.window="$wire.close()"
                 class="modal-glattt-backdrop" ...>
                ...
            </div>
        </div>
    </template>
</div>
```

Ausschließlich dieses Pattern verwenden — **niemals** `@if ($isOpen)` außerhalb des `<template x-teleport>`, und **niemals** Livewires `@teleport`/`@endteleport`. Beides verhindert, dass Alpine das Template beim Seitenaufbau initialisiert, wodurch alle `wire:`-Bindings, `x-data` und `x-init` im teleportierten Inhalt nicht funktionieren.

**Schließen:** X-Button + Backdrop + ESC alle via `$wire.close()` (Alpine → Livewire). Nach erfolgreicher Buchung: dispatch `appointment-rescheduled` → Alpine in `detail.blade.php` ruft `reloadAppointments()` auf und zeigt Erfolgsmeldung.

**Custom-Dropdown für Institut:** `<x-dropdown-glattt model="$wire.branchId">` statt nativem `<select>`. Natives `<select>` verliert `selected`-Zustand beim Teleport aus dem Livewire-DOM-Baum.

**Flatpickr für Datum:** `wire:ignore` am Wrapper verhindert, dass Livewire den Picker bei Re-Renders zerstört. Instanz in `fpInst` (im `x-data`-Scope) gespeichert; beim Öffnen via `$watch` + `$nextTick` mit `startDate` befüllt.

### Selfservice-Modul (technisch)

```
app/Models/BookingShareToken.php                  # Token-Model (gleiches Muster wie FormShareToken)
app/Livewire/Hub/Booking/BookingShareLinkModal.php # Link-Erstellen-Modal (Mitarbeiter, Kundenprofil)
app/Livewire/Shared/BookingPage.php                # Öffentliche Buchungsseite (kein Login)
app/Http/Controllers/SharedBookingController.php   # Rendert nur die Wrapper-Seite (dünn)
```

| View | Zweck |
|---|---|
| `resources/views/livewire/hub/booking/booking-share-link-modal.blade.php` | Link-Erstellen-Modal |
| `resources/views/livewire/shared/booking-page.blade.php` | Öffentliche Buchungs-UI (Livewire, volle Seite) |
| `resources/views/shared/booking-fill.blade.php` | Standalone-Wrapper (kein Hub-Layout, `noindex`) |

**`BookingShareToken`** (Tabelle `booking_share_tokens`): `token` (64 Zeichen), `mode` (`new`/`reschedule`), `client_id`, `client_name`, `client_mobile`, `branch_id`, `old_appointment_ids` (JSON, nur bei Verlegung), `current_label`, `min_date`, `only_adjacent` (bool), `service_ids` (JSON, nullable – vom Mitarbeiter beim Erstellen ausgewählte Service-IDs; `null`/leer = Fallback auf automatische Auflösung aller aktiven Pakete für Alt-Links), `expires_at`, `accessed_at`, `booked_at`, `booking_result` (JSON). Methoden analog `FormShareToken`: `generateToken()`, `isExpired()`, `isBooked()`, `isValid()`, `markAccessed()`, `markBooked()`, `getShareUrl()`.

**`BookingService::findSuggestions()`** hat einen fünften, optionalen Parameter `bool $onlyAdjacentSlots = false` bekommen (backward-kompatibel). Ist er `true`, werden `suggestionDays` und die flache `suggestions`-Liste **nach** dem Bauen gefiltert (nur `is_adjacent === true`), bevor die View-Indizes vergeben werden – dadurch bleiben Index und Anzeige konsistent, ohne die Slot-Engine selbst anzufassen.

**`App\Livewire\Shared\BookingPage`**: volle Livewire-Seite (kein Modal, kein `x-teleport` nötig). `mount(string $token)` validiert den Token direkt (nicht im Controller) und lädt bei Gültigkeit sofort Services + Slots (`try/catch`, Fehler landen als Flash-Meldung statt 500). `book(int $index)` hat eine einfache IP+Token-basierte Rate-Limit-Bremse (`RateLimiter::hit`, max. 10/Minute) gegen Missbrauch, da Livewire-Aktionen nicht über eine eigene benannte Route laufen und sich daher nicht klassisch per `throttle:`-Middleware pro Route drosseln lassen.

**WhatsApp-Versand ohne Superchat-Integration:** Bewusste, pragmatische Entscheidung – statt der Superchat-API (approved Templates, 24h-Antwortfenster) wird ein einfacher `https://wa.me/<Telefonnummer>?text=<Nachricht>`-Deep-Link gebaut (`SuperchatApiService::normalizePhone()` zur E.164-Normalisierung wiederverwendet). Funktioniert ohne Einschränkungen, WhatsApp Web/App öffnet sich mit vorausgefüllter Nachricht, der Mitarbeiter klickt final auf Senden.

**Kopieren-Button ohne HTTPS:** `navigator.clipboard` ist in unsicheren Kontexten (z.B. `http://*.local` ohne TLS, wie in der lokalen Entwicklung) `undefined`. Der „Kopieren"-Button im Link-Erstellen-Modal prüft das und nutzt als Fallback ein verstecktes `<input>` + `document.execCommand('copy')` (gleiches Muster wie in `public/js/components/form-fill.js`).

**Kalendereintrag (.ics) auf der Erfolgsseite:** `BookingPage::downloadIcs()` erzeugt beim Klick auf „Zum Kalender hinzufügen" eine `.ics`-Datei als Datei-Download (`response()->streamDownload()`). Enthalten sind `DTSTART`/`DTEND` (aus `bookedDate` + `bookedStart` + `durationMinutes`, `Europe/Berlin` → UTC konvertiert), `SUMMARY` („Termin bei {Institut}") und `LOCATION` (Institutsadresse, zusammengesetzt aus den Phorest-Branch-Feldern `streetAddress1`, `postalCode`, `city` – dabei wird eine von Phorest teils bereits im `city`-Feld vorangestellte PLZ per Regex entfernt, um keine doppelte PLZ zu erzeugen). Bewusst **keine** Service-Namen in Titel/Beschreibung. Der Dateiname enthält Datum und Uhrzeit (`termin-{Y-m-d}-{Hi}.ics`). Werte werden nach RFC 5545 escaped (Kommas, Semikolons, Backslashes, Zeilenumbrüche) – die Escape-Funktion verkettet dabei erst den Zeilenumbruch-Ersatz und escaped danach, nicht umgekehrt (früherer Bug führte sonst zu doppelten Inhalten im Kalendereintrag).

### Berechtigung

Recht `view_booking` (Migration `2026_06_28_100000_add_view_booking_permission.php`, `PermissionSeeder`, Produktiv-SQL `database/sql/booking_module_production.sql`). Zugewiesen an `super_admin`, `admin`, `user`.

### Tests

- `tests/Unit/Booking/SlotFinderServiceTest.php` – Ranking-Regeln (No-Gap-Anschluss, exakte Zeit, Raum-zuerst bis 80 %, Lücken füllen, mehrere Tage, boundary-aware Lücken-Regel).
- `tests/Unit/Booking/BookingShareTokenTest.php` – Token-Model (Gültigkeit, Ablauf, Einlösung).
- `tests/Feature/Booking/BookingServiceTest.php` – End-to-End mit gemocktem `PhorestApiService` (Slot-Findung, Buchungs-Payload mit allen Services + Desinfektion, `onlyAdjacentSlots`-Filter).
- `tests/Feature/Booking/RescheduleSlotModalTest.php` – Verlegen-Modal (Öffnen lädt Services + Slots, Buchen storniert per `cancelAppointment` und feuert `appointment-rescheduled`).
- `tests/Feature/Booking/BookingShareLinkModalTest.php` – Link-Erstellen-Modal (Token-Felder, wa.me-Link-Generierung, Service-Vorauswahl, manuelles Ab-/Zubuchen, Validierung bei leerer Auswahl).
- `tests/Feature/Booking/SharedBookingPageTest.php` – Öffentliche Buchungsseite (ungültig/abgelaufen/eingelöst, Slot-Filter, erfolgreiche Buchung markiert Token als eingelöst, `.ics`-Download enthält Ort/Dauer aber keine Servicenamen und keine doppelten Inhalte, `downloadIcs()` liefert `null` vor abgeschlossener Buchung).

```bash
php artisan test --filter Booking
```
