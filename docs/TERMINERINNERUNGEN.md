# Terminerinnerungen (Automatisierung)

Automatische Erinnerungen vor Terminen — per **WhatsApp** (Superchat,
Meta-Template), **SMS** (Twilio, Absender „glattt" statt Telefonnummer) oder
**E-Mail**, mit persönlichem Link zum **Bestätigen, Verlegen oder Absagen**.
Die Kanal-Reihenfolge ist je Erinnerungsstufe frei wählbar (z.B. WhatsApp →
SMS → E-Mail). Konfigurierbar je Terminart × Standort mit beliebig vielen
Erinnerungsstufen (z.B. 7 Tage und 1 Tag vorher).

## Für Endanwender

### Was passiert automatisch?

- Vor jedem gebuchten Termin prüft der Hub alle 15 Minuten, ob eine
  Erinnerung fällig ist (Regeln siehe unten). Je Termin und Stufe wird
  **genau eine** Nachricht über **genau einen** Kanal versendet — der erste
  mögliche aus der an der Stufe eingestellten **Kanal-Reihenfolge**
  (WhatsApp/SMS/E-Mail, frei sortierbar). Ist ein Kanal blockiert (kein
  Consent, keine Nummer, kein Inhalt gepflegt …) **oder schlägt der Versand
  fehl**, rückt der nächste Kanal der Reihenfolge nach; nicht aufgeführte
  Kanäle werden nie verwendet. Ohne explizite Auswahl gilt das
  Bestandsverhalten (WhatsApp bevorzugt, E-Mail-Fallback).
- Voraussetzungen je Kanal:
    - **WhatsApp**: Mobilnummer im Phorest-Profil, Einwilligung
      **„SMS-Terminerinnerung"** (Phorest-Kundenprofil), ein konfigurierter
      Superchat-Kanal des Standorts und eine von Meta genehmigte Vorlage.
    - **SMS**: Mobilnummer + Einwilligung **„SMS-Terminerinnerung"** (gleicher
      Consent wie WhatsApp), Twilio muss konfiguriert sein und die Stufe
      braucht einen SMS-Text. SMS ist freier Text — keine Meta-Freigabe nötig.
      Beim Empfänger steht **„glattt"** als Absender (Alphanumeric Sender ID)
      statt einer Telefonnummer. **Einbahnstraße**: auf diese SMS kann nicht
      geantwortet werden — Bestätigen/Verlegen/Absagen läuft ausschließlich
      über den persönlichen Link.
    - **E-Mail**: E-Mail-Adresse + Einwilligung **„E-Mail-Terminerinnerung"**.
  Ist kein Kanal möglich, wird das im Protokoll sichtbar gemacht (kein
  stilles Scheitern).
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
      mit Vorlauf, **Kanal-Reihenfolge**, WhatsApp-Vorlage +
      Variablen-Zuordnung, SMS-Text und E-Mail-Betreff/-Text mit Platzhaltern.
      Dazu je Stufe die **E-Mail-Bausteine** (eingeklappte Sektion):
      Kunden-Kasten (Name + Kundennummer oben rechts), Termin-Karte
      (Datum/Uhrzeit/Institut/Behandlung), Selfservice-Button („Termin
      verlegen oder absagen" — bewusst ohne „bestätigen"; die
      Selfservice-Seite selbst behält die Bestätigen-Option),
      Vorbereitungs-Tipps (Überschrift + Tipps als Titel/Text-Liste +
      Anruf-Abschluss; `**Sternchen**` macht fett, die Instituts-
      Telefonnummer wird automatisch zum tel:-Link), 24-Stunden-Hinweis,
      Abschluss/Gruß, Instituts-Footer und Kalender-Anhang — alle einzeln
      an-/abschaltbar, alle Texte editierbar und platzhalterfähig. Welche
      Termine welche Mail bekommen, steuert die Regel-Zuordnung (z.B.
      Vorbereitungs-Tipps nur in der Behandlungs-Regel aktivieren).
      **„Vorschau der E-Mail"** rendert den aktuellen, auch ungespeicherten
      Formularstand mit Beispieldaten im echten Versand-Template.
      **Testversand je Stufe:** „Test-E-Mail senden" (aktueller Formularstand,
      [TEST]-Betreff, inkl. Kalender-Anhang, Empfänger vorbelegt mit der
      eigenen Adresse) und „Test-SMS/RCS senden" (SMS-Text mit Beispieldaten
      an eine frei wählbare Nummer — echte SMS-Kosten; eine aktive RCS-Karte
      wird im zuletzt gespeicherten Stand genutzt, da das Content-Template
      erst beim Speichern synchronisiert). Technik:
      `app/Services/Reminders/ReminderTestSender.php`.
- **Instituts-Seite (Betrieb → Institute → Infos)** — Telefon, WhatsApp-Nummer
  und E-Mail je Standort werden dort in der Kontaktdaten-Karte gepflegt
  (Phorest kennt je Branch nur Name + Adresse; Schreibrecht wie
  Farbe/Icon/Bild). Speist den Instituts-Footer inkl. der Buttons
  **„Anrufen"** (tel:) und **„WhatsApp schreiben"** (wa.me) und die
  Platzhalter `{{institut_telefon}}`, `{{institut_whatsapp}}`,
  `{{institut_mail}}`; `{{institut_adresse}}` kommt automatisch aus Phorest.
    - **Terminerinnerungen: Kanäle** — je Standort der
      Superchat-WhatsApp-Absenderkanal („Standorte laden" legt die Zeilen an).
      Ohne WhatsApp-Kanal wird WhatsApp übersprungen. Der SMS-Versand hat
      **keine Admin-Konfiguration** — er läuft zentral über Twilio (.env,
      siehe Betrieb).
    - **Terminerinnerungen: Protokoll** — jeder Ausgang je Termin und Stufe
      (gesendet/übersprungen/fehlgeschlagen/Testmodus) mit Grund;
      „Erneut versuchen" gibt den Eintrag frei, der nächste Engine-Lauf
      entscheidet neu. Zusätzlich die Spalte **„Zustellung"** (Twilio-
      Callbacks: Zugestellt/Gelesen/Fehlgeschlagen/Nicht zugestellt) mit
      eigenem Filter — so lassen sich kaputte Kontaktdaten gezielt finden.
- **Fehlerhafte Kontaktdaten fallen aktiv auf (29.08.):** Schlägt der Versand
  auf allen Kanälen fehl (z.B. ungültige E-Mail-Adresse oder Nummer) ODER
  meldet Twilio eine als „gesendet" geführte SMS/RCS später als unzustellbar
  (Status-Callback failed/undelivered, meist falsche Handynummer), passiert
  dreierlei: Grund am Protokoll-Eintrag (inkl. Twilio-Fehlercode),
  `Log::warning` im Server-Log und eine **Hub-Benachrichtigung ans Institut**
  („Terminerinnerung fehlgeschlagen" bzw. „… nicht zustellbar") mit Kunde,
  Kontaktdaten und Termin — damit dem Kundenprofil explizit nachgegangen
  werden kann. Die Zustellfehler-Benachrichtigung feuert genau einmal je
  Protokoll-Eintrag.

### Welche Regel greift?

Je Termin greift **genau eine** Regel — die spezifischste:
Standort + Terminart schlägt Standort, Standort schlägt Terminart,
Terminart schlägt „alle". Wird ein Termin kurzfristig gebucht, sodass
mehrere Stufen gleichzeitig fällig wären, wird nur die Stufe mit dem
kleinsten Vorlauf gesendet (die anderen erscheinen als „übersprungen").

### Opt-in & Opt-out (Selfservice)

Kunden können ihre Erinnerungs-Einwilligungen jederzeit selbst verwalten —
Pflichtbaustein der Twilio-/Google-RCS-Freigabe („functional opt-in/opt-out
flow" mit öffentlich erreichbarer URL):

- **Aus jeder Nachricht heraus:** Der persönliche Link führt auf die
  Selfservice-Seite; dort gibt es die Karte **„Erinnerungs-Einstellungen"**
  (SMS/Nachricht + E-Mail an/aus, schreibt direkt nach Phorest).
- **Öffentliche Seite `/shared/erinnerungen`:** Handynummer eingeben →
  6-stelliger Bestätigungscode per SMS (Double-Opt-in) → Einstellungen
  schalten. Diese Seite ist die „hosted opt-in experience" für das
  Twilio-Registrierungsformular; das öffentliche Policy-Bild dafür liegt
  unter `/shared/reminder-optin-policy.png` (statisch in `public/shared/` —
  bewusst unter `/shared/*`, weil alles andere auf hub.glattt.com hinter IAP
  liegt). Verifizierte Nummern **ohne** Phorest-Profil (Interessenten,
  Carrier-Prüfer) schließen den Opt-in trotzdem ab: Die Einwilligung landet
  als Vormerk in `reminder_consent_optins` (Admin → „Terminerinnerungen:
  Opt-in-Vormerke"); das Büro übernimmt sie ins Kundenprofil, sobald ein
  Kunde mit der Nummer existiert, und löscht die Vormerkung. Missbrauchs-
  schutz: max. 3 Codes je Nummer bzw. 10 je IP pro Stunde, Code 10 Minuten
  gültig, 5 Fehlversuche.
- **RCS-Antworten (STOP/START/HELP):** Der Twilio-Webhook
  `POST /api/webhooks/twilio` (Signaturprüfung `X-Twilio-Signature`) schaltet
  bei STOP/STOPP den SMS-Consent in Phorest aus, bei START wieder ein und
  antwortet bei HELP/HILFE mit dem Link auf die Einstellungs-Seite —
  Webhook-URL im Twilio-Account auf den Messaging-Eingang legen.
  Freitext-Antworten werden nicht automatisch beantwortet.

Quelle bleibt immer Phorest (`smsReminderConsent`/`emailReminderConsent`);
nach jedem Update wird der Client-Cache geleert, damit Engine und
Kundenprofil sofort den neuen Stand sehen. Gemeinsame Logik:
`app/Services/Reminders/ReminderConsentService.php` (Telefon-Varianten-Suche
wie beim Superchat-Kontaktabgleich, Phorest-Update mit `version`-Locking).

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
  Kanal-Reihenfolge der Stufe (channelPriority, Default whatsapp→email) →
  je Kanal Vorab-Blocker prüfen → ReminderLinkService (frischer
  BookingShareToken, expires_at = Terminbeginn, alte Engine-Tokens
  invalidiert) → Versand über den ersten möglichen Kanal, bei Fehlschlag
  rückt der nächste nach:
  WhatsappTemplateSender (Superchat-Template) ODER TwilioSmsService (SMS mit
  Alphanumeric Sender ID, direkt an die Handynummer — kein Superchat-Kontakt)
  ODER AppointmentReminderMail (Laravel-Mail)
  → Protokoll (sent/skipped/failed/test; provider_message_id trägt Superchat-
  bzw. Twilio-Message-ID; bei Ausweichkanal steht die Fehlschlag-Kette im Grund)
```

### Zentrale Klassen & Tabellen

| Baustein | Ort |
|---|---|
| Sync | `app/Console/Commands/SyncUpcomingAppointments.php` → `upcoming_appointments` |
| Engine | `app/Services/Reminders/AppointmentReminderService.php`, `app/Console/Commands/DispatchAppointmentReminders.php` |
| Versand-Job | `app/Jobs/SendAppointmentReminderJob.php` |
| Link-Erzeugung | `app/Services/Reminders/ReminderLinkService.php` (Engine-Tokens: `created_by = null`) |
| Gemeinsame WhatsApp-Versandschicht | `app/Services/Messaging/WhatsappTemplateSender.php` (Payload/Response/`resolveBody` — vorher 3× dupliziert) |
| E-Mail | `app/Mail/AppointmentReminderMail.php` + `resources/views/emails/appointment-reminder.blade.php` — Design „Termin-Karte" (28.08.), Bausteine aus `ReminderMailComposer::compose()`; automatisches E-Mail-Protokoll |
| E-Mail-Bausteine | `appointment_reminder_stages.email_blocks` (JSON, Defaults in `AppointmentReminderStage::defaultEmailBlocks()`, Merge via `emailBlocks()`) + `app/Services/Reminders/ReminderMailComposer.php` (Versand UND Vorschau — identische Zusammenstellung; `richText()` für **fett** + tel:-Links, `buildIcs()` für den Kalender-Anhang über den ganzen Besuch OHNE Leistungsnennung); Vorschau-View `resources/views/filament/reminder-mail-preview.blade.php`; Footer-Icons `public/shared/reminder-icon-{phone,whatsapp}.png` (Migration `2026_08_28_150000`) |
| Instituts-Kontakte | `institute_contacts` (Telefon/WhatsApp/E-Mail je Branch, Cache 5 Min via `InstituteContact::dataFor()`), gepflegt auf der Instituts-Seite (`hub/institutes/tabs/info.blade.php`, Endpoints `GET/POST /phorest/institute/{branchId}/contact`, Schreibrecht `manage_branch_images`); Adresse aus `PhorestApiService::getCachedBranches()` |
| Regeln/Stufen/Kanäle/Protokoll | `appointment_reminder_rules` / `_stages` / `_settings` / `_logs` (Migration `2026_08_16_100000`) |
| SMS-Versand (Twilio) + Kanal-Reihenfolge | `app/Services/TwilioSmsService.php` (Config `services.twilio`, .env) + `appointment_reminder_stages.channel_priority`/`sms_body` (Migrationen `2026_08_27_100000` + `_120000`) |
| Filament | `app/Filament/Resources/AppointmentReminder{Rules,Settings,Logs}/` |
| Selfservice Bestätigen/Absagen | `app/Livewire/Shared/BookingPage.php` (`confirmAppointment`/`cancelAppointment`, nur bei `canRespond` = Engine-Token), `BookingService::cancelOnly()` |
| Hub-Badges | `PhorestController::appointmentReminderStatus` (`GET /phorest/appointment-reminder-status`), `public/js/appointments.js` (`fetchReminderStatus`/`renderClientResponseBadge`) |

### Entscheidungen (Jan, 11.08. + 16.08. + 27.08.2026)

- **Opt-in**: dedizierte Phorest-Felder `smsReminderConsent` /
  `emailReminderConsent` (NICHT die Marketing-Consents des Bewertungslinks,
  NICHT der Kein-Check der Beratungs-WhatsApp). WhatsApp und SMS teilen
  sich den SMS-Consent.
- **SMS über Twilio mit Alphanumeric Sender ID** (27.08.): beim Empfänger
  steht „glattt" statt einer Telefonnummer (in Deutschland dynamisch ohne
  Registrierung, Sender ID wird von den Carriern bewahrt). Ein zentraler
  Account für alle Standorte — bewusst nicht standortgebunden wie WhatsApp;
  der Standortbezug kommt über Platzhalter in den Text. Trade-off: auf die
  SMS kann nicht geantwortet werden (kein STOP, keine Inbox) — Opt-in/Opt-out
  liegt im Phorest-Consent, Reaktionen laufen über den Link. Der zunächst
  gebaute Superchat-SMS-Weg wurde noch am selben Tag wieder ersetzt
  (Migration `2026_08_27_120000`).
- **RCS als konfigurierbarer Ausbau** (27.08.): sobald ein verifizierter
  Twilio-RCS-Absender existiert (Marken-Profil mit Logo, „Überprüft von
  <Carrier>" — Verifizierung über Twilio/Google nötig), wird nur
  `TWILIO_RCS_SENDER` gesetzt: Nachrichten gehen dann als RCS raus und
  fallen bei Empfängern ohne RCS automatisch auf die SMS mit Absender
  „glattt" zurück (`FallbackFrom`). Kein Code-Änderungsbedarf.
- **RCS-Karten im Backend gestaltbar** (28.08.): je Erinnerungsstufe eine
  Rich Card — Bild-URL, Titel (Platzhalter), bis zu 2 Buttons (Verlege-Link
  oder feste URL) und bis zu 3 Antwort-Chips. Beim Speichern synchronisiert
  `AppointmentReminderStageObserver` → `SyncReminderStageRcsContentJob` die
  Karte als **Twilio-Content-Template** (`TwilioContentService`; Content-
  Ressourcen sind nicht editierbar → neu anlegen, alte SID löschen).
  Versand mit `ContentSid` + Positions-Variablen ({{1}} Titel, {{2}} Text
  ohne Link, {{3}} Buchungs-Token, {{4}} kompletter Link); SMS-Empfänger
  bekommen den `twilio/text`-Fallback des Templates. Der SMS-Text der Stufe
  ist zugleich der Kartentext — der Verlege-Link gehört dann NICHT hinein.
  Scheitert die Karte beim Versand, wird die Text-SMS versucht.
- **Zustell-/Lese-Tracking** (28.08.): jeder Twilio-Send bekommt automatisch
  `StatusCallback` auf `POST /api/webhooks/twilio/status` (signiert) —
  delivered/read landen als `delivery_status`/`delivered_at`/`read_at` am
  Erinnerungs-Protokoll (Lesebestätigungen gibt es nur bei RCS) und speisen
  die Nachrichten-Timeline der Kundenseite (siehe `CLIENT-DETAIL-MODULE.md`).
- **Kanal-Reihenfolge je Stufe** (27.08.): explizit wählbar, welcher Kanal
  zuerst und welcher Fallback ist; Ausweichen sowohl bei Vorab-Blockern als
  auch bei fehlgeschlagenem Versand (bewusste Abwägung: höhere Zustellquote
  vor Restrisiko einer Doppelzustellung bei uneindeutigen API-Fehlern).
- **Token je Stufe frisch** zum Versandzeitpunkt, ältere invalidiert —
  nie ein abgelaufener Link in einer frischen Nachricht.
- **Absage** = Rückfrage-Stufe im Modal, dann echter Phorest-Storno
  (Einzel-Storno je appointmentId) + `NotificationService::forInstitutes`.
  **Bestätigung** = nur Hub-Zustand (`upcoming_appointments.client_confirmed_at`),
  kein Rückschreiben nach Phorest; bewusst keine Benachrichtigung.
- **E-Mail** über das Bestandssystem (SMTP-Settings + zentrales Protokoll),
  kein zweites Vorlagensystem.
- **E-Mail-Design „Termin-Karte" + Baukasten** (28./29.08.): Logo-Kopf wie
  die Mahn-Mail, Anschreiben aus der Vorlage, Kunden-Kasten und Termin-Karte
  als einzige (sehr helle) Farbflächen, Buttons mit Goldkante — alle
  Dark-Mode-Erkenntnisse aus `emails/dunning-message` übernommen. Die
  Inhalte von alter Phorest-Mail und gedruckter Kundeninformation sind
  konfigurierbare Bausteine je Stufe (`email_blocks`); die Steuerung
  „welche Termine bekommen welche Mail" läuft über die Regel-Zuordnung nach
  Terminart, nicht über Automatik im Template. Vorschau im Regel-Editor
  rendert das echte Versand-Template mit dem ungespeicherten Formularstand.
  Da Phorest je Branch keine Kontaktdaten liefert, werden Telefon/WhatsApp/
  E-Mail auf der **Instituts-Seite** gepflegt (Entscheidung 29.08.: Frontend
  statt Admin-Backend).
- **Inhalts-Entscheidungen 29.08.:** Absagefrist in der Mail = **24 Stunden**
  (die 48 h stehen nur absichernd in den AGB). Vorbereitungs-Tipps ersetzen
  die separate „nicht behandelbar"-Checkliste — die Auslöser stecken im
  jeweils passenden Tipp (keine Redundanz); kuratiert aus der
  Kundeninformation, ohne Nachsorge-/Paket-Themen. Mail wirbt nur für
  **verlegen/absagen** (kein „bestätigen"; die Selfservice-Seite behält die
  Option). Echter **Opt-out-Link** im Fuß jeder Mail (persönliche
  Erinnerungs-Einstellungen) — erscheint immer, auch ohne Footer/Button.
  Kalender-Anhang **ohne Leistungsnennung** (Diskretion).

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
- **Twilio-Konfiguration** (Cloud-Run-Env bzw. `.env`): `TWILIO_ACCOUNT_SID`,
  `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_SENDER_ID` (Default `glattt`, max. 11
  Zeichen), optional `TWILIO_RCS_SENDER`. Ohne Credentials wird der SMS-Kanal
  mit klarem Grund übersprungen. Alphanumeric Sender IDs funktionieren nur
  auf bezahlten Twilio-Accounts.

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
`tests/Feature/SharedBookingResponseTest.php`,
`tests/Feature/ReminderConsentPageTest.php`,
`tests/Feature/TwilioInboundWebhookTest.php`.
