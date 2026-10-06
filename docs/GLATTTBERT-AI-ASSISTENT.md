# glatttBert — KI-Assistent

**glatttBert** ist der interne KI-Assistent von glatttHub. Er beantwortet Fragen zu Kunden,
Verträgen, Statistiken, internen Prozessen und der Wissensdatenbank — direkt im Hub,
angedockt neben der Seitenleiste (mobil über das Mehr-Sheet). Technisch ist er eine
Livewire-Komponente über der **Claude Messages API** (Anthropic, seit 06.10.2026) mit einem
eigenen hybriden Suchindex über die Wissensdatenbank (Volltext + Embeddings von Google
Vertex AI), der nächtlich aus Google Drive und dem Wiki befüllt wird, plus Hub-Werkzeuge für
Kunden- und Kennzahlen-Abfragen.
Diese Seite beschreibt **Architektur, Datenmodell, Sync, Chat-Flow, Tool-Logik und
Einschränkungen**; die Bedienung steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Grundlagen 5 – glatttBert fragen"
    [hilfe.hub.glattt.com/grundlagen/5/](https://hilfe.hub.glattt.com/grundlagen/5/) — Fragen stellen, was er weiß, was er nicht kann.

    Angrenzend: [Grundlagen 1 – Anmelden & zurechtfinden](https://hilfe.hub.glattt.com/grundlagen/1/) (Seitenleiste),
    [Grundlagen 4 – Auf dem Handy und Tablet](https://hilfe.hub.glattt.com/grundlagen/4/) (Mehr-Menü),
    [Admin 1 – Benutzer und Rollen](https://hilfe.hub.glattt.com/admin/1/) (Recht `use_ai_assistant`).

---

## Für Anwender — Überblick

**Was Bert leistet.** Bert sitzt fest in der Navigation — am Desktop unten in der Seitenleiste
über dem Profil, am Smartphone/Tablet als erste Schaltfläche im Mehr-Sheet — und öffnet sich
neben der Leiste, ohne die Seite dahinter zu verdecken (`⌘K` / `Strg+K` von überall). Er
merkt sich den Verlauf innerhalb einer Konversation, vergibt automatisch einen Titel und hält
die letzten Konversationen in einer Verlaufsliste bereit.

**Was er weiß:**

- **Wissensdatenbank:** alle Dokumente, Anleitungen und Standards aus dem Google Drive
  (nächtlich synchronisiert, Antworten mit Quellen-Verweisen als hochgestellte Ziffern)
- **Hub-Daten:** Umsatz, Termine, Kunden-KPIs, Stornoquote, Top-Anzeigen — und einzelne
  Kundinnen samt Notizen, wenn ein Name in der Frage vorkommt
- **Prozessfragen:** „Wie funktioniert XY?", „Wer ist verantwortlich für Z?"

**Was er nicht kann:** Bert antwortet, er handelt nicht — Verträge, Termine oder Kundendaten
ändert er nicht, dafür gibt es die Seiten des Hub und ihre Anleitungen. Er kennt nur, was in
der Wissensdatenbank und den angebundenen Hub-Daten steht; was dort fehlt, kann er nicht
wissen. Personen sucht er selbst (erst Kundinnen, dann Wissensdatenbank) und fragt nicht
zurück, ob jemand Kundin ist.

**Wer ihn sieht:** nur Nutzer mit dem Recht **`use_ai_assistant`** (Gruppe *Systemzugriff*
im Rollen-Editor, siehe [Berechtigungssystem](BERECHTIGUNGSSYSTEM.md)).

| Vorgang | Anleitung |
|---|---|
| Bert öffnen, Fragen stellen, Verlauf nutzen | Grundlagen 5 |
| Was er weiß / was er nicht kann | Grundlagen 5 |
| Einstieg in Seitenleiste bzw. Mehr-Menü finden | Grundlagen 1, Grundlagen 4 |
| Recht `use_ai_assistant` vergeben | Admin 1 |

---

## Für Entwickler

### Architektur

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Livewire + Alpine.js)                        │
│  resources/views/livewire/hub/ai-assistant.blade.php    │
│  app/Livewire/Hub/AiAssistant.php                       │
└────────────┬────────────────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────────────────┐
│  GlatttBertService (app/Services/Ai/)                   │
│  Verlauf aus ai_messages → Claude → Werkzeug-Schleife   │
│   • search_knowledge  → KnowledgeSearchService          │
│   • 12 Hub-Werkzeuge  → HubToolExecutor                 │
└────────────┬───────────────────────────┬────────────────┘
             ▼                           ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│  Claude API (Anthropic)   │  │  Suchindex (MySQL)       │
│  Sonnet 5.5, ClaudeClient │  │  knowledge_chunks:       │
│  (offizielles PHP-SDK)    │  │  FULLTEXT + Vektoren     │
└───────────────────────────┘  └───────────▲──────────────┘
                                           │
┌──────────────────────────────────────────┴──────────────┐
│  Knowledge-Base-Sync (nächtlich 03:00) + Wiki-Sync      │
│  Drive/Wiki → KnowledgeArticle → KnowledgeIndexer       │
│  Text: Docs-Export, pdftotext/OOXML, Claude (Bilder,    │
│  Scan-PDFs), Google Speech-to-Text (Videos)             │
│  Vektoren: Vertex AI gemini-embedding-001 (768 Dim.)    │
└─────────────────────────────────────────────────────────┘
```

**Warum kein gehosteter Vector Store mehr?** glatttBert lief bis Oktober 2026 auf der OpenAI
Assistants API mit File Search. OpenAI hat diese Schnittstelle am **26.08.2026 abgeschaltet**;
Entscheidung Jan (06.10.2026): ein einziger KI-Dienstleister im Hub, also Claude. Claude
bietet keinen gehosteten Vector Store — die Suche liegt deshalb im Hub selbst. Die Texte
lagen ohnehin in `knowledge_articles`; dazu kommen Abschnitte mit Volltext-Index und
Embeddings. Embeddings und Transkription kommen aus dem eigenen GCP-Projekt (EU-Regionen),
damit kein dritter Dienstleister dazukommt.

### Datenmodell

| Tabelle | Zweck |
|---|---|
| `ai_conversations` | Eine Konversation pro Nutzer-Chat (`user_id`, `title`, `title_manually_set`, `pinned_at`, `last_activity_at`). |
| `ai_messages` | Nachrichten (User + Assistant): `content`, `sources` (Quellen-Karten), `embeds` (Kunden-/Vertragskarten), Telemetrie `model`, `latency_ms`, `prompt_tokens`, `completion_tokens`, `cache_read_tokens`, `cache_write_tokens`, `total_tokens`, **`cost_usd`** (je Antwort berechnet), `tool_calls`, Feedback |
| `knowledge_articles` | Wissensartikel aus Drive (`drive`, `site_page`, `site_index`), Wiki (`wiki`) und Admin (`manual`). Neu: `index_hash` (SHA1 aus Titel + Inhalt des zuletzt indexierten Stands), `indexed_at`. |
| `knowledge_chunks` | Suchindex: Abschnitte eines Artikels (`chunk_index`, `heading`, `content`, `content_hash`), Vektor als gepackter float32-BLOB (`embedding`, 768 Dimensionen = 3 KB), `embedding_model`. FULLTEXT über `heading, content`. |

Berechtigung: Spatie Permission `use_ai_assistant`.

### Wichtige Dateien

#### Backend

| Datei | Zweck |
|---|---|
| `app/Livewire/Hub/AiAssistant.php` | Livewire-Komponente, hält State, ruft den Service auf |
| `app/Services/Ai/GlatttBertService.php` | Chat: Verlauf, Werkzeug-Schleife, Zitate → `[n]` + Quellen-Karten, Telemetrie/Kosten |
| `app/Services/Ai/GlatttBertInstructions.php` | Systemanweisung (unveränderlich, gecacht) + Tagesdatum als eigener Block |
| `app/Services/Ai/HubToolExecutor.php` | Die 12 Hub-Werkzeuge (`definitions()` im Claude-Format, `execute()`) |
| `app/Services/Ai/ClaudeClient.php` | **Einziger** Zugang zur Claude API (SDK `anthropic-ai/sdk`), inkl. Ausweich-Modell bei Ablehnung; `ClaudeClient::fake()` für Tests |
| `app/Services/Ai/ClaudeCost.php` | Kosten je Antwort aus `config/anthropic.php`; Schätzung alter OpenAI-Zeilen |
| `app/Services/Knowledge/KnowledgeChunker.php` | Zerlegt Text in Abschnitte (~3.000 Zeichen, Überschriften, Überlappung) |
| `app/Services/Knowledge/KnowledgeIndexer.php` | Hält `knowledge_chunks` aktuell, verwendet Embeddings unveränderter Abschnitte wieder |
| `app/Services/Knowledge/KnowledgeSearchService.php` | Hybride Suche (Volltext + Kosinus, Reciprocal Rank Fusion) |
| `app/Services/Knowledge/DocumentTextExtractor.php` | Text aus PDF (`pdftotext`), DOCX, PPTX, XLSX |
| `app/Services/Google/VertexEmbeddingService.php` | Embeddings über Vertex AI (`europe-west3`) |
| `app/Services/Google/SpeechToTextService.php` | Transkription über Speech-to-Text v2, Chirp 2 (`europe-west4`) |
| `app/Services/KnowledgeBaseSyncService.php` | Drive → `knowledge_articles` → Index |
| `app/Services/WikiSyncService.php` | Wiki (GitHub) → `knowledge_articles` → Index |
| `app/Console/Commands/IndexKnowledgeBase.php` | `glatttbert:index` — Erstaufbau / fehlende Vektoren nachholen |
| `app/Jobs/GenerateConversationTitleJob.php` | Auto-Titel über Claude Haiku 4.5 |
| `app/Http/Controllers/CronController.php` | `syncKnowledgeBase()` für Cloud Scheduler |

#### Frontend

| Datei | Zweck |
|---|---|
| `resources/views/livewire/hub/ai-assistant.blade.php` | Vollständiger Chat-UI |
| `public/css/theme_glattt.css` | Sektion `.bert-chat-*` (ab Zeile ~19850) |
| `public/js/bert-typewriter.js` | Typewriter-Effekt für frische Antworten |

#### Konfiguration

| Variable | Zweck |
|---|---|
| `ANTHROPIC_API_KEY` | API-Schlüssel für Claude (gleicher Schlüssel für alle KI-Stellen im Hub) |
| `ANTHROPIC_MODEL` | Standardmodell für Einzelaufgaben (Bildanalyse, Scan-PDFs, Vertragsanalyse), Standard `claude-sonnet-5-5` |
| `ANTHROPIC_SMALL_MODEL` | Kleines Modell für Titel und Namensklassifizierung, Standard `claude-haiku-4-5` |
| `GLATTTBERT_MODEL` / `GLATTTBERT_EFFORT` | Chat-Modell (Standard `claude-sonnet-5-5`) und Aufwand (`medium`) |
| `GOOGLE_SERVICE_ACCOUNT_JSON(_CONTENT)` | Service-Konto `glatttbert-knowledge-base@glattthub` — Drive, Vertex AI, Speech-to-Text |
| `GOOGLE_EMBEDDING_MODEL` / `GOOGLE_VERTEX_LOCATION` | Embedding-Modell (`gemini-embedding-001`) und Region (`europe-west3`) |
| `GOOGLE_SPEECH_MODEL` / `GOOGLE_SPEECH_LOCATION` | Transkription (`chirp_2`, `europe-west4` — Chirp gibt es nicht in Frankfurt) |
| `CRON_TOKEN` (`config/services.php`) | Auth für `/api/cron/sync-knowledge-base` |

Rechte des Service-Kontos im Projekt `glattthub`: **Vertex AI User** (`roles/aiplatform.user`)
und **Cloud Speech Client** (`roles/speech.client`); API `speech.googleapis.com` muss aktiv sein.

### UI-Verhalten und Tastenkürzel (Referenz)

Die Regeln, die das Chat-Fenster umsetzt — wer am Frontend arbeitet, muss sie kennen; die
Bedienung selbst steht in Grundlagen 5.

**Einstiege:** Desktop ganz unten in der Seitenleiste über dem Profil (Zeile mit Avatar und
„glatttBert / fragen"); der Chat fährt neben der Leiste auf ihrer vollen Höhe heraus und
wächst aus dem Einstieg, die Seite dahinter bleibt bedienbar. Mobil über „Mehr" in der unteren
Leiste als erste der vier Schaltflächen unter dem Bereichs-Raster (neben Standort,
Mitteilungen und Theme). Bis 19.08.2026 klebte Bert als runder Knopf unten rechts über dem
Inhalt; der feste Platz ersetzte die Verbindungsanzeige („Verbunden"), die ersatzlos entfiel
(siehe [Einstiege und Andockung](#einstiege-und-andockung-19082026)).

**Header-Elemente:**

| Element | Funktion |
|---|---|
| **Einstieg in der Seitenleiste** (mobil: „Mehr" → glatttBert) | Bert öffnen/schließen |
| **Hamburger-Icon (Header links)** | Verlauf-Sidebar ein/ausblenden (nur im **maximierten Modus** sichtbar) |
| **Plus-Icon im Header** | Neue Konversation starten (Textarea erhält automatisch den Fokus, Event `conversation-started`) |
| **Maximieren-Icon** | Vollbild-Modus an/aus |
| **X-Icon** | Chat schließen |

**Tastenkürzel:**

| Shortcut | Aktion |
|---|---|
| `⌘K` / `Strg+K` | Bert öffnen / schließen (Fokus ins Eingabefeld) |
| `Esc` | Bert schließen (wenn offen) |
| `⌘⇧N` / `Strg+Shift+N` | Neue Konversation starten |
| `Enter` | Nachricht senden |
| `Shift+Enter` | Zeilenumbruch in der Nachricht |

**Minimierter Modus:** Der Sidebar-Toggle ist ausgeblendet; war die Sidebar beim Wechsel in
den kleinen Modus offen, schließt sie sich automatisch. Im Header werden Name & Untertitel
„glatttBert / AI Spezialist" ausgeblendet — stattdessen erscheint der Konversationstitel
kompakt neben dem Avatar (zweizeilig, kleinere Schrift).

**Maximierter Modus:** 80 % Bildschirmbreite und 85 % Höhe — für Antworten mit langen
Tabellen oder Listen; der Zustand liegt in `localStorage`.

**Kontextbezogene Begrüßung** bei neuer Konversation, tageszeit- und wochentagsabhängig:
Morgens (5–11 Uhr) „Guten Morgen, {Vorname}!", tagsüber (11–18 Uhr) „Hallo, {Vorname}!",
abends (18–22 Uhr) „Guten Abend, {Vorname}!", nachts „Spät dran? Ich bin trotzdem hier."
Der Untertitel variiert nach Wochentag (Wochenstart, Bergfest, Wochenende, …).

**Beispiel-Prompts** (vier Karten in der leeren Konversation, Klick sendet sofort):
„Wie muss ich den Laser warten?", „Wie hoch ist die No-Show-Rate in diesem Monat?", „Was sind
die glattt-Werte – und was sind unsere wichtigsten KPIs?", „Wer hilft mir, wenn ein Kunde
unzufrieden ist?"

**Quick-Action-Chips** über dem Eingabefeld (fünf datenorientierte Routine-Fragen): Umsatz
heute · Termine heute · Neukunden diese Woche · Stornoquote · Top-Anzeige.

**Verlauf-Sidebar** (Hamburger-Icon): die letzten 30 Konversationen, gruppiert nach Heute /
Gestern / Diese Woche (letzte 7 Tage) / Älter, angeheftete in einer eigenen Sektion
„Angeheftet" ganz oben. Funktionen: Suchfeld mit Live-Suche nach Titel (300 ms Debounce),
„Neue Konversation", Klick lädt die Konversation, Pin-Icon (Hover) heftet an, Stift-Icon
benennt inline um, Mülleimer löscht mit Bestätigungs-Modal; die aktive Konversation trägt
einen goldenen Linksbalken. Standardverhalten: im normalen Modus geschlossen, im maximierten
offen; beim Wechsel von maximiert zu minimiert schließt sie sich; der letzte Zustand liegt in
`localStorage`. **Sofort-Eintrag:** Beim Senden der ersten Nachricht erscheint die neue
Konversation sofort in der Sidebar (Platzhalter-Titel), der Auto-Titel wird nachgereicht.

**Quellen-Referenzen:** Greift Bert auf Wissensdatenbank-Dokumente zu, stehen am Ende der
Antwort hochgestellte Ziffern (`¹`, `²`, `³`); ein Klick zeigt den Dokument-Titel (Spalte
`embeds`).

**Loading-Phasen** (Indicator-Text während der Antwort): 0–2 s „Bert denkt nach…", 2–6 s
„Durchsuche Wissensdatenbank…", 6–15 s „Formuliere Antwort…", ab 15 s „Das dauert heute etwas
länger…".

### Knowledge-Base-Sync

#### Lokal manuell

```bash
# Voller Sync (alle Dateien) — kann lange dauern
php artisan knowledge-base:sync

# Nur 30 Dateien (Test)
php artisan knowledge-base:sync --limit=30

# Mehrere Batches mit GC dazwischen
php artisan knowledge-base:sync --limit=100 --batches=3

# Suchindex komplett neu aufbauen bzw. fehlende Vektoren nachholen
php artisan glatttbert:index --fresh
php artisan glatttbert:index --embed-only
```

Der Service:

1. Lädt Datei-Liste aus Google Drive (rekursiv)
2. Pro Datei den Text:
   - Google Docs/Sheets/Slides/Sites → Export als Text (Sites in Unterseiten zerlegt)
   - PDF/DOCX/PPTX/XLSX → Download + `DocumentTextExtractor`; **Scan-PDFs ohne Textebene liest Claude**
   - Bilder → Claude beschreibt das Bild und schreibt sichtbaren Text ab (HEIC/TIFF/BMP vorher per ImageMagick zu JPEG, max. 3,5 MB)
   - Audio/Video → ffmpeg zieht die Tonspur als Mono-FLAC heraus und schneidet sie in 55-s-Stücke, die einzeln an Speech-to-Text gehen (kein Umweg über Cloud Storage)
3. Speichert/aktualisiert `KnowledgeArticle`
4. `KnowledgeIndexer::index()` zerlegt geänderte Artikel und holt die Vektoren
5. Artikel ohne Text oder inaktive Artikel fliegen aus dem Index

Ein Artikel ohne Text wird beim nächsten Lauf erneut versucht (z. B. nach einem Download-Fehler).
Schlägt Vertex AI fehl, bleiben die Abschnitte **ohne Vektor** stehen — der Volltext findet sie
trotzdem, `glatttbert:index --embed-only` holt die Vektoren nach.

Memory-Schutz: `ini_set('memory_limit', '1024M')` + `gc_collect_cycles()` nach jeder Datei.
`pdftotext` kommt über `poppler-utils` ins Docker-Image.

#### Produktion (Cloud Scheduler)

Täglich **03:00 Europe/Berlin** läuft Job `glattthub-sync-knowledge-base`,
der `POST /api/sync-knowledge-base` mit `X-Cron-Token` aufruft.

Defaults: `limit=100, batches=3` (max ~5–10 Min Laufzeit, weit unter dem
30-Min-Cap von Cloud Scheduler).

Setup-Details: siehe [Cloud Scheduler Setup](CLOUD-SCHEDULER-SETUP.md).

### Chat-Flow

```
User tippt → sendMessage()
  ├── User-Nachricht in $messages pushen, isLoading = true
  └── $wire.js('generateResponse')   ← zweiter Roundtrip
        ↓
generateResponse($message)
  ├── getOrCreateConversation()
  ├── GlatttBertService::chat()
  │     ├── Verlauf: letzte 20 Nachrichten (nur Text) + neue Frage
  │     ├── Claude: system = [Anweisung (gecacht), Tagesdatum], tools = search_knowledge + 12 Hub-Werkzeuge
  │     ├── stop_reason tool_use → Werkzeuge ausführen, Ergebnisse zurück (max. 10 Runden)
  │     │     • search_knowledge → 8 Abschnitte als search_result-Blöcke mit citations
  │     │     • Hub-Werkzeug → JSON; __embeds gehen nur ans Frontend
  │     ├── Zitate (search_result_location) → " [n]" im Text + Quellen-Karten
  │     └── Antwort + Telemetrie + cost_usd speichern
  ├── Antwort in $messages pushen (fresh:true → Typewriter)
  └── GenerateConversationTitleJob::dispatchSync()
```

**Caching:** Systemanweisung + Werkzeuge (~9.000 Tokens) tragen einen Cache-Punkt und kommen
ab der zweiten Anfrage für ein Zehntel des Preises aus dem Cache. Den Verlauf **nicht**
mitcachen: Die Suchtreffer ändern sich je Runde, der Cache würde nur teuer geschrieben
(Messung 06.10.2026: 0,11 $ statt 0,03 $ je Antwort).

**Thinking:** Sonnet 5.5 denkt adaptiv (`effort: medium`). In der Werkzeug-Schleife wird
deshalb immer der vollständige `content` der Antwort (inkl. Thinking-Blöcken) zurückgegeben.

**Ablehnung:** Alle Anfragen laufen mit `fallbacks: "default"` (Beta
`server-side-fallback-2026-07-01`). Lehnt die ganze Kette ab (`stop_reason: refusal`),
sieht die Nutzerin „Diese Anfrage kann glatttBert leider nicht beantworten."

### Auto-Titel (`GenerateConversationTitleJob`)

Nach jeder Antwort vergibt Bert einen Titel (maximal 6 Wörter) aus dem gesamten Verlauf,
solange die Nutzerin den Titel nicht selbst umbenannt hat.

- Modell: `ANTHROPIC_SMALL_MODEL` (Haiku 4.5), temperature 0.3
- Eingabe: Verlauf, je Nachricht auf 600 Zeichen gekürzt, gesamt max. 6.000 Zeichen
- Strippt Anführungszeichen (`„“” ‘`), Punkte am Ende, kürzt auf 80 Zeichen

### Personen-Suche (search_client)

Wenn in einer Nachricht ein Vor- und/oder Nachname vorkommt, geht Bert in **zwei Schritten** vor:

1. **`search_client`** — durchsucht zuerst die lokale DB + Phorest nach einem Kunden mit diesem Namen.
   - Bei Treffer → `get_client_details` + `get_client_notes` parallel, Notizen-Zusammenfassung oben
   - Kein Treffer → weiter mit Schritt 2
2. **`search_knowledge`** — durchsucht die Wissensdatenbank (Mitarbeiter, Vermieter, interne Kontakte).
   - Bei Treffer → daraus antworten
   - Kein Treffer → „Person nicht gefunden"

**Wichtig:** Bert fragt niemals zurück, ob jemand ein Kunde ist — er sucht selbst.

#### Phorest Multi-Strategy-Suche

Da Phorest **kein Partial-Matching** für `lastName` unterstützt, nutzt `HubToolExecutor::searchClient()` mehrere Suchstrategien parallel:

```
1. firstName + lastName (z.B. "Laura" + "Abing")
2. lastName + firstName (vertauscht)
3. firstName-only für jeden Namensteil
```

Dies entspricht der Logik aus `ContractController::searchClientsForContract()`. Fehler aus der lokalen DB und der Phorest-API werden separat gecatcht und — im Developer-Mode — als `debug_info` zurückgegeben.

### Developer-Mode

Wenn ein Nutzer das Wort **„debug"** oder **„developer mode"** in einer Nachricht verwendet, aktiviert Bert den Developer-Mode für diese Antwort:

- Falls ein Tool-Call fehlgeschlagen ist und `debug_info` im Tool-Result enthalten war → gibt Bert den Fehlerdetail als Code-Block aus
- Falls `debug_info` fehlt (Tool erfolgreich) → antwortet Bert: „Tool erfolgreich — kein Fehler aufgetreten."
- Bert erfindet **niemals** Fehlermeldungen, wenn `debug_info` nicht vorhanden ist

`debug_info` ist ein **flacher String** (kein JSON-Objekt) — historisch, weil OpenAI bei verschachtelten Objekten in Tool-Outputs einen `ValueError` warf; das Format ist geblieben:

```
"LocalDB-Error: ... | Phorest-API-Errors: 2x | HTTP-Status: 500 | Searched-Params: [...]"
```

### Branch-ID-Auflösung in AI-Tool-Calls

Wenn Bert ein Tool aufruft, das einen `branch_id`-Parameter erwartet, akzeptiert die Tool-Implementierung sowohl die interne ID als auch den Standortnamen (z.B. `"München"`, `"Hamburg"`). Der Resolver in `HubToolExecutor::execute()` mappt frei eingegebene Standortbezeichnungen automatisch auf die korrekte `branches.id`. So kann Bert auch dann antworten, wenn er den Standortnamen aus dem Kontext bezieht statt die ID zu kennen.

### Markdown-Rendering

Assistant-Antworten werden mit `Str::markdown()` gerendert mit aktivierter
**`TableExtension`** (GFM-Pipe-Tabellen).

CSS-Scope: `.bert-chat-bubble-md`. Styles in `theme_glattt.css`:

- Tabellen mit goldenem Header, Zebra-Striping, Hover-Highlight
- Code-Blocks (`pre`) als Dark-Box, Inline-`code` golden mit Border
- Blockquotes mit goldenem Linksbalken
- Headings h1–h4 mit angepassten Größen

Frische Assistant-Antworten erhalten zusätzlich einen **Typewriter-Effekt**
via Alpine (`bertTypewriter()` in `public/js/bert-typewriter.js`) und
`wire:ignore`, damit Livewire den DOM-Inhalt bei nachfolgenden Re-Renders
nicht überschreibt.

### Berechtigungs-Check

In `AiAssistant.php` wird in jeder öffentlichen Methode geprüft:

```php
if (!Auth::user()->can('use_ai_assistant')) {
    return;
}
```

Im Blade ist das gesamte Panel in `@can('use_ai_assistant')` gewrappt — ebenso
die beiden Einstiege in `sidebar.blade.php` und `bottom-nav.blade.php`.

### Einstiege und Andockung (19.08.2026)

Der Chat liegt weiterhin als Livewire-Komponente im Hub-Layout
(`@livewire('hub.ai-assistant')`) und **nicht** in der Seitenleiste — dort
würden ihn deren Overflow-Container beschneiden. Die Auslöser stehen also
ausserhalb der Komponente und verständigen sich über Fenster-Ereignisse:

| Ereignis | Richtung | Zweck |
|---|---|---|
| `glattt-bert-toggle` | Auslöser → Chat | Öffnen/Schließen (`x-on:glattt-bert-toggle.window`) |
| `glattt-bert-state` | Chat → Auslöser | Zustand, damit sich der Einstieg einfärbt (`bertOpen` in `sidebarPanels()`) |

Andockung (`.bert-chat-panel`, ab 1024 px): `left`, `top` und `height` folgen
denselben Layout-Variablen wie `#sidebar`, dazu `--bert-dock-left` als
gemeinsamer Anker. Klappt die Leiste ein, wechselt nur diese Variable
(`body:has(#sidebar.sidebar-collapsed)`), der maximierte Modus rechnet seine
Breite daraus. `transform-origin: left bottom` lässt das Panel aus dem Einstieg
wachsen. Unter 1024 px bleibt die bisherige schwebende Geometrie, nur höher
gesetzt, damit die untere Leiste frei bleibt.

Die Begrüßungsblase wird per JS an den Einstieg geheftet
(`positionGreeting()`): Dessen Höhe hängt vom Profilbereich ab (u. a. die von
`auto-logout.js` nachgeschobene Countdown-Leiste) und lässt sich nicht in CSS
festnageln. Gemessen wird im `requestAnimationFrame` nach `x-show`, gesetzt
wird nur `top` — **kein** `transform`, den bespielt bereits `x-transition`.

Abgesichert durch `tests/Feature/BertSidebarEntryTest.php`.

### Umstieg OpenAI → Claude (Oktober 2026)

Beim ersten Deploy laufen die Migrationen `knowledge_chunks` und `ai_messages`
(Cache-Tokens, `cost_usd`) automatisch. Danach einmal:

1. Rechte des Service-Kontos prüfen (siehe Konfiguration)
2. `php artisan knowledge-base:sync` — holt für PDF/Office-Dateien jetzt den Text (vorher
   las OpenAI sie selbst, `content` war leer)
3. `php artisan glatttbert:index` — zerlegt alle Artikel, berechnet die Vektoren

Vorhandene Bildbeschreibungen und Video-Transkripte aus der OpenAI-Zeit bleiben unverändert.
Die OpenAI-Spalten (`openai_thread_id`, `openai_file_id`) entfernt die Migration `drop_openai_columns`; Vector Store und alle 1.835 Dateien bei OpenAI wurden am 06.10.2026 gelöscht, der Assistant war mit der API bereits verschwunden.

### Bekannte Einschränkungen

- **Keine Streaming-Ausgabe:** Die Antwort kommt am Stück (Livewire-Roundtrip), der
  Typewriter-Effekt simuliert das Tippen. Eine Antwort mit Suche dauert 8–15 s.
- **MAMP-Timeout (lokal):** MAMP nutzt FastCGI — `set_time_limit()` ist wirkungslos. Fix: in
  `/Applications/MAMP/bin/php/php/conf/php.ini` `max_execution_time = 300` setzen, Apache neu starten.
- **Semantische Suche im Speicher:** Die Vektoren (lokal ~3.800 Abschnitte, 11 MB) werden je
  Anfrage geladen und in PHP verglichen (~0,3 s). Ab ~50.000 Abschnitten auf eine
  Vektor-Datenbank umsteigen.
- **Alte Office-Formate** (`.doc`, `.xls`, `.ppt`) werden nicht gelesen.
- **Kosten** (Messung 06.10.2026): 3–6 Cent je Antwort mit Suche (Sonnet 5.5), Titel < 0,1 Cent.
  Das ist etwa doppelt so viel wie mit gpt-4o — Haupttreiber sind Suchtreffer (~6.000 Tokens)
  und das Nachdenken des Modells. Stellschrauben: `GLATTTBERT_EFFORT=low`, `search_results` in
  `config/anthropic.php`.

---

## Feature-Historie

| Datum | Feature |
|---|---|
| 2026-05 | Initiale Version (Livewire-Component, OpenAI Assistants v2 — abgelöst 10/2026) |
| 2026-05 | Knowledge-Base-Sync (Drive → DB → Vector Store) |
| 2026-05 | Batched-Sync mit GC + Cloud-Scheduler-Endpoint |
| 2026-05 | Beispiel-Prompts in Welcome-View (E13) |
| 2026-05 | Quick-Action-Chips über dem Input (E1) |
| 2026-05 | Maximierter Modus mit `localStorage`-Persistenz (D1) |
| 2026-05 | Globale Tastenkürzel `⌘K`, `Esc`, `⌘⇧N` (P1) |
| 2026-05 | Auto-Titel via `gpt-4o-mini` Hintergrund-Job (E7) |
| 2026-05 | Verlauf-Sidebar mit Suche, Gruppierung, Löschen (D8) |
| 2026-05 | Phasen-Loading-Indicator (D10) |
| 2026-05 | Markdown-Tabellen + GFM-Extension (D4) |
| 2026-05 | Kontextbezogene Begrüßung (E2) |
| 2026-05 | Greeting-Bubble über dem FAB für Erstkontakt |
| 2026-05 | Sofort-Eintrag in Sidebar beim Senden (vor Antwort) |
| 2026-05 | Pinnen, Umbenennen, Lösch-Bestätigung in Sidebar |
| 2026-05 | Quellen-Referenzen als hochgestellte Ziffern (Spalte `embeds`) |
| 2026-05 | Auto-Titel mit vollem Kontext (User-Frage + Antwort) |
| 2026-05 | Branch-ID-Resolver für AI-Tool-Calls (Standortname → ID) |
| 2026-05 | MAMP-Timeout-Fix via `.htaccess` (300 s) |
| 2026-05 | Sidebar-Toggle im minimierten Modus ausgeblendet; Sidebar schließt beim Verkleinern |
| 2026-05 | Header im minimierten Modus: nur Avatar + Konversationstitel (Name/Subtitle ausgeblendet) |
| 2026-05 | Neue Konversation → Textarea erhält automatisch den Fokus (`conversation-started` Event) |
| 2026-05 | Badges auf Deutsch: „Full Body" → „Ganzkörper", Status-Labels Aktiv/Storniert/Abgeschlossen |
| 2026-05 | Personen-Suche sequentiell: zuerst `search_client`, dann `file_search` (statt parallel) |
| 2026-05 | Phorest Multi-Strategy-Suche (firstName+lastName-Kombos) in `HubToolExecutor` |
| 2026-05 | Developer-Mode: `debug_info` als flacher String (kein nested JSON), KI halluziniert keine Fehler |
| 2026-05 | MAMP-Timeout-Fix korrigiert: `php.ini` direkt (FastCGI ignoriert `.htaccess` `php_value`) |
| 2026-08 | Fester Platz in der Seitenleiste statt schwebender Blase; Chat dockt neben der Leiste an, mobiler Einstieg im Mehr-Sheet (19.08.2026) |
| 2026-08 | OpenAI schaltet die Assistants API ab (26.08.2026), auf der glatttBert lief |
| 2026-10 | Umstieg auf Claude (Sonnet 5.5) mit eigenem hybriden Suchindex (Volltext + Vertex-Embeddings), PDF/Office-Text im Hub, Bilder über Claude, Videos über Google Speech-to-Text, Kosten je Antwort im Bert-Dashboard (06.10.2026) |

---

## Verwandte Dokumente

- [Cloud Scheduler Setup](CLOUD-SCHEDULER-SETUP.md) — Sync-Job-Konfiguration
- [Berechtigungssystem](BERECHTIGUNGSSYSTEM.md) — `use_ai_assistant`
- [Design System](DESIGN-SYSTEM.md) — `.bert-chat-*` CSS-Klassen
