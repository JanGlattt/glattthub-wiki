# Gerätevertrauen statt IAP — Plan

!!! info "Stand: Planung, nichts davon ist gebaut"
    Beschlossen am 23.09.2026 als **Vorlage zur Entscheidung** (Jan: „nur planen, nichts
    bauen"). Diese Seite hält fest, warum es den Umbau braucht, wie er aussehen soll und
    in welcher Reihenfolge. Jeder Schritt wird einzeln freigegeben.

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
den Hub heute wirklich schützt** — und `/api/*` liegt ohnehin außerhalb davon.

Daraus folgt der Zuschnitt: Es geht nicht darum, IAP zu ersetzen. Es geht darum, die
Anmeldung so stark zu machen, dass sie allein tragen kann. Danach ist IAP nur noch eine
zusätzliche Schicht, und die Prüferfrage wird zur Nebensache.

Nebenbei erklärt das auch, warum PINs hubweit **eindeutig** sein müssen
(`PinAuthenticationService::isPinTaken()`): Das ist keine Schrulle, sondern die zwingende
Folge daraus — und mit jeder neuen Kollegin wird der Raum enger.

## Das Prinzip

**Ein PIN auf einem freigeschalteten Gerät ist stark. Derselbe PIN von irgendwo ist es
nicht.** Genau so arbeiten Kassensysteme: Der PIN ist kein Geheimnis, sondern die
Unterschrift — das Geheimnis ist, das Gerät in der Hand zu haben.

Drei Schichten:

| Schicht | Frage | Antwort |
|---|---|---|
| **Gerät** | Darf dieses Gerät überhaupt mit dem Hub sprechen? | Freischaltung, je nach Gerätetyp verschieden |
| **Person** | Wer sitzt davor? | PIN, Passkey oder Face ID |
| **Heikles** | Darf diese Person *das* jetzt tun? | Zusätzliche Bestätigung für Admin, Auszahlungen, Exporte |

## Vier Clients, ein Prinzip, vier Mechanismen

Das Gerätevertrauen gilt **nicht nur für die iOS-App** (Hinweis Jan, 23.09.2026). Wer nur
die App absichert, hat zwei Sicherheitsmodelle — und das schwächere gewinnt.

| Client | Vertrauensanker | Person | Erneuerung nötig? |
|---|---|---|---|
| **Institut-iPad** (geteilt) | Freischaltung kommt per **MDM** (Miradore, Managed App Configuration) | PIN | **nie** |
| **Persönliches iPhone/iPad** | Freischalt-Token einmalig, danach Geheimnis in der Keychain + **App Attest** | PIN oder Face ID | nur nach Neuinstallation |
| **Mac-App** (Electron) | Passkey, sonst Freischalt-Token mit Geheimnis in der macOS-Keychain | Passkey oder PIN | **nie** |
| **Browser auf dem Mac** | **Passkey** (Touch ID) | derselbe Passkey | **nie** |

### Warum je Client etwas anderes

**App Attest gibt es nur auf Apple-Betriebssystemen für nativ signierte Apps.** Die
iOS-App kann damit beweisen, dass eine Anfrage aus einer echten, unveränderten Kopie
*unserer* App auf einem echten Apple-Gerät kommt — das kann kein Skript nachbauen. Die
Mac-App ist Electron und kann es nicht; der Browser erst recht nicht.

**Für Mac und Browser ist der Passkey das passende Mittel.** Er ist an die Hardware
gebunden (Secure Enclave), nicht abfischbar, ersetzt das Passwort vollständig — und vor
allem: **er läuft nicht ab.** Genau das war die Anforderung.

!!! warning "Die Mac-App hat heute gar keine Geräteidentität"
    Ihre „Geräte-ID" ist eine Zufalls-UUID im `localStorage`
    (`push-notifications.js`, `getNativeDeviceId()`), erzeugt beim ersten Start. Als
    Etikett für Push-Abos reicht das; als Vertrauensanker taugt es nicht — löschbar,
    kopierbar, frei erfindbar. Ein Geheimnis gehört über Electrons `safeStorage` in die
    **macOS-Keychain**.

## Die Freischaltung (Idee Jan, 23.09.2026)

Eine Person mit dem Recht `create_users` (in Prod: Admin und Büro) erzeugt im Hub einen
**Freischalt-Token**. Der lässt sich

- **abtippen** (kurze Zeichenfolge),
- **scannen** (QR-Code — die App bringt seit Phase D einen Scanner mit),
- **per E-Mail verschicken**, mit einem Link, der direkt in die Registrierung führt.

Danach meldet man sich mit PIN an.

**Das löst das E-Mail-Problem.** Die ursprüngliche Überlegung war „einmalig E-Mail und
Passwort" — die hätte allen 21 Konten eine E-Mail-Adresse und ein Passwort abverlangt, und
19 davon haben beides nicht (siehe [Hub-Nutzerinnen ohne E-Mail](IOS-APP.md)). Beim
Token-Weg braucht **niemand** ein Passwort: Die Autorisierung liegt bei der Person, die
den Token ausstellt, und die E-Mail ist nur ein Transportweg, kein Zugangsdatum.

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
| Gerätetyp | **persönlich** oder **geteilt** wird beim Ausstellen gewählt | Ein geteiltes Institut-Gerät darf keine Biometrie und keinen Passkey bekommen |
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

**Niemals ein Cookie als Vertrauensanker.** Cookies in einem WKWebView sind nicht
verlässlich langlebig — Safaris Schutzmechanismen können sie kürzen, ein Aufräumen des
Datenspeichers löscht sie. Wer das Vertrauen dort ablegt, baut sich die Tretmühle ein.

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

!!! danger "Was wir nicht bauen dürfen"
    Eine Regel wie „Geräte laufen nach 90 Tagen ab". Das klingt nach Sorgfalt, erzeugt
    aber genau die Tretmühle und bringt wenig: Ein vergessenes Gerät räumt man besser
    gezielt weg — „Zuletzt benutzt" steht schon in der Geräteliste im Profil.

`ThisDeviceOnly` heißt außerdem: Ein Backup auf einem neuen iPhone bringt das Vertrauen
**nicht** mit. Das ist gewollt — sonst erbt ein wiederhergestelltes Backup den Zugang.
Praktisch: neues Gerät, einmal freischalten.

## Reihenfolge

Jeder Schritt hilft für sich und ist einzeln freizugeben.

| # | Schritt | Wirkung | Grober Aufwand |
|---|---|---|---|
| 1 | **Freischalt-Token** (Tabelle, Ausstellen im Hub, QR + Mail + Link, Einlösen in der App, Widerruf) | Geräte werden zu einer bewussten, protokollierten Entscheidung | 2–3 Tage |
| 2 | **Gerätenachweis erzwingen** — Middleware, die ohne freigeschaltetes Gerät nichts ausliefert, auch nicht die Login-Seite; Geheimnis in Keychain bzw. `safeStorage` | Der PIN-Dialog ist von außen nicht mehr erreichbar | 2 Tage |
| 3 | **App Attest** (iOS: Attestierung beim Einlösen, danach Assertions; Server: Prüfung) | Ein abgefangener Token nützt ohne echtes Gerät nichts | 2 Tage, heikel |
| 4 | **Passkeys** für Mac-App und Browser | Passwort und IAP als Zugangsvoraussetzung entbehrlich, nichts läuft ab | 2–3 Tage, plus Vorprüfung |
| 5 | **Eigener Host ohne IAP** für die App (`app.hub.glattt.com`) | Der Apple-Prüfer kommt herein — jetzt gefahrlos, weil 1–3 tragen | 1 Tag plus DNS/Zertifikat |
| 6 | **Prüfer-Konto** mit Token und Testdaten | Custom-App-Prüfung möglich | 0,5 Tage |

Die Aufwände sind grob. Schritt 3 und 4 hängen an Dingen, die erst geprüft werden müssen
(siehe unten).

**IAP bleibt, wo es nichts kostet.** Für Browser und Mac-App auf `hub.glattt.com` ist es
eine zusätzliche Schicht, die niemanden stört. Nur der App-Host verzichtet darauf. Eine
funktionierende Schicht entfernt man nicht ohne Not.

## Was vorher geprüft werden muss

1. **Passkeys in Electron.** Chromium unterstützt WebAuthn, aber ob Electron auf macOS den
   plattformeigenen Authenticator (Touch ID) sauber anspricht, ist **nicht bestätigt**.
   Muss vor Schritt 4 an einem Prototyp gezeigt werden, sonst fällt die Mac-App auf den
   Token-Weg zurück.
2. **Passkeys wandern über die iCloud-Schlüsselbund.** Ein Passkey auf Jans Mac liegt
   damit auch auf seinem iPhone. Für persönliche Geräte praktisch, für ein **geteiltes**
   Institut-iPad falsch. Dort deshalb nie Passkeys — nur MDM-Freischaltung und PIN.
3. **App Attest nach Neuinstallation.** Der Attest-Schlüssel überlebt App-Updates, aber
   keine Neuinstallation. Das deckt sich mit dem Keychain-Geheimnis, kostet also keinen
   zusätzlichen Aufwand — muss aber im Ablauf abgefangen werden (stiller Neustart der
   Freischaltung statt Fehlermeldung).
4. **`/api/*` liegt schon heute außerhalb von IAP** und ist nur durch Sanctum-Token
   geschützt. Schritt 2 muss diesen Weg mitnehmen, sonst bleibt die Hintertür offen.

## Restrisiko, das bewusst bleibt

Der PIN bleibt vierstellig und ohne Namen (Entscheidung Jan, 23.09.2026). Auf einem
freigeschalteten Gerät heißt das: Wer das Gerät in der Hand hat, kann sich in *irgendein*
Konto raten — auch in eines mit mehr Rechten. Der Angriff aus dem Internet ist damit weg,
der Angriff aus dem eigenen Institut nicht.

Wer das später schließen will, hat zwei Wege, die den Ablauf kaum verändern:

- **Person antippen, dann PIN.** Die Sperre zählt dann je Person statt je IP, und PINs
  müssen nicht mehr hubweit eindeutig sein.
- **Zusätzliche Bestätigung für Heikles** (Admin, Auszahlungen, Exporte) — der Alltag
  bleibt unberührt, nur die wenigen gefährlichen Stellen fragen nach.

## Verwandte Seiten

- [PIN-Login](PIN-LOGIN-SYSTEM.md) — der heutige Stand
- [Berechtigungssystem](BERECHTIGUNGSSYSTEM.md) — Rechte, u. a. `create_users`
- [iOS/iPadOS-App](IOS-APP.md) — Gerätetoken, Face ID, Push-Registrierung
- [Desktop-App (Electron)](DESKTOP-APP.md)
- [Cloud-Infrastruktur](CLOUD-INFRASTRUKTUR.md) — ALB und IAP
- [Security-Hardening](SECURITY-HARDENING.md)

## Chronik

- **23.09.2026** — Plan entstanden. Auslöser: Push-Befund im TestFlight-Pilot, dabei fiel
  auf, dass IAP die gesamte Absicherung trägt. Entscheidungen von Jan: PIN bleibt
  vierstellig ohne Namen; erst planen, nichts bauen. Freischaltung zunächst als „einmalig
  E-Mail und Passwort" gewählt, noch am selben Tag durch Jans **Token-Idee** ersetzt (kein
  Passwort nötig, QR oder Mail, Ausstellung über `create_users`). Ergänzt um Jans Hinweis,
  dass Mac-App und Browser mitgedacht werden müssen.
