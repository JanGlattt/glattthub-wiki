# PDF-Erstellung

## Ziel
Diese Dokumentation beschreibt die automatische PDF-Erzeugung aus Formulareinreichungen sowie die Admin-Einstellungsseite zur Konfiguration des PDF-Layouts (Logo, Footer, Schriftgrößen, Farben, Ränder).

---

## Nutzerdokumentation

### PDF-Erzeugung

PDFs werden automatisch beim Einreichen eines Formulars erstellt. Jedes ausgefüllte Formular erzeugt ein professionelles PDF-Dokument mit:

- **Header** auf jeder Seite: Firmen-Logo, Datum, Referenznummer, Kundenname
- **Footer** auf jeder Seite: Firmendaten (bis zu 4 Zeilen)
- **Seitenzahlen** unten rechts: „Seite X von Y"
- **Alle Feldtypen** werden korrekt dargestellt (Texte, Auswahlfelder, Unterschriften, Körperzonen, Vertragspreise)

### PDF-Einstellungen im Admin

Unter **Admin → Einstellungen → PDF Einstellungen** (`/admin/pdf-settings`) können folgende Werte konfiguriert werden:

#### Logo
- Bild-Upload (PNG, JPEG, SVG, max. 15 MB)
- Wird oben links im Header jeder Seite angezeigt
- Ohne Upload wird das Standard-Logo (`images/glattt-logo.png`) verwendet
- In Produktion wird das Logo im Google Cloud Storage (öffentlicher Bucket) gespeichert

#### Footer-Text
- 4 Zeilen für Firmendaten (Adresse, Handelsregister, Geschäftsführung, Kontakt)
- Erscheint zentriert am unteren Rand jeder Seite

#### Schriftgrößen (in Punkt)
| Einstellung | Beschreibung | Standard |
|-------------|-------------|----------|
| Fließtext | Allgemeiner Text im Dokument | 11 pt |
| Überschriften | Abschnitts-Überschriften | 13 pt |
| Feldwerte | Werte in den Formularfeldern | 10.5 pt |
| Footer | Fußzeilen-Text | 7 pt |

#### Typografie
| Einstellung | Beschreibung | Standard |
|-------------|-------------|----------|
| Zeilenhöhe | Abstand zwischen Zeilen | 1.25 |
| Zeichenabstand | Abstand zwischen Buchstaben | 0 pt |

#### Farben
| Einstellung | Beschreibung | Standard |
|-------------|-------------|----------|
| Akzentfarbe | Header-Linie, Bordüre unter Überschriften, gewählte Optionen | #c9a227 (Gold) |
| Textfarbe | Haupttext und Feldwerte | #2d2d2d |
| Label-Farbe | Feld-Bezeichnungen (linke Spalte) | #555555 |

#### Seitenränder (in Punkt, 1 cm ≈ 28 pt)
| Einstellung | Standard |
|-------------|----------|
| Oben | 100 pt |
| Rechts | 50 pt |
| Unten | 115 pt |
| Links | 50 pt |

#### Anzeige-Optionen
| Einstellung | Beschreibung | Standard |
|-------------|-------------|----------|
| Seitenzahlen | „Seite X von Y" unten rechts | An |
| Referenznummer | Referenz-ID oben rechts im Header | An |
| Datum | Eingangsdatum oben rechts im Header | An |

#### Bedienung
1. Einstellungen nach Bedarf anpassen.
2. **Speichern** klicken.
3. Änderungen werden bei der **nächsten** PDF-Erstellung wirksam.
4. Bereits erzeugtes PDFs bleiben unverändert. Um ein bestehendes PDF neu zu erzeugen, muss der `pdf_path` der Submission zurückgesetzt werden.
5. **Standardwerte zurücksetzen** stellt alle Felder auf die Original-Werte zurück (muss danach noch gespeichert werden).

### Wichtige Hinweise
- Schriftart: **Dosis** (Variable Weight, als TTF eingebettet).
- Papierformat: **DIN A4 Hochformat**.
- Bereits generierte PDFs werden zwischengespeichert. Neue Einstellungen wirken sich nur auf zukünftige PDFs aus.

---

## Entwicklerdokumentation

### Übersicht der Komponenten

```
┌─────────────────────────────────┐
│     Admin: PDF Einstellungen    │
│  (Filament Page + Blade View)   │
└──────────────┬──────────────────┘
               │ speichert
               ▼
┌─────────────────────────────────┐
│    Datenbank: pdf_settings      │
│         (PdfSetting Model)      │
└──────────────┬──────────────────┘
               │ liest
               ▼
┌─────────────────────────────────┐
│  FormController                 │
│  → ensureSubmissionPdf()        │
│  → Pdf::loadView('pdf.blade')  │
└──────────────┬──────────────────┘
               │ rendert
               ▼
┌─────────────────────────────────┐
│  pdf.blade.php (dompdf)         │
│  → CSS mit dynamischen Werten   │
│  → HTML mit Footer/Header       │
│  → Inline PHP für Seitenzahlen  │
└─────────────────────────────────┘
```

### Datenbank

**Tabelle:** `pdf_settings`

| Spalte | Typ | Default | Zweck |
|--------|-----|---------|-------|
| `logo_path` | VARCHAR(255), nullable | NULL | Relativer Pfad auf dem Storage-Disk |
| `logo_disk` | VARCHAR(255), nullable | 'public' | Storage-Disk: `public` (lokal) oder `gcs` (Produktion) |
| `footer_line_1` bis `_4` | VARCHAR(255), nullable | NULL | Fußzeilen-Text (4 Zeilen) |
| `font_size_body` | DECIMAL(4,1) | 11.0 | Fließtext-Schriftgröße in pt |
| `font_size_heading` | DECIMAL(4,1) | 13.0 | Überschriften-Schriftgröße in pt |
| `font_size_field` | DECIMAL(4,1) | 10.5 | Feldwerte-Schriftgröße in pt |
| `font_size_footer` | DECIMAL(4,1) | 7.0 | Footer-Schriftgröße in pt |
| `line_height` | DECIMAL(3,2) | 1.25 | Zeilenhöhe (Faktor) |
| `letter_spacing` | DECIMAL(4,2) | 0.00 | Zeichenabstand in pt |
| `accent_color` | VARCHAR(7) | #c9a227 | Akzentfarbe (Hex) |
| `text_color` | VARCHAR(7) | #2d2d2d | Textfarbe (Hex) |
| `label_color` | VARCHAR(7) | #555555 | Label-Farbe (Hex) |
| `margin_top` | INT | 100 | Seitenrand oben (pt) |
| `margin_right` | INT | 50 | Seitenrand rechts (pt) |
| `margin_bottom` | INT | 115 | Seitenrand unten (pt) |
| `margin_left` | INT | 50 | Seitenrand links (pt) |
| `show_page_numbers` | TINYINT(1) | 1 | Seitenzahlen anzeigen |
| `show_reference_number` | TINYINT(1) | 1 | Referenznummer anzeigen |
| `show_date` | TINYINT(1) | 1 | Datum anzeigen |

**Migration:** `2026_02_24_100000_create_pdf_settings_table.php`

**SQL für Produktiv-DB:**
```sql
CREATE TABLE `pdf_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `logo_path` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Relative path on disk',
  `logo_disk` VARCHAR(255) NULL DEFAULT 'public' COMMENT 'Storage disk: public or gcs',
  `footer_line_1` VARCHAR(255) NULL DEFAULT NULL,
  `footer_line_2` VARCHAR(255) NULL DEFAULT NULL,
  `footer_line_3` VARCHAR(255) NULL DEFAULT NULL,
  `footer_line_4` VARCHAR(255) NULL DEFAULT NULL,
  `font_size_body` DECIMAL(4,1) NOT NULL DEFAULT 11.0 COMMENT 'pt',
  `font_size_heading` DECIMAL(4,1) NOT NULL DEFAULT 13.0 COMMENT 'pt',
  `font_size_field` DECIMAL(4,1) NOT NULL DEFAULT 10.5 COMMENT 'pt',
  `font_size_footer` DECIMAL(4,1) NOT NULL DEFAULT 7.0 COMMENT 'pt',
  `line_height` DECIMAL(3,2) NOT NULL DEFAULT 1.25,
  `letter_spacing` DECIMAL(4,2) NOT NULL DEFAULT 0.00 COMMENT 'pt',
  `accent_color` VARCHAR(7) NOT NULL DEFAULT '#c9a227' COMMENT 'Hex color for headings/lines',
  `text_color` VARCHAR(7) NOT NULL DEFAULT '#2d2d2d',
  `label_color` VARCHAR(7) NOT NULL DEFAULT '#555555',
  `margin_top` INT NOT NULL DEFAULT 100,
  `margin_right` INT NOT NULL DEFAULT 50,
  `margin_bottom` INT NOT NULL DEFAULT 115,
  `margin_left` INT NOT NULL DEFAULT 50,
  `show_page_numbers` TINYINT(1) NOT NULL DEFAULT 1,
  `show_reference_number` TINYINT(1) NOT NULL DEFAULT 1,
  `show_date` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Model: PdfSetting

**Datei:** `app/Models/PdfSetting.php`

```php
PdfSetting::current()  // Gibt den letzten Eintrag zurück oder eine leere Instanz mit Defaults
```

**Accessors:**
- `logo_full_path` — Absoluter Dateipfad (lokal) oder öffentliche GCS-URL für dompdf-Embedding
- `logo_url` — Öffentliche URL für Admin-Vorschau
- `footer_lines` — Array der 4 Footer-Zeilen (mit Fallback auf Standardtexte)

**Singleton-Pattern:** Es gibt immer nur einen aktiven Datensatz. `PdfSetting::current()` liefert den neuesten Eintrag per `latest('id')`. Gibt es noch keinen Eintrag, wird eine leere Model-Instanz mit den Spalten-Defaults zurückgegeben.

### Logo-Upload und Storage

Das Logo-Upload-System folgt dem gleichen Muster wie das News-Bild-Upload:

| Umgebung | Disk | Bucket/Pfad | Zugriff |
|----------|------|-------------|---------|
| Lokal | `public` | `storage/app/public/pdf/logo/` | `asset('storage/...')` |
| Produktion | `gcs` | `glattthub-public/pdf/logo/` | Direkte öffentliche URL |

**Für dompdf** (der PDF-Renderer):
- Lokal: Absoluter Dateisystem-Pfad via `storage_path('app/public/...')`
- Produktion: Öffentliche GCS-URL (dompdf hat `isRemoteEnabled: true`)

### Admin-Seite: Filament

**Page-Klasse:** `app/Filament/Pages/PdfSettings.php`
- Navigation: **Einstellungen → PDF Einstellungen**
- Icon: `heroicon-o-document-text`
- Methoden:
  - `mount()` — Lädt aktuelle Einstellungen oder Defaults
  - `save()` — Speichert die Einstellungen + setzt `logo_disk`
  - `resetToDefaults()` — Füllt das Formular mit Standardwerten (speichert noch nicht)

**View:** `resources/views/filament/pages/pdf-settings.blade.php`

### PDF-Template

**Datei:** `resources/views/hub/forms/pdf.blade.php`

#### Variablen
Das Template erwartet:
- `$submission` — `FormSubmission`-Instanz (mit Relationen `form`, `form.fields`, `values`)
- `$form` — `Form`-Instanz
- `$pdfSettings` — `PdfSetting`-Instanz (optional, wird sonst per `PdfSetting::current()` geladen)

#### CSS-Architektur
Alle Werte werden dynamisch aus `$s` (= `$pdfSettings`) gelesen:

```blade
@page {
    margin: {{ $s->margin_top }}px {{ $s->margin_right }}px ...;
}
body {
    font-size: {{ $s->font_size_body }}pt;
    line-height: {{ $s->line_height }};
    color: {{ $s->text_color }};
    letter-spacing: {{ $s->letter_spacing }}pt;  // nur wenn != 0
}
```

#### Layout-Struktur

```
┌────────────────────────────────────┐ ← @page margin-top (100px)
│  HEADER (position: fixed)          │
│  [Logo]              [Datum/Ref/Name]│
│  ══════════════════════════════════ │ ← Gold-Linie
├────────────────────────────────────┤
│                                    │
│  Dokumenttitel (nur Seite 1)       │
│                                    │
│  ┌─ Section ─────────────────────┐ │
│  │ Überschrift                   │ │
│  │ ────────────────────────────  │ │ ← Akzentfarbe
│  │ Label          │ Wert         │ │
│  │ Label          │ Wert         │ │
│  └───────────────────────────────┘ │
│                                    │
│  ┌─ Section ─────────────────────┐ │
│  │ ...                           │ │
│  └───────────────────────────────┘ │
│                                    │
├────────────────────────────────────┤
│  FOOTER (position: fixed)          │
│  Zeile 1 | Zeile 2 | ...          │
│                                    │
│              Seite X von Y ──────► │ ← Inline PHP
└────────────────────────────────────┘ ← @page margin-bottom (115px)
```

#### Unterstützte Feldtypen im PDF

| Typ | Darstellung |
|-----|-------------|
| `heading` | Goldene Bordüre, fett, startet neue `.section` |
| `paragraph` | Kursiv-Textblock, unterstützt `**fett**` und `__unterstrichen__` |
| `divider` | Horizontale Linie, beendet aktuelle `.section` |
| `radio` | Zeigt nur die gewählte Option (Label, nicht Value) |
| `checkbox` | Alle Optionen mit Häkchen bei gewählten |
| `dropdown` | Gewählte Option als Text |
| `toggle` | Grünes Badge „Ja" oder graues Badge „Nein" |
| `file_upload` | Dateiname |
| `body_zones` | Farbige Tags mit Zonennamen |
| `signature` | Eingebettetes Bild (SVG/PNG, base64) mit Unterschriftenlinie |
| `contract_price` | Tabelle: Laufzeit, Monatliche Rate, Gesamtbetrag, ggf. Rabatt |
| `textarea` | Mehrzeiliger Text mit `pre-wrap` |
| Standard | Label + Wert als Tabellenzeile |

#### Section-Grouping (Seitenumbruch-Steuerung)
Felder zwischen zwei `heading`-Elementen werden in ein `<div class="section">` gepackt mit:
```css
.section {
    page-break-inside: avoid;
    overflow: auto;
}
```
So wird verhindert, dass eine Überschrift vom zugehörigen Inhalt getrennt wird.

#### Seitenzahlen (Inline PHP)
Am Ende des `<body>` wird dompdf-spezifisches Inline-PHP gerendert:
```php
$pdf->page_text($x, $y, "Seite {PAGE_NUM} von {PAGE_COUNT}", $font, $size, $color);
```
Voraussetzung: `isPhpEnabled: true` in der dompdf-Konfiguration.

Die Akzentfarbe wird dynamisch von Hex in RGB-Floats umgerechnet.

### PDF-Erzeugung (Controller)

**Datei:** `app/Http/Controllers/FormController.php`
**Methode:** `ensureSubmissionPdf(FormSubmission $submission)`

Ablauf:
1. Prüft, ob bereits ein PDF unter `$submission->pdf_path` existiert.
2. Falls nicht: Rendert `hub.forms.pdf` mit dompdf und den aktuellen `PdfSettings`.
3. Speichert das PDF auf dem konfigurierten Disk (`public` lokal, `gcs-private` in Produktion).
4. Aktualisiert `pdf_path` und `pdf_disk` in der Submission.
5. Gibt URL, Pfad, Disk und Dateinamen zurück.

**dompdf-Optionen:**
```php
->setOption('isRemoteEnabled', true)       // Für GCS-Logo-URLs
->setOption('isFontSubsettingEnabled', true)
->setOption('isPhpEnabled', true)          // Für Seitenzahlen
->setOption('defaultFont', 'Dosis')
```

### Bekannte dompdf-Einschränkungen

#### `*`-Selektor überschreibt `@page`-Margins
**Problem:** Ein CSS-Reset wie `* { margin: 0; }` bewirkt in dompdf, dass die `@page`-Margins ignoriert werden. Alle Inhalte rutschen an den Papierrand. Header und Footer werden abgeschnitten.

**Lösung:** `body` separat resetten und für andere Elemente einen expliziten Selektor verwenden:
```css
body { margin: 0; padding: 0; }
div, p, h1, h2, table, td, ... { margin: 0; padding: 0; }
```

#### `position: fixed` für Header/Footer
dompdf unterstützt `position: fixed` nur mit negativen Offsets innerhalb der `@page`-Margins:
- Header: `top: -82px;` (innerhalb von `margin-top: 100px`)
- Footer: `bottom: -75px;` (innerhalb von `margin-bottom: 115px`)

#### Inline PHP (`<script type="text/php">`)
- Muss **am Ende** des `<body>` stehen, sonst werden Seitenzahlen nur auf Seite 1 gerendert.
- Erfordert `isPhpEnabled: true`.

### Technische Abhängigkeiten

| Paket | Version | Zweck |
|-------|---------|-------|
| `barryvdh/laravel-dompdf` | ^3.1 | Laravel-Wrapper für dompdf |
| `dompdf/dompdf` | ^3.1.4 | PDF-Rendering-Engine (CPDF Backend) |

**Konfiguration:** `config/dompdf.php` — A4, 96 DPI, CPDF Backend.

**Schriftart:** Dosis (Variable Weight TTF) in `storage/fonts/Dosis-VariableFont_wght.ttf`, eingebunden als `@font-face` im Template (Gewichte 400, 600, 700).

### Dateien und Einstiegspunkte

- [app/Models/PdfSetting.php](../app/Models/PdfSetting.php) — Model mit `current()`, `logo_full_path`, `footer_lines`
- [app/Filament/Pages/PdfSettings.php](../app/Filament/Pages/PdfSettings.php) — Admin-Seite
- [resources/views/filament/pages/pdf-settings.blade.php](../resources/views/filament/pages/pdf-settings.blade.php) — Admin-View
- [resources/views/hub/forms/pdf.blade.php](../resources/views/hub/forms/pdf.blade.php) — PDF-Template
- [app/Http/Controllers/FormController.php](../app/Http/Controllers/FormController.php) — `ensureSubmissionPdf()`
- [app/Models/FormSubmission.php](../app/Models/FormSubmission.php) — `pdf_path`, `pdf_disk`, `hasPdf()`
- [database/migrations/2026_02_24_100000_create_pdf_settings_table.php](../database/migrations/2026_02_24_100000_create_pdf_settings_table.php) — Migration
- [config/dompdf.php](../config/dompdf.php) — dompdf-Grundkonfiguration
- [storage/fonts/Dosis-VariableFont_wght.ttf](../storage/fonts/Dosis-VariableFont_wght.ttf) — Schriftart

### Debugging

#### PDF manuell neu erzeugen
```bash
php artisan tinker --execute="
  \$sub = App\Models\FormSubmission::find(123);
  \$sub->update(['pdf_path' => null]);
  // Beim nächsten Aufruf von downloadSubmission/emailSubmission wird das PDF neu erzeugt.
"
```

#### Aktuell gespeicherte Settings prüfen
```bash
php artisan tinker --execute="
  print_r(App\Models\PdfSetting::current()->toArray());
"
```

#### HTML-Output des Templates prüfen
```bash
php artisan tinker --execute="
  \$sub = App\Models\FormSubmission::with(['form.fields', 'values'])->find(123);
  \$html = view('hub.forms.pdf', [
      'submission' => \$sub,
      'form' => \$sub->form,
      'pdfSettings' => App\Models\PdfSetting::current(),
  ])->render();
  file_put_contents(public_path('debug-pdf.html'), \$html);
  echo 'Saved to public/debug-pdf.html';
"
```
