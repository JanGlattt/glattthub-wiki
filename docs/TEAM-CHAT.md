# Team-Chat „Chat“

Der interne Chat von glattt ersetzt WhatsApp und Signal für alles Dienstliche: Einzel- und
Gruppenchats mit dem ganzen Team, Ankündigungskanäle mit Lesekontrolle, Sprachnachrichten,
Umfragen, Hub-Karten (Kundin, Vertrag, Forderungsfall) und glatttBert als Gesprächspartner.
Web (Vollseite plus Seitenpanel), Desktop-App, iPhone, iPad und Android als PWA laufen auf
denselben JSON-Endpunkten. Diese Seite ist die **technische Dokumentation**; die Bedienung
Schritt für Schritt kommt ins Nutzerhandbuch (Serien „Chat“ und „App“, siehe
`.github/klickanleitungen-abdeckung.json`).

!!! note "Stand"
    Entscheidungen Jan, 10./11.10.2026 (Plan, drei Entwürfe als Artefakt, Wahl: Entwurf 1
    „Vertraut“ plus Heute-Karte und Kontextspalte aus Entwurf 2). Rechte vorerst nur
    „Super-Admin“ wie bei Kasse und Kundenservice; Freischalten für alle Rollen zum Stichtag im
    Admin. Projektwissen: `.github/knowledge/team-chat-bauplan.md`.

## Für Endanwender

**Was das Modul leistet.** Unter **Chat** (Schnellzugriff in der Seitenleiste, Haupttab der App)
sieht jede Kollegin ihre Chats: oben die Karte „Heute für dich“ (neue Ankündigungen, offene
Lesebestätigungen, Umfragen, Erwähnungen), darunter die Liste nach letzter Nachricht. Die
Standard-Gruppen **Alle glattt** und **Team <Institut>** pflegt der Hub selbst, eigene Gruppen
legt jede an. In den **Ankündigungskanälen** (glattt, je Institut) schreibt nur die Leitung; sie
sieht am Lesezähler, wer gelesen hat, und kann beim Absenden eine **Lesebestätigung** anfordern,
dann muss jede Empfängerin am Ende der Nachricht auf „Gelesen – ich bestätige“ tippen.

Nachrichten zeigen die drei Haken (gesendet, zugestellt, gelesen), in Gruppen „Gelesen von“ je
Person. Antworten mit Zitat, Reaktionen, Erwähnungen (@Name), Weiterleiten, Anheften,
Bearbeiten (15 Minuten) und Löschen für alle laufen wie gewohnt; Fotos, Videos, Dateien und
Sprachnachrichten (Mikrofon halten) ebenso — Aufnehmen nur in der iPhone-/iPad-App, im Browser
und in der Desktop-App lassen sie sich nur abspielen. Über das Plus kommen Umfragen, GIFs und Hub-Karten
in den Chat; `@glatttBert Frage` holt den KI-Assistenten in den Raum. Die [Ruhezeiten](RUHEZEITEN.md)
(seit 14.10.2026 für alle Mitteilungen, vorher „Nicht stören“ nur im Chat) halten Pushes aus dem
Feierabend fern; einzelne Gruppen oder Kolleginnen lassen sich als Ausnahme durchlassen, dringende
Ankündigungen kommen immer.

**Anrufe (seit 16.10.2026).** Im Einzelchat ruft der Hörer oben eine Kollegin an, die Kamera
startet einen Videoanruf. Es klingelt auf jeder Hub-Seite, im Gespräch lässt sich die Kamera
zuschalten, das Mikrofon stummschalten und der **Bildschirm teilen** (Browser und Desktop-App).
Das Fenster bleibt beim Wechsel zwischen Hub-Seiten stehen; „Groß“ füllt den Bildschirm. Im
Verlauf bleibt eine Spur („Ausgehender Videoanruf · 3:12“, „Verpasster Sprachanruf“) mit
**Zurückrufen**. Wer in den Ruhezeiten ist, bekommt keinen Klingel-Push.

**Arbeitswerkzeug (seit 16.10.2026, Etappe C).** Im Team-Raum eines Instituts steht im Plus die
**Übergabe** (vorbefüllt mit Kasse, offenen Laser-Meldungen und den Terminen von morgen; die nächste
Schicht tippt „Übernommen“). Das Büro legt im Admin **Checklisten** an (Öffnen, Schließen …), die der Hub
zur Uhrzeit in den Team-Raum stellt; abgehakt wird mit Name und Zeit. Statt „online“ zeigt der Chat den
**Dienststatus** aus dem Dienstplan („Im Dienst bis 21:00“, „Urlaub bis 20.10.“), den man für Pause oder
Termin kurz überschreiben kann. Je Chat lässt sich wählen: **Alle Nachrichten · Nur Erwähnungen · Stumm**;
`@alle` erwähnt die ganze Gruppe, eigene **Stichwörter** melden sich wie eine Erwähnung. Ab 20 ungelesenen
Nachrichten fasst **glatttBert** auf Knopfdruck zusammen. **Sprachnachrichten** bekommen ein Transkript.

**Mehr Werkzeug (seit 16.10.2026, Etappe D).** Unter **Ankündigungen** antworten Kolleginnen im **Strang** unter dem
Beitrag („12 Antworten · zuletzt Lea“), nicht mehr im Kanal; Mitteilungen bekommen nur die Absenderin und wer
mitschreibt. Jede Nachricht zeigt über „Antworten anzeigen“, wer darauf geantwortet hat. Im Plus gibt es neben der
Umfrage die **Terminfindung** (je Zeit Ja/Vielleicht/Nein, die beste Zeit ist markiert) und das **Quiz** für
Schulungen (die Lösung erscheint nach der eigenen Antwort, wer wie geantwortet hat, sieht nur die Erstellerin),
dazu **glattt-Sticker** neben den GIFs. Nachrichten lassen sich **später senden** (Senden-Knopf halten bzw. Uhr),
mit **Erinnere mich** vormerken, **als Aufgabe** an eine Kollegin geben und auf Tippen **übersetzen**. Termine und
Kundenservice-Tickets kommen als Karte in den Chat. **glatttBert** beantwortet „Wer hat heute Dienst?“. In der
Desktop-App hat der Rechtsklick auf Chats und Nachrichten eigene Einträge, die **Apple Watch** zeigt ungelesene
Chats. Das Büro legt im Admin **Löschfristen** je Chat-Art fest (Standard: unbegrenzt) und kann Gruppen als ZIP
exportieren.

**Warum.** WhatsApp lebt von privaten Handynummern, pflegt keine Gruppen und kennt den Hub nicht.
Der Chat erreicht jede Kollegin über ihr Hub-Konto, hält Dienstliches im Unternehmen und
verbindet Nachrichten mit Kundinnen, Verträgen und Ankündigungen.

!!! nutzerhandbuch "Bedienung: Chat 1 – Chats, Gruppen und Ankündigungen"
    https://hilfe.hub.glattt.com/chat/1/ (Deck in Arbeit; App-Bedienung in der Serie „App“)

!!! nutzerhandbuch "Bedienung: Chat 3 – Im Team arbeiten"
    https://hilfe.hub.glattt.com/chat/3/ (Übergabe, Checklisten, Dienststatus, Umfrage-Arten, Sticker, Antwortstränge)

## Für Entwickler

### Architektur

| Schicht | Datei | Zweck |
|---|---|---|
| Tabellen | `database/migrations/2026_10_11_2000*_*chat*` | `chat_rooms`, `chat_room_members`, `chat_messages`, `chat_attachments`, `chat_reactions`, `chat_mentions`, `chat_polls`, `chat_poll_votes`, `chat_user_settings`, `chat_acknowledgements` |
| Modelle | `app/Models/Chat/` | `ChatRoom`, `ChatRoomMember`, `ChatMessage`, `ChatAttachment`, `ChatReaction`, `ChatMention`, `ChatPoll`, `ChatPollVote`, `ChatUserSetting`, `ChatAcknowledgement` |
| Räume & Rechte | `app/Services/Chat/ChatRoomService.php` | Standard-Gruppen, Einzelchats, freie Gruppen, Mitglieder, `canPost()`/`canManage()` |
| Nachrichten | `app/Services/Chat/ChatMessageService.php` | Senden (Stand-Zähler, Client-UUID), Bearbeiten, Löschen, Reaktionen, Lesestand, Weiterleiten, Anheften, Umfragen, Lesebestätigung, Bot-Antworten |
| Lesen | `app/Services/Chat/ChatQuery.php` | Raumliste mit Zählern, Verlauf, Nachladen ab Stand, Suche, Kontakte, „Heute für dich“ |
| JSON-Form | `app/Services/Chat/ChatPresenter.php` | eine Form für Web und App (alle Felder optional in Swift) |
| Echtzeit | `app/Services/Chat/ChatRealtime.php`, `app/Events/Chat/*` | Reverb-Anstöße je Nutzerin und je Raum |
| Push | `app/Services/Chat/ChatPushService.php`, Dispatcher `chatMessage()`/`chatMention()`/`chatAnnouncement()` | Empfängerfilter, Katalog-Anlässe `chat.*` |
| Endpunkte | `app/Http/Controllers/Chat/ChatController.php`, `routes/web.php` (`/hub/chat/*`) | Web und App |
| Web | `resources/views/hub/chat/`, `layouts/partials/chat-dock.blade.php`, `public/js/chat.js` | Vollseite und Seitenpanel (ein Alpine-Bauplan) |
| iOS | `ios/glatttHub/Chat/` | Haupttab, Unterhaltung, Blätter, Echtzeit-Client, Audio |
| glatttBert | `app/Jobs/ChatBertReplyJob.php` | `@glatttBert` → Antwort als Bot-Nachricht |

### Datenmodell

- **Räume** haben einen Typ (`direct`, `group`, `team`, `announcement`) und bei Standard-Räumen
  einen `system_key` (`all`, `team:{branch}`, `announce:global`, `announce:{branch}`);
  Einzelchats einen `direct_key` (`min-max` der User-IDs). `last_seq` ist der laufende Stand des
  Raums, jede Nachricht erhöht ihn in einer Transaktion mit `lockForUpdate`. Eigene Gruppen
  tragen seit 11.10.2026 zwei Einstellungen wie bei WhatsApp (`members_can_add`,
  `members_can_post`, Standard „alle“): „Nur Admins“ sperrt Hinzufügen bzw. Schreiben für
  einfache Mitglieder; `canPost()` und `canAddMembers()` im `ChatRoomService` werten sie aus,
  der Presenter liefert `can_add_members` je Nutzerin. Standard-Räume und Einzelchats kennen
  die Felder nicht (422).
- **Mitglieder** tragen Rolle (`owner`, `admin`, `member`), `last_read_seq` und
  `last_delivered_seq` als Nummern (nie je Nachricht), Stummschaltung (`muted_until`), Anheften
  und Archiv je Person. Verlassen setzt `left_at`; der Verlauf bleibt.
- **Nachrichten** haben `seq` je Raum und `client_uuid` (Wiederholen ist idempotent), Typ
  (`text`, `image`, `video`, `file`, `voice`, `poll`, `object`, `gif`, `sticker`, `system`),
  `meta` (Objekt-Karte, GIF, Erwähnungen, `bot`), `reply_to_id`, `forwarded_from_id`,
  `is_urgent`, `requires_ack`, `edited_at`, `deleted_at` („für alle“ leert Text und Anhänge, der
  Platzhalter bleibt).
- **Haken**: gesendet = Serverantwort, zugestellt = `last_delivered_seq` des Mitglieds ≥ `seq`
  (Client meldet `/zugestellt` nach Laden und Echtzeit-Anstoß), gelesen = `last_read_seq` ≥ `seq`.
  Der Presenter liefert `read_by`, `delivered_by`, `member_count`, `status`.
- **Lesebestätigung** (Ankündigungen): `requires_ack` am Beitrag, eine Zeile in
  `chat_acknowledgements` je Person; `today.acknowledgements` listet offene.

### Standard-Gruppen

`ChatRoomService::syncStandardRooms()` läuft beim Laden der Chatseite (gedrosselt auf zehn
Minuten, `Cache`-Marke) und bringt die Mitglieder der Standard-Räume auf den Soll-Stand: alle
aktiven Konten mit `use_chat` in „Alle glattt“ und dem Kanal „glattt Ankündigungen“, nach
`users.home_branch_id` in „Team <Institut>“ und „<Institut> Ankündigungen“ (Institute aus
`BranchVisibility::allBranches()`, auch ausgeblendete). Archivierte Konten verlieren die
Mitgliedschaft (`left_at`), der Verlauf bleibt (Entscheidung Jan). Kein Scheduler-Job nötig.

### Rechte

| Recht | Wirkung |
|---|---|
| `use_chat` | Seite, Endpunkte, Mitgliedschaft in den Standard-Räumen, Kontakte |
| `post_chat_announcements` | im Kanal „glattt“ schreiben |
| `post_branch_chat_announcements` | im Kanal des eigenen Instituts schreiben (`allowed_branch_ids` leer = alle) |
| `manage_chat` | alle Gruppen verwalten, fremde Nachrichten löschen (Büro) |

Rechte kommen per Migration (`2026_10_11_200100_add_chat_permissions`) und `PermissionCatalog`
(Zweig „Chat“); Freischalten = im Admin den Rollen geben.

### Geteilte Geräte: keine Chat-Pushes

Seit 11.10.2026 (Jan): Auf **geteilten Institut-Geräten** (iPads, Institut-Macs) kommen keine
personenbezogenen Pushes an — dort steht, wer gerade Dienst hat. Technisch:

- `push_subscriptions.is_shared_device`: iPads erben die Kennzeichnung vom freigeschalteten Gerät
  (`enrolled_devices.kind = shared`, gleiche `native_device_id`) oder aus der MDM-Konfiguration
  (`shared_device: true` beim `subscribe/native`); Institut-Macs setzt das Büro im Admin unter
  **System → Push-Geräte**. Eine gesetzte Kennzeichnung bleibt beim Nutzerwechsel erhalten.
- `PushNotificationService::sendToUsers(..., ['personal' => true])` lässt geteilte Geräte weg;
  Chat-Pushes tragen `personal` in ihren Push-Daten (`chatPushData`).
- **Abmelden deaktiviert das Abo nur** (`POST /api/push/unsubscribe` bzw. `/unsubscribe/native`,
  Web aus `logout.js`, App aus `AppContainer.logout()`), Browser-Abo und OS-Erlaubnis bleiben.
  **Anmelden aktiviert still wieder** (`resumeSilently()` im Web-Client, `syncSubscription` in der
  App) — niemand muss die Erlaubnis erneut bestätigen. Test: `tests/Feature/Push/SharedDevicePushTest.php`.

### Echtzeit (Reverb)

- Kanal `private-chat.user.{id}` trägt alle Räume einer Nutzerin: Ereignis `chat.changed`
  mit `kind` (`message`, `edit`, `delete`, `reaction`, `pin`, `poll`, `ack`, `room`), `room_id`,
  `seq` und der kompakten Nachricht (`ChatPresenter::messageCompact`, höchstens 100 Kanäle je
  Veröffentlichung, `ChatRoomEvent`).
- Kanal `private-chat.room.{id}` nur für den offenen Raum: `chat.activity` mit `typing` und
  `read` (`ChatRoomActivity`).
- Seit 14.10.2026 zusätzlich im persönlichen Kanal: `typing` an alle übrigen Mitglieder (Chatliste
  zeigt „schreibt …“, höchstens alle 3 s je Person) und `receipt` nur an die Absenderin der letzten
  Nachricht, sobald Zustell- oder Lesestand vorrückt (`message_id`, `status` aus
  `ChatPresenter::receiptStatus` — dieselbe Regel wie im Verlauf). Ohne `message` im Ereignis — die
  iOS-App steigt dabei vor jeder Verarbeitung aus, ältere Builds vertragen es.
- Freigaben in `routes/channels.php` (Mitgliedschaft, `use_chat`); Presence-Kanal
  `presence-chat` ist vorbereitet.
- Reverb ist **Anstoß, der Hub die Wahrheit**: Ein Fehler des Echtzeit-Dienstes lässt nie eine
  Nachricht scheitern (`ChatRealtime::safely`). Was ein Client verpasst, holt er über den Abgleich
  (nächster Abschnitt); `GET /raeume/{id}/nachrichten?since=` bleibt für den offenen Raum.

### Abgleich: Ereignis-Protokoll, Sync-Cursor, Lückenregel (Etappe A, 16.10.2026)

Das Pusher-Protokoll spielt nach einem Verbindungsabbruch **nichts nach**. Bis zum 15.10.2026 war das
Sicherheitsnetz ein voller `/data`-Abgleich jede Minute in jedem offenen Tab — teuer und trotzdem bis
zu 60 s blind (Joanna: Nachrichten erst nach „Aktualisieren“, ein Haken 20 Minuten grau nach dem
Reverb-Neustart beim Deploy). Seitdem gilt das Muster von Discord (`RESUME`), Matrix (`next_batch`)
und Telegram (`pts`):

- **`chat_events`**: `ChatRealtime` schreibt vor jedem Anstoß eine Zeile mit globaler, monotoner ID
  (Arten `message`, `edit`, `delete`, `reaction`, `pin`, `poll`, `ack`, `room`, `member`) und trägt sie
  als `event_id` im Anstoß mit — auch wenn Reverb nicht antwortet. Jede neue Änderungsart muss durch
  `messageChanged()`/`roomChanged()` laufen, sonst fehlt sie im Abgleich.
- **`GET /hub/chat/sync?since=<cursor>`** (`ChatSyncService`): Ereignisse > since aus den eigenen
  Räumen in Reihenfolge, mit kompakter Nachricht (eigene mit Haken-Stand), dazu die Zeilen der
  berührten Räume (Zähler, letzte Nachricht); `limited` bei mehr als 200 (dann gleich weiter),
  `reset`, wenn `since` jünger als das jüngste Ereignis ist (dann `/data` neu laden).
- **Cursor-Grace-Regel (2 s):** Ereignisse entstehen außerhalb der Nachrichten-Transaktion, zwei
  gleichzeitige Sender können IDs in anderer Reihenfolge festschreiben als vergeben. Der Cursor rückt
  nur bis zum jüngsten Ereignis, das älter als 2 s ist; jüngere kommen beim nächsten Abgleich noch
  einmal. Clients verarbeiten deshalb **idempotent** (Nachricht-ID, Client-UUID) und setzen den Cursor
  **nur aus Sync-Antworten**, nie aus dem `event_id` eines Anstoßes.
- **Lückenregel im Client** (`public/js/chat-sync.js` `gapRule`, iOS `ChatSyncRule.decide`): Stand ==
  lokal + 1 → anwenden; ≤ lokal → Duplikat, nur den offenen Verlauf ergänzen; > lokal + 1 → Nachricht
  zeigen und nach 0,5 s abgleichen (Pakete kommen umsortiert an).
- **Takt und Zombie-Prüfung:** Abgleich im Vordergrund alle 30 s, verdeckt alle 5 Min, ohne Echtzeit
  alle 20 s; dazu bei Reconnect, Fokus, Netz zurück, Aufwachen, Push-Empfang und erkannter Lücke.
  Liefert ein Takt-Abgleich fremde Nachrichten, die älter als 5 s sind und trotz „live“ nie über den
  Socket kamen, ist die Verbindung taub: `GlatttLive.reconnect()` bzw. `ChatLiveClient.reconnect()`;
  die Zahl geht als `gap` ins nächste Lebenszeichen. Der volle `resync()` bleibt nur für
  Strukturänderungen (Gruppe angelegt, Bild, Mitglieder).
- **Lebenszeichen** (`chat_client_heartbeats`): je Nutzerin, Client-Art (`web`, `desktop`, `ios`,
  `android`) und Gerätekennung ein Datensatz mit Verbindungszustand, Cursor, Zahl der Abgleiche und
  gemeldeten Lücken — vom Sync-Aufruf gepflegt, gelesen von **Admin → System → Chat-Gesundheit**
  (`ChatHealthService`, Recht `manage_chat`): verbundene Chat-Kanäle über die Reverb-HTTP-API,
  Geräte live/ohne, Push-Latenz p50/p95 und Zustellquittungen aus `push_notification_logs`
  (`data->category = HUB_CHAT`), Auffälligkeiten der letzten 24 h. Alles beim Aufruf gerechnet, kein
  Scheduler-Job.
- **Persistente Warteschlange:** Web in IndexedDB (`glattthub-chat`/`outbox`, Dateien als Blob),
  iOS unter Application Support/chat-outbox (JSON über `OfflineStore`, je Nutzerin, Abmelden räumt
  weg). Kein Netz, 5xx oder 429 → Uhr statt Haken, Backoff 1…60 s ±20 %, Band „n Nachrichten warten
  auf Netz · Jetzt senden“ unter dem Kopf, Reihenfolge je Raum bleibt; 4xx bleibt „!“ ohne
  Warteschlange. Wartende hängen sich beim Öffnen eines Raums an den Verlauf.
- **Verbindungszustand im Kopf:** „Verbinde wieder …“, „Kein Netz · Stand 14:02“ oder „Keine
  Live-Verbindung · Abgleich alle 20 s“ ersetzt den Untertitel in Orange; das Dock trägt den Text am
  Verbindungspunkt.
- **Push im Worker:** `ChatPushFanoutJob` (push-Warteschlange) ermittelt Empfänger und versendet; die
  Senderin bekommt ihre Antwort direkt nach Transaktion und Anstoß. `ChatPushPreview::publish` rechnet
  die Bildvorschau je Nachricht nur einmal.
- **Bremsen und Fallen** (Code-Durchsicht 15.10.2026): `throttle` je Nutzerin auf Senden (60/min),
  Tippen (40), Suche/Objekte/GIFs (40), Sync (180); `muted_until` nur `1h|8h|1w|forever|off` (sonst 422);
  gleiche Client-UUID gleichzeitig → Unique-Index fängt, Antwort ist die erste Nachricht; Bearbeiten
  verlangt Mitgliedschaft; GIF-Quelle nur https und nach `KLIPY_MEDIA_HOSTS` (leer = alle https-Hosts);
  Web prüft Dateien vor dem Hochladen (50 MB, 10 Stück). **glatttBert** antwortet im Raum nur dann mit
  Hub-Daten (Kundinnen, Umsatz, Kennzahlen), wenn jedes aktive Mitglied `use_ai_assistant` hat
  (`GlatttBertService::withHubTools`), sonst nur aus der Wissensdatenbank — die Antwort sehen alle.
- Projektwissen: `.github/knowledge/chat-sync-cursor-und-lueckenregel.md`; Tests
  `tests/Feature/Chat/ChatSyncTest.php`, `ChatHealthTest.php`, `tests/js/chat-sync.test.mjs`
  (`npm test`), `ios/glatttHubTests/ChatSyncRuleTests.swift`.

### Etappe B „Rund“ (16.10.2026)

Entscheidungen Jan vom 15.10.2026 (Vorlage mit drei Entwürfen je Punkt, alle Empfehlungen gewählt).

- **Suche** (`ChatQuery::search`): MySQL-Volltext `chat_messages_fulltext` (ngram, Wortteile ab zwei Zeichen) über
  `body` und `transcript`; Hub-Karten über `meta->object->title`, Dateien über `meta->filename` — nicht mehr `LIKE`
  über das ganze JSON. Filter am Endpunkt `GET /suche`: `raum`, `von_person`, `ab`, `bis`, `art`
  (`media|file|voice|link|card|starred`); ohne Suchbegriff liefert ein Filter allein die Treffer. SQLite (Tests)
  fällt auf `LIKE` zurück.
- **Gespeichert** (`chat_message_stars`): `POST /nachrichten/{id}/merken` schaltet um, `is_starred` steht nur in
  Antworten, die die Sterne der Person geladen haben (Echtzeit-Anstöße an alle tragen das Feld nicht und
  überschreiben es deshalb nicht); die eigenen anderen Geräte bekommen `star` auf dem persönlichen Kanal. Liste
  über den Filter-Chip „★ Gespeichert“ (`/suche?art=starred`).
- **Medien** (`ChatMediaService`, Job `ChatMediaJob`): im Worker Vorschaubild ≤ 320 px (`thumb_path`), Maße,
  BlurHash (eigener Kodierer nach Wolt, 4 × 3, 28 Zeichen; Dekoder in `chat-sync.js`), Video-Standbild per ffmpeg
  (`poster_path`), HEIC über ImageMagick. Upload streamt (`putFileAs`). Infospalte mit Reitern **Mitglieder ·
  Medien · Dateien · Links**, Medien nach Monat.
- **Link-Vorschau** (`ChatLinkPreviewService`, `chat_link_previews`): Open Graph im Worker, nur https, Port 443,
  5 s, 512 KB, höchstens 3 Weiterleitungen von Hand, IP vorher geprüft (keine privaten/lokalen/Metadaten-Ziele)
  und per `CURLOPT_RESOLVE` festgehalten (kein DNS-Rebinding); Bild als eigenes Vorschaubild im privaten Bucket
  (`GET /link-bild/{id}`), nie die Fremdadresse. Hub-Links werden zur Hub-Karte ohne Abruf; dieselbe Adresse wird
  7 Tage wiederverwendet. Die Karte kommt per Ereignis `edit` nach.
- **Lesebestätigung mit Frist** (`ChatAckService`, `ChatAckFollowUpJob`): `ack_due` beim Senden (`24h|48h|72h|1w`
  oder Datum, Standard im Web 48 h). Erinnerung an Fehlende automatisch 24 h nach dem Senden (bei kürzerer Frist
  2 h vorher), von Hand höchstens einmal am Tag (`POST /nachrichten/{id}/erinnern`); nach Ablauf geht der Anlass
  `chat.ack_overdue` an die Institutsleitung (`post_branch_chat_announcements` mit passendem
  `allowed_branch_ids`) und die Absenderin. **Kein Cloud-Scheduler-Job**: beim Senden werden zwei verzögerte
  Aufträge eingereiht, die zum Zeitpunkt prüfen. Stand je Institut `GET /nachrichten/{id}/bestaetigungen`,
  CSV `…/bestaetigungen.csv` (Semikolon, BOM).
- **Nachricht-Info neutral**: „Zugestellt heißt: auf mindestens einem Gerät angekommen …“ — keine privaten
  Gründe (Ruhezeit, stumm).
- **Optik wie die App**: Schwänzchen oben außen an der ersten Blase, Füllungen und Namenspalette aus
  `ChatLook.swift`, Avatar oben, Tapete aus der Marke als SVG-Data-URI (einfache Anführungszeichen im SVG,
  sonst beendet `"` das `url(...)`).
- **Abfragen und Geräte** (Z7/Z12): Zustellstand gebündelt (73 → 2 Abfragen + 1 Update für 16 Räume),
  Raumliste ohne Konten je Mitglied, Erwähnungen in SQL, Standard-Gruppen im Hintergrund
  (`ChatSyncStandardRoomsJob`); eigene Einstellungen live über `self` an die eigenen Geräte, im Abgleich über
  `since_at`; gelesene Mitteilungen verschwinden auf den anderen Geräten (Web-Push je Chat mit Kennzeichen
  `chat-room-{id}`, iOS über `thread-id`). Ein Abgleich je Browser über `BroadcastChannel`, das Dock schweigt
  auf `/hub/chat`. `ChatQueryCountTest` wacht über die Abfragezahlen.
- Tests: `ChatEtappeBTest`, `ChatQueryCountTest`, `ChatSyncTest`, `tests/js/chat-sync.test.mjs`.

### Etappe C „Arbeitswerkzeug“ (16.10.2026)

Freigabe Jan (Entwürfe C/D, 16.10.2026). Je Punkt Web **und** iOS.

- **C1 Übergabe** (`ChatHandoverService`, Typ `handover`, `meta.handover`): `GET /raeume/{id}/uebergabe` schlägt vor
  (Kassenabschluss des Tages mit Differenz, offene/in Bearbeitung befindliche `laser_errors` der Räume des Instituts,
  `upcoming_appointments` von morgen mit Beratungen und `client_extra_times`), `POST` sendet als normale Nachricht
  (Push wie üblich), `POST /nachrichten/{id}/uebernommen` setzt `taken_by`/`taken_at` (nicht die Übergebende selbst),
  `GET /raeume/{id}/uebergaben` füllt den Reiter „Übergaben“. Nur Team-Räume mit `branch_id`.
- **C2 Dienststatus** (`ChatDutyService`): eigener Status mit Ablauf (`chat_user_settings.status_kind/until`) vor
  askDANTE-Abwesenheit (`hr_planned_absences`, nur `MUTING_REASONS`, Wochenenden überbrückt — „Urlaub bis 20.10.“,
  nie Krankheit) vor Phorest-Schicht (Staff-WorkTimeTable WORKING heute/morgen, Zuordnung über
  `phorest_staff.glatthub_user_id`, `users.phorest_user_id`, `phorest_staff_id(s)`). Die Schichten lädt
  `ChatDutyRefreshJob` im Hintergrund (Cache 10 Min.), die Anfrage liest nur den Cache. `partner.duty` und
  `partner.quiet_now` (Ruhezeit gerade aktiv, ohne Uhrzeiten) an Einzelchats; `me_duty` im Einstieg.
- **C3 Checklisten** (`ChatChecklistService`, Tabellen `chat_checklist_templates|runs|checks`, Typ `checklist`):
  Vorlagen im Admin unter **Betrieb → Chat-Checklisten** (`manage_chat`). Takt: der Cloud-Scheduler-Job
  `process-notification-automations` (jede Minute) ruft `tick()` — **kein eigener Scheduler-Job**. Nachholen höchstens
  90 Minuten. Abhaken `POST /checklisten/{run}/haken`, offene Punkte nach `remind_after_minutes` als Anlass
  `chat.checklist_open` an die Institutsleitung (`post_branch_chat_announcements`). Die Karte auf der Institutsseite
  (Tageserfassung) ist noch nicht gebaut.
- **C4 „Verpasst“** (`ChatSummaryService`): ab 20 Ungelesenen `POST /raeume/{id}/zusammenfassen {from_seq}` —
  Claude (kleines Modell) bekommt nur den Chattext (max. 400 Nachrichten, keine Hub-Werkzeuge), antwortet mit
  3–5 Punkten und Sprungmarke `seq`; 30 Min. im Cache je Person und Stand, nichts im Raum.
- **C5 Transkript**: App transkribiert offline (`ChatVoiceTranscriber`: iOS 26 `SpeechAnalyzer`, sonst SFSpeech
  on-device, höchstens 8 s) und schickt `transcript` mit; sonst `ChatTranscribeJob` über Speech-to-Text (EU) mit
  Tagesdeckel `CHAT_TRANSCRIPTS_DAILY_CAP` (300). Vorschau/Push zeigen den Text, Schalter `show_transcripts`.
- **C6 Mitteilungen dreistufig**: `chat_room_members.notify_level` (`all|mentions`), Stumm bleibt `muted_until`.
  `@alle` (in eigenen Gruppen jede, in Standard-Gruppen nur mit `manage_chat`/Ankündigungsrecht) legt Erwähnungen
  für alle Mitglieder an (`meta.mentions_all`); Stichwörter (`chat_user_settings.keywords`, max. 10) pushen wie eine
  Erwähnung (`ChatUserSetting::matchesKeyword`, Wortanfang). Stumm lässt nur namentliche Erwähnungen durch.
- **C7 Barrierefreiheit**: Web-Verlauf `role="log"` + `aria-live`, Blasen mit `aria-label` („Kim, 14:02: …, gelesen“),
  Pfeiltasten in der Liste, Fokusring, Haken-Kontrast; App mit vollständigem VoiceOver-Text je Blase.
- **C8 Erster Start**: Einführungskarte (drei Schritte) bis `intro_seen` am Konto, Leerzustand je Filter.
- Tests: `ChatNotifyLevelsTest`, `ChatDutyTest`, `ChatSummaryTest`, `ChatTranscriptTest`, `ChatChecklistTest`,
  `ChatHandoverTest`.

### Etappe D „Mehrwert“ (16.10.2026)

Freigabe Jan (Entwürfe C/D, 16.10.2026). D1 sind die Anrufe (eigener Abschnitt). Je Punkt Web **und** iOS.

- **D2 Antwortstränge** (`ChatThreadService`): Ein Strang ist ein **versteckter Raum** `type = thread` mit
  `chat_rooms.parent_message_id` (eindeutig, fällt mit dem Beitrag). So laufen Senden, Anhänge, Reaktionen, Echtzeit,
  Abgleich und Push über die bestehenden Wege. `GET /nachrichten/{id}/strang` legt ihn an (nur unter Ankündigungen,
  nur für Mitglieder des Kanals) und trägt die Person ein: Absenderin des Beitrags und Antwortende mit
  `notify_level = all`, wer nur liest mit `mentions` — daraus folgt „Push nur an Absenderin und Beteiligte“.
  **Strang-Mitgliedschaften sind `is_archived = true` angelegt**; damit fallen sie ohne Sonderfälle aus Raumliste,
  Badge, „Heute für dich“ und allen Ungelesen-Summen. `roomsFor()` und die Suche schließen `thread` zusätzlich aus.
  Schreiben darf, wer im Kanal ist, solange der Beitrag nicht gelöscht ist (`ChatRoomService::canPost`). Nach jeder
  Antwort schickt `afterReply()` den Beitrag als Ereignis `thread` in den Kanal; `presenter.thread` =
  `{room_id, count, last_at, last_user}` (Eager-Load `threadRoom.lastMessage.user`). Echtzeit-Nutzlasten aus einem
  Strang tragen `thread_of` — Web (`isThreadEvent`) und App werten sie nur fürs offene Blatt aus, nie für die Liste.
  `GET /nachrichten/{id}/antworten` = „Antworten auf diese Nachricht“ (Zitate im selben Raum). Der Raum-Export
  schreibt Strang-Antworten eingerückt unter den Beitrag.
- **D3 Aufgaben** (`ChatTaskService`, `chat_tasks`), **D5 Später senden / Erinnere mich** (`ChatScheduleService`,
  `chat_scheduled_messages`, `chat_reminders`) — beide im Minuten-Takt von `process-notification-automations`.
- **D4/D9 Karten**: Termin („Im Chat teilen“ in der Terminansicht) und Kundenservice-Ticket (Objekttyp `ticket`,
  nur mit `manage_support_tickets`); „Ticket anlegen …“ öffnet `/hub/kundenservice?neu=1&betreff=&text=`.
- **D6 Übersetzen** (`ChatTranslationService`, `chat_translations` je Nachricht und Sprache, Claude).
- **D7 glattt-Sticker** (`chat_sticker_packs`, `chat_stickers`): Paket „glattt“ (24 PNG, 512 px) liegt unter
  `public/images/chat-stickers/glattt` (`disk = null`), weitere Pakete lädt das Büro im Admin **Betrieb → Chat-Sticker**
  hoch (Chat-Speicher, Auslieferung `GET /sticker/{id}` mit Sitzung). Senden nur als `type = sticker` +
  `meta[sticker_id]` aus einem aktiven Paket — nie eine freie Bildadresse. Anzeige ohne Blase.
- **D8 Umfrage-Arten** (`chat_polls.kind` `poll|schedule|quiz`, `correct_key`; `chat_poll_votes.answer`):
  Terminfindung mit `answers[option] = yes|maybe|no` und `best` (meiste Ja, dann Vielleicht); Quiz mit genau einer,
  **endgültigen** Antwort, die Erstellerin rät nicht mit; Lösung und Zählung erst nach der eigenen Antwort (oder nach
  Ende), `results` je Person nur für die Erstellerin. Der Echtzeit-Anstoß geht an alle und ist deshalb **nicht
  persönlich** (`personal: false`) — Web und App laden die eigene Sicht über `GET /umfragen/{id}` nach, statt die
  eigene Stimme zu überschreiben.
- **D10 „Wer hat heute Dienst?“**: glatttBert-Werkzeug `get_duty_roster` (`ChatDutyService::roster`) — je Institut
  Schicht von/bis (Phorest, Cache) und Abwesenheit (askDANTE, nur Urlaub/Frei/Feiertag), heute oder morgen. Die
  Standort-Bindung der Fragenden **und im Team-Chat aller Mitlesenden** (`withAudience`) begrenzt die Institute;
  Hub-Werkzeuge im Raum nur nach der Raumregel aus Etappe A.
- **D11 Chat-Verwaltung** (Admin **Betrieb → Chat-Verwaltung**, `manage_chat`): Löschfrist je Raumtyp
  (`chat_retention_rules`, leer = unbegrenzt), angeheftete Nachrichten und Lesebestätigungen bleiben; Lauf einmal
  nachts ab 03:10 aus dem Minuten-Takt (`ChatRetentionJob`, höchstens 5.000 Nachrichten je Nacht), dabei verwaiste
  Dateien unter `chat/` (älter als zwei Tage, von keiner Zeile gemeint). Probelauf zählt nur. Export
  `GET /verwaltung/export/{raum}` streamt ein ZIP (`verlauf.txt`, `nachrichten.csv`, `anhaenge/`) über
  `maennchen/zipstream-php` — nie in `/tmp`, das auf Cloud Run Arbeitsspeicher ist; Protokoll `chat_exports`.
  Direktnachrichten lassen sich nicht exportieren.
- **D12 Desktop-App und Watch**: Chat-Zeilen tragen `data-ctx="chat"`, Nachrichten `data-ctx="chat-message"` mit
  `-room/-seq/-mine/-text`; das Preload (App 1.2.5) bietet Kopieren, Antworten, Als Aufgabe, Person anschreiben, Link —
  Befehle gehen per `postMessage` (`command: chat`) über `desktop-app-bridge` als Ereignis `glattt-chat-command` an den
  Chat. Die Watch bekommt im Endpunkt `/api/app/widgets/watch` den Block `chats` (höchstens fünf ungelesene Räume,
  **nicht** aus dem 5-Minuten-Cache) und die Seite `chats`.
- Tests: `ChatPollKindsTest`, `ChatStickerTest`, `ChatRetentionTest`, `ChatThreadTest`, `ChatDutyTest` (Dienstplan),
  `AppWatchSummaryTest` (Chats), `ChatTaskTest`, `ChatScheduleTest`, `ChatTranslationTest`; iOS
  `ChatPollKindsSnapshotTests`, `ChatSnapshotTests` (Strang), `WatchSummaryTests`.

### Anrufe (16.10.2026)

Priorität Jan (Freigabe C/D, 16.10.2026): „Call-Funktion inklusive Screen Sharing“. 1:1 im Einzelchat, Audio oder
Video, Bildschirmfreigabe als zusätzliche Videospur im selben Anruf. Die Medien laufen direkt zwischen den Geräten
(**WebRTC**), der Hub vermittelt nur.

- **Datenmodell:** `chat_calls` (Zustand `ringing → accepted → ended`, `end_reason` hangup | declined | missed |
  cancelled | busy | failed, `caller_device`/`callee_device`, `screen_shared`) und `chat_call_signals` (SDP,
  ICE-Kandidaten, Medienstand mit laufender ID).
- **`ChatCallService`:** jeder Übergang ist ein bedingtes UPDATE („nur wenn noch ringing“) — von zwei Geräten
  gewinnt das erste, Annehmen gegen Auflegen wirkt nur einmal. Besetzt, wenn die Angerufene schon telefoniert;
  rufen sich beide gleichzeitig an, verbindet der zweite Druck. Klingeln endet nach 45 s
  (`ChatCallTimeoutJob` auf der push-Warteschlange **und** beim nächsten Zugriff, falls die Warteschlange hängt).
  Angenommene Anrufe ohne Lebenszeichen (Ping alle 10 s) gelten nach 40 s als abgebrochen — kein hängendes
  „besetzt“. Signale nur nach der Annahme und nur von den beiden verbundenen Geräten, höchstens 64 KB.
- **Echtzeit:** eigener Ereignisname `chat.call` auf `private-chat.user.{id}` (alte Clients hören nur
  `chat.changed`), Nutzlast nur Kennungen. Signale holt der Client „ab ID X“ (`GET /anrufe/{id}/signale?nach=`):
  auf Anstoß sofort, ohne Live-Verbindung im 1–2-s-Takt, sonst alle 4 s; ein freier Tab ohne Live-Verbindung
  fragt alle 5 s nach eingehenden Anrufen.
- **Verhandlung:** Das **erste Angebot macht nur die Anruferin** (seit 16.10.2026, Web und iOS): Die Angerufene
  legt ihre Spuren an, bietet aber erst nach der ersten Gegenstelle selbst an — zwei gleichzeitige Angebote
  ließen Anrufe Mac ↔ iPhone bei „Verbinde …“ hängen. Kamera/Mikrofon haben eine Zeitgrenze von 6 s mit Rückfall
  auf Ton (am Mac hing die belegte iPhone-Kamera), und während des Annehmens setzt die Abfrage die Anzeige nicht
  auf „Annehmen“ zurück. Für spätere Neuverhandlungen gilt Perfect Negotiation, die Angerufene ist höflich. Jede PeerConnection hat eine Epoche, jedes
  Signal trägt sie; nach dem Neuladen steigt die Seite mit neuer Epoche ab `last_signal_id` ein, die Gegenseite
  baut für die größere Epoche neu auf (Regel `bindEpoch` in `chat-call.js`, per `npm test` geprüft). ICE-Neustart
  nach 4 s Funkstille, Aufgabe nach 25 s.
- **iOS-Takt (Build 115):** Abholen und Verarbeiten der Signale laufen außerhalb des abbrechbaren Takt-Tasks, jedes
  Signal wird in einem eigenen Task gesendet und bei Netzfehlern bis zu dreimal wiederholt. Vorher brach der Takt sich
  beim Verarbeiten des Angebots selbst ab — die Antwort des iPhones ging nie raus, Mac → iPhone hing bei „Verbinde …“.
- **Diagnose:** Beide Seiten schreiben `media.diag` ins Signal-Protokoll — einmal „hängt seit 6 s“ mit gesammelten
  Kandidaten-Arten, ICE-/Signalzustand und Server-Arten (ohne Zugangsdaten), einmal „verbunden nach X s über
  host/udp → prflx“. Bei Problemen zuerst `chat_call_signals` lesen. Die ICE-Server holt jede Verbindung frisch.
- **Prüfstand:** `scripts/anruf-pruefstand/run.sh` fährt die echte iOS-Engine im Simulator gegen den lokalen Hub mit
  Chromium als Gegenseite (beide Richtungen) plus die Browser-Tests; `ChatCallLiveBenchTests` überspringt sich ohne
  `GLATTT_CALL_BENCH`.
- **STUN/TURN:** `GET /anrufe/ice` liefert STUN (`STUN_URLS`) und, wenn eingerichtet, TURN mit zeitlich
  begrenzten Zugangsdaten (`TURN_URLS`, `TURN_SECRET`, HMAC-SHA1 wie coturn `use-auth-secret`, 6 h). Einrichtung
  der coturn-VM: `scripts/turn/TURN-SERVER-EINRICHTEN.md` im Hub-Repo. Admin → **Chat-Gesundheit** zeigt
  „Anrufe · TURN“ (Gespräche, nicht verbunden, Test-Knopf für einen Relay-Kandidaten).
- **Web:** `public/js/chat-call.js` (Regeln, Engine `GlatttCall`, Fenster `chatCallUi`), Fenster
  `layouts.partials.chat-call` per `@persist('chat-call')` — ein Gespräch überlebt `wire:navigate`. Ton über ein
  eigenes `<audio>`, Kamera und Ton der Gegenseite in einem selbst gebauten Strom, Bildschirm getrennt (angesagt
  per `media`-Signal mit `screen_stream`). Klingelton per WebAudio, nur ein Tab klingelt (Web Locks).
- **Geräteauswahl (Web/Desktop):** Knopf „Geräte“ im Anruffenster mit Mikrofon, Kamera und Tonausgabe
  (`enumerateDevices`, Wechsel per `replaceTrack` ohne Neuverhandlung, Ausgabe per `setSinkId`); die Wahl merkt sich
  der Browser (localStorage) und nutzt sie als `ideal`, nie als `exact` — ein abgestecktes Headset bricht so keinen
  Anruf.
- **Klingelton „Goldton“ (16.10.2026):** Glocken-Dreiklang aus WebAudio (`GOLD` in `chat-call.js`), ausgehend ein
  leiser Freiton derselben Klangfarbe; die iOS-App spielt denselben Ton als CallKit-Ton (`glattt-ring.caf`, gerendert
  von `scripts/anruf-klingelton/render.cjs`).
- **Mac-App außerhalb der App (ab 1.2.7):** schwebendes Anruf-Fenster über allen Apps, Mitteilung mit „Annehmen“,
  hüpfendes Dock-Symbol — Details in [Desktop-App](DESKTOP-APP.md), Abschnitt „Eingehende Anrufe“.
- **Desktop-App (ab 1.2.6):** `setDisplayMediaRequestHandler` mit eigener Bildschirmauswahl (`useSystemPicker:
  false`); fehlt die macOS-Freigabe „Bildschirmaufnahme“, erklärt die App das und öffnet die Systemeinstellungen,
  statt still zu scheitern. Entitlements `device.audio-input`/`device.camera`, Texte
  `NSMicrophoneUsageDescription`/`NSCameraUsageDescription`.
- **iOS/iPadOS:** Anrufe über CallKit + VoIP-Push, keine Katalog-Mitteilung an Geräte mit VoIP-Kennung
  (`skip_voip`) und kein Web-Anruffenster in der App — sonst klingelte das iPhone doppelt. **Bildschirm teilen**
  (Build 112) über die Übertragungs-Erweiterung `glatttHubBroadcast` (ganzer Bildschirm, `RPSystemBroadcastPickerView`
  mit vorausgewählter Erweiterung): sie reicht JPEG-Bilder (12 fps, ≤ 1280 px) über einen Unix-Socket im
  App-Gruppen-Container `group.com.glattt.hub` an die App (`BroadcastShared/ScreenShareWire.swift`, Socket-Pfad
  ≤ 104 Zeichen, sonst relativ), die App speist sie als Spur `glattt-screen` in den Anruf — gleiche Ansage wie
  Browser/Mac. Die Frage nach dem lokalen Netzwerk kommt beim ersten Öffnen des Chats, nicht mitten im Anruf.
- **Aushandlung auf iOS (Build 113):** Die höfliche Seite wartet ein laufendes eigenes Angebot ab und rollt nur
  in `have-local-offer` zurück — libwebrtc wirft bei Rollback im stabilen Zustand, und das Angebot der Gegenseite
  ging verloren (Anrufe Mac → iPhone hingen bei „Verbinde …“). Fehler beim Aushandeln schickt die App als `diag`
  im `media`-Signal; bei hängenden Anrufen zuerst `chat_call_signals` lesen: fehlt ein `answer`, ist es die
  Aushandlung, nicht das Netz.
- **Benachrichtigungen:** Anlässe `chat.call` (Push, nicht „dringend“ — Ruhezeiten gelten, Personen-Ausnahmen
  greifen) und `chat.call_missed` (Glocke + Push).
- **Spur im Verlauf:** Systemnachricht mit `meta.event = call` und `meta.call` (Art, Anruferin, Grund, Dauer,
  Bildschirm); der Presenter liefert `call`, die Clients formulieren aus eigener Sicht (`traceText`).

### Push

**Hinweis-Karten (Jan, 11.10.2026):** Jede Chat-Mitteilung trägt in `notifications.data` die
Push-Daten (`chat_room_id`, `chat_message_id`, `chat_sender`, `chat_room`, `chat_direct`,
`chat_initials`, `chat_color`, `chat_can_reply`); der Web-Endpunkt `/phorest/notifications` gibt sie
als `data` aus. Die Web-Karte (`hub-notices.js`, `.is-chat`) zeigt bei Chat-Mitteilungen das
Profilbild der Absenderin bzw. das Gruppenbild (Katalog-`image` aus `chatPayload`), sonst das
Kürzel in Institutsfarbe, als Titel „Kim @ Team Bielefeld“ (Regel-Titel `{kopf}`, Einzelchat nur der
Name) und darunter ein Antwortfeld: Tippen oder Fokus hält die Karte offen, Enter sendet als Antwort
auf die Nachricht über `POST /raeume/{id}/nachrichten`, danach „Gesendet ✓“ und die Karte geht zu.
Ankündigungen haben kein Antwortfeld. Die App liest `chat_initials` aus dem Push und zeichnet im
Vordergrund-Banner Kürzel oder Bild; im Hintergrund bleibt die Systemmitteilung mit „Antworten“.
Migration `2026_10_11_233100` zieht den Regel-Titel von `{raum}` auf `{kopf}` nach, weil der
Katalog Titel nur beim Anlegen setzt.

**iOS wie iMessage (Jan, 11.10.2026):** Chat-Pushes (`HUB_CHAT`) sind Kommunikations-Mitteilungen.
Die Erweiterung `glatttHubNotifications` (`ChatCommunication.apply`) hängt einen
`INSendMessageIntent` an: Absenderin als `INPerson` mit Profilbild (Anhang aus `image`) oder
gezeichnetem Kürzel in Institutsfarbe, Anzeigename = Push-Titel („Kim @ Team Bielefeld“ in **einer**
Zeile — bewusst ohne `speakableGroupName`, sonst zeigt iOS Absenderin und Gruppe zweizeilig), Gespräch
`chat-room-{id}`; iOS zeigt dann das Bild statt des App-Symbols und „Antworten“ mit Textfeld direkt in
der Mitteilung (`UNTextInputNotificationAction`, Antwort geht an denselben Nachrichten-Endpunkt). Im
Vordergrund zeigt die App dafür das Systembanner statt der eigenen Karte. Ein versendetes Foto erscheint als
Vorschau in der Mitteilung: `ChatPushPreview` legt eine verkleinerte, kurzlebige Kopie auf dem öffentlichen
Bild-Disk ab (`image`), das Profilbild reist getrennt als `chat_avatar`. **`mutable-content` setzt der Hub
bei jeder Chat-Push** (`ApplePushNotificationService`, Kategorie `HUB_CHAT`), nicht nur bei einem Bild — sonst
läuft die Erweiterung bei Textnachrichten nicht und die Mitteilung zeigt das App-Symbol statt des Profilbilds
(Befund 312, 11.10.2026). Bild nur als
`INImage(imageData:)` — Datei-URLs liest der Bild-Proxy nicht. Voraussetzung: Capability
„Communication Notifications“ nur an der App (die Erweiterung trägt `IntentsSupported` in der Info.plist, das
Entitlement dort bricht den Export). Prüfstand: `simctl push` startet die Erweiterung
im Simulator nicht, deshalb `-glatttProbeChatNotice` (siehe Wissen `ios-chat-kommunikations-mitteilungen`).

Drei Katalog-Anlässe (`HubEventRegistry`, Modul „Nachrichten & Dashboards“): `chat.message`
(nur Push), `chat.mention` (nur Push, schlägt Stummschaltung), `chat.announcement` (In-App und
Push, dringend = zeitkritisch). `ChatPushService` filtert die Empfänger: ohne Absenderin, ohne
Stummgeschaltete, ohne wer den Raum gerade offen hat (Cache-Marke aus dem Lesestand-Ping `viewing`).
Die Ruhezeit prüft seit 14.10.2026 zentral der Dispatcher ([Ruhezeiten](RUHEZEITEN.md)); dafür trägt
`chatPushData` die `chat_sender_id`. Die Chatliste bekommt den Haken-Stand der letzten eigenen
Nachricht als `last_message.status`. Der Dispatcher setzt eigene
Zusatzdaten: `module` = `chat-room-{id}` (thread-id je Raum), Kategorie `HUB_CHAT` mit
Direkt-Antwort in der App, Ziel `/hub/chat/raum/{id}`. Der Text respektiert
`preview_in_push` je Person.

**Zustellhaken aus der Push (Jan, 15.10.2026):** Der zweite Haken heißt „auf mindestens einem Gerät
angekommen“, nicht mehr „ein Chat war offen“. `PushNotificationService::queueNotifications` hängt jeder
Chat-Push je Empfängerin `data.chat_ack` an (`ChatPushReceipt`): eine relativ signierte, 7 Tage gültige
Adresse `POST /api/push/chat-delivered/{user}/{room}/{seq}` auf `PUBLIC_URL` (nicht `APP_URL`, das ist auf
Prod die gesperrte run.app; nicht der App-Host, dort verlangt jede Anfrage den Gerätenachweis). Ohne
Sitzung aufrufbar, die Signatur bindet Person, Raum und Stand; `ChatPushDeliveredController` setzt
`markDelivered` und stößt den Haken beim Absender an. Aufrufer: die iOS-Mitteilungserweiterung (vor dem
Ausliefern, 5 s Zeitlimit, ab Build 103), die Desktop-App im Hauptprozess (ab 1.1.8, nur `https` auf
`*.glattt.com`) und der Service Worker (gleicher Ursprung). Kein Push (stumm, Ruhezeit, Raum offen) →
kein Haken bis zum Öffnen. Bremse 600/min, weil hinter dem Load Balancer alle dieselbe IP haben.

**Auch aufs Handy, wenn am Mac im Chat (15.10.2026):** Schalter `push_while_viewing` in
`chat_user_settings` (Chat-Einstellungen → Push-Vorschau, Standard aus). Die Anwesenheits-Marke
merkt sich die Quelle (`ChatPushService::viewingSource()`: iOS-App bzw. Handy-Browser = `phone`,
sonst `desktop`). Sieht jemand den Raum am Rechner und hat den Schalter an, geht die Push trotzdem
raus — aber mit `phone_only`, und `PushNotificationService::sendToUsers` nimmt dann nur Abos mit
`device_type` `ios`/`android`. Wer in der App im Raum ist, bekommt weiter nichts.

**„Sieht den Raum“ nur mit Fokus (15.10.2026):** Web-`isViewing()` verlangt `document.hasFocus()`;
`blur` meldet `viewing: false`. Ein Fenster hinter einer anderen App bleibt für die Seite `visible` —
die Mitteilung wurde unterdrückt und hätte ungesehen „gelesen“ gemeldet (Wissen
`sichtbar-heisst-nicht-angesehen`). Dazu lädt der Web-Chat bei Fokus, Netz zurück und Aufwachen nach
und gleicht sich mindestens jede Minute ab, auch bei „live“ — verlorene Anstöße (Reverb-Neustart beim
Deploy) kosten höchstens eine Minute.

### Endpunkte (`/hub/chat`, Recht `use_chat`)

| Methode & Pfad | Zweck |
|---|---|
| `GET /data` | Einstieg: `me`, `rooms`, `today`, `settings`, `live`, `permissions`, `bert_available`, `cursor` (Stand des Ereignis-Protokolls) |
| `GET /sync?since=&client=&device=&live=&version=&gap=` | Abgleich „alles ab Ereignis X über alle Räume“ (seit 16.10.2026): `events` (mit kompakter Nachricht), `rooms` (berührte Zeilen), `cursor`, `limited`, `reset`, `unread_total`; trägt das Lebenszeichen des Geräts für „Chat-Gesundheit“ |
| `POST /client-fehler` (`client`, `device`, `version`, `count`, `status`, `text`) | Ein Client meldet **anhaltende Abgleich-Fehler** (ab dem dritten in Folge; seit 22.10.2026). Eigener Endpunkt ohne Abhängigkeit vom Abgleich — der Fehler vom 16.10.2026 (422 durch ungekodiertes „+“ in `since_at`) wäre sonst nie angekommen. Speichert `sync_errors`, `last_error_*` am Lebenszeichen, „Chat-Gesundheit“ zeigt das Gerät unter „Probleme“ rot |
| `GET /suche?raum=&art=media\|file\|link` | Reiter **Medien · Dateien · Links** der Infos (Web und App, neueste zuerst, 40) |
| `GET /kontakte`, `GET /suche?q=`, `GET /objekte?q=`, `GET /gifs?q=` | Kontakte, Nachrichtensuche (Teilwort), Hub-Objekte aus der globalen Suche, GIFs (KLIPY, `KLIPY_API_KEY` — Tenor-API seit 30.06.2026 abgeschaltet; Suche/Trending über `api.klipy.com/api/v1/{key}/gifs/…`, Pflicht-Platzhalter „Search KLIPY“, `customer_id` anonymer Hash je Nutzerin) |
| `POST /direkt`, `POST /raeume` | Einzelchat, Gruppe anlegen (`name`, `description`, `user_ids[]`, `members_can_add`, `members_can_post`; das Bild folgt über `POST …/bild`) |
| `GET /raeume/{id}`, `PATCH /raeume/{id}` | Raum mit Mitgliedern und Verlauf; Name/Beschreibung, `members_can_add`/`members_can_post` (nur Admins eigener Gruppen), `muted_until` (`1h`, `8h`, `1w`, `forever`, `off`), `is_pinned`, `is_archived` |
| `GET /raeume/{id}/nachrichten?before=\|since=` | Verlauf blättern / Nachladen ab Stand |
| `POST /raeume/{id}/nachrichten` | Senden (multipart: `body`, `client_uuid`, `type`, `reply_to_id`, `mention_ids[]`, `files[]`, `duration_ms`, `waveform`, `poll[...]`, `meta[object]`, `meta[media]`, `is_urgent`, `requires_ack`) |
| `POST /raeume/{id}/gelesen`, `POST /raeume/{id}/ungelesen`, `POST /zugestellt`, `POST /raeume/{id}/tippt` | Lesestand (+`viewing`; nie zurück), „als ungelesen markieren“ (Lesestand genau eine Nachricht zurück — die einzige Stelle, an der er rückwärts läuft), Zustellstand je Raum, „schreibt gerade“ |
| `POST/DELETE /raeume/{id}/mitglieder[/{user}]`, `PATCH …/{user}` | Mitglieder, Rolle |
| `PATCH/DELETE /nachrichten/{id}`, `POST …/reaktion`, `…/anheften`, `…/weiterleiten`, `…/bestaetigen` | Bearbeiten, Löschen, Reaktion, Anheften, Weiterleiten, Lesebestätigung |
| `GET /umfragen/{id}`, `POST /umfragen/{id}/abstimmen` (`options[]` bzw. `answers[key]`), `…/beenden` | Umfragen, Terminfindung, Quiz; GET = persönliche Sicht nach einem Echtzeit-Anstoß |
| `GET /nachrichten/{id}/strang`, `GET /nachrichten/{id}/antworten` | Antwortstrang unter einer Ankündigung öffnen (legt an, trägt ein), Antworten auf eine Nachricht |
| `GET /sticker-pakete`, `GET /sticker/{id}` | Sticker-Pakete, hochgeladene Sticker |
| `GET /verwaltung/export/{id}` | Raum als ZIP (`manage_chat`, keine Direktnachrichten) |
| `GET /anhang/{id}`, `GET /raeume/{id}/bild`, `POST …/bild` | Anhänge und Gruppenbild (privater Bucket) |
| `PATCH /einstellungen` | Nicht stören, Push-Vorschau |
| `POST /raeume/{id}/anruf` (`kind` audio\|video, `device`) | Anruf starten (nur Einzelchat); Antwort `call` aus eigener Sicht, bei besetzter Gegenseite sofort `ended/busy` |
| `GET /anrufe/aktiv?device=`, `GET /anrufe/{id}?device=` | offener Anruf (Neuladen, Push, Aufwachen) bzw. Stand; `elsewhere` = läuft auf einem anderen eigenen Gerät, `last_signal_id` = Einstieg nach dem Neuladen |
| `POST /anrufe/{id}/annehmen`, `…/auflegen`, `…/fehler`, `…/ping` | Annehmen (erstes Gerät gewinnt), Ablehnen/Abbrechen/Auflegen je nach Stand, Verbindung gescheitert, Lebenszeichen |
| `POST /anrufe/{id}/signal` (`kind` description\|candidate\|media, `payload`), `GET …/signale?nach=` | Signalisierung zwischen den beiden verbundenen Geräten |
| `GET /anrufe/ice` | STUN/TURN-Server mit Zugangsdaten auf Zeit (`Cache-Control: no-store`) |
| `GET /hub/chat`, `GET /hub/chat/raum/{id}[?seq=]` | Seite und Deep-Link (Web zeigt den Raum, App ihre native Unterhaltung) |

Fachliche Fehler kommen als 422/403 mit deutscher `message`.

### Web

`public/js/chat.js` liefert einen Bauplan für Vollseite (`chatPage`) und Seitenpanel
(`chatDock`, `@persist` im Layout, ⌘⇧C): optimistisches Senden mit Client-UUID, Warteschlange
ohne Netz, Entwürfe je Chat in `localStorage`, Echtzeit über `GlatttLive`, Sprachaufnahme über
`MediaRecorder` mit Pegel-Wellenform, Erwähnungen, Umfragen, Hub-Karten, GIFs. Der Zähler geht
als `glattt:chat-unread` an Seitenleiste, Bottom-Nav und native Badges. Theme-Abschnitt
„TEAM-CHAT“ in `theme_glattt.css`.

Seit 11.10.2026 (Jan): Die Seite `/hub/chat` hat **keinen Seitenkopf** — die Chatfläche
(`.chat-shell`) füllt die Höhe bis zum unteren Rand wie die Seitenleiste
(`100dvh − Layout-Offsets`, Mindesthöhe 30 rem, darunter scrollt die Seite). „Neuer Chat“ ist der
goldene Stift (`.chat-new-btn`) in der Werkzeugleiste der Liste, die Erklärung das ⓘ daneben.
**Suche im Kopf der Unterhaltung** (`roomSearch` in `chat.js`): Die Lupe ersetzt den Titel durch
ein Feld, `GET /suche?q=&raum={id}` liefert Treffer nur dieses Raums, die Leiste
`.chat-inline-search` unter dem Kopf springt per `jumpTo(seq)`; Esc/✕ schließt, Raumwechsel
schließt mit. Das Fenster „Nachrichten suchen“ (alle Chats) bleibt an der Lupe der Liste.
**Akten-Karte (Jan, 11.10.2026, Entwurf 1 von drei):** Beim Senden einer Hub-Karte friert
`ChatObjectEnricher` je Art ein Faktenpaket in `meta.object` ein — `facts` (vier Label/Wert-Paare),
`status` (`label`, `tone` ok|warn|bad|neutral), `progress` (Verträge: bezahlte Raten / Anzahl),
`initials`, `subtitle` (Nummer · Institut), `as_of`. Kundin: Telefon, nächster Termin
(`stats_historic_appointments` ab heute), Vertrag mit Status, letzter Besuch; Vertrag: Paket in KPZ,
Rate und Stand x/y, nächste Rate, Zahlungsart; Forderungsfall: offener Betrag (`openCents()`), Stufe,
Frist, Eingang; Widerruf: Eingang, Grund, Zendesk-Nr., SEPA-Stand. Die Rechte der **Absenderin**
entscheiden (`view_clients`, `view_contracts`, `view_receivables`, `view_revocations`); ohne Recht
bleibt die Karte Name und Nummer, ältere Karten ohne `facts` zeigen weiter die Kurzform. Kundendaten
kommen aus `client_statistics`, nie live aus Phorest (kein Netz beim Senden). Web `.chat-card`, App
`aktenKarte()` in `ChatRoomView` mit `ChatCardPhoto` über die Hub-Sitzung.
**Nachricht-Info mit Zeitpunkt:** `chat_room_members.last_delivered_at` (neu) und `last_read_at`
liefern je Person „wann“ (`read_at`/`delivered_at` als `user_id → ISO` an der Nachricht); genau für
die zuletzt gelesene Nachricht, für ältere der Zeitpunkt desselben Lese-Schwungs. **Eine Reaktion
je Person** (wie WhatsApp): ein anderes Emoji ersetzt die eigene, dasselbe nimmt sie zurück; Web und
App heben das eigene Emoji hervor. **Hub-Karten** werden aus dem Plus je Art gewählt (Kundin,
Vertrag, Fall — der Dialog zeigt nur diese Art), liegen dann in der Eingabezeile und gehen mit dem
Text in einer Nachricht (`type=object` + `meta[object]` + `body`). **Leere Einzelchats** stehen erst
mit der ersten Nachricht in der Liste. `muted_until` ist DATETIME (TIMESTAMP endete 2038, „Immer“
schrieb 2076). **Animationen:** Infospalte fährt von rechts (Rasterspalte 0 → 19 rem), Plus-Menü
klappt aus dem Knopf (Plus dreht zum ✕), neue Nachrichten gleiten herein (`.is-entered`), die
Kopf-Suche wächst aus der Lupe; in der App dieselben Übergänge per `.transition`/`.animation`.
**Archiv:** `GET /data?archiv=1` liefert auch archivierte Räume; Web und App zeigen sie nur im
Filter „Archiv“ (Zähler am Chip) und holen sie über das Zeilenmenü bzw. Wischen zurück. Ungelesen-
Zähler und Push lassen archivierte Räume weiter aus.
Die drei Werkzeuge der Liste (Nachrichten durchsuchen, Nicht stören, Erklärung) liegen hinter einem
**Zahnrad** (`.chat-list-menu`). **Reaktionen** zeigen die sechs zuletzt genutzten Emojis
(`localStorage glattthub.chat.recentEmoji`, je Browser), „+“ öffnet ein Raster (`ALL_EMOJI` in
`chat.js`) und ein freies Feld, das das erste Grapheme einer Eingabe als Reaktion schickt
(`Intl.Segmenter`, Prüfung `\p{Extended_Pictographic}`); der Endpunkt nimmt bis 16 Zeichen
(Spalte `chat_reactions.emoji` string(16), also auch Flaggen und ZWJ-Folgen).
Fallstricke derselben Runde: `search-glattt-wrapper-flex` ist nur für Kopfzeilen (im Modal wird
`flex-basis` zur Höhe); ein offenes Zeilenmenü hebt seine Zeile per `z-index` über die
folgenden, weil jede Zeile positioniert ist; zwischen `.form-glattt-group` und
`.form-glattt-row` gilt jetzt derselbe Stapel-Abstand wie zwischen zwei Gruppen.

### iOS/iPadOS

`ChatView` (Haupttab „Chat“, ersetzt Berichte in der Leiste), `ChatRoomView` (Detailseite ohne
Tab-Leiste bzw. mittlere Spalte auf dem iPad), `ChatRoomInfoView` (Kontextspalte/Blatt),
Blätter für neuen Chat, Mitglieder, Weiterleiten, Umfrage, Suche, Einstellungen,
Nachricht-Info. „Neue Gruppe“ folgt seit 11.10.2026 Entwurf 1 „Wie WhatsApp“ (Befund 273):
Schritt 1 Mitglieder mit Chips, Schritt 2 Gruppenseite mit Bild (Album), Name, Beschreibung,
Mitgliederzeile und den Einstellungen „Mitglieder hinzufügen“ / „Nachrichten schreiben“ je
„Alle“ oder „Nur Admins“; auf dem iPad liegen beide Schritte nebeneinander. **Chat-Profil „Kontaktkarte“ (Entwurf 1, Jan, 21.10.2026):** `ChatRoomInfoView` + `ChatProfile.swift` —
Kopf (Avatar 96 pt, Name, Rolle mit Institut-Tag, **Dienststatus** statt „Zuletzt aktiv“: ein Aktivitätsstempel der
Kolleginnen ist nicht freigegeben), Knopfreihe (Anruf/Video nur im Einzelchat, Suche nur im Blatt, Stumm/Laut), Reiter
Medien/Dateien/Links über `ChatModel.roomAssets` (dieselbe Suche wie im Web, je Reiter einmal geladen, Antippen springt zur
Nachricht), Einstellungen in einer Hub-Karte, bei Gruppen Angeheftet, Mitglieder und Gruppen-Einstellungen. Gruppenanrufe gibt es
nicht, daher dort kein Anruf-Knopf. Die Gruppen-Info
zeigt dieselben Einstellungen für Admins und blendet „Hinzufügen“ nach `can_add_members` ein. `ChatModel` hält Räume, Verlauf, Warteschlange und Offline-Stand
(`OfflineStore`, Schlüssel `chat`), `ChatLiveClient` die Reverb-Verbindung (Kanal je Nutzerin
plus offener Raum, Backoff 1…60 s), `ChatRecorder`/`ChatPlayer` die Sprachnachrichten. Push:
Kategorie `HUB_CHAT` mit „Antworten“ (Texteingabe, derselbe Sende-Endpunkt) — im offenen Raum
kein Banner. Details im Abschnitt „Nativer Team-Chat“ in [IOS-APP](IOS-APP.md).

**Look wie WhatsApp (Entscheidung Jan, 11.10.2026, Entwurf 3 + Tapete A):** Alle Züge stecken in
`ChatLook` (`ios/glatttHub/Chat/ChatLook.swift`, Standard `ChatLook.current`, über die Umgebung
`\.chatLook` umschaltbar): kräftig abgesetzte Blasen (`ownFill`/`otherFill`) mit **Schwänzchen oben
außen** an der ersten Blase einer Gruppe (`ChatBubbleShape` — der Körper ist auf der Außenseite
immer um die Schwanzbreite eingerückt, damit die lange Kante der Gruppe bündig bleibt), 17 pt Text,
4 pt in der Gruppe / 14 pt zwischen Personen, feste **Namensfarbe je Person** (`senderColor`), Avatar
in Gruppen **oben** neben der ersten Blase, **Tapete** `logoCoarse` (die Marke aus `LogoMark` 46 pt
alle 118 pt, versetzt, 9–11 % Gold; weitere Stile `symbols`, `logoFine`, `logoWatermark` nur für
Entwürfe), Eingabezeile mit GIF im Feld, Kamera daneben und gold gefülltem Mikrofon,
**Ungelesen-Trenner** („n ungelesene Nachrichten“, Lesestand beim Öffnen in `unreadMarkSeq`
eingefroren, der Verlauf springt dorthin) und **Pfeil nach unten** mit Zähler (Sichtbarkeit der
Endmarke über `onGeometryChange` in `.scrollView`-Koordinaten). Lato bleibt, Haken bleiben türkis.
`ChatLook.legacy` und `named("1"…"3c")` liefern die alten Entwürfe für Vergleichsbilder
(`ChatRoomLiveLayoutTests`, `CHAT_LOOKS`). Wissen: `chat-look-wie-whatsapp`.

### Fallstricke
- **Offene Fenster behalten alten Code** (16.10.2026): `wire:navigate` lädt Skripte nie neu, die Desktop-App läuft
  tagelang — Joanna bekam Nachrichten mit Chat-Code von vor Etappe A 20 Minuten zu spät. Seiten tragen
  `<meta name="glattthub-build">`, der Chat-Abgleich liefert `build`; `public/js/build-watch.js` lädt bei neuem
  Stand beim nächsten Seitenwechsel ganz neu, stehende Seiten in einem ruhigen Moment (nie im Anruf, nie beim
  Tippen, nie mit offenem Modal).
- **Bremsen brauchen einen eigenen Schlüssel** (16.10.2026): `throttle:N,M` ohne dritten Wert zählt alle Routen
  einer Person gemeinsam — Tippen bremste das Senden, Anruf-Signale die Pings. Alle Chat-Routen tragen
  `throttle:N,M,chat.<route>`.
- **Mikrofon und Kamera brauchen die Permissions-Policy** (16.10.2026): `SecurityHeaders` sperrte beides,
  seit 16.10.2026 `(self)` für Kamera, Mikrofon und Bildschirmaufnahme.
- **SDP nie durch TrimStrings**: Der Signal-Endpunkt liest die Nutzlast roh, sonst fehlt das abschließende CRLF.
- **Echtzeit-Anstöße sind nicht persönlich** (D8, 16.10.2026): `messageChanged` geht an alle Mitglieder ohne
  `meId` — eigene Stimme, Quiz-Lösung und Auswertung fehlen darin. Clients übernehmen eine Umfrage mit
  `personal: false` nie über den bekannten Stand, sondern laden `GET /umfragen/{id}` nach.
- **Strang-Räume nie in Listen** (D2): Wer einen neuen Raumtyp einführt, prüft jede Abfrage über
  `chat_room_members` — Strang-Mitgliedschaften sind deshalb archiviert angelegt; ältere App-Builds laden bei einem
  Strang-Ereignis einmal neu (`!rooms.contains`), neue werten `thread_of` aus.
- **Sticker und GIFs nie als freie Bildadresse** (D7): Sticker kommen nur über `meta[sticker_id]`, GIFs nur von
  erlaubten Hosts — eine fremde Adresse wäre bei allen Mitgliedern ein Zählpixel.

- **`ImageRenderer` rastert keine `List`, `ScrollView` oder `Menu`** — die Snapshot-Tests
  schalten über `appointmentsStaticLayout` auf feste Stapel (`ChatSnapshotTests`).
- **`ISO8601DateFormatter` ist nicht `Sendable`** — je Aufruf eine Instanz (`ChatFormat`).
- **`HubSession.imageData` nimmt nur `image/*` an** — eine Sprachnachricht (`audio/mp4`) kam damit nie
  zum Player (Befund 317, 12.10.2026). Anhänge und Sprachnachrichten laden über `fileData`.
- **Wischen zum Antworten nur als `simultaneousGesture`** — als `.gesture` verlor der Zug gegen
  Textauswahl (`textSelection`) und Verlauf und kam nie an (Befund 316); senkrechte Bewegung nimmt
  den Zug zurück, waagerechte zieht die Blase und blendet das Antwort-Symbol ein.
- **`GeometryProxy.bounds(of: .scrollView)` liefert auf dem Gerät nil** — der Pfeil nach unten stand
  deshalb auch am Ende (Befund 315); die Endmarke wird gegen die gemessene Höhe des Verlaufs geprüft.
- **Reverb-Nutzlast ≤ 10 KB** — `messageCompact` kürzt den Text auf 4.000 Zeichen; Haken
  kommen nie über den Anstoß, sondern aus Serverantwort und `chat.activity`.
- **Jeder Deploy startet Reverb neu** — Clients bauen neu auf und holen Verpasstes über
  `/sync?since=` nach; nie auf einen verpassten Anstoß vertrauen, Cursor nie aus dem Anstoß setzen
  (Cursor-Grace-Regel, siehe „Abgleich“).
- **Push im offenen Raum** unterdrückt der Hub über die `viewing`-Marke (40 s); die App
  pingt alle 25 s, das Web ebenso — aber nur mit Fenster-Fokus, sonst gilt ein Fenster hinter
  einer anderen App als „sieht hin“.
- **Keine Verschlüsselung auf Nachrichtenebene** (Jan: Suche wie WhatsApp) — Cloud SQL
  verschlüsselt ruhend, der Transport über TLS; Anhänge liegen im privaten Bucket und werden
  nur über `/anhang/{id}` mit Mitgliedschaftsprüfung ausgeliefert.
- **Android** kommt über die Browser-Freischaltung auf den App-Host (Plattform `browser`,
  ohne App Attest, siehe [APP-GERAETE-FREISCHALTUNG](APP-GERAETE-FREISCHALTUNG.md)).

### Robustheit und Flüssigkeit (21./22.10.2026)

Auslöser: Die iPhone-App bekam seit der Etappe B bei **jedem** Abgleich ein 422 (ungekodiertes „+“ in `since_at`) und schluckte
es still; dazu Rückmeldungen „Chat ruckelt“. Maßnahmen und Regeln:

- **Abgleich-Fehler sichtbar:** `POST /client-fehler` (siehe Endpunkte), App, Web und Mac-App melden ab dem dritten Fehlschlag in Folge,
  `chat_client_heartbeats.sync_errors` + `last_error_*`, Probleme-Liste „Abgleich fehlt“ (rot), ein erfolgreicher Abgleich beendet die Serie.
  `ChatController::sync` repariert ein ungekodiertes „+“ (ältere App-Builds); `HubSession.json` kodiert „+“ als `%2B`.
- **Abgelaufene Sitzung:** Torwächter `GlatttChatSync.authGate` (`chat-sync.js`): erster 401/419 pausiert nicht, dann 10, 20, 40 … höchstens 300 s;
  Chat und Anruf-Fenster klopfen nicht mehr jede Sekunde an; Senden bei 401/419 geht in die Warteschlange; `session-guard:resumed`
  öffnet ihn. Hintergrund: 2.600 Aufrufe mit 401 in 7 Tagen von einem Desktop-Gerät.
- **Sticker und GIF** tragen die Antwort, haben eine vorläufige Blase und laufen über die Warteschlange (`ChatModel.sendMedia`) — wie Text.
- **Liste:** stabile Kennung je Nachricht (`ChatMessageItem.stableKey` = `client_uuid`), sonst blinkte die Blase beim Ersetzen der vorläufigen
  Zeile; **ein** Scroll ans Ende mit derselben Feder wie das Einfliegen (`ChatRoomView.messageSpring`), Einflug-Animation nur bei neuem Ende;
  Eingabeleiste mit einer Animation (`ComposerPhase`).
- **Formatter nie je Aufruf bauen:** `ChatFormat` hält gemeinsame `ISO8601DateFormatter`/`DateFormatter` und einen Zeitstempel-Zwischenspeicher
  (3,7 s von ~12 s Hauptthread-Arbeit in der Messung); ein `NSDataDetector` für Links.
- **Push-Öffnen:** `HubTabBarController.openDetail` schiebt nur animiert, wenn die App aktiv und der Tab schon offen war; Chat-Bilder liegen
  zusätzlich auf der Platte (`ChatImageCache`, im Offline-Ordner, wird mit Abmelden/Nutzerwechsel gelöscht).
- **Messen statt behaupten:** `ios/scripts/chat-smooth.sh` (UI-Test `ChatSmoothUITests` + App-Messfühler `HitchProbe` + `hitch-report.py`) und
  `video-jank.py` für Aufnahmen vom iPhone; Rezept im Projektwissen `chat-ruckeln-messen-und-beheben`. Simulator-Zahlen sind Anhaltspunkte.
- **Offen:** neue Nachricht aus der Mitteilung sofort in den Raum legen (Duplikat-Regel), Erstzugriff-Aussetzer beim ersten Öffnen von Menü und
  GIF-Blatt auf dem Gerät prüfen, Anruf-Zeilen im Verlauf zusammenfassen, Cloud-Scheduler-Jobs um :00 versetzen (Abgleich dauert zur vollen Stunde 3–4 s).

### Relevante Tests

`tests/Feature/Chat/` (Räume, Nachrichten, Push-Empfänger, Katalog-Weg, Endpunkte, Seite, `ChatCallTest` für
Anrufe), `tests/js/chat-call.test.mjs` (Epochen, Spur, Endtexte), `ios/glatttHubTests/ChatCallPeerTests.swift`
(echte Peers: Delegate-Thread, Kollision und Rollback), `ChatScreenShareTests` (Übertragungs-Weg),
`tests/Feature/App/BrowserEnrollmentTest.php`, `ios/glatttHubTests/ChatSnapshotTests.swift`,
`ios/glatttHubUITests/ChatUITests.swift`.

## Changelog

- **22.10.2026 (robuster und glatter)** — Abgleich-Fehler der App behoben und überwacht, Torwächter bei abgelaufener Sitzung, Sticker/GIF mit
  Antwort und Warteschlange, Chat-Profil „Kontaktkarte“ (Medien, Dateien, Links), Glättung (Formatter, stabile Kennung, ein Scroll, Plattencache),
  Push-Öffnen ohne Schiebe-Animation, Messvorrichtung. App 1.5.2.

- **16.10.2026 (Anrufe nachgeschärft)** — Geräteauswahl im Anruf, Teilen in der Desktop-App 1.2.6 mit
  Freigabe-Hinweis, Teilen auf iPhone/iPad (Build 112), kein doppeltes Klingeln (Build 111), Aushandlung Mac → iPhone
  repariert (Builds 113–115: nur die Anruferin bietet an, Antwort nicht mehr vom eigenen Takt abgebrochen),
  Diagnose je Anruf, Anruf-Prüfstand, veraltete Fenster laden bei neuem Stand neu; Klingelton „Goldton“ und
  Anruf-Fenster auf dem Mac (1.2.7); ein Tab ohne Echtzeit-Verbindung klingelte nach dem Auflegen weiter.

- **16.10.2026 (Etappe D)** — Antwortstränge unter Ankündigungen und „Antworten anzeigen“, Terminfindung und Quiz,
  glattt-Sticker, Aufgaben, Später senden und Erinnern, Übersetzen, Termin- und Ticket-Karten, glatttBert-Dienstplan,
  Löschfristen/Export/Aufräumen im Admin, Rechtsklick der Desktop-App (1.2.5), ungelesene Chats auf der Watch.

- **16.10.2026 (Etappe C)** — Übergabe-Karte, Dienststatus aus Dienstplan, Checklisten im Team-Raum, „Verpasst“ mit
  glatttBert, Transkripte für Sprachnachrichten, Mitteilungen dreistufig mit @alle und Stichwörtern, Barrierefreiheit,
  Einführung und Leerzustände.

- **16.10.2026 (Anrufe)** — 1:1 Sprach- und Videoanrufe mit Bildschirmfreigabe (WebRTC), Klingeln auf jeder
  Hub-Seite, Fenster über Seitenwechsel hinweg, Spur mit Zurückrufen, STUN/TURN mit Zugangsdaten auf Zeit,
  Chat-Gesundheit „Anrufe · TURN“, Desktop-App mit Bildschirmauswahl. Nebenbei: Permissions-Policy erlaubt
  Mikrofon/Kamera für den Hub, Chat-Bremsen mit eigenem Zähler je Endpunkt.

- **16.10.2026 (Etappe B)** — Volltextsuche mit Filtern, Gespeichert, Medien-Reiter mit Vorschaubild und BlurHash, Link-Vorschau mit SSRF-Schutz, Lesebestätigung mit Frist/Erinnerung/Eskalation/CSV, Nachricht-Info neutral, Optik wie die App, gebündelter Zustandsstand, eigene Geräte gleichziehen, ein Abgleich je Browser.
- **16.10.2026** — Etappe A „Verlässlich“ (Ausbauplan, Jan 15.10.2026): Ereignis-Protokoll `chat_events`
  mit globalem Cursor und `GET /hub/chat/sync` statt Minuten-Volllauf; Lückenregel und Zombie-Prüfung in
  Web und App (`chat-sync.js`, `ChatSyncRule`); persistente Warteschlange (IndexedDB / Platte) mit Uhr,
  Backoff und Band „wartet auf Netz“; Verbindungszustand im Kopf; Push-Versand im Worker
  (`ChatPushFanoutJob`); Bremsen je Nutzerin und die 500er-Fallen (Stummschalt-Wert, Doppel-Senden,
  Bearbeiten ohne Mitgliedschaft, fremde GIF-Quellen); glatttBert ohne Hub-Daten in Räumen mit Mitgliedern
  ohne Bert-Recht; Admin-Seite **Chat-Gesundheit** (Reverb, Geräte, Push-Latenz, Lücken).
- **15.10.2026 (abends)** — Schalter „Mitteilungen aufs Handy, auch wenn ich am Mac im Chat bin“
  (`push_while_viewing`, Push dann nur an iPhone/iPad/Android).
- **15.10.2026** — Zweiter Haken aus der Push-Mitteilung (iOS-Erweiterung Build 103, Desktop-App 1.1.8,
  Service Worker); „sieht den Raum“ nur mit Fenster-Fokus; Web-Chat lädt bei Fokus/Netz/Aufwachen nach
  und gleicht sich jede Minute ab, Haken im offenen Verlauf aus dem Listenstand (Joanna: Nachrichten erst
  nach „Aktualisieren“, keine Mitteilung bei Fenster im Hintergrund).
- **14.10.2026 (nachts)** — Personen ohne Stamm-Institut zeigen ihr **Bereichs-Kürzel** (grau) statt
  eines leeren Badges, die **Position** steht als Unterzeile (Mitglieder, Einzelchat-Kopf, Neuer Chat,
  der nach Bereich gliedert). Fix: Badges ohne Kürzel waren sichtbar, weil `instStyle()` einen
  Text-`:style` lieferte und damit das `display:none` von `x-show` überschrieb — jetzt als Objekt.
- **14.10.2026 (abends)** — Web: flüssiger Chatwechsel ohne leere Fläche (alter Verlauf bleibt
  gedimmt stehen, Räume im Speicher `roomCache`, Vorladen beim Drüberfahren, weiches Einblenden per
  Web Animations API), kein Sprung beim Öffnen (Ziel steht vor dem Tausch fest, `keepBottomPinned`
  beobachtet die Hülle `.chat-timeline-content` und rückt vor dem Zeichnen nach, Medien reservieren
  ihre Größe über `mediaBox()`), Ungelesen-Trenner, Entwürfe in der Liste, Tipp-Blase mit Foto und
  „schreibt …“ in der Liste, Liste gleitet beim Umsortieren (FLIP), Filterleiste bis zur Kante,
  Tastatur `/` und Esc, Ablagefläche beim Ziehen, Ladeplatzhalter, neues Fenster „Neuer Chat“ (nach
  Institut gegliedert, gleitender Umschalter, Auswahl als Chips), Haken in der Liste wie im Verlauf,
  Standort-Badge in Institutsfarbe. „Nicht stören“ wird zu den [Ruhezeiten](RUHEZEITEN.md).
- **14.10.2026** — Web: Mikrofon-Knopf nur noch in der iOS-App (`canRecord` in `public/js/chat.js`
  prüft `meta[name="glattthub-app"]` auf `ios`); im Browser und in der Desktop-App steht dort der
  Senden-Knopf, empfangene Sprachnachrichten spielen weiter.
- **12.10.2026 (nachts)** — iOS: Sprachnachricht wie bei WhatsApp (Dreieck, Welle mittig mit Knopf,
  Profilbild rechts flippt zum Tempo), Antworten mit Zitat nur so breit wie nötig (`HuggingColumn`),
  Anhänge öffnen nur auf Tippen, Antwort-Leiste in Texthöhe mit Foto, Senden springt ans Ende,
  Filter-Chips bis zum Rand, Animationen im Chat (Swoosh beim Einfügen, Federn der Leiste,
  Flip, Haptik beim Senden; mit „Bewegung reduzieren“ aus) — Befunde 318–328.
- **12.10.2026** — iOS: Pfeil nach unten nur abseits des Endes, Wischen zum Antworten als
  gleichzeitige Geste mit Antwort-Symbol, Sprachnachrichten spielen (Datei-Lader statt
  `imageData`), Tempo-Knopf immer sichtbar (Befunde 315–317); iPad-Seitenleiste wie im Web.
- **11.10.2026 (abends)** — iOS: Look wie WhatsApp (Entwurf 3 + Tapete A, Befund 313): Blasen mit
  Schwänzchen, Tapete mit der Marke, Namensfarben, Leiste mit Kamera/GIF, Ungelesen-Trenner, Pfeil
  nach unten; Chat-Pushes immer mit `mutable-content` (Befund 312).
- **11.10.2026 (nachmittags)** — Gruppen-Einstellungen „wer darf hinzufügen / schreiben“ und
  das Blatt „Neue Gruppe“ in zwei Schritten wie bei WhatsApp (TestFlight-Befund 273, Entwurf 1);
  Web-Dialog „Neuer Chat“ mit Beschreibung und beiden Schaltern, „Gruppe bearbeiten“ ebenso.
- **11.10.2026** — Etappen 0–4: Fundament, Kern, Web, iOS/iPadOS, Mehrwert (Sprachnachrichten,
  Umfragen, Hub-Karten, GIFs, glatttBert), aktive Lesebestätigung für Ankündigungen,
  Browser-Freischaltung für Android.
