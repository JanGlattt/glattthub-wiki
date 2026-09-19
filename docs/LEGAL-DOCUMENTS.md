# Rechtsdokumente (zentrale Verwaltung)

AGB, Datenschutzerklärung, Widerrufsbelehrung und weitere Rechtstexte werden **an einer
zentralen Stelle** versioniert gepflegt und über den Feldtyp `legal_document` in beliebige
Formulare eingebunden. Diese Seite beschreibt **Datenmodell, Versions-Auflösung,
Website-Abgleich, Feldtyp, Nachweis-Snapshot und Betriebsvoraussetzungen**; die Bedienung
Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Admin 2 und Betrieb 3 im Nutzerhandbuch"
    [Admin 2 – Inhalte und Dokumente](https://hilfe.hub.glattt.com/admin/2/) — Rechtsdokumente
    im Admin-Panel anlegen, pflegen und freigeben ·
    [Betrieb 3 – Formulare erstellen](https://hilfe.hub.glattt.com/betrieb/3/) — das Dokument
    als Feld in ein Formular einbauen.

    Angrenzend: [Betrieb 4 – Formulare teilen & Einreichungen](https://hilfe.hub.glattt.com/betrieb/4/)
    (Nachweis in der Einreichung).

## Für Anwender — Überblick

**Was das Modul leistet.** Ein Rechtsdokument wird **einmal** gepflegt und von allen Formularen
gemeinsam genutzt: Ändert sich der Text, zeigen alle Formulare automatisch die neue Fassung —
nichts muss je Formular nachgepflegt werden. Als Quelle dient entweder der Editor im Hub
(„Pflege im Hub") oder die Website („Website-Quelle", z.B. `https://glattt.com/agb`), die der
Hub täglich abgleicht.

**Grundsätze, die überall gelten:**

- **Jede Textänderung ist eine neue Version mit Gültig-ab-Datum.** Alte Fassungen bleiben
  unverändert erhalten; maßgeblich ist die neueste Fassung, deren Gültig-ab-Datum nicht in der
  Zukunft liegt. Eine Fassung lässt sich damit auch vordatieren.
- **Die Website wird nie automatisch übernommen.** Erkennt der nächtliche Abgleich eine
  Abweichung, gibt es eine Benachrichtigung und eine Gegenüberstellung alt/neu — erst die
  ausdrückliche Freigabe legt die neue Version an, alternativ wird die Änderung verworfen.
- **Der Nachweis hängt an der Einreichung, nicht am Dokument.** Festgehalten wird, welche
  Version zum Zeitpunkt der Bestätigung galt, mit Zeitstempel — wichtig, weil Kundinnen bei
  jedem Termin erneut zustimmen und über die Zeit mehreren Fassungen zugestimmt haben können.
- **Vier Darstellungsarten im Formular**, von „einklappbar im Formular" bis
  „Bestätigung beim Absenden im Modal" (Lesen bis zum Ende erzwungen).

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Rechtsdokument anlegen, Text pflegen, Website-Änderung freigeben oder verwerfen | Admin 2 |
| Dokument als Feld in ein Formular einbauen, Darstellung und Pflichtfeld wählen | Betrieb 3 |
| Bestätigung in der Einreichung bzw. im PDF nachlesen | Betrieb 4 |

## Für Entwickler

### Fachregeln

**Verwaltung** unter *Admin-Panel → Content → Rechtsdokumente*, Recht `manage_legal_documents`.
Je Dokument: Titel, Kennung (Slug) und Quelle.

- **Quelle `manual` („Pflege im Hub")**: Text direkt im Editor (Überschriften, Absätze, Listen,
  Fettung).
- **Quelle `website`**: Die Website ist maßgeblich; optional grenzt ein CSS-Selektor den
  Inhaltsbereich ein (für `glattt.com/agb`: `.wpb_text_column`).
- **Versionierung**: Jede Textänderung → neue Version mit eigenem Gültig-ab-Datum; alte
  Fassungen bleiben erhalten und sind in der Versionshistorie sichtbar. Maßgeblich ist die
  neueste Fassung mit `valid_from <= Stichtag` (Vordatierung möglich).
- **Website-Abgleich**: täglich 05:30. Abweichung → Benachrichtigung; Übernahme **nie
  automatisch**. Im Dokument steht dann **„Änderung freigeben"** mit Gegenüberstellung alt/neu
  (entfernte Zeilen durchgestrichen, neue unterstrichen) — erst die Freigabe legt die neue
  Version an; alternativ **„Änderung verwerfen"**. **„Jetzt abgleichen"** stößt den Abgleich
  manuell an.
- **Ausfall der Quelle**: Ist die Website nicht erreichbar, wird still übersprungen; erst nach
  **3 Fehlversuchen in Folge** gibt es eine Benachrichtigung.

**Einbindung im Formular-Editor.** Feld-Leiste, Kategorie **Erweitert** (Recht
`use_advanced_form_fields`), Card **„Zentral verwaltetes Dokument"**. In den Feld-Einstellungen:

1. **Dokument** wählen (alle aktiven Rechtsdokumente) — im Formular erscheint immer der
   **Titel des Dokuments** als Überschrift, nicht das Feld-Label
2. **Darstellung** (`display_mode`):
    - Volltext im Formular, **einklappbar** (Standard, Scrollbox) — `inline_collapsed`
    - Volltext im Formular, **ausgeklappt** (Scrollbox) — `inline_expanded`
    - Volltext im Formular, **komplett ohne Scrollen** — `inline_full`
    - **Bestätigung beim Absenden im Modal** — `modal`: Das Feld ist im Formular unsichtbar.
      Beim Klick auf „Formular absenden" öffnet sich das Dokument in einem großen Modal — erst
      wenn bis zum Ende gescrollt wurde, lässt sich die Bestätigungs-Checkbox anhaken, dann
      „Bestätigen & absenden". Mehrere Modal-Dokumente werden **nacheinander in
      Feld-Reihenfolge** angezeigt; Abbrechen stoppt das Absenden.
3. **Pflichtfeld**-Schalter: macht die Bestätigungs-Checkbox verpflichtend (ohne Haken kein
   Absenden — client- **und** serverseitig geprüft)
4. **„Aus PDF ausschließen"**: die bestehende PDF-Sichtbarkeitslogik greift auch hier

Bei den Inline-Varianten sitzt die Bestätigungs-Checkbox als hervorgehobene Zeile unter dem
Dokument, mit Versionshinweis („Version 2, gültig ab 01.08.2026") und Pflicht-Sternchen direkt
am Text. Der Text der Checkbox ist über das Feld **Beschreibung** anpassbar (Standard:
„Ich habe … gelesen und stimme zu.").

**Nachweis.** Bei jeder Einreichung wird festgehalten, **welche Version** zum Zeitpunkt der
Bestätigung gültig war, inklusive Zeitstempel. Sichtbar ist der Nachweis:

- in der **Einreichungs-Ansicht** (Dokumente-Modal & Einreichungs-Seite): angehakte Checkbox +
  „Bestätigt am 07.08.2026 14:32 Uhr — Version 2 (gültig ab 01.08.2026)"
- im **PDF**: Volltext der bestätigten Fassung + Bestätigungsvermerk

### Datenmodell

| Tabelle | Zweck |
|---|---|
| `legal_documents` | Stammsatz: `title`, `slug`, `source_type` (`manual`/`website`), `source_url`, `source_selector`, `is_active`, Sync-Status (`last_checked_at`, `failed_check_count`) und wartender Import (`pending_content`, `pending_hash`, `pending_detected_at`) |
| `legal_document_versions` | Eine Zeile je Fassung: `version`, `content` (HTML), `valid_from`, `source` (`manual`/`import`), `created_by`. Unique `(legal_document_id, version)` |

Versions-Auflösung nach dem `valid_from`-Muster (wie `HrSalary`/Preislisten): `LegalDocument::versionOn($date)` / `currentVersion()` — neueste Fassung mit `valid_from <= Stichtag`.

### Website-Abgleich

`app/Services/LegalDocumentSyncService.php`:

- `syncAll()` prüft alle aktiven Dokumente mit Website-Quelle; Command `legal-documents:sync`, Scheduler-Eintrag + Cron-Endpoint `POST /api/cron/sync-legal-documents` (Cloud-Scheduler-Job erforderlich, siehe unten!)
- Verglichen wird der **bereinigte Text** (Blockelemente → Zeilen, Whitespace normalisiert, SHA-256-Hash), nie das Roh-HTML — Layout-/Banner-Änderungen lösen keinen Fehlalarm aus
- Inhalts-Container per Selektor (`#id`, `.klasse`, `tag`), sonst Heuristik `main → article → body`; HTML wird auf erlaubte Tags reduziert (dependency-freier DOM-Sanitizer)
- Abweichung → `pending_*`-Spalten + Benachrichtigung (`NotificationService`, `forPermission('manage_legal_documents')`); leere/zu kurze Extraktion (< 100 Zeichen) gilt als Fehler, nie als neue Fassung
- Diff für die Freigabe-Vorschau: `sebastian/diff` (Unified Diff über den bereinigten Text)

### Formular-Feldtyp `legal_document`

- Registry: `FormField::TYPE_LEGAL_DOCUMENT`, Kategorie `advanced`, `has_value = true`; Settings: `legal_document_id`, `display_mode` (`inline_collapsed` / `inline_expanded` / `inline_full` / `modal`)
- **Modal-Modus**: `startLegalModalFlow()` in `form-fill.js`/`shared-form-fill.js` fängt `submitForm()` ab und arbeitet eine Warteschlange der unbestätigten Modal-Felder in Feld-Reihenfolge ab (Scroll-Gate über `initLegalModalScroll()`/`onLegalModalScroll()`, Messung nach dem Öffnen per `requestAnimationFrame`); der leere Feld-Wrapper wird über `isFieldVisibleInLayout()` ausgeblendet, damit im Feld-Raster keine Lücke entsteht
- **Auslieferung an alle Ausfüll-Ansichten** über das automatisch angehängte Attribut `FormField::getLegalDocumentAttribute()` (`$appends`) — liefert `{id, title, version, valid_from, content}` der aktuell gültigen Fassung; kein eigener Endpoint je View nötig
- Dokumentliste für die Editor-Auswahl: `GET /api/forms/legal-documents` (`FormController::getLegalDocuments()`)
- **Serverseitige Pflicht-Prüfung**: Closure-Regel in `FormField::getValidationRules()` — ein bloßes `required` würde den String `"false"` durchlassen. Greift in `FormController::submit()` **und** `SharedFormController::submit()`
- **Nachweis-Snapshot**: Beim Submit schreibt `FormField::buildLegalDocumentSnapshot()` nach `form_submission_values.value_json`: `{accepted, accepted_at, document_id, document_title, version_id, version, valid_from}`. Die Version wird **serverseitig** zum Einreichungszeitpunkt aufgelöst, nie vom Client übernommen
- PDF: eigener Case in `pdf.blade.php` (Volltext der Fassung aus `version_id` + Bestätigungsvermerk); `PDF_RENDERER_VERSION` wurde auf 5 erhöht
- Readonly-Ansicht: Block in `_field-readonly.blade.php`, `display_value` in `buildSubmissionDetailPayload()`

### Beteiligte Dateien

| Datei | Verantwortung |
|---|---|
| `app/Models/LegalDocument.php`, `LegalDocumentVersion.php` | Versions-Auflösung, Freigabe/Verwerfen des wartenden Imports |
| `app/Services/LegalDocumentSyncService.php` | Fetch, Extraktion, Änderungserkennung, Diff, Benachrichtigungen |
| `app/Console/Commands/SyncLegalDocuments.php` | Command `legal-documents:sync` |
| `app/Filament/Resources/LegalDocuments/` | Admin-Backend (Form, Tabelle, Freigabe-Flow mit Diff-Vorschau) |
| `app/Models/FormField.php` | Feldtyp-Registry, `legal_document`-Accessor, Validierung, Snapshot |
| `resources/views/partials/form-fields/_field-renderer.blade.php` | Ausfüll-Darstellung (inline/Modal + Checkbox) |
| `public/js/components/form-fill.js`, `shared-form-fill.js` | Wert-Init, Pflicht-Validierung, Datumsformat |
| `public/js/components/form-editor.js`, `resources/views/hub/forms/editor.blade.php` | Card, Preview, Feld-Einstellungen |
| `resources/views/hub/forms/pdf.blade.php` | PDF-Volltext + Bestätigungsvermerk |
| `tests/Unit/LegalDocumentTest.php`, `tests/Feature/LegalDocumentFieldTest.php` | Versions-Auflösung, Sync, Pflicht-Prüfung, Snapshot |

### Betrieb

> **Wichtig:** Auf Cloud Run läuft kein `schedule:run` — der tägliche Abgleich braucht einen **Cloud-Scheduler-Job** auf `POST /api/cron/sync-legal-documents` (Header `X-Cron-Token`, 05:30, `--max-retry-attempts=3`). Ohne Job läuft der Abgleich nie (`CronScheduleCoverageTest` sichert nur die Endpoint-Zuordnung ab). Siehe [CLOUD-SCHEDULER-SETUP.md](CLOUD-SCHEDULER-SETUP.md).

Das Recht `manage_legal_documents` wird per Migration angelegt und an alle Rollen mit `manage_news` vergeben (Referenzrecht-Muster).

## Verwandte Dokumentation

- [Formular-Editor](FORM-EDITOR.md)
- [Formulare extern teilen](SHARED-FORM-SYSTEM.md)
- [PDF-Erstellung](PDF-ERSTELLUNG.md)
- [Cloud Scheduler Setup](CLOUD-SCHEDULER-SETUP.md)
