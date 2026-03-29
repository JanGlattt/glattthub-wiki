# Staging-Umgebung (Abnahme)

Zwischen der lokalen Entwicklung und der Produktionsumgebung gibt es eine **Staging-Umgebung** (Abnahme) in der Google Cloud. Hier werden neue Features und Änderungen getestet, bevor sie in die Produktion gehen.

---

## Für Endanwender

### Was ist die Staging-Umgebung?

Die Staging-Umgebung ist eine Testversion von GlattHub, die fast identisch mit der Produktionsversion ist. Sie erkennen die Staging-Umgebung an der **gelben schwebenden Karte** unten rechts im Bildschirm:

> **Staging**

Beim Klick auf die Karte klappt sie auf und zeigt den **Build-Commit** (Kurz-Hash) und den **Deploy-Zeitpunkt** an.

In der **lokalen Entwicklung** erscheint stattdessen eine **türkise Karte** mit dem Hinweis "Lokale Entwicklung" und zeigt PHP-Version, Laravel-Version und Server-Info.

In der **Produktion** wird kein Badge angezeigt.

### Wichtig zu wissen

- Die Staging-Umgebung hat eine **eigene Datenbank**, die täglich automatisch von der Produktion kopiert wird
- Änderungen in Staging (z.B. neue Einträge) gehen bei der nächsten DB-Kopie verloren
- **GoCardless** läuft in Staging im **Sandbox-Modus** — es werden keine echten Lastschriften ausgelöst
- **Mails** werden in Staging **nicht versendet**, sondern nur geloggt
- **Uploads** (Bilder, Dokumente) landen in den gleichen Cloud Storage Buckets wie in der Produktion

### URL

Die Staging-Umgebung ist erreichbar unter: `https://staging.hub.glattt.com`

Weitere Details zu URLs, DNS und Load Balancer: siehe [Cloud-Infrastruktur](CLOUD-INFRASTRUKTUR.md)

### Zugangsschutz

Der Zugang ist durch Google Identity-Aware Proxy (IAP) geschützt — nur freigegebene Nutzer können die Staging-Umgebung erreichen.

Details zur IAP-Konfiguration: siehe [Cloud-Infrastruktur](CLOUD-INFRASTRUKTUR.md#identity-aware-proxy-iap)

---

## Für Entwickler

### Architektur-Überblick

```
Lokal (MAMP)
     ↓ git push develop
Cloud Build (cloudbuild-staging.yaml)
     ↓ Docker Build → Artifact Registry
Cloud Run Service: glattthub-web-staging → staging.hub.glattt.com
     ↓
     ↓ git push main (oder merge develop → main)
Cloud Build (cloudbuild.yaml)
     ↓ Docker Build → Artifact Registry
Cloud Run Service: glattthub-web → hub.glattt.com
```

Netzwerk-Architektur (Load Balancer, SSL, IAP): siehe [Cloud-Infrastruktur](CLOUD-INFRASTRUKTUR.md)

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
| **DB-User** | `glattthub_user` | `glattthub_staging` |
| **GCS Buckets** | `glattthub-public`, `glattthub` | Gleiche Buckets (geteilt) |
| **Region** | `europe-west3` (Frankfurt) | `europe-west3` (Frankfurt) |
| **Cloud Build Config** | `cloudbuild.yaml` | `cloudbuild-staging.yaml` |
| **Build Trigger** | Push auf `main` (global) | Push auf `develop` (global) |
| **Artifact Registry** | `glattthub-docker` | `glattthub-docker` (gleich) |

Custom Domains, Load Balancer, SSL und IAP: siehe [Cloud-Infrastruktur](CLOUD-INFRASTRUKTUR.md)

### Environment-Variablen (Unterschiede zu Prod)

| Variable | Staging | Produktion |
|----------|---------|-----------|
| `APP_ENV` | `staging` | `production` |
| `APP_URL` | `https://staging.hub.glattt.com` | `https://hub.glattt.com` |
| `APP_KEY` | Gleich wie Prod (wegen verschlüsselter DB-Daten) | `base64:...` |
| `DB_DATABASE` | `glattthub_staging` | `glattthub` |
| `DB_USERNAME` | `glattthub_staging` | `glattthub_user` |
| `DB_PASSWORD` | Eigenes Passwort | Eigenes Passwort |
| `MAIL_MAILER` | `log` | `log` (aktuell) |
| `GOCARDLESS_ENVIRONMENT` | `sandbox` | `sandbox` (aktuell) |
| `BUILD_COMMIT` | Short SHA des Git-Commits | Short SHA des Git-Commits |
| `BUILD_TIMESTAMP` | Zeitpunkt des Deployments | Zeitpunkt des Deployments |

**Wichtig:** `APP_KEY` muss in Staging **identisch** mit Prod sein, da die Staging-DB eine Kopie der Prod-DB ist und verschlüsselte Spalten (z.B. `email_settings`) sonst nicht entschlüsselt werden können.

Alle anderen Variablen (Phorest, Zendesk, GCS, VAPID, askDANTE, Gemini, etc.) sind identisch.

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `cloudbuild-staging.yaml` | Cloud Build Pipeline für Staging |
| `cloudbuild-db-copy.yaml` | Tägliche DB-Kopie Prod → Staging |
| `cloudbuild.yaml` | Cloud Build Pipeline für Prod |
| `app/helpers.php` | `isCloudEnvironment()` und `isStaging()` Helper |
| `resources/views/partials/environment-badge.blade.php` | Umgebungs-Badge (floating card) |
| `public/css/theme_glattt.css` | CSS für `.env-badge` Komponente (Abschnitt 27) |
| `Dockerfile` | Gleich für beide Umgebungen |
| `scripts/setup-staging-step*.sh` | Einrichtungs-Skripte (Cloud Shell) |

### `isCloudEnvironment()` Helper

Für die Unterscheidung zwischen Cloud-Umgebungen (Production + Staging) und lokaler Entwicklung gibt es globale Helper in `app/helpers.php`:

```php
function isCloudEnvironment(): bool
{
    return in_array(config('app.env'), ['production', 'staging']);
}

function isStaging(): bool
{
    return config('app.env') === 'staging';
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

**Dateien die diesen Helper verwenden:**

- `app/Providers/AppServiceProvider.php` — HTTPS erzwingen
- `app/Http/Middleware/SecurityHeaders.php` — HSTS Header
- `app/Models/News.php` — Storage-Disk
- `app/Models/TreatmentSettingPhoto.php` — Storage-Disk
- `app/Models/NisvDocument.php` — Storage-Disk
- `app/Http/Controllers/SharedFormController.php` — Storage-Disk
- `app/Http/Controllers/FormController.php` — Storage-Disk
- `app/Http/Controllers/NisvCertificationController.php` — Storage-Disk (3 Stellen)
- `app/Http/Controllers/AppointmentViewController.php` — Storage-Disk
- `app/Filament/Pages/PdfSettings.php` — Storage-Disk (3 Stellen)
- `app/Filament/Resources/News/Schemas/NewsForm.php` — Storage-Disk

### Umgebungs-Badge (Environment Badge)

Statt des alten gelben Top-Banners gibt es jetzt eine **schwebende Karte unten rechts**. Die Karte ist klickbar und zeigt im aufgeklappten Zustand zusätzliche Informationen.

**Partial:** `resources/views/partials/environment-badge.blade.php`

**Eingebunden in:**
- `resources/views/layouts/app.blade.php`
- `resources/views/layouts/hub.blade.php`
- `resources/views/auth/login.blade.php`

**Varianten:**

| Umgebung | Farbe | Icon | Details (aufgeklappt) |
|----------|-------|------|-----------------------|
| Lokal | Türkis (`--glattt-turquoise`) | Monitor | Server, PHP-Version, Laravel-Version |
| Staging | Gelb/Orange (`--color-warning`) | Reagenzglas | Build-Commit (Short SHA), Deploy-Zeitstempel |
| Produktion | — | — | Kein Badge sichtbar |

**CSS-Klassen:** `.env-badge`, `.env-badge--local`, `.env-badge--staging` in `theme_glattt.css` (Abschnitt 27).

**Build-Informationen:** Die Env-Vars `BUILD_COMMIT` und `BUILD_TIMESTAMP` werden automatisch beim Cloud Build Deploy gesetzt (in `cloudbuild.yaml` und `cloudbuild-staging.yaml`). Lokal sind diese nicht vorhanden — stattdessen werden PHP/Laravel-Versionen angezeigt.

### Tägliche DB-Kopie

Die Produktionsdatenbank wird täglich automatisch nach Staging kopiert.

**Konfiguration:**
- **Cloud Scheduler**: Täglich um 03:00 Uhr (Europe/Berlin)
- **Cloud Build Job**: `cloudbuild-db-copy.yaml`
- **Nach dem Import** werden `jobs`, `failed_jobs` und `sessions` in Staging geleert

**Manuell auslösen:**

```bash
gcloud builds submit --config=cloudbuild-db-copy.yaml --no-source --project=glattthub
```

**Wichtig:** Der SQL-Export von Cloud SQL enthält ein `USE glattthub;` Statement. Das `cloudbuild-db-copy.yaml` bereinigt dies automatisch mittels `sed`, damit die Daten in `glattthub_staging` landen.

### GoCardless Sandbox

Staging nutzt die GoCardless Sandbox-Umgebung. Die Config-Datei (`config/gocardless.php`) unterstützt das bereits nativ:

- `GOCARDLESS_ENVIRONMENT=sandbox` → API: `https://api-sandbox.gocardless.com`
- `GOCARDLESS_ENVIRONMENT=live` → API: `https://api.gocardless.com`

Sandbox und Live haben separate Access Tokens und Webhook Secrets (`GOCARDLESS_SANDBOX_ACCESS_TOKEN` / `GOCARDLESS_LIVE_ACCESS_TOKEN`).

### Mail-Konfiguration

Staging verwendet `MAIL_MAILER=log` — Mails werden nicht versendet, sondern in die Container-Logs geschrieben (da `LOG_CHANNEL=stderr`). Dies verhindert unbeabsichtigte Kunden-E-Mails (besonders nach der täglichen DB-Kopie).

### Ersteinrichtung (abgeschlossen)

Die folgenden Schritte wurden bei der Ersteinrichtung durchgeführt und sind hier als Referenz dokumentiert.

#### 1. Staging-Datenbank anlegen

Auf der Cloud SQL Instanz (über Cloud SQL Studio):

```sql
CREATE DATABASE glattthub_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'glattthub_staging'@'%' IDENTIFIED BY '<sicheres-passwort>';
GRANT ALL PRIVILEGES ON glattthub_staging.* TO 'glattthub_staging'@'%';
FLUSH PRIVILEGES;
```

#### 2. Initiale Daten kopieren

Prod-Datenbank exportiert und in Staging importiert. Das `USE`-Statement im SQL-Dump wurde per `sed` korrigiert:

```bash
# Export von Prod
gcloud sql export sql glattthub gs://glattthub/staging-setup/glattthub-export.sql \
    --database=glattthub --project=glattthub

# USE-Statement korrigieren
gsutil cp gs://glattthub/staging-setup/glattthub-export.sql - \
    | sed 's/USE `glattthub`;/USE `glattthub_staging`;/g' \
    | gsutil cp - gs://glattthub/staging-setup/glattthub-staging-import.sql

# Import in Staging-DB
gcloud sql import sql glattthub gs://glattthub/staging-setup/glattthub-staging-import.sql \
    --database=glattthub_staging --project=glattthub
```

#### 3. develop-Branch erstellen

```bash
git checkout main
git checkout -b develop
git push -u origin develop
```

#### 4. Cloud Build Trigger erstellen

In der Google Cloud Console → Cloud Build → Triggers (**Region: global**):

**Trigger: Staging-Deployment**
- Name: `deploy-staging`
- Quelle: GitHub Repository (1st gen)
- Branch: `^develop$`
- Config: `cloudbuild-staging.yaml`

*Erstellt durch Duplizieren des vorhandenen Prod-Triggers und Anpassung.*

#### 5. Cloud Run Service erstellen

Der Staging-Service wurde initial mit dem aktuellen Prod-Image und angepassten Env-Vars erstellt:

```bash
# Aktuelles Prod-Image ermitteln
IMAGE=$(gcloud run services describe glattthub-web \
    --region=europe-west3 --project=glattthub \
    --format="value(spec.template.spec.containers[0].image)")

# Staging-Service deployen
gcloud run deploy glattthub-web-staging \
    --image="$IMAGE" \
    --region=europe-west3 \
    --project=glattthub \
    --platform=managed \
    --allow-unauthenticated \
    --env-vars-file=/tmp/staging-env.yaml \
    --add-cloudsql-instances=glattthub:europe-west3:glattthub \
    --timeout=300 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=2
```

#### 6. Cloud Scheduler für DB-Kopie

*(Noch einzurichten)*

```bash
gcloud scheduler jobs create http db-copy-prod-to-staging \
  --schedule="0 3 * * *" \
  --time-zone="Europe/Berlin" \
  --uri="https://cloudbuild.googleapis.com/v1/projects/glattthub/triggers/<TRIGGER_ID>:run" \
  --http-method=POST \
  --oauth-service-account-email=<SERVICE_ACCOUNT>@glattthub.iam.gserviceaccount.com \
  --location=europe-west3 \
  --project=glattthub
```

### Bekannte Eigenheiten der Prod-Konfiguration

Bei der Einrichtung der Staging-Umgebung wurden folgende Punkte in der Prod-Konfiguration bemerkt:

1. **`FILESYSTEM_DISK` doppelt definiert** — einmal `local`, einmal `gcs` (der letzte gewinnt). Für Staging bereinigt.
2. **`SESSION_ENCRYPT` doppelt definiert** — einmal `false`, einmal `true`. Für Staging bereinigt.
3. **`SESSION_SECURE_COOKIE` doppelt definiert** — Für Staging bereinigt.
4. **`APP_DEBUG=true` in Produktion** — Sicherheitsrisiko, sollte `false` sein.
5. **`GOOGLE_REDIRECT_URI`** zeigt auf `localhost:8888` — Google OAuth funktioniert so nicht in Cloud Run.
6. **`GOCARDLESS_ENVIRONMENT=sandbox`** in Prod — GoCardless nutzt aktuell noch die Sandbox, nicht Live.
7. **`MAIL_MAILER=log`** in Prod — aktuell werden keine echten E-Mails versendet.

### Troubleshooting

**Build schlägt fehl:**
- Cloud Build Logs prüfen: Google Cloud Console → Cloud Build → History
- Branch-Filter im Trigger prüfen (`^develop$`)
- Trigger ist in **global** Region (nicht europe-west3!)

**Staging nicht erreichbar:**
- Cloud Run Service Status prüfen
- Container-Logs: `gcloud run services logs read glattthub-web-staging --region=europe-west3 --project=glattthub`
- Bei Problemen mit Custom Domains oder SSL: siehe [Cloud-Infrastruktur Troubleshooting](CLOUD-INFRASTRUKTUR.md#troubleshooting)

**"The MAC is invalid" Fehler:**
- `APP_KEY` in Staging stimmt nicht mit dem Prod-Key überein
- Da die DB von Prod kopiert wird, muss der gleiche APP_KEY verwendet werden
- Fix: `gcloud run services update glattthub-web-staging --region=europe-west3 --project=glattthub --update-env-vars="APP_KEY=<prod-key>"`

**"Access denied" DB-Fehler:**
- Prüfen ob der DB-User die richtigen Berechtigungen hat:
  ```sql
  GRANT ALL PRIVILEGES ON glattthub_staging.* TO 'glattthub_staging'@'%';
  FLUSH PRIVILEGES;
  ```
- Passwort prüfen — Sonderzeichen können Probleme machen beim Setzen über `--env-vars-file`

**DB-Kopie importiert in falsche Datenbank:**
- Cloud SQL Export enthält `USE glattthub;` Statement
- Das `cloudbuild-db-copy.yaml` bereinigt dies automatisch mittels `sed`
- Bei manuellem Import: `sed 's/USE \`glattthub\`;/USE \`glattthub_staging\`;/g'`

**GoCardless-Fehler auf Staging:**
- Prüfen ob `GOCARDLESS_ENVIRONMENT=sandbox` gesetzt ist
- Sandbox Access Token im GoCardless Dashboard prüfen
- Webhook-Endpoint in GoCardless Dashboard auf Staging-URL umstellen

**Lokales Environment-Badge wird nicht angezeigt:**
- Prüfen ob `APP_ENV=local` in `.env` gesetzt ist
- Alpine.js muss geladen sein (wird über Vite oder CDN eingebunden)
