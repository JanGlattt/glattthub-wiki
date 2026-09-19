# Folgetermin & Bewertungslink (Terminansicht)

Zwei Erweiterungen der Einzel-Terminansicht, damit die Mitarbeiterin beides im Behandlungsablauf
erledigt, ohne das System zu wechseln: die **Folgetermin-Buchung direkt nach dem Terminabschluss**
und der **manuelle Versand des Google-Bewertungslinks per WhatsApp**. Diese Seite beschreibt
Fachregeln, Konfiguration, Services, Endpunkte und Tests; die Bedienung Schritt für Schritt steht
im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Terminansicht 6 und 8 im Nutzerhandbuch"
    [Terminansicht 6 – Direkt behandeln & Termin beenden](https://hilfe.hub.glattt.com/terminansicht/6/) —
    Termin beenden mit Kasse, Folgetermin und Notiz ·
    [Terminansicht 8 – Behandlungstermin & Einstellungszettel](https://hilfe.hub.glattt.com/terminansicht/8/) —
    Behandlung beenden, Folgetermin nach der Sitzung.

    Der **Google-Bewertungslink per WhatsApp** ist im Nutzerhandbuch noch nicht beschrieben —
    Anleitung folgt in der Serie [Terminansicht](https://hilfe.hub.glattt.com/terminansicht/).
    Die Konfiguration im Admin-Backend steht in
    [Admin 4 – Erinnerungen und WhatsApp](https://hilfe.hub.glattt.com/admin/4/) (Bewertungsanfragen).

## Für Anwender — Überblick

**Folgetermin direkt planen.** Nach „Termin beenden" (Kasse, ggf. Direkt behandeln, Pflicht-Notiz)
öffnet sich automatisch „Folgetermin planen": Terminabstand per Schnellwahl (6/8/10 Wochen oder
freie Wochenzahl) oder freies Datum, dann dieselbe Slot-Suche wie im Buchungsmodul (ideale Slots
im richtigen Raum, ohne Lücke), ein Klick bucht nach Phorest. Überspringen geht jederzeit ohne
Begründung. Nach der letzten Sitzung eines Pakets wird kein Folgetermin mehr angeboten.

**Google-Bewertungslink per WhatsApp.** In der Sidebar der Terminansicht (Schnellkontakt neben
„Anrufen"/„E-Mail") schickt der Button „Bewertung" der Kundin den Direktlink auf das
Google-Bewertungsformular des Instituts — **ausschließlich manuell**, nie automatisch, vom
WhatsApp-Kanal des Instituts, in dem der Termin stattfindet. Voraussetzung ist eine
Marketing-Einwilligung (SMS oder E-Mail) und eine Mobilnummer im Phorest-Profil; sonst ist der
Button ausgegraut und nennt den Grund. Wurde schon einmal ein Link gesendet, weist der Dialog
darauf hin — die Mitarbeiterin entscheidet, eine Sperre gibt es nicht. Jeder Versuch landet im
Protokoll (Admin → Integrationen → „Bewertungs-WhatsApp Protokoll").

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Termin beenden, Folgetermin planen oder überspringen | Terminansicht 6 |
| Behandlung beenden, Folgetermin nach der Sitzung | Terminansicht 8 |
| Bewertungslink per WhatsApp senden | Anleitung folgt — Serien-Übersicht [Terminansicht](https://hilfe.hub.glattt.com/terminansicht/) |
| Bewertungs-WhatsApp je Standort konfigurieren, Protokoll lesen | Admin 4 |

## Für Entwickler

### Fachregeln

**Folgetermin:**

- Angeboten nach dem Speichern der Pflicht-Terminnotiz beim Beenden (im geführten Ablauf Kasse →
  Folgetermin → Notiz, siehe `APPOINTMENT-VIEW.md`); nach „Direkt behandeln" entfällt die Frage.
- Terminabstand per Schnellwahl „in 6/8/10 Wochen" oder freie Wochenzahl → `startDate = heute + X Wochen`;
  zusätzlich freies Datum über den Kalender.
- Slot-Suche identisch zum Buchungsmodul (`TERMIN-BUCHUNG-IDEAL-SLOT.md`): beste freie Slots ab dem
  gewählten Datum inkl. Raum und „ohne Lücke"-Kennzeichnung; gebucht werden automatisch alle aktiven
  Paket-Services des Kunden plus Desinfektion. Ein Klick auf einen Slot bucht (mit Bestätigungsabfrage)
  direkt nach Phorest.
- **Überspringen** jederzeit mit einem Klick, ohne Grund.
- **Letzte Sitzung des Pakets:** kein Angebot (erkannt an den Rest-Einheiten der Paket-Services dieses
  Termins).

**Bewertungslink:**

- Button nur, wenn der Standort im Admin-Backend konfiguriert ist; **ausgegraut** ohne
  Marketing-Einwilligung oder ohne Mobilnummer — die Begründung steht im Dialog.
- **Einwilligung:** SMS- **oder** E-Mail-Marketing-Einwilligung aus dem Phorest-Kundenprofil genügt.
  Ohne Einwilligung kein Versand (auch serverseitig blockiert).
- Versand **ausschließlich manuell** durch die Mitarbeiterin — nie automatisch. Absender ist die
  WhatsApp-Nummer (Superchat-Kanal) des Instituts, in dem der Termin stattfindet; der Link führt direkt
  aufs Google-Bewertungsformular des Instituts.
- Wurde dem Kunden schon einmal ein Bewertungslink gesendet, zeigt der Dialog einen
  **„Schon gesendet am …"-Hinweis** (mit Absender). Keine harte Sperre — die Mitarbeiterin entscheidet.
- Fehlgeschlagener Versand wird sofort im Dialog angezeigt. Jeder Versuch landet im **Protokoll**
  (Admin → Integrationen → „Bewertungs-WhatsApp Protokoll"), auswertbar je Mitarbeiter und Institut.

### Konfiguration (Admin-Backend, ohne Deployment)

Admin → Integrationen → **„Bewertungs-WhatsApp"** → „Standorte laden" → je Standort:

1. **Aktiv**-Schalter
2. **WhatsApp-Kanal** (Superchat — bestimmt die Absendernummer)
3. **WhatsApp-Vorlage** (nur von Meta genehmigte Templates des Kanals, mit Vorschau)
4. **Google-Bewertungslink** (Direktlink aufs Bewertungsformular, `https://search.google.com/local/writereview?placeid=…`)
5. **Platzhalter-Mapping** für die Template-Variablen (`{{1}}`, `{{2}}`, …): Vorname, Name, Standort, Bewertungslink oder fester Text

### Folgetermin

- **Livewire** `App\Livewire\Hub\Booking\FollowUpBookingModal` (+ View `livewire/hub/booking/follow-up-booking-modal.blade.php`) — schlankes Buchungs-Modal im Muster des `RescheduleSlotModal`, aber `mode=new`: bucht via `BookingService::book()` (keine Stornierung). Slot-Suche über `BookingService::findSuggestions($branchId, $clientId, $startDate, $serviceIds)` — der Wochen-Schnellwahlwert wird zu `startDate = today + X Wochen`.
- Geöffnet per Livewire-Event `open-follow-up-booking` `{branchId, clientId, clientName}` aus `public/js/appointment-unified.js`: im Erfolgs-Zweig von `endSession()` ruft `offerFollowUpBooking()` den Dispatch auf. Das Schliessen des Modals dispatcht `follow-up-booking-closed` (nächster Schritt des Beenden-Ablaufs).
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
- Der Bewertungslink hat nichts mit dem Teilen-Link für Formulare zu tun (`SHARED-FORM-SYSTEM.md`) und nichts mit dem Self-Service-Buchungslink (`TERMIN-BUCHUNG-IDEAL-SLOT.md`).

## Verwandte Dokumentation

- [APPOINTMENT-VIEW.md](APPOINTMENT-VIEW.md) — Terminansicht, geführter Beenden-Ablauf
- [TERMIN-BUCHUNG-IDEAL-SLOT.md](TERMIN-BUCHUNG-IDEAL-SLOT.md) — Slot-Engine, Buchungsmodul
- [BERATUNGS-WHATSAPP.md](BERATUNGS-WHATSAPP.md) — Superchat-Templates und Kontaktauflösung
