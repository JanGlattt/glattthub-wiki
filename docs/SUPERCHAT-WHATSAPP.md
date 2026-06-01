# Superchat / WhatsApp-Integration

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

### Was ist, wenn nichts angezeigt wird?

Möglich sind drei Gründe:

1. **„Kein Superchat-Kontakt verknüpft"** → Für den Kunden gibt es in Superchat
   keinen Kontakt mit passender Telefonnummer. Verknüpfung passiert beim
   Sync-Job über die Phorest-Mobilnummer (normalisiert auf E.164).
2. **„Keine Konversationen vorhanden"** → Es gab noch nie eine
   WhatsApp-Konversation mit diesem Kunden.
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

### Media-Proxy (immer frische signierte URL)

Signierte Download-URLs von Superchat sind kurzlebig. Damit Bilder & Dateien
im Kundendetail jederzeit funktionieren, läuft der Zugriff über einen
Proxy-Endpunkt:

- Route: `GET /hub/superchat/media/{messageId}` (`hub.superchat.media`)
- Controller-Methode: `SuperchatController::streamMedia()`
- Logik: Message laden → `getFile(media_file_id)` → 302-Redirect auf die
  aktuelle signierte URL (`download_url` → `signed_url` → `url` → `file_url`,
  nur wenn absolut)
- Fallback: wenn keine `media_file_id` vorhanden ist und die alte
  `media_url` absolut ist, wird darauf weitergeleitet
- `SuperchatController::getClientConversations` liefert nicht mehr die
  rohe `media_url`, sondern – falls `media_file_id` vorhanden – die
  Proxy-Route

Speicherspalte: `superchat_messages.media_file_id` (Migration
`2026_06_01_120000_add_media_file_id_to_superchat_messages`).

### Webhook-Verarbeitung

!!! warning "Cloud Run hat keinen Queue-Worker"
    Auf Cloud Run läuft nur der Web-Container. Webhook-Events MÜSSEN
    synchron via `ProcessSuperchatWebhookJob::dispatchSync($id)` verarbeitet
    werden, sonst bleiben sie ewig auf `status=pending`.

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

- Outbound-Nachrichten können nicht über glatttHub gesendet werden
  (read-only Chat-View). Antworten geschehen weiterhin in Superchat.
- Kontakt-Matching ist rein telefonbasiert; falls ein Kunde in Phorest
  eine andere Mobilnummer hat als in WhatsApp, gibt es keinen Match.

### Produktiv-DB-Migration

Bei Schema-Änderungen an `superchat_*`-Tabellen erst lokal migrieren,
dann ein SQL-Skript für die Produktiv-DB erstellen (nie direkt
`php artisan migrate` auf Production).
