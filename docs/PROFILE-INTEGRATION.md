# Profilseite

## Übersicht

Die Profilseite ermöglicht Benutzern die Verwaltung ihrer persönlichen Einstellungen: Profilbild, E-Mail, Passwort, PIN-Anmeldung, Zwei-Faktor-Authentifizierung und Browser-Sitzungen.

**Routen:**
- `/hub/profile` → `hub.profile.index`
- `/user/profile` → `profile.show` (Jetstream)

Beide rendern die gleichen Partials und nutzen das Hub-Layout (`layouts.hub`).

---

## Für Endanwender

### Profilbild ändern
- Auf **„Neues Foto wählen"** klicken und ein Bild auswählen (JPG, PNG, WebP, GIF, max. 5 MB)
- Das Bild wird **sofort gespeichert** — kein Klick auf „Speichern" nötig
- Eine Toast-Benachrichtigung bestätigt den erfolgreichen Upload
- Das neue Bild erscheint sofort in der Sidebar und im Header

### E-Mail ändern
- E-Mail-Feld im Bereich „Profilinformationen" ändern und „Speichern" klicken

### Passwort ändern
- Aktuelles Passwort eingeben, neues Passwort + Bestätigung eingeben, „Speichern" klicken

### PIN-Anmeldung
- Im Bereich „PIN-Code verwalten" eine 4-stellige PIN festlegen
- Der Button **„Zufällig"** generiert eine zufällige PIN
- PIN-Status wird als Badge im Karten-Header angezeigt (grün = aktiv, gelb = keine PIN)

### Zwei-Faktor-Authentifizierung (2FA)
- 2FA aktivieren, QR-Code mit Authenticator-App scannen, Bestätigungscode eingeben
- Wiederherstellungscodes sicher aufbewahren

### Browser-Sitzungen
- Alle aktiven Sitzungen anzeigen
- Andere Sitzungen per Passwort-Bestätigung abmelden

### Konto löschen
- Unwiderrufliche Löschung mit Passwort-Bestätigung

---

## Für Entwickler

### Architektur

Die Profilseite ist modular aufgebaut — jede Sektion ist ein eigenes Partial/Livewire-Component:

| Sektion | Partial | Livewire-Component | View |
|---------|---------|-------------------|------|
| Header | `hub.profile.partials.page-header` | — | — |
| Profilinfo | `hub.profile.partials.profile-information` | `Profile\UpdateProfileInformationForm` | `profile.update-profile-information-form` |
| Passwort | `hub.profile.partials.update-password` | Jetstream-Standard | `profile.update-password-form` |
| PIN | `hub.profile.partials.pin-management` | `Profile\UpdatePinForm` | `livewire.profile.update-pin-form` |
| 2FA | `hub.profile.partials.two-factor-auth` | Jetstream-Standard | `profile.two-factor-authentication-form` |
| Browser-Sessions | `hub.profile.partials.browser-sessions` | Jetstream-Standard | `profile.logout-other-browser-sessions-form` |
| Konto löschen | `hub.profile.partials.delete-account` | Jetstream-Standard | `profile.delete-user-form` |

### Layout

**Passwort & PIN nebeneinander** auf großen Screens (ab 1024px):
```html
<div class="profile-row-2col">
    <div class="profile-section"><!-- Passwort --></div>
    <div class="profile-section"><!-- PIN --></div>
</div>
```

CSS-Klasse `profile-row-2col` (definiert in `theme_glattt.css`):
- Mobile: 1 Spalte
- Desktop (≥1024px): 2 gleich hohe Spalten via CSS Grid + Flex

### Profilbild-Upload (Auto-Save)

Der Upload speichert **automatisch** ohne Formular-Submit:

1. Benutzer wählt Foto → `wire:model.live="photo"` sendet an Livewire
2. `updatedPhoto()` Hook wird automatisch aufgerufen
3. Validierung (Format + Max 5 MB)
4. `Auth::user()->updateProfilePhoto($this->photo)` speichert das Bild
5. Events werden dispatcht:
   - `photo-saved` (mit neuer URL) → Alpine aktualisiert alle `[data-user-avatar]` Elemente
   - `show-toast` → Toast-Benachrichtigung
   - `refresh-navigation-menu` → Navigation aktualisiert

**Avatar-Update ohne Page-Reload:**
Sidebar, Header und Formular-Avatar haben das Attribut `data-user-avatar`. Ein Alpine-Listener auf `photo-saved.window` setzt alle `src`-Attribute auf die neue URL.

### Floating Labels

Alle Formularfelder verwenden **Floating Labels** (Pflicht gemäß `blade.instructions.md`):

```html
<div class="form-glattt-group">
    <div class="input-glattt-floating-wrapper">
        <input class="input-glattt input-glattt-floating" placeholder=" " />
        <label class="input-glattt-floating-label">Label-Text</label>
    </div>
    @error('field') <span class="form-glattt-error">...</span> @enderror
</div>
```

**Wichtig:** `placeholder=" "` (Leerzeichen) ist Pflicht für den CSS-Selektor `:not(:placeholder-shown)`.

### Styling

- **Ausschließlich `theme_glattt.css`** — keine eigene CSS-Datei, keine Inline-Styles
- Karten: `card-glattt card-glattt-no-hover`
- Buttons: `btn-glattt-primary`, `btn-glattt-secondary`, `btn-glattt-tertiary`
- Badges: `badge-glattt badge-glattt-success` (PIN aktiv), `badge-glattt-warning` (keine PIN)
- Alerts: `alert-glattt alert-glattt-success`, `alert-glattt-warning`, `alert-glattt-info`
- Toast: Über globale `window.showToast(message, type)` Funktion

### Toast-Notifications

Livewire dispatcht `show-toast` Events:
```php
$this->dispatch('show-toast', message: 'Profilbild aktualisiert!', type: 'success');
```

Alpine-Listener leitet an `window.showToast()` weiter:
```html
<div x-on:show-toast.window="window.showToast?.($event.detail.message, $event.detail.type)">
```

### Relevante Dateien

**Views:**
- `resources/views/hub/profile/index.blade.php` — Hub-Route Layout
- `resources/views/profile/show.blade.php` — Jetstream-Route Layout
- `resources/views/hub/profile/partials/*.blade.php` — Wrapper-Partials
- `resources/views/profile/*.blade.php` — Formular-Views
- `resources/views/livewire/profile/update-pin-form.blade.php` — PIN-Formular

**Livewire-Komponenten:**
- `app/Livewire/Profile/UpdateProfileInformationForm.php` — Profilinfo + Foto-Upload
- `app/Livewire/Profile/UpdatePinForm.php` — PIN-Verwaltung

**Backend:**
- `app/Actions/Fortify/UpdateUserProfileInformation.php` — Validierung & Speichern
- `app/Models/User.php` — `HasProfilePhoto` Trait (Disk: `public` lokal, `gcs` Produktion)

**Styling:**
- `public/css/theme_glattt.css` — Alle Styles
- `public/js/profile/profile.js` — Client-seitige Validierung
