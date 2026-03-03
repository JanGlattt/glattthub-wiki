# GLATTT Design System

**Version:** 1.0 Final  
**Letzte Aktualisierung:** Februar 2026

Das GLATTT Design System ist das zentrale Styling-Framework für den glatttHub. Es definiert alle visuellen Komponenten, Farben, Typografie und Interaktionsmuster.

---

## 📁 Dateistruktur

| Datei | Beschreibung |
|-------|--------------|
| `public/css/theme_glattt.css` | **Haupt-Design-System** - Alle Komponenten, Variablen, Buttons, Cards, etc. |
| `public/css/nav.css` | Navigation-Styles (Sidebar & Topbar) |
| `public/css/hub.css` | Dashboard-spezifische Layouts und Styles |
| `resources/views/hub/component-library.blade.php` | **Live-Beispiele** aller Komponenten |

---

## 🎨 Farben

### Primary Colors (Teal Blue)
Triadische Farbharmonie zum GLATTT Gold. Vermittelt Professionalität und Vertrauen.

| Variable | Hex | Verwendung |
|----------|-----|------------|
| `--color-primary` | `#3b9b9f` | Hauptaktionen, Links, wichtige UI-Elemente |
| `--color-primary-dark` | `#2d7a7d` | Hover-States, Akzente |
| `--color-primary-light` | `#5dbec2` | Hintergründe, Highlights |
| `--gradient-primary` | 135° Gradient | Button-Hintergründe |

### Secondary Colors (Warm Coral)
Analogisch zum GLATTT Gold. Warmer Akzent für Betonung.

| Variable | Hex | Verwendung |
|----------|-----|------------|
| `--color-secondary` | `#e67e5c` | Sekundäre Aktionen, Highlights |
| `--color-secondary-dark` | `#d4633e` | Hover-States |
| `--color-secondary-light` | `#f09a7a` | Hintergründe |
| `--gradient-secondary` | 135° Gradient | Akzent-Elemente |

### GLATTT Brand Colors

| Variable | Hex | Beschreibung |
|----------|-----|--------------|
| `--glattt-gold` | `#d2aa39` | Premium, Qualität |
| `--glattt-gold-light` | `#e0c266` | Hover-States |
| `--glattt-gold-dark` | `#b88f1f` | Akzente |
| `--glattt-turquoise` | `#5dbea3` | Modern, frisch, innovativ |
| `--glattt-turquoise-light` | `#7dd4bb` | Hover-States |
| `--glattt-turquoise-dark` | `#3d9a81` | Akzente |
| `--glattt-gray` | `#8a8a8a` | Neutral, professionell |

### Status Colors

| Variable | Hex | Verwendung |
|----------|-----|------------|
| `--color-success` | `#10b981` | Erfolg, positive Aktionen |
| `--color-warning` | `#f59e0b` | Warnung, Achtung |
| `--color-danger` | `#ef4444` | Fehler, kritische Zustände |
| `--color-info` | `#3b82f6` | Informationen, Hinweise |

### Hintergrundfarben

| Variable | Light Mode | Dark Mode | Verwendung |
|----------|------------|-----------|------------|
| `--bg-primary` | `#ffffff` | `#111827` | Haupthintergrund |
| `--bg-secondary` | `#f9fafb` | `#1f2937` | Sekundärer Hintergrund |
| `--bg-tertiary` | `#f3f4f6` | `#374151` | Tertiärer Hintergrund |
| `--bg-hover` | `#f3f4f6` | `#374151` | Hover-Zustände |

### Textfarben

| Variable | Light Mode | Dark Mode |
|----------|------------|-----------|
| `--text-primary` | `#111827` | `#f9fafb` |
| `--text-secondary` | `#6b7280` | `#d1d5db` |
| `--text-tertiary` | `#9ca3af` | `#9ca3af` |

---

## 🔤 Typografie

### Schriftarten

```css
--font-primary: 'Dosis', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-heading: 'Dosis', sans-serif;
--font-body: 'Dosis', sans-serif;
--font-mono: 'Courier New', Consolas, Monaco, monospace;
```

**Dosis** wird für alle Texte verwendet - Headlines und Body. Die Schrift verleiht dem Interface ein modernes, freundliches Erscheinungsbild.

---

## 🔘 Buttons

### Primary Button
Für Hauptaktionen und Call-to-Actions. Gradient-Hintergrund mit Shine-Animation beim Hover.

```html
<button class="btn-glattt-primary">
    <svg><!-- Optional Icon --></svg>
    Button Text
</button>
```

**Features:**
- Primary Gradient Hintergrund
- Shine-Animation on hover
- Elevation-Effekt (Box-Shadow)
- White Text

### Secondary Button
Für sekundäre Aktionen. Outline-Style mit Fill-Animation beim Hover.

```html
<button class="btn-glattt-secondary">
    <svg><!-- Optional Icon --></svg>
    Abbrechen
</button>
```

**Features:**
- Transparenter Hintergrund mit Border
- Fill-Animation von links on hover
- Primary Color Border & Text

### Tertiary Button
Für weniger wichtige Aktionen. Minimalistisch mit subtiler Hover-Animation.

```html
<button class="btn-glattt-tertiary">
    Weitere Optionen
</button>
```

**Features:**
- Sehr dezenter Style
- Subtle Hover-Hintergrund
- Secondary Text Color

### Danger Button
Für kritische/destruktive Aktionen wie Löschen.

```html
<button class="btn-glattt-danger">
    <svg><!-- Trash Icon --></svg>
    Löschen
</button>
```

### Icon Buttons
Runde Buttons nur mit Icon. Verfügbar in 3 Größen.

```html
<!-- Small (32px) -->
<button class="btn-glattt-icon btn-glattt-icon-sm">
    <svg class="w-4 h-4">...</svg>
</button>

<!-- Medium/Standard (40px) -->
<button class="btn-glattt-icon">
    <svg class="w-5 h-5">...</svg>
</button>

<!-- Large (48px) -->
<button class="btn-glattt-icon btn-glattt-icon-lg">
    <svg class="w-6 h-6">...</svg>
</button>

<!-- Primary Variant (mit Gradient) -->
<button class="btn-glattt-icon btn-glattt-icon-primary">
    <svg class="w-5 h-5">...</svg>
</button>
```

### Loading State
Für alle Button-Typen verfügbar. Fügt einen Spinner hinzu.

```html
<button class="btn-glattt-primary loading">Lädt...</button>
<button class="btn-glattt-secondary loading">Lädt...</button>
<button class="btn-glattt-icon loading">...</button>
```

### Disabled State
```html
<button class="btn-glattt-primary" disabled>Deaktiviert</button>
```

---

## 📦 Cards

### Standard Card
Basis-Card mit Glass-Morphism-Effekt.

```html
<div class="card-glattt">
    <div class="card-glattt-header">
        <div>
            <h4 class="card-glattt-title">Titel</h4>
            <p class="card-glattt-subtitle">Untertitel</p>
        </div>
        <svg><!-- Optional Icon --></svg>
    </div>
    <div class="card-glattt-body">
        Content hier...
    </div>
    <div class="card-glattt-footer">
        <button class="btn-glattt-tertiary">Abbrechen</button>
        <button class="btn-glattt-primary">Speichern</button>
    </div>
</div>
```

### Card Modifier

| Klasse | Beschreibung |
|--------|--------------|
| `card-glattt-compact` | Weniger Padding |
| `card-glattt-interactive` | Klickbar mit Active-State |
| `card-glattt-nested` | Für Cards innerhalb von Cards (leicht andere Hintergrundfarbe) |
| `card-glattt-no-hover` | Deaktiviert Hover-Effekte |
| `card-glattt-collapsible` | Aufklappbare Card (benötigt Alpine.js) |

### Collapsible Card
Aufklappbare Card mit Toggle-Button.

```html
<div class="card-glattt card-glattt-collapsible" x-data="{ expanded: false }">
    <div class="card-glattt-header" @click="expanded = !expanded">
        <div>
            <h4 class="card-glattt-title">Aufklappbarer Titel</h4>
        </div>
        <div class="card-glattt-collapsible-toggle" :class="{ 'expanded': expanded }">
            <svg><!-- Chevron Down --></svg>
        </div>
    </div>
    
    <!-- Preview (wenn zugeklappt) -->
    <div x-show="!expanded" class="card-glattt-collapsible-preview">
        Vorschau-Text...
    </div>
    
    <!-- Vollständiger Content (wenn aufgeklappt) -->
    <div x-show="expanded" class="card-glattt-body">
        Vollständiger Content...
    </div>
</div>
```

### Status Cards
Cards mit farbiger Hintergrund-Tönung.

```html
<!-- Success Card (grünlich) -->
<div class="card-glattt card-glattt-success">...</div>

<!-- Warning Card (gelblich) -->
<div class="card-glattt card-glattt-warning">...</div>

<!-- Danger Card (rötlich) -->
<div class="card-glattt card-glattt-danger">...</div>
```

### Quick Action Cards
Moderne Cards für Dashboard-Actions mit Gradient-Overlays.

```html
<div class="card-glattt card-glattt-quick-action card-glattt-quick-action-primary">
    <div class="card-glattt-quick-action-header">
        <div class="card-glattt-quick-action-icon">
            <svg><!-- Icon --></svg>
        </div>
        <div class="card-glattt-quick-action-content">
            <h4 class="card-glattt-quick-action-title">Titel</h4>
            <p class="card-glattt-quick-action-description">Beschreibung</p>
        </div>
        <div class="card-glattt-quick-action-arrow">
            <svg><!-- Arrow Icon --></svg>
        </div>
    </div>
    <div class="card-glattt-quick-action-footer">
        <div class="card-glattt-quick-action-stat">
            <svg><!-- Stat Icon --></svg>
            24 heute
        </div>
    </div>
</div>
```

**Verfügbare Varianten:**
- `card-glattt-quick-action-primary` (Teal Blue)
- `card-glattt-quick-action-secondary` (Warm Coral)
- `card-glattt-quick-action-gold` (GLATTT Gold)
- `card-glattt-quick-action-turquoise` (GLATTT Turquoise)
- `card-glattt-quick-action-success` (Grün)
- `card-glattt-quick-action-warning` (Orange)
- `card-glattt-quick-action-danger` (Rot)
- `card-glattt-quick-action-info` (Blau)

---

## 🏷️ Badges & Pills

### Subtle Badges
Dezente Badges mit optionalem Status-Dot.

```html
<!-- Basis -->
<span class="badge-glattt badge-glattt-primary">Badge Text</span>

<!-- Mit Status-Dot -->
<span class="badge-glattt badge-glattt-success">
    <span class="badge-glattt-dot"></span>
    Online
</span>

<!-- Mit Hover-Effekt -->
<span class="badge-glattt badge-glattt-primary badge-glattt-hover">
    Hoverable
</span>

<!-- Mit Pulsing-Animation (für Live-Status) -->
<span class="badge-glattt badge-glattt-success badge-glattt-pulse">
    <span class="badge-glattt-dot"></span>
    Live
</span>
```

**Größen:**
- `badge-glattt-sm` - Klein
- (Standard) - Medium
- `badge-glattt-lg` - Groß

**Farbvarianten:**
`badge-glattt-primary`, `badge-glattt-secondary`, `badge-glattt-success`, `badge-glattt-warning`, `badge-glattt-danger`, `badge-glattt-info`, `badge-glattt-gold`, `badge-glattt-turquoise`, `badge-glattt-neutral`

### Icon Badges
Auffälligere Badges mit Icon oder Emoji.

```html
<!-- Mit SVG Icon -->
<span class="badge-glattt-icon badge-glattt-icon-primary">
    <span class="badge-glattt-icon-container">
        <svg><!-- Icon --></svg>
    </span>
    In Betrieb
</span>

<!-- Mit Emoji -->
<span class="badge-glattt-icon badge-glattt-icon-gold">
    <span class="badge-glattt-icon-container">⭐</span>
    Premium
</span>
```

**Größen:** `badge-glattt-icon-sm`, (Standard), `badge-glattt-icon-lg`

**Effekte:** `badge-glattt-icon-hover`, `badge-glattt-icon-pulse`

### Pills
Vollständig runde Varianten der Badges.

```html
<span class="badge-glattt pill-glattt badge-glattt-primary">Pill</span>
<span class="badge-glattt-icon pill-glattt-icon badge-glattt-icon-success">...</span>
```

---

## 📝 Formulare

### Text Inputs

```html
<div class="form-glattt-group">
    <label class="form-glattt-label">Label</label>
    <input type="text" class="input-glattt" placeholder="Placeholder...">
    <p class="form-glattt-hint">Hilfetext</p>
</div>

<!-- Mit Validierung -->
<input type="text" class="input-glattt input-glattt-error">
<p class="form-glattt-error">
    <svg><!-- Error Icon --></svg>
    Fehlermeldung
</p>

<!-- Größen -->
<input type="text" class="input-glattt input-glattt-sm">
<input type="text" class="input-glattt input-glattt-lg">
```

### Select

```html
<select class="select-glattt">
    <option>Option 1</option>
    <option>Option 2</option>
</select>
```

### Textarea

```html
<textarea class="textarea-glattt" rows="4"></textarea>
```

### Validation States

| Klasse | Beschreibung |
|--------|--------------|
| `input-glattt-success` | Grüner Border |
| `input-glattt-warning` | Orangener Border |
| `input-glattt-error` | Roter Border |

### Checkbox

```html
<label class="checkbox-glattt">
    <input type="checkbox">
    <span class="checkbox-glattt-box">
        <svg><!-- Checkmark --></svg>
    </span>
    <span class="checkbox-glattt-label">Label Text</span>
</label>
```

### Radio Button

```html
<div class="radio-glattt-group">
    <label class="radio-glattt">
        <input type="radio" name="group">
        <span class="radio-glattt-circle"></span>
        <span class="radio-glattt-label">Option 1</span>
    </label>
    <label class="radio-glattt">
        <input type="radio" name="group">
        <span class="radio-glattt-circle"></span>
        <span class="radio-glattt-label">Option 2</span>
    </label>
</div>
```

### Toggle Switch

```html
<label class="toggle-glattt">
    <input type="checkbox">
    <span class="toggle-glattt-track"></span>
    <span class="toggle-glattt-thumb"></span>
    <span class="toggle-glattt-label">Toggle Label</span>
</label>
```

### Segmented Control (iOS-Style)

```html
<div class="segmented-control-glattt">
    <div class="segmented-control-glattt-option">
        <input type="radio" name="segment" id="opt1" checked>
        <label for="opt1" class="segmented-control-glattt-label">Option 1</label>
    </div>
    <div class="segmented-control-glattt-option">
        <input type="radio" name="segment" id="opt2">
        <label for="opt2" class="segmented-control-glattt-label">Option 2</label>
    </div>
</div>
```

### Search Input

```html
<div class="search-glattt-wrapper">
    <input type="search" class="search-glattt" placeholder="Suchen...">
    <svg class="search-glattt-icon"><!-- Search Icon --></svg>
    <button class="search-glattt-clear"><!-- X Icon --></button>
</div>
```

---

## 📋 Tables

```html
<div class="table-glattt-container">
    <table class="table-glattt">
        <thead>
            <tr>
                <th>Name</th>
                <th class="table-glattt-sortable">Status</th>
                <th>Aktionen</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="table-glattt-cell-primary">Max Mustermann</td>
                <td>
                    <span class="badge-glattt badge-glattt-success">Aktiv</span>
                </td>
                <td class="table-glattt-cell-actions">
                    <div class="table-glattt-cell-actions-group">
                        <button class="btn-glattt-icon btn-glattt-icon-sm">...</button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

**Table Varianten:**
- `table-glattt-sm` - Kompaktere Zeilen
- `table-glattt-lg` - Größere Zeilen
- `table-glattt-striped` - Abwechselnde Zeilenfarben

**Zell-Typen:**
- `table-glattt-cell-primary` - Hervorgehobene Zelle
- `table-glattt-cell-secondary` - Gedämpfte Zelle
- `table-glattt-cell-mono` - Monospace (für IDs)
- `table-glattt-cell-numeric` - Rechtsbündig
- `table-glattt-cell-actions` - Aktions-Buttons

---

## 🪟 Modals

```html
<!-- Backdrop -->
<div class="modal-glattt-backdrop">
    <!-- Modal Container -->
    <div class="modal-glattt modal-glattt-md">
        <div class="modal-glattt-header">
            <div class="modal-glattt-header-content">
                <div class="modal-glattt-header-icon">
                    <svg><!-- Icon --></svg>
                </div>
                <div class="modal-glattt-header-text">
                    <h3 class="modal-glattt-header-title">Modal Titel</h3>
                    <p class="modal-glattt-header-subtitle">Untertitel</p>
                </div>
            </div>
            <button class="modal-glattt-header-close">
                <svg><!-- X Icon --></svg>
            </button>
        </div>
        <div class="modal-glattt-body">
            Content...
        </div>
        <div class="modal-glattt-footer">
            <button class="btn-glattt-secondary">Abbrechen</button>
            <button class="btn-glattt-primary">Bestätigen</button>
        </div>
    </div>
</div>
```

**Modal Größen:**
- `modal-glattt-sm` - Klein (400px)
- `modal-glattt-md` - Medium (500px)
- `modal-glattt-lg` - Groß (600px)
- `modal-glattt-xl` - Extra Groß (800px)
- `modal-glattt-full` - Vollbild

---

## 🌗 Dark Mode

Das Design System unterstützt vollständig Light und Dark Mode. Der Modus wird über die Klasse `dark` auf dem `<html>` Element gesteuert.

```javascript
// Toggle Dark Mode
document.documentElement.classList.toggle('dark');

// Dark Mode aktivieren
document.documentElement.classList.add('dark');

// Light Mode aktivieren
document.documentElement.classList.remove('dark');
```

Alle CSS-Variablen passen sich automatisch an. Komponenten müssen keine zusätzlichen Klassen haben.

---

## 🔮 Glass Morphism

Das Design verwendet durchgehend Glass-Morphism für einen modernen Look:

```css
/* Card Glass Background */
--card-glass-bg: rgba(255, 255, 255, 0.7);      /* Light */
--card-glass-bg: rgba(17, 24, 39, 0.6);         /* Dark */

/* Backdrop Filter */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```

---

## 📐 Schatten

| Variable | Beschreibung |
|----------|--------------|
| `--shadow-sm` | Kleine Erhebung |
| `--shadow-md` | Mittlere Erhebung |
| `--shadow-lg` | Große Erhebung |
| `--shadow-xl` | Extra große Erhebung |
| `--shadow-primary-md` | Farbiger Schatten (Primary) |
| `--shadow-danger-md` | Farbiger Schatten (Danger) |

---

## 🎬 Animationen

### Vordefinierte Animationen

```css
/* Spin (für Loading) */
@keyframes spin { ... }

/* Slide In/Out */
@keyframes slide-in-right { ... }
@keyframes slide-out-right { ... }

/* Badge Pulse */
@keyframes badge-pulse { ... }

/* Modal Backdrop Fade */
@keyframes modalBackdropFadeIn { ... }
```

### CSS-Klassen

```html
<!-- Animate Slide In -->
<div class="animate-slide-in-right">...</div>

<!-- Pulsing Badge -->
<span class="badge-glattt badge-glattt-pulse">...</span>

<!-- Loading Button -->
<button class="btn-glattt-primary loading">...</button>
```

---

## 📱 Responsive Design

Das Design System verwendet folgende Breakpoints (TailwindCSS Standard):

| Breakpoint | Min-Width |
|------------|-----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

Mobile-First Ansatz wird verwendet.

---

## 📖 Live-Dokumentation

Besuche `/hub/component-library` im glatttHub für eine interaktive Übersicht aller Komponenten mit Live-Beispielen und Code-Snippets.

---

## ✅ Best Practices

1. **Konsistenz:** Verwende immer die GLATTT-Klassen statt eigener Styles
2. **Dark Mode:** Teste alle Änderungen in beiden Modi
3. **Accessibility:** Nutze semantisches HTML und ARIA-Labels
4. **Icons:** Verwende SVG-Icons mit `currentColor` für automatische Farbänderung
5. **Hover-States:** Alle interaktiven Elemente brauchen Hover-Feedback
6. **Loading-States:** Zeige immer Loading-Feedback bei async Operationen
7. **Validation:** Nutze die Validation-States für Formulare

---

## 🔗 Weitere Ressourcen

- [Component Library](/hub/component-library) - Live-Beispiele
- [TailwindCSS Docs](https://tailwindcss.com/docs) - Utility-Klassen
- [Alpine.js Docs](https://alpinejs.dev/) - Interaktivität
