# Kundenprofil (Client Detail)

Das Kundenprofil (`/hub/clients/{clientId}`) bündelt alles zu einer Kundin in einem
Sidebar-Tab-Layout mit zehn Reitern: Stammdaten aus Phorest (bearbeitbar über das
Feld-Schloss), Termine, glattt-Pakete, eingereichte Formulare, Behandlungshistorie je
Körperzone, Vertrag und Zahlungen, Forderungen, Zendesk-Tickets und die Nachrichten-Timeline
mit Superchat-Konversationen. Jeder Reiter lädt seine Daten erst beim ersten Öffnen. Diese
Seite beschreibt **Aufbau, Endpunkte, Alpine-State und Fallstricke**; die Bedienung Schritt
für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Serie „Kundenverwaltung" 1–6 im Nutzerhandbuch"
    [Kundenverwaltung 1 – Kundin finden & Profil verstehen](https://hilfe.hub.glattt.com/kundenverwaltung/1/) ·
    [2 – Kundendaten bearbeiten](https://hilfe.hub.glattt.com/kundenverwaltung/2/) ·
    [3 – Termine & Pakete](https://hilfe.hub.glattt.com/kundenverwaltung/3/) ·
    [4 – Vertrag, Zahlung & offene Forderungen](https://hilfe.hub.glattt.com/kundenverwaltung/4/) ·
    [5 – Nachrichten & Kundenservice](https://hilfe.hub.glattt.com/kundenverwaltung/5/) ·
    [6 – Unterlagen & Behandlungsverlauf](https://hilfe.hub.glattt.com/kundenverwaltung/6/)

    Angrenzend: [Terminansicht 8 – Behandlungstermin & Einstellungszettel](https://hilfe.hub.glattt.com/terminansicht/8/),
    [Verträge 2 – Der Vertrag im Detail](https://hilfe.hub.glattt.com/vertraege/2/),
    [Forderungen 2 – Der Fall im Detail](https://hilfe.hub.glattt.com/forderungen/2/),
    [Betrieb 4 – Formulare teilen & Einreichungen](https://hilfe.hub.glattt.com/betrieb/4/).

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Dateistruktur](#dateistruktur)
    - [Architektur](#architektur)
    - [Übersicht-Tab](#ubersicht-tab-karten-raster)
    - [Kundeninfos-Tab (Feld-Schloss)](#kundeninfos-tab-bearbeiten-feld-schloss)
    - [Dokumente-Tab](#dokumente-tab)
    - [Behandlungseinstellungen-Tab](#behandlungseinstellungen-tab)
    - [Nachrichten-Tab](#nachrichten-tab-timeline-superchat)
    - [Umlaut-Normalisierung für Zone-Keys](#umlaut-normalisierung-fur-zone-keys)
    - [CSS-Includes](#css-includes)
- [Verwandte Dokumentation](#verwandte-dokumentation)
- [Chronik der Änderungen](#chronik-der-anderungen-neueste-zuerst)

---

## Für Anwender — Überblick

**Was das Modul leistet.** Das Kundenprofil ist die eine Stelle, an der alles zu einer Kundin
zusammenläuft — ohne eigenes `Client`-Model: Stammdaten, Termine und Pakete kommen live aus
Phorest, Verträge, Forderungen, Formulare, Behandlungswerte und Nachrichten aus dem Hub, Tickets
aus Zendesk, Chats aus Superchat. Die **Übersicht** zeigt aus jedem Bereich das Wichtigste als
Karte und springt per „Öffnen" in den jeweiligen Reiter.

**Grundsätze, die überall gelten:**

- **Phorest bleibt die Quelle der Stammdaten.** Änderungen im Reiter *Kundeninfos* werden
  direkt nach Phorest geschrieben; damit nichts versehentlich überschrieben wird, sind alle
  Felder zunächst gesperrt und werden **einzeln durch Gedrückthalten des Schlosses** (oder
  gesammelt über „Alle Felder entsperren") freigegeben. Ein einzelnes Feld speichert sofort,
  das Sammelspeichern fragt nach.
- **Reiter laden erst beim Öffnen.** Das hält die Seite schnell; ein Reiter, der einmal
  geladen ist, bleibt geladen.
- **Wer was sieht, regeln Rechte je Reiter** (`clients.detail.<reiter>`) — fehlt das Recht,
  fehlt der Reiter.

**Die zehn Reiter — und wo die Bedienung steht:**

| Reiter | Inhalt | Anleitung |
|---|---|---|
| Übersicht | Sechs Karten mit dem Wichtigsten aus allen Reitern | Kundenverwaltung 1 |
| Kundeninfos | Stammdaten, Kontakt, Adresse, Einwilligungen (Feld-Schloss) | Kundenverwaltung 2 |
| Termine | Vergangene und kommende Termine aus Phorest, Aktionen am Termin, Extrazeit | Kundenverwaltung 3 |
| glattt Pakete | Gebuchte Pakete mit Einheiten-Fortschritt (live aus Phorest) | Kundenverwaltung 3 |
| Vertrag/Zahlungen | Vertrag, Zahlungsstand, SEPA-Mandat | Kundenverwaltung 4 (Details: Verträge 2–7) |
| Forderungsmanagement | Offene Forderungen und Schuldenstand | Kundenverwaltung 4 (Details: Forderungen 2) |
| Nachrichten | Timeline automatischer Nachrichten, WhatsApp-Verlauf, Antworten und neue Nachrichten | Kundenverwaltung 5 |
| Kundenservice | Zendesk-Tickets der Kundin mit Kommentar-Verlauf | Kundenverwaltung 5 |
| Dokumente | Eingereichte Formulare mit Detailansicht und Unterschriften | Kundenverwaltung 6 |
| Behandlungseinstellungen | Laser-Parameter je Körperzone als Historie, Behandlungsfotos | Kundenverwaltung 6 |

---

## Für Entwickler

### Dateistruktur

```
resources/views/hub/clients/
├── detail.blade.php                          # Hauptseite mit Tab-System (clientDetailPage())
└── partials/
    ├── overview.blade.php                    # Tab: Übersicht (Karten-Raster)
    ├── info.blade.php                        # Tab: Kundeninfos (Feld-Schloss)
    ├── appointments.blade.php                # Tab: Termine
    ├── packages.blade.php                    # Tab: glattt Pakete (siehe CLIENT-COURSES-MODULE.md)
    ├── documents.blade.php                   # Tab: Dokumente
    ├── treatment-settings.blade.php          # Tab: Behandlungseinstellungen
    ├── payments.blade.php                    # Tab: Vertrag/Zahlungen
    ├── claims.blade.php                      # Tab: Forderungsmanagement
    ├── service.blade.php                     # Tab: Kundenservice (Zendesk)
    ├── whatsapp.blade.php                    # Tab: Nachrichten (Timeline + Superchat-Chat)
    └── submission.blade.php                  # (Formular-Einreichung Detail)

resources/views/components/field-lock.blade.php   # Schloss-Komponente (Kundeninfos)

app/Http/Controllers/
├── AppointmentViewController.php             # getClientTreatmentSettings()
├── ClientMessagesController.php              # Nachrichten-Timeline
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

Das Tab-System ist vollständig in Alpine.js implementiert (`clientDetailPage()` in `detail.blade.php`).
Jeder Reiter trägt seine Permission (`clients.detail.<id>`); der Tab `whatsapp` heißt seit
28.08.2026 „Nachrichten", seine `id` bleibt `whatsapp`:

```js
tabs: [
    { id: 'overview', name: 'Übersicht', visible: true, permission: 'clients.detail.overview' },
    { id: 'info', name: 'Kundeninfos', visible: true, permission: 'clients.detail.info' },
    { id: 'appointments', name: 'Termine', visible: true, permission: 'clients.detail.appointments' },
    { id: 'packages', name: 'glattt Pakete', visible: true, permission: 'clients.detail.packages' },
    { id: 'documents', name: 'Dokumente', visible: true, permission: 'clients.detail.documents' },
    { id: 'treatment-settings', name: 'Behandlungseinstellungen', visible: true, permission: 'clients.detail.treatment-settings' },
    { id: 'payments', name: 'Vertrag/Zahlungen', visible: true, permission: 'clients.detail.payments' },
    { id: 'claims', name: 'Forderungsmanagement', visible: true, permission: 'clients.detail.claims' },
    { id: 'service', name: 'Kundenservice', visible: true, permission: 'clients.detail.service' },
    { id: 'whatsapp', name: 'Nachrichten', visible: true, permission: 'clients.detail.whatsapp' },
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

### Übersicht-Tab (Karten-Raster)

Die Übersicht zeigt das Wichtigste aus allen Unterseiten als **sechs Karten im 2×3-Raster**
(mobil einspaltig); jede Karte springt über „Öffnen" in ihren Tab:

1. **Kundeninfos** — Kontakt, Adresse, Geburtsdatum, „Kunde seit", Einwilligungs-Badges
2. **Termine** — nächster Termin prominent, letzter Termin, Zähler kommend/vergangen (Stat-Strip)
3. **glattt Pakete** — aktive Pakete mit Einheiten-Fortschrittsbalken
4. **Vertrag & Zahlungen** — aktiver Vertrag (Paket, Status, Rate, Zahlart) plus
   roter Hinweis auf **offene Forderungen** (springt ins Forderungsmanagement)
5. **Behandlung** — letzte Behandlung (Datum, Zone, Mitarbeiterin), Zonen-/Behandlungszähler
6. **Dokumente & Kommunikation** — letzte Formulare, letzte WhatsApp, letztes Zendesk-Ticket

Umsetzung: `partials/overview.blade.php` + `loadOverview()` in `clientDetailPage()`. Die
Übersicht nutzt die **bestehenden Tab-Loader** (Pakete, Dokumente, Behandlungseinstellungen —
Tabs sind danach schon geladen) und holt Verträge/Forderungen/Zendesk/Superchat über dieselben
Endpoints wie die Tab-Partials in eigene `overview*`-Stores (die Tab-Partials kapseln ihren
Zustand lokal und sind von außen nicht erreichbar). Karten zeigen
`<x-stat-skeleton type="list">` beim Laden; Styles unter „CLIENT-OVERVIEW" in
`theme_glattt.css`. Test: `tests/Feature/ClientOverviewPartialTest.php`.

### Kundeninfos-Tab (Bearbeiten & Feld-Schloss)

Der Tab zeigt die mit Phorest synchronisierten Stammdaten (Notizen, persönliche Daten,
Kontakt, Adresse, Marketing-Einwilligungen) und schreibt Änderungen per
`PUT /phorest/client/{id}` zurück.

**Fachregeln (Verhalten, das der Code garantiert):**

- Alle Felder sind zunächst **gesperrt** und tragen ein Schloss-Symbol; die Felder sehen dabei
  wie normale Felder aus (kein Ausgrauen). Hover über dem Schloss und Klick in ein gesperrtes
  Feld zeigen den Tooltip „Zum Entsperren gedrückt halten".
- **Entsperren je Feld** durch Gedrückthalten des Schlosses (~1 s, Fortschrittsring); ein
  kurzer Klick entsperrt bewusst nicht und zeigt den Hinweis-Toast. Ein Klick auf das offene
  Schloss sperrt wieder und verwirft eine ungespeicherte Änderung. **„Alle Felder
  entsperren"** gibt alle Felder auf einmal frei.
- **Einzelfeld-Speichern:** Sobald ein entsperrtes Feld geändert wird, ersetzen Haken
  (speichern) und X (verwerfen und sperren) das Schloss im Feld. Der Haken speichert **genau
  dieses eine Feld** sofort nach Phorest — ohne Bestätigungs-Dialog; das Feld wird danach
  wieder gesperrt.
- **Sammelspeichern:** Sobald mindestens ein Feld entsperrt ist, stehen oben rechts
  **Abbrechen** (alles verwerfen und sperren) und **Änderungen speichern** (alle geänderten
  Felder mit Bestätigungs-Dialog).
- Erfolgs- und Fehlermeldungen erscheinen als **Toast unten rechts** (nicht mehr als Banner
  oben — der wurde übersehen). Die **E-Mail-Adresse wird schon beim Tippen validiert**:
  ungültiges Format markiert das Feld rot, zeigt eine Meldung darunter und deaktiviert den
  Speichern-Haken bzw. blockiert das Sammelspeichern.

**Umsetzung:**

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

Zeigt alle von der Kundin eingereichten Formulare (z.B. Aufklärungsbögen, Verträge) als Liste
mit Name, Datum und Status; ein Klick öffnet ein Modal mit der vollständigen Einreichung.
Unterschriften werden inline angezeigt und passen sich automatisch an Dark/Light Mode an
(SVG-Format); Markdown-Formatierung (**fett**, __unterstrichen__) wird dargestellt.

**Datei:** `resources/views/hub/clients/partials/documents.blade.php`

**API:** `GET /api/forms/submission/{submissionId}`

**Unterschriften-Anzeige im Modal:**

- SVG-Signaturen: Inline `x-html` mit `currentColor` → passt sich automatisch an Dark/Light Mode an
- PNG-Signaturen (Legacy): `<img>` mit URL
- SVG-Dimensionen werden per `x-init` korrigiert: `width: 100%`, `height: auto`, `width`/`height`-Attribute entfernt

### Behandlungseinstellungen-Tab

Zeigt die gesamte Laser-Behandlungshistorie der Kundin geordnet nach Körperzonen: oben die
interaktive Körperzonen-Grafik (links) mit Zone-Buttons (rechts), unten die Behandlungstabelle
über die volle Breite. Nur Zonen mit vorhandenen Behandlungen werden angezeigt,
Behandlungszähler-Badges („1x", „2x") zeigen die Anzahl bisheriger Behandlungen, benutzerdefinierte
Zonen (z.B. „Zehen") werden aus früheren Terminen geladen. Fotos öffnen eine Vollbild-Galerie
(Prev/Next, Thumbnail-Leiste, Bildunterschrift mit Dateiname).

#### Spalten der Behandlungstabelle (Datenfelder)

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

#### API-Endpunkt: Behandlungseinstellungen

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

#### Treatment-Settings Partial

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

### Nachrichten-Tab (Timeline + Superchat)

Seit 28.08.2026 heißt der frühere Tab „WhatsApp" **„Nachrichten"** (Tab-`id` bleibt `whatsapp`).
Er zeigt oben die **Timeline aller automatisch versendeten Nachrichten** an die Kundin —
Beratungs-WhatsApp (inkl. SMS/RCS-Fallback), Terminerinnerungen, Bewertungslink,
Zufriedenheitsbefragung und System-E-Mails — mit Datum, Kanal, Status und, wo verfügbar,
Zustell-/Lesebestätigung („Gelesen 28.08. 10:05"); ein Klick auf eine Zeile klappt den
Nachrichtentext auf. Darunter die Superchat-Konversationen mit Composer (Details:
[SUPERCHAT-WHATSAPP.md](SUPERCHAT-WHATSAPP.md)).

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

- [CLIENT-COURSES-MODULE.md](CLIENT-COURSES-MODULE.md) — Tab „glattt Pakete" (Phorest Client Courses)
- [SUPERCHAT-WHATSAPP.md](SUPERCHAT-WHATSAPP.md) — Superchat-Chat und Composer im Tab „Nachrichten"
- [ZENDESK-API.md](ZENDESK-API.md) — Tickets im Tab „Kundenservice"
- [TREATMENT-SETTINGS.md](TREATMENT-SETTINGS.md) — Behandlungseinstellungen (Termin-Session-Ansicht)
- [BODY-ZONE-SELECTOR.md](BODY-ZONE-SELECTOR.md) — Körperzonen-Komponente
- [FORM-EDITOR.md](FORM-EDITOR.md) — Formular-Editor und -Ausfüllung
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) — DS-Klassen (`table-glattt`, `card-glattt`, etc.)

**Erstellt:** Februar 2026
**Betroffene Dateien:**

- `resources/views/hub/clients/detail.blade.php`
- `resources/views/hub/clients/partials/documents.blade.php`
- `resources/views/hub/clients/partials/treatment-settings.blade.php`
- `resources/views/hub/clients/partials/whatsapp.blade.php`
- `app/Http/Controllers/AppointmentViewController.php`
- `app/Http/Controllers/ClientMessagesController.php`
- `routes/web.php`

---

## Chronik der Änderungen (neueste zuerst)

Die Update-Blöcke in der Reihenfolge ihres Entstehens — jeweils mit Anlass und Wirkung. Neue
Erkenntnisse werden **nicht** hier, sondern oben an der thematisch passenden Stelle
eingearbeitet; die Chronik wächst nur um den Verweis. Bedienung: Nutzerhandbuch, Serie
„Kundenverwaltung".

### Update 28.08.2026 — Tab „Nachrichten" (vorher „WhatsApp")

Der WhatsApp-Tab wurde zum Tab **Nachrichten** erweitert: oben die Timeline aller automatisch
versendeten Nachrichten (Beratungs-WhatsApp inkl. SMS/RCS-Fallback, Terminerinnerungen,
Bewertungslink, Zufriedenheitsbefragung, System-E-Mails) mit Zustell-/Lesebestätigung, darunter
wie bisher die Superchat-Konversationen mit Composer. Endpoint, Datenquellen, Status-Herkunft
und Grenzen stehen oben unter [Nachrichten-Tab](#nachrichten-tab-timeline-superchat).

### Update 08/2026 — Kundeninfos: Toasts statt Banner, E-Mail-Validierung, Markup-Regression

Erfolgs-/Fehlermeldungen des Kundeninfos-Tabs erscheinen als Toast unten rechts (der Banner oben
wurde übersehen), die E-Mail-Adresse wird beim Tippen validiert. Ein verlorenes öffnendes
`<button`-Tag hatte Attribut-Code als sichtbaren Text gerendert — behoben und durch
`tests/Feature/ClientInfoPartialTest.php` abgesichert (siehe
[Kundeninfos-Tab](#kundeninfos-tab-bearbeiten-feld-schloss)).
