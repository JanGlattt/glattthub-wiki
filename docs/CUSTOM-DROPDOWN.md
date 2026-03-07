# Custom Dropdown (`<x-dropdown-glattt>`)

**Version:** 1.0  
**Letzte Aktualisierung:** März 2026

Das Custom Dropdown ersetzt native `<select>`-Elemente durch ein modernes, vollständig gestyltes Dropdown im glattt Design System. Es ist als **wiederverwendbare Blade-Komponente** implementiert und nutzt Alpine.js für die Interaktivität.

---

## 📁 Dateien

| Datei | Beschreibung |
|-------|--------------|
| `resources/views/components/dropdown-glattt.blade.php` | **Blade-Komponente** – Reusable UI-Component |
| `public/css/theme_glattt.css` | **CSS-Klassen** – `.dropdown-glattt-*` Styles |

---

## 🎯 Warum Custom Dropdown?

- **Einheitliches Design** – Native `<select>` sieht je nach Browser/OS anders aus
- **Floating Labels** – Integriert sich nahtlos in das bestehende `input-glattt-floating`-System
- **Animationen** – Smooth Open/Close mit Opacity + Transform-Transition
- **Check-Icon** – Ausgewählte Option wird visuell mit Häkchen markiert
- **Dark Mode** – Vollständige Dark-Mode-Unterstützung
- **Größenvarianten** – `-sm` und `-lg` CSS-Klassen verfügbar

---

## 🚀 Verwendung

### Basis-Beispiel

```html
<x-dropdown-glattt
    model="form.reason"
    label="Grund *"
    placeholder="Bitte wählen..."
    :options="[
        ['value' => 'finanzen', 'label' => 'Finanzen'],
        ['value' => 'gesundheit', 'label' => 'Gesundheit'],
        ['value' => 'sonstiges', 'label' => 'Sonstiges'],
    ]"
/>
```

### Ohne Placeholder (Standardwert vorhanden)

```html
<x-dropdown-glattt
    model="form.status"
    label="Aktueller Status"
    placeholder=""
    :options="[
        ['value' => 'offen', 'label' => 'Offen'],
        ['value' => 'in_verhandlung', 'label' => 'In Verhandlung'],
        ['value' => 'abgeschlossen', 'label' => 'Abgeschlossen'],
    ]"
/>
```

### Mit Boolean/Null-Werten

```html
<x-dropdown-glattt
    model="form.armpits_treated"
    label="Achseln behandelt?"
    placeholder=""
    :options="[
        ['value' => null, 'label' => 'Keine Angabe'],
        ['value' => true, 'label' => 'Ja'],
        ['value' => false, 'label' => 'Nein'],
    ]"
/>
```

---

## 📋 Props

| Prop | Typ | Pflicht | Standard | Beschreibung |
|------|-----|---------|----------|--------------|
| `model` | `string` | ✅ | – | Alpine.js-Expression zum gebundenen Wert, z.B. `"form.reason"` |
| `options` | `array` | ✅ | `[]` | Array von `['value' => ..., 'label' => ...]` Objekten |
| `label` | `string` | ❌ | `''` | Floating-Label-Text über dem Dropdown |
| `placeholder` | `string` | ❌ | `'Bitte wählen...'` | Text wenn kein Wert ausgewählt ist |

!!! warning "Wichtig: `model`-Prop"
    Der `model`-Wert wird **direkt als Alpine.js-Expression** im Template ausgegeben.
    Er muss eine gültige Variable im umgebenden Alpine-Scope sein (z.B. `form.reason`, `selectedValue`).

---

## ⚙️ Technische Details

### Architektur

```
┌─────────────────────────────────────────┐
│  <x-dropdown-glattt>                     │
│  ┌─────────────────────────────────────┐ │
│  │ .input-glattt-floating-wrapper      │ │
│  │  ┌──────────────────────────────┐   │ │
│  │  │ .dropdown-glattt  (x-data)   │   │ │
│  │  │  ┌────────────────────────┐  │   │ │
│  │  │  │ .dropdown-glattt-trigger│  │   │ │
│  │  │  │ (Button + Arrow SVG)   │  │   │ │
│  │  │  └────────────────────────┘  │   │ │
│  │  │  ┌────────────────────────┐  │   │ │
│  │  │  │ .dropdown-glattt-panel │  │   │ │
│  │  │  │ (Options-Liste)        │  │   │ │
│  │  │  └────────────────────────┘  │   │ │
│  │  └──────────────────────────────┘   │ │
│  │  <label> .input-glattt-floating-label│ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Alpine.js x-data

Das Dropdown nutzt ein **nested `x-data`**, das den Parent-Scope erbt. Dadurch kann es direkt auf die `form.*`-Variablen im umgebenden Kontext zugreifen:

```javascript
x-data='{
    ddOpen: false,                    // Panel offen/geschlossen
    ddOptions: [...],                 // Options aus @json($options)
    selectOption(val) {               // Setzt den Wert + schließt Panel
        form.reason = val;
        this.ddOpen = false;
    }
}'
```

### Warum `x-data` mit einfachen Anführungszeichen?

!!! danger "Wichtig: Einfache Anführungszeichen bei x-data"
    Das Blade-Directive `@json($options)` gibt JSON mit doppelten Anführungszeichen aus:
    ```json
    [{"value":"finanzen","label":"Finanzen"}, ...]
    ```
    
    Würde man `x-data="..."` (doppelte Anführungszeichen) verwenden, würde der JSON-Output
    das HTML-Attribut vorzeitig beenden und **der Code als Text im Browser angezeigt werden**.
    
    **Lösung:** `x-data='...'` (einfache Anführungszeichen). Laravel's `@json()` verwendet
    intern `JSON_HEX_APOS`, wodurch `'` automatisch als `\u0027` escaped wird.

### Escape-Taste (ESC)

Beim Drücken von ESC wird **nur das Dropdown geschlossen**, nicht das umgebende Modal:

```javascript
@keydown.escape.window="if(ddOpen) {
    ddOpen = false;
    $event.stopImmediatePropagation();  // Verhindert Modal-Close
}"
```

### Floating Label

Das Floating Label schwebt nach oben, wenn:

- **Ein Wert ausgewählt ist** → `data-has-value="true"`
- **Das Dropdown geöffnet ist** → `data-open="true"`

Dies wird über CSS-Selektoren in `theme_glattt.css` gesteuert:

```css
.input-glattt-floating-wrapper .dropdown-glattt[data-has-value="true"] ~ .input-glattt-floating-label,
.input-glattt-floating-wrapper .dropdown-glattt[data-open="true"] ~ .input-glattt-floating-label {
    top: 0;
    transform: translateY(-50%);
    font-size: 0.75rem;
    color: var(--color-primary);
    font-weight: 600;
}
```

---

## 🎨 CSS-Klassen

### Struktur-Klassen

| Klasse | Beschreibung |
|--------|--------------|
| `.dropdown-glattt` | Wrapper (`position: relative`) |
| `.dropdown-glattt-trigger` | Button der das Dropdown öffnet |
| `.dropdown-glattt-trigger-text` | Text im Trigger (gewählter Wert oder Placeholder) |
| `.dropdown-glattt-arrow` | Chevron-Icon (rotiert 180° bei `data-open`) |
| `.dropdown-glattt-panel` | Options-Container (animiert, `z-index: 60`) |
| `.dropdown-glattt-option` | Einzelne Option |
| `.dropdown-glattt-check` | Häkchen-SVG (sichtbar bei `data-selected`) |

### Data-Attribute für Zustandssteuerung

| Attribut | Element | Beschreibung |
|----------|---------|--------------|
| `data-open` | `.dropdown-glattt`, `.dropdown-glattt-trigger`, `.dropdown-glattt-panel` | `true` wenn Dropdown offen |
| `data-has-value` | `.dropdown-glattt` | `true` wenn ein Wert ausgewählt ist |
| `data-selected` | `.dropdown-glattt-option` | `true` für die aktuell gewählte Option |
| `data-placeholder` | `.dropdown-glattt-trigger-text` | `true` wenn Placeholder angezeigt wird |

### Größenvarianten

```html
<!-- Klein -->
<div class="dropdown-glattt dropdown-glattt-sm">...</div>

<!-- Standard (default) -->
<div class="dropdown-glattt">...</div>

<!-- Groß -->
<div class="dropdown-glattt dropdown-glattt-lg">...</div>
```

| Variante | Trigger-Höhe | Font-Size |
|----------|-------------|-----------|
| `-sm` | 2.375rem | 0.875rem |
| Standard | 3.125rem | 1rem |
| `-lg` | 3.625rem | 1.125rem |

### Animation

Das Panel nutzt eine CSS-Transition für sanftes Öffnen/Schließen:

```css
.dropdown-glattt-panel {
    max-height: 0;
    opacity: 0;
    transform: translateY(-4px);
    transition: max-height 0.25s ease, opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
}

.dropdown-glattt-panel[data-open="true"] {
    max-height: 16rem;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
    overflow-y: auto;
}
```

---

## 🔄 Migration von `<select>` zu `<x-dropdown-glattt>`

### Vorher (native Select)

```html
<div class="input-glattt-floating-wrapper">
    <select class="select-glattt input-glattt-floating" x-model="form.status">
        <option value="offen">Offen</option>
        <option value="in_verhandlung">In Verhandlung</option>
        <option value="abgeschlossen">Abgeschlossen</option>
    </select>
    <label class="input-glattt-floating-label">Status</label>
</div>
```

### Nachher (Custom Dropdown)

```html
<x-dropdown-glattt
    model="form.status"
    label="Status"
    placeholder=""
    :options="[
        ['value' => 'offen', 'label' => 'Offen'],
        ['value' => 'in_verhandlung', 'label' => 'In Verhandlung'],
        ['value' => 'abgeschlossen', 'label' => 'Abgeschlossen'],
    ]"
/>
```

!!! tip "Migration-Checkliste"
    1. Das umgebende `<div class="input-glattt-floating-wrapper">` und `<label>` entfallen – die Komponente erzeugt beides selbst
    2. `x-model="form.xxx"` wird zu `model="form.xxx"` (ohne `x-model`)
    3. `<option value="...">Label</option>` wird zu `['value' => '...', 'label' => 'Label']`
    4. Das `<div class="form-glattt-group">` Wrapper bleibt bestehen

---

## ✅ Best Practices

1. **Optionen alphabetisch sortieren** – Bessere UX bei längeren Listen
2. **Placeholder nur bei optionalen Feldern weglassen** – Bei Pflichtfeldern `placeholder="Bitte wählen..."` setzen
3. **Wrapper beibehalten** – Das `<div class="form-glattt-group">` um die Komponente herum behalten
4. **Wert-Typen beachten** – `value` kann `string`, `bool`, `null` oder `int` sein (strikte `===` Vergleiche)
5. **Keine doppelten Anführungszeichen im `model`-String** – z.B. `model="form.reason"` nicht `model='form.reason'`

---

## 🔗 Verwandte Seiten

- [Design System](DESIGN-SYSTEM.md) – Gesamtübersicht aller UI-Komponenten
- [Dark Mode](DARKMODE.md) – Dark-Mode-Unterstützung
