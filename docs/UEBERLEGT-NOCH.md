# Überlegt noch — Anrufliste für Beratungen ohne Abschluss, verpasste Termine und Reaktivierung

## Für Endanwender

Kundinnen, deren Beratung ohne Vertrag endete („überlegt noch“, „Folgetermin“, „Sonstiges“), waren
schon im Institut, der Melaninwert ist gemessen. Die Seite **Verkauf → Überlegt noch** sammelt sie,
damit das Institut sie anruft. Nach dem Anruf gibt es drei Wege: **Link per WhatsApp** (persönlicher
Link, mit dem die Kundin sich selbst ein neues Beratungsgespräch bucht), **Termin buchen** (direkt im
Buchungsfenster) oder **Nicht erreicht** (die Kundin kommt nach drei Tagen wieder nach oben, nach drei
Versuchen fällt sie aus der Liste). Der Termin bekommt in Phorest automatisch die Notiz „Überlegt noch
— erneutes Beratungsgespräch …“, damit die Beraterin vorher weiß, wen sie vor sich hat.

Seit dem 18.10.2026 stehen zwei weitere Gründe in derselben Liste. **Termin verpasst:** Wer zu einer
Beratung nicht erschienen ist, bekommt am nächsten Tag um 10 Uhr automatisch eine WhatsApp mit einem Link
für einen neuen Termin; bucht sie nicht, steht sie zwei Tage später zum Anrufen ganz oben (roter Chip).
**Reaktivierung:** Kundinnen mit einer Beratung im Vorjahr ohne Vertrag stehen in einem eigenen Reiter —
nur an freigegebenen Standorten und nur mit Werbeeinwilligung. Dort wird nicht angerufen, sondern
angekreuzt und der Link an die Auswahl geschickt.

Damit die Liste auch nach der Umstellung auf den Hub gefüllt bleibt, fragt **„Termin beenden“** bei
Beratungsterminen das Ergebnis der Beratung als Pflicht ab; ein Vertrag im Termin wird automatisch als
„Vertrag abgeschlossen“ erfasst.

!!! nutzerhandbuch "Bedienung: Verkauf 5 – Überlegt noch"
    [https://hilfe.hub.glattt.com/verkauf/5/](https://hilfe.hub.glattt.com/verkauf/5/) · in der App:
    [App 27 – Überlegt noch in der App](https://hilfe.hub.glattt.com/app/27/) · Ergebnis beim Beenden:
    [Terminansicht 6](https://hilfe.hub.glattt.com/terminansicht/6/)

## Für Entwickler

### Absicht und Entscheidungen (Jan, 17.10.2026)

- **Keine Automatik.** Der Anruf kommt zuerst, die WhatsApp hängt am Anruf („ich schick dir gleich
  den Link“). Darum prüft der Link-Versand keine Marketing-Einwilligung — es ist eine angefragte
  Service-Nachricht (eine Zeile in `StillConsideringLinkSender::blockers()`, falls sich das ändert).
- Liste ab Beratungen vom 01.01.2026, laufend; neue Fälle zwei Tage nach dem Gespräch.
- Wiedervorlage nach „nicht erreicht“ drei Tage, Schluss nach drei Versuchen; Link sieben Tage gültig.
- Institute rufen an (Recht `manage_still_considering`, Datensichtbarkeit Standort).
- Entwurf 1 „Anrufliste mit Ergebnis-Blatt“, Web und App.

### Welle 2: Termin verpasst und Reaktivierung (Jan, 18.10.2026)

Entwurf 1 „Ein Stapel, Grund als Chip“: `still_considering_cases.reason` = `considering` | `missed` |
`reactivation`; Fälle ohne Beratungsprotokoll tragen statt `consultation_record_id` den Phorest-Termin
(`source_appointment_id`). Je Kundin gibt es höchstens einen laufenden Fall, egal aus welchem Grund.

**Termin verpasst** (`StillConsideringService::createMissedCases()`): Beratungs-Service in
`stats_historic_appointments` der letzten drei Tage mit `state = BOOKED` und `activation_state = ACTIVE`.
Ausgeschlossen, weil die Kundin da war oder selbst abgesagt hat: Start im Hub (`appointment_session_logs`),
Beratungsergebnis zum Termin, Selfservice-Absage (`upcoming_appointments.client_cancelled_at` — die Absage
verschiebt nur in die Absage-Spalte, der Termin bleibt aktiv), jeder andere wahrgenommene Termin der Kundin
ab dem Tag (`CHECKED_IN`/`PAID`, etwa die Behandlung bei Beratung + Behandlung), Vertrag, offener Termin.

!!! note "Online und offline zählen gleich"
    Unterschieden wird über die beiden Beratungs-Services (`consultation_services.is_online`: „Nur gratis
    Beratungsgespräch“ online, „..Beratungsgespräch“ offline) — nie über die Phorest-Quelle (Jan,
    18.10.2026). Der Fall trägt `booking_source` = `online`/`offline`, die Phorest-Notiz nennt
    „Online-Beratung“ bzw. „Offline-Beratung“.

Der Tageslauf `still-considering:daily` (10:00, Cron `/api/cron/still-considering-daily`) schickt an
Standorten mit „Automatisch nachfassen“ (`missed_enabled`) für Termine von gestern/vorgestern den Link
(`StillConsideringLinkSender::sendAutomatic()`): WhatsApp-Vorlage „Termin verpasst“, sonst E-Mail. Der Fall
bleibt `open` mit `next_call_on` in zwei Tagen; geht nichts raus oder ist das Nachfassen aus, ist er sofort
fällig. Die Phorest-Notiz beginnt mit „Termin verpasst — neues Beratungsgespräch …“.

**Reaktivierung** (`createReactivationCases()`): letzte wahrgenommene Beratung 2025, danach kein Termin,
nie ein Vertrag (jeder Status), nichts gebucht — nur für freigegebene Standorte (`reactivation_enabled`,
Wellen). Die Werbeeinwilligung (WhatsApp = `smsMarketingConsent`, E-Mail = `emailMarketingConsent`) prüft
`CheckStillConsideringConsentJob` je Fall in Phorest (`consent_*`) — `client_statistics` führt sie nicht.
Sichtbar ist nur, wer eingewilligt hat oder noch geprüft wird. Versand gesammelt über
`POST hub/ueberlegt-noch/reaktivierung/senden` (höchstens 50, je Fall `SendStillConsideringLinkJob`,
Einwilligung vor jeder Nachricht live).

### Datenmodell

| Tabelle | Inhalt |
|---|---|
| `still_considering_cases` | je Kundin ein Fall zur letzten Beratung ohne Abschluss: `status` (`open`, `link_sent`, `booked`, `declined`, `unreachable`, `closed`), `close_reason` (`contract`, `appointment`, `new_consultation`), `attempts`, `next_call_on`, Link (`link_token_id`, `link_channel`, `link_expires_at`), Buchung (`booked_via` = `link`/`hub`/`manual`), `note_pending_since`/`note_written_at`, `contract_id` (Erfolg auch nach der Buchung) |
| `still_considering_events` | Verlauf: Ergebnis, Link, Notiz, Selbstbuchung, Abschluss, nachgetragene Notiz |
| `still_considering_settings` | je Standort Superchat-Kanal + Vorlage + Platzhalter, E-Mail-Text, `campaign_note` (Aktion für die Notiz); seit Welle 2 je Grund `missed_*` / `reactivation_*` (Schalter, Vorlage, Platzhalter, E-Mail) |
| `booking_share_tokens.booking_note` | Phorest-Notiz, die eine Selbstbuchung über den Link mitschreibt (`source = still_considering`) |

### Services und Endpunkte

- `StillConsideringService` — einzige Stelle für Anlegen/Schließen (`refresh()`, beim Laden der Seite
  höchstens alle 10 Minuten, dazu der Tageslauf um 10:00), Ergebnisse, Notiz-Text (`bookingNote()`), Buchung aus
  Hub (`bookedFromHub`) und Link (`bookedFromLink`, aus `BookingShareToken::markBooked()`),
  `writePendingNotes()` (läuft nach jedem `sync:upcoming-appointments`).
- `StillConsideringLinkSender` — Token (Modus `new`, Beratungs-Service des Standorts, Slots wie auf der
  Website), WhatsApp-Vorlage über `WhatsappTemplateSender`, E-Mail `StillConsideringLinkMail`.
- Web und App (`hub/ueberlegt-noch/…`, Gate `manage_still_considering`): `data` (`?refresh=1`),
  `{case}/ergebnis` (`booked|unreachable|declined`), `{case}/notiz`, `{case}/link` (`whatsapp|email`),
  `{case}/kanaele`, `{case}/wieder-oeffnen`.
- Buchung aus der Liste: `hub/booking/api/book` mit `still_considering_case_id` — Notiz davor, Fall
  abgehakt. Web öffnet das Buchungsfenster der Terminübersicht per `open-appointment-booking` mit
  Vorauswahl; die App den Slot-Finder mit `BookingTarget.stillConsideringCaseId`. Beide bieten
  „Termin an anderem Gerät bereits gebucht“ (Ergebnis `booked`, Notiz wird nachgeschrieben).

### Beratungsergebnis beim Termin-Ende

`AppointmentConsultationOutcome` entscheidet: Termin mit aktivem Beratungs-Service (auch Beratung +
Behandlung) → ohne Vertrag Pflichtauswahl aus vier Optionen, mit Vertrag (Formular-Einreichung am Termin
→ `contracts.form_submission_id`) automatisch `contract_signed` (Zahlungsart, Ganzkörper aus dem Vertrag),
schon erfasst → keine Frage. Status: `GET /phorest/appointment/{b}/{a}/consultation-outcome`; gespeichert
wird über den Notiz-Endpunkt (`consultation_outcome`). Die Terminnotiz ist die Notiz des Ergebnisses,
`EnsurePhorestAppointmentNoteJob` wacht wie auf der Institutsseite.

!!! warning "Ältere App-Builds"
    Die Pflicht greift nur mit `consultation_outcome_supported: true` (Web und App ab dem Build mit der
    Frage). Ältere Builds beenden weiter ohne Frage — erst `IOS_APP_MIN_VERSION` anheben, bevor das
    serverseitig erzwungen wird.

### Relevante Dateien

`app/Services/StillConsidering/*`, `app/Services/Consultation/AppointmentConsultationOutcome.php`,
`app/Http/Controllers/StillConsideringController.php`, `resources/views/hub/still-considering/*`,
`public/js/still-considering.js`, Admin `app/Filament/Resources/StillConsideringSettings/*`,
iOS `glatttHub/StillConsidering/*`, Tests `StillConsideringTest`, `AppointmentConsultationOutcomeTest`,
`StillConsideringSnapshotTests`.

## Changelog

- **18.10.2026** — Welle 2: „Termin verpasst“ (automatische WhatsApp am Folgetag, nach zwei Tagen
  anrufen) und Reiter „Reaktivierung“ (Einwilligung, Sammelversand), Web und App; Tageslauf 10:00.
- **17.10.2026** — Seite „Überlegt noch“ (Web + nativ), Buchungslink, Phorest-Notiz, Admin-Vorlagen;
  Beratungsergebnis beim „Termin beenden“ (Web + App), Verkauf automatisch aus dem Vertrag.
