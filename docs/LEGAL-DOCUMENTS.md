# Rechtsdokumente (zentrale Verwaltung)

## Für Endanwender

### Was ist das?

AGB und weitere Rechtsdokumente (z.B. Datenschutzerklärung, Widerrufsbelehrung) werden **an einer zentralen Stelle** gepflegt und per Drag & Drop in beliebige Formulare eingebunden. Ändert sich ein Dokument, zeigen **alle** Formulare automatisch die neue Fassung — nichts muss je Formular nachgepflegt werden.

### Dokumente verwalten (Admin-Backend)

Unter **Admin-Panel → Content → Rechtsdokumente** (Recht `manage_legal_documents`):

- **Anlegen**: Titel, Kennung (Slug) und Quelle wählen:
    - **Pflege im Hub**: Der Text wird direkt im Editor gepflegt (Überschriften, Absätze, Listen, Fettung).
    - **Website-Quelle**: Die Website ist maßgeblich (z.B. `https://glattt.com/agb`); der Hub gleicht täglich ab. Optional kann ein CSS-Selektor den Inhaltsbereich der Seite eingrenzen (für glattt.com/agb: `.wpb_text_column`).
- **Versionierung**: Jede Textänderung wird als **neue Version mit eigenem Gültig-ab-Datum** gespeichert. Alte Fassungen bleiben unverändert erhalten und sind in der Versionshistorie sichtbar. Maßgeblich ist immer die neueste Fassung, deren Gültig-ab-Datum nicht in der Zukunft liegt — eine Fassung kann also auch vordatiert werden.
- **Website-Abgleich**: Läuft täglich um 05:30. Wird eine inhaltliche Abweichung erkannt, erscheint eine Benachrichtigung; die Übernahme passiert **nie automatisch**. Im Dokument gibt es dann **„Änderung freigeben"** mit einer Gegenüberstellung alt/neu (entfernte Zeilen durchgestrichen, neue unterstrichen) — erst die Freigabe legt die neue Version an. Alternativ: **„Änderung verwerfen"**. Mit **„Jetzt abgleichen"** lässt sich der Abgleich manuell anstoßen.
- **Ausfall der Quelle**: Ist die Website nicht erreichbar, wird still übersprungen; erst nach 3 Fehlversuchen in Folge gibt es eine Benachrichtigung.

### Einbindung im Formular-Editor

In der Feld-Leiste (Kategorie **Erweitert**, Recht `use_advanced_form_fields`) gibt es die Card **„Zentral verwaltetes Dokument"**. Nach dem Einfügen rechts in den Feld-Einstellungen:

1. **Dokument** wählen (alle aktiven Rechtsdokumente)
2. **Darstellung** wählen:
    - Volltext im Formular, **einklappbar** (Standard)
    - Volltext im Formular, **dauerhaft ausgeklappt**
    - **Link** — Volltext öffnet sich im Modal
3. **Pflichtfeld**-Schalter: macht die Bestätigungs-Checkbox verpflichtend (ohne Haken kein Absenden — client- **und** serverseitig geprüft)
4. **„Aus PDF ausschließen"**: die bestehende PDF-Sichtbarkeitslogik greift auch hier

Die Bestätigungs-Checkbox erscheint in allen Darstellungsvarianten, mit Versionshinweis („Version 2, gültig ab 01.08.2026"). Der Text der Checkbox ist über das Feld **Beschreibung** anpassbar (Standard: „Ich habe … gelesen und stimme zu.").

### Nachweis

Bei jeder Einreichung wird festgehalten, **welche Version** zum Zeitpunkt der Bestätigung gültig war, inklusive Zeitstempel. Das ist wichtig, weil Kunden bei jedem Termin erneut zustimmen — ein Kunde kann über die Zeit mehreren Fassungen zugestimmt haben. Sichtbar ist der Nachweis:

- in der **Einreichungs-Ansicht** (Dokumente-Modal & Einreichungs-Seite): angehakte Checkbox + „Bestätigt am 07.08.2026 14:32 Uhr — Version 2 (gültig ab 01.08.2026)"
- im **PDF**: Volltext der bestätigten Fassung + Bestätigungsvermerk

## Für Entwickler

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

- Registry: `FormField::TYPE_LEGAL_DOCUMENT`, Kategorie `advanced`, `has_value = true`; Settings: `legal_document_id`, `display_mode` (`inline_collapsed` / `inline_expanded` / `modal`)
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
