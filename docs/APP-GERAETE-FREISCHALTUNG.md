# App-Geräte: Freischalt-Code, Gerätenachweis, App Attest (Gerätevertrauen, Schritt 1–3)

Bauschritte 1 und 2 des Plans [Gerätevertrauen](GERAETEVERTRAUEN-PLAN.md), umgesetzt am
23.09.2026 (Freigabe Jan). Die iOS-App muss einmal **freigeschaltet** werden, bevor sie
mit dem Hub sprechen darf. Schritt 1 ist die Freischaltung (Code, Einlösen, Geheimnis,
Widerruf); Schritt 2 **erzwingt** den Nachweis bei jeder Anmeldung und bremst PIN-Versuche
je Gerät.

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
  `last_user_id`/`last_login_at` (wer sich dort zuletzt angemeldet hat, seit
  `2026_09_23_233000_add_last_user_to_enrolled_devices.php`), `revoked_at`/`revoked_by`,
  `attest_key_id` (Platz für Schritt 3).

**Wem gehört das Gerät?** Die Liste im Hub muss eindeutig sagen, welches Gerät man widerruft
(Jan, 23.09.2026). `EnrolledDevice::ownerLabel()` nimmt dafür die Bezeichnung des
Freischalt-Codes („iPhone Nadin"), sonst die zuletzt angemeldete Person, sonst die
Mail-Adresse des Codes. Die zuletzt angemeldete Person schreibt
`DeviceEnrollmentService::recordLogin()` bei jeder PIN-Anmeldung (`PinLoginController`) und
jeder Face-ID-Sitzung (`AppSessionController`), sofern die Anfrage einen gültigen
Gerätenachweis trägt — auf einem geteilten iPad wechselt sie also mit jeder Kollegin. Die
Spalte „Gehört zu" bleibt auch mobil sichtbar, „Zuletzt angemeldet" nur auf dem Desktop.

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
| `EnrollmentGateView` | `ios/glatttHub/Screens/EnrollmentGateView.swift` — **Vollbild vor der PIN** (Variante A, Entscheidung Jan 23.09.2026): solange das Gerät nicht freigeschaltet ist, gibt es keinen PIN-Block, sondern „QR-Code scannen" (Hauptweg) und „Code eingeben"; Institut-iPads mit MDM-Schlüssel zeigen nur „wird freigeschaltet". Nach dem Einlösen kurz der Erfolg (`AppState.enrollmentCelebrating`), dann die PIN-Seite. Lehnt der Hub ein Gerät ab (403 `device_not_trusted`, `assertion_required`), verwirft der Container die lokale Freischaltung und das Vollbild erscheint von selbst |
| `EnrollmentSheet` | `ios/glatttHub/Screens/EnrollmentSheet.swift` — Code-Feld mit Live-Formatierung, QR-Scanner (`CodeScanner`, VisionKit `DataScannerViewController`, nur QR), Auto-Einlösen bei Code aus dem Link; erreichbar über „Code eingeben" im Vollbild, die Einstellungen und `AppState.enrollmentRequest` (Universal Link) |
| Universal Link | `AppContainer.open(_:)` erkennt `/shared/app/freischalten/<CODE>` vor allem anderen — auch gesperrt oder abgemeldet |
| MDM | `ManagedConfig.enrollmentKey`; `autoEnrollFromManagedConfig()` löst ihn beim Start und beim Aktivieren still ein, solange das Gerät nicht freigeschaltet ist |
| Diagnose / Bridge | Zeile „Freischaltung" im Diagnosebericht; `deviceEnrolled` in `glatttNative.info()` |

### Fallstricke

- **Keychain überlebt die Neuinstallation.** `Keychain.set` nutzt
  `AfterFirstUnlockThisDeviceOnly`; iOS behält solche Einträge beim Löschen der App. Das
  Geheimnis und die Geräte-ID kommen nach einer Neuinstallation also wieder — anders als
  der Plan annahm. Der App-Attest-Schlüssel (Schritt 3) dagegen nicht: Nach einer
  Neuinstallation scheitert die Assertion, der Hub antwortet `assertion_required`, und das
  Gerät wird neu freigeschaltet — genau die Bindung an die Installation, die der Plan wollte.
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

### Schritt 2: Der Nachweis wird erzwungen

**Wo geprüft wird:** genau dort, wo eine Sitzung entsteht — `POST /login/pin`,
`POST /login/credentials`, `POST /login` (Fortify) und `POST /api/app/session` (Face-ID-Token
→ Sitzung). Alles danach schützt die Sitzung, die ohne Nachweis nicht entstanden wäre; der
Freischalt-Endpunkt `POST /api/app/enroll` bleibt frei, er ist der Einstieg. Die Login-Seite
selbst (GET) bleibt erreichbar, sie verrät nichts.

**Was als Nachweis gilt** (`App\Services\Auth\DeviceTrust`, Ergebnis je Anfrage als
Request-Attribut `device_trust`):

| Quelle | Nachweis | Wer |
|---|---|---|
| `iap` | JWT `x-goog-iap-jwt-assertion`, **verifiziert** gegen Googles Schlüssel (`IapJwtVerifier`, ES256, JWKS 24 h gecacht): Aussteller `https://cloud.google.com/iap`, Ablauf, Audience `/projects/<nr>/global/backendServices/<id>` | Browser, PWA und Mac-App — für das Büro ändert sich nichts. **Nicht** für die iOS-App: Anfragen mit dem App-User-Agent (`glatttHub-iOS/`) zählen nur mit Gerät, auch auf `hub.glattt.com` — sonst arbeitete eine Installation ohne Freischaltung dauerhaft über IAP (Befund Jan, 23.09.2026) |
| `device` | freigeschaltetes, nicht widerrufenes Gerät (Header `X-Hub-Device` oder Cookie `glattthub_device`) | iOS-App, später auf dem App-Host ohne IAP (Schritt 4) |
| `none` | — | Anmeldung wird abgewiesen: JSON 403 mit `reason = device_not_trusted`, Formular-Post zurück auf `/login` mit Fehler |

**Folge für den Pilot:** Sobald Prod auf `enforce` steht, muss jedes iPhone und iPad mit der
App einmal freigeschaltet sein — die App zeigt beim ersten abgewiesenen Login den
Einlöse-Dialog. Die Codes dafür stellt das Büro vorher aus.

**Modus** (`config/device_trust.php`, `DEVICE_TRUST_MODE`): `off` = nichts prüfen (lokal),
`log` = Verstöße nur ins Log (Einführung, `Anmeldung ohne Gerätenachweis`), `enforce` =
abweisen. Die Deploys setzen ihn: **Staging `enforce`** mit `IAP_BACKEND_SERVICE_IDS=7999871483778540957`,
**Prod zunächst `log`** mit `3757467410591229426` (`cloudbuild*.yaml`). Ohne konfigurierte
Backend-IDs gilt jede Audience des Projekts. Erst wenn das Prod-Log über einige Tage keine
echten Büro-Anmeldungen als „ohne Nachweis" meldet, wird Prod auf `enforce` gestellt.

**Wichtig:** Ein bloßer Header-Check wäre wertlos — sobald jemand am Load Balancer vorbeikäme
(Befund 23.09.2026, `run.app`), könnte er den Header selbst setzen. Deshalb Signaturprüfung;
ist Googles Schlüsselsatz nicht abrufbar, gilt **kein** JWT (nicht „jedes").

**PIN-Bremse je Gerät** (`FortifyServiceProvider`, Limiter `pin-login`): Schlüssel je
freigeschaltetem Gerät, sonst je Google-Konto (IAP-`sub`), sonst je IP — 5/min und 30/h.
Dazu die Sperre aus dem Plan: nach `DEVICE_TRUST_PIN_FAILURES` (Standard 20) falschen PINs
innerhalb einer Stunde verliert das Gerät seine Freischaltung
(`DeviceEnrollmentService::registerPinFailure()`, Anlass `app_devices.locked`, nicht
stummschaltbar); eine richtige PIN setzt den Zähler zurück. Wer das Gerät in der Hand hat,
kann sich damit nicht in ein fremdes Konto raten.

**Middleware-Reihenfolge, Falle:** Laravel zieht `throttle` per Priorität vor die
Gruppen-Middleware. Der Rate-Limiter fragt `DeviceTrust` also **vor** `AttachEnrolledDevice`;
deshalb schlägt `DeviceTrust::evaluate()` das Gerät selbst nach (Header/Cookie) und cacht das
Ergebnis in der Anfrage — sonst stünde fälschlich „kein Nachweis" fest und jeder Geräte-Login
bekäme 403.

**App-Seite:** `HubSession` erkennt den 403 mit `device_not_trusted` als
`PinLoginError.deviceNotTrusted`; `AppContainer` verwirft dann die lokale Freischaltung (das
Gerät wurde im Hub widerrufen oder gesperrt) und die Login-Seite öffnet direkt den
Einlöse-Dialog. Gilt für PIN, E-Mail und Face ID.

### Schritt 3: App Attest — das Gerät beweist, dass es echt ist

Ohne App Attest hängt der Geräte-Nachweis an einem Geheimnis, das kopierbar ist (Keychain
→ Backup, Jailbreak). Mit App Attest erzeugt die App einen Schlüssel in der **Secure
Enclave**, den Apple einmal beglaubigt; danach signiert sie bei jeder Anmeldung eine
Challenge des Hubs. Der Schlüssel verlässt das Gerät nie.

**Ablauf**

1. `POST /api/app/enroll` liefert neben dem Geheimnis eine `attest_challenge` (Cache
   `attest-challenge:<device>`, 5 min).
2. Die App (`AppAttest.attest(challenge:)`, `DCAppAttestService`) erzeugt den Schlüssel,
   lässt ihn attestieren und schickt `POST /api/app/attest {key_id, attestation}` mit dem
   Gerätenachweis. Der Hub prüft (`AppAttestVerifier::verifyAttestation()`, nach Apples
   „Validating apps that connect to your server"): Kette bis zu **Apples App-Attest-Wurzel**
   (`resources/certs/apple-app-attestation-root-ca.pem`, gültig bis 2045), Nonce
   `SHA-256(authData ‖ SHA-256(challenge))` in der Blatt-Erweiterung `1.2.840.113635.100.8.2`,
   Schlüssel-ID = SHA-256 des öffentlichen Schlüssels, App-ID-Hash (`<Team>.<Bundle>` aus
   `config/push.php`), Zähler 0, AAGUID `appattest` (Produktion) bzw. `appattestdevelop` (nur
   mit `APP_ATTEST_ALLOW_DEVELOPMENT`), Credential-ID = Schlüssel-ID. Gespeichert werden
   `attest_key_id`, `attest_public_key` (PEM), `attest_counter`, `attest_environment`,
   `attested_at`. Die Hub-Seite zeigt „attestiert".
3. **Jede Anmeldung** eines attestierten Geräts: `GET /api/app/challenge` (Cache
   `assert-challenge:<device>:<hash>`, einmalig, 5 min) → Assertion in der Enclave →
   Header `X-Hub-Assertion` + `X-Hub-Challenge` an `POST /login/pin` (bzw. E-Mail,
   Face-ID-Sitzung). `DeviceTrust::assertionProblem()` prüft Signatur, App-ID und dass der
   Zähler steigt (`verifyAssertion()`); die Challenge wird verbraucht. Fehlt oder scheitert
   die Assertion: 403 `assertion_required`. Mit `DEVICE_TRUST_REQUIRE_ATTESTATION=true`
   zählen nur noch attestierte Geräte (403 `attestation_required`) — vorgesehen für den
   App-Host ohne IAP (Schritt 4); bis dahin bleiben unattestierte Geräte (Simulator, ältere
   App) gültig.

**App-Seite:** `ios/glatttHub/Auth/AppAttest.swift` (Schlüssel-ID in der Keychain
`attest-key-id`), `HubSession.attachAssertion(to:)` hängt Challenge und Assertion an
`postCredentials` und `api/app/session`; scheitert die Assertion mit `invalidKey`
(Schlüssel nach Neuinstallation weg), vergisst die App die ID, der Hub antwortet
`assertion_required`, die App verwirft die Freischaltung und bietet den Einlöse-Dialog an
(neuer Code → neuer Schlüssel). Im Simulator ist App Attest nicht verfügbar; das Gerät
bleibt dann unattestiert freigeschaltet.

**CBOR:** eigener Mini-Decoder `App\Support\Cbor` (Ganzzahlen, Byte-/Textstrings,
Arrays, Maps; Floats/Tags/unbestimmte Längen werden abgewiesen) — kein Paket nötig.

**Tests:** `tests/Support/AppAttestFixture.php` baut per openssl-CLI eine eigene
Wurzel/Zwischen-CA/Blatt-Kette mit Apples Nonce-Erweiterung und kodiert Attestierung und
Assertion als CBOR; der Verifier bekommt die Test-Wurzel über
`device_trust.app_attest.root_ca`. `tests/Unit/AppAttestVerifierTest.php` (gültig, falsche
Challenge, fremde App, Zähler, Entwicklungs-AAGUID, fremde Wurzel, falsche Schlüssel-ID,
Format, Assertion-Signatur/App-ID/Zähler, CBOR) und `DeviceTrustEnforcementTest`
(Attest-Endpunkte, Assertion-Pflicht, Wiederholung, alter Zähler, `require_attestation`).

### Tests

`tests/Feature/DeviceTrustEnforcementTest.php` (ohne Nachweis 403 bzw. Redirect, IAP-JWT
und Gerät als Nachweis, Widerruf, Face-ID/E-Mail/Fortify geschützt, Freischalten frei,
Modi, Sperre nach Fehlversuchen, Zähler-Reset, Bremse je Gerät),
`tests/Unit/IapJwtVerifierTest.php` (gültig, fremder Aussteller, falsche Audience,
abgelaufen, unbekannter Schlüssel, manipulierte Signatur, kein Schlüsselsatz),
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
- **23.09.2026, später** — Schritt 2: Nachweis bei jeder Anmeldung (IAP-JWT verifiziert oder
  Gerät), Modus off/log/enforce, PIN-Bremse je Gerät und Sperre nach Fehlversuchen; Staging
  `enforce`, Prod `log`. App erkennt 403 `device_not_trusted` und bietet die Freischaltung an.
- **23.09.2026, nachts** — Schritt 3: App Attest. Attestierung direkt nach dem Einlösen,
  Assertion bei jeder Anmeldung eines attestierten Geräts, Zähler gegen Wiederholung;
  `require_attestation` für den späteren App-Host. Apples Wurzelzertifikat im Repo.
- **23.09.2026, spät** — Nach dem ersten Gerätetest: IAP zählt für die App nicht mehr als
  Nachweis; Vollbild „Gerät freischalten" vor der PIN (Variante A von drei Entwürfen, Jan);
  Seitenskript über `@assets` (Konsolenfehler nach Livewire-Navigation).
