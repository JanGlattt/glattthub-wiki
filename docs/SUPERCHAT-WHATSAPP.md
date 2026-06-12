# Superchat / WhatsApp-Integration

!!! info "Verwandte Seite"
    Die Verwaltung der Superchat-Kontakte, der automatische Sync und die
    Webhook-basierte Verknüpfung sind in einer eigenen Seite dokumentiert:
    [**Superchat-Kontakte & Sync →**](SUPERCHAT-KONTAKTE.md)

Die Superchat-Integration verbindet WhatsApp-Konversationen aus dem
[Superchat](https://www.superchat.de) Posteingang mit den Phorest-Kunden in
glatttHub. Im Kundendetail steht ein eigener Tab **WhatsApp** zur Verfügung,
der die komplette Chathistorie chronologisch im klassischen Messenger-Layout
darstellt.

## Für Endanwender

### Wo finde ich die WhatsApp-Konversationen?

1. Im Hub → **Kunden** den Kunden öffnen
2. Tab **WhatsApp** anklicken
3. Es werden alle Konversationen mit diesem Kunden angezeigt – chronologisch
   sortiert, gruppiert nach Tag (Heute / Gestern / Datum)

### Was wird angezeigt?

- **Konversations-Header**: Kundenname links, Zeitstempel der letzten Aktivität
  rechts
- **Eingehende Nachrichten** (vom Kunden): weiße Bubble links mit
  Bubble-Tail
- **Ausgehende Nachrichten** (vom Team): grüne Bubble rechts mit
  Bubble-Tail + Status-Häkchen
  - `✓` gesendet
  - `✓✓` zugestellt
  - `✓✓` (blau) gelesen
  - `!` (rot) fehlgeschlagen
- **Datums-Trenner**: kleine Pille mittig im Chat
- **Bilder**: werden direkt in der Bubble angezeigt, Klick öffnet das
  Original in neuem Tab
- **Andere Dateien**: Link „Datei herunterladen" mit Büroklammer-Icon
- **Medien in Verarbeitung**: wenn Superchat den Datei-Link noch nicht
  geliefert hat, erscheint „Anhang wird verarbeitet…"

### Aktualisieren

Oben rechts gibt es den Button **Aktualisieren**. Beim Öffnen des Tabs werden
die Nachrichten ohnehin automatisch geladen – der Button hilft, wenn während
des Gesprächs neue Nachrichten reinkommen.

### Nachrichten senden

Unterhalb des Chat-Verlaufs liegt ein **Composer**:

- **Innerhalb 24 h** nach der letzten eingehenden Kundennachricht ist das
  *Customer Service Window* offen — Freitext und Anhänge (Bilder
  JPG/PNG/WEBP, PDF, MP4) dürfen versendet werden. Die Restlaufzeit wird
  als Hinweis angezeigt.
- **Außerhalb** ist der Freitext gesperrt. Es darf dann nur eine von
  Meta genehmigte **WhatsApp-Vorlage** verschickt werden. Über den
  Button *Vorlage* öffnet sich ein Dialog mit allen approved Templates,
  Platzhaltern (`{{1}}`, `{{2}}` …) und einer Live-Vorschau.

Gesendete Nachrichten erscheinen sofort als „in Zustellung" und werden
über den Webhook-Echo automatisch in den finalen Status (`sent`,
`delivered`, `read`, `failed`) gehoben.

### Neue Konversation starten

Oben rechts im WhatsApp-Tab gibt es neben **Aktualisieren** auch den Button
**Neue Konversation**. Dieser öffnet ein Modal mit zwei Schritten:

1. **Kanal (Standort) wählen** — Dropdown zeigt alle verknüpften WhatsApp-Kanäle
   mit dem Standortnamen (z. B. „Hannover", „Bielefeld", „Osnabrück") statt
   der rohen Telefonnummer.
2. **Vorlage wählen** — nach Kanalwahl lädt das Modal alle genehmigten
   WhatsApp-Templates für diesen Kanal. Platzhalter (`{{1}}`, `{{2}}` …)
   werden als Eingabefelder dargestellt; eine Live-Vorschau zeigt den
   ausgefüllten Text.

Nach dem Absenden:
- Gibt es noch keinen Superchat-Kontakt für den Kunden, wird er anhand der
  Phorest-Mobilnummer gesucht (E.164-normalisiert) oder neu angelegt.
- Die erste Nachricht erscheint sofort im Chat (kein Warten auf Webhook).
- Der Button ist **immer** sichtbar — auch wenn bereits Konversationen
  existieren — damit eine zweite Konversation über einen anderen Kanal
  (anderen Standort) gestartet werden kann.

### Was wird im Konversations-Header angezeigt?

- **Bei mehreren Konversationen**: ein Dropdown zum Wechsel zwischen den
  Konversationen. Jede Option zeigt Standortname + Datum.
- **Bei genau einer Konversation**: ein Info-Badge (z. B. `Hannover · 08.06.2026`)
  direkt neben dem Kundennamen, damit immer erkennbar ist, über welchen Kanal
  der Chat läuft.

### Was ist, wenn nichts angezeigt wird?

Möglich sind drei Gründe:

1. **„Kein Superchat-Kontakt verknüpft"** → Für den Kunden gibt es in Superchat
   keinen Kontakt mit passender Telefonnummer. Über **Neue Konversation**
   kann direkt eine erste Nachricht gesendet werden — dabei wird der Kontakt
   automatisch angelegt und verknüpft.
2. **„Keine Konversationen vorhanden"** → Es gab noch nie eine
   WhatsApp-Konversation mit diesem Kunden. Über **Neue Konversation**
   lässt sich direkt eine starten.
3. **Phorest Client ID fehlt** → Der Kunde wurde nicht über Phorest
   importiert; bitte zuerst den Kunden in Phorest anlegen und neu syncen.

## Für Entwickler

### Architektur-Überblick

```
Superchat                          glatttHub
─────────────────────────          ────────────────────────────────────────
WhatsApp-Kontakt                   superchat_contact_links
  ├─ Telefonnummer        ←  Sync ──→  superchat_contact_id
  └─ custom_attribute               phorest_client_id (über Tel.-Nr. gematched)
       "Phorest Client ID"

WhatsApp-Nachricht        ←──── Webhook (synchron) ────→  superchat_messages
                                                          + Files-API-Lookup
                                                            für Media

Kundendetail-Tab          ←─── GET /superchat/client-conversations ──┐
"WhatsApp"                                                            │
                                                                      ▼
                          ← SuperchatContactLink → SuperchatMessage[]
```

### Zentrale Dateien

| Pfad | Zweck |
|------|-------|
| `app/Services/SuperchatApiService.php` | HTTP-Wrapper für Superchat REST-API, inkl. `eachPage()`-Generator mit Loop-Schutz, `getFile($id)` für signierte URLs |
| `app/Jobs/SyncSuperchatContactsJob.php` | Pull aller WhatsApp-Kontakte, Matching über Telefonnummer auf Phorest, schreibt `superchat_contact_links` und Custom Attribute zurück in Superchat |
| `app/Jobs/ProcessSuperchatWebhookJob.php` | Verarbeitet eingehende Webhook-Events; `handleMessage()` extrahiert Text/Caption und Media |
| `app/Http/Controllers/SuperchatWebhookController.php` | Empfängt Webhooks, dispatcht **synchron** (`dispatchSync`) – Cloud Run hat keinen Queue-Worker |
| `app/Http/Controllers/SuperchatController.php` | JSON-API `/superchat/client-conversations` für den Kundendetail-Tab |
| `app/Models/SuperchatContactLink.php`, `app/Models/SuperchatMessage.php` | Eloquent-Models |
| `app/Models/SuperchatWebhookEvent.php` | Audit-Log aller eingehenden Webhook-Events (status: pending/processed/failed) |
| `resources/views/hub/clients/partials/whatsapp.blade.php` | Alpine.js Chat-View |
| `public/css/theme_glattt.css` (Abschnitt `WHATSAPP-THREAD`) | Styling für Bubbles, Tails, Tag-Trenner, Status-Ticks |
| `config/superchat.php` | API-Key, Webhook-Secret (optional), Custom-Attribute-IDs (`phorest_client_id`, `external_id`) |
| `database/migrations/2026_05_31_*` und `2026_06_01_*` | Tabellen `superchat_contact_links`, `superchat_messages`, `superchat_webhook_events` |

### Zuordnung Message → Kunde

Zwei Stufen:

1. **Kontakt-Match** (Sync-Job, asynchron oder via `php artisan superchat:sync-contacts`):
   - Superchat liefert `contact.handles[*].value` als E.164-Telefonnummer
   - `SuperchatApiService::normalizePhone()` normalisiert beidseitig
   - Match gegen `phorest_clients.mobile` (auch normalisiert)
   - Bei Treffer: Zeile in `superchat_contact_links` + Custom Attribute
     `Phorest Client ID` und `Kundennummer` zurück in Superchat schreiben
2. **Message-Match** (Webhook, synchron):
   - `message.from.id` (inbound) bzw. `message.to[0].id` (outbound) →
     `superchat_contact_id`
   - `message.conversation_id` → `superchat_conversation_id`
   - `direction`, `status` werden lowercase normalisiert
   - Idempotent über `superchat_messages.superchat_message_id` (unique)
   - **Komplettes Payload** landet zusätzlich in `raw_payload` (JSON-Cast)

### Content-Extraktion (`handleMessage`)

Superchat liefert je nach `content.type` unterschiedliche Felder:

| `content.type` | Text-Quelle | Media-Quelle |
|---|---|---|
| `text` | `content.body` oder `content.text` | – |
| `template` | `content.body` | – |
| `media` | `content.caption` | `content.file_url` ODER `content.file_id` (dann Lookup über `/files/{id}`) |

Wenn `file_url` beim Webhook noch `null` ist (häufig bei Bildern!), wird
`SuperchatApiService->getFile($fileId)` aufgerufen und liefert die
signierte URL + MIME-Typ nach. Schlägt der Lookup fehl, wird gewarnt aber
der Webhook erfolgreich quittiert.

!!! warning "Superchat liefert teils relative API-Pfade als `url`"
    Der Endpunkt `GET /files/{id}` antwortet je nach Datei mit
    `url: "/files/fi_xxx"` (relativer API-Pfad) statt einer signierten
    Download-URL. Solche Werte werden **verworfen** (sonst 404 auf eigener
    Domain). Stattdessen wird immer `media_file_id` gespeichert und das
    Frontend bekommt eine Proxy-URL geliefert (siehe nächster Abschnitt).

### Media-Proxy (frische signierte CDN-URL bei jedem Aufruf)

Superchat liefert signierte Download-URLs auf `file-cdn.superchat.de` mit
kurzer Gültigkeit. Sie stecken in der Antwort von `GET /files/{id}` unter
`link.url` (zusammen mit `link.valid_until` und `mime_type`). Das
Top-Level-`url`-Feld ist NICHT die Download-URL, sondern nur der relative
API-Pfad `/files/fi_xxx`.

Damit Bilder & Dateien im Kundendetail jederzeit funktionieren, läuft der
Zugriff über einen Proxy-Endpunkt, der bei jedem Aufruf eine frische
signierte URL holt und den Browser dorthin weiterleitet:

- Route: `GET /superchat/media/{messageId}` (`superchat.media`)
- Controller-Methode: `SuperchatController::streamMedia()`
- Logik: Message laden → `SuperchatApiService::getFile(media_file_id)`
  → JSON parsen → `link.url` extrahieren → 302-Redirect dorthin
- Felder-Priorität: `link.url` → `download_url` → `signed_url` → `file_url`
  (alle nur wenn absolut)
- Fallback: wenn keine `media_file_id` vorhanden ist und die alte
  `media_url` absolut ist, wird darauf weitergeleitet
- `SuperchatController::getClientConversations` liefert dem Frontend
  ausschließlich die Proxy-Route, niemals die rohe Superchat-URL

**Download-Modus** (`?download=1`): Wird der Proxy mit diesem Query-Param
aufgerufen, holt der Controller die Datei serverseitig von der
signierten CDN-URL und liefert sie mit `Content-Disposition: attachment`
und originalem Dateinamen (`name` aus der getFile-Response) zurück.
Der Browser speichert die Datei dann direkt, statt sie anzuzeigen.
Genutzt für den Download-Button in der Lightbox sowie für
Nicht-Bild-Anhänge (PDF, Audio, Video).

### Frontend-Darstellung (Lightbox)

Bilder im WhatsApp-Tab öffnen beim Klick eine Lightbox-Vorschau
(`x-teleport="body"`) mit zwei Aktionen:

- **Herunterladen** — verlinkt auf `/superchat/media/{id}?download=1`
- **Schließen** — schließt das Overlay (auch via Klick auf Backdrop oder Escape)

Styles: `.lightbox-glattt-backdrop`, `.lightbox-glattt`,
`.lightbox-glattt-image`, `.lightbox-glattt-actions` in
`public/css/theme_glattt.css`.

Speicherspalte: `superchat_messages.media_file_id` (Migration
`2026_06_01_120000_add_media_file_id_to_superchat_messages`). Die
signierte URL wird bewusst NICHT gespeichert (läuft ohnehin nach
wenigen Minuten ab).

### Webhook-Verarbeitung

!!! warning "Cloud Run hat keinen Queue-Worker"
    Auf Cloud Run läuft nur der Web-Container. Webhook-Events MÜSSEN
    synchron via `ProcessSuperchatWebhookJob::dispatchSync($id)` verarbeitet
    werden, sonst bleiben sie ewig auf `status=pending`.

### Zeitzonen

Superchat liefert `created_at` / `updated_at` als ISO-8601 in UTC
(Suffix `Z`, z. B. `2026-06-01T19:29:00.000Z`). Der Webhook-Handler
parst diese explizit als UTC und konvertiert sie auf die App-Timezone
`Europe/Berlin`, bevor sie über den `datetime`-Cast in MySQL gespeichert
werden — sonst landet die UTC-Uhrzeit 1:1 in der DB und wird beim Lesen
fälschlich als Europe/Berlin interpretiert (2 h Versatz im Sommer).

Implementiert in `ProcessSuperchatWebhookJob::parseSuperchatTimestamp()`.
Bestandsdaten werden via Migration
`2026_06_01_140000_fix_superchat_messages_timezone` aus `raw_payload`
re-parst und korrigiert; das Prod-Pendant liegt unter
`scripts/production-superchat-timezone-fix-2026-06-01.sql` (nutzt
`CONVERT_TZ('UTC','Europe/Berlin')` für DST-Korrektheit).

### Composer (Nachrichten senden)

- `app/Services/SuperchatComposerService.php` — kapselt 24h-Fenster-Check,
  Template-Caching (5 min) und die Send-Logik mit optimistischem
  Outbound-Shadow in `superchat_messages`.
- Controller-Endpoints (`auth + check.hub`):
    - `GET  /superchat/composer-state` — liefert `can_freeform`,
      `window_expires_at`, aktiven `channel_id`, Liste approved
      WhatsApp-Templates (mit `{{n}}`-Variablen).
    - `GET  /superchat/channels` — alle WhatsApp-Kanäle mit Standortname
      (aus `inbox.name`, z. B. „Hannover"). Genutzt beim Modal *Neue Konversation*.
    - `GET  /superchat/templates?channel_id=…` — approved WhatsApp-Templates
      für einen bestimmten Kanal (kein Kontakt-Link nötig, daher für
      *Neue Konversation* besser geeignet als `composer-state`).
    - `POST /superchat/send` — Body: `{phorest_client_id, kind: text|file|template, ...}`.
      `text`/`file` werfen **409** wenn das 24h-Fenster zu ist.
    - `POST /superchat/upload` — Multipart-Upload, akzeptiert nur
      `image/jpeg|png|webp`, `application/pdf`, `video/mp4` (max 16 MB),
      liefert `file_id` für anschließendes `kind=file`-Send.
    - `POST /superchat/start-conversation` — Startet eine neue Konversation
      für einen Kunden ohne oder mit bestehendem Kontakt-Link (siehe unten).
- 24h-Fenster-Berechnung: `max(external_created_at) WHERE direction='inbound'`
  jünger als 24 h.
- Aktiver Kanal: jüngste Message mit gesetzter `superchat_channel_id`
  des Kontakts (Multi-Channel-Kunden landen auf dem zuletzt genutzten
  Kanal).
- Optimistisches UI: nach erfolgreichem `sendMessage()` wird ein
  Shadow-Record mit `direction=outbound, status=sending` geschrieben.
  Der reguläre Webhook-Pfad upsertet später per `superchat_message_id`
  und hebt den Status.

### Neue Konversation starten (`start-conversation`)

`POST /superchat/start-conversation` wird vom Modal *Neue Konversation starten*
aufgerufen. Der Ablauf im `SuperchatController::startConversation()`:

1. **Telefonnummer normalisieren** — `SuperchatApiService::normalizePhone()`
   wandelt lokale Formate (`0151…`) in E.164 (`+4915…`) um.
2. **Kontakt suchen** — `POST /contacts/search` mit
   `{query: {value: [{field: "phone", operator: "=", value: "+49…"}]}}`.
   Falls nicht gefunden: zusätzlich ohne führendes `+` probieren.
3. **Kontakt anlegen** — wenn kein Treffer: `POST /contacts` mit
   `handles: [{type: "phone", value: "+49…"}]` (type muss `"phone"` sein,
   nicht `"whatsapp"`).
4. **409-Fallback** — antwortet Superchat mit 409 (Kontakt existiert bereits),
   wird nochmals gesucht (Formatproblem beim ersten Versuch).
5. **Link speichern** — neue Zeile in `superchat_contact_links`.
6. **Template senden** — `POST /messages` mit `content.type = whats_app_template`.
7. **Shadow-Record** — die gesendete Nachricht wird sofort in
   `superchat_messages` gespeichert (mit dem aufgelösten Template-Text),
   damit sie direkt im Chat erscheint ohne auf den Webhook warten zu müssen.

### Webhook-Signatur

Laut [Superchat Developer Docs](https://developers.superchat.com) ist
**keine** Signatur-Prüfung dokumentiert. `POST /webhooks` enthält nur
`target_url` und `events`. Das „Webhook-Secret"-Feld im Superchat-UI ist
undokumentiert. Aktuell läuft die Verarbeitung ohne Signatur-Prüfung –
sollte Superchat das nachrüsten, kann der Controller über
`config('superchat.webhook_secret')` aktiviert werden (Base64-Variante
wird ebenfalls unterstützt).

### Phorest-ID-Resolution im Frontend

Der WhatsApp-Tab liest die `clientId` aus dem **Parent-Alpine-Scope**
(`alpineData.client.clientId`). Da der Tab teilweise vor dem
Parent-Mount initialisiert wird, gibt es ein 100 ms-Polling mit max.
20 Versuchen (~2 s). Initial-Load wird durch
`$nextTick(() => loadConversations(true))` getriggert und bei jedem
Tab-Wechsel via `$watch('$root.activeTab', …)` neu ausgelöst.

### Styling-Konventionen

Alle Klassen liegen im Block `WHATSAPP-THREAD` in
`public/css/theme_glattt.css` (≈ Zeile 21880 ff.) und nutzen den
Dark-Mode-Switcher `.dark`:

- `.whatsapp-conversation` – Card-Wrapper (eigene Klasse, weil Outer-Card
  `.card-glattt-no-hover` bekommt – kein Lift-Hover für Chat-Bereich)
- `.whatsapp-thread` – Paper-Background (`#ece5dd` light, `#0b141a` dark)
- `.whatsapp-message-in/out` – Flex-Container für Bubble-Ausrichtung
- `.whatsapp-bubble` – Sprechblase mit `::before`-Tail (Clip-Path-Dreieck)
- `.whatsapp-bubble-meta` – absolut positioniert unten rechts mit Zeit + Ticks
- `.whatsapp-bubble-ticks-read` – Türkisblau `#53bdeb` für gelesene Nachrichten

### Console-Debugging

Im WhatsApp-Tab werden Debug-Logs mit Prefix `💬 WhatsApp:` ausgegeben:

- `loadConversations { phorestClientId, force, attempts }`
- `GET /superchat/client-conversations?…`
- `Response {…}` – komplette API-Antwort
- `n Konversation(en), m Nachrichten`

### Bekannte Einschränkungen

- Kontakt-Matching ist rein telefonbasiert; falls ein Kunde in Phorest
  eine andere Mobilnummer hat als in WhatsApp, gibt es keinen automatischen
  Match. Über *Neue Konversation* kann die Verknüpfung manuell ausgelöst
  werden.

### Produktiv-DB-Migration

Bei Schema-Änderungen an `superchat_*`-Tabellen erst lokal migrieren,
dann ein SQL-Skript für die Produktiv-DB erstellen (nie direkt
`php artisan migrate` auf Production).
