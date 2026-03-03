# Kundenprofil (Client Detail)

## Nutzerdokumentation

### Übersicht

Das Kundenprofil zeigt alle relevanten Informationen zu einem Kunden in einem Tab-basierten Layout. Daten werden per Lazy-Loading erst geladen, wenn der jeweilige Tab aktiviert wird.

### Tabs

| Tab | Beschreibung |
|-----|-------------|
| **Übersicht** | Stammdaten, Kontaktinfos, Phorest-Daten |
| **Kundeninfos** | Erweiterte Kundeninformationen |
| **Termine** | Vergangene und zukünftige Termine aus Phorest |
| **glattt Pakete** | Gebuchte Pakete und Kurse |
| **Dokumente** | Eingereichte Formulare mit Detailansicht |
| **Behandlungseinstellungen** | Laser-Parameter pro Körperzone als Historie |
| **Zahlungen** | GoCardless-Zahlungen und SEPA-Mandate |
| **Forderungsmanagement** | Offene Forderungen |
| **Kundenservice** | Service-Anfragen und Notizen |

---

### Dokumente-Tab

Zeigt alle vom Kunden eingereichten Formulare (z.B. Aufklärungsbögen, Verträge).

**Funktionen:**
- Liste aller eingereichten Formulare mit Name, Datum und Status
- Klick auf einen Eintrag öffnet ein Modal mit der vollständigen Einreichung
- Unterschriften werden inline angezeigt und passen sich automatisch an Dark/Light Mode an (SVG-Format)
- Markdown-Formatierung (**fett**, __unterstrichen__) wird korrekt dargestellt

### Behandlungseinstellungen-Tab

Zeigt die gesamte Laser-Behandlungshistorie des Kunden geordnet nach Körperzonen.

**Layout:**
- **Oben:** Interaktive Körperzonen-Grafik (links) mit Zone-Buttons (rechts)
- **Unten:** Behandlungstabelle über die volle Breite

**Körperzonen-Grafik:**
- Klick auf eine Zone in der Grafik oder auf einen Button öffnet die zugehörige Tabelle
- Nur Zonen mit vorhandenen Behandlungen werden angezeigt
- Behandlungszähler-Badges ("1x", "2x") zeigen die Anzahl bisheriger Behandlungen
- Benutzerdefinierte Zonen (z.B. "Zehen") werden automatisch aus früheren Terminen geladen

**Behandlungstabelle:**

| Spalte | Beschreibung |
|--------|-------------|
| Datum | Termin-Datum aus Phorest (nicht Datenbank-Timestamp) |
| MA | Mitarbeitername aus Phorest (Vorname + Nachname) |
| # | Behandlungsnummer an dieser Zone |
| Skintel | Skintel-Messwert (0-100) |
| Kopf | Maschinenkopf (Groß/Klein) |
| Haarfarbe | Schwarz / Dunkel / Hellbraun / Blond |
| Dicke | Dick / Mittel / Fein |
| Dichte | Dicht / Mittel / Nicht dicht |
| Empf. ms | Empfohlene Millisekunden |
| Empf. J | Empfohlene Jules (Min-Max) |
| ms | Tatsächlich genutzte Millisekunden |
| Jules | Tatsächlich genutzte Jules |
| Notizen | Freitext-Notizen |
| Fotos | Klick öffnet Foto-Galerie (sofern vorhanden) |

**Foto-Galerie:**
- Vollbild-Modal mit Navigation (Prev/Next)
- Thumbnail-Leiste unterhalb des Hauptfotos
- Bildunterschrift mit Dateiname

---

## Entwicklerdokumentation

### Dateistruktur

```
resources/views/hub/clients/
├── detail.blade.php                          # Hauptseite mit Tab-System
└── partials/
    ├── overview.blade.php                    # Tab: Übersicht
    ├── packages.blade.php                    # Tab: glattt Pakete
    ├── documents.blade.php                   # Tab: Dokumente
    ├── treatment-settings.blade.php          # Tab: Behandlungseinstellungen
    └── submission.blade.php                  # (Formular-Einreichung Detail)

app/Http/Controllers/
├── AppointmentViewController.php             # getClientTreatmentSettings()
└── FormController.php                        # Formular-Einreichungen API

routes/web.php                                # Route-Definitionen
```

### Architektur

#### Tab-System

Das Tab-System ist vollständig in Alpine.js implementiert (`clientDetailPage()` in `detail.blade.php`):

```js
tabs: [
    { id: 'overview', name: 'Übersicht', visible: true, permission: '...' },
    { id: 'documents', name: 'Dokumente', visible: true, permission: '...' },
    { id: 'treatment-settings', name: 'Behandlungseinstellungen', visible: true, permission: '...' },
    // ...
],
activeTab: 'overview',
```

#### Lazy Loading

Daten werden erst beim Tab-Wechsel geladen, um die initiale Ladezeit kurz zu halten:

```js
$watch('activeTab', (newTab) => {
    if (newTab === 'documents' && !this.documentsLoaded) this.loadDocuments();
    if (newTab === 'treatment-settings' && !this.treatmentSettingsLoaded) this.loadTreatmentSettings();
    // ...
});
```

Jeder Tab hat ein `*Loaded`-Flag, damit Daten nur einmal geladen werden.

#### State-Variablen für Behandlungseinstellungen

In `detail.blade.php` → `clientDetailPage()`:

```js
treatmentsByZone: {},              // { zone_key: [treatment, ...] }
treatmentSettingsOptions: {},      // { hairColors, hairThickness, hairDensity, machineHeads }
treatmentSettingsLoading: false,
treatmentSettingsLoaded: false,
```

### API-Endpunkt: Behandlungseinstellungen

**Route:**
```
GET /hub/treatment-settings/client/{clientId}
```

**Controller:** `AppointmentViewController::getClientTreatmentSettings(string $clientId)`

**Ablauf:**
1. Alle Body Zones laden (`BodyZone::where('is_active', true)`)
2. Alle Treatments des Kunden laden (`TreatmentSetting::where('phorest_client_id', ...)`)
3. **Phorest-API-Aufrufe (dedupliziert):**
   - Unique `phorest_appointment_id`s → `getAppointment()` → `appointmentDate` extrahieren
   - Unique `phorest_staff_id`s → `getStaffMember()` → `firstName + lastName` extrahieren
4. `appointment_date` und `staff_name` an jede Behandlung anhängen
5. Treatments nach Zone-Key gruppieren (mit Umlaut-Normalisierung für Custom Zones)
6. Response: `treatmentsByZone`, `previouslyTreatedZones`, `clientCustomZones`, `zoneTreatmentCounts`, `options`

**Wichtig:** Die Phorest-API-Aufrufe werden dedupliziert — wenn 10 Behandlungen vom selben Termin stammen, wird nur 1x `getAppointment()` aufgerufen. Dasselbe gilt für `getStaffMember()`.

**Response-Format:**
```json
{
    "success": true,
    "data": {
        "treatmentsByZone": {
            "gesicht": [
                {
                    "id": 1,
                    "treatment_number": 1,
                    "skintel": 10,
                    "appointment_date": "2026-02-23",
                    "staff_name": "Eléen Mendel",
                    "photos_count": 2,
                    ...
                }
            ]
        },
        "previouslyTreatedZones": [...],
        "clientCustomZones": [...],
        "zoneTreatmentCounts": { "gesicht": 1, "brust": 1 },
        "options": {
            "hairColors": { "s": "Schwarz", "d": "Dunkel", ... },
            "hairThickness": { "d": "Dick", "m": "Mittel", "f": "Fein" },
            "hairDensity": { "d": "Dicht", "m": "Mittel", "nd": "Nicht dicht" },
            "machineHeads": { "large": "Groß", "small": "Klein" }
        }
    }
}
```

### Treatment-Settings Partial

**Datei:** `resources/views/hub/clients/partials/treatment-settings.blade.php`

**Alpine-Komponent-Scope:** Nested innerhalb von `clientDetailPage()`, greift auf Parent-State zu:

```js
x-data="{
    selectedZoneKey: null,
    selectedZoneName: '',
    zoneHistory: [],
    get options() { return this.treatmentSettingsOptions || {}; },
    selectZone(zoneKey, zoneName) { ... },
    viewPhotos(treatmentId, treatmentNumber) { ... },
}"
```

**Layout (CSS):**

```
.client-treatment-layout (flex-column)
├── .client-treatment-top
│   └── body-zone-selector-treatment (CSS grid: auto 1fr)
│       ├── .body-zone-graphic (280×230px, overflow hidden)
│       └── .body-zone-buttons (auto-fill grid, min 140px)
└── .client-treatment-bottom
    └── .table-glattt.table-glattt-sm (14 Spalten)
```

**Zone-Filterung:** Nur behandelte Zonen werden angezeigt:
```css
.client-treatment-top .body-zone-button:not(.previously-treated) { display: none; }
.client-treatment-top .body-zone-button-category:not(:has(.body-zone-button.previously-treated)) { display: none; }
```

**Events:** `loadTreatmentSettings()` dispatched drei Events an die Body-Zone-Selector-Komponente:
- `update-previously-treated-zones` → markiert Zonen als behandelt
- `update-zone-treatment-counts` → setzt Behandlungszähler-Badges
- `update-custom-zones` → fügt benutzerdefinierte Zonen hinzu

### Dokumente-Tab (documents.blade.php)

**API:** `GET /api/forms/submission/{submissionId}` 

**Unterschriften-Anzeige im Modal:**
- SVG-Signaturen: Inline `x-html` mit `currentColor` → passt sich automatisch an Dark/Light Mode an
- PNG-Signaturen (Legacy): `<img>` mit URL
- SVG-Dimensionen werden per `x-init` korrigiert: `width: 100%`, `height: auto`, `width`/`height`-Attribute entfernt

### Umlaut-Normalisierung für Zone-Keys

Custom Zones verwenden einen normalisierten Key (Frontend und Backend identisch):

```php
$key = 'custom_' . strtolower($treatment->custom_zone_name);
$key = str_replace(['ä', 'Ä'], 'ae', $key);
$key = str_replace(['ö', 'Ö'], 'oe', $key);
$key = str_replace(['ü', 'Ü'], 'ue', $key);
$key = str_replace('ß', 'ss', $key);
$key = preg_replace('/[^a-z0-9]/', '_', $key);
```

Beispiel: "Zehen" → `custom_zehen`, "Füße" → `custom_fuesse`

### CSS-Includes

Die Treatment-Settings-Styles sind komplett inline im Partial (`<style>`-Block), da sie nur dort benötigt werden. Die Body-Zone-Selector-CSS wird per `@push('head')` geladen:

```blade
{{-- In detail.blade.php --}}
@push('head')
    <link rel="stylesheet" href="{{ asset('css/components/body-zone-selector.css') }}?v={{ time() }}">
@endpush
```

---

## Verwandte Dokumentation

- [TREATMENT-SETTINGS.md](TREATMENT-SETTINGS.md) — Behandlungseinstellungen (Termin-Session-Ansicht)
- [BODY-ZONE-SELECTOR.md](BODY-ZONE-SELECTOR.md) — Körperzonen-Komponente
- [FORM-EDITOR.md](FORM-EDITOR.md) — Formular-Editor und -Ausfüllung
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) — DS-Klassen (`table-glattt`, `card-glattt`, etc.)

---

**Erstellt:** Februar 2026  
**Betroffene Dateien:**
- `resources/views/hub/clients/detail.blade.php`
- `resources/views/hub/clients/partials/documents.blade.php`
- `resources/views/hub/clients/partials/treatment-settings.blade.php`
- `app/Http/Controllers/AppointmentViewController.php`
- `routes/web.php`
