# Klickanleitungen-Portal (hilfe.hub.glattt.com)

Das Portal ist die Anlaufstelle für Mitarbeiterinnen, die nochmal nachsehen wollen, wie etwas
im glatttHub geht: 87 Anleitungen in 14 Serien, Vorgang für Vorgang, mit Bildern aus dem echten
Hub und einer Suche, die Tippfehler und andere Beschreibungen verzeiht. Es lebt bewusst
**außerhalb des Hubs** (eigener Dienst, eigener Deploy), sieht aber aus wie der Hub und nutzt
dieselbe Anmeldung (Google IAP, Firmen-Konto). Entscheidung 18.09.2026, Option „A":
statische Seite hinter IAP plus Viewer plus Kontexthilfe im Hub.

## Für Endanwender

### Rein kommen

- Adresse: **https://hilfe.hub.glattt.com** — Anmeldung mit dem Firmen-Google-Konto, wie beim Hub.
- Aus dem Hub heraus:
  - **Buch-Symbol** im Seitenkopf (neben dem Fragezeichen) öffnet die Anleitung zur aktuellen Seite.
  - **Seitenleiste unten** (neben glatttBert und dem Theme-Umschalter): Buch-Symbol → Portal-Startseite.
  - **Globale Suche**: Unter den Treffern steht „Klickanleitung dazu suchen" — der Suchbegriff wandert mit.
  - **Handy**: Im Mehr-Menü der Eintrag „Anleitung" (Seite oder Startseite).

### Zurechtfinden

- **Startseite**: Suchfeld, Zielgruppen-Filter (Alle · Institut · Büro · Leitung · Admin, wird gemerkt) und alle Serien als Karten.
- **Seitenleiste links**: alle Serien, aufklappbar; auf dem Handy als Schublade über das Menü-Symbol.
- **Eine Anleitung** zeigt standardmäßig **einen Vorgang zur Zeit**: oben „Vorgang 2 von 5", Knöpfe *Zurück* / *Weiter*, Pfeiltasten ← → oder Wischen auf dem Handy. „Vorgänge in dieser Anleitung" springt direkt.
  „Alle Vorgänge untereinander" schaltet auf eine lange Seite um (wird gemerkt).
- **Schritt ↔ Bild**: Wer mit der Maus über Schritt 3 fährt, sieht Plakette 3 im Screenshot aufleuchten; ein Klick pinnt sie. Ein Klick auf eine Plakette springt zum Schritt.
- **Bild vergrößern**: Klick auf den Screenshot zeigt ihn bildschirmfüllend, Markierungen inklusive. Esc oder Klick schließt.
- **Als PDF**: jede Anleitung auch als A4-quer-PDF zum Drucken.
- **Hell/Dunkel** folgt dem System, lässt sich oben rechts umschalten.
- Adressen sind teilbar: `/vertraege/6/#v3` ist Verträge 6, Vorgang 3.

### Suchen

Suchfeld oben, **⌘K / Strg+K** oder **/** öffnet die Suche von jeder Seite aus. Treffer zeigen
Serie und Anleitung, den Vorgang und den passenden Schritt oder Hinweis; ↑ ↓ wählen, ↵ öffnet.

Die Suche findet auch:

| Eingabe | findet | warum |
|---|---|---|
| „Wiederuf", „Widerurf" | Widerruf erfassen | Tippfehler-Toleranz (1–2 Buchstaben je nach Wortlänge) |
| „Abo pausieren" | Ratenzahlung pausieren, SEPA pausieren | Synonym-Gruppen (Abo = Vertrag = Paket) |
| „Ratenplan" | Raten anpassen, Den Ratenplan lesen | Zerlegung zusammengesetzter Wörter |
| „vertrage" | Verträge | Umlaute werden gefaltet |
| „Betrag einziehen" | der Schritt mit dem Knopf „Betrag einziehen" | Beschriftungen in „…" sind hoch gewichtet |
| „Kundin will nicht mehr zahlen" | Widerrufsgründe, Zahlungsstand im Vertrag | Bedeutungssuche (Embeddings) |

Treffer, die nur die Bedeutungssuche gefunden hat, tragen die Marke „ähnliches Thema".

## Für Entwickler

### Bausteine

```
glattthub-wiki/klickanleitungen/
├── shared/build-web.cjs          Decks → Portal-Seiten (Viewer), WebP-Screenshots, manifest.json
├── shared/build-search.cjs       manifest.json → search/docs.json + vektoren.bin (Vertex AI)
├── shared/synonyme.json          Synonym-Gruppen der Suche — hier ergänzen, nächster Build übernimmt
├── shared/assets/portal.css      Gestaltung im Hub-Look (Token aus theme_glattt.css gespiegelt)
├── shared/assets/portal.js       Stepper, Schritt↔Markierung, Lightbox, Filter, Theme
├── shared/assets/suche.js        Suche im Browser (MiniSearch + Synonyme + Bedeutung, RRF-Mischung)
├── shared/assets/suche-kern.js   Wort-Faltung, Stoppwörter, Komposita-Zerlegung — Browser UND Node
├── portal/build.sh               web | search | pdf | all — lokal und in Cloud Build derselbe Weg
├── portal/server.js              Node-Server: statisch aus dist/, POST /api/embed, /healthz
├── portal/vertex.cjs             Embeddings über Vertex AI (Dienstkonto, kein Schlüssel) — Build UND Server
├── portal/Dockerfile             node:20-alpine, nur server.js + dist/
├── portal/cloudbuild.yaml        Bucket-Sync → Build → Image → Cloud Run
└── portal/dist/                  Build-Ausgabe (gitignored)
```

Adressen folgen der Benennung „Serie + Nummer": `/grundlagen/6/` ist „Grundlagen 6". Der Hub
leitet daraus seine Verweise ab (`App\Services\Onboarding\KlickanleitungLinks`, Quelle
`.github/klickanleitungen-abdeckung.json`) — kein zweiter Katalog.

### Lokal bauen und ansehen

```bash
cd glattthub-wiki/klickanleitungen
npm install                                   # sharp, minisearch, playwright
bash portal/build.sh web                      # Seiten + WebP nach portal/dist
bash portal/build.sh search                   # Suchindex; Embeddings über Vertex AI mit deinem gcloud-ADC-Login
PORTAL_EMBEDDINGS=0 bash portal/build.sh search   # … oder ohne Bedeutungssuche (kein gcloud nötig)
bash portal/build.sh pdf                      # PDFs (braucht Chromium via Playwright)
PORT=8791 node portal/server.js               # http://localhost:8791
```

Im Hub lokal: `KLICKANLEITUNGEN_URL=http://localhost:8791` in `.env`, dann zeigen Buch-Symbol,
Seitenleiste und Suche dorthin. Leer lassen = keine Verweise.

### Suche — wie sie arbeitet

1. **Wörter** (MiniSearch, im Browser aus `search/docs.json` gebaut, ~2.700 Einträge: Anleitung,
   Vorgang, Schritt, Hinweis, Tabellenzeile, Abschnitt). Präfix ab 3 Zeichen, Fuzzy 1 (4–6 Zeichen)
   bzw. 2 (länger), Feld-Gewichte `ui` 4 · `titel` 3 · `seite` 2 · `anleitung` 1,5 · `text` 1.
   Anfrage-Wörter werden UND-verknüpft; ohne Treffer noch einmal ODER (dann zählen die Treffer
   nur 0,55 gegen die Bedeutungssuche).
2. **Vorverarbeitung** in `suche-kern.js`, identisch beim Indizieren und Suchen: Kleinschreibung,
   ä→a/ö→o/ü→u/ß→ss, Stoppwörter raus, Komposita anhand des Wortschatzes (Wörter ≥ 4 Zeichen,
   die ≥ 2× vorkommen, plus alle Synonyme) zerlegen — beim Indizieren als Zusatz-Terme, bei der
   Anfrage als ODER-Alternativen.
3. **Synonyme** (`shared/synonyme.json`): jedes Anfrage-Wort wird um seine Gruppe erweitert,
   Zwei-Wort-Begriffe („nicht erschienen") werden vorher erkannt.
4. **Bedeutung**: `build-search.cjs` bettet jeden Eintrag über **Vertex AI**
   (`gemini-embedding-001`, Region europe-west3, 256 Dimensionen, Int8-quantisiert → 690 KB) ein,
   Aufgabe `RETRIEVAL_DOCUMENT`. Die Anfrage bettet `server.js` über `POST /api/embed` ein
   (`RETRIEVAL_QUERY`, 90 Anfragen/Minute je Client, Cache). Anmeldung läuft über das Dienstkonto
   der Umgebung (Metadaten-Server in Cloud Run/Cloud Build, lokal gcloud-ADC) — **kein API-Schlüssel,
   kein Secret**. Entscheidung 18.09.2026: Anthropic bietet keine Embeddings, Vertex bleibt im
   GCP-Projekt. Der Browser rechnet den Kosinus über alle Vektoren (Schwelle 0,3) und mischt beide
   Listen per Reciprocal Rank Fusion; je Vorgang bleibt nur der beste Eintrag.

Wurde der Index ohne Vektoren gebaut (`PORTAL_EMBEDDINGS=0`), antwortet der Server auf
`/api/embed` mit 503 und das Portal schaltet die Bedeutungssuche still ab.

### Infrastruktur

| Baustein | Name |
|---|---|
| Host | `hilfe.hub.glattt.com` → `34.49.25.78` (A-Record bei All-Inkl, wie `hub`) |
| Cloud Run | `glattthub-hilfe`, europe-west3, **kein** öffentlicher Zugang, Ingress `internal-and-cloud-load-balancing` |
| Load Balancer | NEG `neg-glattthub-hilfe`, Backend `backend-glattthub-hilfe` (IAP an), Host-Regel im `urlmap-glattthub` → `hilfe-matcher` |
| Zertifikat | `cert-glattthub-hilfe` (Google-managed), am `proxy-glattthub` neben Prod und Staging |
| IAP | `domain:labrado-schlueter.com` als `iap.httpsResourceAccessor`; IAP-Service-Agent hat `run.invoker` |
| Screenshots | Bucket `gs://glattthub-klickanleitungen/<serie>/shots/` (Repo ist öffentlich, Bilder nicht darin) |
| Embeddings | Vertex AI `gemini-embedding-001` in europe-west3; Compute-Dienstkonto (Build und Cloud Run) braucht `aiplatform.endpoints.predict` (in `roles/editor` enthalten) — kein Secret |
| Build | `klickanleitungen/portal/cloudbuild.yaml`; Trigger `deploy-hilfe` (Region europe-west3) auf `main` des Wiki-Repos, nur bei Änderungen unter `klickanleitungen/`; läuft über die Cloud-Build-Verbindung `glattthub-github` (2. Generation, GitHub-App von Jan am 18.09.2026 freigegeben) |

Manuell bauen und deployen (aus dem Wiki-Repo):

```bash
gcloud builds submit --config klickanleitungen/portal/cloudbuild.yaml \
  --substitutions SHORT_SHA=$(git rev-parse --short HEAD) .
```

Screenshots nach einem Aufnahmelauf hochladen (die `shots/`-Ordner sind gitignored):

```bash
cd klickanleitungen
for s in */; do s=${s%/}; [ -d "$s/shots" ] && gcloud storage rsync -r "$s/shots" "gs://glattthub-klickanleitungen/$s/shots"; done
```

### Hub-Seite

- `config/services.php` → `klickanleitungen.url` (`KLICKANLEITUNGEN_URL`).
- `App\Services\Onboarding\KlickanleitungLinks`: `forRoute()`, `firstForRoute()`, `searchUrl()`, `urlFor('Verträge 3')` → `/vertraege/3/`.
- `<x-tour-help />` rendert zusätzlich das Buch-Symbol; `layouts/hub.blade.php` gibt `data-anleitung-url`
  an den Scroll-Header, das Mehr-Sheet liest es beim Öffnen (wie `data-tour-key`).
- Seitenleiste: `.sidebar-help-link`; globale Suche: `.global-search-anleitung`.
- Tests: `tests/Unit/KlickanleitungLinksTest.php`.

### Pflege

- Neue Anleitung = Deck im Wiki-Repo + Zeile in der Abdeckungsliste des Hubs. Nach dem Push auf
  `main` baut Cloud Build das Portal neu; der Hub-Verweis entsteht ohne Code.
- Neue Synonyme in `shared/synonyme.json`; Beispiele der Startsuche in `suche.js` (`VORSCHLAEGE`).
- Portal-Optik: `portal.css` spiegelt die Hub-Token; ändert sich `theme_glattt.css` an den Farben,
  hier nachziehen.
