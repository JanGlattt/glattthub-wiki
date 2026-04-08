# Desktop-App (Tauri)

Native macOS Desktop-App für glatttHub — ein leichtgewichtiger Tauri-Wrapper um die Web-App.

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
| **Spotlight-Suche** | „glatttHub" eingeben → App öffnen |
| **Cmd+Tab** | Eigenes Icon in der App-Umschaltung |
| **Deutsche Menüleiste** | glatttHub, Bearbeiten, Darstellung, Fenster |
| **Tastenkürzel** | Cmd+R = Neu laden, Cmd+Q = Beenden |
| **Immer aktuell** | Die Website wird live geladen — Inhalte sind immer aktuell |

### Menüleiste

| Menü | Einträge |
|------|---------|
| **glatttHub** | Über glatttHub, Ausblenden, Andere ausblenden, Beenden |
| **Bearbeiten** | Widerrufen, Wiederholen, Ausschneiden, Kopieren, Einsetzen, Alles auswählen |
| **Darstellung** | Neu laden (Cmd+R), Vollbild |
| **Fenster** | Minimieren, Maximieren, Fenster schließen |

### Voraussetzungen

- macOS 10.15 (Catalina) oder neuer
- Internetverbindung (die App lädt die Website vom Server)

### Unterschied zur PWA (Browser-App)

| | PWA (Browser) | Desktop-App |
|---|---------------|-------------|
| Erscheint in Spotlight | ❌ | ✅ |
| Eigenes Dock-Icon | ⚠️ Chrome-Icon | ✅ glattt-Icon |
| Cmd+Tab | ⚠️ Chrome | ✅ glatttHub |
| Kein Browser nötig | ❌ | ✅ (nutzt macOS WebKit) |
| Menüleiste | ❌ | ✅ Deutsch |
| Auto-Update | ❌ | ✅ (vorbereitet) |
| Dateigröße | — | ~3 MB |

---

## Für Entwickler

### Architektur

Die Desktop-App ist ein **Tauri v2 Wrapper**. Tauri öffnet ein natives macOS-Fenster mit eingebautem WebKit-WebView und lädt die Produktions-URL. Es wird kein lokaler Code der Laravel-App ausgeführt.

```
┌─────────────────────────────────┐
│  glatttHub.app (Tauri v2)       │  ← ~3 MB, Rust-Binary
│  ┌───────────────────────────┐  │
│  │   WebView (macOS WebKit)  │  │
│  │                           │  │
│  │  https://hub.glattt.com   │  │  ← Alles vom Server
│  │                           │  │
│  └───────────────────────────┘  │
│  Deutsche Menüleiste (Rust)     │
│  Auto-Updater Plugin            │
└─────────────────────────────────┘
```

### Dateistruktur

```
src-tauri/
├── tauri.conf.json          # App-Konfiguration (URL, Fenster, Icons, Updater)
├── Cargo.toml               # Rust-Dependencies
├── build.rs                 # Tauri Build-Script
├── src/
│   ├── main.rs              # Entry Point (6 Zeilen)
│   └── lib.rs               # App-Logik: deutsche Menüleiste, Updater, Fenster
└── icons/
    ├── 32x32.png            # Taskbar-Icon
    ├── 128x128.png          # Standard-Icon
    ├── 128x128@2x.png       # Retina-Icon
    ├── icon.icns            # macOS App-Icon
    ├── icon.ico             # Windows-Icon (Reserve)
    └── icon.png             # Allgemeines Icon
```

### Konfiguration (`tauri.conf.json`)

| Einstellung | Wert | Beschreibung |
|------------|------|-------------|
| `productName` | `glatttHub` | App-Name in Dock/Spotlight |
| `identifier` | `com.glattt.hub` | Bundle-Identifier |
| `build.frontendDist` | `https://hub.glattt.com` | Externe URL — keine lokalen Assets |
| `app.windows[0].width` | `1280` | Standard-Fensterbreite |
| `app.windows[0].height` | `800` | Standard-Fensterhöhe |
| `app.windows[0].minWidth` | `1024` | Minimale Fensterbreite |
| `app.windows[0].minHeight` | `700` | Minimale Fensterhöhe |
| `app.windows[0].titleBarStyle` | `Visible` | Standard macOS-Titelleiste |
| `bundle.targets` | `["dmg", "app"]` | Erzeugt `.app` und `.dmg` |
| `bundle.macOS.minimumSystemVersion` | `10.15` | Catalina+ |

### Rust-Dependencies (`Cargo.toml`)

| Crate | Version | Zweck |
|-------|---------|-------|
| `tauri` | `2` | Core-Framework |
| `tauri-plugin-opener` | `2` | Links in externem Browser öffnen |
| `tauri-plugin-updater` | `2` | Auto-Update-Funktionalität |
| `serde` / `serde_json` | `1` | JSON-Serialisierung |

### Deutsche Menüleiste (`src/lib.rs`)

Die Menüleiste wird in Rust aufgebaut mit `tauri::menu` und verwendet `PredefinedMenuItem` mit deutschen Bezeichnungen. Jedes Menü-Item wird mit einem deutschen Label überschrieben:

```rust
PredefinedMenuItem::about(app, Some("Über glatttHub"), None)
PredefinedMenuItem::quit(app, Some("glatttHub beenden"))
PredefinedMenuItem::copy(app, Some("Kopieren"))
// etc.
```

Benutzerdefinierte Menü-Items (z.B. „Neu laden") verwenden `MenuItemBuilder::with_id` und werden in `on_menu_event` abgefangen.

### Build-Befehle

```bash
# Voraussetzung: Rust installiert
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Development (öffnet App direkt)
npm run tauri:dev

# Production Build (erzeugt .app + .dmg)
npm run tauri:build

# Ergebnisse:
# src-tauri/target/release/bundle/macos/glatttHub.app
# src-tauri/target/release/bundle/dmg/glatttHub_1.0.0_aarch64.dmg
```

**Erster Build** kompiliert alle Rust-Dependencies und dauert ca. 1–2 Minuten. Folge-Builds (nur eigener Code geändert) dauern ca. 15–20 Sekunden.

### Auto-Updater

Der Updater ist als Plugin eingebunden und prüft den Endpoint:

```
https://storage.googleapis.com/glattthub-public/tauri/update.json
```

**Wichtig:** Der Updater betrifft nur das Tauri-Kostüm (Menüleiste, Fenster-Config, Tauri-Version). Die Website selbst ist immer aktuell, da sie direkt vom Server geladen wird.

#### Update-JSON Format

```json
{
  "version": "1.1.0",
  "notes": "Deutsche Menüleiste verbessert",
  "pub_date": "2026-04-08T12:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "url": "https://storage.googleapis.com/glattthub-public/tauri/glatttHub_1.1.0_aarch64.dmg",
      "signature": "..."
    }
  }
}
```

**Aktivierung:** Der Updater benötigt ein Schlüsselpaar (`pubkey` in `tauri.conf.json`). Solange `pubkey` leer ist, ist der Updater inaktiv.

### Code Signing (ausstehend)

Ohne Code Signing zeigt macOS beim ersten Öffnen eine Warnung. Nach Erhalt des Apple Developer Accounts:

1. Signing Identity in `tauri.conf.json` unter `bundle.macOS.signingIdentity` eintragen
2. `bundle.createUpdaterArtifacts` aktivieren
3. Notarization mit `providerShortName` konfigurieren

### Verteilung

| Methode | Format | Status |
|---------|--------|--------|
| Download-Link | `.dmg` | ✅ Bereit (hochladen auf GCS) |
| MDM | `.pkg` | Möglich (Tauri kann `.pkg` erzeugen) |
| Mac App Store | — | Nicht geplant |

### Bekannte Einschränkungen

- **Overlay-Titelleiste** (`titleBarStyle: "Overlay"`) funktioniert nicht zuverlässig mit externen URLs, da `data-tauri-drag-region` / `-webkit-app-region: drag` nicht in Remote-HTML injiziert werden kann. Daher wird `"Visible"` verwendet.
- **Offline:** Die App benötigt eine Internetverbindung — ohne Netz erscheint eine leere Seite.
- **DMG-Bundling** kann auf manchen Systemen fehlschlagen, wenn ein altes DMG noch gemountet ist. Die `.app` wird trotzdem korrekt erzeugt.

### Relevante Dateien

| Datei | Beschreibung |
|-------|-------------|
| `src-tauri/tauri.conf.json` | Haupt-Konfiguration |
| `src-tauri/src/lib.rs` | App-Logik + deutsche Menüleiste |
| `src-tauri/src/main.rs` | Entry Point |
| `src-tauri/Cargo.toml` | Rust-Dependencies |
| `src-tauri/icons/` | App-Icons (alle Größen) |
| `package.json` | npm-Scripts (`tauri:dev`, `tauri:build`) |
| `.gitignore` | `src-tauri/target/` und `src-tauri/gen/` ausgeschlossen |
