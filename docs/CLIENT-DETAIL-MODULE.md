# Kundenprofil (Client Detail)

## Nutzerdokumentation

### Übersicht

Das Kundenprofil zeigt alle relevanten Informationen zu einem Kunden in einem Sidebar-Tab-Layout. Daten werden per Lazy-Loading erst geladen, wenn der jeweilige Tab aktiviert wird.

### Layout

**Desktop (≥ 1024px):** Vertikale Sidebar-Navigation links, Content-Bereich rechts. Die Sidebar ist sticky und scrollt mit.

**Mobile (< 1024px):** Horizontale Tab-Leiste oben mit horizontalem Scrolling (identisches Verhalten wie zuvor).

### Tabs

| Tab | Beschreibung |
|-----|-------------|
| **Übersicht** | Das Wichtigste aus allen Unterseiten — eine Karte je Tab im 2×3-Raster |
| **Kundeninfos** | Erweiterte Kundeninformationen |
| **Termine** | Vergangene und zukünftige Termine aus Phorest |
| **glattt Pakete** | Gebuchte Pakete und Kurse |
| **Dokumente** | Eingereichte Formulare mit Detailansicht |
| **Behandlungseinstellungen** | Laser-Parameter pro Körperzone als Historie |
| **Zahlungen** | GoCardless-Zahlungen und SEPA-Mandate |
| **Forderungsmanagement** | Offene Forderungen |
| **Kundenservice** | Service-Anfragen und Notizen |

---

### Übersicht-Tab (Karten-Raster)

Die Übersicht zeigt das Wichtigste aus allen Unterseiten als **sechs Karten im
2×3-Raster** (mobil einspaltig); jede Karte springt über „Öffnen" in ihren Tab:

1. **Kundeninfos** — Kontakt, Adresse, Geburtsdatum, „Kunde seit", Einwilligungs-Badges
2. **Termine** — nächster Termin prominent, letzter Termin, Zähler kommend/vergangen (Stat-Strip)
3. **glattt Pakete** — aktive Pakete mit Einheiten-Fortschrittsbalken
4. **Vertrag & Zahlungen** — aktiver Vertrag (Paket, Status, Rate, Zahlart) plus
   roter Hinweis auf **offene Forderungen** (springt ins Forderungsmanagement)
5. **Behandlung** — letzte Behandlung (Datum, Zone, Mitarbeiterin), Zonen-/Behandlungszähler
6. **Dokumente & Kommunikation** — letzte Formulare, letzte WhatsApp, letztes Zendesk-Ticket

**Für Entwickler:** `partials/overview.blade.php` + `loadOverview()` in
`clientDetailPage()`. Die Übersicht nutzt die **bestehenden Tab-Loader**
(Pakete, Dokumente, Behandlungseinstellungen — Tabs sind danach schon geladen)
und holt Verträge/Forderungen/Zendesk/Superchat über dieselben Endpoints wie
die Tab-Partials in eigene `overview*`-Stores (die Tab-Partials kapseln ihren
Zustand lokal und sind von außen nicht erreichbar). Karten zeigen
`<x-stat-skeleton type="list">` beim Laden; Styles unter „CLIENT-OVERVIEW"
in `theme_glattt.css`. Test: `tests/Feature/ClientOverviewPartialTest.php`.

### Kundeninfos-Tab (Bearbeiten & Feld-Schloss)

Der Tab zeigt die mit Phorest synchronisierten Stammdaten (Notizen, persönliche
Daten, Kontakt, Adresse, Marketing-Einwilligungen). Alle Felder sind zunächst
**gesperrt** und tragen ein kleines **Schloss-Symbol** rechts im Feld — die
Felder selbst sehen dabei aus wie normale Felder (kein Ausgrauen). Bei Hover
über dem Schloss und beim Klick in ein gesperrtes Feld erscheint ein Tooltip
„Zum Entsperren gedrückt halten".

**Entsperren — je Feld oder alle auf einmal:**

1. **Schloss an einem Feld gedrückt halten**: Um das Schloss schließt sich ein
   Fortschrittsring (~1 Sekunde); danach öffnet es sich in einer kurzen
   Animation — **nur dieses Feld** wird bearbeitbar und zeigt ein grünes,
   offenes Schloss. Ein Klick auf das offene Schloss sperrt das Feld wieder
   (und verwirft eine ungespeicherte Änderung). Ein kurzer Klick auf das
   geschlossene Schloss entsperrt bewusst nicht und zeigt den Hinweis-Toast.
2. **„Alle Felder entsperren"** oben rechts entsperrt alle Felder auf einmal.

**Speichern:**

- Sobald ein entsperrtes Feld geändert wird, ersetzen **Haken** (Änderung
  speichern) und **X** (Änderung verwerfen und sperren) das Schloss direkt im
  Feld. Der Haken speichert **genau dieses eine Feld** sofort nach Phorest —
  ohne Bestätigungs-Dialog; das Feld wird danach wieder gesperrt.
- Sobald mindestens ein Feld entsperrt ist, sitzen oben rechts **Abbrechen**
  (alles verwerfen und sperren) und **Änderungen speichern** (alle geänderten
  Felder mit Bestätigungs-Dialog speichern, wie bisher).

Beide Wege gleichen mit Phorest ab (`PUT /phorest/client/{id}`).
Erfolgs- und Fehlermeldungen erscheinen als **Toast unten rechts** (nicht mehr
als Banner oben — der wurde übersehen). Die **E-Mail-Adresse wird schon beim
Tippen validiert**: ungültiges Format markiert das Feld rot, zeigt eine
Meldung darunter und deaktiviert den Speichern-Haken bzw. blockiert das
Sammelspeichern.

**Für Entwickler:**

- Schloss-Komponente: `resources/views/components/field-lock.blade.php` —
  wiederverwendbar; bekommt den Feld-Schlüssel als Prop (`field="firstName"`)
  und erwartet die Feld-Sperr-API im umgebenden Alpine-Scope: `fieldUnlocked`,
  `unlockField`, `lockField`, `fieldDirty`, `saveField`, `savingField`
  (implementiert in `clientDetailPage()`). Haltezeit 900 ms — muss zur
  CSS-Transition des Rings passen.
- Einzelfeld-Speichern (`saveField`): sendet die Phorest-Pflichtfelder
  (`clientId`, `version`, `firstName`, `lastName`) **plus genau das eine
  geänderte Feld** — für Vor-/Nachname bewusst den gespeicherten Stand, damit
  ungespeicherte Änderungen anderer Felder nicht mitrutschen. Nach Erfolg wird
  die `version` aus der Antwort übernommen (Optimistic Locking) und der lokale
  `client`-Stand nachgezogen, ohne die Seite neu zu laden.
- Styles: `theme_glattt.css`, Abschnitt „FIELD-LOCK" — Varianten `-static`
  (läuft in Flex-Zeilen wie Toggles mit; bewusst `position: relative`, damit
  der absolut positionierte Ring im Button verankert bleibt), `-top`
  (Textareas), `-host` (Bezugsrahmen für Container ohne eigene
  Positionierung). Der Fortschrittsring ist ein SVG-Kreis mit
  `pathLength="100"` und `stroke-dashoffset`-Transition.
- Tooltip: generisches `data-tooltip`-Muster des Themes; die Klasse
  `tooltip-visible-glattt` erzwingt ihn programmatisch. Der Klick in ein
  gesperrtes Feld landet auf dem Feld-Wrapper
  (`handleLockedFieldClick($event)` — auf disabled/pointer-events-none
  Elementen feuern Handler nicht) und feuert ein `field-lock-hint`-Event auf
  das Schloss des Feldes.
- Absicherung: `tests/Feature/ClientInfoPartialTest.php` prüft zusätzlich,
  dass im gerenderten Partial kein Attribut-Code als sichtbarer Text steht
  (Regression eines Markup-Bugs: verlorenes öffnendes `<button`-Tag ließ
  `@click="cancelEdit()" …` im Frontend erscheinen, behoben 08/2026).

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

#### Sidebar-Tab-Layout

Das Layout verwendet das `tabs-glattt-layout` CSS-System aus `theme_glattt.css`:

```html
<div class="tabs-glattt-layout">
    <nav class="tabs-glattt-sidebar">
        <button class="tab-glattt-sidebar active">Übersicht</button>
        <button class="tab-glattt-sidebar">Kundeninfos</button>
        <!-- ... -->
    </nav>
    <div class="tabs-glattt-content">
        <!-- Tab-Inhalte -->
    </div>
</div>
```

**CSS-Klassen (in `theme_glattt.css`):**

| Klasse | Beschreibung |
|--------|-------------|
| `tabs-glattt-layout` | Flex-Container: column (mobil) / row (desktop) |
| `tabs-glattt-sidebar` | Nav-Container mit Glass-Morphism, horizontal (mobil) / vertikal sticky (desktop, 220px breit) |
| `tab-glattt-sidebar` | Einzelner Tab-Button mit Hover/Active-States |
| `tabs-glattt-content` | Content-Bereich (flex: 1) |

**Responsive Verhalten:**
- **< 1024px:** Horizontale Scrollbar-Tabs, identisch mit `tabs-glattt`
- **≥ 1024px:** Vertikale Sidebar, sticky (`top: 5rem`), max-height mit Overflow-Scroll

#### Tab-System (Alpine.js)

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

## Tab „Nachrichten" (seit 28.08.2026, vorher „WhatsApp")

**Für Endanwender:** Der Tab zeigt oben die **Timeline aller automatisch
versendeten Nachrichten** an den Kunden — Beratungs-WhatsApp (inkl.
SMS/RCS-Fallback), Terminerinnerungen, Bewertungslink,
Zufriedenheitsbefragung und System-E-Mails — mit Datum, Kanal, Status und,
wo verfügbar, **Zustell-/Lesebestätigung** („Gelesen 28.08. 10:05"). Klick
auf eine Zeile klappt den Nachrichtentext auf. Darunter wie bisher die
Superchat-Konversationen mit Composer.

**Für Entwickler:**

- Endpoint `GET /phorest/client/{clientId}/messages?email=…`
  (`ClientMessagesController`, Recht `view_client_detail`): aggregiert
  `consultation_whatsapp_logs`, `appointment_reminder_logs`,
  `review_whatsapp_logs`, `satisfaction_surveys` (je `client_id`) und
  `email_logs` (über die E-Mail-Adresse; deckt auch SEPA-/Gutschein-Mails
  ab), sortiert absteigend, max. 200 Einträge.
- Lese-/Zustellstatus: WhatsApp über `SuperchatMessageAnalyticsService`
  (Message-Analytics, 15 Min Cache, Batch 50); Twilio-Nachrichten über die
  Status-Callback-Spalten der Erinnerungs-Logs (`delivery_status`,
  `delivered_at`, `read_at` — Lesebestätigung nur bei RCS).
- UI: Timeline-Komponente am Kopf von
  `resources/views/hub/clients/partials/whatsapp.blade.php` (eigener
  Alpine-Scope, lädt beim ersten Öffnen des Tabs); Tab-Label in
  `detail.blade.php` (`id` bleibt `whatsapp`).
- Grenze: Für den SMS/RCS-Fallback der Beratungs-WhatsApp gibt es noch kein
  Zustell-Tracking (nur Versandstatus).
- Tests: `tests/Feature/ClientMessagesTimelineTest.php`.
