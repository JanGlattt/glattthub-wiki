# Kundenportal (my.glattt.com)

!!! info "Stand 01.10.2026"
    Etappen 1–4 und die Büro-Seite sind auf Prod, aber noch nicht erreichbar: my.glattt.com landet
    bis zur Einrichtung des eigenen Dienstes (siehe [Betrieb](#betrieb-einrichtung)) bei der
    Google-Anmeldung. Einladungen sind aus (`PORTAL_INVITATIONS_ENABLED=false`), bis die
    Rechtstexte vom Anwalt zurück sind. Die Klickanleitung zur Büro-Seite ist geplant.

## Für Endanwender

Vertragskunden bekommen mit ihren Vertragsunterlagen einen Einladungslink. Sie legen ein Passwort
fest, stimmen Nutzungsbedingungen und Datenschutzhinweisen zu und sehen danach:

- **Start:** nächster Termin und Fortschritt je Behandlungszone
- **Termine:** kommende und vergangene Termine mit Sitzungsbestätigung; verlegen bis 24 Stunden vorher
- **Vertrag:** bezahlt/offen je Vertrag, Raten, Einmalzahlung (beliebiger Betrag, auch Apple Pay),
  neue Bankverbindung mit unterschriebenem SEPA-Mandat, offene Forderungen bezahlen, Unterlagen als PDF
- **Kontakt:** eigene Anfragen an den Kundenservice mit Verlauf und Antwortfeld (seit 09.10.2026,
  nach dem Stichtag der Zendesk-Ablösung), neue Nachricht, abgeschlossene Anfragen eine Seite dahinter,
  WhatsApp ans Institut
- **Profil:** Zustimmungsbelege, Passwort ändern, Konto löschen

Im Hub erledigt das Büro unter **Betrieb → Kundenportal** die Aufträge, die daraus entstehen:
Einmalzahlungen von hinten auf die Raten verteilen, neue Bankverbindungen übernehmen oder ablehnen,
nicht zugestellte Nachrichten erneut senden, Konten sperren und Einladungen neu senden. Zu jedem
Auftrag kommt eine Mitteilung (Modul „Kundenportal“ im Benachrichtigungs-Katalog). GoCardless wird
dabei nie automatisch angefasst.

Seit 02.10.2026 ist die Büro-Seite ein **Posteingang mit Kontext** (Entwurf A). Er steht im Web und
nativ in der glatttHub-App auf iPhone und iPad. Zu jedem Auftrag zeigt die Seite Restbetrag, nächste
Rate und offene Forderungen. Bei Bankverbindungen steht die bisherige neben der neuen, dazu kommen
automatische Prüfpunkte. Abgelehnt wird mit Grund, und die Kundin erfährt ihn auf Wunsch per E-Mail
und Mitteilung. Erledigtes bleibt 30 Tage im Reiter „Erledigt“ sichtbar, Konten lassen sich durchsuchen.
Die Zahl offener Aufträge steht am Menüpunkt.

## Für Entwickler

### Web-Portal im Look der App (02.10.2026)

Entwurf A (Jan, 02.10.2026). Ab 900 px Seitenleiste wie die iPad-Fassung von My glattt (Profil mit Punkt
für ungelesene Mitteilungen unten), darunter genau die App mit schwebender Tab-Leiste: Start, Termine,
Freunde, Paket, Kontakt.

- **Farben** als Variablen `--mg-*` auf `.portal-app` (Abschnitt „KUNDENPORTAL im Look der App“ in
  `theme_glattt.css`), Werte aus `ios/MyGlattt/Design/Theme.swift`, Dunkelmodus über `.dark`.
- **Startseite**: Begrüßung mit Profilbild (`portal.partials.avatar`), dunkle Terminkarte mit „Verlegen“
  (Schalter `reschedule_enabled`) und „In Kalender“ (`webcal://`-Abo, Schalter `calendar_enabled`),
  Paket-Karte aus `PortalPaymentService::overview`, Körperfigur `portal.partials.body-zones`. Die Figur
  nutzt die Hub-Grafiken `public/images/koerperzonen` als CSS-Masken in Gold (je Zone eine Klasse
  `portal-body-zone-<key>`), der Ring ist ein SVG mit `stroke-dasharray`.
- **Freunde werben im Web** (`/freunde`, `PortalFriendsController`): dieselben Daten wie die App über
  `PortalReferralData`, QR-Code serverseitig mit `chillerlan/php-qrcode` (kommt mit Filament), Zustimmung
  zu den Teilnahmebedingungen vor dem Werben (M92), Prämienkonto über das Auftragsbuch.
- **Hinweis auf die App** im Handy-Browser nur, wenn `PORTAL_IOS_APP_URL` gesetzt ist; ausgeblendet per
  `localStorage` (`mg-app-banner-hidden`).

### Büro-Seite „Posteingang mit Kontext“ (02.10.2026)

- **Endpunkte** (Recht `manage_customer_portal`, Übernehmen/Verteilen zusätzlich `manage_gocardless`):
  `GET /hub/kundenportal/data` (Aufträge mit `context`, `previous`, `checks`, dazu `reject_reasons`),
  `GET /hub/kundenportal/verlauf?q=` (30 Tage), `GET /hub/kundenportal/konten?q=&status=&page=` (50 je Seite).
  Dieselben Endpunkte nutzt die native Seite (`ios/glatttHub/CustomerPortal/`).
- **Prüfpunkte** (`PortalOfficeService::mandateChecks`): IBAN-Prüfsumme, gleiche IBAN wie bisher,
  Kontoinhaber:in = Kundin bzw. abweichender Zahler, Unterschrift vorhanden, Rate in den nächsten 5 Tagen
  (könnte noch übers alte Konto laufen). Die Punkte sind nur Hinweise und sperren nichts.
- **Ablehnen**: `reason` (`signature`/`holder`/`iban`/`other`) + optional `note`; Text aus
  `PortalOfficeService::REJECT_REASONS` geht an die Kundin, wenn `notify` gesetzt ist — Mail-Vorlage
  `bank_rejected` (Admin „Kunden-App · E-Mails“) und Push-Anlass `bank_rejected` (wichtig, kommt
  immer; wie alle Anlässe zunächst **aus**).
- **Passwort-Link senden** (06.10.2026, M100): `POST /hub/kundenportal/konten/{account}/passwort-link`
  schickt aktiven Konten einen Link an die Login-Adresse — ohne Geburtsdatum, weil das Büro die
  Kundin kennt (`PortalPasswordResetService::sendByOffice`, frischt dabei das Profil auf und hebt die
  Rücksetz-Sperre auf). Web-Knopf in der Kontenliste, nativ im ⋯-Menü der Konten.
- **Zahl am Menüpunkt**: `PortalOfficeService::openCount()` (60 s Cache, nach jeder Aktion verworfen),
  als Komponente `<x-customer-portal-badge />` — ein `@if` im Gruppen-Markup der Seitenleiste bricht
  `SidebarNavGroupTest`.

### Architektur: eigener Dienst ohne Fremdschlüssel

Entscheidung Jan 01.10.2026: *„Mir ist Sicherheit sehr wichtig. Kein Einfallstor bieten!“* Das
Portal läuft deshalb als **eigener Cloud-Run-Dienst `glattthub-portal`** aus demselben Image wie der
Hub, gestartet mit `PORTAL_MODE=true` und `/entrypoint-portal.sh` (ohne Migrationen).

```mermaid
flowchart LR
    K[Kunde] -->|my.glattt.com| LB[Load Balancer\nohne IAP]
    LB --> P[glattthub-portal\nPORTAL_MODE]
    P -->|DB-Benutzer glattthub_portal\nMinimalrechte| DB[(Cloud SQL)]
    P -.->|Datenzeilen| OB[(portal_outbox)]
    W[Hub-Worker\nportal:outbox --loop] --> OB
    W --> EXT[Phorest · Zendesk · SMTP · Push]
    K -->|Übergabe /shared/kundenportal| H[Hub glattthub-web]
    H --> M[Mollie · Buchungsseite · Bezahlseite]
```

| | Hub (`glattthub-web`/`-worker`) | Portal (`glattthub-portal`) |
|---|---|---|
| Routen | alles | nur `portal.*` und `/up` |
| DB-Benutzer | `glattthub_user` | `glattthub_portal` (Grants unten) |
| `APP_KEY` | Hub | eigener (`portal-app-key`) |
| `PORTAL_DATA_KEY` | ja | ja (`portal-data-key`) |
| Phorest, Mollie, Zendesk, SMTP, GoCardless, Push | ja | **nein** |
| Sitzungen/Cache | `sessions`/`cache` | `portal_sessions`/`portal_cache` |
| Warteschlange | `jobs` | keine (`queue.default = null`) |

**`App\Support\PortalMode`** setzt im Portal-Modus die Laufzeit-Konfiguration im Code (nicht über
Env, damit sie nicht falsch gesetzt werden kann) und entfernt nach dem Start jede Route, die nicht
`portal.*` heißt — auch, was Pakete selbst anmelden (Livewire, Sanctum, `storage/{path}`).
`bootstrap/app.php` lädt im Portal-Modus nur `routes/portal.php`, `bootstrap/providers.php` lässt das
Filament-Panel weg. `PortalServiceIsolationTest` startet `route:list` im Portal-Modus in einem eigenen
Prozess und bricht bei jeder fremden Route.

**`PortalHostGate`** (global): im Portal-Dienst nur Portal-Routen; im Hub auf Prod werden
Portal-Routen gar nicht bedient (sie bleiben nur für `route()` registriert, z. B. Links in Mails),
lokal und auf Staging liefert der Hub das Portal zum Testen selbst aus.

### Wie das Portal ohne Schlüssel auskommt

1. **Auftragsbuch `portal_outbox`** — das Portal schreibt reine Datenzeilen, der Hub-Worker
   (`portal:outbox --loop`, Programm in `docker/supervisord-worker.conf`) arbeitet sie ab
   (`PortalOutboxProcessor`):

    | Typ | Auslöser im Portal | Hub tut |
    |---|---|---|
    | `contact` | Nachricht senden | Zendesk-Ticket; bei Fehler Aufgabe + Mitteilung fürs Büro |
    | `password_reset` | „Passwort vergessen“ mit passendem Geburtsdatum | Mail mit Link; Klartext-Link danach aus der Zeile gelöscht |
    | `password_reset_check` | „Passwort vergessen“ **ohne** Treffer (höchstens eine offene je Konto) | Geburtsdatum frisch aus Phorest (`refreshProfile`), Vergleich mit dem Prüfwert im `payload`; bei Treffer Link anlegen und Mail schicken, sonst still |
    | `refresh` | Kopie älter als 10 Minuten | Profil + Termine aus Phorest, maskierte IBAN, fehlende PDFs |
    | `pdf` | PDF fehlt noch | PDF erzeugen |
    | `mandate_requested` | neue Bankverbindung | Mitteilung ans Büro |

    Jede ID im `payload` muss zum Konto der Zeile gehören, sonst wird der Auftrag verworfen
    (`error`). Aufträge werden atomar übernommen (`attempts`), nach 5 Fehlversuchen `failed`.
    **Nie die gemeinsame `jobs`-Tabelle aus dem Portal** — serialisierte Jobs würden im Hub-Worker
    entpackt und könnten dort Code ausführen.

2. **Übergaben im Browser** (`PortalHandoffService`, `Shared\PortalHandoffController`):
   Das Portal leitet den Kunden auf den Hub weiter, der erst nach eigener Prüfung handelt.
    - `/shared/kundenportal/zahlung/{uuid}` — Einmalzahlung: Betrag ≤ offene SEPA-Raten (neu
      gerechnet), Vertrag gehört zum Kunden, höchstens 15 Minuten alt → Mollie-Kasse. Rückkehr auf
      `my.glattt.com/zahlung/{uuid}`; den Status trägt der Mollie-Webhook im Hub ein
      (`ProcessPortalPaymentJob` → `PortalHandoffService::sync`).
    - `/shared/kundenportal/{uuid}` — `reschedule` (Termin live in Phorest geprüft →
      `BookingShareToken` mit `source=portal`) oder `debts` (Sammel-Bezahllink wie im
      Forderungsmanagement). Einmalig, 15 Minuten gültig.

3. **Kopie am Konto** (`PortalSnapshotService`, nur im Hub): `customer_accounts` trägt `first_name`,
   `last_name`, `gender`, `customer_number`, `home_branch_id`, `birth_date_hash` (HMAC des
   Geburtsdatums mit dem Datenschlüssel — das Portal vergleicht nur Prüfwerte) und `snapshot`
   (Termine, `iban_masked` je Vertrag). Beim Einladen wird das Profil sofort angelegt.

### Anfragen an den Kundenservice — „Kontakt wird Postfach“ (09.10.2026)

Entscheidung Jan (Entwurf 1, Umfang „App/Portal + E-Mail“): Die Kundin sieht im Web und in My
glattt ihre Tickets — alle mit ihrer Kunden-ID **oder** ihrer E-Mail-Adresse, ohne
Forderungsmanagement, ohne Schattenbetrieb, aus dem Zendesk-Import nur Tickets mit eigener
Nachricht. Sie sieht **nur** Nachrichten von ihr und an sie: nie interne Notizen, Ereignisse,
Teams, Prüfungen oder Zuständige; von Kolleginnen nur den Vornamen.

**Architektur — Hub schreibt, Portal liest.** Der Portal-Dienst hat keine Rechte auf
`support_*` (Architektur B). Der Hub baut mit `PortalSupportSnapshot` eine bereinigte Kopie
`snapshot.support` am Kundenkonto (`items` mit `number`, `subject`, `state`, `messages` →
`direction` in/out, `author`, `body`, `attachments` mit signierten Links
`/shared/kundenservice/anhang/{id}` über 30 Tage). `PortalSupportSyncObserver` zieht sie nach
jeder Nachricht und jeder Statusänderung sofort nach; `PortalSnapshotService::refresh` baut sie
bei jeder Zehn-Minuten-Auffrischung mit. Vor dem Stichtag (`SupportMode::usesHub()` falsch) ist
`support` `null`, und Web wie App zeigen nur das Formular wie bisher.

**Zustände für die Kundin** (`PortalSupportSnapshot::STATE_*`): `received` Eingegangen,
`in_progress` In Bearbeitung, `replied` Antwort erhalten (Hub `pending` oder letzte Nachricht
von uns), `solved` Gelöst, `closed` Abgeschlossen. Offen = die ersten drei; Abgeschlossen
(höchstens 50 in der Kopie) liegt eine Seite dahinter.

**Antwort der Kundin.** `portal_contact_requests` mit `support_ticket_number` → Auftrag
`contact` → `PortalContactService::replyInHub()`: Eingang ans Ticket (gelöst öffnet wieder, wie
eine Mail), bei geschlossen ein Folgeticket (`follow_up_of_id`), bei einem Ticket, das der
Kundin nicht gehört, eine neue Anfrage — nie an ein fremdes Ticket. `PortalSupportData` (läuft im
Portal) legt noch nicht zugestellte Nachrichten über die Kopie: eine neue Nachricht erscheint
sofort als Anfrage „Eingegangen“ (`key` = `p<id>`), eine Antwort sofort im Verlauf („wird
gesendet“); Zuordnung über `message_id = portal-<id>@glattt.com` → `portal_request_id`. Dieselbe
Bremse wie beim Formular (5 je Stunde), gleiche Sperre über `contact_enabled`.

| Endpunkt | Zweck |
|---|---|
| `GET /kontakt` (Web) | Kontakt-Seite: offene Anfragen, Formular, WhatsApp |
| `GET /kontakt/anfragen/{key}`, `POST …/{nr}/antwort` (Web) | Verlauf als Chat, Antwort |
| `GET /kontakt/anfragen/abgeschlossen` (Web) | Abgeschlossene nach Jahr |
| `GET /api/app/v1/kontakt` | wie bisher, plus `requests` (offene Anfragen, `closed_count`) |
| `GET …/kontakt/anfragen` (`?aktualisieren=1`) | offene Anfragen frisch vom Hub |
| `GET …/kontakt/anfragen/{key}`, `POST …/{nr}/antwort` | Verlauf, Antwort (liefert den Verlauf zurück) |
| `GET …/kontakt/anfragen/abgeschlossen` | abgeschlossene Anfragen |
| `GET /shared/kundenservice/anhang/{id}` (Hub, signiert, ohne IAP) | Anhang einer Antwort |

Die Mitteilung „Antwort vom Kundenservice“ trägt `data.ticket`; die App öffnet damit direkt den
Verlauf (`PushRouter.Opened.ticket`). App: `ContactView` (Liste, iPad mit Verlauf rechts),
`SupportRequestView` (Chat, Antwortzeile, Anhänge), `ClosedRequestsView`,
`NewContactMessageSheet`, `AttachmentPicker`.

**Anhänge der Kundin (10.10.2026, M103):** bis zu drei Bilder oder PDFs je Nachricht (je 10 MB), im Web
als `files[]` am Formular, in der App als Multipart (`APIClient.uploadMultipart`, Galerie-Bilder vorher als
JPEG mit 2000 px). Der Portal-Dienst darf nicht in den Bucket schreiben, deshalb reisen die Dateien als Base64
im Auftrag `contact` mit; der Hub legt sie wie Antwort-Anhänge ab (`support/<ticket>/<message>/…` auf
`SupportAttachment::storageDisk()`) und leert den Auftrag danach. `PortalSupportSyncObserver` reagiert auch
auf neue Anhänge, damit die Kopie sie zeigt. Tests: `PortalSupportRequestsTest`.

### Datenmodell

| Tabelle | Zweck |
|---|---|
| `customer_accounts` | Konto je Phorest-Kunde (Guard `customer`), Profil und Kopie (s. o.) |
| `customer_invitations` | Einladungslinks (Hash), 14 Tage, einmalig |
| `customer_password_resets` | Reset-Links (Hash), 30 Minuten |
| `portal_legal_documents` / `customer_consents` | Fassungen der Rechtstexte und Zustimmungsbelege |
| `portal_contact_requests` | Nachrichten an den Kundenservice; mit `support_ticket_number` eine Antwort auf eine bestehende Anfrage |
| `portal_payments` | Einmalzahlungen (Mollie), `applied_at` = vom Büro verteilt |
| `portal_mandate_requests` | neue Bankverbindungen; IBAN, Inhaber, Unterschrift mit `PortalEncrypted` |
| `portal_outbox` | Auftragsbuch Portal → Hub |
| `portal_sessions`, `portal_cache`, `portal_cache_locks` | nur Portal-Dienst |

`PortalEncrypted` verschlüsselt mit `PORTAL_DATA_KEY` (`PortalCrypt`); Einträge von vor dem
01.10.2026 (App-Key) entschlüsselt nur der Hub. Im Portal-Dienst ohne `PORTAL_DATA_KEY` bricht jede
Ver-/Entschlüsselung ab, statt still den Portal-App-Key zu nehmen.

### Fallstricke

- **Neue Portal-Abfrage auf eine neue Tabelle braucht einen GRANT** in
  `glattthub/docker/portal-db-grants.sql` — die Tests laufen mit vollen Rechten, auf Prod gäbe es
  einen 500er. Die Liste wurde aus allen SQL-Abfragen innerhalb von Portal-Anfragen der Tests
  ermittelt.
- **Portal-Code darf keinen Fremddienst aufrufen.** Braucht eine Funktion Phorest, Mollie & Co.,
  wird daraus ein Auftrag oder eine Übergabe.
- **Tests, die nach einem Portal-Aufruf den Hub aufrufen**, brauchen den vollen Host
  (`http://localhost/shared/…`): Laravel hängt relative Pfade an den zuletzt benutzten Host, und das
  Tor sperrt Hub-Routen auf dem Portal-Host.
- **Geburtsdatum kommt nur über den Abgleich ans Konto** (`refreshProfile` beim Einladen und bei jeder
  Auffrischung der angemeldeten App). Ein Konto, dessen Geburtsdatum erst später in Phorest
  eingetragen wurde und das sich nicht mehr anmelden kann, konnte deshalb bis 06.10.2026 nie
  zurücksetzen (Henne-Ei, App-Review-Prüfkonto, M100). Seitdem bestellt jeder Fehlversuch die
  Nachprüfung `password_reset_check`; die Antwort an die Kundin bleibt neutral.
- **Login-Adresse ≠ Phorest-Adresse**: `customer_accounts.email` ist die Anmeldung. Der Abgleich
  überschreibt sie nie; nur vor der Aktivierung zieht die Einladung die Phorest-Adresse nach.
- `customer_accounts`: Das Portal darf nur Anmelde-Spalten ändern (Spalten-GRANT), nie
  `phorest_client_id` — sonst ließe sich ein Konto auf einen fremden Kunden umbiegen.

### Kunden-App „My glattt“ (iOS/iPadOS)

Erster Aufschlag 01.10.2026 nach Entwurf A (gleiche fünf Reiter wie das Web). Ziel `MyGlattt` im
iOS-Projekt (`ios/MyGlattt/`, Bundle `com.glattt.app`), vollständig nativ: Anmeldung mit Face ID,
Zustimmung, Start mit Körper-Illustration der Vertragszonen (`zone-<key>` wie im Hub), Termine mit
nativem Verlegen, Vertrag mit Einmalzahlung (Vorschau „von hinten“), Kasse im schlichten WebView
(Apple Pay), neues Mandat mit Unterschrift (PencilKit), Unterlagen als PDF (QuickLook), Kontakt,
Profil mit Passwort und Konto löschen.

| Endpunkt (Portal-Host) | Zweck |
|---|---|
| `POST /api/app/v1/anmelden` | Token ausstellen (`portal_access_tokens`, nur Hash, 90 Tage gleitend) |
| `GET /api/app/v1/ich`, `POST …/zustimmung` | Konto, fehlende Zustimmungen |
| `GET …/uebersicht`, `…/termine`, `…/zahlungen`, `…/unterlagen`, `…/kontakt` | Daten wie im Web |
| `POST …/termine/{id}/verlegen` | Übergabe → Hub `/api/shared/kundenportal/{uuid}` → `/api/shared/booking/{token}` |
| `POST …/vertrag/{id}/einmalzahlung`, `GET …/zahlung/{uuid}` | Kasse starten, Status abfragen |
| `GET …/vertrag/{id}/mandat`, `POST …/bankverbindung` | Mandatstext, neues Mandat |

Die App-Gruppe läuft ohne `web`-Middleware (keine Sitzung, kein CSRF), Name `portal.app.*`.
`/api/shared/booking/{token}/buchen` prüft den gewählten Slot frisch gegen die Suche; die Raum-ID steht
nur kodiert im Slot-Schlüssel und wird beim Buchen gegen die Suche geprüft. Staging-Builds melden sich einmal per Google
(IAP) im WebView an. TestFlight: `ios/scripts/testflight-upload.sh myglattt` (Staging) bzw.
`myglattt-prod`; der App-Datensatz in App Store Connect wird einmal von Hand angelegt.

#### App-Kasse K2 (03.10.2026)

Trinkgeld, Einmalzahlung und Forderungen öffnen in der App kein Vollbild mit Mollie mehr, sondern ein
**natives Blatt** mit Zweck und Betrag; darunter lädt ein WebView die **App-Kasse des Hubs** — dieselben
Seiten wie im Browser mit `?kasse=app` (Vorlage `shared/app-checkout`, Inhalt
`livewire/shared/partials/app-checkout`). Seit 04.10.2026 (TestFlight M96/M97, Jan) in der Bauart
der Gutscheinseite: Zahlarten als **2×2-Kacheln** (`.payment-method-grid` in den App-Farben),
Apple Pay vorgewählt, wenn das Gerät es kann, darunter **ein** Bezahlknopf passend zur Wahl
(„Mit  Pay bezahlen“ bzw. „… € bezahlen“), Kartenfelder (Mollie Components) klappen über dem
Knopf auf; alles am **unteren Rand** des Blatts. Kein Logo, durchsichtiger Grund, Gold der App,
Hell/Dunkel nach Gerät. **Fallstrick:** Das Theme färbt `html` mit `--bg-primary` — ohne
`html:has(> .app-checkout-body) { background: transparent }` stand die Kasse weiß im beigen Blatt,
obwohl WebView und `body` durchsichtig waren.

| Zahlung | Einstieg (`checkout_url` aus der App-API) | Rücksprung, den die App abfängt | Status |
|---|---|---|---|
| Trinkgeld | `/shared/danke/{token}?betrag=…&app=1&kasse=app` → `TipPaymentPage(appCheckout)` | `/shared/danke/trinkgeld/{uuid}` | `…/status` |
| Einmalzahlung | `/shared/kundenportal/zahlung/{uuid}?kasse=app` → `PortalPaymentCheckoutPage` | `my.glattt.com/zahlung/{uuid}` | `GET /api/app/v1/zahlung/{uuid}` |
| Forderungen | `/shared/kundenportal/{uuid}?kasse=app` → Bezahllink `/shared/pay/{token}?kasse=app` → `DebtPaymentPage(appCheckout)` | `/shared/pay/return/{uuid}` | `…/status` |

- Die Einmalzahlung legt die Mollie-Zahlung jetzt erst beim Klick an
  (`PortalHandoffService::startPayment()` mit Karte, Apple-Pay-Token oder Methode; Lastschrift nie);
  ohne `kasse=app` bleibt der alte Weg (Mollies Auswahlseite) für das Web-Portal und ältere Builds.
- **Apple Pay im WebView** funktioniert nur, solange die App **kein Skript einschleust** (kein
  `WKUserScript`, kein `evaluateJavaScript`). Deshalb erkennt die App das Ende nur am Rücksprung
  und fragt den Status nativ ab.
- Tests: `PortalPaymentsTest::test_app_kasse_der_einmalzahlung_mit_vorgewaehlter_zahlart`,
  `DebtPaymentLinkTest::test_app_kasse_…`, `TreatmentFeedbackTest::test_app_kasse_trinkgeld_…`.

#### Onboarding, Profilbild und Mitteilungen (01.10.2026)

Einmal für alle (Entwurf 1 „Kartenstapel“, `AppOnboarding`): Willkommen → Face ID → Mitteilungen →
Profilbild → Fertig, jeder Schritt freiwillig, im Profil als „Einrichtung fortsetzen“ wieder
aufrufbar. Danach startet die App mit Token und Face ID direkt in die Sperre (kein Login-Bildschirm).

- **Profilbild:** Frontkamera mit runder Maske und Vision-Gesichtserkennung (`CameraCapture`),
  3-2-1 und Blitz, oder aus den Fotos; Zustimmung als Kästchen (Wortlaut
  `ClientProfilePhotoService::CONSENT_TEXT`, auch in `client_profile_photos.consent_text`
  gespeichert). Upload `POST /api/app/v1/profil/foto` (multipart, JPEG 900 px) → Auftragsbuch
  `profile_photo` (Base64, nach Ablage geleert) → Hub schneidet quadratisch auf 800 px, legt es auf
  `gcs-private` ab. Löschen `DELETE /profil/foto`.
- **Anzeige:** App über signierte Links `/shared/kundenfoto/{uuid}` (30 Tage, in `snapshot.profile_photo_url`
  und `referrals.referred_by.photo_url` — geworbene Freundinnen sehen das Bild ihrer Werberin). Hub über
  `/hub/clients/{id}/foto` (Recht `view_clients`): Terminansicht, Vertrag (Übersicht + Seitenleiste),
  globale Suche (Kunden-Treffer, rund statt Symbol), Kundenübersicht (Avatar vor dem Namen),
  Kunden-Detailseite (Avatar im Seitenkopf, antippen öffnet die Lightbox `lightbox-glattt`),
  glatttHub-App Kundenliste/Kundenakte/Termin/Vertrag/Terminsuche (`clientPhoto()`); überall bleiben
  die Initialen der Rückfall. Felder: `photo_url` (App-Schnittstellen) bzw. `photoUrl` (Phorest-nahe JSONs).
  Listen holen die Links **gesammelt** (`ClientProfilePhoto::hubUrls()`, ein Query je Antwort):
  `ClientSearchService::withPhotoUrls()` hängt `photoUrl` an `/hub/clients/search` (auch Live-Rückfall)
  und `/phorest/clients`, `GlobalSearchService` an lokale und Phorest-Kundentreffer.
- **Mitteilungen:** Erlaubnis erst nach Erklärung; Token per `POST /geraet` → Auftrag `device` →
  `customer_devices` (Debug `development`, sonst `production`). Welche Anlässe senden, plant Jan später
  ([[my-glattt-push-ideen]] im Projektwissen).

## Betrieb: Einrichtung

Einmalig, von Jan im Terminal (der Claude-Klassifizierer blockt Infrastruktur-Änderungen):

1. **Secrets** `portal-data-key`, `portal-app-key`, `db-portal-password` (zufällig erzeugt, nie angezeigt).
2. **Dienstkonto** `glattthub-portal@glattthub.iam.gserviceaccount.com`: `secretAccessor` nur auf die
   drei Secrets, `cloudsql.client`, Bucket `glattthub` nur `objectViewer` mit Bedingung
   `resource.name.startsWith("projects/_/buckets/glattthub/objects/uploads/form-submissions/")`.
3. **Hub** (Web + Worker, Prod + Staging) bekommt `PORTAL_DATA_KEY` aus `portal-data-key`.
4. **DB-Benutzer** `glattthub_portal` anlegen, nach der Migration `2026_10_01_130000` die Rechte aus
   `docker/portal-db-grants.sql` vergeben.
5. **Load Balancer:** Serverless-NEG `neg-glattthub-portal` → Dienst `glattthub-portal`, am
   Backend `backend-glattthub-prod-portal` (ohne IAP) statt `neg-glattthub-prod`.
6. **Dienst `glattthub-portal`** einmalig anlegen (Image aus dem letzten Prod-Build,
   `--command=/entrypoint-portal.sh`, Dienstkonto aus 2., `--ingress=internal-and-cloud-load-balancing`,
   Env `PORTAL_MODE=true`, `APP_URL=https://my.glattt.com`, `PUBLIC_URL=https://hub.glattt.com`,
   `DB_USERNAME=glattthub_portal`, Secrets aus 1.). Danach deployt `cloudbuild.yaml` ihn bei jedem
   Push auf `main` mit.
7. **Host-Regel** `my.glattt.com` → `backend-glattthub-prod-portal` (Schritt 2 am URL-Map
   `urlmap-glattthub`). DNS bei All-Inkl zeigt schon auf `34.49.25.78`, Zertifikat
   `cert-glattthub-portal` ist aktiv.

Prüfen nach der Einrichtung: `https://my.glattt.com/anmelden` zeigt die Portal-Anmeldung,
`https://my.glattt.com/hub` und `/admin` antworten 404, im Worker-Log erscheinen
`portal:outbox`-Zeilen.

## Changelog

- **10.10.2026** — Anhänge der Kundin in Anfragen (Web + App), Tastatur-Leiste in der Antwortzeile,
  Zendesk-Importe ohne Doppel.
- **09.10.2026** — Anfragen an den Kundenservice im Kontakt (Entwurf 1 „Kontakt wird Postfach“):
  Ticket-Kopie am Konto ohne Notizen, Verlauf als Chat mit Antwort, Abgeschlossene dahinter, Push
  öffnet den Verlauf; Web und App.
- **06.10.2026** — „Passwort vergessen“ holt ein fehlendes oder veraltetes Geburtsdatum selbst nach
  (Nachprüfung im Hub-Worker), Büro-Knopf „Passwort-Link senden“ (Web und nativ), TestFlight M100.

- 02.10.2026: Profilbild auch in globaler Suche, Kundenübersicht und Kunden-Detailseite (vergrößerbar)

- 02.10.2026: Admin „Kunden-App“ — Schalter, Mail-Texte, Mitteilungen ([Kunden-App im Admin](KUNDEN-APP-ADMIN.md))

- 01.10.2026: App-Onboarding (Kartenstapel), Profilbild in App und Hub, Push-Token, Freunde werben mit Teilnahmebedingungen

- **01.10.2026** — Eigener Dienst ohne Fremdschlüssel (Architektur B): Portal-Modus, Auftragsbuch,
  Übergaben, Kopie am Konto, eigener Datenschlüssel, DB-Benutzer mit Minimalrechten.
- **02.10.2026** — Büro-Seite als Posteingang mit Kontext (Web und nativ), Ablehnen mit Grund an die
  Kundin, Verlauf, Kontensuche, Zahl am Menüpunkt. Ratenplan: geteilte Rate als eine Zeile, Karte
  „Einmalzahlungen“ (M91).
- **01.10.2026** — Büro-Seite „Kundenportal“ (Aufgabenliste) und drei Anlässe im
  Benachrichtigungs-Katalog.
- **30.09.–01.10.2026** — Etappen 1–4: Zugang, Start/Termine/Vertrag, Verlegen und Kontakt,
  Zahlungen, Einmalzahlung, neue Bankverbindung.
