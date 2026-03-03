# 🔔 Benachrichtigungssystem

Das glatttHub Benachrichtigungssystem ermöglicht das Senden von **InApp-Benachrichtigungen** und **Push-Notifications** an Benutzer. Alle Benachrichtigungstypen werden über eine zentrale Stelle im Admin-Panel verwaltet.

## 📍 Zentrale Verwaltung

**Filament Admin → Kommunikation → Benachrichtigungen**

---

## 📋 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Benachrichtigungs-Modi](#benachrichtigungs-modi)
3. [Push-Notifications Setup](#push-notifications-setup)
4. [Platzhalter-System](#platzhalter-system)
5. [Technische Architektur](#technische-architektur)
6. [API & Cron-Endpunkte](#api--cron-endpunkte)
7. [Cloud Deployment](#cloud-deployment)
8. [Entwicklung & Testing](#entwicklung--testing)

---

## Überblick

Das System unterstützt drei Arten von Benachrichtigungen:

| Modus | Trigger | InApp | Push |
|-------|---------|-------|------|
| ✍️ Manuell | Sofort beim Erstellen | ✅ | ✅ |
| 🔄 Webhook | GoCardless Event | ✅ | ✅ |
| ⏰ Zeitbasiert | Cron (Cloud Scheduler) | ✅ | ✅ |
| ⚡ Aktionsbasiert | Datenbank-Event | ✅ | ✅ |

**Wichtig:** Jede Benachrichtigung löst automatisch **sowohl** eine InApp-Benachrichtigung **als auch** eine Push-Notification aus!

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

### 2. 🔄 Webhook-Automatisierungen

Automatische Benachrichtigungen bei GoCardless Events (Zahlungen, Mandate, etc.).

**Konfiguration:**
1. Modus: "Webhook-Automatisierung" wählen
2. Provider: GoCardless
3. Ressourcen-Typ: z.B. "Zahlungen"
4. Aktion: z.B. "failed" (Zahlung fehlgeschlagen)
5. Titel/Nachricht mit Platzhaltern: `Zahlung {resource_id} fehlgeschlagen: {cause}`

**Unterstützte Events:**

| Ressource | Events |
|-----------|--------|
| Zahlungen | created, submitted, confirmed, paid_out, failed, cancelled, charged_back |
| Mandate | created, active, failed, cancelled, expired |
| Abonnements | created, payment_created, cancelled, finished |
| Erstattungen | created, paid, failed |
| Auszahlungen | paid |

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
│   ├── NotificationService.php             # Manuelle Benachrichtigungen
│   └── PushNotificationService.php         # Push-Versand
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

### Datenbank-Tabellen

**notifications:**
```sql
- id, type, title, message, link, icon_type
- is_global, target_user_ids, target_institute_ids, target_roles
- is_webhook_template, webhook_provider, webhook_resource_type, webhook_action
- is_automation_template, automation_type
- schedule_days, schedule_time, schedule_timezone
- trigger_model, trigger_event, trigger_conditions
- last_automation_sent_at, automation_sent_count
- created_at, updated_at
```

**push_subscriptions:**
```sql
- id, user_id, endpoint, p256dh_key, auth_key
- browser, os, device_name, is_active
- created_at, updated_at
```

---

## API & Cron-Endpunkte

### Push-API (Frontend)

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/push/vapid-key` | GET | VAPID Public Key abrufen |
| `/push/subscribe` | POST | Push-Subscription registrieren |
| `/push/unsubscribe` | POST | Push-Subscription entfernen |
| `/push/test` | POST | Test-Push senden |

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

- [ ] VAPID Keys generiert (`php artisan push:generate-vapid-keys`)
- [ ] Queue Worker läuft (`php artisan queue:work`)
- [ ] Service Worker registriert (`/sw.js` erreichbar)
- [ ] Manifest vorhanden (`/manifest.json`)
- [ ] Push-Berechtigung im Browser erteilt
- [ ] Cloud Scheduler konfiguriert (Produktion)

---

## Verwandte Dokumentation

- [GoCardless API](GOCARDLESS-API.md) - Webhook-Integration für Zahlungen
- [Cloud Scheduler Setup](CLOUD-SCHEDULER-SETUP.md) - Cron-Jobs in der Cloud
