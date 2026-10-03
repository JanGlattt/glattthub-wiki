# Echtzeit mit Laravel Reverb

Stand: 03.10.2026 — Code auf `develop`, Cloud-Einrichtung durch Jan ausstehend (Anleitung unten).
Genutzt vom begleiteten Beratungsgespräch und seit 03.10.2026 von **allen Bildschirmen**
(Änderungen, Befehle, Live-Überwachung, Bildschirmfoto — Wiki [Bildschirme](SCREENS-MODULE.md),
Abschnitt „Echtzeit und Bildschirmfoto“).

## Für Endanwender

Beim begleiteten Beratungsgespräch folgt der Fernseher im Raum der Beraterin ohne spürbare
Verzögerung: Tippt sie auf „Weiter“, wechselt die Folie am Fernseher sofort. Ohne Echtzeit
fragen Fernseher und Presenter jede Sekunde nach, das funktioniert weiterhin als Rückfallebene,
ist aber träger und erzeugt ständige Last.

Bei den Bildschirmen in den Instituten kommen gespeicherte Änderungen und Befehle („Neu laden“,
„Bildschirmfoto“ …) nach wenigen Sekunden an, und die Seite „Bildschirme“ zeigt sofort, ob ein
Fernseher verbunden ist und was er gerade zeigt.

## Für Entwickler

### Prinzip: Anstoß statt Daten

- Über den Socket gehen **keine Daten**, nur ein Anstoß: Event `guided.changed` mit
  `{"rev": <int>, "uuid": "<uuid>|null"}`. Clients holen den Stand danach über die bestehenden
  Endpunkte (Presenter `/state`, Fernseher `GET /api/tv/consultation`). Damit bleibt der Hub die
  einzige Wahrheit, und die Rechteprüfung passiert dort, wo sie schon immer war.
- Der Hub sendet nach jedem Befehl, Start und Ende über
  `App\Events\GuidedConsultationChanged::dispatchFor($session)` (`ShouldBroadcastNow`, ohne
  Queue). Fehler beim Senden werden nur geloggt (`Echtzeit-Anstoß … fehlgeschlagen`) — ein
  Ausfall von Reverb lässt nie einen Befehl scheitern. Das HTTP-Zeitlimit beim Veröffentlichen ist
  bewusst knapp (`REVERB_PUBLISH_TIMEOUT`, Standard 3 s).
- **Rückfallebene:** ohne Verbindung fragen die Clients wie bisher jede Sekunde ab, mit
  Verbindung nur noch alle 10 s als Sicherheitsnetz.

### Kanäle und Anmeldung (Pusher-Protokoll)

| Kanal | Wer | Anmeldung |
|---|---|---|
| `private-guided.{uuid}` | Presenter (Beraterin) | `POST /broadcasting/auth` über die Web-Sitzung (Laravel-Standard, `withBroadcasting()` in `bootstrap/app.php`); Recht `run_guided_consultation` **und** Standort der Sitzung in `allowed_branch_ids` (leer = alle), Callback in `routes/channels.php` |
| `private-screen.{screenId}` | Apple TV / Browser-Fernseher | `POST /api/tv/broadcasting/auth` mit `X-Hub-Device` (Middleware `screen.device`, Bremse `tv-live`), `TvBroadcastAuthController` signiert **nur** den eigenen Kanal (sonst 403, ohne Reverb 503). Ereignisse: `guided.changed` und seit 03.10.2026 `screen.changed` `{reason}` |
| `private-screens.monitor` | Hub-Seite „Bildschirme“ | `POST /broadcasting/auth` über die Web-Sitzung, Recht `manage_screens_hub`. Ereignis `screens.changed` `{screen_ids, reason}` — auch direkt aus dem Reverb-Prozess (Verbindung auf/zu) |

Antwort beider Anmeldungen: `{"auth": "<key>:<hmac_sha256("socket_id:channel_name", secret)>"}`.
`screen.{id}` ist in `routes/channels.php` bewusst **nicht** registriert — über eine Web-Sitzung
bekommt man ihn nicht.

### Verbindungsdaten für Clients

`App\Support\LiveConfig::forClient()` liefert `{enabled, key, host, port, scheme}` oder `null`
(= Echtzeit aus). Clients hartkodieren nichts.

- Apple TV: Feld `live` in `GET /api/tv/consultation`, im Heartbeat-Block `consultation` und seit 03.10.2026 auf oberster Ebene der Heartbeat-Antwort (alle Bildschirme).
- Web: Blade setzt `window.GlatttLiveConfig`; `public/js/guided-live.js` stellt
  `GlatttLive.watch({channel, authEndpoint, headers, onChange, onStatus})` bereit (liefert eine
  Abmelde-Funktion; Status `live` | `connecting` | `off`). pusher-js kommt per CDN
  (`https://cdn.jsdelivr.net/npm/pusher-js@8.4.0/dist/web/pusher.min.js`); fehlt es oder die
  Konfiguration, meldet `watch` sofort `off`.
  Mit `event` lässt sich ein anderes Ereignis abonnieren (Hub-Seite „Bildschirme“:
  `event: 'screens.changed'`).

### Konfiguration

`config/broadcasting.php` wählt `reverb` **nur, wenn `REVERB_APP_KEY` gesetzt ist** — sonst `log`
(auch ein `BROADCAST_CONNECTION=reverb` ohne Schlüssel fällt auf `log`). Tests laufen mit
`BROADCAST_CONNECTION=null` (`phpunit.xml`).

| Variable | Bedeutung | Staging | Prod |
|---|---|---|---|
| `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` | App-Zugang (Secret Manager) | `reverb-app-*-staging` | `reverb-app-*` |
| `BROADCAST_CONNECTION` | am Web/Worker steht heute `log` — muss auf `reverb` | `reverb` | `reverb` |
| `REVERB_HOST` / `REVERB_PORT` / `REVERB_SCHEME` | Weg, über den der Hub **veröffentlicht** | `live.staging.hub.glattt.com` / `443` / `https` | `live.hub.glattt.com` / `443` / `https` |
| `REVERB_CLIENT_HOST` / `_PORT` / `_SCHEME` | was Browser und Apple TV bekommen | wie oben | wie oben |
| `REVERB_PUBLISH_TIMEOUT` | Zeitlimit beim Veröffentlichen (s) | `3` | `3` |
| `REVERB_ALLOWED_ORIGINS` | optional, Komma-Liste; Standard `*` (Kanäle sind ohnehin privat) | — | — |

!!! warning "Veröffentlichen über den Load Balancer, nicht über run.app"
    Der Reverb-Dienst hat Ingress `internal-and-cloud-load-balancing`. Anfragen eines anderen
    Cloud-Run-Dienstes an dessen `run.app`-Adresse zählen nur als „intern“, wenn sie über ein
    VPC gehen — Web und Worker haben keinen VPC-Ausgang. Deshalb veröffentlicht der Hub über
    `live.(staging.)hub.glattt.com`: Die HTTP-API von Reverb (`/apps/{id}/events`) ist mit dem
    App-Secret signiert, IAP braucht es davor nicht.

### Der Dienst

- Cloud Run `glattthub-reverb` (Prod) / `glattthub-reverb-staging`, **dasselbe Image** wie der Hub,
  Entrypoint `/entrypoint-reverb.sh` (`php artisan reverb:start --host=0.0.0.0 --port=$PORT`, ohne
  Migrationen).
- Ein Knoten: `min-instances=1`, `max-instances=1` — kein Redis-Scaling nötig. `--concurrency 1000`,
  `--timeout 3600` (längste WebSocket-Dauer; pusher-js verbindet danach selbst neu),
  `--no-cpu-throttling` (Ping-Timer laufen auch zwischen Anfragen), Cloud SQL angebunden (Reverb
  prüft über den Cache-Store `database` auf `reverb:restart`).
- `cloudbuild(-staging).yaml` deployt ihn **nur, wenn er existiert** (wie der Worker) und lässt den
  Build bei einem Fehler nicht scheitern. Solange niemand ihn anlegt, ändert sich am Deploy nichts.
- Beim Deploy laufen kurz alte und neue Revision parallel; bis die alten Verbindungen neu
  verbinden, greift die 10-s-Abfrage.
- Am Load Balancer: eigene Serverless-NEG + Backend-Service **ohne IAP**. Für Serverless-NEGs
  lässt sich am Backend-Service kein Zeitlimit setzen — für WebSockets gilt das
  Cloud-Run-Zeitlimit (3600 s).

### Einrichtung (Jan, einmalig) — erst Staging, dann Prod

!!! tip "Kurzweg: `scripts/reverb-setup.sh` im Hub-Repo (seit 03.10.2026)"
    Fasst die Schritte 1–6 zusammen und ist wiederholbar (vorhandene Secrets, NEG, Backend,
    Host-Regel und Zertifikat werden übersprungen): `bash scripts/reverb-setup.sh staging setup`,
    nach dem DNS-Eintrag `… staging check` bis `101 Switching Protocols`, dann
    `… staging activate`; danach dasselbe mit `prod`.

Voraussetzung: Dieser Stand ist auf `develop` deployt (das Image enthält `/entrypoint-reverb.sh`).
Befehle mit Jans eigenem Konto (das Dienstkonto `claude-automation` darf weder Secrets noch IAM
noch Load Balancer anlegen). Für Prod `ENV=prod` setzen — die Namen stehen in der Tabelle darunter.

```bash
P=glattthub; R=europe-west3
ENV=staging   # oder: prod
if [ "$ENV" = staging ]; then
  WEB=glattthub-web-staging; WORKER=glattthub-worker-staging; SVC=glattthub-reverb-staging
  HOST=live.staging.hub.glattt.com; SFX=-staging
  NEG=neg-glattthub-staging-reverb; BE=backend-glattthub-staging-reverb; CERT=cert-glattthub-staging-live
else
  WEB=glattthub-web; WORKER=glattthub-worker; SVC=glattthub-reverb
  HOST=live.hub.glattt.com; SFX=
  NEG=neg-glattthub-prod-reverb; BE=backend-glattthub-prod-reverb; CERT=cert-glattthub-prod-live
fi
RUN_SA=99200336070-compute@developer.gserviceaccount.com
```

**1. Secrets anlegen** (Zufallswerte; ID numerisch):

```bash
printf '%s' "$(( (RANDOM << 15 | RANDOM) % 900000 + 100000 ))" | gcloud secrets create reverb-app-id$SFX     --project $P --data-file=-
printf '%s' "$(openssl rand -hex 16)"                            | gcloud secrets create reverb-app-key$SFX    --project $P --data-file=-
printf '%s' "$(openssl rand -hex 32)"                            | gcloud secrets create reverb-app-secret$SFX --project $P --data-file=-
for S in reverb-app-id$SFX reverb-app-key$SFX reverb-app-secret$SFX; do
  gcloud secrets add-iam-policy-binding $S --project $P \
    --member="serviceAccount:$RUN_SA" --role=roles/secretmanager.secretAccessor
done
```

**2. DNS bei All-Inkl (KAS-Panel)** — zuerst, sonst wird das Zertifikat nie `ACTIVE`:

| Name | Typ | Wert |
|---|---|---|
| `live.staging.hub` | A | `34.49.25.78` |
| `live.hub` | A | `34.49.25.78` |

**3. Reverb-Dienst anlegen** (Env vom Web-Dienst übernehmen, dazu die Reverb-Secrets):

```bash
IMAGE=$(gcloud run services describe $WEB --region $R --project $P --format='value(spec.template.spec.containers[0].image)')
gcloud run services describe $WEB --region $R --project $P --format=json | python3 -c '
import json, sys
env = json.load(sys.stdin)["spec"]["template"]["spec"]["containers"][0].get("env", [])
for e in env:
    if "value" in e and not e["name"].startswith(("BUILD_", "REVERB_")) and e["name"] != "BROADCAST_CONNECTION":
        print(e["name"] + ": " + json.dumps(e["value"]))
' > /tmp/reverb-env.yaml
cat >> /tmp/reverb-env.yaml <<EOF
BROADCAST_CONNECTION: "reverb"
REVERB_HOST: "$HOST"
REVERB_PORT: "443"
REVERB_SCHEME: "https"
EOF

gcloud run deploy $SVC --image "$IMAGE" --region $R --project $P --platform managed \
  --command /entrypoint-reverb.sh \
  --allow-unauthenticated --ingress internal-and-cloud-load-balancing \
  --no-cpu-throttling --add-cloudsql-instances glattthub:europe-west3:glattthub \
  --memory 512Mi --cpu 1 --concurrency 1000 --timeout 3600 \
  --min-instances=1 --max-instances=1 \
  --env-vars-file /tmp/reverb-env.yaml \
  --set-secrets "REVERB_APP_ID=reverb-app-id$SFX:latest,REVERB_APP_KEY=reverb-app-key$SFX:latest,REVERB_APP_SECRET=reverb-app-secret$SFX:latest"
rm /tmp/reverb-env.yaml
```

**4. Load Balancer:** Serverless-NEG, Backend-Service ohne IAP, Host-Regel, Zertifikat.

```bash
gcloud compute network-endpoint-groups create $NEG --project $P --region $R \
  --network-endpoint-type=serverless --cloud-run-service=$SVC

gcloud compute backend-services create $BE --project $P --global \
  --load-balancing-scheme=EXTERNAL_MANAGED --protocol=HTTP
gcloud compute backend-services add-backend $BE --project $P --global \
  --network-endpoint-group=$NEG --network-endpoint-group-region=$R
# Kein `gcloud iap web enable` — Schutz sind die signierten privaten Kanäle.

gcloud compute url-maps add-path-matcher urlmap-glattthub --project $P --global \
  --path-matcher-name=live-$ENV-matcher --default-service=$BE --new-hosts=$HOST

gcloud compute ssl-certificates create $CERT --project $P --global --domains=$HOST
CERTS=$(gcloud compute target-https-proxies describe proxy-glattthub --project $P --global \
  --format='value(sslCertificates.map().basename())' | tr ';' ',')
echo "Bisher: $CERTS"   # prüfen: alle bestehenden Zertifikate müssen drinstehen
gcloud compute target-https-proxies update proxy-glattthub --project $P --global \
  --ssl-certificates="$CERTS,$CERT"

# Warten bis ACTIVE (meist 15–60 min nach dem DNS-Eintrag)
gcloud compute ssl-certificates describe $CERT --project $P --global --format='value(managed.status)'
```

**5. Prüfen, ob der Socket antwortet** (erwartet: `HTTP/1.1 101 Switching Protocols`):

```bash
KEY=$(gcloud secrets versions access latest --secret=reverb-app-key$SFX --project $P)
curl -si --http1.1 -N --max-time 5 \
  -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: $(openssl rand -base64 16)" \
  "https://$HOST/app/$KEY?protocol=7" | head -1
```

**6. Erst jetzt Web und Worker einschalten** (vorher liefe jeder Befehl in das Zeitlimit):

```bash
for S in $WEB $WORKER; do
  gcloud run services update $S --region $R --project $P \
    --update-secrets "REVERB_APP_ID=reverb-app-id$SFX:latest,REVERB_APP_KEY=reverb-app-key$SFX:latest,REVERB_APP_SECRET=reverb-app-secret$SFX:latest" \
    --update-env-vars "BROADCAST_CONNECTION=reverb,REVERB_HOST=$HOST,REVERB_PORT=443,REVERB_SCHEME=https,REVERB_CLIENT_HOST=$HOST,REVERB_CLIENT_PORT=443,REVERB_CLIENT_SCHEME=https"
done
```

Die Werte bleiben über künftige Deploys erhalten (Cloud Build setzt nur `--update-env-vars`).
Ab jetzt aktualisiert jeder Push auch den Reverb-Dienst.

| | Staging | Prod |
|---|---|---|
| Cloud Run | `glattthub-reverb-staging` | `glattthub-reverb` |
| Secrets | `reverb-app-id-staging`, `reverb-app-key-staging`, `reverb-app-secret-staging` | `reverb-app-id`, `reverb-app-key`, `reverb-app-secret` |
| Host | `live.staging.hub.glattt.com` | `live.hub.glattt.com` |
| Serverless-NEG | `neg-glattthub-staging-reverb` | `neg-glattthub-prod-reverb` |
| Backend-Service | `backend-glattthub-staging-reverb` (IAP aus) | `backend-glattthub-prod-reverb` (IAP aus) |
| Path-Matcher in `urlmap-glattthub` | `live-staging-matcher` | `live-prod-matcher` |
| Zertifikat (an `proxy-glattthub`) | `cert-glattthub-staging-live` | `cert-glattthub-prod-live` |

### Abschalten / Rollback

`BROADCAST_CONNECTION=log` an Web und Worker setzen (oder die `REVERB_*`-Secrets entfernen) —
`LiveConfig` liefert dann `null`, alle Clients fragen wieder im Sekundentakt. Der Reverb-Dienst
kann weiterlaufen oder gelöscht werden (`gcloud run services delete $SVC`); der Build überspringt
ihn danach wieder.

### Lokal

```bash
php artisan reverb:start   # Port 8080
```

In `.env`: `REVERB_APP_ID/KEY/SECRET` beliebig, `REVERB_HOST=localhost`, `REVERB_PORT=8080`,
`REVERB_SCHEME=http`, `REVERB_CLIENT_HOST=localhost`, `REVERB_CLIENT_PORT=8080`,
`REVERB_CLIENT_SCHEME=http` und die Zeile `BROADCAST_CONNECTION=log` entfernen (oder auf
`reverb` stellen).

### Relevante Dateien

- `app/Events/GuidedConsultationChanged.php` — Anstoß, Kanäle, `dispatchFor()`
- `app/Events/ScreenChanged.php`, `app/Events/ScreensMonitorChanged.php`, `app/Services/Screens/ScreenLive.php`,
  `app/Observers/ScreenLiveObserver.php` — Bildschirme (gebündelt per `defer()`)
- `app/Listeners/TrackScreenLiveConnection.php` — läuft im Reverb-Prozess (Verbindungsstatus)
- `routes/channels.php` — Anmeldung `guided.{uuid}`
- `app/Http/Controllers/Tv/TvBroadcastAuthController.php`, `routes/tv.php` — Anmeldung des Fernsehers
- `app/Support/LiveConfig.php` — Verbindungsdaten für Clients
- `public/js/guided-live.js` — Web-Client (`GlatttLive.watch`)
- `config/broadcasting.php`, `config/reverb.php`, `bootstrap/app.php` (`withBroadcasting`)
- `Dockerfile` (`/entrypoint-reverb.sh`), `cloudbuild.yaml`, `cloudbuild-staging.yaml`
- `tests/Feature/GuidedConsultationRealtimeTest.php`

Verwandt: [Cloud-Infrastruktur](CLOUD-INFRASTRUKTUR.md) · [Queue-Worker](QUEUE-WORKER.md)

## Changelog

- 03.10.2026 — Bildschirme nutzen den Dienst mit: `screen.changed`, Kanal `private-screens.monitor`,
  Verbindungsstatus aus dem Reverb-Prozess. Einrichtungsskript wie unten (Schritte unverändert).

- 30.09.2026 — Reverb für das begleitete Beratungsgespräch (Etappe 2): Anstoß-Event, Kanal-Anmeldung
  Web und Apple TV, `LiveConfig`, Web-Client, bedingter Deploy-Step, Einrichtungsanleitung.
