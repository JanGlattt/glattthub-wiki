# glatttHub Dark Mode

## Übersicht

Der glatttHub verfügt nun über einen vollständig integrierten Dark Mode mit drei Modi:
- **Hell** (Light Mode)
- **Dunkel** (Dark Mode)
- **System** (folgt den Systemeinstellungen)

## Features

### 🎨 Automatische Theme-Erkennung
- Der Dark Mode wird sofort beim Laden der Seite angewendet (kein Flash/Flackern)
- Folgt den Systemeinstellungen wenn "System" ausgewählt ist
- Theme-Präferenz wird im LocalStorage gespeichert

### 🔄 Toggle-Switch
- **Desktop**: Vollständiger Toggle mit Icon und Label in der Topbar (Hub) bzw. Navigation (Standard-Layout)
- **Mobile**: Kompakter Icon-Toggle ohne Text
- **Zyklus**: Hell → Dunkel → System → Hell...

### 🎯 Platzierung
- **Hub-Seiten**: Toggle in der Topbar rechts (vor Branch-Selector)
- **Standard-Seiten**: Toggle in der Navigation rechts (vor User-Dropdown)
- **Mobile**: Icon-Button in der mobilen Navigation

### 🎨 CSS-Variablen System
Alle Farben sind als CSS-Variablen definiert:

#### Basis-Farben
```css
--bg-primary         /* Haupt-Hintergrund */
--bg-secondary       /* Karten, Panels */
--bg-tertiary        /* Inputs, Buttons */
--bg-hover           /* Hover-Zustände */
--bg-active          /* Active-Zustände */

--text-primary       /* Haupt-Text */
--text-secondary     /* Sekundär-Text */
--text-tertiary      /* Placeholder, Labels */
--text-inverse       /* Inverser Text (auf Buttons) */

--border-primary     /* Haupt-Rahmen */
--border-secondary   /* Hover-Rahmen */
--border-tertiary    /* Aktive Rahmen */
```

#### Status-Farben
```css
--color-success      /* Erfolg (Grün) */
--color-warning      /* Warnung (Orange) */
--color-danger       /* Fehler (Rot) */
--color-info         /* Info (Blau) */
```

#### Schatten
```css
--shadow-sm          /* Kleiner Schatten */
--shadow-md          /* Mittlerer Schatten */
--shadow-lg          /* Großer Schatten */
--shadow-xl          /* Extra großer Schatten */
```

## Implementierung

### Dateien

#### CSS
- `/public/css/darkmode.css` - Haupt Dark Mode CSS mit Variablen
- `/public/css/hub-darkmode.css` - Hub-spezifische Dark Mode Styles
- `/public/css/appointments.css` - Konvertiert zu CSS-Variablen

#### JavaScript
- `/public/js/darkmode.js` - Dark Mode Manager Klasse

#### Layouts
- `/resources/views/layouts/app.blade.php` - Standard-Layout
- `/resources/views/layouts/hub.blade.php` - Hub-Layout
- `/resources/views/layouts/guest.blade.php` - Gast-Layout
- `/resources/views/navigation-menu.blade.php` - Navigation mit Toggle
- `/resources/views/layouts/partials/topbar.blade.php` - Hub Topbar mit Toggle

#### Config
- `/tailwind.config.js` - Dark Mode aktiviert (`darkMode: 'class'`)

### Verwendung in eigenen Komponenten

#### 1. CSS-Variablen verwenden
Statt feste Farben zu verwenden, nutze die CSS-Variablen:

```css
/* ❌ Nicht so */
.my-component {
    background: #ffffff;
    color: #111827;
    border: 1px solid #e5e7eb;
}

/* ✅ So ist richtig */
.my-component {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
}
```

#### 2. Dark Mode spezifische Styles
Für spezielle Dark Mode Anpassungen:

```css
.my-component {
    background: var(--bg-secondary);
}

.dark .my-component {
    /* Spezielle Dark Mode Anpassung */
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.1);
}
```

#### 3. Tailwind Dark Mode Klassen
In Blade-Templates mit Tailwind:

```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
    Content
</div>
```

### Theme wechseln via JavaScript

```javascript
// Aktuelles Theme abrufen
const currentTheme = window.darkModeManager.currentTheme;

// Theme setzen
window.darkModeManager.setTheme('dark');   // oder 'light' oder 'system'

// Theme durchschalten (wie Toggle-Button)
window.darkModeManager.cycleTheme();

// Auf Theme-Änderungen reagieren
window.addEventListener('themeChanged', (event) => {
    console.log('Neues Theme:', event.detail.theme);
});
```

## Browser-Support

- ✅ Chrome/Edge (ab Version 88)
- ✅ Firefox (ab Version 89)
- ✅ Safari (ab Version 14.1)
- ✅ Mobile Safari (iOS 14.1+)
- ✅ Chrome Mobile

## Optimierungen

### Performance
- **Instant Theme Application**: Theme wird inline im `<head>` angewendet (kein Flackern)
- **CSS-Variablen**: Schnelle Theme-Switches ohne komplettes Neu-Rendering
- **LocalStorage**: Theme-Präferenz wird gespeichert
- **Preload-Klasse**: Verhindert Transition-Animationen beim initialen Laden

### Accessibility
- **System-Präferenz**: Respektiert `prefers-color-scheme`
- **Keyboard-Navigation**: Toggle ist per Tab und Enter bedienbar
- **ARIA-Labels**: Icons haben beschreibende Labels (geplant in zukünftigen Updates)

## Bekannte Module

Folgende Module sind bereits Dark Mode ready:

### ✅ Vollständig implementiert
- **Appointments** (Termine) - Mit CSS-Variablen
- **Hub Dashboard** - Sidebar, Topbar, Cards
- **Navigation** - Standard und Mobile
- **Layouts** - App, Hub, Guest

### 🔄 Zu überprüfen/anpassen
- **Services** (Dienstleistungen)
- **Clients** (Kunden)
- **Staff** (Mitarbeiter)
- **Reports** (Berichte)
- **Branches** (Filialen)
- **API Settings**

### 📝 Anleitung für andere Module

1. Bestehende CSS-Datei öffnen
2. Feste Hex-Farben durch CSS-Variablen ersetzen:
   - `#ffffff` → `var(--bg-primary)`
   - `#111827` → `var(--text-primary)`
   - `#e5e7eb` → `var(--border-primary)`
   - etc.
3. Spezielle Dark Mode Anpassungen mit `.dark` Prefix hinzufügen
4. In Blade-Templates Tailwind Dark Classes nutzen: `dark:bg-gray-800`

## Testing

### Manuell testen
1. Öffne die Anwendung
2. Klicke auf den Theme-Toggle (Sonne/Mond/Monitor Icon)
3. Überprüfe alle drei Modi: Hell → Dunkel → System
4. Navigiere durch verschiedene Seiten
5. Teste Mobile-Ansicht

### Zu überprüfen
- [ ] Alle Hub-Seiten (Dashboard, Termine, etc.)
- [ ] Standard-Seiten (Profile, API Tokens, etc.)
- [ ] Forms und Inputs
- [ ] Modals und Overlays
- [ ] Charts und Visualisierungen
- [ ] Error/Success Messages
- [ ] Tables
- [ ] Loading States
- [ ] Empty States

## Weitere Verbesserungen (optional)

### Nice-to-have Features
- [ ] Theme-Transition Animation (smooth fade)
- [ ] Per-User Theme-Präferenz in Datenbank
- [ ] Theme-Picker mit Preview
- [ ] Keyboard Shortcut (z.B. Ctrl+Shift+D)
- [ ] Theme-bezogene Illustrations/Logos

## Support

Bei Fragen oder Problemen mit dem Dark Mode:
1. Prüfe Browser-Console auf Fehler
2. Verifiziere dass `darkmode.js` lädt
3. Prüfe LocalStorage (`glattthub-theme`)
4. Prüfe dass `<html>` die `.dark` Klasse erhält

## Credits

Entwickelt für glatttHub  
Dark Mode System: 2025
