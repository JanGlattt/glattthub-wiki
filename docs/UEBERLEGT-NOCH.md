# Überlegt noch — Anrufliste für Beratungen ohne Abschluss

## Für Endanwender

Kundinnen, deren Beratung ohne Vertrag endete („überlegt noch“, „Folgetermin“, „Sonstiges“), waren
schon im Institut, der Melaninwert ist gemessen. Die Seite **Verkauf → Überlegt noch** sammelt sie,
damit das Institut sie anruft. Nach dem Anruf gibt es drei Wege: **Link per WhatsApp** (persönlicher
Link, mit dem die Kundin sich selbst ein neues Beratungsgespräch bucht), **Termin buchen** (direkt im
Buchungsfenster) oder **Nicht erreicht** (die Kundin kommt nach drei Tagen wieder nach oben, nach drei
Versuchen fällt sie aus der Liste). Der Termin bekommt in Phorest automatisch die Notiz „Überlegt noch
— erneutes Beratungsgespräch …“, damit die Beraterin vorher weiß, wen sie vor sich hat.

Damit die Liste auch nach der Umstellung auf den Hub gefüllt bleibt, fragt **„Termin beenden“** bei
Beratungsterminen das Ergebnis der Beratung als Pflicht ab; ein Vertrag im Termin wird automatisch als
„Vertrag abgeschlossen“ erfasst.

!!! nutzerhandbuch "Bedienung: Verkauf – Überlegt noch (in Arbeit)"
    Die Klickanleitung folgt; bis dahin beschreibt dieser Abschnitt die Bedienung.

## Für Entwickler

### Absicht und Entscheidungen (Jan, 17.10.2026)

- **Keine Automatik.** Der Anruf kommt zuerst, die WhatsApp hängt am Anruf („ich schick dir gleich
  den Link“). Darum prüft der Link-Versand keine Marketing-Einwilligung — es ist eine angefragte
  Service-Nachricht (eine Zeile in `StillConsideringLinkSender::blockers()`, falls sich das ändert).
- Liste ab Beratungen vom 01.01.2026, laufend; neue Fälle zwei Tage nach dem Gespräch.
- Wiedervorlage nach „nicht erreicht“ drei Tage, Schluss nach drei Versuchen; Link sieben Tage gültig.
- Institute rufen an (Recht `manage_still_considering`, Datensichtbarkeit Standort).
- Entwurf 1 „Anrufliste mit Ergebnis-Blatt“, Web und App.

### Datenmodell

| Tabelle | Inhalt |
|---|---|
| `still_considering_cases` | je Kundin ein Fall zur letzten Beratung ohne Abschluss: `status` (`open`, `link_sent`, `booked`, `declined`, `unreachable`, `closed`), `close_reason` (`contract`, `appointment`, `new_consultation`), `attempts`, `next_call_on`, Link (`link_token_id`, `link_channel`, `link_expires_at`), Buchung (`booked_via` = `link`/`hub`/`manual`), `note_pending_since`/`note_written_at`, `contract_id` (Erfolg auch nach der Buchung) |
| `still_considering_events` | Verlauf: Ergebnis, Link, Notiz, Selbstbuchung, Abschluss, nachgetragene Notiz |
| `still_considering_settings` | je Standort Superchat-Kanal + Vorlage + Platzhalter, E-Mail-Text, `campaign_note` (Aktion für die Notiz) |
| `booking_share_tokens.booking_note` | Phorest-Notiz, die eine Selbstbuchung über den Link mitschreibt (`source = still_considering`) |

### Services und Endpunkte

- `StillConsideringService` — einzige Stelle für Anlegen/Schließen (`refresh()`, beim Laden der Seite
  höchstens alle 10 Minuten, kein Scheduler-Job), Ergebnisse, Notiz-Text (`bookingNote()`), Buchung aus
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

- **17.10.2026** — Seite „Überlegt noch“ (Web + nativ), Buchungslink, Phorest-Notiz, Admin-Vorlagen;
  Beratungsergebnis beim „Termin beenden“ (Web + App), Verkauf automatisch aus dem Vertrag.
