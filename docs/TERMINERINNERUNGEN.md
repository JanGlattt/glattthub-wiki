# Terminerinnerungen (Automatisierung)

Automatische Erinnerungen vor Terminen — per WhatsApp (Superchat, Meta-Template)
oder E-Mail-Fallback, mit persönlichem Link zum **Bestätigen, Verlegen oder
Absagen**. Konfigurierbar je Terminart × Standort mit beliebig vielen
Erinnerungsstufen (z.B. 7 Tage und 1 Tag vorher).

## Für Endanwender

### Was passiert automatisch?

- Vor jedem gebuchten Termin prüft der Hub alle 15 Minuten, ob eine
  Erinnerung fällig ist (Regeln siehe unten). Je Termin und Stufe wird
  **genau eine** Nachricht über **genau einen** Kanal versendet:
  **WhatsApp bevorzugt, E-Mail als Fallback — nie beide.**
- WhatsApp setzt voraus: Mobilnummer im Phorest-Profil, Einwilligung
  **„SMS-Terminerinnerung"** (Phorest-Kundenprofil), ein konfigurierter
  Superchat-Kanal des Standorts und eine von Meta genehmigte Vorlage.
  Sonst greift E-Mail — Voraussetzung dort: E-Mail-Adresse + Einwilligung
  **„E-Mail-Terminerinnerung"**. Ist beides nicht möglich, wird das im
  Protokoll sichtbar gemacht (kein stilles Scheitern).
- Jede Nachricht enthält einen persönlichen Link ins Selfservice-Modul.
  Der Kunde kann dort **bestätigen** (ein Klick), **verlegen** (neuen Slot
  wählen — der alte Termin wird automatisch storniert) oder **absagen**
  (mit Rückfrage-Stufe; der Termin wird sofort in Phorest storniert und das
  Institut benachrichtigt). Der Link gilt bis zum Terminbeginn; jede neue
  Erinnerungsstufe erzeugt einen frischen Link und entwertet den alten.
- Wird ein Termin storniert oder verlegt, verfallen ausstehende Erinnerungen
  automatisch; der neue Termin bekommt eigene.

### Wo sehe ich das im Hub?

- **Terminübersicht** (`/hub/appointments`): Terminkarten zeigen Badges
  „Vom Kunden bestätigt", „Vom Kunden abgesagt" bzw. „Erinnert".
- **Admin-Backend → Integrationen**:
    - **Terminerinnerungen** — Regeln anlegen: Standort (oder alle),
      Terminart (Beratung/Behandlung/Sonstige oder alle), Sendefenster
      (z.B. 09:00–20:00), Testmodus, und je Regel beliebig viele Stufen
      mit Vorlauf, WhatsApp-Vorlage + Variablen-Zuordnung und
      E-Mail-Betreff/-Text mit Platzhaltern.
    - **Terminerinnerungen: Kanäle** — je Standort der Superchat-Absenderkanal
      („Standorte laden" legt die Zeilen an). Ohne Kanal: nur E-Mail.
    - **Terminerinnerungen: Protokoll** — jeder Ausgang je Termin und Stufe
      (gesendet/übersprungen/fehlgeschlagen/Testmodus) mit Grund;
      „Erneut versuchen" gibt den Eintrag frei, der nächste Engine-Lauf
      entscheidet neu.

### Welche Regel greift?

Je Termin greift **genau eine** Regel — die spezifischste:
Standort + Terminart schlägt Standort, Standort schlägt Terminart,
Terminart schlägt „alle". Wird ein Termin kurzfristig gebucht, sodass
mehrere Stufen gleichzeitig fällig wären, wird nur die Stufe mit dem
kleinsten Vorlauf gesendet (die anderen erscheinen als „übersprungen").

### Testmodus

Regel auf „Testmodus" stellen: Der komplette Ablauf inkl. Kanalwahl läuft
und wird protokolliert (Status „Testmodus", inkl. aufgelöstem Nachrichtentext) —
es wird nichts versendet und kein Link erzeugt.

## Für Entwickler

### Datenfluss

```
sync:upcoming-appointments (15-min kurz --days=8, nachts 03:10 voll --days=35)
  Phorest → upcoming_appointments (alle Terminarten, Storno-Tracking wie
  upcoming_consultations: activationState/deleted + „verschwunden"-Erkennung,
  begrenzt auf das synchronisierte Datumsfenster)

reminders:dispatch (15-min, Minute 7/22/37/52 — nach dem Sync)
  AppointmentReminderService: Zeilen → Besuche (Kunde × Tag × Standort),
  Regelwahl (specificity), fällige Stufe, Idempotenz über
  unique(visit_key, stage_id) in appointment_reminder_logs (Status queued)
  → SendAppointmentReminderJob je Besuch × Stufe (Queue default, tries=1)

SendAppointmentReminderJob
  Storno-Recheck → PhorestApiService::getCachedClient (Consents!) →
  Kanalwahl → ReminderLinkService (frischer BookingShareToken, expires_at =
  Terminbeginn, alte Engine-Tokens invalidiert) →
  WhatsappTemplateSender (Superchat) ODER AppointmentReminderMail (Laravel-Mail)
  → Protokoll (sent/skipped/failed/test)
```

### Zentrale Klassen & Tabellen

| Baustein | Ort |
|---|---|
| Sync | `app/Console/Commands/SyncUpcomingAppointments.php` → `upcoming_appointments` |
| Engine | `app/Services/Reminders/AppointmentReminderService.php`, `app/Console/Commands/DispatchAppointmentReminders.php` |
| Versand-Job | `app/Jobs/SendAppointmentReminderJob.php` |
| Link-Erzeugung | `app/Services/Reminders/ReminderLinkService.php` (Engine-Tokens: `created_by = null`) |
| Gemeinsame WhatsApp-Versandschicht | `app/Services/Messaging/WhatsappTemplateSender.php` (Payload/Response/`resolveBody` — vorher 3× dupliziert) |
| E-Mail | `app/Mail/AppointmentReminderMail.php` + `resources/views/emails/appointment-reminder.blade.php` (Platzhalter via `strtr`, Muster `dunning_templates`; automatisches E-Mail-Protokoll) |
| Regeln/Stufen/Kanäle/Protokoll | `appointment_reminder_rules` / `_stages` / `_settings` / `_logs` (Migration `2026_08_16_100000`) |
| Filament | `app/Filament/Resources/AppointmentReminder{Rules,Settings,Logs}/` |
| Selfservice Bestätigen/Absagen | `app/Livewire/Shared/BookingPage.php` (`confirmAppointment`/`cancelAppointment`, nur bei `canRespond` = Engine-Token), `BookingService::cancelOnly()` |
| Hub-Badges | `PhorestController::appointmentReminderStatus` (`GET /phorest/appointment-reminder-status`), `public/js/appointments.js` (`fetchReminderStatus`/`renderClientResponseBadge`) |

### Entscheidungen (Jan, 11.08. + 16.08.2026)

- **Opt-in**: dedizierte Phorest-Felder `smsReminderConsent` /
  `emailReminderConsent` (NICHT die Marketing-Consents des Bewertungslinks,
  NICHT der Kein-Check der Beratungs-WhatsApp).
- **Token je Stufe frisch** zum Versandzeitpunkt, ältere invalidiert —
  nie ein abgelaufener Link in einer frischen Nachricht.
- **Absage** = Rückfrage-Stufe im Modal, dann echter Phorest-Storno
  (Einzel-Storno je appointmentId) + `NotificationService::forInstitutes`.
  **Bestätigung** = nur Hub-Zustand (`upcoming_appointments.client_confirmed_at`),
  kein Rückschreiben nach Phorest; bewusst keine Benachrichtigung.
- **E-Mail** über das Bestandssystem (SMTP-Settings + zentrales Protokoll),
  kein zweites Vorlagensystem.

### Meta-Templates (Superchat)

Superchat unterstützt WhatsApp-Templates mit **Dynamic-URL-Buttons**: Basis-URL
fest im Template, der Token kommt als positionelle Variable (Quelle
„Verlege-Token" im Variablen-Mapping — `voucher_token`-Muster der
Beratungs-WhatsApp). Versand via `POST /messages`
(`type: whats_app_template`, Variablen `{position, value}`), Freigabe-Status
per API prüfbar — die Engine sendet nur bei genehmigter Vorlage und fällt
sonst auf E-Mail zurück. Templates werden im Superchat-Postfach angelegt und
von Meta freigegeben (Kategorie **Utility**, Dauer Minuten bis ~48h).

**Vorschlag Template „Vorlauf" (z.B. 7 Tage):**

> Hallo {{1}}, dein Termin bei glattt {{2}} steht an: am {{3}} um {{4}} Uhr.
> Passt der Termin? Unten kannst du ihn bestätigen, verlegen oder absagen.
>
> Button (Dynamische URL): `https://hub.glattt.com/shared/booking/{{1}}` — „Termin verwalten"

**Vorschlag Template „Kurz vorher" (1 Tag / Termintag):**

> Hallo {{1}}, morgen ist es so weit: dein Termin bei glattt {{2}} am {{3}}
> um {{4}} Uhr. Wir freuen uns auf dich! Falls etwas dazwischenkommt,
> kannst du den Termin unten verlegen oder absagen.
>
> Button (Dynamische URL): `https://hub.glattt.com/shared/booking/{{1}}` — „Termin verwalten"

Variablen-Zuordnung im Admin: 1 = Vorname, 2 = Standort-Name, 3 = Termin-Datum,
4 = Termin-Uhrzeit; Button-Variable = „Verlege-Token".

### Betrieb

- **Cloud Scheduler** (Region `europe-west3`, `--max-retry-attempts=3`,
  Ziel `https://hub.glattt.com`, Header `X-Cron-Token`):
    - `/api/cron/sync-upcoming-appointments` alle 15 Min (Minute 4/19/34/49);
      nächtlich 03:10 zusätzlich mit Body `{"days": 35}`
    - `/api/cron/dispatch-appointment-reminders` alle 15 Min (Minute 7/22/37/52)
- Der Selfservice-Link läuft über den **öffentlichen Backend-Service ohne IAP**
  (`/shared/booking/*` ist dort bereits ausgenommen — kein neuer Pfad nötig).
- Superchat-Rate-Limit (2500 Requests/5 Min workspace-weit) wird mit
  Contact-Sync & Co. geteilt; `SuperchatApiService::makeRequest()` hat
  bewusst noch kein Retry/429-Handling — bei Skalierungsproblemen dort ansetzen.

### Bekannte Grenzen (v1)

- Sichtbarkeit der Kundenreaktion: Terminübersicht (Badges) + Admin-Protokoll;
  Terminansicht/Kundenprofil noch ohne eigene Anzeige.
- Kein lokaler Consent-Spiegel: Consents kommen live aus Phorest
  (`getCachedClient`, 10 Min Cache) — bei sehr großen Versandläufen wäre
  `getClientBatch()` der nächste Schritt.
- Erinnerungs-Zeitpunkt ist tagesbasiert (Vorlauf in Tagen + Sendefenster),
  keine Stunden-Offsets.

Tests: `tests/Unit/AppointmentReminderRuleTest.php`,
`tests/Feature/AppointmentReminderEngineTest.php`,
`tests/Feature/AppointmentReminderJobTest.php`,
`tests/Feature/SharedBookingResponseTest.php`.
