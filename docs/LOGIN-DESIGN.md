# glatttHub Login Page Design

## Übersicht

Die Login-Seite wurde am 21.02.2026 komplett überarbeitet. Das neue Design basiert vollständig auf dem GLATTT Design System (`theme_glattt.css`) und verwendet **keine separate CSS-Datei** mehr.

## Design-Prinzipien

### 🎨 Konsistenz mit dem Hub

- **Gleicher Hintergrund** wie die Hub-Seiten (`dashboard-background` aus `theme_glattt.css`)
- **Design System Klassen** aus `theme_glattt.css`
- **Keine Custom-CSS-Datei** - nur Inline-Styles wo nötig
- **Professioneller Footer** mit Copyright-Notice

### 🔑 Zwei Login-Methoden

1. **PIN-Login** (Standard, schneller)
   - 4-stellige numerische PIN
   - Große, zentrierte Eingabe
   - Punkte statt Zahlen (Sicherheit)
   - Numerische Tastatur auf Mobilgeräten

2. **E-Mail/Passwort-Login** (Fallback)
   - Floating Label Inputs
   - Standard-Authentifizierung

## Implementierung

### Dateistruktur

```
resources/views/auth/
├── login.blade.php          # Haupt-Login-Seite (neu)
└── login-backup.blade.php   # Backup der alten Version
```

**Gelöschte Dateien:**
- `/public/css/login.css` - nicht mehr benötigt

### Verwendete Design System Klassen

| Klasse | Verwendung |
|--------|------------|
| `card-glattt` | Login-Card Container |
| `alert-glattt`, `alert-glattt-error`, `alert-glattt-success` | Fehler- und Status-Meldungen |
| `segmented-control-glattt` | Toggle zwischen PIN/E-Mail |
| `input-glattt` | Input-Felder |
| `input-glattt-floating`, `input-glattt-floating-wrapper`, `input-glattt-floating-label` | Floating Labels |
| `form-glattt-group`, `form-glattt-label`, `form-glattt-hint`, `form-glattt-error` | Formular-Struktur |
| `btn-glattt-primary` | Submit-Buttons |
| `btn-glattt-icon` | Theme-Toggle Button |

### Segmented Control Toggle

Der Toggle zwischen PIN und E-Mail verwendet:
- `segmented-control-glattt` Container
- `segmented-control-glattt-option` für jede Option
- `segmented-control-glattt-label` für die Labels
- Alpine.js `x-model` für reaktive Umschaltung
- Aktiver Zustand: Türkis-Hintergrund mit weißer Schrift

```html
<div class="segmented-control-glattt" style="width: 100%;">
    <div class="segmented-control-glattt-option" style="flex: 1;">
        <input type="radio" name="loginMethod" id="method-pin" x-model="loginMethod" value="pin">
        <label for="method-pin" class="segmented-control-glattt-label" 
               x-bind:style="loginMethod === 'pin' ? 'background: var(--glattt-turquoise); color: white;' : ''">
            PIN
        </label>
    </div>
    <!-- ... -->
</div>
```

### PIN-Eingabe

```html
<input 
    type="text" 
    name="pin" 
    maxlength="4" 
    pattern="[0-9]*"
    inputmode="numeric"
    class="input-glattt"
    style="font-size: 2rem; font-weight: 700; text-align: center; 
           letter-spacing: 0.75rem; -webkit-text-security: disc;"
    x-on:input="$el.value = $el.value.replace(/[^0-9]/g, '')"
/>
```

**Features:**
- `inputmode="numeric"` - Zeigt Zahlentastatur auf Mobilgeräten
- `pattern="[0-9]*"` - iOS-spezifisch für reine Zahlentastatur  
- `-webkit-text-security: disc` - Zeigt Punkte statt Zahlen
- `letter-spacing: 0.75rem` - Gute Lesbarkeit der Punkte
- Alpine.js filtert nicht-numerische Eingaben

### Floating Label Inputs

Für E-Mail und Passwort werden Floating Labels verwendet:

```html
<div class="input-glattt-floating-wrapper">
    <input 
        type="email" 
        placeholder=" "
        class="input-glattt input-glattt-floating"
    />
    <label class="input-glattt-floating-label">E-Mail-Adresse</label>
</div>
```

**Wichtig:** `placeholder=" "` (Leerzeichen) ist erforderlich für das CSS `:not(:placeholder-shown)` Styling.

### Theme Toggle

Position: Oben rechts in der Card (absolut positioniert)

```html
<button type="button" id="theme-toggle-login" class="btn-glattt-icon" 
        style="position: absolute; top: 1.25rem; right: 1.25rem;">
    <svg class="theme-icon-sun">...</svg>
    <svg class="theme-icon-moon">...</svg>
    <svg class="theme-icon-system">...</svg>
</button>
```

Icon-Sichtbarkeit wird über CSS gesteuert basierend auf `data-theme` Attribut.

### Copyright Footer

```html
<footer style="position: fixed; bottom: 0; left: 0; right: 0; 
               padding: 1rem; text-align: center; 
               font-size: 0.75rem; color: var(--text-tertiary);">
    © {{ date('Y') }} Labrado & Schlüter GmbH. Alle Rechte vorbehalten.
</footer>
```

**Automatische Jahreszahl:** `{{ date('Y') }}` gibt immer das aktuelle Jahr aus.

## Abhängigkeiten

### CSS-Dateien
1. `theme_glattt.css` — Einziges Stylesheet (enthält Dark Mode, Design System, Dashboard-Hintergrund)

### JavaScript
1. `darkmode.js` - Theme-Verwaltung (`window.themeManager`)
2. Alpine.js (CDN) - Für Toggle-Interaktivität

## Dark Mode

Die Seite unterstützt vollständigen Dark Mode:
- Theme wird beim Laden sofort angewendet (kein Flash)
- Cookie speichert Präferenz für Server-Side-Rendering
- Toggle wechselt zwischen: Hell → Dunkel → System

## Sicherheitsmaßnahmen

### Safari Autofill Prevention

```html
<!-- Hidden dummy fields -->
<input type="text" name="prevent_autofill" style="display:none !important;">
<input type="password" name="prevent_autofill_pass" style="display:none !important;">

<!-- Auf dem PIN-Input -->
data-lpignore="true"
data-1p-ignore
data-form-type="other"
autocomplete="off"
```

## Responsive Design

Die Login-Card ist responsive:
- Max-width: 420px
- Padding: 2.5rem (Desktop) / 1.5rem (Mobile)
- Zentriert mit Flexbox

## Animation

Slide-up Animation beim Laden:

```css
@keyframes loginSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

## Changelog

### 21.02.2026
- ✅ Login-Seite komplett überarbeitet
- ✅ Eigene `login.css` entfernt
- ✅ Alle Styles aus `theme_glattt.css` oder inline
- ✅ Segmented Control für PIN/E-Mail Toggle
- ✅ Floating Labels für E-Mail-Formular
- ✅ Verbesserter aktiver Zustand im Toggle (türkis)
- ✅ Copyright Footer mit automatischer Jahreszahl
- ✅ Gleicher Hintergrund wie Hub-Seiten
- ✅ Numerische Tastatur auf Mobilgeräten

## Verwandte Dokumentation

- [Benutzer-Einladungssystem](./USER-INVITATION-SYSTEM.md) – Setup-Seite nutzt identisches Design wie Login
- [PIN-Login-System](./PIN-LOGIN-SYSTEM.md) – PIN-Vergabe und PIN-Login
- [Design System](./DESIGN-SYSTEM.md) – Alle glattt-CSS-Klassen

---

**Aktualisiert**: 21. Februar 2026  
**Version**: 2.0  
**Design**: GLATTT Design System  
**Firma**: Labrado & Schlüter GmbH
