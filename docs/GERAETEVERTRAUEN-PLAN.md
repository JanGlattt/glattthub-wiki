# Gerätevertrauen für die iOS-App — Plan

!!! info "Stand: Schritt 0 bis 4 umgesetzt und geprüft, Schritt 5 offen"
    Beschlossen am 23.09.2026 als **Vorlage zur Entscheidung** (Jan: „nur planen, nichts
    bauen"). Am selben Tag kam beim Sicherheits-Review ein offenes Loch ans Licht (siehe
    [Schritt 0](#schritt-0-die-offene-haustuer-erledigt)), das sofort geschlossen wurde.
    Alles Weitere wird je Schritt einzeln freigegeben.

    [Schritt 4](#schritt-4-der-app-host-ohne-iap) ist seit 24.09.2026 vollständig:
    `app.hub.glattt.com` ist live und von außen geprüft — Anmeldung und Hub-Seiten
    antworten ohne freigeschaltetes Gerät mit 403, die Versionsregel mit 200, Admin-Backend
    und Passwortweg mit 404. Die drei bestehenden Hosts sind unverändert hinter IAP.
    Offen ist nur noch ein Build mit der neuen Basis-URL und danach Schritt 5.

## Die Entscheidung in einem Absatz

**Browser, PWA und Mac-App bleiben bei Google IAP — für das Büro ändert sich nichts.**
Nur die **iOS-App** bekommt einen eigenen Weg: Ein Freischalt-Token (per Mail, QR oder
zum Abtippen) wird einmal eingelöst, die App behält ein Geheimnis in der Keychain und
beweist mit App Attest, dass sie echt ist; danach PIN oder Face ID. Institut-iPads werden
über das MDM freigeschaltet, ganz ohne Token. **Passkeys sind gestrichen** (Begründung
[unten](#warum-keine-passkeys)). Der Apple-Prüfer kommt über einen eigenen Host ohne IAP
herein — aber erst, wenn Token, Gerätenachweis und App Attest tragen.

## Warum überhaupt

Zwei Dinge treffen aufeinander.

**Der Anlass:** Für den Dauerbetrieb muss die iOS-App als **Custom App** über Apple
Business Manager verteilt werden, und dafür prüft Apple sie. Ein Prüfer hat kein
Google-Konto in der Domain `labrado-schlueter.com` und kommt deshalb nicht an
[Google IAP](CLOUD-INFRASTRUKTUR.md) vorbei. Es gibt keine IAP-Einstellung, die das löst,
ohne eine Tür aufzumachen.

**Der eigentliche Grund:** Der Anmeldeweg trägt heute nicht allein.

### Der PIN ist der Benutzername

`PinLoginController` nimmt **vier Ziffern und sonst nichts**;
`PinAuthenticationService::attemptPinLogin()` geht alle Konten durch und nimmt das erste,
dessen Hash passt. Der PIN *ist* die Identität — es gibt keinen Benutzernamen daneben.

Bei 21 Konten in einem Raum von 10.000 PINs bedeutet das:

| | |
|---|---|
| Trefferwahrscheinlichkeit je Versuch | **1 zu 476** — nicht 1 zu 10.000, denn *jeder* fremde PIN genügt |
| Bremse | `Limit::perMinute(5)->by($request->ip())` — fünf Versuche je Minute **und IP-Adresse** |
| Erster Treffer, eine Adresse | rund anderthalb Stunden |
| Erster Treffer, zwanzig Adressen | Minuten |

Zwei-Faktor ist in `config/fortify.php` auskommentiert. **Damit ist IAP das Einzige, was
den Hub wirklich schützt.** Außerhalb von IAP liegen am Load Balancer `/api/*` (nur
Sanctum-Token), `/shared/*` (Zugriffstoken in der URL) sowie `/livewire/*`, `/build/*`,
`/css/*`, `/js/*`, `/fonts/*` und `/images/*` (für die Public-Seiten nötig; Livewire
braucht eine gültige Sitzung, das Risiko ist klein — die Middleware aus Schritt 2 nimmt
diese Pfade trotzdem mit).

Daraus folgt der Zuschnitt: Es geht nicht darum, IAP zu ersetzen. Es geht darum, den
Weg der iOS-App so stark zu machen, dass er allein tragen kann. Für alles andere bleibt
IAP.

Nebenbei erklärt das auch, warum PINs hubweit **eindeutig** sein müssen
(`PinAuthenticationService::isPinTaken()`): Das ist keine Schrulle, sondern die zwingende
Folge daraus — und mit jeder neuen Kollegin wird der Raum enger.

## Schritt 0: Die offene Haustür (erledigt)

Beim Review am 23.09.2026 fiel auf, dass IAP **gar nicht alles trug**: Beide
Cloud-Run-Web-Dienste hatten Ingress `ALL`, und die `*.run.app`-Adresse des Dienstes
umgeht den Load Balancer — und damit IAP. Die Login-Seite von Prod **und** Staging
antwortete dort mit 200, ohne Google-Anmeldung. Das Wiki wusste das seit langem
(„run.app umgeht IAP"), und der Klickanleitungen-Lauf nutzte den Umweg bewusst für
Screenshots. Der Rateangriff aus der Tabelle oben war also **bereits möglich**.

Am selben Tag geschlossen (Freigabe Jan):

- Alle 16 Cloud-Scheduler-Jobs mit `run.app`-Ziel auf `hub.glattt.com` bzw.
  `staging.hub.glattt.com` umgehängt (`/api/cron/*` liegt am ALB außerhalb von IAP).
- Ingress beider Web-Dienste auf `internal-and-cloud-load-balancing` gestellt, erst
  Staging, dann Prod; `run.app` antwortet seitdem mit 404, die Domains laufen unverändert.
- Der Schalter steht in `cloudbuild.yaml` und `cloudbuild-staging.yaml`, damit ihn kein
  Deploy zurücksetzt.
- `php artisan cron:audit` meldet einen Job mit `run.app`-Ziel als Fehler.

Nachgezogen am selben Tag: Der Screenshot-Lauf der Klickanleitungen, der bisher den
`run.app`-Umweg nutzte, geht jetzt regulär durch IAP — OIDC-Token des Dienstkontos
`klickanleitungen@…` gegen einen eigenen OAuth-Client (der von Google verwaltete Client
kann keinen programmatischen Zugang, Rezept in [KLICKANLEITUNGEN.md](KLICKANLEITUNGEN.md)).
Damit ist an Schritt 0 nichts mehr offen. Geprüft am 23.09.2026: Alle drei Web-Dienste
(Prod, Staging, Hilfe-Portal) haben Ingress nur über den Load Balancer; die beiden
Worker-Dienste stehen zwar auf `all`, liefern auf jeder Adresse aber nur ihre
Health-Antwort `{"status":"ok","service":"queue-worker"}` — keine Anwendung, keine Daten.

## Das Prinzip

**Ein PIN auf einem freigeschalteten Gerät ist stark. Derselbe PIN von irgendwo ist es
nicht.** Genau so arbeiten Kassensysteme: Der PIN ist kein Geheimnis, sondern die
Unterschrift — das Geheimnis ist, das Gerät in der Hand zu haben.

Drei Schichten:

| Schicht | Frage | Antwort |
|---|---|---|
| **Gerät** | Darf dieses Gerät überhaupt mit dem Hub sprechen? | Browser/Mac: Google-Konto via IAP. iOS-App: Freischaltung + Keychain-Geheimnis + App Attest |
| **Person** | Wer sitzt davor? | PIN oder Face ID |
| **Heikles** | Darf diese Person *das* jetzt tun? | Zusätzliche Bestätigung für Admin, Auszahlungen, Exporte (später) |

## Vier Clients, zwei Mechanismen

| Client | Vertrauensanker | Person | Erneuerung nötig? | Ändert sich etwas? |
|---|---|---|---|---|
| **Browser und PWA** | **Google IAP** wie heute | PIN oder E-Mail + Passwort | Google-Sitzung gelegentlich | **nein** |
| **Mac-App** (Electron) | **Google IAP** wie heute | PIN oder E-Mail + Passwort | Google-Sitzung gelegentlich | **nein** |
| **Institut-iPad** (geteilt) | Freischaltung per **MDM** (Miradore, Managed App Configuration) | PIN | **nie** | neu |
| **Persönliches iPhone/iPad** | Freischalt-Token einmalig, danach Geheimnis in der Keychain + **App Attest** | PIN oder Face ID | nur nach Neuinstallation | neu |

**Für das Büro ändert sich nichts.** `hub.glattt.com` bleibt hinter IAP, danach wie heute
PIN oder E-Mail und Passwort. Kein Token, kein QR, keine Freischaltung. Neu ist nur ein
Knopf zum Ausstellen von Freischalt-Tokens für Kolleginnen mit iPhone oder iPad. Die
einzige Bedingung dafür: Die Middleware aus Schritt 2 muss auf `hub.glattt.com` das
IAP-JWT (`x-goog-iap-jwt-assertion`, geprüft gegen Googles Schlüssel und die Audience des
Backend-Service) als Gerätenachweis akzeptieren — abgesichert durch einen Feature-Test,
sonst sperrt ein Fehler dort das Büro aus.

**Die Mac-App könnte später** denselben Token-Weg wie die iOS-App bekommen (Geheimnis per
`safeStorage` in der macOS-Keychain, Header an jede Anfrage, eigener Host), falls das
gelegentliche Google-Neuanmelden stört. Für Prüfer und Pilot ist das nicht nötig.

!!! warning "Die Mac-App hat heute keine Geräteidentität"
    Ihre „Geräte-ID" ist eine Zufalls-UUID im `localStorage`
    (`push-notifications.js`, `getNativeDeviceId()`). Als Etikett für Push-Abos reicht das;
    als Vertrauensanker taugt es nicht. Solange die Mac-App bei IAP bleibt, ist das
    unerheblich.

### Warum App Attest nur für iOS

**App Attest gibt es nur auf Apple-Betriebssystemen für nativ signierte Apps.** Die
iOS-App kann damit beweisen, dass eine Anfrage aus einer echten, unveränderten Kopie
*unserer* App auf einem echten Apple-Gerät kommt — das kann kein Skript nachbauen. Die
Mac-App ist Electron und kann es nicht; der Browser erst recht nicht. Deshalb bleiben
beide bei IAP.

### Warum keine Passkeys

Die erste Fassung dieses Plans sah Passkeys für Browser und Mac-App vor. Gestrichen am
23.09.2026 (Jan), aus vier Gründen:

1. **Ein Passkey ist ein Personen-Nachweis, kein Geräte-Anker.** Er wandert über den
   iCloud-Schlüsselbund auf alle Geräte der Person. Für Browser und Mac hätte der Plan
   damit sein eigenes Prinzip „Gerätevertrauen" still gegen „Personenvertrauen" getauscht.
2. **Er löst für das Büro kein Problem.** Die Büro-Nutzerinnen haben ein Google-Konto mit
   Googles eigener Zwei-Faktor- und Gerätepolitik — genau das prüft IAP. Ein Passkey wäre
   ein dritter Anmeldeweg neben PIN und Google.
3. **Passkeys in Electron sind unbestätigt.** Ob Electron auf macOS den plattformeigenen
   Authenticator (Touch ID) sauber anspricht, hätte erst ein Prototyp zeigen müssen.
4. **Auf einem geteilten Institut-iPad wären sie falsch** (Punkt 1) — dort also ohnehin
   nur MDM-Freischaltung und PIN.

## Die Freischaltung (Idee Jan, 23.09.2026)

Eine Person mit dem Recht `create_users` (in Prod: Admin und Büro) erzeugt im Hub einen
**Freischalt-Token**. Der lässt sich

- **abtippen** (kurze Zeichenfolge, genug Entropie für eine gebremste Einlösung),
- **scannen** (QR-Code — die App bringt seit Phase D einen Scanner mit),
- **per E-Mail verschicken**, mit einem Link, der direkt in die Registrierung führt.

Danach meldet man sich mit PIN oder Face ID an.

**Das löst das E-Mail-Problem.** Die ursprüngliche Überlegung war „einmalig E-Mail und
Passwort" — die hätte allen 21 Konten eine E-Mail-Adresse und ein Passwort abverlangt, und
19 davon haben beides nicht (siehe [Hub-Nutzerinnen ohne E-Mail](IOS-APP.md)). Beim
Token-Weg braucht **niemand** ein Passwort: Die Autorisierung liegt bei der Person, die
den Token ausstellt, und die E-Mail ist nur ein Transportweg, kein Zugangsdatum. Der
Apple-Prüfer bekommt einen Token zum Abtippen in den Review-Notizen.

**Wiederverwendbar:** `UserInvitation` (Token, `expires_at`, `accepted_at`, `invited_by`,
Mail-Vorlage `emails.user-invitation`) macht dasselbe schon für Konto-Einladungen. Der
Freischalt-Token sollte demselben Muster folgen, aber eine eigene Tabelle bekommen —
Gerätefreischaltung und Kontoeinladung sind verschiedene Dinge und dürfen sich nicht
gegenseitig ungültig machen.

### Was am Token festzulegen ist

| Eigenschaft | Vorschlag | Warum |
|---|---|---|
| Gültigkeit | kurz (Minuten bis wenige Stunden) | Zwischen „verschickt" und „gescannt" liegen Minuten, nicht Wochen |
| Verbrauch | einmalig, verfällt beim Einlösen | Ein zweites Gerät mit demselben Token wäre unbemerkt |
| Gerätetyp | **persönlich** oder **geteilt** wird beim Ausstellen gewählt | Ein geteiltes Institut-Gerät darf keine Biometrie bekommen |
| Rückmeldung | Aussteller bekommt eine Meldung beim Einlösen | „Wurde mein Token benutzt, und von wem?" |
| Widerruf | offene Token und freigeschaltete Geräte einzeln widerrufbar | Verlorenes Gerät, Person geht |

!!! danger "Die E-Mail ist der schwächste Punkt dieses Weges"
    Wer die Mail liest, kann ein Gerät freischalten — und braucht danach nur noch vier
    Ziffern. Drei Dinge entschärfen das: **kurze Gültigkeit**, **einmaliger Verbrauch**
    und **App Attest**, das verlangt, dass die Einlösung wirklich aus unserer App auf
    einem echten Apple-Gerät kommt. Ein abgefangener Token allein nützt dann nichts.

    Wo jemand daneben steht — Leitung richtet das Institut-iPad ein — ist der **QR auf dem
    eigenen Bildschirm** sicherer als jede Mail. Beide Wege sollte es geben.

### Für die Institut-iPads geht es ganz ohne Token

Die laufen über Miradore, und die App liest bereits Managed App Configuration (daher kennt
sie `sharedDevice`). Das MDM kann die Freischaltung **mitliefern**: kein Token, keine
E-Mail, kein Scan. Das Gerät ist vertrauenswürdig, weil euer MDM es ausrollt — und es muss
nie erneuert werden. Der Token-Weg bleibt für alles daneben: persönliche Geräte, BYOD, der
Apple-Prüfer.

## Lebensdauer — die Tretmühle vermeiden

Die wichtigste Anforderung (Jan): **Geräte dürfen nicht regelmäßig neu freigeschaltet
werden müssen.** Zwei Lebensdauern, die man nicht verwechseln darf:

- **Der Freischalt-Token** ist zum Verbrauchen da — kurz gültig, einmal benutzt, fertig.
  Den erneuert niemand.
- **Das Gerätevertrauen** soll halten, bis jemand es bewusst beendet.

### Die Regel, die das garantiert

**In der App niemals ein Cookie als Vertrauensanker.** Cookies in einem WKWebView sind
nicht verlässlich langlebig — Safaris Schutzmechanismen können sie kürzen, ein Aufräumen
des Datenspeichers löscht sie. Wer das Vertrauen dort ablegt, baut sich die Tretmühle ein.

Stattdessen: **ein langlebiges Geheimnis, daraus kurzlebige Nachweise.** Das Geheimnis
liegt in der Keychain; die App erzeugt daraus lautlos so oft eine Sitzung, wie nötig.
Stirbt ein Cookie, merkt das niemand.

Die Grundlage steht bereits richtig:

| | Stand |
|---|---|
| Keychain-Zugriffsklasse der App | `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` (`ios/glatttHub/Config/Keychain.swift`) — überlebt Neustarts und App-Updates, wandert nicht per Backup auf ein anderes Gerät |
| Gerätetoken serverseitig | Sanctum mit `'expiration' => null` — läuft nie ab |
| Benutzersitzung | `SESSION_LIFETIME` 120 Minuten — davon getrennt, und das ist richtig so |

### Was das Vertrauen beendet, und was nicht

| Ereignis | Neu freischalten? |
|---|---|
| App-Update über TestFlight oder Store | **nein** |
| Neustart, iOS-Update | **nein** |
| App gelöscht und neu installiert | ja |
| Gerät zurückgesetzt, oder Backup auf einem neuen Gerät | ja — und das soll so sein |
| Gerät verloren, Person verlässt das Unternehmen | ja, durch bewussten Widerruf |
| Zu viele PIN-Fehlversuche auf dem Gerät | ja — das Gerät verliert die Freischaltung |

!!! danger "Was wir nicht bauen dürfen"
    Eine Regel wie „Geräte laufen nach 90 Tagen ab". Das klingt nach Sorgfalt, erzeugt
    aber genau die Tretmühle und bringt wenig: Ein vergessenes Gerät räumt man besser
    gezielt weg — „Zuletzt benutzt" steht schon in der Geräteliste im Profil.

`ThisDeviceOnly` heißt außerdem: Ein Backup auf einem neuen iPhone bringt das Vertrauen
**nicht** mit. Das ist gewollt — sonst erbt ein wiederhergestelltes Backup den Zugang.
Praktisch: neues Gerät, einmal freischalten.

## Reihenfolge

Jeder Schritt hilft für sich und ist einzeln freizugeben.

| # | Schritt | Wirkung | Grober Aufwand | Stand |
|---|---|---|---|---|
| 0 | **Ingress schließen** — `run.app` nur noch über den Load Balancer, Scheduler-Jobs auf die Domains, Schalter in Cloud Build | IAP trägt wirklich alles, was das Büro nutzt | 0,5 Tage | **erledigt 23.09.2026** |
| 1 | **Freischalt-Code** (Tabellen, Ausstellen im Hub, QR + Mail + Link, Einlösen in der App, Widerruf, MDM-Schlüssel) | Geräte werden zu einer bewussten, protokollierten Entscheidung | 2–3 Tage | **umgesetzt 23.09.2026** — [APP-GERAETE-FREISCHALTUNG.md](APP-GERAETE-FREISCHALTUNG.md) |
| 2 | **Gerätenachweis erzwingen** — an jeder Anmeldung: IAP-JWT (verifiziert) oder freigeschaltetes Gerät; PIN-Bremse je Gerät, Sperre nach Fehlversuchen; Modus off/log/enforce | Der PIN-Dialog ist von außen nicht mehr erreichbar; das Büro merkt nichts | 2 Tage | **umgesetzt 23.09.2026** — Staging `enforce`, Prod `log` bis zur Freigabe |
| 3 | **App Attest** (iOS: Attestierung beim Einlösen, danach Assertions; Server: Prüfung) | Ein abgefangener Token nützt ohne echtes Gerät nichts | 2 Tage, heikel | **umgesetzt 23.09.2026** — Assertion-Pflicht für attestierte Geräte; `require_attestation` erst mit dem App-Host |
| 4 | **Eigener Host ohne IAP** für die App (`app.hub.glattt.com`) | Der Apple-Prüfer kommt herein — gefahrlos, weil 1–3 tragen | 1 Tag plus DNS/Zertifikat | **umgesetzt und geprüft 24.09.2026** — [unten](#schritt-4-der-app-host-ohne-iap) |
| 5 | **Prüfer-Konto** mit Token, wenigen Rechten und Testdaten; nach der Prüfung widerrufen | Custom-App-Prüfung möglich | 0,5 Tage | offen |
| später | **Mac-App auf den Token-Weg** (Keychain-Geheimnis per `safeStorage`, Header, App-Host) | nichts läuft mehr ab | 1–2 Tage | nur bei Bedarf |

Die Aufwände sind grob.

**IAP bleibt, wo es nichts kostet.** Für Browser, PWA und Mac-App auf `hub.glattt.com`
ist es die Schicht, die heute trägt. Nur der App-Host verzichtet darauf. Eine
funktionierende Schicht entfernt man nicht ohne Not.

## Schritt 4: Der App-Host ohne IAP

`app.hub.glattt.com` zeigt auf **denselben** Cloud-Run-Dienst wie `hub.glattt.com` — am
Load Balancer aber ohne Google IAP. Für das Büro ändert sich damit nichts; der Hauptname
bleibt, wie er ist.

### Warum ein zweiter Backend-Service

IAP ist eine Eigenschaft des **Backend-Services**, nicht des Hostnamens. Ein IAP-freier Weg
braucht deshalb einen eigenen Backend-Service — er darf aber auf dieselbe Serverless-NEG
zeigen, so wie es `backend-glattthub-prod-api` und `-public` längst tun (für `/api/*` und
die öffentlichen Pfade). Es entsteht also kein zweiter Server, keine zweite Datenbank,
keine zweite Revision.

| Objekt | Wert |
|---|---|
| Backend-Service | `backend-glattthub-prod-app` → NEG `neg-glattthub-prod`, **IAP aus** |
| Host-Regel | `app.hub.glattt.com` → Path-Matcher `app-matcher`, alles auf diesen Service |
| Zertifikat | `cert-glattthub-prod-app` (Google-managed), zusätzlich am `proxy-glattthub` |
| DNS | A-Record `app.hub` → **34.49.25.78** — im **KAS-Panel bei All-Inkl**, nicht in der Cloud |

!!! warning "DNS liegt nicht in der Cloud"
    `glattt.com` hat `ns5`/`ns6.kasserver.com`; die Cloud-DNS-API ist im Projekt nicht
    aktiviert. Ein Google-managed-Zertifikat wird erst `ACTIVE`, wenn der Name auf die
    Adresse des Load Balancers zeigt — der A-Record kommt also zuerst.

### Was den Host schützt

Ohne IAP ist der Gerätenachweis das Einzige. Deshalb gilt auf einem Host aus
`device_trust.app_hosts` **zweierlei, unabhängig vom globalen Modus** (Prod steht weiterhin
auf `log`, damit Browser und Mac-App nichts merken):

1. **Die Anmeldung wird immer erzwungen, und nur attestierte Geräte zählen.**
   `DeviceTrust::mode()` liefert dort `enforce`, `requiresAttestation()` gibt `true`. Ohne
   das stünde der PIN-Dialog offen im Netz — und dort trifft jeder Versuch mit
   [1 zu 476](#der-pin-ist-der-benutzername).
2. **Jede Anfrage braucht ein freigeschaltetes Gerät**, nicht nur die Anmeldung
   (`RequireTrustedAppHost`, Entscheidung Jan 23.09.2026). Auf `hub.glattt.com` braucht ein
   gestohlenes Sitzungs-Cookie zusätzlich eine Google-Anmeldung; hier gibt es die nicht.
   Wer den Hostnamen kennt, bekommt 403 — der Host ist von außen inhaltslos.

Zwei Listen in `config/device_trust.php` regeln die Ausnahmen:

| Liste | Inhalt | Warum |
|---|---|---|
| `app_host_public_paths` | `api/app/version`, `api/app/enroll`, `api/app/widgets/*`, `shared/*`, statische Dateien | Der Einstieg muss offen sein, sonst könnte sich nie ein Gerät freischalten. Widget- und Siri-Anfragen kommen aus dem Erweiterungs-Ziel, das den Schlüsselbund der App nicht liest — sie sind über ein Sanctum-Token mit eigener Fähigkeit geschützt. |
| `app_host_blocked_paths` | `admin*`, `forgot-password`, `reset-password*`, `google/*` → **404** | Die App braucht sie nicht. Das Admin-Backend bleibt hinter IAP; der Fortify-Passwortweg wäre ohne IAP nur ein Versandweg für Fremde (19 von 21 Konten haben gar keine E-Mail-Adresse). |

**Ein fehlender Eintrag in der ersten Liste sperrt die App aus.** Der Grund steht dann als
`Anfrage auf dem App-Host ohne freigeschaltetes Gerät` samt Pfad im Log. Eingeführt wird
deshalb mit `enforce` **bevor** die App auf den Host zeigt: Solange niemand ihn benutzt,
kann nichts brechen, und der erste App-Test zeigt jede Lücke im Log.

### Zwei Fehler, die dabei sichtbar wurden

**Der WebView-Cookie kam nie an.** Der Gerätenachweis reist zweigleisig: als Header
`X-Hub-Device` bei nativen Anfragen, als Cookie `glattthub_device` bei allem im WebView.
Den Cookie setzt die App selbst im WKWebView-Speicher, also unverschlüsselt — und Laravels
`EncryptCookies` macht aus jedem Cookie, der sich nicht entschlüsseln lässt, stillschweigend
`null`. Der Cookie-Weg funktionierte damit von Schritt 1 bis 24.09.2026 nicht. Es fiel nicht
auf, weil die Middleware bis dahin nur die Anmelde-POSTs prüfte und die aus nativem Code mit
Header kommen. Behoben mit `encryptCookies(except: [DeviceEnrollmentService::COOKIE])`; der
Wert ist ein Zufallsgeheimnis, das nur gegen seinen Hash geprüft wird. Der alte Test prüfte
die Middleware direkt auf einem selbst gebauten `Request` und sprang genau über die Stelle
hinweg — der neue Test geht durch den vollen `web`-Stack.

**Angehängte Middleware läuft nach `auth`.** Laravel sortiert die Middleware je Route nach
`$middlewarePriority`, und `Authenticate` steht dort; alles, was nur an `web` hängt, rutscht
dahinter. Das Gate kam nie zum Zug, man sah bloß die Umleitung zur Anmeldung. Dazu bringt
das Filament-Panel eine eigene Middleware-Liste mit, die die Gruppe `web` nicht enthält.
`RequireTrustedAppHost` ist deshalb **global** registriert.

### App-seitig: ein Hub, zwei Eingänge

`ios/glatttHub/Config/HubHosts.swift` streift ein führendes `app.` ab und vergleicht
darüber. Das war nötig, weil die App an drei Stellen exakt verglich:

- `DeviceEnrollment.matches` — sonst hätten sich **alle** Geräte des Pilotbetriebs für nicht
  freigeschaltet gehalten. Die Freischaltung gehört dem Hub, nicht dem Namen: Das Geheimnis
  liegt serverseitig in der Hub-Datenbank.
- `AllowedHosts.isHub` und `AppState.isHubURL` — Push-Nachrichten und Mails nennen weiterhin
  `hub.glattt.com` (die `APP_URL` des Hubs). Ohne Normalisierung hätte die App sie für fremd
  gehalten und an Safari übergeben, wo IAP steht.

`AppContainer.open()` schreibt eingehende URLs zusätzlich auf den konfigurierten Eingang um
— sonst liefe die Anfrage doch durch IAP. **`staging.` bleibt getrennt**; genau dafür war die
Host-Bindung gedacht (Staging- und Prod-Build teilen Schlüsselbund und Einstellungen, weil
sie dieselbe Bundle-ID haben).

### Reihenfolge der Umstellung

1. ✅ Code auf Prod (`DEVICE_TRUST_APP_HOSTS=app.hub.glattt.com`,
   `DEVICE_TRUST_APP_HOST_GATE=enforce` in `cloudbuild.yaml`).
2. ✅ A-Record im KAS-Panel auf 34.49.25.78.
3. ✅ Backend-Service, Zertifikat, Host-Regel am Load Balancer.
4. ✅ Von außen geprüft: Anmeldung/Hub-Seiten 403 `device_required`,
   `/api/app/version` 200, `/admin` und `/forgot-password` 404, statische Dateien 200;
   `hub`, `staging.hub` und `hilfe.hub` unverändert hinter IAP.
5. ✅ `HUB_BASE_URL` in `ios/Config/Base.xcconfig` auf `https://app.hub.glattt.com`.
6. Offen: Build hochladen, mit einem Gerät prüfen und das Log auf 403 durchsehen — erst
   dann den Pilotbetrieb umstellen.

!!! warning "Nach dem Umstellen muss jedes Gerät attestiert sein"
    Auf dem App-Host zählt nur ein attestiertes Gerät. Die App attestiert direkt nach dem
    Einlösen; scheitert das (Simulator, kein Netz), bleibt das Gerät freigeschaltet, aber
    unattestiert — die Anmeldung antwortet dann mit `attestation_required` und dem Hinweis,
    das Gerät neu freizuschalten. Jans iPhone und iPad sind attestiert; bei weiteren
    Pilot-Geräten ist das vor der Umstellung zu prüfen.

## Drei Bedingungen, damit es hält

1. **Der App-Host geht erst online, wenn Schritte 1 bis 3 fertig sind.** Vorher nicht,
   auch nicht für den Prüfer — ohne App Attest hinge alles an der Geheimhaltung des Tokens.
2. **Die PIN-Bremse zählt je Gerät statt je IP.** Nach zu vielen Fehlversuchen verliert
   das Gerät die Freischaltung und muss neu freigeschaltet werden.
3. **Widerruf wird benutzt.** Die Geräteliste im Profil ist nur dann ein Schutz, wenn bei
   Austritt und Verlust jemand das Gerät wirklich entfernt.

## Was vorher geprüft werden muss

1. **IAP-JWT-Prüfung im Backend.** Header `x-goog-iap-jwt-assertion`, Signatur gegen
   Googles öffentliche Schlüssel, Audience = Backend-Service-ID. Nur dann darf das
   Vorhandensein des Headers als Gerätenachweis gelten — ein nackter Header-Check wäre
   fälschbar, sobald jemand doch einmal am ALB vorbeikommt.
2. **App Attest nach Neuinstallation.** Der Attest-Schlüssel überlebt App-Updates, aber
   keine Neuinstallation. Das deckt sich mit dem Keychain-Geheimnis, kostet also keinen
   zusätzlichen Aufwand — muss aber im Ablauf abgefangen werden (stiller Neustart der
   Freischaltung statt Fehlermeldung).
3. **`/api/*` liegt außerhalb von IAP** und ist nur durch Sanctum-Token geschützt.
   Schritt 2 muss diesen Weg mitnehmen, sonst bleibt die Hintertür offen.
4. **Der Screenshot-Lauf der Klickanleitungen** verlor mit Schritt 0 seinen Zugang zu
   Staging; Ersatz per IAP-OIDC-Token ist seit 23.09.2026 in Betrieb
   (siehe [KLICKANLEITUNGEN.md](KLICKANLEITUNGEN.md)).

## Restrisiko, das bewusst bleibt

Der PIN bleibt vierstellig und ohne Namen (Entscheidung Jan, 23.09.2026). Auf einem
freigeschalteten Gerät heißt das: Wer das Gerät in der Hand hat, kann sich in *irgendein*
Konto raten — auch in eines mit mehr Rechten. Der Angriff aus dem Internet ist damit weg,
der Angriff aus dem eigenen Institut nicht. Face ID auf persönlichen Geräten mildert das;
auf dem Institut-iPad bleibt es — und das ist heute nicht anders.

Wer das später schließen will, hat zwei Wege, die den Ablauf kaum verändern:

- **Person antippen, dann PIN.** Die Sperre zählt dann je Person, und PINs müssen nicht
  mehr hubweit eindeutig sein.
- **Zusätzliche Bestätigung für Heikles** (Admin, Auszahlungen, Exporte) — der Alltag
  bleibt unberührt, nur die wenigen gefährlichen Stellen fragen nach.

## Verwandte Seiten

- [PIN-Login](PIN-LOGIN-SYSTEM.md) — der heutige Stand
- [Berechtigungssystem](BERECHTIGUNGSSYSTEM.md) — Rechte, u. a. `create_users`
- [iOS/iPadOS-App](IOS-APP.md) — Gerätetoken, Face ID, Push-Registrierung
- [Desktop-App (Electron)](DESKTOP-APP.md)
- [Cloud-Infrastruktur](CLOUD-INFRASTRUKTUR.md) — ALB, IAP und der Ingress-Befund
- [Cloud-Scheduler](CLOUD-SCHEDULER-SETUP.md) — Jobs nur noch über die Custom Domains
- [Security-Hardening](SECURITY-HARDENING.md)

## Chronik

- **23.09.2026** — Plan entstanden. Auslöser: Push-Befund im TestFlight-Pilot, dabei fiel
  auf, dass IAP die gesamte Absicherung trägt. Entscheidungen von Jan: PIN bleibt
  vierstellig ohne Namen; erst planen, nichts bauen. Freischaltung zunächst als „einmalig
  E-Mail und Passwort" gewählt, noch am selben Tag durch Jans **Token-Idee** ersetzt (kein
  Passwort nötig, QR oder Mail, Ausstellung über `create_users`).
- **23.09.2026, später** — Review der ersten Fassung: **Passkeys gestrichen**, Browser,
  PWA und Mac-App bleiben bei IAP (für das Büro ändert sich nichts), Gerätevertrauen nur
  für die iOS-App. Beim Review entdeckt: die `run.app`-Adressen umgingen IAP, Login-Seite
  von Prod und Staging offen — **Schritt 0** am selben Tag umgesetzt (Ingress nur über den
  Load Balancer, 16 Scheduler-Jobs umgehängt, Schalter in Cloud Build, `cron:audit` meldet
  `run.app`-Ziele).
- **23.09.2026, abends** — Schritt 1 gebaut (Freigabe Jan, Code-Format `XXXX-XXXX-XXXX`
  ohne 0/O/1/I/L): Hub-Seite „App-Geräte”, Einlösen in der App, QR-Scanner, MDM-Schlüssel.
  Befund dabei: Die Keychain überlebt eine Neuinstallation, das Vertrauen also auch — erst
  App Attest (Schritt 3) bindet an die Installation. Schritt 2 und 3 sind freigegeben.
- **23.09.2026, später** — Schritt 2 gebaut: Nachweis an jeder Anmeldung, IAP-JWT wird
  verifiziert (nicht nur gelesen), PIN-Bremse je Gerät, Sperre nach Fehlversuchen. Staging
  erzwingt, Prod protokolliert zunächst — Umstellung auf `enforce`, sobald das Log einige Tage
  keine echten Büro-Anmeldungen als „ohne Nachweis" zeigt. Abweichung vom Plan: Die Login-Seite
  (GET) bleibt erreichbar, geprüft wird nur, wo eine Sitzung entsteht.
- **23.09.2026, nachts** — Schritt 3 gebaut: App Attest mit Attestierung nach dem Einlösen
  und Assertion bei jeder Anmeldung, Prüfung gegen Apples Wurzel im Hub.
- **23.09.2026, spät** — Am echten Gerät bestätigt (Jan, Debug-Build gegen Staging):
  Vollbild „Gerät freischalten" vor der PIN (Variante A), QR-Scan, Anmeldung, Gerät steht
  als „attestiert" im Hub. Offen: Prod-Merge (zunächst Log-Modus), Freischaltung der
  Pilot-Geräte vor `enforce`, Klickanleitung, Schritt 4 und 5.
- **23.09.2026, abends** — Prod-Merge im Log-Modus (Revision `glattthub-web-00675-8x9`, später
  `00676-k8s`). Am Gerät nachgebessert: Freischaltung an den Hub-Host gebunden (Build 11), das
  Vollbild „Gerät freischalten" liegt über allem, auch über einer laufenden Sitzung (Build 12),
  Fehlerhinweis der Freischaltung deutlich größer (Build 13). Jans iPhone und iPad sind auf Prod
  freigeschaltet und attestiert. Geräteliste zeigt, wem ein Gerät gehört (Bezeichnung des Codes,
  zuletzt angemeldete Person). Schritt 0 vollständig abgeschlossen (Klickanleitungen-Zugang per
  Dienstkonto, `cron:audit` ohne `run.app`-Ziel). Weiter offen: Pilot-Geräte freischalten, dann
  `enforce` auf Prod, Klickanleitung „App-Geräte", Schritt 4 und 5.
- **24.09.2026** — **Schritt 4 gebaut** (Freigabe Jan). Der Code liegt auf Prod: auf einem Host
  aus `device_trust.app_hosts` gilt immer `enforce` samt Attestierung, und `RequireTrustedAppHost`
  bindet dort **jede** Anfrage an ein freigeschaltetes Gerät (Entscheidung Jan: nicht nur die
  Anmeldung). Zwei echte Fehler kamen dabei heraus: Der **WebView-Cookie** wurde von
  `EncryptCookies` still verworfen — der Cookie-Weg aus Schritt 1 funktionierte nie, aufgefallen
  erst, weil jetzt jede WebView-Anfrage einen Nachweis braucht; und **an `web` angehängte
  Middleware läuft nach `auth`** (Prioritätssortierung), weshalb das Gate global registriert ist.
  App-seitig fasst `HubHosts` beide Hostnamen zu einem Hub zusammen — ohne das hätten alle
  Pilot-Geräte ihre Freischaltung verloren und Push-Links wären in Safari gelandet. Offen ist nur
  noch Infrastruktur: A-Record im KAS-Panel, Zertifikat, Backend-Service und Host-Regel, danach
  `HUB_BASE_URL` der App.
- **24.09.2026, später** — App-Host live: A-Record (Jan), Backend-Service ohne IAP,
  Zertifikat, Host-Regel. Von außen geprüft, die drei bestehenden Hosts unverändert.
  Basis-URL der App umgestellt. Dabei fiel auf, dass **dieselbe Cookie-Falle** auch das
  Farbschema traf: Der Hub rendert `<html class="dark">` aus einem von JavaScript gesetzten
  Cookie, das `EncryptCookies` verwarf — sichtbar als weißes Aufblitzen von 17 bis 100 ms bei
  jedem `wire:navigate`, weil Livewires `replaceHtmlAttributes()` die Klasse entfernt, wenn
  die neue Seite sie nicht mitbringt. Behoben.
