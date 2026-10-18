# Wissen (glatttipedia) — Wissens-Raum im Hub

Die **glatttipedia** löst seit 18.10.2026 die drei Google-Sites (MA-, Leitungs- und Büro-glatttipedia)
ab: ein eigener Raum im glatttHub unter `/hub/wissen`, der aus der Seitenleiste über den Knopf **Wissen**
(über der glatttBert-Fußzeile) in einem **neuen Tab** öffnet. Er hat eine eigene Hülle im Stil des
Nutzerhandbuchs (Kopfleiste mit Suche, linke Bereichsliste, zentrierter Inhalt), nutzt aber dieselbe
Sitzung, dieselben Rechte und denselben glatttBert. Diese Seite beschreibt **Absicht, Datenmodell,
Zielgruppen, Block-Format, Editor, Suche, glatttBert-Anbindung und Import**; die Bedienung kommt ins
Nutzerhandbuch (Serie „Wissen“, geplant).

!!! nutzerhandbuch "Bedienung: Serie Wissen (geplant)"
    Klickanleitungen folgen nach dem Import der ersten Bereiche: 1 Nachschlagen und suchen,
    2 Seite schreiben, 3 Veröffentlichen und Verlauf.

---

## Für Anwender — Überblick

**Eine Seite je Thema.** Statt drei getrennter Sites gibt es Bereiche (Institut-Alltag, Verkauf &
Beratung, Behandlung & Haut, Personal & HR, Technik & Wartung, Büro-Prozesse, Leitung) mit je einem
Seitenbaum. Überschneidungen werden nicht mehr kopiert: Ein Absatz, der nur das Büro betrifft, trägt die
Zielgruppe „nur Büro“ und wird allen anderen ausgeblendet. Was jemand sieht, entscheidet der Hub aus den
eigenen Rechten, dem Standort und dem Bereich.

**Lesen, suchen, fragen.** Die Suche oben findet Seiten und springt bis zum passenden Absatz; die
globale Hub-Suche zeigt dieselben Treffer unter „Wissen“. glatttBert kennt jede veröffentlichte Seite,
antwortet aber nur mit dem, was die fragende Person auch sehen dürfte.

**Schreiben (Redaktion).** Wer das Recht `edit_knowledge` hat, legt Seiten an und bearbeitet sie im
Block-Editor: Text, Überschrift, Liste, Hinweis, Schrittfolge, Bild, Galerie, Tabelle, Video, Datei,
Hub-Link, Aufklappen. Der Entwurf speichert sich selbst; **Veröffentlichen** macht ihn sichtbar und legt
eine Version mit Änderungszeile an. Jede Seite hat eine Verantwortliche und ein Prüfintervall.

---

## Für Entwickler

### Entscheidungen (Jan, 18.10.2026)

- **Modul im Hub** statt eigener Dienst oder fertiges Wiki (BookStack, Wiki.js, Outline, Docmost
  scheitern an Sichtbarkeit je Block, Prozess-Editor und nativer App).
- **Eigener Raum mit eigener Hülle** (`layouts/wissen.blade.php`), Optik wie das Nutzerhandbuch; öffnet
  in einem neuen Tab, nicht als Hub-Seite in der Dashboard-Hülle.
- **Blöcke statt HTML**: Seiten sind JSON-Listen typisierter Blöcke; Web, App, Suche und glatttBert
  rendern dasselbe JSON. Der Editor (Editor.js) ist austauschbar.
- **Zielgruppen sind Daten** (`knowledge_audiences`), keine Rollennamen im Code.
- **Stufen:** 1 Lesen + Suche + Import + Basis-Editor (dieser Stand), 2 Prozess-Editor, Versionsvergleich,
  Prüfdatum, Rückmeldungen, 3 Änderungs-Feed, Lesebestätigung, Kiosk, Drive-Dokumente.

Konzept und Entwürfe: Projektwissen `.github/knowledge/glatttipedia-neu-wissensmodul.md`.

### Datenmodell

| Tabelle | Zweck | Wichtige Spalten |
|---|---|---|
| `knowledge_spaces` | Bereiche | `key`, `name`, `icon`, `audiences` (JSON, leer = alle), `sort_order`, `is_active` |
| `knowledge_pages` | Seiten | `space_id`, `parent_id`, `slug` (je Bereich eindeutig), `title`, `summary`, `blocks` (veröffentlicht), `draft_blocks` (Entwurf), `search_text`, `status` (`draft`/`published`/`archived`), `kind` (`page`/`start`/`aktion`), `valid_from`, `valid_until`, `branch_ids`, `show_banner`, `audiences`, `owner_user_id`, `review_at`, `review_interval_months`, `requires_acknowledgement`, `published_version_id`, `imported_from_url`, `import_log`, SoftDeletes |
| `knowledge_page_versions` | Veröffentlichungen | `page_id`, `version_no`, `blocks`, `change_summary`, `author_user_id`, `published_at` |
| `knowledge_audiences` | Zielgruppen | `key`, `name`, `color`, `rules` (JSON: `permissions_any`, `branch_ids`, `departments`, `user_ids`), `is_default` |
| `knowledge_media` | Uploads | `disk`, `path`, `url`, `mime`, `size`, `width`, `height`, `alt_text`, `ai_description` |

Rechte (Katalog, Migration, Gate): `view_knowledge` (alle Rollen mit `access_hub`), `edit_knowledge` und
`manage_knowledge` (Rollen mit `access_admin`). Startdaten (7 Bereiche, Zielgruppen Alle/Leitung/Büro)
legt die Migration `2026_10_18_210000_create_wissen_tables` an; MySQL bekommt einen FULLTEXT-Index auf
`title, summary, search_text`.

### Block-Format (`App\Services\Wissen\KnowledgeBlocks`)

```json
{ "schema_version": 1, "blocks": [
  { "id": "k3Fz9a", "type": "callout", "data": { "kind": "warning", "title": "Wichtig", "text": "…" }, "audiences": [] },
  { "id": "p8Qw1x", "type": "paragraph", "data": { "text": "Nur fürs Büro …" }, "audiences": ["buero"] }
] }
```

Typen: `paragraph`, `header` (Ebene 2–4), `list` (`unordered`/`ordered`/`checklist`), `callout`
(`info`/`warning`/`tip`/`danger`), `steps`, `image`, `gallery` (`grid`/`carousel`), `table`, `video`,
`file`, `hublink`, `delimiter`, `toggle`; `process` ist für Stufe 2 reserviert. `normalize()` bringt
Editor.js-Ausgabe, Import und Altbestand in diese Form und bereinigt Inline-HTML (nur `b i a code mark br u`,
Links ohne `javascript:`); `visibleFor()` filtert nach Zielgruppen; `plainText()` liefert den Suchtext mit
`## `-Markern für Chunk-Grenzen; `toEditor()` ist der Rückweg (Zielgruppe als Block-Tune `audience`).
Unbekannte Typen bleiben erhalten und rendern als Hinweis.

### Zielgruppen (`App\Services\Wissen\AudienceResolver`)

`keysFor(User)` wertet alle Zielgruppen je Anfrage einmal aus (Rechte per `can()`, Stamm-Institut oder
`allowed_branch_ids`, `department`, Personenliste) und liefert die Schlüssel inklusive der
Standard-Zielgruppe `alle`. `allows($required, $keys)` ist der einzige Vergleich: leere Anforderung oder
`alle` = sichtbar, sonst Schnittmenge. Die Seiten-Einschränkung gewinnt immer über Block-Freigaben
(`KnowledgePagePolicy::view`). Bereiche mit `audiences` erscheinen anderen weder im Baum noch in der Suche.

### Endpunkte (Web und App teilen sie)

| Route | Zweck |
|---|---|
| `GET /hub/wissen` | Startseite des Raums (Bereiche als Karten) |
| `GET /hub/wissen/{space}` · `/{space}/{page:slug}` | Bereich, Seite (Leseansicht; `?entwurf=1` zeigt der Redaktion den Entwurf) |
| `GET /hub/wissen/api/tree` | Baum je Nutzerin (`WissenService::treeFor`) |
| `GET /hub/wissen/api/seite/{id}` | Seite als JSON (gefilterte Blöcke, Überschriften) |
| `GET /hub/wissen/api/suche?q=` | Treffer mit Block-Anker (`anchor` → `#b-<id>`) |
| `POST /hub/wissen/seiten` · `PUT …/{id}` · `POST …/{id}/veroeffentlichen` · `POST /hub/wissen/medien` | Redaktion (`edit_knowledge`) |
| `GET /hub/wissen/redaktion` | Entwürfe, geänderte Seiten, fällige Prüfungen |

### Editor (`public/js/wissen-editor.js`)

Editor.js 2.30.7 von jsDelivr (Header, List, Table, Image, Marker, InlineCode, Delimiter) plus eigene
Werkzeuge `callout`, `steps`, `gallery`, `hublink`, `toggle`, `video`, `file` und die Block-Tune `audience`
(Sichtbarkeit je Block, Korallstreifen im Editor). Autosave nach 2,5 s Ruhe per `PUT`, `⌘S` sichert sofort,
Veröffentlichen fragt die Änderungszeile ab. Uploads gehen an `/hub/wissen/medien` (Disk
`config('wissen.media_disk')`, lokal `public`, in der Cloud `gcs`).

### Startseite, Aktionen, Historie, Neuigkeiten (18.10.2026)

- **Startseite** des Raums ist eine Block-Seite (`kind = start`, Bereich `system`, inaktiv, nie im Baum oder in
  der Suche). `WissenService::ensureStartPage()` legt sie beim ersten „Startseite bearbeiten“ an; die Startseite
  zeigt darunter automatisch laufende/geplante Aktionen und die Bereichskarten.
- **Aktion** = Seite mit `kind = aktion`, `valid_from`, `valid_until`, `branch_ids`, `show_banner`. Jede Seite
  darf eine Gültigkeit tragen. `isRunning()/isUpcoming()/isExpired()`, Scope `running()`. Abgelaufene Seiten
  bleiben lesbar (Hinweis im Kopf), stehen im Baum mit „vorbei“ und in der Suche nachrangig.
- **Historie** `/hub/wissen/historie` (`?art=alle` für alle befristeten Seiten): laufend/geplant oben,
  Abgelaufenes nach Jahr → Monat des Enddatums (`WissenService::historyFor`). Bereich `aktionen`.
- **Neuigkeiten** nutzen die Hub-Nachrichten (`news`): `wissen_display` (`banner`/`modal`), `starts_at`,
  `ends_at`, `audiences`, `requires_ack`, `push_enabled`; Schließen/Bestätigen je Person in
  `news_dismissals`. `WissenNoticeService::forUser()` liefert Banner und höchstens ein Modal (Pflicht-Modal
  zuerst) plus Banner laufender Aktionen; `POST /hub/wissen/hinweise/{news}/schliessen`. Anlegen auf der
  Redaktionsseite (`POST /hub/wissen/hinweise`) oder im Admin-Nachrichtenformular (Abschnitt „Wissens-Raum“).
  Push geht über den bestehenden Anlass `news.published` (`NewsObserver`), `push_enabled = false` unterdrückt ihn.
  Der Baum-Endpunkt `/api/tree` liefert `start`, `actions` und `notices` auch an die App.

### Suche und glatttBert

- Raum-Suche: MySQL `MATCH … AGAINST` (Boolean, Präfix) auf `title, summary, search_text` plus LIKE auf
  dem Titel; SQLite (Tests) per LIKE. Treffer nennen den ersten passenden Block, aber nie einen Block, den
  die Person nicht sehen darf. Titeltreffer zuerst.
- Globale Suche: Gruppe `wissen` in `GlobalSearchService::searchLocal` (Recht `view_knowledge`), Eintrag
  `hub.wissen.index` in `PAGES`.
- glatttBert: `WissenBertSync` schreibt beim Veröffentlichen einen `knowledge_articles`-Eintrag
  (`source_type = wissen`, `google_drive_id = wissen:<id>`, `audience_keys` aus Seite + Bereich) und
  indexiert ohne Embeddings; `EmbedKnowledgeArticleJob` holt die Vektoren nach. **Blöcke mit eigener
  Zielgruppe bleiben für Bert außen vor**, bis Chunks Zielgruppen tragen (Stufe 2).
  `KnowledgeSearchService::search()` bekommt die Zielgruppen der fragenden Person
  (`GlatttBertService::chat`) und lässt Artikel mit fremden `audience_keys` weg — das gilt künftig auch für
  Drive-Dokumente, sobald sie Zielgruppen tragen.

### Import aus Google Sites

Google Sites hat keinen strukturierten Export. Zwei Schritte:

1. `node scripts/wissen/crawl-google-sites.cjs --login` (einmal bei Google anmelden, Profil
   `~/.glattthub-sites-profile`), dann `… --out storage/app/wissen-import <Site-URLs>`: folgt der
   Navigation jeder Site, speichert je Seite HTML des Inhaltsbereichs und lädt die Bilder in `assets/`.
2. `php artisan wissen:import <ordner> --space=<key>` (oder `--mapping=mapping.json`, `--dry-run`):
   `SitesHtmlImporter` übersetzt Überschriften, Absätze, Listen, Bilder (ab drei in Folge eine Galerie),
   Tabellen, YouTube/Drive-Einbettungen und Knopf-Links; `SitesImportService` legt Entwürfe mit
   `imported_from_url` und `import_log` an, Unterseiten hängen über den Pfad an der Elternseite,
   **veröffentlichte Seiten werden nie überschrieben**. Danach sichtet die Redaktion bereichsweise.

### Fallstricke

- `@endif` direkt hinter einem Buchstaben (`…eingeschränkt@endif`) erkennt Blade nicht (`\B@`) — Leerzeichen davor.
- Laravel 12: Controller brauchen `AuthorizesRequests` für `$this->authorize()`.
- Die Hub-Seitenleiste merkt sich „eingeklappt“ in `localStorage`; der Raum hat eine eigene Hülle und ist davon unabhängig.
- Theme- und Toast-Script liegen seit 18.10.2026 in `layouts/partials/theme-bootstrap` und `toast-script` (geteilt von `hub` und `wissen`).

### Dateien

`app/Services/Wissen/*`, `app/Http/Controllers/Wissen/*`, `app/Models/Knowledge{Space,Page,PageVersion,Audience,Media}.php`,
`app/Policies/KnowledgePagePolicy.php`, `resources/views/layouts/wissen.blade.php`, `resources/views/wissen/*`,
`public/js/wissen.js`, `public/js/wissen-editor.js`, Abschnitt „WISSEN“ in `theme_glattt.css`,
Tests `tests/Feature/WissenTest.php`, `WissenImportTest.php`, `tests/Unit/KnowledgeBlocksTest.php`, `SitesHtmlImporterTest.php`.

## Changelog

- **18.10.2026** — Stufe 1 auf `feature/wissen`: Raum, Zielgruppen, Block-Editor, Suche, glatttBert-Quelle, Import-Werkzeuge; nachmittags Startseite als Block-Seite, Aktionen mit Gültigkeit und Historie, Neuigkeiten als Banner/Modal.
