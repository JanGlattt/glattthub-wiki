# glatttBert — KI-Assistent

**glatttBert** ist der interne KI-Assistent von glatttHub. Er beantwortet
Fragen zu Kunden, Verträgen, Statistiken, internen Prozessen und der
Wissensdatenbank — direkt im Hub als Chat-Panel unten rechts.

![glatttBert Avatar](assets/glatttBert.png){ align=right width=120 }

---

## Für Endanwender

### Wo finde ich Bert?

In jedem Hub-Bereich erscheint unten rechts ein **goldener Chat-Button** mit
dem glatttBert-Avatar. Ein Klick öffnet das Chat-Panel.

> **Tastenkürzel:** `⌘K` (Mac) bzw. `Strg+K` (Windows) öffnet/schließt Bert von
> jeder Seite aus und setzt den Fokus direkt ins Eingabefeld.

### Was kann Bert?

- **Wissensdatenbank-Fragen:** Bert hat Zugriff auf alle Dokumente,
  Anleitungen und Standards aus unserem Google Drive (Vector-Store-basiert)
- **Datenfragen:** Umsatz, Termine, Kunden-KPIs, Stornoquote, Top-Anzeigen
- **Prozessfragen:** „Wie funktioniert XY?", „Wer ist verantwortlich für Z?"
- **Kontext-Erinnerungsvermögen:** Bert merkt sich den Gesprächsverlauf
  innerhalb einer Konversation

### Bedienung

#### Chat-Fenster

| Element | Funktion |
|---|---|
| **FAB unten rechts** | Bert öffnen/schließen |
| **Hamburger-Icon (Header links)** | Verlauf-Sidebar ein/ausblenden |
| **Plus-Icon im Header** | Neue Konversation starten |
| **Maximieren-Icon** | Vollbild-Modus an/aus |
| **X-Icon** | Chat schließen |

#### Tastenkürzel

| Shortcut | Aktion |
|---|---|
| `⌘K` / `Strg+K` | Bert öffnen / schließen |
| `Esc` | Bert schließen (wenn offen) |
| `⌘⇧N` / `Strg+Shift+N` | Neue Konversation starten |
| `Enter` | Nachricht senden |
| `Shift+Enter` | Zeilenumbruch in der Nachricht |

#### Kontextbezogene Begrüßung

Beim Öffnen einer neuen Konversation begrüßt Bert dich tageszeit- und
wochentagsabhängig:

- **Morgens (5–11 Uhr):** „Guten Morgen, {Vorname}!"
- **Tagsüber (11–18 Uhr):** „Hallo, {Vorname}!"
- **Abends (18–22 Uhr):** „Guten Abend, {Vorname}!"
- **Nachts:** „Spät dran? Ich bin trotzdem hier."

Der Untertitel variiert nach Wochentag (Wochenstart, Bergfest, Wochenende, …).

#### Beispiel-Prompts

Bei einer neuen, leeren Konversation siehst du **vier Beispiel-Karten**, mit
denen du sofort einsteigen kannst:

1. „Wie muss ich den Laser warten?"
2. „Wie hoch ist die No-Show-Rate in diesem Monat?"
3. „Was sind die glattt-Werte – und was sind unsere wichtigsten KPIs?"
4. „Wer hilft mir, wenn ein Kunde unzufrieden ist?"

Ein Klick auf eine Karte sendet die Frage sofort.

#### Quick-Action-Chips

Über dem Eingabefeld findest du **fünf Schnellzugriff-Chips** für
datenorientierte Routine-Fragen:

- 📊 Umsatz heute
- 📅 Termine heute
- 👥 Neukunden diese Woche
- ⚠️ Stornoquote
- 🎯 Top-Anzeige

#### Verlauf-Sidebar

Über das Hamburger-Icon im Header öffnest du den **Verlauf** deiner letzten
30 Konversationen. Sie sind nach Zeitperiode gruppiert:

- **Heute** — Konversationen vom aktuellen Tag
- **Gestern** — Konversationen vom Vortag
- **Diese Woche** — letzte 7 Tage
- **Älter** — alle weiteren

Funktionen in der Sidebar:

- **Suchfeld oben:** Live-Suche nach Konversations-Titel (300 ms debounce)
- **„Neue Konversation":** startet einen frischen Chat
- **Klick auf Eintrag:** lädt die Konversation in den Hauptbereich
- **Pin-Icon (Hover):** Konversation oben anheften; angeheftete Konversationen erscheinen in einer eigenen Sektion **„Angeheftet“** ganz oben
- **Stift-Icon (Hover):** Konversation umbenennen — Inline-Edit direkt im Sidebar-Eintrag
- **Mülleimer-Icon (Hover):** Löschen mit **Bestätigungs-Modal** (verhindert versehentliches Löschen)
- **Aktive Konversation:** wird mit goldenem Linksbalken hervorgehoben

!!! tip "Sofort-Eintrag"
    Beim Senden der ersten Nachricht erscheint die neue Konversation **sofort** in der Sidebar (mit Platzhalter-Titel), noch bevor die Antwort generiert ist. Der Auto-Titel wird nachgereicht, sobald die Antwort vorliegt.

> **Sidebar-Standardverhalten:**  
> Im normalen Modus geschlossen, im maximierten Modus offen.  
> Der letzte Zustand wird in `localStorage` gespeichert.

#### Auto-Titel

Nach der ersten Antwort vergibt Bert automatisch einen passenden Titel
(maximal 6 Wörter) für die Konversation — generiert über `gpt-4o-mini` als
Hintergrund-Job. Der Job erhält den **vollen Konversations-Kontext** (User-Frage + Assistant-Antwort), nicht nur die User-Eingabe, damit der Titel das tatsächliche Thema treffender beschreibt. Bestehende Titel werden nicht überschrieben.

#### Quellen-Referenzen

Wenn Bert auf Wissensdatenbank-Dokumente zugreift, erscheinen am Ende der Antwort kleine **hochgestellte Ziffern** (`¹`, `²`, `³`) als Verweise auf die zugrundeliegenden Quellen. Ein Klick darauf zeigt den jeweiligen Dokument-Titel.

#### Loading-Phasen

Während Bert nachdenkt, siehst du im Chat einen Indicator mit wechselndem
Text:

- 0–2 s: „Bert denkt nach…"
- 2–6 s: „Durchsuche Wissensdatenbank…"
- 6–15 s: „Formuliere Antwort…"
- ab 15 s: „Das dauert heute etwas länger…"

#### Maximierter Modus

Über das Maximieren-Icon im Header schaltest du auf 80 % Bildschirmbreite
und 85 % Höhe um — ideal für Antworten mit langen Tabellen oder Listen.
Der Zustand wird in `localStorage` gemerkt.

### Berechtigungen

Bert ist nur für Nutzer mit der Berechtigung **`use_ai_assistant`**
verfügbar (Gruppe **Systemzugriff** im Rollen-Editor). Diese kann in der Personalverwaltung pro Rolle/Nutzer vergeben
werden (siehe [Berechtigungssystem](BERECHTIGUNGSSYSTEM.md)).

---

## Für Entwickler

### Architektur

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Livewire + Alpine.js)                        │
│  resources/views/livewire/hub/ai-assistant.blade.php    │
│  app/Livewire/Hub/AiAssistant.php                       │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│  Service-Layer                                          │
│  app/Services/OpenAiAssistantService.php (Chat-Runs)    │
│  app/Services/KnowledgeBaseSyncService.php (Indexing)   │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│  OpenAI Assistants API v2                               │
│  • Assistant: asst_... (Modell: gpt-4o)                 │
│  • Vector Store: vs_... (File-Search)                   │
│  • Threads: 1 Thread pro AiConversation                 │
└─────────────────────────────────────────────────────────┘
             │
             ▲
┌─────────────────────────────────────────────────────────┐
│  Knowledge-Base-Sync                                    │
│  Google Drive  →  KnowledgeArticle  →  Vector Store     │
│  Cloud Scheduler täglich 03:00 Europe/Berlin            │
└─────────────────────────────────────────────────────────┘
```

### Datenmodell

| Tabelle | Zweck |
|---|---|
| `ai_conversations` | Eine Konversation pro Nutzer-Chat. Felder: `id`, `user_id`, `title`, `openai_thread_id`, `is_pinned`, `last_activity_at`, `created_at`, `updated_at` |
| `ai_messages` | Einzelne Nachrichten (User + Assistant). Felder: `conversation_id`, `role`, `content`, `embeds` (JSON: Quellen-Referenzen) |
| `knowledge_articles` | Synchronisierte Drive-Inhalte. Felder: `id`, `source_type`, `source_id`, `title`, `content`, `mime_type`, `openai_file_id`, `last_synced_at` |

Berechtigung: Spatie Permission `use_ai_assistant`.

### Wichtige Dateien

#### Backend

| Datei | Zweck |
|---|---|
| `app/Livewire/Hub/AiAssistant.php` | Livewire-Komponente, hält State, ruft Service auf |
| `app/Services/OpenAiAssistantService.php` | OpenAI-Run-Orchestrierung, Thread-Handling |
| `app/Services/KnowledgeBaseSyncService.php` | Drive → DB → Vector Store Sync |
| `app/Console/Commands/SyncKnowledgeBase.php` | Artisan-Command `knowledge-base:sync` |
| `app/Jobs/GenerateConversationTitleJob.php` | Async-Job für Auto-Titel via `gpt-4o-mini` |
| `app/Http/Controllers/CronController.php` | `syncKnowledgeBase()` Endpoint für Cloud Scheduler |
| `app/Models/AiConversation.php` | Eloquent-Model |
| `app/Models/AiMessage.php` | Eloquent-Model |
| `app/Models/KnowledgeArticle.php` | Eloquent-Model |

#### Frontend

| Datei | Zweck |
|---|---|
| `resources/views/livewire/hub/ai-assistant.blade.php` | Vollständiger Chat-UI |
| `public/css/theme_glattt.css` | Sektion `.bert-chat-*` (ab Zeile ~19850) |

#### Konfiguration

| Variable | Zweck |
|---|---|
| `OPENAI_API_KEY` | API-Key für OpenAI |
| `OPENAI_ASSISTANT_ID` | ID des Assistants (in OpenAI angelegt) |
| `OPENAI_VECTOR_STORE_ID` | ID des Vector-Stores für File-Search |
| `CRON_TOKEN` (`config/services.php`) | Auth für `/api/sync-knowledge-base` |

### Knowledge-Base-Sync

#### Lokal manuell

```bash
# Voller Sync (alle Dateien) — kann lange dauern
php artisan knowledge-base:sync

# Nur 30 Dateien (Test)
php artisan knowledge-base:sync --limit=30

# Mehrere Batches mit GC dazwischen
php artisan knowledge-base:sync --limit=100 --batches=3
```

Der Service:

1. Lädt Datei-Liste aus Google Drive (rekursiv, gefiltert nach erlaubten MIMEs)
2. Pro Datei:
   - Google Docs/Sheets → Export als Markdown/CSV
   - PDF/DOCX → direkter Upload zu OpenAI
   - Bilder/Audio/Video → Vision/Whisper-Transkription
3. Speichert/aktualisiert `KnowledgeArticle` in DB
4. Lädt zu Vector Store hoch (`openai_file_id`)
5. Löscht veraltete Files aus Vector Store

Memory-Schutz: `ini_set('memory_limit', '512M')` + `gc_collect_cycles()`
nach jeder Datei. Pre-Checks: Vision ≤ 20 MB, Whisper ≤ 25 MB.

#### Produktion (Cloud Scheduler)

Täglich **03:00 Europe/Berlin** läuft Job `glattthub-sync-knowledge-base`,
der `POST /api/sync-knowledge-base` mit `X-Cron-Token` aufruft.

Defaults: `limit=100, batches=3` (max ~5–10 Min Laufzeit, weit unter dem
30-Min-Cap von Cloud Scheduler).

Setup-Details: siehe [Cloud Scheduler Setup](CLOUD-SCHEDULER-SETUP.md).

### Chat-Flow

```
User tippt → sendMessage()
  ├── User-Nachricht in $messages pushen
  ├── isLoading = true
  ├── chat-message-sent dispatchen → Auto-Scroll
  └── $wire.js('generateResponse')   ← zweiter Roundtrip
        ↓
generateResponse($message)
  ├── getOrCreateConversation()
  │     └── neuer Thread, falls nötig (POST /threads)
  ├── OpenAiAssistantService::chat()
  │     ├── Message anhängen (POST /threads/{id}/messages)
  │     ├── Run starten (POST /threads/{id}/runs)
  │     ├── Polling bis completed
  │     └── Letzte Assistant-Message zurückgeben
  ├── Response in $messages pushen (mit fresh:true → Typewriter)
  ├── Falls $conversation->title leer:
  │     └── GenerateConversationTitleJob::dispatch()
  └── chat-response-received dispatchen → Auto-Scroll
```

### Auto-Titel (`GenerateConversationTitleJob`)

- Queue: **`push`**, tries 2, timeout 30 s
- Modell: `gpt-4o-mini`, temperature 0.3, max 30 Tokens
- Eingabe: **Voller Kontext** — erste User-Nachricht **plus** erste Assistant-Antwort (vorher: nur User-Frage). Damit treffen Titel den tatsächlichen Inhalt der Konversation.
- System-Prompt: deutsch, max 6 Wörter, ohne Anführungszeichen
- Strippt smart-quotes (`„“” ‘`), trailing periods, mb_substr 80
- Wird **nur dispatched, wenn `$conversation->title` leer ist**

### Branch-ID-Auflösung in AI-Tool-Calls

Wenn Bert ein Tool aufruft, das einen `branch_id`-Parameter erwartet, akzeptiert die Tool-Implementierung sowohl die interne ID als auch den Standortnamen (z.B. `"München"`, `"Hamburg"`). Der Resolver in `OpenAiAssistantService` mappt frei eingegebene Standortbezeichnungen automatisch auf die korrekte `branches.id`. So kann Bert auch dann antworten, wenn er den Standortnamen aus dem Kontext bezieht statt die ID zu kennen.

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

Im Blade ist das gesamte FAB+Panel in `@can('use_ai_assistant')` gewrappt.

### Migration für Produktion

`database/sql/glatttbert-prod-migration.sql` enthält:

- `CREATE TABLE` für `ai_conversations`, `ai_messages`, `knowledge_articles`
- `INSERT` für die Permission `use_ai_assistant`
- Updates auf `migrations`-Tabelle

Wird wegen Größe/Vorsicht **nicht** automatisch via `php artisan migrate`
ausgeführt — manuell durch den User in PROD eingespielt.

`knowledge_articles`-Daten werden separat als SQL-Dump (lokaler Sync →
`mysqldump knowledge_articles`) in PROD importiert.

### Bekannte Einschränkungen

- **OpenAI-Run-Polling** ist sequenziell und blockiert PHP-Worker während der
  Wartezeit. Bei langen Antworten kann das einen FPM-Worker bis zu 60 s
  belegen. Bei Last: ggf. auf Server-Sent-Events / Streaming umstellen.
- **MAMP-Timeout (lokal):** PHP/Apache cancellt Requests standardmäßig nach 30 s, was Bert-Antworten abbricht. Fix: `.htaccess` setzt `php_value max_execution_time 300` und `Timeout 300` für lokale Entwicklung.
- **Vector-Store-Limit:** OpenAI erlaubt max. 10 000 Files pro Vector Store.
  Aktuell deutlich unter dem Limit.
- **Token-Costs:** Auto-Title-Job ≈ 0,0001 € pro Konversation. Chat-Run mit
  File-Search variiert stark — typisch 0,005–0,03 € pro Antwort.

---

## Feature-Historie

| Datum | Feature |
|---|---|
| 2026-05 | Initiale Version (Livewire-Component, OpenAI Assistants v2) |
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

---

## Verwandte Dokumente

- [Cloud Scheduler Setup](CLOUD-SCHEDULER-SETUP.md) — Sync-Job-Konfiguration
- [Berechtigungssystem](BERECHTIGUNGSSYSTEM.md) — `use_ai_assistant`
- [Design System](DESIGN-SYSTEM.md) — `.bert-chat-*` CSS-Klassen
