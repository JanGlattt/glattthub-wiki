# App-Geräte: Freischalt-Code (Gerätevertrauen, Schritt 1)

Erster Bauschritt des Plans [Gerätevertrauen](GERAETEVERTRAUEN-PLAN.md), umgesetzt am
23.09.2026 (Freigabe Jan). Die iOS-App muss einmal **freigeschaltet** werden, bevor sie
mit dem Hub sprechen darf. In Schritt 1 entsteht die Freischaltung (Code, Einlösen,
Geheimnis, Widerruf) und der Hub **protokolliert** den Nachweis; **erzwungen** wird er
erst in Schritt 2.

## Für Endanwender

Das Büro stellt im Hub unter **Team → App-Geräte** einen **Freischalt-Code** aus: zwölf
Zeichen in drei Blöcken (`XXXX-XXXX-XXXX`), nur Ziffern und Großbuchstaben, ohne 0/O und
1/I/L. Der Code kommt als QR-Code auf den Bildschirm, per Mail-Link oder zum Abtippen. In
der App wählt die Kollegin auf der Anmeldeseite **„Gerät freischalten"**, scannt oder tippt
den Code, und meldet sich danach wie gewohnt mit ihrer PIN an. Ein Code gilt einmal und
24 Stunden (wahlweise 1 Stunde). Verlorenes Gerät oder Austritt: **Widerrufen** auf
derselben Seite, das Gerät braucht danach einen neuen Code. Institut-iPads bekommen ihren
Schlüssel über Miradore und schalten sich beim ersten Start selbst frei.

!!! nutzerhandbuch "Bedienung: App-Geräte — Klickanleitung geplant"
    Die Klickanleitung entsteht mit dem Abschluss des App-Teils (Eintrag `hub.app-devices`
    in `.github/klickanleitungen-abdeckung.json`, Status „geplant").

## Für Entwickler

### Drei Arten von Codes

| Art | `kind` | Einlösbar | Gültig | Gerät wird | Verteilung |
|---|---|---|---|---|---|
| Persönliches Gerät | `personal` | einmal | 1 h oder 24 h | `personal` (Face ID möglich) | QR, Mail-Link, Abtippen |
| Institut-Gerät (geteilt) | `shared` | einmal | 1 h oder 24 h | `shared`, an ein Institut gebunden | QR, Mail-Link, Abtippen |
| MDM-Schlüssel | `mdm` | beliebig oft | ohne Ablauf | `shared`, an ein Institut gebunden | Managed App Configuration `enrollmentKey` |

### Datenmodell

Migration `2026_09_23_180000_create_device_enrollment_tables.php`:

- **`device_enrollment_tokens`** — `code_hash` (SHA-256 des Rohcodes, unique),
  `code_preview` (erster Viererblock für Listen), `kind`, `label`, `branch_id`, `email`,
  `email_sent_at`, `issued_by`, `max_uses` (1, bei `mdm` null), `uses_count`,
  `expires_at` (bei `mdm` null), `last_redeemed_at`, `revoked_at`/`revoked_by`.
- **`enrolled_devices`** — `native_device_id` (unique; `DeviceIdentity` der App),
  `secret_hash` (SHA-256 des Gerätegeheimnisses, unique), `kind` (`personal`/`shared`),
  `device_name`, `platform`, `app_version`, `os_version`, `branch_id`,
  `enrollment_token_id`, `enrolled_by`, `enrolled_at`, `last_seen_at`, `last_seen_ip`,
  `revoked_at`/`revoked_by`, `attest_key_id` (Platz für Schritt 3).

**Code und Geheimnis stehen nie im Klartext in der Datenbank.** Der Code (31 Zeichen
hoch 12, rund 59 Bit) wird genau einmal gezeigt bzw. verschickt; das Geheimnis
(`Str::random(48)`) geht einmal an die App. Ein Gerät ist eine Zeile: erneutes Einlösen
erneuert das Geheimnis, hebt einen Widerruf auf und übernimmt Art und Institut des Codes.

### Services und Endpunkte

| Baustein | Datei | Aufgabe |
|---|---|---|
| `EnrollmentCode` | `app/Services/App/EnrollmentCode.php` | Alphabet `23456789ABCDEFGHJKMNPQRSTUVWXYZ`, `generate()`, `normalize()` (Großschreibung, Fremdzeichen weg, genau 12), `format()`, `preview()`, `hash()` |
| `DeviceEnrollmentService` | `app/Services/App/DeviceEnrollmentService.php` | `issue()`, `redeem()` (Transaktion mit `lockForUpdate`), `deviceForSecret()`, `touch()` (höchstens alle 5 Min), `revokeToken()`, `revokeDevice()`, `link()`, `qrSvg()` (BaconQrCode), Mail `DeviceEnrollmentMail` |
| `AttachEnrolledDevice` | `app/Http/Middleware/AttachEnrolledDevice.php` | global in `web` und `api`: liest Header `X-Hub-Device` oder Cookie `glattthub_device`, hängt das Gerät als Request-Attribut `enrolled_device` an, zieht „zuletzt gesehen" nach. **Erzwingt nichts** (Schritt 2). |
| Hub-Seite | `GET /hub/app-devices` (+ `/data`, `POST /tokens`, `DELETE /tokens/{id}`, `DELETE /devices/{id}`), Recht `create_users` | `Hub\AppDeviceEnrollmentController`, View `hub/app-devices/index.blade.php`, JS `public/js/app-device-enrollment.js` |
| Einlösen | `POST /api/app/enroll` (öffentlich, `throttle:app-enroll`: 10/min und 30/h je IP, 5/min je Geräte-ID) | `App\AppEnrollmentController` — Antwort 201 mit `secret`, `kind`, `branch_id`; 422 mit `reason` (`invalid`, `expired`, `used`, `revoked`) |
| Hinweisseite | `GET /shared/app/freischalten/{code}` (öffentlich, ohne IAP, `throttle:shared-page`) | `SharedAppEnrollmentController`, View `shared/app-enrollment.blade.php` — zeigt den Code zum Abtippen, prüft ihn nicht |
| Universal Link | `AppleAppSiteAssociationController::COMPONENTS` | `/shared/app/*` steht **vor** dem Ausschluss von `/shared/*`; QR und Mail tragen denselben Link, mit App öffnet er die Einlösung, ohne App die Hinweisseite |
| Benachrichtigungen | `HubEventRegistry` `app_devices.enrolled` / `app_devices.revoked` (Modul Personal, Ziel `create_users`) | Dispatcher `deviceEnrolled()`, `deviceRevoked()` |

Navigation: Gruppe **Team** (`NavigationGroups`, Sidebar, `MobileNavigation::MORE` mit
SF-Symbol `iphone`), Suche (`GlobalSearchService::PAGES`), Klickanleitungen-Abdeckung
(`hub.app-devices`, geplant).

### Warum die Hinweisseite unter `/shared/` liegt

`hub.glattt.com` liegt hinter IAP. Ein Mail-Link auf `/app/…` würde ohne App bei der
Google-Anmeldung landen — für die 19 von 21 Konten ohne Google-Konto eine Sackgasse.
`/shared/*` ist am Load Balancer von IAP ausgenommen und öffentlich; die Seite verrät
nichts außer dem Code, den die Mail ohnehin enthält, und löst nichts ein.

### iOS-App

| Baustein | Datei |
|---|---|
| `DeviceEnrollment` | `ios/glatttHub/Auth/DeviceEnrollment.swift` — Geheimnis in der Keychain (`device-secret`, „nach erstem Entsperren, nur dieses Gerät", **nicht** hinter Face ID, weil es auf geteilten iPads für alle gilt), Anzeige-Meta in UserDefaults, Cookie-Bau, `code(from:)` für den Link; `EnrollmentCode` als Spiegel der PHP-Klasse |
| `HubSession.enroll(code:)` | `POST /api/app/enroll`; **jede** native Anfrage trägt `X-Hub-Device` (in `attachCookies`) |
| Cookie fürs WebView | `installCookie(baseURL:)` beim Start, nach dem Einlösen, nach dem Abmelden (auf geteilten Geräten löscht `clearEverything()` alle Cookies — der Nachweis gehört zum Gerät, nicht zur Person, und kommt danach wieder rein) |
| `EnrollmentSheet` | `ios/glatttHub/Screens/EnrollmentSheet.swift` — Code-Feld mit Live-Formatierung, QR-Scanner (`CodeScanner`, VisionKit `DataScannerViewController`, nur QR), Auto-Einlösen bei Code aus dem Link; erreichbar über „Gerät freischalten" auf der Login-Seite, die Einstellungen und `AppState.enrollmentRequest` |
| Universal Link | `AppContainer.open(_:)` erkennt `/shared/app/freischalten/<CODE>` vor allem anderen — auch gesperrt oder abgemeldet |
| MDM | `ManagedConfig.enrollmentKey`; `autoEnrollFromManagedConfig()` löst ihn beim Start und beim Aktivieren still ein, solange das Gerät nicht freigeschaltet ist |
| Diagnose / Bridge | Zeile „Freischaltung" im Diagnosebericht; `deviceEnrolled` in `glatttNative.info()` |

### Fallstricke

- **Keychain überlebt die Neuinstallation.** `Keychain.set` nutzt
  `AfterFirstUnlockThisDeviceOnly`; iOS behält solche Einträge beim Löschen der App. Das
  Geheimnis und die Geräte-ID kommen nach einer Neuinstallation also wieder — anders als
  der Plan annahm. Erst App Attest (Schritt 3) bindet an die Installation.
- **`Proxy-Authorization` verweigert Chromium**, IAP prüft aber auch `Authorization` — das
  betrifft nur den Klickanleitungen-Lauf, nicht die App.
- **Widerruf im Hub erreicht die App nicht sofort.** Bis Schritt 2 merkt die App nichts;
  danach antwortet der App-Host ohne gültigen Nachweis mit 401/403, und die App muss neu
  freischalten (Ablauf in Schritt 2).
- **Der MDM-Schlüssel ist ein normaler Code** (`kind = mdm`, `max_uses = null`,
  `expires_at = null`). In Miradore als String `enrollmentKey` in die Managed App
  Configuration; ein Widerruf im Hub macht alle damit freigeschalteten iPads beim nächsten
  Nachweis ungültig (Schritt 2) — die iPads holen sich beim nächsten Start keinen neuen
  Schlüssel, solange ihr Geheimnis lokal liegt. Erst „Freischaltung entfernen" in den
  Einstellungen oder ein neuer Schlüssel im MDM.

### Tests

`tests/Feature/DeviceEnrollmentTest.php` (Ausstellen, Mail, Institut-Pflicht, Einlösen,
Einmaligkeit, Ablauf/Widerruf, MDM-Mehrfachnutzung, Geheimnis-Erneuerung, Nachweis-
Middleware, Bremse, Hinweisseite, Universal-Link-Pfad), `tests/Unit/EnrollmentCodeTest.php`
(Alphabet, Format, Normalisierung), iOS `DeviceEnrollmentTests` (Spiegel-Logik, Link,
Cookie), `ManagedConfigTests::enrollmentKey`.

## Chronik

- **23.09.2026** — Schritt 1 umgesetzt: Tabellen, Service, Hub-Seite „App-Geräte", Mail,
  Hinweisseite, Universal Link, Middleware (nur Protokoll), App-Seite mit Einlöse-Dialog,
  QR-Scanner, Cookie/Header, MDM-Schlüssel. Code-Format `XXXX-XXXX-XXXX` ohne 0/O/1/I/L
  (Jan). Klickanleitung geplant.
