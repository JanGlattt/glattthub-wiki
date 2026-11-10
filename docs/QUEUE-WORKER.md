# Queue-Worker (Cloud Run)

Stand: Juli 2026 — dauerhafter Queue-Worker als eigener Cloud-Run-Service.

## Für Endanwender

Push-Benachrichtigungen, Superchat-Webhooks und andere Hintergrund-Aufgaben werden jetzt von einem dauerhaft laufenden Hintergrund-Dienst verarbeitet — rund um die Uhr, auch nachts, mit Latenz unter einer Sekunde (vorher: bis zu 60 Sekunden, max. 20 Jobs pro Minute).

## Für Entwickler

### Architektur

- **Vorher:** Cloud Scheduler rief minütlich `POST /api/cron/process-queue` auf (`CronController::processQueue`) — max. 20 Jobs/Minute, `Artisan::call('queue:work --once')` in Schleife (Framework-Boot pro Job), bis zu 60s Latenz.
- **Jetzt:** Eigener Cloud-Run-Service `glattthub-worker` (Staging: `glattthub-worker-staging`) aus **demselben Container-Image** wie der Web-Service, aber mit Entrypoint `/entrypoint-worker.sh`:
  - kein nginx/php-fpm, keine Migrationen (fährt der Web-Service beim Deploy; `--isolated`-Lock verhindert Doppel-Migration ohnehin)
  - supervisord (`docker/supervisord-worker.conf`) startet diese Prozesse:
    - `reverb`: `php artisan reverb:start --host=0.0.0.0 --port=$PORT` — **Echtzeit (Laravel Reverb) läuft seit 10.11.2026 im Worker mit** und ist zugleich der Port-Listener für den Cloud-Run-Startup-Probe (`GET /up` antwortet 200). Vorher lief ein eigener Reverb-Dienst (~55 €/Monat je Umgebung) neben einem Mini-Health-Server; beides ist entfallen. Details: [Echtzeit mit Laravel Reverb](REVERB-ECHTZEIT.md).
    - `queue-push`: nur die `push`-Warteschlange, `--sleep=0.5` (Chat-Mitteilungen ohne Wartezeit)
    - `queue-worker`: `php artisan queue:work --queue=push,default --tries=3 --max-time=3600 --sleep=3` — `--max-time` beendet den Prozess stündlich gegen Memory-Leaks, Supervisor startet neu
    - `queue-media` (ffmpeg, glatttipedia-Videos), `queue-stats` (Statistik-Cache, bis 25 Minuten je Job), `portal-outbox` (Aufträge des Kundenportals)
- Cloud-Run-Konfiguration: `--no-cpu-throttling` (CPU immer zugeteilt, sonst hungert der Worker zwischen Requests), `max-instances=1`, **1 vCPU / 2 GiB** (seit 10.11.2026; die CPU lag 14 Tage lang bei höchstens 14 % von 2 vCPU, der Speicher bei ~1 GiB — ffmpeg und Chromium brauchen den Puffer), `--allow-unauthenticated` + `--ingress internal-and-cloud-load-balancing` (der Load Balancer erreicht Reverb über den Host `live.hub.glattt.com`, sonst kommt nichts an), `--timeout 3600` (längste WebSocket-Dauer), `--concurrency 1000`.
- **Prod:** `min-instances=1`, dauerhaft wach (~64 €/Monat). **Staging:** `min-instances=0` — der Scheduler-Job `wake-worker-staging` ruft `GET /up` alle drei Minuten Mo–Sa 06–20 Uhr (Europe/Berlin) auf, dadurch bleibt genau eine Instanz zu Arbeitszeiten wach; nachts und sonntags skaliert Staging auf null, liegengebliebene Jobs laufen am Morgen. Offene WebSocket-Verbindungen halten die Instanz ebenfalls wach. Ein Job, der genau beim Herunterfahren läuft, bricht ab (Staging-Risiko, bewusst in Kauf genommen).

### Deploy

`cloudbuild.yaml` / `cloudbuild-staging.yaml` enthalten einen Worker-Deploy-Step, der **nur ausgeführt wird, wenn der Service bereits existiert** — damit der Service nie ohne Env-Vars/Secrets entsteht.

### Ersteinrichtung (einmalig, pro Umgebung)

Der Worker braucht dieselben Env-Vars, Secrets und die Cloud-SQL-Anbindung wie der Web-Service. Einmalig manuell anlegen (Beispiel Staging):

```bash
# 1. Aktuelle Web-Konfiguration ansehen (Env/Secrets/Cloud-SQL abschreiben)
gcloud run services describe glattthub-web-staging --region europe-west3 --format export > web-config.yaml

# 2. Worker-Service mit identischer Env-Konfiguration anlegen
gcloud run deploy glattthub-worker-staging \
  --image europe-west3-docker.pkg.dev/glattthub/glattthub-docker/glattthub-web-staging:<aktueller-tag> \
  --region europe-west3 --project glattthub \
  --command /entrypoint-worker.sh \
  --no-allow-unauthenticated \
  --no-cpu-throttling \
  --add-cloudsql-instances glattthub:europe-west3:glattthub \
  --memory 1Gi --cpu 1 \
  --min-instances=1 --max-instances=1 \
  --set-env-vars "<ENV-VARS wie beim Web-Service>" \
  --set-secrets "<SECRETS wie beim Web-Service>"
```

Ab dann aktualisiert jeder Push das Image automatisch mit (Bedingungs-Step in cloudbuild).

### Umschaltung & Rollback

1. Worker in **Staging** verifizieren: Test-Job dispatchen, Logs prüfen (`jobs`-Tabelle leert sich in Sekunden).
2. Cloud-Scheduler-Job für `POST /api/cron/process-queue` **pausieren** (erst Staging, nach 1 Tag Beobachtung Prod).
3. Die Route und `CronController::processQueue` bleiben als Fallback bestehen — bei Worker-Problemen einfach den Scheduler-Job wieder aktivieren.

### Vor dem ersten Start prüfen

In der `jobs`-Tabelle können Alt-Jobs liegen, die nie verarbeitet wurden. Vor der Ersteinrichtung prüfen und bewusst entscheiden (verarbeiten lassen oder `php artisan queue:clear database`). Failed Jobs landen in `failed_jobs` (`--tries=3`); Aufräumen via `queue:prune-failed`.

### Relevante Dateien

- `Dockerfile` — `/entrypoint-worker.sh`
- `docker/supervisord-worker.conf`, `docker/worker-health.php`
- `cloudbuild.yaml`, `cloudbuild-staging.yaml` — bedingte Worker-Deploy-Steps
- `app/Http/Controllers/CronController.php::processQueue` — alter Pfad (Fallback)
