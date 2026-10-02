# Kunden-App im Admin (Einstellungen, E-Mails, Mitteilungen)

> Stand 02.10.2026 · Admin → Verkauf → **Kunden-App** · Rechte `manage_customer_app` und
> `send_customer_push` (zunächst nur Super-Admin)

## Für Endanwender

Im Admin-Bereich steuert das Büro, was Kundinnen in der App „My glattt“ **und** im Web-Portal
my.glattt.com dürfen (Termine verlegen, Einmalzahlung, Bankverbindung ändern, Trinkgeld, Kalender,
Freunde werben, Kontakt), wie die Portal-Mails lauten und welche Mitteilungen (Push) die App bekommt.
Mitteilungen lassen sich automatisch zu Anlässen schicken (alle zunächst **aus**), als Test an
einzelne Kundinnen oder ad hoc an eine Zielgruppe aus kombinierbaren Regeln.

Fünf Unterseiten: **Kunden-App** (Einstellungen), **E-Mails**, **Push-Anlässe**, **Push senden**
(mit Protokoll), **Geräte & Kennzahlen**.

Kundinnen finden jede Mitteilung im **Profil unter „Mitteilungen“** wieder, in der App und im
Web-Portal. Das gilt auch für weggewischte Pushes und für Kundinnen ohne App oder ohne
Push-Erlaubnis. Dort stellen sie außerdem ein, zu welchen Themen sie Pushes bekommen wollen
(Termine, Bewertung & Trinkgeld, Freunde werben, Paket & Zahlungen).

## Für Entwickler

### Einstellungen: eine Regel für App und Portal

- `App\Support\CustomerApp\CustomerAppSettings` — `DEFAULTS` ist die vollständige Liste der Schlüssel
  (Funktionen, Freunde-werben-Bedingungen, Kontakt-Themen, WhatsApp-Link, Hinweis-Banner mit Zeitraum
  und Instituten, Mindest-App-Version, Onboarding-Version, Ruhezeit 21–8 Uhr).
- Gespeichert in `customer_app_settings` (key → `{"v": …}`), 60 s Cache.
- **Der Portal-Dienst darf die Admin-Tabellen nicht lesen** (eigener DB-Benutzer, siehe
  [Kundenportal](KUNDENPORTAL.md)). `save()` schreibt deshalb die Werte zusätzlich in jede
  Konten-Kopie (`customer_accounts.snapshot.settings`); `forAccount()` liest dort. Neue Konten
  bekommen die Kopie beim Anlegen, `PortalSnapshotService::refresh()` frischt sie auf.
  Im Portal-Modus liefert `current()` nur die Standardwerte.
- Durchgesetzt **serverseitig**: `PortalAppController::featureOff()` (403 mit `reason:
  feature_disabled`), `PortalRescheduleService::canReschedule()` (Schalter + Mindeststunden),
  `PortalPagesController` (Web-Portal), Kontakt-Themen über `CustomerAppSettings::topics()`.
- Die App bekommt unter `/ich` das Feld `app` (`appPayload()`): `features`, `banner` (nur wenn aktiv,
  im Zeitraum und für das Heimat-Institut), `min_app_version`, `min_app_message`, `onboarding_version`.
  Fehlende Schalter gelten in der App als **an** (ältere Hub-Stände).

### Institut wechseln beim Verlegen (02.10.2026)

Schalter `reschedule_branch_switch_enabled` (Admin „Kunden-App“ → Funktionen). `App\Services\Booking\BranchSwitchService`
liefert die wählbaren Institute (alle sichtbaren laut `BranchVisibility` plus das des Termins), übersetzt die Leistungen
über den Namen in den Katalog des Ziel-Instituts (Service-IDs unterscheiden sich je Institut) und sperrt Institute, in
denen eine Leistung fehlt. Die Buchungs-API (`/api/shared/booking/{token}?branch=…`, `…/buchen` mit `branch_id`) und
die Livewire-Buchungsseite (Web-Portal, Erinnerungslink) nutzen denselben Dienst. `BookingService::reschedule()`
storniert im alten Institut (`$cancelBranchId`) und bucht im neuen; `booking_result` trägt dann `branch_id`/`branch_name`,
die Termin-Kopie im Portal wird umgeschrieben. Meldungen: neues Institut wie gewohnt, altes über
`HubNotificationDispatcher::selfServiceMovedAway()` (gleicher Anlass, Aktion „zu … verlegt“). Vorgewählt ist immer das
Institut des Termins — nichts wird gemerkt.

### E-Mails

`App\Support\CustomerApp\CustomerAppMails::TYPES`: Einladung, Passwort vergessen (beide Pflicht),
Einmalzahlung verrechnet, Bankverbindung eingerichtet (abschaltbar). Tabelle
`customer_app_mail_templates` (enabled, bcc, subject, body); leere Felder = Standardtext. Die Mailables
nutzen den Trait `UsesCustomerAppTemplate` (Betreff, Absätze, BCC); Absätze durch Leerzeile getrennt,
Platzhalter in `{…}`. Anrede, Knopf und Fußzeile bleiben in der Vorlage.

### Mitteilungen (Push)

- **Versand nur im Hub**: `CustomerPushService` + `CustomerApnsClient` (pushok, Team-Schlüssel der
  Hub-App, Topic `portal.ios_bundle_id`, Gerät `development` → Sandbox). Nur HTTP 410 schaltet ein Gerät
  ab (`customer_devices.disabled_at`), ein 400 kann eine Fehleinstellung sein.
- **Taktgeber ist der Worker** `portal:outbox --loop`: Nach jedem Durchlauf ruft er `tick()` —
  fällige geplante Mitteilungen senden, alle 5 Minuten Terminerinnerungen. **Kein eigener
  Cloud-Scheduler-Job.**
- **Anlässe** (`CustomerPushCatalog::TYPES`, Tabelle `customer_push_types`): alle angelegt, alle aus.
  `trigger: false` = Auslöser noch nicht gebaut, lässt sich im Admin nicht einschalten.
  Auslöser: Terminerinnerung (`AppointmentReminderService::upcomingVisits`, X Stunden vorher, je Besuch),
  Termin verlegt (`PortalSnapshotService::applyReschedule`), Bewertungsanfrage
  (`TreatmentFeedbackSender`), Trinkgeld bezahlt (`TipPaymentService`), Freunde werben
  (`ContractReferral`: angelegt, `payout_ready_at` gesetzt, Auszahlung bestätigt), Einmalzahlung und
  Bankverbindung (`PortalOfficeService`). `fire()` ist fehlertolerant und hat einen
  Doppelungsschutz über `customer_push_deliveries.dedupe_key`.
- **Ruhezeit**: Mitteilungen in der Ruhezeit werden auf deren Ende geplant (Ad hoc abschaltbar).
- **Zielgruppen-Regeln** (UND-verknüpft, `CustomerPushService::RULES`): alle, Institute, Termin heute/
  morgen/nächste Tage/Zeitraum, Termin in den letzten Tagen (PAID), aktiver Vertrag ja/nein,
  hat geworben ja/nein, App-Version mindestens, einzelne Kundinnen. Es zählen nur aktive Konten mit
  aktivem Gerät.
- **Protokoll**: `customer_push_messages` (Art, Status, Zahlen), `customer_push_deliveries` je Gerät.
  Tippt die Kundin die Mitteilung an, meldet die App `POST /api/app/v1/mitteilung/{delivery}/geoeffnet`
  → Auftragsbuch `push_opened` → `markOpened()`.
- **Ziel in der App** (`target`): start, appointments, friends, contract, contact, profile — die App
  wechselt den Reiter (`PushRouter`).

### Mitteilungs-Übersicht im Profil (02.10.2026)

Entwurf B aus drei Varianten (Jan, 02.10.2026). Die Liste steht im Profil, nicht auf der Startseite.
Ein roter Punkt am Profilbild (App) bzw. am Menüpunkt „Profil“ (Portal) zeigt Ungelesenes.

- **Speicher am Konto**: `customer_accounts.push_inbox` (JSON, 90 Tage, höchstens 50) und
  `push_topics_off`. Grund: Der Portal-Dienst darf nur `customer_accounts` lesen
  (Wissen `kundenportal-eigener-dienst`); die Push-Tabellen bleiben ohne Portal-Rechte.
  `App\Support\CustomerApp\CustomerInbox` ist die einzige Stelle, die beides liest und schreibt.
- **Schreiben nur im Hub**: `CustomerPushService::deliver()` reiht je Konto einmal ein
  (`CustomerInbox::add`, unter `lockForUpdate`), **Testmitteilungen nicht**. Die Zahl ungelesener geht
  als `badge` an APNs (Zahl am App-Symbol). `markOpened()` markiert auch in der Liste als gelesen.
- **Ohne Gerät nur Liste**: `fire()` verlangt kein Gerät mehr. Konten ohne Gerät bekommen eine
  Zustellung `skipped` / „Kein Gerät“, abgeschaltete Themen `skipped` / „Thema abgeschaltet“.
  Ad-hoc-Zielgruppen zählen weiter nur Konten mit Gerät.
- **Themen** in `CustomerPushCatalog::TOPICS`, je Anlass `topic`. `essential: true`
  (`bank_applied`, `payment_failed`) kommt immer als Push. Ad-hoc-Mitteilungen haben kein Thema und
  lassen sich nicht abschalten.
- **Gelesen und Schalter aus dem Portal** über das Auftragsbuch: `push_read` (`ids`, ohne = alle) und
  `push_topics` (`off`). `CustomerInbox::payload()` legt noch offene Aufträge über den gespeicherten
  Stand, damit App und Seite sofort stimmen.
- **Endpunkte** (App, Bearer, nach Zustimmung): `GET /api/app/v1/mitteilungen`,
  `POST …/mitteilungen/gelesen`, `POST …/mitteilungen/themen` (`topics: {thema: bool}`).
  Web-Portal: Abschnitt `#mitteilungen` auf `/profil`, `GET /profil/mitteilungen/{id}` (gelesen + Sprung
  zum Bereich), `POST /profil/mitteilungen/gelesen`, `POST /profil/mitteilungen/themen`.
- **App**: `MessagesView` (Profil → Mitteilungen) mit Alle/Ungelesen, Kontextmenü „Als gelesen
  markieren“, Themen-Schalter. Auf dem iPad stehen Liste und Schalter nebeneinander. Tippen geht über
  `PushRouter` wie ein Push; das Profil-Blatt schließt dabei (`lastOpened`). Kommt bei geöffneter App
  ein Push an, lädt die App die Liste neu (`PushRouter.received`).

### App-Seite (My glattt)

`ServerAppSettings` am `Account`: ausgeschaltete Reiter (Freunde, Kontakt) und Knöpfe (Kalender,
Einmalzahlung, Konto ändern) verschwinden; Verlegen kommt weiter über `can_reschedule`; Trinkgeld über
`tips_enabled`. Hinweis-Banner auf der Startseite (`NoticeBanner`), Update-Sperre
(`UpdateRequiredView`) bei unterschrittener Mindestversion, Onboarding erneut, wenn
`onboarding_version` größer ist als die zuletzt gesehene. Beim Zurückholen in den Vordergrund lädt die
App `/ich` neu.

### Fallstricke

- Der Portal-Dienst sieht Änderungen erst über die Konten-Kopie — wer `customer_app_settings` von Hand
  ändert, muss `CustomerAppSettings::syncToAccounts()` aufrufen.
- TestFlight-Builds „My glattt Staging“ sprechen mit dem Staging-Hub: Mitteilungen an Testerinnen
  kommen aus dem Staging-Worker.

## Changelog

- **02.10.2026** — Mitteilungs-Übersicht im Profil (App und Web-Portal) mit Themen-Schaltern,
  Zahl am App-Symbol, Mitteilungen auch ohne Gerät.
- **02.10.2026** — Erste Fassung: Einstellungen, E-Mails, Push-Anlässe, Push senden, Geräte & Kennzahlen.
