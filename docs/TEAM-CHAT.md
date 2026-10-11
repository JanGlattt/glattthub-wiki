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
Sprachnachrichten (Mikrofon halten) ebenso. Über das Plus kommen Umfragen, GIFs und Hub-Karten
in den Chat; `@glatttBert Frage` holt den KI-Assistenten in den Raum. „Nicht stören“ je Person
hält die Push-Mitteilungen außerhalb der Arbeitszeit fern, dringende Ankündigungen kommen durch.

**Warum.** WhatsApp lebt von privaten Handynummern, pflegt keine Gruppen und kennt den Hub nicht.
Der Chat erreicht jede Kollegin über ihr Hub-Konto, hält Dienstliches im Unternehmen und
verbindet Nachrichten mit Kundinnen, Verträgen und Ankündigungen.

!!! nutzerhandbuch "Bedienung: Chat 1 – Chats, Gruppen und Ankündigungen"
    https://hilfe.hub.glattt.com/chat/1/ (Deck in Arbeit; App-Bedienung in der Serie „App“)

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

### Echtzeit (Reverb)

- Kanal `private-chat.user.{id}` trägt alle Räume einer Nutzerin: Ereignis `chat.changed`
  mit `kind` (`message`, `edit`, `delete`, `reaction`, `pin`, `poll`, `ack`, `room`), `room_id`,
  `seq` und der kompakten Nachricht (`ChatPresenter::messageCompact`, höchstens 100 Kanäle je
  Veröffentlichung, `ChatRoomEvent`).
- Kanal `private-chat.room.{id}` nur für den offenen Raum: `chat.activity` mit `typing` und
  `read` (`ChatRoomActivity`).
- Freigaben in `routes/channels.php` (Mitgliedschaft, `use_chat`); Presence-Kanal
  `presence-chat` ist vorbereitet.
- Reverb ist **Anstoß, der Hub die Wahrheit**: Web (`GlatttLive` aus `guided-live.js`) und App
  (`ChatLiveClient`, Port des Fernseher-Clients) laden nach jedem Reconnect und beim
  Sichtbarwerden „alles ab seq X“ (`GET /raeume/{id}/nachrichten?since=`). Ein Fehler des
  Echtzeit-Dienstes lässt nie eine Nachricht scheitern (`ChatRealtime::safely`).

### Push

Drei Katalog-Anlässe (`HubEventRegistry`, Modul „Nachrichten & Dashboards“): `chat.message`
(nur Push), `chat.mention` (nur Push, schlägt Stummschaltung), `chat.announcement` (In-App und
Push, dringend = zeitkritisch). `ChatPushService` filtert die Empfänger: ohne Absenderin, ohne
Stummgeschaltete, ohne „Nicht stören“ (`ChatUserSetting::isQuietAt`), ohne wer den Raum gerade
offen hat (Cache-Marke aus dem Lesestand-Ping `viewing`). Der Dispatcher setzt eigene
Zusatzdaten: `module` = `chat-room-{id}` (thread-id je Raum), Kategorie `HUB_CHAT` mit
Direkt-Antwort in der App, Ziel `/hub/chat/raum/{id}`. Der Text respektiert
`preview_in_push` je Person.

### Endpunkte (`/hub/chat`, Recht `use_chat`)

| Methode & Pfad | Zweck |
|---|---|
| `GET /data` | Einstieg: `me`, `rooms`, `today`, `settings`, `live`, `permissions`, `bert_available` |
| `GET /kontakte`, `GET /suche?q=`, `GET /objekte?q=`, `GET /gifs?q=` | Kontakte, Nachrichtensuche (Teilwort), Hub-Objekte aus der globalen Suche, GIFs (Tenor, `TENOR_API_KEY`) |
| `POST /direkt`, `POST /raeume` | Einzelchat, Gruppe anlegen (`name`, `description`, `user_ids[]`, `members_can_add`, `members_can_post`; das Bild folgt über `POST …/bild`) |
| `GET /raeume/{id}`, `PATCH /raeume/{id}` | Raum mit Mitgliedern und Verlauf; Name/Beschreibung, `members_can_add`/`members_can_post` (nur Admins eigener Gruppen), `muted_until` (`1h`, `8h`, `1w`, `forever`, `off`), `is_pinned`, `is_archived` |
| `GET /raeume/{id}/nachrichten?before=\|since=` | Verlauf blättern / Nachladen ab Stand |
| `POST /raeume/{id}/nachrichten` | Senden (multipart: `body`, `client_uuid`, `type`, `reply_to_id`, `mention_ids[]`, `files[]`, `duration_ms`, `waveform`, `poll[...]`, `meta[object]`, `meta[media]`, `is_urgent`, `requires_ack`) |
| `POST /raeume/{id}/gelesen`, `POST /raeume/{id}/ungelesen`, `POST /zugestellt`, `POST /raeume/{id}/tippt` | Lesestand (+`viewing`; nie zurück), „als ungelesen markieren“ (Lesestand genau eine Nachricht zurück — die einzige Stelle, an der er rückwärts läuft), Zustellstand je Raum, „schreibt gerade“ |
| `POST/DELETE /raeume/{id}/mitglieder[/{user}]`, `PATCH …/{user}` | Mitglieder, Rolle |
| `PATCH/DELETE /nachrichten/{id}`, `POST …/reaktion`, `…/anheften`, `…/weiterleiten`, `…/bestaetigen` | Bearbeiten, Löschen, Reaktion, Anheften, Weiterleiten, Lesebestätigung |
| `POST /umfragen/{id}/abstimmen`, `…/beenden` | Umfragen |
| `GET /anhang/{id}`, `GET /raeume/{id}/bild`, `POST …/bild` | Anhänge und Gruppenbild (privater Bucket) |
| `PATCH /einstellungen` | Nicht stören, Push-Vorschau |
| `GET /hub/chat`, `GET /hub/chat/raum/{id}[?seq=]` | Seite und Deep-Link (Web zeigt den Raum, App ihre native Unterhaltung) |

Fachliche Fehler kommen als 422/403 mit deutscher `message`.

### Web

`public/js/chat.js` liefert einen Bauplan für Vollseite (`chatPage`) und Seitenpanel
(`chatDock`, `@persist` im Layout, ⌘⇧C): optimistisches Senden mit Client-UUID, Warteschlange
ohne Netz, Entwürfe je Chat in `localStorage`, Echtzeit über `GlatttLive`, Sprachaufnahme über
`MediaRecorder` mit Pegel-Wellenform, Erwähnungen, Umfragen, Hub-Karten, GIFs. Der Zähler geht
als `glattt:chat-unread` an Seitenleiste, Bottom-Nav und native Badges. Theme-Abschnitt
„TEAM-CHAT“ in `theme_glattt.css`.

### iOS/iPadOS

`ChatView` (Haupttab „Chat“, ersetzt Berichte in der Leiste), `ChatRoomView` (Detailseite ohne
Tab-Leiste bzw. mittlere Spalte auf dem iPad), `ChatRoomInfoView` (Kontextspalte/Blatt),
Blätter für neuen Chat, Mitglieder, Weiterleiten, Umfrage, Suche, Einstellungen,
Nachricht-Info. „Neue Gruppe“ folgt seit 11.10.2026 Entwurf 1 „Wie WhatsApp“ (Befund 273):
Schritt 1 Mitglieder mit Chips, Schritt 2 Gruppenseite mit Bild (Album), Name, Beschreibung,
Mitgliederzeile und den Einstellungen „Mitglieder hinzufügen“ / „Nachrichten schreiben“ je
„Alle“ oder „Nur Admins“; auf dem iPad liegen beide Schritte nebeneinander. Die Gruppen-Info
zeigt dieselben Einstellungen für Admins und blendet „Hinzufügen“ nach `can_add_members` ein. `ChatModel` hält Räume, Verlauf, Warteschlange und Offline-Stand
(`OfflineStore`, Schlüssel `chat`), `ChatLiveClient` die Reverb-Verbindung (Kanal je Nutzerin
plus offener Raum, Backoff 1…60 s), `ChatRecorder`/`ChatPlayer` die Sprachnachrichten. Push:
Kategorie `HUB_CHAT` mit „Antworten“ (Texteingabe, derselbe Sende-Endpunkt) — im offenen Raum
kein Banner. Details im Abschnitt „Nativer Team-Chat“ in [IOS-APP](IOS-APP.md).

### Fallstricke

- **`ImageRenderer` rastert keine `List`, `ScrollView` oder `Menu`** — die Snapshot-Tests
  schalten über `appointmentsStaticLayout` auf feste Stapel (`ChatSnapshotTests`).
- **`ISO8601DateFormatter` ist nicht `Sendable`** — je Aufruf eine Instanz (`ChatFormat`).
- **Reverb-Nutzlast ≤ 10 KB** — `messageCompact` kürzt den Text auf 4.000 Zeichen; Haken
  kommen nie über den Anstoß, sondern aus Serverantwort und `chat.activity`.
- **Jeder Deploy startet Reverb neu** — Clients bauen neu auf und laden ab Stand nach; nie auf
  einen verpassten Anstoß vertrauen.
- **Push im offenen Raum** unterdrückt der Hub über die `viewing`-Marke (40 s); die App
  pingt alle 25 s, das Web ebenso.
- **Keine Verschlüsselung auf Nachrichtenebene** (Jan: Suche wie WhatsApp) — Cloud SQL
  verschlüsselt ruhend, der Transport über TLS; Anhänge liegen im privaten Bucket und werden
  nur über `/anhang/{id}` mit Mitgliedschaftsprüfung ausgeliefert.
- **Android** kommt über die Browser-Freischaltung auf den App-Host (Plattform `browser`,
  ohne App Attest, siehe [APP-GERAETE-FREISCHALTUNG](APP-GERAETE-FREISCHALTUNG.md)).

### Relevante Tests

`tests/Feature/Chat/` (Räume, Nachrichten, Push-Empfänger, Katalog-Weg, Endpunkte, Seite),
`tests/Feature/App/BrowserEnrollmentTest.php`, `ios/glatttHubTests/ChatSnapshotTests.swift`,
`ios/glatttHubUITests/ChatUITests.swift`.

## Changelog

- **11.10.2026 (nachmittags)** — Gruppen-Einstellungen „wer darf hinzufügen / schreiben“ und
  das Blatt „Neue Gruppe“ in zwei Schritten wie bei WhatsApp (TestFlight-Befund 273, Entwurf 1);
  Web-Dialog „Neuer Chat“ mit Beschreibung und beiden Schaltern, „Gruppe bearbeiten“ ebenso.
- **11.10.2026** — Etappen 0–4: Fundament, Kern, Web, iOS/iPadOS, Mehrwert (Sprachnachrichten,
  Umfragen, Hub-Karten, GIFs, glatttBert), aktive Lesebestätigung für Ankündigungen,
  Browser-Freischaltung für Android.
