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
| `knowledge_spaces` | Bereiche | `key`, `name`, `icon`, `audiences` (JSON, leer = alle), `sort_order`, `is_active`, `nav_mode` (`flat` = Bereichs-Reiter, `chapters` = eigenes Kapitel-Band; Büro und Leitung) |
| `knowledge_pages` | Seiten | `space_id`, `parent_id`, `slug` (je Bereich eindeutig), `title`, `summary`, `blocks` (veröffentlicht), `draft_blocks` (Entwurf), `search_text`, `status` (`draft`/`published`/`archived`), `kind` (`page`/`start`/`aktion`), `valid_from`, `valid_until`, `branch_ids`, `show_banner`, `audiences`, `owner_user_id`, `review_at`, `review_interval_months`, `requires_acknowledgement`, `published_version_id`, `imported_from_url`, `import_log`, SoftDeletes |
| `knowledge_page_versions` | Veröffentlichungen | `page_id`, `version_no`, `blocks`, `change_summary`, `author_user_id`, `published_at` |
| `knowledge_audiences` | Zielgruppen | `key`, `name`, `color`, `rules` (JSON: `permissions_any`, `branch_ids`, `departments`, `user_ids`), `is_default` |
| `knowledge_feedback` | Rückmeldungen | `page_id`, `user_id`, `kind` (`helpful`/`not_helpful`/`outdated`), `comment`, `resolved_at`, `resolved_by_user_id` |
| `knowledge_acknowledgements` | Lesebestätigungen | `page_id`, `user_id`, `version_id`, `acknowledged_at` (eindeutig je Seite und Person) |
| `knowledge_user_states` | Persönlicher Stand | `user_id`, `feed_seen_at` |
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

### Menüband: Reiter, Flyouts, Kapitel (`layouts/wissen.blade.php`, `wissen.js`)

**Seit 18.10.2026 (nachts) sind die Kapitel der Haupt-glatttipedia das Menüband** (Entscheidung Jan): genau ein
Bereich ist `knowledge_spaces.is_primary` (Institut-Alltag, läuft im Kapitel-Modus). Sein Band — „Start“, Kapitel,
„Weitere Seiten“, dann die Bereiche mit eigenem Band (Büro, Leitung) als Reiter mit Schloss und Flyout, dann die
Werkzeuge — steht überall, auch auf Start, Historie, Redaktion und in den übrigen (flachen) Bereichen; nur Büro und
Leitung zeigen ihr eigenes Band mit „← Start“. Die flachen Bereiche sind über die Startkarten erreichbar, ihre Seiten
stehen in der Seitenleiste. Ohne `is_primary` fällt das Layout auf Bereichs-Reiter zurück. Eine oberste Seite ohne
Unterseiten ist kein Kapitel, sondern steht unter „Weitere Seiten“ — „Home“ darf deshalb keine Unterseiten haben.
Die **Wahl der glatttipedia** sitzt seit 18.10.2026 neben dem Logo (`.wissen-switch`, Segment-Leiste „Institut ·
Büro 🔒 · Leitung 🔒“ aus Hauptbereich und Bereichen mit Kapitel-Band, nur sichtbare, Kurzname = Teil vor dem
Bindestrich, nur ab 1024 px). Alle Bänder sind damit gleich aufgebaut: „Start“ (Übersicht der gewählten glatttipedia,
beim Hauptbereich `/hub/wissen`), Kapitel, „Weitere Seiten“, Werkzeuge.

**Startseite je Bereich:** die Seite mit `kind = start` („Home“) ist der Reiter „Start“ des Bereichs. `treeFor()` lässt sie
aus Liste, Band und Flyouts heraus; die Bereichsübersicht (`WissenController::space`) zeigt ihren Inhalt oben und die
Seitenliste darunter („Alle Seiten“), `/hub/wissen` die Startseite des Hauptbereichs (`startPage()`). Veröffentlichte
Inhalte sehen alle, Entwürfe nur die Redaktion mit Markierung. Anlegen über „Startseite anlegen“
(`/hub/wissen/startseite/bearbeiten?space=<key>` → `ensureStartPage()`), per Vorlage über `start: true` in `wissen:struktur`.

Die **Startseite** des Raums folgt demselben Aufbau wie das Band: eine Karte je Kapitel des Hauptbereichs (mit Unterseiten), dann „Weitere
Seiten“, dann Büro und Leitung; flache Bereiche mit Inhalt stehen als Zeile „Weitere Bereiche“ unter dem Raster.

Die zweite Kopfzeile zeigt also Kapitel (bzw. ohne Hauptbereich die Bereiche) als Reiter; **Hover oder Tastaturfokus** auf einem Reiter öffnet ein
Flyout (`.wissen-tab-wrap` + `.wissen-flyout`, rein CSS über `:hover`/`:focus-within`, ab acht Seiten zwei
Spalten à sieben, danach „alle N Seiten“). Bereiche mit `nav_mode = chapters` (Büro, Leitung) bekommen statt
der Bereichs-Reiter ein **eigenes Kapitel-Band**: Zurück-Pfeil „Alle Bereiche“, Bereichsname, Trenner, je
Kapitel (= oberste Seite mit Unterseiten) ein Reiter mit Flyout, dahinter „Weitere Seiten“ (oberste Seiten
ohne Unterseiten, breites Flyout mit drei Spalten). Die Seitenleiste zeigt dann nur das aktive Kapitel
(`WissenService::pathTo`).

Reiter, die nicht in die Zeile passen, versteckt `fitTabs()` in `wissen.js` von hinten und legt sie als Links
in das Menü „Weitere Seiten“ bzw. „Weitere Bereiche“ (Priorität+, bei jeder Breitenänderung neu, Trennlinie
zwischen verschobenen Reitern und den eigentlichen Einträgen). Gemessen wird die rechte Kante des letzten
Werkzeugs, **nicht** `scrollWidth` — der zählt die absolut positionierten Flyouts mit. Versteckt werden zuerst Kapitel
(von hinten), die Bereichs-Reiter Büro/Leitung zuletzt; davor werden die Werkzeuge rechts zu Symbolen (`is-compact`). `.wissen-tabs-inner`
hat deshalb `overflow-x: clip` (nicht `auto`: das würde auch senkrecht beschneiden, und die Flyouts wären
unsichtbar). Unter 1024 px gibt es keine Reiter, dort übernimmt die mobile Bereichsliste in der Seitenleiste.

### Struktur und Reihenfolge (Kapitel, Unterseiten)

Die Reihenfolge der Seiten und ihre Verschachtelung (`parent_id`, `sort_order`) bestimmen Seitenleiste, Flyouts und
Kapitel-Band. Gesetzt wird sie an zwei Stellen:

- **Redaktion → „Struktur und Reihenfolge“** (`wissenStruktur` in `wissen.js`): Baum je Bereich aus `/hub/wissen/api/tree`,
  Ziehen am Griff (SortableJS, Ablegen in eine Seite macht sie zur Unterseite) oder die Pfeile hoch, runter, einrücken,
  ausrücken; „Struktur speichern“ schickt `[{id, children: […]}]` als `PUT /hub/wissen/struktur/{space}` an
  `WissenEditorController::saveStructure` → `WissenService::applyStructure()`. Zehnerschritte in `sort_order`, nicht
  genannte Seiten des Bereichs rücken auf 900 (hinter alles Genannte), fremde IDs werden übergangen. Der Endpunkt liest
  den Baum mit `$request->input('tree')`, weil `validated()` bei `tree.*.id` die verschachtelten `children` verwirft.
- **Befehl `php artisan wissen:struktur <datei.json> [--apply]`** für größere Umbauten nach Vorlage (Trockenlauf ohne
  `--apply`). Datei: `{"space": "...", "pages": [{"id"|"path", "title"?, "neu"?, "children"?}]}` — `path` ist das Ende der
  importierten Sites-Adresse, `neu: true` legt fehlende Seiten **veröffentlicht und ohne Inhalt** an (ein Entwurf als
  Kapitel würde seine Unterseiten für Leser aus dem Baum nehmen), `title` benennt um und zieht den Slug nach. Der Lauf
  listet alle Seiten, die nicht genannt sind. Vorlage für Büro: `database/wissen/struktur/buero-prozesse.json`
  (nennt lokale IDs — nicht gegen Staging/Prod fahren; die Struktur reist mit dem Export der Seiten).

Kapitelseiten ohne eigenen Inhalt zeigen „Seiten in diesem Kapitel“ (`children` aus `WissenController::show`, für Leser
nur veröffentlichte, Zielgruppen gefiltert).

### Editor (`public/js/wissen-editor.js`)

Editor.js 2.30.7 von jsDelivr (Header, List, Checklist, Quote, Code, Embed für YouTube/Vimeo, Table, Image,
Marker, InlineCode, Underline, Delimiter) plus eigene Werkzeuge `callout`, `steps`, `gallery`, `hublink`,
`toggle`, `video`, `file` und die Block-Tune `audience` (Sichtbarkeit je Block, Korallstreifen im Editor).
Rückgängig/Wiederholen über `editorjs-undo`, Ziehen der Blöcke über `editorjs-drag-drop`. Über dem Schreibbereich
klebt die Aktionsleiste `.wissen-editor-bar` (Zurück, Pfad, Speicherstand, Rückgängig/Wiederholen, Seitenpanel
ein/aus — Zustand in `localStorage` `wissen.editor.side`, Vorschau, Sichern, Veröffentlichen); unter dem Titel
stehen Wortzahl, Blöcke und Lesezeit (`updateStats`). Autosave nach 2,5 s Ruhe per `PUT`, `⌘S` sichert sofort,
Veröffentlichen fragt die Änderungszeile ab. Die Felder des Seitenpanels halten ihren Abstand über `gap` an
`.wissen-editor-box` — die Nachbar-Regel `.form-glattt-group + .form-glattt-group` greift über die
`x-if`-Wrapper hinweg nicht; die Datumszeile ist eine `.form-glattt-row` (bringt `display: grid` mit), keine
`.form-glattt-group`. Uploads gehen an `/hub/wissen/medien` (Disk
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

### Stufe 2: Prozesse, Versionen, Pflege (19.10.2026)

- **Prozess-Block** (`type: process`): Schritte mit Wer, Was, Details, Womit und optionaler Entscheidung (Frage, Ja →, Nein →).
  `ProcessDiagram::layout()` legt Bahnen (eine je „Wer“) und Spalten (eine je Schritt) fest, das Partial
  `wissen/partials/process.blade.php` zeichnet daraus ein SVG (Knoten als `foreignObject`, damit Text umbricht) und
  bietet die Checkliste zum Abhaken (nur lokal). `KnowledgeBlocks::blockText()` liefert den Prozess als Text für Suche
  und glatttBert.
- **BPMN-Block** (`type: bpmn`, Entscheidung Jan 19.10.2026): echte BPMN-2.0-Diagramme mit **bpmn-js 18.31**
  (bpmn.io/Camunda, MIT; das „powered by bpmn.io“-Logo ist Lizenzbedingung). Der Modeler läuft als Vollbild-Overlay
  (`BpmnStudio` in `wissen-editor.js`, deutsche Palette über das `translate`-Modul) und speichert XML plus
  exportiertes SVG im Block. XML und SVG gehen **base64-kodiert** durch `editor.save()`, weil der Editor.js-Sanitizer
  sonst alle Tags entfernt; `KnowledgeBlocks::maybeBase64()` dekodiert, `sanitizeSvg()` entfernt Skripte,
  Ereignis-Attribute, `javascript:`-Links und `foreignObject`. `BpmnText::describe()` liest Pools, Bahnen, Aufgaben,
  Gateways mit ihren Ausgängen und Sequenzflüsse (SimpleXML, Attribute über `->attributes()`) und liefert den
  Prozesstext in Lesereihenfolge für Suche, glatttBert und die Textfassung („Als Text“) der Leseansicht.
  `BpmnBuilder::fromSteps()` erzeugt aus dem Schritte-Block ein BPMN mit Layout (BPMNDI): Pool, eine Bahn je „Wer“,
  Aufgaben, exklusives Gateway je Entscheidung (Ja → nächster Schritt, Nein → Endereignis unter dem Gateway);
  `POST /hub/wissen/api/bpmn/aus-schritten`, im Schritte-Block „→ Als BPMN-Diagramm“. Leseansicht: SVG mit Zoom,
  Vollbild und Anpassung an die Breite; die App zeigt dasselbe SVG als Bild.
- **Versionsvergleich** `/hub/wissen/bearbeiten/{page}/versionen?von=&bis=` (`entwurf` = aktueller Stand):
  `WissenDiff::compare()` vergleicht blockweise per LCS über den Blocktext, macht aus einem Lauf „entfernt“ plus
  „hinzugefügt“ paarweise „geändert“ mit Wort-Diff. „Version n als Entwurf übernehmen“ (`POST …/versionen/{v}/uebernehmen`)
  ersetzt nur den Entwurf.
- **Rückmeldungen** (`knowledge_feedback`): „War diese Seite hilfreich?“ ist eine Stimme je Person (Wechsel ersetzt),
  „Veraltet melden“ legt eine Meldung mit Kommentar an und löst den Anlass `knowledge.outdated_reported` an die
  verantwortliche Person aus. Redaktion: Karte „Rückmeldungen“ mit Erledigt, Bewertungen der letzten 90 Tage.
- **Prüfdatum**: `wissen:pruefungen` (täglich 07:30, Scheduler-Job `wissen-pruefungen`) mahnt überfällige Seiten über
  `knowledge.review_due`, höchstens alle 7 Tage (`review_reminded_at`). „Geprüft — gilt weiter“ (Redaktion und Editor)
  verschiebt `review_at` um das Intervall.
- **Bereich wechseln**: Dropdown „Bereich“ im Editor; `space_id` im Autosave macht die Seite zur obersten Seite des
  neuen Bereichs mit dort eindeutigem Slug, danach lädt der Editor neu.

### Stufe 3: Feed, Pflichtseiten, Kiosk, Drive (19.10.2026)

- **Was ist neu** `/hub/wissen/neu`: alle Veröffentlichungen (Versionen) nach Tagen, sichtbar nach Zielgruppe; der Besuch
  setzt `knowledge_user_states.feed_seen_at`, die Seitenleiste zählt Neues seit dem letzten Besuch.
- **Pflichtseiten** (`requires_acknowledgement`): Box „Pflichtseite“ auf der Seite mit „Gelesen und verstanden“
  (`POST /api/seite/{page}/bestaetigen`, `knowledge_acknowledgements` je Version — eine neue Version macht die
  Bestätigung erneut fällig), Liste `/hub/wissen/pflicht`, Redaktionsübersicht `/hub/wissen/pflicht/{page}` (bestätigt,
  ältere Version, fehlt — Grundgesamtheit: aktive Personen mit `view_knowledge`, die die Seite sehen dürfen). Beim
  Veröffentlichen einer Pflichtseite geht der Anlass `knowledge.required_published` an alle mit `view_knowledge`.
- **Kiosk** `/shared/wissen/{token}`: derselbe Code, dieselben Views — die Middleware `wissen.kiosk` prüft den Token der
  Institutsseite, meldet das Service-Konto `institutsseite@system.glattt.com` nur für diese Anfrage an
  (`Auth::onceUsingId`) und bindet den Token; `App\Support\WissenUrl::route()` erzeugt dann Kiosk-Adressen. **Alle
  Lese-Links laufen über `WissenUrl::route('…')`, nie direkt über `route('hub.wissen.…')`.** Die Hülle blendet im Kiosk
  Banner, Rückmeldungen, Bestätigung, Bert, Abmelde-Logik aus; „Institutsseite“ führt zurück. Das Service-Konto hat per
  Migration nur `view_knowledge` (Zielgruppe „Alle“). Einstieg: Knopf „glatttipedia“ auf der Institutsseite.
- **Drive-Dokumente** `/hub/wissen/drive` (`WissenDriveService`): die für glatttBert indexierten Drive-Artikel (Docs,
  PDF, Word, Tabellen, Präsentationen; keine Bilder/Videos) mit Stand „übernommen“ (Seite mit gleicher
  `imported_from_url`); „Als Seite übernehmen“ legt einen Entwurf an: Link zum Original als erster Block, Text als
  Absätze, kurze GROSSBUCHSTABEN-Zeilen als Zwischenüberschriften.

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
- Ein Element mit `grid-column: 1 / -1` in einem Raster mit `grid-auto-flow: column` landet **oben links**: Elemente mit fester Spalte werden vor dem Autoflow platziert. Der „alle N Seiten“-Link des Flyouts hat deshalb zusätzlich `grid-row: 8`.
- Playwright-Prüfung der Reiter braucht einen Viewport ab 1024 px; Screenshots als JPEG (`deviceScaleFactor` 0,75 bei 1280 px hält sie unter 1000 px).

### Dateien

`app/Services/Wissen/*`, `app/Http/Controllers/Wissen/*`, `app/Models/Knowledge{Space,Page,PageVersion,Audience,Media}.php`,
`app/Policies/KnowledgePagePolicy.php`, `resources/views/layouts/wissen.blade.php`, `resources/views/wissen/*`,
`public/js/wissen.js`, `public/js/wissen-editor.js`, Abschnitt „WISSEN“ in `theme_glattt.css`,
Tests `tests/Feature/WissenTest.php`, `WissenImportTest.php`, `tests/Unit/KnowledgeBlocksTest.php`, `SitesHtmlImporterTest.php`.

## Changelog

- **19.10.2026** — Stufe 2 (Prozess-Block mit Bahnen-Diagramm, echte BPMN-Diagramme mit bpmn-js, Versionsvergleich, Rückmeldungen, Prüf-Erinnerung, Bereich wechseln) und Stufe 3 (Was ist neu, Pflichtseiten, Kiosk für die Institut-iPads, Drive-Dokumente); Katalog-Modul „Wissen“ mit drei Anlässen.
- **18.10.2026 (nachts, 3)** — Home je Bereich ist die Startseite (`kind = start`, nicht in der Liste); Auswahl der glatttipedia neben dem Logo; großes Suchfeld sucht an Ort und Stelle; Leitung nach der alten Site gegliedert; `wissen:struktur` idempotent (`neu` über Titel, `start: true`).
- **18.10.2026 (nachts, 2)** — Kapitel der Haupt-glatttipedia als Menüband (`is_primary`), Büro/Leitung rechts mit Schloss; Institut-Alltag nach der alten Site gegliedert; Startkarten zeigen Kapitel mit Unterseiten.
- **18.10.2026 (nachts)** — Struktur-Editor in der Redaktion (Ziehen und Pfeile), Befehl `wissen:struktur`, Büro-Prozesse nach der Navigation der alten Google Site gegliedert (10 Kapitel), Kapitelseiten listen Unterseiten, Werkzeug-Reiter werden bei Platznot zu Symbolen.
- **18.10.2026 (spät)** — Flyouts unter den Reitern, Kapitel-Band für Büro und Leitung (`nav_mode`), Priorität+-Menü „Weitere …“, Editor mit fester Aktionsleiste, Rückgängig, Ziehen, Wortzahl, Blöcke Checkliste/Zitat/Code/Einbettung; Importer setzt Eltern und Titel aus dem Sites-Pfad.
- **18.10.2026** — Stufe 1 auf `feature/wissen`: Raum, Zielgruppen, Block-Editor, Suche, glatttBert-Quelle, Import-Werkzeuge; nachmittags Startseite als Block-Seite, Aktionen mit Gültigkeit und Historie, Neuigkeiten als Banner/Modal.
