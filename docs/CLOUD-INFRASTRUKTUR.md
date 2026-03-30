# Cloud-Infrastruktur & Konfiguration

Dokumentation der Google Cloud-Infrastruktur für GlattHub: Custom Domains, Load Balancer, SSL-Zertifikate, DNS und Zugangsschutz (IAP).

---

## Für Endanwender

### URLs

| Umgebung | URL |
|----------|-----|
| **Produktion** | `https://hub.glattt.com` |
| **Staging** | `https://staging.hub.glattt.com` |

### Zugangsschutz

Beide Umgebungen sind durch **Google Identity-Aware Proxy (IAP)** geschützt. Beim Aufruf der URL erscheint zuerst eine Google-Anmeldung:

- **Produktion**: Alle Nutzer mit einer `@labrado-schlueter.com` Google Workspace-Adresse
- **Staging**: Nur individuell freigegebene Nutzer

Die Google-Anmeldung erfolgt einmalig pro Session — danach erscheint das normale GlattHub-Login wie gewohnt.

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
| **URL Map** | `urlmap-glattthub` | Host- und Pfad-basiertes Routing |
| **HTTPS Proxy** | `proxy-glattthub` | Terminiert SSL |
| **HTTP Proxy** | `proxy-glattthub-http` | Redirect HTTP → HTTPS |
| **Forwarding Rule HTTPS** | `fwd-glattthub-https` | Port 443 → HTTPS Proxy |
| **Forwarding Rule HTTP** | `fwd-glattthub-http` | Port 80 → HTTP Proxy |

#### URL-Routing

Der URL-Map kombiniert Host- und Pfad-basiertes Routing. API-Pfade (`/api/*`) werden an Backend-Services **ohne IAP** geleitet, damit externe API-Clients mit Bearer Token zugreifen können.

```
hub.glattt.com/api/*           → backend-glattthub-prod-api    → glattthub-web       (ohne IAP)
hub.glattt.com/*               → backend-glattthub-prod        → glattthub-web       (mit IAP)
staging.hub.glattt.com/api/*   → backend-glattthub-staging-api → glattthub-web-staging (ohne IAP)
staging.hub.glattt.com/*       → backend-glattthub-staging     → glattthub-web-staging (mit IAP)
```

> **Wichtig:** Die API-Endpoints sind trotzdem geschützt — durch die eigene Bearer-Token-Authentifizierung in Laravel (`ApiTokenMiddleware`). IAP ist nur für Browser-Sessions der Web-App relevant.

### SSL-Zertifikate

Google-managed SSL-Zertifikate werden automatisch erstellt und erneuert. Pro Domain ein **separates** Zertifikat (nicht combined, da das zu Blockierungen führen kann).

| Zertifikat | Domain |
|------------|--------|
| `cert-glattthub-prod` | `hub.glattt.com` |
| `cert-glattthub-staging` | `staging.hub.glattt.com` |

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

**Wichtig:** IAP greift nur bei Zugriff über den Load Balancer (Custom Domains). Die `*.run.app`-URLs umgehen den Load Balancer und damit auch IAP.

**Ausnahme:** API-Pfade (`/api/*`) sind vom IAP ausgenommen — sie werden über separate Backend-Services ohne IAP geroutet. Details siehe [API-Pfade vom IAP ausschließen](#api-pfade-vom-iap-ausschlieen).

#### Voraussetzungen (bereits eingerichtet)

Folgende APIs und Komponenten müssen aktiv sein, damit IAP funktioniert:

| Komponente | Status | Details |
|------------|--------|---------|
| **IAP API** | ✅ Aktiv | `gcloud services enable iap.googleapis.com` |
| **Cloud Resource Manager API** | ✅ Aktiv | `gcloud services enable cloudresourcemanager.googleapis.com` |
| **OAuth Consent Screen** | ✅ Intern | App: `Anmeldung_glatttHub`, nur Google Workspace-Nutzer |
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

#### API-Pfade vom IAP ausschließen

Damit die REST-API (`/api/*`) ohne Google-Anmeldung per Bearer Token erreichbar ist, existieren separate Backend-Services ohne IAP. Diese zeigen auf die **gleichen** Cloud Run Services, haben aber kein IAP aktiviert.

**Architektur:**

| Pfad | Backend-Service | IAP | Auth |
|------|-----------------|-----|------|
| `/api/*` | `backend-glattthub-{env}-api` | ❌ Aus | Bearer Token (Laravel) |
| `/*` (alles andere) | `backend-glattthub-{env}` | ✅ An | Google-Anmeldung + Laravel Session |

**Setup-Script:** Die vollständigen Befehle zur Einrichtung liegen in `scripts/iap-api-bypass-setup.sh` im Projekt-Repository.

**Rollback:** Falls die API-Bypass-Konfiguration Probleme macht:

```bash
# URL-Map auf Backup zurücksetzen (nur Host-Routing, kein Pfad-Routing)
gcloud compute url-maps import urlmap-glattthub \
    --global \
    --source=urlmap-glattthub-backup.yaml \
    --project=glattthub

# API Backend-Services löschen
gcloud compute backend-services delete backend-glattthub-prod-api --global --project=glattthub
gcloud compute backend-services delete backend-glattthub-staging-api --global --project=glattthub
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
