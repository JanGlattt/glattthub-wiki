# glattt Coach — Beratungsgespräch-Trainer

Der glattt Coach ist ein gesprochenes Rollenspiel: eine KI spielt die Kundin im Beratungsgespräch,
die Mitarbeiterin führt das Gespräch nach dem Leitfaden der glatttipedia, am Ende kommt eine
Bewertung mit Score. Seit 31.10./01.11.2026 vollständig auf develop (Etappe 1 Web, 2 native App mit
Sprache, 2b Video-Kundin in der App, 3 Zuweisungen, Feier-Momente, Abzeichen, Statistiken, Kachel), nur
Super-Admin; Konzept und alle Entscheidungen stehen im Claude-Doc „glattt Coach – Konzept
Beratungs-Trainer“ (30.10.2026).

!!! nutzerhandbuch "Bedienung: Team 6 – glattt Coach: Beratung trainieren · App 30 – glattt Coach in der App"
    [https://hilfe.hub.glattt.com/team/6/](https://hilfe.hub.glattt.com/team/6/) (Hub) und
    [https://hilfe.hub.glattt.com/app/30/](https://hilfe.hub.glattt.com/app/30/) (App). Bis zur
    Freigabe ist der Coach nur für Super-Admin-Rollen sichtbar.

---

## Für Anwender — Überblick

**Was der Coach leistet.** Eine Mitarbeiterin wählt ein Modul (Komplett in 10 bis 15 Minuten oder eine
einzelne Phase bzw. einen Einwand), einen Kundentyp (leicht bis schwer, datenfasziniert, emotional,
preisbewusst …) und den Modus **Üben** (mit Souffleur) oder **Prüfung** (zählt). Der Hub würfelt aus
dem Typ eine konkrete Kundin (Vorname, Alter, Zonen, Enthaarungsart, Problem, Anlass), die als
lippensynchrones Video im Vollbild antwortet. Die Mitarbeiterin spricht frei; nach 1,5 Sekunden Stille
gilt die Äußerung als beendet. Die Kundin bringt die Einwände ihres Typs, entscheidet sich am Ende
(Ja, Nein, überlegt noch) oder muss beim Zeitlimit los. Danach bewertet die KI das Transkript gegen das
Skript: Score 0 bis 100, Ampel je Phase, drei Stärken und drei Verbesserungen mit Zitat, Pflichtsätze mit
Kernaussagen, Tabus, komplettes Transkript.

**Grundsätze (Entscheidungen Jan, 30./31.10.2026):**

- Anthropic bleibt einziger Anbieter für Inhalte. Hören passiert auf dem Gerät, die Stimme kommt von
  Google, das Bild von Simli; keiner dieser Dienste sieht die Stimme oder das Bild der Mitarbeiterin.
- Skript, Kundentypen, Einwände, Tabus, Fakten, Gewichte und Schwelle pflegt das Büro im Admin
  (Gruppe Team, Einträge „Coach: …“). Preise kommen aus der Preisliste des Instituts, nie aus dem Skript.
- Pflichtsätze werden sinngemäß über Kernaussagen geprüft, wörtlich gibt Bonus. Tabus („aber“,
  „Schmerz“, „Strahlung“, „9 Sitzungen“ und Gesamtsumme in Phase 5, Spiegeln mit „dass“, Argumentieren
  gegen den Einwand) zählt der Code deterministisch, nie die KI.
- Leitung, Büro und Geschäftsführung sehen alles inklusive Transkript (Recht
  `view_glattt_coach_results`); Audio wird nie gespeichert. Abgebrochene Einheiten werden bewertet,
  zählen aber nicht.
- Video ist Standard, Audio ohne Bild der Rückfall (Netz, Budget, Dienst gestört).

---

## Für Entwickler

### Dateien

| Bereich | Pfad |
|---|---|
| Models | `app/Models/Coach/` (`CoachScript`, `CoachPhase`, `CoachStep`, `CoachTaboo`, `CoachObjection`, `CoachCustomerType`, `CoachSession`, `CoachTurn`, `CoachReview`, `CoachAssignment`) |
| Services | `app/Services/Coach/` (`CoachSessionService`, `CoachDialogService`, `CoachReviewService`, `CoachScoring`, `CoachSpeechService`, `CoachScriptSnapshot`, `CoachPersonGenerator`, `CoachBudgetService`, `CoachScriptInstaller`) |
| Job | `app/Jobs/ReviewCoachSessionJob.php` (Queue `default`) |
| Controller, Routen | `app/Http/Controllers/Hub/CoachController.php`, `routes/web.php` (Gruppe `hub.coach.*`, Recht `use_glattt_coach`) |
| Web | `resources/views/hub/coach/` (index + partials start, stage, result, history), `public/js/coach-page.js`, Abschnitt „GLATTT COACH“ in `theme_glattt.css` |
| Admin | `app/Filament/Resources/Coach*` (Kundentypen, Skript-Schritte, Einwände, Tabus), `app/Filament/Pages/CoachSettings.php` |
| Startbestand | `database/coach/script.json`, `database/coach/customer-types.json`, Befehl `coach:install-script [--force]`, Daten-Migration `2026_10_31_100200` |
| Konfiguration | `config/coach.php` (Modelle, Limits, Stimmen-Katalog, Simli), `.env`: `SIMLI_API_KEY`, `COACH_*` |
| Tests | `tests/Feature/Coach/CoachSessionFlowTest.php`, `tests/Unit/Coach/CoachScoringTest.php` |

### Datenmodell

`coach_scripts` (ein aktives Skript: Fakten, Gewichte, Schwelle) → `coach_phases` (1 bis 5) →
`coach_steps` (Art `behaviour` | `sentence` | `action`, Wortlaut, `key_points`, Pflicht,
Reihenfolge). Daneben `coach_taboos` (Muster als regulärer Ausdruck, Phase, Abzug) und
`coach_objections` (Schlüssel, Gruppe, Satz der Kundin, Kernaussagen der Entkräftung).
`coach_customer_types` tragen Schwierigkeit, Stimmung, Startbereitschaft, Einwand-Schlüssel,
Persönlichkeit (Prompt-Text), Personenpool, Stimme (`voice_key`) und Gesicht (`face_id`).

`coach_sessions` ist die Einheit: Modul, Modus, Status (`running` | `finished` | `aborted` | `expired`),
gewürfelte `person`, **`script_snapshot`** (Phasen, Schritte, Tabus, Einwände, Fakten, Preise des
Standorts, Typ — eingefroren beim Start, damit Skript-Änderungen alte Bewertungen nicht verfälschen),
`phase_number`, `readiness`, `progress` (erfüllte Schritte, Tabus für den Souffleur), Entscheidung,
Score, Dimensionen, `cost_cents`, Video-Sekunden, TTS-Zeichen. `coach_turns` sind die Äußerungen
(Rolle, Text, Phase, `meta` mit Stimmung, Bereitschaft, Schritten, Tabus, Einwand, Entscheidung),
`coach_reviews` die strukturierte Bewertung. `coach_assignments` (Zuweisungen) sind angelegt, die
Oberfläche dafür kommt in Etappe 3.

### Ablauf einer Einheit

1. `POST /hub/coach/sessions` → `CoachSessionService::start()`: Budget prüfen
   (`CoachBudgetService`, Tageslimit mit Gewicht je Modul, Monatsbudget in USD), laufende Einheit
   der Person abbrechen, Person würfeln, Snapshot bauen (`CoachScriptSnapshot`, Preise über
   `PriceList::getCurrentPriceList()` und bei flexiblen Listen `FlexiblePriceCalculator::option()`),
   Session anlegen, ersten Satz der Kundin holen.
2. `POST /hub/coach/sessions/{id}/turns` mit `text` → Äußerung speichern, Zeitlimit prüfen,
   `CoachDialogService::respond()`: Systemprompt (Rolle, Person, Typ, Phasen mit Schritt-IDs und
   `customer_guidance`, Einwände, Fakten, Preise, Regeln) mit `cache_control`, Verlauf als
   Nachrichten, strukturierte Antwort (`outputConfig.format` JSON-Schema): `reply`, `mood`,
   `phase_number`, `steps_done`, `readiness_delta`, `objection_key`, `decision`, `end_conversation`.
   Der Code lässt die Phase nur vorwärts, zählt Tabus der Äußerung (`CoachScoring::countTaboos`),
   senkt die Bereitschaft um die halbe Strafe und entscheidet endgültig über Schwellen je
   Schwierigkeit (1: 50 … 5: 75; „yes“ darunter wird zu „considering“, ab 15 Punkten darunter „no“).
   Dann `CoachSpeechService::synthesize()` (Google TTS, LINEAR16 16 kHz als WAV, Base64 in der Antwort).
3. Ende durch Entscheidung, Zeitlimit (`finish(timeout)`), Abbruch oder Wiederaufnahmefrist
   (`expireStale()`, 30 Minuten) → `ReviewCoachSessionJob` → `CoachReviewService::review()`:
   Transkript mit Zeitstempeln, Schema mit `steps` (erfüllt/teilweise/gefehlt + Zitat),
   `sentences` (Kernaussagen, wörtlich), `listening`, `objections` (`not_applicable`), `closing`,
   `numbers`, Stärken, Verbesserungen, Zusammenfassung. `CoachScoring::compute()` rechnet daraus
   die sieben Dimensionen (Gewichte aus dem Snapshot, ohne Einwand-Dimension normiert) und den
   Gesamtscore; die KI vergibt keine Punkte.

### Sprache und Video im Browser

- Hören, zwei Wege (`listenMode`, seit 01.11.2026): **Browser-Erkennung** `SpeechRecognition`
  (de-DE, `continuous`, `interimResults`; Stille von 1,5 s sendet über `armSilence`, Chrome beendet
  die Erkennung nach kurzer Stille selbst → `onend` startet neu) — nur dort, wo sie wirklich läuft.
  **Aufnahme-Rückfall** für die Desktop-App (Chromium ohne Google-Schlüssel meldet bei jedem Start
  `network`) und Safari ohne Diktat (`service-not-allowed`): `getUserMedia` → `MediaRecorder`
  (WebM/Opus, in Safari MP4), ein `AnalyserNode` misst den Pegel (ab 0,02 RMS gilt „es wird
  gesprochen“), 1,5 s Stille schließt das Stück, `POST …/transcribe` (multipart `audio` + `seconds`)
  erkennt es über `CoachSpeechService::transcribe()` → `SpeechToTextService::recognize()` (Google
  STT v2, Chirp 2, europe-west4, Format erkennt die API) und der Client schickt den Text als Zug.
  Die Desktop-App nimmt den Rückfall immer, andere Browser wechseln beim ersten Fehler
  (`switchToRecorder`). Kosten je Sekunde über `sttCostCents()` (`coach.stt_usd_per_minute`).
  Halten-Modus (`pushToTalk`) und Tippen bleiben als Rückfall; Mikrofon ist während der Antwort aus.
- Sprechen: WAV aus der Antwort als `Audio`-Element; ohne WAV `speechSynthesis` (die „Computerstimme“
  — sie heißt: Google TTS hat gerade kein Token oder keine Stimme geliefert, siehe Fallstricke).
- Video: `POST …/simli-token` holt ein Simli-Sitzungstoken (Gesicht des Typs, 5 Minuten gültig, aus
  `/compose/token`) samt ICE-Servern und `ws_url`. Die Seite spricht Simlis **compose-Protokoll
  selbst** (`CoachSimliCompose` in `coach-page.js`, dasselbe wie `CoachVideoClient` der App):
  `wss://api.simli.ai/compose/webrtc/p2p?session_token=…&enableSFU=true`, `RTCPeerConnection` mit zwei
  recvonly-Transceivern, Offer erst nach vollständigem ICE-Sammeln als erste Nachricht, Antwort
  `{type: "answer"}`, dann `START`; danach PCM16-Bytes des WAV (Kopf über den `data`-Chunk
  abgeschnitten) als Binärframes zu 6.000 Byte, `DONE` beendet. Beide Spuren landen in einem
  `MediaStream` am `<video>`. **Das npm-SDK `simli-client` ist raus** (01.11.2026): Es spricht das alte
  Protokoll (`/startAudioToVideoSession` + `wss://…/StartWebRTCSession`) und kennt die compose-Token
  des Hubs nicht — „Video gerade nicht verfügbar“ in jedem Browser. Videosekunden meldet der Client
  alle 30 s an `…/video` (Kosten).
- Mitschrift und Pegel (Aufnahme-Rückfall, 01.11.2026): Die Schwelle folgt dem Raumgeräusch
  (`noiseFloor`, gleitender Mittelwert in Stille; Sprechen ab `max(0,02; Floor × 2,5 + 0,008)` RMS),
  sonst gilt bei Lüfter oder Klimaanlage nie Stille und es wird nie gesendet. Während des Sprechens
  geht alle 2,5 s das bisher Aufgenommene als Zwischenstand an `…/transcribe` (`interim=1`) und
  erscheint als Mitschrift; nach 20 s wird ein Stück ohnehin abgeschlossen. Die Balken der
  Hör-Anzeige zeigen den echten Pegel (`--coach-level` als CSS-Variable, `.coach-listen.is-live`).
- Zeit bis zum Video (02.11.2026): `POST /sessions` mit `defer_opening=1` legt die Einheit nur an und
  gibt das Simli-Token (`data.simli`, ICE-Server 30 Minuten gecacht) gleich mit; der Browser verbindet
  das Video sofort und holt parallel `POST …/opening` (erster Satz der Kundin, nur einmal je Einheit).
  Vor dem ersten Satz wartet die Seite bis zu 2,5 s auf `simliReady`, damit er aus dem Video kommt.
  ICE-Sammeln endet, sobald 250 ms kein neuer Kandidat kommt (nicht erst bei „complete“). Die App
  nutzt weiter `start` mit Eröffnung in einer Antwort.
- Latenz (02.11.2026): Eine Äußerung gilt nach **1,0 s** Pause als beendet (vorher 1,5 s). Schon nach
  **0,4 s** Pause schickt die Seite das bisher Gesagte als **Vorgriff** an `…/transcribe`; bleibt es bis
  zur 1,0-s-Marke still, wird dieses Ergebnis direkt als Zug abgegeben und die Aufnahme ohne zweite
  Erkennung geschlossen — die Erkennung läuft damit in der Pause statt danach. Spricht die Mitarbeiterin
  weiter, verfällt der Vorgriff. Der Server liefert je Zug `timings` (`claude_ms`, `tts_ms`), die Seite
  meldet je Zug „erkennen · antwort (claude, stimme) · gesamt“ als Client-Meldung ins Hub-Log — damit
  lässt sich im Pilot sehen, wo die Zeit bleibt. Erkannte Reste aus Füllwörtern oder Satzzeichen
  („äh“, „hm“, „…“) werden nicht als Zug gesendet (`isNoise`).
- Fehlersuche ohne Konsole: `POST …/client-event` (`kind`, `message`) schreibt Client-Meldungen
  (Simli-Fehler, Mikrofon verweigert, Erkennung fehlgeschlagen, gewählter Hör-Modus mit User-Agent)
  als `glattt Coach: Client` ins Hub-Log — die Desktop-App hat keine erreichbare Konsole.

### Sprache in der App (Etappe 2, seit 31.10.2026)

Native Mehr-Seite `NativeMorePage.coach` (`ios/glatttHub/Coach/`), Startseite nach Entwurf 3 „Plan
zuerst“ (`CoachStartView`), Gesprächsraum nach Entwurf 4 als `fullScreenCover` (`CoachStageView`),
Ergebnis und Verlauf als Blatt (`CoachResultSheet`, `CoachHistorySheet`). Dieselben Endpunkte wie das
Web; `data` liefert zusätzlich `can_view_results`/`can_manage`, die das Web aus der Blade-Konfiguration
kennt. Die App startet mit `video: false` — das Video kommt in Etappe 2b.

- **Hören:** `CoachSpeechListener` (`nonisolated`, Rückrufe kommen von fremden Threads): `AVAudioEngine`-
  Tap → `SFSpeechAudioBufferRecognitionRequest` (de-DE, Zwischenergebnisse, `requiresOnDeviceRecognition`,
  wo das Sprachpaket es kann). Pausenerkennung macht `CoachStageModel`: 1,5 s ohne neues Ergebnis →
  `POST …/turns`. Halten-Modus (`pushToTalk`, Drag-Geste am Mikrofon), Stummschalten, Tippen als Rückfall;
  ohne Erlaubnis (`CoachSpeechListener.authorize()` = Mikrofon **und** Spracherkennung) öffnet das Textfeld.
  Endet die Erkennung von selbst (Zeitgrenze des Dienstes), geht Gesagtes raus, sonst hört sie wieder zu.
- **Sprechen:** `CoachVoicePlayer` spielt das WAV (`AVAudioPlayer(data:)`), ohne WAV die Systemstimme
  (`AVSpeechSynthesizer`, de-DE); beide warten per Continuation auf das Ende, ein Wachhund löst nach
  Dauer + 1,5 s. Während die Kundin spricht, ist der Listener aus (kein Selbst-Mithören über den
  Lautsprecher); Audio-Session `.playAndRecord` mit `.defaultToSpeaker`.
- **Zeit:** Countdown aus `seconds_left`, bei 0 `finish(timeout: true)`; Bildschirm bleibt wach
  (`isIdleTimerDisabled`). Verlassen per Wischen ruft `teardown()` (Listener, Player, Audio-Session).
- **Nachweis:** `CoachSnapshotTests` (Startseite iPhone/iPad, Gesprächsraum Üben/Prüfung/iPad, Ergebnis,
  Verlauf; Modell-Tests). Im Snapshot ersetzen `appointmentsStaticLayout`-Zweige Picker und
  horizontale ScrollViews durch Chips in einer Zeile (ImageRenderer rastert beide nicht).

### Video-Kundin in der App (Etappe 2b, seit 01.11.2026)

Simli hat kein iOS-SDK; `CoachVideoClient` (`ios/glatttHub/Coach/`) spricht das Protokoll der Simli-Docs
(docs.simli.com/api-reference/simli-webrtc) direkt: Der Hub liefert mit dem Sitzungstoken auch die
ICE-Server (`GET /compose/ice`, Rückfall Googles STUN) und die WebSocket-Adresse
(`config('coach.simli.ws_url')`). Die App öffnet `wss://api.simli.ai/compose/webrtc/p2p?session_token=…&enableSFU=true`,
baut einen Peer mit zwei recvonly-Transceivern (Audio, Video), sammelt ICE **vollständig** (Simli nimmt keine
Trickle-Kandidaten), schickt die Offer als erste Nachricht, setzt die Answer und wartet auf `START`. Danach
gehen die PCM-Bytes der Google-Stimme (WAV-Kopf abgeschnitten, `CoachAudio.pcm`) als Binärframes zu 6.000 Byte
über den WebSocket; das Bild kommt als `RTCVideoTrack` (`ChatVideoView`), der Ton über WebRTC
(`RTCAudioSession.isAudioEnabled`, weil die Anrufe manuelles Audio eingestellt haben). `SKIP` verwirft
Wartendes, `DONE` beendet sauber; Videosekunden gehen alle 30 s an `…/video`. Jeder Fehler (kein Token,
kein START in 25 s, Socket zu, STOP/ERROR) fällt still auf Ton zurück; Knopf „Video aus“ im Raum, Schalter
„Video-Kundin“ auf der Startseite (Standard an). **Am Gerät noch nicht verifiziert** (Simulator ohne Simli-Konto
im Testlauf) — Jan prüft mit Build 1.7.1 (131).

### Etappe 3: Zuweisungen, Feier-Momente, Abzeichen, Statistiken, Kachel (seit 31.10./01.11.2026)

- **Zuweisungen** (`CoachAssignmentService`): Leitung und Büro (Recht `view_glattt_coach_results`) weisen
  Personen oder einem Standort-Team Modul, Kundentyp (optional), Mindestscore, Fälligkeit und Notiz zu —
  `GET/POST /hub/coach/zuweisungen`, `DELETE …/{id}`; Sicht = eigene plus `allowed_branch_ids`/Heimat-Institut
  (Admin-Recht `manage_glattt_coach` sieht alles). Web: Karte „Zuweisungen verwalten“ mit Modal, App:
  Blatt „Zuweisungen“ mit Formular. Nach der Bewertung einer bestandenen Prüfung mit Mindestscore stempelt
  `completeFor()` die Zuweisung (`completed_at`, `completed_session_id`; Team-Zuweisungen bleiben für die
  anderen offen) und meldet der zuweisenden Person. Anlässe im Benachrichtigungs-Katalog, Modul „glattt Coach“:
  `coach_assignment.created` (Push an die Person/das Team), `.due` (täglich 07:30 über `HubDailyChecksService`,
  morgen fällig/überfällig, höchstens alle 7 Tage je Zuweisung, `reminded_at`), `.completed` (an die zuweisende
  Person), `coach_exam.passed` (an Leitung/Büro des Standorts, Standard aus).
- **Feier-Momente** (`CoachGamificationService`, nach `CoachReviewService::review`): Anlässe `coach.passed`
  und `coach.mastered` (erste bestandene Prüfung je Typ) in der `TriggerRegistry`, Kategorie „Coach“, Standard
  aus wie alle Anlässe; Overlay-Daten landen in `coach_reviews.payload.celebrations`, die Ergebnisseite spielt
  sie einmal über `glattt-celebrations.js` (nur für die Person selbst), die App zeigt sie als goldene Karte.
  Feed-Zeile im Institut mit Dedupe-Schlüssel je Session bzw. je Person+Typ.
- **Abzeichen**: Kennzahlen `coach_exams_passed`, `coach_types_mastered`, `coach_best_score`,
  `coach_sessions_count` im `BadgeMetricCatalog` (regulär beendete Einheiten, Zeitraum nach `ended_at`);
  drei Badges per Migration (Coach-Absolventin 1/5/15, Typen-Kennerin 3/6/12, Leitfaden im Schlaf 80/90/95),
  Prämien 0 — Stufen und Prämien pflegt Jan im Badge-Admin. `BadgeAwardService::evaluateForUser` läuft direkt
  nach der Bewertung, die Overlays hängen mit an der Bewertung.
- **Statistiken** (Registry, Kategorie Personal, Recht `use_glattt_coach`): `personal.coach-scores` (Prüfungen,
  bestanden, Ø Score je Monat; Übungen, Ø Pflichtsätze/Tabus in der Tabelle) und `personal.coach-ranking`
  (Ø Score und bestandene Prüfungen je Mitarbeiterin, eigene Zeile in Gold). `CoachStatisticsService` über den
  Statistik-Cache (Gruppe `coach`, 15 Min), Team nur mit `view_glattt_coach_results`, sonst eigene Einheiten;
  Standort über `visibleBranch`, Einheiten ohne Standort (Konto „Alle Standorte“) zählen bei „Alle Standorte“
  mit. Eingebunden im Verlauf der Coach-Seite (`resize` nach dem Einblenden, sonst 0 px breit), damit im
  Eigenen Dashboard wählbar; CSV-Quellen `coach-scores`, `coach-ranking` (Seite `coach`).
- **Kachel „Mein glattt Coach“** (`CoachTileService`, `GET /hub/coach/tile`): Startseiten-Kartentyp `coach`
  (Recht `use_glattt_coach`, Rollen-Vorgaben im Admin) und App-Abschnitt `coach` (`AppStartLayout`, Standard
  nach `tips`); ohne Einheit und Zuweisung liefert der Endpunkt `null`, die App lässt den Abschnitt weg.
- **Limits**: Tageslimit und Monatsbudget stehen am aktiven Skript (`daily_limit`, `monthly_budget_usd`,
  Admin „Coach: Einstellungen“), `config/coach.php` nur noch als Rückfall.

### Rechte, Navigation, Konventionen

Rechte `use_glattt_coach`, `view_glattt_coach_results`, `manage_glattt_coach` (Katalog-Knoten
`coach`), Migration `2026_10_31_100100` nur an Super-Admin-Rollen. Seite in der Gruppe Team
(Sidebar, `MobileNavigation::MORE`, `NavigationGroups`), Suche in `GlobalSearchService::PAGES`,
App-Abdeckung `nativ` (seit 31.10.2026), Klickanleitung App 30, Serie Team `geplant`. Kosten je Aufruf landen über
`ClaudeUsage` (Zwecke `coach.dialog`, `coach.review`) und `cost_cents` an der Session.

### Fallstricke

- `ClaudeClient` wirft bei ungültigem Schlüssel eine `AuthenticationException`; Controller fangen
  `Throwable` und antworten 503 mit deutscher Meldung. Lokal muss `ANTHROPIC_API_KEY` gültig sein.
- Google TTS braucht `texttospeech.googleapis.com` im Projekt (seit 31.10.2026 aktiv) und ein
  gültiges Token (`GoogleServiceAccount::cloudAccessToken()`); schlägt die Stimme fehl, geht es
  still mit der Systemstimme weiter (`audio_base64` = null) — im Log steht dann „Google-Stimme nicht
  verfügbar“. Am 01.11.2026 war der JSON-Schlüssel im Prod-Secret `google-service-account-json`
  ungültig (400 von `oauth2.googleapis.com/token`), seit Tagen auch für glatttBerts Embeddings.
  Seitdem holt der Hub das Token auf Cloud Run vom **Metadaten-Server** des Laufzeit-Dienstkontos
  (`GOOGLE_TOKEN_SOURCE=auto`, erkannt an `K_SERVICE`), der Schlüssel ist nur noch Rückfall und der
  Weg für lokale Umgebungen. Wissen `google-token-metadaten-server`.
- Der Metadaten-Server gibt dasselbe Token bis kurz vor Ablauf aus: `expires_in` kann klein sein. Der
  Hub cacht es deshalb nur `expires_in − 300 s` und wiederholt Google-Aufrufe bei 401 einmal mit frischem
  Token (`GoogleServiceAccount::withToken()`); vorher 50 Minuten fest → nach einer halben Stunde 401 für
  Stimme und Erkennung (01.11.2026).
- Der Simli-Client lebt als Closure-Variable der Alpine-Factory, nicht im `x-data`: Alpine kapselt
  Objekte in reaktive Proxys, `this.simli !== simli` ist dann immer wahr (die Seite schloss die frische
  Sitzung sofort mit `DONE`), und WebSocket/PeerConnection vertragen keinen Proxy als Empfänger.
  Wissen `alpine-proxy-identitaet-browser-objekte`.
- Client-Meldungen (`…/client-event`) werden als `warning` geloggt — Prod läuft mit `LOG_LEVEL=warning`.
- Zuhören im Browser „geht nicht, ich muss tippen“ = die Browser-Spracherkennung meldet still
  `network` (Desktop-App) oder `service-not-allowed` (Safari) — der Aufnahme-Rückfall übernimmt
  (siehe oben); bleibt es beim Tippen, fehlt der Mikrofon-Zugriff.
- Die Queue muss laufen, sonst bleibt die Ergebnisseite auf „Bewertung läuft“ (Job auf `default`);
  in Tests `Queue::fake()`, sonst rechnet der Sync-Treiber die Bewertung mitten in der Anfrage.
- Der magische Übergang „Aber jetzt prüfen wir erstmal …“ ist vom Tabu „aber“ ausgenommen
  (`CoachScoring::countTaboos`).
- `default_branch_id === 'all'` wird zu `null` (globale Preisliste), sonst steht „all“ in
  `branch_id` der Session.

### Offen

Gerätetest durch Jan (Mikrofon, Stimme, Video-Kundin in der App; im Simulator nur gebaut und gerastert),
Anlässe `coach.*` und die Rollen-Freigabe im Admin einschalten (Pilot: Super-Admin → ein Institut → alle),
Pflichtsätze durch das Büro markieren (die grüne Markierung ging beim Sites-Import verloren), Klickanleitung
Serie Admin für die Coach-Pflegeseiten, EU-Prüfung/AVV der Anbieter (Simli AS, Norwegen), Tavus als
zweiwöchiger Pilot-Vergleich (Konzept Stufe B).

## Changelog

- **31.10.2026** — Etappe 1: Datenmodell, Startbestand aus dem Leitfaden, Engine (Dialog, Bewertung,
  Scoring, Stimme, Simli-Token, Budget), Web-Seite, Admin, Tests. Entscheidungen Jan 30./31.10.2026.
- **31.10.2026** — Etappe 2: native App-Seite (Startseite Entwurf 3, Gesprächsraum Entwurf 4 mit Ton),
  Zuhören auf dem Gerät, Google-Stimme als WAV, Souffleur, Ergebnis, Verlauf; Klickanleitung App 30.
  Simli-Secret `simli-api-key` an Staging- und Prod-Web gemountet.
- **31.10./01.11.2026** — Etappe 3: Zuweisungen (Web + App) mit Push-Anlässen und täglicher Erinnerung,
  Feier-Momente und drei Abzeichen, Registry-Statistiken, Kachel „Mein glattt Coach“ (Startseite + Cockpit),
  Limits am Skript; Klickanleitung Team 6.
- **01.11.2026** — Etappe 2b: Video-Kundin in der App über eigenes WebRTC gegen Simli, ICE-Server über den Hub.
- **01.11.2026** — Auf Prod (Merge aa968de1): alle Etappen live, Rechte per Migration nur an Super-Admin-Rollen (Pilot); Gamification-Anlässe im Admin noch aus.
- **01.11.2026** — Web-Gesprächsraum nach dem ersten Prod-Test: Aufnahme-Rückfall mit Google Speech-to-Text (`…/transcribe`) für Desktop-App und Safari, Simli-Client nach SDK-API mit ICE-Servern vom Hub (vorher kein Video), Google-Token auf Cloud Run vom Metadaten-Server (Schlüssel im Secret war ungültig, Stimme fiel auf die Systemstimme zurück).
- **01.11.2026** — Zweiter Prod-Test: Simli-SDK durch eigenen compose-Client ersetzt (SDK sprach das alte Protokoll, nie Video), Pausen-Erkennung mit adaptiver Schwelle (nichts kam an, weil Raumgeräusch nie als Stille galt), Mitschrift alle 2,5 s und Live-Pegel, Client-Meldungen ins Hub-Log.
- **01.11.2026** — Dritter Prod-Test: Google-Token nur bis kurz vor Ablauf gecacht und bei 401 erneuert (Stimme und Erkennung fielen nach 34 Minuten aus), Simli-Client aus dem Alpine-Zustand genommen (Proxy-Identität schloss die Sitzung sofort), Video lokal gegen Simli bewiesen.
- **02.11.2026** — Latenz: Pause 1,0 s, Vorgriff-Erkennung nach 0,4 s Pause, Füllwort-Filter, Zeiten je Zug (Server `timings`, Client-Meldung „zug“).
- **02.11.2026** — Zeit bis zum Video: aufgeschobene Eröffnung (`defer_opening`, `POST …/opening`), Simli-Token mit der Start-Antwort, ICE-Server gecacht, ICE-Sammeln nach 250 ms Ruhe.
