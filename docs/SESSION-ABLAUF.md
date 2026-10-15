# Session-Ablauf & Session-Modal

Abgelaufene Sitzungen sind im Hub sofort erkennbar: Statt still scheiternder
Hintergrundabfragen (leere Suche, hängende Karten) erscheint das Modal
**„Sitzung abgelaufen"** mit direkter Anmeldemöglichkeit per PIN oder
E-Mail/Passwort, ohne die Seite zu verlassen. Diese Seite beschreibt **die
zweigleisige Erkennung (Fetch-Interceptor + Heartbeat), den Re-Login ohne
Seitenwechsel, die 419-Seite, die Session-Dauer aus dem Admin-Backend und die
Service-Worker-Härtung**; die Bedienung Schritt für Schritt steht im
Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Grundlagen 1 – Anmelden & zurechtfinden"
    [hilfe.hub.glattt.com/grundlagen/1/](https://hilfe.hub.glattt.com/grundlagen/1/) — mit PIN oder E-Mail anmelden, Konto und Abmelden.

    Angrenzend: [Grundlagen 3 – Mein Profil im glatttHub](https://hilfe.hub.glattt.com/grundlagen/3/) (PIN verwalten, Passwort ändern), [Admin 8 – Protokolle und Einstellungen](https://hilfe.hub.glattt.com/admin/8/) (Session-Dauer als Systemeinstellung).

---

## Für Anwender — Überblick

**Was das Session-Modal leistet.** Läuft die Anmeldung ab, erscheint von selbst —
spätestens nach einer Minute oder bei der nächsten Aktion — das Modal „Sitzung
abgelaufen"; die Seite dahinter wird unscharf gestellt, damit niemand mitlesen
kann. Das Modal sieht aus wie die Anmeldeseite: PIN eingeben (oder, wer keine PIN
hinterlegt hat, E-Mail und Passwort) und man ist wieder genau auf derselben Seite,
offene Formulareingaben bleiben erhalten. Auch die 419-Fehlerseite nach einem
abgeschickten Formular bietet dieselbe direkte Neuanmeldung.

**Grundsätze:**

- **PIN ist der Standardweg**, der Umschalter PIN ⇄ E-Mail steht bereit; bei
  aktivierter Zwei-Faktor-Anmeldung leitet das Modal auf die volle Anmeldeseite um.
- **Die Session-Dauer** ist eine Systemeinstellung im Admin-Panel (Einstellungen →
  Session), ohne Deployment wirksam binnen einer Minute. Nicht zu verwechseln mit
  dem **Auto-Logout je Benutzer** (Countdown in der Sidebar), der weiterhin im
  Benutzer-Formular konfiguriert wird; vor dem Auto-Logout warnt ein Toast.
- **Im Termin wird nie abgemeldet** (Jan, 11.10.2026): In der Terminansicht, im
  Einstellungszettel und während der Laser-Wartung pausiert der Auto-Logout — die
  Sidebar zeigt „Auto-Logout pausiert · Laser-Wartung". Danach beginnt die volle Zeit
  von vorn. Das gilt im Browser wie in der iOS-App; dort läuft der Zähler auch auf
  nativen Seiten und über einen Hintergrund-Aufenthalt hinweg weiter.
- **Zu viele Fehlversuche** (mehr als fünf pro Minute) sperren die PIN-Anmeldung
  kurz — das Modal meldet „Zu viele Versuche".
- **Abmelden gilt für alle Tabs, Anmelden auch** (seit 15.10.2026): Alle Tabs eines
  Browsers bzw. der Desktop-App teilen sich eine Anmeldung. In der Desktop-App ziehen die
  anderen Tabs sichtbar mit: abmelden → alle auf die Anmeldeseite, anmelden → alle zurück
  auf ihre Seite, Sitzung abgelaufen → überall das Modal. Wer an einem geteilten Rechner
  seine PIN eingibt, ist danach **immer selbst** angemeldet — auch wenn in einem anderen
  Tab noch jemand angemeldet war.
- **Auto-Logout zählt die Bedienung in allen Tabs:** Wer in einem Tab arbeitet, wird nicht
  von einem anderen Tab im Hintergrund abgemeldet; eine Pause (Termin, Laser-Wartung) in
  einem Tab hält auch die anderen wach.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Mit PIN oder E-Mail anmelden, Konto, Abmelden | Grundlagen 1 |
| PIN hinterlegen oder ändern, Passwort ändern | Grundlagen 3 |
| Session-Dauer als Systemeinstellung | Admin 8 |

---

## Für Entwickler

### Erkennung (zweigleisig)

`public/js/session-guard.js` (lädt früh im Hub-Layout, nach `nav-abort.js`):

1. **Fetch-Interceptor:** wickelt `window.fetch` und prüft jede same-origin-
   Antwort auf 401, 419 oder `response.redirected` mit Ziel `/login` (fetch
   folgt dem 302 automatisch — die HTML-Login-Seite war vorher der klassische
   `SyntaxError: Unexpected token '<'`). Ausgenommen: `/login`, `/logout`,
   `/livewire` (eigene 419-Behandlung), `/sanctum`, Heartbeat.
2. **Heartbeat:** alle 60s + bei `visibilitychange` → `GET /api/session/heartbeat`.

Damit erscheint das Modal auch ohne Klick — spätestens nach einer Minute
(Heartbeat) oder bei der nächsten Aktion (z.B. globale Suche).

### Heartbeat verlängert die Session NICHT

`app/Http/Controllers/SessionHeartbeatController.php`, Route in `routes/api.php`
(API-Gruppe = **ohne** StartSession-Middleware, ohne IAP): Die Session-ID wird
manuell aus dem verschlüsselten Session-Cookie gelesen (API-Routen haben kein
EncryptCookies — daher `encrypter->decrypt` + `CookieValuePrefix::validate`)
und der Datensatz in der `sessions`-Tabelle nur **gelesen** (`last_activity`
+ Lifetime vs. jetzt). Ein normaler Web-Request würde `last_activity`
aktualisieren und die Session am Leben halten. Bei anderem Session-Treiber als
`database` antwortet der Endpoint fail-open (`active: true, checked: false`).

### Modal & Re-Login ohne Seitenwechsel

Markup in `layouts/hub.blade.php` (`#session-guard-modal`, `modal-glattt`-Klassen,
z-index über allem). **Optik = Login-Seite** (Asana 1217860682857967, 27.08.2026):
zentrierter Titel statt Header-Balken, türkiser Umschalter
(`segmented-control-glattt-primary`), große PIN-Eingabe
(`input-glattt-pin` + `input-glattt-pin-lg`), vollbreiter Button „Mit PIN/E-Mail
anmelden" (Text wechselt mit der Methode über `#session-guard-submit-label`,
gesetzt in `session-guard.js`) und „Zur Anmeldeseite" als Textlink. Diese
Theme-Klassen teilen sich Login-Seite, Modal und 419-Seite —
`PinLoginTest::test_relogin_views_share_the_login_page_look` wacht darüber.
Der Backdrop **blurt die Seite dahinter** (`backdrop-filter` auf
`#session-guard-modal` — dokumentierte Ausnahme vom backdrop-filter-Verbot,
Einzel-Element aus Datenschutzgründen). **PIN ist die Standard-Methode** —
analog zur Login-Seite: Das Layout rendert `data-has-pin` (hat der angemeldete
Nutzer eine PIN?); nur dann gibt es den Umschalter PIN ⇄ E-Mail, sonst
zeigt das Modal direkt E-Mail/Passwort (E-Mail vorausgefüllt). Ablauf beim Anmelden:

1. `GET /login/token` → frisches CSRF-Token der aktuellen Sitzung als JSON
   (`{token, user_id}`; bis 15.10.2026 wurde dafür die Login-Seite geholt und das
   Meta herausgeschnitten).
2. Je nach Methode `POST /login/pin` (nur `pin`) oder `POST /login` (Fortify,
   E-Mail + Passwort) — beide mit `Accept: application/json`.
   `PinLoginController` antwortet bei `expectsJson()` mit `{success: true}`
   statt Redirect.
3. Erfolg → `SessionGuard.resume()`: nochmal `/login/token` (Login regeneriert die
   Session!), **alle `csrf-token`-Metas und alle versteckten `_token`-Felder** der
   offenen Seite aktualisieren (vorher nur die Metas — der Abmelde-Knopf lief danach ins
   419), Modal schließen, Erfolgs-Toast. **Andere Person** als die Seite (`user_id` ≠
   Meta `user-id`) → Seite neu laden, damit keine Daten der Vorgängerin stehen bleiben.
   `two_factor: true` → Redirect auf die volle Login-Seite.

Kein `window.location`-Wechsel — DOM samt Formulareingaben bleibt stehen.
„Zur Anmeldeseite" führt alternativ zum normalen Login (nötig z.B. bei
aktivierter Zwei-Faktor-Anmeldung — das Modal leitet dann automatisch um).

**Throttling:** `POST /login/pin` läuft hinter `throttle:pin-login`
(5/min pro IP, definiert im `FortifyServiceProvider`) — eine 4-stellige PIN
wäre sonst frei ratbar. `POST /login/credentials` nutzt Fortifys
`throttle:login`. Das Modal meldet 429 als „Zu viele Versuche".

### Beendete Sitzungen bleiben beendet (seit 15.10.2026)

**Prod-Befund 15.10.2026** (Desktop-App, Cloud-Run-Logs): Nach Abmelden und Anmelden mit
einer anderen Kennung kam fast immer ein **419** — und kurz darauf war man **als die
vorherige Person angemeldet**. Ursache sind Anfragen, die noch mit der alten Sitzung
unterwegs waren, als abgemeldet wurde: Chat-Abfragen alle paar Sekunden, die 8–40 s langen
Kennzahlen der Berichte-Übersicht, die parallel zum Abmelde-POST geschickte
Push-Abmeldung, andere Tabs. Laravels Datenbank-Treiber hat dabei zwei Lücken:

1. **Jede Antwort setzt das Sitzungs-Cookie.** Kam eine solche Antwort nach dem Abmelden
   an, hatte der Browser wieder die tote Sitzungs-ID, die Anmeldeseite aber das Token der
   neuen Sitzung → 419.
2. **Schreiben ist ein `UPDATE … WHERE id`.** Die 419-Antwort legte die tote ID als
   leere Gast-Zeile neu an; die nächste alte Anfrage überschrieb sie mit ihrem Inhalt —
   inklusive `login_web_…` der Vorgängerin. Belegt: Kennzahl `hr-kpis` startete 16:51:50
   als A, lief 40,7 s, Abmelden 16:52:11, Anmelden als B 16:52:18, um 16:52:30 war wieder A
   angemeldet (eine Chat-Nachricht von B ging danach unter A's Namen raus).

**Lösung — Grabstein statt Löschen** (`App\Session\GuardedDatabaseSessionHandler`,
im `AppServiceProvider` als Treiber `database` registriert, gilt also auch für das
Filament-Panel und das Kundenportal):

- `destroy()` (Abmelden, `Auth::login()`, `regenerate(true)`) löscht die Zeile nicht,
  sondern setzt `payload = '__ended__'`, `user_id = null`, `last_activity = jetzt`. Die
  normale Aufräumrunde entfernt den Grabstein nach Ablauf der Session-Dauer.
- Lesen eines Grabsteins liefert eine leere Sitzung; **Schreiben** auf einen Grabstein
  oder auf eine Zeile, die während der Anfrage verschwunden ist, wird **verweigert**
  (`writeWasRejected()`). Ein `UPDATE` mit 0 Zeilen prüft per Nachfrage, ob die Sitzung
  wirklich beendet ist — MySQL meldet auch bei unverändertem Inhalt 0.
- Wer Sitzungen von Hand beendet, nutzt `GuardedDatabaseSessionHandler::bury($query)`
  (z.B. `UserSignOutService`, Admin „Auf allen Geräten abmelden"). **Nie** Zeilen der
  `sessions`-Tabelle löschen — das öffnet die Lücke wieder.

**`App\Http\Middleware\GuardedStartSession`** (ersetzt `StartSession` über den
Container, damit auch Panels mit eigener Middleware-Liste sie bekommen):

- Anfrage mit der ID einer beendeten Sitzung → **neue ID** statt Wiederbelebung.
- Wurde das Schreiben verweigert → **kein `laravel_session`- und kein `XSRF-TOKEN`-Cookie**
  in der Antwort; der Browser behält sein aktuelles.
- **Hintergrund-Anfrage** (`Sec-Fetch-Mode` ≠ `navigate`, ohne Fetch-Metadaten nur
  AJAX/JSON) mit einer **eben** (< 120 s) beendeten Sitzung → flüchtige Sitzung, nicht
  gespeichert, ohne Cookie. Sie wurde noch mit dem alten Cookie losgeschickt, der Browser
  hat längst das neue — sonst verdrängte die Chat-Abfrage eines anderen Tabs die gerade
  erfolgte Anmeldung (im E2E-Lauf nachgestellt). Seitenaufrufe und `/login*` bekommen
  immer eine neue Sitzung samt Cookie, damit niemand hängen bleibt.

**Dazu im Client:**

- `logout.js`: `glatttPrepareLogout()` gibt ein Promise zurück — der Abmelde-POST wartet
  auf die Push-Abmeldung (höchstens 1,5 s), statt mit ihr in derselben Sitzung um die Wette
  zu laufen; das Formular-Token kommt aus dem Meta. `auto-logout.js` wartet genauso.
- Anmeldeseite: `loginSubmit()` holt direkt vor dem Absenden `/login/token` und setzt das
  Token ins Formular (3 s Zeitlimit, sonst mit dem vorhandenen).
- `POST /login/pin` und `/login/credentials` laufen **ohne `guest`**: Ist im Browser noch
  jemand anderes angemeldet, beendet `PinLoginController::endOtherAccountSession()` deren
  Sitzung und meldet die Person an, deren PIN/Passwort eingegeben wurde. Mit `guest`
  wurde man still ins **bestehende** Konto weitergeleitet — ein zweiter Weg ins falsche
  Konto.
- Bleibt es trotzdem bei einem 419 auf `POST /login*` (kein JSON), leitet
  `bootstrap/app.php` auf `/login` mit dem Hinweis „Die Anmeldeseite war nicht mehr
  aktuell" zurück statt auf die Fehlerseite.

### 419-Seite mit Re-Login

`resources/views/errors/419.blade.php` bietet dieselbe Anmeldung als normale
Formulare (kein fetch): PIN-Formular → `route('login.pin')`, E-Mail-Formular →
`route('login.credentials')`, Umschalter per Vanilla-JS. Optik wie Login-Seite
und Modal über die geteilten Theme-Klassen (`segmented-control-glattt-primary`,
`input-glattt-pin-lg`, `session-guard-submit`, `session-guard-login-link`).

### Session-Dauer aus dem Admin-Backend

Ein Admin stellt die Session-Dauer unter Admin-Panel → Einstellungen →
**Session (Anmeldedauer)** ein — ohne Deployment, wirksam binnen einer Minute.
Nicht zu verwechseln mit dem Auto-Logout je Benutzer (Countdown in der Sidebar),
der pro Benutzer im Benutzer-Formular konfiguriert wird; vor dem Auto-Logout
warnt zusätzlich ein Toast.

- Tabelle `session_settings` (eine Zeile), Model `App\Models\SessionSetting`
  (`lifetimeMinutes()`, 60s-Cache, saved-Hook leert den Cache).
- `AppServiceProvider::boot()` setzt `config('session.lifetime')` vor der
  StartSession-Middleware (mit `rescue()` für die Zeit vor der Migration).
- Filament-Seite `SessionSettings` (Gruppe Einstellungen), Permission
  **`manage_session_settings`** (Migration verteilt sie an alle Rollen mit
  `manage_email_settings`; Katalog-Eintrag in `PermissionCatalog`).

### Auto-Logout je Benutzer (Inaktivität)

`public/js/auto-logout.js` (Hub-Layout, Zeit aus `<meta name="auto-logout-timeout">` =
`users.auto_logout_timeout`, Standard 120 s, 0 = aus) ist **rein clientseitig**: Zeitgeber
im Browser, nach Ablauf `POST /logout` über ein Formular (Overlay und Push-Abo-Deaktivierung
über `window.glatttPrepareLogout`, siehe `logout.js`). Serverseitig gibt es keine
Inaktivitätsprüfung — die Grenze dahinter ist die Session-Dauer oben.

**Regeln seit 11.10.2026 (Jan):**

- **Hintergrund zählt mit.** Ein Browser-Tab im Hintergrund (Safari friert JS ein) holt beim
  Zurückkehren nach: Zeit abgelaufen → sofort abmelden, sonst mit der Restzeit weiter
  (`visibilitychange`). Nichts wird beim Zurückkehren zurückgesetzt.
- **Pausen:** `window.autoLogoutManager.hold(key, grund)` / `release(key)` oder ein Element
  mit `data-auto-logout-hold="Grund"` (wird bei `DOMContentLoaded` und `livewire:navigated`
  ausgewertet). Während einer Pause läuft kein Zeitgeber, die Sidebar zeigt „Auto-Logout
  pausiert · Grund" (Theme-Klasse `.is-held` am Countdown-Balken, Zweitfarbe). Nach der
  letzten Pause beginnt die volle Zeit von vorn. Pausiert sind: **Terminansicht und
  Einstellungszettel** (`layouts.fullscreen` lädt `auto-logout.js` gar nicht — die Seite hat
  keinen Zähler) und die **Laser-Wartung** (`maintenance-wizard.blade.php`: `x-effect` auf
  `$wire.showModal` → `hold('laser-maintenance', 'Laser-Wartung')`; vorher rief der Countdown
  jede Sekunde `resetTimer()`).
- **Gemeinsame Aktivität aller Tabs (seit 15.10.2026):** Jeder Tab schreibt seine letzte
  Bedienung (gedrosselt, 1/s) nach `localStorage['glattthub-last-activity']`; die anderen
  übernehmen sie über das `storage`-Ereignis und prüfen sie vor dem Abmelden
  (`syncSharedActivity()`). Ein pausierter Tab meldet alle 20 s „aktiv". Vorher meldete ein
  Hintergrund-Tab der Desktop-App (ungedrosselt) die ganze Sitzung ab, während im anderen
  Tab gearbeitet wurde. Die Anzeige läuft nach Ablauf weiter, falls ein anderer Tab die Zeit
  noch zurücksetzt.
- **iOS-App ab Build 90:** `auto-logout.js` führt keinen eigenen Zeitgeber mehr, sondern
  übergibt an die App (`glatttNative.autoLogoutConfigure({timeout})`, `autoLogoutActivity()`,
  `autoLogoutHold({key, reason, held})`), die den Zähler nativ führt — auch auf nativen
  Seiten und im Hintergrund, siehe [IOS-APP.md](IOS-APP.md), Abschnitt „Auto-Abmeldung in
  der App". Ältere Builds (ohne diese Bridge-Methoden) zählen weiter selbst, melden aber nie
  aus einem unsichtbaren WebView ab und holen beim Zurückkehren nach.

### Service-Worker-Härtung (gleicher Commit)

`public/sw.js` cached in `networkFirstWithCache` keine HTML-Antworten und keine
Redirects mehr unter API-Keys (vorher konnte die Login-Seite als vermeintliche
API-Antwort im Cache landen und der stille Fehler überlebte sogar den
Neu-Login); API-Cache auf `glattthub-api-v3` gebumpt, `/api/session` ist
network-only.

### Tests

`tests/Feature/SessionHeartbeatTest.php` (aktiv/abgelaufen/Gast/ohne Cookie,
**last_activity bleibt unangetastet**, fail-open bei fremdem Treiber,
Admin-Einstellung wirkt) und `tests/Unit/SessionSettingTest.php`
(Fallback + Cache-Invalidierung). Test-Gotcha: `getJson()` schickt Cookies nur
mit `$this->withCredentials()`.

`tests/Feature/SessionEndStaysEndedTest.php` deckt die beendeten Sitzungen ab: alte
Anfrage schreibt nicht zurück, Grabstein wird nie überschrieben, unveränderte Sitzung gilt
nicht als beendet, Cookie einer beendeten Sitzung → neue Sitzung, Sitzung endet während der
Anfrage → keine Cookies, Hintergrund-Anfrage → flüchtig, Kontowechsel per PIN,
`/login/token`, 419 am Login → zurück zur Anmeldeseite. Gegenprobe: ohne die Bindungen im
`AppServiceProvider` scheitern die HTTP-Fälle.

`tests/Feature/PinLoginTest.php` deckt den PIN-Login ab: Redirect- und
JSON-Flow, 422 bei falscher PIN, Throttling (429 ab dem 6. Versuch pro IP),
die Konvention, dass Modal und 419-Seite die PIN-Anmeldung anbieten, sowie
dass Login-Seite, Modal und 419-Seite die geteilten Optik-Klassen nutzen und
das Button-Label-Span für `session-guard.js` adressierbar bleibt.
