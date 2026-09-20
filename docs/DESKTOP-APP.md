# Desktop-App (Electron)

Native macOS Desktop-App für glatttHub — ein Electron-Wrapper um die Web-App.

---

## Für Endanwender

!!! nutzerhandbuch "Bedienung: Grundlagen 7 – Die Desktop-App: Tabs & Rechtsklick"
    Die Desktop-App ist der glatttHub in einem eigenen Fenster mit eigenem Symbol im Dock — auf den Macs der Institute und im Büro im Einsatz. Alle Abläufe sind dieselben wie im Browser ([Serie „Grundlagen"](https://hilfe.hub.glattt.com/grundlagen/)); was die App zusätzlich kann — Tab-Leiste, Zurück/Vor/Neu laden, Rechtsklick-Menü auf Kunde/Vertrag/Fall und auf Tabs, Tastenkürzel — zeigt [Grundlagen 7](https://hilfe.hub.glattt.com/grundlagen/7/). Dieser Abschnitt erklärt Installation und Updates.

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
| **Tabs** (seit 1.1.0) | Mehrere Hub-Seiten nebeneinander in einem Fenster, Tab-Leiste in der Titelzeile — neuer Tab per ⌘T oder „+", Wechsel per Klick, ⌃Tab oder ⌘1…9, schließen per ⌘W oder Kreuz. Rechtsklick auf einen Link (oder eine Kundenzeile) → „Link in neuem Tab öffnen", ⌘-Klick ebenso. Alles, was bisher ein neues Fenster öffnete (Admin-Panel, Formular-Vorschau, PDFs), wird zum Tab |
| **Zurück / Vor / Neu laden** (seit 1.1.0) | Drei Knöpfe links in der Tab-Leiste, wirken auf den aktiven Tab (jeder Tab hat seinen eigenen Verlauf); Kürzel ⌘[ ⌘] ⌘R |
| **Rechtsklick-Menü** (seit 1.1.1) | Eigenes Menü im glattt-Look statt Browser-Menü. Auf einem Kunden, Vertrag oder Forderungsfall (Zeile, Karte, Link oder die Detailseite selbst) zeigt es oben, worum es geht, und bietet: öffnen, in neuem Tab öffnen, direkt zu einem Reiter (Termine, Pakete, Zahlungen, Ratenzahlung …), Kunde/Vertrag öffnen, Kunden-/Vertragsnummer kopieren. In Eingabefeldern Ausschneiden/Kopieren/Einsetzen, überall Zurück/Vorwärts/Neu laden. Rechtsklick auf einen Tab: Neu laden, Duplizieren, Tab/andere Tabs/Tabs rechts schließen |
| **Tabs sortieren** (seit 1.1.1) | Tabs in der Leiste per Drag & Drop verschieben; die Reihenfolge gilt auch für ⌘1…9 |
| **Overlay-Titelleiste** | Schlankes Design mit macOS Traffic Lights (Schließen/Minimieren/Maximieren) |
| **Spotlight-Suche** | „glatttHub" eingeben → App öffnen |
| **Cmd+Tab** | Eigenes Icon in der App-Umschaltung |
| **Deutsche Menüleiste** | glatttHub, Bearbeiten, Darstellung, Fenster, Hilfe |
| **Tray-Icon** | Schnellzugriff über die macOS-Menüleiste |
| **Admin-Panel** | Eigener Tab für das Filament Admin-Panel (Cmd+Shift+A) |
| **Push-Benachrichtigungen** | Native macOS-Benachrichtigungen (Opt-in beim ersten Start) |
| **Tastenkürzel** | Cmd+T = Neuer Tab, Cmd+W = Tab schließen, Cmd+Shift+W = Fenster schließen, Cmd+[ / Cmd+] = Zurück/Vor, Cmd+R = Neu laden, Cmd+Shift+A = Admin-Panel, Cmd+Q = Beenden |
| **Immer aktuell** | Die Website wird live geladen — Inhalte sind immer aktuell |

### Menüleiste

| Menü | Einträge |
|------|---------|
| **glatttHub** | Über glatttHub, Ausblenden, Andere ausblenden, Alle einblenden, Beenden |
| **Bearbeiten** | Widerrufen, Wiederholen, Ausschneiden, Kopieren, Einsetzen, Alles auswählen |
| **Darstellung** | Zurück (Cmd+[), Vorwärts (Cmd+]), Neu laden (Cmd+R), Vergrößern, Verkleinern, Originalgröße, Vollbild |
| **Tabs** | Neuer Tab (Cmd+T), Tab schließen (Cmd+W), Nächster/Vorheriger Tab (Ctrl+Tab / Ctrl+Shift+Tab), Tab 1–8 (Cmd+1…8), Letzter Tab (Cmd+9), Admin-Panel öffnen (Cmd+Shift+A) |
| **Fenster** | Minimieren, Maximieren, Fenster schließen (Cmd+Shift+W), Alle nach vorne |
| **Hilfe** | glatttHub Wiki (öffnet im Browser) |

### Push-Benachrichtigungen

Beim ersten Start der App erscheint ein Dialog, der fragt ob du Push-Benachrichtigungen aktivieren möchtest. Nach Klick auf „Aktivieren" zeigt macOS seinen eigenen Bestätigungs-Dialog. Danach erhältst du Benachrichtigungen direkt auf deinem Mac — solange die App geöffnet ist.

!!! info "Hinweis"
    Push-Benachrichtigungen funktionieren nur, wenn die App im Hintergrund oder Vordergrund läuft. Wird die App komplett beendet (Cmd+Q), werden keine Benachrichtigungen empfangen.

### Tray-Icon

In der macOS-Menüleiste (oben rechts) erscheint ein kleines glattt-Icon. Per Klick öffnet sich das Hauptfenster, per Rechtsklick ein Kontextmenü mit:

- **glatttHub öffnen** — Hauptfenster anzeigen
- **Admin-Panel** — Admin-Bereich in eigenem Tab
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
| Tabs im Fenster | ⚠️ Browser-Tabs | ✅ Tab-Leiste mit Zurück/Vor/Neu laden |
| Admin-Panel in eigenem Tab | ❌ | ✅ Cmd+Shift+A |
| Menüleiste | ❌ | ✅ Deutsch |
| Tray-Icon | ❌ | ✅ |
| Push-Benachrichtigungen | ✅ (im Browser) | ✅ (native macOS) |
| Push im Hintergrund | ✅ (Service Worker) | ⚠️ Nur bei offener App |

---

## Für Entwickler

### Architektur

Die Desktop-App ist ein **Electron-Wrapper**. Electron öffnet ein Chromium-basiertes BrowserWindow und lädt die Produktions-URL. Es wird kein lokaler Code der Laravel-App ausgeführt.

Seit 1.1.0 (20.09.2026) ist das Fenster **tab-fähig**: Der Inhalt des `BrowserWindow`
selbst ist nur die 38 px hohe Tab-Leiste (`tabbar.html`); jede Hub-Seite läuft in einer
eigenen `WebContentsView` darunter. Alle Views teilen sich die Standard-Session — ein Login
für alle Tabs.

```
┌──────────────────────────────────────────────────────────┐
│  glatttHub.app (Electron)                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🔴🟡🟢  ‹ › ↻ │ Start │ Kundendetails ✕ │ +        │  │  ← BrowserWindow-WebContents
│  ├────────────────────────────────────────────────────┤  │     (tabbar.html, 38 px, Drag-Region)
│  │                                                    │  │
│  │   WebContentsView je Tab (y = 38, volle Breite)    │  │  ← https://hub.glattt.com
│  │   nur der aktive Tab ist sichtbar                  │  │     (alles vom Server)
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│  Main: tabs.cjs (TabManager), Menü, Tray, CSS-Injection  │
│  Preload je Tab: electron-app Klasse, ⌘-Klick, Theme     │
└──────────────────────────────────────────────────────────┘
```

!!! warning "Warum die Leiste im Fenster-WebContents liegt und nicht in einer View"
    Eine `WebContentsView` im Bereich der versteckten macOS-Titelleiste
    (`titleBarStyle: 'hiddenInset'`) bekommt **keine Mausklicks** — jeder Druck zieht das
    Fenster. Nur die WebContents des `BrowserWindow` selbst reichen Klicks dort durch.
    Deshalb: Leiste = Fensterinhalt, Seiten = Views ab y = 38. Außerdem gelten
    `-webkit-app-region: drag`-Zonen **fensterweit** über alle WebContents hinweg: Die
    Drag-Zone liegt darum nur auf `.strip` (38 px), nie auf dem `body` der Leiste, und die
    Seite blendet ihre eigene `#electron-drag-region` aus, sobald sie unter der Leiste
    läuft (Body-Klasse `electron-tabs-visible`). Beide Befunde vom 20.09.2026, siehe
    `.github/knowledge/electron-webcontentsview-titelleiste-klicks.md`.

### Dateistruktur

```
electron/
├── main.cjs                 # Hauptprozess: Fenster, Menü, Tray, CSS-Injection, Push
├── tabs.cjs                 # TabManager: Views je Tab, Leiste, Kontextmenüs, Zurück/Vor
├── tabbar.html              # Tab-Leiste (Fensterinhalt, 38 px): Knöpfe, Tabs, Drag-Zone
├── tabbar-preload.cjs       # IPC-Brücke der Leiste (Zustand rein, Aktionen raus)
├── context-menu.cjs         # Kontextmenü-Renderer (Seiten + Tab-Leiste), Heroicons
├── context-menu.css         # Optik des Kontextmenüs (injiziert / von der Leiste geladen)
├── preload.cjs              # Preload je Tab: electron-app Klasse, Theme-Meldung, ⌘-Klick
├── release.sh               # Release: Build + PKG/DMG nachbessern + Notarisierung mit Wiederholung
├── patch-dev.sh             # Patcht Electron.app für Dev (Name, Icon, Identifier)
├── icon-exports.sh          # Helfer: Icon-Composer-Exporte nach Pixelgröße finden (beide Namensschemata)
├── build-icns.sh            # Erstellt .icns/.png aus Icon Composer Exports
├── update-web-icons.sh      # Aktualisiert Web-App Icons (PWA) aus Icon Composer Exports
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
| `build.mac.target` | `["dmg", "zip", "pkg"]` | Build-Targets |
| `build.mac.minimumSystemVersion` | `10.15` | Catalina+ |
| `build.directories.output` | `electron/dist` | Build-Ausgabeverzeichnis |

### Main-Prozess (`main.cjs`)

Der Main-Prozess ist in logische Abschnitte gegliedert:

#### URLs & Navigation

```javascript
const APP_URL = process.env.GLATTTHUB_URL || 'https://hub.glattt.com';
const ADMIN_URL = `${APP_URL}/admin`;
const ALLOWED_DOMAINS = [
  new URL(APP_URL).hostname,
  'accounts.google.com',      // Google OAuth
  'accounts.youtube.com',     // Google Auth
  'login.microsoftonline.com', // Microsoft Auth
  'iap.googleapis.com',       // Identity-Aware Proxy
];
```

Zwei Stufen: `isHubUrl()` (nur der Hub-Host) entscheidet, was ein **Tab** wird;
`isAllowedUrl()` (Hub + Login-Anbieter), was im Tab navigiert werden darf. Login-Popups
(Google/IAP brauchen `window.opener`) bleiben Popup-Fenster, alles andere geht in den
System-Browser. Zum Testen gegen Staging:
`GLATTTHUB_URL=https://staging.hub.glattt.com npm run electron:dev`.

#### Tabs (`tabs.cjs`)

| Aspekt | Umsetzung |
|---|---|
| Tab öffnen | `open(url, { activate })` — neue `WebContentsView` mit Seiten-Preload, `addChildView(view, 0)`; nur der aktive Tab ist `setVisible(true)` |
| `target="_blank"` / `window.open` | `setWindowOpenHandler`: Hub-URL → Tab, Login-Domain → Popup erlaubt, sonst `shell.openExternal` |
| Kontextmenü Seite | `context-menu`-Event: „Link in neuem Tab öffnen" (Hintergrund), „Link im Browser öffnen", „Link-Adresse kopieren", Bearbeiten-Rollen, „Seite in neuem Tab öffnen", „Neu laden" |
| Zeilen ohne Link | Listen mit JS-Navigation (Kunden, Widerrufe, Formular-Karten) tragen `:data-href`; `resolveDataHref()` liest per `executeJavaScript` das Element unter dem Zeiger (`elementFromPoint`) — so bekommt auch eine `@click`-Zeile „in neuem Tab öffnen" |
| ⌘-Klick | Seiten-Preload fängt Klicks mit Meta/Ctrl im Capture-Phase ab (`a[href]` oder `[data-href]`) und schickt `electron-tabs:open`; ⌘⇧ aktiviert den Tab |
| Kontextmenü Tab | Neu laden, Duplizieren, Tab schließen, Andere Tabs schließen |
| Zurück / Vor / Neu laden | `navigationHistory.goBack()/goForward()` und `reload()` des aktiven Tabs; Zustand (`canGoBack`/`canGoForward`) wird bei `did-navigate` und `did-navigate-in-page` (Livewire `wire:navigate`) neu gesendet |
| Titel | `page-title-updated` → Präfix „glatttHub - " abgeschnitten; Fenstertitel folgt dem aktiven Tab |
| Farbschema | Seiten-Preload meldet `html.dark` per `electron-theme:changed` (MutationObserver); nur der aktive Tab bestimmt die Leiste |
| Letzter Tab schließen | schließt das Fenster (wie ⌘W im Browser) |
| Admin-Panel | `openOrFocus(ADMIN_URL)` — vorhandenen Admin-Tab aktivieren statt neu öffnen |
| Push-Klick | `loadInActive(url)` lädt die Ziel-URL im aktiven Tab |

#### Kontextmenü (`context-menu.cjs`, `context-menu.css`)

Das Rechtsklick-Menü ist **kein** natives Menü, sondern ein DOM-Element im jeweiligen
Dokument („Glas-Karte mit Kopfzeile", Entscheidung Jan 20.09.2026): Lato, Theme-Farben
der Seite (hell/dunkel), Heroicons, Tastatur ↑↓⏎/Esc, schließt bei Klick daneben,
Scrollen, Größenänderung und Fokusverlust. Das Seiten-Preload fängt `contextmenu`
(Capture) ab, ruft `preventDefault()` und baut die Einträge:

| Kontext | Erkennung | Einträge |
|---|---|---|
| Kunde / Vertrag / Forderungsfall | `data-ctx="client\|contract\|case"` am nächsten Element (Zeile, Karte, Detailseiten-Wurzel mit `data-ctx-page`) — sonst Hub-URL des Links (`/hub/clients\|contracts\|receivables/…`); ein nackter Link („Zum Fall") in einer annotierten Zeile übernimmt deren Angaben | Kopf (Name · Nummer), `<Objekt> öffnen`, In neuem Tab öffnen, „direkt zu"-Reiter per URL-Anker, Kunde/Vertrag öffnen, Nummer kopieren |
| Widerruf, Formular | `data-ctx="cancellation\|form"` bzw. URL | Kopf + Öffnen / In neuem Tab |
| Sonstiger Hub-Link | `a[href]` / `[data-href]` | In neuem Tab öffnen, Öffnen und wechseln |
| Externer Link | Host ≠ Hub | Im Browser öffnen (`shell.openExternal`, nur http/https) |
| Eingabefeld / Markierung | `input`, `textarea`, `contenteditable` / Selection | Ausschneiden, Kopieren, Einsetzen, Alles auswählen (über `webContents.cut()` usw.) |
| Immer (am Ende) | — | Zurück, Vorwärts (Zustand per `electron-tabs:nav-state`), Neu laden, Seite in neuem Tab öffnen |
| Tab in der Leiste | `.tab` in `tabbar.html` | Neu laden, Duplizieren, Tab schließen, Andere Tabs schließen, Tabs rechts schließen |

Attribute je Typ: `client` — `-id` (Phorest-Client-ID), `-label` (Name), `-number`
(Kunden-Nr.); `contract` — `-id`, `-number` (Vertragsnummer), `-sub` (Kundenname),
`-client`; `case` — `-id`, `-sub` (Kundenname), `-number` (Kunden-Nr.), `-client`,
`-contract`. Ohne Attribute greift ein Rückfall (Name aus `.table-glattt-cell-primary`,
erster Zelle oder `.pipeline-card-glattt-name`, Kunden-Nr. aus dem Badge der Zeile) —
Notlösung, nicht Standard. Reiter-Anker: Kunde `#termine #pakete #vertrag-zahlungen
#forderungen #nachrichten`, Vertrag `#zahlungen #emails #verlauf`, Fall `#ratenzahlung
#gericht #verlauf`.

!!! warning "Das Tab-Menü wird im aktiven Tab gezeichnet"
    Das Leisten-Dokument liegt **unter** den Seiten-Views — ein Menü darin wäre ab
    38 px verdeckt. Die Leiste meldet deshalb nur Tab und Zeigerposition
    (`electron-tabs:tab-menu`), der Hauptprozess reicht sie um 38 px versetzt an den
    aktiven Tab weiter (`electron-ctx:tab-menu`), der das Menü zeichnet.

!!! warning "Pflicht bei jeder Seite"
    Wer eine Seite baut oder überarbeitet, denkt das Menü mit: `data-ctx` an
    Zeilen/Karten/Knöpfen zu Kunde, Vertrag, Fall; `:data-href` bei JS-Navigation;
    `data-ctx-page` an Detailseiten; neue Reiter mit Slug. Abgesichert durch
    `tests/Unit/DesktopContextMenuConventionTest.php`. Neue Objekttypen werden
    einmal in `preload.cjs` (`HUB_OBJECTS`, `objectItems`, `objectHeader`)
    beschrieben. Die Preloads laufen mit `sandbox: false`, damit sie
    `context-menu.cjs` per `require` laden können (contextIsolation bleibt an).

Die Seite setzt ihren Tab-Titel nach dem Nachladen der Daten über
`window.setPageTitle('…')` (`public/js/hub.js`): Kundenseite `Name (Kunden-Nr.)`, Vertrag
`Name · Vertrag NNN`, Forderungsfall `Name (Kunden-Nr.) · Fall #n` — gilt auch für
Browser-Tabs.

#### CSS-Injection

CSS wird über `webContents.insertCSS()` im `dom-ready`-Event injiziert. Diese Methode ist persistent über SPA-Navigation (Livewire `wire:navigate`), im Gegensatz zu DOM-basierter Injection die bei Navigation verloren geht.

Injiziertes CSS:

| CSS-Regel | Zweck |
|-----------|-------|
| `#electron-drag-region` | 38px Drag-Region oben (Fenster verschieben) — nur ohne Tab-Leiste; mit Leiste (`body.electron-tabs-visible`, seit 1.1.0 immer) ausgeblendet |
| `.fi-sidebar` (≥ 64rem), `.fi-sidebar-header`, `.fi-topbar` | 38px Versatz für Traffic Lights (Filament) — nur ohne Tab-Leiste |
| `nav.hub-nav`, `.hub-topbar` | 38px Padding für Traffic Lights (Hub-Layout) — nur ohne Tab-Leiste |
| `a, button, input, ...` | `-webkit-app-region: no-drag` für klickbare Elemente |
| `::-webkit-scrollbar` | Scrollbar ausblenden |

Die „nur ohne Tab-Leiste"-Regeln bleiben als Rückfallebene für eine App ohne Leiste; seit
1.1.0 beginnt jede Seite bereits unter der Leiste (y = 38) und braucht keinen Versatz.
Gleiches gilt für `body.electron-app:not(.electron-tabs-visible) .apt-detail-topbar` in
`theme_glattt.css` (Termine-Seite).

#### Kein Child-Window mehr

Bis 1.0.0 öffnete das Admin-Panel ein eigenes Fenster und jedes `target="_blank"` ein
nacktes Standard-Fenster ohne Drag-Region. Seit 1.1.0 wird beides zum Tab (siehe oben).

#### User-Agent

`Electron/X.X.X` wird aus dem User-Agent entfernt, damit Google OAuth funktioniert (Google blockiert Logins aus Electron).

### Preload-Script (`preload.cjs`)

Das Preload-Script (läuft in jedem Tab) hat vier Aufgaben:

1. **Drag-Region**: Erstellt ein `#electron-drag-region` div am Anfang des Body (per CSS ausgeblendet, sobald die Seite unter der Tab-Leiste läuft)
2. **Electron-Erkennung**: Setzt `document.body.classList.add('electron-app')` (und `electron-tabs-visible` auf Zuruf des Hauptprozesses)
3. **Farbschema melden**: `html.dark` → `electron-theme:changed` für die Tab-Leiste
4. **⌘-Klick**: Links und `[data-href]`-Zeilen mit Meta/Ctrl in einem neuen Tab öffnen

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

#### Abo-Zustand: Server-Abfrage statt Service Worker

Der entscheidende Unterschied zum Browser: Dort weiß der Service Worker
**lokal**, ob ein Abo besteht (`registration.pushManager.getSubscription()`) —
in der Desktop-App gibt es ihn nicht, der Zustand kommt über
`GET /api/push/subscriptions` und wird über die Geräte-ID
(`glattthub-electron-device-id` im localStorage) der Zeile in
`push_subscriptions` zugeordnet.

Daraus folgen zwei Regeln, deren Verletzung 08/2026 dazu führte, dass die App
**täglich erneut** nach der Push-Erlaubnis fragte, obwohl der Nutzer sie längst
erteilt hatte (im Browser trat der Fehler nie auf):

1. **Die Abfrage braucht ein eigenes `AbortSignal`.** `nav-abort.js` hängt jeden
   gleich-origin-GET ohne eigenes Signal an seinen Controller und bricht ihn
   beim nächsten Seitenwechsel ab. Für Anzeige-Daten ist das gewollt — für den
   Abo-Zustand war es fatal: Wer nach dem Öffnen der App gleich weiterklickte,
   verlor die Antwort.
2. **Eine gescheiterte Abfrage heißt „unbekannt", nicht „nicht abonniert".**
   Abgebrochen, offline oder Sitzung abgelaufen — in all diesen Fällen wissen
   wir gar nichts und dürfen nicht erneut fragen. Dafür gibt es
   `isSubscriptionStateKnown()`; das Modal im Hub-Layout fragt nur, wenn der
   Zustand feststeht.

Warum es wie ein Speicherproblem aussah: Der Deckel
`push-banner-dismissed` (localStorage) lässt die Nachfrage höchstens **einmal
pro Tag** zu — der Fehler zeigte sich deshalb als tägliche Frage, nicht als
Dauerfeuer. Das Abo selbst war die ganze Zeit korrekt gespeichert.

Abgesichert durch `tests/Unit/PushSubscriptionStateConventionTest.php`.

!!! tip "Kein App-Neubau nötig"
    `push-notifications.js` und das Modal liegen auf dem Server; die App lädt
    sie bei jedem Start von `hub.glattt.com` (mit `?v=<filemtime>` am
    Cache-first-Service-Worker vorbei). Änderungen daran wirken nach einem
    normalen Web-Deploy — die `.dmg`/`.pkg` muss dafür nicht neu gebaut werden.

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
# Release — Build, Signierung, Notarisierung inkl. Nachbesserung (empfohlen)
npm run electron:release      # = bash electron/release.sh; --fix bessert nur PKG/DMG nach

# Development (öffnet App, verbindet mit Produktions-URL)
npm run electron:dev

# Production Build (.app + .dmg + .zip) — mit Signing
npm run electron:build

# Nur DMG
npm run electron:build:dmg

# Nur PKG für MDM-Verteilung — mit Signing + Notarization
npm run electron:build:mdm
```

!!! tip "Immer über `release.sh` bauen"
    Der nackte `electron-builder`-Lauf notarisiert die App zuverlässig, scheitert aber
    immer wieder beim Upload von PKG/DMG (Timeout) oder am Zeitstempel-Server beim
    PKG-Signieren („Error signing data"). `electron/release.sh` fährt den Build, baut
    fehlende/unnotarisierte PKG/DMG aus der fertigen `.app` nach (DMG **immer** per
    `--prepackaged <pfad>/glatttHub.app` — mit dem Verzeichnis landet ein Ordner
    `glatttHub.app/glatttHub.app` im Image, die App ist dann „beschädigt"), wiederholt
    Notarisierungen dreimal und prüft Struktur + Gatekeeper. Befund 20.09.2026.

Für signierten Build vor dem Ausführen im Terminal (setzt `release.sh` selbst, wenn
nicht gesetzt):

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
├── glatttHub-1.1.3-arm64.dmg       # Direkter Download
├── glatttHub-1.1.3-arm64-mac.zip   # ZIP-Archiv
└── glatttHub-1.1.3-arm64.pkg       # PKG-Installer für MDM
```

Die Versionsnummer kommt aus `package.json` (`version`) im Projekt-Root — vor jedem
Release hochziehen, sonst überschreibt der Build die alte Nummer.

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
| **File** | `electron/dist/glatttHub-1.1.3-arm64.pkg` |
| **Application name** | `glatttHub` |
| **Bundle identifier** | `com.glattt.hub` |
| **Version** | `1.1.3` |

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
| `electron/tabs.cjs` | TabManager: Views je Tab, Fenster-öffnen-Handler, Kontextmenüs, Zurück/Vor/Neu laden |
| `electron/tabbar.html`, `electron/tabbar-preload.cjs` | Tab-Leiste (Fensterinhalt) und ihre IPC-Brücke |
| `electron/preload.cjs` | Drag-Region, electron-app Klasse, Theme-Meldung, ⌘-Klick, electronPush Bridge, electronBadge Bridge |
| `public/js/hub.js` (`setPageTitle`) | Tab-Titel aus nachgeladenen Daten (Kunde, Vertrag, Forderungsfall) |
| `electron/notarize.cjs` | afterSign-Hook für Notarization |
| `electron/electron-builder.config.cjs` | Build-Konfiguration (Signing, Notarization, PKG) |
| `electron/entitlements.mac.plist` | macOS Entitlements (Push: `aps-environment: production`, Hardened Runtime) |
| `electron/signing/glatttHub.provisionprofile` | Provisioning Profile (nicht in Git) |
| `storage/app/private/AuthKey_4VXP44Y6GY.p8` | APNs Key (nicht in Git) |
| `storage/app/private/AuthKey_7FJYWAUF5W.p8` | Notarization Key (nicht in Git) |
| `app/Services/ApplePushNotificationService.php` | APNs-Versand (edamov/pushok, Key aus ENV via /tmp) |

---

## Changelog

| Datum | Version | Änderung |
|---|---|---|
| 20.09.2026 | 1.1.3 | Neues Icon-Set (Icon Composer `@4x`-Exporte, `icon-exports.sh`), eigenes Favicon `glatttHub_Favicon.png` für Hub, Wiki und Nutzerhandbuch (`scripts/update-favicons.sh`), iOS-Web-App-Icons vollflächig auf Weiß (keine schwarzen Ecken auf dem iPhone-Homescreen) |
| 20.09.2026 | 1.1.2 | Neues App-Icon (Icon Composer, „Hub"-Schriftzug), Icon-Skripte für das neue Export-Namensschema (`Default-16@1x`), `release.sh` |
| 20.09.2026 | 1.1.1 | Eigenes Rechtsklick-Menü mit Objekt-Einträgen (Kunde/Vertrag/Forderungsfall, `data-ctx`-Konvention + Konventions-Test), Tab-Menü, Tabs per Drag & Drop sortieren, 24 px Abstand unter der Leiste, Klasse `electron-tabs-visible` auf `<html>` (kein Layout-Sprung) |
| 20.09.2026 | 1.1.0 | Tabs im Fenster (Tab-Leiste in der Titelzeile, Kontextmenü „in neuem Tab öffnen", ⌘-Klick, `data-href` für JS-Zeilen), Zurück/Vor/Neu laden je Tab, Admin-Panel und `target="_blank"` als Tab statt Fenster, Tab-Titel mit Kundenname/-nummer, Hub-URL per `GLATTTHUB_URL` überschreibbar |
| 09/2026 | 1.0.0 | Erste Version: Electron-Wrapper, Overlay-Titelleiste, Tray, APNs-Push, Dock-Badge, signiert & notarisiert, PKG für MDM |
