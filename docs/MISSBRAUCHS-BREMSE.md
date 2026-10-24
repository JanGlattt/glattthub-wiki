# Missbrauchs-Bremse (Schreibsperre bei Auffälligkeiten)

!!! info "Stand 23.10.2026 — auf `develop`"
    Gebaut nach dem Sicherheitsvorfall vom 22.10.2026: Mit einem übernommenen Hub-Konto wurden in
    einer Nacht 3.689 Kundendatensätze in Phorest überschrieben, mehrere hundert Bankverbindungen
    geändert und Report-Mails an eine fremde Adresse versandt. Alles lief unauffällig durch die
    normalen Endpunkte. Die Bremse erkennt solche Mengen und sperrt **schreibend**.

## Was sie tut

Zählt Vorgänge je **IP-Adresse** und je **Konto** (Angreifer wechseln die IP, das Konto bleibt). Wird
die Schwelle einer Regel überschritten, sind IP bzw. Konto für `SECURITY_BLOCK_HOURS` (Standard 3 h)
**schreibgesperrt**: GET/HEAD/OPTIONS laufen weiter, jede schreibende Anfrage antwortet **423**.
Gleichzeitig bekommen alle Konten mit dem Recht `manage_security_blocks` die Meldung
*„Zugriff gesperrt“* (App, Push, E-Mail), und es steht im Log (`critical`).

Ausgenommen sind `logout`, `broadcasting/auth`, `hub/chat/*` und `api/push/*` — sonst wäre eine Sperre
ein Totalausfall.

## Schwellen (aus dem Prod-Log, nicht geraten)

| Regel | Schwelle | Normalbetrieb (30 Tage ohne die Angriffsnacht) |
|---|---|---|
| `phorest_client_write` (Kunde ändern/anlegen) | 10 in 5 Min | **21 in 30 Tagen** |
| `phorest_write` (alle Phorest-Schreibzugriffe) | 60 in 1 Min | Median 11/Tag, höchstens 83/Tag; je IP/Min meist 1, selten bis 4, einmal 26 |
| `contract_changes` (Vertragsverlauf je Konto) | 100 in 10 Min | höchstens 25, üblich bis 12 |
| `bank_account_changes` | 8 in 15 Min | höchstens 3 in 10 Min |
| `contract_notes` | 10 in 10 Min | höchstens 1 in 10 Min |

Der Angriff lag bei bis zu 200 Phorest-Schreibzugriffen pro Minute. Alle Schwellen stehen in
`config/security.php` und lassen sich dort anpassen; Begründung im Kopfkommentar der Datei.

## Aufheben

- **Admin → System → Zugriffssperren** (Recht `manage_security_blocks`, vererbt von
  `manage_session_settings`): laufende Sperren, Grund, Ablauf, „Aufheben“ je Zeile oder für mehrere.
  Die Navigation zeigt die Zahl laufender Sperren als roten Zähler.
- `php artisan security:unblock` listet laufende Sperren, `security:unblock <IP|Konto-ID>` oder
  `--all` hebt sie auf — der Weg, wenn alle Admins gesperrt sind.
- `SECURITY_ALLOWED_IPS` (kommagetrennt) nimmt feste Büro-Anschlüsse von der IP-Sperre aus.

## Bausteine

| Baustein | Aufgabe |
|---|---|
| `App\Services\Security\AbuseGuard` | zählt (`RateLimiter`), setzt Sperren, meldet; `activeBlockFor()` mit 20 s Zwischenspeicher |
| `App\Http\Middleware\CountAbuseRule` (`abuse:regel,…`) | zählt einen schreibenden Aufruf einer Route; an den Phorest-Schreibrouten und `shared.institute.client-update` |
| `App\Http\Middleware\EnforceSecurityBlocks` | setzt die Sperre durch — global (IP), `web`/`api` und Admin-Panel (Konto) |
| `ContractChangeAbuseObserver` | zählt Änderungen im Vertragsverlauf, nur wenn eine angemeldete Person sie auslöst (keine Jobs, Webhooks, Konsole) |
| `UserEmailChangeObserver` | meldet jede Änderung der E-Mail-Adresse eines Hub-Kontos (Anlass `security.email_changed`) |
| `SecurityBlock` / `security_blocks` | Sperre mit Art (`ip`/`user`), Grund, Ablauf, Aufhebung |
| Filament `SecurityBlockResource` | Admin-Seite |

## Weitere Härtungen aus demselben Vorfall

- **Report-Mails:** Die Bezeichnung eines Abos verliert Zeilenumbrüche und Steuerzeichen (`Bcc:`-
  Einschleusung), der Betreff ist einzeilig und auf 200 Zeichen begrenzt. Konten-Empfänger bekommen
  Reports nur an Firmen-Domains (`SECURITY_REPORT_MAIL_DOMAINS`, Standard `labrado-schlueter.com,
  glattt.com,system.glattt.com`, `*` = alle); eine private Adresse wird als **externer Empfänger**
  freigegeben und bleibt damit protokolliert.
- **Rechtsdokumente (SSRF):** `App\Support\SafeUrl` — nur http/https auf Port 80/443, keine
  Zugangsdaten, Host auf der Freigabeliste `SECURITY_LEGAL_SOURCE_HOSTS` (Standard `glattt.com`), alle
  aufgelösten Adressen öffentlich (kein Loopback, privat, Link-Local, Metadaten), Weiterleitungen
  einzeln geprüft (höchstens 3), geprüfte Adresse fest an die Verbindung gebunden (kein DNS-Rebinding).
  Die Formularvalidierung der Quell-URL nutzt dieselbe Prüfung.
- **Kundenportal-Anhänge:** Endung ausschließlich aus dem erkannten Inhalt, Dateiname ohne Pfad und
  Steuerzeichen (vorher übernahm der Hub die Endung aus dem Namen der Kundin).

## Fallstricke

- **Das Büro teilt sich IPs.** Löst eine Mitarbeiterin die IP-Regel aus, ist das ganze Büro schreib-
  gesperrt, bis ein Admin aufhebt. Deshalb ist `SECURITY_ALLOWED_IPS` vorgesehen und die Meldung geht
  sofort an die Admins.
- **Erst die Meldung, dann das Aufheben:** Eine Sperre ist ein Hinweis, kein Urteil. Vor dem Aufheben
  das Konto prüfen (PIN, Geräte, Verlauf).
- **Tests:** `AbuseGuardTest`, `ReportMailSecurityTest`, `SafeUrlTest`, `PortalAttachmentSanitizeTest`.
  `phpunit.xml` setzt `SECURITY_REPORT_MAIL_DOMAINS=*`, damit die Fabrik-Adressen der Tests nicht
  verworfen werden.

## Weitere Bausteine (24.10.2026)

Alle Meldungen sind Anlässe des Benachrichtigungs-Katalogs (`security`), **standardmäßig aus** — Jan schaltet sie im
Admin unter Kommunikation → Benachrichtigungen selbst ein. Zielgruppe: die betroffene Person selbst
(`event_owners`) und Konten mit dem Recht `manage_security_blocks`.

| Anlass | Auslöser | Technik |
|---|---|---|
| `new_login_context` — Neue Anmeldung | Gerät (Browser/App + Betriebssystem) oder Netz (IPv4 /24, IPv6 /48) ist für das Konto neu | `RecordLoginContext` (Login-Ereignis), Tabelle `user_login_contexts`; die erste erfasste Umgebung eines Kontos löst nichts aus |
| `access_rights_changed` — Rollen oder Rechte geändert | Spatie-Ereignisse `RoleAttached/Detached`, `PermissionAttached/Detached` (`permission.events_enabled`) | `NotifyAccessRightsChanged`; nur Änderungen einer angemeldeten Person im Betrieb — Befehle, Migrationen, Seeder melden nichts |
| `session_device_mismatch` — Sitzung auf anderem Gerät | Sitzung wird mit anderem Gerät als bei der Anmeldung weiterbenutzt | `BindSessionToDevice` (Web + Admin-Panel), Sitzung wird sofort abgemeldet |
| `pin_attack` — Viele falsche PINs | über alle Geräte/Adressen mehr als `security.pin_failures_alert` falsche PINs je Stunde | Zähler in `PinLoginController`, höchstens eine Meldung je Stunde |

**Sitzungsbindung** (`config('security.bind_session_to_device')`, Umgebungsvariable
`SECURITY_BIND_SESSION_TO_DEVICE`): `DeviceLabel::fingerprint()` hasht Betriebssystem-Familie und Browser **ohne
Versionsnummern** (ein Browser-Update meldet nicht ab). iPhone, iPad und Mac gelten als eine Apple-Familie, weil
iPadOS-Safari sich als „Macintosh" meldet; auf Apple-Geräten sind Safari/Chrome/Firefox/Edge alle WebKit und
zählen als „browser". Die Apps behalten ihren Token (`glatttHub-iOS/`, `glatttHub-Desktop/`) — die native
App-Schicht (`HubSession`) und die WebViews teilen sich dieselbe Kennung. Sitzungen ohne Kennung (vor der
Einführung) bekommen sie beim nächsten Aufruf. Abschalten, falls eine Umgebung ihre Kennung zur Laufzeit wechselt.
Ein Wechsel der Kennung meldet **immer** ab — die Übergangsregel vom 24.10.2026 (alter Familien-Hash wird von einer
App-Anfrage still umgebunden) ist seit dem Sicherheitsreview am selben Tag entfernt: Sie ließ jede Browser-Sitzung
mit gefälschter App-Kennung zur „App" werden; alte Sitzungen sind nach 120 Minuten ohnehin abgelaufen.

**Fallstricke:** Listener in `app/Listeners` mit Methoden namens `handle…` entdeckt Laravel selbst — wer sie zusätzlich in
`AppServiceProvider` registriert, bekommt jede Meldung doppelt (deshalb heißen die Methoden `record`/`on…`).
Die Bremse der PIN-Anmeldung je Gerät/Adresse steht in `FortifyServiceProvider` (5/Minute je Gerät, 40/Stunde und
120/Tag je Adresse); die Meldung `pin_attack` ergänzt sie um das verteilte Durchprobieren.

## Bestätigung sensibler Aktionen — Passkey, PIN als Rückfall (24.10.2026)

!!! nutzerhandbuch "Bedienung: Grundlagen 8 – Sensible Aktionen bestätigen"
    [hilfe.hub.glattt.com/grundlagen/8/](https://hilfe.hub.glattt.com/grundlagen/8/) — wann der Hub nachfragt, Passkey, PIN, Hub-Bestätigungsfenster.

Bestimmte Aktionen verlangen vorher eine **Bestätigung** (Register `SensitiveActionRegistry`, fünf Gruppen): Bankverbindung ändern,
SEPA-Mandat **und Zahlungsplan** anlegen/ändern/stornieren/Verknüpfung lösen/Einzug auslösen, Konten anlegen und Team-PIN vergeben,
Report-Mails einrichten, Exporte (standardmäßig aus). **Wer einen Passkey hat, bestätigt jedes Mal damit** (Touch ID/Face ID);
**Personen ohne Passkey** bestätigen ersatzweise mit der PIN, solange der Rückfall für die Aktion erlaubt ist. Wer einen Passkey hat,
bestätigt **nie** mit der PIN — sonst nützte der Passkey gegen einen Angreifer mit bekannter PIN nichts.

**Einstellungen** (Admin → System → Bestätigungspflichtige Aktionen, Recht `manage_sensitive_actions`, nur Super-Admins; Tabelle
`sensitive_action_settings` hält nur Abweichungen vom Standard): Schalter je Aktion, Gültigkeit in Minuten und „PIN als Rückfall".
Standard **0 Minuten = jedes Mal neu**: Die Bestätigung gilt für genau die nächste Anfrage (zwei Minuten Zeit zum Wiederholen), danach
fragt der Hub wieder. Mit Minuten > 0 gilt sie für alle sensiblen Aktionen in diesem Fenster (Fallstrick: wer kurz zuvor bestätigt hat,
wird nicht erneut gefragt — so sah es bei der ersten Abnahme aus, als fehle der Schutz am Storno).

**Ablauf:** `RequirePinConfirmation` (Middleware der `web`-Gruppe) greift über den **Routennamen**; `PinConfirmationTest` prüft, dass
jeder Name existiert. Ohne Bestätigung: JSON/Livewire → `423 { pin_required, action, methods, message }` (`methods`: `['passkey']`,
`['pin']` oder `[]` = nur mit Passkey möglich), normale Aufrufe → Seite `/hub/pin-bestaetigen`. `public/js/pin-confirm.js` wickelt `fetch`
ein, zeigt `#pin-confirm-modal` (**z-index 100010 über jedem anderen Modal** — darunter blieb es unsichtbar, die Seite hing am
Lade-Kreis), fragt das Gerät (`POST /hub/bestaetigen/passkey/options` + `/hub/bestaetigen/passkey`) oder die PIN
(`POST /hub/pin-bestaetigen`) und wiederholt die Anfrage einmal. Falsche Versuche zählt eine Bremse je Konto (5 / 10 Minuten).

**Ausnahmen/Schalter:** Anfragen der iOS-App **vor 1.5.3** (`security.ios_confirmation_min_version`) sind ausgenommen — sie hatten noch
kein eigenes Fenster. Die Ausnahme gilt nur für eine **nachgewiesene** App: freigeschaltetes Gerät (`X-Hub-Device`/Cookie, `DeviceTrust`)
**und** Versionsstand im User-Agent; ein `glatttHub-iOS/` ohne Version ist nie die App. Bis zum Sicherheitsreview am 24.10.2026 reichte der
User-Agent allein — eine frei setzbare Kopfzeile, mit der jeder Browser die Bestätigung übersprang. Gesamtschalter `SECURITY_PIN_CONFIRMATION`
(Notfall; in `phpunit.xml` aus). Wer in einer Umgebung ohne Passkey-Unterstützung (ältere
Desktop-App) arbeitet, aber einen Passkey hat, kann nicht mit der PIN ausweichen — Hinweis im Fenster: im Browser bestätigen oder die App
aktualisieren. Admin-Backend-Aktionen sind durch die Admin-Schranke geschützt.

**Die Bestätigung kennt ihre Methode (Sicherheitsreview 24.10.2026):** In der Sitzung stehen `pin_confirmed_at`, `pin_confirmed_used` und
`pin_confirmed_method` (`pin` | `passkey`). `PinConfirmation::isConfirmed()` bekommt die ganze Einstellung der Aktion und lässt eine
PIN-Bestätigung nur durch, wenn die Aktion den PIN-Rückfall erlaubt — vorher reichte eine PIN-Bestätigung **ohne** Aktionsschlüssel (so postet
die Rückfall-Seite) oder für eine andere Aktion, und „nur mit Passkey" war für alle ohne Passkey wirkungslos. Der `action`-Parameter von
`POST /hub/pin-bestaetigen` dient nur noch der Meldung, nie der Entscheidung.

**Eigene PIN nur mit der bisherigen:** `POST /hub/profile/credentials` verlangt `current_pin`, sobald eine PIN gesetzt ist (die App schickt
beim Pflichtwechsel die PIN der eben erfolgten Anmeldung mit). Sonst setzte sich eine gestohlene Sitzung eine eigene PIN und bestätigte damit —
derselbe Grund, aus dem Passwortwechsel `current_password` brauchen. Nach dem Wechsel verfällt eine offene Bestätigung (`PinConfirmation::forget`).

**Bestätigungsfenster statt `window.confirm`:** `GlatttConfirm.ask({ title, message, confirmLabel, danger })` (`public/js/hub-confirm.js`,
Markup `#hub-confirm-modal` im Layout `hub`); auf der Vertragsseite ersetzt es die vier Browser-Dialoge (Zahlungsplan stornieren,
Verknüpfung zurücksetzen, Mandat reaktivieren, Einzüge stornieren). Weitere `confirm()`-Stellen im Hub stehen noch aus.

## Passkeys für die Admin-Schranke (24.10.2026)

!!! nutzerhandbuch "Bedienung: Admin 9 – Passkeys und sensible Aktionen"
    [hilfe.hub.glattt.com/admin/9/](https://hilfe.hub.glattt.com/admin/9/) — Link erzeugen, Einrichtung durch die Person, Schranke, Entziehen, Einstellungen.

Neben dem Passwort bestätigt ein **Passkey** (WebAuthn) die Schranke vor dem Admin-Backend: gleiche Sitzungsmarke
(`admin.password_confirmed_at`, 1 Stunde), Passwort bleibt Rückfall (Entscheidung Jan: Passkey **oder** Passwort).
Technik: `spatie/laravel-passkeys` 1.8 (Prüfung und Speicherung), alles andere eigene Controller — die Livewire-Oberfläche
des Pakets wird nicht benutzt. Relying-Party-ID = Host aus `APP_URL` (`hub.glattt.com`); auf Staging eigene Passkeys.

**Einrichtung nur per Link eines Super-Admins** (Admin → System → Passkeys, Recht `manage_passkeys`, per Migration nur Rollen
mit Super-Admin-Kennzeichen): `PasskeyEnrollmentService::createFor()` erzeugt `/passkey/{token}` (48 Stunden, einmal, nur der
SHA-256-Hash liegt in `passkey_enrollments`, ein neuer Link macht ältere ungültig). Die Person gibt beim Öffnen **zusätzlich ihre
PIN** ein (fünf Fehlversuche beenden den Link) — ein abgefangener Link allein nützt nichts. Öffentliche Seite (kein Hub-Login
nötig, gedrosselt), bewusst **nicht** in der Apple-App-Site-Association: sie öffnet im Browser bzw. in der Desktop-App
(`/passkey` = Seite zum Einfügen von Link/Code), nie in der iOS-App. Versand: Link kopieren oder per E-Mail (Schalter im Dialog);
WhatsApp über die Zugang-Karte ist noch nicht angebunden. Mehrere Passkeys je Konto sind möglich (Mac, iPhone, neues Gerät =
neuer Link); Entziehen im selben Admin-Bereich.

**Ablauf an der Schranke:** `admin-password.blade.php` zeigt „Mit Passkey bestätigen", wenn das Konto einen hat
(`public/js/passkey-gate.js`); `POST /admin-passkey/options` liefert nur die eigenen Passkeys, `POST /admin-passkey/verify`
prüft die Signatur und dass der Passkey **zum angemeldeten Konto** gehört. `userVerification: required` bei Einrichtung und
Abfrage (Touch ID/Face ID/Geräte-PIN), `residentKey: required`. `public/js/passkey.js` wandelt base64url ↔ ArrayBuffer ohne
Fremdbibliothek.

**Wo der Passkey liegt:** Safari und die Desktop-App nutzen den **iCloud-Schlüsselbund („Passwörter“)** — der Passkey ist dort auf allen Geräten
derselben Apple-Kennung gleich, auch in Chrome auf dem Mac. **Bitwarden ist auf macOS kein System-Anbieter für Passkeys** (nur die
Browser-Erweiterung, Stand Anfang 2026; auf dem iPhone/iPad dagegen als AutoFill-Anbieter möglich) — die Desktop-App kann Bitwarden-Passkeys
deshalb nicht nutzen. Empfehlung: Passkey in „Passwörter“ einrichten; wer Bitwarden im Browser will, richtet dort einen zweiten ein (mehrere Passkeys
je Konto sind möglich).

**Fallstricke:** Das Paket erzeugt seine Aktionen mit `new` — Container-Bindings greifen nur, wenn man die Klasse über
`app(Config::getActionClass(...))` auflöst (Tests). Das Paket zieht Symfony 8 (PHP ≥ 8.4) nach, das Image läuft auf PHP 8.3:
deshalb steht `config.platform.php = 8.3.0` in `composer.json` (Symfony 7.4). Die Desktop-App (Electron 41.10) braucht für
Passkeys `app.configureWebAuthn({ platformPasskeys: true })`, Associated-Domains-Berechtigung, eingebettetes Provisioning-Profil und
die Domain-Datei (AASA enthält `webcredentials.apps` bereits) — ohne das meldet die Schranke dort „Passkeys nicht verfügbar", das
Passwort geht weiter.
