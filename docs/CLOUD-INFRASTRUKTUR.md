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
| **Backend (Prod)** | `backend-glattthub-prod` | Backend-Service mit NEG |
| **Backend (Staging)** | `backend-glattthub-staging` | Backend-Service mit NEG |
| **URL Map** | `urlmap-glattthub` | Host-basiertes Routing |
| **HTTPS Proxy** | `proxy-glattthub` | Terminiert SSL |
| **HTTP Proxy** | `proxy-glattthub-http` | Redirect HTTP → HTTPS |
| **Forwarding Rule HTTPS** | `fwd-glattthub-https` | Port 443 → HTTPS Proxy |
| **Forwarding Rule HTTP** | `fwd-glattthub-http` | Port 80 → HTTP Proxy |

#### URL-Routing

```
hub.glattt.com            → backend-glattthub-prod    → glattthub-web
staging.hub.glattt.com    → backend-glattthub-staging → glattthub-web-staging
```

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

| Umgebung | Zugriff | IAM Member |
|----------|---------|------------|
| **Produktion** | Alle Google Workspace-Nutzer | `domain:labrado-schlueter.com` |
| **Staging** | Einzelne Nutzer | `user:jan@labrado-schlueter.com` |

**Wichtig:** IAP greift nur bei Zugriff über den Load Balancer (Custom Domains). Die alten `*.run.app`-URLs umgehen den Load Balancer und damit auch IAP.

#### Staging-Nutzer hinzufügen

```bash
gcloud iap web add-iam-policy-binding \
    --resource-type=backend-services \
    --service=backend-glattthub-staging \
    --member="user:EMAIL@labrado-schlueter.com" \
    --role="roles/iap.httpsResourceAccessor" \
    --project=glattthub
```

#### Weitere Domain für Produktion freigeben

```bash
gcloud iap web add-iam-policy-binding \
    --resource-type=backend-services \
    --service=backend-glattthub-prod \
    --member="domain:NEUE-DOMAIN.com" \
    --role="roles/iap.httpsResourceAccessor" \
    --project=glattthub
```

#### Staging-Nutzer entfernen

```bash
gcloud iap web remove-iam-policy-binding \
    --resource-type=backend-services \
    --service=backend-glattthub-staging \
    --member="user:EMAIL@labrado-schlueter.com" \
    --role="roles/iap.httpsResourceAccessor" \
    --project=glattthub
```

### Troubleshooting

**Custom Domain nicht erreichbar:**
- DNS prüfen: `dig hub.glattt.com @8.8.8.8 +short` (muss `34.49.25.78` zeigen)
- SSL-Status prüfen (muss `ACTIVE` sein, nicht `PROVISIONING` oder `FAILED_NOT_VISIBLE`)
- `FAILED_NOT_VISIBLE` ist oft temporär — Google versucht es automatisch alle paar Minuten erneut
- Falls SSL dauerhaft fehlschlägt: Zertifikat löschen und neu erstellen
- Pro Domain ein separates Zertifikat verwenden (kein Combined-Cert)

**IAP blockiert Zugriff:**
- IAM-Berechtigung prüfen: `gcloud iap web get-iam-policy --resource-type=backend-services --service=backend-glattthub-prod --project=glattthub`
- Nutzer muss die Rolle `roles/iap.httpsResourceAccessor` haben
- Google Account muss zur korrekten Domain gehören (oder einzeln freigegeben sein)
- Cache/Cookies löschen und neu anmelden

**Load Balancer Backend-Health:**

```bash
gcloud compute backend-services get-health backend-glattthub-prod --global
gcloud compute backend-services get-health backend-glattthub-staging --global
```
