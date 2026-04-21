# Desktop-App (Electron)

Native macOS Desktop-App für glatttHub — ein Electron-Wrapper um die Web-App.

---

## Für Endanwender

### Was ist die Desktop-App?

Die glatttHub Desktop-App ist eine native macOS-Anwendung, die die Web-App (`https://hub.glattt.com`) in einem eigenen Fenster anzeigt. Es ist **kein Browser nötig** — die App erscheint im Dock, in Spotlight und bei Cmd+Tab mit eigenem glattt-Icon.

### Installation

1. Die `.dmg`-Datei herunterladen oder per MDM erhalten
2. Doppelklick auf die `.dmg`-Datei
3. `glatttHub.app` in den Programme-Ordner ziehen
4. App starten — beim ersten Öffnen ggf. Rechtsklick → „Öffnen" wählen (solange kein Code Signing aktiv ist)

### Funktionsumfang

| Feature | Beschreibung |
|---------|-------------|
| **Eigenes Fenster** | Unabhängig vom Browser, eigenes Dock-Icon |
| **Overlay-Titelleiste** | Schlankes Design mit macOS Traffic Lights (Schließen/Minimieren/Maximieren) |
| **Spotlight-Suche** | „glatttHub" eingeben → App öffnen |
| **Cmd+Tab** | Eigenes Icon in der App-Umschaltung |
| **Deutsche Menüleiste** | glatttHub, Bearbeiten, Darstellung, Fenster, Hilfe |
| **Tray-Icon** | Schnellzugriff über die macOS-Menüleiste |
| **Admin-Panel** | Eigenes Fenster für das Filament Admin-Panel (Cmd+Shift+A) |
| **Push-Benachrichtigungen** | Native macOS-Benachrichtigungen (Opt-in beim ersten Start) |
| **Tastenkürzel** | Cmd+R = Neu laden, Cmd+Shift+A = Admin-Panel, Cmd+Q = Beenden |
| **Immer aktuell** | Die Website wird live geladen — Inhalte sind immer aktuell |

### Menüleiste

| Menü | Einträge |
|------|---------|
| **glatttHub** | Über glatttHub, Ausblenden, Andere ausblenden, Alle einblenden, Beenden |
| **Bearbeiten** | Widerrufen, Wiederholen, Ausschneiden, Kopieren, Einsetzen, Alles auswählen |
| **Darstellung** | Neu laden (Cmd+R), Vergrößern, Verkleinern, Originalgröße, Vollbild |
| **Fenster** | Minimieren, Maximieren, Admin-Panel öffnen (Cmd+Shift+A), Schließen, Alle nach vorne |
| **Hilfe** | glatttHub Wiki (öffnet im Browser) |

### Push-Benachrichtigungen

Beim ersten Start der App erscheint ein Dialog, der fragt ob du Push-Benachrichtigungen aktivieren möchtest. Nach Klick auf „Aktivieren" zeigt macOS seinen eigenen Bestätigungs-Dialog. Danach erhältst du Benachrichtigungen direkt auf deinem Mac — solange die App geöffnet ist.

!!! info "Hinweis"
    Push-Benachrichtigungen funktionieren nur, wenn die App im Hintergrund oder Vordergrund läuft. Wird die App komplett beendet (Cmd+Q), werden keine Benachrichtigungen empfangen.

### Tray-Icon

In der macOS-Menüleiste (oben rechts) erscheint ein kleines glattt-Icon. Per Klick öffnet sich das Hauptfenster, per Rechtsklick ein Kontextmenü mit:

- **glatttHub öffnen** — Hauptfenster anzeigen
- **Admin-Panel** — Admin-Bereich in eigenem Fenster
- **Beenden** — App komplett schließen

### Voraussetzungen

- macOS 10.15 (Catalina) oder neuer
- Internetverbindung (die App lädt die Website vom Server)

### Unterschied zur PWA (Browser-App)

| | PWA (Browser) | Desktop-App |
|---|---------------|-------------|
| Erscheint in Spotlight | ❌ | ✅ |
| Eigenes Dock-Icon | ⚠️ Chrome-Icon | ✅ glattt-Icon |
| Cmd+Tab | ⚠️ Chrome | ✅ glatttHub |
| Kein Browser nötig | ❌ | ✅ |
| Overlay-Titelleiste | ❌ | ✅ Schlankes Design |
| Admin-Panel in eigenem Fenster | ❌ | ✅ Cmd+Shift+A |
| Menüleiste | ❌ | ✅ Deutsch |
| Tray-Icon | ❌ | ✅ |
| Push-Benachrichtigungen | ✅ (im Browser) | ✅ (native macOS) |
| Push im Hintergrund | ✅ (Service Worker) | ⚠️ Nur bei offener App |

---

## Für Entwickler

### Architektur

Die Desktop-App ist ein **Electron-Wrapper**. Electron öffnet ein Chromium-basiertes BrowserWindow und lädt die Produktions-URL. Es wird kein lokaler Code der Laravel-App ausgeführt.

```
┌─────────────────────────────────────────────────┐
│  glatttHub.app (Electron)                       │
│  ┌───────────────────────────────────────────┐  │
│  │  ┌─ Traffic Lights ─┐  Drag-Region (CSS)  │  │
│  │  │ 🔴 🟡 🟢         │                      │  │
│  │  └──────────────────┘                      │  │
│  │         BrowserWindow (Chromium)           │  │
│  │                                            │  │
│  │       https://hub.glattt.com               │  │  ← Alles vom Server
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│  Main Process: Menü, Tray, CSS-Injection         │
│  Preload: Drag-Region, electron-app Klasse       │
└──────────────────────────────────────────────────┘
```

### Dateistruktur

```
electron/
├── main.cjs                 # Hauptprozess: Fenster, Menü, Tray, CSS-Injection
├── preload.cjs              # Drag-Region injizieren, electron-app Body-Klasse
├── patch-dev.sh             # Patcht Electron.app für Dev (Name, Icon, Identifier)
├── build-icns.sh            # Erstellt .icns aus Icon Composer Exports
├── update-web-icons.sh      # Aktualisiert Web-App Icons aus Icon Composer Exports
├── icons/
│   ├── glatttHub_Icon.icon  # Apple Icon Composer Asset (für Build)
│   ├── icon.icns            # macOS App-Icon (.icns Fallback)
│   ├── icon.png             # PNG-Fallback für Dev-Modus
│   ├── tray-icon.png        # Tray-Icon 22×22 (Template Image)
│   └── tray-icon@2x.png    # Tray-Icon 44×44 (Template Image)
└── dist/                    # Build-Ausgabe (.app, .dmg, .zip)
```

### Build-Konfiguration (`package.json`)

| Einstellung | Wert | Beschreibung |
|------------|------|-------------|
| `build.appId` | `com.glattt.hub` | Bundle-Identifier |
| `build.productName` | `glatttHub` | App-Name in Dock/Spotlight |
| `build.mac.icon` | `electron/icons/glatttHub_Icon.icon` | Apple Icon Composer Asset |
| `build.mac.category` | `public.app-category.business` | macOS App-Kategorie |
| `build.mac.target` | `["dmg", "zip"]` | Build-Targets |
| `build.mac.minimumSystemVersion` | `10.15` | Catalina+ |
| `build.directories.output` | `electron/dist` | Build-Ausgabeverzeichnis |

### Main-Prozess (`main.cjs`)

Der Main-Prozess ist in logische Abschnitte gegliedert:

#### URLs & Navigation

```javascript
const APP_URL = 'https://hub.glattt.com';
const ADMIN_URL = 'https://hub.glattt.com/admin';
const ALLOWED_DOMAINS = [
  'hub.glattt.com',
  'accounts.google.com',      // Google OAuth
  'accounts.youtube.com',     // Google Auth
  'login.microsoftonline.com', // Microsoft Auth
  'iap.googleapis.com',       // Identity-Aware Proxy
];
```

Nicht-erlaubte URLs werden automatisch im System-Browser geöffnet.

#### CSS-Injection

CSS wird über `webContents.insertCSS()` im `dom-ready`-Event injiziert. Diese Methode ist persistent über SPA-Navigation (Livewire `wire:navigate`), im Gegensatz zu DOM-basierter Injection die bei Navigation verloren geht.

Injiziertes CSS:

| CSS-Regel | Zweck |
|-----------|-------|
| `#electron-drag-region` | 38px Drag-Region oben (Fenster verschieben) |
| `.fi-sidebar-header`, `.fi-topbar` | 38px Padding für Traffic Lights (Filament) |
| `nav.hub-nav`, `.hub-topbar` | 38px Padding für Traffic Lights (Hub-Layout) |
| `a, button, input, ...` | `-webkit-app-region: no-drag` für klickbare Elemente |
| `::-webkit-scrollbar` | Scrollbar ausblenden |

#### Child-Windows

Das Admin-Panel (Cmd+Shift+A) öffnet in einem eigenen Fenster. Child-Windows werden dedupliziert: Ist das Fenster für eine URL bereits offen, wird es fokussiert statt ein neues zu öffnen.

#### User-Agent

`Electron/X.X.X` wird aus dem User-Agent entfernt, damit Google OAuth funktioniert (Google blockiert Logins aus Electron).

### Preload-Script (`preload.cjs`)

Das Preload-Script hat zwei Aufgaben:

1. **Drag-Region**: Erstellt ein `#electron-drag-region` div am Anfang des Body
2. **Electron-Erkennung**: Setzt `document.body.classList.add('electron-app')`

Die Drag-Region wird bei drei Events neu erstellt (Sickerheit gegen SPA-Navigation):

- `DOMContentLoaded` — Erster Seitenaufbau
- `livewire:navigated` — Nach Livewire SPA-Navigation
- `setInterval(ensureDragRegion, 1000)` — Fallback

### Electron-Erkennung in der Web-App

Die Web-App erkennt die Electron-Umgebung über die CSS-Klasse:

```javascript
const isElectron = document.body.classList.contains('electron-app');
```

Wird aktuell für Push-Notifications genutzt:

- Electron gewährt `Notification.permission` automatisch (`'granted'`)
- Ohne Erkennung würde direkt subscribed werden (kein Opt-in-Dialog)
- Mit Erkennung: Modal wird trotzdem gezeigt → User entscheidet aktiv
- Device-Name wird auf `'glatttHub Desktop App'` gesetzt

### Push-Notifications (Technisch)

Die Desktop-App nutzt **native APNs** (Apple Push Notification Service) statt WebPush/Service Worker.

```
Browser (WebPush):                 Electron (APNs):
────────────────                   ───────────────
Permission = 'default'             window.electronPush Bridge verfügbar
→ Modal zeigen                     → Modal zeigen (Opt-in)
→ User klickt "Aktivieren"         → User klickt "Aktivieren"
→ requestPermission()              → electronPush.registerForApnsNotifications()
→ Service Worker subscribiert      → APNs-Token vom System empfangen
→ WebPush-Endpoint auf Server      → Token + Device-ID auf Server gespeichert
                                   → Versand via edamov/pushok (PHP)
                                   → Dock-Badge via app.setBadgeCount()
```

#### APNs-Erkennung (`isElectronNativeSupported()`)

`push-notifications.js` erkennt die Electron-Umgebung durch **Live-Abfrage** von `window.electronPush`:

```javascript
isElectronNativeSupported() {
    const bridge = this.getElectronBridge(); // Immer frisch, nicht gecacht!
    return bridge !== null
        && typeof bridge.registerForApnsNotifications === 'function';
}
```

!!! warning "Kein Caching"
    `this.electronBridge` wird im Konstruktor gesetzt — zu diesem Zeitpunkt kann `window.electronPush` noch nicht verfügbar sein. Daher immer `getElectronBridge()` frisch aufrufen.

#### Preload Bridge (`preload.cjs`)

Zwei Bridges werden exposed:

```javascript
// Push-Registrierung
contextBridge.exposeInMainWorld('electronPush', {
  registerForApnsNotifications: () => ipcRenderer.invoke('electron-push:register'),
  unregisterForApnsNotifications: () => ipcRenderer.invoke('electron-push:unregister'),
  onApnsNotification: (callback) => { ... },
});

// Dock-Badge
contextBridge.exposeInMainWorld('electronBadge', {
  setBadgeCount: (count) => ipcRenderer.send('electron-badge:set', count),
});
```

#### Dock-Badge

Nach jedem `loadNotifications()` wird der Badge im Dock aktualisiert:

```javascript
if (window.electronBadge?.setBadgeCount) {
    window.electronBadge.setBadgeCount(data.unread_count);
}
```

Im Main-Prozess:
```javascript
ipcMain.on('electron-badge:set', (_event, count) => {
    app.setBadgeCount(count > 0 ? count : 0);
});
```

**Relevante Dateien:**

| Datei | Zweck |
|-------|-------|
| `resources/views/layouts/hub.blade.php` | Push-Permission-Modal (Alpine.js) |
| `public/js/push-notifications.js` | PushNotificationManager Klasse |
| `public/sw.js` | Service Worker für WebPush (Browser) |
| `app/Http/Controllers/Push/PushNotificationController.php` | API-Controller |
| `app/Services/PushNotificationService.php` | Push-Orchestrierung |
| `app/Services/ApplePushNotificationService.php` | APNs-Versand via pushok |

### Icons

#### App-Icon

Das App-Icon wird im **Apple Icon Composer** (.icon-Format) erstellt und von `electron-builder` via `actool` (Xcode) zu `Assets.car` kompiliert.

!!! warning "Xcode erforderlich"
    Der Build benötigt eine Xcode-Installation für die `actool`-Kompilierung des `.icon`-Assets.

**Wichtig:** Kein `app.dock.setIcon()` im Code verwenden — das überschreibt das native `.icns` mit falscher Größe/Format.

#### Tray-Icon

macOS-Menüleisten-Icon als **Template Image**:

- Schwarz (#000000) auf transparentem Hintergrund
- `tray-icon.png`: 22×22 Pixel (@1x)
- `tray-icon@2x.png`: 44×44 Pixel (@2x)
- Als Template markiert → macOS passt Farbe an Hell/Dunkel-Modus an

### Build-Befehle

```bash
# Development (öffnet App, verbindet mit Produktions-URL)
npm run electron:dev

# Production Build (.app + .dmg + .zip) — mit Signing
npm run electron:build

# Nur DMG
npm run electron:build:dmg

# Nur PKG für MDM-Verteilung — mit Signing + Notarization
npm run electron:build:mdm
```

Für signierten Build vor dem Ausführen im Terminal:

```bash
export CSC_NAME="Labrado & Schluter GmbH (63DQ6FV92R)"
export APPLE_API_KEY=/Applications/MAMP/htdocs/glattthub/storage/app/private/AuthKey_7FJYWAUF5W.p8
export APPLE_API_KEY_ID=7FJYWAUF5W
export APPLE_API_ISSUER=84f1cc63-769a-4ea0-b54f-636f28ccbbaa
```

**Ergebnisse:**

```
electron/dist/
├── mac-arm64/
│   └── glatttHub.app               # Signierte App (intern)
└── glatttHub-1.0.0.pkg             # PKG-Installer für MDM
```

### Dev-Modus

`npm run electron:dev` startet die Electron-Entwicklungsversion. Beim `npm install` wird automatisch `patch-dev.sh` ausgeführt, das:

1. `CFBundleDisplayName` → `glatttHub` setzt
2. `CFBundleName` → `glatttHub` setzt
3. `CFBundleIdentifier` → `com.glattt.hub` setzt
4. Das App-Icon in die lokale `Electron.app` kopiert

### Dependencies

| Paket | Version | Zweck |
|-------|---------|-------|
| `electron` | ^41.2.0 | Core-Framework |
| `electron-builder` | ^26.8.1 | Build & Packaging |

### Code Signing & Notarization

Die App ist vollständig mit Apple Developer ID signiert und notarisiert.

#### Apple Developer Credentials

| Credential | Wert |
|---|---|
| **Team ID** | `63DQ6FV92R` |
| **Bundle ID** | `com.glattt.hub` |
| **Developer ID Application** | `Labrado & Schluter GmbH (63DQ6FV92R)` — im Schlüsselbund, gültig bis 22.04.2031 |
| **Developer ID Installer** | `Labrado & Schluter GmbH (63DQ6FV92R)` — im Schlüsselbund, gültig bis 22.04.2031 |
| **APNs Key ID** | `4VXP44Y6GY` — für Push Notifications |
| **Notarization Key ID** | `7FJYWAUF5W` — App Store Connect API Key |
| **Issuer ID** | `84f1cc63-769a-4ea0-b54f-636f28ccbbaa` |

#### Signing-Dateien (nicht in Git)

```
electron/signing/
└── glatttHub.provisionprofile   # Developer ID Provisioning Profile

storage/app/private/
├── AuthKey_4VXP44Y6GY.p8        # APNs Key (Push Notifications → Laravel)
└── AuthKey_7FJYWAUF5W.p8        # App Store Connect API Key (Notarization → Build)
```

!!! warning "Geheime Dateien"
    Alle `.p8`-Dateien und das Provisioning Profile dürfen **niemals** in das Git-Repo eingecheckt werden.
    Sie sind in `.gitignore` ausgeschlossen.

#### Notarization-Prozess

Der Notarization-Hook (`electron/notarize.cjs`) wird von `electron-builder` automatisch nach dem Signing aufgerufen:

1. App wird mit Developer ID signiert
2. `notarize.cjs` lädt die App bei Apple hoch (`notarytool`)
3. Apple prüft die App (~2-5 Minuten)
4. Bei Erfolg: Apple-Stempel wird in die App eingebettet (Stapling via `electron-builder`)
5. PKG wird erstellt

### Verteilung

| Methode | Format | Status |
|---------|--------|--------|
| MDM (Miradore, Mosyle, Jamf, etc.) | `.pkg` | ✅ Signiert & notarisiert |
| Direkter Download | `.dmg` | ✅ Signiert & notarisiert |
| ZIP-Archiv | `.zip` | ✅ Signiert & notarisiert |
| Mac App Store | — | Nicht geplant |

#### MDM-Verteilung via Miradore

**Miradore → Management → Applications → Add → macOS**

| Feld | Wert |
|------|------|
| **File** | `electron/dist/glatttHub-1.0.0-arm64.pkg` |
| **Application name** | `glatttHub` |
| **Bundle identifier** | `com.glattt.hub` |
| **Version** | `1.0.0` |

Nach dem Upload: **Deploy** → Geräte auswählen → Installieren.

!!! info "Push-Registrierung nach MDM-Installation"
    Nach einer Neuinstallation muss der User die Push-Benachrichtigungen einmal neu bestätigen, da ein neuer APNs-Token generiert wird. Das Opt-in-Modal erscheint automatisch beim ersten Start.

### Bekannte Einschränkungen

| Einschränkung | Beschreibung |
|--------------|-------------|
| **Kein Offline-Modus** | App braucht Internet — zeigt Fehler wenn offline |
| **Push nur bei offener App** | Kein Background Push wie bei nativen Apps oder Browser (Service Worker) |
| **Kein Auto-Updater** | Noch nicht implementiert — Update = neue `.pkg` per MDM verteilen |
| **Nur macOS/arm64** | Kein Intel-Build, kein Windows/Linux (aktuell nicht benötigt) |
| **Neuer APNs-Token nach Neuinstallation** | Nach PKG-Reinstall muss Push-Banner neu bestätigt werden (`localStorage.removeItem('push-banner-dismissed')`) |

### Relevante Dateien

| Datei | Beschreibung |
|-------|-------------|
| `electron/main.cjs` | Hauptprozess: Fenster, Menü, Tray, CSS-Injection, APNs-Handler, Badge |
| `electron/preload.cjs` | Drag-Region, electron-app Klasse, electronPush Bridge, electronBadge Bridge |
| `electron/notarize.cjs` | afterSign-Hook für Notarization |
| `electron/electron-builder.config.cjs` | Build-Konfiguration (Signing, Notarization, PKG) |
| `electron/entitlements.mac.plist` | macOS Entitlements (Push: `aps-environment: production`, Hardened Runtime) |
| `electron/signing/glatttHub.provisionprofile` | Provisioning Profile (nicht in Git) |
| `storage/app/private/AuthKey_4VXP44Y6GY.p8` | APNs Key (nicht in Git) |
| `storage/app/private/AuthKey_7FJYWAUF5W.p8` | Notarization Key (nicht in Git) |
| `app/Services/ApplePushNotificationService.php` | APNs-Versand (edamov/pushok, Key aus ENV via /tmp) |
