# glattt Coach — Beratungsgespräch-Trainer

Der glattt Coach ist ein gesprochenes Rollenspiel: eine KI spielt die Kundin im Beratungsgespräch,
die Mitarbeiterin führt das Gespräch nach dem Leitfaden der glatttipedia, am Ende kommt eine
Bewertung mit Score. Seit 31.10.2026 als Etappe 1 (Web, nur Super-Admin) auf develop; Konzept und
alle Entscheidungen stehen im Claude-Doc „glattt Coach – Konzept Beratungs-Trainer“ (30.10.2026).

!!! nutzerhandbuch "Bedienung: folgt nach der Abnahme von Etappe 1"
    Klickanleitung Serie *Team* (Start, Gespräch, Ergebnis, Verlauf) und Serie *App* mit Etappe 2.
    Bis dahin ist der Coach nur für Super-Admin-Rollen sichtbar.

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

- Hören: `SpeechRecognition` (de-DE, `continuous`, `interimResults`); Stille von 1,5 s sendet
  (`armSilence`), Chrome beendet die Erkennung nach kurzer Stille selbst → `onend` startet neu.
  Halten-Modus (`pushToTalk`) und Tippen als Rückfall; Mikrofon ist während der Antwort aus.
- Sprechen: WAV aus der Antwort als `Audio`-Element; ohne WAV `speechSynthesis`.
- Video: `POST …/simli-token` holt ein Simli-Sitzungstoken (Gesicht des Typs, 5 Minuten gültig),
  die Seite lädt `simli-client` als ES-Modul von jsDelivr, `start()` verbindet per WebRTC,
  `sendAudioData()` bekommt die PCM-Bytes des WAV (Kopf über den `data`-Chunk abgeschnitten,
  6.000-Byte-Stücke). Videosekunden meldet der Client alle 30 s an `…/video` (Kosten).
  **Kein iOS-SDK bei Simli** — die App braucht in Etappe 2 ein eigenes WebRTC-Gegenstück oder den
  LiveKit-Modus (Wissen `glattt-coach-konzept`).

### Rechte, Navigation, Konventionen

Rechte `use_glattt_coach`, `view_glattt_coach_results`, `manage_glattt_coach` (Katalog-Knoten
`coach`), Migration `2026_10_31_100100` nur an Super-Admin-Rollen. Seite in der Gruppe Team
(Sidebar, `MobileNavigation::MORE`, `NavigationGroups`), Suche in `GlobalSearchService::PAGES`,
App-Abdeckung `geplant` (Etappe 2), Klickanleitung `geplant`. Kosten je Aufruf landen über
`ClaudeUsage` (Zwecke `coach.dialog`, `coach.review`) und `cost_cents` an der Session.

### Fallstricke

- `ClaudeClient` wirft bei ungültigem Schlüssel eine `AuthenticationException`; Controller fangen
  `Throwable` und antworten 503 mit deutscher Meldung. Lokal muss `ANTHROPIC_API_KEY` gültig sein.
- Google TTS braucht `texttospeech.googleapis.com` im Projekt (seit 31.10.2026 aktiv) und ein
  gültiges Service-Konto (`GoogleServiceAccount::cloudAccessToken()`); schlägt die Stimme fehl, geht es
  still mit der Systemstimme weiter (`audio_base64` = null).
- Die Queue muss laufen, sonst bleibt die Ergebnisseite auf „Bewertung läuft“ (Job auf `default`);
  in Tests `Queue::fake()`, sonst rechnet der Sync-Treiber die Bewertung mitten in der Anfrage.
- Der magische Übergang „Aber jetzt prüfen wir erstmal …“ ist vom Tabu „aber“ ausgenommen
  (`CoachScoring::countTaboos`).
- `default_branch_id === 'all'` wird zu `null` (globale Preisliste), sonst steht „all“ in
  `branch_id` der Session.

### Offen (Etappen 2 und 3)

Native App (Entwurf 4 + 3, eigenes WebRTC für Simli), Zuweisungen mit Push-Anlässen, Abzeichen im
`BadgeMetricCatalog`, Feier-Momente in der `TriggerRegistry`, Registry-Statistiken (Score-Verlauf,
Pflichtsatz-Quote je Institut), Admin-Tabelle für Monatsbudget und Tageslimit (heute `config/coach.php`),
Pflichtsätze durch das Büro markieren (die grüne Markierung ging beim Sites-Import verloren),
Klickanleitungen, EU-Prüfung der Anbieter (Simli AS, Norwegen).

## Changelog

- **31.10.2026** — Etappe 1: Datenmodell, Startbestand aus dem Leitfaden, Engine (Dialog, Bewertung,
  Scoring, Stimme, Simli-Token, Budget), Web-Seite, Admin, Tests. Entscheidungen Jan 30./31.10.2026.
