# Termin vorziehen — Angebot an Kundinnen mit langem Vorlauf

## Für Endanwender

Wer eine Beratung lange im Voraus gebucht hat, erscheint seltener (Vorlauf über 7 Tage: Show-Rate 44–58 %,
bis 2 Tage: 60–75 %). Deshalb bekommt jede dieser Kundinnen **genau einmal** eine WhatsApp mit einem Link,
um ihren Termin **im selben Institut** nach vorne zu legen. Der Link zeigt nur frühere Tage und gilt bis
3 Tage vor dem bisherigen Termin. Wer vorzieht, gibt den alten Termin frei — für Kundinnen, die gerade buchen.
Gesteuert wird alles im Admin unter **Verkauf → Termin vorziehen**; das Ergebnis zeigt die Karte
„Termin vorziehen“ auf „Zukünftige Beratungsgespräche“ und im Cockpit „Booking-Masterplan“.

!!! nutzerhandbuch "Bedienung: Berichte 2 – Zukünftige Beratungsgespräche"
    [https://hilfe.hub.glattt.com/berichte/2/](https://hilfe.hub.glattt.com/berichte/2/) · in der App:
    [App 14 – Berichte in der App](https://hilfe.hub.glattt.com/app/14/)

## Für Entwickler

### Absicht und Entscheidungen (Jan, 18.10.2026)

- **Kein Anlass „Slot frei geworden“** — die Lücken gibt es ohnehin. Verschickt wird täglich um 10:00 im Tageslauf
  `still-considering:daily` (ruft `earlier-offers:run` auf, kein eigener Scheduler-Job).
- **Drei Schwellen je Standort** gegen zu viele Nachrichten: gebucht mit ≥ `min_lead_days` Vorlauf (7), Termin noch
  ≥ `min_days_until` Tage entfernt (6, mindestens 4), Buchung ≥ `min_days_since_booking` Tage her (2).
- **Genau ein Angebot je Termin**, je Kundin höchstens eins in 30 Tagen — auch Kontrollgruppe und Übersprungene
  werden als Angebot gespeichert und nie erneut ausgewählt.
- **Nur reine Beratungen** (online und offline, `ReminderLinkService::pureConsultationServiceId`), keine Kombi-Termine.
- **Nur senden, wenn es wirklich einen früheren freien Slot gibt** (`WebsiteConsultationSlotService::find` ab morgen).
- **Reihenfolge:** größter möglicher Gewinn (Tage zwischen frühestem freien Slot und Termin) zuerst, bei Gleichstand
  die früher Gebuchte; **Tageslimit** je Standort (15) schützt den Kalender. Wer heute nicht dran ist, rückt morgen nach.
- **Kontrollgruppe** (`control_percent`, Start 10 %): fest nach `crc32(appointment_id) % 100`, bekommt keine Nachricht.

### Datenmodell

| Tabelle | Inhalt |
|---|---|
| `earlier_appointment_settings` | je Standort `enabled`, Superchat-Kanal/Vorlage/Platzhalter, die drei Schwellen, `daily_limit`, `control_percent` |
| `earlier_appointment_offers` | je Termin ein Angebot: `status` (`sent`, `control`, `skipped`, `failed`), `reason`, `earliest_slot_date`, `gain_days`, `token_id`, `accepted_at`, `new_appointment_id`/`_start` |
| `booking_share_tokens.max_date` | Verlege-Link zeigt nur Tage **vor** diesem Datum |

### Der Link

`BookingShareToken` mit `mode = reschedule`, `source = earlier_offer`, `consultation_service_id` (dadurch Website-Slots
und **kein Standortwechsel** — `BranchSwitchService::enabled()` schließt Beratungs-Links aus), `min_date` = morgen,
`max_date` = Tag des bisherigen Termins, `expires_at` = 3 Tage vorher, `booking_note` „Termin vorgezogen über das
Angebot vom …“. Die Grenze wirkt zentral in `RescheduleSlotFinder::limitToMaxDate()` und zusätzlich beim Buchen
(`BookingPage::book`, `SharedBookingApiController::book`); die Seite hält „Nächster Tag“ am Ende an (`maxReached`),
die API liefert `max_date` und `next_from = null`. Verschieben in Phorest ist Stornieren + Neubuchen — der alte Slot
wird frei. `markBooked()` ruft `EarlierAppointmentOfferService::acceptedFromLink()`.

### Services, Admin, Statistik

- `EarlierAppointmentOfferService` — `candidates()`, `runBranch($setting, $dryRun)`, Versand über `WhatsappTemplateSender`.
- `php artisan earlier-offers:run --dry-run [--branch=]` und Admin-Knopf **„Vorschau heute“** zeigen die Reihenfolge ohne Versand.
- Admin: Verkauf → **Termin vorziehen** (Einstellungen), **Termin vorziehen: Angebote** (Protokoll).
- Statistik `termine.earlier-offers` (Seite Zukünftige Beratungsgespräche, Cockpit): Angebote, vorgezogen,
  Kontrollgruppe, Ø gewonnene Tage, Show-Rate vergangener Termine mit Angebot gegen Kontrolle (`stats_historic_appointments`).
  CSV-Quelle `earlier-offers`, native Karte `EarlierOffersCard`.
- Tests: `EarlierAppointmentOfferTest`, `BookingCockpitStatisticsTest`.

## Changelog

- **18.10.2026** — Erste Fassung (Booking-Masterplan Welle 2, Kapazitätshebel für Hannover und Osnabrück).
