# Beratungs-WhatsApp (Automatisierung)

Automatische WhatsApp-Nachricht an Kunden bei ihrer **ersten Beratungsbuchung** — versendet über
Superchat mit einem von Meta genehmigten WhatsApp-Template, konfigurierbar **je Standort**, mit
optionalem personalisiertem Gutschein-Kauf-Link und SMS/RCS-Fallback über Twilio. Diese Seite
beschreibt **Auslöser, Fachregeln, Datenmodell, Job-Kette und Fallstricke**; die Bedienung im
Admin-Panel steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Admin 4 – Erinnerungen und WhatsApp"
    [hilfe.hub.glattt.com/admin/4/](https://hilfe.hub.glattt.com/admin/4/) — Beratungs-WhatsApp je
    Standort einrichten (Kanal, Vorlage, Platzhalter), Protokolle lesen und Fehlversuche wiederholen.

    Angrenzend: [Admin 3 – Gutschein-Verkauf](https://hilfe.hub.glattt.com/admin/3/) (Gutschein-Produkt
    hinter dem Kauf-Link) und [Berichte 12 – Gutschein-Aktion](https://hilfe.hub.glattt.com/berichte/12/)
    (was aus den versendeten Angeboten wird).

---

## Für Anwender — Überblick

**Was die Automatisierung leistet.** Bucht eine Kundin zum ersten Mal ein Beratungsgespräch,
schickt der Hub ihr ohne Zutun eine WhatsApp — Begrüßung, Termindaten und auf Wunsch ein nur bis
zum Termintag gültiges Gutschein-Angebot. Eingerichtet wird das je Standort im Admin-Panel
(Kanal, genehmigte Meta-Vorlage, Belegung der Platzhalter, optionales Versandfenster); das
Protokoll zeigt für jeden Termin, ob gesendet, bewusst übersprungen oder fehlgeschlagen wurde,
und lässt Fehlversuche wiederholen.

**Grundsätze, die überall gelten:**

- **Nur die allererste Beratung eines Kunden** löst eine Nachricht aus, und **höchstens eine
  Nachricht je Termin** — auch bei mehrfachen Sync-Läufen.
- **Der Versand hängt nicht am nächtlichen Sync:** Buchungen über das Online-Widget gehen
  innerhalb von Sekunden raus, der Phorest-Sync ist nur das Auffangnetz für telefonische Buchungen.
- **Ein Standort sendet erst, wenn er vollständig konfiguriert ist** (aktiv, Kanal, genehmigte
  Vorlage, alle Platzhalter belegt) — die Status-Spalte der Übersicht sagt, was fehlt.
- **Kommt die WhatsApp nicht an,** geht dieselbe Botschaft automatisch per SMS/RCS raus — sofern
  für den Standort ein Fallback-Text gepflegt ist.
- **Hat die Kundin kein WhatsApp,** schickt das Institut den Gutschein-Link auf Knopfdruck
  **per E-Mail** — aus der Kundenakte (Reiter „Nachrichten“) oder aus der Terminansicht des
  Beratungstermins, Web und App. Derselbe persönliche Link, Adresse aus Phorest (im Dialog
  änderbar), kein automatischer Versand — die Mitarbeiterin entscheidet.
- **Das Protokoll ist die einzige Anlaufstelle.** Es gibt bewusst keine zusätzlichen Alarm-Mails.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Standorte laden, Kanal, Vorlage und Platzhalter einrichten | Admin 4 |
| Versandfenster und SMS/RCS-Fallback-Text pflegen | Admin 4 |
| Protokoll lesen, Fehlversuch wiederholen | Admin 4 |
| Gutschein-Link per E-Mail schicken (Kundin ohne WhatsApp) | Kundenverwaltung 5, Terminansicht 1 |
| E-Mail-Text je Standort pflegen | Admin 4 |
| Gutschein-Produkt hinter dem Kauf-Link pflegen | Admin 3 |
| Wirkung der Aktion auswerten | Berichte 12 |

---

## Für Entwickler

### Konfiguration je Standort (Fachregeln)

Eine Zeile je Phorest-Standort (`consultation_whatsapp_settings`), angelegt über
„Standorte laden" im Admin-Panel:

- **Automatischer Versand aktiv** — ohne Häkchen passiert nichts.
- **WhatsApp-Kanal** — live aus Superchat geladen, in der Regel der Kanal des Standorts.
- **WhatsApp-Vorlage** — nur von Meta genehmigte Templates des gewählten Kanals.
- **Gutschein-Produkt für den Kauf-Link** (optional) — Grundlage des Platzhalters
  „Gutschein-Kauf-Link".
- **Platzhalter-Zuordnung** — je Variable der Vorlage (`{{1}}`, `{{2}}`, …) eine Quelle:
  Vorname, Nachname, vollständiger Name, Termin-Datum, Termin-Uhrzeit, Wochentag des Termins
  (seit 13.10.2026), Standort-Name, Gutschein-Kauf-Link (personalisiert) oder fester Text
  (`ConsultationWhatsappSetting::variableSources()`).
- **Versandfenster** („frühestens ab / spätestens bis", optional) — hält Buchungen außerhalb des
  Fensters zurück, siehe [Wann gesendet wird](#wann-gesendet-wird).
- **Status „Sendet automatisch"** setzt voraus, dass alles davon vollständig ist
  (`isReadyToSend()`).

**Gutschein-Kauf-Link:** Ist der Platzhalter gemappt, erzeugt der Versand automatisch einen
**personalisierten Kauf-Link** (`VoucherPurchaseToken`) für das gewählte Gutschein-Produkt — mit
vorbefülltem Kundenprofil (Phorest-Kunde, Name, **E-Mail**, Telefon) und Standort, Kampagnen-Label
„Beratungs-WhatsApp" und **gültig bis zum Tag des Beratungstermins** („Nur bis zu Deinem Termin…").
Diese Links erscheinen ganz normal in der Kauf-Link-Verwaltung des Gutschein-Verkaufs. Bei einem
erneuten Versand (Retry) wird ein noch gültiger Kampagnen-Token wiederverwendet statt ein neuer
erzeugt. Kauft der Kunde über den Kampagnen-Link, verfällt auch das **Bonus-Guthaben des gekauften
Gutscheins am Beratungstag** (festes `bonus_valid_until_date` am Bestell-Item) statt nach der
Produkt-Standardfrist — Kassen-Hinweis, Phorest-Gutschein, Mail und Rechnung zeigen das Datum.
Fehlt das Produkt, obwohl der Platzhalter gemappt ist, schlägt der Versand mit klarer Meldung im
Protokoll fehl.

**Weiter in der Erinnerung am Vortag (seit 13.10.2026):** Die
[Terminerinnerung](TERMINERINNERUNGEN.md#beratungstermine-gutschein-angebot-und-schonfrist-seit-13102026)
verwendet denselben Kauf-Link wieder, solange er offen ist, und sonst eine Vorlage ohne Gutschein.
Wird die Beratung verschoben, verlängert der `UpcomingConsultationObserver` offene Angebote bis zum
neuen Termintag (`ConsultationVoucherOfferService`) — „gilt bis zu Deinem Termin“ bleibt wahr.
Innerhalb von 12 Stunden nach dieser Nachricht geht keine Erinnerung raus.

**Vorschlag Nachricht nach Buchung (No-Show-Strecke, Jan 13.10.2026):**

> Hey {{1}} 👋 hier ist Olivia von glattt {{2}}. Dein Termin steht, ich hab mir {{3}}, den {{4}}
> um {{5}} Uhr ganz für Dich freigehalten ✨ … Kleines Dankeschön für Deine Buchung: bis zu Deinem
> Termin kannst Du Dir einen 50 € Gutschein für nur 10 € sichern … 👉 {{6}} … Bis {{3}}!

Zuordnung: 1 = Vorname, 2 = Standort-Name, 3 = Wochentag, 4 = Termin-Datum, 5 = Termin-Uhrzeit,
6 = Gutschein-Kauf-Link.

### Wann gesendet wird

- **Live-Trigger (Standard):** Das Online-Buchungswidget meldet jede abgeschlossene Buchung sofort per API (`booking_trackings`) — die WhatsApp geht innerhalb von Sekunden raus, ohne auf einen Sync zu warten.
- **Auffangnetz:** Der Phorest-Sync (`sync:upcoming-consultations`, Cron) erkennt zusätzlich Beratungen, die nicht übers Widget gebucht wurden (telefonisch, direkt in Phorest). Die Dedupe je Termin verhindert Doppel-Nachrichten.
- **Optionales Zeitfenster je Standort** („Versand frühestens ab / spätestens bis"): Ist eines konfiguriert, werden Buchungen außerhalb des Fensters bis zum nächsten Fensterbeginn zurückgehalten (z.B. nächtliche Buchung → Versand am Morgen). Beide Felder leer = sofort. Fenster über Mitternacht (z.B. 21:00–08:00) werden unterstützt.
- **Nur bei der allerersten Beratung eines Kunden**: Hatte der Kunde schon einmal einen Beratungstermin (kommend oder historisch), wird übersprungen.
- Pro Termin maximal **eine** Nachricht (auch bei mehrfachen Sync-Läufen).
- Stornierte Buchungen lösen nichts aus.

### Versand-Protokoll

Filament-Resource „Beratungs-WhatsApp Protokoll" (Gruppe „Integrationen"), Quelle
`consultation_whatsapp_logs` — jeder Verarbeitungsvorgang wird protokolliert:

| Status | Bedeutung |
|---|---|
| **Gesendet** (grün) | Template ging an den Kunden raus (inkl. aufgelöstem Nachrichtentext) |
| **Übersprungen** (grau) | Bewusst nicht gesendet — Grund steht dabei (z.B. „Nicht die erste Beratung") |
| **Fehlgeschlagen** (rot) | Versand nicht möglich (z.B. keine Handynummer, Superchat-Fehler) — Grund steht dabei |

Fehlgeschlagene Einträge haben eine Aktion **„Erneut versuchen"**, die den Versand für den Termin neu anstößt. Es gibt bewusst keine zusätzlichen Alarm-Benachrichtigungen — das Protokoll ist die eine Anlaufstelle.

### Datenfluss & Job-Kette

**Zwei Trigger, eine Pipeline:**

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


### RCS/SMS-Fallback & Zustell-Check (seit 28.08.2026)

**Fachlich:** Schlägt die Beratungs-WhatsApp fehl oder kommt sie nicht
an (z.B. kein WhatsApp auf dem Handy), bekommt der Kunde dieselbe Botschaft
automatisch per SMS/RCS über Twilio — Absender „glattt". Der Fallback-Text
wird je Standort im Admin gepflegt (Sektion „RCS/SMS-Fallback" der
Beratungs-WhatsApp-Einstellungen, Platzhalter inkl. `{{gutschein_link}}`);
ohne Text bleibt der Fallback für den Standort aus. Das Protokoll zeigt je
Eintrag zwei neue Badges: **Zustellung** (Zugestellt/Gelesen/Nicht
zugestellt) und **Fallback** (per SMS/RCS zugestellt, fehlgeschlagen,
übersprungen).

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

### Gutschein-Link per E-Mail — „Mail statt WhatsApp“ (seit 24.10.2026)

**Fachlich (Janine, 28.09.2026; Entscheidung Jan, 24.10.2026):** Eine Kundin ohne WhatsApp
konnte sich den „10 für 50 €“-Gutschein nicht sichern. Jetzt schickt das Institut denselben
personalisierten Gutschein-Link per Knopf **„Gutschein-Link per E-Mail“** — in der Kundenakte
(Reiter „Nachrichten“, Kopf der Karte „Automatisch versendete Nachrichten“) und in der
Terminansicht des Beratungstermins (Seitenspalte, unter dem begleiteten Beratungsgespräch),
Web und App. Der Dialog zeigt Beratungstermin, Stand der Beratungs-WhatsApp (gesendet,
zugestellt, fehlgeschlagen) und den letzten E-Mail-Versand; die Adresse kommt aus Phorest
und ist im Dialog änderbar (wird **nicht** nach Phorest geschrieben). Bewusst **kein
automatischer Versand** bei Zustellfehler der WhatsApp — die Mitarbeiterin entscheidet.

- **Ein Link je Kundin und Kampagne:** `App\Services\Messaging\ConsultationVoucherLink::resolve()`
  ist seit 24.10.2026 die einzige Stelle, die den Gutschein-Token erzeugt bzw. wiederverwendet —
  WhatsApp-Job, SMS-Fallback und E-Mail nutzen sie. Gültig bis zum Beratungstermin, Kampagnen-Label
  `Beratungs-WhatsApp` (die Auswertung der Aktion zählt die E-Mail-Links damit mit).
- **Service `ConsultationVoucherMailService`:** `state(clientId, appointmentId?)` liefert den
  Zustand für den Knopf (verfügbar nur mit bekanntem Beratungstermin — Kundenakte: nächster
  gebuchter, sonst jüngster — und aktivem Gutschein-Produkt am Standort-Setting), `send(...)`
  verschickt `ConsultationVoucherLinkMail` (Aufbau wie `still-considering-link`, Knopf „Gutschein
  sichern“) über die zentralen E-Mail-Einstellungen → landet im E-Mail-Protokoll.
- **Text je Standort:** `consultation_whatsapp_settings.email_fallback_subject/_body` (Admin →
  Beratungs-WhatsApp → Sektion „E-Mail statt WhatsApp“; leer = Standardtext aus
  `ConsultationWhatsappSetting::defaultEmailSubject()/defaultEmailBody()`), Platzhalter
  `{vorname} {kundenname} {institut} {termin_datum} {termin_uhrzeit} {gutschein_link} {gueltig_bis}`.
- **Protokoll:** am `consultation_whatsapp_logs`-Eintrag des Termins die Felder `email_status`
  (sent/failed), `email_to`, `email_reason`, `email_sent_at`, `email_sent_by` (Migration
  `2026_10_24_210000`). Gibt es noch keinen Eintrag (WhatsApp nie versucht), entsteht er mit
  Status `skipped` und dem Grund „von Hand per E-Mail versendet“ — der WhatsApp-Job überspringt
  den Termin danach (Dedupe über `appointment_id`). Die Nachrichten-Zeitleiste der Kundin
  (`ClientMessagesController`) zeigt den Versand als „Beratungs-Gutschein per E-Mail“.
- **Endpunkte** (Web und App): `GET /phorest/client/{clientId}/consultation-voucher-mail`
  (`view_client_detail`), `GET /phorest/appointment/{branchId}/{appointmentId}/consultation-voucher-mail?client_id=`
  (nur dieser Termin), `POST /phorest/client/{clientId}/consultation-voucher-mail`
  (`send_client_messages`, Body `appointment_id?`, `email?`, Bremse 20/10 Min).
- **UI:** Blade-Komponente `<x-consultation-voucher-mail client-id="…" appointment-id="…" />`
  (Knopf nur bei `available`, Dialog im Teleport, Event `consultation-voucher-mail-sent` lädt die
  Zeitleiste neu); App `ConsultationVoucherMailButton` (ClientMessagesTab.swift) in Nachrichten-Reiter
  und Terminansicht, Dialog als `alert` mit Adressfeld.
- Tests: `tests/Feature/ConsultationWhatsapp/ConsultationVoucherMailTest.php`.
