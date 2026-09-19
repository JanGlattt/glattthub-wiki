# Profilseite

Die Profilseite (`/hub/profile` → `hub.profile.index`, alternativ `/user/profile` →
`profile.show` aus Jetstream) lässt jede Nutzerin ihre persönlichen Einstellungen pflegen:
Profilbild, E-Mail, Passwort, PIN-Anmeldung, Zwei-Faktor-Authentifizierung, Browser-Sitzungen
und Kontolöschung. Beide Routen rendern dieselben Partials im Hub-Layout (`layouts.hub`).
Diese Seite beschreibt **Aufbau, Livewire-Komponenten, Auto-Save des Profilbilds und
Styling-Regeln**; die Bedienung steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Grundlagen 3 – Mein Profil im glatttHub"
    [hilfe.hub.glattt.com/grundlagen/3/](https://hilfe.hub.glattt.com/grundlagen/3/) — Name und Bild, Passwort ändern, PIN verwalten, Geräte und Rundgänge.

    Angrenzend: [Grundlagen 1 – Anmelden & zurechtfinden](https://hilfe.hub.glattt.com/grundlagen/1/) (PIN- und E-Mail-Anmeldung).

## Für Anwender — Überblick

**Was die Seite leistet.** Alles, was nur die eigene Person betrifft, wird hier gepflegt —
unabhängig von der Personalverwaltung, die Rollen und Rechte vergibt. Das Profilbild
speichert sich **sofort** beim Auswählen (kein Speichern-Knopf) und erscheint ohne Neuladen in
Seitenleiste und Kopfzeile. Die vierstellige **PIN** ist der schnelle Anmeldeweg am Tablet im
Institut (Status als Badge: grün = aktiv, gelb = keine PIN; „Zufällig" erzeugt eine PIN), die
**Zwei-Faktor-Authentifizierung** sichert die E-Mail-Anmeldung mit einer Authenticator-App
und Wiederherstellungscodes, und unter **Browser-Sitzungen** lassen sich fremde Geräte per
Passwort-Bestätigung abmelden. Das Löschen des Kontos ist unwiderruflich und ebenfalls
passwortgeschützt.

| Vorgang | Anleitung |
|---|---|
| Name, E-Mail und Profilbild ändern | Grundlagen 3 |
| Passwort ändern | Grundlagen 3 |
| PIN festlegen oder ändern | Grundlagen 3 |
| Zwei-Faktor, Browser-Sitzungen (Geräte) und Rundgänge | Grundlagen 3 |
| Mit PIN oder E-Mail anmelden | Grundlagen 1 |

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

### Fachregeln je Sektion

- **Profilbild:** JPG, PNG, WebP, GIF, max. 5 MB; wird sofort gespeichert (Auto-Save, siehe
  unten), Toast bestätigt den Upload, Sidebar und Header aktualisieren sich ohne Reload.
- **E-Mail / Passwort:** klassische Formulare mit „Speichern" (Passwort: aktuelles Passwort +
  neues Passwort + Bestätigung), Validierung in `UpdateUserProfileInformation`.
- **PIN:** 4-stellig; „Zufällig" generiert eine PIN; PIN-Status als Badge im Karten-Header
  (`badge-glattt-success` aktiv, `badge-glattt-warning` keine PIN).
- **2FA:** Jetstream-Standard (QR-Code, Bestätigungscode, Wiederherstellungscodes).
- **Browser-Sitzungen / Konto löschen:** Jetstream-Standard mit Passwort-Bestätigung.

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
