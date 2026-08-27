# ⏱️ Session-Ablauf & Session-Modal

Abgelaufene Sitzungen sind im Hub sofort erkennbar: Statt still scheiternder
Hintergrundabfragen (leere Suche, hängende Karten) erscheint das Modal
**„Sitzung abgelaufen"** mit direkter Anmeldemöglichkeit.

## Für Endanwender

- Läuft die Anmeldung ab, erscheint automatisch ein Modal „Sitzung abgelaufen" —
  auch ohne Klick, spätestens nach einer Minute (Heartbeat) oder bei der
  nächsten Aktion (z.B. globale Suche). Die Seite dahinter wird dabei
  **unscharf gestellt**, damit niemand mitlesen kann, solange die Sitzung
  abgelaufen ist.
- Das Modal sieht aus wie die normale Anmeldeseite: einfach die **4-stellige
  PIN** eingeben → **„Mit PIN anmelden"**. Danach bist du wieder genau auf
  derselben Seite; offene Formulareingaben bleiben erhalten. Wer keine PIN
  hinterlegt hat (Profil → PIN-Verwaltung), meldet sich mit dem Passwort an
  (E-Mail ist vorausgefüllt); der Umschalter **PIN ⇄ E-Mail** steht im Modal
  jederzeit bereit.
- Auch die **419-Fehlerseite** („Sitzung abgelaufen" nach einem abgeschickten
  Formular) bietet die direkte Neuanmeldung per PIN bzw. E-Mail/Passwort.
- Alternativ führt „Zur Anmeldeseite" zum normalen Login (nötig z.B. bei
  aktivierter Zwei-Faktor-Anmeldung — das Modal leitet dann automatisch um).
- Die **Session-Dauer** stellt ein Admin unter Admin-Panel → Einstellungen →
  **Session (Anmeldedauer)** ein — ohne Deployment, wirksam binnen einer Minute.
  Nicht zu verwechseln mit dem Auto-Logout je Benutzer (Countdown in der
  Sidebar), der weiterhin pro Benutzer im Benutzer-Formular konfiguriert wird;
  vor dem Auto-Logout warnt jetzt zusätzlich ein Toast.

## Für Entwickler

### Erkennung (zweigleisig)

`public/js/session-guard.js` (lädt früh im Hub-Layout, nach `nav-abort.js`):

1. **Fetch-Interceptor:** wickelt `window.fetch` und prüft jede same-origin-
   Antwort auf 401, 419 oder `response.redirected` mit Ziel `/login` (fetch
   folgt dem 302 automatisch — die HTML-Login-Seite war vorher der klassische
   `SyntaxError: Unexpected token '<'`). Ausgenommen: `/login`, `/logout`,
   `/livewire` (eigene 419-Behandlung), `/sanctum`, Heartbeat.
2. **Heartbeat:** alle 60s + bei `visibilitychange` → `GET /api/session/heartbeat`.

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
zeigt das Modal direkt E-Mail/Passwort. Ablauf beim Anmelden:

1. `GET /login` → frisches CSRF-Token aus dem `csrf-token`-Meta der Antwort
   (neue Gast-Session).
2. Je nach Methode `POST /login/pin` (nur `pin`) oder `POST /login` (Fortify,
   E-Mail + Passwort) — beide mit `Accept: application/json`.
   `PinLoginController` antwortet bei `expectsJson()` mit `{success: true}`
   statt Redirect.
3. Erfolg → nochmal Token holen (Login regeneriert die Session!) und **alle
   `csrf-token`-Metas der offenen Seite aktualisieren**, Modal schließen,
   Erfolgs-Toast. `two_factor: true` → Redirect auf die volle Login-Seite.

Kein `window.location`-Wechsel — DOM samt Formulareingaben bleibt stehen.

**Throttling:** `POST /login/pin` läuft hinter `throttle:pin-login`
(5/min pro IP, definiert im `FortifyServiceProvider`) — eine 4-stellige PIN
wäre sonst frei ratbar. `POST /login/credentials` nutzt Fortifys
`throttle:login`. Das Modal meldet 429 als „Zu viele Versuche".

### 419-Seite mit Re-Login

`resources/views/errors/419.blade.php` bietet dieselbe Anmeldung als normale
Formulare (kein fetch): PIN-Formular → `route('login.pin')`, E-Mail-Formular →
`route('login.credentials')`, Umschalter per Vanilla-JS. Optik wie Login-Seite
und Modal über die geteilten Theme-Klassen (`segmented-control-glattt-primary`,
`input-glattt-pin-lg`, `session-guard-submit`, `session-guard-login-link`).

### Session-Dauer aus dem Admin-Backend

- Tabelle `session_settings` (eine Zeile), Model `App\Models\SessionSetting`
  (`lifetimeMinutes()`, 60s-Cache, saved-Hook leert den Cache).
- `AppServiceProvider::boot()` setzt `config('session.lifetime')` vor der
  StartSession-Middleware (mit `rescue()` für die Zeit vor der Migration).
- Filament-Seite `SessionSettings` (Gruppe Einstellungen), Permission
  **`manage_session_settings`** (Migration verteilt sie an alle Rollen mit
  `manage_email_settings`; Katalog-Eintrag in `PermissionCatalog`).

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

`tests/Feature/PinLoginTest.php` deckt den PIN-Login ab: Redirect- und
JSON-Flow, 422 bei falscher PIN, Throttling (429 ab dem 6. Versuch pro IP),
die Konvention, dass Modal und 419-Seite die PIN-Anmeldung anbieten, sowie
dass Login-Seite, Modal und 419-Seite die geteilten Optik-Klassen nutzen und
das Button-Label-Span für `session-guard.js` adressierbar bleibt.
