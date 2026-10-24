# Profilseite

Die Profilseite (`/hub/profile` → `hub.profile`, alternativ `/user/profile` → `profile.show` aus
Jetstream) lässt jede Nutzerin pflegen, was nur sie selbst betrifft: Profilbild, PIN, Passkey und
Passwort (nur mit Admin-Schranke), Browser-Sitzungen und App-Geräte, Darstellung, Dank-Text fürs
Trinkgeld. Seit 25.10.2026 ist sie nach Entwurf 1 „Kopfkarte und Abschnitte“ gebaut (Jan wählte
ihn aus drei Entwürfen) und läuft **in der App nativ** (`ProfileView`). Diese Seite beschreibt
**Aufbau, Endpunkte, Fachregeln und Fallstricke**; die Bedienung steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Grundlagen 3 – Mein Profil im glatttHub"
    [hilfe.hub.glattt.com/grundlagen/3/](https://hilfe.hub.glattt.com/grundlagen/3/) — Kopfkarte, PIN ändern in Schritten, Sitzungen und Geräte, Darstellung, Dank-Text.

    In der App: [App 29 – Profil in der App](https://hilfe.hub.glattt.com/app/29/). Angrenzend: [Grundlagen 1 – Anmelden & zurechtfinden](https://hilfe.hub.glattt.com/grundlagen/1/).

## Für Anwender — Überblick

**Was die Seite leistet.** Oben eine **Kopfkarte** mit Foto (Klick aufs Bild = Foto ändern), Name,
Position und Institut, darunter der Zugangsstatus als Badges (PIN aktiv, Face ID auf N Geräten,
Passkey, Anzahl Sitzungen) und die beiden Hauptknöpfe **PIN ändern** und **Foto ändern**. Darunter
vier Abschnitte:

- **Zugang** — PIN (Änderung als Dialog in drei Schritten: aktuelle PIN, neue PIN, Wiederholung,
  mit Ziffernblock und Tastatur), Passkey für die Admin-Schranke und Passwort. **Passwort und
  Passkey erscheinen nur bei Konten mit dem Recht `access_admin`** — alle anderen melden sich nur
  per PIN und Face ID an und sehen stattdessen den Stand von Face ID.
- **Sicherheit** — Browser-Sitzungen (Gerät, Browser, IP, zuletzt aktiv, „Dieses Gerät“) und
  App-Geräte mit Face ID/Widgets (einzeln entfernbar). **Andere Sitzungen beenden** verlangt kein
  Passwort mehr, sondern die Bestätigung sensibler Aktionen (Passkey oder PIN).
- **Darstellung** — Farbschema (Hell/Dunkel/System, je Gerät) und der Rundgang.
- **Persönliches** — E-Mail-Adresse und Profilbild (Jetstream-Formular im Dialog), Dank-Text fürs
  Trinkgeld (aufklappbarer Editor mit Vorschau wie in My glattt).

**Erstzugang:** Wer mit einer vom Büro gesendeten PIN kommt (`must_change_pin`), bekommt den
PIN-Dialog sofort geöffnet und kann ihn erst schließen, wenn die eigene PIN gespeichert ist.

| Vorgang | Anleitung |
|---|---|
| PIN festlegen oder ändern (Schritt für Schritt) | Grundlagen 3, App 29 |
| Profilbild setzen oder entfernen | Grundlagen 3, App 29 |
| Sitzungen prüfen, andere Sitzungen beenden, App-Geräte entfernen | Grundlagen 3, App 29 |
| Passwort für die Admin-Schranke ändern, Passkey-Stand | Grundlagen 3, Admin 9 |
| Farbschema, Rundgang, Dank-Text | Grundlagen 3 |
| Mit PIN oder Passkey anmelden | Grundlagen 1, App 1 |

## Für Entwickler

### Architektur (seit 25.10.2026)

Eine Quelle für Web und App: `ProfileController::payload()` liefert den kompletten Stand als JSON,
die Web-Seite rendert ihn serverseitig in die Alpine-Komponente `profilePage()`
(`public/js/profile/profile.js`), die App lädt dieselbe Antwort über `GET /hub/profile/data`.

| Endpunkt | Zweck |
|---|---|
| `GET /hub/profile` (`hub.profile`), `GET /user/profile` (`profile.show`) | Seite, beide rendern `hub.profile.partials.page` |
| `GET /hub/profile/data` | Stand: `user`, `access` (PIN, Passkey, Passwort, Admin-Schranke), `sessions`, `devices`, `thank_you`, `tour` |
| `POST /hub/profile/photo` (multipart `photo`) / `DELETE /hub/profile/photo` | Profilbild über Jetstreams `updateProfilePhoto()`/`deleteProfilePhoto()`; JPG, PNG, WebP, GIF bis 5 MB |
| `POST /hub/profile/credentials` | PIN (und Passwort) setzen — mit `current_pin`, sobald eine PIN existiert (`ProfileCredentialsController`, seit 24.10.2026) |
| `POST /hub/profile/sessions/logout-others` | Alle anderen Zeilen der `sessions`-Tabelle dieser Person löschen; **sensible Aktion** `own_sessions` (SensitiveActionRegistry) |
| `GET/PUT /hub/profile/thank-you` | Dank-Text (`ProfileThankYouController`) |
| `GET /api/app/devices`, `DELETE /api/app/devices/{id}` | App-Geräte (Gerätetoken), unverändert |

**Partials** (`resources/views/hub/profile/partials/`): `page` (Rahmen mit `x-data="profilePage(@js($profile))"`),
`hero`, `zugang`, `sicherheit`, `darstellung` (+ `onboarding`), `persoenliches` (+ `thank-you-text`),
`modal-pin`, `modal-edit` (Jetstream `profile.update-profile-information-form`), `modal-password`
(Jetstream `profile.update-password-form`, nur `@can('access_admin')`). Die Livewire-Komponente
`UpdatePinForm` und ihr View sind entfallen.

### Fachregeln

- **Passwort nur mit Admin-Schranke.** Der Abschnitt und der Dialog existieren nur für Konten mit
  `access_admin`; ein erstes Passwort vergibt der Super-Admin (siehe `MISSBRAUCHS-BREMSE.md`,
  Passkeys). Der Passkey-Stand kommt aus `$user->passkeys()`; den Einrichtungs-Link schickt ein
  Super-Admin (`/passkey/{token}`), die Seite erklärt das nur.
- **PIN-Dialog:** vier Ziffern, lokal verworfen werden gleiche Ziffern, Folgen wie 1234/4321 und
  Jahreszahlen; Eindeutigkeit und `current_pin` prüft der Hub (`UserAccessService::setOwnCredentials`,
  `PinAuthenticationService`). Ein Fehler zu `current_pin` springt auf Schritt 1, zu `pin` auf
  Schritt 2 zurück. Nach dem Speichern verfällt eine offene Bestätigung sensibler Aktionen.
- **Sitzungen:** `DeviceLabel` liefert Browser/App und Betriebssystem aus dem User-Agent; die
  Desktop-App heißt „Desktop-App · Mac“, die iOS-App „App · iPhone/iPad“. Die aktuelle Sitzung
  steht immer zuerst. „Andere Sitzungen beenden“ ersetzt Jetstreams passwortpflichtige
  `LogoutOtherBrowserSessionsForm` — 19 von 21 Konten haben kein Passwort.
- **Foto:** Web lädt per `fetch` (FormData) hoch und setzt danach jedes `[data-user-avatar]` neu;
  die App wandelt Galerie-Bilder vor dem Upload zu JPEG (HEIC weist der Hub ab) und verkleinert auf
  1.200 px Kantenlänge.
- **Geräte:** Mehr als vier App-Geräte werden eingeklappt („N weitere Geräte anzeigen“).
- **2FA und Kontolöschung** sind in `config/fortify.php`/`config/jetstream.php` abgeschaltet und
  tauchen deshalb nicht mehr auf.

### Theme

Abschnitt „PROFIL — Kopfkarte und Abschnitte“ in `theme_glattt.css`: `.profile-hero-glattt*`,
`.profile-grid-glattt` (zwei Spalten ab 1024 px), `.profile-rows-glattt` / `.profile-row-glattt*`
(Zeilen mit Symbol, Text, Aktionen), `.pin-dialog-glattt`, `.pin-steps-glattt`, `.pin-dots-glattt`,
`.pin-keypad-glattt`. Gleichzeitig wurden die Avatar-Größenklassen mit Präfix (`.avatar-glattt-xs`
… `-xl`) ergänzt und `.avatar-glattt` bekam `flex-shrink: 0` — die Personal-Liste nutzte eine
Klasse, die es nicht gab, und Flex drückte die Initialen-Kreise zu Ovalen.

### App

`ios/glatttHub/Profile/ProfileView.swift` (+ `ProfileModel.swift`): Mehr-Seite `NativeMorePage.profile`
(`/hub/profile`, auch `/user/profile`), dieselben Endpunkte. `ProfilePinSheet` baut den PIN-Dialog
mit `PinDots` und `NumberPad` der Anmeldeseite nach; `ProfileAvatar` ist der gemeinsame runde
Avatar mit Initialen-Rückfall und wird auch in der Personalseite genutzt. Snapshot-Test
`ProfileSnapshotTests` liefert die Bilder für App 29. Details: `IOS-APP.md`, Abschnitt
„Natives Profil“.

### Relevante Dateien

- `app/Http/Controllers/Hub/ProfileController.php` — Stand, Foto, Sitzungen
- `app/Http/Controllers/Hub/ProfileCredentialsController.php` — PIN und Passwort
- `app/Services/Security/SensitiveActionRegistry.php` — Aktion `own_sessions`
- `resources/views/hub/profile/partials/*.blade.php`, `resources/views/profile/show.blade.php`
- `public/js/profile/profile.js` — `profilePage()`, `profileThankYou()`
- `tests/Feature/ProfilePageTest.php`
- `ios/glatttHub/Profile/*.swift`, `ios/glatttHubTests/ProfileSnapshotTests.swift`

## Changelog

- **25.10.2026** — Neuaufbau nach Entwurf 1 „Kopfkarte und Abschnitte“: PIN-Dialog in Schritten,
  Passwort nur mit Admin-Schranke, Sitzungen ohne Passwort beenden, Foto per Klick, JSON-Stand für
  Web und App, native Profilseite in der App.
- **24.10.2026** — Karte „Darstellung“ (Farbschema nur noch im Profil), Dank-Text fürs Trinkgeld.
- **14.10.2026** — Position und Bereich unter dem Namen.
