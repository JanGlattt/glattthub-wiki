# Google Cloud Scheduler Setup für Cron-Jobs

Diese Anleitung beschreibt, wie die automatischen Cronjobs für glattthub auf Google Cloud Run eingerichtet werden.

## Übersicht

Da Cloud Run serverless ist (Container laufen nur bei Requests), können keine traditionellen Cronjobs verwendet werden. Stattdessen nutzen wir **Google Cloud Scheduler**, der HTTP-Requests an unsere API-Endpoints sendet.

!!! danger "Der Laravel-Scheduler läuft in Produktion NICHT"
    Kein Container führt `schedule:run` aus (weder Web noch Worker — der Worker macht
    ausschließlich `queue:work`). Ein Eintrag in `routes/console.php` ist deshalb
    **reine Dokumentation** und löst von sich aus gar nichts aus.

    **Jeder geplante Befehl braucht drei Dinge:**

    1. `Schedule::command(...)` in `routes/console.php` (Zeitpunkt dokumentieren)
    2. einen Cron-Endpoint in `routes/api.php` → `CronController`
    3. einen **Cloud-Scheduler-Job**, der diesen Endpoint aufruft

    Fehlt Punkt 3, läuft der Befehl nie — ohne Fehlermeldung. Bei der Prüfung am
    02.08.2026 traf das auf **sieben** Aufgaben zu, darunter
    `gocardless:reconcile-payments` (Sicherheitsnetz für ausgefallene
    Zahlungs-Webhooks, seit 07/2026 nie gelaufen) und `askdante:sync` (Datenbasis der
    HR-Kennzahlen). Am **16.08.2026** fielen beim Durchsehen von Hand **drei weitere**
    auf, alle erst wenige Tage alt: `contracts:check-onsite-payments`,
    `receivables:sync-client-account-balances` und
    `receivables:detect-client-account-debts` — der komplette Flex-Zahler-Einstieg
    ins Forderungsmanagement war damit seit dem 10.08. tot.

!!! success "Prüfung: `php artisan cron:audit`"
    Seit 16.08.2026 gibt es dafür ein Werkzeug, das **alle drei Punkte** abgleicht —
    inklusive der Frage, ob der Cloud-Scheduler-Job wirklich existiert:

    ```bash
    php artisan cron:audit                 # Prod (Standard)
    php artisan cron:audit --target=staging
    ```

    Es liest die Job-Liste per `gcloud` (lokal, angemeldet), meldet fehlende und
    pausierte Jobs und liefert Exit-Code 1 — damit auch in CI nutzbar. Ohne gcloud:
    `gcloud scheduler jobs list --format=json > jobs.json` und
    `php artisan cron:audit --jobs=jobs.json`.

    **Nach jedem neuen `Schedule::command(...)` einmal laufen lassen.** Zwei
    Fallstricke, die der Befehl bereits berücksichtigt und die beim Prüfen von Hand
    regelmäßig zu Fehlschlüssen führen:

    - **Abgeglichen wird über die Job-URI, nicht den Job-Namen.** Im Bestand weichen
      beide ab: `sync-free-consulting-slots` ruft `/api/cron/sync-free-slots`, und
      `matomo-sync-visits-staging` sowie `prune-matomo-actions-staging` zeigen trotz
      ihres Namens auf **Prod**.
    - **Prod hängt an zwei Hosts:** `hub.glattt.com` *und* der run.app-URL des
      Dienstes. Wer nur die Custom Domain prüft, hält die halbe Liste für fehlend.
      Staging erkennt man am Präfix `glattthub-web-staging`.

    Die Zuordnung „Befehl → Endpoint" steht einmalig in
    `app/Support/CronSchedule.php`; `CronScheduleCoverageTest` prüft daraus Punkt 1
    und 2, `CronAuditCommandTest` deckt den Befehl selbst ab.

!!! tip "Neue Jobs immer mit Retries anlegen"
    `--max-retry-attempts=3` setzen. Ohne Retries reicht ein Cold-Start-502, um einen
    nächtlichen Lauf komplett ausfallen zu lassen — der Job gilt dann als „ausgeführt".

    Als Ziel-URL `https://hub.glattt.com/...` verwenden, nicht die rohe
    `run.app`-URL.

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

!!! warning "Die nummerierte Liste unten ist historisch, nicht vollständig"
    Sie zeigt, **wie** ein Job angelegt wird — nicht, welche es gibt. Seit 08/2026
    sind etliche dazugekommen (Terminerinnerungen, Report-Mails, Forderungs-Jobs),
    die hier nie nachgetragen wurden. Der aktuelle Stand kommt immer aus der Cloud:

    ```bash
    php artisan cron:audit                 # Soll/Ist inkl. fehlender Jobs
    gcloud scheduler jobs list --location=europe-west3 \
      --format="table(name.basename(),schedule,state,httpTarget.uri)"
    ```

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

# Job 9: Sync Superchat Consultation Dates (Nightly)
gcloud scheduler jobs create http sync-superchat-consultation-dates \
  --location=europe-west3 \
  --schedule="15 3 * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/sync-superchat-consultation-dates" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Zurich" \
  --description="Setzt/entfernt Superchat Beratungstermin anhand aktueller (nicht stornierter) Beratungen" \
  --attempt-deadline="1800s"

# Job: Sync Recent Appointments (Termine von heute + Nachzügler, alle 15 Min)
# Ohne diesen Lauf fehlt der laufende Tag in allen Auswertungen — der nächtliche
# sync:appointments holt nur den Vortag.
gcloud scheduler jobs create http sync-recent-appointments \
  --location=europe-west3 \
  --schedule="*/15 * * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/sync-recent-appointments" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Berlin" \
  --description="Holt Termine der letzten 3 Tage nach und leert die Report-Caches" \
  --attempt-deadline="600s" \
  --max-retry-attempts=3 --min-backoff=10s

# Job: Sync Staff Shifts (Schichtzeiten für Behandlungs-Ranking/Auslastung)
# Rollierendes Fenster (35 Tage zurück bis heute); Backfill einmalig per curl
# mit from=2023-01-01 (siehe unten).
# Angelegt 01.08.2026 als `sync-staff-shifts` (Prod) und
# `sync-staff-shifts-staging` (Staging, --uri auf glattthub-web-staging).
gcloud scheduler jobs create http sync-staff-shifts \
  --location=europe-west3 \
  --schedule="30 3 * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/sync-staff-shifts" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Berlin" \
  --description="Syncs staff work shifts (Phorest WorkTimeTable) for utilization analysis" \
  --attempt-deadline="1800s" \
  --max-retry-attempts=3 --min-backoff=10s

# Job 10: Sync Knowledge Base (Nightly Delta-Sync Drive → OpenAI Vector Store)
gcloud scheduler jobs create http sync-knowledge-base \
  --location=europe-west3 \
  --schedule="0 3 * * *" \
  --uri="https://DEINE-CLOUD-RUN-URL/api/cron/sync-knowledge-base" \
  --http-method=POST \
  --headers="X-Cron-Token=DEIN_KOPIERTER_TOKEN,Content-Type=application/json" \
  --time-zone="Europe/Berlin" \
  --description="Nightly delta sync der Wissensdatenbank (Google Drive → OpenAI Vector Store) für GlatttBert" \
  --attempt-deadline="1800s"
```

### Nachgezogene Jobs (02.08.2026)

Diese sieben Befehle waren in `routes/console.php` geplant, hatten aber keinen
Auslöser und liefen deshalb nie. Zwei Endpoints existierten bereits, die anderen
fünf wurden zusammen mit den Jobs ergänzt.

```bash
TOKEN=$(gcloud scheduler jobs describe process-webhooks --location=europe-west3 \
  --format="value(httpTarget.headers.'X-Cron-Token')")

# GoCardless-Sicherheitsnetz — der wichtigste der sieben
gcloud scheduler jobs create http reconcile-gocardless-payments \
  --location=europe-west3 --schedule="0 6 * * *" --time-zone="Europe/Berlin" \
  --uri="https://hub.glattt.com/api/cron/reconcile-gocardless-payments" \
  --http-method=POST --headers="X-Cron-Token=$TOKEN" \
  --attempt-deadline=1800s --max-retry-attempts=3 --min-backoff=30s

# Beratungs-Statistik-Cache (Wiki nannte „alle 15 Minuten", lief nie)
gcloud scheduler jobs create http cache-consultation-stats \
  --location=europe-west3 --schedule="*/15 * * * *" --time-zone="Europe/Berlin" \
  --uri="https://hub.glattt.com/api/cron/cache-consultation-stats" \
  --http-method=POST --headers="X-Cron-Token=$TOKEN" \
  --attempt-deadline=600s --max-retry-attempts=3 --min-backoff=30s

# Die folgenden fünf Endpoints entstanden erst mit diesem Commit —
# Jobs erst NACH dem Prod-Deploy anlegen, sonst laufen sie in 404.
gcloud scheduler jobs create http sync-phorest-staff \
  --location=europe-west3 --schedule="15 4 * * *" --time-zone="Europe/Berlin" \
  --uri="https://hub.glattt.com/api/cron/sync-phorest-staff" \
  --http-method=POST --headers="X-Cron-Token=$TOKEN" \
  --attempt-deadline=1800s --max-retry-attempts=3 --min-backoff=30s

gcloud scheduler jobs create http sync-askdante \
  --location=europe-west3 --schedule="30 4 * * *" --time-zone="Europe/Berlin" \
  --uri="https://hub.glattt.com/api/cron/sync-askdante" \
  --http-method=POST --headers="X-Cron-Token=$TOKEN" \
  --attempt-deadline=1800s --max-retry-attempts=3 --min-backoff=30s

gcloud scheduler jobs create http check-laser-reminders \
  --location=europe-west3 --schedule="30 7 * * *" --time-zone="Europe/Berlin" \
  --uri="https://hub.glattt.com/api/cron/check-laser-reminders" \
  --http-method=POST --headers="X-Cron-Token=$TOKEN" \
  --attempt-deadline=600s --max-retry-attempts=3 --min-backoff=30s

gcloud scheduler jobs create http check-company-contract-deadlines \
  --location=europe-west3 --schedule="0 8 * * *" --time-zone="Europe/Berlin" \
  --uri="https://hub.glattt.com/api/cron/check-company-contract-deadlines" \
  --http-method=POST --headers="X-Cron-Token=$TOKEN" \
  --attempt-deadline=600s --max-retry-attempts=3 --min-backoff=30s

gcloud scheduler jobs create http sync-wiki \
  --location=europe-west3 --schedule="30 2 * * *" --time-zone="Europe/Berlin" \
  --uri="https://hub.glattt.com/api/cron/sync-wiki" \
  --http-method=POST --headers="X-Cron-Token=$TOKEN" \
  --attempt-deadline=1800s --max-retry-attempts=3 --min-backoff=30s

gcloud scheduler jobs create http check-cancellation-follow-ups \
  --location=europe-west3 --schedule="0 8 * * *" --time-zone="Europe/Berlin" \
  --uri="https://hub.glattt.com/api/cron/check-cancellation-follow-ups" \
  --http-method=POST --headers="X-Cron-Token=$TOKEN" \
  --attempt-deadline=600s --max-retry-attempts=3 --min-backoff=30s
```

> **Hinweis:** Ersetze `DEINE-CLOUD-RUN-URL` mit der tatsächlichen URL (z.B. `glattthub-web-abc123-ey.a.run.app`)

> **Immer `--max-retry-attempts` setzen.** Cloud Run skaliert (vor allem auf
> Staging) auf null herunter. Trifft ein Scheduler-Request auf einen Cold Start,
> antwortet nginx mit **502**, solange php-fpm noch hochfährt — der Job scheitert
> dann mit Status 13 (INTERNAL) und der nächtliche Sync fällt ersatzlos aus.
> Beim Anlegen von `sync-staff-shifts-staging` am 01.08.2026 genau so passiert;
> mit drei Wiederholungen läuft derselbe Job sauber durch. Jobs ohne
> `retryCount` sind entsprechend einen Blick wert.

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
gcloud scheduler jobs run sync-superchat-consultation-dates --location=europe-west3
gcloud scheduler jobs run sync-staff-shifts --location=europe-west3
gcloud scheduler jobs run sync-knowledge-base --location=europe-west3
```

### Einmaliger Schichtzeiten-Backfill (nach dem ersten Deploy des Behandlungs-Rankings):

```bash
curl -X POST \
  -H "X-Cron-Token: DEIN_TOKEN" \
  -H "Content-Type: application/json" \
  "https://DEINE-CLOUD-RUN-URL/api/cron/sync-staff-shifts?from=2023-01-01"
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

# Sync Superchat Consultation Dates (mit Auth)
curl -X POST \
  -H "X-Cron-Token: 07dc96b65a52073fdf4eaa959d676980dc3ccb5334326f1406640335aab66718" \
  -H "Content-Type: application/json" \
  https://glattthub-web-99200336070.europe-west3.run.app/api/cron/sync-superchat-consultation-dates

# Sync Knowledge Base / GlatttBert (mit Auth)
curl -X POST \
  -H "X-Cron-Token: 07dc96b65a52073fdf4eaa959d676980dc3ccb5334326f1406640335aab66718" \
  -H "Content-Type: application/json" \
  https://glattthub-web-99200336070.europe-west3.run.app/api/cron/sync-knowledge-base
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
| `/api/cron/sync-superchat-consultation-dates` | POST | Setzt/löscht Superchat-Attribut "Beratungstermin" täglich um 03:15 |
| `/api/cron/sync-knowledge-base` | POST | Nightly Delta-Sync der Wissensdatenbank Drive → OpenAI Vector Store (täglich um 03:00) |

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
