# iOS/iPadOS-App (Swift)

Native iPhone-/iPad-App für glatttHub — eine Swift/SwiftUI-Hülle um den Hub (`WKWebView`) mit nativem
Login, APNs-Push, Face ID, Kamera, Universal Links, Kontextmenü, MDM-Steuerung und Home-Screen-Widgets.
**Stand 20.09.2026: Bauplan beschlossen; Backend-Vorarbeiten B1–B6 und B10 sind auf `develop`
umgesetzt, das Xcode-Projekt noch nicht begonnen.** Der vollständige Bauplan mit
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

### Bridge `window.glatttNative`

Spiegelt `window.electronPush`; `push-notifications.js` bekommt eine generische Abstraktion
(`getNativeBridge()` = `window.glatttNative ?? window.electronPush`).

| Hub → App | App → Hub (CustomEvent) |
|---|---|
| `registerForApnsNotifications()` → `{ token, environment: 'production'\|'sandbox', nativeDeviceId }` (löst die iOS-Systemabfrage aus) | `glattt:push-received` (Vordergrund-Push) |
| `unregisterForApnsNotifications()`, `getPushStatus()` → `'granted'\|'denied'\|'default'` (Web-Vokabular, weil das WKWebView kein `window.Notification` hat) | `glattt:push-opened` (`url`, `log_id`) |
| `setBadge(n)`, `saveFile({name,mime,base64})`, `openExternal(url)`, `haptic(kind)` | `glattt:foreground` |
| `getInfo()` → `{ platform: 'ios', appName: 'glatttHub iOS App', appVersion, deviceName, nativeDeviceId, sharedDevice, kioskMode }`, `reportContext(ctx)` | `glattt:biometric-unlocked` |

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
| B7 | Geräte-Token | `POST /api/app/devices` (Session-Auth) → Sanctum-Token (`app:widgets`, `app:push`), Tabelle `app_devices`, Widerruf bei Abmelden/Archivieren |
| B8 | Widget-Endpunkt | `GET /api/app/widgets/kpis` + `/catalog` via `KpiValueService` (Rechte, `BranchVisibility`, 5-Min-Cache) |
| B9 | Geräte im Profil | iOS-Geräte in den Push-Einstellungen, „Gerät entfernen" |
| B10 ✅ | Kiosk-Anker | Tab „Extern" des Institut-Moduls zeigt unter dem Zugangs-Link den Block „iPad-App (Kiosk-Modus)" mit der Managed App Configuration zum Kopieren (`InstituteAccessTokenController::appConfig()`, `deviceName` = „iPad <Institut>"). Test `InstituteAccessTokenAppConfigTest`. **Klickanleitung Betrieb 2 (Institut-Modul) muss nachgezogen werden** (neuer Block, Screenshot) |
| B11 | Reviewer-Konto | `appreview@labrado-schlueter.com` mit PIN, Rolle Institute MA, Testinstitut Magdeburg |

Konventionen gelten unverändert: Migrationen statt SQL, `BranchVisibility`, Rechte nur über Gates, keine
Rollennamen im Code, Tests je Paket.

### Widgets (WidgetKit)

Widgets laufen in einer Extension ohne WebView-Cookies und ohne IAP-Login. Sie rufen
`/api/app/widgets/kpis` (IAP-frei) mit dem Sanctum-Gerätetoken aus einer geteilten Keychain-Gruppe
(`group.com.glattt.hub`) auf. Drei Widgets: **Kennzahl** (klein, Sperrbildschirm), **Kennzahlen-Zeile**
(mittel, vier Werte wie ein `stat-strip`), **Tagesblick** (groß, pro Standort eine Zeile). Auswahl über
`AppIntent`/`AppEntity` aus dem Rechte-gefilterten Katalog; Tippen öffnet die Berichtsseite per Universal
Link; Aktualisierung alle 15 Min tagsüber; keine Widgets auf geteilten Geräten; `privacySensitive()` auf
dem Sperrbildschirm.

### Verteilung

Apple Business Manager **Custom App** (App Store Connect → „Privat — nur für bestimmte Organisationen"
mit ABM-Org-ID → Review) → Miradore weist Lizenzen zu, installiert als Pflicht-App (`Removable=false`),
setzt die Managed App Configuration; BYOD über ABM-Einlösecodes. TestFlight für Pilot. Rückfall bei
Review-Problemen (Guideline 4.2 Wrapper): Unlisted App. Review-Notes: interne Business-App,
Login Google Workspace → PIN, Reviewer-Konto, Ausnahme Guideline 4.8 (Firmenkonto).
Voraussetzungen: Developer-Konto als Organisation mit akzeptiertem Paid-Apps-Agreement, ABM-Org-ID,
Apps-&-Bücher-Token in Miradore.

### Phasen

| Phase | Inhalt | Aufwand |
|---|---|---|
| 0 | Konten prüfen, App-Datensatz, Reviewer-Konto, Gerätebestand (LB-Regel `/.well-known/*` existiert bereits) | 2–3 Tage |
| 1 | Hülle & Login, Downloads, Kamera, Offline, Einstellungen; B1–B2 | 2 Wochen |
| 1b | Push, Universal Links, Long-Press-Menü, MDM-Config, Kiosk, Face ID; B3–B6, B10 | 1,5 Wochen |
| 1c | TestFlight-Pilot, Review, Custom-App-Einreichung, Miradore, Klickanleitung | 1,5 Wochen |
| 2 | Geräte-Token & Widgets; B7–B9 | 2 Wochen |
| 3 | Härtung Weg B (App-Host ohne IAP, Google Sign-In nativ, App Attest) | 1,5 Wochen |
| 4 | Native Prozesse nach Pilot-Entscheidung (Tageserfassung 4–6 Wochen, Laser-Wartung 2–3 Wochen) | je Prozess |

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
| 20.09.2026 | — | Backend-Vorarbeiten B1 (App-Erkennung), B2 (generische Bridge), B3 (`apns_environment`), B4 (Payload + `mark-read`), B5 (Badge), B6 (AASA-Route), B10 (Kiosk-Konfiguration im Institut-Modul) auf `develop`; LB-Regel `/.well-known/*` war schon vorhanden |
