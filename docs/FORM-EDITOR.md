# Form Editor Modul

## Übersicht

Das Form Editor Modul ermöglicht das Erstellen, Bearbeiten und Verwalten von dynamischen Formularen im GLATTT Hub. Es bietet einen visuellen Drag & Drop Editor sowie die Möglichkeit, ausgefüllte Formulare als PDF zu exportieren.

## Features

### 🎨 Drag & Drop Editor
- Visueller Formular-Builder mit 3-Spalten-Layout
- Linke Sidebar: Verfügbare Feld-Elemente
- Mitte: Formular-Canvas zum Zusammenstellen
- Rechts: Einstellungen für das ausgewählte Feld

### 📋 Unterstützte Feldtypen

| Typ | Beschreibung | Kategorie |
|-----|--------------|-----------|
| `heading` | Überschriften (H2, H3) | Layout |
| `paragraph` | Beschreibungstext | Layout |
| `divider` | Horizontale Trennlinie | Layout |
| `text` | Einzeiliges Textfeld | Eingabe |
| `textarea` | Mehrzeiliges Textfeld | Eingabe |
| `number` | Zahlenfeld | Eingabe |
| `email` | E-Mail-Feld mit Validierung | Eingabe |
| `date` | Datumsauswahl | Eingabe |
| `address_lookup` | Adress-Suche mit Validierung (Nominatim/OSM) | Eingabe |
| `radio` | Single-Choice (Radio Buttons) | Auswahl |
| `checkbox` | Multi-Choice (Checkboxen) | Auswahl |
| `dropdown` | Dropdown-Auswahl | Auswahl |
| `toggle` | Ja/Nein Schalter | Auswahl |
| `file_upload` | Datei-Upload | Spezial |
| `body_zones` | Körperzonen-Auswahl (Partial) | Spezial |
| `signature` | Unterschriftenfeld (Touch/Maus) | Spezial |
| `contract_price` | Vertragspreis (readonly) | Spezial |

> **Mehrere contract_price-Felder:** Ein Formular kann mehrere `contract_price`-Felder mit unterschiedlichen `display_mode` (`rates_only`, `total_only`) und `show_condition` haben (z.B. eins für Ratenzahlung, eins für Gesamtpreis). Der Preiswert wird automatisch in **alle** contract_price-Felder geschrieben, damit das jeweils sichtbare Feld den korrekten Wert an den Server übermittelt.
| `sepa_iban` | SEPA IBAN mit BIC-Autofill | SEPA |
| `sepa_bic` | SEPA BIC (auto-ausgefüllt) | SEPA |
| `sepa_account_holder` | SEPA Kontoinhaber | SEPA |

### 💾 Auto-Save
- Automatisches Speichern nach 2 Sekunden Inaktivität
- Manuelles Speichern jederzeit möglich

### 📄 PDF-Export
- Ausgefüllte Formulare als PDF exportieren
- Automatische PDF-Generierung nach Formular-Einreichung
- Download direkt im Erfolgs-Modal
- Professionelles Layout mit glattt Logo und Firmenbranding
- Fußzeile mit vollständigen Firmendaten (Labrado & Schlüter GmbH)
- Dosis-Schriftart für konsistentes Branding
- Alle Feldtypen werden korrekt dargestellt:
  - Unterschriften als eingebettete Bilder
  - Körperzonen mit benutzerfreundlichen Namen
  - Toggle-Switches mit korrektem Ja/Nein-Status
  - Markdown-Formatierung (**fett**, __unterstrichen__)

## UI/UX Features

### 🎯 Floating Labels
- Alle Eingabefelder nutzen das GLATTT Floating Label Design
- Labels schweben nach oben beim Fokus oder wenn Wert vorhanden
- Konsistent in Editor und Ausfüll-Ansicht

### 📌 Sticky Sidebars
- Editor-Sidebars scrollen mit der Seite
- Optimale Erreichbarkeit bei langen Formularen
- Positionierung unter dem Header-Bar

### ✅ Feld-Auswahl mit visueller Markierung
- Ausgewählte Felder werden mit grüner Indikator-Leiste hervorgehoben
- Klarer visueller Feedback beim Bearbeiten

## Datenbank-Struktur

### Tabellen

#### `forms`
```sql
- id (bigint, PK)
- name (string) - Name des Formulars
- slug (string, unique) - URL-freundlicher Identifier
- description (text, nullable) - Beschreibung
- settings (json) - Zusätzliche Einstellungen
- is_published (boolean) - Veröffentlichungsstatus
- is_active (boolean) - Aktiv/Inaktiv
- created_at, updated_at, deleted_at
```

#### `form_fields`
```sql
- id (bigint, PK)
- form_id (FK -> forms)
- type (string) - Feldtyp (text, checkbox, etc.)
- field_name (string) - Eindeutiger Feldname
- label (string) - Anzeigelabel
- description (text, nullable) - Hilftext
- placeholder (string, nullable)
- default_value (text, nullable)
- options (json, nullable) - Optionen für radio/checkbox/dropdown
- validation (json, nullable) - Validierungsregeln
- settings (json) - Feld-spezifische Einstellungen
- prefill_key (string, nullable) - Platzhalter-Key für automatische Vorausfüllung
- is_required (boolean)
- is_readonly (boolean) - Feld ist schreibgeschützt (z.B. für vorausgefüllte Werte)
- sort_order (integer)
- width (string) - full, half, third
- created_at, updated_at
```

#### `form_submissions`
```sql
- id (bigint, PK)
- form_id (FK -> forms)
- user_id (FK -> users, nullable)
- client_id (string, nullable) - Phorest Client ID
- client_name (string, nullable)
- appointment_id (string, nullable) - Phorest Appointment ID
- status (string) - draft, submitted, reviewed
- submitted_at (timestamp, nullable)
- reviewed_at (timestamp, nullable)
- reviewed_by (FK -> users, nullable)
- notes (text, nullable)
- created_at, updated_at
```

#### `form_submission_values`
```sql
- id (bigint, PK)
- submission_id (FK -> form_submissions)
- field_id (FK -> form_fields)
- field_name (string) - Kopie für Referenz
- value (text, nullable)
- file_path (string, nullable) - Für Datei-Uploads
- created_at, updated_at
```

## Installation

### 1. Migrationen ausführen
```bash
php artisan migrate
```

### 2. Assets kompilieren (falls nötig)
```bash
npm run build
```

## Routen

### Web-Routen (mit Auth-Middleware)

| Methode | Route | Name | Beschreibung |
|---------|-------|------|--------------|
| GET | `/hub/forms` | `hub.forms.index` | Formular-Übersicht |
| GET | `/hub/forms/editor/{form?}` | `hub.forms.editor` | Editor (neu/bearbeiten) |
| GET | `/hub/forms/fill/{form}` | `hub.forms.fill` | Formular ausfüllen |
| GET | `/hub/forms/submission/{submission}` | `hub.forms.submission` | Einreichung anzeigen |
| GET | `/hub/forms/submission/{submission}/pdf` | `hub.forms.submission.pdf` | PDF herunterladen |

### API-Routen

| Methode | Route | Beschreibung |
|---------|-------|--------------|
| GET | `/api/forms` | Alle Formulare abrufen |
| GET | `/api/forms/{form}` | Einzelnes Formular |
| POST | `/api/forms` | Formular erstellen |
| PUT | `/api/forms/{form}` | Formular aktualisieren |
| DELETE | `/api/forms/{form}` | Formular löschen |
| POST | `/api/forms/{form}/duplicate` | Formular duplizieren |
| PUT | `/api/forms/{form}/fields` | Felder aktualisieren |
| POST | `/api/forms/{form}/submit` | Formular einreichen |
| GET | `/api/forms/{form}/submissions` | Einreichungen abrufen |
| GET | `/api/forms/field-types` | Verfügbare Feldtypen |

## Komponenten-Dateien

### CSS
- `/public/css/components/form-editor.css` - Editor-Styles
- `/public/css/components/form-fill.css` - Ausfüll-Ansicht
- `/public/css/components/signature-pad.css` - Unterschriften-Feld

### JavaScript (Alpine.js)
- `/public/js/components/form-editor.js` - Editor-Logik
- `/public/js/components/form-fill.js` - Ausfüll-Logik
- `/public/js/components/signature-pad.js` - Unterschriften-Canvas

### Blade Views
- `/resources/views/hub/forms/index.blade.php` - Übersicht
- `/resources/views/hub/forms/editor.blade.php` - Editor
- `/resources/views/hub/forms/fill.blade.php` - Ausfüllen (standalone)
- `/resources/views/hub/forms/pdf.blade.php` - PDF-Template

#### Formular-Ausfüllen Views (zentral verwaltet)

Alle Feld-Renderer sind in einem zentralen Partial zusammengefasst:

```
resources/views/partials/form-fields/_field-renderer.blade.php  ← ZENTRALE DATEI
```

Dieses Partial wird von 2 verschiedenen Views eingebunden:

| View | Verwendung |
|------|------------|
| `/resources/views/hub/forms/fill.blade.php` | Standalone Formular-Ausfüllen |
| `/resources/views/hub/appointment-unified/partials/form-fill-inline.blade.php` | Formular in der Unified Terminansicht |

> ⚠️ **Wichtig**: Bei Änderungen an Feldtypen nur `_field-renderer.blade.php` bearbeiten!

## Verwendung

### Neues Formular erstellen

1. Navigation zu "Formulare" im Seitenmenü
2. Klick auf "+ Neues Formular"
3. Formular benennen
4. Felder per Drag & Drop hinzufügen
5. Felder konfigurieren (Label, Optionen, Pflichtfeld, etc.)
6. Speichern und ggf. veröffentlichen

### Formular testen

1. Im Editor auf "Vorschau" klicken
2. Oder über die Formular-Übersicht "Testen" wählen
3. Formular ausfüllen und absenden

### Einreichungen verwalten

1. In der Formular-Übersicht werden Einreichungszahlen angezeigt
2. Einreichungen können angesehen werden
3. PDF-Export für einzelne Einreichungen

## Body Zones Integration

Das Formular-System nutzt das bestehende Body Zone Selector Partial:
```blade
@include('partials.body-zone-selector', [
    'prefix' => $field->field_name,
    'showList' => $field->settings['show_list'] ?? true
])
```

## Anpassungen

### Neuen Feldtyp hinzufügen

1. Konstante in `FormField::TYPE_*` hinzufügen
2. In `getFieldTypes()` registrieren
3. **Renderer in `_field-renderer.blade.php` hinzufügen** (zentral für alle 3 Ausfüll-Views)
4. Preview in `editor.blade.php` hinzufügen
5. PDF-Darstellung in `pdf.blade.php` hinzufügen

> 💡 **Tipp**: Die Feld-Templates in `_field-renderer.blade.php` verwenden Alpine.js `x-if` Direktiven.
> Einfach ein neues `<template x-if="field.type === 'neuer_typ'">` Block hinzufügen.

### CSS anpassen

Alle Styles nutzen das GLATTT Design System (`theme_glattt.css`):
- CSS-Variablen für Farben
- Glass-Morphism Effekte
- Konsistente Spacing-Werte

## Abhängigkeiten

- **Laravel** - Backend Framework
- **Alpine.js** - Frontend Interaktivität  
- **barryvdh/laravel-dompdf** - PDF-Generierung
- **GLATTT Design System** - CSS Framework

## PDF-Konfiguration

Die PDF-Generierung verwendet DomPDF mit folgender Konfiguration:

### Schriftart
Die Dosis-Schriftart wird aus `storage/fonts/` geladen. Falls die Schriftart nicht funktioniert:
```bash
# Font-Cache löschen
rm -f storage/fonts/installed-fonts.json storage/fonts/dosis_*

# Schriftart kopieren (falls nicht vorhanden)
cp public/fonts/Dosis-VariableFont_wght.ttf storage/fonts/
```

### Konfiguration
Die DomPDF-Konfiguration befindet sich in `config/dompdf.php`:
- `font_dir` → `storage/fonts`
- `font_cache` → `storage/fonts`
- `temp_dir` → `storage/fonts`
- `chroot` → Projektverzeichnis

## Bedingte Anzeige (Conditional Fields)

Felder können basierend auf dem Wert anderer Felder ein-/ausgeblendet werden.

### Konfiguration im Editor

1. Feld auswählen
2. Bereich "Bedingte Anzeige" öffnen
3. Abhängiges Feld auswählen
4. Operator wählen (ist gleich, ist nicht gleich, enthält, ist ausgefüllt)
5. Wert auswählen

### Technische Umsetzung

- **Frontend**: `shouldShowField(field)` prüft die `show_condition` in den Feld-Settings
- **Backend**: `isFieldVisible()` in `FormController.php` wiederholt die gleiche Logik
- **Validierung**: Versteckte Pflichtfelder werden nicht validiert
- **Speicherung**: Versteckte Felder werden nicht gespeichert

### Beispiel Settings
```json
{
  "show_condition": {
    "enabled": true,
    "field": "zahlungsart",
    "operator": "equals",
    "value": "sepa_lastschrift"
  }
}
```

## Schreibgeschützte Felder (Readonly)

Felder können als schreibgeschützt markiert werden, um vorausgefüllte Werte vor Änderungen zu schützen.

### Aktivierung

1. Feld auswählen
2. Im Einstellungsbereich "Schreibgeschützt" aktivieren

### Anwendungsfälle

- SEPA-Mandatsreferenz (automatisch generiert)
- Vorausgefüllte Kundendaten
- Berechnete Werte

### Unterstützte Feldtypen

- Text, E-Mail, Telefon 
- Textarea
- Datum
- SEPA-Felder (Kontoinhaber, IBAN, BIC)

## Datumsregeln & Flatpickr

Datumsfelder nutzen Flatpickr (de-DE) mit Kombinationsregeln, die im Editor, im Frontend und im Backend gelten.

### Regeln (kombinierbar)
- Nur Vergangenheit → setzt `max` = heute
- Heute oder Zukunft → setzt `min` = heute
- Fester Zeitraum → `min`/`max` über Start/Ende
- Nächste X Wochen → `max` = heute + X Wochen
- Mindestens X Tage in Zukunft → `min` = heute + X Tage
- Nur bestimmte Tage (z.B. 3, 15, 28) → erlaubt spezifische Kalendertage

### Editor-Steuerung
- Toggle "Datum-Regeln" aktivieren
- Werte setzen; mehrere Tage als Komma-Liste eingeben (z.B. `3, 15, 28`)
- Änderungen werden auf Change/Blur übernommen

### Frontend-Verhalten
- Flatpickr deaktiviert Tage außerhalb der Regeln
- Anzeigeformat: `TT.MM.JJJJ`, gespeicherter Wert: `YYYY-MM-DD`
- Alt-Input aktiv, Mobile-Picker deaktiviert (`disableMobile`)

### Backend-Validierung
- `FormController@validateDateConstraints` prüft dieselben Regeln
- Fehlermeldungen spiegeln min/max und erlaubte Tage

### Dateien
- Logik: `/public/js/components/form-fill.js`
- Editor: `/public/js/components/form-editor.js`
- View: `/resources/views/hub/forms/editor.blade.php`

## SEPA-Formular Integration

Das Formular-System unterstützt spezielle SEPA-Felder für Lastschriftmandate:

### SEPA-Feldtypen

| Typ | Beschreibung |
|-----|-------------|
| `sepa_iban` | IBAN mit MOD-97 Validierung und Auto-Formatierung |
| `sepa_bic` | BIC (automatisch aus IBAN via OpenIBAN API) |
| `sepa_account_holder` | Kontoinhaber mit Vorausfüllung |

### IBAN-Validierung

- Echtzeit-Validierung mit MOD-97 Algorithmus
- Länderprüfung (länderspezifische IBAN-Längen)
- Automatische Formatierung mit Leerzeichen
- Visuelles Feedback (Häkchen/Kreuz)

### Auto-BIC-Lookup

- Bei gültiger IBAN wird BIC automatisch abgerufen
- API: https://openiban.com 
- BIC-Feld ist readonly
- Bankname wird zusätzlich angezeigt

### Backend-Verarbeitung

Beim Einreichen eines SEPA-Formulars werden folgende Felder automatisch extrahiert:

| Formular-Feld | Erkennungskriterium | Datenbank-Spalte |
|---------------|---------------------|------------------|
| IBAN | Feldtyp `sepa_iban` | `payer_iban` (verschlüsselt) |
| BIC | Feldtyp `sepa_bic` | `payer_bic` |
| Kontoinhaber | Feldtyp `sepa_account_holder` | `payer_first_name`, `payer_last_name` |
| Abw. Zahler | Radio mit Label "Kontoinhaber" | `has_different_payer` |
| Adresse | Label enthält "Adresse Kontoinhaber" | `payer_street` |
| PLZ | Label enthält "Postleitzahl" oder "PLZ" | `payer_postal_code` |
| Stadt | Label enthält "Stadt" | `payer_city` |
| E-Mail | Feldtyp `email` oder Label "E-Mail" | `payer_email` |
| Startdatum | Feldtyp `date` + Label "Startdatum" | `first_payment_date` |

Der Bankname wird automatisch via OpenIBAN API aus der IBAN ermittelt.

> **Siehe auch:** [glatttPakete.md](glatttPakete.md#sepa-mandate) für Details zur Vertragsverarbeitung

### Vorausfüllung (Prefill)

Felder können mit Platzhaltern vorausgefüllt werden:

```
client.fullName     → Kundenname
client.firstName    → Vorname
client.lastName     → Nachname
client.email        → E-Mail
client.mobile       → Handynummer
client.dateOfBirth  → Geburtsdatum (Anzeige: DD.MM.YYYY)
client.dateOfBirthInput → Geburtsdatum (für Datum-Feld: YYYY-MM-DD)
client.address.street   → Straße
client.address.city     → Stadt
client.address.postalCode → PLZ
appointment.date    → Termindatum (lang)
appointment.time    → Uhrzeit
staff.fullName      → Mitarbeitername
branch.name         → Standort-Name
today.dateShort     → Aktuelles Datum (DD.MM.YYYY)
sepa.mandateReference → Mandatsreferenz aus Datenbank
sepa.creditorId     → Gläubiger-ID (DE33ZZZ00001960715)
```

Statische Werte (ohne Punkt) werden direkt eingetragen.

Die vollständige Platzhalter-Konfiguration befindet sich in `config/form-placeholders.php`.

### Phorest-Änderungserkennung

Wenn ein Formular mit Phorest-Kontext geöffnet wird (z.B. aus der Terminansicht) und Felder mit Phorest-Platzhaltern (`client.*`) vorausgefüllt wurden, erkennt das System automatisch Änderungen an diesen Feldern.

#### Ablauf

1. **Tracking**: Beim Initialisieren des Formulars werden die Originalwerte aller `client.*`-Felder gespeichert
2. **Erkennung**: Beim Absenden vergleicht `detectPhorestChanges()` aktuelle Werte mit den Originalwerten
3. **Modal**: Bei erkannten Änderungen öffnet sich das „Kundendaten geändert"-Modal mit Vorher/Nachher-Vergleich
4. **Entscheidung**:
   - **„In Phorest übernehmen"** → Sendet Änderungen via `PUT /phorest/client/{clientId}` an die Phorest API, zeigt Erfolgsbestätigung, dann wird das Formular eingereicht
   - **„Nur in diesem Formular"** → Keine Phorest-Aktualisierung, Formular wird direkt eingereicht

#### Unterstützte Phorest-Felder

| Platzhalter | Phorest API-Feld | Beschreibung |
|-------------|------------------|-------------|
| `client.firstName` | `firstName` | Vorname |
| `client.lastName` | `lastName` | Nachname |
| `client.email` | `email` | E-Mail-Adresse |
| `client.mobile` | `mobile` | Handynummer |
| `client.phone` | `mobile` | Telefon (→ mobile) |
| `client.externalId` | `externalId` | Kunden-ID |
| `client.dateOfBirth` | `dateOfBirth` | Geburtsdatum (wird in Epoch konvertiert) |
| `client.address.street` | `address.streetAddress1` | Straße |
| `client.address.city` | `address.city` | Stadt |
| `client.address.postalCode` | `address.postalCode` | Postleitzahl |

#### Technische Details

- **Optimistic Locking**: Das Phorest API erfordert `clientId` + `version` im Payload. Die Raw-Client-Daten (inkl. `version`) werden beim Laden des Kontexts aus `/api/forms/context` → `raw.client` gespeichert
- **Datenfluss (Terminansicht)**:
  1. `appointment-unified.js` lädt Kontext via `/api/forms/context`
  2. Speichert `rawClientData = ctxJson.raw.client`
  3. Übergibt an `formFill()` via `{ rawClient: rawClientData }`
  4. `formFill` initialisiert `phorestRawClient` aus dem übergebenen Context
- **Datenfluss (Standalone)**: `loadContextData()` in `form-fill.js` speichert `result.raw.client` direkt als `phorestRawClient`
- **API-Endpoint**: `PUT /phorest/client/{clientId}` → `PhorestController@updateClientData`
- **Pflichtfelder im Payload**: `clientId`, `version`, `firstName`, `lastName` (immer gesendet, auch wenn nicht geändert)

#### Beteiligte Dateien

| Datei | Verantwortung |
|-------|--------------|
| `public/js/components/form-fill.js` | Change-Tracking, Detection, Payload-Build, API-Call |
| `resources/views/partials/phorest-changes-modal.blade.php` | Modal-UI (x-teleport, Design-System) |
| `public/js/appointment-unified.js` | Raw-Client-Daten speichern & weiterreichen |
| `app/Http/Controllers/PhorestController.php` | `updateClientData()` Backend-Endpoint |
| `config/form-placeholders.php` | Platzhalter-Definition mit Kategorien |

### Erfolgs-Modal & Submission-Aktionen

Nach erfolgreichem Absenden zeigt ein Erfolgs-Modal die verfügbaren Aktionen.

#### Per-Form Konfiguration

Im Editor kann über den **„Mail und Download"**-Button (Zahnrad-Icon) pro Formular konfiguriert werden:

| Einstellung | Feld | Default |
|-------------|------|---------|
| PDF-Download aktiviert | `settings.submission_actions.enable_pdf_download` | `true` |
| E-Mail-Versand aktiviert | `settings.submission_actions.enable_email` | `true` |
| Standard-Empfänger | `settings.submission_actions.email_to` | `''` |
| E-Mail HTML-Template | `settings.submission_actions.email_body_html` | `''` |

Der E-Mail-Empfänger unterstützt Platzhalter (z.B. `client.email`), die zur Laufzeit aufgelöst werden.

#### Erfolgs-Modal Features

- **PDF-Download**: Wird im Hintergrund generiert, Button erscheint wenn fertig
- **E-Mail-Versand**: Eingabefeld für Empfänger + Senden-Button mit 3 Zuständen (Senden / Sendet... / Gesendet ✓)
- **Kontext-Navigation**: „Zur Terminansicht" (embedded) oder „Zur Übersicht" (standalone)
- **Neues Formular**: Setzt alle Felder zurück

#### E-Mail-Template

Das HTML-Template (`resources/views/emails/templates/form-submission-modern.html`) unterstützt:
- Dosis-Font via Google Fonts
- Dark Mode (`@media prefers-color-scheme: dark`)
- Mobile Responsive (`@media max-width: 640px`)
- Platzhalter: `{{client.firstName}}`, `{{form.name}}`, `{{submitted_at}}`, `{{client.name}}`
- Server-seitige Auflösung via `FormController@renderSubmissionEmailTemplate()`

#### Beteiligte Dateien

| Datei | Verantwortung |
|-------|--------------|
| `resources/views/partials/form-submission-modal.blade.php` | Shared Modal (PDF + E-Mail) |
| `resources/views/hub/forms/editor.blade.php` | Konfigurations-Modal im Editor |
| `public/js/components/form-fill.js` | Submission-Flow, PDF-Gen, E-Mail-Send |
| `app/Http/Controllers/FormController.php` | Submit, PDF, E-Mail mit Template-Rendering |
| `resources/views/emails/templates/form-submission-modern.html` | HTML E-Mail-Template |

## Adress-Suche (Address Lookup)

Das `address_lookup`-Feld ermöglicht eine Adressvalidierung direkt im Formular, ähnlich wie in Online-Shops. Es nutzt die kostenlose **OpenStreetMap Nominatim API** für Autocomplete und Validierung.

### Funktionsweise

1. **Autocomplete**: Benutzer tippt eine Adresse → nach 400ms wird Nominatim abgefragt → Vorschläge erscheinen in einem Dropdown
2. **Auswahl**: Bei Klick auf einen Vorschlag werden die konfigurierten Zielfelder (Straße, PLZ, Stadt) automatisch befüllt
3. **Rückwärts-Validierung**: Wenn Zielfelder bereits vorausgefüllt sind (z.B. aus Phorest-Kontext), werden die Werte kombiniert und gegen Nominatim validiert
4. **Status-Anzeige**: Grüner Haken = Adresse verifiziert, Gelbes Warndreieck = nicht verifizierbar

### Editor-Konfiguration

Im Editor können folgende Zielfelder konfiguriert werden:

| Setting | Beschreibung |
|---------|-------------|
| `target_street_field` | Feldname des Textfelds für die Straße |
| `target_postal_code_field` | Feldname des Textfelds für die PLZ |
| `target_city_field` | Feldname des Textfelds für die Stadt |
| `country_codes` | Kommagetrennte ISO-Ländercodes (Standard: `de`) |

### Nominatim API

- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Rate-Limit**: Max. 1 Request/Sekunde (via 400ms Debounce)
- **Kosten**: Kostenlos (OSM-basiert)
- **User-Agent**: `glatttHub/1.0` (Pflicht laut Nominatim Usage Policy)
- **Sprache**: Deutsch (`accept-language: de`)

### Vorausfüllung & Validierung

Wenn das Formular mit Phorest-Kontext geladen wird und Adressfelder vorausgefüllt sind (`client.address.street`, `client.address.postalCode`, `client.address.city`), wird automatisch:

1. Die vorausgefüllten Werte zu einem Suchtext kombiniert
2. Nominatim mit diesem Text abgefragt
3. Das Ergebnis als Validierungsstatus angezeigt (✓ verifiziert / ⚠ nicht verifizierbar)

### Gespeicherter Wert

Das `address_lookup`-Feld speichert den angezeigten Adresstext (z.B. "Musterstraße 42, 28195 Bremen"). Die eigentlichen Adresskomponenten werden in den Zielfeldern gespeichert.

### Beteiligte Dateien

| Datei | Verantwortung |
|-------|--------------|
| `app/Models/FormField.php` | `TYPE_ADDRESS_LOOKUP` Konstante & Registrierung |
| `resources/views/partials/form-fields/_field-renderer.blade.php` | Feld-Template mit Autocomplete-UI |
| `public/js/components/form-fill.js` | `searchAddress()`, `selectAddressSuggestion()`, `validateExistingAddress()` |
| `public/js/components/form-editor.js` | Default-Settings, Icon |
| `resources/views/hub/forms/editor.blade.php` | Preview & Zielfeld-Konfiguration |
| `public/css/components/form-fill.css` | Dropdown & Status-Styling |

## Hinweise

- Das Signature Pad speichert Unterschriften als **SVG mit `currentColor`** (siehe [Unterschriften-SVG-Format](#unterschriften-svg-format))
- Datei-Uploads werden in `storage/app/forms/` gespeichert
- Formulare können soft-deleted werden (Papierkorb)
- Auto-Save verhindert Datenverlust beim Bearbeiten
- Bedingte Felder werden weder validiert noch gespeichert wenn ausgeblendet

---

## Unterschriften-SVG-Format

### Nutzersicht

Unterschriften passen sich automatisch an den aktuellen Dark/Light Mode an — die Linienfarbe wechselt mit dem Theme. In PDFs werden Unterschriften immer in Dunkelgrau dargestellt.

### Technische Umsetzung

Seit Februar 2026 werden Unterschriften als **SVG statt PNG** gespeichert. Der Schlüssel ist die Verwendung von `currentColor` als Strichfarbe, wodurch die Unterschrift die aktuelle Textfarbe des Kontexts erbt.

#### Datenfluss

```
Canvas (Zeichnen) → Stroke-Daten (Vektoren) → SVG-String → Base64 Data-URL → Backend → Datei (.svg)
```

#### 1. Signature Pad (`public/js/components/signature-pad.js`)

Unterschriften werden als Vektor-Strokes erfasst:

```js
strokes: []  // Array von { points: [{x, y}, ...] }
```

`generateSvg()` konvertiert die Strokes in SVG:
- Einzelpunkte → `<circle>` Elemente
- Mehrpunkt-Strokes → `<path>` Elemente mit `stroke="currentColor"`
- Output: `data:image/svg+xml;base64,...`

Dark-Mode-Unterstützung:
- `MutationObserver` auf `document.documentElement` class-Änderungen
- `prefers-color-scheme` Media-Query-Listener
- Bei Theme-Wechsel: Canvas wird aus den Stroke-Daten neu gezeichnet (kein Qualitätsverlust)

#### 2. Backend (`app/Http/Controllers/FormController.php`)

Dual-Format-Erkennung beim Speichern:

```php
if (Str::startsWith($signatureData, 'data:image/svg+xml;base64,')) {
    // Neues SVG-Format → .svg Datei
} elseif (Str::startsWith($signatureData, 'data:image')) {
    // Legacy PNG-Format → .png Datei (Abwärtskompatibilität)
}
```

#### 3. Anzeige in verschiedenen Kontexten

| Kontext | Format | Dark-Mode-Anpassung |
|---------|--------|---------------------|
| **Formular-Einreichung** (`submission.blade.php`) | Inline SVG via `{!! $content !!}` | `currentColor` erbt Textfarbe |
| **Kundenprofil-Modal** (`documents.blade.php`) | Inline SVG via `x-html` + Alpine | `currentColor` erbt Textfarbe |
| **PDF-Export** (`pdf.blade.php`) | Base64 `<img>` | `currentColor` → `#1f2937` ersetzt |

#### 4. SVG-Rendering im Kundenprofil-Modal

Im Dokumente-Tab des Kundenprofils werden SVG-Unterschriften inline gerendert mit automatischer Größenanpassung:

```html
<div x-html="field.display_value" x-init="$nextTick(() => {
    const svg = $el.querySelector('svg');
    if (svg) {
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.removeAttribute('width');
        svg.removeAttribute('height');
    }
})"></div>
```

#### 5. PDF-Rendering

PDFs unterstützen kein CSS `currentColor`. Daher wird es vor dem Einbetten ersetzt:

```php
$signatureContent = str_replace('currentColor', '#1f2937', $signatureContent);
$signatureData = 'data:image/svg+xml;base64,' . base64_encode($signatureContent);
```

### Betroffene Dateien

| Datei | Änderung |
|-------|---------|
| `public/js/components/signature-pad.js` | SVG-Generierung statt PNG, Stroke-Vektor-Tracking, Dark-Mode-Observer |
| `public/css/components/signature-pad.css` | Canvas-Styling für Dark/Light Mode |
| `app/Http/Controllers/FormController.php` | Dual-Format-Erkennung (SVG/PNG), .svg Dateipfad |
| `resources/views/hub/forms/pdf.blade.php` | `currentColor` → `#1f2937` Ersetzung für PDF |
| `resources/views/hub/forms/submission.blade.php` | Inline-SVG-Rendering mit `{!! !!}` |
| `resources/views/hub/clients/partials/documents.blade.php` | Inline-SVG via `x-html`, Größenanpassung per `x-init` |

### Abwärtskompatibilität

Bestehende PNG-Unterschriften werden weiterhin korrekt angezeigt. Die Erkennung erfolgt anhand der Dateiendung (`.svg` vs `.png`) bzw. des Base64-Prefixes.

## Verwandte Dokumentation

- [Formular-Teilung (Shared Form System)](SHARED-FORM-SYSTEM.md) – Formulare per Link mit externen Personen teilen
- [PDF-Erstellung](PDF-ERSTELLUNG.md)
- [E-Mail-Versand](EMAIL-VERSAND.md)
- [Verträge & SEPA](CONTRACTS-SEPA-MODULE.md)
