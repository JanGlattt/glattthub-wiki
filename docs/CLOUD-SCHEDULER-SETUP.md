# Google Cloud Scheduler Setup für Cron-Jobs

Diese Anleitung beschreibt, wie die automatischen Cronjobs für glattthub auf Google Cloud Run eingerichtet werden.

## Übersicht

Da Cloud Run serverless ist (Container laufen nur bei Requests), können keine traditionellen Cronjobs verwendet werden. Stattdessen nutzen wir **Google Cloud Scheduler**, der HTTP-Requests an unsere API-Endpoints sendet.

## Kurzübersicht: Was wird wo eingetragen?

| Wo | Was | Beispiel |
|---------------------------------------|---------------------|-------------------|
| **Cloud Run** → Environment Variables | `CRON_SECRET_TOKEN` | `a4f8e2b9c1d7...` |
| **Cloud Scheduler** → Job Headers     | `X-Cron-Token`      | Derselbe Token!   |

> ⚠️ **Wichtig:** Der Token muss an beiden Stellen **identisch** sein!

---

## Schritt 1: Token generieren

Öffne dein Terminal und führe aus:

```bash
openssl rand -hex 32
```

Das gibt dir einen zufälligen Token aus, z.B.:
```
a4f8e2b9c1d7e5f3a2b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

📋 **Kopiere diesen Token** – du brauchst ihn in Schritt 2 und 3!

---

## Schritt 2: Token in Cloud Run speichern

Der Token muss als **Umgebungsvariable** in deiner Cloud Run App gespeichert werden, damit die App eingehende Cron-Requests authentifizieren kann.

### Option A: Via Google Cloud Console (empfohlen)

1. Öffne: https://console.cloud.google.com/run
2. Klicke auf deinen Service **`glattthub-web`**
3. Klicke oben auf **"Edit & Deploy New Revision"**
4. Scrolle runter zu **"Variables & Secrets"**
5. Wähle den Tab **"Environment Variables"**
6. Klicke **"+ Add Variable"**:
   - **Name:** `CRON_SECRET_TOKEN`
   - **Value:** `DEIN_KOPIERTER_TOKEN` (aus Schritt 1)
7. Klicke **"Deploy"**

### Option B: Via Terminal

```bash
gcloud run services update glattthub-web \
  --region=europe-west3 \
  --update-env-vars="CRON_SECRET_TOKEN=DEIN_KOPIERTER_TOKEN"
```

---

## Schritt 3: Cloud Scheduler Jobs erstellen

Jetzt erstellst du die Scheduler Jobs. Diese senden HTTP-Requests an deine App – mit dem **gleichen Token** im Header.

### Option A: Via Google Cloud Console (empfohlen)

1. Öffne: https://console.cloud.google.com/cloudscheduler
2. Klicke **"Create Job"**

#### Job 1: Sync Historic Appointments (täglich um 03:00)

| Feld | Wert |
|------|------|
| **Name** | `sync-historic-appointments` |
| **Region** | `europe-west3` |
| **Frequency** | `0 3 * * *` |
| **Timezone** | `Europe/Zurich` |

Bei **Target**:
| Feld | Wert |
|------|------|
| **Target type** | HTTP |
| **URL** | `https://DEINE-CLOUD-RUN-URL/api/cron/sync-historic-appointments` |
| **HTTP method** | POST |

Klappe **"Show optional settings"** aus → **"Headers"**:
| Header Name | Header Value |
|-------------|--------------|
| `X-Cron-Token` | `DEIN_KOPIERTER_TOKEN` (aus Schritt 1) |
| `Content-Type` | `application/json` |

Klicke **"Create"**

---

#### Job 2: Sync Upcoming Consultations (täglich um 03:00)

| Feld | Wert |
|------|------|
| **Name** | `sync-upcoming-consultations` |
| **Region** | `europe-west3` |
| **Frequency** | `0 3 * * *` |
| **Timezone** | `Europe/Zurich` |

Bei **Target**:
| Feld | Wert |
|------|------|
| **Target type** | HTTP |
| **URL** | `https://DEINE-CLOUD-RUN-URL/api/cron/sync-upcoming-consultations` |
| **HTTP method** | POST |

**Headers** (wie oben):
| Header Name | Header Value |
|-------------|--------------|
| `X-Cron-Token` | `DEIN_KOPIERTER_TOKEN` (aus Schritt 1) |
| `Content-Type` | `application/json` |

> **Hinweis:** Dieser Job synct alle Beratungstermine für die nächsten 28 Tage und erkennt automatisch stornierte Termine.

Klicke **"Create"**

---

#### Job 3: Sync Free Consulting Slots (täglich um 03:00)

| Feld | Wert |
|------|------|
| **Name** | `sync-free-consulting-slots` |
| **Region** | `europe-west3` |
| **Frequency** | `0 3 * * *` |
| **Timezone** | `Europe/Zurich` |

Bei **Target**:
| Feld | Wert |
|------|------|
| **Target type** | HTTP |
| **URL** | `https://DEINE-CLOUD-RUN-URL/api/cron/sync-free-slots` |
| **HTTP method** | POST |

**Headers** (wie oben):
| Header Name | Header Value |
|-------------|--------------|
| `X-Cron-Token` | `DEIN_KOPIERTER_TOKEN` (aus Schritt 1) |
| `Content-Type` | `application/json` |

> **Hinweis:** Dieser Job läuft um 03:00 nachts und speichert die freien Beratungsslots für den **aktuellen Tag** in der Datenbank.

Klicke **"Create"**

---

#### Job 4: Cache Consultation Stats (alle 15 Minuten)

| Feld | Wert |
|------|------|
| **Name** | `cache-consultation-stats` |
| **Region** | `europe-west3` |
| **Frequency** | `*/15 * * * *` |
| **Timezone** | `Europe/Zurich` |

Bei **Target**:
| Feld | Wert |
|------|------|
| **Target type** | HTTP |
| **URL** | `https://DEINE-CLOUD-RUN-URL/api/cron/cache-consultation-stats` |
| **HTTP method** | POST |

**Headers** (wie oben):
| Header Name | Header Value |
|-------------|--------------|
| `X-Cron-Token` | `DEIN_KOPIERTER_TOKEN` (aus Schritt 1) |
| `Content-Type` | `application/json` |

Klicke **"Create"**

---

### Option B: Via Terminal

```bash
# Job 1: Historic Appointments Sync
gcloud scheduler jobs create http sync-historic-appointments \
  --location=europe-west3 \
  --schedule="0 3 * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/sync-historic-appointments" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Zurich" \
  --description="Syncs historic appointments from Phorest API to database" \
  --attempt-deadline="1800s"

# Job 2: Upcoming Consultations Sync
gcloud scheduler jobs create http sync-upcoming-consultations \
  --location=europe-west3 \
  --schedule="0 3 * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/sync-upcoming-consultations" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Zurich" \
  --description="Syncs upcoming consultation appointments with cancelled tracking" \
  --attempt-deadline="600s"

# Job 3: Free Consulting Slots Sync
gcloud scheduler jobs create http sync-free-consulting-slots \
  --location=europe-west3 \
  --schedule="0 3 * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/sync-free-slots" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Zurich" \
  --description="Syncs free consulting slots for today from Phorest API" \
  --attempt-deadline="300s"

# Job 4: Consultation Stats Cache
gcloud scheduler jobs create http cache-consultation-stats \
  --location=europe-west3 \
  --schedule="*/15 * * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/cache-consultation-stats" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Zurich" \
  --description="Refreshes consultation statistics cache" \
  --attempt-deadline="300s"

# Job 5: Process Queue (Push Notifications)
gcloud scheduler jobs create http process-queue \
  --location=europe-west3 \
  --schedule="* * * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/process-queue" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Zurich" \
  --description="Processes queued jobs (Push Notifications, etc.)" \
  --attempt-deadline="60s"

# Job 6: Process Push Automations
gcloud scheduler jobs create http process-push-automations \
  --location=europe-west3 \
  --schedule="* * * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/process-push-automations" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Zurich" \
  --description="Checks and triggers time-based push automations" \
  --attempt-deadline="60s"

# Job 7: Sync Client Courses (glattt-Pakete)
gcloud scheduler jobs create http sync-client-courses \
  --location=europe-west3 \
  --schedule="0 4 * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/sync-client-courses" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Zurich" \
  --description="Syncs client courses (glattt-Pakete) from Phorest API" \
  --attempt-deadline="1800s"

# Job 8: Sync Client Statistics (Nightly Delta-Sync)
gcloud scheduler jobs create http sync-client-statistics \
  --location=europe-west3 \
  --schedule="30 3 * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/sync-client-statistics" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Zurich" \
  --description="Nightly delta sync of client statistics (demographics, contracts, consultations)" \
  --attempt-deadline="1800s"
```

> **Hinweis:** Ersetze `DEINE-CLOUD-RUN-URL` mit der tatsächlichen URL (z.B. `glattthub-web-abc123-ey.a.run.app`)

## 4. Jobs testen

### Manuell über gcloud:

```bash
gcloud scheduler jobs run sync-historic-appointments --location=europe-west3
gcloud scheduler jobs run sync-upcoming-consultations --location=europe-west3
gcloud scheduler jobs run sync-free-consulting-slots --location=europe-west3
gcloud scheduler jobs run cache-consultation-stats --location=europe-west3
gcloud scheduler jobs run process-queue --location=europe-west3
gcloud scheduler jobs run process-push-automations --location=europe-west3
gcloud scheduler jobs run sync-client-courses --location=europe-west3
gcloud scheduler jobs run sync-client-statistics --location=europe-west3
```

### Manuell per curl:

```bash
# Health Check (ohne Auth)
curl https://glattthub-web-99200336070.europe-west3.run.app/api/cron/health

# Sync Historic Appointments (mit Auth)
curl -X POST \
  -H "X-Cron-Token: 07dc96b65a52073fdf4eaa959d676980dc3ccb5334326f1406640335aab66718" \
  -H "Content-Type: application/json" \
  https://glattthub-web-99200336070.europe-west3.run.app/api/cron/sync-historic-appointments

# Sync Upcoming Consultations (mit Auth)
curl -X POST \
  -H "X-Cron-Token: 07dc96b65a52073fdf4eaa959d676980dc3ccb5334326f1406640335aab66718" \
  -H "Content-Type: application/json" \
  https://glattthub-web-99200336070.europe-west3.run.app/api/cron/sync-upcoming-consultations

# Sync Free Consulting Slots (mit Auth)
curl -X POST \
  -H "X-Cron-Token: 07dc96b65a52073fdf4eaa959d676980dc3ccb5334326f1406640335aab66718" \
  -H "Content-Type: application/json" \
  https://glattthub-web-99200336070.europe-west3.run.app/api/cron/sync-free-slots

# Cache Consultation Stats (mit Auth)
curl -X POST \
  -H "X-Cron-Token: 07dc96b65a52073fdf4eaa959d676980dc3ccb5334326f1406640335aab66718" \
  -H "Content-Type: application/json" \
  https://glattthub-web-99200336070.europe-west3.run.app/api/cron/cache-consultation-stats

# Sync Client Courses / glattt-Pakete (mit Auth)
curl -X POST \
  -H "X-Cron-Token: 07dc96b65a52073fdf4eaa959d676980dc3ccb5334326f1406640335aab66718" \
  -H "Content-Type: application/json" \
  https://glattthub-web-99200336070.europe-west3.run.app/api/cron/sync-client-courses

# Sync Client Statistics / Nightly Delta-Sync (mit Auth)
curl -X POST \
  -H "X-Cron-Token: 07dc96b65a52073fdf4eaa959d676980dc3ccb5334326f1406640335aab66718" \
  -H "Content-Type: application/json" \
  https://glattthub-web-99200336070.europe-west3.run.app/api/cron/sync-client-statistics
```

## 5. Logs überprüfen

```bash
# Cloud Scheduler Logs
gcloud logging read 'resource.type="cloud_scheduler_job"' --limit=10 --format=json

# Cloud Run Logs (Cron-Requests)
gcloud logging read 'resource.type="cloud_run_revision" AND textPayload:"Cron:"' --limit=20
```

## API-Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/cron/health` | GET | Health Check (ohne Auth) |
| `/api/cron/sync-historic-appointments` | POST | Sync historische Termine |
| `/api/cron/sync-upcoming-consultations` | POST | Sync zukünftige Beratungen (28 Tage) mit Cancelled-Tracking |
| `/api/cron/sync-free-slots` | POST | Sync freie Beratungsslots für heute |
| `/api/cron/cache-consultation-stats` | POST | Cache Beratungsstatistiken |
| `/api/cron/process-queue` | POST | Verarbeitet Queue-Jobs (Push, etc.) |
| `/api/cron/process-push-automations` | POST | Prüft/triggert zeitbasierte Push-Automations |
| `/api/cron/sync-client-courses` | POST | Sync Client Courses / glattt-Pakete (täglich) |
| `/api/cron/sync-client-statistics` | POST | Nightly Delta-Sync Client Statistics (täglich) |

## Sicherheit

- Alle Cron-Endpoints (außer Health Check) erfordern den `X-Cron-Token` Header
- Token wird über `CRON_SECRET_TOKEN` Umgebungsvariable konfiguriert
- Fehlgeschlagene Authentifizierungsversuche werden geloggt

## Troubleshooting

### Job läuft nicht
1. Prüfe ob Cloud Scheduler API aktiviert ist
2. Prüfe die URL (muss öffentlich erreichbar sein)
3. Prüfe die Logs: `gcloud scheduler jobs describe JOB_NAME --location=europe-west3`

### 401 Unauthorized
1. Prüfe ob `CRON_SECRET_TOKEN` in Cloud Run gesetzt ist
2. Prüfe ob der Header `X-Cron-Token` korrekt ist
3. Prüfe die Laravel Logs auf Details

### Timeout
1. Erhöhe `--attempt-deadline` im Job
2. Prüfe ob Cloud Run genug Ressourcen hat
3. Optimiere die Sync-Logik falls nötig
