# Cloud-Infrastruktur & Konfiguration

Dokumentation der Google Cloud-Infrastruktur für GlattHub: Custom Domains, Load Balancer, SSL-Zertifikate, DNS und Zugangsschutz (IAP).

---

## Für Endanwender

### URLs

| Umgebung | URL |
|----------|-----|
| **Produktion** | `https://hub.glattt.com` |
| **Staging** | `https://staging.hub.glattt.com` |
| **Klickanleitungen-Portal** | `https://hilfe.hub.glattt.com` — eigener Cloud-Run-Dienst `glattthub-hilfe`, siehe [KLICKANLEITUNGEN-PORTAL.md](KLICKANLEITUNGEN-PORTAL.md) |

### Zugangsschutz

Beide Umgebungen sind durch **Google Identity-Aware Proxy (IAP)** geschützt. Beim Aufruf der URL erscheint zuerst eine Google-Anmeldung:

- **Produktion**: Alle Nutzer mit einer `@labrado-schlueter.com` Google Workspace-Adresse
- **Staging**: Nur individuell freigegebene Nutzer

Die Google-Anmeldung erfolgt einmalig pro Session — danach erscheint das normale GlattHub-Login wie gewohnt.

**Ausnahme:** Öffentlich geteilte Kunden-Links (Selfservice-Terminbuchung, Formular ausfüllen unter `/shared/*`) sind bewusst **ohne** Google-Anmeldung erreichbar, damit auch Kunden ohne Google Workspace-Account darauf zugreifen können. Diese Seiten sind stattdessen durch individuelle, kryptographisch sichere Zugriffstokens in der URL geschützt.

---

## Für Entwickler

### Übersicht Cloud-Komponenten

| Komponente | Produktion | Staging |
|------------|-----------|---------|
| **Custom Domain** | `hub.glattt.com` | `staging.hub.glattt.com` |
| **Cloud Run Service** | `glattthub-web` | `glattthub-web-staging` |
| **Cloud SQL Instanz** | `glattthub:europe-west3:glattthub` | Gleiche Instanz |
| **Datenbank** | `glattthub` | `glattthub_staging` |
| **DB-User** | `glattthub_user` | `glattthub_staging` |
| **GCS Buckets** | `glattthub-public`, `glattthub` | Gleiche Buckets (geteilt) |
| **Region** | `europe-west3` (Frankfurt) | `europe-west3` (Frankfurt) |
| **Artifact Registry** | `glattthub-docker` | `glattthub-docker` (gleich) |
| **IAP** | Domain `labrado-schlueter.com` | Einzelne Nutzer |

### Load Balancer

Da Cloud Run in `europe-west3` keine Domain Mappings unterstützt, werden Custom Domains über einen **Global External Application Load Balancer** realisiert.

#### Komponenten

| Komponente | Name | Details |
|------------|------|----------|
| **Statische IP** | `ip-glattthub` | `34.49.25.78` (global) |
| **Serverless NEG (Prod)** | `neg-glattthub-prod` | → `glattthub-web` |
| **Serverless NEG (Staging)** | `neg-glattthub-staging` | → `glattthub-web-staging` |
| **Backend (Prod)** | `backend-glattthub-prod` | Web-App mit IAP |
| **Backend (Staging)** | `backend-glattthub-staging` | Web-App mit IAP |
| **Backend API (Prod)** | `backend-glattthub-prod-api` | REST-API ohne IAP |
| **Backend API (Staging)** | `backend-glattthub-staging-api` | REST-API ohne IAP |
| **Backend Public (Prod)** | `backend-glattthub-prod-public` | Token-Seiten (`/shared/*`) ohne IAP |
| **Backend Public (Staging)** | `backend-glattthub-staging-public` | Token-Seiten (`/shared/*`) ohne IAP |
| **Backend Hilfe** | `backend-glattthub-hilfe` | Klickanleitungen-Portal (NEG `neg-glattthub-hilfe` → `glattthub-hilfe`) mit IAP, seit 18.09.2026 |
| **URL Map** | `urlmap-glattthub` | Host- und Pfad-basiertes Routing |
| **HTTPS Proxy** | `proxy-glattthub` | Terminiert SSL |
| **HTTP Proxy** | `proxy-glattthub-http` | Redirect HTTP → HTTPS |
| **Forwarding Rule HTTPS** | `fwd-glattthub-https` | Port 443 → HTTPS Proxy |
| **Forwarding Rule HTTP** | `fwd-glattthub-http` | Port 80 → HTTP Proxy |

#### URL-Routing

Der URL-Map kombiniert Host- und Pfad-basiertes Routing. API-Pfade (`/api/*`) und die öffentlichen Token-Seiten (`/shared/*`) werden an Backend-Services **ohne IAP** geleitet, damit externe Clients (API-Consumer bzw. Kunden ohne Google Workspace-Account) zugreifen können. Da die Public-Seiten auch statische Assets (CSS, JS, Fonts, Bilder) und den Livewire-Update-Endpunkt laden müssen, sind zusätzlich `/livewire/*`, `/build/*`, `/css/*`, `/js/*`, `/fonts/*` und `/images/*` von IAP ausgenommen (sonst lädt die Seite ohne Styling/Interaktivität, siehe [Bekanntes Problem](#bekanntes-problem-fehlendes-cssjs-auf-public-seiten)).

```
hub.glattt.com/api/*                                    → backend-glattthub-prod-api     → glattthub-web       (ohne IAP)
hub.glattt.com/{shared,livewire,build,css,js,fonts,images}/* → backend-glattthub-prod-public  → glattthub-web       (ohne IAP)
hub.glattt.com/*                                        → backend-glattthub-prod         → glattthub-web       (mit IAP)
staging.hub.glattt.com/api/*                                    → backend-glattthub-staging-api    → glattthub-web-staging (ohne IAP)
staging.hub.glattt.com/{shared,livewire,build,css,js,fonts,images}/* → backend-glattthub-staging-public → glattthub-web-staging (ohne IAP)
staging.hub.glattt.com/*                                        → backend-glattthub-staging        → glattthub-web-staging (mit IAP)
hilfe.hub.glattt.com/*                                          → backend-glattthub-hilfe          → glattthub-hilfe       (mit IAP, Ingress nur LB)
```

!!! info "`/.well-known/*` ohne IAP (Universal Links der iOS-App)"
    `/.well-known/*` liegt in beiden `-public`-Pfadregeln (Prod und Staging, geprüft 20.09.2026) —
    Apples CDN lädt `https://hub.glattt.com/.well-known/apple-app-site-association` (Route im Hub
    seit 20.09.2026, Rückfall `/apple-app-site-association`) damit ohne Cookies. Prüfung:
    `curl -sI https://hub.glattt.com/.well-known/apple-app-site-association` → `200` und
    `Content-Type: application/json`; Apples Sicht: `https://app-site-association.cdn-apple.com/a/v1/hub.glattt.com`.
    Siehe [iOS-App](IOS-APP.md).

#### Bekanntes Problem: Fehlendes CSS/JS auf Public-Seiten

Nach der Ersteinrichtung des `/shared/*`-Bypasses lud die HTML-Seite zwar, aber **ohne Styling und Interaktivität** (Konsole: `Refused to execute .../livewire/livewire.min.js` wegen `X-Content-Type-Options: nosniff`, sowie 403-Fehler für CSS/Fonts/Bilder). Ursache: Nur die HTML-Seite selbst lief über `/shared/*`, alle referenzierten Assets (`/build/*` von Vite, `/css/theme_glattt.css`, `/fonts/*`, `/images/*`) sowie der Livewire-Update-Endpunkt (`/livewire/update`, `/livewire/livewire.min.js`) liefen weiterhin über den IAP-geschützten Standard-Pfad und wurden vom Browser als Cross-Origin-Redirect zu Google IAP abgelehnt (CORS). Lösung: Diese Pfade zusätzlich in die `-public`-Pfadregel aufgenommen.

> **Sicherheitsbewertung `/livewire/*`:** Der Bypass ist unbedenklich, da Livewire-Snapshots kryptographisch mit dem `APP_KEY` signiert sind (Checksum-Prüfung) und ein Angreifer ohne gültigen Snapshot keine Hub-Komponenten manipulieren kann. Einen gültigen Snapshot für eine interne Hub-Komponente kann man ohnehin nur durch einen erfolgreichen (IAP- und Laravel-authentifizierten) GET-Request auf die jeweilige Hub-Seite erhalten — das bleibt weiterhin durch IAP + `auth:sanctum`/`check.hub` geschützt, da nur die Seiten selbst unter `/hub/*` liegen, nicht `/livewire/*`.

> **Wichtig:** Die API-Endpoints sind trotzdem geschützt — durch die eigene Bearer-Token-Authentifizierung in Laravel (`ApiTokenMiddleware`). Die `/shared/*`-Seiten (Terminbuchung, Formular ausfüllen) sind durch kryptographisch sichere, einmalig gültige bzw. ablaufende Tokens in der URL sowie durch `throttle:shared-page` (30 Anfragen/Min. pro IP) geschützt. IAP ist nur für interne Browser-Sessions des Hubs relevant.

> **Hintergrund:** `/shared/*` wurde nachträglich vom IAP ausgenommen, weil Kunden ohne `@labrado-schlueter.com`-Google-Account sonst nicht auf die Selfservice-Terminbuchung bzw. das per Link geteilte Formular zugreifen konnten (IAP blockiert den Request bereits am Load Balancer, bevor Laravel überhaupt erreicht wird). Betroffen waren `GET /shared/booking/{token}` und `GET /shared/form/{token}` (inkl. `/pdf`). `/invitation/{token}` bleibt bewusst IAP-geschützt, da Einladungen nur an interne Mitarbeitende mit Firmen-Google-Account verschickt werden.

### SSL-Zertifikate

Google-managed SSL-Zertifikate werden automatisch erstellt und erneuert. Pro Domain ein **separates** Zertifikat (nicht combined, da das zu Blockierungen führen kann).

| Zertifikat | Domain |
|------------|--------|
| `cert-glattthub-prod` | `hub.glattt.com` |
| `cert-glattthub-staging` | `staging.hub.glattt.com` |
| `cert-glattthub-hilfe` | `hilfe.hub.glattt.com` (seit 18.09.2026) |

**Status prüfen:**

```bash
gcloud compute ssl-certificates describe cert-glattthub-prod --global --format='yaml(managed)'
gcloud compute ssl-certificates describe cert-glattthub-staging --global --format='yaml(managed)'
```

**Hinweis:** Bei der Ersteinrichtung wurde zunächst ein Combined-Cert für beide Domains verwendet. Da `hub.glattt.com` im Status `FAILED_NOT_VISIBLE` hängen blieb und dabei `staging.hub.glattt.com` (bereits `ACTIVE`) blockierte, wurden die Zertifikate in separate Einzelzertifikate aufgeteilt.

### DNS-Konfiguration

| Anbieter | Funktion |
|----------|----------|
| **IONOS** | Domain-Registrar (`glattt.com`) |
| **All-Inkl (KAS)** | DNS-Verwaltung, Nameserver |

**Nameserver:** `ns5.kasserver.com`, `ns6.kasserver.com`

**DNS-Einträge für GlattHub:**

| Name | Typ | Wert |
|------|-----|------|
| `hub` | A | `34.49.25.78` |
| `staging.hub` | A | `34.49.25.78` |
| `hilfe.hub` | A | `34.49.25.78` |
| `app.hub` | A | `34.49.25.78` — **App-Host ohne IAP**, siehe unten |

**DNS prüfen:**

```bash
dig hub.glattt.com @8.8.8.8 +short          # Muss 34.49.25.78 zeigen
dig staging.hub.glattt.com @8.8.8.8 +short   # Muss 34.49.25.78 zeigen
```

### Identity-Aware Proxy (IAP)

IAP schützt die Web-App mit einer Google-Anmeldung, die **vor** dem normalen App-Login kommt. Die Konfiguration erfolgt pro Backend-Service.

#### Aktueller Zustand

| Umgebung | Zugriff | IAM Member |
|----------|---------|------------|
| **Produktion** | Alle Google Workspace-Nutzer + jan explizit | `domain:labrado-schlueter.com`, `user:jan@labrado-schlueter.com` |
| **Staging** | Einzelne Nutzer | `user:jan@labrado-schlueter.com` |

**Wichtig:** IAP greift nur bei Zugriff über den Load Balancer (Custom Domains). Die `*.run.app`-Adressen der Dienste umgingen den Load Balancer und damit IAP — bis zum 23.09.2026 stand die Login-Seite von Prod **und** Staging dort ohne Google-Anmeldung offen (Befund beim Sicherheits-Review, siehe [Gerätevertrauen-Plan](GERAETEVERTRAUEN-PLAN.md)). Seitdem haben beide Web-Dienste den Ingress `internal-and-cloud-load-balancing`, gesetzt per `gcloud run services update … --ingress` und festgeschrieben in `cloudbuild.yaml` / `cloudbuild-staging.yaml`: Die `run.app`-Adressen antworten mit 404, jeder Zugriff läuft über den ALB. Alle Cloud-Scheduler-Jobs zeigen seither auf die Custom Domains — ein Job mit `run.app`-Ziel liefe ins Leere, `php artisan cron:audit` meldet ihn als Fehler.

**Ausnahme:** API-Pfade (`/api/*`) sind vom IAP ausgenommen — sie werden über separate Backend-Services ohne IAP geroutet. Details siehe [API-Pfade vom IAP ausschließen](#pfade-vom-iap-ausschlieen-api-token-seiten).

#### Voraussetzungen (bereits eingerichtet)

Folgende APIs und Komponenten müssen aktiv sein, damit IAP funktioniert:

| Komponente | Status | Details |
|------------|--------|---------|
| **IAP API** | ✅ Aktiv | `gcloud services enable iap.googleapis.com` |
| **Cloud Resource Manager API** | ✅ Aktiv | `gcloud services enable cloudresourcemanager.googleapis.com` |
| **OAuth Consent Screen** | ✅ Intern | App: `Anmeldung_glatttHub` (Umbenennung in „glatttHub" unter Google Auth Platform → Branding), nur Google Workspace-Nutzer |
| **OAuth-Client** | ✅ Eigener Client seit 23.09.2026 | `99200336070-1n78g13leh01h24nqoh6ar8lcm01em63…` (Google Auth Platform → Clients, Web-Anwendung, Redirect-URI `https://iap.googleapis.com/v1/oauth/clientIds/<CLIENT_ID>:handleRedirect`), an beiden Backends per `gcloud iap web enable … --oauth2-client-id … --oauth2-client-secret …` hinterlegt. Grund: Der von Google verwaltete Standard-Client erlaubt keinen programmatischen Zugang (Klickanleitungen-Screenshots, siehe [KLICKANLEITUNGEN.md](KLICKANLEITUNGEN.md)). Secret nur in Jans lokaler `.env` (`GLATTT_HUB_IAP_CLIENT_SECRET`). Nach einer Änderung braucht der Edge einige Minuten, bis die Google-Umleitung den neuen Client nennt. |
| **IAP Service Account** | ✅ Provisioniert | `service-99200336070@gcp-sa-iap.iam.gserviceaccount.com` |
| **Cloud Run Invoker** | ✅ Beide Services | IAP Service Account hat `roles/run.invoker` auf beiden Cloud Run Services |

**Projekt-Nummer:** `99200336070`

#### Zugriffsberechtigungen verwalten

##### Aktuelle Policy anzeigen

```bash
# Produktion
gcloud iap web get-iam-policy \
    --resource-type=backend-services \
    --service=backend-glattthub-prod \
    --project=glattthub

# Staging
gcloud iap web get-iam-policy \
    --resource-type=backend-services \
    --service=backend-glattthub-staging \
    --project=glattthub
```

##### Einzelnen Nutzer hinzufügen (Prod oder Staging)

```bash
gcloud iap web add-iam-policy-binding \
    --resource-type=backend-services \
    --service=backend-glattthub-staging \
    --member="user:EMAIL@example.com" \
    --role="roles/iap.httpsResourceAccessor" \
    --project=glattthub
```

> Für Produktion `--service=backend-glattthub-prod` verwenden.

##### Komplette Google Workspace-Domain freigeben

Gibt allen Nutzern einer Google Workspace-Domain Zugriff (z.B. bei einer neuen Partnerfirma):

```bash
gcloud iap web add-iam-policy-binding \
    --resource-type=backend-services \
    --service=backend-glattthub-prod \
    --member="domain:NEUE-DOMAIN.com" \
    --role="roles/iap.httpsResourceAccessor" \
    --project=glattthub
```

> **Voraussetzung:** Die Domain muss eine Google Workspace-Domain sein (kein privates Gmail).

##### Google-Gruppe freigeben

Statt einzelne Nutzer zu verwalten, kann auch eine Google-Gruppe berechtigt werden:

```bash
gcloud iap web add-iam-policy-binding \
    --resource-type=backend-services \
    --service=backend-glattthub-prod \
    --member="group:GRUPPENNAME@labrado-schlueter.com" \
    --role="roles/iap.httpsResourceAccessor" \
    --project=glattthub
```

> Neue Mitglieder der Gruppe erhalten automatisch Zugriff — praktisch wenn häufig Nutzer wechseln.

##### Nutzer/Domain entfernen

```bash
# Einzelnen Nutzer entfernen
gcloud iap web remove-iam-policy-binding \
    --resource-type=backend-services \
    --service=backend-glattthub-staging \
    --member="user:EMAIL@example.com" \
    --role="roles/iap.httpsResourceAccessor" \
    --project=glattthub

# Domain entfernen
gcloud iap web remove-iam-policy-binding \
    --resource-type=backend-services \
    --service=backend-glattthub-prod \
    --member="domain:DOMAIN.com" \
    --role="roles/iap.httpsResourceAccessor" \
    --project=glattthub
```

#### Member-Typen Übersicht

| Typ | Format | Wann verwenden |
|-----|--------|---------------|
| **Einzelner Nutzer** | `user:email@domain.com` | Gezielte Freigabe für eine Person |
| **Google Workspace-Domain** | `domain:domain.com` | Alle Mitarbeiter einer Organisation |
| **Google-Gruppe** | `group:gruppe@domain.com` | Flexible Gruppen-Verwaltung |
| **Service Account** | `serviceAccount:sa@project.iam.gserviceaccount.com` | Für automatisierte Zugriffe |

#### Session-Dauer & Login-Häufigkeit

Standardmäßig hält eine IAP-Session so lange, wie das Google-Login-Cookie gültig ist (typisch mehrere Stunden bis Tage). Die Session-Dauer kann über **IAP-Einstellungen** in der GCP Console angepasst werden:

##### Über die GCP Console

1. Öffne: [IAP-Übersicht](https://console.cloud.google.com/security/iap?project=glattthub)
2. Backend-Service auswählen (z.B. `backend-glattthub-prod`)
3. Rechts auf **Einstellungen** (Drei-Punkte-Menü oder Seitenleiste)
4. Unter **Erweiterte Einstellungen**:
   - **Session-Dauer**: Maximale Zeit bis eine erneute Anmeldung erforderlich ist
   - Standard: Keine Begrenzung (Google-Session gilt)
   - Empfohlene Werte: `1h`, `8h`, `24h`, `720h` (30 Tage)

##### Per gcloud CLI

```bash
# Session-Dauer auf 24 Stunden setzen (Produktion)
gcloud iap settings set \
    --project=glattthub \
    --resource-type=compute \
    --service=backend-glattthub-prod \
    SETTINGS.yaml
```

Dazu eine Datei `SETTINGS.yaml` erstellen:

```yaml
accessSettings:
  reauthSettings:
    method: LOGIN          # LOGIN = Google-Login, SECURE_KEY = Hardware-Key
    maxAge: 86400s         # 24 Stunden (in Sekunden)
    policyType: DEFAULT
```

**Gängige Werte für `maxAge`:**

| Dauer | Wert | Anwendungsfall |
|-------|------|----------------|
| 1 Stunde | `3600s` | Hohe Sicherheit |
| 8 Stunden | `28800s` | Arbeitstag |
| 24 Stunden | `86400s` | Tägliches Re-Login |
| 30 Tage | `2592000s` | Komfortabel, seltenes Re-Login |
| Unbegrenzt | *(kein `reauthSettings` setzen)* | Standard — Google-Session gilt |

> **Aktuelle Einstellung:** Standard (unbegrenzt) — der Google-Login wird nur verlangt, wenn die Google-Session abläuft oder der Nutzer Cookies löscht.

#### Pfade vom IAP ausschließen (API & Token-Seiten)

Damit die REST-API (`/api/*`) ohne Google-Anmeldung per Bearer Token erreichbar ist und Kunden ohne Google Workspace-Account die Token-basierten Public-Seiten (`/shared/*`) nutzen können, existieren separate Backend-Services ohne IAP. Diese zeigen auf die **gleichen** Cloud Run Services (gleiche Serverless NEG), haben aber kein IAP aktiviert.

**Architektur:**

| Pfad | Backend-Service | IAP | Auth |
|------|-----------------|-----|------|
| `/api/*` | `backend-glattthub-{env}-api` | ❌ Aus | Bearer Token (Laravel) |
| `/shared/*`, `/livewire/*`, `/build/*`, `/css/*`, `/js/*`, `/fonts/*`, `/images/*` | `backend-glattthub-{env}-public` | ❌ Aus | Token in URL (kryptographisch sicher, einmalig/ablaufend) + `throttle:shared-page`; Assets/Livewire sind ungeschützte, nicht-sensible Ressourcen |
| `/*` (alles andere, insb. `/hub/*`) | `backend-glattthub-{env}` | ✅ An | Google-Anmeldung + Laravel Session |
| **alles** auf `app.hub.glattt.com` | `backend-glattthub-prod-app` | ❌ Aus | **Gerätenachweis der iOS-App** (Freischaltung + App Attest), erzwungen in Laravel |

!!! info "Der App-Host `app.hub.glattt.com` (seit 24.09.2026)"
    Die iOS-App erreicht den Hub über einen **eigenen Hostnamen ohne IAP** — dieselbe
    Serverless-NEG, eigener Backend-Service, eigene Host-Regel. Grund: Ein Apple-Prüfer hat
    kein Konto in `labrado-schlueter.com` und kommt sonst nicht an IAP vorbei; die App als
    Custom App zu verteilen setzt eine Prüfung voraus.

    Hier ist **nicht** IAP der Schutz, sondern der Gerätenachweis: Auf diesem Host erzwingt
    Laravel die Anmeldung immer (auch während Prod global auf `log` steht), verlangt
    Attestierung und bindet **jede** Anfrage an ein freigeschaltetes Gerät. Wer den Namen
    kennt, bekommt 403. Der Schalter dafür ist `DEVICE_TRUST_APP_HOSTS` am Cloud-Run-Dienst.
    Vollständige Begründung, Ausnahmelisten und Umstellungsreihenfolge:
    [Gerätevertrauen-Plan, Schritt 4](GERAETEVERTRAUEN-PLAN.md#schritt-4-der-app-host-ohne-iap).

    **Der Hauptname bleibt unverändert hinter IAP** — für Browser, PWA und Mac-App ändert
    sich nichts.

**Einrichtung des `-public` Backend-Service (Referenz, bereits umgesetzt):**

```bash
# 1. Backend-Service ohne IAP anlegen (pro Umgebung)
gcloud compute backend-services create backend-glattthub-{env}-public \
    --global \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --protocol=HTTP \
    --port-name=http \
    --project=glattthub

# 2. Bestehende Serverless-NEG zuweisen (gleiche NEG wie Haupt-Backend)
gcloud compute backend-services add-backend backend-glattthub-{env}-public \
    --global \
    --network-endpoint-group=neg-glattthub-{env} \
    --network-endpoint-group-region=europe-west3 \
    --project=glattthub

# 3. URL-Map exportieren, Pfadregeln im jeweiligen pathMatcher ergänzen, wieder importieren
gcloud compute url-maps export urlmap-glattthub --global --destination=urlmap-glattthub.yaml --project=glattthub
# … pathRules um { paths: [/shared/*, /livewire/*, /build/*, /css/*, /js/*, /fonts/*, /images/*], service: backend-glattthub-{env}-public } ergänzen …
gcloud compute url-maps import urlmap-glattthub --global --source=urlmap-glattthub.yaml --project=glattthub
```

> **Kein zusätzlicher IAM-Invoker nötig:** Da Cloud Run mit `--allow-unauthenticated` läuft, reicht das Fehlen von IAP am Backend-Service — analog zu den bestehenden `-api`-Backends.

> **Bewusst NICHT ausgenommen:** `/invitation/{token}` bleibt hinter IAP, da Einladungslinks nur an interne Mitarbeitende mit `@labrado-schlueter.com`-Account verschickt werden.

**Rollback:** Falls die Bypass-Konfiguration Probleme macht:

```bash
# URL-Map auf Backup zurücksetzen (nur Host-Routing, kein Pfad-Routing)
gcloud compute url-maps import urlmap-glattthub \
    --global \
    --source=urlmap-glattthub-backup.yaml \
    --project=glattthub

# API Backend-Services löschen
gcloud compute backend-services delete backend-glattthub-prod-api --global --project=glattthub
gcloud compute backend-services delete backend-glattthub-staging-api --global --project=glattthub

# Public Backend-Services löschen (falls /shared/*-Bypass zurückgerollt werden soll)
gcloud compute backend-services delete backend-glattthub-prod-public --global --project=glattthub
gcloud compute backend-services delete backend-glattthub-staging-public --global --project=glattthub
```

#### Ersteinrichtung (Referenz)

Für den Fall, dass IAP auf einem neuen Backend-Service eingerichtet werden muss (z.B. bei einer dritten Umgebung):

```bash
# 1. APIs aktivieren (einmalig pro Projekt)
gcloud services enable iap.googleapis.com --project=glattthub
gcloud services enable cloudresourcemanager.googleapis.com --project=glattthub

# 2. IAP Service Account provisionieren (einmalig pro Projekt)
gcloud beta services identity create --service=iap.googleapis.com --project=glattthub

# 3. IAP auf Backend-Service aktivieren
gcloud iap web enable \
    --resource-type=backend-services \
    --service=BACKEND-SERVICE-NAME \
    --project=glattthub

# 4. IAP Service Account als Cloud Run Invoker berechtigen
gcloud run services add-iam-policy-binding CLOUD-RUN-SERVICE-NAME \
    --region=europe-west3 \
    --member="serviceAccount:service-99200336070@gcp-sa-iap.iam.gserviceaccount.com" \
    --role="roles/run.invoker" \
    --project=glattthub

# 5. Nutzer/Domain berechtigen
gcloud iap web add-iam-policy-binding \
    --resource-type=backend-services \
    --service=BACKEND-SERVICE-NAME \
    --member="domain:labrado-schlueter.com" \
    --role="roles/iap.httpsResourceAccessor" \
    --project=glattthub
```

> **Hinweis:** Nach Aktivierung dauert es bis zu 5 Minuten, bis IAP auf dem Backend greift. In dieser Zeit kann ein 502-Fehler auftreten — das ist normal.

### Troubleshooting

**Custom Domain nicht erreichbar:**

- DNS prüfen: `dig hub.glattt.com @8.8.8.8 +short` (muss `34.49.25.78` zeigen)
- SSL-Status prüfen (muss `ACTIVE` sein, nicht `PROVISIONING` oder `FAILED_NOT_VISIBLE`)
- `FAILED_NOT_VISIBLE` ist oft temporär — Google versucht es automatisch alle paar Minuten erneut
- Falls SSL dauerhaft fehlschlägt: Zertifikat löschen und neu erstellen
- Pro Domain ein separates Zertifikat verwenden (kein Combined-Cert)

**IAP blockiert Zugriff ("You don't have access"):**

- IAM-Berechtigung prüfen: `gcloud iap web get-iam-policy --resource-type=backend-services --service=backend-glattthub-prod --project=glattthub`
- Nutzer muss die Rolle `roles/iap.httpsResourceAccessor` haben
- Google Account muss zur korrekten Domain gehören (oder einzeln freigegeben sein)
- Bei `domain:`-Binding: Nutzer zusätzlich explizit als `user:` hinzufügen falls Domain-Binding nicht greift
- Cache/Cookies löschen und im Inkognito-Fenster testen

**IAP Service Account Fehler ("IAP service account is not provisioned"):**

```bash
# Service Account provisionieren
gcloud beta services identity create --service=iap.googleapis.com --project=glattthub

# Invoker-Rolle auf Cloud Run setzen
gcloud run services add-iam-policy-binding SERVICENAME \
    --region=europe-west3 \
    --member="serviceAccount:service-99200336070@gcp-sa-iap.iam.gserviceaccount.com" \
    --role="roles/run.invoker" \
    --project=glattthub
```

**502 Bad Gateway nach IAP-Aktivierung:**

- Normal in den ersten 2-5 Minuten nach IAP-Aktivierung — abwarten
- Prüfen ob Cloud Run Service läuft: `gcloud run services describe SERVICENAME --region=europe-west3 --project=glattthub`
- Prüfen ob IAP Service Account `roles/run.invoker` hat

**Load Balancer Backend-Health:**

```bash
gcloud compute backend-services get-health backend-glattthub-prod --global
gcloud compute backend-services get-health backend-glattthub-staging --global
```

> **Hinweis:** Bei Serverless NEGs liefert `get-health` einen Fehler — das ist normal. Den Service-Status direkt über `gcloud run services describe` prüfen.
