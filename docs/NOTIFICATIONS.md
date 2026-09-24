# 🔔 Benachrichtigungssystem

Das Benachrichtigungssystem verschickt **InApp-Mitteilungen** und **Push-Notifications** an
Hub-Benutzer — manuell verfasst, durch ein Webhook- oder Hub-Ereignis ausgelöst, zeitgesteuert per
Cron oder aus einem Datenbank-Event heraus. Verwaltet wird alles an einer Stelle:
**Filament Admin → Kommunikation → Benachrichtigungen**. Diese Seite ist überwiegend technisch —
sie beschreibt **Modi, Platzhalter, Architektur, Endpunkte und Deployment**; wie Mitteilungen im
Hub gelesen werden und was das Team im Admin-Panel einstellt, steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Grundlagen 2 und Admin 4 im Nutzerhandbuch"
    [Grundlagen 2 – Standort, Suche & Mitteilungen](https://hilfe.hub.glattt.com/grundlagen/2/) —
    Mitteilungen im Hub lesen und abarbeiten, eigene Kanäle je Anlass einstellen ·
    [Admin 4 – Erinnerungen und WhatsApp](https://hilfe.hub.glattt.com/admin/4/) —
    automatische Nachrichten, Einwilligungen und Protokolle im Admin-Panel.

---

## Für Anwender — Überblick

Der Hub meldet sich von selbst, wenn etwas passiert, das jemand wissen muss — ein verkaufter
Gutschein, eine Online-Zahlung auf eine Forderung, eine geplatzte Lastschrift, ein fälliger
Widerruf oder eine Mitteilung, die jemand aus dem Büro von Hand verfasst hat. Jede Benachrichtigung
kann **im Hub** (Glocke in der Kopfzeile) und/oder als **Push-Mitteilung** auf den Geräten
erscheinen, auf denen der Empfänger Push erlaubt hat.

**Seit 19.09.2026 ist jeder Anlass an einer Stelle sichtbar und einstellbar:** Im Admin-Panel
unter *Kommunikation → Benachrichtigungen → Anlässe & Regeln* steht der vollständige Katalog —
je Anlass ein Schalter „Aktiv", die Kanäle „Im Hub" und „Push", die Zielgruppe (Recht, Institut des
Ereignisses, betroffene Person, Rollen, Institute, einzelne Personen), die Frequenz (sofort oder
Tages-Zusammenfassung), wann er zuletzt ausgelöst hat und wie oft in den letzten 30 Tagen. Der
Reiter *Versendet* zeigt die tatsächlich erzeugten Meldungen mit ihrer Herkunft.

**Seit 24.09.2026 meldet sich eine neue Mitteilung im Hub von selbst:** Statt nur der Zahl an der
Glocke erscheint eine Karte am Bildschirmrand (unten rechts, am Handy oben) mit Titel, Text und —
wenn die Meldung eins trägt — einem Bild; Antippen öffnet den Vorgang und markiert gelesen, das ×
legt sie weg. Bilder gehen auch auf den Sperrbildschirm des iPhones, in den Browser-Push
(Chrome/Edge) und in das Banner der Desktop-App: je Anlass ein festes Bild im Admin, oder ein
individuelles Bild aus dem Code (z.B. ein Foto zum Vorgang).

Jede Mitarbeiterin entscheidet zusätzlich **für sich**, welche Anlässe sie erreichen: Unten auf
der Mitteilungsseite („Meine Benachrichtigungen") gibt es je Anlass die Schalter „Im Hub" und
„Push" — sofern der Admin den Anlass zur Stummschaltung freigegeben hat (Pflichtmeldungen wie
eine fehlgeschlagene Gutschein-Anlage bleiben immer an).

Bedienung (Mitteilungen lesen, Hinweis-Karte, eigene Kanäle je Anlass einstellen) siehe den
Nutzerhandbuch-Verweis am Seitenanfang, Grundlagen 2, Seiten „Hinweis auf neue Mitteilungen"
und „Meine Benachrichtigungen".

---

## 📍 Zentrale Verwaltung

**Filament Admin → Kommunikation → Benachrichtigungen**

---

## 📋 Inhaltsverzeichnis

1. [Für Anwender — Überblick](#fur-anwender-uberblick)
2. [Überblick](#uberblick)
3. [Benachrichtigungs-Modi](#benachrichtigungs-modi)
4. [Push-Notifications Setup](#push-notifications-setup)
5. [Platzhalter-System](#platzhalter-system)
6. [Technische Architektur](#technische-architektur)
7. [API & Cron-Endpunkte](#api-cron-endpunkte)
8. [Cloud Deployment](#cloud-deployment)
9. [Entwicklung & Testing](#entwicklung-testing)

---

## Überblick

Das System unterstützt vier Arten von Benachrichtigungen:

| Modus | Trigger | InApp | Push |
|-------|---------|-------|------|
| ✍️ Manuell | Sofort beim Erstellen | ✅ | ✅ |
| 🏠 Hub-Anlass (Katalog) | Internes Hub-Ereignis (`HubEventRegistry`) | je Regel | je Regel |
| 💳 GoCardless-Ereignis | GoCardless-Webhook | je Regel | je Regel |
| ⏰ Zeitbasiert | Cron (Cloud Scheduler) | je Regel | je Regel |
| ⚡ Aktionsbasiert | Datenbank-Event | je Regel | je Regel |

**Seit 19.09.2026 entscheidet die Regel über die Kanäle:** Jede Regel (alles außer manuellen
Einzelmeldungen) trägt `is_active`, `channel_in_app`, `channel_push` und `user_can_mute`. Eine
abgeschaltete Regel erzeugt nichts; ohne Kanal „Im Hub" entsteht keine `notifications`-Zeile,
ohne „Push" kein Versand an Geräte. Persönliche Kanal-Wahl der Nutzer
(`notification_rule_preferences`) greift, sobald `user_can_mute` erlaubt ist.

**Der Katalog ist Pflicht (`NotificationDispatchConventionTest`):** Kein Modul verschickt mehr
direkt über `NotificationService` oder `PushNotificationService::sendByType()`. Jede Meldung des
Hubs ist ein Anlass in `HubEventRegistry::events()` und wird über eine Methode des
`HubNotificationDispatcher` ausgelöst — nur so ist sie im Admin sichtbar, einstellbar und
stummschaltbar. Bis 09/2026 gab es ~22 Code-Stellen, die am Admin vorbei nur In-App (ohne Push)
mit hart verdrahteter Zielgruppe verschickten, plus drei Push-only-Typen des Laser-Moduls.

---

## Benachrichtigungs-Modi

### 1. ✍️ Manuelle Benachrichtigungen

Für einmalige Mitteilungen an Benutzer.

**Erstellen:**
1. Admin → Kommunikation → Benachrichtigungen → Erstellen
2. Modus: "Manuell" wählen
3. Typ, Titel, Nachricht eingeben
4. Zielgruppe wählen (Global, Rollen, Institute, einzelne User)
5. Speichern → Benachrichtigung wird sofort erstellt

### 2. 🔄 Ereignis-Regeln (Katalog-Anlässe)

Automatische Benachrichtigungen bei Hub-Ereignissen **und** GoCardless-Webhooks —
seit 19.09.2026 beides über denselben Katalog (`HubEventRegistry`), Provider `hub`.

**Konfiguration:**
1. Admin → System → Benachrichtigungen → Reiter *Anlässe & Regeln*: Jeder
   Katalog-Anlass hat bereits eine Regel-Zeile (aus den Standardwerten angelegt)
2. Schnell-Schalter in der Zeile: Aktiv · Im Hub · Push
3. *Bearbeiten*: **Frequenz** (⚡ Einzelbenachrichtigung ODER 📦 Tages-Zusammenfassung
   mit Sendezeitpunkt — bei häufigen Ereignissen empfohlen), Titel/Nachricht mit den
   Platzhaltern des Anlasses, Zielgruppe (Recht, Institut des Ereignisses, betroffene
   Person, Rollen, Institute, Personen), „Nutzer dürfen stummschalten"

**GoCardless-Ereignisse** heißen im Katalog `gocardless_payments`, `gocardless_mandates`,
`gocardless_refunds`, `gocardless_payouts` und `gocardless_subscriptions` (Altbestand,
seit 07/2026 keine Abos mehr) — alle Aktionen der GoCardless-API sind anlegbar
(inkl. `chargeback_settled`, `resubmission_requested`, `customer_approval_*`,
`mandates.replaced/reinstated/blocked`). Die Payload wird im
`HubNotificationDispatcher::gocardlessEvent()` aus Rate, Mandat und Vertrag
angereichert: `{kundenname} {vertragsnummer} {institut} {verkaeuferin} {mandat} {betrag}
{rate}` (z.B. „3/24") `{faellig_am} {naechster_versuch} {ursache}` (deutsch, Tabelle
`HubEventRegistry::GOCARDLESS_CAUSES`) `{ursache_code} {beschreibung} {event_id}
{resource_id}`; Payouts: `{betrag} {referenz} {ankunft}`. Idempotenz je Event-ID
(`gc:<event_id>`), Institut des Ereignisses = Vertrags-Institut, betroffene Person =
Verkäuferin.

Standard: `payments.failed`, `charged_back`, `mandates.failed/cancelled/blocked`,
`refunds.failed` sofort als Pflichtmeldung an `manage_gocardless`;
`late_failure_settled`, `chargeback_settled`, `payouts.paid` als Tages-Digest;
Massen-Ereignisse (`created`, `submitted`, `confirmed`, `paid_out`, `cancelled` —
5.870 bzw. 729 je Monat in Prod) stehen im Katalog, sind aber **aus**. Die
Migration `2026_09_19_180000` hat bestehende `gocardless`-Regeln umgehängt; eine
globale Regel (Prod: `payouts.paid` mit rohen IDs an alle) bekam die
Katalog-Standardwerte. Der Alt-Katalog (`Notification::getGoCardlessEventTypes()`,
`{cause}`-Platzhalter) bleibt nur für Altdaten lesbar.

**Der Katalog (Stand 19.09.2026, verbindlich ist `HubEventRegistry::events()`):**

| Modul | Anlass (`resource_type.action`) | Standard-Zielgruppe | Standard |
|---|---|---|---|
| Verkauf & Verträge | `contracts.created` — Neuer Vertrag / Verkauf | Recht `view_contracts` | aus, Tages-Digest |
| Widerrufe | `contract_cancellations.created` — Widerruf eingegangen | Recht `view_revocations` | aus |
| Widerrufe | `contract_cancellations.follow_ups_due` — Wiedervorlagen fällig (Sammelmeldung) | Recht `manage_revocations` | an |
| Widerrufe | `contract_changes.signed` / `.effective` — Vertragsänderung unterschrieben / Folgevertrag wirksam | Recht `manage_revocations` | an |
| Gutschein-Verkauf | `voucher_sales.sold` — Gutschein online verkauft | Institut des Ereignisses | an |
| Gutschein-Verkauf | `voucher_sales.creation_failed` / `.email_failed` | Recht `manage_voucher_sales` | an, Pflicht |
| Forderungen | `receivables.online_payment_received` — Online-Zahlung eingegangen | Recht `manage_receivables` | an |
| Forderungen | `receivables.appointment_amount_waived` — Offener Betrag nicht kassiert | Recht `view_debts` | an |
| Termine | `appointments.self_service_booked` / `.self_service_cancelled` | Institut des Ereignisses | an |
| Termine | `appointment_reminders.delivery_failed` / `.send_failed` | Institut des Ereignisses | an |
| Beratung | `satisfaction_surveys.callback_requested` / `.refresh_requested` | Institut des Ereignisses | an |
| Beratung | `consultation_records.completed_without_contract` | Recht `manage_consultation_records` | aus, Tages-Digest |
| SEPA | `sepa.payment_plan_manual_required`, `.onsite_payments_overdue`, `.reconciliation_anomalies`, `.webhook_failed`, `.webhook_exhausted` | Recht `manage_gocardless` | an (Fehler: Pflicht) |
| Laser | `laser.low_stock`, `.stk_due` | Recht `manage_laser_inventory` | an |
| Laser | `laser.maintenance_overdue` | Recht `perform_laser_maintenance` | an |
| Betrieb | `company_contracts.cancellation_deadline` — Kündigungsfrist läuft ab | Recht `manage_company_contracts` + betroffene Person | an, Pflicht |
| Betrieb | `legal_documents.changed` / `.sync_failed` | Recht `manage_legal_documents` | an, Pflicht |
| Kommunikation | `news.published` — Nachricht veröffentlicht | Institut(e) der Nachricht bzw. alle | an |
| Kommunikation | `custom_dashboards.shared` — Dashboard geteilt | betroffene Person | an |
| Beratung | `consultations.booked` / `.cancelled` — Beratungsgespräch gebucht / storniert (`upcoming_consultations`) | Institut des Ereignisses | an (Buchung: Digest) |
| Beratung | `staff_performance.kpz_above_target` / `.kpz_below_yellow` / `.cr_above_target` — Ø KPZ bzw. Conversion gegen die Schwellen des Instituts (`StaffPerformanceTarget`), laufender Monat, ab 10 Beratungen, einmal je Person und Monat (`HubDailyChecksService`) | betroffene Person + `view_bonus_board_branch/all` (unter Gelb: nur Leitung) | an |
| Beratung | `survey_ratings.low` / `.top` — Bewertung ≤ 3 bzw. 5 Sterne | `manage_satisfaction_surveys` / Institut | an (5 Sterne: Digest) |
| Verkauf | `contract_lifecycle.activated` / `.completed` — Vertrag unterschrieben (Entwurf/schwebend → aktiv) / vollständig bezahlt | Verkäuferin + Leitung / Verkäuferin | an (aktiv: Digest) |
| Verkauf | `referrals.received` — Empfehlung eingegangen | Institut des Ereignisses | an |
| Bonus | `bonus.rule_achieved` — Bonusziel erreicht (beim Einfrieren) / `bonus.month_frozen` — Monat final eingefroren | Person + `manage_bonus_rules` / alle auf dem Board | an |
| Bonus | `gamification.badge_rewarded` — Abzeichen mit Prämie (`reward_cents > 0`) | betroffene Person | an, Digest |
| Forderungen | `debt_cases.created` / `.payment_recorded` (manuell; Online-Zahlungen melden separat) / `.rzv_agreed` / `.rzv_defaulted` | `manage_receivables` | an (Fall/Zahlung: Digest) |
| Gutscheine | `vouchers.redeemed` — Gutschein auf Vertrag angerechnet | Institut des Ereignisses | an, Digest |
| Laser | `laser_service.error_reported` / `.repair_completed` (Status erledigt/zurück) | `manage_laser_repairs` (+ Institut) | an |
| Personal | `travel_expenses.submitted` / `.approved` / `.rejected` | `approve_travel_expenses` / betroffene Person | an (frei/abgelehnt: Pflicht) |
| Personal | `hub_users.invitation_accepted` — Neue Kollegin im Hub | `create_users` | an |
| Widerrufe | `contract_change_deadlines.withdrawal_ends_tomorrow` — Widerrufsfrist endet morgen (`HubDailyChecksService`) | `manage_revocations` | an |
| System | `system.command_failed` — geplanter Befehl mit Exit ≠ 0 (`NotifyOnFailedCommand`, Präfixe `sync:`, `stats:`, `gocardless:` …; einmal je Befehl und Stunde) | `access_admin` | an, Pflicht |
| SEPA | `gocardless_*` — siehe Abschnitt „Ereignis-Regeln" | `manage_gocardless` | siehe oben |

„Pflicht" = `user_can_mute = false`, die persönliche Kanal-Wahl greift nicht. Die
Standardwerte gelten nur beim **Anlegen** der Regel (`HubEventRuleSync`) — was der Admin
danach einstellt, bleibt. Wird eine Katalog-Regel gelöscht, entsteht sie beim nächsten
Auslösen bzw. beim Öffnen der Admin-Liste mit den Standardwerten neu (persönliche
Kanal-Wahlen dazu gehen dabei verloren).

**Zielgruppen-Arten einer Regel (Vereinigung):** alle (`is_global`), Rollen, einzelne
Nutzer, feste Institute, **Rechte** (`target_permissions`), **Institut des Ereignisses**
(`target_event_branch` — Heimatfiliale = Institut des Datensatzes, `home_branch_id = all`
zählt überall mit) und **betroffene Person(en)** (`target_event_owners` — z.B. Verkäuferin,
Empfängerin einer Freigabe, zuständige Person eines Unternehmensvertrags). Nur die beiden
Ereignis-Bezüge sind Hub-Anlässen vorbehalten.

**Besonderheiten des Hub-Providers:**

- **Sichtbarkeitsgrenzen:** Empfänger werden gegen die Datensichtbarkeit
  geprüft (`DataVisibilityService`, siehe `DATA-VISIBILITY.md`). Wer einen
  Datensatz im Hub nicht sehen darf (z.B. anderes Institut bei
  `data_scope_branch`), bekommt auch keine Benachrichtigung dazu — weder
  In-App noch Push. Beim Digest sieht jede Empfängergruppe nur die für sie
  sichtbaren Ereignisse in der Liste.
- **Idempotenz:** Ein Ereignis erzeugt genau eine Benachrichtigung, auch wenn
  der auslösende Datensatz mehrfach gespeichert wird (Ereignis-Log
  `hub_notification_events` mit Unique-Index je Anlass + Datensatz). Anlässe
  ohne Datensatz (tägliche Sammelprüfungen, Reconcile) geben statt eines Models
  einen Text-Schlüssel mit (`subject_type = key`, z.B. `onsite-overdue:2026-09-19`);
  Anlässe, die bewusst mehrfach melden dürfen, hängen einen Zeitstempel an.
- **Datenschutz:** Verkaufs- und Widerrufsmeldungen enthalten Kundennamen und
  Beträge; die Meldung zu einem BG ohne Abschluss zusätzlich eine
  personenbezogene Leistungsinformation über die Mitarbeiterin. Zielgruppe je
  Regel bewusst eng wählen.

### 3. ⏰ Zeitbasierte Automatisierungen

Benachrichtigungen zu bestimmten Zeiten/Tagen.

**Konfiguration:**
1. Modus: "Automatisierung" wählen
2. Automatisierungs-Typ: "Zeitbasiert"
3. Wochentage auswählen (z.B. Mo-Fr)
4. Uhrzeit festlegen (z.B. 08:00)
5. Titel/Nachricht mit Statistik-Platzhaltern

**Beispiel:** Jeden Montag um 08:00 Uhr Beratungsübersicht senden:
```
Titel: Guten Morgen! 🌅
Nachricht: Diese Woche stehen {{7days_total}} Beratungen an. Heute: {{today_total}}
```

### 4. ⚡ Aktionsbasierte Automatisierungen

Benachrichtigungen bei Datenbank-Events.

**Konfiguration:**
1. Modus: "Automatisierung" wählen
2. Automatisierungs-Typ: "Aktionsbasiert"
3. Trigger-Model: z.B. "News"
4. Event: "Erstellt"
5. Titel/Nachricht mit Model-Platzhaltern

**Unterstützte Models:**

| Model | Platzhalter |
|-------|-------------|
| News | `{{title}}`, `{{short_description}}`, `{{link_url}}` |
| Beratungstermin | `{{client_name}}`, `{{service_name}}`, `{{appointment_date}}` |
| User | `{{name}}`, `{{email}}`, `{{created_at}}` |
| PhorestStaff | `{{first_name}}`, `{{last_name}}`, `{{branch_name}}` |

---

## Push-Notifications Setup

### Browser-Unterstützung

| Browser/OS | Unterstützt | Besonderheiten |
|------------|-------------|----------------|
| Chrome (Desktop) | ✅ | Beste Unterstützung |
| Firefox (Desktop) | ✅ | Vollständig |
| Safari (macOS) | ✅ | Ab macOS Ventura |
| Edge | ✅ | Vollständig |
| iOS Safari | ⚠️ | Nur als installierte PWA |
| Android Chrome | ✅ | Vollständig |

### iOS-Besonderheit

Push auf iOS funktioniert **nur** wenn:
1. glatttHub als PWA installiert ist (zum Homescreen hinzufügen)
2. iOS 16.4+ verwendet wird
3. Die Berechtigung in der installierten App erteilt wird

### APNs-Umgebung je Gerät (Desktop-App und iOS-App)

Der APNs-Host wird seit 20.09.2026 **je Subscription** gewählt (`push_subscriptions.apns_environment`),
nicht mehr global über `APNS_ENVIRONMENT`: Xcode-Debug-Builds der iOS-App registrieren
Sandbox-Tokens, TestFlight-/Store-Builds und die Electron-App Production-Tokens. Ein Sandbox-Token
gegen den Production-Host ergab `BadDeviceToken` und deaktivierte das Gerät. Die Bridge der App
liefert die Umgebung mit der Registrierung (`registerForApnsNotifications()` →
`{ token, environment, nativeDeviceId? }`), `push-notifications.js` reicht sie als `environment` an
`/api/push/subscribe/native` weiter; `ApplePushNotificationService` erzeugt den pushok-Client mit
`$subscription->usesProductionApns()`. `APNS_ENVIRONMENT` bleibt nur als Rückfall für Zeilen ohne Wert.

**APNs-Payload für die iOS-App (seit 20.09.2026):** `ApplePushNotificationService::send` setzt neben
`alert`/`sound`/`url`/`log_id`/`data` jetzt `category` (`HUB_OBJECT`, wenn `url` auf
`/hub/clients|contracts|receivables/<id>` zeigt — die App bietet dann „Öffnen" und „Als gelesen
markieren" —, sonst `HUB_INFO`; ein explizites `category` im Notification-Array gewinnt), `thread-id`
(= `data.module`, Modul des Katalogs → iOS gruppiert je Modul), `badge` (ungelesene In-App-Meldungen
des Empfängers, `Notification::unreadCountFor()`, dieselbe Sichtbarkeit wie die Glocke) und die
`apns-collapse-id` (= `data.collapse_id`). `HubNotificationDispatcher::pushData()` liefert die
Zusatzdaten `notification_id`, `rule_id`, `module`, `collapse_id` (`hub-<Regel>-<Hash des Ziels>`,
Wiederholungen desselben Anlasses zum selben Ziel ersetzen die vorige Mitteilung); der Testversand
schickt dieselben Daten plus `is_test`. Der Badge darf den Versand nie blockieren (Fehler → kein Badge).

`push-notifications.js` kennt seit demselben Datum eine **generische native Bridge**
(`getNativeBridge()` = `window.glatttNative` der iOS-App, sonst `window.electronPush`); die
iOS-Bridge liefert zusätzlich `getInfo()` (Plattform, App-Name, Gerätename, Keychain-Geräte-ID),
`getPushStatus()` (`granted`/`denied`/`default`, weil das WKWebView kein `window.Notification` hat)
und `setBadge(n)` (App-Symbol, aus der Glocke gespeist). Details: [iOS-App](IOS-APP.md).

### APNs-Konfiguration (Desktop App)

Für native macOS Push-Notifications über die Electron-App:

```env
APNS_KEY_ID=4VXP44Y6GY
APNS_TEAM_ID=63DQ6FV92R
APNS_BUNDLE_ID=com.glattt.hub
APNS_ENVIRONMENT=production
# Lokal: Pfad zur .p8-Datei
APNS_PRIVATE_KEY_PATH=/pfad/zur/AuthKey_4VXP44Y6GY.p8
# Cloud Run: Inhalt der .p8-Datei (ohne PEM-Header, werden automatisch ergänzt)
APNS_PRIVATE_KEY=MIGTAgEAMBMG...
```

!!! info "Cloud Run"
    In Cloud Run ist das Filesystem read-only. Der APNs-Key wird daher in `/tmp/apns-auth-key.p8` geschrieben (nicht in `storage/`). PEM-Header werden automatisch ergänzt wenn sie fehlen.

**PHP-Bibliothek:** `edamov/pushok` (via Composer)

```bash
composer require edamov/pushok
```

### VAPID-Keys

Push-Benachrichtigungen benötigen VAPID-Keys in der `.env`:

```env
VAPID_PUBLIC_KEY=dein_public_key_hier...
VAPID_PRIVATE_KEY=dein_private_key_hier...
VAPID_SUBJECT=mailto:email@example.com
```

**Keys generieren:**
```bash
php artisan push:generate-vapid-keys
```

---

## Platzhalter-System

### Webhook-Platzhalter (GoCardless)

Verwenden `{platzhalter}` Syntax:

| Platzhalter | Beschreibung |
|-------------|--------------|
| `{event_id}` | GoCardless Event-ID |
| `{resource_id}` | Ressourcen-ID (z.B. PM00123) |
| `{resource_type}` | Typ (payments, mandates, etc.) |
| `{action}` | Aktion (failed, cancelled, etc.) |
| `{cause}` | Ursache (z.B. insufficient_funds) |
| `{description}` | Detailbeschreibung |
| `{origin}` | Ursprung (bank, api, gocardless) |
| `{scheme}` | Zahlungsschema (sepa_core, bacs) |
| `{reason_code}` | Bank-Fehlercode |

### Hub-Ereignis-Platzhalter (Provider glatttHub)

Ebenfalls `{platzhalter}`-Syntax, deutsche Keys — je Ereignistyp definiert in
`HubEventRegistry` (das Formular zeigt immer die passenden an):

| Ereignis | Platzhalter |
|----------|-------------|
| Neuer Vertrag / Verkauf | `{vertragsnummer}`, `{kundenname}`, `{betrag}`, `{monatsrate}`, `{kpz}`, `{institut}`, `{verkaeuferin}`, `{zahlungsart}`, `{status}` |
| Widerruf eingegangen | `{vertragsnummer}`, `{kundenname}`, `{institut}`, `{grund}`, `{zendesk_ticket}`, `{datum}` |
| BG ohne Abschluss | `{kundenname}`, `{institut}`, `{mitarbeiterin}`, `{ergebnis}`, `{datum}` |

Bei Frequenz "Tages-Zusammenfassung" gelten stattdessen die Digest-Platzhalter:

| Platzhalter | Beschreibung |
|-------------|--------------|
| `{anzahl}` | Anzahl der Ereignisse seit dem letzten Versand |
| `{datum}` | Datum des Versands |
| `{liste}` | Aufzählung der Ereignisse (eine Zeile je Ereignis, max. 15 + "… und N weitere") |

### Zeitbasierte Platzhalter

Verwenden `{{platzhalter}}` Syntax:

| Platzhalter | Beschreibung |
|-------------|--------------|
| `{{today_total}}` | Beratungen heute (gesamt) |
| `{{7days_total}}` | Beratungen nächste 7 Tage |
| `{{14days_total}}` | Beratungen nächste 14 Tage |
| `{{28days_total}}` | Beratungen nächste 28 Tage |
| `{{current_date}}` | Aktuelles Datum |
| `{{current_weekday}}` | Aktueller Wochentag |
| `{{today_osnabrueck}}` | Beratungen heute Osnabrück |
| `{{7days_berlin}}` | Beratungen 7 Tage Berlin |

### Aktionsbasierte Platzhalter

Verwenden `{{platzhalter}}` Syntax - abhängig vom gewählten Model.

### Zwei Schreibweisen, zwei Engines — der Testversand kennt beide (seit 24.09.2026)

Katalog- und GoCardless-Regeln füllen `{key}` über
`HubNotificationDispatcher::replacePlaceholders()`; zeitbasierte Automatisierungen füllen
`{{key}}` in `Notification::replaceTimeBasedPlaceholders()` aus
`ConsultationStatsService::getStatsForPush()`, aktionsbasierte aus dem auslösenden Model.
Der Regel-Test im Admin lief bis 24.09.2026 nur über die Katalog-Engine — bei der Regel
„Beratungsgespräche" kam deshalb `{«current_date»}` und `{{7days_total}}` roh im Push an
(der Beispielwert-Regex traf innerhalb der Doppelklammern nur den inneren Teil und kannte
keine Schlüssel mit Ziffern). Seitdem rendert `NotificationTestSender::renderRule()` eine
zeitbasierte Regel über denselben Weg wie der Echtbetrieb (`renderAutomation()`, also
mit **Live-Werten**), alles andere über `samplePayload()` + `fill()` (beide Schreibweisen,
Schlüssel mit Ziffern); die Vorschau im Modal nutzt dieselbe Methode wie der Versand.

---

## Technische Architektur

### Dateien

```
app/
├── Models/
│   ├── Notification.php              # Haupt-Model
│   ├── NotificationAutomationLog.php # Logs für Automatisierungen
│   └── PushSubscription.php          # Push-Registrierungen
├── Observers/
│   └── NotificationAutomationObserver.php  # Aktionsbasierte Triggers
├── Services/
│   ├── NotificationAutomationService.php   # Observer-Registrierung
│   ├── NotificationService.php             # Roh-Builder — nur noch von der Engine genutzt
│   ├── PushNotificationService.php         # Push-Versand
│   └── Notifications/                      # Katalog + Regel-Engine (Hub-Anlässe)
│       ├── HubEventRegistry.php            # Katalog: Modul, Label, Platzhalter, Standardwerte je Anlass
│       ├── HubEventRuleSync.php            # legt je Katalog-Anlass die Regel-Zeile an (ensureRule/ensureAll)
│       ├── HubDailyChecksService.php       # Tages-Prüfungen (Leistungsziele, Widerrufsfristen), 07:30 im Minuten-Cron
│       ├── HubNotificationDispatcher.php   # je Anlass eine Methode; Aktiv, Idempotenz, Kanäle, Versand
│       ├── HubDigestService.php            # Tages-Zusammenfassungen (Empfänger je Ereignis-Institut)
│       └── NotificationRecipientResolver.php  # Zielgruppe (inkl. Recht/Ereignis-Bezug), Sichtbarkeit, Kanal-Split
├── Observers/
│   └── NotificationEventObserver.php       # Model-Lebenszyklus → Anlass (Beratungstermine, Forderungen, Laser, Reisekosten …)
├── Listeners/
│   └── NotifyOnFailedCommand.php           # CommandFinished mit Exit ≠ 0 → system.command_failed
├── Http/Controllers/
│   └── NotificationPreferenceController.php  # „Meine Benachrichtigungen" (GET/PUT hub/notifications/preferences)
├── Models/
│   └── NotificationRulePreference.php      # persönliche Kanal-Wahl je Regel und Nutzer
├── Jobs/
│   ├── SendNotificationAutomationJob.php   # Automatisierte Benachrichtigungen
│   └── ProcessGoCardlessWebhookJob.php     # Webhook-Verarbeitung
├── Console/Commands/
│   └── ProcessNotificationAutomations.php  # Zeitbasierte Cron
├── Http/Controllers/
│   ├── CronController.php                  # Cron-Endpunkte
│   └── Push/PushNotificationController.php # Push-API
└── Filament/Resources/Notifications/       # Admin-UI
    ├── Schemas/NotificationForm.php
    └── Tables/NotificationsTable.php

public/
├── sw.js                 # Service Worker
├── manifest.json         # PWA Manifest
└── js/push-notifications.js  # Frontend Push-Manager
```

### Neuen Anlass ergänzen (ohne Frontend-Änderung)

1. Anlass in `app/Services/Notifications/HubEventRegistry.php` definieren:
   Resource-Type (mit `module`), Aktion, Label, Beschreibung, Platzhalter und
   `defaults` (Titel/Nachricht mit den Platzhaltern des Anlasses — bei
   `frequency: daily_digest` die Digest-Platzhalter —, `type`, `icon` aus
   `HubEventRegistry::ICONS`, `link`, `target`, `channels`, `active`,
   `user_can_mute`)
2. Methode im `HubNotificationDispatcher` ergänzen (Payload mit exakt den
   Platzhalter-Keys; `branchId` + `ownerUserIds` für Zielgruppe und
   Sichtbarkeit, `summary` für die Digest-Zeile; `link` überschreibt den
   Regel-Link je Ereignis; ohne Datensatz einen Text-Schlüssel als Subject)
3. Aufruf an der auslösenden Stelle (Observer/Service/Command) — Fehler fängt
   der Dispatcher selbst, der Geschäftsvorgang bricht nie

Die Regel-Zeile entsteht beim ersten Auslösen bzw. beim Öffnen der Admin-Liste
von selbst; Admin-Formular, Schnell-Schalter, Platzhalter-Hilfe, Digest,
Sichtbarkeitsfilter und „Meine Benachrichtigungen" greifen automatisch.
Konsistenz sichern `tests/Unit/HubEventRegistryTest.php` (Standardwerte,
Platzhalter, Symbole) und `tests/Unit/NotificationDispatchConventionTest.php`
(jeder Katalog-Anlass wird ausgelöst, kein Versand am Katalog vorbei).

**Links:** In-App-Links sind entweder absolute URLs, absolute Pfade (`/hub/…`,
`/admin/…`) oder hub-relative Kurzformen (`news-archiv`, `?news=5`); die
Klick-Handler (Glocke, Mitteilungsseite, Startseite) hängen `/hub/` nur an
relative Links. Für Push normalisiert `HubNotificationDispatcher::pushUrl()`.

**Digest ↔ Sofort:** Wird eine Digest-Regel auf „Sofort" umgestellt, bleiben im
Text oft `{anzahl}`/`{liste}`/`{datum}`; der Dispatcher füllt sie beim
Einzelversand (1, Zusammenfassungszeile, heute), damit nichts als Platzhalter
stehen bleibt.

**Tages-Prüfungen ohne eigenen Scheduler-Job:** `HubDailyChecksService::runDue()`
hängt im minütlichen `notifications:process-automations` (Cloud-Scheduler-Endpunkt
existiert) und läuft ab 07:30 einmal je Tag (Cache-Marke) — ein neuer Cloud-Scheduler-
Job ist nicht nötig. `--force` erzwingt den Lauf.

**Symbole:** `icon_type` ist in MySQL ein ENUM — ein fremder Wert
(`document-check`) ließ die Meldung bis 09/2026 still scheitern (SQLite in
Tests merkt das nicht). Erlaubt ist nur `HubEventRegistry::ICONS`.

### Datenbank-Tabellen

**notifications:**
```sql
- id, type, title, message, link, icon_type
- is_global, target_user_ids, target_institute_ids, target_roles
- is_webhook_template, webhook_provider, webhook_resource_type, webhook_action
- delivery_frequency, digest_time   -- Frequenz je Hub-Regel (immediate/daily_digest)
- is_automation_template, automation_type
- schedule_days, schedule_time, schedule_timezone
- trigger_model, trigger_event, trigger_conditions
- last_automation_sent_at, automation_sent_count
- is_active, channel_in_app, channel_push, user_can_mute   -- Katalog-Schalter (seit 19.09.2026)
- target_permissions, target_event_branch, target_event_owners  -- erweiterte Zielgruppe
- last_triggered_at        -- letzte Auslösung der Regel (Anzeige „Zuletzt ausgelöst")
- source_rule_id           -- Herkunfts-Regel einer versendeten Meldung (NULL = manuell)
- created_at, updated_at
```

**hub_notification_events:** Ereignis-Log je Anlass + Datensatz (`subject_type`,
`subject_id` als String — Model-ID oder Text-Schlüssel), `branch_id`/`branch_ids`,
`owner_user_ids`, `payload`, `summary`, `notification_id`, `digested_at`; Unique-Index
über Anlass + Subject sichert die Idempotenz.

**notification_rule_preferences:** `user_id`, `notification_rule_id`, `in_app`, `push`
— persönliche Kanal-Wahl; fehlt die Zeile, gelten die Kanäle der Regel. Unique je
Nutzer + Regel, Cascade beim Löschen von Nutzer oder Regel.

**push_subscriptions:**
```sql
- id, user_id
- provider          -- 'webpush' oder 'apns'
- native_device_id  -- Persistente Installations-ID (Electron: localStorage, iOS: Keychain-UUID)
- endpoint, endpoint_hash, public_key, auth_token  -- WebPush
- apns_device_token, apns_device_token_hash        -- APNs
- apns_environment  -- 'production' | 'sandbox' (seit 20.09.2026; Xcode-Debug-Builds der iOS-App)
- browser, device_type, device_name, user_agent
- is_active, failure_count, last_used_at
- created_at, updated_at
```

---

## API & Cron-Endpunkte

### Push-API (Frontend)

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/push/vapid-key` | GET | VAPID Public Key abrufen |
| `/push/subscribe` | POST | WebPush-Subscription registrieren |
| `/push/unsubscribe` | POST | WebPush-Subscription entfernen |
| `/push/subscribe/native` | POST | APNs-Token registrieren (Desktop-App, iOS-App) — Felder `device_token`, `native_device_id`, `device_type` (`macos`/`ios`), `device_name`, `browser`, `environment` (`production`/`sandbox`) |
| `/push/unsubscribe/native` | POST | APNs-Token entfernen (Desktop-App, iOS-App) |
| `/push/mark-read` | POST | Aktion „Als gelesen markieren" der iOS-App: `log_id` → Klick verbuchen, verknüpfte In-App-Meldung (`data.notification_id`) für den Nutzer lesen, Antwort `unread_count` für den Badge; nur eigene Push-Logs (sonst 404) |
| `/push/test` | POST | Test-Push senden |

!!! info "Accept-Header erforderlich"
    Alle `/phorest/*`-Routen erfordern den Header `Accept: application/json`, sonst greift die `RedirectDirectApiAccess`-Middleware und gibt HTML zurück statt JSON.

### Cron-Endpunkte (Cloud Scheduler)

| Endpoint | Intervall | Beschreibung |
|----------|-----------|--------------|
| `/api/cron/process-notification-automations` | 1 min | Zeitbasierte Automationen |
| `/api/cron/process-webhooks` | 1 min | Webhook-Queue verarbeiten |
| `/api/cron/process-queue` | 1 min | Job-Queue verarbeiten |

**Authentifizierung:** Header `X-Cron-Token: <token>` erforderlich.

---

## Cloud Deployment

### 1. VAPID Secrets erstellen

```bash
# Secrets anlegen
gcloud secrets create VAPID_PUBLIC_KEY --replication-policy="automatic"
gcloud secrets create VAPID_PRIVATE_KEY --replication-policy="automatic"
gcloud secrets create VAPID_SUBJECT --replication-policy="automatic"

# Werte hinzufügen
echo -n "DEIN_PUBLIC_KEY" | gcloud secrets versions add VAPID_PUBLIC_KEY --data-file=-
echo -n "DEIN_PRIVATE_KEY" | gcloud secrets versions add VAPID_PRIVATE_KEY --data-file=-
echo -n "mailto:email@example.com" | gcloud secrets versions add VAPID_SUBJECT --data-file=-

# Dem Cloud Run Service zuweisen
gcloud run services update glattthub-web \
  --region=europe-west3 \
  --set-secrets="VAPID_PUBLIC_KEY=VAPID_PUBLIC_KEY:latest,VAPID_PRIVATE_KEY=VAPID_PRIVATE_KEY:latest,VAPID_SUBJECT=VAPID_SUBJECT:latest"
```

### 2. Cloud Scheduler für Automationen

```bash
gcloud scheduler jobs create http process-notification-automations \
  --location=europe-west3 \
  --schedule="* * * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/process-notification-automations" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_CRON_TOKEN" \
  --time-zone="Europe/Zurich" \
  --description="Prüft zeitbasierte Notification-Automations jede Minute"
```

---

## Entwicklung & Testing

### Queue Worker starten

**Wichtig:** Ohne Queue Worker werden keine Push-Benachrichtigungen gesendet!

```bash
php artisan queue:work --queue=push,default --sleep=3 --tries=3
```

### Bilder in Benachrichtigungen (seit 24.09.2026)

Jede Meldung kann ein Bild tragen — Spalte `notifications.image` (Migration
`2026_09_24_100000`), Speicherpfad auf dem Bild-Disk (`Notification::imageDisk()`: in der
Cloud der öffentliche GCS-Bucket, lokal `public`) oder eine absolute URL.
`Notification::imageUrl()` macht daraus immer eine **absolute, ohne Anmeldung erreichbare**
URL — die iOS-Erweiterung, der Browser-Push und die Desktop-App laden das Bild ohne
Hub-Sitzung und ohne IAP; deshalb liegen Uploads im öffentlichen Bucket, nie hinter
`hub.glattt.com`.

| Quelle | Wo | Vorrang |
|---|---|---|
| **Festes Bild je Regel** | Admin-Formular „Benachrichtigungs-Details → Bild" (`FileUpload`, `notifications/images/`), auch in den Katalog-Standardwerten (`defaults.image`, `HubEventRuleSync`) | Standard |
| **Individuelles Bild je Meldung** | Payload-Schlüssel `image` beim `dispatch()` (Pfad oder URL), Builder `NotificationService::image()` | schlägt das Regelbild |

Weg durch die Kanäle: `HubNotificationDispatcher::deliver()` legt das Bild auf die In-App-Meldung
(`imageOf()`), `sendPush()` gibt `['image' => absolute URL]` an `PushNotificationService::sendToUsers()`;
`ApplePushNotificationService` setzt `image` + `mutable-content` (Erweiterung `glatttHubNotifications`
hängt es an, siehe [iOS-App](IOS-APP.md)), der Web-Push-Payload trägt `image` (Chrome/Edge zeigen es,
Safari/Firefox ignorieren es), die Desktop-App lädt es in `showDesktopNotification()` per `net.fetch`
und übergibt es als `icon` (Vorschaubild rechts im macOS-Banner). Der JSON-Feed der Glocke
(`GET /phorest/notifications`) liefert `image`; Liste, Detail, Mehr-Sheet, Mitteilungsseite und die
Hinweis-Karte zeigen es statt des Typ-Symbols. Zeitbasierte/aktionsbasierte Automatisierungen
übernehmen das Regelbild (`instanceAttributes()`, `SendNotificationAutomationJob`).
Tests: `tests/Feature/NotificationImageTest.php`.

### Hinweis-Karte im Hub (seit 24.09.2026)

`public/js/hub-notices.js` (`window.GlatttNotices`), eingebunden im Hub-Layout. Die Glocke
(Sidebar) und die mobile Leiste rufen nach jedem Abgleich `track(liste, { silent })`: alles
Ungelesene mit einer ID über dem gemerkten Stand (`sessionStorage` `glattt.notices.seenMaxId`,
gemeinsam für beide Instanzen, daher nichts doppelt) bekommt eine Karte
(`.toast-glattt-notice` im Container `.toast-glattt-container-notices`, unten rechts, mobil oben,
über der Menüleiste; Titel/Text per `textContent`, Vorschaubild, Klick → `POST
/phorest/notifications/{id}/read` + `Livewire.navigate`, × schliesst, 8 s, hält bei Hover,
höchstens drei). Der erste Stand einer Sitzung wird nur gemerkt.

**Sofort statt 120 s:** Push-Ereignisse lösen über `glattt:notifications-refresh` einen Abgleich
aus — der Service Worker meldet jeden Push per `postMessage({ type: 'PUSH_RECEIVED' })` an offene
Seiten, die iOS-App per Bridge-Ereignis `glattt:push-received`, die Desktop-App per
`window.electronPush.onApnsNotification`. Diese Abgleiche sind **stumm** (`silent: true`), weil das
System die Meldung dort schon als Banner gezeigt hat; die Karte kommt für Meldungen ohne Push
(nur „Im Hub") über den 120-s-Takt und beim Zurückkehren in den Tab (`visibilitychange`). In der
iOS-App gibt es nie eine Web-Karte (natives Banner, `body.ios-app`/`window.glatttNative`).

### Testversand aus dem Admin (seit 19.09.2026)

Zwei Aktionen auf *System → Benachrichtigungen*, Logik in
`app/Services/Notifications/NotificationTestSender.php`, Oberfläche in
`app/Filament/Resources/Notifications/NotificationTestActions.php`:

| Aktion | Wo | Text | Empfänger | Kanäle |
|---|---|---|---|---|
| **Test senden** (Kopf) | Reiter-übergreifend | frei (Titel, Nachricht, Link, Bild, Typ, Icon) | Nutzer, Rollen, Rechte, Institute (Heimatfiliale) oder alle | Im Hub / Push frei wählbar — **exakt** die Gewählten, Stummschaltung und Kanal-Wahl bleiben aussen vor |
| **Testen** (Zeile) | nur „Anlässe & Regeln" | Regeltext gerendert wie im Echtbetrieb (`renderRule()`: zeitbasierte Automatisierungen mit Live-Werten, sonst `samplePayload()` — bekannte Platzhalter wie `{kundenname}`, `{betrag}`, `{liste}` mit plausiblen Werten, unbekannte mit ihrer Beschreibung in Guillemets), Regelbild geht mit | wie oben | **wie im Echtbetrieb**: Kanäle der Regel × persönliche Kanal-Wahl (`splitByChannel()`), auch bei inaktiver Regel |

Die Empfänger-Auflösung läuft über denselben `NotificationRecipientResolver::targetedUsers()`
wie echte Regeln (transiente Regel als Sonde) — nur ohne Datensatz-Bezug, also ohne
Sichtbarkeitsfilter. Die Zustellung nutzt `HubNotificationDispatcher::sendPush()`; die
In-App-Meldung entsteht mit `is_test = true`, Präfix **„[Test] "** im Titel und (beim
Regel-Test) `source_rule_id`. Unter „Versendet" steht sie mit Herkunft „🧪 Test: …";
sie zählt **nicht** als Auslösung (kein `HubNotificationEvent`, kein `markTriggered()`,
der 30-Tage-Zähler nutzt `realSentNotifications()`). Die Rückmeldung
(`NotificationTestResult::summary()`) nennt, wer es im Hub bekam, wer per Push mit/ohne
angemeldetem Gerät (`PushSubscription::active()`) und wer wegen Stummschaltung leer
ausging. Push läuft wie immer über die Queue — ohne Worker kommt nichts an.
Tests: `tests/Feature/NotificationTestSendTest.php`.

**Vorsicht:** Ein Test ist ein echter Versand — „An alle aktiven Nutzer" erreicht auf Prod
das ganze Team. Vorbelegt ist der angemeldete Nutzer.

### Test-Commands

```bash
# Zeitbasierte Automationen prüfen (ohne Versand)
php artisan notifications:process-automations --dry-run

# Mit Force (ignoriert Uhrzeit-Check)
php artisan notifications:process-automations --force

# Push-Statistiken anzeigen
php artisan push:statistics
```

### Debugging

```bash
# Laravel Logs live verfolgen
php artisan pail

# Oder klassisch
tail -f storage/logs/laravel.log | grep -i "notification\|push"
```

---

## Checkliste: Neue Installation

**WebPush (Browser/PWA):**
- [ ] VAPID Keys generiert (`php artisan push:generate-vapid-keys`)
- [ ] Queue Worker läuft (`php artisan queue:work`)
- [ ] Service Worker registriert (`/sw.js` erreichbar)
- [ ] Manifest vorhanden (`/manifest.json`)
- [ ] Push-Berechtigung im Browser erteilt
- [ ] Cloud Scheduler konfiguriert (Produktion)

**APNs (Desktop App):**
- [ ] `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_BUNDLE_ID`, `APNS_ENVIRONMENT` gesetzt
- [ ] `APNS_PRIVATE_KEY` (Cloud Run) oder `APNS_PRIVATE_KEY_PATH` (lokal) gesetzt
- [ ] `edamov/pushok` installiert (`composer require edamov/pushok`)
- [ ] Entitlement `aps-environment: production` in `electron/entitlements.mac.plist`
- [ ] App signiert und notarisiert (Provisioning Profile mit Push-Entitlement)
- [ ] Migration `extend_push_subscriptions_for_apns` ausgeführt

---

## Verwandte Dokumentation

- [GoCardless API](GOCARDLESS-API.md) - Webhook-Integration für Zahlungen
- [Cloud Scheduler Setup](CLOUD-SCHEDULER-SETUP.md) - Cron-Jobs in der Cloud

---

## Changelog

- **24.09.2026 — Hinweis-Karte, Bilder, Testversand-Fix:** Neue Mitteilungen erscheinen im
  Hub als Karte (`hub-notices.js`, sofort nach Push, sonst im 120-s-Takt); Meldungen tragen
  ein Bild (`notifications.image`, festes Regelbild im Admin oder individuelles Bild aus dem
  Code) — auf iOS-Sperrbildschirm, Web-Push, Desktop-App und in der Glocke; der Regel-Test
  rendert zeitbasierte Automatisierungen mit Live-Werten statt roher `{{…}}`-Platzhalter.
- **19.09.2026 — Testversand:** „Test senden" (freier Text, Empfänger und Kanäle frei) und
  „Testen" je Anlass-Regel (Beispielwerte, Kanäle/Stummschaltung wie im Echtbetrieb);
  Meldungen mit `is_test`, Präfix „[Test]", Herkunft „Test", zählen nicht als Auslösung.
- **19.09.2026 — Katalog-Runde 2 + GoCardless:** 27 weitere Anlässe (Beratungstermine,
  Vertragsstatus, Leistungsziele, Bonus/Abzeichen, Forderungen/RZV, Empfehlungen,
  Gutschein-Einlösung, Bewertungen, Laser-Störung/Reparatur, Reisekosten, neue
  Kollegin, Widerrufsfrist, fehlgeschlagene Befehle) und die GoCardless-Webhooks als
  angereicherte Katalog-Anlässe (43 Aktionen, deutsche Platzhalter, Digest, Institut
  des Ereignisses). Katalog: 100 Anlässe in 13 Modulen. Provider `gocardless`
  abgelöst (Migration), Typ/Icon-Auswahl im Formular vollständig.
- **19.09.2026 — Benachrichtigungs-Katalog:** Alle ~22 Code-Stellen mit direktem
  `NotificationService` und die drei Push-only-Laser-Typen sind Katalog-Anlässe
  (`HubEventRegistry`, 30 Anlässe in 10 Modulen). Regeln tragen Aktiv/Kanäle/
  `user_can_mute`, Zielgruppe zusätzlich per Recht, Institut des Ereignisses und
  betroffene Person; Admin-Liste mit Reitern „Anlässe & Regeln" (Schnell-Schalter,
  Modul-Gruppierung, zuletzt ausgelöst, 30 Tage) und „Versendet" (Herkunft).
  Nutzer wählen je Anlass „Im Hub"/„Push" (Karte „Meine Benachrichtigungen").
  Zeit-/Aktions-Automatisierungen und GoCardless-Regeln respektieren dieselben
  Schalter und Kanal-Wahlen. Konventions-Test `NotificationDispatchConventionTest`.
