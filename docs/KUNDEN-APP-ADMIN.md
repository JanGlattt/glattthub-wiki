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

- **02.10.2026** — Erste Fassung: Einstellungen, E-Mails, Push-Anlässe, Push senden, Geräte & Kennzahlen.
