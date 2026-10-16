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
| **Rechtsklick-Menü** (seit 1.1.1) | Eigenes Menü im glattt-Look statt Browser-Menü. Auf einem Kunden, Vertrag oder Forderungsfall (Zeile, Karte, Link oder die Detailseite selbst) zeigt es oben, worum es geht (bei Kunden seit 1.1.6 mit **Profilbild** aus „My glattt", sonst Initialen), und bietet: öffnen, in neuem Tab öffnen, direkt zu einem Reiter (Termine, Pakete, Zahlungen, Ratenzahlung …), Kunde/Vertrag öffnen, Kunden-/Vertragsnummer kopieren. In Eingabefeldern Ausschneiden/Kopieren/Einsetzen, überall Zurück/Vorwärts/Neu laden. Rechtsklick auf einen Tab: Neu laden, Duplizieren, Tab/andere Tabs/Tabs rechts schließen |
| **Eine Anmeldung für alle Tabs** (seit 1.2.3) | Abmelden in einem Tab meldet alle Tabs ab (sie zeigen die Anmeldeseite), Anmelden in einem Tab bringt alle zurück auf ihre Seite. Läuft die Sitzung ab, erscheint in jedem Tab das Anmelde-Fenster; wer sich in einem davon wieder anmeldet, kann überall weiterarbeiten. Meldet sich eine andere Person an, laden die Tabs neu — nichts von der Vorgängerin bleibt stehen |
| **Tabs sortieren** (seit 1.1.1) | Tabs in der Leiste per Drag & Drop verschieben; die Reihenfolge gilt auch für ⌘1…9 |
| **Overlay-Titelleiste** | Schlankes Design mit macOS Traffic Lights (Schließen/Minimieren/Maximieren) |
| **Spotlight-Suche** | „glatttHub" eingeben → App öffnen |
| **Cmd+Tab** | Eigenes Icon in der App-Umschaltung |
| **Deutsche Menüleiste** (ausgebaut in 1.1.6) | glatttHub, Bearbeiten, Darstellung (mit **Farbschema** und **Standort**), **Gehe zu** (alle Hub-Seiten nach Rechten, Suche, glatttBert), Tabs (mit Seitennamen, geschlossenen Tab zurückholen), Fenster, Hilfe (Nutzerhandbuch, Rundgang dieser Seite) |
| **Dock-Menü** (seit 1.1.6) | Rechtsklick auf das Dock-Symbol: offene Tabs mit Häkchen am aktiven, Neuer Tab, Termine heute, Kunde suchen |
| **Tray-Icon** | Schnellzugriff über die macOS-Menüleiste |
| **Admin-Panel** | Eigener Tab für das Filament Admin-Panel (Cmd+Shift+A) |
| **Push-Benachrichtigungen** | Native macOS-Benachrichtigungen (Opt-in beim ersten Start) |
| **Tastenkürzel** | Cmd+T = Neuer Tab, Cmd+Shift+T = geschlossenen Tab zurückholen, Cmd+W = Tab schließen, Cmd+Shift+W = Fenster schließen, Cmd+[ / Cmd+] = Zurück/Vor, Cmd+R = Neu laden, Cmd+Shift+1…4 = Start/Termine/Kunden/Berichte, Cmd+Shift+F = Suche, Alt+Cmd+B = glatttBert, Cmd+Shift+A = Admin-Panel, Cmd+Q = Beenden |
| **Immer aktuell** | Die Website wird live geladen — Inhalte sind immer aktuell |

### Menüleiste

| Menü | Einträge |
|------|---------|
| **glatttHub** | Über glatttHub, Ausblenden, Andere ausblenden, Alle einblenden, Beenden |
| **Bearbeiten** | Widerrufen, Wiederholen, Ausschneiden, Kopieren, Einsetzen, Alles auswählen |
| **Darstellung** | Zurück (Cmd+[), Vorwärts (Cmd+]), Neu laden (Cmd+R), **Farbschema** (Wie das System / Hell / Dunkel), **Standort** (Alle Standorte + Institute, wie der Standortfilter der Sidebar), Vergrößern, Verkleinern, Originalgröße, Vollbild |
| **Gehe zu** (seit 1.1.6) | Start, Termine, Kunden, Berichte (Cmd+Shift+1…4), darunter die Gruppen Verkauf, Finanzen, Team, Betrieb, System mit genau den Seiten, die die Nutzerin sehen darf; Suchen … (Cmd+Shift+F), glatttBert fragen (Alt+Cmd+B, nur mit Recht). Vor der Anmeldung steht hier nur „Nach der Anmeldung verfügbar" |
| **Tabs** | Neuer Tab (Cmd+T), Geschlossenen Tab wiederherstellen (Cmd+Shift+T), Tab schließen (Cmd+W), Nächster/Vorheriger Tab (Ctrl+Tab / Ctrl+Shift+Tab), die offenen Tabs **mit ihren Seitennamen** und Häkchen am aktiven (Cmd+1…8; Letzter Tab Cmd+9 ab neun Tabs), Admin-Panel öffnen (Cmd+Shift+A) |
| **Fenster** | Minimieren, Maximieren, Fenster schließen (Cmd+Shift+W), Alle nach vorne |
| **Hilfe** | Nutzerhandbuch (hilfe.hub.glattt.com), Rundgang dieser Seite (nur auf Seiten mit Tour), Technisches Wiki, Entwicklertools |

### Dock-Menü

Rechtsklick auf das glatttHub-Symbol im Dock (seit 1.1.6): oben die **offenen Tabs** mit
Seitennamen (Häkchen am aktiven, ein Klick holt den Tab und das Fenster nach vorn), darunter
**Neuer Tab**, **Termine heute** und **Kunde suchen …** — auch dann, wenn das Fenster hinter
anderen liegt oder geschlossen ist (dann öffnet es sich wieder).

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
    läuft (Klasse `electron-tabs-visible` am `<html>`). Beide Befunde vom 20.09.2026, siehe
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
| Nebeneinander (seit 1.2.1) | Seit 1.2.2 bei **jedem** Tab im Menü (`splitOffer`): am aktiven Tab „Nebeneinander mit „<zuletzt benutzter Tab>““, sonst „Rechts daneben anzeigen“; unter 1100 px grau mit „(Fenster breiter ziehen)“. Rechtsklick auf einen anderen Tab → „Rechts daneben anzeigen“: aktiver Tab links, dieser rechts (`split = { leftId, rightId, ratio }`), Trenner `divider.html` (6 px, beim Ziehen über die ganze Fläche gelegt, Bildschirm-x per `divider-preload.cjs`, 25–75 %). Nur ab 1100 px Fensterbreite, darunter zeigt der aktive Tab allein; ein Tab außerhalb des Paars zeigt sich allein, zurück zum Paar zeigt wieder beide. Klick in eine Hälfte macht sie aktiv (`focusPane`, Zurück/Vor/Neu laden gelten ihr). Schließen eines Paar-Tabs beendet das Nebeneinander |
| Anheften (seit 1.2.1) | `tab.pinned`: vorn, 44 px, Anfangsbuchstabe, kein Schließen-Knopf, Mittelklick schließt nicht; Umsortieren bleibt innerhalb der Gruppe. Gemerkt in `userData/pinned-tabs.json` (URL + Farbe, nur Hub-Adressen) und beim Start vor der Startseite geöffnet (`restorePinned`) |
| Farbe (seit 1.2.1) | `tab.color` gold/rot/grün/blau: Streifen unten + zarte Tönung; im Menü als Farbfelder (`swatches`-Eintrag in `context-menu.cjs`) |
| Tab-Menü auf Dokumenten (seit 1.2.1) | PDF-/Bild-Ansicht und Ladeanzeige haben kein Seiten-Preload → `nativeTabMenu()` (Systemmenü mit denselben Einträgen); erkannt über `markDocument()` aus `onHeadersReceived`. Im Nebeneinander zeichnet die Hälfte unter dem Zeiger |
| Tab-Breite (seit 1.2.0) | alle Tabs gleich breit (`flex: 1 1 0`, höchstens 240 px, mindestens 56 px) |
| Ladeanzeige (seit 1.2.0) | eine eigene `WebContentsView` (`loading.html`, Kreisel in Gold, hell/dunkel nach Leiste) liegt über dem aktiven Tab, solange er `fresh` ist — vom Öffnen bis zum ersten `did-stop-loading` bzw. Fehler; auch beim App-Start |
| Dokumente (seit 1.2.0) | `plugins: true` aktiviert Chromiums PDF-Ansicht. `registerDocumentHandlers()` in `main.cjs` schreibt bei Antworten in einen **neuen** Tab (`freshTabFor`) `Content-Disposition: attachment` → `inline` um, wenn es PDF oder Bild ist — Herunterladen/Drucken bietet die PDF-Ansicht. Im selben Tab bleibt es ein Download (sonst verließe man die Seite) |
| Downloads (seit 1.2.0) | `will-download` speichert ohne Dialog nach „Downloads“ (gleiche Namen „(2)“), Mitteilung „Download abgeschlossen“ (Klick zeigt die Datei im Finder), Dock-Stapel springt. Ein neuer Tab ohne eigene Seite (`!tab.committed` bei `did-stop-loading`) war nur ein Download und schließt sich — `will-download` meldet dafür den Opener, nicht den Tab, und ein Sichern-Dialog am Tab verschwand mit ihm |

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
| `#electron-drag-region` | 38px Drag-Region oben (Fenster verschieben) — nur ohne Tab-Leiste; mit Leiste (`html.electron-tabs-visible`, seit 1.1.0 immer) ausgeblendet |
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

`Electron/X.X.X` wird aus dem User-Agent entfernt, damit Google OAuth funktioniert (Google
blockiert Logins aus Electron). Seit 1.1.4 (09.10.2026) hängt die App stattdessen
**`glatttHub-Desktop/<version>`** an — nach dem Vorbild `glatttHub-iOS/` der iOS-App. Daran
erkennt der Hub die Desktop-App serverseitig (`App\Support\NativeApp::isDesktop()`,
`desktopVersion()`); sie zählt dabei bewusst **nicht** als „native App" im Sinne von
`platform()`/`isNative()`, denn das steuert die iOS-Bridge (Meta-Tags, Gerätevertrauen,
Rückweg-Leiste im Admin).

#### Die Klasse `electron-tabs-visible` muss vom Server kommen

Das Theme nimmt unter der Tab-Leiste den kleinen Luftraum (`html.electron-tabs-visible
{ --layout-top-offset: 0.5rem }` statt 2,5 rem). Bis 1.1.3 setzte nur das Preload diese
Klasse per JavaScript. **Livewire ersetzt bei `wire:navigate` alle `<html>`-Attribute
durch die der neuen Seite** (`replaceHtmlAttributes()`) — die Klasse fiel bei jedem
Seitenwechsel weg, Seitenleiste und Inhalt rutschten 32 px nach unten und sprangen erst
mit dem 1-Sekunden-Intervall des Preloads wieder hoch (Befund Jan per Bildschirmvideo,
09.10.2026; dasselbe Muster wie das weiße Aufblitzen der `dark`-Klasse im September).

Seit 09.10.2026 dreifach abgesichert:

1. **Serverseitig:** Die Hub-Layouts (`hub`, `fullscreen`, `app`, `guest`) rendern
   `NativeApp::htmlClass()` ins `<html>` und `NativeApp::bodyClass()` (`electron-app`) in
   den `<body>` — die neue Seite bringt die Klasse also selbst mit. Braucht App ≥ 1.1.4
   (User-Agent-Token).
2. **Wächter im Hub:** `resources/views/partials/desktop-app-html-class.blade.php`
   (Hub-, Fullscreen-Layout und Filament-`HEAD_END`) stellt die Klasse per
   `MutationObserver` am `<html>` sofort wieder her — als Microtask noch vor dem nächsten
   Zeichnen, also ohne sichtbaren Sprung. Erkennung über die Bridge-Objekte des Preloads
   (`window.electronBadge`/`electronPush`), die jede Navigation überleben. Deckt ältere
   App-Versionen und das Admin-Panel ab, dessen `<html>` Filament nicht erweitern lässt.
3. **Wächter im Preload** (ab 1.1.5): derselbe Observer in `preload.cjs`, dazu
   `applyTabStripClass()` auch auf `livewire:navigated`; das Intervall bleibt als letzte
   Rückfallebene.

!!! danger "Ein Observer, der die Klasse setzt, darf sie nur setzen, wenn sie fehlt"
    `classList.add('x')` schreibt das `class`-Attribut auch dann neu, wenn `x` schon
    enthalten ist — und jedes Schreiben erzeugt einen Mutation-Record. Ein Observer, der
    darauf bedingungslos `add()` ruft, füttert sich selbst: Endlosschleife aus Microtasks,
    der Renderer friert ein, nichts ist mehr klickbar. Genau das war Build 1.1.4
    (09.10.2026): Das Theme-Skript fasst beim Laden die `dark`-Klasse an, der Preload-
    Wächter lief daraufhin ohne Ende. Immer `contains()` vor `add()`; und ein Preload nur
    mit der **echten** App prüfen (Dev-Modus + `--remote-debugging-port`, siehe unten),
    nie mit einer Nachbildung im Browser.

Tests: `tests/Unit/NativeAppDetectionTest.php` (Erkennung, Abgrenzung zu iOS),
`tests/Feature/DesktopAppLayoutTest.php` (Klasse im `<html>`/`<body>`, Wächter im Markup).
Regel für alles Weitere: **Bei `wire:navigate` überlebt am `<html>` nur, was die neue Seite
mitbringt** — siehe `.github/knowledge/html-klassen-ueberleben-wire-navigate-nicht.md`.

### Preload-Script (`preload.cjs`)

Das Preload-Script (läuft in jedem Tab) hat vier Aufgaben:

1. **Drag-Region**: Erstellt ein `#electron-drag-region` div am Anfang des Body (per CSS ausgeblendet, sobald die Seite unter der Tab-Leiste läuft)
2. **Electron-Erkennung**: Setzt `document.body.classList.add('electron-app')` und `electron-tabs-visible` am `<html>` — so früh wie möglich, und ein `MutationObserver` stellt sie wieder her, sobald Livewire sie bei `wire:navigate` entfernt (seit 1.1.4; serverseitig kommt sie zusätzlich aus dem User-Agent-Token, siehe „User-Agent")
3. **Farbschema melden**: `html.dark` → `electron-theme:changed` für die Tab-Leiste
4. **⌘-Klick**: Links und `[data-href]`-Zeilen mit Meta/Ctrl in einem neuen Tab öffnen
5. **Menüzustand & Befehle** (seit 1.1.6): meldet dem Hauptprozess, was die Menüleiste braucht (`electron-menu:state`), und führt dessen Befehle aus (`electron-command`) — siehe „Menüleiste & Dock-Menü" unten
6. **Aufwachen** (seit 1.1.7): `electron-wake` vom Hauptprozess (`powerMonitor` `resume`/`unlock-screen`) wird zum Fenster-Ereignis `glattthub-wake` — Seiten mit Echtzeit laden darauf nach
7. **Anmeldestatus** (seit 1.2.3): meldet `electron-auth:report` — siehe „Anmeldestatus aller Tabs" unten

!!! warning "Echtzeit im Hintergrund"
    Tabs laufen seit 1.1.7 mit `backgroundThrottling: false`. Vorher drosselte Chromium Hintergrund-Tabs
    und das Fenster hinter anderen Apps: Die Herzschläge der Reverb-Verbindung blieben aus, eine nach
    Ruhezustand oder Netzwechsel stumm gestorbene Verbindung fiel nicht auf, und der Chat zeigte neue
    Nachrichten erst nach „Neu laden" (15.10.2026). Da das Fenster beim App-Wechsel für die Seite
    `visible` bleibt, hilft `visibilitychange` dort nicht. `public/js/chat.js` lädt deshalb zusätzlich bei
    `focus`, `online` und `glattthub-wake` nach (höchstens alle 5 s) und hat einen 20-s-Wächter: fragt ab,
    solange die Echtzeit nicht `live` ist, und erkennt Ruhezustände an einer Taktlücke über 60 s.

Die Drag-Region wird bei drei Events neu erstellt (Sicherheit gegen SPA-Navigation):

- `DOMContentLoaded` — Erster Seitenaufbau
- `livewire:navigated` — Nach Livewire SPA-Navigation
- `setInterval(ensureDragRegion, 1000)` — Fallback

### Anmeldestatus aller Tabs (seit 1.2.3)

Alle Tabs teilen sich einen Cookie-Speicher und damit eine Sitzung. Bis 1.2.2 blieb nach dem
Abmelden in einem Tab jeder andere Tab mit den Daten der Vorgängerin stehen und fragte im
Hintergrund weiter ab; nach dem Anmelden hingen die anderen auf der Anmeldeseite. Seit 1.2.3
(Jan, 15.10.2026) gleicht `TabManager.reportAuth()` (`tabs.cjs`) sie ab:

| Meldung eines Tabs | Wirkung auf die anderen Tabs |
|---|---|
| `out` — Seite mit Meta `glattthub-auth=guest` (Anmeldeseite, 419-Seite als Gast) | auf `/login`, bisherige Seite als `resumeUrl` gemerkt |
| `expired` — Session-Guard zeigt das Modal | Befehl `session-expired`: dasselbe Modal (prüft vorher `/login/token`, ein einzelnes 401 ist kein Sitzungsende); Seiten ohne Modal (Admin) → `/login` |
| `in` + `userId` — Hub-Seite mit Meta `user-id` oder Anmeldung im Modal | abgemeldete Tabs laden ihre `resumeUrl`, Tabs mit Modal bekommen `session-resumed` (`SessionGuard.resume()`), Tabs einer **anderen** Person laden neu; der Anmelde-Tab selbst kehrt bei derselben Person auf seine Seite zurück, sonst Startseite |

- Meldewege: Preload liest beim Laden die Metas (`pageAuthState()`), Ereignisse des
  Session-Guards kommen per `postMessage({type: 'glattthub-auth'})`; Befehle an die Seite
  gehen über `desktop-app-bridge.blade.php` (`session-expired`/`session-resumed`).
- `/shared/…`-Seiten und Tabs auf `/login` werden nicht angefasst; Zustand je Tab in
  `tab.auth` (`in`/`out`/`expired`/`pending`), damit nichts im Kreis läuft.
- Gegenstück auf dem Server: beendete Sitzungen bleiben beendet (Grabstein, keine Cookies
  aus alten Anfragen) — siehe [SESSION-ABLAUF.md](SESSION-ABLAUF.md), Abschnitt „Beendete
  Sitzungen bleiben beendet".
- **Prüfstand:** Playwright `_electron` mit eigenem `userData` (Dev-Modus heißt `glattthub`
  und teilt sonst den Ordner der installierten App — angeheftete Tabs, Cookies!) und **ohne
  `ELECTRON_RUN_AS_NODE`** (setzt das VS-Code-Terminal; dann startet Electron als Node und
  `require('electron')` schlägt fehl). Wrapper: `app.setPath('userData', …)` und dann
  `require('electron/main.cjs')`.

### Electron-Erkennung in der Web-App

Die Web-App erkennt die Electron-Umgebung clientseitig über die CSS-Klasse:

```javascript
const isElectron = document.body.classList.contains('electron-app');
```

Serverseitig (seit 1.1.4) über den User-Agent-Token: `\App\Support\NativeApp::isDesktop()`
bzw. `desktopVersion()` — damit rendern die Layouts `electron-tabs-visible` und
`electron-app` direkt ins Markup (siehe „User-Agent" oben).

Wird aktuell für Push-Notifications genutzt:

- Electron gewährt `Notification.permission` automatisch (`'granted'`)
- Ohne Erkennung würde direkt subscribed werden (kein Opt-in-Dialog)
- Mit Erkennung: Modal wird trotzdem gezeigt → User entscheidet aktiv
- Device-Name wird auf `'glatttHub Desktop App'` gesetzt

### Menüleiste & Dock-Menü (seit 1.1.6)

Menüleiste und Dock-Menü werden im Hauptprozess (`main.cjs`, `rebuildMenus()`) aus zwei
Quellen gebaut und bei jeder Änderung gesammelt neu gesetzt (`scheduleMenuRebuild`, 120 ms,
Signaturvergleich, damit offene Menüs nicht flackern):

1. **Tabs** (`tabs.list()`, `tabs.onChange`): Seitennamen mit Häkchen am aktiven, höchstens
   acht mit ⌘1…8; `closedUrls` speist „Geschlossenen Tab wiederherstellen".
2. **Zustand der aktiven Seite** — das Preload meldet `electron-menu:state` bei
   `DOMContentLoaded`, `livewire:navigated`, `branchChanged`, Fensterfokus und Farbwechsel:

   | Feld | Quelle | Verwendung |
   |---|---|---|
   | `nav` | `GET /api/app/navigation` (MobileNavigation::forUser — dieselbe Liste wie Sidebar, Bottom-Nav und iOS-App, nach Rechten; Web-Sitzung, 5 Min. gecacht, ohne Anmeldung `null`) | „Gehe zu", Standort-Liste (`branches`, `has_branch_restriction`), glatttBert (`user.can_ai`), Nutzerhandbuch-URL (`klick_portal`) |
   | `branchId` | `localStorage.selectedBranch` | Häkchen im Standort-Untermenü |
   | `themePref` | `localStorage['glattthub-theme']` | Häkchen im Farbschema-Untermenü |
   | `hasTour` | `[data-tour-help]` auf der Seite | „Rundgang dieser Seite" aktiv/inaktiv |
   | `hasSidebar` | `#sidebar` vorhanden | Standort nur mit Sidebar (nicht im Admin) |

   Der Hauptprozess hält den Zustand je WebContents; ein Tab ohne Zustand bekommt
   `electron-menu:refresh`.

**Befehle zurück in die Seite** gehen als `electron-command` an das Preload. Das läuft in
einer **isolierten Welt** ohne Zugriff auf Alpine, Livewire oder `window.themeManager` und
reicht deshalb per `window.postMessage({ type: 'glattthub-desktop', command, … },
location.origin)` an die Brücke in der Seite weiter
(`resources/views/partials/desktop-app-bridge.blade.php`, eingebunden in Hub- und
Fullscreen-Layout sowie im Filament-`HEAD_END`):

| Befehl | Preload | Seite |
|---|---|---|
| `navigate` (Gehe zu, Dock) | klickt den passenden Sidebar-Link (wire:navigate), sonst `location.href` | — |
| `search` | mit Sidebar → postMessage; ohne (Admin) → Tab `/hub/clients` | `Alpine.$data(#sidebar).focusSearch()` |
| `branch` | postMessage | `selectBranch(branchId)` der Sidebar (löst `branchChanged` aus) |
| `theme` | setzt `localStorage`, postMessage | `themeManager.setTheme()` bzw. `__applyTheme()` |
| `tour` | postMessage | `glatttTourStart()` (Seiten-Tour) |
| `bert` | `window.dispatchEvent(new CustomEvent('glattt-bert-toggle'))` direkt | — |

!!! warning "Nur Ereignisse ohne Nutzdaten darf das Preload direkt auslösen"
    `CustomEvent.detail` überlebt den Wechsel zwischen isolierter Welt und Seite nicht
    zuverlässig — für alles mit Parametern (Standort, Farbschema) ist `postMessage` der Weg,
    die Brücke prüft `event.source === window` und `event.origin === location.origin`.

**Prüfen:** Native Menüs sieht weder CDP noch Playwright, und UI-Scripting per `osascript`
braucht Hilfszugriff für das aufrufende Terminal. Im Dev-Modus schreibt deshalb
`GLATTTHUB_DEBUG_MENU=<datei>` nach jedem Neubau beide Menüs als JSON (Beschriftung, Kürzel,
aktiv, Häkchen):

```bash
env -u ELECTRON_RUN_AS_NODE GLATTTHUB_URL=http://glattthub.local:8888 \
  GLATTTHUB_DEBUG_MENU=/tmp/menu.json npx electron electron/main.cjs --remote-debugging-port=9333
```

**Profilbild im Kontextmenü:** `objectHeader()` gibt für Kunden `image` =
`/hub/clients/{id}/foto` mit (fester Endpunkt, 404 ohne Foto). `context-menu.cjs` legt das
`<img>` über die Initialen, blendet es nach `load` ein und entfernt es bei `error` — so gilt
das Bild überall, wo ein Kunde erkannt wird, ohne neue `data-ctx`-Attribute.

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
├── mac-universal/
│   └── glatttHub.app                   # Signierte App (intern), arm64 + x64
├── glatttHub-1.1.8-universal.dmg       # Direkter Download
├── glatttHub-1.1.8-universal-mac.zip   # ZIP-Archiv
└── glatttHub-1.1.8-universal.pkg       # PKG-Installer für MDM
```

!!! info "Universal-Build seit 09.10.2026"
    Die App wird als **Universal Binary** gebaut (`arch: ['universal']` in
    `electron-builder.config.cjs`): electron-builder baut arm64 und x64 getrennt und
    verschmilzt sie mit `@electron/universal` zu einer App. Grund: Im Bestand laufen
    noch Intel-Macs, und in Miradore soll **eine** Variante reichen — zwei PKGs hießen
    zwei Einträge, zwei Zuweisungen und doppelte Pflege bei jedem Update. Preis: das
    PKG ist etwa doppelt so groß (~250 MB statt ~130 MB), weil beide Architekturen
    enthalten sind. Ein reiner arm64-Build (`hostArchitectures="arm64"` im PKG) bricht
    auf Intel-Macs bei der Installation ab. Native Module gibt es nicht, deshalb braucht
    die Verschmelzung keine `x64ArchFiles`-Ausnahmen.

Die Versionsnummer kommt aus `package.json` (`version`) im Projekt-Root — vor jedem
Release hochziehen, sonst überschreibt der Build die alte Nummer.

### Dev-Modus

Für automatische Prüfungen der echten App (echtes Preload, echter User-Agent) den
Dev-Modus mit Debug-Port starten und per Playwright über CDP andocken:

```bash
env -u ELECTRON_RUN_AS_NODE GLATTTHUB_URL=http://glattthub.local:8888 \
  npx electron electron/main.cjs --remote-debugging-port=9333
# dann: chromium.connectOverCDP('http://127.0.0.1:9333') → Seite mit glattthub.local wählen
```

Mit `GLATTTHUB_USER_DATA=/pfad` läuft die Dev-App mit eigenem Profil — ohne die Variable teilt sie Cookies,
Tabs und Einstellungen mit der installierten App (`~/Library/Application Support/glatttHub`).

Reagiert `page.evaluate(() => 1)` nicht innerhalb weniger Sekunden, ist der Renderer
blockiert (so wurde die Endlosschleife von 1.1.4 nachgewiesen).

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

#### MDM-Verteilung via Mosyle (seit 10/2026, vorher Miradore)

Die PKG wird als Custom App in Mosyle hochgeladen und den Macs zugewiesen. Seit 1.2.0 ist das nur
noch für die **Erstinstallation** nötig — danach aktualisiert sich die App selbst (siehe „Updates“).

| Feld | Wert |
|------|------|
| **Datei** | `glatttHub-<version>-universal.pkg` (auch unter `https://storage.googleapis.com/glattthub-public/downloads/desktop/`) |
| **Bundle identifier** | `com.glattt.hub` |

### Updates (seit 1.2.0, Update-Dienst seit 1.2.2)

**Warum ein eigener Dienst:** Die Nutzerinnen haben Standardkonten, und macOS schützt Apps unter
`/Applications` zusätzlich zu den Dateirechten (App-Verwaltung, Merkmal `com.apple.macl` nach
PKG-/MDM-Installation). Eine Schreibprobe der App ins eigene Bundle scheitert mit `EPERM`, obwohl
das Bundle `root:staff` mit `g+w` ist — Squirrel.Mac (electron-updater) startet dann sein
Hilfsprogramm privilegiert und fragt nach einem **Admin-Passwort** (15.10.2026, mit und ohne
„Install as Managed“ in Mosyle; ein PPPC-Profil „App Management“ half nicht).

**Update-Dienst** (`electron/pkg-scripts/updater.sh`, LaunchDaemon `com.glattt.hub.updater`,
beides vom Postinstall eingerichtet): läuft als root alle 30 Minuten, beim Start und sobald die App in
`/Users/Shared/glatttHub/` etwas ablegt (WatchPaths). Er liest `latest-mac.yml`, lädt bei neuerer
Version das PKG nach `/Library/Application Support/glatttHub/updates/` (nur root), prüft die
Signatur (`pkgutil --check-signature` mit „Developer ID Installer … (63DQ6FV92R)“ + `spctl -t
install`) und installiert mit `installer`, **wenn die App nicht läuft**. Läuft sie, schreibt er
`update-ready.json`; die App (`electron/updater.cjs`, Modus `daemon`) fragt „Jetzt neu starten /
Später“. „Jetzt neu starten“ legt `relaunch` ab und beendet die App → der Dienst wartet bis 30 s,
installiert und öffnet die App für die angemeldete Person wieder (`launchctl asuser`). „Später“ +
normales Beenden legt `quit` ab → Installation sofort nach dem Beenden. „Nach Updates suchen …“
legt `check-now` ab. Protokolle: `/Library/Logs/glatttHub-updater.log` (Dienst),
`~/Library/Application Support/glatttHub/logs/updater.log` (App).

**Fallstricke:** Das Postinstall ersetzt `updater.sh` per `mv` (der laufende Dienst hat die
Installation ja selbst gestartet) und lädt einen geladenen Dienst **nie** neu — `bootout` würde den
laufenden Installer mitbeenden; Änderungen an der plist greifen erst nach Neustart. Erkennung der
laufenden App: `pgrep -f "/Applications/glatttHub.app/Contents/MacOS/glatttHub( |$)"` (Helfer
haben andere Pfade). Fremde oder unsignierte Pakete im Download-Ordner verwirft der Dienst.

**Selbst-Update per Squirrel** bleibt nur für Macs ohne Dienst (z. B. per DMG installiert) und nur,
wenn die Schreibprobe gelingt; sonst ist die App still und „Nach Updates suchen …“ meldet „Updates
kommen über die IT“. Es wird nie mehr nach einem Admin-Passwort gefragt. Das Postinstall gibt das
Bundle weiter `staff g+w` (Rückfall) und die App setzt `SquirrelMacEnableDirectContentsWrite`.

**Mosyle:** Die 1.2.2 muss einmal über Mosyle auf jeden Mac (bringt den Dienst mit). Danach kommen
Versionen über den Dienst; im Mosyle-Eintrag kann die zuletzt verteilte Version stehen bleiben (eine
neuere installierte Version wird nicht zurückgestuft — beim ersten Folge-Release beobachten).

**Veröffentlichen:** `bash electron/release.sh --publish` lädt ZIP, Blockmap und PKG
(`immutable`) und **zuletzt** `latest-mac.yml` (`no-cache`) hoch — ab dann holen alle Macs mit
Dienst (≥ 1.2.2) die Version innerhalb von 30 Minuten. `release.sh` bricht ab, wenn im PKG
Postinstall, `updater.sh` oder die plist fehlen. Zurückziehen geht nur mit einer **höheren** Version.
Versionen vor 1.2.0 haben keinen Updater und brauchen die 1.2.0 einmal per Mosyle.

**Electron-Version:** 41.10.7 (seit 1.2.0) — 41.2.0 hatte offene Lücken (CVE-2026-70597,
CVE-2026-70611, Squirrel.Mac-Pfadauflösung). Bei Electron-Updates die Squirrel/ShipIt-Hinweise in
den Release Notes lesen.

!!! info "Push-Registrierung nach MDM-Installation"
    Nach einer Neuinstallation muss der User die Push-Benachrichtigungen einmal neu bestätigen, da ein neuer APNs-Token generiert wird. Das Opt-in-Modal erscheint automatisch beim ersten Start.

### Eingehende Anrufe (seit 1.2.7)

Jan wählte am 16.10.2026 Variante A + C: Ein Anruf soll auch auffallen, wenn eine andere App vorn liegt.

- **Ablauf:** Klingelt ein Tab (`chat-call.js`, nur ein Tab dank Web Lock), meldet er über die Brücke
  `window.electronCall.ringing(info)` (Preload) den Anruf mit Name, Kürzel, Farbe, Profilbild und Art.
  `electron/call-alert.cjs` zeigt dann
  - das **Anruf-Fenster** `call-window.html` (360 × 128, rahmenlos, `alwaysOnTop` auf Stufe `screen-saver`,
    `setVisibleOnAllWorkspaces(…, { visibleOnFullScreen: true })`, `focusable: false` — Klicks gehen durch, Tippen
    in der vorderen App nicht verloren), oben rechts auf dem Bildschirm mit dem Mauszeiger,
  - eine **Mitteilung** mit Knopf „Annehmen“ (lautlos, der Klingelton läuft in der Seite),
  - **Dock-Hüpfen** (`app.dock.bounce('critical')`).
- **Annehmen/Ablehnen** gehen per `electron-call:action` an genau den klingelnden Tab zurück (`onAction` in
  `chat-call.js`); Annehmen holt vorher das Hauptfenster mit diesem Tab nach vorn. Das Klingeln endet
  (`electron-call:ended`) bei Annahme, Ablehnen, Auflegen der Anruferin oder wenn der Tab schließt — dann
  verschwinden Fenster, Mitteilung und Dock-Hüpfen.
- **Profilbild** lädt der Hauptprozess (`fetchNotificationImage`) und reicht es als Data-URL ins Fenster — das
  Fenster selbst darf nichts aus dem Netz laden (CSP `default-src 'none'`). Schrift Lato liegt unter `electron/fonts/`.
- **Klingelton „Goldton“** (Glocken-Dreiklang G5–H5–D6, G6 als Schluss) erzeugt die Seite selbst per WebAudio;
  dieselben Werte rendert `scripts/anruf-klingelton/render.cjs` als CallKit-Ton der iOS-App.
- **Test:** `scripts/anruf-pruefstand/run.sh desk` startet die echte App (eigenes Profil) gegen den lokalen Hub und
  prüft Fenster, Annehmen, Ablehnen und Auflegen.

### Bekannte Einschränkungen

| Einschränkung | Beschreibung |
|--------------|-------------|
| **Kein Offline-Modus** | App braucht Internet — zeigt Fehler wenn offline |
| **Push nur bei offener App** | Kein Background Push wie bei nativen Apps oder Browser (Service Worker) |
| **Nur macOS** | Universal (Apple Silicon + Intel) seit 09.10.2026; kein Windows/Linux (aktuell nicht benötigt) |
| **Neuer APNs-Token nach Neuinstallation** | Nach PKG-Reinstall muss Push-Banner neu bestätigt werden (`localStorage.removeItem('push-banner-dismissed')`) |

### Relevante Dateien

| Datei | Beschreibung |
|-------|-------------|
| `electron/main.cjs` | Hauptprozess: Fenster, Menü, Tray, CSS-Injection, APNs-Handler, Badge |
| `electron/tabs.cjs` | TabManager: Views je Tab, Fenster-öffnen-Handler, Kontextmenüs, Zurück/Vor/Neu laden |
| `electron/tabbar.html`, `electron/tabbar-preload.cjs` | Tab-Leiste (Fensterinhalt) und ihre IPC-Brücke |
| `electron/preload.cjs` | Drag-Region, electron-app/-tabs-visible Klassen, Theme-Meldung, ⌘-Klick, Kontextmenü (mit Profilbild), Menüzustand (`electron-menu:state`) und Befehle (`electron-command`), electronPush Bridge, electronBadge Bridge |
| `resources/views/partials/desktop-app-bridge.blade.php` | Brücke in der Seite: Wächter für `electron-tabs-visible`, Empfänger der Menü-Befehle (postMessage → Sidebar, ThemeManager, Tour) |
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
| 16.10.2026 | 1.2.7 | **Eingehende Anrufe außerhalb der App:** schwebendes Anruf-Fenster oben rechts über allen Apps, Desktops und Vollbild (Annehmen/Ablehnen, nimmt keinen Fokus), macOS-Mitteilung mit „Annehmen“, hüpfendes Dock-Symbol; Klingelton „Goldton“ (siehe „Eingehende Anrufe“); `GLATTTHUB_USER_DATA` für ein eigenes Profil im Dev-Modus |
| 16.10.2026 | 1.2.6 | Bildschirm teilen prüft die macOS-Freigabe „Bildschirmaufnahme“, erklärt sie und öffnet die Systemeinstellungen; eigene Bildschirmauswahl statt Systemauswahl |
| 16.10.2026 | 1.2.5 | Rechtsklick auf Chat-Zeilen (öffnen, neuer Tab) und Nachrichten (kopieren, antworten, als Aufgabe, Person anschreiben, Link) |
| 16.10.2026 | 1.2.4 | Anrufe im Team-Chat: Mikrofon und Kamera (Entitlements, Texte), Bildschirmfreigabe über `setDisplayMediaRequestHandler` |
| 15.10.2026 | 1.2.3 | **Eine Anmeldung für alle Tabs:** Abmelden/Sitzungsablauf zieht alle Tabs nach, Anmelden bringt sie auf ihre Seite zurück, andere Person → neu laden (`reportAuth`, Preload-Meldung `electron-auth:report`); dazu serverseitig Schutz gegen 419 und „falsches Konto" nach Abmelden + Anmelden ([SESSION-ABLAUF.md](SESSION-ABLAUF.md)) |
| 15.10.2026 | 1.2.2 | **Update-Dienst** (root-LaunchDaemon aus dem PKG) statt Squirrel auf verwalteten Macs — keine Admin-Passwortabfrage mehr; Squirrel nur noch bei beschreibbarem Bundle; Update-Protokoll; „Nebeneinander“ bei jedem Tab im Menü |
| 15.10.2026 | 1.2.1 | Zwei Tabs **nebeneinander** mit ziehbarem Trenner (ab 1100 px), Tabs **anheften** (bleiben nach Neustart), Tabs **farbig markieren**, Tab-Menü auch auf PDF-Tabs (Systemmenü); erste Version, die per Selbst-Update kommt |
| 15.10.2026 | 1.2.0 | **Selbst-Update** über den öffentlichen Bucket (electron-updater, Postinstall für Standardkonten, „Nach Updates suchen …“); PDFs und Bilder öffnen im neuen Tab als Ansicht statt Download; Downloads ohne Dialog nach „Downloads“ mit Mitteilung, leerer Download-Tab schließt sich; Ladeanzeige für neue Tabs; gleich breite Tabs; Electron 41.10.7; Verteilung über Mosyle |
| 15.10.2026 | 1.1.8 | Zustellhaken im Team-Chat: Der Hauptprozess ruft bei einer Chat-Push die signierte Quittung `data.chat_ack` auf (`acknowledgeChatPush`, nur `https` auf `*.glattt.com`) — zweiter Haken beim Absender, auch ohne offenen Chat-Tab (siehe [Team-Chat](TEAM-CHAT.md)) |
| 15.10.2026 | 1.1.7 | Chat aktualisiert sich auch im Hintergrund: `backgroundThrottling: false` je Tab, Aufwach-Anstoß nach Ruhezustand/Bildschirmsperre (`electron-wake` → `glattthub-wake`); dazu im Web Nachladen bei Fokus/Netz und Wächter in `chat.js` |
| 09.10.2026 | 1.1.6 | **Universal-Build** (arm64 + x64 in einer App, Dateinamen `-universal`), damit ein PKG in Miradore alle Macs inkl. der Intel-Geräte versorgt |
| 09.10.2026 | 1.1.6 | Menüleiste: „Gehe zu" (Hub-Seiten nach Rechten, Suche, glatttBert), Tabs mit Seitennamen und Häkchen, „Geschlossenen Tab wiederherstellen" (⇧⌘T), Farbschema und Standort als Untermenüs, Hilfe mit Nutzerhandbuch und „Rundgang dieser Seite"; Dock-Menü mit offenen Tabs und Schnellstart; Profilbild im Rechtsklick-Menü auf Kunden; Zustand aus `/api/app/navigation`, Befehle per postMessage (`desktop-app-bridge`), Prüfung über `GLATTTHUB_DEBUG_MENU` |
| 09.10.2026 | 1.1.5 | **1.1.4 nicht verteilen:** Der Preload-Wächter rief `classList.add()` auch bei vorhandener Klasse auf — das schreibt das Attribut neu, löst die nächste Mutation aus und friert den Renderer in einer Endlosschleife ein (Login- und Startseite reagierten auf nichts). Jetzt nur setzen, wenn die Klasse fehlt; Nachweis in der echten App per CDP |
| 09.10.2026 | 1.1.4 | Layout-Sprung beim Seitenwechsel behoben: User-Agent-Token `glatttHub-Desktop/<version>` (Hub rendert `electron-tabs-visible` serverseitig, `NativeApp::isDesktop()`), `MutationObserver`-Wächter für die `<html>`-Klasse im Preload und im Hub (deckt 1.1.3 und das Admin-Panel ab) |
| 20.09.2026 | 1.1.3 | Neues Icon-Set (Icon Composer `@4x`-Exporte, `icon-exports.sh`), eigenes Favicon `glatttHub_Favicon.png` für Hub, Wiki und Nutzerhandbuch (`scripts/update-favicons.sh`), iOS-Web-App-Icons vollflächig auf Weiß (keine schwarzen Ecken auf dem iPhone-Homescreen) |
| 20.09.2026 | 1.1.2 | Neues App-Icon (Icon Composer, „Hub"-Schriftzug), Icon-Skripte für das neue Export-Namensschema (`Default-16@1x`), `release.sh` |
| 20.09.2026 | 1.1.1 | Eigenes Rechtsklick-Menü mit Objekt-Einträgen (Kunde/Vertrag/Forderungsfall, `data-ctx`-Konvention + Konventions-Test), Tab-Menü, Tabs per Drag & Drop sortieren, 24 px Abstand unter der Leiste, Klasse `electron-tabs-visible` auf `<html>` (kein Layout-Sprung) |
| 20.09.2026 | 1.1.0 | Tabs im Fenster (Tab-Leiste in der Titelzeile, Kontextmenü „in neuem Tab öffnen", ⌘-Klick, `data-href` für JS-Zeilen), Zurück/Vor/Neu laden je Tab, Admin-Panel und `target="_blank"` als Tab statt Fenster, Tab-Titel mit Kundenname/-nummer, Hub-URL per `GLATTTHUB_URL` überschreibbar |
| 09/2026 | 1.0.0 | Erste Version: Electron-Wrapper, Overlay-Titelleiste, Tray, APNs-Push, Dock-Badge, signiert & notarisiert, PKG für MDM |
