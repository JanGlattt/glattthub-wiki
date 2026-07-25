# Folgetermin & Bewertungslink (Terminansicht)

Zwei Erweiterungen der Einzel-Terminansicht, damit der Mitarbeiter beides im Behandlungsablauf erledigt, ohne das System zu wechseln: die **Folgetermin-Buchung direkt nach dem Terminabschluss** und der **manuelle Versand des Google-Bewertungslinks per WhatsApp**.

## Für Endanwender

### Folgetermin direkt planen

Nach dem Klick auf „Termin beenden" (und dem Speichern der Pflicht-Terminnotiz) öffnet sich automatisch das Fenster **„Folgetermin planen"**:

- **Terminabstand per Schnellwahl**: „in 6 Wochen", „in 8 Wochen", „in 10 Wochen" — oder eine **freie Wochenzahl** ins Feld daneben eintippen. Zusätzlich kann das Datum frei über den Kalender gewählt werden.
- Die **Slot-Suche** ist dieselbe wie im Buchungsmodul (ideale Slot-Findung): angezeigt werden die besten freien Slots ab dem gewählten Datum, inkl. Raum und „ohne Lücke"-Kennzeichnung. Gebucht werden automatisch alle aktiven Paket-Services des Kunden plus Desinfektion.
- Ein Klick auf einen Slot bucht den Termin (mit Bestätigungsabfrage) direkt nach Phorest.
- **Überspringen** ist jederzeit mit einem Klick möglich — ohne Angabe eines Grundes.
- Nach der **letzten Sitzung des Pakets** wird keine Folgeterminplanung mehr angeboten (erkannt an den Rest-Einheiten der Paket-Services dieses Termins).

### Google-Bewertungslink per WhatsApp

In der Sidebar der Terminansicht (Schnellkontakt-Block neben „Anrufen"/„E-Mail") gibt es den Button **„Bewertung"**:

- Er erscheint nur, wenn der Standort im Admin-Backend konfiguriert ist, und ist **ausgegraut**, wenn der Kunde keine Marketing-Einwilligung hat oder keine Mobilnummer hinterlegt ist — die Begründung steht im Dialog.
- **Einwilligung**: Es genügt die SMS- **oder** E-Mail-Marketing-Einwilligung aus dem Phorest-Kundenprofil. Ohne Einwilligung ist der Versand nicht möglich (auch serverseitig blockiert).
- Der Versand erfolgt **ausschließlich manuell** durch den Mitarbeiter — nie automatisch. Absender ist die WhatsApp-Nummer (Superchat-Kanal) des Instituts, in dem der Termin stattfindet; der Link führt direkt aufs Google-Bewertungsformular des Instituts.
- Wurde dem Kunden schon einmal ein Bewertungslink gesendet, zeigt der Dialog einen **„Schon gesendet am …"-Hinweis** (mit Absender). Es gibt keine harte Sperre — der Mitarbeiter entscheidet.
- Fehlgeschlagener Versand wird sofort im Dialog angezeigt. Jeder Versuch landet im **Protokoll** (Admin → Integrationen → „Bewertungs-WhatsApp Protokoll"), auswertbar je Mitarbeiter und Institut.

### Konfiguration (Admin-Backend, ohne Deployment)

Admin → Integrationen → **„Bewertungs-WhatsApp"** → „Standorte laden" → je Standort:

1. **Aktiv**-Schalter
2. **WhatsApp-Kanal** (Superchat — bestimmt die Absendernummer)
3. **WhatsApp-Vorlage** (nur von Meta genehmigte Templates des Kanals, mit Vorschau)
4. **Google-Bewertungslink** (Direktlink aufs Bewertungsformular, `https://search.google.com/local/writereview?placeid=…`)
5. **Platzhalter-Mapping** für die Template-Variablen (`{{1}}`, `{{2}}`, …): Vorname, Name, Standort, Bewertungslink oder fester Text

## Für Entwickler

### Folgetermin

- **Livewire** `App\Livewire\Hub\Booking\FollowUpBookingModal` (+ View `livewire/hub/booking/follow-up-booking-modal.blade.php`) — schlankes Buchungs-Modal im Muster des `RescheduleSlotModal`, aber `mode=new`: bucht via `BookingService::book()` (keine Stornierung). Slot-Suche über `BookingService::findSuggestions($branchId, $clientId, $startDate, $serviceIds)` — der Wochen-Schnellwahlwert wird zu `startDate = today + X Wochen`.
- Geöffnet per Livewire-Event `open-follow-up-booking` `{branchId, clientId, clientName}` aus `public/js/appointment-unified.js`: im Erfolgs-Zweig von `endSession()` ruft `offerFollowUpBooking()` den Dispatch auf.
- **Letzte-Sitzung-Logik**: Getter `followUpEligible` (appointment-unified.js) — Paket-Services des Termins via Phorest client courses (`servicesWithPackages`); wenn alle zugeordneten Pakete `remainingUnits <= 1` haben, war dies die letzte Sitzung → kein Angebot. Ohne Paket-Zuordnung wird angeboten.
- Eingebunden in `hub/appointment-unified/index.blade.php` via `@livewire('hub.booking.follow-up-booking-modal')`.

### Bewertungslink

- **Models**: `ReviewWhatsappSetting` (je Standort: Kanal, Template, `review_url`, Variablen-Mapping), `ReviewWhatsappLog` (Protokoll inkl. `user_id`/`user_name`; `lastSentFor()` für den Hinweis). Migration `2026_07_25_120000_create_review_whatsapp_tables.php`.
- **Service** `App\Services\ReviewWhatsappService`:
    - `status(clientId, branchId)` → Button-Zustand (configured/opt_in/has_phone/can_send/reason/last_sent_*)
    - `send(user, clientId, branchId, appointmentId)` → **synchroner** Versand über Superchat (`whats_app_template`, `from.channel_id` = Kanal des Standorts), damit Fehler sofort sichtbar sind; jeder Versuch wird protokolliert. Opt-in-Prüfung serverseitig (SMS- ODER E-Mail-Consent aus `PhorestApiService::getCachedClient`).
    - Superchat-Kontaktauflösung über den geteilten Trait `App\Jobs\Concerns\ResolvesSuperchatContact` (aus dem Beratungs-WhatsApp-Job extrahiert).
- **Endpoints** (`can:view_appointment_detail`): `GET /hub/review-whatsapp/status`, `POST /hub/review-whatsapp/send` (`ReviewWhatsappController`).
- **UI**: Button in `hub/appointment-unified/partials/sidebar.blade.php`, Modal `partials/review-whatsapp-modal.blade.php`, Logik in `appointment-unified.js` (`loadReviewStatus`/`sendReviewLink`).
- **Admin**: Filament-Resources `ReviewWhatsappSettings` (Konfiguration, „Standorte laden") und `ReviewWhatsappLogs` (read-only Protokoll mit Filtern Status/Standort/Mitarbeiter), Gruppe „Integrationen".
- **Tests**: `tests/Feature/ReviewWhatsappTest.php`, `tests/Feature/FollowUpBookingModalTest.php`.

### Abgrenzung

- Die geplante **Zufriedenheitsbefragung 4 Wochen nach Paketende** spielt bei 4–5 Sternen ebenfalls einen Google-Link aus. Eine Abstimmungsregel gegen Doppelansprache wird erst mit deren Umsetzung definiert — bis dahin gilt nur der „schon gesendet"-Hinweis.
- Das Versandprotokoll misst **gesendete Links**, nicht tatsächlich abgegebene Bewertungen (relevant für ein späteres Bonus-Board).
