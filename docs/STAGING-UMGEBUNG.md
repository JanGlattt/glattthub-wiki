# Staging-Umgebung (Abnahme)

Zwischen der lokalen Entwicklung und der Produktionsumgebung gibt es eine **Staging-Umgebung** (Abnahme) in der Google Cloud. Hier werden neue Features und Änderungen getestet, bevor sie in die Produktion gehen.

---

## Für Endanwender

### Was ist die Staging-Umgebung?

Die Staging-Umgebung ist eine Testversion von GlattHub, die fast identisch mit der Produktionsversion ist. Sie erkennen die Staging-Umgebung an dem **gelben Banner** am oberen Bildschirmrand:

> **Staging-Umgebung — Keine produktiven Daten!**

### Wichtig zu wissen

- Die Staging-Umgebung hat eine **eigene Datenbank**, die täglich automatisch von der Produktion kopiert wird
- Änderungen in Staging (z.B. neue Einträge) gehen bei der nächsten DB-Kopie verloren
- **GoCardless** läuft in Staging im **Sandbox-Modus** — es werden keine echten Lastschriften ausgelöst
- **Mails** werden in Staging **nicht versendet**, sondern nur geloggt
- **Uploads** (Bilder, Dokumente) landen in den gleichen Cloud Storage Buckets wie in der Produktion

### URL

Die Staging-Umgebung ist unter der Cloud Run Standard-URL erreichbar:

```
https://glattthub-web-staging-<hash>.europe-west3.run.app
```

*(Die genaue URL wird nach dem ersten Deployment sichtbar.)*

---

## Für Entwickler

### Architektur-Überblick

```
Lokal (MAMP)
     ↓ git push develop
Cloud Build (cloudbuild-staging.yaml)
     ↓ Docker Build → Artifact Registry
Cloud Run Service: glattthub-web-staging
     ↓ git push main (oder merge develop → main)
Cloud Build (cloudbuild.yaml)
     ↓ Docker Build → Artifact Registry
Cloud Run Service: glattthub-web (Produktion, wie bisher)
```

### Branching-Workflow

| Branch | Zweck | Deployment |
|--------|-------|-----------|
| `feature/*` | Feature-Entwicklung | Kein automatisches Deployment |
| `develop` | Integration & Staging | → Cloud Run Staging |
| `main` | Produktion | → Cloud Run Prod |

**Workflow:**

1. Feature-Branch von `develop` erstellen: `git checkout -b feature/mein-feature develop`
2. Entwickeln und committen
3. In `develop` mergen: `git checkout develop && git merge feature/mein-feature`
4. Push auf `develop` → automatisches Staging-Deployment
5. Auf Staging testen und abnehmen
6. In `main` mergen: `git checkout main && git merge develop`
7. Push auf `main` → automatisches Prod-Deployment

### Cloud-Infrastruktur

| Komponente | Produktion | Staging |
|------------|-----------|---------|
| **Cloud Run Service** | `glattthub-web` | `glattthub-web-staging` |
| **Cloud SQL Instanz** | `glattthub:europe-west3:glattthub` | Gleiche Instanz |
| **Datenbank** | `glattthub` | `glattthub_staging` |
| **GCS Buckets** | `glattthub-public`, `glattthub` | Gleiche Buckets (geteilt) |
| **Region** | `europe-west3` (Frankfurt) | `europe-west3` (Frankfurt) |
| **Cloud Build Config** | `cloudbuild.yaml` | `cloudbuild-staging.yaml` |
| **Build Trigger** | Push auf `main` | Push auf `develop` |

### Environment-Variablen (Unterschiede zu Prod)

| Variable | Staging | Produktion |
|----------|---------|-----------|
| `APP_ENV` | `staging` | `production` |
| `APP_DEBUG` | `true` | `false` |
| `APP_URL` | Cloud Run Staging-URL | `https://hub.glattt.de` |
| `APP_KEY` | Eigener Key! | Eigener Key |
| `DB_DATABASE` | `glattthub_staging` | `glattthub` |
| `MAIL_MAILER` | `log` | `smtp` |
| `GOCARDLESS_ENVIRONMENT` | `sandbox` | `live` |

Alle anderen Variablen (Phorest, Zendesk, GCS, etc.) sind identisch.

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `cloudbuild-staging.yaml` | Cloud Build Pipeline für Staging |
| `cloudbuild-db-copy.yaml` | Tägliche DB-Kopie Prod → Staging |
| `cloudbuild.yaml` | Cloud Build Pipeline für Prod (unverändert) |
| `app/helpers.php` | `isCloudEnvironment()` Helper |
| `Dockerfile` | Gleich für beide Umgebungen |

### `isCloudEnvironment()` Helper

Für die Unterscheidung zwischen Cloud-Umgebungen (Production + Staging) und lokaler Entwicklung gibt es den globalen Helper:

```php
function isCloudEnvironment(): bool
{
    return in_array(config('app.env'), ['production', 'staging']);
}
```

**Verwendung:** Überall wo zwischen Cloud-Storage (GCS) und lokaler Disk gewählt wird:

```php
// Statt: config('app.env') === 'production' ? 'gcs-private' : 'public'
$disk = isCloudEnvironment() ? 'gcs-private' : 'public';
```

Für Laravel's `app()->environment()` wird direkt ein Array übergeben:

```php
if (app()->environment(['production', 'staging'])) {
    URL::forceScheme('https');
}
```

### Tägliche DB-Kopie

Die Produktionsdatenbank wird täglich automatisch nach Staging kopiert.

**Konfiguration:**
- **Cloud Scheduler**: Täglich um 03:00 Uhr (Europe/Berlin)
- **Cloud Build Job**: `cloudbuild-db-copy.yaml`
- **Tabellen die NICHT kopiert werden**: `jobs`, `failed_jobs`, `sessions`, `cache`, `cache_locks`
- **Nach dem Import** werden `jobs`, `failed_jobs` und `sessions` in Staging geleert

**Manuell auslösen:**

```bash
gcloud builds submit --config=cloudbuild-db-copy.yaml --no-source --project=glattthub
```

### GoCardless Sandbox

Staging nutzt die GoCardless Sandbox-Umgebung. Die Config-Datei (`config/gocardless.php`) unterstützt das bereits nativ:

- `GOCARDLESS_ENVIRONMENT=sandbox` → API: `https://api-sandbox.gocardless.com`
- `GOCARDLESS_ENVIRONMENT=live` → API: `https://api.gocardless.com`

Sandbox und Live haben separate Access Tokens und Webhook Secrets.

### Mail-Konfiguration

Staging verwendet `MAIL_MAILER=log` — Mails werden nicht versendet, sondern in `storage/logs/laravel.log` geloggt. Dies verhindert unbeabsichtigte Kunden-E-Mails (besonders nach der täglichen DB-Kopie).

### Staging-Banner

In Staging wird ein gelber Banner am oberen Bildschirmrand angezeigt. Der Banner ist in beiden Layouts eingebaut (`app.blade.php` und `hub.blade.php`) und wird nur bei `APP_ENV=staging` sichtbar:

```blade
@if(config('app.env') === 'staging')
    <div class="staging-environment-banner">Staging-Umgebung — Keine produktiven Daten!</div>
@endif
```

CSS-Klasse: `.staging-environment-banner` in `theme_glattt.css`.

### Ersteinrichtung (einmalig)

#### 1. Staging-Datenbank anlegen

Auf der Cloud SQL Instanz:

```sql
CREATE DATABASE glattthub_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'glattthub_staging'@'%' IDENTIFIED BY '<sicheres-passwort>';
GRANT ALL PRIVILEGES ON glattthub_staging.* TO 'glattthub_staging'@'%';
FLUSH PRIVILEGES;
```

#### 2. Secrets anlegen

In Google Secret Manager:

```bash
# DB Credentials
echo -n "glattthub_staging" | gcloud secrets create db-staging-user --data-file=- --project=glattthub
echo -n "<passwort>" | gcloud secrets create db-staging-password --data-file=- --project=glattthub

# Falls Prod-Secrets noch nicht existieren:
echo -n "<prod-user>" | gcloud secrets create db-prod-user --data-file=- --project=glattthub
echo -n "<prod-password>" | gcloud secrets create db-prod-password --data-file=- --project=glattthub
```

#### 3. develop-Branch erstellen

```bash
git checkout main
git checkout -b develop
git push -u origin develop
```

#### 4. Cloud Build Trigger erstellen

In der Google Cloud Console → Cloud Build → Triggers:

**Trigger 1: Staging-Deployment**
- Name: `deploy-staging`
- Quelle: GitHub Repository
- Branch: `^develop$`
- Config: `cloudbuild-staging.yaml`

**Trigger 2: DB-Kopie (optional als Scheduler)**
- Name: `db-copy-prod-to-staging`
- Config: `cloudbuild-db-copy.yaml`

#### 5. Cloud Run Service erstellen

Beim ersten Push auf `develop` erstellt Cloud Build den Service automatisch. Danach die Environment-Variablen über die Cloud Console setzen. 

Alternativ vorab erstellen:

```bash
gcloud run deploy glattthub-web-staging \
  --image europe-west3-docker.pkg.dev/glattthub/glattthub-docker/glattthub-web-staging:latest \
  --region europe-west3 \
  --project glattthub \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="APP_ENV=staging,APP_DEBUG=true,MAIL_MAILER=log,GOCARDLESS_ENVIRONMENT=sandbox,DB_DATABASE=glattthub_staging" \
  --add-cloudsql-instances=glattthub:europe-west3:glattthub
```

#### 6. Cloud Scheduler für DB-Kopie

```bash
gcloud scheduler jobs create http db-copy-prod-to-staging \
  --schedule="0 2 * * *" \
  --time-zone="Europe/Berlin" \
  --uri="https://cloudbuild.googleapis.com/v1/projects/glattthub/triggers/<TRIGGER_ID>:run" \
  --http-method=POST \
  --oauth-service-account-email=<SERVICE_ACCOUNT>@glattthub.iam.gserviceaccount.com \
  --location=europe-west3 \
  --project=glattthub
```

### Troubleshooting

**Build schlägt fehl:**
- Cloud Build Logs prüfen: Google Cloud Console → Cloud Build → History
- Branch-Filter im Trigger prüfen (`^develop$`)

**Staging nicht erreichbar:**
- Cloud Run Service Status prüfen
- Container-Logs: `gcloud run services logs read glattthub-web-staging --region=europe-west3`

**DB-Kopie fehlgeschlagen:**
- Cloud Build Logs des DB-Copy-Jobs prüfen
- Secrets in Secret Manager prüfen (existieren, richtige Werte)
- Cloud SQL Auth Proxy Berechtigung: Service Account braucht `roles/cloudsql.client`

**GoCardless-Fehler auf Staging:**
- Prüfen ob `GOCARDLESS_ENVIRONMENT=sandbox` gesetzt ist
- Sandbox Access Token im GoCardless Dashboard prüfen
- Webhook-Endpoint in GoCardless Dashboard auf Staging-URL umstellen
