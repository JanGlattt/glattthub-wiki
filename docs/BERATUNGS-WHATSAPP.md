# Beratungs-WhatsApp (Automatisierung)

Automatische WhatsApp-Nachricht an Kunden bei ihrer **ersten Beratungsbuchung** — versendet über Superchat mit einem von Meta genehmigten WhatsApp-Template, konfigurierbar **je Standort**.

## Für Endanwender

### Einrichtung

**Admin-Panel → Integrationen → Beratungs-WhatsApp**

1. **„Standorte laden"** klicken — legt für jeden Phorest-Standort eine Konfigurationszeile an.
2. Standort bearbeiten:
    - **Automatischer Versand aktiv** einschalten
    - **WhatsApp-Kanal** wählen (die Kanäle kommen live aus Superchat — in der Regel der Kanal des Standorts)
    - **WhatsApp-Vorlage** wählen (nur von Meta genehmigte Templates des gewählten Kanals; die Vorschau zeigt den Text)
    - **Gutschein-Produkt für den Kauf-Link** wählen (optional): Grundlage für den Platzhalter „Gutschein-Kauf-Link"
    - **Platzhalter zuordnen**: Für jede Variable der Vorlage (`{{1}}`, `{{2}}`, …) den Inhalt wählen — Vorname, Nachname, vollständiger Name, Termin-Datum, Termin-Uhrzeit, Standort-Name, **Gutschein-Kauf-Link (personalisiert)** oder ein fester Text.

**Gutschein-Kauf-Link:** Ist der Platzhalter gemappt, erzeugt der Versand automatisch einen **personalisierten Kauf-Link** (`VoucherPurchaseToken`) für das gewählte Gutschein-Produkt — mit vorbefülltem Kundenprofil (Phorest-Kunde, Name, Telefon) und Standort, Kampagnen-Label „Beratungs-WhatsApp" und **gültig bis zum Tag des Beratungstermins** („Nur bis zu Deinem Termin…"). Diese Links erscheinen ganz normal in der Kauf-Link-Verwaltung des Gutschein-Verkaufs. Bei einem erneuten Versand (Retry) wird ein noch gültiger Kampagnen-Token wiederverwendet statt ein neuer erzeugt. Fehlt das Produkt, obwohl der Platzhalter gemappt ist, schlägt der Versand mit klarer Meldung im Protokoll fehl.
3. Die Status-Spalte der Übersicht zeigt, ob ein Standort vollständig konfiguriert ist („Sendet automatisch") oder noch etwas fehlt.

### Wann wird gesendet?

- **Live-Trigger (Standard):** Das Online-Buchungswidget meldet jede abgeschlossene Buchung sofort per API (`booking_trackings`) — die WhatsApp geht innerhalb von Sekunden raus, ohne auf einen Sync zu warten.
- **Auffangnetz:** Der Phorest-Sync (`sync:upcoming-consultations`, Cron) erkennt zusätzlich Beratungen, die nicht übers Widget gebucht wurden (telefonisch, direkt in Phorest). Die Dedupe je Termin verhindert Doppel-Nachrichten.
- **Optionales Zeitfenster je Standort** („Versand frühestens ab / spätestens bis"): Ist eines konfiguriert, werden Buchungen außerhalb des Fensters bis zum nächsten Fensterbeginn zurückgehalten (z.B. nächtliche Buchung → Versand am Morgen). Beide Felder leer = sofort. Fenster über Mitternacht (z.B. 21:00–08:00) werden unterstützt.
- **Nur bei der allerersten Beratung eines Kunden**: Hatte der Kunde schon einmal einen Beratungstermin (kommend oder historisch), wird übersprungen.
- Pro Termin maximal **eine** Nachricht (auch bei mehrfachen Sync-Läufen).
- Stornierte Buchungen lösen nichts aus.

### Versand-Protokoll

**Admin-Panel → Integrationen → Beratungs-WhatsApp Protokoll**

Jeder Verarbeitungsvorgang wird protokolliert:

| Status | Bedeutung |
|---|---|
| **Gesendet** (grün) | Template ging an den Kunden raus (inkl. aufgelöstem Nachrichtentext) |
| **Übersprungen** (grau) | Bewusst nicht gesendet — Grund steht dabei (z.B. „Nicht die erste Beratung") |
| **Fehlgeschlagen** (rot) | Versand nicht möglich (z.B. keine Handynummer, Superchat-Fehler) — Grund steht dabei |

Fehlgeschlagene Einträge haben eine Aktion **„Erneut versuchen"**, die den Versand für den Termin neu anstößt. Es gibt bewusst keine zusätzlichen Alarm-Benachrichtigungen — das Protokoll ist die eine Anlaufstelle.

## Für Entwickler

**Datenfluss (zwei Trigger, eine Pipeline):**

1. **Live (Widget):** `POST /api/v1/booking-trackings` → `BookingTrackingObserver::created()` (Beratungs-Service? Standort aktiv? Termin noch unbekannt?) → `RegisterConsultationBookingJob` holt die Termindetails aus Phorest (`getAppointment`) und legt die Zeile in `upcoming_consultations` an → deren Observer übernimmt. Schlägt der Phorest-Abruf dauerhaft fehl (3 Versuche, Backoff), bleibt keine halbe Zeile zurück — der Sync fängt nachts auf.
2. **Sync (Auffangnetz):** `sync:upcoming-consultations` (Cron) legt neue Zeilen in `upcoming_consultations` an (Upsert über `appointment_id` — vom Live-Trigger angelegte Zeilen werden nur aktualisiert).

Beide Wege münden in `UpcomingConsultationObserver::created()` → prüft Status (`booked`) und ob der Standort aktiviert ist → dispatcht `SendConsultationWhatsappJob` (Queue `default`).

**Job** (`app/Jobs/SendConsultationWhatsappJob.php`, `$tries = 1` — bewusst keine Auto-Retries, Wiederholung manuell übers Protokoll):

1. Guards: Termin existiert & `booked`, Setting `isReadyToSend()`, noch kein Protokoll-Eintrag (Dedupe über unique `appointment_id`).
2. **Zeitfenster**: `ConsultationWhatsappSetting::nextAllowedSendTime()` — außerhalb des Fensters dispatcht der Job sich selbst mit `delay()` auf den nächsten Fensterbeginn (deckt auch manuelle Retries ab).
3. **Erste-Beratung-Check**: andere Zeile in `upcoming_consultations` mit derselben `client_id`, Eintrag in `consultation_appointments` (Historie) oder `client_statistics.has_consultation` → übersprungen.
4. **Telefon/Name**: `client_statistics` (mobile, first/last_name), Fallback Phorest `getClient()`; Normalisierung auf E.164 (`SuperchatApiService::normalizePhone`).
5. **Superchat-Kontakt**: bestehender `SuperchatContactLink` → sonst Suche per Telefonnummer → sonst `createContact`; neuer Kontakt wird als Link (`MATCH_AUTO`) persistiert.
6. **Template-Validierung** gegen `SuperchatComposerService::whatsappTemplates($channelId)` (nur genehmigte Templates, 5 Min gecached).
7. **Gutschein-Link** (falls gemappt): `resolveVoucherLink()` — gültigen Kampagnen-Token wiederverwenden oder neuen `VoucherPurchaseToken` erzeugen (expires_at = Termintag Ende, Fallback +30 Tage); danach Variablen aus `variable_mapping` (`[{position, source, text}]`).
8. Versand `POST /messages` (`content.type = whats_app_template`) — WhatsApp-Templates dürfen außerhalb des 24h-Fensters gesendet werden, daher kein Fenster-Check nötig.
9. Jeder Ausgang landet in `consultation_whatsapp_logs` (`sent`/`skipped`/`failed` + Grund, aufgelöster Body, `superchat_message_id`).

**Datenmodell:** `consultation_whatsapp_settings` (je `branch_id`: enabled, channel_id/-name, template_id/-name, `voucher_product_id`, `send_window_start`/`send_window_end`, `variable_mapping` JSON) und `consultation_whatsapp_logs` (unique `appointment_id` = Dedupe). Platzhalter-Quellen: `ConsultationWhatsappSetting::variableSources()`.

**Admin:** `app/Filament/Resources/ConsultationWhatsappSettings/` (List mit „Standorte laden"-Sync aus `getCachedBranches()`, Edit-Form mit live nachgeladenen Kanal-/Template-Optionen) und `app/Filament/Resources/ConsultationWhatsappLogs/` (read-only, Retry-Action). Gruppe „Integrationen".

**Nachgezogene Migration:** `2026_07_11_225000_create_upcoming_consultations_table_if_missing.php` — die Tabelle existierte auf allen Umgebungen, aber nicht im Repo; die Migration ist auf Bestandsumgebungen ein No-op und versorgt Test-DB/frische Umgebungen.

**Tests:** `tests/Feature/ConsultationWhatsapp/ConsultationWhatsappAutomationTest.php` (Happy Path mit Variablen-Mapping, Zweitberatung übersprungen, fehlende Nummer, deaktivierter Standort, stornierte Buchung, Dedupe).
