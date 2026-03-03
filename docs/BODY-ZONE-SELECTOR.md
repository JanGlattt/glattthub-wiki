# Body Zone Selector

Interaktive Körperzonen-Auswahl für GLATTT Behandlungen.

## Übersicht

Der Body Zone Selector ist eine wiederverwendbare Blade-Komponente, die es ermöglicht, Körperzonen visuell auf einer Grafik oder per Checkbox-Liste auszuwählen. Die Komponente ist vollständig mit Alpine.js implementiert und synchronisiert sich automatisch mit der Datenbank.

## Quick Start

```blade
@include('partials.body-zone-selector', [
    'initialZones' => [],
    'showList' => true,
    'name' => 'body_zones',
])
```

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `resources/views/partials/body-zone-selector.blade.php` | Blade Partial |
| `public/js/components/body-zone-selector.js` | Alpine.js Komponente |
| `public/css/components/body-zone-selector.css` | Styles |
| `app/Models/BodyZone.php` | Eloquent Model (Single Source of Truth) |
| `database/seeders/BodyZoneSeeder.php` | Datenbank Seeder |

## Parameter

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `initialZones` | `array` | `[]` | Array von Zone-Keys die vorausgewählt sein sollen |
| `showList` | `bool` | `true` | Zeigt die Zonenliste neben der Grafik |
| `graphicOnly` | `bool` | `false` | Zeigt nur die Grafik ohne Liste |
| `compact` | `bool` | `false` | Kompakte Darstellung |
| `name` | `string` | `'body_zones'` | Name des Hidden-Inputs für Formulare |

## Verwendung

### 1. Assets einbinden

```blade
@push('styles')
    <link rel="stylesheet" href="{{ asset('css/components/body-zone-selector.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/components/body-zone-selector.js') }}"></script>
@endpush
```

### 2. Partial einbinden

#### Einfache Verwendung (nur Grafik)
```blade
@include('partials.body-zone-selector', [
    'graphicOnly' => true,
])
```

#### Mit vorausgewählten Zonen
```blade
@include('partials.body-zone-selector', [
    'initialZones' => ['achseln', 'bikini', 'brust'],
])
```

#### In einem Formular
```blade
<form method="POST" action="/behandlung">
    @csrf
    
    @include('partials.body-zone-selector', [
        'name' => 'treatment_zones',
        'initialZones' => old('treatment_zones', []),
    ])
    
    <button type="submit">Speichern</button>
</form>
```

### 3. Events nutzen

Das Partial dispatched ein `body-zones-changed` Event bei jeder Änderung:

```blade
<div 
    x-data="{ selectedZones: [] }"
    @body-zones-changed.window="selectedZones = $event.detail.zones"
>
    @include('partials.body-zone-selector')
    
    <p>Ausgewählt: <span x-text="selectedZones.length"></span> Zonen</p>
</div>
```

**Event Payload:**
```javascript
{
    zones: ['achseln', 'bikini'],      // Array der Zone-Keys
    zoneNames: ['Achseln', 'Bikini'],  // Array der Zone-Namen
    count: 2                            // Anzahl ausgewählter Zonen
}
```

### 4. Externe Synchronisation

Um die Grafik von außen zu aktualisieren (z.B. nach Checkbox-Änderungen):

```javascript
window.dispatchEvent(new CustomEvent('sync-body-zones', {
    detail: { zones: ['achseln', 'bikini'] }
}));
```

## Verfügbare Körperzonen

| Key | Name | Kategorie |
|-----|------|-----------|
| `gesicht` | Gesicht | Kopf & Hals |
| `hals_nacken` | Hals & Nacken | Kopf & Hals |
| `schultern` | Schultern | Oberkörper |
| `achseln` | Achseln | Oberkörper |
| `brust` | Brust | Oberkörper |
| `bauch` | Bauch | Oberkörper |
| `oberer_ruecken` | Oberer Rücken | Oberkörper |
| `unterer_ruecken` | Unterer Rücken | Oberkörper |
| `linker_arm` | Linker Arm | Arme & Hände |
| `rechter_arm` | Rechter Arm | Arme & Hände |
| `haende` | Hände | Arme & Hände |
| `bikini` | Bikinizone | Intimbereich |
| `intim` | Intimbereich | Intimbereich |
| `gesaess` | Gesäß | Intimbereich |
| `oberschenkel` | Oberschenkel | Beine & Füße |
| `unterschenkel_links` | Unterschenkel Links | Beine & Füße |
| `unterschenkel_rechts` | Unterschenkel Rechts | Beine & Füße |
| `fuesse` | Füße | Beine & Füße |

## Datenbank-Integration

### Model: `App\Models\BodyZone`

```php
// Alle aktiven Zonen, sortiert
$zones = BodyZone::active()->ordered()->get();

// Nach Kategorie filtern
$oberkoerper = BodyZone::category('oberkoerper')->get();

// Zone per Key finden
$achseln = BodyZone::where('key', 'achseln')->first();

// Bildpfad erhalten
$imagePath = $zone->image_path; // "/images/koerperzonen/Achseln_2048.png"

// Kategorie-Name
$categoryName = $zone->category_name; // "Oberkörper"
```

### Seeder ausführen

```bash
php artisan db:seed --class=BodyZoneSeeder
```

Der Seeder nutzt `updateOrCreate` und kann jederzeit erneut ausgeführt werden.

### Kategorien

```php
BodyZone::CATEGORIES = [
    'kopf' => 'Kopf & Hals',
    'oberkoerper' => 'Oberkörper',
    'arme' => 'Arme & Hände',
    'intimbereich' => 'Intimbereich',
    'beine' => 'Beine & Füße',
];
```

## Beispiel: Services-Seite mit Toggle

Siehe `resources/views/hub/services.blade.php` für ein vollständiges Beispiel mit:
- Toggle zwischen Grafik- und Listen-Modus
- Anzeige der ausgewählten Zonen als Tags
- Entfernen einzelner Zonen per Klick

## Grafiken

Die Körperzonen-Grafiken befinden sich in `/public/images/koerperzonen/`:

- `Basis_2048.png` - Basis-Silhouette (schwarze Linien)
- `[Zone]_2048.png` - Farbige Overlay-Grafiken für jede Zone

Die Grafiken sind 2048x2048 Pixel (quadratisch) und werden als Overlay übereinander gelegt.

## Klickbereiche anpassen

Die klickbaren Bereiche sind als SVG-Polygone im Blade-Partial definiert. Die Koordinaten sind auf einem 100x100 Grid basierend.

Um Bereiche anzupassen, bearbeite die `points`-Attribute der `<polygon>`-Elemente in `body-zone-selector.blade.php`.

## Styling anpassen

Die wichtigsten CSS-Variablen (aus `theme_glattt.css`):

```css
--color-primary: #3b9b9f;      /* Primärfarbe für aktive Zonen */
--bg-secondary: #f9fafb;       /* Hintergrund */
--border-primary: #e5e7eb;     /* Rahmenfarbe */
```
