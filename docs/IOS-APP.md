# iOS/iPadOS-App (Swift)

Native iPhone-/iPad-App für glatttHub — eine Swift/SwiftUI-Hülle um den Hub (`WKWebView`) mit nativem
Login, APNs-Push, Face ID, Kamera, Universal Links, Kontextmenü, MDM-Steuerung und Home-Screen-Widgets.
**Stand 20.09.2026: Bauplan beschlossen; Backend-Vorarbeiten B1–B6 und B10 auf `develop`/Staging;
Xcode-Projekt mit Phase-1-Code unter `ios/` angelegt — die Google/IAP-Anmeldung rendert im WKWebView
(Weg A bewiesen, Simulator); voller Login mit Konto + PIN auf echtem Gerät steht aus.** Der vollständige Bauplan mit
Entscheidungstabellen, Sequenzdiagrammen und Arbeitspaketen liegt als Claude-Doc vor
([glatttHub iOS-App — Bauplan](https://claude.ai/code/artifact/c74ef4a9-112c-4de2-ad61-9546f3612858));
diese Seite ist die technische Kurzreferenz, die mit der Umsetzung wächst.

---

## Für Endanwender

!!! nutzerhandbuch "Bedienung: Grundlagen – Die iPhone-/iPad-App (folgt mit dem Pilot)"
    Die App ist der glatttHub als eigene App auf iPhone und iPad — auf den Instituts-iPads über die
    Geräteverwaltung installiert (nicht löschbar), auf persönlichen Geräten des Managements per
    Einlösecode aus dem App Store. Alle Abläufe sind dieselben wie im Browser
    ([Serie „Grundlagen"](https://hilfe.hub.glattt.com/grundlagen/)). Zusätzlich: Mitteilungen als echte
    Push-Nachrichten mit Zähler auf dem App-Symbol, Hub-Links aus E-Mail/WhatsApp öffnen direkt die App,
    Kamera für Laser-Fotos, Face ID auf persönlichen Geräten, Kennzahlen als Widget auf dem Home-Bildschirm.
    Die Klickanleitung entsteht mit dem Pilot (Abdeckung: `status: "geplant"`).

Warum keine PWA: Eine PWA kann jede Mitarbeiterin löschen, sie lässt sich nicht zentral verwalten und
Push funktioniert nur unter Bedingungen. Die native App wird über Miradore als Pflicht-App verteilt,
fern konfiguriert (Kiosk-Modus für Instituts-iPads) und bei Bedarf fern entfernt.

---

## Für Entwickler

### Entscheidungen (Jan, 20.09.2026)

| Thema | Entscheidung |
|---|---|
| Architektur | Phase 1: `WKWebView`-Hülle (wie die Electron-App); Phase 2: ausgewählte native Prozesse (Tageserfassung, Laser-Wartung) nach Pilot |
| Login | Google-Identität + IAP bleiben; Hub-PIN/Passwort wie heute; kein Blocker für den App-Review |
| Verteilung | Apple Business Manager **Custom App**: Firmengeräte über Miradore (Pflicht-App), BYOD per Einlösecode |
| Umfang | Alle Rollen, ganzer Hub, Institutsseite höchste Priorität, alles online, Kamera + Datei-Upload |
| Push & Links | APNs mit Badge und Aktionen; Universal Links für `hub.glattt.com` (`/hub/*`, `/invitation/*`; `/shared/*` bleibt Safari) |
| Sicherheit | Web-Auto-Logout bleibt; Face ID/Touch ID nur auf nicht geteilten Geräten |
| Widgets | WidgetKit-Widgets mit Kennzahlen aus der `KpiRegistry` (Ergänzung Jan, 20.09.2026) |
| Entwicklung | Jan + Claude Code; Projekt unter `ios/` im Hub-Repo (neben `electron/`), Xcode 27, Swift 6, iOS 17+ |

### Was wiederverwendet wird

| Baustein | Bestand | Nutzung |
|---|---|---|
| Apple-Konto | Team `63DQ6FV92R`, App-ID `com.glattt.hub`, APNs-Key `4VXP44Y6GY` | gleiche App-ID; APNs-Topic muss `config('push.apns.bundle_id')` entsprechen |
| Electron-App | `electron/main.cjs` (Whitelist, UA-Bereinigung, APNs), `preload.cjs` (Bridge `window.electronPush`, `HUB_OBJECTS`, Kontextmenü) | Bridge-Vertrag, Kontextmenü und Navigations-Regeln 1:1 portieren — siehe [Desktop-App](DESKTOP-APP.md) |
| Push-Backend | `push_subscriptions` (`provider=apns`, `native_device_id`, `apns_device_token`), `ApplePushNotificationService`, `POST /api/push/subscribe/native` | direkt nutzbar — siehe [Notifications](NOTIFICATIONS.md) |
| IAP-Routing | `/api/*`, `/shared/*`, `/livewire/*`, Assets ohne IAP | Push-Registrierung und Widget-API laufen ohne IAP; `/.well-known/*` kommt dazu — siehe [Cloud-Infrastruktur](CLOUD-INFRASTRUKTUR.md) |
| Mobiles Layout | seit 08/2026 jede Seite mobil, `viewport-fit=cover`, Safe-Area im Theme | fertig — siehe [Mobile Design](MOBILE-DESIGN.md) |
| Institutsseite | `/shared/institut/{token}` ohne IAP/Login + JSON-API | Kiosk-Modus der iPad-App; Basis für nativen Nachbau |
| Kontextmenü-Konvention | `data-ctx*`, `data-href`, `data-ctx-page` | Long-Press-Menü liest dieselben Attribute |

### Die eine Hürde: Google-Login hinter IAP im WebView

Google lehnt OAuth in eingebetteten WebViews ab (`403 disallowed_useragent`, Erkennung über den
User-Agent). `ASWebAuthenticationSession`/`SFSafariViewController` helfen **nicht**: Sie haben ein eigenes
Cookie-Fach, die App bekommt die IAP-Cookies (`GCP_IAAP_AUTH_TOKEN_*`) nie zu sehen.

- **Weg A (Phase 1):** Login im `WKWebView` mit Mobile-Safari-User-Agent
  (`customUserAgent = "<Mobile Safari UA> glatttHub-iOS/<version>"`) — dasselbe Prinzip wie die
  Electron-App, die den `Electron/`-Token entfernt. Login-Popups (`window.open` von
  `accounts.google.com`/`iap.googleapis.com`) über `WKUIDelegate.createWebViewWith` mit **derselben
  `configuration`** in einem Sheet (nur so teilen sie Cookies und `window.opener`).
- **Weg B (Härtung, Phase 3):** eigener Host `app.hub.glattt.com` ohne IAP; Google-Identität nativ per
  Google Sign-In (iOS-OAuth-Client), Laravel-Middleware prüft das ID-Token (`hd=labrado-schlueter.com`)
  und bindet ein Gerätecookie (+ App Attest). Gleiche Sicherheitsaussage wie IAP, policy-konform.
- Die App kapselt beides hinter einem `AuthProvider`-Protokoll; Erfolg von Weg A wird am **ersten
  Arbeitstag** geprüft — scheitert er, startet sofort Weg B.

### Projekt bauen & testen

Das Projekt liegt unter `ios/` im Hub-Repo und wird aus `ios/project.yml` erzeugt
(**XcodeGen**, `brew install xcodegen`). Konfiguration **immer in `project.yml` ändern** und neu
generieren — das eingecheckte `glatttHub.xcodeproj` ist abgeleitet:

```bash
cd ios && xcodegen generate                       # Projekt (neu) erzeugen
open glatttHub.xcodeproj                          # Xcode: Scheme „glatttHub" (Debug = Staging-Hub, APNs-Sandbox)
xcodebuild -project glatttHub.xcodeproj -scheme glatttHub \
  -destination 'platform=iOS Simulator,name=iPhone 17' test CODE_SIGNING_ALLOWED=NO   # Swift-Tests ohne GUI
```

Schemes: `glatttHub` (Debug → Staging, Archiv → Release/Prod) und `glatttHub Staging` (TestFlight
gegen Staging). Basis-URL je Konfiguration in `ios/Config/*.xcconfig` (`HUB_BASE_URL`), Push-Umgebung
über die Compile-Bedingung `APNS_SANDBOX` (nur Debug). Simulator-Runtime einmalig per
`xcodebuild -downloadPlatform iOS`; Push nur auf echtem Gerät.

Dateistruktur: `App/` (Einstieg, `AppContainer` als Composition Root, `AppState`), `Config/`
(`AppConfig`, `ManagedConfig` = MDM, `Keychain`, `DeviceIdentity`), `Web/` (`WebViewStore`,
`WebCoordinator`, `PopupWebViewController`, `AllowedHosts`, `DownloadPresenter`), `Bridge/`
(`NativeBridge`, `BridgeMessage`, `Resources/bridge.js`), `Auth/` (`SessionMonitor`, `HubSession`),
`Push/` (`PushManager`, `NotificationDelegate`), `Lock/` (`BiometricLock`, `PrivacyShield`), `Menu/`
(`HubObject`, `ObjectMenu`), `Screens/`, `glatttHubTests/` (Swift Testing).

### Architektur

```
RootView (SwiftUI)
 ├─ HubWebView (WKWebView, ein Data-Store, Safari-UA + Suffix)
 │    ├─ WebCoordinator: Whitelist (aus electron/main.cjs), _blank, Popups, Downloads (WKDownloadDelegate), Offline
 │    └─ NativeBridge: window.glatttNative (WKUserScript, WKScriptMessageHandlerWithReply)
 ├─ BiometricLock / PrivacyShield (nur sharedDevice=false)
 ├─ PushManager + NotificationDelegate (APNs, Kategorien, Badge, Tap → URL)
 ├─ ObjectMenu (Long-Press auf data-ctx, Port von HUB_OBJECTS)
 ├─ KioskView (MDM: kioskMode + instituteToken → /shared/institut/{token})
 └─ SettingsSheet (Face ID, Push-Status, Umgebung, Version, Abmelden)
glatttHubWidgets (WidgetKit-Extension, App Group, Keychain-Sharing)
```

Konfiguration: `HUB_BASE_URL` per `xcconfig` (Debug/Staging = Staging-URL, Release = Prod), zur Laufzeit
überschreibbar durch Managed App Configuration (`com.apple.configuration.managed`).

### Native Tab-Leiste (Liquid Glass) & Mehr-Sheet

Seit 20.09.2026 ersetzt eine **native Tab-Leiste** die Web-Bottom-Nav in der App (Entscheidung
Jan: Option A). Auf iOS 26 rendert iOS sie als Liquid Glass (schwebend, schrumpft beim Scrollen,
Suche als eigene Pille rechts), auf iOS 17/18 als klassische Leiste — die App zeichnet nichts selbst.

- **Quelle:** `GET /api/app/navigation` (`AppNavigationController`, Session-Auth, `routes/app.php`)
  liefert `tabs` (Start, Termine, Kunden, Berichte), `groups` (Verkauf … System mit Einträgen),
  `utilities` (Mitteilungen, Profil, Admin), `user` (Name, E-Mail, Avatar, `can_ai`), `klick_portal`,
  `unread_count` sowie `branches` (Standorte für die native Standortwahl: erlaubte Institute des
  Nutzers, Reihenfolge/Farbe aus dem Institut-Modul, `hidden` für ausgeblendete) und
  `has_branch_restriction` — nach Rechten gefiltert aus `MobileNavigation::PRIMARY/MORE` +
  `NavigationGroups::GROUPS`; Heroicon → SF Symbol über `MobileNavigation::SYMBOLS`. Dieselbe
  Klasse speist die Web-Bottom-Nav.
- **App:** `HubTabBarController` (UIKit `UITabBarController`, ab iOS 18 `UITab`). **Jeder Haupttab
  hat sein eigenes WebView** (seit 20.09.2026, Jan: „Instant-Wechsel wie Instagram"): `WebViewStore`
  erzeugt sie lazy beim ersten Tipp, alle teilen `WKWebsiteDataStore.default()` (eine Sitzung, ein
  localStorage), einen `WKProcessPool` und einen `WKUserContentController` (Bridge). Der Tab-Wechsel
  zeigt nur ein anderes View — Scroll-Position und Unterseite bleiben; zweiter Tipp auf den aktiven
  Tab scrollt nach oben bzw. führt von einer Unterseite zur Wurzel; ein Tab, der > 30 Min verborgen
  war, lädt beim Erscheinen neu. `primary` (Tab 1) ist zugleich das WebView für Login, Kiosk und das
  breite iPad. Bereiche aus dem Mehr-Sheet und Push-Ziele wechseln in den passenden Haupttab
  (`tabIndex(for:)`); **alles andere lädt im eigenen WebView des „Mehr"-Tabs** (`selectMore()`,
  „Mehr" ist dann markiert, die vier Haupttabs behalten ihre Seiten — Befund Jan 20.09.2026: vorher
  landete Verträge im Berichte-Tab). Ein Nutzer-Tipp auf „Mehr" öffnet weiter nur das Sheet.
  **Mehr-Pool (seit 20.09.2026):** Statt einem Mehr-WebView ein LRU-Pool (`WebViewStore.moreWebView(forKey:)`,
  iPhone 4, iPad 6) — Schlüssel ist der Navigations-Eintrag (sonst der Pfad). Zuletzt offene Mehr-
  Bereiche sind beim nächsten Antippen sofort da (inkl. Scroll-Position); der älteste fliegt raus,
  wenn der Pool voll ist. Nach dem Login wird der zuletzt genutzte Bereich im Hintergrund vorgewärmt
  (`prewarmMore`). **Bewusst nicht „alle 20 Seiten vorladen":** ~50 MB und ein WebContent-Prozess je
  WebView — iOS beendet die App dann im Hintergrund. Messung 20.09.2026 (lokal, warm, als
  `X-Livewire-Navigate`): alle 20 Navigationsseiten rendern in 0,21–0,28 s — der Rest ist Cloud-Run-
  TTFB und Netz, serverseitig gibt es keine langsame Seite mehr zu beschleunigen.
  **Seitenwechsel per `WebViewStore.navigate`:** sofort eine hub-farbene Ladefläche mit Spinner über
  dem Ziel-WebView (sonst steht 1–2 s die alte Seite), dann `Livewire.navigate(url)` im WebView (kein
  Asset-Neuladen), Fallback `load()`; die Fläche geht bei `didCommit`, beim `ready` der Bridge
  (`livewire:navigated`) oder nach 10 s. URL-Wechsel des **aktiven** WebViews (KVO,
  folgt `wire:navigate`) → `syncSelection`. Badge am Tab „Mehr" = ungelesene Mitteilungen. Nur bei
  kompakter Breite (iPhone, iPad schmal). **Fünf Tabs, kein Such-Tab:** mit sechs Einträgen schiebt
  iOS den sechsten in ein System-„Mehr"; die Suche steckt deshalb im Mehr-Sheet.
  **Tabs synchron halten:** Standort- und Theme-Wechsel passieren im Alpine-Zustand *eines* Tabs;
  bridge.js meldet `branchChanged`/`themeChanged`, die App sendet `glattt:sync-branch` /
  `glattt:sync-theme` an die anderen WebViews (`NativeBridge.emit(_:_:to: .others(source))`), die
  Listener in `bottom-nav.blade.php` rufen `pickBranch()` bzw. `themeManager.setTheme()` nur bei
  abweichendem Wert — so entsteht keine Schleife. `glattt:foreground` und `glattt:set-branch` gehen
  an alle, Rundgang/glatttBert/Sheets nur an das aktive.
- **Liquid-Glass-Details:** `tabBarMinimizeBehavior = .onScrollDown` (iOS 26, Leiste schrumpft beim
  Runterscrollen — braucht `setContentScrollView(webView.scrollView, for: .bottom)` im Platzhalter),
  **Pull-to-Refresh** (`UIRefreshControl` an jeder Scroll-View → `reload()`, Ende bei `didFinish`).
- **Schnellaktionen** (langer Druck aufs Symbol, `UIApplicationShortcutItems` in `project.yml`):
  Termine heute, Kunde suchen (Mehr mit Suchfeld), Mitteilungen (Mehr → Liste), glatttBert. Beim
  Kaltstart merkt `SceneDelegate` (über `configurationForConnecting`) die Aktion, `AppContainer.perform`
  führt sie nach `ready` aus (`state.pendingShortcut`). **Fallstrick:** `UIApplication.shared.delegate`
  ist bei SwiftUI ein Wrapper, kein Cast auf `AppDelegate` — die Instanz merkt sich `AppDelegate.shared`.
  Abgesichert durch den Springboard-UI-Test `QuickActionUITests` (Schema „glatttHub UI", ~2,5 Min).
- **Mehr (`MoreSheet`) = Spiegel des mobilen Web-Sheets:** Suchfeld oben (`.searchable`, erst
  `/hub/search?q=` lokal, dann `sources=remote` für Phorest — Treffer ersetzen das Raster), Raster
  in vier Spalten mit den Überschriften Schnellzugriff/Verkauf/…/System (+ Admin Panel), Werkzeug-
  Kacheln (glatttBert, Rundgang, Anleitung, Standort, Mitteilungen mit Badge, Design, App), Profil-
  Zeile mit Avatar/Initialen und Abmelden ohne Rückfrage (`POST /logout`, dann **nur die
  Laravel-Cookies** des Hub-Hosts löschen — Google-/IAP-Sitzung bleibt, danach erscheint der
  Hub-Login mit PIN; auf geteilten Geräten (`sharedDevice`) räumt `clearEverything()` auch
  Google/IAP). Das Admin Panel füllt die System-Zeile auf vier Kacheln.
  **Standortwahl und Mitteilungen sind native Unteransichten** im selben `NavigationStack`
  (Zurück-Pfeil wie im Web): `BranchPickerView` (Alle Standorte nur ohne Nutzer-Einschränkung,
  Institute mit Farbkreis und Kürzel, „Ausgeblendet"-Kennzeichen) und `NotificationsView`
  (`GET /phorest/notifications?branch_id=`, Tippen markiert gelesen + öffnet das Ziel, „Alle
  gelesen", Link zur Mitteilungsseite — dieselben Endpunkte wie Glocke und Web-Sheet, aufgerufen
  mit den WebView-Cookies inkl. IAP). Die Standort-Kachel zeigt Farbe und Kürzel des gewählten
  Instituts. **Der Hub bleibt die Wahrheit für den Standortfilter:** bridge.js meldet
  `localStorage.selectedBranch` (`branchChanged`), die App schreibt die Wahl per
  `glattt:set-branch` zurück, `bottom-nav.blade.php` ruft daraufhin `pickBranch()` (localStorage +
  `selectedBranchUser` + Event `branchChanged` für alle Karten). Nur Rundgang, Design und glatttBert
  delegieren noch an den Hub (`glattt:start-tour`, `glattt:toggle-theme`, `glattt-bert-toggle`) —
  **das Web-Sheet geht in der App nie mehr auf.** Die Lupe im mobilen Scroll-Header (`open-mobile-
  search`) fängt bridge.js ab (Capture + `stopImmediatePropagation`) und öffnet stattdessen das
  native Mehr mit fokussiertem Suchfeld (`openMore { focusSearch }`).
- **Nur angemeldet:** Die Leiste erscheint erst, wenn bridge.js `ready({ loggedIn: true })`
  meldet (Hub-Layout mit `<meta name="glattthub-app">`); auf Google-/IAP-Seiten (fremder Host in
  `didFinish`) und auf der Hub-Login-Seite (`loggedIn: false`) ist sie versteckt
  (`setTabBarHidden`, iOS 18+).
- **Nativer PIN-Login (`PinLoginView`):** Meldet bridge.js `/login` ohne Anmeldung, legt die App
  ein natives Sheet (medium) über die Web-Login-Seite: vier Punkte, Zifferntastatur, Absenden bei
  der vierten Ziffer, `POST /login/pin` mit `Accept: application/json` (422 → Fehlertext aus
  `errors.pin`, 429 → Wartehinweis). Grund: Im WKWebView schiebt die Tastatur die ganze Seite
  hoch (kein Schalter dafür). **Fallstrick Cookies:** `HubSession` nutzt eine eigene URLSession
  ohne Cookie-Speicher (`httpCookieAcceptPolicy = .never`) — Cookies kommen nur aus dem
  WebView-Store, und die neue Laravel-Sitzung aus dem Set-Cookie der Login-Antwort wird per
  `adoptCookies` in den `WKHTTPCookieStore` übernommen, sonst wäre nur die URLSession
  angemeldet, nicht das WebView. E-Mail-Login: Sheet wegziehen, das Web-Formular liegt darunter.
  Nach erfolgreicher PIN bleibt das Sheet mit „Anmeldung läuft …" stehen, bis der Hub `ready`
  meldet (dann schließt es über der fertigen Startseite; Notausgang nach 20 s).
- **Kaltstart (gemessen 20.09.2026, Simulator/Staging):** erste Anfrage 0,00 s nach Prozessstart
  (`loadStartOrPending()` im Container-Init), erste Antwort nach 1,85 s, Hub bereit nach 2,13 s — die
  Zeit ist Netz + Cloud Run (Staging skaliert auf null, die erste Anfrage nach Ruhe trifft eine kalte
  Instanz). App-seitig bleibt nichts zu holen; Logs `Start: …` (Kategorie `web`/`bridge`) zeigen die
  Schritte. Launch-Screen zeigt Hub-Farbe + Logo an derselben Stelle wie der Ladeschirm.
- **App-Switcher & Sperre:** Inhalt bleibt sichtbar; bei aktiver Face-ID-Sperre liegt nur ein Unschärfe-Schleier (`.ultraThinMaterial`) mit Entsperr-Knopf darüber.
- **Ladeschirm (`LoadingView`):** animiert (pulsierender Logo-Ring, drei laufende Gold-Punkte); Beim Start und nach dem Abmelden liegt ein Schirm im Look der
  Login-Seite (Verlauf, Logo, Spinner) über dem WebView, bis die erste Seite fertig ist
  (`didFinish`, `ready` oder Ladefehler → `isLoading = false`) — sonst bleibt der Bildschirm
  schwarz, solange Google/IAP laden. Launch-Screen und WebView-Hintergrund nutzen die Farbe
  `HubBackground` (hell `#f8fafc`, dunkel `#1e293b`) statt Schwarz/Weiß.
- **Safe-Area kommt von der App, nicht von WebKit:** Mit `contentInsetAdjustmentBehavior = .never`
  (nötig, damit der Hub bis unter die Statusleiste zeichnet) liefert WebKit `env(safe-area-inset-*)`
  = 0 (gemessen 20.09.2026: nativ 62/83 pt). `theme_glattt.css` verwendet deshalb ausschließlich
  `var(--safe-area-top|bottom|left|right)` (Standard in `:root` = `env()`), und die App setzt die
  Werte per Inline-Style auf `<html>` — bei jedem `didCommit` und bei `safeAreaInsetsDidChange`
  (`HubWKWebView`). Unten steckt die Höhe der Tab-Leiste drin, damit Body-Polster, Bottom-Sheets,
  glatttBert und Badges darüber liegen. `SafeAreaConventionTest` verbietet direktes `env()`.
- **CSS:** `body.ios-app .mobile-bottom-nav { display: none }` und `--mobile-bottom-nav-space: 0`;
  den Abstand nach unten liefert die native Leiste über die Safe-Area.

### Gerätetoken & Face-ID-Anmeldung (B7/B9, seit 20.09.2026)

**Für Endanwender:** Nach dem ersten PIN-Login fragt die App auf persönlichen Geräten „Künftig mit
Face ID anmelden?". Danach meldet Face ID/Touch ID genau diese Person an — ohne PIN, ohne Google-
Dialog. Im Profil unter **App-Geräte** sieht man seine Geräte und kann jedes entfernen; dann
verlangt die App dort wieder die PIN. Abmelden in der App hebt Face ID **nicht** auf.

**Für Entwickler:**

- **Datenmodell:** `app_devices` (Nutzer × `native_device_id`, Gerätename, Plattform, App-/OS-Version,
  `last_used_at`, FK auf `personal_access_tokens`). Das Token ist ein Sanctum-Token mit den
  Fähigkeiten `app:session` und `app:widgets` (`AppDevice::ABILITIES`) — dasselbe Token speist
  später die Widgets.
- **Service `AppDeviceService`:** `register()` ersetzt ein bestehendes Token desselben Geräts und
  entzieht anderen Nutzern dasselbe Gerät (das Gerät gehört jetzt dieser Person); `revoke()` löscht
  Token + Gerät. `RejectArchivedUsers` widerruft beim ersten Aufruf eines archivierten Nutzers
  alle seine Geräte.
- **Endpunkte (`routes/app.php`, IAP-frei):** `GET/POST /api/app/devices` und
  `DELETE /api/app/devices/{device}` mit Session-Auth (WebView-Cookies, direkt nach der PIN);
  `POST /api/app/session` mit **Bearer-Token** (`auth:sanctum`, CSRF-Ausnahme in `bootstrap/app.php`)
  → `Auth::guard('web')->login()` + `session()->regenerate()`, der Session-Cookie der Antwort geht
  in den WebView. Ungültiges/widerrufenes Token → 401, archiviert → 403 (+ Widerruf).
- **App:** `DeviceCredential` legt das Token im Keychain mit
  `SecAccessControlCreateWithFlags(kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly, .biometryCurrentSet)`
  ab — Lesen löst Face ID aus (`LAContext` in der Query, `SecItemCopyMatching` abseits des Main-
  Threads), ein neu registriertes Gesicht macht den Eintrag ungültig. Unverschlüsselt liegen nur
  Name/E-Mail (Anzeige „Als … anmelden") und die Geräte-ID des Hubs. `PinLoginView` hat vier
  Phasen: `enter` (PIN, mit Face-ID-Knopf falls eingerichtet), `biometric` (Abfrage läuft),
  `offer` (nach PIN: aktivieren / später / nicht mehr fragen), `loading` (bis `ready`).
  `AppContainer.loginWithBiometrics()` → Token → `/api/app/session` → Cookies → Hub laden; bei 401/403
  wird der Keychain-Eintrag gelöscht und die PIN angeboten. Einstellungen zeigen, für wen die
  Anmeldung eingerichtet ist, und heben sie auf (`DELETE` + Keychain).
- **Profilseite:** Partial `hub/profile/partials/app-devices.blade.php` (Alpine, `GET/DELETE`).
- **Test:** `tests/Feature/AppDeviceTokenTest.php` (Registrieren/Ersetzen, Sitzung, Widerruf,
  Archivierung, Besitzerwechsel, Sichtbarkeit je Nutzer).

### Bridge `window.glatttNative`

Spiegelt `window.electronPush`; `push-notifications.js` bekommt eine generische Abstraktion
(`getNativeBridge()` = `window.glatttNative ?? window.electronPush`).

| Hub → App | App → Hub (CustomEvent) |
|---|---|
| `registerForApnsNotifications()` → `{ token, environment: 'production'\|'sandbox', nativeDeviceId }` (löst die iOS-Systemabfrage aus) | `glattt:push-received` (Vordergrund-Push) |
| `unregisterForApnsNotifications()`, `getPushStatus()` → `'granted'\|'denied'\|'default'` (Web-Vokabular, weil das WKWebView kein `window.Notification` hat) | `glattt:push-opened` (`url`, `log_id`) |
| `setBadge(n)`, `saveFile({name,mime,base64})`, `openExternal(url)`, `haptic(kind)`, `scanDocument()` → `{ name, mime, base64 }` (VisionKit, wirft bei Abbruch), `scanInto(input)` (legt den Scan in ein `<input type="file">`, löst `input`/`change` aus) | `glattt:foreground`, `glattt-bert-ask` (`question`, Siri-Intent) |
| `getInfo()` → `{ platform: 'ios', appName: 'glatttHub iOS App', appVersion, deviceName, nativeDeviceId, sharedDevice, kioskMode, canScan }`, `reportContext(ctx)` | `glattt:biometric-unlocked` |
| `ready({ path, loggedIn })` (jede Seitenlast; `loggedIn` = Hub-Layout erkannt), `branchChanged({ branchId })` (Standortfilter, von bridge.js selbst gemeldet), `openMore({ focusSearch })` (Lupe im Scroll-Header) | `glattt:set-branch` (`branchId`), `glattt:toggle-theme`, `glattt:start-tour`, `glattt:open-anleitung`, `glattt-bert-toggle` — Listener am Wurzelelement von `bottom-nav.blade.php` |

`push-notifications.js` lädt `getInfo()` und `getPushStatus()` in `init()` (`loadNativeInfo()`); `device_type`
wird daraus `ios` bzw. `macos`, der Gerätename kommt aus `deviceName`. `platform` ist `ios` für iPhone
**und** iPad (die ENUM-Spalte `device_type` kennt kein `ipados`; der Gerätename unterscheidet).

Erkennung: User-Agent-Suffix `glatttHub-iOS/<version>` (serverseitig `App\Support\NativeApp::isIos()`),
`body.ios-app`, `<meta name="glattthub-app" content="ios">`. Bridge nur für den Hub-Host injizieren.

### Managed App Configuration (Miradore → App)

| Schlüssel | Typ | Bedeutung |
|---|---|---|
| `baseUrl` | String | Hub-URL, Staging für Testgeräte |
| `sharedDevice` | Bool | geteiltes Gerät: keine Face ID, keine Widgets, Abmelden prominent |
| `kioskMode` / `instituteToken` | Bool / String | direkt auf die Institutsseite; Miradore setzt zusätzlich Single-App-Modus |
| `deviceName` | String | Anzeigename in der Push-Geräteliste |
| `lockAfterSeconds` | Int | Face-ID-Sperre nach Hintergrund (Standard 60) |

### Backend-Arbeitspakete im Hub

| # | Paket | Kern |
|---|---|---|
| B1 ✅ | App-Erkennung | `App\Support\NativeApp` (User-Agent-Suffix `glatttHub-iOS/<version>`), `<meta name="glattthub-app">` + `glattthub-app-version`, `body.ios-app`; Push-Init im Layout prüft `isNativeSupported()` statt Electron/PWA-Bedingungen. Test `NativeAppDetectionTest` |
| B2 ✅ | Generische Push-Bridge | `push-notifications.js`: `getNativeBridge()`, `isNativeSupported()`, `loadNativeInfo()`, `subscribeNative()`; `getPermission()` ohne `window.Notification`; Electron-Aliase bleiben |
| B3 ✅ | APNs-Umgebung je Gerät | Migration `2026_09_20_120000_add_apns_environment_to_push_subscriptions_table`, `PushSubscription::usesProductionApns()`, Client je Subscription, Endpunkt nimmt `environment` + `device_type` `ios`. Test `ApplePushEnvironmentTest` |
| B4 ✅ | Push-Payload | `badge` (`Notification::unreadCountFor()`), `category` (`HUB_OBJECT`/`HUB_INFO`, `ApplePushNotificationService::categoryFor()`), `thread-id` (Modul), `apns-collapse-id`; Zusatzdaten aus `HubNotificationDispatcher::pushData()`; `POST /api/push/mark-read` (`log_id` → Klick + In-App gelesen, Antwort `unread_count`). Test `ApplePushPayloadTest` |
| B5 ✅ | Badge-Sync | Glocke (Sidebar) ruft `window.glatttNative.setBadge(unread)` neben `electronBadge` |
| B6 ✅ | Universal Links | Route `/.well-known/apple-app-site-association` + `/apple-app-site-association` (`AppleAppSiteAssociationController`, Team/Bundle aus `config/push.php`); LB-Regel `/.well-known/*` ohne IAP existiert bereits (geprüft 20.09.2026). Test `AppleAppSiteAssociationTest` |
| B7 ✅ | Geräte-Token | `POST /api/app/devices` (Session-Auth) → Sanctum-Token (`app:session`, `app:widgets`), Tabelle `app_devices`, `POST /api/app/session` für Face ID; Widerruf im Profil/App und bei Archivierung (nicht beim Abmelden). Test `AppDeviceTokenTest` |
| B8 ✅ | Widget-Endpunkt | `GET /api/app/widgets/kpis` + `/catalog` via `KpiValueService` (Rechte, `BranchVisibility`, 5-Min-Cache) |
| B9 ✅ | Geräte im Profil | Abschnitt „App-Geräte" auf der Profilseite (`hub/profile/partials/app-devices`), „Entfernen" widerruft das Token. **Klickanleitung Profil nachziehen** (neuer Abschnitt, Screenshot) |
| B10 ✅ | Kiosk-Anker | Tab „Extern" des Institut-Moduls zeigt unter dem Zugangs-Link den Block „iPad-App (Kiosk-Modus)" mit der Managed App Configuration zum Kopieren (`InstituteAccessTokenController::appConfig()`, `deviceName` = „iPad <Institut>"). Test `InstituteAccessTokenAppConfigTest`. **Klickanleitung Betrieb 2 (Institut-Modul) muss nachgezogen werden** (neuer Block, Screenshot) |
| B11 | Reviewer-Konto | `appreview@labrado-schlueter.com` mit PIN, Rolle Institute MA, Testinstitut Magdeburg |

Konventionen gelten unverändert: Migrationen statt SQL, `BranchVisibility`, Rechte nur über Gates, keine
Rollennamen im Code, Tests je Paket.

### Widgets (WidgetKit, B8 — seit 20.09.2026)

**Für Endanwender:** Vier Widgets — **Kennzahlen** (frei wählbar, mit Trend-Pfeil zur Vorperiode
und Monats-Sparkline), **Tagesübersicht** (Beratungen stattgefunden/im Gange/geplant, Verkäufe,
verkaufte KPZ, No-Shows mit Quote — die Karten der Terminübersicht, groß je Standort),
**Beratungsgespräche** (Zeiträume × Standort mit Ø-Vergleich) und **Verkaufte Körperzonen** (Balken
der letzten Monate + laufender Monat + Prognose-Balken, darunter je Tag; gestapelt nach Institut) —
klein bis extra groß, auf iOS 27 auch das seitengroße Hochformat.

Kennzahlen-Widget im Detail: vier Größen (klein: eine Zahl; mittel:
bis vier Kennzahlen in einer Zeile; groß: Liste oder — bei „Jeder Standort einzeln" — Tabelle je
Standort; Sperrbildschirm: eine Zahl). Langer Druck → „Widget bearbeiten": Kennzahlen, Standort
(Alle / ein Institut / jeder einzeln), Zeitraum (heute, Woche, Monat, 28 Tage, Jahr). Im laufenden
Monat zeigen Zähl- und Summenkennzahlen eine **lineare Prognose bis Monatsende**. Das Widget zeigt
genau die Kennzahlen, die die zuletzt in der App angemeldete Person auch im Hub sehen darf.

**Für Entwickler:**

- **Endpunkte** (`routes/app.php`, Bearer-**Widget-Token** mit `app:widgets`, IAP-frei):
  `GET /api/app/widgets/catalog` (erlaubte Kennzahlen aus `KpiRegistry::forUser`, Standorte aus
  `AppBranchList`, Zeiträume, Vorgaben) und `GET /api/app/widgets/kpis?kpis=a,b&branch=&range=`.
  Werte ausschließlich über `KpiValueService::values()` — je Kennzahl mit Rechteprüfung; nicht
  erlaubte Kennzahlen fehlen still. `WidgetKpiService` bildet Zeiträume auf `date_from/date_to` ab
  (Zukunfts-Kennzahlen ignorieren sie), `branch = 'each'` liefert einen Scope je sichtbarem Standort,
  cached 15 Min. Prognose: `Ist ÷ vergangene Tage × Monatstage` für `WidgetKpiService::FORECAST_KPIS`,
  ausdrücklich als „linear" beschriftet. Tests: `AppWidgetKpiTest`.
- **Zwei Token je Gerät** (`app_devices.personal_access_token_id` = Sitzung/Face ID,
  `widget_token_id` = Widgets): Das Widget-Token liegt in der App **ohne** Biometrie im geteilten
  Keychain (`<Team>.com.glattt.hub`, `AfterFirstUnlockThisDeviceOnly`), weil Widgets unbeaufsichtigt
  laden — dafür kann es keine Sitzung herstellen (`AppSessionController` prüft die Token-ID). Die
  App registriert das Gerät bei jeder Anmeldung (`ensureWidgetToken`, `session_token: keep`), Face-ID-
  Aktivierung mit `session_token: create`. „Gerät entfernen" räumt beide Token; Widgets zeigen dann
  „In der App anmelden".
- **Bericht-Widgets** (`WidgetReportService`, `GET /api/app/widgets/consultations` und `/body-zones`,
  jeweils mit dem Recht der Berichtsseite: `view_report_upcoming_consultations` bzw.
  `view_report_sales_statistics`, sonst 403 → „Kein Zugriff auf den Bericht"): Beratungen aus
  `ReportController::upcomingConsultationsKpi` (`by_branch` + Summen + Ø), Körperzonen aus
  `SalesStatisticsService::getBodyZonesChart/getBodyZonesDailyChart` (Monate mit `projection`, Tage
  des laufenden Monats). Standortnamen/-farben aus `AppBranchList`, ausgeblendete Institute fehlen.
  Charts im Widget mit Swift Charts (gestapelte `BarMark`, Prognose-Rest als blasser Aufsatz).
  Tests mit Fixtures, weil die Charts MySQL-Funktionen brauchen (`AppWidgetKpiTest`).
- **Tagesübersicht** (`WidgetDayService`, `GET /api/app/widgets/today`, Recht `view_appointments`):
  Termine des Tages live aus Phorest (alle sichtbaren Institute oder eines), Beratung = aktiver
  Beratungs-Service, Zustände wie `appointments.js getState()` (Absage-Mitarbeiter = No-Show,
  gebucht + 30 Min nach Ende = No-Show), Verkäufe/KPZ aus `contracts.signed_at` heute; 10-Min-Cache,
  Widget-Takt 15 Min. **Kennzahlen-Historie:** `history=1` liefert die letzten 6 Monatswerte je
  Kennzahl (Sparkline; nicht für `report`-Quellen) — 6 zusätzliche Service-Aufrufe, deshalb nur im
  Monats-Zeitraum und gecacht.
- **Erweiterung `glatttHubWidgets`** (`ios/glatttHubWidgets`, XcodeGen-Target `app-extension`, in die App
  eingebettet, `SWIFT_DEFAULT_ACTOR_ISOLATION = nonisolated`): `KpiWidgetIntent`
  (`WidgetConfigurationIntent`: `kpis: [KpiEntity]`, `branch: BranchEntity?`, `range`), Entitäten aus
  dem Katalog-Cache in der App-Gruppe (`group.com.glattt.hub`, max. 1 Tag alt, sonst frisch),
  `KpiTimelineProvider` (30-Min-Takt, 401/403 → „In der App anmelden"), Ansichten je Familie in
  `KpiWidget.swift`. Geteilter Code in `ios/Shared/WidgetShared.swift` (App-Gruppe, Keychain, Modelle,
  `WidgetFormat` de-DE mit Kompaktform „98,5 T€", `WidgetAPI`) — alles `nonisolated`, weil die App
  mit MainActor-Standard baut, die Erweiterung nicht. Tests: `WidgetFormatTests`.
- **Layout-Regeln (Feinschliff 22.09.2026 nach Gerätetest, Entscheidungen Jan):** Widgets füllen
  ihre Höhe — Listenzeilen wachsen gleichmäßig (`View.fill(max:)` in `WidgetChrome.swift`, gedeckelt,
  damit wenige Zeilen im Hochformat nicht auseinanderlaufen), Charts bekommen die Resthöhe über
  `GeometryReader` statt fester `frame(height:)` (vorher lief das seitengroße KPZ-Widget oben und
  unten über, mittlere Widgets blieben halb leer). In Listen steht die **Sparkline als eigene rechte
  Spalte** (`sparkColumnWidth`, auch leer, damit alle Zahlen bündig stehen) mit der Zahl direkt links
  daneben. **Prognose in der Sparkline nach Hub-Konvention:** gestrichelte Linie ab dem Vorzeitraum zum
  hohlen Punkt senkrecht über dem letzten Ist-Wert. **Institutskürzel** (`code`: BI, H, OS, HB, BS,
  MD — aus `ClientNumberService::PREFIX_SUGGESTIONS`, geliefert von `AppBranchList`) in allen
  Tabellen und engen Kopfzeilen; Legenden behalten den Kurznamen. Prognose im Monats-Chart bleibt ein
  eigener blasser Balken, Wochenend-Tage in voller Farbe (nur die Achsenbeschriftung blasser). Einheitlich
  „Alle Standorte" (nicht „Alle Institute"). Platzhalter: Shapes werden von `redacted` nicht ausgegraut —
  `Sparkline`/`TrendBadge` lesen `redactionReasons` selbst. **Galerie-Vorschau** („Widget hinzufügen",
  `context.isPreview`) zeigt die Beispieldaten (`sample`, `nonisolated`) statt grauer Balken. **Einheit
  entfällt, wenn das Label sie nennt** („Verkaufte Körperzonen" → 261, nicht „261 KPZ";
  `KpiWidgetView.displayUnit`, € und % bleiben) — Test `KpiDisplayUnitTests` im Snapshot-Target.
- **Vergleiche/Tendenzpfeile:** Die Services liefern `comparisons[].value`/`trend`/`unit` (`PP` bei
  Quoten) — genau so liest es das Web-KPI-Dashboard. `WidgetKpiService::comparison()` bildet das auf
  `change`/`unit`/`direction` ab; bis 22.09.2026 las er `change`/`direction` und es gab nie einen Pfeil.
  `UNRANGED_SOURCES` (`glattt`) bekommen keine Sparkline, weil `GlatttKpiService` den Zeitraum
  ignoriert und sonst sechsmal derselbe Wert erschien (flache Linie).
- **Snapshots ohne Gerät:** Target `glatttHubWidgetSnapshots` (Schema „glatttHub Widgets") kompiliert die
  Widget-Quellen ohne `WidgetBundle.swift` und rastert alle Widgets mit Beispieldaten in allen Größen
  hell/dunkel per `ImageRenderer`:
  `TEST_RUNNER_WIDGET_SNAPSHOT_DIR=/tmp/widgets xcodebuild -project ios/glatttHub.xcodeproj -scheme "glatttHub Widgets" -destination 'platform=iOS Simulator,name=iPhone 17' test CODE_SIGNING_ALLOWED=NO`
  (ohne Variable übersprungen; `TEST_RUNNER_`-Präfix reicht die Variable an den Test-Runner durch).
  Dafür gibt es `widgetFamilyOverride` im Environment (`widgetFamily` ist nur lesbar) und
  `WidgetChrome.bundle` (`Bundle(for:)` — `Bundle.main` wäre im Test die Host-App ohne die Farben).
- **Fallstricke:** App-Gruppe und Keychain-Gruppe brauchen die Capability im Developer-Portal
  (Xcode legt sie bei automatischer Signierung selbst an). Widgets bekommen keine Push-Auslöser —
  die App ruft `WidgetCenter.shared.reloadAllTimelines()` nach Login, Katalog-Refresh und
  Gerät-Entfernen.

### Phase D — Versionsprüfung, Siri, Scanner, Diagnose, Tastatur (seit 22.09.2026)

**Für Endanwender:** Eine zu alte App sperrt sich mit „Bitte App aktualisieren"; Siri und die
Kurzbefehle-App kennen „Wie läuft der Tag in glatttHub" (gesprochene Tagesübersicht ohne App-Start),
„Termine", „Kunde suchen", „Frag glatttBert", „Mitteilungen"; an Upload-Stellen (Reisekosten-Belege,
Forderungsfall-Beleg, Widerrufs-Dokumente, Unternehmensverträge) gibt es in der App den Knopf
**Scannen** (Kamera mit Kantenerkennung, mehrseitig, PDF); in den Einstellungen **Diagnose anzeigen
und teilen**; am iPad mit Tastatur ⌘1–⌘4 Haupttabs, ⌘5 Mehr, ⌘F Suche, ⌘⇧N Mitteilungen, ⌘[ / ⌘]
zurück/vor, ⌘R neu laden, ⌘, Einstellungen (⌘K glatttBert kommt vom Hub selbst).

!!! nutzerhandbuch "Bedienung: Grundlagen – iPhone/iPad-App (folgt nach dem Gerätetest)"

**Für Entwickler:**

- **Versionsprüfung:** `config/native_app.php` (`IOS_APP_MIN_VERSION`, `IOS_APP_LATEST_VERSION`,
  `IOS_APP_UPDATE_URL`, `IOS_APP_UPDATE_MESSAGE`; leer = keine Sperre). `GET /api/app/version`
  (ohne Login, `AppVersionController`/`AppVersionPolicy`, Version aus User-Agent oder `?version=`)
  liefert `min_version`, `latest_version`, `outdated`, `update_available`, `update_url`. Die App
  (`VersionGate`, Start + Vordergrund, höchstens stündlich) legt bei `outdated`
  `UpdateRequiredView` über alles — auch über die Face-ID-Sperre; `update_available` ist nur ein
  Hinweis in den Einstellungen. Sicherheitsnetz: Middleware `RejectOutdatedNativeApp` (web-Gruppe)
  antwortet zu alten iOS-User-Agents mit `426` (HTML `app.outdated` bzw. JSON); das WebView meldet
  426 an die `VersionGate` (`WebCoordinator.onUpgradeRequired`), die sofort nachliest. Tests
  `AppVersionPolicyTest`, `VersionGateTests`. Vor dem Setzen einer Mindestversion prüfen, dass die
  Custom App über ABM/Miradore auch wirklich verteilt ist — sonst sperrt man den Pilot aus.
- **Siri / App Intents** (`ios/glatttHub/Intents/HubIntents.swift`): `TodayOverviewIntent`
  antwortet ohne App-Start über das Widget-Token (`/api/app/widgets/today`, Recht
  `view_appointments`; ohne Token „Bitte in der App anmelden"). `OpenAppointmentsIntent`,
  `OpenNotificationsIntent`, `SearchClientIntent(query)` und `AskBertIntent(question)` öffnen die App
  und laufen über dieselbe Schnellaktions-Schiene wie die Home-Screen-Aktionen
  (`AppContainer.perform(shortcut:)`, vor der Anmeldung gemerkt); Suchbegriff → `state.moreSearchQuery`
  (Mehr-Sheet füllt das Suchfeld), Frage → `state.pendingBertQuestion` → CustomEvent `glattt-bert-ask`
  → `ai-assistant.blade.php` ruft `$wire.askPrompt()`. Sätze in `HubShortcuts` (`AppShortcutsProvider`,
  `.applicationName` Pflicht). Nach Änderungen an Sätzen die App einmal starten — iOS registriert sie
  beim Start.
- **Dokumentenscanner:** `DocumentScanner` (VisionKit `VNDocumentCameraViewController`, Seiten als
  JPEG 0,75 in ein PDF mit A4-Breite; das Delegate baut das PDF auf dem Hauptthread, weil
  `VNDocumentCameraScan` nicht Sendable ist). Bridge `scanDocument()`; `scanInto(input)` in
  `bridge.js` setzt `input.files` per `DataTransfer` (bei `multiple` bleiben vorhandene Dateien
  erhalten) und feuert `input` + `change` — Livewire `wire:model` und Alpine `@change` sehen den
  Scan wie eine Auswahl. Hub-Seite: Blade-Komponente `<x-app-scan-button input="$refs.feld"
  label="…" />` rendert **nur** bei `NativeApp::isIos()` (Test `AppScanButtonTest`) und liegt an
  fünf Stellen (Reisekosten Hotel/Bahn, Forderungsfall-Beleg, Widerrufs-Dokumente,
  Unternehmensvertrag-Wizard). Weitere Stellen: Komponente neben das Datei-Feld, `x-ref` am Input.
- **Diagnose:** `DiagnosticsReport.build()` (Version, Gerät, MDM, Zustand, Push, Face-ID/Widget-Token
  nur als Präfix, Versionsregel, Netz per `NWPathMonitor`, letzte 60 Log-Zeilen des Subsystems
  `com.glattt.hub` aus `OSLogStore(scope: .currentProcessIdentifier)`) → `DiagnosticsView` mit
  `ShareLink` (Mail/WhatsApp an die IT). Einstiege: Einstellungen → Hilfe; im Kiosk-Modus ein
  versteckter **Fünffach-Tipp oben links** (88 × 72 pt über dem Logo) — bewusst kein Ausstieg aus dem
  Kiosk, der bleibt Sache des MDM.
- **Tastaturkürzel:** `HubCommands` (`Commands` an der `WindowGroup`) — erscheinen im ⌘-Overlay des
  iPad; Tab-Ziele aus `state.navigation.tabs` (`AppContainer.selectTab`, ohne Tab-Leiste lädt der
  Pfad im aktiven WebView).

### Native Startseite „Cockpit" (seit 22.09.2026)

**Für Endanwender:** Der Tab „Start" der App ist nativ: Begrüßung mit Logo und Standort,
„Heute" (Beratungen, Verkäufe, KPZ, No-Shows), ein wischbares Kennzahlen-Karussell mit Verlauf,
Tendenz und Prognose (Zeitraum Heute/Woche/Monat/Jahr), das KPZ-Monatschart, die
Beratungs-Zeiträume, **Mein Bonus** (nur, wenn für die Person ein Bonus-Board existiert), die
letzten drei Mitteilungen und der Schnellzugriff. Jede Karte springt in die passende Hub-Seite;
Ziehen aktualisiert. Welche Abschnitte in welcher Reihenfolge und welche Kennzahlen erscheinen,
legt das Admin-Backend **je Rolle** fest (System → „App-Startseite je Rolle"); was die Rechte nicht
hergeben, fehlt still.

!!! nutzerhandbuch "Bedienung: Grundlagen – iPhone/iPad-App (folgt nach dem Gerätetest)"

**Für Entwickler:**

- **Layout je Rolle:** Tabelle `app_start_layouts` (`role_id` null = Standard, `sections` =
  Schlüssel in Reihenfolge, `kpis` = IDs der `KpiRegistry`), Modell `AppStartLayout` mit dem
  Abschnitts-Katalog `SECTIONS` (Schlüssel, Beschriftung, Recht) und den Code-Voreinstellungen
  `DEFAULT_SECTIONS`/`DEFAULT_KPIS`. Auflösung `AppStartLayout::forUser()`: Rolle mit den meisten
  Abschnitten gewinnt (wie `StartPageRoleDefault`), sonst Standard, sonst Code. Nur ein
  Standard-Eintrag (Modell-Guard, der DB-Unique lässt mehrere NULLs zu). Admin-Resource
  `AppStartLayouts` (Gruppe System, Recht `manage_start_page_defaults`, Repeater für die
  Reihenfolge, Mehrfachauswahl der Kennzahlen aus der Registry).
- **Endpunkt `GET /api/app/start`** (Session-Auth wie `/api/app/navigation`, `AppStartService`):
  Begrüßung nach Tageszeit (wie die Web-Startseite), Datum, Layout **rechtegefiltert** (Abschnitt
  ohne Recht fehlt; Karussell ohne erlaubte Kennzahl fehlt; `bonus` fehlt ohne
  `view_bonus_board` oder ohne eigenes Board — der Stand kommt aus
  `BonusBoardController::tile()`, dem Kachel-Endpunkt ohne Besuchs-Snapshot), Bonus-Regeln
  (max. 6: Name, Wert, Ziel, Fortschritt, erreicht), Schnellzugriff aus den Haupttabs plus Suche
  und glatttBert. Tests `AppStartTest`, `AppStartLayoutAdminTest`.
- **App:** `Start/StartModels.swift` (Rahmen), `StartViewModel` (lädt Rahmen und Mitteilungen
  über die Session, die Zahlen über `WidgetAPI` mit dem Widget-Token — derselbe 15-Min-Cache wie die
  Widgets; jeder Teil unabhängig, Standortwechsel/Vordergrund/5 Minuten lösen ein sanftes Neuladen
  aus), `CockpitView`/`CockpitSections` (SwiftUI, Swift Charts für das KPZ-Chart, Sparkline nach
  Hub-Konvention). Das Widget-Token wird vor dem ersten Laden sichergestellt
  (`ensureWidgetToken`).
- **Einhängen (seit 22.09., zweite Fassung):** Der Start-Tab ist **rein nativ** — sein Platzhalter
  hat kein WebView. Das Start-WebView (`store.primary`) lädt statt der Web-Startseite die **leere
  Hub-Hülle `/hub/app-shell`** (Route `hub.app-shell`, View `hub/app-shell.blade.php`: Hub-Layout ohne
  Kacheln, damit Sitzung, Bridge `ready`, Push und Standort-Sync weiter laufen) und hängt **hinter** dem
  Tab-Inhalt (`attachShell`); nur im Login-Zustand (IAP/Google, Hub-Login, nach dem Abmelden) kommt es
  nach vorn (`setShellVisible`). So kann beim Start nichts durchscheinen — die erste Fassung legte das
  Cockpit über die geladene Web-Startseite, und zwischen `didFinish` und `ready` blitzte sie ~1 s auf.
  `/hub` (Deep-Link, Tab-Tipp) wählt nur den Start-Tab, lädt nichts (`AppContainer.open`). iPad startet
  weiter mit `/hub` (Querformat ohne Tab-Leiste zeigt die Web-Startseite mit Sidebar). glatttBert vom
  Cockpit aus wechselt erst auf den Termine-Tab (sichtbare Hub-Seite) und öffnet dort (`bridge.onReady`
  holt die wartende Schnellaktion nach). Zweiter Tipp auf „Start" → `state.startScrollToTop`. Kein
  Cockpit im Kiosk-Modus.
- **Schrift:** Lato (Hausschrift) liegt als `Lato-Regular.ttf`/`Lato-Bold.ttf` unter
  `ios/glatttHub/Resources/Fonts` (`UIAppFonts` in `project.yml`, dieselben Dateien wie
  `public/fonts`); native Ansichten nutzen `HubFont` (Rollen wie `title`, `number`, `caption`,
  Dynamic-Type-relativ). Die im Admin wählbare Google-Font gilt nur im Web — die App bleibt bei Lato. Zweiter Tipp auf „Start" → `state.startScrollToTop`
  (nach oben). Kein Cockpit im Kiosk-Modus und im iPad-Querformat ohne Tab-Leiste (dort bleibt die
  Web-Startseite mit Sidebar).
- **Snapshots:** `CockpitSnapshotTests` (Schema „glatttHub", `TEST_RUNNER_WIDGET_SNAPSHOT_DIR`)
  rastert die Abschnitte mit Beispieldaten hell/dunkel; dafür `cockpitStaticLayout` im Environment
  (ImageRenderer rastert weder `ScrollView` noch Menü-Picker) und `Color("AccentColor")` statt
  `Color.accentColor` (greift im Renderer nicht).

### Verteilung

Apple Business Manager **Custom App** (App Store Connect → „Privat — nur für bestimmte Organisationen"
mit ABM-Org-ID → Review) → Miradore weist Lizenzen zu, installiert als Pflicht-App (`Removable=false`),
setzt die Managed App Configuration; BYOD über ABM-Einlösecodes. TestFlight für Pilot. Rückfall bei
Review-Problemen (Guideline 4.2 Wrapper): Unlisted App. Review-Notes: interne Business-App,
Login Google Workspace → PIN, Reviewer-Konto, Ausnahme Guideline 4.8 (Firmenkonto).
Voraussetzungen: Developer-Konto als Organisation mit akzeptiertem Paid-Apps-Agreement, ABM-Org-ID,
Apps-&-Bücher-Token in Miradore.

### Phasen & Stand (22.09.2026)

| Phase | Inhalt | Stand |
|---|---|---|
| 0 | Konten prüfen, App-Datensatz, Reviewer-Konto, Gerätebestand (LB-Regel `/.well-known/*` existiert bereits) | **offen (Jan):** Reviewer-Konto B11, App-Store-Connect-Datensatz, ABM-Org-ID, ältestes iOS in Miradore, Paid-Apps-Vertrag |
| 1 | Hülle & Login, Downloads, Kamera, Offline, Einstellungen; B1–B2 | ✅ abgenommen (Jan, 22.09.: CSV-Export und Kamera-Upload auf dem Gerät erfolgreich) |
| 1b | Push, Universal Links, Long-Press-Menü, MDM-Config, Kiosk, Face ID; B3–B6, B10 | ✅ Push auf dem iPhone abgenommen (Jan, 22.09.); Kiosk-Modus auf einem Miradore-iPad weiter offen (kein Gerät vor Ort) |
| A (20.09.) | Native Tab-Leiste (Liquid Glass), Mehr-Sheet nativ (Standort, Mitteilungen, Suche), WebView je Tab + Mehr-Pool, Pull-to-Refresh, Schnellaktionen, PIN-Sheet, Ladeschirm | ✅ abgenommen (Jan, 20./21.09.) |
| B (20.09.) | Gerätetoken B7, Face-ID-Anmeldung, App-Geräte im Profil B9 | ✅ gebaut; Face-ID-Flow auf dem Gerät von Jan bestätigt („technisch funktioniert es") |
| C (20.–22.09.) | Widgets B8: Kennzahlen, Tagesübersicht, Beratungsgespräche, Körperzonen | ✅ gebaut; Feinschliff nach 13 Geräte-Screenshots am 22.09. (Höhen füllen, Sparkline-Spalte, Kürzel, Tendenzpfeile, Prognose gestrichelt) — Abnahme der neuen Fassung auf dem Gerät offen |
| 1c | TestFlight-Pilot, Review, Custom-App-Einreichung, Miradore, Klickanleitungen | **offen** — Klickanleitungen Profil (App-Geräte) und Institut (Kiosk-Block) nachziehen |
| D (22.09.) | Versionsprüfung, Siri/App Intents, Dokumentenscanner, Diagnose teilen, iPad-Tastaturkürzel | ✅ gebaut (Abschnitt „Phase D"); Gerätetest offen: Siri-Sätze, Scanner-PDF im Hub, ⌘-Overlay am iPad |
| E (22.09.) | Native Startseite „Cockpit" je Rolle (Entwurf 1), Admin-Resource, `/api/app/start` | ✅ gebaut (Abschnitt „Native Startseite"); Abnahme auf dem Gerät offen |
| 3 | Härtung Weg B (App-Host ohne IAP, Google Sign-In nativ, App Attest) | offen |
| 4 | Native Prozesse nach Pilot-Entscheidung (Tageserfassung 4–6 Wochen, Laser-Wartung 2–3 Wochen) | offen |

Bauen & testen: Xcode-Projekt aus `ios/project.yml` (`cd ios && xcodegen generate` nach neuen Dateien),
Schema „glatttHub" (Debug = Staging + APNs-Sandbox), Unit-Tests `xcodebuild … test` (24 Swift-Tests + Cockpit-Snapshot),
Springboard-UI-Test im Schema „glatttHub UI", Widget-Snapshots im Schema „glatttHub Widgets" (s. o.). Hub-Tests: `AppDeviceTokenTest`, `AppWidgetKpiTest`, `AppVersionPolicyTest`, `AppScanButtonTest`, `AppStartTest`, `AppStartLayoutAdminTest`,
`MobileNavigationTest`, `SafeAreaConventionTest`.

### Fallstricke (vorab bekannt)

- **`ASWebAuthenticationSession` bringt keine Cookies in die App** — deshalb Login im WebView (Weg A) oder Gate im Laravel (Weg B).
- **Popup-WebView braucht dieselbe `WKWebViewConfiguration`**, sonst fehlen `window.opener` und die Cookies — der Google-Login bleibt hängen.
- **APNs Sandbox ≠ Production**: Xcode-Debug-Builds liefern Sandbox-Tokens; ohne `apns_environment` je Subscription meldet Prod `BadDeviceToken`.
- **AASA hinter IAP** ist für Apple unsichtbar → Universal Links funktionieren still nicht.
- **iPad-User-Agent** darf nicht die `Macintosh`-Variante sein, sonst liefert der Hub das Desktop-Layout.
- **Simulator empfängt keine APNs** — Push nur auf echten Geräten testen.
- **Kein `WKWebView` pro Seite**: ein Data-Store, sonst laufen Sitzungen auseinander.
- **`window.open(blob:)`** öffnet nichts — Blob-Downloads über `glatttNative.saveFile`.

### Relevante Dateien

Vorhanden: `app/Support/NativeApp.php`, `app/Http/Controllers/App/AppleAppSiteAssociationController.php`,
`public/js/push-notifications.js`, `app/Services/ApplePushNotificationService.php`,
`app/Services/PushNotificationService.php` (`subscribeNative`), `resources/views/layouts/hub.blade.php`
(Meta-Tags, Body-Klasse, Push-Init), `resources/views/layouts/partials/sidebar.blade.php` (Badge).
Geplant: `ios/glatttHub/` (App), `ios/glatttHubWidgets/` (Extension), `ios/Config/*.xcconfig`,
`ios/release.sh`, `app/Http/Controllers/Api/App/*` (Geräte-Token, Widget-API).

---

## Changelog

| Datum | Version | Änderung |
|---|---|---|
| 20.09.2026 | — | Bauplan beschlossen (WKWebView-Hülle, IAP-Login Weg A/B, Custom App via ABM/Miradore, Widgets) |
| 20.09.2026 | 0.1 (dev) | Native Tab-Leiste (Liquid Glass) statt Web-Bottom-Nav, `MobileNavigation` als gemeinsame Quelle, `GET /api/app/navigation`, natives Mehr-Sheet und Suche |
| 21.09.2026 | 0.1 (dev) | Widgets III: Tagesübersicht-Widget, Sparklines im Kennzahlen-Widget, Körperzonen mit Prognose-Balken und Tages-Chart im großen Widget, Extra-Large-Portrait (iOS 27) |
| 22.09.2026 | 0.1 (dev) | Native Startseite „Cockpit" (Entwurf 1 vom 22.09.): `app_start_layouts` je Rolle + Admin-Resource, `GET /api/app/start`, `CockpitView` über dem Start-WebView, Bonus-Stand nur mit eigenem Board |
| 22.09.2026 | 0.1 (dev) | Phase D: Versionsprüfung (`/api/app/version`, `RejectOutdatedNativeApp` 426, `UpdateRequiredView`), Siri/App Intents (Tagesüberblick gesprochen, Termine, Suche, glatttBert, Mitteilungen), Dokumentenscanner (`scanDocument`/`scanInto`, `<x-app-scan-button>` an fünf Upload-Stellen), Diagnose teilen (+ Kiosk-Fünffach-Tipp), iPad-Tastaturkürzel |
| 22.09.2026 | 0.1 (dev) | Widgets IV (Feinschliff nach Gerätetest): Höhen füllen statt fester Maße, Sparkline-Spalte rechts mit Prognose als gestrichelter Linie, Tendenzpfeile (Vergleichs-Schlüssel `value`/`trend` korrigiert), Institutskürzel `code` aus `AppBranchList`, keine Sparkline für `glattt`-Quelle, Snapshot-Target `glatttHubWidgetSnapshots` |
| 20.09.2026 | 0.1 (dev) | Widgets II: Beratungsgespräche- und Körperzonen-Widget (Swift Charts), Kennzahlen klein mit bis zu drei Werten und Trend-Pfeilen, Extra-Large; Ladeanimation, Launch-Logo, Inhalt im App-Switcher |
| 20.09.2026 | 0.1 (dev) | Phase C: Widget-Endpunkte (B8, KpiRegistry mit Token-Rechten, lineare Monatsprognose), Widget-Token getrennt vom Sitzungs-Token, WidgetKit-Erweiterung mit App-Intent-Konfiguration in vier Größen |
| 20.09.2026 | 0.1 (dev) | Phase B: Gerätetoken (B7, `app_devices` + Sanctum), Face-ID-Anmeldung als Sheet-Phase, App-Geräte im Profil (B9) |
| 20.09.2026 | 0.1 (dev) | Phase A: ein WebView je Haupttab (Instant-Wechsel), Tab-Leiste minimiert beim Scrollen, Pull-to-Refresh, Schnellaktionen; Standort/Theme zwischen Tabs synchron |
| 20.09.2026 | 0.1 (dev) | Safe-Area als CSS-Variablen aus der App (env() war 0), glatttBert über der Tab-Leiste |
| 20.09.2026 | 0.1 (dev) | Nativer PIN-Login als Sheet über der Login-Seite (bleibt mit Ladezustand bis `ready`); Ladeschirm statt schwarzem WebView beim Start; Abmelden ohne Rückfrage und nur aus dem Hub (Google/IAP bleibt, außer `sharedDevice`); Tab-Leiste nur angemeldet; Admin Panel in der System-Zeile |
| 20.09.2026 | 0.1 (dev) | Mehr-Sheet als Spiegel des Web-Sheets (Suche oben, Raster mit Überschriften, Werkzeuge, Profil/Abmelden); Such-Tab entfernt (sechs Tabs → System-„Mehr"); Standortwahl und Mitteilungen nativ (`branches` im Navigations-Payload, `glattt:set-branch`), Lupe im Scroll-Header öffnet das native Mehr — das Web-Sheet geht in der App nicht mehr auf |
| 20.09.2026 | 0.1 (dev) | Xcode-Projekt unter `ios/` (XcodeGen) mit Phase-1-Code; Google/IAP-Login rendert im WKWebView mit Safari-UA (Weg A bewiesen, Simulator); 14 Swift-Tests |
| 20.09.2026 | — | Backend-Vorarbeiten B1 (App-Erkennung), B2 (generische Bridge), B3 (`apns_environment`), B4 (Payload + `mark-read`), B5 (Badge), B6 (AASA-Route), B10 (Kiosk-Konfiguration im Institut-Modul) auf `develop`; LB-Regel `/.well-known/*` war schon vorhanden |
