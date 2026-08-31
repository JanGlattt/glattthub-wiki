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

**Gutschein-Kauf-Link:** Ist der Platzhalter gemappt, erzeugt der Versand automatisch einen **personalisierten Kauf-Link** (`VoucherPurchaseToken`) für das gewählte Gutschein-Produkt — mit vorbefülltem Kundenprofil (Phorest-Kunde, Name, **E-Mail**, Telefon) und Standort, Kampagnen-Label „Beratungs-WhatsApp" und **gültig bis zum Tag des Beratungstermins** („Nur bis zu Deinem Termin…"). Diese Links erscheinen ganz normal in der Kauf-Link-Verwaltung des Gutschein-Verkaufs. Bei einem erneuten Versand (Retry) wird ein noch gültiger Kampagnen-Token wiederverwendet statt ein neuer erzeugt. Kauft der Kunde über den Kampagnen-Link, verfällt auch das **Bonus-Guthaben des gekauften Gutscheins am Beratungstag** (festes `bonus_valid_until_date` am Bestell-Item) statt nach der Produkt-Standardfrist — Kassen-Hinweis, Phorest-Gutschein, Mail und Rechnung zeigen das Datum. Fehlt das Produkt, obwohl der Platzhalter gemappt ist, schlägt der Versand mit klarer Meldung im Protokoll fehl.
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

**Anschluss-Auswertung & automatische Gutschein-Verlängerung:** Was aus den versendeten Angeboten
wird — Annahmequote, Conversion und Vergleich der Kundengruppen — steht unter
[Gutschein-Aktion](GUTSCHEIN-AKTION.md). Dort ist auch beschrieben, wie der geschenkte Bonus-Gutschein
beim Vertragsabschluss automatisch auf sechs Monate verlängert wird und warum das Kampagnen-Kennzeichen
`Beratungs-WhatsApp` am Kauf-Token die eindeutige Erkennung liefert.

## RCS/SMS-Fallback & Zustell-Check (seit 28.08.2026)

**Für Endanwender:** Schlägt die Beratungs-WhatsApp fehl oder kommt sie nicht
an (z.B. kein WhatsApp auf dem Handy), bekommt der Kunde dieselbe Botschaft
automatisch per SMS/RCS über Twilio — Absender „glattt". Der Fallback-Text
wird je Standort im Admin gepflegt (Sektion „RCS/SMS-Fallback" der
Beratungs-WhatsApp-Einstellungen, Platzhalter inkl. `{{gutschein_link}}`);
ohne Text bleibt der Fallback für den Standort aus. Das Protokoll zeigt je
Eintrag zwei neue Badges: **Zustellung** (Zugestellt/Gelesen/Nicht
zugestellt) und **Fallback** (per SMS/RCS zugestellt, fehlgeschlagen,
übersprungen).

**Für Entwickler:**

- Sofort-Fallback in `SendConsultationWhatsappJob` bei WhatsApp-spezifischen
  Fehlschlägen (Superchat-Kontakt, Template, Versand-API) →
  `ConsultationSmsFallbackService` (Twilio, inkl. Gutschein-Link-Erzeugung
  nach demselben Muster wie der WhatsApp-Zweig).
- Zustell-Check: `CheckConsultationWhatsappDeliveryJob` (Dispatch +60 Min
  nach Versand; Queue `default`) fragt `SuperchatApiService::
  getMessageAnalytics()` ab — failed → Fallback; unklare Status
  werden bis zu 3× stündlich nachgeprüft, danach `delivery_status=unknown`.
- **Bugfix 31.08.2026:** Der Check rief seit dem Rollout einen falschen
  Superchat-Pfad auf (`GET /messages/analytics?ids=` → immer 404), wodurch
  ALLE Checks auf `unknown` liefen und der SMS-Fallback nie feuerte. Korrekt
  ist `GET /analytics/messages?message_ids=…` (wiederholte Parameter, max.
  100 IDs; NUR bare Wiederholung — `message_ids[]=` lehnt die API mit 400 ab,
  deshalb baut `getMessageAnalytics()` den Query-String selbst und
  `makeRequest()` übergibt bei leeren `$params` kein query-Argument, sonst
  verwirft Laravel den URL-Query). Die Antwort liefert `results[]` mit
  verschachtelten Timestamps (`sending_attempted/delivered/read/failed` →
  `{ timestamp }`), zentral geparst in
  `SuperchatApiService::parseMessageAnalytics()` (genutzt vom Check-Job und
  `SuperchatMessageAnalyticsService`/Nachrichten-Tab).
- Backfill & täglicher Nachprüf-Lauf: `php artisan
  consultation-whatsapp:backfill-delivery` (`--dry-run`, `--days=N`) trägt den
  Zustell-Status für Logs mit leerem/`unknown` `delivery_status` nach und
  prüft `delivered`-Zeilen auf späte Lesebestätigungen (nie Rückstufung auf
  `unknown`, kein SMS-Fallback). Läuft täglich 03:30 mit `--days=30` über
  Cloud Scheduler `recheck-whatsapp-delivery` →
  `/api/cron/recheck-whatsapp-delivery` — so bleiben die Zustelldaten aktuell,
  auch wenn der 60-Min-Check mal ausfällt. Einmaliger Prod-Backfill der 709
  Altfälle am 31.08.2026: 573 zugestellt / 74 gelesen / 59 fehlgeschlagen /
  3 unklar.
- Prod-Analyse 31.08.2026 (709 versendete Beratungs-WhatsApps seit 13.07.):
  **8,3 % scheitern bei der Zustellung** (Braunschweig 16,1 %, Bielefeld
  4,6 %). Nicht zugestellte: Show-Rate 61,8 % / Abschlussquote 42,9 % —
  Zugestellte: 72,5 % / 58,0 % (kleine Fallzahl der Failed-Gruppe beachten).
- Felder: `consultation_whatsapp_settings.sms_fallback_body`,
  `consultation_whatsapp_logs.delivery_status/delivery_checked_at/
  fallback_channel/fallback_status/fallback_reason/fallback_message_sid/
  fallback_sent_at` (Migration `2026_08_28_120000`). Max. ein
  Fallback-Versuch je Termin.
- Tests: `tests/Feature/ConsultationWhatsapp/ConsultationSmsFallbackTest.php`.
