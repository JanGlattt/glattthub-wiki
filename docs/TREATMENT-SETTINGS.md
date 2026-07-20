# 💉 Behandlungseinstellungen (Treatment Settings)

Die Behandlungseinstellungen ermöglichen das Erfassen und Dokumentieren von Laser-Parametern für jede Körperzone eines Termins. Die Daten werden pro Kunde und Zone über mehrere Behandlungen hinweg protokolliert.

## 📋 Übersicht

Das Modul ist für den Einsatz auf **Tablets ohne Tastatur** optimiert:

- **Interaktive Körpergrafik** - Klick auf Zone öffnet Einstellungsformular
- **Touch-optimierte Buttons** - Alle Bedienelemente mind. 48px groß
- **Benutzerdefinierte Zonen** - Zusätzliche kleine Zonen (z.B. Kinn, Oberlippe) hinzufügen
- **Behandlungshistorie als Tabelle** - Alle vorherigen Behandlungen einer Zone auf einen Blick
- **Automatische Nummerierung** - Behandlungsnummer wird pro Zone/Kunde gezählt
- **Behandlungszähler** - Badge zeigt an, wie oft eine Zone bereits behandelt wurde
- **iPad-Zahlentastatur** - Numerische Felder öffnen automatisch die Zahlentastatur

---

## ✨ Neue Features (Februar 2026)

### Behandlungshistorie im Kundenprofil

Die Behandlungseinstellungen sind jetzt auch als **Tab im Kundenprofil** verfügbar (nicht nur in der Termin-Session). Details siehe [CLIENT-DETAIL-MODULE.md](CLIENT-DETAIL-MODULE.md).

- **Read-only Ansicht** aller bisherigen Behandlungen pro Körperzone
- **Termin-Datum** und **Mitarbeitername** aus Phorest-API (nicht aus DB-Timestamps)
- **Foto-Galerie** mit Navigation
- Nur Zonen mit vorhandenen Behandlungen werden angezeigt
- Layout: Körpergrafik + Buttons oben, Tabelle volle Breite unten

### Behandlungszähler-Badges

Alle Körperzonen zeigen jetzt einen **Behandlungszähler** an:

- **Standard-Zonen**: Badge mit "1x", "2x", etc. zeigt Anzahl vorheriger Behandlungen
- **Custom-Zonen**: Ebenfalls mit Behandlungszähler
- **Teal-Highlighting**: Bereits behandelte Zonen werden farblich hervorgehoben

### Automatisches Laden von Custom-Zonen

Custom-Zonen eines Kunden werden aus der Datenbank geladen:

- Alle Custom-Zonen aus vorherigen Terminen erscheinen automatisch
- Gruppiert nach `custom_zone_name` mit Behandlungsanzahl
- Keine manuelle Neueingabe notwendig

### Behandlungshistorie als Tabelle

Das Modal zeigt die **komplette Behandlungshistorie** in Tabellenform:

| Sitz. | MA | Kopf | Skintel/Typ | Haarfarbe | Dicke | Dichte | Empf. ms | J-Range | Genutzte ms | Genutzte Joule | Notizen |
|-------|----|------|-------------|-----------|-------|--------|----------|---------|-------------|----------------|---------|
| 1 | Lina L. | Klein | 10 | Schwarz | Dick | Hoch | 100 | 10-30 | 100 | 20 | Test |
| **2** | _automatisch_ | _Eingabe_ | ... | ... | ... | ... | ... | ... | ... | ... | ... |

- Historie-Tabelle: Vorherige Sitzungen (readonly) — inkl. **MA** (Mitarbeiter des jeweiligen Phorest-Termins, wird automatisch erfasst)
- Darunter Formularsektion **„Sitzung #N erfassen"** als **geführte Eingabe in 6 Gruppen** (eine Reihe):

  | Gruppe | Felder |
  |---|---|
  | 0 Laserkopf | Groß oder Klein (Dropdown) |
  | 1 Hauttyp | Skintel-Wert **oder** Typ I–VI |
  | 2 Haar | Haarfarbe, Haardicke, Haardichte |
  | 3 Empfohlen | Empf. ms + J-Range min–max |
  | 4 Genutzt | Genutzte ms + Genutzte Joule |
  | 5 Notizen | Notizen + Fotos |

  Nur die **aktive Gruppe** zeigt Eingabefelder (Standard-Komponenten: Floating Labels,
  `<x-dropdown-glattt>` — keine nativen Selects); alle anderen Gruppen zeigen ihre Werte als
  Text und sind per Klick wieder editierbar. Reine Auswahl-Gruppen springen nach der Auswahl
  automatisch weiter, Zahlen-Gruppen per „Weiter"-Button/Enter. Abgeschlossene Gruppen sind mit ✓
  markiert; der MA wird automatisch aus dem Phorest-Termin übernommen.
- Modal-Breite: 1400px für optimale Tabellenansicht
- **Dropdown-Overflow:** Offene `dropdown-glattt`-Panels dürfen unten über den Modalrand
  hinausragen — `.treatment-form-container:has(.dropdown-glattt-panel[data-open="true"])`
  setzt `overflow: visible`, nur solange ein Panel offen ist (gleiche Mechanik wie
  `.modal-glattt-dropdown-safe`); sonst bleibt der Container Scroll-Container für lange Historien
- Ladezustand: Skeleton-Card mit Zonen-Kachel-Raster statt Spinner

### Red Flags (Joule-Warnungen)

Beim Erfassen der genutzten Joule warnt das System live (rotes Feld + Hinweisbanner) und
zusätzlich mit einem Bestätigungs-Popup vor dem Speichern („Trotzdem speichern"), wenn:

- die genutzten Joule **außerhalb der J-Range (min–max)** liegen, oder
- die genutzten Joule **niedriger als bei der letzten Sitzung** derselben Zone sind
  (Hintergrund: Nach 3–4 Sitzungen sollten die Einstellungen steigen).

### Skintel-Ausfall: Hauttyp I–VI

Neben dem Skintel-Wert (0-100) kann alternativ der **Hauttyp I–VI** (Fitzpatrick) gewählt
werden — für den Fall, dass das Skintel-Gerät nicht funktioniert. Beim Speichern ist
**Skintel oder Typ** Pflicht (eines von beiden reicht). Anzeige in der Spalte „Skintel/Typ"
(z.B. `45` oder `Typ III`).

### iPad-Zahlentastatur

Alle numerischen Eingabefelder haben `inputmode="numeric"`:

- **Skintel** (0-100)
- **Empf. ms**
- **J-Range min** / **max**
- **Genutzte ms**
- **Genutzte Joule**

Auf iPad/iPhone erscheint automatisch die Zahlentastatur.

### Foto-Dokumentation

Pro Behandlung können **Fotos** hochgeladen werden:

- **Kamera-Button** in der Foto-Spalte öffnet Dateiauswahl/Kamera
- **iPad-Kamera**: `capture="environment"` aktiviert direkte Kameraaufnahme
- **Speicherort**: Google Cloud Storage (privater Bucket `gcs-private`)
- **Signierte URLs**: Fotos sind nur mit zeitlich begrenztem Link abrufbar (1 Std.)
- **Galerie-Ansicht**: Alle Fotos einer Behandlung in Modal anzeigen
- **Vollbild**: Klick auf Foto öffnet in voller Größe

**Wichtig:** Behandlung muss zuerst gespeichert werden, bevor Fotos hochgeladen werden können.

---

## 🔗 URL-Struktur

```
/hub/appointment/{branchId}/{appointmentId}/session/treatment-settings
```

### Zugang

Erreichbar über die **Unified Terminansicht** → Session-Grid → Kachel "Behandlungseinstellungen".

---

## 📁 Dateistruktur

```
resources/views/
├── hub/
│   └── appointment-unified/
│       ├── index.blade.php                 # Unified Terminansicht (mit View-Switching)
│       └── partials/
│           └── treatment-content.blade.php # Behandlungseinstellungen-Content
└── partials/
    └── body-zone-selector-treatment.blade.php  # Spezialisierte Körperzonen-Komponente

app/
├── Http/Controllers/
│   └── AppointmentViewController.php       # Controller (treatment-settings Routes)
└── Models/
    ├── TreatmentSetting.php               # Eloquent Model
    └── TreatmentSettingPhoto.php          # Foto-Model für Behandlungsfotos

database/migrations/
├── 2026_02_23_100000_create_treatment_settings_table.php
├── 2026_02_23_140313_add_custom_zone_name_to_treatment_settings_table.php
├── 2026_02_23_142037_make_body_zone_id_nullable_in_treatment_settings.php
└── 2026_02_23_154906_create_treatment_setting_photos_table.php
```

---

## 🗃️ Datenbank-Schema

### Tabelle: `treatment_settings`

```sql
CREATE TABLE `treatment_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- Termin-Referenz (Phorest)
    `phorest_appointment_id` VARCHAR(64) NOT NULL,
    `phorest_branch_id` VARCHAR(64) NOT NULL,
    `phorest_client_id` VARCHAR(64) NOT NULL,
    `phorest_staff_id` VARCHAR(64) NULL,
    
    -- Körperzone (nullable für benutzerdefinierte Zonen)
    `body_zone_id` BIGINT UNSIGNED NULL,
    `custom_zone_name` VARCHAR(100) NULL COMMENT 'Benutzerdefinierte Zone (z.B. Kinn)',
    
    -- Behandlungsnummer an dieser Zone (1, 2, 3...)
    `treatment_number` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    
    -- Geräteparameter
    `skintel` TINYINT UNSIGNED NULL COMMENT 'Skintel-Wert 0-100',
    `skin_type` TINYINT UNSIGNED NULL COMMENT 'Hauttyp I-VI (1-6), Fallback bei defektem Skintel',
    `machine_head` ENUM('large', 'small') NULL,
    `hair_color` ENUM('s', 'd', 'hb', 'b') NULL,
    `hair_thickness` ENUM('d', 'm', 'f') NULL,
    `hair_density` ENUM('d', 'm', 'nd') NULL,
    
    -- Empfohlene Einstellungen (vom Laser vorgeschlagen)
    `recommended_ms` SMALLINT UNSIGNED NULL,
    `recommended_jules_min` SMALLINT UNSIGNED NULL,
    `recommended_jules_max` SMALLINT UNSIGNED NULL,
    
    -- Tatsächlich genutzte Einstellungen
    `used_ms` SMALLINT UNSIGNED NULL,
    `used_jules` SMALLINT UNSIGNED NULL,
    
    -- Notizen
    `notes` TEXT NULL,
    
    -- Meta
    `created_by_user_id` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    
    PRIMARY KEY (`id`),
    INDEX (`phorest_appointment_id`),
    INDEX (`phorest_branch_id`),
    INDEX (`phorest_client_id`),
    INDEX (`phorest_staff_id`),
    UNIQUE KEY (`phorest_appointment_id`, `body_zone_id`),
    FOREIGN KEY (`body_zone_id`) REFERENCES `body_zones` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
```

### Enum-Werte

| Feld | Wert | Bedeutung |
|------|------|-----------|
| `machine_head` | `large` | Großer Maschinenkopf |
| | `small` | Kleiner Maschinenkopf |
| `hair_color` | `s` | Schwarz |
| | `d` | Dunkel |
| | `hb` | Hellbraun |
| | `b` | Blond |
| `hair_thickness` | `d` | Dick |
| | `m` | Mittel |
| | `f` | Fein |
| `hair_density` | `d` | Dicht |
| | `m` | Mittel |
| | `nd` | Nicht dicht |

### Tabelle: `treatment_setting_photos`

```sql
CREATE TABLE `treatment_setting_photos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `treatment_setting_id` BIGINT UNSIGNED NOT NULL,
    
    -- Datei-Informationen
    `file_path` VARCHAR(500) NOT NULL,
    `disk` VARCHAR(50) NOT NULL DEFAULT 'gcs-private',
    `original_filename` VARCHAR(255) NULL,
    `mime_type` VARCHAR(50) NULL,
    `file_size` INT UNSIGNED NULL,
    
    -- Optional: Beschreibung
    `caption` VARCHAR(255) NULL,
    `sort_order` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    
    -- Meta
    `uploaded_by_user_id` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    
    PRIMARY KEY (`id`),
    INDEX (`treatment_setting_id`),
    FOREIGN KEY (`treatment_setting_id`) REFERENCES `treatment_settings` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
```

**Storage:**
- **Produktion**: Google Cloud Storage privater Bucket (`gcs-private`)
- **Lokal**: `storage/app/public` (`public` disk)
- **Pfad**: `treatment-photos/{client_id}/{uuid}.{extension}`

---

## 🎨 UI-Komponenten

### Körpergrafik (Body Zone Selector Treatment)

Eine spezialisierte Variante der Körperzonen-Komponente:

```blade
@include('partials.body-zone-selector-treatment', [
    'configuredZones' => ['achseln', 'bikini'],  // Bereits konfigurierte Zonen
])
```

**Unterschiede zur Standard-Komponente:**
- Alle Zonen (inkl. Gesicht) sind wählbar
- Buttons statt Checkboxen
- Klick öffnet Modal (kein Multi-Select)
- Visuelle Markierung für konfigurierte Zonen (grün)
- Benutzerdefinierte Zonen können hinzugefügt werden

**Events:**
| Event | Payload | Beschreibung |
|-------|---------|--------------|
| `treatment-zone-clicked` | `{ zoneKey, zoneName, zoneImage, isCustom }` | Zone wurde geklickt |
| `update-configured-zones` | `{ zones: string[] }` | Konfigurierte Zonen aktualisieren |
| `update-custom-zones` | `{ zones: Array }` | Custom-Zonen aktualisieren (inkl. treatmentCount) |
| `update-zone-treatment-counts` | `{ counts: Object }` | Behandlungszähler pro Zone |
| `custom-zone-added` | `{ key, name, isCustom }` | Benutzerdefinierte Zone hinzugefügt |
| `custom-zone-removed` | `{ key }` | Benutzerdefinierte Zone entfernt |

### Benutzerdefinierte Zonen

Für kleine Bereiche, die nicht auf der Körpergrafik sind:

- **Freitext-Eingabe** unter "Weitere Zonen"
- Hinzufügen per Enter oder Plus-Button
- Sofortiges Öffnen des Einstellungsformulars
- Löschen per X-Button
- Werden bei nächstem Laden wiederhergestellt (wenn gespeichert)

**Beispiele:** Kinn, Oberlippe, Augenbrauen, Zehen, Ohrläppchen

### Einstellungsformular (Modal)

Touch-optimiertes Modal mit **Behandlungstabelle**:

**Header:**
- Zonenname + Behandlungsnummer
- Schließen-Button (X)

**Historie-Tabelle mit Spalten (Reihenfolge nach Vorgabe der Fachabteilung, 07/2026); die aktuelle Sitzung wird darunter als geführtes Gruppen-Formular in derselben Reihenfolge erfasst (siehe oben):**
| Spalte | Beschreibung |
|--------|-------------|
| Sitz. | Sitzungsnummer |
| MA | Mitarbeiter (automatisch aus dem Phorest-Termin, readonly) |
| Kopf | Maschinenkopf (G/K Buttons) |
| Skintel/Typ | Skintel-Wert (0-100, numerisch) **oder** Hauttyp I–VI (Dropdown, Fallback bei defektem Skintel) |
| Haarfarbe | Dropdown (Blond/Hellbraun/Dunkelbraun/Schwarz) |
| Dicke | Dropdown (Fein/Mittel/Dick) |
| Dichte | Dropdown (Niedrig/Mittel/Hoch) |
| Empf. ms | Empfohlene Millisekunden (numerisch) |
| J-Range | Empfohlene Joule min–max (zwei Felder) |
| Genutzte ms | Genutzte ms (numerisch, hervorgehoben) |
| Genutzte Joule | Genutzte Joule (numerisch, hervorgehoben, mit Red-Flag-Warnung) |
| Notizen | Freitextfeld |

**Behandlungshistorie:**
- Alle vorherigen Sitzungen werden als readonly-Zeilen angezeigt
- Aktuelle Sitzung ist die letzte editierbare Zeile
- Genutzte Werte (ms, Joule) werden farblich hervorgehoben
- DB-Spalten heißen historisch weiterhin `used_jules` etc. — nur die UI-Labels wurden auf „Joule" korrigiert

---

## 🔧 Controller-Methoden

### `sessionTreatmentSettings()`
Rendert die Hauptansicht.

```php
Route::get('/appointment/{branchId}/{appointmentId}/session/treatment-settings', 
    [AppointmentViewController::class, 'sessionTreatmentSettings']);
```

### `getTreatmentSettingsData()`
Liefert alle Daten per AJAX.

```php
Route::get('/appointment/{branchId}/{appointmentId}/session/treatment-settings/data', 
    [AppointmentViewController::class, 'getTreatmentSettingsData']);
```

**Response:**
```json
{
    "success": true,
    "data": {
        "appointment": { "id", "branchId", "clientId", "staffId" },
        "existingSettings": { ... },        // Bereits erfasste Einstellungen (aktueller Termin)
        "bodyZones": [ ... ],               // Alle aktiven Körperzonen
        "treatmentHistory": { ... },        // Alle vergangenen Behandlungen pro Zone (Array)
        "previouslyTreatedZones": [ ... ],  // Zonen aus früheren Terminen (mit Metadaten)
        "clientCustomZones": [ ... ],       // Alle Custom-Zonen des Kunden (gruppiert)
        "zoneTreatmentCounts": { ... },     // Anzahl Behandlungen pro Zone
        "treatmentNumbers": { ... },        // Nächste Behandlungsnummer pro Zone
        "options": {
            "hairColors": { "s": "Schwarz", ... },
            "hairThickness": { "d": "Dick", ... },
            "hairDensity": { "d": "Dicht", ... },
            "machineHeads": { "large": "Groß", "small": "Klein" }
        }
    }
}
```

### Neue Response-Felder

#### `treatmentHistory`
Alle vergangenen Behandlungen pro Zone als Array (für Tabellenanzeige):
```json
{
    "gesicht": [
        { "treatment_number": 1, "skintel": 10, "used_ms": 100, ... },
        { "treatment_number": 2, "skintel": 12, "used_ms": 95, ... }
    ]
}
```

#### `clientCustomZones`
Custom-Zonen des Kunden (aus allen Terminen):
```json
[
    { "key": "custom_zehen", "name": "Zehen", "isCustom": true, "treatmentCount": 2 },
    { "key": "custom_kinn", "name": "Kinn", "isCustom": true, "treatmentCount": 1 }
]
```

#### `zoneTreatmentCounts`
Anzahl der Behandlungen pro Standard-Zone:
```json
{
    "gesicht": 2,
    "brust": 1,
    "achseln": 3
}
```

### `saveTreatmentSettings()`
Speichert Einstellungen.

```php
Route::post('/appointment/{branchId}/{appointmentId}/session/treatment-settings', 
    [AppointmentViewController::class, 'saveTreatmentSettings']);
```

**Request Body:**
```json
{
    "settings": [{
        "body_zone_id": 5,           // Oder null bei custom zone
        "custom_zone_name": "Kinn",  // Nur bei benutzerdefinierten Zonen
        "treatment_number": 1,
        "skintel": 42,
        "machine_head": "large",
        "hair_color": "d",
        "hair_thickness": "m",
        "hair_density": "m",
        "recommended_ms": 100,
        "recommended_jules_min": 20,
        "recommended_jules_max": 40,
        "used_ms": 80,
        "used_jules": 35,
        "notes": "Leichte Rötung"
    }]
}
```

### Foto-API-Routen

```php
// Foto hochladen
Route::post('/treatment-settings/{treatmentSettingId}/photos', 
    [AppointmentViewController::class, 'uploadTreatmentPhoto']);

// Fotos einer Behandlung abrufen
Route::get('/treatment-settings/{treatmentSettingId}/photos', 
    [AppointmentViewController::class, 'getTreatmentPhotos']);

// Foto löschen
Route::delete('/treatment-settings/photos/{photoId}', 
    [AppointmentViewController::class, 'deleteTreatmentPhoto']);

// Foto anzeigen (signierte URL Redirect)
Route::get('/treatment-settings/photos/{photoId}/view', 
    [AppointmentViewController::class, 'viewTreatmentPhoto']);
```

**Upload Request:**
- `photo`: File (max 10MB, Bildformate)
- `caption`: Optional (string, max 255 Zeichen)

**Response (getTreatmentPhotos):**
```json
{
    "success": true,
    "data": [{
        "id": 1,
        "file_path": "treatment-photos/abc123/photo.jpg",
        "original_filename": "IMG_1234.jpg",
        "mime_type": "image/jpeg",
        "file_size_human": "2.5 MB",
        "thumbnail_url": "https://...",  // Signierte URL (1 Std.)
        "url": "https://...",            // Signierte URL (1 Std.)
        "created_at": "2026-02-23T12:00:00Z"
    }]
}
```

---

## 🔄 Behandlungsnummerierung

Die Behandlungsnummer wird **automatisch** berechnet:

- Pro **Kunde** und **Körperzone** (oder `custom_zone_name`)
- Zählt alle vergangenen Termine hoch
- Beim ersten Termin einer Zone: Behandlung #1
- Bei jedem weiteren Termin: Behandlung #N+1

**Implementierung:**
```php
// TreatmentSetting::getNextTreatmentNumber($clientId, $bodyZoneId)
TreatmentSetting::where('phorest_client_id', $clientId)
    ->where('body_zone_id', $bodyZoneId)
    ->max('treatment_number') + 1
```

---

## 📱 Tablet-Optimierung

Alle UI-Elemente sind für Touch ohne Tastatur optimiert:

| Element | Mindestgröße | Hinweis |
|---------|--------------|---------|
| Option-Buttons | 48px Höhe | Google/Apple Richtlinie |
| Input-Felder | 52px Höhe | Einfaches Tippen |
| Close-Button | 48x48px | Großes Tap-Target |
| Speichern-Button | 52px Höhe | Gut erreichbar |

**Weitere Anpassungen:**
- Schriftgrößen erhöht (1rem statt 0.875rem)
- Modal-Breite: **1400px** (für Behandlungstabelle)
- Größere Abstände zwischen Elementen
- Numerische Eingaben mit `inputmode="numeric" pattern="[0-9]*"` für Zahlentastatur
- Kein Körperzonen-Bild im Modal-Header (nur Zonenname)

---

## 🔗 Verwandte Dokumentation

- [APPOINTMENT-VIEW.md](APPOINTMENT-VIEW.md) - Terminansicht
- [BODY-ZONE-SELECTOR.md](BODY-ZONE-SELECTOR.md) - Körperzonen-Komponente
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) - GLATTT Design System

---

## 📝 SQL für Cloud-Deployment

Komplettes SQL zum Anlegen der Tabelle in der Cloud-Datenbank:

```sql
-- Behandlungseinstellungen: Laser-Einstellungen pro Termin und Körperzone
CREATE TABLE IF NOT EXISTS `treatment_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- Termin-Referenz (Phorest)
    `phorest_appointment_id` VARCHAR(64) NOT NULL,
    `phorest_branch_id` VARCHAR(64) NOT NULL,
    `phorest_client_id` VARCHAR(64) NOT NULL,
    `phorest_staff_id` VARCHAR(64) NULL COMMENT 'Laser-Spezialist',
    
    -- Körperzone (nullable für benutzerdefinierte Zonen)
    `body_zone_id` BIGINT UNSIGNED NULL,
    `custom_zone_name` VARCHAR(100) NULL COMMENT 'Name für benutzerdefinierte kleine Körperzonen (z.B. Kinn, Oberlippe)',
    
    -- Behandlungsnummer an dieser Zone (1, 2, 3...)
    `treatment_number` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    
    -- Geräteparameter
    `skintel` TINYINT UNSIGNED NULL COMMENT 'Skintel-Wert 0-100',
    `skin_type` TINYINT UNSIGNED NULL COMMENT 'Hauttyp I-VI (1-6), Fallback bei defektem Skintel',
    `machine_head` ENUM('large', 'small') NULL COMMENT 'Maschinenkopf: groß oder klein',
    `hair_color` ENUM('s', 'd', 'hb', 'b') NULL COMMENT 'Haarfarbe: s=schwarz, d=dunkel, hb=hellbraun, b=blond',
    `hair_thickness` ENUM('d', 'm', 'f') NULL COMMENT 'Haardicke: d=dick, m=mittel, f=fein',
    `hair_density` ENUM('d', 'm', 'nd') NULL COMMENT 'Haardichte: d=dicht, m=mittel, nd=nicht dicht',
    
    -- Empfohlene Einstellungen (vom Laser vorgeschlagen)
    `recommended_ms` SMALLINT UNSIGNED NULL COMMENT 'Empfohlene Millisekunden',
    `recommended_jules_min` SMALLINT UNSIGNED NULL COMMENT 'Empfohlene Jules MIN',
    `recommended_jules_max` SMALLINT UNSIGNED NULL COMMENT 'Empfohlene Jules MAX',
    
    -- Tatsächlich genutzte Einstellungen
    `used_ms` SMALLINT UNSIGNED NULL COMMENT 'Genutzte Millisekunden',
    `used_jules` SMALLINT UNSIGNED NULL COMMENT 'Genutzte Jules',
    
    -- Notizen
    `notes` TEXT NULL,
    
    -- Meta
    `created_by_user_id` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    
    PRIMARY KEY (`id`),
    INDEX `treatment_settings_appointment_idx` (`phorest_appointment_id`),
    INDEX `treatment_settings_branch_idx` (`phorest_branch_id`),
    INDEX `treatment_settings_client_idx` (`phorest_client_id`),
    INDEX `treatment_settings_staff_idx` (`phorest_staff_id`),
    UNIQUE KEY `treatment_settings_appointment_zone_unique` (`phorest_appointment_id`, `body_zone_id`),
    CONSTRAINT `treatment_settings_body_zone_fk` FOREIGN KEY (`body_zone_id`) REFERENCES `body_zones` (`id`) ON DELETE CASCADE,
    CONSTRAINT `treatment_settings_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
